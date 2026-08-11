import assert from "node:assert/strict";
import test from "node:test";
import { createHash } from "node:crypto";
import { loadCurricula } from "../scripts/curriculum/curricula.mjs";
import { loadCanonicalTrackBriefs } from "../scripts/product/track-briefs.mjs";
import { validateDesignInterviewCurriculum, validateDesignInterviewFamilyConfig, validateDesignInterviewSourceRegistry } from "../scripts/curriculum/design-interview-curricula.mjs";
import { designVolumes } from "../scripts/curriculum/audit-curricula.mjs";
import registry from "../config/design-interview-source-registry.json" with { type: "json" };
import family from "../config/families/design_interview.json" with { type: "json" };

const curricula = (await loadCurricula()).filter((x) => x.familyId === "design_interview");
const briefs = await loadCanonicalTrackBriefs();
const validate = (value) => validateDesignInterviewCurriculum(value, { brief: briefs.find((x) => x.trackId === value.trackId) });
const rehashRegistry = (value) => { const payload = { ...value }; delete payload.registryFingerprintSha256; value.registryFingerprintSha256 = createHash("sha256").update(JSON.stringify(payload)).digest("hex"); };
const canonical = (value) => Array.isArray(value) ? `[${value.map(canonical).join(",")}]` : value && typeof value === "object" ? `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}` : JSON.stringify(value);
const rehashFamily = (value) => createHash("sha256").update(canonical(value)).digest("hex");

test("Design central provenance reconciles 95 direct slots, 27 authoring-feasible slots, 68 deferred slots, and 228 blocked", () => {
  validateDesignInterviewSourceRegistry(registry);
  assert.deepEqual([registry.sourceRecords.length, registry.anchorRecords.length, registry.claims.length, registry.slotBindings.length], [28, 115, 92, 95]);
  assert.equal(curricula.reduce((sum, x) => sum + x.slots.length, 0), 323);
  assert.equal(curricula.flatMap((x) => x.slots).filter((x) => x.sourceRequirements.resolutionState === "resolved_exact_direct").length, 95);
  assert.equal(curricula.flatMap((x) => x.slots).filter((x) => x.sourceRequirements.resolutionState === "blocked_unresolved").length, 228);
  assert.equal(curricula.flatMap((x) => x.slots).filter((x) => x.authoringStatus === "authoring_admitted").length, 27);
  assert.equal(curricula.flatMap((x) => x.slots).filter((x) => x.authoringStatus === "provenance_resolved_authoring_deferred").length, 68);
  assert.deepEqual(Object.fromEntries(curricula.map((curriculum) => [curriculum.trackId, curriculum.slots.filter((slot) => slot.sourceRequirements.resolutionState === "resolved_exact_direct").length])), { "backend-system-design-interview": 28, "frontend-system-design-interview": 40, "object-oriented-design-interview": 27 });
  const frontend = curricula.find((curriculum) => curriculum.trackId === "frontend-system-design-interview");
  const privilegedComputation = frontend.slots.find((slot) => slot.slotId.endsWith(":slot:privileged-computation-boundary"));
  const leastPrivilegedResult = frontend.slots.find((slot) => slot.slotId.endsWith(":slot:least-privileged-client-result"));
  assert.equal(privilegedComputation.sourceRequirements.resolutionState, "blocked_unresolved");
  assert.ok(!registry.slotBindings.some((binding) => binding.slotId === privilegedComputation.slotId));
  assert.deepEqual(leastPrivilegedResult.sourceRequirements, { resolutionState: "resolved_exact_direct", sourceBindingId: "design-binding:frontend:least-privileged-client-result" });
  for (const curriculum of curricula) { assert.ok(!Object.hasOwn(curriculum, "sourceRecords")); assert.ok(!Object.hasOwn(curriculum, "sourcePolicy")); validate(curriculum); }
});

test("registry trust root rejects rehashed source, roster, anchor, claim, and binding swaps across publishers", () => {
  for (const mutate of [
    (x) => { x.sourceRecords.find((source) => source.sourceId === "apache-kafka-4.2-docs-956020b").immutableVersionUrl = "https://example.test/kafka"; },
    (x) => { x.sourceRecords.find((source) => source.sourceId === "eric-evans-ddd-reference-2015").checkedDate = "2026-08-12"; },
    (x) => { x.anchorRecords.find((anchor) => anchor.anchorId === "rfc9111-s4.3-cache-validation").locator = "other section"; },
    (x) => { x.anchorRecords.find((anchor) => anchor.anchorId === "ddd-ref-entities").claimIds[0] = "ddd-value-object-no-identity-immutable"; },
    (x) => { x.claims.find((claim) => claim.claimId === "http-retry-semantics-are-explicit").exclusions[0] = "drift"; },
    (x) => { x.slotBindings.find((binding) => binding.bindingId === "design-binding:ood:behavioral-subtyping-caller-contract").anchorIds.reverse(); },
    (x) => { x.slotBindings.find((binding) => binding.bindingId === "design-binding:frontend:non-pointer-input-behavior").slotId = "frontend-system-design-interview:forged"; },
    (x) => { x.slotBindings.pop(); }
  ]) assert.throws(() => { const copy = structuredClone(registry); mutate(copy); rehashRegistry(copy); validateDesignInterviewSourceRegistry(copy); }, /DESIGN_SOURCE_TRUST_ROOT_MISMATCH/);
});

test("UML transition evidence cannot broaden an explicit-trigger rule to completion transitions", () => {
  for (const mutate of [
    (x) => { x.claims.find((claim) => claim.claimId === "uml-event-transition-state-invariant").statement = "Every enabled UML Transition requires a matching Event Trigger."; },
    (x) => { x.anchorRecords.find((anchor) => anchor.anchorId === "uml-2.5.1-transition-guards-and-enablement").locator = "enablement requires an active source, matching trigger, and a true guard for every transition"; }
  ]) assert.throws(() => { const copy = structuredClone(registry); mutate(copy); rehashRegistry(copy); validateDesignInterviewSourceRegistry(copy); }, /DESIGN_SOURCE_TRUST_ROOT_MISMATCH/);
});

test("round-four deferred bindings retain their exact source closure and choice-only non-promotion", () => {
  const expected = {
    "design-binding:backend:aggregate-invariant-service-owner": { anchorIds: ["ddd-ref-aggregates"], claimIds: ["ddd-aggregate-root-invariant-transaction-boundary"] },
    "design-binding:backend:reject-sync-shared-aggregate-owner": { anchorIds: ["ddd-ref-aggregates"], claimIds: ["ddd-aggregate-root-invariant-transaction-boundary"] },
    "design-binding:frontend:lcp-budget-p75-segmented": { anchorIds: ["web-vitals-core-metrics-targets-and-segmentation-2026-08-10"], claimIds: ["web-vitals-lcp-good-target", "web-vitals-p75-mobile-desktop-segmentation"] },
    "design-binding:frontend:inp-budget-p75-segmented": { anchorIds: ["web-vitals-core-metrics-targets-and-segmentation-2026-08-10"], claimIds: ["web-vitals-inp-good-target", "web-vitals-p75-mobile-desktop-segmentation"] },
    "design-binding:frontend:cls-budget-p75-segmented": { anchorIds: ["web-vitals-core-metrics-targets-and-segmentation-2026-08-10"], claimIds: ["web-vitals-cls-good-target", "web-vitals-p75-mobile-desktop-segmentation"] },
    "design-binding:frontend:web-vitals-budget-segmentation": { anchorIds: ["web-vitals-core-metrics-targets-and-segmentation-2026-08-10"], claimIds: ["web-vitals-p75-mobile-desktop-segmentation"] },
    "design-binding:frontend:lab-field-performance-decision": { anchorIds: ["web-vitals-lab-not-substitute-for-field-2026-08-10"], claimIds: ["web-vitals-lab-is-not-field-substitute"] },
    "design-binding:ood:stable-behavior-contract": { anchorIds: ["rdd1991-client-server-information-hiding-contract"], claimIds: ["rdd-client-contract-hides-server-internals"] },
    "design-binding:ood:command-query-observational-boundary": { anchorIds: ["ddd-ref-side-effect-free-functions"], claimIds: ["ddd-command-query-observable-side-effect-boundary"] }
  };
  for (const [bindingId, closure] of Object.entries(expected)) {
    const binding = registry.slotBindings.find((entry) => entry.bindingId === bindingId);
    assert.ok(binding, bindingId);
    assert.deepEqual({ anchorIds: binding.anchorIds, claimIds: binding.claimIds }, closure);
    const curriculum = curricula.find((entry) => binding.slotId.startsWith(`${entry.trackId}:`));
    const slot = curriculum.slots.find((entry) => entry.slotId === binding.slotId);
    assert.deepEqual(slot.sourceRequirements, { resolutionState: "resolved_exact_direct", sourceBindingId: bindingId });
    assert.equal(slot.authoringStatus, "provenance_resolved_authoring_deferred");
    assert.deepEqual(slot.deliveryInteraction, { familyContract: "design_interview", interactionType: "choice", selectionMode: "single", scoringContract: "exact_selected_set_with_partial_v1", status: "provenance_resolved_authoring_deferred_runtime_not_admitted" });
  }
  const tampered = structuredClone(curricula.find((entry) => entry.trackId === "object-oriented-design-interview"));
  tampered.slots.find((slot) => slot.sourceRequirements.sourceBindingId === "design-binding:ood:command-query-observational-boundary").deliveryInteraction.selectionMode = "multiple";
  assert.throws(() => validate(tampered), /INVALID_DESIGN_RESOLVED_SLOT/);
});

test("the pinned per-track authoring roster admits only the exact 8, 10, and 9 source-binding slots", () => {
  validateDesignInterviewFamilyConfig(family);
  assert.deepEqual(family.authoringHandoffs.map(({ trackId, plannedItemCount }) => [trackId, plannedItemCount]), [["backend-system-design-interview", 8], ["frontend-system-design-interview", 10], ["object-oriented-design-interview", 9]]);
  const frontend = family.authoringHandoffs.find((batch) => batch.trackId === "frontend-system-design-interview");
  assert.equal(frontend.slotBindings.length, 10);
  assert.deepEqual(family.authoringHandoffs.map((batch) => batch.deferredResolvedSlotBindings.length), [20, 30, 18]);
  assert.ok(family.authoringHandoffs.every((batch) => batch.deferredResolvedReason.length && batch.deferredResolvedReviewBoundary.length));
  for (const mutate of [
    (x) => { x.supportedInteractions.push("ordering"); },
    (x) => { x.authoringHandoffs[0].plannedItemCount = 9; },
    (x) => { x.authoringHandoffs[1].humanReviewRequired = false; },
    (x) => { x.authoringHandoffs[2].runtimeAdmission = "admitted"; },
    (x) => { x.modes[0].firstBatchEligibleItemCapacityAfterAuthoringByTrack["object-oriented-design-interview"] = 10; },
    (x) => { x.authoringHandoffs[1].slotBindings.pop(); },
    (x) => { x.authoringHandoffs[0].deferredResolvedReviewBoundary = ""; },
    (x) => { x.authoringHandoffs[1].deferredResolvedSlotBindings.pop(); },
    (x) => { x.authoringHandoffs[0].deferredResolvedSlotBindings.find((entry) => entry.bindingId === "design-binding:backend:kafka-keyed-partition-order").slotId = "backend-system-design-interview:forged"; },
    (x) => { x.authoringHandoffs[2].deferredResolvedSlotBindings.find((entry) => entry.bindingId === "design-binding:ood:behavioral-subtyping-caller-contract").bindingId = "design-binding:ood:forged"; },
    (x) => { [x.authoringHandoffs[1].slotBindings[0].slotId, x.authoringHandoffs[1].deferredResolvedSlotBindings[0].slotId] = [x.authoringHandoffs[1].deferredResolvedSlotBindings[0].slotId, x.authoringHandoffs[1].slotBindings[0].slotId]; },
    (x) => { x.authoringHandoffs[1].slotBindings[0] = structuredClone(x.authoringHandoffs[1].deferredResolvedSlotBindings[0]); }
  ]) assert.throws(() => { const copy = structuredClone(family); mutate(copy); assert.notEqual(rehashFamily(copy), rehashFamily(family)); validateDesignInterviewFamilyConfig(copy); }, /INVALID_DESIGN_FAMILY_CONTRACT/);
});

test("Design audit reconciles each pinned authoring batch to its owning nodes", () => {
  const expectedByTrack = {
    "backend-system-design-interview": { reliability_and_failure_containment: 8 },
    "frontend-system-design-interview": { frontend_architecture_foundations: 1, accessible_interaction_design: 8, evolution_testing_and_case_synthesis: 1 },
    "object-oriented-design-interview": { object_modeling_foundations: 3, responsibilities_and_collaborations: 1, invariants_and_lifecycle: 1, identity_persistence_and_external_boundaries: 4 }
  };

  for (const curriculum of curricula) {
    const volume = designVolumes(curriculum);
    const authoringByNode = Object.fromEntries(volume.nodes.map((node) => [node.nodeId, node.authoringItemCount]));
    const nonZeroAuthoringByNode = Object.fromEntries(Object.entries(authoringByNode).filter(([, count]) => count > 0));
    assert.deepEqual(nonZeroAuthoringByNode, expectedByTrack[curriculum.trackId]);
    assert.equal(Object.values(authoringByNode).reduce((sum, count) => sum + count, 0), volume.authoringItemCount);
    assert.ok(Object.entries(authoringByNode).filter(([nodeId]) => !Object.hasOwn(expectedByTrack[curriculum.trackId], nodeId)).every(([, count]) => count === 0));
  }
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
  const backend = structuredClone(curricula.find((curriculum) => curriculum.trackId === "backend-system-design-interview"));
  const deferredBackend = backend.slots.find((slot) => slot.authoringStatus === "provenance_resolved_authoring_deferred");
  deferredBackend.deliveryInteraction.status = "authoring_admitted_runtime_not_admitted";
  deferredBackend.authoringStatus = "authoring_admitted";
  assert.throws(() => validate(backend), /INVALID_DESIGN_RESOLVED_SLOT/);
});

test("blocked slots cannot become hidden choice paths or local provenance inventories", () => {
  const backend = structuredClone(curricula.find((curriculum) => curriculum.trackId === "backend-system-design-interview"));
  const blocked = backend.slots.find((slot) => slot.sourceRequirements.resolutionState === "blocked_unresolved");
  blocked.deliveryInteraction.interactionType = "choice";
  assert.throws(() => validate(backend), /INVALID_DESIGN_BLOCKED_SLOT/);
  const injected = structuredClone(curricula[0]); injected.sourceRecords = [];
  assert.throws(() => validate(injected), /DESIGN_LOCAL_SOURCE_INVENTORY_RETIRED/);
});
