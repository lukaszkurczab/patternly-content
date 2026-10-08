import { cp, mkdir } from "node:fs/promises";
import path from "node:path";

const BUSINESS_QUALITY_PROOFS = [
  "bizq-05-gcp-question-relations-01.json",
  "bizq-01-besd-slice-01.json",
  "bizq-01-besd-seed-cohort-14.json",
  "bizq-01-coding-source-copy-04.json",
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
  "bizq-01-ood-node-closure-24.json"
];

/** Copy the actual canonical content and every fixed producer proof needed by verifyMigration. */
export async function copyCurrentMigrationFixture(repositoryRoot, fixtureRoot) {
  await cp(path.join(repositoryRoot, "content"), path.join(fixtureRoot, "content"), { recursive: true });
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
}
