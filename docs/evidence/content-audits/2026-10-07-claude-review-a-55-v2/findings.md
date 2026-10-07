# Independent whole-object acceptance review: frozen 55

**Verdict: FIX WITH GAPS.** All 55 complete objects were reviewed across all 13 rubric dimensions, every wrong-option message, source references, exact object SHA-256, canonical path/unit/node, actual visible array position, and same-unit peers. The object hashes match the frozen manifest. **Method limitation:** the frozen inventory contains answer keys, and my initial extraction exposed each key alongside its prompt/options. I then re-evaluated each prompt and all options, recorded my controlling fact and nearest competitor, and compared that judgment with the key. This was not a blind review; the per-item decision evidence in `review.jsonl` documents the re-evaluation. Source version: `ccarp-2026.09.03`. This tranche review grants no activation, runtime admission, human editorial approval, or release authority.

## Outcomes

- 49 PASS.
- 4 FIX_MINOR for source alignment: `CCARP-D02-O04-practice-b02-025`, `CCARP-D02-O04-practice-b02-027`, `CCARP-D02-O04-practice-b02-029`, and `CCARP-D02-O04-practice-019`.
- 2 FIX_MAJOR: `CCARP-D01-O01-practice-002` and `CCARP-D01-O02-practice-004`.
- All records are item-specific and include exact hashes, 13 dimension assessments, and per-wrong-option evidence in `review.jsonl`. These findings supersede any earlier same-hash PASS for the two major defects.

## Major defects

1. `CCARP-D01-O01-practice-002` asks about an accepted-only summarizer pilot and omitted repair work. Its choices instead answer a different class-mix problem: keyed option a’s 6.33→8.67 values are absent from this stem and exactly derive from sibling `CCARP-D01-O01-practice-b02-002` (1,000×4 + 200×18, then 800×4 + 400×18). None of the options requests representative end-to-end evidence including rejected summaries and repair time. Replace the choices so they answer this stem, or restore the matching class-mix stem.
2. `CCARP-D01-O02-practice-004` says the decision happened on day 0 while P4 served the first 12 days, so the timeline places the decision under P4. The keyed option d says attribution is unknown, and no option identifies P4. Add the supported P4 choice or remove the timeline evidence and explain why attribution is unavailable.

## Source repairs

- `CCARP-D02-O04-practice-b02-025`, `...-027`, and `CCARP-D02-O04-practice-019` ask about resumable context state, authority/effective-date metadata, and operation ownership. Token counting does not directly support those curation claims. Cite [Anthropic’s context engineering guidance](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents). The last item already includes that source in `sourceRefs`, but its feedback URL points to token counting.
- `CCARP-D02-O04-practice-b02-029` describes untrusted retrieved instructions overriding authoritative policy. Cite [Anthropic’s prompt-injection guidance](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks), not token counting.

## Cohort cues and practice depth

Visible answer positions are `{1: 15, 2: 13, 3: 13, 4: 14}`; hidden option IDs do not determine the UI letters. By character length, keyed answers are longest in 26, shortest in 12, and between extremes in 17 items. This is mixed, with no always-longest or always-middle pattern. I assessed length descriptively and set no fixed length quota. The repeated cases vary evidence boundaries, state, or workflow dependencies, consistent with the request for more practice on recurring decisions.

## Scope limits

This is a semantic and source review of the frozen 55-item tranche, not a conclusion that the whole bank is adequate or coverage-complete. No runtime or release decision is granted. Current official Anthropic and OWASP source families were checked; scenario-specific figures and fictional application contracts are treated as facts stipulated in the stems.
