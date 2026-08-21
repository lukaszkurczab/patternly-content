import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { validateSchema } from "../scripts/authoring/lib/model.mjs";
import { summarizeSource, validateAgentReviewRecord, validateHumanApprovalEntry, validateHumanApprovalManifest } from "../scripts/review/content-approval.mjs";

const root = process.cwd();
const expectedTracks = [
  "aws-certified-solutions-architect-associate",
  "backend-system-design-interview",
  "coding-interview-dsa-problem-solving",
  "frontend-system-design-interview",
  "google-cloud-associate-cloud-engineer",
  "microsoft-azure-administrator-associate-az-104",
  "microsoft-azure-ai-fundamentals-ai-901",
  "object-oriented-design-interview"
].sort();

test("stale agent review records never become current approval", async () => {
  const files = (await readdir(join(root, "evidence/content-approvals"))).filter((file) => file.endsWith(".json") && file !== "index.json").sort();
  assert.deepEqual(files, expectedTracks.map((track) => `${track}.json`));
  const readiness = JSON.parse(await readFile(join(root, "evidence/readiness/eight-track-launch-readiness.json"), "utf8"));
  const schema = JSON.parse(await readFile(join(root, "schemas/review/content-approval-record.schema.json"), "utf8"));
  for (const trackId of expectedTracks) {
    const approval = JSON.parse(await readFile(join(root, "evidence/content-approvals", `${trackId}.json`), "utf8"));
    const summary = await summarizeSource({ root, trackId });
    await validateSchema(approval, schema, `evidence/content-approvals/${trackId}.json`);
    assert.throws(() => validateAgentReviewRecord(approval, { sourceCommit: readiness.sourceCommit, trackId, sourceSummary: summary }), /source commit mismatch|differs from current source/);
    assert.equal(approval.finalDisposition, "approved");
    assert.equal(approval.reviewer.authorizationBasis, "explicit_user_authorization_in_active_task");
    assert.equal(approval.acceptedLimitations.length, 3);
    assert.throws(() => validateHumanApprovalManifest(approval), /Human content approval manifest/);
  }
});

test("human owner approval stays bound to the exact current source commit", async () => {
  const readiness = JSON.parse(await readFile(join(root, "evidence/readiness/eight-track-launch-readiness.json"), "utf8"));
  const manifest = JSON.parse(await readFile(join(root, "evidence/human-content-approvals/manifest.json"), "utf8"));
  const schema = JSON.parse(await readFile(join(root, "schemas/review/human-content-approval-manifest.schema.json"), "utf8"));
  await validateSchema(manifest, schema, "evidence/human-content-approvals/manifest.json");
  assert.doesNotThrow(() => validateHumanApprovalManifest(manifest, { sourceCommit: readiness.sourceCommit, trackIds: expectedTracks }));
  assert.equal(manifest.approver.kind, "human_owner");
  assert.equal(manifest.approver.id, "lukaszkurczab");
  for (const trackId of expectedTracks) {
    const summary = await summarizeSource({ root, trackId });
    const approval = manifest.tracks.find((entry) => entry.trackId === trackId);
    assert.doesNotThrow(() => validateHumanApprovalEntry(approval, { sourceCommit: readiness.sourceCommit, trackId, sourceSummary: summary }));
    assert.equal(approval.sourceCommit, readiness.sourceCommit);
  }
});
