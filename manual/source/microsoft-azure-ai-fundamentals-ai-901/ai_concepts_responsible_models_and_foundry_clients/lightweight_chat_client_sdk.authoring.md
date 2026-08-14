# microsoft-azure-ai-fundamentals-ai-901 / ai_concepts_responsible_models_and_foundry_clients / lightweight_chat_client_sdk

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 9
- Authoring-admitted slots: 9
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-ai-fundamentals-ai-901/ai_concepts_responsible_models_and_foundry_clients/lightweight_chat_client_sdk.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-ai-fundamentals-ai-901:lightweight_chat_client_sdk:send_chat_request_with_foundry_sdk_and_handle_response:slot:deployment-routing-diagnosis

- Status: authoring-admitted
- Objective: Diagnose a valid client that targets an absent or wrong model deployment.
- Expected decision: Correct deployment routing without changing authentication or prompt structure.
- Decisive boundary: The model parameter must identify an available deployment on the reached resource.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:lightweight_chat_client_sdk:send_chat_request_with_foundry_sdk_and_handle_response:slot:endpoint-form-diagnosis

- Status: authoring-admitted
- Objective: Diagnose a request failure from confusion among project, services, and OpenAI endpoint forms.
- Expected decision: Align the endpoint with the selected SDK and API surface.
- Decisive boundary: Each SDK or API path requires its documented endpoint form.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:lightweight_chat_client_sdk:send_chat_request_with_foundry_sdk_and_handle_response:slot:model-call-workflow

- Status: authoring-admitted
- Objective: Order credential acquisition, project client creation, model client access, request, and response inspection.
- Expected decision: Establish client and routing before invoking and handling the model response.
- Decisive boundary: The call requires a valid client, deployment routing, request input, and explicit response handling.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:lightweight_chat_client_sdk:send_chat_request_with_foundry_sdk_and_handle_response:slot:sdk-client-capability

- Status: authoring-admitted
- Objective: Recognize the Foundry project client and project endpoint as the SDK access path for Foundry project APIs.
- Expected decision: Match Foundry-specific project access to the Foundry SDK path.
- Decisive boundary: The SDK client is constructed from endpoint and credential before any model input is sent.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:lightweight_chat_client_sdk:send_chat_request_with_foundry_sdk_and_handle_response:slot:sdk-selection-transfer

- Status: authoring-admitted
- Objective: Re-evaluate SDK choice when the application changes from Foundry-specific project APIs to lowest-latency direct model inference.
- Expected decision: Use Foundry SDK for Foundry project features or the documented OpenAI SDK path for direct model needs.
- Decisive boundary: SDK choice follows the required API surface and supported use, not provider branding alone.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:lightweight_chat_client_sdk:separate_client_authentication_from_model_prompt_parameters:slot:credential-input-separation

- Status: authoring-admitted
- Objective: Classify credentials and endpoint routing separately from model input and generation parameters.
- Expected decision: Keep identity and routing in the client transport configuration.
- Decisive boundary: Authentication material is evaluated before model instructions and must not enter the prompt payload.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:lightweight_chat_client_sdk:separate_client_authentication_from_model_prompt_parameters:slot:data-plane-authorization-diagnosis

- Status: authoring-admitted
- Objective: Diagnose authenticated requests that lack the data-plane role required for inference.
- Expected decision: Separate successful identity proof from missing inference authorization.
- Decisive boundary: Authentication does not imply the required data-plane permission.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:lightweight_chat_client_sdk:separate_client_authentication_from_model_prompt_parameters:slot:entra-key-selection

- Status: authoring-admitted
- Objective: Select Microsoft Entra ID for production identity and least privilege or API key for constrained rapid evaluation.
- Expected decision: Match authentication method to production governance and operational context.
- Decisive boundary: Production guidance favors Entra ID for conditional access, managed identity, and granular RBAC.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:lightweight_chat_client_sdk:separate_client_authentication_from_model_prompt_parameters:slot:routing-auth-boundary

- Status: authoring-admitted
- Objective: Distinguish endpoint and deployment routing errors from credential or RBAC failures.
- Expected decision: Assign the defect to routing or authorization from direct transport evidence.
- Decisive boundary: Prompt content is not evaluated until routing and authorization succeed.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
