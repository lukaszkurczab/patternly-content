import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";
import { buildTrack } from "../scripts/build.mjs";
import canonicalOptionOrderModule from "../../patternly/src/application/canonical/canonicalOptionOrder.ts";
import canonicalInteractionRegistryModule from "../../patternly/src/content/canonical/interactions/registry.ts";
const { prepareCanonicalOptionOrder, projectCanonicalQuestionInSessionOrder } = canonicalOptionOrderModule;
const { canonicalInteractionRegistry } = canonicalInteractionRegistryModule;

const fixture = JSON.parse(await readFile(new URL("./fixtures/ccarp-20261018-targeted-cases.json", import.meta.url), "utf8"));
let build;
let questionsById;
let artifactSha256;
let outputRoot;

test.before(async () => {
  outputRoot = await mkdtemp(path.join(os.tmpdir(), "patternly-ccarp-current-source-"));
  build = await buildTrack({ trackId: "claude-certified-architect-professional-certification", outputRoot });
  questionsById = new Map(build.questions.map(question => [question.questionId, question]));
  artifactSha256 = createHash("sha256").update(build.artifactBytes, "utf8").digest("hex");
});

test.after(async () => {
  if (outputRoot) await rm(outputRoot, { recursive: true, force: true });
});

function wrongOptionIds(question) {
  return question.interaction.options.filter(option => question.interaction.type === "choice_single"
    ? option.optionId !== question.answer.optionId
    : !question.answer.optionIds.includes(option.optionId)).map(option => option.optionId).sort();
}

test("current Claude source builds into a valid package containing every targeted scenario", () => {
  assert.equal(fixture.w1Cases.length, 8);
  assert.equal(build.questions.length, 982);
  assert.equal(build.track.contentVersion, "ccarp-2026.10.26-realistic-exam-v1");
  assert.match(artifactSha256, /^[a-f0-9]{64}$/u);
  for (const scenario of [...fixture.w1Cases, { questionId: "CCARP-D01-O08-qle-v2-feature-parity" }, { questionId: "CCARP-D01-O09-qle-v2-sensitivity" }, { questionId: "CCARP-D03-O10-scenario-04" }]) {
    assert.ok(questionsById.has(scenario.questionId), `${scenario.questionId} is present in current canonical source`);
    assert.equal(validateQuestion(questionsById.get(scenario.questionId)).valid, true, scenario.questionId);
  }
});

for (const scenario of fixture.w1Cases) {
  test(`${scenario.questionId}: standalone positive, wrong-option negative, saved-order permutation and stable-ID feedback`, () => {
    const question = questionsById.get(scenario.questionId);
    assert.ok(question);
    assert.equal(validateQuestion(question).valid, true);
    assert.doesNotMatch(question.prompt, /\b(?:Compared with A|Return to A|as in A|conditions remain as in A)\b/i);
    assert.doesNotMatch(question.feedback.details.scenarioApplication, /\b(?:Compared with A|Return to A|as in A|conditions remain as in A)\b/i);
    assert.doesNotMatch([question.prompt, question.feedback.reason, ...Object.values(question.feedback.details)].join("\n"), /\b(?:Compared with A|Return to A|as in A|conditions remain as in A|revoking B)\b/i);
    assert.deepEqual(wrongOptionIds(question), question.feedback.messages.filter(({ kind }) => kind === "wrong_option").map(({ targetId }) => targetId).sort());

    const pin = { contentVersion: build.track.contentVersion, artifactSha256 };
    const occurrenceId = `ccarp-w1-w3-test:${scenario.questionId}`;
    const savedDeterministicOrder = prepareCanonicalOptionOrder(question, occurrenceId, pin);
    assert.deepEqual(prepareCanonicalOptionOrder(question, occurrenceId, pin), savedDeterministicOrder, "production option-order function is deterministic for a pinned occurrence");
    assert.deepEqual([...savedDeterministicOrder].sort(), question.interaction.options.map(({ optionId }) => optionId).sort());
    const reordered = projectCanonicalQuestionInSessionOrder(question, savedDeterministicOrder);
    assert.equal(validateQuestion(reordered).valid, true);
    assert.deepEqual(reordered.interaction.options.map(({ optionId }) => optionId), savedDeterministicOrder);

    for (const candidate of [question, reordered]) {
      const correct = scoreQuestion(candidate, scenario.positiveResponse);
      assert.equal(correct.status, "correct", `${scenario.questionId}: positive producer score`);
      assert.equal(correct.earnedPoints, correct.maxPoints);
      const appCorrect = canonicalInteractionRegistry.score(candidate, scenario.positiveResponse);
      assert.equal(appCorrect.kind, "correct", `${scenario.questionId}: production APP scorer`);
      const positiveFeedback = canonicalInteractionRegistry.projectFeedback(candidate, scenario.positiveResponse);
      assert.deepEqual(positiveFeedback.messages, [], `${scenario.questionId}: exact answer has no wrong-option feedback`);
      const incorrect = scoreQuestion(candidate, scenario.negativeResponse);
      assert.equal(incorrect.status, "incorrect", `${scenario.questionId}: negative producer score`);
      assert.equal(incorrect.earnedPoints, 0);
      const appIncorrect = canonicalInteractionRegistry.score(candidate, scenario.negativeResponse);
      assert.equal(appIncorrect.kind, "incorrect", `${scenario.questionId}: production APP scorer rejects the distractor`);
      const projectedNegativeFeedback = canonicalInteractionRegistry.projectFeedback(candidate, scenario.negativeResponse);
      assert.ok(projectedNegativeFeedback);
      const expectedNegativeFeedback = candidate.feedback.messages.filter(message => scenario.negativeResponse.type === "choice_single"
        ? message.kind === "wrong_option" && message.targetId === scenario.negativeResponse.optionId
        : (message.kind === "wrong_option" && scenario.negativeResponse.optionIds.includes(message.targetId)) || (message.kind === "omitted_option" && candidate.answer.optionIds.includes(message.targetId) && !scenario.negativeResponse.optionIds.includes(message.targetId)));
      assert.deepEqual(projectedNegativeFeedback.messages, expectedNegativeFeedback, `${scenario.questionId}: APP projects exact authored feedback by stable optionId`);
      const negativeIds = scenario.negativeResponse.type === "choice_single" ? [scenario.negativeResponse.optionId] : scenario.negativeResponse.optionIds;
      const expectedIds = candidate.answer.type === "choice_single" ? [candidate.answer.optionId] : candidate.answer.optionIds;
      for (const id of negativeIds.filter(id => !expectedIds.includes(id))) {
        assert.equal(candidate.feedback.messages.some(message => message.targetId === id && message.kind === "wrong_option"), true, `${scenario.questionId}/${id}`);
      }
    }

    if (question.interaction.type === "choice_multiple") {
      const expected = question.answer.optionIds;
      for (const omitted of expected) {
        const response = { type: "choice_multiple", optionIds: expected.filter(id => id !== omitted) };
        const partial = scoreQuestion(reordered, response);
        assert.equal(partial.status, "partial", `${scenario.questionId}: omitting ${omitted} is incomplete`);
        assert.ok(partial.earnedPoints > 0 && partial.earnedPoints < partial.maxPoints);
        assert.deepEqual(partial.omittedOptionIds, [omitted]);
        const appPartial = canonicalInteractionRegistry.score(reordered, response);
        assert.equal(appPartial.kind, "partial", `${scenario.questionId}: production APP scorer retains partial, non-correct item result`);
        assert.notEqual(appPartial.kind, "correct", "partial item score cannot satisfy the full-answer condition");
        const omittedFeedback = canonicalInteractionRegistry.projectFeedback(reordered, response);
        assert.equal(omittedFeedback, null, "an incomplete exact-count draft is not a completed attempt and receives no review feedback");
      }
      const oneCorrect = scoreQuestion(reordered, { type: "choice_multiple", optionIds: [expected[0]] });
      assert.equal(oneCorrect.status, "partial");
      assert.notEqual(oneCorrect.status, "correct");
    }
  });
}

test("W2a explains the current feature gate and its reversed-support counterexample", () => {
  const current = questionsById.get("CCARP-D01-O08-qle-v2-feature-parity");
  assert.match(current.feedback.details.mechanismOrProperty, /exact approved configuration supports every mandatory workflow capability/u);
  assert.match(current.feedback.details.scenarioApplication, /Route A supports required feature F and is the only eligible route/u);
  assert.match(current.feedback.details.scenarioApplication, /Route B may be reconsidered only after an F-equivalent approach/u);
  assert.match(current.feedback.details.errorCorrection, /Do not silently remove F/u);
  const counterexample = fixture.w2FeatureParityCounterexample;
  const eligible = counterexample.routes.filter(route => !counterexample.workflowRequiresFeature || route.approvedConfigurationSupportsF).map(route => route.routeId);
  assert.deepEqual(eligible, counterexample.expectedEligibleRouteIds);
  assert.deepEqual(counterexample.routes.filter(route => eligible.includes(route.routeId)).sort((a,b) => a.relativeCost-b.relativeCost).map(route => route.routeId), ["B"]);
  assert.equal(counterexample.routes.find(route => route.routeId === "A").approvedConfigurationSupportsF, false);
  assert.equal(counterexample.routes.find(route => route.routeId === "B").approvedConfigurationSupportsF, true);
  assert.match(counterexample.expectedReasoning, /Route B is the only eligible route/u);
  assert.match(counterexample.expectedReasoning, /supports required feature F/u);
  assert.match(counterexample.expectedReasoning, /Route A is ineligible/u);
});

test("W2b recomputes input and output separately, rejects input-only and stale totals", () => {
  const math = { callsPerDay: 10_000, days: 30, inputTokensPerCall: 1_000, outputTokensPerCall: 250, inputRatePerMillion: 2, outputRatePerMillion: 8, ceiling: 1_800, baselineTotal: 1_200, doubledTotal: 2_400 };
  const inputMillions = math.callsPerDay * math.days * math.inputTokensPerCall / 1_000_000;
  const outputMillions = math.callsPerDay * math.days * math.outputTokensPerCall / 1_000_000;
  const inputCost = inputMillions * math.inputRatePerMillion;
  const outputCost = outputMillions * math.outputRatePerMillion;
  assert.equal(inputMillions, 300);
  assert.equal(outputMillions, 75);
  assert.equal(inputCost + outputCost, 1200);
  assert.equal(inputCost * 2 + outputCost * 2, 2400);
  assert.equal(inputCost * 2 + outputCost * 2 - math.ceiling, 600);
  assert.notEqual(inputCost * 2, math.doubledTotal, "input-only estimate omits output cost");
  assert.notEqual(math.baselineTotal, math.doubledTotal, "doubling calls cannot keep the old total");
  const question = questionsById.get("CCARP-D01-O09-qle-v2-sensitivity");
  assert.match(question.feedback.details.scenarioApplication, /300M input tokens cost \$600 and 75M output tokens cost \$600, totaling \$1,200/u);
  assert.match(question.feedback.details.scenarioApplication, /\$2,400, or \$600 above the \$1,800 ceiling/u);
  assert.notEqual(question.answer.optionId, "a");
  assert.notEqual(question.answer.optionId, "b");
});

test("W3 cites payment retry/idempotency guidance and keeps provider-specific boundaries", () => {
  const question = questionsById.get("CCARP-D03-O10-scenario-04");
  assert.equal(question.feedback.details.url, "https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/");
  assert.match(question.feedback.details.boundaryOrTradeoff, /selected provider's actual API contract, key scope and retention window/u);
  assert.match(question.feedback.details.boundaryOrTradeoff, /saved local intent alone cannot prevent a duplicate side effect/u);
  assert.match(question.feedback.details.boundaryOrTradeoff, /authoritative reconciliation, not blind resubmission/u);
  assert.doesNotMatch(question.feedback.details.url, /platform\.claude\.com\/docs\/en\/api\/errors/u);
  const ids = question.interaction.options.map(({ optionId }) => optionId);
  for (const optionId of ids) {
    const result = scoreQuestion(question, { type: "choice_single", optionId });
    assert.equal(result.status, optionId === "d" ? "correct" : "incorrect", optionId);
  }
  assert.deepEqual(question.feedback.messages.filter(({ kind }) => kind === "wrong_option").map(({ targetId }) => targetId).sort(), ids.filter(id => id !== "d").sort());
});
