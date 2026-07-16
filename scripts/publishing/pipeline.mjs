import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const exec = promisify(execFile);
export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export class PublishingFailure extends Error { constructor(code, message) { super(`${code}: ${message}`); this.code = code; } }
const compare = (left, right) => left === right ? 0 : left < right ? -1 : 1;
export const hash = (value) => createHash("sha256").update(value).digest("hex");
export const CANONICAL_SERIALIZATION_VERSION = "canonical-json-v1";
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
  if (taxonomy.schemaVersion !== "algorithms-taxonomy-v2") throw new PublishingFailure("INVALID_REFERENCE", "Algorithms taxonomy schema is unsupported.");
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
  if (profile.profileKind !== "internal_learning_profile" || profile.totalOccurrences !== 40 || profile.poolId !== pool.poolId || profile.selectionPolicy?.uniqueItems !== true || profile.selectionPolicy?.replacement !== false || profile.selectionPolicy?.deterministic !== true || profile.selectionPolicy?.algorithmVersion !== "sha256-ranked-constraints-v1") throw new PublishingFailure("INVALID_SIMULATION_PROFILE", "Simulation profile contract is invalid.");
  for (const key of ["profileId", "profileVersion"]) text(profile[key], `simulation ${key}`, "INVALID_SIMULATION_PROFILE");
  const provenance = record(profile.provenance, "simulation provenance", "INVALID_SIMULATION_PROFILE"); for (const key of ["approvedBy", "approvedAt", "rationale"]) text(provenance[key], `simulation provenance.${key}`, "INVALID_SIMULATION_PROFILE"); if (provenance.authority !== "patternly_product") throw new PublishingFailure("INVALID_SIMULATION_PROFILE", "Simulation provenance authority is invalid.");
  const poolItems = pool.itemIds.map((id) => itemsById.get(id));
  for (const item of poolItems) if (item.resolvedTaxonomy.learningStage !== "simulation" && !(profile.allowedLearningStages ?? []).includes(item.resolvedTaxonomy.learningStage)) throw new PublishingFailure("INVALID_SIMULATION_PROFILE", "Simulation pool item has no legal learning stage.");
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
export function selectSimulationItems({ profile, pool, items, selectionSeed }) {
  const itemMap = new Map(items.map((item) => [item.id, item])); const poolIds = ids(pool.itemIds, "simulation pool itemIds", "INVALID_SIMULATION_POOL");
  if (poolIds.length < 40) throw new PublishingFailure("INSUFFICIENT_POOL", "Simulation pool requires at least 40 unique items.");
  const ranked = poolIds.map((id) => ({ id, rank: canonicalHash([profile.profileId, profile.profileVersion, pool.poolId, pool.poolVersion, text(selectionSeed, "selectionSeed"), id]) })).sort((a, b) => compare(a.rank, b.rank) || compare(a.id, b.id));
  const distributions = profile.distributions ?? [];
  const eligible = ranked.map(({ id }) => { const item = itemMap.get(id); if (!item) throw new PublishingFailure("INVALID_SIMULATION_POOL", `Simulation pool references unknown item ${id}.`); return item; });
  let best;
  const score = (selected) => distributions.reduce((sum, distribution) => sum + distribution.buckets.reduce((inner, bucket) => inner + Math.abs(selected.filter((item) => valueForDimension(item, distribution.dimension) === bucket.valueId).length - bucket.target), 0), 0);
  const validPartial = (selected, offset) => distributions.every((distribution) => distribution.buckets.every((bucket) => {
    const count = selected.filter((item) => valueForDimension(item, distribution.dimension) === bucket.valueId).length;
    const remaining = eligible.slice(offset).filter((item) => valueForDimension(item, distribution.dimension) === bucket.valueId).length;
    return count <= bucket.maximum && count + remaining >= bucket.minimum;
  }));
  const visit = (offset, selected) => {
    if (selected.length === 40) { if (validPartial(selected, eligible.length)) { const candidate = { ids: selected.map((item) => item.id), score: score(selected) }; if (!best || candidate.score < best.score || (candidate.score === best.score && compare(candidate.ids.join("\u0000"), best.ids.join("\u0000")) < 0)) best = candidate; } return; }
    if (eligible.length - offset < 40 - selected.length || !validPartial(selected, offset)) return;
    visit(offset + 1, [...selected, eligible[offset]]); visit(offset + 1, selected);
  };
  visit(0, []);
  if (!best) throw new PublishingFailure("SIMULATION_INFEASIBLE", "No legal 40-item simulation selection satisfies the profile.");
  return best.ids;
}
function validateModeStructures(structures, declaredModes, family, items, taxonomy) {
  const source = record(structures ?? {}, "modeStructures", "INVALID_MODE"); const itemsById = new Map(items.map((item) => [item.id, item]));
  const named = (key, idKey) => { const values = list(source[key] ?? [], key, "INVALID_MODE"); unique(values.map((value) => text(value?.[idKey], `${key} id`, "INVALID_MODE")), "INVALID_MODE", `${key} IDs`); return new Map(values.map((value) => [value[idKey], value])); };
  const recognition = named("recognitionSets", "setId"); const contrast = named("contrastSets", "setId"); const scopes = named("interleavedScopes", "scopeId"); const compatibility = named("compatibilitySets", "id"); const pools = named("simulationPools", "poolId"); const profiles = named("simulationProfiles", "profileId"); const blueprints = named("practiceBlueprints", "blueprintId");
  for (const set of recognition.values()) { validateMembership(set.itemIds, itemsById, "recognition set itemIds"); ids(set.legalLearningStages, "recognition legalLearningStages", "INVALID_MODE"); record(set.taxonomyScope, "recognition taxonomyScope", "INVALID_MODE"); }
  for (const set of contrast.values()) { const setItems = validateMembership(set.itemIds, itemsById, "contrast set itemIds"); const primary = requireTaxonomy(taxonomy.mentalUnits, set.primaryMentalUnitId, "contrast primary mental unit"); const contrasted = ids(set.contrastedMentalUnitIds, "contrasted mental units", "INVALID_MODE"); if (!contrasted.length || contrasted.includes(set.primaryMentalUnitId)) throw new PublishingFailure("INVALID_MODE", "Contrast set mental units are invalid."); for (const id of contrasted) requireTaxonomy(taxonomy.mentalUnits, id, "contrasted mental unit"); requireTaxonomy(taxonomy.falseHeuristics, set.falseHeuristicId, "false heuristic"); text(set.transferBoundary, "contrast transferBoundary", "INVALID_MODE"); if (!setItems.every((id) => [set.primaryMentalUnitId, ...contrasted].includes(itemsById.get(id).resolvedTaxonomy.primaryMentalUnitId))) throw new PublishingFailure("INVALID_MODE", "Contrast set escapes its declared taxonomy boundary."); if (!primary) throw new PublishingFailure("INVALID_MODE", "Contrast set is invalid."); }
  for (const scope of scopes.values()) { const scopeItems = validateMembership(scope.itemIds, itemsById, "interleaved scope itemIds"); const units = ids(scope.mentalUnitIds, "interleaved mentalUnitIds", "INVALID_MODE"); if (units.length < 2) throw new PublishingFailure("INVALID_MODE", "Interleaved scope must declare at least two mental units."); for (const id of units) requireTaxonomy(taxonomy.mentalUnits, id, "interleaved mental unit"); ids(scope.legalLearningStages, "interleaved legalLearningStages", "INVALID_MODE"); if (!scopeItems.every((id) => units.includes(itemsById.get(id).resolvedTaxonomy.primaryMentalUnitId))) throw new PublishingFailure("INVALID_MODE", "Interleaved scope escapes its taxonomy boundary."); }
  for (const set of compatibility.values()) { if (!["same_mechanism", "reviewed_variant", "compatible_contrast", "repair"].includes(set.relation) || !["symmetric", "directed"].includes(set.direction)) throw new PublishingFailure("INVALID_MODE", "Compatibility relation is invalid."); const sourceIds = validateMembership(set.sourceItemIds, itemsById, "compatibility sourceItemIds"); const targetIds = validateMembership(set.targetItemIds, itemsById, "compatibility targetItemIds"); const all = unionIds([sourceIds, targetIds], "compatibility item IDs"); if (all.length < 2) throw new PublishingFailure("INVALID_MODE", "Compatibility set must relate distinct items."); const boundaries = new Set(all.map((id) => `${itemsById.get(id).resolvedTaxonomy.primaryMentalUnitId}/${itemsById.get(id).resolvedTaxonomy.patternFamilyId}`)); if (boundaries.size !== 1) throw new PublishingFailure("INVALID_MODE", "Compatibility set crosses an illegal taxonomy boundary."); }
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
  const memberships = new Map(items.map((item) => [item.id, []])); for (const set of compatibility.values()) for (const id of unionIds([set.sourceItemIds, set.targetItemIds], "compatibility item IDs")) memberships.get(id).push(set.id); for (const values of memberships.values()) values.sort(compare);
  return { practiceBlueprints: resolvedBlueprints.sort((a, b) => compare(a.modeId, b.modeId)), recognitionSets: [...recognition.values()], contrastSets: [...contrast.values()], interleavedScopes: [...scopes.values()], compatibilitySets: [...compatibility.values()], simulationPools: [...pools.values()], simulationProfiles: [...profiles.values()], memberships };
}
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
function validateApprovals(records, inspected) {
  const evidenceByBatch = new Map(inspected.source.technicalEvidence.map((evidence) => [evidence.batchId, evidence])); const approvalByBatch = new Map();
  for (const approval of records) {
    if (approval.approvalSchemaVersion !== 1 || approval.reviewKind !== "editorial" || approval.familyId !== inspected.track.familyId || approval.trackId !== inspected.track.trackId || approval.finalDisposition !== "approved") throw new PublishingFailure("INVALID_APPROVAL", "Editorial approval identity is invalid.");
    text(approval.approvalId, "approvalId", "INVALID_APPROVAL"); text(approval.reviewer, "approval reviewer", "INVALID_APPROVAL"); text(approval.reviewDate, "approval reviewDate", "INVALID_APPROVAL"); text(approval.primaryTaxonomyReference, "approval primaryTaxonomyReference", "INVALID_APPROVAL"); list(approval.factualAndEditorialDefectsFound, "approval factualAndEditorialDefectsFound", "INVALID_APPROVAL"); list(approval.requiredCorrections, "approval requiredCorrections", "INVALID_APPROVAL"); if (approvalByBatch.has(approval.batchId) || !evidenceByBatch.has(approval.batchId)) throw new PublishingFailure("INVALID_APPROVAL", "Approval must belong to one known batch.");
    const batch = inspected.source.batches.find((entry) => entry.batchId === approval.batchId); if (inspected.track.familyId === "algorithms" && batch?.taxonomy?.primaryMentalUnitId !== approval.primaryTaxonomyReference) throw new PublishingFailure("INVALID_APPROVAL", "Approval primary taxonomy reference does not own its batch.");
    const evidence = evidenceByBatch.get(approval.batchId); if (approval.technicalValidationEvidenceId !== evidence.evidenceId || evidence.result !== "passed") throw new PublishingFailure("INVALID_APPROVAL", "Approval does not reference passed technical evidence.");
    const expected = Object.entries(evidence.itemFingerprints).sort(([a], [b]) => compare(a, b)); const included = list(approval.includedItems, "approval includedItems", "INVALID_APPROVAL").map((entry) => [text(entry.itemId, "approval itemId", "INVALID_APPROVAL"), text(entry.itemFingerprint, "approval itemFingerprint", "INVALID_APPROVAL")]).sort(([a], [b]) => compare(a, b));
    if (canonicalJson(included) !== canonicalJson(expected) || approval.targetContentVersion !== inspected.source.contentVersion) throw new PublishingFailure("MISSING_APPROVAL", "Editorial approval does not exactly cover immutable batch fingerprints.");
    approvalByBatch.set(approval.batchId, approval);
  }
  if (approvalByBatch.size !== evidenceByBatch.size) throw new PublishingFailure("MISSING_APPROVAL", "Every source batch needs one approved editorial record.");
  return approvalByBatch;
}
function validateActivation(records, inspected, approvals) {
  if (records.length !== 1) throw new PublishingFailure("MISSING_ACTIVATION", "Exactly one manual activation record is required for a track version."); const activation = records[0];
  if (activation.activationSchemaVersion !== 1 || activation.trackId !== inspected.track.trackId || activation.familyId !== inspected.track.familyId || activation.contentVersion !== inspected.source.contentVersion || activation.taxonomyVersion !== inspected.source.taxonomyVersion) throw new PublishingFailure("INVALID_ACTIVATION", "Activation identity is invalid.");
  text(activation.activationId, "activationId", "INVALID_ACTIVATION"); const coverage = list(activation.itemCoverage, "activation itemCoverage", "INVALID_ACTIVATION").map((entry) => [text(entry.itemId, "activation itemId", "INVALID_ACTIVATION"), text(entry.itemFingerprint, "activation itemFingerprint", "INVALID_ACTIVATION"), text(entry.approvalId, "activation approvalId", "INVALID_ACTIVATION")]).sort(([a], [b]) => compare(a, b)); const expected = inspected.source.items.map((item) => [item.id, item.itemFingerprint]).sort(([a], [b]) => compare(a, b));
  if (coverage.length !== expected.length || coverage.some(([id, fingerprint], index) => id !== expected[index][0] || fingerprint !== expected[index][1])) throw new PublishingFailure("MISSING_ACTIVATION", "Activation must exactly cover the whole immutable bank.");
  for (const [id, , approvalId] of coverage) { const batch = inspected.source.batches.find((entry) => entry.items.some((item) => item.id === id)); if (!batch || approvals.get(batch.batchId)?.approvalId !== approvalId) throw new PublishingFailure("INVALID_ACTIVATION", "Activation references an approval that does not own the item."); }
  return { identity: `activation:${canonicalHash(activation)}`, itemIds: expected.map(([id]) => id), activation };
}
export async function inspectTrack({ root = ROOT, trackId, sourceRepositoryCommit }) {
  const { track, family, taxonomy } = await config(root, trackId); const batches = (await discoverRecords(root, "source", trackId)).map(({ value }) => value); const commit = await sourceCommit(root, sourceRepositoryCommit);
  const source = track.familyId === "algorithms" ? validateAlgorithmsSource(batches, track, family, taxonomy, commit) : validateCertificationSource(batches, track, family, commit);
  return { track, family, taxonomy, source, sourceRepositoryCommit: commit };
}
export async function validateTrack({ root = ROOT, trackId, sourceRepositoryCommit }) {
  const inspected = await inspectTrack({ root, trackId, sourceRepositoryCommit }); const approvals = validateApprovals((await discoverRecords(root, "approvals", trackId)).map(({ value }) => value), inspected); const approvalCoverage = validateActivation((await discoverRecords(root, "activations", trackId)).map(({ value }) => value), inspected, approvals); return { ...inspected, approvalCoverage };
}
function bankFor(validated) { const common = { formatVersion: 1, trackId: validated.track.trackId, familyId: validated.track.familyId, contentVersion: validated.source.contentVersion, items: validated.source.items, resolvedModeDeclarations: validated.source.modeStructures, technicalValidationEvidence: validated.source.technicalEvidence, approvalActivationIdentity: validated.approvalCoverage.identity }; return common; }
export async function buildTrack({ root = ROOT, trackId, outputRoot = join(ROOT, "artifacts"), sourceRepositoryCommit }) {
  const cleanCommit = await assertCleanSource(root, sourceRepositoryCommit); const validated = await validateTrack({ root, trackId, sourceRepositoryCommit: cleanCommit }); const bank = bankFor(validated); const artifactBytes = canonicalJson({ envelopeVersion: 1, schemaVersion: "published-bank-v1", contentVersion: validated.source.contentVersion, taxonomyVersion: validated.source.taxonomyVersion, bank });
  const artifact = { trackId, familyId: validated.track.familyId, contentVersion: validated.source.contentVersion, taxonomyVersion: validated.source.taxonomyVersion, schemaVersion: "published-bank-v1", checksumSha256: hash(artifactBytes), sourceRepositoryCommit: cleanCommit, approvalCoverage: { identity: validated.approvalCoverage.identity, itemIds: validated.approvalCoverage.itemIds }, declaredModes: validated.source.declaredModes, artifactBytes };
  const out = join(outputRoot, "tracks", trackId, artifact.contentVersion, "track-artifact.json"); try { await stat(out); throw new PublishingFailure("IMMUTABLE_VERSION", `Artifact version already exists: ${trackId}/${artifact.contentVersion}.`); } catch (error) { if (error?.code !== "ENOENT") throw error; }
  await mkdir(dirname(out), { recursive: true }); await writeFile(out, canonicalJson(artifact)); const reportPath = join(root, "reports", "publishing", `${trackId}-${artifact.contentVersion}.json`); const evidencePath = join(root, "reports", "publishing", `${trackId}-${artifact.contentVersion}.technical-evidence.json`); await mkdir(dirname(reportPath), { recursive: true }); await writeFile(evidencePath, canonicalJson(validated.source.technicalEvidence)); await writeFile(reportPath, canonicalJson({ reportSchemaVersion: 2, trackId, familyId: artifact.familyId, contentVersion: artifact.contentVersion, taxonomyVersion: artifact.taxonomyVersion, sourceRepositoryCommit: cleanCommit, sourceTreeFingerprint: validated.source.sourceTreeFingerprint, approvalActivationIdentity: artifact.approvalCoverage.identity, checksumSha256: artifact.checksumSha256, itemCount: artifact.approvalCoverage.itemIds.length })); return { artifact, path: out, reportPath, evidencePath };
}
export async function verifyArtifact(path) { const artifact = await json(path); const expectedKeys = ["approvalCoverage", "artifactBytes", "checksumSha256", "contentVersion", "declaredModes", "familyId", "schemaVersion", "sourceRepositoryCommit", "taxonomyVersion", "trackId"]; if (canonicalJson(Object.keys(artifact).sort(compare)) !== canonicalJson(expectedKeys)) throw new PublishingFailure("INVALID_ARTIFACT", "Track artifact reference has an unsupported external shape."); if (hash(text(artifact.artifactBytes, "artifactBytes")) !== artifact.checksumSha256) throw new PublishingFailure("CHECKSUM_MISMATCH", "Artifact bytes do not match checksum."); const envelope = JSON.parse(artifact.artifactBytes); if (envelope.envelopeVersion !== 1 || envelope.schemaVersion !== "published-bank-v1" || envelope.contentVersion !== artifact.contentVersion || envelope.taxonomyVersion !== artifact.taxonomyVersion || envelope.bank.trackId !== artifact.trackId || envelope.bank.familyId !== artifact.familyId) throw new PublishingFailure("INVALID_ARTIFACT", "Published artifact envelope identity is invalid."); return artifact; }
export async function publishRelease({ root = ROOT, releaseId, artifactPaths, outputRoot = join(ROOT, "artifacts"), sourceRepositoryCommit }) {
  const cleanCommit = await assertCleanSource(root, sourceRepositoryCommit); text(releaseId, "releaseId"); const artifacts = await Promise.all(list(artifactPaths, "artifactPaths", "INVALID_RELEASE").map(verifyArtifact)); unique(artifacts.map((artifact) => artifact.trackId), "INVALID_RELEASE", "release track IDs"); if (artifacts.some((artifact) => artifact.sourceRepositoryCommit !== cleanCommit)) throw new PublishingFailure("SOURCE_COMMIT_MISMATCH", "Release and every artifact must use the same clean source commit."); const release = { manifest: { envelopeVersion: 1, releaseId, sourceRepositoryCommit: cleanCommit }, artifacts: artifacts.sort((a, b) => compare(a.trackId, b.trackId)) }; const out = join(outputRoot, "releases", releaseId, "release.json"); try { await stat(out); throw new PublishingFailure("IMMUTABLE_VERSION", `Release already exists: ${releaseId}.`); } catch (error) { if (error?.code !== "ENOENT") throw error; } await mkdir(dirname(out), { recursive: true }); await writeFile(out, canonicalJson(release)); const exported = join(root, "exports", "app", `generated-${releaseId}.mjs`); await mkdir(dirname(exported), { recursive: true }); await writeFile(exported, `export const GENERATED_BUNDLED_CONTENT_RELEASE = Object.freeze(${JSON.stringify(release)});\n`); return { release, path: out, exportPath: exported };
}
