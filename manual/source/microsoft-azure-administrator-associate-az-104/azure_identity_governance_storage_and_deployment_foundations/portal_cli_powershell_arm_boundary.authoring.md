# microsoft-azure-administrator-associate-az-104 / azure_identity_governance_storage_and_deployment_foundations / portal_cli_powershell_arm_boundary

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 7
- Authoring-admitted slots: 7
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_identity_governance_storage_and_deployment_foundations/portal_cli_powershell_arm_boundary.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:portal_cli_powershell_arm_boundary:plane_resource_operations_data_plane_access_operations:slot:classify-blob-read-as-data-plane

- Status: authoring-admitted
- Objective: Classify reading blob content from the storage endpoint as a data-plane operation.
- Expected decision: Evaluate storage data authorization and network admission rather than only management rights.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:portal_cli_powershell_arm_boundary:plane_resource_operations_data_plane_access_operations:slot:classify-resource-create-as-control-plane

- Status: authoring-admitted
- Objective: Classify creating or configuring an Azure resource through Resource Manager as a control-plane operation.
- Expected decision: Evaluate control-plane RBAC, policy, and locks for the create operation.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:portal_cli_powershell_arm_boundary:plane_resource_operations_data_plane_access_operations:slot:distinguish-management-endpoint-from-instance-endpoint

- Status: authoring-admitted
- Objective: Use the request endpoint to distinguish Resource Manager administration from use of the provisioned service.
- Expected decision: Apply the controls of the plane actually receiving the request.
- Decisive boundary: A Contributor assignment at Resource Manager scope does not automatically authorize service data.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:portal_cli_powershell_arm_boundary:portal_cli_powershell_arm_bicep_based_repeatability_operational_context:slot:select-bicep-for-declarative-repeatable-state

- Status: authoring-admitted
- Objective: Choose Bicep for idempotent, reviewable deployment of desired Azure resource state.
- Expected decision: Express resources in Bicep and deploy the same declaration consistently.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:portal_cli_powershell_arm_boundary:portal_cli_powershell_arm_bicep_based_repeatability_operational_context:slot:select-cli-for-shell-automation

- Status: authoring-admitted
- Objective: Choose Azure CLI when the administrative workflow is a portable shell pipeline.
- Expected decision: Use az commands with explicit subscription and resource scope.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:portal_cli_powershell_arm_boundary:portal_cli_powershell_arm_bicep_based_repeatability_operational_context:slot:select-portal-for-single-inspected-change

- Status: authoring-admitted
- Objective: Choose the portal for a one-off change that requires immediate visual inspection rather than repeatable automation.
- Expected decision: Use the portal and record the resulting operation when repeatability is not required.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:portal_cli_powershell_arm_boundary:portal_cli_powershell_arm_bicep_based_repeatability_operational_context:slot:select-powershell-for-object-pipeline-automation

- Status: authoring-admitted
- Objective: Choose Azure PowerShell when typed objects and PowerShell pipeline semantics are required.
- Expected decision: Use Az cmdlets and pass objects through the pipeline rather than parsing display text.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
