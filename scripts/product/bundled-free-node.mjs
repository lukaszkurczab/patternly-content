import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { gunzipSync, gzipSync } from "node:zlib";
import { promisify } from "node:util";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { canonicalJson, PublishingFailure, validateCanonicalJsonSchema, verifyArtifactRecord } from "../publishing/pipeline.mjs";
import { FREE_NODE_EXPERIENCE_PROFILE_SCHEMA_VERSION, loadCanonicalFreeNodeExperienceProfiles, validateFreeNodeExperienceProfile } from "./free-node-experience-profile.mjs";
import { inventoryFromPinnedRelease, loadCanonicalFreeNodeInventoryPins, validateFreeNodeInventory, verifyPinnedTechnicalEvidence } from "./free-node-inventory.mjs";
import { ROOT, loadCanonicalTrackBriefs } from "./track-briefs.mjs";

export const BUNDLED_FREE_NODE_SCHEMA_VERSION = "bundled-free-node-v2";
export const BUNDLED_FREE_NODE_PAYLOAD_SCHEMA_VERSION = "bundled-free-node-payload-v2";
export const BUNDLED_FREE_NODE_BUILDER_VERSION = "bundled-free-node-builder-v2";
export const BUNDLED_FREE_NODE_COMPRESSION = "gzip-level-9-mtime-0-v1";

const exec = promisify(execFile);
const compare = (left, right) => left === right ? 0 : left < right ? -1 : 1;
const fail = (code, message) => { throw new PublishingFailure(code, message); };
const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const isObject = (value) => !!value && typeof value === "object" && !Array.isArray(value);

function exactKeys(value, keys, label, code = "INVALID_BUNDLED_FREE_NODE") {
  if (!isObject(value) || canonicalJson(Object.keys(value).sort(compare)) !== canonicalJson([...keys].sort(compare))) fail(code, `${label} has an unsupported shape.`);
}

function artifactFor(release, trackId) {
  const matches = Array.isArray(release?.artifacts) ? release.artifacts.filter((entry) => entry?.trackId === trackId) : [];
  if (matches.length !== 1) fail("RELEASE_TRACK_MISMATCH", `Release must contain exactly one artifact for ${trackId}.`);
  return verifyArtifactRecord(matches[0]);
}

function nodeValue(item, selector) {
  if (selector.field === "taxonomy.roadmapNodeId") return item?.taxonomy?.roadmapNodeId;
  if (selector.field === "domain") return item?.domain;
  fail("UNSUPPORTED_FREE_NODE_SELECTOR", `Unsupported free-node selector ${selector.field}.`);
}

function preflightInventory({ artifact, brief, inventory }) {
  if (!Array.isArray(inventory?.items) || inventory.items.length === 0 || inventory.itemCount === 0) fail("EMPTY_FREE_NODE", `Bundled free node ${brief.trackId}/${brief.freeNodeId} has no items.`);
  const bank = JSON.parse(artifact.artifactBytes).bank;
  const allItemsById = new Map(bank.items.map((item) => [item.id, item]));
  const selected = [];
  for (const entry of inventory.items) {
    const item = allItemsById.get(entry?.id);
    if (!item) fail("DANGLING_FREE_NODE_REFERENCE", `Inventory references an item absent from the pinned artifact: ${entry?.id}.`);
    if (item.itemFingerprint !== entry.itemFingerprint) fail("BUNDLED_FREE_NODE_PROVENANCE_MISMATCH", `Inventory fingerprint differs from the pinned item: ${entry.id}.`);
    if (nodeValue(item, inventory.selector) !== brief.freeNodeId) fail("MIXED_FREE_NODE", `Inventory item ${entry.id} belongs outside ${brief.freeNodeId}.`);
    selected.push(item);
  }
  if (selected.length !== inventory.itemCount || new Set(selected.map((item) => item.id)).size !== selected.length) fail("INVALID_FREE_NODE_INVENTORY", "Bundled Free-node inventory count or identity set is invalid.");
  return { bank, selected: selected.sort((left, right) => compare(left.id, right.id)) };
}

function assetReferences(value, references = []) {
  if (Array.isArray(value)) for (const entry of value) assetReferences(entry, references);
  else if (isObject(value)) for (const [key, child] of Object.entries(value)) {
    if (key === "assetId" && typeof child === "string") references.push(child);
    assetReferences(child, references);
  }
  return references;
}

function selectedAssets(bank, selectedItems, assetBytesById) {
  const references = [...new Set(selectedItems.flatMap((item) => assetReferences(item)))].sort(compare);
  const declared = new Map((bank.feedbackAssets ?? []).map((asset) => [asset.id, asset]));
  return Object.freeze(references.map((id) => {
    const asset = declared.get(id);
    if (!asset) fail("DANGLING_FREE_NODE_REFERENCE", `Free-node item references undeclared asset ${id}.`);
    const bytesBase64 = assetBytesById?.[id];
    if (typeof bytesBase64 !== "string" || !bytesBase64.length) fail("DANGLING_FREE_NODE_REFERENCE", `Free-node asset bytes are absent from the package input: ${id}.`);
    const bytes = Buffer.from(bytesBase64, "base64");
    if (bytes.toString("base64") !== bytesBase64 || sha256(bytes) !== asset.sha256) fail("BUNDLED_FREE_NODE_PROVENANCE_MISMATCH", `Free-node asset bytes differ from the immutable source artifact: ${id}.`);
    return Object.freeze({ id, mediaType: "image/svg+xml", sha256: asset.sha256, bytesBase64 });
  }));
}

function exactTaxonomySubset(taxonomy, selectedItems, familyId, freeNodeId) {
  if (familyId === "certification") {
    if (!taxonomy.cloudDomains?.includes(freeNodeId)) fail("DANGLING_FREE_NODE_REFERENCE", `Certification taxonomy does not own ${freeNodeId}.`);
    return Object.freeze({ ...taxonomy, cloudDomains: Object.freeze([freeNodeId]) });
  }
  const ids = {
    roadmapNodes: new Set([freeNodeId]), mentalUnits: new Set(), patternFamilies: new Set(), patternVariants: new Set(), problemArchetypes: new Set(), skillAtoms: new Set(), learningStages: new Set(), falseHeuristics: new Set()
  };
  for (const item of selectedItems) {
    const value = item.taxonomy;
    ids.mentalUnits.add(value.primaryMentalUnitId); ids.patternFamilies.add(value.patternFamilyId); ids.problemArchetypes.add(value.problemArchetypeId); ids.skillAtoms.add(value.primarySkillAtomId); ids.learningStages.add(value.learningStage);
    for (const id of value.secondarySkillAtomIds ?? []) ids.skillAtoms.add(id);
    if (value.patternVariantId) ids.patternVariants.add(value.patternVariantId);
    if (value.falseHeuristicId) ids.falseHeuristics.add(value.falseHeuristicId);
  }
  const byId = (field) => new Map((taxonomy[field] ?? []).map((entry) => [entry.id, entry]));
  const mental = byId("mentalUnits");
  for (const id of ids.mentalUnits) {
    const entry = mental.get(id);
    if (!entry || entry.roadmapNodeId !== freeNodeId) fail("DANGLING_FREE_NODE_REFERENCE", `Free-node mental unit ${id} is absent or outside ${freeNodeId}.`);
    ids.patternFamilies.add(entry.primaryPatternFamilyId); for (const value of entry.legalPatternFamilyIds ?? []) ids.patternFamilies.add(value); for (const value of entry.patternVariantIds ?? []) ids.patternVariants.add(value); for (const value of entry.problemArchetypeIds ?? []) ids.problemArchetypes.add(value); ids.skillAtoms.add(entry.primarySkillAtomId); for (const value of entry.secondarySkillAtomIds ?? []) ids.skillAtoms.add(value); ids.learningStages.add(entry.learningStage);
  }
  const select = (field) => {
    if (field === "learningStages") {
      const available = new Set(taxonomy.learningStages ?? []); const values = [...ids.learningStages].sort(compare);
      if (values.some((id) => !available.has(id))) fail("DANGLING_FREE_NODE_REFERENCE", "Free-node taxonomy has a missing learningStages reference.");
      return Object.freeze(values);
    }
    const entries = byId(field); const values = [...ids[field]].sort(compare).map((id) => entries.get(id));
    if (values.some((entry) => !entry)) fail("DANGLING_FREE_NODE_REFERENCE", `Free-node taxonomy has a missing ${field} reference.`);
    return Object.freeze(values);
  };
  const result = Object.freeze({
    schemaVersion: taxonomy.schemaVersion, trackId: taxonomy.trackId, taxonomyVersion: taxonomy.taxonomyVersion,
    roadmapNodes: select("roadmapNodes"), mentalUnits: select("mentalUnits"), patternFamilies: select("patternFamilies"), patternVariants: select("patternVariants"), problemArchetypes: select("problemArchetypes"), skillAtoms: select("skillAtoms"), learningStages: select("learningStages"), falseHeuristics: select("falseHeuristics")
  });
  if (result.roadmapNodes.length !== 1 || result.roadmapNodes[0].id !== freeNodeId || result.roadmapNodes[0].prerequisiteNodeIds?.length) fail("FREE_NODE_TAXONOMY_NOT_CLOSED", "Bundled Coding Interview taxonomy must contain one prerequisite-free Free node.");
  return result;
}

function nodeLocalModeStructures({ profile, bank, selectedItems }) {
  const structures = { configurations: profile.modes };
  if (profile.familyId === "coding_interview") {
    const selectedIds = new Set(selectedItems.map((item) => item.id));
    const compatibilityById = new Map(bank.compatibilitySets.map((entry) => [entry.id, entry]));
    const compatibilityIds = new Set();
    for (const item of selectedItems) for (const membershipId of item.compatibilityMemberships ?? []) {
      const entry = compatibilityById.get(membershipId);
      if (!entry) fail("DANGLING_FREE_NODE_REFERENCE", `${item.id} references unknown compatibility set ${membershipId}.`);
      const members = [...(entry.itemIds ?? []), ...(entry.sourceItemIds ?? []), ...(entry.targetItemIds ?? [])];
      if (!members.length || members.some((id) => !selectedIds.has(id))) fail("FREE_NODE_COMPATIBILITY_NOT_CLOSED", `Compatibility set ${membershipId} crosses into Premium content.`);
      compatibilityIds.add(membershipId);
    }
    structures.userModeMappings = profile.modes.map((entry) => Object.freeze({ userModeId: entry.modeId, blueprintModeId: entry.blueprintModeId }));
    structures.compatibilitySets = bank.compatibilitySets.filter((entry) => compatibilityIds.has(entry.id));
  }
  return Object.freeze(structures);
}

function authoredFeedback(item) {
  const feedback = item?.feedback;
  return typeof feedback?.reason === "string" && feedback.reason.length > 0 && isObject(feedback.details) && Array.isArray(feedback.details.blocks) && feedback.details.blocks.length > 0;
}

function proveImmediateCoverage(profile, selectedItems) {
  if (selectedItems.some((item) => !authoredFeedback(item))) fail("FREE_NODE_FEEDBACK_NOT_CLOSED", "Every bundled item must carry authored Reason and Details feedback.");
  const mentalCounts = new Map();
  for (const item of selectedItems) if (item.taxonomy?.primaryMentalUnitId) mentalCounts.set(item.taxonomy.primaryMentalUnitId, (mentalCounts.get(item.taxonomy.primaryMentalUnitId) ?? 0) + 1);
  for (const mode of profile.modes.filter((entry) => entry.availability === "immediate")) {
    const required = Math.max(...mode.requestedLengths);
    if (mode.selection.kind === "learner_selected_free_node_mental_unit") {
      if (!mentalCounts.size || [...mentalCounts.values()].some((count) => count < required)) fail("FREE_NODE_SESSION_NOT_PREPARABLE", `${mode.modeId} cannot prepare ${required} unique items for every Free-node mental unit.`);
    } else if (selectedItems.length < required) fail("FREE_NODE_SESSION_NOT_PREPARABLE", `${mode.modeId} cannot prepare ${required} unique package-local items.`);
  }
}

function validateCompleteTrackContract({ brief, artifact, profile }) {
  const artifactModes = [...new Set(artifact.declaredModes ?? [])];
  if (artifactModes.length !== artifact.declaredModes.length || artifactModes.some((modeId) => !brief.validModes.includes(modeId))) fail("BUNDLED_FREE_NODE_PROVENANCE_MISMATCH", "Track brief does not contain every exact full-track artifact mode.");
  if (profile.modes.some((entry) => !artifactModes.includes(entry.blueprintModeId))) fail("UNSUPPORTED_FREE_NODE_MODE", "A Free profile blueprint mode is absent from the immutable full-track artifact.");
  const profileModes = profile.modes.map((entry) => entry.modeId);
  if (canonicalJson([...profileModes].sort(compare)) === canonicalJson([...brief.validModes].sort(compare))) fail("ALL_VALID_MODES_TREATED_AS_FREE", "Complete-track validModes must remain distinct from the Free profile.");
}

function validatedTechnicalEvidence({ pin, technicalEvidenceBytes, buildReport, artifact }) {
  const verified = verifyPinnedTechnicalEvidence({ pin, bytes: technicalEvidenceBytes });
  if (!isObject(buildReport) || buildReport.phase !== "build" || buildReport.trackId !== artifact.trackId || buildReport.familyId !== artifact.familyId || buildReport.contentVersion !== artifact.contentVersion || buildReport.taxonomyVersion !== artifact.taxonomyVersion || buildReport.sourceRepositoryCommit !== artifact.sourceRepositoryCommit || buildReport.checksumSha256 !== artifact.checksumSha256 || buildReport.technicalInputFingerprint !== pin.technicalInputFingerprint) fail("TECHNICAL_EVIDENCE_PROVENANCE_MISMATCH", `Immutable build report and pinned technical evidence differ for ${artifact.trackId}.`);
  return verified;
}

function validatePackageConfiguration(packageConfiguration, schema, trackId) {
  validateCanonicalJsonSchema(packageConfiguration, schema, "bundled Free-node package versions");
  const packages = packageConfiguration.packages;
  if (new Set(packages.map((entry) => entry.trackId)).size !== packages.length || new Set(packages.map((entry) => entry.packageVersion)).size !== packages.length) fail("DUPLICATE_BUNDLED_FREE_NODE_PACKAGE", "Package track IDs and versions must be unique.");
  const matches = packages.filter((entry) => entry.trackId === trackId);
  if (matches.length !== 1 || !/^\d+\.\d+\.\d+$/.test(matches[0].minimumAppVersion) || !new RegExp(`^${trackId}-free-node-[0-9]{4}$`).test(matches[0].packageVersion)) fail("INVALID_BUNDLED_FREE_NODE_PACKAGE_VERSION", `No canonical immutable package version exists for ${trackId}.`);
  return matches[0];
}

export function bundledFreeNodeFromInputs({ release, releaseId, brief, inventory, pin, profile, profileSchema, track, family, taxonomy, packageConfiguration, packageConfigurationSchema, profileSourceRepositoryCommit, assetBytesById = {}, technicalEvidenceBytes, buildReport }) {
  if (!isObject(brief) || brief.packageContentPlan?.bundledFreeNodeId !== brief.freeNodeId) fail("BUNDLED_FREE_NODE_PROVENANCE_MISMATCH", "Track brief does not own one exact bundled Free node.");
  if (!/^[a-f0-9]{40}$/.test(profileSourceRepositoryCommit ?? "")) fail("INVALID_BUNDLED_FREE_NODE_PROVENANCE", "Profile source commit must be an exact Git commit.");
  validateFreeNodeExperienceProfile({ profile, schema: profileSchema, brief, track, family });
  const packagePin = validatePackageConfiguration(packageConfiguration, packageConfigurationSchema, brief.trackId);
  const artifact = artifactFor(release, brief.trackId);
  const technicalEvidence = validatedTechnicalEvidence({ pin, technicalEvidenceBytes, buildReport, artifact });
  const { bank, selected } = preflightInventory({ artifact, brief, inventory });
  const expectedInventory = inventoryFromPinnedRelease({ release, releaseId, brief, trackId: brief.trackId, pin });
  if (canonicalJson(inventory) !== canonicalJson(expectedInventory)) fail("BUNDLED_FREE_NODE_PROVENANCE_MISMATCH", `Inventory does not exactly equal the canonical pinned selection for ${brief.trackId}.`);
  validateCompleteTrackContract({ brief, artifact, profile });
  proveImmediateCoverage(profile, selected);
  const assets = selectedAssets(bank, selected, assetBytesById);
  const payload = Object.freeze({
    schemaVersion: BUNDLED_FREE_NODE_PAYLOAD_SCHEMA_VERSION,
    trackId: brief.trackId,
    familyId: artifact.familyId,
    freeNodeId: brief.freeNodeId,
    contentVersion: artifact.contentVersion,
    taxonomyVersion: artifact.taxonomyVersion,
    freeNodeExperienceProfile: profile,
    modeStructures: nodeLocalModeStructures({ profile, bank, selectedItems: selected }),
    taxonomy: exactTaxonomySubset(taxonomy, selected, artifact.familyId, brief.freeNodeId),
    assets,
    items: selected
  });
  const payloadBytes = Buffer.from(canonicalJson(payload), "utf8");
  const compressed = gzipSync(payloadBytes, { level: 9, mtime: 0 });
  const modeIds = profile.modes.map((entry) => entry.modeId).sort(compare);
  const manifest = Object.freeze({
    bundleKind: "bundled_free_node",
    packageVersion: packagePin.packageVersion,
    trackId: brief.trackId,
    familyId: artifact.familyId,
    freeNodeId: brief.freeNodeId,
    contentVersion: artifact.contentVersion,
    taxonomyVersion: artifact.taxonomyVersion,
    itemCount: selected.length,
    modeIds,
    assetCount: assets.length,
    profileId: profile.profileId,
    profileVersion: profile.profileVersion,
    minimumAppVersion: packagePin.minimumAppVersion,
    payloadSchemaVersion: BUNDLED_FREE_NODE_PAYLOAD_SCHEMA_VERSION,
    payloadCompression: BUNDLED_FREE_NODE_COMPRESSION,
    payloadUncompressedSize: payloadBytes.byteLength,
    payloadCompressedSize: compressed.byteLength,
    payloadCanonicalSha256: sha256(payloadBytes),
    payloadCompressedSha256: sha256(compressed),
    provenance: Object.freeze({
      releaseId,
      sourceRepositoryCommit: artifact.sourceRepositoryCommit,
      sourceArtifactSchemaVersion: artifact.schemaVersion,
      sourceArtifactChecksumSha256: artifact.checksumSha256,
      technicalEvidencePath: pin.technicalEvidencePath,
      technicalEvidenceFileSha256: technicalEvidence.fileSha256,
      technicalEvidenceIdentitySha256: technicalEvidence.identitySha256,
      technicalEvidenceSourceCommit: technicalEvidence.sourceCommit,
      technicalEvidenceInputManifestSha256: technicalEvidence.inputManifestSha256,
      technicalInputFingerprint: pin.technicalInputFingerprint,
      inventorySchemaVersion: inventory.schemaVersion,
      inventoryCanonicalSha256: sha256(canonicalJson(inventory)),
      trackBriefSchemaVersion: brief.schemaVersion,
      trackBriefCanonicalSha256: sha256(canonicalJson(brief)),
      freeNodeExperienceProfileSchemaVersion: profile.schemaVersion,
      freeNodeExperienceProfileCanonicalSha256: sha256(canonicalJson(profile)),
      profileSourceRepositoryCommit,
      trackConfigCanonicalSha256: sha256(canonicalJson(track)),
      builderVersion: BUNDLED_FREE_NODE_BUILDER_VERSION
    })
  });
  return Object.freeze({ schemaVersion: BUNDLED_FREE_NODE_SCHEMA_VERSION, manifest, payloadGzipBase64: compressed.toString("base64") });
}

export function payloadFromBundledFreeNode(record) {
  const encoded = record?.payloadGzipBase64;
  if (typeof encoded !== "string" || !encoded.length) fail("INVALID_BUNDLED_FREE_NODE", "Bundled Free-node compressed payload is absent.");
  const compressed = Buffer.from(encoded, "base64");
  if (compressed.toString("base64") !== encoded) fail("INVALID_BUNDLED_FREE_NODE", "Bundled Free-node payload is not canonical base64.");
  let bytes;
  try { bytes = gunzipSync(compressed); } catch { fail("INVALID_BUNDLED_FREE_NODE", "Bundled Free-node payload is not valid deterministic gzip data."); }
  let payload;
  try { payload = JSON.parse(bytes.toString("utf8")); } catch { fail("INVALID_BUNDLED_FREE_NODE", "Bundled Free-node payload is not JSON."); }
  if (!bytes.equals(Buffer.from(canonicalJson(payload), "utf8"))) fail("INVALID_BUNDLED_FREE_NODE", "Bundled Free-node payload is not canonical JSON before compression.");
  return { payload, compressed, bytes };
}

function itemBelongsToPayloadNode(item, payload) {
  return payload.familyId === "coding_interview" ? item.taxonomy?.roadmapNodeId === payload.freeNodeId : item.domain === payload.freeNodeId;
}

export function verifyBundledFreeNodeRecord(record) {
  exactKeys(record, ["schemaVersion", "manifest", "payloadGzipBase64"], "bundled Free node");
  exactKeys(record.manifest, ["bundleKind", "packageVersion", "trackId", "familyId", "freeNodeId", "contentVersion", "taxonomyVersion", "itemCount", "modeIds", "assetCount", "profileId", "profileVersion", "minimumAppVersion", "payloadSchemaVersion", "payloadCompression", "payloadUncompressedSize", "payloadCompressedSize", "payloadCanonicalSha256", "payloadCompressedSha256", "provenance"], "bundled Free-node manifest");
  exactKeys(record.manifest.provenance, ["releaseId", "sourceRepositoryCommit", "sourceArtifactSchemaVersion", "sourceArtifactChecksumSha256", "technicalEvidencePath", "technicalEvidenceFileSha256", "technicalEvidenceIdentitySha256", "technicalEvidenceSourceCommit", "technicalEvidenceInputManifestSha256", "technicalInputFingerprint", "inventorySchemaVersion", "inventoryCanonicalSha256", "trackBriefSchemaVersion", "trackBriefCanonicalSha256", "freeNodeExperienceProfileSchemaVersion", "freeNodeExperienceProfileCanonicalSha256", "profileSourceRepositoryCommit", "trackConfigCanonicalSha256", "builderVersion"], "bundled Free-node provenance");
  if (record.schemaVersion !== BUNDLED_FREE_NODE_SCHEMA_VERSION || record.manifest.bundleKind !== "bundled_free_node" || record.manifest.payloadSchemaVersion !== BUNDLED_FREE_NODE_PAYLOAD_SCHEMA_VERSION || record.manifest.payloadCompression !== BUNDLED_FREE_NODE_COMPRESSION) fail("INVALID_BUNDLED_FREE_NODE", "Bundled Free-node schema or compression identity is invalid.");
  const { payload, compressed, bytes } = payloadFromBundledFreeNode(record);
  exactKeys(payload, ["schemaVersion", "trackId", "familyId", "freeNodeId", "contentVersion", "taxonomyVersion", "freeNodeExperienceProfile", "modeStructures", "taxonomy", "assets", "items"], "bundled Free-node payload");
  if (payload.schemaVersion !== BUNDLED_FREE_NODE_PAYLOAD_SCHEMA_VERSION || record.manifest.payloadUncompressedSize !== bytes.byteLength || record.manifest.payloadCompressedSize !== compressed.byteLength || record.manifest.payloadCanonicalSha256 !== sha256(bytes) || record.manifest.payloadCompressedSha256 !== sha256(compressed)) fail("BUNDLED_FREE_NODE_CHECKSUM_MISMATCH", "Bundled Free-node payload bytes, sizes, or SHA-256 differ from the manifest.");
  for (const field of ["trackId", "familyId", "freeNodeId", "contentVersion", "taxonomyVersion"]) if (record.manifest[field] !== payload[field]) fail("INVALID_BUNDLED_FREE_NODE", `Bundled Free-node manifest and payload ${field} differ.`);
  if (!Array.isArray(payload.items) || !payload.items.length || new Set(payload.items.map((item) => item.id)).size !== payload.items.length || payload.items.some((item) => !itemBelongsToPayloadNode(item, payload))) fail("MIXED_FREE_NODE", "Bundled payload items must be unique and belong to the exact Free node.");
  if (!Array.isArray(payload.assets) || record.manifest.itemCount !== payload.items.length || record.manifest.assetCount !== payload.assets.length) fail("INVALID_BUNDLED_FREE_NODE", "Bundled Free-node manifest counts differ from payload collections.");
  for (const asset of payload.assets) {
    exactKeys(asset, ["id", "mediaType", "sha256", "bytesBase64"], "bundled Free-node asset");
    const bytes = Buffer.from(asset.bytesBase64, "base64");
    if (bytes.toString("base64") !== asset.bytesBase64 || asset.mediaType !== "image/svg+xml" || sha256(bytes) !== asset.sha256) fail("BUNDLED_FREE_NODE_CHECKSUM_MISMATCH", `Bundled asset ${asset.id} bytes differ from its SHA-256.`);
  }
  const profile = payload.freeNodeExperienceProfile;
  const modeIds = profile.modes.map((entry) => entry.modeId).sort(compare);
  if (record.manifest.profileId !== profile.profileId || record.manifest.profileVersion !== profile.profileVersion || canonicalJson(record.manifest.modeIds) !== canonicalJson(modeIds)) fail("INVALID_BUNDLED_FREE_NODE", "Bundled Free-node manifest differs from its exact profile modes.");
  if (record.manifest.provenance.freeNodeExperienceProfileSchemaVersion !== FREE_NODE_EXPERIENCE_PROFILE_SCHEMA_VERSION || record.manifest.provenance.freeNodeExperienceProfileCanonicalSha256 !== sha256(canonicalJson(profile))) fail("BUNDLED_FREE_NODE_PROVENANCE_MISMATCH", "Bundled Free-node profile differs from its provenance.");
  for (const field of ["technicalEvidenceFileSha256", "technicalEvidenceIdentitySha256", "technicalEvidenceInputManifestSha256", "technicalInputFingerprint"]) if (!/^[a-f0-9]{64}$/.test(record.manifest.provenance[field])) fail("INVALID_BUNDLED_FREE_NODE", `Bundled Free-node ${field} is invalid.`);
  if (!/^[a-f0-9]{40}$/.test(record.manifest.provenance.technicalEvidenceSourceCommit) || !record.manifest.provenance.technicalEvidencePath.startsWith(`evidence/${record.manifest.trackId}/technical/`)) fail("INVALID_BUNDLED_FREE_NODE", "Bundled Free-node technical evidence provenance is invalid.");
  const configurationKeys = payload.familyId === "coding_interview" ? ["compatibilitySets", "configurations", "userModeMappings"] : ["configurations"];
  if (canonicalJson(Object.keys(payload.modeStructures).sort(compare)) !== canonicalJson(configurationKeys.sort(compare))) fail("INVALID_BUNDLED_FREE_NODE", "Bundled Free-node mode structures have an unsupported family shape.");
  if (canonicalJson(payload.modeStructures.configurations) !== canonicalJson(profile.modes)) fail("INVALID_BUNDLED_FREE_NODE", "Bundled Free-node configurations differ from its profile.");
  if (payload.familyId === "coding_interview") {
    const expectedMappings = profile.modes.map((entry) => ({ userModeId: entry.modeId, blueprintModeId: entry.blueprintModeId }));
    if (canonicalJson(payload.modeStructures.userModeMappings) !== canonicalJson(expectedMappings)) fail("INVALID_BUNDLED_FREE_NODE", "Coding Custom and canonical user-mode mappings differ from the profile.");
    const itemIds = new Set(payload.items.map((item) => item.id));
    if (payload.modeStructures.compatibilitySets.some((entry) => [...(entry.itemIds ?? []), ...(entry.sourceItemIds ?? []), ...(entry.targetItemIds ?? [])].some((id) => !itemIds.has(id)))) fail("FREE_NODE_COMPATIBILITY_NOT_CLOSED", "Bundled compatibility data crosses outside package items.");
  }
  return record;
}

function unavailable(modeId, requestedLength) {
  return Object.freeze({ status: "unavailable", modeId, requestedLength, actualLength: 0, itemIds: Object.freeze([]), shortened: true, disclosure: "No eligible Free-node review evidence is currently available." });
}

export function prepareBundledFreeNodeSession(record, { modeId, requestedLength, mentalUnitId, feedbackOption, evidence = [] }) {
  verifyBundledFreeNodeRecord(record);
  const { payload } = payloadFromBundledFreeNode(record);
  const configuration = payload.freeNodeExperienceProfile.modes.find((entry) => entry.modeId === modeId);
  if (!configuration || !configuration.requestedLengths.includes(requestedLength)) fail("UNSUPPORTED_FREE_NODE_SESSION", "Requested mode or length is outside the Free-node profile.");
  const byId = new Map(payload.items.map((item) => [item.id, item]));
  let candidates;
  if (configuration.availability === "evidence_conditioned") {
    const eligible = [];
    for (const entry of evidence) {
      if (!isObject(entry) || typeof entry.itemId !== "string") fail("INVALID_REVIEW_EVIDENCE", "Review evidence must name an exact item.");
      const item = byId.get(entry.itemId);
      if (!item) fail("REVIEW_ITEM_OUTSIDE_PACKAGE", `Review evidence resolves item ${entry.itemId} outside the package.`);
      const due = entry.source === "due_queue" && entry.due === true && configuration.selection.reviewSources.includes("due_queue");
      const miss = entry.source === "session_misses" && entry.committed === true && configuration.selection.reviewSources.includes("session_misses");
      if (due || miss) eligible.push(item);
    }
    candidates = [...new Map(eligible.map((item) => [item.id, item])).values()].sort((left, right) => compare(left.id, right.id));
    if (!candidates.length) return unavailable(modeId, requestedLength);
  } else if (configuration.selection.kind === "learner_selected_free_node_mental_unit") {
    if (typeof mentalUnitId !== "string" || !mentalUnitId) fail("INVALID_FREE_NODE_MENTAL_UNIT", "Custom Practice requires one Free-node mental unit.");
    if (!configuration.feedbackOptions.includes(feedbackOption)) fail("INVALID_FREE_NODE_FEEDBACK_OPTION", "Custom Practice feedback option is unsupported.");
    candidates = payload.items.filter((item) => item.taxonomy?.primaryMentalUnitId === mentalUnitId).sort((left, right) => compare(left.id, right.id));
    if (!candidates.length) fail("INVALID_FREE_NODE_MENTAL_UNIT", "Custom Practice mental unit is outside the package.");
  } else candidates = [...payload.items].sort((left, right) => compare(left.id, right.id));
  const selected = candidates.slice(0, requestedLength);
  if (configuration.availability === "immediate" && selected.length !== requestedLength) fail("FREE_NODE_SESSION_NOT_PREPARABLE", "An immediately available Free mode cannot prepare its declared unique length.");
  const shortened = selected.length < requestedLength;
  return Object.freeze({ status: "ready", modeId, requestedLength, actualLength: selected.length, itemIds: Object.freeze(selected.map((item) => item.id)), shortened, ...(shortened ? { disclosure: `Only ${selected.length} eligible Free-node review item(s) are currently available.` } : {}), ...(feedbackOption ? { feedbackOption } : {}) });
}

async function loadPackageConfiguration(root, trackId) {
  const [configuration, schema] = await Promise.all([readJson(join(root, "config/bundled-free-node-packages.json")), readJson(join(root, "schemas/product/bundled-free-node-packages.schema.json"))]);
  validatePackageConfiguration(configuration, schema, trackId);
  return { configuration, schema };
}

async function profileSourceCommit(root, paths) {
  let status;
  try { status = (await exec("git", ["status", "--porcelain", "--untracked-files=all", "--", ...paths], { cwd: root })).stdout.trim(); } catch { fail("SOURCE_COMMIT_UNAVAILABLE", "Bundled Free-node package requires a Git source repository."); }
  if (status) fail("DIRTY_BUNDLED_FREE_NODE_SOURCE", "Bundled Free-node profile, brief, schemas, builder, or package version has uncommitted changes.");
  const commit = (await exec("git", ["log", "-1", "--format=%H", "--", ...paths], { cwd: root })).stdout.trim();
  if (!/^[a-f0-9]{40}$/.test(commit)) fail("SOURCE_COMMIT_UNAVAILABLE", "Bundled Free-node profile source commit is unavailable.");
  return commit;
}

async function canonicalInputs({ root, trackId, injectedProfileSourceCommit }) {
  const [briefs, pins, profiles, packageOwner] = await Promise.all([loadCanonicalTrackBriefs({ root }), loadCanonicalFreeNodeInventoryPins({ root }), loadCanonicalFreeNodeExperienceProfiles({ root }), loadPackageConfiguration(root, trackId)]);
  const brief = briefs.find((entry) => entry.trackId === trackId); const pin = pins.find((entry) => entry.trackId === trackId); const profile = profiles.find((entry) => entry.trackId === trackId);
  if (!brief || !pin || !profile) fail("MISSING_BUNDLED_FREE_NODE_INPUT", `Canonical brief, profile, or inventory pin is absent for ${trackId}.`);
  const inventoryPath = join("artifacts", "free-node-inventories", pin.releaseId, `${trackId}.json`);
  const [release, inventory, profileSchema, track, family, taxonomy, technicalEvidenceBytes, buildReport] = await Promise.all([
    readJson(join(root, "artifacts", "releases", pin.releaseId, "release.json")), validateFreeNodeInventory({ root, inventoryPath }), readJson(join(root, "schemas/product/free-node-experience-profile.schema.json")), readJson(join(root, `config/tracks/${trackId}.json`)), readJson(join(root, `config/families/${profile.familyId}.json`)), readJson(join(root, `config/taxonomy/${trackId}.json`))
    , readFile(resolve(root, pin.technicalEvidencePath)), readJson(join(root, "artifacts", "tracks", trackId, pin.contentVersion, "build-report.json"))
  ]);
  const artifact = artifactFor(release, trackId); const bank = JSON.parse(artifact.artifactBytes).bank; const assetBytesById = {};
  for (const asset of bank.feedbackAssets ?? []) assetBytesById[asset.id] = (await readFile(join(root, asset.sourcePath))).toString("base64");
  const sourcePaths = [brief.freeNodeExperience.profilePath, `docs/track-briefs/${trackId}.json`, `config/tracks/${trackId}.json`, "config/bundled-free-node-packages.json", "schemas/product", "scripts/product", "package.json", "package-lock.json"];
  const sourceCommit = injectedProfileSourceCommit ?? await profileSourceCommit(root, sourcePaths);
  return { release, releaseId: pin.releaseId, brief, inventory, pin, profile, profileSchema, track, family, taxonomy, packageConfiguration: packageOwner.configuration, packageConfigurationSchema: packageOwner.schema, profileSourceRepositoryCommit: sourceCommit, assetBytesById, technicalEvidenceBytes, buildReport };
}

export async function generateBundledFreeNode({ root = ROOT, trackId, profileSourceRepositoryCommit }) {
  return bundledFreeNodeFromInputs(await canonicalInputs({ root, trackId, injectedProfileSourceCommit: profileSourceRepositoryCommit }));
}

export function canonicalBundledFreeNodePath(record) {
  return join("artifacts", "bundled-free-nodes", record.manifest.trackId, record.manifest.packageVersion, "package.json");
}

export async function validateBundledFreeNode({ root = ROOT, bundledFreeNodePath }) {
  const record = await readJson(resolve(root, bundledFreeNodePath));
  const schema = await readJson(join(root, "schemas/product/bundled-free-node.schema.json"));
  validateCanonicalJsonSchema(record, schema, "bundled Free node"); verifyBundledFreeNodeRecord(record);
  if (bundledFreeNodePath !== canonicalBundledFreeNodePath(record)) fail("INVALID_PATH", "Bundled Free-node package path must match its immutable package identity.");
  const expected = await generateBundledFreeNode({ root, trackId: record.manifest.trackId });
  if (canonicalJson(record) !== canonicalJson(expected)) fail("BUNDLED_FREE_NODE_MISMATCH", "Bundled Free node does not exactly equal its pinned release, profile, brief, inventory, and package version inputs.");
  return record;
}

function bundledOutput(root, outputPath) {
  const target = resolve(root, outputPath); const rel = relative(root, target); const prefix = `artifacts${process.platform === "win32" ? "\\" : "/"}bundled-free-nodes${process.platform === "win32" ? "\\" : "/"}`;
  if (!rel || rel === ".." || rel.startsWith("..") || !rel.startsWith(prefix)) fail("INVALID_PATH", `Bundled Free-node output must remain in artifacts/bundled-free-nodes: ${outputPath}.`);
  return target;
}

export async function writeBundledFreeNode({ root = ROOT, trackId, profileSourceRepositoryCommit }) {
  const record = await generateBundledFreeNode({ root, trackId, profileSourceRepositoryCommit });
  const outputPath = canonicalBundledFreeNodePath(record); const target = bundledOutput(root, outputPath); const versionDirectory = dirname(target);
  try { await stat(versionDirectory); fail("IMMUTABLE_BUNDLED_FREE_NODE", `Bundled Free-node package version already exists: ${outputPath}.`); } catch (error) { if (error?.code !== "ENOENT") throw error; }
  const pending = `${versionDirectory}.pending-${sha256(canonicalJson(record))}`;
  await mkdir(dirname(versionDirectory), { recursive: true }); await mkdir(pending, { recursive: false });
  try { await writeFile(join(pending, "package.json"), canonicalJson(record), { flag: "wx" }); await rename(pending, versionDirectory); } catch (error) {
    await rm(pending, { recursive: true, force: true });
    if (["EEXIST", "ENOTEMPTY"].includes(error?.code)) fail("IMMUTABLE_BUNDLED_FREE_NODE", `Bundled Free-node package version already exists: ${outputPath}.`);
    throw error;
  }
  return Object.freeze({ record, path: target, canonicalSha256: sha256(canonicalJson(record)), canonicalSize: Buffer.byteLength(canonicalJson(record)) });
}

const [command, ...args] = process.argv.slice(2);
function options(required) {
  const values = new Map(); if (args.includes("--help")) return undefined;
  for (let index = 0; index < args.length; index += 2) { const flag = args[index]; const value = args[index + 1]; if (!required.includes(flag) || !value || value.startsWith("--") || values.has(flag)) fail("USAGE", `Invalid argument: ${flag ?? ""}`); values.set(flag, value); }
  for (const flag of required) if (!values.has(flag)) fail("USAGE", `${flag} is required.`); return values;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const usage = "Use build-bundled-free-node --track <id>, or validate-bundled-free-node --input <canonical path>.";
  try {
    if (!command || command === "--help") process.stdout.write(`${usage}\n`);
    else if (command === "build-bundled-free-node") { const values = options(["--track"]); if (!values) process.stdout.write(`${usage}\n`); else process.stdout.write(`${JSON.stringify(await writeBundledFreeNode({ trackId: values.get("--track") }), null, 2)}\n`); }
    else if (command === "validate-bundled-free-node") { const values = options(["--input"]); if (!values) process.stdout.write(`${usage}\n`); else process.stdout.write(`${JSON.stringify(await validateBundledFreeNode({ bundledFreeNodePath: values.get("--input") }), null, 2)}\n`); }
    else fail("USAGE", usage);
  } catch (error) { process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`); process.exitCode = 1; }
}
