import assert from "node:assert/strict";
import test from "node:test";
import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";
import { loadCurrentQuestionBank } from "./helpers/current-question-bank.mjs";

const bank = await loadCurrentQuestionBank("object-oriented-design-interview");
const expectedIds = ["ood-n01-b06-i022", "ood-n01-b07-i027", ...[1, 2].flatMap((unit) => Array.from({ length: 19 }, (_, i) =>
  `ood-n02-b0${unit}-i${String(i + 20).padStart(3, "0")}`).filter((id) => id !== "ood-n02-b02-i023"))];
const get = (id) => {
  const question = bank.byId.get(id);
  assert.ok(question, `current bank includes ${id}`);
  return question;
};

function assertSpecificReason(question) {
  const accepted = question.interaction.options.find((option) => option.optionId === question.answer.optionId);
  assert.equal(question.feedback.reason.includes(accepted.text), false, question.questionId);
  assert.doesNotMatch(question.feedback.reason, /In this case,/i, question.questionId);
  assert.ok(question.feedback.reason.split(/\s+/).length >= 10, question.questionId);
}

test("the current bank contains the expected explanation cases with no accidental missing item", () => {
  assert.equal(expectedIds.length, 39);
  for (const id of expectedIds) {
    const question = get(id);
    assert.equal(validateQuestion(question).valid, true, id);
    assertSpecificReason(question);
  }
});

test("each current option keeps its score and wrong-option feedback after shuffle", () => {
  for (const id of expectedIds) {
    const question = get(id);
    const wrongIds = question.interaction.options.filter((option) => option.optionId !== question.answer.optionId).map((option) => option.optionId).sort();
    assert.deepEqual(question.feedback.messages.map((message) => message.targetId).sort(), wrongIds, id);
    const shuffled = { ...question, interaction: { ...question.interaction, options: [...question.interaction.options].reverse() } };
    assert.equal(scoreQuestion(shuffled, question.answer).earnedPoints, 1, id);
    for (const { optionId } of shuffled.interaction.options) {
      const result = scoreQuestion(shuffled, { type: "choice_single", optionId });
      const correct = optionId === question.answer.optionId;
      assert.equal(result.status, correct ? "correct" : "incorrect", `${id}/${optionId}`);
      assert.equal(result.earnedPoints, correct ? 1 : 0, `${id}/${optionId}`);
      assert.equal(question.feedback.messages.some((message) => message.targetId === optionId), !correct, `${id}/${optionId}`);
    }
  }
});

test("capacity explanations accept a supplied-facts entity method", () => {
  const capacity = get("ood-n01-b06-i022");
  assert.match(capacity.feedback.reason, /Room method.*could also be valid/i);
  assert.match(capacity.feedback.details.boundaryOrTradeoff, /Room\.canHost\(attendeeCount\).*without fetching/);
  assert.match(capacity.feedback.messages.find((message) => message.targetId === "room_owns_all").text, /entire scheduling policy.*local capacity check/);
});

test("authorization distinguishes absent, stale, and unbound evidence from a current bound object", () => {
  const authorization = get("ood-n01-b07-i027");
  assert.match(authorization.feedback.details.boundaryOrTradeoff, /absent, stale, or not bound.*obtain current authorization/);
  assert.match(authorization.feedback.details.boundaryOrTradeoff, /already loaded and bound.*another lookup adds no required evidence/);
  assert.match(authorization.prompt, /ApprovalRecord|steward|transfer/i);
  const wrong = authorization.interaction.options.filter((option) => option.optionId !== authorization.answer.optionId);
  assert.equal(wrong.length, 3);
  assert.equal(new Set(authorization.feedback.messages.map((message) => message.targetId)).size, 3);
});
