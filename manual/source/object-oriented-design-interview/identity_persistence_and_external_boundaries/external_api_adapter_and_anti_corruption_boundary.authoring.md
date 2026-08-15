# object-oriented-design-interview / identity_persistence_and_external_boundaries / external_api_adapter_and_anti_corruption_boundary

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: design_interview
- Taxonomy version: 2026.08.11
- Authoring content version: object-oriented-design-interview-authoring-v2026.08.11
- Priority: T2 — explicit_initial_authoring_handoff
- Authoring sequence: 94
- Free-node surface: no
- Release-surface role: premium
- Planned item count: 2
- Authoring-admitted slots: 2
- Blocked slots: 0
- Future source path: manual/source/object-oriented-design-interview/identity_persistence_and_external_boundaries/external_api_adapter_and_anti_corruption_boundary.json
- Interaction allocation: choice/single
- Mode contribution: none

## Slot handoff

### object-oriented-design-interview:external_api_adapter_and_anti_corruption_boundary:prevent_foreign_error_and_naming_semantics_from_entering_core_domain_rules:slot:prevent_foreign_error_and_naming_semantics_from_entering_core_domain_rules

- Status: authoring-admitted
- Objective: Defend when to prevent foreign error and naming semantics from entering core domain rules and reject “translate an external API model at an anti-corruption boundary” from case evidence.
- Expected decision: prevent foreign error and naming semantics from entering core domain rules
- Decisive boundary: Choose “prevent foreign error and naming semantics from entering core domain rules” when provider version drift and retry semantics establish its ownership boundary; choose “translate an external API model at an anti-corruption boundary” when external api adapter and anti corruption boundary invalidates that boundary.
- Interaction: choice/single
- Modes: none
- Source status: exact_direct
- Blocking reasons: none

### object-oriented-design-interview:external_api_adapter_and_anti_corruption_boundary:translate_an_external_api_model_at_an_anti_corruption_boundary:slot:translate_an_external_api_model_at_an_anti_corruption_boundary

- Status: authoring-admitted
- Objective: Defend when to translate an external API model at an anti-corruption boundary and reject “prevent foreign error and naming semantics from entering core domain rules” from case evidence.
- Expected decision: translate an external API model at an anti-corruption boundary
- Decisive boundary: Choose “translate an external API model at an anti-corruption boundary” when external schema rename and foreign error code establish its ownership boundary; choose “prevent foreign error and naming semantics from entering core domain rules” when provider version drift invalidates that boundary.
- Interaction: choice/single
- Modes: none
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
