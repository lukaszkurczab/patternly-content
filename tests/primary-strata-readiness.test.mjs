import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { canonicalJson, sha256, validateTrack } from "../scripts/build.mjs";
import { describeCurrentSourceProvenance, secureFile, validatePrimaryObjective, verifyReadiness } from "../scripts/content/verify-primary-strata-readiness.mjs";

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
  assert.equal(az104.primaryObjective.mapped, 1270);
  assert.equal(az104.primaryObjective.unmapped, 18);
  assert.equal(az104.primaryObjective.orphan, 0);
  assert.equal(az104.primaryObjective.ambiguous, 0);
  assert.equal(az104.primaryObjective.mappingComplete, false);
  assert.equal(az104.primaryObjective.domainCounts["az-104-2026-04-17-domain-1"], 296);
  assert.equal(az104.primaryObjective.domainCounts["az-104-2026-04-17-domain-2"], 254);
  assert.equal(az104.primaryObjective.domainCounts["az-104-2026-04-17-domain-3"], 298);
  assert.equal(az104.primaryObjective.domainCounts["az-104-2026-04-17-domain-4"], 240);
  assert.equal(az104.primaryObjective.domainCounts["az-104-2026-04-17-domain-5"], 182);
  assert.equal(Object.keys(az104.primaryObjective.domainCounts).length, 5);
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
  assert.ok(result.tracks.filter((track) => !["microsoft-azure-administrator-associate-az-104", "microsoft-azure-ai-fundamentals-ai-901"].includes(track.trackId)).every((track) => track.primaryObjective.status === "unavailable"));
});

test("AI-901 preserves the reviewed 635-item partial mapping and all 117 reviewed exclusions", async () => {
  const ai901 = manifest.tracks.find((entry) => entry.trackId === "microsoft-azure-ai-fundamentals-ai-901");
  const verified = (await verifyReadiness({ manifest })).tracks.find((track) => track.trackId === ai901.trackId);
  assert.equal(ai901.contentVersion, "microsoft-azure-ai-fundamentals-ai-901-authoring-v2026.08.15-bizq02-v2");
  assert.equal(ai901.questionCount, 752);
  assert.equal(ai901.questionIdSetSha256, "088aa8189f9d25a5a6da640e487a407c96efde3f410f86d4296bf39f97b8f34a");
  assert.equal(ai901.sourceInventorySha256, "68cb2307ef674998c33f3475d9a58f6cf330f66c87fdcaac2bbdab6802023650");
  assert.deepEqual(ai901.primaryObjective.registry, {
    path: "config/certification-objective-registries/microsoft-azure-ai-fundamentals-ai-901.json",
    sha256: "769202258c0e387550b8fc3160aecf06d2ecf3ba3b42e4153a3052b68f4a9d5b",
    registryVersion: "patternly-certification-objective-registry-v1",
    source: {
      guideVersion: "skills-measured-2026-04-15",
      checkedDate: "2026-08-10",
      currentness: "unverified"
    }
  });
  assert.equal(ai901.primaryObjective.status, "partial");
  assert.equal(ai901.primaryObjective.bindings.length, 635);
  assert.equal(sha256(canonicalJson(ai901.primaryObjective.bindings)), "830bccc7a6301016b0c316334367649c1e68982295dbecc90c0e251ac58f501b");
  assert.equal(verified.primaryObjective.mapped, 635);
  assert.equal(verified.primaryObjective.unmapped, 117);
  assert.equal(verified.primaryObjective.orphan, 0);
  assert.equal(verified.primaryObjective.ambiguous, 0);
  assert.equal(verified.primaryObjective.mappingComplete, false);
  assert.deepEqual({ ...verified.primaryObjective.domainCounts }, {
    "ai-901-2026-04-15-domain-1": 530,
    "ai-901-2026-04-15-domain-2": 105
  });
  assert.deepEqual(Object.fromEntries(["1.1", "1.2", "1.3", "2.1", "2.2", "2.3", "2.4"].map((suffix) => [
    suffix,
    ai901.primaryObjective.bindings.filter((binding) => binding.objectiveId === `ai-901-2026-04-15-${suffix}`).length
  ])), { "1.1": 284, "1.2": 151, "1.3": 95, "2.1": 40, "2.2": 5, "2.3": 20, "2.4": 40 });
  const mappedIds = new Set(ai901.primaryObjective.bindings.map((binding) => binding.questionId));
  const validated = await validateTrack({ rootDirectory: process.cwd(), trackId: ai901.trackId });
  const questionIds = new Set(validated.questions.map((question) => question.questionId));
  const unmappedIds = [...questionIds].filter((questionId) => !mappedIds.has(questionId)).sort();
  assert.equal(mappedIds.size, 635);
  assert.equal(unmappedIds.length, 117);
  assert.equal(sha256(canonicalJson(unmappedIds)), "9f1045b9bf0d9bd395dcd15d47db94868294e23a9d7ffbf499d6cb6733adbee7");
  for (const questionId of [
    "AI901-N05-B05-Q001", "AI901-N05-B05-Q003", "AI901-N05-B05-Q004", "AI901-N05-B05-Q005", "AI901-N05-B05-Q006"
  ]) assert.equal(unmappedIds.includes(questionId), true, questionId);
  assert.equal(verified.semanticOwnerApproval, "not_established");
  assert.equal(verified.efficacy, "not_evaluated");
  assert.equal(verified.readiness, "not_ready");
});

test("read-only provenance description matches the pinned GCP source contract", async () => {
  const trackId = "google-cloud-associate-cloud-engineer";
  const entry = manifest.tracks.find((candidate) => candidate.trackId === trackId);
  const current = await describeCurrentSourceProvenance({ trackId });
  for (const key of ["trackId", "contentVersion", "questionCount", "questionIdSetSha256", "sourceInventorySha256", "inputs", "loaderOwner"]) {
    assert.deepEqual(current[key], entry[key]);
  }
  assert.equal(current.inputs.some((input) => input.path.endsWith("GCPACE-N01-B04.json") && input.role === "canonical_question_source"), true);
  await assert.rejects(describeCurrentSourceProvenance({ trackId: "unknown-track" }), /source_provenance_track_invalid/u);
});

test("AZ-104 preserves N01-N06 bindings and appends the exact corrected N07-N09 partial set", () => {
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
  const storageRows = az104.primaryObjective.bindings.filter((binding) =>
    binding.questionId.startsWith("az104-AZ104-N03-") || binding.questionId.startsWith("az104-AZ104-N04-")
  );
  assert.equal(storageRows.length, 255);
  assert.equal(sha256(canonicalJson(storageRows)), "7cc8d6ef2da580ed7357b8dbb62d4068d7a4cb67dba94432f549f62ac9e2c9ce");
  assert.deepEqual(Object.fromEntries(["2.1", "2.2", "2.3", "1.2"].map((suffix) => [
    suffix, storageRows.filter((binding) => binding.objectiveId === `az-104-2026-04-17-${suffix}`).length
  ])), { "2.1": 82, "2.2": 125, "2.3": 47, "1.2": 1 });
  assert.equal(az104.primaryObjective.bindings.filter((binding) => /az104-AZ104-N0[1-4]-/u.test(binding.questionId)).length, 542);
  // N03-B08-001 is a reviewed Data Box bulk-seeding item outside the pinned registry objectives.
  assert.equal(az104.primaryObjective.bindings.some((binding) => binding.questionId === "az104-AZ104-N03-B08-001"), false);
  const computeRows = az104.primaryObjective.bindings.filter((binding) =>
    binding.questionId.startsWith("az104-AZ104-N05-") || binding.questionId.startsWith("az104-AZ104-N06-")
  );
  assert.equal(computeRows.length, 302);
  assert.equal(sha256(canonicalJson(computeRows)), "4888fa22146a4b33b327d716a235e43f7578ae3f520d82d620599eb9f3e6f0f5");
  assert.deepEqual(Object.fromEntries(["3.1", "3.2", "3.3", "3.4", "1.2"].map((suffix) => [
    suffix, computeRows.filter((binding) => binding.objectiveId === `az-104-2026-04-17-${suffix}`).length
  ])), { "3.1": 69, "3.2": 99, "3.3": 43, "3.4": 83, "1.2": 8 });
  assert.equal(az104.primaryObjective.bindings.filter((binding) => /az104-AZ104-N0[1-6]-/u.test(binding.questionId)).length, 844);
  for (const excludedId of ["az104-AZ104-N06-B08-009", "az104-AZ104-N06-B08-016"]) {
    assert.equal(az104.primaryObjective.bindings.some((binding) => binding.questionId === excludedId), false, excludedId);
  }
  const networkRows = az104.primaryObjective.bindings.filter((binding) =>
    binding.questionId.startsWith("az104-AZ104-N07-") || binding.questionId.startsWith("az104-AZ104-N08-") || binding.questionId.startsWith("az104-AZ104-N09-")
  );
  assert.equal(networkRows.length, 426);
  assert.equal(sha256(canonicalJson(networkRows)), "19cfb7b0d620ae110b24bb38c85c885e11ef7d0aca4184b137933e41d80689f4");
  assert.deepEqual(Object.fromEntries(["3.4", "4.1", "4.2", "4.3", "5.1", "5.2"].map((suffix) => [
    suffix, networkRows.filter((binding) => binding.objectiveId === `az-104-2026-04-17-${suffix}`).length
  ])), { "3.4": 4, "4.1": 80, "4.2": 93, "4.3": 67, "5.1": 120, "5.2": 62 });
  assert.equal(az104.primaryObjective.bindings.length, 1270);
  for (const [questionId, objectiveSuffix] of [
    ["az104-AZ104-N07-B01-007", "3.4"],
    ["az104-AZ104-N07-B08-002", "5.1"],
    ["az104-AZ104-N07-B08-003", "5.1"]
  ]) {
    assert.deepEqual(networkRows.find((binding) => binding.questionId === questionId), {
      questionId, objectiveId: `az-104-2026-04-17-${objectiveSuffix}`
    });
  }
  assert.deepEqual(Object.fromEntries(["1.1", "1.2", "1.3", "2.1", "2.2", "2.3", "3.1", "3.2", "3.3", "3.4", "4.1", "4.2", "4.3", "5.1", "5.2"].map((suffix) => [
    suffix, az104.primaryObjective.bindings.filter((binding) => binding.objectiveId === `az-104-2026-04-17-${suffix}`).length
  ])), { "1.1": 114, "1.2": 62, "1.3": 120, "2.1": 82, "2.2": 125, "2.3": 47, "3.1": 69, "3.2": 99, "3.3": 43, "3.4": 87, "4.1": 80, "4.2": 93, "4.3": 67, "5.1": 120, "5.2": 62 });
  assert.equal(az104.primaryObjective.registry.sha256, "7728bafa22a5d622ae1f64d14bb3fb5ff3459431c23aaeb82ad1fceaaf0f2476");
  assert.equal(az104.contentVersion, "microsoft-azure-administrator-associate-az-104-authoring-v2026.08.15-bizq02-v2");
  assert.equal(az104.primaryObjective.bindings.some((binding) => Object.hasOwn(binding, "domainId") || Object.hasOwn(binding, "parentDomainId")), false);
  for (const excludedId of [
    "az104-AZ104-N01-B01-003", "az104-AZ104-N01-B01-004", "az104-AZ104-N01-B01-006",
    "az104-AZ104-N01-B05-001", "az104-AZ104-N01-B05-004", "az104-AZ104-N01-B05-016",
    "az104-AZ104-N01-B07-007", "az104-AZ104-N01-B07-014", "az104-AZ104-N01-B08-003",
    "az104-AZ104-N02-B05-020", "az104-AZ104-N02-B09-014", "az104-AZ104-N02-B09-022", "az104-AZ104-N02-B09-024",
    "az104-AZ104-N06-B08-009", "az104-AZ104-N06-B08-016",
    "az104-AZ104-N07-B08-008", "az104-AZ104-N08-B06-007"
  ]) {
    assert.equal(az104.primaryObjective.bindings.some((binding) => binding.questionId === excludedId), false, excludedId);
  }
  assert.equal(az104.questionIdSetSha256, "05c5642f6a14aa365d55e676e211a9b4466344c645e5361178e72aa6c54b3d25");
  assert.equal(az104.sourceInventorySha256, "1dbbd3a5117e0396608be155d10775bb48610f6181e90652a6f7cb31db59dda4");
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
