# microsoft-azure-administrator-associate-az-104 / azure_compute_network_operations_and_recovery / network_watcher_connection_monitor

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 5
- Authoring-admitted slots: 5
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_compute_network_operations_and_recovery/network_watcher_connection_monitor.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:network_watcher_connection_monitor:classify_network_watcher_connection_monitor_evidence:slot:distinguish-route-success-from-end-to-end-connectivity

- Status: authoring-admitted
- Objective: Do not treat a valid next hop as proof that NSG, firewall, listener, and return path all succeed.
- Expected decision: Continue to end-to-end testing after route validation.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:network_watcher_connection_monitor:classify_network_watcher_connection_monitor_evidence:slot:select-connection-monitor-for-continuous-endpoint-test

- Status: authoring-admitted
- Objective: Use Connection Monitor when reachability and latency must be measured continuously and alerted over time.
- Expected decision: Create the monitor and route its results to the operational workflow.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:network_watcher_connection_monitor:classify_network_watcher_connection_monitor_evidence:slot:select-connection-troubleshoot-for-point-in-time-path

- Status: authoring-admitted
- Objective: Use Connection troubleshoot for an on-demand reachability and latency check between supported endpoints.
- Expected decision: Use the failed hop or probe result to select the next diagnostic layer.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:network_watcher_connection_monitor:classify_network_watcher_connection_monitor_evidence:slot:select-ip-flow-verify-for-nsg-decision

- Status: authoring-admitted
- Objective: Use IP flow verify for a specific VM NIC five-tuple when the question is which NSG rule allows or denies it.
- Expected decision: Read the allowing/denying rule and correct the effective NSG configuration.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:network_watcher_connection_monitor:classify_network_watcher_connection_monitor_evidence:slot:select-next-hop-for-route-decision

- Status: authoring-admitted
- Objective: Use Next hop for a VM-to-destination pair when the winning route and next-hop type are in doubt.
- Expected decision: Compare the result with intended UDR/peering/gateway design.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
