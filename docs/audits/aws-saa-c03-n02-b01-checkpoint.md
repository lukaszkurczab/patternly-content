# AWS SAA-C03 N02-B01 checkpoint

Status: generated and mechanically validated; candidate content remains unapproved and requires human technical/editorial review.

## Scope

- Track: `aws-certified-solutions-architect-associate`
- Node: `multi_account_governance_and_resource_authorization`
- Mental unit: `organizations_accounts_ous_and_hierarchy`
- Batch: `aws-saa-c03-2026-08-15-AWSSAA-N02-B01`
- Items: 16
- Slots: 16
- Primary skill atom: `organizations_account_hierarchy_and_governance`
- Taxonomy: `aws-saa-c03-20-node-v2026.08.15`

## Boundary

This batch tests account boundaries, the Organizations management/member-account model, centralized account creation, OU placement and inheritance, Control Tower provisioning and enrollment, AWS RAM sharing, central CloudTrail and Config evidence, delegated administration, and account-level cost ownership. SCP evaluation and effective permission diagnostics remain in the next N02 mental unit; detailed cross-account role and resource-policy mechanics remain separate workbook units.

## Coverage matrix

| Anchor | Concept | Source |
|---|---|---|
| `account-boundary` | Account as permission, security, cost, and workload boundary | AWS Organizations |
| `management-member-account` | Management account versus member accounts | Organizations hierarchy |
| `central-account-creation` | Create member accounts centrally | Account creation |
| `member-account-root-move` | Move new account from root to OU | Account movement |
| `ou-purpose` | Environment-specific OU governance | OU management |
| `hierarchy-policy-inheritance` | New OU changes effective governance | OU management |
| `root-policy-scope` | Root-level policy inheritance | Organization management |
| `ou-policy-scope` | OU-scoped policy inheritance | OU management |
| `move-account-effects` | Pre-change effective-policy review | Account movement |
| `control-tower-account-factory` | Governed account creation | Control Tower controls |
| `control-tower-enrollment` | Organizations membership versus Control Tower enrollment | Control Tower controls |
| `ram-org-sharing` | Share supported VPC subnets across accounts | AWS RAM |
| `central-cloudtrail` | Central organization-wide audit evidence | CloudTrail |
| `config-organization-rule` | Configuration compliance across accounts and Regions | AWS Config |
| `delegated-administrator` | Service-specific delegated administration | Organizations service integration |
| `account-cost-boundary` | Account-level chargeback with consolidated billing | AWS Organizations |

## Quality and provenance

- Every item has one accepted option, four options, full wrong-option explanations, explicit constraints, and direct first-party AWS documentation in `feedback.Details.url`.
- Every item is bound to exactly one slot and one primary skill atom.
- All items are `unapproved`; no item is runtime-admitted.
- Account creation through Control Tower is kept distinct from direct Organizations account creation because membership and landing-zone enrollment are different states.

## Verification

`npm run audit:aws-workbook-source` passes with 8 AWS batches and 139 semantic identities across N01 and N02-B01. The repository-wide authoring gate remains blocked by pre-existing unrelated coding-interview count reconciliation and malformed Google Cloud JSON containing leading patch markers.

## Sources

- [What is AWS Organizations?](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_introduction.html)
- [Managing an organization](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_org.html)
- [Creating member accounts](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_accounts_create.html)
- [Managing OUs](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_ous.html)
- [AWS Control Tower controls](https://docs.aws.amazon.com/controltower/latest/userguide/controls.html)
- [AWS RAM](https://docs.aws.amazon.com/ram/latest/userguide/what-is.html)
- [AWS Config](https://docs.aws.amazon.com/config/latest/developerguide/WhatIsConfig.html)
- [AWS CloudTrail](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html)

Next mental unit: `control_tower_and_preventive_detective_guardrails` (`AWSSAA-N02-B02`).
