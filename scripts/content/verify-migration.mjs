import {
  lstat,
  readFile,
  readdir,
  realpath
} from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { canonicalJson, sha256 } from "../build.mjs";
import {
  ACCEPTED_TRACK_IDS,
  validateCatalog,
  validateQuestion
} from "./question-contract.mjs";

export const SIMP03_EVIDENCE_SCHEMA_VERSION = "patternly-simp03-migration-evidence-v1";

export const EXPECTED_GLOBAL_COUNTS = Object.freeze({
  tracks: 9,
  nodes: 117,
  mentalUnits: 932,
  questions: 16041
});

export const EXPECTED_GLOBAL_INTERACTIONS = Object.freeze({
  choice_multiple: 440,
  choice_single: 13859,
  complexity: 279,
  decision_matrix: 147,
  ordering: 1316
});

const EXPECTED_TRACK_COUNTS = Object.freeze({
  "aws-certified-solutions-architect-associate": Object.freeze({ nodes: 21, mentalUnits: 134, questions: 2568 }),
  "backend-system-design-interview": Object.freeze({ nodes: 10, mentalUnits: 89, questions: 1569 }),
  "claude-certified-architect-professional-certification": Object.freeze({ nodes: 7, mentalUnits: 38, questions: 300 }),
  "coding-interview-dsa-problem-solving": Object.freeze({ nodes: 26, mentalUnits: 213, questions: 3404 }),
  "frontend-system-design-interview": Object.freeze({ nodes: 10, mentalUnits: 88, questions: 1766 }),
  "google-cloud-associate-cloud-engineer": Object.freeze({ nodes: 20, mentalUnits: 152, questions: 2981 }),
  "microsoft-azure-administrator-associate-az-104": Object.freeze({ nodes: 9, mentalUnits: 75, questions: 1288 }),
  "microsoft-azure-ai-fundamentals-ai-901": Object.freeze({ nodes: 5, mentalUnits: 64, questions: 752 }),
  "object-oriented-design-interview": Object.freeze({ nodes: 9, mentalUnits: 79, questions: 1413 })
});

const EXPECTED_TRACK_INTERACTIONS = Object.freeze({
  "aws-certified-solutions-architect-associate": Object.freeze({ choice_multiple: 0, choice_single: 2568, complexity: 0, decision_matrix: 0, ordering: 0 }),
  "backend-system-design-interview": Object.freeze({ choice_multiple: 0, choice_single: 1569, complexity: 0, decision_matrix: 0, ordering: 0 }),
  "claude-certified-architect-professional-certification": Object.freeze({ choice_multiple: 63, choice_single: 237, complexity: 0, decision_matrix: 0, ordering: 0 }),
  "coding-interview-dsa-problem-solving": Object.freeze({ choice_multiple: 377, choice_single: 2450, complexity: 279, decision_matrix: 0, ordering: 298 }),
  "frontend-system-design-interview": Object.freeze({ choice_multiple: 0, choice_single: 601, complexity: 0, decision_matrix: 147, ordering: 1018 }),
  "google-cloud-associate-cloud-engineer": Object.freeze({ choice_multiple: 0, choice_single: 2981, complexity: 0, decision_matrix: 0, ordering: 0 }),
  "microsoft-azure-administrator-associate-az-104": Object.freeze({ choice_multiple: 0, choice_single: 1288, complexity: 0, decision_matrix: 0, ordering: 0 }),
  "microsoft-azure-ai-fundamentals-ai-901": Object.freeze({ choice_multiple: 0, choice_single: 752, complexity: 0, decision_matrix: 0, ordering: 0 }),
  "object-oriented-design-interview": Object.freeze({ choice_multiple: 0, choice_single: 1413, complexity: 0, decision_matrix: 0, ordering: 0 })
});

const EXPECTED_ENVELOPE_COUNTS = Object.freeze({
  "backend-system-design-interview-candidate-source-v1": 89,
  "certification-manual-source-v2": 402,
  "certification-node-manual-source-v1": 5,
  "coding-interview-manual-source-v2": 213,
  "frontend-system-design-interview-candidate-source-v1": 88,
  "object-oriented-design-interview-candidate-source-v1": 79
});

const INTERACTION_TYPES = Object.freeze(Object.keys(EXPECTED_GLOBAL_INTERACTIONS));
const HASH256 = /^[a-f0-9]{64}$/u;
const HASH160 = /^[a-f0-9]{40}$/u;
const UNSAFE_PATH_SEGMENT = /(?:[\\/]|\.\.|\||\u0000)/u;
const EVIDENCE_ROOT_KEYS = ["baseline", "candidateId", "candidateManifestPath", "envelopeCounts", "global", "schemaVersion", "tracks"];
const EVIDENCE_ROW_KEYS = ["canonicalQuestionSha256", "mentalUnitId", "nodeId", "projectionSha256", "questionId", "sourceFileSha256", "sourceItemSha256", "sourcePath", "trackId"];
const TRACK_EVIDENCE_KEYS = ["aggregates", "counts", "interactions", "mentalUnits", "nodes", "source", "trackId"];
const AGGREGATE_KEYS = ["canonicalQuestionSha256", "projectionSha256", "sourceFileSha256", "sourceItemSha256"];
const COUNT_KEYS = ["mentalUnits", "nodes", "questions"];
const SOURCE_KEYS = ["artifact", "canonicalItemCount", "itemManifestSha256", "sourceCommit", "sourceFileCount", "sourceManifestSha256", "sourceRoot"];
const ARTIFACT_KEYS = ["checksumSha256", "contentVersion", "releaseId", "releasePath", "sourceRepositoryCommit", "taxonomyVersion", "trackId"];
const BASELINE_KEYS = ["path", "sha256"];

export class MigrationVerificationError extends Error {
  constructor(code, message, details = []) {
    super(`${code}: ${message}`);
    this.name = "MigrationVerificationError";
    this.code = code;
    this.details = details;
  }
}

function fail(code, message, details = []) {
  throw new MigrationVerificationError(code, message, details);
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function compare(left, right) {
  return left === right ? 0 : left < right ? -1 : 1;
}

function exactKeys(value, expected, label) {
  if (!isRecord(value)) fail("EVIDENCE_SHAPE", `${label} must be an object.`);
  const actual = Object.keys(value).sort(compare);
  const wanted = [...expected].sort(compare);
  if (canonicalJson(actual) !== canonicalJson(wanted)) {
    fail("EVIDENCE_SHAPE", `${label} has an unsupported key set.`, [`expected=${wanted.join(",")}`, `actual=${actual.join(",")}`]);
  }
}

function assertHash(value, label, { kind = "sha256" } = {}) {
  const pattern = kind === "sha1" ? HASH160 : HASH256;
  if (typeof value !== "string" || !pattern.test(value)) fail("MALFORMED_HASH", `${label} must be a lowercase ${kind} hash.`);
  return value;
}

function assertInteger(value, label, { min = 0 } = {}) {
  if (!Number.isInteger(value) || value < min) fail("EVIDENCE_VALUE", `${label} must be an integer >= ${min}.`);
  return value;
}

function assertText(value, label) {
  if (typeof value !== "string" || value.length === 0 || value !== value.trim() || value.includes("\u0000")) {
    fail("EVIDENCE_VALUE", `${label} must be a non-empty trim-clean string.`);
  }
  return value;
}

function assertPathSegment(value, label) {
  assertText(value, label);
  if (value === "." || UNSAFE_PATH_SEGMENT.test(value)) fail("UNSAFE_PATH", `${label} contains an unsafe path segment.`);
  return value;
}

function assertRelativePath(value, label, { suffix } = {}) {
  assertText(value, label);
  if (path.posix.isAbsolute(value) || /^[A-Za-z]:[\\/]/u.test(value) || value.includes("\\") || value.split("/").some((segment) => segment === "" || segment === "." || segment === ".." || UNSAFE_PATH_SEGMENT.test(segment))) {
    fail("UNSAFE_PATH", `${label} must be a safe relative path.`);
  }
  if (suffix && !value.endsWith(suffix)) fail("EVIDENCE_VALUE", `${label} must end with ${suffix}.`);
  return value;
}

function assertExactObject(actual, expected, label) {
  exactKeys(actual, Object.keys(expected), label);
  for (const [key, value] of Object.entries(expected)) {
    if (actual[key] !== value) fail("EVIDENCE_VALUE", `${label}.${key} does not match the accepted baseline.`);
  }
}

function assertExactSet(actual, expected, label) {
  if (!Array.isArray(actual)) fail("EVIDENCE_SHAPE", `${label} must be an array.`);
  const actualSorted = [...actual].sort(compare);
  const expectedSorted = [...expected].sort(compare);
  if (actualSorted.length !== actual.length || new Set(actual).size !== actual.length) fail("EVIDENCE_VALUE", `${label} must contain unique values.`);
  if (canonicalJson(actualSorted) !== canonicalJson(expectedSorted)) {
    fail("EVIDENCE_MEMBERSHIP", `${label} does not match the canonical membership.`, [`expected=${expectedSorted.join(",")}`, `actual=${actualSorted.join(",")}`]);
  }
}

function assertUniqueValues(actual, label) {
  if (!Array.isArray(actual) || new Set(actual).size !== actual.length) fail("EVIDENCE_VALUE", `${label} must contain unique values.`);
}

async function regularPath(target, label, kind) {
  const info = await lstat(target).catch((error) => {
    if (error?.code === "ENOENT") fail("MISSING_PATH", `${label} is missing: ${target}`);
    fail("PATH_ERROR", `Cannot inspect ${label}: ${error.message}`);
  });
  if (info.isSymbolicLink()) fail("SYMLINK_PATH", `Symbolic links are not allowed in ${label}: ${target}`);
  if (kind === "directory" && !info.isDirectory()) fail("UNSAFE_PATH", `${label} is not a directory: ${target}`);
  if (kind === "file" && !info.isFile()) fail("UNSAFE_PATH", `${label} is not a regular file: ${target}`);
  return info;
}

async function rejectSymlinkAncestors(target, label) {
  const resolved = path.resolve(target);
  const filesystemRoot = path.parse(resolved).root;
  const relative = path.relative(filesystemRoot, resolved);
  let current = filesystemRoot;
  const segments = relative ? relative.split(path.sep) : [];
  for (const [index, segment] of segments.entries()) {
    current = path.join(current, segment);
    const info = await lstat(current).catch((error) => fail("PATH_ERROR", `Cannot inspect ${label} ancestor ${current}: ${error.message}`));
    if (info.isSymbolicLink()) fail("SYMLINK_PATH", `${label} is reached through a symbolic-link ancestor: ${current}`);
    if (index < segments.length - 1 && !info.isDirectory()) fail("UNSAFE_PATH", `${label} has a non-directory ancestor: ${current}`);
  }
}

async function secureRoot(root) {
  const resolved = path.resolve(root);
  await regularPath(resolved, "content root", "directory");
  await rejectSymlinkAncestors(resolved, "content root");
  const canonical = await realpath(resolved).catch((error) => fail("PATH_ERROR", `Cannot resolve content root: ${error.message}`));
  if (canonical !== resolved) fail("SYMLINK_PATH", "Content root must resolve to its lexical path without ancestor aliases.");
  return resolved;
}

async function listEntries(directory, label) {
  await regularPath(directory, label, "directory");
  const entries = await readdir(directory, { withFileTypes: true });
  const result = [];
  for (const entry of entries.sort((left, right) => compare(left.name, right.name))) {
    assertPathSegment(entry.name, `${label} entry`);
    const entryPath = path.join(directory, entry.name);
    const info = await regularPath(entryPath, `${label} entry ${entry.name}`);
    result.push({ name: entry.name, path: entryPath, info });
  }
  return result;
}

function assertEntryNames(entries, expected, label) {
  const actual = entries.map((entry) => entry.name);
  assertExactSet(actual, expected, label);
}

async function readJson(filePath, label) {
  await regularPath(filePath, label, "file");
  let text;
  try {
    text = await readFile(filePath, "utf8");
  } catch (error) {
    fail("READ_ERROR", `Cannot read ${label}: ${error.message}`);
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    fail("INVALID_JSON", `${label} is not valid JSON: ${error.message}`);
  }
}

function assertCanonicalQuestion(question, label, catalogTrackIds) {
  const result = validateQuestion(question, { catalogTrackIds });
  if (!result.valid) fail("CANONICAL_INVALID", `${label} does not satisfy the canonical question contract.`, result.errors);
  return question;
}

function projectionOf(question) {
  return {
    prompt: question.prompt,
    ...(Object.hasOwn(question, "constraints") ? { constraints: question.constraints } : {}),
    interaction: question.interaction,
    answer: question.answer,
    feedback: question.feedback,
    difficulty: question.difficulty,
    ...(Object.hasOwn(question, "sourceRefs") ? { sourceRefs: question.sourceRefs } : {})
  };
}

function assertCanonicalHash(row, question, label) {
  const expectedQuestionHash = sha256(question);
  const expectedProjectionHash = sha256(projectionOf(question));
  if (row.canonicalQuestionSha256 !== expectedQuestionHash) {
    fail("HASH_MISMATCH", `${label}.canonicalQuestionSha256 does not match the canonical question.`);
  }
  if (row.projectionSha256 !== expectedProjectionHash) {
    fail("HASH_MISMATCH", `${label}.projectionSha256 does not match the canonical projection.`);
  }
}

function validateSourceDescriptor(source, trackId) {
  exactKeys(source, SOURCE_KEYS, `evidence.tracks[${trackId}].source`);
  assertInteger(source.canonicalItemCount, `${trackId}.source.canonicalItemCount`, { min: 1 });
  if (source.canonicalItemCount !== EXPECTED_TRACK_COUNTS[trackId].questions) fail("EVIDENCE_VALUE", `${trackId}.source.canonicalItemCount does not match the accepted baseline.`);
  assertInteger(source.sourceFileCount, `${trackId}.source.sourceFileCount`, { min: 1 });
  assertHash(source.itemManifestSha256, `${trackId}.source.itemManifestSha256`);
  assertHash(source.sourceManifestSha256, `${trackId}.source.sourceManifestSha256`);
  assertHash(source.sourceCommit, `${trackId}.source.sourceCommit`, { kind: "sha1" });
  assertRelativePath(source.sourceRoot, `${trackId}.source.sourceRoot`);
  if (source.sourceRoot !== `manual/source/${trackId}`) fail("EVIDENCE_VALUE", `${trackId}.source.sourceRoot does not match the track.`);

  exactKeys(source.artifact, ARTIFACT_KEYS, `${trackId}.source.artifact`);
  assertHash(source.artifact.checksumSha256, `${trackId}.source.artifact.checksumSha256`);
  assertText(source.artifact.contentVersion, `${trackId}.source.artifact.contentVersion`);
  assertText(source.artifact.releaseId, `${trackId}.source.artifact.releaseId`);
  assertRelativePath(source.artifact.releasePath, `${trackId}.source.artifact.releasePath`);
  assertHash(source.artifact.sourceRepositoryCommit, `${trackId}.source.artifact.sourceRepositoryCommit`, { kind: "sha1" });
  assertText(source.artifact.taxonomyVersion, `${trackId}.source.artifact.taxonomyVersion`);
  assertText(source.artifact.trackId, `${trackId}.source.artifact.trackId`);
  if (source.artifact.trackId !== trackId) fail("EVIDENCE_VALUE", `${trackId}.source.artifact.trackId does not match the track.`);
}

function validateEvidenceManifestShape(manifest) {
  exactKeys(manifest, EVIDENCE_ROOT_KEYS, "evidence.manifest");
  if (manifest.schemaVersion !== SIMP03_EVIDENCE_SCHEMA_VERSION) fail("EVIDENCE_VALUE", "evidence.manifest.schemaVersion is unsupported.");
  assertHash(manifest.candidateId, "evidence.manifest.candidateId");
  assertRelativePath(manifest.candidateManifestPath, "evidence.manifest.candidateManifestPath");
  if (manifest.candidateManifestPath !== "evidence/content-acceptance/candidate-manifest-v1.json") fail("EVIDENCE_VALUE", "evidence.manifest.candidateManifestPath is not the accepted candidate manifest.");

  exactKeys(manifest.baseline, BASELINE_KEYS, "evidence.manifest.baseline");
  assertRelativePath(manifest.baseline.path, "evidence.manifest.baseline.path");
  assertHash(manifest.baseline.sha256, "evidence.manifest.baseline.sha256");
  if (manifest.baseline.path !== "evidence/content-acceptance/acc-01-baseline-v1.json") fail("EVIDENCE_VALUE", "evidence.manifest.baseline.path is not the accepted baseline.");

  assertExactObject(manifest.envelopeCounts, EXPECTED_ENVELOPE_COUNTS, "evidence.manifest.envelopeCounts");
  for (const [key, value] of Object.entries(manifest.envelopeCounts)) assertInteger(value, `evidence.manifest.envelopeCounts.${key}`, { min: 1 });

  exactKeys(manifest.global, ["counts", "interactions"], "evidence.manifest.global");
  assertExactObject(manifest.global.counts, EXPECTED_GLOBAL_COUNTS, "evidence.manifest.global.counts");
  for (const [key, value] of Object.entries(manifest.global.counts)) assertInteger(value, `evidence.manifest.global.counts.${key}`, { min: 0 });
  assertExactObject(manifest.global.interactions, EXPECTED_GLOBAL_INTERACTIONS, "evidence.manifest.global.interactions");
  for (const [key, value] of Object.entries(manifest.global.interactions)) assertInteger(value, `evidence.manifest.global.interactions.${key}`, { min: 0 });

  if (!Array.isArray(manifest.tracks)) fail("EVIDENCE_SHAPE", "evidence.manifest.tracks must be an array.");
  const trackIds = manifest.tracks.map((track) => track?.trackId);
  assertExactSet(trackIds, ACCEPTED_TRACK_IDS, "evidence.manifest.tracks");
  const byTrack = new Map();
  for (const track of manifest.tracks) {
    if (!isRecord(track)) fail("EVIDENCE_SHAPE", "evidence.manifest.tracks entries must be objects.");
    if (byTrack.has(track.trackId)) fail("EVIDENCE_MEMBERSHIP", `evidence.manifest.tracks contains duplicate ${track.trackId}.`);
    byTrack.set(track.trackId, track);
  }
  for (const trackId of ACCEPTED_TRACK_IDS) {
    const track = byTrack.get(trackId);
    exactKeys(track, TRACK_EVIDENCE_KEYS, `evidence.manifest.tracks.${trackId}`);
    exactKeys(track.aggregates, AGGREGATE_KEYS, `${trackId}.aggregates`);
    for (const key of AGGREGATE_KEYS) assertHash(track.aggregates[key], `${trackId}.aggregates.${key}`);
    exactKeys(track.counts, COUNT_KEYS, `${trackId}.counts`);
    for (const key of COUNT_KEYS) assertInteger(track.counts[key], `${trackId}.counts.${key}`, { min: 1 });
    if (canonicalJson(track.counts) !== canonicalJson(EXPECTED_TRACK_COUNTS[trackId])) fail("EVIDENCE_VALUE", `${trackId}.counts do not match the accepted baseline.`);
    exactKeys(track.interactions, INTERACTION_TYPES, `${trackId}.interactions`);
    for (const key of INTERACTION_TYPES) assertInteger(track.interactions[key], `${trackId}.interactions.${key}`, { min: 0 });
    if (canonicalJson(track.interactions) !== canonicalJson(EXPECTED_TRACK_INTERACTIONS[trackId])) fail("EVIDENCE_VALUE", `${trackId}.interactions do not match the accepted baseline.`);

    if (!Array.isArray(track.nodes)) fail("EVIDENCE_SHAPE", `${trackId}.nodes must be an array.`);
    track.nodes.forEach((nodeId, index) => assertPathSegment(nodeId, `${trackId}.nodes[${index}]`));
    assertUniqueValues(track.nodes, `${trackId}.nodes`);
    if (!Array.isArray(track.mentalUnits)) fail("EVIDENCE_SHAPE", `${trackId}.mentalUnits must be an array.`);
    for (const [index, mentalUnit] of track.mentalUnits.entries()) {
      exactKeys(mentalUnit, ["mentalUnitId", "nodeId", "questionCount"], `${trackId}.mentalUnits[${index}]`);
      assertPathSegment(mentalUnit.nodeId, `${trackId}.mentalUnits[${index}].nodeId`);
      assertPathSegment(mentalUnit.mentalUnitId, `${trackId}.mentalUnits[${index}].mentalUnitId`);
      assertInteger(mentalUnit.questionCount, `${trackId}.mentalUnits[${index}].questionCount`, { min: 1 });
    }
    const mentalUnitKeys = track.mentalUnits.map((entry) => `${entry.nodeId}|${entry.mentalUnitId}`);
    if (new Set(mentalUnitKeys).size !== mentalUnitKeys.length) fail("EVIDENCE_MEMBERSHIP", `${trackId}.mentalUnits contains duplicates.`);
    validateSourceDescriptor(track.source, trackId);
  }
  return byTrack;
}

function validateEvidenceRowShape(row, trackId, index) {
  const label = `evidence.items.${trackId}[${index}]`;
  exactKeys(row, EVIDENCE_ROW_KEYS, label);
  for (const key of ["questionId", "trackId", "nodeId", "mentalUnitId"]) assertPathSegment(row[key], `${label}.${key}`);
  if (row.trackId !== trackId) fail("EVIDENCE_MEMBERSHIP", `${label}.trackId does not match its evidence file.`);
  for (const key of ["canonicalQuestionSha256", "projectionSha256", "sourceFileSha256", "sourceItemSha256"]) assertHash(row[key], `${label}.${key}`);
  assertRelativePath(row.sourcePath, `${label}.sourcePath`, { suffix: ".json" });
  if (!row.sourcePath.startsWith(`manual/source/${trackId}/`)) fail("EVIDENCE_VALUE", `${label}.sourcePath does not belong to its track.`);
  return row;
}

function computedTrackAggregate(trackId, questions, rows) {
  const sortedQuestions = [...questions].sort((left, right) => compare(left.questionId, right.questionId));
  const sortedRows = [...rows].sort((left, right) => compare(left.questionId, right.questionId));
  const nodes = [...new Set(sortedQuestions.map((question) => question.nodeId))].sort(compare);
  const mentalUnitMap = new Map();
  for (const question of sortedQuestions) {
    const key = `${question.nodeId}|${question.mentalUnitId}`;
    const existing = mentalUnitMap.get(key) ?? { nodeId: question.nodeId, mentalUnitId: question.mentalUnitId, questionCount: 0 };
    existing.questionCount += 1;
    mentalUnitMap.set(key, existing);
  }
  const mentalUnits = [...mentalUnitMap.values()].sort((left, right) => compare(`${left.nodeId}|${left.mentalUnitId}`, `${right.nodeId}|${right.mentalUnitId}`));
  const interactions = Object.fromEntries(INTERACTION_TYPES.map((type) => [type, sortedQuestions.filter((question) => question.interaction.type === type).length]));
  const aggregates = Object.fromEntries(AGGREGATE_KEYS.map((key) => [key, sha256(sortedRows.map((row) => ({ questionId: row.questionId, [key]: row[key] })))]));
  return {
    trackId,
    counts: { nodes: nodes.length, mentalUnits: mentalUnits.length, questions: sortedQuestions.length },
    nodes,
    mentalUnits,
    interactions,
    aggregates
  };
}

function compareComputedTrack(trackId, manifestTrack, computed) {
  if (canonicalJson(manifestTrack.counts) !== canonicalJson(computed.counts)) fail("AGGREGATE_MISMATCH", `${trackId}.counts does not match canonical content.`);
  if (canonicalJson(manifestTrack.interactions) !== canonicalJson(computed.interactions)) fail("AGGREGATE_MISMATCH", `${trackId}.interactions does not match canonical content.`);
  assertExactSet(manifestTrack.nodes, computed.nodes, `${trackId}.nodes`);
  const manifestMentalUnits = manifestTrack.mentalUnits.map((entry) => ({ ...entry })).sort((left, right) => compare(`${left.nodeId}|${left.mentalUnitId}`, `${right.nodeId}|${right.mentalUnitId}`));
  if (canonicalJson(manifestMentalUnits) !== canonicalJson(computed.mentalUnits)) fail("AGGREGATE_MISMATCH", `${trackId}.mentalUnits does not match canonical content.`);
  if (canonicalJson(manifestTrack.aggregates) !== canonicalJson(computed.aggregates)) fail("AGGREGATE_MISMATCH", `${trackId}.aggregates do not match canonical evidence rows.`);
}

async function loadCanonicalContent(contentRoot) {
  const rootEntries = await listEntries(contentRoot, "content root");
  assertEntryNames(rootEntries, ["catalog.json", ...ACCEPTED_TRACK_IDS, "migration-evidence"], "content root");
  const catalog = await readJson(path.join(contentRoot, "catalog.json"), "content/catalog.json");
  const catalogResult = validateCatalog(catalog);
  if (!catalogResult.valid) fail("CANONICAL_INVALID", "content/catalog.json does not satisfy the canonical catalog contract.", catalogResult.errors);
  assertExactSet(catalog.tracks.map((track) => track.trackId), ACCEPTED_TRACK_IDS, "catalog.tracks");
  const catalogByTrack = new Map(catalog.tracks.map((track) => [track.trackId, track]));
  const questionsByTrack = new Map();
  const questionLocations = new Map();
  for (const trackId of ACCEPTED_TRACK_IDS) {
    const trackRoot = path.join(contentRoot, trackId);
    const nodeEntries = await listEntries(trackRoot, `content/${trackId}`);
    if (nodeEntries.length === 0) fail("CANONICAL_MEMBERSHIP", `${trackId} has no node directories.`);
    const questions = [];
    for (const nodeEntry of nodeEntries) {
      if (!nodeEntry.info.isDirectory()) fail("UNSAFE_PATH", `content/${trackId}/${nodeEntry.name} must be a node directory.`);
      const nodeId = nodeEntry.name;
      const mentalUnitEntries = await listEntries(nodeEntry.path, `content/${trackId}/${nodeId}`);
      if (mentalUnitEntries.length === 0) fail("CANONICAL_MEMBERSHIP", `${trackId}/${nodeId} has no mental-unit files.`);
      for (const mentalUnitEntry of mentalUnitEntries) {
        if (!mentalUnitEntry.info.isFile() || !mentalUnitEntry.name.endsWith(".json")) fail("UNSAFE_PATH", `content/${trackId}/${nodeId}/${mentalUnitEntry.name} must be a JSON file.`);
        const mentalUnitId = mentalUnitEntry.name.slice(0, -5);
        assertPathSegment(nodeId, `canonical nodeId ${nodeId}`);
        assertPathSegment(mentalUnitId, `canonical mentalUnitId ${mentalUnitId}`);
        const fileQuestions = await readJson(mentalUnitEntry.path, `content/${trackId}/${nodeId}/${mentalUnitEntry.name}`);
        if (!Array.isArray(fileQuestions) || fileQuestions.length === 0) fail("CANONICAL_MEMBERSHIP", `content/${trackId}/${nodeId}/${mentalUnitEntry.name} must contain a non-empty question array.`);
        let previousQuestionId;
        for (const [index, question] of fileQuestions.entries()) {
          const label = `content/${trackId}/${nodeId}/${mentalUnitEntry.name}[${index}]`;
          assertCanonicalQuestion(question, label, ACCEPTED_TRACK_IDS);
          assertPathSegment(question.questionId, `${label}.questionId`);
          if (question.trackId !== trackId || question.nodeId !== nodeId || question.mentalUnitId !== mentalUnitId) fail("CANONICAL_MEMBERSHIP", `${label} identity does not match its path.`);
          if (previousQuestionId !== undefined && previousQuestionId >= question.questionId) fail("CANONICAL_ORDER", `${label} question IDs must be sorted.`);
          previousQuestionId = question.questionId;
          if (questionLocations.has(question.questionId)) fail("CANONICAL_MEMBERSHIP", `Duplicate questionId ${question.questionId} appears in canonical content.`);
          questionLocations.set(question.questionId, { trackId, nodeId, mentalUnitId, path: mentalUnitEntry.path });
          questions.push(question);
        }
      }
    }
    questionsByTrack.set(trackId, questions);
  }
  return { catalog, catalogByTrack, questionsByTrack, questionLocations };
}

async function loadEvidence(contentRoot) {
  const evidenceRoot = path.join(contentRoot, "migration-evidence");
  const evidenceEntries = await listEntries(evidenceRoot, "content/migration-evidence");
  assertEntryNames(evidenceEntries, ["items", "manifest.json"], "content/migration-evidence");
  const manifest = await readJson(path.join(evidenceRoot, "manifest.json"), "content/migration-evidence/manifest.json");
  const manifestTracks = validateEvidenceManifestShape(manifest);
  const itemRoot = path.join(evidenceRoot, "items");
  const itemEntries = await listEntries(itemRoot, "content/migration-evidence/items");
  assertEntryNames(itemEntries, ACCEPTED_TRACK_IDS.map((trackId) => `${trackId}.json`), "content/migration-evidence/items");
  const rowsByTrack = new Map();
  for (const trackId of ACCEPTED_TRACK_IDS) {
    const rows = await readJson(path.join(itemRoot, `${trackId}.json`), `content/migration-evidence/items/${trackId}.json`);
    if (!Array.isArray(rows)) fail("EVIDENCE_SHAPE", `content/migration-evidence/items/${trackId}.json must contain an array.`);
    if (rows.length === 0) fail("EVIDENCE_MEMBERSHIP", `${trackId} evidence must not be empty.`);
    const validatedRows = rows.map((row, index) => validateEvidenceRowShape(row, trackId, index));
    const ids = validatedRows.map((row) => row.questionId);
    if (new Set(ids).size !== ids.length) fail("EVIDENCE_MEMBERSHIP", `${trackId} evidence contains duplicate question IDs.`);
    rowsByTrack.set(trackId, validatedRows);
  }
  return { manifest, manifestTracks, rowsByTrack };
}

function compareTrackMembership(trackId, questions, rows, manifestTrack) {
  const questionById = new Map(questions.map((question) => [question.questionId, question]));
  const rowById = new Map(rows.map((row) => [row.questionId, row]));
  const historicalQuestions = rows.map((row) => questionById.get(row.questionId));
  if (historicalQuestions.some((question) => question === undefined)) fail("EVIDENCE_MEMBERSHIP", `${trackId} is missing a historical question.`);
  for (const question of historicalQuestions) {
    const row = rowById.get(question.questionId);
    const label = `evidence.items.${trackId}.${question.questionId}`;
    if (!row) fail("EVIDENCE_MEMBERSHIP", `${label} is missing.`);
    for (const key of ["trackId", "nodeId", "mentalUnitId"]) {
      if (row[key] !== question[key]) fail("EVIDENCE_MEMBERSHIP", `${label}.${key} does not match canonical identity.`);
    }
    assertCanonicalHash(row, question, label);
  }
  const computed = computedTrackAggregate(trackId, historicalQuestions, rows);
  compareComputedTrack(trackId, manifestTrack, computed);
  return computed;
}

function compareGlobal(manifest, questionsByTrack) {
  const allQuestions = ACCEPTED_TRACK_IDS.flatMap((trackId) => questionsByTrack.get(trackId));
  const counts = {
    tracks: questionsByTrack.size,
    nodes: new Set(allQuestions.map((question) => `${question.trackId}|${question.nodeId}`)).size,
    mentalUnits: new Set(allQuestions.map((question) => `${question.trackId}|${question.nodeId}|${question.mentalUnitId}`)).size,
    questions: allQuestions.length
  };
  const interactions = Object.fromEntries(INTERACTION_TYPES.map((type) => [type, allQuestions.filter((question) => question.interaction.type === type).length]));
  if (canonicalJson(counts) !== canonicalJson(EXPECTED_GLOBAL_COUNTS)) fail("COUNT_MISMATCH", `Global canonical counts differ: ${canonicalJson(counts)}.`);
  if (canonicalJson(interactions) !== canonicalJson(EXPECTED_GLOBAL_INTERACTIONS)) fail("COUNT_MISMATCH", `Global canonical interactions differ: ${canonicalJson(interactions)}.`);
  if (canonicalJson(manifest.global.counts) !== canonicalJson(counts)) fail("AGGREGATE_MISMATCH", "evidence.manifest.global.counts does not match canonical content.");
  if (canonicalJson(manifest.global.interactions) !== canonicalJson(interactions)) fail("AGGREGATE_MISMATCH", "evidence.manifest.global.interactions does not match canonical content.");
  return { counts, interactions };
}

async function approvedAwsAdditions(contentRoot, canonical, evidence) {
  const trackId = "aws-certified-solutions-architect-associate";
  const baselineIds = new Set(evidence.rowsByTrack.get(trackId).map((row) => row.questionId));
  const questions = canonical.questionsByTrack.get(trackId);
  const additions = questions.filter((question) => !baselineIds.has(question.questionId));
  if (additions.length === 0) return [];
  if (additions.length !== 36) fail("EVIDENCE_MEMBERSHIP", "Current AWS has an unapproved number of additions.");
  const approvalPath = path.join(path.dirname(contentRoot), "evidence/canonical-content-approvals/odk-096-aws-free-node-v1.json");
  const approval = await readJson(approvalPath, "ODK-096 canonical approval");
  if (approval.schemaVersion !== "patternly-canonical-content-approval-addendum-v1" ||
      approval.addendumId !== "odk-096-aws-free-node-v1" ||
      approval.approval?.status !== "approved_pending_sync" ||
      approval.canonicalIdentity?.trackId !== trackId ||
      approval.canonicalIdentity?.contentVersion !== canonical.catalogByTrack.get(trackId).contentVersion) {
    fail("EVIDENCE_VALUE", "ODK-096 approval does not bind the current AWS catalog.");
  }
  assertExactSet(additions.map((question) => question.questionId), approval.questionSet?.newQuestionIds, "ODK-096 approved additions");
  if (additions.length !== approval.questionSet.newQuestionCount ||
      additions.some((question) => question.nodeId !== approval.canonicalIdentity.nodeId)) {
    fail("EVIDENCE_MEMBERSHIP", "ODK-096 additions differ from the approved node and count.");
  }
  const sorted = (values) => [...values].sort((left, right) => compare(left.questionId, right.questionId));
  const nodeQuestions = sorted(questions.filter((question) => question.nodeId === approval.canonicalIdentity.nodeId));
  if (nodeQuestions.length !== approval.canonicalIdentity.node.questionCount ||
      sha256(nodeQuestions) !== approval.canonicalIdentity.node.sha256 ||
      questions.length !== approval.canonicalIdentity.track.questionCount ||
      sha256(sorted(questions)) !== approval.canonicalIdentity.track.sha256) {
    fail("HASH_MISMATCH", "Current AWS questions differ from the approved ODK-096 hashes.");
  }
  return additions.map((question) => question.questionId);
}

export async function verifyMigration(options = {}) {
  const contentRoot = typeof options === "string" ? options : options?.contentRoot;
  if (typeof contentRoot !== "string" || contentRoot.length === 0) fail("INPUT", "contentRoot is required.");
  const resolvedContentRoot = await secureRoot(contentRoot);
  const canonical = await loadCanonicalContent(resolvedContentRoot);
  const evidence = await loadEvidence(resolvedContentRoot);
  const approvedAdditions = await approvedAwsAdditions(resolvedContentRoot, canonical, evidence);
  const trackSummaries = [];
  const historicalQuestionsByTrack = new Map();
  for (const trackId of ACCEPTED_TRACK_IDS) {
    const rows = evidence.rowsByTrack.get(trackId);
    const questions = canonical.questionsByTrack.get(trackId);
    const extras = trackId === "aws-certified-solutions-architect-associate" ? approvedAdditions : [];
    assertExactSet(questions.map((question) => question.questionId), [...rows.map((row) => row.questionId), ...extras], `${trackId} current question IDs`);
    const summary = compareTrackMembership(trackId, questions, rows, evidence.manifestTracks.get(trackId));
    const questionById = new Map(questions.map((question) => [question.questionId, question]));
    historicalQuestionsByTrack.set(trackId, rows.map((row) => questionById.get(row.questionId)));
    trackSummaries.push({
      trackId: summary.trackId,
      historicalCounts: summary.counts,
      currentCounts: {
        nodes: new Set(questions.map((question) => question.nodeId)).size,
        mentalUnits: new Set(questions.map((question) => `${question.nodeId}|${question.mentalUnitId}`)).size,
        questions: questions.length
      },
      historicalInteractions: summary.interactions,
      currentInteractions: Object.fromEntries(INTERACTION_TYPES.map((type) => [type, questions.filter((question) => question.interaction.type === type).length])),
      aggregates: summary.aggregates
    });
  }
  const historical = compareGlobal(evidence.manifest, historicalQuestionsByTrack);
  const currentQuestions = ACCEPTED_TRACK_IDS.flatMap((trackId) => canonical.questionsByTrack.get(trackId));
  const currentCounts = {
    tracks: ACCEPTED_TRACK_IDS.length,
    nodes: new Set(currentQuestions.map((question) => `${question.trackId}|${question.nodeId}`)).size,
    mentalUnits: new Set(currentQuestions.map((question) => `${question.trackId}|${question.nodeId}|${question.mentalUnitId}`)).size,
    questions: currentQuestions.length
  };
  const currentInteractions = Object.fromEntries(INTERACTION_TYPES.map((type) => [type, currentQuestions.filter((question) => question.interaction.type === type).length]));
  return {
    result: "passed",
    contentRoot: resolvedContentRoot,
    counts: currentCounts,
    interactions: currentInteractions,
    tracks: trackSummaries,
    historicalCounts: historical.counts,
    approvedAdditionCount: approvedAdditions.length
  };
}

export const verifyCanonicalContent = verifyMigration;

function usage() {
  console.error("Usage: node scripts/content/verify-migration.mjs --content-root <canonical-content-root>");
}

function cliContentRoot(argv) {
  const index = argv.indexOf("--content-root");
  if (index >= 0) return argv[index + 1];
  if (argv.length === 1 && !argv[0].startsWith("-")) return argv[0];
  return undefined;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const contentRoot = cliContentRoot(process.argv.slice(2));
  if (!contentRoot) {
    usage();
    process.exitCode = 2;
  } else {
    try {
      console.log(JSON.stringify(await verifyMigration({ contentRoot }), null, 2));
    } catch (error) {
      if (error instanceof MigrationVerificationError) {
        console.error(error.message);
        for (const detail of error.details) console.error(detail);
      } else {
        console.error(error.stack ?? error.message);
      }
      process.exitCode = 1;
    }
  }
}
