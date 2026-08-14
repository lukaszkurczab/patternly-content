# microsoft-azure-ai-fundamentals-ai-901 / agents_multimodal_and_extraction_implementation / speech_tool_application

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 7
- Authoring-admitted slots: 7
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-ai-fundamentals-ai-901/agents_multimodal_and_extraction_implementation/speech_tool_application.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-ai-fundamentals-ai-901:speech_tool_application:classify_speech_tool_application_evidence:slot:batch-vs-realtime

- Status: authoring-admitted
- Objective: Diagnose batch vs realtime evidence for the owned decision: classify whether the evidence supports a speech recognition, synthesis, or translation operation or a chat-response generation operation
- Expected decision: Resolve the batch vs realtime distinction without substituting a neighbouring workload or control.
- Decisive boundary: batch vs realtime is owned here only when speaker diarization need, output contract, batch vs realtime satisfy the documented product mechanism and the target boundary.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:speech_tool_application:classify_speech_tool_application_evidence:slot:chat-generation-boundary

- Status: authoring-admitted
- Objective: Diagnose chat generation boundary evidence for the owned decision: classify whether the evidence supports a speech recognition, synthesis, or translation operation or a chat-response generation operation
- Expected decision: Resolve the chat generation boundary distinction without substituting a neighbouring workload or control.
- Decisive boundary: chat generation boundary is owned here only when audio input-versus-output direction, file-versus-real-time stream, chat generation boundary satisfy the documented product mechanism and the target boundary.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:speech_tool_application:classify_speech_tool_application_evidence:slot:operation-change-transfer

- Status: authoring-admitted
- Objective: Diagnose operation change transfer evidence for the owned decision: classify whether the evidence supports a speech recognition, synthesis, or translation operation or a chat-response generation operation
- Expected decision: Resolve the operation change transfer distinction without substituting a neighbouring workload or control.
- Decisive boundary: operation change transfer is owned here only when file-versus-real-time stream, source and target language, operation change transfer satisfy the documented product mechanism and the target boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:speech_tool_application:classify_speech_tool_application_evidence:slot:speaker-diarization

- Status: authoring-admitted
- Objective: Diagnose speaker diarization evidence for the owned decision: classify whether the evidence supports a speech recognition, synthesis, or translation operation or a chat-response generation operation
- Expected decision: Resolve the speaker diarization distinction without substituting a neighbouring workload or control.
- Decisive boundary: speaker diarization is owned here only when output contract, audio input-versus-output direction, speaker diarization satisfy the documented product mechanism and the target boundary.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:speech_tool_application:classify_speech_tool_application_evidence:slot:speech-to-text

- Status: authoring-admitted
- Objective: Diagnose speech to text evidence for the owned decision: classify whether the evidence supports a speech recognition, synthesis, or translation operation or a chat-response generation operation
- Expected decision: Resolve the speech to text distinction without substituting a neighbouring workload or control.
- Decisive boundary: speech to text is owned here only when audio input-versus-output direction, file-versus-real-time stream, speech to text satisfy the documented product mechanism and the target boundary.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:speech_tool_application:classify_speech_tool_application_evidence:slot:speech-translation

- Status: authoring-admitted
- Objective: Diagnose speech translation evidence for the owned decision: classify whether the evidence supports a speech recognition, synthesis, or translation operation or a chat-response generation operation
- Expected decision: Resolve the speech translation distinction without substituting a neighbouring workload or control.
- Decisive boundary: speech translation is owned here only when source and target language, speaker diarization need, speech translation satisfy the documented product mechanism and the target boundary.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:speech_tool_application:classify_speech_tool_application_evidence:slot:text-to-speech

- Status: authoring-admitted
- Objective: Diagnose text to speech evidence for the owned decision: classify whether the evidence supports a speech recognition, synthesis, or translation operation or a chat-response generation operation
- Expected decision: Resolve the text to speech distinction without substituting a neighbouring workload or control.
- Decisive boundary: text to speech is owned here only when file-versus-real-time stream, source and target language, text to speech satisfy the documented product mechanism and the target boundary.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
