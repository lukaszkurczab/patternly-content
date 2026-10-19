import assert from "node:assert/strict";
import test from "node:test";

import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";
import { loadCurrentQuestionBank } from "./helpers/current-question-bank.mjs";

const trackId = "object-oriented-design-interview";

test("current OOD requirements question 18 preserves single-choice scoring and targeted feedback", async () => {
  const { byId } = await loadCurrentQuestionBank(trackId);
  const question = byId.get("ood-n01-b01-i018");
  assert.ok(question);
  assert.equal(question.mentalUnitId, "OOD-N01-B01");
  assert.equal(question.interaction.type, "choice_single");
  assert.equal(question.interaction.scoringMethod, "exact_selected_set");
  assert.equal(validateQuestion(question).valid, true);

  const optionIds = question.interaction.options.map(({ optionId }) => optionId);
  assert.equal(new Set(optionIds).size, optionIds.length);
  for (const optionId of optionIds) {
    const accepted = optionId === question.answer.optionId;
    const score = scoreQuestion(question, { type: "choice_single", optionId });
    assert.equal(score.status, accepted ? "correct" : "incorrect", optionId);
    assert.equal(score.earnedPoints, accepted ? 1 : 0, optionId);
    assert.equal(question.feedback.messages.some((message) => message.targetId === optionId), !accepted, optionId);
  }
});
