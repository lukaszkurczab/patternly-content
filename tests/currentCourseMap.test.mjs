import assert from "node:assert/strict";
import test from "node:test";

import { inspectCurrentClaudeCourseMap } from "../scripts/content-audit/verify-claude-course-map.mjs";

test("current Claude source links and taxonomy report current mappings without archived question snapshots", async () => {
  const result = await inspectCurrentClaudeCourseMap();
  assert.equal(result.schemaVersion, "patternly-current-claude-course-map-v1");
  assert.equal(result.status, "CURRENT_SOURCE_WITH_UNMAPPED_ITEMS");
  assert.equal(result.questionCount, 982);
  assert.equal(result.courseLinkedQuestionCount, 963);
  assert.equal(result.missingCourseLinkCount, 19);
  assert.equal(result.currentCourseCount, 5);
  assert.equal(result.mappedObjectiveUnitCount, 38);
  assert.deepEqual(result.unmappedObjectiveUnits, [
    "CCARP-D01-O07", "CCARP-D01-O08", "CCARP-D01-O09", "CCARP-D03-O09", "CCARP-D03-O10",
    "CCARP-D04-O07", "CCARP-D05-O06", "CCARP-D05-O07", "CCARP-D05-O08", "CCARP-D05-O09",
    "CCARP-D06-O06", "CCARP-D06-O07", "CCARP-D07-O04", "CCARP-D07-O05", "CCARP-D07-O06",
  ]);
  assert.equal(result.objectiveRegistryCount, 38);
  assert.doesNotMatch(JSON.stringify(result), /questionSha256|rationale|before|after/u);
});
