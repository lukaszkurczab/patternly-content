# aws-certified-solutions-architect-associate / aws_secure_architecture_foundations / principal_and_federation

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 11
- Authoring-admitted slots: 11
- Blocked slots: 0
- Future source path: manual/source/aws-certified-solutions-architect-associate/aws_secure_architecture_foundations/principal_and_federation.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### aws-certified-solutions-architect-associate:principal_and_federation:iam_identity_center_federated_iam_roles_workforce_access_long_lived_iam_users:slot:external-idp-federation

- Status: authoring-admitted
- Objective: Assess whether the evidence “the workforce authenticates in an existing external identity provider” supports the owned resolution “federate identities and issue temporary AWS sessions”.
- Expected decision: federate identities and issue temporary AWS sessions
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:principal_and_federation:iam_identity_center_federated_iam_roles_workforce_access_long_lived_iam_users:slot:long-lived-user-exception

- Status: authoring-admitted
- Objective: Assess whether the evidence “a proposed IAM user exists only to avoid configuring federation” supports the owned resolution “reject long-lived credentials as the default workforce path”.
- Expected decision: reject long-lived credentials as the default workforce path
- Decisive boundary: This slot owns the boundary established by a proposed IAM user exists only to avoid configuring federation; it resolves only to “reject long-lived credentials as the default workforce path” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:principal_and_federation:iam_identity_center_federated_iam_roles_workforce_access_long_lived_iam_users:slot:orphaned-local-users

- Status: authoring-admitted
- Objective: Assess whether the evidence “offboarding in the IdP leaves active IAM users” supports the owned resolution “diagnose the disconnected identity lifecycle”.
- Expected decision: diagnose the disconnected identity lifecycle
- Decisive boundary: This slot owns the boundary established by offboarding in the IdP leaves active IAM users; it resolves only to “diagnose the disconnected identity lifecycle” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:principal_and_federation:iam_identity_center_federated_iam_roles_workforce_access_long_lived_iam_users:slot:permission-set-assignment

- Status: authoring-admitted
- Objective: Assess whether the evidence “a workforce group needs repeatable account access” supports the owned resolution “order permission set definition and account assignment”.
- Expected decision: order permission set definition and account assignment
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:principal_and_federation:iam_identity_center_federated_iam_roles_workforce_access_long_lived_iam_users:slot:workforce-sso

- Status: authoring-admitted
- Objective: Assess whether the evidence “employees need centrally assigned access across AWS accounts” supports the owned resolution “use IAM Identity Center workforce access”.
- Expected decision: use IAM Identity Center workforce access
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:principal_and_federation:iam_roles_aws_workloads_distinct_human_federation_paths:slot:ec2-instance-role

- Status: authoring-admitted
- Objective: Assess whether the evidence “software on EC2 needs AWS API access” supports the owned resolution “attach an instance profile role”.
- Expected decision: attach an instance profile role
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:principal_and_federation:iam_roles_aws_workloads_distinct_human_federation_paths:slot:ecs-task-role

- Status: authoring-admitted
- Objective: Assess whether the evidence “one ECS task needs permissions distinct from the host” supports the owned resolution “use a task role”.
- Expected decision: use a task role
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:principal_and_federation:iam_roles_aws_workloads_distinct_human_federation_paths:slot:embedded-access-key

- Status: authoring-admitted
- Objective: Assess whether the evidence “a deployment contains static AWS access keys” supports the owned resolution “diagnose a credential-lifecycle and exposure defect”.
- Expected decision: diagnose a credential-lifecycle and exposure defect
- Decisive boundary: This slot owns the boundary established by a deployment contains static AWS access keys; it resolves only to “diagnose a credential-lifecycle and exposure defect” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:principal_and_federation:iam_roles_aws_workloads_distinct_human_federation_paths:slot:human-role-boundary

- Status: authoring-admitted
- Objective: Assess whether the evidence “a person needs federated access, not a workload credential path” supports the owned resolution “keep workforce federation distinct”.
- Expected decision: keep workforce federation distinct
- Decisive boundary: This slot owns the boundary established by a person needs federated access, not a workload credential path; it resolves only to “keep workforce federation distinct” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:principal_and_federation:iam_roles_aws_workloads_distinct_human_federation_paths:slot:lambda-execution-role

- Status: authoring-admitted
- Objective: Assess whether the evidence “a Lambda function needs temporary service permissions” supports the owned resolution “use its execution role”.
- Expected decision: use its execution role
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:principal_and_federation:iam_roles_aws_workloads_distinct_human_federation_paths:slot:workload-move

- Status: authoring-admitted
- Objective: Assess whether the evidence “code moves from EC2 to Lambda” supports the owned resolution “move permissions to the new compute service role without creating a user”.
- Expected decision: move permissions to the new compute service role without creating a user
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
