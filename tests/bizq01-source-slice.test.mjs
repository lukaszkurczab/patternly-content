import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { buildTrack, canonicalJson, sha256 } from "../scripts/build.mjs";
import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";
import { createContentReviewConsole } from "../scripts/review/content-review-console.mjs";

const root = new URL("../", import.meta.url);
const source01 = JSON.parse(readFileSync(new URL("evidence/business-quality/bizq-01-besd-slice-01.json", root), "utf8"));
const batch = JSON.parse(readFileSync(new URL("evidence/business-quality/bizq-01-besd-seed-cohort-14.json", root), "utf8"));
const CURRENT_CONTENT_VERSION = "backend-system-design-interview-authoring-v2026.10.03-bizq01-14-bizq02-v2";
const sourceItems = batch.replacements.map((entry) => {
  const bytes = readFileSync(new URL(entry.sourceFile, root));
  assert.equal(sha256(bytes), entry.sourceSha256, "fixed cohort must bind the actual changed source");
  const questions = JSON.parse(bytes);
  assert.ok(!questions.some((question) => question.questionId === entry.beforeQuestionId), "replaced identities must not be aliased");
  const question = questions.find((question) => question.questionId === entry.questionId);
  assert.ok(question, entry.questionId);
  return { entry, question };
});
const acceptedSourceItems = source01.items.map((entry) => {
  const currentQuestions = JSON.parse(readFileSync(new URL(entry.sourceFile, root), "utf8"));
  const question = currentQuestions.find((item) => item.questionId === entry.questionId);
  assert.ok(question, entry.questionId);
  return { entry, question };
});

test("BIZQ-01 cohort14 preserves source01 as the exact accepted predecessor", () => {
  const sourcePaths = [...new Set(batch.replacements.map((entry) => entry.sourceFile))];
  for (const sourcePath of sourcePaths) {
    const group = batch.replacements.filter((entry) => entry.sourceFile === sourcePath);
    const currentQuestions = JSON.parse(readFileSync(new URL(sourcePath, root), "utf8"));
    const preservedId = sourcePath.includes("api_contracts_service_boundaries") ? "besd-n02-b01-i017" : "besd-n04-b01-i019";
    const preserved = currentQuestions.find((question) => question.questionId === preservedId);
    assert.ok(preserved, preservedId);
    const oldQuestions = group.map((entry) => entry.beforeQuestion).concat(preserved)
      .sort((left, right) => left.questionId.localeCompare(right.questionId));
    const predecessorBytes = Buffer.from(canonicalJson(oldQuestions), "utf8");
    assert.equal(sha256(predecessorBytes), group[0].beforeSourceSha256);
    const accepted = source01.items.find((item) => item.sourceFile === sourcePath);
    assert.ok(accepted, sourcePath);
    assert.equal(sha256(predecessorBytes), accepted.sourceSha256, "source01 hash applies to its reconstructed predecessor, never the active source14 file");
  }
});

test("BIZQ-01 preserves both accepted source01 objects and their scored, built, and projected behavior", async (t) => {
  assert.deepEqual(acceptedSourceItems.map(({ entry }) => entry.questionId), ["besd-n02-b01-i017", "besd-n04-b01-i019"]);
  for (const { entry, question } of acceptedSourceItems) {
    assert.equal(validateQuestion(question).valid, true, entry.questionId);
    assert.equal(question.mentalUnitId, entry.mentalUnitId);
    assert.equal(question.answer.optionId, entry.acceptedOptionId);
    assert.deepEqual(question.sourceRefs, entry.sourceRefs);
    const wrongIds = question.interaction.options.filter((option) => option.optionId !== question.answer.optionId).map((option) => option.optionId);
    assert.deepEqual(question.feedback.messages.map((message) => message.targetId).sort(), wrongIds.sort());
    for (const option of question.interaction.options) {
      const score = scoreQuestion(question, { type: "choice_single", optionId: option.optionId });
      assert.equal(score.status, option.optionId === question.answer.optionId ? "correct" : "incorrect");
      assert.equal(score.earnedPoints, option.optionId === question.answer.optionId ? 1 : 0);
    }
  }

  const outputRoot = await mkdtemp(join(tmpdir(), "patternly-bizq01-preserved-build-"));
  t.after(() => rm(outputRoot, { recursive: true, force: true }));
  const built = await buildTrack({ trackId: batch.trackId, outputRoot });
  for (const { entry, question } of acceptedSourceItems) {
    assert.deepEqual(built.artifact.questions.find((item) => item.questionId === entry.questionId), question);
    assert.ok(built.artifact.questions.some((item) => item.questionId === entry.questionId));
  }

  const directory = await mkdtemp(join(tmpdir(), "patternly-bizq01-preserved-review-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const service = await createContentReviewConsole({ reviewPath: join(directory, "outcomes.json") });
  for (const { entry } of acceptedSourceItems) {
    const item = service.getItem(batch.trackId, entry.questionId);
    assert.ok(item, entry.questionId);
    assert.equal(item.review.status, "unreviewed");
  }
});

test("BIZQ-01 changed items keep concrete learner constraints and one scoreable authored answer", () => {
  assert.equal(sourceItems.length, 32);
  for (const { entry, question } of sourceItems) {
    const validation = validateQuestion(question);
    assert.equal(validation.valid, true, validation.errors.join("\n"));
    assert.equal(question.mentalUnitId, entry.mentalUnitId);
    assert.equal(question.answer.optionId, entry.acceptedOptionId);
    assert.deepEqual(question.sourceRefs, entry.sourceRefs);
    assert.ok(question.constraints.every((constraint) => !/^\s*the\s+primary\s+decision\s+is\b/i.test(constraint)));
    assert.ok(question.constraints.every((constraint) => !constraint.includes(question.interaction.options.find((option) => option.optionId === question.answer.optionId).text)));
    const wrongIds = question.interaction.options.filter((option) => option.optionId !== question.answer.optionId).map((option) => option.optionId);
    assert.deepEqual(question.feedback.messages.map((message) => message.targetId).sort(), wrongIds.sort());
    assert.equal(new Set(question.feedback.messages.map((message) => message.text)).size, wrongIds.length);
    for (const option of question.interaction.options) {
      const score = scoreQuestion(question, { type: "choice_single", optionId: option.optionId });
      assert.equal(score.status, option.optionId === entry.acceptedOptionId ? "correct" : "incorrect");
      assert.equal(score.earnedPoints, option.optionId === entry.acceptedOptionId ? 1 : 0);
    }
    assert.equal(typeof question.feedback.details, "string");
    assert.ok(question.feedback.details.includes("\n\n"), "authored Details must explain mechanism and boundary");
  }
});

test("BIZQ-01 canonical builder carries the exact cohort and new content identity", async (t) => {
  const outputRoot = await mkdtemp(join(tmpdir(), "patternly-bizq01-build-"));
  t.after(() => rm(outputRoot, { recursive: true, force: true }));
  const built = await buildTrack({ trackId: batch.trackId, outputRoot });
  assert.equal(batch.contentVersion, "backend-system-design-interview-authoring-v2026.10.03-bizq01-14");
  assert.equal(built.artifact.contentVersion, CURRENT_CONTENT_VERSION);
  assert.equal(built.artifact.questions.length, 1569);
  assert.equal(sha256(canonicalJson(built.questions)), batch.questionSetSha256);
  for (const { entry, question } of sourceItems) {
    assert.deepEqual(built.artifact.questions.find((item) => item.questionId === entry.questionId), question);
    assert.ok(!built.artifact.questions.some((item) => item.questionId === entry.beforeQuestionId));
  }
  assert.equal(built.lockEntry.sha256, sha256(built.artifactBytes));
});

test("BIZQ-01 advisory console distinguishes corrected cohort from remaining warnings", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "patternly-bizq01-review-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const service = await createContentReviewConsole({ reviewPath: join(directory, "outcomes.json") });
  for (const { entry } of sourceItems) {
    const item = service.getItem(batch.trackId, entry.questionId);
    assert.ok(!item.riskFlags.includes("author_instruction_in_constraints"));
    assert.equal(item.review.status, "unreviewed", "a source repair does not fabricate review outcomes");
  }
  assert.ok(service.listItems({ trackId: batch.trackId, riskOnly: true }).length > 0, "unreviewed remainder must not be hidden");
});
