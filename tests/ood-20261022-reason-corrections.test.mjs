import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";
import { loadCurrentQuestionBank } from "./helpers/current-question-bank.mjs";
import scoring from "../../patternly/src/content/canonical/questionScoring.ts";
import optionOrder from "../../patternly/src/application/canonical/canonicalOptionOrder.ts";
import presentation from "../../patternly/src/application/canonical/canonicalInteractionPresentation.ts";
import practiceView from "../../patternly/src/features/practice/canonicalQuestionViewModel.ts";
import catalogModule from "../../patternly/src/content/canonical/questionCatalog.ts";

// The APP TypeScript package exposes CommonJS modules to this ESM test runner.
const { scoreCanonicalQuestion } = scoring;
const { prepareCanonicalOptionOrder, projectCanonicalQuestionInSessionOrder } = optionOrder;
const { buildCanonicalInteractionViewModel, composeCanonicalFeedback } = presentation;
const { toCanonicalQuestionViewModel } = practiceView;

const trackId = "object-oriented-design-interview";
const bank = await loadCurrentQuestionBank(trackId);
const expectedIds = [3, 4].flatMap(unit => Array.from({ length: 19 }, (_, index) =>
  `ood-n02-b0${unit}-i${String(index + 20).padStart(3, "0")}`)
  .filter(id => !["ood-n02-b04-i020", "ood-n02-b04-i030"].includes(id)));
const track = JSON.parse(readFileSync(new URL("../content/catalog.json", import.meta.url), "utf8")).tracks.find(entry => entry.trackId === trackId);
const { sha256, canonicalJson } = await import("../scripts/build.mjs");
const pin = { contentVersion: track.contentVersion, artifactSha256: sha256(canonicalJson(bank.artifact)) };

test("APP catalog accepts the exact candidate and reports an unknown question ID as absent", async () => {
  const catalog = await catalogModule.createCanonicalQuestionCatalog(
    JSON.parse(canonicalJson(bank.artifact)),
    { trackId, contentVersion: pin.contentVersion, questionCount: bank.questions.length, sha256: pin.artifactSha256 },
    trackId,
    async value => sha256(value),
  );
  for (const id of expectedIds) assert.deepEqual(catalog.getQuestionById(id), bank.byId.get(id));
  assert.equal(catalog.getQuestionById("foreign-question-id"), undefined);
});

function assertIndependentReason(question) {
  const accepted = question.interaction.options.find(option => option.optionId === question.answer.optionId);
  assert.ok(accepted, question.questionId);
  assert.equal(question.feedback.reason.includes(accepted.text), false, `${question.questionId}: copied accepted option`);
  assert.doesNotMatch(question.feedback.reason, /In this case,/i);
}

test("P01/P02 cover exactly 19 + 17 current questions and reject a copied accepted option", () => {
  assert.equal(expectedIds.length, 36);
  assert.equal(new Set(expectedIds).size, 36);
  for (const id of expectedIds) {
    const question = bank.byId.get(id);
    assert.ok(question, id);
    assert.equal(validateQuestion(question).valid, true, id);
    assert.equal(question.answer.optionId, id.replace("ood-n02-", "").replace("-", "_") + "_cohesion");
    assertIndependentReason(question);
    const copied = structuredClone(question);
    const accepted = question.interaction.options.find(option => option.optionId === question.answer.optionId);
    copied.feedback.reason = `A generic rationale. In this case, ${accepted.text}`;
    assert.throws(() => assertIndependentReason(copied), /copied accepted option/);
  }
});

for (const id of expectedIds) test(`${id}: production scoring, feedback and presentation preserve stable IDs`, () => {
  const question = bank.byId.get(id);
  const original = structuredClone(question);
  const wrongIds = question.interaction.options.filter(option => option.optionId !== question.answer.optionId).map(option => option.optionId).sort();
  assert.deepEqual(question.feedback.messages.map(message => message.targetId).sort(), wrongIds);
  for (let seed = 0; seed < 8; seed++) {
    const occurrence = `ood-reason-20261022:${id}:${seed}`;
    const order = prepareCanonicalOptionOrder(question, occurrence, pin);
    assert.deepEqual(order, prepareCanonicalOptionOrder(question, occurrence, pin));
    const displayed = projectCanonicalQuestionInSessionOrder(question, JSON.parse(JSON.stringify(order)));
    const view = buildCanonicalInteractionViewModel(displayed, null);
    assert.deepEqual(Object.keys(view.model).sort(), ["accessibility", "renderer"]);
    assert.deepEqual(view.model.renderer.options.map(option => option.id), order);
    assert.ok(view.model.renderer.options.every(option => option.selected === false));
    assert.equal(JSON.stringify(toCanonicalQuestionViewModel(displayed)).includes(question.feedback.reason), false);
    for (const { optionId } of question.interaction.options) {
      const response = JSON.parse(JSON.stringify({ type: "choice_single", optionId }));
      const result = scoreCanonicalQuestion(displayed, response);
      const correct = optionId === question.answer.optionId;
      assert.equal(result.kind, correct ? "correct" : "incorrect");
      assert.equal(result.earnedPoints, correct ? 1 : 0);
      assert.equal(result.maxPoints, 1);
      assert.equal(scoreQuestion(displayed, response).earnedPoints, result.earnedPoints);
      const feedback = composeCanonicalFeedback(displayed, response, result);
      assert.equal(feedback.reason, question.feedback.reason);
      assert.deepEqual(feedback.details, question.feedback.details);
      assert.deepEqual(feedback.messages, question.feedback.messages.filter(message => message.kind === "wrong_option" && message.targetId === optionId));
    }
    for (const optionId of ["foreign-option"]) {
      const response = { type: "choice_single", optionId };
      assert.equal(scoreCanonicalQuestion(displayed, response).earnedPoints, 0);
      assert.equal(scoreQuestion(displayed, response).earnedPoints, 0);
      assert.throws(() => composeCanonicalFeedback(displayed, response, scoreCanonicalQuestion(displayed, response)), /incomplete or invalid/);
    }
    assert.throws(() => projectCanonicalQuestionInSessionOrder(question, order.map(() => order[0])), /Saved control order/);
  }
  assert.deepEqual(question, original);
});
