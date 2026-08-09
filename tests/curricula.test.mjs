import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { catalogueFingerprint, loadCurricula, validateCurriculum } from "../scripts/curriculum/curricula.mjs";
import { loadCanonicalTrackBriefs } from "../scripts/product/track-briefs.mjs";

const curricula = await loadCurricula();
const briefs = await loadCanonicalTrackBriefs();
const clone = (value) => structuredClone(value);

test("curriculum catalogue represents every release track without admitting active content", () => {
  assert.equal(curricula.length, 10);
  assert.equal(new Set(curricula.map((entry) => entry.trackId)).size, 10);
  assert.match(catalogueFingerprint(curricula), /^[a-f0-9]{64}$/);
  for (const curriculum of curricula) {
    assert.ok(curriculum.nodes.some((node) => node.nodeId === curriculum.freeNodeId && node.freeOrPremiumRole === "free"));
    assert.ok(curriculum.nodes.every((node) => node.packageOwnership === "whole_node_package"));
  }
});

test("family-specific blocks, count reconciliation, and mode feasibility remain explicit", () => {
  for (const curriculum of curricula) {
    const expected = curriculum.familyId === "coding_interview" ? "coding_mental_unit" : curriculum.familyId === "certification" ? "certification_competency_block" : "design_decision_block";
    assert.ok(curriculum.nodes.flatMap((node) => node.learningBlocks).every((block) => block.blockKind === expected));
    assert.equal(curriculum.targetItemCount, curriculum.nodes.flatMap((node) => node.learningBlocks).reduce((sum, block) => sum + block.targetItemCount, 0));
    if (curriculum.familyId === "design_interview") assert.ok(curriculum.modePoolPlans.every((pool) => pool.status === "blocked_by_contract"));
    assert.ok(curriculum.nodes.every((node) => node.learningBlocks.reduce((sum, block) => sum + block.targetItemCount, 0) >= 120));
    const brief = briefs.find((entry) => entry.trackId === curriculum.trackId);
    assert.deepEqual(new Set(curriculum.modePoolPlans.map((pool) => pool.modeId)), new Set(brief.validModes));
  }
});

test("Coding Interview preserves its verified 26-node, 2,375-item base while every node meets the 120-item floor", () => {
  const coding = curricula.find((entry) => entry.trackId === "coding-interview-dsa-problem-solving");
  assert.equal(coding.nodes.length, 26);
  assert.equal(coding.existingVerifiedItemCount, 2375);
  assert.equal(coding.authoringItemCount, coding.targetItemCount - coding.existingVerifiedItemCount);
  assert.ok(coding.nodes.every((node) => node.existingVerifiedItemCount + node.authoringItemCount === node.learningBlocks.reduce((sum, block) => sum + block.targetItemCount, 0)));
  assert.ok(coding.nodes.every((node) => node.learningBlocks.reduce((sum, block) => sum + block.targetItemCount, 0) >= 120));
});

test("validator rejects missing boundaries, stale GCP identities, unsupported interactions, and count drift", () => {
  const gcp = clone(curricula.find((entry) => entry.trackId === "google-cloud-associate-cloud-engineer"));
  const coding = clone(curricula.find((entry) => entry.trackId === "coding-interview-dsa-problem-solving"));
  const gcpBrief = briefs.find((entry) => entry.trackId === gcp.trackId);
  const codingBrief = briefs.find((entry) => entry.trackId === coding.trackId);
  gcp.nodes[0].learningBlocks[0].coverageTargets[0].coverageTargetId = "ace-q-0001";
  assert.throws(() => validateCurriculum(gcp, gcpBrief), /GCP_ZERO_RETENTION_FAILURE/);
  coding.nodes[0].learningBlocks[0].targetItemCount += 1;
  assert.throws(() => validateCurriculum(coding, codingBrief), /COUNT_RECONCILIATION_FAILURE/);
  const accounting = clone(curricula.find((entry) => entry.trackId === "coding-interview-dsa-problem-solving"));
  accounting.nodes[0].authoringItemCount += 1;
  assert.throws(() => validateCurriculum(accounting, codingBrief), /INVALID_VOLUME_ACCOUNTING/);
  const interaction = clone(curricula.find((entry) => entry.trackId === "google-cloud-associate-cloud-engineer"));
  interaction.nodes[0].learningBlocks[0].coverageTargets[0].preferredInteractionContract = "ordering";
  assert.throws(() => validateCurriculum(interaction, gcpBrief), /UNSUPPORTED_ACTIVE_INTERACTION/);
  const boundary = clone(curricula.find((entry) => entry.trackId === "coding-interview-dsa-problem-solving"));
  boundary.nodes[0].learningBlocks[0].coverageTargets[0].decisiveBoundary = "";
  assert.throws(() => validateCurriculum(boundary, codingBrief), /INCOMPLETE_COVERAGE_TARGET/);
});

test("curriculum specifications are separate from publishing discovery", async () => {
  const pipeline = await readFile("scripts/publishing/pipeline.mjs", "utf8");
  const publishingScripts = await readFile("scripts/publishing/cli.mjs", "utf8");
  assert.doesNotMatch(`${pipeline}\n${publishingScripts}`, /config\/curricula/);
  const gcp = curricula.find((entry) => entry.trackId === "google-cloud-associate-cloud-engineer");
  assert.doesNotMatch(JSON.stringify(gcp), /ace-q-\d+/);
});
