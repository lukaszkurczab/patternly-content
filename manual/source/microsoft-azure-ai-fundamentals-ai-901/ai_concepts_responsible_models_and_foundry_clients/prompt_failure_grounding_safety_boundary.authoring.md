# microsoft-azure-ai-fundamentals-ai-901 / ai_concepts_responsible_models_and_foundry_clients / prompt_failure_grounding_safety_boundary

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 13
- Authoring-admitted slots: 13
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-ai-fundamentals-ai-901/ai_concepts_responsible_models_and_foundry_clients/prompt_failure_grounding_safety_boundary.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-ai-fundamentals-ai-901:prompt_failure_grounding_safety_boundary:grounding_and_retrieval_failure:slot:groundedness-output-diagnosis

- Status: authoring-admitted
- Objective: Diagnose a response that contradicts the supplied grounding source.
- Expected decision: Identify output ungroundedness after relevant source evidence reaches the model.
- Decisive boundary: This diagnosis requires a material mismatch between supplied evidence and generated output.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:prompt_failure_grounding_safety_boundary:grounding_and_retrieval_failure:slot:irrelevant-source-diagnosis

- Status: authoring-admitted
- Objective: Diagnose unsupported output when retrieved material is present but irrelevant to the requested fact.
- Expected decision: Correct retrieval relevance rather than merely adding more prompt instructions.
- Decisive boundary: The supplied material must directly support the output claim.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:prompt_failure_grounding_safety_boundary:grounding_and_retrieval_failure:slot:missing-source-diagnosis

- Status: authoring-admitted
- Objective: Diagnose unsupported output caused by absent grounding material for private or post-cutoff facts.
- Expected decision: Supply relevant source evidence when the model cannot lawfully derive the requested fact from available context.
- Decisive boundary: Grounding owns the defect only when required source material is absent.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:prompt_failure_grounding_safety_boundary:grounding_and_retrieval_failure:slot:rag-need-boundary

- Status: authoring-admitted
- Objective: Test when private or newly introduced data requires grounding rather than prompt-only model knowledge.
- Expected decision: Require grounding for facts outside dependable model knowledge and supplied context.
- Decisive boundary: Prompt wording cannot substitute for unavailable evidence.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:prompt_failure_grounding_safety_boundary:prompt_instruction_failure:slot:instruction-authority-diagnosis

- Status: authoring-admitted
- Objective: Diagnose conflicting persistent and request-specific instructions.
- Expected decision: Resolve the instruction-layer conflict before modifying model controls.
- Decisive boundary: The failure belongs here only when the instruction layers materially disagree.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:prompt_failure_grounding_safety_boundary:prompt_instruction_failure:slot:model-capability-boundary

- Status: authoring-admitted
- Objective: Distinguish a prompt defect from a model capability or deployment mismatch.
- Expected decision: Stop prompt revision when documented model capability or deployment configuration owns the limit.
- Decisive boundary: Prompt ownership ends when the requested behavior is unsupported by the selected model or deployment.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:prompt_failure_grounding_safety_boundary:prompt_instruction_failure:slot:output-contract-diagnosis

- Status: authoring-admitted
- Objective: Diagnose an unusable response caused by a missing format, audience, or scope constraint.
- Expected decision: Add the missing output contract without changing retrieval or deployment.
- Decisive boundary: The required structure must be absent or ambiguous in the instructions for this diagnosis to own the defect.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:prompt_failure_grounding_safety_boundary:prompt_instruction_failure:slot:request-policy-transfer

- Status: authoring-admitted
- Objective: Re-evaluate instruction placement when a one-request constraint becomes persistent application policy.
- Expected decision: Move persistent behavioral constraints to the system layer while retaining task data in the request.
- Decisive boundary: The transfer depends on changed lifetime and authority, not on paraphrase.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:prompt_failure_grounding_safety_boundary:prompt_instruction_failure:slot:task-clarity-diagnosis

- Status: authoring-admitted
- Objective: Diagnose output failure caused by an absent or ambiguous task instruction.
- Expected decision: Revise task clarity only when the model lacks a determinate requested action.
- Decisive boundary: Instruction failure requires missing or conflicting task evidence rather than absent external facts.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:prompt_failure_grounding_safety_boundary:safety_filter_boundary:slot:filter-refusal-diagnosis

- Status: authoring-admitted
- Objective: Diagnose a refusal owned by filter category and threshold evidence.
- Expected decision: Change the appropriate approved filter configuration or content path only after filter evidence owns the refusal.
- Decisive boundary: A filter-owned diagnosis requires an annotation or blocking result, not refusal wording alone.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:prompt_failure_grounding_safety_boundary:safety_filter_boundary:slot:filter-versus-system-message

- Status: authoring-admitted
- Objective: Distinguish platform content filtering from behavioral safety instructions.
- Expected decision: Use filter evidence to identify platform enforcement and system-message evidence to identify behavioral guidance.
- Decisive boundary: System messages complement but do not replace content filters.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:prompt_failure_grounding_safety_boundary:safety_filter_boundary:slot:groundedness-harm-filter-boundary

- Status: authoring-admitted
- Objective: Distinguish groundedness detection from harmful-content category filtering.
- Expected decision: Select the safety or quality control corresponding to the observed classifier evidence.
- Decisive boundary: Groundedness and harm classification test different properties and have different evidence.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:prompt_failure_grounding_safety_boundary:safety_filter_boundary:slot:input-output-filter-classification

- Status: authoring-admitted
- Objective: Classify content filtering evidence as input-prompt or output-completion filtering.
- Expected decision: Locate whether the input or generated output triggered the safety layer.
- Decisive boundary: Filter-stage evidence determines the relevant configuration surface.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
