import assert from "node:assert/strict";
import test from "node:test";

import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";
import { loadCurrentQuestionBank } from "./helpers/current-question-bank.mjs";

const currentQleAnswers = new Map([
  ["CCARP-D05-O02-qle-v2-context-budget-admission", "b"],
  ["CCARP-D05-O05-qle-v2-decision-path-provenance", "d"],
  ["CCARP-D06-O01-qle-v2-retention-assumption", "d"],
  ["CCARP-D06-O02-qle-v2-architecture-cost-volume", "b"],
  ["CCARP-D06-O03-qle-v2-scheduled-governance-review", "a"],
  ["CCARP-D06-O04-qle-v2-architecture-rationale-handoff", "d"],
  ["CCARP-D07-O02-qle-v2-generated-code-understanding", "d"],
  ["CCARP-D07-O03-qle-v2-spend-driver-diagnosis", "b"]
]);

test("current QLE questions have valid independent identities and retain their answer behavior", async () => {
  const { byId } = await loadCurrentQuestionBank("claude-certified-architect-professional-certification");
  assert.equal(new Set(currentQleAnswers.keys()).size, currentQleAnswers.size);
  for (const [questionId, expectedAnswerOptionId] of currentQleAnswers) {
    const question = byId.get(questionId);
    assert.ok(question, `${questionId} remains in current canonical source`);
    assert.equal(validateQuestion(question).valid, true, questionId);
    assert.equal(question.questionRelation, undefined, `${questionId} does not introduce a runtime predecessor alias`);
    assert.equal(question.answer.optionId, expectedAnswerOptionId, `${questionId}: current semantic answer remains correct`);
    const options = question.interaction.options.map(({ optionId }) => optionId);
    assert.equal(new Set(options).size, options.length, `${questionId}: unique options`);
    for (const optionId of options) {
      const correct = optionId === question.answer.optionId;
      assert.equal(scoreQuestion(question, { type: "choice_single", optionId }).status, correct ? "correct" : "incorrect", `${questionId}/${optionId}`);
    }
  }
});
