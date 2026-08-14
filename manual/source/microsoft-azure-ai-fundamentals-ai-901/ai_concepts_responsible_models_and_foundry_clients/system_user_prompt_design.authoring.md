# microsoft-azure-ai-fundamentals-ai-901 / ai_concepts_responsible_models_and_foundry_clients / system_user_prompt_design

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 5
- Authoring-admitted slots: 5
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-ai-fundamentals-ai-901/ai_concepts_responsible_models_and_foundry_clients/system_user_prompt_design.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-ai-fundamentals-ai-901:system_user_prompt_design:classify_system_user_prompt_design_evidence:slot:instruction-conflict-diagnosis

- Status: authoring-admitted
- Objective: Diagnose inconsistent behavior caused by conflicting or ambiguous instruction layers.
- Expected decision: Locate the authority or clarity conflict before changing model deployment settings.
- Decisive boundary: The diagnosis requires evidence that instruction layers disagree or omit a governing rule.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:system_user_prompt_design:classify_system_user_prompt_design_evidence:slot:persistence-transfer

- Status: authoring-admitted
- Objective: Re-evaluate message placement when a request-specific instruction becomes an application-wide rule.
- Expected decision: Move enduring behavioral guidance to the system layer while leaving current-task data in user content.
- Decisive boundary: The transfer depends on changed persistence, not a wording preference.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:system_user_prompt_design:classify_system_user_prompt_design_evidence:slot:persistent-instruction-classification

- Status: authoring-admitted
- Objective: Classify persistent role, scope, tone, and output policy as system-level instruction.
- Expected decision: Place enduring behavioral guidance in the system message layer.
- Decisive boundary: System-level placement is justified by cross-request behavioral authority, not by sentence length.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:system_user_prompt_design:classify_system_user_prompt_design_evidence:slot:request-context-classification

- Status: authoring-admitted
- Objective: Classify the current task, data, examples, and request-specific constraints as user content.
- Expected decision: Keep transient task context in the user message layer.
- Decisive boundary: Request-specific context must not silently govern unrelated later requests.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:system_user_prompt_design:classify_system_user_prompt_design_evidence:slot:system-message-safety-boundary

- Status: authoring-admitted
- Objective: Test the boundary between behavioral safety instructions and platform safety controls.
- Expected decision: Treat system messages as one safety layer rather than a complete enforcement mechanism.
- Decisive boundary: System messages can be bypassed or degraded and therefore do not establish the whole safety stack.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
