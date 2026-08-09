import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalJson, PublishingFailure, validateCanonicalJsonSchema, verifyArtifactRecord } from "../publishing/pipeline.mjs";
import { ROOT, loadCanonicalTrackBriefs } from "./track-briefs.mjs";

export const FREE_NODE_INVENTORY_SCHEMA_VERSION = "patternly-free-node-inventory-v1";
export const FREE_NODE_INVENTORY_PINS_SCHEMA_VERSION = "patternly-free-node-inventory-pins-v1";
const compare = (left, right) => left === right ? 0 : left < right ? -1 : 1;
const fail = (code, message) => { throw new PublishingFailure(code, message); };
const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const isObject = (value) => !!value && typeof value === "object" && !Array.isArray(value);
const text = (value, label, code = "INVALID_FREE_NODE_INVENTORY") => {
  if (typeof value !== "string" || !value.trim()) fail(code, `${label} must be a non-empty string.`);
  return value;
};
const exactKeys = (value, keys, label) => {
  if (!isObject(value) || canonicalJson(Object.keys(value).sort(compare)) !== canonicalJson([...keys].sort(compare))) fail("INVALID_FREE_NODE_INVENTORY", `${label} has an unsupported shape.`);
};

function selectorFor(brief, artifact) {
  if (brief.trackId === "coding-interview-dsa-problem-solving" && artifact.familyId === "coding_interview") return Object.freeze({ field: "taxonomy.roadmapNodeId", equals: brief.freeNodeId });
  if (brief.trackId === "google-cloud-associate-cloud-engineer" && artifact.familyId === "certification") return Object.freeze({ field: "domain", equals: brief.freeNodeId });
  fail("UNSUPPORTED_FREE_NODE_SELECTOR", `No canonical free-node selector exists for ${brief.trackId}.`);
}

function selectItems(artifact, selector) {
  const bank = JSON.parse(artifact.artifactBytes).bank;
  if (!Array.isArray(bank.items)) fail("INVALID_ARTIFACT", `Published artifact has no item collection: ${artifact.trackId}.`);
  const selected = bank.items.filter((item) => selector.field === "taxonomy.roadmapNodeId" ? item.taxonomy?.roadmapNodeId === selector.equals : item?.domain === selector.equals);
  if (!selected.length) fail("EMPTY_FREE_NODE", `Pinned artifact contains no items for ${artifact.trackId}/${selector.equals}.`);
  const result = selected.map((item) => {
    const id = text(item?.id, "published item id", "INVALID_ARTIFACT");
    const itemFingerprint = text(item?.itemFingerprint, `${id} itemFingerprint`, "INVALID_ARTIFACT");
    if (!/^[a-f0-9]{64}$/.test(itemFingerprint)) fail("INVALID_ARTIFACT", `${id} itemFingerprint must be a SHA-256 hex digest.`);
    return Object.freeze({ id, itemFingerprint });
  }).sort((left, right) => compare(left.id, right.id));
  if (new Set(result.map((item) => item.id)).size !== result.length) fail("INVALID_ARTIFACT", `Pinned artifact contains duplicate IDs in ${artifact.trackId}/${selector.equals}.`);
  return Object.freeze(result);
}

function releaseArtifact(release, releaseId, trackId) {
  exactKeys(release, ["artifacts", "manifest"], "release");
  exactKeys(release.manifest, ["envelopeVersion", "releaseId", "sourceRepositoryCommit"], "release.manifest");
  if (release.manifest.envelopeVersion !== 1 || release.manifest.releaseId !== releaseId || !/^[a-f0-9]{40}$/.test(release.manifest.sourceRepositoryCommit)) fail("INVALID_RELEASE", `Release identity is invalid: ${releaseId}.`);
  if (!Array.isArray(release.artifacts)) fail("INVALID_RELEASE", `Release artifacts must be an array: ${releaseId}.`);
  const artifact = release.artifacts.find((entry) => entry?.trackId === trackId);
  if (!artifact || release.artifacts.filter((entry) => entry?.trackId === trackId).length !== 1) fail("RELEASE_TRACK_MISMATCH", `Release ${releaseId} must contain exactly one artifact for ${trackId}.`);
  verifyArtifactRecord(artifact);
  if (artifact.sourceRepositoryCommit !== release.manifest.sourceRepositoryCommit) fail("RELEASE_SOURCE_MISMATCH", `Pinned artifact source does not match release ${releaseId}.`);
  return artifact;
}

function validatePins(pins) {
  exactKeys(pins, ["schemaVersion", "pins"], "free-node inventory pins");
  if (pins.schemaVersion !== FREE_NODE_INVENTORY_PINS_SCHEMA_VERSION || !Array.isArray(pins.pins) || !pins.pins.length) fail("INVALID_FREE_NODE_INVENTORY_PINS", "Free-node inventory pins have an invalid top-level contract.");
  const trackIds = new Set();
  for (const pin of pins.pins) {
    exactKeys(pin, ["trackId", "releaseId", "contentVersion", "sourceRepositoryCommit", "artifactChecksumSha256"], "free-node inventory pin");
    for (const [field, expression] of [["trackId", /^.+$/], ["releaseId", /^.+$/], ["contentVersion", /^.+$/], ["sourceRepositoryCommit", /^[a-f0-9]{40}$/], ["artifactChecksumSha256", /^[a-f0-9]{64}$/]]) if (typeof pin[field] !== "string" || !expression.test(pin[field])) fail("INVALID_FREE_NODE_INVENTORY_PINS", `Free-node inventory pin ${field} is invalid.`);
    if (trackIds.has(pin.trackId)) fail("INVALID_FREE_NODE_INVENTORY_PINS", `Free-node inventory pins duplicate ${pin.trackId}.`);
    trackIds.add(pin.trackId);
  }
  return pins.pins;
}

export async function loadCanonicalFreeNodeInventoryPins({ root = ROOT } = {}) {
  const [pins, schema] = await Promise.all([readJson(join(root, "config", "free-node-inventory-pins.json")), readJson(join(root, "schemas", "product", "free-node-inventory-pins.schema.json"))]);
  validateCanonicalJsonSchema(pins, schema, "free-node inventory pins");
  return Object.freeze(validatePins(pins).map((pin) => Object.freeze(pin)));
}

function assertCanonicalPin({ pin, releaseId, artifact, trackId }) {
  if (!pin) fail("MISSING_FREE_NODE_INVENTORY_PIN", `No canonical free-node inventory pin exists for ${trackId}.`);
  if (pin.releaseId !== releaseId || pin.contentVersion !== artifact.contentVersion || pin.sourceRepositoryCommit !== artifact.sourceRepositoryCommit || pin.artifactChecksumSha256 !== artifact.checksumSha256) fail("FREE_NODE_INVENTORY_PIN_MISMATCH", `Release ${releaseId} is not the canonical immutable free-node inventory source for ${trackId}.`);
}

export function inventoryFromPinnedRelease({ release, releaseId, brief, trackId, pin }) {
  if (brief.trackId !== trackId) fail("BRIEF_TRACK_MISMATCH", `Canonical brief ${brief.trackId} does not match requested track ${trackId}.`);
  const artifact = releaseArtifact(release, releaseId, trackId);
  assertCanonicalPin({ pin, releaseId, artifact, trackId });
  if (artifact.familyId !== brief.internalFamily) fail("BRIEF_FAMILY_MISMATCH", `Canonical brief family does not match pinned artifact for ${trackId}.`);
  const selector = selectorFor(brief, artifact);
  const items = selectItems(artifact, selector);
  return Object.freeze({
    schemaVersion: FREE_NODE_INVENTORY_SCHEMA_VERSION,
    trackId,
    familyId: artifact.familyId,
    freeNodeId: brief.freeNodeId,
    selector,
    producer: Object.freeze({ releaseId, contentVersion: artifact.contentVersion, sourceRepositoryCommit: artifact.sourceRepositoryCommit, artifactChecksumSha256: artifact.checksumSha256 }),
    itemCount: items.length,
    items
  });
}

export async function generateFreeNodeInventory({ root = ROOT, releaseId, trackId }) {
  text(releaseId, "releaseId", "INVALID_RELEASE"); text(trackId, "trackId", "INVALID_TRACK");
  const [briefs, pins, release] = await Promise.all([loadCanonicalTrackBriefs({ root }), loadCanonicalFreeNodeInventoryPins({ root }), readJson(join(root, "artifacts", "releases", releaseId, "release.json"))]);
  const brief = briefs.find((entry) => entry.trackId === trackId);
  if (!brief) fail("MISSING_TRACK_BRIEF", `No canonical brief exists for ${trackId}.`);
  return inventoryFromPinnedRelease({ release, releaseId, brief, trackId, pin: pins.find((entry) => entry.trackId === trackId) });
}

export async function writeFreeNodeInventory({ root = ROOT, releaseId, trackId, outputPath }) {
  const inventory = await generateFreeNodeInventory({ root, releaseId, trackId });
  const target = resolve(root, outputPath);
  const rel = relative(root, target);
  if (!rel || rel === ".." || rel.startsWith("..") || !rel.startsWith(`artifacts${process.platform === "win32" ? "\\\\" : "/"}free-node-inventories${process.platform === "win32" ? "\\\\" : "/"}`)) fail("INVALID_PATH", `Inventory output must remain in artifacts/free-node-inventories: ${outputPath}`);
  try { await stat(target); fail("IMMUTABLE_INVENTORY", `Free-node inventory already exists: ${outputPath}.`); } catch (error) { if (error instanceof PublishingFailure || error?.code !== "ENOENT") throw error; }
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, canonicalJson(inventory));
  return Object.freeze({ inventory, path: target });
}

function validateInventoryShape(inventory) {
  exactKeys(inventory, ["schemaVersion", "trackId", "familyId", "freeNodeId", "selector", "producer", "itemCount", "items"], "free-node inventory");
  if (inventory.schemaVersion !== FREE_NODE_INVENTORY_SCHEMA_VERSION || !Number.isInteger(inventory.itemCount) || inventory.itemCount < 1 || !Array.isArray(inventory.items) || inventory.items.length !== inventory.itemCount) fail("INVALID_FREE_NODE_INVENTORY", "Free-node inventory has an invalid top-level contract.");
  exactKeys(inventory.selector, ["field", "equals"], "free-node inventory selector");
  exactKeys(inventory.producer, ["releaseId", "contentVersion", "sourceRepositoryCommit", "artifactChecksumSha256"], "free-node inventory producer");
  for (const [label, value, expression] of [["selector.field", inventory.selector.field, /^.+$/], ["selector.equals", inventory.selector.equals, /^.+$/], ["producer.releaseId", inventory.producer.releaseId, /^.+$/], ["producer.contentVersion", inventory.producer.contentVersion, /^.+$/], ["producer.sourceRepositoryCommit", inventory.producer.sourceRepositoryCommit, /^[a-f0-9]{40}$/], ["producer.artifactChecksumSha256", inventory.producer.artifactChecksumSha256, /^[a-f0-9]{64}$/]]) if (typeof value !== "string" || !expression.test(value)) fail("INVALID_FREE_NODE_INVENTORY", `${label} is invalid.`);
  const ids = new Set();
  for (const item of inventory.items) { exactKeys(item, ["id", "itemFingerprint"], "free-node inventory item"); if (typeof item.id !== "string" || !item.id || !/^[a-f0-9]{64}$/.test(item.itemFingerprint) || ids.has(item.id)) fail("INVALID_FREE_NODE_INVENTORY", "Free-node inventory item is invalid."); ids.add(item.id); }
}

export async function validateFreeNodeInventory({ root = ROOT, inventoryPath }) {
  const inventory = await readJson(resolve(root, inventoryPath));
  const schema = await readJson(join(root, "schemas", "product", "free-node-inventory.schema.json"));
  validateCanonicalJsonSchema(inventory, schema, "free-node inventory");
  validateInventoryShape(inventory);
  const expected = await generateFreeNodeInventory({ root, releaseId: inventory.producer.releaseId, trackId: inventory.trackId });
  if (canonicalJson(inventory) !== canonicalJson(expected)) fail("FREE_NODE_INVENTORY_MISMATCH", `Free-node inventory does not exactly equal the pinned artifact selection: ${inventoryPath}.`);
  return inventory;
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
  const usage = "Use generate-free-node-inventory --release <id> --track <id> --output <path>, or validate-free-node-inventory --inventory <path>.";
  try {
    if (!command || command === "--help") process.stdout.write(`${usage}\n`);
    else if (command === "generate-free-node-inventory") { const values = options(["--release", "--track", "--output"]); if (!values) process.stdout.write(`${usage}\n`); else process.stdout.write(`${JSON.stringify(await writeFreeNodeInventory({ releaseId: values.get("--release"), trackId: values.get("--track"), outputPath: values.get("--output") }).then(({ inventory }) => inventory), null, 2)}\n`); }
    else if (command === "validate-free-node-inventory") { const values = options(["--inventory"]); if (!values) process.stdout.write(`${usage}\n`); else process.stdout.write(`${JSON.stringify(await validateFreeNodeInventory({ inventoryPath: values.get("--inventory") }), null, 2)}\n`); }
    else fail("USAGE", usage);
  } catch (error) { process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`); process.exitCode = 1; }
}
