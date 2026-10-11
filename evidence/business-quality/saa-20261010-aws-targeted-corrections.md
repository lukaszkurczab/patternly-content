# AWS SAA targeted source corrections — 2026-10-11

Producer source baseline: `0f4e6912d7d0cdb1a1c41b9d7885d7e867f80f34` (`aws-certified-solutions-architect-associate-authoring-v2026.09.21-odk096-bizq02-v2-bizq03-planning-v2`).
Current AWS content version: `aws-certified-solutions-architect-associate-authoring-v2026.10.11-saa-fixes-v1-bizq03-planning-v2`; 2,604 questions; new training question-set SHA-256: `f745d5ea27b753a3fae1143c079086fb2bab99dacfbb89a08744925030eeed42`.

The fixed predecessor proof reconstructs the byte-exact 12 prior source files and full 2,604-question AWS set. It records 27 same-ID corrections and one successor identity for the changed cutover objective. The historical ODK-096 approval and release lock remain unmodified.

Independent semantic QA (Luna High, 2026-10-11): **PASS, all 28 exact IDs**. Final reread covered MQ001/MQ002/MQ005/MQ006 and Security Hub B06-015; the other reviewed verdicts were reused only at their unchanged source-object hashes.

## Exact before/after record

### `aws-saa-c03-AWSSAA-N04-B01-011`

- Source: `content/aws-certified-solutions-architect-associate/application_edge_threat_and_credential_security/application_authentication_and_cognito.json`; question index is 0-based; changed pointers are relative to each question: before `/10/constraints/0`; after `/10/constraints/0`, before `/10/constraints/1`; after `/10/constraints/1`, before `/10/constraints/2`; after `/10/constraints/2`, before `/10/feedback/details/boundaryOrTradeoff`; after `/10/feedback/details/boundaryOrTradeoff`, before `/10/feedback/details/mechanismOrProperty`; after `/10/feedback/details/mechanismOrProperty`, before `/10/feedback/details/url`; after `/10/feedback/details/url`, before `/10/feedback/reason`; after `/10/feedback/reason`, before `/10/prompt`; after `/10/prompt`, before `/10/sourceRefs/0`; after `/10/sourceRefs/0`.
- Before prompt: A customer portal must require a second factor for all users, and the team wants the application to enforce it consistently. Which control is most direct?
- After prompt: A customer portal authenticates all users directly through native Amazon Cognito user-pool sign-in, without an external federated identity provider. It requires MFA for every account. Which control is most direct?
- Answer: `A` → `A`.
- After semantic QA: **PASS** (Luna High, 2026-10-11).
- Option IDs and meanings preserved.
- Current official AWS references: [https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-authentication-flow-methods.html](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-authentication-flow-methods.html).

### `aws-saa-c03-AWSSAA-N04-B01-015`

- Source: `content/aws-certified-solutions-architect-associate/application_edge_threat_and_credential_security/application_authentication_and_cognito.json`; question index is 0-based; changed pointers are relative to each question: before `/14/feedback/details/mechanismOrProperty`; after `/14/feedback/details/mechanismOrProperty`, before `/14/feedback/details/scenarioApplication`; after `/14/feedback/details/scenarioApplication`, before `/14/feedback/reason`; after `/14/feedback/reason`, before `/14/interaction/options/0/text`; after `/14/interaction/options/0/text`, before `/14/prompt`; after `/14/prompt`.
- Before prompt: A REST API should reject requests that lack a valid Cognito user-pool token before invoking backend code. Which integration should be evaluated?
- After prompt: An Amazon API Gateway REST API must require an OAuth scope for each protected method and separately enforce application roles or resource ownership. Which design fits?
- Answer: `A` → `A`.
- After semantic QA: **PASS** (Luna High, 2026-10-11).
- Option IDs preserved; option wording updated for the same answer meaning.
- Current official AWS references: [https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-integrate-with-cognito.html](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-integrate-with-cognito.html).

### `aws-saa-c03-AWSSAA-N04-B02-006`

- Source: `content/aws-certified-solutions-architect-associate/application_edge_threat_and_credential_security/application_secrets_and_configuration_protection.json`; question index is 0-based; changed pointers are relative to each question: before `/5/feedback/details/mechanismOrProperty`; after `/5/feedback/details/mechanismOrProperty`, before `/5/feedback/details/scenarioApplication`; after `/5/feedback/details/scenarioApplication`, before `/5/feedback/details/url`; after `/5/feedback/details/url`, before `/5/feedback/reason`; after `/5/feedback/reason`, before `/5/interaction/options/0/text`; after `/5/interaction/options/0/text`, before `/5/sourceRefs (length)`; after `/5/sourceRefs (length)`, before `/5/sourceRefs/0`; after `/5/sourceRefs/0`.
- Before prompt: An ECS task should receive a Secrets Manager value as an environment variable, and the task execution role currently lacks secret access. Which correction is required?
- After prompt: An ECS task should receive a Secrets Manager value as an environment variable, and the task execution role currently lacks secret access. Which correction is required?
- Answer: `A` → `A`.
- After semantic QA: **PASS** (Luna High, 2026-10-11).
- Option IDs preserved; option wording updated for the same answer meaning.
- Current official AWS references: [https://docs.aws.amazon.com/AmazonECS/latest/developerguide/specifying-sensitive-data-tutorial.html](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/specifying-sensitive-data-tutorial.html), [https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_execution_IAM_role.html](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_execution_IAM_role.html).

### `aws-saa-c03-AWSSAA-N04-B03-016`

- Source: `content/aws-certified-solutions-architect-associate/application_edge_threat_and_credential_security/waf_controls_and_web_attack_mitigation.json`; question index is 0-based; changed pointers are relative to each question: before `/15/feedback/details/mechanismOrProperty`; after `/15/feedback/details/mechanismOrProperty`, before `/15/feedback/details/scenarioApplication`; after `/15/feedback/details/scenarioApplication`, before `/15/feedback/details/url`; after `/15/feedback/details/url`, before `/15/feedback/reason`; after `/15/feedback/reason`, before `/15/interaction/options/0/text`; after `/15/interaction/options/0/text`, before `/15/sourceRefs (length)`; after `/15/sourceRefs (length)`, before `/15/sourceRefs/0`; after `/15/sourceRefs/0`.
- Before prompt: A managed rule false-positively matches a single trusted webhook path. Which exception is safest?
- After prompt: A managed rule false-positively matches a single trusted webhook path. Which exception is safest?
- Answer: `A` → `A`.
- After semantic QA: **PASS** (Luna High, 2026-10-11).
- Option IDs preserved; option wording updated for the same answer meaning.
- Current official AWS references: [https://docs.aws.amazon.com/waf/latest/developerguide/waf-rule-statement-type-managed-rule-group.html](https://docs.aws.amazon.com/waf/latest/developerguide/waf-rule-statement-type-managed-rule-group.html), [https://docs.aws.amazon.com/waf/latest/developerguide/waf-scope-down-statements.html](https://docs.aws.amazon.com/waf/latest/developerguide/waf-scope-down-statements.html).

### `aws-saa-c03-AWSSAA-N04-B05-011`

- Source: `content/aws-certified-solutions-architect-associate/application_edge_threat_and_credential_security/cloudfront_and_edge_security.json`; question index is 0-based; changed pointers are relative to each question: before `/10/feedback/details/mechanismOrProperty`; after `/10/feedback/details/mechanismOrProperty`, before `/10/feedback/details/scenarioApplication`; after `/10/feedback/details/scenarioApplication`, before `/10/feedback/details/url`; after `/10/feedback/details/url`, before `/10/feedback/reason`; after `/10/feedback/reason`, before `/10/interaction/options/0/text`; after `/10/interaction/options/0/text`, before `/10/prompt`; after `/10/prompt`, before `/10/sourceRefs/0`; after `/10/sourceRefs/0`.
- Before prompt: The same web ACL protects an ALB and a CloudFront distribution, but the request paths and body limits differ. What should the team verify?
- After prompt: A company wants equivalent AWS WAF protection for a CloudFront distribution and a Regional Application Load Balancer. The resources have different request-component inspection limits. Which design is required?
- Answer: `A` → `A`.
- After semantic QA: **PASS** (Luna High, 2026-10-11).
- Option IDs preserved; option wording updated for the same answer meaning.
- Current official AWS references: [https://docs.aws.amazon.com/waf/latest/developerguide/how-aws-waf-works-resources.html](https://docs.aws.amazon.com/waf/latest/developerguide/how-aws-waf-works-resources.html).

### `aws-saa-c03-AWSSAA-N04-B05-015`

- Source: `content/aws-certified-solutions-architect-associate/application_edge_threat_and_credential_security/cloudfront_and_edge_security.json`; question index is 0-based; changed pointers are relative to each question: before `/14/constraints/0`; after `/14/constraints/0`, before `/14/constraints/1`; after `/14/constraints/1`, before `/14/constraints/2`; after `/14/constraints/2`, before `/14/feedback/details/mechanismOrProperty`; after `/14/feedback/details/mechanismOrProperty`, before `/14/feedback/details/scenarioApplication`; after `/14/feedback/details/scenarioApplication`, before `/14/feedback/reason`; after `/14/feedback/reason`, before `/14/prompt`; after `/14/prompt`.
- Before prompt: A CloudFront distribution should serve a secondary origin when the primary returns configured failure responses. Which feature should be used?
- After prompt: A CloudFront distribution must fail over GET and HEAD requests to a compatible secondary origin when the primary returns configured failure responses. Which feature should be used?
- Answer: `A` → `A`.
- After semantic QA: **PASS** (Luna High, 2026-10-11).
- Option IDs and meanings preserved.
- Current official AWS references: [https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/high_availability_origin_failover.html](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/high_availability_origin_failover.html).

### `aws-saa-c03-AWSSAA-N04-B06-010`

- Source: `content/aws-certified-solutions-architect-associate/application_edge_threat_and_credential_security/threat_detection_service_selection.json`; question index is 0-based; changed pointers are relative to each question: before `/9/feedback/details/mechanismOrProperty`; after `/9/feedback/details/mechanismOrProperty`, before `/9/feedback/details/scenarioApplication`; after `/9/feedback/details/scenarioApplication`, before `/9/feedback/reason`; after `/9/feedback/reason`, before `/9/interaction/options/0/text`; after `/9/interaction/options/0/text`, before `/9/prompt`; after `/9/prompt`, before `/9/sourceRefs (length)`; after `/9/sourceRefs (length)`.
- Before prompt: The CISO wants one view of findings from GuardDuty, Inspector, and Config across member accounts. Which service is the central aggregation layer?
- After prompt: The CISO needs a single ASFF-based view of findings from GuardDuty, Inspector, and AWS Config, plus posture control results across member accounts. Which service should own this finding and compliance workflow?
- Answer: `A` → `A`.
- After semantic QA: **PASS** (Luna High, 2026-10-11).
- Option IDs preserved; option wording updated for the same answer meaning.
- Current official AWS references: [https://docs.aws.amazon.com/securityhub/latest/userguide/what-is-securityhub.html](https://docs.aws.amazon.com/securityhub/latest/userguide/what-is-securityhub.html), [https://aws.amazon.com/about-aws/whats-new/2025/12/security-hub-near-real-time-risk-analytics/](https://aws.amazon.com/about-aws/whats-new/2025/12/security-hub-near-real-time-risk-analytics/).

### `aws-saa-c03-AWSSAA-N04-B06-011`

- Source: `content/aws-certified-solutions-architect-associate/application_edge_threat_and_credential_security/threat_detection_service_selection.json`; question index is 0-based; changed pointers are relative to each question: before `/10/feedback/details/mechanismOrProperty`; after `/10/feedback/details/mechanismOrProperty`, before `/10/feedback/details/scenarioApplication`; after `/10/feedback/details/scenarioApplication`, before `/10/feedback/details/url`; after `/10/feedback/details/url`, before `/10/feedback/reason`; after `/10/feedback/reason`, before `/10/interaction/options/0/text`; after `/10/interaction/options/0/text`, before `/10/prompt`; after `/10/prompt`, before `/10/sourceRefs (length)`; after `/10/sourceRefs (length)`, before `/10/sourceRefs/0`; after `/10/sourceRefs/0`.
- Before prompt: A compliance team needs automated checks against a supported security standard and evidence of control status. Which Security Hub capability addresses this?
- After prompt: A compliance team needs automated AWS Security Hub CSPM checks against a supported security standard and evidence of control status. Which capability should it enable?
- Answer: `A` → `A`.
- After semantic QA: **PASS** (Luna High, 2026-10-11).
- Option IDs preserved; option wording updated for the same answer meaning.
- Current official AWS references: [https://docs.aws.amazon.com/securityhub/latest/userguide/standards-view-manage.html](https://docs.aws.amazon.com/securityhub/latest/userguide/standards-view-manage.html), [https://aws.amazon.com/about-aws/whats-new/2025/12/security-hub-near-real-time-risk-analytics/](https://aws.amazon.com/about-aws/whats-new/2025/12/security-hub-near-real-time-risk-analytics/).

### `aws-saa-c03-AWSSAA-N04-B06-012`

- Source: `content/aws-certified-solutions-architect-associate/application_edge_threat_and_credential_security/threat_detection_service_selection.json`; question index is 0-based; changed pointers are relative to each question: before `/11/feedback/details/mechanismOrProperty`; after `/11/feedback/details/mechanismOrProperty`, before `/11/feedback/details/scenarioApplication`; after `/11/feedback/details/scenarioApplication`, before `/11/feedback/details/url`; after `/11/feedback/details/url`, before `/11/feedback/reason`; after `/11/feedback/reason`, before `/11/prompt`; after `/11/prompt`, before `/11/sourceRefs/0`; after `/11/sourceRefs/0`.
- Before prompt: A Security Hub finding is assigned to the wrong team and remains open after remediation. Which workflow design should be improved?
- After prompt: A Security Hub CSPM finding is assigned to the wrong team and remains open after remediation. Which workflow design should be improved?
- Answer: `A` → `A`.
- After semantic QA: **PASS** (Luna High, 2026-10-11).
- Option IDs and meanings preserved.
- Current official AWS references: [https://docs.aws.amazon.com/securityhub/latest/userguide/findings-workflow-status.html](https://docs.aws.amazon.com/securityhub/latest/userguide/findings-workflow-status.html).

### `aws-saa-c03-AWSSAA-N04-B06-013`

- Source: `content/aws-certified-solutions-architect-associate/application_edge_threat_and_credential_security/threat_detection_service_selection.json`; question index is 0-based; changed pointers are relative to each question: before `/12/feedback/details/mechanismOrProperty`; after `/12/feedback/details/mechanismOrProperty`, before `/12/feedback/details/scenarioApplication`; after `/12/feedback/details/scenarioApplication`, before `/12/feedback/reason`; after `/12/feedback/reason`, before `/12/interaction/options/0/text`; after `/12/interaction/options/0/text`, before `/12/prompt`; after `/12/prompt`, before `/12/sourceRefs (length)`; after `/12/sourceRefs (length)`.
- Before prompt: A security account must manage Security Hub across Organization member accounts without using the management account for daily operations. Which pattern fits?
- After prompt: A security account must centrally manage AWS Security Hub CSPM findings and standards across AWS Organizations member accounts without using the management account for daily operations. Which pattern fits?
- Answer: `A` → `A`.
- After semantic QA: **PASS** (Luna High, 2026-10-11).
- Option IDs preserved; option wording updated for the same answer meaning.
- Current official AWS references: [https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-accounts.html](https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-accounts.html), [https://aws.amazon.com/about-aws/whats-new/2025/12/security-hub-near-real-time-risk-analytics/](https://aws.amazon.com/about-aws/whats-new/2025/12/security-hub-near-real-time-risk-analytics/).

### `aws-saa-c03-AWSSAA-N04-B06-014`

- Source: `content/aws-certified-solutions-architect-associate/application_edge_threat_and_credential_security/threat_detection_service_selection.json`; question index is 0-based; changed pointers are relative to each question: before `/13/feedback/details/mechanismOrProperty`; after `/13/feedback/details/mechanismOrProperty`, before `/13/feedback/details/scenarioApplication`; after `/13/feedback/details/scenarioApplication`, before `/13/feedback/reason`; after `/13/feedback/reason`, before `/13/interaction/options/0/text`; after `/13/interaction/options/0/text`, before `/13/prompt`; after `/13/prompt`.
- Before prompt: The security team wants one Region to aggregate Security Hub findings from a defined set of Regions. Which condition matters?
- After prompt: One AWS Region must aggregate AWS Security Hub CSPM findings from an explicit set of linked Regions under a delegated administrator. Which design is required?
- Answer: `A` → `A`.
- After semantic QA: **PASS** (Luna High, 2026-10-11).
- Option IDs preserved; option wording updated for the same answer meaning.
- Current official AWS references: [https://docs.aws.amazon.com/securityhub/latest/userguide/finding-aggregation.html](https://docs.aws.amazon.com/securityhub/latest/userguide/finding-aggregation.html).

### `aws-saa-c03-AWSSAA-N04-B06-015`

- Source: `content/aws-certified-solutions-architect-associate/application_edge_threat_and_credential_security/threat_detection_service_selection.json`; question index is 0-based; changed pointers are relative to each question: before `/14/feedback/details/mechanismOrProperty`; after `/14/feedback/details/mechanismOrProperty`, before `/14/feedback/details/scenarioApplication`; after `/14/feedback/details/scenarioApplication`, before `/14/feedback/reason`; after `/14/feedback/reason`, before `/14/interaction/options/0/text`; after `/14/interaction/options/0/text`, before `/14/prompt`; after `/14/prompt`.
- Before prompt: A recurring finding is a documented accepted risk on a non-production account. How should the team reduce noise without hiding new production findings?
- After prompt: A Security Hub CSPM finding is an approved, expiring risk on one non-production resource. How should the team reduce noise without hiding new production findings?
- Answer: `A` → `A`.
- After semantic QA: **PASS** (Luna High, 2026-10-11).
- Option IDs preserved; option wording updated for the same answer meaning.
- Current official AWS references: [https://docs.aws.amazon.com/securityhub/latest/userguide/finding-suppression.html](https://docs.aws.amazon.com/securityhub/latest/userguide/finding-suppression.html).

### `aws-saa-c03-AWSSAA-N04-B06-016`

- Source: `content/aws-certified-solutions-architect-associate/application_edge_threat_and_credential_security/threat_detection_service_selection.json`; question index is 0-based; changed pointers are relative to each question: before `/15/feedback/details/mechanismOrProperty`; after `/15/feedback/details/mechanismOrProperty`, before `/15/feedback/details/scenarioApplication`; after `/15/feedback/details/scenarioApplication`, before `/15/feedback/reason`; after `/15/feedback/reason`, before `/15/interaction/options/0/text`; after `/15/interaction/options/0/text`, before `/15/sourceRefs (length)`; after `/15/sourceRefs (length)`.
- Before prompt: A security design must detect active credential misuse, scan container images for CVEs, investigate relationships, and aggregate findings. Which service mapping is correct?
- After prompt: A security design must detect active credential misuse, scan container images for CVEs, investigate relationships, and aggregate findings. Which service mapping is correct?
- Answer: `A` → `A`.
- After semantic QA: **PASS** (Luna High, 2026-10-11).
- Option IDs preserved; option wording updated for the same answer meaning.
- Current official AWS references: [https://docs.aws.amazon.com/securityhub/latest/userguide/what-is-securityhub.html](https://docs.aws.amazon.com/securityhub/latest/userguide/what-is-securityhub.html), [https://aws.amazon.com/about-aws/whats-new/2025/12/security-hub-near-real-time-risk-analytics/](https://aws.amazon.com/about-aws/whats-new/2025/12/security-hub-near-real-time-risk-analytics/).

### `aws-saa-c03-AWSSAA-N04-B06-018`

- Source: `content/aws-certified-solutions-architect-associate/application_edge_threat_and_credential_security/threat_detection_service_selection.json`; question index is 0-based; changed pointers are relative to each question: before `/17/constraints/0`; after `/17/constraints/0`, before `/17/feedback/details/mechanismOrProperty`; after `/17/feedback/details/mechanismOrProperty`, before `/17/feedback/details/scenarioApplication`; after `/17/feedback/details/scenarioApplication`, before `/17/feedback/details/url`; after `/17/feedback/details/url`, before `/17/feedback/reason`; after `/17/feedback/reason`, before `/17/prompt`; after `/17/prompt`, before `/17/sourceRefs/0`; after `/17/sourceRefs/0`.
- Before prompt: Auditors need to prove that high-severity security findings were triaged and remediated, while raw evidence remains protected. Which design is appropriate?
- After prompt: Auditors need evidence that high-severity AWS Security Hub CSPM findings were triaged and remediated, while raw evidence remains protected. Which design is appropriate?
- Answer: `A` → `A`.
- After semantic QA: **PASS** (Luna High, 2026-10-11).
- Option IDs and meanings preserved.
- Current official AWS references: [https://docs.aws.amazon.com/securityhub/latest/userguide/findings-workflow-status.html](https://docs.aws.amazon.com/securityhub/latest/userguide/findings-workflow-status.html).

### `aws-saa-c03-AWSSAA-N04-B07-012`

- Source: `content/aws-certified-solutions-architect-associate/application_edge_threat_and_credential_security/macie_and_threat_detection_service_selection.json`; question index is 0-based; changed pointers are relative to each question: before `/11/feedback/details/mechanismOrProperty`; after `/11/feedback/details/mechanismOrProperty`, before `/11/feedback/details/scenarioApplication`; after `/11/feedback/details/scenarioApplication`, before `/11/feedback/reason`; after `/11/feedback/reason`, before `/11/interaction/options/0/text`; after `/11/interaction/options/0/text`, before `/11/prompt`; after `/11/prompt`, before `/11/sourceRefs (length)`; after `/11/sourceRefs (length)`.
- Before prompt: A central security team already triages findings in Security Hub and wants Macie findings included without building a custom polling system. Which design is appropriate?
- After prompt: A central security team already triages ASFF findings in AWS Security Hub CSPM and wants Macie findings included for the required accounts and Regions. Which design is appropriate?
- Answer: `A` → `A`.
- After semantic QA: **PASS** (Luna High, 2026-10-11).
- Option IDs preserved; option wording updated for the same answer meaning.
- Current official AWS references: [https://docs.aws.amazon.com/macie/latest/user/macie-securityhub.html](https://docs.aws.amazon.com/macie/latest/user/macie-securityhub.html), [https://docs.aws.amazon.com/securityhub/latest/userguide/what-is-securityhub.html](https://docs.aws.amazon.com/securityhub/latest/userguide/what-is-securityhub.html), [https://aws.amazon.com/about-aws/whats-new/2025/12/security-hub-near-real-time-risk-analytics/](https://aws.amazon.com/about-aws/whats-new/2025/12/security-hub-near-real-time-risk-analytics/).

### `aws-saa-c03-AWSSAA-N07-B01-007`

- Source: `content/aws-certified-solutions-architect-associate/api_messaging_event_and_workflow_decoupling/api_gateway_and_appsync_integration_boundaries.json`; question index is 0-based; changed pointers are relative to each question: before `/6/feedback/details/mechanismOrProperty`; after `/6/feedback/details/mechanismOrProperty`, before `/6/feedback/details/scenarioApplication`; after `/6/feedback/details/scenarioApplication`, before `/6/feedback/details/url`; after `/6/feedback/details/url`, before `/6/feedback/reason`; after `/6/feedback/reason`, before `/6/interaction/options/0/text`; after `/6/interaction/options/0/text`, before `/6/prompt`; after `/6/prompt`, before `/6/sourceRefs (length)`; after `/6/sourceRefs (length)`, before `/6/sourceRefs/0`; after `/6/sourceRefs/0`.
- Before prompt: A public API must protect a backend from bursts and assign different usage limits to two client plans. Which API Gateway features should be combined?
- After prompt: An Amazon API Gateway REST API must protect a finite-capacity backend from bursts and apply different best-effort usage quotas to two known client plans. Which controls should be combined?
- Answer: `A` → `A`.
- After semantic QA: **PASS** (Luna High, 2026-10-11).
- Option IDs preserved; option wording updated for the same answer meaning.
- Current official AWS references: [https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-vs-rest.html](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-vs-rest.html), [https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-create-usage-plans.html](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-create-usage-plans.html).

### `aws-saa-c03-AWSSAA-N07-B01-010`

- Source: `content/aws-certified-solutions-architect-associate/api_messaging_event_and_workflow_decoupling/api_gateway_and_appsync_integration_boundaries.json`; question index is 0-based; changed pointers are relative to each question: before `/9/feedback/details/mechanismOrProperty`; after `/9/feedback/details/mechanismOrProperty`, before `/9/feedback/details/scenarioApplication`; after `/9/feedback/details/scenarioApplication`, before `/9/feedback/reason`; after `/9/feedback/reason`, before `/9/interaction/options/0/text`; after `/9/interaction/options/0/text`, before `/9/prompt`; after `/9/prompt`, before `/9/sourceRefs (length)`; after `/9/sourceRefs (length)`, before `/9/sourceRefs/0`; after `/9/sourceRefs/0`.
- Before prompt: An API receives JSON requests with a required schema, and malformed requests should be rejected before invoking the backend. Which API Gateway capability is relevant?
- After prompt: An Amazon API Gateway REST API receives JSON requests with a required schema; malformed requests must be rejected before invoking an expensive backend. Which built-in method-level feature fits?
- Answer: `A` → `A`.
- After semantic QA: **PASS** (Luna High, 2026-10-11).
- Option IDs preserved; option wording updated for the same answer meaning.
- Current official AWS references: [https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-vs-rest.html](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-vs-rest.html), [https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-method-request-validation.html](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-method-request-validation.html).

### `aws-saa-c03-AWSSAA-N07-B02-013`

- Source: `content/aws-certified-solutions-architect-associate/api_messaging_event_and_workflow_decoupling/sqs_queue_patterns_and_dead_letter_handling.json`; question index is 0-based; changed pointers are relative to each question: before `/12/feedback/details/boundaryOrTradeoff`; after `/12/feedback/details/boundaryOrTradeoff`, before `/12/feedback/details/mechanismOrProperty`; after `/12/feedback/details/mechanismOrProperty`, before `/12/feedback/reason`; after `/12/feedback/reason`, before `/12/interaction/options/0/text`; after `/12/interaction/options/0/text`, before `/12/prompt`; after `/12/prompt`.
- Before prompt: A workflow should not make a message visible to consumers until five minutes after it is produced. Which SQS feature matches the requirement?
- After prompt: A producer sends a message to an Amazon SQS Standard queue and needs just that message to remain invisible to consumers for five minutes after enqueueing. Which setting meets the requirement?
- Answer: `A` → `A`.
- After semantic QA: **PASS** (Luna High, 2026-10-11).
- Option IDs preserved; option wording updated for the same answer meaning.
- Current official AWS references: [https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-message-timers.html](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-message-timers.html).

### `aws-saa-c03-AWSSAA-N07-B04-005`

- Source: `content/aws-certified-solutions-architect-associate/api_messaging_event_and_workflow_decoupling/eventbridge_routing_and_event_buses.json`; question index is 0-based; changed pointers are relative to each question: before `/4/feedback/details/mechanismOrProperty`; after `/4/feedback/details/mechanismOrProperty`, before `/4/feedback/details/scenarioApplication`; after `/4/feedback/details/scenarioApplication`, before `/4/sourceRefs (length)`; after `/4/sourceRefs (length)`.
- Before prompt: A consumer is added after important domain events were published, and the team needs to replay retained events within an approved time window. Which EventBridge capability should be configured?
- After prompt: A consumer is added after important domain events were published, and the team needs to replay retained events within an approved time window. Which EventBridge capability should be configured?
- Answer: `A` → `A`.
- After semantic QA: **PASS** (Luna High, 2026-10-11).
- Option IDs and meanings preserved.
- Current official AWS references: [https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-archive.html](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-archive.html), [https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-replay-archived-event.html](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-replay-archived-event.html).

### `aws-saa-c03-AWSSAA-N07-B04-006`

- Source: `content/aws-certified-solutions-architect-associate/api_messaging_event_and_workflow_decoupling/eventbridge_routing_and_event_buses.json`; question index is 0-based; changed pointers are relative to each question: before `/5/feedback/details/mechanismOrProperty`; after `/5/feedback/details/mechanismOrProperty`, before `/5/feedback/details/scenarioApplication`; after `/5/feedback/details/scenarioApplication`, before `/5/feedback/details/url`; after `/5/feedback/details/url`, before `/5/feedback/reason`; after `/5/feedback/reason`, before `/5/interaction/options/0/text`; after `/5/interaction/options/0/text`, before `/5/sourceRefs (length)`; after `/5/sourceRefs (length)`, before `/5/sourceRefs/0`; after `/5/sourceRefs/0`.
- Before prompt: A repaired consumer should receive only events from yesterday between 10:00 and 11:00, and live events must continue during the replay. What should the runbook specify?
- After prompt: A repaired consumer should receive only events from yesterday between 10:00 and 11:00, and live events must continue during the replay. What should the runbook specify?
- Answer: `A` → `A`.
- After semantic QA: **PASS** (Luna High, 2026-10-11).
- Option IDs preserved; option wording updated for the same answer meaning.
- Current official AWS references: [https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-archive.html](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-archive.html), [https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-replay-archived-event.html](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-replay-archived-event.html).

### `aws-saa-c03-AWSSAA-N07-B05-001`

- Source: `content/aws-certified-solutions-architect-associate/api_messaging_event_and_workflow_decoupling/amazon_mq_protocol_preserving_integration.json`; question index is 0-based; changed pointers are relative to each question: before `/0/constraints/0`; after `/0/constraints/0`, before `/0/constraints/1`; after `/0/constraints/1`, before `/0/constraints/2`; after `/0/constraints/2`, before `/0/feedback/details/errorCorrection`; after `/0/feedback/details/errorCorrection`, before `/0/feedback/details/mechanismOrProperty`; after `/0/feedback/details/mechanismOrProperty`, before `/0/feedback/details/scenarioApplication`; after `/0/feedback/details/scenarioApplication`, before `/0/feedback/messages/0/targetId`; after `/0/feedback/messages/0/targetId`, before `/0/feedback/messages/0/text`; after `/0/feedback/messages/0/text`, before `/0/feedback/messages/1/text`; after `/0/feedback/messages/1/text`, before `/0/feedback/messages/2/targetId`; after `/0/feedback/messages/2/targetId`, before `/0/feedback/messages/2/text`; after `/0/feedback/messages/2/text`, before `/0/feedback/reason`; after `/0/feedback/reason`, before `/0/interaction/options/0/text`; after `/0/interaction/options/0/text`, before `/0/interaction/options/1/optionId`; after `/0/interaction/options/1/optionId`, before `/0/interaction/options/1/text`; after `/0/interaction/options/1/text`, before `/0/interaction/options/2/text`; after `/0/interaction/options/2/text`, before `/0/interaction/options/3/optionId`; after `/0/interaction/options/3/optionId`, before `/0/interaction/options/3/text`; after `/0/interaction/options/3/text`, before `/0/prompt`; after `/0/prompt`, before `/0/sourceRefs (length)`; after `/0/sourceRefs (length)`.
- Before prompt: An enterprise application uses an existing JMS client and broker semantics that cannot be rewritten during migration. Which AWS service should be evaluated first?
- After prompt: A Java application must preserve durable JMS topic subscriptions and broker transaction semantics while moving to a managed AWS broker. Which service should be evaluated first?
- Answer: `A` → `A`.
- After semantic QA: **PASS** (Luna High, 2026-10-11).
- Option identity change: retired `B`, `D`; introduced `active_mq_openwire_on_rabbitmq`, `sqs_jms_queue_adapter`.
- Current official AWS references: [https://docs.aws.amazon.com/amazon-mq/latest/developer-guide/what-is-amazon-mq.html](https://docs.aws.amazon.com/amazon-mq/latest/developer-guide/what-is-amazon-mq.html), [https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-java-message-service-jms-client.html](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-java-message-service-jms-client.html).

### `aws-saa-c03-AWSSAA-N07-B05-002`

- Source: `content/aws-certified-solutions-architect-associate/api_messaging_event_and_workflow_decoupling/amazon_mq_protocol_preserving_integration.json`; question index is 0-based; changed pointers are relative to each question: before `/1/constraints/0`; after `/1/constraints/0`, before `/1/constraints/1`; after `/1/constraints/1`, before `/1/constraints/2`; after `/1/constraints/2`, before `/1/feedback/details/errorCorrection`; after `/1/feedback/details/errorCorrection`, before `/1/feedback/details/mechanismOrProperty`; after `/1/feedback/details/mechanismOrProperty`, before `/1/feedback/details/scenarioApplication`; after `/1/feedback/details/scenarioApplication`, before `/1/feedback/details/url`; after `/1/feedback/details/url`, before `/1/feedback/messages/0/targetId`; after `/1/feedback/messages/0/targetId`, before `/1/feedback/messages/0/text`; after `/1/feedback/messages/0/text`, before `/1/feedback/messages/1/text`; after `/1/feedback/messages/1/text`, before `/1/feedback/messages/2/targetId`; after `/1/feedback/messages/2/targetId`, before `/1/feedback/messages/2/text`; after `/1/feedback/messages/2/text`, before `/1/feedback/reason`; after `/1/feedback/reason`, before `/1/interaction/options/0/text`; after `/1/interaction/options/0/text`, before `/1/interaction/options/1/optionId`; after `/1/interaction/options/1/optionId`, before `/1/interaction/options/1/text`; after `/1/interaction/options/1/text`, before `/1/interaction/options/2/text`; after `/1/interaction/options/2/text`, before `/1/interaction/options/3/optionId`; after `/1/interaction/options/3/optionId`, before `/1/interaction/options/3/text`; after `/1/interaction/options/3/text`, before `/1/prompt`; after `/1/prompt`, before `/1/sourceRefs (length)`; after `/1/sourceRefs (length)`.
- Before prompt: A team must choose a managed broker engine based on existing clients that use either ActiveMQ or RabbitMQ protocol and feature behavior. What is the correct selection process?
- After prompt: A JMS client must roll back an XA transaction across a broker failure. The team is comparing Amazon MQ for ActiveMQ with Amazon MQ for RabbitMQ 4. Which selection step is required?
- Answer: `A` → `A`.
- After semantic QA: **PASS** (Luna High, 2026-10-11).
- Option identity change: retired `B`, `D`; introduced `rabbitmq4_supports_xa`, `rabbitmq_confirms_are_xa`.
- Current official AWS references: [https://docs.aws.amazon.com/amazon-mq/latest/developer-guide/amazon-mq-supported-engine-types.html](https://docs.aws.amazon.com/amazon-mq/latest/developer-guide/amazon-mq-supported-engine-types.html), [https://docs.aws.amazon.com/amazon-mq/latest/developer-guide/rabbitmq-jms-support.html](https://docs.aws.amazon.com/amazon-mq/latest/developer-guide/rabbitmq-jms-support.html).

### `aws-saa-c03-AWSSAA-N07-B05-003`

- Source: `content/aws-certified-solutions-architect-associate/api_messaging_event_and_workflow_decoupling/amazon_mq_protocol_preserving_integration.json`; question index is 0-based; changed pointers are relative to each question: before `/2/constraints/0`; after `/2/constraints/0`, before `/2/constraints/1`; after `/2/constraints/1`, before `/2/constraints/2`; after `/2/constraints/2`, before `/2/feedback/details/errorCorrection`; after `/2/feedback/details/errorCorrection`, before `/2/feedback/details/mechanismOrProperty`; after `/2/feedback/details/mechanismOrProperty`, before `/2/feedback/details/scenarioApplication`; after `/2/feedback/details/scenarioApplication`, before `/2/feedback/messages/0/targetId`; after `/2/feedback/messages/0/targetId`, before `/2/feedback/messages/0/text`; after `/2/feedback/messages/0/text`, before `/2/feedback/messages/1/text`; after `/2/feedback/messages/1/text`, before `/2/feedback/messages/2/text`; after `/2/feedback/messages/2/text`, before `/2/feedback/reason`; after `/2/feedback/reason`, before `/2/interaction/options/0/text`; after `/2/interaction/options/0/text`, before `/2/interaction/options/1/optionId`; after `/2/interaction/options/1/optionId`, before `/2/interaction/options/1/text`; after `/2/interaction/options/1/text`, before `/2/interaction/options/2/text`; after `/2/interaction/options/2/text`, before `/2/interaction/options/3/text`; after `/2/interaction/options/3/text`, before `/2/prompt`; after `/2/prompt`.
- Before prompt: A broker workload needs high availability across Availability Zones but must preserve traditional broker clients. Which deployment should be evaluated?
- After prompt: An Amazon MQ for ActiveMQ workload must remain available during an Availability Zone failure while preserving its broker protocol. Which deployment should the architect evaluate?
- Answer: `A` → `A`.
- After semantic QA: **PASS** (Luna High, 2026-10-11).
- Option identity change: retired `B`; introduced `single_instance_backup_not_standby`.
- Current official AWS references: [https://docs.aws.amazon.com/amazon-mq/latest/developer-guide/amazon-mq-broker-architecture.html](https://docs.aws.amazon.com/amazon-mq/latest/developer-guide/amazon-mq-broker-architecture.html).

### `aws-saa-c03-AWSSAA-N07-B05-004`

- Source: `content/aws-certified-solutions-architect-associate/api_messaging_event_and_workflow_decoupling/amazon_mq_protocol_preserving_integration.json`; question index is 0-based; changed pointers are relative to each question: before `/3/constraints/0`; after `/3/constraints/0`, before `/3/constraints/1`; after `/3/constraints/1`, before `/3/constraints/2`; after `/3/constraints/2`, before `/3/feedback/details/errorCorrection`; after `/3/feedback/details/errorCorrection`, before `/3/feedback/details/mechanismOrProperty`; after `/3/feedback/details/mechanismOrProperty`, before `/3/feedback/details/scenarioApplication`; after `/3/feedback/details/scenarioApplication`, before `/3/feedback/messages/0/text`; after `/3/feedback/messages/0/text`, before `/3/feedback/messages/1/targetId`; after `/3/feedback/messages/1/targetId`, before `/3/feedback/messages/1/text`; after `/3/feedback/messages/1/text`, before `/3/feedback/messages/2/targetId`; after `/3/feedback/messages/2/targetId`, before `/3/feedback/messages/2/text`; after `/3/feedback/messages/2/text`, before `/3/feedback/reason`; after `/3/feedback/reason`, before `/3/interaction/options/0/text`; after `/3/interaction/options/0/text`, before `/3/interaction/options/1/text`; after `/3/interaction/options/1/text`, before `/3/interaction/options/2/optionId`; after `/3/interaction/options/2/optionId`, before `/3/interaction/options/2/text`; after `/3/interaction/options/2/text`, before `/3/interaction/options/3/optionId`; after `/3/interaction/options/3/optionId`, before `/3/interaction/options/3/text`; after `/3/interaction/options/3/text`, before `/3/prompt`; after `/3/prompt`.
- Before prompt: Applications in private subnets must connect to an Amazon MQ broker without internet exposure. Which network design should be configured?
- After prompt: An application in a private VPC subnet must connect to a private Amazon MQ broker. The path must deny unapproved security groups, and broker authentication must still protect the messaging session. Which design meets both boundaries?
- Answer: `A` → `A`.
- After semantic QA: **PASS** (Luna High, 2026-10-11).
- Option identity change: retired `C`, `D`; introduced `port_access_is_auth`, `tls_without_broker_auth`.
- Current official AWS references: [https://docs.aws.amazon.com/amazon-mq/latest/developer-guide/amazon-mq-broker-vpc.html](https://docs.aws.amazon.com/amazon-mq/latest/developer-guide/amazon-mq-broker-vpc.html).

### `aws-saa-c03-AWSSAA-N07-B05-005` → `aws-saa-c03-AWSSAA-N07-B05-005-saa20261011`

- Source: `content/aws-certified-solutions-architect-associate/api_messaging_event_and_workflow_decoupling/amazon_mq_protocol_preserving_integration.json`; question index is 0-based; changed pointers are relative to each question: before `/4/constraints/0`; after `/4/constraints/0`, before `/4/constraints/1`; after `/4/constraints/1`, before `/4/constraints/2`; after `/4/constraints/2`, before `/4/feedback/details/errorCorrection`; after `/4/feedback/details/errorCorrection`, before `/4/feedback/details/mechanismOrProperty`; after `/4/feedback/details/mechanismOrProperty`, before `/4/feedback/details/scenarioApplication`; after `/4/feedback/details/scenarioApplication`, before `/4/feedback/messages/0/targetId`; after `/4/feedback/messages/0/targetId`, before `/4/feedback/messages/0/text`; after `/4/feedback/messages/0/text`, before `/4/feedback/messages/1/targetId`; after `/4/feedback/messages/1/targetId`, before `/4/feedback/messages/1/text`; after `/4/feedback/messages/1/text`, before `/4/feedback/messages/2/targetId`; after `/4/feedback/messages/2/targetId`, before `/4/feedback/messages/2/text`; after `/4/feedback/messages/2/text`, before `/4/feedback/reason`; after `/4/feedback/reason`, before `/4/interaction/options/0/text`; after `/4/interaction/options/0/text`, before `/4/interaction/options/1/optionId`; after `/4/interaction/options/1/optionId`, before `/4/interaction/options/1/text`; after `/4/interaction/options/1/text`, before `/4/interaction/options/2/optionId`; after `/4/interaction/options/2/optionId`, before `/4/interaction/options/2/text`; after `/4/interaction/options/2/text`, before `/4/interaction/options/3/optionId`; after `/4/interaction/options/3/optionId`, before `/4/interaction/options/3/text`; after `/4/interaction/options/3/text`, before `/4/prompt`; after `/4/prompt`, before `/4/questionId`; after `/4/questionId`, before `/4/sourceRefs (length)`; after `/4/sourceRefs (length)`, before `/4/sourceRefs/0`; after `/4/sourceRefs/0`.
- Before prompt: A legacy broker must move to AWS with minimal producer and consumer code changes, but the team still wants managed broker patching and monitoring. What should guide the design?
- After prompt: A team is moving a legacy broker workload to Amazon MQ during a fixed cutover window. Some messages are in flight and producer acknowledgements may be ambiguous. Which cutover plan best limits loss and duplicate processing?
- Answer: `A` → `A`.
- After semantic QA: **PASS** (Luna High, 2026-10-11).
- Option identity change: retired `B`, `C`, `D`; introduced `cutover_without_rollback_checkpoint`, `dual_write_without_deduplication`, `switch_before_inflight_settles`.
- Current official AWS references: [https://docs.aws.amazon.com/amazon-mq/latest/developer-guide/working-with-activemq.html](https://docs.aws.amazon.com/amazon-mq/latest/developer-guide/working-with-activemq.html), [https://docs.aws.amazon.com/amazon-mq/latest/developer-guide/amazon-mq-broker-architecture.html](https://docs.aws.amazon.com/amazon-mq/latest/developer-guide/amazon-mq-broker-architecture.html).

### `aws-saa-c03-AWSSAA-N07-B05-006`

- Source: `content/aws-certified-solutions-architect-associate/api_messaging_event_and_workflow_decoupling/amazon_mq_protocol_preserving_integration.json`; question index is 0-based; changed pointers are relative to each question: before `/5/constraints/0`; after `/5/constraints/0`, before `/5/constraints/1`; after `/5/constraints/1`, before `/5/constraints/2`; after `/5/constraints/2`, before `/5/feedback/details/errorCorrection`; after `/5/feedback/details/errorCorrection`, before `/5/feedback/details/mechanismOrProperty`; after `/5/feedback/details/mechanismOrProperty`, before `/5/feedback/details/scenarioApplication`; after `/5/feedback/details/scenarioApplication`, before `/5/feedback/details/url`; after `/5/feedback/details/url`, before `/5/feedback/messages/0/targetId`; after `/5/feedback/messages/0/targetId`, before `/5/feedback/messages/0/text`; after `/5/feedback/messages/0/text`, before `/5/feedback/messages/1/text`; after `/5/feedback/messages/1/text`, before `/5/feedback/messages/2/targetId`; after `/5/feedback/messages/2/targetId`, before `/5/feedback/messages/2/text`; after `/5/feedback/messages/2/text`, before `/5/feedback/reason`; after `/5/feedback/reason`, before `/5/interaction/options/0/text`; after `/5/interaction/options/0/text`, before `/5/interaction/options/1/optionId`; after `/5/interaction/options/1/optionId`, before `/5/interaction/options/1/text`; after `/5/interaction/options/1/text`, before `/5/interaction/options/2/text`; after `/5/interaction/options/2/text`, before `/5/interaction/options/3/optionId`; after `/5/interaction/options/3/optionId`, before `/5/interaction/options/3/text`; after `/5/interaction/options/3/text`, before `/5/prompt`; after `/5/prompt`, before `/5/sourceRefs/0`; after `/5/sourceRefs/0`.
- Before prompt: A Java application uses JMS connection factories, durable subscriptions, and transactions. Which question must be answered before selecting Amazon MQ?
- After prompt: A Java JMS application requires durable topic subscriptions and XA rollback across its database and broker. Amazon MQ for RabbitMQ 4 is a candidate. Which compatibility check is decisive?
- Answer: `A` → `A`.
- After semantic QA: **PASS** (Luna High, 2026-10-11).
- Option identity change: retired `B`, `D`; introduced `local_jms_transaction_is_xa`, `rabbitmq4_full_jms_xa`.
- Current official AWS references: [https://docs.aws.amazon.com/amazon-mq/latest/developer-guide/rabbitmq-jms-support.html](https://docs.aws.amazon.com/amazon-mq/latest/developer-guide/rabbitmq-jms-support.html).

### `aws-saa-c03-AWSSAA-N07-B06-012`

- Source: `content/aws-certified-solutions-architect-associate/api_messaging_event_and_workflow_decoupling/step_functions_orchestration_and_workflow_state.json`; question index is 0-based; changed pointers are relative to each question: before `/11/feedback/details/mechanismOrProperty`; after `/11/feedback/details/mechanismOrProperty`, before `/11/feedback/details/scenarioApplication`; after `/11/feedback/details/scenarioApplication`, before `/11/feedback/details/url`; after `/11/feedback/details/url`, before `/11/feedback/reason`; after `/11/feedback/reason`, before `/11/interaction/options/0/text`; after `/11/interaction/options/0/text`, before `/11/prompt`; after `/11/prompt`, before `/11/sourceRefs/0`; after `/11/sourceRefs/0`.
- Before prompt: An operations team needs to determine which task failed, what input it received, and whether a retry or catch path ran. Which evidence should be the primary starting point?
- After prompt: An AWS Step Functions Standard workflow execution must be investigated to find a failed task, its input, and any retry or catch transitions. What evidence should the operator inspect first?
- Answer: `A` → `A`.
- After semantic QA: **PASS** (Luna High, 2026-10-11).
- Option IDs preserved; option wording updated for the same answer meaning.
- Current official AWS references: [https://docs.aws.amazon.com/step-functions/latest/dg/cw-logs.html](https://docs.aws.amazon.com/step-functions/latest/dg/cw-logs.html).

### `aws-saa-c03-AWSSAA-N07-B07-006`

- Source: `content/aws-certified-solutions-architect-associate/api_messaging_event_and_workflow_decoupling/retry_buffering_throttling_and_async_failure_isolation.json`; question index is 0-based; changed pointers are relative to each question: before `/5/feedback/details/mechanismOrProperty`; after `/5/feedback/details/mechanismOrProperty`, before `/5/feedback/details/scenarioApplication`; after `/5/feedback/details/scenarioApplication`, before `/5/feedback/details/url`; after `/5/feedback/details/url`, before `/5/feedback/reason`; after `/5/feedback/reason`, before `/5/interaction/options/0/text`; after `/5/interaction/options/0/text`, before `/5/prompt`; after `/5/prompt`, before `/5/sourceRefs (length)`; after `/5/sourceRefs (length)`, before `/5/sourceRefs/0`; after `/5/sourceRefs/0`.
- Before prompt: A Lambda function is invoked asynchronously by an event source. The function sometimes fails, and the team needs bounded retries plus a durable record of discarded events. Which design should be evaluated?
- After prompt: An Amazon SNS topic successfully invokes an AWS Lambda function asynchronously. The function later fails while processing the accepted event. The team needs bounded Lambda retries and a durable record of events discarded after retries. Which configuration applies to this invocation path?
- Answer: `A` → `A`.
- After semantic QA: **PASS** (Luna High, 2026-10-11).
- Option IDs preserved; option wording updated for the same answer meaning.
- Current official AWS references: [https://docs.aws.amazon.com/lambda/latest/dg/invocation-async-configuring.html](https://docs.aws.amazon.com/lambda/latest/dg/invocation-async-configuring.html), [https://docs.aws.amazon.com/lambda/latest/dg/services-sqs-errorhandling.html](https://docs.aws.amazon.com/lambda/latest/dg/services-sqs-errorhandling.html).

## Verification

- AWS track validation: PASS (2,604 questions).
- AWS canonical answer tests: PASS (2,604 answers).
- AWS single-track build: PASS; output generated in `/private/tmp/saa-producer-build` (artifact SHA-256 `350dc44eed14c7087bfdd79196d84d5ca16c606b449536f8c35078b4116a6fc6`).
- Migration verifier: PASS; reconstructs historical AWS at 2,568 questions and admits the existing 36-question ODK-096 addition set against unchanged approval evidence.
- Targeted proof/scoring/build tests: PASS, including rejection of arbitrary current-source drift and edited proof bytes.
- Official AWS documentation was checked on 2026-10-11; each current source reference is recorded per item above.
