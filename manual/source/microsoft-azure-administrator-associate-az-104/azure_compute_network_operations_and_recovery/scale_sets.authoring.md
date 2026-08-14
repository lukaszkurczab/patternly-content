# microsoft-azure-administrator-associate-az-104 / azure_compute_network_operations_and_recovery / scale_sets

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 9
- Authoring-admitted slots: 9
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-administrator-associate-az-104/azure_compute_network_operations_and_recovery/scale_sets.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-administrator-associate-az-104:scale_sets:scale_sets_model_upgrades_autoscaling_workload_replacement_needs:slot:configure-rolling-upgrade-health-gates

- Status: authoring-admitted
- Objective: Set rolling batch size, pause, and health requirements so an unhealthy batch stops further rollout.
- Expected decision: Roll forward only while the configured health threshold remains satisfied.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:scale_sets:scale_sets_model_upgrades_autoscaling_workload_replacement_needs:slot:configure-scale-in-policy

- Status: authoring-admitted
- Objective: Choose which instances are removed during scale-in while respecting protection and zone balance.
- Expected decision: Remove eligible instances without concentrating failure risk.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:scale_sets:scale_sets_model_upgrades_autoscaling_workload_replacement_needs:slot:diagnose-instance-model-not-applied

- Status: authoring-admitted
- Objective: Identify an instance still running an old scale-set model because the upgrade policy has not updated it.
- Expected decision: Upgrade or reimage the affected instance according to policy.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:scale_sets:scale_sets_model_upgrades_autoscaling_workload_replacement_needs:slot:select-autoscale-metric-and-threshold

- Status: authoring-admitted
- Objective: Scale on a metric that represents aggregate demand with a time window long enough to avoid transient noise.
- Expected decision: Create complementary scale-out and scale-in rules with hysteresis.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:scale_sets:scale_sets_model_upgrades_autoscaling_workload_replacement_needs:slot:select-manual-automatic-or-rolling-upgrade-policy

- Status: authoring-admitted
- Objective: Choose an upgrade policy from change control, acceptable disruption, and need for automatic model rollout.
- Expected decision: Use manual for explicit control or rolling/automatic only when health and disruption constraints permit.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:scale_sets:uniform_flexible_orchestration_instance_management_needs:slot:diagnose-feature-support-by-orchestration-mode

- Status: authoring-admitted
- Objective: Reject a design that assumes a feature exists in the chosen orchestration mode when Microsoft documents it only for the other mode.
- Expected decision: Change the mode or requirement before deployment.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:scale_sets:uniform_flexible_orchestration_instance_management_needs:slot:distinguish-instance-protection-and-management-boundary

- Status: authoring-admitted
- Objective: Determine whether an exception belongs in instance protection or indicates the workload should not share one homogeneous model.
- Expected decision: Protect a bounded exception or move distinct workloads out of the scale set.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:scale_sets:uniform_flexible_orchestration_instance_management_needs:slot:select-flexible-for-standard-vm-api-and-mixed-sizes

- Status: authoring-admitted
- Objective: Use Flexible orchestration when standard VM APIs, mixed sizes, or explicit per-instance management are required.
- Expected decision: Choose Flexible and validate the required availability configuration.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-administrator-associate-az-104:scale_sets:uniform_flexible_orchestration_instance_management_needs:slot:select-uniform-for-identical-scale-set-model

- Status: authoring-admitted
- Objective: Use Uniform orchestration when instances should follow one scale-set VM profile and be managed as a homogeneous fleet.
- Expected decision: Choose Uniform only when its feature and lifecycle model fit.
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
