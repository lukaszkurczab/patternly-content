import assert from "node:assert/strict";
import test from "node:test";
import { createHash } from "node:crypto";
import { loadCurricula } from "../scripts/curriculum/curricula.mjs";
import { loadCanonicalTrackBriefs } from "../scripts/product/track-briefs.mjs";
import { validateDesignInterviewCurriculum, validateDesignInterviewFamilyConfig, validateDesignInterviewSourceRegistry } from "../scripts/curriculum/design-interview-curricula.mjs";
import registry from "../config/design-interview-source-registry.json" with { type: "json" };
import family from "../config/families/design_interview.json" with { type: "json" };

const curricula = (await loadCurricula()).filter((x) => x.familyId === "design_interview");
const briefs = await loadCanonicalTrackBriefs();
const validate = (value) => validateDesignInterviewCurriculum(value, { brief: briefs.find((x) => x.trackId === value.trackId) });
const rehashRegistry = (value) => { const payload = { ...value }; delete payload.registryFingerprintSha256; value.registryFingerprintSha256 = createHash("sha256").update(JSON.stringify(payload)).digest("hex"); };
const canonical = (value) => Array.isArray(value) ? `[${value.map(canonical).join(",")}]` : value && typeof value === "object" ? `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}` : JSON.stringify(value);
const rehashFamily = (value) => createHash("sha256").update(canonical(value)).digest("hex");

test("Design central provenance reconciles the frozen 35 direct slots with 288 blocked", () => {
  validateDesignInterviewSourceRegistry(registry);
  assert.deepEqual([registry.sourceRecords.length, registry.anchorRecords.length, registry.claims.length, registry.slotBindings.length], [9, 38, 37, 35]);
  assert.equal(curricula.reduce((sum, x) => sum + x.slots.length, 0), 323);
  assert.equal(curricula.flatMap((x) => x.slots).filter((x) => x.sourceRequirements.resolutionState === "resolved_exact_direct").length, 35);
  assert.equal(curricula.flatMap((x) => x.slots).filter((x) => x.sourceRequirements.resolutionState === "blocked_unresolved").length, 288);
  assert.deepEqual(Object.fromEntries(curricula.map((curriculum) => [curriculum.trackId, curriculum.slots.filter((slot) => slot.sourceRequirements.resolutionState === "resolved_exact_direct").length])), { "backend-system-design-interview": 8, "frontend-system-design-interview": 18, "object-oriented-design-interview": 9 });
  for (const curriculum of curricula) { assert.ok(!Object.hasOwn(curriculum, "sourceRecords")); assert.ok(!Object.hasOwn(curriculum, "sourcePolicy")); validate(curriculum); }
});

test("registry trust root rejects rehashed source, roster, anchor, claim, and binding swaps across publishers", () => {
  for (const mutate of [
    (x) => { x.sourceRecords.find((source) => source.sourceId.startsWith("aws-")).immutableVersionUrl = "https://example.test/aws"; },
    (x) => { x.sourceRecords.find((source) => source.sourceId === "eric-evans-ddd-reference-2015").checkedDate = "2026-08-12"; },
    (x) => { x.anchorRecords.find((anchor) => anchor.anchorId === "grpc-deadlines-2025-deadline-propagation").locator = "other section"; },
    (x) => { x.anchorRecords.find((anchor) => anchor.anchorId === "ddd-ref-entities").claimIds[0] = "ddd-value-object-no-identity-immutable"; },
    (x) => { x.claims.find((claim) => claim.claimId === "http-retry-semantics-are-explicit").exclusions[0] = "drift"; },
    (x) => { x.slotBindings.find((binding) => binding.bindingId === "design-binding:ood:entity-value-separation").anchorIds.reverse(); },
    (x) => { x.slotBindings.find((binding) => binding.bindingId === "design-binding:frontend:non-pointer-input-behavior").slotId = "frontend-system-design-interview:forged"; },
    (x) => { x.slotBindings.pop(); }
  ]) assert.throws(() => { const copy = structuredClone(registry); mutate(copy); rehashRegistry(copy); validateDesignInterviewSourceRegistry(copy); }, /DESIGN_SOURCE_TRUST_ROOT_MISMATCH/);
});

test("the pinned per-track authoring roster admits only the exact 8, 10, and 9 source-binding slots", () => {
  validateDesignInterviewFamilyConfig(family);
  assert.deepEqual(family.authoringHandoffs.map(({ trackId, plannedItemCount }) => [trackId, plannedItemCount]), [["backend-system-design-interview", 8], ["frontend-system-design-interview", 10], ["object-oriented-design-interview", 9]]);
  const frontend = family.authoringHandoffs.find((batch) => batch.trackId === "frontend-system-design-interview");
  assert.equal(frontend.slotBindings.length, 10);
  assert.equal(frontend.deferredResolvedSlotBindings.length, 8);
  assert.ok(frontend.deferredResolvedReason.length && frontend.deferredResolvedReviewBoundary.length);
  for (const mutate of [
    (x) => { x.supportedInteractions.push("ordering"); },
    (x) => { x.authoringHandoffs[0].plannedItemCount = 9; },
    (x) => { x.authoringHandoffs[1].humanReviewRequired = false; },
    (x) => { x.authoringHandoffs[2].runtimeAdmission = "admitted"; },
    (x) => { x.modes[0].firstBatchEligibleItemCapacityAfterAuthoringByTrack["object-oriented-design-interview"] = 10; },
    (x) => { x.authoringHandoffs[1].slotBindings.pop(); },
    (x) => { [x.authoringHandoffs[1].slotBindings[0].slotId, x.authoringHandoffs[1].deferredResolvedSlotBindings[0].slotId] = [x.authoringHandoffs[1].deferredResolvedSlotBindings[0].slotId, x.authoringHandoffs[1].slotBindings[0].slotId]; },
    (x) => { x.authoringHandoffs[1].slotBindings[0] = structuredClone(x.authoringHandoffs[1].deferredResolvedSlotBindings[0]); }
  ]) assert.throws(() => { const copy = structuredClone(family); mutate(copy); assert.notEqual(rehashFamily(copy), rehashFamily(family)); validateDesignInterviewFamilyConfig(copy); }, /INVALID_DESIGN_FAMILY_CONTRACT/);
});

test("admission, cross-track binding, and interaction contract remain non-runtime and exact", () => {
  for (const curriculum of curricula) {
    const resolved = curriculum.slots.find((slot) => slot.sourceRequirements.resolutionState === "resolved_exact_direct");
    const badSelection = structuredClone(curriculum); badSelection.slots.find((slot) => slot.slotId === resolved.slotId).deliveryInteraction.selectionMode = "multiple";
    assert.throws(() => validate(badSelection), /INVALID_DESIGN_RESOLVED_SLOT/);
    const badAdmission = structuredClone(curriculum); badAdmission.admission.runtimeAdmission = "admitted";
    assert.throws(() => validate(badAdmission), /INVALID_DESIGN_ADMISSION/);
    const badBinding = structuredClone(curriculum); badBinding.slots.find((slot) => slot.slotId === resolved.slotId).sourceRequirements.sourceBindingId = registry.slotBindings.find((binding) => !binding.slotId.startsWith(`${curriculum.trackId}:`)).bindingId;
    assert.throws(() => validate(badBinding), /INVALID_DESIGN_RESOLVED_SLOT/);
  }
  const frontend = structuredClone(curricula.find((curriculum) => curriculum.trackId === "frontend-system-design-interview"));
  const deferred = frontend.slots.find((slot) => slot.sourceRequirements.sourceBindingId === "design-binding:frontend:visible-label-name");
  deferred.authoringStatus = "authoring_admitted";
  assert.throws(() => validate(frontend), /INVALID_DESIGN_RESOLVED_SLOT/);
});

test("blocked slots cannot become hidden choice paths or local provenance inventories", () => {
  const backend = structuredClone(curricula.find((curriculum) => curriculum.trackId === "backend-system-design-interview"));
  const blocked = backend.slots.find((slot) => slot.sourceRequirements.resolutionState === "blocked_unresolved");
  blocked.deliveryInteraction.interactionType = "choice";
  assert.throws(() => validate(backend), /INVALID_DESIGN_BLOCKED_SLOT/);
  const injected = structuredClone(curricula[0]); injected.sourceRecords = [];
  assert.throws(() => validate(injected), /DESIGN_LOCAL_SOURCE_INVENTORY_RETIRED/);
});
