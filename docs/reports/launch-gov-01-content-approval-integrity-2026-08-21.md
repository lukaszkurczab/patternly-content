# GOV-01 — content approval integrity

## Result

`partial` on the local worktree. The approval boundary now distinguishes agent-prepared review evidence from a human owner decision. Canonical push and exact-SHA CI remain pending because external mutation was not authorized in this task.

## Changed contract

- Existing `evidence/content-approvals/<track>.json` records remain unchanged as agent-prepared traceability evidence.
- Readiness and review-packet generation consume only `evidence/human-content-approvals/manifest.json`.
- The owner manifest binds the exact eight-track source scope, source commit `e73c7314eee7b2cd3f53b04c952b6af6526d3685`, source and item manifests, review scope, confirmation date `2026-08-20`, and the recorded human owner identity `lukaszkurczab`.
- The automatic `record:owner-approvals` command was removed so an agent cannot create a human approval record by running a local generator.

## Acceptance evidence

- Focused tests: 3/3 passed.
- Full content architecture suite: 143/143 passed.
- Readiness regeneration: 8/8 track validators passed; every track reports `humanReview: approved` from the human owner manifest and retains runtime/publishing blockers.
- App `npm run launch:readiness`: `not_ready`, 33 blockers unchanged: 1 lock scope, 6 external evidence, 4 Free packages, 6 immutable full packages, 8 publishing admissions, 8 runtime admissions.

## Non-goals and remaining gate

This slice does not grant runtime or publishing admission, package delivery, entitlement, provider, store, signing, Figma, or device evidence. Before treating GOV-01 as `done`, run content CI on the exact pushed SHA and verify the owner identity binding against the owner’s canonical identity.
