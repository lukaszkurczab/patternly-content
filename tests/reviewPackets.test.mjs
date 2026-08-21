import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

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

test("human review packets cover exactly the eight launch tracks", async () => {
  const files = (await readdir(join(root, "evidence/review-packets"))).filter((file) => file.endsWith(".json")).sort();
  const expected = expectedTracks.map((track) => `${track}.json`).sort();
  assert.deepEqual(files, expected);
  for (const file of files) {
    const packet = JSON.parse(await readFile(join(root, "evidence/review-packets", file), "utf8"));
    assert.equal(packet.schemaVersion, "patternly-human-review-packet-v1");
    assert.equal(packet.approvalForm.status, "approved");
    assert.equal(packet.approvalForm.reviewer?.kind, "human_owner");
    assert.equal(packet.approvalForm.reviewedAt, "2026-08-20");
    assert.equal(packet.approvalForm.disposition, "approved");
    assert.ok(packet.coverage.sourceFileCount > 0);
    assert.ok(packet.coverage.canonicalItemCount > 0);
    assert.ok(packet.sampleStrata.samples.length > 0);
    assert.ok(packet.automatedFindings.some((finding) => finding.id === "human-approval" && finding.status === "pass"));
  }
});
