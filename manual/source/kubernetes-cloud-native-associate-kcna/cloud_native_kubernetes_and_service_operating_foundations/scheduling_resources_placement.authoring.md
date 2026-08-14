# kubernetes-cloud-native-associate-kcna / cloud_native_kubernetes_and_service_operating_foundations / scheduling_resources_placement

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 13
- Authoring-admitted slots: 13
- Blocked slots: 0
- Future source path: manual/source/kubernetes-cloud-native-associate-kcna/cloud_native_kubernetes_and_service_operating_foundations/scheduling_resources_placement.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### kubernetes-cloud-native-associate-kcna:scheduling_resources_placement:diagnose_unschedulable_pod_from_scheduler_evidence:slot:diagnose-insufficient-requested-resources

- Status: authoring-admitted
- Objective: Test the failure hypothesis “insufficient requested resources” against PodScheduled condition, scheduler event reason, requested resources, eligible nodes, taints, affinity, and gates before selecting a remediation owner.
- Expected decision: The intended resolution is “diagnose insufficient requested resources”; it preserves pre-bind scheduling failure rather than image or application startup, with the cited source behavior as the authority.
- Decisive boundary: The slot owns “diagnose insufficient requested resources” only when PodScheduled condition, scheduler event reason, requested resources, eligible nodes, taints, affinity, and gates makes that result materially different and the result remains within pre-bind scheduling failure rather than image or application startup.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:scheduling_resources_placement:diagnose_unschedulable_pod_from_scheduler_evidence:slot:diagnose-required-affinity-conflict

- Status: authoring-admitted
- Objective: Test the failure hypothesis “required affinity conflict” against PodScheduled condition, scheduler event reason, requested resources, eligible nodes, taints, affinity, and gates before selecting a remediation owner.
- Expected decision: The intended resolution is “diagnose required affinity conflict”; it preserves pre-bind scheduling failure rather than image or application startup, with the cited source behavior as the authority.
- Decisive boundary: The slot owns “diagnose required affinity conflict” only when PodScheduled condition, scheduler event reason, requested resources, eligible nodes, taints, affinity, and gates makes that result materially different and the result remains within pre-bind scheduling failure rather than image or application startup.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:scheduling_resources_placement:diagnose_unschedulable_pod_from_scheduler_evidence:slot:diagnose-scheduling-gate

- Status: authoring-admitted
- Objective: Test the failure hypothesis “scheduling gate” against PodScheduled condition, scheduler event reason, requested resources, eligible nodes, taints, affinity, and gates before selecting a remediation owner.
- Expected decision: The intended resolution is “diagnose scheduling gate”; it preserves pre-bind scheduling failure rather than image or application startup, with the cited source behavior as the authority.
- Decisive boundary: The slot owns “diagnose scheduling gate” only when PodScheduled condition, scheduler event reason, requested resources, eligible nodes, taints, affinity, and gates makes that result materially different and the result remains within pre-bind scheduling failure rather than image or application startup.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:scheduling_resources_placement:diagnose_unschedulable_pod_from_scheduler_evidence:slot:diagnose-unmatched-node-selector

- Status: authoring-admitted
- Objective: Test the failure hypothesis “unmatched node selector” against PodScheduled condition, scheduler event reason, requested resources, eligible nodes, taints, affinity, and gates before selecting a remediation owner.
- Expected decision: The intended resolution is “diagnose unmatched node selector”; it preserves pre-bind scheduling failure rather than image or application startup, with the cited source behavior as the authority.
- Decisive boundary: The slot owns “diagnose unmatched node selector” only when PodScheduled condition, scheduler event reason, requested resources, eligible nodes, taints, affinity, and gates makes that result materially different and the result remains within pre-bind scheduling failure rather than image or application startup.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:scheduling_resources_placement:diagnose_unschedulable_pod_from_scheduler_evidence:slot:diagnose-untolerated-taint

- Status: authoring-admitted
- Objective: Test the failure hypothesis “untolerated taint” against PodScheduled condition, scheduler event reason, requested resources, eligible nodes, taints, affinity, and gates before selecting a remediation owner.
- Expected decision: The intended resolution is “diagnose untolerated taint”; it preserves pre-bind scheduling failure rather than image or application startup, with the cited source behavior as the authority.
- Decisive boundary: The slot owns “diagnose untolerated taint” only when PodScheduled condition, scheduler event reason, requested resources, eligible nodes, taints, affinity, and gates makes that result materially different and the result remains within pre-bind scheduling failure rather than image or application startup.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:scheduling_resources_placement:diagnose_unschedulable_pod_from_scheduler_evidence:slot:distinguish-pending-image-pull-from-unschedulable

- Status: authoring-admitted
- Objective: Test the material boundary “pending image pull from unschedulable” using PodScheduled condition, scheduler event reason, requested resources, eligible nodes, taints, affinity, and gates; reject a surface-only restatement.
- Expected decision: The intended resolution is “distinguish pending image pull from unschedulable”; it preserves pre-bind scheduling failure rather than image or application startup, with the cited source behavior as the authority.
- Decisive boundary: The slot owns “distinguish pending image pull from unschedulable” only when PodScheduled condition, scheduler event reason, requested resources, eligible nodes, taints, affinity, and gates makes that result materially different and the result remains within pre-bind scheduling failure rather than image or application startup.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:scheduling_resources_placement:diagnose_unschedulable_pod_from_scheduler_evidence:slot:sequence-scheduler-event-evidence

- Status: authoring-admitted
- Objective: Order and validate the documented procedure “sequence scheduler event evidence” according to how scheduler events distinguish insufficient resources, unmatched selectors or affinity, untolerated taints, and scheduling gates.
- Expected decision: The intended resolution is “sequence scheduler event evidence”; it preserves pre-bind scheduling failure rather than image or application startup, with the cited source behavior as the authority.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:scheduling_resources_placement:set_resource_requests_and_placement_constraints:slot:choose-affinity-for-expressive-placement

- Status: authoring-admitted
- Objective: Select the documented outcome “choose affinity for expressive placement” using requested capacity, limit, node labels, selector or affinity rule, taint, toleration, and requirement strength; do not rely on a product-name cue.
- Expected decision: The intended resolution is “choose affinity for expressive placement”; it preserves declared scheduling and resource constraints, with the cited source behavior as the authority.
- Decisive boundary: The slot owns “choose affinity for expressive placement” only when requested capacity, limit, node labels, selector or affinity rule, taint, toleration, and requirement strength makes that result materially different and the result remains within declared scheduling and resource constraints.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:scheduling_resources_placement:set_resource_requests_and_placement_constraints:slot:choose-cpu-memory-requests-for-scheduling

- Status: authoring-admitted
- Objective: Select the documented outcome “choose cpu memory requests for scheduling” using requested capacity, limit, node labels, selector or affinity rule, taint, toleration, and requirement strength; do not rely on a product-name cue.
- Expected decision: The intended resolution is “choose cpu memory requests for scheduling”; it preserves declared scheduling and resource constraints, with the cited source behavior as the authority.
- Decisive boundary: The slot owns “choose cpu memory requests for scheduling” only when requested capacity, limit, node labels, selector or affinity rule, taint, toleration, and requirement strength makes that result materially different and the result remains within declared scheduling and resource constraints.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:scheduling_resources_placement:set_resource_requests_and_placement_constraints:slot:choose-limits-for-runtime-enforcement

- Status: authoring-admitted
- Objective: Select the documented outcome “choose limits for runtime enforcement” using requested capacity, limit, node labels, selector or affinity rule, taint, toleration, and requirement strength; do not rely on a product-name cue.
- Expected decision: The intended resolution is “choose limits for runtime enforcement”; it preserves declared scheduling and resource constraints, with the cited source behavior as the authority.
- Decisive boundary: The slot owns “choose limits for runtime enforcement” only when requested capacity, limit, node labels, selector or affinity rule, taint, toleration, and requirement strength makes that result materially different and the result remains within declared scheduling and resource constraints.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:scheduling_resources_placement:set_resource_requests_and_placement_constraints:slot:choose-nodeselector-for-exact-label

- Status: authoring-admitted
- Objective: Select the documented outcome “choose nodeselector for exact label” using requested capacity, limit, node labels, selector or affinity rule, taint, toleration, and requirement strength; do not rely on a product-name cue.
- Expected decision: The intended resolution is “choose nodeselector for exact label”; it preserves declared scheduling and resource constraints, with the cited source behavior as the authority.
- Decisive boundary: The slot owns “choose nodeselector for exact label” only when requested capacity, limit, node labels, selector or affinity rule, taint, toleration, and requirement strength makes that result materially different and the result remains within declared scheduling and resource constraints.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:scheduling_resources_placement:set_resource_requests_and_placement_constraints:slot:choose-toleration-for-matching-taint

- Status: authoring-admitted
- Objective: Select the documented outcome “choose toleration for matching taint” using requested capacity, limit, node labels, selector or affinity rule, taint, toleration, and requirement strength; do not rely on a product-name cue.
- Expected decision: The intended resolution is “choose toleration for matching taint”; it preserves declared scheduling and resource constraints, with the cited source behavior as the authority.
- Decisive boundary: The slot owns “choose toleration for matching taint” only when requested capacity, limit, node labels, selector or affinity rule, taint, toleration, and requirement strength makes that result materially different and the result remains within declared scheduling and resource constraints.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:scheduling_resources_placement:set_resource_requests_and_placement_constraints:slot:distinguish-preference-from-requirement

- Status: authoring-admitted
- Objective: Test the material boundary “preference from requirement” using requested capacity, limit, node labels, selector or affinity rule, taint, toleration, and requirement strength; reject a surface-only restatement.
- Expected decision: The intended resolution is “distinguish preference from requirement”; it preserves declared scheduling and resource constraints, with the cited source behavior as the authority.
- Decisive boundary: The slot owns “distinguish preference from requirement” only when requested capacity, limit, node labels, selector or affinity rule, taint, toleration, and requirement strength makes that result materially different and the result remains within declared scheduling and resource constraints.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
