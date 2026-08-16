# AWS SAA-C03 N01-B06 checkpoint

Status: generated and mechanically validated; candidate content remains unapproved and requires human technical/editorial review.

## Scope

- Track: `aws-certified-solutions-architect-associate`
- Node: `identity_federation_and_root_access`
- Mental unit: `identity_based_authorization_diagnostics`
- Batch: `aws-saa-c03-2026-08-15-AWSSAA-N01-B06`
- Items: 14
- Slots: 14
- Primary skill atom: `identity_authorization_diagnostics`
- Taxonomy: `aws-saa-c03-20-node-v2026.08.15`

## Boundary

This batch diagnoses effective authorization rather than introducing another identity type: exact principal/action/resource matching, implicit and explicit denies, same-account policy unions, cross-account two-sided authorization, permissions boundaries, SCP maximums, condition context, expired sessions, session-policy restriction, CloudTrail identity attribution, policy simulation, policy validation, last-accessed evidence, and regional resource ARN mismatch. The batch intentionally cross-references earlier identity and STS mechanisms only as diagnostic evidence.

## Coverage matrix

| Anchor | Concept | Source |
|---|---|---|
| `exact-principal-action-resource` | Match request to policy scope | AccessDenied troubleshooting |
| `implicit-vs-explicit` | Missing allow versus explicit deny | AccessDenied troubleshooting |
| `same-account-policy-union` | Same-account identity/resource policy evaluation | Evaluation logic |
| `cross-account-two-sided-diagnostic` | Source and resource account grants | Cross-account evaluation |
| `boundary-intersection` | Permissions boundary maximum | Evaluation logic |
| `scp-intersection` | Organization SCP maximum | Evaluation logic |
| `condition-context` | Request/resource context matching | AccessDenied troubleshooting |
| `expired-temporary-credentials` | Credential expiry before policy changes | AccessDenied troubleshooting |
| `session-policy-diagnostic` | Session policy intersection | AccessDenied troubleshooting |
| `cloudtrail-user-identity` | Assumed-role identity attribution | CloudTrail userIdentity |
| `policy-simulator` | What-if principal authorization | IAM policy simulator |
| `policy-validation` | Static policy errors and warnings | IAM Access Analyzer |
| `last-accessed-limit` | Activity evidence is not full contract | IAM last accessed |
| `resource-arn-mismatch` | Exact regional key resource scope | AccessDenied troubleshooting |

## Quality and provenance

- Every item has one accepted option, four options, full wrong-option explanations, explicit constraints, and direct first-party AWS documentation in `feedback.Details.url`.
- Every item is bound to exactly one slot and one primary skill atom.
- All items are `unapproved`; no item is runtime-admitted.
- Diagnostic items keep authorization, credential validity, and network/service behavior as separate failure classes wherever the scenario permits.

## Verification

`npm run audit:aws-workbook-source` passes with 6 N01 batches, 82 semantic identities, and 82 unique slots. The repository-wide authoring gate remains blocked by pre-existing unrelated coding-interview count reconciliation and malformed Google Cloud JSON containing leading patch markers; neither path was modified for this checkpoint.

## Sources

- [IAM policy evaluation logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html)
- [Troubleshoot AccessDenied](https://docs.aws.amazon.com/IAM/latest/UserGuide/troubleshoot_access-denied.html)
- [Cross-account evaluation logic](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic-cross-account.html)
- [IAM policy simulator](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_testing-policies.html)
- [IAM Access Analyzer policy validation](https://docs.aws.amazon.com/IAM/latest/UserGuide/access-analyzer-policy-validation.html)
- [CloudTrail userIdentity](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-event-reference-user-identity.html)
- [IAM last-accessed information](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_last-accessed.html)

N01 mental units authored: B01–B06. Next workbook node: `multi_account_governance_and_resource_authorization` (`AWSSAA-N02`).
