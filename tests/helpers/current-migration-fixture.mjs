import { execFileSync } from "node:child_process";
import { cp, mkdir, writeFile, readFile } from "node:fs/promises";
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

/** Copy the actual canonical content and every fixed producer proof needed by verifyMigration. */
export async function copyCurrentMigrationFixture(repositoryRoot, fixtureRoot) {
  await cp(path.join(repositoryRoot, "content"), path.join(fixtureRoot, "content"), { recursive: true });
  // These historical migration proofs bind the accepted 918-item Claude bank.
  // Exercise that fixed predecessor, while preserving the current eight other banks.
  const frozenHead = "58d7e8b918590abfe3cfa4da2594f1c12653f547";
  const prefix = "content/claude-certified-architect-professional-certification/";
  const files = execFileSync("git", ["ls-tree", "-r", "--name-only", frozenHead, "--", prefix], { cwd: repositoryRoot, encoding: "utf8" }).trim().split("\n");
  for (const file of files) {
    await mkdir(path.dirname(path.join(fixtureRoot, file)), { recursive: true });
    await writeFile(path.join(fixtureRoot, file), execFileSync("git", ["show", `${frozenHead}:${file}`], { cwd: repositoryRoot }));
  }
  const catalogPath = path.join(fixtureRoot, "content/catalog.json");
  const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
  const frozenCatalog = JSON.parse(execFileSync("git", ["show", `${frozenHead}:content/catalog.json`], { cwd: repositoryRoot, encoding: "utf8" }));
  catalog.tracks = catalog.tracks.map(track => track.trackId === "claude-certified-architect-professional-certification" ? frozenCatalog.tracks.find(old => old.trackId === track.trackId) : track);
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
