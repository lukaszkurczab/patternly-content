import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { validateApproachChallengeBlueprint } from "../scripts/content/approach-challenge-blueprint.mjs";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("Coding Interview track config exposes the exact versioned Approach Challenge blueprint", async () => {
  const config = JSON.parse(await readFile(path.join(rootDirectory, "config/tracks/coding-interview-dsa-problem-solving.json"), "utf8"));
  const blueprint = config.modeConfiguration.approachChallengeBlueprint;
  assert.equal(validateApproachChallengeBlueprint(blueprint), blueprint);
  assert.equal(blueprint.modeId, "coding-interview-approach-challenge");
  assert.deepEqual(blueprint.requestedProblemCounts, [5, 10, 20]);
  assert.equal(blueprint.defaultRequestedProblemCount, 5);
  assert.equal(blueprint.occurrencesPerProblem, 2);
  assert.deepEqual(blueprint.defaultDifficulties, ["easy", "medium"]);
  assert.equal(blueprint.timerKind, "none");
});

test("blueprint validation rejects drift, unknown fields and invalid session lengths", async () => {
  const config = JSON.parse(await readFile(path.join(rootDirectory, "config/tracks/coding-interview-dsa-problem-solving.json"), "utf8"));
  const source = config.modeConfiguration.approachChallengeBlueprint;
  for (const mutate of [
    (blueprint) => { blueprint.defaultRequestedProblemCount = 10; },
    (blueprint) => { blueprint.requestedProblemCounts = [5, 10, 15]; },
    (blueprint) => { blueprint.timerKind = "foreground_countdown"; },
    (blueprint) => { blueprint.unknown = true; },
  ]) {
    const candidate = structuredClone(source);
    mutate(candidate);
    assert.throws(() => validateApproachChallengeBlueprint(candidate), /Approach Challenge blueprint/u);
  }
});
