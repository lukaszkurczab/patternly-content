import { readdir, readFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPOSITORY_ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const TRACK_SOURCE_DIRECTORIES = Object.freeze({
  algorithms: "manual/source/algorithms",
  "cloud-certification": "manual/source/cloud-certification",
});

const WORD_PATTERN = /[\p{L}\p{N}]+(?:['’+-][\p{L}\p{N}]+)*/gu;

export async function auditExplanationQuality({
  root = REPOSITORY_ROOT,
  trackId = "all",
} = {}) {
  const selectedTrackIds = trackId === "all"
    ? Object.keys(TRACK_SOURCE_DIRECTORIES)
    : [assertTrackId(trackId)];
  const items = [];

  for (const selectedTrackId of selectedTrackIds) {
    const sourceRoot = join(root, TRACK_SOURCE_DIRECTORIES[selectedTrackId]);
    const sourcePaths = await discoverJsonFiles(sourceRoot);
    for (const sourcePath of sourcePaths) {
      const batch = JSON.parse(await readFile(sourcePath, "utf8"));
      for (const item of batch.items ?? []) {
        items.push(auditItem({
          batch,
          item,
          sourcePath: relative(root, sourcePath),
          trackId: selectedTrackId,
        }));
      }
    }
  }

  items.sort((left, right) =>
    left.trackId.localeCompare(right.trackId)
    || left.sourcePath.localeCompare(right.sourcePath)
    || left.itemId.localeCompare(right.itemId));
  assertUniqueItemIdentity(items);

  const riskSignalCounts = {};
  const formatCounts = {};
  const interactionCounts = {};
  for (const item of items) {
    interactionCounts[item.interactionType] = (interactionCounts[item.interactionType] ?? 0) + 1;
    for (const format of item.details.formats) {
      formatCounts[format] = (formatCounts[format] ?? 0) + 1;
    }
    for (const signal of item.riskSignals) {
      riskSignalCounts[signal.code] = (riskSignalCounts[signal.code] ?? 0) + 1;
    }
  }

  return {
    schemaVersion: "patternly-explanation-quality-audit-v1",
    scope: {
      trackIds: selectedTrackIds,
      itemCount: items.length,
    },
    summary: {
      interactionCounts: sortedRecord(interactionCounts),
      formatCounts: sortedRecord(formatCounts),
      riskSignalCounts: sortedRecord(riskSignalCounts),
      itemsWithRiskSignals: items.filter((item) => item.riskSignals.length > 0).length,
      itemsWithoutRiskSignals: items.filter((item) => item.riskSignals.length === 0).length,
    },
    interpretation: "Risk signals prioritize item-level technical and editorial review. They do not approve or reject pedagogical quality.",
    items,
  };
}

function auditItem({ batch, item, sourcePath, trackId }) {
  const reason = item.feedback?.reason ?? "";
  const blocks = item.feedback?.details?.blocks ?? [];
  const detailsText = blocks.map(feedbackBlockText).filter(Boolean).join("\n");
  const wrongExplanations = Object.entries(
    item.feedback?.wrongOptionExplanationsByOptionId ?? {},
  )
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([optionId, text]) => ({
      optionId,
      wordCount: wordCount(text),
    }));
  const formats = [...new Set(blocks.map((block) => block.type))].sort();
  const interactionType = trackId === "algorithms"
    ? item.interaction?.type ?? "unknown"
    : item.type ?? "unknown";
  const riskSignals = collectRiskSignals({
    blocks,
    detailsText,
    interactionType,
    reason,
    trackId,
    wrongExplanations,
  });

  return {
    trackId,
    familyId: batch.familyId ?? (trackId === "algorithms" ? "algorithms" : "certification"),
    sourcePath,
    batchId: batch.batchId ?? batch.contentVersion,
    itemId: item.id,
    interactionType,
    learningObjective: trackId === "algorithms"
      ? {
          kind: "primary_skill_atom",
          id: item.taxonomy?.primarySkillAtomId,
          primaryMentalUnitId: batch.taxonomy?.primaryMentalUnitId,
        }
      : {
          kind: "certification_domain_and_tags",
          domain: item.domain,
          tags: [...(item.tags ?? [])].sort(),
        },
    reason: {
      wordCount: wordCount(reason),
    },
    details: {
      wordCount: wordCount(detailsText),
      blockCount: blocks.length,
      formats,
    },
    wrongOptionExplanations: wrongExplanations,
    riskSignals,
  };
}

function collectRiskSignals({
  blocks,
  detailsText,
  interactionType,
  reason,
  trackId,
  wrongExplanations,
}) {
  const signals = [];
  const normalizedReason = normalize(reason);
  const normalizedDetails = normalize(detailsText);
  const detailsWordCount = wordCount(detailsText);

  if (blocks.length === 1 && blocks[0]?.type === "paragraph") {
    signals.push(signal(
      "paragraph_only_details",
      "Details uses one paragraph; verify that this is the lowest-cognitive-load form for the mechanism.",
    ));
  }
  if (normalizedReason.length >= 20 && normalizedDetails.includes(normalizedReason)) {
    signals.push(signal(
      "reason_repeated_verbatim",
      "Details contains Reason verbatim; verify that it adds mechanism, application and transfer rather than repetition.",
    ));
  }
  const shortThreshold = trackId === "algorithms" ? 45 : 30;
  if (detailsWordCount < shortThreshold) {
    signals.push(signal(
      "short_details_review_priority",
      `Details contains ${detailsWordCount} words; inspect completeness rather than applying a word-count verdict.`,
    ));
  }
  const shallowWrongOptionIds = wrongExplanations
    .filter((explanation) => explanation.wordCount < 8)
    .map((explanation) => explanation.optionId);
  if (shallowWrongOptionIds.length > 0) {
    signals.push(signal(
      "short_wrong_option_explanation",
      `Wrong-option explanations below 8 words: ${shallowWrongOptionIds.join(", ")}.`,
    ));
  }
  if (
    interactionType === "ordering"
    && !blocks.some((block) => block.type === "ordered_list" || block.type === "code")
  ) {
    signals.push(signal(
      "ordering_without_sequence_format",
      "Ordering feedback has no ordered list or code trace; verify that operation order and invariant remain reconstructable.",
    ));
  }
  if (
    interactionType === "complexity"
    && !hasComplexityDerivationSignal(detailsText)
  ) {
    signals.push(signal(
      "complexity_without_derivation_signal",
      "Complexity feedback lacks an observable counting, aggregate, recurrence or bound signal; inspect the derivation.",
    ));
  }
  return signals.sort((left, right) => left.code.localeCompare(right.code));
}

function hasComplexityDerivationSignal(value) {
  return /\b(total|sum|each|per|times|operations?|visits?|levels?|depth|recurrence|dominant|amortized|expected|worst[- ]case|space|allocat|store[ds]?|bounded? by)\b|[ΣΘΩ]|(?:<|>|=)\s*\d|O\([^)]+\).*(?:because|since|across|over)/iu.test(value);
}

function feedbackBlockText(block) {
  if (block.type === "bullet_list" || block.type === "ordered_list") {
    return (block.items ?? []).join("\n");
  }
  if (block.type === "code") return block.code ?? "";
  if (block.type === "image") return block.alt ?? "";
  if (block.type === "callout") return [block.title, block.text].filter(Boolean).join("\n");
  return block.text ?? "";
}

async function discoverJsonFiles(directory) {
  const discovered = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) discovered.push(...await discoverJsonFiles(path));
    else if (entry.isFile() && entry.name.endsWith(".json")) discovered.push(path);
  }
  return discovered.sort();
}

function assertTrackId(trackId) {
  if (!Object.hasOwn(TRACK_SOURCE_DIRECTORIES, trackId)) {
    throw new Error(`Unsupported explanation-audit track: ${trackId}.`);
  }
  return trackId;
}

function assertUniqueItemIdentity(items) {
  const identities = new Set();
  for (const item of items) {
    const identity = `${item.trackId}:${item.itemId}`;
    if (identities.has(identity)) {
      throw new Error(`Duplicate explanation-audit item identity: ${identity}.`);
    }
    identities.add(identity);
  }
}

function normalize(value) {
  return value.toLocaleLowerCase("en-US").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function wordCount(value) {
  return value.match(WORD_PATTERN)?.length ?? 0;
}

function signal(code, evidence) {
  return { code, evidence };
}

function sortedRecord(value) {
  return Object.fromEntries(
    Object.entries(value).sort(([left], [right]) => left.localeCompare(right)),
  );
}
