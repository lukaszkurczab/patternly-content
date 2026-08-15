import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const ROOT = new URL("../../", import.meta.url).pathname;
const BANK_ROOT = join(ROOT, "manual/source/backend-system-design-interview/candidate-bank");
const fail = (message) => { throw new Error(`BESD-CANDIDATE-VALIDATION: ${message}`); };
const nonEmpty = (value, label) => { if (typeof value !== "string" || !value.trim()) fail(`${label} must be a non-empty string`); };
const unique = (values, label) => { if (new Set(values).size !== values.length) fail(`${label} contains duplicates`); };
const readJson = async (name) => JSON.parse(await readFile(join(BANK_ROOT, name), "utf8"));
const RICH_INTERACTIONS = new Set(["capacity_calculation", "sequence_or_data_flow", "topology_comparison", "trust_boundary_mapping", "operational_timeline", "data_model_and_access_path", "cache_consistency_topology"]);
const REQUIRED_INTENT_KEYS = ["provisionalItemId", "primaryMentalUnitId", "primaryCompetencyId", "authoringFamily", "scenarioArchetype", "workloadProfile", "decisiveConstraint", "architectureState", "expectedDecision", "misconception", "failureMode", "source", "difficulty", "preferredInteraction", "coverageDimension", "runtimeCompatibilityClassification"];

function validateItem(item, unitById, nodeId, sourceUrls, sourceKeys) {
  for (const key of ["itemId", "nodeId", "mentalUnitId", "primaryCompetencyId", "prompt", "difficulty", "preferredInteraction", "runtimeCompatibility"]) nonEmpty(item[key], `${item.itemId ?? "item"}.${key}`);
  if (item.nodeId !== nodeId) fail(`${item.itemId} crosses node boundary`);
  const unit = unitById.get(item.mentalUnitId);
  if (!unit) fail(`${item.itemId} references unknown mental unit`);
  if (item.primaryCompetencyId !== unit.primaryCompetencyIds[0]) fail(`${item.itemId} primary competency drifts from ${unit.unitId}`);
  if (item.taxonomy?.nodeId !== nodeId || item.taxonomy?.mentalUnitId !== unit.unitId || item.taxonomy?.primaryCompetencyId !== item.primaryCompetencyId) fail(`${item.itemId} taxonomy identity is inconsistent`);
  if (!Array.isArray(item.secondaryCompetencyIds)) fail(`${item.itemId} secondaryCompetencyIds must be an array`);
  if (!Array.isArray(item.constraints) || item.constraints.length < 4) fail(`${item.itemId} needs four explicit constraints`);
  const interaction = item.interaction;
  if (interaction?.type !== "choice" || interaction.selectionMode !== "single") fail(`${item.itemId} interaction contract is incomplete`);
  if (!Array.isArray(interaction.options) || interaction.options.length !== 5) fail(`${item.itemId} needs one accepted option and four distractors`);
  const optionIds = interaction.options.map((option) => { nonEmpty(option.optionId, `${item.itemId}.optionId`); nonEmpty(option.text, `${item.itemId}.${option.optionId}.text`); return option.optionId; });
  unique(optionIds, `${item.itemId} option IDs`);
  if (interaction.acceptedOptionIds?.length !== 1 || !optionIds.includes(interaction.acceptedOptionIds[0])) fail(`${item.itemId} must have one accepted option`);
  if (item.scoringContract?.type !== "choice" || item.scoringContract.resultSemantics !== "exact_selected_set_with_partial_v1" || item.scoringContract.selectionMode !== "single") fail(`${item.itemId} scoring contract is incomplete`);
  nonEmpty(item.feedback?.Reason, `${item.itemId}.feedback.Reason`);
  for (const key of ["mechanismOrProperty", "scenarioApplication", "errorCorrection", "boundaryOrTradeoff", "ownership", "transfer", "provenance"]) nonEmpty(item.feedback?.Details?.[key], `${item.itemId}.feedback.Details.${key}`);
  const wrongIds = optionIds.filter((id) => id !== interaction.acceptedOptionIds[0]);
  const explanations = item.feedback?.wrongOptionExplanationsByOptionId ?? {};
  if (JSON.stringify(Object.keys(explanations).sort()) !== JSON.stringify(wrongIds.sort())) fail(`${item.itemId} wrong-option explanations must exactly cover distractors`);
  for (const id of wrongIds) nonEmpty(explanations[id], `${item.itemId}.wrongOptionExplanationsByOptionId.${id}`);
  if (Object.keys(item.feedback?.omittedCorrectElementExplanationsByOptionId ?? {}).length) fail(`${item.itemId} single choice cannot have omitted-correct explanations`);
  for (const key of REQUIRED_INTENT_KEYS) nonEmpty(item.authoringIntent?.[key], `${item.itemId}.authoringIntent.${key}`);
  if (item.authoringIntent.provisionalItemId !== item.itemId || item.authoringIntent.primaryMentalUnitId !== item.mentalUnitId || item.authoringIntent.primaryCompetencyId !== item.primaryCompetencyId) fail(`${item.itemId} intent identity drifts`);
  if (!sourceKeys.has(item.authoringIntent.source)) fail(`${item.itemId} intent source is not registered`);
  if (!item.sourceBinding?.bindingId || !item.sourceBinding.claimIds?.length || !item.sourceBinding.anchorIds?.length || !item.sourceBinding.sourceRefs?.length) fail(`${item.itemId} source binding is incomplete`);
  if (item.sourceBinding.sourceRefs.some((url) => !sourceUrls.has(url))) fail(`${item.itemId} source binding contains an unregistered URL`);
  if (item.authoringProvenance?.approvalStatus !== "unapproved" || item.authoringProvenance?.authoringMethod !== "manual") fail(`${item.itemId} provenance crosses human-review boundary`);
  for (const key of ["author", "createdAt", "contentBatchId"]) nonEmpty(item.authoringProvenance[key], `${item.itemId}.authoringProvenance.${key}`);
  if (item.prompt.length < 220 || item.feedback.Details.mechanismOrProperty.length < 90) fail(`${item.itemId} is under-contextualized`);
  if (!item.qualityFlags || Object.values(item.qualityFlags).some(Boolean)) fail(`${item.itemId} has a failed quality flag`);
  if (/which aws|which gcp|which azure|url shortener|twitter|instagram|netflix|uber|whatsapp|youtube/i.test(item.prompt)) fail(`${item.itemId} violates provider/product-neutral scope`);
  if (/more scalable|more reliable|better performance|best practice/i.test(item.feedback.Reason)) fail(`${item.itemId} has generic feedback`);
}

async function main() {
  const blueprint = await readJson("blueprint.json");
  if (blueprint.trackId !== "backend-system-design-interview" || blueprint.nodes.length !== 10 || blueprint.units.length !== 89 || blueprint.competencies.length !== 40) fail("blueprint inventory is not 10/89/40");
  if (blueprint.baseline.runtimeAdmission !== "not_admitted" || blueprint.baseline.publishingAdmission !== "not_admitted") fail("blueprint admission boundary drifted");
  const sourceRegistry = await readJson("source-registry.json");
  const sourceKeys = new Set(sourceRegistry.sourceRecords.map((source) => source.key));
  const sourceUrls = new Set(sourceRegistry.sourceRecords.map((source) => source.url));
  if (sourceRegistry.sourceBatches.length !== 89) fail(`expected 89 source batches, got ${sourceRegistry.sourceBatches.length}`);
  const files = (await readdir(BANK_ROOT)).filter((file) => file.endsWith(".content.json")).sort();
  const expectedFiles = blueprint.nodes.map((node) => `${node.nodeId}.content.json`).sort();
  if (JSON.stringify(files) !== JSON.stringify(expectedFiles)) fail("node content file inventory does not match blueprint");
  const unitById = new Map(blueprint.units.map((unit) => [unit.unitId, unit]));
  for (const unit of blueprint.units) {
    if (unit.status !== "MECHANICALLY_VALIDATED") fail(`${unit.unitId} is not mechanically validated`);
    if (!Number.isInteger(unit.finalCount) || unit.finalCount < 1) fail(`${unit.unitId} has no final authored count`);
    if (typeof unit.questionPlan !== "string" || !unit.questionPlan.startsWith("SATURATED")) fail(`${unit.unitId} does not have a saturated question plan`);
    if (/\b(?:TBD|PENDING)\b/i.test(unit.questionPlan)) fail(`${unit.unitId} question plan contains an unresolved placeholder`);
  }
  const itemIds = [];
  const intentKeys = [];
  const unitCounts = new Map();
  const nodeCounts = new Map();
  const coverageByUnit = new Map();
  let richItems = 0;
  for (const node of blueprint.nodes) {
    const batch = await readJson(`${node.nodeId}.content.json`);
    if (batch.schemaVersion !== "backend-system-design-interview-candidate-source-v1" || batch.candidateStatus !== "candidate_content_mechanically_validated_pending_human_review" || batch.activationState !== "inactive_candidate") fail(`${node.nodeId} envelope is not an inactive candidate envelope`);
    if (batch.runtimeAdmission !== "not_admitted" || batch.publishingAdmission !== "not_admitted") fail(`${node.nodeId} admission boundary drifted`);
    if (batch.nodeId !== node.nodeId || batch.mentalUnitIds.length !== node.unitCount) fail(`${node.nodeId} node/unit identity is incorrect`);
    unique(batch.items.map((item) => item.itemId), `${node.nodeId} item IDs`);
    for (const item of batch.items) {
      validateItem(item, unitById, node.nodeId, sourceUrls, sourceKeys);
      itemIds.push(item.itemId);
      intentKeys.push(item.authoringIntent.semanticUniquenessKey);
      unitCounts.set(item.mentalUnitId, (unitCounts.get(item.mentalUnitId) ?? 0) + 1);
      const coverage = coverageByUnit.get(item.mentalUnitId) ?? new Set();
      coverage.add(item.authoringIntent.coverageDimension);
      coverageByUnit.set(item.mentalUnitId, coverage);
      if (RICH_INTERACTIONS.has(item.preferredInteraction)) richItems += 1;
    }
    nodeCounts.set(node.nodeId, batch.items.length);
    if (batch.items.length <= 120) fail(`${node.nodeId} has ${batch.items.length}; every node must exceed 120`);
  }
  for (const unit of blueprint.units) if (unitCounts.get(unit.unitId) !== unit.finalCount) fail(`${unit.unitId} finalCount does not match authored items`);
  unique(itemIds, "global item IDs");
  unique(intentKeys, "global semantic intent keys");
  if (unitCounts.size !== 89 || [...unitById.keys()].some((id) => !unitCounts.has(id))) fail("all 89 mental units must have authored items");
  const coverageMatrix = await readJson("coverage-matrix.json");
  for (const unit of coverageMatrix.units) {
    const present = coverageByUnit.get(unit.unitId) ?? new Set();
    for (const dimension of unit.requiredDimensions.filter((entry) => entry.required).map((entry) => entry.dimension)) if (!present.has(dimension)) fail(`${unit.unitId} missing required coverage dimension ${dimension}`);
    if (unit.coverageGapAudit?.status !== "PASS" || unit.saturationAudit?.status !== "PASS" || unit.saturationAudit.unrepresentedCaseTypes.length) fail(`${unit.unitId} coverage or saturation audit is not PASS`);
  }
  const intents = await readJson("item-intent-matrix.json");
  if (intents.itemCount !== itemIds.length || intents.items.length !== itemIds.length) fail("item-intent matrix count mismatch");
  const ledger = await readJson("completion-ledger.json");
  if (ledger.globalAudit.knownSemanticDuplicates !== 0 || ledger.globalAudit.knownFillerItems !== 0 || ledger.globalAudit.structuralFailures !== 0 || ledger.globalAudit.missingReason !== 0 || ledger.globalAudit.missingDetails !== 0 || ledger.globalAudit.missingWrongOptionExplanation !== 0 || ledger.globalAudit.missingProvenance !== 0) fail("completion ledger reports a failed global audit");
  if (ledger.synthesizedCompetencies.length !== 40 || ledger.synthesizedCompetencies.some((entry) => entry.coverage !== "MAPPED_AND_EXERCISED" || entry.authoredItemCount < 1)) fail("competency coverage is not real for all 40 competencies");
  const evidence = await readJson("family-admission-evidence.json");
  if (evidence.runtimeAdmission !== "not_admitted" || evidence.publishingAdmission !== "not_admitted" || evidence.humanReview !== "pending" || evidence.mentalUnits.length !== 89) fail("family-admission evidence crosses the review boundary or is incomplete");
  console.log(JSON.stringify({ status: "PASS", nodes: Object.fromEntries(nodeCounts), mentalUnits: unitCounts.size, competencies: 40, questions: itemIds.length, semanticDuplicates: 0, fillerItems: 0, richerInteractionItems: richItems, runtimeAdmission: "not_admitted", publishingAdmission: "not_admitted", humanReview: "pending" }, null, 2));
}

if (process.argv[1] === new URL(import.meta.url).pathname) await main();

export { main };
