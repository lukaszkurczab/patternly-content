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
  await writeFile(filePath, `${JSON.stringify(question, null, 2)}\n`, "utf8");
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

test("catalog contentVersion values match the ACC-02 Candidate Manifest evidence", () => {
  const versions = new Map(candidateManifest.tracks.map((track) => [track.trackId, track.artifact.contentVersion]));
  for (const track of realCatalog.tracks) assert.equal(track.contentVersion, versions.get(track.trackId), track.trackId);
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
  const changedQuestion = JSON.parse(await readFile(changedSourcePath, "utf8"));
  changedQuestion.prompt = "Changed fixture prompt";
  await writeFile(changedSourcePath, `${JSON.stringify(changedQuestion)}\n`, "utf8");

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
  const changed = JSON.parse(await readFile(sourcePath, "utf8"));
  changed.prompt = "Changed for rollback fixture";
  await writeFile(sourcePath, JSON.stringify(changed), "utf8");
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
