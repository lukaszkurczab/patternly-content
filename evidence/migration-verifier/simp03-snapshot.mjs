// Fixed accepted SIMP03 historical snapshot; migration evidence is validated against these values.
export const EXPECTED_GLOBAL_COUNTS = Object.freeze({
  tracks: 9,
  nodes: 117,
  mentalUnits: 932,
  questions: 16041
});

export const EXPECTED_GLOBAL_INTERACTIONS = Object.freeze({
  choice_multiple: 440,
  choice_single: 13859,
  complexity: 279,
  decision_matrix: 147,
  ordering: 1316
});

export const EXPECTED_TRACK_COUNTS = Object.freeze({
  "aws-certified-solutions-architect-associate": Object.freeze({ nodes: 21, mentalUnits: 134, questions: 2568 }),
  "backend-system-design-interview": Object.freeze({ nodes: 10, mentalUnits: 89, questions: 1569 }),
  "claude-certified-architect-professional-certification": Object.freeze({ nodes: 7, mentalUnits: 38, questions: 300 }),
  "coding-interview-dsa-problem-solving": Object.freeze({ nodes: 26, mentalUnits: 213, questions: 3404 }),
  "frontend-system-design-interview": Object.freeze({ nodes: 10, mentalUnits: 88, questions: 1766 }),
  "google-cloud-associate-cloud-engineer": Object.freeze({ nodes: 20, mentalUnits: 152, questions: 2981 }),
  "microsoft-azure-administrator-associate-az-104": Object.freeze({ nodes: 9, mentalUnits: 75, questions: 1288 }),
  "microsoft-azure-ai-fundamentals-ai-901": Object.freeze({ nodes: 5, mentalUnits: 64, questions: 752 }),
  "object-oriented-design-interview": Object.freeze({ nodes: 9, mentalUnits: 79, questions: 1413 })
});

export const EXPECTED_TRACK_INTERACTIONS = Object.freeze({
  "aws-certified-solutions-architect-associate": Object.freeze({ choice_multiple: 0, choice_single: 2568, complexity: 0, decision_matrix: 0, ordering: 0 }),
  "backend-system-design-interview": Object.freeze({ choice_multiple: 0, choice_single: 1569, complexity: 0, decision_matrix: 0, ordering: 0 }),
  "claude-certified-architect-professional-certification": Object.freeze({ choice_multiple: 63, choice_single: 237, complexity: 0, decision_matrix: 0, ordering: 0 }),
  "coding-interview-dsa-problem-solving": Object.freeze({ choice_multiple: 377, choice_single: 2450, complexity: 279, decision_matrix: 0, ordering: 298 }),
  "frontend-system-design-interview": Object.freeze({ choice_multiple: 0, choice_single: 601, complexity: 0, decision_matrix: 147, ordering: 1018 }),
  "google-cloud-associate-cloud-engineer": Object.freeze({ choice_multiple: 0, choice_single: 2981, complexity: 0, decision_matrix: 0, ordering: 0 }),
  "microsoft-azure-administrator-associate-az-104": Object.freeze({ choice_multiple: 0, choice_single: 1288, complexity: 0, decision_matrix: 0, ordering: 0 }),
  "microsoft-azure-ai-fundamentals-ai-901": Object.freeze({ choice_multiple: 0, choice_single: 752, complexity: 0, decision_matrix: 0, ordering: 0 }),
  "object-oriented-design-interview": Object.freeze({ choice_multiple: 0, choice_single: 1413, complexity: 0, decision_matrix: 0, ordering: 0 })
});

export const EXPECTED_ENVELOPE_COUNTS = Object.freeze({
  "backend-system-design-interview-candidate-source-v1": 89,
  "certification-manual-source-v2": 402,
  "certification-node-manual-source-v1": 5,
  "coding-interview-manual-source-v2": 213,
  "frontend-system-design-interview-candidate-source-v1": 88,
  "object-oriented-design-interview-candidate-source-v1": 79
});
