import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const trackId = "microsoft-azure-ai-fundamentals-ai-901";
const sourceRoot = join(root, "manual", "source", trackId);
const compare = (left, right) => left.localeCompare(right);
const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const writeJson = async (path, value) => writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");

async function sourceFiles(directory, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.sort((left, right) => compare(left.name, right.name)).map((entry) => {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    return entry.isDirectory() ? sourceFiles(join(directory, entry.name), relative) : relative;
  }));
  return nested.flat().filter((path) => path.endsWith(".json"));
}

function midpoint(weight) {
  const match = String(weight?.value ?? "").match(/(\d+(?:\.\d+)?)\s*[–-]\s*(\d+(?:\.\d+)?)%/);
  if (!match) throw new Error(`AI-901 domain weight is not a documented range: ${weight?.value ?? ""}`);
  return (Number(match[1]) + Number(match[2])) / 2;
}

const files = await sourceFiles(sourceRoot);
const batches = await Promise.all(files.map((file) => readJson(join(sourceRoot, file))));
if (!batches.length || batches.some((batch) => batch.schemaVersion !== "certification-node-manual-source-v1")) throw new Error("AI-901 source must remain the explicit node-authoring contract.");
const first = batches[0];
const items = batches.flatMap((batch) => batch.items).sort((left, right) => left.itemId.localeCompare(right.itemId));
const registry = await readJson(join(root, "config", "certification-objective-registries", `${trackId}.json`));
const nodeIds = [...new Set(items.map((item) => item.nodeId))].sort(compare);
const domainIds = registry.domains.map((domain) => domain.domainId);
const itemIds = items.map((item) => item.itemId);
const firstByNode = (nodeId) => items.filter((item) => item.nodeId === nodeId).slice(0, 10).map((item) => item.itemId);
const studyGuide = registry.sources.find((source) => source.sourceId === "microsoft-ai-901-study-guide");

const profile = {
  schemaVersion: "exam-experience-profile-v2",
  profileId: "microsoft-azure-ai-fundamentals-ai-901-patternly-practice-v1",
  profileVersion: "1",
  source: { url: studyGuide.url, checkedDate: studyGuide.checkedDate, guideVersion: registry.guideVersion },
  durationMinutes: 45,
  questionCount: { kind: "range", minimum: 40, maximum: 40 },
  blueprint: { kind: "weighted_sections", sections: registry.domains.map((domain, index) => ({ id: `domain-${index + 1}`, contentDomainId: domain.domainId, weightPercent: midpoint(domain.weight) })) },
  interactionPolicy: {
    schemaVersion: "patternly-certification-simulation-policy-v1",
    policyId: "patternly-certification-simulation-v1",
    policyVersion: "1",
    owner: "patternly_product",
    navigation: "free",
    answerChanges: "until_final_submission",
    flagging: "available",
    navigator: "available",
    sections: "blueprint_visible",
    timeout: "absolute_deadline",
    feedbackTiming: "after_verified_finalization"
  }
};

const modeConfiguration = {
  schemaVersion: "certification-track-mode-config-v1",
  diagnosticBaseline: { blueprintId: "ai-901-patternly-diagnostic-baseline-v1", blueprintVersion: "1", modeId: "certification-diagnostic-baseline", requestedLength: 40, actualLength: 40, shortening: "prohibited", uniqueItemsRequired: 40, timerKind: "elapsed_foreground", feedbackTiming: "after_each_durable_submit", reinsertPolicy: "disabled", itemIds: itemIds.slice(0, 40) },
  focusPractice: { blueprintId: "ai-901-patternly-focus-practice-v1", blueprintVersion: "1", modeId: "certification-focus-practice", requestedLengths: [10, 20, 40], shortening: "allowed_within_topic", selectionScope: "cloud_domain", topicIds: domainIds },
  scenarioPractice: { blueprintId: "ai-901-patternly-scenario-practice-v1", blueprintVersion: "1", modeId: "certification-scenario-practice", requestedLengths: [10, 20, 40], shortening: "allowed_within_competency", selectionScope: "explicit_tag_competency", competencies: nodeIds.map((id) => ({ id, label: id, scenarioItemIds: firstByNode(id) })) },
  weakAreaReview: { blueprintId: "ai-901-patternly-weak-area-review-v1", blueprintVersion: "1", modeId: "certification-weak-area-review", requestedLengths: [10, 20], shortening: "allowed_within_eligible_review_evidence", selectionScope: "eligible_due_review_evidence", persistentResolutionPolicy: "two_consecutive_due_review_successes" },
  mixedPractice: { blueprintId: "ai-901-patternly-mixed-practice-v1", blueprintVersion: "1", modeId: "certification-mixed-practice", requestedLengths: [10, 20, 40], shortening: "allowed_within_interleaved_blueprint", selectionScope: "unique_interleaved_blueprint", itemIds: itemIds.slice(0, 40) },
  quickReview: { blueprintId: "ai-901-patternly-quick-review-v1", blueprintVersion: "1", modeId: "certification-quick-review", maximumLength: 10, shortening: "allowed_within_eligible_review_evidence", selectionScope: "eligible_due_review_evidence", persistentResolutionPolicy: "two_consecutive_due_review_successes" }
};

const taxonomy = { schemaVersion: "taxonomy-config-v1", trackId, taxonomyVersion: first.taxonomyVersion, axes: ["cloud-domain", "tag"], cloudDomains: domainIds, nodeIds, tags: nodeIds };
const track = { schemaVersion: "track-config-v1", trackId, familyId: "certification", taxonomyVersion: first.taxonomyVersion, taxonomyPath: `config/taxonomy/${trackId}.json`, freeNodeExperienceProfilePath: `config/free-node-experience-profiles/${trackId}.json`, modeConfiguration, profile };
const freeProfile = {
  schemaVersion: "patternly-free-node-experience-profile-v1",
  profileId: "microsoft-azure-ai-fundamentals-ai-901-free-node-v1",
  profileVersion: "1",
  trackId,
  familyId: "certification",
  freeNodeId: "responsible_ai_model_foundations_and_deployment_choices",
  primaryEntry: { modeId: "certification-focus-practice", requestedLength: 10 },
  modes: [
    { configurationId: `${trackId}:free:focus`, configurationVersion: "1", modeId: "certification-focus-practice", blueprintModeId: "certification-focus-practice", availability: "immediate", requestedLengths: [10, 20, 40], defaultRequestedLength: 10, selection: { kind: "exact_free_node", freeNodeId: "responsible_ai_model_foundations_and_deployment_choices", itemSource: "package_items", requireUniqueItemIds: true }, reinsertPolicy: "disabled" },
    { configurationId: `${trackId}:free:weak`, configurationVersion: "1", modeId: "certification-weak-area-review", blueprintModeId: "certification-weak-area-review", availability: "evidence_conditioned", requestedLengths: [10, 20], defaultRequestedLength: 10, selection: { kind: "free_node_review_evidence", freeNodeId: "responsible_ai_model_foundations_and_deployment_choices", itemSource: "package_items", requireUniqueItemIds: true, reviewSources: ["due_queue"], emptyEligibility: "unavailable", shortening: "truthful_to_eligible_count" }, reinsertPolicy: "disabled" },
    { configurationId: `${trackId}:free:quick`, configurationVersion: "1", modeId: "certification-quick-review", blueprintModeId: "certification-quick-review", availability: "evidence_conditioned", requestedLengths: [10], defaultRequestedLength: 10, selection: { kind: "due_free_node_review_evidence", freeNodeId: "responsible_ai_model_foundations_and_deployment_choices", itemSource: "package_items", requireUniqueItemIds: true, reviewSources: ["due_queue"], emptyEligibility: "unavailable", shortening: "truthful_to_eligible_count" }, reinsertPolicy: "disabled" }
  ]
};
const packageConfiguration = { schemaVersion: "patternly-bundled-free-node-packages-v1", packages: [
  { trackId: "coding-interview-dsa-problem-solving", packageVersion: "coding-interview-dsa-problem-solving-free-node-0001", minimumAppVersion: "0.1.0" },
  { trackId: "microsoft-azure-administrator-associate-az-104", packageVersion: "microsoft-azure-administrator-associate-az-104-free-node-0001", minimumAppVersion: "0.1.0" },
  { trackId, packageVersion: `${trackId}-free-node-0001`, minimumAppVersion: "0.1.0" }
] };

await writeJson(join(root, "config", "taxonomy", `${trackId}.json`), taxonomy);
await writeJson(join(root, "config", "tracks", `${trackId}.json`), track);
await writeJson(join(root, "config", "free-node-experience-profiles", `${trackId}.json`), freeProfile);
await writeJson(join(root, "config", "bundled-free-node-packages.json"), packageConfiguration);
console.log(`Derived AI-901 runtime configuration from ${items.length} source items across ${nodeIds.length} nodes.`);
