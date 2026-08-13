import { createHash } from "node:crypto";
import { existsSync, lstatSync, readdirSync, readFileSync, realpathSync } from "node:fs";
import { relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const load = (path) => JSON.parse(readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8"));
const designSchema = load("../../schemas/curriculum/design-interview-curriculum.schema.json");
const registrySchema = load("../../schemas/curriculum/design-interview-source-registry.schema.json");
const registry = load("../../config/design-interview-source-registry.json");
const family = load("../../config/families/design_interview.json");
const fail = (code, message) => { const error = new Error(`${code}: ${message}`); error.code = code; throw error; };
const unique = (values, label) => { if (new Set(values).size !== values.length) fail("DUPLICATE_DESIGN_CANONICAL_ID", label); };
const fingerprint = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const canonical = (value) => Array.isArray(value) ? `[${value.map(canonical).join(",")}]` : value && typeof value === "object" ? `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}` : JSON.stringify(value);
const digest = (value) => createHash("sha256").update(canonical(value)).digest("hex");
const DESIGN_TRUST_ROOT_SHA256 = "65b9cffb27fec9fadb5171d9261f7211d010cad94ff139a5daf3da003bf95429";
const DESIGN_FAMILY_CONTRACT_SHA256 = "b59902dee13d98b6ec3db1975fb50e1edf82d40bdf1adf856a0b99acbc54a887";
const TRACK_IDS = Object.freeze(["backend-system-design-interview", "frontend-system-design-interview", "object-oriented-design-interview"]);
const EXPECTED_RESOLVED_BY_TRACK = Object.freeze({
  "backend-system-design-interview": 58,
  "frontend-system-design-interview": 92,
  "object-oriented-design-interview": 47
});
const EXPECTED_BATCH_SIZE_BY_TRACK = Object.freeze({
  "backend-system-design-interview": 8,
  "frontend-system-design-interview": 10,
  "object-oriented-design-interview": 9
});
const TRACK_LABEL_BY_ID = Object.freeze({
  "backend-system-design-interview": "Backend",
  "frontend-system-design-interview": "Frontend",
  "object-oriented-design-interview": "OOD"
});
const NUMBER_WORD_BY_VALUE = Object.freeze({ 8: "eight", 9: "nine", 10: "ten" });
const batchPairKey = ({ bindingId, slotId }) => `${bindingId}\u0000${slotId}`;
const sameSet = (left, right) => left.size === right.size && [...left].every((value) => right.has(value));
const deferredResolvedReason = (trackId, resolvedCount, admittedCount) => `These ${resolvedCount - admittedCount} ${TRACK_LABEL_BY_ID[trackId]} bindings are provenance-resolved but outside the pinned ${NUMBER_WORD_BY_VALUE[admittedCount]}-slot ${TRACK_LABEL_BY_ID[trackId]} authoring-feasibility batch.`;
const ADMISSION_KEYS_BY_TRACK = Object.freeze({
  "backend-system-design-interview": ["learnerFacingContentIncluded", "questionsAuthored", "runtimeAdmission", "publishingAdmission", "packageAdmission", "releaseAdmission"],
  "frontend-system-design-interview": ["learnerFacingContentIncluded", "questionsAuthored", "runtimeAdmission", "publishingAdmission", "packageAdmission", "releaseAdmission"],
  "object-oriented-design-interview": ["learnerFacingContentIncluded", "runtimeAdmission", "publishingAdmission", "packageAdmission", "manualSourceAdmission", "releaseAdmission", "questionsAuthored"]
});
const ownKeys = (value, keys) => Object.keys(value).sort().join("\u0000") === [...keys].sort().join("\u0000");
const trustRoot = (value) => ({
  sourceRecords: value.sourceRecords,
  sourceCaptures: value.sourceCaptures,
  anchorRecords: value.anchorRecords,
  claims: value.claims,
  slotBindings: value.slotBindings
});
const repositoryRoot = fileURLToPath(new URL("../../", import.meta.url));
const captureRootRelative = "evidence/design-interview/source-captures/sha256";
const licenseRootRelative = "evidence/design-interview/source-captures/licenses";
const isInside = (root, path) => { const relation = relative(root, path); return relation === "" || (!relation.startsWith(`..${sep}`) && relation !== ".."); };
function assertNoCapturePathSymlinks(root, path, label) {
  if (!isInside(root, path)) fail("DESIGN_SOURCE_CAPTURE_PATH_MISMATCH", label);
  let current = root;
  for (const component of relative(root, path).split(sep)) {
    if (!component) continue;
    current = resolve(current, component);
    let stat;
    try { stat = lstatSync(current); } catch { fail("DESIGN_SOURCE_CAPTURE_PATH_MISMATCH", label); }
    if (stat.isSymbolicLink()) fail("DESIGN_SOURCE_CAPTURE_PATH_MISMATCH", label);
  }
}
const capturePath = (sha256) => `${captureRootRelative}/${sha256.slice(0, 2)}/${sha256}`;
const requiredCaptureSourceIds = Object.freeze(["google-dataflow-autoscaling-metrics-2026-20260512-capture", "microsoft-architecture-center-multitenant-storage-data-09ba725e", "react-docs-you-might-not-need-effect-b440d66", "react-docs-use-effect-cffb6a7", "hibernate-orm-7.1.35-entities-0a5c369", "microsoft-azure-postgresql-read-replicas-eae7640", "microsoft-azure-sql-read-scale-out-b356462", "dotnet-adonet-optimistic-concurrency-bd03850", "microsoft-architecture-center-sharding-7b4bf264", "microsoft-azure-waf-reliability-targets-40aabbf", "microsoft-dotnet-domain-events-bd038508", "microsoft-waf-business-requirements-40aabbf", "microsoft-architecture-center-asynchronous-request-reply-09ba725e", "microsoft-architecture-center-transient-faults-09ba725e", "microsoft-architecture-center-event-driven-09ba725e", "microsoft-architecture-center-event-sourcing-09ba725e", "microsoft-cloud-adoption-framework-modernization-deployment-07736c4", "react-docs-sharing-state-between-components-b440d66", "react-docs-preserving-and-resetting-state-b440d66", "react-docs-responding-to-events-b440d66", "microsoft-dotnet-command-handler-bd038508", "microsoft-dotnet-infrastructure-persistence-bd038508", "microsoft-dotnet-domain-validation-bd038508", "microsoft-aspnet-explicit-dto-1a82bb83", "microsoft-architecture-center-sequential-convoy-7b4bf264", "microsoft-architecture-center-throttling-09ba725e", "microsoft-architecture-center-scale-out-09ba725e", "microsoft-architecture-center-gateway-aggregation-09ba725e", "react-docs-render-to-pipeable-stream-b440d66", "google-web-vitals-readme-3c850823", "opentelemetry-tail-sampling-processor-9ab409ae", "microsoft-azure-monitor-metrics-overview-1930418e", "microsoft-architecture-center-saga-7b4bf264", "microsoft-waf-architecture-decision-record-40aabbf", "microsoft-waf-architecture-design-specification-40aabbf", "playwright-docs-best-practices-js-07730b7", "playwright-docs-intro-js-07730b7", "aspnetcore-docs-model-validation-c67a801", "aspnetcore-docs-blazor-pwa-c67a801", "aspnetcore-docs-resource-authorization-c67a801", "edge-developer-pwa-offline-dd024d8", "edge-developer-pwa-background-syncs-dd024d8", "edge-developer-pwa-best-practices-dd024d8", "react-docs-use-client-b440d66"]);
const licenseEvidenceUrlBySourceId = Object.freeze({
  "microsoft-waf-business-requirements-40aabbf": "https://github.com/MicrosoftDocs/well-architected/blob/40aabbf5a416b750d1c11fc9b5c85666c95b119a/LICENSE",
  "microsoft-architecture-center-asynchronous-request-reply-09ba725e": "https://github.com/MicrosoftDocs/architecture-center/blob/09ba725ecd84ed23faba2fb47ffcbdfca0a8b6ac/README.md#legal-notices",
  "microsoft-architecture-center-transient-faults-09ba725e": "https://github.com/MicrosoftDocs/architecture-center/blob/09ba725ecd84ed23faba2fb47ffcbdfca0a8b6ac/README.md#legal-notices",
  "microsoft-architecture-center-event-driven-09ba725e": "https://github.com/MicrosoftDocs/architecture-center/blob/09ba725ecd84ed23faba2fb47ffcbdfca0a8b6ac/README.md#legal-notices",
  "microsoft-architecture-center-event-sourcing-09ba725e": "https://github.com/MicrosoftDocs/architecture-center/blob/09ba725ecd84ed23faba2fb47ffcbdfca0a8b6ac/README.md#legal-notices",
  "microsoft-cloud-adoption-framework-modernization-deployment-07736c4": "https://github.com/MicrosoftDocs/cloud-adoption-framework/blob/07736c406bdd9738eb31839c7b654363fb40f354/LICENSE",
  "react-docs-sharing-state-between-components-b440d66": "https://github.com/reactjs/react.dev/blob/b440d6698f6e21d56a78b10f625bd23191183588/LICENSE-DOCS.md",
  "react-docs-preserving-and-resetting-state-b440d66": "https://github.com/reactjs/react.dev/blob/b440d6698f6e21d56a78b10f625bd23191183588/LICENSE-DOCS.md",
  "react-docs-responding-to-events-b440d66": "https://github.com/reactjs/react.dev/blob/b440d6698f6e21d56a78b10f625bd23191183588/LICENSE-DOCS.md",
  "microsoft-dotnet-command-handler-bd038508": "https://github.com/dotnet/docs/blob/bd038508933775b801ebfe58540634f4024bfdf0/LICENSE",
  "microsoft-dotnet-infrastructure-persistence-bd038508": "https://github.com/dotnet/docs/blob/bd038508933775b801ebfe58540634f4024bfdf0/LICENSE",
  "microsoft-dotnet-domain-validation-bd038508": "https://github.com/dotnet/docs/blob/bd038508933775b801ebfe58540634f4024bfdf0/LICENSE",
  "microsoft-aspnet-explicit-dto-1a82bb83": "https://github.com/dotnet/AspNetDocs/blob/1a82bb83264875c1891a558e5bc5c836b6c97f5b/LICENSE",
  "microsoft-architecture-center-sequential-convoy-7b4bf264": "https://github.com/MicrosoftDocs/architecture-center/blob/7b4bf26469bc45810c64406ad3cebdae4f60fb6b/README.md#legal-notices",
  "google-dataflow-autoscaling-metrics-2026-20260512-capture": "https://web.archive.org/web/20260512163401id_/https://docs.cloud.google.com/dataflow/docs/guides/autoscaling-metrics",
  "microsoft-architecture-center-multitenant-storage-data-09ba725e": "https://github.com/MicrosoftDocs/architecture-center/blob/09ba725ecd84ed23faba2fb47ffcbdfca0a8b6ac/README.md#legal-notices",
  "react-docs-you-might-not-need-effect-b440d66": "https://github.com/reactjs/react.dev/blob/b440d6698f6e21d56a78b10f625bd23191183588/LICENSE-DOCS.md",
  "react-docs-use-effect-cffb6a7": "https://github.com/reactjs/react.dev/blob/cffb6a7b7d00fbe09df5b40d1731e1055bff0900/LICENSE-DOCS.md",
  "hibernate-orm-7.1.35-entities-0a5c369": "https://github.com/hibernate/hibernate-orm/blob/0a5c3695d730f63459e14582aeb1b23075430883/LICENSE.txt",
  "microsoft-azure-postgresql-read-replicas-eae7640": "https://github.com/MicrosoftDocs/azure-databases-docs/blob/eae7640185e0a174a16e5a33cd16c1a76bc13d04/LICENSE",
  "microsoft-azure-sql-read-scale-out-b356462": "https://github.com/MicrosoftDocs/sql-docs/blob/b356462c16cabe6450626f82dd769b521f002e70/LICENSE",
  "dotnet-adonet-optimistic-concurrency-bd03850": "https://github.com/dotnet/docs/blob/bd038508933775b801ebfe58540634f4024bfdf0/LICENSE",
  "microsoft-architecture-center-sharding-7b4bf264": "https://github.com/MicrosoftDocs/architecture-center/blob/7b4bf26469bc45810c64406ad3cebdae4f60fb6b/README.md#legal-notices",
  "microsoft-azure-waf-reliability-targets-40aabbf": "https://github.com/MicrosoftDocs/well-architected/blob/40aabbf5a416b750d1c11fc9b5c85666c95b119a/LICENSE",
  "microsoft-dotnet-domain-events-bd038508": "https://github.com/dotnet/docs/blob/bd038508933775b801ebfe58540634f4024bfdf0/LICENSE",
  "microsoft-architecture-center-throttling-09ba725e": "https://github.com/MicrosoftDocs/architecture-center/blob/09ba725ecd84ed23faba2fb47ffcbdfca0a8b6ac/README.md#legal-notices",
  "microsoft-architecture-center-scale-out-09ba725e": "https://github.com/MicrosoftDocs/architecture-center/blob/09ba725ecd84ed23faba2fb47ffcbdfca0a8b6ac/README.md#legal-notices",
  "microsoft-architecture-center-gateway-aggregation-09ba725e": "https://github.com/MicrosoftDocs/architecture-center/blob/09ba725ecd84ed23faba2fb47ffcbdfca0a8b6ac/README.md#legal-notices",
  "react-docs-render-to-pipeable-stream-b440d66": "https://github.com/reactjs/react.dev/blob/b440d6698f6e21d56a78b10f625bd23191183588/LICENSE-DOCS.md",
  "google-web-vitals-readme-3c850823": "https://github.com/GoogleChrome/web-vitals/blob/3c850823f7f25f59fc9e02d873137c542d99fd42/LICENSE",
  "opentelemetry-tail-sampling-processor-9ab409ae": "https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/9ab409ae2947e55728e7056df48e34ddf31d6767/LICENSE",
  "microsoft-azure-monitor-metrics-overview-1930418e": "https://github.com/MicrosoftDocs/azure-monitor-docs/blob/1930418e2dee453a02d6edc12ea15adcd0c1f39d/LICENSE"
  ,"microsoft-architecture-center-saga-7b4bf264": "https://github.com/MicrosoftDocs/architecture-center/blob/7b4bf26469bc45810c64406ad3cebdae4f60fb6b/README.md#legal-notices"
  ,"microsoft-waf-architecture-decision-record-40aabbf": "https://github.com/MicrosoftDocs/well-architected/blob/40aabbf5a416b750d1c11fc9b5c85666c95b119a/LICENSE"
  ,"microsoft-waf-architecture-design-specification-40aabbf": "https://github.com/MicrosoftDocs/well-architected/blob/40aabbf5a416b750d1c11fc9b5c85666c95b119a/LICENSE"
  ,"playwright-docs-best-practices-js-07730b7": "https://github.com/microsoft/playwright/blob/07730b7a9dab34d163d34a32e15a81218b345c88/LICENSE"
  ,"playwright-docs-intro-js-07730b7": "https://github.com/microsoft/playwright/blob/07730b7a9dab34d163d34a32e15a81218b345c88/LICENSE"
  ,"aspnetcore-docs-model-validation-c67a801": "https://github.com/dotnet/AspNetCore.Docs/blob/c67a80103a1a74db20784debd919c7fdda96c510/LICENSE"
  ,"aspnetcore-docs-blazor-pwa-c67a801": "https://github.com/dotnet/AspNetCore.Docs/blob/c67a80103a1a74db20784debd919c7fdda96c510/LICENSE"
  ,"aspnetcore-docs-resource-authorization-c67a801": "https://github.com/dotnet/AspNetCore.Docs/blob/c67a80103a1a74db20784debd919c7fdda96c510/LICENSE"
  ,"edge-developer-pwa-offline-dd024d8": "https://github.com/MicrosoftDocs/edge-developer/blob/dd024d8785db4c803a128cdde599e9287ee6ab5a/LICENSE"
  ,"edge-developer-pwa-background-syncs-dd024d8": "https://github.com/MicrosoftDocs/edge-developer/blob/dd024d8785db4c803a128cdde599e9287ee6ab5a/LICENSE"
  ,"edge-developer-pwa-best-practices-dd024d8": "https://github.com/MicrosoftDocs/edge-developer/blob/dd024d8785db4c803a128cdde599e9287ee6ab5a/LICENSE"
  ,"react-docs-use-client-b440d66": "https://github.com/reactjs/react.dev/blob/b440d6698f6e21d56a78b10f625bd23191183588/LICENSE-DOCS.md"
});
function captureFiles(root) {
  if (!existsSync(root)) fail("DEAD_DESIGN_SOURCE_CAPTURE_ARTIFACT", "capture root missing");
  const files = [];
  const walk = (dir) => { for (const name of readdirSync(dir)) { const path = resolve(dir, name); const stat = lstatSync(path); if (stat.isSymbolicLink()) fail("INVALID_DESIGN_SOURCE_CAPTURE", `symlink ${path}`); if (stat.isDirectory()) walk(path); else if (stat.isFile()) files.push(path); else fail("INVALID_DESIGN_SOURCE_CAPTURE", `non-regular artifact ${path}`); } };
  walk(root); return files;
}
function assertCaptures(value, root = repositoryRoot) {
  const captureRoot = resolve(root, captureRootRelative); const licenseRoot = resolve(root, licenseRootRelative);
  assertNoCapturePathSymlinks(root, captureRoot, "capture root");
  if (!lstatSync(captureRoot).isDirectory()) fail("DESIGN_SOURCE_CAPTURE_PATH_MISMATCH", "capture root");
  const realRoot = realpathSync(captureRoot);
  const sources = new Map(value.sourceRecords.map((source) => [source.sourceId, source]));
  const paths = new Set(); const hashes = new Set(); const sourceIds = new Set();
  if (!Array.isArray(value.sourceCaptures)) fail("UNBOUND_DESIGN_SOURCE_CAPTURE", "source capture roster");
  for (const capture of value.sourceCaptures) {
    if (!capture || capture.captureId !== `design-source-capture:${capture.sha256}` || !/^[a-f0-9]{64}$/.test(capture.sha256) || capture.repositoryPath !== capturePath(capture.sha256) || !Number.isSafeInteger(capture.byteLength) || capture.byteLength < 1 || !["text/html", "text/markdown", "text/asciidoc"].includes(capture.mediaType) || !["http_entity_after_transport_content_decoding", "git_blob_bytes"].includes(capture.byteRepresentation) || !Array.isArray(capture.transformations) || capture.transformations.length) fail("INVALID_DESIGN_SOURCE_CAPTURE", capture?.captureId ?? "record");
    if (hashes.has(capture.sha256) || paths.has(capture.repositoryPath)) fail("DUPLICATE_DESIGN_SOURCE_CAPTURE", capture.captureId); hashes.add(capture.sha256); paths.add(capture.repositoryPath);
    if (!Array.isArray(capture.sourceIds) || capture.sourceIds.length !== 1 || [...capture.sourceIds].sort().join("\u0000") !== capture.sourceIds.join("\u0000") || new Set(capture.sourceIds).size !== capture.sourceIds.length) fail("UNBOUND_DESIGN_SOURCE_CAPTURE", capture.captureId);
    for (const sourceId of capture.sourceIds) { const source = sources.get(sourceId); if (!source || source.fileSha256 !== capture.sha256 || sourceIds.has(sourceId)) fail("UNBOUND_DESIGN_SOURCE_CAPTURE", sourceId); sourceIds.add(sourceId); }
    const path = resolve(root, capture.repositoryPath); assertNoCapturePathSymlinks(root, path, capture.repositoryPath); if (!isInside(captureRoot, path) || !lstatSync(path).isFile() || !isInside(realRoot, realpathSync(path))) fail("DESIGN_SOURCE_CAPTURE_PATH_MISMATCH", capture.repositoryPath);
    const bytes = readFileSync(path); if (bytes.length !== capture.byteLength) fail("DESIGN_SOURCE_CAPTURE_BYTE_LENGTH_MISMATCH", capture.captureId); if (createHash("sha256").update(bytes).digest("hex") !== capture.sha256) fail("DESIGN_SOURCE_CAPTURE_SHA256_MISMATCH", capture.captureId);
    const source = sources.get(capture.sourceIds[0]); const retrieval = capture.retrieval; const isGit = capture.byteRepresentation === "git_blob_bytes";
    const expectedImmutableVersionUrl = isGit ? `https://github.com/${retrieval?.repository}/blob/${retrieval?.commit}/${retrieval?.path}` : `https://web.archive.org/web/${retrieval?.captureTimestamp}id_/${retrieval?.originalUrl}`;
    const expectedRetrievalUrl = isGit ? `https://raw.githubusercontent.com/${retrieval?.repository}/${retrieval?.commit}/${retrieval?.path}` : expectedImmutableVersionUrl;
    if (!retrieval || retrieval.retrievalDate !== "2026-08-13" || (isGit ? retrieval.method !== "raw_git_blob_http_get" || !retrieval.repository || !/^[a-f0-9]{40}$/.test(retrieval.commit ?? "") || !retrieval.path || retrieval.originalUrl !== null || retrieval.captureTimestamp !== null || retrieval.cdxDigest !== null : retrieval.method !== "wayback_exact_capture_http_get" || !/^\d{14}$/.test(retrieval.captureTimestamp ?? "") || !/^[A-Z0-9]{32}$/.test(retrieval.cdxDigest ?? "") || retrieval.originalUrl !== source.canonicalUrl || retrieval.repository !== null || retrieval.commit !== null || retrieval.path !== null) || retrieval.retrievalUrl !== expectedRetrievalUrl || source.immutableVersionUrl !== expectedImmutableVersionUrl || (!isGit && !source.versionContext.includes(retrieval.cdxDigest))) fail("DESIGN_SOURCE_CAPTURE_RETRIEVAL_MISMATCH", capture.captureId);
    const rights = capture.rights; const licensePath = resolve(root, rights?.licenseTextPath ?? ""); if (!rights || !["CC-BY-4.0", "Apache-2.0"].includes(rights.licenseId) || rights.licenseTextPath !== `${licenseRootRelative}/${rights.licenseId}.txt` || rights.licenseEvidenceUrl !== licenseEvidenceUrlBySourceId[source.sourceId] || !rights.creator?.trim() || !rights.title?.trim() || !rights.canonicalUrl?.startsWith("https://") || rights.canonicalUrl !== source.canonicalUrl || rights.modified !== false || !isInside(licenseRoot, licensePath)) fail("DESIGN_SOURCE_CAPTURE_RIGHTS_MISMATCH", capture.captureId);
    try { assertNoCapturePathSymlinks(root, licensePath, rights.licenseTextPath); } catch (error) { if (error.code === "DESIGN_SOURCE_CAPTURE_PATH_MISMATCH") fail("DESIGN_SOURCE_CAPTURE_RIGHTS_MISMATCH", capture.captureId); throw error; }
    if (!lstatSync(licensePath).isFile() || createHash("sha256").update(readFileSync(licensePath)).digest("hex") !== rights.licenseTextSha256) fail("DESIGN_SOURCE_CAPTURE_RIGHTS_MISMATCH", capture.captureId);
  }
  if (value.sourceCaptures.length !== requiredCaptureSourceIds.length) fail("UNBOUND_DESIGN_SOURCE_CAPTURE", "source capture roster");
  if (!sameSet(sourceIds, new Set(requiredCaptureSourceIds))) fail("UNBOUND_DESIGN_SOURCE_CAPTURE", "exact capture sources");
  const actual = new Set(captureFiles(captureRoot).map((path) => relative(root, path))); if (!sameSet(actual, paths)) fail("DEAD_DESIGN_SOURCE_CAPTURE_ARTIFACT", "orphan or missing artifact");
}
const slotFingerprint = (slot) => fingerprint({ trackId: slot.trackId, nodeId: slot.nodeId, blockId: slot.blockId, coverageTargetId: slot.coverageTargetId, directSkillOrDecisionAtomId: slot.directSkillOrDecisionAtomId, expectedOutcome: slot.expectedOutcome, decisiveBoundary: slot.decisiveBoundary, transferBoundary: slot.transferBoundary, materialEvidenceOrConstraintChanged: slot.materialEvidenceOrConstraintChanged });

function closed(schema, path = "schema") { if (!schema || typeof schema !== "object") return; if (schema.type === "object" && schema.additionalProperties !== false) fail("INVALID_DESIGN_SCHEMA_CONTRACT", path); if (schema.properties) Object.entries(schema.properties).forEach(([key, value]) => closed(value, `${path}.${key}`)); if (schema.items) closed(schema.items, `${path}[]`); }
function assertRegistry(value = registry, { repositoryRoot: root = repositoryRoot } = {}) {
  closed(registrySchema, "registry schema");
  for (const key of registrySchema.required) if (!Object.hasOwn(value, key)) fail("INVALID_DESIGN_SOURCE_REGISTRY", `missing ${key}`);
  if (Object.keys(value).some((key) => !Object.hasOwn(registrySchema.properties, key))) fail("INVALID_DESIGN_SOURCE_REGISTRY", "undeclared root field");
  const payload = { ...value }; delete payload.registryFingerprintSha256;
  if (fingerprint(payload) !== value.registryFingerprintSha256) fail("DESIGN_SOURCE_REGISTRY_FINGERPRINT_MISMATCH", "registry identity drift");
  if (value.schemaVersion !== "design-interview-source-registry-v2" || value.registryVersion !== "2026.08.13" || value.checkedDate !== "2026-08-13" || value.familyId !== "design_interview") fail("INVALID_DESIGN_SOURCE_REGISTRY", "v2 root identity");
  for (const source of value.sourceRecords) if (!ownKeys(source, Object.hasOwn(source, "fileSha256") ? ["sourceId", "publisher", "sourceType", "title", "canonicalUrl", "immutableVersionUrl", "versionContext", "fileSha256", "publicationStatus", "checkedDate", "volatility"] : ["sourceId", "publisher", "sourceType", "title", "canonicalUrl", "immutableVersionUrl", "versionContext", "publicationStatus", "checkedDate", "volatility"])) fail("INVALID_DESIGN_SOURCE_IDENTITY", source.sourceId);
  const captureRecordsChanged = digest(value.sourceCaptures) !== digest(registry.sourceCaptures);
  if (captureRecordsChanged) assertCaptures(value, root);
  if (value.trustRootSha256 !== DESIGN_TRUST_ROOT_SHA256 || digest(trustRoot(value)) !== DESIGN_TRUST_ROOT_SHA256) fail("DESIGN_SOURCE_TRUST_ROOT_MISMATCH", "frozen source, anchor, claim, or binding roster drift");
  for (const collection of [value.sourceRecords, value.anchorRecords, value.claims, value.slotBindings]) if (!Array.isArray(collection) || !collection.length) fail("INVALID_DESIGN_SOURCE_REGISTRY", "empty collection");
  unique(value.sourceRecords.map((x) => x.sourceId), "registry source IDs"); unique(value.anchorRecords.map((x) => x.anchorId), "registry anchor IDs"); unique(value.claims.map((x) => x.claimId), "registry claim IDs"); unique(value.slotBindings.map((x) => x.bindingId), "registry binding IDs"); unique(value.slotBindings.map((x) => x.slotId), "registry binding slot IDs");
  const sources = new Set(value.sourceRecords.map((x) => x.sourceId)); const claims = new Set(value.claims.map((x) => x.claimId)); const anchors = new Map(value.anchorRecords.map((x) => [x.anchorId, x]));
  for (const source of value.sourceRecords) if (!source.publisher.trim() || !source.sourceType.trim() || !source.title.trim() || !source.canonicalUrl.startsWith("https://") || !source.immutableVersionUrl.startsWith("https://") || !source.versionContext.trim() || (Object.hasOwn(source, "fileSha256") && !/^[a-f0-9]{64}$/.test(source.fileSha256)) || !source.publicationStatus.trim() || !source.checkedDate.trim() || !source.volatility.trim()) fail("INVALID_DESIGN_SOURCE_IDENTITY", source.sourceId);
  for (const anchor of value.anchorRecords) if (!sources.has(anchor.sourceId) || !anchor.locator.trim() || !anchor.url.startsWith("https://") || !["normative", "informative"].includes(anchor.authorityClass) || anchor.claimIds.some((id) => !claims.has(id))) fail("INVALID_DESIGN_SOURCE_ANCHOR", anchor.anchorId);
  const usedAnchors = new Set(); const usedSources = new Set();
  for (const binding of value.slotBindings) {
    const trackId = TRACK_IDS.find((id) => binding.slotId.startsWith(`${id}:`));
    if (!trackId || binding.resolutionState !== "resolved_exact_direct" || !binding.anchorIds.length || binding.claimIds.some((id) => !claims.has(id)) || binding.anchorIds.some((id) => !anchors.has(id))) fail("INVALID_DESIGN_SOURCE_BINDING", binding.bindingId);
    const covered = new Set(binding.anchorIds.flatMap((id) => anchors.get(id).claimIds)); if (binding.claimIds.some((id) => !covered.has(id))) fail("UNCOVERED_DESIGN_SOURCE_CLAIM", binding.bindingId);
    binding.anchorIds.forEach((id) => { usedAnchors.add(id); usedSources.add(anchors.get(id).sourceId); });
  }
  if (usedAnchors.size !== anchors.size || usedSources.size !== sources.size || value.claims.some((claim) => !value.anchorRecords.some((anchor) => anchor.claimIds.includes(claim.claimId)))) fail("DEAD_DESIGN_SOURCE_INVENTORY", "unbound source, anchor, or claim");
  if (value.sourceRecords.length !== 86 || value.sourceCaptures.length !== 44 || value.anchorRecords.length !== 250 || value.claims.length !== 181 || value.slotBindings.length !== 197) fail("INVALID_DESIGN_SOURCE_REGISTRY_TOTAL", "frozen derived totals");
  assertCaptures(value, root);
  return value;
}
export function validateDesignInterviewFamilyConfig(value = family) {
  if (!value || typeof value !== "object") fail("INVALID_DESIGN_FAMILY_CONTRACT", "family configuration drift");
  if (!ownKeys(value, ["schemaVersion", "familyId", "sourceRegistryRef", "supportedInteractions", "choicePolicyId", "choiceResultSemantics", "authoringHandoffs", "modes", "selectionRules", "sessionFeasibility"]) || value.schemaVersion !== "design-interview-family-config-v1" || value.familyId !== "design_interview" || value.sourceRegistryRef !== "config/design-interview-source-registry.json" || JSON.stringify(value.supportedInteractions) !== JSON.stringify(["choice"]) || value.choicePolicyId !== "design-single-choice-diagnostic-v1" || value.choiceResultSemantics !== "exact_selected_set_with_partial_v1") fail("INVALID_DESIGN_FAMILY_CONTRACT", "root policy");
  const verified = assertRegistry(); const bindings = new Map(verified.slotBindings.map((binding) => [binding.bindingId, binding]));
  const invalidBatch = !Array.isArray(value.authoringHandoffs) || value.authoringHandoffs.length !== TRACK_IDS.length || value.authoringHandoffs.some((batch) => {
    const keys = ["trackId", "batchId", "scope", "plannedItemCount", "slotBindings", "deferredResolvedSlotBindings", "humanReviewRequired", "sourceChecksRequired", "questionsAuthored", "runtimeAdmission"];
    keys.push("deferredResolvedReason", "deferredResolvedReviewBoundary");
    const resolvedCount = verified.slotBindings.filter((binding) => binding.slotId.startsWith(`${batch.trackId}:`)).length;
    if (!ownKeys(batch, keys) || !TRACK_IDS.includes(batch.trackId) || batch.scope !== "authoring_feasibility_only" || batch.plannedItemCount !== EXPECTED_BATCH_SIZE_BY_TRACK[batch.trackId] || batch.humanReviewRequired !== true || batch.sourceChecksRequired !== true || batch.questionsAuthored !== 0 || batch.runtimeAdmission !== "not_admitted" || !Array.isArray(batch.slotBindings) || !Array.isArray(batch.deferredResolvedSlotBindings) || batch.slotBindings.length !== batch.plannedItemCount || !batch.deferredResolvedSlotBindings.length || batch.deferredResolvedReason !== deferredResolvedReason(batch.trackId, resolvedCount, batch.slotBindings.length) || typeof batch.deferredResolvedReviewBoundary !== "string" || !batch.deferredResolvedReviewBoundary.trim() || new Set(batch.slotBindings.map(batchPairKey)).size !== batch.slotBindings.length || new Set(batch.slotBindings.map((entry) => entry.bindingId)).size !== batch.slotBindings.length || new Set(batch.slotBindings.map((entry) => entry.slotId)).size !== batch.slotBindings.length) return true;
    const batchPairs = new Set(batch.slotBindings.map(batchPairKey)); const deferredPairs = new Set(batch.deferredResolvedSlotBindings.map(batchPairKey));
    if (new Set(batch.deferredResolvedSlotBindings.map((entry) => entry.bindingId)).size !== batch.deferredResolvedSlotBindings.length || new Set(batch.deferredResolvedSlotBindings.map((entry) => entry.slotId)).size !== batch.deferredResolvedSlotBindings.length || [...batchPairs].some((entry) => deferredPairs.has(entry))) return true;
    const expectedPairs = new Set(verified.slotBindings.filter((binding) => binding.slotId.startsWith(`${batch.trackId}:`)).map(batchPairKey));
    if (!sameSet(new Set([...batchPairs, ...deferredPairs]), expectedPairs)) return true;
    return [...batch.slotBindings, ...batch.deferredResolvedSlotBindings].some((entry) => !entry || typeof entry.bindingId !== "string" || typeof entry.slotId !== "string" || !bindings.has(entry.bindingId) || bindings.get(entry.bindingId).slotId !== entry.slotId || !entry.slotId.startsWith(`${batch.trackId}:`));
  });
  if (invalidBatch || new Set(value.authoringHandoffs.map((batch) => batch.trackId)).size !== TRACK_IDS.length) fail("INVALID_DESIGN_FAMILY_CONTRACT", "authoring batch roster");
  const invalidMode = !Array.isArray(value.modes) || value.modes.length !== 7 || value.modes.some((mode) => !ownKeys(mode, ["modeId", "contractStatus", "firstBatchEligibleItemCapacityAfterAuthoringByTrack", "currentExecutableCapacity", "boundary"]) || mode.currentExecutableCapacity !== 0 || !ownKeys(mode.firstBatchEligibleItemCapacityAfterAuthoringByTrack, TRACK_IDS) || TRACK_IDS.some((trackId) => ![0, EXPECTED_BATCH_SIZE_BY_TRACK[trackId]].includes(mode.firstBatchEligibleItemCapacityAfterAuthoringByTrack[trackId])));
  if (!ownKeys(value.sessionFeasibility, ["current", "afterAuthoringButBeforeRuntime", "sessionLengthClaim", "freeNodeClaim"]) || invalidMode || !Array.isArray(value.selectionRules) || value.selectionRules.length !== 5) fail("INVALID_DESIGN_FAMILY_CONTRACT", "mode, session, or selection contract");
  if (digest(value) !== DESIGN_FAMILY_CONTRACT_SHA256) fail("INVALID_DESIGN_FAMILY_CONTRACT", "family configuration drift");
  return value;
}
function assertDerivedAdmissionAndAuthoring(curriculum, verified, familyContract) {
  const expectedAdmissionKeys = ADMISSION_KEYS_BY_TRACK[curriculum.trackId];
  const expectedAdmission = { learnerFacingContentIncluded: false, questionsAuthored: 0, runtimeAdmission: "not_admitted", publishingAdmission: "not_admitted", packageAdmission: "not_admitted", releaseAdmission: "not_admitted" };
  if (expectedAdmissionKeys?.includes("manualSourceAdmission")) expectedAdmission.manualSourceAdmission = "not_admitted";
  if (!expectedAdmissionKeys || !ownKeys(curriculum.admission, expectedAdmissionKeys) || Object.entries(expectedAdmission).some(([key, value]) => curriculum.admission[key] !== value)) fail("INVALID_DESIGN_ADMISSION", curriculum.trackId);
  const batch = familyContract.authoringHandoffs.find((entry) => entry.trackId === curriculum.trackId);
  const admittedSlots = curriculum.slots.filter((slot) => slot.authoringStatus === "authoring_admitted");
  const batchSlotIds = batch.slotBindings.map((binding) => binding.slotId).sort();
  const hasCanonicalBatch = JSON.stringify(admittedSlots.map((slot) => slot.slotId).sort()) === JSON.stringify(batchSlotIds);
  const expectedAuthoring = { status: "authoring_feasibility_only", questionsAuthored: 0, firstSafeBatch: hasCanonicalBatch ? batch.batchId : null, backlog: "exact_source_binding_required" };
  if (!ownKeys(curriculum.authoring, Object.keys(expectedAuthoring)) || Object.entries(expectedAuthoring).some(([key, value]) => curriculum.authoring[key] !== value)) fail("INVALID_DESIGN_AUTHORING_STATE", curriculum.trackId);
  if (!Array.isArray(curriculum.modeFeasibility) || curriculum.modeFeasibility.length !== familyContract.modes.length) fail("INVALID_DESIGN_MODE_FEASIBILITY", curriculum.trackId);
  for (const [index, mode] of curriculum.modeFeasibility.entries()) { const canonicalMode = familyContract.modes[index]; const expectedCapacity = hasCanonicalBatch ? canonicalMode.firstBatchEligibleItemCapacityAfterAuthoringByTrack[curriculum.trackId] : 0; if (!ownKeys(mode, ["modeId", "contractStatus", "firstBatchEligibleItemCapacityAfterAuthoring", "executableCapacity", "boundary"]) || mode.modeId !== canonicalMode.modeId || mode.contractStatus !== canonicalMode.contractStatus || mode.firstBatchEligibleItemCapacityAfterAuthoring !== expectedCapacity || mode.executableCapacity !== canonicalMode.currentExecutableCapacity || mode.boundary !== canonicalMode.boundary) fail("INVALID_DESIGN_MODE_FEASIBILITY", mode.modeId); }
}
export function validateDesignInterviewCurriculum(curriculum, { brief, sourceRegistry = registry } = {}) {
  closed(designSchema); const verified = assertRegistry(sourceRegistry); const familyContract = validateDesignInterviewFamilyConfig();
  if (Object.hasOwn(curriculum, "sourceRecords") || Object.hasOwn(curriculum, "sourcePolicy")) fail("DESIGN_LOCAL_SOURCE_INVENTORY_RETIRED", curriculum.trackId);
  for (const field of ["schemaVersion", "curriculumVersion", "trackId", "familyId", "nodes", "blockPlans", "targetPlans", "slots", "modeFeasibility", "admission", "authoring"]) if (!Object.hasOwn(curriculum, field)) fail("MISSING_DESIGN_CURRICULUM_FIELD", field);
  if (curriculum.schemaVersion !== "patternly-design-interview-curriculum-v1" || curriculum.curriculumVersion !== "2026.08.11" || curriculum.familyId !== "design_interview" || curriculum.trackId !== brief.trackId || !TRACK_IDS.includes(curriculum.trackId)) fail("INVALID_DESIGN_CURRICULUM_VERSION", curriculum.trackId);
  const bindings = new Map(verified.slotBindings.map((x) => [x.bindingId, x])); unique(curriculum.slots.map((x) => x.slotId), "slot IDs"); unique(curriculum.slots.map((x) => x.dedupeFingerprint), "slot fingerprints"); let resolved = 0;
  const batch = familyContract.authoringHandoffs.find((entry) => entry.trackId === curriculum.trackId);
  const admittedBindingIds = new Set(batch.slotBindings.map((entry) => entry.bindingId)); const deferredBindingIds = new Set(batch.deferredResolvedSlotBindings.map((entry) => entry.bindingId));
  for (const slot of curriculum.slots) { if (slot.trackId !== curriculum.trackId || slot.dedupeFingerprint !== slotFingerprint(slot)) fail("DESIGN_SLOT_FINGERPRINT_MISMATCH", slot.slotId); const req = slot.sourceRequirements; const interaction = slot.deliveryInteraction; if (req.resolutionState === "resolved_exact_direct") { const binding = bindings.get(req.sourceBindingId); const admitted = admittedBindingIds.has(req.sourceBindingId); const deferred = deferredBindingIds.has(req.sourceBindingId); if (!ownKeys(req, ["resolutionState", "sourceBindingId"]) || !ownKeys(interaction, ["familyContract", "interactionType", "selectionMode", "scoringContract", "status"]) || !binding || binding.slotId !== slot.slotId || interaction.familyContract !== "design_interview" || interaction.interactionType !== "choice" || interaction.selectionMode !== "single" || interaction.scoringContract !== "exact_selected_set_with_partial_v1" || (!admitted && !deferred) || (admitted && (interaction.status !== "authoring_admitted_runtime_not_admitted" || slot.authoringStatus !== "authoring_admitted")) || (deferred && (interaction.status !== "provenance_resolved_authoring_deferred_runtime_not_admitted" || slot.authoringStatus !== "provenance_resolved_authoring_deferred"))) fail("INVALID_DESIGN_RESOLVED_SLOT", slot.slotId); resolved++; } else if (req.resolutionState === "blocked_unresolved") { if (!ownKeys(req, ["resolutionState", "sourceRequirementIds", "unresolvedRequirements"]) || !ownKeys(interaction, ["familyContract", "interactionType", "status"]) || !Array.isArray(req.sourceRequirementIds) || !req.sourceRequirementIds.length || !Array.isArray(req.unresolvedRequirements) || !req.unresolvedRequirements.length || interaction.familyContract !== "design_interview" || interaction.interactionType !== null || interaction.status !== "blocked_by_source_or_interaction_contract") fail("INVALID_DESIGN_BLOCKED_SLOT", slot.slotId); } else fail("INVALID_DESIGN_SOURCE_RESOLUTION", slot.slotId); }
  if (resolved !== EXPECTED_RESOLVED_BY_TRACK[curriculum.trackId]) fail("INVALID_DESIGN_SLOT_RECONCILIATION", curriculum.trackId);
  assertDerivedAdmissionAndAuthoring(curriculum, verified, familyContract); return curriculum;
}
export { assertRegistry as validateDesignInterviewSourceRegistry };
