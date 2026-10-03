import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, realpath, rename, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test, { after, before } from "node:test";

import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";
import { MigrationVerificationError, verifyMigration } from "../scripts/content/verify-migration.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const trackId = "object-oriented-design-interview";
const proofPath = "evidence/business-quality/bizq-01-ood-source-11.json";
const sourcePath = "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries/OOD-N01-B01.json";
const questionId = "ood-n01-b01-i018";
const removedQuestionId = "ood-n01-b01-i001";
let fixtureRoot;

async function writeJson(relativePath, value) {
  await writeFile(path.join(fixtureRoot, relativePath), `${JSON.stringify(value)}\n`, "utf8");
}

async function withJsonMutation(relativePath, mutate, action) {
  const target = path.join(fixtureRoot, relativePath);
  const original = await readFile(target);
  try {
    const value = JSON.parse(original.toString("utf8"));
    await writeJson(relativePath, mutate(value));
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
  fixtureRoot = await realpath(await mkdtemp(path.join(os.tmpdir(), "bizq01-ood-source-11-")));
  await cp(path.join(repositoryRoot, "content"), path.join(fixtureRoot, "content"), { recursive: true });
  await mkdir(path.join(fixtureRoot, "evidence", "business-quality"), { recursive: true });
  for (const name of [
    "bizq-01-besd-slice-01.json",
    "bizq-01-coding-source-copy-04.json",
    "bizq-01-ood-source-11.json"
  ]) {
    await cp(path.join(repositoryRoot, "evidence", "business-quality", name), path.join(fixtureRoot, "evidence", "business-quality", name));
  }
  await cp(path.join(repositoryRoot, "evidence", "canonical-content-approvals"), path.join(fixtureRoot, "evidence", "canonical-content-approvals"), { recursive: true });

  // Reconstruct source12 from the cohort13 frozen objects, then source11 from
  // the reviewed source12 proof. This keeps the historical fixture exact.
  const source13Proof = JSON.parse(await readFile(path.join(repositoryRoot, "evidence/business-quality/bizq-01-ood-unit-cohort-13.json"), "utf8"));
  const source12Proof = JSON.parse(await readFile(path.join(repositoryRoot, "evidence/business-quality/bizq-01-ood-source-12.json"), "utf8"));
  const sourceFile = path.join(fixtureRoot, sourcePath);
  const sourceQuestions = JSON.parse(await readFile(sourceFile, "utf8"));
  const source12Questions = sourceQuestions
    .filter((question) => !source13Proof.replacements.some((replacement) => replacement.questionId === question.questionId))
    .concat(source13Proof.replacements.map((replacement) => replacement.beforeQuestion))
    .sort((left, right) => left.questionId.localeCompare(right.questionId));
  const source11Questions = source12Questions
    .filter((question) => question.questionId !== source12Proof.replacements[0].questionId)
    .concat(source12Proof.replacements[0].beforeQuestion)
    .sort((left, right) => left.questionId.localeCompare(right.questionId));
  await writeFile(sourceFile, `${JSON.stringify(source11Questions)}\n`, "utf8");
  const catalogPath = path.join(fixtureRoot, "content/catalog.json");
  const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
  catalog.tracks.find((track) => track.trackId === trackId).contentVersion = "object-oriented-design-interview-authoring-v2026.10.03-bizq01-11";
  await writeFile(catalogPath, `${JSON.stringify(catalog)}\n`, "utf8");
});

after(async () => {
  await rm(fixtureRoot, { recursive: true, force: true });
});

test("accepts the exact OOD source11 replacement and retains historical inventory", async () => {
  const result = await verifyMigration({ contentRoot: path.join(fixtureRoot, "content") });
  assert.equal(result.result, "passed");
  assert.equal(result.semanticReplacementProof.trackId, trackId);
  assert.deepEqual(result.semanticReplacementProof.replacements, [
    { beforeQuestionId: removedQuestionId, questionId }
  ]);
  assert.equal(result.counts.questions, 16077);
  assert.equal(result.historicalCounts.questions, 16041);
  assert.equal(result.approvedAdditionCount, 36);
  assert.equal(result.tracks.find((track) => track.trackId === trackId).currentCounts.questions, 1413);
});

test("replacement uses the authored single-choice scoring and feedback contract", async () => {
  const source = JSON.parse(await readFile(path.join(fixtureRoot, sourcePath), "utf8"));
  const historicalSource = JSON.parse(execFileSync("git", ["show", `570eb490eaf194fa61ad380155cfd16c0377aaf2:${sourcePath}`], { cwd: repositoryRoot, encoding: "utf8" }));
  const question = source.find((item) => item.questionId === questionId);
  assert.deepEqual(source.filter((item) => item.questionId !== questionId), historicalSource.filter((item) => item.questionId !== removedQuestionId));
  assert.ok(question);
  assert.equal(source.length, 17);
  assert.equal(source.some((item) => item.questionId === removedQuestionId), false);
  assert.equal(question.mentalUnitId, "OOD-N01-B01");
  assert.equal(question.interaction.type, "choice_single");
  assert.equal(question.interaction.scoringMethod, "exact_selected_set");
  assert.equal(validateQuestion(question).valid, true);
  const accepted = question.answer.optionId;
  for (const option of question.interaction.options) {
    const score = scoreQuestion(question, { type: "choice_single", optionId: option.optionId });
    assert.equal(score.status, option.optionId === accepted ? "correct" : "incorrect");
    assert.equal(score.earnedPoints, option.optionId === accepted ? 1 : 0);
    if (option.optionId !== accepted) {
      assert.equal(question.feedback.messages.filter((message) => message.targetId === option.optionId).length, 1);
    }
  }
});

test("rejects the replacement when its fixed proof is absent", async () => {
  const target = path.join(fixtureRoot, proofPath);
  const original = await readFile(target);
  try {
    await rm(target);
    await assert.rejects(verifyMigration({ contentRoot: path.join(fixtureRoot, "content") }), (error) => {
      assert.ok(error instanceof MigrationVerificationError);
      assert.equal(error.code, "EVIDENCE_MEMBERSHIP");
      return true;
    });
  } finally {
    await writeFile(target, original);
  }
});

test("rejects a tampered frozen question and a changed current replacement", async () => {
  await withJsonMutation(proofPath, (proof) => {
    proof.replacements[0].beforeQuestion.prompt += " changed";
    return proof;
  }, () => assertRejected("HASH_MISMATCH"));
  await withJsonMutation(sourcePath, (questions) => {
    questions.find((question) => question.questionId === questionId).prompt += " changed";
    return questions;
  }, () => assertRejected("HASH_MISMATCH"));
});

test("rejects stale catalog or track hashes, duplicate mappings, and an absent new item", async () => {
  await withJsonMutation("content/catalog.json", (catalog) => {
    catalog.tracks.find((track) => track.trackId === trackId).contentVersion = "stale-version";
    return catalog;
  }, () => assertRejected("EVIDENCE_VALUE"));
  await withJsonMutation(proofPath, (proof) => {
    proof.questionSetSha256 = "0".repeat(64);
    return proof;
  }, () => assertRejected("EVIDENCE_VALUE"));
  await withJsonMutation(proofPath, (proof) => {
    proof.replacements.push(structuredClone(proof.replacements[0]));
    return proof;
  }, () => assertRejected("EVIDENCE_MEMBERSHIP"));
  await withJsonMutation(sourcePath, (questions) => questions.filter((question) => question.questionId !== questionId),
    () => assertRejected("HASH_MISMATCH"));
  const proof = JSON.parse(await readFile(path.join(fixtureRoot, proofPath), "utf8"));
  await withJsonMutation(sourcePath, (questions) => [...questions, proof.replacements[0].beforeQuestion]
    .sort((left, right) => left.questionId === right.questionId ? 0 : left.questionId < right.questionId ? -1 : 1),
  () => assertRejected("HASH_MISMATCH"));
});

test("rejects changes to an unaffected OOD item and unapproved proof fields", async () => {
  await withJsonMutation(sourcePath, (questions) => {
    questions.find((question) => question.questionId === "ood-n01-b01-i003").prompt += " changed";
    return questions;
  }, () => assertRejected("HASH_MISMATCH"));
  await withJsonMutation(proofPath, (proof) => {
    proof.unreviewed = true;
    return proof;
  }, () => assertRejected("EVIDENCE_SHAPE"));
  await withJsonMutation(proofPath, (proof) => {
    proof.replacements[0].currentQuestion.answer.optionId = "meter_actor";
    return proof;
  }, () => assertRejected("HASH_MISMATCH"));
});

test("rejects an unapproved proof source path and a physically relocated source file", async () => {
  await withJsonMutation(proofPath, (proof) => {
    proof.replacements[0].sourceFile = "content/catalog.json";
    return proof;
  }, () => assertRejected("EVIDENCE_VALUE"));

  const original = path.join(fixtureRoot, sourcePath);
  const moved = path.join(path.dirname(original), "OOD-N01-B01-renamed.json");
  await rename(original, moved);
  try {
    await assertRejected("CANONICAL_MEMBERSHIP");
  } finally {
    await rename(moved, original);
  }
});
