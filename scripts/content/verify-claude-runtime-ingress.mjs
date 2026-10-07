// Read-only compatibility probe against the application's actual catalog and pools.
// This neither installs content nor grants runtime/release admission.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const frontendRoot = process.env.PATTERNLY_FRONTEND_ROOT;
const [artifactPath, lockPath] = process.argv.slice(2);
if (!frontendRoot || !artifactPath || !lockPath) {
  throw new Error('Set PATTERNLY_FRONTEND_ROOT and pass built Claude artifact and content-lock paths; run with the application tsx loader.');
}
const readJson = file => JSON.parse(readFileSync(file, 'utf8'));
const trackId = 'claude-certified-architect-professional-certification';
const candidate = readJson(artifactPath);
const candidateLock = readJson(lockPath).tracks.find(entry => entry.trackId === trackId);
assert.equal(candidate.trackId, trackId);
assert.ok(candidateLock, 'The producer lock must contain Claude');
const bundledRoot = path.join(frontendRoot, 'src/content/generated/canonical-content');
const currentLocks = readJson(path.join(bundledRoot, 'content-lock.json')).tracks;
// The real application constructor requires all its configured tracks. Seed the
// other eight from its current bundle, replacing only Claude in memory.
const artifacts = currentLocks.map(entry => entry.trackId === trackId
  ? candidate : readJson(path.join(bundledRoot, `${entry.trackId}.json`)));
const locks = currentLocks.map(entry => entry.trackId === trackId ? candidateLock : entry);
const loaded = await import(pathToFileURL(path.join(frontendRoot, 'src/content/canonical/runtimeCatalog.ts')).href);
const { buildCanonicalRuntimeCatalog } = loaded.default ?? loaded;
const scoringModule = await import(pathToFileURL(path.join(frontendRoot, 'src/content/canonical/questionScoring.ts')).href);
const { scoreCanonicalQuestion } = scoringModule.default ?? scoringModule;
const presentationModule = await import(pathToFileURL(path.join(frontendRoot, 'src/application/canonical/canonicalInteractionPresentation.ts')).href);
const { composeCanonicalFeedback } = presentationModule.default ?? presentationModule;
const runtime = await buildCanonicalRuntimeCatalog({ artifacts, locks,
  sha256Utf8: async value => createHash('sha256').update(value, 'utf8').digest('hex') });
const track = runtime.getTrack(trackId);
assert.equal(track.contentVersion, candidate.contentVersion);
assert.equal(track.questions.length, candidate.questions.length);
for (const question of candidate.questions) {
  assert.deepEqual(track.getQuestion(question.questionId), question);
  assert.ok(track.getQuestionsForNode(question.nodeId).some(item => item.questionId === question.questionId));
  assert.ok(track.getQuestionsForMentalUnit(question.mentalUnitId).some(item => item.questionId === question.questionId));
  assert.equal(scoreCanonicalQuestion(question, question.answer).kind, 'correct', question.questionId);
  assert.equal(composeCanonicalFeedback(question, question.answer).messages.length, 0, question.questionId);
  if (question.interaction.type === 'choice_single') {
    for (const option of question.interaction.options) {
      if (option.optionId === question.answer.optionId) continue;
      const response = { type: 'choice_single', optionId: option.optionId };
      assert.equal(scoreCanonicalQuestion(question, response).kind, 'incorrect', question.questionId);
      const feedback = composeCanonicalFeedback(question, response);
      assert.deepEqual(feedback.messages.map(message => message.targetId), [option.optionId], question.questionId);
    }
  }
}
const focusMode = track.getMode('certification-focus-practice');
assert.equal(focusMode.selection.kind, 'node');
const focusPool = track.getPool(focusMode.modeId);
assert.deepEqual(focusPool.map(item => item.questionId).sort(),
  candidate.questions.filter(item => item.nodeId === focusMode.selection.nodeId).map(item => item.questionId).sort());
console.log(JSON.stringify({ scope: 'Isolated actual-app catalog/pool compatibility; no installation or admission',
  contentVersion: track.contentVersion, questionCount: track.questions.length,
  mentalUnitCount: new Set(track.questions.map(item => item.mentalUnitId)).size,
  canonicalAnswersScored: candidate.questions.length,
  focusPoolCount: focusPool.length, artifactSha256: track.artifactSha256 }, null, 2));
