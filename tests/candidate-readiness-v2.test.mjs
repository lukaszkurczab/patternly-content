import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildCandidateDraft } from "../scripts/review/candidate-draft-v2.mjs";
import { CANDIDATE_TRACK_IDS, canonicalJson, canonicalJsonBytes } from "../scripts/review/candidate-manifest.mjs";
import { validateCandidateDecisionV2 } from "../scripts/review/candidate-readiness-v2.mjs";

const ROOT = path.resolve(fileURLToPath(new URL("../", import.meta.url)));
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

test("Codex candidate decision v2 binds exact candidate, source snapshot, release and nine artifact hashes", async () => {
  const base = await mkdtemp(path.join(os.tmpdir(), "patternly-candidate-readiness-test-"));
  try {
    const { manifest, release } = await buildCandidateDraft({ root: ROOT, outputDirectory: path.join(base, "draft") });
    const bindings = release.artifacts.map((artifact) => ({
      trackId: artifact.trackId,
      sourcePath: artifact.sourcePath,
      artifactPath: artifact.artifactPath,
      questionCount: artifact.questionCount,
      questionSetSha256: artifact.questionSetSha256,
      artifactSha256: artifact.checksumSha256,
    }));
    const decision = {
      schemaVersion: "patternly-content-candidate-decision-v2",
      decisionId: `codex-content-candidate-review-v2:${manifest.candidateId}`,
      decisionAuthority: "delegated_codex",
      taskId: "AWS-02/CANDIDATE",
      decision: "approved_for_candidate_readiness",
      decisionRationale: "All nine canonical artifacts match the current source snapshot and exact ODK-096 AWS binding; candidate approval grants neither publishing nor runtime admission.",
      candidatePath: "reports/candidate-reconciliation/AWS-02-DRAFT/candidate/manifest.json",
      candidateId: manifest.candidateId,
      sourceRepositoryCommit: manifest.release.sourceRepositoryCommit,
      release: { releaseId: release.manifest.releaseId, releasePath: "reports/candidate-reconciliation/AWS-02-DRAFT/release/release.json", checksumSha256: sha256(canonicalJsonBytes(release)) },
      trackIds: [...CANDIDATE_TRACK_IDS],
      tracks: bindings,
      basis: { odk096: "passed", nineTrackBuild: "passed", repositoryTests: "passed", migrationVerification: "passed" },
      boundaries: { publishingAdmission: "not_granted", runtimeAdmission: "not_granted", appReleaseLockUpdated: false },
    };
    await validateCandidateDecisionV2(decision, { root: ROOT, candidate: manifest, release, bindings });

    const stale = structuredClone(decision);
    stale.candidateId = "0".repeat(64);
    await assert.rejects(validateCandidateDecisionV2(stale, { root: ROOT, candidate: manifest, release, bindings }), /stale|wrong candidate/);
    const missing = structuredClone(decision);
    delete missing.tracks;
    await assert.rejects(validateCandidateDecisionV2(missing, { root: ROOT, candidate: manifest, release, bindings }), /missing fields/);
    const unknown = structuredClone(decision);
    unknown.trackIds[0] = "unknown-track";
    await assert.rejects(validateCandidateDecisionV2(unknown, { root: ROOT, candidate: manifest, release, bindings }), /track set/);
    const badHash = structuredClone(decision);
    badHash.tracks[0].artifactSha256 = "f".repeat(64);
    await assert.rejects(validateCandidateDecisionV2(badHash, { root: ROOT, candidate: manifest, release, bindings }), /artifact hashes/);
    const v1Path = structuredClone(decision);
    v1Path.candidatePath = "evidence/content-acceptance/candidate-manifest-v1.json";
    await assert.rejects(validateCandidateDecisionV2(v1Path, { root: ROOT, candidate: manifest, release, bindings }), /wrong candidate path/);
    const unknownKey = structuredClone(decision);
    unknownKey.approver = "human_owner";
    await assert.rejects(validateCandidateDecisionV2(unknownKey, { root: ROOT, candidate: manifest, release, bindings }), /unsupported or missing fields/);
    assert.equal(canonicalJson(decision.trackIds), canonicalJson(CANDIDATE_TRACK_IDS));
  } finally {
    await rm(base, { recursive: true, force: true });
  }
});
