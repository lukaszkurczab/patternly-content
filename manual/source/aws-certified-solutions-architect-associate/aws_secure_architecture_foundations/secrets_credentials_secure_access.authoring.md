# aws-certified-solutions-architect-associate / aws_secure_architecture_foundations / secrets_credentials_secure_access

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 12
- Authoring-admitted slots: 12
- Blocked slots: 0
- Future source path: manual/source/aws-certified-solutions-architect-associate/aws_secure_architecture_foundations/secrets_credentials_secure_access.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### aws-certified-solutions-architect-associate:secrets_credentials_secure_access:attach_iam_roles_compute_instead_embedding_access_keys_code_configuration:slot:ec2-instance-profile

- Status: authoring-admitted
- Objective: Assess whether the evidence “EC2 software needs S3 read access” supports the owned resolution “attach a least-privilege role through an instance profile”.
- Expected decision: attach a least-privilege role through an instance profile
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:secrets_credentials_secure_access:attach_iam_roles_compute_instead_embedding_access_keys_code_configuration:slot:lambda-role

- Status: authoring-admitted
- Objective: Assess whether the evidence “a Lambda function needs DynamoDB access” supports the owned resolution “grant it through the execution role”.
- Expected decision: grant it through the execution role
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:secrets_credentials_secure_access:attach_iam_roles_compute_instead_embedding_access_keys_code_configuration:slot:metadata-credential-copy

- Status: authoring-admitted
- Objective: Assess whether the evidence “code copies temporary role credentials into configuration” supports the owned resolution “diagnose unnecessary credential handling”.
- Expected decision: diagnose unnecessary credential handling
- Decisive boundary: This slot owns the boundary established by code copies temporary role credentials into configuration; it resolves only to “diagnose unnecessary credential handling” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:secrets_credentials_secure_access:attach_iam_roles_compute_instead_embedding_access_keys_code_configuration:slot:non-aws-external-workload

- Status: authoring-admitted
- Objective: Assess whether the evidence “software outside AWS cannot attach an AWS compute role” supports the owned resolution “use a supported federation path instead”.
- Expected decision: use a supported federation path instead
- Decisive boundary: This slot owns the boundary established by software outside AWS cannot attach an AWS compute role; it resolves only to “use a supported federation path instead” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:secrets_credentials_secure_access:attach_iam_roles_compute_instead_embedding_access_keys_code_configuration:slot:service-migration

- Status: authoring-admitted
- Objective: Assess whether the evidence “the workload moves between compute services” supports the owned resolution “rebind least privilege to the destination service role”.
- Expected decision: rebind least privilege to the destination service role
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:secrets_credentials_secure_access:attach_iam_roles_compute_instead_embedding_access_keys_code_configuration:slot:task-execution-vs-task-role

- Status: authoring-admitted
- Objective: Assess whether the evidence “an ECS task pulls an image and the application calls AWS APIs” supports the owned resolution “separate execution-role and task-role permissions”.
- Expected decision: separate execution-role and task-role permissions
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:secrets_credentials_secure_access:store_rotate_database_api_credentials_secrets_manager_applications_need_retrievable_rota:slot:api-key-to-iam

- Status: authoring-admitted
- Objective: Assess whether the evidence “a service integration can replace a shared API key with IAM authentication” supports the owned resolution “remove the retrievable secret when no secret is needed”.
- Expected decision: remove the retrievable secret when no secret is needed
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:secrets_credentials_secure_access:store_rotate_database_api_credentials_secrets_manager_applications_need_retrievable_rota:slot:managed-rotation

- Status: authoring-admitted
- Objective: Assess whether the evidence “a supported database secret must rotate automatically” supports the owned resolution “configure rotation and the required rotation function or managed strategy”.
- Expected decision: configure rotation and the required rotation function or managed strategy
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:secrets_credentials_secure_access:store_rotate_database_api_credentials_secrets_manager_applications_need_retrievable_rota:slot:parameter-not-secret

- Status: authoring-admitted
- Objective: Assess whether the evidence “a non-sensitive configuration value does not need secret rotation” supports the owned resolution “keep it in an appropriate configuration store”.
- Expected decision: keep it in an appropriate configuration store
- Decisive boundary: This slot owns the boundary established by a non-sensitive configuration value does not need secret rotation; it resolves only to “keep it in an appropriate configuration store” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:secrets_credentials_secure_access:store_rotate_database_api_credentials_secrets_manager_applications_need_retrievable_rota:slot:resource-policy

- Status: authoring-admitted
- Objective: Assess whether the evidence “another account must retrieve one secret” supports the owned resolution “scope the secret resource policy and KMS access”.
- Expected decision: scope the secret resource policy and KMS access
- Decisive boundary: This slot owns the boundary established by another account must retrieve one secret; it resolves only to “scope the secret resource policy and KMS access” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:secrets_credentials_secure_access:store_rotate_database_api_credentials_secrets_manager_applications_need_retrievable_rota:slot:retrievable-secret

- Status: authoring-admitted
- Objective: Assess whether the evidence “an application must retrieve a database password at runtime” supports the owned resolution “store it in Secrets Manager”.
- Expected decision: store it in Secrets Manager
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:secrets_credentials_secure_access:store_rotate_database_api_credentials_secrets_manager_applications_need_retrievable_rota:slot:stale-client-cache

- Status: authoring-admitted
- Objective: Assess whether the evidence “rotation succeeds but the application keeps using an expired cached value” supports the owned resolution “diagnose client refresh behavior”.
- Expected decision: diagnose client refresh behavior
- Decisive boundary: This slot owns the boundary established by rotation succeeds but the application keeps using an expired cached value; it resolves only to “diagnose client refresh behavior” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
