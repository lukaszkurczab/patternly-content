import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { canonicalJson, sha256 } from "../build.mjs";

const TRACK_ID = "google-cloud-associate-cloud-engineer";
const HISTORICAL_VERSION = "google-cloud-associate-cloud-engineer-authoring-v2026.08.11";
const HISTORICAL_ITEM_COUNT = 2981;
const HISTORICAL_NODE_COUNT = 20;
const HISTORICAL_ARTIFACT_PATH = `artifacts/tracks/${TRACK_ID}/${HISTORICAL_VERSION}/track-artifact.json`;
const HISTORICAL_ARTIFACT_SHA256 = "732f915e43542ca1318bf32aafd1f2cfab77012eb3c8d236a362a92a993740e4";
const HISTORICAL_CROSSWALK_SHA256 = "a60cd7cf6b65f127d9e7550a8979b03a52efd4cdebd2abe2fa42659aeef4bf51";
const compare = (left, right) => left < right ? -1 : left > right ? 1 : 0;

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

export async function verifyGcpAttributionHistory({ rootDirectory }) {
  const { result } = await loadPinnedHistoricalEvidence(rootDirectory);
  return result;
}

async function loadPinnedHistoricalEvidence(rootDirectory) {
  const artifactPath = path.resolve(rootDirectory, HISTORICAL_ARTIFACT_PATH);
  const wrapper = await readJson(artifactPath);
  if (wrapper.trackId !== TRACK_ID || wrapper.contentVersion !== HISTORICAL_VERSION || wrapper.checksumSha256 !== HISTORICAL_ARTIFACT_SHA256 || sha256(wrapper.artifactBytes) !== wrapper.checksumSha256) {
    throw new Error("GCP historical attribution artifact checksum or identity is invalid");
  }
  const artifact = JSON.parse(wrapper.artifactBytes);
  const items = artifact?.bank?.items;
  if (!Array.isArray(items) || items.length !== HISTORICAL_ITEM_COUNT || artifact.contentVersion !== HISTORICAL_VERSION || artifact.bank.trackId !== TRACK_ID || artifact.bank.contentVersion !== HISTORICAL_VERSION) {
    throw new Error("GCP historical attribution inventory is invalid");
  }
  const historicalCrosswalk = items.map((item) => ({ questionId: item.id, nodeId: item.nodeId, domain: item.domain }))
    .sort((left, right) => compare(left.questionId, right.questionId));
  const nodeCount = new Set(historicalCrosswalk.map((item) => item.nodeId)).size;
  if (new Set(historicalCrosswalk.map((item) => item.questionId)).size !== HISTORICAL_ITEM_COUNT || nodeCount !== HISTORICAL_NODE_COUNT || sha256(historicalCrosswalk) !== HISTORICAL_CROSSWALK_SHA256) {
    throw new Error("GCP historical attribution crosswalk differs from its immutable pin");
  }
  return { historicalCrosswalk, result: {
      trackId: TRACK_ID,
      historicalContentVersion: HISTORICAL_VERSION,
      itemCount: historicalCrosswalk.length,
      nodeCount,
      historicalArtifactSha256: HISTORICAL_ARTIFACT_SHA256,
      crosswalkSha256: HISTORICAL_CROSSWALK_SHA256
    } };
}

export async function verifyGcpCurrentAttributionParity({ rootDirectory, track, questions }) {
  const { historicalCrosswalk, result: historical } = await loadPinnedHistoricalEvidence(rootDirectory);
  const config = await readJson(path.join(rootDirectory, "config/tracks", `${TRACK_ID}.json`));
  const attribution = config.profile.currentAttribution;
  const evidence = config.profile.nodeDomainMapEvidence;
  if (evidence.contentVersion !== HISTORICAL_VERSION || evidence.artifactPath !== HISTORICAL_ARTIFACT_PATH || evidence.itemCount !== HISTORICAL_ITEM_COUNT || evidence.nodeCount !== HISTORICAL_NODE_COUNT || evidence.ambiguousNodeCount !== 0) {
    throw new Error("GCP current profile does not preserve the pinned historical attribution identity");
  }
  const currentCrosswalk = questions.map((question) => ({
    questionId: question.questionId,
    nodeId: question.nodeId,
    domain: config.profile.nodeDomainMap[question.nodeId]
  })).sort((left, right) => compare(left.questionId, right.questionId));
  if (canonicalJson(currentCrosswalk) !== canonicalJson(historicalCrosswalk)) {
    throw new Error("GCP current source attribution differs from the verified historical question map");
  }
  if (attribution.historicalArtifactSha256 !== historical.historicalArtifactSha256 || attribution.historicalCrosswalkSha256 !== historical.crosswalkSha256) {
    throw new Error("GCP current attribution historical provenance pins differ from frozen evidence");
  }
  const inventorySha256 = sha256(questions.map((question) => question.questionId).sort(compare));
  if (track.trackId !== TRACK_ID || attribution.contentVersion !== track.contentVersion || attribution.itemCount !== questions.length || inventorySha256 !== attribution.inventorySha256 || sha256(currentCrosswalk) !== attribution.crosswalkSha256) {
    throw new Error("GCP current source identity differs from its attribution metadata");
  }
  return {
    currentContentVersion: track.contentVersion,
    ...historical
  };
}

async function main() {
  const rootDirectory = path.resolve(process.argv[2] ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.."));
  const result = await verifyGcpAttributionHistory({ rootDirectory });
  console.log(`Verified GCP historical attribution: ${result.itemCount} questions, ${result.nodeCount} nodes, ${result.crosswalkSha256}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
