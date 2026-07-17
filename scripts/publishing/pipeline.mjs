import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, readFile, readdir, rename, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const exec = promisify(execFile);
export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export class PublishingFailure extends Error { constructor(code, message) { super(`${code}: ${message}`); this.code = code; } }
const compare = (left, right) => left === right ? 0 : left < right ? -1 : 1;
export const hash = (value) => createHash("sha256").update(value).digest("hex");
export const CANONICAL_SERIALIZATION_VERSION = "canonical-json-v1";
export const SIMULATION_SOLVER_LIMIT = 50_000;
const canonical = (value) => {
  if (value === null || ["boolean", "number", "string"].includes(typeof value)) return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (!value || typeof value !== "object") throw new TypeError("Canonical serialization accepts JSON values only.");
  return `{${Object.keys(value).sort(compare).map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
};
export const canonicalJson = (value) => `${canonical(value)}\n`;
const canonicalHash = (value) => hash(`${CANONICAL_SERIALIZATION_VERSION}\n${canonical(value)}`);
const text = (value, label, code = "INVALID_ENVELOPE") => { if (typeof value !== "string" || !value.trim()) throw new PublishingFailure(code, `${label} must be a non-empty string.`); return value; };
const list = (value, label, code = "INVALID_ENVELOPE") => { if (!Array.isArray(value)) throw new PublishingFailure(code, `${label} must be an array.`); return value; };
const record = (value, label, code = "INVALID_ENVELOPE") => { if (!value || typeof value !== "object" || Array.isArray(value)) throw new PublishingFailure(code, `${label} must be an object.`); return value; };
const unique = (values, code, label) => { if (new Set(values).size !== values.length) throw new PublishingFailure(code, `${label} must not contain duplicates.`); };
const ids = (values, label, code = "DUPLICATE_ID") => { const result = list(values, label).map((value) => text(value, `${label} entry`, code)); unique(result, code, label); return result; };
const json = async (path) => JSON.parse(await readFile(path, "utf8"));
function validateJsonSchema(value, schema, label = "document") { if (schema.oneOf || schema.anyOf) { const variants = schema.oneOf ?? schema.anyOf; let matches = 0; for (const variant of variants) try { validateJsonSchema(value, variant, label); matches += 1; } catch (error) { if (!(error instanceof PublishingFailure)) throw error; } if ((schema.oneOf && matches !== 1) || (schema.anyOf && matches < 1)) throw new PublishingFailure("INVALID_SCHEMA", `${label} does not match its required schema variant.`); return; } if (schema.const !== undefined && value !== schema.const) throw new PublishingFailure("INVALID_SCHEMA", `${label} must equal its schema constant.`); if (schema.enum && !schema.enum.includes(value)) throw new PublishingFailure("INVALID_SCHEMA", `${label} is outside its schema enum.`); if (schema.type === "object") { const object = record(value, label, "INVALID_SCHEMA"); for (const key of schema.required ?? []) if (!Object.hasOwn(object, key)) throw new PublishingFailure("INVALID_SCHEMA", `${label}.${key} is required.`); if (schema.additionalProperties === false) for (const key of Object.keys(object)) if (!Object.hasOwn(schema.properties ?? {}, key)) throw new PublishingFailure("INVALID_SCHEMA", `${label}.${key} is not allowed.`); for (const [key, child] of Object.entries(schema.properties ?? {})) if (object[key] !== undefined) validateJsonSchema(object[key], child, `${label}.${key}`); return; } if (schema.type === "array") { const array = list(value, label, "INVALID_SCHEMA"); if (schema.minItems !== undefined && array.length < schema.minItems) throw new PublishingFailure("INVALID_SCHEMA", `${label} is too short.`); if (schema.uniqueItems && new Set(array.map(canonicalJson)).size !== array.length) throw new PublishingFailure("INVALID_SCHEMA", `${label} must be unique.`); if (schema.items) array.forEach((entry, index) => validateJsonSchema(entry, schema.items, `${label}[${index}]`)); return; } if (schema.type === "string" && (typeof value !== "string" || (schema.minLength && value.length < schema.minLength))) throw new PublishingFailure("INVALID_SCHEMA", `${label} must be a non-empty string.`); if (schema.type === "integer" && !Number.isInteger(value)) throw new PublishingFailure("INVALID_SCHEMA", `${label} must be an integer.`); if (schema.type === "boolean" && typeof value !== "boolean") throw new PublishingFailure("INVALID_SCHEMA", `${label} must be a boolean.`); }
const inside = (base, path) => { const target = resolve(base, path); const rel = relative(base, target); if (!rel || rel === ".." || rel.startsWith(`..${sep}`)) throw new PublishingFailure("INVALID_PATH", `Path escapes canonical root: ${path}`); return target; };

async function files(root) {
  let entries;
  try { entries = await readdir(root, { withFileTypes: true }); } catch (error) { if (error?.code === "ENOENT") return []; throw error; }
  const nested = await Promise.all(entries.sort((a, b) => compare(a.name, b.name)).map((entry) => entry.isDirectory() ? files(join(root, entry.name)) : [join(root, entry.name)]));
  return nested.flat();
}
async function discoverRecords(root, kind, trackId) {
  const base = join(root, "manual", kind, trackId);
  const paths = (await files(base)).filter((path) => path.endsWith(".json")).sort((a, b) => compare(relative(base, a), relative(base, b)));
  if (!paths.length) {
    const code = kind === "source" ? "EMPTY_INGRESS" : kind === "activations" ? "MISSING_ACTIVATION" : "MISSING_APPROVAL";
    throw new PublishingFailure(code, `No manual ${kind} JSON exists for ${trackId}.`);
  }
  return Promise.all(paths.map(async (path) => ({ path, value: await json(path) })));
}
export async function discoverManual(root, kind, trackId) { return (await discoverRecords(root, kind, trackId)).map(({ value }) => value); }
async function config(root, trackId) {
  const track = await json(join(root, "config", "tracks", `${trackId}.json`));
  const family = await json(join(root, "config", "families", `${track.familyId}.json`));
  return { track, family, taxonomy: await json(inside(root, track.taxonomyPath)) };
}
async function git(root, args) { return exec("git", args, { cwd: root }); }
async function sourceCommit(root, override) {
  if (override) return text(override, "sourceRepositoryCommit");
  try { return (await git(root, ["rev-parse", "HEAD"])).stdout.trim(); } catch { throw new PublishingFailure("SOURCE_COMMIT_UNAVAILABLE", "A buildable source repository must have a current Git commit."); }
}
async function assertCleanSource(root, override) {
  if (override) return sourceCommit(root, override); // Test-only injected identity; CLI never supplies it.
  const commit = await sourceCommit(root);
  const { stdout } = await git(root, ["status", "--porcelain", "--untracked-files=all", "--", "manual", "config", "schemas/publishing", "scripts/publishing"]);
  if (stdout.trim()) throw new PublishingFailure("DIRTY_SOURCE", "Canonical publishing inputs contain staged, unstaged, or untracked changes.");
  return commit;
}
const indexed = (entries) => new Map(entries.map((entry) => [text(entry?.id, "taxonomy id", "INVALID_REFERENCE"), entry]));
function algorithmsTaxonomy(taxonomy) {
  if (taxonomy.schemaVersion !== "algorithms-taxonomy-v2") throw new PublishingFailure("MISSING_CANONICAL_TAXONOMY", "Algorithms canonical taxonomy mappings are not installed.");
  return {
    roadmapNodes: indexed(taxonomy.roadmapNodes), mentalUnits: indexed(taxonomy.mentalUnits), patternFamilies: indexed(taxonomy.patternFamilies),
    patternVariants: indexed(taxonomy.patternVariants), problemArchetypes: indexed(taxonomy.problemArchetypes), skillAtoms: indexed(taxonomy.skillAtoms), falseHeuristics: indexed(taxonomy.falseHeuristics)
  };
}
function requireTaxonomy(map, id, label) { const entry = map.get(text(id, label, "INVALID_REFERENCE")); if (!entry) throw new PublishingFailure("INVALID_REFERENCE", `Unknown ${label}: ${id}.`); return entry; }
function validateBatchTaxonomy(value, taxonomy, batchId) {
  const taxonomyInput = record(value, `${batchId} taxonomy`, "INVALID_REFERENCE");
  const roadmapNodeId = text(taxonomyInput.roadmapNodeId, `${batchId} roadmapNodeId`, "INVALID_REFERENCE");
  const primaryMentalUnitId = text(taxonomyInput.primaryMentalUnitId, `${batchId} primaryMentalUnitId`, "INVALID_REFERENCE");
  const patternFamilyId = text(taxonomyInput.patternFamilyId, `${batchId} patternFamilyId`, "INVALID_REFERENCE");
  const mental = requireTaxonomy(taxonomy.mentalUnits, primaryMentalUnitId, "primary mental unit");
  if (!taxonomy.roadmapNodes.has(roadmapNodeId) || mental.roadmapNodeId !== roadmapNodeId) throw new PublishingFailure("INVALID_REFERENCE", `${batchId} mental unit is not in its roadmap node.`);
  const family = requireTaxonomy(taxonomy.patternFamilies, patternFamilyId, "pattern family");
  if (family.primaryMentalUnitId !== primaryMentalUnitId) throw new PublishingFailure("INVALID_REFERENCE", `${batchId} pattern family is not in its primary mental unit.`);
  return { roadmapNodeId, primaryMentalUnitId, patternFamilyId };
}
function validateAuthoringProvenance(value, batchId) {
  const provenance = record(value, `${batchId} authoringProvenance`, "MISSING_PROVENANCE");
  if (provenance.authoringMethod !== "independently_authored") throw new PublishingFailure("MISSING_PROVENANCE", `${batchId} authoringMethod must be independently_authored.`);
  for (const key of ["author", "createdAt", "contentBatchId"]) text(provenance[key], `${batchId} provenance.${key}`, "MISSING_PROVENANCE");
  return { author: provenance.author, createdAt: provenance.createdAt, contentBatchId: provenance.contentBatchId, authoringMethod: provenance.authoringMethod };
}
function validateExternalSources(value, itemId) {
  if (value === undefined) return [];
  const sources = list(value, `${itemId} sourceOverrides`, "MISSING_PROVENANCE");
  const sourceIds = sources.map((source) => text(record(source, `${itemId} source`, "MISSING_PROVENANCE").sourceId, `${itemId} sourceId`, "MISSING_PROVENANCE"));
  unique(sourceIds, "MISSING_PROVENANCE", `${itemId} source IDs`);
  for (const source of sources) for (const key of ["publisher", "title", "locator", "retrievedAt"]) text(source[key], `${itemId} source.${key}`, "MISSING_PROVENANCE");
  return sources;
}
function validateChoice(item) {
  const interaction = record(item.interaction, `${item.id} interaction`, "INVALID_RESPONSE");
  if (interaction.type !== "choice" || !["single", "multiple"].includes(interaction.selectionMode)) throw new PublishingFailure("INVALID_RESPONSE", `${item.id} choice interaction is invalid.`);
  const options = list(interaction.options, `${item.id} options`, "INVALID_RESPONSE");
  if (options.length < 2) throw new PublishingFailure("INVALID_RESPONSE", `${item.id} requires at least two options.`);
  const optionIds = options.map((option) => text(record(option, `${item.id} option`, "INVALID_RESPONSE").id, `${item.id} option id`, "INVALID_RESPONSE"));
  unique(optionIds, "DUPLICATE_ID", `${item.id} option IDs`);
  for (const option of options) text(option.text, `${item.id} option text`, "INVALID_RESPONSE");
  const accepted = ids(interaction.acceptedOptionIds, `${item.id} acceptedOptionIds`, "INVALID_RESPONSE");
  if (!accepted.length || accepted.some((id) => !optionIds.includes(id)) || (interaction.selectionMode === "single" && accepted.length !== 1)) throw new PublishingFailure("INVALID_RESPONSE", `${item.id} accepted choice set is invalid.`);
  if (interaction.selectionMode === "multiple" && !/all|each|multiple/i.test(item.prompt)) throw new PublishingFailure("INVALID_RESPONSE", `${item.id} must communicate multiple selection.`);
  const feedback = record(item.feedback, `${item.id} feedback`, "INVALID_RESPONSE"); text(feedback.reason, `${item.id} Reason`, "INVALID_RESPONSE"); text(feedback.details, `${item.id} Details`, "INVALID_RESPONSE");
  const wrong = record(feedback.wrongOptionExplanationsByOptionId, `${item.id} wrong-option explanations`, "INVALID_RESPONSE");
  const wrongIds = optionIds.filter((id) => !accepted.includes(id));
  if (Object.keys(wrong).length !== wrongIds.length || wrongIds.some((id) => typeof wrong[id] !== "string" || !wrong[id].trim()) || Object.keys(wrong).some((id) => !wrongIds.includes(id))) throw new PublishingFailure("INVALID_RESPONSE", `${item.id} wrong-option coverage is incomplete.`);
  if (interaction.selectionMode === "multiple") {
    const omitted = record(feedback.omittedCorrectExplanationsByOptionId, `${item.id} omitted-correct explanations`, "INVALID_RESPONSE");
    if (Object.keys(omitted).length !== accepted.length || accepted.some((id) => typeof omitted[id] !== "string" || !omitted[id].trim()) || Object.keys(omitted).some((id) => !accepted.includes(id))) throw new PublishingFailure("INVALID_RESPONSE", `${item.id} omitted-correct coverage is incomplete.`);
  }
  if (item.scoringContract?.type !== "choice" || item.scoringContract.resultSemantics !== "exact_selected_set_with_partial_v1") throw new PublishingFailure("INVALID_RESPONSE", `${item.id} must declare canonical choice scoring.`);
  return { interactionType: "choice", interaction };
}
function validateOrdering(item) {
  const interaction = record(item.interaction, `${item.id} interaction`, "INVALID_RESPONSE");
  if (interaction.type !== "ordering" || interaction.scoringMethod !== "adjacent_relations") throw new PublishingFailure("INVALID_RESPONSE", `${item.id} ordering must use adjacent_relations.`);
  const elements = list(interaction.elements, `${item.id} elements`, "INVALID_RESPONSE"); if (elements.length < 2) throw new PublishingFailure("INVALID_RESPONSE", `${item.id} needs two ordering elements.`);
  const elementIds = elements.map((element) => text(record(element, `${item.id} element`, "INVALID_RESPONSE").id, `${item.id} element id`, "INVALID_RESPONSE")); unique(elementIds, "DUPLICATE_ID", `${item.id} element IDs`);
  for (const element of elements) text(element.text, `${item.id} element text`, "INVALID_RESPONSE");
  const order = ids(interaction.canonicalOrder, `${item.id} canonicalOrder`, "INVALID_RESPONSE");
  if (order.length !== elementIds.length || order.some((id) => !elementIds.includes(id)) || item.scoringContract?.type !== "ordering" || item.scoringContract.maxPoints !== elements.length - 1) throw new PublishingFailure("INVALID_RESPONSE", `${item.id} ordering scoring contract is invalid.`);
  const feedback = record(item.feedback, `${item.id} feedback`, "INVALID_RESPONSE"); text(feedback.reason, `${item.id} Reason`, "INVALID_RESPONSE"); text(feedback.details, `${item.id} Details`, "INVALID_RESPONSE");
  return { interactionType: "ordering", interaction };
}
function validateComplexity(item) {
  const interaction = record(item.interaction, `${item.id} interaction`, "INVALID_RESPONSE");
  if (interaction.type !== "complexity") throw new PublishingFailure("INVALID_RESPONSE", `${item.id} complexity interaction is invalid.`);
  const dimensions = ids(interaction.checkedDimensions, `${item.id} checkedDimensions`, "INVALID_RESPONSE"); if (!dimensions.length) throw new PublishingFailure("INVALID_RESPONSE", `${item.id} needs a checked complexity dimension.`);
  const available = record(interaction.availableValuesByDimension, `${item.id} available values`, "INVALID_RESPONSE"); const accepted = record(interaction.acceptedValuesByDimension, `${item.id} accepted values`, "INVALID_RESPONSE"); const aliases = interaction.normalizedAliasesByDimension ?? {};
  for (const dimension of dimensions) {
    const legal = ids(available[dimension], `${item.id} available ${dimension}`, "INVALID_RESPONSE"); const answers = ids(accepted[dimension], `${item.id} accepted ${dimension}`, "INVALID_RESPONSE"); const aliasesForDimension = aliases[dimension] ?? {};
    for (const answer of answers) if (!legal.includes(answer) && !Object.prototype.hasOwnProperty.call(aliasesForDimension, answer)) throw new PublishingFailure("INVALID_RESPONSE", `${item.id} accepted complexity value is unknown.`);
    for (const [alias, target] of Object.entries(aliasesForDimension)) { text(alias, `${item.id} alias`, "INVALID_RESPONSE"); if (!legal.includes(target)) throw new PublishingFailure("INVALID_RESPONSE", `${item.id} complexity alias target is unknown.`); }
  }
  if (interaction.maxPoints !== dimensions.length || item.scoringContract?.type !== "complexity" || item.scoringContract.maxPoints !== dimensions.length) throw new PublishingFailure("INVALID_RESPONSE", `${item.id} complexity maxPoints is invalid.`);
  const feedback = record(item.feedback, `${item.id} feedback`, "INVALID_RESPONSE"); text(feedback.reason, `${item.id} Reason`, "INVALID_RESPONSE"); text(feedback.details, `${item.id} Details`, "INVALID_RESPONSE");
  return { interactionType: "complexity", interaction };
}
function validateAlgorithmsItem(item, batchTaxonomy, taxonomy, provenance) {
  const id = text(item?.id, "item id"); text(item.prompt, `${id} prompt`, "INVALID_RESPONSE");
  const input = record(item.taxonomy, `${id} item taxonomy`, "INVALID_REFERENCE");
  for (const prohibited of ["roadmapNodeId", "primaryMentalUnitId", "patternFamilyId"]) if (Object.hasOwn(input, prohibited)) throw new PublishingFailure("INVALID_REFERENCE", `${id} may not override batch ${prohibited}.`);
  const primarySkillAtomId = text(input.primarySkillAtomId, `${id} primary skill atom`, "INVALID_REFERENCE"); const primary = requireTaxonomy(taxonomy.skillAtoms, primarySkillAtomId, "primary skill atom");
  if (primary.primaryMentalUnitId !== batchTaxonomy.primaryMentalUnitId) throw new PublishingFailure("INVALID_REFERENCE", `${id} primary skill atom is outside the batch mental unit.`);
  const secondarySkillAtomIds = ids(input.secondarySkillAtomIds ?? [], `${id} secondary skill atoms`, "INVALID_REFERENCE"); if (secondarySkillAtomIds.includes(primarySkillAtomId)) throw new PublishingFailure("INVALID_REFERENCE", `${id} secondary skill atom duplicates primary.`);
  for (const skillId of secondarySkillAtomIds) if (requireTaxonomy(taxonomy.skillAtoms, skillId, "secondary skill atom").primaryMentalUnitId !== batchTaxonomy.primaryMentalUnitId) throw new PublishingFailure("INVALID_REFERENCE", `${id} secondary skill atom is outside the batch mental unit.`);
  const resolvedTaxonomy = { ...batchTaxonomy, primarySkillAtomId, secondarySkillAtomIds, learningStage: text(input.learningStage, `${id} learningStage`, "INVALID_REFERENCE") };
  if (input.patternVariantId !== undefined) { const variant = requireTaxonomy(taxonomy.patternVariants, input.patternVariantId, "pattern variant"); if (variant.patternFamilyId !== batchTaxonomy.patternFamilyId) throw new PublishingFailure("INVALID_REFERENCE", `${id} variant belongs to another pattern family.`); resolvedTaxonomy.patternVariantId = input.patternVariantId; }
  if (input.problemArchetypeId !== undefined) { const archetype = requireTaxonomy(taxonomy.problemArchetypes, input.problemArchetypeId, "problem archetype"); if (archetype.patternFamilyId !== batchTaxonomy.patternFamilyId) throw new PublishingFailure("INVALID_REFERENCE", `${id} archetype belongs to another pattern family.`); resolvedTaxonomy.problemArchetypeId = input.problemArchetypeId; }
  const response = item.interaction?.type === "choice" ? validateChoice(item) : item.interaction?.type === "ordering" ? validateOrdering(item) : item.interaction?.type === "complexity" ? validateComplexity(item) : (() => { throw new PublishingFailure("UNSUPPORTED_INTERACTION", `${id} interaction is unsupported.`); })();
  return { ...item, id, interactionType: response.interactionType, resolvedTaxonomy, resolvedProvenance: { ...provenance, externalSources: validateExternalSources(item.sourceOverrides, id) } };
}
function unionIds(collections, label) { const result = collections.flat(); unique(result, "DUPLICATE_ID", label); return result.sort(compare); }
function validateMembership(values, itemsById, label) { const result = ids(values, label, "INVALID_MODE"); for (const value of result) if (!itemsById.has(value)) throw new PublishingFailure("INVALID_MODE", `${label} references unknown item ${value}.`); return result; }
function valueForDimension(item, dimension) { if (dimension === "interactionType") return item.interactionType; if (dimension === "learningStage") return item.resolvedTaxonomy.learningStage; if (dimension === "difficulty") return item.difficulty; return item.resolvedTaxonomy[dimension]; }
function validateProfile(profile, pool, itemsById) {
  if (profile.profileKind !== "internal_learning_profile" || profile.totalOccurrences !== 40 || profile.foregroundDurationMs !== 2_700_000 || profile.poolId !== pool.poolId || profile.selectionPolicy?.uniqueItems !== true || profile.selectionPolicy?.replacement !== false || profile.selectionPolicy?.deterministic !== true || profile.selectionPolicy?.algorithmVersion !== "sha256-ranked-constraints-v1") throw new PublishingFailure("INVALID_SIMULATION_PROFILE", "Simulation profile contract is invalid.");
  for (const key of ["profileId", "profileVersion"]) text(profile[key], `simulation ${key}`, "INVALID_SIMULATION_PROFILE");
  const provenance = record(profile.provenance, "simulation provenance", "INVALID_SIMULATION_PROFILE"); for (const key of ["approvedBy", "approvedAt", "rationale"]) text(provenance[key], `simulation provenance.${key}`, "INVALID_SIMULATION_PROFILE"); if (provenance.authority !== "patternly_product") throw new PublishingFailure("INVALID_SIMULATION_PROFILE", "Simulation provenance authority is invalid.");
  const poolItems = pool.itemIds.map((id) => itemsById.get(id));
  const dimensions = list(profile.distributions, "simulation distributions", "INVALID_SIMULATION_PROFILE"); unique(dimensions.map((dimension) => text(dimension.dimension, "simulation dimension", "INVALID_SIMULATION_PROFILE")), "INVALID_SIMULATION_PROFILE", "simulation dimensions");
  for (const distribution of dimensions) {
    const buckets = list(distribution.buckets, "simulation buckets", "INVALID_SIMULATION_PROFILE"); unique(buckets.map((bucket) => text(bucket.valueId, "simulation bucket value", "INVALID_SIMULATION_PROFILE")), "INVALID_SIMULATION_PROFILE", "simulation bucket values");
    let minimum = 0; let maximum = 0;
    for (const bucket of buckets) {
      for (const key of ["minimum", "target", "maximum"]) if (!Number.isInteger(bucket[key]) || bucket[key] < 0 || bucket[key] > 40) throw new PublishingFailure("INVALID_SIMULATION_PROFILE", "Simulation bucket count is invalid.");
      if (!(bucket.minimum <= bucket.target && bucket.target <= bucket.maximum)) throw new PublishingFailure("INVALID_SIMULATION_PROFILE", "Simulation bucket bounds are invalid.");
      if (!poolItems.some((item) => valueForDimension(item, distribution.dimension) === bucket.valueId)) throw new PublishingFailure("INVALID_SIMULATION_PROFILE", `Simulation bucket ${bucket.valueId} is unknown for ${distribution.dimension}.`);
      minimum += bucket.minimum; maximum += bucket.maximum;
    }
    if (minimum > 40 || maximum < 40) throw new PublishingFailure("INVALID_SIMULATION_PROFILE", "Simulation distribution cannot cover 40 occurrences.");
  }
}
export function selectSimulationPlan({ profile, pool, items, selectionSeed, stateLimit = SIMULATION_SOLVER_LIMIT }) {
  const itemMap = new Map(items.map((item) => [item.id, item])); const poolIds = ids(pool.itemIds, "simulation pool itemIds", "INVALID_SIMULATION_POOL");
  if (poolIds.length < 40) throw new PublishingFailure("INSUFFICIENT_POOL", "Simulation pool requires at least 40 unique items.");
  if (!Number.isInteger(stateLimit) || stateLimit <= 0) throw new PublishingFailure("INVALID_SIMULATION_PROFILE", "Simulation solver limit is invalid.");
  const candidates = poolIds.map((id) => ({ id, item: itemMap.get(id), rank: canonicalHash([profile.profileId, profile.profileVersion, pool.poolId, pool.poolVersion, text(selectionSeed, "selectionSeed"), id]) })).sort((a, b) => compare(a.rank, b.rank) || compare(a.id, b.id));
  if (candidates.some((candidate) => !candidate.item)) throw new PublishingFailure("INVALID_SIMULATION_POOL", "Simulation pool references an unknown item.");
  const buckets = (profile.distributions ?? []).flatMap((distribution) => {
    return distribution.buckets.map((bucket) => ({
      ...bucket,
      dimension: distribution.dimension,
      key: `${distribution.dimension}:${bucket.valueId}`,
    }));
  });
  const selected = []; const selectedIds = new Set(); const memo = new Set(); const diagnostics = { visitedStates: 0, prunedStates: 0, candidateCount: candidates.length, selectedCount: 0, constraintSummary: buckets.map(({ dimension, valueId, minimum, target, maximum }) => ({ dimension, valueId, minimum, target, maximum })) };
  const count = (bucket) => selected.filter((entry) => valueForDimension(entry, bucket.dimension) === bucket.valueId).length;
  const remaining = (bucket) => candidates.filter((candidate) => !selectedIds.has(candidate.id) && valueForDimension(candidate.item, bucket.dimension) === bucket.valueId).length;
  const feasible = () => buckets.every((bucket) => count(bucket) <= bucket.maximum && count(bucket) + remaining(bucket) >= bucket.minimum);
  const canAdd = (item) => buckets.every((bucket) => count(bucket) + (valueForDimension(item, bucket.dimension) === bucket.valueId ? 1 : 0) <= bucket.maximum);
  const visit = () => {
    diagnostics.visitedStates += 1; if (diagnostics.visitedStates > stateLimit) throw new PublishingFailure("SIMULATION_SOLVER_LIMIT", `Simulation solver exceeded ${stateLimit} states.`);
    const state = [...selectedIds].sort(compare).join("\u0000"); if (memo.has(state)) { diagnostics.prunedStates += 1; return false; } memo.add(state);
    if (!feasible() || selected.length > 40) { diagnostics.prunedStates += 1; return false; }
    if (selected.length === 40) return buckets.every((bucket) => count(bucket) >= bucket.minimum && count(bucket) <= bucket.maximum);
    const required = buckets.filter((bucket) => count(bucket) < bucket.minimum).sort((left, right) => remaining(left) - remaining(right) || compare(left.key, right.key))[0];
    const choices = candidates.filter((candidate) => !selectedIds.has(candidate.id) && (!required || valueForDimension(candidate.item, required.dimension) === required.valueId) && canAdd(candidate.item));
    for (const candidate of choices) { selected.push(candidate.item); selectedIds.add(candidate.id); if (visit()) return true; selected.pop(); selectedIds.delete(candidate.id); }
    diagnostics.prunedStates += 1; return false;
  };
  if (!visit()) throw new PublishingFailure("SIMULATION_INFEASIBLE", "No legal 40-item simulation selection satisfies the profile.");
  diagnostics.selectedCount = selected.length; return { itemIds: selected.map((item) => item.id), diagnostics };
}
export function selectSimulationItems(input) { return selectSimulationPlan(input).itemIds; }
function validateModeStructures(structures, declaredModes, family, items, taxonomy) {
  const source = record(structures ?? {}, "modeStructures", "INVALID_MODE"); const itemsById = new Map(items.map((item) => [item.id, item]));
  const named = (key, idKey) => { const values = list(source[key] ?? [], key, "INVALID_MODE"); unique(values.map((value) => text(value?.[idKey], `${key} id`, "INVALID_MODE")), "INVALID_MODE", `${key} IDs`); return new Map(values.map((value) => [value[idKey], value])); };
  const recognition = named("recognitionSets", "setId"); const contrast = named("contrastSets", "setId"); const scopes = named("interleavedScopes", "scopeId"); const compatibility = named("compatibilitySets", "id"); const pools = named("simulationPools", "poolId"); const profiles = named("simulationProfiles", "profileId"); const blueprints = named("practiceBlueprints", "blueprintId");
  for (const set of recognition.values()) { validateMembership(set.itemIds, itemsById, "recognition set itemIds"); ids(set.legalLearningStages, "recognition legalLearningStages", "INVALID_MODE"); record(set.taxonomyScope, "recognition taxonomyScope", "INVALID_MODE"); }
  for (const set of contrast.values()) { const setItems = validateMembership(set.itemIds, itemsById, "contrast set itemIds"); const primary = requireTaxonomy(taxonomy.mentalUnits, set.primaryMentalUnitId, "contrast primary mental unit"); const contrasted = ids(set.contrastedMentalUnitIds, "contrasted mental units", "INVALID_MODE"); if (!contrasted.length || contrasted.includes(set.primaryMentalUnitId)) throw new PublishingFailure("INVALID_MODE", "Contrast set mental units are invalid."); for (const id of contrasted) requireTaxonomy(taxonomy.mentalUnits, id, "contrasted mental unit"); requireTaxonomy(taxonomy.falseHeuristics, set.falseHeuristicId, "false heuristic"); text(set.transferBoundary, "contrast transferBoundary", "INVALID_MODE"); if (!setItems.every((id) => [set.primaryMentalUnitId, ...contrasted].includes(itemsById.get(id).resolvedTaxonomy.primaryMentalUnitId))) throw new PublishingFailure("INVALID_MODE", "Contrast set escapes its declared taxonomy boundary."); if (!primary) throw new PublishingFailure("INVALID_MODE", "Contrast set is invalid."); }
  for (const scope of scopes.values()) { const scopeItems = validateMembership(scope.itemIds, itemsById, "interleaved scope itemIds"); const units = ids(scope.mentalUnitIds, "interleaved mentalUnitIds", "INVALID_MODE"); if (units.length < 2) throw new PublishingFailure("INVALID_MODE", "Interleaved scope must declare at least two mental units."); for (const id of units) requireTaxonomy(taxonomy.mentalUnits, id, "interleaved mental unit"); ids(scope.legalLearningStages, "interleaved legalLearningStages", "INVALID_MODE"); if (!scopeItems.every((id) => units.includes(itemsById.get(id).resolvedTaxonomy.primaryMentalUnitId))) throw new PublishingFailure("INVALID_MODE", "Interleaved scope escapes its taxonomy boundary."); }
  const relationIds = (set) => [...new Set([...validateMembership(set.sourceItemIds, itemsById, "compatibility sourceItemIds"), ...validateMembership(set.targetItemIds, itemsById, "compatibility targetItemIds")])].sort(compare);
  for (const set of compatibility.values()) { if (!["same_mechanism", "reviewed_variant", "compatible_contrast", "repair"].includes(set.relation) || !["symmetric", "directed"].includes(set.direction)) throw new PublishingFailure("INVALID_MODE", "Compatibility relation is invalid."); const all = relationIds(set); if (all.length < 2) throw new PublishingFailure("INVALID_MODE", "Compatibility set must relate distinct items."); const metadata = record(set.relationMetadata ?? {}, "compatibility relation metadata", "INVALID_MODE"); if ((set.relation === "same_mechanism" || set.relation === "reviewed_variant") && !text(metadata.mechanismBoundary, `${set.relation} mechanism boundary`, "INVALID_MODE")) throw new PublishingFailure("INVALID_MODE", `${set.relation} requires a mechanism boundary.`); if (set.relation === "compatible_contrast") { if (metadata.contrastSetId !== undefined) { if (!contrast.has(text(metadata.contrastSetId, "compatible_contrast contrast set", "INVALID_MODE"))) throw new PublishingFailure("INVALID_MODE", "compatible_contrast references an unknown contrast set."); } else requireTaxonomy(taxonomy.falseHeuristics, metadata.falseHeuristicId, "compatible_contrast false heuristic"); } if (set.relation === "repair" && !text(metadata.repairScopeId, "repair scope", "INVALID_MODE")) throw new PublishingFailure("INVALID_MODE", "repair requires an explicit repair scope."); if (set.relation === "same_mechanism" && new Set(all.map((id) => itemsById.get(id).resolvedTaxonomy.patternFamilyId)).size !== 1) throw new PublishingFailure("INVALID_MODE", "same_mechanism crosses its mechanism boundary."); }
  for (const pool of pools.values()) { text(pool.poolVersion, "simulation poolVersion", "INVALID_SIMULATION_POOL"); const poolItems = validateMembership(pool.itemIds, itemsById, "simulation pool itemIds"); if (poolItems.length < 40) throw new PublishingFailure("INSUFFICIENT_POOL", "Simulation pool has fewer than 40 items."); }
  for (const profile of profiles.values()) { const pool = pools.get(profile.poolId); if (!pool) throw new PublishingFailure("INVALID_SIMULATION_PROFILE", "Simulation profile references an unknown pool."); validateProfile(profile, pool, itemsById); selectSimulationItems({ profile, pool, items, selectionSeed: "feasibility-v1" }); }
  const requirementByMode = new Map(family.modeBlueprintRequirements.map((entry) => [entry.modeId, entry]));
  const resolvedBlueprints = [];
  for (const modeId of declaredModes) {
    const requirement = requirementByMode.get(modeId); if (!requirement) throw new PublishingFailure("INVALID_MODE", `Unknown Algorithms mode ${modeId}.`);
    const matches = [...blueprints.values()].filter((blueprint) => blueprint.modeId === modeId); if (matches.length !== 1) throw new PublishingFailure("MODE_UNREADY", `${modeId} needs exactly one practice blueprint.`);
    const blueprint = matches[0];
    if (blueprint.blueprintVersion !== "v1" || canonicalJson(blueprint.requestedLengths) !== canonicalJson(requirement.supportedRequestedLengths) || blueprint.defaultRequestedLength !== requirement.defaultRequestedLength || blueprint.shortening !== requirement.shortening || blueprint.minimumActualLength !== requirement.minimumActualLength || blueprint.composition?.kind !== requirement.compositionKind) throw new PublishingFailure("INVALID_MODE", `${modeId} blueprint conflicts with canonical mode configuration.`);
    const references = ids(blueprint.composition.ids, `${modeId} blueprint references`, "INVALID_MODE");
    let memberIds;
    if (requirement.compositionKind === "item_ids") memberIds = validateMembership(references, itemsById, `${modeId} blueprint item IDs`);
    if (requirement.compositionKind === "recognition_sets") memberIds = unionIds(references.map((id) => { const set = recognition.get(id); if (!set) throw new PublishingFailure("INVALID_MODE", "Recognition blueprint references an unknown set."); return validateMembership(set.itemIds, itemsById, "recognition set itemIds"); }), "recognition blueprint items");
    if (requirement.compositionKind === "contrast_sets") memberIds = unionIds(references.map((id) => { const set = contrast.get(id); if (!set) throw new PublishingFailure("INVALID_MODE", "Contrast blueprint references an unknown set."); return validateMembership(set.itemIds, itemsById, "contrast set itemIds"); }), "contrast blueprint items");
    if (requirement.compositionKind === "interleaved_scope") memberIds = unionIds(references.map((id) => { const scope = scopes.get(id); if (!scope) throw new PublishingFailure("INVALID_MODE", "Interleaved blueprint references an unknown scope."); return validateMembership(scope.itemIds, itemsById, "interleaved scope itemIds"); }), "interleaved blueprint items");
    if (requirement.compositionKind === "simulation_pool") { const pool = pools.get(references[0]); if (references.length !== 1 || !pool) throw new PublishingFailure("INVALID_MODE", "Simulation blueprint requires one explicit pool."); const profile = [...profiles.values()].find((entry) => entry.poolId === pool.poolId); if (!profile) throw new PublishingFailure("MODE_UNREADY", "Simulation pool has no profile."); memberIds = selectSimulationItems({ profile, pool, items, selectionSeed: `reference:${profile.profileId}:${profile.profileVersion}` }); }
    if (memberIds.length < requirement.minimumActualLength) throw new PublishingFailure("MODE_UNREADY", `${modeId} cannot satisfy minimumActualLength.`);
    if (requirement.shortening === "prohibited" && memberIds.length !== requirement.defaultRequestedLength) throw new PublishingFailure("MODE_UNREADY", `${modeId} must produce exactly ${requirement.defaultRequestedLength} items.`);
    resolvedBlueprints.push({ ...blueprint, resolvedItemIds: memberIds });
  }
  const memberships = new Map(items.map((item) => [item.id, []])); for (const set of compatibility.values()) for (const id of relationIds(set)) memberships.get(id).push(set.id); for (const values of memberships.values()) values.sort(compare);
  return { practiceBlueprints: resolvedBlueprints.sort((a, b) => compare(a.modeId, b.modeId)), recognitionSets: [...recognition.values()], contrastSets: [...contrast.values()], interleavedScopes: [...scopes.values()], compatibilitySets: [...compatibility.values()], simulationPools: [...pools.values()], simulationProfiles: [...profiles.values()], memberships };
}
export function compileResolvedTaxonomy(item) { return Object.freeze({ ...item.resolvedTaxonomy }); }
export function compileResolvedProvenance(item) { return Object.freeze({ ...item.resolvedProvenance, externalSources: Object.freeze(item.resolvedProvenance.externalSources.map((source) => Object.freeze({ ...source }))) }); }
export function compileChoiceItem(item, compatibilityMemberships, itemFingerprint) { return Object.freeze({ id: item.id, prompt: item.prompt, ...(item.constraints ? { constraints: item.constraints } : {}), ...(item.difficulty ? { difficulty: item.difficulty } : {}), interaction: Object.freeze({ type: "choice", selectionMode: item.interaction.selectionMode, options: Object.freeze(item.interaction.options.map((option) => Object.freeze({ id: option.id, text: option.text }))), acceptedOptionIds: Object.freeze([...item.interaction.acceptedOptionIds]) }), scoringContract: Object.freeze({ type: "choice", resultSemantics: "exact_selected_set_with_partial_v1" }), feedback: Object.freeze({ reason: item.feedback.reason, details: item.feedback.details, ...(item.feedback.wrongOptionExplanationsByOptionId ? { wrongOptionExplanationsByOptionId: Object.freeze({ ...item.feedback.wrongOptionExplanationsByOptionId }) } : {}), ...(item.feedback.omittedCorrectExplanationsByOptionId ? { omittedCorrectExplanationsByOptionId: Object.freeze({ ...item.feedback.omittedCorrectExplanationsByOptionId }) } : {}) }), taxonomy: compileResolvedTaxonomy(item), provenance: compileResolvedProvenance(item), compatibilityMemberships: Object.freeze([...compatibilityMemberships]), itemFingerprint }); }
export function compileOrderingItem(item, compatibilityMemberships, itemFingerprint) { return Object.freeze({ id: item.id, prompt: item.prompt, ...(item.constraints ? { constraints: item.constraints } : {}), ...(item.difficulty ? { difficulty: item.difficulty } : {}), interaction: Object.freeze({ type: "ordering", elements: Object.freeze(item.interaction.elements.map((element) => Object.freeze({ id: element.id, text: element.text }))), canonicalOrder: Object.freeze([...item.interaction.canonicalOrder]), scoringMethod: "adjacent_relations" }), scoringContract: Object.freeze({ type: "ordering", maxPoints: item.scoringContract.maxPoints }), feedback: Object.freeze({ reason: item.feedback.reason, details: item.feedback.details }), taxonomy: compileResolvedTaxonomy(item), provenance: compileResolvedProvenance(item), compatibilityMemberships: Object.freeze([...compatibilityMemberships]), itemFingerprint }); }
export function compileComplexityItem(item, compatibilityMemberships, itemFingerprint) { return Object.freeze({ id: item.id, prompt: item.prompt, ...(item.constraints ? { constraints: item.constraints } : {}), ...(item.difficulty ? { difficulty: item.difficulty } : {}), interaction: Object.freeze({ type: "complexity", checkedDimensions: Object.freeze([...item.interaction.checkedDimensions]), availableValuesByDimension: Object.freeze({ ...item.interaction.availableValuesByDimension }), acceptedValuesByDimension: Object.freeze({ ...item.interaction.acceptedValuesByDimension }), normalizedAliasesByDimension: Object.freeze({ ...item.interaction.normalizedAliasesByDimension }), ...(item.interaction.sharedPresetId ? { sharedPresetId: item.interaction.sharedPresetId } : {}), maxPoints: item.interaction.maxPoints }), scoringContract: Object.freeze({ type: "complexity", maxPoints: item.scoringContract.maxPoints }), feedback: Object.freeze({ reason: item.feedback.reason, details: item.feedback.details }), taxonomy: compileResolvedTaxonomy(item), provenance: compileResolvedProvenance(item), compatibilityMemberships: Object.freeze([...compatibilityMemberships]), itemFingerprint }); }
export function compilePublishedAlgorithmsItem(item, compatibilityMemberships, itemFingerprint) { if (item.interactionType === "choice") return compileChoiceItem(item, compatibilityMemberships, itemFingerprint); if (item.interactionType === "ordering") return compileOrderingItem(item, compatibilityMemberships, itemFingerprint); return compileComplexityItem(item, compatibilityMemberships, itemFingerprint); }
export function compileModeDeclarations(structures) { return Object.freeze({ practiceBlueprints: Object.freeze(structures.practiceBlueprints.map((entry) => Object.freeze({ blueprintId: entry.blueprintId, blueprintVersion: entry.blueprintVersion, modeId: entry.modeId, requestedLengths: Object.freeze([...entry.requestedLengths]), defaultRequestedLength: entry.defaultRequestedLength, shortening: entry.shortening, minimumActualLength: entry.minimumActualLength, composition: Object.freeze({ kind: entry.composition.kind, ids: Object.freeze([...entry.composition.ids]) }), resolvedItemIds: Object.freeze([...entry.resolvedItemIds]) }))), recognitionSets: Object.freeze(structures.recognitionSets.map(({ setId, setVersion, taxonomyScope, legalLearningStages, itemIds, falseHeuristicIds }) => Object.freeze({ setId, setVersion, taxonomyScope: Object.freeze({ ...taxonomyScope }), legalLearningStages: Object.freeze([...legalLearningStages]), itemIds: Object.freeze([...itemIds]), ...(falseHeuristicIds ? { falseHeuristicIds: Object.freeze([...falseHeuristicIds]) } : {}) }))), contrastSets: Object.freeze(structures.contrastSets.map(({ setId, setVersion, primaryMentalUnitId, contrastedMentalUnitIds, falseHeuristicId, transferBoundary, itemIds }) => Object.freeze({ setId, setVersion, primaryMentalUnitId, contrastedMentalUnitIds: Object.freeze([...contrastedMentalUnitIds]), falseHeuristicId, transferBoundary, itemIds: Object.freeze([...itemIds]) }))), interleavedScopes: Object.freeze(structures.interleavedScopes.map(({ scopeId, scopeVersion, mentalUnitIds, itemIds, legalLearningStages, minimumDiversity }) => Object.freeze({ scopeId, scopeVersion, mentalUnitIds: Object.freeze([...mentalUnitIds]), itemIds: Object.freeze([...itemIds]), legalLearningStages: Object.freeze([...legalLearningStages]), ...(minimumDiversity !== undefined ? { minimumDiversity } : {}) }))), compatibilitySets: Object.freeze(structures.compatibilitySets.map(({ id, version, relation, direction, sourceItemIds, targetItemIds }) => Object.freeze({ id, version, relation, direction, sourceItemIds: Object.freeze([...sourceItemIds]), targetItemIds: Object.freeze([...targetItemIds]) }))), simulationPools: Object.freeze(structures.simulationPools.map(({ poolId, poolVersion, itemIds }) => Object.freeze({ poolId, poolVersion, itemIds: Object.freeze([...itemIds]) }))), simulationProfiles: Object.freeze(structures.simulationProfiles.map(({ profileId, profileVersion, profileKind, totalOccurrences, foregroundDurationMs, poolId, distributions, selectionPolicy }) => Object.freeze({ profileId, profileVersion, profileKind, totalOccurrences, foregroundDurationMs, poolId, distributions: Object.freeze(distributions.map((distribution) => Object.freeze({ dimension: distribution.dimension, buckets: Object.freeze(distribution.buckets.map((bucket) => Object.freeze({ ...bucket }))) }))), selectionPolicy: Object.freeze({ ...selectionPolicy }) }))) }); }
function fingerprints(resolvedItems, memberships) { return Object.fromEntries(resolvedItems.map((item) => [item.id, canonicalHash({ fingerprintSchemaVersion: 1, item: { id: item.id, prompt: item.prompt, constraints: item.constraints ?? null, interaction: item.interaction, scoringContract: item.scoringContract, feedback: item.feedback, taxonomy: item.resolvedTaxonomy, provenance: item.resolvedProvenance, compatibilityMemberships: memberships.get(item.id) } })])); }
function validateAlgorithmsSource(batches, track, family, taxonomyConfig, sourceCommitValue) {
  const taxonomy = algorithmsTaxonomy(taxonomyConfig); const first = batches[0]; const batchIds = [];
  for (const batch of batches) {
    if (batch.schemaVersion !== "algorithms-manual-source-v2" || batch.trackId !== track.trackId || batch.familyId !== "algorithms" || batch.taxonomyVersion !== track.taxonomyVersion) throw new PublishingFailure("INVALID_ENVELOPE", "Algorithms batch envelope conflicts with track configuration.");
    batchIds.push(text(batch.batchId, "batchId")); text(batch.contentVersion, "contentVersion"); if (batch.contentVersion !== first.contentVersion || canonicalJson(batch.declaredModes) !== canonicalJson(first.declaredModes)) throw new PublishingFailure("VERSION_MISMATCH", "Algorithms batches must share one content version and mode declaration.");
  }
  unique(batchIds, "DUPLICATE_ID", "batch IDs"); const declaredModes = ids(first.declaredModes, "declaredModes", "INVALID_MODE"); const contexts = [];
  for (const batch of batches) {
    const batchTaxonomy = validateBatchTaxonomy(batch.taxonomy, taxonomy, batch.batchId); const provenance = validateAuthoringProvenance(batch.authoringProvenance, batch.batchId);
    if (!Array.isArray(batch.items) || !batch.items.length) throw new PublishingFailure("INVALID_ENVELOPE", `${batch.batchId} needs items.`);
    if (batch.batchKind === "contrast") { const contrast = record(batch.contrastMetadata, `${batch.batchId} contrast metadata`, "INVALID_REFERENCE"); const contrasted = ids(contrast.contrastedMentalUnitIds, "contrast metadata mental units", "INVALID_REFERENCE"); if (!contrasted.length) throw new PublishingFailure("INVALID_REFERENCE", "Contrast batch needs contrasted mental units."); for (const id of contrasted) requireTaxonomy(taxonomy.mentalUnits, id, "contrasted mental unit"); requireTaxonomy(taxonomy.falseHeuristics, contrast.falseHeuristicId, "false heuristic"); text(contrast.transferBoundary, "contrast transferBoundary", "INVALID_REFERENCE"); }
    contexts.push(...batch.items.map((item) => ({ batch, item: validateAlgorithmsItem(item, batchTaxonomy, taxonomy, provenance) })));
  }
  unique(contexts.map(({ item }) => item.id), "DUPLICATE_ID", "Algorithms item IDs"); const resolvedItems = contexts.map(({ item }) => item); const modeStructureKeys = ["practiceBlueprints", "recognitionSets", "contrastSets", "interleavedScopes", "compatibilitySets", "simulationPools", "simulationProfiles"]; const aggregatedStructures = Object.fromEntries(modeStructureKeys.map((key) => [key, batches.flatMap((batch) => batch.modeStructures?.[key] ?? [])])); const modeStructures = validateModeStructures(aggregatedStructures, declaredModes, family, resolvedItems, taxonomy);
  const itemFingerprints = fingerprints(resolvedItems, modeStructures.memberships); const items = resolvedItems.map((item) => ({ ...item, compatibilityMemberships: modeStructures.memberships.get(item.id), itemFingerprint: itemFingerprints[item.id] })).sort((a, b) => compare(a.id, b.id));
  const sourceTreeFingerprint = canonicalHash(batches);
  const technicalEvidence = batches.map((batch) => { const batchItems = contexts.filter((context) => context.batch.batchId === batch.batchId).map((context) => context.item.id).sort(compare); const evidence = { evidenceSchemaVersion: 1, canonicalSerializationVersion: CANONICAL_SERIALIZATION_VERSION, validatorVersion: "content-publishing-validator-v2", trackId: track.trackId, familyId: track.familyId, batchId: batch.batchId, sourceCommit: sourceCommitValue, sourceTreeFingerprint, batchFingerprint: canonicalHash(batch), itemFingerprints: Object.fromEntries(batchItems.map((id) => [id, itemFingerprints[id]])), result: "passed", diagnosticCodes: [] }; return { ...evidence, evidenceId: `technical:${canonicalHash(evidence)}` }; });
  const { memberships, ...publishedModeStructures } = modeStructures;
  return { contentVersion: first.contentVersion, taxonomyVersion: first.taxonomyVersion, declaredModes, items, itemFingerprints, modeStructures: publishedModeStructures, batches, technicalEvidence, sourceTreeFingerprint };
}
function validateCertificationSource(batches, track, family, sourceCommitValue) {
  const first = batches[0]; for (const batch of batches) if (batch.schemaVersion !== "certification-manual-source-v1" || batch.trackId !== track.trackId || batch.familyId !== track.familyId || batch.contentVersion !== first.contentVersion || batch.taxonomyVersion !== track.taxonomyVersion) throw new PublishingFailure("INVALID_ENVELOPE", "Certification batch envelope conflicts with track configuration.");
  const items = batches.flatMap((batch) => list(batch.items, "Certification items")).map((item) => ({ ...item, id: text(item.id, "Certification item id") })); unique(items.map((item) => item.id), "DUPLICATE_ID", "Certification item IDs");
  const itemFingerprints = Object.fromEntries(items.map((item) => [item.id, canonicalHash(item)])); const sourceTreeFingerprint = canonicalHash(batches);
  const technicalEvidence = batches.map((batch) => { const evidence = { evidenceSchemaVersion: 1, canonicalSerializationVersion: CANONICAL_SERIALIZATION_VERSION, validatorVersion: "content-publishing-validator-v2", trackId: track.trackId, familyId: track.familyId, batchId: text(batch.batchId, "Certification batchId"), sourceCommit: sourceCommitValue, sourceTreeFingerprint, batchFingerprint: canonicalHash(batch), itemFingerprints: Object.fromEntries(batch.items.map((item) => [item.id, itemFingerprints[item.id]])), result: "passed", diagnosticCodes: [] }; return { ...evidence, evidenceId: `technical:${canonicalHash(evidence)}` }; });
  return { contentVersion: first.contentVersion, taxonomyVersion: first.taxonomyVersion, declaredModes: ids(first.declaredModes, "Certification declaredModes", "INVALID_MODE"), items: items.sort((a, b) => compare(a.id, b.id)), itemFingerprints, modeStructures: {}, batches, technicalEvidence, sourceTreeFingerprint };
}
function validateApprovals(records, inspected, evidenceRecords) {
  const evidenceById = new Map(evidenceRecords.filter((entry) => entry?.result === "passed").map((entry) => [entry.evidenceId, entry])); const approvedByItem = new Map();
  for (const approval of records) {
    if (approval.approvalSchemaVersion !== 1 || approval.reviewKind !== "editorial" || approval.familyId !== inspected.track.familyId || approval.trackId !== inspected.track.trackId || approval.finalDisposition !== "approved" || approval.revoked === true) continue;
    text(approval.approvalId, "approvalId", "INVALID_APPROVAL"); text(approval.reviewer, "approval reviewer", "INVALID_APPROVAL"); text(approval.reviewDate, "approval reviewDate", "INVALID_APPROVAL"); text(approval.primaryTaxonomyReference, "approval primaryTaxonomyReference", "INVALID_APPROVAL"); list(approval.factualAndEditorialDefectsFound, "approval factualAndEditorialDefectsFound", "INVALID_APPROVAL"); list(approval.requiredCorrections, "approval requiredCorrections", "INVALID_APPROVAL"); if (!evidenceById.has(approval.technicalValidationEvidenceId)) throw new PublishingFailure("INVALID_APPROVAL", "Approval does not reference retained passed technical evidence.");
    for (const entry of list(approval.includedItems, "approval includedItems", "INVALID_APPROVAL")) { const itemId = text(entry.itemId, "approval itemId", "INVALID_APPROVAL"); const itemFingerprint = text(entry.itemFingerprint, "approval itemFingerprint", "INVALID_APPROVAL"); const current = inspected.source.items.find((item) => item.id === itemId && item.itemFingerprint === itemFingerprint); if (current && !approvedByItem.has(itemId)) approvedByItem.set(itemId, approval); }
  }
  if (approvedByItem.size !== inspected.source.items.length) throw new PublishingFailure("MISSING_APPROVAL", "Every current item needs a non-revoked approved immutable fingerprint record.");
  return approvedByItem;
}
function validateActivation(records, inspected, approvals) {
  if (records.length !== 1) throw new PublishingFailure("MISSING_ACTIVATION", "Exactly one manual activation record is required for a track version."); const activation = records[0];
  if (activation.activationSchemaVersion !== 1 || activation.trackId !== inspected.track.trackId || activation.familyId !== inspected.track.familyId || activation.contentVersion !== inspected.source.contentVersion || activation.taxonomyVersion !== inspected.source.taxonomyVersion) throw new PublishingFailure("INVALID_ACTIVATION", "Activation identity is invalid.");
  text(activation.activationId, "activationId", "INVALID_ACTIVATION"); const coverage = list(activation.itemCoverage, "activation itemCoverage", "INVALID_ACTIVATION").map((entry) => [text(entry.itemId, "activation itemId", "INVALID_ACTIVATION"), text(entry.itemFingerprint, "activation itemFingerprint", "INVALID_ACTIVATION"), text(entry.approvalId, "activation approvalId", "INVALID_ACTIVATION")]).sort(([a], [b]) => compare(a, b)); const expected = inspected.source.items.map((item) => [item.id, item.itemFingerprint]).sort(([a], [b]) => compare(a, b));
  if (coverage.length !== expected.length || coverage.some(([id, fingerprint], index) => id !== expected[index][0] || fingerprint !== expected[index][1])) throw new PublishingFailure("MISSING_ACTIVATION", "Activation must exactly cover the whole immutable bank.");
  for (const [id, , approvalId] of coverage) if (approvals.get(id)?.approvalId !== approvalId) throw new PublishingFailure("INVALID_ACTIVATION", "Activation references an approval that does not own the immutable item fingerprint.");
  return { identity: `activation:${canonicalHash(activation)}`, itemIds: expected.map(([id]) => id), activation };
}
export async function inspectTrack({ root = ROOT, trackId, sourceRepositoryCommit }) {
  const { track, family, taxonomy } = await config(root, trackId); const batches = (await discoverRecords(root, "source", trackId)).map(({ value }) => value); const commit = await sourceCommit(root, sourceRepositoryCommit);
  const sourceSchema = await json(join(root, "schemas", "publishing", track.familyId === "algorithms" ? "algorithms-manual-source.schema.json" : "certification-manual-source.schema.json"));
  batches.forEach((batch, index) => validateJsonSchema(batch, sourceSchema, `manual source batch ${index}`));
  const source = track.familyId === "algorithms" ? validateAlgorithmsSource(batches, track, family, taxonomy, commit) : validateCertificationSource(batches, track, family, commit);
  return { track, family, taxonomy, source, sourceRepositoryCommit: commit };
}
async function technicalEvidenceRecords(root, trackId) { const base = join(root, "reports", "technical-evidence", trackId); const paths = (await files(base)).filter((path) => path.endsWith(".json")).sort(compare); const records = []; for (const path of paths) { const value = await json(path); records.push(...(Array.isArray(value) ? value : [value])); } return records; }
export async function emitTechnicalEvidence({ root = ROOT, trackId, sourceRepositoryCommit }) { const cleanCommit = await assertCleanSource(root, sourceRepositoryCommit); const inspected = await inspectTrack({ root, trackId, sourceRepositoryCommit: cleanCommit }); const payload = inspected.source.technicalEvidence; const path = join(root, "reports", "technical-evidence", trackId, `${inspected.source.sourceTreeFingerprint}.json`); try { const prior = await readFile(path, "utf8"); if (prior !== canonicalJson(payload)) throw new PublishingFailure("IMMUTABLE_EVIDENCE", "Technical evidence identity already exists with different bytes."); } catch (error) { if (error?.code !== "ENOENT") throw error; await mkdir(dirname(path), { recursive: true }); await writeFile(path, canonicalJson(payload)); } return { evidence: payload, path, sourceTreeFingerprint: inspected.source.sourceTreeFingerprint }; }
export async function validateTrack({ root = ROOT, trackId, sourceRepositoryCommit }) {
  const inspected = await inspectTrack({ root, trackId, sourceRepositoryCommit }); const [evidenceSchema, approvalSchema, activationSchema] = await Promise.all([json(join(root, "schemas", "publishing", "technical-validation-evidence.schema.json")), json(join(root, "schemas", "publishing", "editorial-approval-record.schema.json")), json(join(root, "schemas", "publishing", "content-activation-record.schema.json"))]); const evidence = await technicalEvidenceRecords(root, trackId); evidence.forEach((entry, index) => validateJsonSchema(entry, evidenceSchema, `technical evidence ${index}`)); if (!evidence.some((entry) => entry.sourceTreeFingerprint === inspected.source.sourceTreeFingerprint && entry.sourceCommit === inspected.sourceRepositoryCommit && entry.result === "passed")) throw new PublishingFailure("MISSING_TECHNICAL_EVIDENCE", "Current source must have deterministic passed technical evidence before release validation."); const approvalRecords = (await discoverRecords(root, "approvals", trackId)).map(({ value }) => value); approvalRecords.forEach((entry, index) => validateJsonSchema(entry, approvalSchema, `editorial approval ${index}`)); const activationRecords = (await discoverRecords(root, "activations", trackId)).map(({ value }) => value); activationRecords.forEach((entry, index) => validateJsonSchema(entry, activationSchema, `activation ${index}`)); const approvals = validateApprovals(approvalRecords, inspected, evidence); const approvalCoverage = validateActivation(activationRecords, inspected, approvals); return { ...inspected, approvalCoverage };
}
function bankFor(validated) { if (validated.track.familyId !== "algorithms") return { formatVersion: 1, trackId: validated.track.trackId, familyId: validated.track.familyId, contentVersion: validated.source.contentVersion, items: validated.source.items }; const modes = compileModeDeclarations(validated.source.modeStructures); return Object.freeze({ formatVersion: 1, trackId: "algorithms", familyId: "algorithms", contentVersion: validated.source.contentVersion, items: Object.freeze(validated.source.items.map((item) => compilePublishedAlgorithmsItem(item, item.compatibilityMemberships, item.itemFingerprint))), ...modes, approvalActivationIdentity: validated.approvalCoverage.identity }); }
export async function buildTrack({ root = ROOT, trackId, outputRoot = join(ROOT, "artifacts"), sourceRepositoryCommit }) {
  const cleanCommit = await assertCleanSource(root, sourceRepositoryCommit); const validated = await validateTrack({ root, trackId, sourceRepositoryCommit: cleanCommit }); const bank = bankFor(validated); const artifactBytes = canonicalJson({ envelopeVersion: 1, schemaVersion: "published-bank-v1", contentVersion: validated.source.contentVersion, taxonomyVersion: validated.source.taxonomyVersion, bank });
  const artifact = { trackId, familyId: validated.track.familyId, contentVersion: validated.source.contentVersion, taxonomyVersion: validated.source.taxonomyVersion, schemaVersion: "published-bank-v1", checksumSha256: hash(artifactBytes), sourceRepositoryCommit: cleanCommit, approvalCoverage: { identity: validated.approvalCoverage.identity, itemIds: validated.approvalCoverage.itemIds }, declaredModes: validated.source.declaredModes, artifactBytes };
  const out = join(outputRoot, "tracks", trackId, artifact.contentVersion, "track-artifact.json"); const reportPath = join(root, "reports", "publishing", `${trackId}-${artifact.contentVersion}.json`);
  for (const [path, message] of [[out, `Artifact version already exists: ${trackId}/${artifact.contentVersion}.`], [reportPath, `Build report already exists: ${trackId}/${artifact.contentVersion}.`]]) {
    try { await stat(path); throw new PublishingFailure("IMMUTABLE_VERSION", message); } catch (error) { if (error?.code !== "ENOENT") throw error; }
  }
  const report = { reportSchemaVersion: 3, phase: "build", trackId, familyId: artifact.familyId, contentVersion: artifact.contentVersion, taxonomyVersion: artifact.taxonomyVersion, sourceRepositoryCommit: cleanCommit, sourceTreeFingerprint: validated.source.sourceTreeFingerprint, approvalActivationIdentity: artifact.approvalCoverage.identity, checksumSha256: artifact.checksumSha256, itemCount: artifact.approvalCoverage.itemIds.length };
  const artifactPending = `${out}.pending-${artifact.checksumSha256}`; const reportPending = `${reportPath}.pending-${artifact.checksumSha256}`;
  await mkdir(dirname(out), { recursive: true }); await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPending, canonicalJson(report)); await writeFile(artifactPending, canonicalJson(artifact));
  await rename(reportPending, reportPath); await rename(artifactPending, out);
  return { artifact, path: out, reportPath };
}
export async function verifyArtifact(path) { const artifact = await json(path); const expectedKeys = ["approvalCoverage", "artifactBytes", "checksumSha256", "contentVersion", "declaredModes", "familyId", "schemaVersion", "sourceRepositoryCommit", "taxonomyVersion", "trackId"]; if (canonicalJson(Object.keys(artifact).sort(compare)) !== canonicalJson(expectedKeys)) throw new PublishingFailure("INVALID_ARTIFACT", "Track artifact reference has an unsupported external shape."); if (hash(text(artifact.artifactBytes, "artifactBytes")) !== artifact.checksumSha256) throw new PublishingFailure("CHECKSUM_MISMATCH", "Artifact bytes do not match checksum."); const envelope = JSON.parse(artifact.artifactBytes); if (envelope.envelopeVersion !== 1 || envelope.schemaVersion !== "published-bank-v1" || envelope.contentVersion !== artifact.contentVersion || envelope.taxonomyVersion !== artifact.taxonomyVersion || envelope.bank.trackId !== artifact.trackId || envelope.bank.familyId !== artifact.familyId) throw new PublishingFailure("INVALID_ARTIFACT", "Published artifact envelope identity is invalid."); if (artifact.familyId === "algorithms") { const bankKeys = ["approvalActivationIdentity", "compatibilitySets", "contentVersion", "contrastSets", "familyId", "formatVersion", "interleavedScopes", "items", "practiceBlueprints", "recognitionSets", "simulationPools", "simulationProfiles", "trackId"]; const itemKeys = ["compatibilityMemberships", "feedback", "id", "interaction", "itemFingerprint", "prompt", "provenance", "scoringContract", "taxonomy"]; if (canonicalJson(Object.keys(envelope.bank).sort(compare)) !== canonicalJson(bankKeys) || envelope.bank.formatVersion !== 1 || envelope.bank.contentVersion !== artifact.contentVersion || envelope.bank.items.some((item) => canonicalJson(Object.keys(item).sort(compare)) !== canonicalJson(itemKeys))) throw new PublishingFailure("INVALID_ARTIFACT", "Algorithms published bank does not conform to the exact application contract."); } return artifact; }
export async function publishRelease({ root = ROOT, releaseId, artifactPaths, outputRoot = join(ROOT, "artifacts"), sourceRepositoryCommit }) {
  const cleanCommit = await assertCleanSource(root, sourceRepositoryCommit); text(releaseId, "releaseId"); const artifacts = await Promise.all(list(artifactPaths, "artifactPaths", "INVALID_RELEASE").map(verifyArtifact)); unique(artifacts.map((artifact) => artifact.trackId), "INVALID_RELEASE", "release track IDs"); if (artifacts.some((artifact) => artifact.sourceRepositoryCommit !== cleanCommit)) throw new PublishingFailure("SOURCE_COMMIT_MISMATCH", "Release and every artifact must use the same clean source commit."); const release = { manifest: { envelopeVersion: 1, releaseId, sourceRepositoryCommit: cleanCommit }, artifacts: artifacts.sort((a, b) => compare(a.trackId, b.trackId)) }; const out = join(outputRoot, "releases", releaseId, "release.json"); const exported = join(root, "exports", "app", `generated-${releaseId}.mjs`);
  for (const [path, message] of [[out, `Release already exists: ${releaseId}.`], [exported, `Generated application module already exists: ${releaseId}.`]]) { try { await stat(path); throw new PublishingFailure("IMMUTABLE_VERSION", message); } catch (error) { if (error?.code !== "ENOENT") throw error; } }
  const moduleBytes = `export const GENERATED_BUNDLED_CONTENT_RELEASE = Object.freeze(${JSON.stringify(release)});\n`; const releasePending = `${out}.pending-${canonicalHash(release)}`; const exportPending = `${exported}.pending-${canonicalHash(release)}`;
  await mkdir(dirname(out), { recursive: true }); await mkdir(dirname(exported), { recursive: true }); await writeFile(exportPending, moduleBytes); await writeFile(releasePending, canonicalJson(release)); await rename(exportPending, exported); await rename(releasePending, out);
  return { release, path: out, exportPath: exported };
}
