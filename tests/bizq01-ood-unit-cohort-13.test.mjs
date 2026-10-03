import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readFile, realpath, rename, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test, { after, before } from "node:test";

import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";
import { MigrationVerificationError, verifyMigration } from "../scripts/content/verify-migration.mjs";
import { restoreOodSource13Fixture } from "./ood-cohort16-historical-fixture.mjs";

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
  await cp(path.join(repositoryRoot, "content"), path.join(fixtureRoot, "content"), { recursive: true });
  await mkdir(path.join(fixtureRoot, "evidence", "business-quality"), { recursive: true });
  for (const name of [
    "bizq-01-besd-slice-01.json",
    "bizq-01-besd-seed-cohort-14.json",
    "bizq-01-coding-source-copy-04.json",
    "bizq-01-ood-source-11.json",
    "bizq-01-ood-source-12.json",
    "bizq-01-ood-unit-cohort-13.json",
    "bizq-01-ood-node-closure-16.json"
  ]) {
    await cp(path.join(repositoryRoot, "evidence/business-quality", name), path.join(fixtureRoot, "evidence/business-quality", name));
  }
  await cp(path.join(repositoryRoot, "evidence/canonical-content-approvals"), path.join(fixtureRoot, "evidence/canonical-content-approvals"), { recursive: true });
  await restoreOodSource13Fixture(repositoryRoot, fixtureRoot);
});

after(async () => {
  await rm(fixtureRoot, { recursive: true, force: true });
});

test("validates the fixed source13 cohort and reconstructs immutable source12 and source11 predecessors", async () => {
  const result = await verifyMigration({ contentRoot: path.join(fixtureRoot, "content") });
  assert.equal(result.result, "passed");
  assert.deepEqual(result.semanticReplacementProof.replacements, [
    { beforeQuestionId: "ood-n01-b01-i001", questionId: "ood-n01-b01-i018" },
    { beforeQuestionId: "ood-n01-b01-i002", questionId: "ood-n01-b01-i019" },
    ...historicalIds.map((beforeQuestionId, index) => ({ beforeQuestionId, questionId: replacementIds[index] }))
  ]);
  assert.equal(result.counts.questions, 16077);
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
