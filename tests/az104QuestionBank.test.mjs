import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { buildManifest, ROOT, AuthoringFailure } from "../scripts/authoring/lib/model.mjs";
import { validateManualBatch } from "../scripts/authoring/lib/contracts.mjs";

const root = join(process.cwd(), "manual", "source", "microsoft-azure-administrator-associate-az-104");
const walk = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => entry.isDirectory() ? walk(join(directory, entry.name)) : [join(directory, entry.name)]));
  return nested.flat();
};

test("AZ-104 authored batches cover complete canonical blocks with distinct sourced explanations", async () => {
  const paths = (await walk(root)).filter((path) => path.endsWith(".json")).sort();
  assert.ok(paths.length > 0, "at least one authored AZ-104 batch is required");
  const curriculum = JSON.parse(await readFile(join(process.cwd(), "config/curricula/microsoft-azure-administrator-associate-az-104.json"), "utf8"));
  const blocks = new Map(curriculum.blockPlans.map((block) => [block.blockId, block]));
  const sourceUrls = new Map(curriculum.sourceRecords.map((source) => [source.sourceId, source.url]));
  const batches = await Promise.all(paths.map(async (path) => JSON.parse(await readFile(path, "utf8"))));
  const items = batches.flatMap((batch) => batch.items);
  assert.ok(items.length <= curriculum.slots.length, "authored items cannot exceed the corrected curriculum");
  assert.equal(new Set(items.map((item) => item.itemId)).size, items.length, "item IDs must be unique");
  assert.equal(new Set(items.map((item) => item.slotId)).size, items.length, "each canonical slot must be represented once");
  assert.equal(new Set(items.map((item) => item.prompt)).size, items.length, "prompts must not be duplicated across slots");
  const seenBlocks = new Set();
  for (const batch of batches) {
    const block = blocks.get(batch.learningBlockId);
    assert.ok(block, `${batch.batchId} must reference a canonical block`);
    assert.equal(seenBlocks.has(batch.learningBlockId), false, `${batch.learningBlockId} must be authored once`);
    seenBlocks.add(batch.learningBlockId);
    assert.deepEqual([...batch.slotIds].sort(), [...block.slotIds].sort(), `${batch.learningBlockId} must contain every canonical slot exactly once`);
    assert.equal(batch.items.length, block.slotCount, `${batch.learningBlockId} item count must equal its canonical slot count`);
    const mix = { scenarioDecision: 0, configurationSequence: 0, troubleshootingEffectiveState: 0, toolOrIacCommand: 0, boundaryOrContrast: 0 };
    for (const item of batch.items) {
      const suffix = item.slotId.match(/slot:([^:]+)-\d+$/)?.[1];
      const kind = { "scenario-decision": "scenarioDecision", "configuration-sequence": "configurationSequence", "troubleshooting-effective-state": "troubleshootingEffectiveState", "tool-or-iac": "toolOrIacCommand", "boundary-or-contrast": "boundaryOrContrast" }[suffix];
      assert.ok(kind, `${item.itemId} must use a canonical question-mix slot`);
      mix[kind] += 1;
      const boundUrls = item.sourceBinding.sourceRefs.map((sourceRef) => sourceUrls.get(sourceRef) ?? sourceRef);
      assert.ok(boundUrls.includes(item.feedback?.Details?.url), `${item.itemId} Details.url must resolve through its source binding`);
    }
    assert.deepEqual(mix, block.questionMix, `${batch.learningBlockId} question mix must match the canonical plan`);
  }
  for (const item of items) {
    assert.match(item.feedback?.Details?.url ?? "", /^https:\/\/learn\.microsoft\.com\//, `${item.itemId} must cite Microsoft Learn in feedback details`);
    assert.doesNotMatch(item.prompt, /Resolve the administrator decision described by|slot \d+ of \d+/i, `${item.itemId} contains a generic slot placeholder`);
    assert.doesNotMatch(JSON.stringify(item.interaction.options), /Treat this boundary as irrelevant|Retry the original operation unchanged|Select a familiar adjacent Azure service/i, `${item.itemId} contains a generic distractor`);
  }
});

test("AZ-104 authoring rejects an explanation URL outside its exact source binding", async () => {
  const path = join(root, "entra_identity_lifecycle_and_authentication", "AZ104-N01-B01.json");
  const batch = JSON.parse(await readFile(path, "utf8"));
  const manifestResult = await buildManifest(ROOT);
  await assert.doesNotReject(() => validateManualBatch(ROOT, batch, { manifestResult, actualPath: "manual/source/microsoft-azure-administrator-associate-az-104/entra_identity_lifecycle_and_authentication/AZ104-N01-B01.json" }));
  const tampered = structuredClone(batch);
  tampered.items[0].feedback.Details.url = "https://learn.microsoft.com/en-us/entra/fundamentals/compare";
  await assert.rejects(
    () => validateManualBatch(ROOT, tampered, { manifestResult, actualPath: "manual/source/microsoft-azure-administrator-associate-az-104/entra_identity_lifecycle_and_authentication/AZ104-N01-B01.json" }),
    (error) => error instanceof AuthoringFailure && error.code === "FEEDBACK_SOURCE_MISMATCH"
  );
});
