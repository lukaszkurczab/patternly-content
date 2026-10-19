import assert from "node:assert/strict";
import test from "node:test";
import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";
import { loadCurrentQuestionBank } from "./helpers/current-question-bank.mjs";

const bank = await loadCurrentQuestionBank("aws-certified-solutions-architect-associate");
const currentIds = [
  "aws-saa-c03-AWSSAA-N04-B01-011", "aws-saa-c03-AWSSAA-N04-B01-015", "aws-saa-c03-AWSSAA-N04-B02-006",
  "aws-saa-c03-AWSSAA-N04-B03-016", "aws-saa-c03-AWSSAA-N04-B05-011", "aws-saa-c03-AWSSAA-N04-B05-015",
  "aws-saa-c03-AWSSAA-N04-B06-010", "aws-saa-c03-AWSSAA-N04-B06-011", "aws-saa-c03-AWSSAA-N04-B06-012",
  "aws-saa-c03-AWSSAA-N04-B06-013", "aws-saa-c03-AWSSAA-N04-B06-014", "aws-saa-c03-AWSSAA-N04-B06-015",
  "aws-saa-c03-AWSSAA-N04-B06-016", "aws-saa-c03-AWSSAA-N04-B06-018", "aws-saa-c03-AWSSAA-N04-B07-012",
  "aws-saa-c03-AWSSAA-N07-B01-007", "aws-saa-c03-AWSSAA-N07-B01-010", "aws-saa-c03-AWSSAA-N07-B02-013",
  "aws-saa-c03-AWSSAA-N07-B04-005", "aws-saa-c03-AWSSAA-N07-B04-006", "aws-saa-c03-AWSSAA-N07-B05-001",
  "aws-saa-c03-AWSSAA-N07-B05-002", "aws-saa-c03-AWSSAA-N07-B05-003", "aws-saa-c03-AWSSAA-N07-B05-004",
  "aws-saa-c03-AWSSAA-N07-B05-005-saa20261011", "aws-saa-c03-AWSSAA-N07-B05-006",
  "aws-saa-c03-AWSSAA-N07-B06-012", "aws-saa-c03-AWSSAA-N07-B07-006"
];
const keyMechanisms = new Map([
  ["aws-saa-c03-AWSSAA-N04-B01-011", /MFA policy|enrollment|challenge flow/i],
  ["aws-saa-c03-AWSSAA-N04-B01-015", /Cognito.*authorizer|OAuth access-token scopes/i],
  ["aws-saa-c03-AWSSAA-N04-B02-006", /task execution role.*GetSecretValue/i],
  ["aws-saa-c03-AWSSAA-N04-B03-016", /path-scoped exception/i],
  ["aws-saa-c03-AWSSAA-N04-B05-015", /origin group.*primary and secondary origin/i],
  ["aws-saa-c03-AWSSAA-N04-B06-010", /Security Hub CSPM.*cross-account finding aggregation/i],
  ["aws-saa-c03-AWSSAA-N07-B02-013", /300-second per-message delay/i],
  ["aws-saa-c03-AWSSAA-N07-B04-005", /EventBridge archive.*retention period/i],
  ["aws-saa-c03-AWSSAA-N07-B05-003", /active\/standby.*Availability Zones/i],
  ["aws-saa-c03-AWSSAA-N07-B05-005-saa20261011", /Stage the migration.*checkpoint.*drain/i],
  ["aws-saa-c03-AWSSAA-N07-B06-012", /Standard workflow execution history/i]
]);

test("the 28 current AWS corrections are in the built artifact with expected keys and diagnostic feedback", () => {
  assert.equal(currentIds.length, 28);
  assert.equal(new Set(currentIds).size, 28);
  for (const id of currentIds) {
    const question = bank.byId.get(id);
    assert.ok(question, id);
    assert.equal(validateQuestion(question).valid, true, id);
    const optionIds = question.interaction.options.map((option) => option.optionId);
    assert.equal(new Set(optionIds).size, optionIds.length, id);
    assert.equal(question.answer.optionId, "A", `${id}: response is the independently expected AWS mechanism`);
    const wrongIds = optionIds.filter((optionId) => optionId !== question.answer.optionId).sort();
    assert.deepEqual(question.feedback.messages.map((message) => message.targetId).sort(), wrongIds, id);
    assert.ok(question.feedback.messages.every((message) => message.kind === "wrong_option" && message.text.trim().length > 25), id);
    for (const optionId of optionIds) {
      const result = scoreQuestion(question, { type: "choice_single", optionId });
      assert.equal(result.status, optionId === question.answer.optionId ? "correct" : "incorrect", `${id}/${optionId}`);
      assert.equal(result.earnedPoints, optionId === question.answer.optionId ? 1 : 0, `${id}/${optionId}`);
    }
    const shuffled = { ...question, interaction: { ...question.interaction, options: [...question.interaction.options].reverse() } };
    assert.equal(scoreQuestion(shuffled, question.answer).earnedPoints, 1, `${id}: option order does not change the key`);
  }
  for (const [id, mechanism] of keyMechanisms) {
    const question = bank.byId.get(id);
    assert.ok(question, id);
    assert.match(question.interaction.options.find((option) => option.optionId === question.answer.optionId).text, mechanism, id);
  }
});

test("the current AWS source and temporary canonical artifact contain identical question records", () => {
  for (const id of currentIds) assert.ok(bank.artifact.questions.some((question) => question.questionId === id), id);
  assert.deepEqual(bank.artifact.questions, bank.questions);
});
