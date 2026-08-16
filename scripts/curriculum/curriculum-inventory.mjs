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
      if (unit) {
        const key = `${node.nodeId}:${unit.id}`;
        if (map.has(key)) throw new Error(`DUPLICATE_CODING_CONTENT_OWNER: ${key} maps to more than one curriculum atom.`);
        map.set(key, { nodeId: node.nodeId, blockId: block.blockId, primarySkillOrDecisionAtomId: atom.atomId });
      }
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
    for (const item of source.items ?? []) codingItems.push({ itemId: item.id, sourcePath: relative(root, file), existingRoadmapNodeId: oldNode ?? null, primaryCurriculumNodeId: owner?.nodeId ?? null, primaryCurriculumBlockId: owner?.blockId ?? null, primarySkillOrDecisionAtomId: owner?.primarySkillOrDecisionAtomId ?? null, classification: owner ? "aligned" : "off_scope", rationale: owner ? "The verified source taxonomy maps this item to one canonical roadmap node, one block, and the block-owned primary mental-unit atom. Recognition, selection, and boundary coverage remain explicit block operations across the target's direct atom set; this inventory does not invent an unverified per-item operation label." : "No canonical node-plus-mental-unit owner can be inferred mechanically." });
  }
  if (codingItems.length !== coding.targetItemCount) throw new Error(`CODING_INVENTORY_COUNT_MISMATCH: canonical target ${coding.targetItemCount} does not match ${codingItems.length} source-derived items.`);
  if (new Set(codingItems.map((item) => item.itemId)).size !== codingItems.length) throw new Error("DUPLICATE_CODING_INVENTORY_ITEM: existing Coding item IDs must be unique.");
  const unmappedItem = codingItems.find((item) => item.classification !== "aligned" || !item.primaryCurriculumNodeId || !item.primaryCurriculumBlockId || !item.primarySkillOrDecisionAtomId);
  if (unmappedItem) throw new Error(`UNMAPPED_CODING_INVENTORY_ITEM: ${unmappedItem.itemId} lacks canonical node, block, or primary mental-unit atom ownership.`);
  const gcpInventory = { inventoryVersion: "2026.08.09", trackId: "google-cloud-associate-cloud-engineer", activeSource: { sourceFiles: [], itemIds: [], itemCount: 0 }, cutover: { status: "resolved", activeCanonicalSourceRemoved: true, activePackageAndAdmissionDependenciesRemoved: true, activeCandidateOwnershipRemoved: true, deferredReplacementPrerequisite: false, noFallbackOrTranslator: true, preserveImmutableHistoricalBytes: true }, fingerprint: "" };
  gcpInventory.fingerprint = hash(JSON.stringify({ ...gcpInventory, fingerprint: undefined }));
  const codingInventory = { inventoryVersion: "2026.08.09", trackId: coding.trackId, itemCount: codingItems.length, coverageOwnershipContract: { existingItemGranularity: ["roadmap_node", "learning_block", "primary_mental_unit_atom"], plannedTargetSemantics: "block_operation_across_direct_atoms", itemOperationAttribution: "not_claimed_without_source_evidence" }, classifications: codingItems.reduce((result, item) => { result[item.classification] = (result[item.classification] ?? 0) + 1; return result; }, {}), items: codingItems, note: "Classification maps the source-derived 3,404-item Coding Interview bank to its canonical 26-node curriculum ownership without changing question semantics. Future additions must also declare a coverage target, variation axes, and transfer boundary." };
  await write(join(outputDirectory, "coding-existing-content-inventory.json"), codingInventory);
  return { codingInventory, gcpInventory };
}
