import assert from "node:assert/strict";
import test from "node:test";

import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";
import { loadCurrentQuestionBank } from "./helpers/current-question-bank.mjs";

test("current OOD N01-B01 learning unit retains its authored 15-question practice set", async () => {
  const { questions, byId } = await loadCurrentQuestionBank("object-oriented-design-interview");
  const unitQuestions = questions.filter((question) => question.mentalUnitId === "OOD-N01-B01");
  const expectedIds = Array.from({ length: 15 }, (_, index) => `ood-n01-b01-i${String(index + 20).padStart(3, "0")}`);
  assert.deepEqual(unitQuestions.map((question) => question.questionId).filter((id) => expectedIds.includes(id)).sort(), expectedIds);

  for (const questionId of expectedIds) {
    const question = byId.get(questionId);
    assert.equal(validateQuestion(question).valid, true, questionId);
    assert.ok(question.prompt.length > 40, `${questionId}: substantive scenario prompt`);
    const options = question.interaction.options.map(({ optionId }) => optionId);
    assert.equal(new Set(options).size, options.length, `${questionId}: unique option IDs`);
    for (const optionId of options) {
      const accepted = optionId === question.answer.optionId;
      const score = scoreQuestion(question, { type: "choice_single", optionId });
      assert.equal(score.status, accepted ? "correct" : "incorrect", `${questionId}/${optionId}`);
      assert.equal(score.earnedPoints, accepted ? 1 : 0, `${questionId}/${optionId}`);
    }
  }
});
