# hashicorp-terraform-associate-004 / terraform_configuration_foundations / references_implicit_explicit_dependencies

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 10
- Authoring-admitted slots: 10
- Blocked slots: 0
- Future source path: manual/source/hashicorp-terraform-associate-004/terraform_configuration_foundations/references_implicit_explicit_dependencies.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### hashicorp-terraform-associate-004:references_implicit_explicit_dependencies:select_explicit_dependency_or_replacement_lifecycle_rule:slot:create-before-destroy-choice

- Status: authoring-admitted
- Objective: Choose create_before_destroy when replacement must overlap and the API permits it. It evaluates replacement action; documented property create_before_destroy under create_before_destroy.
- Expected decision: Enable lifecycle overlap only after checking simultaneous-object feasibility.
- Decisive boundary: Unique names, quotas, or exclusive attachments can make overlap impossible. With replacement action; documented property create_before_destroy, the required resolution is Enable lifecycle overlap only after checking simultaneous-object feasibility.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:references_implicit_explicit_dependencies:select_explicit_dependency_or_replacement_lifecycle_rule:slot:hidden-dependency-choice

- Status: authoring-admitted
- Objective: Use depends_on for a real dependency not represented by attribute data. It evaluates upstream side effect; documented property hidden_dependency under hidden_dependency.
- Expected decision: Add the narrowest explicit dependency.
- Decisive boundary: Explicit dependencies increase conservative unknowns and ordering. With upstream side effect; documented property hidden_dependency, the required resolution is Add the narrowest explicit dependency.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:references_implicit_explicit_dependencies:select_explicit_dependency_or_replacement_lifecycle_rule:slot:ignore-changes-ownership

- Status: authoring-admitted
- Objective: Use ignore_changes only where another system intentionally owns an attribute after creation. It evaluates shared attribute ownership; documented property ignore_changes under ignore_changes.
- Expected decision: Ignore the specific attribute and document ownership.
- Decisive boundary: Ignoring changes suppresses Terraform reconciliation for named attributes. With shared attribute ownership; documented property ignore_changes, the required resolution is Ignore the specific attribute and document ownership.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:references_implicit_explicit_dependencies:select_explicit_dependency_or_replacement_lifecycle_rule:slot:prevent-destroy-boundary

- Status: authoring-admitted
- Objective: Interpret prevent_destroy as a configuration guard, not permanent object protection. It evaluates lifecycle rule present; documented property prevent_destroy under prevent_destroy.
- Expected decision: Use it to reject planned destruction while the rule remains configured.
- Decisive boundary: Terraform cannot evaluate a lifecycle rule in configuration that no longer exists. With lifecycle rule present; documented property prevent_destroy, the required resolution is Use it to reject planned destruction while the rule remains configured.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:references_implicit_explicit_dependencies:select_explicit_dependency_or_replacement_lifecycle_rule:slot:replace-triggered-by-boundary

- Status: authoring-admitted
- Objective: Distinguish replace_triggered_by from depends_on. It evaluates upstream change; documented property replace_triggered_by under replace_triggered_by.
- Expected decision: Use replace_triggered_by when change evidence should force replacement.
- Decisive boundary: depends_on orders operations; replace_triggered_by changes lifecycle action. With upstream change; documented property replace_triggered_by, the required resolution is Use replace_triggered_by when change evidence should force replacement.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:references_implicit_explicit_dependencies:use_reference_for_implicit_resource_order:slot:attribute-reference-edge

- Status: authoring-admitted
- Objective: Infer an implicit dependency from a resource attribute reference. It evaluates consumer expression; documented property attribute_reference_dependency under attribute_reference_dependency.
- Expected decision: Let Terraform order producer before consumer.
- Decisive boundary: References create graph edges independent of source-file order. With consumer expression; documented property attribute_reference_dependency, the required resolution is Let Terraform order producer before consumer.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:references_implicit_explicit_dependencies:use_reference_for_implicit_resource_order:slot:list-index-reference

- Status: authoring-admitted
- Objective: Resolve the exact instance dependency created by a keyed or indexed reference. It evaluates count or for_each address; documented property resource_instances under resource_instances.
- Expected decision: Link the consumer to the referenced instance.
- Decisive boundary: Expression shape determines whether one or all instances contribute. With count or for_each address; documented property resource_instances, the required resolution is Link the consumer to the referenced instance.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:references_implicit_explicit_dependencies:use_reference_for_implicit_resource_order:slot:module-output-edge

- Status: authoring-admitted
- Objective: Trace a dependency through a child module output. It evaluates child output references resource; documented property references under references.
- Expected decision: Recognize the graph edge across module boundaries.
- Decisive boundary: Value flow creates the specific dependency, not a global module barrier. With child output references resource; documented property references, the required resolution is Recognize the graph edge across module boundaries.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:references_implicit_explicit_dependencies:use_reference_for_implicit_resource_order:slot:reference-cycle-diagnosis

- Status: authoring-admitted
- Objective: Diagnose a dependency cycle between two resources or modules. It evaluates A references B; documented property reference_cycle under reference_cycle.
- Expected decision: Redesign the interface to break circular data flow.
- Decisive boundary: Explicit ordering cannot resolve mutually required inputs. With A references B; documented property reference_cycle, the required resolution is Redesign the interface to break circular data flow.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:references_implicit_explicit_dependencies:use_reference_for_implicit_resource_order:slot:string-interpolation-edge

- Status: authoring-admitted
- Objective: Recognize a dependency inside a composed string expression. It evaluates resource attribute interpolation; documented property reference_unknown_propagation under reference_unknown_propagation.
- Expected decision: Preserve the implicit edge and unknown propagation.
- Decisive boundary: Terraform analyzes references within expressions. With resource attribute interpolation; documented property reference_unknown_propagation, the required resolution is Preserve the implicit edge and unknown propagation.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
