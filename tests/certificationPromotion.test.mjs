import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { CANONICAL_CERTIFICATION_REGISTRY_TRACK_IDS, loadCertificationObjectiveRegistries } from "../scripts/curriculum/certification-objective-registries.mjs";
import { buildCertificationAuthoringBacklog, firstSafeSlotIds, validateCertificationPromotion } from "../scripts/curriculum/certification-promotion.mjs";

const root = process.cwd();
const trackIds = [...CANONICAL_CERTIFICATION_REGISTRY_TRACK_IDS];
const curricula = await Promise.all(trackIds.map(async (trackId) => JSON.parse(await readFile(`config/curricula/${trackId}.json`, "utf8"))));
const registries = await loadCertificationObjectiveRegistries({ root });
const valid = (mutate) => { const copy = structuredClone(curricula); mutate(copy); return validateCertificationPromotion(copy, registries); };
const recomputeContentFingerprint = (curriculum) => { const { promotionProvenance, contentFingerprint, ...payload } = curriculum; curriculum.contentFingerprint = createHash("sha256").update(JSON.stringify(payload)).digest("hex"); };

test("Stage04 promotion validates every canonical direct certification config and partitions every slot", () => {
  const result = validateCertificationPromotion(curricula, registries);
  const expectedSlotCount = curricula.reduce((sum, curriculum) => sum + curriculum.slots.length, 0);
  assert.equal(result.trackCount, trackIds.length);
  assert.equal(result.slotCount, expectedSlotCount);
  assert.deepEqual(result.firstSafeBatch.slotIds, firstSafeSlotIds);
  assert.equal(result.authoringBatches.flatMap((batch) => batch.slotIds).length, expectedSlotCount);
});

test("Stage04 promotion rejects a duplicate semantic identity across tracks", () => {
  assert.throws(() => valid((copy) => { copy[1].slots[0].dedupeFingerprint = copy[0].slots[0].dedupeFingerprint; }), /CERTIFICATION_PROMOTION_DUPLICATE_SEMANTIC_IDENTITY/);
});

test("Stage04 promotion rejects runtime admission and a malformed first-batch slot", () => {
  assert.throws(() => valid((copy) => { copy[0].admission.runtimeAdmission = "admitted"; }), /CERTIFICATION_PROMOTION_NON_RUNTIME_ACCOUNTING/);
  const copy = structuredClone(curricula); copy[4].slots = copy[4].slots.filter((slot) => slot.slotId !== firstSafeSlotIds[0]);
  assert.throws(() => buildCertificationAuthoringBacklog(copy), /CERTIFICATION_PROMOTION_FIRST_BATCH_MISSING/);
});

test("Stage04 promotion rejects retired aggregate declarations after a valid fingerprint recomputation", () => {
  for (const field of ["requiredVariantCount", "operationVariantCounts", "candidateNodes", "boundaryRelationshipRemap", "derivedCounts"]) {
    const copy = structuredClone(curricula);
    copy[1][field] = field === "operationVariantCounts" ? { diagnosis: 1 } : field === "candidateNodes" ? ["terraform_configuration_foundations"] : { retained: false };
    recomputeContentFingerprint(copy[1]);
    assert.throws(() => validateCertificationPromotion(copy, registries), /CERTIFICATION_PROMOTION_RETIRED_DECLARATION/);
  }
});
