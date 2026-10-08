import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { secureFile, validatePrimaryObjective, verifyReadiness } from "../scripts/content/verify-primary-strata-readiness.mjs";

const manifest = JSON.parse(await readFile(new URL("../config/primary-strata-readiness.json", import.meta.url), "utf8"));
const clone = (value) => structuredClone(value);
const sha = "a".repeat(64);
const trackId = "aws-certified-solutions-architect-associate";
const registry = JSON.parse(await readFile(new URL("../config/certification-objective-registries/aws-certified-solutions-architect-associate.json", import.meta.url), "utf8"));
const objectiveId = registry.objectives[0].objectiveId;
const pinnedRegistry = manifest.tracks.find((entry) => entry.trackId === trackId).primaryObjective.registry;

test("current nine-track manifest verifies as structurally valid without claiming primary readiness", async () => {
  const result = await verifyReadiness({ manifest });
  assert.equal(result.tracks.length, 9);
  assert.ok(result.tracks.every((track) => track.structuralValidity === "valid"));
  assert.ok(result.tracks.every((track) => track.primaryObjective.status === "unavailable" && track.readiness === "not_ready"));
  assert.ok(result.tracks.every((track) => track.semanticOwnerApproval === "not_established" && track.efficacy === "not_evaluated"));
  const gcp = result.tracks.find((track) => track.trackId === "google-cloud-associate-cloud-engineer");
  assert.equal(gcp.stratum.kind, "published_item_domain");
  assert.equal(gcp.stratum.status, "verified");
  assert.equal(gcp.stratum.uniqueDomainCount, 4);
  assert.equal(gcp.questions, 2981);
  const coding = result.tracks.find((track) => track.trackId === "coding-interview-dsa-problem-solving");
  assert.equal(coding.stratum.kind, "patternly_node");
  assert.ok(coding.stratum.uniqueNodeCount > 1);
  const aws = result.tracks.find((track) => track.trackId === "aws-certified-solutions-architect-associate");
  assert.equal(aws.stratum.kind, "unavailable");
});

test("manifest requires the exact nine unique current track identities", async () => {
  const bad = clone(manifest);
  bad.tracks[1].trackId = bad.tracks[0].trackId;
  await assert.rejects(verifyReadiness({ manifest: bad }), /manifest_track_set_invalid/u);
  const foreign = clone(manifest);
  foreign.tracks[0].trackId = "foreign-track";
  await assert.rejects(verifyReadiness({ manifest: foreign }), /manifest_track_set_invalid/u);
});

test("content version, exact question set and full source inventory drift are rejected", async () => {
  for (const mutate of [
    (entry) => { entry.contentVersion += "-stale"; },
    (entry) => { entry.questionIdSetSha256 = sha; },
    (entry) => { entry.inputs[0].sha256 = sha; }
  ]) {
    const bad = clone(manifest);
    mutate(bad.tracks[0]);
    await assert.rejects(verifyReadiness({ manifest: bad }), /stale_(source|provenance)_/u);
  }
});

test("unavailable objectives require a concrete reason and omit empty binding rows", () => {
  assert.deepEqual(validatePrimaryObjective(trackId, { primaryObjective: { status: "unavailable", reason: "No owner-reviewed mappings." } }, new Set(["q1"])), {
    status: "unavailable", reason: "No owner-reviewed mappings.", mapped: 0, unmapped: 1, orphan: 0, ambiguous: 0, domainCounts: {}, mappingComplete: false
  });
  assert.throws(() => validatePrimaryObjective(trackId, { primaryObjective: { status: "unavailable", reason: "gap", bindings: [] } }, new Set(["q1"])), /unavailable_objective_requires_reason_and_no_rows/u);
  assert.throws(() => validatePrimaryObjective(trackId, { primaryObjective: { status: "partial", registry: pinnedRegistry, bindings: [] } }, new Set(["q1"]), registry), /objective_bindings_empty/u);
});

test("partial and complete bindings enforce exact question and pinned objective identities", () => {
  const ids = new Set(["q1", "q2"]);
  const partial = validatePrimaryObjective(trackId, { primaryObjective: {
    status: "partial", registry: pinnedRegistry, bindings: [{ questionId: "q1", objectiveId }]
  } }, ids, registry);
  assert.equal(partial.mapped, 1);
  assert.equal(partial.unmapped, 1);
  assert.equal(partial.mappingComplete, false);
  assert.equal(partial.domainCounts[registry.objectives[0].parentDomainId], 1);
  const complete = { primaryObjective: {
    status: "complete", registry: pinnedRegistry, bindings: [
      { questionId: "q1", objectiveId }, { questionId: "q2", objectiveId }
    ]
  } };
  assert.equal(validatePrimaryObjective(trackId, complete, ids, registry).mappingComplete, true);
  assert.throws(() => validatePrimaryObjective(trackId, { primaryObjective: { ...complete.primaryObjective, bindings: complete.primaryObjective.bindings.slice(0, 1) } }, ids, registry), /complete_objective_set_incomplete/u);
  assert.throws(() => validatePrimaryObjective(trackId, { primaryObjective: { ...complete.primaryObjective, bindings: [{ questionId: "q3", objectiveId }] } }, ids, registry), /objective_binding_orphan/u);
  assert.throws(() => validatePrimaryObjective(trackId, { primaryObjective: { ...complete.primaryObjective, bindings: [{ questionId: "q1", objectiveId: "unknown" }] } }, ids, registry), /objective_reference_unknown/u);
  assert.throws(() => validatePrimaryObjective(trackId, { primaryObjective: { ...complete.primaryObjective, bindings: [{ questionId: "q1", objectiveId, trackId: "other" }] } }, ids, registry), /objective_binding_foreign_track/u);
  assert.throws(() => validatePrimaryObjective(trackId, { primaryObjective: { ...complete.primaryObjective, bindings: [complete.primaryObjective.bindings[0], complete.primaryObjective.bindings[0]] } }, ids, registry), /objective_binding_duplicate/u);
  assert.throws(() => validatePrimaryObjective(trackId, { primaryObjective: { ...complete.primaryObjective, bindings: [{ questionId: "q1", objectiveId, ambiguous: true }] } }, ids, registry), /objective_binding_ambiguous/u);
  assert.throws(() => validatePrimaryObjective(trackId, { primaryObjective: { ...complete.primaryObjective, bindings: [{ questionId: "q1", objectiveId, ambiguous: "true" }] } }, ids, registry), /objective_binding_ambiguous_flag_invalid/u);
  assert.throws(() => validatePrimaryObjective(trackId, { primaryObjective: { ...complete.primaryObjective, bindings: [{ questionId: "q1", objectiveId, extra: "ignored" }] } }, ids, registry), /objective_binding_invalid/u);
  assert.throws(() => validatePrimaryObjective(trackId, { primaryObjective: { ...complete.primaryObjective, bindings: [{ questionId: "q1", objectiveId, parentDomainId: "wrong-domain" }] } }, ids, registry), /objective_parent_domain_mismatch/u);
  assert.throws(() => validatePrimaryObjective(trackId, { primaryObjective: { ...complete.primaryObjective, registry: { ...pinnedRegistry, registryVersion: "old" } } }, ids, registry), /objective_registry_version_invalid/u);
});

test("registry and published evidence pins reject drift", async () => {
  const staleRegistry = clone(manifest);
  staleRegistry.tracks[0].primaryObjective.registry.sha256 = sha;
  await assert.rejects(verifyReadiness({ manifest: staleRegistry }), /objective_registry_pin_stale/u);
  const stalePublished = clone(manifest);
  const gcp = stalePublished.tracks.find((entry) => entry.trackId === "google-cloud-associate-cloud-engineer");
  const proof = gcp.inputs.find((input) => input.role === "published_domain_evidence");
  proof.sha256 = sha;
  await assert.rejects(verifyReadiness({ manifest: stalePublished }), /stale_provenance_google-cloud-associate-cloud-engineer/u);
});

test("path rules reject absolute, escaping, and symlinked declared inputs", async () => {
  const bad = clone(manifest);
  bad.tracks[0].inputs[0].path = "/etc/passwd";
  await assert.rejects(verifyReadiness({ manifest: bad }), /input_path_invalid/u);
  const root = await mkdtemp(path.join(os.tmpdir(), "primary-strata-"));
  try {
    await writeFile(path.join(root, "target.json"), "{}");
    await symlink(path.join(root, "target.json"), path.join(root, "linked.json"));
    await assert.rejects(secureFile(root, "../outside.json"), /input_path_invalid/u);
    await assert.rejects(secureFile(root, "linked.json"), /input_symlink_disallowed/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
