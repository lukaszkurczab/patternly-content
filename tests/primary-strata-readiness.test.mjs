import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { validatePrimaryObjective, verifyReadiness } from "../scripts/content/verify-primary-strata-readiness.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const manifest = JSON.parse(await readFile(new URL("../config/primary-strata-readiness.json", import.meta.url), "utf8"));

test("readiness reports current nine-track structure without claiming semantic approval or efficacy", async () => {
  const result = await verifyReadiness({ rootDirectory: root, manifest });
  assert.equal(result.status, "current_source_inventory");
  assert.equal(result.tracks.length, 9);
  assert.equal(result.tracks.reduce((sum, track) => sum + track.questions, 0), 16759);
  assert.ok(result.tracks.every((track) => track.structuralValidity === "valid"));
  assert.ok(result.tracks.every((track) => track.semanticOwnerApproval === "not_established"));
  assert.ok(result.tracks.every((track) => track.efficacy === "not_evaluated"));
  assert.ok(result.tracks.every((track) => track.readiness === "not_ready"));
  const currentClaude = result.tracks.find((track) => track.trackId === "claude-certified-architect-professional-certification");
  assert.equal(currentClaude.questions, 982);
  assert.equal(currentClaude.technicalProvenance.status, "current_source_observed");
  assert.ok(currentClaude.technicalProvenance.changedInputCount > 0);
});

test("source drift refreshes technical provenance and remains visible without freezing the bank", async () => {
  const staleManifest = structuredClone(manifest);
  const currentEntry = staleManifest.tracks.find((track) => track.trackId === "claude-certified-architect-professional-certification");
  currentEntry.contentVersion = "old-version-label";
  currentEntry.questionCount = 300;
  currentEntry.questionIdSetSha256 = "0".repeat(64);
  const result = await verifyReadiness({ rootDirectory: root, manifest: staleManifest });
  const claude = result.tracks.find((track) => track.trackId === currentEntry.trackId);
  assert.notEqual(claude.contentVersion, currentEntry.contentVersion);
  assert.equal(claude.questions, 982);
  assert.equal(claude.technicalProvenance.configuredQuestionCount, 300);
  assert.equal(claude.semanticOwnerApproval, "not_established");
});

test("partial objective inventory reports stale bindings instead of treating them as current mappings", () => {
  const result = validatePrimaryObjective("sample-track", {
    primaryObjective: {
      status: "partial",
      registry: { path: "registry.json", sha256: "a".repeat(64), registryVersion: "registry-v1" },
      bindings: [
        { questionId: "current-q1", objectiveId: "obj-1" },
        { questionId: "removed-q0", objectiveId: "obj-1" }
      ]
    }
  }, new Set(["current-q1"]), {
    trackId: "sample-track",
    registryVersion: "registry-v1",
    domains: [{ domainId: "domain-1" }],
    objectives: [{ objectiveId: "obj-1", parentDomainId: "domain-1" }]
  });
  assert.deepEqual({ status: result.status, mapped: result.mapped, unmapped: result.unmapped, orphan: result.orphan }, {
    status: "partial", mapped: 1, unmapped: 0, orphan: 1
  });
  assert.equal(result.mappingComplete, false);
});
