import { execFileSync } from "node:child_process";
import { cp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import path from "node:path";

const BUSINESS_QUALITY_PROOFS = [
  "bizq-05-gcp-question-relations-01.json",
  "fesd-n08-20261011.json",
  "bizq-01-besd-slice-01.json",
  "bizq-01-besd-seed-cohort-14.json",
  "bizq-01-besd-cohort-15.json",
  "bizq-01-coding-source-copy-04.json",
  "saa-20261010-aws-targeted-corrections.json",
  "bizq-01-ood-source-11.json",
  "bizq-01-ood-source-12.json",
  "bizq-01-ood-unit-cohort-13.json",
  "bizq-01-ood-node-closure-16.json",
  "bizq-01-ood-node-closure-17.json",
  "bizq-01-ood-node-closure-19.json",
  "bizq-01-ood-reason-amendment-19a.json",
  "bizq-01-ood-node-closure-20.json",
  "bizq-01-ood-node-closure-21.json",
  "bizq-01-ood-node-closure-22.json",
  "bizq-01-ood-node-closure-23.json",
  "bizq-01-ood-node-closure-24.json",
  "ood-20261013-explanation-corrections.json"
];

/** Fixed historical migration inputs; current authoring is tested by source regressions/builds. */
export async function copyCurrentMigrationFixture(repositoryRoot, fixtureRoot) {
  if (path.resolve(repositoryRoot) === path.resolve(fixtureRoot)) throw new Error("Fixture must be separate from repository source");
  await mkdir(fixtureRoot, { recursive: true });
  const baselineCommit = "ad3738067818d4e3caa6495943bc9e9b0d6f6c2a";
  const claudeCommit = "58d7e8b918590abfe3cfa4da2594f1c12653f547";
  const claudeTrack = "claude-certified-architect-professional-certification";
  const oodTrack = "object-oriented-design-interview";
  const archivePath = path.join(fixtureRoot, "historical-migration-inputs.tar");
  try {
    for (const [commit, source] of [[baselineCommit, "content"], [claudeCommit, `content/${claudeTrack}`]]) {
      await rm(path.join(fixtureRoot, source), { recursive: true, force: true });
      execFileSync("git", ["archive", "--format=tar", "-o", archivePath, commit, "--", source], { cwd: repositoryRoot });
      execFileSync("tar", ["-xf", archivePath, "-C", fixtureRoot]);
    }
  } finally { await rm(archivePath, { force: true }); }
  // The production verifier includes the separately reviewed OOD explanation successor.
  await rm(path.join(fixtureRoot, "content", oodTrack), { recursive: true, force: true });
  await cp(path.join(repositoryRoot, "content", oodTrack), path.join(fixtureRoot, "content", oodTrack), { recursive: true });
  const catalogPath = path.join(fixtureRoot, "content/catalog.json");
  const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
  const claudeCatalog = JSON.parse(execFileSync("git", ["show", `${claudeCommit}:content/catalog.json`], { cwd: repositoryRoot, encoding: "utf8" }));
  const currentCatalog = JSON.parse(await readFile(path.join(repositoryRoot, "content/catalog.json"), "utf8"));
  catalog.tracks = catalog.tracks.map(track => track.trackId === claudeTrack
    ? claudeCatalog.tracks.find(old => old.trackId === claudeTrack)
    : track.trackId === oodTrack ? currentCatalog.tracks.find(current => current.trackId === oodTrack) : track);
  await writeFile(catalogPath, JSON.stringify(catalog) + "\n");
  const sourceProofRoot = path.join(repositoryRoot, "evidence", "business-quality");
  const fixtureProofRoot = path.join(fixtureRoot, "evidence", "business-quality");
  await mkdir(fixtureProofRoot, { recursive: true });
  for (const proofName of BUSINESS_QUALITY_PROOFS) {
    await cp(path.join(sourceProofRoot, proofName), path.join(fixtureProofRoot, proofName));
  }
  await cp(
    path.join(repositoryRoot, "evidence", "canonical-content-approvals"),
    path.join(fixtureRoot, "evidence", "canonical-content-approvals"),
    { recursive: true }
  );
  const sourceAuditRoot = path.join(repositoryRoot, "docs", "evidence", "content-audits");
  const fixtureAuditRoot = path.join(fixtureRoot, "docs", "evidence", "content-audits");
  await mkdir(fixtureAuditRoot, { recursive: true });
  await cp(
    path.join(sourceAuditRoot, "2026-10-11-cc02-content-coverage.json"),
    path.join(fixtureAuditRoot, "2026-10-11-cc02-content-coverage.json")
  );
}
