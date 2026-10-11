# Claude targeted source repair evidence — 2026-10-11

## Source review and outcome

The attached repair table names 37 correct-answer texts accurately but its proposed stable `optionId` letters do not match those texts in the canonical source at `2aae062abf997ca148ee15a391c32bbde34f6d7f` (the preflight HEAD, `0f4e6912d7d0cdb1a1c41b9d7885d7e867f80f34`, has no diff in the eight scoped source files). For all 37 items, the existing authored key already targets the option whose text and rationale the attachment identifies as correct. The attachment’s proposed replacement ID instead targets a distractor. No P1 question content or answer key was changed.

The initial `/private/tmp/patternly-claude-38/before-scoring.json` output used those mismapped proposed IDs as expected answers. Its reported 37/37 wrong-key reproduction is invalid and must not be represented as a defect or test result. The canonical scorer compares stable option IDs: each current key earns 1/1; the report-suggested distractor earns 0/1. The existing historical accepted-bank digest remains intact after reconstructing the pre-P2 question from the exact three P2 fields below.

| Unit | Current source key retained; attachment’s proposed replacement is a distractor |
|---|---|
| `CCARP-D01-O01` | `expansion-01 a (report b)`, `expansion-02 b (a)`, `expansion-04 b (c)`, `expansion-06 b (c)` |
| `CCARP-D01-O02` | `expansion-01 a (b)`, `expansion-02 c (a)`, `expansion-04 b (c)`, `expansion-05 d (b)`, `expansion-06 b (a)`, `expansion-07 b (d)` |
| `CCARP-D01-O03` | `expansion-01 d (b)`, `expansion-02 c (a)`, `expansion-03 b (d)`, `expansion-05 c (b)`, `expansion-07 a (d)` |
| `CCARP-D01-O04` | `expansion-03 c (d)`, `expansion-04 b (c)`, `expansion-06 b (a)`, `expansion-08 b (c)`, `expansion-09 b (d)`, `expansion-10 b (a)`, `expansion-12 b (c)`, `expansion-13 b (d)`, `expansion-14 b (a)` |
| `CCARP-D01-O05` | `expansion-01 a (b)`, `expansion-02 b (a)`, `expansion-03 b (d)`, `expansion-04 b (c)`, `expansion-06 b (c)` |
| `CCARP-D01-O06` | `expansion-01 a (b)`, `expansion-02 b (a)`, `expansion-03 b (d)`, `expansion-04 b (c)`, `expansion-06 b (a)` |
| `CCARP-D02-O01` | `expansion-02 c (a)`, `expansion-03 b (d)`, `expansion-04 b (d)` |

The parenthesized ID is the attachment’s proposed replacement; the preceding ID is the current key and matches the attachment’s stated correct-answer text.

## Actual P2 change

The accepted key `a`, `questionId`, and all option IDs remain unchanged. The option now permits only authorized, meaning-preserving reduction, requires recounting, and states an explicit capacity failure or approved alternate route when mandatory input still exceeds allowance. The reason states the arithmetic and prohibits silent loss of mandatory input; `boundaryOrTradeoff` now agrees with that limit. Other details remain as authored.

The option is 267 characters. The current question schema’s `learnerText` has a non-empty/clean-text contract and no maximum length.

| Field | Before | After |
|---|---|---|
| `/CCARP-D02-O04-expansion-14/interaction/options[a]/text` | “Preserve the reserve, reduce required input, then recount with the target model.” | “Preserve the response and thinking reserve. After any authorized, meaning-preserving reduction, recount with the target model; if mandatory input still exceeds the 18,000-token allowance, return an explicit capacity failure or use an already approved alternate route.” |
| `/CCARP-D02-O04-expansion-14/feedback/reason` | 19,300 input exceeded the 18,000 post-reserve allowance; reduce or restructure context and count again. | Names 19,300 vs 18,000, prohibits silent discard of mandatory instructions/evidence/output capacity, and requires an authorized contract-preserving reduction or failure/approved alternative. |
| `/CCARP-D02-O04-expansion-14/feedback/details/boundaryOrTradeoff` | Preserving facts; if mandatory content cannot fit, use a supported split or another capacity plan. | Preserving facts; otherwise return capacity failure or use an already approved alternate route. |

For the negative contract, mandatory input remains 19,300 tokens and response/thinking reserve is 4,000, totaling 23,300 against a 22,000 budget. The question and canonical scorer test cover this source contract; **runtime gateway simulation was not run** and no simulator was added.

## Verification

- `node --test tests/claude-content-audit-20261007.test.mjs` — PASS, 12/12. The added data-driven test checks all 37 exact IDs against current answer text/key, rejects the attachment’s mismapped IDs, verifies all three distractor feedback targets and a strategy-specific clue, and runs all 24 option orders across all four responses through the canonical `scoreQuestion` implementation.
- `npm run content:validate -- --track claude-certified-architect-professional-certification` — PASS, 845 questions validated.
- `npm run content:test -- --track claude-certified-architect-professional-certification` — PASS, 845 canonical answers tested.
- The P2 test checks the accepted `a` key, 19,300/18,000/4,000/22,000 contract, explicit capacity failure/approved alternative wording, feedback cardinality/targets, and all four scorer responses across all 24 option orders.
- Current canonical question-set SHA-256 after the P2 correction: `73f561c4d64a272f8b6f055a321414303620c54dba7dfb4d0283d75ea74bfe6d` (845 questions); corrected unit file SHA-256: `05bb80ed858b04c939eedf2a17f8b7143c7d4e4c820aac3a5d980b27113c8147`. `content:build`, admission, runtime gateway behavior, and independent blind QA are not claimed here; build/admission and reviewer evidence are coordinated outside this source/test slice.
- The test reconstructs the historical pre-P2 question using only the prior option text, reason, and boundary tradeoff, then confirms the immutable accepted question-set SHA-256 `717b995fd9f9bda5d25161c516a248eb80b3a78cf23c69d1641c2ed95add8b9a`. This preserves the old accepted baseline honestly without calling it approval of the P2 clarification.

## Independent acceptance and real application verification

PO explicitly authorized implementation and publication before iOS on 11 October 2026 in the originating chat. Q13 and unrelated APP/PERSIST and CONTENT/BESD edits are outside this package. Isolated implementation worktrees start at CONTENT `0f4e6912d7d0cdb1a1c41b9d7885d7e867f80f34` and APP `8a591248c576b0d63f2df6331bd5ce8d83359bd5`; shared checkouts and stashes were preserved.

Independent reviewer: `blind_semantic_qa`, gpt-6-luna high. Phase 1 received only actual prompt, constraints and options (P2 proposed option included), recorded all 38 choices before seeing any key or feedback. Phase 2 checked keys, full Reason/Details and every distractor. Result: 38/38 key agreement; no semantic P1 defect, all three wrong-option feedback targets/texts matched in every item. After-source QA: PASS; exact P2 three-field delta and untouched 844 records independently confirmed; Node 22 audit test 12/12 passed independently. Runtime capacity gateway simulation remains NOT RUN: this is a question wording correction, no gateway exists in this task.

The actual APP `scoreCanonicalQuestion` and `projectCanonicalChoiceFeedbackMessages` were also executed against these current canonical records for every 24 option order and all four responses: **3,648/3,648 scoring+feedback checks PASS**. Current stable key produces correct 1/1, each other stable ID incorrect 0/1, and selected-wrong feedback is exactly the authored matching message. The report-suggested P1 IDs all remain distractors. A durable equivalent matrix is added to the existing APP `canonicalChoiceFeedbackPresentation.test.ts`, exercising the actual bundled consumer after sync. Existing accessibility tests are retained and will be rerun; no VoiceOver or native UI run is claimed.

| Exact question ID | Independently selected stable ID (retained) | Resolving condition |
|---|---|---|
| `CCARP-D01-O02-expansion-01` | `a` | Validate extracted inputs before retrieval; missing evidence needs review with the source retained, not model inference or retries. |
| `CCARP-D01-O02-expansion-02` | `c` | For a device-specific question, resolve the device and retrieve the revision applicable to it; current general questions can use current material. |
| `CCARP-D01-O02-expansion-04` | `b` | The ERP's inactive-vendor rejection is a typed downstream business outcome requiring correction before reposting. |
| `CCARP-D01-O02-expansion-05` | `d` | A potentially stale safety reading needs refresh or escalation, with its timestamp preserved for interpretation. |
| `CCARP-D01-O02-expansion-06` | `b` | Analyst feedback should direct bounded evidence gathering, revision, or stopping; unconditional second calls do not implement the decision loop. |
| `CCARP-D01-O02-expansion-07` | `b` | Persisting intent and reusing the same idempotency key supports safe bounded recovery while preserving unknown outcome and reconciliation if ambiguity remains. |
| `CCARP-D01-O04-expansion-03` | `c` | A required jurisdiction is unresolved, so the comparison cannot be labeled complete; keep it partial pending resolution or explicit owner exclusion. |
| `CCARP-D01-O04-expansion-04` | `b` | The analysis is coupled and sequential; start with one bounded evidence path and delegate only genuinely separable work. |
| `CCARP-D01-O04-expansion-06` | `b` | Enforce both explicit depth and call caps, track remaining budget, and expose incompleteness once the cap prevents useful remaining work. |
| `CCARP-D01-O04-expansion-08` | `b` | The required validated sections satisfy the contract; label the optional packet unavailable while preserving its pending status. |
| `CCARP-D01-O04-expansion-09` | `b` | Schema validity does not establish evidentiary support; verify each citation against its assigned source and keep unsupported claims unresolved. |
| `CCARP-D01-O04-expansion-10` | `b` | The quoted instruction is untrusted source content; evaluate source support and do not grant it authority or capabilities. |
| `CCARP-D01-O04-expansion-12` | `b` | Batch within result-rate and call-budget limits, prioritize mandatory packets, and report deadline-limited work as incomplete. |
| `CCARP-D01-O04-expansion-13` | `b` | Equal quality and coverage with higher cost and latency provide no workload-specific reason to retain specialists. |
| `CCARP-D01-O04-expansion-14` | `b` | Use documented status lookup or same-key retry to resolve the ambiguous commit, and confirm one committed publication before declaring success. |
| `CCARP-D02-O01-expansion-02` | `c` | Prompt clarification helped both models, but a failing required slice still requires a candidate or route that clears its floor and regression checks across slices. |
| `CCARP-D02-O01-expansion-03` | `b` | The multilingual floor is a hard contractual requirement; low traffic share cannot justify a failing candidate, though routing merits testing. |
| `CCARP-D02-O01-expansion-04` | `b` | End-to-end recall is bottlenecked by detector coverage; tune or add a safe fallback and measure false-positive and cost trade-offs on held-out risk cases. |
| `CCARP-D01-O03-expansion-01` | `d` | The documents are independently reviewable and the final common rubric belongs at aggregation, avoiding dependence between summaries. |
| `CCARP-D01-O03-expansion-02` | `c` | Observed rubric feedback improves drafts and one or two revisions suffice, supporting a bounded evaluator-optimizer trial. |
| `CCARP-D01-O03-expansion-03` | `b` | Variable evidence-dependent reads suit a bounded agent loop; account freezes remain behind a distinct approval gate. |
| `CCARP-D01-O03-expansion-05` | `c` | Independent source passes catch complementary facts, then reconciliation can include only supported claims and address conflicts. |
| `CCARP-D01-O03-expansion-07` | `a` | The measured revision violates the citation floor; retain the passing bounded workflow and deterministic citation gate. |
| `CCARP-D01-O06-expansion-01` | `a` | Allocation should compare cost per acceptable notice by type and include quality floors and reviewer labor, not token price alone. |
| `CCARP-D01-O06-expansion-02` | `b` | Keep routine requests within their SLA and route only evidence-conflict cases to the slower path with pending status and separate measurement. |
| `CCARP-D01-O06-expansion-03` | `b` | Routine work already meets its target; test agent investigation on the evidenced exception slice. |
| `CCARP-D01-O06-expansion-04` | `b` | High-impact deadline-field misses require a specific recall floor and uncertainty review, including the labor cost of that review. |
| `CCARP-D01-O06-expansion-06` | `b` | Faster first response does not establish productivity when the target is total staff time per resolved case and correction work rose. |
| `CCARP-D01-O05-expansion-01` | `a` | Respect the dependency graph: do independent work first, validate interfaces, then order dependent modules by prerequisite. |
| `CCARP-D01-O05-expansion-02` | `b` | Shared terms and references make related files one coherent unit; parallelize groups that are independent. |
| `CCARP-D01-O05-expansion-03` | `b` | Route uncertain or safety-related items to deeper review while preserving source IDs and routing for audit. |
| `CCARP-D01-O05-expansion-04` | `b` | Decompose independent evidence gathering, while assigning shared conclusions an owner and integration gate. |
| `CCARP-D01-O05-expansion-06` | `b` | The explicit data dependency requires extraction then registry validation then deterministic calculation; parallelize only independent work and preserve item identity. |
| `CCARP-D01-O01-expansion-01` | `a` | Status lookup is an API task while changing policy interpretation is a separate path; separate measures reflect their different outcomes. |
| `CCARP-D01-O01-expansion-02` | `b` | The project has distinct repeat-contact, lookup-time, and refund-loss outcomes; assign targets and owners with the existing loss limit as a guardrail. |
| `CCARP-D01-O01-expansion-04` | `b` | The held-out end-to-end result supports a measured expansion through the queue; clinic-type comparisons address variation before broad rollout while staff retain authority. |
| `CCARP-D01-O01-expansion-06` | `b` | Queue assignment causes most delay and the summarizer did not reduce it; address the measured workflow bottleneck first. |
| `CCARP-D02-O04-expansion-14` | `a` | The target-model count exceeds the 18,000 input allowance after the reserve; reduce only with authorization, recount, then fail clearly or use an approved route if still over. |

### Before source pointers and file hashes

| Unit | Source SHA-256 before | Exact question indices / answer and feedback pointers |
|---|---|---|
| `CCARP-D01-O01` | `c37fb1f00df9a00a7fda847b763630bfb961ae94902ee3b8de1e26cf1f64408b` | 01: `/2/answer/optionId`, `/2/feedback/messages`; 02: `/3/answer/optionId`, `/3/feedback/messages`; 04: `/5/answer/optionId`, `/5/feedback/messages`; 06: `/7/answer/optionId`, `/7/feedback/messages` |
| `CCARP-D01-O02` | `2ead1e484b7eb43ae1e619e3d4ad39d009559e56aae8532e754153b216826234` | 01: `/1/answer/optionId`, `/1/feedback/messages`; 02: `/2/answer/optionId`, `/2/feedback/messages`; 04: `/4/answer/optionId`, `/4/feedback/messages`; 05: `/5/answer/optionId`, `/5/feedback/messages`; 06: `/6/answer/optionId`, `/6/feedback/messages`; 07: `/7/answer/optionId`, `/7/feedback/messages` |
| `CCARP-D01-O03` | `20b89c971325bf21c1f0abaef6f5db958f47c1ffcf1195fdcd662c9b68166412` | 01: `/2/answer/optionId`, `/2/feedback/messages`; 02: `/3/answer/optionId`, `/3/feedback/messages`; 03: `/4/answer/optionId`, `/4/feedback/messages`; 05: `/5/answer/optionId`, `/5/feedback/messages`; 07: `/7/answer/optionId`, `/7/feedback/messages` |
| `CCARP-D01-O04` | `cb0fbcb5d2b6a688d58c6f749211ddba516938519a3e442e1dfeb7c4292b81d6` | 03: `/4/answer/optionId`, `/4/feedback/messages`; 04: `/5/answer/optionId`, `/5/feedback/messages`; 06: `/7/answer/optionId`, `/7/feedback/messages`; 08: `/9/answer/optionId`, `/9/feedback/messages`; 09: `/10/answer/optionId`, `/10/feedback/messages`; 10: `/11/answer/optionId`, `/11/feedback/messages`; 12: `/13/answer/optionId`, `/13/feedback/messages`; 13: `/14/answer/optionId`, `/14/feedback/messages`; 14: `/15/answer/optionId`, `/15/feedback/messages` |
| `CCARP-D01-O05` | `9202609048fe2c77c54070f6015fba1e4f9ec29764210800abf58929835e0e4b` | 01: `/2/answer/optionId`, `/2/feedback/messages`; 02: `/3/answer/optionId`, `/3/feedback/messages`; 03: `/4/answer/optionId`, `/4/feedback/messages`; 04: `/5/answer/optionId`, `/5/feedback/messages`; 06: `/7/answer/optionId`, `/7/feedback/messages` |
| `CCARP-D01-O06` | `77c8205b6f55b2607dc2bc42b5d4e7bb875067ca29d2f801cb97961ded45d339` | 01: `/2/answer/optionId`, `/2/feedback/messages`; 02: `/3/answer/optionId`, `/3/feedback/messages`; 03: `/4/answer/optionId`, `/4/feedback/messages`; 04: `/5/answer/optionId`, `/5/feedback/messages`; 06: `/7/answer/optionId`, `/7/feedback/messages` |
| `CCARP-D02-O01` | `7b0fdb6dc8faa0b1d34bf52b764933e7cd9914d6385de7f12f4ac59d201f1439` | 02: `/3/answer/optionId`, `/3/feedback/messages`; 03: `/4/answer/optionId`, `/4/feedback/messages`; 04: `/5/answer/optionId`, `/5/feedback/messages` |
| `CCARP-D02-O04` | `e31873399ff6319e862fd7d1ba53d8dabb5bc0fa2c45cdd00081e84d38596394` | 14: `/15/answer/optionId`, `/15/feedback/messages` |

## Publication approach

Producer source → normal canonical builder → existing nine-track candidate → existing delegated decision/readiness → explicit reviewed-candidate APP sync → existing generated release lock → actual APP runtime tests and admission-v3 → release gate. Only Claude artifact bytes change; other eight tracks must compare byte-for-byte. No new schema, scorer, approval layer, deployment service, or Q13 behavior is introduced.

Independent design review: `admission_research`, gpt-6-luna high; fit 0.86, simplicity 0.82, risk 0.80, maintainability 0.84 (minimum 0.80). Existing default sync cannot replace training content silently; optional reviewed-candidate mode must validate exact committed source, all candidate artifact hashes and existing readiness. Historical v1 locks remain unchanged. The release lock binds direct current candidate v2 bytes; runtime training identity remains the verified v1 projection in the existing ledger. Old references must keep the existing explicit mismatch/unavailable behavior; no content substitution or user-data mutation.

Implementation/merge order: reviewed source commit, canonical candidate and readiness, APP generated bundle/lock and tests commit, runtime admission evidence and final release gate, publish content and APP commits through normal Git push. No App Store/OTA/app installation is implied: learner content is bundled at build time and this repository has no live content delivery endpoint. Source publication and local admission are reported separately from deployment.

## Final verification and publication record

The production candidate is `d6e2f2f202790bec0d14614c855e87a5a7e40ddb1bfe7ca5346a1bbbd3b78b09`, release `patternly-candidate-63b1f8a388d7`, bound to canonical source commit `63b1f8a388d72cd620026d3a3cc24ee059c6a39b`. Candidate/readiness and current provenance pins are committed in `f402c03530310888162a989b36a0da330e1a6ab7`; evidence-only HEAD changes do not change the committed canonical source identity.

| Actual check | Result |
|---|---|
| Claude source audit / validate / score / track build | PASS 12/12; 845 validated/scored; normal builder artifact SHA-256 `eccfbe348fdb6767e54cf8f1b3ba7c05464d0abfce205dc0b430c876106727b4` |
| Nine-track build, nine-track canonical scoring, migration proof | PASS 9 tracks / 117 nodes / 943 units / 16,622 questions |
| Full CONTENT repository tests | Initial run 224/229; five failures exposed stale current catalog/provenance pins. Updated pins through existing `describeCurrentSourceProvenance`, preserving historical evidence and semantic readiness. Both affected files rerun PASS 42/42; unaffected passing full-suite evidence reused. |
| Independent current provenance review | PASS; readiness verifier and both affected test files also passed independently |
| Candidate regression after refreshed decision/readiness | PASS 13/13 |
| Existing APP sync and lock tests | PASS 25/25 + 28/28; production readiness validator includes missing/stale/wrong-source/wrong-hash/wrong-version negative cases |
| Actual default sync with changed training | Correctly rejected; bundle unchanged |
| Actual explicit reviewed-candidate sync, default repeat check, candidate release-lock check | PASS; inventory 9/117/943/16,622 |
| Actual bundled scorer/feedback matrix | PASS 3,648/3,648; all 38 independently reviewed IDs, 24 orders, four responses |
| APP canonical scoring oracle, runtime catalog and presentation tests | PASS 26 tests. First concurrently started runtime-admission test read the old lock before lock-write completion; only that test was rerun after completed lock and passed 1/1. This is recorded as execution ordering, not a product defect. |
| APP reference/unavailable and practice presentation checks | PASS 24/24 |
| APP typecheck and content boundary | PASS |

Only Claude generated artifact bytes and its content lock/successor-ledger entries changed. Its new training projection is `ccarp-2026.10.11-capacity-v1-bizq02-v2-bizq03-planning-v2-training`, SHA-256 `4cf89c3a8a8bd5576abea3b655d90a6362d0ac9ae0eda08894dcdb26a943e23a`. All other eight bundle artifact identities are unchanged. Frozen historical APP release-lock SHA-256 remains `d5058e8678ceab38fbdb3fc6ea423b80e21571885549df9b42dd6e3916312195`.

Local command logs and blind-review working JSON are private reproducibility outputs under `/private/tmp/patternly-claude-38`; durable verification is in the versioned existing tests and hash-bound candidate/admission artifacts. This work does not establish full-bank semantic acceptance, exam blueprint conformity, learning efficacy, native UI/VoiceOver behavior, or gateway capacity simulation.

Independent final acceptance: **PASS**, `blind_semantic_qa`, gpt-6-luna high. Reviewer independently reran the final APP canonical matrix and runtime admission suites with the required tsx loader: **9/9 PASS**. Their earlier plain-Node TS invocation was invalid and is superseded by this correct run; it is not reported as a product defect. The source provenance verifier and affected tests also passed independently.

Actual committed APP implementation/bundle: `9d6e664ef3814a22c431af4f917f2191f2938bb0`. Existing `candidate:admission-v3 -- BIZQ-01/ADMISSION` passed and wrote hash-bound runtime evidence at `evidence/admissions/runtime/d6e2f2f202790bec0d14614c855e87a5a7e40ddb1bfe7ca5346a1bbbd3b78b09-9d6e664ef3814a22c431af4f917f2191f2938bb0.json`. Existing `candidate:release-gate-v2` returned **RELEASE_READY**. Publishing/runtime admission is granted only within the existing `local_verified_artifacts_no_deployment` boundary. Remote Git publication follows these local gates; hosted CI outcomes are reported separately.

### Hosted CI fixture correction

Initial hosted runs `38154769746` and `38154802173` exposed two stale test assumptions after current admission was legitimately replaced: the old-grant rejection tests read `ADMISSION_PATH` and assumed it still contained frozen candidate 946d. The previous 13/13 candidate regression run occurred before this final admission write. The corrected existing tests load old admission/runtime evidence from immutable commit `eb92726efe583f646ce503f6215101d42528e08d` and still reject that grant against the current d6e2 candidate; separate historical acceptance/hash/task/boundary tampering tests remain. No validator, source, current admission or pipeline changed. Both affected test files pass **8/8** against the final admission; independent review accepts the correction. Full hosted CI is rerun after this test-only correction. APP hosted CI separately exposed three equivalent stale current-vs-historical fixture assumptions; they are corrected and reviewed in APP without runtime changes.

### Final publication and hosted verification

Owner-authorized Git publication completed on CONTENT `master` and APP `main`. CONTENT implementation/test commit `cac1836e9094c115e3ad104cd42ac8059b9c051a` passed [publishing architecture](https://github.com/lukaszkurczab/patternly-content/actions/runs/38155658678) and [real content release gate](https://github.com/lukaszkurczab/patternly-content/actions/runs/38155678064): full tests **229/229**, migration proof, exact candidate rebuild/readiness and **RELEASE_READY**.

APP implementation/test commit `3143bf494f56d3f3dd62cab626c9fccd46d7e969` passed [hosted QA](https://github.com/lukaszkurczab/gcp-ace-trainer/actions/runs/38156278420): **2,312 passed / 0 failed / 4 skipped**, plus multi-track round-trip **3/3**, typecheck, recovery, generated native contract and content/privacy boundaries. The final bounded CLI correction selects the raw v2 catalog track for current demo receipt checks instead of the owner's v1 training projection; family/source/Free-pool checks and the frozen historical route remain. No website output was written. Independent Luna High QA accepted the four-file exporter/fixture slice and reran exporter **5/5**; targeted release-gate **2/2** and manifest **1/1** passed.

This final documentation update changes no source, candidate, bundle, lock, runtime, dependency or verification configuration; the matching implementation evidence above is reused. Runtime admission remains bound to unchanged admitted APP bundle/runtime commit `9d6e664ef3814a22c431af4f917f2191f2938bb0`. No App Store, OTA or service deployment occurred. Q13 and unrelated working edits were preserved. Only P2 `CCARP-D02-O04-expansion-14` changed semantically; all 37 P1 stable keys remain correct and unchanged. Native UI/VoiceOver and gateway capacity simulation remain **NOT RUN**, and the 845-item bank has no new full semantic acceptance.
