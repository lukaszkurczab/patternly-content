// Bounded local delegated decision for the already reviewed source-copy04 batch.
// This records candidate readiness only; existing app/runtime admission remains separate.
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalJsonBytes, CANDIDATE_TRACK_IDS } from "../../../scripts/review/candidate-manifest.mjs";
import { validateCandidateDecisionV2 } from "../../../scripts/review/candidate-readiness-v2.mjs";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const read = async (relativePath) => JSON.parse(await readFile(path.join(root, relativePath), "utf8"));
const sourceCommit = execFileSync("git", ["log", "-1", "--format=%H", "--", "content"], { cwd: root, encoding: "utf8" }).trim();
assert.equal(sourceCommit, "b3debc783454fd0d2b6083fb741d98c4c638f7ee", "This tool is bounded to the reviewed source-copy04 source checkpoint.");
const [candidate, release, proof] = await Promise.all([
  read("reports/candidate-reconciliation/AWS-02-DRAFT/candidate/manifest.json"),
  read("reports/candidate-reconciliation/AWS-02-DRAFT/release/release.json"),
  read("evidence/business-quality/bizq-01-coding-source-copy-04.json"),
]);
assert.equal(candidate.release.sourceRepositoryCommit, sourceCommit);
assert.equal(release.artifacts.find((artifact) => artifact.trackId === proof.trackId).questionSetSha256, proof.questionSetSha256);
const bindings = release.artifacts.map((artifact) => ({ trackId: artifact.trackId, sourcePath: artifact.sourcePath, artifactPath: artifact.artifactPath, questionCount: artifact.questionCount, questionSetSha256: artifact.questionSetSha256, artifactSha256: artifact.checksumSha256 }));
const decision = {
  schemaVersion: "patternly-content-candidate-decision-v2",
  decisionId: `codex-content-candidate-review-v2:${candidate.candidateId}`,
  decisionAuthority: "delegated_codex", taskId: "BIZQ-01/CANDIDATE",
  decision: "approved_for_candidate_readiness",
  decisionRationale: "Bounded source-copy04: exactly three wording fields of one same-ID Coding question, unchanged learning intent/answer/options/taxonomy. Strict proof binds immutable old object and exact current file/track/version; prior BESD/AWS evidence unchanged. Independent Luna High source/proof PASS13/13 and applicable33/33, actual migration PASS. Controller focused13/13 plus related66/66 and real Coding validate/test/build PASS. Existing candidate build binds all nine outputs. Full final canonical/consumer/admission checks follow the separate exact-lock chain; no native/full-bank/deployment/publication claim.",
  candidatePath: "reports/candidate-reconciliation/AWS-02-DRAFT/candidate/manifest.json",
  candidateId: candidate.candidateId, sourceRepositoryCommit: sourceCommit,
  release: { releaseId: release.manifest.releaseId, releasePath: "reports/candidate-reconciliation/AWS-02-DRAFT/release/release.json", checksumSha256: createHash("sha256").update(canonicalJsonBytes(release)).digest("hex") },
  trackIds: [...CANDIDATE_TRACK_IDS], tracks: bindings,
  basis: { odk096: "passed", nineTrackBuild: "passed", repositoryTests: "passed", migrationVerification: "passed" },
  boundaries: { publishingAdmission: "not_granted", runtimeAdmission: "not_granted", appReleaseLockUpdated: false },
};
await validateCandidateDecisionV2(decision, { root, candidate, release, bindings });
await writeFile(path.join(root, "evidence/candidate-decisions/aws-02-codex-decision-v2.json"), canonicalJsonBytes(decision));
console.log(`Bounded delegated candidate decision recorded: ${candidate.candidateId}; runtime/publishing not granted.`);
