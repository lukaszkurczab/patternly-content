import assert from "node:assert/strict";
import test from "node:test";
import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";
import { loadCurrentQuestionBank } from "./helpers/current-question-bank.mjs";

const { byId, artifact } = await loadCurrentQuestionBank("coding-interview-dsa-problem-solving");
const id = "alg-contrast-binary-scan-correctness-006";
const question = byId.get(id);

test("one-time scan versus sorting keeps its independent answer and concrete cost explanation", () => {
  assert.ok(question);
  const validated = validateQuestion(question);
  assert.equal(validated.valid, true, validated.errors.join("\n"));
  assert.doesNotMatch(question.prompt + JSON.stringify(question.feedback.details), /\b(?:Option|Strategy)\s+[AB]\b/);
  assert.match(question.prompt, /one-time lookup.*linear scan.*sorts a copy.*single query/);
  assert.match(question.feedback.details.blocks[1].text, /copying.*comparison sorting.*lookup/);
  assert.equal(question.answer.optionId, "scan");
  for (const options of [question.interaction.options, [...question.interaction.options].reverse()]) {
    const candidate = { ...question, interaction: { ...question.interaction, options } };
    for (const option of options) {
      const result = scoreQuestion(candidate, { type: "choice_single", optionId: option.optionId });
      assert.equal(result.status, option.optionId === "scan" ? "correct" : "incorrect");
      assert.equal(result.earnedPoints, option.optionId === "scan" ? 1 : 0);
      if (option.optionId !== "scan") assert.equal(question.feedback.messages.filter(message => message.targetId === option.optionId).length, 1);
    }
  }
});

test("current canonical output carries the authored scan-versus-sort case exactly", () => {
  assert.deepEqual(artifact.questions.find(item => item.questionId === id), question);
});
