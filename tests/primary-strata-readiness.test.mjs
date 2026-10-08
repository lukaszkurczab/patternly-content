import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { canonicalJson, sha256 } from "../scripts/build.mjs";
import { secureFile, validatePrimaryObjective, verifyReadiness } from "../scripts/content/verify-primary-strata-readiness.mjs";

const manifest = JSON.parse(await readFile(new URL("../config/primary-strata-readiness.json", import.meta.url), "utf8"));
const clone = (value) => structuredClone(value);
const sha = "a".repeat(64);
const trackId = "aws-certified-solutions-architect-associate";
const registry = JSON.parse(await readFile(new URL("../config/certification-objective-registries/aws-certified-solutions-architect-associate.json", import.meta.url), "utf8"));
const objectiveId = registry.objectives[0].objectiveId;
const pinnedRegistry = manifest.tracks.find((entry) => entry.trackId === trackId).primaryObjective.registry;

test("current nine-track manifest verifies partial AZ-104 mapping without claiming track readiness", async () => {
  const result = await verifyReadiness({ manifest });
  assert.equal(result.tracks.length, 9);
  assert.ok(result.tracks.every((track) => track.structuralValidity === "valid"));
  assert.ok(result.tracks.every((track) => track.readiness === "not_ready"));
  assert.ok(result.tracks.every((track) => track.semanticOwnerApproval === "not_established" && track.efficacy === "not_evaluated"));
  assert.equal(result.tracks.reduce((sum, track) => sum + track.questions, 0), 16622);
  assert.equal(result.tracks.reduce((sum, track) => sum + track.nodes, 0), 117);
  assert.equal(result.tracks.reduce((sum, track) => sum + track.mentalUnits, 0), 943);
  const az104 = result.tracks.find((track) => track.trackId === "microsoft-azure-administrator-associate-az-104");
  assert.equal(az104.primaryObjective.status, "partial");
  assert.equal(az104.primaryObjective.mapped, 287);
  assert.equal(az104.primaryObjective.unmapped, 1001);
  assert.equal(az104.primaryObjective.orphan, 0);
  assert.equal(az104.primaryObjective.ambiguous, 0);
  assert.equal(az104.primaryObjective.mappingComplete, false);
  assert.equal(az104.primaryObjective.domainCounts["az-104-2026-04-17-domain-1"], 287);
  assert.equal(Object.keys(az104.primaryObjective.domainCounts).length, 1);
  assert.equal(az104.questions, 1288);
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
  assert.ok(result.tracks.filter((track) => track.trackId !== "microsoft-azure-administrator-associate-az-104").every((track) => track.primaryObjective.status === "unavailable"));
});

test("AZ-104 preserves N01 bindings and appends the exact approved N02 partial set", () => {
  const az104 = manifest.tracks.find((entry) => entry.trackId === "microsoft-azure-administrator-associate-az-104");
  const expectedN01B01Rows = [
    ["001", "1.3"], ["002", "1.1"], ["005", "1.1"], ["007", "1.2"], ["008", "1.2"],
    ["009", "1.1"], ["010", "1.1"], ["011", "1.1"], ["012", "1.2"], ["013", "1.2"], ["014", "1.3"]
  ].map(([questionSuffix, objectiveSuffix]) => ({
    questionId: `az104-AZ104-N01-B01-${questionSuffix}`,
    objectiveId: `az-104-2026-04-17-${objectiveSuffix}`
  }));
  const n01Rows = az104.primaryObjective.bindings.filter((binding) => binding.questionId.startsWith("az104-AZ104-N01-"));
  const n02Rows = az104.primaryObjective.bindings.filter((binding) => binding.questionId.startsWith("az104-AZ104-N02-"));
  assert.equal(az104.primaryObjective.status, "partial");
  assert.deepEqual(n01Rows.filter((binding) => binding.questionId.startsWith("az104-AZ104-N01-B01-")), expectedN01B01Rows);
  const n01AddedRows = n01Rows.filter((binding) => !binding.questionId.startsWith("az104-AZ104-N01-B01-"));
  assert.equal(n01Rows.length, 123);
  assert.equal(n01AddedRows.length, 112);
  assert.equal(sha256(canonicalJson(n01AddedRows)), "3f729796db99e6185758203509710b7281bb245e3f412929623dd714b8a3782b");
  assert.equal(n01AddedRows.filter((binding) => binding.objectiveId === "az-104-2026-04-17-1.1").length, 109);
  assert.equal(n01AddedRows.filter((binding) => binding.objectiveId === "az-104-2026-04-17-1.2").length, 3);
  assert.equal(n02Rows.length, 164);
  assert.equal(sha256(canonicalJson(n02Rows)), "3bcaf2a2df729402b17a5d15efd2335ca780761be04e40bb41df5c35589f2632");
  assert.equal(n02Rows.filter((binding) => binding.objectiveId === "az-104-2026-04-17-1.2").length, 46);
  assert.equal(n02Rows.filter((binding) => binding.objectiveId === "az-104-2026-04-17-1.3").length, 118);
  assert.deepEqual(n02Rows.find((binding) => binding.questionId === "az104-AZ104-N02-B01-012"), {
    questionId: "az104-AZ104-N02-B01-012", objectiveId: "az-104-2026-04-17-1.2"
  });
  assert.equal(az104.primaryObjective.bindings.length, 287);
  assert.deepEqual(Object.fromEntries(["1.1", "1.2", "1.3"].map((suffix) => [
    suffix, az104.primaryObjective.bindings.filter((binding) => binding.objectiveId === `az-104-2026-04-17-${suffix}`).length
  ])), { "1.1": 114, "1.2": 53, "1.3": 120 });
  assert.equal(az104.primaryObjective.registry.sha256, "7728bafa22a5d622ae1f64d14bb3fb5ff3459431c23aaeb82ad1fceaaf0f2476");
  assert.equal(az104.contentVersion, "microsoft-azure-administrator-associate-az-104-authoring-v2026.08.15-bizq02-v2");
  assert.equal(az104.primaryObjective.bindings.some((binding) => Object.hasOwn(binding, "domainId") || Object.hasOwn(binding, "parentDomainId")), false);
  for (const excludedId of [
    "az104-AZ104-N01-B01-003", "az104-AZ104-N01-B01-004", "az104-AZ104-N01-B01-006",
    "az104-AZ104-N01-B05-001", "az104-AZ104-N01-B05-004", "az104-AZ104-N01-B05-016",
    "az104-AZ104-N01-B07-007", "az104-AZ104-N01-B07-014", "az104-AZ104-N01-B08-003",
    "az104-AZ104-N02-B05-020", "az104-AZ104-N02-B09-014", "az104-AZ104-N02-B09-022", "az104-AZ104-N02-B09-024"
  ]) {
    assert.equal(az104.primaryObjective.bindings.some((binding) => binding.questionId === excludedId), false, excludedId);
  }
  assert.equal(az104.questionIdSetSha256, "05c5642f6a14aa365d55e676e211a9b4466344c645e5361178e72aa6c54b3d25");
  assert.equal(az104.sourceInventorySha256, "88a0a42edfa3905b47c2c39a761d463272876d5d0a772fea028972867db0ceb0");
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
