import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { buildTrack } from '../scripts/build.mjs';
import { scoreQuestion, validateQuestion } from '../scripts/content/question-contract.mjs';
import { loadCurrentQuestionBank } from './helpers/current-question-bank.mjs';
const ROOT = fileURLToPath(new URL('../', import.meta.url));
const TRACK = 'claude-certified-architect-professional-certification';
const read = relative => JSON.parse(readFileSync(path.join(ROOT, relative), 'utf8'));
const registry = read(`config/certification-source-registries/${TRACK}.json`);
const sourceById = new Map(registry.sources.map(source => [source.sourceId, source]));
const { questions: allCanonical, byId: canonicalById } = await loadCurrentQuestionBank(TRACK);
// Independent answer-text expectations, retained as current regression cases rather than historical bank snapshots.
const expectedAnswers = [
  [
    "CCARP-D01-O07-scenario-01",
    "Treat generated names as uncertain; resolve docket IDs against an authoritative registry and evaluate exact-match errors across representative cases."
  ],
  [
    "CCARP-D01-O07-scenario-02",
    "Evaluate repeated runs across representative long and short cases, track omission variance, and set a release threshold for the risky fields."
  ],
  [
    "CCARP-D01-O07-scenario-03",
    "Use the model for interpretation, then validate the response against a schema and reject or repair invalid structure before downstream use."
  ],
  [
    "CCARP-D01-O07-scenario-04",
    "Constrain the action field to the four supported values and have the application reject any value outside the ledger contract."
  ],
  [
    "CCARP-D01-O08-scenario-01",
    "Select only among routes whose exact model, feature, region, and processor configuration is confirmed approved; compare latency and cost within that eligible set."
  ],
  [
    "CCARP-D01-O08-scenario-02",
    "Treat the unverified candidate as ineligible until its exact residency configuration is confirmed; present the verified eligible route and identify the remaining tradeoff."
  ],
  [
    "CCARP-D01-O08-scenario-03",
    "Keep the verified route active; map app-owned tenant identity and route policy, require each platform/security owner to verify the exact alternate configuration and contracts, assign audit/incident ownership, and test the fallback before approval."
  ],
  [
    "CCARP-D01-O08-scenario-04",
    "Route urgent cases to A and eligible routine cases to B, while monitoring each route against its approved configuration, latency, and cost limits."
  ],
  [
    "CCARP-D01-O09-scenario-01",
    "48,000 calls/day, 57.6 million input tokens/day, and 14.4 million output tokens/day, then apply route/model prices and operational headroom."
  ],
  [
    "CCARP-D01-O09-scenario-02",
    [/authoritative lookup/, /Assign eligibility to deterministic rule enforcement/, /model interpretation and explanation under review/]
  ],
  [
    "CCARP-D01-O09-scenario-03",
    "Set a language-specific minimum on the exact action outcome; test route/model or deterministic controls for that slice and keep it out of autonomous action until it clears the boundary."
  ],
  [
    "CCARP-D01-O09-scenario-04",
    "Size the routine and exception populations separately; keep the proven one-call routine path and test whether the exception workflow can meet its distinct cost, context, and latency boundaries before expanding it."
  ],
  [
    "CCARP-D03-O09-scenario-01",
    [/Claude API or SDK behind the product service/, /app-owned tenant authorization and UI/]
  ],
  [
    "CCARP-D03-O09-scenario-02",
    [/Claude Code on the workstations/, /scoped permissions/, /test\/diff verification/]
  ],
  [
    "CCARP-D03-O09-scenario-03",
    [/Share tools through MCP/, /identity and tenant access in the trusted service/]
  ],
  [
    "CCARP-D03-O09-scenario-04",
    [/Distribute a versioned Skill/, /API execution and authorization in the existing service/]
  ],
  [
    "CCARP-D03-O09-scenario-05",
    [/Agent SDK in the company-operated process/, /approved tools/, /backend identity checks/]
  ],
  [
    "CCARP-D03-O10-scenario-01",
    [/Honor the retry delay within the deadline/, /retry budget/, /same idempotency key/]
  ],
  [
    "CCARP-D03-O10-scenario-02",
    [/Open the circuit/, /degraded\/unavailable state/, /probe recovery/]
  ],
  [
    "CCARP-D03-O10-scenario-03",
    [/Gate fallback on required quality and latency tests/, /approved degraded or unavailable state/]
  ],
  [
    "CCARP-D03-O10-scenario-04",
    [/durable intent identity/, /provider-side deduplication/, /status reconciliation/]
  ],
  [
    "CCARP-D04-O02-cc02-01",
    [/full conversations/, /corrected dates at varied later turns/]
  ],
  [
    "CCARP-D04-O02-cc02-02",
    [/document switches and follow-ups/, /each claim against its intended source/]
  ],
  [
    "CCARP-D04-O02-cc02-03",
    [/preference use/, /expired-code suppression as separate outcomes/]
  ],
  [
    "CCARP-D04-O02-cc02-04",
    [/representative long transcripts/, /length and constraint position/]
  ],
  [
    "CCARP-D04-O07-scenario-01",
    [/Predeclare a meaningful effect/, /baseline variability/, /sample size/, /stopping rule/]
  ],
  [
    "CCARP-D04-O07-scenario-02",
    [/Report uncertainty/, /sample plan/, /guarded cohort/]
  ],
  [
    "CCARP-D04-O07-scenario-03",
    [/benefit against experiment cost/, /defer or label cheaper evidence exploratory/]
  ],
  [
    "CCARP-D04-O07-scenario-04",
    [/meaningful 4%-to-2% change/, /uncertainty, power/, /inconclusive-outcome rule/]
  ],
  [
    "CCARP-D05-O06-scenario-01",
    [/application authorization before each household-record read/]
  ],
  [
    "CCARP-D05-O06-scenario-02",
    [/current, versioned policy data/]
  ],
  [
    "CCARP-D05-O06-scenario-03",
    [/Authenticate the clinician/, /authorize each patient read before retrieval/]
  ],
  [
    "CCARP-D05-O06-scenario-04",
    [/Screen advice/, /redact identifiers/, /withhold exports that fail validation/]
  ],
  [
    "CCARP-D05-O07-scenario-01",
    [/required-field validator before intake proceeds/]
  ],
  [
    "CCARP-D05-O07-scenario-02",
    [/semantic screening/, /defined failure path/]
  ],
  [
    "CCARP-D05-O07-scenario-03",
    [/trusted service/, /before executing the transfer/]
  ],
  [
    "CCARP-D05-O07-scenario-04",
    [/Keep the amount gate/, /hold for the unavailable fraud screen/]
  ],
  [
    "CCARP-D05-O08-scenario-01",
    [/Trace data, extraction, examples, and routing by group/]
  ],
  [
    "CCARP-D05-O08-scenario-02",
    [/group-and-region error rates with denominators/]
  ],
  [
    "CCARP-D05-O08-scenario-03",
    [/versioned examples/, /group-level routing outcomes/]
  ],
  [
    "CCARP-D05-O08-scenario-04",
    [/Audit corpus and labels/, /evaluate the affected dialect/]
  ],
  [
    "CCARP-D05-O09-scenario-01",
    [/governed decision traces/, /audience-specific views/]
  ],
  [
    "CCARP-D05-O09-scenario-02",
    [/governed per-decision evidence and version links/]
  ],
  [
    "CCARP-D05-O09-scenario-03",
    [/required cases with reviews/, /trigger versions/]
  ],
  [
    "CCARP-D05-O09-scenario-04",
    [/grounded explanation/, /restrict the technical trace/]
  ],
  [
    "CCARP-D06-O06-scenario-01",
    [/Repair freshness triggers/, /owner and slice recheck/]
  ],
  [
    "CCARP-D06-O06-scenario-02",
    [/structural limit/, /revise design or requirement/]
  ],
  [
    "CCARP-D06-O06-scenario-03",
    [/Diagnose the region/, /targeted route correction/]
  ],
  [
    "CCARP-D06-O06-scenario-04",
    [/authorization before external actions execute/]
  ],
  [
    "CCARP-D06-O07-scenario-01",
    [/total cost per correct invoice/, /correction effort/]
  ],
  [
    "CCARP-D06-O07-scenario-02",
    [/route rationale/, /owned, comparable outcome evidence/]
  ],
  [
    "CCARP-D06-O07-scenario-03",
    [/Report the gap/, /comparable guarded measurement/]
  ],
  [
    "CCARP-D06-O07-scenario-04",
    [/business outcome/, /comparable measures/, /evidence limits/]
  ],
  [
    "CCARP-D07-O01-expansion-16",
    [/Honor deny/, /authorized policy-change channel/]
  ],
  [
    "CCARP-D07-O01-expansion-20",
    [/Approve the server/, /authenticate and verify the user connection/]
  ],
  [
    "CCARP-D07-O01-expansion-22",
    [/documented rules/, /verify behavior/]
  ],
  [
    "CCARP-D07-O01-expansion-27",
    [/Resolve folder trust, server approval, and user sign-in separately/]
  ],
  [
    "CCARP-D07-O01-expansion-28",
    [/Managed scalar policy wins/, /administrator owns changes/]
  ],
  [
    "CCARP-D07-O01-expansion-30",
    [/Honor deny-first/, /owner to review and retest policy/]
  ],
  [
    "CCARP-D07-O02-cc02-01",
    [/Run relevant checks/, /required review of behavior and risk/]
  ],
  [
    "CCARP-D07-O02-cc02-02",
    [/Test malformed inputs/, /inspect the parser boundary/]
  ],
  [
    "CCARP-D07-O02-cc02-03",
    [/Test exact migration invariants/, /review explanation quality by rubric/]
  ],
  [
    "CCARP-D07-O02-cc02-04",
    [/AI drafting and checks/, /required peer approval/]
  ],
  [
    "CCARP-D07-O03-cc02-01",
    [/Document safe diagnosis and escalation/, /team teach-back/]
  ],
  [
    "CCARP-D07-O03-cc02-02",
    [/Classify credential and policy failures/, /route each to its owner/]
  ],
  [
    "CCARP-D07-O03-cc02-03",
    [/approved diagnosis, correction, verification, and escalation/]
  ],
  [
    "CCARP-D07-O03-cc02-04",
    [/safe bounded recovery/, /evidence, escalation, and rehearsal/]
  ],
  [
    "CCARP-D07-O04-scenario-01",
    [/owned, versioned plugin/, /support group/]
  ],
  [
    "CCARP-D07-O04-scenario-02",
    [/Govern the shared Skill centrally/, /project guidance local/]
  ],
  [
    "CCARP-D07-O04-scenario-03",
    [/Release and verify the update/, /remove obsolete active versions/]
  ],
  [
    "CCARP-D07-O04-scenario-04",
    [/Keep distribution internal/, /public release is approved/]
  ],
  [
    "CCARP-D07-O05-scenario-01",
    [/Pilot with local champions/, /expand with support evidence/]
  ],
  [
    "CCARP-D07-O05-scenario-02",
    [/Validate the new department’s workflow, controls, and setup/]
  ],
  [
    "CCARP-D07-O05-scenario-03",
    [/Narrow expansion/, /equip champions and verify support readiness/]
  ],
  [
    "CCARP-D07-O05-scenario-04",
    [/Measure verified work, blockers, and support burden by cohort/]
  ],
  [
    "CCARP-D07-O06-scenario-01",
    [/Verify model restrictions, spend controls, and alert response/]
  ],
  [
    "CCARP-D07-O06-scenario-02",
    [/Allocate budgets/, /earlier alerts and response owners/]
  ],
  [
    "CCARP-D07-O06-scenario-03",
    [/Compare workflow calls, token usage, retries, and outcomes/]
  ],
  [
    "CCARP-D07-O06-scenario-04",
    [/Assign the budget owner, alert recipients, and response/]
  ],
  [
    "CCARP-SUP-COWORK-01",
    "Cowork, with the analyst supervising file access and reviewing the saved draft before sharing it."
  ],
  [
    "CCARP-SUP-COWORK-02",
    "Use a supervised workflow that limits the selected files, creates proposed or reversible changes, and requires the coordinator to inspect before replacing originals."
  ],
  [
    "CCARP-SUP-COWORK-03",
    "Limit access to the selected files, treat their contents as untrusted data, prepare a draft, and let the user verify the content and recipients before sending."
  ],
  [
    "CCARP-SUP-COWORK-04",
    "Select a small representative cohort, define the folders/actions in scope, measure task outcomes and support issues, and expand only after reviewing permissions and user feedback."
  ]
];

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

test('current course-linked questions keep independently reviewed answer semantics and registered sources', () => {
  const supplement = read(`supplements/${TRACK}/cc02-course-supplement-v1/cowork-entry-point.json`);
  const answerReviewedById = new Map([...allCanonical, ...supplement.questions].map(question => [question.questionId, question]));
  assert.equal(expectedAnswers.length, 83);
  assert.equal(new Set(expectedAnswers.map(([id]) => id)).size, 83);
  for (const [id, text] of expectedAnswers) {
    const question = answerReviewedById.get(id);
    assert.ok(question, `${id}: current question or explicit non-runtime supplement exists`);
    const matches = question.interaction.options.filter(option => Array.isArray(text)
      ? text.every(pattern => pattern.test(option.text))
      : option.text === text);
    assert.equal(matches.length, 1, `${id}: independent answer text uniquely resolves`);
    assert.equal(question.answer.optionId, matches[0].optionId, `${id}: independent answer semantics`);
    assertQuestionScores(question);
    for (const sourceId of question.sourceRefs) assert.ok(sourceById.has(sourceId), `${id}: registered source ${sourceId}`);
  }
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
