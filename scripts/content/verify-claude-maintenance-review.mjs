// Read-only evidence coverage. This does not grant editorial, runtime or release approval.
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { validateTrack } from '../build.mjs';
import { canonicalJson } from '../review/candidate-manifest.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const trackId = 'claude-certified-architect-professional-certification';
const evidenceDirectory = path.join(root, 'docs/evidence/content-audits');
const lines = async file => (await readFile(file, 'utf8')).split(/\r?\n/u).filter(line => line.trim()).map(JSON.parse);
const rubric = JSON.parse(await readFile(path.join(evidenceDirectory, '2026-10-07-claude-review-rubric.json'), 'utf8'));
const reviewFiles = process.argv.slice(2);
if (!reviewFiles.length) reviewFiles.push(path.join(evidenceDirectory, '2026-10-07-claude-current-review.jsonl'));
const records = (await Promise.all(reviewFiles.map(lines))).flat().map(record => ({
  record, origin: record.reuseEvidence?.origin === 'historical' ? 'historical' : 'current',
}));
const { questions, track } = await validateTrack({ rootDirectory: root, trackId });
const hash = value => createHash('sha256').update(canonicalJson(value)).digest('hex');
const decisions = questions.map(question => {
  const itemSha256 = hash(question);
  const matching = records.filter(({ record }) => record.itemId === question.questionId && record.itemSha256 === itemSha256);
  const current = matching.filter(entry => entry.origin === 'current');
  const applicable = current.length ? current : matching;
  const complete = ({ record }) => record.track === trackId && record.verdict === 'PASS'
    && record.file === `content/${trackId}/${question.nodeId}/${question.mentalUnitId}.json`
    && record.batch === `${trackId}/${question.nodeId}/${question.mentalUnitId}`
    && record.taxonomy?.nodeId === question.nodeId && record.taxonomy?.mentalUnitId === question.mentalUnitId
    && rubric.dimensions.every(name => ['PASS', 'NOT_APPLICABLE'].includes(record.dimensions?.[name]?.status)
      && typeof record.dimensions[name].evidence === 'string' && record.dimensions[name].evidence.trim())
    && question.interaction.options.every(option => option.optionId === question.answer.optionId
      || question.answer.optionIds?.includes(option.optionId)
      || record.distractors?.some(distractor => distractor.optionId === option.optionId
        // Historical status FAIL denotes a wrong answer, not poor distractor quality.
        // Quality is established by the item-level distractor_quality dimension.
        && ['PASS', 'FAIL'].includes(distractor.status) && distractor.explanationStatus === 'PASS'
        && typeof distractor.evidence === 'string' && distractor.evidence.trim()));
  const accepted = applicable.every(entry => entry.record.verdict === 'PASS')
    ? applicable.find(complete) : undefined;
  return { itemId: question.questionId, itemSha256, status: accepted ? 'REVIEW_EVIDENCE_MATCHES' : 'MISSING_OR_NONPASS_REVIEW',
    origin: accepted?.origin ?? null, verdicts: applicable.map(entry => entry.record.verdict) };
});
const missing = decisions.filter(decision => decision.status !== 'REVIEW_EVIDENCE_MATCHES');
console.log(JSON.stringify({ scope: 'Whole-item semantic review evidence; no release authority', trackId,
  contentVersion: track.contentVersion, questionCount: questions.length,
  matchedHistorical: decisions.filter(decision => decision.origin === 'historical').length,
  matchedCurrent: decisions.filter(decision => decision.origin === 'current').length,
  missingCount: missing.length, missing }, null, 2));
if (missing.length) process.exitCode = 1;
