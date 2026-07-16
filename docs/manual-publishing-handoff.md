# Manual content publishing handoff

## Canonical manual ingress

- Algorithms batches: `manual/source/algorithms/*.json`, conforming to `schemas/publishing/algorithms-manual-source.schema.json`.
- Certification batches: `manual/source/cloud-certification/*.json`, conforming to `schemas/publishing/certification-manual-source.schema.json`.
- Editorial approvals: `manual/approvals/<trackId>/*.json`, conforming to `schemas/publishing/editorial-approval-record.schema.json`.
- Activation record: exactly one `manual/activations/<trackId>/*.json`, conforming to `schemas/publishing/content-activation-record.schema.json`.

`tracks/`, test fixtures, generated artifacts, and exports are never discovery roots. Moving existing question files is `MANUAL ONLY`; no pipeline command migrates, copies, or reads them as a fallback.

## Algorithms batch contract

An Algorithms batch carries its batch ID, version identity, batch taxonomy (`roadmapNodeId`, `primaryMentalUnitId`, `patternFamilyId`), authoring provenance, authored items, and explicit named mode structures. A contrast batch also requires contrasted mental units, false heuristic, and transfer boundary.

Every Algorithms item has one primary skill atom, de-duplicated secondary skill atoms, learning stage, explicit interaction and scoring contract, authored Reason/Details, and external source overrides when a claim is version- or policy-dependent. The publisher resolves the full taxonomy and provenance on every published item. It never infers either from a file name, path, item ID, or prompt.

The checked-in Algorithms taxonomy has deliberately not been expanded with invented mental-unit, family, variant, archetype, skill-atom, or heuristic mappings. Before real source is added, a human owner must provide the complete versioned taxonomy manifest required by the source contract; this is `MANUAL ONLY` and is not replaced with inferred mappings.

Modes are represented by practice blueprints and explicit recognition sets, contrast sets, interleaved scopes, compatibility sets, simulation pools, and simulation profiles. A declared mode is content-ready only when its own blueprint meets its `minimumActualLength`; bank-wide item count is not evidence. Interview Simulation uses an explicit pool/profile and deterministic `sha256-ranked-constraints-v1` selection of exactly 40 unique items without replacement.

## Approval and activation contract

Technical validation evidence is calculated by the validator and emitted with a successful build. It is not a manual approval file. Each batch needs one human editorial approval whose included item IDs and fingerprints exactly equal the validator evidence, and whose `technicalValidationEvidenceId` names passed evidence.

Every publication version also needs one manual activation record covering every item in the exact artifact with the same item fingerprint and owning approval ID. The outer consumer `approvalCoverage.identity` is a deterministic identity for that exact activation record. An edited learner-visible field changes the fingerprint and invalidates old coverage.

## Commands and hard stops

```text
npm test
npm run validate:track -- --track algorithms
npm run build:track -- --track algorithms
npm run verify:artifact -- --artifact artifacts/tracks/algorithms/<version>/track-artifact.json
npm run publish:immutable -- --release <release-id> --artifact artifacts/tracks/algorithms/<version>/track-artifact.json
npm run serve:artifacts
```

Build and publish require a clean Git state for canonical inputs, including untracked ingress files. `DIRTY_SOURCE`, `EMPTY_INGRESS`, `MISSING_APPROVAL`, `MISSING_ACTIVATION`, `MODE_UNREADY`, `SIMULATION_INFEASIBLE`, `INVALID_SIMULATION_PROFILE`, `INVALID_RESPONSE`, `INVALID_REFERENCE`, and `IMMUTABLE_VERSION` are hard stops. No command repairs data, generates questions, creates approvals, shrinks a fixed simulation, or publishes a subset.

## Application handoff

The external envelope remains unchanged: `artifacts/releases/<release-id>/release.json` has a track-scoped release manifest and consumer-shaped artifact references. The generated app module exports that exact immutable release. Runtime application code imports only the generated bundle; the development HTTP server serves only generated artifacts and is not a runtime dependency.
