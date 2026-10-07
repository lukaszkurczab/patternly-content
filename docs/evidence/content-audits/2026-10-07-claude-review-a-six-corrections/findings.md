# Independent acceptance review: six corrections

**Verdict: FIX WITH GAPS.** I reviewed the six frozen complete objects at exact SHA-256 against their manifest, all 13 semantic dimensions, each wrong-option explanation, primary-source fit, visible answer positions, and nearest canonical same-unit practice. Five items pass; `CCARP-D02-O04-practice-b02-029` has a minor practice-depth finding because its decision/remediation nearly duplicates two canonical items. This review does not approve runtime admission, activation, human editorial approval, or release.

**Method:** The frozen object includes answer keys, and my initial extraction exposed them. I independently reasoned through each prompt and all choices from the visible stem facts, wrote down the controlling fact and strongest competitor, and then compared that conclusion with the stored key. This was not blind testing. Per-item reasoning and exact hashes are in `review.jsonl`.

## Results

- **PASS (5):** `CCARP-D02-O04-practice-b02-025`, `CCARP-D02-O04-practice-b02-027`, `CCARP-D01-O01-practice-002`, `CCARP-D01-O02-practice-004`, and `CCARP-D02-O04-practice-019`.
- **FIX_MINOR (1):** `CCARP-D02-O04-practice-b02-029`.
- All six hashes match `manifest.json`; every question retains a valid single-choice `a`–`d` scoring contract. Each wrong option has item-specific reasoning, not just a field-presence check.

The accepted-only pilot correction in `practice-002` now asks for representative end-to-end labor including rejection and repair against a comparable baseline. Its key follows because the accepted-only sample omits costs that may erase or reverse savings; merely enlarging that same selected sample would not fix the denominator. The day-0 decision in `practice-004` falls within P4’s first 12 days, so P4 is knowable; the later-arriving label and R8 adjudication should be preserved separately. The three source-reference corrections in `b02-025`, `b02-027`, and `practice-019` support their context/state decisions at the general principle level; application-specific IDs, ownership, and policy fields are stipulated workflow facts, not claims prescribed by Anthropic. `b02-029` now points to Anthropic’s prompt-injection guidance, which fits the retrieved untrusted-instruction scenario.

## Practice-depth finding

`CCARP-D02-O04-practice-b02-029` is factually sound and its answer is uniquely best. However, canonical `CCARP-D02-O04-expansion-09` and `...-expansion-12` already present a signed, relevant rule against a long unrelated prompt injection and teach preserving authority/provenance while excluding or marking the injection untrusted. This item changes the symptom to a generated summary repeating the injection, but keeps essentially the same corrective decision. Treating it as useful spaced repetition is reasonable; for a bank intended to reach demand-based depth, that alone supplies limited new practice value. I marked only `duplicate_quality` FIX_MINOR. A later variant should test a distinct operational response, such as diagnosing the retrieval/summary boundary or verifying the mitigation, rather than rephrasing the same authority choice.

The other five comparisons add a relevant decision boundary: `b02-025` combines confirmed/pending/unknown operation states, request identity, and a policy conflict; `b02-027` combines a tenant move with signed effective dates and a stale approval; `practice-002` isolates accepted-only selection plus omitted repair costs; `practice-004` makes decision-time P4 determinable while retaining later R8 separately; `practice-019` makes explicit status/ownership the observed failure even though a 40-turn summary fits. `practice-019` remains close to canonical `expansion-10/15`, so this is reinforcing practice rather than a novel mechanism, but its explicit status/ownership failure gives it a distinct target.

Answer-position and length observations are descriptive only. Actual visible key positions for these six are 2, 4, 1, 1, 4, and 2 respectively. Character-length distributions per item are recorded in `review.jsonl`; they show some keyed options are longest, others are not. There is no always-middle replacement pattern and I set no numeric length quota.

## Broader canonical-peer coverage limitation

This review compared each of the six with its nearest canonical neighbors. It did **not** manually compare all 55 frozen tranche questions against the full existing canonical bank. The prior 55-item report’s `duplicatePeers` are mostly other items in that same tranche. For example, the earlier `b02-029` peer list omitted canonical `expansion-09/12`, the closest pair for the current correction; `b02-027` omitted canonical `expansion-08/13`. Thus the earlier report’s same-tranche peer checks cannot establish complete canonical-neighbor coverage. This is a limitation in the earlier 55-item acceptance evidence, not a claim that all 55 are duplicates or defective. A bank-level depth decision should use a broader canonical-neighbor review before calling coverage complete.

## Versioning and scope

The reviewed objects identify `ccarp-2026.09.03`, while changed content is represented by these object hashes. The app’s resolved-content reference binds track, question, content version, and artifact SHA; when these corrected objects are assembled into a deliverable artifact, ensure its version/hash identity reflects the changes rather than treating the old artifact identity as unchanged. This is a version-integrity note, not a schema change request.

Primary sources checked: [Anthropic context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents), [Anthropic prompt-injection guidance](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks), and [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents). These support general context, safety, and evaluation principles; fictional values and application workflow contracts remain facts given by the questions.
