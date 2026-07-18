# Manual content publishing handoff

## Canonical manual ingress

- Algorithms batches: `manual/source/algorithms/*.json`, conforming to `schemas/publishing/algorithms-manual-source.schema.json`.
- Certification batches: `manual/source/cloud-certification/*.json`, conforming to `schemas/publishing/certification-manual-source.schema.json`.
- Editorial approvals: `manual/approvals/<trackId>/*.json`, conforming to `schemas/publishing/editorial-approval-record.schema.json`.
- Activation record: exactly one `manual/activations/<trackId>/*.json`, conforming to `schemas/publishing/content-activation-record.schema.json`.

`tracks/`, test fixtures, generated artifacts, and releases are never discovery roots. Moving existing question files is `MANUAL ONLY`; no pipeline command migrates, copies, or reads them as a fallback.

## Algorithms batch contract

An Algorithms batch carries its batch ID, version identity, batch taxonomy (`roadmapNodeId`, `primaryMentalUnitId`, `patternFamilyId`), authoring provenance, authored items, and explicit named mode structures. A contrast batch also requires contrasted mental units, false heuristic, and transfer boundary.

Every Algorithms item has one primary skill atom, de-duplicated secondary skill atoms, learning stage, explicit interaction and scoring contract, authored Reason/Details, and external source overrides when a claim is version- or policy-dependent. Optional `constraints` is a non-empty list of strings and optional `difficulty` is a non-empty string; both compile directly to the application item contract. The publisher resolves the full taxonomy and provenance on every published item. It never infers either from a file name, path, item ID, or prompt.

The checked-in Algorithms taxonomy has deliberately not been expanded with invented mental-unit, family, variant, archetype, skill-atom, or heuristic mappings. Before real source is added, a human owner must provide the complete versioned taxonomy manifest required by the source contract; this is `MANUAL ONLY` and is not replaced with inferred mappings.

The only Algorithms mode IDs are `algorithms-learn-approach`, `algorithms-guided-practice`, `algorithms-recognize-patterns`, `algorithms-contrast-practice`, `algorithms-weak-area-review`, `algorithms-independent-practice`, and `algorithms-interview-simulation`. The six practice blueprints and the fixed-40 simulation blueprint are owned only by `config/tracks/algorithms.json`; source batches do not own mode blueprints. Recognition sets, contrast sets, interleaved scopes, compatibility sets, simulation pools, and simulation profiles remain explicit source structures. A declared mode is content-ready only when its track blueprint meets its `minimumActualLength`; bank-wide item count is not evidence. Interview Simulation uses one declared pool/profile and deterministic `sha256-ranked-constraints-v1` selection of exactly 40 unique items without replacement.

## Approval and activation contract

The lifecycle is fixed: `inspect-source` → `emit-technical-evidence` → human editorial approval → activation → `validate-release-candidate` → build → publish. Technical evidence is emitted after successful inspection, before any editorial approval, and is not a human approval file. It is deterministic and immutable per inspected source bytes. An approval is reusable across content versions only when its track, family, item ID, item fingerprint, approval identity, reviewer metadata, and non-revoked approved disposition remain valid. `targetContentVersion`, if retained, is historical context rather than a reuse constraint.

Every publication version also needs one manual activation record covering every item in the exact artifact with the same item fingerprint and owning approval ID. The outer consumer `approvalCoverage.identity` is a deterministic identity for that exact activation record. An edited learner-visible field changes the fingerprint and invalidates old coverage.

## Commands and hard stops

```text
npm test
npm run inspect:real:algorithms
npm run evidence:real:algorithms
npm run validate:real:algorithms
npm run build:real:algorithms
npm run validate:track -- --track algorithms
npm run build:track -- --track algorithms
npm run verify:artifact -- --artifact artifacts/tracks/algorithms/<version>/track-artifact.json
npm run publish:immutable -- --release <release-id> --artifact artifacts/tracks/algorithms/<version>/track-artifact.json
npm run serve:artifacts
```

Inspection is read-only and may run on working source. Evidence emission, build, and publish require a clean Git state for canonical inputs, including untracked ingress files. `DIRTY_SOURCE`, `EMPTY_INGRESS`, `MISSING_CANONICAL_TAXONOMY`, `MISSING_TECHNICAL_EVIDENCE`, `MISSING_APPROVAL`, `MISSING_ACTIVATION`, `MODE_UNREADY`, `SIMULATION_INFEASIBLE`, `SIMULATION_SOLVER_LIMIT`, `INVALID_SIMULATION_PROFILE`, `INVALID_RESPONSE`, `INVALID_REFERENCE`, and `IMMUTABLE_VERSION` are hard stops. No command repairs data, generates questions, creates approvals, shrinks a fixed simulation, or publishes a subset.

## Application handoff

The external envelope remains unchanged: `artifacts/releases/<release-id>/release.json` has a track-scoped release manifest and consumer-shaped artifact references. Build writes `track-artifact.json` and `build-report.json` into one staged immutable version directory; publish writes `release.json` and `generated-bundled-content.mjs` into one staged immutable release directory. Each directory becomes visible through one atomic rename. Runtime application code imports only a deliberately pinned generated bundle; the development HTTP server serves only generated artifacts and is not a runtime dependency.
