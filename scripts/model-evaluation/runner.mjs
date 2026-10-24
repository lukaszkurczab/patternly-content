import { mkdir, open, readFile, readdir, rename, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { canonicalJson, sha256 } from "../build.mjs";
import { loadContract, validateInput, cacheKey, normalizeResponse, validateResult, integer, fail } from "./contract.mjs";

const text = (value) => `${canonicalJson(value)}\n`;
const equals = (left, right) => canonicalJson(left) === canonicalJson(right);
function identifier(value) { if (typeof value !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/u.test(value)) fail("invalid_store_identifier"); return value; }
async function readJson(file, absent = null) {
  try { return JSON.parse(await readFile(file, "utf8")); }
  catch (error) { if (error.code === "ENOENT") return absent; fail("corrupt_store_record"); }
}
async function syncDirectory(directory) { const handle = await open(directory, "r"); try { await handle.sync(); } finally { await handle.close(); } }
async function durableWrite(file, value, { immutable = false } = {}) {
  const bytes = text(value); await mkdir(path.dirname(file), { recursive: true });
  if (immutable) {
    let handle;
    try { handle = await open(file, "wx", 0o600); }
    catch (error) { if (error.code !== "EEXIST") throw error; if (await readFile(file, "utf8") !== bytes) fail("immutable_record_mismatch"); return; }
    try { await handle.writeFile(bytes); await handle.sync(); } finally { await handle.close(); }
    await syncDirectory(path.dirname(file)); return;
  }
  const temporary = `${file}.${randomUUID()}.tmp`;
  const handle = await open(temporary, "wx", 0o600);
  try { await handle.writeFile(bytes); await handle.sync(); } finally { await handle.close(); }
  await rename(temporary, file); await syncDirectory(path.dirname(file));
}
function limitsAndReservation(limits, pricing) {
  for (const [name, value] of Object.entries(limits)) integer(value, name);
  for (const [name, value] of Object.entries(pricing)) integer(value, name);
  if (!equals(Object.keys(limits).sort(), ["maxInputTokens", "maxOutputTokens"]) || !equals(Object.keys(pricing).sort(), ["inputMicroUsdPerToken", "outputMicroUsdPerToken", "requestFeeMicroUsd"])) fail("invalid_pricing_contract");
  return integer(limits.maxInputTokens * pricing.inputMicroUsdPerToken + limits.maxOutputTokens * pricing.outputMicroUsdPerToken + pricing.requestFeeMicroUsd, "reservation");
}
function actualCost(response, limits, pricing) {
  if (response.usage.inputTokens > limits.maxInputTokens || response.usage.outputTokens > limits.maxOutputTokens) fail("usage_exceeds_reserved_cap");
  const cost = integer(response.usage.inputTokens * pricing.inputMicroUsdPerToken + response.usage.outputTokens * pricing.outputMicroUsdPerToken + pricing.requestFeeMicroUsd, "actual_cost");
  if (response.costMicroUsd !== cost) fail("usage_cost_mismatch"); return cost;
}
function verifyLedgerShape(ledger, budget) {
  if (!ledger || ledger.schemaVersion !== "patternly-evaluation-budget-v1" || !equals(ledger.budget, budget) || !Array.isArray(ledger.requests)) fail("budget_contract_mismatch");
  const ids = new Set();
  for (const row of ledger.requests) {
    if (ids.has(row.requestId) || !["reserved", "charge_unknown", "settled"].includes(row.state)) fail("corrupt_budget_ledger"); ids.add(row.requestId);
    integer(row.reservedMicroUsd, "reservation"); integer(row.costMicroUsd, "cost");
    if (row.state === "settled" && row.costMicroUsd > row.reservedMicroUsd) fail("cost_exceeds_reservation");
  }
  const committed = ledger.requests.reduce((sum, row) => integer(sum + (row.state === "settled" ? row.costMicroUsd : row.reservedMicroUsd), "committed_cost"), 0);
  if (committed > budget.limitMicroUsd) fail("budget_exhausted"); return committed;
}
function artifactFile(storeDirectory, relative) {
  if (!/^raw\/[a-f0-9]{64}\.json$/u.test(relative)) fail("invalid_raw_artifact_path");
  return path.join(storeDirectory, relative);
}
async function recordsIn(directory) {
  try { return (await readdir(directory)).filter((file) => file.endsWith(".json")).sort(); }
  catch (error) { if (error.code === "ENOENT") return []; throw error; }
}
async function verifyLedger(ledger, budget, storeDirectory) {
  verifyLedgerShape(ledger, budget);
  const reservations = await recordsIn(path.join(storeDirectory, "reservations"));
  const receipts = await recordsIn(path.join(storeDirectory, "requests"));
  if (!equals(reservations, ledger.requests.map((row) => `${identifier(row.requestId)}.json`).sort())
    || receipts.some((file) => !reservations.includes(file))) fail("budget_reservation_inventory_mismatch");
  let committed = 0;
  for (const row of ledger.requests) {
    const reservation = await readJson(path.join(storeDirectory, "reservations", `${row.requestId}.json`));
    const manifest = await readJson(path.join(storeDirectory, "runs", identifier(row.runId), "manifest.json"));
    if (!reservation || !manifest || reservation.requestId !== row.requestId || reservation.runId !== row.runId || reservation.key !== row.key
      || reservation.reservedMicroUsd !== row.reservedMicroUsd || reservation.budgetId !== budget.id
      || reservation.manifestSha256 !== sha256(manifest) || !equals(manifest.budget, budget)
      || reservation.contractSha256 !== manifest.contractSha256 || !equals(reservation.limits, manifest.limits) || !equals(reservation.pricing, manifest.pricing)
      || row.reservedMicroUsd !== limitsAndReservation(reservation.limits, reservation.pricing)) fail("reservation_binding_mismatch");
    const receipt = await readJson(path.join(storeDirectory, "requests", `${row.requestId}.json`));
    let provenCost;
    if (receipt) {
      const result = receipt.result;
      const index = manifest.keys.indexOf(row.key);
      if (receipt.requestId !== row.requestId || receipt.reservationSha256 !== sha256(reservation) || index < 0
        || result.requestId !== row.requestId || result.evaluationRunId !== row.runId || result.cacheKey !== row.key
        || result.contractSha256 !== reservation.contractSha256 || !equals(result.input, manifest.inputs[index])) fail("receipt_binding_mismatch");
      const rawBytes = await readFile(artifactFile(storeDirectory, result.rawArtifactPath));
      if (sha256(rawBytes) !== result.rawArtifactSha256) fail("receipt_raw_hash_mismatch");
      const response = JSON.parse(rawBytes);
      integer(response.usage.inputTokens, "usage"); integer(response.usage.outputTokens, "usage");
      if (response.usage.requestCount !== 1 || !equals(result.usage, response.usage)) fail("receipt_usage_mismatch");
      provenCost = actualCost(response, reservation.limits, reservation.pricing);
      if (receipt.costMicroUsd !== provenCost || result.costMicroUsd !== provenCost) fail("receipt_cost_mismatch");
    }
    if (row.state === "settled" && (provenCost === undefined || row.costMicroUsd !== provenCost)) fail("settled_cost_proof_mismatch");
    if (row.state !== "settled" && row.costMicroUsd !== 0) fail("unsettled_cost_mismatch");
    committed = integer(committed + (row.state === "settled" ? provenCost : reservation.reservedMicroUsd), "committed_cost");
  }
  if (committed > budget.limitMicroUsd) fail("budget_exhausted");
  return committed;
}
function verifyCheckpointCost(completed, key, ledger, runId) {
  const origin = ledger.requests.find((row) => row.key === key && row.state === "settled"
    && (row.requestId === completed.result.requestId || completed.result.requestId === `cache-${key}`));
  if (!origin || completed.incurredMicroUsd !== (origin.runId === runId ? origin.costMicroUsd : 0)
    || completed.cacheHit !== (origin.runId !== runId)) fail("checkpoint_cost_proof_mismatch");
}

async function checkStoredResult(result, input, contract, storeDirectory, childEvidence) {
  const rawBytes = await readFile(artifactFile(storeDirectory, result.rawArtifactPath));
  await validateResult(result, { input: result.input, contract, rawBytes, childEvidence });
  if (cacheKey(input, contract) !== result.cacheKey) fail("cache_key_mismatch");
  return { rawBytes, result };
}

export function offlineFixtureAdapter(responses, { onInvoke } = {}) {
  return { kind: "offline-fixture", async evaluate({ input, requestId, limits }) {
    onInvoke?.({ input, requestId, limits });
    const response = responses[input.subject.questionId || input.subject.scope];
    if (!response) fail("missing_offline_fixture");
    return structuredClone(response);
  } };
}

// This is the only executable adapter boundary in 09-B. A provider implementation,
// provider idempotency and actual billing fidelity remain NOT_IMPLEMENTED.
export async function runOffline({ storeDirectory, runId, budgetId, budgetLimitMicroUsd, inputs, adapter, contract,
  limits = { maxInputTokens: 100, maxOutputTokens: 100 }, pricing = { inputMicroUsdPerToken: 1, outputMicroUsdPerToken: 2, requestFeeMicroUsd: 1 },
  childEvidence = [], probe = async () => {} }) {
  if (adapter?.kind !== "offline-fixture" || typeof adapter.evaluate !== "function" || contract.model.provider !== "offline") fail("provider_adapter_not_implemented");
  identifier(runId); identifier(budgetId); integer(budgetLimitMicroUsd, "budget");
  const reservation = limitsAndReservation(limits, pricing);
  if (!equals(limits, contract.limits) || !equals(pricing, contract.pricing)) fail("execution_contract_mismatch");
  const keys = [];
  for (const input of inputs) { await validateInput(input, contract); keys.push(cacheKey(input, contract)); }
  if (!keys.length || new Set(keys).size !== keys.length || new Set(inputs.map((i) => i.subject.trackId)).size !== 1) fail("invalid_run_scope");
  await mkdir(storeDirectory, { recursive: true });
  const lockPath = path.join(storeDirectory, "writer.lock");
  let lock;
  try { lock = await open(lockPath, "wx", 0o600); }
  catch (error) { if (error.code === "EEXIST") fail("writer_lock_held_inspect_before_recovery"); throw error; }
  try {
    await lock.writeFile(text({ runId, pid: process.pid })); await lock.sync(); await syncDirectory(storeDirectory);
    const budget = { id: budgetId, limitMicroUsd: budgetLimitMicroUsd, currency: "USD", unit: "microUSD", accountingBasis: "SIMULATED_OFFLINE" };
    const ledgerFile = path.join(storeDirectory, "budget.json");
    let ledger = await readJson(ledgerFile);
    if (!ledger) { ledger = { schemaVersion: "patternly-evaluation-budget-v1", budget, requests: [] }; await durableWrite(ledgerFile, ledger); }
    await verifyLedger(ledger, budget, storeDirectory);
    const runDirectory = path.join(storeDirectory, "runs", runId);
    const manifest = { schemaVersion: "patternly-evaluation-manifest-v1", runId, budget, contractSha256: contract.sha256,
      contractFiles: contract.manifest, rubricVersion: contract.rubric.version, promptVersion: contract.prompt.version, model: contract.model,
      phaseStatus: contract.rubric.approval, keys, inputs, limits, pricing, adapter: "offline-fixture", publication: "NOT_GRANTED", providerCalls: 0 };
    await durableWrite(path.join(runDirectory, "manifest.json"), manifest, { immutable: true });
    const checkpointFile = path.join(runDirectory, "checkpoint.json");
    let checkpoint = await readJson(checkpointFile);
    const manifestSha256 = sha256(manifest);
    if (!checkpoint) { checkpoint = { schemaVersion: "patternly-evaluation-checkpoint-v1", manifestSha256, completed: {} }; await durableWrite(checkpointFile, checkpoint); }
    if (checkpoint.schemaVersion !== "patternly-evaluation-checkpoint-v1" || checkpoint.manifestSha256 !== manifestSha256 || !checkpoint.completed || Object.keys(checkpoint.completed).some((key) => !keys.includes(key))) fail("checkpoint_contract_mismatch");
    const allChildren = [...childEvidence];
    // Validate every supplied child against the immutable raw evidence in this
    // store before a unit/set can consume it. External opaque scores cannot pass.
    for (const child of allChildren) await checkStoredResult(child, child.input, contract, storeDirectory, allChildren.filter((entry) => entry.input.subject.scope === "item"));
    const persistCompleted = async (row, result, incurredMicroUsd, cacheHit) => {
      checkpoint.completed[row.key] = { result, incurredMicroUsd, cacheHit };
      await durableWrite(checkpointFile, checkpoint);
      if (result.input.subject.scope !== "unit") allChildren.push(result);
    };
    // A durable receipt allows idempotent cost settlement after an interrupted
    // checkpoint/cache write. Absence of a receipt NEVER licenses another call.
    for (const row of ledger.requests.filter((entry) => entry.state !== "settled")) {
      const receipt = await readJson(path.join(storeDirectory, "requests", `${identifier(row.requestId)}.json`));
      if (!receipt) { row.state = "charge_unknown"; await durableWrite(ledgerFile, ledger); fail("charge_unknown_no_implicit_retry_or_refund"); }
      const taskIndex = keys.indexOf(row.key);
      if (row.runId !== runId || taskIndex < 0 || receipt.requestId !== row.requestId || receipt.result.requestId !== row.requestId) fail("reservation_reconciliation_requires_owning_run");
      await checkStoredResult(receipt.result, inputs[taskIndex], contract, storeDirectory, allChildren);
      const cost = actualCost(JSON.parse(await readFile(artifactFile(storeDirectory, receipt.result.rawArtifactPath))), limits, pricing);
      if (cost !== receipt.costMicroUsd || cost > row.reservedMicroUsd) fail("receipt_cost_mismatch");
      row.state = "settled"; row.costMicroUsd = cost; await durableWrite(ledgerFile, ledger);
      await durableWrite(path.join(storeDirectory, "cache", `${row.key}.json`), receipt.result, { immutable: true });
      await persistCompleted(row, receipt.result, cost, false);
    }
    for (let index = 0; index < inputs.length; index += 1) {
      const input = inputs[index]; const key = keys[index];
      const completed = checkpoint.completed[key];
      if (completed) {
        integer(completed.incurredMicroUsd, "checkpoint_cost");
        verifyCheckpointCost(completed, key, ledger, runId);
        await checkStoredResult(completed.result, input, contract, storeDirectory, allChildren);
        if (completed.result.input.subject.scope !== "unit" && !allChildren.some((r) => r.cacheKey === key)) allChildren.push(completed.result);
        continue;
      }
      const alreadySettled = ledger.requests.find((row) => row.key === key && row.state === "settled");
      if (alreadySettled) {
        const receipt = await readJson(path.join(storeDirectory, "requests", `${identifier(alreadySettled.requestId)}.json`));
        if (!receipt) fail("settled_request_receipt_missing");
        await checkStoredResult(receipt.result, input, contract, storeDirectory, allChildren);
        await durableWrite(path.join(storeDirectory, "cache", `${key}.json`), receipt.result, { immutable: true });
        await persistCompleted(alreadySettled, receipt.result, alreadySettled.runId === runId ? alreadySettled.costMicroUsd : 0, alreadySettled.runId !== runId); continue;
      }
      const cached = await readJson(path.join(storeDirectory, "cache", `${key}.json`));
      if (cached) {
        const { rawBytes } = await checkStoredResult(cached, input, contract, storeDirectory, allChildren);
        const result = await normalizeResponse({ response: JSON.parse(rawBytes), input, contract, evaluationRunId: runId, requestId: `cache-${key}`,
          rawArtifactSha256: cached.rawArtifactSha256, rawArtifactPath: cached.rawArtifactPath, completedAt: cached.completedAt, childEvidence: allChildren });
        await persistCompleted({ key }, result, 0, true); continue;
      }
      // Settled usage + every outstanding worst-case reservation shares this
      // single writer/ledger across all run IDs for the budget.
      const committed = await verifyLedger(ledger, budget, storeDirectory);
      if (committed + reservation > budget.limitMicroUsd) fail("budget_exhausted_before_call");
      const requestId = randomUUID();
      const row = { requestId, runId, key, state: "reserved", reservedMicroUsd: reservation, costMicroUsd: 0 };
      const reservationRecord = { schemaVersion: "patternly-evaluation-reservation-v1", requestId, runId, key, budgetId,
        reservedMicroUsd: reservation, contractSha256: contract.sha256, manifestSha256, limits, pricing };
      await durableWrite(path.join(storeDirectory, "reservations", `${requestId}.json`), reservationRecord, { immutable: true });
      ledger.requests.push(row); await durableWrite(ledgerFile, ledger);
      await probe("after_reservation", { requestId });
      try {
        const response = await adapter.evaluate({ input, requestId, limits });
        await probe("after_adapter", { requestId });
        const rawBytes = text(response); const rawHash = sha256(rawBytes); const rawPath = `raw/${rawHash}.json`;
        await durableWrite(artifactFile(storeDirectory, rawPath), response, { immutable: true });
        await probe("after_raw", { requestId });
        const result = await normalizeResponse({ response, input, contract, evaluationRunId: runId, requestId, rawArtifactSha256: rawHash,
          rawArtifactPath: rawPath, completedAt: new Date().toISOString(), childEvidence: allChildren });
        const cost = actualCost(response, limits, pricing);
        await durableWrite(path.join(storeDirectory, "requests", `${requestId}.json`), { requestId, reservationSha256: sha256(reservationRecord), costMicroUsd: cost, result }, { immutable: true });
        await probe("after_receipt", { requestId });
        row.state = "settled"; row.costMicroUsd = cost; await durableWrite(ledgerFile, ledger);
        await probe("after_settlement", { requestId });
        await durableWrite(path.join(storeDirectory, "cache", `${key}.json`), result, { immutable: true });
        await persistCompleted(row, result, cost, false);
        await probe("after_checkpoint", { requestId });
      } catch (error) {
        // No refund or retry on parsing, timeout, exception or unknown effect.
        if (row.state !== "settled") { row.state = "charge_unknown"; await durableWrite(ledgerFile, ledger); }
        throw error;
      }
    }
    const report = { schemaVersion: "patternly-evaluation-offline-run-v1", runId, phaseStatus: contract.rubric.approval,
      accountingBasis: "SIMULATED_OFFLINE", manifestSha256, completed: checkpoint.completed, incurredMicroUsd: Object.values(checkpoint.completed).reduce((sum, row) => sum + row.incurredMicroUsd, 0),
      providerCalls: 0, sdkCompatibility: "NOT_TESTED", goldSet: "NOT_ACCEPTED" };
    await durableWrite(path.join(runDirectory, "report.json"), report);
    return report;
  } finally { await lock.close(); await rm(lockPath); await syncDirectory(storeDirectory); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 4 || process.argv[2] !== "--fixture-output") fail("usage_node_runner_--fixture-output_private_directory");
  const fixtures = JSON.parse(await readFile(new URL("../../tests/fixtures/model-evaluation/09-b-cases.json", import.meta.url)));
  const contract = await loadContract();
  const report = await runOffline({ storeDirectory: path.resolve(process.argv[3]), runId: "09-b-fixture", budgetId: "offline-fixture", budgetLimitMicroUsd: 1000,
    inputs: [fixtures.input], adapter: offlineFixtureAdapter({ [fixtures.input.subject.questionId]: fixtures.good }), contract });
  process.stdout.write(`${report.phaseStatus} offline_fixture provider_calls=0 simulated_microUSD=${report.incurredMicroUsd}\n`);
}
