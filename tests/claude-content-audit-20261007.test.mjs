import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';
import { canonicalJson, sha256 } from '../scripts/build.mjs';
import { scoreQuestion } from '../scripts/content/question-contract.mjs';
const root = new URL('../content/claude-certified-architect-professional-certification/', import.meta.url);
const questions = readdirSync(root).flatMap(node => readdirSync(new URL(`${node}/`, root)).filter(file => file.endsWith('.json')).flatMap(file => JSON.parse(readFileSync(new URL(`${node}/${file}`, root), 'utf8'))));
const byId = new Map(questions.map(q => [q.questionId, q]));
const get = id => { assert.ok(byId.has(id), id); return byId.get(id); };
const message = (q, id, kind = 'wrong_option') => q.feedback.messages.find(m => m.targetId === id && m.kind === kind).text;

test('current Claude bank matches its frozen version and exact accepted question set', () => {
  const catalog = JSON.parse(readFileSync(new URL('../content/catalog.json', import.meta.url), 'utf8'));
  const track = catalog.tracks.find(entry => entry.trackId === 'claude-certified-architect-professional-certification');
  const sorted = [...questions].sort((left, right) => left.questionId === right.questionId ? 0 : left.questionId < right.questionId ? -1 : 1);
  assert.equal(track.contentVersion, 'ccarp-2026.10.07');
  assert.equal(sorted.length, 845);
  assert.equal(sha256(canonicalJson(sorted)), '717b995fd9f9bda5d25161c516a248eb80b3a78cf23c69d1641c2ed95add8b9a');
});

test('historical evaluator scores retain provenance and require comparable reruns', () => {
  const q = get('CCARP-D04-O01-scenario-04');
  assert.deepEqual(q.answer.optionIds, ['a', 'e']);
  assert.match(message(q, 'c'), /Relabeling.*does not.*comparable/);
  assert.match(message(q, 'c'), /Preserve.*metadata.*rerun/);
  assert.equal(scoreQuestion(q, q.answer).status, 'correct');
  assert.equal(scoreQuestion(q, { type: 'choice_multiple', optionIds: ['c'] }).earnedPoints, 0);
});
test('fresh screening is visible before submission; unsupported evidence is not invented', () => {
  const fresh = get('CCARP-D05-O01-scenario-02');
  assert.match(fresh.constraints.join(' '), /exact payment draft at the submission boundary/);
  assert.match(fresh.constraints.join(' '), /no offline or cached-result authorization/);
  assert.equal(fresh.answer.optionId, 'b');
  const unexplained = get('CCARP-D05-O01-scenario-03');
  assert.deepEqual(unexplained.answer.optionIds, ['a', 'd']);
  const evidence = [unexplained.interaction.options[0].text, unexplained.feedback.reason, unexplained.feedback.details.scenarioApplication, message(unexplained, 'a', 'omitted_option')];
  for (const text of evidence) {
    assert.doesNotMatch(text, /show.*flagged span/);
    assert.match(text, /no supporting span or confidence was supplied/);
  }
});
test('budget and latency feedback match scenario quantities and keep cost separate from time', () => {
  assert.match(message(get('CCARP-D02-O01-scenario-04'), 'b'), /1\.4 seconds.*1\.2-second/);
  const budget = get('CCARP-D02-O04-scenario-05');
  for (const text of [budget.feedback.details.errorCorrection, message(budget, 'a')]) {
    assert.match(text, /39,000.*32,000.*7,000/);
    assert.match(text, /24,000/);
    assert.doesNotMatch(text, /schemas alone exceed/);
  }
  const cache = get('CCARP-D04-O05-scenario-03');
  assert.doesNotMatch(cache.prompt, /charges plus setup latency/);
  assert.match(cache.prompt, /charges are at least.*cost.*setup adds latency/);
});
test('just-in-time explanations use the source for runtime loading of identifiers', () => {
  for (const id of ['CCARP-D01-O03-scenario-04', 'CCARP-D03-O06-scenario-05', 'CCARP-D03-O06-transfer']) {
    const q = get(id);
    assert.equal(q.feedback.details.url, 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents');
    assert.ok(q.sourceRefs.includes('ccarp-doc-126e07cf0d68'));
    assert.ok(!q.sourceRefs.includes('ccarp-doc-33d811167435'));
  }
});
test('MCP distinguishes protected authorization from discovery and feature support', () => {
  const boundary = get('CCARP-D03-O02-boundary');
  assert.match(boundary.feedback.details.mechanismOrProperty, /protected HTTP endpoint.*implemented MCP authorization profile/);
  assert.doesNotMatch(boundary.feedback.details.mechanismOrProperty, /an HTTP transport must/);
  const discovery = get('CCARP-D03-O07-scenario-03');
  assert.match(discovery.prompt, /tools\/list and resources\/list/);
  assert.match(discovery.feedback.details.mechanismOrProperty, /supported feature families/);
  assert.match(discovery.interaction.options.find(o => o.optionId === 'c').text, /tools\/list and resources\/list/);
});
test('rollback explanations permit containment with retained evidence', () => {
  const q = get('CCARP-D03-O04-scenario-04');
  assert.doesNotMatch(JSON.stringify(q.feedback), /destroys evidence/);
  assert.match(q.feedback.details.errorCorrection, /Containment.*before causal diagnosis.*evidence is retained/);
  const crossed = get('CCARP-D04-O04-transfer');
  assert.doesNotMatch(message(crossed, 'c'), /removes the evidence/);
  assert.match(message(crossed, 'c'), /Preserve versioned prompts, fixtures, and traces/);
});
function permutations(ids) {
  if (!ids.length) return [[]];
  return ids.flatMap((id, index) => permutations(ids.filter((_, i) => i !== index)).map(rest => [id, ...rest]));
}
test('all 120 option permutations and 32 subsets preserve real scoring and stable feedback targets', () => {
  const q = get('CCARP-D01-O01-transfer');
  const ids = q.interaction.options.map(o => o.optionId);
  const omitted = q.feedback.messages.filter(m => m.kind === 'omitted_option');
  assert.deepEqual(omitted.map(m => m.targetId), ['b', 'd']);
  omitted.forEach(m => assert.doesNotMatch(m.text, /Without [bd]\b/));
  for (const order of permutations(ids)) {
    const shuffled = { ...q, interaction: { ...q.interaction, options: order.map(id => q.interaction.options.find(o => o.optionId === id)) } };
    for (let bits = 0; bits < 32; bits++) {
      const optionIds = ids.filter((_, index) => bits & (1 << index));
      const response = { type: 'choice_multiple', optionIds };
      const expected = scoreQuestion(q, response);
      const actual = scoreQuestion(shuffled, response);
      assert.equal(actual.earnedPoints, expected.earnedPoints);
      assert.equal(actual.status, expected.status);
      assert.deepEqual(actual.omittedOptionIds, expected.omittedOptionIds);
    }
  }
  for (const optionIds of [['b', 'b'], ['unknown']]) {
    const result = scoreQuestion(q, { type: 'choice_multiple', optionIds });
    assert.equal(result.invalidResponse, true);
    assert.equal(result.earnedPoints, 0);
  }
});
test('decision pairs reverse choices and every variant has complete distractor feedback', () => {
  const pairs = [
    ['CCARP-D05-O01', 'cached-screen-valid', 'cached-screen-edited'],
    ['CCARP-D02-O01', 'model-latency-reversal', 'model-cost-reversal'],
    ['CCARP-D02-O04', 'context-tools-fit', 'context-tools-still-over'],
    ['CCARP-D04-O01', 'evaluator-frozen-comparison', 'evaluator-population-drift'],
    ['CCARP-D03-O02', 'mcp-protected-loopback', 'mcp-public-http'],
    ['CCARP-D03-O07', 'mcp-discovery-isolation', 'mcp-public-discovery-private-call'],
    ['CCARP-D04-O04', 'rollback-preserved-evidence', 'rollback-missing-version'],
    ['CCARP-D04-O05', 'cache-cost-positive', 'cache-latency-negative'],
  ];
  for (const [unit, left, right] of pairs) {
    const variants = [left, right].map(suffix => get(`${unit}-variant-${suffix}`));
    assert.notEqual(variants[0].prompt, variants[1].prompt);
    assert.notEqual(variants[0].interaction.options.find(o => o.optionId === variants[0].answer.optionId).text,
      variants[1].interaction.options.find(o => o.optionId === variants[1].answer.optionId).text);
    for (const q of variants) {
      assert.equal(scoreQuestion(q, q.answer).status, 'correct');
      for (const o of q.interaction.options.filter(o => o.optionId !== q.answer.optionId)) {
        assert.equal(scoreQuestion(q, { type: 'choice_single', optionId: o.optionId }).earnedPoints, 0);
        assert.ok(message(q, o.optionId).length > 20);
      }
    }
  }
});

test('variant provenance cites its mechanism rather than an unrelated unit seed or unverified exam alignment', () => {
  for (const q of questions.filter(q => q.questionId.includes('-variant-'))) {
    assert.ok(!q.sourceRefs.includes('ccarp-exam-guide-v1'));
    if (q.mentalUnitId === 'CCARP-D03-O07') {
      assert.ok(q.sourceRefs.includes('ccarp-doc-d2811bcffa8c'));
      assert.ok(!q.sourceRefs.includes('ccarp-doc-4e84b30d1d6b'));
      assert.match(q.feedback.details.url, /modelcontextprotocol.*authorization/);
    }
    if (q.mentalUnitId === 'CCARP-D04-O01') {
      assert.ok(q.sourceRefs.includes('ccarp-doc-6727386d515f'));
      assert.match(q.feedback.details.url, /develop-tests/);
    }
    if (q.mentalUnitId === 'CCARP-D02-O04') assert.ok(q.sourceRefs.includes('ccarp-doc-126e07cf0d68'));
  }
});
