import { createHash } from "node:crypto";

const compare = (left, right) => left === right ? 0 : left < right ? -1 : 1;
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

export class HistoricalArtifactEvidenceError extends Error {
  constructor(message) {
    super(message);
    this.name = "HistoricalArtifactEvidenceError";
  }
}

function canonicalJson(value) {
  if (value === null || ["boolean", "number", "string"].includes(typeof value)) return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (!value || typeof value !== "object") throw new HistoricalArtifactEvidenceError("Historical artifact is not JSON.");
  return `{${Object.keys(value).sort(compare).map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}

function text(value, label) {
  if (typeof value !== "string" || !value.trim()) throw new HistoricalArtifactEvidenceError(`${label} must be a non-empty string.`);
  return value;
}

function exactKeys(value, expected, label) {
  if (!value || typeof value !== "object" || Array.isArray(value) || canonicalJson(Object.keys(value).sort(compare)) !== canonicalJson([...expected].sort(compare))) {
    throw new HistoricalArtifactEvidenceError(`${label} has an unsupported external shape.`);
  }
}

/**
 * Verifies the frozen ACC-02 artifact envelope named by candidate evidence.
 * This deliberately does not discover, build, publish, or read learner source.
 */
export function verifyHistoricalArtifactEvidence(artifact) {
  exactKeys(artifact, ["artifactBytes", "checksumSha256", "contentVersion", "declaredModes", "familyId", "schemaVersion", "sourceRepositoryCommit", "taxonomyVersion", "trackId"], "Track artifact reference");
  if (sha256(text(artifact.artifactBytes, "artifactBytes")) !== artifact.checksumSha256) throw new HistoricalArtifactEvidenceError("Artifact bytes do not match checksum.");

  let envelope;
  try {
    envelope = JSON.parse(artifact.artifactBytes);
  } catch {
    throw new HistoricalArtifactEvidenceError("Published artifact bytes are invalid JSON.");
  }
  if (envelope?.envelopeVersion !== 1 || envelope.schemaVersion !== "published-bank-v1" || envelope.contentVersion !== artifact.contentVersion || envelope.taxonomyVersion !== artifact.taxonomyVersion || envelope.bank?.trackId !== artifact.trackId || envelope.bank?.familyId !== artifact.familyId) {
    throw new HistoricalArtifactEvidenceError("Published artifact envelope identity is invalid.");
  }

  if (artifact.familyId === "coding_interview") {
    exactKeys(envelope.bank, ["compatibilitySets", "contentVersion", "contrastSets", "familyId", "feedbackAssets", "formatVersion", "interleavedScopes", "items", "practiceBlueprints", "recognitionSets", "simulationPools", "simulationProfiles", "trackId"], "Coding Interview published bank");
    const requiredItemKeys = ["compatibilityMemberships", "feedback", "id", "interaction", "itemFingerprint", "prompt", "provenance", "scoringContract", "taxonomy"];
    const optionalItemKeys = ["constraints", "difficulty"];
    const validItem = (item) => item && typeof item === "object" && requiredItemKeys.every((key) => Object.hasOwn(item, key)) && Object.keys(item).every((key) => requiredItemKeys.includes(key) || optionalItemKeys.includes(key));
    const validAsset = (asset) => asset && typeof asset === "object" && canonicalJson(Object.keys(asset).sort(compare)) === canonicalJson(["id", "sha256", "sourcePath"]) && /^[a-z0-9][a-z0-9/_-]*$/.test(asset.id) && /^manual\/assets\/coding-interview-dsa-problem-solving\/.+\.svg$/.test(asset.sourcePath) && /^[a-f0-9]{64}$/.test(asset.sha256);
    if (envelope.bank.formatVersion !== 1 || envelope.bank.contentVersion !== artifact.contentVersion || !Array.isArray(envelope.bank.feedbackAssets) || envelope.bank.feedbackAssets.some((asset) => !validAsset(asset)) || !Array.isArray(envelope.bank.items) || !envelope.bank.items.every(validItem)) throw new HistoricalArtifactEvidenceError("Coding Interview published bank does not conform to the exact historical contract.");
  } else if (artifact.familyId === "certification") {
    exactKeys(envelope.bank, ["contentVersion", "diagnosticBaseline", "examExperienceProfile", "familyId", "focusPractice", "formatVersion", "items", "mixedPractice", "quickReview", "scenarioPractice", "trackId", "weakAreaReview"], "Certification published bank");
    if (envelope.bank.formatVersion !== 1 || envelope.bank.contentVersion !== artifact.contentVersion) throw new HistoricalArtifactEvidenceError("Certification published bank does not conform to the exact historical contract.");
  } else if (artifact.familyId === "design_interview") {
    exactKeys(envelope.bank, ["contentVersion", "familyId", "formatVersion", "items", "modeReadiness", "taxonomyVersion", "trackId"], "Design Interview published bank");
    const validItem = (item) => item && typeof item === "object" && typeof item.id === "string" && typeof item.prompt === "string" && item.interaction && ["choice", "ordering", "decision_matrix"].includes(item.interaction.type) && item.feedback && item.taxonomy && item.provenance && typeof item.itemFingerprint === "string";
    if (envelope.bank.formatVersion !== 1 || envelope.bank.contentVersion !== artifact.contentVersion || envelope.bank.taxonomyVersion !== artifact.taxonomyVersion || !Array.isArray(envelope.bank.items) || !envelope.bank.items.every(validItem)) throw new HistoricalArtifactEvidenceError("Design Interview published bank does not conform to the exact historical contract.");
  } else {
    throw new HistoricalArtifactEvidenceError(`No immutable artifact contract exists for ${artifact.familyId}.`);
  }
  return artifact;
}
