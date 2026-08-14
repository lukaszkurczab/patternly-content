# object-oriented-design-interview / responsibilities_and_collaborations / god_object_feature_envy_and_anemic_leakage

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: design_interview
- Planned item count: 3
- Authoring-admitted slots: 1
- Blocked slots: 2
- Future source path: manual/source/object-oriented-design-interview/responsibilities_and_collaborations/god_object_feature_envy_and_anemic_leakage.json
- Interaction allocation: choice
- Mode contribution: none

## Slot handoff

### object-oriented-design-interview:god_object_feature_envy_and_anemic_leakage:move_feature_envious_behavior_to_the_object_whose_data_and_rule_it_manipulates:slot:move_feature_envious_behavior_to_the_object_whose_data_and_rule_it_manipulates

- Status: blocked
- Objective: Defend when to move feature-envious behavior to the object whose data and rule it manipulates and reject “adding more getters so a service can manipulate foreign state” from case evidence.
- Expected decision: move feature-envious behavior to the object whose data and rule it manipulates
- Decisive boundary: Choose “move feature-envious behavior to the object whose data and rule it manipulates” when feature-envious behavior and domain data access establish its ownership boundary; choose “adding more getters so a service can manipulate foreign state” when coordinator forwarding invalidates that boundary.
- Interaction: null/single
- Modes: none
- Source status: not_admitted
- Blocking reasons: canonical_slot_is_deferred_outside_the_pinned_authoring_roster

### object-oriented-design-interview:god_object_feature_envy_and_anemic_leakage:restore_behavior_to_an_anemic_entity_when_it_owns_the_rule_and_invariant:slot:restore_behavior_to_an_anemic_entity_when_it_owns_the_rule_and_invariant

- Status: authoring-admitted
- Objective: Defend when to restore behavior to an anemic entity when it owns the rule and invariant and reject “keeping domain rules in a procedural service with passive records” from case evidence.
- Expected decision: restore behavior to an anemic entity when it owns the rule and invariant
- Decisive boundary: Choose “restore behavior to an anemic entity when it owns the rule and invariant” when anemic domain data and invariant owner establish its ownership boundary; choose “keeping domain rules in a procedural service with passive records” when domain behavior cohesion invalidates that boundary.
- Interaction: choice/single
- Modes: none
- Source status: exact_direct
- Blocking reasons: none

### object-oriented-design-interview:god_object_feature_envy_and_anemic_leakage:split_a_god_object_along_invariant_and_responsibility_ownership:slot:split_a_god_object_along_invariant_and_responsibility_ownership

- Status: blocked
- Objective: Defend when to split a god object along invariant and responsibility ownership and reject “splitting by method count or file size” from case evidence.
- Expected decision: split a god object along invariant and responsibility ownership
- Decisive boundary: Choose “split a god object along invariant and responsibility ownership” when invariant ownership and god-object responsibility establish its ownership boundary; choose “splitting by method count or file size” when cohesive state invalidates that boundary.
- Interaction: null/single
- Modes: none
- Source status: not_admitted
- Blocking reasons: canonical_slot_is_deferred_outside_the_pinned_authoring_roster

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
