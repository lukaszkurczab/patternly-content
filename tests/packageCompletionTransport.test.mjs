import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { loadCanonicalCatalog, loadCanonicalFixture, validateCatalog } from "../scripts/content/question-contract.mjs";
import { ContentBuildError, buildTrack, canonicalJson, sha256 } from "../scripts/build.mjs";

const rule = Object.freeze({
  ruleVersion: 1,
  minimumAttemptCount: 8,
  rollingWindowSize: 5,
  qualityThreshold: 0.8
});
const trackId = "aws-certified-solutions-architect-associate";

async function workspace(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), "patternly-bizq02-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "content", trackId, "node-001"), { recursive: true });
  const catalog = loadCanonicalCatalog();
  await writeFile(path.join(root, "content", "catalog.json"), `${canonicalJson(catalog)}\n`);
  const question = structuredClone(loadCanonicalFixture().fixture.questions[0]);
  question.questionId = `${trackId}-q-001`;
  question.trackId = trackId;
  question.nodeId = "node-001";
  question.mentalUnitId = "unit-001";
  await writeFile(path.join(root, "content", trackId, "node-001", "unit-001.json"), `${JSON.stringify([question], null, 2)}\n`);
  return { root, catalog };
}

test("catalog accepts a valid optional package completion rule and rejects malformed or null rules", () => {
  const catalog = loadCanonicalCatalog();
  const track = catalog.tracks.find((entry) => entry.trackId === trackId);
  track.completionRule = { ...rule };
  assert.equal(validateCatalog(catalog).valid, true);
  for (const invalid of [null, { ...rule, ruleVersion: 2 }, { ...rule, minimumAttemptCount: 4 }, { ...rule, qualityThreshold: 1.1 }, { ...rule, extra: true }]) {
    track.completionRule = invalid;
    assert.equal(validateCatalog(catalog).valid, false);
  }
});

test("builder transports the exact source rule, hashes it, and omits it when absent", async (t) => {
  const { root, catalog } = await workspace(t);
  const track = catalog.tracks.find((entry) => entry.trackId === trackId);
  track.completionRule = { ...rule };
  await writeFile(path.join(root, "content", "catalog.json"), `${canonicalJson(catalog)}\n`);
  const built = await buildTrack({ rootDirectory: root, trackId });
  assert.deepEqual(built.artifact.completionRule, rule);
  assert.equal(built.lockEntry.sha256, sha256(built.artifactBytes));

  const absentRoot = await mkdtemp(path.join(os.tmpdir(), "patternly-bizq02-absent-"));
  t.after(() => rm(absentRoot, { recursive: true, force: true }));
  await mkdir(path.join(absentRoot, "content", trackId, "node-001"), { recursive: true });
  const absentCatalog = loadCanonicalCatalog();
  await writeFile(path.join(absentRoot, "content", "catalog.json"), `${canonicalJson(absentCatalog)}\n`);
  const absentQuestion = structuredClone(loadCanonicalFixture().fixture.questions[0]);
  absentQuestion.questionId = `${trackId}-q-001`;
  absentQuestion.trackId = trackId;
  absentQuestion.nodeId = "node-001";
  absentQuestion.mentalUnitId = "unit-001";
  await writeFile(path.join(absentRoot, "content", trackId, "node-001", "unit-001.json"), `${JSON.stringify([absentQuestion])}\n`);
  const absent = await buildTrack({ rootDirectory: absentRoot, trackId });
  assert.equal(Object.hasOwn(absent.artifact, "completionRule"), false);
});

test("existing artifact rule must agree with catalog even after checksum is recomputed", async (t) => {
  const { root, catalog } = await workspace(t);
  const track = catalog.tracks.find((entry) => entry.trackId === trackId);
  track.completionRule = { ...rule };
  await writeFile(path.join(root, "content", "catalog.json"), `${canonicalJson(catalog)}\n`);
  const first = await buildTrack({ rootDirectory: root, trackId });
  const artifactPath = first.artifactPath;
  const lockPath = first.lockPath;
  for (const tamper of [
    (artifact) => { delete artifact.completionRule; },
    (artifact) => { artifact.completionRule = null; },
    (artifact) => { artifact.completionRule = { ...rule, qualityThreshold: 0.7 }; }
  ]) {
    const artifact = JSON.parse(await readFile(artifactPath, "utf8"));
    tamper(artifact);
    const bytes = canonicalJson(artifact);
    await writeFile(artifactPath, bytes);
    const lock = JSON.parse(await readFile(lockPath, "utf8"));
    lock.tracks[0].sha256 = sha256(bytes);
    await writeFile(lockPath, canonicalJson(lock));
    await assert.rejects(buildTrack({ rootDirectory: root, trackId }), (error) => {
      assert.ok(error instanceof ContentBuildError);
      assert.match(error.message, /completionRule/);
      return true;
    });
  }
});
