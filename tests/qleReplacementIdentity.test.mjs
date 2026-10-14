import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createPreQleProducerFixture } from './helpers/pre-qle-producer-fixture.mjs';
import { validateQuestion } from '../scripts/content/question-contract.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const fixture = await createPreQleProducerFixture(root);
after(() => fixture.cleanup());
const read = p => JSON.parse(readFileSync(p, 'utf8'));
const coverage = read(path.join(root, 'docs/evidence/content-audits/2026-10-13-claude-qle-v2-coverage.json'));

test('semantic replacements have fresh active identities and exact historical provenance without runtime aliases', () => {
  const active = new Map();
  const old = new Map();
  for (const unit of coverage.units) {
    const bytes = readFileSync(path.join(root, unit.sourcePath));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), unit.sourceSha256, unit.mentalUnitId);
    for (const question of JSON.parse(bytes)) { assert.ok(!active.has(question.questionId)); active.set(question.questionId, question); }
    for (const question of read(path.join(fixture.root, unit.sourcePath))) old.set(question.questionId, question);
  }
  assert.equal(active.size, 972);
  assert.equal(coverage.replacementLineage.length, 8);
  const newIds = new Set();
  for (const relation of coverage.replacementLineage) {
    assert.equal(relation.kind, 'semantic_replacement');
    assert.equal(relation.effect, 'provenance_only_no_credit_or_review_alias');
    const previous = relation.predecessor;
    assert.equal(previous.trackId, coverage.trackId);
    assert.equal(previous.contentVersion, 'ccarp-2026.10.11-capacity-v1-bizq02-v2-bizq03-planning-v2-cc02-v1-cc03-v1-cc04-v3');
    assert.equal(previous.artifactSha256, '12e6c8637b112af9e48ca870bb80d89f9db6ad7d1949c51efceb37572a6cd0bd');
    assert.ok(old.has(previous.questionId));
    assert.ok(!active.has(previous.questionId));
    assert.ok(!old.has(relation.currentQuestionId));
    assert.ok(!newIds.has(relation.currentQuestionId)); newIds.add(relation.currentQuestionId);
    const current = active.get(relation.currentQuestionId); assert.ok(current);
    assert.equal(current.mentalUnitId, old.get(previous.questionId).mentalUnitId);
    assert.equal(current.questionRelation, undefined, 'unrelated decisions must not become selectable contrast pairs');
    assert.equal(validateQuestion(current).valid, true);
    const entry = coverage.units.flatMap(u => u.questions).find(q => q.questionId === relation.currentQuestionId);
    assert.equal(entry.decision, 'replace'); assert.equal(entry.replacesQuestionId, previous.questionId);
  }
});
