# kubernetes-cloud-native-associate-kcna / cloud_native_state_security_delivery_and_reliability / rollout_rollback_versioning

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 13
- Authoring-admitted slots: 13
- Blocked slots: 0
- Future source path: manual/source/kubernetes-cloud-native-associate-kcna/cloud_native_state_security_delivery_and_reliability/rollout_rollback_versioning.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### kubernetes-cloud-native-associate-kcna:rollout_rollback_versioning:post_rollback_revision_validation:slot:diagnose-rollback-that-preserves-external-failure

- Status: authoring-admitted
- Objective: Test the failure hypothesis “rollback that preserves external failure” against revision, template image or config, available replicas, Pod state, Service endpoints, and original symptom before selecting a remediation owner.
- Expected decision: The intended resolution is “diagnose rollback that preserves external failure”; it preserves post-rollback outcome validation, with the cited source behavior as the authority.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:rollout_rollback_versioning:post_rollback_revision_validation:slot:distinguish-revision-change-from-healthy-outcome

- Status: authoring-admitted
- Objective: Test the material boundary “revision change from healthy outcome” using revision, template image or config, available replicas, Pod state, Service endpoints, and original symptom; reject a surface-only restatement.
- Expected decision: The intended resolution is “distinguish revision change from healthy outcome”; it preserves post-rollback outcome validation, with the cited source behavior as the authority.
- Decisive boundary: The slot owns “distinguish revision change from healthy outcome” only when revision, template image or config, available replicas, Pod state, Service endpoints, and original symptom makes that result materially different and the result remains within post-rollback outcome validation.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:rollout_rollback_versioning:post_rollback_revision_validation:slot:identify-deployment-revision

- Status: authoring-admitted
- Objective: Assess the material classification “identify deployment revision” from documented evidence that a rollback changes a Deployment revision but success requires validating template, rollout completion, Pods, endpoints, and user-visible behavior.
- Expected decision: The intended resolution is “identify deployment revision”; it preserves post-rollback outcome validation, with the cited source behavior as the authority.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:rollout_rollback_versioning:post_rollback_revision_validation:slot:validate-pod-template-after-rollback

- Status: authoring-admitted
- Objective: Order and validate the documented procedure “validate pod template after rollback” according to how a rollback changes a Deployment revision but success requires validating template, rollout completion, Pods, endpoints, and user-visible behavior.
- Expected decision: The intended resolution is “validate pod template after rollback”; it preserves post-rollback outcome validation, with the cited source behavior as the authority.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:rollout_rollback_versioning:post_rollback_revision_validation:slot:validate-rollout-completion

- Status: authoring-admitted
- Objective: Order and validate the documented procedure “validate rollout completion” according to how a rollback changes a Deployment revision but success requires validating template, rollout completion, Pods, endpoints, and user-visible behavior.
- Expected decision: The intended resolution is “validate rollout completion”; it preserves post-rollback outcome validation, with the cited source behavior as the authority.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:rollout_rollback_versioning:post_rollback_revision_validation:slot:validate-service-endpoints-after-rollback

- Status: authoring-admitted
- Objective: Order and validate the documented procedure “validate service endpoints after rollback” according to how a rollback changes a Deployment revision but success requires validating template, rollout completion, Pods, endpoints, and user-visible behavior.
- Expected decision: The intended resolution is “validate service endpoints after rollback”; it preserves post-rollback outcome validation, with the cited source behavior as the authority.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:rollout_rollback_versioning:rollout_or_rollback_decision:slot:choose-rollback-to-revision

- Status: authoring-admitted
- Objective: Select the documented outcome “choose rollback to revision” using new template, replica availability, rollout status, progress deadline, revision history, and cluster capacity; do not rely on a product-name cue.
- Expected decision: The intended resolution is “choose rollback to revision”; it preserves Deployment rollout control, with the cited source behavior as the authority.
- Decisive boundary: The slot owns “choose rollback to revision” only when new template, replica availability, rollout status, progress deadline, revision history, and cluster capacity makes that result materially different and the result remains within Deployment rollout control.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:rollout_rollback_versioning:rollout_or_rollback_decision:slot:choose-rolling-update

- Status: authoring-admitted
- Objective: Select the documented outcome “choose rolling update” using new template, replica availability, rollout status, progress deadline, revision history, and cluster capacity; do not rely on a product-name cue.
- Expected decision: The intended resolution is “choose rolling update”; it preserves Deployment rollout control, with the cited source behavior as the authority.
- Decisive boundary: The slot owns “choose rolling update” only when new template, replica availability, rollout status, progress deadline, revision history, and cluster capacity makes that result materially different and the result remains within Deployment rollout control.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:rollout_rollback_versioning:rollout_or_rollback_decision:slot:diagnose-progress-deadline-failure

- Status: authoring-admitted
- Objective: Test the failure hypothesis “progress deadline failure” against new template, replica availability, rollout status, progress deadline, revision history, and cluster capacity before selecting a remediation owner.
- Expected decision: The intended resolution is “diagnose progress deadline failure”; it preserves Deployment rollout control, with the cited source behavior as the authority.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:rollout_rollback_versioning:rollout_or_rollback_decision:slot:distinguish-restart-rollout-from-rollback

- Status: authoring-admitted
- Objective: Test the material boundary “restart rollout from rollback” using new template, replica availability, rollout status, progress deadline, revision history, and cluster capacity; reject a surface-only restatement.
- Expected decision: The intended resolution is “distinguish restart rollout from rollback”; it preserves Deployment rollout control, with the cited source behavior as the authority.
- Decisive boundary: The slot owns “distinguish restart rollout from rollback” only when new template, replica availability, rollout status, progress deadline, revision history, and cluster capacity makes that result materially different and the result remains within Deployment rollout control.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:rollout_rollback_versioning:rollout_or_rollback_decision:slot:inspect-rollout-status

- Status: authoring-admitted
- Objective: Order and validate the documented procedure “inspect rollout status” according to how Deployment rollout status, revisions, progress deadlines, pause or resume, and rollback operations expose update health and recovery choices.
- Expected decision: The intended resolution is “inspect rollout status”; it preserves Deployment rollout control, with the cited source behavior as the authority.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:rollout_rollback_versioning:rollout_or_rollback_decision:slot:pause-resume-rollout

- Status: authoring-admitted
- Objective: Order and validate the documented procedure “pause resume rollout” according to how Deployment rollout status, revisions, progress deadlines, pause or resume, and rollback operations expose update health and recovery choices.
- Expected decision: The intended resolution is “pause resume rollout”; it preserves Deployment rollout control, with the cited source behavior as the authority.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:rollout_rollback_versioning:rollout_or_rollback_decision:slot:sequence-update-observe-rollback

- Status: authoring-admitted
- Objective: Order and validate the documented procedure “sequence update observe rollback” according to how Deployment rollout status, revisions, progress deadlines, pause or resume, and rollback operations expose update health and recovery choices.
- Expected decision: The intended resolution is “sequence update observe rollback”; it preserves Deployment rollout control, with the cited source behavior as the authority.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
