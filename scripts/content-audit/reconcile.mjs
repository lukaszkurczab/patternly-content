import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInventory } from '../model-evaluation/inventory.mjs';

// Reuses exact source judgments; it never generates or grants a semantic verdict.
const root = fileURLToPath(new URL('../../', import.meta.url));
const baseline = path.join(root, 'evidence/business-quality/full-content-audit-2026-10-02');
const output = process.argv[2];
if (!output) throw new Error('Usage: node scripts/content-audit/reconcile.mjs <output.json>');
const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
if (execFileSync('git', ['status', '--porcelain', '--untracked-files=all', '--', 'content', 'config/tracks'],
  { cwd: root, encoding: 'utf8' }).trim()) throw new Error('Commit canonical source changes before audit reconciliation');
execFileSync(process.execPath, [path.join(baseline, 'verify.mjs')], { stdio: 'inherit' });
const prior = new Map((await readFile(path.join(baseline, 'ledger.jsonl'), 'utf8'))
  .split('\n').filter(Boolean).map(JSON.parse).map(row => [`${row.track}|${row.itemId}`, row]));
const current = await createInventory({ rootDirectory: root });
const items = [];
for (const track of current.tracks) for (const node of track.nodes) for (const unit of node.mentalUnits) {
  for (const item of unit.items) {
    const old = prior.get(`${track.trackId}|${item.questionId}`);
    const file = `content/${unit.sourcePath}`;
    const matched = Boolean(old?.review && old.itemSha256 === item.itemSha256
      && old.file === file && old.taxonomy.nodeId === node.nodeId
      && old.taxonomy.mentalUnitId === unit.mentalUnitId);
    items.push({ track: track.trackId, contentVersion: track.contentVersion,
      node: node.nodeId, mentalUnit: unit.mentalUnitId, file, itemId: item.questionId,
      itemSha256: item.itemSha256, sourceSha256: unit.sourceSha256,
      status: matched ? 'EXACT_PRIOR_SOURCE_REVIEW' : 'PENDING_CURRENT_RECONCILIATION',
      priorReview: matched ? { contentVersion: old.contentVersion, verdict: old.review.verdict,
        reviewedAt: old.review.reviewedAt, ledgerKey: `${old.track}|${old.contentVersion}|${old.itemId}` } : null });
  }
}
const matchedCount = items.filter(item => item.priorReview).length;
const summary = { schemaVersion: 'patternly-content-audit-source-binding-v1',
  status: 'IN_PROGRESS', sourceCommit, inventoryCount: items.length, matchedPriorSourceCount: matchedCount,
  pendingCurrentReconciliationCount: items.length - matchedCount,
  boundary: 'Exact prior source review is reusable input, not current factual/scoring acceptance. Changed objects remain pending. Accepted newer OOD/Claude/BESD reviews require independent exact-rubric reconciliation; no generated PASS or batch inheritance.',
  observed: current.observed, baselineManifest: 'evidence/business-quality/full-content-audit-2026-10-02/manifest.json', items };
await writeFile(path.resolve(output), `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify({ status: summary.status, inventoryCount: items.length,
  matchedPriorSourceCount: matchedCount, pendingCurrentReconciliationCount: items.length - matchedCount }));
