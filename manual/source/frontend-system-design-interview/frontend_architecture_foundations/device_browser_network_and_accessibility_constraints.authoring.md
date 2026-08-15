# frontend-system-design-interview / frontend_architecture_foundations / device_browser_network_and_accessibility_constraints

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: design_interview
- Taxonomy version: 2026.08.11
- Authoring content version: frontend-system-design-interview-authoring-v2026.08.11
- Priority: T1 — free_node_source_ready
- Authoring sequence: 79
- Free-node surface: yes
- Release-surface role: free
- Planned item count: 4
- Authoring-admitted slots: 1
- Blocked slots: 3
- Future source path: manual/source/frontend-system-design-interview/frontend_architecture_foundations/device_browser_network_and_accessibility_constraints.json
- Interaction allocation: choice/single
- Mode contribution: none

## Slot handoff

### frontend-system-design-interview:device_browser_network_and_accessibility_constraints:choose_a_client_behavior_that_works_under_constrained_network_and_input_conditions:slot:constrained-network-behavior

- Status: blocked
- Objective: Choose behavior that preserves the primary task under slow, intermittent, or metered network conditions.
- Expected decision: Choose behavior that preserves the primary task under slow, intermittent, or metered network conditions.
- Decisive boundary: This slot owns the outcome “Choose behavior that preserves the primary task under slow, intermittent, or metered network conditions.” only when the declared evidence (network quality, input modality, browser capability) materially determines that outcome; it does not own a case whose primary scored outcome belongs to another target.
- Interaction: choice/single
- Modes: none
- Source status: provenance_resolved_authoring_deferred
- Blocking reasons: canonical_slot_is_deferred_outside_the_pinned_authoring_roster

### frontend-system-design-interview:device_browser_network_and_accessibility_constraints:choose_a_client_behavior_that_works_under_constrained_network_and_input_conditions:slot:non-pointer-input-behavior

- Status: authoring-admitted
- Objective: Choose behavior that preserves the primary task when pointer input is unavailable.
- Expected decision: Choose behavior that preserves the primary task when pointer input is unavailable.
- Decisive boundary: This slot owns the outcome “Choose behavior that preserves the primary task when pointer input is unavailable.” only when the declared evidence (network quality, input modality, browser capability) materially determines that outcome; it does not own a case whose primary scored outcome belongs to another target.
- Interaction: choice/single
- Modes: none
- Source status: exact_direct
- Blocking reasons: none

### frontend-system-design-interview:device_browser_network_and_accessibility_constraints:choose_a_client_behavior_that_works_under_constrained_network_and_input_conditions:slot:unsupported-browser-capability

- Status: blocked
- Objective: Expose an explicit unavailable or degraded state when a required browser capability is absent.
- Expected decision: Expose an explicit unavailable or degraded state when a required browser capability is absent.
- Decisive boundary: This slot owns the outcome “Expose an explicit unavailable or degraded state when a required browser capability is absent.” only when the declared evidence (network quality, input modality, browser capability) materially determines that outcome; it does not own a case whose primary scored outcome belongs to another target.
- Interaction: choice/single
- Modes: none
- Source status: provenance_resolved_authoring_deferred
- Blocking reasons: canonical_slot_is_deferred_outside_the_pinned_authoring_roster

### frontend-system-design-interview:device_browser_network_and_accessibility_constraints:treat_assistive_technology_interaction_as_a_product_constraint_rather_than_visual_polish:slot:owned-decision

- Status: blocked
- Objective: Treat assistive-technology interaction as a product constraint rather than visual polish.
- Expected decision: Treat assistive-technology interaction as a product constraint rather than visual polish.
- Decisive boundary: This slot owns the outcome “Treat assistive-technology interaction as a product constraint rather than visual polish.” only when the declared evidence (browser capability, assistive-technology behavior, device resource limit) materially determines that outcome; it does not own a case whose primary scored outcome belongs to another target.
- Interaction: choice/single
- Modes: none
- Source status: provenance_resolved_authoring_deferred
- Blocking reasons: canonical_slot_is_deferred_outside_the_pinned_authoring_roster

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
