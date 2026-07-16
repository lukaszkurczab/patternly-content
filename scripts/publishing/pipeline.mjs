import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const exec = promisify(execFile);
export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export class PublishingFailure extends Error { constructor(code, message) { super(`${code}: ${message}`); this.code = code; } }
export const hash = (value) => createHash("sha256").update(value).digest("hex");
const canonical = (value) => {
  if (value === null || typeof value === "boolean" || typeof value === "number" || typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (!value || typeof value !== "object") throw new TypeError("Artifact values must be JSON values.");
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
};
export const canonicalJson = (value) => canonical(value) + "\n";
const text = (value, label) => { if (typeof value !== "string" || !value.trim()) throw new PublishingFailure("INVALID_ENVELOPE", `${label} must be a non-empty string.`); return value; };
const array = (value, label) => { if (!Array.isArray(value)) throw new PublishingFailure("INVALID_ENVELOPE", `${label} must be an array.`); return value; };
const unique = (values, code, label) => { if (new Set(values).size !== values.length) throw new PublishingFailure(code, `${label} must be unique.`); };
const json = async (path) => JSON.parse(await readFile(path, "utf8"));
const inside = (base, path) => { const target = resolve(base, path); const rel = relative(base, target); if (rel === "" || rel === ".." || rel.startsWith(`..${sep}`)) throw new PublishingFailure("INVALID_PATH", `Path escapes canonical root: ${path}`); return target; };

async function files(root) {
  let entries;
  try { entries = await readdir(root, { withFileTypes: true }); } catch (error) { if (error?.code === "ENOENT") return []; throw error; }
  const nested = await Promise.all(entries.sort((a, b) => a.name.localeCompare(b.name)).map(async (entry) => entry.isDirectory() ? files(join(root, entry.name)) : [join(root, entry.name)]));
  return nested.flat();
}
export async function discoverManual(root, kind, trackId) {
  const base = join(root, "manual", kind, trackId);
  const paths = (await files(base)).filter((path) => path.endsWith(".json")).sort((a, b) => relative(base, a).localeCompare(relative(base, b)));
  if (!paths.length) throw new PublishingFailure(kind === "source" ? "EMPTY_INGRESS" : "MISSING_APPROVAL", `No manual ${kind} JSON exists for ${trackId}.`);
  return Promise.all(paths.map(json));
}
async function config(root, trackId) {
  const track = await json(join(root, "config", "tracks", `${trackId}.json`));
  const family = await json(join(root, "config", "families", `${track.familyId}.json`));
  const taxonomy = await json(inside(root, track.taxonomyPath));
  return { track, family, taxonomy };
}
function itemIds(items) { const ids = items.map((item) => text(item?.id, "item id")); unique(ids, "DUPLICATE_ID", "item IDs"); return ids; }
function validateResponse(item) {
  text(item.prompt, `${item.id} prompt`); const feedback = item.feedbackModel;
  if (!feedback || typeof feedback !== "object") throw new PublishingFailure("INVALID_RESPONSE", `${item.id} feedbackModel is required.`);
  text(feedback.decisionSignal, `${item.id} Reason`); text(feedback.details, `${item.id} Details`);
  if (Array.isArray(item.options)) {
    if (item.options.length < 2) throw new PublishingFailure("INVALID_RESPONSE", `${item.id} needs two options.`);
    const ids = item.options.map((option) => text(option?.id, `${item.id} option id`)); unique(ids, "DUPLICATE_ID", `${item.id} option IDs`);
    if (!item.options.some((option) => option.isCorrect === true)) throw new PublishingFailure("INVALID_RESPONSE", `${item.id} needs a correct option.`);
    const explanations = feedback.distractorExplanations ?? {};
    for (const option of item.options.filter((option) => !option.isCorrect)) text(explanations[option.id], `${item.id} wrong-option explanation ${option.id}`);
    return "choice";
  }
  if (Array.isArray(item.subgoals) && Array.isArray(item.correctOrder)) {
    const ids = item.subgoals.map((goal) => text(goal?.id, `${item.id} subgoal id`)); unique(ids, "DUPLICATE_ID", `${item.id} subgoal IDs`);
    if (ids.length < 2 || item.correctOrder.length !== ids.length || new Set(item.correctOrder).size !== ids.length || item.correctOrder.some((id) => !ids.includes(id))) throw new PublishingFailure("INVALID_RESPONSE", `${item.id} ordering declaration is invalid.`);
    return "ordering";
  }
  if (item.correctComplexity?.dimensions?.length) return "complexity";
  throw new PublishingFailure("INVALID_RESPONSE", `${item.id} has no supported response/scoring declaration.`);
}
function validateApproval(records, trackId, contentVersion, ids, sourceBatchIds) {
  const approved = new Map(ids.map((id) => [id, new Set()])); const identities = [];
  for (const record of records) {
    if (record.schemaVersion !== "manual-approval-v1" || !sourceBatchIds.has(record.sourceBatchId) || record.trackId !== trackId || record.contentVersion !== contentVersion || !["editorial", "technical"].includes(record.reviewKind)) throw new PublishingFailure("INVALID_APPROVAL", "Approval record identity is invalid.");
    identities.push(text(record.approvalIdentity, "approval identity"));
    for (const id of array(record.itemIds, "approval itemIds")) { if (!approved.has(id)) throw new PublishingFailure("INVALID_APPROVAL", `Approval references unknown item ${id}.`); approved.get(id).add(record.reviewKind); }
  }
  unique(identities, "INVALID_APPROVAL", "approval identities");
  const missing = [...approved].filter(([, kinds]) => !kinds.has("editorial") || !kinds.has("technical")).map(([id]) => id);
  if (missing.length) throw new PublishingFailure("MISSING_APPROVAL", `Missing manual editorial/technical approval coverage for ${missing.length} item identities.`);
  return { identity: `approval:${hash([...identities].sort().join("\n"))}`, itemIds: [...ids].sort() };
}
function validateBatches(batches, trackConfig, familyConfig, taxonomyConfig) {
  const first = batches[0];
  for (const batch of batches) {
    if (batch.schemaVersion !== "manual-source-v1" || batch.trackId !== trackConfig.trackId || batch.familyId !== trackConfig.familyId || batch.taxonomyVersion !== trackConfig.taxonomyVersion) throw new PublishingFailure("INVALID_ENVELOPE", "Manual source envelope does not match canonical track configuration.");
    text(batch.sourceBatchId, "sourceBatchId"); text(batch.contentVersion, "contentVersion");
    if (!batch.provenance || typeof batch.provenance !== "object") throw new PublishingFailure("MISSING_PROVENANCE", "Manual source provenance is required.");
    text(batch.provenance.sourceRepository, "provenance.sourceRepository"); text(batch.provenance.sourceReference, "provenance.sourceReference");
    if (batch.contentVersion !== first.contentVersion || JSON.stringify(batch.declaredModes) !== JSON.stringify(first.declaredModes)) throw new PublishingFailure("VERSION_MISMATCH", "All source batches must declare one content version and one mode set.");
  }
  const modes = array(first.declaredModes, "declaredModes"); unique(modes, "INVALID_MODE", "declared modes");
  const allowedModes = new Map(familyConfig.modes.map((mode) => [mode.id, mode]));
  for (const mode of modes) if (!allowedModes.has(mode)) throw new PublishingFailure("INVALID_MODE", `Unsupported declared mode ${mode}.`);
  const items = batches.flatMap((batch) => array(batch.items, "items")); const ids = itemIds(items);
  const interactions = items.map(validateResponse); if (interactions.some((kind) => !familyConfig.supportedInteractions.includes(kind))) throw new PublishingFailure("UNSUPPORTED_INTERACTION", "Source declares an unsupported interaction.");
  const groups = batches.flatMap((batch) => batch.groups ?? []);
  if (trackConfig.familyId === "algorithms") {
    const nodes = new Set(taxonomyConfig.nodes); const grouped = [];
    for (const group of groups) { if (!nodes.has(group?.roadmapNodeId)) throw new PublishingFailure("INVALID_REFERENCE", "Algorithms source references an unknown taxonomy node."); grouped.push(...array(group.itemIds, "group itemIds")); }
    unique(grouped, "DUPLICATE_ID", "Algorithms group item IDs"); if (grouped.length !== ids.length || grouped.some((id) => !ids.includes(id))) throw new PublishingFailure("INVALID_REFERENCE", "Algorithms groups must cover every item exactly once.");
  } else {
    const axes = new Set(taxonomyConfig.axes); for (const item of items) for (const ref of array(item.taxonomyRefs, `${item.id} taxonomyRefs`)) if (!axes.has(ref?.axisId) || !text(ref?.nodeId, "taxonomy node")) throw new PublishingFailure("INVALID_REFERENCE", "Certification taxonomy reference is invalid.");
  }
  for (const modeId of modes) { const requirement = allowedModes.get(modeId); if (items.length < requirement.minimumPool) throw new PublishingFailure("INSUFFICIENT_POOL", `${modeId} requires ${requirement.minimumPool} unique items.`); if (requirement.fixedLength && new Set(ids).size !== ids.length) throw new PublishingFailure("INSUFFICIENT_POOL", `${modeId} requires exactly ${requirement.fixedLength} unique simulation occurrences.`); }
  if (trackConfig.profile && items.length < trackConfig.profile.minimumPool) throw new PublishingFailure("INSUFFICIENT_POOL", "Resolved Certification profile requirements are not met.");
  return { contentVersion: first.contentVersion, taxonomyVersion: first.taxonomyVersion, declaredModes: [...modes].sort(), items: [...items].sort((left, right) => left.id.localeCompare(right.id)), groups: groups.map((group) => ({ ...group, itemIds: [...group.itemIds].sort() })).sort((left, right) => left.roadmapNodeId.localeCompare(right.roadmapNodeId)), ids: [...ids].sort() };
}
async function sourceCommit(root, override) { if (override) return override; const { stdout } = await exec("git", ["rev-parse", "HEAD"], { cwd: root }); return stdout.trim(); }
export async function validateTrack({ root = ROOT, trackId }) {
  const { track, family, taxonomy } = await config(root, trackId); const batches = await discoverManual(root, "source", trackId); const source = validateBatches(batches, track, family, taxonomy); const approvals = await discoverManual(root, "approvals", trackId); const approvalCoverage = validateApproval(approvals, trackId, source.contentVersion, source.ids, new Set(batches.map((batch) => batch.sourceBatchId))); return { track, family, taxonomy, source, approvalCoverage };
}
function bankFor(validated) { const common = { formatVersion: 1, trackId: validated.track.trackId, familyId: validated.track.familyId, contentVersion: validated.source.contentVersion, items: validated.source.items }; return validated.track.familyId === "algorithms" ? { ...common, groups: validated.source.groups } : common; }
export async function buildTrack({ root = ROOT, trackId, outputRoot = join(ROOT, "artifacts"), sourceRepositoryCommit }) {
  const validated = await validateTrack({ root, trackId }); const bank = bankFor(validated);
  const artifactBytes = canonicalJson({ envelopeVersion: 1, schemaVersion: "published-bank-v1", contentVersion: validated.source.contentVersion, taxonomyVersion: validated.source.taxonomyVersion, bank });
  const artifact = { schemaVersion: "published-bank-v1", familyId: validated.track.familyId, trackId, contentVersion: validated.source.contentVersion, taxonomyVersion: validated.source.taxonomyVersion, declaredModes: validated.source.declaredModes, approvalCoverage: validated.approvalCoverage, checksumSha256: hash(artifactBytes), sourceRepositoryCommit: await sourceCommit(root, sourceRepositoryCommit), fixedPools: Object.fromEntries(validated.source.declaredModes.filter((mode) => mode === "algorithms-interview-simulation").map((mode) => [mode, [...validated.source.ids].sort().slice(0, 40)])), artifactBytes };
  const out = join(outputRoot, "tracks", trackId, artifact.contentVersion, "track-artifact.json");
  try { await stat(out); throw new PublishingFailure("IMMUTABLE_VERSION", `Artifact version already exists: ${trackId}/${artifact.contentVersion}.`); } catch (error) { if (error?.code !== "ENOENT") throw error; }
  await mkdir(dirname(out), { recursive: true }); await writeFile(out, canonicalJson(artifact));
  const reportPath = join(root, "reports", "publishing", `${trackId}-${artifact.contentVersion}.json`);
  await mkdir(dirname(reportPath), { recursive: true }); await writeFile(reportPath, canonicalJson({ schemaVersion: "publishing-report-v1", trackId, familyId: artifact.familyId, contentVersion: artifact.contentVersion, taxonomyVersion: artifact.taxonomyVersion, declaredModes: artifact.declaredModes, itemCount: artifact.approvalCoverage.itemIds.length, approvalCoverageIdentity: artifact.approvalCoverage.identity, checksumSha256: artifact.checksumSha256, sourceRepositoryCommit: artifact.sourceRepositoryCommit }));
  return { artifact, path: out, reportPath };
}
export async function verifyArtifact(path) {
  const artifact = await json(path); const actual = hash(text(artifact.artifactBytes, "artifactBytes")); if (actual !== artifact.checksumSha256) throw new PublishingFailure("CHECKSUM_MISMATCH", "Artifact bytes do not match checksum.");
  const envelope = JSON.parse(artifact.artifactBytes); if (envelope.envelopeVersion !== 1 || envelope.schemaVersion !== artifact.schemaVersion || envelope.contentVersion !== artifact.contentVersion || envelope.taxonomyVersion !== artifact.taxonomyVersion || envelope.bank.trackId !== artifact.trackId || envelope.bank.familyId !== artifact.familyId) throw new PublishingFailure("INVALID_ARTIFACT", "Artifact envelope identity is invalid.");
  return artifact;
}
export async function publishRelease({ root = ROOT, releaseId, artifactPaths, outputRoot = join(ROOT, "artifacts"), sourceRepositoryCommit }) {
  text(releaseId, "releaseId"); const artifacts = await Promise.all(artifactPaths.map(verifyArtifact)); unique(artifacts.map((artifact) => artifact.trackId), "INVALID_RELEASE", "release track IDs");
  const release = { manifest: { envelopeVersion: 1, releaseId, sourceRepositoryCommit: await sourceCommit(root, sourceRepositoryCommit) }, artifacts: artifacts.map(({ fixedPools, ...artifact }) => artifact).sort((a, b) => a.trackId.localeCompare(b.trackId)) };
  const out = join(outputRoot, "releases", releaseId, "release.json"); try { await stat(out); throw new PublishingFailure("IMMUTABLE_VERSION", `Release already exists: ${releaseId}.`); } catch (error) { if (error?.code !== "ENOENT") throw error; }
  await mkdir(dirname(out), { recursive: true }); await writeFile(out, canonicalJson(release));
  const exported = join(root, "exports", "app", `generated-${releaseId}.mjs`); await mkdir(dirname(exported), { recursive: true }); await writeFile(exported, `export const GENERATED_BUNDLED_CONTENT_RELEASE = Object.freeze(${JSON.stringify(release)});\n`); return { release, path: out, exportPath: exported };
}
