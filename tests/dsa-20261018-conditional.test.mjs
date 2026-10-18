import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { scoreQuestion, validateQuestion } from '../scripts/content/question-contract.mjs';

const root = new URL('../', import.meta.url);
const proof = JSON.parse(readFileSync(new URL('evidence/business-quality/dsa-20261018-conditional-verification.json', root)));
const items = new Map(proof.items.map((item) => [item.questionId, item]));
const source = (path) => JSON.parse(readFileSync(new URL(path, root)));

test('conditional DSA replacements use fresh identities and satisfy the canonical contract', () => {
  assert.equal(proof.items.length, 7);
  const replacementsByFile = new Map();
  for (const item of proof.items) {
    const entries = replacementsByFile.get(item.sourceFile) ?? [];
    entries.push(item);
    replacementsByFile.set(item.sourceFile, entries);
  }

  for (const [file, replacements] of replacementsByFile) {
    const questions = source(file);
    for (const item of replacements) {
      assert.equal(item.beforeQuestion.questionId, item.beforeQuestionId);
      assert.equal(item.currentQuestion.questionId, item.questionId);
      assert.equal(questions.filter((question) => question.questionId === item.beforeQuestionId).length, 0);
      assert.equal(questions.filter((question) => question.questionId === item.questionId).length, 1);
      const current = questions.find((question) => question.questionId === item.questionId);
      assert.deepEqual(current, item.currentQuestion);
      assert.equal(validateQuestion(current).valid, true, JSON.stringify(validateQuestion(current).errors));
    }
  }
});

test('all new single-choice options score exactly one for the key and zero for foils', () => {
  for (const item of items.values()) {
    const question = item.currentQuestion;
    assert.equal(question.interaction.type, 'choice_single');
    assert.equal(scoreQuestion(question, question.answer).earnedPoints, 1);
    for (const option of question.interaction.options) {
      const result = scoreQuestion(question, { type: 'choice_single', optionId: option.optionId });
      assert.equal(result.earnedPoints, option.optionId === question.answer.optionId ? 1 : 0, question.questionId);
    }
  }
});

test('the old ordering alternatives are valid traces that the old scorer under-scored', () => {
  const norm = items.get('alg-arrays-normalization-comparison-019').beforeQuestion;
  const output = items.get('alg-arrays-output-space-021').beforeQuestion;
  const compaction = items.get('alg-arrays-stable-compaction-022').beforeQuestion;

  assert.equal(scoreQuestion(norm, norm.answer).earnedPoints, 3);
  assert.equal(scoreQuestion(norm, {
    type: 'ordering',
    orderedElementIds: ['state_equivalence_rule', 'test_boundaries', 'normalize_both', 'compare_canonical_forms'],
  }).earnedPoints, 1);
  assert.equal(scoreQuestion(output, output.answer).earnedPoints, 3);
  assert.equal(scoreQuestion(output, {
    type: 'ordering',
    orderedElementIds: ['identify_required_result', 'identify_temporary_state', 'identify_input_storage', 'report_separate_bounds'],
  }).earnedPoints, 0);
  assert.equal(scoreQuestion(compaction, compaction.answer).earnedPoints, 3);
  assert.equal(scoreQuestion(compaction, {
    type: 'ordering',
    orderedElementIds: ['read_current', 'evaluate_false', 'advance_read', 'leave_write'],
  }).earnedPoints, 1);
});

test('the five package 08 pairs have explicit dispositions and preserve the transfer pair', () => {
  assert.equal(proof.package08PairVerdicts.length, 5);
  for (const verdict of proof.package08PairVerdicts) {
    assert.ok(verdict.positiveExample);
    assert.ok(verdict.negativeExample);
  }
  const skipped = proof.package08PairVerdicts.find((verdict) => verdict.verdict === 'SKIP_PEDAGOGICALLY_DISTINCT');
  assert.deepEqual(skipped.pair, ['alg-arrays-normalization-comparison-001', 'alg-arrays-normalization-comparison-018']);
  assert.deepEqual(skipped.unchangedQuestionIds, skipped.pair);
  assert.deepEqual(proof.items.map((item) => item.beforeQuestionId).sort(), [
    'alg-arrays-duplicate-handling-008',
    'alg-arrays-duplicate-handling-010',
    'alg-arrays-frequency-state-018',
    'alg-arrays-normalization-comparison-007',
    'alg-arrays-output-space-007',
    'alg-arrays-stable-compaction-003',
    'alg-arrays-stable-compaction-019',
  ].sort());
  for (const file of ['duplicate_handling.json', 'frequency_and_seen_state.json', 'normalization_and_comparison.json', 'output_contract_and_space.json', 'stable_in_place_compaction.json']) {
    const questions = source(`content/coding-interview-dsa-problem-solving/arrays_and_strings/${file}`);
    assert.deepEqual(questions.map((question) => question.questionId), questions.map((question) => question.questionId).toSorted());
  }
});

test('normalization fixed point and caller-owned input classification match the stated boundaries', () => {
  const normalize = (value) => value.replaceAll('-', '').replace(/[A-Z]/g, (letter) => letter.toLowerCase());
  const first = normalize('B--a-A');
  assert.equal(first, 'baa');
  assert.equal(normalize(first), first);
  assert.notEqual('baa'.split('').sort().join(''), first);
  assert.notEqual([...new Set(first)].join(''), first);

  const item = items.get('alg-arrays-output-space-021').currentQuestion;
  assert.match(item.prompt, /caller-owned input array/);
  assert.match(item.prompt, /excluded from auxiliary space/);
  assert.equal(item.answer.optionId, 'correct_storage_roles');
  assert.match(item.interaction.options.find((option) => option.optionId === item.answer.optionId).text,
    /input storage; temporary set = auxiliary space; returned array = output space/);
});

test('a rejected compaction value advances read while preserving write and the valid prefix', () => {
  const input = [2, 3, 4];
  const buffer = [...input];
  let read = 1;
  let write = 1;
  const current = buffer[read];
  assert.equal(current, 3);
  assert.equal(current % 2 === 0, false);
  read += 1;
  assert.deepEqual({ read, write, prefix: buffer.slice(0, write) }, { read: 2, write: 1, prefix: [2] });

  const next = buffer[read];
  assert.equal(next, 4);
  assert.equal(next % 2 === 0, true);
  buffer[write] = next;
  write += 1;
  read += 1;
  assert.deepEqual({ read, write, prefix: buffer.slice(0, write) }, { read: 3, write: 2, prefix: [2, 4] });
});

test('concrete multiplicity and compaction examples distinguish the new package 08 decisions', () => {
  const counts = { 4: 2, 2: 1, 3: 0 };
  const grouped = Object.entries(counts)
    .filter(([, count]) => count > 0)
    .sort(([left], [right]) => Number(right) - Number(left))
    .flatMap(([value, count]) => Array(count).fill(Number(value)));
  assert.deepEqual(grouped, [4, 4, 2]);
  assert.notDeepEqual([4, 2], grouped); // drops one required occurrence
  assert.notDeepEqual([2, 4, 4], grouped); // violates descending order
  assert.notDeepEqual([4, 4, 2, 3], grouped); // emits a zero-count value
  assert.match(items.get('alg-arrays-duplicate-handling-019').currentQuestion.prompt, /omitting zero-count keys/);

  assert.match(items.get('alg-arrays-duplicate-handling-020').currentQuestion.prompt, /n >= 1/);

  const countsOf = (value) => [...value].reduce((result, char) => result.set(char, (result.get(char) ?? 0) + 1), new Map());
  assert.deepEqual(countsOf('aab'), countsOf('aba'));
  assert.equal('aab'.length, 'abb'.length);
  assert.deepEqual(new Set('aab'), new Set('abb'));
  assert.notDeepEqual(countsOf('aab'), countsOf('abb'));

  const compact = (values, limit, keep) => {
    const result = [];
    for (const value of values.slice(0, limit)) if (keep(value)) result.push(value);
    return result;
  };
  const input = [4, 2, 6, 5];
  assert.deepEqual(compact(input, 2, (value) => value % 2 === 0), [4, 2]);
  assert.notDeepEqual(compact(input, 2, (value) => value % 2 === 0), [2, 4]);
  assert.deepEqual([2, 3, 4].filter((value) => value % 2 === 0), [2, 4]);
});

test('package 08 retains the normalization transfer pair without an edit', () => {
  const asciiCaseFold = (value) => value.replace(/[A-Z]/g, (letter) => letter.toLowerCase());
  assert.equal(asciiCaseFold('A1-b'), asciiCaseFold('a1-b'));
  assert.notEqual(asciiCaseFold('A1-b'), asciiCaseFold('a1b'));
  assert.equal(items.has('alg-arrays-normalization-comparison-019'), true);
  const current = source('content/coding-interview-dsa-problem-solving/arrays_and_strings/normalization_and_comparison.json');
  assert.ok(current.some((question) => question.questionId === 'alg-arrays-normalization-comparison-001'));
  assert.ok(current.some((question) => question.questionId === 'alg-arrays-normalization-comparison-018'));
});
