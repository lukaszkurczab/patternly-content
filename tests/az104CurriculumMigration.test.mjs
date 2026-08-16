import assert from "node:assert/strict";
import test from "node:test";
import { loadCurricula } from "../scripts/curriculum/curricula.mjs";

test("AZ-104 curriculum matches the corrected workbook topology", async () => {
  const curriculum = (await loadCurricula()).find((entry) => entry.trackId === "microsoft-azure-administrator-associate-az-104");
  assert.ok(curriculum);
  assert.equal(curriculum.curriculumVersion, "2026.08.15");
  assert.equal(curriculum.nodes.length, 9);
  assert.equal(curriculum.blockPlans.length, 75);
  assert.equal(curriculum.targetPlans.length, 75);
  assert.equal(curriculum.slots.length, 1288);
  assert.equal(curriculum.targetItemCount, 1288);
  assert.equal(curriculum.authoringItemCount, 1288);
  assert.equal(curriculum.admission.questionsAuthored, 0);
});
