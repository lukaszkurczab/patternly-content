/**
 * Mechanical assertion snapshot of the app contract observed at the indicated
 * application HEAD. It deliberately records only externally observable keys
 * and canonical mode IDs; the app remains the owner of the TypeScript types.
 */
export const APPLICATION_CONTRACT_SHA = "5923032ce67016f255449005d769c0bf26e9b5d5";
export const APPLICATION_ALGORITHMS_BANK_KEYS = Object.freeze([
  "approvalActivationIdentity", "compatibilitySets", "contentVersion", "contrastSets",
  "familyId", "formatVersion", "interleavedScopes", "items", "practiceBlueprints",
  "recognitionSets", "simulationPools", "simulationProfiles", "trackId",
]);
export const APPLICATION_ALGORITHMS_ITEM_KEYS = Object.freeze([
  "compatibilityMemberships", "feedback", "id", "interaction", "itemFingerprint",
  "prompt", "provenance", "scoringContract", "taxonomy",
]);
export const APPLICATION_ALGORITHMS_ITEM_OPTIONAL_KEYS = Object.freeze(["constraints", "difficulty"]);
export const APPLICATION_ALGORITHM_MODE_IDS = Object.freeze([
  "algorithms-learn-approach", "algorithms-guided-practice", "algorithms-recognize-patterns",
  "algorithms-contrast-practice", "algorithms-weak-area-review",
  "algorithms-independent-practice", "algorithms-interview-simulation",
]);
