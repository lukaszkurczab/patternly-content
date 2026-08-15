# object-oriented-design-interview / object_modeling_foundations / domain_vocabulary_entities_and_value_objects

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: design_interview
- Taxonomy version: 2026.08.11
- Authoring content version: object-oriented-design-interview-authoring-v2026.08.11
- Priority: T1 — free_node_source_ready
- Authoring sequence: 81
- Free-node surface: yes
- Release-surface role: free
- Planned item count: 2
- Authoring-admitted slots: 2
- Blocked slots: 0
- Future source path: manual/source/object-oriented-design-interview/object_modeling_foundations/domain_vocabulary_entities_and_value_objects.json
- Interaction allocation: choice/single
- Mode contribution: none

## Slot handoff

### object-oriented-design-interview:domain_vocabulary_entities_and_value_objects:model_an_identity_bearing_entity_separately_from_an_immutable_value_object:slot:model_an_identity_bearing_entity_separately_from_an_immutable_value_object

- Status: authoring-admitted
- Objective: Defend when to model an identity-bearing entity separately from an immutable value object and reject “reject a value object when independent identity and lifecycle are required” from case evidence.
- Expected decision: model an identity-bearing entity separately from an immutable value object
- Decisive boundary: Choose “model an identity-bearing entity separately from an immutable value object” when stable identity and immutable value establish its ownership boundary; choose “reject a value object when independent identity and lifecycle are required” when independent lifecycle invalidates that boundary.
- Interaction: choice/single
- Modes: none
- Source status: exact_direct
- Blocking reasons: none

### object-oriented-design-interview:domain_vocabulary_entities_and_value_objects:reject_a_value_object_when_independent_identity_and_lifecycle_are_required:slot:reject_a_value_object_when_independent_identity_and_lifecycle_are_required

- Status: authoring-admitted
- Objective: Defend when to reject a value object when independent identity and lifecycle are required and reject “model an identity-bearing entity separately from an immutable value object” from case evidence.
- Expected decision: reject a value object when independent identity and lifecycle are required
- Decisive boundary: Choose “reject a value object when independent identity and lifecycle are required” when independent lifecycle and domain equality establish its ownership boundary; choose “model an identity-bearing entity separately from an immutable value object” when ubiquitous-language term invalidates that boundary.
- Interaction: choice/single
- Modes: none
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
