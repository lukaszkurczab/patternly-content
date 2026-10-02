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
  validatePackageCompletionRule,
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

const GCP_TRACK_ID = "google-cloud-associate-cloud-engineer";
const SIMULATION_PROFILE_SCHEMA_VERSION = "patternly-simulation-profile-envelope-v1";
const GCP_EXAM_PROFILE_ID = "google-cloud-associate-cloud-engineer-certification-exam-v1";
const GCP_SOURCE_PROFILE_ID = "google-cloud-associate-cloud-engineer-patternly-practice-v1";
const GCP_DOMAIN_IDS = Object.freeze([
  "gcp-ace-standard-domain-1",
  "gcp-ace-standard-domain-2",
  "gcp-ace-standard-domain-3",
  "gcp-ace-standard-domain-4"
]);
const CODING_TRACK_ID = "coding-interview-dsa-problem-solving";
const CODING_PROFILE_ID = "algorithms-interview-simulation-v1";
const DESIGN_TRACK_IDS = Object.freeze([
  "backend-system-design-interview",
  "frontend-system-design-interview",
  "object-oriented-design-interview"
]);
const DESIGN_SIMULATION_MODE_ID = "design-interview-simulation";
const DESIGN_SIMULATION_STAGE_IDS = Object.freeze(["requirements", "architecture", "tradeoffs", "final_answer"]);
const DESIGN_SIMULATION_RUBRIC_DIMENSION_IDS = Object.freeze([
  "requirements_clarity", "architecture_coherence", "tradeoff_reasoning", "communication_completeness"
]);
const CODING_SIMULATION_POLICY_KEYS = Object.freeze([
  "requireUniqueItemIds", "requireDeclaredSimulationEligibility", "requireMultipleMentalUnits",
  "requireMultiplePatternFamilies", "requireEveryActiveInteractionTypeRepresented",
  "prohibitConsecutiveSameMentalUnitWhenAlternativeExists", "prohibitDuplicateContentIdentity",
  "prohibitTaxonomyWidening", "prohibitFallbackItems"
]);

function exactKeys(value, expected, label) {
  if (!isRecord(value) || canonicalJson(Object.keys(value).sort()) !== canonicalJson([...expected].sort())) {
    fail(`${label} has an invalid shape`);
  }
}

async function loadGcpSimulationProfileData({ rootDirectory, track, questions }) {
  const trackConfigPath = path.join(rootDirectory, "config", "tracks", `${GCP_TRACK_ID}.json`);
  let info;
  try { info = await lstat(trackConfigPath); }
  catch (error) { if (error?.code === "ENOENT") return undefined; fail(`Cannot inspect simulation profile config ${trackConfigPath}: ${error.message}`); }
  if (!info.isFile() || info.isSymbolicLink()) fail(`Simulation profile config must be a regular file: ${trackConfigPath}`);

  const config = await readJson(trackConfigPath);
  exactKeys(config, ["schemaVersion", "trackId", "familyId", "taxonomyVersion", "taxonomyPath", "freeNodeExperienceProfilePath", "modeConfiguration", "profile"], "GCP track config");
  if (config.schemaVersion !== "track-config-v1" || config.trackId !== GCP_TRACK_ID || config.familyId !== "certification" || config.taxonomyVersion !== "2026.08.11") fail("GCP track config identity or version is invalid");
  if (!isRecord(config.profile)) fail("GCP simulation profile must be an object when present");

  const taxonomyPath = path.resolve(rootDirectory, config.taxonomyPath);
  if (!isWithin(rootDirectory, taxonomyPath)) fail("GCP taxonomy path escapes the producer root");
  const taxonomy = await readJson(taxonomyPath);
  exactKeys(taxonomy, ["schemaVersion", "trackId", "taxonomyVersion", "axes", "cloudDomains", "nodeIds", "tags"], "GCP taxonomy config");
  if (taxonomy.schemaVersion !== "taxonomy-config-v1" || taxonomy.trackId !== GCP_TRACK_ID || taxonomy.taxonomyVersion !== config.taxonomyVersion) fail("GCP taxonomy identity or version is invalid");
  if (!Array.isArray(taxonomy.cloudDomains) || canonicalJson(taxonomy.cloudDomains) !== canonicalJson(GCP_DOMAIN_IDS)) fail("GCP taxonomy cloud domains are invalid");

  const profile = config.profile;
  exactKeys(profile, ["schemaVersion", "profileId", "profileVersion", "source", "durationMinutes", "questionCount", "blueprint", "interactionPolicy", "nodeDomainMap", "nodeDomainMapEvidence"], "GCP simulation profile");
  if (profile.schemaVersion !== "exam-experience-profile-v2" || profile.profileId !== GCP_SOURCE_PROFILE_ID || profile.profileVersion !== "1") fail("GCP simulation profile identity is invalid");
  exactKeys(profile.source, ["url", "checkedDate", "guideVersion"], "GCP simulation profile source");
  if (typeof profile.source.url !== "string" || typeof profile.source.checkedDate !== "string" || typeof profile.source.guideVersion !== "string") fail("GCP simulation profile source is invalid");
  if (profile.durationMinutes !== 120) fail("GCP simulation profile duration must be 120 minutes");
  exactKeys(profile.questionCount, ["kind", "minimum", "maximum"], "GCP simulation profile questionCount");
  if (profile.questionCount.kind !== "range" || profile.questionCount.minimum !== 50 || profile.questionCount.maximum !== 60) fail("GCP simulation profile question range must be 50–60");

  exactKeys(profile.blueprint, ["kind", "sections"], "GCP simulation profile blueprint");
  if (profile.blueprint.kind !== "weighted_sections" || !Array.isArray(profile.blueprint.sections) || profile.blueprint.sections.length !== 4) fail("GCP simulation profile blueprint must contain four weighted sections");
  const sectionWeights = new Map();
  for (const [index, section] of profile.blueprint.sections.entries()) {
    exactKeys(section, ["id", "contentDomainId", "weightPercent"], `GCP simulation profile blueprint section ${index}`);
    if (typeof section.id !== "string" || typeof section.contentDomainId !== "string" || !Number.isInteger(section.weightPercent)) fail(`GCP simulation profile blueprint section ${index} is invalid`);
    if (sectionWeights.has(section.contentDomainId)) fail(`GCP simulation profile has duplicate domain ${section.contentDomainId}`);
    sectionWeights.set(section.contentDomainId, section.weightPercent);
  }
  const expectedWeights = new Map([[GCP_DOMAIN_IDS[0], 20], [GCP_DOMAIN_IDS[1], 30], [GCP_DOMAIN_IDS[2], 30], [GCP_DOMAIN_IDS[3], 20]]);
  if (canonicalJson([...sectionWeights].sort()) !== canonicalJson([...expectedWeights].sort())) fail("GCP simulation profile domain weights must be 20/30/30/20");

  const policy = profile.interactionPolicy;
  exactKeys(policy, ["schemaVersion", "policyId", "policyVersion", "owner", "navigation", "answerChanges", "flagging", "navigator", "sections", "timeout", "feedbackTiming"], "GCP simulation interaction policy");
  if (policy.schemaVersion !== "patternly-certification-simulation-policy-v1" || policy.policyVersion !== "1" || policy.owner !== "patternly_product" || policy.navigation !== "free" || policy.answerChanges !== "until_final_submission" || policy.flagging !== "available" || policy.navigator !== "available" || policy.sections !== "blueprint_visible" || policy.timeout !== "absolute_deadline" || policy.feedbackTiming !== "after_verified_finalization") fail("GCP simulation interaction policy v1 is invalid");

  const nodeIds = [...new Set(questions.map((question) => question.nodeId))].sort(compareStrings);
  if (!Array.isArray(taxonomy.nodeIds) || canonicalJson([...taxonomy.nodeIds].sort(compareStrings)) !== canonicalJson(nodeIds)) fail("GCP taxonomy nodes do not exactly match canonical question nodes");
  exactKeys(profile.nodeDomainMap, nodeIds, "GCP simulation profile nodeDomainMap");
  for (const [nodeId, domainId] of Object.entries(profile.nodeDomainMap)) if (!GCP_DOMAIN_IDS.includes(domainId)) fail(`GCP nodeDomainMap contains unknown domain for ${nodeId}`);
  exactKeys(profile.nodeDomainMapEvidence, ["artifactPath", "contentVersion", "itemCount", "nodeCount", "ambiguousNodeCount"], "GCP nodeDomainMap evidence");
  if (profile.nodeDomainMapEvidence.artifactPath !== `artifacts/tracks/${GCP_TRACK_ID}/${track.contentVersion}/track-artifact.json` || profile.nodeDomainMapEvidence.contentVersion !== track.contentVersion || profile.nodeDomainMapEvidence.itemCount !== 2981 || profile.nodeDomainMapEvidence.nodeCount !== nodeIds.length || profile.nodeDomainMapEvidence.ambiguousNodeCount !== 0) fail("GCP nodeDomainMap evidence does not match the current published artifact identity");

  const publishedPath = path.resolve(rootDirectory, profile.nodeDomainMapEvidence.artifactPath);
  await assertSecurePath(rootDirectory, publishedPath, "GCP published attribution artifact");
  const wrapper = await readJson(publishedPath);
  exactKeys(wrapper, ["artifactBytes", "checksumSha256", "contentVersion", "declaredModes", "familyId", "schemaVersion", "sourceRepositoryCommit", "taxonomyVersion", "trackId"], "GCP published artifact wrapper");
  if (wrapper.trackId !== GCP_TRACK_ID || wrapper.contentVersion !== track.contentVersion || wrapper.familyId !== "certification" || typeof wrapper.artifactBytes !== "string" || wrapper.checksumSha256 !== sha256(wrapper.artifactBytes)) fail("GCP published artifact checksum or identity is invalid");
  const published = jsonText(wrapper.artifactBytes, publishedPath);
  if (!isRecord(published) || published.contentVersion !== track.contentVersion || !isRecord(published.bank) || published.bank.trackId !== GCP_TRACK_ID || published.bank.contentVersion !== track.contentVersion || !Array.isArray(published.bank.items)) fail("GCP published artifact content identity or item inventory is invalid");
  if (published.bank.items.length !== profile.nodeDomainMapEvidence.itemCount) fail("GCP published artifact item count does not match profile evidence");

  const canonicalById = new Map(questions.map((question) => [question.questionId, question]));
  const questionDomains = Object.create(null);
  const domainsByNode = new Map();
  const publishedIds = new Set();
  for (const item of published.bank.items) {
    if (!isRecord(item) || !nonEmptyString(item.id) || !nonEmptyString(item.nodeId) || !GCP_DOMAIN_IDS.includes(item.domain) || publishedIds.has(item.id)) fail("GCP published artifact contains malformed or duplicate item attribution");
    publishedIds.add(item.id);
    const question = canonicalById.get(item.id);
    if (!question || question.nodeId !== item.nodeId) fail(`GCP published attribution does not exactly match canonical question ${item.id}`);
    questionDomains[item.id] = item.domain;
    const domains = domainsByNode.get(item.nodeId) ?? new Set();
    domains.add(item.domain);
    domainsByNode.set(item.nodeId, domains);
  }
  if (publishedIds.size !== canonicalById.size || [...canonicalById.keys()].some((questionId) => !publishedIds.has(questionId))) fail("GCP published attribution does not cover the canonical question inventory");
  if (domainsByNode.size !== nodeIds.length || [...domainsByNode.values()].some((domains) => domains.size !== 1)) fail("GCP published attribution has missing or ambiguous node domains");
  const evidencedMap = Object.fromEntries([...domainsByNode].map(([nodeId, domains]) => [nodeId, [...domains][0]]).sort(([left], [right]) => compareStrings(left, right)));
  if (canonicalJson(profile.nodeDomainMap) !== canonicalJson(evidencedMap)) fail("GCP nodeDomainMap differs from same-version published question attribution");

  const familyConfig = Object.freeze({
    schemaVersion: "patternly-certification-simulation-config-v1",
    source: profile.source,
    durationMinutes: profile.durationMinutes,
    questionCount: profile.questionCount,
    blueprint: profile.blueprint,
    interactionPolicy: profile.interactionPolicy,
    nodeDomainMap: profile.nodeDomainMap,
    nodeDomainMapEvidence: profile.nodeDomainMapEvidence
  });
  return {
    questionDomains,
    simulationProfiles: [Object.freeze({
    schemaVersion: SIMULATION_PROFILE_SCHEMA_VERSION,
    profileId: GCP_EXAM_PROFILE_ID,
    profileVersion: profile.profileVersion,
    familyId: "certification",
    modeId: "certification-exam-simulation",
    familyConfig
    })]
  };
}

export async function loadGcpSimulationProfiles(options) {
  return (await loadGcpSimulationProfileData(options)).simulationProfiles;
}

async function loadCodingSimulationProfileData({ rootDirectory, track, questions }) {
  const trackConfigPath = path.join(rootDirectory, "config", "tracks", `${CODING_TRACK_ID}.json`);
  let configInfo;
  try { configInfo = await lstat(trackConfigPath); }
  catch (error) { if (error?.code === "ENOENT") return undefined; fail(`Cannot inspect Coding Interview simulation profile config ${trackConfigPath}: ${error.message}`); }
  if (!configInfo.isFile() || configInfo.isSymbolicLink()) fail(`Coding Interview simulation profile config must be a regular file: ${trackConfigPath}`);
  const config = await readJson(trackConfigPath);
  exactKeys(config, ["schemaVersion", "trackId", "familyId", "taxonomyVersion", "taxonomyPath", "freeNodeExperienceProfilePath", "modeConfiguration"], "Coding Interview track config");
  if (config.schemaVersion !== "track-config-v1" || config.trackId !== CODING_TRACK_ID || config.familyId !== "coding_interview" || !nonEmptyString(config.taxonomyVersion)) fail("Coding Interview track config identity or version is invalid");
  exactKeys(config.modeConfiguration, ["schemaVersion", "practiceBlueprints", "simulationBlueprint", "userModeMappings"], "Coding Interview mode configuration");
  if (config.modeConfiguration.schemaVersion !== "coding-interview-track-mode-config-v1") fail("Coding Interview mode configuration schema is invalid");

  const blueprint = config.modeConfiguration.simulationBlueprint;
  exactKeys(blueprint, ["blueprintId", "blueprintVersion", "modeId", "profileId", "profileVersion", "poolVersion", "requestedLength", "actualLength", "shorteningPolicy", "uniqueItemsRequired", "timerKind", "durationMinutes", "navigationPolicy", "answerChangePolicy", "reinsertPolicy", "feedbackTiming", "learningStages", "selectionPolicy", "eligibleQuestionIds"], "Coding Interview simulation blueprint");
  if (blueprint.blueprintId !== "coding-interview-interview-simulation-v1" || blueprint.blueprintVersion !== "1" || blueprint.modeId !== "coding-interview-simulation" || blueprint.profileId !== CODING_PROFILE_ID || blueprint.profileVersion !== "1" || blueprint.poolVersion !== "1" || blueprint.requestedLength !== 40 || blueprint.actualLength !== 40 || blueprint.shorteningPolicy !== "prohibited" || blueprint.uniqueItemsRequired !== 40 || blueprint.timerKind !== "foreground_countdown" || blueprint.durationMinutes !== 45 || blueprint.navigationPolicy !== "free_navigation" || blueprint.answerChangePolicy !== "editable_until_finalization" || blueprint.reinsertPolicy !== "disabled" || blueprint.feedbackTiming !== "after_verified_finalization" || canonicalJson(blueprint.learningStages) !== canonicalJson(["simulation"])) fail("Coding Interview simulation blueprint identity or behavior is invalid");
  exactKeys(blueprint.selectionPolicy, CODING_SIMULATION_POLICY_KEYS, "Coding Interview simulation selection policy");
  if (CODING_SIMULATION_POLICY_KEYS.some((key) => blueprint.selectionPolicy[key] !== true)) fail("Coding Interview simulation selection policy must keep every declared constraint enabled");
  const eligibleIds = blueprint.eligibleQuestionIds;
  if (!Array.isArray(eligibleIds) || eligibleIds.length !== blueprint.actualLength || eligibleIds.some((id) => !nonEmptyString(id))) fail("Coding Interview simulation blueprint must declare exactly 40 eligible question identities");
  if (blueprint.selectionPolicy.requireUniqueItemIds && new Set(eligibleIds).size !== eligibleIds.length) fail("Coding Interview simulation pool contains duplicate question identities");

  const taxonomyPath = path.resolve(rootDirectory, config.taxonomyPath);
  if (!isWithin(rootDirectory, taxonomyPath)) fail("Coding Interview taxonomy path escapes the producer root");
  await assertSecurePath(rootDirectory, taxonomyPath, "Coding Interview simulation taxonomy");
  const taxonomy = await readJson(taxonomyPath);
  exactKeys(taxonomy, ["schemaVersion", "trackId", "taxonomyVersion", "learningStages", "roadmapNodes", "mentalUnits", "patternFamilies", "patternVariants", "problemArchetypes", "skillAtoms", "falseHeuristics"], "Coding Interview taxonomy");
  if (taxonomy.schemaVersion !== config.taxonomyVersion || taxonomy.trackId !== CODING_TRACK_ID || taxonomy.taxonomyVersion !== config.taxonomyVersion || !Array.isArray(taxonomy.roadmapNodes) || !Array.isArray(taxonomy.mentalUnits) || !Array.isArray(taxonomy.patternFamilies)) fail("Coding Interview simulation taxonomy identity is invalid");
  const nodeIds = new Set(taxonomy.roadmapNodes.map((node) => node.id));
  const mentalUnitById = new Map(taxonomy.mentalUnits.map((unit) => [unit.id, unit]));
  const patternFamilyIds = new Set(taxonomy.patternFamilies.map((family) => family.id));
  const familyByMentalUnit = new Map([...mentalUnitById].map(([unitId, unit]) => [unitId, unit.primaryPatternFamilyId]));
  const sourceById = new Map(questions.map((question) => [question.questionId, question]));
  if (blueprint.selectionPolicy.requireDeclaredSimulationEligibility && eligibleIds.some((id) => !sourceById.has(id))) fail("Coding Interview simulation pool references an item outside current canonical source");
  const selectedQuestions = eligibleIds.map((id) => sourceById.get(id));
  if (selectedQuestions.some((question) => !question)) fail("Coding Interview simulation pool cannot use fallback or missing source items");
  if (blueprint.selectionPolicy.prohibitTaxonomyWidening && selectedQuestions.some((question) => !nodeIds.has(question.nodeId) || !mentalUnitById.has(question.mentalUnitId) || mentalUnitById.get(question.mentalUnitId).roadmapNodeId !== question.nodeId || !patternFamilyIds.has(familyByMentalUnit.get(question.mentalUnitId)))) fail("Coding Interview simulation pool widens beyond declared track taxonomy");
  if (blueprint.selectionPolicy.requireMultipleMentalUnits && new Set(selectedQuestions.map((question) => question.mentalUnitId)).size < 2) fail("Coding Interview simulation pool must cover multiple mental units");
  if (blueprint.selectionPolicy.requireMultiplePatternFamilies && new Set(selectedQuestions.map((question) => familyByMentalUnit.get(question.mentalUnitId))).size < 2) fail("Coding Interview simulation pool must cover multiple pattern families");
  if (blueprint.selectionPolicy.prohibitConsecutiveSameMentalUnitWhenAlternativeExists && selectedQuestions.some((question, index) => index > 0 && question.mentalUnitId === selectedQuestions[index - 1].mentalUnitId)) fail("Coding Interview simulation pool has consecutive items from the same mental unit");
  if (blueprint.selectionPolicy.prohibitDuplicateContentIdentity) {
    const identities = selectedQuestions.map((question) => {
      const { questionId: _questionId, ...content } = question;
      return sha256(content);
    });
    if (new Set(identities).size !== identities.length) fail("Coding Interview simulation pool contains duplicate content identities");
  }
  if (blueprint.selectionPolicy.requireEveryActiveInteractionTypeRepresented) {
    const activeTypes = new Set(questions.map((question) => question.interaction.type));
    const selectedTypes = new Set(selectedQuestions.map((question) => question.interaction.type));
    if ([...activeTypes].some((type) => !selectedTypes.has(type))) fail("Coding Interview simulation pool does not represent every active interaction type");
  }
  const familyConfig = Object.freeze({
    schemaVersion: "patternly-coding-interview-simulation-config-v1",
    blueprintId: blueprint.blueprintId,
    blueprintVersion: blueprint.blueprintVersion,
    requestedLength: blueprint.requestedLength,
    actualLength: blueprint.actualLength,
    shorteningPolicy: blueprint.shorteningPolicy,
    uniqueItemsRequired: blueprint.uniqueItemsRequired,
    timerKind: blueprint.timerKind,
    durationMinutes: blueprint.durationMinutes,
    navigationPolicy: blueprint.navigationPolicy,
    answerChangePolicy: blueprint.answerChangePolicy,
    reinsertPolicy: blueprint.reinsertPolicy,
    feedbackTiming: blueprint.feedbackTiming,
    learningStages: blueprint.learningStages,
    selectionPolicy: blueprint.selectionPolicy,
    poolId: blueprint.profileId,
    poolVersion: blueprint.poolVersion,
    eligibleQuestionIds: eligibleIds
  });
  return { simulationProfiles: [Object.freeze({ schemaVersion: SIMULATION_PROFILE_SCHEMA_VERSION, profileId: blueprint.profileId, profileVersion: blueprint.profileVersion, familyId: config.familyId, modeId: blueprint.modeId, familyConfig })] };
}

export async function loadCodingSimulationProfiles(options) {
  return (await loadCodingSimulationProfileData(options)).simulationProfiles;
}

async function loadDesignSimulationProfileData({ rootDirectory, track }) {
  if (!DESIGN_TRACK_IDS.includes(track.trackId)) return undefined;
  const configPath = path.join(rootDirectory, "config", "simulation-profiles", "design-interview.json");
  let configInfo;
  try { configInfo = await lstat(configPath); }
  catch (error) { if (error?.code === "ENOENT") return undefined; fail(`Cannot inspect Design Interview simulation profile config ${configPath}: ${error.message}`); }
  if (!configInfo.isFile() || configInfo.isSymbolicLink()) fail(`Design Interview simulation profile config must be a regular file: ${configPath}`);
  await assertSecurePath(rootDirectory, configPath, "Design Interview simulation profile config");
  const config = await readJson(configPath);
  exactKeys(config, ["schemaVersion", "familyId", "modeId", "timer", "stages", "outcomeEvaluation", "rubric", "cases"], "Design Interview simulation source");
  if (config.schemaVersion !== "design-interview-simulation-source-v1" || config.familyId !== "design_interview" || config.modeId !== DESIGN_SIMULATION_MODE_ID) fail("Design Interview simulation source identity is invalid");
  exactKeys(config.timer, ["kind", "durationSeconds"], "Design Interview simulation timer");
  if (config.timer.kind !== "absolute_deadline" || !Number.isInteger(config.timer.durationSeconds) || config.timer.durationSeconds <= 0) fail("Design Interview simulation timer must use a positive absolute deadline");
  if (!Array.isArray(config.stages) || canonicalJson(config.stages.map((stage) => stage?.stageId)) !== canonicalJson(DESIGN_SIMULATION_STAGE_IDS)) fail("Design Interview simulation stages must be ordered requirements, architecture, tradeoffs, final_answer");
  for (const [index, stage] of config.stages.entries()) {
    exactKeys(stage, ["stageId", "title", "response"], `Design Interview simulation stage ${index}`);
    if (!nonEmptyString(stage.title)) fail(`Design Interview simulation stage ${index} title is invalid`);
    exactKeys(stage.response, ["type", "required", "minimumCharacters"], `Design Interview simulation stage ${index} response`);
    if (stage.response.type !== "text" || stage.response.required !== true || stage.response.minimumCharacters !== 1) fail(`Design Interview simulation stage ${index} must require a non-empty text response`);
  }
  exactKeys(config.outcomeEvaluation, ["machineEvaluable", "semanticScoring"], "Design Interview simulation outcome evaluation");
  if (canonicalJson(config.outcomeEvaluation.machineEvaluable) !== canonicalJson(["response_completeness"]) || config.outcomeEvaluation.semanticScoring !== "not_evaluated") fail("Design Interview simulation outcome evaluation may evaluate completeness only");
  exactKeys(config.rubric, ["kind", "dimensions"], "Design Interview simulation rubric");
  if (config.rubric.kind !== "self_assessment_reference_only" || !Array.isArray(config.rubric.dimensions) || canonicalJson(config.rubric.dimensions.map((dimension) => dimension?.dimensionId)) !== canonicalJson(DESIGN_SIMULATION_RUBRIC_DIMENSION_IDS)) fail("Design Interview simulation rubric dimensions or use are invalid");
  for (const [index, dimension] of config.rubric.dimensions.entries()) {
    exactKeys(dimension, ["dimensionId", "title", "levels"], `Design Interview simulation rubric dimension ${index}`);
    if (!nonEmptyString(dimension.title) || !Array.isArray(dimension.levels) || dimension.levels.length !== 4) fail(`Design Interview simulation rubric dimension ${index} must define four levels`);
    dimension.levels.forEach((level, levelIndex) => {
      exactKeys(level, ["level", "label", "description"], `Design Interview simulation rubric level ${index}.${levelIndex}`);
      if (level.level !== levelIndex + 1 || !nonEmptyString(level.label) || !nonEmptyString(level.description)) fail(`Design Interview simulation rubric level ${index}.${levelIndex} is invalid`);
    });
  }
  if (!Array.isArray(config.cases) || config.cases.length !== DESIGN_TRACK_IDS.length) fail("Design Interview simulation source must define exactly one case per Design track");
  const casesByTrack = new Map();
  const caseIds = new Set();
  const profileIds = new Set();
  for (const [index, designCase] of config.cases.entries()) {
    exactKeys(designCase, ["trackId", "profileId", "profileVersion", "caseId", "caseVersion", "title", "brief", "reviewCriteria"], `Design Interview simulation case ${index}`);
    if (!DESIGN_TRACK_IDS.includes(designCase.trackId) || casesByTrack.has(designCase.trackId)) fail(`Design Interview simulation case ${index} has a missing, unknown, or duplicate track identity`);
    if (!nonEmptyString(designCase.profileId) || designCase.profileVersion !== "1" || !nonEmptyString(designCase.caseId) || designCase.caseVersion !== "1" || !nonEmptyString(designCase.title) || !nonEmptyString(designCase.brief)) fail(`Design Interview simulation case ${index} identity or prompt is invalid`);
    if (caseIds.has(designCase.caseId) || profileIds.has(designCase.profileId)) fail(`Design Interview simulation case ${index} has a duplicate stable identity`);
    caseIds.add(designCase.caseId);
    profileIds.add(designCase.profileId);
    if (!Array.isArray(designCase.reviewCriteria) || designCase.reviewCriteria.length !== DESIGN_SIMULATION_STAGE_IDS.length) fail(`Design Interview simulation case ${index} must define one review criterion per stage`);
    const criterionIds = new Set();
    for (const [criterionIndex, criterion] of designCase.reviewCriteria.entries()) {
      exactKeys(criterion, ["criterionId", "stageId", "description"], `Design Interview simulation case ${index} review criterion ${criterionIndex}`);
      if (!nonEmptyString(criterion.criterionId) || criterionIds.has(criterion.criterionId) || !DESIGN_SIMULATION_STAGE_IDS.includes(criterion.stageId) || !nonEmptyString(criterion.description)) fail(`Design Interview simulation case ${index} review criterion ${criterionIndex} is invalid`);
      criterionIds.add(criterion.criterionId);
    }
    if (canonicalJson(designCase.reviewCriteria.map((criterion) => criterion.stageId)) !== canonicalJson(DESIGN_SIMULATION_STAGE_IDS)) fail(`Design Interview simulation case ${index} review criteria must follow the stage order`);
    casesByTrack.set(designCase.trackId, designCase);
  }
  if (DESIGN_TRACK_IDS.some((trackId) => !casesByTrack.has(trackId))) fail("Design Interview simulation source must cover every Design track");

  const designCase = casesByTrack.get(track.trackId);
  const familyConfig = Object.freeze({
    schemaVersion: "patternly-design-interview-simulation-config-v1",
    caseId: designCase.caseId,
    caseVersion: designCase.caseVersion,
    title: designCase.title,
    brief: designCase.brief,
    timer: config.timer,
    stages: config.stages,
    reviewCriteria: designCase.reviewCriteria,
    rubric: config.rubric,
    outcomeEvaluation: config.outcomeEvaluation
  });
  return {
    simulationProfiles: [Object.freeze({
      schemaVersion: SIMULATION_PROFILE_SCHEMA_VERSION,
      profileId: designCase.profileId,
      profileVersion: designCase.profileVersion,
      familyId: "design_interview",
      modeId: DESIGN_SIMULATION_MODE_ID,
      familyConfig
    })]
  };
}

export async function loadDesignSimulationProfiles(options) {
  return (await loadDesignSimulationProfileData(options)).simulationProfiles;
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
  const profileData = trackId === GCP_TRACK_ID
    ? await loadGcpSimulationProfileData({ rootDirectory: resolvedRoot, track, questions })
    : trackId === CODING_TRACK_ID
      ? await loadCodingSimulationProfileData({ rootDirectory: resolvedRoot, track, questions })
      : DESIGN_TRACK_IDS.includes(trackId) ? await loadDesignSimulationProfileData({ rootDirectory: resolvedRoot, track }) : undefined;
  const artifactQuestions = profileData?.questionDomains
    ? questions.map((question) => ({ ...question, contentDomainId: profileData.questionDomains[question.questionId] }))
    : questions;
  return { rootDirectory: resolvedRoot, catalog, track, trackId, sourceRoot, sourceFiles, questions, artifactQuestions, simulationProfiles: profileData?.simulationProfiles };
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
  const artifact = {
    schemaVersion: ARTIFACT_SCHEMA_VERSION,
    trackId: validated.trackId,
    contentVersion: validated.track.contentVersion,
    questions: validated.artifactQuestions ?? validated.questions
  };
  if (Object.hasOwn(validated.track, "completionRule")) artifact.completionRule = validated.track.completionRule;
  if (validated.simulationProfiles) artifact.simulationProfiles = validated.simulationProfiles;
  return artifact;
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
  const requiredKeys = ["schemaVersion", "trackId", "contentVersion", "questions"];
  const allowedKeys = [...requiredKeys, "simulationProfiles", "completionRule"];
  if (!isRecord(artifact) || requiredKeys.some((key) => !Object.hasOwn(artifact, key)) || Object.keys(artifact).some((key) => !allowedKeys.includes(key))) {
    fail(`Artifact has an invalid shape: ${filePath}`);
  }
  if (artifact.schemaVersion !== ARTIFACT_SCHEMA_VERSION) fail(`Artifact schemaVersion mismatch: ${filePath}`);
  if (artifact.trackId !== entry.trackId) fail(`Artifact trackId mismatch: ${filePath}`);
  if (artifact.contentVersion !== entry.contentVersion) fail(`Artifact contentVersion mismatch: ${filePath}`);
  const catalogEntry = catalogTrack(catalog, entry.trackId);
  if (Object.hasOwn(artifact, "completionRule")) {
    const ruleResult = validatePackageCompletionRule(artifact.completionRule, "artifact.completionRule");
    if (!ruleResult.valid) fail(`Artifact completionRule is invalid: ${filePath}`, ruleResult.errors);
  }
  if (Object.hasOwn(artifact, "completionRule") !== Object.hasOwn(catalogEntry, "completionRule") ||
      (Object.hasOwn(catalogEntry, "completionRule") && canonicalJson(artifact.completionRule) !== canonicalJson(catalogEntry.completionRule))) {
    fail(`Artifact completionRule does not match authoritative catalog: ${filePath}`);
  }
  if (!Array.isArray(artifact.questions) || artifact.questions.length !== entry.questionCount) {
    fail(`Artifact questionCount mismatch: ${filePath}`);
  }
  const catalogTrackIds = catalog.tracks.map((track) => track.trackId);
  const questionIds = new Set();
  let previousQuestionId;
  artifact.questions.forEach((question, index) => {
    const { contentDomainId, ...questionContract } = question;
    const result = validateQuestion(questionContract, { catalogTrackIds });
    if (!result.valid) fail(`Artifact question ${index} is invalid: ${filePath}`, result.errors);
    if (contentDomainId !== undefined && (entry.trackId !== GCP_TRACK_ID || !Object.hasOwn(artifact, "simulationProfiles") || !GCP_DOMAIN_IDS.includes(contentDomainId))) fail(`Artifact question ${index} has invalid source-derived GCP domain attribution: ${filePath}`);
    if (question.trackId !== entry.trackId) fail(`Artifact question trackId mismatch: ${filePath}`);
    if (questionIds.has(question.questionId)) fail(`Artifact contains duplicate questionId ${question.questionId}: ${filePath}`);
    if (previousQuestionId !== undefined && previousQuestionId >= question.questionId) fail(`Artifact questions are not sorted by questionId: ${filePath}`);
    questionIds.add(question.questionId);
    previousQuestionId = question.questionId;
  });
  if (Object.hasOwn(artifact, "simulationProfiles") && (!Array.isArray(artifact.simulationProfiles) || artifact.simulationProfiles.length === 0)) fail(`Artifact simulationProfiles must be a non-empty array when present: ${filePath}`);
  return artifact;
}

async function verifyExistingArtifact(outputRoot, entry, catalog, rootDirectory) {
  const filePath = path.join(outputRoot, `${entry.trackId}.json`);
  const bytes = await readRegularFile(filePath, "existing artifact");
  if (sha256(bytes) !== entry.sha256) fail(`Existing artifact checksum mismatch: ${filePath}`);
  const artifact = jsonText(bytes, filePath);
  if (canonicalJson(artifact) !== bytes) fail(`Existing artifact is not canonical: ${filePath}`);
  const validated = validateArtifactShape(artifact, { entry, catalog, filePath });
  if (Object.hasOwn(validated, "simulationProfiles")) {
    const profileData = entry.trackId === GCP_TRACK_ID
      ? await loadGcpSimulationProfileData({ rootDirectory, track: catalogTrack(catalog, entry.trackId), questions: validated.questions })
      : entry.trackId === CODING_TRACK_ID
        ? await loadCodingSimulationProfileData({ rootDirectory, track: catalogTrack(catalog, entry.trackId), questions: validated.questions })
        : DESIGN_TRACK_IDS.includes(entry.trackId)
          ? await loadDesignSimulationProfileData({ rootDirectory, track: catalogTrack(catalog, entry.trackId) })
          : undefined;
    if (!profileData || canonicalJson(validated.simulationProfiles) !== canonicalJson(profileData.simulationProfiles) || (profileData.questionDomains && validated.questions.some((question) => question.contentDomainId !== profileData.questionDomains[question.questionId]))) {
      fail(`Existing simulationProfiles are malformed or differ from authoritative config: ${filePath}`);
    }
  }
  return validated;
}

async function loadExistingLock(outputRoot, catalog, rootDirectory) {
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
  for (const entry of validLock.tracks) await verifyExistingArtifact(outputRoot, entry, catalog, rootDirectory);
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
  const existingLock = await loadExistingLock(outputRoot, validated.catalog, validated.rootDirectory);
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
  const existingLock = await loadExistingLock(resolvedOutputRoot, catalog, resolvedRoot);
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
