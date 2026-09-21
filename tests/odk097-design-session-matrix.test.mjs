import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { canonicalJson, sha256, validateTrack } from "../scripts/build.mjs";
import { loadCanonicalTrackBriefs } from "../scripts/product/track-briefs.mjs";

const CONTENT_ROOT = fileURLToPath(new URL("..", import.meta.url));
const LEARN_MODE = "design-interview-learn-framework";
const TRADEOFF_MODE = "design-interview-tradeoff-practice";
const REVIEW_MODE = "design-interview-weak-area-review";

const DESIGN_TRACKS = Object.freeze([
  {
    trackId: "backend-system-design-interview",
    profileId: "backend-system-design-interview-free-node-v1",
    freeNodeId: "requirements_capacity_and_architecture_decomposition",
    contentVersion: "backend-system-design-interview-candidate-v2026.08.15",
    tradeoffConfigurationId: "backend-system-design-interview-free-tradeoff-practice-v2",
    reviewConfigurationId: "backend-system-design-interview-free-weak-area-review-v2",
    nodeCount: 145,
    nodeSha256: "27de9ae6ae032d90e67b837087b18a128e0d991bc3474ca475e2626bf1098d99",
    trackCount: 1569,
    trackSha256: "0a66ef035674aee9be6c089b18406321dc8284d88422db3cdc828ffb8ded67a4",
  },
  {
    trackId: "object-oriented-design-interview",
    profileId: "object-oriented-design-interview-free-node-v1",
    freeNodeId: "requirements_use_cases_domain_vocabulary_and_model_boundaries",
    contentVersion: "object-oriented-design-interview-candidate-v2026.08.15",
    tradeoffConfigurationId: "object-oriented-design-interview-free-tradeoff-practice-v2",
    reviewConfigurationId: "object-oriented-design-interview-free-weak-area-review-v2",
    nodeCount: 136,
    nodeSha256: "1635ae7e543e5e3c26acd3e9db489e50c71d03865085fc3a36d9192e8e016829",
    trackCount: 1413,
    trackSha256: "7a20a41c7f14a03982558981e7dda04962d951120cf5d53715cace6cca874b69",
  },
  {
    trackId: "frontend-system-design-interview",
    profileId: "frontend-system-design-interview-free-node-v1",
    freeNodeId: "requirements_user_journeys_constraints_and_frontend_decomposition",
    contentVersion: "frontend-system-design-interview-candidate-v2026.08.15",
    tradeoffConfigurationId: "frontend-system-design-interview-free-tradeoff-practice-v2",
    reviewConfigurationId: "frontend-system-design-interview-free-weak-area-review-v2",
    nodeCount: 150,
    nodeSha256: "1fdf8950b3cade9aaf396d64084a99eb2487964f0aa99d4d5b6e5f1fbed06928",
    trackCount: 1766,
    trackSha256: "8055a759f023ab7368ed26b4a4111fd56cd45a335fbae1ef9664155159cbd416",
  },
]);

async function readJson(relativePath) {
  return JSON.parse(await readFile(new URL(relativePath, import.meta.url), "utf8"));
}

function sortQuestions(questions) {
  return [...questions].sort((left, right) => (
    left.questionId < right.questionId ? -1 : left.questionId > right.questionId ? 1 : 0
  ));
}

function modeById(profile, modeId) {
  const mode = profile.modes.find((candidate) => candidate.modeId === modeId);
  assert.ok(mode, `${profile.trackId} is missing ${modeId}`);
  return mode;
}

test("ODK-097 producer profiles expose the approved Design session matrix", async () => {
  const briefs = await loadCanonicalTrackBriefs({ root: CONTENT_ROOT });
  const briefsByTrackId = new Map(briefs.map((brief) => [brief.trackId, brief]));

  for (const expected of DESIGN_TRACKS) {
    const profile = await readJson(`../config/free-node-experience-profiles/${expected.trackId}.json`);
    const brief = briefsByTrackId.get(expected.trackId);
    assert.ok(brief, `${expected.trackId} is missing its canonical track brief`);

    assert.equal(profile.profileId, expected.profileId);
    assert.equal(profile.profileVersion, "2");
    assert.equal(profile.trackId, expected.trackId);
    assert.equal(profile.familyId, "design_interview");
    assert.equal(profile.freeNodeId, expected.freeNodeId);
    assert.deepEqual(profile.primaryEntry, { modeId: LEARN_MODE, requestedLength: 10 });
    assert.deepEqual(profile.modes.map((mode) => mode.modeId), [LEARN_MODE, TRADEOFF_MODE, REVIEW_MODE]);
    assert.equal(new Set(profile.modes.map((mode) => mode.configurationId)).size, profile.modes.length);

    const learn = modeById(profile, LEARN_MODE);
    const tradeoff = modeById(profile, TRADEOFF_MODE);
    const review = modeById(profile, REVIEW_MODE);

    assert.deepEqual(learn.requestedLengths, [1, 10]);
    assert.equal(learn.defaultRequestedLength, 10);
    assert.equal(learn.configurationVersion, "1");
    assert.equal(learn.blueprintModeId, LEARN_MODE);
    assert.equal(learn.availability, "immediate");

    assert.equal(tradeoff.configurationId, expected.tradeoffConfigurationId);
    assert.equal(tradeoff.configurationVersion, "2");
    assert.deepEqual(tradeoff.requestedLengths, [10, 20, 40]);
    assert.equal(tradeoff.defaultRequestedLength, 10);
    assert.equal(tradeoff.blueprintModeId, TRADEOFF_MODE);
    assert.equal(tradeoff.availability, "immediate");

    assert.equal(review.configurationId, expected.reviewConfigurationId);
    assert.equal(review.configurationVersion, "2");
    assert.deepEqual(review.requestedLengths, [1, 10, 20]);
    assert.equal(review.defaultRequestedLength, 10);
    assert.equal(review.blueprintModeId, REVIEW_MODE);
    assert.equal(review.availability, "evidence_conditioned");
    assert.deepEqual(review.selection.reviewSources, ["due_queue"]);
    assert.equal(review.selection.emptyEligibility, "unavailable");
    assert.equal(review.selection.shortening, "truthful_to_eligible_count");
    assert.equal(Object.hasOwn(review.selection, "sessionMissesMustBeCommitted"), false);

    for (const mode of profile.modes) {
      assert.equal(mode.selection.freeNodeId, expected.freeNodeId);
      assert.equal(mode.selection.itemSource, "package_items");
      assert.equal(mode.selection.requireUniqueItemIds, true);
      assert.equal(mode.reinsertPolicy, "disabled");
    }

    assert.equal(brief.freeNodeExperience.profileId, expected.profileId);
    assert.equal(brief.freeNodeExperience.profileVersion, "2");
    assert.equal(brief.freeNodeExperience.profilePath, `config/free-node-experience-profiles/${expected.trackId}.json`);
    assert.deepEqual(brief.freeNodeExperience.modeIds, [LEARN_MODE, TRADEOFF_MODE, REVIEW_MODE]);
  }
});

test("ODK-097 producer changes preserve canonical Design question counts and hashes", async () => {
  for (const expected of DESIGN_TRACKS) {
    const validated = await validateTrack({ rootDirectory: CONTENT_ROOT, trackId: expected.trackId });
    const nodeQuestions = sortQuestions(validated.questions.filter((question) => question.nodeId === expected.freeNodeId));
    const trackQuestions = sortQuestions(validated.questions);

    assert.equal(validated.track.contentVersion, expected.contentVersion);
    assert.equal(nodeQuestions.length, expected.nodeCount);
    assert.equal(sha256(canonicalJson(nodeQuestions)), expected.nodeSha256);
    assert.equal(trackQuestions.length, expected.trackCount);
    assert.equal(sha256(canonicalJson(trackQuestions)), expected.trackSha256);
    assert.equal(new Set(nodeQuestions.map((question) => question.questionId)).size, nodeQuestions.length);
    assert.ok(nodeQuestions.every((question) => question.nodeId === expected.freeNodeId));
  }
});
