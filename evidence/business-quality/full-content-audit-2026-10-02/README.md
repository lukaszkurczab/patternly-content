# Reusable inputs of the unfinished item-by-item audit

This directory is retained because the audit is unfinished. It is not a completed report or current quality approval. The only work queue is the application’s `docs/PATTERNLY-WORKING-PLAN.md`; detailed scope is `docs/specs/engineering/content-audit.md`.

The immutable manifest/inventory, rubric, individual `reviews/*.jsonl` and invalidation records preserve source-bound judgments and all pending identities. On recovery, `verify.mjs` found **4236 / 16077** valid individual records, zero structural validation errors; the older generated summary’s 3703 count was stale. Verification is structural and does not establish semantic correctness.

`node verify.mjs` regenerates the ignored ledger/summary. `--require-complete` must exit 2 while coverage differs. Never change the original pins into current-source claims or turn PENDING into PASS mechanically. Invalidation records continue to exclude the 90 incorrect original OOD rows.

`aggregate.mjs <temporary-plan-copy.md>` regenerates baseline tasks and modifies only the supplied plan copy. Its baseline output includes subsequently resolved OOD/Claude/scoring findings; do not append it directly to the current master plan. Current reconciled tasks belong to the linked FCA specs.

From content repository root, `node scripts/content-audit/reconcile.mjs <output.json>` validates this seed and generates every current item’s exact-source match/pending disposition through the existing inventory. Its match is reusable source evidence, not current fact/scoring approval. The committed `current-source-binding.json` records the cleanup comparison; rerun after substantive source changes. Newer accepted reviews need their own exact item/rubric reconciliation; no batch PASS is inferred.
