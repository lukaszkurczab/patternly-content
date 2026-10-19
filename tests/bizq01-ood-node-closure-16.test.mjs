import assert from "node:assert/strict";
import test from "node:test";

import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";
import { loadCurrentQuestionBank } from "./helpers/current-question-bank.mjs";

test("current OOD N01-B02 questions remain complete and score consistently under option shuffling", async () => {
  const { questions } = await loadCurrentQuestionBank("object-oriented-design-interview");
  const unitQuestions = questions.filter((question) => question.mentalUnitId === "OOD-N01-B02");
  assert.ok(unitQuestions.length >= 10, "the current use-case unit has a meaningful practice set");
  for (const question of unitQuestions) {
    assert.equal(validateQuestion(question).valid, true, question.questionId);
    const originalIds = question.interaction.options.map(({ optionId }) => optionId);
    assert.equal(new Set(originalIds).size, originalIds.length, question.questionId);
    for (const optionId of originalIds) {
      const expected = optionId === question.answer.optionId ? "correct" : "incorrect";
      const normal = scoreQuestion(question, { type: "choice_single", optionId });
      const shuffled = scoreQuestion({ ...question, interaction: { ...question.interaction, options: [...question.interaction.options].reverse() } },
        { type: "choice_single", optionId });
      assert.equal(normal.status, expected, `${question.questionId}/${optionId}`);
      assert.equal(shuffled.status, expected, `${question.questionId}/${optionId} after shuffle`);
      assert.equal(normal.earnedPoints, shuffled.earnedPoints, `${question.questionId}/${optionId}`);
    }
  }
});
