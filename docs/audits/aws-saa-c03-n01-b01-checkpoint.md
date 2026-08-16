# AWS SAA-C03 authoring checkpoint — AWSSAA-N01-B01

Date: 2026-08-15  
Status: generated and mechanically validated; pending human technical and editorial review

## Ownership

- Node: `identity_federation_and_root_access`
- Mental unit: `shared_responsibility_and_root_access`
- Stable mental-unit ID: `AWSSAA-N01-B01`
- Batch: `aws-saa-c03-2026-08-15-AWSSAA-N01-B01`
- Source: `manual/source/aws-certified-solutions-architect-associate/identity_federation_and_root_access/shared_responsibility_and_root_access.json`
- Candidate item count: 16

## Primary mental model

Choose and operate the AWS account access path by separating the account root user's exceptional authority from normal administration, then assign security controls to AWS or the customer according to the selected service boundary.

The unit owns root-user safeguards, root recovery, member-account root controls, and shared-responsibility assignment. It does not own IAM users/groups/roles as identity mechanisms, STS session mechanics, federation configuration, or general policy evaluation.

## Coverage matrix

| Dimension | Covered cases |
| --- | --- |
| Root access boundary | Daily administration uses an administrative identity; root is reserved for documented root-only tasks |
| Credential lifecycle | No root access keys for workloads; temporary role credentials are the adjacent canonical path |
| Authentication protection | Root MFA and account-recovery channels |
| Human control | Multi-person approval and durable group-email ownership |
| Detection | Root-use monitoring through recorded events and alert routing |
| Organizations | Centralized root access for member accounts and SCP restriction of active member root users |
| Control applicability | Root is not an IAM user/role for permissions-boundary or identity-policy attachment |
| Shared responsibility | EC2 guest patching, EC2 security-group configuration, managed-service platform operation, RDS maintenance planning |
| Service-boundary transfer | RDS versus EC2 when the decisive requirement is reducing platform operations without removing customer data/configuration responsibility |

## Semantic audit

- Every item has exactly one primary mental-unit skill atom: `shared_responsibility_root_user_safeguards`.
- Every item has one decisive architectural decision and explicit constraints.
- All 16 items are single-choice with one accepted answer and a distractor explanation for every rejected option.
- Item identities are unique within the batch; the local AWS workbook-source validator reports 16 unique semantic identities.
- No item relies on a price, quota, console navigation, or unstable regional fact.
- Direct sources are first-party AWS pages. No exam-dump, recalled-question, commercial practice-bank, or partner-course wording was used.

## Sources

- SAA-C03 scope: https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03.html
- Domain 1: https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03-domain1.html
- Shared responsibility: https://aws.amazon.com/compliance/shared-responsibility-model/
- Root safeguards: https://docs.aws.amazon.com/IAM/latest/UserGuide/root-user-best-practices.html
- Root identity and root-only tasks: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_root-user.html
- Root MFA: https://docs.aws.amazon.com/IAM/latest/UserGuide/enable-mfa-for-root.html
- Centralized member-account root access: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_root-enable-root-access.html
- Organizations SCPs: https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html
- IAM policy applicability: https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html

## Verification and remaining review

- JSON parse: passed.
- Certification source schema: passed.
- Track-local AWS workbook-source validator: passed.
- Repository-wide authoring validation: not attributable to this batch because the pre-existing `config/curricula/google-cloud-associate-cloud-engineer.json` contains patch-marker lines beginning with `+`, so the shared manifest cannot be built. The unrelated malformed file was not changed.
- Human technical review: pending.
- Human editorial review: pending.
- Runtime admission, activation, and publication: not performed.

The next unit is `AWSSAA-N01-B02`, the canonical IAM users, groups, roles, and policy-evaluation boundary. It must not duplicate the root safeguards above.
