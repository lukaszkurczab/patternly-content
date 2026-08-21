import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  canonicalJson,
  readJson,
  repoFiles,
  ROOT,
  sha256,
  validateSchema
} from "../authoring/lib/model.mjs";

const sourceRoot = `manual/source/aws-certified-solutions-architect-associate/`;
const firstParty = /^https:\/\/(docs\.aws\.amazon\.com|aws\.amazon\.com)\//;
const modes = new Set([
  "certification-diagnostic-baseline",
  "certification-focus-practice",
  "certification-scenario-practice",
  "certification-weak-area-review",
  "certification-mixed-practice",
  "certification-quick-review",
  "certification-exam-simulation"
]);

const schema = await readJson(ROOT, "schemas/publishing/certification-manual-source.schema.json");
const paths = (await repoFiles(ROOT, [sourceRoot])).filter((path) => path.endsWith(".json"));
const failures = [];
const identities = new Map();
const batchIds = new Map();
const itemIds = new Map();
const fail = (message) => failures.push(message);
const unique = (values, label, path) => {
  if (new Set(values).size !== values.length) fail(`${path}: ${label} contains duplicates`);
};

for (const path of paths) {
  const batch = JSON.parse(await readFile(resolve(ROOT, path), "utf8"));
  if (batch.taxonomyVersion !== "aws-saa-c03-20-node-v2026.08.15") continue;
  try {
    await validateSchema(batch, schema, path);
  } catch (error) {
    fail(`${path}: schema ${error.message}`);
    continue;
  }
  const workbookBatchId = batch.batchId.startsWith("aws-saa-c03-2026-08-15-AWSSAA-");
  const productFreeBatchId = batch.batchId === "aws-saa-c03-2026-08-15-AWSSAA-FREE-N01-B01" && batch.nodeId === "aws_secure_architecture_foundations" && batch.learningBlockId === "policy_evaluation_and_scope";
  if (!workbookBatchId && !productFreeBatchId) fail(`${path}: unexpected AWS source batchId ${batch.batchId}`);
  const pathParts = path.split("/");
  const sourceStem = pathParts[4]?.replace(/\.json$/, "");
  const canonicalBlockPath = sourceStem === batch.learningBlockId;
  const repeatedBlockPath = new RegExp(`^${batch.learningBlockId}_batch_[2-9][0-9]*$`).test(sourceStem ?? "");
  if (pathParts.length !== 5 || pathParts[3] !== batch.nodeId || (!canonicalBlockPath && !repeatedBlockPath)) fail(`${path}: source path does not match node and mental-unit ownership`);
  unique(batch.slotIds, "slotIds", path);
  unique(batch.items.map((item) => item.itemId), "itemIds", path);
  unique(batch.items.map((item) => item.slotId), "item slotIds", path);
  if (batch.slotIds.length !== batch.items.length) fail(`${path}: one item must exist for every declared authoring slot`);
  const declared = new Set(batch.slotIds);
  for (const item of batch.items) {
    const priorBatch = batchIds.get(batch.batchId);
    if (priorBatch && priorBatch !== path) fail(`${path}: batchId ${batch.batchId} also occurs in ${priorBatch}`); else batchIds.set(batch.batchId, path);
    const priorItem = itemIds.get(item.itemId);
    if (priorItem && priorItem !== path) fail(`${path}: itemId ${item.itemId} also occurs in ${priorItem}`); else itemIds.set(item.itemId, path);
    if (!declared.has(item.slotId)) fail(`${path}/${item.itemId}: item slot is not declared by the batch`);
    if (item.nodeId !== batch.nodeId || item.learningBlockId !== batch.learningBlockId) fail(`${path}/${item.itemId}: item crosses its mental-unit boundary`);
    if (item.taxonomy.competencyAreaId !== batch.nodeId || item.taxonomy.topicId !== batch.learningBlockId) fail(`${path}/${item.itemId}: taxonomy does not identify the batch owner`);
    if (!item.taxonomy.skillAtomId) fail(`${path}/${item.itemId}: missing primary mental unit skill atom`);
    const optionIds = item.interaction.options.map((option) => option.optionId);
    unique(optionIds, "optionIds", `${path}/${item.itemId}`);
    if (item.interaction.selectionMode !== "single" || item.interaction.acceptedOptionIds.length !== 1) fail(`${path}/${item.itemId}: first batch must use one-answer choice items`);
    const wrong = optionIds.filter((id) => !item.interaction.acceptedOptionIds.includes(id));
    if (canonicalJson(Object.keys(item.feedback.wrongOptionExplanationsByOptionId).sort()) !== canonicalJson(wrong.sort())) fail(`${path}/${item.itemId}: every distractor needs exactly one explanation`);
    if (Object.keys(item.feedback.omittedCorrectElementExplanationsByOptionId).length !== 0) fail(`${path}/${item.itemId}: single-choice item has omitted-correct feedback`);
    if (!item.modeEligibility.every((mode) => modes.has(mode))) fail(`${path}/${item.itemId}: unknown mode eligibility`);
    if (!item.constraints.length) fail(`${path}/${item.itemId}: missing explicit constraints`);
    const url = item.feedback.Details.url;
    if (!firstParty.test(url)) fail(`${path}/${item.itemId}: Details.url is not a first-party AWS URL`);
    if (!item.sourceBinding.sourceRefs.every((source) => firstParty.test(source))) fail(`${path}/${item.itemId}: source binding contains a non-first-party URL`);
    if (!item.sourceBinding.sourceRefs.includes(url)) fail(`${path}/${item.itemId}: Details.url is not bound to the source list`);
    const identity = sha256(canonicalJson({ prompt: item.prompt.trim().toLowerCase(), options: item.interaction.options.map((option) => option.text.trim().toLowerCase()).sort(), accepted: item.interaction.acceptedOptionIds }));
    const priorIdentity = identities.get(identity);
    if (priorIdentity && priorIdentity !== `${path}/${item.itemId}`) fail(`${path}/${item.itemId}: semantic content identity duplicates ${priorIdentity}`); else identities.set(identity, `${path}/${item.itemId}`);
  }
}

if (failures.length) {
  console.error(JSON.stringify({ status: "FAIL", failures }, null, 2));
  process.exit(1);
}
const summaries = [];
for (const path of paths) {
  const batch = JSON.parse(await readFile(resolve(ROOT, path), "utf8"));
  if (batch.taxonomyVersion === "aws-saa-c03-20-node-v2026.08.15") summaries.push({ path, batchId: batch.batchId, itemCount: batch.items.length, primaryMentalUnit: batch.items[0]?.taxonomy?.skillAtomId });
}
console.log(JSON.stringify({ status: "PASS", batches: summaries, semanticIdentities: identities.size }, null, 2));
