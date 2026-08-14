# microsoft-azure-ai-fundamentals-ai-901 / ai_concepts_responsible_models_and_foundry_clients / model_deploy_and_portal_interaction

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 8
- Authoring-admitted slots: 8
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-ai-fundamentals-ai-901/ai_concepts_responsible_models_and_foundry_clients/model_deploy_and_portal_interaction.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-ai-fundamentals-ai-901:model_deploy_and_portal_interaction:deploy_and_test_model_in_foundry_portal:slot:deployment-capability-recognition

- Status: authoring-admitted
- Objective: Recognize that a model deployment exposes a named inference target for portal and code use.
- Expected decision: Identify a successful deployment as the prerequisite inference target.
- Decisive boundary: Interaction requires a deployed model whose status and region prerequisites are satisfied.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:model_deploy_and_portal_interaction:deploy_and_test_model_in_foundry_portal:slot:playground-readiness-boundary

- Status: authoring-admitted
- Objective: Distinguish successful playground interaction from production-client readiness.
- Expected decision: Use playground success as model-deployment evidence, not proof of production integration.
- Decisive boundary: Production readiness additionally requires a supported endpoint, authentication, and client lifecycle.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:model_deploy_and_portal_interaction:deploy_and_test_model_in_foundry_portal:slot:portal-deploy-test-workflow

- Status: authoring-admitted
- Objective: Order model selection, deployment configuration, successful provisioning, and playground verification.
- Expected decision: Test only after the selected model has a successful deployment.
- Decisive boundary: Playground interaction depends on a live deployment and its documented route.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:model_deploy_and_portal_interaction:deploy_and_test_model_in_foundry_portal:slot:region-quota-deployment-diagnosis

- Status: authoring-admitted
- Objective: Diagnose a failed deployment from region support, quota, or provisioning state.
- Expected decision: Separate deployment prerequisites from playground or prompt behavior.
- Decisive boundary: The deployment must reach a successful state before inference behavior can be evaluated.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:model_deploy_and_portal_interaction:separate_portal_playground_test_from_production_client_configuration:slot:code-tab-capability

- Status: authoring-admitted
- Objective: Recognize deployment endpoint and code guidance as the bridge from portal test to programmatic use.
- Expected decision: Extract the programmatic routing contract without assuming portal session state transfers.
- Decisive boundary: Programmatic use requires the documented endpoint and deployment routing information.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:model_deploy_and_portal_interaction:separate_portal_playground_test_from_production_client_configuration:slot:playground-success-client-failure

- Status: authoring-admitted
- Objective: Diagnose a client failure after successful playground inference from endpoint, deployment, or credential evidence.
- Expected decision: Localize the defect to client integration rather than the deployed model's basic availability.
- Decisive boundary: Playground success narrows but does not eliminate routing and authorization failures in code.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:model_deploy_and_portal_interaction:separate_portal_playground_test_from_production_client_configuration:slot:portal-client-surface-classification

- Status: authoring-admitted
- Objective: Classify playground controls and application client configuration as different interaction surfaces.
- Expected decision: Assign rapid model experimentation to the playground and integration behavior to code configuration.
- Decisive boundary: A client must explicitly carry its endpoint, deployment, authentication, and request configuration.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:model_deploy_and_portal_interaction:separate_portal_playground_test_from_production_client_configuration:slot:prototype-production-transfer

- Status: authoring-admitted
- Objective: Re-evaluate required controls when work moves from portal prototype to a deployed application.
- Expected decision: Add explicit client endpoint, authentication, request, and response handling for the application surface.
- Decisive boundary: The changed surface adds integration obligations without invalidating the earlier portal test.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
