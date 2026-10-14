import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test, { after } from 'node:test';
import { createPreQleProducerFixture } from './helpers/pre-qle-producer-fixture.mjs';
import { fileURLToPath } from 'node:url';
import { buildTrack } from '../scripts/build.mjs';
import { scoreQuestion, validateQuestion } from '../scripts/content/question-contract.mjs';

const fixture = await createPreQleProducerFixture(path.resolve(fileURLToPath(new URL('../', import.meta.url))));
after(() => fixture.cleanup());
const ROOT = fixture.root;
const TRACK = 'claude-certified-architect-professional-certification';
const read = relative => JSON.parse(readFileSync(path.join(ROOT, relative), 'utf8'));
const coverage = read('docs/evidence/content-audits/2026-10-11-cc02-content-coverage.json');
const frozenMap = read('docs/evidence/content-audits/2026-10-11-claude-course-map.json');
const blindAnswerText = read('evidence/canonical-content-approvals/claude-cc02-blind-answer-text-v1.json');
const registry = read(`config/certification-source-registries/${TRACK}.json`);
const sourceById = new Map(registry.sources.map(source => [source.sourceId, source]));
const modules = new Map(frozenMap.modules.map(module => [module.moduleId, module]));
const objectives = new Set(frozenMap.objectives.map(objective => objective.objectiveId));
const allCanonical = readdirSync(path.join(ROOT, 'content', TRACK)).flatMap(node => readdirSync(path.join(ROOT, 'content', TRACK, node)).filter(file => file.endsWith('.json')).flatMap(file => readFileSync(path.join(ROOT, 'content', TRACK, node, file), 'utf8').trim() ? JSON.parse(readFileSync(path.join(ROOT, 'content', TRACK, node, file), 'utf8')) : []));
const canonical = allCanonical.filter(question => !question.questionId.includes('-qle-v2-'));
const historicalCanonical = canonical;
const canonicalById = new Map(canonical.map(question => [question.questionId, question]));

function assertQuestionScores(question) {
  assert.equal(validateQuestion(question).valid, true, `${question.questionId}: shared question contract`);
  const correctId = question.answer.optionId;
  const accepted = scoreQuestion(question, { type: 'choice_single', optionId: correctId });
  assert.equal(accepted.status, 'correct', `${question.questionId}: keyed option scores as correct`);
  assert.equal(accepted.earnedPoints, accepted.maxPoints, `${question.questionId}: full score`);
  const optionIds = question.interaction.options.map(option => option.optionId);
  const wrong = optionIds.filter(id => id !== correctId);
  assert.equal(wrong.length, 3, `${question.questionId}: three distractors`);
  assert.deepEqual(question.feedback.messages.filter(message => message.kind === 'wrong_option').map(message => message.targetId).sort(), wrong.sort(), `${question.questionId}: distractor targets match corrected answer key`);
  for (const optionId of wrong) {
    const result = scoreQuestion(question, { type: 'choice_single', optionId });
    assert.equal(result.status, 'incorrect', `${question.questionId}/${optionId}: distractor rejected`);
    const feedback = question.feedback.messages.find(message => message.kind === 'wrong_option' && message.targetId === optionId)?.text ?? '';
    assert.ok(feedback.length > 0 && !feedback.startsWith('This option does not resolve'), `${question.questionId}/${optionId}: explanatory distractor feedback`);
  }
}

test('CC-02 maps every authored question to real course material and registry-backed Details documentation', () => {
  assert.equal(coverage.inventory.beforeCanonicalQuestionCount, 845);
  assert.equal(coverage.inventory.addedCanonicalQuestionCount, 73);
  assert.equal(coverage.inventory.afterCanonicalQuestionCount, 918);
  assert.equal(coverage.inventory.changedExistingQuestionCount, 6);
  assert.equal(historicalCanonical.length, 918);
  assert.equal(canonicalById.size, canonical.length, 'canonical question IDs are unique');

  assert.equal(blindAnswerText.schemaVersion, 'cc02-blind-answer-text-v1');
  assert.equal(blindAnswerText.questionCount, 83);
  assert.equal(blindAnswerText.selections.length, 83);
  assert.equal(new Set(blindAnswerText.selections.map(selection => selection.questionId)).size, 83, 'blind answer fixture covers unique question IDs');
  const supplement = read(`supplements/${TRACK}/cc02-course-supplement-v1/cowork-entry-point.json`);
  const answerReviewedById = new Map([...canonical, ...supplement.questions].map(question => [question.questionId, question]));
  assert.equal(answerReviewedById.size, canonical.length + supplement.questions.length, 'reviewed canonical and supplement question IDs do not collide');
  const expectedReviewedIds = [...coverage.inventory.canonicalAddedIds, ...coverage.changedExisting.map(item => item.questionId), ...supplement.questions.map(item => item.questionId)].sort();
  assert.deepEqual(blindAnswerText.selections.map(item => item.questionId).sort(), expectedReviewedIds, 'blind oracle covers exactly the new, changed and supplemental records');
  for (const selection of blindAnswerText.selections) {
    const question = answerReviewedById.get(selection.questionId);
    assert.ok(question, `${selection.questionId}: included in the independent answer-text review`);
    const matches = question.interaction.options.filter(option => option.text === selection.expectedOptionText);
    assert.equal(matches.length, 1, `${selection.questionId}: expected answer text uniquely identifies one current option`);
    assert.equal(question.answer.optionId, matches[0].optionId, `${selection.questionId}: answer key resolves to the independently reviewed option text`);
  }

  const baselineIds = new Set(frozenMap.questions.map(question => question.questionId));
  const addedIds = new Set(coverage.inventory.canonicalAddedIds);
  assert.equal(baselineIds.size, 845, 'CC-01 remains the frozen historical inventory');
  assert.equal(addedIds.size, 73, 'CC-02 additions have unique IDs');
  assert.deepEqual(new Set([...baselineIds, ...addedIds]), new Set(canonicalById.keys()), 'frozen CC-01 IDs plus CC-02 additions equal the current canonical bank');
  assert.equal(coverage.questionMappings.length, addedIds.size, 'one source mapping per added canonical question');
  assert.equal(new Set(coverage.questionMappings.map(mapping => mapping.questionId)).size, coverage.questionMappings.length, 'mapping IDs are unique');
  assert.equal(coverage.unitPlan.length, 18, 'unit plan is deduplicated by mental model');
  assert.equal(new Set(coverage.unitPlan.map(unit => unit.mentalUnitId)).size, 18, 'each mental unit occurs once in the plan');
  const expectedFacetIds = new Set(frozenMap.objectives.flatMap(objective => objective.facets ?? []).filter(facet => ['partial', 'missing', 'excluded'].includes(facet.status)).map(facet => facet.id));
  assert.deepEqual(new Set(coverage.facets.map(facet => facet.facetId)), expectedFacetIds, 'coverage manifest accounts for every CC-01 partial/missing/excluded facet');
  const examFacets = coverage.facets.filter(facet => facet.scope === 'exam');
  const supplementFacets = coverage.facets.filter(facet => facet.scope === 'course_supplement');
  const partnerFacets = coverage.facets.filter(facet => facet.scope === 'partner_only');
  assert.equal(examFacets.length, 27);
  assert.ok(examFacets.every(facet => facet.addedQuestionIds.length > 0), 'every exam facet has direct canonical question support');
  assert.equal(supplementFacets.length, 1);
  assert.equal(partnerFacets.length, 3);
  assert.ok(partnerFacets.every(facet => facet.addedQuestionIds.length === 0), 'partner-only outcomes remain outside exam questions');

  const catalogTrack = read('content/catalog.json').tracks.find(track => track.trackId === TRACK);
  const quotaByNode = new Map(catalogTrack.completionRule.chapters.map(chapter => [chapter.nodeId, chapter]));
  for (const expected of coverage.completionCounts.nodes) {
    const chapter = quotaByNode.get(expected.nodeId);
    assert.ok(chapter, `${expected.nodeId}: catalogue quota exists`);
    assert.equal(chapter.mentalUnitCount, expected.after.mentalUnitCount, `${expected.nodeId}: derived unit count matches manifest`);
    assert.equal(chapter.minimumAttemptCount, expected.after.minimumAttemptCount, `${expected.nodeId}: existing completion formula is reflected in the catalogue`);
  }

  for (const mapping of coverage.questionMappings) {
    const question = canonicalById.get(mapping.questionId);
    assert.ok(question, `${mapping.questionId}: mapped canonical question exists`);
    assertQuestionScores(question);
    const module = modules.get(mapping.moduleId);
    assert.ok(module, `${mapping.questionId}: valid course module ${mapping.moduleId}`);
    const sectionIds = new Set(module.sections.map(section => section.sectionId));
    assert.ok(mapping.sectionIds.length > 0, `${mapping.questionId}: at least one actual course section`);
    for (const sectionId of mapping.sectionIds) assert.ok(sectionIds.has(sectionId), `${mapping.questionId}: ${sectionId} belongs to ${mapping.moduleId}`);
    for (const objectiveId of mapping.objectiveIds) assert.ok(objectives.has(objectiveId), `${mapping.questionId}: ${objectiveId} is a formal course objective`);
    const referencedUrls = new Set();
    for (const sourceId of mapping.sourceRefs) {
      const source = sourceById.get(sourceId);
      assert.ok(source, `${mapping.questionId}: registered source ${sourceId}`);
      referencedUrls.add(source.url);
    }
    assert.ok(referencedUrls.has(question.feedback.details.url), `${mapping.questionId}: Details URL points to an official source referenced by the item`);
    for (const ref of mapping.documentationRefs) {
      assert.equal(sourceById.get(ref.sourceId)?.url, ref.url, `${mapping.questionId}: docs URL matches registry record ${ref.sourceId}`);
    }
  }

  for (const facet of coverage.facets.filter(item => item.scope === 'exam')) {
    const directlyMapped = coverage.questionMappings.filter(mapping => mapping.facetIds.includes(facet.facetId)).map(mapping => mapping.questionId).sort();
    const adjacent = coverage.questionMappings.filter(mapping => mapping.adjacentFacetIds?.includes(facet.facetId)).map(mapping => mapping.questionId).sort();
    assert.deepEqual([...facet.addedQuestionIds].sort(), directlyMapped, `${facet.facetId}: only direct question support is credited`);
    assert.deepEqual([...(facet.adjacentQuestionIds ?? [])].sort(), adjacent, `${facet.facetId}: adjacent evidence is separate`);
    assert.notEqual(facet.statusAfter, 'unresolved', `${facet.facetId}: remaining exam facet is explicitly accounted for`);
  }

  const beforeFixture = read('evidence/canonical-content-approvals/claude-cc02-historical-before.json');
  assert.deepEqual(Object.keys(beforeFixture).sort(), coverage.changedExisting.map(entry => entry.questionId).sort(), 'versioned before fixture covers every changed existing item');
  for (const questionId of Object.keys(beforeFixture)) assertQuestionScores(canonicalById.get(questionId));
  for (const changed of coverage.changedExisting) { const current = structuredClone(canonicalById.get(changed.questionId)); delete current.feedback.course; assert.deepEqual(changed.after, current, `${changed.questionId}: CC02 record is unchanged outside CC03 course metadata`); }
  const mcp16 = canonicalById.get('CCARP-D07-O01-expansion-16');
  const mcp20 = canonicalById.get('CCARP-D07-O01-expansion-20');
  const mcp22 = canonicalById.get('CCARP-D07-O01-expansion-22');
  const mcp27 = canonicalById.get('CCARP-D07-O01-expansion-27');
  const mcp28 = canonicalById.get('CCARP-D07-O01-expansion-28');
  const mcp30 = canonicalById.get('CCARP-D07-O01-expansion-30');
  assert.match(mcp16.prompt, /permissions\.allow/u);
  assert.match(mcp16.feedback.reason, /deny.*before.*allow/u);
  assert.match(mcp20.prompt, /Pending approval/u);
  assert.match(mcp20.feedback.reason, /separate.*authentication/u);
  assert.match(mcp22.feedback.details.errorCorrection, /not which file supplied each key/u);
  assert.match(mcp27.prompt, /folder-trust/u);
  assert.match(mcp28.prompt, /language.*Polish.*managed settings.*English/u);
  assert.match(mcp28.feedback.reason, /Managed settings take precedence/u);
  assert.match(mcp30.feedback.reason, /deny.*before ask and allow/u);
});

test('Cowork supplement validates with the shared scorer but stays outside the canonical catalog and built artifact', async () => {
  const supplement = read(`supplements/${TRACK}/cc02-course-supplement-v1/cowork-entry-point.json`);
  assert.equal(supplement.scope, 'course_supplement');
  assert.equal(supplement.examScope, 'unconfirmed_by_exam_guide');
  assert.equal(supplement.runtimeIncluded, false);
  assert.equal(supplement.admissionStatus, 'authored_not_runtime_admitted');
  assert.equal(supplement.questions.length, 4);
  const supplementIds = supplement.questions.map(question => question.questionId);
  assert.equal(new Set(supplementIds).size, supplementIds.length);
  for (const question of supplement.questions) {
    assertQuestionScores(question);
    for (const sourceId of question.sourceRefs) assert.ok(sourceById.has(sourceId), `${question.questionId}: registered source ${sourceId}`);
    assert.ok(!canonicalById.has(question.questionId), `${question.questionId}: supplement is not in canonical files`);
  }
  const catalog = read('content/catalog.json');
  assert.ok(!JSON.stringify(catalog).includes('CCARP-SUP-COWORK'), 'supplement IDs are absent from canonical catalog');

  const outputRoot = await mkdtemp(path.join(os.tmpdir(), 'patternly-cc02-build-'));
  try {
    const built = await buildTrack({ rootDirectory: ROOT, outputRoot, trackId: TRACK });
    const builtIds = new Set(built.artifact.questions.map(question => question.questionId));
    for (const questionId of supplementIds) assert.ok(!builtIds.has(questionId), `${questionId}: omitted from canonical build`);
    assert.equal(built.artifact.questions.length, allCanonical.length);
  } finally {
    await rm(outputRoot, { recursive: true, force: true });
  }
});
