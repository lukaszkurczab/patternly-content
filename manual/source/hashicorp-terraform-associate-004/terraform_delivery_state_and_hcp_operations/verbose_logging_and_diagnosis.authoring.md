# hashicorp-terraform-associate-004 / terraform_delivery_state_and_hcp_operations / verbose_logging_and_diagnosis

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 5
- Authoring-admitted slots: 5
- Blocked slots: 0
- Future source path: manual/source/hashicorp-terraform-associate-004/terraform_delivery_state_and_hcp_operations/verbose_logging_and_diagnosis.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### hashicorp-terraform-associate-004:verbose_logging_and_diagnosis:classify_verbose_logging_and_diagnosis_evidence:slot:core-provider-log-classification

- Status: authoring-admitted
- Objective: Separate Terraform Core graph/state messages from provider RPC/API messages. It evaluates log subsystem; documented property core_provider_logs under core_provider_logs.
- Expected decision: Route diagnosis to Core configuration/state or provider/API ownership.
- Decisive boundary: Provider processes communicate through Terraform but own provider operations. With log subsystem; documented property core_provider_logs, the required resolution is Route diagnosis to Core configuration/state or provider/API ownership.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:verbose_logging_and_diagnosis:classify_verbose_logging_and_diagnosis_evidence:slot:credential-leak-boundary

- Status: authoring-admitted
- Objective: Protect logs that may contain credentials, request bodies, or sensitive values. It evaluates TRACE output; documented property debug_log_sensitive_data under debug_log_sensitive_data.
- Expected decision: Restrict, redact, and expire diagnostic artifacts.
- Decisive boundary: Debug logging has different disclosure behavior than plan/UI rendering. With TRACE output; documented property debug_log_sensitive_data, the required resolution is Restrict, redact, and expire diagnostic artifacts.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:verbose_logging_and_diagnosis:classify_verbose_logging_and_diagnosis_evidence:slot:log-level-selection

- Status: authoring-admitted
- Objective: Enable the least verbose TF_LOG level that can answer a bounded diagnostic. It evaluates error class; documented property TF_LOG under TF_LOG.
- Expected decision: Collect targeted logs for a short reproduction.
- Decisive boundary: Higher verbosity increases sensitive and noisy output. With error class; documented property TF_LOG, the required resolution is Collect targeted logs for a short reproduction.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:verbose_logging_and_diagnosis:classify_verbose_logging_and_diagnosis_evidence:slot:log-path-procedure

- Status: authoring-admitted
- Objective: Persist debug logs explicitly when reproducible evidence is needed. It evaluates TF_LOG enabled; documented property TF_LOG_PATH under TF_LOG_PATH.
- Expected decision: Set a protected path and disable logging after capture.
- Decisive boundary: A path does not enable logging without TF_LOG. With TF_LOG enabled; documented property TF_LOG_PATH, the required resolution is Set a protected path and disable logging after capture.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:verbose_logging_and_diagnosis:classify_verbose_logging_and_diagnosis_evidence:slot:reproduction-scope

- Status: authoring-admitted
- Objective: Reduce a verbose log capture to the failing command and workspace. It evaluates exact command; documented property bounded_reproduction under bounded_reproduction.
- Expected decision: Correlate the smallest trace with the provider/API failure.
- Decisive boundary: Bounded evidence improves diagnosis and reduces exposure. With exact command; documented property bounded_reproduction, the required resolution is Correlate the smallest trace with the provider/API failure.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
