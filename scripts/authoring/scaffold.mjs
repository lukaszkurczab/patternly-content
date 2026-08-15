import { mkdir, readFile, readdir, rm, rmdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { buildManifest, ROOT } from "./lib/model.mjs";
import { validateManifest } from "./lib/contracts.mjs";

const write = process.argv.includes("--write");
const regenerate = process.argv.includes("--regenerate");
const scaffoldRoot = resolve(process.env.AUTHORING_ROOT ?? ROOT);
const result = await buildManifest(scaffoldRoot, { generatedAt: process.env.AUTHORING_AUDIT_DATE ?? new Date().toISOString().slice(0, 10) });
validateManifest(result.manifest, result.model);

function brief(track, block) {
  const slots = track.slots.filter((slot) => slot.learningBlockId === block.learningBlockId);
  const admitted = slots.filter((slot) => slot.authoringAdmitted);
  return `# ${track.trackId} / ${block.nodeId} / ${block.learningBlockId}\n\nThis authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.\n\n- Family: ${track.familyId}\n- Taxonomy version: ${track.taxonomyVersion ?? "existing Coding contract"}\n- Authoring content version: ${track.contentVersion ?? "existing Coding contract"}\n- Priority: ${block.priorityTier} — ${block.priorityReasons.join("; ")}\n- Authoring sequence: ${block.authoringSequence ?? "blocked"}\n- Free-node surface: ${block.isFreeNode ? "yes" : "no"}\n- Release-surface role: ${block.releaseSurfaceRole}\n- Planned item count: ${block.plannedItemCount}\n- Authoring-admitted slots: ${admitted.length}\n- Blocked slots: ${block.blockedItemCount}\n- Future source path: ${block.plannedSourcePath ?? block.sourcePaths[0] ?? "not writable until blocked slots resolve"}\n- Interaction allocation: ${[...new Set(admitted.map((slot) => `${slot.interaction.type}/${slot.interaction.selectionMode}`))].sort().join(", ") || "none"}\n- Mode contribution: ${[...new Set(admitted.flatMap((slot) => slot.modeEligibility))].sort().join(", ") || "none"}\n\n## Slot handoff\n\n${slots.map((slot) => `### ${slot.slotId}\n\n- Status: ${slot.authoringAdmitted ? "authoring-admitted" : "blocked"}\n- Objective: ${slot.objective ?? "see canonical curriculum"}\n- Expected decision: ${slot.expectedDecision ?? "see canonical curriculum"}\n- Decisive boundary: ${slot.decisiveBoundary ?? "see canonical curriculum"}\n- Interaction: ${slot.interaction.type}/${slot.interaction.selectionMode}\n- Modes: ${slot.modeEligibility.join(", ") || "none"}\n- Source status: ${slot.sourceStatus}\n- Blocking reasons: ${slot.blockingReasons.join("; ") || "none"}`).join("\n\n")}\n\n## Authoring boundary\n\nAuthor one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.\n`;
}

function readme(track) {
  return `# ${track.trackId}\n\nThis directory is the planned manual-source boundary for ${track.familyId}. Generated authoring briefs are planning artifacts; actual learner-item JSON may be added only as a complete, human-reviewed batch under the canonical learning-block path. Empty or placeholder JSON is forbidden.\n\n- Taxonomy version: ${track.taxonomyVersion ?? "existing Coding contract"}\n- Authoring content version: ${track.contentVersion ?? "existing Coding contract"}\n- Runtime/publication admission: ${track.runtimePublicationReadiness}\n`;
}

async function walk(path) {
  let entries;
  try { entries = await readdir(path, { withFileTypes: true }); } catch (error) { if (error?.code === "ENOENT") return []; throw error; }
  const nested = await Promise.all(entries.map((entry) => entry.isDirectory() ? walk(join(path, entry.name)) : [join(path, entry.name)]));
  return nested.flat();
}

async function cleanupStaleScaffold(manifest) {
  const expectedBriefs = new Set(manifest.tracks.flatMap((track) => track.learningBlocks.filter((block) => block.plannedAuthoringBriefPath).map((block) => join(scaffoldRoot, block.plannedAuthoringBriefPath))));
  const expectedReadmes = new Set();
  for (const track of manifest.tracks) {
    const blocks = track.learningBlocks.filter((block) => block.plannedAuthoringBriefPath);
    if (!blocks.length) continue;
    const trackRoot = join(scaffoldRoot, "manual", "source", track.trackId);
    expectedReadmes.add(join(trackRoot, "README.md"));
    for (const nodeId of new Set(blocks.map((block) => block.nodeId))) expectedReadmes.add(join(trackRoot, nodeId, "README.md"));
  }
  const roots = manifest.tracks.filter((track) => track.familyId !== "coding_interview").map((track) => join(scaffoldRoot, "manual", "source", track.trackId));
  const candidates = (await Promise.all(roots.map((root) => walk(root)))).flat();
  for (const path of candidates) {
    if (path.endsWith(".authoring.md") && !expectedBriefs.has(path) && (await readFile(path, "utf8")).includes("This authoring brief is generated from the canonical scaffold manifest.")) await rm(path);
    if (path.endsWith("README.md") && !expectedReadmes.has(path)) {
      const content = await readFile(path, "utf8");
      if (content.includes("Generated authoring briefs") || content.includes("Learning-block authoring briefs below this node")) await rm(path);
    }
  }
  async function prune(path) {
    let entries;
    try { entries = await readdir(path, { withFileTypes: true }); } catch (error) { if (error?.code === "ENOENT") return; throw error; }
    for (const entry of entries.filter((entry) => entry.isDirectory())) await prune(join(path, entry.name));
    try { if ((await readdir(path)).length === 0) await rmdir(path); } catch (error) { if (error?.code !== "ENOENT") throw error; }
  }
  for (const root of roots) await prune(root);
}

if (!write) {
  console.log("DRY_RUN_NO_WRITES");
  for (const track of result.manifest.tracks) for (const block of track.learningBlocks.filter((entry) => entry.plannedAuthoringBriefPath)) console.log(`CREATE ${block.plannedAuthoringBriefPath}`);
  console.log("NO_SOURCE_JSON_FILES_CREATED");
  process.exit(0);
}

await cleanupStaleScaffold(result.manifest);
for (const track of result.manifest.tracks) {
  const blocks = track.learningBlocks.filter((entry) => entry.plannedAuthoringBriefPath);
  if (!blocks.length) continue;
  const trackRoot = join(scaffoldRoot, "manual", "source", track.trackId);
  await mkdir(trackRoot, { recursive: true });
  await writeFile(join(trackRoot, "README.md"), readme(track));
  const nodes = [...new Set(blocks.map((block) => block.nodeId))];
  for (const nodeId of nodes) {
    const nodeRoot = join(trackRoot, nodeId);
    await mkdir(nodeRoot, { recursive: true });
    await writeFile(join(nodeRoot, "README.md"), `# ${track.trackId} / ${nodeId}\n\nLearning-block authoring briefs below this node are generated from the canonical scaffold manifest.\n`);
  }
  for (const block of blocks) {
    const target = join(scaffoldRoot, block.plannedAuthoringBriefPath);
    const content = brief(track, block);
    try {
      const existing = await readFile(target, "utf8");
      if (existing !== content && !regenerate) throw new Error(`AUTHORING_BRIEF_DRIFT: ${block.plannedAuthoringBriefPath} differs from canonical inputs; use --regenerate to replace it.`);
      if (existing === content) continue;
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, content);
  }
}
console.log("Scaffold written; no source JSON, approval, artifact, or release files were created.");
