import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const trackId = process.argv[2];
if (!trackId) throw new Error("Usage: node scripts/product/derive-certification-launch-config.mjs <trackId>");
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

function weightValue(domain) {
  const weight = domain.weight ?? {};
  return Number(weight.percent ?? weight.approximatePercent);
}

const [brief, registry] = await Promise.all([
  readJson(join(root, "docs/track-briefs", `${trackId}.json`)),
  readJson(join(root, "config/certification-objective-registries", `${trackId}.json`)),
]);
if (brief.internalFamily !== "certification" || registry.trackId !== trackId) throw new Error(`Track ${trackId} is not a canonical certification launch track.`);
const files = await sourceFiles(join(root, "manual/source", trackId));
const batches = await Promise.all(files.map((file) => readJson(join(root, "manual/source", trackId, file))));
if (!batches.length || batches.some((batch) => batch.schemaVersion !== "certification-manual-source-v2")) throw new Error(`${trackId} must use certification-manual-source-v2.`);
const first = batches[0];
const items = batches.flatMap((batch) => batch.items).sort((left, right) => left.itemId.localeCompare(right.itemId));
const itemIds = items.map((item) => item.itemId);
const nodeIds = [...new Set(items.map((item) => item.nodeId))].sort(compare);
const domainIds = registry.domains.map((domain) => domain.domainId);
const byNode = new Map(nodeIds.map((nodeId) => [nodeId, items.filter((item) => item.nodeId === nodeId).map((item) => item.itemId)]));
const scenarioCompetencies = nodeIds.filter((nodeId) => (byNode.get(nodeId) ?? []).length >= 10).map((nodeId) => ({ id: nodeId, label: nodeId, scenarioItemIds: (byNode.get(nodeId) ?? []).slice(0, 40) }));
if (!scenarioCompetencies.length) throw new Error(`${trackId} has no scenario competency with ten unique items.`);
const profileSource = registry.sources.find((source) => source.authoritativeFor?.includes("duration")) ?? registry.sources[0];
const questionCount = trackId === "aws-certified-solutions-architect-associate" ? { kind: "range", minimum: 65, maximum: 65 } : { kind: "range", minimum: 50, maximum: 60 };
const profile = {
  schemaVersion: "exam-experience-profile-v2",
  profileId: `${trackId}-patternly-practice-v1`,
  profileVersion: "1",
  source: { url: profileSource.url, checkedDate: profileSource.checkedDate, guideVersion: registry.guideVersion },
  durationMinutes: trackId === "aws-certified-solutions-architect-associate" ? 130 : 120,
  questionCount,
  blueprint: { kind: "weighted_sections", sections: registry.domains.map((domain, index) => ({ id: `domain-${index + 1}`, contentDomainId: domain.domainId, weightPercent: weightValue(domain) })) },
  interactionPolicy: {
    schemaVersion: "patternly-certification-simulation-policy-v1", policyId: "patternly-certification-simulation-v1", policyVersion: "1", owner: "patternly_product", navigation: "free", answerChanges: "until_final_submission", flagging: "available", navigator: "available", sections: "blueprint_visible", timeout: "absolute_deadline", feedbackTiming: "after_verified_finalization"
  }
};
const modeConfiguration = {
  schemaVersion: "certification-track-mode-config-v1",
  diagnosticBaseline: { blueprintId: `${trackId}-patternly-diagnostic-baseline-v1`, blueprintVersion: "1", modeId: "certification-diagnostic-baseline", requestedLength: 40, actualLength: 40, shortening: "prohibited", uniqueItemsRequired: 40, timerKind: "elapsed_foreground", feedbackTiming: "after_each_durable_submit", reinsertPolicy: "disabled", itemIds: itemIds.slice(0, 40) },
  focusPractice: { blueprintId: `${trackId}-patternly-focus-practice-v1`, blueprintVersion: "1", modeId: "certification-focus-practice", requestedLengths: [10, 20, 40], shortening: "allowed_within_topic", selectionScope: "cloud_domain", topicIds: domainIds },
  scenarioPractice: { blueprintId: `${trackId}-patternly-scenario-practice-v1`, blueprintVersion: "1", modeId: "certification-scenario-practice", requestedLengths: [10, 20, 40], shortening: "allowed_within_competency", selectionScope: "explicit_tag_competency", competencies: scenarioCompetencies },
  weakAreaReview: { blueprintId: `${trackId}-patternly-weak-area-review-v1`, blueprintVersion: "1", modeId: "certification-weak-area-review", requestedLengths: [10, 20], shortening: "allowed_within_eligible_review_evidence", selectionScope: "eligible_due_review_evidence", persistentResolutionPolicy: "two_consecutive_due_review_successes" },
  mixedPractice: { blueprintId: `${trackId}-patternly-mixed-practice-v1`, blueprintVersion: "1", modeId: "certification-mixed-practice", requestedLengths: [10, 20, 40], shortening: "allowed_within_interleaved_blueprint", selectionScope: "unique_interleaved_blueprint", itemIds: itemIds.slice(0, 40) },
  quickReview: { blueprintId: `${trackId}-patternly-quick-review-v1`, blueprintVersion: "1", modeId: "certification-quick-review", maximumLength: 10, shortening: "allowed_within_eligible_review_evidence", selectionScope: "eligible_due_review_evidence", persistentResolutionPolicy: "two_consecutive_due_review_successes" }
};
const taxonomy = { schemaVersion: "taxonomy-config-v1", trackId, taxonomyVersion: first.taxonomyVersion, axes: ["cloud-domain", "tag"], cloudDomains: domainIds, nodeIds, tags: nodeIds };
const track = { schemaVersion: "track-config-v1", trackId, familyId: "certification", taxonomyVersion: first.taxonomyVersion, taxonomyPath: `config/taxonomy/${trackId}.json`, freeNodeExperienceProfilePath: `config/free-node-experience-profiles/${trackId}.json`, modeConfiguration, profile };
const freeItemCount = (byNode.get(brief.freeNodeId) ?? []).length;
const freeLengths = freeItemCount >= 40 ? [10, 20, 40] : freeItemCount >= 20 ? [10, 20] : freeItemCount >= 10 ? [10] : [Math.max(1, freeItemCount)];
const freeLength = freeLengths[0];
const freeProfile = {
  schemaVersion: "patternly-free-node-experience-profile-v1", profileId: `${trackId}-free-node-v1`, profileVersion: "1", trackId, familyId: "certification", freeNodeId: brief.freeNodeId, primaryEntry: { modeId: "certification-focus-practice", requestedLength: freeLength },
  modes: [
    { configurationId: `${trackId}:free:focus`, configurationVersion: "1", modeId: "certification-focus-practice", blueprintModeId: "certification-focus-practice", availability: "immediate", requestedLengths: freeLengths, defaultRequestedLength: freeLength, selection: { kind: "exact_free_node", freeNodeId: brief.freeNodeId, itemSource: "package_items", requireUniqueItemIds: true }, reinsertPolicy: "disabled" },
    { configurationId: `${trackId}:free:weak`, configurationVersion: "1", modeId: "certification-weak-area-review", blueprintModeId: "certification-weak-area-review", availability: "evidence_conditioned", requestedLengths: [freeLength], defaultRequestedLength: freeLength, selection: { kind: "free_node_review_evidence", freeNodeId: brief.freeNodeId, itemSource: "package_items", requireUniqueItemIds: true, reviewSources: ["due_queue"], emptyEligibility: "unavailable", shortening: "truthful_to_eligible_count" }, reinsertPolicy: "disabled" },
    { configurationId: `${trackId}:free:quick`, configurationVersion: "1", modeId: "certification-quick-review", blueprintModeId: "certification-quick-review", availability: "evidence_conditioned", requestedLengths: [freeLength], defaultRequestedLength: freeLength, selection: { kind: "due_free_node_review_evidence", freeNodeId: brief.freeNodeId, itemSource: "package_items", requireUniqueItemIds: true, reviewSources: ["due_queue"], emptyEligibility: "unavailable", shortening: "truthful_to_eligible_count" }, reinsertPolicy: "disabled" }
  ]
};
await writeJson(join(root, "config/taxonomy", `${trackId}.json`), taxonomy);
await writeJson(join(root, "config/tracks", `${trackId}.json`), track);
await writeJson(join(root, "config/free-node-experience-profiles", `${trackId}.json`), freeProfile);
console.log(JSON.stringify({ trackId, itemCount: items.length, nodeCount: nodeIds.length, freeNodeId: brief.freeNodeId, freeItemCount, freeLengths }, null, 2));
