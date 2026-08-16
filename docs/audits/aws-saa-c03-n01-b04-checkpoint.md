# AWS SAA-C03 N01-B04 checkpoint

Status: generated and mechanically validated; candidate content remains unapproved and requires human technical/editorial review.

## Scope

- Track: `aws-certified-solutions-architect-associate`
- Node: `identity_federation_and_root_access`
- Mental unit: `sts_temporary_credentials_and_role_switching`
- Batch: `aws-saa-c03-2026-08-15-AWSSAA-N01-B04`
- Items: 12
- Slots: 12
- Primary skill atom: `sts_temporary_credentials_and_role_sessions`
- Taxonomy: `aws-saa-c03-20-node-v2026.08.15`

## Boundary

This batch tests the STS role-session mechanism: temporary credential components and expiry, `AssumeRole`, duration limits, refresh, same- and cross-account role assumption, external IDs for third-party access, session-policy intersection, session attribution, role chaining, EC2 instance-profile credentials, and source identity. IAM policy evaluation remains bounded to the specific STS session behavior needed by each item; workforce federation is a separate mental unit.

## Coverage matrix

| Anchor | Concept | Source |
|---|---|---|
| `temp-credential-components` | Access key, secret, token, expiry | Temporary credentials |
| `assume-role-api` | STS `AssumeRole` contract | STS API |
| `role-session-duration` | Role maximum session duration | IAM role management |
| `credential-expiration-refresh` | Refresh before temporary expiry | Temporary credentials |
| `same-account-role-switch` | Human elevation through a role | IAM role switching |
| `cross-account-trust` | Source permission plus target trust | Cross-account evaluation |
| `external-id-third-party` | Confused-deputy mitigation | Third-party roles |
| `session-policy-intersection` | Session restriction cannot expand role access | IAM session policies |
| `role-session-name` | Session-level audit correlation | STS `AssumeRole` |
| `role-chaining-limit` | One-hour chained-session maximum | IAM role management |
| `instance-profile-temp-creds` | EC2 role credentials through metadata | EC2 role guidance |
| `source-identity-audit` | Preserve original caller context | STS `AssumeRole` |

## Quality and provenance

- Every item has one accepted option, four options, full wrong-option explanations, explicit constraints, and direct first-party AWS documentation in `feedback.Details.url`.
- Every item is bound to exactly one slot and one primary skill atom.
- All items are `unapproved`; no item is runtime-admitted.
- The file does not turn a role session into a substitute for root credentials or a hidden long-term secret.

## Verification

`npm run audit:aws-workbook-source` passes with 4 N01 batches, 54 semantic identities, and 54 unique slots. The repository-wide authoring gate remains blocked by pre-existing unrelated coding-interview count reconciliation and malformed Google Cloud JSON containing leading patch markers; neither path was modified for this checkpoint.

## Sources

- [Temporary security credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp.html)
- [STS AssumeRole](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html)
- [IAM role session management](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_manage-assume.html)
- [Console role switching](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_switch-role-console.html)
- [Cross-account evaluation logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic-cross-account.html)
- [Third-party role access](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_common-scenarios_third-party.html)
- [EC2 instance roles](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_switch-role-ec2.html)
- [IAM policies and session policies](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html)

Next mental unit: `federation_iam_identity_center_and_directory_integration` (`AWSSAA-N01-B05`).
