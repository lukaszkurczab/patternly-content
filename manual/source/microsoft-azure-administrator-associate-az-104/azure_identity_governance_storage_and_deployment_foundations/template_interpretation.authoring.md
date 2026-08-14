# microsoft-azure-administrator-associate-az-104 / azure_identity_governance_storage_and_deployment_foundations / template_interpretation

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 8
- Authoring-admitted slots: 8
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_identity_governance_storage_and_deployment_foundations/template_interpretation.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:template_interpretation:declared_versus_implicit_dependency_deployment_scope:slot:add-explicit-dependency-only-without-reference

- Status: authoring-admitted
- Objective: Use dependsOn only when a real ordering dependency has no symbolic reference that expresses it.
- Expected decision: Add the narrow explicit dependency and document why it exists.
- Decisive boundary: Visual grouping or desired ordering alone is not a deployment dependency.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:template_interpretation:declared_versus_implicit_dependency_deployment_scope:slot:derive-implicit-dependency-from-symbolic-reference

- Status: authoring-admitted
- Objective: Recognize that a symbolic property or resource reference creates an implicit dependency.
- Expected decision: Rely on the implicit dependency rather than duplicating dependsOn.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:template_interpretation:declared_versus_implicit_dependency_deployment_scope:slot:diagnose-cross-scope-module-deployment

- Status: authoring-admitted
- Objective: Use a module with explicit scope when a resource belongs outside the parent file's deployment scope.
- Expected decision: Deploy the module to the intended scope with required permissions.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:template_interpretation:declared_versus_implicit_dependency_deployment_scope:slot:diagnose-unnecessary-dependson-serialization

- Status: authoring-admitted
- Objective: Identify broad explicit dependencies that serialize resources which could deploy in parallel.
- Expected decision: Remove the unnecessary edge while preserving true references.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:template_interpretation:read_bicep_arm_resource_type_api_version_scope_properties_changing_template:slot:classify-resource-scope

- Status: authoring-admitted
- Objective: Determine whether the declaration deploys at resource-group, subscription, management-group, or tenant scope.
- Expected decision: Deploy through a module or command at the supported scope.
- Decisive boundary: A valid resource type can still fail when declared at an unsupported scope.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:template_interpretation:read_bicep_arm_resource_type_api_version_scope_properties_changing_template:slot:identify-required-versus-readonly-properties

- Status: authoring-admitted
- Objective: Separate required writable inputs from server-populated read-only properties in the resource reference.
- Expected decision: Declare only writable inputs and consume read-only values as outputs or references.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:template_interpretation:read_bicep_arm_resource_type_api_version_scope_properties_changing_template:slot:parse-resource-type-and-api-version

- Status: authoring-admitted
- Objective: Read the provider type and API version together before assessing available properties.
- Expected decision: Use properties documented for that exact type/version pair.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:template_interpretation:read_bicep_arm_resource_type_api_version_scope_properties_changing_template:slot:validate-resource-reference-before-change

- Status: authoring-admitted
- Objective: Trace symbolic references and existing-resource declarations before renaming or moving a declaration.
- Expected decision: Update references without accidentally converting an existing resource into a deployment.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
