import assert from "node:assert/strict";
import { readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { sha256 } from "../scripts/build.mjs";

const proofRelativePath = "evidence/business-quality/bizq-01-ood-node-closure-16.json";
const reasonAmendment19aProofPath = "evidence/business-quality/bizq-01-ood-reason-amendment-19a.json";
const ood20ProofPath = "evidence/business-quality/bizq-01-ood-node-closure-20.json";
const ood21ProofPath = "evidence/business-quality/bizq-01-ood-node-closure-21.json";
const ood22ProofPath = "evidence/business-quality/bizq-01-ood-node-closure-22.json";
const ood23ProofPath = "evidence/business-quality/bizq-01-ood-node-closure-23.json";
const ood20Version = "object-oriented-design-interview-authoring-v2026.10.04-bizq01-20";
const ood21Version = "object-oriented-design-interview-authoring-v2026.10.04-bizq01-21";
const ood22Version = "object-oriented-design-interview-authoring-v2026.10.04-bizq01-22";
const ood23Version = "object-oriented-design-interview-authoring-v2026.10.05-bizq01-23";
const ood19Version = "object-oriented-design-interview-authoring-v2026.10.04-bizq01-19";
const ood19aVersion = "object-oriented-design-interview-authoring-v2026.10.04-bizq01-19a";

/** Restore exact v22 source bytes when historical tests start from the live v23 generation. */
export async function restoreOodSource22Fixture(repositoryRoot, fixtureRoot) {
  const catalogPath = path.join(fixtureRoot, "content/catalog.json");
  const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
  const track = catalog.tracks.find((entry) => entry.trackId === "object-oriented-design-interview");
  if (track.contentVersion === ood22Version) return;
  assert.equal(track.contentVersion, ood23Version);
  const proof = JSON.parse(await readFile(path.join(repositoryRoot, ood23ProofPath), "utf8"));
  assert.equal(proof.beforeContentVersion, ood22Version);
  assert.equal(proof.contentVersion, track.contentVersion);
  assert.equal(proof.sourceFiles.length, 8);
  assert.equal(proof.replacements.length, 34);
  assert.equal(proof.sameIdCorrections.length, 110);
  for (const source of proof.sourceFiles) {
    const target = path.join(fixtureRoot, source.sourceFile);
    const currentBytes = await readFile(target);
    assert.equal(sha256(currentBytes), source.sourceSha256, `${source.sourceFile} exact source23 input`);
    const current = JSON.parse(currentBytes);
    const beforeByCurrentId = new Map();
    for (const item of [...proof.replacements, ...proof.sameIdCorrections].filter((candidate) => candidate.sourceFile === source.sourceFile)) {
      const question = current.find((candidate) => candidate.questionId === item.questionId);
      assert.ok(question, `${item.questionId} exists in source23`);
      assert.equal(JSON.stringify(question), JSON.stringify(item.currentQuestion), `${item.questionId} exact source23 object`);
      beforeByCurrentId.set(item.questionId, item.beforeQuestion);
    }
    const predecessor = current.map((question) => beforeByCurrentId.get(question.questionId) ?? question)
      .sort((left, right) => left.questionId.localeCompare(right.questionId));
    const bytes = Buffer.from(JSON.stringify(predecessor), "utf8");
    assert.equal(sha256(bytes), source.beforeSourceSha256, `${source.sourceFile} byte-exact v22 predecessor`);
    await writeFile(target, bytes);
  }
  track.contentVersion = proof.beforeContentVersion;
  await writeFile(catalogPath, `${JSON.stringify(catalog)}\n`, "utf8");
  await rm(path.join(fixtureRoot, ood23ProofPath), { force: true });
}

/** Restore exact v21 source bytes when historical tests start from the live v22 generation. */
export async function restoreOodSource21Fixture(repositoryRoot, fixtureRoot) {
  const catalogPath = path.join(fixtureRoot, "content/catalog.json");
  const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
  const track = catalog.tracks.find((entry) => entry.trackId === "object-oriented-design-interview");
  if (track.contentVersion === ood21Version) return;
  if (track.contentVersion === ood23Version) await restoreOodSource22Fixture(repositoryRoot, fixtureRoot);
  const currentCatalog = JSON.parse(await readFile(catalogPath, "utf8"));
  const currentTrack = currentCatalog.tracks.find((entry) => entry.trackId === "object-oriented-design-interview");
  assert.equal(currentTrack.contentVersion, ood22Version);
  const proof = JSON.parse(await readFile(path.join(repositoryRoot, ood22ProofPath), "utf8"));
  assert.equal(proof.beforeContentVersion, ood21Version);
  assert.equal(proof.contentVersion, currentTrack.contentVersion);
  assert.equal(proof.sourceFiles.length, 10);
  assert.equal(proof.replacements.length, 0);
  assert.equal(proof.sameIdCorrections.length, 180);
  for (const source of proof.sourceFiles) {
    const target = path.join(fixtureRoot, source.sourceFile);
    const currentBytes = await readFile(target);
    assert.equal(sha256(currentBytes), source.sourceSha256, `${source.sourceFile} exact source22 input`);
    const current = JSON.parse(currentBytes);
    const previousById = new Map();
    for (const item of proof.sameIdCorrections.filter((candidate) => candidate.sourceFile === source.sourceFile)) {
      const question = current.find((candidate) => candidate.questionId === item.questionId);
      assert.ok(question, `${item.questionId} exists in source22`);
      assert.equal(JSON.stringify(question), JSON.stringify(item.currentQuestion), `${item.questionId} exact source22 object`);
      assert.equal(item.beforeQuestionId, item.questionId, `${item.questionId} preserves its source identity`);
      previousById.set(item.questionId, item.beforeQuestion);
    }
    const predecessor = current.map((question) => previousById.get(question.questionId) ?? question)
      .sort((left, right) => left.questionId.localeCompare(right.questionId));
    const bytes = Buffer.from(JSON.stringify(predecessor), "utf8");
    assert.equal(sha256(bytes), source.beforeSourceSha256, `${source.sourceFile} byte-exact v21 predecessor`);
    await writeFile(target, bytes);
  }
  currentTrack.contentVersion = proof.beforeContentVersion;
  await writeFile(catalogPath, `${JSON.stringify(currentCatalog)}\n`, "utf8");
  await rm(path.join(fixtureRoot, ood22ProofPath), { force: true });
}

/** Restore exact v20 source bytes when historical tests start from the live v21 generation. */
export async function restoreOodSource20Fixture(repositoryRoot, fixtureRoot) {
  const catalogPath = path.join(fixtureRoot, "content/catalog.json");
  const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
  const track = catalog.tracks.find((entry) => entry.trackId === "object-oriented-design-interview");
  if (track.contentVersion === ood20Version) return;
  if (track.contentVersion === ood23Version || track.contentVersion === ood22Version) await restoreOodSource21Fixture(repositoryRoot, fixtureRoot);
  const currentCatalog = JSON.parse(await readFile(catalogPath, "utf8"));
  const currentTrack = currentCatalog.tracks.find((entry) => entry.trackId === "object-oriented-design-interview");
  assert.equal(currentTrack.contentVersion, ood21Version);
  const proof = JSON.parse(await readFile(path.join(repositoryRoot, ood21ProofPath), "utf8"));
  assert.equal(proof.beforeContentVersion, ood20Version);
  assert.equal(proof.contentVersion, currentTrack.contentVersion);
  assert.equal(proof.sourceFiles.length, 9);
  assert.equal(proof.replacements.length, 0);
  assert.equal(proof.sameIdCorrections.length, 153);
  for (const source of proof.sourceFiles) {
    const target = path.join(fixtureRoot, source.sourceFile);
    const currentBytes = await readFile(target);
    assert.equal(sha256(currentBytes), source.sourceSha256, `${source.sourceFile} exact source21 input`);
    const current = JSON.parse(currentBytes);
    const previousById = new Map();
    for (const item of proof.sameIdCorrections.filter((candidate) => candidate.sourceFile === source.sourceFile)) {
      const question = current.find((candidate) => candidate.questionId === item.questionId);
      assert.ok(question, `${item.questionId} exists in source21`);
      assert.equal(JSON.stringify(question), JSON.stringify(item.currentQuestion), `${item.questionId} exact source21 object`);
      assert.equal(item.beforeQuestionId, item.questionId, `${item.questionId} preserves its source identity`);
      previousById.set(item.questionId, item.beforeQuestion);
    }
    const predecessor = current.map((question) => previousById.get(question.questionId) ?? question)
      .sort((left, right) => left.questionId.localeCompare(right.questionId));
    const bytes = Buffer.from(JSON.stringify(predecessor), "utf8");
    assert.equal(sha256(bytes), source.beforeSourceSha256, `${source.sourceFile} byte-exact v20 predecessor`);
    await writeFile(target, bytes);
  }
  currentTrack.contentVersion = proof.beforeContentVersion;
  await writeFile(catalogPath, `${JSON.stringify(currentCatalog)}\n`, "utf8");
  await rm(path.join(fixtureRoot, ood21ProofPath), { force: true });
}

/** Restore the exact v19a generation before exercising its immutable historical guards. */
export async function restoreOodSource19aFixture(repositoryRoot, fixtureRoot) {
  const catalogPath = path.join(fixtureRoot, "content/catalog.json");
  const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
  const track = catalog.tracks.find((entry) => entry.trackId === "object-oriented-design-interview");
  if (track.contentVersion === "object-oriented-design-interview-authoring-v2026.10.04-bizq01-19a") return;
  if (track.contentVersion === ood21Version || track.contentVersion === ood22Version || track.contentVersion === ood23Version) {
    await restoreOodSource20Fixture(repositoryRoot, fixtureRoot);
  }
  const restoredCatalog = JSON.parse(await readFile(catalogPath, "utf8"));
  const restoredTrack = restoredCatalog.tracks.find((entry) => entry.trackId === "object-oriented-design-interview");
  assert.equal(restoredTrack.contentVersion, ood20Version);
  const proof = JSON.parse(await readFile(path.join(repositoryRoot, ood20ProofPath), "utf8"));
  assert.equal(proof.beforeContentVersion, "object-oriented-design-interview-authoring-v2026.10.04-bizq01-19a");
  assert.equal(proof.contentVersion, restoredTrack.contentVersion);
  assert.equal(proof.sourceFiles.length, 9);
  assert.equal(proof.replacements.length, 144);
  assert.equal(proof.sameIdCorrections.length, 18);
  for (const source of proof.sourceFiles) {
    const target = path.join(fixtureRoot, source.sourceFile);
    const currentBytes = await readFile(target);
    assert.equal(sha256(currentBytes), source.sourceSha256, `${source.sourceFile} exact source20 input`);
    const current = JSON.parse(currentBytes);
    const previousById = new Map();
    for (const item of [...proof.replacements, ...proof.sameIdCorrections].filter((candidate) => candidate.sourceFile === source.sourceFile)) {
      const question = current.find((candidate) => candidate.questionId === item.questionId);
      assert.ok(question, `${item.questionId} exists in source20`);
      assert.equal(JSON.stringify(question), JSON.stringify(item.currentQuestion), `${item.questionId} exact source20 object`);
      previousById.set(item.questionId, item.beforeQuestion);
    }
    const predecessor = current.map((question) => previousById.get(question.questionId) ?? question)
      .sort((left, right) => left.questionId.localeCompare(right.questionId));
    const bytes = Buffer.from(JSON.stringify(predecessor), "utf8");
    assert.equal(sha256(bytes), source.beforeSourceSha256, `${source.sourceFile} byte-exact v19a predecessor`);
    await writeFile(target, bytes);
  }
  track.contentVersion = proof.beforeContentVersion;
  await writeFile(catalogPath, `${JSON.stringify(catalog)}\n`, "utf8");
  await rm(path.join(fixtureRoot, ood20ProofPath), { force: true });
}

/** Restore v19 question objects before exercising their immutable historical guards. */
export async function restoreOodSource19Fixture(repositoryRoot, fixtureRoot) {
  const catalogPath = path.join(fixtureRoot, "content/catalog.json");
  let catalog = JSON.parse(await readFile(catalogPath, "utf8"));
  let track = catalog.tracks.find((entry) => entry.trackId === "object-oriented-design-interview");
  if (track.contentVersion === ood19Version) return;
  if (track.contentVersion === ood20Version || track.contentVersion === ood21Version || track.contentVersion === ood22Version || track.contentVersion === ood23Version) {
    await restoreOodSource19aFixture(repositoryRoot, fixtureRoot);
    catalog = JSON.parse(await readFile(catalogPath, "utf8"));
    track = catalog.tracks.find((entry) => entry.trackId === "object-oriented-design-interview");
  }
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
  if (track.contentVersion === ood19aVersion || track.contentVersion === ood20Version || track.contentVersion === ood21Version || track.contentVersion === ood22Version || track.contentVersion === ood23Version) {
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
  if (currentVersion === ood23Version || currentVersion === ood22Version || currentVersion === ood21Version || currentVersion === ood20Version || currentVersion === ood19aVersion || currentVersion === ood19Version) {
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
