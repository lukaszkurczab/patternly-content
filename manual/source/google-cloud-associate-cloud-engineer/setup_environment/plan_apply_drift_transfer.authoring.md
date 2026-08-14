# google-cloud-associate-cloud-engineer / setup_environment / plan_apply_drift_transfer

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 9
- Authoring-admitted slots: 9
- Blocked slots: 0
- Future source path: manual/source/google-cloud-associate-cloud-engineer/setup_environment/plan_apply_drift_transfer.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### google-cloud-associate-cloud-engineer:plan_apply_drift_transfer:plan_output_changing_shared_infrastructure:slot:apply-output-verification

- Status: authoring-admitted
- Objective: Verify Terraform apply results against the approved change and provider-reported resource identifiers.
- Expected decision: Confirm the apply completed without partial failures and that its changed resources match the reviewed intent before declaring success.
- Decisive boundary: Success requires completed operations and expected resulting resources, not merely an accepted command.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:plan_apply_drift_transfer:plan_output_changing_shared_infrastructure:slot:destructive-action-review

- Status: authoring-admitted
- Objective: Identify replacements and deletions in a Terraform plan before approving a shared-infrastructure change.
- Expected decision: Stop approval until each destructive action is intended, recoverable, and sequenced for the affected shared service.
- Decisive boundary: Any planned destroy or replace of a stateful or shared resource requires explicit impact review.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:plan_apply_drift_transfer:plan_output_changing_shared_infrastructure:slot:saved-plan-approval-path

- Status: authoring-admitted
- Objective: Apply the exact saved Terraform plan artifact that reviewers approved.
- Expected decision: Generate a saved plan, review that artifact, and pass the same artifact to apply so no unreviewed re-plan occurs.
- Decisive boundary: Approval attaches to the serialized plan artifact and its state/configuration context, not to a generic future apply command.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:plan_apply_drift_transfer:plan_output_changing_shared_infrastructure:slot:stale-plan-diagnosis

- Status: authoring-admitted
- Objective: Reject a saved Terraform plan when its configuration or state assumptions are no longer current.
- Expected decision: Discard the stale artifact and produce a new plan from current configuration and state before approval.
- Decisive boundary: A plan is no longer reviewable evidence after material configuration or state context changes.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:plan_apply_drift_transfer:reconcile_drift_against_declared_source_truth:slot:authority-change-transfer

- Status: authoring-admitted
- Objective: Change the reconciliation direction when ownership of a resource moves into or out of Terraform.
- Expected decision: Import and declare a newly Terraform-owned resource, or deliberately remove state ownership before another controller becomes authoritative.
- Decisive boundary: Only one declared authority should reconcile a given resource property at a time.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:plan_apply_drift_transfer:reconcile_drift_against_declared_source_truth:slot:drift-signal-classification

- Status: authoring-admitted
- Objective: Recognize drift when a refreshed Terraform plan proposes changes although the declared configuration did not change.
- Expected decision: Classify the delta as possible remote drift and investigate the actor and changed properties before applying.
- Decisive boundary: Drift evidence requires a mismatch between refreshed remote state and the unchanged declared intent.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:plan_apply_drift_transfer:reconcile_drift_against_declared_source_truth:slot:out-of-band-change-boundary

- Status: authoring-admitted
- Objective: Treat a console or gcloud edit to a Terraform-owned property as temporary until it is reconciled with declared configuration.
- Expected decision: Either encode the approved change in configuration or restore the declared value; do not leave actual infrastructure as an undocumented third truth.
- Decisive boundary: An out-of-band edit does not become authoritative merely because it is currently live.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:plan_apply_drift_transfer:reconcile_drift_against_declared_source_truth:slot:reconciliation-path-choice

- Status: authoring-admitted
- Objective: Choose import, configuration change, state operation, or remote restoration according to the intended authority and actual resource lifecycle.
- Expected decision: Use the path that makes configuration, state, and remote object agree without recreating or abandoning the wrong resource.
- Decisive boundary: The correct reconciliation path follows the three-way relationship among desired configuration, Terraform state, and the provider object.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:plan_apply_drift_transfer:reconcile_drift_against_declared_source_truth:slot:state-vs-configuration-diagnosis

- Status: authoring-admitted
- Objective: Distinguish stale or incorrect Terraform state from a changed declared configuration.
- Expected decision: Refresh and compare all three representations before changing state or source.
- Decisive boundary: Configuration expresses intent, state maps managed objects, and provider reads show current reality; the differing pair identifies the defect class.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
