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
const proofPath = "evidence/business-quality/bizq-01-ood-node-closure-16.json";
const trackId = "object-oriented-design-interview";
const version = "object-oriented-design-interview-authoring-v2026.10.03-bizq01-16";
const sourceDirectory = "content/object-oriented-design-interview/requirements_use_cases_domain_vocabulary_and_model_boundaries";
const oldProofs = [
  "evidence/business-quality/bizq-01-ood-unit-cohort-13.json",
  "evidence/business-quality/bizq-01-ood-source-12.json",
  "evidence/business-quality/bizq-01-ood-source-11.json"
];
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
  fixtureRoot = await realpath(await mkdtemp(path.join(os.tmpdir(), "bizq01-ood-closure-16-")));
  await copyCurrentMigrationFixture(repositoryRoot, fixtureRoot);
});

after(async () => {
  await rm(fixtureRoot, { recursive: true, force: true });
});

test("accepts the current exact bank while validating the fixed v16 proof in its predecessor chain", async () => {
  const proof = JSON.parse(await readFile(path.join(repositoryRoot, proofPath), "utf8"));
  assert.equal(proof.contentVersion, version);
  assert.equal(proof.replacements.length, 119);
  const result = await verifyMigration({ contentRoot: path.join(fixtureRoot, "content") });
  assert.equal(result.result, "passed");
  assert.equal(result.semanticReplacementProof.replacements.length, 664);
  assert.equal(result.sameIdCorrectionProof.questionIds.length, 749);
  assert.equal(result.reasonAmendmentProof.questionIds.length, 25);
  assert.equal(result.counts.questions, 16622);
  assert.equal(result.historicalCounts.questions, 16041);
  assert.equal(result.tracks.find((track) => track.trackId === trackId).currentCounts.questions, 1413);
});

test("validates, scores, and binds targeted feedback for every replacement option", async () => {
  const proof = JSON.parse(await readFile(path.join(repositoryRoot, proofPath), "utf8"));
  assert.equal(proof.replacements.length, 119);
  for (const source of proof.sourceFiles) {
    for (const question of proof.replacements.filter((item) => item.sourceFile === source.sourceFile).map((item) => item.currentQuestion)) {
      assert.equal(validateQuestion(question).valid, true, question.questionId);
      assert.equal(question.prompt.includes("_a"), false, `${question.questionId} prompt has no authoring placeholder`);
      const optionIds = question.interaction.options.map((option) => option.optionId);
      assert.equal(new Set(optionIds).size, optionIds.length, question.questionId);
      const expectedWrong = optionIds.filter((optionId) => optionId !== question.answer.optionId).sort();
      assert.deepEqual(question.feedback.messages.filter((message) => message.kind === "wrong_option").map((message) => message.targetId).sort(), expectedWrong, question.questionId);
      assert.equal(question.feedback.messages.some((message) => message.targetId === question.answer.optionId), false, question.questionId);
      for (const optionId of optionIds) {
        const accepted = optionId === question.answer.optionId;
        for (const candidate of [question, { ...question, interaction: { ...question.interaction, options: [...question.interaction.options].reverse() } }]) {
          const score = scoreQuestion(candidate, { type: "choice_single", optionId });
          assert.equal(score.status, accepted ? "correct" : "incorrect", `${question.questionId}/${optionId}`);
          assert.equal(score.earnedPoints, accepted ? 1 : 0, `${question.questionId}/${optionId}`);
        }
      }
    }
  }
});

test("requires every fixed OOD generation proof in the v16 predecessor chain", async () => {
  for (const relativePath of [proofPath, ...oldProofs]) {
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

test("rejects changed identities, hashes, object bindings, membership, and unsupported fields", async () => {
  await withJsonMutation(proofPath, (proof) => { proof.extraField = true; return proof; }, () => assertRejected("EVIDENCE_SHAPE"));
  await withJsonMutation(proofPath, (proof) => { proof.contentVersion += "-wrong"; return proof; }, () => assertRejected("EVIDENCE_VALUE"));
  await withJsonMutation(proofPath, (proof) => { proof.sourceFiles[0].sourceSha256 = "0".repeat(64); return proof; }, () => assertRejected("EVIDENCE_VALUE"));
  await withJsonMutation(proofPath, (proof) => { proof.sourceFiles[0].sourceFile = "../other.json"; return proof; }, () => assertRejected("EVIDENCE_VALUE"));
  await withJsonMutation(proofPath, (proof) => { proof.replacements[0].questionId = "ood-n01-b02-i099"; return proof; }, () => assertRejected("EVIDENCE_VALUE"));
  await withJsonMutation(proofPath, (proof) => { proof.replacements[0].beforeQuestion.prompt += " changed"; return proof; }, () => assertRejected("HASH_MISMATCH"));
  await withJsonMutation(proofPath, (proof) => { proof.replacements[0].currentQuestion.prompt += " changed"; return proof; }, () => assertRejected("EVIDENCE_MEMBERSHIP"));
  await withJsonMutation(proofPath, (proof) => { proof.replacements[0].beforeQuestion = null; return proof; }, () => assertRejected("EVIDENCE_MEMBERSHIP"));
  await withJsonMutation(proofPath, (proof) => { proof.replacements.pop(); return proof; }, () => assertRejected("EVIDENCE_MEMBERSHIP"));
  await withJsonMutation(proofPath, (proof) => { proof.replacements[1] = structuredClone(proof.replacements[0]); return proof; }, () => assertRejected("EVIDENCE_VALUE"));
  await withJsonMutation(proofPath, (proof) => { proof.replacements.push(structuredClone(proof.replacements.at(-1))); return proof; }, () => assertRejected("EVIDENCE_MEMBERSHIP"));
});

test("rejects changed source membership and accepts policy-only catalog versions", async () => {
  const sourcePath = `${sourceDirectory}/OOD-N01-B02.json`;
  await withJsonMutation(sourcePath, (questions) => { questions[0].prompt += " changed"; return questions; }, () => assertRejected("HASH_MISMATCH"));
  await withJsonMutation(sourcePath, (questions) => { questions.push({ ...questions.at(-1), questionId: "ood-n01-b02-i035" }); return questions; }, () => assertRejected("HASH_MISMATCH"));
  await withJsonMutation("content/catalog.json", (catalog) => {
    catalog.tracks.find((track) => track.trackId === trackId).contentVersion = "object-oriented-design-interview-authoring-v2026.10.03-bizq01-15";
    return catalog;
  }, async () => assert.equal((await verifyMigration({ contentRoot: path.join(fixtureRoot, "content") })).result, "passed"));
});

test("rejects a symlinked fixed proof path", async () => {
  const target = path.join(fixtureRoot, proofPath);
  const backup = `${target}.held`;
  await rename(target, backup);
  try {
    await symlink(path.basename(backup), target);
    await assertRejected("SYMLINK_PATH");
  } finally {
    await rm(target, { force: true });
    await rename(backup, target);
  }
});

test("rejects a symlinked current source path", async () => {
  const target = path.join(fixtureRoot, `${sourceDirectory}/OOD-N01-B02.json`);
  const backup = `${target}.held`;
  await rename(target, backup);
  try {
    await symlink(path.basename(backup), target);
    await assertRejected("SYMLINK_PATH");
  } finally {
    await rm(target, { force: true });
    await rename(backup, target);
  }
});
