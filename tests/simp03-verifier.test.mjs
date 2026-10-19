import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { secureFile } from "../scripts/content/verify-primary-strata-readiness.mjs";

test("current readiness file resolver accepts regular in-root files and rejects traversal", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "patternly-current-path-") );
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "inputs"));
  await writeFile(path.join(root, "inputs/current.json"), "{}\n");

  assert.equal(await secureFile(root, "inputs/current.json"), path.join(root, "inputs/current.json"));
  await assert.rejects(secureFile(root, "../outside.json"), /input_path_invalid/u);
  await assert.rejects(secureFile(root, path.join(root, "inputs/current.json")), /input_path_invalid/u);
});

test("current readiness file resolver rejects symlinked files and symlinked ancestors", async (t) => {
  const parent = await mkdtemp(path.join(os.tmpdir(), "patternly-current-symlink-") );
  t.after(() => rm(parent, { recursive: true, force: true }));
  const root = path.join(parent, "repo");
  await mkdir(path.join(root, "inputs"), { recursive: true });
  await writeFile(path.join(root, "inputs/target.json"), "{}\n");
  await symlink("target.json", path.join(root, "inputs/alias.json"));
  await assert.rejects(secureFile(root, "inputs/alias.json"), /input_symlink_disallowed/u);

  await symlink(root, path.join(parent, "repo-alias"));
  await assert.rejects(secureFile(path.join(parent, "repo-alias"), "inputs/target.json"), /input_symlink_disallowed/u);
});
