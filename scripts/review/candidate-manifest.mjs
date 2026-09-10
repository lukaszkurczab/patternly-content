import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { validateSchema } from "../authoring/lib/model.mjs";
import {
  ACC01_BASELINE_PATH,
  loadAcc01Baseline,
  validateBaselineMetadata,
  verifyAcc01Baseline,
} from "./content-acceptance-baseline.mjs";
import { summarizeSource } from "./content-approval.mjs";
import { verifyArtifactRecord } from "../publishing/pipeline.mjs";

export const CANDIDATE_MANIFEST_SCHEMA_VERSION = "patternly-content-candidate-manifest-v1";
export const CANDIDATE_MANIFEST_PATH = "evidence/content-acceptance/candidate-manifest-v1.json";
export const CANDIDATE_MANIFEST_SCHEMA_PATH = "schemas/review/content-candidate-manifest.schema.json";
export const CANDIDATE_CANONICAL_REPRESENTATION = Object.freeze({
  canonicalJsonVersion: "canonical-json-v1",
  trackOrder: "ascending-track-id",
  candidateId: "sha256(canonicalJson(identity-payload-without-candidateId))",
});

export const CANDIDATE_TRACK_FAMILIES = Object.freeze({
  "aws-certified-solutions-architect-associate": "certification",
  "backend-system-design-interview": "design_interview",
  "claude-certified-architect-professional-certification": "certification",
  "coding-interview-dsa-problem-solving": "coding_interview",
  "frontend-system-design-interview": "design_interview",
  "google-cloud-associate-cloud-engineer": "certification",
  "microsoft-azure-administrator-associate-az-104": "certification",
  "microsoft-azure-ai-fundamentals-ai-901": "certification",
  "object-oriented-design-interview": "design_interview",
});
export const CANDIDATE_TRACK_IDS = Object.freeze(Object.keys(CANDIDATE_TRACK_FAMILIES).sort());
export const CANDIDATE_ARTIFACT_RELEASES = Object.freeze({
  "aws-certified-solutions-architect-associate": "patternly-launch-2026-08-25-01",
  "backend-system-design-interview": "patternly-launch-2026-08-25-01",
  "claude-certified-architect-professional-certification": "patternly-claude-ccarp-2026-09-03-01",
  "coding-interview-dsa-problem-solving": "patternly-launch-2026-08-25-01",
  "frontend-system-design-interview": "patternly-launch-2026-08-25-01",
  "google-cloud-associate-cloud-engineer": "patternly-launch-2026-08-25-01",
  "microsoft-azure-administrator-associate-az-104": "patternly-launch-2026-08-25-01",
  "microsoft-azure-ai-fundamentals-ai-901": "patternly-launch-2026-08-25-01",
  "object-oriented-design-interview": "patternly-launch-2026-08-25-01",
});

const SHA256_PATTERN = /^[a-f0-9]{64}$/u;
const COMMIT_PATTERN = /^[a-f0-9]{40}$/u;
const RELEASE_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u;
const ROOT = resolve(fileURLToPath(new URL("../../", import.meta.url)));
const exec = promisify(execFile);

function compare(left, right) { return left === right ? 0 : left < right ? -1 : 1; }

/** Stable JSON serialization used for candidate identity and its golden fixture. */
export function canonicalJson(value) {
  if (value === null) return "null";
  if (["boolean", "string"].includes(typeof value)) return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("Canonical JSON does not accept non-finite numbers.");
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (!value || typeof value !== "object") throw new TypeError("Canonical JSON accepts JSON values only.");
  return `{${Object.keys(value).sort(compare).map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}

export function canonicalJsonBytes(value) { return `${canonicalJson(value)}\n`; }
export function sha256(value) { return createHash("sha256").update(value).digest("hex"); }
export function candidateIdentityPayload(manifest) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) throw new Error("Candidate manifest must be an object.");
  const { candidateId: _candidateId, ...identity } = manifest;
  return identity;
}
export function candidateIdFor(manifest) { return sha256(canonicalJson(candidateIdentityPayload(manifest))); }

export function validateRuntimeEvidence(evidence, candidate, frontendCommit) {
  exactKeys(evidence, ["schemaVersion", "candidateId", "trackIds", "frontendCommit", "command", "outputSha256", "status", "verifiedAt"], "Runtime evidence");
  if (evidence.schemaVersion !== "patternly-runtime-admission-evidence-v2") throw new Error("Runtime evidence schema version is invalid.");
  if (evidence.candidateId !== candidate.candidateId) throw new Error("Runtime evidence is stale for the current candidate.");
  if (canonicalJson(evidence.trackIds) !== canonicalJson(CANDIDATE_TRACK_IDS)) throw new Error("Runtime evidence track set differs from the candidate.");
  if (evidence.frontendCommit !== frontendCommit) throw new Error("Runtime evidence frontend commit is stale.");
  nonEmpty(evidence.command, "Runtime evidence command"); sha(evidence.outputSha256, "Runtime evidence output");
  if (evidence.status !== "passed") throw new Error("Runtime evidence did not pass.");
  nonEmpty(evidence.verifiedAt, "Runtime evidence verifiedAt"); return evidence;
}

export async function validateCandidateAdmission(admission, { root = ROOT, candidate, runtimeEvidence } = {}) {
  if (Object.hasOwn(admission ?? {}, "sourceCommit") || Object.hasOwn(admission ?? {}, "releaseId")) throw new Error("Candidate admission rejects legacy global sourceCommit/releaseId fields.");
  exactKeys(admission, ["schemaVersion","candidateManifestPath","candidateId","frontendCommit","verifiedAt","runtimeEvidence","tracks"], "Candidate admission");
  if (admission.schemaVersion !== "patternly-candidate-admission-v2" || admission.candidateManifestPath !== CANDIDATE_MANIFEST_PATH || admission.candidateId !== candidate.candidateId) throw new Error("Candidate admission identity is invalid.");
  commit(admission.frontendCommit,"Candidate admission frontend commit"); nonEmpty(admission.verifiedAt,"Candidate admission verifiedAt");
  exactKeys(admission.runtimeEvidence,["path","sha256","command","outputSha256"],"Candidate admission runtime reference"); sha(admission.runtimeEvidence.sha256,"Candidate admission runtime evidence"); sha(admission.runtimeEvidence.outputSha256,"Candidate admission runtime output"); nonEmpty(admission.runtimeEvidence.path,"Candidate admission runtime path"); nonEmpty(admission.runtimeEvidence.command,"Candidate admission runtime command");
  const bytes = runtimeEvidence === undefined ? await readFile(join(root, admission.runtimeEvidence.path)) : Buffer.from(canonicalJsonBytes(runtimeEvidence));
  if (sha256(bytes) !== admission.runtimeEvidence.sha256) throw new Error("Candidate admission runtime evidence hash mismatch.");
  const evidence = runtimeEvidence ?? JSON.parse(bytes); validateRuntimeEvidence(evidence,candidate,admission.frontendCommit);
  if (evidence.command !== admission.runtimeEvidence.command || evidence.outputSha256 !== admission.runtimeEvidence.outputSha256) throw new Error("Candidate admission runtime evidence reference mismatch.");
  if (!Array.isArray(admission.tracks) || admission.tracks.length !== CANDIDATE_TRACK_IDS.length || canonicalJson(admission.tracks.map(x=>x?.trackId)) !== canonicalJson(CANDIDATE_TRACK_IDS)) throw new Error("Candidate admission must cover exactly nine sorted tracks.");
  for (const item of admission.tracks) { const expected=candidate.tracks.find(x=>x.trackId===item.trackId); exactKeys(item,["trackId","publishing","runtime"],`Candidate admission track ${item.trackId}`); exactKeys(item.publishing,["status","releaseId","checksumSha256"],`Publishing admission ${item.trackId}`); exactKeys(item.runtime,["status","candidateId","frontendCommit","evidencePath","evidenceSha256"],`Runtime admission ${item.trackId}`); if(item.publishing.status!=="admitted"||item.publishing.releaseId!==expected.artifact.releaseId||item.publishing.checksumSha256!==expected.artifact.checksumSha256)throw new Error(`Candidate admission artifact mismatch for ${item.trackId}.`); if(item.runtime.status!=="admitted"||item.runtime.candidateId!==candidate.candidateId||item.runtime.frontendCommit!==admission.frontendCommit||item.runtime.evidencePath!==admission.runtimeEvidence.path||item.runtime.evidenceSha256!==admission.runtimeEvidence.sha256)throw new Error(`Candidate admission runtime mismatch for ${item.trackId}.`); }
  return admission;
}

export function validateCandidateReadiness(readiness, { candidate, approval }) {
  if (Object.hasOwn(readiness ?? {},"sourceCommit")||Object.hasOwn(readiness ?? {},"releaseId"))throw new Error("Candidate readiness rejects legacy global sourceCommit/releaseId fields.");
  exactKeys(readiness,["schemaVersion","candidateManifestPath","candidateId","trackIds","tracks"],"Candidate readiness"); if(readiness.schemaVersion!=="patternly-candidate-readiness-v2"||readiness.candidateManifestPath!==CANDIDATE_MANIFEST_PATH||readiness.candidateId!==candidate.candidateId)throw new Error("Candidate readiness identity is invalid."); if(canonicalJson(readiness.trackIds)!==canonicalJson(CANDIDATE_TRACK_IDS)||!Array.isArray(readiness.tracks)||canonicalJson(readiness.tracks.map(x=>x?.trackId))!==canonicalJson(CANDIDATE_TRACK_IDS))throw new Error("Candidate readiness must cover exactly nine sorted tracks.");
  for(const item of readiness.tracks){
    const expected=candidate.tracks.find(x=>x.trackId===item.trackId), approved=approval.tracks.find(x=>x.trackId===item.trackId);
    exactKeys(item,["trackId","familyId","candidateId","source","artifact","currentSource","structuralValidation","humanApproval","publishingAdmission","runtimeAdmission","blockers"],`Candidate readiness track ${item.trackId}`);
    if(item.familyId!==expected.familyId||item.candidateId!==candidate.candidateId||canonicalJson(item.source)!==canonicalJson(expected.source)||canonicalJson(item.artifact)!==canonicalJson(expected.artifact))throw new Error(`Candidate readiness track mismatch for ${item.trackId}.`);
    exactKeys(item.currentSource,["trackId","sourceRoot","sourceFileCount","canonicalItemCount","sourceManifestSha256","itemManifestSha256"],`Candidate readiness current source ${item.trackId}`);
    const expectedCurrent={trackId:item.trackId,sourceRoot:expected.source.sourceRoot,sourceFileCount:expected.source.sourceFileCount,canonicalItemCount:expected.source.canonicalItemCount,sourceManifestSha256:expected.source.sourceManifestSha256,itemManifestSha256:expected.source.itemManifestSha256}; if(canonicalJson(item.currentSource)!==canonicalJson(expectedCurrent))throw new Error(`Candidate readiness current source mismatch for ${item.trackId}.`);
    exactKeys(item.structuralValidation,["command","result"],`Candidate readiness structural validation ${item.trackId}`); nonEmpty(item.structuralValidation.command,`Candidate readiness structural command ${item.trackId}`); if(!["passed","failed"].includes(item.structuralValidation.result))throw new Error(`Candidate readiness structural result is invalid for ${item.trackId}.`);
    if(!["admitted","not_admitted"].includes(item.runtimeAdmission)||!["admitted","not_admitted"].includes(item.publishingAdmission))throw new Error(`Candidate readiness admission status is invalid for ${item.trackId}.`);
    const expectedApproval=approved?{approvalId:approved.approvalId,manifestPath:"evidence/human-content-approvals/manifest.json"}:null; if(canonicalJson(item.humanApproval)!==canonicalJson(expectedApproval))throw new Error(`Candidate readiness human approval mismatch for ${item.trackId}.`);
    if(!Array.isArray(item.blockers)||item.blockers.some(x=>typeof x!=="string"))throw new Error(`Candidate readiness blockers are invalid for ${item.trackId}.`); const blockers=[...(approved?[]:["human_review_required"]),...(item.structuralValidation.result==="passed"?[]:["structural_validation_failed"]),...(item.publishingAdmission==="admitted"?[]:["publishing_admission_not_granted"]),...(item.runtimeAdmission==="admitted"?[]:["runtime_admission_not_granted"])]; if(canonicalJson(item.blockers)!==canonicalJson(blockers))throw new Error(`Candidate readiness blockers mismatch for ${item.trackId}.`);
  }
  return readiness;
}

export async function verifySourceArtifactBinding(root, entry) {
  try { await exec("git",["diff","--quiet",entry.source.sourceCommit,entry.artifact.sourceRepositoryCommit,"--",entry.source.sourceRoot],{cwd:root}); }
  catch { throw new Error(`Candidate artifact source commit changes accepted source for ${entry.trackId}.`); }
}

function exactKeys(value, expected, label) {
  const actual = Object.keys(value ?? {}).sort(compare);
  const wanted = [...expected].sort(compare);
  if (canonicalJson(actual) !== canonicalJson(wanted)) throw new Error(`${label} has unsupported fields.`);
}
function nonEmpty(value, label) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label} must be a non-empty string.`);
}
function sha(value, label) {
  if (!SHA256_PATTERN.test(value ?? "")) throw new Error(`${label} must be a SHA-256 hash.`);
}
function commit(value, label) {
  if (!COMMIT_PATTERN.test(value ?? "")) throw new Error(`${label} must be a full commit SHA.`);
}
function integer(value, label) {
  if (!Number.isInteger(value) || value < 1) throw new Error(`${label} must be a positive integer.`);
}

export function validateCandidateManifest(manifest) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) throw new Error("Candidate manifest must be an object.");
  if (Object.hasOwn(manifest, "sourceCommit") || Object.hasOwn(manifest, "releaseId")) throw new Error("Candidate manifest rejects legacy global sourceCommit/releaseId fields.");
  exactKeys(manifest, ["schemaVersion", "candidateId", "baseline", "canonicalRepresentation", "tracks"], "Candidate manifest");
  if (manifest.schemaVersion !== CANDIDATE_MANIFEST_SCHEMA_VERSION) throw new Error(`Candidate manifest schema version is ${manifest.schemaVersion ?? "missing"}.`);
  if (!SHA256_PATTERN.test(manifest.candidateId ?? "")) throw new Error("Candidate manifest candidateId must be a SHA-256 hash.");
  exactKeys(manifest.baseline, ["path", "sha256"], "Candidate baseline");
  if (manifest.baseline.path !== ACC01_BASELINE_PATH) throw new Error("Candidate baseline path is not the ACC-01 baseline.");
  sha(manifest.baseline.sha256, "Candidate baseline sha256");
  exactKeys(manifest.canonicalRepresentation, Object.keys(CANDIDATE_CANONICAL_REPRESENTATION), "Candidate canonical representation");
  if (canonicalJson(manifest.canonicalRepresentation) !== canonicalJson(CANDIDATE_CANONICAL_REPRESENTATION)) throw new Error("Candidate canonical representation is not the pinned contract.");
  if (!Array.isArray(manifest.tracks) || manifest.tracks.length !== CANDIDATE_TRACK_IDS.length) throw new Error(`Candidate manifest must contain exactly ${CANDIDATE_TRACK_IDS.length} tracks.`);
  const ids = manifest.tracks.map((entry) => entry?.trackId);
  if (canonicalJson(ids) !== canonicalJson(CANDIDATE_TRACK_IDS)) throw new Error("Candidate manifest tracks must be exactly sorted canonical track IDs.");
  for (const entry of manifest.tracks) {
    const expectedFamily = CANDIDATE_TRACK_FAMILIES[entry?.trackId];
    exactKeys(entry, ["trackId", "familyId", "source", "artifact"], `Candidate track ${entry?.trackId ?? "missing"}`);
    if (!expectedFamily) throw new Error(`Candidate track is outside canonical scope: ${entry.trackId}.`);
    if (entry.familyId !== expectedFamily) throw new Error(`Candidate family mismatch for ${entry.trackId}.`);
    exactKeys(entry.source, ["sourceCommit", "sourceRoot", "contentVersion", "sourceFileCount", "canonicalItemCount", "sourceManifestSha256", "itemManifestSha256"].filter((key) => entry.source?.[key] !== undefined), `Candidate source ${entry.trackId}`);
    commit(entry.source?.sourceCommit, `Candidate source commit for ${entry.trackId}`);
    if (entry.source.sourceRoot !== `manual/source/${entry.trackId}`) throw new Error(`Candidate source root mismatch for ${entry.trackId}.`);
    if (entry.source.contentVersion !== undefined) nonEmpty(entry.source.contentVersion, `Candidate source contentVersion for ${entry.trackId}`);
    integer(entry.source.sourceFileCount, `Candidate source file count for ${entry.trackId}`);
    integer(entry.source.canonicalItemCount, `Candidate source item count for ${entry.trackId}`);
    sha(entry.source.sourceManifestSha256, `Candidate source manifest for ${entry.trackId}`);
    sha(entry.source.itemManifestSha256, `Candidate item manifest for ${entry.trackId}`);
    exactKeys(entry.artifact, ["trackId", "releaseId", "releasePath", "contentVersion", "taxonomyVersion", "sourceRepositoryCommit", "checksumSha256"], `Candidate artifact ${entry.trackId}`);
    if (entry.artifact.trackId !== entry.trackId) throw new Error(`Candidate source/artifact track mismatch for ${entry.trackId}.`);
    if (!RELEASE_PATTERN.test(entry.artifact.releaseId ?? "")) throw new Error(`Candidate artifact release is invalid for ${entry.trackId}.`);
    if (entry.artifact.releasePath !== `artifacts/releases/${entry.artifact.releaseId}/release.json`) throw new Error(`Candidate artifact release path mismatch for ${entry.trackId}.`);
    nonEmpty(entry.artifact.contentVersion, `Candidate artifact contentVersion for ${entry.trackId}`);
    nonEmpty(entry.artifact.taxonomyVersion, `Candidate artifact taxonomyVersion for ${entry.trackId}`);
    commit(entry.artifact.sourceRepositoryCommit, `Candidate artifact source commit for ${entry.trackId}`);
    sha(entry.artifact.checksumSha256, `Candidate artifact checksum for ${entry.trackId}`);
  }
  if (candidateIdFor(manifest) !== manifest.candidateId) throw new Error("Candidate manifest candidateId does not match its canonical identity payload.");
  return manifest;
}

export async function validateCandidateManifestSchema(manifest, root = ROOT) {
  const schema = JSON.parse(await readFile(join(root, CANDIDATE_MANIFEST_SCHEMA_PATH), "utf8"));
  await validateSchema(manifest, schema, CANDIDATE_MANIFEST_PATH);
  return manifest;
}

export async function loadCandidateManifest(root = ROOT) {
  const manifest = JSON.parse(await readFile(join(root, CANDIDATE_MANIFEST_PATH), "utf8"));
  await validateCandidateManifestSchema(manifest, root);
  return validateCandidateManifest(manifest);
}

function sourceIdentityFromBaseline(track) {
  return {
    sourceCommit: track.sourceCommit,
    sourceRoot: track.sourceRoot,
    ...(track.contentVersion ? { contentVersion: track.contentVersion } : {}),
    sourceFileCount: track.sourceFileCount,
    canonicalItemCount: track.canonicalItemCount,
    sourceManifestSha256: track.sourceManifestSha256,
    itemManifestSha256: track.itemManifestSha256,
  };
}

function trackFromRelease(release, trackId) {
  const artifact = (release.artifacts ?? []).find((entry) => entry?.trackId === trackId);
  if (!artifact) throw new Error(`Release ${release?.manifest?.releaseId ?? "unknown"} is missing ${trackId}.`);
  verifyArtifactRecord(artifact);
  return artifact;
}

export async function buildCandidateManifest({ root = ROOT, baseline = undefined } = {}) {
  const selectedBaseline = baseline ?? await loadAcc01Baseline(root);
  validateBaselineMetadata(selectedBaseline);
  const releases = new Map();
  for (const trackId of CANDIDATE_TRACK_IDS) {
    const releaseId = CANDIDATE_ARTIFACT_RELEASES[trackId];
    if (!releases.has(releaseId)) releases.set(releaseId, JSON.parse(await readFile(join(root, "artifacts/releases", releaseId, "release.json"), "utf8")));
  }
  const baselineByTrack = new Map(selectedBaseline.tracks.map((track) => [track.trackId, track]));
  const tracks = CANDIDATE_TRACK_IDS.map((trackId) => {
    const baselineTrack = baselineByTrack.get(trackId);
    if (!baselineTrack) throw new Error(`ACC-01 baseline is missing ${trackId}.`);
    const releaseId = CANDIDATE_ARTIFACT_RELEASES[trackId];
    const artifact = trackFromRelease(releases.get(releaseId), trackId);
    return {
      trackId,
      familyId: CANDIDATE_TRACK_FAMILIES[trackId],
      source: sourceIdentityFromBaseline(baselineTrack),
      artifact: {
        trackId,
        releaseId,
        releasePath: `artifacts/releases/${releaseId}/release.json`,
        contentVersion: artifact.contentVersion,
        taxonomyVersion: artifact.taxonomyVersion,
        sourceRepositoryCommit: artifact.sourceRepositoryCommit,
        checksumSha256: artifact.checksumSha256,
      },
    };
  });
  const candidate = {
    schemaVersion: CANDIDATE_MANIFEST_SCHEMA_VERSION,
    baseline: { path: ACC01_BASELINE_PATH, sha256: sha256(await readFile(join(root, ACC01_BASELINE_PATH))) },
    canonicalRepresentation: CANDIDATE_CANONICAL_REPRESENTATION,
    tracks,
  };
  return { ...candidate, candidateId: candidateIdFor(candidate) };
}

export async function writeCandidateManifest({ root = ROOT, candidate = undefined } = {}) {
  const value = candidate ?? await buildCandidateManifest({ root });
  await validateCandidateManifestSchema(value, root);
  validateCandidateManifest(value);
  const path = join(root, CANDIDATE_MANIFEST_PATH);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, canonicalJsonBytes(value));
  return { candidate: value, path };
}

function compareSourceIdentity(candidateSource, baselineTrack) {
  const expected = sourceIdentityFromBaseline(baselineTrack);
  if (canonicalJson(candidateSource) !== canonicalJson(expected)) throw new Error(`Candidate source identity differs from ACC-01 for ${baselineTrack.trackId}.`);
}

async function verifyCandidateBaseline(root, candidate) {
  const baselineBytes = await readFile(join(root, candidate.baseline.path));
  if (sha256(baselineBytes) !== candidate.baseline.sha256) throw new Error("Candidate baseline checksum does not match its committed bytes.");
  const baseline = JSON.parse(baselineBytes);
  validateBaselineMetadata(baseline);
  const baselineByTrack = new Map(baseline.tracks.map((track) => [track.trackId, track]));
  for (const entry of candidate.tracks) compareSourceIdentity(entry.source, baselineByTrack.get(entry.trackId));
  await verifyAcc01Baseline({ root, baseline });
  return baseline;
}

export async function verifyCandidateManifest({ root = ROOT, candidate = undefined, verifyArtifacts = true } = {}) {
  const selectedCandidate = candidate ?? await loadCandidateManifest(root);
  await validateCandidateManifestSchema(selectedCandidate, root);
  validateCandidateManifest(selectedCandidate);
  const baseline = await verifyCandidateBaseline(root, selectedCandidate);
  const verifiedArtifacts = [];
  if (verifyArtifacts) {
    for (const entry of selectedCandidate.tracks) {
      const release = JSON.parse(await readFile(join(root, entry.artifact.releasePath), "utf8"));
      if (release?.manifest?.releaseId !== entry.artifact.releaseId) throw new Error(`Candidate artifact release mismatch for ${entry.trackId}.`);
      if (release?.manifest?.sourceRepositoryCommit !== entry.artifact.sourceRepositoryCommit) throw new Error(`Candidate artifact source mismatch for ${entry.trackId}.`);
      await verifySourceArtifactBinding(root, entry);
      const artifact = trackFromRelease(release, entry.trackId);
      for (const key of ["trackId", "contentVersion", "taxonomyVersion", "sourceRepositoryCommit", "checksumSha256"]) if (artifact[key] !== entry.artifact[key]) throw new Error(`Candidate artifact ${key} differs for ${entry.trackId}.`);
      verifiedArtifacts.push({ trackId: entry.trackId, releaseId: entry.artifact.releaseId, checksumSha256: entry.artifact.checksumSha256 });
    }
  }
  return { candidate: selectedCandidate, baseline, trackIds: CANDIDATE_TRACK_IDS, artifacts: verifiedArtifacts };
}

export async function verifyCandidateCurrentSource({ root = ROOT, candidate = undefined } = {}) {
  const selectedCandidate = candidate ?? await loadCandidateManifest(root);
  validateCandidateManifest(selectedCandidate);
  const summaries = [];
  for (const entry of selectedCandidate.tracks) {
    const actual = await summarizeSource({ root, trackId: entry.trackId });
    const expected = entry.source;
    const comparable = {
      sourceRoot: actual.sourceRoot,
      sourceFileCount: actual.sourceFileCount,
      canonicalItemCount: actual.canonicalItemCount,
      sourceManifestSha256: actual.sourceManifestSha256,
      itemManifestSha256: actual.itemManifestSha256,
    };
    if (canonicalJson(comparable) !== canonicalJson({ sourceRoot: expected.sourceRoot, sourceFileCount: expected.sourceFileCount, canonicalItemCount: expected.canonicalItemCount, sourceManifestSha256: expected.sourceManifestSha256, itemManifestSha256: expected.itemManifestSha256 })) throw new Error(`Candidate current source differs for ${entry.trackId}.`);
    summaries.push({ trackId: entry.trackId, ...actual });
  }
  return summaries;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { candidate } = await writeCandidateManifest();
    console.log(JSON.stringify({ result: "passed", candidateId: candidate.candidateId, path: CANDIDATE_MANIFEST_PATH, tracks: candidate.tracks.length }, null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
