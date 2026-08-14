# microsoft-azure-ai-fundamentals-ai-901 / agents_multimodal_and_extraction_implementation / image_extraction

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 6
- Authoring-admitted slots: 6
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-ai-fundamentals-ai-901/agents_multimodal_and_extraction_implementation/image_extraction.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-ai-fundamentals-ai-901:image_extraction:classify_image_extraction_evidence:slot:confidence-threshold

- Status: authoring-admitted
- Objective: Diagnose confidence threshold evidence for the owned decision: classify whether the evidence supports OCR or vision extraction from an existing image or generation of a new image
- Expected decision: Resolve the confidence threshold distinction without substituting a neighbouring workload or control.
- Decisive boundary: confidence threshold is owned here only when confidence threshold, source provenance satisfy the documented product mechanism and the target boundary.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:image_extraction:classify_image_extraction_evidence:slot:field-schema

- Status: authoring-admitted
- Objective: Diagnose field schema evidence for the owned decision: classify whether the evidence supports OCR or vision extraction from an existing image or generation of a new image
- Expected decision: Resolve the field schema distinction without substituting a neighbouring workload or control.
- Decisive boundary: field schema is owned here only when object or region scope, confidence threshold, field schema satisfy the documented product mechanism and the target boundary.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:image_extraction:classify_image_extraction_evidence:slot:generation-boundary

- Status: authoring-admitted
- Objective: Diagnose generation boundary evidence for the owned decision: classify whether the evidence supports OCR or vision extraction from an existing image or generation of a new image
- Expected decision: Resolve the generation boundary distinction without substituting a neighbouring workload or control.
- Decisive boundary: generation boundary is owned here only when source provenance, existing-image input, generation boundary satisfy the documented product mechanism and the target boundary.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:image_extraction:classify_image_extraction_evidence:slot:object-caption

- Status: authoring-admitted
- Objective: Diagnose object caption evidence for the owned decision: classify whether the evidence supports OCR or vision extraction from an existing image or generation of a new image
- Expected decision: Resolve the object caption distinction without substituting a neighbouring workload or control.
- Decisive boundary: object caption is owned here only when OCR-versus-captioning task, object or region scope, object caption satisfy the documented product mechanism and the target boundary.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:image_extraction:classify_image_extraction_evidence:slot:ocr-region

- Status: authoring-admitted
- Objective: Diagnose ocr region evidence for the owned decision: classify whether the evidence supports OCR or vision extraction from an existing image or generation of a new image
- Expected decision: Resolve the ocr region distinction without substituting a neighbouring workload or control.
- Decisive boundary: ocr region is owned here only when existing-image input, OCR-versus-captioning task, ocr region satisfy the documented product mechanism and the target boundary.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:image_extraction:classify_image_extraction_evidence:slot:source-change-transfer

- Status: authoring-admitted
- Objective: Diagnose source change transfer evidence for the owned decision: classify whether the evidence supports OCR or vision extraction from an existing image or generation of a new image
- Expected decision: Resolve the source change transfer distinction without substituting a neighbouring workload or control.
- Decisive boundary: source change transfer is owned here only when existing-image input, OCR-versus-captioning task, source change transfer satisfy the documented product mechanism and the target boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
