# Independent review: 15 Claude Professional repairs and replacements

I read the sanitized `solve-input.json` and independently recorded a selected option, controlling fact, and nearest credible competitor with its failure reason for every item in `independent-solutions.json` before opening answer keys. Then I reviewed each complete question, all options, key, reason, every details field, all three wrong-option messages, source reference, exact manifest hash, and the closest active canonical peers in the five affected units.

## Outcome

Fourteen items have a technically correct, independently confirmed answer but need a minor option-quality repair. In 14 of 15 questions the keyed choice is the longest, and it is also much more fully developed than the distractors. This creates a batch-level testwise length/completeness cue, while many alternatives are easy to dismiss before applying the intended professional judgment. The finding is not a fixed-length requirement: revise each affected item naturally by tightening its key or making a credible competing choice more developed. One item has balanced choice lengths and passes.

| Item | Verdict | Weakest choice and item-specific repair |
|---|---|---|
| `CCARP-D03-O04-depth-21` | FIX_MINOR | Key 275 chars vs longest distractor 147. Strengthen `opt_305c961f4611` into a plausible “leave pending until status lookup” recovery that still mishandles the confirmed commit/operation state. |
| `CCARP-D03-O04-depth-23` | FIX_MINOR | Key 178 vs 142. Strengthen `opt_98ee042727aa` with a credible but insufficient versioned comparison, such as mismatched cohorts or joint rollback, so the same-cohort requirement is tested. |
| `CCARP-D03-O05-depth-60` | FIX_MINOR | Key 221 vs 144. Strengthen `opt_756947dd7bbb` as a plausible product/version prefilter that retrieves all sections without conditional procedure expansion. |
| `CCARP-D03-O05-depth-61` | FIX_MINOR | Key 187 vs 132. Make `opt_0d496e3aebcf` a credible global rebuild that still fails to verify the affected tenant’s active manifest and served generation. |
| `CCARP-D03-O07-depth-62` | FIX_MINOR | Key 199 vs 165. `opt_67b7d8953e81` could be a closer polling/reconnect approach that fails to verify the declared list-change notification. |
| `CCARP-D03-O07-depth-63` | PASS | Key 156 chars vs 160 for the longest distractor; options are not cued by length. The server-side URI/workspace authorization decision is sound. |
| `CCARP-D04-O06-depth-37` | FIX_MINOR | Key 259 vs 157. Strengthen `opt_246c392bcae0` with a tempting blended KPI or lag threshold that still hides cohort coverage, denominator, or freshness. |
| `CCARP-D04-O06-depth-39` | FIX_MINOR | Key 183 vs 164. `opt_3280bb0fdfb6` is a simple “unit cost only” error; make it a more credible unit metric that still removes the absolute total-spend guard. |
| `CCARP-D04-O06-depth-40` | FIX_MINOR | Key 290 vs 151. Strengthen `opt_8a54b8539805` with a reasonable window alignment that still omits retry spend or unresolved cases. |
| `CCARP-D04-O06-depth-56` | FIX_MINOR | Key 270 vs 158. `opt_fb0e0691fadb` could be a near-miss that separates HTTP, stream completion, and parsing but omits app commit or attempt correlation. |
| `CCARP-D04-O06-depth-67` | FIX_MINOR | Key 199 vs 147. Strengthen `opt_f5ec4469cf59` with an almost-idempotent design that deduplicates on an unstable timestamp or replaces too broad an interval. |
| `CCARP-D04-O06-depth-68` | FIX_MINOR | Key 328 vs 167. `opt_ac70640e3a75` should correctly report provider-call tokens but incorrectly exclude cache-served outcomes from end-to-end route economics, making the population distinction the test. |
| `CCARP-D03-O05-depth-73` | FIX_MINOR | Key 240 vs 146. Strengthen `opt_f43da9110780` with an aggregate score that passes overall but still violates the warning-slice floor. Arithmetic is correct: fixed support 82.5%/93.75%; structure-aware 92.5%/92.5%; structure-aware rebuild 24 minutes, below the 30-minute cap. |
| `CCARP-D03-O07-depth-74` | FIX_MINOR | Key 236 vs 159. Strengthen `opt_e23ce2a1f92b` with a correct catalog refresh that still fails to send the content-update event to subscribed clients. |
| `CCARP-D04-O05-depth-75` | FIX_MINOR | Key 252 vs 177. Strengthen `opt_f0137fa6e7e1` as a near-miss that adds tenant context after lookup or caches tenant data without binding the cache identity to the tenant. Also name the failing key as application-managed: current Anthropic prompt caching derives identity from exact prompt content through the breakpoint and has workspace isolation; it does not use the stipulated caller-supplied policy-version-only key. |

Across all 15, keyed options occupy positions 1/2/3/4 at 5/2/3/5, so there is no always-middle or single-slot pattern. The key is longest in 14 of 15; median keyed length is 236 characters/33 words versus 142 characters/22 words for the distractors. The review did not apply a fixed word or character quota: it records actual relative choice development and item-specific weak competitors. The skew itself is material in this cohort because a learner can use completeness/length as a strategy across many independent questions.

## Technical and source checks

- Recomputed SHA-256 for every complete question using the repository’s `canonicalJson`; all 15 hashes match `manifest.json`, and every review record carries the matching item hash.
- All 15 independently selected options match their frozen keys. Every `choice_single` has one exact accepted option ID, no aliases or partial credit, and three wrong-option messages target each incorrect option exactly once.
- Checked current primary pages for AWS idempotent retries; Anthropic retrieval and evaluation guidance; Anthropic Usage and Cost API, streaming, and prompt-caching docs; and OWASP multi-tenant isolation. Candidate URLs resolve to the listed source registry entries. Numeric thresholds and outcomes in the questions are treated as fictional case premises. Current Anthropic prompt-caching docs specifically describe content-derived cache identity and workspace isolation; therefore item 75’s tenant-omitting key must be identified as an application-managed cache, not attributed to Anthropic’s native cache.
- Checked MCP at the exact dated URLs `https://modelcontextprotocol.io/specification/2025-06-18/server/tools` and `https://modelcontextprotocol.io/specification/2025-06-18/server/resources`. Items 62 and 74 explicitly cover that pinned historical profile: tools-list change notification versus subscribed-resource content update. They do not claim unqualified current MCP behavior. For item 63, protocol read-by-URI is distinct from the application’s workspace authorization boundary.
- Inspected actual active peers across O04, O05, O07, D04-O05, and D04-O06. The repaired stems vary event sequence, query scope, tenant activation, protocol event, label freshness, report grain, and cache scope. Replacement depths 73–75 add held-out retrieval slice arithmetic, resource subscription updates, and tenant-scoped prompt-cache isolation with different evidence and decision conditions.

Full 13-dimension evidence and per-option causal reasoning are in `review.jsonl`. These findings concern item content only; they grant no human editorial approval, runtime acceptance, activation, exam weighting, publication, or release authority.
