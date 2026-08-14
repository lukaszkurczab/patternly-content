# google-cloud-associate-cloud-engineer / compute_engine_delivery_and_operations / node_pools_scaling

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 11
- Authoring-admitted slots: 11
- Blocked slots: 0
- Future source path: manual/source/google-cloud-associate-cloud-engineer/compute_engine_delivery_and_operations/node_pools_scaling.json
- Interaction allocation: choice
- Mode contribution: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### google-cloud-associate-cloud-engineer:node_pools_scaling:coordinate_cluster_autoscaler_pod_requests_node_capacity:slot:node-pool-limit-diagnosis

- Status: authoring-admitted
- Objective: node pools scaling — node pool limit: trace “pool maximum; regional quota; requested resource shape” to “Change the binding pool limit or quota only when a permissible node could satisfy the Pod” instead of applying the competing remediation “Treat Pending as scale-out demand only if a new allowed node would make the Pod schedulable”.
- Expected decision: Change the binding pool limit or quota only when a permissible node could satisfy the Pod.
- Decisive boundary: node pools scaling — node pool limit: evidence “pool maximum; regional quota; requested resource shape” supports “Change the binding pool limit or quota only when a permissible node could satisfy the Pod”. The neighboring evidence “PodUnschedulable reason; resource requests; affinity, taints, and volume topology” instead supports classification “Treat Pending as scale-out demand only if a new allowed node would make the Pod schedulable”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:node_pools_scaling:coordinate_cluster_autoscaler_pod_requests_node_capacity:slot:pending-pod-signal-classification

- Status: authoring-admitted
- Objective: node pools scaling — pending pod signal: classify “PodUnschedulable reason; resource requests; affinity, taints, and volume topology” as “Treat Pending as scale-out demand only if a new allowed node would make the Pod schedulable”, while separating the competing classification “Size requests for reliable execution and node fit; cluster autoscaler then provisions from that declaration”.
- Expected decision: Treat Pending as scale-out demand only if a new allowed node would make the Pod schedulable.
- Decisive boundary: node pools scaling — pending pod signal: evidence “PodUnschedulable reason; resource requests; affinity, taints, and volume topology” supports “Treat Pending as scale-out demand only if a new allowed node would make the Pod schedulable”. The neighboring evidence “container requests; observed workload use; available node shapes” instead supports decision “Size requests for reliable execution and node fit; cluster autoscaler then provisions from that declaration”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:node_pools_scaling:coordinate_cluster_autoscaler_pod_requests_node_capacity:slot:pod-request-capacity-choice

- Status: authoring-admitted
- Objective: node pools scaling — pod request capacity: select “Size requests for reliable execution and node fit; cluster autoscaler then provisions from that declaration” under “container requests; observed workload use; available node shapes” instead of the competing action “Use each scaler only for its owned quantity and let revised Pod requests propagate into node demand”.
- Expected decision: Size requests for reliable execution and node fit; cluster autoscaler then provisions from that declaration.
- Decisive boundary: node pools scaling — pod request capacity: evidence “container requests; observed workload use; available node shapes” supports “Size requests for reliable execution and node fit; cluster autoscaler then provisions from that declaration”. The neighboring evidence “desired replicas; per-Pod request; node capacity” instead supports decision “Use each scaler only for its owned quantity and let revised Pod requests propagate into node demand”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:node_pools_scaling:coordinate_cluster_autoscaler_pod_requests_node_capacity:slot:resource-demand-transfer

- Status: authoring-admitted
- Objective: Coordinate HPA, VPA, and cluster autoscaler when demand changes between replica count and resources per replica.
- Expected decision: Use each scaler only for its owned quantity and let revised Pod requests propagate into node demand.
- Decisive boundary: Replica count, Pod sizing, and node capacity are distinct boundaries.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:node_pools_scaling:coordinate_cluster_autoscaler_pod_requests_node_capacity:slot:unschedulable-constraint-boundary

- Status: authoring-admitted
- Objective: node pools scaling — unschedulable constraint: verify that “scheduler rejection; pool labels and taints; maximum node shape” stays with “Correct the constraint or provide a matching pool before expecting scale-out” and has not crossed into “Increase workload replicas through HPA and add nodes only when requested Pods no longer fit”.
- Expected decision: Correct the constraint or provide a matching pool before expecting scale-out.
- Decisive boundary: node pools scaling — unschedulable constraint: evidence “scheduler rejection; pool labels and taints; maximum node shape” supports “Correct the constraint or provide a matching pool before expecting scale-out”. The neighboring evidence “HPA desired replicas; Pending Pods; allocatable node capacity” instead supports classification “Increase workload replicas through HPA and add nodes only when requested Pods no longer fit”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:node_pools_scaling:coordinate_cluster_autoscaler_pod_requests_node_capacity:slot:workload-vs-cluster-scaling

- Status: authoring-admitted
- Objective: node pools scaling — workload vs cluster scaling: recognize that “HPA desired replicas; Pending Pods; allocatable node capacity” requires “Increase workload replicas through HPA and add nodes only when requested Pods no longer fit”, not the neighboring capability response “Change the binding pool limit or quota only when a permissible node could satisfy the Pod”.
- Expected decision: Increase workload replicas through HPA and add nodes only when requested Pods no longer fit.
- Decisive boundary: node pools scaling — workload vs cluster scaling: evidence “HPA desired replicas; Pending Pods; allocatable node capacity” supports “Increase workload replicas through HPA and add nodes only when requested Pods no longer fit”. The neighboring evidence “pool maximum; regional quota; requested resource shape” instead supports diagnosis “Change the binding pool limit or quota only when a permissible node could satisfy the Pod”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:node_pools_scaling:isolate_node_pools_workload_resource_hardware_upgrade_needs:slot:hardware-specific-pool-choice

- Status: authoring-admitted
- Objective: node pools scaling — hardware specific pool: select “Provision the specialized pool and constrain only eligible Pods to it” under “special hardware; pool machine configuration; Pod placement rule” instead of the competing action “Give target Pods matching placement and toleration while protecting scarce nodes”.
- Expected decision: Provision the specialized pool and constrain only eligible Pods to it.
- Decisive boundary: node pools scaling — hardware specific pool: evidence “special hardware; pool machine configuration; Pod placement rule” supports “Provision the specialized pool and constrain only eligible Pods to it”. The neighboring evidence “node label; NoSchedule taint; selector and toleration” instead supports decision “Give target Pods matching placement and toleration while protecting scarce nodes”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:node_pools_scaling:isolate_node_pools_workload_resource_hardware_upgrade_needs:slot:label-taint-placement-boundary

- Status: authoring-admitted
- Objective: node pools scaling — label taint placement: verify that “node label; NoSchedule taint; selector and toleration” stays with “Give target Pods matching placement and toleration while protecting scarce nodes” and has not crossed into “Split pools only for a demonstrated node-level operational distinction”.
- Expected decision: Give target Pods matching placement and toleration while protecting scarce nodes.
- Decisive boundary: node pools scaling — label taint placement: evidence “node label; NoSchedule taint; selector and toleration” supports “Give target Pods matching placement and toleration while protecting scarce nodes”. The neighboring evidence “resource contention; maintenance tolerance; hardware or trust boundary” instead supports diagnosis “Split pools only for a demonstrated node-level operational distinction”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:node_pools_scaling:isolate_node_pools_workload_resource_hardware_upgrade_needs:slot:mixed-workload-diagnosis

- Status: authoring-admitted
- Objective: node pools scaling — mixed workload: trace “resource contention; maintenance tolerance; hardware or trust boundary” to “Split pools only for a demonstrated node-level operational distinction” instead of applying the competing remediation “Prepare matching destination nodes, update placement, and verify rescheduling before removing old capacity”.
- Expected decision: Split pools only for a demonstrated node-level operational distinction.
- Decisive boundary: node pools scaling — mixed workload: evidence “resource contention; maintenance tolerance; hardware or trust boundary” supports “Split pools only for a demonstrated node-level operational distinction”. The neighboring evidence “new resource need; changed taint and selector; destination capacity” instead supports decision “Prepare matching destination nodes, update placement, and verify rescheduling before removing old capacity”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:node_pools_scaling:isolate_node_pools_workload_resource_hardware_upgrade_needs:slot:resource-requirement-transfer

- Status: authoring-admitted
- Objective: Move a workload when its hardware, isolation, or maintenance requirement changes.
- Expected decision: Prepare matching destination nodes, update placement, and verify rescheduling before removing old capacity.
- Decisive boundary: Placement and destination capacity must agree before transfer completes.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:node_pools_scaling:isolate_node_pools_workload_resource_hardware_upgrade_needs:slot:upgrade-scope-choice

- Status: authoring-admitted
- Objective: node pools scaling — upgrade scope: select “Upgrade one pool at a time under the workload's disruption contract” under “version skew; maintenance window; drain disruption” instead of the competing action “Provision the specialized pool and constrain only eligible Pods to it”.
- Expected decision: Upgrade one pool at a time under the workload's disruption contract.
- Decisive boundary: node pools scaling — upgrade scope: evidence “version skew; maintenance window; drain disruption” supports “Upgrade one pool at a time under the workload's disruption contract”. The neighboring evidence “special hardware; pool machine configuration; Pod placement rule” instead supports decision “Provision the specialized pool and constrain only eligible Pods to it”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
