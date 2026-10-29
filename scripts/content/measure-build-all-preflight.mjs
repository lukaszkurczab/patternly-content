import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile, readdir, mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { registerHooks } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// Local diagnostic only. Each invocation runs one operation in a fresh process.
// Usage: node scripts/content/measure-build-all-preflight.mjs control|instrument <private-parent>
const root = path.resolve(fileURLToPath(new URL("../../", import.meta.url)));
const builderUrl = pathToFileURL(path.join(root, "scripts/build.mjs")).href;
const hash = (value) => createHash("sha256").update(value).digest("hex");
const json = (value) => JSON.stringify(value, null, 2) + "\n";
const symbols = ["loadValidatedCatalog", "validateTrackBindingSources", "validateTrack"];

async function fingerprintInputs() {
  const files = {};
  async function visit(relative) {
    const full = path.join(root, relative);
    for (const entry of (await readdir(full, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      const child = path.join(relative, entry.name);
      assert(!entry.isSymbolicLink(), `Unexpected input symlink: ${child}`);
      if (entry.isDirectory()) await visit(child);
      else if (entry.isFile()) files[child] = hash(await readFile(path.join(root, child)));
    }
  }
  for (const directory of ["content", "config", "scripts", "schemas"]) await visit(directory);
  files["package.json"] = hash(await readFile(path.join(root, "package.json")));
  return { sha256: hash(json(files)), files };
}

async function main() {
  const [mode, parent] = process.argv.slice(2);
  assert(["control", "instrument"].includes(mode) && parent, "Expected control|instrument <private-parent>");
  await mkdir(path.resolve(parent), { recursive: true });
  const runDirectory = await mkdtemp(path.join(path.resolve(parent), `${mode}-`));
  const outputRoot = path.join(runDirectory, "output"); // Always absent at entry.
  const before = await fingerprintInputs();
  const events = [];
  const stack = [];
  const observer = {
    enter(name, trackId) {
      const event = { id: events.length, parent: stack.at(-1)?.id ?? null, name, trackId, start_ms: performance.now() };
      events.push(event);
      stack.push(event);
      return event;
    },
    leave(event) {
      event.end_ms = performance.now();
      event.elapsed_ms = event.end_ms - event.start_ms;
      assert.equal(stack.pop(), event, "Unexpected concurrent measurement; cannot attribute nested intervals");
    }
  };
  let hook;
  let transformed;
  const original = await readFile(fileURLToPath(builderUrl), "utf8");
  try {
    if (mode === "instrument") {
      assert(!Object.hasOwn(globalThis, "__patternlyPreflightObserver"));
      globalThis.__patternlyPreflightObserver = observer;
      hook = registerHooks({ load(url, context, nextLoad) {
        const loaded = nextLoad(url, context);
        if (url !== builderUrl) return loaded;
        let source = String(loaded.source);
        assert.equal(source, original, "Builder changed before instrumentation");
        for (const name of symbols) {
          // Current builder functions have single-line signatures and column-zero closing braces.
          // Refuse to guess after a source-layout change.
          const pattern = new RegExp(`(async function ${name}\\([^\\n]*\\) \\{)([\\s\\S]*?)(\\n\\})`, "g");
          assert.equal([...source.matchAll(pattern)].length, 1, `Ambiguous boundary for ${name}`);
          source = source.replace(pattern, (_match, signature, body, close) =>
            `${signature}\nconst __measurement = globalThis.__patternlyPreflightObserver.enter(${JSON.stringify(name)}, ${name === "validateTrack" ? "trackId" : "null"});\ntry {${body}\n} finally { globalThis.__patternlyPreflightObserver.leave(__measurement); }${close}`);
        }
        transformed = source;
        return { ...loaded, source };
      } });
    }
    const { buildAll } = await import(builderUrl);
    const start = performance.now();
    const built = await buildAll({ rootDirectory: root, outputRoot });
    const elapsed_ms = performance.now() - start;
    assert.equal(stack.length, 0);
    assert.equal(built.artifacts.length, 9, "Expected current nine-bank baseline");
    const outputFiles = (await readdir(outputRoot)).sort();
    const expectedFiles = ["content-lock.json", ...built.lock.tracks.map(({ trackId }) => `${trackId}.json`)].sort();
    assert.deepEqual(outputFiles, expectedFiles);
    const outputs = {};
    for (const file of outputFiles) {
      const bytes = await readFile(path.join(outputRoot, file));
      outputs[file] = { sha256: hash(bytes), bytes: bytes.length };
    }
    for (const entry of built.lock.tracks) assert.equal(outputs[`${entry.trackId}.json`].sha256, entry.sha256);
    const after = await fingerprintInputs();
    assert.deepEqual(after, before, "Inputs changed during build");
    const aggregates = Object.fromEntries(symbols.map((name) => {
      const matching = events.filter((event) => event.name === name);
      return [name, { count: matching.length, inclusive_ms: matching.reduce((sum, event) => sum + event.elapsed_ms, 0) }];
    }));
    if (mode === "instrument") {
      assert(transformed, "Hook did not load builder");
      assert.equal(aggregates.validateTrack.count, 9);
      assert.equal(aggregates.loadValidatedCatalog.count, 10);
      assert.equal(aggregates.validateTrackBindingSources.count, 10);
      await writeFile(path.join(runDirectory, "instrumented-build.mjs.txt"), transformed);
    }
    const report = {
      task_id: "PAT-OPT-008.1", scope_id: "PAT-OPT-008-S01", mode, operation_state: "terminal",
      environment: { node: process.version, executable: process.execPath, platform: process.platform, arch: process.arch, os_release: os.release(), cpu: os.cpus()[0]?.model, cpu_count: os.cpus().length, root },
      candidate: { head: execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim(), builder_sha256: hash(original), instrumented_sha256: transformed ? hash(transformed) : null, inputs: before },
      runDirectory, outputRoot, elapsed_ms, aggregates, events, outputs,
      tracks: built.lock.tracks, total_questions: built.lock.tracks.reduce((sum, entry) => sum + entry.questionCount, 0),
      limits: "Inclusive wall time; nested binding-source time is part of common preflight, never additive. Fresh process and empty output; uncontrolled warm OS caches. Timing excludes module import, input/output hashing and report IO. No optimized candidate measured."
    };
    await writeFile(path.join(runDirectory, "sample.json"), json(report));
    console.log(json({ runDirectory, elapsed_ms, aggregates, input_sha256: before.sha256, output_manifest_sha256: hash(json(outputs)) }).trim());
  } catch (error) {
    await writeFile(path.join(runDirectory, "failure.json"), json({ task_id: "PAT-OPT-008.1", scope_id: "PAT-OPT-008-S01", operation_state: "terminal", stage: "local-baseline", category: error.name, message: error.message }));
    throw error;
  } finally {
    hook?.deregister();
    if (mode === "instrument") delete globalThis.__patternlyPreflightObserver;
  }
}

main().catch((error) => { console.error(`Preflight baseline failed (${error.name}); inspect private failure.json`); process.exitCode = 1; });
