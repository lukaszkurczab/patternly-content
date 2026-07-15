import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, resolve, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const own = (value, keys, name) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${name} must be an object.`);
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) throw new Error(`${name} has unknown or missing fields.`);
};
const text = (value, name) => { if (typeof value !== "string" || !value.trim()) throw new Error(`${name} must be a non-empty string.`); };
const under = (base, path) => {
  text(path, "published path");
  const target = resolve(base, path);
  if (relative(base, target).startsWith(`..${sep}`) || relative(base, target) === "..") throw new Error(`Path escapes publication root: ${path}`);
  return target;
};
const json = async (path) => JSON.parse(await readFile(path, "utf8"));
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const unique = (values, name) => { if (new Set(values).size !== values.length) throw new Error(`${name} must be unique.`); };

function responseIsValid(item, label) {
  if (!item || typeof item !== "object" || Array.isArray(item)) throw new Error(`${label} must be an object.`);
  if (Array.isArray(item.options)) {
    if (item.options.length < 2) throw new Error(`${label} needs at least two options.`);
    unique(item.options.map((option) => option?.id), `${label} option IDs`);
    if (!item.options.some((option) => option && option.isCorrect === true)) throw new Error(`${label} needs a correct option.`);
    return;
  }
  if (Array.isArray(item.subgoals) || Array.isArray(item.correctOrder)) {
    if (!Array.isArray(item.subgoals) || !Array.isArray(item.correctOrder)) throw new Error(`${label} ordering response is incomplete.`);
    const ids = item.subgoals.map((subgoal) => subgoal?.id);
    unique(ids, `${label} subgoal IDs`);
    if (ids.length < 2 || item.correctOrder.length !== ids.length || new Set(item.correctOrder).size !== ids.length || item.correctOrder.some((id) => !ids.includes(id))) throw new Error(`${label} correct order is invalid.`);
    return;
  }
  if (item.correctComplexity && Array.isArray(item.correctComplexity.dimensions) && item.correctComplexity.dimensions.length) return;
  throw new Error(`${label} has no valid response shape.`);
}

function validateAlgorithms(bank, manifest) {
  own(bank, ["formatVersion", "trackId", "familyId", "contentVersion", "groups", "items"], "Algorithms bank envelope");
  if (bank.formatVersion !== 1 || bank.trackId !== "algorithms" || bank.familyId !== "algorithms" || bank.contentVersion !== manifest.contentVersion) throw new Error("Algorithms bank envelope does not match its manifest.");
  if (!Array.isArray(bank.items) || !Array.isArray(bank.groups)) throw new Error("Algorithms bank groups and items must be arrays.");
  unique(bank.items.map((item) => item?.id), "Algorithms item IDs");
  const itemIds = new Set(bank.items.map((item) => item?.id));
  const grouped = bank.groups.flatMap((group) => {
    if (!group || typeof group !== "object" || !Object.hasOwn(group, "roadmapNodeId") || !Object.hasOwn(group, "itemIds")) throw new Error("Algorithms group shape is invalid.");
    text(group.roadmapNodeId, "Algorithms roadmap node ID");
    if (!Array.isArray(group.itemIds)) throw new Error("Algorithms group item IDs must be an array.");
    return group.itemIds;
  });
  unique(grouped, "Algorithms group item IDs");
  if (grouped.length !== bank.items.length || grouped.some((id) => !itemIds.has(id))) throw new Error("Algorithms group membership must cover every item exactly once.");
  bank.items.forEach((item) => { text(item?.id, "Algorithms item ID"); responseIsValid(item, item.id); });
}

function validateCertification(bank, manifest) {
  own(bank, ["formatVersion", "trackId", "familyId", "contentVersion", "items"], "Certification bank envelope");
  if (bank.formatVersion !== 1 || bank.trackId !== "cloud-certification" || bank.familyId !== "certification" || bank.contentVersion !== manifest.contentVersion) throw new Error("Certification bank envelope does not match its manifest.");
  if (!Array.isArray(bank.items)) throw new Error("Certification items must be an array.");
  unique(bank.items.map((item) => item?.id), "Certification item IDs");
  bank.items.forEach((item) => {
    text(item?.id, "Certification item ID");
    if (!Array.isArray(item.options) || item.options.length < 2) throw new Error(`${item.id} needs options.`);
    unique(item.options.map((option) => option?.id), `${item.id} option IDs`);
    if (!Array.isArray(item.correctOptionIds) || !item.correctOptionIds.length || item.correctOptionIds.some((id) => !item.options.some((option) => option?.id === id))) throw new Error(`${item.id} has an invalid correct answer.`);
  });
}

export async function validatePublication(root = ROOT) {
  const rootManifest = await json(resolve(root, "manifest.json"));
  own(rootManifest, ["formatVersion", "publishedAt", "tracks"], "Root manifest");
  if (rootManifest.formatVersion !== 1 || !Array.isArray(rootManifest.tracks) || Number.isNaN(Date.parse(rootManifest.publishedAt))) throw new Error("Root manifest is invalid.");
  unique(rootManifest.tracks.map((entry) => entry?.trackId), "Track IDs");
  for (const entry of rootManifest.tracks) {
    own(entry, ["trackId", "familyId", "contentVersion", "manifestPath"], "Root manifest track entry");
    ["trackId", "familyId", "contentVersion", "manifestPath"].forEach((key) => text(entry[key], `Root track ${key}`));
    const manifestPath = under(root, entry.manifestPath);
    const manifest = await json(manifestPath);
    own(manifest, ["formatVersion", "trackId", "familyId", "contentVersion", "itemCount", "bankPath", "sha256"], "Track manifest");
    if (manifest.formatVersion !== 1 || !Number.isInteger(manifest.itemCount) || manifest.itemCount < 1 || !/^[a-f0-9]{64}$/.test(manifest.sha256)) throw new Error(`Invalid track manifest: ${entry.trackId}.`);
    if (["trackId", "familyId", "contentVersion"].some((key) => manifest[key] !== entry[key])) throw new Error(`Root and track manifest disagree for ${entry.trackId}.`);
    const bankPath = under(dirname(manifestPath), manifest.bankPath);
    const bytes = await readFile(bankPath);
    if (hash(bytes) !== manifest.sha256) throw new Error(`Checksum mismatch for ${entry.trackId}.`);
    const bank = JSON.parse(bytes.toString("utf8"));
    if (!Array.isArray(bank.items) || bank.items.length !== manifest.itemCount) throw new Error(`Count mismatch for ${entry.trackId}.`);
    if (entry.trackId === "algorithms") validateAlgorithms(bank, manifest);
    else if (entry.trackId === "cloud-certification") validateCertification(bank, manifest);
    else throw new Error(`Unsupported track: ${entry.trackId}.`);
  }
  return rootManifest;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await validatePublication();
  console.log("Published content is valid.");
}
