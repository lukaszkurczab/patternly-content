# frontend-system-design-interview / accessible_interaction_design / contrast_reflow_zoom_and_responsive_access

This authoring brief is generated from the canonical scaffold manifest. It is a planning handoff, not learner-facing content and not an approval record.

- Family: design_interview
- Planned item count: 3
- Authoring-admitted slots: 1
- Blocked slots: 2
- Future source path: manual/source/frontend-system-design-interview/accessible_interaction_design/contrast_reflow_zoom_and_responsive_access.json
- Interaction allocation: choice
- Mode contribution: none

## Slot handoff

### frontend-system-design-interview:contrast_reflow_zoom_and_responsive_access:avoid_fixed_dimensions_that_hide_or_overlap_content_on_narrow_viewports:slot:owned-decision

- Status: authoring-admitted
- Objective: Avoid fixed dimensions that hide or overlap content on narrow viewports.
- Expected decision: Avoid fixed dimensions that hide or overlap content on narrow viewports.
- Decisive boundary: This slot owns the outcome “Avoid fixed dimensions that hide or overlap content on narrow viewports.” only when the declared evidence (content reflow, viewport width, fixed-dimension clipping) materially determines that outcome; it does not own a case whose primary scored outcome belongs to another target.
- Interaction: choice/single
- Modes: none
- Source status: exact_direct
- Blocking reasons: none

### frontend-system-design-interview:contrast_reflow_zoom_and_responsive_access:maintain_readable_contrast_and_reflow_at_zoom_without_horizontal_loss:slot:contrast-outcome

- Status: blocked
- Objective: Meet the applicable text and non-text contrast outcome for the component state.
- Expected decision: Meet the applicable text and non-text contrast outcome for the component state.
- Decisive boundary: This slot owns the outcome “Meet the applicable text and non-text contrast outcome for the component state.” only when the declared evidence (text contrast, zoom level, content reflow) materially determines that outcome; it does not own a case whose primary scored outcome belongs to another target.
- Interaction: choice/single
- Modes: none
- Source status: provenance_resolved_authoring_deferred
- Blocking reasons: canonical_slot_is_deferred_outside_the_pinned_authoring_roster

### frontend-system-design-interview:contrast_reflow_zoom_and_responsive_access:maintain_readable_contrast_and_reflow_at_zoom_without_horizontal_loss:slot:zoom-reflow-outcome

- Status: blocked
- Objective: Preserve content and task completion at required zoom and reflow conditions without two-dimensional scrolling for ordinary content.
- Expected decision: Preserve content and task completion at required zoom and reflow conditions without two-dimensional scrolling for ordinary content.
- Decisive boundary: This slot owns the outcome “Preserve content and task completion at required zoom and reflow conditions without two-dimensional scrolling for ordinary content.” only when the declared evidence (text contrast, zoom level, content reflow) materially determines that outcome; it does not own a case whose primary scored outcome belongs to another target.
- Interaction: choice/single
- Modes: none
- Source status: provenance_resolved_authoring_deferred
- Blocking reasons: canonical_slot_is_deferred_outside_the_pinned_authoring_roster

## Authoring boundary

Author one complete bounded batch only when every admitted slot has a finished item satisfying the family source schema. Keep blocked slots absent from JSON. Human technical/editorial review is required before approval, runtime admission, or release.
