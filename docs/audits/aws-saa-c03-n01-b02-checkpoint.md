# AWS SAA-C03 authoring checkpoint — AWSSAA-N01-B02

Date: 2026-08-15  
Status: generated and mechanically validated; pending human technical and editorial review

## Ownership

- Node: `identity_federation_and_root_access`
- Mental unit: `iam_users_groups_roles_and_policy_evaluation`
- Stable mental-unit ID: `AWSSAA-N01-B02`
- Batch: `aws-saa-c03-2026-08-15-AWSSAA-N01-B02`
- Candidate item count: 12

## Primary mental model

Treat IAM users, groups, and roles as different identity mechanisms, then evaluate effective authorization from the exact principal, policy type, account relationship, conditions, and limiting boundary.

## Coverage matrix

| Dimension | Covered cases |
| --- | --- |
| Identity selection | Long-lived IAM user only as a constrained legacy exception; group membership for shared user permissions |
| Role mechanics | Trust policy versus role permissions policy |
| Same-account evaluation | Resource-policy and identity-policy union; explicit-deny precedence |
| Limits and guardrails | Permissions-boundary intersection; Organizations SCP maximum |
| Cross-account evaluation | Caller-side `sts:AssumeRole` permission plus target-side trust |
| Conditional authorization | MFA context key causes a conditional allow not to match |
| Session diagnostics | Assumed-role session principal must be considered during resource-policy analysis |

## Saturation and boundary

The first pass covers one distinct case for each planned anchor. Additional items are deferred until the coverage-gap pass identifies a new policy type, principal relationship, condition, failure mode, or transfer case; changing resource names or repeating the same evaluation rule would be a duplicate. Root-user safeguards remain owned by `AWSSAA-N01-B01`. STS credential issuance, role switching workflows, federation, and IAM Identity Center remain separate units.

## Verification

- JSON parse: passed.
- Certification source schema: passed.
- Track-local AWS workbook-source validator: passed.
- Batch items: 12; declared slots: 12; unique semantic identities across N01-B01 and N01-B02: 28.
- Human technical review: pending.
- Human editorial review: pending.
- Runtime admission, activation, and publication: not performed.
