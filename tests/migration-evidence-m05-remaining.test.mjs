import assert from "node:assert/strict";
import { mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { canonicalJson, sha256 } from "../scripts/build.mjs";
import { MigrationVerificationError, verifyMigration } from "../scripts/content/verify-migration.mjs";
import { loadCandidateManifest, verifyCandidateCurrentSource } from "../scripts/review/candidate-manifest.mjs";
import { copyCurrentMigrationFixture } from "./helpers/current-migration-fixture.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const proofs = [
  {
    "name": "BIZQ01_BESD_COHORT14_PROOF",
    "path": "evidence/business-quality/bizq-01-besd-seed-cohort-14.json"
  },
  {
    "name": "BIZQ01_BESD_COHORT15_PROOF",
    "path": "evidence/business-quality/bizq-01-besd-cohort-15.json"
  },
  {
    "name": "FESD_N08_PROOF",
    "path": "evidence/business-quality/fesd-n08-20261011.json"
  },
  {
    "name": "BIZQ01_COPY_PROOF",
    "path": "evidence/business-quality/bizq-01-coding-source-copy-04.json"
  },
  {
    "name": "BIZQ01_OOD_PROOF",
    "path": "evidence/business-quality/bizq-01-ood-source-11.json"
  },
  {
    "name": "BIZQ01_OOD_SUCCESSOR_PROOF",
    "path": "evidence/business-quality/bizq-01-ood-source-12.json"
  },
  {
    "name": "BIZQ01_OOD_COHORT13_PROOF",
    "path": "evidence/business-quality/bizq-01-ood-unit-cohort-13.json"
  },
  {
    "name": "BIZQ01_OOD_COHORT16_PROOF",
    "path": "evidence/business-quality/bizq-01-ood-node-closure-16.json"
  },
  {
    "name": "BIZQ01_OOD_COHORT17_PROOF",
    "path": "evidence/business-quality/bizq-01-ood-node-closure-17.json"
  },
  {
    "name": "BIZQ01_OOD_COHORT19_PROOF",
    "path": "evidence/business-quality/bizq-01-ood-node-closure-19.json"
  },
  {
    "name": "BIZQ01_OOD_COHORT23_PROOF",
    "path": "evidence/business-quality/bizq-01-ood-node-closure-23.json"
  },
  {
    "name": "BIZQ01_OOD_COHORT24_PROOF",
    "path": "evidence/business-quality/bizq-01-ood-node-closure-24.json"
  },
  {
    "name": "BIZQ01_OOD_COHORT22_PROOF",
    "path": "evidence/business-quality/bizq-01-ood-node-closure-22.json"
  },
  {
    "name": "BIZQ01_OOD_COHORT21_PROOF",
    "path": "evidence/business-quality/bizq-01-ood-node-closure-21.json"
  },
  {
    "name": "BIZQ01_OOD_COHORT20_PROOF",
    "path": "evidence/business-quality/bizq-01-ood-node-closure-20.json"
  },
  {
    "name": "BIZQ01_OOD_REASON_AMENDMENT_19A_PROOF",
    "path": "evidence/business-quality/bizq-01-ood-reason-amendment-19a.json"
  }
];

function reverseKeys(value) {
  if (Array.isArray(value)) return value.map(reverseKeys);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).reverse().map(([key, item]) => [key, reverseKeys(item)]));
  return value;
}

function mutations(proof) {
  const identity = structuredClone(proof);
  identity.questionSetSha256 = "0".repeat(64);
  const oldObject = structuredClone(proof);
  const item = oldObject.replacements?.[0] ?? oldObject.sameIdCorrections?.[0] ?? oldObject;
  if (item.beforeQuestion) item.beforeQuestion.prompt += " changed";
  else { assert.equal(typeof item.beforeReason, "string"); item.beforeReason += " changed"; }
  const order = structuredClone(proof);
  let orderLabel;
  if (order.replacements?.length > 1) { order.replacements.reverse(); orderLabel = "replacements order"; }
  else if (order.sameIdCorrections?.length > 1) { order.sameIdCorrections.reverse(); orderLabel = "sameIdCorrections order"; }
  else if (order.sources?.length > 1) { order.sources.reverse(); orderLabel = "sources order"; }
  else { order.replacements[0].beforeQuestion.interaction.options.reverse(); orderLabel = "historical option order"; }
  const cases = [
    ["question-set pin", JSON.stringify(identity)],
    ["historical object changedhash", JSON.stringify(oldObject)],
    ["corrupt proof JSON", "{"],
    [orderLabel, JSON.stringify(order)],
    ["JSON key reorder", JSON.stringify(reverseKeys(proof))],
    ["root JSON key reorder", JSON.stringify(Object.fromEntries(Object.entries(proof).reverse()))]
  ];
  if (proof.sourceFiles?.length > 1) cases.push(["sourceFiles order", JSON.stringify({ ...proof, sourceFiles: [...proof.sourceFiles].reverse() })]);
  return cases;
}

test("all 16 M05 extractions preserve complete results and actual proof validation stages", async (t) => {
  const fixtureRoot = await realpath(await mkdtemp(path.join(os.tmpdir(), "patternly-m05-remaining-")));
  t.after(() => rm(fixtureRoot, { recursive: true, force: true }));
  // Eight actual banks plus historical Claude918. This is refactor evidence, not release admission.
  await copyCurrentMigrationFixture(root, fixtureRoot);
  const candidate = await loadCandidateManifest(root);
  const verify = () => verifyMigration({ contentRoot: path.join(fixtureRoot, "content") });
  const consume = () => verifyCandidateCurrentSource({ root: fixtureRoot, candidate });
  const accepted = await verify();
  const consumed = await consume();
  const { contentRoot: _randomFixturePath, ...verified } = accepted;
  assert.equal(verified.result, "passed");
  const baselinePath = path.join(root, "tests/fixtures/migration-evidence-m05-baseline.json");
  const baseline = JSON.parse(await readFile(baselinePath));
  assert.deepEqual(verified, baseline.verified);
  assert.deepEqual(consumed, baseline.consumed);
  t.diagnostic(`complete verifier=${sha256(canonicalJson(verified))}; consumer=${sha256(canonicalJson(consumed))}`);
  const exercised = [];

  async function outcome(action) {
    try {
      const result = await action();
      if (Array.isArray(result)) assert.deepEqual(result, consumed);
      else assert.deepEqual(result, accepted);
      return { result: "accepted" };
    } catch (error) {
      assert.ok(error instanceof MigrationVerificationError, error.stack);
      return { result: "rejected", code: error.code, message: error.message.replaceAll(fixtureRoot, "<fixture>") };
    }
  }

  for (const { name, path: proofPath } of proofs) {
    const target = path.join(fixtureRoot, proofPath);
    const original = await readFile(target);
    const proof = JSON.parse(original);
    for (const [kind, bytes] of mutations(proof)) {
      const key = `${name}: ${kind}`;
      exercised.push(key);
      await t.test(key, async () => {
        try {
          await writeFile(target, bytes);
          const actual = { verifier: await outcome(verify), consumer: await outcome(consume) };
          assert.deepEqual(actual.verifier, actual.consumer);
          assert.deepEqual(actual, baseline.cases[key]);
        } finally {
          await writeFile(target, original);
        }
      });
    }
  }
  assert.deepEqual(await verify(), accepted);
  assert.deepEqual(await consume(), consumed);
  assert.deepEqual(exercised.sort(), Object.keys(baseline.cases).sort());
});

function freezeShape(value, prefix = "") {
  if (!value || typeof value !== "object") return [];
  return [[prefix, Object.isFrozen(value)], ...Object.entries(value).flatMap(([key, child]) => freezeShape(child, `${prefix}/${key}`))];
}

test("M05 static extraction keeps exact declarations, freeze depth, private API and verifier remainder", async () => {
  const { structure } = JSON.parse(await readFile(path.join(root, "tests/fixtures/migration-evidence-m05-baseline.json")));
  const verifier = await import("../scripts/content/verify-migration.mjs");
  assert.deepEqual(Object.keys(verifier), structure.verifierExports);
  assert.equal(verifier.verifyCanonicalContent, verifier.verifyMigration);
  let remainder = await readFile(path.join(root, "scripts/content/verify-migration.mjs"), "utf8");
  for (const statement of structure.imports) {
    assert.equal(remainder.split(statement).length - 1, 1);
    remainder = remainder.replace(statement, "");
  }
  assert.equal(sha256(remainder), structure.remainderSha256);
  for (const [filename, expected] of Object.entries(structure.modules)) {
    const source = await readFile(path.join(root, "evidence/migration-verifier", filename), "utf8");
    assert.equal(sha256(source), expected.sha256, filename);
    const module = await import(new URL(`../evidence/migration-verifier/${filename}`, import.meta.url));
    assert.deepEqual(Object.keys(module).sort(), [...expected.exports].sort());
    for (const name of expected.exports) {
      const declaration = source.match(new RegExp(`^export (const ${name} = .*?^\\}\\);)`, "ms"))?.[1];
      const pinned = structure.declarations[name];
      assert.ok(declaration, name);
      assert.equal(sha256(declaration), pinned.sha256, name);
      assert.equal(declaration.split("Object.freeze").length - 1, pinned.freezeCount, name);
      assert.equal(sha256(JSON.stringify(module[name])), pinned.valueSha256, name);
      assert.equal(sha256(JSON.stringify(freezeShape(module[name]))), pinned.freezeShapeSha256, name);
      assert.equal(Object.hasOwn(verifier, name), false, name);
      assert.equal(remainder.includes(`const ${name} =`), false, name);
    }
  }
});
