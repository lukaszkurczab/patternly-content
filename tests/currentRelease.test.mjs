import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { buildCurrentRelease } from "../scripts/content/build-current-release.mjs";

test("current source generates a deterministic backend-readable release bound to the current source identity", async () => {
  const outputRoot = await mkdtemp(path.join(os.tmpdir(), "patternly-current-release-test-"));
  try {
    const first = await buildCurrentRelease({ outputRoot });
    const second = await buildCurrentRelease({ outputRoot });
    assert.equal(first.releaseId, second.releaseId);
    assert.match(first.releaseId, /^patternly-local-[a-f0-9]{20}$/u);
    assert.equal(first.release.manifest.envelopeVersion, 1);
    assert.equal(first.release.manifest.releaseId, first.releaseId);
    assert.match(first.release.manifest.sourceRepositoryCommit, /^[a-f0-9]{40}$/u);
    assert.equal(first.release.manifest.status, "current_source");
    assert.equal(first.release.manifest.currentIdentity.sourceInputFingerprint, first.currentIdentity.sourceInputFingerprint);
    assert.equal(first.currentIdentity.tracks.length, 9);
    assert.equal(first.currentIdentity.verificationCategories.find(({ id }) => id === "canonical-answer-scoring").scoredQuestionCount, 16749);
    assert.deepEqual(first.currentIdentity.claims, {
      semanticReview: "not_claimed",
      publication: "not_performed",
      deployment: "not_performed",
      deviceAcceptance: "not_claimed",
    });
    assert.equal(first.release.artifacts.length, 9);
    assert.deepEqual(first.release.artifacts.map(({ trackId }) => trackId), [...first.release.artifacts.map(({ trackId }) => trackId)].sort());
    assert.deepEqual(Object.fromEntries(first.release.artifacts.map(({ trackId, declaredModes }) => [trackId, declaredModes])), {
      "aws-certified-solutions-architect-associate": [],
      "backend-system-design-interview": ["design-interview-simulation"],
      "claude-certified-architect-professional-certification": [],
      "coding-interview-dsa-problem-solving": ["coding-interview-simulation"],
      "frontend-system-design-interview": ["design-interview-simulation"],
      "google-cloud-associate-cloud-engineer": ["certification-exam-simulation"],
      "microsoft-azure-administrator-associate-az-104": [],
      "microsoft-azure-ai-fundamentals-ai-901": [],
      "object-oriented-design-interview": ["design-interview-simulation"],
    });

    for (const artifact of first.release.artifacts) {
      assert.equal(artifact.sourceRepositoryCommit, first.release.manifest.sourceRepositoryCommit);
      assert.equal(artifact.schemaVersion, "published-bank-v1");
      const digest = createHash("sha256").update(artifact.artifactBytes, "utf8").digest("hex");
      assert.equal(artifact.checksumSha256, digest);
      const envelope = JSON.parse(artifact.artifactBytes);
      assert.equal(envelope.envelopeVersion, 1);
      assert.equal(envelope.schemaVersion, "published-bank-v1");
      assert.equal(envelope.contentVersion, artifact.contentVersion);
      assert.equal(envelope.bank.trackId, artifact.trackId);
      assert.equal(envelope.bank.familyId, artifact.familyId);
      assert.ok(Array.isArray(envelope.bank.items) && envelope.bank.items.length > 0);
      const choice = envelope.bank.items.find(({ interaction }) => interaction?.type === "choice");
      if (choice) {
        assert.ok(choice.interaction.acceptedOptionIds.length > 0);
        assert.ok(choice.interaction.options.every(({ id, text }) => typeof id === "string" && typeof text === "string"));
      }
    }

    assert.deepEqual(await readFile(first.releasePath), await readFile(second.releasePath));
    assert.match(first.releasePath, new RegExp(`/releases/${first.releaseId}/release\\.json$`, "u"));
    assert.deepEqual(JSON.parse(await readFile(path.join(outputRoot, "current.json"), "utf8")), {
      releaseId: first.releaseId,
      releasePath: `releases/${first.releaseId}/release.json`,
    });
  } finally {
    await rm(outputRoot, { recursive: true, force: true });
  }
});

test("current release writer refuses an active lock without taking or deleting another owner's lock", async () => {
  const outputRoot = await mkdtemp(path.join(os.tmpdir(), "patternly-current-release-lock-test-"));
  const lockPath = path.join(outputRoot, ".current-release.lock");
  const ownerBytes = "held-by-another-writer\n";
  try {
    await writeFile(lockPath, ownerBytes, { flag: "wx", mode: 0o600 });
    await assert.rejects(buildCurrentRelease({ outputRoot }), /another current-release writer/u);
    assert.equal(await readFile(lockPath, "utf8"), ownerBytes);
    assert.deepEqual(await (await import("node:fs/promises")).readdir(outputRoot), [".current-release.lock"]);
  } finally {
    await rm(outputRoot, { recursive: true, force: true });
  }
});

test("current release writer preserves a malformed pointer and refuses to replace unowned output", async () => {
  const outputRoot = await mkdtemp(path.join(os.tmpdir(), "patternly-current-release-pointer-test-"));
  const pointerPath = path.join(outputRoot, "current.json");
  const pointerBytes = "{\"releaseId\":\"unowned\"}\n";
  try {
    await writeFile(pointerPath, pointerBytes, { flag: "wx" });
    await assert.rejects(buildCurrentRelease({ outputRoot }), /current pointer is not owned/u);
    assert.equal(await readFile(pointerPath, "utf8"), pointerBytes);
    assert.deepEqual((await import("node:fs/promises")).readdir ? await (await import("node:fs/promises")).readdir(outputRoot) : [], ["current.json"]);
  } finally {
    await rm(outputRoot, { recursive: true, force: true });
  }
});
