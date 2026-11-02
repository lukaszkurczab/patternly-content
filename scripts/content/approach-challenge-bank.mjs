import { createHash } from "node:crypto";
import { lstat, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { validateApproachChallengeProblem } from "./approach-challenge-contract.mjs";

export const APPROACH_CHALLENGE_REGISTRY_PATH = path.join("config", "approach-challenge-registries", "coding-interview-dsa-problem-solving.json");
export const APPROACH_CHALLENGE_FAMILY_COUNTS = Object.freeze({
  complexity_and_constraints: 26,
  arrays_and_strings: 24,
  hash_map_and_set: 24,
  two_pointers: 22,
  sliding_window: 24,
  prefix_sums: 22,
  sorting_based: 22,
  stack: 22,
  binary_search: 22,
  tree_traversal: 22,
  intervals: 22,
  graph_traversal: 22,
  dynamic_programming_intro: 22,
  monotonic_stack: 22,
  linked_list: 22,
  recursion_basics: 22,
  heap_priority_queue: 22,
  backtracking: 22,
  greedy_intro: 22,
  bit_manipulation: 22,
  math_and_geometry: 22,
});

export const APPROACH_CHALLENGE_EXPECTED_PROBLEM_COUNT = Object.values(APPROACH_CHALLENGE_FAMILY_COUNTS).reduce((sum, count) => sum + count, 0);
export const APPROACH_CHALLENGE_EXPECTED_QUESTION_COUNT = APPROACH_CHALLENGE_EXPECTED_PROBLEM_COUNT * 2;
export const APPROACH_CHALLENGE_FREE_FAMILY_ID = "complexity_and_constraints";
// Free availability is derived per item from the existing B01-only containment
// predicate. B01 now also contains cross-family Premium problems.
export const APPROACH_CHALLENGE_FREE_PROBLEM_COUNT = 16;
export const APPROACH_CHALLENGE_PREMIUM_PROBLEM_COUNT = APPROACH_CHALLENGE_EXPECTED_PROBLEM_COUNT - APPROACH_CHALLENGE_FREE_PROBLEM_COUNT;

const TRACK_ID = "coding-interview-dsa-problem-solving";
const SOURCE_ROOT = path.join("content", "approach-challenges", TRACK_ID);
const SHA256 = /^[a-f0-9]{64}$/u;
const ROOT = path.resolve(fileURLToPath(new URL("../../", import.meta.url)));
const FAMILY_KEYS = ["familyId", "expectedProblemCount", "accessTier", "problems"];
const PROBLEM_REF_KEYS = ["problemId", "sourceSha256"];
const REGISTRY_KEYS = ["schemaVersion", "registryVersion", "trackId", "expectedProblemCount", "expectedQuestionCount", "families"];

/** Loads the accepted, hash-pinned paired bank without adding it to ordinary question pools. */
export async function loadApproachChallengeBank({ rootDirectory = ROOT, taxonomyFamilyIds, canonicalQuestionIds = [] } = {}) {
  const root = path.resolve(rootDirectory);
  const registry = await readRegularJson(root, APPROACH_CHALLENGE_REGISTRY_PATH);
  assertExactKeys(registry, REGISTRY_KEYS, "approach-challenge registry");
  if (registry.schemaVersion !== "patternly-approach-challenge-registry-v1" || !validVersion(registry.registryVersion) || registry.trackId !== TRACK_ID) {
    fail("Approach-challenge registry identity or version is invalid");
  }
  if (registry.expectedProblemCount !== APPROACH_CHALLENGE_EXPECTED_PROBLEM_COUNT || registry.expectedQuestionCount !== APPROACH_CHALLENGE_EXPECTED_QUESTION_COUNT) {
    fail(`Approach-challenge registry totals do not match the accepted ${APPROACH_CHALLENGE_EXPECTED_PROBLEM_COUNT}/${APPROACH_CHALLENGE_EXPECTED_QUESTION_COUNT} contract`);
  }
  if (!(taxonomyFamilyIds instanceof Set)) fail("Coding Interview taxonomy family identities are required");
  if (!Array.isArray(registry.families) || registry.families.length !== Object.keys(APPROACH_CHALLENGE_FAMILY_COUNTS).length) {
    fail(`Approach-challenge registry must declare all ${Object.keys(APPROACH_CHALLENGE_FAMILY_COUNTS).length} required families`);
  }

  const expectedFamilyIds = Object.keys(APPROACH_CHALLENGE_FAMILY_COUNTS);
  const sourceRoot = path.join(root, SOURCE_ROOT);
  await assertSafeDirectory(root, sourceRoot);
  const sourceRootEntries = await readdir(sourceRoot, { withFileTypes: true });
  if (sourceRootEntries.some((entry) => entry.isSymbolicLink() || !entry.isDirectory()) ||
      canonicalString(sourceRootEntries.map((entry) => entry.name).sort()) !== canonicalString([...expectedFamilyIds].sort())) {
    fail(`Approach-challenge source root must contain exactly the ${expectedFamilyIds.length} registered family directories`);
  }
  const registeredFamilyIds = new Set();
  const seenProblemIds = new Set();
  const seenQuestionIds = new Set(canonicalQuestionIds);
  const problems = [];
  const sourceEntries = [];
  const familyCounts = {};
  let freeProblemCount = 0;

  for (const familyEntry of registry.families) {
    assertExactKeys(familyEntry, FAMILY_KEYS, "approach-challenge family registry entry");
    const { familyId } = familyEntry;
    const expectedProblemCount = APPROACH_CHALLENGE_FAMILY_COUNTS[familyId];
    if (!expectedFamilyIds.includes(familyId) || registeredFamilyIds.has(familyId)) fail(`Approach-challenge registry contains an unknown or duplicate family: ${familyId}`);
    if (!taxonomyFamilyIds.has(familyId)) fail(`Approach-challenge family is missing from Coding Interview taxonomy: ${familyId}`);
    registeredFamilyIds.add(familyId);
    if (familyEntry.expectedProblemCount !== expectedProblemCount) fail(`Approach-challenge family count is wrong for ${familyId}`);
    const accessTier = familyId === APPROACH_CHALLENGE_FREE_FAMILY_ID ? "mixed" : "premium";
    if (familyEntry.accessTier !== accessTier) fail(`Approach-challenge access tier is wrong for ${familyId}`);
    if (!Array.isArray(familyEntry.problems) || familyEntry.problems.length !== expectedProblemCount) fail(`Approach-challenge registry has the wrong problem count for ${familyId}`);

    const familyRoot = path.join(root, SOURCE_ROOT, familyId);
    await assertSafeDirectory(root, familyRoot);
    const expectedNames = [];
    let previousProblemId;
    for (const problemRef of familyEntry.problems) {
      assertExactKeys(problemRef, PROBLEM_REF_KEYS, `approach-challenge problem reference in ${familyId}`);
      if (!validId(problemRef.problemId) || previousProblemId !== undefined && previousProblemId >= problemRef.problemId) {
        fail(`Approach-challenge problem references must be valid and sorted in ${familyId}`);
      }
      if (!SHA256.test(problemRef.sourceSha256)) fail(`Approach-challenge source hash is invalid for ${problemRef.problemId}`);
      previousProblemId = problemRef.problemId;
      const filename = `${problemRef.problemId}.json`;
      expectedNames.push(filename);
      const relativePath = path.join(SOURCE_ROOT, familyId, filename);
      const { bytes, value: problem } = await readRegularJsonWithBytes(root, relativePath);
      const actualHash = createHash("sha256").update(bytes).digest("hex");
      if (actualHash !== problemRef.sourceSha256) fail(`Approach-challenge source hash differs from registry for ${relativePath}`);
      if (problem.problemId !== problemRef.problemId) fail(`Approach-challenge problem identity differs from registry for ${relativePath}`);
      if (seenProblemIds.has(problem.problemId)) fail(`Duplicate approach-challenge problemId: ${problem.problemId}`);
      seenProblemIds.add(problem.problemId);
      const errors = validateApproachChallengeProblem(problem, { familyId, familyIds: taxonomyFamilyIds });
      if (errors.length) fail(`Invalid approach-challenge source ${relativePath}`, errors);
      for (const question of [problem.approachQuestion, problem.complexityQuestion]) {
        if (seenQuestionIds.has(question.questionId)) fail(`Duplicate approach-challenge questionId: ${question.questionId}`);
        seenQuestionIds.add(question.questionId);
      }

      const isFreeProblem = problem.primaryFamilyId === APPROACH_CHALLENGE_FREE_FAMILY_ID &&
        problem.requiredFamilyIds.every((id) => id === APPROACH_CHALLENGE_FREE_FAMILY_ID) &&
        problem.approachQuestion.nodeId === APPROACH_CHALLENGE_FREE_FAMILY_ID &&
        problem.complexityQuestion.nodeId === APPROACH_CHALLENGE_FREE_FAMILY_ID;
      if (accessTier === "mixed" && isFreeProblem) {
        freeProblemCount += 1;
      } else if (accessTier !== "premium" && accessTier !== "mixed") {
        fail(`Approach-challenge problem ${problem.problemId} has an unsupported access tier`);
      }
      problems.push(problem);
      sourceEntries.push(Object.freeze({ familyId, problemId: problem.problemId, problemVersion: problem.problemVersion, sourcePath: relativePath.split(path.sep).join("/"), sourceSha256: actualHash, questionIds: Object.freeze([problem.approachQuestion.questionId, problem.complexityQuestion.questionId]) }));
    }

    const actualNames = (await readdir(familyRoot, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map((entry) => entry.name)
      .sort();
    if (canonicalString(actualNames) !== canonicalString(expectedNames)) fail(`Approach-challenge source inventory differs from registry for ${familyId}`);
    familyCounts[familyId] = problems.filter((problem) => problem.primaryFamilyId === familyId).length;
  }

  if (expectedFamilyIds.some((familyId) => !registeredFamilyIds.has(familyId))) fail("Approach-challenge registry omits a required family");
  problems.sort((left, right) => compareStrings(left.problemId, right.problemId));
  sourceEntries.sort((left, right) => compareStrings(left.problemId, right.problemId));
  const questionCount = problems.reduce((count, problem) => count + 2, 0);
  if (problems.length !== APPROACH_CHALLENGE_EXPECTED_PROBLEM_COUNT || questionCount !== APPROACH_CHALLENGE_EXPECTED_QUESTION_COUNT) {
    fail(`Aggregated approach-challenge bank does not contain exactly ${APPROACH_CHALLENGE_EXPECTED_PROBLEM_COUNT} problems and ${APPROACH_CHALLENGE_EXPECTED_QUESTION_COUNT} questions`);
  }
  if (freeProblemCount !== APPROACH_CHALLENGE_FREE_PROBLEM_COUNT || problems.length - freeProblemCount !== APPROACH_CHALLENGE_PREMIUM_PROBLEM_COUNT) {
    fail(`Approach-challenge bank must contain exactly ${APPROACH_CHALLENGE_FREE_PROBLEM_COUNT} Free and ${APPROACH_CHALLENGE_PREMIUM_PROBLEM_COUNT} Premium problems`);
  }

  return Object.freeze({
    registryVersion: registry.registryVersion,
    trackId: TRACK_ID,
    problems: Object.freeze(problems),
    problemCount: problems.length,
    questionCount,
    freeProblemCount,
    premiumProblemCount: problems.length - freeProblemCount,
    familyCounts: Object.freeze(familyCounts),
    sourceEntries: Object.freeze(sourceEntries),
  });
}

function assertExactKeys(value, expected, label) {
  if (!isRecord(value) || canonicalString(Object.keys(value).sort()) !== canonicalString([...expected].sort())) fail(`${label} has an invalid shape`);
}

async function readRegularJson(root, relativePath) {
  return (await readRegularJsonWithBytes(root, relativePath)).value;
}

async function readRegularJsonWithBytes(root, relativePath) {
  const absolute = path.resolve(root, relativePath);
  if (!isWithin(root, absolute)) fail(`Approach-challenge source escapes its root: ${relativePath}`);
  let info;
  try { info = await lstat(absolute); }
  catch (error) { fail(`Cannot inspect approach-challenge source ${relativePath}: ${error.message}`); }
  if (!info.isFile() || info.isSymbolicLink()) fail(`Approach-challenge source must be a regular file: ${relativePath}`);
  let bytes;
  try { bytes = await readFile(absolute); }
  catch (error) { fail(`Cannot read approach-challenge source ${relativePath}: ${error.message}`); }
  try { return { bytes, value: JSON.parse(bytes.toString("utf8")) }; }
  catch (error) { fail(`Cannot parse approach-challenge JSON ${relativePath}: ${error.message}`); }
}

async function assertSafeDirectory(root, target) {
  if (!isWithin(root, target)) fail("Approach-challenge directory escapes its repository root");
  let current = root;
  for (const segment of path.relative(root, target).split(path.sep)) {
    if (!segment) continue;
    current = path.join(current, segment);
    let info;
    try { info = await lstat(current); }
    catch (error) { fail(`Cannot inspect approach-challenge directory ${current}: ${error.message}`); }
    if (!info.isDirectory() || info.isSymbolicLink()) fail(`Approach-challenge directory is unsafe: ${current}`);
  }
}

function isWithin(base, target) {
  const relative = path.relative(base, target);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

function isRecord(value) { return value !== null && typeof value === "object" && !Array.isArray(value); }
function validId(value) { return typeof value === "string" && value.trim() === value && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/u.test(value); }
function validVersion(value) { return typeof value === "string" && value.trim() === value && /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/u.test(value); }
function compareStrings(left, right) { return left < right ? -1 : left > right ? 1 : 0; }
function canonicalString(value) { return JSON.stringify(value); }
function fail(message, details = []) { throw new Error(details.length ? `${message}: ${details.join("; ")}` : message); }
