# microsoft-azure-administrator-associate-az-104 / azure_identity_governance_storage_and_deployment_foundations / modification_parameters_dependencies

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 4
- Authoring-admitted slots: 4
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_identity_governance_storage_and_deployment_foundations/modification_parameters_dependencies.json
- Interaction allocation: choice
- Mode contribution: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:modification_parameters_dependencies:classify_modification_parameters_dependencies_evidence:slot:secure-sensitive-parameter

- Status: authoring-admitted
- Objective: Mark a sensitive input secure so deployment history and outputs do not expose its value.
- Expected decision: Use a secure parameter and avoid echoing it through outputs.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:modification_parameters_dependencies:classify_modification_parameters_dependencies_evidence:slot:select-parameter-for-environment-varying-input

- Status: authoring-admitted
- Objective: Expose a value as a parameter when deployers must supply different environment-specific input.
- Expected decision: Define a typed parameter and keep internal derivations out of the interface.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:modification_parameters_dependencies:classify_modification_parameters_dependencies_evidence:slot:select-variable-for-derived-internal-value

- Status: authoring-admitted
- Objective: Use a variable for a value computed inside the template that callers should not control.
- Expected decision: Derive the value from parameters and resource context.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:modification_parameters_dependencies:classify_modification_parameters_dependencies_evidence:slot:sequence-resources-from-real-dependencies

- Status: authoring-admitted
- Objective: Order resource deployment from actual reference or readiness dependencies rather than file order.
- Expected decision: Let independent resources deploy concurrently and retain only necessary edges.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
