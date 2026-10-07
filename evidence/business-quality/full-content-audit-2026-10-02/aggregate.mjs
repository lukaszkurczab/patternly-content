import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

// Aggregates validated findings only. It never assigns an audit verdict.
const audit = path.dirname(fileURLToPath(import.meta.url));
const planPath = process.argv[2];
if (!planPath) throw Error('Usage: node aggregate.mjs <canonical PATTERNLY-WORKING-PLAN.md>');
const summary = JSON.parse(fs.readFileSync(path.join(audit, 'summary.json')));
if (summary.validationErrors.length) throw Error('Resolve invalid review records before aggregating');
const ledger = fs.readFileSync(path.join(audit, 'ledger.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
if (ledger.filter(x => x.review).length !== summary.auditedCount) throw Error('Ledger and summary are inconsistent');
const groups = new Map();
for (const entry of ledger) {
  const review = entry.review;
  if (!review || review.verdict === 'PASS') continue;
  const group = groups.get(entry.batch) ?? {batch: entry.batch, track: entry.track, family: entry.family, contentVersion: entry.contentVersion, file: entry.file, reviews: []};
  group.reviews.push(review);
  groups.set(entry.batch, group);
}
const unique = xs => [...new Set(xs)].sort();
const runtimeOnly = review => review.findings.length > 0 && review.findings.every(f => f.code === 'MULTIPLE_CHOICE_RUNTIME_CONTRACT_MISMATCH');
const tasks = [...groups.values()].sort((a, b) => a.batch.localeCompare(b.batch)).map(group => ({
  taskId: 'FCA-EDIT-' + crypto.createHash('sha256').update(group.batch).digest('hex').slice(0, 10),
  status: 'planned; audit scope still in progress',
  track: group.track, batch: group.batch, contentVersion: group.contentVersion, file: group.file,
  itemIds: group.reviews.map(x => x.itemId).sort(),
  runtimeOnlyItemIds: group.reviews.filter(runtimeOnly).map(x => x.itemId).sort(),
  authoredContentItemIds: group.reviews.filter(x => !runtimeOnly(x)).map(x => x.itemId).sort(),
  defectCategories: unique(group.reviews.flatMap(x => x.findings.map(f => f.code))),
  requiredCorrections: unique([...group.reviews.filter(x => !runtimeOnly(x)).flatMap(x => x.findings.map(f => f.remediation)), ...(group.reviews.some(runtimeOnly) ? ['For runtimeOnlyItemIds, resolve scoring through FCA-SCORE-01 and recheck actual responses; do not rewrite valid question content or create a content version solely to conceal a shared scorer defect.'] : [])]),
  evidenceByItem: group.reviews.map(x => ({itemId: x.itemId, findings: x.findings})),
  factCheckRequirements: group.family === 'certification' ? 'Check every material provider claim in current official documentation; record URL, checked date, exact capability/limitation and sourceRefs. Existing source URLs are starting points, not automatic approval.' : 'Derive the relevant mechanism, invariant, state and boundary or cost model; use official technical documentation when a framework/protocol fact determines the answer.',
  sourceUrls: unique(group.reviews.flatMap(x => x.factChecks.map(f => f.url)).filter(Boolean)),
  forbiddenChanges: 'No mass rewrite of the bank, filtering/hiding items, empty replacements, new runtime schema, historical artifact mutation, old-to-new compatibility map, or altered primary objective under the same ID. Preserve unaffected items; new objective/interaction requires new identity under docs 07.',
  validationCommands: [`cd patternly-content && npm run content:validate -- --track ${group.track}`, `cd patternly-content && npm run content:test -- --track ${group.track}`, 'cd patternly-content && npm run test:shared-contract', 'node patternly-content/evidence/business-quality/full-content-audit-2026-10-02/verify.mjs'],
  reReview: 'Review every changed item again in all 13 dimensions, every active distractor and actual scoring; include its duplicate peers. Write a new version-bound review; preserve the pinned historical audit.',
  humanReviewHandoff: 'Provide exact changed IDs, before/after source hashes, official fact checks where applicable, rubric results and validation to the human technical/editorial reviewer; this model audit does not grant sign-off.',
  acceptanceCriteria: 'All listed item-specific findings resolved or explicitly adjudicated with evidence; one unambiguous accepted contract per item; meaningful Reason/Details and wrong/omitted feedback; no regression in unaffected items or required pool coverage. Audit-wide completion remains auditedCount == inventoryCount with zero validation errors.',
  versionManifestDependency: 'If authored canonical content changes, issue a new immutable contentVersion and regenerate current candidate/source manifests, artifacts, readiness/admission and app release lock through existing tools. Never modify published/historical identities. Runtime-only findings depend on FCA-SCORE-01; valid question text needs no editorial rewrite. Determine any release/version change from the owning semantic identity contract.',
}));
const multiple = ledger.filter(x => x.interactionType === 'choice_multiple');
tasks.push({
  taskId: 'FCA-SCORE-01', status: 'planned; confirmed runtime defect',
  track: 'all tracks using choice_multiple', batch: 'shared choice_multiple contract',
  itemIds: multiple.map(x => x.itemId).sort(),
  identityManifest: multiple.map(x => ({itemId: x.itemId, track: x.track, contentVersion: x.contentVersion, file: x.file})),
  defectCategories: ['MULTIPLE_CHOICE_RUNTIME_CONTRACT_MISMATCH', 'TESTS_PRESERVE_NONCANONICAL_SCORING'],
  requiredCorrections: ['Reconcile patternly-content/scripts/content/question-contract.mjs and patternly/src/content/canonical/questionScoring.ts with docs 17 §7 and docs 16: any wrong selected option yields incorrect and zero; exact full correct set is correct; non-empty proper correct-only subset is partial. Remove points for merely leaving a wrong option unselected.', 'Replace the tests that currently require partial/points for all-correct-plus-wrong and empty selections; verify source/app parity and family/session feedback on actual accepted/omitted responses. Establish the precise partial-points denominator from owning contracts before changing it; do not silently retain per-option classification.'],
  evidenceByItem: ['scoring-probe.mjs reproduces 3/4 partial for all four selected options on alg-arrays-duplicate-handling-003 and -011; source and app code share the classification rule; tests/shared-contract.test.mjs explicitly expects it.'],
  factCheckRequirements: 'Product scoring contract: docs/17-training-runtime-and-interaction-spec.md §7 and docs/16-coding-interview-learning-system.md. No provider claim is needed for this system defect.',
  forbiddenChanges: 'Do not patch question text to disguise runtime scoring, add a family-specific parallel scorer, weaken docs/tests to match the defect, migrate old local history without a demonstrated need, or claim 440 semantic item reviews from this mechanical affected-scope inventory.',
  validationCommands: ['node patternly-content/evidence/business-quality/full-content-audit-2026-10-02/scoring-probe.mjs <pinned patternly-content directory>', 'cd patternly-content && npm run test:shared-contract', 'cd patternly && node --import tsx --test src/content/canonical/questionCore.test.ts', 'node patternly-content/evidence/business-quality/full-content-audit-2026-10-02/verify.mjs'],
  reReview: 'Re-evaluate each affected item scoring dimension against actual source/app responses; continue all other dimensions independently. Preserve historical audit/version bindings.',
  humanReviewHandoff: 'Provide contract comparison, precise partial-points rule, actual source/app probes, changed tests and affected identity manifest to human technical/editorial review.',
  acceptanceCriteria: 'Wrong-containing legal selections always score incorrect/zero; complete set correct; non-empty correct-only subset partial; empty/unknown/duplicate responses follow explicit validation semantics; source and app agree; feedback and downstream evidence use the same result.',
  versionManifestDependency: 'If semantics are encoded in content/release identity, issue new immutable versions and current manifests/app lock through existing candidate/admission tools; never rewrite historical evidence. Runtime release and affected item scoring review must bind to the same candidate.',
});
fs.writeFileSync(path.join(audit, 'remediation-tasks.json'), JSON.stringify({auditId: summary.auditId, auditedCount: summary.auditedCount, inventoryCount: summary.inventoryCount, status: 'IN_PROGRESS', taskCount: tasks.length, tasks}, null, 2) + '\n');
const begin = '<!-- FULL-CONTENT-AUDIT-2026-10-02:BEGIN -->';
const end = '<!-- FULL-CONTENT-AUDIT-2026-10-02:END -->';
const relative = '../patternly-content/evidence/business-quality/full-content-audit-2026-10-02/';
let section = `${begin}\n\n## Pełny audit contentu — konkretne remediation tasks (FCA)\n\n**Stan: IN_PROGRESS — ${summary.auditedCount}/${summary.inventoryCount} indywidualnych ocen; ${summary.pendingCount} oczekujących.** Poniższa agregacja obejmuje wyłącznie istniejące findingi, nie zamyka audytu ani human editorial sign-off. Bez samplingu i bez napraw contentu w zadaniu audytowym. Nowe wyniki rozszerzają odpowiednią partię; zadania mają stabilne ID z tożsamości batcha.\n\n[Ledger](${relative}ledger.jsonl), [inventory/piny](${relative}manifest.json), [pełne zadania i dowody per ID](${relative}remediation-tasks.json), [aktualne liczniki](${relative}summary.json). Utrzymane podejście: fit 0.96 / simplicity 0.92 / risk 0.85 / maintainability 0.92; minimum 0.85. Piny, osobne oceny i jawne PENDING zapobiegają fałszywemu zakończeniu.\n`;
for (const task of tasks) {
  const correctionScope = task.runtimeOnlyItemIds?.length ? `- **Runtime-only IDs (${task.runtimeOnlyItemIds.length}):** ${task.runtimeOnlyItemIds.map(x => '`' + x + '`').join(', ')}. Wyłącznie zależność od FCA-SCORE-01 i ponowny review punktacji; pozostałe ID mają findingi autorskie.\n` : '';
  section += `\n### ${task.taskId}\n\n- **Track/batch:** \`${task.track}\` / \`${task.batch}\`. ${task.contentVersion ? `Baseline contentVersion: \`${task.contentVersion}\`; source: \`${task.file}\`.` : 'Dokładne wersje/pliki wszystkich objętych ID znajdują się w identityManifest zadania.'}\n- **Exact item IDs (${task.itemIds.length}):** ${task.itemIds.map(x => '`' + x + '`').join(', ')}.\n- **Defect categories:** ${task.defectCategories.map(x => '`' + x + '`').join(', ')}.\n- **Required corrections:** ${task.requiredCorrections.join(' ')}\n- **Source/fact-check:** ${task.factCheckRequirements} ${task.sourceUrls?.length ? 'Źródła początkowe: ' + task.sourceUrls.join(', ') + '.' : ''}\n- **Forbidden changes:** ${task.forbiddenChanges}\n- **Validation commands:** ${task.validationCommands.map(x => '`' + x + '`').join('; ')}.\n- **Ponowny item-level review:** ${task.reReview}\n- **Human-review handoff:** ${task.humanReviewHandoff}\n- **Acceptance criteria:** ${task.acceptanceCriteria}\n- **ContentVersion/manifest dependency:** ${task.versionManifestDependency}\n`;
  section += correctionScope;
}
section += `\n${end}\n`;
const plan = fs.readFileSync(planPath, 'utf8');
const start = plan.indexOf(begin), stop = plan.indexOf(end);
if ((start < 0) !== (stop < 0) || start >= 0 && stop < start) throw Error('Invalid audit section markers; preserve plan and repair manually');
const next = start < 0 ? plan.trimEnd() + '\n\n' + section : plan.slice(0, start) + section + plan.slice(stop + end.length).replace(/^\n/, '');
fs.writeFileSync(planPath, next);
console.log(JSON.stringify({auditedCount: summary.auditedCount, taskCount: tasks.length, affectedMultipleChoiceCount: multiple.length}));
