import assert from "node:assert/strict";
import { mkdtemp, readFile, realpath, rename, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test, { after, before } from "node:test";

import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";
import { MigrationVerificationError, verifyMigration } from "../scripts/content/verify-migration.mjs";
import { copyCurrentMigrationFixture } from "./helpers/current-migration-fixture.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const trackId = "object-oriented-design-interview";
const sourcePath = "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B01.json";
const proofPath = "evidence/business-quality/bizq-01-ood-unit-cohort-13.json";
const proof12Path = "evidence/business-quality/bizq-01-ood-source-12.json";
const proof11Path = "evidence/business-quality/bizq-01-ood-source-11.json";
const replacementIds = Array.from({ length: 15 }, (_, index) => `ood-n01-b01-i${String(index + 20).padStart(3, "0")}`);
const historicalIds = Array.from({ length: 15 }, (_, index) => `ood-n01-b01-i${String(index + 3).padStart(3, "0")}`);
let fixtureRoot;

async function withJsonMutation(relativePath, mutate, action) {
  const target = path.join(fixtureRoot, relativePath);
  const original = await readFile(target);
  try {
    await writeFile(target, `${JSON.stringify(mutate(JSON.parse(original.toString("utf8"))))}\n`, "utf8");
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
  fixtureRoot = await realpath(await mkdtemp(path.join(os.tmpdir(), "bizq01-ood-cohort-13-")));
  await copyCurrentMigrationFixture(repositoryRoot, fixtureRoot);
});

after(async () => {
  await rm(fixtureRoot, { recursive: true, force: true });
});

test("accepts the current exact bank while validating the fixed source13 proof chain", async () => {
  const proof = JSON.parse(await readFile(path.join(fixtureRoot, proofPath), "utf8"));
  assert.equal(proof.contentVersion, "object-oriented-design-interview-authoring-v2026.10.03-bizq01-13");
  assert.equal(proof.replacements.length, 15);
  const result = await verifyMigration({ contentRoot: path.join(fixtureRoot, "content") });
  assert.equal(result.result, "passed");
  assert.equal(result.semanticReplacementProof.replacements.length, 664);
  assert.equal(result.sameIdCorrectionProof.questionIds.length, 749);
  assert.equal(result.counts.questions, 16622);
  assert.equal(result.historicalCounts.questions, 16041);
  assert.equal(result.tracks.find((track) => track.trackId === trackId).currentCounts.questions, 1413);
});

test("all fifteen new questions validate, score each option, and bind authored feedback to every distractor", async () => {
  const questions = JSON.parse(await readFile(path.join(repositoryRoot, sourcePath), "utf8"));
  const current = questions.filter((question) => replacementIds.includes(question.questionId));
  assert.equal(current.length, 15);
  assert.equal(questions.length, 17);
  assert.equal(questions.some((question) => historicalIds.includes(question.questionId)), false);
  for (const question of current) {
    assert.equal(validateQuestion(question).valid, true, question.questionId);
    assert.equal(question.interaction.options.length, 4, question.questionId);
    for (const option of question.interaction.options) {
      const score = scoreQuestion(question, { type: "choice_single", optionId: option.optionId });
      const accepted = option.optionId === question.answer.optionId;
      assert.equal(score.status, accepted ? "correct" : "incorrect", `${question.questionId}/${option.optionId}`);
      assert.equal(score.earnedPoints, accepted ? 1 : 0, `${question.questionId}/${option.optionId}`);
      if (!accepted) assert.equal(question.feedback.messages.filter((message) => message.targetId === option.optionId).length, 1);
    }
  }
});

test("requires the source13 proof and rejects modified cohort bindings and historical predecessor evidence", async () => {
  await withJsonMutation(proofPath, (proof) => { proof.contentVersion += "-stale"; return proof; }, () => assertRejected("EVIDENCE_VALUE"));
  const proofFile = path.join(fixtureRoot, proofPath);
  const original = await readFile(proofFile);
  try {
    await rm(proofFile);
    await assertRejected("EVIDENCE_MEMBERSHIP");
  } finally {
    await writeFile(proofFile, original);
  }
  await withJsonMutation(proofPath, (proof) => { proof.replacements[4].beforeQuestion.prompt += " changed"; return proof; }, () => assertRejected("HASH_MISMATCH"));
  await withJsonMutation(proofPath, (proof) => { proof.replacements[4].questionId = "ood-n01-b01-i099"; return proof; }, () => assertRejected("EVIDENCE_VALUE"));
  await withJsonMutation(proof12Path, (proof) => { proof.replacements[0].beforeQuestion.prompt += " changed"; return proof; }, () => assertRejected("HASH_MISMATCH"));
});

test("source13 directly requires both historical proofs and rejects changed, missing, or duplicate cohort membership", async () => {
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

  await withJsonMutation(sourcePath, (questions) => {
    questions.find((question) => question.questionId === "ood-n01-b01-i020").prompt += " changed";
    return questions;
  }, () => assertRejected("HASH_MISMATCH"));
  await withJsonMutation(proofPath, (proof) => {
    proof.replacements.pop();
    return proof;
  }, () => assertRejected("EVIDENCE_MEMBERSHIP"));
  await withJsonMutation(proofPath, (proof) => {
    proof.replacements[14] = structuredClone(proof.replacements[13]);
    return proof;
  }, () => assertRejected("EVIDENCE_VALUE"));
  await withJsonMutation(proofPath, (proof) => {
    proof.replacements.push(structuredClone(proof.replacements[14]));
    return proof;
  }, () => assertRejected("EVIDENCE_MEMBERSHIP"));
  await withJsonMutation(proofPath, (proof) => {
    proof.replacements[0].currentQuestion.prompt += " changed";
    return proof;
  }, () => assertRejected("EVIDENCE_MEMBERSHIP"));
  await withJsonMutation(sourcePath, (questions) => {
    questions.push(structuredClone(questions.find((question) => question.questionId === "ood-n01-b01-i020")));
    return questions;
  }, () => assertRejected("CANONICAL_ORDER"));
});

test("rejects unreviewed cohort fields, unrelated source changes, and symlinked source paths", async () => {
  await withJsonMutation(proofPath, (proof) => { proof.unreviewed = true; return proof; }, () => assertRejected("EVIDENCE_SHAPE"));
  await withJsonMutation(sourcePath, (questions) => {
    questions.find((question) => question.questionId === "ood-n01-b01-i018").prompt += " changed";
    return questions;
  }, () => assertRejected("HASH_MISMATCH"));

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
