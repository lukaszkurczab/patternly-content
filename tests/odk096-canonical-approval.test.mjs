import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { canonicalJson, sha256, validateTrack } from "../scripts/build.mjs";

const TRACK_ID = "aws-certified-solutions-architect-associate";
const NODE_ID = "aws_secure_architecture_foundations";
const CONTENT_VERSION = "aws-certified-solutions-architect-associate-authoring-v2026.09.21-odk096";
const NODE_SHA256 = "8dd16df1d7c6741b373026547c35255aea97869542bbb8897a4f36c73730bc33";
const TRACK_SHA256 = "46697d0c4e395455084d5dc28206b83e9207109b6f803eb94a47d4b4b981ac45";
const ORIGINAL_IDS = [
  "aws-saa-c03-iam-policy-evaluation-001",
  "aws-saa-c03-iam-policy-evaluation-002",
  "aws-saa-c03-iam-policy-evaluation-003",
  "aws-saa-c03-iam-policy-evaluation-004",
];
const NEW_IDS = [
  "aws-saa-c03-architecture-001-odk096",
  "aws-saa-c03-architecture-002-odk096",
  "aws-saa-c03-architecture-003-odk096",
  "aws-saa-c03-classification-001-odk096",
  "aws-saa-c03-classification-002-odk096",
  "aws-saa-c03-classification-003-odk096",
  "aws-saa-c03-edge-001-odk096",
  "aws-saa-c03-edge-002-odk096",
  "aws-saa-c03-edge-003-odk096",
  "aws-saa-c03-encryption-001-odk096",
  "aws-saa-c03-encryption-002-odk096",
  "aws-saa-c03-encryption-003-odk096",
  "aws-saa-c03-iam-policy-kms-external-principal-odk096",
  "aws-saa-c03-iam-policy-s3-cross-account-odk096",
  "aws-saa-c03-organizations-001-odk096",
  "aws-saa-c03-organizations-002-odk096",
  "aws-saa-c03-organizations-003-odk096",
  "aws-saa-c03-organizations-004-odk096",
  "aws-saa-c03-principal-001-odk096",
  "aws-saa-c03-principal-002-odk096",
  "aws-saa-c03-principal-003-odk096",
  "aws-saa-c03-requirements-001-odk096",
  "aws-saa-c03-requirements-002-odk096",
  "aws-saa-c03-retention-001-odk096",
  "aws-saa-c03-retention-002-odk096",
  "aws-saa-c03-retention-003-odk096",
  "aws-saa-c03-retention-004-odk096",
  "aws-saa-c03-secrets-001-odk096",
  "aws-saa-c03-secrets-002-odk096",
  "aws-saa-c03-secrets-003-odk096",
  "aws-saa-c03-segmentation-001-odk096",
  "aws-saa-c03-segmentation-002-odk096",
  "aws-saa-c03-segmentation-003-odk096",
  "aws-saa-c03-shared-001-odk096",
  "aws-saa-c03-shared-002-odk096",
  "aws-saa-c03-shared-003-odk096",
];
const APPROVAL_PATH = new URL("../evidence/canonical-content-approvals/odk-096-aws-free-node-v1.json", import.meta.url);
const BASELINE_PATH = new URL("../evidence/content-acceptance/acc-01-baseline-v1.json", import.meta.url);

function sortQuestions(questions) {
  return [...questions].sort((left, right) => (left.questionId < right.questionId ? -1 : left.questionId > right.questionId ? 1 : 0));
}

test("ODK-096 approval binds one AWS Free node to exact canonical hashes and IDs", async () => {
  const approval = JSON.parse(await readFile(APPROVAL_PATH, "utf8"));
  const baseline = JSON.parse(await readFile(BASELINE_PATH, "utf8"));
  const validated = await validateTrack({ rootDirectory: process.cwd(), trackId: TRACK_ID });
  const nodeQuestions = sortQuestions(validated.questions.filter((question) => question.nodeId === NODE_ID));
  const trackQuestions = sortQuestions(validated.questions);
  const nodeIds = nodeQuestions.map((question) => question.questionId);

  assert.deepEqual(Object.keys(approval).sort(), [
    "admission",
    "addendumId",
    "approval",
    "baselineManifest",
    "canonicalIdentity",
    "execution",
    "limitations",
    "questionSet",
    "schemaVersion",
  ].sort());
  assert.equal(approval.schemaVersion, "patternly-canonical-content-approval-addendum-v1");
  assert.equal(approval.addendumId, "odk-096-aws-free-node-v1");
  assert.equal(approval.approval.status, "approved_pending_sync");
  assert.equal(approval.approval.decisionSource, "owner_confirmation_in_active_conversation");
  assert.equal(approval.approval.scope, "aws_free_node_local_bundle_publication_and_sync_pending");
  assert.deepEqual(approval.execution, {
    model: "gpt-5.6-luna",
    reasoningEffort: "max",
    independentValidation: {
      model: "gpt-5.6-luna",
      reasoningEffort: "max",
      verdict: "pass_local_producer_boundary",
      scope: "local_producer_boundary_only_not_global_release",
      scores: {
        consistency: 0.96,
        simplicity: 0.93,
        risk: 0.90,
        maintainability: 0.96,
      },
      minimumScore: 0.90,
    },
  });

  assert.equal(validated.track.contentVersion, CONTENT_VERSION);
  assert.equal(approval.canonicalIdentity.trackId, TRACK_ID);
  assert.equal(approval.canonicalIdentity.nodeId, NODE_ID);
  assert.equal(approval.canonicalIdentity.contentVersion, CONTENT_VERSION);
  assert.equal(approval.canonicalIdentity.node.questionCount, 40);
  assert.equal(approval.canonicalIdentity.node.sha256, NODE_SHA256);
  assert.equal(approval.canonicalIdentity.track.questionCount, 2604);
  assert.equal(approval.canonicalIdentity.track.sha256, TRACK_SHA256);
  assert.equal(sha256(canonicalJson(nodeQuestions)), NODE_SHA256);
  assert.equal(sha256(canonicalJson(trackQuestions)), TRACK_SHA256);
  assert.equal(nodeQuestions.length, 40);
  assert.equal(trackQuestions.length, 2604);

  assert.deepEqual(approval.questionSet.newQuestionIds, NEW_IDS);
  assert.deepEqual(approval.questionSet.preservedQuestionIds, ORIGINAL_IDS);
  assert.equal(approval.questionSet.newQuestionCount, NEW_IDS.length);
  assert.equal(approval.questionSet.preservedQuestionCount, ORIGINAL_IDS.length);
  assert.equal(approval.questionSet.totalNodeQuestionCount, nodeQuestions.length);
  assert.deepEqual(nodeIds, [...ORIGINAL_IDS, ...NEW_IDS].sort());
  assert.deepEqual(nodeIds.filter((id) => id.endsWith("-odk096")), NEW_IDS);
  assert.deepEqual(nodeIds.filter((id) => !id.endsWith("-odk096")), ORIGINAL_IDS);

  assert.deepEqual(approval.baselineManifest, {
    path: "evidence/content-acceptance/acc-01-baseline-v1.json",
    trackId: TRACK_ID,
    sourceCommit: "1e35906ccea0f3abbed6814fd828bdc6467318be",
    sourceRoot: "manual/source/aws-certified-solutions-architect-associate",
    sourceFileCount: 137,
    canonicalItemCount: 2568,
    sourceManifestSha256: "d837d60bb005facbde1fe6520ecb31307b41fa5ebd62a85afac4cb55d2b15477",
    itemManifestSha256: "d9211e2091505f7dfcf9c0dbc96e6866919047fb30a9ff4371be5c8eccaf6733",
  });
  assert.deepEqual(approval.baselineManifest, {
    ...baseline.tracks.find((track) => track.trackId === TRACK_ID),
    path: approval.baselineManifest.path,
  });

  assert.equal(approval.admission.kind, "local_canonical_producer");
  assert.equal(approval.admission.status, "admitted");
  assert.equal(approval.admission.localBundlePublicationSync, "approved_pending_sync");
  assert.deepEqual(approval.admission.approvedTrackIds, [TRACK_ID]);
  assert.deepEqual(approval.admission.approvedNodeIds, [`${TRACK_ID}:${NODE_ID}`]);
  assert.equal(approval.admission.runtimeAdmission, "not_granted");
  assert.equal(approval.admission.publishingAdmission, "not_granted");
  assert.equal(approval.admission.globalReleaseAdmission, "not_granted");
  assert.equal(approval.admission.otherTrackApprovals, "none");
});
