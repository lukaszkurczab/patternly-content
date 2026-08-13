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

test("Design central provenance reconciles 125 direct slots, 27 authoring-feasible slots, 98 deferred slots, and 198 blocked", () => {
  validateDesignInterviewSourceRegistry(registry);
  assert.deepEqual([registry.sourceRecords.length, registry.anchorRecords.length, registry.claims.length, registry.slotBindings.length], [37, 147, 116, 125]);
  assert.equal(curricula.reduce((sum, x) => sum + x.slots.length, 0), 323);
  assert.equal(curricula.flatMap((x) => x.slots).filter((x) => x.sourceRequirements.resolutionState === "resolved_exact_direct").length, 125);
  assert.equal(curricula.flatMap((x) => x.slots).filter((x) => x.sourceRequirements.resolutionState === "blocked_unresolved").length, 198);
  assert.equal(curricula.flatMap((x) => x.slots).filter((x) => x.authoringStatus === "authoring_admitted").length, 27);
  assert.equal(curricula.flatMap((x) => x.slots).filter((x) => x.authoringStatus === "provenance_resolved_authoring_deferred").length, 98);
  assert.deepEqual(Object.fromEntries(curricula.map((curriculum) => [curriculum.trackId, curriculum.slots.filter((slot) => slot.sourceRequirements.resolutionState === "resolved_exact_direct").length])), { "backend-system-design-interview": 38, "frontend-system-design-interview": 54, "object-oriented-design-interview": 33 });
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

test("round-six bindings retain their limited source authority and exact anchors", () => {
  const dialogSource = registry.sourceRecords.find((source) => source.sourceId === "w3c-wai-aria-authoring-practices-1.2-note-2021");
  const dialogAnchor = registry.anchorRecords.find((anchor) => anchor.anchorId === "wai-aria-practices-1.2-dialog-modal-return-focus");
  const dialogClaim = registry.claims.find((claim) => claim.claimId === "modal-dialog-close-focus-returns-to-invoker-with-workflow-exceptions");
  assert.equal(dialogSource.publicationStatus, "group_note");
  assert.equal(dialogAnchor.authorityClass, "informative");
  assert.match(dialogClaim.scope, /informative Group Note guidance, not a normative W3C Recommendation or general assistive-technology behavior claim/);
  assert.ok(dialogClaim.exclusions.includes("does not claim general assistive-technology behavior or platform conformance"));
  assert.deepEqual(registry.slotBindings.find((binding) => binding.bindingId === "design-binding:frontend:modal-dialog-return-focus").anchorIds, ["wai-aria-practices-1.2-dialog-modal-return-focus"]);
  assert.deepEqual(registry.slotBindings.find((binding) => binding.bindingId === "design-binding:ood:composition-over-unrelated-inheritance").anchorIds, ["cpp-core-33bcd01-c120-hierarchy-only"]);
  for (const mutate of [
    (x) => { x.sourceRecords.find((source) => source.sourceId === "w3c-wai-aria-authoring-practices-1.2-note-2021").publicationStatus = "recommendation"; },
    (x) => { x.anchorRecords.find((anchor) => anchor.anchorId === "wai-aria-practices-1.2-dialog-modal-return-focus").authorityClass = "normative"; },
    (x) => { x.claims.find((claim) => claim.claimId === "modal-dialog-close-focus-returns-to-invoker-with-workflow-exceptions").statement = "When a dialog closes, assistive technologies return focus to its invoker."; },
    (x) => { x.anchorRecords.find((anchor) => anchor.anchorId === "cpp-core-33bcd01-c120-hierarchy-only").url = "https://github.com/isocpp/CppCoreGuidelines/blob/33bcd015997f0d8e0fa0202eb66254a16f59ad8f/CppCoreGuidelines.md#c20-avoid-conventional-default-operations"; }
  ]) assert.throws(() => { const copy = structuredClone(registry); mutate(copy); rehashRegistry(copy); validateDesignInterviewSourceRegistry(copy); }, /DESIGN_SOURCE_TRUST_ROOT_MISMATCH/);
});

test("round-seven Navigator.onLine and C.10 bindings retain their exact, deferred-only boundaries", () => {
  const expected = {
    "design-binding:frontend:navigator-online-reachability-hint": {
      anchorIds: ["whatwg-html-ac0389a3-navigator-online-unreliable"],
      claimIds: ["navigator-online-is-unreliable-reachability-hint"],
      exclusions: [
        "Does not prove reachability of a particular origin, service, DNS name, or endpoint.",
        "Does not prove that any queued or newly issued request was delivered.",
        "Does not prescribe reconnect, retry, acknowledgement, or queue-visibility policy."
      ]
    },
    "design-binding:ood:concrete-type-until-hierarchy-justified": {
      anchorIds: ["cpp-core-33bcd01-c10-prefer-concrete-types"],
      claimIds: ["cpp-concrete-type-preferred-until-hierarchy-justified"],
      exclusions: [
        "Does not prove that a concept has no independent change axis; that remains case evidence.",
        "Does not require a concrete type when runtime polymorphism or another hierarchy use case is established.",
        "Does not prescribe an inheritance, composition, Strategy, or DI implementation."
      ]
    }
  };
  for (const [bindingId, closure] of Object.entries(expected)) {
    const binding = registry.slotBindings.find((entry) => entry.bindingId === bindingId);
    assert.deepEqual({ anchorIds: binding.anchorIds, claimIds: binding.claimIds }, { anchorIds: closure.anchorIds, claimIds: closure.claimIds });
    const claim = registry.claims.find((entry) => entry.claimId === binding.claimIds[0]);
    assert.deepEqual(claim.exclusions, closure.exclusions);
    const curriculum = curricula.find((entry) => binding.slotId.startsWith(`${entry.trackId}:`));
    const slot = curriculum.slots.find((entry) => entry.slotId === binding.slotId);
    assert.equal(slot.authoringStatus, "provenance_resolved_authoring_deferred");
    assert.deepEqual(slot.deliveryInteraction, { familyContract: "design_interview", interactionType: "choice", selectionMode: "single", scoringContract: "exact_selected_set_with_partial_v1", status: "provenance_resolved_authoring_deferred_runtime_not_admitted" });
    const handoff = family.authoringHandoffs.find((entry) => entry.trackId === curriculum.trackId);
    assert.ok(handoff.deferredResolvedSlotBindings.some((entry) => entry.bindingId === bindingId && entry.slotId === binding.slotId));
    assert.ok(!handoff.slotBindings.some((entry) => entry.bindingId === bindingId));
  }
  for (const mutate of [
    (x) => { x.sourceRecords.find((source) => source.sourceId === "whatwg-html-standard-ac0389a3").immutableVersionUrl = "https://html.spec.whatwg.org/multipage/system-state.html"; },
    (x) => { x.anchorRecords.find((anchor) => anchor.anchorId === "whatwg-html-ac0389a3-navigator-online-unreliable").locator = "Navigator.onLine proves endpoint delivery"; },
    (x) => { x.anchorRecords.find((anchor) => anchor.anchorId === "cpp-core-33bcd01-c10-prefer-concrete-types").url = "https://github.com/isocpp/CppCoreGuidelines/blob/33bcd015997f0d8e0fa0202eb66254a16f59ad8f/CppCoreGuidelines.md#c120"; },
    (x) => { x.claims.find((claim) => claim.claimId === "navigator-online-is-unreliable-reachability-hint").statement = "Navigator.onLine proves queued requests were delivered."; },
    (x) => { x.claims.find((claim) => claim.claimId === "cpp-concrete-type-preferred-until-hierarchy-justified").exclusions[2] = "Requires Strategy for all variation."; }
  ]) assert.throws(() => { const copy = structuredClone(registry); mutate(copy); rehashRegistry(copy); validateDesignInterviewSourceRegistry(copy); }, /DESIGN_SOURCE_TRUST_ROOT_MISMATCH/);
  for (const bindingId of Object.keys(expected)) {
    const binding = registry.slotBindings.find((entry) => entry.bindingId === bindingId);
    const curriculum = structuredClone(curricula.find((entry) => binding.slotId.startsWith(`${entry.trackId}:`)));
    const slot = curriculum.slots.find((entry) => entry.slotId === binding.slotId);
    slot.deliveryInteraction.selectionMode = "multiple";
    assert.throws(() => validate(curriculum), /INVALID_DESIGN_RESOLVED_SLOT/);
    slot.deliveryInteraction.selectionMode = "single";
    slot.deliveryInteraction.status = "authoring_admitted_runtime_not_admitted";
    slot.authoringStatus = "authoring_admitted";
    assert.throws(() => validate(curriculum), /INVALID_DESIGN_RESOLVED_SLOT/);
  }
  const rosterSwap = structuredClone(family);
  const frontend = rosterSwap.authoringHandoffs.find((entry) => entry.trackId === "frontend-system-design-interview");
  frontend.slotBindings.push(frontend.deferredResolvedSlotBindings.pop());
  assert.throws(() => validateDesignInterviewFamilyConfig(rosterSwap), /INVALID_DESIGN_FAMILY_CONTRACT/);
});

test("round-nine C.9 augments only the existing RDD deferred binding without broadening its authority", () => {
  const bindingId = "design-binding:ood:rdd-client-internal-state-hiding";
  const anchor = registry.anchorRecords.find((entry) => entry.anchorId === "cpp-core-33bcd01-c9-minimize-member-exposure");
  const claim = registry.claims.find((entry) => entry.claimId === "cpp-member-exposure-impedes-encapsulation-and-invariant-enforcement");
  const binding = registry.slotBindings.find((entry) => entry.bindingId === bindingId);
  assert.deepEqual(anchor, {
    anchorId: "cpp-core-33bcd01-c9-minimize-member-exposure",
    sourceId: "isocpp-core-guidelines-33bcd01",
    locator: "C.9, anchor rc-private, source lines 4577-4666",
    url: "https://github.com/isocpp/CppCoreGuidelines/blob/33bcd015997f0d8e0fa0202eb66254a16f59ad8f/CppCoreGuidelines.md#rc-private",
    authorityClass: "informative",
    claimIds: ["cpp-member-exposure-impedes-encapsulation-and-invariant-enforcement"]
  });
  assert.deepEqual(claim.exclusions, [
    "Does not require every data member to be private; independently variable data can intentionally be exposed.",
    "Does not define a collaborator message’s required input, result, or failure outcome.",
    "Does not generalize C++ access specifiers into a distributed-service or authorization boundary.",
    "Does not prescribe getters, setters, a framework, or one object decomposition."
  ]);
  assert.deepEqual({ anchorIds: binding.anchorIds, claimIds: binding.claimIds }, {
    anchorIds: ["rdd1991-client-server-information-hiding-contract", "cpp-core-33bcd01-c9-minimize-member-exposure"],
    claimIds: ["rdd-client-contract-hides-server-internals", "cpp-member-exposure-impedes-encapsulation-and-invariant-enforcement"]
  });
  const ood = curricula.find((curriculum) => curriculum.trackId === "object-oriented-design-interview");
  const slot = ood.slots.find((entry) => entry.sourceRequirements.sourceBindingId === bindingId);
  assert.equal(slot.authoringStatus, "provenance_resolved_authoring_deferred");
  assert.equal(slot.deliveryInteraction.status, "provenance_resolved_authoring_deferred_runtime_not_admitted");
  assert.ok(!family.authoringHandoffs.find((batch) => batch.trackId === ood.trackId).slotBindings.some((entry) => entry.bindingId === bindingId));
  for (const mutate of [
    (x) => { x.anchorRecords.find((entry) => entry.anchorId === anchor.anchorId).locator = "C.9 requires private data universally"; },
    (x) => { x.claims.find((entry) => entry.claimId === claim.claimId).exclusions[1] = "Defines collaborator message failure outcomes."; },
    (x) => { x.claims.find((entry) => entry.claimId === claim.claimId).exclusions[2] = "Defines distributed authorization boundaries."; }
  ]) assert.throws(() => { const copy = structuredClone(registry); mutate(copy); rehashRegistry(copy); validateDesignInterviewSourceRegistry(copy); }, /DESIGN_SOURCE_TRUST_ROOT_MISMATCH/);
  const promoted = structuredClone(family);
  const batch = promoted.authoringHandoffs.find((entry) => entry.trackId === ood.trackId);
  const deferredIndex = batch.deferredResolvedSlotBindings.findIndex((entry) => entry.bindingId === bindingId);
  batch.slotBindings.push(batch.deferredResolvedSlotBindings.splice(deferredIndex, 1)[0]);
  batch.plannedItemCount = 10;
  assert.throws(() => validateDesignInterviewFamilyConfig(promoted), /INVALID_DESIGN_FAMILY_CONTRACT/);
});

test("round-eight AbortSignal retains its exact deferred-only boundary and cannot promote the unrelated OOD slot", () => {
  const expected = {
    "design-binding:frontend:abort-signal-propagation": {
      anchorIds: ["whatwg-dom-8a5f57c6-abort-signal-api-integration"],
      claimIds: ["abort-signal-propagates-cancellable-web-operation"],
      exclusions: [
        "Does not claim that every client operation, transport, or server request is cancellable.",
        "Does not claim that abort reverses a side effect already committed by a remote system.",
        "Does not prescribe whether a partial result remains useful or visible after cancellation.",
        "Does not define product-specific cancel affordances or request-generation policy."
      ]
    }
  };
  for (const [bindingId, closure] of Object.entries(expected)) {
    const binding = registry.slotBindings.find((entry) => entry.bindingId === bindingId);
    assert.deepEqual({ anchorIds: binding.anchorIds, claimIds: binding.claimIds }, { anchorIds: closure.anchorIds, claimIds: closure.claimIds });
    const claim = registry.claims.find((entry) => entry.claimId === binding.claimIds[0]);
    assert.deepEqual(claim.exclusions, closure.exclusions);
    const curriculum = curricula.find((entry) => binding.slotId.startsWith(`${entry.trackId}:`));
    const slot = curriculum.slots.find((entry) => entry.slotId === binding.slotId);
    assert.equal(slot.authoringStatus, "provenance_resolved_authoring_deferred");
    assert.deepEqual(slot.deliveryInteraction, { familyContract: "design_interview", interactionType: "choice", selectionMode: "single", scoringContract: "exact_selected_set_with_partial_v1", status: "provenance_resolved_authoring_deferred_runtime_not_admitted" });
    const handoff = family.authoringHandoffs.find((entry) => entry.trackId === curriculum.trackId);
    assert.ok(handoff.deferredResolvedSlotBindings.some((entry) => entry.bindingId === bindingId && entry.slotId === binding.slotId));
    assert.ok(!handoff.slotBindings.some((entry) => entry.bindingId === bindingId));
  }
  for (const mutate of [
    (x) => { x.sourceRecords.find((source) => source.sourceId === "whatwg-dom-standard-8a5f57c6").immutableVersionUrl = "https://dom.spec.whatwg.org/"; },
    (x) => { x.anchorRecords.find((anchor) => anchor.anchorId === "whatwg-dom-8a5f57c6-abort-signal-api-integration").locator = "every request aborts remotely"; },
    (x) => { x.claims.find((claim) => claim.claimId === "abort-signal-propagates-cancellable-web-operation").exclusions[1] = "Abort undoes remote committed effects."; }
  ]) assert.throws(() => { const copy = structuredClone(registry); mutate(copy); rehashRegistry(copy); validateDesignInterviewSourceRegistry(copy); }, /DESIGN_SOURCE_TRUST_ROOT_MISMATCH/);
  const rosterSwap = structuredClone(family);
  const frontend = rosterSwap.authoringHandoffs.find((entry) => entry.trackId === "frontend-system-design-interview");
  frontend.slotBindings.push(frontend.deferredResolvedSlotBindings.find((entry) => entry.bindingId === "design-binding:frontend:abort-signal-propagation"));
  assert.throws(() => validateDesignInterviewFamilyConfig(rosterSwap), /INVALID_DESIGN_FAMILY_CONTRACT/);
  const ood = structuredClone(curricula.find((entry) => entry.trackId === "object-oriented-design-interview"));
  const illegalTransition = ood.slots.find((slot) => slot.slotId.includes("return_a_domain_failure_for_an_illegal_transition_without_partial_mutation"));
  assert.deepEqual(illegalTransition.sourceRequirements, { resolutionState: "blocked_unresolved", sourceRequirementIds: ["exact_authoritative_source_required"], unresolvedRequirements: ["Verify every bound source title, accessible content, exact supported claim, version, volatility, and checked date before authoring."] });
  assert.deepEqual(illegalTransition.deliveryInteraction, { familyContract: "design_interview", interactionType: null, status: "blocked_by_source_or_interaction_contract" });
  assert.ok(!registry.slotBindings.some((binding) => binding.slotId === illegalTransition.slotId));
  illegalTransition.sourceRequirements = { resolutionState: "resolved_exact_direct", sourceBindingId: "design-binding:ood:illegal-transition-failure-valid-state" };
  illegalTransition.authoringStatus = "provenance_resolved_authoring_deferred";
  illegalTransition.deliveryInteraction = { familyContract: "design_interview", interactionType: "choice", selectionMode: "single", scoringContract: "exact_selected_set_with_partial_v1", status: "provenance_resolved_authoring_deferred_runtime_not_admitted" };
  assert.throws(() => validate(ood), /INVALID_DESIGN_RESOLVED_SLOT/);
});

test("round-five admission rejects an unpinned live Backend source and deferred-roster swaps", () => {
  const liveBackendSource = {
    sourceId: "aws-live-unpinned-round5-refusal",
    publisher: "Amazon Web Services",
    sourceType: "vendor_documentation",
    title: "Live documentation is not an immutable source record",
    canonicalUrl: "https://docs.aws.amazon.com/",
    immutableVersionUrl: "https://docs.aws.amazon.com/",
    versionContext: "live and unpinned",
    publicationStatus: "live_documentation",
    checkedDate: "2026-08-12",
    volatility: "high"
  };
  const injected = structuredClone(registry); injected.sourceRecords.push(liveBackendSource); rehashRegistry(injected);
  assert.throws(() => validateDesignInterviewSourceRegistry(injected), /DESIGN_SOURCE_TRUST_ROOT_MISMATCH/);

  const swapped = structuredClone(family);
  const backend = swapped.authoringHandoffs.find((batch) => batch.trackId === "backend-system-design-interview");
  const frontend = swapped.authoringHandoffs.find((batch) => batch.trackId === "frontend-system-design-interview");
  const frontendLastIndex = frontend.deferredResolvedSlotBindings.length - 1;
  const firstBackendDeferred = backend.deferredResolvedSlotBindings[0];
  backend.deferredResolvedSlotBindings[0] = frontend.deferredResolvedSlotBindings[frontendLastIndex];
  frontend.deferredResolvedSlotBindings[frontendLastIndex] = firstBackendDeferred;
  assert.throws(() => validateDesignInterviewFamilyConfig(swapped), /INVALID_DESIGN_FAMILY_CONTRACT/);
});

test("round-five Frontend and OOD deferred bindings retain exact immutable-source closure", () => {
  const expected = {
    "design-binding:frontend:native-keyboard-contract": { anchorIds: ["wcag22-sc-2.1.1-keyboard", "wai-aria-1.2-host-language-semantics"], claimIds: ["all-functionality-keyboard-operable", "equivalent-native-host-semantics-preferred"] },
    "design-binding:frontend:dynamic-accessible-name-stability": { anchorIds: ["wcag22-sc-4.1.2-name-role-value", "accname-1.1-name-computation"], claimIds: ["ui-component-name-role-value-and-change-notification", "accessible-name-source-precedence-and-computation"] },
    "design-binding:frontend:screen-reader-task-path": { anchorIds: ["wai-aria-1.2-testing-practices"], claimIds: ["interactive-accessibility-not-proven-by-static-checks", "test-device-independent-and-accessibility-api-interaction"] },
    "design-binding:ood:adapter-external-protocol-boundary": { anchorIds: ["ddd-ref-anticorruption-layer"], claimIds: ["ddd-anticorruption-isolate-and-translate-models"] },
    "design-binding:ood:entity-stable-identity-equality": { anchorIds: ["ddd-ref-entities"], claimIds: ["ddd-entity-identity-lifecycle"] },
    "design-binding:ood:independent-business-change-axis": { anchorIds: ["ddd-ref-conceptual-contours"], claimIds: ["ddd-change-stability-conceptual-contours"] }
  };
  for (const [bindingId, closure] of Object.entries(expected)) {
    const binding = registry.slotBindings.find((entry) => entry.bindingId === bindingId);
    assert.deepEqual({ anchorIds: binding.anchorIds, claimIds: binding.claimIds }, closure);
    const curriculum = curricula.find((entry) => binding.slotId.startsWith(`${entry.trackId}:`));
    const slot = curriculum.slots.find((entry) => entry.slotId === binding.slotId);
    assert.equal(slot.authoringStatus, "provenance_resolved_authoring_deferred");
    assert.deepEqual(slot.deliveryInteraction, { familyContract: "design_interview", interactionType: "choice", selectionMode: "single", scoringContract: "exact_selected_set_with_partial_v1", status: "provenance_resolved_authoring_deferred_runtime_not_admitted" });
  }
  const featureEnvy = curricula.find((curriculum) => curriculum.trackId === "object-oriented-design-interview").slots.find((slot) => slot.slotId.includes("move_feature_envious_behavior"));
  assert.deepEqual(featureEnvy.sourceRequirements, { resolutionState: "blocked_unresolved", sourceRequirementIds: ["exact_authoritative_source_required"], unresolvedRequirements: ["Verify every bound source title, accessible content, exact supported claim, version, volatility, and checked date before authoring."] });
  assert.deepEqual(featureEnvy.deliveryInteraction, { familyContract: "design_interview", interactionType: null, status: "blocked_by_source_or_interaction_contract" });
  assert.ok(!registry.slotBindings.some((binding) => binding.slotId === featureEnvy.slotId));
  const forgedFeatureEnvy = structuredClone(curricula.find((curriculum) => curriculum.trackId === "object-oriented-design-interview"));
  const forgedSlot = forgedFeatureEnvy.slots.find((slot) => slot.slotId === featureEnvy.slotId);
  forgedSlot.sourceRequirements = { resolutionState: "resolved_exact_direct", sourceBindingId: "design-binding:ood:feature-behavior-with-knowledge-owner" };
  forgedSlot.authoringStatus = "provenance_resolved_authoring_deferred";
  forgedSlot.deliveryInteraction = { familyContract: "design_interview", interactionType: "choice", selectionMode: "single", scoringContract: "exact_selected_set_with_partial_v1", status: "provenance_resolved_authoring_deferred_runtime_not_admitted" };
  assert.throws(() => validate(forgedFeatureEnvy), /INVALID_DESIGN_RESOLVED_SLOT/);
  const counterexample = curricula.find((curriculum) => curriculum.trackId === "object-oriented-design-interview").slots.find((slot) => slot.slotId.includes("use_a_counterexample"));
  assert.equal(counterexample.sourceRequirements.resolutionState, "blocked_unresolved");
  assert.deepEqual(counterexample.deliveryInteraction, { familyContract: "design_interview", interactionType: null, status: "blocked_by_source_or_interaction_contract" });
  assert.ok(!registry.slotBindings.some((binding) => binding.slotId === counterexample.slotId));
  const forgedCounterexample = structuredClone(curricula.find((curriculum) => curriculum.trackId === "object-oriented-design-interview"));
  const forgedCounterexampleSlot = forgedCounterexample.slots.find((slot) => slot.slotId === counterexample.slotId);
  forgedCounterexampleSlot.sourceRequirements = { resolutionState: "resolved_exact_direct", sourceBindingId: "design-binding:ood:scenario-exposes-missing-state-or-responsibility" };
  forgedCounterexampleSlot.authoringStatus = "provenance_resolved_authoring_deferred";
  forgedCounterexampleSlot.deliveryInteraction = { familyContract: "design_interview", interactionType: "choice", selectionMode: "single", scoringContract: "exact_selected_set_with_partial_v1", status: "provenance_resolved_authoring_deferred_runtime_not_admitted" };
  assert.throws(() => validate(forgedCounterexample), /INVALID_DESIGN_RESOLVED_SLOT/);
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
  assert.deepEqual(family.authoringHandoffs.map((batch) => batch.deferredResolvedSlotBindings.length), [30, 44, 24]);
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

test("round-ten Backend sources preserve whole-decision boundaries and no-closure exclusions", () => {
  const microsoft = {
    "microsoft-architecture-center-caching-7b4bf264": "e6dbf872c9f6b061c38daa60182fa43f8dd62912ce46e5c6f17fc873281e7a75",
    "microsoft-architecture-center-sharding-7b4bf264": "de03a643c6b64f0d9e772275c6fe436678608f10a5e86f63dd36976c0e51638a",
    "microsoft-architecture-center-saga-7b4bf264": "8d288d612c8e8563d257f360cefa196279c73fa215dd7b1af1470b3c3621a287",
    "microsoft-architecture-center-transactional-outbox-7b4bf264": "b98c1c8f0cb516c98fdd0d458665369e139b3f99723046d059f16766a0b867f7",
    "microsoft-azure-durable-orchestrations-0aaa24ad": "d54bff355df48b0422eeaad8af46874cdfa83b1444aa48ec698585ef376821ba"
  };
  for (const [sourceId, fileSha256] of Object.entries(microsoft)) assert.equal(registry.sourceRecords.find((source) => source.sourceId === sourceId).fileSha256, fileSha256);
  const expected = {
    "design-binding:backend:caching-repeated-read-staleness-fit": "Does not prescribe a universal cache location.",
    "design-binding:backend:saga-local-progress-compensation": "Does not support sagas where temporary partial progress is forbidden.",
    "design-binding:backend:transactional-outbox-one-commit": "Does not guarantee exactly-once external side effects.",
    "design-binding:backend:durable-orchestration-checkpoint-retry": "Does not imply every multi-step process needs durable orchestration."
  };
  for (const [bindingId, exclusion] of Object.entries(expected)) {
    const binding = registry.slotBindings.find((entry) => entry.bindingId === bindingId);
    const claim = registry.claims.find((entry) => entry.claimId === binding.claimIds[0]);
    assert.ok(claim.exclusions.includes(exclusion));
    const slot = curricula.find((curriculum) => curriculum.trackId === "backend-system-design-interview").slots.find((entry) => entry.slotId === binding.slotId);
    assert.equal(slot.authoringStatus, "provenance_resolved_authoring_deferred");
  }
  const sagaClaim = registry.claims.find((entry) => entry.claimId === registry.slotBindings.find((entry) => entry.bindingId === "design-binding:backend:saga-local-progress-compensation").claimIds[0]);
  assert.ok(sagaClaim.exclusions.includes("Compensation is not physical rollback and can itself fail."));
  const invariantClaim = registry.claims.find((entry) => entry.claimId === registry.slotBindings.find((entry) => entry.bindingId === "design-binding:backend:ddd-ref-aggregates").claimIds[0]);
  assert.ok(invariantClaim.exclusions.includes("Does not permit compensation for an irreversible invariant-critical effect."));
  const backend = curricula.find((curriculum) => curriculum.trackId === "backend-system-design-interview");
  for (const needle of ["isolate_a_hot_key_before", "choose_optimistic_conflict_detection", "use_coordinated_distributed_commit_only_when"]) {
    const slot = backend.slots.find((entry) => entry.slotId.includes(needle));
    assert.equal(slot.sourceRequirements.resolutionState, "blocked_unresolved");
    assert.equal(slot.deliveryInteraction.interactionType, null);
  }
});

test("round-ten cookie chains stay conditional, defer-only, and reject draft injection", () => {
  const expected = {
    "design-binding:frontend:script-readable-token-exposure": ["asvs500-v3.3.4-cookie-httponly-set-cookie-only", "rfc6265-s4.1.2.6-httponly"],
    "design-binding:frontend:cross-site-request-boundary": ["asvs500-v3.3.2-cookie-samesite-purpose", "asvs500-v3.5.1-cross-origin-sensitive-request-validation"]
  };
  for (const [bindingId, anchorIds] of Object.entries(expected)) {
    const binding = registry.slotBindings.find((entry) => entry.bindingId === bindingId);
    assert.deepEqual(binding.anchorIds, anchorIds);
    const claim = registry.claims.find((entry) => entry.claimId === binding.claimIds[0]);
    assert.ok(claim.exclusions.some((value) => value.includes(bindingId.includes("script-readable") ? "universally preferable" : "SameSite alone")));
    if (bindingId === "design-binding:frontend:script-readable-token-exposure") assert.ok(claim.exclusions.includes("does not claim HttpOnly prevents authenticated requests initiated by injected script"));
    const slot = curricula.find((curriculum) => curriculum.trackId === "frontend-system-design-interview").slots.find((entry) => entry.slotId === binding.slotId);
    assert.equal(slot.authoringStatus, "provenance_resolved_authoring_deferred");
  }
  const draft = structuredClone(registry); draft.sourceRecords.push({ sourceId: "w3c-service-workers-crd-2026-06-08", publisher: "World Wide Web Consortium", sourceType: "candidate_recommendation_draft", title: "Service Workers", canonicalUrl: "https://www.w3.org/TR/service-workers/", immutableVersionUrl: "https://www.w3.org/TR/2026/CRD-service-workers-20260608/", versionContext: "Candidate Recommendation Draft", publicationStatus: "candidate_recommendation_draft", checkedDate: "2026-08-12", volatility: "medium" }); rehashRegistry(draft);
  assert.throws(() => validateDesignInterviewSourceRegistry(draft), /DESIGN_SOURCE_TRUST_ROOT_MISMATCH/);
  const rehashedBinding = structuredClone(registry); rehashedBinding.slotBindings.find((entry) => entry.bindingId === "design-binding:frontend:cross-site-request-boundary").anchorIds.pop(); rehashRegistry(rehashedBinding);
  assert.throws(() => validateDesignInterviewSourceRegistry(rehashedBinding), /DESIGN_SOURCE_TRUST_ROOT_MISMATCH/);
  const promoted = structuredClone(family); const handoff = promoted.authoringHandoffs.find((entry) => entry.trackId === "frontend-system-design-interview"); handoff.slotBindings.push(handoff.deferredResolvedSlotBindings.find((entry) => entry.bindingId === "design-binding:frontend:script-readable-token-exposure"));
  assert.throws(() => validateDesignInterviewFamilyConfig(promoted), /INVALID_DESIGN_FAMILY_CONTRACT/);
});

test("round-eleven AWS, WHATWG, and ASVS closures retain their exact scope, anchors, counts, and deferred-only boundary", () => {
  const expected = {
    "design-binding:backend:measurable-behavior-rollout-abort": ["aws-wa-2025-ops06-bp04-success-rollback-criteria"],
    "design-binding:backend:reject-negative-operational-value-optimization": ["aws-wa-2025-cost10-bp01-benefit-effort-review", "aws-wa-2025-cost11-bp01-operational-effort-cost"],
    "design-binding:frontend:native-disabled-state-contract": ["whatwg-html-ac0389a3-native-disabled-focusability", "whatwg-html-ac0389a3-disabled-control-activation", "whatwg-html-ac0389a3-disabled-control-form-entry-exclusion"],
    "design-binding:frontend:untrusted-content-dom-execution-boundary": ["asvs500-v3.2.2-safe-text-rendering", "asvs500-v1.1.2-v1.2.1-v1.2.3-contextual-output-encoding", "asvs500-v1.3.1-v1.3.2-untrusted-html-and-dynamic-execution"],
    "design-binding:frontend:sensitive-data-persistent-browser-storage": ["asvs500-v14.3.3-browser-storage-sensitive-data"],
    "design-binding:frontend:protected-state-trusted-service-validation": ["asvs500-v2.2.1-v2.2.2-trusted-service-input-validation"]
  };
  assert.deepEqual([registry.sourceRecords.length, registry.anchorRecords.length, registry.claims.length, registry.slotBindings.length], [37, 147, 116, 125]);
  for (const [bindingId, anchorIds] of Object.entries(expected)) {
    const binding = registry.slotBindings.find((entry) => entry.bindingId === bindingId);
    assert.deepEqual(binding.anchorIds, anchorIds);
    const slot = curricula.flatMap((curriculum) => curriculum.slots).find((entry) => entry.slotId === binding.slotId);
    assert.deepEqual(slot.sourceRequirements, { resolutionState: "resolved_exact_direct", sourceBindingId: bindingId });
    assert.equal(slot.authoringStatus, "provenance_resolved_authoring_deferred");
    assert.deepEqual(slot.deliveryInteraction, { familyContract: "design_interview", interactionType: "choice", selectionMode: "single", scoringContract: "exact_selected_set_with_partial_v1", status: "provenance_resolved_authoring_deferred_runtime_not_admitted" });
  }
  const storage = registry.slotBindings.find((entry) => entry.bindingId === "design-binding:frontend:sensitive-data-persistent-browser-storage");
  assert.ok(storage.slotId.includes("avoid_persistent_browser_storage_for_data_with_unacceptable_device_exposure"));
  assert.ok(!storage.slotId.includes("minimize_telemetry"));
  const rolloutClaim = registry.claims.find((entry) => entry.claimId === "behavior-rollout-uses-measurable-success-and-abort-criteria");
  const costClaim = registry.claims.find((entry) => entry.claimId === "optimization-benefit-must-cover-operational-effort-and-risk");
  const sinkClaim = registry.claims.find((entry) => entry.claimId === "untrusted-browser-content-kept-out-of-executable-dom-and-script-contexts");
  const validationClaim = registry.claims.find((entry) => entry.claimId === "protected-state-input-validation-enforced-at-trusted-service");
  assert.ok(rolloutClaim.exclusions.some((entry) => entry.includes("irreversible")));
  assert.ok(costClaim.exclusions.some((entry) => entry.includes("monetary value")));
  assert.ok(sinkClaim.exclusions.some((entry) => entry.includes("specific sanitizer")));
  assert.ok(validationClaim.exclusions.some((entry) => entry.includes("authorization")));
  for (const mutate of [
    (x) => { x.anchorRecords.find((entry) => entry.anchorId === "aws-wa-2025-ops06-bp04-success-rollback-criteria").claimIds = []; },
    (x) => { x.claims.find((entry) => entry.claimId === "native-disabled-controls-lose-focus-activation-and-form-entry-behavior").statement = "Every disabled component is inaccessible."; },
    (x) => { x.claims.find((entry) => entry.claimId === "browser-storage-excludes-sensitive-data-except-session-tokens").scope = "Telemetry, browser storage, and all device recovery."; }
  ]) assert.throws(() => { const copy = structuredClone(registry); mutate(copy); rehashRegistry(copy); validateDesignInterviewSourceRegistry(copy); }, /DESIGN_SOURCE_TRUST_ROOT_MISMATCH/);
  const promoted = structuredClone(family);
  const frontend = promoted.authoringHandoffs.find((entry) => entry.trackId === "frontend-system-design-interview");
  frontend.slotBindings.push(frontend.deferredResolvedSlotBindings.find((entry) => entry.bindingId === "design-binding:frontend:native-disabled-state-contract"));
  assert.throws(() => validateDesignInterviewFamilyConfig(promoted), /INVALID_DESIGN_FAMILY_CONTRACT/);
});

test("round-twelve quality-attribute priority remains a single AWS deferred-only closure", () => {
  const bindingId = "design-binding:backend:quality-attribute-degradation-priority";
  const binding = registry.slotBindings.find((entry) => entry.bindingId === bindingId);
  assert.deepEqual({ claimIds: binding.claimIds, anchorIds: binding.anchorIds }, { claimIds: ["quality-attribute-priority-chosen-when-requirements-conflict"], anchorIds: ["aws-wa-2025-rel05-bp01-slo-conflict-priority"] });
  const claim = registry.claims.find((entry) => entry.claimId === binding.claimIds[0]);
  assert.ok(claim.exclusions.some((entry) => entry.includes("universal priority order")));
  assert.ok(claim.exclusions.some((entry) => entry.includes("numeric SLO")));
  const backend = curricula.find((entry) => entry.trackId === "backend-system-design-interview");
  const slot = backend.slots.find((entry) => entry.slotId === binding.slotId);
  assert.deepEqual(slot.sourceRequirements, { resolutionState: "resolved_exact_direct", sourceBindingId: bindingId });
  assert.equal(slot.authoringStatus, "provenance_resolved_authoring_deferred");
  assert.deepEqual(slot.deliveryInteraction, { familyContract: "design_interview", interactionType: "choice", selectionMode: "single", scoringContract: "exact_selected_set_with_partial_v1", status: "provenance_resolved_authoring_deferred_runtime_not_admitted" });
  const handoff = family.authoringHandoffs.find((entry) => entry.trackId === backend.trackId);
  assert.ok(handoff.deferredResolvedSlotBindings.some((entry) => entry.bindingId === bindingId));
  assert.ok(!handoff.slotBindings.some((entry) => entry.bindingId === bindingId));
  const mutated = structuredClone(registry); mutated.claims.find((entry) => entry.claimId === claim.claimId).exclusions[0] = "Availability is always preferred."; rehashRegistry(mutated);
  assert.throws(() => validateDesignInterviewSourceRegistry(mutated), /DESIGN_SOURCE_TRUST_ROOT_MISMATCH/);
});

test("round-twelve Frontend GDPR and OOD UML-plus-Evans closures remain exact and deferred-only", () => {
  const expected = {
    "design-binding:frontend:telemetry-purpose-data-minimisation": {
      trackId: "frontend-system-design-interview",
      anchorIds: ["gdpr2016-art5-1-b-c-purpose-and-data-minimisation", "gdpr2016-art25-1-data-protection-by-design"],
      claimIds: ["personal-telemetry-purpose-limited-and-data-minimized"]
    },
    "design-binding:ood:use-case-command-query-observable-outcome": {
      trackId: "object-oriented-design-interview",
      anchorIds: ["uml-2.5.1-use-case-offered-behavior-observable-outcome", "ddd-ref-side-effect-free-functions"],
      claimIds: ["uml-use-case-observable-outcome-plus-ddd-command-query-extraction"]
    }
  };
  for (const [bindingId, closure] of Object.entries(expected)) {
    const binding = registry.slotBindings.find((entry) => entry.bindingId === bindingId);
    assert.deepEqual({ anchorIds: binding.anchorIds, claimIds: binding.claimIds }, { anchorIds: closure.anchorIds, claimIds: closure.claimIds });
    const curriculum = curricula.find((entry) => entry.trackId === closure.trackId);
    const slot = curriculum.slots.find((entry) => entry.slotId === binding.slotId);
    assert.deepEqual(slot.sourceRequirements, { resolutionState: "resolved_exact_direct", sourceBindingId: bindingId });
    assert.equal(slot.authoringStatus, "provenance_resolved_authoring_deferred");
    assert.deepEqual(slot.deliveryInteraction, { familyContract: "design_interview", interactionType: "choice", selectionMode: "single", scoringContract: "exact_selected_set_with_partial_v1", status: "provenance_resolved_authoring_deferred_runtime_not_admitted" });
    const handoff = family.authoringHandoffs.find((entry) => entry.trackId === closure.trackId);
    assert.ok(handoff.deferredResolvedSlotBindings.some((entry) => entry.bindingId === bindingId));
    assert.ok(!handoff.slotBindings.some((entry) => entry.bindingId === bindingId));
  }
  const gdpr = registry.sourceRecords.find((entry) => entry.sourceId === "eu-gdpr-regulation-2016-679-oj");
  assert.equal(gdpr.publicationStatus, "official_journal_primary_law");
  const uml = registry.anchorRecords.find((entry) => entry.anchorId === "uml-2.5.1-use-case-offered-behavior-observable-outcome");
  assert.equal(uml.sourceId, "omg-uml-2.5.1-2017");
  assert.equal(uml.authorityClass, "normative");
  const oodClaim = registry.claims.find((entry) => entry.claimId === "uml-use-case-observable-outcome-plus-ddd-command-query-extraction");
  assert.ok(oodClaim.exclusions.some((entry) => entry.includes("domain vocabulary")));
  assert.ok(oodClaim.exclusions.some((entry) => entry.includes("business-rule-versus-UI/persistence")));
  const promoted = structuredClone(family);
  promoted.authoringHandoffs.find((entry) => entry.trackId === "frontend-system-design-interview").slotBindings.push(promoted.authoringHandoffs.find((entry) => entry.trackId === "frontend-system-design-interview").deferredResolvedSlotBindings.find((entry) => entry.bindingId === "design-binding:frontend:telemetry-purpose-data-minimisation"));
  assert.throws(() => validateDesignInterviewFamilyConfig(promoted), /INVALID_DESIGN_FAMILY_CONTRACT/);
});

test("round-thirteen RFC 9111 keeps the application-data-cache boundary exact and deferred-only", () => {
  const bindingId = "design-binding:frontend:application-data-cache-distinct-from-http-cache";
  const binding = registry.slotBindings.find((entry) => entry.bindingId === bindingId);
  assert.deepEqual({
    anchorIds: binding.anchorIds,
    claimIds: binding.claimIds
  }, {
    anchorIds: ["rfc9111-s6-application-and-other-caches"],
    claimIds: ["application-data-cache-policy-is-distinct-from-http-cache-semantics"]
  });
  const frontend = curricula.find((entry) => entry.trackId === "frontend-system-design-interview");
  const slot = frontend.slots.find((entry) => entry.slotId === binding.slotId);
  assert.deepEqual(slot.sourceRequirements, { resolutionState: "resolved_exact_direct", sourceBindingId: bindingId });
  assert.equal(slot.authoringStatus, "provenance_resolved_authoring_deferred");
  assert.deepEqual(slot.deliveryInteraction, { familyContract: "design_interview", interactionType: "choice", selectionMode: "single", scoringContract: "exact_selected_set_with_partial_v1", status: "provenance_resolved_authoring_deferred_runtime_not_admitted" });
  const claim = registry.claims.find((entry) => entry.claimId === binding.claimIds[0]);
  assert.ok(claim.exclusions.some((entry) => entry.includes("mutation write")));
  assert.ok(claim.exclusions.some((entry) => entry.includes("offline storage")));
  const handoff = family.authoringHandoffs.find((entry) => entry.trackId === frontend.trackId);
  assert.ok(handoff.deferredResolvedSlotBindings.some((entry) => entry.bindingId === bindingId));
  assert.ok(!handoff.slotBindings.some((entry) => entry.bindingId === bindingId));
  const mutated = structuredClone(registry);
  mutated.anchorRecords.find((entry) => entry.anchorId === "rfc9111-s6-application-and-other-caches").url = "https://www.rfc-editor.org/rfc/rfc9111.html#section-4";
  rehashRegistry(mutated);
  assert.throws(() => validateDesignInterviewSourceRegistry(mutated), /DESIGN_SOURCE_TRUST_ROOT_MISMATCH/);
});
