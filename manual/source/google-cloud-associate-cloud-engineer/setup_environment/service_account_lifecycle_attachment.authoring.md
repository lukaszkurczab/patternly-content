# google-cloud-associate-cloud-engineer / setup_environment / service_account_lifecycle_attachment

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 10
- Authoring-admitted slots: 10
- Blocked slots: 0
- Future source path: manual/source/google-cloud-associate-cloud-engineer/setup_environment/service_account_lifecycle_attachment.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### google-cloud-associate-cloud-engineer:service_account_lifecycle_attachment:attach_dedicated_service_account_workload_needs_its_identity:slot:attached-identity-vs-caller-identity

- Status: authoring-admitted
- Objective: Distinguish the identity attached to a workload from the human or automation principal that created the resource.
- Expected decision: Authorize runtime calls through the attached service account; do not assume the creator's permissions transfer to the workload.
- Decisive boundary: The creator controls provisioning, while the attached service account supplies the workload's runtime identity.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:service_account_lifecycle_attachment:attach_dedicated_service_account_workload_needs_its_identity:slot:attachment-change-transfer

- Status: authoring-admitted
- Objective: Change the attached service account when workload ownership or required resource access changes.
- Expected decision: Attach a dedicated replacement account and validate its roles before removing the old identity's access.
- Decisive boundary: The attached identity must correspond to the workload's current responsibility and lifecycle.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:service_account_lifecycle_attachment:attach_dedicated_service_account_workload_needs_its_identity:slot:dedicated-vs-shared-account-choice

- Status: authoring-admitted
- Objective: Use a dedicated service account when workloads have different permission sets, owners, or lifecycles.
- Expected decision: Separate identities so each workload can receive least privilege and be disabled without affecting unrelated services.
- Decisive boundary: Distinct trust or lifecycle boundaries justify distinct service accounts even within one project.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:service_account_lifecycle_attachment:attach_dedicated_service_account_workload_needs_its_identity:slot:resource-attachment-permission-path

- Status: authoring-admitted
- Objective: Verify both permission to attach a service account and permission to create or update the target resource.
- Expected decision: Grant the deployer the narrow attachment authority and required resource-management permission.
- Decisive boundary: Attachment is an act-as authorization on the service account plus the relevant resource operation.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:service_account_lifecycle_attachment:attach_dedicated_service_account_workload_needs_its_identity:slot:wrong-account-access-diagnosis

- Status: authoring-admitted
- Objective: Diagnose runtime permission denial caused by the wrong service account being attached to the workload.
- Expected decision: Attach the intended account or correct that account's narrow role after confirming which identity made the call.
- Decisive boundary: Runtime identity evidence must match the account whose policy is being changed.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:service_account_lifecycle_attachment:rotate_disable_service_account_its_workload_lifecycle_changes:slot:dependent-workload-impact

- Status: authoring-admitted
- Objective: Inventory workloads and delegations that depend on a service account before disabling it.
- Expected decision: Confirm replacements or an intentional outage for every dependent path before disabling the account.
- Decisive boundary: Any workload that authenticates as or impersonates the account is inside the disablement blast radius.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:service_account_lifecycle_attachment:rotate_disable_service_account_its_workload_lifecycle_changes:slot:disable-vs-delete-lifecycle

- Status: authoring-admitted
- Objective: Disable a service account for reversible suspension and delete it only after recovery and dependency requirements are satisfied.
- Expected decision: Use disable to block credential use while preserving the account for investigation or rollback; use delete for completed retirement under the documented recovery boundary.
- Decisive boundary: Reversibility and completed dependency retirement distinguish disable from delete.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:service_account_lifecycle_attachment:rotate_disable_service_account_its_workload_lifecycle_changes:slot:disabled-account-failure-diagnosis

- Status: authoring-admitted
- Objective: Recognize authentication or token failures caused by a disabled service account.
- Expected decision: Re-enable the account only if its use is still authorized; otherwise attach or impersonate an approved replacement.
- Decisive boundary: Disabled state blocks use of the account independently of the permissions in its IAM bindings.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:service_account_lifecycle_attachment:rotate_disable_service_account_its_workload_lifecycle_changes:slot:key-rotation-vs-account-disable

- Status: authoring-admitted
- Objective: Separate rotation of a service-account key from disabling the service account itself.
- Expected decision: Disable or delete the affected key when only that credential must be revoked; disable the account when all authentication as that principal must stop.
- Decisive boundary: Credential scope is decisive: a key action affects that key; account disablement affects every way the service account is used.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:service_account_lifecycle_attachment:rotate_disable_service_account_its_workload_lifecycle_changes:slot:re-enable-or-replace-transfer

- Status: authoring-admitted
- Objective: Choose between re-enabling a service account and replacing it after the reason for suspension is understood.
- Expected decision: Re-enable only when the original identity remains trustworthy and required; otherwise attach a new account and retire the old one.
- Decisive boundary: Trust and ownership continuity—not convenience—decide whether the same principal may return.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
