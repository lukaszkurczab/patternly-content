import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

import { CANDIDATE_PATH, RELEASE_PATH } from "./candidate-readiness-v2.mjs";
import { CANDIDATE_TRACK_IDS, canonicalJson, canonicalJsonBytes, candidateIdFor } from "./candidate-manifest.mjs";

const ROOT = path.resolve(fileURLToPath(new URL("../../", import.meta.url)));
const exec = promisify(execFile);
export const ADMISSION_PATH = "evidence/admissions/candidate-admission-v3.json";
export const APP_LOCK_PATH = "integration/contracts/content-release/release.lock.json";
export const APP_CONTENT_LOCK_PATH = "src/content/generated/canonical-content/content-lock.json";
export const RUNTIME_TEST_PATH = "src/domain/tracks/runtimeAdmissionLaunchTracks.test.ts";
const HASH = /^[a-f0-9]{64}$/u;
const COMMIT = /^[a-f0-9]{40}$/u;
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

async function json(root, relativePath) { return JSON.parse(await readFile(path.join(root, relativePath), "utf8")); }

function assertExactTrackBindings(candidate, release, appLock, contentLock) {
  const ids = release.artifacts.map((item) => item.trackId);
  if (canonicalJson(ids) !== canonicalJson(CANDIDATE_TRACK_IDS)) throw new Error("Candidate release does not contain the exact nine canonical tracks.");
  if (appLock.schemaVersion !== 3 || appLock.candidateId !== candidate.candidateId || appLock.releaseManifestSha256 !== sha256(canonicalJsonBytes(release))) throw new Error("Application release lock is stale for the candidate.");
  if (canonicalJson(appLock.artifacts.map((item) => item.trackId)) !== canonicalJson(CANDIDATE_TRACK_IDS)) throw new Error("Application release lock track scope differs from the candidate.");
  const bundled = new Map(contentLock.tracks.map((item) => [item.trackId, item]));
  for (const [index, artifact] of release.artifacts.entries()) {
    const locked = appLock.artifacts[index];
    const installed = bundled.get(artifact.trackId);
    if (!locked || !installed || locked.checksumSha256 !== artifact.checksumSha256 || installed.sha256 !== artifact.checksumSha256 || locked.contentVersion !== artifact.contentVersion || installed.contentVersion !== artifact.contentVersion) throw new Error(`Application runtime binding differs for ${artifact.trackId}.`);
  }
}

export async function createCandidateAdmissionV3({ root = ROOT, appRoot = path.resolve(ROOT, "../patternly") } = {}) {
  const [candidate, release, appLockBytes, contentLockBytes, runtimeTestBytes] = await Promise.all([
    json(root, CANDIDATE_PATH), json(root, RELEASE_PATH),
    readFile(path.join(appRoot, APP_LOCK_PATH)), readFile(path.join(appRoot, APP_CONTENT_LOCK_PATH)), readFile(path.join(appRoot, RUNTIME_TEST_PATH)),
  ]);
  if (candidateIdFor(candidate) !== candidate.candidateId) throw new Error("Candidate identity is invalid.");
  for (const artifact of release.artifacts) {
    const artifactBytes = await readFile(path.join(root, "reports/candidate-reconciliation/AWS-02-DRAFT/release", artifact.artifactPath));
    if (artifactBytes.length !== artifact.artifactBytes || sha256(artifactBytes) !== artifact.checksumSha256) throw new Error(`Publishing artifact differs for ${artifact.trackId}.`);
  }
  const appLock = JSON.parse(appLockBytes);
  const contentLock = JSON.parse(contentLockBytes);
  assertExactTrackBindings(candidate, release, appLock, contentLock);
  const { stdout: headOutput } = await exec("git", ["rev-parse", "HEAD"], { cwd: appRoot, encoding: "utf8" });
  const frontendCommit = headOutput.trim();
  if (!COMMIT.test(frontendCommit)) throw new Error("Application HEAD is not a full commit SHA.");
  const { stdout: relevantStatus } = await exec("git", ["status", "--porcelain", "--", APP_LOCK_PATH, APP_CONTENT_LOCK_PATH, RUNTIME_TEST_PATH, "src/content/canonical", "src/domain/tracks"], { cwd: appRoot, encoding: "utf8" });
  if (relevantStatus.trim()) throw new Error("Runtime admission paths differ from the application HEAD.");
  const command = "node --import tsx --test src/domain/tracks/runtimeAdmissionLaunchTracks.test.ts";
  await exec(process.execPath, ["--import", "tsx", "--test", RUNTIME_TEST_PATH], { cwd: appRoot, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  const runtimeEvidence = {
    schemaVersion: "patternly-runtime-admission-evidence-v3",
    candidateId: candidate.candidateId,
    frontendCommit,
    command,
    status: "passed",
    applicationReleaseLock: { path: APP_LOCK_PATH, sha256: sha256(appLockBytes) },
    bundledContentLock: { path: APP_CONTENT_LOCK_PATH, sha256: sha256(contentLockBytes) },
    runtimeTest: { path: RUNTIME_TEST_PATH, sha256: sha256(runtimeTestBytes) },
    trackIds: [...CANDIDATE_TRACK_IDS],
  };
  const runtimePath = `evidence/admissions/runtime/${candidate.candidateId}-${frontendCommit}.json`;
  const runtimeBytes = canonicalJsonBytes(runtimeEvidence);
  const admission = {
    schemaVersion: "patternly-candidate-admission-v3",
    taskId: "AWS-02/ADMISSION",
    candidateId: candidate.candidateId,
    candidatePath: CANDIDATE_PATH,
    release: { releaseId: release.manifest.releaseId, releasePath: RELEASE_PATH, checksumSha256: sha256(canonicalJsonBytes(release)), boundary: "local_verified_artifacts_no_deployment" },
    application: { frontendCommit, releaseLockPath: APP_LOCK_PATH, releaseLockSha256: sha256(appLockBytes), bundledContentLockSha256: sha256(contentLockBytes) },
    runtimeEvidence: { path: runtimePath, sha256: sha256(runtimeBytes) },
    publishingAdmission: "granted",
    runtimeAdmission: "granted",
    appReleaseLockUpdated: true,
    trackIds: [...CANDIDATE_TRACK_IDS],
    tracks: release.artifacts.map((artifact) => ({ trackId: artifact.trackId, artifactSha256: artifact.checksumSha256, publishingAdmission: "granted", runtimeAdmission: "granted" })),
  };
  return { admission, runtimeEvidence, runtimePath };
}

export async function validateCandidateAdmissionV3(admission, { root = ROOT } = {}) {
  if (admission.schemaVersion !== "patternly-candidate-admission-v3" || admission.taskId !== "AWS-02/ADMISSION" || !HASH.test(admission.candidateId ?? "") || !COMMIT.test(admission.application?.frontendCommit ?? "")) throw new Error("Candidate admission identity is invalid.");
  if (admission.publishingAdmission !== "granted" || admission.runtimeAdmission !== "granted" || admission.appReleaseLockUpdated !== true) throw new Error("Candidate admission is not granted.");
  if (admission.release?.boundary !== "local_verified_artifacts_no_deployment") throw new Error("Candidate admission must preserve the no-deployment boundary.");
  if (canonicalJson(admission.trackIds) !== canonicalJson(CANDIDATE_TRACK_IDS) || canonicalJson(admission.tracks?.map((item) => item.trackId)) !== canonicalJson(CANDIDATE_TRACK_IDS)) throw new Error("Candidate admission track scope is invalid.");
  const runtimeBytes = await readFile(path.join(root, admission.runtimeEvidence.path));
  if (sha256(runtimeBytes) !== admission.runtimeEvidence.sha256) throw new Error("Runtime evidence hash mismatch.");
  const runtime = JSON.parse(runtimeBytes);
  if (runtime.status !== "passed" || runtime.candidateId !== admission.candidateId || runtime.frontendCommit !== admission.application.frontendCommit || canonicalJson(runtime.trackIds) !== canonicalJson(CANDIDATE_TRACK_IDS)) throw new Error("Runtime evidence identity is stale.");
  if (runtime.applicationReleaseLock.sha256 !== admission.application.releaseLockSha256 || runtime.bundledContentLock.sha256 !== admission.application.bundledContentLockSha256) throw new Error("Candidate admission application binding is stale.");
  const [candidate, release] = await Promise.all([json(root, CANDIDATE_PATH), json(root, RELEASE_PATH)]);
  if (candidate.candidateId !== admission.candidateId || admission.release.releaseId !== release.manifest.releaseId || admission.release.checksumSha256 !== sha256(canonicalJsonBytes(release))) throw new Error("Candidate admission release binding is stale.");
  const releaseByTrack = new Map(release.artifacts.map((artifact) => [artifact.trackId, artifact]));
  for (const track of admission.tracks) {
    const artifact = releaseByTrack.get(track.trackId);
    if (track.publishingAdmission !== "granted" || track.runtimeAdmission !== "granted" || !artifact || track.artifactSha256 !== artifact.checksumSha256) throw new Error(`Candidate admission artifact binding is invalid for ${track.trackId}.`);
  }
  return admission;
}

export async function recordCandidateAdmissionV3(options = {}) {
  const root = options.root ?? ROOT;
  const result = await createCandidateAdmissionV3(options);
  await mkdir(path.dirname(path.join(root, result.runtimePath)), { recursive: true });
  await writeFile(path.join(root, result.runtimePath), canonicalJsonBytes(result.runtimeEvidence));
  await writeFile(path.join(root, ADMISSION_PATH), canonicalJsonBytes(result.admission));
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  recordCandidateAdmissionV3().then(({ admission }) => process.stdout.write(`ADMISSION_READY candidateId=${admission.candidateId}; boundary=${admission.release.boundary}\n`)).catch((error) => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });
}
