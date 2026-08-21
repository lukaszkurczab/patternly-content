# CNT-01 — AWS publishing contract audit

Date: 2026-08-21

Result: blocked by an existing source-version inconsistency; no runtime admission was claimed.

## Findings

- The AWS authoring registration and curriculum declare `2026.08.11`.
- 136 of 137 AWS source batches declare content `aws-certified-solutions-architect-associate-authoring-v2026.08.15` and taxonomy `aws-saa-c03-20-node-v2026.08.15`.
- One source batch, `manual/source/aws-certified-solutions-architect-associate/aws_secure_architecture_foundations/policy_evaluation_and_scope.json`, declares the older content and taxonomy versions.
- The source currently contains only 4 items owned by the declared Free node `aws_secure_architecture_foundations`; the canonical Free-node contract requires at least 10 eligible items for a 10-item session.
- Only 20 source items declare `certification-diagnostic-baseline`, while the complete-track diagnostic contract requires 40 unique items. Selecting undeclared items would violate the source interaction contract, so this cannot be solved by package metadata.
- The source tree is byte-identical to the owner-reviewed source at commit `e73c7314eee7b2cd3f53b04c952b6af6526d3685`; the mismatch is therefore part of the currently reviewed source, not a local working-tree change.
- `npm run audit:aws-workbook-source` passes structurally.
- `npm run validate:track -- --track aws-certified-solutions-architect-associate` cannot derive a technical input commit because the canonical runtime track configuration is not installed. Even after adding that configuration, the publishing validator requires one consistent batch content version and taxonomy version.

## Decision

I did not copy the Azure runtime configuration or add AWS package metadata. Doing so would create a non-buildable admission path and could turn the owner-approved source manifest into an unapproved source change. The canonical next change is to choose one AWS source/version contract, expand the canonical Free-node and diagnostic coverage to their required session floors, update the curriculum, authoring registration, and all affected source envelopes together, then obtain a new owner approval manifest bound to the resulting source commit before generating technical evidence or packages.

The AWS track remains outside runtime and publishing admission. The existing owner approval explicitly does not grant runtime, publishing, package, provider, store, signing, or device evidence.

## Owner decision required before implementation

The owner must approve the following contract as one coherent change before any AWS source or runtime files are edited:

1. Select the canonical content and taxonomy versions. The evidence supports `aws-certified-solutions-architect-associate-authoring-v2026.08.15` and `aws-saa-c03-20-node-v2026.08.15` as the dominant source versions, but this is not inferred as an approval.
2. Select the canonical Free-node scope and approve the six-or-more additional eligible items needed to reach the 10-item session floor without filler or cross-node selection.
3. Approve the source changes needed to raise `certification-diagnostic-baseline` coverage from 20 to at least 40 unique items for the complete-track diagnostic contract.
4. Approve the resulting curriculum, authoring registration, taxonomy/runtime configuration, and source envelopes together; then record a new human approval manifest bound to the resulting source commit.

Until that decision exists, no AWS package, technical evidence, runtime admission, or publishing admission is generated. Physical-device testing is not part of this blocker or the launch gate.
