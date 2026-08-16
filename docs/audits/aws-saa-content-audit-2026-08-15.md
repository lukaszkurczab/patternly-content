# AWS SAA-C03 content audit — 2026-08-15

## Scope and source precedence

The reviewed workbook is:

`patternly_aws-certified-solutions-architect-associate_2026-08-15.xlsx`

The workbook is a planning and cross-check artifact, not a learner-question bank. It contains three sheets, no existing questions, 20 cross-checked nodes, 133 counted mental blocks, and a target of 2,670 questions. The AWS SAA-C03 exam guide and direct AWS service documentation are authoritative for technical claims. The Architecting on AWS course is used only as a secondary breadth check.

## Findings

### Accepted as useful

- The four official domains are represented with the published weights: 30%, 26%, 24%, and 20%.
- The 14 task statements are represented: 3 secure, 2 resilient, 5 high-performing, and 4 cost-optimized.
- The workbook covers 189 normalized Knowledge/Skills rows: 107 Knowledge and 82 Skills.
- The in-scope service-category and Technologies and Concepts cross-checks are useful as coverage checks.
- The workbook correctly reports zero existing, admitted, and source-ready questions. It is not pretending that a planned count is authored content.

### Corrections applied to the authoring interpretation

1. The workbook's `193/193` must not be described as 193 official exam requirements. It is 189 official Knowledge/Skills rows plus four cross-cutting capability checks. The row `Use Well-Architected design reasoning without reducing it to trivia` is an internal authoring rule, not an AWS exam-guide requirement.
2. A node outline is not a mental-unit definition. Several outlines combine multiple independent decisions—for example, API integration, queues, events, workflows, retries, buffering, and throttling. Questions will not be authored directly from those broad outlines.
3. The target of more than 120 questions per node is a capacity target only. It is not evidence that the resulting questions are unique, source-backed, or pedagogically valid. Every new question must add a distinct decision, boundary, failure diagnosis, or transfer case.
4. The official exam guide and direct service documentation, rather than the training-breadth count, decide whether an answer is technically correct. AWS explicitly states that the published technology and service lists are non-exhaustive and subject to change.
5. The first authoring slice is one bounded policy-evaluation unit: `policy_evaluation_and_scope` with the direct AWS anchors `explicit-deny-precedence`, `identity-resource-union`, `permissions-boundary-intersection`, and `scp-maximum`. The workbook supplied the conceptual cases; the current repository slot IDs are used only as the authoring integration contract because the runtime validator rejects unknown workbook IDs. The repository curriculum is not treated as the technical source of truth.

6. The current certification source schema does not expose every requested editorial dimension as a serializable field (for example, learning stage, pattern variant, problem archetype, or difficulty). Those dimensions are reviewed against the slot intent and recorded in the audit, without changing the runtime contract or adding unsupported metadata to the question source.

## First batch decision

The first batch is `aws-saa-c03-2026-08-15-policy-evaluation-b01` at:

`manual/source/aws-certified-solutions-architect-associate/aws_secure_architecture_foundations/policy_evaluation_and_scope.json`

It contains four single-choice questions. Each question has exactly one slot-specific primary anchor within the shared policy-evaluation skill atom:

- explicit deny overriding an allow;
- same-account identity/resource policy union;
- permissions-boundary intersection;
- SCP maximum permissions in a member account.

The batch is marked `unapproved`. It is eligible for the existing certification choice modes because its questions are self-contained, scenario-shaped, and have complete wrong-option feedback. It is not treated as runtime-admitted or release-ready.

### Post-batch audit — B01

- Schema and canonical source validation: passed.
- `batchId`, `itemId`, `slotId`, option, and accepted-option uniqueness: passed.
- Canonical slot path, slot roster, taxonomy, interaction contract, mode eligibility, and source binding: passed.
- One primary anchor per question: passed. The four anchors are distinct cases under the same policy-evaluation skill atom; no question combines two of them.
- Choice contract: passed. All four items are single-choice with exactly one accepted answer and a concrete explanation for every distractor.
- Assumptions: passed. Account relationship, principal type, matching resources/actions, boundary/SCP applicability, and absence of additional denies are explicit where material.
- Manual semantic review: passed. The questions test deny precedence, same-account union, boundary intersection, and SCP maximum permissions; they do not duplicate each other's decisive mechanism.
- Correction made during the audit: the batch validator now compares `topicId` and `skillAtomId` to the canonical slot taxonomy and checks exact cross-batch IDs/content identity. The earlier validator had incorrectly compared them to the batch node/block IDs.

## Authoring rule for subsequent batches

After every batch:

1. validate the source JSON against the certification schema;
2. check batch, item, slot, and option uniqueness;
3. check that scoring and feedback keys match the interaction contract;
4. check that all source references are first-party AWS URLs;
5. check that every question binds exactly one primary anchor and that the batch does not mix unrelated skill atoms;
6. perform a manual semantic audit for ambiguity, hidden assumptions, distractor realism, and duplicate reasoning;
7. correct the batch before authoring the next one.

Technical reference pages used for this slice:

- AWS SAA-C03 exam guide: `https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03.html`
- AWS SAA-C03 Domain 1: `https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03/solutions-architect-associate-03-domain1.html`
- IAM policy evaluation: `https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html`
- Permissions boundaries: `https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_boundaries.html`
- Service control policies: `https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html`
- Official Architecting on AWS course outline: `https://d1.awsstatic.com/onedam/marketing-channels/website/aws/en_US/training/approved/pdfs/classroom-training/architecting-on-aws.pdf`
