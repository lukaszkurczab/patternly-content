import assert from "node:assert/strict";
import test from "node:test";

import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";
import { loadCurrentQuestionBank } from "./helpers/current-question-bank.mjs";

test("current OOD object-responsibility units preserve answer identity and explanatory feedback", async () => {
  const { questions } = await loadCurrentQuestionBank("object-oriented-design-interview");
  const unitQuestions = questions.filter((question) => ["OOD-N02-B01", "OOD-N02-B02"].includes(question.mentalUnitId));
  assert.ok(unitQuestions.length > 0, "current OOD N02 responsibility questions exist");
  for (const question of unitQuestions) {
    assert.equal(validateQuestion(question).valid, true, question.questionId);
    const correctOption = question.interaction.options.find((option) => option.optionId === question.answer.optionId);
    assert.ok(correctOption, `${question.questionId}: authored answer points to a real option`);
    assert.ok(typeof question.feedback.reason === "string" && question.feedback.reason.length > 30,
      `${question.questionId}: successful answer has a substantive rationale`);
    assert.ok(question.feedback.details?.mechanismOrProperty && question.feedback.details?.scenarioApplication,
      `${question.questionId}: rationale explains the mechanism and scenario`);
    for (const option of question.interaction.options) {
      const result = scoreQuestion(question, { type: "choice_single", optionId: option.optionId });
      assert.equal(result.status, option.optionId === question.answer.optionId ? "correct" : "incorrect", `${question.questionId}/${option.optionId}`);
      assert.equal(result.earnedPoints, option.optionId === question.answer.optionId ? 1 : 0, `${question.questionId}/${option.optionId}`);
    }
  }
});
