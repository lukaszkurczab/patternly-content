import { execFileSync } from "node:child_process";
import { cp, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { copyCurrentMigrationFixture } from "./current-migration-fixture.mjs";

const baselineCommit = "ad3738067818d4e3caa6495943bc9e9b0d6f6c2a";
const claudeCommit = "58d7e8b918590abfe3cfa4da2594f1c12653f547";
const trackId = "object-oriented-design-interview";
const claudeTrackId = "claude-certified-architect-professional-certification";

/** Exercise current OOD against fixed unrelated banks, never concurrent source edits. */
export async function copyOodCorrectionMigrationFixture(repositoryRoot, fixtureRoot) {
  if (path.resolve(repositoryRoot) === path.resolve(fixtureRoot)) throw new Error("Fixture must be separate from repository source");
  await copyCurrentMigrationFixture(repositoryRoot, fixtureRoot);
  const currentCatalog = JSON.parse(await readFile(path.join(repositoryRoot, "content/catalog.json"), "utf8"));
  const catalog = JSON.parse(execFileSync("git", ["show", `${baselineCommit}:content/catalog.json`], { cwd: repositoryRoot, encoding: "utf8" }));
  const claudeCatalog = JSON.parse(execFileSync("git", ["show", `${claudeCommit}:content/catalog.json`], { cwd: repositoryRoot, encoding: "utf8" }));
  // Remove only the disposable fixture tree so newly added files from other banks cannot leak in.
  await rm(path.join(fixtureRoot, "content"), { recursive: true, force: true });
  const archivePath = path.join(fixtureRoot, "ood-migration-baseline.tar");
  try {
    for (const [commit, source] of [[baselineCommit, "content"], [claudeCommit, `content/${claudeTrackId}`]]) {
      if (commit === claudeCommit) await rm(path.join(fixtureRoot, source), { recursive: true, force: true });
      execFileSync("git", ["archive", "--format=tar", "-o", archivePath, commit, "--", source], { cwd: repositoryRoot });
      execFileSync("tar", ["-xf", archivePath, "-C", fixtureRoot]);
    }
  } finally {
    await rm(archivePath, { force: true });
  }
  await rm(path.join(fixtureRoot, "content", trackId), { recursive: true, force: true });
  await cp(path.join(repositoryRoot, "content", trackId), path.join(fixtureRoot, "content", trackId), { recursive: true });
  catalog.tracks = catalog.tracks.map(track => track.trackId === trackId
    ? currentCatalog.tracks.find(current => current.trackId === trackId)
    : track.trackId === claudeTrackId ? claudeCatalog.tracks.find(frozen => frozen.trackId === claudeTrackId) : track);
  await writeFile(path.join(fixtureRoot, "content/catalog.json"), `${JSON.stringify(catalog)}\n`);
}
