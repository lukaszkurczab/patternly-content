import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  APPROACH_CHALLENGE_FAMILY_COUNTS,
  loadApproachChallengeBank,
} from "../scripts/content/approach-challenge-bank.mjs";

const ROOT = path.resolve(fileURLToPath(new URL("../", import.meta.url)));
const TRACK = "coding-interview-dsa-problem-solving";
const TAXONOMY_FAMILY_IDS = new Set(Object.keys(APPROACH_CHALLENGE_FAMILY_COUNTS));

test("approach challenge registry aggregates exact 36/72 source with six Free pairs", async () => {
  const bank = await loadApproachChallengeBank({ rootDirectory: ROOT, taxonomyFamilyIds: TAXONOMY_FAMILY_IDS });
  assert.equal(bank.problemCount, 36);
  assert.equal(bank.questionCount, 72);
  assert.equal(bank.freeProblemCount, 6);
  assert.equal(bank.premiumProblemCount, 30);
  assert.deepEqual(bank.familyCounts, APPROACH_CHALLENGE_FAMILY_COUNTS);
  assert.equal(new Set(bank.problems.map(({ problemId }) => problemId)).size, 36);
  assert.equal(new Set(bank.problems.flatMap(({ approachQuestion, complexityQuestion }) => [approachQuestion.questionId, complexityQuestion.questionId])).size, 72);
  assert.deepEqual(bank.problems.map(({ problemId }) => problemId), [...bank.problems.map(({ problemId }) => problemId)].sort());
  assert.ok(bank.problems.slice(0, 6).every(({ primaryFamilyId, approachQuestion, complexityQuestion }) =>
    primaryFamilyId === "complexity_and_constraints" &&
    approachQuestion.nodeId === "complexity_and_constraints" &&
    complexityQuestion.nodeId === "complexity_and_constraints"));
});

test("approach challenge registry rejects source bytes that differ from the accepted hash", async (t) => {
  const rootDirectory = await mkdtemp(path.join(os.tmpdir(), "patternly-acm3-bank-"));
  t.after(() => rm(rootDirectory, { recursive: true, force: true }));
  await cp(path.join(ROOT, "config/approach-challenge-registries"), path.join(rootDirectory, "config/approach-challenge-registries"), { recursive: true });
  await cp(path.join(ROOT, "content/approach-challenges", TRACK), path.join(rootDirectory, "content/approach-challenges", TRACK), { recursive: true });

  const sourcePath = path.join(rootDirectory, "content/approach-challenges", TRACK, "complexity_and_constraints", "acm-b01-01.json");
  const source = await readFile(sourcePath, "utf8");
  await writeFile(sourcePath, `${source}\n`);
  await assert.rejects(
    () => loadApproachChallengeBank({ rootDirectory, taxonomyFamilyIds: TAXONOMY_FAMILY_IDS }),
    /source hash differs from registry/u
  );
});
