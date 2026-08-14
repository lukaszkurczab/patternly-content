# microsoft-azure-administrator-associate-az-104 / azure_compute_network_operations_and_recovery / vm_create_size_disk_encryption

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 14
- Authoring-admitted slots: 14
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_compute_network_operations_and_recovery/vm_create_size_disk_encryption.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:vm_create_size_disk_encryption:vm_compute_size_selection:slot:calculate-network-and-disk-throughput-ceilings

- Status: authoring-admitted
- Objective: Check VM-level network, disk throughput, IOPS, data-disk count, regional availability, and quota before finalizing the size.
- Expected decision: Increase size, quota, or redesign when any VM-level ceiling is below demand.
- Decisive boundary: A disk SKU's own limit cannot exceed the VM size's aggregate disk ceiling.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:vm_create_size_disk_encryption:vm_compute_size_selection:slot:select-compute-optimized-size-for-cpu-bound-workload

- Status: authoring-admitted
- Objective: Choose a compute-optimized family when CPU demand dominates memory demand.
- Expected decision: Size for required vCPUs while confirming memory remains sufficient.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:vm_create_size_disk_encryption:vm_compute_size_selection:slot:select-general-purpose-size-for-balanced-workload

- Status: authoring-admitted
- Objective: Choose a general-purpose VM family for a balanced CPU-to-memory workload without accelerator requirements.
- Expected decision: Select the smallest size meeting steady-state and burst needs.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:vm_create_size_disk_encryption:vm_compute_size_selection:slot:select-gpu-size-for-accelerated-workload

- Status: authoring-admitted
- Objective: Choose a GPU size only when the workload framework and driver stack can use the offered accelerator.
- Expected decision: Use the supported GPU family and image/driver combination.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:vm_create_size_disk_encryption:vm_compute_size_selection:slot:select-memory-optimized-size-for-memory-bound-workload

- Status: authoring-admitted
- Objective: Choose a memory-optimized family when the working set, cache, or database requires high memory per vCPU.
- Expected decision: Select a memory-optimized size that holds the working set.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:vm_create_size_disk_encryption:vm_disk_encryption_control:slot:classify-server-side-encryption-with-platform-key

- Status: authoring-admitted
- Objective: Recognize platform-managed server-side encryption as the default managed-disk at-rest protection.
- Expected decision: Use the platform key when customer key ownership is not required.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:vm_create_size_disk_encryption:vm_disk_encryption_control:slot:diagnose-key-vault-permission-or-key-state-failure

- Status: authoring-admitted
- Objective: Trace a CMK disk failure to disabled/expired key, inaccessible vault, or missing disk-encryption-set permissions.
- Expected decision: Restore supported key access before retrying the VM or disk operation.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:vm_create_size_disk_encryption:vm_disk_encryption_control:slot:select-customer-managed-key-for-key-control

- Status: authoring-admitted
- Objective: Use a disk encryption set with a customer-managed key when key ownership, rotation, or revocation is required.
- Expected decision: Authorize the identity and associate supported disks with the encryption set.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:vm_create_size_disk_encryption:vm_disk_encryption_control:slot:select-encryption-at-host-for-host-boundary

- Status: authoring-admitted
- Objective: Enable encryption at host when temporary disks and host-side caches must be encrypted before storage service transmission.
- Expected decision: Enable the feature on a supported VM or scale set.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:vm_create_size_disk_encryption:vm_disk_type_and_lifecycle:slot:classify-os-data-temporary-disk-lifecycle

- Status: authoring-admitted
- Objective: Separate the persistent OS and data managed disks from host-local temporary disk storage.
- Expected decision: Keep durable application data off the temporary disk.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:vm_create_size_disk_encryption:vm_disk_type_and_lifecycle:slot:diagnose-temporary-disk-data-loss

- Status: authoring-admitted
- Objective: Recognize missing files after redeploy or host maintenance as use of nonpersistent temporary storage.
- Expected decision: Restore from durable storage and move persistent data to a managed data disk.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:vm_create_size_disk_encryption:vm_disk_type_and_lifecycle:slot:select-premium-ssd-for-latency-iops

- Status: authoring-admitted
- Objective: Choose Premium SSD when the workload needs supported low latency and provisioned IOPS/throughput.
- Expected decision: Provision the disk size/tier and VM size that jointly meet performance.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:vm_create_size_disk_encryption:vm_disk_type_and_lifecycle:slot:select-standard-ssd-for-lower-cost-consistency

- Status: authoring-admitted
- Objective: Choose Standard SSD for lower-cost workloads needing more consistent latency than Standard HDD.
- Expected decision: Use Standard SSD only when its performance limits satisfy the workload.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:vm_create_size_disk_encryption:vm_disk_type_and_lifecycle:slot:select-ultra-or-premium-v2-for-configurable-performance

- Status: authoring-admitted
- Objective: Choose Ultra Disk or Premium SSD v2 when independently configurable IOPS and throughput are required and supported.
- Expected decision: Select the supported SKU and provision explicit performance values.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
