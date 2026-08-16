import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { promisify } from "node:util";
import test from "node:test";
import { buildManifest, canonicalJson, ROOT, AuthoringFailure } from "../scripts/authoring/lib/model.mjs";
import { validateAuthoringContracts, validateManualBatch } from "../scripts/authoring/lib/contracts.mjs";

const fixed = { generatedAt: "2026-08-15", startingSha: "7cfb71fc7f7ad0a061a9533f09ad5549ba8114c5" };
const runFile = promisify(execFile);

async function copyFixture() {
  const fixture = await mkdtemp(join(tmpdir(), "patternly-authoring-scaffold-"));
  for (const sourcePath of ["config", "docs/track-briefs", "manual", "schemas"]) {
    const targetPath = join(fixture, sourcePath);
    await mkdir(dirname(targetPath), { recursive: true });
    await cp(join(ROOT, sourcePath), targetPath, { recursive: true });
  }
  const sourceEntries = await readdir(join(fixture, "manual", "source"), { withFileTypes: true });
  for (const entry of sourceEntries.filter((entry) => entry.isDirectory() && entry.name !== "coding-interview-dsa-problem-solving")) await rm(join(fixture, "manual", "source", entry.name), { recursive: true, force: true });
  await runFile("git", ["init", "-q"], { cwd: fixture });
  await runFile("git", ["-c", "user.name=Patternly fixture", "-c", "user.email=fixture@example.com", "commit", "--allow-empty", "-m", "fixture"], { cwd: fixture });
  return fixture;
}

async function snapshotFiles(root, current = root, result = {}) {
  for (const entry of (await readdir(current, { withFileTypes: true })).sort((left, right) => left.name.localeCompare(right.name))) {
    if (entry.name === ".git") continue;
    const path = join(current, entry.name);
    if (entry.isDirectory()) await snapshotFiles(root, path, result);
    else result[relative(root, path)] = createHash("sha256").update(await readFile(path)).digest("hex");
  }
  return result;
}

async function runScaffold(fixture, args = []) {
  try {
    const output = await runFile(process.execPath, [join(ROOT, "scripts/authoring/scaffold.mjs"), ...args], { cwd: ROOT, env: { ...process.env, AUTHORING_ROOT: fixture, AUTHORING_AUDIT_DATE: "2026-08-14" }, maxBuffer: 4 * 1024 * 1024 });
    return { status: 0, stdout: output.stdout, stderr: output.stderr };
  } catch (error) {
    return { status: Number(error.code) || 1, stdout: error.stdout ?? "", stderr: error.stderr ?? "" };
  }
}

function itemFor(track, slot, familyId) {
  const isCertification = familyId === "certification";
  return {
    itemId: `fixture-${slot.slotId.slice(-24)}`,
    slotId: slot.slotId,
    nodeId: slot.nodeId,
    learningBlockId: slot.learningBlockId,
    taxonomy: isCertification
      ? { examDomainId: slot.sourceBinding ? slot.sourceBinding.claimIds[0] ? track.normalized.slots.find((entry) => entry.slotId === slot.slotId).raw.primarySimulationDomainId : "unknown" : "unknown", competencyAreaId: slot.nodeId, topicId: slot.learningBlockId, skillAtomId: track.normalized.slots.find((entry) => entry.slotId === slot.slotId).raw.directSkillOrDecisionAtomId }
      : { nodeId: slot.nodeId, learningBlockId: slot.learningBlockId, skillAtomId: track.normalized.slots.find((entry) => entry.slotId === slot.slotId).raw.directSkillOrDecisionAtomId },
    prompt: "Which decision follows from all stated constraints?",
    constraints: ["All material constraints are stated before submission."],
    interaction: { type: "choice", selectionMode: "single", options: [{ optionId: "correct", text: "Apply the canonical decision." }, { optionId: "wrong", text: "Apply a keyword-only shortcut." }], acceptedOptionIds: ["correct"] },
    scoringContract: { type: "choice", resultSemantics: "exact_selected_set_with_partial_v1", selectionMode: "single" },
    feedback: { Reason: "The accepted decision follows the slot-owned constraint boundary.", Details: { mechanismOrProperty: "The mechanism is explicit.", scenarioApplication: "It applies to the stated scenario.", errorCorrection: "The shortcut ignores the decisive constraint.", boundaryOrTradeoff: "The decision changes when the boundary changes.", transfer: "Transfer when the decisive boundary changes." }, wrongOptionExplanationsByOptionId: { wrong: "This shortcut ignores the decisive constraint." }, omittedCorrectElementExplanationsByOptionId: {} },
    modeEligibility: slot.modeEligibility,
    sourceBinding: slot.sourceBinding,
    authoringProvenance: { authoringMethod: "manual", approvalStatus: "unapproved", author: "fixture-author", createdAt: "2026-08-14", contentBatchId: "fixture-authoring-batch" }
  };
}

function batchFor(result, familyId) {
  const track = result.manifest.tracks.find((entry) => entry.familyId === familyId && entry.slots.some((slot) => slot.authoringAdmitted));
  const firstSlot = track.slots.find((entry) => entry.authoringAdmitted);
  const slots = track.slots.filter((entry) => entry.learningBlockId === firstSlot.learningBlockId && entry.authoringAdmitted);
  const canonicalTrack = result.model.curricula.get(track.trackId);
  const items = slots.map((slot) => itemFor(canonicalTrack, slot, familyId));
  return {
    schemaVersion: familyId === "certification" ? "certification-manual-source-v2" : "design-interview-manual-source-v1",
    batchId: "fixture-authoring-batch",
    trackId: track.trackId,
    familyId,
    contentVersion: track.contentVersion,
    taxonomyVersion: track.taxonomyVersion,
    nodeId: firstSlot.nodeId,
    learningBlockId: firstSlot.learningBlockId,
    slotIds: slots.map((slot) => slot.slotId),
    items,
    authoringProvenance: { authoringMethod: "manual", approvalStatus: "unapproved", author: "fixture-author", createdAt: "2026-08-14", contentBatchId: "fixture-authoring-batch" }
  };
}

function certificationFixtureResult(result) {
  const fixture = structuredClone(result);
  const track = fixture.manifest.tracks.find((entry) => entry.familyId === "certification");
  const slot = track.slots[0];
  const block = track.learningBlocks.find((entry) => entry.learningBlockId === slot.learningBlockId && entry.nodeId === slot.nodeId);
  const path = `manual/source/${track.trackId}/${slot.nodeId}/${slot.learningBlockId}.json`;
  const sourceBinding = { bindingId: "fixture-certification-binding", claimIds: ["fixture-claim"], anchorIds: ["fixture-anchor"], sourceRefs: ["fixture-source"] };
  Object.assign(slot, { authoringAdmitted: true, authoringAdmittedItemCount: 1, blockedItemCount: 0, sourceStatus: "exact_direct", sourceBinding, plannedSourcePath: path, writableSourcePaths: [path] });
  Object.assign(block, { authoringAdmittedItemCount: 1, blockedItemCount: block.blockedItemCount - 1, plannedSourcePath: path, sourcePaths: [path], plannedAuthoringBriefPath: `manual/source/${track.trackId}/${slot.nodeId}/${slot.learningBlockId}.authoring.md` });
  Object.assign(track, { authoringAdmittedItemCount: 1, blockedItemCount: track.blockedItemCount - 1, plannedFutureSourceFileCount: 1, sourceReadyBlockCount: 1 });
  return fixture;
}

test("authoring catalogue covers ten tracks and derives current counts", async () => {
  const result = await validateAuthoringContracts(ROOT);
  assert.equal(result.manifest.trackCount, 10);
  for (const track of result.manifest.tracks) {
    assert.equal(track.existingVerifiedItemCount + track.authoringAdmittedItemCount + track.blockedItemCount, track.plannedItemCount, track.trackId);
    assert.equal(track.plannedItemCount - track.existingVerifiedItemCount, track.remainingItemCount, track.trackId);
    assert.equal(track.learningBlocks.reduce((sum, block) => sum + block.plannedItemCount, 0), track.plannedItemCount, track.trackId);
    assert.equal(track.learningBlocks.reduce((sum, block) => sum + block.authoringAdmittedItemCount, 0), track.authoringAdmittedItemCount, track.trackId);
    assert.equal(track.learningBlocks.reduce((sum, block) => sum + block.blockedItemCount, 0), track.blockedItemCount, track.trackId);
  }
  const coding = result.manifest.tracks.find((track) => track.trackId === "coding-interview-dsa-problem-solving");
  assert.equal(coding.plannedFutureSourceFileCount, result.sourceHashes.filter((entry) => entry.path.startsWith("manual/source/coding-interview-dsa-problem-solving/")).length);
  const certification = result.manifest.tracks.filter((track) => track.familyId === "certification");
  assert.equal(certification.reduce((sum, track) => sum + track.authoringAdmittedItemCount, 0), 5);
  assert.equal(certification.reduce((sum, track) => sum + track.blockedItemCount, 0), certification.reduce((sum, track) => sum + track.plannedItemCount, 0) - 5);
  const design = result.manifest.tracks.filter((track) => track.familyId === "design_interview");
  assert.equal(design.reduce((sum, track) => sum + track.authoringAdmittedItemCount + track.blockedItemCount, 0), design.reduce((sum, track) => sum + track.plannedItemCount, 0));
});

test("Certification and Design authoring batches validate their exact slot, source, feedback, and mode contracts", async () => {
  const result = await buildManifest(ROOT, fixed);
  const certification = certificationFixtureResult(result);
  const certificationBatch = batchFor(certification, "certification");
  await assert.doesNotReject(() => validateManualBatch(ROOT, certificationBatch, { manifestResult: certification, actualPath: `manual/source/${certificationBatch.trackId}/${certificationBatch.nodeId}/${certificationBatch.learningBlockId}.json` }));
  await assert.doesNotReject(() => validateManualBatch(ROOT, batchFor(result, "design_interview"), { manifestResult: result }));
});

test("authoring validator rejects incomplete feedback, mode expansion, and indirect source binding", async () => {
  const result = await buildManifest(ROOT, fixed);
  const certification = certificationFixtureResult(result);
  const base = batchFor(certification, "certification");
  const missingWrong = structuredClone(base); delete missingWrong.items[0].feedback.wrongOptionExplanationsByOptionId.wrong;
  await assert.rejects(() => validateManualBatch(ROOT, missingWrong, { manifestResult: certification }), (error) => error instanceof AuthoringFailure && error.code === "INCOMPLETE_FEEDBACK");
  const expandedMode = structuredClone(base); expandedMode.items[0].modeEligibility.push("invented-mode");
  await assert.rejects(() => validateManualBatch(ROOT, expandedMode, { manifestResult: certification }), (error) => error instanceof AuthoringFailure && error.code === "MODE_DRIFT");
  const indirect = structuredClone(base); indirect.items[0].sourceBinding.bindingId = "inferred-from-url";
  await assert.rejects(() => validateManualBatch(ROOT, indirect, { manifestResult: certification }), (error) => error instanceof AuthoringFailure && error.code === "SOURCE_BINDING_MISMATCH");
  const unknownAnswer = structuredClone(base); unknownAnswer.items[0].interaction.acceptedOptionIds = ["missing"];
  await assert.rejects(() => validateManualBatch(ROOT, unknownAnswer, { manifestResult: certification }), (error) => error instanceof AuthoringFailure && error.code === "UNKNOWN_ANSWER_ID");
  const missingReason = structuredClone(base); delete missingReason.items[0].feedback.Reason;
  await assert.rejects(() => validateManualBatch(ROOT, missingReason, { manifestResult: certification }), (error) => error instanceof AuthoringFailure && error.code === "INVALID_SCHEMA");
});

test("path validation and version identity reject drift from the canonical block owner", async () => {
  const result = await buildManifest(ROOT, fixed);
  const batch = batchFor(result, "design_interview");
  const track = result.manifest.tracks.find((entry) => entry.trackId === batch.trackId);
  const expectedPath = `manual/source/${batch.trackId}/${batch.nodeId}/${batch.learningBlockId}.json`;
  await assert.doesNotReject(() => validateManualBatch(ROOT, batch, { manifestResult: result, actualPath: expectedPath }));
  await assert.rejects(() => validateManualBatch(ROOT, batch, { manifestResult: result, actualPath: `${expectedPath}.wrong` }), (error) => error instanceof AuthoringFailure && error.code === "PATH_MISMATCH");
  const wrongContent = structuredClone(batch); wrongContent.contentVersion = "wrong-content-version";
  await assert.rejects(() => validateManualBatch(ROOT, wrongContent, { manifestResult: result }), (error) => error instanceof AuthoringFailure && error.code === "VERSION_IDENTITY");
  const wrongTaxonomy = structuredClone(batch); wrongTaxonomy.taxonomyVersion = "wrong-taxonomy-version";
  await assert.rejects(() => validateManualBatch(ROOT, wrongTaxonomy, { manifestResult: result }), (error) => error instanceof AuthoringFailure && error.code === "VERSION_IDENTITY");
  assert.equal(batch.contentVersion, track.contentVersion);
  assert.equal(batch.taxonomyVersion, track.taxonomyVersion);
});

test("strict source provenance blocks generic Certification evidence and preserves direct Design admission", async () => {
  const result = await buildManifest(ROOT, fixed);
  const certification = result.manifest.tracks.filter((track) => track.familyId === "certification");
  assert.equal(certification.reduce((sum, track) => sum + track.authoringAdmittedItemCount, 0), 5);
  assert.ok(certification.every((track) => track.slots.every((slot) => slot.authoringAdmitted ? slot.sourceStatus === "exact_direct" && slot.sourceBinding : slot.sourceStatus === "blocked" && slot.sourceBinding === null)));
  const design = batchFor(result, "design_interview");
  const altered = structuredClone(design); altered.items[0].sourceBinding.anchorIds = ["indirect-anchor"];
  await assert.rejects(() => validateManualBatch(ROOT, altered, { manifestResult: result }), (error) => error instanceof AuthoringFailure && error.code === "SOURCE_BINDING_MISMATCH");
});

test("manifest priority is semantic and selects one explicit first real batch", async () => {
  const result = await buildManifest(ROOT, fixed);
  assert.equal(result.manifest.gateResult, "READY_FOR_FIRST_REAL_BOUNDED_AUTHORING_BATCH");
  const first = result.manifest.firstRealAuthoringBatch;
  assert.equal(first.trackId, "google-cloud-associate-cloud-engineer");
  assert.equal(first.learningBlockId, "compute_execution_model_selection");
  assert.equal(first.authoringAdmittedItemCount, 5);
  assert.equal(first.priorityTier, "T1");
  assert.equal(first.slotIds.length, first.authoringAdmittedItemCount);
  const admitted = result.manifest.tracks.flatMap((track) => track.learningBlocks.filter((block) => block.authoringAdmittedItemCount > 0));
  assert.equal(new Set(admitted.map((block) => block.authoringSequence)).size, admitted.length);
  assert.ok(admitted.every((block) => /^T[0-5]$/.test(block.priorityTier)));
  assert.ok(result.manifest.tracks.flatMap((track) => track.learningBlocks).filter((block) => block.priorityTier === "T6").every((block) => block.authoringSequence === null));
});

test("Design rejects productive case payloads and blocked slots instead of falling through to Certification", async () => {
  const result = await buildManifest(ROOT, fixed);
  const batch = batchFor(result, "design_interview");
  const productive = structuredClone(batch); productive.items[0].interaction.type = "free_form";
  await assert.rejects(() => validateManualBatch(ROOT, productive, { manifestResult: result }), (error) => error instanceof AuthoringFailure && error.code === "INVALID_SCHEMA");
  const designTrack = result.manifest.tracks.find((track) => track.familyId === "design_interview");
  const blocked = designTrack.slots.find((slot) => !slot.authoringAdmitted);
  const blockedBatch = structuredClone(batch); blockedBatch.slotIds = [blocked.slotId]; blockedBatch.learningBlockId = blocked.learningBlockId; blockedBatch.nodeId = blocked.nodeId; blockedBatch.items[0].slotId = blocked.slotId; blockedBatch.items[0].learningBlockId = blocked.learningBlockId; blockedBatch.items[0].nodeId = blocked.nodeId;
  await assert.rejects(() => validateManualBatch(ROOT, blockedBatch, { manifestResult: result }), (error) => error instanceof AuthoringFailure && error.code === "BLOCKED_SOURCE_PATH");
});

test("planning is byte-deterministic and the runtime publisher has explicit family boundaries", async () => {
  const first = await buildManifest(ROOT, fixed);
  const second = await buildManifest(ROOT, fixed);
  assert.equal(canonicalJson(first.manifest), canonicalJson(second.manifest));
  const pipeline = await readFile("scripts/publishing/pipeline.mjs", "utf8");
  assert.match(pipeline, /FAMILY_RUNTIME_DISPATCH/);
  assert.match(pipeline, /UNSUPPORTED_RUNTIME_FAMILY/);
  assert.match(pipeline, /design_interview/);
  assert.doesNotMatch(pipeline, /familyId === "coding_interview" \? "coding-interview-manual-source\.schema\.json" : "certification-manual-source\.schema\.json"/);
});

test("scaffold invariants: dry-run is read-only and isolated write mode is idempotent with drift protection", async () => {
  const fixture = await copyFixture();
  try {
    const before = await snapshotFiles(fixture);
    const dryRun = await runScaffold(fixture);
    assert.equal(dryRun.status, 0, dryRun.stderr);
    assert.match(dryRun.stdout, /DRY_RUN_NO_WRITES/);
    assert.deepEqual(await snapshotFiles(fixture), before);

    const firstWrite = await runScaffold(fixture, ["--write"]);
    assert.equal(firstWrite.status, 0, firstWrite.stderr);
    const afterFirstWrite = await snapshotFiles(fixture);
    const created = Object.keys(afterFirstWrite).filter((path) => !Object.hasOwn(before, path));
    assert.ok(created.length > 0);
    assert.ok(created.every((path) => path.startsWith("manual/source/") && (path.endsWith("README.md") || path.endsWith(".authoring.md"))), created.join("\n"));
    assert.equal(created.some((path) => path.endsWith(".json")), false);
    assert.deepEqual(Object.keys(afterFirstWrite).filter((path) => path.startsWith("manual/source/") && path.endsWith(".json")), Object.keys(before).filter((path) => path.startsWith("manual/source/") && path.endsWith(".json")));

    const secondWrite = await runScaffold(fixture, ["--write"]);
    assert.equal(secondWrite.status, 0, secondWrite.stderr);
    assert.deepEqual(await snapshotFiles(fixture), afterFirstWrite);

    const briefPath = created.find((path) => path.endsWith(".authoring.md"));
    assert.ok(briefPath);
    await writeFile(join(fixture, briefPath), `${await readFile(join(fixture, briefPath), "utf8")}\nDRIFT\n`);
    const drift = await runScaffold(fixture, ["--write"]);
    assert.notEqual(drift.status, 0);
    assert.match(`${drift.stdout}\n${drift.stderr}`, /AUTHORING_BRIEF_DRIFT/);

    const regenerated = await runScaffold(fixture, ["--write", "--regenerate"]);
    assert.equal(regenerated.status, 0, regenerated.stderr);
    assert.deepEqual(await snapshotFiles(fixture), afterFirstWrite);
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});

test("source discovery rejects malformed and unrecognized JSON instead of silently ignoring it", async () => {
  const fixture = await copyFixture();
  try {
    const invalidPath = join(fixture, "manual", "source", "unrecognized.json");
    await writeFile(invalidPath, "{ malformed");
    await assert.rejects(() => validateAuthoringContracts(fixture), (error) => error instanceof AuthoringFailure && error.code === "INVALID_SOURCE_JSON");
    await rm(invalidPath);
    await writeFile(invalidPath, JSON.stringify({ schemaVersion: "unknown", batchId: "unknown" }));
    await assert.rejects(() => validateAuthoringContracts(fixture), (error) => error instanceof AuthoringFailure && error.code === "UNKNOWN_FAMILY");
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});
