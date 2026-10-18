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
  BIZQ01_BESD_COHORT14_PROOF,
  BIZQ01_BESD_COHORT15_PROOF
} from "../../evidence/migration-verifier/bizq01-besd-cohorts.mjs";
import { FESD_N08_PROOF } from "../../evidence/migration-verifier/fesd-n08.mjs";
import { BIZQ01_COPY_PROOF } from "../../evidence/migration-verifier/bizq01-coding-source-copy.mjs";
import {
  BIZQ01_OOD_PROOF,
  BIZQ01_OOD_SUCCESSOR_PROOF,
  BIZQ01_OOD_COHORT13_PROOF,
  BIZQ01_OOD_COHORT16_PROOF,
  BIZQ01_OOD_COHORT17_PROOF,
  BIZQ01_OOD_COHORT19_PROOF,
  BIZQ01_OOD_COHORT23_PROOF,
  BIZQ01_OOD_COHORT24_PROOF,
  BIZQ01_OOD_COHORT22_PROOF,
  BIZQ01_OOD_COHORT21_PROOF,
  BIZQ01_OOD_COHORT20_PROOF,
  BIZQ01_OOD_REASON_AMENDMENT_19A_PROOF,
  OOD_EXPLANATION_CORRECTIONS_20261013_PROOF
} from "../../evidence/migration-verifier/bizq01-ood.mjs";
import { BIZQ01_PROOF } from "../../evidence/migration-verifier/bizq01-besd-slice.mjs";
import { EXPECTED_CURRENT_PRODUCER_BANKS } from "../../evidence/migration-verifier/current-producer-banks.mjs";
import { AWS_SAA_TARGETED_CORRECTIONS } from "../../evidence/migration-verifier/aws-saa-targeted-corrections.mjs";
import {
  CLAUDE_HISTORICAL_BASELINE,
  CLAUDE_CURRENT_BANK,
  CLAUDE_SUCCESSOR_BANK,
  CLAUDE_CC02_SUCCESSOR_EVIDENCE
} from "../../evidence/migration-verifier/claude-historical.mjs";
import { BIZQ05_GCP_RELATION_AMENDMENT } from "../../evidence/migration-verifier/bizq05-gcp-relation-amendment.mjs";
import {
  EXPECTED_GLOBAL_COUNTS,
  EXPECTED_GLOBAL_INTERACTIONS,
  EXPECTED_TRACK_COUNTS,
  EXPECTED_TRACK_INTERACTIONS,
  EXPECTED_ENVELOPE_COUNTS
} from "../../evidence/migration-verifier/simp03-snapshot.mjs";
import {
  ACCEPTED_TRACK_IDS,
  validateCatalog,
  validateQuestion
} from "./question-contract.mjs";

export { EXPECTED_GLOBAL_COUNTS, EXPECTED_GLOBAL_INTERACTIONS };

export const SIMP03_EVIDENCE_SCHEMA_VERSION = "patternly-simp03-migration-evidence-v1";

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
const BIZQ01_BESD_COHORT14_ROOT_KEYS = ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "questionSetSha256", "replacements"];
const BIZQ01_BESD_COHORT14_ITEM_KEYS = ["sourceFile", "beforeSourceSha256", "sourceSha256", "beforeQuestionId", "questionId", "nodeId", "mentalUnitId", "learningObjective", "confirmedDefects", "identityAction", "identityReason", "acceptedOptionId", "sourceRefs", "beforeQuestion", "currentQuestion"];


function questionChildIdentityFamilies(question) {
  const interaction = question.interaction ?? {};
  return {
    optionIds: interaction.options?.map(({ optionId }) => optionId) ?? [],
    elementIds: interaction.elements?.map(({ elementId }) => elementId) ?? [],
    dimensionIds: interaction.dimensions?.map(({ dimensionId }) => dimensionId) ?? [],
    valueIds: interaction.dimensions?.flatMap(({ values }) => values.map(({ valueId }) => valueId)) ?? []
  };
}

const BIZQ01_COPY_KEYS = ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "questionSetSha256", "sourceFile", "sourceSha256", "beforeSourceSha256", "questionId", "mentalUnitId", "beforeQuestion", "wording", "sources"];
const BIZQ01_OOD_ROOT_KEYS = ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "questionSetSha256", "replacements"];
const BIZQ01_OOD_ITEM_KEYS = ["sourceFile", "beforeSourceSha256", "sourceSha256", "beforeQuestionId", "questionId", "nodeId", "mentalUnitId", "learningObjective", "confirmedDefects", "identityAction", "identityReason", "acceptedOptionId", "sourceRefs", "beforeQuestion", "currentQuestion"];

const BIZQ01_ROOT_KEYS = ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "items", "questionSetSha256"];
const BIZQ01_ITEM_KEYS = ["sourceFile", "beforeQuestionId", "questionId", "mentalUnitId", "learningObjective", "confirmedDefects", "identityAction", "identityReason", "acceptedOptionId", "sourceRefs", "beforeSourceSha256", "sourceSha256", "beforeQuestion"];

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

function trackQuestionSetSha256(questions) {
  return sha256([...questions].sort((left, right) => compare(left.questionId, right.questionId)));
}

function validateCurrentProducerBanks(canonical) {
  for (const [trackId, expected] of Object.entries(EXPECTED_CURRENT_PRODUCER_BANKS)) {
    const questions = canonical.questionsByTrack.get(trackId);
    if (questions.length !== expected.questionCount || trackQuestionSetSha256(questions) !== expected.questionSetSha256) {
      fail("HASH_MISMATCH", `Current ${trackId} bank differs from its fixed accepted ${expected.questionCount}-question bank.`);
    }
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

export async function validateBizq05GcpQuestionRelationAmendment(contentRoot, canonical) {
  const projectRoot = path.dirname(path.resolve(contentRoot));
  const evidencePath = path.join(projectRoot, BIZQ05_GCP_RELATION_AMENDMENT.path);
  await rejectSymlinkAncestors(evidencePath, "BIZQ-05 GCP question relation amendment");
  const evidence = await readJson(evidencePath, "BIZQ-05 GCP question relation amendment");
  const expectedEvidence = {
    schemaVersion: BIZQ05_GCP_RELATION_AMENDMENT.schemaVersion,
    trackId: BIZQ05_GCP_RELATION_AMENDMENT.trackId,
    contentVersion: BIZQ05_GCP_RELATION_AMENDMENT.contentVersion,
    sourcePath: BIZQ05_GCP_RELATION_AMENDMENT.sourcePath,
    predecessor: {
      commit: BIZQ05_GCP_RELATION_AMENDMENT.predecessorCommit,
      sourceSha256: BIZQ05_GCP_RELATION_AMENDMENT.predecessorSourceSha256
    },
    currentSourceSha256: BIZQ05_GCP_RELATION_AMENDMENT.sourceSha256,
    questionIds: BIZQ05_GCP_RELATION_AMENDMENT.questionIds,
    historicalQuestionSetSha256: BIZQ05_GCP_RELATION_AMENDMENT.questionSetSha256,
    relations: BIZQ05_GCP_RELATION_AMENDMENT.relations
  };
  if (canonicalJson(evidence) !== canonicalJson(expectedEvidence)) {
    fail("EVIDENCE_VALUE", "BIZQ-05 GCP question relation amendment differs from its pinned four-question source amendment.");
  }

  // The amendment's contentVersion identifies its historical review snapshot;
  // it is pinned above as evidence and must not pin later policy-only catalog
  // versions. Current source bytes and the restored question set remain pinned
  // independently below.
  const sourcePath = path.join(projectRoot, BIZQ05_GCP_RELATION_AMENDMENT.sourcePath);
  await rejectSymlinkAncestors(sourcePath, "BIZQ-05 GCP question relation source");
  await regularPath(sourcePath, "BIZQ-05 GCP question relation source", "file");
  let sourceBytes;
  try {
    sourceBytes = await readFile(sourcePath);
  } catch (error) {
    fail("READ_ERROR", `Cannot read BIZQ-05 GCP question relation source: ${error.message}`);
  }
  if (sha256(sourceBytes) !== BIZQ05_GCP_RELATION_AMENDMENT.sourceSha256) {
    fail("HASH_MISMATCH", "Current BIZQ-05 GCP question relation source differs from its pinned complete-file hash.");
  }
  let sourceQuestions;
  try {
    sourceQuestions = JSON.parse(sourceBytes.toString("utf8"));
  } catch (error) {
    fail("INVALID_JSON", `BIZQ-05 GCP question relation source is not valid JSON: ${error.message}`);
  }
  if (!Array.isArray(sourceQuestions) || sourceQuestions.length !== BIZQ05_GCP_RELATION_AMENDMENT.questionIds.length) {
    fail("EVIDENCE_MEMBERSHIP", "BIZQ-05 GCP question relation source must contain its exact 22-question unit.");
  }
  assertExactSet(sourceQuestions.map((question) => question?.questionId), BIZQ05_GCP_RELATION_AMENDMENT.questionIds, "BIZQ-05 GCP question relation source IDs");

  const expectedRelations = new Map(BIZQ05_GCP_RELATION_AMENDMENT.relations.map(({ questionId, questionRelation }) => [questionId, questionRelation]));
  const historicalQuestions = sourceQuestions.map((question) => {
    if (!question || typeof question !== "object" || Array.isArray(question)) fail("CANONICAL_INVALID", "BIZQ-05 GCP question relation source contains a non-object question.");
    const expectedRelation = expectedRelations.get(question.questionId);
    if (expectedRelation) {
      if (canonicalJson(question.questionRelation) !== canonicalJson(expectedRelation)) {
        fail("EVIDENCE_VALUE", `BIZQ-05 GCP relation for ${question.questionId} differs from its pinned reviewed payload.`);
      }
      const { questionRelation: _acceptedRelation, ...historicalQuestion } = question;
      return historicalQuestion;
    }
    if (Object.hasOwn(question, "questionRelation")) {
      fail("EVIDENCE_MEMBERSHIP", `BIZQ-05 GCP question ${question.questionId} must not receive a relation amendment.`);
    }
    return question;
  });
  if (sha256(historicalQuestions) !== BIZQ05_GCP_RELATION_AMENDMENT.questionSetSha256) {
    fail("HASH_MISMATCH", "BIZQ-05 GCP pre-relation question unit does not match its pinned historical whole-set hash.");
  }

  const canonicalQuestions = canonical.questionsByTrack.get(BIZQ05_GCP_RELATION_AMENDMENT.trackId);
  if (!Array.isArray(canonicalQuestions)) {
    fail("EVIDENCE_MEMBERSHIP", "BIZQ-05 GCP question relation amendment is missing from canonical content.");
  }
  const currentById = new Map(canonicalQuestions.map((question) => [question.questionId, question]));
  if (sourceQuestions.some((question) => canonicalJson(currentById.get(question.questionId)) !== canonicalJson(question))) {
    fail("HASH_MISMATCH", "BIZQ-05 GCP question relation source differs from the current canonical questions.");
  }
  return new Map(historicalQuestions.map((question) => [question.questionId, question]));
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

async function validateBizq01Source01Proof(contentRoot, canonical, evidence, privateSourceBytesOverrides) {
  const projectRoot = path.dirname(contentRoot);
  const proofPath = path.join(projectRoot, BIZQ01_PROOF.path);
  const info = await lstat(proofPath).catch((error) => {
    if (error?.code === "ENOENT") return undefined;
    fail("PATH_ERROR", `Cannot inspect BIZQ-01 replacement proof: ${error.message}`);
  });
  if (!info) return undefined;
  await rejectSymlinkAncestors(proofPath, "BIZQ-01 replacement proof");
  const manifest = await readJson(proofPath, "BIZQ-01 replacement proof");
  exactKeys(manifest, BIZQ01_ROOT_KEYS, "BIZQ-01 replacement proof");
  if (manifest.schemaVersion !== BIZQ01_PROOF.schemaVersion ||
      manifest.scope !== "BIZQ-01 source slice 01, not full bank acceptance" ||
      manifest.trackId !== BIZQ01_PROOF.trackId ||
      manifest.beforeProducerCommit !== BIZQ01_PROOF.beforeProducerCommit ||
      manifest.beforeContentVersion !== BIZQ01_PROOF.beforeContentVersion ||
      manifest.contentVersion !== BIZQ01_PROOF.contentVersion ||
      manifest.questionSetSha256 !== BIZQ01_PROOF.questionSetSha256) {
    fail("EVIDENCE_VALUE", "BIZQ-01 replacement proof does not match the accepted bounded batch identity.");
  }
  assertHash(manifest.questionSetSha256, "BIZQ-01 replacement proof.questionSetSha256");
  if (!Array.isArray(manifest.items) || manifest.items.length !== BIZQ01_PROOF.replacements.length) {
    fail("EVIDENCE_MEMBERSHIP", "BIZQ-01 replacement proof must contain exactly the two accepted replacements.");
  }
  const trackQuestions = canonical.questionsByTrack.get(BIZQ01_PROOF.trackId);
  const actualTrackHash = trackQuestionSetSha256(trackQuestions);
  if (actualTrackHash !== BIZQ01_PROOF.questionSetSha256) {
    fail("HASH_MISMATCH", "Current BIZQ-01 track question set differs from the accepted replacement proof.");
  }

  const rowsById = new Map(evidence.rowsByTrack.get(BIZQ01_PROOF.trackId).map((row) => [row.questionId, row]));
  const currentById = new Map(trackQuestions.map((question) => [question.questionId, question]));
  const replacements = [];
  for (const [index, accepted] of BIZQ01_PROOF.replacements.entries()) {
    const entry = manifest.items[index];
    const label = `BIZQ-01 replacement proof.items[${index}]`;
    exactKeys(entry, BIZQ01_ITEM_KEYS, label);
    for (const key of ["sourceFile", "beforeQuestionId", "questionId", "mentalUnitId", "beforeSourceSha256", "sourceSha256"]) {
      if (entry[key] !== accepted[key]) fail("EVIDENCE_VALUE", `${label}.${key} does not match the accepted replacement pair.`);
    }
    assertRelativePath(entry.sourceFile, `${label}.sourceFile`, { suffix: ".json" });
    assertHash(entry.beforeSourceSha256, `${label}.beforeSourceSha256`);
    assertHash(entry.sourceSha256, `${label}.sourceSha256`);

    const oldQuestion = entry.beforeQuestion;
    const newQuestion = currentById.get(accepted.questionId);
    if (!newQuestion || currentById.has(accepted.beforeQuestionId)) {
      fail("EVIDENCE_MEMBERSHIP", `${label} does not identify one present replacement and one removed historical item.`);
    }
    const oldRow = rowsById.get(accepted.beforeQuestionId);
    if (!oldRow) fail("EVIDENCE_MEMBERSHIP", `${label} historical item is not present in immutable migration evidence.`);
    assertCanonicalQuestion(oldQuestion, `${label}.beforeQuestion`, ACCEPTED_TRACK_IDS);
    if (oldQuestion.questionId !== accepted.beforeQuestionId || oldQuestion.trackId !== BIZQ01_PROOF.trackId ||
        oldQuestion.mentalUnitId !== accepted.mentalUnitId) {
      fail("EVIDENCE_MEMBERSHIP", `${label}.beforeQuestion identity does not match the accepted historical item.`);
    }
    if (newQuestion.trackId !== oldQuestion.trackId || newQuestion.nodeId !== oldQuestion.nodeId ||
        newQuestion.mentalUnitId !== oldQuestion.mentalUnitId || newQuestion.mentalUnitId !== accepted.mentalUnitId ||
        newQuestion.interaction.type !== oldQuestion.interaction.type) {
      fail("EVIDENCE_MEMBERSHIP", `${label} changes taxonomy or interaction identity.`);
    }
    for (const key of ["trackId", "nodeId", "mentalUnitId"]) {
      if (oldRow[key] !== oldQuestion[key]) fail("EVIDENCE_MEMBERSHIP", `${label} historical evidence ${key} differs from the old question.`);
    }
    assertCanonicalHash(oldRow, oldQuestion, `${label}.beforeQuestion`);

    const sourcePath = path.resolve(projectRoot, ...entry.sourceFile.split("/"));
    await rejectSymlinkAncestors(sourcePath, `${label}.sourceFile`);
    await regularPath(sourcePath, `${label}.sourceFile`, "file");
    const sourceBytes = privateSourceBytesOverrides?.get(accepted.sourceFile) ?? await readFile(sourcePath).catch((error) => fail("READ_ERROR", `Cannot read ${label}.sourceFile: ${error.message}`));
    if (sha256(sourceBytes) !== accepted.sourceSha256) fail("HASH_MISMATCH", `${label}.sourceFile does not match the accepted current source hash.`);
    let sourceQuestions;
    try {
      sourceQuestions = JSON.parse(sourceBytes.toString("utf8"));
    } catch (error) {
      fail("INVALID_JSON", `${label}.sourceFile is not valid JSON: ${error.message}`);
    }
    if (!Array.isArray(sourceQuestions) || sourceQuestions.filter((question) => question?.questionId === accepted.questionId).length !== 1) {
      fail("EVIDENCE_MEMBERSHIP", `${label}.sourceFile must contain exactly one current replacement item.`);
    }
    const authoredQuestion = sourceQuestions.find((question) => question?.questionId === accepted.questionId);
    if (canonicalJson(authoredQuestion) !== canonicalJson(newQuestion)) fail("HASH_MISMATCH", `${label} current source item differs from canonical content.`);
    const canonicalLocation = canonical.questionLocations.get(accepted.questionId);
    if (!canonicalLocation || path.relative(projectRoot, canonicalLocation.path).split(path.sep).join("/") !== accepted.sourceFile) {
      fail("CANONICAL_MEMBERSHIP", `${label} current source item is not at its accepted identity location.`);
    }
    replacements.push({ oldQuestion, newQuestion, beforeQuestionId: accepted.beforeQuestionId, questionId: accepted.questionId });
  }
  return { trackId: BIZQ01_PROOF.trackId, replacements };
}

async function validateBizq01BesdCohort14Proof(contentRoot, canonical, evidence) {
  const accepted = BIZQ01_BESD_COHORT14_PROOF;
  const label = accepted.scope;
  const projectRoot = path.dirname(contentRoot);
  const proofPath = path.join(projectRoot, accepted.path);
  const info = await lstat(proofPath).catch((error) => {
    if (error?.code === "ENOENT") return undefined;
    fail("PATH_ERROR", `Cannot inspect ${label}: ${error.message}`);
  });
  if (!info) fail("EVIDENCE_MEMBERSHIP", `${label} requires its fixed cohort proof.`);
  await rejectSymlinkAncestors(proofPath, label);
  await regularPath(proofPath, label, "file");
  const proof = await readJson(proofPath, label);
  exactKeys(proof, BIZQ01_BESD_COHORT14_ROOT_KEYS, label);
  for (const key of ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "questionSetSha256"]) {
    if (proof[key] !== accepted[key]) fail("EVIDENCE_VALUE", `${label}.${key} differs from the fixed cohort identity.`);
  }
  assertHash(proof.questionSetSha256, `${label}.questionSetSha256`);
  if (!Array.isArray(proof.replacements) || proof.replacements.length !== accepted.replacements.length) {
    fail("EVIDENCE_MEMBERSHIP", `${label} must contain exactly the fixed thirty-two replacements.`);
  }
  const trackQuestions = canonical.questionsByTrack.get(accepted.trackId);
  const currentTrackHash = trackQuestionSetSha256(trackQuestions);
  if (currentTrackHash !== accepted.questionSetSha256) fail("HASH_MISMATCH", `${label} current track question set differs from the fixed cohort descriptor.`);

  const sourceQuestionsByPath = new Map();
  for (const source of accepted.sources) {
    const sourcePath = path.resolve(projectRoot, ...source.sourceFile.split("/"));
    await rejectSymlinkAncestors(sourcePath, `${label}.sourceFile`);
    await regularPath(sourcePath, `${label}.sourceFile`, "file");
    const bytes = await readFile(sourcePath).catch((error) => fail("READ_ERROR", `Cannot read ${label}.sourceFile: ${error.message}`));
    if (sha256(bytes) !== source.sourceSha256) fail("HASH_MISMATCH", `${label}.sourceFile does not match its fixed current hash.`);
    let questions;
    try { questions = JSON.parse(bytes.toString("utf8")); }
    catch (error) { fail("INVALID_JSON", `${label}.sourceFile is not valid JSON: ${error.message}`); }
    if (!Array.isArray(questions)) fail("EVIDENCE_MEMBERSHIP", `${label}.sourceFile must contain a question array.`);
    const expectedIds = accepted.replacements.filter((item) => item.sourceFile === source.sourceFile).map((item) => item.questionId).concat(source.preservedQuestionId);
    assertExactSet(questions.map((question) => question?.questionId), expectedIds, `${label} source membership`);
    const location = canonical.questionLocations.get(source.preservedQuestionId);
    if (!location || path.relative(projectRoot, location.path).split(path.sep).join("/") !== source.sourceFile) {
      fail("CANONICAL_MEMBERSHIP", `${label} preserved item is not at its fixed source location.`);
    }
    for (const item of accepted.replacements.filter((replacement) => replacement.sourceFile === source.sourceFile)) {
      const currentQuestion = trackQuestions.find((question) => question.questionId === item.questionId);
      const sourceQuestion = questions.find((question) => question?.questionId === item.questionId);
      const currentLocation = canonical.questionLocations.get(item.questionId);
      if (!currentQuestion || !sourceQuestion || !currentLocation ||
          path.relative(projectRoot, currentLocation.path).split(path.sep).join("/") !== source.sourceFile ||
          canonicalJson(sourceQuestion) !== canonicalJson(currentQuestion)) {
        fail("CANONICAL_MEMBERSHIP", `${label} current item ${item.questionId} differs from its fixed source location or canonical object.`);
      }
    }
    sourceQuestionsByPath.set(source.sourceFile, questions);
  }

  const currentById = new Map(trackQuestions.map((question) => [question.questionId, question]));
  const replacements = [];
  for (const [index, descriptor] of accepted.replacements.entries()) {
    const itemLabel = `${label}.replacements[${index}]`;
    const entry = proof.replacements[index];
    exactKeys(entry, BIZQ01_BESD_COHORT14_ITEM_KEYS, itemLabel);
    for (const key of ["sourceFile", "beforeSourceSha256", "sourceSha256", "beforeQuestionId", "questionId", "nodeId", "mentalUnitId", "learningObjective", "acceptedOptionId"]) {
      if (entry[key] !== descriptor[key]) fail("EVIDENCE_VALUE", `${itemLabel}.${key} differs from the fixed cohort mapping.`);
    }
    if (canonicalJson(entry.confirmedDefects) !== canonicalJson(accepted.confirmedDefects) ||
        entry.identityAction !== accepted.identityAction || entry.identityReason !== accepted.identityReason ||
        canonicalJson(entry.sourceRefs) !== canonicalJson(descriptor.sourceRefs)) {
      fail("EVIDENCE_VALUE", `${itemLabel} defects, identity rationale, or primary references differ from the fixed cohort review.`);
    }
    assertRelativePath(entry.sourceFile, `${itemLabel}.sourceFile`, { suffix: ".json" });
    assertHash(entry.beforeSourceSha256, `${itemLabel}.beforeSourceSha256`);
    assertHash(entry.sourceSha256, `${itemLabel}.sourceSha256`);
    const oldQuestion = entry.beforeQuestion;
    const currentQuestion = currentById.get(descriptor.questionId);
    const oldRow = evidence.rowsByTrack.get(accepted.trackId).find((row) => row.questionId === descriptor.beforeQuestionId);
    if (!oldQuestion || !currentQuestion || !oldRow || currentById.has(descriptor.beforeQuestionId)) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} must bind one frozen historical object to one current replacement.`);
    }
    assertCanonicalQuestion(oldQuestion, `${itemLabel}.beforeQuestion`, ACCEPTED_TRACK_IDS);
    assertCanonicalQuestion(entry.currentQuestion, `${itemLabel}.currentQuestion`, ACCEPTED_TRACK_IDS);
    if (oldQuestion.questionId !== descriptor.beforeQuestionId || oldQuestion.trackId !== accepted.trackId ||
        oldQuestion.nodeId !== descriptor.nodeId || oldQuestion.mentalUnitId !== descriptor.mentalUnitId ||
        currentQuestion.questionId !== descriptor.questionId || currentQuestion.trackId !== accepted.trackId ||
        currentQuestion.nodeId !== descriptor.nodeId || currentQuestion.mentalUnitId !== descriptor.mentalUnitId ||
        canonicalJson(entry.currentQuestion) !== canonicalJson(currentQuestion)) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} historical/current object identity or taxonomy differs from the fixed cohort.`);
    }
    for (const key of ["trackId", "nodeId", "mentalUnitId"]) {
      if (oldRow[key] !== oldQuestion[key]) fail("EVIDENCE_MEMBERSHIP", `${itemLabel} historical evidence ${key} differs from its old question.`);
    }
    assertCanonicalHash(oldRow, oldQuestion, `${itemLabel}.beforeQuestion`);
    if (currentQuestion.interaction.type !== "choice_single" || currentQuestion.interaction.scoringMethod !== "exact_selected_set" ||
        currentQuestion.answer.type !== "choice_single" || currentQuestion.answer.optionId !== descriptor.acceptedOptionId ||
        currentQuestion.interaction.options.some((option) => oldQuestion.interaction.options.some((old) => old.optionId === option.optionId)) ||
        canonicalJson(currentQuestion.sourceRefs) !== canonicalJson(descriptor.sourceRefs)) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} changes the reviewed interaction, scoring, answer, option identity, or source references.`);
    }
    const sourceQuestion = sourceQuestionsByPath.get(descriptor.sourceFile).find((question) => question.questionId === descriptor.questionId);
    if (canonicalJson(sourceQuestion) !== canonicalJson(currentQuestion)) fail("HASH_MISMATCH", `${itemLabel} source object differs from current canonical content.`);
    replacements.push({ oldQuestion, newQuestion: currentQuestion, beforeQuestionId: descriptor.beforeQuestionId, questionId: descriptor.questionId });
  }

  const predecessorSourceBytes = new Map();
  for (const source of accepted.sources) {
    const cohortIds = new Set(accepted.replacements.filter((item) => item.sourceFile === source.sourceFile).map((item) => item.questionId));
    const oldQuestions = replacements.filter((item) => cohortIds.has(item.questionId)).map((item) => item.oldQuestion);
    const predecessorQuestions = sourceQuestionsByPath.get(source.sourceFile)
      .filter((question) => !cohortIds.has(question.questionId))
      .concat(oldQuestions)
      .sort((left, right) => compare(left.questionId, right.questionId));
    const bytes = Buffer.from(canonicalJson(predecessorQuestions), "utf8");
    if (sha256(bytes) !== source.beforeSourceSha256) {
      fail("HASH_MISMATCH", `${label} does not reconstruct the exact source01 predecessor bytes for ${source.sourceFile}.`);
    }
    predecessorSourceBytes.set(source.sourceFile, bytes);
  }

  const cohortIds = new Set(accepted.replacements.map((item) => item.questionId));
  const historicalTrackQuestions = trackQuestions
    .filter((question) => !cohortIds.has(question.questionId))
    .concat(replacements.map((item) => item.oldQuestion))
    .sort((left, right) => compare(left.questionId, right.questionId));
  const predecessorCatalog = {
    ...canonical.catalog,
    tracks: canonical.catalog.tracks.map((track) => track.trackId === accepted.trackId
      ? { ...track, contentVersion: accepted.beforeContentVersion }
      : track)
  };
  const predecessorLocations = new Map(canonical.questionLocations);
  for (const item of accepted.replacements) {
    predecessorLocations.delete(item.questionId);
    predecessorLocations.set(item.beforeQuestionId, {
      trackId: accepted.trackId,
      nodeId: item.nodeId,
      mentalUnitId: item.mentalUnitId,
      path: path.resolve(projectRoot, ...item.sourceFile.split("/"))
    });
  }
  const predecessorCanonical = {
    ...canonical,
    catalog: predecessorCatalog,
    catalogByTrack: new Map(predecessorCatalog.tracks.map((track) => [track.trackId, track])),
    questionsByTrack: new Map(canonical.questionsByTrack).set(accepted.trackId, historicalTrackQuestions),
    questionLocations: predecessorLocations
  };
  const source01Proof = await validateBizq01Source01Proof(contentRoot, predecessorCanonical, evidence, predecessorSourceBytes);
  if (!source01Proof || source01Proof.replacements.length !== BIZQ01_PROOF.replacements.length) {
    fail("EVIDENCE_MEMBERSHIP", `${label} requires the unchanged source01 proof to validate against its exact reconstructed predecessor.`);
  }
  return { trackId: accepted.trackId, replacements: [...source01Proof.replacements, ...replacements] };
}

async function validateBizq01BesdCohort15Proof(contentRoot, canonical, evidence) {
  const accepted = BIZQ01_BESD_COHORT15_PROOF;
  const label = accepted.scope;
  const projectRoot = path.dirname(contentRoot);
  const proofPath = path.join(projectRoot, accepted.path);
  const info = await lstat(proofPath).catch((error) => {
    if (error?.code === "ENOENT") return undefined;
    fail("PATH_ERROR", `Cannot inspect ${label}: ${error.message}`);
  });
  if (!info) fail("EVIDENCE_MEMBERSHIP", `${label} requires its fixed cohort proof.`);
  await rejectSymlinkAncestors(proofPath, label);
  await regularPath(proofPath, label, "file");
  const proof = await readJson(proofPath, label);
  exactKeys(proof, BIZQ01_BESD_COHORT14_ROOT_KEYS, label);
  for (const key of ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "questionSetSha256"]) {
    if (proof[key] !== accepted[key]) fail("EVIDENCE_VALUE", `${label}.${key} differs from the fixed cohort identity.`);
  }
  assertHash(proof.questionSetSha256, `${label}.questionSetSha256`);
  if (accepted.replacements.length !== 134 || !Array.isArray(proof.replacements) || proof.replacements.length !== 134) {
    fail("EVIDENCE_MEMBERSHIP", `${label} must contain exactly the fixed 134 replacements.`);
  }
  const trackQuestions = canonical.questionsByTrack.get(accepted.trackId);
  if (trackQuestions.length !== EXPECTED_TRACK_COUNTS[accepted.trackId].questions ||
      trackQuestionSetSha256(trackQuestions) !== accepted.questionSetSha256) {
    fail("HASH_MISMATCH", `${label} current track differs from the fixed reviewed cohort descriptor.`);
  }
  const currentById = new Map(trackQuestions.map((question) => [question.questionId, question]));
  const oldIds = new Set();
  const newIds = new Set();
  const sourceQuestionsByPath = new Map();
  for (const source of accepted.sources) {
    const sourcePath = path.resolve(projectRoot, ...source.sourceFile.split("/"));
    await rejectSymlinkAncestors(sourcePath, `${label}.sourceFile`);
    await regularPath(sourcePath, `${label}.sourceFile`, "file");
    const bytes = await readFile(sourcePath).catch((error) => fail("READ_ERROR", `Cannot read ${label}.sourceFile: ${error.message}`));
    if (sha256(bytes) !== source.sourceSha256) fail("HASH_MISMATCH", `${label}.sourceFile hash differs from the fixed reviewed map.`);
    let questions;
    try { questions = JSON.parse(bytes.toString("utf8")); }
    catch (error) { fail("INVALID_JSON", `${label}.sourceFile is invalid JSON: ${error.message}`); }
    if (!Array.isArray(questions)) fail("EVIDENCE_MEMBERSHIP", `${label}.sourceFile must contain a question array.`);
    const descriptors = accepted.replacements.filter((item) => item.sourceFile === source.sourceFile);
    assertExactSet(questions.map((question) => question?.questionId), descriptors.map((item) => item.questionId), `${label} source membership`);
    for (const descriptor of descriptors) {
      const current = currentById.get(descriptor.questionId);
      const authored = questions.find((question) => question?.questionId === descriptor.questionId);
      const location = canonical.questionLocations.get(descriptor.questionId);
      if (!current || !authored || !location || path.relative(projectRoot, location.path).split(path.sep).join("/") !== source.sourceFile || canonicalJson(authored) !== canonicalJson(current)) {
        fail("CANONICAL_MEMBERSHIP", `${label} current item ${descriptor.questionId} differs from its fixed source location.`);
      }
    }
    sourceQuestionsByPath.set(source.sourceFile, questions);
  }
  const replacements = [];
  for (const [index, descriptor] of accepted.replacements.entries()) {
    const itemLabel = `${label}.replacements[${index}]`;
    const entry = proof.replacements[index];
    exactKeys(entry, BIZQ01_BESD_COHORT14_ITEM_KEYS, itemLabel);
    for (const key of ["sourceFile", "beforeSourceSha256", "sourceSha256", "beforeQuestionId", "questionId", "nodeId", "mentalUnitId", "learningObjective", "acceptedOptionId"]) {
      if (entry[key] !== descriptor[key]) fail("EVIDENCE_VALUE", `${itemLabel}.${key} differs from the fixed reviewed mapping.`);
    }
    if (canonicalJson(entry.confirmedDefects) !== canonicalJson(descriptor.confirmedDefects) ||
        entry.identityAction !== accepted.identityAction || entry.identityReason !== accepted.identityReason ||
        canonicalJson(entry.sourceRefs) !== canonicalJson(descriptor.sourceRefs)) {
      fail("EVIDENCE_VALUE", `${itemLabel} reviewed defect, identity rationale, or references differ from the fixed map.`);
    }
    assertRelativePath(entry.sourceFile, `${itemLabel}.sourceFile`, { suffix: ".json" });
    const oldQuestion = entry.beforeQuestion;
    const currentQuestion = currentById.get(descriptor.questionId);
    const oldRow = evidence.rowsByTrack.get(accepted.trackId).find((row) => row.questionId === descriptor.beforeQuestionId);
    if (!oldQuestion || !currentQuestion || !oldRow || currentById.has(descriptor.beforeQuestionId) || oldIds.has(descriptor.beforeQuestionId) || newIds.has(descriptor.questionId)) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} must bind one absent historical identity to one unique current replacement.`);
    }
    oldIds.add(descriptor.beforeQuestionId); newIds.add(descriptor.questionId);
    assertCanonicalQuestion(oldQuestion, `${itemLabel}.beforeQuestion`, ACCEPTED_TRACK_IDS);
    assertCanonicalQuestion(entry.currentQuestion, `${itemLabel}.currentQuestion`, ACCEPTED_TRACK_IDS);
    if (oldQuestion.questionId !== descriptor.beforeQuestionId || oldQuestion.trackId !== accepted.trackId || oldQuestion.nodeId !== descriptor.nodeId || oldQuestion.mentalUnitId !== descriptor.mentalUnitId ||
        currentQuestion.questionId !== descriptor.questionId || currentQuestion.trackId !== accepted.trackId || currentQuestion.nodeId !== descriptor.nodeId || currentQuestion.mentalUnitId !== descriptor.mentalUnitId || currentQuestion.difficulty !== oldQuestion.difficulty ||
        canonicalJson(entry.currentQuestion) !== canonicalJson(currentQuestion)) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} changes fixed identity, taxonomy, or current source object.`);
    }
    for (const key of ["trackId", "nodeId", "mentalUnitId"]) if (oldRow[key] !== oldQuestion[key]) fail("EVIDENCE_MEMBERSHIP", `${itemLabel} historical membership differs.`);
    assertCanonicalHash(oldRow, oldQuestion, `${itemLabel}.beforeQuestion`);
    if (currentQuestion.interaction.type !== "choice_single" || currentQuestion.interaction.scoringMethod !== "exact_selected_set" || currentQuestion.answer.type !== "choice_single" || currentQuestion.answer.optionId !== descriptor.acceptedOptionId ||
        currentQuestion.interaction.options.some((option) => oldQuestion.interaction.options.some((old) => old.optionId === option.optionId)) || canonicalJson(currentQuestion.sourceRefs) !== canonicalJson(descriptor.sourceRefs)) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} reuses a prior answer identity or changes the reviewed scoring/references.`);
    }
    const sourceQuestion = sourceQuestionsByPath.get(descriptor.sourceFile).find((question) => question.questionId === descriptor.questionId);
    if (canonicalJson(sourceQuestion) !== canonicalJson(currentQuestion)) fail("HASH_MISMATCH", `${itemLabel} source differs from its canonical object.`);
    replacements.push({ oldQuestion, newQuestion: currentQuestion, beforeQuestionId: descriptor.beforeQuestionId, questionId: descriptor.questionId });
  }
  const previousTrack = trackQuestions.filter((question) => !newIds.has(question.questionId)).concat(replacements.map((item) => item.oldQuestion)).sort((left, right) => compare(left.questionId, right.questionId));
  for (const source of accepted.sources) {
    const sourceDescriptors = accepted.replacements.filter((item) => item.sourceFile === source.sourceFile);
    const sourceNewIds = new Set(sourceDescriptors.map((item) => item.questionId));
    const predecessorQuestions = sourceQuestionsByPath.get(source.sourceFile).filter((question) => !sourceNewIds.has(question.questionId)).concat(replacements.filter((item) => sourceNewIds.has(item.questionId)).map((item) => item.oldQuestion)).sort((left, right) => compare(left.questionId, right.questionId));
    if (sha256(Buffer.from(JSON.stringify(predecessorQuestions), "utf8")) !== source.beforeSourceSha256) fail("HASH_MISMATCH", `${label} cannot reconstruct source14 bytes for ${source.sourceFile}.`);
  }
  if (trackQuestionSetSha256(previousTrack) !== accepted.beforeQuestionSetSha256) fail("HASH_MISMATCH", `${label} cannot reconstruct exact source14 track content.`);
  const predecessorLocations = new Map(canonical.questionLocations);
  for (const item of accepted.replacements) {
    predecessorLocations.delete(item.questionId);
    predecessorLocations.set(item.beforeQuestionId, { trackId: accepted.trackId, nodeId: item.nodeId, mentalUnitId: item.mentalUnitId, path: path.resolve(projectRoot, ...item.sourceFile.split("/")) });
  }
  const predecessorCatalog = { ...canonical.catalog, tracks: canonical.catalog.tracks.map((track) => track.trackId === accepted.trackId ? { ...track, contentVersion: BIZQ01_BESD_COHORT14_PROOF.contentVersion } : track) };
  const predecessorCanonical = { ...canonical, catalog: predecessorCatalog, catalogByTrack: new Map(predecessorCatalog.tracks.map((track) => [track.trackId, track])), questionsByTrack: new Map(canonical.questionsByTrack).set(accepted.trackId, previousTrack), questionLocations: predecessorLocations };
  const priorProof = await validateBizq01BesdCohort14Proof(contentRoot, predecessorCanonical, evidence);
  return { trackId: accepted.trackId, replacements: [...priorProof.replacements, ...replacements] };
}

async function loadBizq01ReplacementProof(contentRoot, canonical, evidence) {
  const trackId = BIZQ01_BESD_COHORT15_PROOF.trackId;
  const questions = canonical.questionsByTrack.get(trackId);
  if (questions.length !== EXPECTED_TRACK_COUNTS[trackId].questions ||
      trackQuestionSetSha256(questions) !== BIZQ01_BESD_COHORT15_PROOF.questionSetSha256) {
    fail("HASH_MISMATCH", "Current BESD bank does not match the fixed latest accepted 1,569-question cohort15 bank.");
  }
  return validateBizq01BesdCohort15Proof(contentRoot, canonical, evidence);
}

async function validateBizq01OodSemanticProof(contentRoot, canonical, evidence, accepted, optionCount, sourceBytesOverride) {
  const labelPrefix = accepted.scope;
  const projectRoot = path.dirname(contentRoot);
  const proofPath = path.join(projectRoot, accepted.path);
  const info = await lstat(proofPath).catch((error) => {
    if (error?.code === "ENOENT") return undefined;
    fail("PATH_ERROR", `Cannot inspect BIZQ-01 OOD semantic proof: ${error.message}`);
  });
  if (!info) return undefined;
  await rejectSymlinkAncestors(proofPath, labelPrefix);
  const proof = await readJson(proofPath, labelPrefix);
  exactKeys(proof, BIZQ01_OOD_ROOT_KEYS, labelPrefix);
  for (const key of ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "questionSetSha256"]) {
    if (proof[key] !== accepted[key]) fail("EVIDENCE_VALUE", `${labelPrefix}.${key} differs from the accepted batch identity.`);
  }
  assertHash(proof.questionSetSha256, "BIZQ-01 OOD semantic proof.questionSetSha256");
  if (!Array.isArray(proof.replacements) || proof.replacements.length !== 1) {
    fail("EVIDENCE_MEMBERSHIP", "BIZQ-01 OOD semantic proof must contain exactly the accepted one-question replacement.");
  }

  const entry = proof.replacements[0];
  const label = "BIZQ-01 OOD semantic proof.replacements[0]";
  exactKeys(entry, BIZQ01_OOD_ITEM_KEYS, label);
  const replacement = accepted.replacement;
  for (const key of ["sourceFile", "beforeQuestionId", "questionId", "nodeId", "mentalUnitId", "beforeSourceSha256", "sourceSha256", "learningObjective", "identityAction", "identityReason", "acceptedOptionId"]) {
    if (entry[key] !== replacement[key]) fail("EVIDENCE_VALUE", `${label}.${key} differs from the accepted replacement identity.`);
  }
  if (canonicalJson(entry.confirmedDefects) !== canonicalJson(replacement.confirmedDefects) ||
      canonicalJson(entry.sourceRefs) !== canonicalJson(replacement.sourceRefs)) {
    fail("EVIDENCE_VALUE", `${label} defect or source references differ from the accepted review.`);
  }
  assertRelativePath(entry.sourceFile, `${label}.sourceFile`, { suffix: ".json" });
  assertHash(entry.beforeSourceSha256, `${label}.beforeSourceSha256`);
  assertHash(entry.sourceSha256, `${label}.sourceSha256`);

  const trackQuestions = canonical.questionsByTrack.get(accepted.trackId);
  const currentTrackHash = sha256([...trackQuestions].sort((left, right) => compare(left.questionId, right.questionId)));
  if (currentTrackHash !== accepted.questionSetSha256) fail("HASH_MISMATCH", `${labelPrefix} current track question set differs from the accepted proof.`);
  const currentById = new Map(trackQuestions.map((question) => [question.questionId, question]));
  const currentQuestion = currentById.get(replacement.questionId);
  if (!currentQuestion || currentById.has(replacement.beforeQuestionId)) {
    fail("EVIDENCE_MEMBERSHIP", `${label} must identify one current item and one removed historical item.`);
  }

  const oldRow = evidence.rowsByTrack.get(accepted.trackId).find((row) => row.questionId === replacement.beforeQuestionId);
  if (!oldRow) fail("EVIDENCE_MEMBERSHIP", `${label} old question is absent from immutable migration evidence.`);
  const oldQuestion = entry.beforeQuestion;
  assertCanonicalQuestion(oldQuestion, `${label}.beforeQuestion`, ACCEPTED_TRACK_IDS);
  if (oldQuestion.questionId !== replacement.beforeQuestionId || oldQuestion.trackId !== accepted.trackId ||
      oldQuestion.nodeId !== replacement.nodeId || oldQuestion.mentalUnitId !== replacement.mentalUnitId) {
    fail("EVIDENCE_MEMBERSHIP", `${label}.beforeQuestion does not match the frozen OOD identity.`);
  }
  for (const key of ["trackId", "nodeId", "mentalUnitId"]) {
    if (oldRow[key] !== oldQuestion[key]) fail("EVIDENCE_MEMBERSHIP", `${label} frozen evidence ${key} differs from the old question.`);
  }
  assertCanonicalHash(oldRow, oldQuestion, `${label}.beforeQuestion`);

  assertCanonicalQuestion(entry.currentQuestion, `${label}.currentQuestion`, ACCEPTED_TRACK_IDS);
  if (canonicalJson(entry.currentQuestion) !== canonicalJson(currentQuestion)) {
    fail("HASH_MISMATCH", `${label}.currentQuestion does not exactly match current canonical content.`);
  }
  if (currentQuestion.questionId !== replacement.questionId || currentQuestion.trackId !== accepted.trackId ||
      currentQuestion.nodeId !== replacement.nodeId || currentQuestion.mentalUnitId !== replacement.mentalUnitId ||
      currentQuestion.interaction.type !== "choice_single" || currentQuestion.interaction.scoringMethod !== "exact_selected_set" ||
      currentQuestion.answer.type !== "choice_single" || currentQuestion.answer.optionId !== replacement.acceptedOptionId) {
    fail("EVIDENCE_MEMBERSHIP", `${label} changes the reviewed OOD track, taxonomy, interaction, scoring or accepted option identity.`);
  }
  const currentOptionIds = currentQuestion.interaction.options.map((option) => option.optionId);
  const oldOptionIds = new Set(oldQuestion.interaction.options.map((option) => option.optionId));
  if (currentOptionIds.length !== optionCount || new Set(currentOptionIds).size !== optionCount ||
      currentOptionIds.some((optionId) => oldOptionIds.has(optionId))) {
    fail("EVIDENCE_MEMBERSHIP", `${label} must use ${optionCount} unique, new option identities for the changed decision.`);
  }
  if (canonicalJson(currentQuestion.sourceRefs) !== canonicalJson(replacement.sourceRefs)) {
    fail("EVIDENCE_VALUE", `${label} source references differ from the reviewed primary sources.`);
  }

  const sourcePath = path.resolve(projectRoot, ...entry.sourceFile.split("/"));
  await rejectSymlinkAncestors(sourcePath, `${label}.sourceFile`);
  await regularPath(sourcePath, `${label}.sourceFile`, "file");
  const sourceBytes = sourceBytesOverride ?? await readFile(sourcePath).catch((error) => fail("READ_ERROR", `Cannot read ${label}.sourceFile: ${error.message}`));
  if (sha256(sourceBytes) !== replacement.sourceSha256) fail("HASH_MISMATCH", `${label}.sourceFile does not match the accepted current source hash.`);
  let sourceQuestions;
  try {
    sourceQuestions = JSON.parse(sourceBytes.toString("utf8"));
  } catch (error) {
    fail("INVALID_JSON", `${label}.sourceFile is not valid JSON: ${error.message}`);
  }
  if (!Array.isArray(sourceQuestions) || sourceQuestions.filter((question) => question?.questionId === replacement.questionId).length !== 1 ||
      sourceQuestions.some((question) => question?.questionId === replacement.beforeQuestionId)) {
    fail("EVIDENCE_MEMBERSHIP", `${label}.sourceFile must contain the new item exactly once and omit its historical identity.`);
  }
  const authoredQuestion = sourceQuestions.find((question) => question?.questionId === replacement.questionId);
  if (canonicalJson(authoredQuestion) !== canonicalJson(currentQuestion)) fail("HASH_MISMATCH", `${label} source item differs from current canonical content.`);
  const location = canonical.questionLocations.get(replacement.questionId);
  if (!location || path.relative(projectRoot, location.path).split(path.sep).join("/") !== replacement.sourceFile) {
    fail("CANONICAL_MEMBERSHIP", `${label} current item is not at its accepted canonical source location.`);
  }
  return {
    trackId: accepted.trackId,
    replacements: [{ oldQuestion, newQuestion: currentQuestion, beforeQuestionId: replacement.beforeQuestionId, questionId: replacement.questionId }]
  };
}

async function validateBizq01OodCohort13Proof(contentRoot, canonical, evidence) {
  const accepted = BIZQ01_OOD_COHORT13_PROOF;
  const label = accepted.scope;
  const projectRoot = path.dirname(contentRoot);
  const proofPath = path.join(projectRoot, accepted.path);
  const proofInfo = await lstat(proofPath).catch((error) => {
    if (error?.code === "ENOENT") return undefined;
    fail("PATH_ERROR", `Cannot inspect ${label}: ${error.message}`);
  });
  if (!proofInfo) return undefined;
  await rejectSymlinkAncestors(proofPath, label);
  const proof = await readJson(proofPath, label);
  exactKeys(proof, BIZQ01_OOD_ROOT_KEYS, label);
  for (const key of ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "questionSetSha256"]) {
    if (proof[key] !== accepted[key]) fail("EVIDENCE_VALUE", `${label}.${key} differs from the accepted batch identity.`);
  }
  if (!Array.isArray(proof.replacements) || proof.replacements.length !== accepted.replacements.length) {
    fail("EVIDENCE_MEMBERSHIP", `${label} must contain exactly the accepted fifteen replacements.`);
  }
  const questions = canonical.questionsByTrack.get(accepted.trackId);
  if (sha256([...questions].sort((left, right) => compare(left.questionId, right.questionId))) !== accepted.questionSetSha256) {
    fail("HASH_MISMATCH", `${label} current track question set differs from the accepted proof.`);
  }
  const currentById = new Map(questions.map((question) => [question.questionId, question]));
  const oldIds = new Set(accepted.replacements.map((item) => item.beforeQuestionId));
  const sourcePath = path.resolve(projectRoot, ...accepted.sourceFile.split("/"));
  await rejectSymlinkAncestors(sourcePath, `${label}.sourceFile`);
  await regularPath(sourcePath, `${label}.sourceFile`, "file");
  const sourceBytes = await readFile(sourcePath).catch((error) => fail("READ_ERROR", `Cannot read ${label}.sourceFile: ${error.message}`));
  if (sha256(sourceBytes) !== accepted.sourceSha256) fail("HASH_MISMATCH", `${label}.sourceFile does not match the accepted current source hash.`);
  let sourceQuestions;
  try { sourceQuestions = JSON.parse(sourceBytes.toString("utf8")); }
  catch (error) { fail("INVALID_JSON", `${label}.sourceFile is not valid JSON: ${error.message}`); }
  if (!Array.isArray(sourceQuestions) || sourceQuestions.length !== questions.filter((q) => q.mentalUnitId === accepted.mentalUnitId).length ||
      accepted.replacements.some((item) => sourceQuestions.filter((q) => q?.questionId === item.questionId).length !== 1 || sourceQuestions.some((q) => q?.questionId === item.beforeQuestionId))) {
    fail("EVIDENCE_MEMBERSHIP", `${label}.sourceFile must contain every current cohort item once and omit every historical identity.`);
  }

  const replacements = [];
  for (const [index, item] of accepted.replacements.entries()) {
    const entry = proof.replacements[index];
    const itemLabel = `${label}.replacements[${index}]`;
    exactKeys(entry, BIZQ01_OOD_ITEM_KEYS, itemLabel);
    for (const key of ["sourceFile", "beforeQuestionId", "questionId", "nodeId", "mentalUnitId", "beforeSourceSha256", "sourceSha256", "learningObjective", "identityAction", "identityReason", "acceptedOptionId"]) {
      const value = key === "sourceFile" ? accepted.sourceFile
        : key === "beforeSourceSha256" ? accepted.beforeSourceSha256
          : key === "sourceSha256" ? accepted.sourceSha256
            : key === "nodeId" ? accepted.nodeId
              : key === "mentalUnitId" ? accepted.mentalUnitId
                : key === "identityAction" ? accepted.identityAction
                  : key === "identityReason" ? accepted.identityReason
                    : item[key];
      if (entry[key] !== value) fail("EVIDENCE_VALUE", `${itemLabel}.${key} differs from the accepted cohort descriptor.`);
    }
    if (canonicalJson(entry.confirmedDefects) !== canonicalJson(accepted.confirmedDefects) ||
        canonicalJson(entry.sourceRefs) !== canonicalJson(["https://www.omg.org/spec/UML/2.5.1/PDF"])) {
      fail("EVIDENCE_VALUE", `${itemLabel} defects or primary references differ from the accepted cohort descriptor.`);
    }
    const oldQuestion = entry.beforeQuestion;
    const currentQuestion = currentById.get(item.questionId);
    const oldRow = evidence.rowsByTrack.get(accepted.trackId).find((row) => row.questionId === item.beforeQuestionId);
    if (!oldQuestion || !currentQuestion || !oldRow || currentById.has(item.beforeQuestionId)) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} must bind one frozen historical item to one current replacement.`);
    }
    assertCanonicalQuestion(oldQuestion, `${itemLabel}.beforeQuestion`, ACCEPTED_TRACK_IDS);
    assertCanonicalQuestion(entry.currentQuestion, `${itemLabel}.currentQuestion`, ACCEPTED_TRACK_IDS);
    if (oldQuestion.questionId !== item.beforeQuestionId || oldQuestion.trackId !== accepted.trackId ||
        oldQuestion.nodeId !== accepted.nodeId || oldQuestion.mentalUnitId !== accepted.mentalUnitId ||
        currentQuestion.questionId !== item.questionId || currentQuestion.trackId !== accepted.trackId ||
        currentQuestion.nodeId !== accepted.nodeId || currentQuestion.mentalUnitId !== accepted.mentalUnitId ||
        canonicalJson(entry.currentQuestion) !== canonicalJson(currentQuestion)) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} changes the reviewed taxonomy or current authored object.`);
    }
    for (const key of ["trackId", "nodeId", "mentalUnitId"]) {
      if (oldRow[key] !== oldQuestion[key]) fail("EVIDENCE_MEMBERSHIP", `${itemLabel} historical evidence ${key} differs from the old question.`);
    }
    assertCanonicalHash(oldRow, oldQuestion, `${itemLabel}.beforeQuestion`);
    if (currentQuestion.interaction.type !== "choice_single" || currentQuestion.interaction.scoringMethod !== "exact_selected_set" ||
        currentQuestion.answer.type !== "choice_single" || currentQuestion.answer.optionId !== item.acceptedOptionId ||
        currentQuestion.interaction.options.length !== 4 || currentQuestion.interaction.options.some((option) => oldQuestion.interaction.options.some((old) => old.optionId === option.optionId)) ||
        canonicalJson(currentQuestion.sourceRefs) !== canonicalJson(["https://www.omg.org/spec/UML/2.5.1/PDF"])) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} changes the reviewed interaction, scoring, accepted answer, option identity, or primary reference.`);
    }
    if (canonicalJson(sourceQuestions.find((question) => question?.questionId === item.questionId)) !== canonicalJson(currentQuestion)) {
      fail("HASH_MISMATCH", `${itemLabel} source object differs from current canonical content.`);
    }
    const location = canonical.questionLocations.get(item.questionId);
    if (!location || path.relative(projectRoot, location.path).split(path.sep).join("/") !== accepted.sourceFile) {
      fail("CANONICAL_MEMBERSHIP", `${itemLabel} current item is not at its accepted source location.`);
    }
    replacements.push({ oldQuestion, newQuestion: currentQuestion, beforeQuestionId: item.beforeQuestionId, questionId: item.questionId });
  }
  if (accepted.replacements.some((item) => !oldIds.has(item.beforeQuestionId))) fail("EVIDENCE_MEMBERSHIP", `${label} descriptor is internally inconsistent.`);
  return { trackId: accepted.trackId, replacements };
}










const BIZQ01_OOD_COHORT21_ROOT_KEYS = ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "beforeQuestionSetSha256", "questionSetSha256", "sourceFiles", "replacements", "sameIdCorrections"];

const BIZQ01_OOD_COHORT23_ROOT_KEYS = ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "beforeQuestionSetSha256", "questionSetSha256", "sourceFiles", "replacements", "sameIdCorrections"];
const BIZQ01_OOD_COHORT23_SOURCE_KEYS = ["sourceFile", "beforeSourceSha256", "sourceSha256", "nodeId", "mentalUnitId"];
const BIZQ01_OOD_COHORT23_ITEM_KEYS = ["sourceFile", "beforeSourceSha256", "sourceSha256", "beforeQuestionId", "questionId", "nodeId", "mentalUnitId", "learningObjective", "confirmedDefects", "identityAction", "identityReason", "acceptedOptionId", "sourceRefs", "beforeQuestion", "currentQuestion"];
const BIZQ01_OOD_COHORT24_ROOT_KEYS = BIZQ01_OOD_COHORT23_ROOT_KEYS;
const BIZQ01_OOD_COHORT24_SOURCE_KEYS = BIZQ01_OOD_COHORT23_SOURCE_KEYS;
const BIZQ01_OOD_COHORT24_ITEM_KEYS = BIZQ01_OOD_COHORT23_ITEM_KEYS;
const BIZQ01_OOD_COHORT22_ROOT_KEYS = ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "beforeQuestionSetSha256", "questionSetSha256", "sourceFiles", "replacements", "sameIdCorrections"];
const BIZQ01_OOD_COHORT22_SOURCE_KEYS = ["sourceFile", "beforeSourceSha256", "sourceSha256", "nodeId", "mentalUnitId"];
const BIZQ01_OOD_COHORT22_ITEM_KEYS = ["sourceFile", "beforeSourceSha256", "sourceSha256", "beforeQuestionId", "questionId", "nodeId", "mentalUnitId", "learningObjective", "confirmedDefects", "identityAction", "identityReason", "acceptedOptionId", "sourceRefs", "beforeQuestion", "currentQuestion"];
const BIZQ01_OOD_COHORT21_SOURCE_KEYS = ["sourceFile", "beforeSourceSha256", "sourceSha256", "nodeId", "mentalUnitId"];
const BIZQ01_OOD_COHORT21_ITEM_KEYS = ["sourceFile", "beforeSourceSha256", "sourceSha256", "beforeQuestionId", "questionId", "nodeId", "mentalUnitId", "learningObjective", "confirmedDefects", "identityAction", "identityReason", "acceptedOptionId", "sourceRefs", "beforeQuestion", "currentQuestion"];
const BIZQ01_OOD_COHORT20_ROOT_KEYS = ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "beforeQuestionSetSha256", "questionSetSha256", "sourceFiles", "replacements", "sameIdCorrections"];
const BIZQ01_OOD_COHORT20_SOURCE_KEYS = ["sourceFile", "beforeSourceSha256", "sourceSha256", "nodeId", "mentalUnitId"];
const BIZQ01_OOD_COHORT20_ITEM_KEYS = ["sourceFile", "beforeSourceSha256", "sourceSha256", "beforeQuestionId", "questionId", "nodeId", "mentalUnitId", "learningObjective", "confirmedDefects", "identityAction", "identityReason", "acceptedOptionId", "sourceRefs", "beforeQuestion", "currentQuestion"];
const BIZQ01_OOD_REASON_AMENDMENT_19A_ROOT_KEYS = ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "beforeQuestionSetSha256", "questionSetSha256", "sourceFiles", "replacements"];
const BIZQ01_OOD_REASON_AMENDMENT_19A_SOURCE_KEYS = ["sourceFile", "beforeSourceSha256", "sourceSha256", "nodeId", "mentalUnitId"];
const BIZQ01_OOD_REASON_AMENDMENT_19A_ITEM_KEYS = ["sourceFile", "questionId", "mentalUnitId", "beforeReason", "reason", "beforeQuestionSha256", "questionSha256"];
const OOD_REASON_AMENDMENT_19A_PRIVATE_CONTEXT = Symbol("fixed OOD reason amendment 19a historical source context");
const OOD_EXPLANATION_CORRECTION_ROOT_KEYS = ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "beforeQuestionSetSha256", "questionSetSha256", "sourceFiles", "items"];
const OOD_EXPLANATION_CORRECTION_SOURCE_KEYS = ["sourceFile", "beforeSourceSha256", "sourceSha256"];
const OOD_EXPLANATION_CORRECTION_ITEM_KEYS = ["questionId", "sourceFile", "identityAction", "identityReason", "beforeQuestion", "currentQuestion"];
const OOD_EXPLANATION_CORRECTION_ALLOWED_PATHS = new Set([
  "feedback.details.boundaryOrTradeoff",
  "feedback.details.errorCorrection",
  "feedback.details.mechanismOrProperty",
  "feedback.messages[].text",
  "feedback.reason"
]);

function oodHistoricalSourceOverridesFor(accepted, overrides, label) {
  if (overrides === undefined) return undefined;
  if (!(overrides instanceof Map)) fail("EVIDENCE_VALUE", `${label} historical source overrides must be a fixed proof map.`);
  const applicable = new Map();
  for (const source of accepted.sourceFiles) {
    const bytes = overrides.get(source.sourceFile);
    if (bytes === undefined) continue;
    if (!Buffer.isBuffer(bytes) || sha256(bytes) !== source.sourceSha256) {
      fail("HASH_MISMATCH", `${label} historical source override does not match the fixed source hash for ${source.sourceFile}.`);
    }
    applicable.set(source.sourceFile, bytes);
  }
  return applicable;
}

const BIZQ01_OOD_COHORT17_ROOT_KEYS = ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "beforeQuestionSetSha256", "questionSetSha256", "sourceFiles", "identityAction", "identityReason", "confirmedDefects", "replacements"];
const BIZQ01_OOD_COHORT17_SOURCE_KEYS = ["sourceFile", "beforeSourceSha256", "sourceSha256", "nodeId", "mentalUnitId"];

const BIZQ01_OOD_COHORT16_ROOT_KEYS = ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "beforeQuestionSetSha256", "questionSetSha256", "sourceFiles", "identityAction", "identityReason", "confirmedDefects", "replacements"];
const BIZQ01_OOD_COHORT16_SOURCE_KEYS = ["sourceFile", "beforeSourceSha256", "sourceSha256", "nodeId", "mentalUnitId"];

async function validateBizq01OodCohort16Proof(contentRoot, canonical, evidence, explanationHistoricalSourceBytes) {
  const accepted = BIZQ01_OOD_COHORT16_PROOF;
  const label = accepted.scope;
  const applicableExplanationSourceBytes = oodHistoricalSourceOverridesFor(accepted, explanationHistoricalSourceBytes, label);
  const projectRoot = path.dirname(contentRoot);
  const proofPath = path.join(projectRoot, accepted.path);
  const proofInfo = await lstat(proofPath).catch((error) => {
    if (error?.code === "ENOENT") return undefined;
    fail("PATH_ERROR", `Cannot inspect ${label}: ${error.message}`);
  });
  if (!proofInfo) return undefined;
  await rejectSymlinkAncestors(proofPath, label);
  const proof = await readJson(proofPath, label);
  exactKeys(proof, BIZQ01_OOD_COHORT16_ROOT_KEYS, label);
  for (const key of ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "beforeQuestionSetSha256", "questionSetSha256", "identityAction", "identityReason"]) {
    if (proof[key] !== accepted[key]) fail("EVIDENCE_VALUE", `${label}.${key} differs from the fixed cohort identity.`);
  }
  if (canonicalJson(proof.confirmedDefects) !== canonicalJson(accepted.confirmedDefects)) {
    fail("EVIDENCE_VALUE", `${label}.confirmedDefects differ from the fixed cohort descriptor.`);
  }
  assertHash(proof.beforeQuestionSetSha256, `${label}.beforeQuestionSetSha256`);
  assertHash(proof.questionSetSha256, `${label}.questionSetSha256`);
  const currentTrackQuestions = canonical.questionsByTrack.get(accepted.trackId);
  if (sha256([...currentTrackQuestions].sort((left, right) => compare(left.questionId, right.questionId))) !== accepted.questionSetSha256) {
    fail("HASH_MISMATCH", `${label} current OOD question set differs from the fixed cohort descriptor.`);
  }
  if (!Array.isArray(proof.sourceFiles) || proof.sourceFiles.length !== accepted.sourceFiles.length) {
    fail("EVIDENCE_MEMBERSHIP", `${label} must identify exactly the seven fixed source files.`);
  }
  const sourcesByPath = new Map();
  for (const [index, source] of accepted.sourceFiles.entries()) {
    const entry = proof.sourceFiles[index];
    const sourceLabel = `${label}.sourceFiles[${index}]`;
    exactKeys(entry, BIZQ01_OOD_COHORT16_SOURCE_KEYS, sourceLabel);
    for (const key of BIZQ01_OOD_COHORT16_SOURCE_KEYS) {
      if (entry[key] !== source[key]) fail("EVIDENCE_VALUE", `${sourceLabel}.${key} differs from the fixed cohort descriptor.`);
    }
    assertRelativePath(entry.sourceFile, `${sourceLabel}.sourceFile`, { suffix: ".json" });
    assertHash(entry.beforeSourceSha256, `${sourceLabel}.beforeSourceSha256`);
    assertHash(entry.sourceSha256, `${sourceLabel}.sourceSha256`);
    const sourcePath = path.resolve(projectRoot, ...entry.sourceFile.split("/"));
    await rejectSymlinkAncestors(sourcePath, `${sourceLabel}.sourceFile`);
    await regularPath(sourcePath, `${sourceLabel}.sourceFile`, "file");
    const diskSourceBytes = await readFile(sourcePath).catch((error) => fail("READ_ERROR", `Cannot read ${sourceLabel}.sourceFile: ${error.message}`));
    const sourceBytes = applicableExplanationSourceBytes?.get(source.sourceFile) ?? diskSourceBytes;
    if (sha256(sourceBytes) !== source.sourceSha256) fail("HASH_MISMATCH", `${sourceLabel}.sourceFile does not match the fixed current source hash.`);
    let questions;
    try { questions = JSON.parse(sourceBytes.toString("utf8")); }
    catch (error) { fail("INVALID_JSON", `${sourceLabel}.sourceFile is not valid JSON: ${error.message}`); }
    const descriptorItems = accepted.replacements.filter((item) => item.sourceFile === source.sourceFile);
    const expectedIds = descriptorItems.map((item) => item.questionId);
    if (!Array.isArray(questions) || questions.length !== expectedIds.length) {
      fail("EVIDENCE_MEMBERSHIP", `${sourceLabel}.sourceFile must contain exactly the 17 fixed current questions.`);
    }
    assertExactSet(questions.map((question) => question?.questionId), expectedIds, `${sourceLabel}.source question IDs`);
    const sourceById = new Map(questions.map((question) => [question.questionId, question]));
    for (const question of questions) {
      const location = canonical.questionLocations.get(question.questionId);
      if (!location || path.relative(projectRoot, location.path).split(path.sep).join("/") !== source.sourceFile) {
        fail("CANONICAL_MEMBERSHIP", `${sourceLabel} includes an item outside its fixed canonical source location.`);
      }
      if (question.trackId !== accepted.trackId || question.nodeId !== source.nodeId || question.mentalUnitId !== source.mentalUnitId) {
        fail("EVIDENCE_MEMBERSHIP", `${sourceLabel} contains a question with a different fixed taxonomy.`);
      }
      const canonicalQuestion = currentTrackQuestions.find((current) => current.questionId === question.questionId);
      if (!canonicalQuestion || canonicalJson(canonicalQuestion) !== canonicalJson(question)) {
        fail("HASH_MISMATCH", `${sourceLabel} source question differs from current canonical content.`);
      }
    }
    sourcesByPath.set(source.sourceFile, { sourcePath, questions, sourceById });
  }
  if (!Array.isArray(proof.replacements) || proof.replacements.length !== accepted.replacements.length) {
    fail("EVIDENCE_MEMBERSHIP", `${label} must contain exactly the fixed 119 replacements.`);
  }
  const currentById = new Map(currentTrackQuestions.map((question) => [question.questionId, question]));
  const oldRowsById = new Map(evidence.rowsByTrack.get(accepted.trackId).map((row) => [row.questionId, row]));
  const oldIds = new Set();
  const newIds = new Set();
  const oldOptionIds = new Set();
  const currentOptionIds = new Set();
  const replacements = [];
  for (const [index, item] of accepted.replacements.entries()) {
    const entry = proof.replacements[index];
    const itemLabel = `${label}.replacements[${index}]`;
    exactKeys(entry, BIZQ01_OOD_ITEM_KEYS, itemLabel);
    for (const key of ["sourceFile", "beforeQuestionId", "questionId", "nodeId", "mentalUnitId", "learningObjective", "acceptedOptionId"]) {
      if (entry[key] !== item[key]) fail("EVIDENCE_VALUE", `${itemLabel}.${key} differs from the fixed replacement map.`);
    }
    const source = accepted.sourceFiles.find((candidate) => candidate.sourceFile === item.sourceFile);
    if (!source || entry.beforeSourceSha256 !== source.beforeSourceSha256 || entry.sourceSha256 !== source.sourceSha256) {
      fail("EVIDENCE_VALUE", `${itemLabel} source hashes do not match the fixed source file.`);
    }
    if (entry.identityAction !== accepted.identityAction || entry.identityReason !== accepted.identityReason ||
        canonicalJson(entry.confirmedDefects) !== canonicalJson(accepted.confirmedDefects) ||
        canonicalJson(entry.sourceRefs) !== canonicalJson(item.sourceRefs)) {
      fail("EVIDENCE_VALUE", `${itemLabel} identity action, defect record, or source references differ from the fixed review.`);
    }
    const oldQuestion = entry.beforeQuestion;
    const currentQuestion = currentById.get(item.questionId);
    const oldRow = oldRowsById.get(item.beforeQuestionId);
    const sourceData = sourcesByPath.get(item.sourceFile);
    if (!oldQuestion || !currentQuestion || !oldRow || !sourceData || currentById.has(item.beforeQuestionId)) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} must bind a removed historical item to one current replacement.`);
    }
    if (oldIds.has(item.beforeQuestionId) || newIds.has(item.questionId)) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} duplicates a historical or current replacement identity.`);
    }
    oldIds.add(item.beforeQuestionId);
    newIds.add(item.questionId);
    assertCanonicalQuestion(oldQuestion, `${itemLabel}.beforeQuestion`, ACCEPTED_TRACK_IDS);
    assertCanonicalQuestion(entry.currentQuestion, `${itemLabel}.currentQuestion`, ACCEPTED_TRACK_IDS);
    if (oldQuestion.questionId !== item.beforeQuestionId || oldQuestion.trackId !== accepted.trackId ||
        oldQuestion.nodeId !== item.nodeId || oldQuestion.mentalUnitId !== item.mentalUnitId ||
        currentQuestion.questionId !== item.questionId || currentQuestion.trackId !== accepted.trackId ||
        currentQuestion.nodeId !== item.nodeId || currentQuestion.mentalUnitId !== item.mentalUnitId ||
        canonicalJson(entry.currentQuestion) !== canonicalJson(currentQuestion)) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} changes the fixed taxonomy or current authored object.`);
    }
    for (const key of ["trackId", "nodeId", "mentalUnitId"]) {
      if (oldRow[key] !== oldQuestion[key]) fail("EVIDENCE_MEMBERSHIP", `${itemLabel} historical evidence ${key} differs from the old question.`);
    }
    assertCanonicalHash(oldRow, oldQuestion, `${itemLabel}.beforeQuestion`);
    if (currentQuestion.interaction.type !== "choice_single" || currentQuestion.interaction.scoringMethod !== "exact_selected_set" ||
        currentQuestion.answer.type !== "choice_single" || currentQuestion.answer.optionId !== item.acceptedOptionId ||
        canonicalJson(currentQuestion.sourceRefs) !== canonicalJson(item.sourceRefs)) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} changes the fixed interaction, scoring, accepted option, or primary references.`);
    }
    const priorOptionIds = new Set(oldQuestion.interaction.options.map((option) => option.optionId));
    const newQuestionOptionIds = currentQuestion.interaction.options.map((option) => option.optionId);
    if (new Set(newQuestionOptionIds).size !== newQuestionOptionIds.length || newQuestionOptionIds.some((optionId) => priorOptionIds.has(optionId))) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} must use unique option identities that were not assigned to its retired item.`);
    }
    for (const option of oldQuestion.interaction.options) oldOptionIds.add(option.optionId);
    for (const optionId of newQuestionOptionIds) currentOptionIds.add(optionId);
    const sourceQuestion = sourceData.sourceById.get(item.questionId);
    if (!sourceQuestion || canonicalJson(sourceQuestion) !== canonicalJson(currentQuestion)) {
      fail("HASH_MISMATCH", `${itemLabel} source item differs from current canonical content.`);
    }
    replacements.push({ oldQuestion, newQuestion: currentQuestion, beforeQuestionId: item.beforeQuestionId, questionId: item.questionId });
  }
  if ([...currentOptionIds].some((optionId) => oldOptionIds.has(optionId))) {
    fail("EVIDENCE_MEMBERSHIP", `${label} reuses an option identity from the retired cohort.`);
  }

  for (const source of accepted.sourceFiles) {
    const sourceData = sourcesByPath.get(source.sourceFile);
    const sourceReplacements = replacements.filter((item) => {
      const descriptor = accepted.replacements.find((candidate) => candidate.questionId === item.questionId);
      return descriptor?.sourceFile === source.sourceFile;
    });
    const currentSourceIds = new Set(sourceReplacements.map((item) => item.questionId));
    const predecessorQuestions = sourceData.questions
      .filter((question) => !currentSourceIds.has(question.questionId))
      .concat(sourceReplacements.map((item) => item.oldQuestion))
      .sort((left, right) => compare(left.questionId, right.questionId));
    const predecessorBytes = Buffer.from(JSON.stringify(predecessorQuestions), "utf8");
    if (sha256(predecessorBytes) !== source.beforeSourceSha256) {
      fail("HASH_MISMATCH", `${label} does not reconstruct the byte-exact v13 predecessor source ${source.sourceFile}.`);
    }
  }
  const reconstructedTrackQuestions = currentTrackQuestions
    .filter((question) => !newIds.has(question.questionId))
    .concat(replacements.map((item) => item.oldQuestion))
    .sort((left, right) => compare(left.questionId, right.questionId));
  if (reconstructedTrackQuestions.length !== currentTrackQuestions.length ||
      sha256(reconstructedTrackQuestions) !== accepted.beforeQuestionSetSha256) {
    fail("HASH_MISMATCH", `${label} does not reconstruct the fixed v13 OOD question set.`);
  }
  const predecessorCatalog = {
    ...canonical.catalog,
    tracks: canonical.catalog.tracks.map((track) => track.trackId === accepted.trackId
      ? { ...track, contentVersion: accepted.beforeContentVersion }
      : track)
  };
  const predecessorLocations = new Map(canonical.questionLocations);
  for (const item of replacements) {
    predecessorLocations.delete(item.questionId);
    predecessorLocations.set(item.beforeQuestionId, {
      trackId: accepted.trackId,
      nodeId: item.oldQuestion.nodeId,
      mentalUnitId: item.oldQuestion.mentalUnitId,
      path: sourcesByPath.get(accepted.replacements.find((candidate) => candidate.questionId === item.questionId).sourceFile).sourcePath
    });
  }
  const predecessorCanonical = {
    ...canonical,
    catalog: predecessorCatalog,
    catalogByTrack: new Map(predecessorCatalog.tracks.map((track) => [track.trackId, track])),
    questionsByTrack: new Map(canonical.questionsByTrack).set(accepted.trackId, reconstructedTrackQuestions),
    questionLocations: predecessorLocations
  };
  const predecessor = await loadBizq01OodSemanticProof(contentRoot, predecessorCanonical, evidence, undefined, true, explanationHistoricalSourceBytes);
  if (!predecessor) fail("EVIDENCE_MEMBERSHIP", `${label} requires the unchanged source13, source12, and source11 proofs for historical validation.`);
  return { trackId: accepted.trackId, replacements: [...predecessor.replacements, ...replacements] };
}


async function validateBizq01OodCohort17Proof(contentRoot, canonical, evidence, explanationHistoricalSourceBytes) {
  return validateBizq01OodClosedCohortProof(contentRoot, canonical, evidence, BIZQ01_OOD_COHORT17_PROOF, undefined, undefined, explanationHistoricalSourceBytes);
}

// Closed reviewed descriptor only: proof input cannot select approval scope or mappings.
async function validateBizq01OodClosedCohortProof(contentRoot, canonical, evidence, accepted, privateHistoricalSourceBytes, privateContext, explanationHistoricalSourceBytes) {
  if (accepted !== BIZQ01_OOD_COHORT17_PROOF && accepted !== BIZQ01_OOD_COHORT19_PROOF) {
    fail("EVIDENCE_VALUE", "Unsupported private OOD cohort descriptor.");
  }
  if (privateHistoricalSourceBytes !== undefined) {
    if (accepted !== BIZQ01_OOD_COHORT19_PROOF || privateContext !== OOD_REASON_AMENDMENT_19A_PRIVATE_CONTEXT ||
        !(privateHistoricalSourceBytes instanceof Map) ||
        canonicalJson([...privateHistoricalSourceBytes.keys()].sort(compare)) !== canonicalJson(
          BIZQ01_OOD_REASON_AMENDMENT_19A_PROOF.sourceFiles.map((source) => source.sourceFile).sort(compare)
        )) {
      fail("EVIDENCE_VALUE", "Private historical bytes are allowed only for the fixed closed-v19 reason amendment.");
    }
  } else if (privateContext !== undefined) {
    fail("EVIDENCE_VALUE", "A private historical context requires its fixed source buffers.");
  }
  const label = accepted.scope;
  const applicableExplanationSourceBytes = oodHistoricalSourceOverridesFor(accepted, explanationHistoricalSourceBytes, label);
  const projectRoot = path.dirname(contentRoot);
  const proofPath = path.join(projectRoot, accepted.path);
  const proofInfo = await lstat(proofPath).catch((error) => {
    if (error?.code === "ENOENT") return undefined;
    fail("PATH_ERROR", `Cannot inspect ${label}: ${error.message}`);
  });
  if (!proofInfo) return undefined;
  await rejectSymlinkAncestors(proofPath, label);
  const proof = await readJson(proofPath, label);
  exactKeys(proof, BIZQ01_OOD_COHORT17_ROOT_KEYS, label);
  for (const key of ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "beforeQuestionSetSha256", "questionSetSha256", "identityAction", "identityReason"]) {
    if (proof[key] !== accepted[key]) fail("EVIDENCE_VALUE", `${label}.${key} differs from the fixed cohort identity.`);
  }
  if (canonicalJson(proof.confirmedDefects) !== canonicalJson(accepted.confirmedDefects)) {
    fail("EVIDENCE_VALUE", `${label}.confirmedDefects differ from the fixed cohort descriptor.`);
  }
  assertHash(proof.beforeQuestionSetSha256, `${label}.beforeQuestionSetSha256`);
  assertHash(proof.questionSetSha256, `${label}.questionSetSha256`);
  const currentTrackQuestions = canonical.questionsByTrack.get(accepted.trackId);
  if (sha256([...currentTrackQuestions].sort((left, right) => compare(left.questionId, right.questionId))) !== accepted.questionSetSha256) {
    fail("HASH_MISMATCH", `${label} current OOD question set differs from the fixed cohort descriptor.`);
  }
  if (!Array.isArray(proof.sourceFiles) || proof.sourceFiles.length !== accepted.sourceFiles.length) {
    fail("EVIDENCE_MEMBERSHIP", `${label} must identify exactly the ${accepted.sourceFiles.length} fixed source files.`);
  }
  const sourcesByPath = new Map();
  for (const [index, source] of accepted.sourceFiles.entries()) {
    const entry = proof.sourceFiles[index];
    const sourceLabel = `${label}.sourceFiles[${index}]`;
    exactKeys(entry, BIZQ01_OOD_COHORT17_SOURCE_KEYS, sourceLabel);
    for (const key of BIZQ01_OOD_COHORT17_SOURCE_KEYS) {
      if (entry[key] !== source[key]) fail("EVIDENCE_VALUE", `${sourceLabel}.${key} differs from the fixed cohort descriptor.`);
    }
    assertRelativePath(entry.sourceFile, `${sourceLabel}.sourceFile`, { suffix: ".json" });
    assertHash(entry.beforeSourceSha256, `${sourceLabel}.beforeSourceSha256`);
    assertHash(entry.sourceSha256, `${sourceLabel}.sourceSha256`);
    const sourcePath = path.resolve(projectRoot, ...entry.sourceFile.split("/"));
    await rejectSymlinkAncestors(sourcePath, `${sourceLabel}.sourceFile`);
    await regularPath(sourcePath, `${sourceLabel}.sourceFile`, "file");
    const diskSourceBytes = await readFile(sourcePath).catch((error) => fail("READ_ERROR", `Cannot read ${sourceLabel}.sourceFile: ${error.message}`));
    const sourceBytes = privateHistoricalSourceBytes?.get(source.sourceFile) ?? applicableExplanationSourceBytes?.get(source.sourceFile) ?? diskSourceBytes;
    if (sha256(sourceBytes) !== source.sourceSha256) fail("HASH_MISMATCH", `${sourceLabel}.sourceFile does not match the fixed current source hash.`);
    let questions;
    try { questions = JSON.parse(sourceBytes.toString("utf8")); }
    catch (error) { fail("INVALID_JSON", `${sourceLabel}.sourceFile is not valid JSON: ${error.message}`); }
    const descriptorItems = accepted.replacements.filter((item) => item.sourceFile === source.sourceFile);
    const expectedIds = descriptorItems.map((item) => item.questionId);
    if (!Array.isArray(questions) || questions.length !== expectedIds.length) {
      fail("EVIDENCE_MEMBERSHIP", `${sourceLabel}.sourceFile must contain exactly the ${expectedIds.length} fixed current questions.`);
    }
    assertExactSet(questions.map((question) => question?.questionId), expectedIds, `${sourceLabel}.source question IDs`);
    const sourceById = new Map(questions.map((question) => [question.questionId, question]));
    for (const question of questions) {
      const location = canonical.questionLocations.get(question.questionId);
      if (!location || path.relative(projectRoot, location.path).split(path.sep).join("/") !== source.sourceFile) {
        fail("CANONICAL_MEMBERSHIP", `${sourceLabel} includes an item outside its fixed canonical source location.`);
      }
      if (question.trackId !== accepted.trackId || question.nodeId !== source.nodeId || question.mentalUnitId !== source.mentalUnitId) {
        fail("EVIDENCE_MEMBERSHIP", `${sourceLabel} contains a question with a different fixed taxonomy.`);
      }
      const canonicalQuestion = currentTrackQuestions.find((current) => current.questionId === question.questionId);
      if (!canonicalQuestion || canonicalJson(canonicalQuestion) !== canonicalJson(question)) {
        fail("HASH_MISMATCH", `${sourceLabel} source question differs from current canonical content.`);
      }
    }
    sourcesByPath.set(source.sourceFile, { sourcePath, questions, sourceById });
  }
  if (!Array.isArray(proof.replacements) || proof.replacements.length !== accepted.replacements.length) {
    fail("EVIDENCE_MEMBERSHIP", `${label} must contain exactly the fixed ${accepted.replacements.length} replacements.`);
  }
  const currentById = new Map(currentTrackQuestions.map((question) => [question.questionId, question]));
  const oldRowsById = new Map(evidence.rowsByTrack.get(accepted.trackId).map((row) => [row.questionId, row]));
  const oldIds = new Set();
  const newIds = new Set();
  const oldOptionIds = new Set();
  const currentOptionIds = new Set();
  const replacements = [];
  for (const [index, item] of accepted.replacements.entries()) {
    const entry = proof.replacements[index];
    const itemLabel = `${label}.replacements[${index}]`;
    exactKeys(entry, BIZQ01_OOD_ITEM_KEYS, itemLabel);
    for (const key of ["sourceFile", "beforeQuestionId", "questionId", "nodeId", "mentalUnitId", "learningObjective", "acceptedOptionId"]) {
      if (entry[key] !== item[key]) fail("EVIDENCE_VALUE", `${itemLabel}.${key} differs from the fixed replacement map.`);
    }
    const source = accepted.sourceFiles.find((candidate) => candidate.sourceFile === item.sourceFile);
    if (!source || entry.beforeSourceSha256 !== source.beforeSourceSha256 || entry.sourceSha256 !== source.sourceSha256) {
      fail("EVIDENCE_VALUE", `${itemLabel} source hashes do not match the fixed source file.`);
    }
    if (entry.identityAction !== accepted.identityAction || entry.identityReason !== (item.identityReason ?? accepted.identityReason) ||
        canonicalJson(entry.confirmedDefects) !== canonicalJson(accepted.confirmedDefects) ||
        canonicalJson(entry.sourceRefs) !== canonicalJson(item.sourceRefs)) {
      fail("EVIDENCE_VALUE", `${itemLabel} identity action, defect record, or source references differ from the fixed review.`);
    }
    const oldQuestion = entry.beforeQuestion;
    const currentQuestion = currentById.get(item.questionId);
    const oldRow = oldRowsById.get(item.beforeQuestionId);
    const sourceData = sourcesByPath.get(item.sourceFile);
    if (!oldQuestion || !currentQuestion || !oldRow || !sourceData || currentById.has(item.beforeQuestionId)) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} must bind a removed historical item to one current replacement.`);
    }
    if (oldIds.has(item.beforeQuestionId) || newIds.has(item.questionId)) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} duplicates a historical or current replacement identity.`);
    }
    oldIds.add(item.beforeQuestionId);
    newIds.add(item.questionId);
    assertCanonicalQuestion(oldQuestion, `${itemLabel}.beforeQuestion`, ACCEPTED_TRACK_IDS);
    assertCanonicalQuestion(entry.currentQuestion, `${itemLabel}.currentQuestion`, ACCEPTED_TRACK_IDS);
    if (oldQuestion.questionId !== item.beforeQuestionId || oldQuestion.trackId !== accepted.trackId ||
        oldQuestion.nodeId !== item.nodeId || oldQuestion.mentalUnitId !== item.mentalUnitId ||
        currentQuestion.questionId !== item.questionId || currentQuestion.trackId !== accepted.trackId ||
        currentQuestion.nodeId !== item.nodeId || currentQuestion.mentalUnitId !== item.mentalUnitId ||
        canonicalJson(entry.currentQuestion) !== canonicalJson(currentQuestion)) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} changes the fixed taxonomy or current authored object.`);
    }
    for (const key of ["trackId", "nodeId", "mentalUnitId"]) {
      if (oldRow[key] !== oldQuestion[key]) fail("EVIDENCE_MEMBERSHIP", `${itemLabel} historical evidence ${key} differs from the old question.`);
    }
    assertCanonicalHash(oldRow, oldQuestion, `${itemLabel}.beforeQuestion`);
    if (currentQuestion.interaction.type !== "choice_single" || currentQuestion.interaction.scoringMethod !== "exact_selected_set" ||
        currentQuestion.answer.type !== "choice_single" || currentQuestion.answer.optionId !== item.acceptedOptionId ||
        canonicalJson(currentQuestion.sourceRefs) !== canonicalJson(item.sourceRefs)) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} changes the fixed interaction, scoring, accepted option, or primary references.`);
    }
    const priorOptionIds = new Set(oldQuestion.interaction.options.map((option) => option.optionId));
    const newQuestionOptionIds = currentQuestion.interaction.options.map((option) => option.optionId);
    if (new Set(newQuestionOptionIds).size !== newQuestionOptionIds.length || newQuestionOptionIds.some((optionId) => priorOptionIds.has(optionId))) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} must use unique option identities that were not assigned to its retired item.`);
    }
    for (const option of oldQuestion.interaction.options) oldOptionIds.add(option.optionId);
    for (const optionId of newQuestionOptionIds) currentOptionIds.add(optionId);
    const sourceQuestion = sourceData.sourceById.get(item.questionId);
    if (!sourceQuestion || canonicalJson(sourceQuestion) !== canonicalJson(currentQuestion)) {
      fail("HASH_MISMATCH", `${itemLabel} source item differs from current canonical content.`);
    }
    replacements.push({ oldQuestion, newQuestion: currentQuestion, beforeQuestionId: item.beforeQuestionId, questionId: item.questionId });
  }
  if ([...currentOptionIds].some((optionId) => oldOptionIds.has(optionId))) {
    fail("EVIDENCE_MEMBERSHIP", `${label} reuses an option identity from the retired cohort.`);
  }

  for (const source of accepted.sourceFiles) {
    const sourceData = sourcesByPath.get(source.sourceFile);
    const sourceReplacements = replacements.filter((item) => {
      const descriptor = accepted.replacements.find((candidate) => candidate.questionId === item.questionId);
      return descriptor?.sourceFile === source.sourceFile;
    });
    const currentSourceIds = new Set(sourceReplacements.map((item) => item.questionId));
    const predecessorQuestions = sourceData.questions
      .filter((question) => !currentSourceIds.has(question.questionId))
      .concat(sourceReplacements.map((item) => item.oldQuestion))
      .sort((left, right) => compare(left.questionId, right.questionId));
    const predecessorBytes = Buffer.from(JSON.stringify(predecessorQuestions), "utf8");
    if (sha256(predecessorBytes) !== source.beforeSourceSha256) {
      fail("HASH_MISMATCH", `${label} does not reconstruct the byte-exact ${accepted.beforeContentVersion} predecessor source ${source.sourceFile}.`);
    }
  }
  const reconstructedTrackQuestions = currentTrackQuestions
    .filter((question) => !newIds.has(question.questionId))
    .concat(replacements.map((item) => item.oldQuestion))
    .sort((left, right) => compare(left.questionId, right.questionId));
  if (reconstructedTrackQuestions.length !== currentTrackQuestions.length ||
      sha256(reconstructedTrackQuestions) !== accepted.beforeQuestionSetSha256) {
    fail("HASH_MISMATCH", `${label} does not reconstruct the fixed ${accepted.beforeContentVersion} OOD question set.`);
  }
  const predecessorCatalog = {
    ...canonical.catalog,
    tracks: canonical.catalog.tracks.map((track) => track.trackId === accepted.trackId
      ? { ...track, contentVersion: accepted.beforeContentVersion }
      : track)
  };
  const predecessorLocations = new Map(canonical.questionLocations);
  for (const item of replacements) {
    predecessorLocations.delete(item.questionId);
    predecessorLocations.set(item.beforeQuestionId, {
      trackId: accepted.trackId,
      nodeId: item.oldQuestion.nodeId,
      mentalUnitId: item.oldQuestion.mentalUnitId,
      path: sourcesByPath.get(accepted.replacements.find((candidate) => candidate.questionId === item.questionId).sourceFile).sourcePath
    });
  }
  const predecessorCanonical = {
    ...canonical,
    catalog: predecessorCatalog,
    catalogByTrack: new Map(predecessorCatalog.tracks.map((track) => [track.trackId, track])),
    questionsByTrack: new Map(canonical.questionsByTrack).set(accepted.trackId, reconstructedTrackQuestions),
    questionLocations: predecessorLocations
  };
  const predecessor = await loadBizq01OodSemanticProof(contentRoot, predecessorCanonical, evidence, undefined, true, explanationHistoricalSourceBytes);
  if (!predecessor) fail("EVIDENCE_MEMBERSHIP", `${label} requires its unchanged predecessor proof chain for historical validation.`);
  return { trackId: accepted.trackId, replacements: [...predecessor.replacements, ...replacements] };
}

async function validateBizq01OodReasonAmendment19a(contentRoot, canonical, evidence, explanationHistoricalSourceBytes) {
  const accepted = BIZQ01_OOD_REASON_AMENDMENT_19A_PROOF;
  const label = accepted.scope;
  const projectRoot = path.dirname(contentRoot);
  const proofPath = path.join(projectRoot, accepted.path);
  const proofInfo = await lstat(proofPath).catch((error) => {
    if (error?.code === "ENOENT") return undefined;
    fail("PATH_ERROR", `Cannot inspect ${label}: ${error.message}`);
  });
  if (!proofInfo) return undefined;
  await rejectSymlinkAncestors(proofPath, label);
  await regularPath(proofPath, label, "file");
  const proofBytes = await readFile(proofPath).catch((error) => fail("READ_ERROR", `Cannot read ${label}: ${error.message}`));
  if (sha256(proofBytes) !== accepted.sha256) fail("HASH_MISMATCH", `${label} differs from its fixed proof bytes.`);
  let proof;
  try { proof = JSON.parse(proofBytes.toString("utf8")); }
  catch (error) { fail("INVALID_JSON", `${label} is not valid JSON: ${error.message}`); }
  exactKeys(proof, BIZQ01_OOD_REASON_AMENDMENT_19A_ROOT_KEYS, label);
  for (const key of ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "beforeQuestionSetSha256", "questionSetSha256"]) {
    if (proof[key] !== accepted[key]) fail("EVIDENCE_VALUE", `${label}.${key} differs from the fixed amendment identity.`);
  }
  assertHash(proof.beforeQuestionSetSha256, `${label}.beforeQuestionSetSha256`);
  assertHash(proof.questionSetSha256, `${label}.questionSetSha256`);
  const currentTrackQuestions = canonical.questionsByTrack.get(accepted.trackId);
  const currentQuestionSetSha256 = sha256([...currentTrackQuestions].sort((left, right) => compare(left.questionId, right.questionId)));
  if (currentQuestionSetSha256 !== accepted.questionSetSha256) {
    fail("HASH_MISMATCH", `${label} current OOD question set differs from its fixed descriptor.`);
  }
  if (!Array.isArray(proof.sourceFiles) || proof.sourceFiles.length !== accepted.sourceFiles.length) {
    fail("EVIDENCE_MEMBERSHIP", `${label} must identify exactly the three fixed source files.`);
  }
  const sourceByPath = new Map();
  const privateHistoricalSourceBytes = new Map();
  const predecessorById = new Map();

  if (!Array.isArray(proof.replacements) || proof.replacements.length !== accepted.replacements.length) {
    fail("EVIDENCE_MEMBERSHIP", `${label} must contain exactly the fixed ${accepted.replacements.length} reason-only corrections.`);
  }
  for (const [index, item] of accepted.replacements.entries()) {
    const entry = proof.replacements[index];
    const itemLabel = `${label}.replacements[${index}]`;
    exactKeys(entry, BIZQ01_OOD_REASON_AMENDMENT_19A_ITEM_KEYS, itemLabel);
    for (const key of ["sourceFile", "questionId", "mentalUnitId"]) {
      if (entry[key] !== item[key]) fail("EVIDENCE_VALUE", `${itemLabel}.${key} differs from the fixed correction map.`);
    }
    if (typeof entry.beforeReason !== "string" || entry.beforeReason.length === 0 ||
        typeof entry.reason !== "string" || entry.reason.length === 0 || entry.beforeReason === entry.reason) {
      fail("EVIDENCE_VALUE", `${itemLabel} must bind distinct nonempty before/current Reason text.`);
    }
    assertHash(entry.beforeQuestionSha256, `${itemLabel}.beforeQuestionSha256`);
    assertHash(entry.questionSha256, `${itemLabel}.questionSha256`);
  }

  for (const [index, source] of accepted.sourceFiles.entries()) {
    const entry = proof.sourceFiles[index];
    const sourceLabel = `${label}.sourceFiles[${index}]`;
    exactKeys(entry, BIZQ01_OOD_REASON_AMENDMENT_19A_SOURCE_KEYS, sourceLabel);
    for (const key of BIZQ01_OOD_REASON_AMENDMENT_19A_SOURCE_KEYS) {
      if (entry[key] !== source[key]) fail("EVIDENCE_VALUE", `${sourceLabel}.${key} differs from the fixed amendment descriptor.`);
    }
    assertRelativePath(entry.sourceFile, `${sourceLabel}.sourceFile`, { suffix: ".json" });
    assertHash(entry.beforeSourceSha256, `${sourceLabel}.beforeSourceSha256`);
    assertHash(entry.sourceSha256, `${sourceLabel}.sourceSha256`);
    const sourcePath = path.resolve(projectRoot, ...entry.sourceFile.split("/"));
    await rejectSymlinkAncestors(sourcePath, `${sourceLabel}.sourceFile`);
    await regularPath(sourcePath, `${sourceLabel}.sourceFile`, "file");
    const currentSourceBytes = await readFile(sourcePath).catch((error) => fail("READ_ERROR", `Cannot read ${sourceLabel}.sourceFile: ${error.message}`));
    if (sha256(currentSourceBytes) !== source.sourceSha256) {
      fail("HASH_MISMATCH", `${sourceLabel}.sourceFile does not match the fixed current 19a source hash.`);
    }
    let questions;
    try { questions = JSON.parse(currentSourceBytes.toString("utf8")); }
    catch (error) { fail("INVALID_JSON", `${sourceLabel}.sourceFile is not valid JSON: ${error.message}`); }
    const expectedIds = BIZQ01_OOD_COHORT19_PROOF.replacements
      .filter((item) => item.sourceFile === source.sourceFile)
      .map((item) => item.questionId);
    if (!Array.isArray(questions) || questions.length !== expectedIds.length) {
      fail("EVIDENCE_MEMBERSHIP", `${sourceLabel}.sourceFile must contain exactly the fixed ${expectedIds.length} current questions.`);
    }
    assertExactSet(questions.map((question) => question?.questionId), expectedIds, `${sourceLabel}.source question IDs`);
    const sourceByIdMap = new Map(questions.map((question) => [question.questionId, question]));
    for (const question of questions) {
      const location = canonical.questionLocations.get(question.questionId);
      if (!location || path.relative(projectRoot, location.path).split(path.sep).join("/") !== source.sourceFile) {
        fail("CANONICAL_MEMBERSHIP", `${sourceLabel} includes a question outside its fixed canonical source location.`);
      }
      if (question.trackId !== accepted.trackId || question.nodeId !== source.nodeId || question.mentalUnitId !== source.mentalUnitId) {
        fail("EVIDENCE_MEMBERSHIP", `${sourceLabel} contains a question with different fixed taxonomy.`);
      }
      const canonicalQuestion = currentTrackQuestions.find((current) => current.questionId === question.questionId);
      if (!canonicalQuestion || canonicalJson(canonicalQuestion) !== canonicalJson(question)) {
        fail("HASH_MISMATCH", `${sourceLabel} source question differs from current canonical content.`);
      }
    }
    sourceByPath.set(source.sourceFile, { questions, sourceById: sourceByIdMap });
  }

  for (const [index, entry] of proof.replacements.entries()) {
    const item = accepted.replacements[index];
    const itemLabel = `${label}.replacements[${index}]`;
    const current = sourceByPath.get(item.sourceFile)?.sourceById.get(item.questionId);
    if (!current || current.feedback?.reason !== entry.reason || sha256(current) !== entry.questionSha256) {
      fail("HASH_MISMATCH", `${itemLabel} current whole question or Reason differs from its fixed binding.`);
    }
    const predecessor = {
      ...current,
      feedback: { ...current.feedback, reason: entry.beforeReason }
    };
    if (sha256(predecessor) !== entry.beforeQuestionSha256) {
      fail("HASH_MISMATCH", `${itemLabel} does not reconstruct the immutable v19 whole question by changing Reason only.`);
    }
    predecessorById.set(item.questionId, predecessor);
  }

  for (const source of accepted.sourceFiles) {
    const current = sourceByPath.get(source.sourceFile);
    const reconstructedQuestions = current.questions.map((question) => predecessorById.get(question.questionId) ?? question);
    const reconstructedSourceBytes = Buffer.from(JSON.stringify(reconstructedQuestions), "utf8");
    if (sha256(reconstructedSourceBytes) !== source.beforeSourceSha256) {
      fail("HASH_MISMATCH", `${label} does not reconstruct the byte-exact immutable v19 source ${source.sourceFile}.`);
    }
    privateHistoricalSourceBytes.set(source.sourceFile, reconstructedSourceBytes);
  }

  const reconstructedTrackQuestions = currentTrackQuestions
    .map((question) => predecessorById.get(question.questionId) ?? question)
    .sort((left, right) => compare(left.questionId, right.questionId));
  if (sha256(reconstructedTrackQuestions) !== accepted.beforeQuestionSetSha256) {
    fail("HASH_MISMATCH", `${label} does not reconstruct the immutable v19 OOD question set.`);
  }
  const predecessorCatalog = {
    ...canonical.catalog,
    tracks: canonical.catalog.tracks.map((track) => track.trackId === accepted.trackId
      ? { ...track, contentVersion: accepted.beforeContentVersion }
      : track)
  };
  const predecessorCanonical = {
    ...canonical,
    catalog: predecessorCatalog,
    catalogByTrack: new Map(predecessorCatalog.tracks.map((track) => [track.trackId, track])),
    questionsByTrack: new Map(canonical.questionsByTrack).set(accepted.trackId, reconstructedTrackQuestions)
  };
  const semanticProof = await validateBizq01OodClosedCohortProof(
    contentRoot,
    predecessorCanonical,
    evidence,
    BIZQ01_OOD_COHORT19_PROOF,
    privateHistoricalSourceBytes,
    OOD_REASON_AMENDMENT_19A_PRIVATE_CONTEXT,
    explanationHistoricalSourceBytes
  );
  if (!semanticProof) fail("EVIDENCE_MEMBERSHIP", `${label} requires the unchanged fixed v19 predecessor proof.`);
  return {
    ...semanticProof,
    reasonAmendmentQuestionIds: accepted.replacements.map((item) => item.questionId)
  };
}

async function validateBizq01OodCohort21Proof(contentRoot, canonical, evidence, explanationHistoricalSourceBytes) {
  const accepted = BIZQ01_OOD_COHORT21_PROOF.descriptor;
  const label = accepted.scope;
  const projectRoot = path.dirname(contentRoot);
  const proofPath = path.join(projectRoot, BIZQ01_OOD_COHORT21_PROOF.path);
  const proofInfo = await lstat(proofPath).catch((error) => {
    if (error?.code === "ENOENT") return undefined;
    fail("PATH_ERROR", `Cannot inspect ${label}: ${error.message}`);
  });
  if (!proofInfo) return undefined;
  await rejectSymlinkAncestors(proofPath, label);
  await regularPath(proofPath, label, "file");
  const proofBytes = await readFile(proofPath).catch((error) => fail("READ_ERROR", `Cannot read ${label}: ${error.message}`));
  if (sha256(proofBytes) !== BIZQ01_OOD_COHORT21_PROOF.sha256) fail("HASH_MISMATCH", `${label} differs from its fixed proof bytes.`);
  let proof;
  try { proof = JSON.parse(proofBytes.toString("utf8")); }
  catch (error) { fail("INVALID_JSON", `${label} is not valid JSON: ${error.message}`); }
  exactKeys(proof, BIZQ01_OOD_COHORT21_ROOT_KEYS, label);
  for (const key of ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "beforeQuestionSetSha256", "questionSetSha256"]) {
    if (proof[key] !== accepted[key]) fail("EVIDENCE_VALUE", `${label}.${key} differs from the fixed cohort identity.`);
  }
  for (const key of ["beforeQuestionSetSha256", "questionSetSha256"]) assertHash(proof[key], `${label}.${key}`);
  const currentTrackQuestions = canonical.questionsByTrack.get(accepted.trackId);
  if (!currentTrackQuestions || sha256([...currentTrackQuestions].sort((left, right) => compare(left.questionId, right.questionId))) !== accepted.questionSetSha256) {
    fail("HASH_MISMATCH", `${label} current OOD question set differs from its fixed descriptor.`);
  }
  if (!Array.isArray(proof.replacements) || proof.replacements.length !== 0) {
    fail("EVIDENCE_MEMBERSHIP", `${label} contains no question-ID replacements.`);
  }
  if (!Array.isArray(proof.sourceFiles) || proof.sourceFiles.length !== accepted.sourceFiles.length) {
    fail("EVIDENCE_MEMBERSHIP", `${label} must identify exactly the ${accepted.sourceFiles.length} fixed source files.`);
  }
  if (!Array.isArray(proof.sameIdCorrections) || proof.sameIdCorrections.length !== accepted.sameIdCorrections.length) {
    fail("EVIDENCE_MEMBERSHIP", `${label} must contain exactly the ${accepted.sameIdCorrections.length} fixed same-ID corrections.`);
  }

  const sourceDataByPath = new Map();
  for (const [index, source] of accepted.sourceFiles.entries()) {
    const entry = proof.sourceFiles[index];
    const sourceLabel = `${label}.sourceFiles[${index}]`;
    exactKeys(entry, BIZQ01_OOD_COHORT21_SOURCE_KEYS, sourceLabel);
    for (const key of BIZQ01_OOD_COHORT21_SOURCE_KEYS) {
      if (entry[key] !== source[key]) fail("EVIDENCE_VALUE", `${sourceLabel}.${key} differs from the fixed cohort descriptor.`);
    }
    assertRelativePath(entry.sourceFile, `${sourceLabel}.sourceFile`, { suffix: ".json" });
    assertHash(entry.beforeSourceSha256, `${sourceLabel}.beforeSourceSha256`);
    assertHash(entry.sourceSha256, `${sourceLabel}.sourceSha256`);
    const sourcePath = path.resolve(projectRoot, ...entry.sourceFile.split("/"));
    await rejectSymlinkAncestors(sourcePath, `${sourceLabel}.sourceFile`);
    await regularPath(sourcePath, `${sourceLabel}.sourceFile`, "file");
    const sourceBytes = await readFile(sourcePath).catch((error) => fail("READ_ERROR", `Cannot read ${sourceLabel}.sourceFile: ${error.message}`));
    if (sha256(sourceBytes) !== source.sourceSha256) fail("HASH_MISMATCH", `${sourceLabel}.sourceFile does not match the fixed current source hash.`);
    let questions;
    try { questions = JSON.parse(sourceBytes.toString("utf8")); }
    catch (error) { fail("INVALID_JSON", `${sourceLabel}.sourceFile is not valid JSON: ${error.message}`); }
    const expectedItems = accepted.sameIdCorrections.filter((item) => item.sourceFile === source.sourceFile);
    const expectedIds = expectedItems.map((item) => item.questionId);
    if (!Array.isArray(questions) || questions.length !== expectedIds.length) {
      fail("EVIDENCE_MEMBERSHIP", `${sourceLabel}.sourceFile must contain exactly the fixed ${expectedIds.length} current questions.`);
    }
    assertExactSet(questions.map((question) => question?.questionId), expectedIds, `${sourceLabel}.source question IDs`);
    const sourceById = new Map(questions.map((question) => [question.questionId, question]));
    for (const question of questions) {
      const location = canonical.questionLocations.get(question.questionId);
      if (!location || path.relative(projectRoot, location.path).split(path.sep).join("/") !== source.sourceFile) {
        fail("CANONICAL_MEMBERSHIP", `${sourceLabel} includes an item outside its fixed canonical source location.`);
      }
      if (question.trackId !== accepted.trackId || question.nodeId !== source.nodeId || question.mentalUnitId !== source.mentalUnitId) {
        fail("EVIDENCE_MEMBERSHIP", `${sourceLabel} contains an item with a different fixed taxonomy.`);
      }
      const canonicalQuestion = currentTrackQuestions.find((current) => current.questionId === question.questionId);
      if (!canonicalQuestion || canonicalJson(canonicalQuestion) !== canonicalJson(question)) {
        fail("HASH_MISMATCH", `${sourceLabel} source item differs from current canonical content.`);
      }
    }
    sourceDataByPath.set(source.sourceFile, { sourcePath, questions, sourceById });
  }

  const currentById = new Map(currentTrackQuestions.map((question) => [question.questionId, question]));
  const oldRowsById = new Map(evidence.rowsByTrack.get(accepted.trackId).map((row) => [row.questionId, row]));
  const beforeById = new Map();
  const sameIdCorrections = [];
  for (const [index, item] of accepted.sameIdCorrections.entries()) {
    const entry = proof.sameIdCorrections[index];
    const itemLabel = `${label}.sameIdCorrections[${index}]`;
    exactKeys(entry, BIZQ01_OOD_COHORT21_ITEM_KEYS, itemLabel);
    for (const key of ["sourceFile", "beforeSourceSha256", "sourceSha256", "beforeQuestionId", "questionId", "nodeId", "mentalUnitId", "learningObjective", "identityAction", "identityReason", "acceptedOptionId"]) {
      if (entry[key] !== item[key]) fail("EVIDENCE_VALUE", `${itemLabel}.${key} differs from the fixed same-ID map.`);
    }
    if (canonicalJson(entry.confirmedDefects) !== canonicalJson(item.confirmedDefects) || canonicalJson(entry.sourceRefs) !== canonicalJson(item.sourceRefs)) {
      fail("EVIDENCE_VALUE", `${itemLabel} defect record or source references differ from the fixed review.`);
    }
    if (item.beforeQuestionId !== item.questionId || item.identityAction !== "preserve_question_id") {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} is not an accepted same-ID correction.`);
    }
    const source = accepted.sourceFiles.find((candidate) => candidate.sourceFile === item.sourceFile);
    const sourceData = sourceDataByPath.get(item.sourceFile);
    const oldRow = oldRowsById.get(item.beforeQuestionId);
    const oldQuestion = entry.beforeQuestion;
    const currentQuestion = currentById.get(item.questionId);
    if (!source || !sourceData || !oldRow || !oldQuestion || !currentQuestion) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} does not bind the fixed historical question to its current item.`);
    }
    assertCanonicalQuestion(oldQuestion, `${itemLabel}.beforeQuestion`, ACCEPTED_TRACK_IDS);
    assertCanonicalQuestion(entry.currentQuestion, `${itemLabel}.currentQuestion`, ACCEPTED_TRACK_IDS);
    if (oldQuestion.questionId !== item.beforeQuestionId || currentQuestion.questionId !== item.questionId ||
        oldQuestion.trackId !== accepted.trackId || currentQuestion.trackId !== accepted.trackId ||
        oldQuestion.nodeId !== item.nodeId || currentQuestion.nodeId !== item.nodeId ||
        oldQuestion.mentalUnitId !== item.mentalUnitId || currentQuestion.mentalUnitId !== item.mentalUnitId ||
        canonicalJson(entry.currentQuestion) !== canonicalJson(currentQuestion)) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} changes the accepted question identity, taxonomy, or current authored object.`);
    }
    for (const key of ["trackId", "nodeId", "mentalUnitId", "questionId"]) {
      if (oldRow[key] !== oldQuestion[key]) fail("EVIDENCE_MEMBERSHIP", `${itemLabel} historical evidence ${key} differs from the before object.`);
    }
    assertCanonicalHash(oldRow, oldQuestion, `${itemLabel}.beforeQuestion`);
    if (currentQuestion.interaction.type !== "choice_single" || currentQuestion.interaction.scoringMethod !== "exact_selected_set" ||
        currentQuestion.answer.type !== "choice_single" || currentQuestion.answer.optionId !== item.acceptedOptionId ||
        canonicalJson(currentQuestion.sourceRefs) !== canonicalJson(item.sourceRefs)) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} changes the fixed interaction, scoring, accepted answer, or primary references.`);
    }
    const optionIds = currentQuestion.interaction.options.map((option) => option.optionId);
    if (new Set(optionIds).size !== optionIds.length) fail("EVIDENCE_MEMBERSHIP", `${itemLabel} has duplicate option IDs within its question.`);
    const sourceQuestion = sourceData.sourceById.get(item.questionId);
    if (!sourceQuestion || canonicalJson(sourceQuestion) !== canonicalJson(currentQuestion)) {
      fail("HASH_MISMATCH", `${itemLabel} source item differs from current canonical content.`);
    }
    if (beforeById.has(item.questionId)) fail("EVIDENCE_MEMBERSHIP", `${itemLabel} has more than one predecessor object.`);
    beforeById.set(item.questionId, oldQuestion);
    sameIdCorrections.push({ questionId: item.questionId, oldQuestion, newQuestion: currentQuestion });
  }

  for (const source of accepted.sourceFiles) {
    const sourceData = sourceDataByPath.get(source.sourceFile);
    const predecessorQuestions = sourceData.questions.map((question) => beforeById.get(question.questionId) ?? question)
      .sort((left, right) => compare(left.questionId, right.questionId));
    const predecessorBytes = Buffer.from(JSON.stringify(predecessorQuestions), "utf8");
    if (sha256(predecessorBytes) !== source.beforeSourceSha256) {
      fail("HASH_MISMATCH", `${label} does not reconstruct byte-exact ${accepted.beforeContentVersion} source ${source.sourceFile}.`);
    }
  }
  const reconstructedTrackQuestions = currentTrackQuestions.map((question) => beforeById.get(question.questionId) ?? question)
    .sort((left, right) => compare(left.questionId, right.questionId));
  if (sha256(reconstructedTrackQuestions) !== accepted.beforeQuestionSetSha256) {
    fail("HASH_MISMATCH", `${label} does not reconstruct the immutable predecessor OOD question set.`);
  }
  const predecessorCatalog = {
    ...canonical.catalog,
    tracks: canonical.catalog.tracks.map((track) => track.trackId === accepted.trackId
      ? { ...track, contentVersion: accepted.beforeContentVersion }
      : track)
  };
  const predecessorCanonical = {
    ...canonical,
    catalog: predecessorCatalog,
    catalogByTrack: new Map(predecessorCatalog.tracks.map((track) => [track.trackId, track])),
    questionsByTrack: new Map(canonical.questionsByTrack).set(accepted.trackId, reconstructedTrackQuestions)
  };
  const predecessor = await loadBizq01OodSemanticProof(contentRoot, predecessorCanonical, evidence, undefined, true, explanationHistoricalSourceBytes);
  if (!predecessor) fail("EVIDENCE_MEMBERSHIP", `${label} requires the unchanged fixed v20 predecessor proof chain.`);
  return {
    trackId: accepted.trackId,
    replacements: predecessor.replacements,
    sameIdCorrections: [...(predecessor.sameIdCorrections ?? []), ...sameIdCorrections],
    reasonAmendmentQuestionIds: predecessor.reasonAmendmentQuestionIds
  };
}

async function validateBizq01OodCohort23Proof(contentRoot, canonical, evidence, explanationHistoricalSourceBytes) {
  const accepted = BIZQ01_OOD_COHORT23_PROOF.descriptor;
  const label = accepted.scope;
  const projectRoot = path.dirname(contentRoot);
  const proofPath = path.join(projectRoot, BIZQ01_OOD_COHORT23_PROOF.path);
  const proofInfo = await lstat(proofPath).catch((error) => {
    if (error?.code === "ENOENT") return undefined;
    fail("PATH_ERROR", `Cannot inspect ${label}: ${error.message}`);
  });
  if (!proofInfo) return undefined;
  await rejectSymlinkAncestors(proofPath, label);
  await regularPath(proofPath, label, "file");
  const proofBytes = await readFile(proofPath).catch((error) => fail("READ_ERROR", `Cannot read ${label}: ${error.message}`));
  if (sha256(proofBytes) !== BIZQ01_OOD_COHORT23_PROOF.sha256) fail("HASH_MISMATCH", `${label} differs from its fixed proof bytes.`);
  let proof;
  try { proof = JSON.parse(proofBytes.toString("utf8")); }
  catch (error) { fail("INVALID_JSON", `${label} is not valid JSON: ${error.message}`); }
  exactKeys(proof, BIZQ01_OOD_COHORT23_ROOT_KEYS, label);
  for (const key of ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "beforeQuestionSetSha256", "questionSetSha256"]) {
    if (proof[key] !== accepted[key]) fail("EVIDENCE_VALUE", `${label}.${key} differs from the fixed cohort identity.`);
  }
  for (const key of ["beforeQuestionSetSha256", "questionSetSha256"]) assertHash(proof[key], `${label}.${key}`);
  const currentTrackQuestions = canonical.questionsByTrack.get(accepted.trackId);
  if (!currentTrackQuestions || sha256([...currentTrackQuestions].sort((left, right) => compare(left.questionId, right.questionId))) !== accepted.questionSetSha256) {
    fail("HASH_MISMATCH", `${label} current OOD question set differs from its fixed descriptor.`);
  }
  if (!Array.isArray(proof.sourceFiles) || proof.sourceFiles.length !== accepted.sourceFiles.length) {
    fail("EVIDENCE_MEMBERSHIP", `${label} must identify exactly the ${accepted.sourceFiles.length} fixed source files.`);
  }
  const sourcesByPath = new Map();
  for (const [index, source] of accepted.sourceFiles.entries()) {
    const entry = proof.sourceFiles[index];
    const sourceLabel = `${label}.sourceFiles[${index}]`;
    exactKeys(entry, BIZQ01_OOD_COHORT23_SOURCE_KEYS, sourceLabel);
    for (const key of BIZQ01_OOD_COHORT23_SOURCE_KEYS) {
      if (entry[key] !== source[key]) fail("EVIDENCE_VALUE", `${sourceLabel}.${key} differs from the fixed cohort descriptor.`);
    }
    assertRelativePath(entry.sourceFile, `${sourceLabel}.sourceFile`, { suffix: ".json" });
    assertHash(entry.beforeSourceSha256, `${sourceLabel}.beforeSourceSha256`);
    assertHash(entry.sourceSha256, `${sourceLabel}.sourceSha256`);
    const sourcePath = path.resolve(projectRoot, ...entry.sourceFile.split("/"));
    await rejectSymlinkAncestors(sourcePath, `${sourceLabel}.sourceFile`);
    await regularPath(sourcePath, `${sourceLabel}.sourceFile`, "file");
    const sourceBytes = await readFile(sourcePath).catch((error) => fail("READ_ERROR", `Cannot read ${sourceLabel}.sourceFile: ${error.message}`));
    if (sha256(sourceBytes) !== source.sourceSha256) fail("HASH_MISMATCH", `${sourceLabel}.sourceFile does not match the fixed current source hash.`);
    let questions;
    try { questions = JSON.parse(sourceBytes.toString("utf8")); }
    catch (error) { fail("INVALID_JSON", `${sourceLabel}.sourceFile is not valid JSON: ${error.message}`); }
    const expectedItems = [...accepted.replacements, ...accepted.sameIdCorrections].filter((item) => item.sourceFile === source.sourceFile);
    const expectedIds = expectedItems.map((item) => item.questionId);
    if (!Array.isArray(questions) || questions.length !== expectedIds.length) {
      fail("EVIDENCE_MEMBERSHIP", `${sourceLabel}.sourceFile must contain exactly the fixed ${expectedIds.length} current questions.`);
    }
    assertExactSet(questions.map((question) => question?.questionId), expectedIds, `${sourceLabel}.source question IDs`);
    const sourceById = new Map(questions.map((question) => [question.questionId, question]));
    for (const question of questions) {
      const location = canonical.questionLocations.get(question.questionId);
      if (!location || path.relative(projectRoot, location.path).split(path.sep).join("/") !== source.sourceFile) {
        fail("CANONICAL_MEMBERSHIP", `${sourceLabel} includes an item outside its fixed canonical source location.`);
      }
      if (question.trackId !== accepted.trackId || question.nodeId !== source.nodeId || question.mentalUnitId !== source.mentalUnitId) {
        fail("EVIDENCE_MEMBERSHIP", `${sourceLabel} contains an item with a different fixed taxonomy.`);
      }
      const canonicalQuestion = currentTrackQuestions.find((current) => current.questionId === question.questionId);
      if (!canonicalQuestion || canonicalJson(canonicalQuestion) !== canonicalJson(question)) {
        fail("HASH_MISMATCH", `${sourceLabel} source item differs from current canonical content.`);
      }
    }
    sourcesByPath.set(source.sourceFile, { sourcePath, questions, sourceById });
  }

  const proofGroups = [
    ["replacements", accepted.replacements],
    ["sameIdCorrections", accepted.sameIdCorrections]
  ];
  const currentById = new Map(currentTrackQuestions.map((question) => [question.questionId, question]));
  const oldRowsById = new Map(evidence.rowsByTrack.get(accepted.trackId).map((row) => [row.questionId, row]));
  const beforeByCurrentId = new Map();
  const oldIds = new Set();
  const newIds = new Set();
  const replacements = [];
  const sameIdCorrections = [];
  for (const [groupName, descriptors] of proofGroups) {
    const entries = proof[groupName];
    if (!Array.isArray(entries) || entries.length !== descriptors.length) {
      fail("EVIDENCE_MEMBERSHIP", `${label}.${groupName} must contain exactly the fixed ${descriptors.length} items.`);
    }
    for (const [index, item] of descriptors.entries()) {
      const entry = entries[index];
      const itemLabel = `${label}.${groupName}[${index}]`;
      exactKeys(entry, BIZQ01_OOD_COHORT23_ITEM_KEYS, itemLabel);
      for (const key of ["sourceFile", "beforeSourceSha256", "sourceSha256", "beforeQuestionId", "questionId", "nodeId", "mentalUnitId", "learningObjective", "identityAction", "identityReason", "acceptedOptionId"]) {
        if (entry[key] !== item[key]) fail("EVIDENCE_VALUE", `${itemLabel}.${key} differs from the fixed cohort map.`);
      }
      if (canonicalJson(entry.confirmedDefects) !== canonicalJson(item.confirmedDefects) || canonicalJson(entry.sourceRefs) !== canonicalJson(item.sourceRefs)) {
        fail("EVIDENCE_VALUE", `${itemLabel} defect record or source references differ from the fixed review.`);
      }
      const source = accepted.sourceFiles.find((candidate) => candidate.sourceFile === item.sourceFile);
      if (!source || item.beforeSourceSha256 !== source.beforeSourceSha256 || item.sourceSha256 !== source.sourceSha256) {
        fail("EVIDENCE_VALUE", `${itemLabel} source hashes do not match the fixed source descriptor.`);
      }
      const oldQuestion = entry.beforeQuestion;
      const currentQuestion = currentById.get(item.questionId);
      const oldRow = oldRowsById.get(item.beforeQuestionId);
      const sourceData = sourcesByPath.get(item.sourceFile);
      const isSameId = groupName === "sameIdCorrections";
      if (!oldQuestion || !currentQuestion || !oldRow || !sourceData || currentById.has(item.beforeQuestionId) !== isSameId) {
        fail("EVIDENCE_MEMBERSHIP", `${itemLabel} does not bind the fixed historical item to its current item.`);
      }
      if (isSameId ? item.beforeQuestionId !== item.questionId : item.beforeQuestionId === item.questionId) {
        fail("EVIDENCE_MEMBERSHIP", `${itemLabel} has an invalid fixed identity action.`);
      }
      if (oldIds.has(item.beforeQuestionId) || newIds.has(item.questionId)) fail("EVIDENCE_MEMBERSHIP", `${itemLabel} duplicates a historical or current identity.`);
      oldIds.add(item.beforeQuestionId);
      newIds.add(item.questionId);
      assertCanonicalQuestion(oldQuestion, `${itemLabel}.beforeQuestion`, ACCEPTED_TRACK_IDS);
      assertCanonicalQuestion(entry.currentQuestion, `${itemLabel}.currentQuestion`, ACCEPTED_TRACK_IDS);
      if (oldQuestion.questionId !== item.beforeQuestionId || oldQuestion.trackId !== accepted.trackId || oldQuestion.nodeId !== item.nodeId || oldQuestion.mentalUnitId !== item.mentalUnitId ||
          currentQuestion.questionId !== item.questionId || currentQuestion.trackId !== accepted.trackId || currentQuestion.nodeId !== item.nodeId || currentQuestion.mentalUnitId !== item.mentalUnitId ||
          canonicalJson(entry.currentQuestion) !== canonicalJson(currentQuestion)) {
        fail("EVIDENCE_MEMBERSHIP", `${itemLabel} changes the fixed taxonomy or current authored object.`);
      }
      for (const key of ["trackId", "nodeId", "mentalUnitId"]) {
        if (oldRow[key] !== oldQuestion[key]) fail("EVIDENCE_MEMBERSHIP", `${itemLabel} historical evidence ${key} differs from the old question.`);
      }
      assertCanonicalHash(oldRow, oldQuestion, `${itemLabel}.beforeQuestion`);
      if (currentQuestion.interaction.type !== "choice_single" || currentQuestion.interaction.scoringMethod !== "exact_selected_set" ||
          currentQuestion.answer.type !== "choice_single" || currentQuestion.answer.optionId !== item.acceptedOptionId || canonicalJson(currentQuestion.sourceRefs) !== canonicalJson(item.sourceRefs)) {
        fail("EVIDENCE_MEMBERSHIP", `${itemLabel} changes the fixed interaction, scoring, accepted answer, or primary references.`);
      }
      const priorOptionIds = new Set(oldQuestion.interaction.options.map((option) => option.optionId));
      const currentItemOptionIds = currentQuestion.interaction.options.map((option) => option.optionId);
      if (new Set(currentItemOptionIds).size !== currentItemOptionIds.length) {
        fail("EVIDENCE_MEMBERSHIP", `${itemLabel} uses duplicate current option identities.`);
      }
      if (!isSameId && currentItemOptionIds.some((optionId) => priorOptionIds.has(optionId))) {
        fail("EVIDENCE_MEMBERSHIP", `${itemLabel} reuses an option identity from its retired item.`);
      }
      const sourceQuestion = sourceData.sourceById.get(item.questionId);
      if (!sourceQuestion || canonicalJson(sourceQuestion) !== canonicalJson(currentQuestion)) fail("HASH_MISMATCH", `${itemLabel} source item differs from current canonical content.`);
      if (beforeByCurrentId.has(item.questionId)) fail("EVIDENCE_MEMBERSHIP", `${itemLabel} has more than one predecessor object.`);
      beforeByCurrentId.set(item.questionId, oldQuestion);
      if (isSameId) sameIdCorrections.push({ questionId: item.questionId, oldQuestion, newQuestion: currentQuestion });
      else replacements.push({ oldQuestion, newQuestion: currentQuestion, beforeQuestionId: item.beforeQuestionId, questionId: item.questionId });
    }
  }
  for (const source of accepted.sourceFiles) {
    const sourceData = sourcesByPath.get(source.sourceFile);
    const predecessorQuestions = sourceData.questions.map((question) => beforeByCurrentId.get(question.questionId) ?? question)
      .sort((left, right) => compare(left.questionId, right.questionId));
    const predecessorBytes = Buffer.from(JSON.stringify(predecessorQuestions), "utf8");
    if (sha256(predecessorBytes) !== source.beforeSourceSha256) fail("HASH_MISMATCH", `${label} does not reconstruct byte-exact ${accepted.beforeContentVersion} source ${source.sourceFile}.`);
  }
  const reconstructedTrackQuestions = currentTrackQuestions.map((question) => beforeByCurrentId.get(question.questionId) ?? question)
    .sort((left, right) => compare(left.questionId, right.questionId));
  if (sha256(reconstructedTrackQuestions) !== accepted.beforeQuestionSetSha256) fail("HASH_MISMATCH", `${label} does not reconstruct the immutable predecessor OOD question set.`);
  const predecessorCatalog = {
    ...canonical.catalog,
    tracks: canonical.catalog.tracks.map((track) => track.trackId === accepted.trackId ? { ...track, contentVersion: accepted.beforeContentVersion } : track)
  };
  const predecessorLocations = new Map(canonical.questionLocations);
  for (const item of replacements) {
    const descriptor = accepted.replacements.find((candidate) => candidate.questionId === item.questionId);
    predecessorLocations.delete(item.questionId);
    predecessorLocations.set(item.beforeQuestionId, {
      trackId: accepted.trackId,
      nodeId: item.oldQuestion.nodeId,
      mentalUnitId: item.oldQuestion.mentalUnitId,
      path: sourcesByPath.get(descriptor.sourceFile).sourcePath
    });
  }
  const predecessorCanonical = {
    ...canonical,
    catalog: predecessorCatalog,
    catalogByTrack: new Map(predecessorCatalog.tracks.map((track) => [track.trackId, track])),
    questionsByTrack: new Map(canonical.questionsByTrack).set(accepted.trackId, reconstructedTrackQuestions),
    questionLocations: predecessorLocations
  };
  const predecessor = await loadBizq01OodSemanticProof(contentRoot, predecessorCanonical, evidence, undefined, true, explanationHistoricalSourceBytes);
  if (!predecessor) fail("EVIDENCE_MEMBERSHIP", `${label} requires the unchanged fixed v22 predecessor proof chain.`);
  return {
    trackId: accepted.trackId,
    replacements: [...predecessor.replacements, ...replacements],
    sameIdCorrections: [...(predecessor.sameIdCorrections ?? []), ...sameIdCorrections],
    reasonAmendmentQuestionIds: predecessor.reasonAmendmentQuestionIds
  };
}


async function validateBizq01OodCohort24Proof(contentRoot, canonical, evidence, explanationHistoricalSourceBytes) {
  const accepted = BIZQ01_OOD_COHORT24_PROOF.descriptor;
  const label = accepted.scope;
  const projectRoot = path.dirname(contentRoot);
  const proofPath = path.join(projectRoot, BIZQ01_OOD_COHORT24_PROOF.path);
  const proofInfo = await lstat(proofPath).catch((error) => {
    if (error?.code === "ENOENT") return undefined;
    fail("PATH_ERROR", `Cannot inspect ${label}: ${error.message}`);
  });
  if (!proofInfo) return undefined;
  await rejectSymlinkAncestors(proofPath, label);
  await regularPath(proofPath, label, "file");
  const proofBytes = await readFile(proofPath).catch((error) => fail("READ_ERROR", `Cannot read ${label}: ${error.message}`));
  if (sha256(proofBytes) !== BIZQ01_OOD_COHORT24_PROOF.sha256) fail("HASH_MISMATCH", `${label} differs from its fixed proof bytes.`);
  let proof;
  try { proof = JSON.parse(proofBytes.toString("utf8")); }
  catch (error) { fail("INVALID_JSON", `${label} is not valid JSON: ${error.message}`); }
  exactKeys(proof, BIZQ01_OOD_COHORT24_ROOT_KEYS, label);
  for (const key of ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "beforeQuestionSetSha256", "questionSetSha256"]) {
    if (proof[key] !== accepted[key]) fail("EVIDENCE_VALUE", `${label}.${key} differs from the fixed cohort identity.`);
  }
  for (const key of ["beforeQuestionSetSha256", "questionSetSha256"]) assertHash(proof[key], `${label}.${key}`);
  const currentTrackQuestions = canonical.questionsByTrack.get(accepted.trackId);
  if (!currentTrackQuestions || sha256([...currentTrackQuestions].sort((left, right) => compare(left.questionId, right.questionId))) !== accepted.questionSetSha256) {
    fail("HASH_MISMATCH", `${label} current OOD question set differs from its fixed descriptor.`);
  }
  if (!Array.isArray(proof.sourceFiles) || proof.sourceFiles.length !== accepted.sourceFiles.length) {
    fail("EVIDENCE_MEMBERSHIP", `${label} must identify exactly the ${accepted.sourceFiles.length} fixed source files.`);
  }
  const sourcesByPath = new Map();
  for (const [index, source] of accepted.sourceFiles.entries()) {
    const entry = proof.sourceFiles[index];
    const sourceLabel = `${label}.sourceFiles[${index}]`;
    exactKeys(entry, BIZQ01_OOD_COHORT24_SOURCE_KEYS, sourceLabel);
    for (const key of BIZQ01_OOD_COHORT24_SOURCE_KEYS) {
      if (entry[key] !== source[key]) fail("EVIDENCE_VALUE", `${sourceLabel}.${key} differs from the fixed cohort descriptor.`);
    }
    assertRelativePath(entry.sourceFile, `${sourceLabel}.sourceFile`, { suffix: ".json" });
    assertHash(entry.beforeSourceSha256, `${sourceLabel}.beforeSourceSha256`);
    assertHash(entry.sourceSha256, `${sourceLabel}.sourceSha256`);
    const sourcePath = path.resolve(projectRoot, ...entry.sourceFile.split("/"));
    await rejectSymlinkAncestors(sourcePath, `${sourceLabel}.sourceFile`);
    await regularPath(sourcePath, `${sourceLabel}.sourceFile`, "file");
    const sourceBytes = await readFile(sourcePath).catch((error) => fail("READ_ERROR", `Cannot read ${sourceLabel}.sourceFile: ${error.message}`));
    if (sha256(sourceBytes) !== source.sourceSha256) fail("HASH_MISMATCH", `${sourceLabel}.sourceFile does not match the fixed current source hash.`);
    let questions;
    try { questions = JSON.parse(sourceBytes.toString("utf8")); }
    catch (error) { fail("INVALID_JSON", `${sourceLabel}.sourceFile is not valid JSON: ${error.message}`); }
    const expectedItems = [...accepted.replacements, ...accepted.sameIdCorrections].filter((item) => item.sourceFile === source.sourceFile);
    const expectedIds = expectedItems.map((item) => item.questionId);
    if (!Array.isArray(questions) || questions.length !== expectedIds.length) {
      fail("EVIDENCE_MEMBERSHIP", `${sourceLabel}.sourceFile must contain exactly the fixed ${expectedIds.length} current questions.`);
    }
    assertExactSet(questions.map((question) => question?.questionId), expectedIds, `${sourceLabel}.source question IDs`);
    const sourceById = new Map(questions.map((question) => [question.questionId, question]));
    for (const question of questions) {
      const location = canonical.questionLocations.get(question.questionId);
      if (!location || path.relative(projectRoot, location.path).split(path.sep).join("/") !== source.sourceFile) {
        fail("CANONICAL_MEMBERSHIP", `${sourceLabel} includes an item outside its fixed canonical source location.`);
      }
      if (question.trackId !== accepted.trackId || question.nodeId !== source.nodeId || question.mentalUnitId !== source.mentalUnitId) {
        fail("EVIDENCE_MEMBERSHIP", `${sourceLabel} contains an item with a different fixed taxonomy.`);
      }
      const canonicalQuestion = currentTrackQuestions.find((current) => current.questionId === question.questionId);
      if (!canonicalQuestion || canonicalJson(canonicalQuestion) !== canonicalJson(question)) {
        fail("HASH_MISMATCH", `${sourceLabel} source item differs from current canonical content.`);
      }
    }
    sourcesByPath.set(source.sourceFile, { sourcePath, questions, sourceById });
  }

  const proofGroups = [
    ["replacements", accepted.replacements],
    ["sameIdCorrections", accepted.sameIdCorrections]
  ];
  const currentById = new Map(currentTrackQuestions.map((question) => [question.questionId, question]));
  const oldRowsById = new Map(evidence.rowsByTrack.get(accepted.trackId).map((row) => [row.questionId, row]));
  const beforeByCurrentId = new Map();
  const oldIds = new Set();
  const newIds = new Set();
  const replacements = [];
  const sameIdCorrections = [];
  for (const [groupName, descriptors] of proofGroups) {
    const entries = proof[groupName];
    if (!Array.isArray(entries) || entries.length !== descriptors.length) {
      fail("EVIDENCE_MEMBERSHIP", `${label}.${groupName} must contain exactly the fixed ${descriptors.length} items.`);
    }
    for (const [index, item] of descriptors.entries()) {
      const entry = entries[index];
      const itemLabel = `${label}.${groupName}[${index}]`;
      exactKeys(entry, BIZQ01_OOD_COHORT24_ITEM_KEYS, itemLabel);
      for (const key of ["sourceFile", "beforeSourceSha256", "sourceSha256", "beforeQuestionId", "questionId", "nodeId", "mentalUnitId", "learningObjective", "identityAction", "identityReason", "acceptedOptionId"]) {
        if (entry[key] !== item[key]) fail("EVIDENCE_VALUE", `${itemLabel}.${key} differs from the fixed cohort map.`);
      }
      if (canonicalJson(entry.confirmedDefects) !== canonicalJson(item.confirmedDefects) || canonicalJson(entry.sourceRefs) !== canonicalJson(item.sourceRefs)) {
        fail("EVIDENCE_VALUE", `${itemLabel} defect record or source references differ from the fixed review.`);
      }
      const source = accepted.sourceFiles.find((candidate) => candidate.sourceFile === item.sourceFile);
      if (!source || item.beforeSourceSha256 !== source.beforeSourceSha256 || item.sourceSha256 !== source.sourceSha256) {
        fail("EVIDENCE_VALUE", `${itemLabel} source hashes do not match the fixed source descriptor.`);
      }
      const oldQuestion = entry.beforeQuestion;
      const currentQuestion = currentById.get(item.questionId);
      const oldRow = oldRowsById.get(item.beforeQuestionId);
      const sourceData = sourcesByPath.get(item.sourceFile);
      const isSameId = groupName === "sameIdCorrections";
      if (!oldQuestion || !currentQuestion || !oldRow || !sourceData || currentById.has(item.beforeQuestionId) !== isSameId) {
        fail("EVIDENCE_MEMBERSHIP", `${itemLabel} does not bind the fixed historical item to its current item.`);
      }
      if (isSameId ? item.beforeQuestionId !== item.questionId : item.beforeQuestionId === item.questionId) {
        fail("EVIDENCE_MEMBERSHIP", `${itemLabel} has an invalid fixed identity action.`);
      }
      if (oldIds.has(item.beforeQuestionId) || newIds.has(item.questionId)) fail("EVIDENCE_MEMBERSHIP", `${itemLabel} duplicates a historical or current identity.`);
      oldIds.add(item.beforeQuestionId);
      newIds.add(item.questionId);
      assertCanonicalQuestion(oldQuestion, `${itemLabel}.beforeQuestion`, ACCEPTED_TRACK_IDS);
      assertCanonicalQuestion(entry.currentQuestion, `${itemLabel}.currentQuestion`, ACCEPTED_TRACK_IDS);
      if (oldQuestion.questionId !== item.beforeQuestionId || oldQuestion.trackId !== accepted.trackId || oldQuestion.nodeId !== item.nodeId || oldQuestion.mentalUnitId !== item.mentalUnitId ||
          currentQuestion.questionId !== item.questionId || currentQuestion.trackId !== accepted.trackId || currentQuestion.nodeId !== item.nodeId || currentQuestion.mentalUnitId !== item.mentalUnitId ||
          canonicalJson(entry.currentQuestion) !== canonicalJson(currentQuestion)) {
        fail("EVIDENCE_MEMBERSHIP", `${itemLabel} changes the fixed taxonomy or current authored object.`);
      }
      for (const key of ["trackId", "nodeId", "mentalUnitId"]) {
        if (oldRow[key] !== oldQuestion[key]) fail("EVIDENCE_MEMBERSHIP", `${itemLabel} historical evidence ${key} differs from the old question.`);
      }
      assertCanonicalHash(oldRow, oldQuestion, `${itemLabel}.beforeQuestion`);
      if (currentQuestion.interaction.type !== "choice_single" || currentQuestion.interaction.scoringMethod !== "exact_selected_set" ||
          currentQuestion.answer.type !== "choice_single" || currentQuestion.answer.optionId !== item.acceptedOptionId || canonicalJson(currentQuestion.sourceRefs) !== canonicalJson(item.sourceRefs)) {
        fail("EVIDENCE_MEMBERSHIP", `${itemLabel} changes the fixed interaction, scoring, accepted answer, or primary references.`);
      }
      const priorOptionIds = new Set(oldQuestion.interaction.options.map((option) => option.optionId));
      const currentItemOptionIds = currentQuestion.interaction.options.map((option) => option.optionId);
      if (new Set(currentItemOptionIds).size !== currentItemOptionIds.length) {
        fail("EVIDENCE_MEMBERSHIP", `${itemLabel} uses duplicate current option identities.`);
      }
      if (!isSameId && currentItemOptionIds.some((optionId) => priorOptionIds.has(optionId))) {
        fail("EVIDENCE_MEMBERSHIP", `${itemLabel} reuses an option identity from its retired item.`);
      }
      const sourceQuestion = sourceData.sourceById.get(item.questionId);
      if (!sourceQuestion || canonicalJson(sourceQuestion) !== canonicalJson(currentQuestion)) fail("HASH_MISMATCH", `${itemLabel} source item differs from current canonical content.`);
      if (beforeByCurrentId.has(item.questionId)) fail("EVIDENCE_MEMBERSHIP", `${itemLabel} has more than one predecessor object.`);
      beforeByCurrentId.set(item.questionId, oldQuestion);
      if (isSameId) sameIdCorrections.push({ questionId: item.questionId, oldQuestion, newQuestion: currentQuestion });
      else replacements.push({ oldQuestion, newQuestion: currentQuestion, beforeQuestionId: item.beforeQuestionId, questionId: item.questionId });
    }
  }
  for (const source of accepted.sourceFiles) {
    const sourceData = sourcesByPath.get(source.sourceFile);
    const predecessorQuestions = sourceData.questions.map((question) => beforeByCurrentId.get(question.questionId) ?? question)
      .sort((left, right) => compare(left.questionId, right.questionId));
    const predecessorBytes = Buffer.from(JSON.stringify(predecessorQuestions), "utf8");
    if (sha256(predecessorBytes) !== source.beforeSourceSha256) fail("HASH_MISMATCH", `${label} does not reconstruct byte-exact ${accepted.beforeContentVersion} source ${source.sourceFile}.`);
  }
  const reconstructedTrackQuestions = currentTrackQuestions.map((question) => beforeByCurrentId.get(question.questionId) ?? question)
    .sort((left, right) => compare(left.questionId, right.questionId));
  if (sha256(reconstructedTrackQuestions) !== accepted.beforeQuestionSetSha256) fail("HASH_MISMATCH", `${label} does not reconstruct the immutable predecessor OOD question set.`);
  const predecessorCatalog = {
    ...canonical.catalog,
    tracks: canonical.catalog.tracks.map((track) => track.trackId === accepted.trackId ? { ...track, contentVersion: accepted.beforeContentVersion } : track)
  };
  const predecessorLocations = new Map(canonical.questionLocations);
  for (const item of replacements) {
    const descriptor = accepted.replacements.find((candidate) => candidate.questionId === item.questionId);
    predecessorLocations.delete(item.questionId);
    predecessorLocations.set(item.beforeQuestionId, {
      trackId: accepted.trackId,
      nodeId: item.oldQuestion.nodeId,
      mentalUnitId: item.oldQuestion.mentalUnitId,
      path: sourcesByPath.get(descriptor.sourceFile).sourcePath
    });
  }
  const predecessorCanonical = {
    ...canonical,
    catalog: predecessorCatalog,
    catalogByTrack: new Map(predecessorCatalog.tracks.map((track) => [track.trackId, track])),
    questionsByTrack: new Map(canonical.questionsByTrack).set(accepted.trackId, reconstructedTrackQuestions),
    questionLocations: predecessorLocations
  };
  const predecessor = await loadBizq01OodSemanticProof(contentRoot, predecessorCanonical, evidence, undefined, true, explanationHistoricalSourceBytes);
  if (!predecessor) fail("EVIDENCE_MEMBERSHIP", `${label} requires the unchanged fixed v23 predecessor proof chain.`);
  return {
    trackId: accepted.trackId,
    replacements: [...predecessor.replacements, ...replacements],
    sameIdCorrections: [...(predecessor.sameIdCorrections ?? []), ...sameIdCorrections],
    reasonAmendmentQuestionIds: predecessor.reasonAmendmentQuestionIds
  };
}


async function validateBizq01OodCohort22Proof(contentRoot, canonical, evidence, explanationHistoricalSourceBytes) {
  const accepted = BIZQ01_OOD_COHORT22_PROOF.descriptor;
  const label = accepted.scope;
  const projectRoot = path.dirname(contentRoot);
  const proofPath = path.join(projectRoot, BIZQ01_OOD_COHORT22_PROOF.path);
  const proofInfo = await lstat(proofPath).catch((error) => {
    if (error?.code === "ENOENT") return undefined;
    fail("PATH_ERROR", `Cannot inspect ${label}: ${error.message}`);
  });
  if (!proofInfo) return undefined;
  await rejectSymlinkAncestors(proofPath, label);
  await regularPath(proofPath, label, "file");
  const proofBytes = await readFile(proofPath).catch((error) => fail("READ_ERROR", `Cannot read ${label}: ${error.message}`));
  if (sha256(proofBytes) !== BIZQ01_OOD_COHORT22_PROOF.sha256) fail("HASH_MISMATCH", `${label} differs from its fixed proof bytes.`);
  let proof;
  try { proof = JSON.parse(proofBytes.toString("utf8")); }
  catch (error) { fail("INVALID_JSON", `${label} is not valid JSON: ${error.message}`); }
  exactKeys(proof, BIZQ01_OOD_COHORT22_ROOT_KEYS, label);
  for (const key of ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "beforeQuestionSetSha256", "questionSetSha256"]) {
    if (proof[key] !== accepted[key]) fail("EVIDENCE_VALUE", `${label}.${key} differs from the fixed cohort identity.`);
  }
  for (const key of ["beforeQuestionSetSha256", "questionSetSha256"]) assertHash(proof[key], `${label}.${key}`);
  const currentTrackQuestions = canonical.questionsByTrack.get(accepted.trackId);
  if (!currentTrackQuestions || sha256([...currentTrackQuestions].sort((left, right) => compare(left.questionId, right.questionId))) !== accepted.questionSetSha256) {
    fail("HASH_MISMATCH", `${label} current OOD question set differs from its fixed descriptor.`);
  }
  if (!Array.isArray(proof.replacements) || proof.replacements.length !== 0) {
    fail("EVIDENCE_MEMBERSHIP", `${label} contains no question-ID replacements.`);
  }
  if (!Array.isArray(proof.sourceFiles) || proof.sourceFiles.length !== accepted.sourceFiles.length) {
    fail("EVIDENCE_MEMBERSHIP", `${label} must identify exactly the ${accepted.sourceFiles.length} fixed source files.`);
  }
  if (!Array.isArray(proof.sameIdCorrections) || proof.sameIdCorrections.length !== accepted.sameIdCorrections.length) {
    fail("EVIDENCE_MEMBERSHIP", `${label} must contain exactly the ${accepted.sameIdCorrections.length} fixed same-ID corrections.`);
  }

  const sourceDataByPath = new Map();
  for (const [index, source] of accepted.sourceFiles.entries()) {
    const entry = proof.sourceFiles[index];
    const sourceLabel = `${label}.sourceFiles[${index}]`;
    exactKeys(entry, BIZQ01_OOD_COHORT22_SOURCE_KEYS, sourceLabel);
    for (const key of BIZQ01_OOD_COHORT22_SOURCE_KEYS) {
      if (entry[key] !== source[key]) fail("EVIDENCE_VALUE", `${sourceLabel}.${key} differs from the fixed cohort descriptor.`);
    }
    assertRelativePath(entry.sourceFile, `${sourceLabel}.sourceFile`, { suffix: ".json" });
    assertHash(entry.beforeSourceSha256, `${sourceLabel}.beforeSourceSha256`);
    assertHash(entry.sourceSha256, `${sourceLabel}.sourceSha256`);
    const sourcePath = path.resolve(projectRoot, ...entry.sourceFile.split("/"));
    await rejectSymlinkAncestors(sourcePath, `${sourceLabel}.sourceFile`);
    await regularPath(sourcePath, `${sourceLabel}.sourceFile`, "file");
    const sourceBytes = await readFile(sourcePath).catch((error) => fail("READ_ERROR", `Cannot read ${sourceLabel}.sourceFile: ${error.message}`));
    if (sha256(sourceBytes) !== source.sourceSha256) fail("HASH_MISMATCH", `${sourceLabel}.sourceFile does not match the fixed current source hash.`);
    let questions;
    try { questions = JSON.parse(sourceBytes.toString("utf8")); }
    catch (error) { fail("INVALID_JSON", `${sourceLabel}.sourceFile is not valid JSON: ${error.message}`); }
    const expectedItems = accepted.sameIdCorrections.filter((item) => item.sourceFile === source.sourceFile);
    const expectedIds = expectedItems.map((item) => item.questionId);
    if (!Array.isArray(questions) || questions.length !== expectedIds.length) {
      fail("EVIDENCE_MEMBERSHIP", `${sourceLabel}.sourceFile must contain exactly the fixed ${expectedIds.length} current questions.`);
    }
    assertExactSet(questions.map((question) => question?.questionId), expectedIds, `${sourceLabel}.source question IDs`);
    const sourceById = new Map(questions.map((question) => [question.questionId, question]));
    for (const question of questions) {
      const location = canonical.questionLocations.get(question.questionId);
      if (!location || path.relative(projectRoot, location.path).split(path.sep).join("/") !== source.sourceFile) {
        fail("CANONICAL_MEMBERSHIP", `${sourceLabel} includes an item outside its fixed canonical source location.`);
      }
      if (question.trackId !== accepted.trackId || question.nodeId !== source.nodeId || question.mentalUnitId !== source.mentalUnitId) {
        fail("EVIDENCE_MEMBERSHIP", `${sourceLabel} contains an item with a different fixed taxonomy.`);
      }
      const canonicalQuestion = currentTrackQuestions.find((current) => current.questionId === question.questionId);
      if (!canonicalQuestion || canonicalJson(canonicalQuestion) !== canonicalJson(question)) {
        fail("HASH_MISMATCH", `${sourceLabel} source item differs from current canonical content.`);
      }
    }
    sourceDataByPath.set(source.sourceFile, { sourcePath, questions, sourceById });
  }

  const currentById = new Map(currentTrackQuestions.map((question) => [question.questionId, question]));
  const oldRowsById = new Map(evidence.rowsByTrack.get(accepted.trackId).map((row) => [row.questionId, row]));
  const beforeById = new Map();
  const sameIdCorrections = [];
  for (const [index, item] of accepted.sameIdCorrections.entries()) {
    const entry = proof.sameIdCorrections[index];
    const itemLabel = `${label}.sameIdCorrections[${index}]`;
    exactKeys(entry, BIZQ01_OOD_COHORT22_ITEM_KEYS, itemLabel);
    for (const key of ["sourceFile", "beforeSourceSha256", "sourceSha256", "beforeQuestionId", "questionId", "nodeId", "mentalUnitId", "learningObjective", "identityAction", "identityReason", "acceptedOptionId"]) {
      if (entry[key] !== item[key]) fail("EVIDENCE_VALUE", `${itemLabel}.${key} differs from the fixed same-ID map.`);
    }
    if (canonicalJson(entry.confirmedDefects) !== canonicalJson(item.confirmedDefects) || canonicalJson(entry.sourceRefs) !== canonicalJson(item.sourceRefs)) {
      fail("EVIDENCE_VALUE", `${itemLabel} defect record or source references differ from the fixed review.`);
    }
    if (item.beforeQuestionId !== item.questionId || item.identityAction !== "preserve_question_id") {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} is not an accepted same-ID correction.`);
    }
    const source = accepted.sourceFiles.find((candidate) => candidate.sourceFile === item.sourceFile);
    const sourceData = sourceDataByPath.get(item.sourceFile);
    const oldRow = oldRowsById.get(item.beforeQuestionId);
    const oldQuestion = entry.beforeQuestion;
    const currentQuestion = currentById.get(item.questionId);
    if (!source || !sourceData || !oldRow || !oldQuestion || !currentQuestion) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} does not bind the fixed historical question to its current item.`);
    }
    assertCanonicalQuestion(oldQuestion, `${itemLabel}.beforeQuestion`, ACCEPTED_TRACK_IDS);
    assertCanonicalQuestion(entry.currentQuestion, `${itemLabel}.currentQuestion`, ACCEPTED_TRACK_IDS);
    if (oldQuestion.questionId !== item.beforeQuestionId || currentQuestion.questionId !== item.questionId ||
        oldQuestion.trackId !== accepted.trackId || currentQuestion.trackId !== accepted.trackId ||
        oldQuestion.nodeId !== item.nodeId || currentQuestion.nodeId !== item.nodeId ||
        oldQuestion.mentalUnitId !== item.mentalUnitId || currentQuestion.mentalUnitId !== item.mentalUnitId ||
        canonicalJson(entry.currentQuestion) !== canonicalJson(currentQuestion)) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} changes the accepted question identity, taxonomy, or current authored object.`);
    }
    for (const key of ["trackId", "nodeId", "mentalUnitId", "questionId"]) {
      if (oldRow[key] !== oldQuestion[key]) fail("EVIDENCE_MEMBERSHIP", `${itemLabel} historical evidence ${key} differs from the before object.`);
    }
    assertCanonicalHash(oldRow, oldQuestion, `${itemLabel}.beforeQuestion`);
    if (currentQuestion.interaction.type !== "choice_single" || currentQuestion.interaction.scoringMethod !== "exact_selected_set" ||
        currentQuestion.answer.type !== "choice_single" || currentQuestion.answer.optionId !== item.acceptedOptionId ||
        canonicalJson(currentQuestion.sourceRefs) !== canonicalJson(item.sourceRefs)) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} changes the fixed interaction, scoring, accepted answer, or primary references.`);
    }
    const optionIds = currentQuestion.interaction.options.map((option) => option.optionId);
    if (new Set(optionIds).size !== optionIds.length) fail("EVIDENCE_MEMBERSHIP", `${itemLabel} has duplicate option IDs within its question.`);
    const sourceQuestion = sourceData.sourceById.get(item.questionId);
    if (!sourceQuestion || canonicalJson(sourceQuestion) !== canonicalJson(currentQuestion)) {
      fail("HASH_MISMATCH", `${itemLabel} source item differs from current canonical content.`);
    }
    if (beforeById.has(item.questionId)) fail("EVIDENCE_MEMBERSHIP", `${itemLabel} has more than one predecessor object.`);
    beforeById.set(item.questionId, oldQuestion);
    sameIdCorrections.push({ questionId: item.questionId, oldQuestion, newQuestion: currentQuestion });
  }

  for (const source of accepted.sourceFiles) {
    const sourceData = sourceDataByPath.get(source.sourceFile);
    const predecessorQuestions = sourceData.questions.map((question) => beforeById.get(question.questionId) ?? question)
      .sort((left, right) => compare(left.questionId, right.questionId));
    const predecessorBytes = Buffer.from(JSON.stringify(predecessorQuestions), "utf8");
    if (sha256(predecessorBytes) !== source.beforeSourceSha256) {
      fail("HASH_MISMATCH", `${label} does not reconstruct byte-exact ${accepted.beforeContentVersion} source ${source.sourceFile}.`);
    }
  }
  const reconstructedTrackQuestions = currentTrackQuestions.map((question) => beforeById.get(question.questionId) ?? question)
    .sort((left, right) => compare(left.questionId, right.questionId));
  if (sha256(reconstructedTrackQuestions) !== accepted.beforeQuestionSetSha256) {
    fail("HASH_MISMATCH", `${label} does not reconstruct the immutable predecessor OOD question set.`);
  }
  const predecessorCatalog = {
    ...canonical.catalog,
    tracks: canonical.catalog.tracks.map((track) => track.trackId === accepted.trackId
      ? { ...track, contentVersion: accepted.beforeContentVersion }
      : track)
  };
  const predecessorCanonical = {
    ...canonical,
    catalog: predecessorCatalog,
    catalogByTrack: new Map(predecessorCatalog.tracks.map((track) => [track.trackId, track])),
    questionsByTrack: new Map(canonical.questionsByTrack).set(accepted.trackId, reconstructedTrackQuestions)
  };
  const predecessor = await loadBizq01OodSemanticProof(contentRoot, predecessorCanonical, evidence, undefined, true, explanationHistoricalSourceBytes);
  if (!predecessor) fail("EVIDENCE_MEMBERSHIP", `${label} requires the unchanged fixed v21 predecessor proof chain.`);
  return {
    trackId: accepted.trackId,
    replacements: predecessor.replacements,
    sameIdCorrections: [...(predecessor.sameIdCorrections ?? []), ...sameIdCorrections],
    reasonAmendmentQuestionIds: predecessor.reasonAmendmentQuestionIds
  };
}

async function validateBizq01OodCohort20Proof(contentRoot, canonical, evidence, explanationHistoricalSourceBytes) {
  const accepted = BIZQ01_OOD_COHORT20_PROOF.descriptor;
  const label = accepted.scope;
  const projectRoot = path.dirname(contentRoot);
  const proofPath = path.join(projectRoot, BIZQ01_OOD_COHORT20_PROOF.path);
  const proofInfo = await lstat(proofPath).catch((error) => {
    if (error?.code === "ENOENT") return undefined;
    fail("PATH_ERROR", `Cannot inspect ${label}: ${error.message}`);
  });
  if (!proofInfo) return undefined;
  await rejectSymlinkAncestors(proofPath, label);
  await regularPath(proofPath, label, "file");
  const proofBytes = await readFile(proofPath).catch((error) => fail("READ_ERROR", `Cannot read ${label}: ${error.message}`));
  if (sha256(proofBytes) !== BIZQ01_OOD_COHORT20_PROOF.sha256) fail("HASH_MISMATCH", `${label} differs from its fixed proof bytes.`);
  let proof;
  try { proof = JSON.parse(proofBytes.toString("utf8")); }
  catch (error) { fail("INVALID_JSON", `${label} is not valid JSON: ${error.message}`); }
  exactKeys(proof, BIZQ01_OOD_COHORT20_ROOT_KEYS, label);
  for (const key of ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "beforeQuestionSetSha256", "questionSetSha256"]) {
    if (proof[key] !== accepted[key]) fail("EVIDENCE_VALUE", `${label}.${key} differs from the fixed cohort identity.`);
  }
  for (const key of ["beforeQuestionSetSha256", "questionSetSha256"]) assertHash(proof[key], `${label}.${key}`);
  const currentTrackQuestions = canonical.questionsByTrack.get(accepted.trackId);
  if (!currentTrackQuestions || sha256([...currentTrackQuestions].sort((left, right) => compare(left.questionId, right.questionId))) !== accepted.questionSetSha256) {
    fail("HASH_MISMATCH", `${label} current OOD question set differs from its fixed descriptor.`);
  }
  if (!Array.isArray(proof.sourceFiles) || proof.sourceFiles.length !== accepted.sourceFiles.length) {
    fail("EVIDENCE_MEMBERSHIP", `${label} must identify exactly the ${accepted.sourceFiles.length} fixed source files.`);
  }
  const sourcesByPath = new Map();
  for (const [index, source] of accepted.sourceFiles.entries()) {
    const entry = proof.sourceFiles[index];
    const sourceLabel = `${label}.sourceFiles[${index}]`;
    exactKeys(entry, BIZQ01_OOD_COHORT20_SOURCE_KEYS, sourceLabel);
    for (const key of BIZQ01_OOD_COHORT20_SOURCE_KEYS) {
      if (entry[key] !== source[key]) fail("EVIDENCE_VALUE", `${sourceLabel}.${key} differs from the fixed cohort descriptor.`);
    }
    assertRelativePath(entry.sourceFile, `${sourceLabel}.sourceFile`, { suffix: ".json" });
    assertHash(entry.beforeSourceSha256, `${sourceLabel}.beforeSourceSha256`);
    assertHash(entry.sourceSha256, `${sourceLabel}.sourceSha256`);
    const sourcePath = path.resolve(projectRoot, ...entry.sourceFile.split("/"));
    await rejectSymlinkAncestors(sourcePath, `${sourceLabel}.sourceFile`);
    await regularPath(sourcePath, `${sourceLabel}.sourceFile`, "file");
    const sourceBytes = await readFile(sourcePath).catch((error) => fail("READ_ERROR", `Cannot read ${sourceLabel}.sourceFile: ${error.message}`));
    if (sha256(sourceBytes) !== source.sourceSha256) fail("HASH_MISMATCH", `${sourceLabel}.sourceFile does not match the fixed current source hash.`);
    let questions;
    try { questions = JSON.parse(sourceBytes.toString("utf8")); }
    catch (error) { fail("INVALID_JSON", `${sourceLabel}.sourceFile is not valid JSON: ${error.message}`); }
    const expectedItems = [...accepted.replacements, ...accepted.sameIdCorrections].filter((item) => item.sourceFile === source.sourceFile);
    const expectedIds = expectedItems.map((item) => item.questionId);
    if (!Array.isArray(questions) || questions.length !== expectedIds.length) {
      fail("EVIDENCE_MEMBERSHIP", `${sourceLabel}.sourceFile must contain exactly the fixed ${expectedIds.length} current questions.`);
    }
    assertExactSet(questions.map((question) => question?.questionId), expectedIds, `${sourceLabel}.source question IDs`);
    const sourceById = new Map(questions.map((question) => [question.questionId, question]));
    for (const question of questions) {
      const location = canonical.questionLocations.get(question.questionId);
      if (!location || path.relative(projectRoot, location.path).split(path.sep).join("/") !== source.sourceFile) {
        fail("CANONICAL_MEMBERSHIP", `${sourceLabel} includes an item outside its fixed canonical source location.`);
      }
      if (question.trackId !== accepted.trackId || question.nodeId !== source.nodeId || question.mentalUnitId !== source.mentalUnitId) {
        fail("EVIDENCE_MEMBERSHIP", `${sourceLabel} contains an item with a different fixed taxonomy.`);
      }
      const canonicalQuestion = currentTrackQuestions.find((current) => current.questionId === question.questionId);
      if (!canonicalQuestion || canonicalJson(canonicalQuestion) !== canonicalJson(question)) {
        fail("HASH_MISMATCH", `${sourceLabel} source item differs from current canonical content.`);
      }
    }
    sourcesByPath.set(source.sourceFile, { sourcePath, questions, sourceById });
  }

  const proofGroups = [
    ["replacements", accepted.replacements],
    ["sameIdCorrections", accepted.sameIdCorrections]
  ];
  const currentById = new Map(currentTrackQuestions.map((question) => [question.questionId, question]));
  const oldRowsById = new Map(evidence.rowsByTrack.get(accepted.trackId).map((row) => [row.questionId, row]));
  const beforeByCurrentId = new Map();
  const oldIds = new Set();
  const newIds = new Set();
  const oldOptionIds = new Set();
  const currentOptionIds = new Set();
  const replacements = [];
  const sameIdCorrections = [];
  for (const [groupName, descriptors] of proofGroups) {
    const entries = proof[groupName];
    if (!Array.isArray(entries) || entries.length !== descriptors.length) {
      fail("EVIDENCE_MEMBERSHIP", `${label}.${groupName} must contain exactly the fixed ${descriptors.length} items.`);
    }
    for (const [index, item] of descriptors.entries()) {
      const entry = entries[index];
      const itemLabel = `${label}.${groupName}[${index}]`;
      exactKeys(entry, BIZQ01_OOD_COHORT20_ITEM_KEYS, itemLabel);
      for (const key of ["sourceFile", "beforeSourceSha256", "sourceSha256", "beforeQuestionId", "questionId", "nodeId", "mentalUnitId", "learningObjective", "identityAction", "identityReason", "acceptedOptionId"]) {
        if (entry[key] !== item[key]) fail("EVIDENCE_VALUE", `${itemLabel}.${key} differs from the fixed cohort map.`);
      }
      if (canonicalJson(entry.confirmedDefects) !== canonicalJson(item.confirmedDefects) || canonicalJson(entry.sourceRefs) !== canonicalJson(item.sourceRefs)) {
        fail("EVIDENCE_VALUE", `${itemLabel} defect record or source references differ from the fixed review.`);
      }
      const source = accepted.sourceFiles.find((candidate) => candidate.sourceFile === item.sourceFile);
      if (!source || item.beforeSourceSha256 !== source.beforeSourceSha256 || item.sourceSha256 !== source.sourceSha256) {
        fail("EVIDENCE_VALUE", `${itemLabel} source hashes do not match the fixed source descriptor.`);
      }
      const oldQuestion = entry.beforeQuestion;
      const currentQuestion = currentById.get(item.questionId);
      const oldRow = oldRowsById.get(item.beforeQuestionId);
      const sourceData = sourcesByPath.get(item.sourceFile);
      const isSameId = groupName === "sameIdCorrections";
      if (!oldQuestion || !currentQuestion || !oldRow || !sourceData || currentById.has(item.beforeQuestionId) !== isSameId) {
        fail("EVIDENCE_MEMBERSHIP", `${itemLabel} does not bind the fixed historical item to its current item.`);
      }
      if (isSameId ? item.beforeQuestionId !== item.questionId : item.beforeQuestionId === item.questionId) {
        fail("EVIDENCE_MEMBERSHIP", `${itemLabel} has an invalid fixed identity action.`);
      }
      if (oldIds.has(item.beforeQuestionId) || newIds.has(item.questionId)) fail("EVIDENCE_MEMBERSHIP", `${itemLabel} duplicates a historical or current identity.`);
      oldIds.add(item.beforeQuestionId);
      newIds.add(item.questionId);
      assertCanonicalQuestion(oldQuestion, `${itemLabel}.beforeQuestion`, ACCEPTED_TRACK_IDS);
      assertCanonicalQuestion(entry.currentQuestion, `${itemLabel}.currentQuestion`, ACCEPTED_TRACK_IDS);
      if (oldQuestion.questionId !== item.beforeQuestionId || oldQuestion.trackId !== accepted.trackId || oldQuestion.nodeId !== item.nodeId || oldQuestion.mentalUnitId !== item.mentalUnitId ||
          currentQuestion.questionId !== item.questionId || currentQuestion.trackId !== accepted.trackId || currentQuestion.nodeId !== item.nodeId || currentQuestion.mentalUnitId !== item.mentalUnitId ||
          canonicalJson(entry.currentQuestion) !== canonicalJson(currentQuestion)) {
        fail("EVIDENCE_MEMBERSHIP", `${itemLabel} changes the fixed taxonomy or current authored object.`);
      }
      for (const key of ["trackId", "nodeId", "mentalUnitId"]) {
        if (oldRow[key] !== oldQuestion[key]) fail("EVIDENCE_MEMBERSHIP", `${itemLabel} historical evidence ${key} differs from the old question.`);
      }
      assertCanonicalHash(oldRow, oldQuestion, `${itemLabel}.beforeQuestion`);
      if (currentQuestion.interaction.type !== "choice_single" || currentQuestion.interaction.scoringMethod !== "exact_selected_set" ||
          currentQuestion.answer.type !== "choice_single" || currentQuestion.answer.optionId !== item.acceptedOptionId || canonicalJson(currentQuestion.sourceRefs) !== canonicalJson(item.sourceRefs)) {
        fail("EVIDENCE_MEMBERSHIP", `${itemLabel} changes the fixed interaction, scoring, accepted answer, or primary references.`);
      }
      const priorOptionIds = new Set(oldQuestion.interaction.options.map((option) => option.optionId));
      const currentItemOptionIds = currentQuestion.interaction.options.map((option) => option.optionId);
      if (new Set(currentItemOptionIds).size !== currentItemOptionIds.length || currentItemOptionIds.some((optionId) => currentOptionIds.has(optionId))) {
        fail("EVIDENCE_MEMBERSHIP", `${itemLabel} uses duplicate current option identities.`);
      }
      if (!isSameId && currentItemOptionIds.some((optionId) => priorOptionIds.has(optionId))) {
        fail("EVIDENCE_MEMBERSHIP", `${itemLabel} reuses an option identity from its retired item.`);
      }
      for (const option of oldQuestion.interaction.options) oldOptionIds.add(option.optionId);
      for (const optionId of currentItemOptionIds) currentOptionIds.add(optionId);
      const sourceQuestion = sourceData.sourceById.get(item.questionId);
      if (!sourceQuestion || canonicalJson(sourceQuestion) !== canonicalJson(currentQuestion)) fail("HASH_MISMATCH", `${itemLabel} source item differs from current canonical content.`);
      if (beforeByCurrentId.has(item.questionId)) fail("EVIDENCE_MEMBERSHIP", `${itemLabel} has more than one predecessor object.`);
      beforeByCurrentId.set(item.questionId, oldQuestion);
      if (isSameId) sameIdCorrections.push({ questionId: item.questionId, oldQuestion, newQuestion: currentQuestion });
      else replacements.push({ oldQuestion, newQuestion: currentQuestion, beforeQuestionId: item.beforeQuestionId, questionId: item.questionId });
    }
  }
  if ([...currentOptionIds].some((optionId) => oldOptionIds.has(optionId))) {
    fail("EVIDENCE_MEMBERSHIP", `${label} reuses an option identity from the retired cohort.`);
  }
  for (const source of accepted.sourceFiles) {
    const sourceData = sourcesByPath.get(source.sourceFile);
    const predecessorQuestions = sourceData.questions.map((question) => beforeByCurrentId.get(question.questionId) ?? question)
      .sort((left, right) => compare(left.questionId, right.questionId));
    const predecessorBytes = Buffer.from(JSON.stringify(predecessorQuestions), "utf8");
    if (sha256(predecessorBytes) !== source.beforeSourceSha256) fail("HASH_MISMATCH", `${label} does not reconstruct byte-exact ${accepted.beforeContentVersion} source ${source.sourceFile}.`);
  }
  const reconstructedTrackQuestions = currentTrackQuestions.map((question) => beforeByCurrentId.get(question.questionId) ?? question)
    .sort((left, right) => compare(left.questionId, right.questionId));
  if (sha256(reconstructedTrackQuestions) !== accepted.beforeQuestionSetSha256) fail("HASH_MISMATCH", `${label} does not reconstruct the immutable predecessor OOD question set.`);
  const predecessorCatalog = {
    ...canonical.catalog,
    tracks: canonical.catalog.tracks.map((track) => track.trackId === accepted.trackId ? { ...track, contentVersion: accepted.beforeContentVersion } : track)
  };
  const predecessorLocations = new Map(canonical.questionLocations);
  for (const item of replacements) {
    const descriptor = accepted.replacements.find((candidate) => candidate.questionId === item.questionId);
    predecessorLocations.delete(item.questionId);
    predecessorLocations.set(item.beforeQuestionId, {
      trackId: accepted.trackId,
      nodeId: item.oldQuestion.nodeId,
      mentalUnitId: item.oldQuestion.mentalUnitId,
      path: sourcesByPath.get(descriptor.sourceFile).sourcePath
    });
  }
  const predecessorCanonical = {
    ...canonical,
    catalog: predecessorCatalog,
    catalogByTrack: new Map(predecessorCatalog.tracks.map((track) => [track.trackId, track])),
    questionsByTrack: new Map(canonical.questionsByTrack).set(accepted.trackId, reconstructedTrackQuestions),
    questionLocations: predecessorLocations
  };
  const predecessor = await loadBizq01OodSemanticProof(contentRoot, predecessorCanonical, evidence, undefined, true, explanationHistoricalSourceBytes);
  if (!predecessor) fail("EVIDENCE_MEMBERSHIP", `${label} requires the unchanged fixed 19a predecessor proof chain.`);
  return {
    trackId: accepted.trackId,
    replacements: [...predecessor.replacements, ...replacements],
    sameIdCorrections: [...(predecessor.sameIdCorrections ?? []), ...sameIdCorrections],
    reasonAmendmentQuestionIds: predecessor.reasonAmendmentQuestionIds
  };
}

function assertOodExplanationOnlyChange(before, current, label) {
  if (!before || !current || before.questionId !== current.questionId) {
    fail("EVIDENCE_MEMBERSHIP", `${label} must preserve the exact question identity.`);
  }
  const beforeCopy = structuredClone(before);
  const currentCopy = structuredClone(current);
  const changed = [];
  if (before.feedback?.reason !== undefined || current.feedback?.reason !== undefined) {
    if (typeof before.feedback?.reason !== "string" || typeof current.feedback?.reason !== "string") {
      fail("EVIDENCE_SHAPE", `${label}.feedback.reason must remain a string.`);
    }
    if (before.feedback.reason !== current.feedback.reason) changed.push("feedback.reason");
    beforeCopy.feedback.reason = "<explanation>";
    currentCopy.feedback.reason = "<explanation>";
  }
  for (const key of ["mechanismOrProperty", "boundaryOrTradeoff", "errorCorrection"]) {
    if (before.feedback?.details?.[key] !== undefined || current.feedback?.details?.[key] !== undefined) {
      if (typeof before.feedback?.details?.[key] !== "string" || typeof current.feedback?.details?.[key] !== "string") {
        fail("EVIDENCE_SHAPE", `${label}.feedback.details.${key} must remain a string.`);
      }
      if (before.feedback.details[key] !== current.feedback.details[key]) changed.push(`feedback.details.${key}`);
      beforeCopy.feedback.details[key] = "<explanation>";
      currentCopy.feedback.details[key] = "<explanation>";
    }
  }
  const beforeMessages = before.feedback?.messages;
  const currentMessages = current.feedback?.messages;
  if (!Array.isArray(beforeMessages) || !Array.isArray(currentMessages) || beforeMessages.length !== currentMessages.length) {
    fail("EVIDENCE_MEMBERSHIP", `${label} must preserve feedback message membership.`);
  }
  for (let index = 0; index < beforeMessages.length; index += 1) {
    const left = beforeMessages[index];
    const right = currentMessages[index];
    if (left.kind !== right.kind || left.targetId !== right.targetId) {
      fail("EVIDENCE_MEMBERSHIP", `${label}.feedback.messages[${index}] must preserve its kind and target.`);
    }
    if (left.text !== right.text) changed.push(`feedback.messages[${index}].text`);
    beforeCopy.feedback.messages[index].text = "<explanation>";
    currentCopy.feedback.messages[index].text = "<explanation>";
  }
  if (canonicalJson(beforeCopy) !== canonicalJson(currentCopy) || changed.length === 0) {
    fail("EVIDENCE_MEMBERSHIP", `${label} changes fields outside the approved feedback explanation paths.`);
  }
  if (changed.some((key) => !OOD_EXPLANATION_CORRECTION_ALLOWED_PATHS.has(key.replace(/feedback\.messages\[\d+\]\.text/, "feedback.messages[].text")))) {
    fail("EVIDENCE_MEMBERSHIP", `${label} changes a feedback path outside the fixed explanation allowlist.`);
  }
}

async function validateOodExplanationCorrections(contentRoot, canonical, evidence) {
  const accepted = OOD_EXPLANATION_CORRECTIONS_20261013_PROOF;
  const label = accepted.scope;
  const projectRoot = path.dirname(contentRoot);
  const proofPath = path.join(projectRoot, accepted.path);
  const proofInfo = await lstat(proofPath).catch((error) => {
    if (error?.code === "ENOENT") return undefined;
    fail("PATH_ERROR", `Cannot inspect ${label}: ${error.message}`);
  });
  if (!proofInfo) return undefined;
  await rejectSymlinkAncestors(proofPath, label);
  await regularPath(proofPath, label, "file");
  const proofBytes = await readFile(proofPath).catch((error) => fail("READ_ERROR", `Cannot read ${label}: ${error.message}`));
  if (sha256(proofBytes) !== accepted.sha256) fail("HASH_MISMATCH", `${label} differs from its fixed proof bytes.`);
  let proof;
  try { proof = JSON.parse(proofBytes.toString("utf8")); }
  catch (error) { fail("INVALID_JSON", `${label} is not valid JSON: ${error.message}`); }
  exactKeys(proof, OOD_EXPLANATION_CORRECTION_ROOT_KEYS, label);
  for (const [key, value] of Object.entries({
    schemaVersion: accepted.schemaVersion,
    scope: accepted.scope,
    trackId: accepted.trackId,
    beforeContentVersion: accepted.beforeContentVersion,
    contentVersion: accepted.contentVersion,
    questionSetSha256: accepted.questionSetSha256
  })) {
    if (proof[key] !== value) fail("EVIDENCE_VALUE", `${label}.${key} differs from the fixed correction identity.`);
  }
  for (const key of ["beforeProducerCommit"]) {
    if (typeof proof[key] !== "string" || !/^[a-f0-9]{40}$/.test(proof[key])) fail("EVIDENCE_VALUE", `${label}.${key} must be a fixed Git commit identity.`);
  }
  for (const key of ["beforeQuestionSetSha256", "questionSetSha256"]) assertHash(proof[key], `${label}.${key}`);
  if (!Array.isArray(proof.items) || proof.items.length !== accepted.itemCount) {
    fail("EVIDENCE_MEMBERSHIP", `${label} must contain exactly ${accepted.itemCount} corrections.`);
  }
  const currentTrackQuestions = canonical.questionsByTrack.get(accepted.trackId);
  if (!currentTrackQuestions || trackQuestionSetSha256(currentTrackQuestions) !== proof.questionSetSha256) {
    fail("HASH_MISMATCH", `${label} current OOD question set differs from its immutable proof.`);
  }
  if (!Array.isArray(proof.sourceFiles) || proof.sourceFiles.length !== 4) {
    fail("EVIDENCE_MEMBERSHIP", `${label} must bind exactly four source files.`);
  }
  const sourcesByPath = new Map();
  for (const [index, source] of proof.sourceFiles.entries()) {
    const sourceLabel = `${label}.sourceFiles[${index}]`;
    exactKeys(source, OOD_EXPLANATION_CORRECTION_SOURCE_KEYS, sourceLabel);
    assertRelativePath(source.sourceFile, `${sourceLabel}.sourceFile`, { suffix: ".json" });
    assertHash(source.beforeSourceSha256, `${sourceLabel}.beforeSourceSha256`);
    assertHash(source.sourceSha256, `${sourceLabel}.sourceSha256`);
    if (sourcesByPath.has(source.sourceFile)) fail("EVIDENCE_MEMBERSHIP", `${label} repeats a source file.`);
    const sourcePath = path.resolve(projectRoot, ...source.sourceFile.split("/"));
    await rejectSymlinkAncestors(sourcePath, `${sourceLabel}.sourceFile`);
    await regularPath(sourcePath, `${sourceLabel}.sourceFile`, "file");
    const sourceBytes = await readFile(sourcePath).catch((error) => fail("READ_ERROR", `Cannot read ${sourceLabel}.sourceFile: ${error.message}`));
    if (sha256(sourceBytes) !== source.sourceSha256) fail("HASH_MISMATCH", `${sourceLabel}.sourceFile differs from the fixed current source hash.`);
    let questions;
    try { questions = JSON.parse(sourceBytes.toString("utf8")); }
    catch (error) { fail("INVALID_JSON", `${sourceLabel}.sourceFile is not valid JSON: ${error.message}`); }
    if (!Array.isArray(questions)) fail("EVIDENCE_SHAPE", `${sourceLabel}.sourceFile must contain a question array.`);
    const ids = proof.items.filter((item) => item.sourceFile === source.sourceFile).map((item) => item.questionId);
    if (ids.length === 0) fail("EVIDENCE_MEMBERSHIP", `${sourceLabel}.sourceFile has no fixed corrections.`);
    assertExactSet(questions.filter((question) => ids.includes(question?.questionId)).map((question) => question.questionId), ids, `${sourceLabel} corrected question IDs`);
    const sourceById = new Map(questions.map((question) => [question.questionId, question]));
    for (const question of questions) {
      const location = canonical.questionLocations.get(question.questionId);
      if (!location || path.relative(projectRoot, location.path).split(path.sep).join("/") !== source.sourceFile) {
        fail("CANONICAL_MEMBERSHIP", `${sourceLabel} question is outside its canonical source path.`);
      }
      const canonicalQuestion = currentTrackQuestions.find((item) => item.questionId === question.questionId);
      if (!canonicalQuestion || canonicalJson(question) !== canonicalJson(canonicalQuestion)) {
        fail("HASH_MISMATCH", `${sourceLabel} source question differs from canonical content.`);
      }
    }
    sourcesByPath.set(source.sourceFile, { questions, sourceById, sourceBytes, sourcePath, beforeSourceSha256: source.beforeSourceSha256 });
  }

  const beforeById = new Map();
  const currentById = new Map(currentTrackQuestions.map((question) => [question.questionId, question]));
  for (const [index, item] of proof.items.entries()) {
    const itemLabel = `${label}.items[${index}]`;
    exactKeys(item, OOD_EXPLANATION_CORRECTION_ITEM_KEYS, itemLabel);
    if (item.identityAction !== "preserve_question_id" || typeof item.identityReason !== "string" || item.identityReason.length === 0 ||
        item.questionId !== item.beforeQuestion?.questionId || item.questionId !== item.currentQuestion?.questionId || beforeById.has(item.questionId)) {
      fail("EVIDENCE_VALUE", `${itemLabel} must preserve a unique question ID and explain that identity decision.`);
    }
    const source = sourcesByPath.get(item.sourceFile);
    const current = source?.sourceById.get(item.questionId);
    const canonicalQuestion = currentById.get(item.questionId);
    if (!source || !current || !canonicalQuestion || canonicalJson(current) !== canonicalJson(item.currentQuestion) || canonicalJson(canonicalQuestion) !== canonicalJson(item.currentQuestion)) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} current object is not the canonical source object.`);
    }
    assertCanonicalQuestion(item.beforeQuestion, `${itemLabel}.beforeQuestion`, ACCEPTED_TRACK_IDS);
    assertCanonicalQuestion(item.currentQuestion, `${itemLabel}.currentQuestion`, ACCEPTED_TRACK_IDS);
    if (item.beforeQuestion.trackId !== accepted.trackId || item.beforeQuestion.nodeId !== item.currentQuestion.nodeId ||
        item.beforeQuestion.mentalUnitId !== item.currentQuestion.mentalUnitId) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} changes taxonomy or track identity.`);
    }
    assertOodExplanationOnlyChange(item.beforeQuestion, item.currentQuestion, itemLabel);
    beforeById.set(item.questionId, item.beforeQuestion);
  }
  if (beforeById.size !== accepted.itemCount) fail("EVIDENCE_MEMBERSHIP", `${label} must bind 39 unique current identities.`);

  const reconstructedTrackQuestions = currentTrackQuestions.map((question) => beforeById.get(question.questionId) ?? question)
    .sort((left, right) => compare(left.questionId, right.questionId));
  if (trackQuestionSetSha256(reconstructedTrackQuestions) !== proof.beforeQuestionSetSha256) {
    fail("HASH_MISMATCH", `${label} does not reconstruct the immutable predecessor OOD question set.`);
  }
  for (const [sourceFile, sourceData] of sourcesByPath) {
    const reconstructedQuestions = sourceData.questions.map((question) => beforeById.get(question.questionId) ?? question);
    const prettyBytes = Buffer.from(`${JSON.stringify(reconstructedQuestions, null, 2)}\n`, "utf8");
    const compactBytes = Buffer.from(JSON.stringify(reconstructedQuestions), "utf8");
    const sourceBytes = sourceData.sourceBytes.toString("utf8").endsWith("\n") ? prettyBytes : compactBytes;
    if (sha256(sourceBytes) !== sourceData.beforeSourceSha256) {
      fail("HASH_MISMATCH", `${label} does not reconstruct the immutable predecessor source ${sourceFile}.`);
    }
    sourceData.beforeSourceBytes = sourceBytes;
  }
  const predecessorCatalog = {
    ...canonical.catalog,
    tracks: canonical.catalog.tracks.map((track) => track.trackId === accepted.trackId
      ? { ...track, contentVersion: accepted.beforeContentVersion }
      : track)
  };
  const predecessorCanonical = {
    ...canonical,
    catalog: predecessorCatalog,
    catalogByTrack: new Map(predecessorCatalog.tracks.map((track) => [track.trackId, track])),
    questionsByTrack: new Map(canonical.questionsByTrack).set(accepted.trackId, reconstructedTrackQuestions)
  };
  const predecessorSourceBytes = new Map([...sourcesByPath].map(([sourceFile, sourceData]) => [sourceFile, sourceData.beforeSourceBytes]));
  const predecessor = await validateBizq01OodCohort24Proof(contentRoot, predecessorCanonical, evidence, predecessorSourceBytes);
  if (!predecessor) fail("EVIDENCE_MEMBERSHIP", `${label} requires the unchanged fixed OOD24 predecessor chain.`);
  return { ...predecessor, explanationCorrectionQuestionIds: proof.items.map((item) => item.questionId) };
}

async function loadBizq01OodSemanticProof(contentRoot, canonical, evidence, privateHistoricalSourceBytes, historicalPredecessor = false, explanationHistoricalSourceBytes) {
  const version = canonical.catalogByTrack.get(BIZQ01_OOD_PROOF.trackId)?.contentVersion;
  if (!historicalPredecessor) {
    const currentOodQuestions = canonical.questionsByTrack.get(OOD_EXPLANATION_CORRECTIONS_20261013_PROOF.trackId);
    if (version === OOD_EXPLANATION_CORRECTIONS_20261013_PROOF.contentVersion ||
        trackQuestionSetSha256(currentOodQuestions ?? []) === OOD_EXPLANATION_CORRECTIONS_20261013_PROOF.questionSetSha256) {
      const corrections = await validateOodExplanationCorrections(contentRoot, canonical, evidence);
      if (!corrections) fail("EVIDENCE_MEMBERSHIP", "The OOD explanation-correction version requires its fixed immutable proof.");
      return corrections;
    }
    const trackId = BIZQ01_OOD_COHORT24_PROOF.descriptor.trackId;
    const questions = canonical.questionsByTrack.get(trackId);
    if (questions.length !== EXPECTED_TRACK_COUNTS[trackId].questions ||
        trackQuestionSetSha256(questions) !== BIZQ01_OOD_COHORT24_PROOF.descriptor.questionSetSha256) {
      fail("HASH_MISMATCH", "Current OOD bank does not match the fixed latest accepted 1,413-question bank.");
    }
    const cohort = await validateBizq01OodCohort24Proof(contentRoot, canonical, evidence);
    if (!cohort) fail("EVIDENCE_MEMBERSHIP", "The latest accepted OOD bank requires its fixed source24 proof chain.");
    return cohort;
  }
  if (version === BIZQ01_OOD_COHORT24_PROOF.descriptor.contentVersion) {
    const cohort = await validateBizq01OodCohort24Proof(contentRoot, canonical, evidence, explanationHistoricalSourceBytes);
    if (!cohort) fail("EVIDENCE_MEMBERSHIP", "The source24 OOD version requires its fixed eighteen-unit N08/N09 proof.");
    return cohort;
  }
  if (version === BIZQ01_OOD_COHORT23_PROOF.descriptor.contentVersion) {
    const cohort = await validateBizq01OodCohort23Proof(contentRoot, canonical, evidence, explanationHistoricalSourceBytes);
    if (!cohort) fail("EVIDENCE_MEMBERSHIP", "The source23 OOD version requires its fixed eight-unit N07 proof.");
    return cohort;
  }
  if (version === BIZQ01_OOD_COHORT22_PROOF.descriptor.contentVersion) {
    const cohort = await validateBizq01OodCohort22Proof(contentRoot, canonical, evidence, explanationHistoricalSourceBytes);
    if (!cohort) fail("EVIDENCE_MEMBERSHIP", "The source22 OOD version requires its fixed ten-unit N06 proof.");
    return cohort;
  }
  if (version === BIZQ01_OOD_COHORT21_PROOF.descriptor.contentVersion) {
    const cohort = await validateBizq01OodCohort21Proof(contentRoot, canonical, evidence, explanationHistoricalSourceBytes);
    if (!cohort) fail("EVIDENCE_MEMBERSHIP", "The source21 OOD version requires its fixed nine-unit N05 proof.");
    return cohort;
  }
  if (version === BIZQ01_OOD_COHORT20_PROOF.descriptor.contentVersion) {
    const cohort = await validateBizq01OodCohort20Proof(contentRoot, canonical, evidence, explanationHistoricalSourceBytes);
    if (!cohort) fail("EVIDENCE_MEMBERSHIP", "The source20 OOD version requires its fixed nine-unit N04 proof.");
    return cohort;
  }
  if (version === BIZQ01_OOD_REASON_AMENDMENT_19A_PROOF.contentVersion) {
    const amendment = await validateBizq01OodReasonAmendment19a(contentRoot, canonical, evidence, explanationHistoricalSourceBytes);
    if (!amendment) fail("EVIDENCE_MEMBERSHIP", "The source19a OOD version requires its fixed 25-item Reason-only amendment proof.");
    return amendment;
  }
  if (version === BIZQ01_OOD_COHORT19_PROOF.contentVersion) {
    const cohort = await validateBizq01OodClosedCohortProof(contentRoot, canonical, evidence, BIZQ01_OOD_COHORT19_PROOF, undefined, undefined, explanationHistoricalSourceBytes);
    if (!cohort) fail("EVIDENCE_MEMBERSHIP", "The source19 OOD version requires its fixed 162-question closure proof.");
    return cohort;
  }
  if (version === BIZQ01_OOD_COHORT17_PROOF.contentVersion) {
    const cohort = await validateBizq01OodCohort17Proof(contentRoot, canonical, evidence, explanationHistoricalSourceBytes);
    if (!cohort) fail("EVIDENCE_MEMBERSHIP", "The source17 OOD version requires its fixed 152-question closure proof.");
    return cohort;
  }
  if (version === BIZQ01_OOD_COHORT16_PROOF.contentVersion) {
    const cohort = await validateBizq01OodCohort16Proof(contentRoot, canonical, evidence, explanationHistoricalSourceBytes);
    if (!cohort) fail("EVIDENCE_MEMBERSHIP", "The source16 OOD version requires its fixed 119-question closure proof.");
    return cohort;
  }
  if (version === BIZQ01_OOD_PROOF.contentVersion) {
    return validateBizq01OodSemanticProof(contentRoot, canonical, evidence, BIZQ01_OOD_PROOF, 5);
  }
  if (version === BIZQ01_OOD_COHORT13_PROOF.contentVersion) {
    const cohort = await validateBizq01OodCohort13Proof(contentRoot, canonical, evidence);
    if (!cohort) fail("EVIDENCE_MEMBERSHIP", "The source13 OOD version requires its fixed fifteen-question cohort proof.");
    const accepted = BIZQ01_OOD_COHORT13_PROOF;
    const currentTrackQuestions = canonical.questionsByTrack.get(accepted.trackId);
    const replacedIds = new Set(accepted.replacements.map((item) => item.questionId));
    const reconstructedUnitQuestions = currentTrackQuestions
      .filter((question) => question.mentalUnitId === accepted.mentalUnitId && !replacedIds.has(question.questionId))
      .concat(cohort.replacements.map((item) => item.oldQuestion))
      .sort((left, right) => compare(left.questionId, right.questionId));
    const reconstructedTrackQuestions = currentTrackQuestions
      .filter((question) => !replacedIds.has(question.questionId))
      .concat(cohort.replacements.map((item) => item.oldQuestion))
      .sort((left, right) => compare(left.questionId, right.questionId));
    const reconstructedSourceBytes = Buffer.from(`${JSON.stringify(reconstructedUnitQuestions)}\n`, "utf8");
    if (sha256(reconstructedSourceBytes) !== accepted.beforeSourceSha256) {
      fail("HASH_MISMATCH", "The source13 cohort does not reconstruct the exact accepted source12 predecessor bytes.");
    }
    const predecessorCatalog = {
      ...canonical.catalog,
      tracks: canonical.catalog.tracks.map((track) => track.trackId === accepted.trackId
        ? { ...track, contentVersion: accepted.beforeContentVersion }
        : track)
    };
    const predecessorLocations = new Map(canonical.questionLocations);
    for (const item of accepted.replacements) {
      predecessorLocations.delete(item.questionId);
      predecessorLocations.set(item.beforeQuestionId, {
        trackId: accepted.trackId,
        nodeId: accepted.nodeId,
        mentalUnitId: accepted.mentalUnitId,
        path: path.resolve(path.dirname(contentRoot), ...accepted.sourceFile.split("/"))
      });
    }
    const predecessorCanonical = {
      ...canonical,
      catalog: predecessorCatalog,
      catalogByTrack: new Map(predecessorCatalog.tracks.map((track) => [track.trackId, track])),
      questionsByTrack: new Map(canonical.questionsByTrack).set(accepted.trackId, reconstructedTrackQuestions),
      questionLocations: predecessorLocations
    };
    const predecessor = await loadBizq01OodSemanticProof(contentRoot, predecessorCanonical, evidence, reconstructedSourceBytes, true);
    if (!predecessor) fail("EVIDENCE_MEMBERSHIP", "The source13 cohort requires both immutable source12 and source11 proofs for predecessor verification.");
    return { trackId: accepted.trackId, replacements: [...predecessor.replacements, ...cohort.replacements] };
  }
  if (version !== BIZQ01_OOD_SUCCESSOR_PROOF.contentVersion) {
    const proofPaths = [BIZQ01_OOD_PROOF.path, BIZQ01_OOD_SUCCESSOR_PROOF.path, BIZQ01_OOD_COHORT13_PROOF.path, BIZQ01_OOD_COHORT16_PROOF.path, BIZQ01_OOD_COHORT17_PROOF.path, BIZQ01_OOD_COHORT19_PROOF.path, BIZQ01_OOD_REASON_AMENDMENT_19A_PROOF.path, BIZQ01_OOD_COHORT20_PROOF.path, BIZQ01_OOD_COHORT21_PROOF.path, BIZQ01_OOD_COHORT22_PROOF.path, BIZQ01_OOD_COHORT23_PROOF.path, BIZQ01_OOD_COHORT24_PROOF.path];
    for (const relativePath of proofPaths) {
      const info = await lstat(path.join(path.dirname(contentRoot), relativePath)).catch((error) => {
        if (error?.code === "ENOENT") return undefined;
        fail("PATH_ERROR", `Cannot inspect OOD semantic proof: ${error.message}`);
      });
      if (info) fail("EVIDENCE_VALUE", `OOD contentVersion ${version} has a fixed semantic proof for a different version.`);
    }
    return undefined;
  }

  const successor = await validateBizq01OodSemanticProof(contentRoot, canonical, evidence, BIZQ01_OOD_SUCCESSOR_PROOF, 4, privateHistoricalSourceBytes);
  if (!successor) fail("EVIDENCE_MEMBERSHIP", "The source12 OOD version requires its fixed successor proof.");
  const successorReplacement = successor.replacements[0];
  const acceptedCurrent = BIZQ01_OOD_SUCCESSOR_PROOF.replacement;
  const sourcePath = path.resolve(path.dirname(contentRoot), ...acceptedCurrent.sourceFile.split("/"));
  const currentSourceBytes = privateHistoricalSourceBytes ?? await readFile(sourcePath).catch((error) => fail("READ_ERROR", `Cannot read source12 predecessor input: ${error.message}`));
  let sourceQuestions;
  try {
    sourceQuestions = JSON.parse(currentSourceBytes.toString("utf8"));
  } catch (error) {
    fail("INVALID_JSON", `Cannot parse source12 predecessor input: ${error.message}`);
  }
  const reconstructedSourceQuestions = sourceQuestions
    .filter((question) => question.questionId !== acceptedCurrent.questionId)
    .concat(successorReplacement.oldQuestion)
    .sort((left, right) => compare(left.questionId, right.questionId));
  const reconstructedSourceBytes = Buffer.from(`${JSON.stringify(reconstructedSourceQuestions)}\n`, "utf8");
  if (sha256(reconstructedSourceBytes) !== BIZQ01_OOD_PROOF.replacement.sourceSha256 ||
      sha256(reconstructedSourceBytes) !== acceptedCurrent.beforeSourceSha256) {
    fail("HASH_MISMATCH", "The source12 proof does not reconstruct the exact accepted source11 predecessor bytes.");
  }

  const trackId = BIZQ01_OOD_PROOF.trackId;
  const currentTrackQuestions = canonical.questionsByTrack.get(trackId);
  const predecessorQuestions = currentTrackQuestions
    .filter((question) => question.questionId !== acceptedCurrent.questionId)
    .concat(successorReplacement.oldQuestion)
    .sort((left, right) => compare(left.questionId, right.questionId));
  const predecessorCatalog = {
    ...canonical.catalog,
    tracks: canonical.catalog.tracks.map((track) => track.trackId === trackId
      ? { ...track, contentVersion: BIZQ01_OOD_PROOF.contentVersion }
      : track)
  };
  const predecessorLocations = new Map(canonical.questionLocations);
  predecessorLocations.delete(acceptedCurrent.questionId);
  predecessorLocations.set(acceptedCurrent.beforeQuestionId, {
    trackId,
    nodeId: acceptedCurrent.nodeId,
    mentalUnitId: acceptedCurrent.mentalUnitId,
    path: sourcePath
  });
  const predecessorCanonical = {
    ...canonical,
    catalog: predecessorCatalog,
    catalogByTrack: new Map(predecessorCatalog.tracks.map((track) => [track.trackId, track])),
    questionsByTrack: new Map(canonical.questionsByTrack).set(trackId, predecessorQuestions),
    questionLocations: predecessorLocations
  };
  const predecessor = await validateBizq01OodSemanticProof(
    contentRoot,
    predecessorCanonical,
    evidence,
    BIZQ01_OOD_PROOF,
    5,
    reconstructedSourceBytes
  );
  if (!predecessor) fail("EVIDENCE_MEMBERSHIP", "The source12 successor requires the immutable source11 proof for predecessor verification.");
  return {
    trackId,
    replacements: [...predecessor.replacements, ...successor.replacements]
  };
}

async function loadFesdN08SemanticProof(contentRoot, canonical, evidence) {
  const accepted = FESD_N08_PROOF;
  const label = accepted.scope;
  const projectRoot = path.dirname(contentRoot);
  const proofPath = path.join(projectRoot, accepted.path);
  const proofInfo = await lstat(proofPath).catch((error) => {
    if (error?.code === "ENOENT") return undefined;
    fail("PATH_ERROR", `Cannot inspect ${label}: ${error.message}`);
  });
  const version = canonical.catalogByTrack.get(accepted.trackId)?.contentVersion;
  if (version !== accepted.contentVersion) {
    if (proofInfo) fail("EVIDENCE_VALUE", `${label} is bound to ${accepted.contentVersion}, not ${version}.`);
    return undefined;
  }
  if (!proofInfo) fail("EVIDENCE_MEMBERSHIP", `${label} requires its fixed migration proof.`);
  await rejectSymlinkAncestors(proofPath, label);
  await regularPath(proofPath, label, "file");
  const proofBytes = await readFile(proofPath).catch((error) => fail("READ_ERROR", `Cannot read ${label}: ${error.message}`));
  if (!HASH256.test(accepted.proofSha256) || sha256(proofBytes) !== accepted.proofSha256) {
    fail("HASH_MISMATCH", `${label} differs from its fixed proof bytes.`);
  }
  let proof;
  try { proof = JSON.parse(proofBytes.toString("utf8")); }
  catch (error) { fail("INVALID_JSON", `${label} is not valid JSON: ${error.message}`); }
  exactKeys(proof, ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "beforeQuestionSetSha256", "questionSetSha256", "sourceFiles", "replacements"], label);
  for (const key of ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion"]) {
    if (proof[key] !== accepted[key]) fail("EVIDENCE_VALUE", `${label}.${key} differs from the fixed cohort identity.`);
  }
  assertHash(proof.beforeProducerCommit, `${label}.beforeProducerCommit`, { kind: "sha1" });
  assertHash(proof.beforeQuestionSetSha256, `${label}.beforeQuestionSetSha256`);
  assertHash(proof.questionSetSha256, `${label}.questionSetSha256`);

  const currentTrackQuestions = canonical.questionsByTrack.get(accepted.trackId);
  if (trackQuestionSetSha256(currentTrackQuestions) !== proof.questionSetSha256) {
    fail("HASH_MISMATCH", `${label} current question set differs from its fixed proof.`);
  }
  if (!Array.isArray(proof.sourceFiles) || proof.sourceFiles.length !== accepted.sourceFiles.length) {
    fail("EVIDENCE_MEMBERSHIP", `${label} must identify exactly the ${accepted.sourceFiles.length} fixed source files.`);
  }
  if (!Array.isArray(proof.replacements) || proof.replacements.length !== accepted.replacementCount) {
    fail("EVIDENCE_MEMBERSHIP", `${label} must contain exactly ${accepted.replacementCount} replacements.`);
  }

  const sourceByPath = new Map();
  const currentById = new Map(currentTrackQuestions.map((question) => [question.questionId, question]));
  const oldRowsById = new Map(evidence.rowsByTrack.get(accepted.trackId).map((row) => [row.questionId, row]));
  const replacementIds = new Set();
  const retiredIds = new Set();
  const replacements = [];

  for (const [index, sourceFile] of accepted.sourceFiles.entries()) {
    const entry = proof.sourceFiles[index];
    const sourceLabel = `${label}.sourceFiles[${index}]`;
    exactKeys(entry, ["sourceFile", "beforeSourceSha256", "sourceSha256", "nodeId", "mentalUnitId"], sourceLabel);
    if (entry.sourceFile !== sourceFile) fail("EVIDENCE_VALUE", `${sourceLabel}.sourceFile differs from the fixed source path.`);
    assertHash(entry.beforeSourceSha256, `${sourceLabel}.beforeSourceSha256`);
    assertHash(entry.sourceSha256, `${sourceLabel}.sourceSha256`);
    assertText(entry.nodeId, `${sourceLabel}.nodeId`);
    assertText(entry.mentalUnitId, `${sourceLabel}.mentalUnitId`);
    assertRelativePath(entry.sourceFile, `${sourceLabel}.sourceFile`, { suffix: ".json" });
    const sourcePath = path.resolve(projectRoot, ...entry.sourceFile.split("/"));
    await rejectSymlinkAncestors(sourcePath, `${sourceLabel}.sourceFile`);
    await regularPath(sourcePath, `${sourceLabel}.sourceFile`, "file");
    const sourceBytes = await readFile(sourcePath).catch((error) => fail("READ_ERROR", `Cannot read ${sourceLabel}.sourceFile: ${error.message}`));
    if (sha256(sourceBytes) !== entry.sourceSha256) fail("HASH_MISMATCH", `${sourceLabel}.sourceFile differs from its fixed current hash.`);
    let questions;
    try { questions = JSON.parse(sourceBytes.toString("utf8")); }
    catch (error) { fail("INVALID_JSON", `${sourceLabel}.sourceFile is not valid JSON: ${error.message}`); }
    if (!Array.isArray(questions) || questions.length === 0) fail("EVIDENCE_MEMBERSHIP", `${sourceLabel}.sourceFile must be a non-empty question array.`);
    const location = [...canonical.questionLocations.values()].find((candidate) => path.relative(projectRoot, candidate.path).split(path.sep).join("/") === sourceFile);
    if (!location || location.trackId !== accepted.trackId || location.nodeId !== entry.nodeId || location.mentalUnitId !== entry.mentalUnitId) {
      fail("CANONICAL_MEMBERSHIP", `${sourceLabel} does not resolve to the fixed FESD mental unit.`);
    }
    sourceByPath.set(sourceFile, { entry, sourcePath, questions, questionById: new Map(questions.map((question) => [question?.questionId, question])) });
  }

  for (const [index, item] of proof.replacements.entries()) {
    const itemLabel = `${label}.replacements[${index}]`;
    exactKeys(item, ["sourceFile", "beforeSourceSha256", "sourceSha256", "beforeQuestionId", "questionId", "nodeId", "mentalUnitId", "beforeQuestion", "currentQuestion"], itemLabel);
    const source = sourceByPath.get(item.sourceFile);
    const oldQuestion = item.beforeQuestion;
    const currentQuestion = currentById.get(item.questionId);
    const oldRow = oldRowsById.get(item.beforeQuestionId);
    if (!source || item.beforeSourceSha256 !== source.entry.beforeSourceSha256 || item.sourceSha256 !== source.entry.sourceSha256 ||
        item.nodeId !== source.entry.nodeId || item.mentalUnitId !== source.entry.mentalUnitId ||
        !oldQuestion || !currentQuestion || !oldRow || currentById.has(item.beforeQuestionId)) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} must bind one removed historical question to one present replacement in its fixed unit.`);
    }
    if (retiredIds.has(item.beforeQuestionId) || replacementIds.has(item.questionId) || item.beforeQuestionId === item.questionId) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} duplicates or reuses a retired or current question identity.`);
    }
    retiredIds.add(item.beforeQuestionId);
    replacementIds.add(item.questionId);
    assertCanonicalQuestion(oldQuestion, `${itemLabel}.beforeQuestion`, ACCEPTED_TRACK_IDS);
    assertCanonicalQuestion(item.currentQuestion, `${itemLabel}.currentQuestion`, ACCEPTED_TRACK_IDS);
    if (oldQuestion.questionId !== item.beforeQuestionId || oldQuestion.trackId !== accepted.trackId ||
        currentQuestion.trackId !== accepted.trackId || item.currentQuestion.questionId !== item.questionId ||
        canonicalJson(item.currentQuestion) !== canonicalJson(currentQuestion) ||
        [oldQuestion.trackId, oldQuestion.nodeId, oldQuestion.mentalUnitId].join("|") !== [accepted.trackId, item.nodeId, item.mentalUnitId].join("|") ||
        [currentQuestion.nodeId, currentQuestion.mentalUnitId].join("|") !== [item.nodeId, item.mentalUnitId].join("|")) {
      fail("EVIDENCE_MEMBERSHIP", `${itemLabel} changes the fixed taxonomy or current canonical object.`);
    }
    for (const key of ["trackId", "nodeId", "mentalUnitId"]) {
      if (oldRow[key] !== oldQuestion[key]) fail("EVIDENCE_MEMBERSHIP", `${itemLabel} historical evidence ${key} differs from the retired question.`);
    }
    assertCanonicalHash(oldRow, oldQuestion, `${itemLabel}.beforeQuestion`);
    const sourceQuestion = source.questionById.get(item.questionId);
    const location = canonical.questionLocations.get(item.questionId);
    if (!sourceQuestion || canonicalJson(sourceQuestion) !== canonicalJson(currentQuestion) || !location ||
        path.relative(projectRoot, location.path).split(path.sep).join("/") !== item.sourceFile) {
      fail("CANONICAL_MEMBERSHIP", `${itemLabel} current question is not present exactly once in its fixed canonical source file.`);
    }
    const oldChildIds = questionChildIdentityFamilies(oldQuestion);
    const currentChildIds = questionChildIdentityFamilies(currentQuestion);
    for (const family of Object.keys(oldChildIds)) {
      const oldIds = oldChildIds[family];
      const currentIds = currentChildIds[family];
      if (oldIds.some((id) => currentIds.includes(id))) {
        fail("EVIDENCE_MEMBERSHIP", `${itemLabel} reuses a ${family} identity from the retired question.`);
      }
    }
    replacements.push({ oldQuestion, newQuestion: currentQuestion, beforeQuestionId: item.beforeQuestionId, questionId: item.questionId, sourceFile: item.sourceFile });
  }
  const presentIds = new Set(currentTrackQuestions.map((question) => question.questionId));
  if ([...retiredIds].some((id) => presentIds.has(id))) fail("EVIDENCE_MEMBERSHIP", `${label} retains a retired question identity in current FESD content.`);

  for (const [sourceFile, source] of sourceByPath) {
    const sourceReplacements = replacements.filter((item) => item.sourceFile === sourceFile);
    if (sourceReplacements.length === 0) fail("EVIDENCE_MEMBERSHIP", `${label} contains an unrepresented fixed source file.`);
    const expectedIds = sourceReplacements.map((item) => item.questionId);
    assertExactSet(source.questions.map((question) => question?.questionId), expectedIds, `${label} ${sourceFile} question IDs`);
    const predecessorQuestions = source.questions
      .filter((question) => !replacementIds.has(question.questionId))
      .concat(sourceReplacements.map((item) => item.oldQuestion))
      .sort((left, right) => compare(left.questionId, right.questionId));
    if (sha256(Buffer.from(JSON.stringify(predecessorQuestions), "utf8")) !== source.entry.beforeSourceSha256) {
      fail("HASH_MISMATCH", `${label} does not reconstruct the byte-exact predecessor source ${sourceFile}.`);
    }
  }
  const reconstructedTrackQuestions = currentTrackQuestions
    .filter((question) => !replacementIds.has(question.questionId))
    .concat(replacements.map((item) => item.oldQuestion))
    .sort((left, right) => compare(left.questionId, right.questionId));
  if (reconstructedTrackQuestions.length !== currentTrackQuestions.length || trackQuestionSetSha256(reconstructedTrackQuestions) !== proof.beforeQuestionSetSha256) {
    fail("HASH_MISMATCH", `${label} does not reconstruct the fixed predecessor FESD question set.`);
  }
  return { trackId: accepted.trackId, replacements };
}

async function loadBizq01WordingProof(contentRoot, canonical, evidence) {
  const accepted = BIZQ01_COPY_PROOF;
  const projectRoot = path.dirname(contentRoot);
  const proofPath = path.join(projectRoot, accepted.path);
  const info = await lstat(proofPath).catch((error) => {
    if (error?.code === "ENOENT") return undefined;
    fail("PATH_ERROR", `Cannot inspect BIZQ-01 wording proof: ${error.message}`);
  });
  if (!info) return undefined;
  await rejectSymlinkAncestors(proofPath, "BIZQ-01 wording proof");
  const proof = await readJson(proofPath, "BIZQ-01 wording proof");
  exactKeys(proof, BIZQ01_COPY_KEYS, "BIZQ-01 wording proof");
  for (const key of BIZQ01_COPY_KEYS.filter((key) => !["beforeQuestion", "wording", "sources"].includes(key))) {
    if (proof[key] !== accepted[key]) fail("EVIDENCE_VALUE", `BIZQ-01 wording proof.${key} differs from the accepted batch.`);
  }
  const questions = canonical.questionsByTrack.get(accepted.trackId);
  if (sha256([...questions].sort((left, right) => compare(left.questionId, right.questionId))) !== accepted.questionSetSha256) fail("HASH_MISMATCH", "Current Coding questions differ from the accepted wording batch.");
  const oldQuestion = proof.beforeQuestion;
  const newQuestion = questions.find((question) => question.questionId === accepted.questionId);
  const oldRow = evidence.rowsByTrack.get(accepted.trackId).find((row) => row.questionId === accepted.questionId);
  if (!newQuestion || !oldRow) fail("EVIDENCE_MEMBERSHIP", "BIZQ-01 wording correction requires the same current and historical question ID.");
  assertCanonicalQuestion(oldQuestion, "BIZQ-01 wording proof.beforeQuestion", ACCEPTED_TRACK_IDS);
  for (const key of ["trackId", "nodeId", "mentalUnitId", "questionId"]) {
    if (oldQuestion[key] !== accepted[key] || newQuestion[key] !== accepted[key] || oldRow[key] !== accepted[key]) fail("EVIDENCE_MEMBERSHIP", `BIZQ-01 wording correction changes ${key}.`);
  }
  assertCanonicalHash(oldRow, oldQuestion, "BIZQ-01 wording proof.beforeQuestion");
  exactKeys(proof.wording, ["prompt", "detailsParagraph1", "detailsParagraph3"], "BIZQ-01 wording proof.wording");
  if (Object.values(proof.wording).some((value) => typeof value !== "string" || !value.trim())) fail("EVIDENCE_VALUE", "BIZQ-01 wording texts must be nonempty strings.");
  if (newQuestion.prompt !== proof.wording.prompt || newQuestion.feedback.details?.blocks?.[1]?.text !== proof.wording.detailsParagraph1 || newQuestion.feedback.details?.blocks?.[3]?.text !== proof.wording.detailsParagraph3) fail("HASH_MISMATCH", "Current wording differs from the proven three texts.");
  const reconstructed = structuredClone(newQuestion);
  reconstructed.prompt = oldQuestion.prompt;
  reconstructed.feedback.details.blocks[1].text = oldQuestion.feedback.details.blocks[1].text;
  reconstructed.feedback.details.blocks[3].text = oldQuestion.feedback.details.blocks[3].text;
  if (canonicalJson(reconstructed) !== canonicalJson(oldQuestion)) fail("EVIDENCE_VALUE", "BIZQ-01 wording correction changes fields outside the three permitted texts.");
  const sourcePath = path.resolve(projectRoot, ...proof.sourceFile.split("/"));
  await rejectSymlinkAncestors(sourcePath, "BIZQ-01 wording source");
  await regularPath(sourcePath, "BIZQ-01 wording source", "file");
  const bytes = await readFile(sourcePath).catch((error) => fail("READ_ERROR", `Cannot read wording source: ${error.message}`));
  if (sha256(bytes) !== accepted.sourceSha256) fail("HASH_MISMATCH", "BIZQ-01 wording source file differs from the accepted hash.");
  let sourceQuestions;
  try { sourceQuestions = JSON.parse(bytes.toString("utf8")); } catch (error) { fail("INVALID_JSON", `BIZQ-01 wording source is invalid JSON: ${error.message}`); }
  if (!Array.isArray(sourceQuestions) || sourceQuestions.filter((question) => question?.questionId === accepted.questionId).length !== 1 || canonicalJson(sourceQuestions.find((question) => question.questionId === accepted.questionId)) !== canonicalJson(newQuestion)) fail("HASH_MISMATCH", "BIZQ-01 wording source does not contain the exact corrected item.");
  const location = canonical.questionLocations.get(accepted.questionId);
  if (!location || path.relative(projectRoot, location.path).split(path.sep).join("/") !== accepted.sourceFile) fail("CANONICAL_MEMBERSHIP", "BIZQ-01 wording item is not at its accepted source location.");
  if (canonicalJson(proof.sources) !== canonicalJson(["https://algs4.cs.princeton.edu/code/javadoc/edu/princeton/cs/algs4/BinarySearch.html", "https://algs4.cs.princeton.edu/code/javadoc/edu/princeton/cs/algs4/Merge.html"])) fail("EVIDENCE_VALUE", "BIZQ-01 wording sources differ from the two reviewed primary pages.");
  return { trackId: accepted.trackId, replacements: [{ oldQuestion, newQuestion, beforeQuestionId: accepted.questionId, questionId: accepted.questionId }] };
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

export async function reconstructApprovedAwsPredecessor({ rootDirectory, questions }) {
  if (typeof rootDirectory !== "string" || !Array.isArray(questions)) fail("INPUT", "AWS predecessor reconstruction requires a project root and current questions.");
  const accepted = AWS_SAA_TARGETED_CORRECTIONS;
  const proofPath = path.join(rootDirectory, accepted.path);
  await rejectSymlinkAncestors(proofPath, "AWS SAA targeted correction proof");
  const proofBytes = await readFile(proofPath).catch((error) => fail("READ_ERROR", `Cannot read AWS SAA targeted correction proof: ${error.message}`));
  if (sha256(proofBytes) !== accepted.sha256) fail("HASH_MISMATCH", "AWS SAA targeted correction proof differs from its fixed reviewed bytes.");
  let proof;
  try { proof = JSON.parse(proofBytes.toString("utf8")); }
  catch (error) { fail("INVALID_JSON", `AWS SAA targeted correction proof is invalid JSON: ${error.message}`); }
  exactKeys(proof, ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "beforeQuestionSetSha256", "sourceFiles", "items"], "AWS SAA targeted correction proof");
  for (const key of ["schemaVersion", "scope", "trackId", "beforeProducerCommit", "beforeContentVersion", "contentVersion", "beforeQuestionSetSha256"]) {
    const expected = key === "schemaVersion" ? "patternly-bizq-semantic-replacement-v1" : accepted[key];
    if (proof[key] !== expected) fail("EVIDENCE_VALUE", `AWS SAA targeted correction proof ${key} differs from the fixed transition.`);
  }
  if (proof.contentVersion !== accepted.contentVersion || questions.length !== 2604 || trackQuestionSetSha256(questions) !== accepted.questionSetSha256) {
    fail("HASH_MISMATCH", "Current AWS SAA questions do not match the fixed targeted-correction successor.");
  }
  if (!Array.isArray(proof.items) || proof.items.length !== accepted.questionIds.length) fail("EVIDENCE_MEMBERSHIP", "AWS SAA proof must contain exactly 28 reviewed items.");
  assertExactSet(proof.items.map((item) => item?.beforeQuestionId), accepted.questionIds, "AWS SAA predecessor question IDs");
  const currentById = new Map(questions.map((question) => [question.questionId, question]));
  const beforeIds = new Set();
  const currentIds = new Set();
  const replacements = [];
  const sameIdCorrections = [];
  const beforeByCurrentId = new Map();
  for (const [index, item] of proof.items.entries()) {
    const label = `AWS SAA proof.items[${index}]`;
    exactKeys(item, ["sourceFile", "beforeQuestionId", "questionId", "identityAction", "beforeQuestion", "currentQuestion"], label);
    assertRelativePath(item.sourceFile, `${label}.sourceFile`, { suffix: ".json" });
    assertCanonicalQuestion(item.beforeQuestion, `${label}.beforeQuestion`, ACCEPTED_TRACK_IDS);
    assertCanonicalQuestion(item.currentQuestion, `${label}.currentQuestion`, ACCEPTED_TRACK_IDS);
    const sameId = item.beforeQuestionId === item.questionId;
    if (item.identityAction !== (sameId ? "preserve_question_id" : "new_question_id") || item.beforeQuestion.questionId !== item.beforeQuestionId || item.currentQuestion.questionId !== item.questionId) {
      fail("EVIDENCE_VALUE", `${label} has an invalid question identity transition.`);
    }
    if (beforeIds.has(item.beforeQuestionId) || currentIds.has(item.questionId)) fail("EVIDENCE_MEMBERSHIP", `${label} duplicates a fixed question identity.`);
    beforeIds.add(item.beforeQuestionId);
    currentIds.add(item.questionId);
    const live = currentById.get(item.questionId);
    if (!live || canonicalJson(live) !== canonicalJson(item.currentQuestion)) fail("HASH_MISMATCH", `${label} current item differs from canonical content.`);
    if (item.beforeQuestion.trackId !== accepted.trackId || item.currentQuestion.trackId !== accepted.trackId || item.beforeQuestion.nodeId !== item.currentQuestion.nodeId || item.beforeQuestion.mentalUnitId !== item.currentQuestion.mentalUnitId) {
      fail("EVIDENCE_MEMBERSHIP", `${label} crosses an AWS node or mental-unit boundary.`);
    }
    beforeByCurrentId.set(item.questionId, item.beforeQuestion);
    if (sameId) sameIdCorrections.push({ questionId: item.questionId, oldQuestion: item.beforeQuestion, newQuestion: item.currentQuestion });
    else replacements.push({ beforeQuestionId: item.beforeQuestionId, questionId: item.questionId, oldQuestion: item.beforeQuestion, newQuestion: item.currentQuestion });
  }
  if (replacements.length !== 1 || sameIdCorrections.length !== 27) fail("EVIDENCE_MEMBERSHIP", "AWS SAA proof must contain 27 same-ID corrections and one successor identity.");
  if (!Array.isArray(proof.sourceFiles) || proof.sourceFiles.length !== 12) fail("EVIDENCE_MEMBERSHIP", "AWS SAA proof must bind exactly 12 canonical source files.");
  const sourcePaths = new Set();
  for (const [index, source] of proof.sourceFiles.entries()) {
    const label = `AWS SAA proof.sourceFiles[${index}]`;
    exactKeys(source, ["sourceFile", "beforeSourceSha256", "sourceSha256", "nodeId", "mentalUnitId"], label);
    assertRelativePath(source.sourceFile, `${label}.sourceFile`, { suffix: ".json" });
    assertHash(source.beforeSourceSha256, `${label}.beforeSourceSha256`);
    assertHash(source.sourceSha256, `${label}.sourceSha256`);
    if (!source.sourceFile.startsWith(`content/${accepted.trackId}/`) || sourcePaths.has(source.sourceFile)) fail("EVIDENCE_MEMBERSHIP", `${label} is outside the exact AWS track or duplicated.`);
    sourcePaths.add(source.sourceFile);
    const sourceItems = proof.items.filter((item) => item.sourceFile === source.sourceFile);
    if (sourceItems.length === 0 || sourceItems.some((item) => item.beforeQuestion.nodeId !== source.nodeId || item.beforeQuestion.mentalUnitId !== source.mentalUnitId)) fail("EVIDENCE_MEMBERSHIP", `${label} does not match its exact item membership.`);
    const sourcePath = path.resolve(rootDirectory, ...source.sourceFile.split("/"));
    await rejectSymlinkAncestors(sourcePath, `${label}.sourceFile`);
    await regularPath(sourcePath, `${label}.sourceFile`, "file");
    const currentBytes = await readFile(sourcePath).catch((error) => fail("READ_ERROR", `Cannot read ${label}.sourceFile: ${error.message}`));
    if (sha256(currentBytes) !== source.sourceSha256) fail("HASH_MISMATCH", `${label}.sourceFile differs from the fixed current canonical source.`);
    let sourceQuestions;
    try { sourceQuestions = JSON.parse(currentBytes.toString("utf8")); }
    catch (error) { fail("INVALID_JSON", `${label}.sourceFile is invalid JSON: ${error.message}`); }
    const beforeSourceById = new Map(sourceItems.map((item) => [item.questionId, item.beforeQuestion]));
    for (const item of sourceItems) {
      const live = sourceQuestions.find((question) => question.questionId === item.questionId);
      if (!live || canonicalJson(live) !== canonicalJson(item.currentQuestion)) fail("HASH_MISMATCH", `${label} current item differs from its canonical source file.`);
    }
    const beforeSource = sourceQuestions.map((question) => beforeSourceById.get(question.questionId) ?? question);
    if (sha256(Buffer.from(JSON.stringify(beforeSource), "utf8")) !== source.beforeSourceSha256) fail("HASH_MISMATCH", `${label} does not reconstruct the byte-exact predecessor source.`);
  }
  if (proof.items.some((item) => !sourcePaths.has(item.sourceFile))) fail("EVIDENCE_MEMBERSHIP", "AWS SAA item is not bound by one of the fixed source hashes.");
  const predecessorQuestions = questions.map((question) => beforeByCurrentId.get(question.questionId) ?? question).sort((left, right) => compare(left.questionId, right.questionId));
  if (trackQuestionSetSha256(predecessorQuestions) !== accepted.beforeQuestionSetSha256) fail("HASH_MISMATCH", "AWS SAA proof does not reconstruct the immutable pre-correction track.");
  return { trackId: accepted.trackId, predecessorQuestions, replacements, sameIdCorrections };
}

async function approvedAwsAdditions(contentRoot, canonical, evidence, awsSourceProof) {
  const trackId = "aws-certified-solutions-architect-associate";
  const baselineIds = new Set(evidence.rowsByTrack.get(trackId).map((row) => row.questionId));
  const questions = awsSourceProof.predecessorQuestions;
  const additions = questions.filter((question) => !baselineIds.has(question.questionId));
  if (additions.length === 0) return [];
  if (additions.length !== 36) fail("EVIDENCE_MEMBERSHIP", "Current AWS has an unapproved number of additions.");
  const approvalPath = path.join(path.dirname(contentRoot), "evidence/canonical-content-approvals/odk-096-aws-free-node-v1.json");
  const approval = await readJson(approvalPath, "ODK-096 canonical approval");
  if (approval.schemaVersion !== "patternly-canonical-content-approval-addendum-v1" ||
      approval.addendumId !== "odk-096-aws-free-node-v1" ||
      approval.approval?.status !== "approved_pending_sync" ||
      approval.canonicalIdentity?.trackId !== trackId ||
      approval.canonicalIdentity?.contentVersion !== "aws-certified-solutions-architect-associate-authoring-v2026.09.21-odk096") {
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

async function claudeHistoricalAndCurrentQuestions(contentRoot, canonical, evidence) {
  const { path: relativePath, ...expected } = CLAUDE_HISTORICAL_BASELINE;
  const baselinePath = path.join(path.dirname(contentRoot), relativePath);
  await rejectSymlinkAncestors(baselinePath, "Claude historical baseline");
  const baseline = await readJson(baselinePath, "Claude historical baseline");
  exactKeys(baseline, ["schemaVersion", "trackId", "contentVersion", "sourceRepositoryCommit", "questionCount", "questionSetSha256", "questions"], "Claude historical baseline");
  for (const key of ["schemaVersion", "trackId", "contentVersion", "sourceRepositoryCommit", "questionCount", "questionSetSha256"]) {
    if (baseline[key] !== expected[key]) fail("EVIDENCE_VALUE", `Claude historical baseline ${key} differs from the fixed predecessor identity.`);
  }
  if (!Array.isArray(baseline.questions) || baseline.questions.length !== expected.questionCount) fail("EVIDENCE_MEMBERSHIP", "Claude historical baseline must contain exactly the frozen 300 predecessor questions.");
  const historicalQuestions = [...baseline.questions].sort((left, right) => compare(left?.questionId, right?.questionId));
  for (const [index, question] of historicalQuestions.entries()) {
    assertCanonicalQuestion(question, `Claude historical baseline questions[${index}]`, ACCEPTED_TRACK_IDS);
    if (question.trackId !== expected.trackId) fail("EVIDENCE_MEMBERSHIP", `Claude historical baseline questions[${index}] belongs to another track.`);
  }
  if (new Set(historicalQuestions.map((question) => question.questionId)).size !== expected.questionCount ||
      sha256(historicalQuestions) !== expected.questionSetSha256) {
    fail("HASH_MISMATCH", "Claude historical baseline differs from its fixed 300-question predecessor hash.");
  }

  const rows = evidence.rowsByTrack.get(expected.trackId);
  assertExactSet(historicalQuestions.map((question) => question.questionId), rows.map((row) => row.questionId), "Claude historical question IDs");
  const historicalSummary = compareTrackMembership(expected.trackId, historicalQuestions, rows, evidence.manifestTracks.get(expected.trackId));

  const currentQuestions = canonical.questionsByTrack.get(expected.trackId);
  const currentIds = new Set(currentQuestions.map((question) => question.questionId));
  if (historicalQuestions.some((question) => !currentIds.has(question.questionId))) {
    fail("EVIDENCE_MEMBERSHIP", "Current Claude content is missing a question from its frozen historical baseline.");
  }

  const currentTrack = canonical.catalogByTrack.get(expected.trackId);
  const successor = await reconstructClaudeAcceptedSuccessor({
    contentRoot,
    questions: currentQuestions,
    contentVersion: currentTrack?.contentVersion
  });
  return { historicalQuestions, historicalSummary, successor };
}

async function readPinnedClaudeEvidence(projectRoot, relativePath, expectedSha256, label) {
  const target = path.join(projectRoot, relativePath);
  await rejectSymlinkAncestors(target, label);
  await regularPath(target, label, "file");
  const bytes = await readFile(target).catch((error) => fail("READ_ERROR", `Cannot read ${label}: ${error.message}`));
  if (sha256(bytes) !== expectedSha256) fail("HASH_MISMATCH", `${label} differs from its fixed reviewed bytes.`);
  try {
    return JSON.parse(bytes.toString("utf8"));
  } catch (error) {
    fail("INVALID_JSON", `${label} is invalid JSON: ${error.message}`);
  }
}

async function reconstructClaudeAcceptedSuccessor({ contentRoot, questions, contentVersion }) {
  const projectRoot = path.dirname(path.resolve(contentRoot));
  const accepted = CLAUDE_CC02_SUCCESSOR_EVIDENCE;
  const coverage = await readPinnedClaudeEvidence(projectRoot, accepted.coveragePath, accepted.coverageSha256, "CC-02 Claude coverage evidence");
  const beforeQuestions = await readPinnedClaudeEvidence(projectRoot, accepted.beforePath, accepted.beforeSha256, "CC-02 Claude before-question evidence");
  const courseBaseline = await readPinnedClaudeEvidence(projectRoot, accepted.courseBaselinePath, accepted.courseBaselineSha256, "CC-03 Claude question baseline");

  exactKeys(coverage, ["schemaVersion", "trackId", "createdAt", "sourceCourseMap", "contentVersionBefore", "contentVersionAfter", "purpose", "inventory", "unitPlan", "facets", "questionMappings", "changedExisting", "sourceEvidence", "scopeControls", "completionCounts", "mcpAudit", "limitations", "review", "verification"], "CC-02 Claude coverage evidence");
  for (const [key, value] of Object.entries({
    schemaVersion: accepted.schemaVersion,
    trackId: accepted.trackId,
    contentVersionBefore: accepted.contentVersionBefore,
    contentVersionAfter: accepted.contentVersionAfter
  })) {
    if (coverage[key] !== value) fail("EVIDENCE_VALUE", `CC-02 Claude coverage evidence.${key} differs from the fixed accepted transition.`);
  }
  exactKeys(coverage.inventory, ["beforeCanonicalQuestionCount", "addedCanonicalQuestionCount", "afterCanonicalQuestionCount", "changedExistingQuestionCount", "addedSupplementQuestionCount", "canonicalAddedIds", "supplementQuestionIds", "questionIdUniqueness"], "CC-02 Claude coverage evidence.inventory");
  assertExactObject({
    beforeCanonicalQuestionCount: coverage.inventory.beforeCanonicalQuestionCount,
    addedCanonicalQuestionCount: coverage.inventory.addedCanonicalQuestionCount,
    afterCanonicalQuestionCount: coverage.inventory.afterCanonicalQuestionCount,
    changedExistingQuestionCount: coverage.inventory.changedExistingQuestionCount,
    addedSupplementQuestionCount: coverage.inventory.addedSupplementQuestionCount
  }, {
    beforeCanonicalQuestionCount: accepted.beforeQuestionCount,
    addedCanonicalQuestionCount: accepted.addedQuestionCount,
    afterCanonicalQuestionCount: CLAUDE_SUCCESSOR_BANK.questionCount,
    changedExistingQuestionCount: accepted.changedQuestionCount,
    addedSupplementQuestionCount: accepted.supplementalQuestionCount
  }, "CC-02 Claude coverage inventory");
  assertUniqueValues(coverage.inventory.canonicalAddedIds, "CC-02 Claude canonicalAddedIds");
  assertUniqueValues(coverage.inventory.supplementQuestionIds, "CC-02 Claude supplementQuestionIds");
  if (!Array.isArray(coverage.changedExisting) || coverage.changedExisting.length !== accepted.changedQuestionCount) {
    fail("EVIDENCE_MEMBERSHIP", `CC-02 Claude coverage evidence must list exactly ${accepted.changedQuestionCount} changed existing questions.`);
  }
  exactKeys(coverage.review, ["status", "scope", "reviewers", "answerTextMatches", "wholeHistoricalBankSemanticallyReviewed", "method", "mappingCorrections"], "CC-02 Claude review evidence");
  if (coverage.review.status !== "PASS" || coverage.review.answerTextMatches !== accepted.reviewAnswerTextMatches || coverage.review.wholeHistoricalBankSemanticallyReviewed !== false) {
    fail("EVIDENCE_VALUE", "CC-02 Claude review evidence does not match the accepted bounded review scope.");
  }

  exactKeys(courseBaseline, ["questionCount", "withoutCourseSha256", "scope"], "CC-03 Claude question baseline");
  if (courseBaseline.questionCount !== CLAUDE_SUCCESSOR_BANK.questionCount ||
      courseBaseline.withoutCourseSha256 !== CLAUDE_SUCCESSOR_BANK.withoutCourseSha256 ||
      courseBaseline.scope !== "CC-02 accepted question records before adding feedback.course; CC-03 must preserve all other fields.") {
    fail("EVIDENCE_VALUE", "CC-03 Claude baseline does not bind the accepted question records before course metadata.");
  }
  if (contentVersion !== CLAUDE_SUCCESSOR_BANK.contentVersion) fail("EVIDENCE_VALUE", "Current Claude contentVersion differs from the accepted CC-02/CC-03/CC-04 successor.");
  if (questions.length !== CLAUDE_SUCCESSOR_BANK.questionCount) fail("EVIDENCE_VALUE", "Current Claude question count differs from the accepted 918-question successor.");

  const currentById = new Map();
  const withoutCourse = questions.map((question, index) => {
    if (!isRecord(question.feedback) || !Object.hasOwn(question.feedback, "course")) {
      fail("EVIDENCE_MEMBERSHIP", `Current Claude question ${question.questionId ?? index} is missing CC-03 feedback.course metadata.`);
    }
    currentById.set(question.questionId, question);
    const copy = structuredClone(question);
    delete copy.feedback.course;
    return copy;
  });
  const sortedWithoutCourse = withoutCourse.sort((left, right) => compare(left.questionId, right.questionId));
  if (sha256(sortedWithoutCourse) !== CLAUDE_SUCCESSOR_BANK.withoutCourseSha256) {
    fail("HASH_MISMATCH", "Claude question content differs from the CC-03 baseline after removing only feedback.course.");
  }
  if (sha256([...questions].sort((left, right) => compare(left.questionId, right.questionId))) !== CLAUDE_SUCCESSOR_BANK.questionSetSha256) {
    fail("HASH_MISMATCH", "Current Claude questions differ from the fixed accepted 918-question successor.");
  }

  const addedIds = coverage.inventory.canonicalAddedIds;
  if (addedIds.some((questionId) => !currentById.has(questionId))) fail("EVIDENCE_MEMBERSHIP", "CC-02 Claude added-question IDs are missing from current canonical content.");
  const changedById = new Map();
  for (const [index, change] of coverage.changedExisting.entries()) {
    const label = `CC-02 Claude changedExisting[${index}]`;
    exactKeys(change, ["questionId", "fieldsChanged", "before", "after"], label);
    if (changedById.has(change.questionId)) fail("EVIDENCE_MEMBERSHIP", `${label} duplicates a question ID.`);
    if (!Array.isArray(change.fieldsChanged) || change.fieldsChanged.some((field) => typeof field !== "string")) fail("EVIDENCE_SHAPE", `${label}.fieldsChanged must be a string array.`);
    assertCanonicalQuestion(change.before, `${label}.before`, ACCEPTED_TRACK_IDS);
    assertCanonicalQuestion(change.after, `${label}.after`, ACCEPTED_TRACK_IDS);
    if (change.before.questionId !== change.questionId || change.after.questionId !== change.questionId) fail("EVIDENCE_MEMBERSHIP", `${label} changes question identity.`);
    const liveAfter = withoutCourse.find((question) => question.questionId === change.questionId);
    if (!liveAfter || canonicalJson(liveAfter) !== canonicalJson(change.after)) fail("HASH_MISMATCH", `${label}.after differs from current canonical content after removing course metadata.`);
    const changedFields = [...new Set([...Object.keys(change.before), ...Object.keys(change.after)])]
      .filter((key) => canonicalJson(change.before[key]) !== canonicalJson(change.after[key]));
    assertExactSet(change.fieldsChanged, changedFields, `${label}.fieldsChanged`);
    changedById.set(change.questionId, change);
  }
  assertExactSet(Object.keys(beforeQuestions), [...changedById.keys()], "CC-02 Claude historical-before question IDs");
  for (const [questionId, change] of changedById) {
    const before = beforeQuestions[questionId];
    assertCanonicalQuestion(before, `CC-02 Claude historical-before.${questionId}`, ACCEPTED_TRACK_IDS);
    if (canonicalJson(before) !== canonicalJson(change.before)) fail("HASH_MISMATCH", `CC-02 historical-before record ${questionId} differs from the reviewed coverage record.`);
  }

  const reconstructedById = new Map(sortedWithoutCourse
    .filter((question) => !addedIds.includes(question.questionId))
    .map((question) => [question.questionId, question]));
  for (const [questionId, change] of changedById) reconstructedById.set(questionId, beforeQuestions[questionId]);
  const reconstructed = [...reconstructedById.values()].sort((left, right) => compare(left.questionId, right.questionId));
  if (reconstructed.length !== CLAUDE_CURRENT_BANK.questionCount || sha256(reconstructed) !== CLAUDE_CURRENT_BANK.questionSetSha256) {
    fail("HASH_MISMATCH", "CC-02/CC-03 Claude successor does not reconstruct the exact accepted 845-question predecessor plus its reviewed P2 amendment.");
  }
  const reconstructedBeforeP2 = structuredClone(reconstructed);
  const p2Question = reconstructedBeforeP2.find((question) => question.questionId === "CCARP-D02-O04-expansion-14");
  if (!p2Question) fail("EVIDENCE_MEMBERSHIP", "Reconstructed Claude predecessor is missing the accepted P2 copy-amendment question.");
  p2Question.interaction.options.find((option) => option.optionId === "a").text = "Preserve the reserve, reduce required input, then recount with the target model.";
  p2Question.feedback.reason = "The input allowance is 18,000 tokens after reserve, while the target-model measurement is 19,300. The team must preserve the reserve and reduce or restructure context, then count again.";
  p2Question.feedback.details.boundaryOrTradeoff = "Compression is valid only if it preserves required facts; if mandatory content cannot fit, use a supported split or another capacity plan.";
  if (sha256(reconstructedBeforeP2) !== "717b995fd9f9bda5d25161c516a248eb80b3a78cf23c69d1641c2ed95add8b9a") {
    fail("HASH_MISMATCH", "Reversing the reviewed Claude P2 copy amendment differs from its fixed pre-P2 845-question hash.");
  }

  return {
    predecessorQuestionCount: reconstructed.length,
    predecessorQuestionSetSha256: sha256(reconstructed),
    addedQuestionCount: addedIds.length,
    changedExistingQuestionCount: changedById.size,
    courseMetadataOnlySha256: CLAUDE_SUCCESSOR_BANK.withoutCourseSha256
  };
}

export async function verifyMigration(options = {}) {
  const contentRoot = typeof options === "string" ? options : options?.contentRoot;
  if (typeof contentRoot !== "string" || contentRoot.length === 0) fail("INPUT", "contentRoot is required.");
  const resolvedContentRoot = await secureRoot(contentRoot);
  const canonical = await loadCanonicalContent(resolvedContentRoot);
  const bizq05HistoricalQuestions = await validateBizq05GcpQuestionRelationAmendment(resolvedContentRoot, canonical);
  const awsTrackId = AWS_SAA_TARGETED_CORRECTIONS.trackId;
  const awsTrack = canonical.catalogByTrack.get(awsTrackId);
  const hasFixedAwsVersion = awsTrack?.contentVersion === AWS_SAA_TARGETED_CORRECTIONS.contentVersion || awsTrack?.contentVersion?.startsWith(`${AWS_SAA_TARGETED_CORRECTIONS.contentVersion}-`);
  const awsSourceProof = hasFixedAwsVersion
    ? await reconstructApprovedAwsPredecessor({ rootDirectory: path.dirname(resolvedContentRoot), questions: canonical.questionsByTrack.get(awsTrackId) })
    : undefined;
  if (!awsSourceProof) fail("EVIDENCE_VALUE", "AWS SAA current contentVersion has no matching fixed source-correction proof.");
  validateCurrentProducerBanks(canonical);
  const evidence = await loadEvidence(resolvedContentRoot);
  const replacementProof = await loadBizq01ReplacementProof(resolvedContentRoot, canonical, evidence);
  const oodSemanticProof = await loadBizq01OodSemanticProof(resolvedContentRoot, canonical, evidence);
  const fesdSemanticProof = await loadFesdN08SemanticProof(resolvedContentRoot, canonical, evidence);
  const correctionProof = await loadBizq01WordingProof(resolvedContentRoot, canonical, evidence);
  const approvedAdditions = await approvedAwsAdditions(resolvedContentRoot, canonical, evidence, awsSourceProof);
  const claudeTrackId = "claude-certified-architect-professional-certification";
  const claudeCurrentProof = await claudeHistoricalAndCurrentQuestions(resolvedContentRoot, canonical, evidence);
  const trackSummaries = [];
  const historicalQuestionsByTrack = new Map();
  for (const trackId of ACCEPTED_TRACK_IDS) {
    const rows = evidence.rowsByTrack.get(trackId);
    const questions = canonical.questionsByTrack.get(trackId);
    const extras = trackId === "aws-certified-solutions-architect-associate" ? approvedAdditions : [];
    const replacements = [replacementProof, oodSemanticProof, correctionProof, fesdSemanticProof, awsSourceProof].filter((proof) => proof?.trackId === trackId).flatMap((proof) => proof.replacements);
    const sameIdCorrections = [oodSemanticProof, awsSourceProof].filter((proof) => proof?.trackId === trackId).flatMap((proof) => proof.sameIdCorrections ?? []);
    const sameIdCorrectionById = new Map(sameIdCorrections.map((correction) => [correction.questionId, correction]));
    const replacedHistoricalIds = new Set(replacements.map((replacement) => replacement.beforeQuestionId));
    if (trackId !== claudeTrackId || !claudeCurrentProof) {
      const currentIds = [...rows.map((row) => row.questionId).filter((questionId) => !replacedHistoricalIds.has(questionId)), ...extras, ...replacements.map((replacement) => replacement.questionId)];
      assertExactSet(questions.map((question) => question.questionId), currentIds, `${trackId} current question IDs`);
    }
    const replacedCurrentIds = new Set(replacements.map((replacement) => replacement.questionId));
    const reconstructedQuestions = [
      ...questions.filter((question) => !replacedCurrentIds.has(question.questionId)),
      ...replacements.map((replacement) => replacement.oldQuestion)
    ].map((question) => sameIdCorrectionById.get(question.questionId)?.oldQuestion ?? bizq05HistoricalQuestions.get(question.questionId) ?? question);
    const historicalTrackQuestions = trackId === claudeTrackId && claudeCurrentProof
      ? claudeCurrentProof.historicalQuestions
      : reconstructedQuestions;
    const summary = trackId === claudeTrackId && claudeCurrentProof
      ? claudeCurrentProof.historicalSummary
      : compareTrackMembership(trackId, historicalTrackQuestions, rows, evidence.manifestTracks.get(trackId));
    const questionById = new Map(historicalTrackQuestions.map((question) => [question.questionId, question]));
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
    approvedAdditionCount: approvedAdditions.length,
    semanticReplacementProof: oodSemanticProof ? {
      trackId: oodSemanticProof.trackId,
      replacements: oodSemanticProof.replacements.map(({ beforeQuestionId, questionId }) => ({ beforeQuestionId, questionId }))
    } : undefined,
    reasonAmendmentProof: oodSemanticProof?.reasonAmendmentQuestionIds ? {
      trackId: oodSemanticProof.trackId,
      questionIds: oodSemanticProof.reasonAmendmentQuestionIds
    } : undefined,
    sameIdCorrectionProof: oodSemanticProof?.sameIdCorrections?.length ? {
      trackId: oodSemanticProof.trackId,
      questionIds: oodSemanticProof.sameIdCorrections.map(({ questionId }) => questionId)
    } : undefined,
    explanationCorrectionProof: oodSemanticProof?.explanationCorrectionQuestionIds ? {
      trackId: oodSemanticProof.trackId,
      questionIds: oodSemanticProof.explanationCorrectionQuestionIds
    } : undefined,
    wordingCorrectionProof: correctionProof ? { trackId: correctionProof.trackId, questionIds: correctionProof.replacements.map(({ questionId }) => questionId) } : undefined,
    replacementProof: replacementProof ? {
      trackId: replacementProof.trackId,
      replacements: replacementProof.replacements.map(({ beforeQuestionId, questionId }) => ({ beforeQuestionId, questionId }))
    } : undefined
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
