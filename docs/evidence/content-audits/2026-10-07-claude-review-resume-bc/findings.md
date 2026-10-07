# Independent semantic review — B/C expansion v2

Reviewed 185/185 whole objects from `questions.json` against `manifest.json`; every recursively sorted canonical SHA-256 matched the frozen manifest. All item IDs and source refs resolved; each record was checked in all 13 dimensions, with every single-select wrong option and its matching explanation read individually. Compared nearest same-unit peers in the candidate and current canonical bank.

## Result

- 184 PASS; 1 FIX_MAJOR; 0 FIX_MINOR, REMOVE, or BLOCKED_FACT_CHECK.
- This is an authoring-quality review of the frozen batch; it does not certify final bank sufficiency, exam blueprint coverage, human editorial approval, app import, activation, or publication.
- The items are all single-select. This tranche adds practice through concrete changes in evidence, authority, workload, retry state, and operational consequence; repeated use of a rule is not itself duplication.

## Blocking correction

- `CCARP-D05-O04-expansion-25`: change the product/path premise. It describes “API conversation” content and a surviving Compliance Activity Feed event for the same record. Current official documentation excludes Claude API prompt/response content (including API-key workloads) from the Compliance API; the learner cannot reconcile an impossible source join. Use a Claude Enterprise chat/session record if that is intended, or remove the Activity Feed join and define the API retention evidence path. Re-review the changed hash. Evidence: [current Compliance integration documentation](https://platform.claude.com/docs/en/manage-claude/compliance-integration-patterns), checked 2026-10-07, sections “Plan content retention” and “The Compliance API does not include” (lines 148–189, especially 176–178).

## Review scope and limitations

The content registry pins source references checked 2026-09-03; current first-party pages were re-opened today for Compliance API/data-retention, API errors/rate limits, Claude Code settings, streaming, agent patterns, contextual retrieval, advanced tool use, prompt caching, usage-cost API, tool use, evaluation guidance, trustworthiness/fairness, and OWASP authorization. The factual record-type conflict above is the one material contradiction found in the reviewed 185. The provided fictional thresholds, service policies, business authorities and case measurements were treated as question premises, not as vendor promises.

Semantic-neighbor comparison was by same objective, then exact item-level reading of nearest prompts; no source-text or exam-guide content was reproduced. The package has not been executed through the candidate builder, full canonical validation, duplicate audit, scoring regression tests, or app import as part of this review.

## Comparison with authoring reports and actual frozen items

The private B and C ledgers describe the additions as gap-led practice rather than equal per-unit quotas. I checked the promised conditions against the serialized prompts and keyed choices: for example, B's evaluation cases distinguish regression fixtures from an unseen holdout, mature from censored safety outcomes, and assignment from received-treatment analysis; its cache cases include actual write/read totals and per-route latency. C's cases distinguish user delegation from service authority, hard deletion from surviving metadata/derived stores, and trust/config loading from effective permissions. Those distinctions are present in the frozen objects.

The C whole-object report disclosed 23 earlier option-target mapping defects. I independently checked all 185 current wrong-option IDs against the actual option text and feedback; no remaining ID-to-option mismatch was found. This confirms the revised snapshot's mapping only, not the accuracy of every broad source premise; the API/Activity Feed contradiction above remains a substantive defect.
