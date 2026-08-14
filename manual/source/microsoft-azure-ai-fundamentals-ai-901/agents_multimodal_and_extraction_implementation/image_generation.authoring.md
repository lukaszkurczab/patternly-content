# microsoft-azure-ai-fundamentals-ai-901 / agents_multimodal_and_extraction_implementation / image_generation

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 6
- Authoring-admitted slots: 6
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-ai-fundamentals-ai-901/agents_multimodal_and_extraction_implementation/image_generation.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-ai-fundamentals-ai-901:image_generation:classify_image_generation_evidence:slot:content-filter

- Status: authoring-admitted
- Objective: Diagnose content filter evidence for the owned decision: classify whether the evidence supports image creation from a prompt or vision analysis of an existing image
- Expected decision: Resolve the content filter distinction without substituting a neighbouring workload or control.
- Decisive boundary: content filter is owned here only when safety-filter result, existing-image-versus-new-image objective, content filter satisfy the documented product mechanism and the target boundary.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:image_generation:classify_image_generation_evidence:slot:image-analysis-boundary

- Status: authoring-admitted
- Objective: Diagnose image analysis boundary evidence for the owned decision: classify whether the evidence supports image creation from a prompt or vision analysis of an existing image
- Expected decision: Resolve the image analysis boundary distinction without substituting a neighbouring workload or control.
- Decisive boundary: image analysis boundary is owned here only when text prompt composition, image size and style, image analysis boundary satisfy the documented product mechanism and the target boundary.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:image_generation:classify_image_generation_evidence:slot:model-deployment

- Status: authoring-admitted
- Objective: Diagnose model deployment evidence for the owned decision: classify whether the evidence supports image creation from a prompt or vision analysis of an existing image
- Expected decision: Resolve the model deployment distinction without substituting a neighbouring workload or control.
- Decisive boundary: model deployment is owned here only when image size and style, generation parameters, model deployment satisfy the documented product mechanism and the target boundary.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:image_generation:classify_image_generation_evidence:slot:new-vs-existing-image-transfer

- Status: authoring-admitted
- Objective: Diagnose new vs existing image transfer evidence for the owned decision: classify whether the evidence supports image creation from a prompt or vision analysis of an existing image
- Expected decision: Resolve the new vs existing image transfer distinction without substituting a neighbouring workload or control.
- Decisive boundary: new vs existing image transfer is owned here only when existing-image-versus-new-image objective, text prompt composition, new vs existing image transfer satisfy the documented product mechanism and the target boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:image_generation:classify_image_generation_evidence:slot:size-quality-format

- Status: authoring-admitted
- Objective: Diagnose size quality format evidence for the owned decision: classify whether the evidence supports image creation from a prompt or vision analysis of an existing image
- Expected decision: Resolve the size quality format distinction without substituting a neighbouring workload or control.
- Decisive boundary: size quality format is owned here only when generation parameters, safety-filter result, size quality format satisfy the documented product mechanism and the target boundary.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:image_generation:classify_image_generation_evidence:slot:text-to-image

- Status: authoring-admitted
- Objective: Diagnose text to image evidence for the owned decision: classify whether the evidence supports image creation from a prompt or vision analysis of an existing image
- Expected decision: Resolve the text to image distinction without substituting a neighbouring workload or control.
- Decisive boundary: text to image is owned here only when existing-image-versus-new-image objective, text prompt composition, text to image satisfy the documented product mechanism and the target boundary.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
