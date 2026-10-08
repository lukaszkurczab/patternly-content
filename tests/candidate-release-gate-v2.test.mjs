import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync, gunzipSync } from "node:zlib";

import { BUNDLED_FREE_NODE_LIMITS, validateBundledFreeNode, validateConfiguredBundledFreeNodes } from "../scripts/product/validate-bundled-free-nodes.mjs";
import { CANDIDATE_PATH, DECISION_PATH, READINESS_PATH, RELEASE_PATH, buildCandidateReadinessV2 } from "../scripts/review/candidate-readiness-v2.mjs";
import { buildCandidateDraft } from "../scripts/review/candidate-draft-v2.mjs";
import { CANDIDATE_TRACK_IDS, canonicalJsonBytes } from "../scripts/review/candidate-manifest.mjs";
import { runCandidateReleaseGate, verifyCandidateReleaseEvidence } from "../scripts/review/candidate-release-gate-v2.mjs";
import { ADMISSION_PATH } from "../scripts/review/candidate-admission-v3.mjs";

const ROOT = path.resolve(fileURLToPath(new URL("../", import.meta.url)));
const DRAFT_ROOT = "reports/candidate-reconciliation/AWS-02-DRAFT";
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

function canonical(value) {
  if (value === null || ["boolean", "number", "string"].includes(typeof value)) return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
}

async function prepareFreeNodeFixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), "patternly-free-node-validator-test-"));
  for (const relativePath of [
    "schemas/product/bundled-free-node.schema.json",
    "evidence/bundled-free-node-package-acceptance-v2.json",
  ]) {
    const destination = path.join(root, relativePath);
    await mkdir(path.dirname(destination), { recursive: true });
    await cp(path.join(ROOT, relativePath), destination);
  }
  const config = JSON.parse(await readFile(path.join(ROOT, "config/bundled-free-node-packages.json"), "utf8"));
  const entry = config.packages[0];
  const relativePath = `artifacts/bundled-free-nodes/${entry.trackId}/${entry.packageVersion}/package.json`;
  const packagePath = path.join(root, relativePath);
  await mkdir(path.dirname(packagePath), { recursive: true });
  await cp(path.join(ROOT, relativePath), packagePath);
  const document = JSON.parse(await readFile(packagePath, "utf8"));
  const releasePath = `artifacts/releases/${document.manifest.provenance.releaseId}/release.json`;
  const releaseOutput = path.join(root, releasePath);
  await mkdir(path.dirname(releaseOutput), { recursive: true });
  await cp(path.join(ROOT, releasePath), releaseOutput);
  return { root, entry, packagePath, document };
}

async function writeRehashedPackage(packagePath, document, payload) {
  const payloadBytes = Buffer.from(`${canonical(payload)}\n`);
  const compressed = gzipSync(payloadBytes, { level: 9, mtime: 0 });
  document.payloadGzipBase64 = compressed.toString("base64");
  document.manifest.payloadCanonicalSha256 = sha256(payloadBytes);
  document.manifest.payloadUncompressedSize = payloadBytes.length;
  document.manifest.payloadCompressedSha256 = sha256(compressed);
  document.manifest.payloadCompressedSize = compressed.length;
  const bytes = Buffer.from(JSON.stringify(document));
  await writeFile(packagePath, bytes);
  return sha256(bytes);
}

async function pinFixturePackage(root, entry, packageSha256) {
  const lockPath = path.join(root, "evidence/bundled-free-node-package-acceptance-v2.json");
  const acceptance = JSON.parse(await readFile(lockPath, "utf8"));
  acceptance.packages.find((item) => item.trackId === entry.trackId && item.packageVersion === entry.packageVersion).packageSha256 = packageSha256;
  await writeFile(lockPath, `${JSON.stringify(acceptance)}\n`);
}

async function makeCandidateFixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), "patternly-release-gate-test-"));
  try {
    const built = await buildCandidateDraft({ root: ROOT, outputDirectory: path.join(root, "built") });
    for (const relativePath of [
      "schemas/review/content-candidate-decision-v2.schema.json",
      "schemas/review/content-candidate-readiness-v2.schema.json",
    ]) {
      const destination = path.join(root, relativePath);
      await mkdir(path.dirname(destination), { recursive: true });
      await cp(path.join(ROOT, relativePath), destination);
    }

    const candidatePath = path.join(root, CANDIDATE_PATH);
    const releasePath = path.join(root, RELEASE_PATH);
    await mkdir(path.dirname(candidatePath), { recursive: true });
    await mkdir(path.dirname(releasePath), { recursive: true });
    await writeFile(candidatePath, canonicalJsonBytes(built.manifest));
    await writeFile(releasePath, canonicalJsonBytes(built.release));
    for (const artifact of built.release.artifacts) {
      const relativePath = path.join(DRAFT_ROOT, "release", artifact.artifactPath);
      const destination = path.join(root, relativePath);
      await mkdir(path.dirname(destination), { recursive: true });
      await cp(path.join(built.outputRoot, "release", artifact.artifactPath), destination);
    }

    const decision = {
      schemaVersion: "patternly-content-candidate-decision-v2",
      decisionId: `codex-content-candidate-review-v2:${built.manifest.candidateId}`,
      decisionAuthority: "delegated_codex",
      taskId: "BIZQ-02/CANDIDATE",
      decision: "approved_for_candidate_readiness",
      decisionRationale: "Test fixture binds exact current producer artifacts; this isolated approval grants neither publishing nor runtime admission.",
      candidatePath: CANDIDATE_PATH,
      candidateId: built.manifest.candidateId,
      sourceRepositoryCommit: built.manifest.release.sourceRepositoryCommit,
      release: {
        releaseId: built.release.manifest.releaseId,
        releasePath: RELEASE_PATH,
        checksumSha256: sha256(canonicalJsonBytes(built.release)),
      },
      trackIds: [...CANDIDATE_TRACK_IDS],
      tracks: built.release.artifacts.map((artifact) => ({
        trackId: artifact.trackId,
        sourcePath: artifact.sourcePath,
        artifactPath: artifact.artifactPath,
        questionCount: artifact.questionCount,
        questionSetSha256: artifact.questionSetSha256,
        artifactSha256: artifact.checksumSha256,
      })),
      basis: { odk096: "passed", nineTrackBuild: "passed", repositoryTests: "passed", migrationVerification: "passed" },
      boundaries: { publishingAdmission: "not_granted", runtimeAdmission: "not_granted", appReleaseLockUpdated: false },
    };
    const decisionOutput = path.join(root, DECISION_PATH);
    await mkdir(path.dirname(decisionOutput), { recursive: true });
    await mkdir(path.dirname(path.join(root, READINESS_PATH)), { recursive: true });
    await writeFile(decisionOutput, canonicalJsonBytes(decision));
    await buildCandidateReadinessV2({ root });
    return root;
  } catch (error) {
    await rm(root, { recursive: true, force: true });
    throw error;
  }
}

test("release gate verifies exact decision-bound evidence and requires separate admission", async () => {
  const root = await makeCandidateFixture();
  try {
    const { candidate } = await verifyCandidateReleaseEvidence({ root });
    await assert.rejects(runCandidateReleaseGate({ root }), new RegExp(`RELEASE_BLOCKED candidateId=${candidate.candidateId}; reason=admission_missing`));

    const readinessPath = path.join(root, READINESS_PATH);
    const readinessOriginal = await readFile(readinessPath);
    const staleReadiness = JSON.parse(readinessOriginal);
    staleReadiness.sourceRepositoryCommit = "0".repeat(40);
    await writeFile(readinessPath, `${JSON.stringify(staleReadiness)}\n`);
    await assert.rejects(verifyCandidateReleaseEvidence({ root }), /readiness is stale/);
    await writeFile(readinessPath, readinessOriginal);

    const decisionPath = path.join(root, DECISION_PATH);
    const decisionOriginal = await readFile(decisionPath);
    const staleDecision = JSON.parse(decisionOriginal);
    staleDecision.decisionRationale = `${staleDecision.decisionRationale} Changed evidence.`;
    await writeFile(decisionPath, `${JSON.stringify(staleDecision)}\n`);
    await assert.rejects(verifyCandidateReleaseEvidence({ root }), /readiness is stale/);
    await writeFile(decisionPath, decisionOriginal);

    const candidatePath = path.join(root, CANDIDATE_PATH);
    const candidateOriginal = await readFile(candidatePath);
    const staleCandidate = JSON.parse(candidateOriginal);
    staleCandidate.release.sourceRepositoryCommit = "0".repeat(40);
    await writeFile(candidatePath, `${JSON.stringify(staleCandidate)}\n`);
    await assert.rejects(verifyCandidateReleaseEvidence({ root }), /identity or draft status is invalid/);
    await writeFile(candidatePath, candidateOriginal);

    const release = JSON.parse(await readFile(path.join(root, RELEASE_PATH), "utf8"));
    const artifactPath = path.join(root, DRAFT_ROOT, "release", release.artifacts[0].artifactPath);
    const artifactOriginal = await readFile(artifactPath);
    const corruptedArtifact = Buffer.from(artifactOriginal);
    corruptedArtifact[0] ^= 1;
    await writeFile(artifactPath, corruptedArtifact);
    await assert.rejects(verifyCandidateReleaseEvidence({ root }), /artifact is stale or has a checksum mismatch/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("release gate rejects the old AWS grant for the current BIZQ-02 candidate", async () => {
  const root = await makeCandidateFixture();
  try {
    const admission = JSON.parse(await readFile(path.join(ROOT, ADMISSION_PATH), "utf8"));
    const runtimeSource = path.join(ROOT, admission.runtimeEvidence.path);
    const runtimeTarget = path.join(root, admission.runtimeEvidence.path);
    await mkdir(path.dirname(runtimeTarget), { recursive: true });
    await cp(runtimeSource, runtimeTarget);
    await mkdir(path.dirname(path.join(root, ADMISSION_PATH)), { recursive: true });
    await writeFile(path.join(root, ADMISSION_PATH), `${JSON.stringify(admission)}\n`);
    const candidate = JSON.parse(await readFile(path.join(root, CANDIDATE_PATH), "utf8"));
    assert.notEqual(candidate.candidateId, admission.candidateId);
    await assert.rejects(runCandidateReleaseGate({ root }), /Candidate admission release binding is stale/u);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("bundled Free-node control validates pinned source items and bounds decompression", async () => {
  const results = await validateConfiguredBundledFreeNodes({ root: ROOT });
  assert.equal(results.length, 9);

  const { root, entry, packagePath, document } = await prepareFreeNodeFixture();
  try {
    const changedItems = JSON.parse(gunzipSync(Buffer.from(document.payloadGzipBase64, "base64")));
    changedItems.items[0].question = "Mutated question with recomputed payload hashes.";
    const changedPackageSha = await writeRehashedPackage(packagePath, structuredClone(document), changedItems);
    await assert.rejects(validateBundledFreeNode({ root, ...entry }), /accepted package SHA-256/);

    const changedDocument = JSON.parse(await readFile(packagePath, "utf8"));
    await pinFixturePackage(root, entry, changedPackageSha);
    await assert.rejects(validateBundledFreeNode({ root, ...entry }), /differs from the accepted source artifact/);

    const bombPayload = JSON.parse(gunzipSync(Buffer.from(document.payloadGzipBase64, "base64")));
    bombPayload.padding = "x".repeat(BUNDLED_FREE_NODE_LIMITS.uncompressedBytes + 128);
    const payloadBytes = Buffer.from(`${canonical(bombPayload)}\n`);
    const compressed = gzipSync(payloadBytes, { level: 9, mtime: 0 });
    changedDocument.payloadGzipBase64 = compressed.toString("base64");
    changedDocument.manifest.payloadCanonicalSha256 = sha256(payloadBytes);
    changedDocument.manifest.payloadUncompressedSize = 1;
    changedDocument.manifest.payloadCompressedSha256 = sha256(compressed);
    changedDocument.manifest.payloadCompressedSize = compressed.length;
    const bombPackageBytes = Buffer.from(JSON.stringify(changedDocument));
    await writeFile(packagePath, bombPackageBytes);
    await pinFixturePackage(root, entry, sha256(bombPackageBytes));
    await assert.rejects(validateBundledFreeNode({ root, ...entry }), /decompressed payload exceeds the 4194304-byte limit/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("Free-node acceptance evidence rejects authority changes and unsupported fields", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "patternly-free-node-authority-test-"));
  try {
    for (const relativePath of [
      "config/bundled-free-node-packages.json",
      "schemas/product/bundled-free-node-packages.schema.json",
      "evidence/bundled-free-node-package-acceptance-v2.json",
    ]) {
      const destination = path.join(root, relativePath);
      await mkdir(path.dirname(destination), { recursive: true });
      await cp(path.join(ROOT, relativePath), destination);
    }
    const acceptancePath = path.join(root, "evidence/bundled-free-node-package-acceptance-v2.json");
    const original = JSON.parse(await readFile(acceptancePath, "utf8"));
    const mutations = [
      (evidence) => { evidence.authority = "human_owner"; },
      (evidence) => { evidence.taskId = "AWS-02/ADMISSION"; },
      (evidence) => { evidence.unreviewedField = true; },
      (evidence) => { evidence.sourceLock = { repository: "lukaszkurczab/gcp-ace-trainer", path: "integration/contracts/content-release/release.lock.json", sha256: "0".repeat(64) }; },
    ];
    for (const mutate of mutations) {
      const evidence = structuredClone(original);
      mutate(evidence);
      await writeFile(acceptancePath, `${JSON.stringify(evidence)}\n`);
      await assert.rejects(validateConfiguredBundledFreeNodes({ root }), /unsupported delegated authority or boundaries/);
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("workflow contract rebuilds v2 evidence and release gate without legacy publisher or deployment commands", async () => {
  const publishing = await readFile(path.join(ROOT, ".github/workflows/content-publishing.yml"), "utf8");
  const release = await readFile(path.join(ROOT, ".github/workflows/real-content-release.yml"), "utf8");
  const packageJson = JSON.parse(await readFile(path.join(ROOT, "package.json"), "utf8"));
  for (const workflow of [publishing, release]) {
    assert.match(workflow, /git diff --exit-code -- reports\/candidate-reconciliation\/AWS-02-DRAFT evidence\/candidate-decisions\/current-candidate-decision-v2\.json evidence\/readiness\/current-candidate-readiness-v2\.json/);
    assert.doesNotMatch(workflow, /generate:review-packets|generate:candidate-readiness|scripts\/publishing\/|npm run validate:real:coding-interview|run:.*(?:deploy|npm run publish|firebase deploy)/i);
    for (const [, command] of workflow.matchAll(/\bnpm run ([\w:-]+)/g)) assert.ok(packageJson.scripts[command], `Workflow references missing npm script ${command}.`);
    for (const [, scriptPath] of workflow.matchAll(/\bnode (scripts\/[\w./-]+)/g)) await access(path.join(ROOT, scriptPath));
  }
  assert.match(publishing, /CONTENT_CANDIDATE_OUTPUT: \$\{\{ runner\.temp \}\}\/patternly-candidate-\$\{\{ github\.sha \}\}/);
  assert.match(publishing, /execFileSync\("git", \["rev-parse", "HEAD"\]/);
  assert.match(publishing, /checkoutCommit !== process\.env\.GITHUB_SHA/);
  assert.match(publishing, /buildCandidateDraft\(\{ outputDirectory \}\)/);
  assert.match(publishing, /manifest\.status !== "draft_not_admitted"/);
  assert.match(publishing, /contentSourceCommit=\$\{manifest\.release\.sourceRepositoryCommit\}/);
  assert.doesNotMatch(publishing, /manifest\.release\.sourceRepositoryCommit !== process\.env\.GITHUB_SHA/);
  assert.match(publishing, /candidateApproval: "not_granted"/);
  assert.match(publishing, /verifyCandidateReleaseEvidence\(\)/);
  assert.doesNotMatch(publishing, /npm run candidate:draft-v2|npm run candidate:readiness-v2/);
  assert.match(publishing, /npm run validate:bundled-free-nodes/);
  assert.match(release, /npm run candidate:draft-v2/);
  assert.match(release, /npm run candidate:readiness-v2/);
  assert.match(release, /npm run candidate:release-gate-v2/);
  assert.match(release, /workflow_dispatch/);
});
