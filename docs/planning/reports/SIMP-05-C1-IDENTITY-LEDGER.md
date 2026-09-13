# SIMP-05-C1 identity ledger

Status: `RESOLVED` — historical planning ledger; the coordinated runtime cutover was completed by SIMP-05.

The blocker and intermediate evidence below describe the pre-cutover state from
2026-09-12. They are retained as decision history, not as the current runtime
status. The final implementation and verification are recorded in
[`SIMP-05-REPORT.md`](SIMP-05-REPORT.md).

The current repository still has a single connected runtime contract based on
`ContentItemRef` (`itemId` + `packagePin`) and `ContentPackagePin`. A strict
cutover cannot be compiled as an isolated C1 slice until all listed owners are
changed together, or the migration/schema marker from 05-C2 is available.

| Production field/path | Target field/path | Owner | Transport exception |
| --- | --- | --- | --- |
| `domain/learning/contentItemRef.ts:itemId` | `ResolvedContentRef.questionId` | learning domain, session/attempt/review | content-report adapter only, if backend mapping is proven |
| `domain/learning/contentItemRef.ts:packagePin` | `ResolvedContentRef.artifactSha256` | learning domain and all equality/key helpers | private legacy mapper/migrator only |
| `domain/learning/trainingSession.ts:packagePin` | `TrainingSession` strict `artifactSha256` | session lifecycle and repositories | private legacy mapper/migrator only |
| `domain/learning/reviewEvidence.ts:sourceItem` | strict source ref | review transitions/selection | private legacy mapper/migrator only |
| `domain/learning/reviewQueueEntry.ts:sourceItem` | strict source ref | review queue and dedupe | private legacy mapper/migrator only |
| `domain/learning/journalContracts.ts:packagePin` | strict source ref fields | mutation journal/integrity | private legacy mapper/migrator only |
| `application/homePlanSnapshotReader.ts:contentPackagePin` | strict artifact identity | home plan/materialization | private legacy mapper/migrator only |
| `application/practiceReadModels.ts:packagePin` | strict artifact identity | practice read models | private legacy mapper/migrator only |
| `features/reports/*:itemId` | explicit `questionId -> itemId` adapter | report transport | allowed only with backend contract evidence |
| `navigation/types.ts:expectedContentPackagePin` | strict expected artifact identity | navigation guards | private migration boundary only |
| `storage/repositories/*` persisted records | strict schema after 05-C2 marker | repository readers/writers | migration internals only |

## Evidence and blocker

The following active consumers are coupled to the legacy shape and would fail
type-check if `TrainingSession`, `ReviewEvidence`, or `ContentItemRef` were
changed independently: `src/domain/learning/trainingSession.ts`,
`reviewEvidence.ts`, `reviewQueueEntry.ts`, `journalContracts.ts`,
`src/application/homePlanSnapshotReader.ts`, `practiceReadModels.ts`,
`src/application/certification/certificationReviewCommands.ts`, navigation
guards, report UI, repository codecs, and their fixtures/tests. The current
`legacyContentIdentityMapper.ts` is imported directly only by focused tests and
migration internals. It is not exported from `src/domain/learning/index.ts` or
the public domain barrel, so the required “private mapper not imported by
readers/writers” gate currently holds.

The acceptance packet requires public readers/writers to reject legacy fields
only after a committed identity migration marker, while the task explicitly
forbids wiring migration bootstrap in C1. Therefore a coherent compile/test
slice requires either (a) a coordinated C1 change across the full dependency
graph plus a separately available 05-C2 schema marker, or (b) splitting C1
into contract/core and application/repository follow-up slices. Recommended
next profile: controller-managed coordinated migration implementation after
05-B/05-C2, with independent QA and full focused gates.

4D assessment for the attempted isolated slice: consistency 0.88,
simplicity 0.34, risk 0.18, maintainability 0.42; minimum 0.18.

## C1 execution evidence (2026-09-12)

No application or content-runtime files were changed in this attempt. The
current C0 baseline (`631a85b`) was verified instead of introducing a partial
dual-format cutover.

The blocker remains concrete:

* `src/storage/repositories/contentIdentityMigration.ts` is intentionally an
  opaque raw-byte transaction engine. Its public planner records source and
  target manifests, while the owner-specific transform and verifier bindings
  remain private; there is no production owner dispatch that can derive target
  records for fixed keys, dynamic records, or account-sync nested state.
* The active runtime still has 561 production matches for the legacy
  `ContentItemRef`/`ContentPackagePin` field family across domain, storage,
  application, tracks, presentation, fixtures, and the report boundary. A
  strict change to one aggregate fails the current dependency graph, while
  leaving the others unchanged would create a forbidden mixed/dual format.
* Account sync continues to expose typed top-level state with nested
  `state: Record<string, unknown>` payloads. The app inventory's backend audit
  is explicit that the current progress/merge/adoption protocols accept and
  fingerprint opaque state and therefore require a backend contract change for
  a typed identity migration. Backend edits are outside this slice.
* `openCanonicalRepositories` currently performs metadata validation before
  any repository reads, and `validateStorageMetadata` intentionally blocks
  `pending_v2`/`committed_v2`. Activating C1 therefore requires the missing
  owner planner, verifier/certificate, and an ordered bootstrap recovery path;
  wiring only the existing opaque engine would be a fake success path.

Baseline verification in the app repository:

* Focused C0/inventory tests: 54 passed (`contentIdentityMigration`,
  `storageMetadataRepository`, `contentIdentityInventory`).
* `npm run typecheck`: passed.
* A broad `npm test` invocation was not considered a C1 gate: the repository's
  release-manifest tests correctly stopped on the pre-existing uncommitted
  content worktree, and the run was interrupted after that expected blocker.

Recommended route: split the coordinated cutover into an owner-dispatch and
certificate slice (domain/repositories/account-sync), then a bootstrap and
consumer slice. Do not activate C1 until both produce strict target records
and the backend opaque-state contract is either versioned or explicitly
accepted as a transport-only boundary.

The earlier isolated-slice note that described bootstrap wiring as forbidden
belongs to the superseded C1 brief; the current coordinated brief requests
bootstrap activation. The evidence above means that activation is still
blocked by the missing owner planner/certificate and backend contract, not by
that superseded wording.

## C1a execution evidence (2026-09-12)

This slice adds a dormant owner-dispatch planner and shared v2 persisted
contracts without importing either into the storage barrel or bootstrap. It
does not activate public readers/writers, change backend protocol, or mutate
canonical storage during planning.

Changed app files owned by this slice:

* `src/storage/contracts/contentIdentityV2.ts` — exact frozen v2 record,
  preservation, certificate and resolution guards; legacy fields are rejected
  except the named content-report `input.itemId` transport path.
* `src/storage/repositories/contentIdentityV2Planner.ts` — explicit dispatch for
  every inventory owner, session/attempt/review/plan/notification/journal,
  account outbox/syncPlan/materialization/guestBackup and report handling;
  one-to-many tombstone bindings, preservation digests, cross-record verifier,
  C0 sealed plan/verifier integration, and cloud rollout certificate gate.
* `src/storage/repositories/contentIdentityV2Planner.test.ts` — 12 focused
  tests covering exact/frozen/deterministic contracts, forged bundle, mapped
  and stale/unknown identities, terminal history, malformed/orphan/duplicate
  records, reports, notification/plan/journal, nested guest backup, and the
  zero-write C0 fence path.

Verification:

* focused command covering planner, migration engine, metadata and inventory:
  **66 tests passed**;
* `npm run typecheck`: **passed**;
* `git diff --check`: **passed**;
* no full suite, commit or push was run.

The planner requires the current v1 metadata/source certificate and keeps the
`cloudProtocolUpgradeRequired: true` certificate until the later B2 contract;
there is intentionally no bootstrap activation in C1a.  Current unrelated app
worktree changes were preserved. C1a 4D self-assessment: consistency 0.90,
simplicity 0.84, risk 0.84, maintainability 0.85; minimum 0.84. Remaining
limitation: full runtime consumer cutover and account/cloud protocol rollout
remain owned by later C1b/B2 slices.
