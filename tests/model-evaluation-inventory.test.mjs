import assert from "node:assert/strict";
import test from "node:test";

import { createInventory, inventoryBytes } from "../scripts/model-evaluation/inventory.mjs";

test("nine canonical banks report AWS and Claude maintenance differences from the frozen baseline", async () => {
  const first = await createInventory();
  const second = await createInventory();
  assert.equal(inventoryBytes(first), inventoryBytes(second));
  assert.deepEqual(first.observed, { tracks: 9, nodes: 117, mentalUnits: 943, questions: 16622 });
  assert.equal(first.status, "blocked_baseline");
  assert.deepEqual(first.differences, [
    { key: "mentalUnits", expected: 932, observed: 943 },
    { key: "questions", expected: 16041, observed: 16622 },
    { trackId: "aws-certified-solutions-architect-associate", key: "mentalUnits", expected: 134, observed: 145 },
    { trackId: "aws-certified-solutions-architect-associate", key: "questions", expected: 2568, observed: 2604 },
    { trackId: "claude-certified-architect-professional-certification", key: "questions", expected: 300, observed: 845 },
  ]);
  assert.equal(first.tracks.length, 9);
  assert.equal(first.tracks.flatMap((track) => track.nodes.flatMap((node) => node.mentalUnits.flatMap((unit) => unit.items))).length, 16622);
});
