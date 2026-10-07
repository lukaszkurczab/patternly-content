# Accepted 845-item coverage binding

**Verdict: PASS.** The demand-based coverage conclusion holds for the accepted canonical 845-object bank. It still represents all 38 current mental-model objectives, with counts from 13 to 33 based on the range of consequential decision families and evidence variations—not a per-unit quota. The replacements preserve coverage breadth and strengthen three decision families; the accepted options remove the previously reported key-length cue. This is a final content-coverage binding, not release or exam-blueprint approval.

## Exact accepted snapshot

Frozen inputs: `/private/tmp/patternly-claude-expansion-20261007/coverage-accepted-845/questions.json` and `manifest.json`.

- The snapshot has 845 complete objects and 845 unique IDs, matching the current canonical content source exactly: 845/845 object equality, no missing IDs, no extra IDs, and no object mismatches.
- All 845 canonical object hashes match the 845 manifest rows. No manifest rows are missing or extra.
- Aggregate SHA-256 of `canonicalJson(questions sorted by questionId)`: `717b995fd9f9bda5d25161c516a248eb80b3a78cf23c69d1641c2ed95add8b9a`.
- Aggregate SHA-256 of `canonicalJson(manifest rows sorted by questionId)`: `7a5093cdd14f0c7bc664deb28dd799436cdf2ae51a244c12a63a1ee2ba7a8abc`.
- The immediately prior frozen snapshot aggregates were questions `3d8d7c45c82e1197dc821602134db6c3486fb1a503e5b05e7f0b5a6f15efb9a5` and manifest `79ba3dff910583c419edda56b51bab8eb29df99ff6b48efcf4767b4291953909`.
- Accepted versus prior frozen snapshot: same 845 IDs; 14 objects changed and none were added or removed. Fourteen option sets were revised; `CCARP-D03-O07-depth-63` remains unchanged. Thirteen changed objects retain their prompt and source references; `CCARP-D04-O05-depth-75` also has an explicit application-managed-cache prompt and source correction. The 14 changed IDs are `CCARP-D03-O04-depth-21`, `CCARP-D03-O04-depth-23`, `CCARP-D03-O05-depth-60`, `CCARP-D03-O05-depth-61`, `CCARP-D03-O05-depth-73`, `CCARP-D03-O07-depth-62`, `CCARP-D03-O07-depth-74`, `CCARP-D04-O05-depth-75`, `CCARP-D04-O06-depth-37`, `CCARP-D04-O06-depth-39`, `CCARP-D04-O06-depth-40`, `CCARP-D04-O06-depth-56`, `CCARP-D04-O06-depth-67`, and `CCARP-D04-O06-depth-68`.
- The separate exact-item review reports 845/845 evidence records, including 259 historical unchanged and 586 current reviews, with no missing item evidence; all 15 B-repair candidates pass. This binding confirms the accepted source snapshot and coverage counts.

The current `units.json`, the 38 curriculum `targetPlans`, and the objective labels in the coverage matrix align one-for-one. Each unit remains represented. Actual per-unit counts still range from 13 to 33; D03-O05 has 26, D03-O07 has 24, and D04-O05 has 31. The historical matrix's D03-O05 count of 25 and stale replacement references remain corrected in the preceding [binding addendum](../coverage-final-845/binding-review.md); those recorded corrections still apply to this snapshot.

## Coverage effects of accepted changes

- **D03-O05 / RAG chunking and indexing:** `CCARP-D03-O05-depth-73` practices a slice-qualified chunking decision with an operational rebuild cap. Fixed chunks support warning cases at 33/40 = 82.5%, below the 90% floor; structure-aware chunks support warning cases at 37/40 = 92.5% and simple lookups at 74/80 = 92.5%, with a 24-minute rebuild under the 30-minute cap. That preserves a specific RAG-design decision and useful counterfactual evidence. Its measurement language overlaps evaluation objectives, but the learner's action is selecting a retrieval representation for a pilot.
- **D03-O07 / integration protocol:** The accepted client-boundaries case practices two clients whose measured p95 constraints require different interfaces over one authoritative service: direct 12 ms fits the dashboard's 20 ms ceiling, tested MCP 45 ms does not, while 45 ms fits the MCP-only client's 200 ms ceiling. It is no longer a clone of the one-client direct-API diagnosis. `CCARP-D03-O07-depth-74` covers subscribed-resource content-update versus resource-list-change notifications under its explicitly pinned 2025-06-18 profile. Its source remains version-specific; this is not a claim about the latest MCP protocol behavior. The current 2026-07-28 MCP architecture source used by the accepted client-boundaries item remains registered and linked; refreshed source metadata does not invalidate unchanged item-object evidence.
- **D04-O05 / cost, latency, and performance:** `CCARP-D04-O05-depth-75` now explicitly concerns an **application-managed rendered-prompt cache**. It measures prompt-assembly cost and route latency, keeps a reusable common block, and scopes tenant-specific text to avoid cross-tenant replay. Its sole source reference is the registered OWASP multi-tenant security source. The case does not depend on or promise provider-native prompt-cache key behavior. It remains a cost/latency optimization under an isolation constraint, with intentional overlap to security learning; it should not be counted as exclusive tenant-authorization coverage.

Together, these changes preserve the prior four-family replacement rationale: remove the stale/near-clone examples, retain or add consequential decision practice, and keep exact objective ownership visible. The application-cache correction narrows the source claim without removing the cost-performance evidence. No central learning family is lost, no cross-unit duplicate displaces an objective, and no additional item count is needed.

The two D03-O08 near-pair cases remain nonblocking intentional practice under changed frequency evidence. Keep them as practice; they are neither a padding signal nor a reason to impose a count quota or add/remove questions for coverage alone.

## Approach-fit scores and limits

- Objective / architecture fit: **0.95** — the accepted bank maps to the current 38 objectives and represents different decision boundaries rather than equal counts.
- Simplicity: **0.91** — the accepted source and per-item evidence bind one canonical snapshot; the old matrix corrections remain in a concise addendum.
- Risk: **0.90** — exact item acceptance and option-cue review are complete, and every accepted object matches its manifest and canonical source.
- Maintainability: **0.88** — family-level rationale remains usable with corrected representative IDs, explicit source versions, and the application-managed-cache boundary.

Reviewed by `gpt-6-luna` (high). No canonical source, configuration, or tools were edited. This coverage acceptance grants no publication, retention, runtime, release, or official exam-blueprint authority.
