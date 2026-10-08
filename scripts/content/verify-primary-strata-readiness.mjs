import { lstat, readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { canonicalJson, sha256, validateTrack } from "../build.mjs";

const ROOT = path.resolve(fileURLToPath(new URL("../../", import.meta.url)));
const MANIFEST_PATH = "config/primary-strata-readiness.json";
const CATALOG_PATH = "content/catalog.json";
const LOADER_PATHS = ["scripts/build.mjs", "scripts/content/question-contract.mjs", "scripts/content/planning-policy.mjs"];
const PACKAGE_PATH = "package.json";
const TRACK_IDS = [
  "aws-certified-solutions-architect-associate",
  "backend-system-design-interview",
  "claude-certified-architect-professional-certification",
  "coding-interview-dsa-problem-solving",
  "frontend-system-design-interview",
  "google-cloud-associate-cloud-engineer",
  "microsoft-azure-administrator-associate-az-104",
  "microsoft-azure-ai-fundamentals-ai-901",
  "object-oriented-design-interview"
].sort();
const CERTIFICATION_TRACKS = new Set([
  "aws-certified-solutions-architect-associate",
  "claude-certified-architect-professional-certification",
  "google-cloud-associate-cloud-engineer",
  "microsoft-azure-administrator-associate-az-104",
  "microsoft-azure-ai-fundamentals-ai-901"
]);
const DESIGN_TRACKS = new Set([
  "backend-system-design-interview",
  "frontend-system-design-interview",
  "object-oriented-design-interview"
]);
const CODING_TRACK = "coding-interview-dsa-problem-solving";

function fail(message) {
  const error = new Error(message);
  error.name = "ReadinessError";
  throw error;
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function within(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

export async function secureFile(root, relativePath) {
  if (typeof relativePath !== "string" || path.isAbsolute(relativePath) || relativePath.split(/[\\/]/u).includes("..")) fail("input_path_invalid");
  const base = path.resolve(root);
  const target = path.resolve(base, relativePath);
  if (!within(base, target)) fail("input_path_outside_root");
  let current = base;
  for (const segment of path.relative(base, target).split(path.sep)) {
    current = path.join(current, segment);
    let info;
    try { info = await lstat(current); } catch { fail("input_missing_or_unreadable"); }
    if (info.isSymbolicLink()) fail("input_symlink_disallowed");
  }
  try {
    const [baseReal, targetReal] = await Promise.all([realpath(base), realpath(target)]);
    if (!within(baseReal, targetReal)) fail("input_realpath_outside_root");
  } catch { fail("input_realpath_unavailable"); }
  return target;
}

async function input(root, relativePath, role) {
  const file = await secureFile(root, relativePath);
  let bytes;
  try { bytes = await readFile(file); } catch { fail("input_read_failed"); }
  return { path: relativePath.split(path.sep).join("/"), role, sha256: sha256(bytes) };
}

async function json(root, relativePath) {
  const file = await secureFile(root, relativePath);
  try { return JSON.parse(await readFile(file, "utf8")); } catch { fail("configuration_invalid"); }
}

function trackConfigPath(trackId) {
  return `config/tracks/${trackId}.json`;
}

async function declaredInputs(root, trackId, validated) {
  const paths = new Map([[CATALOG_PATH, "canonical_catalog"], ...LOADER_PATHS.map((p) => [p, "validation_owner_code"])]);
  paths.set(`config/curricula/${trackId}.json`, "planning_policy_source");
  for (const sourceFile of validated.sourceFiles) {
    const relative = path.relative(root, sourceFile).split(path.sep).join("/");
    paths.set(relative, "canonical_question_source");
  }

  if (trackId === "google-cloud-associate-cloud-engineer" || trackId === CODING_TRACK) {
    const configRelative = trackConfigPath(trackId);
    paths.set(configRelative, "track_configuration");
    const config = await json(root, configRelative);
    if (typeof config.taxonomyPath !== "string") fail("loader_dependency_undeclared");
    paths.set(config.taxonomyPath, "track_taxonomy");
    if (trackId === "google-cloud-associate-cloud-engineer") {
      const artifactPath = config.profile?.nodeDomainMapEvidence?.artifactPath;
      if (typeof artifactPath !== "string") fail("loader_dependency_undeclared");
      paths.set(artifactPath, "published_domain_evidence");
    }
  } else if (DESIGN_TRACKS.has(trackId)) {
    paths.set("config/simulation-profiles/design-interview.json", "simulation_profile_source");
  } else if (!CERTIFICATION_TRACKS.has(trackId)) {
    fail("loader_dependency_undeclared");
  }

  let registry;
  if (CERTIFICATION_TRACKS.has(trackId)) {
    const registryPath = `config/certification-objective-registries/${trackId}.json`;
    paths.set(registryPath, "objective_registry_source");
    registry = { path: registryPath, value: await json(root, registryPath) };
  }
  const inputs = await Promise.all([...paths].map(([relative, role]) => input(root, relative, role)));
  inputs.push({ path: CATALOG_PATH, role: "catalog_track_entry", sha256: sha256(canonicalJson(validated.track)) });
  inputs.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : a.role < b.role ? -1 : a.role > b.role ? 1 : 0);
  return { inputs, registry };
}

async function loaderOwner(root, inputs) {
  const ownerPackage = await json(root, PACKAGE_PATH);
  const loader = inputs.find((x) => x.path === "scripts/build.mjs");
  if (ownerPackage.name !== "patternly-content" || typeof ownerPackage.version !== "string" || !loader) fail("loader_owner_identity_invalid");
  return { name: ownerPackage.name, version: ownerPackage.version, entrypoint: loader.path, sha256: loader.sha256 };
}

function setHash(ids) {
  return sha256(canonicalJson([...ids].sort()));
}

function uniqueCounts(questions) {
  return {
    questions: new Set(questions.map((q) => q.questionId)).size,
    nodes: new Set(questions.map((q) => q.nodeId)).size,
    mentalUnits: new Set(questions.map((q) => q.mentalUnitId)).size
  };
}

async function currentSourceProvenance(root, trackId) {
  const validated = await validateTrack({ rootDirectory: root, trackId });
  const questionIds = validated.questions.map((question) => question.questionId);
  const declared = await declaredInputs(root, trackId, validated);
  const owner = await loaderOwner(root, declared.inputs);
  return {
    validated,
    trackId,
    contentVersion: validated.track.contentVersion,
    questionCount: questionIds.length,
    questionIdSetSha256: setHash(questionIds),
    inputs: declared.inputs,
    loaderOwner: owner,
    sourceInventorySha256: sha256(canonicalJson({ inputs: declared.inputs, loaderOwner: owner }))
  };
}

export async function describeCurrentSourceProvenance({ rootDirectory = ROOT, trackId } = {}) {
  if (!TRACK_IDS.includes(trackId)) fail("source_provenance_track_invalid");
  const { validated, ...provenance } = await currentSourceProvenance(path.resolve(rootDirectory), trackId);
  return provenance;
}

export function validatePrimaryObjective(trackId, source, questionIds, registryData) {
  const objective = source.primaryObjective;
  if (!isRecord(objective) || !["unavailable", "partial", "complete"].includes(objective.status)) fail("primary_objective_shape_invalid");
  if (objective.status === "unavailable") {
    if (typeof objective.reason !== "string" || !objective.reason.trim() || Object.hasOwn(objective, "bindings")) fail("unavailable_objective_requires_reason_and_no_rows");
    return { status: "unavailable", reason: objective.reason, mapped: 0, unmapped: questionIds.size, orphan: 0, ambiguous: 0, domainCounts: {}, mappingComplete: false };
  }
  const registry = objective.registry;
  if (!isRecord(registry) || typeof registry.path !== "string" || !/^[a-f0-9]{64}$/u.test(registry.sha256) || !registry.registryVersion) fail("objective_registry_pin_invalid");
  if (!Array.isArray(objective.bindings) || objective.bindings.length === 0) fail("objective_bindings_empty");
  const ids = new Set();
  let ambiguous = 0;
  const domainCounts = Object.create(null);
  if (!isRecord(registryData) || registryData.trackId !== trackId) fail("objective_registry_track_mismatch");
  const domainIds = new Set((registryData.domains ?? []).map((domain) => domain.domainId));
  const objectives = registryData.objectives;
  if (!Array.isArray(registryData.domains) || !domainIds.size || domainIds.size !== registryData.domains.length || !Array.isArray(objectives) || objectives.some((objective) => !isRecord(objective) || typeof objective.objectiveId !== "string" || !domainIds.has(objective.parentDomainId))) fail("objective_registry_structure_invalid");
  const objectiveById = new Map(objectives.map((objective) => [objective.objectiveId, objective]));
  if (objectiveById.size !== objectives.length || registry.registryVersion !== (registryData.registryVersion ?? registryData.version ?? registryData.schemaVersion)) fail("objective_registry_version_invalid");
  for (const binding of objective.bindings) {
    const supportedBindingKeys = ["ambiguous", "domainId", "objectiveId", "parentDomainId", "questionId", "trackId"];
    if (!isRecord(binding) || Object.keys(binding).some((key) => !supportedBindingKeys.includes(key)) || typeof binding.questionId !== "string" || typeof binding.objectiveId !== "string") fail("objective_binding_invalid");
    if (binding.trackId !== undefined && binding.trackId !== trackId) fail("objective_binding_foreign_track");
    if (binding.ambiguous !== undefined && typeof binding.ambiguous !== "boolean") fail("objective_binding_ambiguous_flag_invalid");
    if (!questionIds.has(binding.questionId)) fail("objective_binding_orphan");
    if (ids.has(binding.questionId)) fail("objective_binding_duplicate");
    ids.add(binding.questionId);
    if (!objectiveById.has(binding.objectiveId)) fail("objective_reference_unknown");
    if (binding.ambiguous === true) ambiguous++;
    if (binding.domainId !== undefined) fail("objective_domain_must_derive_from_registry_parent");
    const parentDomainId = objectiveById.get(binding.objectiveId).parentDomainId;
    if (binding.parentDomainId !== undefined && binding.parentDomainId !== parentDomainId) fail("objective_parent_domain_mismatch");
    domainCounts[parentDomainId] = (domainCounts[parentDomainId] ?? 0) + 1;
  }
  if (ambiguous) fail("objective_binding_ambiguous");
  const unmapped = questionIds.size - ids.size;
  if (objective.status === "complete" && (unmapped !== 0 || ids.size !== questionIds.size)) fail("complete_objective_set_incomplete");
  return { status: objective.status, mapped: ids.size, unmapped, orphan: 0, ambiguous, domainCounts, mappingComplete: objective.status === "complete" && unmapped === 0 && ambiguous === 0 };
}

function objectiveRegistryPin(registry) {
  if (!registry) return undefined;
  const value = registry.value;
  const firstSource = value.sources?.[0] ?? value.source;
  return {
    path: registry.path,
    sha256: registry.hash,
    registryVersion: value.registryVersion ?? value.version ?? value.schemaVersion,
    source: {
      guideVersion: firstSource?.guideVersion ?? firstSource?.version ?? value.guideVersion ?? "not_documented",
      checkedDate: firstSource?.checkedDate ?? "not_documented",
      currentness: "unverified"
    }
  };
}

export async function verifyReadiness({ rootDirectory = ROOT, manifest: suppliedManifest } = {}) {
  const root = path.resolve(rootDirectory);
  const manifest = suppliedManifest ?? await json(root, MANIFEST_PATH);
  if (!isRecord(manifest) || manifest.schemaVersion !== "patternly-primary-strata-readiness-v1" || !Array.isArray(manifest.tracks) || manifest.tracks.length !== 9) fail("manifest_must_have_exactly_nine_tracks");
  const ids = manifest.tracks.map((entry) => entry.trackId);
  if (new Set(ids).size !== ids.length || canonicalJson([...ids].sort()) !== canonicalJson(TRACK_IDS)) fail("manifest_track_set_invalid");
  const summaries = [];
  for (const entry of manifest.tracks) {
    if (!isRecord(entry) || !Number.isInteger(entry.questionCount) || entry.questionCount < 1 || !/^[a-f0-9]{64}$/u.test(entry.questionIdSetSha256) || !/^[a-f0-9]{64}$/u.test(entry.sourceInventorySha256) || !Array.isArray(entry.inputs)) fail("manifest_entry_invalid");
    for (const declared of entry.inputs) {
      if (!isRecord(declared) || typeof declared.role !== "string" || !/^[a-f0-9]{64}$/u.test(declared.sha256)) fail("manifest_input_invalid");
      await secureFile(root, declared.path);
    }
    const current = await currentSourceProvenance(root, entry.trackId);
    const result = current.validated;
    const idsForTrack = result.questions.map((q) => q.questionId);
    if (current.contentVersion !== entry.contentVersion || current.questionCount !== entry.questionCount || current.questionIdSetSha256 !== entry.questionIdSetSha256) fail(`stale_source_${entry.trackId}`);
    if (canonicalJson(entry.inputs) !== canonicalJson(current.inputs) || canonicalJson(entry.loaderOwner) !== canonicalJson(current.loaderOwner) || current.sourceInventorySha256 !== entry.sourceInventorySha256) fail(`stale_provenance_${entry.trackId}`);
    const sourceByPath = new Map(current.inputs.map((x) => [x.path, x]));
    const registryRecord = [...sourceByPath.values()].find((x) => x.role === "objective_registry_source");
    if (!isRecord(entry.primaryObjective)) fail("primary_objective_shape_invalid");
    const expectedStratumKind = entry.trackId === "google-cloud-associate-cloud-engineer" ? "published_item_domain" : entry.trackId === CODING_TRACK || DESIGN_TRACKS.has(entry.trackId) ? "patternly_node" : "unavailable";
    if (!isRecord(entry.stratum) || entry.stratum.kind !== expectedStratumKind) fail("stratum_declaration_invalid");
    if (registryRecord && (!isRecord(entry.primaryObjective.registry) || entry.primaryObjective.registry.sha256 !== registryRecord.sha256 || entry.primaryObjective.registry.path !== registryRecord.path)) fail("objective_registry_pin_stale");
    if (!registryRecord && entry.primaryObjective.registry) fail("objective_registry_unexpected");
    const registryData = registryRecord ? await json(root, registryRecord.path) : undefined;
    if (registryRecord) {
      const expectedPin = objectiveRegistryPin({ path: registryRecord.path, hash: registryRecord.sha256, value: registryData });
      if (canonicalJson(entry.primaryObjective.registry) !== canonicalJson(expectedPin)) fail("objective_registry_pin_stale");
    }
    const objective = validatePrimaryObjective(entry.trackId, entry, new Set(idsForTrack), registryData);

    const questions = result.questions;
    const domains = new Map();
    const nodes = new Map();
    if (entry.stratum.kind === "published_item_domain") {
      for (const q of result.artifactQuestions) {
      if (typeof q.contentDomainId !== "string") fail("published_domain_proof_missing");
        domains.set(q.questionId, q.contentDomainId);
      }
      if (domains.size !== questions.length || !result.simulationProfiles?.length) fail("published_domain_proof_incomplete");
    } else if (entry.stratum.kind === "patternly_node") {
      for (const q of questions) nodes.set(q.questionId, q.nodeId);
    } else if (entry.stratum.kind !== "unavailable") fail("stratum_kind_invalid");

    const domainCounts = Object.create(null);
    for (const domainId of domains.values()) domainCounts[domainId] = (domainCounts[domainId] ?? 0) + 1;
    const nodeCounts = Object.create(null);
    if (entry.stratum.kind === "patternly_node") for (const q of questions) nodeCounts[q.nodeId] = (nodeCounts[q.nodeId] ?? 0) + 1;
    summaries.push({
      trackId: entry.trackId,
      contentVersion: entry.contentVersion,
      ...uniqueCounts(questions),
      primaryObjective: objective,
      stratum: { kind: entry.stratum.kind, status: entry.stratum.kind === "unavailable" ? "unavailable" : "verified", uniqueDomainCount: new Set(domains.values()).size, uniqueNodeCount: new Set(nodes.values()).size, domainCounts, nodeCounts },
      structuralValidity: "valid",
      semanticOwnerApproval: "not_established",
      efficacy: "not_evaluated",
      readiness: "not_ready"
    });
  }
  return { schemaVersion: manifest.schemaVersion, tracks: summaries };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = await verifyReadiness();
    console.log(JSON.stringify(result));
  } catch (error) {
    const category = error.name === "ReadinessError" ? error.message : "validation_failed";
    console.error(JSON.stringify({ status: "error", category }));
    process.exitCode = 1;
  }
}
