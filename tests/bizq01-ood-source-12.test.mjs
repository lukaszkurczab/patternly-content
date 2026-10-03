import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readFile, realpath, rename, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test, { after, before } from "node:test";

import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";
import { MigrationVerificationError, verifyMigration } from "../scripts/content/verify-migration.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const trackId = "object-oriented-design-interview";
const sourcePath = "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B01.json";
const proof12Path = "evidence/business-quality/bizq-01-ood-source-12.json";
const proof11Path = "evidence/business-quality/bizq-01-ood-source-11.json";
const questionId = "ood-n01-b01-i019";
const removedQuestionId = "ood-n01-b01-i002";
let fixtureRoot;

async function withJsonMutation(relativePath, mutate, action) {
  const target = path.join(fixtureRoot, relativePath);
  const original = await readFile(target);
  try {
    const value = JSON.parse(original.toString("utf8"));
    await writeFile(target, `${JSON.stringify(mutate(value))}\n`, "utf8");
    await action();
  } finally {
    await writeFile(target, original);
  }
}

async function assertRejected(code) {
  await assert.rejects(verifyMigration({ contentRoot: path.join(fixtureRoot, "content") }), (error) => {
    assert.ok(error instanceof MigrationVerificationError);
    assert.equal(error.code, code);
    return true;
  });
}

before(async () => {
  fixtureRoot = await realpath(await mkdtemp(path.join(os.tmpdir(), "bizq01-ood-source-12-")));
  await cp(path.join(repositoryRoot, "content"), path.join(fixtureRoot, "content"), { recursive: true });
  await mkdir(path.join(fixtureRoot, "evidence", "business-quality"), { recursive: true });
  for (const name of [
    "bizq-01-besd-slice-01.json",
    "bizq-01-coding-source-copy-04.json",
    "bizq-01-ood-source-11.json",
    "bizq-01-ood-source-12.json"
  ]) {
    await cp(path.join(repositoryRoot, "evidence", "business-quality", name), path.join(fixtureRoot, "evidence", "business-quality", name));
  }
  await cp(path.join(repositoryRoot, "evidence", "canonical-content-approvals"), path.join(fixtureRoot, "evidence", "canonical-content-approvals"), { recursive: true });
});

after(async () => {
  await rm(fixtureRoot, { recursive: true, force: true });
});

test("validates source12 as an exact successor while preserving both OOD replacements", async () => {
  const result = await verifyMigration({ contentRoot: path.join(repositoryRoot, "content") });
  assert.equal(result.result, "passed");
  assert.deepEqual(result.semanticReplacementProof.replacements, [
    { beforeQuestionId: "ood-n01-b01-i001", questionId: "ood-n01-b01-i018" },
    { beforeQuestionId: removedQuestionId, questionId }
  ]);
  assert.equal(result.counts.questions, 16077);
  assert.equal(result.historicalCounts.questions, 16041);
  assert.equal(result.tracks.find((track) => track.trackId === trackId).currentCounts.questions, 1413);
});

test("source12 question validates, scores all options, and supplies authored wrong-option feedback", async () => {
  const questions = JSON.parse(await readFile(path.join(repositoryRoot, sourcePath), "utf8"));
  const question = questions.find((entry) => entry.questionId === questionId);
  assert.ok(question);
  assert.equal(questions.some((entry) => entry.questionId === removedQuestionId), false);
  assert.equal(validateQuestion(question).valid, true);
  assert.equal(question.interaction.options.length, 4);
  for (const option of question.interaction.options) {
    const score = scoreQuestion(question, { type: "choice_single", optionId: option.optionId });
    assert.equal(score.status, option.optionId === question.answer.optionId ? "correct" : "incorrect");
    assert.equal(score.earnedPoints, option.optionId === question.answer.optionId ? 1 : 0);
    if (option.optionId !== question.answer.optionId) {
      assert.equal(question.feedback.messages.filter((message) => message.targetId === option.optionId).length, 1);
    }
  }
});

test("source12 cannot fall back when either fixed generation proof is absent", async () => {
  for (const relativePath of [proof12Path, proof11Path]) {
    const target = path.join(fixtureRoot, relativePath);
    const original = await readFile(target);
    try {
      await rm(target);
      await assertRejected("EVIDENCE_MEMBERSHIP");
    } finally {
      await writeFile(target, original);
    }
  }
});

test("rejects tampered current content, predecessor proof, and source identity", async () => {
  await withJsonMutation(sourcePath, (questions) => {
    questions.find((question) => question.questionId === questionId).prompt += " changed";
    return questions;
  }, () => assertRejected("HASH_MISMATCH"));
  await withJsonMutation(proof12Path, (proof) => {
    proof.replacements[0].beforeQuestion.prompt += " changed";
    return proof;
  }, () => assertRejected("HASH_MISMATCH"));
  await withJsonMutation("content/catalog.json", (catalog) => {
    catalog.tracks.find((track) => track.trackId === trackId).contentVersion = "stale-version";
    return catalog;
  }, () => assertRejected("EVIDENCE_VALUE"));
});

test("rejects unreviewed successor proof identity, hashes, paths, and fields", async () => {
  await withJsonMutation(proof12Path, (proof) => {
    proof.questionSetSha256 = "0".repeat(64);
    return proof;
  }, () => assertRejected("EVIDENCE_VALUE"));
  await withJsonMutation(proof12Path, (proof) => {
    proof.replacements[0].acceptedOptionId = "provider_ready_is_success";
    return proof;
  }, () => assertRejected("EVIDENCE_VALUE"));
  await withJsonMutation(proof12Path, (proof) => {
    proof.replacements[0].sourceFile = "content/other.json";
    return proof;
  }, () => assertRejected("EVIDENCE_VALUE"));
  await withJsonMutation(proof12Path, (proof) => {
    proof.unreviewed = true;
    return proof;
  }, () => assertRejected("EVIDENCE_SHAPE"));
  await withJsonMutation(proof11Path, (proof) => {
    proof.replacements[0].beforeQuestion.prompt += " changed";
    return proof;
  }, () => assertRejected("HASH_MISMATCH"));
});

test("rejects a changed unrelated OOD source item instead of reconstructing around it", async () => {
  await withJsonMutation(sourcePath, (questions) => {
    questions.find((question) => question.questionId === "ood-n01-b01-i003").prompt += " changed";
    return questions;
  }, () => assertRejected("HASH_MISMATCH"));
});

test("rejects a symlinked current source before following it", async () => {
  const sourceFile = path.join(fixtureRoot, sourcePath);
  const movedFile = `${sourceFile}.held`;
  await rename(sourceFile, movedFile);
  await symlink(movedFile, sourceFile);
  try {
    await assertRejected("SYMLINK_PATH");
  } finally {
    await rm(sourceFile, { force: true });
    await rename(movedFile, sourceFile);
  }
});
