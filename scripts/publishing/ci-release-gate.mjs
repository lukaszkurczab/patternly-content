import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildReleaseCandidate } from "./pipeline.mjs";

const outputRoot = await mkdtemp(join(tmpdir(), "patternly-content-release-gate-"));
try {
  const candidate = await buildReleaseCandidate({ outputRoot });
  process.stdout.write(`${JSON.stringify({ releaseCandidate: candidate })}\n`);
} finally {
  await rm(outputRoot, { recursive: true, force: true });
}
