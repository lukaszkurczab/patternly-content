import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import { loadCurricula } from "../scripts/curriculum/curricula.mjs";
import { loadCanonicalTrackBriefs } from "../scripts/product/track-briefs.mjs";
import { validateDesignInterviewCurriculum } from "../scripts/curriculum/design-interview-curricula.mjs";

const curricula = (await loadCurricula()).filter((curriculum) => curriculum.familyId === "design_interview");
const briefs = await loadCanonicalTrackBriefs();
const expectedSlots = new Map([["backend-system-design-interview", 74], ["frontend-system-design-interview", 181], ["object-oriented-design-interview", 68]]);
const fingerprint = (slot) => createHash("sha256").update(JSON.stringify({ trackId: slot.trackId, nodeId: slot.nodeId, blockId: slot.blockId, coverageTargetId: slot.coverageTargetId, directSkillOrDecisionAtomId: slot.directSkillOrDecisionAtomId, expectedOutcome: slot.expectedOutcome, decisiveBoundary: slot.decisiveBoundary, transferBoundary: slot.transferBoundary, materialEvidenceOrConstraintChanged: slot.materialEvidenceOrConstraintChanged })).digest("hex");

test("Design curricula are direct-slot canonical and remain not admitted", () => {
  for (const curriculum of curricula) {
    assert.equal(curriculum.schemaVersion, "patternly-design-interview-curriculum-v1");
    assert.equal(curriculum.slots.length, expectedSlots.get(curriculum.trackId));
    assert.equal(curriculum.admission.questionsAuthored, 0);
    assert.equal(curriculum.admission.runtimeAdmission, "not_admitted");
    assert.equal(curriculum.authoring.firstSafeBatch, null);
    for (const slot of curriculum.slots) {
      assert.equal(slot.deliveryInteraction.interactionType, null);
      assert.match(slot.deliveryInteraction.status, /^blocked_/);
      assert.equal(slot.trackId, curriculum.trackId);
      assert.ok(!Object.hasOwn(slot, "candidatePedagogicalRoles"));
      assert.ok(!Object.hasOwn(slot.sourceRequirements, "candidateTechnicalSourceRefs"));
      assert.ok(!Object.hasOwn(slot.sourceRequirements, "directSourceAnchorRefs"));
    }
  }
});

test("Design validator rejects ownership, fingerprint, graph, and retired-surface drift", () => {
  const curriculum = structuredClone(curricula.find((entry) => entry.trackId === "frontend-system-design-interview"));
  const brief = briefs.find((entry) => entry.trackId === curriculum.trackId);
  curriculum.slots[0].nodeId = curriculum.nodes[1].nodeId;
  assert.throws(() => validateDesignInterviewCurriculum(curriculum, { brief }), /INVALID_DESIGN_(NODE|SLOT)_OWNERSHIP/);
  const fingerprintDrift = structuredClone(curricula[0]);
  fingerprintDrift.slots[0].dedupeFingerprint = "0".repeat(64);
  assert.throws(() => validateDesignInterviewCurriculum(fingerprintDrift, { brief: briefs.find((entry) => entry.trackId === fingerprintDrift.trackId) }), /DESIGN_SLOT_FINGERPRINT_MISMATCH/);
  const retired = structuredClone(curricula[0]);
  retired.slots[0].operationVariantCounts = {};
  assert.throws(() => validateDesignInterviewCurriculum(retired, { brief: briefs.find((entry) => entry.trackId === retired.trackId) }), /INVALID_DESIGN_SCHEMA|RETIRED_DESIGN_DECLARATION_SURFACE/);
});

test("Design schema, source provenance, fingerprints, and relationship anchors reject adversarial drift", () => {
  const frontend = structuredClone(curricula.find((entry) => entry.trackId === "frontend-system-design-interview"));
  const frontendBrief = briefs.find((entry) => entry.trackId === frontend.trackId);
  assert.equal(frontend.slots[0].dedupeFingerprint, "d63ab2e7146e607fc0b67f0e4734b21a8385e7dbb3196e0bc3f7fb421a32a930");
  frontend.slots[0].candidatePedagogicalRoles = ["design-interview-learn-framework"];
  assert.throws(() => validateDesignInterviewCurriculum(frontend, { brief: frontendBrief }), /INVALID_DESIGN_SCHEMA|RETIRED_DESIGN_DECLARATION_SURFACE/);
  const undeclaredSlotField = structuredClone(curricula.find((entry) => entry.trackId === "frontend-system-design-interview"));
  undeclaredSlotField.slots[0].sourceRequirements.directSourceAnchorRefs = [];
  assert.throws(() => validateDesignInterviewCurriculum(undeclaredSlotField, { brief: frontendBrief }), /INVALID_DESIGN_SCHEMA|RETIRED_DESIGN_DECLARATION_SURFACE/);
  const ood = structuredClone(curricula.find((entry) => entry.trackId === "object-oriented-design-interview"));
  const oodBrief = briefs.find((entry) => entry.trackId === ood.trackId);
  ood.sourceRecords[0] = { ...ood.sourceRecords[0], verificationStatus: "exact_direct_verified", exactAnchor: "invented section", mechanismOrProductProperties: ["invented property"] };
  ood.slots[0].sourceRequirements.directSourceRefs = [ood.sourceRecords[0].sourceId];
  assert.throws(() => validateDesignInterviewCurriculum(ood, { brief: oodBrief }), /DESIGN_DIRECT_SOURCE_PROVENANCE_NOT_ADMITTED/);
  const staleAnchor = structuredClone(curricula.find((entry) => entry.trackId === "object-oriented-design-interview"));
  staleAnchor.crossNodeRelationships[0].fromAtomId = "absent_atom";
  assert.throws(() => validateDesignInterviewCurriculum(staleAnchor, { brief: oodBrief }), /INVALID_DESIGN_RELATIONSHIP_ATOM/);
});

test("Design schema closes root and nested declaration surfaces even after fingerprint recomputation", () => {
  const base = curricula.find((entry) => entry.trackId === "frontend-system-design-interview");
  const brief = briefs.find((entry) => entry.trackId === base.trackId);
  for (const [path, mutate] of [
    ["root.hiddenDualModel", (curriculum) => { curriculum.hiddenDualModel = { enabled: true }; }],
    ["slot.aggregatePlan", (curriculum) => { curriculum.slots[0].aggregatePlan = { hidden: true }; }],
    ["sourceRequirements.variantProjection", (curriculum) => { curriculum.slots[0].sourceRequirements.variantProjection = { hidden: true }; }]
  ]) {
    const injected = structuredClone(base);
    mutate(injected);
    injected.slots[0].dedupeFingerprint = fingerprint(injected.slots[0]);
    assert.throws(() => validateDesignInterviewCurriculum(injected, { brief }), new RegExp(`INVALID_DESIGN_SCHEMA: .*${path.replace(".", "\\.").split(".").at(-1)}.*not declared`));
  }
});
