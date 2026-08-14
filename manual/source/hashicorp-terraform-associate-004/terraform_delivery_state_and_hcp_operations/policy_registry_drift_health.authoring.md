# hashicorp-terraform-associate-004 / terraform_delivery_state_and_hcp_operations / policy_registry_drift_health

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 12
- Authoring-admitted slots: 12
- Blocked slots: 0
- Future source path: manual/source/hashicorp-terraform-associate-004/terraform_delivery_state_and_hcp_operations/policy_registry_drift_health.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### hashicorp-terraform-associate-004:policy_registry_drift_health:block_or_remediate_run_on_policy_or_drift_evidence:slot:drift-remediation-choice

- Status: authoring-admitted
- Objective: Choose whether detected drift should be reverted or adopted. It evaluates remote change intent; documented property remediation under remediation.
- Expected decision: Either apply configuration convergence or edit configuration and refresh through review.
- Decisive boundary: Some external changes are intentional; ownership decides desired state. With remote change intent; documented property remediation, the required resolution is Either apply configuration convergence or edit configuration and refresh through review.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:policy_registry_drift_health:block_or_remediate_run_on_policy_or_drift_evidence:slot:health-assessment-no-auto-apply

- Status: authoring-admitted
- Objective: Recognize that drift detection reports evidence but does not itself remediate infrastructure. It evaluates health result; documented property assessment_not_remediation under assessment_not_remediation.
- Expected decision: Create and approve a Terraform run for remediation.
- Decisive boundary: Assessment and mutation are separate safety stages. With health result; documented property assessment_not_remediation, the required resolution is Create and approve a Terraform run for remediation.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:policy_registry_drift_health:block_or_remediate_run_on_policy_or_drift_evidence:slot:mandatory-policy-block

- Status: authoring-admitted
- Objective: Stop a run when a mandatory policy fails without an authorized override path. It evaluates mandatory result; documented property run_blocking under run_blocking.
- Expected decision: Change configuration or policy through its owning review process and rerun.
- Decisive boundary: A deterministic policy failure requires changed evidence. With mandatory result; documented property run_blocking, the required resolution is Change configuration or policy through its owning review process and rerun.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:policy_registry_drift_health:block_or_remediate_run_on_policy_or_drift_evidence:slot:policy-versus-provider-failure

- Status: authoring-admitted
- Objective: Separate a policy-blocked run from cloud provider authorization failure. It evaluates policy phase result; documented property policy_checks under policy_checks.
- Expected decision: Fix the owning layer rather than broadening unrelated permissions.
- Decisive boundary: Policy evaluates plan/governance; provider authorization occurs during refresh/apply calls. With policy phase result; documented property policy_checks, the required resolution is Fix the owning layer rather than broadening unrelated permissions.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:policy_registry_drift_health:block_or_remediate_run_on_policy_or_drift_evidence:slot:remediation-reassessment

- Status: authoring-admitted
- Objective: Require fresh policy and health evidence after remediation changes. It evaluates new configuration version; documented property fresh_policy_evaluation under fresh_policy_evaluation.
- Expected decision: Rerun checks/policies and bind approval to the new result.
- Decisive boundary: Changed proposals require changed governance evidence. With new configuration version; documented property fresh_policy_evaluation, the required resolution is Rerun checks/policies and bind approval to the new result.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:policy_registry_drift_health:block_or_remediate_run_on_policy_or_drift_evidence:slot:soft-mandatory-override

- Status: authoring-admitted
- Objective: Use a policy override only when enforcement mode and actor authorization permit it. It evaluates soft-mandatory result; documented property authorized_policy_override under authorized_policy_override.
- Expected decision: Record the exception against the exact run.
- Decisive boundary: Scoped override preserves broader enforcement. With soft-mandatory result; documented property authorized_policy_override, the required resolution is Record the exception against the exact run.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:policy_registry_drift_health:interpret_policy_result_registry_version_and_health_signal:slot:continuous-validation-signal

- Status: authoring-admitted
- Objective: Distinguish a failing check assertion from resource drift. It evaluates check block result; documented property continuous_validation under continuous_validation.
- Expected decision: Investigate the declared assertion and its data source.
- Decisive boundary: Continuous validation can fail even without configuration drift. With check block result; documented property continuous_validation, the required resolution is Investigate the declared assertion and its data source.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:policy_registry_drift_health:interpret_policy_result_registry_version_and_health_signal:slot:drift-signal-classification

- Status: authoring-admitted
- Objective: Interpret workspace drift detection as real infrastructure diverging from configuration. It evaluates health assessment; documented property drift_detection under drift_detection.
- Expected decision: Route remediation to configuration adoption or infrastructure convergence.
- Decisive boundary: Health drift evidence describes state/configuration mismatch, not governance evaluation. With health assessment; documented property drift_detection, the required resolution is Route remediation to configuration adoption or infrastructure convergence.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:policy_registry_drift_health:interpret_policy_result_registry_version_and_health_signal:slot:policy-result-classification

- Status: authoring-admitted
- Objective: Classify advisory and mandatory policy outcomes by run effect. It evaluates policy pass/fail; documented property enforcement_levels under enforcement_levels.
- Expected decision: Determine whether the run warns, requires authorized override, or is blocked.
- Decisive boundary: Policy enforcement level defines governance consequence. With policy pass/fail; documented property enforcement_levels, the required resolution is Determine whether the run warns, requires authorized override, or is blocked.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:policy_registry_drift_health:interpret_policy_result_registry_version_and_health_signal:slot:registry-policy-boundary

- Status: authoring-admitted
- Objective: Separate approved module distribution from policy enforcement of its use. It evaluates private registry release; documented property registry_distribution_not_enforcement under registry_distribution_not_enforcement.
- Expected decision: Use registry for discoverable versions and policy for enforceable constraints.
- Decisive boundary: Distribution and enforcement are distinct governance mechanisms. With private registry release; documented property registry_distribution_not_enforcement, the required resolution is Use registry for discoverable versions and policy for enforceable constraints.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:policy_registry_drift_health:interpret_policy_result_registry_version_and_health_signal:slot:registry-version-selection

- Status: authoring-admitted
- Objective: Verify a private registry module version selected by a workspace configuration. It evaluates module source; documented property module_versions under module_versions.
- Expected decision: Confirm the chosen release satisfies the constraint and governance expectation.
- Decisive boundary: Module versions are selected from module source/constraint, not provider lock. With module source; documented property module_versions, the required resolution is Confirm the chosen release satisfies the constraint and governance expectation.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:policy_registry_drift_health:interpret_policy_result_registry_version_and_health_signal:slot:signal-provenance-diagnosis

- Status: authoring-admitted
- Objective: Trace a dashboard health warning to its exact assessment, run, and configuration version. It evaluates assessment timestamp; documented property health_assessment under health_assessment.
- Expected decision: Use provenance before selecting remediation.
- Decisive boundary: Policy, drift, and check signals have different owners and timestamps. With assessment timestamp; documented property health_assessment, the required resolution is Use provenance before selecting remediation.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
