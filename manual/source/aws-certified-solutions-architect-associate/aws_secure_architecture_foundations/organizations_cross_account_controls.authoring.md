# aws-certified-solutions-architect-associate / aws_secure_architecture_foundations / organizations_cross_account_controls

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 12
- Authoring-admitted slots: 12
- Blocked slots: 0
- Future source path: manual/source/aws-certified-solutions-architect-associate/aws_secure_architecture_foundations/organizations_cross_account_controls.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### aws-certified-solutions-architect-associate:organizations_cross_account_controls:aws_organizations_scps_limit_maximum_permissions_across_accounts_ous:slot:account-move

- Status: authoring-admitted
- Objective: Assess whether the evidence “an account moves to an OU with a stricter SCP” supports the owned resolution “re-evaluate effective permissions after inheritance changes”.
- Expected decision: re-evaluate effective permissions after inheritance changes
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:organizations_cross_account_controls:aws_organizations_scps_limit_maximum_permissions_across_accounts_ous:slot:allow-list-gap

- Status: authoring-admitted
- Objective: Assess whether the evidence “an allow-list SCP omits a service required by a workload” supports the owned resolution “diagnose the maximum-permission denial”.
- Expected decision: diagnose the maximum-permission denial
- Decisive boundary: This slot owns the boundary established by an allow-list SCP omits a service required by a workload; it resolves only to “diagnose the maximum-permission denial” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:organizations_cross_account_controls:aws_organizations_scps_limit_maximum_permissions_across_accounts_ous:slot:management-account-boundary

- Status: authoring-admitted
- Objective: Assess whether the evidence “a proposed SCP assumes identical effect on the management account” supports the owned resolution “apply documented management-account limits”.
- Expected decision: apply documented management-account limits
- Decisive boundary: This slot owns the boundary established by a proposed SCP assumes identical effect on the management account; it resolves only to “apply documented management-account limits” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:organizations_cross_account_controls:aws_organizations_scps_limit_maximum_permissions_across_accounts_ous:slot:ou-inheritance

- Status: authoring-admitted
- Objective: Assess whether the evidence “an account inherits SCPs through its parent hierarchy” supports the owned resolution “evaluate the effective maximum across the path”.
- Expected decision: evaluate the effective maximum across the path
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:organizations_cross_account_controls:aws_organizations_scps_limit_maximum_permissions_across_accounts_ous:slot:root-and-member-scope

- Status: authoring-admitted
- Objective: Assess whether the evidence “a guardrail is attached at the organization root” supports the owned resolution “apply it to member accounts under that root”.
- Expected decision: apply it to member accounts under that root
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:organizations_cross_account_controls:aws_organizations_scps_limit_maximum_permissions_across_accounts_ous:slot:scp-does-not-grant

- Status: authoring-admitted
- Objective: Assess whether the evidence “an SCP allows an action but no identity or resource policy grants it” supports the owned resolution “resolve that the SCP grants nothing”.
- Expected decision: resolve that the SCP grants nothing
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:organizations_cross_account_controls:cross_account_access_through_trusted_role_correctly_scoped_trust_permission_policies:slot:caller-permission

- Status: authoring-admitted
- Objective: Assess whether the evidence “the external identity lacks sts:AssumeRole permission” supports the owned resolution “add only the caller-side assume-role permission”.
- Expected decision: add only the caller-side assume-role permission
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:organizations_cross_account_controls:cross_account_access_through_trusted_role_correctly_scoped_trust_permission_policies:slot:external-id

- Status: authoring-admitted
- Objective: Assess whether the evidence “a third party assumes customer roles” supports the owned resolution “require and validate an external ID where documented”.
- Expected decision: require and validate an external ID where documented
- Decisive boundary: This slot owns the boundary established by a third party assumes customer roles; it resolves only to “require and validate an external ID where documented” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:organizations_cross_account_controls:cross_account_access_through_trusted_role_correctly_scoped_trust_permission_policies:slot:permission-without-trust

- Status: authoring-admitted
- Objective: Assess whether the evidence “the caller is allowed but the role trust excludes it” supports the owned resolution “diagnose the missing resource-side trust”.
- Expected decision: diagnose the missing resource-side trust
- Decisive boundary: This slot owns the boundary established by the caller is allowed but the role trust excludes it; it resolves only to “diagnose the missing resource-side trust” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:organizations_cross_account_controls:cross_account_access_through_trusted_role_correctly_scoped_trust_permission_policies:slot:trust-policy-principal

- Status: authoring-admitted
- Objective: Assess whether the evidence “the role must trust one external role rather than an entire account” supports the owned resolution “scope the trust principal narrowly”.
- Expected decision: scope the trust principal narrowly
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:organizations_cross_account_controls:cross_account_access_through_trusted_role_correctly_scoped_trust_permission_policies:slot:trust-without-permission

- Status: authoring-admitted
- Objective: Assess whether the evidence “the trust policy is correct but the caller has no allow” supports the owned resolution “diagnose the missing caller-side permission”.
- Expected decision: diagnose the missing caller-side permission
- Decisive boundary: This slot owns the boundary established by the trust policy is correct but the caller has no allow; it resolves only to “diagnose the missing caller-side permission” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:organizations_cross_account_controls:cross_account_access_through_trusted_role_correctly_scoped_trust_permission_policies:slot:two-sided-cross-account

- Status: authoring-admitted
- Objective: Assess whether the evidence “a role in one account must be assumed by another account” supports the owned resolution “configure trust policy and caller permission”.
- Expected decision: configure trust policy and caller permission
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
