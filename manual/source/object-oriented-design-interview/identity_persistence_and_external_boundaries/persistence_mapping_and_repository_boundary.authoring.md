# object-oriented-design-interview / identity_persistence_and_external_boundaries / persistence_mapping_and_repository_boundary

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: design_interview
- Planned item count: 2
- Authoring-admitted slots: 2
- Blocked slots: 0
- Future source path: manual/source/object-oriented-design-interview/identity_persistence_and_external_boundaries/persistence_mapping_and_repository_boundary.json
- Interaction allocation: choice
- Mode contribution: none

## Slot handoff

### object-oriented-design-interview:persistence_mapping_and_repository_boundary:keep_persistence_mapping_outside_the_domain_behavior_it_stores:slot:keep_persistence_mapping_outside_the_domain_behavior_it_stores

- Status: authoring-admitted
- Objective: Defend when to keep persistence mapping outside the domain behavior it stores and reject “use a repository contract that returns domain objects rather than query mechanics” from case evidence.
- Expected decision: keep persistence mapping outside the domain behavior it stores
- Decisive boundary: Choose “keep persistence mapping outside the domain behavior it stores” when domain behavior and persistence mapping establish its ownership boundary; choose “use a repository contract that returns domain objects rather than query mechanics” when repository contract invalidates that boundary.
- Interaction: choice/single
- Modes: none
- Source status: exact_direct
- Blocking reasons: none

### object-oriented-design-interview:persistence_mapping_and_repository_boundary:use_a_repository_contract_that_returns_domain_objects_rather_than_query_mechanics:slot:use_a_repository_contract_that_returns_domain_objects_rather_than_query_mechanics

- Status: authoring-admitted
- Objective: Defend when to use a repository contract that returns domain objects rather than query mechanics and reject “keep persistence mapping outside the domain behavior it stores” from case evidence.
- Expected decision: use a repository contract that returns domain objects rather than query mechanics
- Decisive boundary: Choose “use a repository contract that returns domain objects rather than query mechanics” when repository contract and query mechanics establish its ownership boundary; choose “keep persistence mapping outside the domain behavior it stores” when domain-object reconstitution invalidates that boundary.
- Interaction: choice/single
- Modes: none
- Source status: exact_direct
- Blocking reasons: none

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
