import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { buildTrackPlan, loadAuthoringModel } from "../authoring/lib/model.mjs";
import { validateManualBatch } from "../authoring/lib/contracts.mjs";

const ROOT = process.cwd();
const GCP_SOURCE_ROOT = join(ROOT, "manual/source/google-cloud-associate-cloud-engineer");
const HISTORICAL_RELEASE = join(ROOT, "artifacts/releases/patternly-core-0018/release.json");
const stopWords = new Set("a an and are as at be by can cloud does for from has how in is it may must not of on or option that the this to use which with you your".split(" "));

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (entry.isFile() && entry.name.endsWith(".json")) files.push(path);
  }
  return files;
}

function normalizedPrompt(value) {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

function meaningfulTokens(value) {
  return new Set(normalizedPrompt(value).split(" ").filter((token) => token.length > 2 && !stopWords.has(token)));
}

function searchableText(item, historical = false) {
  const prompt = historical ? item.question : item.prompt;
  const options = historical ? item.options : item.interaction?.options;
  const feedback = item.feedback ?? {};
  const details = historical ? feedback.details?.blocks?.map((block) => block.text) : Object.values(feedback.Details ?? {});
  return [prompt, ...(options ?? []).map((option) => option.text), feedback.reason ?? feedback.Reason, ...(details ?? [])].filter(Boolean).join(" ");
}

function semanticSignatures(value) {
  const text = normalizedPrompt(value);
  const signatures = new Set();
  if (/(cloud run|container)/.test(text) && /(session|cache)/.test(text) && /(instance|filesystem|memory|sticky)/.test(text)) signatures.add("cloud-run-session-local-state");
  if (/(cloud run|container)/.test(text) && /(report|artifact|object|download)/.test(text) && /(later request|different instance|scale)/.test(text)) signatures.add("cloud-run-artifact-cross-request");
  return signatures;
}

function decisionFingerprint(slot) {
  const raw = slot?.raw ?? slot ?? {};
  return normalizedPrompt([
    raw.learningOperation,
    ...(raw.materialEvidenceOrConstraintChanged ?? []),
    raw.expectedOutcome?.resolution,
    raw.decisiveBoundary,
    raw.errorModelOrFailureMode,
    raw.transferBoundary
  ].filter(Boolean).join(" "));
}

function jaccard(left, right) {
  const intersection = [...left].filter((token) => right.has(token)).length;
  const union = new Set([...left, ...right]).size;
  return union === 0 ? 0 : intersection / union;
}

function issue(list, code, message, context = {}) {
  list.push({ code, message, ...context });
}

async function readHistoricalItems(errors) {
  try {
    const release = JSON.parse(await readFile(HISTORICAL_RELEASE, "utf8"));
    const artifact = (release.artifacts ?? []).map((entry) => JSON.parse(entry.artifactBytes)).find((entry) => entry.bank?.trackId === "google-cloud-associate-cloud-engineer");
    if (!artifact?.bank?.items) throw new Error("GCP historical bank is missing from the immutable release.");
    return artifact.bank.items;
  } catch (error) {
    issue(errors, "MISSING_HISTORICAL_BASELINE", error.message, { path: relative(ROOT, HISTORICAL_RELEASE) });
    return [];
  }
}

async function main() {
  const errors = [];
  const warnings = [];
  const requestedBatch = process.argv.includes("--batch") ? process.argv[process.argv.indexOf("--batch") + 1] : null;
  const sourceFiles = requestedBatch ? [join(ROOT, requestedBatch)] : await walk(GCP_SOURCE_ROOT);
  const batches = [];
  for (const path of sourceFiles) {
    try {
      batches.push({ path, batch: JSON.parse(await readFile(path, "utf8")) });
    } catch (error) {
      issue(errors, "INVALID_JSON", error.message, { path: relative(ROOT, path) });
    }
  }

  const historicalItems = await readHistoricalItems(errors);
  const model = await loadAuthoringModel(ROOT);
  const gcpTrack = model.curricula.get("google-cloud-associate-cloud-engineer");
  const gcpPlan = await buildTrackPlan(ROOT, gcpTrack, model);
  const manifestResult = { model, manifest: { tracks: [gcpPlan] } };
  const slotsById = new Map(gcpPlan.slots.map((slot) => [slot.slotId, slot]));
  const rawSlotsById = new Map(gcpTrack.normalized.slots.map((slot) => [slot.slotId, slot]));
  const sourceRecordsById = new Map((gcpTrack.sourceRecords ?? []).map((record) => [record.sourceId, record]));
  const batchIds = new Map();
  const itemIds = new Map();
  const promptOwners = new Map();
  const newPrompts = [];

  for (const { path, batch } of batches) {
    const displayPath = relative(ROOT, path);
    if (batchIds.has(batch.batchId)) issue(errors, "DUPLICATE_BATCH_ID", `Batch ID ${batch.batchId} is reused.`, { batchId: batch.batchId, paths: [batchIds.get(batch.batchId), displayPath] });
    else batchIds.set(batch.batchId, displayPath);
    try {
      await validateManualBatch(ROOT, batch, { manifestResult, actualPath: displayPath });
    } catch (error) {
      issue(errors, error.code ?? "AUTHORING_CONTRACT", error.message, { path: displayPath, batchId: batch.batchId });
    }
    for (const item of batch.items ?? []) {
      if (itemIds.has(item.itemId)) issue(errors, "DUPLICATE_ITEM_ID", `Item ID ${item.itemId} is reused.`, { itemId: item.itemId, paths: [itemIds.get(item.itemId), displayPath] });
      else itemIds.set(item.itemId, displayPath);
      const promptKey = normalizedPrompt(item.prompt ?? "");
      if (promptOwners.has(promptKey)) issue(errors, "DUPLICATE_PROMPT", `Prompt is duplicated by ${item.itemId}.`, { itemId: item.itemId, path: displayPath, other: promptOwners.get(promptKey) });
      else promptOwners.set(promptKey, { itemId: item.itemId, path: displayPath });
      if ((item.constraints ?? []).length < 2) issue(warnings, "THIN_CONSTRAINTS", `${item.itemId} has fewer than two explicit constraints.`, { itemId: item.itemId, path: displayPath });
      const slot = slotsById.get(item.slotId);
      const rawSlot = rawSlotsById.get(item.slotId);
      if (slot) {
        const directSourceRefs = (rawSlot?.sourceRequirements?.directFirstPartyDocumentation ?? []).flatMap((entry) => entry.sourceRefs ?? []);
        const authoritativeAnchors = new Set(directSourceRefs.flatMap((sourceRef) => sourceRecordsById.get(sourceRef)?.authoritativeFor ?? []));
        const missingAnchors = (item.sourceBinding?.anchorIds ?? []).filter((anchorId) => !authoritativeAnchors.has(anchorId));
        if (missingAnchors.length) issue(errors, "ANCHOR_SOURCE_MISMATCH", `${item.itemId} uses anchor IDs not declared authoritative by its direct source records.`, { itemId: item.itemId, path: displayPath, sourceRefs: directSourceRefs, missingAnchors });
        const boundSourceUrls = [...new Set((item.sourceBinding?.sourceRefs ?? []).map((sourceRef) => sourceRecordsById.get(sourceRef)?.url).filter(Boolean))];
        const detailsUrl = item.feedback?.Details?.url;
        if (!boundSourceUrls.includes(detailsUrl)) issue(errors, "FEEDBACK_URL_MISMATCH", `${item.itemId} Details.url must equal the URL of one of its bound official source records.`, { itemId: item.itemId, path: displayPath, detailsUrl, boundSourceUrls });
      }
      const searchText = searchableText(item);
      newPrompts.push({ item, path: displayPath, searchText, tokens: meaningfulTokens(searchText), signatures: semanticSignatures(item.prompt ?? ""), decisionFingerprint: decisionFingerprint(rawSlot) });
    }
  }

  const historicalPromptOwners = new Map(historicalItems.map((item) => [normalizedPrompt(item.question ?? ""), item.id]));
  const semanticDuplicatePairs = [];
  const semanticSignaturePairs = [];
  const newSemanticDuplicatePairs = [];
  const decisionFingerprintPairs = [];
  for (let leftIndex = 0; leftIndex < newPrompts.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < newPrompts.length; rightIndex += 1) {
      const left = newPrompts[leftIndex];
      const right = newPrompts[rightIndex];
      const score = jaccard(left.tokens, right.tokens);
      if (score >= 0.78) newSemanticDuplicatePairs.push({ itemId: left.item.itemId, otherItemId: right.item.itemId, score: Number(score.toFixed(3)), paths: [left.path, right.path] });
      if (left.decisionFingerprint && left.decisionFingerprint === right.decisionFingerprint) decisionFingerprintPairs.push({ itemId: left.item.itemId, otherItemId: right.item.itemId, paths: [left.path, right.path] });
    }
  }
  for (const entry of newPrompts) {
    const exactHistoricalId = historicalPromptOwners.get(normalizedPrompt(entry.item.prompt ?? ""));
    if (exactHistoricalId) issue(errors, "HISTORICAL_PROMPT_DUPLICATE", `${entry.item.itemId} duplicates historical prompt ${exactHistoricalId}.`, { itemId: entry.item.itemId, historicalItemId: exactHistoricalId });
    for (const historical of historicalItems) {
      const historicalText = searchableText(historical, true);
      const score = jaccard(entry.tokens, meaningfulTokens(historicalText));
      if (score >= 0.78) semanticDuplicatePairs.push({ itemId: entry.item.itemId, historicalItemId: historical.id, score: Number(score.toFixed(3)), path: entry.path });
      const sharedSignatures = [...entry.signatures].filter((signature) => semanticSignatures(historical.question ?? "").has(signature));
      for (const signature of sharedSignatures) semanticSignaturePairs.push({ itemId: entry.item.itemId, historicalItemId: historical.id, signature, path: entry.path });
    }
  }
  if (semanticDuplicatePairs.length) issue(errors, "SEMANTIC_DUPLICATE_CANDIDATE", "A new prompt is too close to an existing historical GCP prompt; review and rewrite before admission.", { pairs: semanticDuplicatePairs });
  if (semanticSignaturePairs.length) issue(errors, "SEMANTIC_SIGNATURE_DUPLICATE", "A new item shares a decision-level semantic signature with an existing historical GCP item; author a new edge case before admission.", { pairs: semanticSignaturePairs });
  if (newSemanticDuplicatePairs.length) issue(errors, "NEW_SEMANTIC_DUPLICATE_CANDIDATE", "Two new GCP prompts are too close to each other; keep one decision per mental unit.", { pairs: newSemanticDuplicatePairs });
  if (decisionFingerprintPairs.length) issue(errors, "DECISION_FINGERPRINT_DUPLICATE", "Two new GCP items resolve to the same canonical decision fingerprint.", { pairs: decisionFingerprintPairs });

  const result = {
    schemaVersion: "gcp-authoring-audit-v1",
    status: errors.length ? "FAIL" : "PASS",
    sourceFiles: sourceFiles.map((path) => relative(ROOT, path)),
    batchCount: batches.length,
    itemCount: newPrompts.length,
    nodeSummary: Object.values(batches.reduce((summary, { batch, path }) => {
      const key = `${batch.nodeId ?? "unknown"}:${batch.learningBlockId ?? "unknown"}`;
      const entry = summary[key] ?? { nodeId: batch.nodeId ?? null, learningBlockId: batch.learningBlockId ?? null, sourceFiles: [], batchCount: 0, declaredSlotCount: 0, itemCount: 0 };
      entry.sourceFiles.push(relative(ROOT, path));
      entry.batchCount += 1;
      entry.declaredSlotCount += (batch.slotIds ?? []).length;
      entry.itemCount += (batch.items ?? []).length;
      summary[key] = entry;
      return summary;
    }, {})).sort((left, right) => `${left.nodeId}:${left.learningBlockId}`.localeCompare(`${right.nodeId}:${right.learningBlockId}`)),
    historicalItemCount: historicalItems.length,
    checks: {
      batchIdsUnique: !errors.some((entry) => entry.code === "DUPLICATE_BATCH_ID"),
      itemIdsUnique: !errors.some((entry) => entry.code === "DUPLICATE_ITEM_ID"),
      promptsUniqueAgainstHistoricalBank: !errors.some((entry) => ["DUPLICATE_PROMPT", "HISTORICAL_PROMPT_DUPLICATE", "SEMANTIC_DUPLICATE_CANDIDATE", "SEMANTIC_SIGNATURE_DUPLICATE"].includes(entry.code)),
      authoringContractsValid: !errors.some((entry) => entry.code === "AUTHORING_CONTRACT" || entry.code === "SOURCE_BLOCKED" || entry.code === "INVALID_CONTRACT"),
      feedbackAndModeContractsValid: !errors.some((entry) => ["INCOMPLETE_FEEDBACK", "INCOMPLETE_DETAILS", "MODE_DRIFT", "INVALID_SCORING", "INTERACTION_DRIFT", "FEEDBACK_URL_MISMATCH"].includes(entry.code))
    },
    semanticDuplicatePairs,
    semanticSignaturePairs,
    newSemanticDuplicatePairs,
    decisionFingerprintPairs,
    warnings,
    errors
  };
  console.log(JSON.stringify(result, null, 2));
  if (errors.length) process.exitCode = 1;
}

await main();
