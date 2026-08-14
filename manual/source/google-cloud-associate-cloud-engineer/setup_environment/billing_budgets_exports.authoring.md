# google-cloud-associate-cloud-engineer / setup_environment / billing_budgets_exports

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 10
- Authoring-admitted slots: 10
- Blocked slots: 0
- Future source path: manual/source/google-cloud-associate-cloud-engineer/setup_environment/billing_budgets_exports.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### google-cloud-associate-cloud-engineer:billing_budgets_exports:billing_data_bigquery_cost_attribution_analysis:slot:export-capability-classification

- Status: authoring-admitted
- Objective: Recognize billing export as the mechanism for queryable cost and usage analysis.
- Expected decision: Match billing analysis needs to standard, detailed, pricing, or FOCUS export capability.
- Decisive boundary: The chosen export must expose the fields and granularity needed by the analysis.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:billing_budgets_exports:billing_data_bigquery_cost_attribution_analysis:slot:export-permission-diagnosis

- Status: authoring-admitted
- Objective: Diagnose an export setup failure from billing-account or BigQuery permission evidence.
- Expected decision: Locate the missing permission at the billing account, project, or dataset boundary.
- Decisive boundary: The failing setup step determines which documented permission boundary owns the error.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:billing_budgets_exports:billing_data_bigquery_cost_attribution_analysis:slot:export-setup-workflow

- Status: authoring-admitted
- Objective: Order storage project, permissions, dataset, prerequisite API, and export enablement.
- Expected decision: Satisfy project, billing-account, dataset, and permission prerequisites before enabling the export.
- Decisive boundary: The destination and principals must meet the documented setup requirements.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:billing_budgets_exports:billing_data_bigquery_cost_attribution_analysis:slot:no-backfill-boundary

- Status: authoring-admitted
- Objective: Test the historical-data boundary after changing or re-enabling an export destination.
- Expected decision: Recognize that prior exported data is not automatically backfilled into a new destination.
- Decisive boundary: Dataset or project changes preserve future export, not automatic historical backfill.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:billing_budgets_exports:billing_data_bigquery_cost_attribution_analysis:slot:trend-resource-transfer

- Status: authoring-admitted
- Objective: Re-evaluate export type when analysis changes from trend reporting to resource-level attribution.
- Expected decision: Use the least detailed export that still satisfies the attribution requirement.
- Decisive boundary: The export schema must contain the requested attribution dimension; extra detail has query-cost implications.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:billing_budgets_exports:budgets_alerts_bound_owner_project_spend:slot:alerts-versus-cap-classification

- Status: authoring-admitted
- Objective: Classify alerts-only budgets separately from preview spend-cap budgets.
- Expected decision: Identify monitoring and notification behavior versus eligible preview enforcement.
- Decisive boundary: Alerts-only budgets do not cap spend; spend-cap behavior has separate eligibility and limitations.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:billing_budgets_exports:budgets_alerts_bound_owner_project_spend:slot:budget-scope-selection

- Status: authoring-admitted
- Objective: Select budget scope from billing account, project, service, label, or hierarchy filters.
- Expected decision: Match budget scope to the accountable spend slice.
- Decisive boundary: The selected filters must include the owned charges without silently including unrelated spend.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:billing_budgets_exports:budgets_alerts_bound_owner_project_spend:slot:forecast-actual-transfer

- Status: authoring-admitted
- Objective: Re-evaluate alert thresholds when the monitoring intent changes between actual and forecasted cost.
- Expected decision: Choose the threshold basis that matches early-warning or realized-spend intent.
- Decisive boundary: The threshold type must measure the stated monitoring intent within the configured period.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:billing_budgets_exports:budgets_alerts_bound_owner_project_spend:slot:missing-notification-diagnosis

- Status: authoring-admitted
- Objective: Diagnose an expected budget alert that did not reach the intended recipient.
- Expected decision: Separate unmet threshold conditions from recipient and notification-channel configuration gaps.
- Decisive boundary: No notification is evidence only after the threshold and configured delivery paths are checked.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:billing_budgets_exports:budgets_alerts_bound_owner_project_spend:slot:threshold-workflow

- Status: authoring-admitted
- Objective: Order scope, amount, threshold, and notification configuration for an alerts-only budget.
- Expected decision: Configure the monitored population before thresholds and notification delivery.
- Decisive boundary: Notifications are meaningful only when scope, amount, threshold type, and recipients are all defined.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
