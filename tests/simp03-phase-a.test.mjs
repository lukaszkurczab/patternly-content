import assert from "node:assert/strict";
import test from "node:test";

import {
  loadCanonicalFixture,
  scoreQuestion,
  validateQuestion
} from "../scripts/content/question-contract.mjs";

const { fixture } = loadCanonicalFixture();
const questionsByType = new Map(fixture.questions.map((question) => [question.interaction.type, question]));

function clone(value) {
  return structuredClone(value);
}

function referenceScore(question, response) {
  const type = question.interaction.type;
  if (type === "choice_single") {
    const valid = response?.type === type && Object.keys(response).every((key) => ["type", "optionId"].includes(key));
    return { earnedPoints: valid && response.optionId === question.answer.optionId ? 1 : 0, maxPoints: 1 };
  }
  if (type === "choice_multiple") {
    const options = question.interaction.options.map((option) => option.optionId);
    const selected = response?.optionIds;
    if (response?.type !== type || !Array.isArray(selected) || new Set(selected).size !== selected.length || selected.some((id) => !options.includes(id))) return { earnedPoints: 0, maxPoints: options.length };
    const selectedSet = new Set(selected);
    const accepted = new Set(question.answer.optionIds);
    const earnedPoints = options.filter((id) => selectedSet.has(id) === accepted.has(id)).length;
    return { earnedPoints, maxPoints: options.length };
  }
  if (type === "ordering") {
    const expected = question.answer.orderedElementIds;
    const selected = response?.orderedElementIds;
    const expectedRelations = new Set(expected.slice(0, -1).map((id, index) => `${id}->${expected[index + 1]}`));
    const actualRelations = Array.isArray(selected) ? selected.slice(0, -1).map((id, index) => `${id}->${selected[index + 1]}`) : [];
    return { earnedPoints: actualRelations.filter((relation) => expectedRelations.has(relation)).length, maxPoints: expectedRelations.size };
  }
  const acceptedByDimension = new Map(question.interaction.dimensions.map((dimension) => [dimension.dimensionId, new Set(dimension.acceptedValueIds)]));
  const selections = response?.selectedValueIdsByDimension ?? {};
  let earnedPoints = 0;
  for (const dimension of question.interaction.dimensions) {
    const selected = selections[dimension.dimensionId];
    if (!Array.isArray(selected)) continue;
    const aliases = type === "complexity" ? (dimension.aliases ?? {}) : {};
    const normalized = selected.map((valueId) => aliases[valueId] ?? valueId);
    const accepted = acceptedByDimension.get(dimension.dimensionId);
    if (normalized.length === accepted.size && normalized.every((valueId) => accepted.has(valueId))) earnedPoints += 1;
  }
  return { earnedPoints, maxPoints: question.interaction.dimensions.length };
}

function assertMatchesReference(question, response) {
  const actual = scoreQuestion(question, response);
  const expected = referenceScore(question, response);
  assert.equal(actual.earnedPoints, expected.earnedPoints);
  assert.equal(actual.maxPoints, expected.maxPoints);
  assert.equal(actual.status, expected.earnedPoints === expected.maxPoints ? "correct" : expected.earnedPoints > 0 ? "partial" : "incorrect");
}

test("oracle covers every single-choice option", () => {
  const question = questionsByType.get("choice_single");
  for (const option of question.interaction.options) assertMatchesReference(question, { type: "choice_single", optionId: option.optionId });
});

test("oracle covers every multiple-choice subset, including empty and all-selected", () => {
  const question = questionsByType.get("choice_multiple");
  const options = question.interaction.options.map((option) => option.optionId);
  for (let mask = 0; mask < 2 ** options.length; mask += 1) {
    const selected = options.filter((_, index) => (mask & (1 << index)) !== 0);
    assertMatchesReference(question, { type: "choice_multiple", optionIds: selected });
  }
});

test("oracle freezes adjacent-relation ordering semantics", () => {
  const question = questionsByType.get("ordering");
  const canonical = question.answer.orderedElementIds;
  const reverse = [...canonical].reverse();
  const adjacentSwap = [...canonical];
  [adjacentSwap[1], adjacentSwap[2]] = [adjacentSwap[2], adjacentSwap[1]];
  for (const orderedElementIds of [canonical, reverse, adjacentSwap, canonical.slice(0, -1)]) {
    assertMatchesReference(question, { type: "ordering", orderedElementIds });
  }
});

test("oracle covers accepted, wrong, alias and missing dimension values", () => {
  const complexity = questionsByType.get("complexity");
  const complexityAccepted = complexity.answer.selectedValueIdsByDimension;
  assertMatchesReference(complexity, { type: "complexity", selectedValueIdsByDimension: complexityAccepted });
  assertMatchesReference(complexity, { type: "complexity", selectedValueIdsByDimension: { time: ["quadratic"], "auxiliary-space": ["constant"] } });
  assertMatchesReference(complexity, { type: "complexity", selectedValueIdsByDimension: { time: ["n-linear"], "auxiliary-space": ["constant"] } });
  assertMatchesReference(complexity, { type: "complexity", selectedValueIdsByDimension: { time: ["linear"] } });

  const matrix = questionsByType.get("decision_matrix");
  assertMatchesReference(matrix, { type: "decision_matrix", selectedValueIdsByDimension: matrix.answer.selectedValueIdsByDimension });
  assertMatchesReference(matrix, { type: "decision_matrix", selectedValueIdsByDimension: { authority: ["client-check"], failure: ["deny-and-repair"] } });
  assertMatchesReference(matrix, { type: "decision_matrix", selectedValueIdsByDimension: { authority: ["trusted-service"] } });
});

test("canonical answers retain the complete accepted set for multi-accepted complexity", () => {
  const question = clone(questionsByType.get("complexity"));
  question.interaction.dimensions[0].acceptedValueIds = ["linear", "quadratic"];
  question.answer.selectedValueIdsByDimension.time = ["linear", "quadratic"];
  assert.deepEqual(validateQuestion(question), { valid: true, errors: [] });
  assert.equal(scoreQuestion(question, { type: "complexity", selectedValueIdsByDimension: { time: ["n-linear", "quadratic"], "auxiliary-space": ["constant"] } }).status, "correct");
  const convergentDuplicate = scoreQuestion(question, { type: "complexity", selectedValueIdsByDimension: { time: ["n-linear", "linear"], "auxiliary-space": ["constant"] } });
  assert.equal(convergentDuplicate.invalidResponse, true);
  assert.notEqual(convergentDuplicate.status, "correct");
  const scalarAnswer = clone(question);
  scalarAnswer.answer.selectedValueIdsByDimension.time = "linear";
  assert.equal(validateQuestion(scalarAnswer).valid, false);
});

test("details remain arbitrary exact JSON, difficulty may be null, and aliases stay complexity-only", () => {
  const candidate = clone(questionsByType.get("choice_single"));
  candidate.difficulty = null;
  candidate.feedback.details = { blocks: [{ type: "paragraph", payload: ["kept", { exact: true }] }] };
  assert.equal(validateQuestion(candidate).valid, true);
  assert.deepEqual(candidate.feedback.details, { blocks: [{ type: "paragraph", payload: ["kept", { exact: true }] }] });

  const matrix = clone(questionsByType.get("decision_matrix"));
  matrix.interaction.dimensions[0].aliases = { shortcut: "trusted-service" };
  assert.equal(validateQuestion(matrix).valid, false);
});
