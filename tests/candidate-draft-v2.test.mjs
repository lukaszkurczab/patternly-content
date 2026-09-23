import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildCandidateDraft, CANDIDATE_DRAFT_SCHEMA_PATH, CANDIDATE_RELEASE_SCHEMA_PATH } from "../scripts/review/candidate-draft-v2.mjs";
import { validateSchema } from "../scripts/review/schema-validation.mjs";

const ROOT = path.resolve(fileURLToPath(new URL("../", import.meta.url)));

test("candidate draft v2 binds all nine canonical artifacts and exact ODK-096 AWS identity deterministically", async () => {
  const base = await mkdtemp(path.join(os.tmpdir(), "patternly-candidate-draft-test-"));
  const one = path.join(base, "one");
  const two = path.join(base, "two");
  try {
    const first = await buildCandidateDraft({ root: ROOT, outputDirectory: one });
    const second = await buildCandidateDraft({ root: ROOT, outputDirectory: two });
    const draftSchema = JSON.parse(await readFile(path.join(ROOT, CANDIDATE_DRAFT_SCHEMA_PATH), "utf8"));
    const releaseSchema = JSON.parse(await readFile(path.join(ROOT, CANDIDATE_RELEASE_SCHEMA_PATH), "utf8"));
    assert.equal(first.manifest.candidateId, second.manifest.candidateId);
    assert.deepEqual(first.manifest, second.manifest);
    assert.equal(first.manifest.tracks.length, 9);
    assert.equal(first.manifest.status, "draft_not_admitted");
    assert.deepEqual(first.manifest.review, {
      candidateApproval: "not_granted",
      publishingAdmission: "not_granted",
      runtimeAdmission: "not_granted",
      appReleaseLockUpdated: false,
    });
    const aws = first.manifest.tracks.find((track) => track.trackId === "aws-certified-solutions-architect-associate");
    assert.equal(aws.questionCount, 2604);
    assert.equal(aws.contentVersion, "aws-certified-solutions-architect-associate-authoring-v2026.09.21-odk096");
    assert.equal(aws.questionSetSha256, "46697d0c4e395455084d5dc28206b83e9207109b6f803eb94a47d4b4b981ac45");
    assert.equal(aws.canonicalApprovalBinding.newQuestionIds.length, 36);
    for (const relativePath of ["release/release.json", "candidate/manifest.json", ...first.release.artifacts.map((entry) => `release/${entry.artifactPath}`)]) {
      assert.deepEqual(await readFile(path.join(one, relativePath)), await readFile(path.join(two, relativePath)));
    }
    assert.equal((await readdir(path.join(one, "release", "artifacts"))).length, 9);
    assert.equal(JSON.parse(await readFile(path.join(one, "candidate", "manifest.json"), "utf8")).candidateId, first.manifest.candidateId);
    await assert.rejects(validateSchema({ ...first.manifest, tracks: Array(9).fill(first.manifest.tracks[0]) }, draftSchema));
    await assert.rejects(validateSchema({ ...first.manifest, tracks: [{ ...first.manifest.tracks[0], trackId: "unknown-track" }, ...first.manifest.tracks.slice(1)] }, draftSchema));
    await assert.rejects(validateSchema({ ...first.manifest, tracks: [...first.manifest.tracks, first.manifest.tracks[0]] }, draftSchema));
    await assert.rejects(validateSchema({ ...first.release, artifacts: Array(9).fill(first.release.artifacts[0]) }, releaseSchema));
    await assert.rejects(validateSchema({ ...first.release, artifacts: [{ ...first.release.artifacts[0], trackId: "unknown-track" }, ...first.release.artifacts.slice(1)] }, releaseSchema));
    await assert.rejects(validateSchema({ ...first.release, artifacts: [...first.release.artifacts, first.release.artifacts[0]] }, releaseSchema));
  } finally {
    await rm(base, { recursive: true, force: true });
  }
});
