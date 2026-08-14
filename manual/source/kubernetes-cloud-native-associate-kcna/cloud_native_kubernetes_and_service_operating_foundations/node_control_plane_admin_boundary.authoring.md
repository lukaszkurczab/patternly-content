# kubernetes-cloud-native-associate-kcna / cloud_native_kubernetes_and_service_operating_foundations / node_control_plane_admin_boundary

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 4
- Authoring-admitted slots: 4
- Blocked slots: 0
- Future source path: manual/source/kubernetes-cloud-native-associate-kcna/cloud_native_kubernetes_and_service_operating_foundations/node_control_plane_admin_boundary.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### kubernetes-cloud-native-associate-kcna:node_control_plane_admin_boundary:classify_node_control_plane_admin_boundary_evidence:slot:choose-cordon-drain-node-action

- Status: authoring-admitted
- Objective: Select the documented outcome “choose cordon drain node action” using API availability, node condition, kubelet state, control-plane state, scheduling eligibility, and upgrade target; do not rely on a product-name cue.
- Expected decision: The intended resolution is “choose cordon drain node action”; it preserves node-scoped versus control-plane-scoped administration, with the cited source behavior as the authority.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:node_control_plane_admin_boundary:classify_node_control_plane_admin_boundary_evidence:slot:diagnose-api-server-availability-boundary

- Status: authoring-admitted
- Objective: Test the failure hypothesis “api server availability boundary” against API availability, node condition, kubelet state, control-plane state, scheduling eligibility, and upgrade target before selecting a remediation owner.
- Expected decision: The intended resolution is “diagnose api server availability boundary”; it preserves node-scoped versus control-plane-scoped administration, with the cited source behavior as the authority.
- Decisive boundary: The slot owns “diagnose api server availability boundary” only when API availability, node condition, kubelet state, control-plane state, scheduling eligibility, and upgrade target makes that result materially different and the result remains within node-scoped versus control-plane-scoped administration.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:node_control_plane_admin_boundary:classify_node_control_plane_admin_boundary_evidence:slot:diagnose-notready-node-evidence

- Status: authoring-admitted
- Objective: Test the failure hypothesis “notready node evidence” against API availability, node condition, kubelet state, control-plane state, scheduling eligibility, and upgrade target before selecting a remediation owner.
- Expected decision: The intended resolution is “diagnose notready node evidence”; it preserves node-scoped versus control-plane-scoped administration, with the cited source behavior as the authority.
- Decisive boundary: The slot owns “diagnose notready node evidence” only when API availability, node condition, kubelet state, control-plane state, scheduling eligibility, and upgrade target makes that result materially different and the result remains within node-scoped versus control-plane-scoped administration.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:node_control_plane_admin_boundary:classify_node_control_plane_admin_boundary_evidence:slot:distinguish-node-upgrade-from-control-plane-upgrade

- Status: authoring-admitted
- Objective: Test the material boundary “node upgrade from control plane upgrade” using API availability, node condition, kubelet state, control-plane state, scheduling eligibility, and upgrade target; reject a surface-only restatement.
- Expected decision: The intended resolution is “distinguish node upgrade from control plane upgrade”; it preserves node-scoped versus control-plane-scoped administration, with the cited source behavior as the authority.
- Decisive boundary: The slot owns “distinguish node upgrade from control plane upgrade” only when API availability, node condition, kubelet state, control-plane state, scheduling eligibility, and upgrade target makes that result materially different and the result remains within node-scoped versus control-plane-scoped administration.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
