# aws-certified-solutions-architect-associate / aws_secure_architecture_foundations / encryption_keys_certificates

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 11
- Authoring-admitted slots: 11
- Blocked slots: 0
- Future source path: manual/source/aws-certified-solutions-architect-associate/aws_secure_architecture_foundations/encryption_keys_certificates.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### aws-certified-solutions-architect-associate:encryption_keys_certificates:acm_certificate_management_tls_kms_data_encryption_keys:slot:acm-private-certificate

- Status: authoring-admitted
- Objective: Assess whether the evidence “internal services need private PKI identities” supports the owned resolution “use ACM Private CA and ACM-managed certificates”.
- Expected decision: use ACM Private CA and ACM-managed certificates
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:encryption_keys_certificates:acm_certificate_management_tls_kms_data_encryption_keys:slot:acm-public-certificate

- Status: authoring-admitted
- Objective: Assess whether the evidence “a supported integrated AWS endpoint needs a publicly trusted TLS certificate” supports the owned resolution “request and validate an ACM public certificate”.
- Expected decision: request and validate an ACM public certificate
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:encryption_keys_certificates:acm_certificate_management_tls_kms_data_encryption_keys:slot:expired-imported-certificate

- Status: authoring-admitted
- Objective: Assess whether the evidence “an imported certificate is not automatically renewed” supports the owned resolution “diagnose the unmanaged renewal lifecycle”.
- Expected decision: diagnose the unmanaged renewal lifecycle
- Decisive boundary: This slot owns the boundary established by an imported certificate is not automatically renewed; it resolves only to “diagnose the unmanaged renewal lifecycle” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:encryption_keys_certificates:acm_certificate_management_tls_kms_data_encryption_keys:slot:kms-data-key

- Status: authoring-admitted
- Objective: Assess whether the evidence “application data needs envelope encryption” supports the owned resolution “use KMS data keys, not a TLS certificate”.
- Expected decision: use KMS data keys, not a TLS certificate
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:encryption_keys_certificates:acm_certificate_management_tls_kms_data_encryption_keys:slot:regional-certificate

- Status: authoring-admitted
- Objective: Assess whether the evidence “a service integration requires the certificate in a particular Region” supports the owned resolution “place the ACM certificate in the documented Region”.
- Expected decision: place the ACM certificate in the documented Region
- Decisive boundary: This slot owns the boundary established by a service integration requires the certificate in a particular Region; it resolves only to “place the ACM certificate in the documented Region” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:encryption_keys_certificates:aws_managed_customer_managed_imported_kms_keys_based_lifecycle_requirements:slot:aws-managed-key

- Status: authoring-admitted
- Objective: Assess whether the evidence “the customer needs auditable KMS use but not custom key policy control” supports the owned resolution “use the service's AWS managed KMS key where appropriate”.
- Expected decision: use the service's AWS managed KMS key where appropriate
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:encryption_keys_certificates:aws_managed_customer_managed_imported_kms_keys_based_lifecycle_requirements:slot:aws-owned-key

- Status: authoring-admitted
- Objective: Assess whether the evidence “the service encrypts data transparently and the customer needs no key policy or lifecycle control” supports the owned resolution “use the service's AWS owned key where supported”.
- Expected decision: use the service's AWS owned key where supported
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:encryption_keys_certificates:aws_managed_customer_managed_imported_kms_keys_based_lifecycle_requirements:slot:control-requirement-change

- Status: authoring-admitted
- Objective: Assess whether the evidence “a workload gains a cross-account key-policy requirement” supports the owned resolution “move from provider-managed encryption to a customer managed key”.
- Expected decision: move from provider-managed encryption to a customer managed key
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:encryption_keys_certificates:aws_managed_customer_managed_imported_kms_keys_based_lifecycle_requirements:slot:customer-managed-key

- Status: authoring-admitted
- Objective: Assess whether the evidence “cross-account policy, rotation, aliases, or lifecycle control is required” supports the owned resolution “use a customer managed KMS key”.
- Expected decision: use a customer managed KMS key
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:encryption_keys_certificates:aws_managed_customer_managed_imported_kms_keys_based_lifecycle_requirements:slot:imported-material

- Status: authoring-admitted
- Objective: Assess whether the evidence “external key material and its expiration lifecycle are required” supports the owned resolution “import key material into a supported KMS key”.
- Expected decision: import key material into a supported KMS key
- Decisive boundary: see canonical curriculum
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### aws-certified-solutions-architect-associate:encryption_keys_certificates:aws_managed_customer_managed_imported_kms_keys_based_lifecycle_requirements:slot:key-origin-tradeoff

- Status: authoring-admitted
- Objective: Assess whether the evidence “automatic rotation or durability assumptions differ for imported material” supports the owned resolution “apply the documented key-origin boundary”.
- Expected decision: apply the documented key-origin boundary
- Decisive boundary: This slot owns the boundary established by automatic rotation or durability assumptions differ for imported material; it resolves only to “apply the documented key-origin boundary” and does not imply that complementary controls are alternatives.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
