import assert from "node:assert/strict";
import test from "node:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { auditExplanationQuality } from "../scripts/audit/explanationQualityAudit.mjs";

async function createAuditRoot() {
  const root = await mkdtemp(join(tmpdir(), "patternly-explanation-audit-"));
  await mkdir(join(root, "manual/source/coding-interview-dsa-problem-solving"), { recursive: true });
  return root;
}

test("explanation audit includes every item exactly once and keeps signals advisory", async () => {
  const root = await createAuditRoot();
  try {
    await writeFile(join(root, "manual/source/coding-interview-dsa-problem-solving/example.json"), JSON.stringify({
      batchId: "algorithm-batch",
      familyId: "coding_interview",
      taxonomy: { primaryMentalUnitId: "array_invariant" },
      items: [
        {
          id: "alg-1",
          interaction: { type: "choice" },
          taxonomy: { primarySkillAtomId: "choose_state" },
          feedback: {
            reason: "The invariant determines the state.",
            details: {
              blocks: [
                {
                  type: "paragraph",
                  text: "The invariant determines the state. Track the number of processed values so the next transition preserves the required count.",
                },
              ],
            },
            wrongOptionExplanationsByOptionId: {
              wrong: "Too broad.",
            },
          },
        },
      ],
    }));
    const result = await auditExplanationQuality({ root });

    assert.equal(result.schemaVersion, "patternly-explanation-quality-audit-v1");
    assert.equal(result.scope.itemCount, 1);
    assert.deepEqual(result.items.map((item) => item.itemId), ["alg-1"]);
    assert.match(result.interpretation, /do not approve or reject/i);
    assert.deepEqual(
      result.items[0].riskSignals.map((signal) => signal.code),
      [
        "paragraph_only_details",
        "reason_repeated_verbatim",
        "short_details_review_priority",
        "short_wrong_option_explanation",
      ],
    );
  } finally {
    await rm(root, { recursive: true });
  }
});

test("explanation audit detects duplicate item identities instead of merging them", async () => {
  const root = await createAuditRoot();
  try {
    const batch = {
      familyId: "coding_interview",
      taxonomy: { primaryMentalUnitId: "unit" },
      items: [{
        id: "duplicate",
        interaction: { type: "choice" },
        taxonomy: { primarySkillAtomId: "skill" },
        feedback: {
          reason: "A reason.",
          details: { blocks: [{ type: "paragraph", text: "A complete explanation for this test item." }] },
        },
      }],
    };
    await writeFile(join(root, "manual/source/coding-interview-dsa-problem-solving/one.json"), JSON.stringify({ ...batch, batchId: "one" }));
    await writeFile(join(root, "manual/source/coding-interview-dsa-problem-solving/two.json"), JSON.stringify({ ...batch, batchId: "two" }));

    await assert.rejects(
      () => auditExplanationQuality({ root, trackId: "coding-interview-dsa-problem-solving" }),
      /Duplicate explanation-audit item identity/,
    );
  } finally {
    await rm(root, { recursive: true });
  }
});

test("complexity and ordering signals inspect reasoning form without rejecting content", async () => {
  const root = await createAuditRoot();
  try {
    await writeFile(join(root, "manual/source/coding-interview-dsa-problem-solving/forms.json"), JSON.stringify({
      batchId: "forms",
      familyId: "coding_interview",
      taxonomy: { primaryMentalUnitId: "forms" },
      items: [
        {
          id: "ordering",
          interaction: { type: "ordering" },
          taxonomy: { primarySkillAtomId: "order" },
          feedback: {
            reason: "Order matters.",
            details: { blocks: [{ type: "paragraph", text: "Perform the operations in their required order while preserving the invariant." }] },
          },
        },
        {
          id: "complexity",
          interaction: { type: "complexity" },
          taxonomy: { primarySkillAtomId: "derive" },
          feedback: {
            reason: "The loop is linear.",
            details: { blocks: [{ type: "paragraph", text: "The answer is O(n)." }] },
          },
        },
      ],
    }));

    const result = await auditExplanationQuality({ root, trackId: "coding-interview-dsa-problem-solving" });
    assert.ok(result.items.find((item) => item.itemId === "ordering").riskSignals.some((signal) => signal.code === "ordering_without_sequence_format"));
    assert.ok(result.items.find((item) => item.itemId === "complexity").riskSignals.some((signal) => signal.code === "complexity_without_derivation_signal"));
  } finally {
    await rm(root, { recursive: true });
  }
});
