import { readFile, readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const TRACK_BRIEF_DIRECTORY = join(ROOT, "docs", "track-briefs");
export const TRACK_BRIEF_SCHEMA_PATH = join(ROOT, "schemas", "product", "track-brief.schema.json");

export const TARGET_TRACK_FAMILIES = Object.freeze({
  "coding-interview-dsa-problem-solving": "coding_interview",
  "backend-system-design-interview": "design_interview",
  "object-oriented-design-interview": "design_interview",
  "frontend-system-design-interview": "design_interview",
  "google-cloud-associate-cloud-engineer": "certification",
  "aws-certified-solutions-architect-associate": "certification",
  "microsoft-azure-administrator-associate-az-104": "certification",
  "microsoft-azure-ai-fundamentals-ai-901": "certification",
  "hashicorp-terraform-associate-004": "certification",
  "kubernetes-cloud-native-associate-kcna": "certification"
});

const PROHIBITED_BRIEF_TEXT = /\b(?:coming[ -]soon|placeholder|tbd|todo)\b/i;
const canonical = (value) => JSON.stringify(value, Object.keys(value ?? {}).sort());
const INTENDED_FREE_MODES_BY_FAMILY = Object.freeze({
  certification: Object.freeze(["certification-focus-practice", "certification-weak-area-review", "certification-quick-review"]),
  design_interview: Object.freeze(["design-interview-learn-framework", "design-interview-guided-case", "design-interview-weak-area-review"])
});
const IMPLEMENTED_FREE_PROFILES = Object.freeze({
  "coding-interview-dsa-problem-solving": Object.freeze({
    profileId: "coding-interview-dsa-problem-solving-free-node-v1",
    profileVersion: "1",
    profilePath: "config/free-node-experience-profiles/coding-interview-dsa-problem-solving.json",
    modeIds: Object.freeze(["coding-interview-learn-approach", "coding-interview-guided-practice", "coding-interview-custom-practice", "coding-interview-weak-area-review"])
  }),
  "microsoft-azure-administrator-associate-az-104": Object.freeze({
    profileId: "microsoft-azure-administrator-associate-az-104-free-node-v1",
    profileVersion: "1",
    profilePath: "config/free-node-experience-profiles/microsoft-azure-administrator-associate-az-104.json",
    modeIds: Object.freeze(["certification-focus-practice", "certification-weak-area-review", "certification-quick-review"])
  })
});

export class TrackBriefValidationError extends Error {
  constructor(code, message) {
    super(`${code}: ${message}`);
    this.code = code;
  }
}

function fail(label, message) {
  throw new TrackBriefValidationError("INVALID_TRACK_BRIEF", `${label} ${message}`);
}

function validateSchema(value, schema, label) {
  if (schema.const !== undefined && value !== schema.const) fail(label, `must equal ${JSON.stringify(schema.const)}.`);
  if (schema.enum && !schema.enum.includes(value)) fail(label, "is outside the allowed values.");

  if (schema.type === "object") {
    if (!value || typeof value !== "object" || Array.isArray(value)) fail(label, "must be an object.");
    for (const required of schema.required ?? []) if (!Object.hasOwn(value, required)) fail(label, `must include ${required}.`);
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) if (!Object.hasOwn(schema.properties ?? {}, key)) fail(`${label}.${key}`, "is not allowed.");
    }
    for (const [key, childSchema] of Object.entries(schema.properties ?? {})) {
      if (Object.hasOwn(value, key)) validateSchema(value[key], childSchema, `${label}.${key}`);
    }
    return;
  }

  if (schema.type === "array") {
    if (!Array.isArray(value)) fail(label, "must be an array.");
    if (schema.minItems !== undefined && value.length < schema.minItems) fail(label, `must contain at least ${schema.minItems} entries.`);
    if (schema.uniqueItems && new Set(value.map(canonical)).size !== value.length) fail(label, "must contain distinct entries.");
    value.forEach((entry, index) => validateSchema(entry, schema.items ?? {}, `${label}[${index}]`));
    return;
  }

  if (schema.type === "string") {
    if (typeof value !== "string") fail(label, "must be a string.");
    if (schema.minLength !== undefined && value.trim().length < schema.minLength) fail(label, "must not be empty.");
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) fail(label, "has an invalid identifier format.");
  }
}

function inspectText(value, label) {
  if (typeof value === "string") {
    if (PROHIBITED_BRIEF_TEXT.test(value)) fail(label, "contains prohibited unavailable-product wording.");
    return;
  }
  if (Array.isArray(value)) return value.forEach((entry, index) => inspectText(entry, `${label}[${index}]`));
  if (value && typeof value === "object") for (const [key, entry] of Object.entries(value)) inspectText(entry, `${label}.${key}`);
}

export function validateTrackBrief(brief, schema) {
  validateSchema(brief, schema, "trackBrief");
  inspectText(brief, "trackBrief");

  const expectedFamily = TARGET_TRACK_FAMILIES[brief.trackId];
  if (brief.internalFamily !== expectedFamily) fail("trackBrief.internalFamily", `must be ${expectedFamily} for ${brief.trackId}.`);
  if (brief.packageContentPlan.bundledFreeNodeId !== brief.freeNodeId) fail("trackBrief.packageContentPlan.bundledFreeNodeId", "must match freeNodeId.");
  const freeExperience = brief.freeNodeExperience;
  if (freeExperience.modeIds.some((modeId) => !brief.validModes.includes(modeId))) fail("trackBrief.freeNodeExperience.modeIds", "must be a subset of complete-track validModes.");
  if (freeExperience.modeIds.length === brief.validModes.length) fail("trackBrief.freeNodeExperience.modeIds", "must not treat every complete-track validMode as a Free mode.");
  const implemented = IMPLEMENTED_FREE_PROFILES[brief.trackId];
  if (implemented) {
    if (freeExperience.implementationStatus !== "profile_implemented") fail("trackBrief.freeNodeExperience.implementationStatus", "must identify factual profile implementation for a content-backed track.");
    for (const field of ["profileId", "profileVersion", "profilePath"]) if (freeExperience[field] !== implemented[field]) fail(`trackBrief.freeNodeExperience.${field}`, "does not match its canonical implemented profile.");
    if (JSON.stringify(freeExperience.modeIds) !== JSON.stringify(implemented.modeIds)) fail("trackBrief.freeNodeExperience.modeIds", "does not match the Product Owner-approved implemented Free mode set.");
  } else {
    if (freeExperience.implementationStatus !== "intended") fail("trackBrief.freeNodeExperience.implementationStatus", "must remain an intended contract without factual package claims.");
    for (const field of ["profileId", "profileVersion", "profilePath"]) if (Object.hasOwn(freeExperience, field)) fail(`trackBrief.freeNodeExperience.${field}`, "must not claim a profile for a descriptor-only track.");
    const expectedModes = INTENDED_FREE_MODES_BY_FAMILY[brief.internalFamily];
    if (!expectedModes || JSON.stringify(freeExperience.modeIds) !== JSON.stringify(expectedModes)) fail("trackBrief.freeNodeExperience.modeIds", "does not match the family-valid intended Free experience.");
  }
  if (brief.internalFamily === "certification" && !brief.goalTemplates.includes("prepare_for_a_certification")) fail("trackBrief.goalTemplates", "must include the certification goal for a certification track.");
  if (brief.internalFamily !== "certification" && brief.goalTemplates.includes("prepare_for_a_certification")) fail("trackBrief.goalTemplates", "must not expose a certification goal for an interview track.");
  if (brief.internalFamily === "certification" && brief.goalTemplates.includes("prepare_for_an_interview")) fail("trackBrief.goalTemplates", "must not expose an interview goal for a certification track.");
  if (brief.internalFamily !== "certification" && !brief.goalTemplates.includes("prepare_for_an_interview")) fail("trackBrief.goalTemplates", "must include the interview goal for an interview track.");
  return brief;
}

export async function loadCanonicalTrackBriefs({ root = ROOT } = {}) {
  const schema = JSON.parse(await readFile(join(root, "schemas", "product", "track-brief.schema.json"), "utf8"));
  const directory = join(root, "docs", "track-briefs");
  const filenames = (await readdir(directory)).filter((name) => name.endsWith(".json")).sort();
  const briefs = [];
  for (const filename of filenames) {
    const brief = JSON.parse(await readFile(join(directory, filename), "utf8"));
    validateTrackBrief(brief, schema);
    if (filename !== `${brief.trackId}.json`) fail(filename, "must match its trackId.");
    briefs.push(brief);
  }

  const actualIds = briefs.map((brief) => brief.trackId);
  if (new Set(actualIds).size !== actualIds.length) throw new TrackBriefValidationError("DUPLICATE_TRACK_BRIEF", "Track brief IDs must be distinct.");
  const expectedIds = Object.keys(TARGET_TRACK_FAMILIES).sort();
  if (actualIds.length !== expectedIds.length || expectedIds.some((id) => !actualIds.includes(id))) {
    throw new TrackBriefValidationError("TRACK_BRIEF_SET_MISMATCH", "The canonical brief set must contain exactly the ten LEARNING-PRODUCTS-001 track IDs.");
  }
  if (new Set(briefs.map((brief) => brief.freeNodeId)).size !== briefs.length) throw new TrackBriefValidationError("DUPLICATE_FREE_NODE_ID", "Every track brief must own a distinct freeNodeId.");
  if (new Set(briefs.map((brief) => brief.internalFamily)).size !== 3) throw new TrackBriefValidationError("TRACK_FAMILY_SET_MISMATCH", "The canonical brief set must use exactly three internal families.");
  return Object.freeze(briefs.map((brief) => Object.freeze(brief)));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const briefs = await loadCanonicalTrackBriefs();
  process.stdout.write(`Validated ${briefs.length} canonical track briefs.\n`);
}
