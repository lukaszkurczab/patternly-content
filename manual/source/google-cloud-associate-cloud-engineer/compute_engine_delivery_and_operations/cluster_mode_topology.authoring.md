# google-cloud-associate-cloud-engineer / compute_engine_delivery_and_operations / cluster_mode_topology

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 10
- Authoring-admitted slots: 10
- Blocked slots: 0
- Future source path: manual/source/google-cloud-associate-cloud-engineer/compute_engine_delivery_and_operations/cluster_mode_topology.json
- Interaction allocation: choice
- Mode contribution: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### google-cloud-associate-cloud-engineer:cluster_mode_topology:cluster_regional_zonal_node_topology_failure_scope:slot:availability-requirement-transfer

- Status: authoring-admitted
- Objective: Re-plan control-plane and node placement when the workload must remain operable through a zonal outage.
- Expected decision: Use a regional control plane and place serving replicas across zones when both configuration access and workload capacity must survive one zone.
- Decisive boundary: Regional control-plane replication and multi-zone workload placement satisfy different parts of availability.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:cluster_mode_topology:cluster_regional_zonal_node_topology_failure_scope:slot:failure-domain-diagnosis

- Status: authoring-admitted
- Objective: cluster mode topology — failure domain: trace “Kubernetes API availability; node zones and Ready conditions; Pod replicas by zone” to “Attribute the outage to the narrowest failed topology layer before changing the cluster type” instead of applying the competing remediation “Spread nodes and application replicas across zones inside the control plane's region”.
- Expected decision: Attribute the outage to the narrowest failed topology layer before changing the cluster type.
- Decisive boundary: cluster mode topology — failure domain: evidence “Kubernetes API availability; node zones and Ready conditions; Pod replicas by zone” supports “Attribute the outage to the narrowest failed topology layer before changing the cluster type”. The neighboring evidence “node-pool locations; per-zone replica count; cross-zone egress and quota” instead supports classification “Spread nodes and application replicas across zones inside the control plane's region”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:cluster_mode_topology:cluster_regional_zonal_node_topology_failure_scope:slot:node-zone-distribution

- Status: authoring-admitted
- Objective: cluster mode topology — node zone distribution: recognize that “node-pool locations; per-zone replica count; cross-zone egress and quota” requires “Spread nodes and application replicas across zones inside the control plane's region”, not the neighboring capability response “Create a regional cluster; the zonal-to-regional choice cannot be converted in place later”.
- Expected decision: Spread nodes and application replicas across zones inside the control plane's region.
- Decisive boundary: cluster mode topology — node zone distribution: evidence “node-pool locations; per-zone replica count; cross-zone egress and quota” supports “Spread nodes and application replicas across zones inside the control plane's region”. The neighboring evidence “multiple control-plane replicas; production availability target; regional quota and cost” instead supports decision “Create a regional cluster; the zonal-to-regional choice cannot be converted in place later”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:cluster_mode_topology:cluster_regional_zonal_node_topology_failure_scope:slot:regional-control-plane-choice

- Status: authoring-admitted
- Objective: cluster mode topology — regional control plane: select “Create a regional cluster; the zonal-to-regional choice cannot be converted in place later” under “multiple control-plane replicas; production availability target; regional quota and cost” instead of the competing action “Use the zonal option for the accepted lower-availability scope and plan recreation rather than in-place conversion”.
- Expected decision: Create a regional cluster; the zonal-to-regional choice cannot be converted in place later.
- Decisive boundary: cluster mode topology — regional control plane: evidence “multiple control-plane replicas; production availability target; regional quota and cost” supports “Create a regional cluster; the zonal-to-regional choice cannot be converted in place later”. The neighboring evidence “development or disposable use; tolerance for configuration downtime; single-zone budget” instead supports decision “Use the zonal option for the accepted lower-availability scope and plan recreation rather than in-place conversion”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:cluster_mode_topology:cluster_regional_zonal_node_topology_failure_scope:slot:zonal-cluster-boundary

- Status: authoring-admitted
- Objective: cluster mode topology — zonal cluster: verify that “development or disposable use; tolerance for configuration downtime; single-zone budget” stays with “Use the zonal option for the accepted lower-availability scope and plan recreation rather than in-place conversion” and has not crossed into “Use a regional control plane and place serving replicas across zones when both configuration access and workload capacity must survive one zone”.
- Expected decision: Use the zonal option for the accepted lower-availability scope and plan recreation rather than in-place conversion.
- Decisive boundary: cluster mode topology — zonal cluster: evidence “development or disposable use; tolerance for configuration downtime; single-zone budget” supports “Use the zonal option for the accepted lower-availability scope and plan recreation rather than in-place conversion”. The neighboring evidence “control-plane outage tolerance; node distribution across zones; replica placement” instead supports decision “Use a regional control plane and place serving replicas across zones when both configuration access and workload capacity must survive one zone”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:cluster_mode_topology:gke_autopilot_standard_node_operational_responsibility:slot:control-requirement-transfer

- Status: authoring-admitted
- Objective: Move between Autopilot-managed operation and Standard ownership when required node control changes.
- Expected decision: Use Autopilot when managed infrastructure satisfies the workload; use Standard only for a concrete node-level control requirement.
- Decisive boundary: Mode follows the required ownership surface, not team preference.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:cluster_mode_topology:gke_autopilot_standard_node_operational_responsibility:slot:default-security-posture

- Status: authoring-admitted
- Objective: cluster mode topology — default security posture: recognize that “baseline cluster hardening; workload compatibility; customer-owned application permissions” requires “Rely on Autopilot for supported infrastructure controls while still configuring workload IAM and network policy”, not the neighboring capability response “Accept Standard's operational responsibility to obtain the demonstrated node control”.
- Expected decision: Rely on Autopilot for supported infrastructure controls while still configuring workload IAM and network policy.
- Decisive boundary: cluster mode topology — default security posture: evidence “baseline cluster hardening; workload compatibility; customer-owned application permissions” supports “Rely on Autopilot for supported infrastructure controls while still configuring workload IAM and network policy”. The neighboring evidence “custom node property; specialized hardware; independent node-pool upgrade” instead supports decision “Accept Standard's operational responsibility to obtain the demonstrated node control”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:cluster_mode_topology:gke_autopilot_standard_node_operational_responsibility:slot:node-control-choice

- Status: authoring-admitted
- Objective: cluster mode topology — node control: select “Accept Standard's operational responsibility to obtain the demonstrated node control” under “custom node property; specialized hardware; independent node-pool upgrade” instead of the competing action “Stay on Autopilot only for supported privilege patterns; otherwise isolate the workload in an explicitly controlled Standard cluster”.
- Expected decision: Accept Standard's operational responsibility to obtain the demonstrated node control.
- Decisive boundary: cluster mode topology — node control: evidence “custom node property; specialized hardware; independent node-pool upgrade” supports “Accept Standard's operational responsibility to obtain the demonstrated node control”. The neighboring evidence “privileged container behavior; host or kernel access; supported allowlist or alternative” instead supports decision “Stay on Autopilot only for supported privilege patterns; otherwise isolate the workload in an explicitly controlled Standard cluster”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:cluster_mode_topology:gke_autopilot_standard_node_operational_responsibility:slot:privileged-workload-boundary

- Status: authoring-admitted
- Objective: cluster mode topology — privileged workload: verify that “privileged container behavior; host or kernel access; supported allowlist or alternative” stays with “Stay on Autopilot only for supported privilege patterns; otherwise isolate the workload in an explicitly controlled Standard cluster” and has not crossed into “Use Standard only when the missing control is real and material to the workload”.
- Expected decision: Stay on Autopilot only for supported privilege patterns; otherwise isolate the workload in an explicitly controlled Standard cluster.
- Decisive boundary: cluster mode topology — privileged workload: evidence “privileged container behavior; host or kernel access; supported allowlist or alternative” supports “Stay on Autopilot only for supported privilege patterns; otherwise isolate the workload in an explicitly controlled Standard cluster”. The neighboring evidence “rejected configuration field; node-level dependency; supported Autopilot equivalent” instead supports diagnosis “Use Standard only when the missing control is real and material to the workload”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:cluster_mode_topology:gke_autopilot_standard_node_operational_responsibility:slot:standard-mode-exception-diagnosis

- Status: authoring-admitted
- Objective: cluster mode topology — standard mode exception: trace “rejected configuration field; node-level dependency; supported Autopilot equivalent” to “Use Standard only when the missing control is real and material to the workload” instead of applying the competing remediation “Use Autopilot when managed infrastructure satisfies the workload; use Standard only for a concrete node-level control requirement”.
- Expected decision: Use Standard only when the missing control is real and material to the workload.
- Decisive boundary: cluster mode topology — standard mode exception: evidence “rejected configuration field; node-level dependency; supported Autopilot equivalent” supports “Use Standard only when the missing control is real and material to the workload”. The neighboring evidence “direct node-pool configuration; GKE-managed provisioning; supported Autopilot workload controls” instead supports decision “Use Autopilot when managed infrastructure satisfies the workload; use Standard only for a concrete node-level control requirement”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
