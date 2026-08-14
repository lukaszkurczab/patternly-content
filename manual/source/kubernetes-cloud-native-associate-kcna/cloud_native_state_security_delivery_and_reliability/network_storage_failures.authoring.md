# kubernetes-cloud-native-associate-kcna / cloud_native_state_security_delivery_and_reliability / network_storage_failures

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 7
- Authoring-admitted slots: 7
- Blocked slots: 0
- Future source path: manual/source/kubernetes-cloud-native-associate-kcna/cloud_native_state_security_delivery_and_reliability/network_storage_failures.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### kubernetes-cloud-native-associate-kcna:network_storage_failures:classify_network_storage_failures_evidence:slot:diagnose-dns-resolution-failure

- Status: authoring-admitted
- Objective: Test the failure hypothesis “dns resolution failure” against DNS result, endpoints, policy decision, claim phase, StorageClass, attach or mount event, and application dependency before selecting a remediation owner.
- Expected decision: The intended resolution is “diagnose dns resolution failure”; it preserves network-versus-storage failure ownership, with the cited source behavior as the authority.
- Decisive boundary: The slot owns “diagnose dns resolution failure” only when DNS result, endpoints, policy decision, claim phase, StorageClass, attach or mount event, and application dependency makes that result materially different and the result remains within network-versus-storage failure ownership.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:network_storage_failures:classify_network_storage_failures_evidence:slot:diagnose-network-policy-denial

- Status: authoring-admitted
- Objective: Test the failure hypothesis “network policy denial” against DNS result, endpoints, policy decision, claim phase, StorageClass, attach or mount event, and application dependency before selecting a remediation owner.
- Expected decision: The intended resolution is “diagnose network policy denial”; it preserves network-versus-storage failure ownership, with the cited source behavior as the authority.
- Decisive boundary: The slot owns “diagnose network policy denial” only when DNS result, endpoints, policy decision, claim phase, StorageClass, attach or mount event, and application dependency makes that result materially different and the result remains within network-versus-storage failure ownership.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:network_storage_failures:classify_network_storage_failures_evidence:slot:diagnose-pvc-binding-failure

- Status: authoring-admitted
- Objective: Test the failure hypothesis “pvc binding failure” against DNS result, endpoints, policy decision, claim phase, StorageClass, attach or mount event, and application dependency before selecting a remediation owner.
- Expected decision: The intended resolution is “diagnose pvc binding failure”; it preserves network-versus-storage failure ownership, with the cited source behavior as the authority.
- Decisive boundary: The slot owns “diagnose pvc binding failure” only when DNS result, endpoints, policy decision, claim phase, StorageClass, attach or mount event, and application dependency makes that result materially different and the result remains within network-versus-storage failure ownership.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:network_storage_failures:classify_network_storage_failures_evidence:slot:diagnose-service-selector-failure

- Status: authoring-admitted
- Objective: Test the failure hypothesis “service selector failure” against DNS result, endpoints, policy decision, claim phase, StorageClass, attach or mount event, and application dependency before selecting a remediation owner.
- Expected decision: The intended resolution is “diagnose service selector failure”; it preserves network-versus-storage failure ownership, with the cited source behavior as the authority.
- Decisive boundary: The slot owns “diagnose service selector failure” only when DNS result, endpoints, policy decision, claim phase, StorageClass, attach or mount event, and application dependency makes that result materially different and the result remains within network-versus-storage failure ownership.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:network_storage_failures:classify_network_storage_failures_evidence:slot:diagnose-volume-mount-failure

- Status: authoring-admitted
- Objective: Test the failure hypothesis “volume mount failure” against DNS result, endpoints, policy decision, claim phase, StorageClass, attach or mount event, and application dependency before selecting a remediation owner.
- Expected decision: The intended resolution is “diagnose volume mount failure”; it preserves network-versus-storage failure ownership, with the cited source behavior as the authority.
- Decisive boundary: The slot owns “diagnose volume mount failure” only when DNS result, endpoints, policy decision, claim phase, StorageClass, attach or mount event, and application dependency makes that result materially different and the result remains within network-versus-storage failure ownership.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:network_storage_failures:classify_network_storage_failures_evidence:slot:distinguish-network-symptom-from-storage-dependency

- Status: authoring-admitted
- Objective: Test the material boundary “network symptom from storage dependency” using DNS result, endpoints, policy decision, claim phase, StorageClass, attach or mount event, and application dependency; reject a surface-only restatement.
- Expected decision: The intended resolution is “distinguish network symptom from storage dependency”; it preserves network-versus-storage failure ownership, with the cited source behavior as the authority.
- Decisive boundary: The slot owns “distinguish network symptom from storage dependency” only when DNS result, endpoints, policy decision, claim phase, StorageClass, attach or mount event, and application dependency makes that result materially different and the result remains within network-versus-storage failure ownership.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### kubernetes-cloud-native-associate-kcna:network_storage_failures:classify_network_storage_failures_evidence:slot:sequence-endpoint-dns-policy-checks

- Status: authoring-admitted
- Objective: Order and validate the documented procedure “sequence endpoint dns policy checks” according to how Service selectors, DNS, NetworkPolicy, claim binding, and volume mount events isolate network and storage dependencies at different checkpoints.
- Expected decision: The intended resolution is “sequence endpoint dns policy checks”; it preserves network-versus-storage failure ownership, with the cited source behavior as the authority.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
