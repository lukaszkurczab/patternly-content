---
status: planned
roadmapNodeId: "intervals"
unitKind: "direct"
unitId: "meeting_rooms_and_resource_count"
contentOwnership: "direct"
primaryPatternFamilyId: "intervals"
legalPatternFamilyIds:
  - "intervals"
primarySkillAtomId: "count_concurrent_intervals"
secondarySkillAtomIds: []
learningStage: "pattern_mechanics"
allowedPatternVariantIds:
  - "merge_overlaps"
  - "insert_interval"
  - "sweep_line_intro"
  - "interval_resource_count"
allowedProblemArchetypeIds:
  - "merge_or_compare_intervals"
  - "detect_schedule_conflict"
  - "count_concurrent_intervals"
  - "insert_into_merged_intervals"
relevantFalseHeuristicIds:
  - "interval_length_determines_overlap"
  - "sorting_by_end_is_always_correct"
  - "sweep_events_need_no_tie_rule"
  - "touching_endpoints_always_overlap"
futureBatchKind: "standard"
futureCanonicalSourcePath: "manual/source/algorithms/intervals/meeting-rooms-and-resource-count.json"
targetItemCount: NOT_YET_APPROVED
---

# Authoring brief

## Purpose

Teach `count_concurrent_intervals` as the primary diagnostic target for `meeting_rooms_and_resource_count` in `intervals`.

Keep the batch focused on this one primary mental unit. Use secondary skill atoms only when they support the primary diagnostic target.

## Questions must teach

- The reasoning represented by the primary skill atom.
- The selected family boundary: `intervals`.
- Why the chosen learning stage is `pattern_mechanics`.

## Questions must diagnose

- `interval_length_determines_overlap`
- `sorting_by_end_is_always_correct`
- `sweep_events_need_no_tie_rule`
- `touching_endpoints_always_overlap`

## Required coverage

- Recognition when a signal is relevant.
- Mechanics or reasoning required by the primary skill.
- Relevant edge cases and boundary conditions.
- Mistake review through plausible distractors.
- Transfer or variation when it changes the decision boundary.

## Preferred interaction types

- Choice (single or multiple) for strategy selection and misconception diagnosis.
- Ordering for process or invariant sequencing.
- Complexity for cost-model reasoning when applicable.

## Allowed taxonomy

- Primary skill atom: `count_concurrent_intervals`
- Secondary skill atoms: none
- Learning stage: `pattern_mechanics`
- Pattern variants: `merge_overlaps`, `insert_interval`, `sweep_line_intro`, `interval_resource_count`
- Problem archetypes: `merge_or_compare_intervals`, `detect_schedule_conflict`, `count_concurrent_intervals`, `insert_into_merged_intervals`

## Forbidden scope

- Do not make another mental unit the primary target.
- Do not create a source file until at least one independently authored, human-reviewed item exists.
- Do not copy placeholder values from the item shape below into canonical ingress.

## Required item format

```ts
{
  id: "REPLACE_ME",
  prompt: "REPLACE_ME",
  interaction: {
    type: "choice",
    selectionMode: "single",
    options: [
      { id: "option_a", text: "REPLACE_ME" },
      { id: "option_b", text: "REPLACE_ME" }
    ],
    acceptedOptionIds: ["option_a"]
  },
  scoringContract: {
    type: "choice",
    resultSemantics: "exact_selected_set_with_partial_v1"
  },
  feedback: {
    reason: "REPLACE_ME",
    details: "REPLACE_ME",
    wrongOptionExplanationsByOptionId: { option_b: "REPLACE_ME" }
  },
  taxonomy: {
    primarySkillAtomId: "count_concurrent_intervals",
    secondarySkillAtomIds: [],
    learningStage: "pattern_mechanics",
    patternVariantId: "OPTIONAL",
    problemArchetypeId: "OPTIONAL"
  }
}
```

This is an authoring shape example, not a real question. Do not copy placeholder values into canonical ingress.

## Review checklist

- [ ] The primary skill atom is the exact ID in this stub.
- [ ] The selected family, variant, and archetype are legal for this unit.
- [ ] The item tests reasoning rather than keyword matching.
- [ ] Feedback explains every incorrect choice where required.
- [ ] A canonical source JSON will be created only after manual authoring and review.
