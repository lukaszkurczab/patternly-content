---
status: planned
roadmapNodeId: "backtracking"
unitKind: "direct"
unitId: "choose_backtracking_state"
contentOwnership: "direct"
primaryPatternFamilyId: "backtracking"
legalPatternFamilyIds:
  - "backtracking"
primarySkillAtomId: "choose_backtracking_state"
secondarySkillAtomIds: []
learningStage: "pattern_mechanics"
allowedPatternVariantIds:
  - "choice_tree"
  - "constraints_and_pruning"
  - "duplicate_control"
  - "grid_search"
  - "partition_search"
allowedProblemArchetypeIds:
  - "enumerate_combinations"
  - "enumerate_permutations"
  - "search_grid_paths"
  - "partition_sequence"
  - "construct_valid_assignment"
relevantFalseHeuristicIds:
  - "backtracking_is_bruteforce_without_invariants"
  - "duplicate_values_need_no_special_handling"
  - "pruning_can_remove_any_unpromising_choice"
  - "undo_is_optional"
futureBatchKind: "standard"
futureCanonicalSourcePath: "manual/source/algorithms/backtracking/choose-backtracking-state.json"
targetItemCount: NOT_YET_APPROVED
---

# Authoring brief

## Purpose

Teach `choose_backtracking_state` as the primary diagnostic target for `choose_backtracking_state` in `backtracking`.

Keep the batch focused on this one primary mental unit. Use secondary skill atoms only when they support the primary diagnostic target.

## Questions must teach

- The reasoning represented by the primary skill atom.
- The selected family boundary: `backtracking`.
- Why the chosen learning stage is `pattern_mechanics`.

## Questions must diagnose

- `backtracking_is_bruteforce_without_invariants`
- `duplicate_values_need_no_special_handling`
- `pruning_can_remove_any_unpromising_choice`
- `undo_is_optional`

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

- Primary skill atom: `choose_backtracking_state`
- Secondary skill atoms: none
- Learning stage: `pattern_mechanics`
- Pattern variants: `choice_tree`, `constraints_and_pruning`, `duplicate_control`, `grid_search`, `partition_search`
- Problem archetypes: `enumerate_combinations`, `enumerate_permutations`, `search_grid_paths`, `partition_sequence`, `construct_valid_assignment`

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
    primarySkillAtomId: "choose_backtracking_state",
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
