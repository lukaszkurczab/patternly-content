import assert from "node:assert/strict";
import test from "node:test";
import { loadCurricula } from "../scripts/curriculum/curricula.mjs";
import { loadCanonicalTrackBriefs } from "../scripts/product/track-briefs.mjs";
import { createHash } from "node:crypto";
import { validateDesignInterviewCurriculum, validateDesignInterviewFamilyConfig, validateDesignInterviewSourceRegistry } from "../scripts/curriculum/design-interview-curricula.mjs";
import registry from "../config/design-interview-source-registry.json" with { type: "json" };
import family from "../config/families/design_interview.json" with { type: "json" };

const curricula = (await loadCurricula()).filter((x) => x.familyId === "design_interview");
const briefs = await loadCanonicalTrackBriefs();
const validate = (value) => validateDesignInterviewCurriculum(value, { brief: briefs.find((x) => x.trackId === value.trackId) });
const rehashRegistry = (value) => { const payload = { ...value }; delete payload.registryFingerprintSha256; value.registryFingerprintSha256 = createHash("sha256").update(JSON.stringify(payload)).digest("hex"); };

test("Design source registry is the sole exact provenance authority and reconciles 8 resolved with 315 blocked", () => {
  validateDesignInterviewSourceRegistry(registry);
  assert.equal(registry.slotBindings.length, 8);
  assert.equal(curricula.reduce((sum, x) => sum + x.slots.length, 0), 323);
  assert.equal(curricula.flatMap((x) => x.slots).filter((x) => x.sourceRequirements.resolutionState === "resolved_exact_direct").length, 8);
  assert.equal(curricula.flatMap((x) => x.slots).filter((x) => x.sourceRequirements.resolutionState === "blocked_unresolved").length, 315);
  for (const curriculum of curricula) { assert.ok(!Object.hasOwn(curriculum, "sourceRecords")); assert.ok(!Object.hasOwn(curriculum, "sourcePolicy")); validate(curriculum); }
});
test("registry rejects rehashed trust-root mutations to exact URLs, locators, scoped claims, and binding roster", () => {
  for (const mutate of [
    (x) => { x.sourceRecords[0].immutableVersionUrl = "https://example.test/REC"; },
    (x) => { x.anchorRecords[0].url = "https://www.w3.org/TR/WCAG22/"; },
    (x) => { x.anchorRecords[0].locator = "other section"; },
    (x) => { x.claims[0].scope = "other scope"; },
    (x) => { x.claims[0].statement = "drift"; },
    (x) => { x.slotBindings[0].bindingId = "design-binding:frontend:swapped"; },
    (x) => { x.slotBindings[0].slotId = "backend-system-design-interview:injection"; },
    (x) => { x.slotBindings[0].claimIds.reverse(); },
    (x) => { x.anchorRecords.pop(); }
  ]) assert.throws(() => { const copy = structuredClone(registry); mutate(copy); rehashRegistry(copy); validateDesignInterviewSourceRegistry(copy); }, /DESIGN_SOURCE_TRUST_ROOT_MISMATCH/);
});
test("family config is closed and remains an eight-item authoring-feasibility contract", () => {
  validateDesignInterviewFamilyConfig(family);
  for (const mutate of [
    (x) => { x.supportedInteractions.push("ordering"); },
    (x) => { x.sourceRegistryRef = "config/other.json"; },
    (x) => { x.authoringHandoff.questionsAuthored = 8; },
    (x) => { x.authoringHandoff.releaseAdmission = "admitted"; },
    (x) => { x.sessionFeasibility.learnerFacingClaim = "available"; },
    (x) => { x.modes[0].currentExecutableCapacity = 8; }
  ]) assert.throws(() => { const copy = structuredClone(family); mutate(copy); validateDesignInterviewFamilyConfig(copy); }, /INVALID_DESIGN_FAMILY_CONTRACT/);
});
test("rehashed registry provenance cannot forge Design admission, authoring state, or first-batch capacity", () => {
  const frontend = curricula.find((x) => x.trackId === "frontend-system-design-interview");
  for (const mutate of [
    (x) => { x.admission.learnerFacingContentIncluded = true; },
    (x) => { x.admission.questionsAuthored = 8; },
    (x) => { x.admission.runtimeAdmission = "admitted"; },
    (x) => { x.admission.packageAdmission = "admitted"; },
    (x) => { x.admission.publishingAdmission = "admitted"; },
    (x) => { x.admission.releaseAdmission = "admitted"; },
    (x) => { x.authoring.status = "authoring_admitted"; },
    (x) => { x.authoring.firstSafeBatch = "forged-batch"; },
    (x) => { x.modeFeasibility[0].firstBatchEligibleItemCapacityAfterAuthoring = 9; }
  ]) { const copy = structuredClone(frontend); mutate(copy); assert.throws(() => validate(copy), /INVALID_DESIGN_(ADMISSION|AUTHORING_STATE|MODE_FEASIBILITY)/); }

  for (const trackId of ["backend-system-design-interview", "object-oriented-design-interview"]) {
    const copy = structuredClone(curricula.find((x) => x.trackId === trackId));
    copy.modeFeasibility[0].firstBatchEligibleItemCapacityAfterAuthoring = 8;
    assert.throws(() => validate(copy), /INVALID_DESIGN_MODE_FEASIBILITY/);
  }
  const forgedRegistry = structuredClone(registry);
  forgedRegistry.slotBindings[0].slotId = "backend-system-design-interview:forged";
  rehashRegistry(forgedRegistry);
  assert.throws(() => validateDesignInterviewCurriculum(structuredClone(frontend), { brief: briefs.find((x) => x.trackId === frontend.trackId), sourceRegistry: forgedRegistry }), /DESIGN_SOURCE_TRUST_ROOT_MISMATCH/);
});
test("resolved interaction and blocked-source contracts reject replacement, hidden interaction, and external claim fields", () => {
  const frontend = structuredClone(curricula.find((x) => x.trackId === "frontend-system-design-interview"));
  const resolved = frontend.slots.find((x) => x.sourceRequirements.resolutionState === "resolved_exact_direct");
  resolved.deliveryInteraction.selectionMode = "multiple";
  assert.throws(() => validate(frontend), /INVALID_DESIGN_RESOLVED_SLOT/);
  const blocked = structuredClone(curricula.find((x) => x.trackId === "backend-system-design-interview"));
  blocked.slots[0].sourceRequirements.sourceBindingId = registry.slotBindings[0].bindingId;
  assert.throws(() => validate(blocked), /INVALID_DESIGN_BLOCKED_SLOT/);
  for (const mutate of [
    (slot) => { slot.deliveryInteraction.selectionMode = "single"; },
    (slot) => { slot.deliveryInteraction.scoringContract = "exact_selected_set_with_partial_v1"; },
    (slot) => { slot.deliveryInteraction.familyContract = "certification"; },
    (slot) => { slot.deliveryInteraction.interactionType = "choice"; },
    (slot) => { slot.sourceRequirements.claimIds = ["ui-component-name-role-value-and-change-notification"]; }
  ]) { const copy = structuredClone(curricula.find((x) => x.trackId === "backend-system-design-interview")); mutate(copy.slots[0]); assert.throws(() => validate(copy), /INVALID_DESIGN_BLOCKED_SLOT/); }
  const injected = structuredClone(curricula[0]); injected.sourceRecords = []; assert.throws(() => validate(injected), /DESIGN_LOCAL_SOURCE_INVENTORY_RETIRED/);
});
