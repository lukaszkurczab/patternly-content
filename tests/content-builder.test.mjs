import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFileSync } from "node:fs";
import { mkdtemp, readFile, readdir, rename as fsRename, stat, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { promisify } from "node:util";

import {
  ACCEPTED_TRACK_IDS,
  loadCanonicalCatalog,
  loadCanonicalFixture
} from "../scripts/content/question-contract.mjs";
import {
  ARTIFACT_SCHEMA_VERSION,
  ContentBuildError,
  LOCK_SCHEMA_VERSION,
  buildAll,
  buildTrack,
  canonicalJson,
  loadCodingSimulationProfiles,
  loadDesignSimulationProfiles,
  loadGcpSimulationProfiles,
  parseArgs,
  sha256,
  testTrack,
  validateTrack
} from "../scripts/build.mjs";

const { fixture } = loadCanonicalFixture();
const execFileAsync = promisify(execFile);
const builderPath = new URL("../scripts/build.mjs", import.meta.url);
const baseQuestion = fixture.questions.find((question) => question.interaction.type === "choice_single");
const realCatalog = loadCanonicalCatalog();
const candidateManifest = JSON.parse(readFileSync(new URL("../evidence/content-acceptance/candidate-manifest-v1.json", import.meta.url), "utf8"));
const historicalBaseline = JSON.parse(readFileSync(new URL("../evidence/content-acceptance/acc-01-baseline-v1.json", import.meta.url), "utf8"));
const historicalMigrationManifest = JSON.parse(readFileSync(new URL("../content/migration-evidence/manifest.json", import.meta.url), "utf8"));
const odk096Approval = JSON.parse(readFileSync(new URL("../evidence/canonical-content-approvals/odk-096-aws-free-node-v1.json", import.meta.url), "utf8"));
const ODK096_CONTENT_VERSION = odk096Approval.canonicalIdentity.contentVersion;
const bizq01Copy = JSON.parse(readFileSync(new URL("../evidence/business-quality/bizq-01-coding-source-copy-04.json", import.meta.url), "utf8"));
const bizq01Batch = JSON.parse(readFileSync(new URL("../evidence/business-quality/bizq-01-besd-slice-01.json", import.meta.url), "utf8"));
const bizq01OodReplacement = JSON.parse(readFileSync(new URL("../evidence/business-quality/bizq-01-ood-source-11.json", import.meta.url), "utf8"));

async function createWorkspace() {
  const rootDirectory = await mkdtemp(path.join(os.tmpdir(), "patternly-simp02-"));
  await mkdir(path.join(rootDirectory, "content"), { recursive: true });
  await writeFile(path.join(rootDirectory, "content/catalog.json"), `${canonicalJson(realCatalog)}\n`, "utf8");
  return rootDirectory;
}

function questionFor(trackId, suffix = "001") {
  const question = structuredClone(baseQuestion);
  question.questionId = `${trackId}-q-${suffix}`;
  question.trackId = trackId;
  question.nodeId = "node-001";
  question.mentalUnitId = "mental-unit-001";
  question.sourceRefs = [`fixture/${trackId}`];
  return question;
}

async function writeTrackQuestion(rootDirectory, trackId, question = questionFor(trackId), { nodeId = question.nodeId, mentalUnitId = question.mentalUnitId } = {}) {
  const filePath = path.join(rootDirectory, "content", trackId, nodeId, `${mentalUnitId}.json`);
  await writeQuestionFile(filePath, question);
  return filePath;
}

async function writeQuestionFile(filePath, question) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify([question], null, 2)}\n`, "utf8");
  return filePath;
}

async function populateAll(rootDirectory) {
  for (const trackId of ACCEPTED_TRACK_IDS) await writeTrackQuestion(rootDirectory, trackId);
}

async function expectBuildFailure(action, pattern) {
  await assert.rejects(action, (error) => {
    assert.ok(error instanceof ContentBuildError, error?.stack ?? error);
    if (pattern) assert.match(error.message, pattern);
    return true;
  });
}

test("each catalogued track validates, tests and builds independently", async (t) => {
  const rootDirectory = await createWorkspace();
  const outputRoot = path.join(rootDirectory, "dist");
  t.after(() => rm(rootDirectory, { recursive: true, force: true }));

  await populateAll(rootDirectory);
  for (const trackId of ACCEPTED_TRACK_IDS) {
    const validated = await validateTrack({ rootDirectory, trackId });
    assert.equal(validated.questions.length, 1);
    const tested = await testTrack({ rootDirectory, trackId });
    assert.equal(tested.questions.length, 1);
    const built = await buildTrack({ rootDirectory, outputRoot, trackId });
    assert.deepEqual(Object.keys(built.artifact).sort(), ["contentVersion", "questions", "schemaVersion", "trackId"]);
    assert.equal(built.artifact.schemaVersion, ARTIFACT_SCHEMA_VERSION);
    assert.equal(built.artifact.trackId, trackId);
    assert.equal(built.artifact.contentVersion, realCatalog.tracks.find((track) => track.trackId === trackId).contentVersion);
  }
});

test("build-all emits exactly nine deterministic artifacts and lock entries", async (t) => {
  const rootDirectory = await createWorkspace();
  const outputRoot = path.join(rootDirectory, "dist");
  t.after(() => rm(rootDirectory, { recursive: true, force: true }));
  await populateAll(rootDirectory);

  const first = await buildAll({ rootDirectory, outputRoot });
  assert.equal(first.artifacts.length, 9);
  assert.equal(first.lock.schemaVersion, LOCK_SCHEMA_VERSION);
  assert.deepEqual(first.lock.tracks.map((entry) => entry.trackId), [...ACCEPTED_TRACK_IDS].sort());
  const firstBytes = new Map();
  for (const trackId of ACCEPTED_TRACK_IDS) firstBytes.set(trackId, await readFile(path.join(outputRoot, `${trackId}.json`), "utf8"));
  const firstLockBytes = await readFile(path.join(outputRoot, "content-lock.json"), "utf8");

  const second = await buildAll({ rootDirectory, outputRoot });
  for (const trackId of ACCEPTED_TRACK_IDS) {
    const bytes = await readFile(path.join(outputRoot, `${trackId}.json`), "utf8");
    assert.equal(bytes.charCodeAt(0), "{".charCodeAt(0));
    assert.notEqual(bytes.endsWith("\n"), true);
    assert.notEqual(bytes.charCodeAt(0), 0xfeff);
    assert.equal(bytes, firstBytes.get(trackId));
    const entry = second.lock.tracks.find((candidate) => candidate.trackId === trackId);
    assert.equal(entry.sha256, sha256(bytes));
  }
  assert.equal(await readFile(path.join(outputRoot, "content-lock.json"), "utf8"), firstLockBytes);
});

test("GCP simulation profile binds a complete unambiguous node map to the same-version published artifact", async (t) => {
  const rootDirectory = path.resolve(".");
  const validated = await validateTrack({ rootDirectory, trackId: "google-cloud-associate-cloud-engineer" });
  const profile = validated.simulationProfiles?.[0];
  assert.ok(profile);
  assert.equal(profile.schemaVersion, "patternly-simulation-profile-envelope-v1");
  assert.equal(profile.familyId, "certification");
  assert.equal(profile.modeId, "certification-exam-simulation");
  const familyConfig = profile.familyConfig;
  assert.equal(familyConfig.schemaVersion, "patternly-certification-simulation-config-v1");
  assert.equal(familyConfig.durationMinutes, 120);
  assert.deepEqual(familyConfig.questionCount, { kind: "range", minimum: 50, maximum: 60 });
  assert.deepEqual(familyConfig.blueprint.sections.map(({ contentDomainId, weightPercent }) => [contentDomainId, weightPercent]), [
    ["gcp-ace-standard-domain-1", 20],
    ["gcp-ace-standard-domain-2", 30],
    ["gcp-ace-standard-domain-3", 30],
    ["gcp-ace-standard-domain-4", 20]
  ]);

  const publishedPath = path.join(rootDirectory, familyConfig.nodeDomainMapEvidence.artifactPath);
  const publishedWrapper = JSON.parse(readFileSync(publishedPath, "utf8"));
  const published = JSON.parse(publishedWrapper.artifactBytes);
  assert.equal(published.contentVersion, validated.track.contentVersion);
  assert.equal(published.bank.items.length, familyConfig.nodeDomainMapEvidence.itemCount);
  const domainsByNode = new Map();
  for (const item of published.bank.items) {
    const domains = domainsByNode.get(item.nodeId) ?? new Set();
    domains.add(item.domain);
    domainsByNode.set(item.nodeId, domains);
  }
  assert.equal(domainsByNode.size, 20);
  assert.equal([...domainsByNode.values()].filter((domains) => domains.size !== 1).length, 0);
  const evidencedMap = Object.fromEntries([...domainsByNode].map(([nodeId, domains]) => [nodeId, [...domains][0]]).sort(([left], [right]) => left.localeCompare(right)));
  assert.deepEqual(familyConfig.nodeDomainMap, evidencedMap);

  const outputRoot = await mkdtemp(path.join(os.tmpdir(), "patternly-gcp-profile-build-"));
  t.after(() => rm(outputRoot, { recursive: true, force: true }));
  const built = await buildTrack({ rootDirectory, outputRoot, trackId: "google-cloud-associate-cloud-engineer" });
  assert.deepEqual(built.artifact.simulationProfiles, validated.simulationProfiles);
  assert.equal(built.artifact.questions.length, published.bank.items.length);
  const questionDomains = new Map(built.artifact.questions.map((question) => [question.questionId, question.contentDomainId]));
  assert.ok(published.bank.items.every((item) => questionDomains.get(item.id) === item.domain));
  assert.equal(built.lockEntry.sha256, sha256(built.artifactBytes));
});

test("Coding Interview simulation profile emits the blueprint and exact checksum-verified pool identities", async (t) => {
  const rootDirectory = path.resolve(".");
  const validated = await validateTrack({ rootDirectory, trackId: "coding-interview-dsa-problem-solving" });
  const profile = validated.simulationProfiles?.[0];
  assert.ok(profile);
  assert.equal(profile.schemaVersion, "patternly-simulation-profile-envelope-v1");
  assert.equal(profile.profileId, "algorithms-interview-simulation-v1");
  assert.equal(profile.profileVersion, "1");
  assert.equal(profile.familyId, "coding_interview");
  assert.equal(profile.modeId, "coding-interview-simulation");
  const familyConfig = profile.familyConfig;
  assert.equal(familyConfig.schemaVersion, "patternly-coding-interview-simulation-config-v1");
  assert.equal(familyConfig.timerKind, "foreground_countdown");
  assert.equal(familyConfig.durationMinutes, 45);
  assert.equal(familyConfig.actualLength, 40);
  assert.equal(familyConfig.poolId, "algorithms-interview-simulation-v1");
  assert.equal(familyConfig.eligibleQuestionIds.length, 40);
  assert.equal(new Set(familyConfig.eligibleQuestionIds).size, 40);
  const trackConfig = JSON.parse(readFileSync(path.join(rootDirectory, "config/tracks/coding-interview-dsa-problem-solving.json"), "utf8"));
  assert.deepEqual(familyConfig.eligibleQuestionIds, trackConfig.modeConfiguration.simulationBlueprint.eligibleQuestionIds);
  const selectedTypes = new Set(familyConfig.eligibleQuestionIds.map((id) => validated.questions.find((question) => question.questionId === id)?.interaction.type));
  const activeTypes = new Set(validated.questions.map((question) => question.interaction.type));
  assert.deepEqual([...selectedTypes].sort(), [...activeTypes].sort());
  assert.ok(selectedTypes.has("choice_multiple"));

  const outputRoot = await mkdtemp(path.join(os.tmpdir(), "patternly-coding-profile-build-"));
  t.after(() => rm(outputRoot, { recursive: true, force: true }));
  const built = await buildTrack({ rootDirectory, outputRoot, trackId: "coding-interview-dsa-problem-solving" });
  assert.deepEqual(built.artifact.simulationProfiles, validated.simulationProfiles);
  assert.equal(built.lockEntry.sha256, sha256(built.artifactBytes));
});

test("malformed Coding Interview simulation blueprint fails closed", async (t) => {
  const sourceRoot = path.resolve(".");
  const validated = await validateTrack({ rootDirectory: sourceRoot, trackId: "coding-interview-dsa-problem-solving" });
  const rootDirectory = await mkdtemp(path.join(os.tmpdir(), "patternly-coding-profile-invalid-"));
  t.after(() => rm(rootDirectory, { recursive: true, force: true }));
  const configPath = path.join(sourceRoot, "config/tracks/coding-interview-dsa-problem-solving.json");
  const config = JSON.parse(await readFile(configPath, "utf8"));
  config.modeConfiguration.simulationBlueprint.durationMinutes = 46;
  await mkdir(path.join(rootDirectory, "config/tracks"), { recursive: true });
  await mkdir(path.join(rootDirectory, "config/taxonomy"), { recursive: true });
  await writeFile(path.join(rootDirectory, "config/tracks/coding-interview-dsa-problem-solving.json"), JSON.stringify(config));
  await writeFile(path.join(rootDirectory, config.taxonomyPath), await readFile(path.join(sourceRoot, config.taxonomyPath)));
  await expectBuildFailure(loadCodingSimulationProfiles({ rootDirectory, track: validated.track, questions: validated.questions }), /blueprint identity or behavior/u);
});

test("Coding Interview simulation selection policies reject stale pools and invalid identities", async (t) => {
  const sourceRoot = path.resolve(".");
  const validated = await validateTrack({ rootDirectory: sourceRoot, trackId: "coding-interview-dsa-problem-solving" });
  const sourceConfig = JSON.parse(await readFile(path.join(sourceRoot, "config/tracks/coding-interview-dsa-problem-solving.json"), "utf8"));
  const oldWrapper = JSON.parse(await readFile(path.join(sourceRoot, "artifacts/tracks/coding-interview-dsa-problem-solving", candidateManifest.tracks.find((track) => track.trackId === "coding-interview-dsa-problem-solving").artifact.contentVersion, "track-artifact.json"), "utf8"));
  const oldPool = JSON.parse(oldWrapper.artifactBytes).bank.simulationPools[0].itemIds;
  const taxonomyBytes = await readFile(path.join(sourceRoot, sourceConfig.taxonomyPath));
  const withConfig = async (mutateConfig, mutateQuestions = (questions) => questions, mutateTaxonomy = (taxonomy) => taxonomy) => {
    const rootDirectory = await mkdtemp(path.join(os.tmpdir(), "patternly-coding-policy-"));
    t.after(() => rm(rootDirectory, { recursive: true, force: true }));
    const config = structuredClone(sourceConfig);
    mutateConfig(config);
    await mkdir(path.join(rootDirectory, "config/tracks"), { recursive: true });
    await mkdir(path.join(rootDirectory, "config/taxonomy"), { recursive: true });
    await writeFile(path.join(rootDirectory, "config/tracks/coding-interview-dsa-problem-solving.json"), JSON.stringify(config));
    const taxonomy = mutateTaxonomy(JSON.parse(taxonomyBytes));
    await writeFile(path.join(rootDirectory, config.taxonomyPath), JSON.stringify(taxonomy));
    const questions = mutateQuestions(structuredClone(validated.questions));
    return { rootDirectory, questions };
  };
  const rejects = async (mutateConfig, pattern, mutateQuestions, mutateTaxonomy) => {
    const { rootDirectory, questions } = await withConfig(mutateConfig, mutateQuestions, mutateTaxonomy);
    await expectBuildFailure(loadCodingSimulationProfiles({ rootDirectory, track: validated.track, questions }), pattern);
  };

  await rejects((config) => { config.modeConfiguration.simulationBlueprint.eligibleQuestionIds = oldPool; }, /does not represent every active interaction type/u);
  await rejects((config) => { config.modeConfiguration.simulationBlueprint.eligibleQuestionIds[0] = "missing-fallback-question"; }, /outside current canonical source/u);
  await rejects((config) => { config.modeConfiguration.simulationBlueprint.eligibleQuestionIds[1] = config.modeConfiguration.simulationBlueprint.eligibleQuestionIds[0]; }, /duplicate question identities/u);
  for (const policyKey of Object.keys(sourceConfig.modeConfiguration.simulationBlueprint.selectionPolicy)) {
    await rejects((config) => { config.modeConfiguration.simulationBlueprint.selectionPolicy[policyKey] = false; }, /selection policy must keep/u);
  }

  const firstId = sourceConfig.modeConfiguration.simulationBlueprint.eligibleQuestionIds[0];
  const firstUnit = validated.questions.find((question) => question.questionId === firstId).mentalUnitId;
  const sameUnitAlternative = validated.questions.find((question) => question.mentalUnitId === firstUnit && question.questionId !== firstId && !sourceConfig.modeConfiguration.simulationBlueprint.eligibleQuestionIds.includes(question.questionId));
  assert.ok(sameUnitAlternative);
  await rejects((config) => { config.modeConfiguration.simulationBlueprint.eligibleQuestionIds[1] = sameUnitAlternative.questionId; }, /consecutive items from the same mental unit/u);
  await rejects(() => {}, /duplicate content identities/u, (questions) => {
    const ids = sourceConfig.modeConfiguration.simulationBlueprint.eligibleQuestionIds;
    const duplicate = structuredClone(questions.find((question) => question.questionId === ids[0]));
    duplicate.questionId = ids.at(-1);
    return questions.map((question) => question.questionId === ids.at(-1) ? duplicate : question);
  });
  await rejects(() => {}, /widens beyond declared track taxonomy/u, (questions) => {
    const id = sourceConfig.modeConfiguration.simulationBlueprint.eligibleQuestionIds[0];
    return questions.map((question) => question.questionId === id ? { ...question, nodeId: "undeclared-node" } : question);
  });
  await rejects(() => {}, /multiple mental units/u, (questions) => {
    const ids = new Set(sourceConfig.modeConfiguration.simulationBlueprint.eligibleQuestionIds);
    const firstNode = validated.questions.find((question) => question.mentalUnitId === firstUnit).nodeId;
    return questions.map((question) => ids.has(question.questionId) ? { ...question, mentalUnitId: firstUnit, nodeId: firstNode } : question);
  });
  await rejects(() => {}, /multiple pattern families/u, undefined, (taxonomy) => {
    for (const unit of taxonomy.mentalUnits) unit.primaryPatternFamilyId = taxonomy.mentalUnits[0].primaryPatternFamilyId;
    return taxonomy;
  });
});

test("Design Interview simulation profiles emit one strict text-response case per track", async (t) => {
  const rootDirectory = path.resolve(".");
  const trackIds = ["backend-system-design-interview", "frontend-system-design-interview", "object-oriented-design-interview"];
  const outputRoot = await mkdtemp(path.join(os.tmpdir(), "patternly-design-profile-build-"));
  t.after(() => rm(outputRoot, { recursive: true, force: true }));

  for (const trackId of trackIds) {
    const validated = await validateTrack({ rootDirectory, trackId });
    const [profile] = validated.simulationProfiles ?? [];
    assert.ok(profile);
    assert.equal(profile.schemaVersion, "patternly-simulation-profile-envelope-v1");
    assert.equal(profile.familyId, "design_interview");
    assert.equal(profile.modeId, "design-interview-simulation");
    assert.equal(profile.profileVersion, "1");
    assert.equal(profile.familyConfig.schemaVersion, "patternly-design-interview-simulation-config-v1");
    assert.equal(profile.familyConfig.timer.kind, "absolute_deadline");
    assert.equal(profile.familyConfig.timer.durationSeconds, 2700);
    assert.deepEqual(profile.familyConfig.stages.map((stage) => stage.stageId), ["requirements", "architecture", "tradeoffs", "final_answer"]);
    assert.ok(profile.familyConfig.stages.every((stage) => stage.response.type === "text" && stage.response.required));
    assert.equal(profile.familyConfig.rubric.kind, "self_assessment_reference_only");
    assert.deepEqual(profile.familyConfig.outcomeEvaluation.machineEvaluable, ["response_completeness"]);
    assert.equal(profile.familyConfig.outcomeEvaluation.semanticScoring, "not_evaluated");

    const built = await buildTrack({ rootDirectory, outputRoot, trackId });
    assert.deepEqual(built.artifact.simulationProfiles, validated.simulationProfiles);
    assert.equal(built.lockEntry.sha256, sha256(built.artifactBytes));
  }
});

test("Design simulation availability requires the canonical text profile and does not imply question-bank capacity", async () => {
  const rootDirectory = path.resolve(".");
  const familyConfig = JSON.parse(await readFile(path.join(rootDirectory, "config/families/design_interview.json"), "utf8"));
  const familyMode = familyConfig.modes.find((mode) => mode.modeId === "design-interview-simulation");
  assert.equal(familyMode.contractStatus, "profile_backed_text_simulation_available");
  assert.equal(familyMode.currentExecutableCapacity, 1);
  assert.deepEqual(familyMode.firstBatchEligibleItemCapacityAfterAuthoringByTrack, {
    "backend-system-design-interview": 0,
    "frontend-system-design-interview": 0,
    "object-oriented-design-interview": 0
  });

  for (const trackId of ["backend-system-design-interview", "frontend-system-design-interview", "object-oriented-design-interview"]) {
    const curriculum = JSON.parse(await readFile(path.join(rootDirectory, `config/curricula/${trackId}.json`), "utf8"));
    const feasibility = new Map(curriculum.modeFeasibility.map((mode) => [mode.modeId, mode]));
    const simulation = feasibility.get("design-interview-simulation");
    const [profile] = await loadDesignSimulationProfiles({ rootDirectory, track: { trackId } });
    assert.ok(profile);
    assert.equal(simulation.contractStatus, familyMode.contractStatus);
    assert.equal(simulation.executableCapacity, 1);
    assert.equal(simulation.firstBatchEligibleItemCapacityAfterAuthoring, 0);
    for (const unsupportedModeId of ["design-interview-guided-case", "design-interview-independent-case"]) {
      assert.equal(feasibility.get(unsupportedModeId).contractStatus, "blocked");
    }
    assert.equal(feasibility.get("design-interview-requirements-practice").contractStatus, "choice_compatible_for_requirement_slots_only");
    assert.equal(feasibility.get("design-interview-requirements-practice").executableCapacity, 0);
  }
});

test("malformed Design Interview simulation sources fail closed", async (t) => {
  const sourceRoot = path.resolve(".");
  const track = realCatalog.tracks.find((candidate) => candidate.trackId === "backend-system-design-interview");
  const sourcePath = path.join(sourceRoot, "config/simulation-profiles/design-interview.json");
  const original = JSON.parse(await readFile(sourcePath, "utf8"));
  const rejects = async (mutate, pattern) => {
    const rootDirectory = await mkdtemp(path.join(os.tmpdir(), "patternly-design-profile-invalid-"));
    t.after(() => rm(rootDirectory, { recursive: true, force: true }));
    const config = structuredClone(original);
    mutate(config);
    const configPath = path.join(rootDirectory, "config/simulation-profiles/design-interview.json");
    await mkdir(path.dirname(configPath), { recursive: true });
    await writeFile(configPath, JSON.stringify(config));
    await expectBuildFailure(loadDesignSimulationProfiles({ rootDirectory, track }), pattern);
  };

  await rejects((config) => { config.timer.kind = "foreground_countdown"; }, /absolute deadline/u);
  await rejects((config) => { config.stages[1].response.type = "choice"; }, /require a non-empty text response/u);
  await rejects((config) => { config.stages.reverse(); }, /ordered requirements/u);
  await rejects((config) => { config.outcomeEvaluation.machineEvaluable.push("semantic_quality"); }, /evaluate completeness only/u);
  await rejects((config) => { config.cases[1].trackId = config.cases[0].trackId; }, /duplicate track identity/u);
  await rejects((config) => { config.cases[0].reviewCriteria.pop(); }, /one review criterion per stage/u);
  await rejects((config) => { config.rubric.kind = "machine_scored"; }, /rubric dimensions or use/u);
});

test("malformed present GCP simulation profile fails closed on incomplete node coverage", async (t) => {
  const rootDirectory = await mkdtemp(path.join(os.tmpdir(), "patternly-gcp-profile-invalid-"));
  t.after(() => rm(rootDirectory, { recursive: true, force: true }));
  const sourceRoot = path.resolve(".");
  const validated = await validateTrack({ rootDirectory: sourceRoot, trackId: "google-cloud-associate-cloud-engineer" });
  const configPath = path.join(sourceRoot, "config/tracks/google-cloud-associate-cloud-engineer.json");
  const config = JSON.parse(await readFile(configPath, "utf8"));
  delete config.profile.nodeDomainMap[Object.keys(config.profile.nodeDomainMap)[0]];
  await mkdir(path.join(rootDirectory, "config/tracks"), { recursive: true });
  await mkdir(path.join(rootDirectory, "config/taxonomy"), { recursive: true });
  await writeFile(path.join(rootDirectory, "config/tracks/google-cloud-associate-cloud-engineer.json"), JSON.stringify(config));
  const taxonomy = await readFile(path.join(sourceRoot, config.taxonomyPath), "utf8");
  await writeFile(path.join(rootDirectory, config.taxonomyPath), taxonomy);
  await assert.rejects(
    loadGcpSimulationProfiles({ rootDirectory, track: validated.track, questions: validated.questions }),
    /nodeDomainMap has an invalid shape/u
  );
});

test("existing GCP artifact rejects malformed profile even when its lock SHA is recomputed", async (t) => {
  const rootDirectory = path.resolve(".");
  const outputRoot = await mkdtemp(path.join(os.tmpdir(), "patternly-gcp-profile-existing-"));
  t.after(() => rm(outputRoot, { recursive: true, force: true }));
  const trackId = "google-cloud-associate-cloud-engineer";
  await buildTrack({ rootDirectory, outputRoot, trackId });

  const artifactPath = path.join(outputRoot, `${trackId}.json`);
  const legacyArtifact = JSON.parse(await readFile(artifactPath, "utf8"));
  delete legacyArtifact.simulationProfiles;
  for (const question of legacyArtifact.questions) delete question.contentDomainId;
  const legacyBytes = canonicalJson(legacyArtifact);
  await writeFile(artifactPath, legacyBytes, "utf8");
  const lockPath = path.join(outputRoot, "content-lock.json");
  const legacyLock = JSON.parse(await readFile(lockPath, "utf8"));
  legacyLock.tracks.find((entry) => entry.trackId === trackId).sha256 = sha256(legacyBytes);
  await writeFile(lockPath, canonicalJson(legacyLock), "utf8");
  await buildTrack({ rootDirectory, outputRoot, trackId });

  const artifact = JSON.parse(await readFile(artifactPath, "utf8"));
  artifact.simulationProfiles[0].familyConfig.durationMinutes = 121;
  const artifactBytes = canonicalJson(artifact);
  await writeFile(artifactPath, artifactBytes, "utf8");
  const lock = JSON.parse(await readFile(lockPath, "utf8"));
  lock.tracks.find((entry) => entry.trackId === trackId).sha256 = sha256(artifactBytes);
  await writeFile(lockPath, canonicalJson(lock), "utf8");

  await expectBuildFailure(
    () => buildTrack({ rootDirectory, outputRoot, trackId }),
    /malformed or differ from authoritative config/u
  );
});

test("existing GCP artifact rejects a legal but source-inconsistent node domain when its lock SHA is recomputed", async (t) => {
  const rootDirectory = path.resolve(".");
  const outputRoot = await mkdtemp(path.join(os.tmpdir(), "patternly-gcp-domain-tamper-"));
  t.after(() => rm(outputRoot, { recursive: true, force: true }));
  const trackId = "google-cloud-associate-cloud-engineer";
  await buildTrack({ rootDirectory, outputRoot, trackId });
  const artifactPath = path.join(outputRoot, `${trackId}.json`);
  const artifact = JSON.parse(await readFile(artifactPath, "utf8"));
  const nodeId = Object.entries(artifact.simulationProfiles[0].familyConfig.nodeDomainMap).find(([, domainId]) => domainId === "gcp-ace-standard-domain-3")?.[0];
  assert.ok(nodeId);
  artifact.simulationProfiles[0].familyConfig.nodeDomainMap[nodeId] = "gcp-ace-standard-domain-2";
  const artifactBytes = canonicalJson(artifact);
  await writeFile(artifactPath, artifactBytes, "utf8");
  const lockPath = path.join(outputRoot, "content-lock.json");
  const lock = JSON.parse(await readFile(lockPath, "utf8"));
  lock.tracks.find((entry) => entry.trackId === trackId).sha256 = sha256(artifactBytes);
  await writeFile(lockPath, canonicalJson(lock), "utf8");
  await expectBuildFailure(() => buildTrack({ rootDirectory, outputRoot, trackId }), /malformed or differ from authoritative config/u);
});

test("ACC-02 Candidate Manifest retains its exact nine-track identity against frozen baseline and migration manifest", () => {
  const candidateTracks = [...candidateManifest.tracks].sort((left, right) => left.trackId.localeCompare(right.trackId));
  const baselineTracks = [...historicalBaseline.tracks].sort((left, right) => left.trackId.localeCompare(right.trackId));
  const migrationTracks = [...historicalMigrationManifest.tracks].sort((left, right) => left.trackId.localeCompare(right.trackId));
  assert.deepEqual(candidateTracks.map((track) => track.trackId), [...ACCEPTED_TRACK_IDS].sort());
  assert.deepEqual(baselineTracks.map((track) => track.trackId), [...ACCEPTED_TRACK_IDS].sort());
  assert.deepEqual(migrationTracks.map((track) => track.trackId), [...ACCEPTED_TRACK_IDS].sort());

  for (const candidateTrack of candidateTracks) {
    const baselineTrack = baselineTracks.find((track) => track.trackId === candidateTrack.trackId);
    const migrationTrack = migrationTracks.find((track) => track.trackId === candidateTrack.trackId);
    assert.ok(baselineTrack, candidateTrack.trackId);
    assert.ok(migrationTrack, candidateTrack.trackId);
    const { trackId: _baselineTrackId, ...expectedSource } = baselineTrack;
    assert.deepEqual(candidateTrack.source, expectedSource);
    const { artifact: migrationArtifact, ...migrationSource } = migrationTrack.source;
    const expectedMigrationSource = Object.hasOwn(candidateTrack.source, "contentVersion")
      ? { ...migrationSource, contentVersion: migrationArtifact.contentVersion }
      : migrationSource;
    assert.deepEqual(candidateTrack.source, expectedMigrationSource);
    assert.deepEqual(candidateTrack.artifact, migrationArtifact);
    assert.equal(candidateTrack.source.canonicalItemCount, migrationTrack.counts.questions, candidateTrack.trackId);
  }

  // Current catalog identity is intentionally checked separately from the frozen historical identity above.
  const historicalVersions = new Map(candidateManifest.tracks.map((track) => [track.trackId, track.artifact.contentVersion]));
  for (const track of realCatalog.tracks) {
    if (track.trackId === "aws-certified-solutions-architect-associate") {
      assert.equal(track.contentVersion, ODK096_CONTENT_VERSION, track.trackId);
    } else if (track.trackId === bizq01Copy.trackId) {
      assert.equal(track.contentVersion, bizq01Copy.contentVersion, track.trackId);
    } else if (track.trackId === bizq01Batch.trackId) {
      assert.equal(track.contentVersion, bizq01Batch.contentVersion, track.trackId);
    } else if (track.trackId === bizq01OodReplacement.trackId) {
      assert.equal(track.contentVersion, bizq01OodReplacement.contentVersion, track.trackId);
    } else {
      assert.equal(track.contentVersion, historicalVersions.get(track.trackId), track.trackId);
    }
  }
});

test("canonical JSON sorts recursive object keys without reordering arrays", () => {
  assert.equal(canonicalJson({ "2": "second", "10": "tenth", nested: { b: 2, a: 1 }, list: [{ z: true, a: false }, "kept"] }), '{"10":"tenth","2":"second","list":[{"a":false,"z":true},"kept"],"nested":{"a":1,"b":2}}');
});

test("mutating one track does not rewrite another artifact or lock entry", async (t) => {
  const rootDirectory = await createWorkspace();
  const outputRoot = path.join(rootDirectory, "dist");
  t.after(() => rm(rootDirectory, { recursive: true, force: true }));
  await populateAll(rootDirectory);
  await buildAll({ rootDirectory, outputRoot });

  const untouchedTrackId = ACCEPTED_TRACK_IDS[1];
  const changedTrackId = ACCEPTED_TRACK_IDS[0];
  const untouchedArtifactPath = path.join(outputRoot, `${untouchedTrackId}.json`);
  const changedSourcePath = path.join(rootDirectory, "content", changedTrackId, "node-001", "mental-unit-001.json");
  const beforeUntouchedBytes = await readFile(untouchedArtifactPath, "utf8");
  const beforeUntouchedStat = await stat(untouchedArtifactPath);
  const beforeLock = JSON.parse(await readFile(path.join(outputRoot, "content-lock.json"), "utf8"));
  const [changedQuestion] = JSON.parse(await readFile(changedSourcePath, "utf8"));
  changedQuestion.prompt = "Changed fixture prompt";
  await writeFile(changedSourcePath, `${JSON.stringify([changedQuestion])}\n`, "utf8");

  const rebuilt = await buildAll({ rootDirectory, outputRoot });
  const afterUntouchedBytes = await readFile(untouchedArtifactPath, "utf8");
  const afterUntouchedStat = await stat(untouchedArtifactPath);
  const afterLock = JSON.parse(await readFile(path.join(outputRoot, "content-lock.json"), "utf8"));
  assert.equal(afterUntouchedBytes, beforeUntouchedBytes);
  assert.equal(afterUntouchedStat.mtimeNs, beforeUntouchedStat.mtimeNs);
  assert.deepEqual(afterLock.tracks.find((entry) => entry.trackId === untouchedTrackId), beforeLock.tracks.find((entry) => entry.trackId === untouchedTrackId));
  assert.notEqual(rebuilt.lock.tracks.find((entry) => entry.trackId === changedTrackId).sha256, beforeLock.tracks.find((entry) => entry.trackId === changedTrackId).sha256);
});

test("builder rejects missing, empty, unknown and malformed inputs", async (t) => {
  const missingRoot = await createWorkspace();
  t.after(() => rm(missingRoot, { recursive: true, force: true }));
  await expectBuildFailure(() => validateTrack({ rootDirectory: missingRoot, trackId: ACCEPTED_TRACK_IDS[0] }), /Missing source directory/);

  const emptyRoot = await createWorkspace();
  t.after(() => rm(emptyRoot, { recursive: true, force: true }));
  await mkdir(path.join(emptyRoot, "content", ACCEPTED_TRACK_IDS[0]), { recursive: true });
  await expectBuildFailure(() => validateTrack({ rootDirectory: emptyRoot, trackId: ACCEPTED_TRACK_IDS[0] }), /Source directory is empty/);

  const unknownRoot = await createWorkspace();
  t.after(() => rm(unknownRoot, { recursive: true, force: true }));
  await expectBuildFailure(() => validateTrack({ rootDirectory: unknownRoot, trackId: "unknown-track" }), /Unknown track/);

  const malformedCatalogRoot = await createWorkspace();
  t.after(() => rm(malformedCatalogRoot, { recursive: true, force: true }));
  await writeFile(path.join(malformedCatalogRoot, "content/catalog.json"), "{\n", "utf8");
  await expectBuildFailure(() => validateTrack({ rootDirectory: malformedCatalogRoot, trackId: ACCEPTED_TRACK_IDS[0] }), /Cannot load content\/catalog/);
});

test("builder requires each mental-unit source file to be a non-empty question array", async (t) => {
  const rootDirectory = await createWorkspace();
  t.after(() => rm(rootDirectory, { recursive: true, force: true }));
  const trackId = ACCEPTED_TRACK_IDS[0];
  const filePath = path.join(rootDirectory, "content", trackId, "node-001", "mental-unit-001.json");
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(questionFor(trackId))}\n`, "utf8");
  await expectBuildFailure(() => validateTrack({ rootDirectory, trackId }), /non-empty question array/);
  await writeFile(filePath, "[]\n", "utf8");
  await expectBuildFailure(() => validateTrack({ rootDirectory, trackId }), /non-empty question array/);
});

test("builder rejects path identity, foreign track, duplicate and invalid questions", async (t) => {
  const rootDirectory = await createWorkspace();
  t.after(() => rm(rootDirectory, { recursive: true, force: true }));
  const trackId = ACCEPTED_TRACK_IDS[0];

  const mismatched = questionFor(trackId);
  mismatched.nodeId = "other-node";
  await writeTrackQuestion(rootDirectory, trackId, mismatched, { nodeId: "node-001" });
  await expectBuildFailure(() => validateTrack({ rootDirectory, trackId }), /identity does not match source path/);
  await rm(path.join(rootDirectory, "content", trackId), { recursive: true, force: true });

  const foreign = questionFor(ACCEPTED_TRACK_IDS[1]);
  await writeTrackQuestion(rootDirectory, trackId, foreign);
  await expectBuildFailure(() => validateTrack({ rootDirectory, trackId }), /foreign trackId/);
  await rm(path.join(rootDirectory, "content", trackId), { recursive: true, force: true });

  const first = questionFor(trackId, "duplicate");
  await writeTrackQuestion(rootDirectory, trackId, first);
  const second = structuredClone(first);
  second.nodeId = "node-002";
  await writeTrackQuestion(rootDirectory, trackId, second, { nodeId: "node-002" });
  await expectBuildFailure(() => validateTrack({ rootDirectory, trackId }), /Duplicate questionId/);
  await rm(path.join(rootDirectory, "content", trackId), { recursive: true, force: true });

  const invalid = questionFor(trackId);
  delete invalid.questionId;
  await writeTrackQuestion(rootDirectory, trackId, invalid);
  await expectBuildFailure(() => validateTrack({ rootDirectory, trackId }), /Invalid question/);
});

test("existing malformed lock is rejected before a single-track build", async (t) => {
  const rootDirectory = await createWorkspace();
  const outputRoot = path.join(rootDirectory, "dist");
  t.after(() => rm(rootDirectory, { recursive: true, force: true }));
  await writeTrackQuestion(rootDirectory, ACCEPTED_TRACK_IDS[0]);
  await mkdir(outputRoot, { recursive: true });
  await writeFile(path.join(outputRoot, "content-lock.json"), JSON.stringify({ schemaVersion: LOCK_SCHEMA_VERSION, tracks: [{ trackId: ACCEPTED_TRACK_IDS[0] }] }), "utf8");
  await expectBuildFailure(() => buildTrack({ rootDirectory, outputRoot, trackId: ACCEPTED_TRACK_IDS[0] }), /invalid shape/);
});

test("source discovery rejects a symlinked track, node directory, or question file", async (t) => {
  const trackId = ACCEPTED_TRACK_IDS[0];

  const trackRoot = await createWorkspace();
  t.after(() => rm(trackRoot, { recursive: true, force: true }));
  const trackTarget = path.join(trackRoot, "outside-track");
  await writeQuestionFile(path.join(trackTarget, "node-001", "mental-unit-001.json"), questionFor(trackId));
  await symlink(trackTarget, path.join(trackRoot, "content", trackId), "dir");
  await expectBuildFailure(() => validateTrack({ rootDirectory: trackRoot, trackId }), /Symbolic links are not allowed/);

  const nodeRoot = await createWorkspace();
  t.after(() => rm(nodeRoot, { recursive: true, force: true }));
  const trackPath = path.join(nodeRoot, "content", trackId);
  const nodeTarget = path.join(nodeRoot, "outside-node");
  await writeQuestionFile(path.join(nodeTarget, "mental-unit-001.json"), questionFor(trackId));
  await mkdir(trackPath, { recursive: true });
  await symlink(nodeTarget, path.join(trackPath, "node-001"), "dir");
  await expectBuildFailure(() => validateTrack({ rootDirectory: nodeRoot, trackId }), /Symbolic links are not allowed/);

  const fileRoot = await createWorkspace();
  t.after(() => rm(fileRoot, { recursive: true, force: true }));
  const fileTrackPath = path.join(fileRoot, "content", trackId, "node-001");
  const fileTarget = path.join(fileRoot, "outside-question.json");
  await writeQuestionFile(fileTarget, questionFor(trackId));
  await mkdir(fileTrackPath, { recursive: true });
  await symlink(fileTarget, path.join(fileTrackPath, "mental-unit-001.json"), "file");
  await expectBuildFailure(() => validateTrack({ rootDirectory: fileRoot, trackId }), /Symbolic links are not allowed/);
});

test("a tampered existing artifact blocks another track before any write", async (t) => {
  const rootDirectory = await createWorkspace();
  const outputRoot = path.join(rootDirectory, "dist");
  t.after(() => rm(rootDirectory, { recursive: true, force: true }));
  await populateAll(rootDirectory);
  await buildAll({ rootDirectory, outputRoot });
  const tamperedTrackId = ACCEPTED_TRACK_IDS[0];
  const otherTrackId = ACCEPTED_TRACK_IDS[1];
  const tamperedPath = path.join(outputRoot, `${tamperedTrackId}.json`);
  const otherArtifactPath = path.join(outputRoot, `${otherTrackId}.json`);
  const lockPath = path.join(outputRoot, "content-lock.json");
  const beforeOther = await readFile(otherArtifactPath, "utf8");
  const beforeLock = await readFile(lockPath, "utf8");
  await writeFile(tamperedPath, `${await readFile(tamperedPath, "utf8")}\n`, "utf8");
  await expectBuildFailure(() => buildTrack({ rootDirectory, outputRoot, trackId: otherTrackId }), /checksum mismatch|not canonical/);
  assert.equal(await readFile(otherArtifactPath, "utf8"), beforeOther);
  assert.equal(await readFile(lockPath, "utf8"), beforeLock);
});

test("single-track build rejects orphan artifacts and temporary outputs before writing any target", async (t) => {
  const rootDirectory = await createWorkspace();
  const outputRoot = path.join(rootDirectory, "dist");
  const sameTrackId = ACCEPTED_TRACK_IDS[0];
  const otherTrackId = ACCEPTED_TRACK_IDS[1];
  t.after(() => rm(rootDirectory, { recursive: true, force: true }));
  await writeTrackQuestion(rootDirectory, sameTrackId);
  await writeTrackQuestion(rootDirectory, otherTrackId);
  await buildTrack({ rootDirectory, outputRoot, trackId: sameTrackId });
  const artifactPath = path.join(outputRoot, `${sameTrackId}.json`);
  const lockPath = path.join(outputRoot, "content-lock.json");
  const temporaryPath = path.join(outputRoot, `${sameTrackId}.json.partial.tmp`);
  const artifactBefore = await readFile(artifactPath, "utf8");
  await rm(lockPath);
  await writeFile(temporaryPath, "partial output", "utf8");
  for (const trackId of [sameTrackId, otherTrackId]) {
    await expectBuildFailure(() => buildTrack({ rootDirectory, outputRoot, trackId }), /Unexpected existing output|no lock entry/);
    assert.equal(await readFile(artifactPath, "utf8"), artifactBefore);
    assert.equal(await readFile(temporaryPath, "utf8"), "partial output");
    assert.equal((await readdir(outputRoot)).includes("content-lock.json"), false);
  }
  await rm(artifactPath);
  await expectBuildFailure(() => buildTrack({ rootDirectory, outputRoot, trackId: otherTrackId }), /Unexpected existing output/);
  assert.equal(await readFile(temporaryPath, "utf8"), "partial output");
});

test("single-track build rejects a symlinked output root without external writes", async (t) => {
  const rootDirectory = await createWorkspace();
  const externalRoot = await mkdtemp(path.join(os.tmpdir(), "patternly-simp02-output-"));
  const outputRoot = path.join(rootDirectory, "dist");
  const markerPath = path.join(externalRoot, "marker.txt");
  const trackId = ACCEPTED_TRACK_IDS[0];
  t.after(() => rm(rootDirectory, { recursive: true, force: true }));
  t.after(() => rm(externalRoot, { recursive: true, force: true }));
  await writeTrackQuestion(rootDirectory, trackId);
  await writeFile(markerPath, "untouched", "utf8");
  await symlink(externalRoot, outputRoot, "dir");
  await expectBuildFailure(() => buildTrack({ rootDirectory, outputRoot, trackId }), /Symbolic links are not allowed in output root/);
  assert.equal(await readFile(markerPath, "utf8"), "untouched");
});

test("single-track output commit rolls back both files on an injected second rename failure", async (t) => {
  const rootDirectory = await createWorkspace();
  const outputRoot = path.join(rootDirectory, "dist");
  const trackId = ACCEPTED_TRACK_IDS[0];
  t.after(() => rm(rootDirectory, { recursive: true, force: true }));
  await writeTrackQuestion(rootDirectory, trackId);
  await buildTrack({ rootDirectory, outputRoot, trackId });
  const artifactPath = path.join(outputRoot, `${trackId}.json`);
  const lockPath = path.join(outputRoot, "content-lock.json");
  const previousArtifact = await readFile(artifactPath, "utf8");
  const previousLock = await readFile(lockPath, "utf8");
  const sourcePath = path.join(rootDirectory, "content", trackId, "node-001", "mental-unit-001.json");
  const [changed] = JSON.parse(await readFile(sourcePath, "utf8"));
  changed.prompt = "Changed for rollback fixture";
  await writeFile(sourcePath, JSON.stringify([changed]), "utf8");
  let renameCalls = 0;
  const fileOps = {
    rename: async (...args) => {
      renameCalls += 1;
      if (renameCalls === 2) throw new Error("injected second rename failure");
      return fsRename(...args);
    }
  };
  await expectBuildFailure(() => buildTrack({ rootDirectory, outputRoot, trackId, fileOps }), /previous outputs were restored/);
  assert.equal(await readFile(artifactPath, "utf8"), previousArtifact);
  assert.equal(await readFile(lockPath, "utf8"), previousLock);
  assert.deepEqual((await readdir(outputRoot)).filter((name) => name.endsWith(".tmp")), []);
  await buildTrack({ rootDirectory, outputRoot, trackId });
  assert.notEqual(await readFile(artifactPath, "utf8"), previousArtifact);
});

test("build-all stages and rolls back the complete new output set on rename failure", async (t) => {
  const rootDirectory = await createWorkspace();
  const outputRoot = path.join(rootDirectory, "dist");
  t.after(() => rm(rootDirectory, { recursive: true, force: true }));
  await populateAll(rootDirectory);
  let renameCalls = 0;
  const fileOps = {
    rename: async (...args) => {
      renameCalls += 1;
      if (renameCalls === 3) throw new Error("injected build-all rename failure");
      return fsRename(...args);
    }
  };
  await expectBuildFailure(() => buildAll({ rootDirectory, outputRoot, fileOps }), /previous outputs were restored/);
  assert.deepEqual(await readdir(outputRoot), []);
  await buildAll({ rootDirectory, outputRoot });
  assert.equal((await readdir(outputRoot)).length, 10);
});

test("CLI parser requires track for single-track commands and rejects it for build-all", () => {
  assert.throws(() => parseArgs(["validate"]), /--track is required/);
  assert.throws(() => parseArgs(["build-all", "--track", ACCEPTED_TRACK_IDS[0]]), /not accepted for build-all/);
  assert.deepEqual(parseArgs(["build", "--track", ACCEPTED_TRACK_IDS[0], "--root", "/tmp/root", "--output-root", "/tmp/out"]), {
    command: "build",
    trackId: ACCEPTED_TRACK_IDS[0],
    root: "/tmp/root",
    outputRoot: "/tmp/out"
  });
});

test("CLI executes a hermetic single-track validate/test/build", async (t) => {
  const rootDirectory = await createWorkspace();
  const outputRoot = path.join(rootDirectory, "dist");
  const trackId = ACCEPTED_TRACK_IDS[0];
  t.after(() => rm(rootDirectory, { recursive: true, force: true }));
  await writeTrackQuestion(rootDirectory, trackId);
  const common = ["--root", rootDirectory];
  const validate = await execFileAsync(process.execPath, [builderPath.pathname, "validate", "--track", trackId, ...common], { cwd: rootDirectory });
  assert.match(validate.stdout, /Validated 1 question/);
  const contentTest = await execFileAsync(process.execPath, [builderPath.pathname, "test", "--track", trackId, ...common], { cwd: rootDirectory });
  assert.match(contentTest.stdout, /Tested 1 canonical answer/);
  const build = await execFileAsync(process.execPath, [builderPath.pathname, "build", "--track", trackId, ...common, "--output-root", outputRoot], { cwd: rootDirectory });
  assert.match(build.stdout, /Built/);
  assert.equal((await readFile(path.join(outputRoot, `${trackId}.json`), "utf8")).endsWith("\n"), false);
});
