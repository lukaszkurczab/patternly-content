---
status: planned
roadmapNodeId: "graph_traversal"
unitKind: "direct"
unitId: "grid_as_graph"
contentOwnership: "direct"
primaryPatternFamilyId: "graph_traversal"
legalPatternFamilyIds:
  - "graph_traversal"
primarySkillAtomId: "map_grid_cells_to_graph_state"
secondarySkillAtomIds: []
learningStage: "pattern_mechanics"
allowedPatternVariantIds:
  - "adjacency_list"
  - "graph_dfs"
  - "graph_bfs"
  - "multi_source_bfs"
  - "connected_components"
  - "topological_order_intro"
  - "grid_graph"
allowedProblemArchetypeIds:
  - "traverse_connected_state"
  - "shortest_unweighted_path"
  - "count_components"
  - "propagate_from_multiple_sources"
  - "order_dependencies"
relevantFalseHeuristicIds:
  - "adjacency_matrix_is_always_wrong"
  - "bfs_is_always_faster_than_dfs"
  - "marking_visited_on_dequeue_is_always_equivalent"
  - "tree_visited_rules_apply_unchanged"
futureBatchKind: "standard"
futureCanonicalSourcePath: "manual/source/algorithms/graph-traversal/grid-as-graph.json"
targetItemCount: NOT_YET_APPROVED
---

# Authoring brief

## Purpose

Teach `map_grid_cells_to_graph_state` as the primary diagnostic target for `grid_as_graph` in `graph_traversal`.

Keep the batch focused on this one primary mental unit. Use secondary skill atoms only when they support the primary diagnostic target.

## Questions must teach

- The reasoning represented by the primary skill atom.
- The selected family boundary: `graph_traversal`.
- Why the chosen learning stage is `pattern_mechanics`.

## Questions must diagnose

- `adjacency_matrix_is_always_wrong`
- `bfs_is_always_faster_than_dfs`
- `marking_visited_on_dequeue_is_always_equivalent`
- `tree_visited_rules_apply_unchanged`

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

- Primary skill atom: `map_grid_cells_to_graph_state`
- Secondary skill atoms: none
- Learning stage: `pattern_mechanics`
- Pattern variants: `adjacency_list`, `graph_dfs`, `graph_bfs`, `multi_source_bfs`, `connected_components`, `topological_order_intro`, `grid_graph`
- Problem archetypes: `traverse_connected_state`, `shortest_unweighted_path`, `count_components`, `propagate_from_multiple_sources`, `order_dependencies`

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
    primarySkillAtomId: "map_grid_cells_to_graph_state",
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
