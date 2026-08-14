# kubernetes-cloud-native-associate-kcna / cloud_native_state_security_delivery_and_reliability / scheduling_workload_failures

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 7
- Authoring-admitted slots: 7
- Blocked slots: 0
- Future source path: manual/source/kubernetes-cloud-native-associate-kcna/cloud_native_state_security_delivery_and_reliability/scheduling_workload_failures.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### kubernetes-cloud-native-associate-kcna:scheduling_workload_failures:classify_scheduling_workload_failures_evidence:slot:choose-constraint-remediation

- Status: authoring-admitted
- Objective: Select the documented outcome “choose constraint remediation” using PodScheduled condition, waiting reason, termination reason, kubelet event, image state, and logs; do not rely on a product-name cue.
- Expected decision: The intended resolution is “choose constraint remediation”; it preserves failure-stage classification, with the cited source behavior as the authority.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:scheduling_workload_failures:classify_scheduling_workload_failures_evidence:slot:diagnose-crash-loop-application-failure

- Status: authoring-admitted
- Objective: Test the failure hypothesis “crash loop application failure” against PodScheduled condition, waiting reason, termination reason, kubelet event, image state, and logs before selecting a remediation owner.
- Expected decision: The intended resolution is “diagnose crash loop application failure”; it preserves failure-stage classification, with the cited source behavior as the authority.
- Decisive boundary: The slot owns “diagnose crash loop application failure” only when PodScheduled condition, waiting reason, termination reason, kubelet event, image state, and logs makes that result materially different and the result remains within failure-stage classification.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:scheduling_workload_failures:classify_scheduling_workload_failures_evidence:slot:diagnose-image-pull-failure

- Status: authoring-admitted
- Objective: Test the failure hypothesis “image pull failure” against PodScheduled condition, waiting reason, termination reason, kubelet event, image state, and logs before selecting a remediation owner.
- Expected decision: The intended resolution is “diagnose image pull failure”; it preserves failure-stage classification, with the cited source behavior as the authority.
- Decisive boundary: The slot owns “diagnose image pull failure” only when PodScheduled condition, waiting reason, termination reason, kubelet event, image state, and logs makes that result materially different and the result remains within failure-stage classification.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:scheduling_workload_failures:classify_scheduling_workload_failures_evidence:slot:diagnose-kubelet-startup-failure

- Status: authoring-admitted
- Objective: Test the failure hypothesis “kubelet startup failure” against PodScheduled condition, waiting reason, termination reason, kubelet event, image state, and logs before selecting a remediation owner.
- Expected decision: The intended resolution is “diagnose kubelet startup failure”; it preserves failure-stage classification, with the cited source behavior as the authority.
- Decisive boundary: The slot owns “diagnose kubelet startup failure” only when PodScheduled condition, waiting reason, termination reason, kubelet event, image state, and logs makes that result materially different and the result remains within failure-stage classification.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:scheduling_workload_failures:classify_scheduling_workload_failures_evidence:slot:diagnose-scheduler-placement-failure

- Status: authoring-admitted
- Objective: Test the failure hypothesis “scheduler placement failure” against PodScheduled condition, waiting reason, termination reason, kubelet event, image state, and logs before selecting a remediation owner.
- Expected decision: The intended resolution is “diagnose scheduler placement failure”; it preserves failure-stage classification, with the cited source behavior as the authority.
- Decisive boundary: The slot owns “diagnose scheduler placement failure” only when PodScheduled condition, waiting reason, termination reason, kubelet event, image state, and logs makes that result materially different and the result remains within failure-stage classification.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:scheduling_workload_failures:classify_scheduling_workload_failures_evidence:slot:distinguish-pending-scheduling-from-waiting-container

- Status: authoring-admitted
- Objective: Test the material boundary “pending scheduling from waiting container” using PodScheduled condition, waiting reason, termination reason, kubelet event, image state, and logs; reject a surface-only restatement.
- Expected decision: The intended resolution is “distinguish pending scheduling from waiting container”; it preserves failure-stage classification, with the cited source behavior as the authority.
- Decisive boundary: The slot owns “distinguish pending scheduling from waiting container” only when PodScheduled condition, waiting reason, termination reason, kubelet event, image state, and logs makes that result materially different and the result remains within failure-stage classification.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:scheduling_workload_failures:classify_scheduling_workload_failures_evidence:slot:sequence-events-to-container-state

- Status: authoring-admitted
- Objective: Order and validate the documented procedure “sequence events to container state” according to how scheduler placement, kubelet startup, image pull, and application crash failures occupy different Pod lifecycle states and evidence sources.
- Expected decision: The intended resolution is “sequence events to container state”; it preserves failure-stage classification, with the cited source behavior as the authority.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
