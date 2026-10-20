import assert from "node:assert/strict";
import test from "node:test";
import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";
import { loadCurrentQuestionBank } from "./helpers/current-question-bank.mjs";

const trackId = "frontend-system-design-interview";
const bank = await loadCurrentQuestionBank(trackId);
const assigned = ["b04", "b05", "b07"].flatMap((block) =>
  [...bank.byId.values()].filter((question) => question.questionId.startsWith(`fesd-n09-${block}-`))
);
const preservedIds = new Set([
  "fesd-n09-b05-i002",
  "fesd-n09-b05-i017",
  "fesd-n09-b07-i014",
]);
const oldIds = [
  ...Array.from({ length: 20 }, (_, index) => `fesd-n09-b04-i${String(index + 1).padStart(3, "0")}`),
  ...Array.from({ length: 20 }, (_, index) => `fesd-n09-b05-i${String(index + 1).padStart(3, "0")}`),
  ...Array.from({ length: 19 }, (_, index) => `fesd-n09-b07-i${String(index + 1).padStart(3, "0")}`),
];
const successorId = (oldId) => {
  if (preservedIds.has(oldId)) return oldId;
  const match = oldId.match(/^(fesd-n09-b\d\d-i)(\d{3})$/);
  return `${match[1]}${String(Number(match[2]) + 100).padStart(3, "0")}`;
};
const expectedIds = oldIds.map(successorId).sort();
const messageTargets = (question, kind) => question.feedback.messages
  .filter((message) => message.kind === kind)
  .map((message) => message.targetId);

test("the assigned N09 objects have collision-free successors or preserve their reviewed identity", () => {
  assert.equal(oldIds.length, 59);
  assert.equal(new Set(expectedIds).size, 59);
  assert.equal(assigned.length, 59);
  assert.deepEqual(assigned.map((question) => question.questionId).sort(), expectedIds);
  for (const oldId of oldIds) {
    if (!preservedIds.has(oldId)) assert.equal(bank.byId.has(oldId), false, `${oldId} is retired`);
  }
  assert.equal(new Set([...bank.byId.keys()]).size, bank.byId.size, "all current track IDs are unique");
});

test("each assigned question validates and carries only scenario-relevant content", () => {
  for (const question of assigned) {
    assert.equal(validateQuestion(question).valid, true, question.questionId);
    assert.ok(question.constraints.length > 0, `${question.questionId}: scenario constraints exist`);
    assert.ok(question.sourceRefs.length > 0, `${question.questionId}: primary references exist`);
    assert.ok(question.feedback.reason.length > 0, `${question.questionId}: reason exists`);
    assert.ok(question.feedback.details.errorCorrection.length > 0, `${question.questionId}: correction exists`);
    assert.ok(question.feedback.messages.every((message) => message.text.trim()), `${question.questionId}: messages are specific non-empty text`);
    assert.doesNotMatch(question.prompt, /For (?:Authentication flows|Authorization visibility versus server-side enforcement|Privacy, telemetry, consent, minimization, and data retention),/i, `${question.questionId}: prompt does not append a generated unit title`);
    assert.doesNotMatch(question.prompt, /For (?:Authentication flows|Authorization visibility|Privacy, telemetry).*?(?:order the steps so each action has the evidence and authority it needs|which decision best preserves the stated contract|select one value in each dimension)\.$/i, `${question.questionId}: prompt does not append generic unit scaffolding`);
    const serialized = JSON.stringify(question);
    assert.doesNotMatch(serialized, /Do not reduce .* to terminology recall|The accepted design must name ownership|undefined evidence|client-authority, global-state, framework-first/i, question.questionId);
  }
});

test("single-choice decisions have one scored answer and ID-stable feedback after option reordering", () => {
  const questions = assigned.filter((question) => question.interaction.type === "choice_single");
  assert.equal(questions.length, 18);
  let uniquelyLongestAnswers = 0;
  for (const question of questions) {
    const answerId = question.answer.optionId;
    const positive = scoreQuestion(question, question.answer);
    assert.equal(positive.status, "correct", question.questionId);
    assert.equal(positive.earnedPoints, positive.maxPoints, question.questionId);

    const wrongOptions = question.interaction.options.filter((option) => option.optionId !== answerId);
    assert.equal(wrongOptions.length, 4, question.questionId);
    const answerLength = question.interaction.options.find((option) => option.optionId === answerId).text.length;
    if (answerLength === Math.max(...question.interaction.options.map((option) => option.text.length))) uniquelyLongestAnswers++;
    assert.deepEqual(messageTargets(question, "wrong_option").sort(), wrongOptions.map((option) => option.optionId).sort(), question.questionId);
    for (const option of question.interaction.options) {
      const response = { type: "choice_single", optionId: option.optionId };
      const expected = option.optionId === answerId ? "correct" : "incorrect";
      assert.equal(scoreQuestion(question, response).status, expected, `${question.questionId}/${option.optionId}`);
      const reordered = { ...question, interaction: { ...question.interaction, options: [...question.interaction.options].reverse() } };
      assert.equal(scoreQuestion(reordered, response).status, expected, `${question.questionId}/${option.optionId} after reorder`);
    }
  }
  assert.ok(uniquelyLongestAnswers <= Math.floor(questions.length / 2), "the correct option is not systematically the uniquely longest");
});

test("ordering answers remain correct while source presentation hides the answer and each causal edge is scored", () => {
  const questions = assigned.filter((question) => question.interaction.type === "ordering");
  assert.equal(questions.length, 21);
  for (const question of questions) {
    const answer = question.answer.orderedElementIds;
    const sourceOrder = question.interaction.elements.map((element) => element.elementId);
    assert.deepEqual(sourceOrder, [answer[2], answer[0], answer[3], answer[1]], question.questionId);
    assert.notDeepEqual(sourceOrder, answer, question.questionId);

    const positive = scoreQuestion(question, question.answer);
    assert.equal(positive.status, "correct", question.questionId);
    assert.equal(positive.earnedPoints, 3, question.questionId);
    assert.equal(positive.maxPoints, 3, question.questionId);
    const relations = answer.slice(0, -1).map((elementId, index) => `${elementId}->${answer[index + 1]}`);
    assert.deepEqual(messageTargets(question, "broken_relation").sort(), relations.slice().sort(), question.questionId);
    for (let index = 0; index < relations.length; index++) {
      const swapped = [...answer];
      [swapped[index], swapped[index + 1]] = [swapped[index + 1], swapped[index]];
      const result = scoreQuestion(question, { type: "ordering", orderedElementIds: swapped });
      assert.notEqual(result.status, "correct", `${question.questionId}/${relations[index]} must be broken by its adjacent swap`);
      assert.ok(result.brokenRelations.includes(relations[index]), `${question.questionId}/${relations[index]} has targeted feedback`);
    }
    const invalid = scoreQuestion(question, { type: "ordering", orderedElementIds: [...answer.slice(1), "unknown"] });
    assert.equal(invalid.invalidResponse, true, question.questionId);
  }
});

test("decision matrices score each scenario dimension independently and reject missing or invalid values", () => {
  const questions = assigned.filter((question) => question.interaction.type === "decision_matrix");
  assert.equal(questions.length, 20);
  for (const question of questions) {
    const dimensions = question.interaction.dimensions;
    assert.equal(dimensions.length, 3, question.questionId);
    const positive = scoreQuestion(question, question.answer);
    assert.equal(positive.status, "correct", question.questionId);
    assert.equal(positive.earnedPoints, 3, question.questionId);

    const omittedTargets = messageTargets(question, "omitted_dimension").sort();
    assert.deepEqual(omittedTargets, dimensions.map((dimension) => dimension.dimensionId).sort(), question.questionId);
    for (const dimension of dimensions) {
      const acceptedId = question.answer.selectedValueIdsByDimension[dimension.dimensionId][0];
      const wrongValues = dimension.values.filter((value) => value.valueId !== acceptedId);
      assert.equal(wrongValues.length, 2, `${question.questionId}/${dimension.dimensionId}`);
      for (const value of wrongValues) {
        const response = structuredClone(question.answer);
        response.selectedValueIdsByDimension[dimension.dimensionId] = [value.valueId];
        const result = scoreQuestion(question, response);
        assert.equal(result.status, "partial", `${question.questionId}/${dimension.dimensionId}/${value.valueId}`);
        assert.equal(result.earnedPoints, 2, `${question.questionId}/${dimension.dimensionId}/${value.valueId}`);
        const target = `${dimension.dimensionId}|${value.valueId}`;
        assert.ok(messageTargets(question, "wrong_value").includes(target), `${question.questionId}/${dimension.dimensionId}/${value.valueId} has targeted feedback`);
        const correction = question.feedback.messages.find((message) => message.kind === "wrong_value" && message.targetId === target)?.text;
        assert.ok(correction && correction.length > value.text.length, `${question.questionId}/${target} explains the concrete failure`);
        assert.doesNotMatch(correction, /does not meet .*requirement|not meeting requirements/i, `${question.questionId}/${target} is not a generic wrong-value stub`);
      }

      const omitted = structuredClone(question.answer);
      delete omitted.selectedValueIdsByDimension[dimension.dimensionId];
      const omittedResult = scoreQuestion(question, omitted);
      assert.equal(omittedResult.status, "partial", `${question.questionId}/${dimension.dimensionId} omitted`);
      assert.ok(omittedResult.missingDimensionIds.includes(dimension.dimensionId));

      const invalid = structuredClone(question.answer);
      invalid.selectedValueIdsByDimension[dimension.dimensionId] = ["unknown_value"];
      assert.equal(scoreQuestion(question, invalid).invalidResponse, true, `${question.questionId}/${dimension.dimensionId} invalid`);
    }
  }
});
