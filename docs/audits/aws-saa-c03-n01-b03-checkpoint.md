# AWS SAA-C03 N01-B03 checkpoint

Status: generated and mechanically validated; candidate content remains unapproved and requires human technical/editorial review.

## Scope

- Track: `aws-certified-solutions-architect-associate`
- Node: `identity_federation_and_root_access`
- Mental unit: `least_privilege_mfa_and_credential_lifecycle`
- Batch: `aws-saa-c03-2026-08-15-AWSSAA-N01-B03`
- Items: 14
- Slots: 14
- Primary skill atom: `least_privilege_mfa_and_credential_lifecycle`
- Taxonomy: `aws-saa-c03-20-node-v2026.08.15`

## Boundary

This batch tests identity authorization minimization and credential hygiene: action/resource scope, conditions, evidence-based policy tightening, role preference for AWS workloads, access-key lifecycle, credential inventory, MFA controls, human privileged elevation, and the limits of observation windows. STS session mechanics, role switching, and federation implementation are authored as separate mental units so the items retain one dominant diagnostic concept.

## Coverage matrix

| Anchor | Concept | Source |
|---|---|---|
| `s3-prefix-scope` | Object-level action and prefix scope | IAM policies |
| `action-resource-pair` | Metadata action versus data-plane action | DynamoDB IAM permissions |
| `condition-narrowing` | Tag condition as an enforcement boundary | IAM condition keys |
| `policy-generation-evidence` | Access Analyzer policy generation from activity | IAM Access Analyzer |
| `role-over-access-key` | AWS workload role and temporary credentials | IAM workload guidance |
| `key-rotation-sequence` | Deploy, deactivate, observe, delete | IAM access keys |
| `inactive-key-cleanup` | Remove unowned long-term credentials | IAM access keys |
| `credential-report` | Account-level IAM credential inventory | IAM credential reports |
| `mfa-console` | Individual MFA for human console identities | IAM MFA |
| `mfa-sensitive-api` | MFA context condition for sensitive APIs | IAM global condition keys |
| `mfa-condition-limit` | Do not impose human MFA indiscriminately on workload roles | IAM global condition keys |
| `mfa-role-assumption` | MFA at the human role-assumption boundary | IAM global condition keys |
| `separate-admin-identity` | Daily identity versus privileged role | IAM best practices |
| `least-privilege-observation` | Activity evidence plus complete workload contract | IAM Access Analyzer |

## Quality and provenance

- Every item has one accepted option, four options, full wrong-option explanations, explicit constraints, and direct first-party AWS documentation in `feedback.Details.url`.
- Every item is bound to exactly one slot and one primary skill atom.
- All items are `unapproved`; no item is runtime-admitted.
- The file deliberately does not add STS/federation content to this unit.

## Verification

`npm run audit:aws-workbook-source` passes with 4 N01 batches, 54 semantic identities, and 54 unique slots. The repository-wide authoring gate remains blocked by pre-existing unrelated coding-interview count reconciliation and malformed Google Cloud JSON containing leading patch markers; neither path was modified for this checkpoint.

## Sources

- [IAM policies and permissions](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html)
- [DynamoDB IAM permissions reference](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/api-permissions-reference.html)
- [IAM global condition keys](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_condition-keys.html)
- [IAM Access Analyzer policy generation](https://docs.aws.amazon.com/IAM/latest/UserGuide/access-analyzer-policy-generation.html)
- [IAM workload credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/getting-started-workloads.html)
- [IAM access keys](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)
- [IAM credential reports](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_getting-report.html)
- [IAM MFA](https://docs.aws.amazon.com/IAM/latest/UserGuide/gs-identities-mfa.html)
- [IAM security best practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)

Next mental unit: `sts_temporary_credentials_and_role_switching` (`AWSSAA-N01-B04`).
