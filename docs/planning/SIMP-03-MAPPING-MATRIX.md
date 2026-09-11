# SIMP-03 — macierz mapowania fazy A

Faza A opisuje wyłącznie bezstratną projekcję do canonical question v1. Tabela nie jest writerem i nie uruchamia migracji. Każda komórka oznacza, że item danego envelope może zostać sklasyfikowany na jedną z pięciu wspólnych interakcji; `—` oznacza, że aktualny inventory nie zawiera tego interaction shape w tym envelope, a nie że mapper ma stworzyć placeholder.

| Source envelope | `choice_single` | `choice_multiple` | `ordering` | `complexity` | `decision_matrix` |
| --- | --- | --- | --- | --- | --- |
| Certification item (`certification-manual-source-v2`; identity `itemId/nodeId/learningBlockId`) | `interaction.type=choice`, `selectionMode=single`, exact `acceptedOptionIds` → canonical `choice_single` | `interaction.type=choice`, `selectionMode=multiple`, exact accepted set → canonical `choice_multiple` | — | — | — |
| AI-901 node item (`certification-node-manual-source-v1`; item identity always `itemId/nodeId/learningBlockId`) | `choice/single` → canonical `choice_single` | `choice/multiple` → canonical `choice_multiple` | — | — | — |
| Design candidate item (`design-interview-manual-source-v1`, plus the registered Backend/Frontend/OOD candidate envelopes; identity `itemId/nodeId/mentalUnitId`) | choice single or single-selection proxy → canonical `choice_single` | choice multiple where present → canonical `choice_multiple` | `elements + canonicalOrder + adjacent_relations` → canonical `ordering` | — | `dimensions + acceptedValueIds + dimension_exact` → canonical `decision_matrix` |
| Coding item (`coding-interview-manual-source-v2`; identity `id/taxonomy.roadmapNodeId/taxonomy.primaryMentalUnitId`) | choice single → canonical `choice_single` | choice multiple where present → canonical `choice_multiple` | `elements + canonicalOrder + adjacent_relations` → canonical `ordering` | `checkedDimensions + availableValuesByDimension + acceptedValuesByDimension + normalizedAliasesByDimension` → canonical `complexity` | — |

## Canonical field rules

- `questionId`, `trackId`, `nodeId` and `mentalUnitId` are the only canonical identity fields. Family aliases such as `itemId`, `id`, `learningBlockId`, `roadmapNodeId`, `primaryMentalUnitId`, `taxonomy` and `familyId` never enter a canonical question.
- `prompt`, optional `constraints`, nullable `difficulty`, interaction labels/IDs, accepted sets, explicit `scoringMethod`, aliases, exact `feedback.details`, neutral feedback messages and `sourceRefs` are learner/scoring data. `constraints` and `sourceRefs` are omitted when absent; no synthetic text is generated.
- Options retain optional `explanation`; elements and values retain their source text. A mental-unit file is a non-empty JSON array because one mental unit owns multiple questions.
- Complexity aliases are stored only on the corresponding canonical complexity dimension as `aliases: { alias: canonicalValueId }`. No alias field is legal on decision-matrix dimensions. Dimension answers are arrays containing the full accepted value set, including multiple accepted values.
- Feedback is `{type, reason, details, messages}`. `details` is copied as the exact JSON value. Messages are optional and neutral: `{kind,targetId,text}`. Allowed kinds are interaction-dependent: `wrong_option`/`omitted_option`, `wrong_element`/`broken_relation`, or `wrong_value`/`omitted_dimension`. Coverage maps are not required and must not be manufactured.

## Explicitly excluded authoring/publishing fields

The following remain in legacy envelopes and are not canonical learner/scoring fields: `schemaVersion`, `batchId`, `slotId`/`slotIds`, `familyId`, `taxonomyVersion`, `contentVersion`, `declaredModes`, `modeEligibility`, `modeStructures`, `scoringContract`, `preferredInteraction`, `runtimeCompatibility`, `candidateStatus`, `activationState`, `runtimeAdmission`, `publishingAdmission`, `qualityFlags`, `nodeTitle`, `competencyIds`, `primaryCompetencyId`, `secondaryCompetencyIds`, `taxonomy`, `authoringIntent`, `authoringProvenance`, `sourceBinding`, and release/build metadata.

The exclusion is intentionally explicit: a mapper must stop on an unknown key or an unsupported interaction/details shape rather than silently dropping it or inventing a canonical value. Legacy sources stay active until SIMP-05; this document does not delete or rewrite them.
