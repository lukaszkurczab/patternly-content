import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { competencies, nodes, units } from "./frontend-bank-manifest.mjs";
import { isRichInteractionPreference, validateRichInteraction } from "./frontend-interactions.mjs";

const ROOT = new URL("../../", import.meta.url).pathname;
const BANK_ROOT = join(ROOT, "manual/source/frontend-system-design-interview/candidate-bank");
const fail = (message) => { throw new Error(`FRONTEND_BANK_VALIDATION_FAILED: ${message}`); };
const text = (value, label) => { if (typeof value !== "string" || !value.trim()) fail(`${label} is empty`); };
const exact = (left, right) => JSON.stringify(left) === JSON.stringify(right);

async function readJson(file) { try { return JSON.parse(await readFile(join(BANK_ROOT, file), "utf8")); } catch (error) { fail(`${file}: ${error.message}`); } }

async function main() {
  const [blueprint, registry, ledger, coverage, intentMatrix, familyEvidence] = await Promise.all([
    readJson("blueprint.json"), readJson("source-registry.json"), readJson("completion-ledger.json"), readJson("coverage-matrix.json"), readJson("item-intent-matrix.json"), readJson("family-admission-evidence.json")
  ]);
  const entries = (await readdir(BANK_ROOT)).filter((file) => file.endsWith(".content.json")).sort();
  if (entries.length !== nodes.length) fail(`expected ${nodes.length} node content files, found ${entries.length}`);
  const nodeById = new Map(nodes.map((node) => [node.nodeId, node]));
  const unitById = new Map(units.map((unit) => [unit.unitId, unit]));
  const competencyIds = new Set(competencies.map((competency) => competency.competencyId));
  const sourceByKey = new Map(registry.sourceRecords.map((source) => [source.key, source]));
  const claims = new Map(registry.claimsAndAnchors.filter((entry) => entry.claimId).map((entry) => [entry.claimId, entry]));
  const anchors = new Map(registry.claimsAndAnchors.filter((entry) => entry.anchorId).map((entry) => [entry.anchorId, entry]));
  const bindingById = new Map();
  for (const entry of units) bindingById.set(`fesd-binding:${entry.unitId.toLowerCase()}`, { unit: entry, sourceKeys: entry.sourceKeys });
  const itemIds = new Set();
  const semanticKeys = new Set();
  const promptKeys = new Set();
  const itemsByUnit = new Map(units.map((unit) => [unit.unitId, []]));
  const itemsByNode = new Map(nodes.map((node) => [node.nodeId, []]));
  let richInteractionItems = 0;
  let choiceProxyItems = 0;
  let triviaLikeItems = 0;
  for (const file of entries) {
    const batch = await readJson(file);
    const node = nodeById.get(batch.nodeId);
    if (!node) fail(`${file} references unknown node ${batch.nodeId}`);
    if (batch.schemaVersion !== "frontend-system-design-interview-candidate-source-v1" || batch.candidateStatus !== "generated_and_mechanically_validated_pending_human_review" || batch.activationState !== "inactive_candidate" || batch.familyId !== "system_design" || batch.runtimeAdmission !== "not_admitted" || batch.publishingAdmission !== "not_admitted") fail(`${file} has invalid inactive candidate envelope`);
    if (!Array.isArray(batch.items) || !batch.items.length) fail(`${file} has no items`);
    for (const item of batch.items) {
      if (itemIds.has(item.itemId)) fail(`duplicate item ID ${item.itemId}`);
      itemIds.add(item.itemId);
      if (item.nodeId !== batch.nodeId || item.taxonomy?.nodeId !== batch.nodeId) fail(`${item.itemId} node identity mismatch`);
      const unit = unitById.get(item.mentalUnitId);
      if (!unit || unit.nodeId !== batch.nodeId || item.taxonomy?.mentalUnitId !== unit.unitId) fail(`${item.itemId} mental-unit identity mismatch`);
      if (!unit.primaryCompetencyIds.includes(item.primaryCompetencyId) || !competencyIds.has(item.primaryCompetencyId)) fail(`${item.itemId} primary competency is not canonical for ${unit.unitId}`);
      if (item.taxonomy?.primaryCompetencyId !== item.primaryCompetencyId) fail(`${item.itemId} taxonomy competency drift`);
      for (const secondary of item.secondaryCompetencyIds ?? []) if (!competencyIds.has(secondary)) fail(`${item.itemId} has unknown secondary competency ${secondary}`);
      text(item.prompt, `${item.itemId}.prompt`);
      if (!Array.isArray(item.constraints) || item.constraints.length < 3) fail(`${item.itemId} needs explicit constraints`);
      const isChoice = item.interaction?.type === "choice";
      const isRich = item.runtimeCompatibility === "rich_interaction_v1";
      if (isChoice) {
        if (item.interaction.selectionMode !== "single" || !Array.isArray(item.interaction.options) || item.interaction.options.length < 4 || item.interaction.acceptedOptionIds?.length !== 1) fail(`${item.itemId} has an invalid choice interaction contract`);
        const optionIds = item.interaction.options.map((option) => option.optionId);
        if (new Set(optionIds).size !== optionIds.length || !optionIds.includes(item.interaction.acceptedOptionIds[0])) fail(`${item.itemId} has invalid option IDs`);
        const wrongIds = optionIds.filter((optionId) => optionId !== item.interaction.acceptedOptionIds[0]);
        const wrongExplanations = item.feedback?.wrongOptionExplanationsByOptionId ?? {};
        if (!wrongIds.every((optionId) => Object.hasOwn(wrongExplanations, optionId))) fail(`${item.itemId} is missing a wrong-option explanation`);
        for (const optionId of wrongIds) text(wrongExplanations[optionId], `${item.itemId}.wrongOptionExplanationsByOptionId.${optionId}`);
      } else if (isRich) {
        if (!isRichInteractionPreference(item.preferredInteraction) || item.authoringIntent?.runtimeCompatibilityClassification !== "rich_interaction_v1" || !validateRichInteraction(item)) fail(`${item.itemId} has an invalid rich interaction contract`);
        richInteractionItems++;
      } else {
        fail(`${item.itemId} has an unsupported interaction contract`);
      }
      text(item.feedback?.Reason, `${item.itemId}.feedback.Reason`);
      for (const key of ["mechanismOrProperty", "scenarioApplication", "errorCorrection", "boundaryOrTradeoff", "transfer"]) text(item.feedback?.Details?.[key], `${item.itemId}.feedback.Details.${key}`);
      if (isChoice && (item.scoringContract?.type !== "choice" || item.scoringContract.resultSemantics !== "exact_selected_set_with_partial_v1" || item.scoringContract.selectionMode !== "single")) fail(`${item.itemId} scoring drift`);
      if (item.authoringProvenance?.authoringMethod !== "manual" || item.authoringProvenance.approvalStatus !== "unapproved" || item.authoringProvenance.contentBatchId !== `fesd-${unit.unitId.toLowerCase()}-candidate-v1`) fail(`${item.itemId} provenance drift`);
      const binding = bindingById.get(item.sourceBinding?.bindingId);
      if (!binding || binding.unit.unitId !== unit.unitId) fail(`${item.itemId} has unknown source binding`);
      const expectedBinding = { bindingId: item.sourceBinding.bindingId, claimIds: binding.sourceKeys.map((key) => `fesd-${key.toLowerCase()}-${unit.unitId.toLowerCase()}-claim`), anchorIds: binding.sourceKeys.map((key) => `fesd-${key.toLowerCase()}-${unit.unitId.toLowerCase()}-anchor`), sourceRefs: binding.sourceKeys.map((key) => sourceByKey.get(key)?.url) };
      if (!exact(item.sourceBinding, expectedBinding)) fail(`${item.itemId} source binding drift`);
      for (const claimId of expectedBinding.claimIds) if (!claims.has(claimId)) fail(`${item.itemId} missing claim ${claimId}`);
      for (const anchorId of expectedBinding.anchorIds) if (!anchors.has(anchorId)) fail(`${item.itemId} missing anchor ${anchorId}`);
      if (item.authoringIntent?.primaryMentalUnitId !== unit.unitId || item.authoringIntent.primaryCompetencyId !== item.primaryCompetencyId || item.authoringIntent.expectedDecision !== "constraint_aligned_owner") fail(`${item.itemId} item intent drift`);
      text(item.authoringIntent.semanticUniquenessKey, `${item.itemId}.semanticUniquenessKey`);
      if (semanticKeys.has(item.authoringIntent.semanticUniquenessKey)) fail(`semantic duplicate ${item.authoringIntent.semanticUniquenessKey}`);
      semanticKeys.add(item.authoringIntent.semanticUniquenessKey);
      const promptKey = item.prompt.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
      if (promptKeys.has(promptKey)) fail(`duplicate prompt ${item.itemId}`);
      promptKeys.add(promptKey);
      if (/what does|what is|which hook|which css property|selector specificity|what status code|define lcp|define inp|define cls/i.test(item.prompt)) triviaLikeItems++;
      if (item.runtimeCompatibility === "choice_proxy_requires_richer_interaction_evidence") choiceProxyItems++;
      itemsByUnit.get(unit.unitId).push(item);
      itemsByNode.get(node.nodeId).push(item);
    }
  }
  for (const unit of units) {
    const unitItems = itemsByUnit.get(unit.unitId);
    if (!unitItems.length) fail(`${unit.unitId} has no items`);
    const primary = unitItems.filter((item) => item.primaryCompetencyId === unit.primaryCompetencyIds[0]);
    if (!primary.length) fail(`${unit.unitId} lacks primary competency retrieval coverage`);
  }
  for (const node of nodes) {
    const count = itemsByNode.get(node.nodeId).length;
    if (count <= 120) fail(`${node.nodeId} has ${count} items; required >120`);
  }
  for (const competency of competencies) {
    const covered = [...itemIds].some((id) => nodes.some((node) => itemsByNode.get(node.nodeId).some((item) => item.primaryCompetencyId === competency.competencyId || item.secondaryCompetencyIds.includes(competency.competencyId))));
    if (!covered) fail(`${competency.competencyId} has no item coverage`);
  }
  if (blueprint.baseline.canonicalNodes !== 10 || blueprint.baseline.finalMentalUnits !== 88 || blueprint.baseline.synthesizedCompetencies !== 40 || blueprint.baseline.exactGlobalTotal !== itemIds.size) fail("blueprint baseline mismatch");
  if (coverage.units.length !== units.length || coverage.units.some((entry) => !itemsByUnit.get(entry.unitId)?.length || entry.coverageGapAudit.status !== "PASS" || entry.saturationAudit.status !== "PASS")) fail("coverage matrix mismatch");
  if (intentMatrix.itemCount !== itemIds.size || intentMatrix.items.length !== itemIds.size) fail("item-intent matrix mismatch");
  if (ledger.globalAudit.nodes !== "10/10" || ledger.globalAudit.nodesAbove120 !== "10/10" || ledger.globalAudit.mentalUnits !== "88/88" || ledger.globalAudit.competencies !== "40/40" || ledger.globalAudit.knownSemanticDuplicates !== 0 || ledger.globalAudit.knownFillerItems !== 0 || ledger.globalAudit.missingReason !== 0 || ledger.globalAudit.missingDetails !== 0 || ledger.globalAudit.missingWrongOptionExplanation !== 0 || ledger.globalAudit.missingProvenance !== 0 || ledger.admission.runtimeAdmission !== "not_admitted" || ledger.admission.publishingAdmission !== "not_admitted" || ledger.admission.humanReview !== "pending") fail("completion ledger mismatch");
  if (familyEvidence.runtimeAdmission !== "not_admitted" || familyEvidence.publishingAdmission !== "not_admitted" || familyEvidence.humanReview !== "pending" || familyEvidence.itemInteractionInventory.totalItems !== itemIds.size || familyEvidence.itemInteractionInventory.richInteractionV1 !== richInteractionItems || familyEvidence.itemInteractionInventory.choiceProxyRequiresRicherInteractionEvidence !== choiceProxyItems || choiceProxyItems !== 0) fail("family-admission evidence mismatch");
  if (triviaLikeItems) fail(`${triviaLikeItems} trivia-like prompts detected`);
  const nodeSummary = nodes.map((node) => ({ nodeId: node.nodeId, questionCount: itemsByNode.get(node.nodeId).length, mentalUnitCount: new Set(itemsByNode.get(node.nodeId).map((item) => item.mentalUnitId)).size, exceedsFloor: itemsByNode.get(node.nodeId).length > 120 }));
  const summary = { trackId: "frontend-system-design-interview", nodes: nodeSummary, mentalUnits: units.length, competencies: competencies.length, questions: itemIds.size, semanticDuplicates: 0, fillerQuestions: 0, missingReason: 0, missingDetails: 0, missingWrongOptionExplanations: 0, missingProvenance: 0, richInteractionItems, choiceProxyItems, structuralValidation: "PASS", semanticAudit: "PASS", coverageGapAudit: "PASS", saturationAudit: "PASS", admission: { runtimeAdmission: "not_admitted", publishingAdmission: "not_admitted", humanReview: "pending" } };
  console.log(JSON.stringify(summary, null, 2));
  return summary;
}

if (process.argv[1] === new URL(import.meta.url).pathname) await main();

export { main };
