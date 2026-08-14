# microsoft-azure-administrator-associate-az-104 / azure_compute_network_operations_and_recovery / dns

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 4
- Authoring-admitted slots: 4
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_compute_network_operations_and_recovery/dns.json
- Interaction allocation: choice
- Mode contribution: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:dns:classify_dns_evidence:slot:configure-vnet-link-for-private-zone

- Status: authoring-admitted
- Objective: Create a resolution link for every VNet that must query the private zone and enable autoregistration only for the intended VNet.
- Expected decision: Separate resolution-only links from the single intended registration behavior.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:dns:classify_dns_evidence:slot:diagnose-split-horizon-public-answer-inside-vnet

- Status: authoring-admitted
- Objective: Recognize that an internal client receiving the public record is not using the intended private zone path.
- Expected decision: Fix private-zone linkage or DNS forwarding for that client network.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:dns:classify_dns_evidence:slot:select-private-zone-for-vnet-resolution

- Status: authoring-admitted
- Objective: Use a private DNS zone for names that should resolve only through linked/forwarded virtual networks.
- Expected decision: Link authorized VNets and create private records.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:dns:classify_dns_evidence:slot:select-public-zone-for-internet-authoritative-record

- Status: authoring-admitted
- Objective: Use an Azure public DNS zone to host records delegated from the public DNS parent.
- Expected decision: Delegate nameservers and create the authoritative public record.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
