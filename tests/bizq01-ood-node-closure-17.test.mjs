import assert from "node:assert/strict";
import test from "node:test";

import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";
import { loadCurrentQuestionBank } from "./helpers/current-question-bank.mjs";

test("current OOD N01-B03 questions keep valid option-level feedback with no answer leakage", async () => {
  const { questions } = await loadCurrentQuestionBank("object-oriented-design-interview");
  const unitQuestions = questions.filter((question) => question.mentalUnitId === "OOD-N01-B03");
  assert.ok(unitQuestions.length > 0, "current N01-B03 questions are present in the canonical bank");
  for (const question of unitQuestions) {
    assert.equal(validateQuestion(question).valid, true, question.questionId);
    const optionIds = question.interaction.options.map(({ optionId }) => optionId);
    const expectedWrong = optionIds.filter((optionId) => optionId !== question.answer.optionId).sort();
    const wrongFeedback = question.feedback.messages.filter((message) => message.kind === "wrong_option");
    assert.deepEqual(wrongFeedback.map((message) => message.targetId).sort(), expectedWrong, question.questionId);
    assert.equal(question.feedback.messages.some((message) => message.targetId === question.answer.optionId), false, question.questionId);
    for (const optionId of optionIds) {
      assert.equal(scoreQuestion(question, { type: "choice_single", optionId }).status,
        optionId === question.answer.optionId ? "correct" : "incorrect", `${question.questionId}/${optionId}`);
    }
  }
});
