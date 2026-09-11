import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

export const QUESTION_INTERACTION_TYPES = Object.freeze([
  "choice_single",
  "choice_multiple",
  "ordering",
  "complexity",
  "decision_matrix"
]);

export const ACCEPTED_TRACK_IDS = Object.freeze([
  "aws-certified-solutions-architect-associate",
  "backend-system-design-interview",
  "claude-certified-architect-professional-certification",
  "coding-interview-dsa-problem-solving",
  "frontend-system-design-interview",
  "google-cloud-associate-cloud-engineer",
  "microsoft-azure-administrator-associate-az-104",
  "microsoft-azure-ai-fundamentals-ai-901",
  "object-oriented-design-interview"
]);

const QUESTION_KEYS = [
  "questionId",
  "trackId",
  "nodeId",
  "mentalUnitId",
  "prompt",
  "constraints",
  "interaction",
  "answer",
  "feedback",
  "difficulty",
  "sourceRefs"
];

const CATALOG_KEYS = ["schemaVersion", "tracks"];
const TRACK_KEYS = ["trackId"];
const QUESTION_FIXTURE_KEYS = ["schemaVersion", "questions"];

export class QuestionContractError extends Error {
  constructor(message, errors = []) {
    super(message);
    this.name = "QuestionContractError";
    this.errors = errors;
  }
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function addError(errors, pathName, message) {
  errors.push(`${pathName}: ${message}`);
}

function exactKeys(value, expectedKeys, pathName, errors) {
  if (!isRecord(value)) {
    addError(errors, pathName, "must be an object");
    return false;
  }
  const expected = new Set(expectedKeys);
  for (const key of expectedKeys) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) addError(errors, `${pathName}.${key}`, "is required");
  }
  for (const key of Object.keys(value)) {
    if (!expected.has(key)) addError(errors, `${pathName}.${key}`, "is not allowed");
  }
  return true;
}

function nonEmptyString(value, pathName, errors) {
  if (typeof value !== "string") {
    addError(errors, pathName, "must be a non-empty string");
    return false;
  }
  if (value.trim() === "") {
    addError(errors, pathName, "must be a non-empty string");
    return false;
  }
  if (value !== value.trim()) {
    addError(errors, pathName, "must not contain surrounding whitespace");
    return false;
  }
  return true;
}

function uniqueStrings(values, pathName, errors, { minItems = 0 } = {}) {
  if (!Array.isArray(values)) {
    addError(errors, pathName, "must be an array");
    return false;
  }
  if (values.length < minItems) addError(errors, pathName, `must contain at least ${minItems} item(s)`);
  const seen = new Set();
  values.forEach((value, index) => {
    if (!nonEmptyString(value, `${pathName}[${index}]`, errors)) return;
    if (seen.has(value)) addError(errors, `${pathName}[${index}]`, "must not contain duplicates");
    seen.add(value);
  });
  return true;
}

function exactIdSet(values, expectedValues, pathName, errors) {
  if (!Array.isArray(values)) return;
  const expected = new Set(expectedValues);
  const actual = new Set(values);
  for (const id of expected) if (!actual.has(id)) addError(errors, pathName, `is missing ${id}`);
  for (const id of actual) if (!expected.has(id)) addError(errors, pathName, `contains unknown id ${id}`);
  if (values.length !== expectedValues.length) addError(errors, pathName, "must contain exactly the expected IDs");
}

function validateStringMap(value, expectedKeys, pathName, errors) {
  if (!isRecord(value)) {
    addError(errors, pathName, "must be an object");
    return;
  }
  const expected = new Set(expectedKeys);
  for (const key of expected) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) addError(errors, `${pathName}.${key}`, "is required");
  }
  for (const key of Object.keys(value)) {
    if (!expected.has(key)) addError(errors, `${pathName}.${key}`, "is not an expected reference");
    else nonEmptyString(value[key], `${pathName}.${key}`, errors);
  }
}

function validateOptionList(options, pathName, errors) {
  if (!Array.isArray(options)) {
    addError(errors, pathName, "must be an array");
    return [];
  }
  if (options.length < 2) addError(errors, pathName, "must contain at least two options");
  const ids = [];
  options.forEach((option, index) => {
    const optionPath = `${pathName}[${index}]`;
    if (!exactKeys(option, ["optionId", "text"], optionPath, errors)) return;
    if (nonEmptyString(option.optionId, `${optionPath}.optionId`, errors)) ids.push(option.optionId);
    nonEmptyString(option.text, `${optionPath}.text`, errors);
  });
  if (new Set(ids).size !== ids.length) addError(errors, pathName, "option IDs must be unique");
  return ids;
}

function validateElementList(elements, pathName, errors) {
  if (!Array.isArray(elements)) {
    addError(errors, pathName, "must be an array");
    return [];
  }
  if (elements.length < 2) addError(errors, pathName, "must contain at least two elements");
  const ids = [];
  elements.forEach((element, index) => {
    const elementPath = `${pathName}[${index}]`;
    if (!exactKeys(element, ["elementId", "text"], elementPath, errors)) return;
    if (nonEmptyString(element.elementId, `${elementPath}.elementId`, errors)) ids.push(element.elementId);
    nonEmptyString(element.text, `${elementPath}.text`, errors);
  });
  if (new Set(ids).size !== ids.length) addError(errors, pathName, "element IDs must be unique");
  return ids;
}

function validateDimensions(dimensions, pathName, errors) {
  if (!Array.isArray(dimensions)) {
    addError(errors, pathName, "must be an array");
    return [];
  }
  if (dimensions.length < 1) addError(errors, pathName, "must contain at least one dimension");
  const dimensionIds = [];
  const details = [];
  dimensions.forEach((dimension, index) => {
    const dimensionPath = `${pathName}[${index}]`;
    if (!exactKeys(dimension, ["dimensionId", "label", "values", "acceptedValueIds"], dimensionPath, errors)) return;
    const dimensionIdIsValid = nonEmptyString(dimension.dimensionId, `${dimensionPath}.dimensionId`, errors);
    if (dimensionIdIsValid) dimensionIds.push(dimension.dimensionId);
    nonEmptyString(dimension.label, `${dimensionPath}.label`, errors);
    const values = Array.isArray(dimension.values) ? dimension.values : [];
    if (!Array.isArray(dimension.values)) addError(errors, `${dimensionPath}.values`, "must be an array");
    if (values.length < 2) addError(errors, `${dimensionPath}.values`, "must contain at least two values");
    const valueIds = [];
    values.forEach((value, valueIndex) => {
      const valuePath = `${dimensionPath}.values[${valueIndex}]`;
      if (!exactKeys(value, ["valueId", "text"], valuePath, errors)) return;
      if (nonEmptyString(value.valueId, `${valuePath}.valueId`, errors)) valueIds.push(value.valueId);
      nonEmptyString(value.text, `${valuePath}.text`, errors);
    });
    if (new Set(valueIds).size !== valueIds.length) addError(errors, `${dimensionPath}.values`, "value IDs must be unique");
    const accepted = dimension.acceptedValueIds;
    if (!Array.isArray(accepted) || accepted.length < 1) {
      addError(errors, `${dimensionPath}.acceptedValueIds`, "must contain at least one accepted value ID");
    } else {
      uniqueStrings(accepted, `${dimensionPath}.acceptedValueIds`, errors, { minItems: 1 });
      const valueSet = new Set(valueIds);
      for (const acceptedId of accepted) {
        if (!valueSet.has(acceptedId)) addError(errors, `${dimensionPath}.acceptedValueIds`, `references unknown value ${acceptedId}`);
      }
    }
    details.push({
      dimensionId: dimension.dimensionId,
      valueIds,
      acceptedValueIds: Array.isArray(accepted) ? accepted : []
    });
  });
  if (new Set(dimensionIds).size !== dimensionIds.length) addError(errors, pathName, "dimension IDs must be unique");
  return details;
}

function validateQuestionInternal(question, { catalogTrackIds } = {}) {
  const errors = [];
  if (!exactKeys(question, QUESTION_KEYS, "question", errors)) return errors;

  for (const key of ["questionId", "trackId", "nodeId", "mentalUnitId", "prompt", "difficulty"]) {
    nonEmptyString(question[key], `question.${key}`, errors);
  }
  if (Array.isArray(catalogTrackIds) && !catalogTrackIds.includes(question.trackId)) {
    addError(errors, "question.trackId", `is not present in the supplied catalog (${question.trackId})`);
  }
  if (!Array.isArray(question.constraints)) {
    addError(errors, "question.constraints", "must be an array");
  } else {
    question.constraints.forEach((constraint, index) => nonEmptyString(constraint, `question.constraints[${index}]`, errors));
  }
  if (!Array.isArray(question.sourceRefs)) {
    addError(errors, "question.sourceRefs", "must be an array");
  } else {
    question.sourceRefs.forEach((sourceRef, index) => nonEmptyString(sourceRef, `question.sourceRefs[${index}]`, errors));
  }

  if (!isRecord(question.interaction)) {
    addError(errors, "question.interaction", "must be an object");
    return errors;
  }
  if (typeof question.interaction.type !== "string" || !QUESTION_INTERACTION_TYPES.includes(question.interaction.type)) {
    addError(errors, "question.interaction.type", `must be one of ${QUESTION_INTERACTION_TYPES.join(", ")}`);
    return errors;
  }

  const type = question.interaction.type;
  let referenceIds = [];
  let expectedAnswerKeys = [];
  let expectedFeedbackKeys = [];
  let answerDetails;
  if (type === "choice_single" || type === "choice_multiple") {
    if (!exactKeys(question.interaction, ["type", "options"], "question.interaction", errors)) return errors;
    referenceIds = validateOptionList(question.interaction.options, "question.interaction.options", errors);
    if (type === "choice_single") {
      expectedAnswerKeys = ["type", "optionId"];
      if (exactKeys(question.answer, expectedAnswerKeys, "question.answer", errors)) {
        if (question.answer.type !== type) addError(errors, "question.answer.type", `must equal ${type}`);
        if (nonEmptyString(question.answer.optionId, "question.answer.optionId", errors) && !referenceIds.includes(question.answer.optionId)) {
          addError(errors, "question.answer.optionId", "references an option that does not exist");
        }
        answerDetails = { acceptedOptionId: question.answer.optionId };
      }
      expectedFeedbackKeys = ["type", "correct", "incorrectByOptionId"];
      if (exactKeys(question.feedback, expectedFeedbackKeys, "question.feedback", errors)) {
        if (question.feedback.type !== type) addError(errors, "question.feedback.type", `must equal ${type}`);
        nonEmptyString(question.feedback.correct, "question.feedback.correct", errors);
        const incorrectIds = referenceIds.filter((id) => id !== question.answer?.optionId);
        validateStringMap(question.feedback.incorrectByOptionId, incorrectIds, "question.feedback.incorrectByOptionId", errors);
      }
    } else {
      expectedAnswerKeys = ["type", "optionIds"];
      if (exactKeys(question.answer, expectedAnswerKeys, "question.answer", errors)) {
        if (question.answer.type !== type) addError(errors, "question.answer.type", `must equal ${type}`);
        const ids = question.answer.optionIds;
        uniqueStrings(ids, "question.answer.optionIds", errors, { minItems: 1 });
        if (Array.isArray(ids)) {
          for (const id of ids) if (!referenceIds.includes(id)) addError(errors, "question.answer.optionIds", `references unknown option ${id}`);
        }
        answerDetails = { acceptedOptionIds: Array.isArray(ids) ? ids : [] };
      }
      expectedFeedbackKeys = ["type", "correct", "incorrectByOptionId", "omittedByOptionId"];
      if (exactKeys(question.feedback, expectedFeedbackKeys, "question.feedback", errors)) {
        if (question.feedback.type !== type) addError(errors, "question.feedback.type", `must equal ${type}`);
        nonEmptyString(question.feedback.correct, "question.feedback.correct", errors);
        const accepted = Array.isArray(question.answer?.optionIds) ? question.answer.optionIds : [];
        validateStringMap(question.feedback.incorrectByOptionId, referenceIds.filter((id) => !accepted.includes(id)), "question.feedback.incorrectByOptionId", errors);
        validateStringMap(question.feedback.omittedByOptionId, accepted, "question.feedback.omittedByOptionId", errors);
      }
    }
  } else if (type === "ordering") {
    if (!exactKeys(question.interaction, ["type", "elements"], "question.interaction", errors)) return errors;
    referenceIds = validateElementList(question.interaction.elements, "question.interaction.elements", errors);
    expectedAnswerKeys = ["type", "orderedElementIds"];
    if (exactKeys(question.answer, expectedAnswerKeys, "question.answer", errors)) {
      if (question.answer.type !== type) addError(errors, "question.answer.type", `must equal ${type}`);
      uniqueStrings(question.answer.orderedElementIds, "question.answer.orderedElementIds", errors, { minItems: 2 });
      exactIdSet(question.answer.orderedElementIds, referenceIds, "question.answer.orderedElementIds", errors);
      answerDetails = { orderedElementIds: Array.isArray(question.answer.orderedElementIds) ? question.answer.orderedElementIds : [] };
    }
    expectedFeedbackKeys = ["type", "correct", "incorrectByElementId", "brokenByRelationId"];
    if (exactKeys(question.feedback, expectedFeedbackKeys, "question.feedback", errors)) {
      if (question.feedback.type !== type) addError(errors, "question.feedback.type", `must equal ${type}`);
      nonEmptyString(question.feedback.correct, "question.feedback.correct", errors);
      validateStringMap(question.feedback.incorrectByElementId, referenceIds, "question.feedback.incorrectByElementId", errors);
      const order = Array.isArray(question.answer?.orderedElementIds) ? question.answer.orderedElementIds : [];
      const relationIds = order.slice(0, -1).map((id, index) => `${id}->${order[index + 1]}`);
      validateStringMap(question.feedback.brokenByRelationId, relationIds, "question.feedback.brokenByRelationId", errors);
    }
  } else {
    if (!exactKeys(question.interaction, ["type", "dimensions"], "question.interaction", errors)) return errors;
    const dimensions = validateDimensions(question.interaction.dimensions, "question.interaction.dimensions", errors);
    expectedAnswerKeys = ["type", "selectedValueIdsByDimension"];
    const dimensionIds = dimensions.map((dimension) => dimension.dimensionId);
    if (exactKeys(question.answer, expectedAnswerKeys, "question.answer", errors)) {
      if (question.answer.type !== type) addError(errors, "question.answer.type", `must equal ${type}`);
      const selections = question.answer.selectedValueIdsByDimension;
      if (!isRecord(selections)) {
        addError(errors, "question.answer.selectedValueIdsByDimension", "must be an object");
      } else {
        exactIdSet(Object.keys(selections), dimensionIds, "question.answer.selectedValueIdsByDimension", errors);
        for (const dimension of dimensions) {
          const selected = selections[dimension.dimensionId];
          nonEmptyString(selected, `question.answer.selectedValueIdsByDimension.${dimension.dimensionId}`, errors);
          if (!dimension.valueIds.includes(selected)) addError(errors, `question.answer.selectedValueIdsByDimension.${dimension.dimensionId}`, "references an unknown value");
          if (!dimension.acceptedValueIds.includes(selected)) addError(errors, `question.answer.selectedValueIdsByDimension.${dimension.dimensionId}`, "must select an accepted value");
        }
      }
      answerDetails = { dimensions };
    }
    expectedFeedbackKeys = ["type", "correct", "incorrectByDimensionIdAndValueId", "omittedByDimensionId"];
    if (exactKeys(question.feedback, expectedFeedbackKeys, "question.feedback", errors)) {
      if (question.feedback.type !== type) addError(errors, "question.feedback.type", `must equal ${type}`);
      nonEmptyString(question.feedback.correct, "question.feedback.correct", errors);
      const wrongKeys = dimensions.flatMap((dimension) => dimension.valueIds.filter((id) => !dimension.acceptedValueIds.includes(id)).map((id) => `${dimension.dimensionId}|${id}`));
      validateStringMap(question.feedback.incorrectByDimensionIdAndValueId, wrongKeys, "question.feedback.incorrectByDimensionIdAndValueId", errors);
      validateStringMap(question.feedback.omittedByDimensionId, dimensionIds, "question.feedback.omittedByDimensionId", errors);
    }
    void answerDetails;
  }

  return errors;
}

export function validateQuestion(question, options = {}) {
  const errors = validateQuestionInternal(question, options);
  return { valid: errors.length === 0, errors };
}

export function isValidQuestion(question, options = {}) {
  return validateQuestion(question, options).valid;
}

export function assertValidQuestion(question, options = {}) {
  const result = validateQuestion(question, options);
  if (!result.valid) throw new QuestionContractError("Question does not satisfy the canonical contract", result.errors);
  return question;
}

export function validateCatalog(catalog) {
  const errors = [];
  if (!exactKeys(catalog, CATALOG_KEYS, "catalog", errors)) return { valid: false, errors };
  if (catalog.schemaVersion !== "patternly-content-catalog-v1") addError(errors, "catalog.schemaVersion", "must equal patternly-content-catalog-v1");
  if (!Array.isArray(catalog.tracks)) {
    addError(errors, "catalog.tracks", "must be an array");
    return { valid: false, errors };
  }
  if (catalog.tracks.length !== ACCEPTED_TRACK_IDS.length) addError(errors, "catalog.tracks", `must contain exactly ${ACCEPTED_TRACK_IDS.length} tracks`);
  const ids = [];
  catalog.tracks.forEach((track, index) => {
    const trackPath = `catalog.tracks[${index}]`;
    if (!exactKeys(track, TRACK_KEYS, trackPath, errors)) return;
    if (nonEmptyString(track.trackId, `${trackPath}.trackId`, errors)) ids.push(track.trackId);
  });
  if (new Set(ids).size !== ids.length) addError(errors, "catalog.tracks", "track IDs must be unique");
  exactIdSet(ids, ACCEPTED_TRACK_IDS, "catalog.tracks", errors);
  return { valid: errors.length === 0, errors };
}

export function assertValidCatalog(catalog) {
  const result = validateCatalog(catalog);
  if (!result.valid) throw new QuestionContractError("Catalog does not satisfy the canonical contract", result.errors);
  return catalog;
}

const DEFAULT_ROOT_DIRECTORY = path.resolve(fileURLToPath(new URL("../../", import.meta.url)));

export function loadCanonicalCatalog({ rootDirectory = DEFAULT_ROOT_DIRECTORY } = {}) {
  return JSON.parse(readFileSync(path.join(rootDirectory, "content/catalog.json"), "utf8"));
}

export function validateFixture(fixture, catalog = loadCanonicalCatalog()) {
  const errors = [];
  if (!exactKeys(fixture, QUESTION_FIXTURE_KEYS, "fixture", errors)) return { valid: false, errors };
  if (fixture.schemaVersion !== "patternly-question-fixture-v1") addError(errors, "fixture.schemaVersion", "must equal patternly-question-fixture-v1");
  const catalogResult = validateCatalog(catalog);
  errors.push(...catalogResult.errors);
  if (!Array.isArray(fixture.questions)) {
    addError(errors, "fixture.questions", "must be an array");
    return { valid: false, errors };
  }
  const trackIds = catalog && Array.isArray(catalog.tracks) ? catalog.tracks.map((track) => track.trackId) : undefined;
  const questionIds = [];
  fixture.questions.forEach((question, index) => {
    const result = validateQuestion(question, { catalogTrackIds: trackIds });
    errors.push(...result.errors.map((error) => `fixture.questions[${index}].${error.replace(/^question\.?/, "")}`));
    if (typeof question?.questionId === "string") questionIds.push(question.questionId);
  });
  if (new Set(questionIds).size !== questionIds.length) addError(errors, "fixture.questions", "question IDs must be unique");
  return { valid: errors.length === 0, errors };
}

export function assertValidFixture(fixture, catalog = loadCanonicalCatalog()) {
  const result = validateFixture(fixture, catalog);
  if (!result.valid) throw new QuestionContractError("Fixture does not satisfy the canonical contract", result.errors);
  return fixture;
}

function scoreResult(maxPoints, earnedPoints, details = {}) {
  return {
    status: earnedPoints === maxPoints ? "correct" : earnedPoints > 0 ? "partial" : "incorrect",
    earnedPoints,
    maxPoints,
    ...details
  };
}

function responseShapeMatches(response, type, payloadKeys) {
  if (!isRecord(response)) return false;
  const allowedKeys = new Set(["type", ...payloadKeys]);
  if (Object.keys(response).some((key) => !allowedKeys.has(key))) return false;
  return Object.prototype.hasOwnProperty.call(response, "type") && response.type === type;
}

export function scoreQuestion(question, response) {
  assertValidQuestion(question);
  const type = question.interaction.type;

  if (type === "choice_single") {
    if (!responseShapeMatches(response, type, ["optionId"])) return scoreResult(maxPointsFor(question), 0, { invalidResponse: true });
    const maxPoints = 1;
    const selected = response?.optionId;
    const correct = selected === question.answer.optionId;
    return scoreResult(maxPoints, correct ? 1 : 0, { selectedOptionId: selected, correctOptionId: question.answer.optionId });
  }

  if (type === "choice_multiple") {
    if (!responseShapeMatches(response, type, ["optionIds"])) return scoreResult(maxPointsFor(question), 0, { invalidResponse: true });
    const expected = question.answer.optionIds;
    const selected = response?.optionIds;
    const optionIds = question.interaction.options.map((option) => option.optionId);
    if (!Array.isArray(selected) || new Set(selected).size !== selected.length || selected.some((id) => !question.interaction.options.some((option) => option.optionId === id))) {
      return scoreResult(optionIds.length, 0, { invalidResponse: true, correctOptionIds: expected, selectedOptionIds: Array.isArray(selected) ? selected : [] });
    }
    const selectedSet = new Set(selected);
    const expectedSet = new Set(expected);
    const correctOptionIds = selected.filter((id) => expectedSet.has(id));
    const incorrectOptionIds = selected.filter((id) => !expectedSet.has(id));
    const omittedOptionIds = expected.filter((id) => !selectedSet.has(id));
    const correctlyResolvedOptionIds = optionIds.filter((id) => expectedSet.has(id) ? selectedSet.has(id) : !selectedSet.has(id));
    return scoreResult(optionIds.length, correctlyResolvedOptionIds.length, { correctlyResolvedOptionIds, correctOptionIds, incorrectOptionIds, omittedOptionIds });
  }

  if (type === "ordering") {
    if (!responseShapeMatches(response, type, ["orderedElementIds"])) return scoreResult(maxPointsFor(question), 0, { invalidResponse: true });
    const expected = question.answer.orderedElementIds;
    const selected = response?.orderedElementIds;
    const known = new Set(expected);
    if (!Array.isArray(selected) || new Set(selected).size !== selected.length || selected.some((id) => !known.has(id))) {
      return scoreResult(expected.length - 1, 0, { invalidResponse: true, brokenRelations: expected.slice(0, -1).map((id, index) => `${id}->${expected[index + 1]}`) });
    }
    const expectedRelations = new Set(expected.slice(0, -1).map((id, index) => `${id}->${expected[index + 1]}`));
    const actualRelations = selected.slice(0, -1).map((id, index) => `${id}->${selected[index + 1]}`);
    const earnedPoints = actualRelations.filter((relation) => expectedRelations.has(relation)).length;
    return scoreResult(expectedRelations.size, earnedPoints, { brokenRelations: [...expectedRelations].filter((relation) => !actualRelations.includes(relation)) });
  }

  if (!responseShapeMatches(response, type, ["selectedValueIdsByDimension"])) return scoreResult(maxPointsFor(question), 0, { invalidResponse: true });
  const dimensions = question.interaction.dimensions;
  const selections = response?.selectedValueIdsByDimension;
  if (!isRecord(selections)) return scoreResult(dimensions.length, 0, { invalidResponse: true, incorrectDimensionIds: dimensions.map((dimension) => dimension.dimensionId) });
  const dimensionIds = new Set(dimensions.map((dimension) => dimension.dimensionId));
  const extraDimensions = Object.keys(selections).filter((id) => !dimensionIds.has(id));
  if (extraDimensions.length > 0) return scoreResult(dimensions.length, 0, { invalidResponse: true, extraDimensionIds: extraDimensions });
  const correctDimensionIds = [];
  const incorrectDimensionIds = [];
  const missingDimensionIds = [];
  for (const dimension of dimensions) {
    if (!Object.prototype.hasOwnProperty.call(selections, dimension.dimensionId)) {
      missingDimensionIds.push(dimension.dimensionId);
    } else if (dimension.acceptedValueIds.includes(selections[dimension.dimensionId])) {
      correctDimensionIds.push(dimension.dimensionId);
    } else {
      incorrectDimensionIds.push(dimension.dimensionId);
    }
  }
  return scoreResult(dimensions.length, correctDimensionIds.length, { correctDimensionIds, incorrectDimensionIds, missingDimensionIds });
}

function maxPointsFor(question) {
  const type = question?.interaction?.type;
  if (type === "choice_single") return 1;
  if (type === "choice_multiple") return question.interaction.options.length;
  if (type === "ordering") return question.answer.orderedElementIds.length - 1;
  if (type === "complexity" || type === "decision_matrix") return question.interaction.dimensions.length;
  return 0;
}

export function loadCanonicalFixture({ rootDirectory = path.resolve(fileURLToPath(new URL("../../", import.meta.url))) } = {}) {
  const catalog = loadCanonicalCatalog({ rootDirectory });
  const fixture = JSON.parse(readFileSync(path.join(rootDirectory, "tests/fixtures/shared-contract-fixture.json"), "utf8"));
  return { catalog, fixture };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const { catalog, fixture } = loadCanonicalFixture();
  const result = validateFixture(fixture, catalog);
  if (!result.valid) {
    console.error(result.errors.join("\n"));
    process.exitCode = 1;
  } else {
    console.log(`Canonical fixture valid: ${fixture.questions.length} questions, ${catalog.tracks.length} tracks`);
  }
}
