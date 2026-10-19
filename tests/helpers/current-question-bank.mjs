import assert from "node:assert/strict";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildTrack, sha256 } from "../../scripts/build.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

/** Read current authoring files and prove they are exactly what the canonical builder emits. */
export async function loadCurrentQuestionBank(trackId) {
  const trackRoot = path.join(ROOT, "content", trackId);
  const outputRoot = await mkdtemp(path.join(os.tmpdir(), "patternly-current-bank-"));
  try {
    const built = await buildTrack({ root: ROOT, trackId, outputRoot });
    const sourceFiles = [...built.sourceFiles].sort();
    assert.ok(sourceFiles.length > 0, `${trackId}: canonical builder reports source files`);
    const authored = [];
    for (const file of sourceFiles) authored.push(...JSON.parse(await readFile(file, "utf8")));
    authored.sort((a, b) => a.questionId < b.questionId ? -1 : a.questionId > b.questionId ? 1 : 0);
    assert.deepEqual(built.questions, authored, `${trackId}: builder reads the current canonical source set`);
    assert.equal(built.artifact.questions.length, authored.length, `${trackId}: artifact includes every canonical source question`);
    for (let index = 0; index < authored.length; index++) {
      const source = authored[index];
      const artifact = built.artifact.questions[index];
      if (Object.hasOwn(artifact, "contentDomainId")) {
        const { contentDomainId, ...sourceFields } = artifact;
        assert.ok(contentDomainId === undefined || typeof contentDomainId === "string", `${source.questionId}: optional domain comes from the current track profile`);
        assert.deepEqual(sourceFields, source, `${source.questionId}: artifact preserves current authored fields`);
      } else {
        assert.deepEqual(artifact, source, `${source.questionId}: artifact equals current authored source`);
      }
    }
    assert.deepEqual(JSON.parse(await readFile(built.artifactPath, "utf8")), built.artifact, `${trackId}: written temporary artifact matches the canonical build result`);
    assert.equal(built.lockEntry.sha256, sha256(built.artifactBytes), "lock entry matches the temporary canonical artifact");
    return { questions: authored, byId: new Map(authored.map((question) => [question.questionId, question])), artifact: built.artifact };
  } finally {
    await rm(outputRoot, { recursive: true, force: true });
  }
}
