# AWS SAA-C03 N01 checkpoint

Status: N01 candidate source is generated and mechanically validated; all items remain unapproved and require human technical/editorial review before runtime admission.

## Scope

- Track: `aws-certified-solutions-architect-associate`
- Workbook node: `identity_federation_and_root_access`
- Workbook mental units: 6/6 authored
- Candidate questions: 123
- Unique slots and semantic identities: 123
- Taxonomy: `aws-saa-c03-20-node-v2026.08.15`
- Workbook source: [attached AWS SAA workbook](/Users/lukaszkurczab/Downloads/done/patternly_aws-certified-solutions-architect-associate_2026-08-15.xlsx)

## Mental-unit inventory

| Batch | Mental unit | Items |
|---|---|---:|
| N01-B01 | `shared_responsibility_and_root_access` | 16 |
| N01-B02 | `iam_users_groups_roles_and_policy_evaluation` | 12 |
| N01-B03 | `least_privilege_mfa_and_credential_lifecycle` | 14 |
| N01-B04 | `sts_temporary_credentials_and_role_switching` | 12 |
| N01-B05 | `federation_iam_identity_center_and_directory_integration` | 14 |
| N01-B06 | `identity_based_authorization_diagnostics` | 14 |
| N01-B07 | additional batch in canonical `identity_based_authorization_diagnostics` | 41 |
| **Total** | 6 canonical mental units | **123** |

## Boundary and ownership

N01 owns identity establishment, workforce federation, role sessions, least-privilege identity authorization, and diagnosis of identity-driven `AccessDenied` outcomes. Multi-account governance and resource-policy governance are separate workbook node N02 concerns. Network segmentation, encryption/secrets, and service-specific performance or cost choices are not silently absorbed into N01.

The 41-item N01-B07 file is an explicit second authoring batch for the existing `identity_based_authorization_diagnostics` unit; it does not create a seventh mental unit. The local workbook audit accepts the canonical block path and numbered repeated batch paths only when the JSON's `learningBlockId` remains the same.

## Quality and provenance

- Every item uses single-choice interaction with exactly one accepted option.
- Every item has explicit scenario constraints, complete distractor explanations, and a direct first-party AWS documentation URL in `feedback.Details.url` bound through `sourceBinding.sourceRefs`.
- All content is marked `unapproved`; this checkpoint is candidate source only.
- No practice-exam dump, third-party question bank, fabricated approval, runtime fallback, or silent compatibility path was added.

## Verification

`npm run audit:aws-workbook-source` passes with 7 N01 batches, 123 semantic identities, and 123 unique slots.

Repository-wide validation is not a clean release gate yet. The existing shared authoring model still reports unrelated coding-interview count reconciliation failures, and the pre-existing Google Cloud curriculum JSON contains leading patch-marker characters that break global manifest parsing. The current AWS curriculum config remains the older 3-node runtime taxonomy, so these 123 items are not yet runtime-admitted as the workbook's 20-node catalog.

## Remaining work

N01's recorded authored count remains pending human review and runtime admission. N02 authoring has started with `organizations_accounts_ous_and_hierarchy`; the next N02 mental unit is `control_tower_and_preventive_detective_guardrails`, followed by cross-node catalog integration and a fresh validation pass after the unrelated repository blockers are resolved.
