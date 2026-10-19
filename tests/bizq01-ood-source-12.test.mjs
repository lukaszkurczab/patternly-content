import assert from "node:assert/strict";
import test from "node:test";

import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";
import { loadCurrentQuestionBank } from "./helpers/current-question-bank.mjs";

test("current OOD question 19 keeps all authored wrong-answer explanations bound to their options", async () => {
  const { byId } = await loadCurrentQuestionBank("object-oriented-design-interview");
  const question = byId.get("ood-n01-b01-i019");
  assert.ok(question);
  assert.equal(question.mentalUnitId, "OOD-N01-B01");
  assert.equal(validateQuestion(question).valid, true);

  const optionIds = question.interaction.options.map(({ optionId }) => optionId);
  const wrongIds = optionIds.filter((optionId) => optionId !== question.answer.optionId).sort();
  const feedbackIds = question.feedback.messages.filter((item) => item.kind === "wrong_option").map((item) => item.targetId).sort();
  assert.deepEqual(feedbackIds, wrongIds);
  for (const optionId of optionIds) {
    assert.equal(scoreQuestion(question, { type: "choice_single", optionId }).status,
      optionId === question.answer.optionId ? "correct" : "incorrect");
  }
  assert.equal(question.feedback.messages.some((item) => item.targetId === question.answer.optionId), false);
});
