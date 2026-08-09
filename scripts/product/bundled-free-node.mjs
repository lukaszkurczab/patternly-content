import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalJson, PublishingFailure, validateCanonicalJsonSchema, verifyArtifactRecord } from "../publishing/pipeline.mjs";
import { inventoryFromPinnedRelease, loadCanonicalFreeNodeInventoryPins, validateFreeNodeInventory } from "./free-node-inventory.mjs";
import { ROOT, loadCanonicalTrackBriefs } from "./track-briefs.mjs";

export const BUNDLED_FREE_NODE_SCHEMA_VERSION = "bundled-free-node-v1";
export const BUNDLED_FREE_NODE_PAYLOAD_SCHEMA_VERSION = "bundled-free-node-payload-v1";
const compare = (left, right) => left === right ? 0 : left < right ? -1 : 1;
const fail = (code, message) => { throw new PublishingFailure(code, message); };
const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const isObject = (value) => !!value && typeof value === "object" && !Array.isArray(value);
const itemReferenceKeys = new Set(["itemIds", "resolvedItemIds", "scenarioItemIds", "sourceItemIds", "targetItemIds"]);

function exactKeys(value, keys, label, code = "INVALID_BUNDLED_FREE_NODE") {
  if (!isObject(value) || canonicalJson(Object.keys(value).sort(compare)) !== canonicalJson([...keys].sort(compare))) fail(code, `${label} has an unsupported shape.`);
}

function itemReferences(value, key, references = []) {
  if (Array.isArray(value)) {
    if (itemReferenceKeys.has(key)) {
      for (const entry of value) if (typeof entry === "string") references.push(entry);
    } else {
      for (const entry of value) itemReferences(entry, undefined, references);
    }
    return references;
  }
  if (isObject(value)) for (const [childKey, child] of Object.entries(value)) itemReferences(child, childKey, references);
  return references;
}

function assetReferences(value, references = []) {
  if (Array.isArray(value)) for (const entry of value) assetReferences(entry, references);
  else if (isObject(value)) for (const [key, child] of Object.entries(value)) {
    if (key === "assetId" && typeof child === "string") references.push(child);
    assetReferences(child, references);
  }
  return references;
}

function artifactFor(release, trackId) {
  const matches = Array.isArray(release?.artifacts) ? release.artifacts.filter((entry) => entry?.trackId === trackId) : [];
  if (matches.length !== 1) fail("RELEASE_TRACK_MISMATCH", `Release must contain exactly one artifact for ${trackId}.`);
  return verifyArtifactRecord(matches[0]);
}

function nodeValue(item, selector) {
  if (selector.field === "taxonomy.roadmapNodeId") return item?.taxonomy?.roadmapNodeId;
  if (selector.field === "domain") return item?.domain;
  fail("UNSUPPORTED_FREE_NODE_SELECTOR", `Unsupported free-node selector ${selector.field}.`);
}

function preflightInventory({ artifact, brief, inventory }) {
  if (!Array.isArray(inventory?.items) || inventory.items.length === 0 || inventory.itemCount === 0) fail("EMPTY_FREE_NODE", `Bundled free node ${brief.trackId}/${brief.freeNodeId} has no items.`);
  const bank = JSON.parse(artifact.artifactBytes).bank;
  const allItemsById = new Map(bank.items.map((item) => [item.id, item]));
  const selected = [];
  for (const entry of inventory.items) {
    const item = allItemsById.get(entry?.id);
    if (!item) fail("DANGLING_FREE_NODE_REFERENCE", `Inventory references an item absent from the pinned artifact: ${entry?.id}.`);
    if (item.itemFingerprint !== entry.itemFingerprint) fail("BUNDLED_FREE_NODE_PROVENANCE_MISMATCH", `Inventory fingerprint differs from the pinned item: ${entry.id}.`);
    if (nodeValue(item, inventory.selector) !== brief.freeNodeId) fail("MIXED_FREE_NODE", `Inventory item ${entry.id} belongs outside ${brief.freeNodeId}.`);
    selected.push(item);
  }
  if (selected.length !== inventory.itemCount || new Set(selected.map((item) => item.id)).size !== selected.length) fail("INVALID_FREE_NODE_INVENTORY", "Bundled free-node inventory count or identity set is invalid.");
  return { bank, allItemsById, selected: selected.sort((left, right) => compare(left.id, right.id)) };
}

function requireClosedItemReferences({ label, value, allItemIds, selectedItemIds, issues }) {
  const references = [...new Set(itemReferences(value))].sort(compare);
  const dangling = references.filter((id) => !allItemIds.has(id));
  if (dangling.length) fail("DANGLING_FREE_NODE_REFERENCE", `${label} references unknown item ${dangling[0]}.`);
  const outside = references.filter((id) => !selectedItemIds.has(id));
  if (outside.length) issues.push(`${label} references ${outside.length} item(s) outside the free node`);
  return { references, closed: references.length > 0 && outside.length === 0 };
}

function failModeClosure(family, itemCount, issues) {
  const distinct = [...new Set(issues)];
  const shown = distinct.slice(0, 10);
  const remaining = distinct.length - shown.length;
  fail("FREE_NODE_MODE_NOT_CLOSED", `Published ${family} modes are not closed over ${itemCount} free-node items: ${shown.join("; ")}${remaining > 0 ? `; plus ${remaining} further non-node-closed reference(s)` : ""}.`);
}

function codingModeStructures({ bank, modeIds, selectedItems, allItemsById }) {
  const issues = [];
  const selectedItemIds = new Set(selectedItems.map((item) => item.id));
  const allItemIds = new Set(allItemsById.keys());
  const blueprintsByMode = new Map();
  for (const blueprint of bank.practiceBlueprints) {
    const owners = blueprintsByMode.get(blueprint.modeId) ?? [];
    owners.push(blueprint);
    blueprintsByMode.set(blueprint.modeId, owners);
  }
  const auxiliaryDefinitions = {
    recognition_sets: ["recognitionSets", "setId"],
    contrast_sets: ["contrastSets", "setId"],
    interleaved_scope: ["interleavedScopes", "scopeId"],
    simulation_pool: ["simulationPools", "poolId"]
  };
  const auxiliaryMaps = Object.fromEntries(Object.entries(auxiliaryDefinitions).map(([kind, [field, idField]]) => [kind, new Map(bank[field].map((entry) => [entry[idField], entry]))]));
  const selectedAuxiliaryIds = Object.fromEntries(Object.values(auxiliaryDefinitions).map(([field]) => [field, new Set()]));
  const selectedBlueprints = [];

  for (const modeId of modeIds) {
    const modeIssues = [];
    const owners = blueprintsByMode.get(modeId) ?? [];
    if (owners.length !== 1) { issues.push(`${modeId} has ${owners.length} exact published mode owners`); continue; }
    const blueprint = owners[0];
    const own = requireClosedItemReferences({ label: `${modeId} blueprint`, value: blueprint, allItemIds, selectedItemIds, issues: modeIssues });
    const composition = blueprint.composition;
    if (!isObject(composition) || !Array.isArray(composition.ids)) fail("DANGLING_FREE_NODE_REFERENCE", `${modeId} has no valid published composition.`);
    let composedItemIds = [];
    if (composition.kind === "item_ids") {
      composedItemIds = composition.ids;
      const dangling = composedItemIds.filter((id) => !allItemIds.has(id));
      if (dangling.length) fail("DANGLING_FREE_NODE_REFERENCE", `${modeId} references unknown item ${dangling[0]}.`);
      const outside = composedItemIds.filter((id) => !selectedItemIds.has(id));
      if (outside.length) modeIssues.push(`${modeId} composition references ${outside.length} item(s) outside the free node`);
    } else {
      const definition = auxiliaryDefinitions[composition.kind];
      if (!definition) fail("DANGLING_FREE_NODE_REFERENCE", `${modeId} uses unsupported composition ${composition.kind}.`);
      const [field] = definition;
      for (const id of composition.ids) {
        const entry = auxiliaryMaps[composition.kind].get(id);
        if (!entry) fail("DANGLING_FREE_NODE_REFERENCE", `${modeId} references unknown ${composition.kind} ${id}.`);
        const closure = requireClosedItemReferences({ label: `${modeId}/${id}`, value: entry, allItemIds, selectedItemIds, issues: modeIssues });
        if (!closure.references.length) modeIssues.push(`${modeId}/${id} has a global item scope`);
        if (closure.closed) selectedAuxiliaryIds[field].add(id);
        composedItemIds.push(...closure.references);
      }
    }
    const composed = [...new Set(composedItemIds)].sort(compare);
    const resolved = [...new Set(blueprint.resolvedItemIds ?? [])].sort(compare);
    if (canonicalJson(composed) !== canonicalJson(resolved)) fail("DANGLING_FREE_NODE_REFERENCE", `${modeId} resolved items differ from its exact published composition.`);
    if (!own.references.length) modeIssues.push(`${modeId} has a global item scope`);
    if (modeIssues.length) issues.push(`${modeId} is not node-closed (${modeIssues[0]}${modeIssues.length > 1 ? `; ${modeIssues.length - 1} further reference issue(s)` : ""})`);
    else if (own.closed && composed.length > 0 && composed.every((id) => selectedItemIds.has(id))) selectedBlueprints.push(blueprint);
  }

  const compatibilityById = new Map(bank.compatibilitySets.map((entry) => [entry.id, entry]));
  const compatibilityIssues = [];
  for (const item of selectedItems) for (const membershipId of item.compatibilityMemberships ?? []) {
    const entry = compatibilityById.get(membershipId);
    if (!entry) fail("DANGLING_FREE_NODE_REFERENCE", `${item.id} references unknown compatibility set ${membershipId}.`);
    const closure = requireClosedItemReferences({ label: `compatibility set ${membershipId}`, value: entry, allItemIds, selectedItemIds, issues: compatibilityIssues });
    if (closure.closed) selectedAuxiliaryIds.compatibilitySets.add(membershipId);
  }
  if (compatibilityIssues.length) issues.push(`selected item compatibility is not node-closed (${compatibilityIssues[0]}${compatibilityIssues.length > 1 ? `; ${compatibilityIssues.length - 1} further reference issue(s)` : ""})`);

  const selectedPoolIds = selectedAuxiliaryIds.simulationPools;
  const selectedProfiles = bank.simulationProfiles.filter((profile) => selectedPoolIds.has(profile.poolId));
  for (const poolId of selectedPoolIds) if (selectedProfiles.filter((profile) => profile.poolId === poolId).length !== 1) fail("DANGLING_FREE_NODE_REFERENCE", `Simulation pool ${poolId} must have exactly one published profile.`);
  if (issues.length) failModeClosure("Coding Interview", selectedItemIds.size, issues);
  if (selectedBlueprints.length !== modeIds.length) fail("FREE_NODE_MODE_NOT_CLOSED", "Not every Coding Interview free-node mode has an exact closed owner.");
  return Object.freeze({
    practiceBlueprints: selectedBlueprints,
    recognitionSets: bank.recognitionSets.filter((entry) => selectedAuxiliaryIds.recognitionSets.has(entry.setId)),
    contrastSets: bank.contrastSets.filter((entry) => selectedAuxiliaryIds.contrastSets.has(entry.setId)),
    interleavedScopes: bank.interleavedScopes.filter((entry) => selectedAuxiliaryIds.interleavedScopes.has(entry.scopeId)),
    compatibilitySets: bank.compatibilitySets.filter((entry) => selectedAuxiliaryIds.compatibilitySets.has(entry.id)),
    simulationPools: bank.simulationPools.filter((entry) => selectedAuxiliaryIds.simulationPools.has(entry.poolId)),
    simulationProfiles: selectedProfiles
  });
}

const certificationModeFields = new Map([
  ["certification-diagnostic-baseline", "diagnosticBaseline"],
  ["certification-focus-practice", "focusPractice"],
  ["certification-scenario-practice", "scenarioPractice"],
  ["certification-weak-area-review", "weakAreaReview"],
  ["certification-mixed-practice", "mixedPractice"],
  ["certification-quick-review", "quickReview"],
  ["certification-exam-simulation", "examExperienceProfile"]
]);

function certificationModeStructures({ bank, modeIds, freeNodeId, selectedItems, allItemsById }) {
  const issues = [];
  const selectedItemIds = new Set(selectedItems.map((item) => item.id));
  const allItemIds = new Set(allItemsById.keys());
  const selected = {};
  for (const modeId of modeIds) {
    const field = certificationModeFields.get(modeId);
    if (!field || !isObject(bank[field])) { issues.push(`${modeId} has no exact published mode owner`); continue; }
    const structure = bank[field];
    const closure = requireClosedItemReferences({ label: `${modeId} structure`, value: structure, allItemIds, selectedItemIds, issues });
    if (field === "focusPractice") {
      const domains = Array.isArray(structure.topicIds) ? structure.topicIds : [];
      if (!domains.length || domains.some((domain) => domain !== freeNodeId)) issues.push(`${modeId} has a global or mixed domain scope`);
    } else if (field === "examExperienceProfile") {
      const domains = structure.blueprint?.sections?.map((section) => section.contentDomainId) ?? [];
      if (!domains.length || domains.some((domain) => domain !== freeNodeId)) issues.push(`${modeId} has a global or mixed exam domain scope`);
      if (structure.questionCount?.maximum > selectedItems.length) issues.push(`${modeId} requires more items than the free node contains`);
    } else if (field === "weakAreaReview" || field === "quickReview") {
      if (!closure.references.length) issues.push(`${modeId} uses a global evidence/catalog scope without an exact node boundary`);
    } else if (!closure.references.length) issues.push(`${modeId} has no exact item scope`);
    selected[field] = structure;
  }
  if (issues.length) failModeClosure("Certification", selectedItemIds.size, issues);
  if (Object.keys(selected).length !== modeIds.length) fail("FREE_NODE_MODE_NOT_CLOSED", "Not every Certification free-node mode has an exact closed owner.");
  return Object.freeze(selected);
}

function selectedAssets(bank, selectedItems) {
  const references = [...new Set(selectedItems.flatMap((item) => assetReferences(item)))].sort(compare);
  const declared = new Map((bank.feedbackAssets ?? []).map((asset) => [asset.id, asset]));
  const assets = references.map((id) => {
    const asset = declared.get(id);
    if (!asset) fail("DANGLING_FREE_NODE_REFERENCE", `Free-node item references undeclared asset ${id}.`);
    return asset;
  });
  return Object.freeze(assets);
}

function validateModeContract(brief, artifact) {
  const briefModes = [...new Set(brief.validModes ?? [])].sort(compare);
  const artifactModes = [...new Set(artifact.declaredModes ?? [])].sort(compare);
  if (!briefModes.length || artifactModes.length !== artifact.declaredModes.length || artifactModes.some((modeId) => !briefModes.includes(modeId))) fail("BUNDLED_FREE_NODE_PROVENANCE_MISMATCH", `Track brief does not contain every exact declared artifact mode for ${brief.trackId}.`);
  return briefModes;
}

export function bundledFreeNodeFromInputs({ release, releaseId, brief, inventory, pin }) {
  if (!isObject(brief) || brief.packageContentPlan?.bundledFreeNodeId !== brief.freeNodeId) fail("BUNDLED_FREE_NODE_PROVENANCE_MISMATCH", "Track brief does not own one exact bundled free node.");
  const artifact = artifactFor(release, brief.trackId);
  const { bank, allItemsById, selected } = preflightInventory({ artifact, brief, inventory });
  const expectedInventory = inventoryFromPinnedRelease({ release, releaseId, brief, trackId: brief.trackId, pin });
  if (canonicalJson(inventory) !== canonicalJson(expectedInventory)) fail("BUNDLED_FREE_NODE_PROVENANCE_MISMATCH", `Inventory does not exactly equal the canonical pinned selection for ${brief.trackId}.`);
  const modeIds = validateModeContract(brief, artifact);
  const modes = artifact.familyId === "coding_interview"
    ? codingModeStructures({ bank, modeIds, selectedItems: selected, allItemsById })
    : artifact.familyId === "certification"
      ? certificationModeStructures({ bank, modeIds, freeNodeId: brief.freeNodeId, selectedItems: selected, allItemsById })
      : fail("UNSUPPORTED_BUNDLED_FREE_NODE_FAMILY", `No bundled free-node builder exists for ${artifact.familyId}.`);
  const assets = selectedAssets(bank, selected);
  const payload = Object.freeze({
    schemaVersion: BUNDLED_FREE_NODE_PAYLOAD_SCHEMA_VERSION,
    trackId: brief.trackId,
    familyId: artifact.familyId,
    freeNodeId: brief.freeNodeId,
    contentVersion: artifact.contentVersion,
    taxonomyVersion: artifact.taxonomyVersion,
    modeStructures: modes,
    assets,
    items: selected
  });
  const payloadCanonicalSha256 = sha256(canonicalJson(payload));
  const manifest = Object.freeze({
    bundleKind: "bundled_free_node",
    trackId: brief.trackId,
    familyId: artifact.familyId,
    freeNodeId: brief.freeNodeId,
    contentVersion: artifact.contentVersion,
    taxonomyVersion: artifact.taxonomyVersion,
    itemCount: selected.length,
    modeIds,
    assetCount: assets.length,
    payloadSchemaVersion: BUNDLED_FREE_NODE_PAYLOAD_SCHEMA_VERSION,
    payloadCanonicalSha256,
    provenance: Object.freeze({
      releaseId,
      sourceRepositoryCommit: artifact.sourceRepositoryCommit,
      sourceArtifactSchemaVersion: artifact.schemaVersion,
      sourceArtifactChecksumSha256: artifact.checksumSha256,
      inventorySchemaVersion: inventory.schemaVersion,
      inventoryCanonicalSha256: sha256(canonicalJson(inventory)),
      trackBriefSchemaVersion: brief.schemaVersion,
      trackBriefCanonicalSha256: sha256(canonicalJson(brief))
    })
  });
  return Object.freeze({ schemaVersion: BUNDLED_FREE_NODE_SCHEMA_VERSION, manifest, payload });
}

export function verifyBundledFreeNodeRecord(record) {
  exactKeys(record, ["schemaVersion", "manifest", "payload"], "bundled free node");
  exactKeys(record.manifest, ["bundleKind", "trackId", "familyId", "freeNodeId", "contentVersion", "taxonomyVersion", "itemCount", "modeIds", "assetCount", "payloadSchemaVersion", "payloadCanonicalSha256", "provenance"], "bundled free-node manifest");
  exactKeys(record.manifest.provenance, ["releaseId", "sourceRepositoryCommit", "sourceArtifactSchemaVersion", "sourceArtifactChecksumSha256", "inventorySchemaVersion", "inventoryCanonicalSha256", "trackBriefSchemaVersion", "trackBriefCanonicalSha256"], "bundled free-node provenance");
  exactKeys(record.payload, ["schemaVersion", "trackId", "familyId", "freeNodeId", "contentVersion", "taxonomyVersion", "modeStructures", "assets", "items"], "bundled free-node payload");
  if (record.schemaVersion !== BUNDLED_FREE_NODE_SCHEMA_VERSION || record.manifest.bundleKind !== "bundled_free_node" || record.payload.schemaVersion !== BUNDLED_FREE_NODE_PAYLOAD_SCHEMA_VERSION) fail("INVALID_BUNDLED_FREE_NODE", "Bundled free-node schema identity is invalid.");
  if (!Number.isInteger(record.manifest.itemCount) || record.manifest.itemCount < 1 || !Number.isInteger(record.manifest.assetCount) || record.manifest.assetCount < 0 || !Array.isArray(record.manifest.modeIds) || !record.manifest.modeIds.length) fail("INVALID_BUNDLED_FREE_NODE", "Bundled free-node counts or modes are invalid.");
  if (!Array.isArray(record.payload.items) || !Array.isArray(record.payload.assets) || !isObject(record.payload.modeStructures) || record.manifest.modeIds.some((modeId) => typeof modeId !== "string" || !modeId)) fail("INVALID_BUNDLED_FREE_NODE", "Bundled free-node payload collections are invalid.");
  const sortedModes = [...record.manifest.modeIds].sort(compare);
  if (new Set(sortedModes).size !== sortedModes.length || canonicalJson(sortedModes) !== canonicalJson(record.manifest.modeIds)) fail("INVALID_BUNDLED_FREE_NODE", "Bundled free-node modes must be unique and sorted.");
  for (const [label, value, expression] of [
    ["payloadCanonicalSha256", record.manifest.payloadCanonicalSha256, /^[a-f0-9]{64}$/],
    ["sourceRepositoryCommit", record.manifest.provenance.sourceRepositoryCommit, /^[a-f0-9]{40}$/],
    ["sourceArtifactChecksumSha256", record.manifest.provenance.sourceArtifactChecksumSha256, /^[a-f0-9]{64}$/],
    ["inventoryCanonicalSha256", record.manifest.provenance.inventoryCanonicalSha256, /^[a-f0-9]{64}$/],
    ["trackBriefCanonicalSha256", record.manifest.provenance.trackBriefCanonicalSha256, /^[a-f0-9]{64}$/]
  ]) if (typeof value !== "string" || !expression.test(value)) fail("INVALID_BUNDLED_FREE_NODE", `${label} is invalid.`);
  if (record.manifest.payloadCanonicalSha256 !== sha256(canonicalJson(record.payload))) fail("BUNDLED_FREE_NODE_CHECKSUM_MISMATCH", "Bundled free-node payload differs from its canonical SHA-256.");
  if (record.manifest.itemCount !== record.payload.items.length || record.manifest.assetCount !== record.payload.assets.length) fail("INVALID_BUNDLED_FREE_NODE", "Bundled free-node manifest counts differ from its payload.");
  for (const field of ["trackId", "familyId", "freeNodeId", "contentVersion", "taxonomyVersion"]) if (record.manifest[field] !== record.payload[field]) fail("INVALID_BUNDLED_FREE_NODE", `Bundled free-node manifest and payload ${field} differ.`);
  const modeKeys = Object.keys(record.payload.modeStructures).sort(compare);
  if (record.manifest.familyId === "coding_interview") {
    const expected = ["compatibilitySets", "contrastSets", "interleavedScopes", "practiceBlueprints", "recognitionSets", "simulationPools", "simulationProfiles"].sort(compare);
    if (canonicalJson(modeKeys) !== canonicalJson(expected)) fail("INVALID_BUNDLED_FREE_NODE", "Coding Interview bundled mode structure has an unsupported shape.");
  } else {
    const expected = record.manifest.modeIds.map((modeId) => certificationModeFields.get(modeId));
    if (expected.some((field) => !field) || canonicalJson(modeKeys) !== canonicalJson(expected.sort(compare))) fail("INVALID_BUNDLED_FREE_NODE", "Certification bundled mode structure has an unsupported shape.");
  }
  return record;
}

async function canonicalInputs({ root, trackId }) {
  const [briefs, pins] = await Promise.all([loadCanonicalTrackBriefs({ root }), loadCanonicalFreeNodeInventoryPins({ root })]);
  const brief = briefs.find((entry) => entry.trackId === trackId);
  const pin = pins.find((entry) => entry.trackId === trackId);
  if (!brief || !pin) fail("MISSING_BUNDLED_FREE_NODE_INPUT", `Canonical brief or inventory pin is absent for ${trackId}.`);
  const inventoryPath = join("artifacts", "free-node-inventories", pin.releaseId, `${trackId}.json`);
  const [release, inventory] = await Promise.all([
    readJson(join(root, "artifacts", "releases", pin.releaseId, "release.json")),
    validateFreeNodeInventory({ root, inventoryPath })
  ]);
  return { release, releaseId: pin.releaseId, brief, inventory, pin };
}

export async function generateBundledFreeNode({ root = ROOT, trackId }) {
  return bundledFreeNodeFromInputs(await canonicalInputs({ root, trackId }));
}

export async function validateBundledFreeNode({ root = ROOT, bundledFreeNodePath }) {
  const record = await readJson(resolve(root, bundledFreeNodePath));
  const schema = await readJson(join(root, "schemas", "product", "bundled-free-node.schema.json"));
  validateCanonicalJsonSchema(record, schema, "bundled free node");
  verifyBundledFreeNodeRecord(record);
  const expected = await generateBundledFreeNode({ root, trackId: record.manifest.trackId });
  if (canonicalJson(record) !== canonicalJson(expected)) fail("BUNDLED_FREE_NODE_MISMATCH", "Bundled free node does not exactly equal its pinned release, brief, and inventory inputs.");
  return record;
}

function bundledOutput(root, outputPath) {
  const target = resolve(root, outputPath);
  const rel = relative(root, target);
  const prefix = `artifacts${process.platform === "win32" ? "\\" : "/"}bundled-free-nodes${process.platform === "win32" ? "\\" : "/"}`;
  if (!rel || rel === ".." || rel.startsWith("..") || !rel.startsWith(prefix)) fail("INVALID_PATH", `Bundled free-node output must remain in artifacts/bundled-free-nodes: ${outputPath}.`);
  return target;
}

export async function writeBundledFreeNode({ root = ROOT, trackId, outputPath }) {
  const target = bundledOutput(root, outputPath);
  const record = await generateBundledFreeNode({ root, trackId });
  await mkdir(dirname(target), { recursive: true });
  try {
    await writeFile(target, canonicalJson(record), { flag: "wx" });
  } catch (error) {
    if (error?.code === "EEXIST") fail("IMMUTABLE_BUNDLED_FREE_NODE", `Bundled free-node output already exists: ${outputPath}.`);
    throw error;
  }
  return Object.freeze({ record, path: target });
}

const [command, ...args] = process.argv.slice(2);
function options(required) {
  const values = new Map();
  if (args.includes("--help")) return undefined;
  for (let index = 0; index < args.length; index += 2) { const flag = args[index]; const value = args[index + 1]; if (!required.includes(flag) || !value || value.startsWith("--") || values.has(flag)) fail("USAGE", `Invalid argument: ${flag ?? ""}`); values.set(flag, value); }
  for (const flag of required) if (!values.has(flag)) fail("USAGE", `${flag} is required.`);
  return values;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const usage = "Use build-bundled-free-node --track <id> --output <path>, or validate-bundled-free-node --input <path>.";
  try {
    if (!command || command === "--help") process.stdout.write(`${usage}\n`);
    else if (command === "build-bundled-free-node") { const values = options(["--track", "--output"]); if (!values) process.stdout.write(`${usage}\n`); else process.stdout.write(`${JSON.stringify((await writeBundledFreeNode({ trackId: values.get("--track"), outputPath: values.get("--output") })).record, null, 2)}\n`); }
    else if (command === "validate-bundled-free-node") { const values = options(["--input"]); if (!values) process.stdout.write(`${usage}\n`); else process.stdout.write(`${JSON.stringify(await validateBundledFreeNode({ bundledFreeNodePath: values.get("--input") }), null, 2)}\n`); }
    else fail("USAGE", usage);
  } catch (error) { process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`); process.exitCode = 1; }
}
