import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, realpath, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { canonicalJson, sha256 } from "../scripts/build.mjs";
import { MigrationVerificationError, verifyMigration } from "../scripts/content/verify-migration.mjs";
import { loadCandidateManifest, verifyCandidateCurrentSource } from "../scripts/review/candidate-manifest.mjs";
import { copyCurrentMigrationFixture } from "./helpers/current-migration-fixture.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePaths = [
  "content/aws-certified-solutions-architect-associate/api_messaging_event_and_workflow_decoupling/amazon_mq_protocol_preserving_integration.json",
  "content/backend-system-design-interview/api_contracts_service_boundaries_and_request_flows/BESD-N02-B01.json",
  "content/claude-certified-architect-professional-certification/enterprise_tools_retrieval_and_integration/CCARP-D03-O01.json",
  "content/coding-interview-dsa-problem-solving/arrays_and_strings/duplicate_handling.json",
  "content/object-oriented-design-interview/behavior_state_commands_events_and_workflows/OOD-N06-B01.json"
];

test("current producer bank extraction preserves accepted migration and the real candidate consumer", async (t) => {
  const fixtureRoot = await realpath(await mkdtemp(path.join(os.tmpdir(), "patternly-m05-current-banks-")));
  t.after(() => rm(fixtureRoot, { recursive: true, force: true }));
  // Actual eight banks plus fixed historical Claude918; not current candidate acceptance.
  await copyCurrentMigrationFixture(root, fixtureRoot);
  const candidate = await loadCandidateManifest(root);
  const verify = () => verifyMigration({ contentRoot: path.join(fixtureRoot, "content") });
  const consume = () => verifyCandidateCurrentSource({ root: fixtureRoot, candidate });
  const accepted = await verify();
  const consumed = await consume();
  assert.equal(accepted.result, "passed");
  // Fingerprint the complete pre-extraction outputs, excluding only the random root.
  const { contentRoot: _temporaryRoot, ...stableAccepted } = accepted;
  assert.equal(sha256(canonicalJson(stableAccepted)), "396b2ef6f9dcc50222afeccf48d73b8a85082101a4b14c043298fd9ad828304f");
  assert.equal(sha256(canonicalJson(consumed)), "d368bc9b6f0993223b9109a7805597533f8cdffda0b8480e25aa9c31b71c43d1");

  const identities = [];
  for (const sourcePath of sourcePaths) {
    const trackId = sourcePath.split("/")[1];
    const trackRoot = path.join(fixtureRoot, "content", trackId);
    const questions = [];
    for (const node of (await readdir(trackRoot)).sort()) {
      for (const file of (await readdir(path.join(trackRoot, node))).sort()) {
        questions.push(...JSON.parse(await readFile(path.join(trackRoot, node, file))));
      }
    }
    // Match the verifier's lexical comparator; locale collation changes AWS ordering.
    questions.sort((left, right) => left.questionId === right.questionId ? 0 : left.questionId < right.questionId ? -1 : 1);
    identities.push([trackId, { questionCount: questions.length, questionSetSha256: sha256(questions) }]);
  }
  // All five pinned identities and entry/key order, without another production map.
  assert.equal(sha256(JSON.stringify(identities)), "c586b504ceaf9b8ec17cec02757e1ebbba31338884fce0b534edce3991607590");

  async function withBytes(relativePath, bytes, action) {
    const target = path.join(fixtureRoot, relativePath);
    const original = await readFile(target);
    try {
      await writeFile(target, bytes);
      await action();
    } finally {
      await writeFile(target, original);
    }
  }

  for (const [index, sourcePath] of sourcePaths.entries()) {
    const [trackId, identity] = identities[index];
    const source = JSON.parse(await readFile(path.join(fixtureRoot, sourcePath)));
    assert.ok(source.length > 1);
    const changed = structuredClone(source);
    changed[0].prompt += " changed";
    // AWS's full-bank check precedes validateCurrentProducerBanks. The other four
    // prompt/count mutations reach that validator; assert the observed stage too.
    const bankMessage = trackId === "aws-certified-solutions-architect-associate"
      ? "HASH_MISMATCH: Current AWS SAA questions do not match the fixed targeted-correction successor."
      : `HASH_MISMATCH: Current ${trackId} bank differs from its fixed accepted ${identity.questionCount}-question bank.`;
    for (const [name, bytes, code, message] of [
      ["changedhash prompt", JSON.stringify(changed), "HASH_MISMATCH", bankMessage],
      ["changed bank count", JSON.stringify(source.slice(0, -1)), "HASH_MISMATCH", bankMessage],
      ["corrupt canonical JSON", "{", "INVALID_JSON", undefined],
      ["canonical question order", JSON.stringify([...source].reverse()), "CANONICAL_ORDER", undefined]
    ]) {
      await t.test(`${trackId}: ${name}`, () => withBytes(sourcePath, bytes, async () => {
        for (const action of [verify, consume]) {
          await assert.rejects(action(), error => {
            assert.ok(error instanceof MigrationVerificationError);
            assert.equal(error.code, code);
            if (message) assert.equal(error.message, message);
            return true;
          });
        }
      }));
    }
  }

  await t.test("catalog track order is set-based", async () => {
    const catalog = JSON.parse(await readFile(path.join(fixtureRoot, "content/catalog.json")));
    catalog.tracks.reverse();
    await withBytes("content/catalog.json", JSON.stringify(catalog), async () => {
      assert.deepEqual(await verify(), accepted);
      assert.deepEqual(await consume(), consumed);
    });
  });
  assert.deepEqual(await verify(), accepted);
  assert.deepEqual(await consume(), consumed);
});
