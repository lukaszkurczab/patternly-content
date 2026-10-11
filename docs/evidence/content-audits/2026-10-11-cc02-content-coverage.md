# CC-02 Claude course coverage and validation

CC-02 adds canonical exam-practice items for the CC-01 course-map gaps and records a question-by-question map to the official course modules, numbered sections, and formal objectives. The source crosswalk is [the JSON manifest](./2026-10-11-cc02-content-coverage.json). The CC-01 map and its verifier remain a historical 845-question snapshot; they were not repinned to claim a current-bank audit.

## Scope

- Canonical bank: 845 historical items + 73 new questions = 918; six existing MCP setup/policy items have bounded source-supported updates.
- 18 unique mental-model units cover the 27 exam-scope facets from the frozen CC-01 gap inventory. The manifest distinguishes direct questions from adjacent support; the latter is not counted as direct closure.
- Four Cowork questions cover one optional course-only facet in a separate versioned supplement. It is marked `runtimeIncluded: false` and `authored_not_runtime_admitted`; the exam guide does not confirm Cowork as an exam requirement. Runtime admission would not establish exam scope.
- Three partner-only facets remain excluded from exam question authoring.
- The completion rule remains version 2. Its existing formula is unchanged; new mental units derive the following quotas:

| Node | Units before → after | Attempts before → after |
| --- | ---: | ---: |
| Solution design and architecture | 6 → 9 | 40 → 40 |
| Enterprise tools, retrieval, and integration | 8 → 10 | 40 → 40 |
| Evaluation, diagnosis, and optimization | 6 → 7 | 40 → 40 |
| Governance, safety, and risk controls | 5 → 9 | 20 → 40 |
| Stakeholder decisions and delivery lifecycle | 5 → 7 | 20 → 40 |
| Team workflows and operational enablement | 3 → 6 | 20 → 40 |

## Verification

Local source acceptance passed: canonical validation, scoring of all 918 canonical answers, the Claude build, and 43 targeted/history/shared-contract/completion-transport tests. `git diff --check` passed. Reproduce with:

```sh
node scripts/build.mjs validate --track claude-certified-architect-professional-certification
node scripts/build.mjs test --track claude-certified-architect-professional-certification
node scripts/build.mjs build --track claude-certified-architect-professional-certification
node --test tests/claude-content-audit-20261007.test.mjs tests/claude-cc02-content-coverage.test.mjs tests/shared-contract.test.mjs tests/packageCompletionTransport.test.mjs
```

Built artifact: 918 questions, content version `ccarp-2026.10.11-capacity-v1-bizq02-v2-bizq03-planning-v2-cc02-v1`, SHA-256 `a2d532d711089175b035898efd3c02df34cc17e6d502da292703b378df8ef194`.

The targeted test preserves the historical 845-question hashes by removing exactly the 73 added IDs and restoring six records from the versioned before fixture. It checks the full CC-01 gap set (27 exam, one course supplement, three partner-only), direct versus adjacent evidence, actual section/objective/source references, Details URLs, derived quotas, and the actual build exclusion of Cowork.

Review caught stale-letter answer errors during authoring. Comparing IDs or scoring the keyed answer alone had failed to establish semantic correctness. The final method stores independently selected **answer text** for all 83 new/changed/supplemental records in [a versioned oracle](../../../evidence/canonical-content-approvals/claude-cc02-blind-answer-text-v1.json); every text must identify exactly one current option and match the current key. Two independent Luna High reviewers solved the blind packet before key comparison. The second initially selected one distractor in the Skill-versus-API scenario, then resolved it against the prompt and the documented instruction-versus-execution boundary. Final comparison: 83/83 unique text matches with corresponding distractor targets. The test enforces exact coverage of these 83 records, rather than treating scorer self-consistency as semantic approval.

The source-stage contract review passed. This does not mean every historical answer key was audited, or that exam readiness has been demonstrated. No question runtime schema changed; no app bundle sync, runtime supplement admission, CC-03 link UI, CC-04 completion-rule v3, or publication occurred. Course links for CC-03 are the frozen CC-01 mappings plus the 73 explicit CC-02 mappings, with current documentation URLs taken from canonical records.

## MCP evidence boundary

The six changed existing IDs are listed with exact before/after records in the JSON manifest. The repaired prompts separate project-server definition, project-folder trust, interactive `Pending approval`, user authentication, scalar settings precedence, and cross-scope permission deny behavior. `/status` is used only to identify loaded settings sources; it is not described as a per-key effective-value or effective-grant report. Current official docs are registered in the source registry.
