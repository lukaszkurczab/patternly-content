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

test('historical accepted 845-question SHA reconstructs by reversing bounded CC02 repairs and P2 fields', () => {
  const catalog = JSON.parse(readFileSync(new URL('../content/catalog.json', import.meta.url), 'utf8'));
  const track = catalog.tracks.find(entry => entry.trackId === 'claude-certified-architect-professional-certification');
  const coverage = JSON.parse(readFileSync(new URL('../docs/evidence/content-audits/2026-10-11-cc02-content-coverage.json', import.meta.url), 'utf8'));
  const beforeFixture = JSON.parse(readFileSync(new URL('../evidence/canonical-content-approvals/claude-cc02-historical-before.json', import.meta.url), 'utf8'));
  const addedIds = new Set(coverage.inventory.canonicalAddedIds);
  const baselineById = new Map(questions.filter(question => !addedIds.has(question.questionId)).map(question => { const prior = structuredClone(question); delete prior.feedback.course; return [question.questionId, prior]; }));
  for (const [questionId, previousQuestion] of Object.entries(beforeFixture)) baselineById.set(questionId, JSON.parse(JSON.stringify(previousQuestion)));
  const sorted = [...baselineById.values()].sort((left, right) => left.questionId === right.questionId ? 0 : left.questionId < right.questionId ? -1 : 1);
  const acceptedBeforeP2Clarification = JSON.parse(JSON.stringify(sorted));
  const priorP2 = acceptedBeforeP2Clarification.find(q => q.questionId === 'CCARP-D02-O04-expansion-14');
  priorP2.interaction.options.find(option => option.optionId === 'a').text = 'Preserve the reserve, reduce required input, then recount with the target model.';
  priorP2.feedback.reason = 'The input allowance is 18,000 tokens after reserve, while the target-model measurement is 19,300. The team must preserve the reserve and reduce or restructure context, then count again.';
  priorP2.feedback.details.boundaryOrTradeoff = 'Compression is valid only if it preserves required facts; if mandatory content cannot fit, use a supported split or another capacity plan.';
  assert.equal(typeof track.contentVersion, 'string');
  assert.ok(track.contentVersion.length > 0);
  assert.equal(sorted.length, 845);
  assert.equal(sha256(canonicalJson(acceptedBeforeP2Clarification)), '717b995fd9f9bda5d25161c516a248eb80b3a78cf23c69d1641c2ed95add8b9a');
  assert.equal(sha256(canonicalJson(sorted)), '73f561c4d64a272f8b6f055a321414303620c54dba7dfb4d0283d75ea74bfe6d');
});

const targetedKeySemantics = [
  ['CCARP-D01-O02-expansion-01', 'a', 'b', 'Validate fields before retrieval', 'dashboard finds correction patterns after the fact'],
  ['CCARP-D01-O02-expansion-02', 'c', 'a', 'Resolve the device, then retrieve its applicable manual revision', 'newest manual may not apply'],
  ['CCARP-D01-O02-expansion-04', 'b', 'c', 'Return a typed vendor rejection', 'Hiding the ERP rejection'],
  ['CCARP-D01-O02-expansion-05', 'd', 'b', 'Refresh stale readings or escalate', 'Plausibility does not show'],
  ['CCARP-D01-O02-expansion-06', 'b', 'a', 'Revise, gather evidence, or stop based on review', 'second call on every answer'],
  ['CCARP-D01-O02-expansion-07', 'b', 'd', 'Persist the intent and key before submission', 'Account history does not reveal'],
  ['CCARP-D01-O04-expansion-03', 'c', 'd', 'Keep status partial until required evidence is resolved', 'discards completed work'],
  ['CCARP-D01-O04-expansion-04', 'b', 'c', 'Follow one bounded evidence path', 'Time slices do not correspond'],
  ['CCARP-D01-O04-expansion-06', 'b', 'a', 'Enforce the two-level and 12-call limits', 'no deterministic stopping bound'],
  ['CCARP-D01-O04-expansion-08', 'b', 'c', 'Publish the validated required sections', 'plausible inference from another packet'],
  ['CCARP-D01-O04-expansion-09', 'b', 'd', 'Validate each citation against its assigned source', 'Deleting provenance conceals unsupported claims'],
  ['CCARP-D01-O04-expansion-10', 'b', 'a', 'Treat the excerpt as untrusted evidence content', 'cannot rewrite the lead’s task contract'],
  ['CCARP-D01-O04-expansion-12', 'b', 'c', 'Dispatch in bounded batches', 'Changing task boundaries ad hoc'],
  ['CCARP-D01-O04-expansion-13', 'b', 'd', 'Prefer the simpler lead process for this workload', 'without a diagnosed gap'],
  ['CCARP-D01-O04-expansion-14', 'b', 'a', 'Keep the attempt unresolved, query the operation ID', 'new operation key may create a second'],
  ['CCARP-D02-O01-expansion-02', 'c', 'a', 'Test a model or route that clears the multilingual floor', 'model switch alone may not address the ambiguity'],
  ['CCARP-D02-O01-expansion-03', 'b', 'd', 'Use A unless a cheaper candidate clears the multilingual floor', 'Retries shift error handling to users'],
  ['CCARP-D02-O01-expansion-04', 'b', 'd', 'Lower the detector threshold or use a safer fallback', 'Model quality alone does not evaluate the detector'],
  ['CCARP-D01-O03-expansion-01', 'd', 'b', 'Analyze documents independently', 'Repeated autonomous searching is unnecessary'],
  ['CCARP-D01-O03-expansion-02', 'c', 'a', 'An evaluator-optimizer loop with the rubric', 'vote among independent drafts'],
  ['CCARP-D01-O03-expansion-03', 'b', 'd', 'A bounded agent loop for evidence-dependent read steps', 'temporary hold is still a consequential account action'],
  ['CCARP-D01-O03-expansion-05', 'c', 'b', 'Analyze sources independently', 'stopping condition that favors the initial hypothesis'],
  ['CCARP-D01-O03-expansion-07', 'a', 'd', 'Keep a bounded draft workflow with the citation gate', 'not a substitute for the required deterministic citation check'],
  ['CCARP-D01-O06-expansion-01', 'a', 'b', 'Compare cost per acceptable notice by type', 'Lowest per-token price can still fail'],
  ['CCARP-D01-O06-expansion-02', 'b', 'a', 'Keep routine answers within SLA', 'making every routine request wait'],
  ['CCARP-D01-O06-expansion-03', 'b', 'd', 'Keep routine workflow; test investigation on the 8% exception slice', 'More tools do not prove'],
  ['CCARP-D01-O06-expansion-04', 'b', 'c', 'Require deadline-field recall', 'observed weakness is concentrated in one field'],
  ['CCARP-D01-O06-expansion-06', 'b', 'a', 'Do not claim a productivity gain from first-response speed', 'First-response time omits'],
  ['CCARP-D01-O05-expansion-01', 'a', 'b', 'Run independent changes first', 'Equal-sized batches can combine dependent tasks'],
  ['CCARP-D01-O05-expansion-02', 'b', 'a', 'Group related files by shared definitions', 'Equal counts preserve the boundary'],
  ['CCARP-D01-O05-expansion-03', 'b', 'd', 'Route uncertain or safety-related messages to deeper review', 'Removing route provenance'],
  ['CCARP-D01-O05-expansion-04', 'b', 'c', 'Assign independent evidence tasks', 'context budget can constrain the design'],
  ['CCARP-D01-O05-expansion-06', 'b', 'c', 'Run extraction, then registry validation', 'One serial agent is not required'],
  ['CCARP-D01-O01-expansion-01', 'a', 'b', 'Separate status and policy paths', 'source for live account facts'],
  ['CCARP-D01-O01-expansion-02', 'b', 'a', 'Set separate outcome targets, owners, and refund-loss guardrails', 'Response speed omits'],
  ['CCARP-D01-O01-expansion-04', 'b', 'c', 'Expand through the queue with quality and end-to-end measures', 'measured total includes correction work'],
  ['CCARP-D01-O01-expansion-06', 'b', 'c', 'Measure and redesign the queue assignment and ownership workflow', 'faster model would affect only the small interpretation segment'],
];

function permutations(ids) {
  if (!ids.length) return [[]];
  return ids.flatMap((id, index) => permutations(ids.filter((_, i) => i !== index)).map(rest => [id, ...rest]));
}

test('37 audited expansion items retain the source-supported stable answers and reject the report’s stale option letters', () => {
  assert.equal(targetedKeySemantics.length, 37);
  const uniqueIds = new Set(targetedKeySemantics.map(([id]) => id));
  assert.equal(uniqueIds.size, 37);
  for (const [id, expectedKey, staleSuggestedKey, answerClue, distractorClue] of targetedKeySemantics) {
    const q = get(id);
    const options = q.interaction.options;
    const ids = options.map(option => option.optionId);
    assert.equal(q.interaction.type, 'choice_single', id);
    assert.equal(q.answer.optionId, expectedKey, `${id} answer ID`);
    assert.equal(ids.length, 4, `${id} choice count`);
    assert.equal(new Set(ids).size, 4, `${id} unique option IDs`);
    assert.ok(options.find(option => option.optionId === expectedKey).text.includes(answerClue), `${id} answer semantics`);
    assert.notEqual(expectedKey, staleSuggestedKey, `${id} stale report ID must remain a distractor`);

    const wrongIds = ids.filter(optionId => optionId !== expectedKey);
    const wrongMessages = q.feedback.messages.filter(entry => entry.kind === 'wrong_option');
    assert.equal(wrongMessages.length, 3, `${id} wrong-option feedback cardinality`);
    assert.deepEqual(wrongMessages.map(entry => entry.targetId).sort(), [...wrongIds].sort(), `${id} feedback targets`);
    assert.equal(q.feedback.messages.filter(entry => entry.kind === 'omitted_option').length, 0, `${id} choice_single omitted feedback`);
    assert.match(message(q, staleSuggestedKey), new RegExp(distractorClue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `${id} stale-ID feedback diagnoses its actual distractor`);

    const accepted = scoreQuestion(q, { type: 'choice_single', optionId: expectedKey });
    assert.equal(accepted.status, 'correct', `${id} expected response status`);
    assert.equal(accepted.earnedPoints, 1, `${id} expected score`);
    assert.equal(accepted.maxPoints, 1, `${id} max score`);
    for (const wrongId of wrongIds) {
      const rejected = scoreQuestion(q, { type: 'choice_single', optionId: wrongId });
      assert.equal(rejected.status, 'incorrect', `${id}/${wrongId} distractor status`);
      assert.equal(rejected.earnedPoints, 0, `${id}/${wrongId} distractor score`);
      assert.equal(rejected.maxPoints, 1, `${id}/${wrongId} max score`);
      assert.ok(message(q, wrongId).length > 20, `${id}/${wrongId} feedback`);
    }

    for (const order of permutations(ids)) {
      const shuffled = { ...q, interaction: { ...q.interaction, options: order.map(optionId => options.find(option => option.optionId === optionId)) } };
      for (const optionId of ids) {
        const result = scoreQuestion(shuffled, { type: 'choice_single', optionId });
        assert.equal(result.status, optionId === expectedKey ? 'correct' : 'incorrect', `${id}/${optionId} shuffled status`);
        assert.equal(result.earnedPoints, optionId === expectedKey ? 1 : 0, `${id}/${optionId} shuffled score`);
        if (optionId !== expectedKey) assert.ok(message(shuffled, optionId).length > 20, `${id}/${optionId} stable feedback target`);
      }
    }
  }
});

test('P2 context-capacity wording keeps the accepted key and states the mandatory-input failure boundary', () => {
  const q = get('CCARP-D02-O04-expansion-14');
  assert.equal(q.answer.optionId, 'a');
  assert.match(q.prompt, /22,000-token total request budget/);
  assert.match(q.prompt, /4,000 is reserved/);
  assert.match(q.prompt, /Mandatory instructions, current evidence, and tool schemas/);
  assert.match(q.interaction.options.find(option => option.optionId === 'a').text, /authorized, meaning-preserving reduction/);
  assert.match(q.interaction.options.find(option => option.optionId === 'a').text, /mandatory input still exceeds the 18,000-token allowance/);
  assert.match(q.interaction.options.find(option => option.optionId === 'a').text, /explicit capacity failure or use an already approved alternate route/);
  assert.match(q.feedback.reason, /19,300.*18,000 input allowance/);
  assert.match(q.feedback.reason, /Do not silently discard mandatory instructions, evidence, or output capacity/);
  assert.match(q.feedback.details.boundaryOrTradeoff, /only if it preserves required facts/);
  assert.match(q.feedback.details.boundaryOrTradeoff, /return capacity failure or use an already approved alternate route/);
  const ids = q.interaction.options.map(option => option.optionId);
  const wrongIds = ids.filter(optionId => optionId !== 'a');
  const wrongMessages = q.feedback.messages.filter(entry => entry.kind === 'wrong_option');
  assert.equal(wrongMessages.length, 3);
  assert.deepEqual(wrongMessages.map(entry => entry.targetId).sort(), [...wrongIds].sort());
  assert.equal(q.feedback.messages.filter(entry => entry.kind === 'omitted_option').length, 0);
  assert.match(message(q, 'b'), /4,000 tokens reserved.*18,000 for input/);
  assert.match(message(q, 'c'), /target-model count is the relevant measurement/);
  assert.match(message(q, 'd'), /Eliminating the reserve risks truncation/);
  for (const order of permutations(ids)) {
    const shuffled = { ...q, interaction: { ...q.interaction, options: order.map(optionId => q.interaction.options.find(option => option.optionId === optionId)) } };
    for (const optionId of ids) {
      const result = scoreQuestion(shuffled, { type: 'choice_single', optionId });
      assert.equal(result.status, optionId === 'a' ? 'correct' : 'incorrect', `${optionId} status after shuffle`);
      assert.equal(result.earnedPoints, optionId === 'a' ? 1 : 0, `${optionId} score after shuffle`);
      if (optionId !== 'a') assert.equal(message(shuffled, optionId), message(q, optionId), `${optionId} feedback target after shuffle`);
    }
  }
  assert.equal(19_300 + 4_000, 23_300);
  assert.ok(23_300 > 22_000);
  // Runtime gateway simulation is intentionally not part of this source/scorer test.
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
