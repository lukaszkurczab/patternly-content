# microsoft-azure-administrator-associate-az-104 / azure_identity_governance_storage_and_deployment_foundations / export_and_conversion

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 6
- Authoring-admitted slots: 6
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_identity_governance_storage_and_deployment_foundations/export_and_conversion.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:export_and_conversion:convert_templates_while_preserving_resource_semantics_dependencies:slot:decompile-arm-json-to-bicep

- Status: authoring-admitted
- Objective: Use the Bicep decompiler as a conversion starting point for an ARM JSON template.
- Expected decision: Produce Bicep, then require semantic review before deployment.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:export_and_conversion:convert_templates_while_preserving_resource_semantics_dependencies:slot:preserve-resource-api-version-and-scope

- Status: authoring-admitted
- Objective: Compare type/API version, scope, properties, conditions, loops, and dependency behavior before and after conversion.
- Expected decision: Accept the conversion only when the intended resource semantics match.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:export_and_conversion:convert_templates_while_preserving_resource_semantics_dependencies:slot:review-decompiler-warnings-and-lossy-expressions

- Status: authoring-admitted
- Objective: Resolve decompiler warnings, naming conflicts, and expressions that could not be represented cleanly.
- Expected decision: Rewrite the affected declarations without assuming automatic conversion is lossless.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:export_and_conversion:exported_templates_evidence_refactor_them_treating_them_maintainable_iac:slot:classify-exported-template-as-snapshot-evidence

- Status: authoring-admitted
- Objective: Treat an exported template as a generated snapshot of supported resource state at export time.
- Expected decision: Use it to inspect resources, not as immediately maintainable IaC.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:export_and_conversion:exported_templates_evidence_refactor_them_treating_them_maintainable_iac:slot:remove-hardcoded-resource-specific-values

- Status: authoring-admitted
- Objective: Replace generated names, IDs, locations, and environment values with an intentional parameter/interface design.
- Expected decision: Refactor the export before reuse in another environment.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:export_and_conversion:exported_templates_evidence_refactor_them_treating_them_maintainable_iac:slot:replace-generated-dependencies-with-symbolic-references

- Status: authoring-admitted
- Objective: Rebuild resource references and retain only dependencies required by the intended architecture.
- Expected decision: Use symbolic references where possible and verify the resulting graph.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
