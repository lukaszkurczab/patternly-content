# Independent acceptance review: frozen 72-item Claude tranche

**Outcome: not acceptable as a clean 72-item admission.** I independently solved the sanitized input and saved [independent-solutions.json](./independent-solutions.json) before opening the authored questions. I then read all 72 full records, including every option, stored answer, reason, all feedback details and wrong-option messages, and source references. The review JSONL contains one complete 13-dimension record for each exact frozen item.

The item verdicts are 57 PASS, 2 FIX_MINOR, 10 FIX_MAJOR, and 3 REMOVE. Eleven keyed answers do not answer their stems. Three additional candidates repeat active canonical cases without adding a distinct condition; one also has an answer-key defect. These are item-level review findings only; this does not grant human editorial, runtime, activation, publication, exam-weight, or release approval.

## Material item findings

| Item | Verdict | Evidence |
|---|---|---|
| `CCARP-D03-O04-depth-21` | FIX_MAJOR | The stem says attempt one committed and the retry was denied as duplicate. The key asks for latency-distribution instrumentation, which cannot determine the logical action’s committed outcome. No offered option does. The source ref is also broad agent-design guidance; add the registry’s AWS idempotent-API mechanism source. |
| `CCARP-D03-O04-depth-23` | FIX_MAJOR | Causal links and clock metadata do not identify which prompt and retriever versions produced the regression. No option records component versions with outcomes. |
| `CCARP-D03-O05-depth-59` | REMOVE | The key concerns tenant-manifest activation, while the stem asks to retrieve page-3 eligibility with the page-4 exception. No option answers it. It also repeats the active deletion/build-race case `CCARP-D03-O05-expansion-11` and the served-index verification case `CCARP-D03-O05-expansion-13`. |
| `CCARP-D03-O05-depth-60` | FIX_MAJOR | The prompt calls for product/version scope and selective expansion from a flat namespace; the key concerns generated summaries. No option answers the retrieval-design question. |
| `CCARP-D03-O05-depth-61` | FIX_MAJOR | Global source revision is current but tenant manifests differ; the key tests warning/workflow retrieval. No option diagnoses tenant activation state. |
| `CCARP-D03-O07-depth-14` | REMOVE | This repeats active `CCARP-D03-O07-variant-mcp-discovery-isolation`: tenant A sees tenant B’s tool/resource metadata while execution is denied, and the same tenant-filtered discovery answer is keyed. |
| `CCARP-D03-O07-depth-62` | FIX_MINOR | In the pinned 2025-06-18 MCP spec, `tools.listChanged` indicates that the server will send `notifications/tools/list_changed`; clients then refresh `tools/list`. “Renegotiate capabilities” is not the specified dynamic list-update mechanism, and the answer omits the missing server notification. |
| `CCARP-D03-O07-depth-63` | FIX_MINOR | The server-side authorization answer is sound, but the item’s source reference is the MCP basic overview. The mechanism-specific resource URI and authorization text is on the pinned [`server/resources` specification](https://modelcontextprotocol.io/specification/2025-06-18/server/resources). |
| `CCARP-D04-O05-depth-43` | REMOVE | This repeats active `CCARP-D04-O05-expansion-22`: five-field extraction, output growth, worse p95 with no completeness gain, and the same constrained-output remedy. The changed wording and values do not add a distinct evidence condition. |
| `CCARP-D04-O06-depth-37` | FIX_MAJOR | The stem asks for freshness and coverage of delayed quality labels beside current delivery metrics. The key is about provider-total grain and retry counts. No option answers the prompt. |
| `CCARP-D04-O06-depth-39` | FIX_MAJOR | The stem asks how to retain a spend guardrail after expected traffic doubles. The key is about delayed quality cohorts; it does not normalize spend or establish a workload baseline. |
| `CCARP-D04-O06-depth-40` | FIX_MAJOR | One-day usage and seven-day outcomes cannot form a valid cost-per-case ratio. The key addresses source grain, not mismatched time windows. |
| `CCARP-D04-O06-depth-56` | FIX_MAJOR | The provider returned HTTP 200 but application parsing failed. The key discusses usage-window deduplication instead of separating transport, stream completion, parsing, and application completion. |
| `CCARP-D04-O06-depth-67` | FIX_MAJOR | Overlapping usage windows are being double-counted. The key discusses normalized spend and does not deduplicate or replace overlap. |
| `CCARP-D04-O06-depth-68` | FIX_MAJOR | The cache changes provider-call and end-to-end request populations. Cohort alignment alone does not say which usage and outcome metrics to report or account for cache costs. No option answers the requested efficiency metric. |

The remaining no-answer defects are `CCARP-D03-O04-depth-21`, `CCARP-D03-O04-depth-23`, `CCARP-D03-O05-depth-59`, `CCARP-D03-O05-depth-60`, `CCARP-D03-O05-depth-61`, `CCARP-D04-O06-depth-37`, `CCARP-D04-O06-depth-39`, `CCARP-D04-O06-depth-40`, `CCARP-D04-O06-depth-56`, `CCARP-D04-O06-depth-67`, and `CCARP-D04-O06-depth-68` (11 total). Each full record separately explains the keyed mismatch and preserves the stem’s intended principle in its review evidence.

## Scope, practice depth, and source checks

The latest validated active track has 773 questions (the shared repository changed during this review; the final verifier snapshot below is the authoritative count for this handoff). Its current canonical per-unit counts and the frozen draft additions are:

| Unit | Active | Frozen draft | Candidate total |
|---|---:|---:|---:|
| CCARP-D03-O03 | 16 | 7 | 23 |
| CCARP-D03-O04 | 13 | 12 | 25 |
| CCARP-D03-O05 | 12 | 14 | 26 |
| CCARP-D03-O07 | 12 | 12 | 24 |
| CCARP-D04-O05 | 18 | 13 | 31 |
| CCARP-D04-O06 | 12 | 14 | 26 |

The counts vary with the objective and practice needs, as requested; no per-unit quota is implied. At the latest full-track count, 773 + 72 would be 845; excluding the three REMOVE items leaves 842 only if all remaining candidates are later corrected/admitted. The 10 FIX_MAJOR and 2 FIX_MINOR decisions prevent treating that projected count as achieved. Similar decision families are acceptable where evidence or workflow changes. I compared each candidate against the complete active per-unit file, not the older generated learner snapshot. The three removals above are exact or near-exact repeats. Other close comparisons add a changed evidence premise or a new calculation; for example, the cost-per-resolution item `CCARP-D04-O05-depth-41` supplies retry expense and an 84% post-retry outcome. Its independent arithmetic is $0.12 + (40% × $0.10) = $0.16 per submitted case; $0.16 / 84% = $0.1905 per resolution, versus $0.19 / 90% = $0.2111 for the second route.

All 72 source IDs resolve in the track registry. Scenario amounts, latency limits, deadlines, tenant grants, and service contracts are treated as fictional premises, not provider guarantees. Current official mechanisms were checked on 2026-10-07, including Anthropic’s [rate-limit and `retry-after` behavior](https://platform.claude.com/docs/en/api/rate-limits), [stream terminal events](https://platform.claude.com/docs/en/build-with-claude/streaming), [evaluation criteria](https://platform.claude.com/docs/en/test-and-evaluate/develop-tests), [usage aggregation dimensions](https://platform.claude.com/docs/en/manage-claude/usage-cost-api), [cost/quality trade-offs](https://platform.claude.com/docs/en/about-claude/models/optimizing-for-cost-and-intelligence), [prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching), [contextual retrieval](https://www.anthropic.com/engineering/contextual-retrieval), the pinned [MCP tools](https://modelcontextprotocol.io/specification/2025-06-18/server/tools) and [resources](https://modelcontextprotocol.io/specification/2025-06-18/server/resources) sections, [OWASP tenant-context guidance](https://cheatsheetseries.owasp.org/cheatsheets/Multi_Tenant_Security_Cheat_Sheet.html), and the [AWS idempotent API retry mechanism](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/). The item source-reference gaps are called out above; current source checks do not turn the scenario premises into provider guarantees.

No factual exam-weight or exam-blueprint claims are made. This review does not evaluate human approval or shipped-runtime behavior.

## Answer-option cues and contract integrity

The 72 single-choice keys occupy array positions 1/2/3/4 at 17/17/15/23. That is not an always-middle pattern, though position 4 is somewhat more common. Keyed options have a median of 80 characters and 11 words; distractors have a median of 77.5 characters and 12 words. Keyed choices are the longest option in 28 items and the shortest in 16. Length is not a useful deterministic cue, but the slight fourth-position skew merits review if the cohort grows.

Every item has four distinct option IDs, exactly one stored key, and three wrong-option messages whose target IDs cover the three non-key choices once each. The pinned runtime maps `choice_single` to one exact accepted option ID and zero for other selections. The independent record explicitly treats missing telemetry as unknown, not zero (notably the stale-exporter cases); no `unknown` state is inferred as numeric zero or Boolean false.

## Hashes and verifier result

The frozen manifest has 72 entries. I recomputed each complete item’s SHA-256 with the repository’s `canonicalJson` and all 72 hashes match exactly. `review.jsonl` contains 72 records with the rubric’s 13 dimensions, record fields, distinct wrong-option evidence, current source checks, peer IDs, and reviewer method.

I passed both the existing `2026-10-07-claude-current-review.jsonl` and this tranche to `verify-claude-maintenance-review.mjs`. The verifier parsed the new records and validated the active 773-item track. It reported one pre-existing item, `CCARP-D03-O07-expansion-1`, as `MISSING_OR_NONPASS_REVIEW` because its current evidence contains both PASS and FIX_MINOR verdicts. The frozen 72 are not yet in the active canonical item set, so this repository verifier cannot accept their new item hashes until they are incorporated into that set; their hashes and record shape were checked independently here. This run does not establish full-track review completeness.
