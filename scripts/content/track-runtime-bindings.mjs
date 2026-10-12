import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const TRACK_RUNTIME_BINDINGS_SCHEMA_VERSION = "patternly-track-runtime-bindings-v1";
export const TRACK_RUNTIME_BINDINGS_FILE = "config/track-runtime-bindings.json";
const TRACK_BINDING_KEYS = ["familyId", "profileLoaderKey", "trackId"];
const REGISTRY_KEYS = ["schemaVersion", "tracks"];
const DEFAULT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function fail(message) {
  throw new Error(`Track runtime bindings are invalid: ${message}`);
}

function exactKeys(value, expected, label) {
  if (!isRecord(value) || Object.keys(value).sort().join("|") !== [...expected].sort().join("|")) {
    fail(`${label} has an invalid shape`);
  }
}

export function validateTrackRuntimeBindings(registry) {
  exactKeys(registry, REGISTRY_KEYS, "registry");
  if (registry.schemaVersion !== TRACK_RUNTIME_BINDINGS_SCHEMA_VERSION || !Array.isArray(registry.tracks) || registry.tracks.length === 0) {
    fail("registry schema or tracks are invalid");
  }
  const trackIds = new Set();
  let previousTrackId;
  for (const [index, binding] of registry.tracks.entries()) {
    exactKeys(binding, TRACK_BINDING_KEYS, `tracks[${index}]`);
    if (typeof binding.trackId !== "string" || !binding.trackId || binding.trackId.trim() !== binding.trackId ||
        typeof binding.familyId !== "string" || !binding.familyId || binding.familyId.trim() !== binding.familyId ||
        !(binding.profileLoaderKey === null || typeof binding.profileLoaderKey === "string" && binding.profileLoaderKey.length > 0 && binding.profileLoaderKey.trim() === binding.profileLoaderKey)) {
      fail(`tracks[${index}] identity or profile loader is invalid`);
    }
    if (trackIds.has(binding.trackId) || previousTrackId !== undefined && previousTrackId >= binding.trackId) {
      fail(`tracks[${index}] is duplicate or not sorted by trackId`);
    }
    trackIds.add(binding.trackId);
    previousTrackId = binding.trackId;
  }
  return Object.freeze(registry.tracks.map((binding) => Object.freeze({ ...binding })));
}

export function loadTrackRuntimeBindings({ rootDirectory = DEFAULT_ROOT } = {}) {
  const filePath = path.join(path.resolve(rootDirectory), TRACK_RUNTIME_BINDINGS_FILE);
  let registry;
  try {
    registry = JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`cannot read ${TRACK_RUNTIME_BINDINGS_FILE}: ${error.message}`);
  }
  return validateTrackRuntimeBindings(registry);
}

export function getTrackRuntimeBinding(trackId, bindings = loadTrackRuntimeBindings()) {
  const binding = bindings.find((entry) => entry.trackId === trackId);
  if (!binding) fail(`track ${trackId} is not registered`);
  return binding;
}

export function acceptedTrackIdsFromRuntimeBindings(bindings = loadTrackRuntimeBindings()) {
  return Object.freeze(bindings.map(({ trackId }) => trackId));
}

export function resolveTrackProfileLoader(binding, loaderRegistrations) {
  return resolveTrackProfileLoaderRegistration(binding, loaderRegistrations)?.load ?? null;
}

export function resolveTrackProfileLoaderRegistration(binding, loaderRegistrations) {
  if (!binding || binding.profileLoaderKey === null) return null;
  const registration = loaderRegistrations?.[binding.profileLoaderKey];
  if (!registration || registration.familyId !== binding.familyId || typeof registration.load !== "function") {
    fail(`track ${binding.trackId} references an absent or mismatched profile loader`);
  }
  return registration;
}

export async function loadTrackProfileData(binding, input, loaderRegistrations) {
  const loader = resolveTrackProfileLoader(binding, loaderRegistrations);
  return loader ? loader(input) : undefined;
}
