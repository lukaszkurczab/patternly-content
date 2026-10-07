# Coverage adequacy findings — prospective 845-item snapshot

**Verdict: PASS WITH ISSUES for practical coverage across the current 38-unit scope.** The prospective snapshot has 845 distinct question IDs across all 38 existing mental-model units, which meets the requested scale. The differing unit counts are supportable by their actual decision families and boundaries; this review finds no reason to impose a fixed per-unit count or to expand the bank beyond 845 merely to reach a round number. The question objects offer repeated practice on meaningful variations, including conditions that change the best action. The detailed unit-by-unit evidence and demand rationale are in [coverage-matrix.md](coverage-matrix.md).

This is a prospective coverage judgment, not approval of the candidate questions or release readiness. Candidate C and B items still require genuine independent whole-item review. I did not establish official Claude Certified Architect Professional blueprint alignment, long-term retention, or empirical learning effectiveness: the evidence here is the current `units.json`, current curriculum plans, and all 845 question objects. A manifest hash match establishes snapshot integrity only.

## Coverage evidence

- All 38 current unit objectives have substantive question families with multiple exact supporting IDs in the matrix. Counts vary from 13 to 33 based on objective scope and decision consequences. The matrix describes counterfactuals, novice error patterns, and representation variation rather than treating counts as a proxy for quality.
- The narrower D03-O08 (13 items) still practices both eager and deferred loading decisions, with the choice changing based on stable-core size, evidence headroom, reuse, and discovery latency. D04-O04 (13 items) spans missing retrieval evidence, unsupported generation, input normalization, schema/tool mismatch, cache freshness, and prompt/model interaction. Their lower counts do not reveal an uncovered central family.
- Repetition is often useful: D04-O05 has a cache economics pair with opposite outcomes; D02-O01 varies model choice when quality floors and cost constraints change; D05-O01 distinguishes a valid check on an unchanged action from an invalidated check after edits; D01-O02 distinguishes a provable pre-dispatch rejection from an unknown dispatched side effect. These support transfer across states rather than one-off trivia.
- Cross-unit similarities generally preserve the objective distinction: problem framing versus value thresholds; prompt trust boundaries versus execution containment; tool protocol choice versus progressive context loading; instrumentation versus telemetry interpretation. The matrix identifies where ownership should remain explicit to avoid counting shared examples as exclusive evidence.

## Issues to resolve during item curation

- D03-O08 scenario-01 and scenario-02 retain the same 20-page core / 8,000-page jurisdiction-addenda design and the same progressive-loading answer; mainly the frequency changes. This is the clearest low-marginal-value near-repeat. The unit has other useful eager/deferred counterfactuals, so a per-item decision to revise or remove one is a refinement, not a coverage blocker.
- Answer position is mixed across the full 781 single-choice items (positions 1–4: 206, 219, 187, 169), but local clusters merit review. D03-O08 has 6 of 12 keys in position 1 and none in position 3; D07-O02 has 17 of 24 in the first two positions; D04-O03 has one of 20 in position 1. Keyed-option length also varies globally, while some units favor the longest option more often. These are qualitative cue risks to inspect when items are individually accepted, not numeric gates or a request to shuffle blindly.
- D05-O04 has a substantial cluster around current Anthropic compliance/API mechanisms. That is a coherent high-consequence family, but its factual and source currency needs item-level scrutiny; the coverage review cannot establish current accuracy for those claims. D07 provider/tooling details also have normal version drift risk.

I found no repeated universal “stop” or “safe gate” answer rule across the bank: several units include positive counterfactuals where evidence clears the threshold or the operation can safely proceed. Continue to vary evidence, action stage, and outcomes naturally. Do not add a numeric option-position or option-length quota.

## Assessment

The practical bank-adequacy objective is met under the existing 38-objective scope, **conditioned on actual C/B per-item acceptance**. The 845 snapshot already provides sufficient breadth and repeated practice for this coverage judgment. I do not recommend a mandatory additional practice package based on these findings. If the D03-O08 pair survives item review unchanged, the smallest coherent cleanup is to revise or remove one of those two while preserving the unit’s eager/deferred practice balance.

No release, runtime, retention, or official certification-alignment approval is implied.

## Approach fit scores

- Objective / architecture fit: **0.93** — coverage follows the existing 38 mental-model objectives and sizes practice by consequential decisions.
- Simplicity: **0.88** — a unit/family evidence matrix avoids a new per-unit quota or other unsupported gate.
- Risk: **0.82** — coverage is strong, but item correctness remains pending and local cue clusters plus volatile facts need curation.
- Maintainability: **0.85** — objective/family-level coverage can be updated as practice changes; volatile API and compliance details need ongoing source review.
