# microsoft-azure-ai-fundamentals-ai-901 / agents_multimodal_and_extraction_implementation / agent_use_case_tools_boundary

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 6
- Authoring-admitted slots: 6
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-ai-fundamentals-ai-901/agents_multimodal_and_extraction_implementation/agent_use_case_tools_boundary.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-ai-fundamentals-ai-901:agent_use_case_tools_boundary:classify_agent_use_case_tools_boundary_evidence:slot:autonomy-overclaim

- Status: authoring-admitted
- Objective: Diagnose autonomy overclaim evidence for the owned decision: classify whether the evidence supports an agent tool action or a direct model completion
- Expected decision: Resolve the autonomy overclaim distinction without substituting a neighbouring workload or control.
- Decisive boundary: autonomy overclaim is owned here only when side-effect requirement, external tool necessity, autonomy overclaim satisfy the documented product mechanism and the target boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:agent_use_case_tools_boundary:classify_agent_use_case_tools_boundary_evidence:slot:direct-completion-sufficient

- Status: authoring-admitted
- Objective: Diagnose direct completion sufficient evidence for the owned decision: classify whether the evidence supports an agent tool action or a direct model completion
- Expected decision: Resolve the direct completion sufficient distinction without substituting a neighbouring workload or control.
- Decisive boundary: direct completion sufficient is owned here only when thread-state persistence, side-effect requirement, direct completion sufficient satisfy the documented product mechanism and the target boundary.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:agent_use_case_tools_boundary:classify_agent_use_case_tools_boundary_evidence:slot:external-data-access

- Status: authoring-admitted
- Objective: Diagnose external data access evidence for the owned decision: classify whether the evidence supports an agent tool action or a direct model completion
- Expected decision: Resolve the external data access distinction without substituting a neighbouring workload or control.
- Decisive boundary: external data access is owned here only when task step count, agent autonomy level, external data access satisfy the documented product mechanism and the target boundary.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:agent_use_case_tools_boundary:classify_agent_use_case_tools_boundary_evidence:slot:multi-step-orchestration

- Status: authoring-admitted
- Objective: Diagnose multi step orchestration evidence for the owned decision: classify whether the evidence supports an agent tool action or a direct model completion
- Expected decision: Resolve the multi step orchestration distinction without substituting a neighbouring workload or control.
- Decisive boundary: multi step orchestration is owned here only when agent autonomy level, thread-state persistence, multi step orchestration satisfy the documented product mechanism and the target boundary.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:agent_use_case_tools_boundary:classify_agent_use_case_tools_boundary_evidence:slot:requirement-change-transfer

- Status: authoring-admitted
- Objective: Diagnose requirement change transfer evidence for the owned decision: classify whether the evidence supports an agent tool action or a direct model completion
- Expected decision: Resolve the requirement change transfer distinction without substituting a neighbouring workload or control.
- Decisive boundary: requirement change transfer is owned here only when external tool necessity, task step count, requirement change transfer satisfy the documented product mechanism and the target boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:agent_use_case_tools_boundary:classify_agent_use_case_tools_boundary_evidence:slot:tool-action-required

- Status: authoring-admitted
- Objective: Diagnose tool action required evidence for the owned decision: classify whether the evidence supports an agent tool action or a direct model completion
- Expected decision: Resolve the tool action required distinction without substituting a neighbouring workload or control.
- Decisive boundary: tool action required is owned here only when external tool necessity, task step count, tool action required satisfy the documented product mechanism and the target boundary.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
