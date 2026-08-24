import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { nodes, units, sourceRecords } from "./author-candidate-bank.mjs";

const ROOT = new URL("../../", import.meta.url).pathname;
const SOURCE_ROOT = join(ROOT, "manual/source/object-oriented-design-interview");
const ARTIFACT_ROOT = join(ROOT, "evidence/design-interview/object-oriented-design-interview");
const SOURCE_KEYS = new Set(sourceRecords.map((source) => source.key));
const SOURCE_URLS = new Set(sourceRecords.map((source) => source.url));
const RICH_INTERACTIONS = new Set(["interpret_class_diagram", "interpret_sequence", "interpret_state_machine", "predict_object_lifecycle", "concurrency_failure_diagnosis", "code_or_design_snippet", "order_interaction"]);
const REQUIRED_INTENT_KEYS = ["provisionalItemId", "primaryMentalUnitId", "primaryCompetencyId", "authoringFamily", "scenarioArchetype", "decisiveRequirement", "designState", "expectedDecision", "targetedMisconception", "source", "difficulty", "preferredInteraction", "coverageDimension", "runtimeCompatibilityClassification"];
const fail = (message) => { throw new Error(`OOD-CANDIDATE-VALIDATION: ${message}`); };
const nonEmpty = (value, label) => { if (typeof value !== "string" || !value.trim()) fail(`${label} must be a non-empty string`); };
const unique = (values, label) => { if (new Set(values).size !== values.length) fail(`${label} contains duplicates`); };

function validateItem(item, unitById, nodeId) {
  for (const key of ["itemId", "nodeId", "mentalUnitId", "primaryCompetencyId", "prompt", "difficulty", "preferredInteraction", "runtimeCompatibility"]) nonEmpty(item[key], `${item.itemId ?? "item"}.${key}`);
  if (item.nodeId !== nodeId) fail(`${item.itemId} crosses node boundary`);
  const unit = unitById.get(item.mentalUnitId);
  if (!unit) fail(`${item.itemId} references unknown mental unit ${item.mentalUnitId}`);
  if (item.primaryCompetencyId !== unit.primaryCompetencyIds[0]) fail(`${item.itemId} primary competency drifts from ${unit.unitId}`);
  if (item.taxonomy?.nodeId !== nodeId || item.taxonomy?.mentalUnitId !== unit.unitId || item.taxonomy?.primaryCompetencyId !== unit.primaryCompetencyIds[0]) fail(`${item.itemId} taxonomy does not match canonical unit`);
  if (!Array.isArray(item.secondaryCompetencyIds)) fail(`${item.itemId} secondaryCompetencyIds must be an array`);
  if (!Array.isArray(item.constraints) || item.constraints.length < 4) fail(`${item.itemId} needs at least four explicit constraints`);
  const interaction = item.interaction;
  if (interaction?.type !== "choice" || interaction.selectionMode !== "single") fail(`${item.itemId} must use the explicit choice/single proxy contract`);
  if (!Array.isArray(interaction.options) || interaction.options.length < 4) fail(`${item.itemId} needs realistic distractors`);
  const optionIds = interaction.options.map((option) => { nonEmpty(option.optionId, `${item.itemId}.optionId`); nonEmpty(option.text, `${item.itemId}.${option.optionId}.text`); return option.optionId; });
  unique(optionIds, `${item.itemId} option IDs`);
  if (interaction.acceptedOptionIds?.length !== 1 || !optionIds.includes(interaction.acceptedOptionIds[0])) fail(`${item.itemId} must have one accepted option present in options`);
  if (item.scoringContract?.type !== "choice" || item.scoringContract.resultSemantics !== "exact_selected_set_with_partial_v1" || item.scoringContract.selectionMode !== "single") fail(`${item.itemId} scoring contract is incomplete`);
  const feedback = item.feedback;
  nonEmpty(feedback?.Reason, `${item.itemId}.feedback.Reason`);
  for (const key of ["mechanismOrProperty", "scenarioApplication", "errorCorrection", "boundaryOrTradeoff", "transfer"]) nonEmpty(feedback?.Details?.[key], `${item.itemId}.feedback.Details.${key}`);
  const wrongIds = optionIds.filter((id) => id !== interaction.acceptedOptionIds[0]);
  unique(Object.keys(feedback.wrongOptionExplanationsByOptionId ?? {}), `${item.itemId} wrong explanation keys`);
  if (JSON.stringify(Object.keys(feedback.wrongOptionExplanationsByOptionId).sort()) !== JSON.stringify(wrongIds.sort())) fail(`${item.itemId} wrong-option explanations must exactly cover active distractors`);
  for (const id of wrongIds) nonEmpty(feedback.wrongOptionExplanationsByOptionId[id], `${item.itemId}.wrongOptionExplanationsByOptionId.${id}`);
  if (Object.keys(feedback.omittedCorrectElementExplanationsByOptionId ?? {}).length !== 0) fail(`${item.itemId} single choice cannot have omitted-correct explanations`);
  const intent = item.authoringIntent;
  for (const key of REQUIRED_INTENT_KEYS) nonEmpty(intent?.[key], `${item.itemId}.authoringIntent.${key}`);
  if (intent.provisionalItemId !== item.itemId || intent.primaryMentalUnitId !== item.mentalUnitId || intent.primaryCompetencyId !== item.primaryCompetencyId) fail(`${item.itemId} intent identity drifts from item identity`);
  if (!SOURCE_KEYS.has(intent.source)) fail(`${item.itemId} intent source is not in registry`);
  if (!item.sourceBinding?.bindingId || !Array.isArray(item.sourceBinding.claimIds) || !item.sourceBinding.claimIds.length || !Array.isArray(item.sourceBinding.anchorIds) || !item.sourceBinding.anchorIds.length || !Array.isArray(item.sourceBinding.sourceRefs) || !item.sourceBinding.sourceRefs.length) fail(`${item.itemId} source binding is incomplete`);
  if (item.sourceBinding.sourceRefs.some((url) => !SOURCE_URLS.has(url))) fail(`${item.itemId} source binding contains an unregistered URL`);
  const provenance = item.authoringProvenance;
  if (provenance?.authoringMethod !== "manual" || provenance.approvalStatus !== "unapproved") fail(`${item.itemId} provenance must remain manual/unapproved`);
  for (const key of ["author", "createdAt", "contentBatchId"]) nonEmpty(provenance[key], `${item.itemId}.authoringProvenance.${key}`);
  if (item.interaction.acceptedOptionIds[0] !== "owner_preserves_contract") fail(`${item.itemId} expected decision is not canonical owner_preserves_contract`);
  if (/which\s+(design\s+)?pattern|which\s+solid|what\s+is\s+(factory|strategy|liskov)/i.test(item.prompt)) fail(`${item.itemId} is pattern/SOLID name trivia`);
  if (item.prompt.length < 180 || item.feedback.Details.mechanismOrProperty.length < 80) fail(`${item.itemId} is under-contextualized`);
}

async function main() {
  const files = [];
  for (const node of nodes) {
    const nodeFiles = (await readdir(join(SOURCE_ROOT, node.nodeId))).filter((file) => file.endsWith(".json")).sort();
    files.push(...nodeFiles.map((file) => ({ nodeId: node.nodeId, learningBlockId: file.slice(0, -5), file })));
  }
  const expectedFiles = units.map((unit) => ({ nodeId: nodes.find((node) => node.order === unit.nodeOrder).nodeId, learningBlockId: unit.unitId, file: `${unit.unitId}.json` })).sort((left, right) => `${left.nodeId}/${left.file}`.localeCompare(`${right.nodeId}/${right.file}`));
  const actualFiles = files.sort((left, right) => `${left.nodeId}/${left.file}`.localeCompare(`${right.nodeId}/${right.file}`));
  if (JSON.stringify(actualFiles) !== JSON.stringify(expectedFiles)) fail(`learning-block source file inventory does not match manifest`);
  const unitById = new Map(units.map((unit) => [unit.unitId, unit]));
  const itemIds = [];
  const intentKeys = [];
  const unitCounts = new Map();
  const coverageByUnit = new Map();
  const nodeCounts = new Map();
  let richCount = 0;
  for (const entry of files) {
    const node = nodes.find((candidate) => candidate.nodeId === entry.nodeId);
    const path = join(SOURCE_ROOT, entry.nodeId, entry.file);
    const batch = JSON.parse(await readFile(path, "utf8"));
    if (batch.schemaVersion !== "object-oriented-design-interview-candidate-source-v1" || batch.candidateStatus !== "generated_and_mechanically_validated_pending_human_review" || batch.activationState !== "inactive_candidate") fail(`${node.nodeId} envelope is not an inactive candidate envelope`);
    if (batch.trackId !== "object-oriented-design-interview" || batch.familyId !== "object_oriented_design" || batch.runtimeAdmission !== "not_admitted" || batch.publishingAdmission !== "not_admitted") fail(`${node.nodeId} admission boundary drifted`);
    if (batch.nodeId !== node.nodeId || batch.learningBlockId !== entry.learningBlockId || JSON.stringify(batch.mentalUnitIds) !== JSON.stringify([entry.learningBlockId])) fail(`${node.nodeId}/${entry.learningBlockId} node/block identity is incorrect`);
    unique(batch.items.map((item) => item.itemId), `${node.nodeId} item IDs`);
    for (const item of batch.items) {
      validateItem(item, unitById, node.nodeId);
      itemIds.push(item.itemId);
      intentKeys.push(item.authoringIntent.semanticUniquenessKey);
      unitCounts.set(item.mentalUnitId, (unitCounts.get(item.mentalUnitId) ?? 0) + 1);
      const coverage = coverageByUnit.get(item.mentalUnitId) ?? new Set();
      coverage.add(item.authoringIntent.coverageDimension);
      coverageByUnit.set(item.mentalUnitId, coverage);
      if (RICH_INTERACTIONS.has(item.preferredInteraction)) richCount += 1;
    }
    nodeCounts.set(node.nodeId, (nodeCounts.get(node.nodeId) ?? 0) + batch.items.length);
  }
  unique(itemIds, "global item IDs");
  unique(intentKeys, "semantic intent keys");
  if (itemIds.length !== 1413) fail(`expected 1413 candidate items, got ${itemIds.length}`);
  if (unitCounts.size !== 79 || [...unitById.keys()].some((id) => !unitCounts.has(id))) fail(`all 79 mental units must have authored items`);
  const coverageMatrix = JSON.parse(await readFile(join(ARTIFACT_ROOT, "coverage-matrix.json"), "utf8"));
  for (const unit of coverageMatrix.units) {
    const present = coverageByUnit.get(unit.unitId) ?? new Set();
    for (const dimension of unit.requiredDimensions.map((entry) => entry.dimension)) if (!present.has(dimension)) fail(`${unit.unitId} is missing required coverage dimension ${dimension}`);
    if (unit.coverageGapAudit?.status !== "PASS" || unit.saturationAudit?.status !== "PASS" || unit.saturationAudit?.unrepresentedCaseTypes?.length) fail(`${unit.unitId} coverage/saturation audit is not PASS`);
  }
  const ledger = JSON.parse(await readFile(join(ARTIFACT_ROOT, "completion-ledger.json"), "utf8"));
  if (ledger.globalAudit.knownSemanticDuplicates !== 0 || ledger.globalAudit.knownFillerItems !== 0 || ledger.globalAudit.structuralFailures !== 0) fail("completion ledger reports a failed global audit");
  const familyEvidence = JSON.parse(await readFile(join(ARTIFACT_ROOT, "family-admission-evidence.json"), "utf8"));
  if (familyEvidence.runtimeAdmission !== "not_admitted" || familyEvidence.publishingAdmission !== "not_admitted" || familyEvidence.humanReview !== "pending") fail("family-admission evidence crosses the review boundary");
  console.log(JSON.stringify({ status: "PASS", nodes: Object.fromEntries(nodeCounts), mentalUnits: unitCounts.size, questions: itemIds.length, semanticDuplicates: 0, richerInteractionItems: richCount, runtimeAdmission: "not_admitted", publishingAdmission: "not_admitted", humanReview: "pending" }, null, 2));
}

if (process.argv[1] === new URL(import.meta.url).pathname) await main();
