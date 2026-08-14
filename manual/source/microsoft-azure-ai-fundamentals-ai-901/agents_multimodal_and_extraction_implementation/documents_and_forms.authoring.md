# microsoft-azure-ai-fundamentals-ai-901 / agents_multimodal_and_extraction_implementation / documents_and_forms

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 7
- Authoring-admitted slots: 7
- Blocked slots: 0
- Future source path: manual/source/microsoft-azure-ai-fundamentals-ai-901/agents_multimodal_and_extraction_implementation/documents_and_forms.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### microsoft-azure-ai-fundamentals-ai-901:documents_and_forms:classify_documents_and_forms_evidence:slot:confidence-grounding

- Status: authoring-admitted
- Objective: Diagnose confidence grounding evidence for the owned decision: classify whether the evidence supports document layout or field extraction or free-form text generation
- Expected decision: Resolve the confidence grounding distinction without substituting a neighbouring workload or control.
- Decisive boundary: confidence grounding is owned here only when document type, layout and table structure, confidence grounding satisfy the documented product mechanism and the target boundary.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:documents_and_forms:classify_documents_and_forms_evidence:slot:document-layout

- Status: authoring-admitted
- Objective: Diagnose document layout evidence for the owned decision: classify whether the evidence supports document layout or field extraction or free-form text generation
- Expected decision: Resolve the document layout distinction without substituting a neighbouring workload or control.
- Decisive boundary: document layout is owned here only when document type, layout and table structure, document layout satisfy the documented product mechanism and the target boundary.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:documents_and_forms:classify_documents_and_forms_evidence:slot:document-type-transfer

- Status: authoring-admitted
- Objective: Diagnose document type transfer evidence for the owned decision: classify whether the evidence supports document layout or field extraction or free-form text generation
- Expected decision: Resolve the document type transfer distinction without substituting a neighbouring workload or control.
- Decisive boundary: document type transfer is owned here only when layout and table structure, target field schema, document type transfer satisfy the documented product mechanism and the target boundary.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:documents_and_forms:classify_documents_and_forms_evidence:slot:extract-vs-generate

- Status: authoring-admitted
- Objective: Diagnose extract vs generate evidence for the owned decision: classify whether the evidence supports document layout or field extraction or free-form text generation
- Expected decision: Resolve the extract vs generate distinction without substituting a neighbouring workload or control.
- Decisive boundary: extract vs generate is owned here only when prose-generation requirement, document type, extract vs generate satisfy the documented product mechanism and the target boundary.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:documents_and_forms:classify_documents_and_forms_evidence:slot:field-schema

- Status: authoring-admitted
- Objective: Diagnose field schema evidence for the owned decision: classify whether the evidence supports document layout or field extraction or free-form text generation
- Expected decision: Resolve the field schema distinction without substituting a neighbouring workload or control.
- Decisive boundary: field schema is owned here only when OCR quality, prose-generation requirement, field schema satisfy the documented product mechanism and the target boundary.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:documents_and_forms:classify_documents_and_forms_evidence:slot:ocr-text

- Status: authoring-admitted
- Objective: Diagnose ocr text evidence for the owned decision: classify whether the evidence supports document layout or field extraction or free-form text generation
- Expected decision: Resolve the ocr text distinction without substituting a neighbouring workload or control.
- Decisive boundary: ocr text is owned here only when target field schema, OCR quality, ocr text satisfy the documented product mechanism and the target boundary.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### microsoft-azure-ai-fundamentals-ai-901:documents_and_forms:classify_documents_and_forms_evidence:slot:table-structure

- Status: authoring-admitted
- Objective: Diagnose table structure evidence for the owned decision: classify whether the evidence supports document layout or field extraction or free-form text generation
- Expected decision: Resolve the table structure distinction without substituting a neighbouring workload or control.
- Decisive boundary: table structure is owned here only when layout and table structure, target field schema, table structure satisfy the documented product mechanism and the target boundary.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
