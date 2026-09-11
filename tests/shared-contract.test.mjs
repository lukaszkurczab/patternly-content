import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  ACCEPTED_TRACK_IDS,
  QUESTION_INTERACTION_TYPES,
  loadCanonicalFixture,
  scoreQuestion,
  validateCatalog,
  validateFixture,
  validateQuestion
} from "../scripts/content/question-contract.mjs";

const { catalog, fixture } = loadCanonicalFixture();
const questionsByType = new Map(fixture.questions.map((question) => [question.interaction.type, question]));

function clone(value) {
  return structuredClone(value);
}

test("catalog is the exact nine-track SIMP-01 catalog", () => {
  assert.deepEqual(validateCatalog(catalog), { valid: true, errors: [] });
  assert.deepEqual(catalog.tracks.map((track) => track.trackId), ACCEPTED_TRACK_IDS);
  assert.equal(catalog.tracks.length, 9);
});

test("fixture validates as one family-neutral contract", () => {
  const result = validateFixture(fixture, catalog);
  assert.deepEqual(result, { valid: true, errors: [] });
  assert.deepEqual([...questionsByType.keys()].sort(), [...QUESTION_INTERACTION_TYPES].sort());
  assert.equal(fixture.questions.length, 5);
});

test("schema documents five disjoint interaction branches", () => {
  const schema = JSON.parse(readFileSync(new URL("../schemas/content/question.schema.json", import.meta.url), "utf8"));
  assert.equal(schema.oneOf.length, 5);
  assert.equal(schema.additionalProperties, false);
  assert.equal(schema.$defs.nonEmptyText.pattern, "^\\S(?:[\\s\\S]*\\S)?$");
  assert.equal(schema.$defs.id.pattern, "^\\S(?:[\\s\\S]*\\S)?$");
  const branchNames = schema.oneOf.map((branch) => branch.$ref.split("/").at(-1));
  assert.deepEqual(branchNames, [
    "choiceSingleQuestion",
    "choiceMultipleQuestion",
    "orderingQuestion",
    "complexityQuestion",
    "decisionMatrixQuestion"
  ]);
  assert.deepEqual(
    schema.oneOf.map((branch) => schema.$defs[branch.$ref.split("/").at(-1)].unevaluatedProperties),
    [false, false, false, false, false]
  );
  assert.equal(schema.$defs.choiceSingleInteraction.properties.type.const, "choice_single");
  assert.equal(schema.$defs.choiceMultipleInteraction.properties.type.const, "choice_multiple");
  assert.equal(schema.$defs.orderingInteraction.properties.type.const, "ordering");
  assert.equal(schema.$defs.complexityInteraction.properties.type.const, "complexity");
  assert.equal(schema.$defs.decisionMatrixInteraction.properties.type.const, "decision_matrix");
});

test("all five correct answers are scoreable", () => {
  for (const question of fixture.questions) {
    const result = scoreQuestion(question, question.answer);
    assert.equal(result.status, "correct", question.questionId);
    assert.equal(result.earnedPoints, result.maxPoints, question.questionId);
  }
});

test("choice_single scores correct, wrong and empty responses", () => {
  const question = questionsByType.get("choice_single");
  assert.deepEqual(scoreQuestion(question, question.answer), {
    status: "correct",
    earnedPoints: 1,
    maxPoints: 1,
    selectedOptionId: "service",
    correctOptionId: "service"
  });
  assert.equal(scoreQuestion(question, { type: "choice_single", optionId: "screen" }).status, "incorrect");
  assert.equal(scoreQuestion(question, { type: "choice_single" }).earnedPoints, 0);
  assert.equal(scoreQuestion(question, { type: "choice_single" }).status, "incorrect");
});

test("choice_multiple scores per correctly selected accepted option", () => {
  const question = questionsByType.get("choice_multiple");
  const partial = scoreQuestion(question, { type: "choice_multiple", optionIds: ["idempotency"] });
  assert.deepEqual(partial, {
    status: "partial",
    earnedPoints: 2,
    maxPoints: 4,
    correctlyResolvedOptionIds: ["idempotency", "silent-loop"],
    correctOptionIds: ["idempotency"],
    incorrectOptionIds: [],
    omittedOptionIds: ["bounded-retry", "repair-state"]
  });
  assert.equal(scoreQuestion(question, { type: "choice_multiple", optionIds: ["silent-loop"] }).earnedPoints, 0);
  assert.equal(scoreQuestion(question, { type: "choice_multiple", optionIds: [] }).earnedPoints, 1);
  assert.equal(scoreQuestion(question, { type: "choice_multiple" }).status, "incorrect");
  const allAcceptedPlusWrong = scoreQuestion(question, { type: "choice_multiple", optionIds: ["idempotency", "bounded-retry", "repair-state", "silent-loop"] });
  assert.equal(allAcceptedPlusWrong.status, "partial");
  assert.equal(allAcceptedPlusWrong.earnedPoints, 3);
  assert.equal(allAcceptedPlusWrong.maxPoints, 4);
  assert.equal(scoreQuestion(question, { type: "choice_multiple", optionIds: ["unknown"] }).invalidResponse, true);
});

test("ordering scores exact adjacent relations and incomplete answers", () => {
  const question = questionsByType.get("ordering");
  assert.equal(scoreQuestion(question, question.answer).earnedPoints, 3);
  const partial = scoreQuestion(question, { type: "ordering", orderedElementIds: ["observe", "preserve"] });
  assert.deepEqual(partial, {
    status: "partial",
    earnedPoints: 1,
    maxPoints: 3,
    brokenRelations: ["preserve->expose", "expose->recover"]
  });
  assert.equal(scoreQuestion(question, { type: "ordering", orderedElementIds: [] }).earnedPoints, 0);
  assert.equal(scoreQuestion(question, { type: "ordering" }).status, "incorrect");
  assert.equal(scoreQuestion(question, { type: "ordering", orderedElementIds: ["observe", "unknown"] }).invalidResponse, true);
});

test("complexity scores every dimension and distinguishes missing values", () => {
  const question = questionsByType.get("complexity");
  assert.equal(scoreQuestion(question, question.answer).earnedPoints, 2);
  assert.deepEqual(scoreQuestion(question, { type: "complexity", selectedValueIdsByDimension: { time: "linear" } }), {
    status: "partial",
    earnedPoints: 1,
    maxPoints: 2,
    correctDimensionIds: ["time"],
    incorrectDimensionIds: [],
    missingDimensionIds: ["auxiliary-space"]
  });
  assert.equal(scoreQuestion(question, { type: "complexity", selectedValueIdsByDimension: {} }).earnedPoints, 0);
  assert.equal(scoreQuestion(question, { type: "complexity", selectedValueIdsByDimension: { time: "quadratic", "auxiliary-space": "linear" } }).status, "incorrect");
  assert.equal(scoreQuestion(question, { type: "complexity", selectedValueIdsByDimension: { time: "linear", extra: "constant" } }).invalidResponse, true);
});

test("decision_matrix scores every dimension independently", () => {
  const question = questionsByType.get("decision_matrix");
  assert.equal(scoreQuestion(question, question.answer).earnedPoints, 2);
  const partial = scoreQuestion(question, { type: "decision_matrix", selectedValueIdsByDimension: { authority: "trusted-service" } });
  assert.deepEqual(partial, {
    status: "partial",
    earnedPoints: 1,
    maxPoints: 2,
    correctDimensionIds: ["authority"],
    incorrectDimensionIds: [],
    missingDimensionIds: ["failure"]
  });
  assert.equal(scoreQuestion(question, { type: "decision_matrix", selectedValueIdsByDimension: {} }).earnedPoints, 0);
  assert.equal(scoreQuestion(question, { type: "decision_matrix", selectedValueIdsByDimension: { authority: "client-check", failure: "fail-open" } }).status, "incorrect");
});

test("validator rejects missing identity and all family aliases", () => {
  for (const field of ["questionId", "trackId", "nodeId", "mentalUnitId"]) {
    const candidate = clone(questionsByType.get("choice_single"));
    delete candidate[field];
    assert.equal(validateQuestion(candidate).valid, false, field);
  }
  for (const alias of ["familyId", "learningBlockId", "primaryMentalUnitId"]) {
    const candidate = clone(questionsByType.get("choice_single"));
    candidate[alias] = "legacy-alias";
    assert.equal(validateQuestion(candidate).valid, false, alias);
  }
});

test("validator rejects surrounding whitespace instead of only whitespace-only strings", () => {
  for (const [path, mutate] of [
    ["prompt", (candidate) => { candidate.prompt = " padded prompt"; }],
    ["questionId", (candidate) => { candidate.questionId = "simp01-choice-single "; }],
    ["option text", (candidate) => { candidate.interaction.options[0].text = " padded option"; }]
  ]) {
    const candidate = clone(questionsByType.get("choice_single"));
    mutate(candidate);
    assert.equal(validateQuestion(candidate).valid, false, path);
  }
});

test("validator permits internal newlines that the schema pattern explicitly permits", () => {
  const candidate = clone(questionsByType.get("choice_single"));
  candidate.prompt = "first line\nsecond line";
  candidate.interaction.options[0].text = "first option\nwith detail";
  assert.equal(validateQuestion(candidate).valid, true);
});

test("scoring rejects additional response keys and mismatched response types for every variant", () => {
  const cases = [
    ["choice_single", { optionId: "service" }],
    ["choice_multiple", { optionIds: ["idempotency"] }],
    ["ordering", { orderedElementIds: ["observe", "preserve"] }],
    ["complexity", { selectedValueIdsByDimension: { time: "linear" } }],
    ["decision_matrix", { selectedValueIdsByDimension: { authority: "trusted-service" } }]
  ];
  for (const [type, response] of cases) {
    const question = questionsByType.get(type);
    assert.equal(scoreQuestion(question, { type, ...response, extra: true }).invalidResponse, true, `${type} extra key`);
    assert.equal(scoreQuestion(question, { type: "wrong_type", ...response }).invalidResponse, true, `${type} wrong type`);
    assert.equal(scoreQuestion(question, response).invalidResponse, true, `${type} missing type`);
  }
});

test("validator rejects extra fields and duplicate option/element/dimension IDs", () => {
  const extra = clone(questionsByType.get("choice_single"));
  extra.answer.extra = true;
  assert.equal(validateQuestion(extra).valid, false);

  const duplicateOption = clone(questionsByType.get("choice_single"));
  duplicateOption.interaction.options[1].optionId = duplicateOption.interaction.options[0].optionId;
  assert.equal(validateQuestion(duplicateOption).valid, false);

  const duplicateElement = clone(questionsByType.get("ordering"));
  duplicateElement.interaction.elements[1].elementId = duplicateElement.interaction.elements[0].elementId;
  assert.equal(validateQuestion(duplicateElement).valid, false);

  const duplicateDimension = clone(questionsByType.get("complexity"));
  duplicateDimension.interaction.dimensions[1].dimensionId = duplicateDimension.interaction.dimensions[0].dimensionId;
  assert.equal(validateQuestion(duplicateDimension).valid, false);
});

test("validator rejects mismatched variants and foreign references", () => {
  const answerMismatch = clone(questionsByType.get("choice_single"));
  answerMismatch.answer.type = "choice_multiple";
  assert.equal(validateQuestion(answerMismatch).valid, false);

  const feedbackMismatch = clone(questionsByType.get("ordering"));
  feedbackMismatch.feedback.type = "choice_single";
  assert.equal(validateQuestion(feedbackMismatch).valid, false);

  const foreignOption = clone(questionsByType.get("choice_single"));
  foreignOption.answer.optionId = "not-an-option";
  assert.equal(validateQuestion(foreignOption).valid, false);

  const foreignElement = clone(questionsByType.get("ordering"));
  foreignElement.answer.orderedElementIds[0] = "not-an-element";
  assert.equal(validateQuestion(foreignElement).valid, false);

  const foreignDimensionValue = clone(questionsByType.get("decision_matrix"));
  foreignDimensionValue.answer.selectedValueIdsByDimension.authority = "not-a-value";
  assert.equal(validateQuestion(foreignDimensionValue).valid, false);
});

test("fixture validator rejects a track outside the exact catalog", () => {
  const candidate = clone(fixture);
  candidate.questions[0].trackId = "unlisted-track";
  assert.equal(validateFixture(candidate).valid, false);
});
