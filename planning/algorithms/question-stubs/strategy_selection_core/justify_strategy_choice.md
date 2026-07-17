---
status: planned
roadmapNodeId: "strategy_selection_core"
unitKind: "strategy"
unitId: "justify_strategy_choice"
contentOwnership: "cross_family"
primaryPatternFamilyId: "complexity_and_constraints"
legalPatternFamilyIds:
  - "complexity_and_constraints"
  - "arrays_and_strings"
  - "hash_map_and_set"
  - "two_pointers"
  - "sliding_window"
  - "prefix_sums"
  - "sorting_based"
  - "stack"
  - "monotonic_stack"
  - "binary_search"
primarySkillAtomId: "justify_strategy_with_constraints_and_invariants"
secondarySkillAtomIds: []
learningStage: "strategy_selection"
allowedPatternVariantIds: []
allowedProblemArchetypeIds: []
relevantFalseHeuristicIds: []
futureBatchKind: "standard"
futureCanonicalSourcePath: "manual/source/algorithms/strategy-selection-core/justify-strategy-choice.json"
targetItemCount: NOT_YET_APPROVED
---

# Authoring brief

## Purpose

Teach `justify_strategy_with_constraints_and_invariants` as the primary diagnostic target for `justify_strategy_choice` in `strategy_selection_core`.

A strategy item must state the constraint signal, legal mechanism, cost model, and correctness boundary. Do not use this cross-family node as an unclassified-question bucket.

## Questions must teach

- The reasoning represented by the primary skill atom.
- The selected family boundary: `complexity_and_constraints`, `arrays_and_strings`, `hash_map_and_set`, `two_pointers`, `sliding_window`, `prefix_sums`, `sorting_based`, `stack`, `monotonic_stack`, `binary_search`.
- Why the chosen learning stage is `strategy_selection`.

## Questions must diagnose

- None declared.

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

- Primary skill atom: `justify_strategy_with_constraints_and_invariants`
- Secondary skill atoms: none
- Learning stage: `strategy_selection`
- Pattern variants: none
- Problem archetypes: none

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
    primarySkillAtomId: "justify_strategy_with_constraints_and_invariants",
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
