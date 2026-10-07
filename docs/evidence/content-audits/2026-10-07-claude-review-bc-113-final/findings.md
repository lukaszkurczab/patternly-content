# Independent acceptance findings: frozen B30

All 113 frozen objects were reviewed. Sanitized stems/options were solved before authored answers and feedback were opened; complete objects were then checked against those independent selections, each wrong-option explanation, registered refs, and the nearest same-unit canonical peers. Exact item hashes are copied from the frozen manifest. This review covers only B30 and grants no human approval, activation, publication, runtime acceptance, release readiness, or exam-blueprint authority.

## Verdicts

- PASS: 110
- FIX_MAJOR: 2
- FIX_MINOR: 1

## Findings

- **CCARP-D05-O04-expansion-35 — FIX_MAJOR.** The prompt says the key already has both `read:compliance_user_data` and `read:compliance_org_data`, but keys adding user_data again. Current Anthropic docs confirm user/group listings require user_data. That endpoint-specific documentation is not yet registered in the certification source registry. The proposed repair cannot change this key. Revise the stem to say the scope is absent, or ask about the actual endpoint/use error, then rekey.
- **CCARP-D03-O06-expansion-24 — FIX_MAJOR.** Option c searches North for the exact SKU and invokes the global fallback only if the local row is missing. The prompt says the exact North row exists, so c can return the stipulated authorized record just like a. The frozen item cites contextual retrieval guidance for tenant security, which does not substantiate query-time tenant isolation. Make c unambiguously unsafe and add the registered `ccarp-doc-owasp-multi-tenant` source. A55’s corrected version was not treated as evidence or substituted for B30.
- **CCARP-D03-O07-expansion-1 — FIX_MINOR.** This repeats canonical `CCARP-D03-O07-diagnosis`: one dashboard, one deterministic inventory lookup, a typed API, and no shared protocol need. The options differ, but the operative evidence and workflow do not. Change the scenario boundary or omit the redundant case.

## Cohort checks

All items use choice_single/exact_selected_set with four options. The blind option differed from the authored key on 11 items; after reading the full objects and checking the relevant provider facts, I resolved those differences in favor of the key except for the two item-quality defects above. The blind selections remain in `independent-solutions.json` so the disagreement trail is preserved. All active wrong options and their explanations are represented individually in `review.jsonl`.

For the 30 cue corrections, key positions distribute 29/28/28/28 across a/b/c/d, and 15 keys are strictly longest by character count. Those counts are diagnostics only; I found no universal positional or length cue, and the longest choices read as coherent controls tied to the case rather than padded answers.

The closest same-unit cohort pairs are `CCARP-D04-O06-expansion-7` / `-8` (exporter gaps hide route outcomes) and `CCARP-D04-O01-expansion-11` / `-12` (release claims omit outcomes and have incomplete high-risk labels). Each pair changes relevant observed evidence or outcome semantics enough for useful repeated decision practice. The Compliance API cases vary the workload, scope, organization type, capture gap, pagination, and rotation. No other cohort pair repeats the whole decision case.

Official Anthropic/Claude Platform sources were checked on 2026-10-07 for Compliance API key types/scopes and coverage, Claude Code settings/trust/precedence, API error/retry behavior, and prompt-injection guardrails. Internal policies, approvals, thresholds, amounts, and business impacts remain fictional premises, not provider guarantees. Tenant-security grounding was checked against the registered current OWASP source and is missing from the frozen SKU item's citations.

This independent review does not grant human editorial approval, runtime approval, release readiness, blueprint approval, or permission to activate or publish content.

The repository maintenance-review helper was run against this external candidate ledger, but it validates the checked-in 689-item catalog and does not ingest the frozen B30 question bundle; it therefore reported the catalog’s 689 existing items as missing. That output is not evidence about B30. I separately checked all 113 candidate records against the supplied manifest (113/113 hashes), all 13 dimensions, every active wrong-option ID, and required nonempty evidence (no structural mismatches).
