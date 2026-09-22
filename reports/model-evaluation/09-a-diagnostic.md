# EPIC-09-A — diagnostic canonical inventory

**Status:** `blocked_baseline`. This is diagnostic evidence, not a 09-A PASS or permission to start 09-B.

The read-only CLI `npm run model-evaluation:inventory` validates the nine canonical banks with the existing question contract, then writes a deterministic item-level manifest to `reports/model-evaluation/09-a-inventory.json`. It neither edits `content/` or migration evidence nor calls a model.

| Scope | SIMP-03 pinned baseline | Current canonical sources | Delta |
| --- | ---: | ---: | ---: |
| Tracks | 9 | 9 | 0 |
| Nodes | 117 | 117 | 0 |
| Mental units | 932 | 943 | +11 |
| Unique questions | 16,041 | 16,077 | +36 |

All differences are in AWS SAA: 134 → 145 mental units and 2,568 → 2,604 questions following ODK-096. The other eight banks retain their baseline counts. The current interaction distribution is 13,895 `choice_single`, 440 `choice_multiple`, 1,316 `ordering`, 279 `complexity`, and 147 `decision_matrix`.

The manifest contains every track, node, mental unit, question ID, source path, source SHA-256 and canonical item SHA-256. Its SHA-256 is `0f01ab51b3fcec0d61876e310ad6add2a9fcc5f4ae52b4c611353e7212d5ca84`. Two independent reads in the focused test produced byte-identical output. `npm run verify:migration` still fails with `EVIDENCE_VALUE` because AWS `source.artifact.contentVersion` in the historical evidence does not match the current catalog. The historical evidence remains unchanged.

**Next gate:** obtain a PO decision on the accepted baseline, then reconcile the release/migration evidence through a new candidate if approved. Re-run inventory and migration verification before granting 09-A PASS.

Pre-implementation independent briefing validator: `gpt-5.6-luna/max`, approved after scale clarification, minimum 0.88 (consistency 0.95, simplicity 0.92, risk control 0.88, maintainability 0.90).

Independent implementation QA: `gpt-5.6-luna/max`, diagnostic inventory approved with minimum 0.84 (consistency 0.96, simplicity 0.92, risk control 0.93, maintainability 0.84); 09-A PASS remains blocked. QA independently checked all source and item fingerprints, unique IDs, repeated manifest bytes and unchanged content hashes. The full content suite passed 60/60 outside the sandbox, where the local review-console server can bind to loopback. The narrower in-sandbox run had 59/60 with `listen EPERM` for that server test.

The baseline counts are intentionally pinned in this diagnostic CLI rather than importing the historical migration verifier into the future evaluator. That duplication must be reconciled with the approved candidate before 09-A can pass. Focused regression tests do not separately inject cross-bank duplicate IDs or CLI write failures; the production path rejects duplicates and reports a nonzero blocked status.
