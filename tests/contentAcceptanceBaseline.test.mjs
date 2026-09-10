import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

import { validateSchema } from "../scripts/authoring/lib/model.mjs";
import { canonicalJson, summarizeSource } from "../scripts/review/content-approval.mjs";
import {
  ACC01_BASELINE_PATH,
  ACC01_APPROVAL_BINDING_KEYS,
  ACC01_NON_CLAUDE_TRACK_IDS,
  ACC01_SUMMARY_KEYS,
  ACC01_TRACK_IDS,
  compareTrackSummary,
  loadAcc01Baseline,
  normalizeBaselineTracks,
  validateBaselineMetadata,
  verifyAcc01Baseline
} from "../scripts/review/content-acceptance-baseline.mjs";

const root = process.cwd();
const claudeTrackId = "claude-certified-architect-professional-certification";

async function readBaseline() {
  return loadAcc01Baseline(root);
}

test("ACC-01 baseline is schema-valid, deterministic, and verifies all nine source roots", async () => {
  const baseline = await readBaseline();
  const schema = JSON.parse(await readFile(join(root, "schemas/review/content-acceptance-baseline.schema.json"), "utf8"));
  await validateSchema(baseline, schema, ACC01_BASELINE_PATH);
  assert.doesNotThrow(() => validateBaselineMetadata(baseline));
  assert.deepEqual(normalizeBaselineTracks(baseline.tracks).map((track) => track.trackId), ACC01_TRACK_IDS);
  const verification = await verifyAcc01Baseline({ root, baseline });
  assert.deepEqual(verification.trackIds, ACC01_TRACK_IDS);
  const claudeSummary = await summarizeSource({ root, trackId: claudeTrackId });
  assert.deepEqual(verification.summaries.find((summary) => summary.trackId === claudeTrackId), { trackId: claudeTrackId, ...claudeSummary });
});

test("ACC-01 keeps every non-Claude baseline entry bound to the human-owner approval manifest", async () => {
  const baseline = await readBaseline();
  const approvalManifest = JSON.parse(await readFile(join(root, "evidence/human-content-approvals/manifest.json"), "utf8"));
  for (const trackId of ACC01_NON_CLAUDE_TRACK_IDS) {
    const baselineTrack = baseline.tracks.find((track) => track.trackId === trackId);
    const approvalTrack = approvalManifest.tracks.find((track) => track.trackId === trackId);
    assert.ok(approvalTrack, `missing human approval for ${trackId}`);
    assert.deepEqual(
      Object.fromEntries(ACC01_APPROVAL_BINDING_KEYS.map((key) => [key, baselineTrack[key]])),
      Object.fromEntries(ACC01_APPROVAL_BINDING_KEYS.map((key) => [key, approvalTrack[key]])),
      trackId
    );
  }
});

test("ACC-01 normalizes baseline track order while preserving canonical record order", async () => {
  const baseline = await readBaseline();
  const reordered = { ...baseline, tracks: [...baseline.tracks].reverse() };
  assert.equal(canonicalJson(normalizeBaselineTracks(baseline.tracks)), canonicalJson(normalizeBaselineTracks(reordered.tracks)));
  await assert.doesNotReject(() => verifyAcc01Baseline({ root, baseline: reordered }));
});

test("ACC-01 comparison catches source add/remove, item identity, and fingerprint changes", async () => {
  const baseline = await readBaseline();
  const expected = baseline.tracks.find((track) => track.trackId === claudeTrackId);
  const actual = await summarizeSource({ root, trackId: claudeTrackId });
  for (const [label, mutation] of [
    ["source add", { sourceFileCount: actual.sourceFileCount + 1 }],
    ["source remove", { sourceFileCount: actual.sourceFileCount - 1 }],
    ["item identity", { itemManifestSha256: "0".repeat(64) }],
    ["item fingerprint", { itemManifestSha256: "f".repeat(64) }]
  ]) {
    const changed = { ...actual, ...mutation };
    assert.throws(() => compareTrackSummary(expected, changed), new RegExp(`ACC-01 (?:${ACC01_SUMMARY_KEYS.join("|")}) differs`), label);
  }
});

test("ACC-01 primary verification rejects unknown properties and invalid Claude content versions", async () => {
  const baseline = await readBaseline();
  const unknownProperty = { ...baseline, unexpected: true };
  await assert.rejects(
    () => verifyAcc01Baseline({ root, baseline: unknownProperty }),
    /evidence\/content-acceptance\/acc-01-baseline-v1\.json\.unexpected is not allowed/
  );

  const withWrongType = structuredClone(baseline);
  withWrongType.tracks.find((track) => track.trackId === claudeTrackId).contentVersion = 42;
  await assert.rejects(() => verifyAcc01Baseline({ root, baseline: withWrongType }), /contentVersion must be a non-empty string/);

  const withWrongValue = structuredClone(baseline);
  withWrongValue.tracks.find((track) => track.trackId === claudeTrackId).contentVersion = "ccarp-2026.09.04";
  await assert.rejects(() => verifyAcc01Baseline({ root, baseline: withWrongValue }), /Claude content version is not ccarp-2026\.09\.03/);
});
