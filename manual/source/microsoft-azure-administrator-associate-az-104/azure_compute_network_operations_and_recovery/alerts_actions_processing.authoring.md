# microsoft-azure-administrator-associate-az-104 / azure_compute_network_operations_and_recovery / alerts_actions_processing

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 5
- Authoring-admitted slots: 5
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_compute_network_operations_and_recovery/alerts_actions_processing.json
- Interaction allocation: choice
- Mode contribution: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:alerts_actions_processing:classify_alerts_actions_processing_evidence:slot:apply-alert-processing-rule-for-suppression

- Status: authoring-admitted
- Objective: Use an alert processing rule to suppress or reroute actions during a maintenance scope/window without disabling evaluation.
- Expected decision: Apply the bounded processing rule and preserve alert records.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:alerts_actions_processing:classify_alerts_actions_processing_evidence:slot:configure-action-group-for-notification-or-automation

- Status: authoring-admitted
- Objective: Attach an action group to route fired alerts to the required notification or automation endpoints.
- Expected decision: Test the action group independently from the detection criterion.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:alerts_actions_processing:classify_alerts_actions_processing_evidence:slot:diagnose-fired-alert-with-failed-action

- Status: authoring-admitted
- Objective: Distinguish an alert that fired correctly from an action group receiver that failed delivery.
- Expected decision: Repair the receiver or action configuration without weakening the detection rule.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:alerts_actions_processing:classify_alerts_actions_processing_evidence:slot:select-log-search-alert-for-kql-result

- Status: authoring-admitted
- Objective: Use a log-search alert when KQL result count or a calculated value defines the condition.
- Expected decision: Keep the query bounded and validate results before enabling actions.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:alerts_actions_processing:classify_alerts_actions_processing_evidence:slot:select-metric-alert-for-threshold-evaluation

- Status: authoring-admitted
- Objective: Use a metric alert when a numeric series and aggregation should be evaluated on a regular cadence.
- Expected decision: Create the alert at the resource scope with an evaluation window matching the signal.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
