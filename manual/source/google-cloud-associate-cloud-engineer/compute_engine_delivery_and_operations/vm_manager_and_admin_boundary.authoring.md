# google-cloud-associate-cloud-engineer / compute_engine_delivery_and_operations / vm_manager_and_admin_boundary

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 6
- Authoring-admitted slots: 6
- Blocked slots: 0
- Future source path: manual/source/google-cloud-associate-cloud-engineer/compute_engine_delivery_and_operations/vm_manager_and_admin_boundary.json
- Interaction allocation: choice
- Mode contribution: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### google-cloud-associate-cloud-engineer:vm_manager_and_admin_boundary:classify_vm_manager_and_admin_boundary_evidence:slot:agent-state-diagnosis

- Status: authoring-admitted
- Objective: vm manager and admin boundary — agent state: trace “OS Config API enabled; VM Manager metadata enabled; OS Config agent running on the selected VM” to “Restore the missing enablement or agent prerequisite before interpreting absent inventory, patch, or policy data as compliance” instead of applying the competing remediation “Use VM Manager's fleet services and scoped assignments instead of repeating untracked guest commands on every VM”.
- Expected decision: Restore the missing enablement or agent prerequisite before interpreting absent inventory, patch, or policy data as compliance.
- Decisive boundary: vm manager and admin boundary — agent state: evidence “OS Config API enabled; VM Manager metadata enabled; OS Config agent running on the selected VM” supports “Restore the missing enablement or agent prerequisite before interpreting absent inventory, patch, or policy data as compliance”. The neighboring evidence “number of managed VMs; shared patch or package state; project-wide versus selected-VM enablement” instead supports decision “Use VM Manager's fleet services and scoped assignments instead of repeating untracked guest commands on every VM”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:vm_manager_and_admin_boundary:classify_vm_manager_and_admin_boundary_evidence:slot:fleet-ownership-transfer

- Status: authoring-admitted
- Objective: Move from per-VM guest administration to fleet-scoped VM Manager control when the same OS obligation spans many instances.
- Expected decision: Use VM Manager's fleet services and scoped assignments instead of repeating untracked guest commands on every VM.
- Decisive boundary: Fleet ownership covers guest operating systems on Compute Engine, not Google-managed service infrastructure.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:vm_manager_and_admin_boundary:classify_vm_manager_and_admin_boundary_evidence:slot:guest-vs-managed-infrastructure-boundary

- Status: authoring-admitted
- Objective: vm manager and admin boundary — guest vs managed infrastructure: verify that “package or OS configuration symptom; host or zone infrastructure symptom; presence of a VM guest agent” stays with “Use VM Manager for guest inventory, patching, and OS policy; route physical host or managed control-plane incidents to infrastructure diagnostics” and has not crossed into “Collect and review OS inventory rather than launching a patch or enforcing desired package state”.
- Expected decision: Use VM Manager for guest inventory, patching, and OS policy; route physical host or managed control-plane incidents to infrastructure diagnostics.
- Decisive boundary: vm manager and admin boundary — guest vs managed infrastructure: evidence “package or OS configuration symptom; host or zone infrastructure symptom; presence of a VM guest agent” supports “Use VM Manager for guest inventory, patching, and OS policy; route physical host or managed control-plane incidents to infrastructure diagnostics”. The neighboring evidence “package inventory; OS version metadata; update availability” instead supports classification “Collect and review OS inventory rather than launching a patch or enforcing desired package state”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:vm_manager_and_admin_boundary:classify_vm_manager_and_admin_boundary_evidence:slot:os-inventory-classification

- Status: authoring-admitted
- Objective: vm manager and admin boundary — os inventory: classify “package inventory; OS version metadata; update availability” as “Collect and review OS inventory rather than launching a patch or enforcing desired package state”, while separating the competing classification “Declare the required guest state in an OS policy assignment and evaluate compliance for its target fleet”.
- Expected decision: Collect and review OS inventory rather than launching a patch or enforcing desired package state.
- Decisive boundary: vm manager and admin boundary — os inventory: evidence “package inventory; OS version metadata; update availability” supports “Collect and review OS inventory rather than launching a patch or enforcing desired package state”. The neighboring evidence “desired package present or absent; target VM labels and zones; ongoing compliance requirement” instead supports decision “Declare the required guest state in an OS policy assignment and evaluate compliance for its target fleet”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:vm_manager_and_admin_boundary:classify_vm_manager_and_admin_boundary_evidence:slot:os-policy-assignment-choice

- Status: authoring-admitted
- Objective: vm manager and admin boundary — os policy assignment: select “Declare the required guest state in an OS policy assignment and evaluate compliance for its target fleet” under “desired package present or absent; target VM labels and zones; ongoing compliance requirement” instead of the competing action “Run or schedule Patch with the intended target and maintenance behavior, then use compliance reporting for the result”.
- Expected decision: Declare the required guest state in an OS policy assignment and evaluate compliance for its target fleet.
- Decisive boundary: vm manager and admin boundary — os policy assignment: evidence “desired package present or absent; target VM labels and zones; ongoing compliance requirement” supports “Declare the required guest state in an OS policy assignment and evaluate compliance for its target fleet”. The neighboring evidence “patch window; target VM filter; reboot and disruption constraints” instead supports decision “Run or schedule Patch with the intended target and maintenance behavior, then use compliance reporting for the result”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:vm_manager_and_admin_boundary:classify_vm_manager_and_admin_boundary_evidence:slot:patch-job-choice

- Status: authoring-admitted
- Objective: vm manager and admin boundary — patch job: select “Run or schedule Patch with the intended target and maintenance behavior, then use compliance reporting for the result” under “patch window; target VM filter; reboot and disruption constraints” instead of the competing action “Restore the missing enablement or agent prerequisite before interpreting absent inventory, patch, or policy data as compliance”.
- Expected decision: Run or schedule Patch with the intended target and maintenance behavior, then use compliance reporting for the result.
- Decisive boundary: vm manager and admin boundary — patch job: evidence “patch window; target VM filter; reboot and disruption constraints” supports “Run or schedule Patch with the intended target and maintenance behavior, then use compliance reporting for the result”. The neighboring evidence “OS Config API enabled; VM Manager metadata enabled; OS Config agent running on the selected VM” instead supports diagnosis “Restore the missing enablement or agent prerequisite before interpreting absent inventory, patch, or policy data as compliance”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
