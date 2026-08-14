# hashicorp-terraform-associate-004 / terraform_configuration_foundations / types_expressions_functions

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: certification
- Planned item count: 12
- Authoring-admitted slots: 12
- Blocked slots: 0
- Future source path: manual/source/hashicorp-terraform-associate-004/terraform_configuration_foundations/types_expressions_functions.json
- Interaction allocation: choice
- Mode contribution: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-scenario-practice, certification-weak-area-review

## Slot handoff

### hashicorp-terraform-associate-004:types_expressions_functions:choose_expression_or_function_for_value_transformation:slot:collection-function-choice

- Status: authoring-admitted
- Objective: Select merge, concat, setunion, or flatten based on collection shape. It evaluates map versus sequence; documented property collection_shape_transformation under collection_shape_transformation.
- Expected decision: Use the function whose output shape matches the contract.
- Decisive boundary: Functions encode distinct collection semantics and types. With map versus sequence; documented property collection_shape_transformation, the required resolution is Use the function whose output shape matches the contract.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:types_expressions_functions:choose_expression_or_function_for_value_transformation:slot:conditional-type-unification

- Status: authoring-admitted
- Objective: Diagnose a conditional whose result branches have incompatible types. It evaluates true branch type; documented property conditional_type_consistency under conditional_type_consistency.
- Expected decision: Make both results satisfy one coherent type.
- Decisive boundary: Conditional result typing must be resolvable during evaluation. With true branch type; documented property conditional_type_consistency, the required resolution is Make both results satisfy one coherent type.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:types_expressions_functions:choose_expression_or_function_for_value_transformation:slot:for-expression-transform

- Status: authoring-admitted
- Objective: Transform a collection while optionally filtering elements. It evaluates input collection; documented property for_expressions under for_expressions.
- Expected decision: Use a for expression with stable key/value semantics.
- Decisive boundary: for expressions construct values; repetition meta-arguments construct instances. With input collection; documented property for_expressions, the required resolution is Use a for expression with stable key/value semantics.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:types_expressions_functions:choose_expression_or_function_for_value_transformation:slot:function-evaluation-boundary

- Status: authoring-admitted
- Objective: Recognize that filesystem functions read files during configuration evaluation, not as managed dependencies. It evaluates file function; documented property configuration_time_function_evaluation under configuration_time_function_evaluation.
- Expected decision: Treat the file as configuration input and ensure it exists before the run.
- Decisive boundary: Functions do not create resource graph nodes. With file function; documented property configuration_time_function_evaluation, the required resolution is Treat the file as configuration input and ensure it exists before the run.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:types_expressions_functions:choose_expression_or_function_for_value_transformation:slot:lookup-try-boundary

- Status: authoring-admitted
- Objective: Choose lookup or try for a specific optional access rather than masking unrelated failures. It evaluates map key optionality; documented property narrow_error_handling under narrow_error_handling.
- Expected decision: Use the narrowest construct that handles the expected absence.
- Decisive boundary: Overbroad error handling can hide schema and reference defects. With map key optionality; documented property narrow_error_handling, the required resolution is Use the narrowest construct that handles the expected absence.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:types_expressions_functions:choose_expression_or_function_for_value_transformation:slot:splat-versus-for

- Status: authoring-admitted
- Objective: Use a splat only for the simple same-attribute projection it represents. It evaluates list of objects; documented property splat under splat.
- Expected decision: Use splat for simple projection; use for expression for richer transformation.
- Decisive boundary: Splat syntax is concise but intentionally limited. With list of objects; documented property splat, the required resolution is Use splat for simple projection; use for expression for richer transformation.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:types_expressions_functions:constrain_input_with_terraform_type_system:slot:automatic-conversion-boundary

- Status: authoring-admitted
- Objective: Predict safe automatic conversion between similar collection types. It evaluates source collection; documented property automatic_type_conversion under automatic_type_conversion.
- Expected decision: Accept conversion only when semantics survive it.
- Decisive boundary: Terraform converts compatible values but may discard distinctions. With source collection; documented property automatic_type_conversion, the required resolution is Accept conversion only when semantics survive it.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:types_expressions_functions:constrain_input_with_terraform_type_system:slot:null-versus-unknown

- Status: authoring-admitted
- Objective: Separate a known null from a value unknown until apply. It evaluates null literal; documented property null_unknown_distinction under null_unknown_distinction.
- Expected decision: Treat null as known absence and unknown as deferred knowledge.
- Decisive boundary: Unknown values may later be non-null and still affect planning. With null literal; documented property null_unknown_distinction, the required resolution is Treat null as known absence and unknown as deferred knowledge.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:types_expressions_functions:constrain_input_with_terraform_type_system:slot:object-type-contract

- Status: authoring-admitted
- Objective: Define an object input with required typed attributes. It evaluates known fields; documented property structural_types under structural_types.
- Expected decision: Use an object type constraint matching the contract.
- Decisive boundary: Object constraints validate attribute shape; maps require homogeneous element types. With known fields; documented property structural_types, the required resolution is Use an object type constraint matching the contract.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:types_expressions_functions:constrain_input_with_terraform_type_system:slot:optional-attribute-default

- Status: authoring-admitted
- Objective: Choose an optional object attribute with a default for a stable module contract. It evaluates attribute commonly omitted; documented property optional_object_attribute under optional_object_attribute.
- Expected decision: Declare optional(type, default) in the object constraint.
- Decisive boundary: A typed optional contract centralizes defaulting and validation. With attribute commonly omitted; documented property optional_object_attribute, the required resolution is Declare optional(type, default) in the object constraint.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:types_expressions_functions:constrain_input_with_terraform_type_system:slot:tuple-list-distinction

- Status: authoring-admitted
- Objective: Distinguish a tuple with position-specific types from a homogeneous list. It evaluates element type sequence; documented property tuple_list_set_distinction under tuple_list_set_distinction.
- Expected decision: Choose tuple only when positions have distinct meanings and types.
- Decisive boundary: List elements share one type; tuple positions can differ. With element type sequence; documented property tuple_list_set_distinction, the required resolution is Choose tuple only when positions have distinct meanings and types.
- Interaction: choice/single
- Modes: certification-diagnostic-baseline, certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-quick-review, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

### hashicorp-terraform-associate-004:types_expressions_functions:constrain_input_with_terraform_type_system:slot:type-error-diagnosis

- Status: authoring-admitted
- Objective: Locate a module input failing its declared collection element type. It evaluates declared list(object); documented property structural_types under structural_types.
- Expected decision: Correct the mismatched element or contract.
- Decisive boundary: Type conversion cannot repair incompatible nested shape safely. With declared list(object); documented property structural_types, the required resolution is Correct the mismatched element or contract.
- Interaction: choice/single
- Modes: certification-exam-simulation, certification-focus-practice, certification-mixed-practice, certification-scenario-practice, certification-weak-area-review
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
