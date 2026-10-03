import assert from "node:assert/strict";
import { readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { sha256 } from "../scripts/build.mjs";

const proofRelativePath = "evidence/business-quality/bizq-01-ood-node-closure-16.json";

/**
 * Restore the byte-exact source13 OOD generation for immutable historical tests.
 * The seven source arrays in that generation use JSON.stringify without a final newline.
 */
export async function restoreOodSource13Fixture(repositoryRoot, fixtureRoot) {
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
