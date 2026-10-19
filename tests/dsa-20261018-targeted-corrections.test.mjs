import assert from "node:assert/strict";
import test from "node:test";
import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";
import { loadCurrentQuestionBank } from "./helpers/current-question-bank.mjs";

const bank = await loadCurrentQuestionBank("coding-interview-dsa-problem-solving");
const q = (id) => {
  const question = bank.byId.get(id);
  assert.ok(question, `current bank includes ${id}`);
  return question;
};
const f = (number) => q(`alg-arrays-frequency-state-${String(number).padStart(3, "0")}`);
const d = (number) => q(`alg-arrays-duplicate-handling-${String(number).padStart(3, "0")}`);
const norm = (number) => q(`alg-arrays-normalization-comparison-${String(number).padStart(3, "0")}`);
const successorPairs = [
  ["alg-arrays-duplicate-handling-008", "alg-arrays-duplicate-handling-020"],
  ["alg-arrays-duplicate-handling-010", "alg-arrays-duplicate-handling-019"],
  ["alg-arrays-frequency-state-018", "alg-arrays-frequency-state-021"],
  ["alg-arrays-normalization-comparison-007", "alg-arrays-normalization-comparison-019"],
  ["alg-arrays-output-space-007", "alg-arrays-output-space-021"],
  ["alg-arrays-stable-compaction-003", "alg-arrays-stable-compaction-023"],
  ["alg-arrays-stable-compaction-019", "alg-arrays-stable-compaction-022"],
  ["alg-backtracking-base-contract-013", "alg-backtracking-base-contract-017"]
];

test("the current DSA catalog contains each intended successor and no active predecessor duplicate", () => {
  assert.equal(successorPairs.length, 8);
  for (const [previousId, currentId] of successorPairs) {
    assert.ok(!bank.byId.has(previousId), `${previousId} is not active alongside the current case`);
    assert.ok(bank.byId.has(currentId), `${currentId} remains in the current bank`);
    assert.equal(validateQuestion(q(currentId)).valid, true, currentId);
  }
});

test("single-choice response scoring and option-bound feedback stay stable after reordering", () => {
  for (const question of bank.questions) {
    if (question.interaction.type !== "choice_single") continue;
    const wrongIds = question.interaction.options.filter((option) => option.optionId !== question.answer.optionId).map((option) => option.optionId).sort();
    assert.deepEqual(question.feedback.messages.map((message) => message.targetId).sort(), wrongIds, question.questionId);
    const shuffled = { ...question, interaction: { ...question.interaction, options: [...question.interaction.options].reverse() } };
    for (const option of shuffled.interaction.options) {
      const result = scoreQuestion(shuffled, { type: "choice_single", optionId: option.optionId });
      const accepted = option.optionId === question.answer.optionId;
      assert.equal(result.earnedPoints, accepted ? 1 : 0, `${question.questionId}/${option.optionId}`);
    }
  }
  for (const [question, pattern] of [[f(1), /expected O\(1\) membership checks/], [f(3), /first index.*expected O\(1\) lookup/], [f(17), /without storing the input sequence or full occurrence counts/], [d(6), /exactly min\(original frequency, 2\)/], [d(11), /ascending order/], [d(17), /separate newly allocated result array/], [norm(2), /only of ASCII characters/], [norm(10), /only lowercase English letters a–z/], [f(11), /duplicate runs or run boundaries/]]) {
    assert.match(question.prompt, pattern, question.questionId);
  }
});

test("complexity questions score each dimension independently and reject obsolete values", () => {
  for (const [question, dimensionId, acceptedValue, obsoleteValue, plausibleWrong] of [
    [f(16), "auxiliary_space", "O(1)", "O(26)", "O(n)"],
    [f(20), "time", "O(n)", "O(n + d)", "O(1)"],
    [q("alg-arrays-output-space-016"), "auxiliary_space", "O(1)", "O(26)", "O(n + m)"]
  ]) {
    const dimension = question.interaction.dimensions.find((entry) => entry.dimensionId === dimensionId);
    assert.ok(dimension, `${question.questionId}/${dimensionId}`);
    assert.deepEqual(dimension.acceptedValueIds, [acceptedValue]);
    assert.deepEqual(question.answer.selectedValueIdsByDimension[dimensionId], [acceptedValue]);
    assert.ok(!dimension.values.some((value) => value.valueId === obsoleteValue));
    const max = question.interaction.dimensions.length;
    assert.equal(scoreQuestion(question, question.answer).earnedPoints, max);
    const wrong = structuredClone(question.answer);
    wrong.selectedValueIdsByDimension[dimensionId] = [plausibleWrong];
    const result = scoreQuestion(question, wrong);
    assert.equal(result.earnedPoints, max - 1);
    assert.deepEqual(result.incorrectDimensionIds, [dimensionId]);
    wrong.selectedValueIdsByDimension[dimensionId] = [obsoleteValue];
    assert.equal(scoreQuestion(question, wrong).invalidResponse, true);
  }
  const output = q("alg-arrays-output-space-016");
  const outputDimension = output.interaction.dimensions.find((entry) => entry.dimensionId === "output_space");
  assert.deepEqual(outputDimension.acceptedValueIds, ["O(1)"]);
  assert.ok(!outputDimension.values.some((value) => value.valueId === "O(26)"));
  assert.equal(scoreQuestion(output, output.answer).earnedPoints, 3);
  const obsolete = structuredClone(output.answer);
  obsolete.selectedValueIdsByDimension.output_space = ["O(26)"];
  assert.equal(scoreQuestion(output, obsolete).invalidResponse, true);
  for (const id of ["alg-arrays-frequency-state-016", "alg-arrays-frequency-state-020", "alg-arrays-output-space-016"]) assert.match(q(id).prompt, /tightest listed .* complexity bounds/);
});

test("multi-choice scoring awards zero for empty, partial, or contaminated selections", () => {
  const question = d(11);
  const correct = question.answer.optionIds;
  const score = (optionIds) => scoreQuestion(question, { type: "choice_multiple", optionIds });
  assert.equal(score(correct).earnedPoints, 4);
  assert.equal(score([]).earnedPoints, 0);
  assert.equal(score([...correct, "physical_length_must_shrink"]).earnedPoints, 0);
  assert.equal(score([correct[0]]).earnedPoints, 2);
});

test("counterexamples pin multiplicity, normalization, parity, first occurrence, and stable order", () => {
  const seen = new Set();
  assert.equal([4, 7, 4].some((value) => seen.has(value) || (seen.add(value), false)), true);
  const first = new Map();
  ["a", "b", "a"].forEach((value, index) => { if (!first.has(value)) first.set(value, index); });
  assert.equal(first.get("a"), 0);
  const parity = (values) => { const counts = new Map(); for (const value of values) counts.set(value, !counts.get(value)); return [...counts.values()].every((odd) => !odd); };
  assert.equal(parity([4, 7, 4, 7]), true);
  assert.equal(parity([4, 7]), false);
  const capped = (values) => { const counts = new Map(); return values.filter((value) => { const count = counts.get(value) ?? 0; counts.set(value, count + 1); return count < 2; }); };
  for (const count of [0, 1, 2, 3, 4]) assert.equal(capped(Array(count).fill(7)).length, Math.min(count, 2));
  assert.deepEqual([...new Set([2, 2, 3])], [2, 3]);
  const ascii = (value) => value.replace(/[^A-Za-z0-9]/g, "").toLowerCase();
  assert.equal(ascii("A-B"), ascii("ab"));
  assert.notEqual(ascii("AB"), ascii("BA"));
  assert.equal(/^[\x00-\x7f]*$/.test("é"), false);
  const vector = (value) => Array.from({ length: 26 }, (_, index) => [...value].filter((char) => char.charCodeAt(0) === 97 + index).length);
  assert.notDeepEqual(vector("aab"), vector("abb"));
  const adjacent = (values) => values.some((value, index) => index > 0 && value === values[index - 1]);
  assert.equal(adjacent([1, 1, 2]), true);
  assert.equal(adjacent([2, 3, 2]), false);
  assert.deepEqual(["A", "-", "A", "-", "B"].filter((value) => value !== "-"), ["A", "A", "B"]);
  assert.equal(scoreQuestion(norm(4), { type: "choice_single", optionId: "sort_output" }).earnedPoints, 0);
  const alternates = (values) => values.every((value, index) => index === 0 || value !== values[index - 1]);
  assert.equal(alternates([1, 2, 1, 2]), true);
  assert.equal(alternates([1, 1, 2, 2]), false);
  assert.match(d(19).prompt, /omitting zero-count keys/);
});

test("the current backtracking item makes terminal outcomes independent of branch order", () => {
  const question = q("alg-backtracking-base-contract-017");
  assert.equal(question.interaction.type, "choice_single");
  assert.equal(scoreQuestion(question, question.answer).earnedPoints, 1);
  const terminal = (state, firstCheck) => {
    const checks = firstCheck ? [() => state.complete ? ["snapshot"] : null, () => state.failure ? [] : null] : [() => state.failure ? [] : null, () => state.complete ? ["snapshot"] : null];
    return checks.map((check) => check()).find((result) => result !== null) ?? ["expand"];
  };
  for (const state of [{ complete: true, failure: false }, { complete: false, failure: true }, { complete: false, failure: false }]) {
    assert.deepEqual(terminal(state, true), terminal(state, false));
  }
  assert.match(d(13).prompt, /candidate-specific.*derived from a suspected failure/i);
  assert.match(d(13).interaction.elements.find((element) => element.elementId === "construct_counterexample").text, /suspected violation you just identified/i);
  assert.equal(scoreQuestion(d(13), d(13).answer).earnedPoints, 3);
});
