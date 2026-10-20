import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const directory = "content/frontend-system-design-interview/security_privacy_authentication_and_untrusted_content";
const unitIds = [
  ...Array.from({ length: 18 }, (_, index) => `fesd-n09-b01-i${String(index + 101).padStart(3, "0")}`),
  ...Array.from({ length: 21 }, (_, index) => `fesd-n09-b02-i${String(index + 101).padStart(3, "0")}`),
  ...Array.from({ length: 21 }, (_, index) => `fesd-n09-b03-i${String(index + 101).padStart(3, "0")}`),
];
const expectedOrderingIds = new Set([
  "fesd-n09-b03-i103",
  "fesd-n09-b03-i104",
  "fesd-n09-b03-i107",
  "fesd-n09-b03-i119",
]);
const oldId = (id) => id.replace(/i(\d+)$/, (_, number) => `i${String(Number(number) - 100).padStart(3, "0")}`);
const retiredIds = [
  ...Array.from({ length: 18 }, (_, index) => `fesd-n09-b01-i${String(index + 1).padStart(3, "0")}`),
  ...Array.from({ length: 21 }, (_, index) => `fesd-n09-b02-i${String(index + 1).padStart(3, "0")}`),
  ...Array.from({ length: 21 }, (_, index) => `fesd-n09-b03-i${String(index + 1).padStart(3, "0")}`),
];
const feedback = (question, kind, targetId) => question.feedback.messages.find((message) => message.kind === kind && message.targetId === targetId);

async function readUnits() {
  const files = ["B01", "B02", "B03"].map((unit) => path.join(root, directory, `FESD-N09-${unit}.json`));
  return (await Promise.all(files.map(async (file) => JSON.parse(await readFile(file, "utf8"))))).flat();
}

test("the 60 scoped scenarios use new identities and satisfy the current source contract", async () => {
  const questions = await readUnits();
  assert.equal(questions.length, 60);
  assert.deepEqual(questions.map((question) => question.questionId).sort(), [...unitIds].sort());
  assert.equal(new Set(questions.map((question) => question.questionId)).size, 60);
  assert.ok(questions.every((question) => retiredIds.includes(oldId(question.questionId))));
  assert.equal(questions.some((question) => retiredIds.includes(question.questionId)), false);

  const counts = { choice_single: 0, ordering: 0, decision_matrix: 0 };
  for (const question of questions) {
    counts[question.interaction.type] += 1;
    assert.ok(retiredIds.includes(oldId(question.questionId)), question.questionId);
    assert.ok(question.prompt.length > 40, question.questionId);
    assert.ok(question.constraints.length > 0, question.questionId);
    assert.doesNotMatch(JSON.stringify(question), /Do not reduce|The accepted design must name|undefined evidence|client-authority, global-state, framework-first/);
    const result = validateQuestion(question);
    assert.equal(result.valid, true, `${question.questionId}: ${result.errors.join("; ")}`);
    assert.equal(scoreQuestion(question, question.answer).status, "correct", question.questionId);
    assert.ok(question.sourceRefs.length >= 2, question.questionId);
    assert.ok(question.feedback.reason.length > 15, question.questionId);
  }
  assert.deepEqual(counts, { choice_single: 50, ordering: 4, decision_matrix: 6 });
  assert.deepEqual(new Set(questions.filter((question) => question.interaction.type === "ordering").map((question) => question.questionId)), expectedOrderingIds);
});

test("choice distractors each score zero and keep feedback bound to the stable option ID after reordering", async () => {
  const questions = (await readUnits()).filter((question) => question.interaction.type === "choice_single");
  let correctIsLongest = 0;
  for (const question of questions) {
    const correctId = question.answer.optionId;
    const full = scoreQuestion(question, { type: "choice_single", optionId: correctId });
    assert.equal(full.earnedPoints, 1, question.questionId);
    const shuffled = structuredClone(question);
    shuffled.interaction.options.reverse();
    assert.equal(scoreQuestion(shuffled, { type: "choice_single", optionId: correctId }).status, "correct", question.questionId);

    const wrongOptions = question.interaction.options.filter((option) => option.optionId !== correctId);
    assert.equal(wrongOptions.length, 3, question.questionId);
    const correctText = question.interaction.options.find((option) => option.optionId === correctId).text;
    if (correctText.length === Math.max(...question.interaction.options.map((option) => option.text.length))) correctIsLongest += 1;
    for (const option of wrongOptions) {
      const scored = scoreQuestion(shuffled, { type: "choice_single", optionId: option.optionId });
      assert.equal(scored.status, "incorrect", `${question.questionId}: ${option.optionId}`);
      assert.equal(scored.earnedPoints, 0, `${question.questionId}: ${option.optionId}`);
      assert.ok(feedback(question, "wrong_option", option.optionId)?.text.length > 20, `${question.questionId}: ${option.optionId}`);
    }
    assert.equal(feedback(question, "wrong_option", correctId), undefined, `${question.questionId}: correct response has no wrong-option diagnosis`);
  }
  assert.ok(correctIsLongest < questions.length / 2, "Correct options should not systematically reveal the key by length");
});

test("ordering remains causally complete, starts in [2,0,3,1], and scores the authored three relations", async () => {
  const questions = (await readUnits()).filter((question) => question.interaction.type === "ordering");
  for (const question of questions) {
    const answer = question.answer.orderedElementIds;
    const shown = question.interaction.elements.map((element) => element.elementId);
    assert.deepEqual(shown, [answer[2], answer[0], answer[3], answer[1]], `${question.questionId}: initial exposure order`);
    const full = scoreQuestion(question, question.answer);
    assert.equal(full.status, "correct");
    assert.equal(full.earnedPoints, 3);
    assert.equal(new Set(question.feedback.details.causalRelations.map((entry) => entry.relation)).size, 3);
    for (let index = 0; index < answer.length - 1; index += 1) {
      const relation = `${answer[index]}->${answer[index + 1]}`;
      const message = feedback(question, "broken_relation", relation);
      assert.ok(message?.text.length > 20, `${question.questionId}: ${relation}`);
      const swapped = [...answer];
      [swapped[index], swapped[index + 1]] = [swapped[index + 1], swapped[index]];
      assert.ok(scoreQuestion(question, { type: "ordering", orderedElementIds: swapped }).earnedPoints < full.maxPoints, `${question.questionId}: ${relation}`);
    }
  }
});

test("decision matrices cover each dimension, invalid values, and current partial-credit behavior", async () => {
  const questions = (await readUnits()).filter((question) => question.interaction.type === "decision_matrix");
  for (const question of questions) {
    const dimensions = question.interaction.dimensions;
    const full = scoreQuestion(question, question.answer);
    assert.equal(full.status, "correct", question.questionId);
    assert.equal(full.earnedPoints, dimensions.length, question.questionId);

    const shuffled = structuredClone(question);
    shuffled.interaction.dimensions.reverse();
    for (const dimension of shuffled.interaction.dimensions) dimension.values.reverse();
    assert.equal(scoreQuestion(shuffled, question.answer).status, "correct", `${question.questionId}: shuffled presentation`);

    for (const dimension of dimensions) {
      const omitted = structuredClone(question.answer);
      delete omitted.selectedValueIdsByDimension[dimension.dimensionId];
      const omittedScore = scoreQuestion(question, omitted);
      assert.equal(omittedScore.status, "partial", `${question.questionId}: omitted ${dimension.dimensionId}`);
      assert.equal(omittedScore.earnedPoints, full.maxPoints - 1, `${question.questionId}: omitted ${dimension.dimensionId}`);
      assert.ok(feedback(question, "omitted_dimension", dimension.dimensionId)?.text.length > 20, question.questionId);

      for (const value of dimension.values.filter((candidate) => !dimension.acceptedValueIds.includes(candidate.valueId))) {
        const wrong = structuredClone(question.answer);
        wrong.selectedValueIdsByDimension[dimension.dimensionId] = [value.valueId];
        const wrongScore = scoreQuestion(question, wrong);
        assert.equal(wrongScore.status, "partial", `${question.questionId}: ${dimension.dimensionId}|${value.valueId}`);
        assert.equal(wrongScore.earnedPoints, full.maxPoints - 1, `${question.questionId}: ${dimension.dimensionId}|${value.valueId}`);
        assert.ok(feedback(question, "wrong_value", `${dimension.dimensionId}|${value.valueId}`)?.text.length > 20, question.questionId);
      }

      const invalid = structuredClone(question.answer);
      invalid.selectedValueIdsByDimension[dimension.dimensionId] = [`${dimension.dimensionId}_not_allowed`];
      const invalidScore = scoreQuestion(question, invalid);
      assert.equal(invalidScore.invalidResponse, true, `${question.questionId}: invalid value ID`);
      assert.equal(invalidScore.earnedPoints, 0, `${question.questionId}: invalid value ID`);
    }
  }
});
