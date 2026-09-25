import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { assertCanonicalSourceSnapshot, buildCandidateDraft, CANDIDATE_DRAFT_SCHEMA_PATH, CANDIDATE_RELEASE_SCHEMA_PATH } from "../scripts/review/candidate-draft-v2.mjs";
import { CANDIDATE_TRACK_IDS } from "../scripts/review/candidate-manifest.mjs";
import { validateQuestion } from "../scripts/content/question-contract.mjs";
import { validateSchema } from "../scripts/review/schema-validation.mjs";

const ROOT = path.resolve(fileURLToPath(new URL("../", import.meta.url)));
const exec = promisify(execFile);

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
    assert.equal(first.manifest.release.sourceRepositoryCommit, second.manifest.release.sourceRepositoryCommit);
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

test("canonical source snapshot rejects a valid untracked mental-unit JSON in an isolated Git fixture", async () => {
  const base = await mkdtemp(path.join(os.tmpdir(), "patternly-content-snapshot-test-"));
  const root = path.join(base, "repo");
  const trackedRelativePath = "content/aws-certified-solutions-architect-associate/database_performance_access_patterns_caching_and_replication/dynamodb_partition_and_capacity_behavior.json";
  const untrackedRelativePath = "content/aws-certified-solutions-architect-associate/database_performance_access_patterns_caching_and_replication/candidate_added_from_maestro.json";
  try {
    await mkdir(path.dirname(path.join(root, trackedRelativePath)), { recursive: true });
    await exec("git", ["init", "-q"], { cwd: root });
    await exec("git", ["config", "user.name", "Snapshot Test"], { cwd: root });
    await exec("git", ["config", "user.email", "snapshot-test@example.invalid"], { cwd: root });
    const trackedBytes = await readFile(path.join(ROOT, trackedRelativePath));
    await writeFile(path.join(root, trackedRelativePath), trackedBytes);
    await exec("git", ["add", "content"], { cwd: root });
    await exec("git", ["commit", "-qm", "fixture source snapshot"], { cwd: root });
    const { stdout } = await exec("git", ["rev-parse", "HEAD"], { cwd: root });
    const sourceCommit = stdout.trim();

    await assertCanonicalSourceSnapshot(root, sourceCommit);

    const validQuestionSet = JSON.parse(trackedBytes.toString("utf8")).map((question) => ({
      ...question,
      mentalUnitId: "candidate_added_from_maestro",
      questionId: `${question.questionId}-untracked`,
    }));
    assert.ok(validQuestionSet.length > 0);
    assert.ok(validQuestionSet.every((question) => validateQuestion(question, { catalogTrackIds: CANDIDATE_TRACK_IDS }).valid));
    await writeFile(path.join(root, untrackedRelativePath), `${JSON.stringify(validQuestionSet)}\n`);
    await assert.rejects(assertCanonicalSourceSnapshot(root, sourceCommit), /paths or bytes differ/);
  } finally {
    await rm(base, { recursive: true, force: true });
  }
});
