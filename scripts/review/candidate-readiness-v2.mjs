import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { CANDIDATE_TRACK_IDS, candidateIdFor, canonicalJson, canonicalJsonBytes } from "./candidate-manifest.mjs";
import { validateSchema } from "./schema-validation.mjs";

const ROOT = path.resolve(fileURLToPath(new URL("../../", import.meta.url)));
export const CANDIDATE_PATH = "reports/candidate-reconciliation/AWS-02-DRAFT/candidate/manifest.json";
export const RELEASE_PATH = "reports/candidate-reconciliation/AWS-02-DRAFT/release/release.json";
export const DECISION_PATH = "evidence/candidate-decisions/aws-02-codex-decision-v2.json";
export const READINESS_PATH = "evidence/readiness/candidate-readiness-v2.json";
export const DECISION_SCHEMA_PATH = "schemas/review/content-candidate-decision-v2.schema.json";
export const READINESS_SCHEMA_PATH = "schemas/review/content-candidate-readiness-v2.schema.json";
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const exactKeys = (value, expected, label) => {
  const actual = Object.keys(value ?? {}).sort();
  const wanted = [...expected].sort();
  if (canonicalJson(actual) !== canonicalJson(wanted)) throw new Error(`${label} has unsupported or missing fields.`);
};

async function json(root, relativePath) {
  return JSON.parse(await readFile(path.join(root, relativePath), "utf8"));
}

function trackBindings(candidate, release) {
  if (canonicalJson(release.artifacts.map((item) => item.trackId)) !== canonicalJson(CANDIDATE_TRACK_IDS)) {
    throw new Error("Candidate release must contain exactly the nine sorted canonical track IDs.");
  }
  if (canonicalJson(candidate.tracks.map((item) => item.trackId)) !== canonicalJson(CANDIDATE_TRACK_IDS)) {
    throw new Error("Candidate draft must contain exactly the nine sorted canonical track IDs.");
  }
  return release.artifacts.map((artifact, index) => {
    const track = candidate.tracks[index];
    if (track.trackId !== artifact.trackId || track.artifactPath !== artifact.artifactPath || track.checksumSha256 !== artifact.checksumSha256 || track.questionCount !== artifact.questionCount || track.questionSetSha256 !== artifact.questionSetSha256) {
      throw new Error(`Draft and release track binding differs for ${artifact.trackId}.`);
    }
    return {
      trackId: artifact.trackId,
      sourcePath: artifact.sourcePath,
      artifactPath: artifact.artifactPath,
      questionCount: artifact.questionCount,
      questionSetSha256: artifact.questionSetSha256,
      artifactSha256: artifact.checksumSha256,
    };
  });
}

export async function validateCandidateDecisionV2(decision, { root = ROOT, candidate, release, bindings } = {}) {
  exactKeys(decision, ["schemaVersion", "decisionId", "decisionAuthority", "taskId", "decision", "decisionRationale", "candidatePath", "candidateId", "sourceRepositoryCommit", "release", "trackIds", "tracks", "basis", "boundaries"], "Codex candidate decision");
  if (decision.schemaVersion !== "patternly-content-candidate-decision-v2") throw new Error("Candidate decision must use version 2; legacy v1 paths are not accepted.");
  if (decision.decisionAuthority !== "delegated_codex" || decision.decision !== "approved_for_candidate_readiness") throw new Error("Candidate decision is not the delegated Codex candidate approval.");
  if (decision.taskId !== "AWS-02/CANDIDATE" || typeof decision.decisionRationale !== "string" || !decision.decisionRationale.trim() || canonicalJson(decision.basis) !== canonicalJson({ odk096: "passed", nineTrackBuild: "passed", repositoryTests: "passed", migrationVerification: "passed" })) throw new Error("Candidate decision basis is incomplete or belongs to another task.");
  if (decision.candidatePath !== CANDIDATE_PATH || decision.candidateId !== candidate.candidateId || candidateIdFor(candidate) !== candidate.candidateId) throw new Error("Candidate decision is missing, stale, or bound to the wrong candidate path/ID.");
  if (decision.decisionId !== `codex-content-candidate-review-v2:${candidate.candidateId}`) throw new Error("Candidate decision ID does not bind the exact candidate.");
  if (decision.sourceRepositoryCommit !== candidate.release.sourceRepositoryCommit) throw new Error("Candidate decision source snapshot is stale.");
  const expectedRelease = { releaseId: release.manifest.releaseId, releasePath: RELEASE_PATH, checksumSha256: sha256(canonicalJsonBytes(release)) };
  if (canonicalJson(decision.release) !== canonicalJson(expectedRelease)) throw new Error("Candidate decision release identity or checksum is stale.");
  if (canonicalJson(decision.trackIds) !== canonicalJson(CANDIDATE_TRACK_IDS) || canonicalJson(decision.tracks) !== canonicalJson(bindings)) throw new Error("Candidate decision track set or artifact hashes do not match the candidate.");
  if (canonicalJson(decision.boundaries) !== canonicalJson({ publishingAdmission: "not_granted", runtimeAdmission: "not_granted", appReleaseLockUpdated: false })) throw new Error("Candidate decision cannot grant publishing/runtime admission or change the app release lock.");
  const schema = await json(root, DECISION_SCHEMA_PATH);
  await validateSchema(decision, schema, DECISION_PATH);
  return decision;
}

export async function buildCandidateReadinessV2({ root = ROOT, decisionPath = DECISION_PATH, outputPath = READINESS_PATH } = {}) {
  const candidate = await json(root, CANDIDATE_PATH);
  const release = await json(root, RELEASE_PATH);
  const bindings = trackBindings(candidate, release);
  for (const artifact of release.artifacts) {
    const bytes = await readFile(path.join(root, "reports/candidate-reconciliation/AWS-02-DRAFT/release", artifact.artifactPath));
    if (bytes.length !== artifact.artifactBytes || sha256(bytes) !== artifact.checksumSha256) throw new Error(`Candidate artifact is missing or has a checksum mismatch: ${artifact.trackId}.`);
  }
  if (sha256(canonicalJsonBytes(release)) !== candidate.release.checksumSha256 || candidate.release.releaseId !== release.manifest.releaseId || candidate.release.sourceRepositoryCommit !== release.manifest.sourceRepositoryCommit) throw new Error("Candidate release checksum, source snapshot, or release ID does not match its envelope.");
  const decision = await json(root, decisionPath);
  await validateCandidateDecisionV2(decision, { root, candidate, release, bindings });
  const decisionBytes = await readFile(path.join(root, decisionPath));
  const readiness = {
    schemaVersion: "patternly-content-candidate-readiness-v2",
    candidatePath: CANDIDATE_PATH,
    candidateId: candidate.candidateId,
    sourceRepositoryCommit: candidate.release.sourceRepositoryCommit,
    release: { releaseId: release.manifest.releaseId, releasePath: RELEASE_PATH, checksumSha256: sha256(canonicalJsonBytes(release)) },
    trackIds: [...CANDIDATE_TRACK_IDS],
    candidateApproval: { status: "approved", decisionId: decision.decisionId, decisionPath, decisionSha256: sha256(decisionBytes) },
    publishingAdmission: "not_granted",
    runtimeAdmission: "not_granted",
    appReleaseLockUpdated: false,
    tracks: bindings.map((binding) => ({ ...binding, publishingAdmission: "not_granted", runtimeAdmission: "not_granted" })),
  };
  const schema = await json(root, READINESS_SCHEMA_PATH);
  await validateSchema(readiness, schema, READINESS_PATH);
  await writeFile(path.join(root, outputPath), canonicalJsonBytes(readiness));
  return readiness;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  buildCandidateReadinessV2().then((readiness) => {
    process.stdout.write(`Readiness v2 verified for ${readiness.candidateId}; candidateApproval=approved; publishing/runtime=not_granted\n`);
  }).catch((error) => {
    process.stderr.write(`${error.stack ?? error.message}\n`);
    process.exitCode = 1;
  });
}
