# SIMP-05 — final report

**Status:** `done`
**Date:** 2026-09-13
**Next main-queue task:** `120` (not started)

## Outcome

SIMP-05 cut over persisted learning identity to the exact canonical tuple
`trackId`, `questionId`, `contentVersion`, `artifactSha256`. Startup performs an
atomic, restartable migration before public repositories open. Public readers
and writers reject legacy or mixed records after the committed marker, and the
canonical runtime resolves only the exact artifact SHA without a fallback.

Mapped sessions, attempts, review evidence and account state preserve their
stable identifiers, order, scores, timestamps and revisions. Unmappable
completed history is retained as immutable archival history. Unmappable active
sessions and review entries are stored separately as typed unavailable records:
they cannot enter runtime or become due review, remain visible in Activity or
Review, and require an explicit user action to remove or abandon.

Cloud progress uses the versioned v4 content-identity protocol. The app enables
it only after the migration gate, while the backend validates and merges the
typed canonical state with retry-safe semantics.

## Cleanup and retained boundaries

The application no longer exposes `ContentPackagePin`, performs runtime lookup
by an old pin, or produces legacy identity fields. The private migration
inventory/mapper remains intentionally scoped to bootstrap recovery, and
`itemId` remains only at the explicit content-report transport boundary.

In `patternly-content`, `manual/source`, family authoring configuration,
curriculum/admission/readiness generators, family candidate writers, old
publishing entry points and their tests were removed. The local review console
now reads canonical `content/` and addresses questions by `questionId`.
Historical approvals and SIMP-03 migration evidence remain immutable evidence,
not an ingress. The small ACC-02 candidate validators remain because the
cross-repository release gate actively imports them; when legacy source is no
longer present they verify the canonical migration evidence instead.

## Migration guarantees

- Bootstrap recovery runs before canonical repositories are exposed.
- Planning is read-only; publication is atomic and marker-driven.
- Interrupted preparation, publication, verification and rollback paths are
  idempotent and fail closed.
- Unknown SHA/version/release/question identities never substitute the current
  artifact.
- Archive-before-delete protects completed history; unavailable active/review
  records are isolated from strict runtime keys.
- Local reset, backup/restore, export, report transport and account sync use the
  new identity contract or their documented narrow boundary.

## Commits

Application (`patternly`):

- `a2b5d37`, `e0398eb`, `13e1ddf`, `a3b3b93`, `8f01fb6` — strict identity,
  migration planning/bootstrap and canonical payloads;
- `f2d816e`, `6547a04`, `1dad33e` — unavailable records, cloud v4 activation and
  learner-visible recovery UX;
- `368f269`, `6d20350` — removal of runtime pin lookup and public legacy pin
  contract.

Backend (`patternly-backend`): `f1cc174` — versioned v4 progress identity sync.

Content (`patternly-content`): `2ae54f3`, `130387f`, `502c4f4` — retirement of
the legacy source pipeline, preservation of actively owned ACC-02 validators,
and canonical-evidence verification.

## Verification

- Application typecheck: PASS.
- Application content-boundary gate: PASS.
- Application full suite after identity-contract cleanup and ACC-02 canonical
  evidence cutover: 1,094/1,094 PASS. Focused release manifest/gate retest:
  23/23 PASS.
- Content canonical suite: 55/55 PASS; wildcard owning suite: 55/55 PASS.
- Durable migration verifier: PASS with exact inventory 9 tracks / 117 nodes /
  932 mental units / 16,041 questions and unchanged per-track aggregate SHA-256.
- Backend lint and typecheck: PASS. Focused v4/OpenAPI suite: 45/45 PASS;
  OpenAPI check: PASS (54 operations); frontend client check: PASS (46 used
  operations). The raw backend full test command additionally requires the
  Firebase emulator suite and reports that environmental requirement explicitly.
- Diff checks: PASS in touched repositories.

## 4D assessment

| Dimension | Score | Evidence |
| --- | ---: | --- |
| Objective/architecture fit | 0.94 | One canonical persisted/runtime identity and one canonical content ingress. |
| Simplicity | 0.82 | Legacy executable paths are removed; only private migration and active release-evidence boundaries remain. |
| Risk | 0.86 | Atomic marker protocol, exact SHA resolution, rollback and explicit unavailable states cover data-loss/fallback risks. |
| Maintainability | 0.89 | Typed records, narrow owners, boundary gates and canonical evidence replace family-specific pipelines. |

Minimum: **0.82** — above the required 0.8 threshold.

## Final QA

The first independent audit rejected the slice because the public pin contract,
legacy source pipeline, stale ledger and incomplete boundary gate remained.
Those findings were remediated. Final independent re-review is the last gate;
its result is recorded in the final commit of this report.
