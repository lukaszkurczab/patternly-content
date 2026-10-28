import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { sha256 } from "../scripts/build.mjs";
import { loadContract, cacheKey, requiredDimensions, prepareTrack, createTask, chapterMinimumReport } from "../scripts/model-evaluation/contract.mjs";
import { runOffline, offlineFixtureAdapter } from "../scripts/model-evaluation/runner.mjs";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const fixtures = JSON.parse(await readFile(new URL("./fixtures/model-evaluation/09-b-cases.json", import.meta.url)));
const clone = (value) => structuredClone(value);
const contract = await loadContract();
const source = fixtures.input.subject.questionId;
const config = (storeDirectory, response = fixtures.good, input = fixtures.input) => ({ storeDirectory, runId: "first", budgetId: "fixture-budget", budgetLimitMicroUsd: 1000,
  inputs: [clone(input)], adapter: offlineFixtureAdapter({ [input.subject.questionId || input.subject.scope]: response }), contract });
const resultOf = (report) => Object.values(report.completed)[0].result;
const read = async (file) => JSON.parse(await readFile(file, "utf8"));
async function temporary(fn) { const directory = await mkdtemp(path.join(os.tmpdir(), "patternly-09b-")); try { return await fn(directory); } finally { await rm(directory, { recursive: true, force: true }); } }
const mutation = (fn) => { const response = clone(fixtures.good); fn(response); return response; };

for (const [name, expected] of [["good", "PASS"], ["hardFail", "FAIL"], ["incomplete", "INSUFFICIENT_EVIDENCE"], ["disagreement", "DISAGREEMENT"]]) {
  test(`actual offline runner normalizes proposed ${name} fixture to ${expected}`, () => temporary(async (directory) => {
    const report = await runOffline(config(directory, fixtures[name])); const result = resultOf(report);
    assert.equal(result.status, expected); assert.equal(report.phaseStatus, "APPROVED");
    assert.equal(report.providerCalls, 0); assert.equal(report.incurredMicroUsd, 21);
    assert.equal(result.rawArtifactSha256, sha256(await readFile(path.join(directory, result.rawArtifactPath))));
    assert.equal((await read(path.join(directory, "budget.json"))).requests[0].state, "settled");
  }));
}

test("minimum aggregation preserves hard-fail and incomplete blockers", () => temporary(async (directory) => {
  const response = clone(fixtures.hardFail); response.assessments[0].dimensions.pop();
  const result = resultOf(await runOffline(config(directory, response)));
  assert.equal(result.score, .1); assert.equal(result.status, "FAIL");
  assert.ok(result.blockers.includes("FAIL")); assert.ok(result.blockers.includes("INSUFFICIENT_EVIDENCE"));
}));
for (const score of [.87, .9, .93]) test(`near-threshold inclusive ${score} never becomes PASS`, () => temporary(async (directory) => {
  const result = resultOf(await runOffline(config(directory, mutation((r) => { r.assessments[0].dimensions[0].score = score; }))));
  assert.ok(result.blockers.includes("ADJUDICATION_REQUIRED")); assert.notEqual(result.status, "PASS");
}));
test("low confidence has explicit adjudication semantics", () => temporary(async (directory) => {
  const response = mutation((r) => { r.assessments[0].confidence = .79; });
  assert.equal(resultOf(await runOffline(config(directory, response))).status, "ADJUDICATION_REQUIRED");
}));

const malformed = [
  ["unknown top field", (r) => { r.extra = true; }], ["unknown dimension field", (r) => { r.assessments[0].dimensions[0].extra = true; }],
  ["score >1", (r) => { r.assessments[0].dimensions[0].score = 1.01; }], ["non-finite score", (r) => { r.assessments[0].dimensions[0].score = NaN; }],
  ["string score", (r) => { r.assessments[0].dimensions[0].score = "1"; }], ["negative cost", (r) => { r.costMicroUsd = -1; }],
  ["fractional usage", (r) => { r.usage.inputTokens = .5; }], ["negative usage", (r) => { r.usage.inputTokens = -1; }],
  ["missing source", (r) => { r.assessments[0].dimensions[0].sourceRefs = []; }], ["unknown action", (r) => { r.assessments[0].recommendedActions = ["APPROVE_CONTENT"]; }],
  ["unknown hard fail", (r) => { r.assessments[0].hardFails = [{ code: "SIMILAR_WORDING", rationale: "Invalid", evidence: ["x"], sourceRefs: ["x"] }]; }],
  ["duplicate dimension", (r) => { r.assessments[0].dimensions.push(clone(r.assessments[0].dimensions[0])); }],
  ["non-applicable dimension", (r) => { r.assessments[0].dimensions[0].id = "ordering_quality"; }],
  ["wrong cost", (r) => { r.costMicroUsd = 0; }], ["usage above cap", (r) => { r.usage.inputTokens = 101; r.costMicroUsd = 112; }]
];
for (const [label, mutate] of malformed) test(`actual runner fails closed on ${label} and keeps cost reservation`, () => temporary(async (directory) => {
  let calls = 0; const options = config(directory, mutation(mutate)); options.adapter = offlineFixtureAdapter({ [source]: mutation(mutate) }, { onInvoke: () => { calls += 1; } });
  await assert.rejects(runOffline(options));
  const ledger = await read(path.join(directory, "budget.json")); assert.equal(ledger.requests[0].state, "charge_unknown"); assert.equal(ledger.requests[0].reservedMicroUsd, 301);
  await assert.rejects(runOffline(options), /charge_unknown/); assert.equal(calls, 1);
}));

test("published strict schema agrees with successful normalized fixtures", () => temporary(async (directory) => {
  const frontend = process.env.PATTERNLY_FRONTEND_ROOT ?? path.resolve(ROOT, "../patternly");
  const require = createRequire(path.join(frontend, "package.json"));
  const Ajv = require("ajv/dist/2020.js").default;
  const validate = new Ajv({ strict: true }).compile(contract.schema);
  const result = resultOf(await runOffline(config(directory)));
  assert.equal(validate(result), true, JSON.stringify(validate.errors));
  for (const bad of [ { ...result, score: 2 }, { ...result, rawArtifactSha256: "x" }, { ...result, status: "APPROVED" }, { ...result, extra: true } ]) assert.equal(validate(bad), false);
}));

test("valid cache reuse charges zero and completed resume makes no new call", () => temporary(async (directory) => {
  let calls = 0; const options = config(directory); options.adapter = offlineFixtureAdapter({ [source]: fixtures.good }, { onInvoke: () => { calls += 1; } });
  const first = await runOffline(options); const resumed = await runOffline(options);
  assert.deepEqual(first, resumed); assert.equal(calls, 1);
  const reused = await runOffline({ ...options, runId: "second" });
  assert.equal(reused.incurredMicroUsd, 0); assert.equal(Object.values(reused.completed)[0].cacheHit, true); assert.equal(calls, 1);
}));
for (const field of ["status", "rawArtifactSha256", "score", "cacheKey", "unknown"]) test(`actual cache rejects altered ${field}`, () => temporary(async (directory) => {
  const options = config(directory, fixtures.hardFail); const report = await runOffline(options); const key = Object.keys(report.completed)[0];
  const cacheFile = path.join(directory, "cache", `${key}.json`); const record = await read(cacheFile);
  if (field === "status") record.status = fixtures.invalidCache.value;
  else if (field === "rawArtifactSha256" || field === "cacheKey") record[field] = sha256("wrong");
  else if (field === "score") record.score = 1;
  else record.unknown = true;
  await writeFile(cacheFile, JSON.stringify(record));
  await assert.rejects(runOffline({ ...options, runId: "second" }));
}));
test("raw artifact corruption cannot become PASS through cache or resume", () => temporary(async (directory) => {
  const options = config(directory); const result = resultOf(await runOffline(options));
  await writeFile(path.join(directory, result.rawArtifactPath), "{}\n"); await assert.rejects(runOffline(options));
}));

test("full contract input, prompt/rubric/model/schema/implementation and payload affect cache", async () => {
  const initial = cacheKey(fixtures.input, contract);
  for (const field of Object.keys(fixtures.input.fingerprints)) { const input = clone(fixtures.input); input.fingerprints[field] = sha256(`changed-${field}`); assert.notEqual(cacheKey(input, contract), initial); }
  for (const changed of [ { ...contract, sha256: sha256("new-prompt") }, await loadContract({ model: { ...contract.model, version: "2" } }), await loadContract({ model: { ...contract.model, parameters: { temperature: .1 } } }) ]) assert.notEqual(cacheKey(fixtures.input, changed), initial);
  const movedPointer = clone(fixtures.input); movedPointer.auditRef.pointer = "/unitCoverage/100"; assert.equal(cacheKey(movedPointer, contract), initial);
  assert.ok(contract.manifest.some((row) => row.file === "runner.mjs")); assert.ok(contract.manifest.some((row) => row.file === "contracts/result.schema.json"));
});

test("hard budget guard reserves input + output + request fee before any invocation", () => temporary(async (directory) => {
  let calls = 0; const options = config(directory); options.budgetLimitMicroUsd = 300; options.adapter = offlineFixtureAdapter({ [source]: fixtures.good }, { onInvoke: () => { calls += 1; } });
  await assert.rejects(runOffline(options), /budget_exhausted_before_call/); assert.equal(calls, 0);
  assert.deepEqual((await read(path.join(directory, "budget.json"))).requests, []);
}));
test("budget is shared across different run IDs and concurrent writers", () => temporary(async (directory) => {
  let release; let reserved; const waiting = new Promise((resolve) => { reserved = resolve; }); const gate = new Promise((resolve) => { release = resolve; });
  const first = runOffline({ ...config(directory), budgetLimitMicroUsd: 301, probe: async (stage) => { if (stage === "after_reservation") { reserved(); await gate; } } });
  await waiting;
  await assert.rejects(runOffline({ ...config(directory), runId: "second", budgetLimitMicroUsd: 301 }), /writer_lock_held/);
  release(); await first;
  const changed = clone(fixtures.input); changed.payload.extra = "different request"; changed.fingerprints.evidence = sha256(changed.payload);
  await assert.rejects(runOffline({ ...config(directory, fixtures.good, changed), runId: "second", budgetLimitMicroUsd: 301 }), /budget_exhausted_before_call/);
}));

test("adapter exception is charge_unknown and restart never retries or refunds", () => temporary(async (directory) => {
  let calls = 0; const options = config(directory); options.adapter = { kind: "offline-fixture", async evaluate() { calls += 1; throw new Error("synthetic timeout"); } };
  await assert.rejects(runOffline(options), /synthetic timeout/); await assert.rejects(runOffline(options), /charge_unknown/); assert.equal(calls, 1);
}));
for (const stage of ["after_reservation", "after_adapter", "after_raw", "after_receipt", "after_settlement", "after_checkpoint"]) {
  test(`real SIGKILL at ${stage} retains reservation or resumes idempotently`, () => temporary(async (directory) => {
    const worker = `import {readFile} from 'node:fs/promises';import {loadContract} from './scripts/model-evaluation/contract.mjs';import {runOffline,offlineFixtureAdapter} from './scripts/model-evaluation/runner.mjs';const f=JSON.parse(await readFile('./tests/fixtures/model-evaluation/09-b-cases.json'));await runOffline({storeDirectory:process.env.STORE,runId:'first',budgetId:'fixture-budget',budgetLimitMicroUsd:1000,inputs:[f.input],contract:await loadContract(),adapter:offlineFixtureAdapter({[f.input.subject.questionId]:f.good}),probe:async(s)=>{if(s===process.env.STAGE)process.kill(process.pid,'SIGKILL');}});`;
    const child = spawnSync(process.execPath, ["--input-type=module", "-e", worker], { cwd: ROOT, env: { ...process.env, STORE: directory, STAGE: stage }, encoding: "utf8" });
    assert.equal(child.signal, "SIGKILL", child.stderr);
    await assert.rejects(runOffline(config(directory)), /writer_lock_held/);
    // Test-only recovery: child is confirmed dead. Never automatically unlink a
    // production writer lock or infer that an absent receipt means no charge.
    await rm(path.join(directory, "writer.lock"));
    let calls = 0; const options = config(directory); options.adapter = offlineFixtureAdapter({ [source]: fixtures.good }, { onInvoke: () => { calls += 1; } });
    if (["after_reservation", "after_adapter", "after_raw"].includes(stage)) {
      await assert.rejects(runOffline(options), /charge_unknown/); assert.equal((await read(path.join(directory, "budget.json"))).requests[0].state, "charge_unknown");
    } else {
      const resumed = await runOffline(options); assert.equal(resultOf(resumed).status, "PASS"); assert.equal(resumed.incurredMicroUsd, 21);
      const again = await runOffline(options); assert.deepEqual(again, resumed); assert.equal((await read(path.join(directory, "budget.json"))).requests.length, 1);
    }
    assert.equal(calls, 0);
  }));
}

test("provider adapter, unbudgeted run and changed execution contract are rejected", () => temporary(async (directory) => {
  await assert.rejects(runOffline({ ...config(directory), adapter: { kind: "provider", evaluate() { throw new Error("must not run"); } } }), /not_implemented/);
  await assert.rejects(runOffline({ ...config(directory), budgetLimitMicroUsd: undefined }), /invalid_budget/);
  await runOffline(config(directory));
  await assert.rejects(runOffline({ ...config(directory), limits: { maxInputTokens: 101, maxOutputTokens: 100 } }), /execution_contract_mismatch/);
}));

function collectionInputAndResponse(item, scope = "unit") {
  const input = clone(fixtures.input); input.subject = { ...input.subject, scope, questionId: "", interactionType: "none" };
  input.payload = { currentItemKeys: [{ itemId: source, cacheKey: item.cacheKey }], boundedEvidence: "Read durable current item evidence; no opaque-score shortcut." };
  input.fingerprints.evidence = sha256(input.payload);
  const response = clone(fixtures.good); const assessment = response.assessments[0];
  assessment.dimensions = contract.rubric.dimensions[scope].map(({ id }) => ({ ...clone(fixtures.good.assessments[0].dimensions[0]), id }));
  assessment.children = [{ itemId: source, cacheKey: item.cacheKey, status: item.status, score: item.score, rawArtifactSha256: item.rawArtifactSha256 }];
  assessment.coverage = { mappings: [{ itemId: source, decisionIds: ["d1"], evidence: clone(item.dimensions[0].evidence), sourceRefs: ["source:fixture"], objectiveRefs: ["objective:fixture"] }], gaps: [] };
  return { input, response };
}
for (const scope of ["unit", "set"]) test(`${scope} PASS requires current raw-backed item evidence and objective/decision/source coverage`, () => temporary(async (directory) => {
  const item = resultOf(await runOffline(config(directory))); const { input, response } = collectionInputAndResponse(item, scope);
  let evidence = [item];
  if (scope === "unit") {
    const set = collectionInputAndResponse(item, "set");
    evidence.push(resultOf(await runOffline({ ...config(directory, set.response, set.input), runId: "set-prerequisite", childEvidence: [item] })));
  }
  const report = await runOffline({ ...config(directory, response, input), runId: scope, childEvidence: evidence });
  assert.equal(resultOf(report).status, "PASS"); assert.equal(resultOf(report).score, .97);
}));
const coverageGaps = [
  ["missing mapping", (i, r) => { r.assessments[0].coverage.mappings = []; }],
  ["uncovered decision", (i) => { i.requiredDecisions.push({ id: "d2", sourceRefs: ["source:fixture"], objectiveRefs: ["objective:fixture"] }); }],
  ["missing child", (i, r) => { r.assessments[0].children = []; }],
  ["opaque item ID only", (i, r) => { r.assessments[0].coverage.mappings[0].evidence = [source]; }],
  ["fabricated source", (i, r) => { r.assessments[0].coverage.mappings[0].sourceRefs = ["source:unread"]; }],
  ["stale child binding", (i) => { i.payload.currentItemKeys[0].cacheKey = sha256("old-question"); i.fingerprints.evidence = sha256(i.payload); }],
  ["coverage gap", (i, r) => { r.assessments[0].coverage.gaps = ["A declared decision remains uncovered."]; }],
  ["unresolved source", (i) => { i.sourceResolutionComplete = false; }]
];
for (const [label, change] of coverageGaps) test(`collection remains INSUFFICIENT_EVIDENCE with ${label}`, () => temporary(async (directory) => {
  const item = resultOf(await runOffline(config(directory))); const { input, response } = collectionInputAndResponse(item); change(input, response);
  const report = await runOffline({ ...config(directory, response, input), runId: "collection", childEvidence: [item] });
  assert.equal(resultOf(report).status, "INSUFFICIENT_EVIDENCE");
}));
test("child FAIL is preserved by collection minimum and cannot be averaged away", () => temporary(async (directory) => {
  const item = resultOf(await runOffline(config(directory, fixtures.hardFail))); const { input, response } = collectionInputAndResponse(item);
  const report = await runOffline({ ...config(directory, response, input), runId: "collection", childEvidence: [item] });
  assert.equal(resultOf(report).status, "FAIL"); assert.equal(resultOf(report).score, .1);
}));
test("opaque or tampered external child result cannot supply coverage", () => temporary(async (directory) => {
  const item = resultOf(await runOffline(config(directory))); const { input, response } = collectionInputAndResponse(item); const tampered = clone(item); tampered.score = 1;
  await assert.rejects(runOffline({ ...config(directory, response, input), runId: "collection", childEvidence: [tampered] }), /normalization_mismatch/);
}));

test("real Claude track shares received identities, deterministic controls and separate 120/node remediation", { timeout: 30_000 }, async () => {
  const auditBefore = await readFile(path.join(ROOT, "config/current-content-audit-state.json"));
  const inventoryBefore = await readFile(path.join(ROOT, "reports/model-evaluation/09-a-inventory.json"));
  const prepared = await prepareTrack({ trackId: "claude-certified-architect-professional-certification" });
  assert.equal(prepared.units.length, 53); assert.equal(prepared.units.flatMap((u) => u.questions).length, 982);
  assert.equal(prepared.structuralValidation.status, "PASS"); assert.equal(prepared.structuralValidation.questions, 982);
  const counts = chapterMinimumReport(prepared, contract); assert.equal(counts.length, 7);
  assert.deepEqual(counts.filter((row) => row.deficit).map((row) => [row.nodeId, row.deficit, row.recommendation]), [["model_prompt_and_context_decisions", 4, "FCA_EDIT"], ["team_workflows_and_operational_enablement", 18, "FCA_EDIT"]]);
  assert.ok(counts.every((row) => row.qualityScore === null));
  const unit = prepared.units[0]; const question = unit.questions[0];
  const task = createTask({ prepared, nodeId: unit.nodeId, mentalUnitId: unit.mentalUnitId, questionId: question.questionId, scope: "item" });
  assert.equal(task.fingerprints.item, sha256(question)); assert.match(task.auditRef.pointer, /^\/unitCoverage\/\d+$/u);
  assert.equal(requiredDimensions(task, contract).length, 11);
  assert.equal("currentReviews" in task.payload, false); assert.equal("verdict" in task.payload, false);
  const key = cacheKey(task, contract);
  const otherUnit = prepared.units.find((row) => row.nodeId === unit.nodeId && row.mentalUnitId !== unit.mentalUnitId);
  const unrelated = clone(prepared); unrelated.units.find((row) => row.mentalUnitId === otherUnit.mentalUnitId).questions[0].prompt += " Synthetic unrelated edit.";
  const unchanged = createTask({ prepared: unrelated, nodeId: unit.nodeId, mentalUnitId: unit.mentalUnitId, questionId: question.questionId, scope: "item" });
  assert.equal(cacheKey(unchanged, contract), key);
  const collection = createTask({ prepared, nodeId: unit.nodeId, mentalUnitId: unit.mentalUnitId, scope: "set", contract });
  const changedCollection = createTask({ prepared: unrelated, nodeId: unit.nodeId, mentalUnitId: unit.mentalUnitId, scope: "set", contract });
  assert.notEqual(cacheKey(collection, contract), cacheKey(changedCollection, contract));
  const addition = clone(prepared); const added = clone(question); added.questionId = "synthetic-new-item"; addition.units[0].questions.push(added);
  assert.equal(cacheKey(createTask({ prepared: addition, nodeId: unit.nodeId, mentalUnitId: unit.mentalUnitId, questionId: question.questionId, scope: "item" }), contract), key);
  const relevant = clone(prepared); relevant.units[0].projected.reviewContext.sourceSha256 = sha256("changed-source");
  assert.notEqual(cacheKey(createTask({ prepared: relevant, nodeId: unit.nodeId, mentalUnitId: unit.mentalUnitId, questionId: question.questionId, scope: "item" }), contract), key);
  const peers = clone(prepared); peers.units[0].questions[0].questionRelation = { counterpartQuestionId: peers.units[0].questions[1].questionId };
  const peerTask = createTask({ prepared: peers, nodeId: unit.nodeId, mentalUnitId: unit.mentalUnitId, questionId: question.questionId, scope: "item" });
  peers.units[0].questions[1].prompt += " Synthetic related edit.";
  assert.notEqual(cacheKey(createTask({ prepared: peers, nodeId: unit.nodeId, mentalUnitId: unit.mentalUnitId, questionId: question.questionId, scope: "item" }), contract), cacheKey(peerTask, contract));
  assert.deepEqual(await readFile(path.join(ROOT, "config/current-content-audit-state.json")), auditBefore);
  assert.deepEqual(await readFile(path.join(ROOT, "reports/model-evaluation/09-a-inventory.json")), inventoryBefore);
});

test("judge delta exactly 0.03 is permitted; greater delta disagrees", () => temporary(async (directory) => {
  const response = clone(fixtures.good); const other = clone(response.assessments[0]); other.judgeId = "synthetic-role-b";
  other.dimensions[0].score = .94; response.assessments.push(other);
  assert.equal(resultOf(await runOffline(config(directory, response))).status, "PASS");
}));
test("canonical question/schema binding fails before adapter for malformed input", () => temporary(async (directory) => {
  const input = clone(fixtures.input); input.payload.question.answer.optionId = "absent";
  input.fingerprints.item = sha256(input.payload.question); input.fingerprints.evidence = sha256(input.payload);
  let calls = 0; const options = config(directory, fixtures.good, input); options.adapter = offlineFixtureAdapter({ [source]: fixtures.good }, { onInvoke: () => { calls += 1; } });
  await assert.rejects(runOffline(options)); assert.equal(calls, 0);
}));

test("unit cannot PASS without independent current set assessment", () => temporary(async (directory) => {
  const item = resultOf(await runOffline(config(directory))); const { input, response } = collectionInputAndResponse(item);
  const report = await runOffline({ ...config(directory, response, input), runId: "unit", childEvidence: [item] });
  assert.equal(resultOf(report).status, "INSUFFICIENT_EVIDENCE"); assert.equal(resultOf(report).setEvidence.status, "INSUFFICIENT_EVIDENCE");
}));
test("unit preserves set FAIL and minimum score despite perfect partition/items", () => temporary(async (directory) => {
  const item = resultOf(await runOffline(config(directory))); const set = collectionInputAndResponse(item, "set");
  set.response.assessments[0].dimensions[0].score = .4;
  const setResult = resultOf(await runOffline({ ...config(directory, set.response, set.input), runId: "set", childEvidence: [item] }));
  const unit = collectionInputAndResponse(item);
  const unitResult = resultOf(await runOffline({ ...config(directory, unit.response, unit.input), runId: "unit", childEvidence: [item, setResult] }));
  assert.equal(unitResult.status, "FAIL"); assert.equal(unitResult.score, .4); assert.equal(unitResult.setEvidence.rawArtifactSha256, setResult.rawArtifactSha256);
}));

// Independent QA regressions: three-judge extrema, version-only reuse,
// attributable evidence/references, and mutable-accounting corruption.
test("three judges compare true max-min range rather than only the first judge", () => temporary(async (directory) => {
  const response = clone(fixtures.good);
  response.assessments[0].dimensions[0].score = .96;
  for (const [judgeId, score] of [["synthetic-role-b", .94], ["synthetic-role-c", .98]]) {
    const assessment = clone(response.assessments[0]); assessment.judgeId = judgeId; assessment.dimensions[0].score = score; response.assessments.push(assessment);
  }
  const result = resultOf(await runOffline(config(directory, response)));
  assert.equal(result.status, "DISAGREEMENT"); assert.ok(result.blockers.includes("DISAGREEMENT"));
}));
test("contentVersion-only change retains item cache identity and preserves origin provenance", () => temporary(async (directory) => {
  const first = await runOffline(config(directory)); const input = clone(fixtures.input); input.subject.contentVersion = "fixture-v2";
  assert.equal(cacheKey(input, contract), cacheKey(fixtures.input, contract));
  let calls = 0; const options = { ...config(directory, fixtures.good, input), runId: "version-only" };
  options.adapter = offlineFixtureAdapter({ [source]: fixtures.good }, { onInvoke: () => { calls += 1; } });
  const reused = await runOffline(options); assert.equal(calls, 0); assert.equal(reused.incurredMicroUsd, 0);
  assert.equal(resultOf(reused).input.subject.contentVersion, resultOf(first).input.subject.contentVersion);
  const manifest = await read(path.join(directory, "runs", "version-only", "manifest.json"));
  assert.equal(manifest.inputs[0].subject.contentVersion, "fixture-v2");
}));
for (const [field, value] of [["sourceRefs", "source:invented"], ["objectiveRefs", "objective:invented"], ["evidence", "Invented mechanism absent from every relevant input."]]) {
  test(`unbound item ${field} cannot PASS despite high scores`, () => temporary(async (directory) => {
    const response = clone(fixtures.good); response.assessments[0].dimensions[0][field] = [value];
    const result = resultOf(await runOffline(config(directory, response)));
    assert.equal(result.status, "INSUFFICIENT_EVIDENCE");
  }));
}
test("normalized item evidence records exact input pointers, not a fact-check claim", () => temporary(async (directory) => {
  const result = resultOf(await runOffline(config(directory))); const binding = result.evidenceBindings[0];
  assert.deepEqual(binding.evidence, [{ value: fixtures.input.payload.question.feedback.reason, pointer: "/payload/question/feedback/reason" }]);
  assert.deepEqual(binding.sources, [{ value: "source:fixture", pointer: "/payload/question/sourceRefs/0" }]);
  assert.deepEqual(binding.objectives, [{ value: "objective:fixture", pointer: "/payload/unitMetadata/0/id" }]);
}));
for (const corruption of ["zero-settled-cost", "remove-ledger-row", "remove-ledger", "remove-receipt", "alter-receipt-cost", "alter-reservation", "zero-checkpoint-cost", "flip-checkpoint-cacheHit"]) {
  test(`accounting corruption ${corruption} fails closed before another invocation`, () => temporary(async (directory) => {
    let calls = 0; const options = { ...config(directory), budgetLimitMicroUsd: 301 };
    options.adapter = offlineFixtureAdapter({ [source]: fixtures.good }, { onInvoke: () => { calls += 1; } });
    await runOffline(options);
    const ledgerFile = path.join(directory, "budget.json"); const ledger = await read(ledgerFile); const row = ledger.requests[0];
    if (corruption === "zero-settled-cost") { row.costMicroUsd = 0; await writeFile(ledgerFile, JSON.stringify(ledger)); }
    if (corruption === "remove-ledger-row") { ledger.requests = []; await writeFile(ledgerFile, JSON.stringify(ledger)); }
    if (corruption === "remove-ledger") await rm(ledgerFile);
    if (corruption === "remove-receipt") await rm(path.join(directory, "requests", `${row.requestId}.json`));
    if (corruption === "alter-receipt-cost") { const file = path.join(directory, "requests", `${row.requestId}.json`); const receipt = await read(file); receipt.costMicroUsd = 0; await writeFile(file, JSON.stringify(receipt)); }
    if (corruption === "alter-reservation") { const file = path.join(directory, "reservations", `${row.requestId}.json`); const reservation = await read(file); reservation.reservedMicroUsd = 0; await writeFile(file, JSON.stringify(reservation)); }
    const isCheckpoint = corruption.includes("checkpoint");
    if (isCheckpoint) {
      const file = path.join(directory, "runs", "first", "checkpoint.json"); const checkpoint = await read(file); const entry = Object.values(checkpoint.completed)[0];
      if (corruption === "zero-checkpoint-cost") entry.incurredMicroUsd = 0; else entry.cacheHit = true;
      await writeFile(file, JSON.stringify(checkpoint));
    }
    const input = clone(fixtures.input); input.payload.question.prompt += " A distinct valid request.";
    input.fingerprints.item = sha256(input.payload.question); input.fingerprints.evidence = sha256(input.payload);
    const next = isCheckpoint ? options : { ...options, inputs: [input], runId: "second" };
    await assert.rejects(runOffline(next)); assert.equal(calls, 1);
  }));
}

test("owner-approved semantics are explicit in contract, run manifest and report without a provider/content grant", () => temporary(async (directory) => {
  assert.equal(contract.rubric.version, "09-b-approved-2026-10-23-v1");
  assert.deepEqual(contract.rubric.thresholds, { minimumScore: .9, nearThresholdInclusive: [.87, .93], minimumConfidence: .8, maximumJudgeDelta: .03 });
  assert.equal(contract.rubric.approvalDecision.actor, "Product Owner"); assert.equal(contract.rubric.approvalDecision.date, "2026-10-23");
  assert.equal(contract.rubric.approvalDecision.declaration, "Zatwierdzam pakiet semantyki 32");
  assert.equal(contract.rubric.approvalDecision.scope, "evaluation_semantics_only");
  assert.equal(contract.rubric.approvalDecision.supersedesCandidateVersion, "09-b-candidate-2026-10-23-v1");
  const report = await runOffline(config(directory));
  const manifest = await read(path.join(directory, "runs", "first", "manifest.json"));
  assert.equal(manifest.phaseStatus, "APPROVED"); assert.equal(report.phaseStatus, "APPROVED");
  assert.equal(manifest.rubricVersion, contract.rubric.version); assert.equal(manifest.publication, "NOT_GRANTED");
  assert.equal(report.providerCalls, 0); assert.equal(report.sdkCompatibility, "NOT_TESTED"); assert.equal(report.goldSet, "NOT_ACCEPTED");
  assert.equal(report.accountingBasis, "SIMULATED_OFFLINE");
}));
