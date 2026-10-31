import { lstat, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateQuestion } from "./question-contract.mjs";

export const APPROACH_CHALLENGE_SCHEMA_VERSION = "approach-challenge-problem-v1";
export const APPROACH_CHALLENGE_TRACK_ID = "coding-interview-dsa-problem-solving";
export const APPROACH_CHALLENGE_SOURCE_ROOT = path.join("content", "approach-challenges", APPROACH_CHALLENGE_TRACK_ID);

const ROOT = path.resolve(fileURLToPath(new URL("../../", import.meta.url)));
const idPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/u;
const versionPattern = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/u;
const sha256Pattern = /^[a-f0-9]{64}$/u;
const record = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const hasText = (value) => typeof value === "string" && /[^\u0009-\u000D\u001C-\u001F\u0020\u0085\u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]/u.test(value);

const PROBLEM_KEYS = Object.freeze(["schemaVersion", "problemId", "problemVersion", "trackId", "primaryFamilyId", "requiredFamilyIds", "difficulty", "approachQuestion", "complexityQuestion", "analyzedApproachId", "methodReveal"]);

export function validateApproachChallengeProblem(problem, { familyId, familyIds } = {}) {
  const errors = [];
  if (!record(problem)) return ["problem: must be an object"];
  for (const key of PROBLEM_KEYS) if (!Object.hasOwn(problem, key)) errors.push(`problem.${key}: is required`);
  for (const key of Object.keys(problem)) if (!PROBLEM_KEYS.includes(key)) errors.push(`problem.${key}: is not allowed`);
  if (problem.schemaVersion !== APPROACH_CHALLENGE_SCHEMA_VERSION) errors.push("problem.schemaVersion: unsupported version");
  if (!validId(problem.problemId)) errors.push("problem.problemId: invalid stable identity");
  if (!validVersion(problem.problemVersion)) errors.push("problem.problemVersion: invalid version");
  if (problem.trackId !== APPROACH_CHALLENGE_TRACK_ID) errors.push("problem.trackId: foreign track");
  if (!validId(problem.primaryFamilyId)) errors.push("problem.primaryFamilyId: invalid identity");
  if (familyId !== undefined && problem.primaryFamilyId !== familyId) errors.push("problem.primaryFamilyId: does not match authoring directory");
  if (familyIds && !familyIds.has(problem.primaryFamilyId)) errors.push("problem.primaryFamilyId: unknown Coding Interview taxonomy family");
  if (!Array.isArray(problem.requiredFamilyIds) || problem.requiredFamilyIds.length === 0) errors.push("problem.requiredFamilyIds: must be a non-empty array");
  else {
    if (problem.requiredFamilyIds.some((entry) => !validId(entry))) errors.push("problem.requiredFamilyIds: contains an invalid identity");
    if (new Set(problem.requiredFamilyIds).size !== problem.requiredFamilyIds.length) errors.push("problem.requiredFamilyIds: contains duplicate identities");
    if (familyIds && problem.requiredFamilyIds.some((entry) => !familyIds.has(entry))) errors.push("problem.requiredFamilyIds: contains an unknown Coding Interview taxonomy family");
    if (!problem.requiredFamilyIds.includes(problem.primaryFamilyId)) errors.push("problem.requiredFamilyIds: must include primaryFamilyId");
  }
  if (!["easy", "medium", "hard"].includes(problem.difficulty)) errors.push("problem.difficulty: unsupported value");
  for (const [key, allowApproachChoice] of [["approachQuestion", true], ["complexityQuestion", false]]) {
    const result = validateQuestion(problem[key], { allowApproachChoice });
    errors.push(...result.errors.map((entry) => `problem.${key}.${entry.replace(/^question\.?/u, "")}`));
  }
  if (record(problem.approachQuestion) && record(problem.approachQuestion.interaction) && problem.approachQuestion.interaction.type !== "approach_choice") errors.push("problem.approachQuestion.interaction.type: must be approach_choice");
  if (record(problem.complexityQuestion) && record(problem.complexityQuestion.interaction) && problem.complexityQuestion.interaction.type !== "choice_single") errors.push("problem.complexityQuestion.interaction.type: must be choice_single");
  if (record(problem.approachQuestion) && record(problem.complexityQuestion)) {
    if (problem.approachQuestion.questionId === problem.complexityQuestion.questionId) errors.push("problem.complexityQuestion.questionId: must differ from approachQuestion.questionId");
    for (const key of ["trackId", "nodeId", "mentalUnitId", "difficulty"]) if (problem.approachQuestion[key] !== problem.complexityQuestion[key]) errors.push(`problem.questions.${key}: both stages must match`);
    if (problem.approachQuestion.trackId !== APPROACH_CHALLENGE_TRACK_ID || problem.complexityQuestion.trackId !== APPROACH_CHALLENGE_TRACK_ID) errors.push("problem.questions.trackId: foreign track");
  }
  if (!validId(problem.analyzedApproachId)) errors.push("problem.analyzedApproachId: invalid stable identity");
  else if (record(problem.approachQuestion?.interaction) && Array.isArray(problem.approachQuestion.interaction.options) && !problem.approachQuestion.interaction.options.some((option) => record(option) && option.approachId === problem.analyzedApproachId && option.grade === "correct")) errors.push("problem.analyzedApproachId: must reference a correct approach option");
  if (!record(problem.methodReveal)) errors.push("problem.methodReveal: must be an object");
  else {
    for (const key of ["title", "description"]) if (!Object.hasOwn(problem.methodReveal, key)) errors.push(`problem.methodReveal.${key}: is required`);
    for (const key of Object.keys(problem.methodReveal)) if (!["title", "description"].includes(key)) errors.push(`problem.methodReveal.${key}: is not allowed`);
    if (!hasText(problem.methodReveal.title)) errors.push("problem.methodReveal.title: must contain text");
    if (!hasText(problem.methodReveal.description)) errors.push("problem.methodReveal.description: must contain text");
    if (typeof problem.methodReveal.description === "string" && /\bO\s*\(/u.test(problem.methodReveal.description)) errors.push("problem.methodReveal.description: must not reveal Big-O before stage two");
  }
  return errors;
}

export function validateApproachChallengeProblemRef(ref, problem, pin) {
  const errors = [];
  const keys = ["trackId", "problemId", "problemVersion", "contentVersion", "artifactSha256", "approachQuestionId", "complexityQuestionId", "analyzedApproachId"];
  if (!record(ref)) return ["problemRef: must be an object"];
  for (const key of keys) if (!Object.hasOwn(ref, key)) errors.push(`problemRef.${key}: is required`);
  for (const key of Object.keys(ref)) if (!keys.includes(key)) errors.push(`problemRef.${key}: is not allowed`);
  if (ref.trackId !== problem.trackId) errors.push("problemRef.trackId: foreign reference");
  if (ref.problemId !== problem.problemId || ref.problemVersion !== problem.problemVersion) errors.push("problemRef: foreign problem or version");
  if (ref.approachQuestionId !== problem.approachQuestion.questionId || ref.complexityQuestionId !== problem.complexityQuestion.questionId || ref.analyzedApproachId !== problem.analyzedApproachId) errors.push("problemRef: foreign stage or target reference");
  if (ref.contentVersion !== pin.contentVersion || !validVersion(ref.contentVersion)) errors.push("problemRef.contentVersion: does not match the pinned content version");
  if (ref.artifactSha256 !== pin.artifactSha256 || !sha256Pattern.test(ref.artifactSha256)) errors.push("problemRef.artifactSha256: does not match the pinned artifact");
  return errors;
}

export async function validateApproachChallengeFamily({ rootDirectory = ROOT, familyId } = {}) {
  if (!validPathId(familyId)) throw new Error("--family requires a safe taxonomy family ID");
  const root = path.resolve(rootDirectory);
  const trackConfig = await readRegularJson(root, path.join("config", "tracks", `${APPROACH_CHALLENGE_TRACK_ID}.json`));
  if (!record(trackConfig) || trackConfig.trackId !== APPROACH_CHALLENGE_TRACK_ID || typeof trackConfig.taxonomyPath !== "string") throw new Error("Coding Interview track taxonomy binding is invalid.");
  const taxonomy = await readRegularJson(root, trackConfig.taxonomyPath);
  const familyIds = new Set(Array.isArray(taxonomy?.patternFamilies) ? taxonomy.patternFamilies.map((family) => family?.id).filter((id) => typeof id === "string") : []);
  if (!familyIds.has(familyId)) throw new Error(`Unknown Coding Interview taxonomy family: ${familyId}`);
  const familyRoot = path.join(root, APPROACH_CHALLENGE_SOURCE_ROOT, familyId);
  await assertSafeDirectory(root, familyRoot);
  const names = (await readdir(familyRoot)).filter((name) => name.endsWith(".json")).sort();
  if (names.length === 0) throw new Error(`No approach-challenge source files found for ${familyId}.`);
  const problemIds = new Set(), questionIds = new Set();
  for (const name of names) {
    const problemPath = path.join(familyRoot, name);
    const problem = await readRegularJson(root, path.relative(root, problemPath));
    const localErrors = validateApproachChallengeProblem(problem, { familyId, familyIds });
    if (path.basename(name, ".json") !== problem?.problemId) localErrors.push("filename: must equal problemId.json");
    if (problemIds.has(problem?.problemId)) localErrors.push("problemId: duplicate in family");
    problemIds.add(problem?.problemId);
    for (const question of [problem?.approachQuestion, problem?.complexityQuestion]) {
      if (questionIds.has(question?.questionId)) localErrors.push(`questionId: duplicate in family (${question?.questionId})`);
      questionIds.add(question?.questionId);
    }
    if (localErrors.length) throw new Error(`${path.relative(root, problemPath)} is invalid:\n${localErrors.map((error) => `- ${error}`).join("\n")}`);
  }
  return Object.freeze({ familyId, problemCount: names.length, problemIds: Object.freeze([...problemIds].sort()) });
}

function validId(value) { return typeof value === "string" && value.length > 0 && value.trim() === value && idPattern.test(value); }
function validPathId(value) { return validId(value) && !value.includes("..") && !value.includes("/") && !value.includes("\\"); }
function validVersion(value) { return typeof value === "string" && versionPattern.test(value); }

async function readRegularJson(root, relativePath) {
  const absolutePath = path.resolve(root, relativePath);
  if (!isWithin(root, absolutePath)) throw new Error(`Source path escapes its root: ${relativePath}`);
  const info = await lstat(absolutePath);
  if (!info.isFile() || info.isSymbolicLink()) throw new Error(`Source must be a regular file: ${relativePath}`);
  try { return JSON.parse(await readFile(absolutePath, "utf8")); }
  catch (error) { throw new Error(`Cannot parse JSON ${relativePath}: ${error.message}`); }
}

async function assertSafeDirectory(root, target) {
  const absoluteRoot = path.resolve(root), absoluteTarget = path.resolve(target);
  if (!isWithin(absoluteRoot, absoluteTarget)) throw new Error("Approach-challenge family path escapes the repository root.");
  let current = absoluteRoot;
  const rootInfo = await lstat(current);
  if (!rootInfo.isDirectory() || rootInfo.isSymbolicLink()) throw new Error(`Repository root is not a safe directory: ${current}`);
  for (const segment of path.relative(absoluteRoot, absoluteTarget).split(path.sep)) {
    if (!segment) continue;
    current = path.join(current, segment);
    const info = await lstat(current);
    if (!info.isDirectory() || info.isSymbolicLink()) throw new Error(`Approach-challenge path is not a safe directory: ${current}`);
  }
}

function isWithin(basePath, targetPath) {
  const relative = path.relative(basePath, targetPath);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}
