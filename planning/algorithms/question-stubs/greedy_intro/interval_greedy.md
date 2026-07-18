---
status: planned
roadmapNodeId: "greedy_intro"
unitKind: "direct"
unitId: "interval_greedy"
contentOwnership: "direct"
primaryPatternFamilyId: "greedy_intro"
legalPatternFamilyIds:
  - "greedy_intro"
primarySkillAtomId: "choose_interval_greedy_boundary"
secondarySkillAtomIds: []
learningStage: "strategy_selection"
allowedPatternVariantIds:
  - "sort_then_greedy"
  - "interval_greedy"
  - "running_best_choice"
  - "greedy_with_heap"
allowedProblemArchetypeIds:
  - "choose_non_overlapping_set"
  - "minimize_or_maximize_local_cost"
  - "schedule_by_deadline"
  - "construct_optimal_sequence"
relevantFalseHeuristicIds:
  - "dynamic_programming_and_greedy_are_interchangeable"
  - "greedy_needs_no_proof"
  - "greedy_sort_key_is_obvious"
  - "locally_best_always_means_globally_best"
futureBatchKind: "standard"
futureCanonicalSourcePath: "manual/source/algorithms/greedy-intro/interval-greedy.json"
targetItemCount: NOT_YET_APPROVED
---

# Authoring brief

## Purpose

Teach `choose_interval_greedy_boundary` as the primary diagnostic target for `interval_greedy` in `greedy_intro`.

Keep the batch focused on this one primary mental unit. Use secondary skill atoms only when they support the primary diagnostic target.

## Questions must teach

- The reasoning represented by the primary skill atom.
- The selected family boundary: `greedy_intro`.
- Why the chosen learning stage is `strategy_selection`.

## Questions must diagnose

- `dynamic_programming_and_greedy_are_interchangeable`
- `greedy_needs_no_proof`
- `greedy_sort_key_is_obvious`
- `locally_best_always_means_globally_best`

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

- Primary skill atom: `choose_interval_greedy_boundary`
- Secondary skill atoms: none
- Learning stage: `strategy_selection`
- Pattern variants: `sort_then_greedy`, `interval_greedy`, `running_best_choice`, `greedy_with_heap`
- Problem archetypes: `choose_non_overlapping_set`, `minimize_or_maximize_local_cost`, `schedule_by_deadline`, `construct_optimal_sequence`

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
    primarySkillAtomId: "choose_interval_greedy_boundary",
    secondarySkillAtomIds: [],
    learningStage: "strategy_selection",
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
