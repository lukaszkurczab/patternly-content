# microsoft-azure-administrator-associate-az-104 / azure_compute_network_operations_and_recovery / zones_and_availability_sets

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 7
- Authoring-admitted slots: 7
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_compute_network_operations_and_recovery/zones_and_availability_sets.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:zones_and_availability_sets:availability_zones_availability_sets_regional_support_failure_domain_requirements:slot:distinguish-zonal-resource-from-zone-redundant-service

- Status: authoring-admitted
- Objective: Separate a VM pinned to one zone from a service that replicates across zones.
- Expected decision: Deploy multiple zonal VMs and application redundancy instead of assuming one zonal VM is zone redundant.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:zones_and_availability_sets:availability_zones_availability_sets_regional_support_failure_domain_requirements:slot:select-availability-set-for-fault-and-update-domains

- Status: authoring-admitted
- Objective: Use an availability set for multiple classic VMs requiring fault/update-domain separation within a datacenter scope.
- Expected decision: Place the VMs in one availability set before creation where required.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:zones_and_availability_sets:availability_zones_availability_sets_regional_support_failure_domain_requirements:slot:select-availability-zone-for-datacenter-failure-isolation

- Status: authoring-admitted
- Objective: Place VM instances in separate availability zones when the region and VM size support zonal datacenter isolation.
- Expected decision: Deploy at least one healthy instance in each required zone.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:zones_and_availability_sets:availability_zones_availability_sets_regional_support_failure_domain_requirements:slot:validate-zone-support-in-region-and-vm-size

- Status: authoring-admitted
- Objective: Check both regional zone support and per-zone VM size capacity before choosing zonal placement.
- Expected decision: Select supported zones/size or redesign availability.
- Decisive boundary: A region with availability zones does not guarantee every VM SKU is available in every zone.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:zones_and_availability_sets:load_balanced_placement_survive_stated_platform_failure:slot:configure-health-probe-for-serving-readiness

- Status: authoring-admitted
- Objective: Probe an endpoint that represents actual application readiness, not merely an open host port.
- Expected decision: Remove unready instances from new-flow distribution.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:zones_and_availability_sets:load_balanced_placement_survive_stated_platform_failure:slot:distribute-backends-across-zones

- Status: authoring-admitted
- Objective: Spread independent backend instances across the zones named in the failure requirement.
- Expected decision: Keep traffic serving when one selected zone is unavailable.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:zones_and_availability_sets:load_balanced_placement_survive_stated_platform_failure:slot:validate-backend-capacity-after-one-zone-loss

- Status: authoring-admitted
- Objective: Calculate whether surviving backends can carry required traffic after the stated zone or fault-domain loss.
- Expected decision: Add capacity or reduce failure scope when the remainder is insufficient.
- Decisive boundary: Balanced placement alone does not guarantee enough capacity after failure.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
