# aws-certified-solutions-architect-associate / aws_secure_architecture_foundations / shared_responsibility_and_scope

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 11
- Authoring-admitted slots: 11
- Blocked slots: 0
- Future source path: manual/source/aws-certified-solutions-architect-associate/aws_secure_architecture_foundations/shared_responsibility_and_scope.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### aws-certified-solutions-architect-associate:shared_responsibility_and_scope:patching_configuration_identity_data_protection_controls_aws_customer_aws_service_model:slot:data-and-identity-control

- Status: authoring-admitted
- Objective: Assess whether the evidence “a managed service stores customer data and uses customer policies” supports the owned resolution “retain customer ownership of data classification and access configuration”.
- Expected decision: retain customer ownership of data classification and access configuration
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:shared_responsibility_and_scope:patching_configuration_identity_data_protection_controls_aws_customer_aws_service_model:slot:ec2-guest-patching

- Status: authoring-admitted
- Objective: Assess whether the evidence “an EC2 guest operating system and application stack need security updates” supports the owned resolution “assign guest patching to the customer”.
- Expected decision: assign guest patching to the customer
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:shared_responsibility_and_scope:patching_configuration_identity_data_protection_controls_aws_customer_aws_service_model:slot:managed-service-platform-patching

- Status: authoring-admitted
- Objective: Assess whether the evidence “an S3 or DynamoDB platform layer needs patching” supports the owned resolution “assign platform patching to AWS”.
- Expected decision: assign platform patching to AWS
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:shared_responsibility_and_scope:patching_configuration_identity_data_protection_controls_aws_customer_aws_service_model:slot:misassigned-security-group

- Status: authoring-admitted
- Objective: Assess whether the evidence “an exposed EC2 workload is blamed on AWS despite a permissive customer security group” supports the owned resolution “diagnose customer configuration ownership”.
- Expected decision: diagnose customer configuration ownership
- Decisive boundary: This slot owns the boundary established by an exposed EC2 workload is blamed on AWS despite a permissive customer security group; it resolves only to “diagnose customer configuration ownership” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:shared_responsibility_and_scope:patching_configuration_identity_data_protection_controls_aws_customer_aws_service_model:slot:rds-shared-maintenance

- Status: authoring-admitted
- Objective: Assess whether the evidence “RDS engine maintenance involves AWS service work and a customer-selected maintenance window” supports the owned resolution “separate provider work from customer scheduling responsibility”.
- Expected decision: separate provider work from customer scheduling responsibility
- Decisive boundary: This slot owns the boundary established by RDS engine maintenance involves AWS service work and a customer-selected maintenance window; it resolves only to “separate provider work from customer scheduling responsibility” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:shared_responsibility_and_scope:security_governance_organization_account_vpc_workload_resource_scope:slot:account-scope

- Status: authoring-admitted
- Objective: Assess whether the evidence “a control applies to one workload account and must not affect peers” supports the owned resolution “place the control at account scope”.
- Expected decision: place the control at account scope
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:shared_responsibility_and_scope:security_governance_organization_account_vpc_workload_resource_scope:slot:organization-scope

- Status: authoring-admitted
- Objective: Assess whether the evidence “a guardrail must cap permissions for every account in an OU” supports the owned resolution “place the control at Organizations or OU scope”.
- Expected decision: place the control at Organizations or OU scope
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:shared_responsibility_and_scope:security_governance_organization_account_vpc_workload_resource_scope:slot:resource-exception

- Status: authoring-admitted
- Objective: Assess whether the evidence “one S3 bucket needs a stricter resource policy without broad account impact” supports the owned resolution “use a resource-scoped control”.
- Expected decision: use a resource-scoped control
- Decisive boundary: This slot owns the boundary established by one S3 bucket needs a stricter resource policy without broad account impact; it resolves only to “use a resource-scoped control” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:shared_responsibility_and_scope:security_governance_organization_account_vpc_workload_resource_scope:slot:scope-expansion

- Status: authoring-admitted
- Objective: Assess whether the evidence “a local exception becomes an organization-wide invariant” supports the owned resolution “move ownership upward only after scope materially expands”.
- Expected decision: move ownership upward only after scope materially expands
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:shared_responsibility_and_scope:security_governance_organization_account_vpc_workload_resource_scope:slot:vpc-scope

- Status: authoring-admitted
- Objective: Assess whether the evidence “the rule governs network paths shared by subnets in one VPC” supports the owned resolution “place the control at VPC or network scope”.
- Expected decision: place the control at VPC or network scope
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:shared_responsibility_and_scope:security_governance_organization_account_vpc_workload_resource_scope:slot:workload-scope

- Status: authoring-admitted
- Objective: Assess whether the evidence “the control belongs to one application identity or deployment” supports the owned resolution “place the control on the workload”.
- Expected decision: place the control on the workload
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
