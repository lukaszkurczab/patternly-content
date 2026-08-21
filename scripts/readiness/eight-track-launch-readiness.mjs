import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { verifyArtifactRecord } from "../publishing/pipeline.mjs";
import { HUMAN_APPROVAL_MANIFEST_PATH, summarizeSource, validateHumanApprovalEntry, validateHumanApprovalManifest } from "../review/content-approval.mjs";

const exec = promisify(execFile);
const root = process.cwd();
const outputPath = join(root, "evidence/readiness/eight-track-launch-readiness.json");
const candidates = [
  ["coding-interview-dsa-problem-solving", "coding_interview", "npm run validate:real:coding-interview"],
  ["google-cloud-associate-cloud-engineer", "certification", "npm run audit:gcp:authoring"],
  ["aws-certified-solutions-architect-associate", "certification", "npm run audit:aws-workbook-source"],
  ["microsoft-azure-ai-fundamentals-ai-901", "certification", "npm run audit:ai901"],
  ["microsoft-azure-administrator-associate-az-104", "certification", "npm run authoring:validate"],
  ["backend-system-design-interview", "design_interview", "npm run validate:backend-system-design"],
  ["frontend-system-design-interview", "design_interview", "npm run validate:frontend-bank"],
  ["object-oriented-design-interview", "design_interview", "npm run validate:object-oriented-design"]
];

const canonical = (value) => {
  if (value === null || ["boolean", "number", "string"].includes(typeof value)) return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
};
const hash = (value) => createHash("sha256").update(value).digest("hex");
async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.sort((a, b) => a.name.localeCompare(b.name)).map((entry) => entry.isDirectory() ? walk(join(directory, entry.name)) : [join(directory, entry.name)]));
  return nested.flat();
}

const RELEASE_INPUT_PATHS = [
  "manual/source",
  "config/families",
  "config/tracks",
  "config/taxonomy",
  "schemas/publishing",
  "scripts/publishing",
  "package.json",
  "package-lock.json",
];

const VALIDATOR_MAX_BUFFER = 256 * 1024 * 1024;

async function runStructuralValidator(command) {
  const match = /^npm run ([A-Za-z0-9:_-]+)$/u.exec(command);
  if (!match) return { result: "invalid_command", command };
  try {
    await exec("npm", ["run", match[1]], { cwd: root, maxBuffer: VALIDATOR_MAX_BUFFER });
    return { result: "passed", command };
  } catch {
    return { result: "failed", command };
  }
}

async function immutableArtifactSummary(trackId) {
  const releasesRoot = join(root, "artifacts/releases");
  let releaseDirectories;
  try {
    releaseDirectories = (await readdir(releasesRoot, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
  } catch (error) {
    if (error?.code === "ENOENT") return { presence: "not_verified_by_source-only-report", version: null };
    throw error;
  }

  for (const releaseId of releaseDirectories) {
    const releasePath = join(releasesRoot, releaseId, "release.json");
    let release;
    try {
      release = JSON.parse(await readFile(releasePath, "utf8"));
    } catch (error) {
      if (error?.code === "ENOENT") continue;
      throw error;
    }
    const artifact = Array.isArray(release?.artifacts)
      ? release.artifacts.find((candidate) => candidate?.trackId === trackId)
      : undefined;
    if (!artifact) continue;
    try {
      verifyArtifactRecord(artifact);
      const sourceCommit = artifact.sourceRepositoryCommit;
      if (!/^[a-f0-9]{40}$/.test(sourceCommit)) continue;
      await exec("git", ["cat-file", "-e", `${sourceCommit}^{commit}`], { cwd: root });
      await exec("git", ["diff", "--quiet", `${sourceCommit}..HEAD`, "--", ...RELEASE_INPUT_PATHS], { cwd: root });
      if (release?.manifest?.releaseId !== releaseId || release?.manifest?.sourceRepositoryCommit !== sourceCommit) continue;
      return {
        presence: "verified",
        releaseId,
        version: artifact.contentVersion,
        sourceRepositoryCommit: sourceCommit,
        checksumSha256: artifact.checksumSha256,
      };
    } catch {
      // Historical or superseded artifacts are intentionally not current evidence.
    }
  }
  return { presence: "not_verified_by_source-only-report", version: null };
}

async function sourceSummary(trackId, familyId, validatorCommand, humanApprovalManifest) {
  const sourceRoot = join(root, "manual/source", trackId);
  let files = [];
  try { files = (await walk(sourceRoot)).filter((file) => file.endsWith(".json")).sort(); } catch {}
  if (!files.length) return {
    trackId,
    familyId,
    currentSourceRoot: relative(root, sourceRoot),
    authoringRegistrationPath: `config/authoring/tracks/${trackId}.json`,
    sourceFileCount: 0,
    canonicalItemCount: 0,
    nodeCount: 0,
    learningBlockCount: 0,
    interactionInventory: {},
    structuralValidation: { result: "blocked_source_absent", command: null },
    humanReview: "not_possible_source_absent",
    humanApproval: null,
    runtimeAdmission: "not_admitted",
    publishingAdmission: "not_admitted",
    immutableArtifact: await immutableArtifactSummary(trackId),
    bundledFreeNodePackage: { paths: [], presence: "absent" },
    blockers: ["canonical_learner_source_absent", "human_review_required", "runtime_admission_not_granted", "publishing_admission_not_granted"]
  };
  const batches = await Promise.all(files.map(async (file) => ({ file, value: JSON.parse(await readFile(file, "utf8")) })));
  const items = batches.flatMap(({ value }) => value.items ?? []);
  const nodeIds = [...new Set(batches.map(({ value }) => value.nodeId).filter(Boolean))].sort();
  const blockIds = [...new Set(batches.map(({ value }) => value.learningBlockId).filter(Boolean))].sort();
  const admissions = batches.map(({ value }) => ({ runtime: value.runtimeAdmission, publishing: value.publishingAdmission, approval: value.authoringProvenance?.approvalStatus }));
  const inactive = admissions.every((entry) => entry.runtime === undefined || entry.runtime === "not_admitted") && admissions.every((entry) => entry.publishing === undefined || entry.publishing === "not_admitted");
  const packageRoot = join(root, "artifacts/bundled-free-nodes", trackId);
  let bundledPackage = null;
  try { bundledPackage = (await walk(packageRoot)).filter((file) => file.endsWith("package.json")).map((file) => relative(root, file)).sort(); } catch { bundledPackage = []; }
  const structuralValidation = await runStructuralValidator(validatorCommand);
  const approval = humanApprovalManifest?.tracks.find((entry) => entry.trackId === trackId) ?? null;
  if (approval) validateHumanApprovalEntry(approval, { sourceCommit, trackId, sourceSummary: await summarizeSource({ root, trackId }) });
  const agentReviewPath = `evidence/content-approvals/${trackId}.json`;
  return {
    trackId,
    familyId,
    currentSourceRoot: relative(root, sourceRoot),
    authoringRegistrationPath: `config/authoring/tracks/${trackId}.json`,
    sourceFileCount: files.length,
    canonicalItemCount: items.length,
    nodeCount: nodeIds.length,
    learningBlockCount: blockIds.length,
    interactionInventory: Object.fromEntries([...items.reduce((counts, item) => counts.set(item.interaction?.type ?? "unknown", (counts.get(item.interaction?.type ?? "unknown") ?? 0) + 1), new Map()).entries()].sort(([a], [b]) => a.localeCompare(b))),
    structuralValidation,
    humanReview: approval ? "approved" : admissions.some((entry) => entry.approval === "unapproved") ? "unapproved" : "pending",
    humanApproval: approval ? { path: HUMAN_APPROVAL_MANIFEST_PATH, approvalId: approval.approvalId, sourceCommit: approval.sourceCommit, confirmationDate: humanApprovalManifest.confirmationDate, itemManifestSha256: approval.itemManifestSha256 } : null,
    agentReviewPreparation: { path: agentReviewPath, status: "recorded", reviewerKind: "owner_authorized_agent" },
    runtimeAdmission: inactive ? "not_admitted" : "mixed_or_unknown",
    publishingAdmission: inactive ? "not_admitted" : "mixed_or_unknown",
    immutableArtifact: await immutableArtifactSummary(trackId),
    bundledFreeNodePackage: { paths: bundledPackage, presence: bundledPackage.length ? "present" : "absent" },
    blockers: [
      ...(approval ? [] : ["human_review_required"]),
      "runtime_admission_not_granted",
      "publishing_admission_not_granted"
    ]
  };
}

// The report is an output, so HEAD would change merely by committing this file.
// Track the newest commit that changed the content inputs the report describes.
const sourceCommit = (await exec("git", [
  "log", "-1", "--format=%H", "--",
  "manual/source",
  "config/authoring",
  "config/curricula",
  "docs/track-briefs"
], { cwd: root })).stdout.trim();
let humanApprovalManifest = null;
try {
  humanApprovalManifest = JSON.parse(await readFile(join(root, HUMAN_APPROVAL_MANIFEST_PATH), "utf8"));
  validateHumanApprovalManifest(humanApprovalManifest, { sourceCommit, trackIds: candidates.map(([trackId]) => trackId) });
} catch (error) {
  if (error?.code !== "ENOENT") humanApprovalManifest = null;
}
const banks = await Promise.all(candidates.map(([trackId, familyId, validator]) => sourceSummary(trackId, familyId, validator, humanApprovalManifest)));
const report = { schemaVersion: "eight-track-launch-readiness-v1", launchTrackIds: banks.map((bank) => bank.trackId).sort(), sourceCommit, tracks: banks.sort((a, b) => a.trackId.localeCompare(b.trackId)) };
const bytes = `${canonical(report)}\n`;
await mkdir(join(root, "evidence/readiness"), { recursive: true });
await writeFile(outputPath, bytes);
console.log(JSON.stringify({ path: relative(root, outputPath), sha256: hash(bytes), tracks: report.tracks.length }, null, 2));
