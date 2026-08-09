# Manual content publishing handoff

## Canonical manual ingress

- Coding Interview batches: `manual/source/coding-interview-dsa-problem-solving/*.json`, conforming to `schemas/publishing/coding-interview-manual-source.schema.json`.
- Certification batches: `manual/source/google-cloud-associate-cloud-engineer/*.json`, conforming to `schemas/publishing/certification-manual-source.schema.json`.

Test fixtures, generated artifacts, and releases are never discovery roots. Moving existing question files is `MANUAL ONLY`; no pipeline command migrates, copies, or reads them.

## Technical evidence contract

The lifecycle is fixed: `inspect-source` → `emit-technical-evidence` → `validate-release-candidate` → build → publish. Evidence emission is deterministic and immutable for the exact technical input bytes. Technical validation evidence is addressed by its technical-input commit; Coding Interview simulation coverage is addressed by profile, technical-input commit, and canonical input-manifest checksum, so a later input cannot overwrite an earlier coverage record. It records the source and technical-input commit identities, canonical input-manifest checksum, batch fingerprints, item fingerprints, validation result, taxonomy and content versions. A changed learner-visible item or technical input requires matching regenerated evidence; the release gate rejects stale or missing evidence.

## Coding Interview batch contract

An Coding Interview batch carries its batch ID, version identity, batch taxonomy (`roadmapNodeId`, `primaryMentalUnitId`, `patternFamilyId`), authoring provenance, authored items, and explicit named mode structures. A contrast batch also requires contrasted mental units, false heuristic, and transfer boundary.

Every Coding Interview item has one primary skill atom, de-duplicated secondary skill atoms, learning stage, explicit interaction and scoring contract, authored Reason/Details, and external source overrides when a claim is version- or policy-dependent. Optional `constraints` is a non-empty list of strings and optional `difficulty` is a non-empty string; both compile directly to the application item contract. The publisher resolves the full taxonomy and provenance on every published item. It never infers either from a file name, path, item ID, or prompt.

The checked-in Coding Interview taxonomy has deliberately not been expanded with invented mental-unit, family, variant, archetype, skill-atom, or heuristic mappings. Before real source is added, a human owner must provide the complete versioned taxonomy manifest required by the source contract; this is `MANUAL ONLY` and is not replaced with inferred mappings.

The only Coding Interview mode IDs are `coding-interview-learn-approach`, `coding-interview-guided-practice`, `coding-interview-recognize-patterns`, `coding-interview-contrast-practice`, `coding-interview-weak-area-review`, `coding-interview-independent-practice`, and `coding-interview-interview-simulation`. The six practice blueprints and the fixed-40 simulation blueprint are owned only by `config/tracks/coding-interview-dsa-problem-solving.json`; source batches do not own mode blueprints. Recognition sets, contrast sets, interleaved scopes, compatibility sets, simulation pools, and simulation profiles remain explicit source structures. A declared mode is content-ready only when its track blueprint meets its `minimumActualLength`; bank-wide item count is not evidence. Interview Simulation uses one declared pool/profile and deterministic `sha256-ranked-constraints-v1` selection of exactly 40 unique items without replacement.

## Commands and hard stops

```text
npm test
npm run inspect:real:coding-interview
npm run evidence:real:coding-interview
npm run validate:real:coding-interview
npm run build:real:coding-interview
npm run evidence:real:gcp-ace
npm run validate:real:gcp-ace
npm run build:real:gcp-ace
npm run validate:track -- --track coding-interview-dsa-problem-solving
npm run build:track -- --track coding-interview-dsa-problem-solving
npm run verify:artifact -- --artifact artifacts/tracks/coding-interview-dsa-problem-solving/<version>/track-artifact.json
npm run publish:immutable -- --release <release-id> --artifact artifacts/tracks/coding-interview-dsa-problem-solving/<version>/track-artifact.json
npm run serve:artifacts
```

Inspection is read-only and may run on working source. Evidence emission, build, and publish require a clean Git state for canonical inputs, including untracked ingress files. `DIRTY_SOURCE`, `EMPTY_INGRESS`, `MISSING_CANONICAL_TAXONOMY`, `MISSING_TECHNICAL_EVIDENCE`, `MISSING_SIMULATION_COVERAGE`, `MODE_UNREADY`, `SIMULATION_INFEASIBLE`, `SIMULATION_SOLVER_LIMIT`, `INVALID_SIMULATION_PROFILE`, `INVALID_RESPONSE`, `INVALID_REFERENCE`, and `IMMUTABLE_VERSION` are hard stops. No command repairs data, generates questions, shrinks a fixed simulation, or publishes a subset.

## Application handoff

The external envelope remains unchanged: `artifacts/releases/<release-id>/release.json` has a track-scoped release manifest and consumer-shaped artifact references. Every artifact in a release must name the same source commit as its release manifest. Build writes `track-artifact.json` and `build-report.json` into one staged immutable version directory; publish writes `release.json` and `generated-bundled-content.mjs` into one staged immutable release directory. Each directory becomes visible through one atomic rename. Runtime application code imports only a deliberately pinned generated bundle; the development HTTP server serves only generated artifacts and is not a runtime dependency.
