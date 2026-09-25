import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync, gunzipSync } from "node:zlib";

import { BUNDLED_FREE_NODE_LIMITS, validateBundledFreeNode, validateConfiguredBundledFreeNodes } from "../scripts/product/validate-bundled-free-nodes.mjs";
import { CANDIDATE_PATH, DECISION_PATH, READINESS_PATH, RELEASE_PATH } from "../scripts/review/candidate-readiness-v2.mjs";
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
  const paths = [CANDIDATE_PATH, RELEASE_PATH, READINESS_PATH, DECISION_PATH,
    "schemas/review/content-candidate-decision-v2.schema.json",
    "schemas/review/content-candidate-readiness-v2.schema.json"];
  for (const relativePath of paths) {
    const destination = path.join(root, relativePath);
    await mkdir(path.dirname(destination), { recursive: true });
    await cp(path.join(ROOT, relativePath), destination);
  }
  const release = JSON.parse(await readFile(path.join(root, RELEASE_PATH), "utf8"));
  for (const artifact of release.artifacts) {
    const relativePath = path.join(DRAFT_ROOT, "release", artifact.artifactPath);
    const destination = path.join(root, relativePath);
    await mkdir(path.dirname(destination), { recursive: true });
    await cp(path.join(ROOT, relativePath), destination);
  }
  return root;
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

test("release gate accepts the exact v3 admission without mutating readiness v2", async () => {
  const root = await makeCandidateFixture();
  try {
    const admission = JSON.parse(await readFile(path.join(ROOT, ADMISSION_PATH), "utf8"));
    const runtimeSource = path.join(ROOT, admission.runtimeEvidence.path);
    const runtimeTarget = path.join(root, admission.runtimeEvidence.path);
    await mkdir(path.dirname(runtimeTarget), { recursive: true });
    await cp(runtimeSource, runtimeTarget);
    await mkdir(path.dirname(path.join(root, ADMISSION_PATH)), { recursive: true });
    await writeFile(path.join(root, ADMISSION_PATH), `${JSON.stringify(admission)}\n`);
    const candidate = await runCandidateReleaseGate({ root });
    assert.equal(candidate.candidateId, admission.candidateId);
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
    assert.match(workflow, /npm run candidate:draft-v2/);
    assert.match(workflow, /npm run candidate:readiness-v2/);
    assert.match(workflow, /git diff --exit-code -- reports\/candidate-reconciliation\/AWS-02-DRAFT evidence\/readiness\/candidate-readiness-v2\.json/);
    assert.doesNotMatch(workflow, /generate:review-packets|generate:candidate-readiness|scripts\/publishing\/|npm run validate:real:coding-interview|run:.*(?:deploy|npm run publish|firebase deploy)/i);
    for (const [, command] of workflow.matchAll(/\bnpm run ([\w:-]+)/g)) assert.ok(packageJson.scripts[command], `Workflow references missing npm script ${command}.`);
    for (const [, scriptPath] of workflow.matchAll(/\bnode (scripts\/[\w./-]+)/g)) await access(path.join(ROOT, scriptPath));
  }
  assert.match(publishing, /npm run validate:bundled-free-nodes/);
  assert.match(release, /npm run candidate:release-gate-v2/);
  assert.match(release, /workflow_dispatch/);
});
