import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { buildManifest, canonicalJson, compare, gitSha, ROOT, sha256 } from "./lib/model.mjs";
import { validateAuthoringContracts, validateManifest } from "./lib/contracts.mjs";

function outputDirectory(manifest) {
  return join(ROOT, "evidence", "authoring", `${manifest.generatedAt.replaceAll("-", ".")}-${manifest.startingSha.slice(0, 8)}`);
}

function dryRun(manifest) {
  const lines = ["DRY_RUN_NO_WRITES", "", "The default scaffold mode writes no files."];
  const paths = new Set();
  const add = (path, label) => { if (!paths.has(path)) { paths.add(path); lines.push(`${label} ${path}`); } };
  for (const track of manifest.tracks) {
    const briefs = track.learningBlocks.filter((block) => block.plannedAuthoringBriefPath);
    if (!briefs.length) continue;
    add(`manual/source/${track.trackId}`, "CREATE_DIRECTORY");
    add(`manual/source/${track.trackId}/README.md`, "CREATE_FILE");
    for (const block of briefs) {
      add(`manual/source/${track.trackId}/${block.nodeId}`, "CREATE_DIRECTORY");
      add(`manual/source/${track.trackId}/${block.nodeId}/README.md`, "CREATE_FILE");
      add(block.plannedAuthoringBriefPath, "CREATE_FILE");
    }
  }
  lines.push("", "NO_SOURCE_JSON_FILES_CREATED", "NO_APPROVAL_OR_RELEASE_FILES_CREATED");
  return `${lines.join("\n")}\n`;
}

function catalogueCurrent(manifest) {
  return {
    schemaVersion: "patternly-current-catalogue-v1",
    generatedAt: manifest.generatedAt,
    startingSha: manifest.startingSha,
    auditInputFingerprint: manifest.auditInputFingerprint,
    tracks: manifest.tracks.map((track) => ({
      trackId: track.trackId,
      familyId: track.familyId,
      plannedItemCount: track.plannedItemCount,
      existingVerifiedItemCount: track.existingVerifiedItemCount,
      remainingItemCount: track.remainingItemCount,
      authoringAdmittedItemCount: track.authoringAdmittedItemCount,
      blockedItemCount: track.blockedItemCount,
      plannedNodeCount: track.plannedNodeCount,
      plannedLearningBlockCount: track.plannedLearningBlockCount,
      plannedFutureSourceFileCount: track.plannedFutureSourceFileCount,
      existingSourceFileCount: track.existingSourceFileCount,
      interactionDistribution: track.interactionDistribution,
      modeContribution: track.modeContribution,
      nodes: track.nodes,
      wavePriority: track.wavePriority
    }))
  };
}

function ownerQuickCheck(manifest, generatedOutputFingerprint) {
  const lines = [
    "# Patternly authoring gate quick check",
    "",
    "## Gate",
    "",
    `**READY_FOR_SCAFFOLDING_WITH_EXPLICIT_BLOCKS** — all ten current curricula are deterministically mapped; blocked slots are explicit and receive no writable source path.`,
    "",
    `Starting SHA: \`${manifest.startingSha}\``,
    `Input fingerprint: \`${manifest.auditInputFingerprint}\``,
    `Generated-output fingerprint: \`${generatedOutputFingerprint}\``,
    "",
    "## Current catalogue",
    "",
    "| Track | Planned | Existing | Remaining | Authoring-admitted | Blocked | Nodes | Learning-block files | Authoring | Runtime/publication |",
    "|---|---:|---:|---:|---:|---:|---:|---:|---|---|",
    ...manifest.tracks.map((track) => `| ${track.trackId} | ${track.plannedItemCount} | ${track.existingVerifiedItemCount} | ${track.remainingItemCount} | ${track.authoringAdmittedItemCount} | ${track.blockedItemCount} | ${track.plannedNodeCount} | ${track.plannedFutureSourceFileCount} | ${track.authoringReadiness} | ${track.runtimePublicationReadiness} |`),
    "",
    "## Node → learning-block outline",
    "",
    ...manifest.tracks.map((track) => `- **${track.trackId}** — ${track.nodes.map((node) => `${node.nodeId} (${node.learningBlockIds.length} blocks, ${node.slotCount} planned items)`).join("; ")}`),
    "",
    "## Decision/source coverage handoff",
    "",
    ...manifest.tracks.map((track) => `- **${track.trackId}** — admitted blocks: ${track.learningBlocks.filter((block) => block.authoringAdmittedItemCount > 0).map((block) => `${block.learningBlockId} (${block.authoringAdmittedItemCount})`).join(", ") || "none"}; blocked blocks: ${track.learningBlocks.filter((block) => block.blockedItemCount > 0).length}; interaction pool: ${Object.entries(track.interactionDistribution).map(([kind, count]) => `${kind}=${count}`).join(", ") || "none"}.`),
    "",
    "## Feasibility and blocks",
    "",
    "- Certification: all 1,931 current slots are exact-direct, choice-authoring admitted; runtime/publication remains not admitted and no global 50-question runtime assumption is introduced.",
    "- Design Interview: only the canonical exact-direct 8/10/9 roster is authoring admitted. The remaining 296 slots are blocked/deferred by the current authoring roster, source evidence, or interaction contract; no case/simulation semantics are represented as choice content.",
    "- Coding Interview: existing 213 source files and their 2,375 verified items are preserved; remaining authoring extends the existing canonical layout only after separate review.",
    "- Interaction anomaly: all admitted Certification and Design slots are choice; blocked Design case/simulation modes remain unavailable.",
    "",
    "## Material changes",
    "",
    "- Added the three-family authoring registry and exact track registrations without copying curriculum slots or counts.",
    "- Added strict Certification and Design source contracts with semantic slot, feedback, taxonomy, mode, provenance, and direct-source validation.",
    "- Added deterministic plan/scaffold tooling and regenerated current-SHA evidence.",
    "- Added explicit Certification single-selection allocation to all current slots and recomputed the six canonical content fingerprints.",
    "- Preserved all existing Coding Interview learner-source JSON bytes; no new learner-source JSON was created.",
    "",
    "## Owner decisions",
    "",
    "None for schema, layout, naming, batching, provenance, or validation. Human review is still required before any authored batch becomes approved, runtime-admitted, or released.",
    "",
    "## Next task",
    "",
    "Run the exact handoff in [`next-task.md`](./next-task.md). The first command is:",
    "",
    "```sh",
    "npm run authoring:validate && npm run authoring:plan && npm run authoring:scaffold -- --write",
    "```",
    "",
    "No empty JSON is created by scaffolding."
  ];
  return `${lines.join("\n")}\n`;
}

function nextTask(manifest) {
  return [
    "# Next task: materialize authoring briefs",
    "",
    "Work from a clean current `master` and do not repeat the curriculum analysis.",
    "",
    "1. Run `npm ci`.",
    `2. Run \`npm run authoring:validate\`. If the input fingerprint differs from \`${manifest.auditInputFingerprint}\`, regenerate the plan and review the changed evidence before continuing.`,
    "3. Run `npm run authoring:plan`.",
    "4. Run `npm run authoring:scaffold -- --write`. This creates only track/node directories, README files, and `.authoring.md` briefs. It must not create empty JSON, approval records, artifacts, or releases.",
    "5. Verify a second scaffold run is idempotent and commit the generated folder/README/brief structure.",
    "6. Report the first bounded real authoring batches in this deterministic order: existing Coding source preservation; source-ready Certification blocks by canonical track/node/block order; then Design Interview blocks by the current exact-direct roster and canonical track/node/block order.",
    "",
    "Learner-item creation belongs to the following bounded batch task unless the owner explicitly includes it.",
    "",
    "Expected gate: `READY_FOR_SCAFFOLDING_WITH_EXPLICIT_BLOCKS`.",
    ""
  ].join("\n");
}

async function audit() {
  const result = await validateAuthoringContracts(ROOT);
  validateManifest(result.manifest, result.model);
  const directory = outputDirectory(result.manifest);
  await mkdir(directory, { recursive: true });
  const facts = {
    schemaVersion: "patternly-authoring-repository-facts-v1",
    taskId: "AUTHORING-GATE-01",
    branch: "master",
    startingSha: result.manifest.startingSha,
    remote: "https://github.com/lukaszkurczab/patternly-content.git",
    canonicalCatalogue: result.manifest.trackIds,
    confirmedFacts: [
      "Exactly ten current curricula and ten track briefs exist.",
      "The current families are coding_interview, certification, and design_interview.",
      "Only Coding Interview has real manual source JSON and an active config/tracks runtime registration.",
      "Certification and Design Interview are not runtime/publication admitted by this task.",
      "Design authoring admission is the exact-direct 8/10/9 roster from the canonical family handoffs."
    ],
    correctedAssumptions: [
      "The stale Coding Interview README claim that no question bank exists is false because 213 real source JSON files exist.",
      "Certification authoring readiness is not runtime or release readiness.",
      "Design Interview source readiness is not productive case or simulation readiness."
    ],
    correctedCanonicalDefects: [
      "Certification slots declared choice interaction without a selection model; all 1,931 current slots now explicitly declare single selection and have recomputed content fingerprints."
    ],
    auditInputFingerprint: result.auditInputFingerprint,
    generatedOutputFingerprint: result.generatedOutputFingerprint,
    sourceJsonCount: result.sourceHashes.length,
    sourceHashFingerprint: sha256(canonicalJson(result.sourceHashes)),
    toolVersions: { manifest: "patternly-authoring-scaffold-manifest-v1", certificationSchema: "certification-manual-source-v2", designSchema: "design-interview-manual-source-v1" }
  };
  const readiness = { schemaVersion: "patternly-authoring-readiness-v1", taskId: "AUTHORING-GATE-01", startingSha: result.manifest.startingSha, auditInputFingerprint: result.auditInputFingerprint, gateResult: result.manifest.gateResult, tracks: result.manifest.tracks };
  const defects = { schemaVersion: "patternly-curriculum-defects-v1", startingSha: result.manifest.startingSha, auditInputFingerprint: result.auditInputFingerprint, defects: [] };
  const files = new Map([
    ["repository-facts.json", facts],
    ["catalogue-current.json", catalogueCurrent(result.manifest)],
    ["curriculum-defects.json", defects],
    ["authoring-readiness.json", readiness],
    ["scaffold-manifest.json", result.manifest],
    ["source-hashes.json", { schemaVersion: "patternly-source-hashes-v1", startingSha: result.manifest.startingSha, sourceJsonCount: result.sourceHashes.length, sourceHashFingerprint: sha256(canonicalJson(result.sourceHashes)), files: result.sourceHashes }]
  ]);
  for (const [name, value] of files) await writeFile(join(directory, name), canonicalJson(value));
  await writeFile(join(directory, "scaffold-dry-run.txt"), dryRun(result.manifest));
  await writeFile(join(directory, "owner-quick-check.md"), ownerQuickCheck(result.manifest, result.generatedOutputFingerprint));
  await writeFile(join(directory, "next-task.md"), nextTask(result.manifest));
  console.log(`Validated ${result.manifest.trackCount} tracks.`);
  console.log(`Gate: ${result.manifest.gateResult}`);
  console.log(`Evidence: ${directory}`);
}

if (process.argv.includes("--audit")) await audit();
else {
  const result = await validateAuthoringContracts(ROOT);
  validateManifest(result.manifest, result.model);
  console.log(`Validated ${result.manifest.trackCount} authoring registrations; ${result.sourceHashes.length} existing source JSON files remain schema-valid.`);
}
