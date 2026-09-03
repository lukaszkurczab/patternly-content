import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  TARGET_TRACK_FAMILIES,
  TRACK_BRIEF_SCHEMA_PATH,
  loadCanonicalTrackBriefs,
  validateTrackBrief
} from "../scripts/product/track-briefs.mjs";

const requiredContractFields = [
  "jobToBeDone",
  "targetLearner",
  "internalFamily",
  "taxonomyOutline",
  "freeNodeId",
  "validModes",
  "goalTemplates",
  "progressDimensions",
  "freeNodeExperience",
  "packageContentPlan",
  "launchCommercialGate"
];

const schema = JSON.parse(await readFile(TRACK_BRIEF_SCHEMA_PATH, "utf8"));
const canonicalBriefs = await loadCanonicalTrackBriefs();

const copy = (value) => structuredClone(value);

test("canonical catalogue has one distinct LEARNING-PRODUCTS-001 brief per target track", () => {
  assert.equal(canonicalBriefs.length, Object.keys(TARGET_TRACK_FAMILIES).length);
  assert.deepEqual(new Set(canonicalBriefs.map((brief) => brief.trackId)), new Set(Object.keys(TARGET_TRACK_FAMILIES)));
  assert.deepEqual(new Set(canonicalBriefs.map((brief) => brief.internalFamily)), new Set(["certification", "coding_interview", "design_interview"]));
});

test("strict schema requires the product-contract brief fields", () => {
  for (const field of requiredContractFields) assert.ok(schema.required.includes(field), `${field} must be required`);
  assert.equal(schema.additionalProperties, false);
  for (const brief of canonicalBriefs) {
    for (const field of requiredContractFields) assert.ok(Object.hasOwn(brief, field), `${brief.trackId} must include ${field}`);
  }
});

test("canonical briefs contain concrete non-empty contracts and no unavailable-product wording", () => {
  const serialized = JSON.stringify(canonicalBriefs);
  assert.doesNotMatch(serialized, /coming[ -]soon|placeholder|\btbd\b|\btodo\b/i);
  for (const brief of canonicalBriefs) {
    assert.ok(brief.taxonomyOutline.length >= 3);
    assert.ok(brief.validModes.length > 0);
    assert.ok(brief.goalTemplates.length > 0);
    assert.ok(brief.progressDimensions.length > 0);
    assert.ok(brief.packageContentPlan.contentScopes.length > 0);
    assert.ok(brief.packageContentPlan.provenanceRules.length > 0);
  }
});

test("launch gate records only the factual admission requirement", () => {
  for (const brief of canonicalBriefs) {
    assert.deepEqual(brief.launchCommercialGate, {
      productionRegistryAdmission: "realFreeVerticalAndCompleteCoreLoop"
    });
  }

  const claimedAdmission = copy(canonicalBriefs[0]);
  claimedAdmission.launchCommercialGate.admitted = true;
  assert.throws(() => validateTrackBrief(claimedAdmission, schema), /launchCommercialGate\.admitted is not allowed/);

  const weakenedGate = copy(canonicalBriefs[0]);
  weakenedGate.launchCommercialGate.productionRegistryAdmission = "briefApproved";
  assert.throws(() => validateTrackBrief(weakenedGate, schema), /must equal "realFreeVerticalAndCompleteCoreLoop"/);
});

test("briefs keep complete-track validModes separate from intended or implemented Free experience", () => {
  for (const brief of canonicalBriefs) {
    assert.ok(brief.freeNodeExperience.modeIds.every((modeId) => brief.validModes.includes(modeId)));
    assert.ok(brief.freeNodeExperience.modeIds.length < brief.validModes.length);
    if (["coding-interview-dsa-problem-solving", "google-cloud-associate-cloud-engineer", "aws-certified-solutions-architect-associate", "microsoft-azure-administrator-associate-az-104", "microsoft-azure-ai-fundamentals-ai-901", "backend-system-design-interview", "frontend-system-design-interview", "object-oriented-design-interview"].includes(brief.trackId)) {
      assert.equal(brief.freeNodeExperience.implementationStatus, "profile_implemented");
      assert.ok(brief.freeNodeExperience.profilePath);
    } else {
      assert.deepEqual(Object.keys(brief.freeNodeExperience).sort(), ["implementationStatus", "modeIds"]);
      assert.equal(brief.freeNodeExperience.implementationStatus, "intended");
    }
  }
  const allModesFree = copy(canonicalBriefs[0]); allModesFree.freeNodeExperience.modeIds = [...allModesFree.validModes];
  assert.throws(() => validateTrackBrief(allModesFree, schema), /must not treat every complete-track validMode as a Free mode/);
  const fakeEvidence = copy(canonicalBriefs.find((brief) => brief.freeNodeExperience.implementationStatus === "intended")); fakeEvidence.freeNodeExperience.profileId = "fake-profile";
  assert.throws(() => validateTrackBrief(fakeEvidence, schema), /must not claim a profile/);
});

test("validator rejects empty, unavailable, duplicate, and family-invalid brief data", () => {
  const empty = copy(canonicalBriefs[0]);
  empty.jobToBeDone = "   ";
  assert.throws(() => validateTrackBrief(empty, schema), /jobToBeDone must not be empty/);

  const unavailable = copy(canonicalBriefs[0]);
  unavailable.targetLearner = "Coming soon";
  assert.throws(() => validateTrackBrief(unavailable, schema), /prohibited unavailable-product wording/);

  const duplicateMode = copy(canonicalBriefs[0]);
  duplicateMode.validModes.push(duplicateMode.validModes[0]);
  assert.throws(() => validateTrackBrief(duplicateMode, schema), /validModes must contain distinct entries/);

  const wrongFamily = copy(canonicalBriefs.find((brief) => brief.trackId === "coding-interview-dsa-problem-solving"));
  wrongFamily.internalFamily = "certification";
  assert.throws(() => validateTrackBrief(wrongFamily, schema), /must be coding_interview/);
});

test("source-backed briefs expose only the canonical implemented profile contracts", async () => {
  const codingBrief = canonicalBriefs.find((brief) => brief.trackId === "coding-interview-dsa-problem-solving");
  const codingTaxonomy = JSON.parse(await readFile("config/taxonomy/coding-interview-dsa-problem-solving.json", "utf8"));
  const codingTrack = JSON.parse(await readFile("config/tracks/coding-interview-dsa-problem-solving.json", "utf8"));
  assert.equal(codingBrief.internalFamily, codingTrack.familyId);
  assert.ok(codingTaxonomy.roadmapNodes.some((node) => node.id === codingBrief.freeNodeId));
  assert.deepEqual(new Set(codingBrief.validModes), new Set(codingTrack.modeConfiguration.userModeMappings.map((mapping) => mapping.userModeId)));

  const azBrief = canonicalBriefs.find((brief) => brief.trackId === "microsoft-azure-administrator-associate-az-104");
  const azTaxonomy = JSON.parse(await readFile("config/taxonomy/microsoft-azure-administrator-associate-az-104.json", "utf8"));
  const azTrack = JSON.parse(await readFile("config/tracks/microsoft-azure-administrator-associate-az-104.json", "utf8"));
  assert.equal(azBrief.internalFamily, azTrack.familyId);
  assert.ok(azTaxonomy.tags.includes(azBrief.freeNodeId));
  assert.deepEqual(new Set(azBrief.validModes), new Set([
    azTrack.modeConfiguration.diagnosticBaseline.modeId,
    azTrack.modeConfiguration.focusPractice.modeId,
    azTrack.modeConfiguration.scenarioPractice.modeId,
    azTrack.modeConfiguration.weakAreaReview.modeId,
    azTrack.modeConfiguration.mixedPractice.modeId,
    azTrack.modeConfiguration.quickReview.modeId,
    "certification-exam-simulation"
  ]));
});
