// Bounded local delegated decision for the independently reviewed OOD source11 batch.
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
assert.equal(sourceCommit, "0a4b8cbcf51b40f0c33b6c699606e2c85998705a", "This tool is bounded to the reviewed OOD source11 source checkpoint.");
const [candidate, release, proof] = await Promise.all([
  read("reports/candidate-reconciliation/AWS-02-DRAFT/candidate/manifest.json"),
  read("reports/candidate-reconciliation/AWS-02-DRAFT/release/release.json"),
  read("evidence/business-quality/bizq-01-ood-source-11.json"),
]);
assert.equal(candidate.release.sourceRepositoryCommit, sourceCommit);
assert.equal(candidate.candidateId, "e7fbd82b4afab18994e406175feb442842ccf06b41be3efec0ae92cf2d394fbe", "This reviewed decision binds exactly the source11 candidate.");
assert.equal(release.artifacts.find((artifact) => artifact.trackId === proof.trackId).questionSetSha256, proof.questionSetSha256);
const bindings = release.artifacts.map((artifact) => ({ trackId: artifact.trackId, sourcePath: artifact.sourcePath, artifactPath: artifact.artifactPath, questionCount: artifact.questionCount, questionSetSha256: artifact.questionSetSha256, artifactSha256: artifact.checksumSha256 }));
const decision = {
  schemaVersion: "patternly-content-candidate-decision-v2",
  decisionId: `codex-content-candidate-review-v2:${candidate.candidateId}`,
  decisionAuthority: "delegated_codex", taskId: "BIZQ-01/CANDIDATE",
  decision: "approved_for_candidate_readiness",
  decisionRationale: "Bounded OOD source11: one changed actor/observable-goal/subject decision i001→i018 with five new option IDs, preserved node/mental-unit/interaction/scoring/count, explicit scoped authored feedback. Independent Luna High revised semantic PASS and fixed source/proof PASS17/17 plus final OOD7/7/path tamper; root24/24 plus addedpath1/1, real migration/current16077/history16041+36AWS, OOD validate/test/build1413. Root actual full canonical109/109 after correcting stale current-version test while frozen ACC/BESD/Coding/AWS records remain unchanged. Existing candidate tool builds all nine outputs from exact committed source; root verified eight other artifact bytes unchanged and new OOD checksum49e1bce7fe393145e04d46e4c3220b991c3f869be705e12cccdc2026490b08c4. Other sixteen unit defects, full-bank/native/Premium-provider/SDK/transfer acceptance remain open. This readiness decision does not grant runtime/publishing admission; consumer/app-lock/admission checks follow their existing separate authority. No deployment, external publication or service change.",
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
