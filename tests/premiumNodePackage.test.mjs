import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, writeFile, mkdir, cp, rm } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { gunzipSync } from "node:zlib";
import { buildPremiumNodePackage, canonicalJson, sha256, parseArgs } from "../scripts/build.mjs";
const root = path.resolve(import.meta.dirname, "..");
const appRoot = path.resolve(root, "../patternly");
const trackId = "aws-certified-solutions-architect-associate", nodeId = "identity_federation_and_root_access";
async function workspace(t) {
  const base = await mkdtemp(path.join(tmpdir(), "patternly-premium19-build-"));
  t.after(() => rm(base, { recursive: true, force: true }));
  const content = path.join(base, "content"), app = path.join(base, "app");
  const admission = JSON.parse(await readFile(path.join(root, "evidence/admissions/candidate-admission-v3.json"), "utf8"));
  for (const relative of ["evidence/admissions/candidate-admission-v3.json", admission.runtimeEvidence.path, admission.candidatePath, admission.release.releasePath, `reports/candidate-reconciliation/AWS-02-DRAFT/release/artifacts/${trackId}.json`, `config/free-node-experience-profiles/${trackId}.json`]) {
    await mkdir(path.dirname(path.join(content, relative)), { recursive: true }); await cp(path.join(root, relative), path.join(content, relative));
  }
  for (const relative of ["integration/contracts/content-release/release.lock.json", "src/content/generated/canonical-content/content-lock.json", `src/content/generated/canonical-content/${trackId}.json`]) {
    await mkdir(path.dirname(path.join(app, relative)), { recursive: true }); await cp(path.join(appRoot, relative), path.join(app, relative));
  }
  return { rootDirectory: content, appRoot: app, trackId, nodeId, outputRoot: path.join(base, "output") };
}
test("existing builder derives the complete admitted node deterministically and writes only metadata to app", async (t) => {
  const options = await workspace(t), result = await buildPremiumNodePackage(options);
  const bytes = await readFile(result.packageFile), payloadBytes = gunzipSync(bytes), payload = JSON.parse(payloadBytes);
  const source = JSON.parse(await readFile(path.join(root, `reports/candidate-reconciliation/AWS-02-DRAFT/release/artifacts/${trackId}.json`), "utf8"));
  assert.deepEqual(payload.items, source.questions.filter((item) => item.nodeId === nodeId));
  assert.equal(payload.items.length, 123); assert.equal(result.derivation.mentalUnitIds.length, 6);
  assert.equal(sha256(payloadBytes), result.offer.artifactSha256); assert.equal(sha256(bytes), result.manifest.packageSha256);
  assert.equal(result.derivation.sourceArtifactSha256, "350dc44eed14c7087bfdd79196d84d5ca16c606b449536f8c35078b4116a6fc6");
  const first = await readFile(result.offerPath); assert.equal(first.includes(Buffer.from('"items"')), false);
  assert.deepEqual(await buildPremiumNodePackage(options), result); assert.deepEqual(await readFile(result.packageFile), bytes); assert.deepEqual(await readFile(result.offerPath), first);
});
test("source bytes and current selected application binding fail before offer writes", async (t) => {
  for (const which of ["source", "app", "bundle", "releaseLock"]) {
    const options = await workspace(t);
    const relative = which === "source" ? `reports/candidate-reconciliation/AWS-02-DRAFT/release/artifacts/${trackId}.json` : which === "app" ? `src/content/generated/canonical-content/${trackId}.json` : which === "bundle" ? "src/content/generated/canonical-content/content-lock.json" : "integration/contracts/content-release/release.lock.json";
    const file = path.join(which === "source" ? options.rootDirectory : options.appRoot, relative);
    if (which === "bundle") { const value = JSON.parse(await readFile(file, "utf8")); value.tracks.find((row) => row.trackId === trackId).sha256 = "0".repeat(64); await writeFile(file, canonicalJson(value)); }
    else await writeFile(file, Buffer.concat([await readFile(file), Buffer.from(" ")]));
    await assert.rejects(buildPremiumNodePackage(options), /admission|checksum|differs|admitted/u, which);
    await assert.rejects(readFile(path.join(options.appRoot, "src/content/generated/premium-node-offer.json")), { code: "ENOENT" });
  }
});
test("Free or unknown node and immutable gzip conflict do not create an offer", async (t) => {
  for (const rejected of ["aws_secure_architecture_foundations", "missing-node"]) await assert.rejects(buildPremiumNodePackage({ ...await workspace(t), nodeId: rejected }), /non-Free|capacity/u);
  const options = await workspace(t), result = await buildPremiumNodePackage(options), before = await readFile(result.offerPath);
  await writeFile(result.packageFile, Buffer.from("wrong"));
  await assert.rejects(buildPremiumNodePackage(options), /immutable output conflict/u);
  assert.deepEqual(await readFile(result.offerPath), before);
});
test("existing builder CLI requires explicit whole-node arguments and keeps old commands strict", () => {
  assert.equal(parseArgs(["build-premium-node", "--track", trackId, "--node", nodeId]).nodeId, nodeId);
  assert.throws(() => parseArgs(["build-premium-node", "--track", trackId]), /required/u);
  assert.throws(() => parseArgs(["build", "--track", trackId, "--node", nodeId]), /require build-premium/u);
});
