import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

import { ROOT, loadCurricula } from "./curricula.mjs";

const hash = (value) => createHash("sha256").update(value).digest("hex");
const readJson = async (file) => JSON.parse(await readFile(file, "utf8"));
async function files(root) {
  const entries = await readdir(root, { withFileTypes: true });
  return (await Promise.all(entries.filter((entry) => ![".git", "node_modules"].includes(entry.name)).map(async (entry) => entry.isDirectory() ? files(join(root, entry.name)) : [join(root, entry.name)]))).flat();
}
const write = async (path, value) => { await mkdir(resolve(path, ".."), { recursive: true }); await writeFile(path, `${JSON.stringify(value, null, 2)}\n`); return value; };

function codingBlockMap(curriculum, taxonomy) {
  const map = new Map();
  const mentalUnitById = new Map(taxonomy.mentalUnits.map((unit) => [unit.id, unit]));
  for (const node of curriculum.nodes) {
    for (const block of node.learningBlocks) for (const atom of block.skillOrDecisionAtoms) {
      const unit = [...mentalUnitById.values()].find((candidate) => candidate.primarySkillAtomId === atom.atomId && candidate.roadmapNodeId === node.nodeId);
      if (unit) map.set(`${node.nodeId}:${unit.id}`, { nodeId: node.nodeId, blockId: block.blockId });
    }
  }
  return map;
}

export async function buildExistingContentInventories({ root = ROOT, outputDirectory = join(root, "evidence", "curriculum", "2026.08.09") } = {}) {
  const curricula = await loadCurricula({ root });
  const coding = curricula.find((entry) => entry.trackId === "coding-interview-dsa-problem-solving");
  const codingFiles = (await files(join(root, "manual", "source", coding.trackId))).filter((file) => file.endsWith(".json")).sort();
  const codingTaxonomy = await readJson(join(root, "config", "taxonomy", `${coding.trackId}.json`));
  const map = codingBlockMap(coding, codingTaxonomy); const codingItems = [];
  for (const file of codingFiles) {
    const source = await readJson(file); const oldNode = source.taxonomy?.roadmapNodeId; const mentalUnitId = source.taxonomy?.primaryMentalUnitId; const owner = map.get(`${oldNode}:${mentalUnitId}`);
    for (const item of source.items ?? []) codingItems.push({ itemId: item.id, sourcePath: relative(root, file), existingRoadmapNodeId: oldNode ?? null, primaryCurriculumNodeId: owner?.nodeId ?? null, primaryCurriculumBlockId: owner?.blockId ?? null, classification: owner ? "aligned" : "off_scope", rationale: owner ? "The verified source taxonomy maps this item to one canonical roadmap node and a block that owns its primary mental-unit atom. The future authoring contract remains stricter: additions must declare a coverage target, variation axes, and transfer boundary." : "No canonical node-plus-mental-unit owner can be inferred mechanically." });
  }
  const gcpRoot = join(root, "manual", "source", "google-cloud-associate-cloud-engineer");
  const gcpFiles = await files(gcpRoot); const gcpSourceFiles = gcpFiles.filter((file) => file.endsWith(".json")); let gcpItemIds = [];
  for (const file of gcpSourceFiles) { const source = await readJson(file); gcpItemIds.push(...(source.items ?? []).map((item) => item.id)); }
  const gcpPaths = (await Promise.all(["manual", "config", "artifacts", "evidence", "tests", "scripts"].map((part) => files(join(root, part))))).flat().filter((file) => /google-cloud-associate-cloud-engineer|gcp-ace|cloud-certification/.test(relative(root, file))).map((file) => relative(root, file)).sort();
  const immutableReleasePaths = gcpPaths.filter((path) => path.startsWith("artifacts/releases/"));
  const gcpInventory = { inventoryVersion: "2026.08.09", trackId: "google-cloud-associate-cloud-engineer", activeSource: { sourceFiles: gcpSourceFiles.map((file) => relative(root, file)), itemIds: gcpItemIds.sort(), itemCount: gcpItemIds.length }, relatedPaths: gcpPaths, classifications: { immutablePublishedHistoricalEvidence: immutableReleasePaths, currentPackageOrAdmissionDependency: gcpPaths.filter((path) => path.startsWith("artifacts/bundled-free-nodes/") || path.startsWith("artifacts/free-node-inventories/") || path === "config/free-node-inventory-pins.json" || path === "config/bundled-free-node-packages.json"), activeCanonicalSource: gcpSourceFiles.map((file) => relative(root, file)), generatedCandidateOutput: gcpPaths.filter((path) => path.startsWith("artifacts/tracks/")), deletionBlockedUntilAtomicCutover: gcpSourceFiles.map((file) => relative(root, file)) }, targetRetention: { acceptedExistingInstructionalItemCount: 0, prohibition: "No old GCP item ID may appear in the new curriculum or later replacement authoring manifest." }, atomicReplacementCutover: { trigger: "first replacement GCP instructional source validated with its own immutable release and package evidence", deletePaths: gcpSourceFiles.map((file) => relative(root, file)), removeOldCandidateOwnership: true, preserveImmutableHistoricalBytes: true, noFallbackOrTranslator: true }, fingerprint: "" };
  gcpInventory.fingerprint = hash(JSON.stringify({ ...gcpInventory, fingerprint: undefined }));
  const codingInventory = { inventoryVersion: "2026.08.09", trackId: coding.trackId, itemCount: codingItems.length, classifications: codingItems.reduce((result, item) => { result[item.classification] = (result[item.classification] ?? 0) + 1; return result; }, {}), items: codingItems, note: "Classification maps the verified 2,375-item Coding Interview bank to its canonical 26-node curriculum ownership. It does not rewrite source items or substitute planned coverage-target metadata for future additions." };
  await write(join(outputDirectory, "coding-existing-content-inventory.json"), codingInventory);
  await write(join(outputDirectory, "gcp-old-source-inventory.json"), gcpInventory);
  return { codingInventory, gcpInventory };
}
