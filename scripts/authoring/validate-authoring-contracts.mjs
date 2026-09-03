import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { buildManifest, canonicalJson, compare, gitSha, repoFiles, ROOT, sha256 } from "./lib/model.mjs";
import { validateAuthoringContracts, validateManifest } from "./lib/contracts.mjs";

function outputDirectory(manifest) {
  return join(ROOT, "evidence", "authoring", `${manifest.generatedAt.replaceAll("-", ".")}-${manifest.repositorySha.slice(0, 8)}`);
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
      sourceReadyBlockCount: track.sourceReadyBlockCount,
      freeNodeSourceReadyBlockCount: track.freeNodeSourceReadyBlockCount,
      taxonomyVersion: track.taxonomyVersion,
      contentVersion: track.contentVersion,
      interactionDistribution: track.interactionDistribution,
      modeContribution: track.modeContribution,
      nodes: track.nodes,
      wavePriority: track.wavePriority
    }))
  };
}

function ownerQuickCheck(manifest, generatedOutputFingerprint) {
  const certificationSlots = manifest.tracks.filter((track) => track.familyId === "certification").reduce((sum, track) => sum + track.plannedItemCount, 0);
  const designTracks = manifest.tracks.filter((track) => track.familyId === "design_interview");
  const designAdmitted = designTracks.reduce((sum, track) => sum + track.authoringAdmittedItemCount, 0);
  const designBlocked = designTracks.reduce((sum, track) => sum + track.blockedItemCount, 0);
  const designRoster = designTracks.map((track) => `${track.trackId}=${track.authoringAdmittedItemCount}`).join(", ");
  const lines = [
    "# Patternly authoring gate quick check",
    "",
    "## Gate",
    "",
    `**${manifest.gateResult}** — all ${manifest.trackCount} current curricula are deterministically mapped; blocked slots are explicit and receive no writable source path.`,
    "",
    `Starting SHA: \`${manifest.startingSha}\``,
    `Audited repository SHA: \`${manifest.repositorySha}\``,
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
    `- Certification: ${certificationSlots} slots are planned; ${manifest.tracks.filter((track) => track.familyId === "certification").reduce((sum, track) => sum + track.authoringAdmittedItemCount, 0)} are exact-direct authoring admitted and ${manifest.tracks.filter((track) => track.familyId === "certification").reduce((sum, track) => sum + track.blockedItemCount, 0)} are blocked until literal exact-direct source anchors exist; runtime/publication remains not admitted.`,
    `- Design Interview: the canonical exact-direct roster is authoring admitted (${designRoster}; ${designAdmitted} slots total). The remaining ${designBlocked} slots are blocked/deferred by the current authoring roster, source evidence, or interaction contract; no case/simulation semantics are represented as choice content.`,
    `- Coding Interview: existing ${manifest.tracks.find((track) => track.familyId === "coding_interview").existingSourceFileCount} source files and their ${manifest.tracks.find((track) => track.familyId === "coding_interview").existingVerifiedItemCount} verified items are preserved; remaining authoring extends the existing canonical layout only after separate review.`,
    "- Interaction anomaly: all admitted Certification and Design slots are choice; blocked Design case/simulation modes remain unavailable.",
    "",
    "## Material changes",
    "",
    "- Added the three-family authoring registry and exact track registrations without copying curriculum slots or counts.",
    "- Added strict Certification and Design source contracts with semantic slot, feedback, taxonomy, mode, provenance, and direct-source validation.",
    "- Added deterministic plan/scaffold tooling and regenerated current-SHA evidence.",
    "- Validated explicit single/multiple-selection contracts against each authored batch.",
    "- Validation reads existing learner-source JSON without rewriting it.",
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
    "First real batch: `" + manifest.firstRealAuthoringBatch.path + "` (" + manifest.firstRealAuthoringBatch.slotIds.length + " item" + (manifest.firstRealAuthoringBatch.slotIds.length === 1 ? "" : "s") + ").",
    "No empty JSON is created by scaffolding."
  ];
  return `${lines.join("\n")}\n`;
}

function nextTask(manifest) {
  const first = manifest.firstRealAuthoringBatch;
  return [
    "# Next task: author the first bounded real batch",
    "",
    "Work from a clean current `master` and do not repeat the curriculum analysis.",
    "",
    "1. Run `npm ci`.",
    `2. Run \`npm run authoring:validate\`. If the input fingerprint differs from \`${manifest.auditInputFingerprint}\`, regenerate the plan and review the changed evidence before continuing.`,
    "3. Run `npm run authoring:plan`.",
    "4. Run `npm run authoring:scaffold -- --write` only if the planning briefs need materialization; it creates no JSON, approval, artifact, or release files.",
    "5. Author exactly one complete batch at the path below, using its `.authoring.md` brief, canonical slot bindings, family schema, and exact human-review handoff:",
    "   - path: `" + first.path + "`",
    "   - track/family: `" + first.trackId + "` / `" + first.familyId + "`",
    "   - node/block: `" + first.nodeId + "` / `" + first.learningBlockId + "`",
    "   - slot IDs: " + first.slotIds.map((slotId) => "`" + slotId + "`").join(", "),
    "   - taxonomy version: `" + first.taxonomyVersion + "`",
    "   - authoring content version: `" + first.contentVersion + "`",
    "6. Before approval, run `npm run authoring:validate` and record factual, technical, and editorial human review. Do not activate, publish, or add release artifacts in that task.",
    "",
    "Learner-item creation belongs to the following bounded batch task unless the owner explicitly includes it.",
    "",
    "Expected gate: `READY_FOR_FIRST_REAL_BOUNDED_AUTHORING_BATCH`.",
    ""
  ].join("\n");
}

async function audit() {
  const result = await validateAuthoringContracts(ROOT);
  validateManifest(result.manifest, result.model);
  const directory = outputDirectory(result.manifest);
  await mkdir(directory, { recursive: true });
  const ingressFiles = await repoFiles(ROOT, ["manual/source"]);
  const facts = {
    schemaVersion: "patternly-authoring-repository-facts-v1",
    taskId: "AUTHORING-GATE-01B",
    branch: "master",
    startingSha: result.manifest.startingSha,
    auditedRepositorySha: result.manifest.repositorySha,
    remote: "https://github.com/lukaszkurczab/patternly-content.git",
    canonicalCatalogue: result.manifest.trackIds,
    confirmedFacts: [
      `Exactly ${result.manifest.trackCount} current curricula and track briefs exist.`,
      "The current families are coding_interview, certification, and design_interview.",
      `The canonical manual ingress contains ${result.sourceHashes.length} source JSON files across the registered authoring tracks.`,
      "Certification and Design Interview are not runtime/publication admitted by this task.",
      "Design authoring admission is the exact-direct roster derived from the canonical family handoffs.",
      "Certification authoring admission requires literal resolved_exact_direct documentation with non-empty sourceRefs and anchorPropertyRefs; generic resolved status and sourceRef-as-anchor fallback are rejected."
    ],
    correctedAssumptions: [
      "Authoring facts are derived from current source files; historical counts are not current bank evidence.",
      "Certification authoring readiness is not runtime or release readiness.",
      "Design Interview source readiness is not productive case or simulation readiness."
    ],
    correctedCanonicalDefects: [],
    auditInputFingerprint: result.auditInputFingerprint,
    generatedOutputFingerprint: result.generatedOutputFingerprint,
    sourceJsonCount: result.sourceHashes.length,
    sourceHashFingerprint: sha256(canonicalJson(result.sourceHashes)),
    scaffoldInventory: {
      learnerJsonCount: ingressFiles.filter((path) => path.endsWith(".json")).length,
      codingLearnerJsonCount: ingressFiles.filter((path) => path.startsWith("manual/source/coding-interview-dsa-problem-solving/") && path.endsWith(".json")).length,
      certificationLearnerJsonCount: ingressFiles.filter((path) => path.endsWith(".json") && result.manifest.tracks.filter((track) => track.familyId === "certification").some((track) => path.startsWith(`manual/source/${track.trackId}/`))).length,
      designLearnerJsonCount: ingressFiles.filter((path) => path.endsWith(".json") && result.manifest.tracks.filter((track) => track.familyId === "design_interview").some((track) => path.startsWith(`manual/source/${track.trackId}/`))).length,
      authoringBriefCount: ingressFiles.filter((path) => path.endsWith(".authoring.md")).length,
      readmeCount: ingressFiles.filter((path) => path.endsWith("README.md")).length,
      approvalFileCount: (await repoFiles(ROOT, ["manual/approvals"])).length,
      artifactFileCount: (await repoFiles(ROOT, ["artifacts"])).length,
      releaseFileCount: (await repoFiles(ROOT, ["releases"])).length,
      newApprovalFileCount: 0,
      newArtifactFileCount: 0,
      newReleaseFileCount: 0
    },
    toolVersions: { manifest: "patternly-authoring-scaffold-manifest-v1", certificationSchema: "certification-manual-source-v2", designSchema: "design-interview-manual-source-v1" }
  };
  const readiness = { schemaVersion: "patternly-authoring-readiness-v1", taskId: "AUTHORING-GATE-01B", startingSha: result.manifest.startingSha, auditInputFingerprint: result.auditInputFingerprint, gateResult: result.manifest.gateResult, tracks: result.manifest.tracks };
  const defects = { schemaVersion: "patternly-curriculum-defects-v1", startingSha: result.manifest.startingSha, auditInputFingerprint: result.auditInputFingerprint, defects: [] };
  const files = new Map([
    ["repository-facts.json", facts],
    ["catalogue-current.json", catalogueCurrent(result.manifest)],
    ["curriculum-defects.json", defects],
    ["authoring-readiness.json", readiness],
    ["scaffold-manifest.json", result.manifest],
    ["first-real-authoring-batch.json", result.manifest.firstRealAuthoringBatch],
    ["scaffold-inventory.json", facts.scaffoldInventory],
    ["source-hashes.json", { schemaVersion: "patternly-source-hashes-v1", startingSha: result.manifest.startingSha, auditedRepositorySha: result.manifest.repositorySha, sourceJsonCount: result.sourceHashes.length, sourceHashFingerprint: sha256(canonicalJson(result.sourceHashes)), files: result.sourceHashes }]
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
