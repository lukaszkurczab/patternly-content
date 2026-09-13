import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const profile = JSON.parse(readFileSync(
  new URL("../config/free-node-experience-profiles/claude-certified-architect-professional-certification.json", import.meta.url),
  "utf8",
));
const brief = JSON.parse(readFileSync(
  new URL("../docs/track-briefs/claude-certified-architect-professional-certification.json", import.meta.url),
  "utf8",
));

test("Claude Focus Practice v2 is the only selectable-feedback mode in its immutable Free-node profile", () => {
  assert.equal(profile.profileVersion, "2");
  assert.equal(brief.freeNodeExperience.profileVersion, profile.profileVersion);

  const focus = profile.modes.find((mode) => mode.modeId === "certification-focus-practice");
  assert.deepEqual(focus, {
    configurationId: "claude-certified-architect-professional-certification:free:focus-v2",
    configurationVersion: "2",
    modeId: "certification-focus-practice",
    blueprintModeId: "certification-focus-practice",
    availability: "immediate",
    requestedLengths: [10, 20, 40],
    defaultRequestedLength: 10,
    selection: {
      kind: "exact_free_node",
      freeNodeId: "solution_design_and_architecture",
      itemSource: "package_items",
      requireUniqueItemIds: true,
    },
    feedbackOptions: ["afterEachAnswer", "atSessionEnd"],
    reinsertPolicy: "disabled",
  });

  for (const mode of profile.modes.filter((candidate) => candidate.modeId !== focus.modeId)) {
    assert.equal(Object.hasOwn(mode, "feedbackOptions"), false);
  }
});
