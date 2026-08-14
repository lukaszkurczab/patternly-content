# google-cloud-associate-cloud-engineer / compute_engine_delivery_and_operations / templates_migs_autoscaling

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 11
- Authoring-admitted slots: 11
- Blocked slots: 0
- Future source path: manual/source/google-cloud-associate-cloud-engineer/compute_engine_delivery_and_operations/templates_migs_autoscaling.json
- Interaction allocation: choice
- Mode contribution: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### google-cloud-associate-cloud-engineer:templates_migs_autoscaling:instance_templates_managed_instance_groups_replaceable_identical_vms:slot:autohealing-readiness-boundary

- Status: authoring-admitted
- Objective: templates migs autoscaling — autohealing readiness: verify that “application health check; initialization period; replacement safety of an unhealthy VM” stays with “Configure autohealing only when the health check represents application readiness and a replacement can be recreated from managed configuration” and has not crossed into “Use a MIG when Compute Engine should maintain template-derived members; use an unmanaged group only for operator-managed heterogeneous VMs, commonly as a load-balancer backend”.
- Expected decision: Configure autohealing only when the health check represents application readiness and a replacement can be recreated from managed configuration.
- Decisive boundary: templates migs autoscaling — autohealing readiness: evidence “application health check; initialization period; replacement safety of an unhealthy VM” supports “Configure autohealing only when the health check represents application readiness and a replacement can be recreated from managed configuration”. The neighboring evidence “instance template ownership; heterogeneous versus identical members; need for autoscaling, autohealing, or rolling updates” instead supports classification “Use a MIG when Compute Engine should maintain template-derived members; use an unmanaged group only for operator-managed heterogeneous VMs, commonly as a load-balancer backend”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:templates_migs_autoscaling:instance_templates_managed_instance_groups_replaceable_identical_vms:slot:managed-vs-unmanaged-group-classification

- Status: authoring-admitted
- Objective: templates migs autoscaling — managed vs unmanaged group: classify “instance template ownership; heterogeneous versus identical members; need for autoscaling, autohealing, or rolling updates” as “Use a MIG when Compute Engine should maintain template-derived members; use an unmanaged group only for operator-managed heterogeneous VMs, commonly as a load-balancer backend”, while separating the competing classification “Add an explicit stateful MIG policy only for state that must be preserved while keeping the remaining VM properties template-managed”.
- Expected decision: Use a MIG when Compute Engine should maintain template-derived members; use an unmanaged group only for operator-managed heterogeneous VMs, commonly as a load-balancer backend.
- Decisive boundary: templates migs autoscaling — managed vs unmanaged group: evidence “instance template ownership; heterogeneous versus identical members; need for autoscaling, autohealing, or rolling updates” supports “Use a MIG when Compute Engine should maintain template-derived members; use an unmanaged group only for operator-managed heterogeneous VMs, commonly as a load-balancer backend”. The neighboring evidence “stateful disk policy; per-instance configuration; replaceability of application state” instead supports decision “Add an explicit stateful MIG policy only for state that must be preserved while keeping the remaining VM properties template-managed”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:templates_migs_autoscaling:instance_templates_managed_instance_groups_replaceable_identical_vms:slot:stateful-workload-transfer

- Status: authoring-admitted
- Objective: Reassess a stateless MIG design when selected disks, metadata, or addresses must survive instance recreation.
- Expected decision: Add an explicit stateful MIG policy only for state that must be preserved while keeping the remaining VM properties template-managed.
- Decisive boundary: The group remains a MIG only while Compute Engine can recreate each member from template plus declared state.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:templates_migs_autoscaling:instance_templates_managed_instance_groups_replaceable_identical_vms:slot:template-based-replacement-choice

- Status: authoring-admitted
- Objective: templates migs autoscaling — template based replacement: select “Put the reusable VM properties in an instance template and let the MIG create and replace managed members” under “identical machine and image configuration; automatic recreation requirement; fleet-level update ownership” instead of the competing action “Distribute managed instances across zones with a regional MIG for zonal-failure resilience; keep a zonal MIG when one zone is an accepted failure domain”.
- Expected decision: Put the reusable VM properties in an instance template and let the MIG create and replace managed members.
- Decisive boundary: templates migs autoscaling — template based replacement: evidence “identical machine and image configuration; automatic recreation requirement; fleet-level update ownership” supports “Put the reusable VM properties in an instance template and let the MIG create and replace managed members”. The neighboring evidence “zonal outage tolerance; distribution of instances across zones; regional capacity and quota” instead supports decision “Distribute managed instances across zones with a regional MIG for zonal-failure resilience; keep a zonal MIG when one zone is an accepted failure domain”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:templates_migs_autoscaling:instance_templates_managed_instance_groups_replaceable_identical_vms:slot:zonal-vs-regional-mig-choice

- Status: authoring-admitted
- Objective: templates migs autoscaling — zonal vs regional mig: select “Distribute managed instances across zones with a regional MIG for zonal-failure resilience; keep a zonal MIG when one zone is an accepted failure domain” under “zonal outage tolerance; distribution of instances across zones; regional capacity and quota” instead of the competing action “Configure autohealing only when the health check represents application readiness and a replacement can be recreated from managed configuration”.
- Expected decision: Distribute managed instances across zones with a regional MIG for zonal-failure resilience; keep a zonal MIG when one zone is an accepted failure domain.
- Decisive boundary: templates migs autoscaling — zonal vs regional mig: evidence “zonal outage tolerance; distribution of instances across zones; regional capacity and quota” supports “Distribute managed instances across zones with a regional MIG for zonal-failure resilience; keep a zonal MIG when one zone is an accepted failure domain”. The neighboring evidence “application health check; initialization period; replacement safety of an unhealthy VM” instead supports decision “Configure autohealing only when the health check represents application readiness and a replacement can be recreated from managed configuration”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:templates_migs_autoscaling:scale_mig_metric_reflects_workload_pressure:slot:cpu-signal-choice

- Status: authoring-admitted
- Objective: templates migs autoscaling — cpu signal: select “Configure a CPU target that adds or removes instances as average utilization moves around the desired level” under “CPU utilization correlation with requests; target utilization; instance initialization period” instead of the competing action “Move to the metric that directly represents pending work and tune its target to per-instance serving capacity”.
- Expected decision: Configure a CPU target that adds or removes instances as average utilization moves around the desired level.
- Decisive boundary: templates migs autoscaling — cpu signal: evidence “CPU utilization correlation with requests; target utilization; instance initialization period” supports “Configure a CPU target that adds or removes instances as average utilization moves around the desired level”. The neighboring evidence “new bottleneck metric; metric-to-capacity relationship; lag between signal and ready instances” instead supports decision “Move to the metric that directly represents pending work and tune its target to per-instance serving capacity”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:templates_migs_autoscaling:scale_mig_metric_reflects_workload_pressure:slot:demand-signal-transfer

- Status: authoring-admitted
- Objective: Replace the autoscaling signal when workload pressure changes from CPU saturation to queue depth or another service metric.
- Expected decision: Move to the metric that directly represents pending work and tune its target to per-instance serving capacity.
- Decisive boundary: A signal transfer is justified by changed causality, not by a cosmetic metric-name change.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:templates_migs_autoscaling:scale_mig_metric_reflects_workload_pressure:slot:load-balancing-capacity-choice

- Status: authoring-admitted
- Objective: templates migs autoscaling — load balancing capacity: select “Configure load-balancing utilization so the autoscaler maintains enough backend capacity for incoming traffic” under “backend capacity setting; load balancer utilization; per-instance request-handling capacity” instead of the competing action “Raise or correct the binding capacity bound only when the scaling recommendation is legitimately clipped by that bound”.
- Expected decision: Configure load-balancing utilization so the autoscaler maintains enough backend capacity for incoming traffic.
- Decisive boundary: templates migs autoscaling — load balancing capacity: evidence “backend capacity setting; load balancer utilization; per-instance request-handling capacity” supports “Configure load-balancing utilization so the autoscaler maintains enough backend capacity for incoming traffic”. The neighboring evidence “recommended group size; configured minimum replicas; configured maximum replicas” instead supports diagnosis “Raise or correct the binding capacity bound only when the scaling recommendation is legitimately clipped by that bound”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:templates_migs_autoscaling:scale_mig_metric_reflects_workload_pressure:slot:minimum-maximum-capacity-diagnosis

- Status: authoring-admitted
- Objective: templates migs autoscaling — minimum maximum capacity: trace “recommended group size; configured minimum replicas; configured maximum replicas” to “Raise or correct the binding capacity bound only when the scaling recommendation is legitimately clipped by that bound” instead of applying the competing remediation “Use a metric and target that express workload pressure at the same scope the autoscaler controls”.
- Expected decision: Raise or correct the binding capacity bound only when the scaling recommendation is legitimately clipped by that bound.
- Decisive boundary: templates migs autoscaling — minimum maximum capacity: evidence “recommended group size; configured minimum replicas; configured maximum replicas” supports “Raise or correct the binding capacity bound only when the scaling recommendation is legitimately clipped by that bound”. The neighboring evidence “metric alignment per group or per instance; target value semantics; availability of timely samples” instead supports decision “Use a metric and target that express workload pressure at the same scope the autoscaler controls”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:templates_migs_autoscaling:scale_mig_metric_reflects_workload_pressure:slot:monitoring-metric-choice

- Status: authoring-admitted
- Objective: templates migs autoscaling — monitoring metric: select “Use a metric and target that express workload pressure at the same scope the autoscaler controls” under “metric alignment per group or per instance; target value semantics; availability of timely samples” instead of the competing action “Set a schedule to establish minimum capacity ahead of a known event while retaining utilization signals for unplanned demand”.
- Expected decision: Use a metric and target that express workload pressure at the same scope the autoscaler controls.
- Decisive boundary: templates migs autoscaling — monitoring metric: evidence “metric alignment per group or per instance; target value semantics; availability of timely samples” supports “Use a metric and target that express workload pressure at the same scope the autoscaler controls”. The neighboring evidence “known start time; required minimum instances during the window; unpredictable versus recurring load” instead supports decision “Set a schedule to establish minimum capacity ahead of a known event while retaining utilization signals for unplanned demand”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:templates_migs_autoscaling:scale_mig_metric_reflects_workload_pressure:slot:schedule-based-scaling-boundary

- Status: authoring-admitted
- Objective: templates migs autoscaling — schedule based scaling: verify that “known start time; required minimum instances during the window; unpredictable versus recurring load” stays with “Set a schedule to establish minimum capacity ahead of a known event while retaining utilization signals for unplanned demand” and has not crossed into “Configure a CPU target that adds or removes instances as average utilization moves around the desired level”.
- Expected decision: Set a schedule to establish minimum capacity ahead of a known event while retaining utilization signals for unplanned demand.
- Decisive boundary: templates migs autoscaling — schedule based scaling: evidence “known start time; required minimum instances during the window; unpredictable versus recurring load” supports “Set a schedule to establish minimum capacity ahead of a known event while retaining utilization signals for unplanned demand”. The neighboring evidence “CPU utilization correlation with requests; target utilization; instance initialization period” instead supports decision “Configure a CPU target that adds or removes instances as average utilization moves around the desired level”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
