---
status: planned
roadmapNodeId: "linked_list"
unitKind: "direct"
unitId: "reverse_list_iterative"
contentOwnership: "direct"
primaryPatternFamilyId: "linked_list"
legalPatternFamilyIds:
  - "linked_list"
primarySkillAtomId: "reverse_link_direction_iteratively"
secondarySkillAtomIds: []
learningStage: "pattern_mechanics"
allowedPatternVariantIds:
  - "pointer_rewiring"
  - "reverse_list"
  - "fast_slow_pointer"
  - "merge_lists"
  - "dummy_head"
allowedProblemArchetypeIds:
  - "reverse_linked_structure"
  - "detect_cycle"
  - "merge_ordered_lists"
  - "remove_or_rewire_node"
  - "find_middle_node"
relevantFalseHeuristicIds:
  - "dummy_node_changes_the_logical_answer"
  - "linked_list_supports_random_access"
  - "node_value_identity_equals_node_identity"
  - "pointer_update_order_never_matters"
futureBatchKind: "standard"
futureCanonicalSourcePath: "manual/source/algorithms/linked-list/reverse-list-iterative.json"
targetItemCount: NOT_YET_APPROVED
---

# Authoring brief

## Purpose

Teach `reverse_link_direction_iteratively` as the primary diagnostic target for `reverse_list_iterative` in `linked_list`.

Keep the batch focused on this one primary mental unit. Use secondary skill atoms only when they support the primary diagnostic target.

## Questions must teach

- The reasoning represented by the primary skill atom.
- The selected family boundary: `linked_list`.
- Why the chosen learning stage is `pattern_mechanics`.

## Questions must diagnose

- `dummy_node_changes_the_logical_answer`
- `linked_list_supports_random_access`
- `node_value_identity_equals_node_identity`
- `pointer_update_order_never_matters`

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

- Primary skill atom: `reverse_link_direction_iteratively`
- Secondary skill atoms: none
- Learning stage: `pattern_mechanics`
- Pattern variants: `pointer_rewiring`, `reverse_list`, `fast_slow_pointer`, `merge_lists`, `dummy_head`
- Problem archetypes: `reverse_linked_structure`, `detect_cycle`, `merge_ordered_lists`, `remove_or_rewire_node`, `find_middle_node`

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
    primarySkillAtomId: "reverse_link_direction_iteratively",
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
