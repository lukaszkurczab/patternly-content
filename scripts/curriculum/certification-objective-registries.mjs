import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const fail = (code, message) => { const error = new Error(`${code}: ${message}`); error.code = code; throw error; };
const unique = (values, label) => { if (new Set(values).size !== values.length) fail("DUPLICATE_CERTIFICATION_OBJECTIVE_ID", `${label} must be unique.`); };
export const isCalendarDate = (value) => {
  if (typeof value !== "string" || !datePattern.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number); const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};

export function validateCertificationObjectiveRegistry(registry, filename = `${registry.trackId}.json`) {
  for (const field of ["schemaVersion", "trackId", "provider", "certification", "examVariant", "guideVersion", "checkedDate", "firstPartyDocumentationHosts", "sources", "domains", "objectives", "examProfile"]) if (!Object.hasOwn(registry, field)) fail("MISSING_CERTIFICATION_OBJECTIVE_REGISTRY_FIELD", `${field} is required.`);
  if (registry.schemaVersion !== "patternly-certification-objective-registry-v1") fail("INVALID_CERTIFICATION_OBJECTIVE_REGISTRY_VERSION", `${registry.trackId} has an unsupported schema version.`);
  if (filename !== `${registry.trackId}.json`) fail("CERTIFICATION_OBJECTIVE_REGISTRY_FILENAME_MISMATCH", `${filename} must match ${registry.trackId}.`);
  if (!isCalendarDate(registry.checkedDate)) fail("INVALID_SOURCE_CHECKED_DATE", `${registry.trackId}.checkedDate must be a calendar date.`);
  if (!Array.isArray(registry.firstPartyDocumentationHosts) || !registry.firstPartyDocumentationHosts.length || registry.firstPartyDocumentationHosts.some((host) => typeof host !== "string" || !host.trim()) || new Set(registry.firstPartyDocumentationHosts).size !== registry.firstPartyDocumentationHosts.length) fail("INVALID_FIRST_PARTY_DOCUMENTATION_HOST", `${registry.trackId} must declare unique first-party documentation hosts.`);
  if (registry.guideVersion !== "not_documented" && !registry.guideVersion?.trim()) fail("INVALID_GUIDE_VERSION_STATE", `${registry.trackId}.guideVersion must be explicit or not_documented.`);
  unique(registry.sources.map((source) => source.sourceId), `${registry.trackId} source IDs`); unique(registry.domains.map((domain) => domain.domainId), `${registry.trackId} domain IDs`); unique(registry.objectives.map((objective) => objective.objectiveId), `${registry.trackId} objective IDs`);
  const sourceIds = new Set(registry.sources.map((source) => source.sourceId)); const domainIds = new Set(registry.domains.map((domain) => domain.domainId)); const scopeIds = [];
  for (const source of registry.sources) if (!isCalendarDate(source.checkedDate) || (source.version !== "not_documented" && !source.version?.trim())) fail("INVALID_SOURCE_CHECKED_DATE", `${registry.trackId}/${source.sourceId} requires checkedDate and explicit version state.`);
  for (const objective of registry.objectives) {
    if (!domainIds.has(objective.parentDomainId) || !isCalendarDate(objective.checkedDate) || !objective.sourceRefs?.every((sourceId) => sourceIds.has(sourceId))) fail("INVALID_CERTIFICATION_OBJECTIVE_REGISTRY", `${objective.objectiveId} has invalid domain or source provenance.`);
    for (const scope of objective.scopeStatements) { scopeIds.push(scope.scopeStatementId); if (!isCalendarDate(scope.checkedDate) || !scope.sourceRefs?.every((sourceId) => sourceIds.has(sourceId))) fail("INVALID_CERTIFICATION_OBJECTIVE_REGISTRY", `${scope.scopeStatementId} has invalid source provenance.`); }
  }
  unique(scopeIds, `${registry.trackId} scope statement IDs`);
  for (const [field, value] of Object.entries(registry.examProfile)) {
    if (field === "profileId" || field === "examVariant" || field === "guideVersion" || field === "faithfulSimulationEligibility") continue;
    if (!value || !["documented", "not_documented"].includes(value.status) || !isCalendarDate(value.checkedDate)) fail("INVALID_EXAM_PROFILE_PROVENANCE", `${registry.trackId}.examProfile.${field} has invalid provenance.`);
    if (value.status === "not_documented" && (value.value !== null || value.sourceRefs.length)) fail("UNDOCUMENTED_PROFILE_BEHAVIOR_CLAIMED", `${registry.trackId}.examProfile.${field} must not carry an inferred value.`);
    if (value.status === "documented" && (value.value == null || !value.sourceRefs.length || !value.sourceRefs.every((sourceId) => sourceIds.has(sourceId)))) fail("INVALID_EXAM_PROFILE_PROVENANCE", `${registry.trackId}.examProfile.${field} lacks documented source evidence.`);
  }
  const eligibility = registry.examProfile.faithfulSimulationEligibility;
  if (eligibility?.status !== "blocked_by_undocumented_provider_behavior" || eligibility?.allowedPatternlyClaim !== "practice_simulation_not_provider_faithful") fail("UNDOCUMENTED_PROFILE_BEHAVIOR_CLAIMED", `${registry.trackId} cannot claim provider-faithful simulation.`);
  return registry;
}

export async function loadCertificationObjectiveRegistries({ root }) {
  const directory = join(root, "config", "certification-objective-registries");
  let names = [];
  try { names = (await readdir(directory)).filter((name) => name.endsWith(".json")).sort(); } catch (error) { if (error.code !== "ENOENT") throw error; }
  const registries = new Map();
  for (const name of names) { const registry = validateCertificationObjectiveRegistry(await readJson(join(directory, name)), name); if (registries.has(registry.trackId)) fail("DUPLICATE_CERTIFICATION_OBJECTIVE_REGISTRY", `${registry.trackId} has multiple registries.`); Object.defineProperty(registry, "__registryPath", { value: `config/certification-objective-registries/${name}` }); registries.set(registry.trackId, registry); }
  return registries;
}
