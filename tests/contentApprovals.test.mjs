import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { validateSchema } from "../scripts/authoring/lib/model.mjs";
import { summarizeSource, validateApprovalRecord } from "../scripts/review/content-approval.mjs";

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

test("owner-authorized content approvals cover exactly the current eight-track source", async () => {
  const files = (await readdir(join(root, "evidence/content-approvals"))).filter((file) => file.endsWith(".json") && file !== "index.json").sort();
  assert.deepEqual(files, expectedTracks.map((track) => `${track}.json`));
  const readiness = JSON.parse(await readFile(join(root, "evidence/readiness/eight-track-launch-readiness.json"), "utf8"));
  const schema = JSON.parse(await readFile(join(root, "schemas/review/content-approval-record.schema.json"), "utf8"));
  for (const trackId of expectedTracks) {
    const approval = JSON.parse(await readFile(join(root, "evidence/content-approvals", `${trackId}.json`), "utf8"));
    const summary = await summarizeSource({ root, trackId });
    await validateSchema(approval, schema, `evidence/content-approvals/${trackId}.json`);
    validateApprovalRecord(approval, { sourceCommit: readiness.sourceCommit, trackId, sourceSummary: summary });
    assert.equal(approval.finalDisposition, "approved");
    assert.equal(approval.reviewer.authorizationBasis, "explicit_user_authorization_in_active_task");
    assert.equal(approval.acceptedLimitations.length, 3);
  }
});
