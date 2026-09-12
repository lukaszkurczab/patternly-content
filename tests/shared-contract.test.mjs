import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  ACCEPTED_TRACK_IDS,
  CONTRACT_WHITESPACE_CLASS,
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
  assert.equal(schema.$defs.learnerText.pattern, `^[${CONTRACT_WHITESPACE_CLASS}]*[^${CONTRACT_WHITESPACE_CLASS}][\\s\\S]*(?![\\s\\S])`);
  assert.equal(schema.$defs.id.pattern, `^[^${CONTRACT_WHITESPACE_CLASS}](?:[\\s\\S]*[^${CONTRACT_WHITESPACE_CLASS}])?(?![\\s\\S])`);
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
  assert.equal(schema.$defs.orderingInteraction.properties.scoringMethod.const, "adjacent_relations");
  assert.equal(schema.$defs.complexityInteraction.properties.scoringMethod.const, "dimension_exact");
  assert.equal(schema.$defs.decisionMatrixInteraction.properties.scoringMethod.const, "dimension_exact");
});

test("Draft 2020-12 schema rejects feedback type mismatches in every variant", () => {
  const schemaPath = path.resolve("schemas/content/question.schema.json");
  const fixturePath = path.resolve("tests/fixtures/shared-contract-fixture.json");
  const script = String.raw`
import copy
import json
import sys
from jsonschema import Draft202012Validator

with open(sys.argv[1], encoding="utf-8") as handle:
    schema = json.load(handle)
with open(sys.argv[2], encoding="utf-8") as handle:
    questions = json.load(handle)["questions"]
validator = Draft202012Validator(schema)
types = ["choice_single", "choice_multiple", "ordering", "complexity", "decision_matrix"]
for question, expected_type in zip(questions, types):
    if list(validator.iter_errors(question)):
        raise SystemExit(f"valid {expected_type} fixture was rejected")
    candidate = copy.deepcopy(question)
    candidate["feedback"]["type"] = next(value for value in types if value != expected_type)
    if not list(validator.iter_errors(candidate)):
        raise SystemExit(f"feedback mismatch was accepted for {expected_type}")
`;
  assert.doesNotThrow(() => execFileSync("python3", ["-c", script, schemaPath, fixturePath], { encoding: "utf8" }));
});

test("Draft 2020-12 schema agrees with runtime on padded and whitespace-only learner text", () => {
  const schemaPath = path.resolve("schemas/content/question.schema.json");
  const fixturePath = path.resolve("tests/fixtures/shared-contract-fixture.json");
  const script = String.raw`
import copy
import json
import sys
from jsonschema import Draft202012Validator

with open(sys.argv[1], encoding="utf-8") as handle:
    schema = json.load(handle)
with open(sys.argv[2], encoding="utf-8") as handle:
    question = json.load(handle)["questions"][0]
validator = Draft202012Validator(schema)
valid = lambda candidate: not list(validator.iter_errors(candidate))

padded = copy.deepcopy(question)
padded["prompt"] = " padded prompt \n"
padded["interaction"]["options"][0]["text"] = "\t padded option  "
padded["feedback"]["details"] = {"nested": [{"explanation": " padded detail\n"}]}
if not valid(padded):
    raise SystemExit("schema rejected padded learner text")

padded_id = copy.deepcopy(question)
padded_id["questionId"] = "simp01-choice-single "
if valid(padded_id):
    raise SystemExit("schema accepted padded identity")

for mutate in [
    lambda candidate: candidate.__setitem__("prompt", " \n\t"),
    lambda candidate: candidate["interaction"]["options"][0].__setitem__("text", "\t"),
    lambda candidate: candidate["feedback"].__setitem__("details", {"nested": [{"explanation": " "}]}),
]:
    whitespace_only = copy.deepcopy(question)
    mutate(whitespace_only)
    if valid(whitespace_only):
        raise SystemExit("schema accepted whitespace-only learner text")
`;
  assert.doesNotThrow(() => execFileSync("python3", ["-c", script, schemaPath, fixturePath], { encoding: "utf8" }));
});

test("Draft 2020-12 schema and runtime agree on explicit learner whitespace code points", () => {
  const schemaPath = path.resolve("schemas/content/question.schema.json");
  const fixturePath = path.resolve("tests/fixtures/shared-contract-fixture.json");
  const script = String.raw`
import copy
import json
import sys
from jsonschema import Draft202012Validator

with open(sys.argv[1], encoding="utf-8") as handle:
    schema = json.load(handle)
with open(sys.argv[2], encoding="utf-8") as handle:
    question = json.load(handle)["questions"][0]
validator = Draft202012Validator(schema)
valid = lambda candidate: not list(validator.iter_errors(candidate))
cases = [
    ("FEFF", "\ufeff"),
    ("001C", "\u001c"),
    ("001F", "\u001f"),
    ("space", " "),
    ("tab", "\t"),
    ("LF", "\n"),
]
for label, whitespace in cases:
    only = copy.deepcopy(question)
    only["prompt"] = whitespace
    only["feedback"]["details"] = {"nested": [{"text": whitespace}]}
    if valid(only):
        raise SystemExit(f"schema accepted whitespace-only {label}")

    mixed = copy.deepcopy(question)
    mixed_prompt = whitespace + "kept" + whitespace
    mixed["prompt"] = mixed_prompt
    mixed["feedback"]["details"] = {"nested": [{"text": whitespace + "detail" + whitespace}]}
    if not valid(mixed) or mixed["prompt"] != mixed_prompt:
        raise SystemExit(f"schema rejected or changed mixed {label}")
`;
  assert.doesNotThrow(() => execFileSync("python3", ["-c", script, schemaPath, fixturePath], { encoding: "utf8" }));

  const cases = [
    ["FEFF", "\uFEFF"],
    ["001C", "\u001C"],
    ["001F", "\u001F"],
    ["space", " "],
    ["tab", "\t"],
    ["LF", "\n"]
  ];
  for (const [label, whitespace] of cases) {
    const only = clone(questionsByType.get("choice_single"));
    only.prompt = whitespace;
    only.feedback.details = { nested: [{ text: whitespace }] };
    assert.equal(validateQuestion(only).valid, false, `runtime accepted whitespace-only ${label}`);

    const mixed = clone(questionsByType.get("choice_single"));
    const mixedPrompt = `${whitespace}kept${whitespace}`;
    const mixedDetail = `${whitespace}detail${whitespace}`;
    mixed.prompt = mixedPrompt;
    mixed.feedback.details = { nested: [{ text: mixedDetail }] };
    assert.equal(validateQuestion(mixed).valid, true, `runtime rejected mixed ${label}`);
    assert.equal(mixed.prompt, mixedPrompt, `runtime changed mixed prompt ${label}`);
    assert.equal(mixed.feedback.details.nested[0].text, mixedDetail, `runtime changed mixed details ${label}`);
  }
});

test("Draft 2020-12 schema and runtime keep identity metadata trim-clean for explicit whitespace", () => {
  const schemaPath = path.resolve("schemas/content/question.schema.json");
  const fixturePath = path.resolve("tests/fixtures/shared-contract-fixture.json");
  const script = String.raw`
import copy
import json
import sys
from jsonschema import Draft202012Validator

with open(sys.argv[1], encoding="utf-8") as handle:
    schema = json.load(handle)
with open(sys.argv[2], encoding="utf-8") as handle:
    question = json.load(handle)["questions"][0]
validator = Draft202012Validator(schema)
valid = lambda candidate: not list(validator.iter_errors(candidate))

def set_field(candidate, field, value):
    if field == "questionId":
        candidate["questionId"] = value
    elif field == "difficulty":
        candidate["difficulty"] = value
    elif field == "sourceRefs":
        candidate["sourceRefs"][0] = value
    else:
        raise AssertionError(field)

cases = [
    ("FEFF", "\ufeff"),
    ("001C", "\u001c"),
    ("001F", "\u001f"),
    ("0085", "\u0085"),
    ("space", " "),
    ("tab", "\t"),
    ("LF", "\n"),
    ("CR", "\r"),
]
for label, whitespace in cases:
    for field in ["questionId", "difficulty", "sourceRefs"]:
        for edge in [whitespace + "id", "id" + whitespace]:
            candidate = copy.deepcopy(question)
            set_field(candidate, field, edge)
            if valid(candidate):
                raise SystemExit(f"schema accepted {field} with {label} at an edge")

        candidate = copy.deepcopy(question)
        mixed = "id" + whitespace + "internal"
        set_field(candidate, field, mixed)
        if not valid(candidate):
            raise SystemExit(f"schema rejected internal {label} in {field}")
`;
  assert.doesNotThrow(() => execFileSync("python3", ["-c", script, schemaPath, fixturePath], { encoding: "utf8" }));

  const cases = [
    ["FEFF", "\uFEFF"],
    ["001C", "\u001C"],
    ["001F", "\u001F"],
    ["0085", "\u0085"],
    ["space", " "],
    ["tab", "\t"],
    ["LF", "\n"],
    ["CR", "\r"]
  ];
  const setField = (candidate, field, value) => {
    if (field === "questionId") candidate.questionId = value;
    else if (field === "difficulty") candidate.difficulty = value;
    else candidate.sourceRefs[0] = value;
  };
  for (const [label, whitespace] of cases) {
    for (const field of ["questionId", "difficulty", "sourceRefs"]) {
      for (const edge of [`${whitespace}id`, `id${whitespace}`]) {
        const candidate = clone(questionsByType.get("choice_single"));
        setField(candidate, field, edge);
        assert.equal(validateQuestion(candidate).valid, false, `runtime accepted ${field} with ${label} at an edge`);
      }

      const candidate = clone(questionsByType.get("choice_single"));
      const mixed = `id${whitespace}internal`;
      setField(candidate, field, mixed);
      assert.equal(validateQuestion(candidate).valid, true, `runtime rejected internal ${label} in ${field}`);
      const actual = field === "sourceRefs" ? candidate.sourceRefs[0] : candidate[field];
      assert.equal(actual, mixed, `runtime changed internal ${label} in ${field}`);
    }
  }
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
  assert.deepEqual(scoreQuestion(question, { type: "complexity", selectedValueIdsByDimension: { time: ["linear"] } }), {
    status: "partial",
    earnedPoints: 1,
    maxPoints: 2,
    correctDimensionIds: ["time"],
    incorrectDimensionIds: [],
    missingDimensionIds: ["auxiliary-space"]
  });
  assert.equal(scoreQuestion(question, { type: "complexity", selectedValueIdsByDimension: {} }).earnedPoints, 0);
  assert.equal(scoreQuestion(question, { type: "complexity", selectedValueIdsByDimension: { time: ["quadratic"], "auxiliary-space": ["linear"] } }).status, "incorrect");
  assert.equal(scoreQuestion(question, { type: "complexity", selectedValueIdsByDimension: { time: ["linear"], extra: ["constant"] } }).invalidResponse, true);
  assert.equal(scoreQuestion(question, { type: "complexity", selectedValueIdsByDimension: { time: ["n-linear"], "auxiliary-space": ["constant"] } }).status, "correct");
});

test("decision_matrix scores every dimension independently", () => {
  const question = questionsByType.get("decision_matrix");
  assert.equal(scoreQuestion(question, question.answer).earnedPoints, 2);
  const partial = scoreQuestion(question, { type: "decision_matrix", selectedValueIdsByDimension: { authority: ["trusted-service"] } });
  assert.deepEqual(partial, {
    status: "partial",
    earnedPoints: 1,
    maxPoints: 2,
    correctDimensionIds: ["authority"],
    incorrectDimensionIds: [],
    missingDimensionIds: ["failure"]
  });
  assert.equal(scoreQuestion(question, { type: "decision_matrix", selectedValueIdsByDimension: {} }).earnedPoints, 0);
  assert.equal(scoreQuestion(question, { type: "decision_matrix", selectedValueIdsByDimension: { authority: ["client-check"], failure: ["fail-open"] } }).status, "incorrect");
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

test("learner text preserves surrounding whitespace while identity stays trim-clean", () => {
  const paddedPrompt = clone(questionsByType.get("choice_single"));
  paddedPrompt.prompt = " padded prompt \n";
  assert.equal(validateQuestion(paddedPrompt).valid, true);
  assert.equal(paddedPrompt.prompt, " padded prompt \n");

  const paddedOption = clone(questionsByType.get("choice_single"));
  paddedOption.interaction.options[0].text = "\t padded option  ";
  assert.equal(validateQuestion(paddedOption).valid, true);
  assert.equal(paddedOption.interaction.options[0].text, "\t padded option  ");

  const paddedDetails = clone(questionsByType.get("choice_single"));
  paddedDetails.feedback.details = { explanation: " padded detail\n" };
  assert.equal(validateQuestion(paddedDetails).valid, true);
  assert.equal(paddedDetails.feedback.details.explanation, " padded detail\n");

  const paddedNestedDetails = clone(questionsByType.get("choice_single"));
  paddedNestedDetails.feedback.details = { nested: [{ explanation: "\t padded nested detail  " }] };
  assert.equal(validateQuestion(paddedNestedDetails).valid, true);
  assert.equal(paddedNestedDetails.feedback.details.nested[0].explanation, "\t padded nested detail  ");

  const paddedId = clone(questionsByType.get("choice_single"));
  paddedId.questionId = "simp01-choice-single ";
  assert.equal(validateQuestion(paddedId).valid, false);
});

test("learner text rejects whitespace-only values in every canonical learner surface", () => {
  const cases = [
    ["prompt", (candidate) => { candidate.prompt = " \n\t"; }],
    ["constraint", (candidate) => { candidate.constraints[0] = "\t "; }],
    ["option text", (candidate) => { candidate.interaction.options[0].text = " "; }],
    ["option explanation", (candidate) => { candidate.interaction.options[0].explanation = "\n"; }],
    ["feedback reason", (candidate) => { candidate.feedback.reason = "\t"; }],
    ["feedback details string", (candidate) => { candidate.feedback.details = { explanation: "\n" }; }],
    ["feedback details nested string", (candidate) => { candidate.feedback.details = { nested: [{ explanation: "\n" }] }; }],
    ["feedback message text", (candidate) => { candidate.feedback.messages[0].text = "  "; }]
  ];
  for (const [path, mutate] of cases) {
    const candidate = clone(questionsByType.get("choice_single"));
    mutate(candidate);
    assert.equal(validateQuestion(candidate).valid, false, path);
  }

  const ordering = clone(questionsByType.get("ordering"));
  ordering.interaction.elements[0].text = "\n";
  assert.equal(validateQuestion(ordering).valid, false, "element text");

  const complexity = clone(questionsByType.get("complexity"));
  complexity.interaction.dimensions[0].label = "\t";
  complexity.interaction.dimensions[0].values[0].text = " ";
  assert.equal(validateQuestion(complexity).valid, false, "dimension label/value text");
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
    ["complexity", { selectedValueIdsByDimension: { time: ["linear"] } }],
    ["decision_matrix", { selectedValueIdsByDimension: { authority: ["trusted-service"] } }]
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
  foreignDimensionValue.answer.selectedValueIdsByDimension.authority = ["not-a-value"];
  assert.equal(validateQuestion(foreignDimensionValue).valid, false);
});

test("feedback messages are optional when no source map exists", () => {
  const candidate = clone(questionsByType.get("choice_single"));
  delete candidate.feedback.messages;
  assert.deepEqual(validateQuestion(candidate), { valid: true, errors: [] });
  assert.equal(scoreQuestion(candidate, candidate.answer).status, "correct");
});

test("fixture validator rejects a track outside the exact catalog", () => {
  const candidate = clone(fixture);
  candidate.questions[0].trackId = "unlisted-track";
  assert.equal(validateFixture(candidate).valid, false);
});
