import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

import { canonicalJson, PublishingFailure, validateCanonicalJsonSchema } from "../publishing/pipeline.mjs";
import { ROOT, loadCanonicalTrackBriefs } from "./track-briefs.mjs";

export const FREE_NODE_EXPERIENCE_PROFILE_SCHEMA_VERSION = "patternly-free-node-experience-profile-v1";
export const FREE_NODE_EXPERIENCE_PROFILE_DIRECTORY = "config/free-node-experience-profiles";

const fail = (code, message) => { throw new PublishingFailure(code, message); };
const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const sorted = (values) => [...values].sort();
const same = (left, right) => canonicalJson(left) === canonicalJson(right);
const exactModeContract = Object.freeze({
  "coding-interview-dsa-problem-solving": Object.freeze([
    Object.freeze({ modeId: "coding-interview-learn-approach", blueprintModeId: "coding-interview-learn-approach", availability: "immediate", requestedLengths: Object.freeze([10]), defaultRequestedLength: 10, selectionKind: "exact_free_node", reinsertPolicy: "disabled" }),
    Object.freeze({ modeId: "coding-interview-guided-practice", blueprintModeId: "coding-interview-guided-practice", availability: "immediate", requestedLengths: Object.freeze([10, 20, 40]), defaultRequestedLength: 10, selectionKind: "exact_free_node", reinsertPolicy: "canonical_family_package_local" }),
    Object.freeze({ modeId: "coding-interview-custom-practice", blueprintModeId: "coding-interview-guided-practice", availability: "immediate", requestedLengths: Object.freeze([10]), defaultRequestedLength: 10, selectionKind: "learner_selected_free_node_mental_unit", reinsertPolicy: "canonical_family_package_local" }),
    Object.freeze({ modeId: "coding-interview-weak-area-review", blueprintModeId: "coding-interview-weak-area-review", availability: "evidence_conditioned", requestedLengths: Object.freeze([10, 20]), defaultRequestedLength: 10, selectionKind: "free_node_review_evidence", reinsertPolicy: "canonical_family_package_local" })
  ])
});

function canonicalBlueprintModes(track) {
  if (track.familyId === "coding_interview") return new Map(track.modeConfiguration.practiceBlueprints.map((entry) => [entry.modeId, entry]));
  const configuration = track.modeConfiguration;
  return new Map([configuration.focusPractice, configuration.weakAreaReview, configuration.quickReview].map((entry) => [entry.modeId, entry]));
}

function canonicalUserMappings(track) {
  if (track.familyId === "coding_interview") return new Map(track.modeConfiguration.userModeMappings.map((entry) => [entry.userModeId, entry.blueprintModeId]));
  return new Map([...canonicalBlueprintModes(track).keys()].map((modeId) => [modeId, modeId]));
}

export function validateFreeNodeExperienceProfile({ profile, schema, brief, track, family }) {
  validateCanonicalJsonSchema(profile, schema, "Free-node experience profile");
  if (profile.schemaVersion !== FREE_NODE_EXPERIENCE_PROFILE_SCHEMA_VERSION) fail("INVALID_FREE_NODE_EXPERIENCE_PROFILE", "Free-node profile schema identity is invalid.");
  if (brief.freeNodeExperience?.implementationStatus !== "profile_implemented") fail("INVALID_FREE_NODE_EXPERIENCE_PROFILE", "A package profile requires a factual implemented-profile brief declaration.");
  if (profile.trackId !== brief.trackId || profile.familyId !== brief.internalFamily || profile.freeNodeId !== brief.freeNodeId) fail("INVALID_FREE_NODE_EXPERIENCE_PROFILE", "Free-node profile identity differs from its track brief.");
  if (brief.freeNodeExperience.profileId !== profile.profileId || brief.freeNodeExperience.profileVersion !== profile.profileVersion) fail("INVALID_FREE_NODE_EXPERIENCE_PROFILE", "Free-node profile version differs from its track brief.");
  if (track.trackId !== profile.trackId || track.familyId !== profile.familyId || track.freeNodeExperienceProfilePath !== brief.freeNodeExperience.profilePath) fail("INVALID_FREE_NODE_EXPERIENCE_PROFILE", "Track configuration does not own exactly the brief-declared Free-node profile path.");

  const modes = profile.modes;
  const modeIds = modes.map((entry) => entry.modeId);
  const configurationIds = modes.map((entry) => entry.configurationId);
  if (new Set(modeIds).size !== modeIds.length || new Set(configurationIds).size !== configurationIds.length) fail("DUPLICATE_FREE_NODE_MODE_OWNER", "Each Free mode and node-local configuration must have one owner.");
  if (modeIds.some((modeId) => /(?:^|-)free(?:-|$)/.test(modeId))) fail("FREE_ONLY_MODE_ID", "Free-node profiles must reuse canonical family mode IDs.");
  if (modeIds.some((modeId) => !brief.validModes.includes(modeId))) fail("FREE_NODE_MODE_OUTSIDE_TRACK", "Every Free profile mode must be present in complete-track validModes.");
  if (same(sorted(modeIds), sorted(brief.validModes))) fail("ALL_VALID_MODES_TREATED_AS_FREE", "Complete-track validModes must not become the Free package mode set.");
  const familyModeIds = new Set(family.modes ? family.modes.map((entry) => entry.id) : [...canonicalUserMappings(track).keys()]);
  if (modeIds.some((modeId) => !familyModeIds.has(modeId))) fail("UNSUPPORTED_FREE_NODE_MODE", "A Free profile mode is unsupported by its canonical family.");

  const expected = exactModeContract[profile.trackId];
  if (!expected || !same(modeIds, expected.map((entry) => entry.modeId))) fail("INVALID_FREE_NODE_MODE_SET", "The Free profile differs from the Product Owner-approved mode set.");
  const blueprints = canonicalBlueprintModes(track);
  const mappings = canonicalUserMappings(track);
  for (const [index, mode] of modes.entries()) {
    const contract = expected[index];
    if (mode.configurationVersion !== "1" || mode.blueprintModeId !== contract.blueprintModeId || mode.availability !== contract.availability || !same(mode.requestedLengths, contract.requestedLengths) || mode.defaultRequestedLength !== contract.defaultRequestedLength || mode.selection.kind !== contract.selectionKind || mode.reinsertPolicy !== contract.reinsertPolicy) fail("INVALID_FREE_NODE_MODE_CONFIGURATION", `${mode.modeId} differs from its approved node-local configuration.`);
    if (mode.selection.freeNodeId !== profile.freeNodeId || mode.selection.itemSource !== "package_items" || mode.selection.requireUniqueItemIds !== true) fail("FREE_NODE_POLICY_NOT_CLOSED", `${mode.modeId} lacks an exact package-local Free-node boundary.`);
    if (mappings.get(mode.modeId) !== mode.blueprintModeId || !blueprints.has(mode.blueprintModeId)) fail("INVALID_FREE_NODE_MODE_MAPPING", `${mode.modeId} does not map to one canonical existing blueprint.`);
    const blueprint = blueprints.get(mode.blueprintModeId);
    const supportedLengths = blueprint.requestedLengths ?? (blueprint.maximumLength ? [blueprint.maximumLength] : []);
    if (mode.requestedLengths.some((length) => !supportedLengths.includes(length))) fail("UNSUPPORTED_FREE_NODE_LENGTH", `${mode.modeId} requests a length unsupported by its canonical blueprint.`);
    if (mode.availability === "evidence_conditioned") {
      if (!mode.selection.reviewSources?.length || mode.selection.emptyEligibility !== "unavailable" || mode.selection.shortening !== "truthful_to_eligible_count") fail("FREE_NODE_POLICY_NOT_CLOSED", `${mode.modeId} must expose truthful package-bounded review eligibility.`);
    } else if (mode.selection.reviewSources !== undefined || mode.selection.emptyEligibility !== undefined || mode.selection.shortening !== undefined) fail("INVALID_FREE_NODE_MODE_CONFIGURATION", `${mode.modeId} must not carry review-only controls.`);
  }
  const primary = modes.find((entry) => entry.modeId === profile.primaryEntry.modeId);
  if (!primary || primary.availability !== "immediate" || !primary.requestedLengths.includes(profile.primaryEntry.requestedLength)) fail("MISSING_IMMEDIATE_FREE_NODE_PRIMARY", "The primary Free entry must be immediately executable at its declared length.");
  if (profile.trackId === "coding-interview-dsa-problem-solving") {
    const custom = modes.find((entry) => entry.modeId === "coding-interview-custom-practice");
    if (!same(custom.feedbackOptions, ["afterEachAnswer", "atSessionEnd"]) || custom.blueprintModeId !== "coding-interview-guided-practice") fail("INVALID_FREE_NODE_MODE_MAPPING", "Coding Custom Practice must map to Guided Practice with both canonical feedback options.");
    const weak = modes.find((entry) => entry.modeId === "coding-interview-weak-area-review");
    if (!same(weak.selection.reviewSources, ["due_queue", "session_misses"]) || weak.selection.sessionMissesMustBeCommitted !== true) fail("FREE_NODE_POLICY_NOT_CLOSED", "Coding Weak Area Review must use only due or committed node-local miss evidence.");
  } else {
    if (modes.some((entry) => entry.modeId.includes("custom") || entry.modeId.includes("learn"))) fail("UNSUPPORTED_FREE_NODE_MODE", "Certification does not gain Custom or Learn modes for symmetry.");
    for (const mode of modes.filter((entry) => entry.availability === "evidence_conditioned")) if (!same(mode.selection.reviewSources, ["due_queue"])) fail("FREE_NODE_POLICY_NOT_CLOSED", "Certification review modes must consume only due package-local evidence.");
  }
  return profile;
}

export async function loadCanonicalFreeNodeExperienceProfiles({ root = ROOT } = {}) {
  const [schema, briefs, filenames] = await Promise.all([
    readJson(join(root, "schemas/product/free-node-experience-profile.schema.json")),
    loadCanonicalTrackBriefs({ root }),
    readdir(join(root, FREE_NODE_EXPERIENCE_PROFILE_DIRECTORY))
  ]);
  const profileFiles = filenames.filter((name) => name.endsWith(".json")).sort();
  const profiles = [];
  for (const filename of profileFiles) {
    const profile = await readJson(join(root, FREE_NODE_EXPERIENCE_PROFILE_DIRECTORY, filename));
    const brief = briefs.find((entry) => entry.trackId === profile.trackId);
    if (!brief || filename !== `${profile.trackId}.json`) fail("INVALID_FREE_NODE_EXPERIENCE_PROFILE", "Profile filename and canonical track brief identity must agree.");
    const track = await readJson(join(root, `config/tracks/${profile.trackId}.json`));
    const family = await readJson(join(root, `config/families/${profile.familyId}.json`));
    validateFreeNodeExperienceProfile({ profile, schema, brief, track, family });
    profiles.push(profile);
  }
  const implemented = briefs.filter((brief) => brief.freeNodeExperience.implementationStatus === "profile_implemented");
  if (profiles.length !== implemented.length || implemented.some((brief) => profiles.filter((profile) => profile.trackId === brief.trackId).length !== 1)) fail("MISSING_FREE_NODE_EXPERIENCE_PROFILE", "Every implemented Free-node experience must have exactly one track-owned profile.");
  if (new Set(profiles.map((profile) => profile.profileId)).size !== profiles.length) fail("DUPLICATE_FREE_NODE_PROFILE", "Free-node profile IDs must be globally unique.");
  return Object.freeze(profiles.map((profile) => Object.freeze(profile)));
}
