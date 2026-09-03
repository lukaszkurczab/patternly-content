import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';
import { ROOT, buildManifest } from '../scripts/authoring/lib/model.mjs';
import { validateManualBatch } from '../scripts/authoring/lib/contracts.mjs';
import { validateCertificationCurriculum } from '../scripts/curriculum/certification-curricula.mjs';
import { validateCertificationObjectiveRegistry } from '../scripts/curriculum/certification-objective-registries.mjs';

const trackId = 'claude-certified-architect-professional-certification';
const read = async (path) => JSON.parse(await readFile(join(ROOT, path), 'utf8'));
const registryPath = `config/certification-objective-registries/${trackId}.json`;
const registry = await read(registryPath);
Object.defineProperty(registry, '__registryPath', { value: registryPath });
const curriculum = await read(`config/curricula/${trackId}.json`);
const brief = await read(`docs/track-briefs/${trackId}.json`);
const sources = await read(`config/certification-source-registries/${trackId}.json`);
const batches = await Promise.all(curriculum.blockPlans.map((block) => read(`manual/source/${trackId}/${block.nodeId}/${block.blockId}.json`)));
const items = batches.flatMap((batch) => batch.items);
const decisionMatrix = await read('evidence/certification/2026-09-03-ccarp-decision-matrix.json');

test('CCAR-P authored bank implements every reviewed decision and removes only explicit merges', () => {
  const rows = decisionMatrix.flatMap((group) => [...group.existing, ...group.additions]);
  const activeRows = rows.filter((row) => row.action !== 'merge');
  const itemById = new Map(items.map((item) => [item.itemId, item]));
  const slotById = new Map(curriculum.slots.map((slot) => [slot.slotId, slot]));
  const anchorById = new Map(sources.anchorRecords.map((anchor) => [anchor.anchorId, anchor]));
  assert.equal(new Set(rows.map((row) => row.itemId)).size, rows.length);
  assert.deepEqual([...itemById.keys()].sort(), activeRows.map((row) => row.itemId).sort());
  for (const group of decisionMatrix) {
    for (const row of [...group.existing, ...group.additions]) {
      if (row.action === 'merge') {
        assert.ok(!itemById.has(row.itemId), `${row.itemId}: merged duplicate remains`);
        assert.equal(itemById.get(row.mergeIntoItemId)?.learningBlockId, group.blockId);
        continue;
      }
      const item = itemById.get(row.itemId);
      const slot = slotById.get(item.slotId);
      assert.equal(item.learningBlockId, group.blockId);
      assert.equal(item.nodeId, group.nodeId);
      assert.equal(slot.primarySimulationObjectiveRef, group.objectiveId);
      assert.equal(slot.learningOperation, row.learningOperation);
      assert.equal(item.interaction.selectionMode, row.selectionMode);
      assert.equal(item.feedback.Details.url, row.sourceUrl);
      assert.ok(item.sourceBinding.anchorIds.some((id) => {
        const anchor = anchorById.get(id);
        return anchor?.section === row.sourceSection && anchor.claim === row.sourceClaim;
      }), `${row.itemId}: reviewed mechanism anchor changed`);
    }
  }
});

// Protect the distinction between the Professional blueprint and Foundations,
// and between documented exam facts and Patternly practice behavior.
test('CCAR-P binds the seven-domain Professional blueprint without inventing provider behavior', () => {
  validateCertificationObjectiveRegistry(registry);
  validateCertificationCurriculum(curriculum, { brief, registry });
  assert.equal(registry.examVariant, 'CCAR-P');
  assert.deepEqual(registry.domains.map((domain) => domain.weight.percent), [17, 13, 19, 16, 14, 14, 7]);
  assert.deepEqual(registry.domains.map((domain) => registry.objectives.filter((objective) => objective.parentDomainId === domain.domainId).length), [6, 5, 8, 6, 5, 5, 3]);
  assert.equal(registry.examProfile.itemCountOrRange.value, 63);
  assert.equal(registry.examProfile.duration.value.minutes, 120);
  assert.equal(registry.examProfile.sectionRules.value.passingScaledScore, 720);
  assert.equal(registry.examProfile.sectionRules.value.rawPercentageConversion, 'not_documented');
  assert.equal(registry.examProfile.navigation.status, 'not_documented');
  assert.equal(registry.examProfile.faithfulSimulationEligibility.allowedPatternlyClaim, 'practice_simulation_not_provider_faithful');
});

test('CCAR-P complete source batches resolve through canonical authoring with exact feedback and source bindings', async () => {
  const result = await buildManifest(ROOT);
  const manifest = result.manifest.tracks.find((track) => track.trackId === trackId);
  assert.ok(manifest, 'track must be discovered by the canonical authoring roster');
  assert.equal(manifest.blockedItemCount, 0);
  assert.equal(manifest.authoringAdmittedItemCount, items.length);
  assert.equal(items.length, curriculum.targetItemCount);
  const sourceMap = new Map(sources.sources.map((source) => [source.sourceId, source]));
  const anchorMap = new Map(sources.anchorRecords.map((anchor) => [anchor.anchorId, anchor]));
  assert.equal(sourceMap.size, sources.sources.length);
  assert.equal(anchorMap.size, sources.anchorRecords.length);
  const usedSources = new Set(), usedAnchors = new Set();
  for (const source of sources.sources) {
    const url = new URL(source.url);
    assert.equal(url.protocol, 'https:');
    assert.ok([...registry.officialSourceHosts, ...registry.firstPartyDocumentationHosts].includes(url.hostname), `${source.sourceId}: untrusted host`);
  }
  for (const batch of batches) {
    await validateManualBatch(ROOT, batch, { manifestResult: result, actualPath: `manual/source/${trackId}/${batch.nodeId}/${batch.learningBlockId}.json` });
    for (const item of batch.items) {
      const references = item.sourceBinding.sourceRefs.map((id) => {
        usedSources.add(id);
        assert.ok(sourceMap.has(id), `${item.itemId}: unknown source ${id}`);
        return sourceMap.get(id);
      });
      assert.ok(references.some((source) => source.url === item.feedback.Details.url), `${item.itemId}: feedback URL must be bound`);
      for (const id of item.sourceBinding.anchorIds) {
        usedAnchors.add(id);
        const anchor = anchorMap.get(id);
        assert.ok(anchor?.section?.trim() && anchor?.claim?.trim(), `${item.itemId}: unresolved source section/claim`);
        assert.ok(item.sourceBinding.sourceRefs.includes(anchor.sourceId), `${item.itemId}: anchor belongs to another document`);
        assert.equal(sourceMap.get(anchor.sourceId).url, item.feedback.Details.url);
      }
      assert.equal(item.authoringProvenance.approvalStatus, 'unapproved');
      if (item.interaction.selectionMode === 'multiple') {
        assert.match(item.prompt, /select (?:two|2)/i, `${item.itemId}: state response count`);
        assert.equal(item.interaction.acceptedOptionIds.length, 2);
      }
    }
  }
  assert.equal(usedSources.size, sourceMap.size, 'no unused source records');
  assert.equal(usedAnchors.size, anchorMap.size, 'no orphan mechanism anchors');
  const tampered = structuredClone(batches[0]);
  tampered.items[0].sourceBinding.anchorIds = ['unknown-anchor'];
  await assert.rejects(validateManualBatch(ROOT, tampered, { manifestResult: result }), (error) => error.code === 'SOURCE_BINDING_MISMATCH');
});

test('CCAR-P has distinct practice decisions for every objective and a feasible 63-item form', () => {
  assert.equal(new Set(items.map((item) => item.itemId)).size, items.length);
  assert.equal(new Set(items.map((item) => item.prompt.toLowerCase().replace(/\s+/g, ' ').trim())).size, items.length);
  for (const objective of registry.objectives) {
    const slots = curriculum.slots.filter((slot) => slot.officialObjectiveRefs.includes(objective.objectiveId));
    assert.deepEqual([...new Set(slots.map((slot) => slot.learningOperation))].sort(), ['boundary', 'diagnosis', 'selection', 'transfer']);
    assert.equal(new Set(slots.map((slot) => slot.expectedOutcome.resolution)).size, slots.length, objective.objectiveId);
    assert.ok(slots.some((slot) => slot.deliveryInteraction.selectionMode === 'multiple'), objective.objectiveId);
  }
  const allocations = curriculum.examSimulationBlueprint.practiceForm.domainAllocation;
  assert.deepEqual(allocations.map((entry) => entry.itemCount), [11, 8, 12, 10, 9, 9, 4]);
  for (const allocation of allocations) {
    const domainSlots = allocation.selectedSlotIds.map((id) => curriculum.slots.find((slot) => slot.slotId === id));
    assert.ok(domainSlots.every((slot) => slot?.primarySimulationDomainId === allocation.domainId));
    assert.ok(domainSlots.some((slot) => slot.deliveryInteraction.selectionMode === 'single'));
    assert.ok(domainSlots.some((slot) => slot.deliveryInteraction.selectionMode === 'multiple'));
  }
  const selected = allocations.flatMap((entry) => entry.selectedSlotIds);
  assert.equal(selected.length, 63);
  assert.equal(new Set(selected).size, 63);
  const selectedSlots = selected.map((id) => curriculum.slots.find((slot) => slot.slotId === id));
  assert.ok(selectedSlots.every(Boolean));
  assert.equal(new Set(selectedSlots.map((slot) => slot.primarySimulationObjectiveRef)).size, 38);
  for (const node of curriculum.nodes) assert.ok(node.slotCount >= 10, `${node.nodeId}: practice session capacity`);
});

test('CCAR-P contrast and integrated decisions cover every objective', () => {
  const rows = decisionMatrix.flatMap((group) => [...group.existing, ...group.additions]).filter((row) => row.action !== 'merge');
  const rowById = new Map(rows.map((row) => [row.itemId, row]));
  const objectiveByItemId = new Map(decisionMatrix.flatMap((group) => [...group.existing, ...group.additions].map((row) => [row.itemId, group.objectiveId])));
  const objectives = new Set(registry.objectives.map((objective) => objective.objectiveId));
  for (const group of decisionMatrix) {
    const owned = [...group.existing, ...group.additions].filter((row) => row.action !== 'merge');
    assert.ok(owned.some((row) => row.contrastItemId), `${group.objectiveId}: no reviewed contrast`);
    assert.ok(owned.some((row) => row.secondaryObjectiveIds?.length && row.integrationConstraint?.trim()), `${group.objectiveId}: no integrated scenario`);
  }
  for (const row of rows) {
    if (row.contrastItemId) {
      assert.notEqual(row.contrastItemId, row.itemId);
      assert.ok(rowById.has(row.contrastItemId), `${row.itemId}: unknown contrast target`);
      assert.equal(objectiveByItemId.get(row.contrastItemId), objectiveByItemId.get(row.itemId), `${row.itemId}: contrast must have the same primary objective`);
      assert.ok(row.counterfactual?.trim() && row.decisiveConstraint?.trim());
    }
    for (const secondary of row.secondaryObjectiveIds ?? []) {
      assert.ok(objectives.has(secondary) && secondary !== objectiveByItemId.get(row.itemId), row.itemId);
    }
  }
});

test('CCAR-P provides three disjoint exam forms and three disjoint practice sets per domain', async () => {
  const witness = await read('evidence/certification/2026-09-03-ccarp-practice-forms.json');
  const itemById = new Map(items.map((item) => [item.itemId, item]));
  const slotById = new Map(curriculum.slots.map((slot) => [slot.slotId, slot]));
  const rows = decisionMatrix.flatMap((group) => [...group.existing, ...group.additions]).filter((row) => row.action !== 'merge');
  const pairs = rows.filter((row) => row.contrastItemId).map((row) => [row.itemId, row.contrastItemId]);
  const allocations = curriculum.examSimulationBlueprint.practiceForm.domainAllocation;
  function verifySet(ids, count, domainId) {
    assert.equal(ids.length, count);
    assert.equal(new Set(ids).size, ids.length);
    const selected = new Set(ids);
    for (const [left, right] of pairs) assert.ok(!(selected.has(left) && selected.has(right)), `${left}/${right}: contrast pair leaks within one set`);
    const slots = ids.map((id) => {
      assert.ok(itemById.has(id), `unknown witness item ${id}`);
      return slotById.get(itemById.get(id).slotId);
    });
    const domains = domainId ? allocations.filter((domain) => domain.domainId === domainId) : allocations;
    for (const domain of domains) {
      const owned = slots.filter((slot) => slot.primarySimulationDomainId === domain.domainId);
      assert.equal(owned.length, domainId ? count : domain.itemCount);
      assert.deepEqual([...new Set(owned.map((slot) => slot.deliveryInteraction.selectionMode))].sort(), ['multiple', 'single']);
      const expected = registry.objectives.filter((objective) => objective.parentDomainId === domain.domainId).map((objective) => objective.objectiveId).sort();
      assert.deepEqual([...new Set(owned.map((slot) => slot.primarySimulationObjectiveRef))].sort(), expected);
    }
  }
  assert.equal(witness.examForms.length, 3);
  assert.equal(new Set(witness.examForms.map((form) => form.formId)).size, 3);
  for (const form of witness.examForms) verifySet(form.itemIds, 63);
  const examIds = witness.examForms.flatMap((form) => form.itemIds);
  assert.equal(new Set(examIds).size, 189);
  assert.deepEqual(witness.domainPractice.map((domain) => domain.domainId).sort(), allocations.map((domain) => domain.domainId).sort());
  for (const domain of witness.domainPractice) {
    assert.equal(domain.sets.length, 3);
    assert.equal(new Set(domain.sets.map((set) => set.setId)).size, 3);
    for (const set of domain.sets) verifySet(set.itemIds, 10, domain.domainId);
    assert.equal(new Set(domain.sets.flatMap((set) => set.itemIds)).size, 30);
  }
});
