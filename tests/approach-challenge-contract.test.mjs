import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import Ajv2020 from "../../patternly/node_modules/ajv/dist/2020.js";
import {
  APPROACH_CHALLENGE_SOURCE_ROOT,
  validateApproachChallengeFamily,
  validateApproachChallengeProblem,
  validateApproachChallengeProblemRef,
} from "../scripts/content/approach-challenge-contract.mjs";
import { scoreQuestion } from "../scripts/content/question-contract.mjs";

const fixtureRoot = new URL("./fixtures/approach-challenge/", import.meta.url);
const fixture = async (name) => JSON.parse(await readFile(new URL(name, fixtureRoot), "utf8"));

test("paired JSON Schema accepts pair fixtures while ordinary question schema keeps its closed type set", async () => {
  const questionSchema = JSON.parse(await readFile(new URL("../schemas/content/question.schema.json", import.meta.url), "utf8"));
  const pairedSchema = JSON.parse(await readFile(new URL("../schemas/content/approach-challenge-problem.schema.json", import.meta.url), "utf8"));
  const ajv = new Ajv2020({ strict: false, allErrors: true });
  ajv.addSchema(questionSchema);
  const validatePair = ajv.compile(pairedSchema);
  const validateQuestion = ajv.compile(questionSchema);
  for (const name of ["W01.json", "W02.json", "W03.json", "W04.json"]) {
    const value = await fixture(name);
    assert.equal(validatePair(value), true, `${name}: ${ajv.errorsText(validatePair.errors)}`);
    assert.equal(validateQuestion(value.approachQuestion), false, "approach_choice remains outside ordinary canonical question types");
  }
});

test("all author seed problems satisfy the producer contract", async () => {
  for (const name of ["W01.json", "W02.json", "W03.json", "W04.json"]) {
    assert.deepEqual(validateApproachChallengeProblem(await fixture(name)), [], name);
  }
  const partial = await fixture("W02.json");
  assert.equal(scoreQuestion(partial.approachQuestion, { type: "approach_choice", optionId: "B" }).status, "partial");
  assert.equal(scoreQuestion(partial.approachQuestion, { type: "approach_choice", optionId: "C" }).status, "incorrect");
});

test("producer contract rejects stage mismatch, foreign track, and a mismatched problem pin", async () => {
  const value = await fixture("W01.json");
  const mismatch = structuredClone(value);
  mismatch.complexityQuestion.mentalUnitId = "foreign-unit";
  assert.ok(validateApproachChallengeProblem(mismatch).some((error) => error.includes("both stages must match")));

  const foreign = structuredClone(value);
  foreign.trackId = "foreign-track";
  assert.ok(validateApproachChallengeProblem(foreign).some((error) => error.includes("foreign track")));

  const pin = { contentVersion: "coding-2026-10", artifactSha256: "a".repeat(64) };
  const ref = {
    trackId: value.trackId,
    problemId: value.problemId,
    problemVersion: value.problemVersion,
    contentVersion: pin.contentVersion,
    artifactSha256: pin.artifactSha256,
    approachQuestionId: value.approachQuestion.questionId,
    complexityQuestionId: value.complexityQuestion.questionId,
    analyzedApproachId: value.analyzedApproachId,
  };
  assert.deepEqual(validateApproachChallengeProblemRef(ref, value, pin), []);
  assert.ok(validateApproachChallengeProblemRef({ ...ref, complexityQuestionId: "other-stage" }, value, pin).some((error) => error.includes("foreign stage")));
});

test("producer contract rejects analyzed targets graded partial or incorrect", async () => {
  const value = await fixture("W01.json");
  for (const grade of ["partial", "incorrect"]) {
    const changed = structuredClone(value);
    const target = changed.approachQuestion.interaction.options.find((option) => option.grade === grade);
    assert.ok(target, `fixture must include a ${grade} option`);
    changed.analyzedApproachId = target.approachId;
    assert.ok(validateApproachChallengeProblem(changed).some((error) => error.includes("must reference a correct approach option")), grade);
  }
});

test("family validator checks the exact author path, family taxonomy, file identity, and JSON contract", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "patternly-approach-challenge-"));
  try {
    await mkdir(path.join(tempRoot, "config", "tracks"), { recursive: true });
    await mkdir(path.join(tempRoot, "config", "taxonomy"), { recursive: true });
    await copyFile("config/tracks/coding-interview-dsa-problem-solving.json", path.join(tempRoot, "config", "tracks", "coding-interview-dsa-problem-solving.json"));
    await copyFile("config/taxonomy/coding-interview-dsa-problem-solving.json", path.join(tempRoot, "config", "taxonomy", "coding-interview-dsa-problem-solving.json"));
    const value = await fixture("W01.json");
    const familyRoot = path.join(tempRoot, APPROACH_CHALLENGE_SOURCE_ROOT, value.primaryFamilyId);
    await mkdir(familyRoot, { recursive: true });
    await writeFile(path.join(familyRoot, `${value.problemId}.json`), JSON.stringify(value));

    const result = await validateApproachChallengeFamily({ rootDirectory: tempRoot, familyId: value.primaryFamilyId });
    assert.deepEqual(result, { familyId: value.primaryFamilyId, problemCount: 1, problemIds: [value.problemId] });
    const output = execFileSync(process.execPath, ["scripts/build.mjs", "validate-approach-family", "--family", value.primaryFamilyId, "--root", tempRoot], { cwd: process.cwd(), encoding: "utf8" });
    assert.match(output, /Validated 1 paired approach challenge/u);
    await assert.rejects(() => validateApproachChallengeFamily({ rootDirectory: tempRoot, familyId: "../escape" }), /safe taxonomy family ID/u);
    await rm(path.join(familyRoot, `${value.problemId}.json`));
    await writeFile(path.join(familyRoot, "wrong-filename.json"), JSON.stringify(value));
    await assert.rejects(() => validateApproachChallengeFamily({ rootDirectory: tempRoot, familyId: value.primaryFamilyId }), /filename: must equal problemId/u);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});
