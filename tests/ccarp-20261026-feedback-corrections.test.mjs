import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { canonicalJson, sha256 } from "../scripts/build.mjs";
import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";
import { loadCurrentQuestionBank } from "./helpers/current-question-bank.mjs";
import registryModule from "../../patternly/src/content/canonical/interactions/registry.ts";
import orderModule from "../../patternly/src/application/canonical/canonicalOptionOrder.ts";
import facadeModule from "../../patternly/src/application/certification/certificationSessionFacade.ts";

const { canonicalInteractionRegistry: runtime } = registryModule;
const { prepareCanonicalOptionOrder, projectCanonicalQuestionInSessionOrder } = orderModule;
const { projectCertificationPracticeFeedback, projectCertificationPracticeQuestion } = facadeModule;
const fixture = JSON.parse(readFileSync(new URL("./fixtures/ccarp-20261026-feedback-cases.json", import.meta.url), "utf8"));
const bank = await loadCurrentQuestionBank(fixture.trackId);
const emitted = new Map(bank.artifact.questions.map(question => [question.questionId, question]));
const pin = { contentVersion: bank.artifact.contentVersion, artifactSha256: sha256(canonicalJson(bank.artifact)) };
const pointerValue = (value, pointer) => pointer.split("/").slice(1).reduce((current, key) => current[key], value);
const permutations = ids => ids.length ? ids.flatMap((id, i) => permutations(ids.filter((_, j) => i !== j)).map(tail => [id, ...tail])) : [[]];

// Same resolved-item boundary as the Certification facade tests. Every operation
// delegates to the production handler; no scoring or feedback is simulated.
function resolved(question) {
  return {
    question: { questionId: question.questionId, trackId: question.trackId, nodeId: question.nodeId, mentalUnitId: question.mentalUnitId, prompt: question.prompt, constraints: question.constraints, sourceRefs: question.sourceRefs, interactionType: question.interaction.type, difficulty: question.difficulty },
    interactions: Object.fromEntries(["projectFeedback", "projectDiagnostics", "present", "presentReview", "evaluate", "isComplete"].map(method => [method, (_id, ...args) => runtime[method](question, ...args)])),
  };
}

for (const scenario of fixture.cases) {
  test(`${scenario.package}: exact source ID, bounded replacements and emitted parity`, () => {
    const source = JSON.parse(readFileSync(new URL(`../${scenario.sourcePath}`, import.meta.url), "utf8"));
    const question = source.find(question => question.questionId === scenario.questionId);
    assert.equal(source[scenario.index], question, "pointer identifies the exact question");
    assert.equal(source.filter(question => question.questionId === scenario.questionId).length, 1);
    assert.equal(validateQuestion(question).valid, true);
    assert.deepEqual(runtime.validate(question), []);
    for (const [field, before] of Object.entries(scenario.identity)) assert.deepEqual(question[field], before, `unchanged ${field}`);
    const { contentDomainId, ...authoredFields } = emitted.get(scenario.questionId);
    assert.match(contentDomainId, /^ccarp-domain-[1-7]$/);
    assert.deepEqual(authoredFields, question, "builder adds domain metadata and preserves authored fields");
    for (const change of scenario.changes) {
      assert.equal(pointerValue(source, change.pointer), change.after);
      assert.notEqual(change.before, change.after);
    }
  });

  test(`${scenario.package}: positive/negative and every option retain score and ID feedback in every permutation`, () => {
    const question = emitted.get(scenario.questionId);
    const ids = question.interaction.options.map(option => option.optionId);
    assert.equal(question.interaction.type, "choice_single");
    assert.equal(question.answer.optionId, scenario.positiveOptionId);
    assert.deepEqual(question.feedback.messages.map(({ kind, targetId }) => [kind, targetId]).sort(), ids.filter(id => id !== scenario.positiveOptionId).map(id => ["wrong_option", id]).sort());
    for (const order of permutations(ids)) {
      const shuffled = projectCanonicalQuestionInSessionOrder(question, order);
      assert.deepEqual(runtime.present(shuffled, null).model.renderer.options.map(option => option.id), order);
      for (const optionId of [scenario.positiveOptionId, scenario.negativeOptionId, ...ids.filter(id => id !== scenario.positiveOptionId && id !== scenario.negativeOptionId)]) {
        const response = { type: "choice_single", optionId };
        const correct = optionId === scenario.positiveOptionId;
        const producer = scoreQuestion({ ...bank.byId.get(scenario.questionId), interaction: shuffled.interaction }, response);
        assert.equal(producer.status, correct ? "correct" : "incorrect");
        assert.equal(producer.earnedPoints, correct ? producer.maxPoints : 0);
        const score = runtime.score(shuffled, response);
        assert.equal(score.kind, correct ? "correct" : "incorrect");
        assert.equal(score.earnedPoints, correct ? score.maxPoints : 0);
        const expectedMessages = correct ? [] : question.feedback.messages.filter(message => message.targetId === optionId);
        const feedback = runtime.projectFeedback(shuffled, response);
        assert.deepEqual(feedback.messages, expectedMessages);
        assert.equal(feedback.reason, question.feedback.reason);
        assert.deepEqual(feedback.details, question.feedback.details);
        assert.deepEqual(runtime.presentReview(shuffled, response, order).feedback, feedback);
      }
    }
    const saved = prepareCanonicalOptionOrder(question, `ccarp-feedback/${scenario.questionId}`, pin);
    assert.deepEqual(saved, prepareCanonicalOptionOrder(question, `ccarp-feedback/${scenario.questionId}`, pin));
    assert.deepEqual([...saved].sort(), [...ids].sort());
  });

  test(`${scenario.package}: Practice hides feedback before durable attempt and deferred completion; review preserves prose`, () => {
    const question = emitted.get(scenario.questionId);
    const exact = resolved(question);
    assert.equal(projectCertificationPracticeFeedback("afterEachAnswer", null, exact), null);
    for (const optionId of [scenario.positiveOptionId, scenario.negativeOptionId]) {
      const response = { type: "choice_single", optionId };
      const attempt = { response, result: runtime.score(question, response) };
      const neutral = projectCertificationPracticeQuestion(exact.question, runtime.present(question, response).model);
      for (const field of ["answer", "feedback", "reason", "details"]) assert.equal(Object.hasOwn(neutral, field), false);
      assert.equal(projectCertificationPracticeFeedback("atSessionEnd", attempt, exact), null);
      const submitted = projectCertificationPracticeFeedback("afterEachAnswer", attempt, exact);
      const reviewed = runtime.presentReview(question, response).feedback;
      assert.equal(submitted.reason, reviewed.reason);
      assert.deepEqual(submitted.details, reviewed.details);
      assert.deepEqual(submitted.messages, reviewed.messages);
    }
  });
}

test("five fixes explain stated evidence without unsupported premises or causal claims", () => {
  const [value, context, tool, access, fairness] = fixture.cases.map(({ questionId }) => emitted.get(questionId));
  assert.doesNotMatch(value.feedback.messages.find(message => message.targetId === "b").text, /stated percentage improvement/i);
  assert.match(context.feedback.reason, /once in fifty.*jurisdiction and version/);
  assert.doesNotMatch(context.feedback.reason, /changed usage frequency|previous question/i);
  assert.match(tool.feedback.details.mechanismOrProperty, /application executes.*tool_result.*request ID/);
  assert.match(tool.feedback.details.scenarioApplication, /If execution fails, return the real tool error/);
  assert.match(access.feedback.details.mechanismOrProperty, /before.*any file bytes/);
  assert.match(access.feedback.details.scenarioApplication, /DENY.*stops.*before retrieval/);
  assert.equal(40 / 100, 0.4);
  assert.equal(40 / 1000, 0.04);
  assert.equal((40 / 100) / (40 / 1000), 10);
  assert.match(fairness.feedback.details.scenarioApplication, /40 \/ 100 = 40%.*40 \/ 1,000 = 4%/);
  assert.match(fairness.feedback.messages.find(message => message.targetId === "c").text, /stage-level evidence is missing/);
});
