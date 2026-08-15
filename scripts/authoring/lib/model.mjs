import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const exec = promisify(execFile);
export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
export const TRACK_IDS = [
  "coding-interview-dsa-problem-solving",
  "aws-certified-solutions-architect-associate",
  "google-cloud-associate-cloud-engineer",
  "hashicorp-terraform-associate-004",
  "kubernetes-cloud-native-associate-kcna",
  "microsoft-azure-administrator-associate-az-104",
  "microsoft-azure-ai-fundamentals-ai-901",
  "backend-system-design-interview",
  "frontend-system-design-interview",
  "object-oriented-design-interview"
];
export const FAMILY_IDS = ["coding_interview", "certification", "design_interview"];
export const compare = (a, b) => a === b ? 0 : a < b ? -1 : 1;
export const canonical = (value) => {
  if (value === null || ["boolean", "number", "string"].includes(typeof value)) return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (!value || typeof value !== "object") throw new TypeError("Only JSON values are canonicalizable.");
  return `{${Object.keys(value).sort(compare).map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
};
export const canonicalJson = (value) => `${canonical(value)}\n`;
export const sha256 = (value) => createHash("sha256").update(value).digest("hex");
export const readJson = async (root, path) => JSON.parse(await readFile(join(root, path), "utf8"));
export const sorted = (values) => [...values].sort(compare);
export const nonEmpty = (value) => typeof value === "string" && value.trim().length > 0;

export class AuthoringFailure extends Error {
  constructor(code, message) {
    super(`${code}: ${message}`);
    this.code = code;
  }
}

async function walk(root) {
  let entries;
  try { entries = await readdir(root, { withFileTypes: true }); } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
  const nested = await Promise.all(entries.sort((a, b) => compare(a.name, b.name)).map((entry) => entry.isDirectory() ? walk(join(root, entry.name)) : [join(root, entry.name)]));
  return nested.flat();
}

export async function repoFiles(root, prefixes) {
  const result = [];
  for (const prefix of prefixes) {
    const target = join(root, prefix);
    let info;
    try { info = await stat(target); } catch (error) { if (error?.code === "ENOENT") continue; throw error; }
    if (info.isDirectory()) for (const path of await walk(target)) result.push(relative(root, path));
    else result.push(prefix);
  }
  return sorted([...new Set(result)]);
}

export async function gitSha(root) {
  return (await exec("git", ["rev-parse", "HEAD"], { cwd: root })).stdout.trim();
}

export async function validateSchema(value, schema, label = "document", rootSchema = schema, pointer = "") {
  if (schema?.$ref) {
    const target = schema.$ref.startsWith("#/") ? schema.$ref.slice(2).split("/").reduce((node, key) => node?.[key.replaceAll("~1", "/").replaceAll("~0", "~")], rootSchema) : undefined;
    if (!target) throw new AuthoringFailure("INVALID_SCHEMA", `${label} has an unresolved schema reference ${schema.$ref}.`);
    return validateSchema(value, target, label, rootSchema, schema.$ref);
  }
  if (schema?.const !== undefined && value !== schema.const) throw new AuthoringFailure("INVALID_SCHEMA", `${label} must equal ${JSON.stringify(schema.const)}.`);
  if (schema?.enum && !schema.enum.includes(value)) throw new AuthoringFailure("INVALID_SCHEMA", `${label} is outside its schema enum.`);
  if (schema?.type === "object") {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new AuthoringFailure("INVALID_SCHEMA", `${label} must be an object.`);
    for (const key of schema.required ?? []) if (!Object.hasOwn(value, key)) throw new AuthoringFailure("INVALID_SCHEMA", `${label}.${key} is required.`);
    if (schema.additionalProperties === false) for (const key of Object.keys(value)) if (!Object.hasOwn(schema.properties ?? {}, key)) throw new AuthoringFailure("INVALID_SCHEMA", `${label}.${key} is not allowed.`);
    for (const [key, child] of Object.entries(schema.properties ?? {})) if (value[key] !== undefined) await validateSchema(value[key], child, `${label}.${key}`, rootSchema, pointer);
    if (schema.additionalProperties && typeof schema.additionalProperties === "object") for (const [key, child] of Object.entries(value)) if (!Object.hasOwn(schema.properties ?? {}, key)) await validateSchema(child, schema.additionalProperties, `${label}.${key}`, rootSchema, pointer);
    return;
  }
  if (schema?.type === "array") {
    if (!Array.isArray(value)) throw new AuthoringFailure("INVALID_SCHEMA", `${label} must be an array.`);
    if (schema.minItems !== undefined && value.length < schema.minItems) throw new AuthoringFailure("INVALID_SCHEMA", `${label} must contain at least ${schema.minItems} entries.`);
    if (schema.uniqueItems && new Set(value.map(canonical)).size !== value.length) throw new AuthoringFailure("INVALID_SCHEMA", `${label} must contain unique entries.`);
    if (schema.items) for (const [index, child] of value.entries()) await validateSchema(child, schema.items, `${label}[${index}]`, rootSchema, pointer);
    return;
  }
  if (schema?.type === "string" && (typeof value !== "string" || (schema.minLength !== undefined && value.length < schema.minLength))) throw new AuthoringFailure("INVALID_SCHEMA", `${label} must be a non-empty string.`);
  if (schema?.type === "integer" && !Number.isInteger(value)) throw new AuthoringFailure("INVALID_SCHEMA", `${label} must be an integer.`);
  if (schema?.type === "boolean" && typeof value !== "boolean") throw new AuthoringFailure("INVALID_SCHEMA", `${label} must be boolean.`);
}

function unique(values, label) {
  if (new Set(values).size !== values.length) throw new AuthoringFailure("DUPLICATE_ID", `${label} contains duplicate IDs.`);
}

function modeIds(family) {
  return new Set((family.modes ?? []).map((mode) => mode.id ?? mode.modeId));
}

function designChoiceModeIds(family) {
  return new Set((family.modes ?? []).filter((mode) => String(mode.contractStatus ?? "").startsWith("choice_compatible")).map((mode) => mode.modeId));
}

function exactSet(left = [], right = []) { return canonicalJson(sorted(left)) === canonicalJson(sorted(right)); }

function sourceStatusForCertification(slot) {
  const requirements = slot.sourceRequirements ?? {};
  const official = requirements.officialObjective;
  const docs = requirements.directFirstPartyDocumentation ?? [];
  const unresolved = requirements.unresolvedRequirements ?? [];
  const directSourceRefs = docs.flatMap((entry) => entry.sourceRefs ?? []);
  const anchorIds = sorted([...new Set(docs.flatMap((entry) => entry.anchorPropertyRefs ?? []))]);
  const valid = official?.registryRef && (official.objectiveRefs ?? []).length > 0 && (official.sourceRefs ?? []).length > 0 && docs.length > 0 && directSourceRefs.length > 0 && anchorIds.length > 0 && unresolved.length === 0 && docs.every((entry) => entry.resolutionState === "resolved_exact_direct" && (entry.sourceRefs ?? []).length > 0 && (entry.anchorPropertyRefs ?? []).length > 0);
  const sourceRefs = sorted([...new Set([...(official?.sourceRefs ?? []), ...directSourceRefs])]);
  const claimIds = sorted(official?.objectiveRefs ?? []);
  return { admitted: !!valid, status: valid ? "exact_direct" : "blocked", reason: valid ? null : "missing_exact_direct_official_objective_source_or_anchor_binding", binding: valid ? { bindingId: `${slot.trackId}:${slot.slotId}:source-binding`, claimIds, anchorIds, sourceRefs } : null };
}

function sourceStatusForDesign(slot, registryBinding, handoffSlotIds) {
  if (slot.authoringStatus !== "authoring_admitted" || !handoffSlotIds.has(slot.slotId)) return { admitted: false, status: slot.authoringStatus ?? "not_admitted", reason: slot.authoringStatus === "blocked_by_source_or_interaction_contract" ? "canonical_slot_is_blocked_by_source_or_interaction_contract" : "canonical_slot_is_deferred_outside_the_pinned_authoring_roster", binding: registryBinding ?? null };
  if (!registryBinding || registryBinding.resolutionState !== "resolved_exact_direct") return { admitted: false, status: registryBinding?.resolutionState ?? "unresolved", reason: "missing_exact_direct_source_registry_binding", binding: registryBinding ?? null };
  return { admitted: true, status: "exact_direct", reason: null, binding: registryBinding };
}

function isFreeNode(track, nodeId) {
  const node = track.normalized.nodeById.get(nodeId);
  return nodeId === track.freeNodeId || node?.freeOrPremiumRole === "free";
}

function initialHandoffBlockIds(track, slots) {
  const ids = new Set(slots.filter((slot) => track.handoffSlotIds?.has(slot.slotId)).map((slot) => slot.learningBlockId));
  const firstSafeBatch = track.authoring?.firstSafeBatch;
  if (typeof firstSafeBatch === "string") {
    const parts = firstSafeBatch.split(":");
    const candidate = parts.length >= 3 ? parts.slice(1, -1).join(":").replaceAll("-", "_") : null;
    if (candidate && track.normalized.blockById.has(candidate)) ids.add(candidate);
  }
  return ids;
}

function priorityForBlock(track, block, slots, initialBlocks) {
  const admitted = block.authoringAdmittedItemCount > 0;
  const free = isFreeNode(track, block.nodeId);
  const multiMode = new Set(slots.flatMap((slot) => slot.modeEligibility)).size > 1;
  const diagnosticRisk = /failure|reliab|security|risk|concurr|evolution|boundary|migration|operat|incident/i.test(`${block.learningBlockId} ${slots.map((slot) => `${slot.objective ?? ""} ${slot.expectedDecision ?? ""}`).join(" ")}`);
  if (track.familyId === "coding_interview" && block.existingVerifiedItemCount > 0) return { priorityTier: "T0", priorityReasons: ["existing_coding_source_preservation"], isFreeNode: free, releaseSurfaceRole: free ? "free" : "premium", dependencyReason: null };
  if (!admitted) return { priorityTier: "T6", priorityReasons: ["no_authoring_admitted_slots"], isFreeNode: free, releaseSurfaceRole: free ? "free" : "premium", dependencyReason: block.blockingReasons.join("; ") || "source_or_interaction_contract" };
  if (free) return { priorityTier: "T1", priorityReasons: ["free_node_source_ready"], isFreeNode: true, releaseSurfaceRole: "free", dependencyReason: null };
  if (initialBlocks.has(block.learningBlockId)) return { priorityTier: "T2", priorityReasons: ["explicit_initial_authoring_handoff"], isFreeNode: false, releaseSurfaceRole: "premium", dependencyReason: null };
  if (multiMode) return { priorityTier: "T3", priorityReasons: ["foundational_multi_mode_contribution"], isFreeNode: false, releaseSurfaceRole: "premium", dependencyReason: null };
  if (diagnosticRisk) return { priorityTier: "T4", priorityReasons: ["diagnostic_risk_or_failure_boundary"], isFreeNode: false, releaseSurfaceRole: "premium", dependencyReason: null };
  return { priorityTier: "T5", priorityReasons: ["remaining_source_ready_block"], isFreeNode: false, releaseSurfaceRole: "premium", dependencyReason: null };
}

const priorityRank = (tier) => Number(String(tier).slice(1));

async function codingSourceIndex(root, curriculum) {
  const sourceRoot = join(root, "manual", "source", curriculum.trackId);
  const paths = (await repoFiles(root, [`manual/source/${curriculum.trackId}`])).filter((path) => path.endsWith(".json"));
  const blocks = curriculum.nodes.flatMap((node) => node.learningBlocks).map((block) => ({ ...block, nodeId: block.nodeId }));
  const byBlock = new Map(blocks.map((block) => [block.blockId, { sourcePaths: [], itemCount: 0 }]));
  for (const path of paths) {
    let batch;
    try { batch = JSON.parse(await readFile(join(root, path), "utf8")); } catch (error) { throw new AuthoringFailure("INVALID_SOURCE_JSON", `Coding source batch ${path} is not valid JSON: ${error.message}`); }
    const taxonomy = batch.taxonomy ?? {};
    const block = blocks.find((entry) => entry.nodeId === taxonomy.roadmapNodeId && String(entry.primaryDecisionModel ?? "").includes(taxonomy.primaryMentalUnitId));
    if (!block) throw new AuthoringFailure("CODING_SOURCE_MAPPING", `Coding source batch ${path} does not map to one canonical learning block.`);
    const entry = byBlock.get(block.blockId); entry.sourcePaths.push(path); entry.itemCount += (batch.items ?? []).length;
  }
  for (const entry of byBlock.values()) entry.sourcePaths.sort(compare);
  return { byBlock, paths, sourceRoot };
}

function flattenCurriculum(curriculum) {
  const nodes = curriculum.nodes ?? [];
  const blocks = curriculum.familyId === "coding_interview" ? nodes.flatMap((node) => (node.learningBlocks ?? []).map((block) => ({ ...block, nodeId: block.nodeId ?? node.nodeId }))) : curriculum.blockPlans ?? [];
  const blockById = new Map(blocks.map((block) => [block.blockId, block]));
  const nodeById = new Map(nodes.map((node) => [node.nodeId, node]));
  let slots;
  if (curriculum.familyId === "coding_interview") {
    slots = blocks.flatMap((block) => (block.coverageTargets ?? []).map((target) => ({
      slotId: target.coverageTargetId,
      trackId: curriculum.trackId,
      nodeId: block.nodeId,
      learningBlockId: block.blockId,
      plannedItemCount: target.requiredVariantCount,
      interactionType: target.preferredInteractionContract,
      selectionMode: target.preferredInteractionContract === "choice" ? "single" : "unsupported",
      eligibleModes: target.modeRoles ?? [],
      objective: target.learningObjective,
      decision: target.diagnosticDecision,
      boundary: target.decisiveBoundary,
      transferBoundary: target.transferBoundary,
      sourceRequirements: target.sourceRequirements ?? [],
      sourceStatus: { admitted: true, status: "existing_contract", reason: null, binding: null },
      raw: target
    })));
  } else {
    slots = (curriculum.slots ?? []).map((slot) => ({
      ...slot,
      learningBlockId: slot.blockId,
      plannedItemCount: 1,
      interactionType: slot.deliveryInteraction?.interactionType,
      selectionMode: slot.deliveryInteraction?.selectionMode ?? "single",
      eligibleModes: slot.eligibleModes ?? slot.modeIntentRefs ?? [],
      objective: slot.questionIntent ?? slot.assessmentIntent ?? slot.plannedAssessmentIntent,
      decision: slot.expectedOutcome?.resolution,
      boundary: slot.decisiveBoundary,
      transferBoundary: slot.transferBoundary,
      raw: slot
    }));
  }
  unique(slots.map((slot) => slot.slotId), `${curriculum.trackId} slot IDs`);
  for (const slot of slots) {
    if (!nodeById.has(slot.nodeId) || !blockById.has(slot.learningBlockId)) throw new AuthoringFailure("CURRICULUM_MAPPING", `${curriculum.trackId} slot ${slot.slotId} has an unknown node or learning block.`);
    if (blockById.get(slot.learningBlockId).nodeId !== slot.nodeId) throw new AuthoringFailure("CURRICULUM_MAPPING", `${curriculum.trackId} slot ${slot.slotId} crosses its learning block node.`);
  }
  return { nodes, blocks, slots, nodeById, blockById };
}

export async function loadAuthoringModel(root = ROOT) {
  const familyPaths = (await repoFiles(root, ["config/authoring/families"])).filter((path) => path.endsWith(".json"));
  const trackPaths = (await repoFiles(root, ["config/authoring/tracks"])).filter((path) => path.endsWith(".json"));
  const families = new Map((await Promise.all(familyPaths.map(async (path) => [path, await readJson(root, path)]))).map(([path, value]) => [value.familyId, { ...value, path }]));
  const familyConfigs = new Map((await Promise.all(FAMILY_IDS.map(async (familyId) => [familyId, await readJson(root, `config/families/${familyId}.json`)]))).map(([familyId, value]) => [familyId, value]));
  const registrations = new Map((await Promise.all(trackPaths.map(async (path) => [path, await readJson(root, path)]))).map(([path, value]) => [value.trackId, { ...value, path }]));
  if (families.size !== 3 || FAMILY_IDS.some((id) => !families.has(id))) throw new AuthoringFailure("REGISTRY_COVERAGE", "Authoring registry must contain exactly the three current families.");
  if (registrations.size !== TRACK_IDS.length || TRACK_IDS.some((id) => !registrations.has(id))) throw new AuthoringFailure("REGISTRY_COVERAGE", "Authoring registry must contain exactly the ten current tracks.");
  const curricula = new Map();
  for (const trackId of TRACK_IDS) {
    const registration = registrations.get(trackId);
    const curriculum = await readJson(root, registration.curriculumPath);
    const brief = await readJson(root, registration.trackBriefPath);
    if (curriculum.trackId !== trackId || curriculum.familyId !== registration.familyId || brief.trackId !== trackId) throw new AuthoringFailure("REGISTRY_IDENTITY", `${trackId} registration does not match its canonical curriculum and brief.`);
    for (const path of [registration.curriculumPath, registration.trackBriefPath, registration.familySourceSchemaPath, ...registration.taxonomyPaths, ...registration.sourceRegistryPaths, registration.examOrModeProfilePath]) {
      try { await stat(join(root, path)); } catch { throw new AuthoringFailure("REGISTRY_PATH", `${trackId} registration points to missing path ${path}.`); }
    }
    if (registration.familyId !== "coding_interview" && (!registration.authoringVersion?.contentVersion || registration.authoringVersion.taxonomyVersionSource !== "curriculumVersion")) throw new AuthoringFailure("VERSION_OWNER", `${trackId} must declare an explicit authoring content version sourced from curriculumVersion taxonomy identity.`);
    curricula.set(trackId, { ...curriculum, brief, registration, family: families.get(registration.familyId), familyConfig: familyConfigs.get(registration.familyId), normalized: flattenCurriculum(curriculum) });
  }
  const designRegistry = await readJson(root, "config/design-interview-source-registry.json");
  const designBindings = new Map((designRegistry.slotBindings ?? []).map((binding) => [binding.slotId, binding]));
  for (const track of curricula.values()) {
    if (track.familyId === "design_interview") {
      const handoff = track.familyConfig.authoringHandoffs?.find((entry) => entry.trackId === track.trackId);
      track.handoff = handoff;
      track.handoffSlotIds = new Set(handoff?.slotBindings?.map((entry) => entry.slotId) ?? []);
    }
  }
  return { families, registrations, curricula, designRegistry, designBindings };
}

export async function buildTrackPlan(root, track, model) {
  const normalized = track.normalized;
  const codingIndex = track.familyId === "coding_interview" ? await codingSourceIndex(root, track) : { byBlock: new Map(), paths: [] };
  const slotPlans = normalized.slots.map((slot) => {
    let sourceStatus;
    if (track.familyId === "certification") sourceStatus = sourceStatusForCertification(slot);
    else if (track.familyId === "design_interview") {
      sourceStatus = sourceStatusForDesign(slot, model.designBindings.get(slot.slotId), track.handoffSlotIds);
      if (sourceStatus.binding) {
        const sourceRefs = [...new Set((sourceStatus.binding.anchorIds ?? []).map((anchorId) => model.designRegistry.anchorRecords?.find((anchor) => anchor.anchorId === anchorId)?.sourceId).filter(Boolean))].sort(compare);
        sourceStatus = { ...sourceStatus, binding: { bindingId: sourceStatus.binding.bindingId, claimIds: sourceStatus.binding.claimIds ?? [], anchorIds: sourceStatus.binding.anchorIds ?? [], sourceRefs } };
      }
    }
    else sourceStatus = { admitted: true, status: "existing_contract", reason: null, binding: null };
    const block = normalized.blockById.get(slot.learningBlockId);
    const sourcePath = track.familyId === "coding_interview" ? codingIndex.byBlock.get(block.blockId)?.sourcePaths?.[0] ?? null : `manual/source/${track.trackId}/${slot.nodeId}/${slot.learningBlockId}.json`;
    const sourceWritable = track.familyId !== "coding_interview" && sourceStatus.admitted;
    const allowedModes = track.familyId === "design_interview" ? [...designChoiceModeIds(track.family)].filter((id) => (slot.eligibleModes ?? []).includes(id)).sort(compare) : [...(slot.eligibleModes ?? [])].sort(compare);
    return {
      slotId: slot.slotId,
      nodeId: slot.nodeId,
      learningBlockId: slot.learningBlockId,
      plannedItemCount: slot.plannedItemCount,
      existingVerifiedItemCount: 0,
      authoringAdmittedItemCount: track.familyId === "coding_interview" ? slot.plannedItemCount : sourceStatus.admitted ? slot.plannedItemCount : 0,
      blockedItemCount: sourceStatus.admitted ? 0 : slot.plannedItemCount,
      authoringAdmitted: sourceStatus.admitted,
      objective: slot.objective ?? null,
      expectedDecision: slot.decision ?? null,
      decisiveBoundary: slot.boundary ?? null,
      transferBoundary: slot.transferBoundary ?? null,
      interaction: { type: slot.interactionType ?? null, selectionMode: slot.selectionMode ?? null },
      modeEligibility: allowedModes,
      sourceStatus: sourceStatus.status,
      sourceBinding: sourceStatus.binding,
      blockingReasons: sourceStatus.reason ? [sourceStatus.reason] : [],
      plannedSourcePath: sourceWritable || track.familyId === "coding_interview" ? sourcePath : null,
      eventualSourcePath: sourcePath,
      writableSourcePaths: sourceWritable ? [sourcePath] : track.familyId === "coding_interview" ? (codingIndex.byBlock.get(block.blockId)?.sourcePaths ?? []) : [],
      plannedAuthoringBriefPath: sourceWritable ? `manual/source/${track.trackId}/${slot.nodeId}/${slot.learningBlockId}.authoring.md` : null
    };
  });
  const initialBlocks = initialHandoffBlockIds(track, slotPlans);
  const byBlock = new Map();
  for (const block of normalized.blocks) {
    const slots = slotPlans.filter((slot) => slot.learningBlockId === block.blockId);
    const sourcePaths = track.familyId === "coding_interview" ? (codingIndex.byBlock.get(block.blockId)?.sourcePaths ?? []) : sorted([...new Set(slots.filter((slot) => slot.authoringAdmitted).map((slot) => slot.eventualSourcePath).filter(Boolean))]);
    const existingVerifiedItemCount = track.familyId === "coding_interview" ? codingIndex.byBlock.get(block.blockId)?.itemCount ?? 0 : 0;
    const plannedItemCount = slots.reduce((sum, slot) => sum + slot.plannedItemCount, 0);
    const remainingItemCount = Math.max(0, plannedItemCount - existingVerifiedItemCount);
    const admitted = slots.some((slot) => slot.authoringAdmitted);
    const action = track.familyId === "coding_interview" ? existingVerifiedItemCount && remainingItemCount ? "extend_existing_after_separate_review" : "preserve_existing" : admitted ? "create_authoring_brief" : "blocked_source";
    const blockAuthoringAdmittedItemCount = track.familyId === "coding_interview" ? remainingItemCount : slots.reduce((sum, slot) => sum + slot.authoringAdmittedItemCount, 0);
    const blockBlockedItemCount = track.familyId === "coding_interview" ? 0 : slots.reduce((sum, slot) => sum + slot.blockedItemCount, 0);
    const blockPlan = {
      nodeId: block.nodeId,
      learningBlockId: block.blockId,
      plannedItemCount,
      existingVerifiedItemCount,
      remainingItemCount,
      authoringAdmittedItemCount: blockAuthoringAdmittedItemCount,
      blockedItemCount: blockBlockedItemCount,
      plannedSourcePath: sourcePaths[0] ?? null,
      sourcePaths: sorted(sourcePaths),
      plannedAuthoringBriefPath: admitted && track.familyId !== "coding_interview" ? `manual/source/${track.trackId}/${block.nodeId}/${block.blockId}.authoring.md` : null,
      action,
      blockingReasons: [...new Set(slots.flatMap((slot) => slot.blockingReasons))],
      slotIds: slots.map((slot) => slot.slotId)
    };
    Object.assign(blockPlan, priorityForBlock(track, blockPlan, slots, initialBlocks));
    blockPlan.isInitialAuthoringBatch = initialBlocks.has(block.blockId) && blockPlan.authoringAdmittedItemCount > 0;
    byBlock.set(block.blockId, blockPlan);
  }
  const plannedItemCount = track.familyId === "coding_interview" ? track.targetItemCount : normalized.slots.reduce((sum, slot) => sum + slot.plannedItemCount, 0);
  const existingVerifiedItemCount = track.familyId === "coding_interview" ? track.existingVerifiedItemCount : 0;
  const remainingItemCount = Math.max(0, plannedItemCount - existingVerifiedItemCount);
  const authoringAdmittedItemCount = track.familyId === "coding_interview" ? remainingItemCount : slotPlans.reduce((sum, slot) => sum + slot.authoringAdmittedItemCount, 0);
  const blockedItemCount = slotPlans.reduce((sum, slot) => sum + slot.blockedItemCount, 0);
  const sourcePaths = sorted([...new Set([...byBlock.values()].flatMap((block) => block.sourcePaths))]);
  const interactionDistribution = Object.fromEntries([...slotPlans.reduce((map, slot) => map.set(slot.interaction.type, (map.get(slot.interaction.type) ?? 0) + slot.plannedItemCount), new Map())].sort(([a], [b]) => compare(a, b)));
  const modeContribution = Object.fromEntries([...slotPlans.reduce((map, slot) => { for (const mode of slot.modeEligibility) map.set(mode, (map.get(mode) ?? 0) + slot.plannedItemCount); return map; }, new Map())].sort(([a], [b]) => compare(a, b)));
  const runtimePublicationReadiness = track.familyId === "coding_interview" && sourcePaths.length > 0 && track.registration.examOrModeProfilePath.startsWith("config/tracks/") ? "admitted_for_existing_coding_pipeline" : "not_admitted";
  const taxonomyVersion = track.familyId === "coding_interview" ? null : track.curriculumVersion;
  const contentVersion = track.familyId === "coding_interview" ? null : track.registration.authoringVersion.contentVersion;
  const learningBlocks = normalized.blocks.map((block) => byBlock.get(block.blockId));
  return {
    trackId: track.trackId,
    familyId: track.familyId,
    curriculumVersion: track.curriculumVersion,
    taxonomyVersion,
    contentVersion,
    plannedItemCount,
    existingVerifiedItemCount,
    remainingItemCount,
    authoringAdmittedItemCount,
    blockedItemCount,
    plannedNodeCount: normalized.nodes.length,
    plannedLearningBlockCount: normalized.blocks.length,
    plannedFutureSourceFileCount: sourcePaths.length,
    existingSourceFileCount: codingIndex.paths.length,
    sourceReadyBlockCount: learningBlocks.filter((block) => track.familyId === "coding_interview" ? block.sourcePaths.length > 0 : block.authoringAdmittedItemCount > 0).length,
    freeNodeSourceReadyBlockCount: learningBlocks.filter((block) => track.familyId === "coding_interview" ? block.isFreeNode && block.sourcePaths.length > 0 : block.authoringAdmittedItemCount > 0 && block.isFreeNode).length,
    authoringReadiness: blockedItemCount > 0 ? "READY_FOR_AUTHORING_WITH_EXPLICIT_BLOCKS" : "READY_FOR_AUTHORING",
    runtimePublicationReadiness,
    interactionDistribution,
    modeContribution,
    sourceProvenanceSummary: {
      admittedSlots: slotPlans.filter((slot) => slot.authoringAdmitted).length,
      blockedSlots: slotPlans.filter((slot) => !slot.authoringAdmitted).length,
      exactDirectSlots: slotPlans.filter((slot) => slot.sourceStatus === "exact_direct").length,
      existingContractSlots: slotPlans.filter((slot) => slot.sourceStatus === "existing_contract").length
    },
    nodes: normalized.nodes.map((node) => ({ nodeId: node.nodeId, learningBlockIds: normalized.blocks.filter((block) => block.nodeId === node.nodeId).map((block) => block.blockId), slotCount: slotPlans.filter((slot) => slot.nodeId === node.nodeId).reduce((sum, slot) => sum + slot.plannedItemCount, 0) })),
    learningBlocks,
    slots: slotPlans.sort((a, b) => compare(a.slotId, b.slotId)),
    wavePriority: learningBlocks.filter((block) => block.authoringAdmittedItemCount > 0).sort((a, b) => priorityRank(a.priorityTier) - priorityRank(b.priorityTier) || compare(a.learningBlockId, b.learningBlockId)).map((block) => block.learningBlockId)
  };
}

export async function buildManifest(root = ROOT, options = {}) {
  const generatedAt = options.generatedAt ?? process.env.AUTHORING_AUDIT_DATE ?? new Date().toISOString().slice(0, 10);
  const startingSha = options.startingSha ?? process.env.AUTHORING_STARTING_SHA ?? await gitSha(root);
  const repositorySha = await gitSha(root);
  const model = await loadAuthoringModel(root);
  const tracks = [];
  for (const track of model.curricula.values()) tracks.push(await buildTrackPlan(root, track, model));
  tracks.sort((a, b) => compare(a.trackId, b.trackId));
  const trackOrder = new Map(TRACK_IDS.map((trackId, index) => [trackId, index]));
  const blockOrder = new Map();
  for (const track of model.curricula.values()) blockOrder.set(track.trackId, new Map(track.normalized.blocks.map((block, index) => [block.blockId, index])));
  const orderedBlocks = tracks.flatMap((track) => track.learningBlocks.map((block) => ({ track, block, trackIndex: trackOrder.get(track.trackId), blockIndex: blockOrder.get(track.trackId).get(block.learningBlockId) })));
  orderedBlocks.sort((left, right) => priorityRank(left.block.priorityTier) - priorityRank(right.block.priorityTier) || left.trackIndex - right.trackIndex || left.blockIndex - right.blockIndex || compare(left.block.learningBlockId, right.block.learningBlockId));
  let sequence = 1;
  for (const entry of orderedBlocks) {
    entry.block.authoringSequence = entry.block.authoringAdmittedItemCount > 0 ? sequence++ : null;
  }
  const firstEntry = orderedBlocks.find((entry) => entry.track.familyId !== "coding_interview" && entry.block.authoringAdmittedItemCount > 0 && entry.block.plannedSourcePath);
  const firstSlots = firstEntry ? firstEntry.track.slots.filter((slot) => slot.learningBlockId === firstEntry.block.learningBlockId && slot.authoringAdmitted) : [];
  const firstRealAuthoringBatch = firstEntry ? {
    schemaVersion: "patternly-first-real-authoring-batch-v1",
    trackId: firstEntry.track.trackId,
    familyId: firstEntry.track.familyId,
    nodeId: firstEntry.block.nodeId,
    learningBlockId: firstEntry.block.learningBlockId,
    path: firstEntry.block.plannedSourcePath,
    plannedItemCount: firstEntry.block.plannedItemCount,
    authoringAdmittedItemCount: firstEntry.block.authoringAdmittedItemCount,
    blockedItemCount: firstEntry.block.blockedItemCount,
    slotIds: firstSlots.map((slot) => slot.slotId),
    taxonomyVersion: firstEntry.track.taxonomyVersion,
    contentVersion: firstEntry.track.contentVersion,
    sourceBindingIds: [...new Set(firstSlots.map((slot) => slot.sourceBinding?.bindingId).filter(Boolean))].sort(compare),
    interactionAllocation: Object.fromEntries([...firstSlots.reduce((counts, slot) => counts.set(`${slot.interaction.type}/${slot.interaction.selectionMode}`, (counts.get(`${slot.interaction.type}/${slot.interaction.selectionMode}`) ?? 0) + 1), new Map())].sort(([left], [right]) => compare(left, right))),
    modeContribution: [...new Set(firstSlots.flatMap((slot) => slot.modeEligibility))].sort(compare),
    priorityTier: firstEntry.block.priorityTier,
    priorityReasons: firstEntry.block.priorityReasons,
    reason: "First non-Coding source-ready block in the canonical product-driven priority sequence; free-node source readiness precedes premium handoffs.",
    validation: { command: "npm run authoring:validate", familySchema: model.curricula.get(firstEntry.track.trackId).registration.familySourceSchemaPath, semanticValidator: firstEntry.track.familyId === "design_interview" ? "design_interview_manual_source_v1" : "certification_manual_source_v2" },
    humanReviewHandoff: { required: true, approvalStatus: "unapproved", reviewRecordPath: null, requiredBefore: ["approval", "runtime_admission", "publication"] }
  } : null;
  const inputPaths = await repoFiles(root, ["config/curricula", "docs/track-briefs", "config/families", "config/certification-objective-registries", "config/design-interview-source-registry.json", "config/tracks", "config/authoring", "schemas/authoring", "schemas/publishing", "config/taxonomy", "manual/source"]);
  const inputEntries = await Promise.all(inputPaths.map(async (path) => [path, sha256(await readFile(join(root, path)))]));
  const auditInputFingerprint = sha256(canonicalJson({ schemaVersion: "patternly-authoring-audit-input-v1", files: inputEntries.sort(([a], [b]) => compare(a, b)) }));
  const manifest = {
    schemaVersion: "patternly-authoring-scaffold-manifest-v1",
    startingSha,
    repositorySha,
    auditedAt: generatedAt,
    auditInputSha: auditInputFingerprint,
    auditInputFingerprint,
    generatedAt,
    trackCount: tracks.length,
    trackIds: tracks.map((track) => track.trackId),
    tracks,
    planningGateResult: "READY_FOR_SCAFFOLDING_WITH_EXPLICIT_BLOCKS",
    firstRealAuthoringBatch,
    gateResult: firstRealAuthoringBatch ? "READY_FOR_FIRST_REAL_BOUNDED_AUTHORING_BATCH" : "BLOCKED_NO_FIRST_REAL_AUTHORING_BATCH"
  };
  const generatedOutputFingerprint = sha256(canonicalJson(manifest));
  return { model, manifest, inputEntries, auditInputFingerprint, generatedOutputFingerprint };
}

export async function sourceHashEntries(root = ROOT) {
  const paths = (await repoFiles(root, ["manual/source"])).filter((path) => path.endsWith(".json"));
  return Promise.all(paths.map(async (path) => ({ path, sha256: sha256(await readFile(join(root, path))) })));
}

export function sourceBindingForSlot(manifestSlot) {
  return manifestSlot.sourceBinding ?? null;
}
