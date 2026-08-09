/**
 * Mechanical assertion snapshot of the app contract observed at the indicated
 * application HEAD. It deliberately records only externally observable keys
 * and canonical mode IDs; the app remains the owner of the TypeScript types.
 */
export const APPLICATION_CONTRACT_SHA = "5923032ce67016f255449005d769c0bf26e9b5d5";
export const APPLICATION_ALGORITHMS_BANK_KEYS = Object.freeze([
  "compatibilitySets", "contentVersion", "contrastSets",
  "familyId", "feedbackAssets", "formatVersion", "interleavedScopes", "items", "practiceBlueprints",
  "recognitionSets", "simulationPools", "simulationProfiles", "trackId",
]);
export const APPLICATION_ALGORITHMS_ITEM_KEYS = Object.freeze([
  "compatibilityMemberships", "feedback", "id", "interaction", "itemFingerprint",
  "prompt", "provenance", "scoringContract", "taxonomy",
]);
export const APPLICATION_ALGORITHMS_ITEM_OPTIONAL_KEYS = Object.freeze(["constraints", "difficulty"]);
export const APPLICATION_ALGORITHM_MODE_IDS = Object.freeze([
  "coding-interview-learn-approach", "coding-interview-guided-practice", "coding-interview-recognize-patterns",
  "coding-interview-contrast-practice", "coding-interview-weak-area-review",
  "coding-interview-independent-practice", "coding-interview-interview-simulation",
]);
