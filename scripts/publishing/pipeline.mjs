import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const exec = promisify(execFile);
export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export class PublishingFailure extends Error { constructor(code, message) { super(`${code}: ${message}`); this.code = code; } }
const compare = (left, right) => left === right ? 0 : left < right ? -1 : 1;
export const hash = (value) => createHash("sha256").update(value).digest("hex");
export const CANONICAL_SERIALIZATION_VERSION = "canonical-json-v1";
export const SIMULATION_SOLVER_LIMIT = 50_000;
export const PUBLISHING_VALIDATOR_VERSION = "content-publishing-validator-v4";
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
async function technicalInputCommit(root, override) {
  if (override) return sourceCommit(root, override);
  try {
    const { stdout } = await git(root, ["log", "-1", "--format=%H", "--", "manual/source", "config", "schemas/publishing", "scripts/publishing", "package.json", "package-lock.json"]);
    return text(stdout.trim(), "technicalInputCommit", "SOURCE_COMMIT_UNAVAILABLE");
  } catch { throw new PublishingFailure("SOURCE_COMMIT_UNAVAILABLE", "A buildable source repository must have a technical input commit."); }
}
async function assertCleanSource(root, override) {
  if (override) return sourceCommit(root, override); // Test-only injected identity; CLI never supplies it.
  const commit = await sourceCommit(root);
  const { stdout } = await git(root, ["status", "--porcelain", "--untracked-files=all", "--", "manual", "config", "schemas/publishing", "scripts/publishing", "package.json", "package-lock.json", "evidence"]);
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
  requireTaxonomy(taxonomy.patternFamilies, patternFamilyId, "pattern family");
  const legalPatternFamilyIds = ids(mental.legalPatternFamilyIds ?? [], `${batchId} mental unit legal pattern families`, "INVALID_REFERENCE");
  if (!legalPatternFamilyIds.includes(patternFamilyId)) throw new PublishingFailure("INVALID_REFERENCE", `${batchId} pattern family is not legal for its primary mental unit.`);
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
  const constraints = item.constraints === undefined ? undefined : ids(item.constraints, `${id} constraints`, "INVALID_RESPONSE");
  const difficulty = item.difficulty === undefined ? undefined : text(item.difficulty, `${id} difficulty`, "INVALID_RESPONSE");
  const input = record(item.taxonomy, `${id} item taxonomy`, "INVALID_REFERENCE");
  for (const prohibited of ["roadmapNodeId", "primaryMentalUnitId", "patternFamilyId"]) if (Object.hasOwn(input, prohibited)) throw new PublishingFailure("INVALID_REFERENCE", `${id} may not override batch ${prohibited}.`);
  const mentalUnit = requireTaxonomy(taxonomy.mentalUnits, batchTaxonomy.primaryMentalUnitId, "primary mental unit");
  const primarySkillAtomId = text(input.primarySkillAtomId, `${id} primary skill atom`, "INVALID_REFERENCE"); const primary = requireTaxonomy(taxonomy.skillAtoms, primarySkillAtomId, "primary skill atom");
  if (primary.primaryMentalUnitId !== batchTaxonomy.primaryMentalUnitId) throw new PublishingFailure("INVALID_REFERENCE", `${id} primary skill atom is outside the batch mental unit.`);
  const secondarySkillAtomIds = ids(input.secondarySkillAtomIds ?? [], `${id} secondary skill atoms`, "INVALID_REFERENCE"); if (secondarySkillAtomIds.includes(primarySkillAtomId)) throw new PublishingFailure("INVALID_REFERENCE", `${id} secondary skill atom duplicates primary.`);
  for (const skillId of secondarySkillAtomIds) if (requireTaxonomy(taxonomy.skillAtoms, skillId, "secondary skill atom").primaryMentalUnitId !== batchTaxonomy.primaryMentalUnitId) throw new PublishingFailure("INVALID_REFERENCE", `${id} secondary skill atom is outside the batch mental unit.`);
  const learningStage = text(input.learningStage, `${id} learningStage`, "INVALID_REFERENCE");
  if (learningStage !== mentalUnit.learningStage) throw new PublishingFailure("INVALID_REFERENCE", `${id} learningStage is not legal for the batch mental unit.`);
  const resolvedTaxonomy = { ...batchTaxonomy, primarySkillAtomId, secondarySkillAtomIds, learningStage };
  if (input.patternVariantId !== undefined) { const variant = requireTaxonomy(taxonomy.patternVariants, input.patternVariantId, "pattern variant"); if (variant.patternFamilyId !== batchTaxonomy.patternFamilyId) throw new PublishingFailure("INVALID_REFERENCE", `${id} variant belongs to another pattern family.`); resolvedTaxonomy.patternVariantId = input.patternVariantId; }
  if (input.problemArchetypeId !== undefined) { const archetype = requireTaxonomy(taxonomy.problemArchetypes, input.problemArchetypeId, "problem archetype"); if (!ids(archetype.legalPatternFamilyIds ?? [], `${id} archetype legal pattern families`, "INVALID_REFERENCE").includes(batchTaxonomy.patternFamilyId)) throw new PublishingFailure("INVALID_REFERENCE", `${id} archetype does not permit the batch pattern family.`); resolvedTaxonomy.problemArchetypeId = input.problemArchetypeId; }
  const response = item.interaction?.type === "choice" ? validateChoice(item) : item.interaction?.type === "ordering" ? validateOrdering(item) : item.interaction?.type === "complexity" ? validateComplexity(item) : (() => { throw new PublishingFailure("UNSUPPORTED_INTERACTION", `${id} interaction is unsupported.`); })();
  return { ...item, id, ...(constraints ? { constraints } : {}), ...(difficulty ? { difficulty } : {}), interactionType: response.interactionType, resolvedTaxonomy, resolvedProvenance: { ...provenance, externalSources: validateExternalSources(item.sourceOverrides, id) } };
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
  const candidateMatches = candidates.map((candidate) => buckets.map((bucket) => valueForDimension(candidate.item, bucket.dimension) === bucket.valueId));
  const remainingMatches = buckets.map(() => Array(candidates.length + 1).fill(0));
  for (let bucketIndex = 0; bucketIndex < buckets.length; bucketIndex += 1) for (let candidateIndex = candidates.length - 1; candidateIndex >= 0; candidateIndex -= 1) remainingMatches[bucketIndex][candidateIndex] = remainingMatches[bucketIndex][candidateIndex + 1] + (candidateMatches[candidateIndex][bucketIndex] ? 1 : 0);
  const diagnostics = { visitedStates: 0, prunedStates: 0, candidateCount: candidates.length, selectedCount: 0, targetDeviation: 0, totalTargetDeviation: 0, lowerBoundAtCompletion: 0, optimalityProven: false, constraintSummary: buckets.map(({ dimension, valueId, minimum, target, maximum }) => ({ dimension, valueId, minimum, target, maximum })) };
  const counts = Array(buckets.length).fill(0); const selected = []; const memo = new Map(); let bestSolution;
  const tieKey = (ranks) => [...ranks].sort(compare).join("\u0000");
  const lowerBound = (candidateIndex) => {
    const slots = 40 - selected.length; if (slots < 0 || candidates.length - candidateIndex < slots) return Number.POSITIVE_INFINITY;
    let total = 0;
    for (let bucketIndex = 0; bucketIndex < buckets.length; bucketIndex += 1) {
      const bucket = buckets[bucketIndex]; const matchingCandidates = remainingMatches[bucketIndex][candidateIndex]; const nonMatchingCandidates = candidates.length - candidateIndex - matchingCandidates; const minimumPossible = Math.max(counts[bucketIndex], bucket.minimum, counts[bucketIndex] + Math.max(0, slots - nonMatchingCandidates)); const maximumPossible = Math.min(bucket.maximum, counts[bucketIndex] + Math.min(slots, matchingCandidates));
      if (minimumPossible > maximumPossible) return Number.POSITIVE_INFINITY;
      total += bucket.target < minimumPossible ? minimumPossible - bucket.target : bucket.target > maximumPossible ? bucket.target - maximumPossible : 0;
    }
    return total;
  };
  const optimisticTieKey = (candidateIndex) => tieKey([...selected.map((candidate) => candidate.rank), ...candidates.slice(candidateIndex, candidateIndex + (40 - selected.length)).map((candidate) => candidate.rank)]);
  const solutionDeviation = () => buckets.reduce((total, bucket, bucketIndex) => total + Math.abs(counts[bucketIndex] - bucket.target), 0);
  const legalComplete = () => selected.length === 40 && buckets.every((bucket, bucketIndex) => counts[bucketIndex] >= bucket.minimum && counts[bucketIndex] <= bucket.maximum);
  const consider = () => { if (!legalComplete()) return; const totalTargetDeviation = solutionDeviation(); const candidate = { itemIds: selected.map((entry) => entry.id), totalTargetDeviation, tieBreakKey: tieKey(selected.map((entry) => entry.rank)) }; if (!bestSolution || candidate.totalTargetDeviation < bestSolution.totalTargetDeviation || (candidate.totalTargetDeviation === bestSolution.totalTargetDeviation && compare(candidate.tieBreakKey, bestSolution.tieBreakKey) < 0)) bestSolution = candidate; };
  const visit = (candidateIndex) => {
    diagnostics.visitedStates += 1;
    if (diagnostics.visitedStates > stateLimit) { const detail = { visitedStates: diagnostics.visitedStates, stateLimit, bestDeviationFound: bestSolution?.totalTargetDeviation ?? null, bestSolutionFound: !!bestSolution, optimalityProven: false }; throw new PublishingFailure("SIMULATION_SOLVER_LIMIT", `Simulation solver reached its state limit: ${canonicalJson(detail)}`); }
    const bound = lowerBound(candidateIndex);
    if (!Number.isFinite(bound)) { diagnostics.prunedStates += 1; return; }
    if (bestSolution && (bound > bestSolution.totalTargetDeviation || (bound === bestSolution.totalTargetDeviation && compare(optimisticTieKey(candidateIndex), bestSolution.tieBreakKey) >= 0))) { diagnostics.prunedStates += 1; return; }
    const state = `${candidateIndex}|${selected.length}|${counts.join(",")}`; const selectedTie = tieKey(selected.map((candidate) => candidate.rank)); const seenTie = memo.get(state);
    if (seenTie !== undefined && compare(seenTie, selectedTie) <= 0) { diagnostics.prunedStates += 1; return; }
    memo.set(state, selectedTie);
    if (candidateIndex === candidates.length) { consider(); return; }
    const candidate = candidates[candidateIndex]; const matches = candidateMatches[candidateIndex];
    if (counts.every((count, bucketIndex) => count + (matches[bucketIndex] ? 1 : 0) <= buckets[bucketIndex].maximum)) { selected.push(candidate); for (let bucketIndex = 0; bucketIndex < buckets.length; bucketIndex += 1) if (matches[bucketIndex]) counts[bucketIndex] += 1; visit(candidateIndex + 1); for (let bucketIndex = 0; bucketIndex < buckets.length; bucketIndex += 1) if (matches[bucketIndex]) counts[bucketIndex] -= 1; selected.pop(); }
    visit(candidateIndex + 1);
  };
  visit(0);
  if (!bestSolution) throw new PublishingFailure("SIMULATION_INFEASIBLE", "No legal 40-item simulation selection satisfies the profile.");
  diagnostics.selectedCount = bestSolution.itemIds.length; diagnostics.targetDeviation = bestSolution.totalTargetDeviation; diagnostics.totalTargetDeviation = bestSolution.totalTargetDeviation; diagnostics.lowerBoundAtCompletion = bestSolution.totalTargetDeviation; diagnostics.optimalityProven = true;
  return { itemIds: bestSolution.itemIds, diagnostics };
}
export function selectSimulationItems(input) { return selectSimulationPlan(input).itemIds; }
const PRACTICE_MODE_IDS = ["algorithms-learn-approach", "algorithms-guided-practice", "algorithms-recognize-patterns", "algorithms-contrast-practice", "algorithms-weak-area-review", "algorithms-independent-practice"];
const SIMULATION_MODE_ID = "algorithms-interview-simulation";
function trackModeConfiguration(track) {
  const configuration = record(track.modeConfiguration, "Algorithms track modeConfiguration", "MISSING_TRACK_MODE_CONFIGURATION");
  if (configuration.schemaVersion !== "algorithms-track-mode-config-v1") throw new PublishingFailure("INVALID_TRACK_MODE_CONFIGURATION", "Algorithms track mode configuration schema is invalid.");
  const blueprints = list(configuration.practiceBlueprints, "Algorithms track practiceBlueprints", "INVALID_TRACK_MODE_CONFIGURATION");
  if (blueprints.length !== PRACTICE_MODE_IDS.length) throw new PublishingFailure("INVALID_TRACK_MODE_CONFIGURATION", "Algorithms track requires exactly six practice blueprints.");
  const modes = blueprints.map((blueprint) => text(record(blueprint, "Algorithms track practice blueprint", "INVALID_TRACK_MODE_CONFIGURATION").modeId, "Algorithms track practice blueprint modeId", "INVALID_TRACK_MODE_CONFIGURATION"));
  if (canonicalJson([...modes].sort(compare)) !== canonicalJson([...PRACTICE_MODE_IDS].sort(compare))) throw new PublishingFailure("INVALID_TRACK_MODE_CONFIGURATION", "Algorithms track practice blueprints must own each canonical practice mode exactly once.");
  for (const blueprint of blueprints) {
    const value = record(blueprint, "Algorithms track practice blueprint", "INVALID_TRACK_MODE_CONFIGURATION");
    for (const key of ["blueprintId", "blueprintVersion", "modeId", "selectionBoundary", "reinsertPolicy"]) text(value[key], `Algorithms track practice blueprint ${key}`, "INVALID_TRACK_MODE_CONFIGURATION");
    const lengths = list(value.requestedLengths, "Algorithms track practice blueprint requestedLengths", "INVALID_TRACK_MODE_CONFIGURATION"); if (!lengths.length || lengths.some((length) => !Number.isInteger(length))) throw new PublishingFailure("INVALID_TRACK_MODE_CONFIGURATION", "Algorithms track practice blueprint lengths are invalid.");
    if (!lengths.includes(value.defaultRequestedLength) || !Number.isInteger(value.minimumActualLength) || value.minimumActualLength < 1 || !["allowed", "blueprint_controlled"].includes(value.shortening)) throw new PublishingFailure("INVALID_TRACK_MODE_CONFIGURATION", "Algorithms track practice blueprint controls are invalid.");
    ids(value.learningStages, "Algorithms track practice blueprint learningStages", "INVALID_TRACK_MODE_CONFIGURATION");
    if (value.modeId === "algorithms-weak-area-review" && canonicalJson(ids(value.reviewSources, "Algorithms weak-area review sources", "INVALID_TRACK_MODE_CONFIGURATION").sort(compare)) !== canonicalJson(["due_queue", "session_misses"])) throw new PublishingFailure("INVALID_TRACK_MODE_CONFIGURATION", "Weak Area Review sources must be due_queue and session_misses.");
  }
  const simulation = record(configuration.simulationBlueprint, "Algorithms simulation blueprint", "MISSING_TRACK_MODE_CONFIGURATION");
  for (const key of ["blueprintId", "blueprintVersion", "modeId", "profileId", "profileVersion", "shorteningPolicy", "timerKind", "navigationPolicy", "answerChangePolicy", "reinsertPolicy", "feedbackTiming"]) text(simulation[key], `Algorithms simulation blueprint ${key}`, "INVALID_TRACK_MODE_CONFIGURATION");
  if (simulation.modeId !== SIMULATION_MODE_ID || simulation.profileId !== "algorithms-interview-simulation-v1" || simulation.profileVersion !== "1" || simulation.requestedLength !== 40 || simulation.actualLength !== 40 || simulation.shorteningPolicy !== "prohibited" || simulation.uniqueItemsRequired !== 40 || simulation.timerKind !== "foreground_countdown" || simulation.durationMinutes !== 45 || simulation.navigationPolicy !== "free_navigation" || simulation.answerChangePolicy !== "editable_until_finalization" || simulation.reinsertPolicy !== "disabled" || simulation.feedbackTiming !== "after_verified_finalization") throw new PublishingFailure("INVALID_TRACK_MODE_CONFIGURATION", "Algorithms simulation blueprint conflicts with the approved fixed-40 contract.");
  const policy = record(simulation.selectionPolicy, "Algorithms simulation selection policy", "INVALID_TRACK_MODE_CONFIGURATION");
  for (const key of ["requireUniqueItemIds", "requireDeclaredSimulationEligibility", "requireMultipleMentalUnits", "requireMultiplePatternFamilies", "requireEveryActiveInteractionTypeRepresented", "prohibitConsecutiveSameMentalUnitWhenAlternativeExists", "prohibitDuplicateContentIdentity", "prohibitTaxonomyWidening", "prohibitFallbackItems"]) if (policy[key] !== true) throw new PublishingFailure("INVALID_TRACK_MODE_CONFIGURATION", "Algorithms simulation selection policy is incomplete.");
  return { blueprints, simulation };
}
function materializeTrackBlueprints(configuration, recognition, contrast, scopes, items) {
  return configuration.blueprints.map((blueprint) => {
    const boundary = blueprint.selectionBoundary;
    const allItemIds = items.map((item) => item.id).sort(compare);
    const composition = boundary === "explicit_recognition_scope"
      ? { kind: "recognition_sets", ids: [...recognition.keys()].sort(compare) }
      : boundary === "explicit_contrast_set"
        ? { kind: "contrast_sets", ids: [...contrast.keys()].sort(compare) }
        : boundary === "explicit_interleaved_scope"
          ? { kind: "interleaved_scope", ids: [...scopes.keys()].sort(compare) }
          : { kind: "item_ids", ids: allItemIds };
    return { ...blueprint, composition };
  });
}
function validateModeStructures(structures, declaredModes, family, track, items, taxonomy) {
  const source = record(structures ?? {}, "modeStructures", "INVALID_MODE"); const itemsById = new Map(items.map((item) => [item.id, item]));
  const named = (key, idKey) => { const values = list(source[key] ?? [], key, "INVALID_MODE"); unique(values.map((value) => text(value?.[idKey], `${key} id`, "INVALID_MODE")), "INVALID_MODE", `${key} IDs`); return new Map(values.map((value) => [value[idKey], value])); };
  const recognition = named("recognitionSets", "setId"); const contrast = named("contrastSets", "setId"); const scopes = named("interleavedScopes", "scopeId"); const compatibility = named("compatibilitySets", "id"); const pools = named("simulationPools", "poolId"); const profiles = named("simulationProfiles", "profileId"); const configuration = trackModeConfiguration(track); const trackBlueprints = materializeTrackBlueprints(configuration, recognition, contrast, scopes, items); const blueprints = new Map(trackBlueprints.map((blueprint) => [blueprint.blueprintId, blueprint]));
  for (const set of recognition.values()) { validateMembership(set.itemIds, itemsById, "recognition set itemIds"); ids(set.legalLearningStages, "recognition legalLearningStages", "INVALID_MODE"); record(set.taxonomyScope, "recognition taxonomyScope", "INVALID_MODE"); }
  for (const set of contrast.values()) { const setItems = validateMembership(set.itemIds, itemsById, "contrast set itemIds"); const primary = requireTaxonomy(taxonomy.mentalUnits, set.primaryMentalUnitId, "contrast primary mental unit"); const contrasted = ids(set.contrastedMentalUnitIds, "contrasted mental units", "INVALID_MODE"); if (!contrasted.length || contrasted.includes(set.primaryMentalUnitId)) throw new PublishingFailure("INVALID_MODE", "Contrast set mental units are invalid."); for (const id of contrasted) requireTaxonomy(taxonomy.mentalUnits, id, "contrasted mental unit"); requireTaxonomy(taxonomy.falseHeuristics, set.falseHeuristicId, "false heuristic"); text(set.transferBoundary, "contrast transferBoundary", "INVALID_MODE"); if (!setItems.every((id) => [set.primaryMentalUnitId, ...contrasted].includes(itemsById.get(id).resolvedTaxonomy.primaryMentalUnitId))) throw new PublishingFailure("INVALID_MODE", "Contrast set escapes its declared taxonomy boundary."); if (!primary) throw new PublishingFailure("INVALID_MODE", "Contrast set is invalid."); }
  for (const scope of scopes.values()) { const scopeItems = validateMembership(scope.itemIds, itemsById, "interleaved scope itemIds"); const units = ids(scope.mentalUnitIds, "interleaved mentalUnitIds", "INVALID_MODE"); if (units.length < 2) throw new PublishingFailure("INVALID_MODE", "Interleaved scope must declare at least two mental units."); for (const id of units) requireTaxonomy(taxonomy.mentalUnits, id, "interleaved mental unit"); ids(scope.legalLearningStages, "interleaved legalLearningStages", "INVALID_MODE"); if (!scopeItems.every((id) => units.includes(itemsById.get(id).resolvedTaxonomy.primaryMentalUnitId))) throw new PublishingFailure("INVALID_MODE", "Interleaved scope escapes its taxonomy boundary."); }
  const relationIds = (set) => [...new Set([...validateMembership(set.sourceItemIds, itemsById, "compatibility sourceItemIds"), ...validateMembership(set.targetItemIds, itemsById, "compatibility targetItemIds")])].sort(compare);
  for (const set of compatibility.values()) { if (!["same_mechanism", "reviewed_variant", "compatible_contrast", "repair"].includes(set.relation) || !["symmetric", "directed"].includes(set.direction)) throw new PublishingFailure("INVALID_MODE", "Compatibility relation is invalid."); const all = relationIds(set); if (all.length < 2) throw new PublishingFailure("INVALID_MODE", "Compatibility set must relate distinct items."); const metadata = record(set.relationMetadata ?? {}, "compatibility relation metadata", "INVALID_MODE"); if ((set.relation === "same_mechanism" || set.relation === "reviewed_variant") && !text(metadata.mechanismBoundary, `${set.relation} mechanism boundary`, "INVALID_MODE")) throw new PublishingFailure("INVALID_MODE", `${set.relation} requires a mechanism boundary.`); if (set.relation === "compatible_contrast") { if (metadata.contrastSetId !== undefined) { if (!contrast.has(text(metadata.contrastSetId, "compatible_contrast contrast set", "INVALID_MODE"))) throw new PublishingFailure("INVALID_MODE", "compatible_contrast references an unknown contrast set."); } else requireTaxonomy(taxonomy.falseHeuristics, metadata.falseHeuristicId, "compatible_contrast false heuristic"); } if (set.relation === "repair" && !text(metadata.repairScopeId, "repair scope", "INVALID_MODE")) throw new PublishingFailure("INVALID_MODE", "repair requires an explicit repair scope."); if (set.relation === "same_mechanism" && new Set(all.map((id) => itemsById.get(id).resolvedTaxonomy.patternFamilyId)).size !== 1) throw new PublishingFailure("INVALID_MODE", "same_mechanism crosses its mechanism boundary."); }
  for (const pool of pools.values()) { text(pool.poolVersion, "simulation poolVersion", "INVALID_SIMULATION_POOL"); const poolItems = validateMembership(pool.itemIds, itemsById, "simulation pool itemIds"); if (poolItems.length < 40) throw new PublishingFailure("INSUFFICIENT_POOL", "Simulation pool has fewer than 40 items."); }
  for (const profile of profiles.values()) { const pool = pools.get(profile.poolId); if (!pool) throw new PublishingFailure("INVALID_SIMULATION_PROFILE", "Simulation profile references an unknown pool."); validateProfile(profile, pool, itemsById); selectSimulationItems({ profile, pool, items, selectionSeed: "feasibility-v1" }); }
  const requirementByMode = new Map(trackBlueprints.map((entry) => [entry.modeId, entry]));
  const resolvedBlueprints = [];
  for (const modeId of declaredModes) {
    if (modeId === SIMULATION_MODE_ID) {
      if (pools.size !== 1 || profiles.size !== 1) throw new PublishingFailure("MODE_UNREADY", "Interview Simulation requires exactly one declared simulation pool and profile.");
      const profile = [...profiles.values()][0]; const pool = pools.get(profile.poolId);
      if (!pool || profile.profileId !== configuration.simulation.profileId || profile.profileVersion !== configuration.simulation.profileVersion) throw new PublishingFailure("MODE_UNREADY", "Interview Simulation declared eligibility does not match the track simulation blueprint.");
      validateProfile(profile, pool, itemsById); const selected = selectSimulationItems({ profile, pool, items, selectionSeed: "track-simulation-v1" });
      if (selected.length !== configuration.simulation.uniqueItemsRequired || new Set(selected).size !== configuration.simulation.uniqueItemsRequired) throw new PublishingFailure("MODE_UNREADY", "Interview Simulation must select exactly 40 unique eligible items.");
      resolvedBlueprints.push({
        blueprintId: configuration.simulation.blueprintId,
        blueprintVersion: configuration.simulation.blueprintVersion,
        modeId: SIMULATION_MODE_ID,
        requestedLengths: [configuration.simulation.requestedLength],
        defaultRequestedLength: configuration.simulation.requestedLength,
        shortening: configuration.simulation.shorteningPolicy,
        minimumActualLength: configuration.simulation.actualLength,
        composition: { kind: "simulation_pool", ids: [pool.poolId] },
        resolvedItemIds: selected,
      });
      continue;
    }
    const requirement = requirementByMode.get(modeId); if (!requirement) throw new PublishingFailure("INVALID_MODE", `Unknown Algorithms mode ${modeId}.`);
    const matches = [...blueprints.values()].filter((blueprint) => blueprint.modeId === modeId); if (matches.length !== 1) throw new PublishingFailure("MODE_UNREADY", `${modeId} needs exactly one practice blueprint.`);
    const blueprint = matches[0];
    if (blueprint.blueprintVersion !== requirement.blueprintVersion || canonicalJson(blueprint.requestedLengths) !== canonicalJson(requirement.requestedLengths) || blueprint.defaultRequestedLength !== requirement.defaultRequestedLength || blueprint.shortening !== requirement.shortening || blueprint.minimumActualLength !== requirement.minimumActualLength || !blueprint.composition?.kind) throw new PublishingFailure("INVALID_MODE", `${modeId} blueprint conflicts with canonical mode configuration.`);
    const references = ids(blueprint.composition.ids, `${modeId} blueprint references`, "INVALID_MODE");
    let memberIds;
    if (blueprint.composition.kind === "item_ids") memberIds = validateMembership(references, itemsById, `${modeId} blueprint item IDs`);
    if (blueprint.composition.kind === "recognition_sets") memberIds = [...new Set(references.flatMap((id) => { const set = recognition.get(id); if (!set) throw new PublishingFailure("INVALID_MODE", "Recognition blueprint references an unknown set."); return validateMembership(set.itemIds, itemsById, "recognition set itemIds"); }))].sort(compare);
    if (blueprint.composition.kind === "contrast_sets") memberIds = [...new Set(references.flatMap((id) => { const set = contrast.get(id); if (!set) throw new PublishingFailure("INVALID_MODE", "Contrast blueprint references an unknown set."); return validateMembership(set.itemIds, itemsById, "contrast set itemIds"); }))].sort(compare);
    if (blueprint.composition.kind === "interleaved_scope") memberIds = [...new Set(references.flatMap((id) => { const scope = scopes.get(id); if (!scope) throw new PublishingFailure("INVALID_MODE", "Interleaved blueprint references an unknown scope."); return validateMembership(scope.itemIds, itemsById, "interleaved scope itemIds"); }))].sort(compare);
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
function evidenceFor({ track, family, batchId, technicalInputFingerprint, batchFingerprint, itemFingerprints, validatedAtSourceCommit }) {
  const identity = { evidenceSchemaVersion: 1, canonicalSerializationVersion: CANONICAL_SERIALIZATION_VERSION, validatorVersion: PUBLISHING_VALIDATOR_VERSION, trackId: track.trackId, familyId: family.familyId, batchId, technicalInputFingerprint, batchFingerprint, itemFingerprints, result: "passed", diagnosticCodes: [] };
  return { ...identity, validatedAtSourceCommit, evidenceId: `technical:${canonicalHash(identity)}` };
}
function validateAlgorithmsSource(batches, track, family, taxonomyConfig, technicalInputFingerprint, sourceCommitValue) {
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
  unique(contexts.map(({ item }) => item.id), "DUPLICATE_ID", "Algorithms item IDs"); const resolvedItems = contexts.map(({ item }) => item); const modeStructureKeys = ["recognitionSets", "contrastSets", "interleavedScopes", "compatibilitySets", "simulationPools", "simulationProfiles"]; const aggregatedStructures = Object.fromEntries(modeStructureKeys.map((key) => [key, batches.flatMap((batch) => batch.modeStructures?.[key] ?? [])])); const modeStructures = validateModeStructures(aggregatedStructures, declaredModes, family, track, resolvedItems, taxonomy);
  const itemFingerprints = fingerprints(resolvedItems, modeStructures.memberships); const items = resolvedItems.map((item) => ({ ...item, compatibilityMemberships: modeStructures.memberships.get(item.id), itemFingerprint: itemFingerprints[item.id] })).sort((a, b) => compare(a.id, b.id));
  const technicalEvidence = batches.map((batch) => { const batchItems = contexts.filter((context) => context.batch.batchId === batch.batchId).map((context) => context.item.id).sort(compare); return evidenceFor({ track, family, batchId: batch.batchId, technicalInputFingerprint, batchFingerprint: canonicalHash(batch), itemFingerprints: Object.fromEntries(batchItems.map((id) => [id, itemFingerprints[id]])), validatedAtSourceCommit: sourceCommitValue }); });
  const { memberships, ...publishedModeStructures } = modeStructures;
  return { contentVersion: first.contentVersion, taxonomyVersion: first.taxonomyVersion, declaredModes, items, itemFingerprints, modeStructures: publishedModeStructures, batches, technicalEvidence, technicalInputFingerprint };
}
function certificationTaxonomy(taxonomy) {
  if (taxonomy.schemaVersion !== "taxonomy-config-v1" || !Array.isArray(taxonomy.axes) || !taxonomy.axes.includes("cloud-domain") || !taxonomy.axes.includes("tag")) throw new PublishingFailure("MISSING_CANONICAL_TAXONOMY", "Certification taxonomy must declare cloud-domain and tag axes.");
  return new Set(ids(taxonomy.cloudDomains, "Certification cloud domains", "MISSING_CANONICAL_TAXONOMY"));
}
function validateCertificationItem(value, cloudDomains) {
  const item = record(value, "Certification item", "INVALID_RESPONSE"); const id = text(item.id, "Certification item id", "INVALID_RESPONSE");
  text(item.question, `${id} question`, "INVALID_RESPONSE");
  if (!cloudDomains.has(text(item.domain, `${id} domain`, "INVALID_REFERENCE"))) throw new PublishingFailure("INVALID_REFERENCE", `${id} has an unknown cloud domain.`);
  if (!['single', 'multiple'].includes(item.type)) throw new PublishingFailure("INVALID_RESPONSE", `${id} has an unsupported choice interaction.`);
  if (!['easy', 'medium', 'hard'].includes(item.difficulty)) throw new PublishingFailure("INVALID_RESPONSE", `${id} has an unsupported difficulty.`);
  const options = list(item.options, `${id} options`, "INVALID_RESPONSE"); if (options.length < 2) throw new PublishingFailure("INVALID_RESPONSE", `${id} needs at least two options.`);
  const optionIds = options.map((option) => text(record(option, `${id} option`, "INVALID_RESPONSE").id, `${id} option id`, "INVALID_RESPONSE")); unique(optionIds, "DUPLICATE_ID", `${id} option IDs`);
  const visible = options.map((option) => text(option.text, `${id} option text`, "INVALID_RESPONSE").trim().toLocaleLowerCase()); unique(visible, "DUPLICATE_CONTENT_IDENTITY", `${id} visible options`);
  const correct = ids(item.correctOptionIds, `${id} correctOptionIds`, "INVALID_RESPONSE");
  if (!correct.length || correct.some((optionId) => !optionIds.includes(optionId)) || (item.type === "single" && correct.length !== 1)) throw new PublishingFailure("INVALID_RESPONSE", `${id} correct answer set is invalid.`);
  text(item.explanation, `${id} explanation`, "INVALID_RESPONSE"); text(item.watchOutFor, `${id} watchOutFor`, "INVALID_RESPONSE");
  const wrong = record(item.whyOthersAreWrong, `${id} whyOthersAreWrong`, "INVALID_RESPONSE"); const wrongIds = optionIds.filter((optionId) => !correct.includes(optionId));
  if (Object.keys(wrong).length !== wrongIds.length || wrongIds.some((optionId) => typeof wrong[optionId] !== "string" || !wrong[optionId].trim()) || Object.keys(wrong).some((optionId) => !wrongIds.includes(optionId))) throw new PublishingFailure("INVALID_RESPONSE", `${id} wrong-option explanations are incomplete.`);
  ids(item.tags, `${id} tags`, "INVALID_REFERENCE"); ids(item.examSignals, `${id} examSignals`, "INVALID_RESPONSE");
  return { ...item, id };
}
function validateCertificationExamExperienceProfile(value) {
  const profile = record(value, "Certification exam experience profile", "INVALID_EXAM_EXPERIENCE_PROFILE");
  const profileKeys = ["answerChanges", "blueprint", "durationMinutes", "flagging", "navigation", "navigator", "profileId", "profileVersion", "questionCount", "schemaVersion", "sections", "source", "timeout"];
  if (canonicalJson(Object.keys(profile).sort(compare)) !== canonicalJson(profileKeys)) throw new PublishingFailure("INVALID_EXAM_EXPERIENCE_PROFILE", "Certification exam experience profile has unsupported fields.");
  if (profile.schemaVersion !== "exam-experience-profile-v1") throw new PublishingFailure("INVALID_EXAM_EXPERIENCE_PROFILE", "Certification exam experience profile schema is invalid.");
  text(profile.profileId, "Certification exam experience profile ID", "INVALID_EXAM_EXPERIENCE_PROFILE"); text(profile.profileVersion, "Certification exam experience profile version", "INVALID_EXAM_EXPERIENCE_PROFILE");
  const source = record(profile.source, "Certification exam experience profile source", "INVALID_EXAM_EXPERIENCE_PROFILE");
  if (canonicalJson(Object.keys(source).sort(compare)) !== canonicalJson(["checkedDate", "guideVersion", "url"])) throw new PublishingFailure("INVALID_EXAM_EXPERIENCE_PROFILE", "Certification exam experience profile source has unsupported fields.");
  for (const key of ["url", "checkedDate", "guideVersion"]) text(source[key], `Certification exam experience profile source.${key}`, "INVALID_EXAM_EXPERIENCE_PROFILE"); if (!/^https:\/\//.test(source.url) || Number.isNaN(Date.parse(source.checkedDate))) throw new PublishingFailure("INVALID_EXAM_EXPERIENCE_PROFILE", "Certification exam experience profile source is invalid.");
  if (!Number.isInteger(profile.durationMinutes) || profile.durationMinutes <= 0) throw new PublishingFailure("INVALID_EXAM_EXPERIENCE_PROFILE", "Certification exam experience profile duration is invalid.");
  const count = record(profile.questionCount, "Certification exam experience profile question count", "INVALID_EXAM_EXPERIENCE_PROFILE");
  if (canonicalJson(Object.keys(count).sort(compare)) !== canonicalJson(["kind", "maximum", "minimum"]) || count.kind !== "range" || !Number.isInteger(count.minimum) || !Number.isInteger(count.maximum) || count.minimum < 1 || count.maximum < count.minimum) throw new PublishingFailure("INVALID_EXAM_EXPERIENCE_PROFILE", "Certification exam experience profile question count is invalid.");
  const blueprint = record(profile.blueprint, "Certification exam experience profile blueprint", "INVALID_EXAM_EXPERIENCE_PROFILE");
  if (canonicalJson(Object.keys(blueprint).sort(compare)) !== canonicalJson(["kind", "sections"]) || blueprint.kind !== "weighted_sections") throw new PublishingFailure("INVALID_EXAM_EXPERIENCE_PROFILE", "Certification exam experience profile blueprint is invalid.");
  const sections = list(blueprint.sections, "Certification exam experience profile sections", "INVALID_EXAM_EXPERIENCE_PROFILE");
  if (!sections.length) throw new PublishingFailure("INVALID_EXAM_EXPERIENCE_PROFILE", "Certification exam experience profile needs sections.");
  const sectionIds = sections.map((section) => { const item = record(section, "Certification exam experience profile section", "INVALID_EXAM_EXPERIENCE_PROFILE"); if (canonicalJson(Object.keys(item).sort(compare)) !== canonicalJson(["id", "weightPercent"])) throw new PublishingFailure("INVALID_EXAM_EXPERIENCE_PROFILE", "Certification exam experience profile section has unsupported fields."); return text(item.id, "Certification exam experience profile section ID", "INVALID_EXAM_EXPERIENCE_PROFILE"); });
  unique(sectionIds, "INVALID_EXAM_EXPERIENCE_PROFILE", "Certification exam experience profile section IDs");
  if (sections.some((section) => typeof section.weightPercent !== "number" || section.weightPercent <= 0) || Math.abs(sections.reduce((total, section) => total + section.weightPercent, 0) - 100) > 0.00001) throw new PublishingFailure("INVALID_EXAM_EXPERIENCE_PROFILE", "Certification exam experience profile section weights are invalid.");
  for (const key of ["navigation", "answerChanges", "flagging", "navigator", "sections", "timeout"]) if (profile[key] !== "not_documented") throw new PublishingFailure("INVALID_EXAM_EXPERIENCE_PROFILE", `Certification exam experience profile.${key} must stay explicitly undocumented until an approved source exists.`);
  return profile;
}
function certificationDiagnosticBaseline(track, items) {
  const configuration = record(track.modeConfiguration, "Certification track modeConfiguration", "MISSING_TRACK_MODE_CONFIGURATION");
  if (canonicalJson(Object.keys(configuration).sort(compare)) !== canonicalJson(["diagnosticBaseline", "focusPractice", "scenarioPractice", "schemaVersion", "weakAreaReview"]) || configuration.schemaVersion !== "certification-track-mode-config-v1") throw new PublishingFailure("INVALID_TRACK_MODE_CONFIGURATION", "Certification track mode configuration is invalid.");
  const baseline = record(configuration.diagnosticBaseline, "Certification Diagnostic Baseline blueprint", "MISSING_TRACK_MODE_CONFIGURATION");
  const keys = ["actualLength", "blueprintId", "blueprintVersion", "feedbackTiming", "itemIds", "modeId", "reinsertPolicy", "requestedLength", "shortening", "timerKind", "uniqueItemsRequired"];
  if (canonicalJson(Object.keys(baseline).sort(compare)) !== canonicalJson(keys) || baseline.blueprintId !== "gcp-ace-diagnostic-baseline-v1" || baseline.blueprintVersion !== "1" || baseline.modeId !== "certification-diagnostic-baseline" || baseline.requestedLength !== 40 || baseline.actualLength !== 40 || baseline.shortening !== "prohibited" || baseline.uniqueItemsRequired !== 40 || baseline.timerKind !== "elapsed_foreground" || baseline.feedbackTiming !== "after_each_durable_submit" || baseline.reinsertPolicy !== "disabled") throw new PublishingFailure("INVALID_TRACK_MODE_CONFIGURATION", "Certification Diagnostic Baseline blueprint conflicts with its fixed-40 contract.");
  const itemIds = ids(baseline.itemIds, "Certification Diagnostic Baseline item IDs", "INVALID_TRACK_MODE_CONFIGURATION");
  if (itemIds.length !== 40 || new Set(itemIds).size !== 40 || itemIds.some((itemId) => !items.some((item) => item.id === itemId))) throw new PublishingFailure("INVALID_TRACK_MODE_CONFIGURATION", "Certification Diagnostic Baseline must name exactly forty unique current items.");
  return { ...baseline, itemIds: Object.freeze([...itemIds]) };
}
function certificationFocusPractice(track, items) {
  const focus = record(track.modeConfiguration.focusPractice, "Certification Focus Practice blueprint", "MISSING_TRACK_MODE_CONFIGURATION");
  const keys = ["blueprintId", "blueprintVersion", "modeId", "requestedLengths", "selectionScope", "shortening", "topicIds"];
  if (canonicalJson(Object.keys(focus).sort(compare)) !== canonicalJson(keys) || focus.blueprintId !== "gcp-ace-focus-practice-v1" || focus.blueprintVersion !== "1" || focus.modeId !== "certification-focus-practice" || focus.selectionScope !== "cloud_domain" || focus.shortening !== "allowed_within_topic") throw new PublishingFailure("INVALID_TRACK_MODE_CONFIGURATION", "Certification Focus Practice blueprint conflicts with its declared contract.");
  const requestedLengths = list(focus.requestedLengths, "Certification Focus Practice requested lengths", "INVALID_TRACK_MODE_CONFIGURATION");
  if (canonicalJson(requestedLengths) !== canonicalJson([10, 20, 40])) throw new PublishingFailure("INVALID_TRACK_MODE_CONFIGURATION", "Certification Focus Practice must declare exactly 10, 20, and 40 requested lengths.");
  const topicIds = ids(focus.topicIds, "Certification Focus Practice topic IDs", "INVALID_TRACK_MODE_CONFIGURATION");
  const domains = new Set(items.map((item) => item.domain));
  if (!topicIds.length || topicIds.some((topicId) => !domains.has(topicId))) throw new PublishingFailure("INVALID_TRACK_MODE_CONFIGURATION", "Certification Focus Practice topic scope is invalid.");
  return { ...focus, requestedLengths: Object.freeze([...requestedLengths]), topicIds: Object.freeze([...topicIds]) };
}
function certificationScenarioPractice(track, items) {
  const scenario = record(track.modeConfiguration.scenarioPractice, "Certification Scenario Practice blueprint", "MISSING_TRACK_MODE_CONFIGURATION");
  const keys = ["blueprintId", "blueprintVersion", "competencies", "modeId", "requestedLengths", "selectionScope", "shortening"];
  if (canonicalJson(Object.keys(scenario).sort(compare)) !== canonicalJson(keys) || scenario.blueprintId !== "gcp-ace-scenario-practice-v1" || scenario.blueprintVersion !== "1" || scenario.modeId !== "certification-scenario-practice" || scenario.selectionScope !== "explicit_tag_competency" || scenario.shortening !== "allowed_within_competency") throw new PublishingFailure("INVALID_TRACK_MODE_CONFIGURATION", "Certification Scenario Practice blueprint conflicts with its declared contract.");
  const requestedLengths = list(scenario.requestedLengths, "Certification Scenario Practice requested lengths", "INVALID_TRACK_MODE_CONFIGURATION");
  if (canonicalJson(requestedLengths) !== canonicalJson([10, 20, 40])) throw new PublishingFailure("INVALID_TRACK_MODE_CONFIGURATION", "Certification Scenario Practice must declare exactly 10, 20, and 40 requested lengths.");
  const byId = new Map(items.map((item) => [item.id, item]));
  const competencies = list(scenario.competencies, "Certification Scenario Practice competencies", "INVALID_TRACK_MODE_CONFIGURATION").map((entry) => {
    const competency = record(entry, "Certification Scenario Practice competency", "INVALID_TRACK_MODE_CONFIGURATION");
    if (canonicalJson(Object.keys(competency).sort(compare)) !== canonicalJson(["id", "label", "scenarioItemIds"])) throw new PublishingFailure("INVALID_TRACK_MODE_CONFIGURATION", "Certification Scenario Practice competency has unsupported fields.");
    const id = text(competency.id, "Certification Scenario Practice competency ID", "INVALID_TRACK_MODE_CONFIGURATION");
    const label = text(competency.label, "Certification Scenario Practice competency label", "INVALID_TRACK_MODE_CONFIGURATION");
    const scenarioItemIds = ids(competency.scenarioItemIds, `Certification Scenario Practice ${id} scenario item IDs`, "INVALID_TRACK_MODE_CONFIGURATION");
    if (scenarioItemIds.length < 10 || scenarioItemIds.some((itemId) => !byId.get(itemId)?.tags.includes(id))) throw new PublishingFailure("INVALID_TRACK_MODE_CONFIGURATION", "Certification Scenario Practice competency contains an item outside its explicit scenario-valid scope.");
    return Object.freeze({ id, label, scenarioItemIds: Object.freeze(scenarioItemIds) });
  });
  unique(competencies.map((competency) => competency.id), "INVALID_TRACK_MODE_CONFIGURATION", "Certification Scenario Practice competency IDs");
  if (!competencies.length) throw new PublishingFailure("INVALID_TRACK_MODE_CONFIGURATION", "Certification Scenario Practice requires at least one competency.");
  return Object.freeze({ ...scenario, requestedLengths: Object.freeze([...requestedLengths]), competencies: Object.freeze(competencies) });
}
function certificationWeakAreaReview(track) {
  const review = record(track.modeConfiguration.weakAreaReview, "Certification Weak Area Review blueprint", "MISSING_TRACK_MODE_CONFIGURATION");
  const keys = ["blueprintId", "blueprintVersion", "modeId", "persistentResolutionPolicy", "requestedLengths", "selectionScope", "shortening"];
  if (canonicalJson(Object.keys(review).sort(compare)) !== canonicalJson(keys) || review.blueprintId !== "gcp-ace-weak-area-review-v1" || review.blueprintVersion !== "1" || review.modeId !== "certification-weak-area-review" || review.shortening !== "allowed_within_eligible_review_evidence" || review.selectionScope !== "eligible_due_review_evidence" || review.persistentResolutionPolicy !== "two_consecutive_due_review_successes") throw new PublishingFailure("INVALID_TRACK_MODE_CONFIGURATION", "Certification Weak Area Review blueprint conflicts with its declared contract.");
  const requestedLengths = list(review.requestedLengths, "Certification Weak Area Review requested lengths", "INVALID_TRACK_MODE_CONFIGURATION");
  if (canonicalJson(requestedLengths) !== canonicalJson([10, 20])) throw new PublishingFailure("INVALID_TRACK_MODE_CONFIGURATION", "Certification Weak Area Review must declare exactly 10 and 20 requested lengths.");
  return Object.freeze({ ...review, requestedLengths: Object.freeze([...requestedLengths]) });
}
function validateCertificationSource(batches, track, family, taxonomyConfig, technicalInputFingerprint, sourceCommitValue) {
  const cloudDomains = certificationTaxonomy(taxonomyConfig); const profile = validateCertificationExamExperienceProfile(track.profile); const first = batches[0]; const batchIds = [];
  const legalModes = ids(family.modes?.map((mode) => mode?.id), "Certification family modes", "INVALID_MODE");
  for (const batch of batches) {
    if (batch.schemaVersion !== "certification-manual-source-v1" || batch.trackId !== track.trackId || batch.familyId !== track.familyId || batch.contentVersion !== first.contentVersion || batch.taxonomyVersion !== track.taxonomyVersion || canonicalJson(batch.declaredModes) !== canonicalJson(first.declaredModes)) throw new PublishingFailure("INVALID_ENVELOPE", "Certification batch envelope conflicts with track configuration.");
    batchIds.push(text(batch.batchId, "Certification batchId"));
  }
  unique(batchIds, "DUPLICATE_ID", "Certification batch IDs"); const declaredModes = ids(first.declaredModes, "Certification declaredModes", "INVALID_MODE");
  if (declaredModes.some((modeId) => !legalModes.includes(modeId))) throw new PublishingFailure("INVALID_MODE", "Certification declares a mode outside its family contract.");
  const items = batches.flatMap((batch) => list(batch.items, "Certification items").map((item) => validateCertificationItem(item, cloudDomains))); unique(items.map((item) => item.id), "DUPLICATE_ID", "Certification item IDs");
  for (const mode of family.modes) if (declaredModes.includes(mode.id) && items.length < mode.minimumPool) throw new PublishingFailure("MODE_UNREADY", `${mode.id} does not meet its minimum pool.`);
  const identities = items.map((item) => canonicalHash({ question: item.question.trim().toLocaleLowerCase(), options: item.options.map((option) => option.text.trim().toLocaleLowerCase()).sort(compare), correctOptionIds: [...item.correctOptionIds].sort(compare) })); unique(identities, "DUPLICATE_CONTENT_IDENTITY", "Certification content identities");
  const diagnosticBaseline = certificationDiagnosticBaseline(track, items);
  const focusPractice = certificationFocusPractice(track, items);
  const scenarioPractice = certificationScenarioPractice(track, items);
  const weakAreaReview = certificationWeakAreaReview(track);
  const itemFingerprints = Object.fromEntries(items.map((item) => [item.id, canonicalHash(item)]));
  const technicalEvidence = batches.map((batch) => evidenceFor({ track, family, batchId: batch.batchId, technicalInputFingerprint, batchFingerprint: canonicalHash(batch), itemFingerprints: Object.fromEntries(batch.items.map((item) => [item.id, itemFingerprints[item.id]])), validatedAtSourceCommit: sourceCommitValue }));
  const publishedItems = items.map((item) => ({ ...item, itemFingerprint: itemFingerprints[item.id] })).sort((a, b) => compare(a.id, b.id));
  return { contentVersion: first.contentVersion, taxonomyVersion: first.taxonomyVersion, declaredModes, items: publishedItems, itemFingerprints, modeStructures: {}, examExperienceProfile: profile, diagnosticBaseline, focusPractice, scenarioPractice, weakAreaReview, batches, technicalEvidence, technicalInputFingerprint };
}
function validateApprovals(records, inspected, evidenceRecords) {
  const evidenceById = new Map(evidenceRecords.filter((entry) => entry?.result === "passed").map((entry) => [entry.evidenceId, entry])); const approvedByItem = new Map();
  for (const approval of records) {
    if (approval.approvalSchemaVersion !== 1 || approval.reviewKind !== "editorial" || approval.familyId !== inspected.track.familyId || approval.trackId !== inspected.track.trackId || approval.finalDisposition !== "approved" || approval.revoked === true) continue;
    text(approval.approvalId, "approvalId", "INVALID_APPROVAL"); text(approval.reviewer, "approval reviewer", "INVALID_APPROVAL"); text(approval.reviewDate, "approval reviewDate", "INVALID_APPROVAL"); text(approval.primaryTaxonomyReference, "approval primaryTaxonomyReference", "INVALID_APPROVAL"); list(approval.factualAndEditorialDefectsFound, "approval factualAndEditorialDefectsFound", "INVALID_APPROVAL"); list(approval.requiredCorrections, "approval requiredCorrections", "INVALID_APPROVAL"); const evidence = evidenceById.get(approval.technicalValidationEvidenceId); if (!evidence) throw new PublishingFailure("INVALID_APPROVAL", "Approval does not reference retained passed technical evidence.");
    const approvedItems = list(approval.includedItems, "approval includedItems", "INVALID_APPROVAL").map((entry) => [text(entry.itemId, "approval itemId", "INVALID_APPROVAL"), text(entry.itemFingerprint, "approval itemFingerprint", "INVALID_APPROVAL")]).sort(([left], [right]) => compare(left, right)); const evidenceItems = Object.entries(record(evidence.itemFingerprints, "technical evidence itemFingerprints", "INVALID_APPROVAL")).map(([itemId, itemFingerprint]) => [itemId, text(itemFingerprint, "technical evidence itemFingerprint", "INVALID_APPROVAL")]).sort(([left], [right]) => compare(left, right));
    if (canonicalJson(approvedItems) !== canonicalJson(evidenceItems)) throw new PublishingFailure("INVALID_APPROVAL", "Approval item identities must exactly match its referenced technical evidence.");
    for (const [itemId, itemFingerprint] of approvedItems) { const current = inspected.source.items.find((item) => item.id === itemId && item.itemFingerprint === itemFingerprint); if (current && !approvedByItem.has(itemId)) approvedByItem.set(itemId, approval); }
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
  const technicalInputFingerprint = canonicalHash({ fingerprintSchemaVersion: 1, trackId: track.trackId, familyId: track.familyId, sourceBatches: batches, trackConfig: track, familyConfig: family, taxonomy, sourceSchema, validatorVersion: PUBLISHING_VALIDATOR_VERSION, canonicalSerializationVersion: CANONICAL_SERIALIZATION_VERSION });
  const source = track.familyId === "algorithms" ? validateAlgorithmsSource(batches, track, family, taxonomy, technicalInputFingerprint, commit) : validateCertificationSource(batches, track, family, taxonomy, technicalInputFingerprint, commit);
  return { track, family, taxonomy, source, sourceRepositoryCommit: commit };
}
const DURABLE_EVIDENCE_SCHEMA_VERSION = 1;
const DURABLE_EVIDENCE_GENERATOR_VERSION = "algorithms-release-evidence-v1";
function durableIdentity(value) { const { generatedAt, evidenceSha256, ...identity } = value; return identity; }
function durableEvidence(value) { return { ...value, evidenceSha256: canonicalHash(durableIdentity(value)) }; }
async function sourceManifestSha256(root, trackId) {
  const paths = ["manual/source", "config", "schemas/publishing", "scripts/publishing", "package.json", "package-lock.json"];
  const entries = [];
  for (const path of paths) {
    const target = join(root, path);
    try {
      const info = await stat(target);
      if (info.isDirectory()) for (const child of await files(target)) entries.push([relative(root, child), hash(await readFile(child))]);
      else entries.push([path, hash(await readFile(target))]);
    } catch (error) { if (error?.code !== "ENOENT") throw error; }
  }
  return canonicalHash({ trackId, files: entries.sort(([a], [b]) => compare(a, b)) });
}
function simulationCoverage(inspected) {
  const pools = inspected.source.modeStructures.simulationPools; const profiles = inspected.source.modeStructures.simulationProfiles;
  if (pools.length !== 1 || profiles.length !== 1) throw new PublishingFailure("INVALID_SIMULATION_EVIDENCE", "Algorithms release evidence requires exactly one simulation pool and profile.");
  const [pool] = pools; const [profile] = profiles;
  if (profile.poolId !== pool.poolId) throw new PublishingFailure("INVALID_SIMULATION_EVIDENCE", "Simulation profile must reference the covered pool.");
  const byId = new Map(inspected.source.items.map((item) => [item.id, item])); const itemIds = [...pool.itemIds].sort(compare); const selected = itemIds.map((id) => byId.get(id));
  if (selected.some((item) => !item)) throw new PublishingFailure("INVALID_SIMULATION_EVIDENCE", "Simulation pool references an unavailable item.");
  const coverage = (project) => [...new Set(selected.map(project).filter((value) => value !== undefined && value !== null))].sort(compare);
  return {
    profileId: profile.profileId, profileVersion: profile.profileVersion, poolId: pool.poolId, poolSha256: canonicalHash(pool), itemCount: itemIds.length, uniqueItemCount: new Set(itemIds).size, itemIds,
    roadmapNodeCoverage: coverage((item) => item.resolvedTaxonomy.roadmapNodeId), mentalUnitCoverage: coverage((item) => item.resolvedTaxonomy.primaryMentalUnitId), patternFamilyCoverage: coverage((item) => item.resolvedTaxonomy.patternFamilyId), patternVariantCoverage: coverage((item) => item.resolvedTaxonomy.patternVariantId), problemArchetypeCoverage: coverage((item) => item.resolvedTaxonomy.problemArchetypeId), primarySkillAtomCoverage: coverage((item) => item.resolvedTaxonomy.primarySkillAtomId), interactionTypeCoverage: coverage((item) => item.interactionType), learningStageCoverage: coverage((item) => item.resolvedTaxonomy.learningStage), coveragePolicyVersion: "algorithms-simulation-coverage-v1"
  };
}
function durableEnvelope({ evidenceKind, inspected, sourceCommit: sourceCommitValue, inputManifestSha256, payload }) {
  return durableEvidence({ schemaVersion: DURABLE_EVIDENCE_SCHEMA_VERSION, evidenceKind, familyId: inspected.family.familyId, trackId: inspected.track.trackId, sourceCommit: sourceCommitValue, technicalInputCommit: sourceCommitValue, contentVersion: inspected.source.contentVersion, taxonomyVersion: inspected.source.taxonomyVersion, generatedAt: new Date().toISOString(), generatorVersion: DURABLE_EVIDENCE_GENERATOR_VERSION, inputManifestSha256, ...payload });
}
async function readDurableEvidence(path, expected) {
  let prior;
  try { prior = await json(path); } catch (error) { if (error?.code === "ENOENT") return undefined; throw error; }
  if (prior.evidenceSha256 !== canonicalHash(durableIdentity(prior)) || (expected && canonicalJson(durableIdentity(prior)) !== canonicalJson(durableIdentity(expected)))) throw new PublishingFailure("IMMUTABLE_EVIDENCE", `Durable evidence differs from its canonical identity: ${path}`);
  return prior;
}
async function technicalEvidenceRecords(root, trackId, technicalCommit) {
  const path = join(root, "evidence", trackId, "technical", `${technicalCommit}.json`); const envelope = await readDurableEvidence(path);
  if (!envelope) return { path, envelope: undefined, records: [] };
  if (envelope.evidenceKind !== "technical-validation" || !Array.isArray(envelope.technicalEvidence)) throw new PublishingFailure("INVALID_DURABLE_EVIDENCE", "Technical durable evidence has an invalid shape.");
  return { path, envelope, records: envelope.technicalEvidence };
}
async function retainedTechnicalEvidenceRecords(root, trackId) {
  const base = join(root, "evidence", trackId, "technical"); const paths = (await files(base)).filter((path) => path.endsWith(".json")).sort(compare); const records = [];
  for (const path of paths) { const envelope = await readDurableEvidence(path); if (envelope?.evidenceKind === "technical-validation" && Array.isArray(envelope.technicalEvidence)) records.push(...envelope.technicalEvidence); }
  return records;
}
function evidenceIdentity(value) { if (Array.isArray(value)) return value.map(evidenceIdentity); const { validatedAtSourceCommit, evidenceId, ...identity } = value; return identity; }
export async function emitTechnicalEvidence({ root = ROOT, trackId, sourceRepositoryCommit }) {
  await assertCleanSource(root, sourceRepositoryCommit); const technicalCommit = await technicalInputCommit(root, sourceRepositoryCommit); const inspected = await inspectTrack({ root, trackId, sourceRepositoryCommit: technicalCommit }); const inputManifestSha256 = await sourceManifestSha256(root, trackId);
  const technical = durableEnvelope({ evidenceKind: "technical-validation", inspected, sourceCommit: technicalCommit, inputManifestSha256, payload: { technicalEvidence: inspected.source.technicalEvidence } });
  const coverage = inspected.family.familyId === "algorithms" ? durableEnvelope({ evidenceKind: "simulation-coverage", inspected, sourceCommit: technicalCommit, inputManifestSha256, payload: simulationCoverage(inspected) }) : undefined;
  const technicalPath = join(root, "evidence", trackId, "technical", `${technicalCommit}.json`); const coveragePath = coverage && join(root, "evidence", trackId, "simulation", `${coverage.profileId}.coverage.json`);
  const priorTechnical = await readDurableEvidence(technicalPath, technical); const priorCoverage = coverage && await readDurableEvidence(coveragePath);
  if (!priorTechnical) { await mkdir(dirname(technicalPath), { recursive: true }); await writeFile(technicalPath, canonicalJson(technical)); }
  if (coverage && (!priorCoverage || canonicalJson(durableIdentity(priorCoverage)) !== canonicalJson(durableIdentity(coverage)))) { await mkdir(dirname(coveragePath), { recursive: true }); await writeFile(coveragePath, canonicalJson(coverage)); }
  const resolvedCoverage = coverage && (priorCoverage && canonicalJson(durableIdentity(priorCoverage)) === canonicalJson(durableIdentity(coverage)) ? priorCoverage : coverage);
  return { evidence: (priorTechnical ?? technical).technicalEvidence, path: technicalPath, coveragePath, technicalEvidenceSha256: (priorTechnical ?? technical).evidenceSha256, coverageSha256: resolvedCoverage?.evidenceSha256, technicalInputFingerprint: inspected.source.technicalInputFingerprint, technicalInputCommit: technicalCommit };
}
export async function validateTrack({ root = ROOT, trackId, sourceRepositoryCommit }) {
  const technicalCommit = await technicalInputCommit(root, sourceRepositoryCommit); const inspected = await inspectTrack({ root, trackId, sourceRepositoryCommit: technicalCommit }); const inputManifestSha256 = await sourceManifestSha256(root, trackId); const [evidenceSchema, approvalSchema, activationSchema] = await Promise.all([json(join(root, "schemas", "publishing", "technical-validation-evidence.schema.json")), json(join(root, "schemas", "publishing", "editorial-approval-record.schema.json")), json(join(root, "schemas", "publishing", "content-activation-record.schema.json"))]); const technical = await technicalEvidenceRecords(root, trackId, technicalCommit); if (!technical.envelope || technical.envelope.familyId !== inspected.family.familyId || technical.envelope.contentVersion !== inspected.source.contentVersion || technical.envelope.taxonomyVersion !== inspected.source.taxonomyVersion || technical.envelope.inputManifestSha256 !== inputManifestSha256 || technical.envelope.sourceCommit !== technicalCommit || technical.envelope.technicalInputCommit !== technicalCommit) throw new PublishingFailure("MISSING_TECHNICAL_EVIDENCE", "Current technical inputs need matching tracked durable technical evidence."); const evidence = technical.records; evidence.forEach((entry, index) => validateJsonSchema(entry, evidenceSchema, `technical evidence ${index}`)); const expectedEvidence = new Map(inspected.source.technicalEvidence.map((entry) => [entry.evidenceId, entry])); const currentEvidence = evidence.filter((entry) => entry.result === "passed" && entry.technicalInputFingerprint === inspected.source.technicalInputFingerprint && expectedEvidence.has(entry.evidenceId) && canonicalJson(evidenceIdentity(entry)) === canonicalJson(evidenceIdentity(expectedEvidence.get(entry.evidenceId)))); if (currentEvidence.length !== expectedEvidence.size) throw new PublishingFailure("MISSING_TECHNICAL_EVIDENCE", "Current technical inputs need matching immutable passed technical evidence.");
  if (inspected.family.familyId === "algorithms") { const expectedCoverage = durableEnvelope({ evidenceKind: "simulation-coverage", inspected, sourceCommit: technicalCommit, inputManifestSha256, payload: simulationCoverage(inspected) }); const coveragePath = join(root, "evidence", trackId, "simulation", `${expectedCoverage.profileId}.coverage.json`); const coverage = await readDurableEvidence(coveragePath, expectedCoverage); if (!coverage) throw new PublishingFailure("MISSING_SIMULATION_COVERAGE", "Current simulation pool needs matching tracked durable coverage evidence."); }
  const approvalRecords = (await discoverRecords(root, "approvals", trackId)).map(({ value }) => value); approvalRecords.forEach((entry, index) => validateJsonSchema(entry, approvalSchema, `editorial approval ${index}`)); const activationRecords = (await discoverRecords(root, "activations", trackId)).map(({ value }) => value); activationRecords.forEach((entry, index) => validateJsonSchema(entry, activationSchema, `activation record ${index}`)); const approvals = validateApprovals(approvalRecords, inspected, await retainedTechnicalEvidenceRecords(root, trackId)); const approvalCoverage = validateActivation(activationRecords, inspected, approvals); return { ...inspected, approvalCoverage };
}
function bankFor(validated) { if (validated.track.familyId !== "algorithms") return { formatVersion: 1, trackId: validated.track.trackId, familyId: validated.track.familyId, contentVersion: validated.source.contentVersion, examExperienceProfile: validated.source.examExperienceProfile, diagnosticBaseline: validated.source.diagnosticBaseline, focusPractice: validated.source.focusPractice, scenarioPractice: validated.source.scenarioPractice, weakAreaReview: validated.source.weakAreaReview, items: validated.source.items }; const modes = compileModeDeclarations(validated.source.modeStructures); return Object.freeze({ formatVersion: 1, trackId: "algorithms", familyId: "algorithms", contentVersion: validated.source.contentVersion, items: Object.freeze(validated.source.items.map((item) => compilePublishedAlgorithmsItem(item, item.compatibilityMemberships, item.itemFingerprint))), ...modes, approvalActivationIdentity: validated.approvalCoverage.identity }); }
export async function buildTrack({ root = ROOT, trackId, outputRoot = join(ROOT, "artifacts"), sourceRepositoryCommit }) {
  const cleanCommit = await assertCleanSource(root, sourceRepositoryCommit); const validated = await validateTrack({ root, trackId, ...(sourceRepositoryCommit ? { sourceRepositoryCommit } : {}) }); const bank = bankFor(validated); const artifactBytes = canonicalJson({ envelopeVersion: 1, schemaVersion: "published-bank-v1", contentVersion: validated.source.contentVersion, taxonomyVersion: validated.source.taxonomyVersion, bank });
  const artifact = { trackId, familyId: validated.track.familyId, contentVersion: validated.source.contentVersion, taxonomyVersion: validated.source.taxonomyVersion, schemaVersion: "published-bank-v1", checksumSha256: hash(artifactBytes), sourceRepositoryCommit: cleanCommit, approvalCoverage: { identity: validated.approvalCoverage.identity, itemIds: validated.approvalCoverage.itemIds }, declaredModes: validated.source.declaredModes, artifactBytes };
  const versionDirectory = join(outputRoot, "tracks", trackId, artifact.contentVersion); const out = join(versionDirectory, "track-artifact.json"); const reportPath = join(versionDirectory, "build-report.json");
  try { await stat(versionDirectory); throw new PublishingFailure("IMMUTABLE_VERSION", `Artifact version already exists: ${trackId}/${artifact.contentVersion}.`); } catch (error) { if (error?.code !== "ENOENT") throw error; }
  const report = { reportSchemaVersion: 3, phase: "build", trackId, familyId: artifact.familyId, contentVersion: artifact.contentVersion, taxonomyVersion: artifact.taxonomyVersion, sourceRepositoryCommit: cleanCommit, technicalInputFingerprint: validated.source.technicalInputFingerprint, approvalActivationIdentity: artifact.approvalCoverage.identity, checksumSha256: artifact.checksumSha256, itemCount: artifact.approvalCoverage.itemIds.length };
  const pendingDirectory = `${versionDirectory}.pending-${artifact.checksumSha256}`;
  await mkdir(dirname(versionDirectory), { recursive: true }); await mkdir(pendingDirectory, { recursive: false });
  try { await writeFile(join(pendingDirectory, "track-artifact.json"), canonicalJson(artifact)); await writeFile(join(pendingDirectory, "build-report.json"), canonicalJson(report)); await rename(pendingDirectory, versionDirectory); } catch (error) { await rm(pendingDirectory, { recursive: true, force: true }); throw error; }
  return { artifact, path: out, reportPath };
}
export async function verifyArtifact(path) { const artifact = await json(path); const expectedKeys = ["approvalCoverage", "artifactBytes", "checksumSha256", "contentVersion", "declaredModes", "familyId", "schemaVersion", "sourceRepositoryCommit", "taxonomyVersion", "trackId"]; if (canonicalJson(Object.keys(artifact).sort(compare)) !== canonicalJson(expectedKeys)) throw new PublishingFailure("INVALID_ARTIFACT", "Track artifact reference has an unsupported external shape."); if (hash(text(artifact.artifactBytes, "artifactBytes")) !== artifact.checksumSha256) throw new PublishingFailure("CHECKSUM_MISMATCH", "Artifact bytes do not match checksum."); const envelope = JSON.parse(artifact.artifactBytes); if (envelope.envelopeVersion !== 1 || envelope.schemaVersion !== "published-bank-v1" || envelope.contentVersion !== artifact.contentVersion || envelope.taxonomyVersion !== artifact.taxonomyVersion || envelope.bank.trackId !== artifact.trackId || envelope.bank.familyId !== artifact.familyId) throw new PublishingFailure("INVALID_ARTIFACT", "Published artifact envelope identity is invalid."); if (artifact.familyId === "algorithms") { const bankKeys = ["approvalActivationIdentity", "compatibilitySets", "contentVersion", "contrastSets", "familyId", "formatVersion", "interleavedScopes", "items", "practiceBlueprints", "recognitionSets", "simulationPools", "simulationProfiles", "trackId"]; const requiredItemKeys = ["compatibilityMemberships", "feedback", "id", "interaction", "itemFingerprint", "prompt", "provenance", "scoringContract", "taxonomy"]; const optionalItemKeys = ["constraints", "difficulty"]; const validItem = (item) => { const keys = Object.keys(item); return requiredItemKeys.every((key) => keys.includes(key)) && keys.every((key) => requiredItemKeys.includes(key) || optionalItemKeys.includes(key)); }; if (canonicalJson(Object.keys(envelope.bank).sort(compare)) !== canonicalJson(bankKeys) || envelope.bank.formatVersion !== 1 || envelope.bank.contentVersion !== artifact.contentVersion || envelope.bank.items.some((item) => !validItem(item))) throw new PublishingFailure("INVALID_ARTIFACT", "Algorithms published bank does not conform to the exact application contract."); } else { const bankKeys = ["contentVersion", "diagnosticBaseline", "examExperienceProfile", "familyId", "focusPractice", "formatVersion", "items", "scenarioPractice", "trackId", "weakAreaReview"]; if (canonicalJson(Object.keys(envelope.bank).sort(compare)) !== canonicalJson(bankKeys) || envelope.bank.formatVersion !== 1 || envelope.bank.contentVersion !== artifact.contentVersion) throw new PublishingFailure("INVALID_ARTIFACT", "Certification published bank does not conform to the exact application contract."); } return artifact; }
const releaseIdentifier = (value) => {
  const releaseId = text(value, "releaseId", "INVALID_RELEASE");
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(releaseId)) throw new PublishingFailure("INVALID_RELEASE", "releaseId must be a lowercase hyphenated identifier and cannot be an option.");
  return releaseId;
};
export async function publishRelease({ root = ROOT, releaseId, artifactPaths, outputRoot = join(ROOT, "artifacts"), sourceRepositoryCommit }) {
  const cleanCommit = await assertCleanSource(root, sourceRepositoryCommit); const canonicalReleaseId = releaseIdentifier(releaseId); const paths = list(artifactPaths, "artifactPaths", "INVALID_RELEASE"); if (!paths.length) throw new PublishingFailure("INVALID_RELEASE", "A release must contain at least one verified track artifact."); const artifacts = await Promise.all(paths.map(verifyArtifact)); unique(artifacts.map((artifact) => artifact.trackId), "INVALID_RELEASE", "release track IDs"); const release = { manifest: { envelopeVersion: 1, releaseId: canonicalReleaseId, sourceRepositoryCommit: cleanCommit }, artifacts: artifacts.sort((a, b) => compare(a.trackId, b.trackId)) }; const releaseDirectory = join(outputRoot, "releases", canonicalReleaseId); const out = join(releaseDirectory, "release.json"); const exported = join(releaseDirectory, "generated-bundled-content.mjs");
  try { await stat(releaseDirectory); throw new PublishingFailure("IMMUTABLE_VERSION", `Release already exists: ${releaseId}.`); } catch (error) { if (error?.code !== "ENOENT") throw error; } const pendingDirectory = `${releaseDirectory}.pending-${canonicalHash(release)}`;
  await mkdir(dirname(releaseDirectory), { recursive: true }); await mkdir(pendingDirectory, { recursive: false });
  try { await writeFile(join(pendingDirectory, "release.json"), canonicalJson(release)); await writeFile(join(pendingDirectory, "generated-bundled-content.mjs"), `export const GENERATED_BUNDLED_CONTENT_RELEASE = Object.freeze(${JSON.stringify(release)});\n`); await rename(pendingDirectory, releaseDirectory); } catch (error) { await rm(pendingDirectory, { recursive: true, force: true }); throw error; }
  return { release, path: out, exportPath: exported };
}
