import { createHash, randomUUID } from "node:crypto";
import {
  lstat,
  mkdir,
  readFile,
  readdir,
  rename,
  realpath,
  unlink,
  writeFile
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  loadCanonicalCatalog,
  scoreQuestion,
  validateCatalog,
  validateQuestion
} from "./content/question-contract.mjs";

export const ARTIFACT_SCHEMA_VERSION = "patternly-content-artifact-v1";
export const LOCK_SCHEMA_VERSION = "patternly-content-lock-v1";
export const LOCK_FILE_NAME = "content-lock.json";

const DEFAULT_ROOT_DIRECTORY = path.resolve(fileURLToPath(new URL("../", import.meta.url)));
const JSON_FILE_SUFFIX = ".json";
const HASH_PATTERN = /^[a-f0-9]{64}$/;
const COMMANDS = new Set(["validate", "test", "build", "build-all"]);
const TRACK_COMMANDS = new Set(["validate", "test", "build"]);
const compareStrings = (left, right) => (left < right ? -1 : left > right ? 1 : 0);
const DEFAULT_FILE_OPS = Object.freeze({ lstat, mkdir, readFile, readdir, realpath, rename, unlink, writeFile });

export class ContentBuildError extends Error {
  constructor(message, details = []) {
    super(message);
    this.name = "ContentBuildError";
    this.details = details;
  }
}

function fail(message, details = []) {
  throw new ContentBuildError(message, details);
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function nonEmptyString(value) {
  return typeof value === "string" && value.length > 0 && value.trim() === value;
}

function resolveRoot({ rootDirectory, root } = {}) {
  return path.resolve(rootDirectory ?? root ?? DEFAULT_ROOT_DIRECTORY);
}

function resolveOutputRoot({ rootDirectory, root, outputRoot, outputDirectory } = {}) {
  return path.resolve(outputRoot ?? outputDirectory ?? path.join(resolveRoot({ rootDirectory, root }), "dist"));
}

function jsonText(value, filePath) {
  try {
    return JSON.parse(value);
  } catch (error) {
    fail(`Invalid JSON in ${filePath}: ${error.message}`);
  }
}

async function readJson(filePath) {
  let text;
  try {
    text = await readFile(filePath, "utf8");
  } catch (error) {
    fail(`Cannot read ${filePath}: ${error.message}`);
  }
  return jsonText(text, filePath);
}

function catalogTrack(catalog, trackId) {
  const track = catalog.tracks.find((candidate) => candidate.trackId === trackId);
  if (!track) fail(`Unknown track: ${trackId}`);
  return track;
}

async function loadValidatedCatalog(rootDirectory) {
  let catalog;
  try {
    catalog = loadCanonicalCatalog({ rootDirectory });
  } catch (error) {
    fail(`Cannot load content/catalog.json: ${error.message}`);
  }
  const result = validateCatalog(catalog);
  if (!result.valid) fail("content/catalog.json does not satisfy the canonical catalog contract", result.errors);
  return catalog;
}

function resolveFileOps(fileOps = {}) {
  return { ...DEFAULT_FILE_OPS, ...fileOps };
}

function isWithin(basePath, targetPath) {
  const relative = path.relative(basePath, targetPath);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

async function assertSecurePath(basePath, targetPath, label) {
  const resolvedBase = path.resolve(basePath);
  const resolvedTarget = path.resolve(targetPath);
  if (!isWithin(resolvedBase, resolvedTarget)) fail(`${label} escapes its allowed root: ${targetPath}`);

  let current = resolvedBase;
  let info;
  try {
    info = await lstat(current);
  } catch (error) {
    if (error?.code === "ENOENT") fail(`${label} is missing: ${current}`);
    fail(`Cannot inspect ${label} ${current}: ${error.message}`);
  }
  if (info.isSymbolicLink()) fail(`Symbolic links are not allowed in ${label}: ${current}`);

  const relative = path.relative(resolvedBase, resolvedTarget);
  for (const segment of relative ? relative.split(path.sep) : []) {
    current = path.join(current, segment);
    try {
      info = await lstat(current);
    } catch (error) {
      if (error?.code === "ENOENT") fail(`${label} is missing: ${current}`);
      fail(`Cannot inspect ${label} ${current}: ${error.message}`);
    }
    if (info.isSymbolicLink()) fail(`Symbolic links are not allowed in ${label}: ${current}`);
  }

  let baseRealPath;
  let targetRealPath;
  try {
    [baseRealPath, targetRealPath] = await Promise.all([realpath(resolvedBase), realpath(resolvedTarget)]);
  } catch (error) {
    fail(`Cannot resolve real path for ${label} ${resolvedTarget}: ${error.message}`);
  }
  if (!isWithin(baseRealPath, targetRealPath)) fail(`${label} real path escapes its allowed root: ${resolvedTarget}`);
  return info;
}

async function collectSourceFiles(sourceRoot, contentRoot) {
  try {
    const sourceInfo = await lstat(sourceRoot);
    if (sourceInfo.isSymbolicLink()) fail(`Symbolic links are not allowed in source root: ${sourceRoot}`);
    if (!sourceInfo.isDirectory()) fail(`Source root is not a directory: ${sourceRoot}`);
  } catch (error) {
    if (error instanceof ContentBuildError) throw error;
    if (error?.code === "ENOENT") fail(`Missing source directory: ${sourceRoot}`);
    fail(`Cannot inspect source directory ${sourceRoot}: ${error.message}`);
  }
  await assertSecurePath(contentRoot, sourceRoot, "content source");

  const files = [];
  async function visit(directory) {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
      fail(`Cannot read source directory ${directory}: ${error.message}`);
    }
    for (const entry of entries) {
      const entryPath = path.join(directory, entry.name);
      await assertSecurePath(contentRoot, entryPath, "content source");
      if (entry.isSymbolicLink()) fail(`Symbolic links are not allowed in content source: ${entryPath}`);
      if (entry.isDirectory()) {
        await visit(entryPath);
      } else if (entry.isFile() && entry.name.endsWith(JSON_FILE_SUFFIX)) {
        files.push(entryPath);
      }
    }
  }
  await visit(sourceRoot);
  files.sort((left, right) => compareStrings(path.relative(sourceRoot, left), path.relative(sourceRoot, right)));
  if (files.length === 0) fail(`Source directory is empty: ${sourceRoot}`);
  return files;
}

function sourceIdentity(filePath, sourceRoot) {
  const relativePath = path.relative(sourceRoot, filePath);
  const segments = relativePath.split(path.sep);
  if (segments.length !== 2 || !segments[0] || !segments[1].endsWith(JSON_FILE_SUFFIX)) {
    fail(`Source path must be <nodeId>/<mentalUnitId>.json: ${relativePath}`);
  }
  const mentalUnitId = segments[1].slice(0, -JSON_FILE_SUFFIX.length);
  if (!mentalUnitId) fail(`Source path has an empty mentalUnitId: ${relativePath}`);
  return { nodeId: segments[0], mentalUnitId };
}

function validateTrackQuestion(question, { trackId, sourceIdentity: identity, filePath, catalog }) {
  const result = validateQuestion(question, { catalogTrackIds: catalog.tracks.map((track) => track.trackId) });
  if (!result.valid) fail(`Invalid question in ${filePath}`, result.errors);
  if (question.trackId !== trackId) fail(`Question ${question.questionId} has foreign trackId ${question.trackId}`);
  if (question.nodeId !== identity.nodeId || question.mentalUnitId !== identity.mentalUnitId) {
    fail(`Question ${question.questionId} identity does not match source path ${identity.nodeId}/${identity.mentalUnitId}.json`);
  }
  return question;
}

export async function validateTrack({ rootDirectory, root, trackId } = {}) {
  if (!nonEmptyString(trackId)) fail("trackId is required");
  const resolvedRoot = resolveRoot({ rootDirectory, root });
  const catalog = await loadValidatedCatalog(resolvedRoot);
  const track = catalogTrack(catalog, trackId);
  const contentRoot = path.join(resolvedRoot, "content");
  const sourceRoot = path.join(resolvedRoot, "content", trackId);
  const sourceFiles = await collectSourceFiles(sourceRoot, contentRoot);
  const questions = [];
  const questionIds = new Set();
  for (const filePath of sourceFiles) {
    const identity = sourceIdentity(filePath, sourceRoot);
    const questionsInFile = await readJson(filePath);
    if (!Array.isArray(questionsInFile) || questionsInFile.length === 0) {
      fail(`Canonical source file must contain a non-empty question array: ${filePath}`);
    }
    for (const question of questionsInFile) {
      validateTrackQuestion(question, { trackId, sourceIdentity: identity, filePath, catalog });
      if (questionIds.has(question.questionId)) fail(`Duplicate questionId in track ${trackId}: ${question.questionId}`);
      questionIds.add(question.questionId);
      questions.push(question);
    }
  }
  questions.sort((left, right) => compareStrings(left.questionId, right.questionId));
  return { rootDirectory: resolvedRoot, catalog, track, trackId, sourceRoot, sourceFiles, questions };
}

export async function testTrack(options = {}) {
  const validated = await validateTrack(options);
  for (const question of validated.questions) {
    let result;
    try {
      result = scoreQuestion(question, question.answer);
    } catch (error) {
      fail(`Canonical answer is not scoreable for ${question.questionId}: ${error.message}`);
    }
    if (result.status !== "correct" || result.earnedPoints !== result.maxPoints) {
      fail(`Canonical answer does not receive full score for ${question.questionId}`, [JSON.stringify(result)]);
    }
  }
  return validated;
}

export function canonicalize(value) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) fail("Canonical JSON cannot encode a non-finite number");
    return value;
  }
  if (Array.isArray(value)) return value.map((entry) => canonicalize(entry));
  if (isRecord(value)) {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  }
  fail(`Canonical JSON cannot encode ${typeof value}`);
}

function canonicalSerialize(value) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) fail("Canonical JSON cannot encode a non-finite number");
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map((entry) => canonicalSerialize(entry)).join(",")}]`;
  if (isRecord(value)) {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalSerialize(value[key])}`).join(",")}}`;
  }
  fail(`Canonical JSON cannot encode ${typeof value}`);
}

export function canonicalJson(value) {
  return canonicalSerialize(value);
}

export function sha256(value) {
  const bytes = typeof value === "string" || Buffer.isBuffer(value) ? value : canonicalJson(value);
  return createHash("sha256").update(bytes, typeof bytes === "string" ? "utf8" : undefined).digest("hex");
}

function artifactFor(validated) {
  return {
    schemaVersion: ARTIFACT_SCHEMA_VERSION,
    trackId: validated.trackId,
    contentVersion: validated.track.contentVersion,
    questions: validated.questions
  };
}

function strictLockEntry(entry, catalog, index) {
  const prefix = `lock.tracks[${index}]`;
  if (!isRecord(entry)) fail(`${prefix} must be an object`);
  const expectedKeys = ["trackId", "contentVersion", "questionCount", "sha256"];
  const actualKeys = Object.keys(entry).sort();
  if (canonicalJson(actualKeys) !== canonicalJson([...expectedKeys].sort())) fail(`${prefix} has an invalid shape`);
  const track = catalogTrack(catalog, entry.trackId);
  if (!nonEmptyString(entry.contentVersion) || entry.contentVersion !== track.contentVersion) fail(`${prefix}.contentVersion does not match catalog`);
  if (!Number.isInteger(entry.questionCount) || entry.questionCount < 1) fail(`${prefix}.questionCount must be a positive integer`);
  if (typeof entry.sha256 !== "string" || !HASH_PATTERN.test(entry.sha256)) fail(`${prefix}.sha256 must be a lowercase SHA-256`);
}

function strictLock(lock, catalog) {
  if (!isRecord(lock)) fail("content lock must be an object");
  const expectedKeys = ["schemaVersion", "tracks"];
  if (canonicalJson(Object.keys(lock).sort()) !== canonicalJson([...expectedKeys].sort())) fail("content lock has an invalid shape");
  if (lock.schemaVersion !== LOCK_SCHEMA_VERSION || !Array.isArray(lock.tracks)) fail("content lock has an invalid schemaVersion or tracks field");
  const ids = new Set();
  let previous;
  lock.tracks.forEach((entry, index) => {
    strictLockEntry(entry, catalog, index);
    if (ids.has(entry.trackId)) fail(`content lock contains duplicate trackId: ${entry.trackId}`);
    if (previous !== undefined && previous >= entry.trackId) fail("content lock tracks must be sorted by trackId");
    ids.add(entry.trackId);
    previous = entry.trackId;
  });
  return lock;
}

async function readRegularFile(filePath, label) {
  let info;
  try {
    info = await lstat(filePath);
  } catch (error) {
    if (error?.code === "ENOENT") fail(`${label} is missing: ${filePath}`);
    fail(`Cannot inspect ${label} ${filePath}: ${error.message}`);
  }
  if (info.isSymbolicLink()) fail(`Symbolic links are not allowed in ${label}: ${filePath}`);
  if (!info.isFile()) fail(`${label} is not a regular file: ${filePath}`);
  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    fail(`Cannot read ${label} ${filePath}: ${error.message}`);
  }
}

function validateArtifactShape(artifact, { entry, catalog, filePath }) {
  const expectedKeys = ["schemaVersion", "trackId", "contentVersion", "questions"];
  if (!isRecord(artifact) || canonicalJson(Object.keys(artifact).sort()) !== canonicalJson([...expectedKeys].sort())) {
    fail(`Artifact has an invalid shape: ${filePath}`);
  }
  if (artifact.schemaVersion !== ARTIFACT_SCHEMA_VERSION) fail(`Artifact schemaVersion mismatch: ${filePath}`);
  if (artifact.trackId !== entry.trackId) fail(`Artifact trackId mismatch: ${filePath}`);
  if (artifact.contentVersion !== entry.contentVersion) fail(`Artifact contentVersion mismatch: ${filePath}`);
  if (!Array.isArray(artifact.questions) || artifact.questions.length !== entry.questionCount) {
    fail(`Artifact questionCount mismatch: ${filePath}`);
  }
  const catalogTrackIds = catalog.tracks.map((track) => track.trackId);
  const questionIds = new Set();
  let previousQuestionId;
  artifact.questions.forEach((question, index) => {
    const result = validateQuestion(question, { catalogTrackIds });
    if (!result.valid) fail(`Artifact question ${index} is invalid: ${filePath}`, result.errors);
    if (question.trackId !== entry.trackId) fail(`Artifact question trackId mismatch: ${filePath}`);
    if (questionIds.has(question.questionId)) fail(`Artifact contains duplicate questionId ${question.questionId}: ${filePath}`);
    if (previousQuestionId !== undefined && previousQuestionId >= question.questionId) fail(`Artifact questions are not sorted by questionId: ${filePath}`);
    questionIds.add(question.questionId);
    previousQuestionId = question.questionId;
  });
  return artifact;
}

async function verifyExistingArtifact(outputRoot, entry, catalog) {
  const filePath = path.join(outputRoot, `${entry.trackId}.json`);
  const bytes = await readRegularFile(filePath, "existing artifact");
  if (sha256(bytes) !== entry.sha256) fail(`Existing artifact checksum mismatch: ${filePath}`);
  const artifact = jsonText(bytes, filePath);
  if (canonicalJson(artifact) !== bytes) fail(`Existing artifact is not canonical: ${filePath}`);
  return validateArtifactShape(artifact, { entry, catalog, filePath });
}

async function loadExistingLock(outputRoot, catalog) {
  const lockPath = path.join(outputRoot, LOCK_FILE_NAME);
  let lockInfo;
  try {
    lockInfo = await lstat(lockPath);
  } catch (error) {
    if (error?.code === "ENOENT") return { schemaVersion: LOCK_SCHEMA_VERSION, tracks: [] };
    fail(`Cannot inspect content lock ${lockPath}: ${error.message}`);
  }
  if (lockInfo.isSymbolicLink()) fail(`Symbolic links are not allowed in content lock: ${lockPath}`);
  if (!lockInfo.isFile()) fail(`Content lock is not a regular file: ${lockPath}`);
  const lock = await readJson(lockPath);
  const validLock = strictLock(lock, catalog);
  for (const entry of validLock.tracks) await verifyExistingArtifact(outputRoot, entry, catalog);
  return validLock;
}

async function verifyExistingOutputSet(outputRoot, catalog, lock) {
  let outputInfo;
  try {
    outputInfo = await lstat(outputRoot);
  } catch (error) {
    if (error?.code === "ENOENT") return;
    fail(`Cannot inspect output root ${outputRoot}: ${error.message}`);
  }
  if (outputInfo.isSymbolicLink()) fail(`Symbolic links are not allowed in output root: ${outputRoot}`);
  if (!outputInfo.isDirectory()) fail(`Output root is not a directory: ${outputRoot}`);
  const lockTrackIds = new Set(lock.tracks.map((entry) => entry.trackId));
  const knownArtifactNames = new Set(catalog.tracks.map((track) => `${track.trackId}.json`));
  let entries;
  try {
    entries = await readdir(outputRoot, { withFileTypes: true });
  } catch (error) {
    fail(`Cannot read output root ${outputRoot}: ${error.message}`);
  }
  for (const entry of entries) {
    if (entry.name === LOCK_FILE_NAME) continue;
    const entryPath = path.join(outputRoot, entry.name);
    if (entry.isSymbolicLink()) fail(`Symbolic links are not allowed in output root: ${entryPath}`);
    if (!entry.isFile() || !knownArtifactNames.has(entry.name)) fail(`Unexpected existing output: ${entryPath}`);
    const trackId = entry.name.slice(0, -JSON_FILE_SUFFIX.length);
    if (!lockTrackIds.has(trackId)) fail(`Existing artifact has no lock entry: ${entryPath}`);
  }
}

async function snapshotOutputFile(filePath) {
  let info;
  try {
    info = await lstat(filePath);
  } catch (error) {
    if (error?.code === "ENOENT") return { exists: false, bytes: null };
    fail(`Cannot inspect output ${filePath}: ${error.message}`);
  }
  if (info.isSymbolicLink()) fail(`Symbolic links are not allowed in output: ${filePath}`);
  if (!info.isFile()) fail(`Output is not a regular file: ${filePath}`);
  try {
    return { exists: true, bytes: await readFile(filePath, "utf8") };
  } catch (error) {
    fail(`Cannot read output ${filePath}: ${error.message}`);
  }
}

async function cleanupTemporaryFiles(staged, fileOps) {
  for (const entry of staged) {
    try {
      await fileOps.unlink(entry.temporaryPath);
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
}

async function rollbackOutputFiles(entries, fileOps) {
  const failures = [];
  for (const entry of entries) {
    try {
      if (entry.snapshot.exists) {
        await fileOps.writeFile(entry.filePath, entry.snapshot.bytes, "utf8");
      } else {
        try {
          await fileOps.unlink(entry.filePath);
        } catch (error) {
          if (error?.code !== "ENOENT") throw error;
        }
      }
    } catch (error) {
      failures.push(`${entry.filePath}: ${error.message}`);
    }
  }
  return failures;
}

async function commitOutputSet(changes, { fileOps } = {}) {
  if (changes.length === 0) return;
  const ops = resolveFileOps(fileOps);
  const snapshots = [];
  const staged = [];
  try {
    for (const change of changes) {
      snapshots.push({ ...change, snapshot: await snapshotOutputFile(change.filePath) });
    }
    await ops.mkdir(path.dirname(changes[0].filePath), { recursive: true });
    for (const change of changes) {
      const temporaryPath = `${change.filePath}.${process.pid}.${randomUUID()}.tmp`;
      await ops.writeFile(temporaryPath, change.bytes, { encoding: "utf8", flag: "wx" });
      staged.push({ ...change, temporaryPath });
    }
  } catch (error) {
    try {
      await cleanupTemporaryFiles(staged, ops);
    } catch {
      // Preserve the staging error; a later invocation will expose any leftover temporary path.
    }
    fail(`Cannot stage output set: ${error.message}`);
  }

  try {
    for (const entry of staged) await ops.rename(entry.temporaryPath, entry.filePath);
  } catch (error) {
    const rollbackFailures = await rollbackOutputFiles(snapshots, ops);
    try {
      await cleanupTemporaryFiles(staged, ops);
    } catch (cleanupError) {
      rollbackFailures.push(`temporary cleanup: ${cleanupError.message}`);
    }
    if (rollbackFailures.length > 0) {
      fail(`Cannot commit output set and rollback failed: ${error.message}`, rollbackFailures);
    }
    fail(`Cannot commit output set; previous outputs were restored: ${error.message}`);
  }
}

async function outputChange(filePath, bytes) {
  const snapshot = await snapshotOutputFile(filePath);
  return snapshot.exists && snapshot.bytes === bytes ? null : { filePath, bytes };
}

function lockEntryFor(validated, artifactBytes) {
  return {
    trackId: validated.trackId,
    contentVersion: validated.track.contentVersion,
    questionCount: validated.questions.length,
    sha256: sha256(artifactBytes)
  };
}

function mergeLock(existingLock, entry) {
  const entries = existingLock.tracks.filter((candidate) => candidate.trackId !== entry.trackId);
  entries.push(entry);
  entries.sort((left, right) => compareStrings(left.trackId, right.trackId));
  return { schemaVersion: LOCK_SCHEMA_VERSION, tracks: entries };
}

export async function buildTrack(options = {}) {
  const validated = await validateTrack(options);
  const outputRoot = resolveOutputRoot(options);
  const existingLock = await loadExistingLock(outputRoot, validated.catalog);
  await verifyExistingOutputSet(outputRoot, validated.catalog, existingLock);
  const artifact = artifactFor(validated);
  const artifactBytes = canonicalJson(artifact);
  const artifactPath = path.join(outputRoot, `${validated.trackId}.json`);
  const lockPath = path.join(outputRoot, LOCK_FILE_NAME);
  const lockEntry = lockEntryFor(validated, artifactBytes);
  const nextLock = mergeLock(existingLock, lockEntry);
  const changes = [];
  const artifactChange = await outputChange(artifactPath, artifactBytes);
  if (artifactChange) changes.push(artifactChange);
  const lockChange = await outputChange(lockPath, canonicalJson(nextLock));
  if (lockChange) changes.push(lockChange);
  await commitOutputSet(changes, options);
  return { ...validated, artifact, artifactBytes, artifactPath, lock: nextLock, lockEntry, lockPath };
}

export async function buildAll({ rootDirectory, root, outputRoot, outputDirectory, fileOps } = {}) {
  const resolvedRoot = resolveRoot({ rootDirectory, root });
  const resolvedOutputRoot = resolveOutputRoot({ rootDirectory: resolvedRoot, outputRoot, outputDirectory });
  const catalog = await loadValidatedCatalog(resolvedRoot);
  const existingLock = await loadExistingLock(resolvedOutputRoot, catalog);
  await verifyExistingOutputSet(resolvedOutputRoot, catalog, existingLock);
  const validatedTracks = [];
  for (const track of catalog.tracks) {
    validatedTracks.push(await validateTrack({ rootDirectory: resolvedRoot, trackId: track.trackId }));
  }
  const lockEntries = [];
  const artifacts = [];
  const changes = [];
  for (const validated of validatedTracks) {
    const artifact = artifactFor(validated);
    const artifactBytes = canonicalJson(artifact);
    const artifactPath = path.join(resolvedOutputRoot, `${validated.trackId}.json`);
    const artifactChange = await outputChange(artifactPath, artifactBytes);
    if (artifactChange) changes.push(artifactChange);
    artifacts.push({ ...validated, artifact, artifactBytes, artifactPath });
    lockEntries.push(lockEntryFor(validated, artifactBytes));
  }
  const lock = { schemaVersion: LOCK_SCHEMA_VERSION, tracks: lockEntries.sort((left, right) => compareStrings(left.trackId, right.trackId)) };
  const lockPath = path.join(resolvedOutputRoot, LOCK_FILE_NAME);
  const lockChange = await outputChange(lockPath, canonicalJson(lock));
  if (lockChange) changes.push(lockChange);
  await commitOutputSet(changes, { fileOps });
  return { rootDirectory: resolvedRoot, outputRoot: resolvedOutputRoot, catalog, artifacts, lock, lockPath };
}

function usage() {
  return "Usage: node scripts/build.mjs <validate|test|build> --track <trackId> [--root <dir>] [--output-root <dir>] | build-all [--root <dir>] [--output-root <dir>]";
}

export function parseArgs(argv = process.argv.slice(2)) {
  const [command, ...rest] = argv;
  if (!COMMANDS.has(command)) fail(usage());
  const options = { command };
  for (let index = 0; index < rest.length; index += 1) {
    const argument = rest[index];
    if (!["--track", "--root", "--output-root"].includes(argument)) fail(`Unknown argument: ${argument}\n${usage()}`);
    if (index + 1 >= rest.length || rest[index + 1].startsWith("--")) fail(`${argument} requires a value\n${usage()}`);
    const value = rest[++index];
    if (!nonEmptyString(value)) fail(`${argument} requires a non-empty value\n${usage()}`);
    const key = argument === "--output-root" ? "outputRoot" : argument === "--track" ? "trackId" : argument.slice(2);
    if (Object.prototype.hasOwnProperty.call(options, key)) fail(`Duplicate argument: ${argument}`);
    options[key] = value;
  }
  if (TRACK_COMMANDS.has(command) && !nonEmptyString(options.trackId)) fail(`--track is required for ${command}\n${usage()}`);
  if (command === "build-all" && options.trackId) fail(`--track is not accepted for build-all\n${usage()}`);
  return options;
}

async function runCli(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  if (options.command === "validate") {
    const result = await validateTrack(options);
    console.log(`Validated ${result.questions.length} question(s) for ${result.trackId}`);
    return;
  }
  if (options.command === "test") {
    const result = await testTrack(options);
    console.log(`Tested ${result.questions.length} canonical answer(s) for ${result.trackId}`);
    return;
  }
  if (options.command === "build") {
    const result = await buildTrack(options);
    console.log(`Built ${result.artifactPath} (${result.questions.length} question(s), ${result.lockEntry?.sha256 ?? sha256(result.artifactBytes)})`);
    return;
  }
  const result = await buildAll(options);
  console.log(`Built ${result.artifacts.length} track artifact(s) and ${result.lockPath}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  runCli().catch((error) => {
    console.error(error instanceof ContentBuildError ? error.message : error.stack ?? error.message);
    if (error instanceof ContentBuildError && error.details.length > 0) console.error(error.details.join("\n"));
    process.exitCode = 1;
  });
}
