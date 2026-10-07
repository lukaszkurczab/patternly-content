import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readFile, realpath, rename, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test, { after, before } from "node:test";

import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";
import { MigrationVerificationError, verifyMigration } from "../scripts/content/verify-migration.mjs";
import { restoreOodSource19aFixture } from "./ood-cohort16-historical-fixture.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const proofPath = "evidence/business-quality/bizq-01-ood-node-closure-19.json";
const contentRoot = path.join(repositoryRoot, "content");
const trackId = "object-oriented-design-interview";
const version = "object-oriented-design-interview-authoring-v2026.10.04-bizq01-19";
const units = ["B01", "B02", "B03", "B04", "B05", "B06", "B07", "B08", "B09"];
const sourceDirectory = "content/object-oriented-design-interview/relationships_composition_ownership_lifecycle_and_dependencies";
const oldProofs = [
  "evidence/business-quality/bizq-01-ood-node-closure-17.json",
  "evidence/business-quality/bizq-01-ood-node-closure-16.json",
  "evidence/business-quality/bizq-01-ood-unit-cohort-13.json",
  "evidence/business-quality/bizq-01-ood-source-12.json",
  "evidence/business-quality/bizq-01-ood-source-11.json"
];
let fixtureRoot;

async function copyProofs(destination) {
  await mkdir(path.join(destination, "evidence/business-quality"), { recursive: true });
  for (const name of [
    "bizq-01-besd-slice-01.json",
    "bizq-01-besd-seed-cohort-14.json",
    "bizq-01-coding-source-copy-04.json",
    "bizq-01-ood-source-11.json",
    "bizq-01-ood-source-12.json",
    "bizq-01-ood-unit-cohort-13.json",
    "bizq-01-ood-node-closure-16.json",
    "bizq-01-ood-node-closure-17.json",
    "bizq-01-ood-node-closure-19.json",
    "bizq-01-ood-reason-amendment-19a.json",
    "bizq-01-ood-node-closure-20.json",
    "bizq-01-ood-node-closure-21.json",
    "bizq-01-ood-node-closure-22.json",
    "bizq-01-ood-node-closure-23.json",
    "bizq-01-ood-node-closure-24.json",
  ]) {
    await cp(path.join(repositoryRoot, "evidence/business-quality", name), path.join(destination, "evidence/business-quality", name));
  }
  await cp(path.join(repositoryRoot, "evidence/canonical-content-approvals"), path.join(destination, "evidence/canonical-content-approvals"), { recursive: true });
}

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
  fixtureRoot = await realpath(await mkdtemp(path.join(os.tmpdir(), "bizq01-ood-closure-19-")));
  await cp(contentRoot, path.join(fixtureRoot, "content"), { recursive: true });
  await copyProofs(fixtureRoot);
  await restoreOodSource19aFixture(repositoryRoot, fixtureRoot);
});

after(async () => {
  await rm(fixtureRoot, { recursive: true, force: true });
});

test("accepts the fixed 162-item package and reconstructs the immutable v17→16→13→12→11 predecessor chain", async () => {
  const result = await verifyMigration({ contentRoot: path.join(fixtureRoot, "content") });
  assert.equal(result.result, "passed");
  assert.equal(result.reasonAmendmentProof.questionIds.length, 25);
  assert.deepEqual(result.semanticReplacementProof.replacements.slice(-162), units.flatMap((unit) =>
    Array.from({ length: 18 }, (_, index) => ({
      beforeQuestionId: `ood-n03-${unit.toLowerCase()}-i${String(index + 1).padStart(3, "0")}`,
      questionId: `ood-n03-${unit.toLowerCase()}-i${String(index + 19).padStart(3, "0")}`
    }))
  ));
  assert.equal(result.semanticReplacementProof.replacements.length, 450);
  assert.equal(result.counts.questions, 16622);
  assert.equal(result.historicalCounts.questions, 16041);
  assert.equal(result.tracks.find((track) => track.trackId === trackId).currentCounts.questions, 1413);
  for (const unit of units) {
    const questions = JSON.parse(await readFile(path.join(contentRoot, `${sourceDirectory.replace(/^content\//u, "")}/OOD-N03-${unit}.json`), "utf8"));
    assert.equal(questions.length, 18, unit);
    assert.deepEqual(questions.map((question) => question.questionId), Array.from({ length: 18 }, (_, index) => `ood-n03-${unit.toLowerCase()}-i${String(index + 19).padStart(3, "0")}`));
  }
});

test("validates, scores, and binds targeted feedback for every replacement option", async () => {
  const proof = JSON.parse(await readFile(path.join(repositoryRoot, proofPath), "utf8"));
  assert.equal(proof.contentVersion, version);
  assert.equal(proof.replacements.length, 162);
  for (const source of proof.sourceFiles) {
    const questions = JSON.parse(await readFile(path.join(repositoryRoot, source.sourceFile), "utf8"));
    assert.equal(questions.length, 18, source.mentalUnitId);
    for (const question of questions) {
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

test("requires every fixed OOD generation proof in the v19 predecessor chain", async () => {
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
  await withJsonMutation(proofPath, (proof) => { proof.replacements[0].identityAction = "preserve_question_id"; return proof; }, () => assertRejected("EVIDENCE_VALUE"));
  await withJsonMutation(proofPath, (proof) => { proof.replacements[0].identityReason = proof.identityReason; return proof; }, () => assertRejected("EVIDENCE_VALUE"));
  await withJsonMutation(proofPath, (proof) => { proof.replacements[0].currentQuestion.prompt += " changed"; return proof; }, () => assertRejected("EVIDENCE_MEMBERSHIP"));
  await withJsonMutation(proofPath, (proof) => { proof.contentVersion += "-wrong"; return proof; }, () => assertRejected("EVIDENCE_VALUE"));
  await withJsonMutation(proofPath, (proof) => { proof.sourceFiles[0].sourceSha256 = "0".repeat(64); return proof; }, () => assertRejected("EVIDENCE_VALUE"));
  await withJsonMutation(proofPath, (proof) => { proof.sourceFiles[0].sourceFile = "../other.json"; return proof; }, () => assertRejected("EVIDENCE_VALUE"));
  await withJsonMutation(proofPath, (proof) => { proof.replacements[0].questionId = "ood-n03-b02-i099"; return proof; }, () => assertRejected("EVIDENCE_VALUE"));
  await withJsonMutation(proofPath, (proof) => { proof.replacements[0].beforeQuestion.prompt += " changed"; return proof; }, () => assertRejected("HASH_MISMATCH"));
  await withJsonMutation(proofPath, (proof) => { proof.replacements[0].currentQuestion.prompt += " changed"; return proof; }, () => assertRejected("EVIDENCE_MEMBERSHIP"));
  await withJsonMutation(proofPath, (proof) => { proof.replacements[0].beforeQuestion = null; return proof; }, () => assertRejected("EVIDENCE_MEMBERSHIP"));
  await withJsonMutation(proofPath, (proof) => { proof.replacements.pop(); return proof; }, () => assertRejected("EVIDENCE_MEMBERSHIP"));
  await withJsonMutation(proofPath, (proof) => { proof.replacements[1] = structuredClone(proof.replacements[0]); return proof; }, () => assertRejected("EVIDENCE_VALUE"));
  await withJsonMutation(proofPath, (proof) => { proof.replacements.push(structuredClone(proof.replacements.at(-1))); return proof; }, () => assertRejected("EVIDENCE_MEMBERSHIP"));
});

test("rejects changed canonical source membership and unsupported catalog versions", async () => {
  const sourcePath = `${sourceDirectory}/OOD-N03-B02.json`;
  await withJsonMutation(sourcePath, (questions) => { questions[0].prompt += " changed"; return questions; }, () => assertRejected("HASH_MISMATCH"));
  await withJsonMutation(sourcePath, (questions) => { questions.push({ ...questions.at(-1), questionId: "ood-n03-b02-i039" }); return questions; }, () => assertRejected("HASH_MISMATCH"));
  await withJsonMutation("content/catalog.json", (catalog) => {
    catalog.tracks.find((track) => track.trackId === trackId).contentVersion = "object-oriented-design-interview-authoring-v2026.10.03-bizq01-15";
    return catalog;
  }, () => assertRejected("EVIDENCE_VALUE"));
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
  const target = path.join(fixtureRoot, `${sourceDirectory}/OOD-N03-B02.json`);
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
