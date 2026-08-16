import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { summarizeSource, validateApprovalRecord } from "./content-approval.mjs";

const root = process.cwd();
const readinessPath = join(root, "evidence/readiness/eight-track-launch-readiness.json");
const outputRoot = join(root, "evidence/review-packets");

const canonical = (value) => {
  if (value === null || ["boolean", "number", "string"].includes(typeof value)) return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
};

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((entry) => entry.isDirectory()
      ? walk(join(directory, entry.name))
      : entry.name.endsWith(".json") ? [join(directory, entry.name)] : []));
  return nested.flat().sort();
}

function collectUrls(value, urls = new Set()) {
  if (Array.isArray(value)) for (const entry of value) collectUrls(entry, urls);
  else if (value && typeof value === "object") {
    for (const [key, entry] of Object.entries(value)) {
      if (key.toLowerCase() === "url" && typeof entry === "string" && /^https?:\/\//.test(entry)) urls.add(entry);
      else collectUrls(entry, urls);
    }
  }
  return urls;
}

function firstDefined(...values) { return values.find((value) => value !== undefined && value !== null && value !== ""); }

function itemIdentity(item) { return firstDefined(item.itemId, item.id, item.slotId); }

function itemNode(item, batch) { return firstDefined(item.nodeId, batch.nodeId, "unassigned"); }

function itemBlock(item, batch) {
  return firstDefined(item.learningBlockId, item.mentalUnitId, batch.learningBlockId, "unassigned");
}

function itemSkill(item) {
  return firstDefined(item.taxonomy?.skillAtomId, item.taxonomy?.primarySkillAtomId, item.taxonomy?.mentalUnitId, item.mentalUnitId, "unassigned");
}

function check(id, status, detail, count) {
  return { id, status, detail, ...(count === undefined ? {} : { count }) };
}

async function buildPacket(track, sourceCommit) {
  const sourceRoot = join(root, "manual/source", track.trackId);
  const files = await walk(sourceRoot);
  const batches = await Promise.all(files.map(async (file) => ({
    path: relative(root, file),
    value: JSON.parse(await readFile(file, "utf8"))
  })));
  const records = batches.flatMap(({ path, value }) => (value.items ?? []).map((item, index) => ({ path, batch: value, item, index })));
  const identities = records.map(({ item }) => itemIdentity(item));
  const duplicateIdentities = [...new Set(identities.filter((id, index) => id && identities.indexOf(id) !== index))].sort();
  const missingPrompt = records.filter(({ item }) => typeof item.prompt !== "string" || !item.prompt.trim()).length;
  const missingFeedback = records.filter(({ item }) => !item.feedback || typeof item.feedback !== "object").length;
  const missingInteraction = records.filter(({ item }) => !item.interaction?.type || !Array.isArray(item.interaction?.acceptedOptionIds)).length;
  const urls = [...records.reduce((set, { item }) => collectUrls(item, set), new Set())].sort();
  const sourceHosts = [...new Set(urls.map((url) => new URL(url).host))].sort();
  const contentVersions = [...new Set(batches.map(({ value }) => value.contentVersion).filter(Boolean))].sort();
  const taxonomyVersions = [...new Set(batches.map(({ value }) => value.taxonomyVersion).filter(Boolean))].sort();
  const approvals = [...new Set(batches.map(({ value }) => value.authoringProvenance?.approvalStatus).filter(Boolean))].sort();
  const blocks = new Map();
  for (const record of records) {
    const nodeId = itemNode(record.item, record.batch);
    const learningBlockId = itemBlock(record.item, record.batch);
    const key = `${nodeId}::${learningBlockId}`;
    const block = blocks.get(key) ?? { nodeId, learningBlockId, itemCount: 0, skillAtoms: new Set(), paths: new Set(), records: [] };
    block.itemCount += 1;
    block.skillAtoms.add(itemSkill(record.item));
    block.paths.add(record.path);
    block.records.push(record);
    blocks.set(key, block);
  }
  const coverage = [...blocks.values()]
    .sort((a, b) => `${a.nodeId}::${a.learningBlockId}`.localeCompare(`${b.nodeId}::${b.learningBlockId}`))
    .map((block) => ({
      nodeId: block.nodeId,
      learningBlockId: block.learningBlockId,
      itemCount: block.itemCount,
      skillAtomCount: block.skillAtoms.size,
      sourceFiles: [...block.paths].sort()
    }));
  const interactionDistribution = Object.fromEntries([...records.reduce((counts, { item }) => {
    const type = item.interaction?.type ?? "unknown";
    counts.set(type, (counts.get(type) ?? 0) + 1);
    return counts;
  }, new Map())].sort(([a], [b]) => a.localeCompare(b)));
  let approval = null;
  try {
    approval = JSON.parse(await readFile(join(root, "evidence/content-approvals", `${track.trackId}.json`), "utf8"));
    validateApprovalRecord(approval, { sourceCommit, trackId: track.trackId, sourceSummary: await summarizeSource({ root, trackId: track.trackId }) });
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  const samples = [];
  for (const block of [...blocks.values()].sort((a, b) => `${a.nodeId}::${a.learningBlockId}`.localeCompare(`${b.nodeId}::${b.learningBlockId}`))) {
    const sorted = [...block.records].sort((a, b) => (itemIdentity(a.item) ?? "").localeCompare(itemIdentity(b.item) ?? ""));
    const selected = [...new Set([0, Math.floor((sorted.length - 1) / 2), sorted.length - 1])].map((index) => sorted[index]).filter(Boolean);
    for (const record of selected) samples.push({
      itemId: itemIdentity(record.item),
      nodeId: itemNode(record.item, record.batch),
      learningBlockId: itemBlock(record.item, record.batch),
      skillAtomId: itemSkill(record.item),
      interactionType: record.item.interaction?.type ?? "unknown",
      sourceFile: record.path,
      sourceUrls: [...collectUrls(record.item)].sort()
    });
  }
  return {
    schemaVersion: "patternly-human-review-packet-v1",
    packetId: `human-review:${track.trackId}`,
    trackId: track.trackId,
    familyId: track.familyId,
    generatedFrom: { sourceCommit, readinessReport: "evidence/readiness/eight-track-launch-readiness.json" },
    coverage: {
      sourceRoot: relative(root, sourceRoot),
      sourceFileCount: files.length,
      canonicalItemCount: records.length,
      nodeCount: new Set(coverage.map((entry) => entry.nodeId).filter((id) => id !== "unassigned")).size,
      learningBlockCount: new Set(coverage.map((entry) => entry.learningBlockId).filter((id) => id !== "unassigned")).size,
      nodesAndBlocks: coverage
    },
    interactionDistribution,
    sampleStrata: { method: "first-middle-last-item-per-node-and-learning-block", samples },
    sourceFreshness: {
      contentVersions,
      taxonomyVersions,
      referencedSourceCount: urls.length,
      sourceHosts,
      httpFreshness: "not_rechecked_by_packet_generator",
      sourceCommit
    },
    automatedFindings: [
      check("source-files-present", files.length > 0 ? "pass" : "fail", `${files.length} JSON source files discovered.`, files.length),
      check("item-identities-unique", duplicateIdentities.length === 0 ? "pass" : "fail", duplicateIdentities.length ? `Duplicate identities: ${duplicateIdentities.join(", ")}.` : "Every authored item has a unique item identity.", records.length),
      check("prompts-present", missingPrompt === 0 ? "pass" : "fail", `${missingPrompt} items lack a non-empty prompt.`, missingPrompt),
      check("feedback-present", missingFeedback === 0 ? "pass" : "fail", `${missingFeedback} items lack a feedback object.`, missingFeedback),
      check("interaction-contract", missingInteraction === 0 ? "pass" : "fail", `${missingInteraction} items lack a choice interaction or accepted-option list.`, missingInteraction),
      check("source-binding-observed", urls.length > 0 ? "pass" : "manual-review-required", urls.length > 0 ? `${urls.length} exact HTTPS source URLs were observed.` : "This family uses repository-native provenance; a human reviewer must verify its source binding.", urls.length),
      check("structural-validation", "required_in_ci", `Run ${track.structuralValidation.command} from a clean checkout.`),
      check("human-approval", approval ? "pass" : "blocked", approval ? `Approved under ${approval.approvalId}.` : `Current authoring approval states: ${approvals.join(", ") || "not declared"}.`),
      check("runtime-and-publishing-admission", "blocked", "Runtime and publishing admission remain explicitly not granted.")
    ],
    knownLimitations: [
      approval ? "Content approval is recorded separately and covers only the exact source commit and item identities named in the approval record." : "This packet prepares review; it is not a factual, technical, editorial, or Product Owner approval.",
      "Source freshness is represented by the exact source commit and observed URLs; HTTP freshness is not rechecked by this generator.",
      "Runtime, publishing, package, and learner admission are outside this packet and remain blocked until their explicit evidence exists."
    ],
    approvalForm: {
      status: approval ? "approved" : "pending",
      reviewer: approval?.reviewer ?? null,
      reviewedAt: approval?.reviewDate ?? null,
      disposition: approval?.finalDisposition ?? null,
      reviewScope: { sourceCommit, sourceFileCount: files.length, canonicalItemCount: records.length, sampleCount: samples.length, automatedFindingIds: ["source-files-present", "item-identities-unique", "prompts-present", "feedback-present", "interaction-contract", "source-binding-observed"] },
      acceptedLimitations: approval?.acceptedLimitations ?? [],
      recordPath: approval ? `evidence/content-approvals/${track.trackId}.json` : null
    }
  };
}

const readiness = JSON.parse(await readFile(readinessPath, "utf8"));
const sourceCommit = readiness.sourceCommit;
await mkdir(outputRoot, { recursive: true });
for (const track of readiness.tracks) {
  const packet = await buildPacket(track, sourceCommit);
  const bytes = `${canonical(packet)}\n`;
  await writeFile(join(outputRoot, `${track.trackId}.json`), bytes);
  process.stdout.write(`${track.trackId} ${sha256(bytes)}\n`);
}
