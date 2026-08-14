# kubernetes-cloud-native-associate-kcna / cloud_native_kubernetes_and_service_operating_foundations / reconciliation_and_controllers

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 10
- Authoring-admitted slots: 10
- Blocked slots: 0
- Future source path: manual/source/kubernetes-cloud-native-associate-kcna/cloud_native_kubernetes_and_service_operating_foundations/reconciliation_and_controllers.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### kubernetes-cloud-native-associate-kcna:reconciliation_and_controllers:explain_controller_reconciliation_to_desired_state:slot:choose-controller-for-repeated-convergence

- Status: authoring-admitted
- Objective: Select the documented outcome “choose controller for repeated convergence” using desired state, observed state, watch event, controller action, and later convergence; do not rely on a product-name cue.
- Expected decision: The intended resolution is “choose controller for repeated convergence”; it preserves reconciliation-loop behavior rather than scheduling or direct execution, with the cited source behavior as the authority.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:reconciliation_and_controllers:explain_controller_reconciliation_to_desired_state:slot:classify-desired-vs-current-state

- Status: authoring-admitted
- Objective: Assess the material classification “classify desired vs current state” from documented evidence that a controller watches cluster state, compares current and desired state, and acts repeatedly to converge them.
- Expected decision: The intended resolution is “classify desired vs current state”; it preserves reconciliation-loop behavior rather than scheduling or direct execution, with the cited source behavior as the authority.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:reconciliation_and_controllers:explain_controller_reconciliation_to_desired_state:slot:diagnose-reconciliation-loop-not-one-shot-action

- Status: authoring-admitted
- Objective: Test the failure hypothesis “reconciliation loop not one shot action” against desired state, observed state, watch event, controller action, and later convergence before selecting a remediation owner.
- Expected decision: The intended resolution is “diagnose reconciliation loop not one shot action”; it preserves reconciliation-loop behavior rather than scheduling or direct execution, with the cited source behavior as the authority.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:reconciliation_and_controllers:explain_controller_reconciliation_to_desired_state:slot:distinguish-controller-from-scheduler

- Status: authoring-admitted
- Objective: Test the material boundary “controller from scheduler” using desired state, observed state, watch event, controller action, and later convergence; reject a surface-only restatement.
- Expected decision: The intended resolution is “distinguish controller from scheduler”; it preserves reconciliation-loop behavior rather than scheduling or direct execution, with the cited source behavior as the authority.
- Decisive boundary: The slot owns “distinguish controller from scheduler” only when desired state, observed state, watch event, controller action, and later convergence makes that result materially different and the result remains within reconciliation-loop behavior rather than scheduling or direct execution.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:reconciliation_and_controllers:explain_controller_reconciliation_to_desired_state:slot:sequence-watch-compare-act

- Status: authoring-admitted
- Objective: Order and validate the documented procedure “sequence watch compare act” according to how a controller watches cluster state, compares current and desired state, and acts repeatedly to converge them.
- Expected decision: The intended resolution is “sequence watch compare act”; it preserves reconciliation-loop behavior rather than scheduling or direct execution, with the cited source behavior as the authority.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:reconciliation_and_controllers:identify_controller_ownership_from_owner_reference:slot:choose-controller-owner-reference

- Status: authoring-admitted
- Objective: Select the documented outcome “choose controller owner reference” using owner UID, controller flag, namespace scope, dependent object, and deletion propagation; do not rely on a product-name cue.
- Expected decision: The intended resolution is “choose controller owner reference”; it preserves ownership and dependent lifecycle rather than set selection, with the cited source behavior as the authority.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:reconciliation_and_controllers:identify_controller_ownership_from_owner_reference:slot:classify-owner-and-dependent

- Status: authoring-admitted
- Objective: Assess the material classification “classify owner and dependent” from documented evidence that ownerReferences express dependency and garbage-collection ownership, while labels and selectors express grouping without ownership.
- Expected decision: The intended resolution is “classify owner and dependent”; it preserves ownership and dependent lifecycle rather than set selection, with the cited source behavior as the authority.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:reconciliation_and_controllers:identify_controller_ownership_from_owner_reference:slot:diagnose-dangling-or-cross-namespace-owner

- Status: authoring-admitted
- Objective: Test the failure hypothesis “dangling or cross namespace owner” against owner UID, controller flag, namespace scope, dependent object, and deletion propagation before selecting a remediation owner.
- Expected decision: The intended resolution is “diagnose dangling or cross namespace owner”; it preserves ownership and dependent lifecycle rather than set selection, with the cited source behavior as the authority.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:reconciliation_and_controllers:identify_controller_ownership_from_owner_reference:slot:distinguish-ownership-from-label-selection

- Status: authoring-admitted
- Objective: Test the material boundary “ownership from label selection” using owner UID, controller flag, namespace scope, dependent object, and deletion propagation; reject a surface-only restatement.
- Expected decision: The intended resolution is “distinguish ownership from label selection”; it preserves ownership and dependent lifecycle rather than set selection, with the cited source behavior as the authority.
- Decisive boundary: The slot owns “distinguish ownership from label selection” only when owner UID, controller flag, namespace scope, dependent object, and deletion propagation makes that result materially different and the result remains within ownership and dependent lifecycle rather than set selection.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:reconciliation_and_controllers:identify_controller_ownership_from_owner_reference:slot:sequence-cascading-deletion-effect

- Status: authoring-admitted
- Objective: Order and validate the documented procedure “sequence cascading deletion effect” according to how ownerReferences express dependency and garbage-collection ownership, while labels and selectors express grouping without ownership.
- Expected decision: The intended resolution is “sequence cascading deletion effect”; it preserves ownership and dependent lifecycle rather than set selection, with the cited source behavior as the authority.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
