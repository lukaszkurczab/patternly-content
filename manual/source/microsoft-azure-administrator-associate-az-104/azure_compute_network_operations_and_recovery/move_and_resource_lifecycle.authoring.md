# microsoft-azure-administrator-associate-az-104 / azure_compute_network_operations_and_recovery / move_and_resource_lifecycle

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 3
- Authoring-admitted slots: 3
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_compute_network_operations_and_recovery/move_and_resource_lifecycle.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:move_and_resource_lifecycle:classify_move_and_resource_lifecycle_evidence:slot:diagnose-region-move-requires-redeployment

- Status: authoring-admitted
- Objective: Recognize that moving VM resources between resource groups/subscriptions does not relocate them to another region.
- Expected decision: Use the supported regional migration/redeployment procedure.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:move_and_resource_lifecycle:classify_move_and_resource_lifecycle_evidence:slot:preserve-managed-disk-after-vm-delete-when-configured

- Status: authoring-admitted
- Objective: Check disk delete options before deleting a VM whose OS or data disks must remain.
- Expected decision: Set detach where supported and verify retained disks after deletion.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:move_and_resource_lifecycle:classify_move_and_resource_lifecycle_evidence:slot:recover-vm-from-retained-os-disk

- Status: authoring-admitted
- Objective: Recreate a VM from a retained specialized OS disk when the original VM resource is gone.
- Expected decision: Create the replacement VM without treating the disk as a generalized image.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
