# frontend-system-design-interview / accessible_interaction_design / cross_device_and_assistive_technology_transfer

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: design_interview
- Taxonomy version: 2026.08.11
- Authoring content version: frontend-system-design-interview-authoring-v2026.08.11
- Priority: T2 — explicit_initial_authoring_handoff
- Authoring sequence: 89
- Free-node surface: no
- Release-surface role: premium
- Planned item count: 5
- Authoring-admitted slots: 4
- Blocked slots: 1
- Future source path: manual/source/frontend-system-design-interview/accessible_interaction_design/cross_device_and_assistive_technology_transfer.json
- Interaction allocation: choice/single
- Mode contribution: none

## Slot handoff

### frontend-system-design-interview:cross_device_and_assistive_technology_transfer:preserve_task_completion_when_viewport_zoom_or_input_method_changes:slot:input-method-transfer

- Status: authoring-admitted
- Objective: Preserve task completion when the input method changes from pointer assumptions to keyboard, touch, voice, or assistive technology as required by the case.
- Expected decision: Preserve task completion when the input method changes from pointer assumptions to keyboard, touch, voice, or assistive technology as required by the case.
- Decisive boundary: This slot owns the outcome “Preserve task completion when the input method changes from pointer assumptions to keyboard, touch, voice, or assistive technology as required by the case.” only when the declared evidence (pointer assumption, viewport change, input-method change) materially determines that outcome; it does not own a case whose primary scored outcome belongs to another target.
- Interaction: choice/single
- Modes: none
- Source status: exact_direct
- Blocking reasons: none

### frontend-system-design-interview:cross_device_and_assistive_technology_transfer:preserve_task_completion_when_viewport_zoom_or_input_method_changes:slot:viewport-transfer

- Status: authoring-admitted
- Objective: Preserve task completion when the supported viewport size changes.
- Expected decision: Preserve task completion when the supported viewport size changes.
- Decisive boundary: This slot owns the outcome “Preserve task completion when the supported viewport size changes.” only when the declared evidence (pointer assumption, viewport change, input-method change) materially determines that outcome; it does not own a case whose primary scored outcome belongs to another target.
- Interaction: choice/single
- Modes: none
- Source status: exact_direct
- Blocking reasons: none

### frontend-system-design-interview:cross_device_and_assistive_technology_transfer:preserve_task_completion_when_viewport_zoom_or_input_method_changes:slot:zoom-transfer

- Status: authoring-admitted
- Objective: Preserve task completion at the supported zoom and reflow conditions.
- Expected decision: Preserve task completion at the supported zoom and reflow conditions.
- Decisive boundary: This slot owns the outcome “Preserve task completion at the supported zoom and reflow conditions.” only when the declared evidence (pointer assumption, viewport change, input-method change) materially determines that outcome; it does not own a case whose primary scored outcome belongs to another target.
- Interaction: choice/single
- Modes: none
- Source status: exact_direct
- Blocking reasons: none

### frontend-system-design-interview:cross_device_and_assistive_technology_transfer:test_the_interaction_with_keyboard_and_screen_reader_behavior_not_pointer_assumptions:slot:keyboard-task-path

- Status: authoring-admitted
- Objective: Verify the complete interaction path with keyboard behavior instead of assuming pointer equivalence.
- Expected decision: Verify the complete interaction path with keyboard behavior instead of assuming pointer equivalence.
- Decisive boundary: This slot owns the outcome “Verify the complete interaction path with keyboard behavior instead of assuming pointer equivalence.” only when the declared evidence (keyboard behavior, screen-reader behavior, pointer assumption) materially determines that outcome; it does not own a case whose primary scored outcome belongs to another target.
- Interaction: choice/single
- Modes: none
- Source status: exact_direct
- Blocking reasons: none

### frontend-system-design-interview:cross_device_and_assistive_technology_transfer:test_the_interaction_with_keyboard_and_screen_reader_behavior_not_pointer_assumptions:slot:screen-reader-task-path

- Status: blocked
- Objective: Verify semantics, state, navigation, and announcements through a screen-reader task path.
- Expected decision: Verify semantics, state, navigation, and announcements through a screen-reader task path.
- Decisive boundary: This slot owns the outcome “Verify semantics, state, navigation, and announcements through a screen-reader task path.” only when the declared evidence (keyboard behavior, screen-reader behavior, pointer assumption) materially determines that outcome; it does not own a case whose primary scored outcome belongs to another target.
- Interaction: choice/single
- Modes: none
- Source status: provenance_resolved_authoring_deferred
- Blocking reasons: canonical_slot_is_deferred_outside_the_pinned_authoring_roster

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
