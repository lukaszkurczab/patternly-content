# aws-certified-solutions-architect-associate / aws_network_data_and_cost_optimization / access_lifecycle_tiering

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 13
- Authoring-admitted slots: 13
- Blocked slots: 0
- Future source path: manual/source/aws-certified-solutions-architect-associate/aws_network_data_and_cost_optimization/access_lifecycle_tiering.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### aws-certified-solutions-architect-associate:access_lifecycle_tiering:lifecycle_rules_versioning_noncurrent_version_legal_retention_awareness:slot:current-version-transition

- Status: authoring-admitted
- Objective: Assess whether the evidence “current objects should transition after a documented age” supports the owned resolution “configure a current-version lifecycle action”.
- Expected decision: configure a current-version lifecycle action
- Decisive boundary: This slot owns the boundary established by current objects should transition after a documented age; it resolves only to “configure a current-version lifecycle action” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:access_lifecycle_tiering:lifecycle_rules_versioning_noncurrent_version_legal_retention_awareness:slot:delete-marker-cleanup

- Status: authoring-admitted
- Objective: Assess whether the evidence “expired object delete markers accumulate” supports the owned resolution “configure cleanup where the documented conditions apply”.
- Expected decision: configure cleanup where the documented conditions apply
- Decisive boundary: This slot owns the boundary established by expired object delete markers accumulate; it resolves only to “configure cleanup where the documented conditions apply” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:access_lifecycle_tiering:lifecycle_rules_versioning_noncurrent_version_legal_retention_awareness:slot:lifecycle-evaluation

- Status: authoring-admitted
- Objective: Assess whether the evidence “a versioned regulated bucket needs tiering” supports the owned resolution “order retention constraints, current and noncurrent actions, and validation”.
- Expected decision: order retention constraints, current and noncurrent actions, and validation
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:access_lifecycle_tiering:lifecycle_rules_versioning_noncurrent_version_legal_retention_awareness:slot:noncurrent-version-expiration

- Status: authoring-admitted
- Objective: Assess whether the evidence “old versions must expire separately from current objects” supports the owned resolution “configure noncurrent-version actions”.
- Expected decision: configure noncurrent-version actions
- Decisive boundary: This slot owns the boundary established by old versions must expire separately from current objects; it resolves only to “configure noncurrent-version actions” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:access_lifecycle_tiering:lifecycle_rules_versioning_noncurrent_version_legal_retention_awareness:slot:object-lock-retention

- Status: authoring-admitted
- Objective: Assess whether the evidence “lifecycle expiration reaches an object version under legal retention” supports the owned resolution “preserve the retention boundary”.
- Expected decision: preserve the retention boundary
- Decisive boundary: This slot owns the boundary established by lifecycle expiration reaches an object version under legal retention; it resolves only to “preserve the retention boundary” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:access_lifecycle_tiering:lifecycle_rules_versioning_noncurrent_version_legal_retention_awareness:slot:versioning-cost

- Status: authoring-admitted
- Objective: Assess whether the evidence “a rule expires current objects but retains unlimited noncurrent versions” supports the owned resolution “diagnose hidden version storage”.
- Expected decision: diagnose hidden version storage
- Decisive boundary: This slot owns the boundary established by a rule expires current objects but retains unlimited noncurrent versions; it resolves only to “diagnose hidden version storage” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:access_lifecycle_tiering:storage_class_lifecycle_transitions_access_frequency_retrieval_time_minimum_duration:slot:access-pattern-change

- Status: authoring-admitted
- Objective: Assess whether the evidence “archives become frequently read” supports the owned resolution “transition new or existing data to an appropriate active class”.
- Expected decision: transition new or existing data to an appropriate active class
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:access_lifecycle_tiering:storage_class_lifecycle_transitions_access_frequency_retrieval_time_minimum_duration:slot:glacier-retrieval

- Status: authoring-admitted
- Objective: Assess whether the evidence “archives can tolerate the selected Glacier retrieval time” supports the owned resolution “use the matching Glacier class”.
- Expected decision: use the matching Glacier class
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:access_lifecycle_tiering:storage_class_lifecycle_transitions_access_frequency_retrieval_time_minimum_duration:slot:intelligent-tiering

- Status: authoring-admitted
- Objective: Assess whether the evidence “access frequency is unknown or changes and monitoring economics fit” supports the owned resolution “use S3 Intelligent-Tiering”.
- Expected decision: use S3 Intelligent-Tiering
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:access_lifecycle_tiering:storage_class_lifecycle_transitions_access_frequency_retrieval_time_minimum_duration:slot:minimum-duration

- Status: authoring-admitted
- Objective: Assess whether the evidence “early deletion would dominate the expected savings” supports the owned resolution “reject the premature transition”.
- Expected decision: reject the premature transition
- Decisive boundary: This slot owns the boundary established by early deletion would dominate the expected savings; it resolves only to “reject the premature transition” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:access_lifecycle_tiering:storage_class_lifecycle_transitions_access_frequency_retrieval_time_minimum_duration:slot:one-zone-ia

- Status: authoring-admitted
- Objective: Assess whether the evidence “re-creatable infrequent data can tolerate one AZ” supports the owned resolution “use S3 One Zone-IA”.
- Expected decision: use S3 One Zone-IA
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:access_lifecycle_tiering:storage_class_lifecycle_transitions_access_frequency_retrieval_time_minimum_duration:slot:standard-frequent

- Status: authoring-admitted
- Objective: Assess whether the evidence “objects are frequently accessed with millisecond retrieval” supports the owned resolution “use S3 Standard”.
- Expected decision: use S3 Standard
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:access_lifecycle_tiering:storage_class_lifecycle_transitions_access_frequency_retrieval_time_minimum_duration:slot:standard-ia

- Status: authoring-admitted
- Objective: Assess whether the evidence “multi-AZ infrequent objects can meet minimum duration and retrieval charges” supports the owned resolution “use S3 Standard-IA”.
- Expected decision: use S3 Standard-IA
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
