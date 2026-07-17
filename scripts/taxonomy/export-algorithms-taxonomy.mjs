import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const compare = (left, right) => left === right ? 0 : left < right ? -1 : 1;
const canonical = (value) => {
  if (value === null || ["boolean", "number", "string"].includes(typeof value)) return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (!value || typeof value !== "object") throw new TypeError("Canonical serialization accepts JSON values only.");
  return `{${Object.keys(value).sort(compare).map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
};
export const taxonomyFingerprint = (taxonomy) => createHash("sha256").update(`canonical-json-v1\n${canonical(taxonomy)}`).digest("hex");
export const structuralPayload = (taxonomy) => ({
  taxonomyVersion: taxonomy.taxonomyVersion,
  learningStages: taxonomy.learningStages,
  roadmapNodes: taxonomy.roadmapNodes,
  mentalUnits: taxonomy.mentalUnits,
  patternFamilies: taxonomy.patternFamilies,
  patternVariants: taxonomy.patternVariants,
  problemArchetypes: taxonomy.problemArchetypes,
  skillAtoms: taxonomy.skillAtoms,
  falseHeuristics: taxonomy.falseHeuristics
});
export const generatedTypeScript = (taxonomy) => {
  const payload = structuralPayload(taxonomy);
  const fingerprint = taxonomyFingerprint(payload);
  return `/* GENERATED FILE — DO NOT EDIT MANUALLY\n * Source: patternly-content/config/taxonomy/algorithms.json\n */\n\nexport const taxonomyVersion = ${JSON.stringify(taxonomy.taxonomyVersion)} as const;\nexport const taxonomyFingerprint = ${JSON.stringify(fingerprint)} as const;\nexport const algorithmTaxonomyStructure = ${JSON.stringify(payload, null, 2)} as const;\n`;
};
export async function exportAlgorithmsTaxonomy({ inputPath, outputPath }) {
  const taxonomy = JSON.parse(await readFile(resolve(inputPath), "utf8"));
  if (taxonomy.schemaVersion !== "algorithms-taxonomy-v2" || taxonomy.trackId !== "algorithms") throw new Error("INVALID_ALGORITHMS_TAXONOMY");
  const output = generatedTypeScript(taxonomy);
  if (outputPath) await writeFile(resolve(outputPath), output);
  return { taxonomyFingerprint: taxonomyFingerprint(structuralPayload(taxonomy)), output };
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const [inputPath, outputPath] = process.argv.slice(2);
  if (!inputPath || !outputPath) throw new Error("Usage: export-algorithms-taxonomy <input-path> <output-path>");
  await exportAlgorithmsTaxonomy({ inputPath, outputPath });
}
