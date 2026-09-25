import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { CANDIDATE_PATH, DECISION_PATH, READINESS_PATH, RELEASE_PATH, createCandidateReadinessV2 } from "./candidate-readiness-v2.mjs";
import { ADMISSION_PATH, validateCandidateAdmissionV3 } from "./candidate-admission-v3.mjs";
import { candidateIdFor, canonicalJson, canonicalJsonBytes } from "./candidate-manifest.mjs";

const ROOT = path.resolve(fileURLToPath(new URL("../../", import.meta.url)));
const DRAFT_ROOT = "reports/candidate-reconciliation/AWS-02-DRAFT";
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

async function readJson(root, relativePath) {
  return JSON.parse(await readFile(path.join(root, relativePath), "utf8"));
}

export async function verifyCandidateReleaseEvidence({ root = ROOT } = {}) {
  const candidate = await readJson(root, CANDIDATE_PATH);
  const release = await readJson(root, RELEASE_PATH);
  if (candidateIdFor(candidate) !== candidate.candidateId || candidate.status !== "draft_not_admitted") {
    throw new Error("Candidate manifest identity or draft status is invalid.");
  }
  if (candidate.release.releaseId !== release.manifest.releaseId || candidate.release.sourceRepositoryCommit !== release.manifest.sourceRepositoryCommit || candidate.release.checksumSha256 !== sha256(canonicalJsonBytes(release))) {
    throw new Error("Candidate manifest is stale or does not bind the current release manifest.");
  }
  if (candidate.tracks.length !== release.artifacts.length) throw new Error("Candidate manifest and release artifact sets differ.");
  for (const [index, artifact] of release.artifacts.entries()) {
    if (artifact.artifactPath !== `artifacts/${artifact.trackId}.json`) throw new Error(`Candidate artifact path is invalid for ${artifact.trackId}.`);
    const bytes = await readFile(path.join(root, DRAFT_ROOT, "release", artifact.artifactPath));
    if (bytes.length !== artifact.artifactBytes || sha256(bytes) !== artifact.checksumSha256) throw new Error(`Candidate artifact is stale or has a checksum mismatch: ${artifact.trackId}.`);
    const track = candidate.tracks[index];
    if (track.trackId !== artifact.trackId || track.artifactPath !== artifact.artifactPath || track.checksumSha256 !== artifact.checksumSha256 || track.questionSetSha256 !== artifact.questionSetSha256 || track.questionCount !== artifact.questionCount) {
      throw new Error(`Candidate manifest track binding is stale for ${artifact.trackId}.`);
    }
  }

  const expectedReadiness = await createCandidateReadinessV2({ root });
  const committedReadiness = await readJson(root, READINESS_PATH);
  if (canonicalJson(committedReadiness) !== canonicalJson(expectedReadiness)) {
    throw new Error(`Candidate readiness is stale for ${candidate.candidateId}; regenerate ${READINESS_PATH}.`);
  }
  const decisionBytes = await readFile(path.join(root, DECISION_PATH));
  if (committedReadiness.candidateApproval.decisionSha256 !== sha256(decisionBytes)) {
    throw new Error(`Candidate decision binding is stale for ${candidate.candidateId}.`);
  }
  return { candidate, release, readiness: committedReadiness };
}

export async function runCandidateReleaseGate({ root = ROOT } = {}) {
  const { candidate, readiness } = await verifyCandidateReleaseEvidence({ root });
  if (readiness.publishingAdmission !== "not_granted" || readiness.runtimeAdmission !== "not_granted" || readiness.appReleaseLockUpdated !== false) throw new Error("Candidate readiness v2 boundaries were mutated instead of preserving the separate admission authority.");
  let admission;
  try { admission = await readJson(root, ADMISSION_PATH); }
  catch { throw new Error(`RELEASE_BLOCKED candidateId=${candidate.candidateId}; reason=admission_missing; delegated candidate approval grants readiness only.`); }
  await validateCandidateAdmissionV3(admission, { root });
  if (admission.candidateId !== candidate.candidateId || admission.release.checksumSha256 !== candidate.release.checksumSha256) throw new Error("Candidate admission is stale for the exact release.");
  return candidate;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runCandidateReleaseGate().then((candidate) => {
    process.stdout.write(`RELEASE_READY candidateId=${candidate.candidateId}\n`);
  }).catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
