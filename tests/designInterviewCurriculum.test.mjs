import assert from "node:assert/strict";
import test from "node:test";
import { createHash } from "node:crypto";
import { cpSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
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

test("source captures recompute offline and reject byte, capture, and artifact tampering", () => {
  const root = mkdtempSync(join(tmpdir(), "patternly-design-captures-"));
  try {
    const capturesRoot = join(root, "evidence/design-interview/source-captures");
    mkdirSync(dirname(capturesRoot), { recursive: true });
    cpSync("evidence/design-interview/source-captures", capturesRoot, { recursive: true, dereference: false });
    validateDesignInterviewSourceRegistry(registry, { repositoryRoot: root });
    assert.equal(registry.sourceCaptures.length, 79);
    for (const sourceId of ["microsoft-waf-business-requirements-40aabbf", "microsoft-architecture-center-asynchronous-request-reply-09ba725e", "react-docs-sharing-state-between-components-b440d66", "microsoft-dotnet-command-handler-bd038508", "microsoft-architecture-center-sequential-convoy-7b4bf264", "microsoft-architecture-center-saga-7b4bf264", "playwright-docs-best-practices-js-07730b7", "react-docs-use-client-b440d66"]) assert.ok(registry.sourceCaptures.some((capture) => capture.sourceIds[0] === sourceId));
    const tampered = registry.sourceCaptures[0]; const artifact = join(root, tampered.repositoryPath); const bytes = readFileSync(artifact); bytes[0] ^= 1; writeFileSync(artifact, bytes);
    assert.throws(() => validateDesignInterviewSourceRegistry(registry, { repositoryRoot: root }), /DESIGN_SOURCE_CAPTURE_SHA256_MISMATCH/);
    writeFileSync(artifact, readFileSync(tampered.repositoryPath));
    const badLength = structuredClone(registry); badLength.sourceCaptures[0].byteLength--; rehashRegistry(badLength);
    assert.throws(() => validateDesignInterviewSourceRegistry(badLength, { repositoryRoot: root }), /DESIGN_SOURCE_CAPTURE_BYTE_LENGTH_MISMATCH/);
    writeFileSync(join(root, "evidence/design-interview/source-captures/sha256/74/orphan"), "orphan");
    assert.throws(() => validateDesignInterviewSourceRegistry(registry, { repositoryRoot: root }), /DEAD_DESIGN_SOURCE_CAPTURE_ARTIFACT/);
    const injected = structuredClone(registry); injected.sourceCaptures[0].sourceIds.push("w3c-wcag-2.2-rec-2024"); rehashRegistry(injected);
    assert.throws(() => validateDesignInterviewSourceRegistry(injected, { repositoryRoot: root }), /UNBOUND_DESIGN_SOURCE_CAPTURE/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("source-capture gates reject rehashed identity, membership, retrieval, rights, and path-component symlink attacks", () => {
  for (const mutate of [
    (value) => { value.schemaVersion = "design-interview-source-registry-v1"; },
    (value) => { value.registryVersion = "2026.08.12"; },
    (value) => { value.checkedDate = "2026-08-12"; }
  ]) {
    const copy = structuredClone(registry); mutate(copy); rehashRegistry(copy);
    assert.throws(() => validateDesignInterviewSourceRegistry(copy), /INVALID_DESIGN_SOURCE_REGISTRY/);
  }
  const duplicateMembership = structuredClone(registry); duplicateMembership.sourceCaptures[0].sourceIds.push(duplicateMembership.sourceCaptures[0].sourceIds[0]); rehashRegistry(duplicateMembership);
  assert.throws(() => validateDesignInterviewSourceRegistry(duplicateMembership), /UNBOUND_DESIGN_SOURCE_CAPTURE/);
  const duplicateCapture = structuredClone(registry); duplicateCapture.sourceCaptures.push(structuredClone(duplicateCapture.sourceCaptures[0])); rehashRegistry(duplicateCapture);
  assert.throws(() => validateDesignInterviewSourceRegistry(duplicateCapture), /DUPLICATE_DESIGN_SOURCE_CAPTURE/);
  const wrongRetrieval = structuredClone(registry); wrongRetrieval.sourceCaptures[1].retrieval.retrievalUrl = "https://raw.githubusercontent.com/MicrosoftDocs/architecture-center/main/docs/guide/multitenant/approaches/storage-data.md"; rehashRegistry(wrongRetrieval);
  assert.throws(() => validateDesignInterviewSourceRegistry(wrongRetrieval), /DESIGN_SOURCE_CAPTURE_RETRIEVAL_MISMATCH/);
  const wrongRights = structuredClone(registry); wrongRights.sourceCaptures[0].rights.licenseEvidenceUrl = "https://example.test/license"; rehashRegistry(wrongRights);
  assert.throws(() => validateDesignInterviewSourceRegistry(wrongRights), /DESIGN_SOURCE_CAPTURE_RIGHTS_MISMATCH/);
  const root = mkdtempSync(join(tmpdir(), "patternly-design-capture-root-link-"));
  try {
    const captureRoot = join(root, "evidence/design-interview/source-captures"); mkdirSync(captureRoot, { recursive: true });
    symlinkSync(join(process.cwd(), "evidence/design-interview/source-captures/sha256"), join(captureRoot, "sha256"), "dir");
    assert.throws(() => validateDesignInterviewSourceRegistry(registry, { repositoryRoot: root }), /DESIGN_SOURCE_CAPTURE_PATH_MISMATCH/);
  } finally { rmSync(root, { recursive: true, force: true }); }
  const parentLinkRoot = mkdtempSync(join(tmpdir(), "patternly-design-capture-parent-link-"));
  try {
    const parent = join(parentLinkRoot, "evidence/design-interview"); mkdirSync(parent, { recursive: true });
    symlinkSync(join(process.cwd(), "evidence/design-interview/source-captures"), join(parent, "source-captures"), "dir");
    assert.throws(() => validateDesignInterviewSourceRegistry(registry, { repositoryRoot: parentLinkRoot }), /DESIGN_SOURCE_CAPTURE_PATH_MISMATCH/);
  } finally { rmSync(parentLinkRoot, { recursive: true, force: true }); }
});

test("Design central provenance reconciles 258 direct slots, 27 authoring-feasible slots, 231 deferred slots, and 65 blocked", () => {
  validateDesignInterviewSourceRegistry(registry);
  assert.deepEqual([registry.sourceRecords.length, registry.sourceCaptures.length, registry.anchorRecords.length, registry.claims.length, registry.slotBindings.length], [121, 79, 337, 237, 258]);
  assert.equal(curricula.reduce((sum, x) => sum + x.slots.length, 0), 323);
  assert.equal(curricula.flatMap((x) => x.slots).filter((x) => x.sourceRequirements.resolutionState === "resolved_exact_direct").length, 258);
  assert.equal(curricula.flatMap((x) => x.slots).filter((x) => x.sourceRequirements.resolutionState === "blocked_unresolved").length, 65);
  assert.equal(curricula.flatMap((x) => x.slots).filter((x) => x.authoringStatus === "authoring_admitted").length, 27);
  assert.equal(curricula.flatMap((x) => x.slots).filter((x) => x.authoringStatus === "provenance_resolved_authoring_deferred").length, 231);
  assert.deepEqual(Object.fromEntries(curricula.map((curriculum) => [curriculum.trackId, curriculum.slots.filter((slot) => slot.sourceRequirements.resolutionState === "resolved_exact_direct").length])), { "backend-system-design-interview": 74, "frontend-system-design-interview": 134, "object-oriented-design-interview": 50 });
  const frontend = curricula.find((curriculum) => curriculum.trackId === "frontend-system-design-interview");
  const privilegedComputation = frontend.slots.find((slot) => slot.slotId.endsWith(":slot:privileged-computation-boundary"));
  const leastPrivilegedResult = frontend.slots.find((slot) => slot.slotId.endsWith(":slot:least-privileged-client-result"));
  assert.deepEqual(privilegedComputation.sourceRequirements, { resolutionState: "resolved_exact_direct", sourceBindingId: "design-binding:frontend:privileged-policy-and-secrets-remain-server-side" });
  assert.equal(privilegedComputation.authoringStatus, "provenance_resolved_authoring_deferred");
  assert.ok(registry.slotBindings.some((binding) => binding.slotId === privilegedComputation.slotId));
  assert.deepEqual(leastPrivilegedResult.sourceRequirements, { resolutionState: "resolved_exact_direct", sourceBindingId: "design-binding:frontend:least-privileged-client-result" });
  for (const curriculum of curricula) { assert.ok(!Object.hasOwn(curriculum, "sourceRecords")); assert.ok(!Object.hasOwn(curriculum, "sourcePolicy")); validate(curriculum); }
});

test("round-twenty-five Blazor validation closes only form-level rejection mappings and remains deferred", () => {
  const expected = {
    "design-binding:frontend:form-wide-rejection-remains-model-owned": ["frontend-form-wide-rejection-remains-model-owned", "aspnet-blazor-model-level-validation-ownership"],
    "design-binding:frontend:unknown-server-validation-yields-form-level-error": ["frontend-unrecognized-server-validation-yields-generic-form-error", "aspnet-blazor-unrecognized-validation-response-form-error"]
  };
  const frontend = curricula.find((curriculum) => curriculum.trackId === "frontend-system-design-interview");
  for (const [bindingId, [claimId, anchorId]] of Object.entries(expected)) {
    const binding = registry.slotBindings.find((entry) => entry.bindingId === bindingId);
    assert.deepEqual({ claimIds: binding.claimIds, anchorIds: binding.anchorIds, authoringStatus: binding.authoringStatus }, { claimIds: [claimId], anchorIds: [anchorId], authoringStatus: "provenance_resolved_authoring_deferred" });
    const slot = frontend.slots.find((entry) => entry.slotId === binding.slotId);
    assert.deepEqual(slot.sourceRequirements, { resolutionState: "resolved_exact_direct", sourceBindingId: bindingId });
    assert.equal(slot.authoringStatus, "provenance_resolved_authoring_deferred");
    assert.ok(family.authoringHandoffs.find((batch) => batch.trackId === frontend.trackId).deferredResolvedSlotBindings.some((entry) => entry.bindingId === bindingId && entry.slotId === slot.slotId));
  }
  const promoted = structuredClone(family);
  const handoff = promoted.authoringHandoffs.find((batch) => batch.trackId === frontend.trackId);
  handoff.slotBindings.push(handoff.deferredResolvedSlotBindings.pop());
  assert.throws(() => validateDesignInterviewFamilyConfig(promoted), /INVALID_DESIGN_FAMILY_CONTRACT/);
});

test("round-fourteen keeps Frontend and the complete OOD asynchronous block deferred-only", () => {
  const expected = {
    "design-binding:frontend:bounded-backoff-jitter": ["aws-wa-2025-rel05-bp03-bounded-retries"],
    "design-binding:frontend:service-worker-lifecycle-client-control": ["w3c-service-workers-1-cr-lifecycle-registration-client-control"],
    "design-binding:ood:transactional-outbox-durable-state-before-publication-and-consumer-recovery": ["ms-transactional-outbox-one-commit", "ms-transactional-outbox-relay-recovery-and-dependent-consumer-delivery"],
    "design-binding:ood:transactional-outbox-relay-failure-lifecycle-independent-of-caller-result": ["ms-transactional-outbox-one-commit", "ms-transactional-outbox-relay-recovery-and-dependent-consumer-delivery"]
  };
  assert.equal(registry.sourceRecords.find((source) => source.sourceId === "w3c-service-workers-1-cr-2019-11-19").immutableVersionUrl, "https://www.w3.org/TR/2019/CR-service-workers-1-20191119/");
  for (const [bindingId, anchorIds] of Object.entries(expected)) {
    const binding = registry.slotBindings.find((entry) => entry.bindingId === bindingId);
    assert.deepEqual(binding.anchorIds, anchorIds);
    const curriculum = curricula.find((entry) => binding.slotId.startsWith(`${entry.trackId}:`));
    const slot = curriculum.slots.find((entry) => entry.slotId === binding.slotId);
    assert.equal(slot.authoringStatus, "provenance_resolved_authoring_deferred");
    assert.deepEqual(slot.deliveryInteraction, { familyContract: "design_interview", interactionType: "choice", selectionMode: "single", scoringContract: "exact_selected_set_with_partial_v1", status: "provenance_resolved_authoring_deferred_runtime_not_admitted" });
    const handoff = family.authoringHandoffs.find((entry) => entry.trackId === curriculum.trackId);
    assert.ok(handoff.deferredResolvedSlotBindings.some((entry) => entry.bindingId === bindingId && entry.slotId === binding.slotId));
    assert.ok(!handoff.slotBindings.some((entry) => entry.bindingId === bindingId));
  }
  const ood = curricula.find((entry) => entry.trackId === "object-oriented-design-interview");
  const asynchronous = ood.slots.filter((slot) => slot.blockId === "asynchronous_collaboration_and_events");
  assert.equal(asynchronous.length, 2);
  assert.ok(asynchronous.every((slot) => slot.sourceRequirements.resolutionState === "resolved_exact_direct" && slot.authoringStatus === "provenance_resolved_authoring_deferred"));
  const broken = structuredClone(ood);
  const one = broken.slots.find((slot) => slot.blockId === "asynchronous_collaboration_and_events");
  one.sourceRequirements = { resolutionState: "blocked_unresolved", sourceRequirementIds: ["exact_authoritative_source_required"], unresolvedRequirements: ["forged partial rollback"] };
  one.authoringStatus = undefined;
  one.deliveryInteraction = { familyContract: "design_interview", interactionType: null, status: "blocked_by_source_or_interaction_contract" };
  assert.throws(() => validate(broken), /INVALID_DESIGN_SLOT_RECONCILIATION/);
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
  assert.deepEqual(illegalTransition.sourceRequirements, { resolutionState: "resolved_exact_direct", sourceBindingId: "design-binding:ood:domain-rejection-without-partial-mutation" });
  assert.deepEqual(illegalTransition.deliveryInteraction, { familyContract: "design_interview", interactionType: "choice", selectionMode: "single", scoringContract: "exact_selected_set_with_partial_v1", status: "provenance_resolved_authoring_deferred_runtime_not_admitted" });
  assert.ok(registry.slotBindings.some((binding) => binding.slotId === illegalTransition.slotId));
  illegalTransition.sourceRequirements = { resolutionState: "resolved_exact_direct", sourceBindingId: "design-binding:ood:illegal-transition-failure-valid-state" };
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
  assert.deepEqual(family.authoringHandoffs.map((batch) => batch.deferredResolvedSlotBindings.length), [66, 124, 41]);
  assert.deepEqual(family.authoringHandoffs.map((batch) => batch.deferredResolvedReason), [
    "These 66 Backend bindings are provenance-resolved but outside the pinned eight-slot Backend authoring-feasibility batch.",
    "These 124 Frontend bindings are provenance-resolved but outside the pinned ten-slot Frontend authoring-feasibility batch.",
    "These 41 OOD bindings are provenance-resolved but outside the pinned nine-slot OOD authoring-feasibility batch."
  ]);
  assert.ok(family.authoringHandoffs.every((batch) => batch.deferredResolvedReviewBoundary.length));
  for (const mutate of [
    (x) => { x.supportedInteractions.push("ordering"); },
    (x) => { x.authoringHandoffs[0].plannedItemCount = 9; },
    (x) => { x.authoringHandoffs[1].humanReviewRequired = false; },
    (x) => { x.authoringHandoffs[2].runtimeAdmission = "admitted"; },
    (x) => { x.modes[0].firstBatchEligibleItemCapacityAfterAuthoringByTrack["object-oriented-design-interview"] = 10; },
    (x) => { x.authoringHandoffs[1].slotBindings.pop(); },
    (x) => { x.authoringHandoffs[0].deferredResolvedReviewBoundary = ""; },
    (x) => { x.authoringHandoffs[1].deferredResolvedReason = "These 46 Frontend bindings are provenance-resolved but outside the pinned ten-slot Frontend authoring-feasibility batch."; },
    (x) => { x.authoringHandoffs[1].deferredResolvedSlotBindings.pop(); },
    (x) => { x.authoringHandoffs[0].deferredResolvedSlotBindings.find((entry) => entry.bindingId === "design-binding:backend:kafka-keyed-partition-order").slotId = "backend-system-design-interview:forged"; },
    (x) => { x.authoringHandoffs[2].deferredResolvedSlotBindings.find((entry) => entry.bindingId === "design-binding:ood:behavioral-subtyping-caller-contract").bindingId = "design-binding:ood:forged"; },
    (x) => { [x.authoringHandoffs[1].slotBindings[0].slotId, x.authoringHandoffs[1].deferredResolvedSlotBindings[0].slotId] = [x.authoringHandoffs[1].deferredResolvedSlotBindings[0].slotId, x.authoringHandoffs[1].slotBindings[0].slotId]; },
    (x) => { x.authoringHandoffs[1].slotBindings[0] = structuredClone(x.authoringHandoffs[1].deferredResolvedSlotBindings[0]); }
  ]) assert.throws(() => { const copy = structuredClone(family); mutate(copy); assert.notEqual(rehashFamily(copy), rehashFamily(family)); validateDesignInterviewFamilyConfig(copy); }, /INVALID_DESIGN_FAMILY_CONTRACT/);
});

test("a deferred-resolution handoff reason must state the derived deferred roster count", () => {
  const stale = structuredClone(family);
  stale.authoringHandoffs.find((batch) => batch.trackId === "frontend-system-design-interview").deferredResolvedReason = "These 46 Frontend bindings are provenance-resolved but outside the pinned ten-slot Frontend authoring-feasibility batch.";
  assert.throws(() => validateDesignInterviewFamilyConfig(stale), /INVALID_DESIGN_FAMILY_CONTRACT: authoring batch roster/);
});

test("Design audit reconciles each pinned authoring batch to its owning nodes", () => {
  const expectedByTrack = {
    "backend-system-design-interview": { reliability_and_failure_containment: 8 },
    "frontend-system-design-interview": { requirements_user_journeys_constraints_and_frontend_decomposition: 1, accessible_interaction_design: 8, evolution_testing_and_case_synthesis: 1 },
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
  const backend = structuredClone(curricula.find((curriculum) => curriculum.trackId === "frontend-system-design-interview"));
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
  const slot = backend.slots.find((entry) => entry.sourceRequirements.sourceBindingId === "design-binding:backend:two-phase-commit-atomicity-blocking-boundary");
  assert.equal(slot.sourceRequirements.resolutionState, "resolved_exact_direct");
  assert.equal(slot.deliveryInteraction.interactionType, "choice");
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
  assert.deepEqual([registry.sourceRecords.length, registry.anchorRecords.length, registry.claims.length, registry.slotBindings.length], [121, 337, 237, 258]);
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

test("round-fifteen materializes only its eight supplied closures and rejects source, anchor, and roster overreach", () => {
  const expected = {
    "design-binding:backend:critical-journey-latency-availability-freshness": ["google-sre-workbook-ch2-user-relevant-availability-latency-freshness", "google-sre-workbook-ch2-critical-user-journeys"],
    "design-binding:backend:overload-admission-before-latency-amplification": ["google-sre-workbook-ch11-autoscaling-reaction-delay", "google-sre-book-ch22-queue-latency-early-rejection", "google-sre-book-ch22-load-shed-threshold-priority"],
    "design-binding:backend:nist-verified-internal-principal-context": ["nist800204b-end-user-credential-validation-exchange", "nist800204b-trusted-jwt-principal-verification", "nist800204b-request-credential-audit-chain"],
    "design-binding:backend:measured-resource-tier-reliability-cost": ["aws-wa-2025-cross-pillar-reliability-cost-tradeoff", "aws-wa-2025-cost06-measured-resource-rightsizing"],
    "design-binding:frontend:bearer-token-lifecycle-exposure-boundary": ["rfc6750-s1.3-s2.1-s5.2-s5.3-bearer-token-exposure-boundary"],
    "design-binding:ood:consumer-owned-collaborator-role-test-seam": ["mock-roles-2004-consumer-required-role-interface"],
    "design-binding:ood:collaborator-unavailable-through-consumer-owned-seam": ["mock-roles-2004-consumer-required-role-interface", "mock-roles-2004-collaborator-unready-failure-path"],
    "design-binding:ood:required-collaboration-message-without-incidental-order": ["mock-roles-2004-material-interaction-without-incidental-order"]
  };
  for (const [bindingId, anchorIds] of Object.entries(expected)) {
    const binding = registry.slotBindings.find((entry) => entry.bindingId === bindingId);
    assert.deepEqual(binding.anchorIds, anchorIds);
    const curriculum = curricula.find((entry) => binding.slotId.startsWith(`${entry.trackId}:`));
    const slot = curriculum.slots.find((entry) => entry.slotId === binding.slotId);
    assert.equal(slot.authoringStatus, "provenance_resolved_authoring_deferred");
    assert.equal(slot.deliveryInteraction.status, "provenance_resolved_authoring_deferred_runtime_not_admitted");
    assert.ok(family.authoringHandoffs.find((entry) => entry.trackId === curriculum.trackId).deferredResolvedSlotBindings.some((entry) => entry.bindingId === bindingId));
  }
  const overreach = structuredClone(registry);
  overreach.slotBindings.find((entry) => entry.bindingId === "design-binding:frontend:bearer-token-lifecycle-exposure-boundary").anchorIds.push("mock-roles-2004-material-interaction-without-incidental-order");
  rehashRegistry(overreach);
  assert.throws(() => validateDesignInterviewSourceRegistry(overreach), /DESIGN_SOURCE_TRUST_ROOT_MISMATCH/);
  const promoted = structuredClone(family);
  const frontend = promoted.authoringHandoffs.find((entry) => entry.trackId === "frontend-system-design-interview");
  frontend.slotBindings.push(frontend.deferredResolvedSlotBindings.find((entry) => entry.bindingId === "design-binding:frontend:bearer-token-lifecycle-exposure-boundary"));
  assert.throws(() => validateDesignInterviewFamilyConfig(promoted), /INVALID_DESIGN_FAMILY_CONTRACT/);
});


test("round-sixteen exact closures stay deferred and reject authoring promotion", () => {
  const expected = {
    "design-binding:backend:dataflow-saturation-signal-backlog-growth": ["google-dataflow-backlog-onset-saturation-autoscaling"],
    "design-binding:backend:classified-tenant-storage-query-boundary": ["aws-wa-2025-sec07-bp02-classification-isolation-boundary", "ms-multitenant-storage-dedicated-database-isolation", "ms-multitenant-storage-rls-tenant-query-context"],
    "design-binding:frontend:react-derived-display-from-current-state": ["react-no-effect-derived-state-post-commit-staleness"],
    "design-binding:frontend:react-remove-post-commit-derived-state-duplication": ["react-no-effect-derived-state-post-commit-staleness"],
    "design-binding:frontend:react-current-request-instance-visible-result": ["react-use-effect-ignore-obsolete-fetch-response"],
    "design-binding:ood:pre-persistence-entity-identity-collection-stability": ["hibernate-7.1.35-entity-equality-stable-hash-boundary", "hibernate-7.1.35-natural-key-equality-example"]
  };
  for (const [bindingId, anchorIds] of Object.entries(expected)) {
    const binding = registry.slotBindings.find((entry) => entry.bindingId === bindingId);
    assert.deepEqual(binding.anchorIds, anchorIds);
    const slot = curricula.flatMap((curriculum) => curriculum.slots).find((entry) => entry.slotId === binding.slotId);
    assert.deepEqual(slot.sourceRequirements, { resolutionState: "resolved_exact_direct", sourceBindingId: bindingId });
    assert.equal(slot.authoringStatus, "provenance_resolved_authoring_deferred");
    const handoff = family.authoringHandoffs.find((entry) => entry.trackId === slot.trackId);
    assert.ok(handoff.deferredResolvedSlotBindings.some((entry) => entry.bindingId === bindingId && entry.slotId === binding.slotId));
    assert.ok(!handoff.slotBindings.some((entry) => entry.bindingId === bindingId));
  }
  const promoted = structuredClone(family);
  const backend = promoted.authoringHandoffs.find((entry) => entry.trackId === "backend-system-design-interview");
  const index = backend.deferredResolvedSlotBindings.findIndex((entry) => entry.bindingId === "design-binding:backend:dataflow-saturation-signal-backlog-growth");
  backend.slotBindings.push(backend.deferredResolvedSlotBindings.splice(index, 1)[0]);
  assert.throws(() => validateDesignInterviewFamilyConfig(promoted), /INVALID_DESIGN_FAMILY_CONTRACT/);
  for (const mutate of [
    (value) => { value.sourceRecords.find((entry) => entry.sourceId === "hibernate-orm-7.1.35-entities-0a5c369").immutableVersionUrl = "https://docs.hibernate.org/orm/7.1/introduction/html_single/Hibernate_Introduction.html#equals-and-hash"; },
    (value) => { value.claims.find((entry) => entry.claimId === "react-current-request-instance-owns-visible-fetch-result").exclusions[1] = "Applies to non-idempotent mutations."; }
  ]) {
    const tampered = structuredClone(registry);
    mutate(tampered);
    rehashRegistry(tampered);
    assert.throws(() => validateDesignInterviewSourceRegistry(tampered), /DESIGN_SOURCE_TRUST_ROOT_MISMATCH/);
  }
});

test("C17 Backend replica-routing closures remain capture-locked and deferred-only", () => {
  const expected = {
    "design-binding:backend:replica-read-routing-staleness-fit": ["ms-azure-pg-read-replica-offload-delay-fit", "ms-azure-pg-read-replica-workload-lag-threshold", "ms-azure-sql-read-after-write-primary-affinity"],
    "design-binding:backend:read-after-write-writer-affinity": ["ms-azure-sql-read-after-write-primary-affinity"]
  };
  const backend = curricula.find((curriculum) => curriculum.trackId === "backend-system-design-interview");
  const handoff = family.authoringHandoffs.find((entry) => entry.trackId === backend.trackId);
  assert.equal(handoff.deferredResolvedSlotBindings.length, 66);
  assert.equal(handoff.deferredResolvedReason, "These 66 Backend bindings are provenance-resolved but outside the pinned eight-slot Backend authoring-feasibility batch.");
  for (const [bindingId, anchorIds] of Object.entries(expected)) {
    const binding = registry.slotBindings.find((entry) => entry.bindingId === bindingId);
    const slot = backend.slots.find((entry) => entry.slotId === binding.slotId);
    assert.deepEqual(binding.anchorIds, anchorIds);
    assert.deepEqual(slot.sourceRequirements, { resolutionState: "resolved_exact_direct", sourceBindingId: bindingId });
    assert.equal(slot.authoringStatus, "provenance_resolved_authoring_deferred");
    assert.ok(handoff.deferredResolvedSlotBindings.some((entry) => entry.bindingId === bindingId && entry.slotId === binding.slotId));
    assert.ok(!handoff.slotBindings.some((entry) => entry.bindingId === bindingId));
  }
  const pgCapture = registry.sourceCaptures.find((entry) => entry.sourceIds[0] === "microsoft-azure-postgresql-read-replicas-eae7640");
  const sqlCapture = registry.sourceCaptures.find((entry) => entry.sourceIds[0] === "microsoft-azure-sql-read-scale-out-b356462");
  assert.deepEqual([pgCapture.sha256, pgCapture.byteLength, sqlCapture.sha256, sqlCapture.byteLength], ["ba03a5cfedcbbe2b3c945fffe37c2ae2df10f61b46f64ab0ca9cecf1f0754730", 27717, "1a5bd756270014e328e457f34403c8841f2f697d5c91947ef858dc4ee7715292", 27273]);
  const wrongRights = structuredClone(registry); wrongRights.sourceCaptures.find((entry) => entry.captureId === pgCapture.captureId).rights.licenseEvidenceUrl = "https://example.test/license"; rehashRegistry(wrongRights);
  assert.throws(() => validateDesignInterviewSourceRegistry(wrongRights), /DESIGN_SOURCE_CAPTURE_RIGHTS_MISMATCH/);
  const wrongSource = structuredClone(registry); wrongSource.sourceRecords.find((entry) => entry.sourceId === "microsoft-azure-sql-read-scale-out-b356462").fileSha256 = pgCapture.sha256; rehashRegistry(wrongSource);
  assert.throws(() => validateDesignInterviewSourceRegistry(wrongSource), /DESIGN_SOURCE_TRUST_ROOT_MISMATCH/);
  const wrongBinding = structuredClone(registry); wrongBinding.slotBindings.find((entry) => entry.bindingId === "design-binding:backend:read-after-write-writer-affinity").slotId = "backend-system-design-interview:replication_and_read_distribution:choose_replication_and_failover_targets_from_rpo_and_rto:slot:owned-decision-diagnosis"; rehashRegistry(wrongBinding);
  assert.throws(() => validateDesignInterviewSourceRegistry(wrongBinding), /DESIGN_SOURCE_TRUST_ROOT_MISMATCH/);
  const promoted = structuredClone(family); const promotedBackend = promoted.authoringHandoffs.find((entry) => entry.trackId === backend.trackId); const index = promotedBackend.deferredResolvedSlotBindings.findIndex((entry) => entry.bindingId === "design-binding:backend:read-after-write-writer-affinity"); promotedBackend.slotBindings.push(promotedBackend.deferredResolvedSlotBindings.splice(index, 1)[0]);
  assert.throws(() => validateDesignInterviewFamilyConfig(promoted), /INVALID_DESIGN_FAMILY_CONTRACT/);
});

test("C18 Backend and OOD exact captures bind only their five deferred slots", () => {
  const expected = {
    "design-binding:backend:isolated-hot-key-dedicated-remappable-shard": ["ms-sharding-lookup-map-remaps-logical-to-physical-shard", "ms-sharding-volatile-tenant-dedicated-light-shard", "ms-sharding-overloaded-virtual-partition-redistribution-and-fanout-cost"],
    "design-binding:backend:optimistic-record-conflict-detection-low-contention": ["dotnet-adonet-optimistic-low-contention-lock-cost", "dotnet-adonet-version-or-original-value-conflict-test"],
    "design-binding:backend:user-visible-sli-trace-correlation-boundary": ["ms-waf-sli-quantifies-specific-customer-interaction-slo", "ms-waf-flow-reliability-target-customer-experience-boundary", "ms-waf-success-latency-and-noncritical-component-boundary", "otel160-logs-trace-correlation", "otel160-span-context-propagation"],
    "design-binding:ood:eventual-consistency-only-when-temporary-inconsistency-acceptable": ["dotnet-domain-events-bd038508-atomic-versus-eventual-consistency"],
    "design-binding:ood:domain-event-past-fact-with-command-owner-preserved": ["dotnet-domain-events-bd038508-past-fact-command-handler-and-immutability"]
  };
  const expectedCaptures = {
    "dotnet-adonet-optimistic-concurrency-bd03850": ["e8022359f153da52e248cb4ef93bc0383daa27d16238aa65d185958e3bfb8f7a", 13403],
    "microsoft-architecture-center-sharding-7b4bf264": ["de03a643c6b64f0d9e772275c6fe436678608f10a5e86f63dd36976c0e51638a", 37127],
    "microsoft-azure-waf-reliability-targets-40aabbf": ["761cd503253b0f7b5a46fc453a209cdf5d899154dc1d550aabab1badcf35eac0", 29530],
    "microsoft-dotnet-domain-events-bd038508": ["ad0512a9aba0eb852175e09d0778fb425b0be0a6cf77584fe6d94d5e1fef68d6", 30756]
  };
  for (const [sourceId, [sha256, byteLength]] of Object.entries(expectedCaptures)) {
    const capture = registry.sourceCaptures.find((entry) => entry.sourceIds[0] === sourceId);
    assert.deepEqual([capture.sha256, capture.byteLength, capture.mediaType], [sha256, byteLength, "text/markdown"]);
    assert.equal(capture.rights.licenseEvidenceUrl, sourceId === "microsoft-architecture-center-sharding-7b4bf264" ? "https://github.com/MicrosoftDocs/architecture-center/blob/7b4bf26469bc45810c64406ad3cebdae4f60fb6b/README.md#legal-notices" : sourceId === "microsoft-azure-waf-reliability-targets-40aabbf" ? "https://github.com/MicrosoftDocs/well-architected/blob/40aabbf5a416b750d1c11fc9b5c85666c95b119a/LICENSE" : "https://github.com/dotnet/docs/blob/bd038508933775b801ebfe58540634f4024bfdf0/LICENSE");
  }
  for (const [bindingId, anchorIds] of Object.entries(expected)) {
    const binding = registry.slotBindings.find((entry) => entry.bindingId === bindingId);
    const slot = curricula.flatMap((curriculum) => curriculum.slots).find((entry) => entry.slotId === binding.slotId);
    const handoff = family.authoringHandoffs.find((entry) => entry.trackId === slot.trackId);
    assert.deepEqual(binding.anchorIds, anchorIds);
    assert.deepEqual(slot.sourceRequirements, { resolutionState: "resolved_exact_direct", sourceBindingId: bindingId });
    assert.equal(slot.authoringStatus, "provenance_resolved_authoring_deferred");
    assert.ok(handoff.deferredResolvedSlotBindings.some((entry) => entry.bindingId === bindingId && entry.slotId === binding.slotId));
    assert.ok(!handoff.slotBindings.some((entry) => entry.bindingId === bindingId));
  }
  const tampered = structuredClone(registry); tampered.sourceCaptures.find((entry) => entry.sourceIds[0] === "microsoft-dotnet-domain-events-bd038508").retrieval.commit = "0".repeat(40); rehashRegistry(tampered);
  assert.throws(() => validateDesignInterviewSourceRegistry(tampered), /DESIGN_SOURCE_CAPTURE_RETRIEVAL_MISMATCH/);
  const promoted = structuredClone(family); const backend = promoted.authoringHandoffs.find((entry) => entry.trackId === "backend-system-design-interview"); const index = backend.deferredResolvedSlotBindings.findIndex((entry) => entry.bindingId === "design-binding:backend:optimistic-record-conflict-detection-low-contention"); backend.slotBindings.push(backend.deferredResolvedSlotBindings.splice(index, 1)[0]);
  assert.throws(() => validateDesignInterviewFamilyConfig(promoted), /INVALID_DESIGN_FAMILY_CONTRACT/);
});

test("round-twenty binds eight deferred-only exact slots and rejects retired admissible source metadata", () => {
  const expected = ["design-binding:backend:limiting-resource-before-horizontal-scale", "design-binding:frontend:observed-user-behavior-architecture-reversal-threshold", "design-binding:frontend:field-web-vitals-assumption-test", "design-binding:frontend:react-stream-usable-shell-before-slow-region", "design-binding:frontend:otel-tail-latency-cohort-retention", "design-binding:frontend:otel-tail-error-cohort-retention", "design-binding:frontend:sampling-weight-and-inclusion-rule-interpretation", "design-binding:frontend:user-impact-runtime-cost-evidence-tradeoff"];
  assert.ok(expected.every((bindingId) => registry.slotBindings.some((binding) => binding.bindingId === bindingId)));
  for (const bindingId of expected) {
    const binding = registry.slotBindings.find((entry) => entry.bindingId === bindingId);
    const curriculum = curricula.find((entry) => binding.slotId.startsWith(`${entry.trackId}:`));
    const slot = curriculum.slots.find((entry) => entry.slotId === binding.slotId);
    assert.equal(slot.authoringStatus, "provenance_resolved_authoring_deferred");
    assert.equal(slot.deliveryInteraction.status, "provenance_resolved_authoring_deferred_runtime_not_admitted");
  }
  const inadmissible = structuredClone(registry);
  inadmissible.sourceRecords.find((source) => source.sourceId === "microsoft-architecture-center-caching-7b4bf264").admissible = true;
  rehashRegistry(inadmissible);
  assert.throws(() => validateDesignInterviewSourceRegistry(inadmissible), /INVALID_DESIGN_SOURCE_IDENTITY/);
});

test("round-twenty-one captures and bindings remain exact and cannot enter the authoring batch", () => {
  const expectedCaptures = {
    "microsoft-architecture-center-saga-7b4bf264": ["8d288d612c8e8563d257f360cefa196279c73fa215dd7b1af1470b3c3621a287", 11188],
    "microsoft-waf-architecture-decision-record-40aabbf": ["e00fcb82f232b6727c455eead6c83dfd194ed60d47d6c9be28b22bc33590ef5c", 4197],
    "playwright-docs-best-practices-js-07730b7": ["785e6244815ed457ceb0a9109e0ead34a114fd89b09c0689174a5b421eed8512", 19880],
    "aspnetcore-docs-model-validation-c67a801": ["16bce9725caaf674c6b31eb19aa1b40c307d9c569cc6056a7bb523b8f03b51e8", 30615],
    "edge-developer-pwa-background-syncs-dd024d8": ["510afa56501321f05458c2df38aa921a9d03c63c0cfff14182cf595df03d0705", 20497],
    "react-docs-use-client-b440d66": ["98761424e129b1317ab2d4b458ecd343e2cab13bbe09651d62d68e54f332667d", 20541]
  };
  for (const [sourceId, [sha256, byteLength]] of Object.entries(expectedCaptures)) {
    const capture = registry.sourceCaptures.find((entry) => entry.sourceIds[0] === sourceId);
    assert.deepEqual([capture.sha256, capture.byteLength, capture.mediaType], [sha256, byteLength, "text/markdown"]);
  }
  const expectedBindings = ["design-binding:backend:serialize-or-domain-merge-incompatible-writes", "design-binding:backend:rejected-alternative-and-reversal-condition", "design-binding:frontend:aspnet-cached-client-rule-not-authority", "design-binding:frontend:react-minimal-interactive-client-island", "design-binding:frontend:blazor-mixed-client-server-contract", "design-binding:frontend:playwright-real-browser-end-to-end-journey"];
  for (const bindingId of expectedBindings) {
    const binding = registry.slotBindings.find((entry) => entry.bindingId === bindingId);
    const slot = curricula.flatMap((curriculum) => curriculum.slots).find((entry) => entry.slotId === binding.slotId);
    const handoff = family.authoringHandoffs.find((entry) => entry.trackId === slot.trackId);
    assert.equal(slot.authoringStatus, "provenance_resolved_authoring_deferred");
    assert.ok(handoff.deferredResolvedSlotBindings.some((entry) => entry.bindingId === bindingId));
    assert.ok(!handoff.slotBindings.some((entry) => entry.bindingId === bindingId));
  }
  const wrongCapture = structuredClone(registry); wrongCapture.sourceCaptures.find((entry) => entry.sourceIds[0] === "playwright-docs-best-practices-js-07730b7").rights.licenseTextSha256 = "0".repeat(64); rehashRegistry(wrongCapture);
  assert.throws(() => validateDesignInterviewSourceRegistry(wrongCapture), /DESIGN_SOURCE_CAPTURE_RIGHTS_MISMATCH/);
  const promoted = structuredClone(family); const frontend = promoted.authoringHandoffs.find((entry) => entry.trackId === "frontend-system-design-interview"); const index = frontend.deferredResolvedSlotBindings.findIndex((entry) => entry.bindingId === "design-binding:frontend:playwright-real-browser-end-to-end-journey"); frontend.slotBindings.push(frontend.deferredResolvedSlotBindings.splice(index, 1)[0]);
  assert.throws(() => validateDesignInterviewFamilyConfig(promoted), /INVALID_DESIGN_FAMILY_CONTRACT/);
});

test("C22 adds only its 8 Backend and 19 Frontend provenance-resolved deferred bindings", () => {
  const backend = ["design-binding:backend:peak-read-write-fanout-sizing", "design-binding:backend:assumption-reversal-risk-ranking", "design-binding:backend:next-cheapest-observable-measurement", "design-binding:backend:dominant-query-update-data-model", "design-binding:backend:reject-unbounded-normalized-critical-read", "design-binding:backend:weakest-sufficient-cosmos-consistency", "design-binding:backend:revisit-quantified-requirement-change", "design-binding:backend:tradeoff-request-data-failure-visualization"];
  const frontend = ["design-binding:frontend:assistive-interaction-owned-design-contract", "design-binding:frontend:route-identity-state-lifetime", "design-binding:frontend:first-view-data-server-rendering", "design-binding:frontend:temporary-optimistic-projection", "design-binding:frontend:optimistic-failure-restores-prior-value", "design-binding:frontend:optimistic-converges-to-action-result", "design-binding:frontend:request-explicit-loading-state", "design-binding:frontend:request-network-success-state", "design-binding:frontend:request-network-error-state", "design-binding:frontend:stale-edit-version-conflict-detection", "design-binding:frontend:current-resource-version-protected-mutation", "design-binding:frontend:server-property-keyed-field-error", "design-binding:frontend:controlled-condition-performance-trace", "design-binding:frontend:late-media-reserved-dimensions", "design-binding:frontend:pending-work-quota-pressure-contract", "design-binding:frontend:retry-budget-exhaustion-user-action", "design-binding:frontend:reconnect-pending-work-version-check", "design-binding:frontend:authentication-pending-not-protected-success", "design-binding:frontend:protected-ui-server-authentication-state"];
  const captures = ["microsoft-waf-capacity-planning-40aabbf", "microsoft-waf-performance-maturity-model-40aabbf", "microsoft-waf-ongoing-support-40aabbf", "microsoft-waf-design-diagrams-40aabbf", "microsoft-waf-throttling-5b3f666", "microsoft-cosmos-plan-manage-costs-8bcc7de", "microsoft-cosmos-modeling-data-8bcc7de", "microsoft-cosmos-query-metrics-performance-8bcc7de", "microsoft-cosmos-consistency-levels-8bcc7de", "edge-developer-accessibility-design-dd024d8", "react-docs-use-optimistic-383a1e9", "react-docs-reacting-to-input-state-383a1e9", "edge-developer-performance-overview-dd024d8", "aspnetcore-docs-blazor-security-c67a801"];
  assert.equal(backend.length + frontend.length, 27);
  assert.ok(captures.every((sourceId) => registry.sourceCaptures.some((capture) => capture.sourceIds[0] === sourceId)));
  for (const bindingId of [...backend, ...frontend]) {
    const binding = registry.slotBindings.find((entry) => entry.bindingId === bindingId);
    const slot = curricula.flatMap((curriculum) => curriculum.slots).find((entry) => entry.slotId === binding.slotId);
    const handoff = family.authoringHandoffs.find((entry) => entry.trackId === slot.trackId);
    assert.equal(slot.authoringStatus, "provenance_resolved_authoring_deferred");
    assert.equal(slot.deliveryInteraction.status, "provenance_resolved_authoring_deferred_runtime_not_admitted");
    assert.ok(handoff.deferredResolvedSlotBindings.some((entry) => entry.bindingId === bindingId));
    assert.ok(!handoff.slotBindings.some((entry) => entry.bindingId === bindingId));
  }
  const promoted = structuredClone(family); const target = promoted.authoringHandoffs.find((entry) => entry.trackId === "frontend-system-design-interview"); const index = target.deferredResolvedSlotBindings.findIndex((entry) => entry.bindingId === frontend[0]); target.slotBindings.push(target.deferredResolvedSlotBindings.splice(index, 1)[0]);
  assert.throws(() => validateDesignInterviewFamilyConfig(promoted), /INVALID_DESIGN_FAMILY_CONTRACT/);
});

test("C23 admits exactly its six Backend, ten Frontend, and one OOD packet closures as deferred-only", () => {
  const expected = {
    "backend-system-design-interview": 6,
    "frontend-system-design-interview": 10,
    "object-oriented-design-interview": 1
  };
  const c23SourceIds = ["microsoft-waf-performance-test-40aabbf", "microsoft-waf-performance-monitoring-40aabbf", "kubernetes-rolling-deployment-3610f32", "microsoft-acr-image-lock-77ed42b", "microsoft-architecture-center-microservice-boundaries-4587bbd", "microsoft-waf-optimize-workload-flows-40aabbf", "microsoft-waf-workloads-40aabbf", "react-docs-build-app-from-scratch-383a1e9", "edge-developer-lighthouse-speed-dd024d8", "edge-developer-rendering-performance-dd024d8", "aspnetcore-docs-app-state-c67a801", "playwright-docs-mock-js-07730b7"];
  assert.equal(registry.sourceCaptures.filter((capture) => c23SourceIds.includes(capture.sourceIds[0])).length, 12);
  const bindings = registry.slotBindings.filter((binding) => ["design-binding:backend:tail-critical-path-resource", "design-binding:backend:dependency-timeout-error-budget-allocation", "design-binding:backend:kubernetes-compatible-window-artifact-rollback", "design-binding:backend:replace-invalid-component-boundary", "design-binding:backend:component-requirement-flow-traceability", "design-binding:backend:integrated-revisable-flow-case", "design-binding:frontend:url-owns-shareable-public-state", "design-binding:frontend:route-boundary-code-split-with-page-data", "design-binding:frontend:reject-serial-code-data-waterfall", "design-binding:frontend:defer-third-party-until-user-value", "design-binding:frontend:move-nonurgent-computation-off-interaction-main-thread", "design-binding:frontend:responsive-slot-aspect-ratio-stability", "design-binding:frontend:distinct-repairable-operation-error-state", "design-binding:frontend:offline-eviction-yields-explicit-unavailable-state", "design-binding:frontend:block-version-drift-until-atomic-client-activation", "design-binding:frontend:browser-performance-outcome-under-declared-route-data-device-network", "design-binding:ood:rejected-object-model-constraint-and-reversal"].includes(binding.bindingId));
  assert.deepEqual(Object.fromEntries(Object.keys(expected).map((trackId) => [trackId, bindings.filter((binding) => binding.slotId.startsWith(`${trackId}:`)).length])), expected);
  for (const binding of bindings) {
    const curriculum = curricula.find((entry) => binding.slotId.startsWith(`${entry.trackId}:`));
    const slot = curriculum.slots.find((entry) => entry.slotId === binding.slotId);
    assert.equal(slot.authoringStatus, "provenance_resolved_authoring_deferred");
    assert.equal(slot.deliveryInteraction.status, "provenance_resolved_authoring_deferred_runtime_not_admitted");
  }
});

test("C24 pins its six captures and B1/F10/O2 deferred-only closures", () => {
  const expectedCaptures = {
    "microsoft-waf-failure-mode-analysis-40aabbf": ["02523f8a404c1fe5f0dd613b62400cdd7bc5c0c894656eb7d5c1c9a0be3a3241", 15635],
    "edge-webview2-versioning-dd024d8": ["760b675fcf3e2e43d8da162081215f869d409accead6184532516837f08e5bf8", 18550],
    "aspnetcore-docs-blazor-virtualization-c67a801": ["279fa59e42b604f8d6714da717da579226ac326af7be49281d10996d737e862c", 30938],
    "aspnetcore-docs-cookie-authentication-c67a801": ["e037ecf48d5508b297a75cb25b443ad3d0f8bf74535bb2cf5f06d82ee06f249d", 27643],
    "microsoft-sql-transaction-locking-guide-b356462": ["e07b631634099af3311454cdfcc954a4797215ceb68b014c817a69cf0f6718f0", 181184],
    "microsoft-dotnet-exception-best-practices-bd038508": ["5575f4669a2a9b6be6c58cf91823c15f0bea426052514ba9b785151177d38b72", 22125]
  };
  for (const [sourceId, [sha256, byteLength]] of Object.entries(expectedCaptures)) {
    const capture = registry.sourceCaptures.find((entry) => entry.sourceIds[0] === sourceId);
    assert.deepEqual([capture.sha256, capture.byteLength, capture.mediaType], [sha256, byteLength, "text/markdown"]);
  }
  const expectedBindings = {
    "backend-system-design-interview": ["design-binding:backend:single-assumption-fma-reversal-ranking"],
    "frontend-system-design-interview": ["design-binding:frontend:observable-user-flow-completion-event", "design-binding:frontend:unsupported-browser-capability-is-explicit-degraded-or-update-state", "design-binding:frontend:privileged-policy-and-secrets-remain-server-side", "design-binding:frontend:actual-lcp-render-blocker-removed-or-deferred", "design-binding:frontend:large-list-visible-region-virtualization", "design-binding:frontend:field-percentiles-identify-affected-quantile-population", "design-binding:frontend:session-credential-generation-reject-or-renew", "design-binding:frontend:invalid-session-signout-and-explicit-sign-in-state", "design-binding:frontend:immutable-prior-containerized-client-artifact-rollback", "design-binding:frontend:rollback-prior-client-remains-server-api-compatible"],
    "object-oriented-design-interview": ["design-binding:ood:related-local-aggregate-uow-no-remote-or-human-latency", "design-binding:ood:resource-creation-retry-only-after-resettable-partial-state"]
  };
  for (const [trackId, bindingIds] of Object.entries(expectedBindings)) {
    const handoff = family.authoringHandoffs.find((entry) => entry.trackId === trackId);
    assert.equal(bindingIds.length, trackId === "frontend-system-design-interview" ? 10 : trackId === "object-oriented-design-interview" ? 2 : 1);
    for (const bindingId of bindingIds) {
      const binding = registry.slotBindings.find((entry) => entry.bindingId === bindingId);
      const curriculum = curricula.find((entry) => entry.trackId === trackId);
      const slot = curriculum.slots.find((entry) => entry.slotId === binding.slotId);
      assert.equal(slot.authoringStatus, "provenance_resolved_authoring_deferred");
      assert.equal(slot.deliveryInteraction.status, "provenance_resolved_authoring_deferred_runtime_not_admitted");
      assert.ok(handoff.deferredResolvedSlotBindings.some((entry) => entry.bindingId === bindingId && entry.slotId === binding.slotId));
      assert.ok(!handoff.slotBindings.some((entry) => entry.bindingId === bindingId));
    }
  }
  const twoPcNeedle = "use_two_phase_commit_only_when_partial_participant_outcomes_are_unacceptable_every_participant_can_durably_prepare_and_apply_the_final_coordinator_decision_and_the_case_accepts_potentially_indefinite_blocking_after_failure";
  const backend = curricula.find((curriculum) => curriculum.trackId === "backend-system-design-interview");
  const currentSlot = backend.slots.find((slot) => slot.slotId.includes(twoPcNeedle));
  const twoPcBinding = registry.slotBindings.find((binding) => binding.bindingId === "design-binding:backend:two-phase-commit-atomicity-blocking-boundary");
  const handoff = family.authoringHandoffs.find((entry) => entry.trackId === backend.trackId);
  assert.ok(currentSlot);
  assert.deepEqual(currentSlot.sourceRequirements, { resolutionState: "resolved_exact_direct", sourceBindingId: twoPcBinding.bindingId });
  assert.equal(currentSlot.authoringStatus, "provenance_resolved_authoring_deferred");
  assert.equal(currentSlot.deliveryInteraction.status, "provenance_resolved_authoring_deferred_runtime_not_admitted");
  assert.ok(handoff.deferredResolvedSlotBindings.some((entry) => entry.bindingId === twoPcBinding.bindingId && entry.slotId === currentSlot.slotId));
  assert.ok(!handoff.slotBindings.some((entry) => entry.bindingId === twoPcBinding.bindingId));
  const capture = registry.sourceCaptures.find((entry) => entry.sourceIds[0] === "narayana-transactions-overview-b57a371");
  assert.deepEqual([capture.sha256, capture.byteLength, capture.mediaType, capture.byteRepresentation], ["fb3a92aa8c2fb3d9be2c0bbc9912d8f6696a9d531e4235458730059cabf11e23", 19829, "text/asciidoc", "git_blob_bytes"]);
  assert.deepEqual(twoPcBinding.anchorIds, ["narayana-2pc-all-participants-atomic-outcome", "narayana-2pc-durable-prepare-final-decision-and-recovery", "narayana-2pc-indefinite-blocking-and-heuristic-integrity-risk"]);
  assert.match(registry.claims.find((claim) => claim.claimId === twoPcBinding.claimIds[0]).statement, /blocked indefinitely.*non-atomic outcome.*loss of integrity/);
  const unbound = structuredClone(family);
  unbound.authoringHandoffs.find((entry) => entry.trackId === backend.trackId).deferredResolvedSlotBindings = handoff.deferredResolvedSlotBindings.filter((entry) => entry.bindingId !== twoPcBinding.bindingId);
  assert.throws(() => validateDesignInterviewFamilyConfig(unbound), /INVALID_DESIGN_FAMILY_CONTRACT/);
});
