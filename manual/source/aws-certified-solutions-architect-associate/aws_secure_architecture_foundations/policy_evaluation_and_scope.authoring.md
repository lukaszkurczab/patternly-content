# aws-certified-solutions-architect-associate / aws_secure_architecture_foundations / policy_evaluation_and_scope

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 12
- Authoring-admitted slots: 12
- Blocked slots: 0
- Future source path: manual/source/aws-certified-solutions-architect-associate/aws_secure_architecture_foundations/policy_evaluation_and_scope.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### aws-certified-solutions-architect-associate:policy_evaluation_and_scope:effective_access_identity_policies_resource_policies_permission_boundaries_scps_explicit:slot:evaluation-order

- Status: authoring-admitted
- Objective: Assess whether the evidence “multiple policy types apply” supports the owned resolution “order authentication, request context, deny evaluation, and applicable allow checks”.
- Expected decision: order authentication, request context, deny evaluation, and applicable allow checks
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:policy_evaluation_and_scope:effective_access_identity_policies_resource_policies_permission_boundaries_scps_explicit:slot:explicit-deny-precedence

- Status: authoring-admitted
- Objective: Assess whether the evidence “an applicable policy explicitly denies the requested action” supports the owned resolution “resolve the request as denied”.
- Expected decision: resolve the request as denied
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:policy_evaluation_and_scope:effective_access_identity_policies_resource_policies_permission_boundaries_scps_explicit:slot:identity-resource-union

- Status: authoring-admitted
- Objective: Assess whether the evidence “same-account access is allowed by an applicable identity or resource policy without a deny” supports the owned resolution “evaluate the documented union semantics”.
- Expected decision: evaluate the documented union semantics
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:policy_evaluation_and_scope:effective_access_identity_policies_resource_policies_permission_boundaries_scps_explicit:slot:missing-context-key

- Status: authoring-admitted
- Objective: Assess whether the evidence “a conditional allow does not match the request context” supports the owned resolution “diagnose an implicit deny”.
- Expected decision: diagnose an implicit deny
- Decisive boundary: This slot owns the boundary established by a conditional allow does not match the request context; it resolves only to “diagnose an implicit deny” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:policy_evaluation_and_scope:effective_access_identity_policies_resource_policies_permission_boundaries_scps_explicit:slot:permissions-boundary-intersection

- Status: authoring-admitted
- Objective: Assess whether the evidence “an identity policy allows an action outside its permissions boundary” supports the owned resolution “resolve effective access as denied”.
- Expected decision: resolve effective access as denied
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:policy_evaluation_and_scope:effective_access_identity_policies_resource_policies_permission_boundaries_scps_explicit:slot:role-session-principal

- Status: authoring-admitted
- Objective: Assess whether the evidence “a resource policy names a role session rather than the role ARN” supports the owned resolution “apply the documented principal-specific evaluation boundary”.
- Expected decision: apply the documented principal-specific evaluation boundary
- Decisive boundary: This slot owns the boundary established by a resource policy names a role session rather than the role ARN; it resolves only to “apply the documented principal-specific evaluation boundary” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:policy_evaluation_and_scope:effective_access_identity_policies_resource_policies_permission_boundaries_scps_explicit:slot:scp-maximum

- Status: authoring-admitted
- Objective: Assess whether the evidence “an account policy allows an action that its SCP does not allow” supports the owned resolution “resolve effective access as denied”.
- Expected decision: resolve effective access as denied
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:policy_evaluation_and_scope:resource_based_policy_service_access_path_require_delegation_external_principal:slot:kms-key-policy

- Status: authoring-admitted
- Objective: Assess whether the evidence “a principal needs cryptographic use of a customer managed key” supports the owned resolution “use the KMS key policy and required IAM permissions”.
- Expected decision: use the KMS key policy and required IAM permissions
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:policy_evaluation_and_scope:resource_based_policy_service_access_path_require_delegation_external_principal:slot:principal-scope-error

- Status: authoring-admitted
- Objective: Assess whether the evidence “a resource policy trusts an account when only one role was intended” supports the owned resolution “diagnose over-broad delegation”.
- Expected decision: diagnose over-broad delegation
- Decisive boundary: This slot owns the boundary established by a resource policy trusts an account when only one role was intended; it resolves only to “diagnose over-broad delegation” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:policy_evaluation_and_scope:resource_based_policy_service_access_path_require_delegation_external_principal:slot:queue-policy

- Status: authoring-admitted
- Objective: Assess whether the evidence “an SNS topic must publish to an SQS queue” supports the owned resolution “authorize the service path in the queue resource policy”.
- Expected decision: authorize the service path in the queue resource policy
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:policy_evaluation_and_scope:resource_based_policy_service_access_path_require_delegation_external_principal:slot:s3-cross-account-policy

- Status: authoring-admitted
- Objective: Assess whether the evidence “an external account principal needs bucket access” supports the owned resolution “use an S3 bucket policy with the intended principal and actions”.
- Expected decision: use an S3 bucket policy with the intended principal and actions
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:policy_evaluation_and_scope:resource_based_policy_service_access_path_require_delegation_external_principal:slot:service-support-boundary

- Status: authoring-admitted
- Objective: Assess whether the evidence “the target service does not support the required resource-based policy” supports the owned resolution “use a supported identity or role delegation path”.
- Expected decision: use a supported identity or role delegation path
- Decisive boundary: This slot owns the boundary established by the target service does not support the required resource-based policy; it resolves only to “use a supported identity or role delegation path” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
