# Manual publishing handoff

## Manual paste locations

- Algorithms source: `manual/source/algorithms/*.json`
- Certification source: `manual/source/cloud-certification/*.json`
- Algorithms approvals: `manual/approvals/algorithms/*.json`
- Certification approvals: `manual/approvals/cloud-certification/*.json`

Legacy `tracks/` is neither a source nor a fallback. Copying existing questions into canonical ingress is `MANUAL ONLY`; this repository provides no migration command.

## Source and approval contracts

Source batches conform to `schemas/publishing/manual-source.schema.json`. They require `schemaVersion: "manual-source-v1"`, manual `sourceBatchId`, track/family/content/taxonomy versions, declared modes, provenance, and items. Algorithms batches also provide groups.

Each approval record conforms to `schemas/publishing/approval-record.schema.json`: `schemaVersion: "manual-approval-v1"`, manual `approvalIdentity`, explicit `sourceBatchId`, `trackId`, `contentVersion`, `reviewKind` (`editorial` or `technical`), and explicit `itemIds`. Every item needs both review kinds. The builder never creates approval records.

## Commands

```text
npm test
npm run validate:track -- --track algorithms
npm run build:track -- --track algorithms
npm run verify:artifact -- --artifact artifacts/tracks/algorithms/<version>/track-artifact.json
npm run publish:immutable -- --release <release-id> --artifact artifacts/tracks/algorithms/<version>/track-artifact.json
npm run serve:artifacts
```

`publish:immutable` may contain only Algorithms. A later release may reference Certification without changing the earlier Algorithms artifact.

## Failure codes

`EMPTY_INGRESS`, `MISSING_APPROVAL`, `INVALID_APPROVAL`, `INVALID_ENVELOPE`, `MISSING_PROVENANCE`, `DUPLICATE_ID`, `INVALID_REFERENCE`, `INVALID_RESPONSE`, `UNSUPPORTED_INTERACTION`, `INVALID_MODE`, `INSUFFICIENT_POOL`, `CHECKSUM_MISMATCH`, `IMMUTABLE_VERSION`, and `INVALID_RELEASE` are explicit stops. A failure is never repaired automatically and never results in a subset artifact.

## Application handoff

`artifacts/releases/<release-id>/release.json` is the release record. `exports/app/generated-<release-id>.mjs` exports `GENERATED_BUNDLED_CONTENT_RELEASE`, whose track references contain exact `artifactBytes`, checksum, source commit, approval coverage, declared modes, family/track, content/taxonomy version, and schema version. The application imports this generated module at build time only.
