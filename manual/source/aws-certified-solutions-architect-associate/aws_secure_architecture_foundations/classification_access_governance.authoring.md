# aws-certified-solutions-architect-associate / aws_secure_architecture_foundations / classification_access_governance

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 12
- Authoring-admitted slots: 12
- Blocked slots: 0
- Future source path: manual/source/aws-certified-solutions-architect-associate/aws_secure_architecture_foundations/classification_access_governance.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### aws-certified-solutions-architect-associate:classification_access_governance:access_encryption_logging_residency_controls_based_data_classification:slot:classification-to-control

- Status: authoring-admitted
- Objective: Assess whether the evidence “a new dataset has no control profile” supports the owned resolution “order classification, owner approval, access, encryption, logging, retention, and residency decisions”.
- Expected decision: order classification, owner approval, access, encryption, logging, retention, and residency decisions
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:classification_access_governance:access_encryption_logging_residency_controls_based_data_classification:slot:confidential-classification

- Status: authoring-admitted
- Objective: Assess whether the evidence “regulated records require restricted access, encryption, and audit evidence” supports the owned resolution “apply the full confidential-data control set”.
- Expected decision: apply the full confidential-data control set
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:classification_access_governance:access_encryption_logging_residency_controls_based_data_classification:slot:encryption-only

- Status: authoring-admitted
- Objective: Assess whether the evidence “encryption is present but public access remains allowed” supports the owned resolution “reject encryption as a substitute for access control”.
- Expected decision: reject encryption as a substitute for access control
- Decisive boundary: This slot owns the boundary established by encryption is present but public access remains allowed; it resolves only to “reject encryption as a substitute for access control” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:classification_access_governance:access_encryption_logging_residency_controls_based_data_classification:slot:public-classification

- Status: authoring-admitted
- Objective: Assess whether the evidence “public data has no confidentiality requirement but still needs integrity and availability controls” supports the owned resolution “apply controls consistent with public classification”.
- Expected decision: apply controls consistent with public classification
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:classification_access_governance:access_encryption_logging_residency_controls_based_data_classification:slot:reclassification

- Status: authoring-admitted
- Objective: Assess whether the evidence “an analytics dataset becomes personally identifiable” supports the owned resolution “tighten controls when classification changes”.
- Expected decision: tighten controls when classification changes
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:classification_access_governance:access_encryption_logging_residency_controls_based_data_classification:slot:residency-classification

- Status: authoring-admitted
- Objective: Assess whether the evidence “data must remain in approved Regions” supports the owned resolution “constrain storage and replication locations”.
- Expected decision: constrain storage and replication locations
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:classification_access_governance:block_public_access_bucket_policy_ownership_controls_prevent_exposure_path:slot:access-point-path

- Status: authoring-admitted
- Objective: Assess whether the evidence “an S3 access point creates another exposure path” supports the owned resolution “evaluate its policy and block-public-access settings”.
- Expected decision: evaluate its policy and block-public-access settings
- Decisive boundary: This slot owns the boundary established by an S3 access point creates another exposure path; it resolves only to “evaluate its policy and block-public-access settings” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:classification_access_governance:block_public_access_bucket_policy_ownership_controls_prevent_exposure_path:slot:account-block-public-access

- Status: authoring-admitted
- Objective: Assess whether the evidence “all buckets in an account must reject public exposure” supports the owned resolution “enable account-level S3 Block Public Access”.
- Expected decision: enable account-level S3 Block Public Access
- Decisive boundary: This slot owns the boundary established by all buckets in an account must reject public exposure; it resolves only to “enable account-level S3 Block Public Access” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:classification_access_governance:block_public_access_bucket_policy_ownership_controls_prevent_exposure_path:slot:acl-assumption

- Status: authoring-admitted
- Objective: Assess whether the evidence “a team disables ACLs but leaves a public bucket policy” supports the owned resolution “diagnose the remaining policy exposure”.
- Expected decision: diagnose the remaining policy exposure
- Decisive boundary: This slot owns the boundary established by a team disables ACLs but leaves a public bucket policy; it resolves only to “diagnose the remaining policy exposure” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:classification_access_governance:block_public_access_bucket_policy_ownership_controls_prevent_exposure_path:slot:bucket-policy-public-principal

- Status: authoring-admitted
- Objective: Assess whether the evidence “a bucket policy grants read to a public principal” supports the owned resolution “remove the public grant and preserve intended principals”.
- Expected decision: remove the public grant and preserve intended principals
- Decisive boundary: This slot owns the boundary established by a bucket policy grants read to a public principal; it resolves only to “remove the public grant and preserve intended principals” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:classification_access_governance:block_public_access_bucket_policy_ownership_controls_prevent_exposure_path:slot:exposure-review

- Status: authoring-admitted
- Objective: Assess whether the evidence “a bucket must be private” supports the owned resolution “evaluate account settings, bucket settings, policies, access points, and ownership controls”.
- Expected decision: evaluate account settings, bucket settings, policies, access points, and ownership controls
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:classification_access_governance:block_public_access_bucket_policy_ownership_controls_prevent_exposure_path:slot:object-ownership-enforced

- Status: authoring-admitted
- Objective: Assess whether the evidence “writers from multiple accounts create objects” supports the owned resolution “use bucket-owner-enforced ownership where appropriate”.
- Expected decision: use bucket-owner-enforced ownership where appropriate
- Decisive boundary: This slot owns the boundary established by writers from multiple accounts create objects; it resolves only to “use bucket-owner-enforced ownership where appropriate” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
