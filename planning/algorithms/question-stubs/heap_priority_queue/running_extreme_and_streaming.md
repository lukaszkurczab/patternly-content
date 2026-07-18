---
status: planned
roadmapNodeId: "heap_priority_queue"
unitKind: "direct"
unitId: "running_extreme_and_streaming"
contentOwnership: "direct"
primaryPatternFamilyId: "heap_priority_queue"
legalPatternFamilyIds:
  - "heap_priority_queue"
primarySkillAtomId: "maintain_streaming_extreme"
secondarySkillAtomIds: []
learningStage: "pattern_mechanics"
allowedPatternVariantIds:
  - "top_k"
  - "running_extreme"
  - "k_way_merge"
  - "bounded_heap"
allowedProblemArchetypeIds:
  - "choose_repeated_extreme"
  - "maintain_top_k"
  - "merge_sorted_sources"
  - "schedule_by_priority"
relevantFalseHeuristicIds:
  - "heap_is_fully_sorted"
  - "heap_operations_are_constant"
  - "min_heap_and_max_heap_are_interchangeable"
  - "top_k_requires_heap_of_n"
futureBatchKind: "standard"
futureCanonicalSourcePath: "manual/source/algorithms/heap-priority-queue/running-extreme-and-streaming.json"
targetItemCount: NOT_YET_APPROVED
---

# Authoring brief

## Purpose

Teach `maintain_streaming_extreme` as the primary diagnostic target for `running_extreme_and_streaming` in `heap_priority_queue`.

Keep the batch focused on this one primary mental unit. Use secondary skill atoms only when they support the primary diagnostic target.

## Questions must teach

- The reasoning represented by the primary skill atom.
- The selected family boundary: `heap_priority_queue`.
- Why the chosen learning stage is `pattern_mechanics`.

## Questions must diagnose

- `heap_is_fully_sorted`
- `heap_operations_are_constant`
- `min_heap_and_max_heap_are_interchangeable`
- `top_k_requires_heap_of_n`

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

- Primary skill atom: `maintain_streaming_extreme`
- Secondary skill atoms: none
- Learning stage: `pattern_mechanics`
- Pattern variants: `top_k`, `running_extreme`, `k_way_merge`, `bounded_heap`
- Problem archetypes: `choose_repeated_extreme`, `maintain_top_k`, `merge_sorted_sources`, `schedule_by_priority`

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
    primarySkillAtomId: "maintain_streaming_extreme",
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
