import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const proof = JSON.parse(await readFile(path.join(root, "evidence/business-quality/ood-20261013-explanation-corrections.json"), "utf8"));
const sourceById = new Map();
for (const { sourceFile } of proof.sourceFiles) {
  for (const question of JSON.parse(await readFile(path.join(root, sourceFile), "utf8"))) sourceById.set(question.questionId, question);
}
const expectedIds = ["ood-n01-b06-i022", "ood-n01-b07-i027", ...[1, 2].flatMap(unit => Array.from({ length: 19 }, (_, i) => `ood-n02-b0${unit}-i${String(i + 20).padStart(3, "0")}`).filter(id => id !== "ood-n02-b02-i023"))];

function changedPaths(before, after, prefix = "") {
  if (before === after) return [];
  if (before && after && typeof before === "object" && typeof after === "object") {
    assert.deepEqual(Object.keys(before), Object.keys(after), prefix);
    return Object.keys(before).flatMap(key => changedPaths(before[key], after[key], `${prefix}/${key}`));
  }
  return [prefix];
}
function assertSpecificReason(question) {
  const accepted = question.interaction.options.find(option => option.optionId === question.answer.optionId);
  assert.equal(question.feedback.reason.includes(accepted.text), false, question.questionId);
  assert.equal(/In this case,/i.test(question.feedback.reason), false, question.questionId);
}

test("only the 39 authorized questions and explanation fields change; identity and scoring contracts remain intact", () => {
  assert.equal(proof.items.length, 39);
  assert.deepEqual(proof.items.map(item => item.questionId).sort(), expectedIds.sort());
  for (const item of proof.items) {
    assert.deepEqual(sourceById.get(item.questionId), item.currentQuestion);
    const expectedPaths = item.questionId === "ood-n01-b06-i022"
      ? ["/feedback/reason", "/feedback/details/mechanismOrProperty", "/feedback/details/errorCorrection", "/feedback/details/boundaryOrTradeoff", "/feedback/messages/1/text"]
      : item.questionId === "ood-n01-b07-i027" ? ["/feedback/details/boundaryOrTradeoff"] : ["/feedback/reason"];
    assert.deepEqual(changedPaths(item.beforeQuestion, item.currentQuestion).sort(), expectedPaths.sort(), item.questionId);
  }
  assert.equal(proof.items.some(item => item.questionId === "ood-n02-b02-i023"), false);
});

for (const item of proof.items) {
  test(`${item.questionId}: every option scores identically before/after and after shuffle; wrong feedback follows option IDs`, () => {
    const question = sourceById.get(item.questionId);
    for (const original of [item.beforeQuestion, question]) {
      for (const candidate of [original, { ...original, interaction: { ...original.interaction, options: [...original.interaction.options].reverse() } }]) {
        assert.equal(validateQuestion(candidate).valid, true);
        const wrongIds = candidate.interaction.options.filter(option => option.optionId !== candidate.answer.optionId).map(option => option.optionId).sort();
        assert.deepEqual(candidate.feedback.messages.filter(message => message.kind === "wrong_option").map(message => message.targetId).sort(), wrongIds);
        for (const { optionId } of candidate.interaction.options) {
          const result = scoreQuestion(candidate, { type: "choice_single", optionId });
          const correct = optionId === candidate.answer.optionId;
          assert.equal(result.status, correct ? "correct" : "incorrect", optionId);
          assert.equal(result.earnedPoints, correct ? 1 : 0, optionId);
          assert.equal(candidate.feedback.messages.some(message => message.kind === "wrong_option" && message.targetId === optionId), !correct);
        }
      }
    }
    if (item.questionId.startsWith("ood-n02-")) {
      assertSpecificReason(question);
      assert.throws(() => assertSpecificReason(item.beforeQuestion), assert.AssertionError, "old copied-answer reason must fail the editorial regression check");
    }
    const invalid = structuredClone(question);
    invalid.feedback.messages[0].targetId = invalid.answer.optionId;
    assert.throws(() => assert.deepEqual(invalid.feedback.messages.map(message => message.targetId).sort(), invalid.interaction.options.filter(option => option.optionId !== invalid.answer.optionId).map(option => option.optionId).sort()), assert.AssertionError, "ID-bound feedback check rejects a message targeting the accepted answer");
  });
}

test("capacity explanation permits a supplied-facts entity method; authorization boundary contrasts absent, stale and unbound evidence", () => {
  const capacity = sourceById.get("ood-n01-b06-i022");
  assert.match(capacity.feedback.reason, /Room method.*could also be valid/);
  assert.match(capacity.feedback.details.boundaryOrTradeoff, /Room\.canHost\(attendeeCount\).*without fetching/);
  assert.match(capacity.feedback.messages.find(message => message.targetId === "room_owns_all").text, /entire scheduling policy.*local capacity check/);
  const transfer = sourceById.get("ood-n01-b07-i027");
  assert.match(transfer.feedback.details.boundaryOrTradeoff, /absent, stale, or not bound.*obtain current authorization/);
  assert.match(transfer.feedback.details.boundaryOrTradeoff, /already loaded and bound.*another lookup adds no required evidence/);
});
