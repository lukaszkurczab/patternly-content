---
status: planned
roadmapNodeId: "tree_traversal"
unitKind: "direct"
unitId: "tree_boundaries_and_null_cases"
contentOwnership: "direct"
primaryPatternFamilyId: "tree_traversal"
legalPatternFamilyIds:
  - "tree_traversal"
primarySkillAtomId: "handle_empty_and_leaf_boundaries"
secondarySkillAtomIds: []
learningStage: "pattern_mechanics"
allowedPatternVariantIds:
  - "dfs_preorder"
  - "dfs_inorder"
  - "dfs_postorder"
  - "bfs_level_order"
  - "path_accumulation"
  - "subtree_aggregation"
allowedProblemArchetypeIds:
  - "traverse_tree"
  - "compute_subtree_property"
  - "root_to_leaf_path"
  - "level_order_processing"
  - "validate_tree_property"
relevantFalseHeuristicIds:
  - "global_state_is_always_simpler"
  - "null_children_need_no_contract"
  - "traversal_order_never_matters"
  - "tree_dfs_and_graph_dfs_are_identical"
futureBatchKind: "standard"
futureCanonicalSourcePath: "manual/source/algorithms/tree-traversal/tree-boundaries-and-null-cases.json"
targetItemCount: NOT_YET_APPROVED
---

# Authoring brief

## Purpose

Teach `handle_empty_and_leaf_boundaries` as the primary diagnostic target for `tree_boundaries_and_null_cases` in `tree_traversal`.

Keep the batch focused on this one primary mental unit. Use secondary skill atoms only when they support the primary diagnostic target.

## Questions must teach

- The reasoning represented by the primary skill atom.
- The selected family boundary: `tree_traversal`.
- Why the chosen learning stage is `pattern_mechanics`.

## Questions must diagnose

- `global_state_is_always_simpler`
- `null_children_need_no_contract`
- `traversal_order_never_matters`
- `tree_dfs_and_graph_dfs_are_identical`

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

- Primary skill atom: `handle_empty_and_leaf_boundaries`
- Secondary skill atoms: none
- Learning stage: `pattern_mechanics`
- Pattern variants: `dfs_preorder`, `dfs_inorder`, `dfs_postorder`, `bfs_level_order`, `path_accumulation`, `subtree_aggregation`
- Problem archetypes: `traverse_tree`, `compute_subtree_property`, `root_to_leaf_path`, `level_order_processing`, `validate_tree_property`

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
    primarySkillAtomId: "handle_empty_and_leaf_boundaries",
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
