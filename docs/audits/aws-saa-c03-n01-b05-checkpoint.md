# AWS SAA-C03 N01-B05 checkpoint

Status: generated and mechanically validated; candidate content remains unapproved and requires human technical/editorial review.

## Scope

- Track: `aws-certified-solutions-architect-associate`
- Node: `identity_federation_and_root_access`
- Mental unit: `federation_iam_identity_center_and_directory_integration`
- Batch: `aws-saa-c03-2026-08-15-AWSSAA-N01-B05`
- Items: 14
- Slots: 14
- Primary skill atom: `workforce_federation_and_central_account_access`
- Taxonomy: `aws-saa-c03-20-node-v2026.08.15`

## Boundary

This batch tests workforce identity architecture: IAM Identity Center organization versus account instances, identity-source ownership, external IdP and SAML boundaries, SCIM provisioning and offboarding, permission-set roles and group assignments, account and portal session behavior, direct SAML federation for a bounded single-account case, AWS Directory Service for domain workloads, canonical permission-set updates, and the workforce MFA boundary. STS mechanics are covered separately in N01-B04; workload roles and access-key lifecycle are covered separately in N01-B03.

## Coverage matrix

| Anchor | Concept | Source |
|---|---|---|
| `workforce-vs-workload` | Central workforce access across accounts | IAM Identity Center |
| `identity-center-org-instance` | Organization instance for multi-account access | IAM Identity Center |
| `one-identity-source` | One identity source per organization | Identity source management |
| `external-idp-saml` | External IdP with central account assignments | IAM Identity Center |
| `scim-provision` | Automatic user/group provisioning | SCIM provisioning |
| `scim-deprovision` | Offboarding and stale assignment checks | SCIM provisioning |
| `permission-set-role` | Managed role generated from a permission set | Permission sets |
| `group-account-assignment` | Group, permission set, account mapping | Permission sets |
| `permission-set-session` | Portal session versus account role session | Permission sets |
| `access-portal-role-choice` | Least-privilege role selection | Permission sets |
| `direct-federation-boundary` | Direct SAML for a bounded single-account case | IAM SAML federation |
| `directory-service-boundary` | Managed Microsoft AD workload boundary | AWS Directory Service |
| `permission-set-propagation` | Permission set as canonical policy owner | Permission sets |
| `central-mfa-boundary` | MFA at the external workforce IdP | Identity source management |

## Quality and provenance

- Every item has one accepted option, four options, full wrong-option explanations, explicit constraints, and direct first-party AWS documentation in `feedback.Details.url`.
- Every item is bound to exactly one slot and one primary skill atom.
- All items are `unapproved`; no item is runtime-admitted.
- The batch keeps Directory Service domain authentication distinct from IAM Identity Center account authorization.

## Verification

`npm run audit:aws-workbook-source` passes with 5 N01 batches, 68 semantic identities, and 68 unique slots. The repository-wide authoring gate remains blocked by pre-existing unrelated coding-interview count reconciliation and malformed Google Cloud JSON containing leading patch markers; neither path was modified for this checkpoint.

## Sources

- [What is IAM Identity Center?](https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html)
- [Manage AWS accounts with permission sets](https://docs.aws.amazon.com/singlesignon/latest/userguide/permissionsetsconcept.html)
- [Manage the identity source](https://docs.aws.amazon.com/singlesignon/latest/userguide/manage-your-identity-source.html)
- [Automatic SCIM provisioning](https://docs.aws.amazon.com/singlesignon/latest/userguide/provision-automatically.html)
- [SAML 2.0 federation](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_saml.html)
- [AWS Directory Service](https://docs.aws.amazon.com/directoryservice/latest/admin-guide/what_is.html)

Next mental unit: `identity_based_authorization_diagnostics` (`AWSSAA-N01-B06`).
