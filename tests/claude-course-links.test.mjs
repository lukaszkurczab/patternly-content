import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test, { after } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createPreQleProducerFixture } from './helpers/pre-qle-producer-fixture.mjs';
import { execFileSync } from 'node:child_process';
import { canonicalJson, sha256 } from '../scripts/build.mjs';
import { ACCEPTED_TRACK_IDS, validateQuestion } from '../scripts/content/question-contract.mjs';
import { checkOrWriteCourseLinks, courseForQuestion, trackId } from '../scripts/content/add-claude-course-links.mjs';
const read = path => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
const directory = new URL(`../content/${trackId}/`, import.meta.url);
const currentQuestions = readdirSync(directory).flatMap(node => readdirSync(new URL(`${node}/`, directory)).filter(name => name.endsWith('.json')).flatMap(file => JSON.parse(readFileSync(new URL(`${node}/${file}`, directory), 'utf8'))));
const fixture = await createPreQleProducerFixture(fileURLToPath(new URL('../', import.meta.url)));
after(() => fixture.cleanup());
const historicalDirectory = new URL(`content/${trackId}/`, pathToFileURL(fixture.root + '/'));
const questions = readdirSync(historicalDirectory).flatMap(node => readdirSync(new URL(`${node}/`, historicalDirectory)).filter(name => name.endsWith('.json')).flatMap(file => JSON.parse(readFileSync(new URL(`${node}/${file}`, historicalDirectory), 'utf8'))));

test('historical 918 questions have exact course metadata from final CC01+CC02 map, without changing any other question field', () => {
  assert.equal(questions.length, 918);
  assert.equal(currentQuestions.length, 972);
  assert.throws(() => checkOrWriteCourseLinks(), /Missing course mapping/u); // historical CC04 authoring command must not invent new mappings
  for (const question of currentQuestions.filter(q => q.questionId.includes('-qle-v2-'))) assert.equal(validateQuestion(question).valid, true);
  for (const question of questions) {
    assert.deepEqual(question.feedback.course, courseForQuestion(question.questionId));
    assert.equal(validateQuestion(question).valid, true);
    assert.ok(question.feedback.details.url.startsWith('https://'));
    assert.notEqual(question.feedback.details.url, question.feedback.course.url);
    assert.equal(question.feedback.course.requiresAccount, true);
  }
  const baseline = read('evidence/canonical-content-approvals/claude-cc03-question-baseline.json');
  const withoutCourse = structuredClone(questions).sort((a,b) => a.questionId < b.questionId ? -1 : a.questionId > b.questionId ? 1 : 0);
  for (const question of withoutCourse) delete question.feedback.course;
  assert.equal(sha256(canonicalJson(withoutCourse)), baseline.withoutCourseSha256);
  assert.equal(withoutCourse.length, baseline.questionCount);
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
