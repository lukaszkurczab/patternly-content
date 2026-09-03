import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const fail = (code, message) => { const error = new Error(`${code}: ${message}`); error.code = code; throw error; };
const unique = (values, label) => { if (new Set(values).size !== values.length) fail("DUPLICATE_CERTIFICATION_OBJECTIVE_ID", `${label} must be unique.`); };
const text = (value) => typeof value === "string" && value.trim();
const sourceRefsResolve = (refs, sourceIds) => Array.isArray(refs) && refs.length > 0 && refs.every((sourceId) => sourceIds.has(sourceId));
const httpsUrl = (value) => { try { return new URL(value).protocol === "https:"; } catch { return false; } };
const profileAuthorityCapability = Object.freeze({ itemCountOrRange: "item_count", scoredUnscoredDistinction: "scored_unscored_distinction", duration: "duration", responseFormats: "response_formats", navigation: "navigation", answerChanges: "answer_changes", flagging: "flagging", navigator: "navigator", sectionRules: "section_rules", timeoutBehavior: "timeout_behavior", delivery: "delivery" });
const sha256 = (value) => typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
const canonicalCertificationRegistryTrustAnchors = Object.freeze({
  "aws-certified-solutions-architect-associate": Object.freeze({ provider: "Amazon Web Services", officialSourceHosts: Object.freeze(["docs.aws.amazon.com", "aws.amazon.com"]), firstPartyDocumentationHosts: Object.freeze(["docs.aws.amazon.com", "aws.amazon.com"]) }),
  "google-cloud-associate-cloud-engineer": Object.freeze({ provider: "Google Cloud", officialSourceHosts: Object.freeze(["cloud.google.com", "services.google.com", "support.google.com"]), firstPartyDocumentationHosts: Object.freeze(["cloud.google.com", "docs.cloud.google.com"]) }),
  "hashicorp-terraform-associate-004": Object.freeze({ provider: "HashiCorp", officialSourceHosts: Object.freeze(["developer.hashicorp.com"]), firstPartyDocumentationHosts: Object.freeze(["developer.hashicorp.com", "www.hashicorp.com"]) }),
  "kubernetes-cloud-native-associate-kcna": Object.freeze({ provider: "Linux Foundation / Cloud Native Computing Foundation", officialSourceHosts: Object.freeze(["training.linuxfoundation.org", "docs.linuxfoundation.org", "raw.githubusercontent.com"]), firstPartyDocumentationHosts: Object.freeze(["kubernetes.io", "www.cncf.io"]) }),
  "microsoft-azure-administrator-associate-az-104": Object.freeze({ provider: "Microsoft", officialSourceHosts: Object.freeze(["learn.microsoft.com"]), firstPartyDocumentationHosts: Object.freeze(["learn.microsoft.com"]) }),
  "microsoft-azure-ai-fundamentals-ai-901": Object.freeze({ provider: "Microsoft", officialSourceHosts: Object.freeze(["learn.microsoft.com"]), firstPartyDocumentationHosts: Object.freeze(["learn.microsoft.com"]) }),
  "claude-certified-architect-professional-certification": Object.freeze({ provider: "Anthropic", officialSourceHosts: Object.freeze(["anthropic-partners.skilljar.com", "everpath-course-content.s3-accelerate.amazonaws.com"]), firstPartyDocumentationHosts: Object.freeze(["assets.anthropic.com", "www.anthropic.com", "platform.claude.com", "code.claude.com", "docs.anthropic.com", "docs.claude.com", "modelcontextprotocol.io", "privacy.claude.com", "support.claude.com", "anthropic-partners.skilljar.com"]) })
});
export const CANONICAL_CERTIFICATION_REGISTRY_TRACK_IDS = Object.freeze(Object.keys(canonicalCertificationRegistryTrustAnchors));
function assertCanonicalCertificationRegistryTrustAnchor(registry) {
  const anchor = canonicalCertificationRegistryTrustAnchors[registry.trackId];
  if (!anchor) fail("UNTRUSTED_CERTIFICATION_REGISTRY_ROOT", `${registry.trackId} is not a canonical certification registry track.`);
  if (registry.provider !== anchor.provider || JSON.stringify(registry.officialSourceHosts) !== JSON.stringify(anchor.officialSourceHosts) || JSON.stringify(registry.firstPartyDocumentationHosts) !== JSON.stringify(anchor.firstPartyDocumentationHosts)) fail("UNTRUSTED_CERTIFICATION_REGISTRY_ROOT", `${registry.trackId} may not redefine its provider identity or trusted source hosts.`);
}
function validateRawGithubIdentity(source, parsed, trackId) {
  if (parsed.hostname !== "raw.githubusercontent.com") return;
  const identity = source.urlIdentity; const digest = source.contentDigest;
  if (!identity || identity.kind !== "github_raw_file" || !text(identity.owner) || !text(identity.repository) || !text(identity.ref) || !text(identity.path) || identity.path.startsWith("/") || !digest || digest.algorithm !== "sha256" || !sha256(digest.value) || !source.authoritativeFor?.includes(`content_sha256:${digest.value}`) || parsed.search || parsed.hash || parsed.pathname !== `/${identity.owner}/${identity.repository}/${identity.ref}/${identity.path}`) fail("INVALID_RAW_GITHUB_SOURCE_IDENTITY", `${trackId}/${source.sourceId} must pin the exact GitHub raw owner, repository, ref, path, and SHA-256 digest.`);
}
export const isCalendarDate = (value) => {
  if (typeof value !== "string" || !datePattern.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number); const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};

export function validateCertificationObjectiveRegistry(registry, filename = `${registry.trackId}.json`) {
  for (const field of ["schemaVersion", "trackId", "provider", "certification", "examVariant", "guideVersion", "checkedDate", "officialSourceHosts", "firstPartyDocumentationHosts", "sources", "domains", "objectives", "examProfile"]) if (!Object.hasOwn(registry, field)) fail("MISSING_CERTIFICATION_OBJECTIVE_REGISTRY_FIELD", `${field} is required.`);
  if (registry.schemaVersion !== "patternly-certification-objective-registry-v1") fail("INVALID_CERTIFICATION_OBJECTIVE_REGISTRY_VERSION", `${registry.trackId} has an unsupported schema version.`);
  if (filename !== `${registry.trackId}.json`) fail("CERTIFICATION_OBJECTIVE_REGISTRY_FILENAME_MISMATCH", `${filename} must match ${registry.trackId}.`);
  if (!isCalendarDate(registry.checkedDate)) fail("INVALID_SOURCE_CHECKED_DATE", `${registry.trackId}.checkedDate must be a calendar date.`);
  const validateHosts = (hosts, code, label) => Array.isArray(hosts) && hosts.length && hosts.every((host) => text(host) && !host.includes(":") && !host.includes("/") && host === host.toLowerCase()) && new Set(hosts).size === hosts.length || fail(code, `${registry.trackId} must declare unique clean ${label} hosts.`);
  validateHosts(registry.officialSourceHosts, "INVALID_OFFICIAL_SOURCE_HOST", "official source");
  validateHosts(registry.firstPartyDocumentationHosts, "INVALID_FIRST_PARTY_DOCUMENTATION_HOST", "provider-owned documentation");
  assertCanonicalCertificationRegistryTrustAnchor(registry);
  if (registry.guideVersion !== "not_documented" && !registry.guideVersion?.trim()) fail("INVALID_GUIDE_VERSION_STATE", `${registry.trackId}.guideVersion must be explicit or not_documented.`);
  if (!Array.isArray(registry.sources) || !registry.sources.length || !Array.isArray(registry.domains) || !registry.domains.length || !Array.isArray(registry.objectives) || !registry.objectives.length) fail("INVALID_CERTIFICATION_OBJECTIVE_REGISTRY", `${registry.trackId} requires non-empty sources, domains, and objectives.`);
  unique(registry.sources.map((source) => source.sourceId), `${registry.trackId} source IDs`); unique(registry.domains.map((domain) => domain.domainId), `${registry.trackId} domain IDs`); unique(registry.objectives.map((objective) => objective.objectiveId), `${registry.trackId} objective IDs`);
  const sourceIds = new Set(registry.sources.map((source) => source.sourceId)); const domainIds = new Set(registry.domains.map((domain) => domain.domainId)); const scopeIds = [];
  for (const source of registry.sources) {
    for (const field of ["sourceId", "sourceType", "url", "title", "provider", "checkedDate", "sourceVolatility", "version", "authoritativeFor"]) if (!Object.hasOwn(source, field)) fail("MISSING_CERTIFICATION_SOURCE_FIELD", `${registry.trackId} source.${field} is required.`);
    if (!isCalendarDate(source.checkedDate)) fail("INVALID_SOURCE_CHECKED_DATE", `${registry.trackId}/${source.sourceId} requires a calendar checkedDate.`);
    let hostname; try { hostname = new URL(source.url).hostname; } catch { hostname = null; }
    if (!text(source.sourceId) || !text(source.sourceType) || !httpsUrl(source.url) || !registry.officialSourceHosts.includes(hostname) || !text(source.title) || !text(source.provider) || source.provider !== registry.provider || !isCalendarDate(source.checkedDate) || !text(source.sourceVolatility) || !text(source.version) || !Array.isArray(source.authoritativeFor) || !source.authoritativeFor.length || source.authoritativeFor.some((entry) => !text(entry))) fail("INVALID_CERTIFICATION_SOURCE_PROVENANCE", `${registry.trackId}/${source.sourceId} has incomplete or invalid source provenance.`);
    validateRawGithubIdentity(source, new URL(source.url), registry.trackId);
  }
  for (const domain of registry.domains) {
    for (const field of ["domainId", "providerDomainNumber", "providerLabel", "weight", "sourceRefs", "checkedDate"]) if (!Object.hasOwn(domain, field)) fail("MISSING_CERTIFICATION_DOMAIN_FIELD", `${registry.trackId} domain.${field} is required.`);
    if (!text(domain.domainId) || !text(domain.providerDomainNumber) || !text(domain.providerLabel) || !domain.weight || !["documented", "not_documented"].includes(domain.weight.status) || !isCalendarDate(domain.checkedDate) || !sourceRefsResolve(domain.sourceRefs, sourceIds)) fail("INVALID_CERTIFICATION_DOMAIN_PROVENANCE", `${registry.trackId}/${domain.domainId} has invalid source provenance.`);
  }
  for (const objective of registry.objectives) {
    for (const field of ["objectiveId", "providerObjectiveNumber", "providerLabel", "parentDomainId", "objectiveWeight", "parentDomainWeight", "scopeStatements", "sourceRefs", "checkedDate"]) if (!Object.hasOwn(objective, field)) fail("MISSING_CERTIFICATION_OBJECTIVE_FIELD", `${registry.trackId} objective.${field} is required.`);
    if (!text(objective.objectiveId) || !text(objective.providerObjectiveNumber) || !text(objective.providerLabel) || !domainIds.has(objective.parentDomainId) || !objective.objectiveWeight || !objective.parentDomainWeight || !Array.isArray(objective.scopeStatements) || !isCalendarDate(objective.checkedDate) || !sourceRefsResolve(objective.sourceRefs, sourceIds)) fail("INVALID_CERTIFICATION_OBJECTIVE_PROVENANCE", `${objective.objectiveId} has invalid domain or source provenance.`);
    for (const scope of objective.scopeStatements) { for (const field of ["scopeStatementId", "providerLabel", "sourceRefs", "checkedDate"]) if (!Object.hasOwn(scope, field)) fail("MISSING_CERTIFICATION_SCOPE_FIELD", `${objective.objectiveId} scope.${field} is required.`); scopeIds.push(scope.scopeStatementId); if (!text(scope.scopeStatementId) || !text(scope.providerLabel) || !isCalendarDate(scope.checkedDate) || !sourceRefsResolve(scope.sourceRefs, sourceIds)) fail("INVALID_CERTIFICATION_SCOPE_PROVENANCE", `${scope.scopeStatementId} has invalid source provenance.`); }
  }
  unique(scopeIds, `${registry.trackId} scope statement IDs`);
  const profileFields = ["itemCountOrRange", "scoredUnscoredDistinction", "duration", "responseFormats", "navigation", "answerChanges", "flagging", "navigator", "sectionRules", "timeoutBehavior", "delivery"];
  for (const field of ["profileId", "examVariant", "guideVersion", "faithfulSimulationEligibility", ...profileFields]) if (!Object.hasOwn(registry.examProfile, field)) fail("MISSING_EXAM_PROFILE_FIELD", `${registry.trackId}.examProfile.${field} is required.`);
  if (!text(registry.examProfile.profileId) || registry.examProfile.examVariant !== registry.examVariant || registry.examProfile.guideVersion !== registry.guideVersion) fail("INVALID_EXAM_PROFILE_PROVENANCE", `${registry.trackId} exam profile identity must match the registry.`);
  for (const field of profileFields) {
    const value = registry.examProfile[field];
    if (!value || !["documented", "not_documented"].includes(value.status) || !isCalendarDate(value.checkedDate)) fail("INVALID_EXAM_PROFILE_PROVENANCE", `${registry.trackId}.examProfile.${field} has invalid provenance.`);
    if (!Array.isArray(value.sourceRefs)) fail("INVALID_EXAM_PROFILE_PROVENANCE", `${registry.trackId}.examProfile.${field} requires sourceRefs.`);
    if (value.status === "not_documented" && (value.value !== null || value.sourceRefs.length)) fail("UNDOCUMENTED_PROFILE_BEHAVIOR_CLAIMED", `${registry.trackId}.examProfile.${field} must not carry an inferred value.`);
    if (value.status === "documented" && (value.value == null || !sourceRefsResolve(value.sourceRefs, sourceIds) || !value.sourceRefs.some((sourceId) => registry.sources.find((source) => source.sourceId === sourceId).authoritativeFor.includes(profileAuthorityCapability[field])))) fail("INVALID_EXAM_PROFILE_PROVENANCE", `${registry.trackId}.examProfile.${field} lacks a source explicitly authoritative for ${profileAuthorityCapability[field]}.`);
  }
  const eligibility = registry.examProfile.faithfulSimulationEligibility;
  const undocumentedFields = profileFields.filter((field) => registry.examProfile[field].status === "not_documented");
  if (eligibility?.status !== "blocked_by_undocumented_provider_behavior" || eligibility?.allowedPatternlyClaim !== "practice_simulation_not_provider_faithful" || !text(eligibility.forbiddenClaim) || !isCalendarDate(eligibility.checkedDate) || !Array.isArray(eligibility.undocumentedFields) || eligibility.undocumentedFields.length !== undocumentedFields.length || undocumentedFields.some((field) => !eligibility.undocumentedFields.includes(field)) || eligibility.undocumentedFields.some((field) => !undocumentedFields.includes(field))) fail("UNDOCUMENTED_PROFILE_BEHAVIOR_CLAIMED", `${registry.trackId} cannot claim provider-faithful simulation.`);
  return registry;
}

export async function loadCertificationObjectiveRegistries({ root }) {
  const directory = join(root, "config", "certification-objective-registries");
  let names = [];
  try { names = (await readdir(directory)).filter((name) => name.endsWith(".json")).sort(); } catch (error) { if (error.code !== "ENOENT") throw error; }
  const expectedNames = new Set(CANONICAL_CERTIFICATION_REGISTRY_TRACK_IDS.map((trackId) => `${trackId}.json`));
  if (names.length !== expectedNames.size || names.some((name) => !expectedNames.has(name))) fail("CERTIFICATION_OBJECTIVE_REGISTRY_SET_MISMATCH", `Certification objective registries must contain exactly the ${expectedNames.size} canonical registry files.`);
  const registries = new Map();
  for (const name of names) { const registry = validateCertificationObjectiveRegistry(await readJson(join(directory, name)), name); if (registries.has(registry.trackId)) fail("DUPLICATE_CERTIFICATION_OBJECTIVE_REGISTRY", `${registry.trackId} has multiple registries.`); Object.defineProperty(registry, "__registryPath", { value: `config/certification-objective-registries/${name}` }); registries.set(registry.trackId, registry); }
  if (registries.size !== expectedNames.size || CANONICAL_CERTIFICATION_REGISTRY_TRACK_IDS.some((trackId) => !registries.has(trackId))) fail("CERTIFICATION_OBJECTIVE_REGISTRY_SET_MISMATCH", `Certification objective registries must resolve all ${expectedNames.size} canonical registry tracks.`);
  return registries;
}
