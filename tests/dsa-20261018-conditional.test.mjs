import assert from "node:assert/strict";
import test from "node:test";
import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";
import { loadCurrentQuestionBank } from "./helpers/current-question-bank.mjs";

const trackId = "coding-interview-dsa-problem-solving";
const bank = await loadCurrentQuestionBank(trackId);
const currentIds = [
  "alg-arrays-duplicate-handling-019",
  "alg-arrays-duplicate-handling-020",
  "alg-arrays-frequency-state-021",
  "alg-arrays-normalization-comparison-019",
  "alg-arrays-output-space-021",
  "alg-arrays-stable-compaction-022",
  "alg-arrays-stable-compaction-023"
];
const currentPairs = [
  ["alg-arrays-duplicate-handling-008", "alg-arrays-duplicate-handling-020"],
  ["alg-arrays-duplicate-handling-010", "alg-arrays-duplicate-handling-019"],
  ["alg-arrays-frequency-state-018", "alg-arrays-frequency-state-021"],
  ["alg-arrays-normalization-comparison-007", "alg-arrays-normalization-comparison-019"],
  ["alg-arrays-output-space-007", "alg-arrays-output-space-021"],
  ["alg-arrays-stable-compaction-003", "alg-arrays-stable-compaction-023"],
  ["alg-arrays-stable-compaction-019", "alg-arrays-stable-compaction-022"]
];
const get = (id) => {
  const question = bank.byId.get(id);
  assert.ok(question, `current bank includes ${id}`);
  return question;
};

test("the seven current conditional cases have distinct active IDs and satisfy the question contract", () => {
  assert.equal(new Set(currentIds).size, 7);
  for (const id of currentIds) {
    const question = get(id);
    assert.equal(question.questionId, id);
    assert.equal(validateQuestion(question).valid, true, JSON.stringify(validateQuestion(question).errors));
    assert.ok(question.prompt.trim().length > 30, id);
  }
  for (const [retiredId, currentId] of currentPairs) {
    assert.ok(!bank.byId.has(retiredId), `${retiredId} is not an active duplicate of its current successor`);
    assert.ok(bank.byId.has(currentId), `${retiredId} has the intended current case ${currentId}`);
  }
});

test("single-choice keys score one, while each plausible foil scores zero", () => {
  for (const id of currentIds) {
    const question = get(id);
    if (question.interaction.type !== "choice_single") continue;
    assert.equal(scoreQuestion(question, question.answer).earnedPoints, 1, id);
    for (const option of question.interaction.options) {
      const result = scoreQuestion(question, { type: "choice_single", optionId: option.optionId });
      assert.equal(result.earnedPoints, option.optionId === question.answer.optionId ? 1 : 0, `${id}/${option.optionId}`);
    }
  }
});

test("package 08 keeps normalization transfer items with separate questions and attached case facts", () => {
  const first = get("alg-arrays-normalization-comparison-001");
  const last = get("alg-arrays-normalization-comparison-018");
  assert.match(first.prompt, /normaliz|canonical|case|separator/i);
  assert.match(last.prompt, /normaliz|canonical|case|separator/i);
  assert.notEqual(first.prompt, last.prompt);
  assert.notDeepEqual(first.interaction, last.interaction);
  assert.ok(get("alg-arrays-normalization-comparison-019"));
  assert.ok(bank.questions.every((question) => question.questionId === question.questionId));
});

test("normalization reaches a fixed point and distinguishes input storage from auxiliary space", () => {
  const normalize = (value) => value.replaceAll("-", "").replace(/[A-Z]/g, (letter) => letter.toLowerCase());
  const first = normalize("B--a-A");
  assert.equal(first, "baa");
  assert.equal(normalize(first), first);
  assert.notEqual("baa".split("").sort().join(""), first);
  assert.notEqual([...new Set(first)].join(""), first);

  const question = get("alg-arrays-output-space-021");
  assert.match(question.prompt, /caller-owned input array/);
  assert.match(question.prompt, /excluded from auxiliary space/);
  assert.equal(question.answer.optionId, "correct_storage_roles");
  assert.match(question.interaction.options.find((option) => option.optionId === question.answer.optionId).text,
    /input storage; temporary set = auxiliary space; returned array = output space/);
});

test("rejected compaction values advance read while preserving write and the valid prefix", () => {
  const buffer = [2, 3, 4];
  let read = 1;
  let write = 1;
  const current = buffer[read];
  assert.equal(current, 3);
  assert.equal(current % 2 === 0, false);
  read += 1;
  assert.deepEqual({ read, write, prefix: buffer.slice(0, write) }, { read: 2, write: 1, prefix: [2] });

  const next = buffer[read];
  assert.equal(next, 4);
  buffer[write] = next;
  write += 1;
  read += 1;
  assert.deepEqual({ read, write, prefix: buffer.slice(0, write) }, { read: 3, write: 2, prefix: [2, 4] });
  assert.match(get("alg-arrays-stable-compaction-022").prompt, /read\s*=\s*1|read pointer|read index/i);
});

test("multiplicity and stable compaction counterexamples distinguish the current decisions", () => {
  const counts = { 4: 2, 2: 1, 3: 0 };
  const grouped = Object.entries(counts).filter(([, count]) => count > 0)
    .sort(([left], [right]) => Number(right) - Number(left))
    .flatMap(([value, count]) => Array(count).fill(Number(value)));
  assert.deepEqual(grouped, [4, 4, 2]);
  assert.notDeepEqual([4, 2], grouped);
  assert.notDeepEqual([2, 4, 4], grouped);
  assert.notDeepEqual([4, 4, 2, 3], grouped);
  assert.match(get("alg-arrays-duplicate-handling-019").prompt, /omitting zero-count keys/);
  assert.match(get("alg-arrays-duplicate-handling-020").prompt, /n >= 1/);

  const countsOf = (value) => [...value].reduce((result, char) => result.set(char, (result.get(char) ?? 0) + 1), new Map());
  assert.deepEqual(countsOf("aab"), countsOf("aba"));
  assert.notDeepEqual(countsOf("aab"), countsOf("abb"));
  const compact = (values, limit, keep) => values.slice(0, limit).filter(keep);
  assert.deepEqual(compact([4, 2, 6, 5], 2, (value) => value % 2 === 0), [4, 2]);
  assert.notDeepEqual(compact([4, 2, 6, 5], 2, (value) => value % 2 === 0), [2, 4]);
  assert.deepEqual([2, 3, 4].filter((value) => value % 2 === 0), [2, 4]);
});
