# AWS-02/CANDIDATE — exact candidate approval and readiness v2

**Status:** `candidate-approved / admission-not-granted`. Candidate approval is a delegated Codex decision for the exact v2 candidate. Publishing admission, runtime admission, and app release-lock changes remain ungranted.

## Decision and scope

The delegated decision in `evidence/candidate-decisions/aws-02-codex-decision-v2.json` approves this exact candidate for readiness:

- Candidate ID: `11d56baa82f897482a6def37d2af6bd90977b855a2fd5ddcb151838c7108a5f1`.
- Canonical content source snapshot: `79060003a30146fc2eb79df09426499a451783b1`.
- Release ID: `patternly-candidate-79060003a301`.
- Release envelope SHA-256: `617f2216a0e23c6267a46b1d2fca528cf88d919e8094c97b65a5517492b8fac0`.
- Nine track IDs, each question-set hash, artifact path, and artifact SHA-256 are recorded in the decision and checked against the release envelope.
- Readiness v2 is `evidence/readiness/candidate-readiness-v2.json`; it hashes and references the separate Codex decision.

The decision authority is the user's active delegation in `patternly/docs/PATTERNLY-WORKING-PLAN.md` (§ DEC-23-CONTENT and AWS-02/CANDIDATE). It is recorded as `delegated_codex`; it does not claim a human-owner approval. Existing v1 candidate evidence, human approvals, historical release/readiness/admission evidence, and the app `release.lock` were not changed.

## Canonical source and snapshot identity

The release previously used repository `HEAD` as `sourceRepositoryCommit`. Committing generated evidence would advance `HEAD`, making the evidence point to a different commit on regeneration. The v2 generator now anchors that field to the last commit that changed canonical `content/` and verifies both staged and unstaged content match that committed snapshot. Builder, decision, and report commits therefore do not self-reference or rotate the source SHA. Any canonical-source drift blocks draft generation until committed and reviewed.

The nine artifacts were regenerated from the current canonical producer. AWS has 2,604 questions, including the exact ODK-096 additive node; the other eight banks retain their current counts and identities. ODK-096 remains scoped to that AWS producer identity and does not grant downstream admission.

## Readiness boundary

Readiness v2 records `candidateApproval.status=approved` with the exact decision ID, path, and SHA-256. It separately records `publishingAdmission=not_granted`, `runtimeAdmission=not_granted`, and `appReleaseLockUpdated=false`, both globally and per track. This does not upgrade the old v1 readiness or reuse historical human approvals for the new candidate.

The decision and readiness validators reject stale candidate IDs, missing fields, unknown tracks, changed artifact hashes, non-v2/v1 candidate paths, and unsupported keys. The release verifier checks envelope checksum plus each artifact's bytes, size, and checksum.

## Verification

- Independent pre-change briefing: consistency 0.94, simplicity 0.84, risk 0.84, maintainability 0.84; minimum 0.84, approved without redesign.
- `npm run test:candidate-draft-v2`: PASS; repeated drafts produce the same candidate identity and bytes.
- `npm run test:candidate-readiness-v2`: PASS; exact binding and stale/missing/unknown/hash/v1-path negatives.
- `npm run candidate:draft-v2`: PASS; candidate ID and source snapshot above.
- `npm run candidate:readiness-v2`: PASS; readiness binds the decision and leaves publishing/runtime admission ungranted.
- `npm test`: PASS, 63/63 tests.
- `npm run verify:migration`: PASS; 9 tracks, 117 nodes, 943 mental units, 16,077 questions, with 36 approved AWS additions over the historical 16,041-question baseline.
- `git diff --check`: PASS.

The first independent QA returned `FAIL`: the source snapshot guard used `git diff`, which omitted a valid untracked question file and could have changed the candidate while retaining the old source SHA. The guard now compares every committed and working `content/` path, Git blob hash, and file mode, including untracked and ignored files, before building. An isolated temporary-Git test confirms that adding a valid untracked mental-unit JSON is rejected; it does not mutate the shared repository. The regenerated candidate ID and all release/artifact checksums remain unchanged. Independent briefing scores: consistency 0.94, simplicity 0.84, risk 0.84, maintainability 0.84; minimum 0.84.

Independent re-review: **PASS WITH ISSUES**. The implementation and evidence meet
the candidate criteria; the remaining issue was a stale sentence in the
cross-repository working plan, corrected during final plan synchronization.

No deployment, publishing action, runtime admission, or app lock update occurred. Next, any distribution or active-runtime change requires its own evidence and consumer checks under AWS-02/ADMISSION.
