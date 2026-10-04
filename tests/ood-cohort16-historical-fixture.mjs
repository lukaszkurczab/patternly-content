import assert from "node:assert/strict";
import { readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { sha256 } from "../scripts/build.mjs";

const proofRelativePath = "evidence/business-quality/bizq-01-ood-node-closure-16.json";
const reasonAmendment19aProofPath = "evidence/business-quality/bizq-01-ood-reason-amendment-19a.json";
const ood19Version = "object-oriented-design-interview-authoring-v2026.10.04-bizq01-19";
const ood19aVersion = "object-oriented-design-interview-authoring-v2026.10.04-bizq01-19a";

/** Restore v19 question objects before exercising their immutable historical guards. */
export async function restoreOodSource19Fixture(repositoryRoot, fixtureRoot) {
  const catalogPath = path.join(fixtureRoot, "content/catalog.json");
  const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
  const track = catalog.tracks.find((entry) => entry.trackId === "object-oriented-design-interview");
  if (track.contentVersion === ood19Version) return;
  assert.equal(track.contentVersion, ood19aVersion);
  const proof = JSON.parse(await readFile(path.join(repositoryRoot, reasonAmendment19aProofPath), "utf8"));
  assert.equal(proof.beforeContentVersion, ood19Version);
  assert.equal(proof.contentVersion, track.contentVersion);
  assert.equal(proof.sourceFiles.length, 3);
  assert.equal(proof.replacements.length, 25);
  for (const source of proof.sourceFiles) {
    const target = path.join(fixtureRoot, source.sourceFile);
    const currentBytes = await readFile(target);
    assert.equal(sha256(currentBytes), source.sourceSha256, `${source.sourceFile} exact source19a input`);
    const current = JSON.parse(currentBytes);
    const corrections = proof.replacements.filter((item) => item.sourceFile === source.sourceFile);
    const correctionById = new Map(corrections.map((item) => [item.questionId, item]));
    for (const item of corrections) {
      const question = current.find((candidate) => candidate.questionId === item.questionId);
      assert.ok(question, `${item.questionId} exists in source19a`);
      assert.equal(sha256(question), item.questionSha256, `${item.questionId} exact source19a object`);
      assert.equal(question.mentalUnitId, item.mentalUnitId);
      assert.equal(question.feedback?.reason, item.reason);
      question.feedback.reason = item.beforeReason;
      assert.equal(sha256(question), item.beforeQuestionSha256, `${item.questionId} exact source19 object`);
    }
    assert.equal(corrections.length, source.mentalUnitId === "OOD-N03-B02" ? 16 : source.mentalUnitId === "OOD-N03-B03" ? 8 : 1);
    assert.equal(correctionById.size, corrections.length);
    const bytes = Buffer.from(JSON.stringify(current), "utf8");
    assert.equal(sha256(bytes), source.beforeSourceSha256, `${source.sourceFile} byte-exact source19 predecessor`);
    await writeFile(target, bytes);
  }
  track.contentVersion = ood19Version;
  await writeFile(catalogPath, `${JSON.stringify(catalog)}\n`, "utf8");
  await rm(path.join(fixtureRoot, reasonAmendment19aProofPath), { force: true });
}

/** Restore accepted source17 bytes before exercising its immutable historical guards. */
export async function restoreOodSource17Fixture(repositoryRoot, fixtureRoot) {
  const catalogPath = path.join(fixtureRoot, "content/catalog.json");
  const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
  const track = catalog.tracks.find((entry) => entry.trackId === "object-oriented-design-interview");
  const source17Version = "object-oriented-design-interview-authoring-v2026.10.04-bizq01-17";
  if (track.contentVersion === source17Version) return;
  if (track.contentVersion === ood19aVersion) {
    await restoreOodSource19Fixture(repositoryRoot, fixtureRoot);
  }
  const after19aCatalog = JSON.parse(await readFile(catalogPath, "utf8"));
  const after19aTrack = after19aCatalog.tracks.find((entry) => entry.trackId === "object-oriented-design-interview");
  assert.equal(after19aTrack.contentVersion, ood19Version);
  const source19ProofPath = "evidence/business-quality/bizq-01-ood-node-closure-19.json";
  const proof = JSON.parse(await readFile(path.join(repositoryRoot, source19ProofPath), "utf8"));
  assert.equal(proof.beforeContentVersion, source17Version);
  assert.equal(proof.contentVersion, after19aTrack.contentVersion);
  assert.equal(proof.sourceFiles.length, 9);
  assert.equal(proof.replacements.length, 162);
  for (const source of proof.sourceFiles) {
    const target = path.join(fixtureRoot, source.sourceFile);
    const currentBytes = await readFile(target);
    assert.equal(sha256(currentBytes), source.sourceSha256, `${source.sourceFile} exact source19 input`);
    const current = JSON.parse(currentBytes);
    const replacements = proof.replacements.filter((item) => item.sourceFile === source.sourceFile);
    assert.equal(replacements.length, 18);
    const replacedIds = new Set(replacements.map((item) => item.questionId));
    const predecessor = current.filter((question) => !replacedIds.has(question.questionId))
      .concat(replacements.map((item) => item.beforeQuestion))
      .sort((left, right) => left.questionId.localeCompare(right.questionId));
    const bytes = Buffer.from(JSON.stringify(predecessor), "utf8");
    assert.equal(sha256(bytes), source.beforeSourceSha256, `${source.sourceFile} byte-exact source17 predecessor`);
    await writeFile(target, bytes);
  }
  track.contentVersion = source17Version;
  await writeFile(catalogPath, `${JSON.stringify(catalog)}\n`, "utf8");
  await rm(path.join(fixtureRoot, source19ProofPath), { force: true });
}

/** Restore accepted source16 before exercising its immutable historical guards. */
export async function restoreOodSource16Fixture(repositoryRoot, fixtureRoot) {
  const currentCatalog = JSON.parse(await readFile(path.join(fixtureRoot, "content/catalog.json"), "utf8"));
  const currentVersion = currentCatalog.tracks.find((entry) => entry.trackId === "object-oriented-design-interview").contentVersion;
  if (currentVersion === ood19aVersion || currentVersion === ood19Version) {
    await restoreOodSource17Fixture(repositoryRoot, fixtureRoot);
  }
  const catalogPath = path.join(fixtureRoot, "content/catalog.json");
  const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
  const track = catalog.tracks.find((entry) => entry.trackId === "object-oriented-design-interview");
  const source16Version = "object-oriented-design-interview-authoring-v2026.10.03-bizq01-16";
  if (track.contentVersion === source16Version) return;
  assert.equal(track.contentVersion, "object-oriented-design-interview-authoring-v2026.10.04-bizq01-17");
  const source17ProofPath = "evidence/business-quality/bizq-01-ood-node-closure-17.json";
  const proof = JSON.parse(await readFile(path.join(repositoryRoot, source17ProofPath), "utf8"));
  assert.equal(proof.beforeContentVersion, source16Version);
  assert.equal(proof.contentVersion, track.contentVersion);
  assert.equal(proof.sourceFiles.length, 8);
  assert.equal(proof.replacements.length, 152);
  for (const source of proof.sourceFiles) {
    const target = path.join(fixtureRoot, source.sourceFile);
    const currentBytes = await readFile(target);
    assert.equal(sha256(currentBytes), source.sourceSha256, `${source.sourceFile} exact source17 input`);
    const current = JSON.parse(currentBytes);
    const replacements = proof.replacements.filter((item) => item.sourceFile === source.sourceFile);
    assert.equal(replacements.length, 19);
    const replacedIds = new Set(replacements.map((item) => item.questionId));
    const predecessor = current.filter((question) => !replacedIds.has(question.questionId))
      .concat(replacements.map((item) => item.beforeQuestion))
      .sort((left, right) => left.questionId.localeCompare(right.questionId));
    const bytes = Buffer.from(JSON.stringify(predecessor), "utf8");
    assert.equal(sha256(bytes), source.beforeSourceSha256, `${source.sourceFile} byte-exact source16 predecessor`);
    await writeFile(target, bytes);
  }
  track.contentVersion = source16Version;
  await writeFile(catalogPath, `${JSON.stringify(catalog)}\n`, "utf8");
  await rm(path.join(fixtureRoot, source17ProofPath), { force: true });
}

/**
 * Restore the byte-exact source13 OOD generation for immutable historical tests.
 * The seven source arrays in that generation use JSON.stringify without a final newline.
 */
export async function restoreOodSource13Fixture(repositoryRoot, fixtureRoot) {
  await restoreOodSource16Fixture(repositoryRoot, fixtureRoot);
  const proof = JSON.parse(await readFile(path.join(repositoryRoot, proofRelativePath), "utf8"));
  const sources = new Map(proof.sourceFiles.map((source) => [source.sourceFile, source]));
  for (const source of proof.sourceFiles) {
    const sourcePath = path.join(fixtureRoot, "content", source.sourceFile.replace(/^content\//u, ""));
    const current = JSON.parse(await readFile(sourcePath, "utf8"));
    const replacements = proof.replacements.filter((item) => item.sourceFile === source.sourceFile);
    const replacementIds = new Set(replacements.map((item) => item.questionId));
    const predecessor = current
      .filter((question) => !replacementIds.has(question.questionId))
      .concat(replacements.map((item) => item.beforeQuestion))
      .sort((left, right) => left.questionId.localeCompare(right.questionId));
    const bytes = Buffer.from(JSON.stringify(predecessor), "utf8");
    assert.equal(sha256(bytes), source.beforeSourceSha256, `${source.sourceFile} byte-exact source13 predecessor`);
    await writeFile(sourcePath, bytes);
  }
  assert.equal(sources.size, 7);
  const catalogPath = path.join(fixtureRoot, "content/catalog.json");
  const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
  catalog.tracks.find((track) => track.trackId === proof.trackId).contentVersion = proof.beforeContentVersion;
  await writeFile(catalogPath, `${JSON.stringify(catalog)}\n`, "utf8");
  await rm(path.join(fixtureRoot, proofRelativePath), { force: true });
}
