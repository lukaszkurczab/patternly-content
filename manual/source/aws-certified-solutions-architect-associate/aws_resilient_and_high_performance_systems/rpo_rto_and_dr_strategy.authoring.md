# aws-certified-solutions-architect-associate / aws_resilient_and_high_performance_systems / rpo_rto_and_dr_strategy

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 11
- Authoring-admitted slots: 11
- Blocked slots: 0
- Future source path: manual/source/aws-certified-solutions-architect-associate/aws_resilient_and_high_performance_systems/rpo_rto_and_dr_strategy.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### aws-certified-solutions-architect-associate:rpo_rto_and_dr_strategy:backup_restore_pilot_light_warm_standby_multi_site_explicit_rpo_rto_objectives:slot:backup-and-restore

- Status: authoring-admitted
- Objective: Assess whether the evidence “hours or days of RTO and a nonzero RPO are acceptable” supports the owned resolution “use backup and restore”.
- Expected decision: use backup and restore
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:rpo_rto_and_dr_strategy:backup_restore_pilot_light_warm_standby_multi_site_explicit_rpo_rto_objectives:slot:cost-vs-rto

- Status: authoring-admitted
- Objective: Assess whether the evidence “the proposed strategy cannot meet the stated RTO at its available capacity” supports the owned resolution “reject it despite lower steady-state cost”.
- Expected decision: reject it despite lower steady-state cost
- Decisive boundary: This slot owns the boundary established by the proposed strategy cannot meet the stated RTO at its available capacity; it resolves only to “reject it despite lower steady-state cost” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:rpo_rto_and_dr_strategy:backup_restore_pilot_light_warm_standby_multi_site_explicit_rpo_rto_objectives:slot:multi-site

- Status: authoring-admitted
- Objective: Assess whether the evidence “near-zero recovery time justifies continuously active capacity” supports the owned resolution “use multi-site active-active”.
- Expected decision: use multi-site active-active
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:rpo_rto_and_dr_strategy:backup_restore_pilot_light_warm_standby_multi_site_explicit_rpo_rto_objectives:slot:pilot-light

- Status: authoring-admitted
- Objective: Assess whether the evidence “core data services remain running but application capacity can be rebuilt” supports the owned resolution “use pilot light”.
- Expected decision: use pilot light
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:rpo_rto_and_dr_strategy:backup_restore_pilot_light_warm_standby_multi_site_explicit_rpo_rto_objectives:slot:rpo-rto-tightening

- Status: authoring-admitted
- Objective: Assess whether the evidence “business objectives tighten after a criticality review” supports the owned resolution “move to a strategy with sufficient replicated state and warm capacity”.
- Expected decision: move to a strategy with sufficient replicated state and warm capacity
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:rpo_rto_and_dr_strategy:backup_restore_pilot_light_warm_standby_multi_site_explicit_rpo_rto_objectives:slot:warm-standby

- Status: authoring-admitted
- Objective: Assess whether the evidence “a reduced full stack must scale quickly after failover” supports the owned resolution “use warm standby”.
- Expected decision: use warm standby
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:rpo_rto_and_dr_strategy:replication_lag_restore_point_loss_application_recovery_duration:slot:application-recovery

- Status: authoring-admitted
- Objective: Assess whether the evidence “data is available but services, dependencies, and traffic are not restored” supports the owned resolution “attribute elapsed downtime to application recovery”.
- Expected decision: attribute elapsed downtime to application recovery
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:rpo_rto_and_dr_strategy:replication_lag_restore_point_loss_application_recovery_duration:slot:backup-interval

- Status: authoring-admitted
- Objective: Assess whether the evidence “the last recovery point predates the failure” supports the owned resolution “attribute restore-point loss to backup frequency”.
- Expected decision: attribute restore-point loss to backup frequency
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:rpo_rto_and_dr_strategy:replication_lag_restore_point_loss_application_recovery_duration:slot:replication-lag

- Status: authoring-admitted
- Objective: Assess whether the evidence “the latest committed writes have not reached the replica” supports the owned resolution “attribute potential data loss to replication lag”.
- Expected decision: attribute potential data loss to replication lag
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:rpo_rto_and_dr_strategy:replication_lag_restore_point_loss_application_recovery_duration:slot:rpo-vs-rto

- Status: authoring-admitted
- Objective: Assess whether the evidence “a design has fast failover but loses recent writes” supports the owned resolution “do not treat low RTO as low RPO”.
- Expected decision: do not treat low RTO as low RPO
- Decisive boundary: This slot owns the boundary established by a design has fast failover but loses recent writes; it resolves only to “do not treat low RTO as low RPO” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:rpo_rto_and_dr_strategy:replication_lag_restore_point_loss_application_recovery_duration:slot:untested-restore

- Status: authoring-admitted
- Objective: Assess whether the evidence “nominal backup timing meets RPO but restoration exceeds RTO” supports the owned resolution “diagnose missing recovery-time validation”.
- Expected decision: diagnose missing recovery-time validation
- Decisive boundary: This slot owns the boundary established by nominal backup timing meets RPO but restoration exceeds RTO; it resolves only to “diagnose missing recovery-time validation” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
