import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  buildManifest,
  canonicalJson,
  readJson,
  repoFiles,
  ROOT,
  sha256,
  validateSchema
} from "../authoring/lib/model.mjs";

const relativePath = process.argv[2];
if (!relativePath) {
  console.error("Usage: node scripts/audit/aws-question-batch.mjs <repo-relative-json-path>");
  process.exit(2);
}

const targetPath = resolve(ROOT, relativePath);
const batch = JSON.parse(await readFile(targetPath, "utf8"));
const schema = await readJson(ROOT, "schemas/publishing/certification-manual-source.schema.json");
await validateSchema(batch, schema, relativePath);
const manifestResult = await buildManifest(ROOT);
const track = manifestResult.manifest.tracks.find((entry) => entry.trackId === batch.trackId);
const curriculum = manifestResult.model.curricula.get(batch.trackId);
const canonicalSlots = new Map((track?.slots ?? []).map((slot) => [slot.slotId, slot]));
const normalizedSlots = new Map((curriculum?.normalized.slots ?? []).map((slot) => [slot.slotId, slot]));

const failures = [];
const fail = (message) => failures.push(message);
const unique = (values, label) => {
  if (new Set(values).size !== values.length) fail(`${label} contains duplicates`);
};

unique([batch.batchId], "batchId");
unique(batch.slotIds, "slotIds");
unique(batch.items.map((item) => item.itemId), "itemId");
unique(batch.items.map((item) => item.slotId), "item slotId");

if (batch.slotIds.length !== batch.items.length) fail("slotIds and items must have the same cardinality");
if (batch.items.some((item) => !batch.slotIds.includes(item.slotId))) fail("every item slotId must be declared by the batch");
if (batch.items.some((item) => item.nodeId !== batch.nodeId || item.learningBlockId !== batch.learningBlockId)) fail("items must remain inside the batch node and learning block");

const expectedSourcePath = `manual/source/${batch.trackId}/${batch.nodeId}/${batch.learningBlockId}.json`;
if (relativePath !== expectedSourcePath) fail(`source path must be ${expectedSourcePath}`);
if (!track) fail(`batch references an unknown track ${batch.trackId}`);
if (!curriculum) fail(`batch references an unknown curriculum ${batch.trackId}`);

const expectedSlots = (track?.slots ?? [])
  .filter((slot) => slot.learningBlockId === batch.learningBlockId && slot.authoringAdmitted)
  .map((slot) => slot.slotId)
  .sort();
if (canonicalJson([...batch.slotIds].sort()) !== canonicalJson(expectedSlots)) fail("slotIds must exactly match the source-ready canonical slots in the learning block");

const modeIds = new Set((await readJson(ROOT, "config/families/certification.json")).modes.map((mode) => mode.id));
for (const item of batch.items) {
  const canonicalSlot = canonicalSlots.get(item.slotId);
  const normalizedSlot = normalizedSlots.get(item.slotId);
  if (!canonicalSlot || !normalizedSlot) {
    fail(`${item.itemId} references an unknown canonical slot ${item.slotId}`);
    continue;
  }
  const optionIds = item.interaction.options.map((option) => option.optionId);
  const accepted = item.interaction.acceptedOptionIds;
  const wrong = optionIds.filter((id) => !accepted.includes(id));
  unique(optionIds, `${item.itemId} optionId`);
  unique(accepted, `${item.itemId} acceptedOptionIds`);
  if (item.interaction.selectionMode === "single" && accepted.length !== 1) fail(`${item.itemId} is single-choice but does not have exactly one accepted option`);
  if (item.interaction.selectionMode === "multiple" && accepted.length < 2) fail(`${item.itemId} is multiple-choice but has fewer than two accepted options`);
  if (JSON.stringify(Object.keys(item.feedback.wrongOptionExplanationsByOptionId).sort()) !== JSON.stringify([...wrong].sort())) fail(`${item.itemId} does not explain exactly every wrong option`);
  if (Object.keys(item.feedback.omittedCorrectElementExplanationsByOptionId).length !== 0) fail(`${item.itemId} has omitted-correct feedback for a single-choice item`);
  if (item.modeEligibility.some((mode) => !modeIds.has(mode))) fail(`${item.itemId} references an unknown certification mode`);
  if (canonicalJson([...item.modeEligibility].sort()) !== canonicalJson([...canonicalSlot.modeEligibility].sort())) fail(`${item.itemId} modeEligibility does not match its canonical slot`);
  if (!item.sourceBinding.sourceRefs.every((url) => /^https:\/\/(docs\.aws\.amazon\.com|aws\.amazon\.com)\//.test(url))) fail(`${item.itemId} has a non-first-party source reference`);
  const detailsUrl = item.feedback?.Details?.url;
  if (!/^https:\/\/(docs\.aws\.amazon\.com|aws\.amazon\.com)\//.test(detailsUrl ?? "")) fail(`${item.itemId} Details.url must be a first-party AWS documentation URL`);
  if (!item.sourceBinding.sourceRefs.includes(detailsUrl)) fail(`${item.itemId} Details.url must match one of its bound source references`);
  if (canonicalJson(item.sourceBinding) !== canonicalJson(canonicalSlot.sourceBinding)) fail(`${item.itemId} source binding does not match its canonical slot`);
  if (item.sourceBinding.anchorIds.length !== 1) fail(`${item.itemId} must bind exactly one primary source anchor`);
  const expectedTaxonomy = {
    examDomainId: normalizedSlot.raw.primarySimulationDomainId,
    competencyAreaId: normalizedSlot.nodeId,
    topicId: normalizedSlot.learningBlockId,
    skillAtomId: normalizedSlot.raw.directSkillOrDecisionAtomId
  };
  if (canonicalJson(item.taxonomy) !== canonicalJson(expectedTaxonomy)) fail(`${item.itemId} taxonomy does not match its canonical slot`);
  if (!item.constraints.length) fail(`${item.itemId} has no explicit constraints`);
}

const mentalUnits = new Set(batch.items.map((item) => `${item.taxonomy.skillAtomId}:${item.sourceBinding.anchorIds[0]}`));

const contentIdentity = (item) => sha256(canonicalJson({
  prompt: item.prompt.trim().toLocaleLowerCase(),
  options: item.interaction.options.map((option) => option.text.trim().toLocaleLowerCase()).sort(),
  acceptedOptionTexts: item.interaction.options
    .filter((option) => item.interaction.acceptedOptionIds.includes(option.optionId))
    .map((option) => option.text.trim().toLocaleLowerCase())
    .sort()
}));
const identities = batch.items.map(contentIdentity);
unique(identities, "content identity");

const awsSourcePaths = (await repoFiles(ROOT, [`manual/source/${batch.trackId}`])).filter((path) => path.endsWith(".json"));
const crossBatchIdentities = new Map();
const globalBatchIds = new Map();
const globalItemIds = new Map();
for (const path of awsSourcePaths) {
  let source;
  try {
    source = JSON.parse(await readFile(resolve(ROOT, path), "utf8"));
  } catch (error) {
    fail(`cannot parse AWS source ${path}: ${error.message}`);
    continue;
  }
  const previousBatch = globalBatchIds.get(source.batchId);
  if (previousBatch && previousBatch !== path) fail(`batchId ${source.batchId} is duplicated between ${previousBatch} and ${path}`);
  else globalBatchIds.set(source.batchId, path);
  for (const item of source.items ?? []) {
    const previousItem = globalItemIds.get(item.itemId);
    if (previousItem && previousItem !== path) fail(`itemId ${item.itemId} is duplicated between ${previousItem} and ${path}`);
    else globalItemIds.set(item.itemId, path);
    const identity = contentIdentity(item);
    const previous = crossBatchIdentities.get(identity);
    if (previous && previous.path !== path) fail(`semantic content identity is duplicated between ${previous.path} and ${path}`);
    else crossBatchIdentities.set(identity, { path, itemId: item.itemId });
  }
}

if (failures.length) {
  console.error(JSON.stringify({ status: "FAIL", path: relativePath, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  status: "PASS",
  path: relativePath,
  batchId: batch.batchId,
  itemCount: batch.items.length,
  primaryMentalUnits: [...mentalUnits].sort(),
  modes: [...new Set(batch.items.flatMap((item) => item.modeEligibility))].sort(),
  sourceRefCount: [...new Set(batch.items.flatMap((item) => item.sourceBinding.sourceRefs))].length
}, null, 2));
