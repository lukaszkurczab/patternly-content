import { createHash } from "node:crypto";
import { lstat, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";

import { validateSchema } from "../review/schema-validation.mjs";

const ROOT = path.resolve(fileURLToPath(new URL("../../", import.meta.url)));
const CONFIG_PATH = "config/bundled-free-node-packages.json";
const ACCEPTANCE_PATH = "evidence/bundled-free-node-package-acceptance-v2.json";
const CONFIG_SCHEMA_PATH = "schemas/product/bundled-free-node-packages.schema.json";
const PACKAGE_SCHEMA_PATH = "schemas/product/bundled-free-node.schema.json";
export const BUNDLED_FREE_NODE_LIMITS = Object.freeze({ packageBytes: 2 * 1024 * 1024, compressedBytes: 1024 * 1024, uncompressedBytes: 4 * 1024 * 1024 });
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

function canonical(value) {
  if (value === null || ["boolean", "number", "string"].includes(typeof value)) return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (!value || typeof value !== "object") throw new TypeError("Only JSON values are canonicalizable.");
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
}

function hasExactKeys(value, keys) {
  return value && typeof value === "object" && !Array.isArray(value)
    && canonical(Object.keys(value).sort()) === canonical([...keys].sort());
}

function validateAcceptanceAuthority(acceptance) {
  const exactKeys = ["schemaVersion", "authority", "taskId", "decision", "decisionRationale", "evidenceDate", "boundaries", "packages"];
  if (!hasExactKeys(acceptance, exactKeys)
    || acceptance.schemaVersion !== "patternly-bundled-free-node-package-acceptance-v2"
    || acceptance.authority !== "delegated_codex"
    || acceptance.taskId !== "CI-CONTRACT/A2b"
    || acceptance.decision !== "accepted_package_binding_only"
    || acceptance.decisionRationale !== "This delegated review accepts only the exact configured Free-node package bytes and their item-level bindings to accepted content release artifacts for CI validation. It grants no publishing or runtime admission and does not modify or supersede the app release lock."
    || acceptance.evidenceDate !== "2026-09-25"
    || !hasExactKeys(acceptance.boundaries, ["publishingAdmission", "runtimeAdmission", "appReleaseLockUpdated", "appReleaseLockAuthority"])
    || acceptance.boundaries.publishingAdmission !== "not_granted"
    || acceptance.boundaries.runtimeAdmission !== "not_granted"
    || acceptance.boundaries.appReleaseLockUpdated !== false
    || acceptance.boundaries.appReleaseLockAuthority !== "AWS-02/ADMISSION"
    || !Array.isArray(acceptance.packages)
    || acceptance.packages.some((entry) => !hasExactKeys(entry, ["trackId", "packageVersion", "packageSha256", "sourceArtifactChecksumSha256"]))) {
    throw new Error(`${ACCEPTANCE_PATH} has unsupported delegated authority or boundaries.`);
  }
}

async function readJson(root, relativePath) {
  return JSON.parse(await readFile(path.join(root, relativePath), "utf8"));
}

export async function validateBundledFreeNode({ root = ROOT, trackId, packageVersion, minimumAppVersion }) {
  const relativePath = `artifacts/bundled-free-nodes/${trackId}/${packageVersion}/package.json`;
  const acceptance = JSON.parse(await readFile(path.join(root, ACCEPTANCE_PATH), "utf8"));
  const accepted = acceptance.packages.find((entry) => entry.trackId === trackId && entry.packageVersion === packageVersion);
  validateAcceptanceAuthority(acceptance);
  if (!accepted || !/^[a-f0-9]{64}$/.test(accepted.packageSha256) || !/^[a-f0-9]{64}$/.test(accepted.sourceArtifactChecksumSha256)) {
    throw new Error(`${relativePath} has no valid accepted package digest.`);
  }
  const fileInfo = await lstat(path.join(root, relativePath));
  if (fileInfo.isSymbolicLink() || !fileInfo.isFile()) throw new Error(`${relativePath} must be a regular file.`);
  if (fileInfo.size > BUNDLED_FREE_NODE_LIMITS.packageBytes) throw new Error(`${relativePath} exceeds the ${BUNDLED_FREE_NODE_LIMITS.packageBytes}-byte package limit.`);
  const [packageBytes, packageSchema] = await Promise.all([
    readFile(path.join(root, relativePath)),
    readFile(path.join(root, PACKAGE_SCHEMA_PATH), "utf8").then(JSON.parse),
  ]);
  if (sha256(packageBytes) !== accepted.packageSha256) throw new Error(`${relativePath} does not match its accepted package SHA-256.`);
  const packageDocument = JSON.parse(packageBytes.toString("utf8"));
  await validateSchema(packageDocument, packageSchema, relativePath);
  const { manifest } = packageDocument;
  if (manifest.trackId !== trackId || manifest.packageVersion !== packageVersion || manifest.minimumAppVersion !== minimumAppVersion) {
    throw new Error(`${relativePath} manifest identity does not match its package configuration.`);
  }
  if (manifest.provenance.sourceArtifactChecksumSha256 !== accepted.sourceArtifactChecksumSha256) throw new Error(`${relativePath} source artifact differs from its accepted release binding.`);
  const releaseId = manifest.provenance.releaseId;
  const acceptedRelease = await readJson(root, `artifacts/releases/${releaseId}/release.json`);
  const sourceArtifact = acceptedRelease.artifacts.find((artifact) => artifact.trackId === trackId);
  if (acceptedRelease.manifest.releaseId !== releaseId || !sourceArtifact || sourceArtifact.contentVersion !== manifest.contentVersion || sourceArtifact.sourceRepositoryCommit !== manifest.provenance.sourceRepositoryCommit || sourceArtifact.checksumSha256 !== accepted.sourceArtifactChecksumSha256 || sha256(Buffer.from(sourceArtifact.artifactBytes)) !== accepted.sourceArtifactChecksumSha256) {
    throw new Error(`${relativePath} is not bound to its exact accepted source artifact.`);
  }

  if (packageDocument.payloadGzipBase64.length > Math.ceil(BUNDLED_FREE_NODE_LIMITS.compressedBytes * 4 / 3)) throw new Error(`${relativePath} compressed payload exceeds the ${BUNDLED_FREE_NODE_LIMITS.compressedBytes}-byte limit.`);
  const compressed = Buffer.from(packageDocument.payloadGzipBase64, "base64");
  if (compressed.toString("base64") !== packageDocument.payloadGzipBase64) throw new Error(`${relativePath} payload is not canonical base64.`);
  if (compressed.length > BUNDLED_FREE_NODE_LIMITS.compressedBytes) throw new Error(`${relativePath} compressed payload exceeds the ${BUNDLED_FREE_NODE_LIMITS.compressedBytes}-byte limit.`);
  if (manifest.payloadUncompressedSize > BUNDLED_FREE_NODE_LIMITS.uncompressedBytes) throw new Error(`${relativePath} declared uncompressed payload exceeds the ${BUNDLED_FREE_NODE_LIMITS.uncompressedBytes}-byte limit.`);
  if (compressed.length !== manifest.payloadCompressedSize || sha256(compressed) !== manifest.payloadCompressedSha256) {
    throw new Error(`${relativePath} compressed payload size or SHA-256 is invalid.`);
  }
  let uncompressed;
  try {
    uncompressed = gunzipSync(compressed, { maxOutputLength: BUNDLED_FREE_NODE_LIMITS.uncompressedBytes });
  } catch (error) {
    if (error?.code === "ERR_BUFFER_TOO_LARGE") throw new Error(`${relativePath} decompressed payload exceeds the ${BUNDLED_FREE_NODE_LIMITS.uncompressedBytes}-byte limit.`);
    throw new Error(`${relativePath} payload is not valid gzip data.`);
  }
  if (uncompressed.length !== manifest.payloadUncompressedSize || sha256(uncompressed) !== manifest.payloadCanonicalSha256) {
    throw new Error(`${relativePath} uncompressed payload size or SHA-256 is invalid.`);
  }
  const payload = JSON.parse(uncompressed.toString("utf8"));
  if (!uncompressed.equals(Buffer.from(`${canonical(payload)}\n`))) throw new Error(`${relativePath} payload is not canonical JSON.`);
  const modeIds = (payload.modeStructures?.configurations ?? []).map((configuration) => configuration.modeId).sort();
  if (payload.schemaVersion !== "bundled-free-node-payload-v2" || payload.trackId !== trackId || payload.familyId !== manifest.familyId || payload.contentVersion !== manifest.contentVersion || payload.taxonomyVersion !== manifest.taxonomyVersion || payload.freeNodeId !== manifest.freeNodeId || payload.items?.length !== manifest.itemCount || payload.assets?.length !== manifest.assetCount || canonical(modeIds) !== canonical([...manifest.modeIds].sort()) || payload.freeNodeExperienceProfile?.profileId !== manifest.profileId || payload.freeNodeExperienceProfile?.profileVersion !== manifest.profileVersion) {
    throw new Error(`${relativePath} payload identity, item/asset count or mode/profile binding is invalid.`);
  }
  const sourceTrack = JSON.parse(sourceArtifact.artifactBytes);
  const acceptedItems = new Map((sourceTrack.bank?.items ?? []).map((item) => [item.id, item]));
  for (const item of payload.items) {
    const acceptedItem = acceptedItems.get(item.id);
    if (!acceptedItem || canonical(item) !== canonical(acceptedItem)) throw new Error(`${relativePath} payload item ${item.id} differs from the accepted source artifact.`);
  }
  return { trackId, packageVersion, itemCount: manifest.itemCount };
}

export async function validateConfiguredBundledFreeNodes({ root = ROOT } = {}) {
  const config = JSON.parse(await readFile(path.join(root, CONFIG_PATH), "utf8"));
  const configSchema = JSON.parse(await readFile(path.join(root, CONFIG_SCHEMA_PATH), "utf8"));
  await validateSchema(config, configSchema, CONFIG_PATH);
  const acceptance = await readJson(root, ACCEPTANCE_PATH);
  validateAcceptanceAuthority(acceptance);
  const configuredIds = config.packages.map(({ trackId, packageVersion }) => `${trackId}\0${packageVersion}`).sort();
  const acceptedIds = acceptance.packages.map(({ trackId, packageVersion }) => `${trackId}\0${packageVersion}`).sort();
  if (canonical(configuredIds) !== canonical(acceptedIds)) throw new Error(`${ACCEPTANCE_PATH} package identities differ from ${CONFIG_PATH}.`);
  const results = [];
  for (const entry of config.packages) results.push(await validateBundledFreeNode({ root, ...entry }));
  return results;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  validateConfiguredBundledFreeNodes().then((results) => {
    process.stdout.write(`Validated ${results.length} configured bundled Free-node packages.\n`);
  }).catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
