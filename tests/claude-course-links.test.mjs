import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { execFileSync } from 'node:child_process';
import { ACCEPTED_TRACK_IDS, validateQuestion } from '../scripts/content/question-contract.mjs';
import { loadCurrentQuestionBank } from './helpers/current-question-bank.mjs';
const read = path => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
const TRACK = 'claude-certified-architect-professional-certification';
const { questions } = await loadCurrentQuestionBank(TRACK);
const registry = read(`config/certification-source-registries/${TRACK}.json`);
const registeredSourceIds = new Set(registry.sources.map(source => source.sourceId));
const knownUnlinkedQleIds = [
  'CCARP-D01-O01-qle-v2-01',
  'CCARP-D01-O01-qle-v2-02',
  'CCARP-D01-O01-qle-v2-03',
  'CCARP-D03-O09-qle-v2-01',
  'CCARP-D03-O09-qle-v2-02',
  'CCARP-D03-O09-qle-v2-03',
  'CCARP-D05-O06-qle-v2-01',
  'CCARP-D05-O06-qle-v2-02',
  'CCARP-D05-O06-qle-v2-03',
];
const knownUnlinkedAuthoredExamIds = [
  'CCARP-D01-O01-matrix-pilot-evidence',
  'CCARP-D01-O01-scenario-pilot-stage-after-evaluation',
  'CCARP-D01-O02-matrix-incident-containment',
  'CCARP-D01-O02-multiple-incident-containment',
  'CCARP-D02-O01-matrix-context-budget',
  'CCARP-D03-O01-matrix-tool-boundary',
  'CCARP-D04-O01-matrix-release-evidence',
  'CCARP-D05-O06-matrix-denied-read',
  'CCARP-D06-O01-matrix-rollout-stage',
  'CCARP-D07-O01-matrix-change-review',
];

test('every current Claude question retains valid course metadata and registered source references', () => {
  assert.equal(questions.length, 982);
  let linkedCount = 0;
  const missingCourse = [];
  for (const question of questions) {
    assert.equal(validateQuestion(question).valid, true, question.questionId);
    assert.ok(question.feedback.details.url.startsWith('https://'));
    assert.ok(question.sourceRefs.length > 0, question.questionId);
    for (const sourceId of question.sourceRefs) {
      assert.ok(registeredSourceIds.has(sourceId), `${question.questionId}: unknown source ${sourceId}`);
    }
    if (!question.feedback.course) {
      missingCourse.push(question);
      continue;
    }
    linkedCount++;
    assert.equal(new URL(question.feedback.course.url).protocol, 'https:', question.questionId);
    assert.equal(new URL(question.feedback.course.url).hostname, 'anthropic-partners.skilljar.com', question.questionId);
    assert.ok(question.feedback.course.title.trim().length > 0, question.questionId);
    assert.equal(question.feedback.course.requiresAccount, true, question.questionId);
  }
  assert.ok(linkedCount > 0);
  const expectedUnlinkedIds = [...knownUnlinkedQleIds, ...knownUnlinkedAuthoredExamIds].sort();
  assert.deepEqual(missingCourse.map(question => question.questionId).sort(), expectedUnlinkedIds,
    'only the documented QLE source-mapping residual and newly authored scenarios lack course attribution');
});
test('course is optional in the shared contract, but present course metadata is strict and HTTPS', () => {
  const base = structuredClone(questions[0]);
  delete base.feedback.course;
  assert.equal(validateQuestion(base).valid, true);
  for (const mutate of [c => { delete c.title; }, c => { c.title=' '; }, c => { c.section=' '; }, c => { c.url='http://example.com'; }, c => { c.url='https://'; }, c => { c.requiresAccount='true'; }, c => { c.extra=true; }]) {
    const question = structuredClone(questions[0]); mutate(question.feedback.course);
    assert.equal(validateQuestion(question).valid, false);
  }
  const schema = read('schemas/content/question.schema.json');
  assert.equal(schema.$defs.feedback.properties.course.$ref, '#/$defs/course');
  assert.deepEqual(schema.$defs.course.required, ['title','url','requiresAccount']);
});

test('JSON Schema and executable validator agree for course metadata and all nine shared banks', () => {
  const cases = [];
  for (const trackId of ACCEPTED_TRACK_IDS) {
    const question = structuredClone(questions[0]); question.trackId = trackId; cases.push(question);
    const legacy = structuredClone(question); delete legacy.feedback.course; cases.push(legacy);
  }
  for (const course of [null, {}, {title:'Module',url:'http://example.com',requiresAccount:true}, {title:'Module',url:'https://example.com',requiresAccount:'yes'}, {title:' ',url:'https://example.com',requiresAccount:true}, {title:'Module',url:'https://example.com',requiresAccount:true,unknown:1}]) {
    const question = structuredClone(questions[0]); question.feedback.course = course; cases.push(question);
  }
  const schema = read('schemas/content/question.schema.json');
  const actual = JSON.parse(execFileSync('python3', ['-c', 'import json,sys; from jsonschema import Draft202012Validator; d=json.load(sys.stdin); v=Draft202012Validator(d["schema"]); print(json.dumps([v.is_valid(q) for q in d["cases"]]))'], {input:JSON.stringify({schema,cases}),encoding:'utf8'}));
  assert.deepEqual(actual, cases.map(question => validateQuestion(question).valid));
  assert.ok(actual.slice(0,18).every(Boolean));
  assert.ok(actual.slice(18).every(result => !result));
});
