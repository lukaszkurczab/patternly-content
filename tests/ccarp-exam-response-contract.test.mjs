import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { validateQuestion } from "../scripts/content/question-contract.mjs";
import { canonicalJson, sha256, validateTrack } from "../scripts/build.mjs";
import catalog from "../content/catalog.json" with { type: "json" };

const trackId = "claude-certified-architect-professional-certification";
const contentRoot = path.resolve("content", trackId);
const trackConfig = JSON.parse(readFileSync(path.resolve("config/tracks", `${trackId}.json`), "utf8"));
const questions = readdirSync(contentRoot).flatMap((domain) =>
  readdirSync(path.join(contentRoot, domain))
    .filter((file) => file.endsWith(".json"))
    .flatMap((file) => JSON.parse(readFileSync(path.join(contentRoot, domain, file), "utf8"))));
const examReview = JSON.parse(readFileSync(path.resolve("config/ccarp-exam-authoring-review.json"), "utf8"));
const authoredQuestionIds = [
  "CCARP-D01-O01-matrix-pilot-evidence",
  "CCARP-D01-O01-scenario-pilot-stage-after-evaluation",
  "CCARP-D01-O02-matrix-incident-containment",
  "CCARP-D01-O02-multiple-incident-containment",
  "CCARP-D02-O01-matrix-context-budget",
  "CCARP-D03-O01-matrix-tool-boundary",
  "CCARP-D04-O01-matrix-release-evidence",
  "CCARP-D05-O06-matrix-denied-read",
  "CCARP-D06-O01-matrix-rollout-stage",
  "CCARP-D07-O01-matrix-change-review"
];

test("CCAR-P multiple choice states and validates its required selection count", () => {
  const multiple = questions.filter((question) => question.interaction.type === "choice_multiple");
  assert.equal(multiple.length, 69);
  assert.ok(multiple.every((question) => question.interaction.requiredSelectionCount === question.answer.optionIds.length));
  assert.ok(multiple.every((question) => validateQuestion(question).valid), "every multiple-choice question must satisfy the source contract");

  const invalid = structuredClone(multiple[0]);
  invalid.interaction.requiredSelectionCount += 1;
  assert.equal(validateQuestion(invalid).valid, false);
});

test("CCAR-P profile has explicit training-only minimums across response and decision-skill axes", () => {
  const profile = trackConfig.profile;
  assert.equal(profile.profileVersion, "2");
  assert.deepEqual(profile.examCoverage.formatMinimums, { choice_single: 8, choice_multiple: 8, decision_matrix: 8 });
  assert.deepEqual(profile.examCoverage.skillMinimums, {
    knowledge: 8,
    diagnosis: 8,
    prerequisite: 8,
    next_action: 8,
    contextual_choice: 8
  });
  assert.equal(profile.examCoverage.policy, "patternly-ccarp-v1");
  assert.deepEqual(profile.scoringPolicy, {
    policyId: "patternly-ccarp-complete-item-v1",
    policyVersion: "1",
    method: "complete_correct_item_only"
  });
  assert.deepEqual(profile.examCoverage.provenance, {
    decidedDate: "2026-10-26",
    guideAvailability: "http_403",
    retainedProfileParameters: "Patternly training assumptions pending official guide revalidation; 63 items, 120 minutes, and seven-domain weights are not represented as freshly verified official facts."
  });

  for (const [skill, minimum] of Object.entries(profile.examCoverage.skillMinimums)) {
    assert.ok(questions.filter((question) => question.examMetadata?.decisionSkill === skill).length >= minimum, `${skill} candidate pool`);
  }
  for (const [format, minimum] of Object.entries(profile.examCoverage.formatMinimums)) {
    assert.ok(questions.filter((question) => question.interaction.type === format).length >= minimum, `${format} candidate pool`);
  }
});

test("statement-set questions preserve one item with individually answerable statement rows", () => {
  const matrices = questions.filter((question) => question.interaction.type === "decision_matrix");
  assert.equal(matrices.length, 8);
  assert.ok(matrices.every((question) => question.interaction.dimensions.length === 3));
  assert.ok(matrices.every((question) => question.interaction.dimensions.every((row) =>
    row.values.map((value) => value.valueId).sort().join(",") === "no,yes" && row.acceptedValueIds.length === 1)));
  assert.ok(matrices.every((question) => question.answer.type === "decision_matrix"));
  assert.ok(matrices.every((question) => question.examMetadata?.decisionSkill));
  for (const question of matrices) {
    const rowIds = question.interaction.dimensions.map(({ dimensionId }) => dimensionId);
    assert.deepEqual(Object.keys(question.feedback.details.statementExplanations).sort(), [...rowIds].sort());
    for (const rowId of rowIds) {
      assert.ok(question.feedback.details.statementExplanations[rowId].trim().length > 0, `${question.questionId}/${rowId} explanation`);
      assert.ok(!question.feedback.messages.some((message) => message.kind === "omitted_dimension" && message.targetId === rowId && /select yes or no/i.test(message.text)));
    }
  }
});

test("CCAR-P semantic review covers every original and authored question at current source hashes", () => {
  assert.equal(examReview.schemaVersion, "patternly-ccarp-exam-authoring-review-v1");
  assert.equal(examReview.scope.originalQuestionCount, 972);
  assert.equal(examReview.scope.authoredQuestionCount, 10);
  assert.equal(examReview.scope.totalQuestionCount, 982);
  assert.equal(catalog.tracks.find(({ trackId: id }) => id === trackId)?.contentVersion, examReview.contentVersion);
  assert.deepEqual(examReview.authoredItems.map(({ questionId }) => questionId).sort(), authoredQuestionIds);
  assert.equal(examReview.originalReviews.length, 972);
  assert.equal(new Set(examReview.originalReviews.map(({ questionId }) => questionId)).size, 972);
  assert.equal(examReview.authoredItems.length, 10);

  const byId = new Map(questions.map((question) => [question.questionId, question]));
  const originalIds = new Set(examReview.originalReviews.map(({ questionId }) => questionId));
  assert.deepEqual([...byId.keys()].filter((questionId) => !authoredQuestionIds.includes(questionId)).sort(), [...originalIds].sort());
  for (const record of [...examReview.originalReviews, ...examReview.authoredItems]) {
    const question = byId.get(record.questionId);
    assert.ok(question, `${record.questionId} remains in the canonical bank`);
    assert.ok(record.rationale.trim().length > 0, `${record.questionId} has a substantive disposition`);
    assert.equal(record.questionSha256, sha256(canonicalJson(question)), `${record.questionId} review binds the current full question`);
    assert.equal(record.decisionSkill ?? null, question.examMetadata?.decisionSkill ?? null, `${record.questionId} reviewed skill matches source`);
    assert.equal(record.scenarioFamilyId ?? null, question.examMetadata?.scenarioFamilyId ?? null, `${record.questionId} reviewed family matches source`);
  }
  assert.deepEqual(examReview.scope.originalDispositions, { retain: 935, repair: 37, reclassify: 0, exclude: 0 });
  assert.ok(examReview.sourceChecks.some(({ finding }) => finding.includes("HTTP 403") && finding.includes("Patternly training assumptions")));
});

test("canonical builder carries CCAR-P profile, coverage, scoring and source-derived domains to the artifact", async () => {
  const built = await validateTrack({ trackId });
  const profile = built.simulationProfiles?.[0];
  assert.equal(profile?.familyConfig.schemaVersion, "patternly-certification-simulation-config-v2");
  assert.equal(profile.profileVersion, "2");
  assert.deepEqual(profile.familyConfig.examCoverage, trackConfig.profile.examCoverage);
  assert.deepEqual(profile.familyConfig.scoringPolicy, trackConfig.profile.scoringPolicy);
  assert.equal(new Set(built.artifactQuestions.map((question) => question.contentDomainId)).size, 7);
  assert.ok(built.artifactQuestions.every((question) => question.trackId === trackId));
  const sourceById = new Map(questions.map((question) => [question.questionId, question]));
  for (const question of built.artifactQuestions) {
    assert.deepEqual(question.examMetadata ?? null, sourceById.get(question.questionId)?.examMetadata ?? null);
    if (question.interaction.type === "decision_matrix") {
      assert.deepEqual(Object.keys(question.feedback.details.statementExplanations).sort(), question.interaction.dimensions.map(({ dimensionId }) => dimensionId).sort());
    }
  }
  assert.ok(built.artifactQuestions.filter((question) => question.interaction.type === "choice_multiple")
    .every((question) => question.interaction.requiredSelectionCount === question.answer.optionIds.length));
});
