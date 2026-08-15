import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { validateSchema } from "../authoring/lib/model.mjs";

const ROOT = process.cwd();
const TRACK_ID = "microsoft-azure-ai-fundamentals-ai-901";
const sourceRoot = join(ROOT, "manual/source", TRACK_ID);
const curriculumPath = join(ROOT, "config/curricula", `${TRACK_ID}.json`);
const registryPath = join(ROOT, "config/certification-source-registries", `${TRACK_ID}.json`);
const schemaPath = join(ROOT, "schemas/publishing/certification-node-manual-source.schema.json");
const fail = (message) => { throw new Error(`AI901_LOCAL_VALIDATION: ${message}`); };
const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const sorted = (values) => [...values].sort();
const exact = (left, right) => JSON.stringify(sorted(left)) === JSON.stringify(sorted(right));
const contentIdentity = (item) => JSON.stringify({ prompt: item.prompt.trim().toLowerCase(), options: item.interaction.options.map((option) => option.text.trim().toLowerCase()).sort(), accepted: item.interaction.options.filter((option) => item.interaction.acceptedOptionIds.includes(option.optionId)).map((option) => option.text.trim().toLowerCase()).sort() });

const curriculum = await readJson(curriculumPath);
const registry = await readJson(registryPath);
const schema = await readJson(schemaPath);
const ledger = await readJson(join(sourceRoot, "completion-ledger.json"));
const registryById = new Map(registry.sources.map((source) => [source.sourceId, source]));
const nodes = new Map(curriculum.nodes.map((node) => [node.nodeId, node]));
const slots = new Map(curriculum.slots.map((slot) => [slot.slotId, slot]));
const unitIds = new Set(curriculum.blockPlans.map((block) => block.blockId));
const objectiveIds = new Set(curriculum.objectiveAndDomainOwnership.map((entry) => entry.objectiveId));

if (curriculum.trackId !== TRACK_ID || curriculum.nodes.length !== 5 || curriculum.blockPlans.length !== 64) fail("curriculum is not the corrected 5-node/64-unit structure");
if (registry.provider !== "Microsoft" || registryById.size !== registry.sources.length || registry.sources.some((source) => !/^https:\/\/learn\.microsoft\.com\//.test(source.url))) fail("source registry contains duplicate or non-Microsoft sources");
if (ledger.states.join(",") !== "NOT_STARTED,IN_PROGRESS,MECHANICALLY_VALIDATED,BLOCKED_EXTERNAL") fail("completion ledger state contract drifted");

const allFiles = [];
async function walk(dir) { for (const entry of await readdir(dir, { withFileTypes: true })) { const path = join(dir, entry.name); if (entry.isDirectory()) await walk(path); else allFiles.push(relative(sourceRoot, path)); } }
await walk(sourceRoot);
const expectedContentFiles = sorted([...nodes.keys()].map((nodeId) => `${nodeId}/content.json`).concat(["completion-ledger.json"]));
if (!exact(allFiles, expectedContentFiles)) fail(`source root files do not equal five node content files plus ledger: ${JSON.stringify(allFiles)}`);

const nodeItems = new Map([...nodes.keys()].map((nodeId) => [nodeId, []]));
const unitItems = new Map([...unitIds].map((unitId) => [unitId, []]));
const globalItemIds = new Set();
const globalSlotIds = new Set();
const identities = new Map();
for (const node of nodes.values()) {
  const batch = await readJson(join(sourceRoot, node.nodeId, "content.json"));
  await validateSchema(batch, schema, `${TRACK_ID}/${node.nodeId}/content.json`);
  if (batch.trackId !== TRACK_ID || batch.nodeId !== node.nodeId || batch.authoringProvenance.approvalStatus !== "unapproved") fail(`${node.nodeId} envelope identity or activation boundary is invalid`);
  if (!exact(batch.learningBlockIds, node.blockIds)) fail(`${node.nodeId} does not own exactly its canonical mental units`);
  if (batch.slotIds.length !== batch.items.length || !exact(batch.slotIds, batch.items.map((item) => item.slotId))) fail(`${node.nodeId} slot/item cardinality is not exact`);
  if (batch.items.length <= 120) fail(`${node.nodeId} has ${batch.items.length} questions; every node must exceed 120`);
  for (const item of batch.items) {
    const slot = slots.get(item.slotId);
    if (!slot || slot.nodeId !== node.nodeId || slot.blockId !== item.learningBlockId) fail(`${item.itemId} does not map to its canonical node/unit slot`);
    if (!unitIds.has(item.learningBlockId) || item.taxonomy.competencyAreaId !== node.nodeId || item.taxonomy.topicId !== item.learningBlockId || item.taxonomy.skillAtomId !== item.learningBlockId) fail(`${item.itemId} taxonomy crosses its primary mental unit`);
    if (!exact(item.modeEligibility, slot.eligibleModes) || item.interaction.selectionMode !== "single" || item.interaction.acceptedOptionIds.length !== 1) fail(`${item.itemId} interaction or mode contract drifted`);
    if (new Set(item.interaction.options.map((option) => option.optionId)).size !== 4) fail(`${item.itemId} must have four unique options`);
    const wrong = item.interaction.options.map((option) => option.optionId).filter((id) => id !== item.interaction.acceptedOptionIds[0]);
    if (!exact(Object.keys(item.feedback.wrongOptionExplanationsByOptionId), wrong)) fail(`${item.itemId} wrong-option feedback is incomplete`);
    if (Object.keys(item.feedback.omittedCorrectElementExplanationsByOptionId).length !== 0) fail(`${item.itemId} has omitted-correct feedback for a single-choice item`);
    if (!item.feedback.Reason.trim() || !item.feedback.Details.mechanismOrProperty.trim() || !item.feedback.Details.scenarioApplication.trim() || !item.feedback.Details.errorCorrection.trim() || !item.feedback.Details.boundaryOrTradeoff.trim() || !item.feedback.Details.transfer.trim()) fail(`${item.itemId} has incomplete authored feedback`);
    if (!/^https:\/\/learn\.microsoft\.com\/[^\s]+$/.test(item.feedback.Details.url)) fail(`${item.itemId} has a missing or non-Microsoft Details URL`);
    if (!item.sourceBinding.sourceRefs.every((sourceId) => registryById.has(sourceId))) fail(`${item.itemId} has an unregistered source reference`);
    if (!item.sourceBinding.sourceRefs.some((sourceId) => registryById.get(sourceId).url === item.feedback.Details.url)) fail(`${item.itemId} Details URL does not match provenance source binding`);
    if (item.sourceBinding.anchorIds.length !== 1 || !slot.sourceRequirements.directFirstPartyDocumentation.some((entry) => entry.anchorPropertyRefs.includes(item.sourceBinding.anchorIds[0]))) fail(`${item.itemId} has incomplete direct source anchor provenance`);
    if (item.authoringProvenance.approvalStatus !== "unapproved" || item.authoringProvenance.contentBatchId !== batch.batchId) fail(`${item.itemId} has fabricated approval or mismatched batch provenance`);
    if (globalItemIds.has(item.itemId)) fail(`duplicate itemId ${item.itemId}`); globalItemIds.add(item.itemId);
    if (globalSlotIds.has(item.slotId)) fail(`duplicate slotId ${item.slotId}`); globalSlotIds.add(item.slotId);
    const identity = contentIdentity(item); if (identities.has(identity)) fail(`semantic duplicate ${item.itemId} duplicates ${identities.get(identity)}`); identities.set(identity, item.itemId);
    nodeItems.get(node.nodeId).push(item);
    unitItems.get(item.learningBlockId).push(item);
  }
}
for (const [unitId, items] of unitItems) {
  const acceptedTexts = new Set(items.map((item) => item.interaction.options.find((option) => item.interaction.acceptedOptionIds.includes(option.optionId)).text.trim().toLowerCase()));
  const authoringFamilies = new Set(items.map((item) => slots.get(item.slotId).learningOperation));
  if (acceptedTexts.size < Math.min(items.length, 8) || authoringFamilies.size < Math.min(items.length, 8)) fail(`${unitId} lacks independent reasoning-family coverage (${acceptedTexts.size} accepted-answer variants, ${authoringFamilies.size} families)`);
}
if (globalSlotIds.size !== curriculum.slots.length) fail(`source bank covers ${globalSlotIds.size}/${curriculum.slots.length} canonical slots`);
if (globalItemIds.size !== 752) fail(`expected 752 authored items from the corrected saturation plan, found ${globalItemIds.size}`);

const ledgerSkillIds = new Set(ledger.mentalUnits.flatMap((unit) => unit.primaryOfficialSkills));
if (ledgerSkillIds.size !== 29 || ![...Array.from({ length: 14 }, (_, i) => `C${String(i + 1).padStart(2, "0")}`), ...Array.from({ length: 15 }, (_, i) => `I${String(i + 1).padStart(2, "0")}`)].every((skill) => ledgerSkillIds.has(skill))) fail("official skill coverage is not 29/29");
if (ledger.quality.knownSemanticDuplicates !== 0 || ledger.quality.fillerQuestions !== 0 || ledger.quality.missingReason !== 0 || ledger.quality.missingDetails !== 0 || ledger.quality.missingWrongOptionExplanations !== 0 || ledger.quality.missingOfficialUrls !== 0 || ledger.quality.structuralFailures !== 0) fail("completion ledger records unresolved quality defects");
if (ledger.mentalUnits.some((unit) => unit.status !== "MECHANICALLY_VALIDATED" || unit.coverageGapAnalysis.materialGaps.length !== 0 || unit.saturationAudit.status !== "passed")) fail("one or more mental units are not mechanically validated");
if (ledger.globalAudits?.structuralValidation !== "passed" || ledger.globalAudits?.semanticDuplicateAudit !== "passed" || ledger.globalAudits?.sourceAudit !== "passed" || ledger.globalAudits?.coverageGapAnalysis?.passed !== 64 || ledger.globalAudits?.saturationAudit?.passed !== 64 || ledger.globalAudits?.nodeQuantityFloor?.failed !== 0) fail("global audit ledger is incomplete or records an unresolved result");

console.log(JSON.stringify({ status: "PASS", trackId: TRACK_ID, canonicalNodes: nodes.size, mentalUnits: unitIds.size, questions: globalItemIds.size, nodeCounts: Object.fromEntries([...nodeItems.entries()].map(([nodeId, items]) => [nodeId, items.length])), officialSkills: ledgerSkillIds.size, semanticDuplicates: identities.size - globalItemIds.size, activation: ledger.activationBoundary }, null, 2));
