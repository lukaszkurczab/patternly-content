# google-cloud-associate-cloud-engineer / compute_engine_delivery_and_operations / instance_disks_availability_os_login

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 11
- Authoring-admitted slots: 11
- Blocked slots: 0
- Future source path: manual/source/google-cloud-associate-cloud-engineer/compute_engine_delivery_and_operations/instance_disks_availability_os_login.json
- Interaction allocation: choice
- Mode contribution: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### google-cloud-associate-cloud-engineer:instance_disks_availability_os_login:boot_persistent_local_ssd_regional_disk_configuration_persistence_failure_needs:slot:attachment-mode-diagnosis

- Status: authoring-admitted
- Objective: instance disks availability os login — attachment mode: trace “requested read-write attachment count; volume and VM zone or region; disk type attachment capability” to “Attribute the attachment failure to an unsupported access mode or location pairing before changing storage products” instead of applying the competing remediation “Use durable block storage for the boot disk and model separately managed durable storage as a data disk”.
- Expected decision: Attribute the attachment failure to an unsupported access mode or location pairing before changing storage products.
- Decisive boundary: instance disks availability os login — attachment mode: evidence “requested read-write attachment count; volume and VM zone or region; disk type attachment capability” supports “Attribute the attachment failure to an unsupported access mode or location pairing before changing storage products”. The neighboring evidence “operating-system boot requirement; data lifecycle independent of the VM; need to detach and reattach the volume” instead supports classification “Use durable block storage for the boot disk and model separately managed durable storage as a data disk”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:instance_disks_availability_os_login:boot_persistent_local_ssd_regional_disk_configuration_persistence_failure_needs:slot:boot-vs-data-disk-classification

- Status: authoring-admitted
- Objective: instance disks availability os login — boot vs data disk: classify “operating-system boot requirement; data lifecycle independent of the VM; need to detach and reattach the volume” as “Use durable block storage for the boot disk and model separately managed durable storage as a data disk”, while separating the competing classification “Move from any durable zonal volume to a supported regional replicated volume when the data must remain available through a zonal failure”.
- Expected decision: Use durable block storage for the boot disk and model separately managed durable storage as a data disk.
- Decisive boundary: instance disks availability os login — boot vs data disk: evidence “operating-system boot requirement; data lifecycle independent of the VM; need to detach and reattach the volume” supports “Use durable block storage for the boot disk and model separately managed durable storage as a data disk”. The neighboring evidence “required survival of a VM deletion; required survival of a zone outage; replication across two zones” instead supports decision “Move from any durable zonal volume to a supported regional replicated volume when the data must remain available through a zonal failure”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:instance_disks_availability_os_login:boot_persistent_local_ssd_regional_disk_configuration_persistence_failure_needs:slot:failure-scope-transfer

- Status: authoring-admitted
- Objective: Re-evaluate the disk design when the protected failure domain changes from instance loss to zonal loss.
- Expected decision: Move from any durable zonal volume to a supported regional replicated volume when the data must remain available through a zonal failure.
- Decisive boundary: Instance-level persistence is sufficient until the recovery objective explicitly includes a zone outage.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:instance_disks_availability_os_login:boot_persistent_local_ssd_regional_disk_configuration_persistence_failure_needs:slot:hyperdisk-performance-choice

- Status: authoring-admitted
- Objective: instance disks availability os login — hyperdisk performance: select “Choose a supported Hyperdisk type and size its performance separately from capacity; otherwise use an available Persistent Disk type” under “required IOPS; required throughput; machine-series support for Hyperdisk” instead of the competing action “Use Local SSD only for reproducible temporary data; keep durable state on Hyperdisk or Persistent Disk”.
- Expected decision: Choose a supported Hyperdisk type and size its performance separately from capacity; otherwise use an available Persistent Disk type.
- Decisive boundary: instance disks availability os login — hyperdisk performance: evidence “required IOPS; required throughput; machine-series support for Hyperdisk” supports “Choose a supported Hyperdisk type and size its performance separately from capacity; otherwise use an available Persistent Disk type”. The neighboring evidence “survival after stop, restart, or host failure; scratch or cache semantics; host-local performance need” instead supports decision “Use Local SSD only for reproducible temporary data; keep durable state on Hyperdisk or Persistent Disk”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:instance_disks_availability_os_login:boot_persistent_local_ssd_regional_disk_configuration_persistence_failure_needs:slot:persistent-vs-local-ssd-choice

- Status: authoring-admitted
- Objective: instance disks availability os login — persistent vs local ssd: select “Use Local SSD only for reproducible temporary data; keep durable state on Hyperdisk or Persistent Disk” under “survival after stop, restart, or host failure; scratch or cache semantics; host-local performance need” instead of the competing action “Use a regional disk when the recovery design requires the same block data in two zones; otherwise retain the simpler zonal volume”.
- Expected decision: Use Local SSD only for reproducible temporary data; keep durable state on Hyperdisk or Persistent Disk.
- Decisive boundary: instance disks availability os login — persistent vs local ssd: evidence “survival after stop, restart, or host failure; scratch or cache semantics; host-local performance need” supports “Use Local SSD only for reproducible temporary data; keep durable state on Hyperdisk or Persistent Disk”. The neighboring evidence “single-zone placement; two-zone synchronous replication; failover VM location” instead supports decision “Use a regional disk when the recovery design requires the same block data in two zones; otherwise retain the simpler zonal volume”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:instance_disks_availability_os_login:boot_persistent_local_ssd_regional_disk_configuration_persistence_failure_needs:slot:zonal-vs-regional-disk-choice

- Status: authoring-admitted
- Objective: instance disks availability os login — zonal vs regional disk: select “Use a regional disk when the recovery design requires the same block data in two zones; otherwise retain the simpler zonal volume” under “single-zone placement; two-zone synchronous replication; failover VM location” instead of the competing action “Attribute the attachment failure to an unsupported access mode or location pairing before changing storage products”.
- Expected decision: Use a regional disk when the recovery design requires the same block data in two zones; otherwise retain the simpler zonal volume.
- Decisive boundary: instance disks availability os login — zonal vs regional disk: evidence “single-zone placement; two-zone synchronous replication; failover VM location” supports “Use a regional disk when the recovery design requires the same block data in two zones; otherwise retain the simpler zonal volume”. The neighboring evidence “requested read-write attachment count; volume and VM zone or region; disk type attachment capability” instead supports diagnosis “Attribute the attachment failure to an unsupported access mode or location pairing before changing storage products”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:instance_disks_availability_os_login:login_instance_access_through_iam_unmanaged_ssh_keys:slot:access-policy-transfer

- Status: authoring-admitted
- Objective: Transfer SSH authorization from metadata keys to IAM-governed OS Login when centralized access control becomes required.
- Expected decision: Enable OS Login at the intended resource scope and grant the appropriate OS Login IAM role instead of distributing metadata keys.
- Decisive boundary: The transfer is justified by centralized identity and revocation, not merely by the presence of SSH.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:instance_disks_availability_os_login:login_instance_access_through_iam_unmanaged_ssh_keys:slot:login-permission-diagnosis

- Status: authoring-admitted
- Objective: instance disks availability os login — login permission: trace “roles/compute.osLogin grant; roles/compute.osAdminLogin grant; requested ordinary versus sudo session” to “Grant login without sudo through compute.osLogin, or administrative login through compute.osAdminLogin, at a scope that covers the instance” instead of applying the competing remediation “Treat metadata-based keys as unavailable on an OS Login-enabled instance and authorize the Google identity through IAM”.
- Expected decision: Grant login without sudo through compute.osLogin, or administrative login through compute.osAdminLogin, at a scope that covers the instance.
- Decisive boundary: instance disks availability os login — login permission: evidence “roles/compute.osLogin grant; roles/compute.osAdminLogin grant; requested ordinary versus sudo session” supports “Grant login without sudo through compute.osLogin, or administrative login through compute.osAdminLogin, at a scope that covers the instance”. The neighboring evidence “enable-oslogin metadata value; keys returned by the OS Login service; SSH keys stored in project or instance metadata” instead supports decision “Treat metadata-based keys as unavailable on an OS Login-enabled instance and authorize the Google identity through IAM”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:instance_disks_availability_os_login:login_instance_access_through_iam_unmanaged_ssh_keys:slot:managed-vs-metadata-key-boundary

- Status: authoring-admitted
- Objective: instance disks availability os login — managed vs metadata key: verify that “enable-oslogin metadata value; keys returned by the OS Login service; SSH keys stored in project or instance metadata” stays with “Treat metadata-based keys as unavailable on an OS Login-enabled instance and authorize the Google identity through IAM” and has not crossed into “Use compute.osLogin for a non-sudo session and compute.osAdminLogin only when administrative access is required”.
- Expected decision: Treat metadata-based keys as unavailable on an OS Login-enabled instance and authorize the Google identity through IAM.
- Decisive boundary: instance disks availability os login — managed vs metadata key: evidence “enable-oslogin metadata value; keys returned by the OS Login service; SSH keys stored in project or instance metadata” supports “Treat metadata-based keys as unavailable on an OS Login-enabled instance and authorize the Google identity through IAM”. The neighboring evidence “need for sudo; resource scope of access; principal receiving the role” instead supports decision “Use compute.osLogin for a non-sudo session and compute.osAdminLogin only when administrative access is required”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:instance_disks_availability_os_login:login_instance_access_through_iam_unmanaged_ssh_keys:slot:os-login-iam-role-choice

- Status: authoring-admitted
- Objective: instance disks availability os login — os login iam role: select “Use compute.osLogin for a non-sudo session and compute.osAdminLogin only when administrative access is required” under “need for sudo; resource scope of access; principal receiving the role” instead of the competing action “Use project metadata for the fleet default and an instance value only for a deliberate narrower override”.
- Expected decision: Use compute.osLogin for a non-sudo session and compute.osAdminLogin only when administrative access is required.
- Decisive boundary: instance disks availability os login — os login iam role: evidence “need for sudo; resource scope of access; principal receiving the role” supports “Use compute.osLogin for a non-sudo session and compute.osAdminLogin only when administrative access is required”. The neighboring evidence “project-wide default; instance-level metadata override; number of VMs requiring a different policy” instead supports classification “Use project metadata for the fleet default and an instance value only for a deliberate narrower override”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:instance_disks_availability_os_login:login_instance_access_through_iam_unmanaged_ssh_keys:slot:project-vs-instance-enablement

- Status: authoring-admitted
- Objective: instance disks availability os login — project vs instance enablement: recognize that “project-wide default; instance-level metadata override; number of VMs requiring a different policy” requires “Use project metadata for the fleet default and an instance value only for a deliberate narrower override”, not the neighboring capability response “Enable OS Login at the intended resource scope and grant the appropriate OS Login IAM role instead of distributing metadata keys”.
- Expected decision: Use project metadata for the fleet default and an instance value only for a deliberate narrower override.
- Decisive boundary: instance disks availability os login — project vs instance enablement: evidence “project-wide default; instance-level metadata override; number of VMs requiring a different policy” supports “Use project metadata for the fleet default and an instance value only for a deliberate narrower override”. The neighboring evidence “central revocation requirement; IAM-based login authorization; existing project or instance metadata keys” instead supports decision “Enable OS Login at the intended resource scope and grant the appropriate OS Login IAM role instead of distributing metadata keys”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
