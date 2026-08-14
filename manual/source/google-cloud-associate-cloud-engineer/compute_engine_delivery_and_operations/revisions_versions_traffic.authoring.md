# google-cloud-associate-cloud-engineer / compute_engine_delivery_and_operations / revisions_versions_traffic

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 9
- Authoring-admitted slots: 9
- Blocked slots: 0
- Future source path: manual/source/google-cloud-associate-cloud-engineer/compute_engine_delivery_and_operations/revisions_versions_traffic.json
- Interaction allocation: choice
- Mode contribution: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### google-cloud-associate-cloud-engineer:revisions_versions_traffic:immutable_revisions_deployed_code_configurations:slot:configuration-change-transfer

- Status: authoring-admitted
- Objective: Determine whether a Cloud Run setting change creates a new revision and therefore needs release handling.
- Expected decision: Treat container or template configuration changes as a new immutable revision and preserve deliberate traffic allocation.
- Decisive boundary: Service metadata can change without revision replacement; revision-template changes cannot.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:revisions_versions_traffic:immutable_revisions_deployed_code_configurations:slot:revision-creating-change-classification

- Status: authoring-admitted
- Objective: revisions versions traffic — revision creating change: classify “image digest; environment, concurrency, or timeout setting; service metadata” as “Expect a new revision for image or revision-template changes and no new revision for unrelated service metadata”, while separating the competing classification “Deploy a new revision for changed execution state and retain the old revision as a rollback target while policy allows”.
- Expected decision: Expect a new revision for image or revision-template changes and no new revision for unrelated service metadata.
- Decisive boundary: revisions versions traffic — revision creating change: evidence “image digest; environment, concurrency, or timeout setting; service metadata” supports “Expect a new revision for image or revision-template changes and no new revision for unrelated service metadata”. The neighboring evidence “existing revision name; requested code or configuration change; need for rollback identity” instead supports decision “Deploy a new revision for changed execution state and retain the old revision as a rollback target while policy allows”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:revisions_versions_traffic:immutable_revisions_deployed_code_configurations:slot:revision-immutability-boundary

- Status: authoring-admitted
- Objective: revisions versions traffic — revision immutability: verify that “existing revision name; requested code or configuration change; need for rollback identity” stays with “Deploy a new revision for changed execution state and retain the old revision as a rollback target while policy allows” and has not crossed into “Apply the setting at the documented scope and predict whether deployment is required”.
- Expected decision: Deploy a new revision for changed execution state and retain the old revision as a rollback target while policy allows.
- Decisive boundary: revisions versions traffic — revision immutability: evidence “existing revision name; requested code or configuration change; need for rollback identity” supports “Deploy a new revision for changed execution state and retain the old revision as a rollback target while policy allows”. The neighboring evidence “immediate service-wide control; template inherited by future revisions; per-revision override” instead supports classification “Apply the setting at the documented scope and predict whether deployment is required”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:revisions_versions_traffic:immutable_revisions_deployed_code_configurations:slot:service-vs-revision-setting

- Status: authoring-admitted
- Objective: revisions versions traffic — service vs revision setting: recognize that “immediate service-wide control; template inherited by future revisions; per-revision override” requires “Apply the setting at the documented scope and predict whether deployment is required”, not the neighboring capability response “Treat container or template configuration changes as a new immutable revision and preserve deliberate traffic allocation”.
- Expected decision: Apply the setting at the documented scope and predict whether deployment is required.
- Decisive boundary: revisions versions traffic — service vs revision setting: evidence “immediate service-wide control; template inherited by future revisions; per-revision override” supports “Apply the setting at the documented scope and predict whether deployment is required”. The neighboring evidence “service-level setting; revision-template setting; existing traffic split” instead supports decision “Treat container or template configuration changes as a new immutable revision and preserve deliberate traffic allocation”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:revisions_versions_traffic:shift_cloud_traffic_between_revisions_release_safely:slot:gradual-rollout-ordering

- Status: authoring-admitted
- Objective: revisions versions traffic — gradual rollout ordering: order or execute “Advance traffic only after each stage meets its release evidence and keep the previous revision available for rollback” when “ready no-traffic revision; observed release telemetry; incremental traffic percentages” and distinguish the neighboring procedure “Set an explicit split totaling 100 percent and evaluate telemetry by revision”.
- Expected decision: Advance traffic only after each stage meets its release evidence and keep the previous revision available for rollback.
- Decisive boundary: revisions versions traffic — gradual rollout ordering: evidence “ready no-traffic revision; observed release telemetry; incremental traffic percentages” supports “Advance traffic only after each stage meets its release evidence and keep the previous revision available for rollback”. The neighboring evidence “desired exposure fraction; revision capacity; session-affinity behavior” instead supports decision “Set an explicit split totaling 100 percent and evaluate telemetry by revision”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:revisions_versions_traffic:shift_cloud_traffic_between_revisions_release_safely:slot:percentage-split-choice

- Status: authoring-admitted
- Objective: revisions versions traffic — percentage split: select “Set an explicit split totaling 100 percent and evaluate telemetry by revision” under “desired exposure fraction; revision capacity; session-affinity behavior” instead of the competing action “Use smaller stages for uncertain high-impact releases and larger stages only when evidence reduces risk”.
- Expected decision: Set an explicit split totaling 100 percent and evaluate telemetry by revision.
- Decisive boundary: revisions versions traffic — percentage split: evidence “desired exposure fraction; revision capacity; session-affinity behavior” supports “Set an explicit split totaling 100 percent and evaluate telemetry by revision”. The neighboring evidence “blast radius; signal quality; rollback readiness” instead supports decision “Use smaller stages for uncertain high-impact releases and larger stages only when evidence reduces risk”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:revisions_versions_traffic:shift_cloud_traffic_between_revisions_release_safely:slot:release-risk-transfer

- Status: authoring-admitted
- Objective: Change rollout pace when failure impact, observability, or rollback confidence changes.
- Expected decision: Use smaller stages for uncertain high-impact releases and larger stages only when evidence reduces risk.
- Decisive boundary: Pace is a risk control, not a platform constant.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:revisions_versions_traffic:shift_cloud_traffic_between_revisions_release_safely:slot:rollback-diagnosis

- Status: authoring-admitted
- Objective: revisions versions traffic — rollback: trace “revision-specific errors or latency; known healthy revision; traffic transition state” to “Move traffic to the healthy revision and preserve evidence from the failed revision for diagnosis” instead of applying the competing remediation “Assign a tag and test the tagged URL while ordinary traffic remains on stable revisions”.
- Expected decision: Move traffic to the healthy revision and preserve evidence from the failed revision for diagnosis.
- Decisive boundary: revisions versions traffic — rollback: evidence “revision-specific errors or latency; known healthy revision; traffic transition state” supports “Move traffic to the healthy revision and preserve evidence from the failed revision for diagnosis”. The neighboring evidence “tagged revision URL; zero traffic allocation; test identity” instead supports decision “Assign a tag and test the tagged URL while ordinary traffic remains on stable revisions”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### google-cloud-associate-cloud-engineer:revisions_versions_traffic:shift_cloud_traffic_between_revisions_release_safely:slot:tag-without-traffic-boundary

- Status: authoring-admitted
- Objective: revisions versions traffic — tag without traffic: verify that “tagged revision URL; zero traffic allocation; test identity” stays with “Assign a tag and test the tagged URL while ordinary traffic remains on stable revisions” and has not crossed into “Advance traffic only after each stage meets its release evidence and keep the previous revision available for rollback”.
- Expected decision: Assign a tag and test the tagged URL while ordinary traffic remains on stable revisions.
- Decisive boundary: revisions versions traffic — tag without traffic: evidence “tagged revision URL; zero traffic allocation; test identity” supports “Assign a tag and test the tagged URL while ordinary traffic remains on stable revisions”. The neighboring evidence “ready no-traffic revision; observed release telemetry; incremental traffic percentages” instead supports procedure “Advance traffic only after each stage meets its release evidence and keep the previous revision available for rollback”; that constraint change crosses this operation’s boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
