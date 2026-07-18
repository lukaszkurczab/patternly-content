import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const PLANNING_ROOT = join(ROOT, "planning", "algorithms");
const TAXONOMY_PATH = join(ROOT, "config", "taxonomy", "algorithms.json");
const compare = (left, right) => left === right ? 0 : left < right ? -1 : 1;
const isFilesystemMetadata = (name) => name === ".DS_Store";
const kebab = (value) => value.replaceAll("_", "-");
const title = (value) => value.split("_").map((part) => part === "dp" ? "DP" : part === "dfs" ? "DFS" : part === "bfs" ? "BFS" : part === "lifo" ? "LIFO" : part === "gcd" ? "GCD" : part === "lcm" ? "LCM" : part[0].toUpperCase() + part.slice(1)).join(" ");
const quoted = (value) => JSON.stringify(value);
const list = (label, values) => values.length ? `${label}:\n${values.map((value) => `  - ${quoted(value)}`).join("\n")}` : `${label}: []`;
const markdownList = (values) => values.length ? values.map((value) => `- \`${value}\``).join("\n") : "- None declared.";

async function files(path) {
  let entries;
  try { entries = await readdir(path, { withFileTypes: true }); } catch (error) { if (error.code === "ENOENT") return []; throw error; }
  return (await Promise.all(entries.filter((entry) => !isFilesystemMetadata(entry.name)).sort((left, right) => compare(left.name, right.name)).map((entry) => entry.isDirectory() ? files(join(path, entry.name)) : [join(path, entry.name)]))).flat();
}

function assertTaxonomy(taxonomy) {
  if (taxonomy.schemaVersion !== "algorithms-taxonomy-v2" || taxonomy.trackId !== "algorithms" || taxonomy.taxonomyVersion !== "algorithms-taxonomy-v2") throw new Error("INVALID_ALGORITHMS_TAXONOMY");
  if (taxonomy.roadmapNodes.length !== 26 || taxonomy.patternFamilies.length !== 21 || taxonomy.mentalUnits.length !== 213) throw new Error("INVALID_ALGORITHMS_TAXONOMY_COUNTS");
  const nodeIds = new Set(taxonomy.roadmapNodes.map((node) => node.id));
  const unitIds = taxonomy.mentalUnits.map((unit) => unit.id);
  if (new Set(unitIds).size !== unitIds.length || unitIds.includes("base_case_and_result_contract")) throw new Error("INVALID_ALGORITHMS_UNIT_IDS");
  if (taxonomy.roadmapNodes.filter((node) => node.contentOwnership === "direct").length !== 20 || taxonomy.roadmapNodes.filter((node) => node.contentOwnership === "cross_family").length !== 6) throw new Error("INVALID_ALGORITHMS_OWNERSHIP_COUNTS");
  if (taxonomy.mentalUnits.filter((unit) => unit.unitKind === "strategy").length !== 8 || taxonomy.mentalUnits.filter((unit) => unit.unitKind === "contrast").length !== 40) throw new Error("INVALID_ALGORITHMS_UNIT_KIND_COUNTS");
  for (const node of taxonomy.roadmapNodes.filter((node) => node.id.startsWith("contrast_"))) {
    if (!taxonomy.falseHeuristics.some((heuristic) => heuristic.relevantRoadmapNodeIds.includes(node.id))) throw new Error(`MISSING_CONTRAST_FALSE_HEURISTIC:${node.id}`);
  }
  for (const unit of taxonomy.mentalUnits) {
    if (!nodeIds.has(unit.roadmapNodeId) || !unit.legalPatternFamilyIds.includes(unit.primaryPatternFamilyId) || !taxonomy.learningStages.includes(unit.learningStage)) throw new Error(`INVALID_ALGORITHMS_UNIT:${unit.id}`);
    if (unit.unitKind === "contrast" && (!unit.contrastedMentalUnitIds?.length || unit.learningStage !== "contrast_practice")) throw new Error(`INVALID_CONTRAST_UNIT:${unit.id}`);
  }
}

function heuristicIds(taxonomy, unit) {
  return taxonomy.falseHeuristics
    .filter((heuristic) => heuristic.relevantRoadmapNodeIds.includes(unit.roadmapNodeId) && (unit.unitKind === "contrast" || (heuristic.relevantMentalUnitIds ?? []).includes(unit.id)))
    .map((heuristic) => heuristic.id)
    .sort(compare);
}

function sourcePath(node, unit) {
  return `manual/source/algorithms/${kebab(node.id)}/${kebab(unit.id)}.json`;
}

function renderStub(taxonomy, node, unit) {
  const falseHeuristicIds = heuristicIds(taxonomy, unit);
  const batchKind = unit.unitKind === "contrast" ? "contrast" : "standard";
  const frontMatter = [
    "---",
    "status: planned",
    `roadmapNodeId: ${quoted(node.id)}`,
    `unitKind: ${quoted(unit.unitKind)}`,
    `unitId: ${quoted(unit.id)}`,
    `contentOwnership: ${quoted(node.contentOwnership)}`,
    `primaryPatternFamilyId: ${quoted(unit.primaryPatternFamilyId)}`,
    list("legalPatternFamilyIds", unit.legalPatternFamilyIds),
    `primarySkillAtomId: ${quoted(unit.primarySkillAtomId)}`,
    list("secondarySkillAtomIds", unit.secondarySkillAtomIds),
    `learningStage: ${quoted(unit.learningStage)}`,
    list("allowedPatternVariantIds", unit.patternVariantIds),
    list("allowedProblemArchetypeIds", unit.problemArchetypeIds),
    list("relevantFalseHeuristicIds", falseHeuristicIds),
    ...(unit.contrastedMentalUnitIds ? [list("contrastedMentalUnitIds", unit.contrastedMentalUnitIds)] : []),
    `futureBatchKind: ${quoted(batchKind)}`,
    `futureCanonicalSourcePath: ${quoted(sourcePath(node, unit))}`,
    "targetItemCount: NOT_YET_APPROVED",
    "---"
  ].join("\n");
  const contrastRule = unit.unitKind === "contrast"
    ? `\n\nA contrast batch must include \`contrastMetadata\` with these contrasted units, one of the listed false heuristics, and an explicit transfer boundary. The question must diagnose the decision boundary rather than restate either pattern definition.`
    : unit.unitKind === "strategy"
      ? "\n\nA strategy item must state the constraint signal, legal mechanism, cost model, and correctness boundary. Do not use this cross-family node as an unclassified-question bucket."
      : "\n\nKeep the batch focused on this one primary mental unit. Use secondary skill atoms only when they support the primary diagnostic target.";
  return `${frontMatter}\n\n# Authoring brief\n\n## Purpose\n\nTeach \`${unit.primarySkillAtomId}\` as the primary diagnostic target for \`${unit.id}\` in \`${node.id}\`.${contrastRule}\n\n## Questions must teach\n\n- The reasoning represented by the primary skill atom.\n- The selected family boundary: ${unit.legalPatternFamilyIds.map((id) => `\`${id}\``).join(", ")}.\n- Why the chosen learning stage is \`${unit.learningStage}\`.\n\n## Questions must diagnose\n\n${markdownList(falseHeuristicIds)}\n\n## Required coverage\n\n- Recognition when a signal is relevant.\n- Mechanics or reasoning required by the primary skill.\n- Relevant edge cases and boundary conditions.\n- Mistake review through plausible distractors.\n- Transfer or variation when it changes the decision boundary.\n\n## Preferred interaction types\n\n- Choice (single or multiple) for strategy selection and misconception diagnosis.\n- Ordering for process or invariant sequencing.\n- Complexity for cost-model reasoning when applicable.\n\n## Allowed taxonomy\n\n- Primary skill atom: \`${unit.primarySkillAtomId}\`\n- Secondary skill atoms: ${unit.secondarySkillAtomIds.length ? unit.secondarySkillAtomIds.map((id) => `\`${id}\``).join(", ") : "none"}\n- Learning stage: \`${unit.learningStage}\`\n- Pattern variants: ${unit.patternVariantIds.length ? unit.patternVariantIds.map((id) => `\`${id}\``).join(", ") : "none"}\n- Problem archetypes: ${unit.problemArchetypeIds.length ? unit.problemArchetypeIds.map((id) => `\`${id}\``).join(", ") : "none"}\n\n## Forbidden scope\n\n- Do not make another mental unit the primary target.\n- Do not create a source file until at least one independently authored, human-reviewed item exists.\n- Do not copy placeholder values from the item shape below into canonical ingress.\n\n## Required item format\n\n\`\`\`ts\n{\n  id: "REPLACE_ME",\n  prompt: "REPLACE_ME",\n  interaction: {\n    type: "choice",\n    selectionMode: "single",\n    options: [\n      { id: "option_a", text: "REPLACE_ME" },\n      { id: "option_b", text: "REPLACE_ME" }\n    ],\n    acceptedOptionIds: ["option_a"]\n  },\n  scoringContract: {\n    type: "choice",\n    resultSemantics: "exact_selected_set_with_partial_v1"\n  },\n  feedback: {\n    reason: "REPLACE_ME",\n    details: "REPLACE_ME",\n    wrongOptionExplanationsByOptionId: { option_b: "REPLACE_ME" }\n  },\n  taxonomy: {\n    primarySkillAtomId: "${unit.primarySkillAtomId}",\n    secondarySkillAtomIds: [],\n    learningStage: "${unit.learningStage}",\n    patternVariantId: "OPTIONAL",\n    problemArchetypeId: "OPTIONAL"\n  }\n}\n\`\`\`\n\nThis is an authoring shape example, not a real question. Do not copy placeholder values into canonical ingress.\n\n## Review checklist\n\n- [ ] The primary skill atom is the exact ID in this stub.\n- [ ] The selected family, variant, and archetype are legal for this unit.\n- [ ] The item tests reasoning rather than keyword matching.\n- [ ] Feedback explains every incorrect choice where required.\n- [ ] A canonical source JSON will be created only after manual authoring and review.\n`;
}

function renderPlan(taxonomy, node) {
  const units = taxonomy.mentalUnits.filter((unit) => unit.roadmapNodeId === node.id);
  const involvedFamilies = [...new Set(units.flatMap((unit) => unit.legalPatternFamilyIds))];
  const primaryFamily = node.primaryPatternFamilyId ?? "None — cross-family node";
  const unitSections = units.map((unit) => {
    const falseIds = heuristicIds(taxonomy, unit);
    const stubPath = `planning/algorithms/question-stubs/${node.id}/${unit.id}.md`;
    return `### \`${unit.id}\`\n\n- Unit kind: \`${unit.unitKind}\`\n- Primary skill atom: \`${unit.primarySkillAtomId}\`\n- Learning stage: \`${unit.learningStage}\`\n- Legal pattern families: ${unit.legalPatternFamilyIds.map((id) => `\`${id}\``).join(", ")}\n- Allowed pattern variants: ${unit.patternVariantIds.length ? unit.patternVariantIds.map((id) => `\`${id}\``).join(", ") : "none"}\n- Allowed problem archetypes: ${unit.problemArchetypeIds.length ? unit.problemArchetypeIds.map((id) => `\`${id}\``).join(", ") : "none"}\n- Relevant false heuristics: ${falseIds.length ? falseIds.map((id) => `\`${id}\``).join(", ") : "none declared"}\n- Exact authoring intent: diagnose \`${unit.primarySkillAtomId}\` without changing \`${unit.id}\` into a multi-unit batch.\n- Required question coverage: recognition, reasoning or mechanics, relevant boundaries, mistake review, and transfer where meaningful.\n- Common mistakes to diagnose: ${falseIds.length ? falseIds.map((id) => `\`${id}\``).join(", ") : "derive plausible distractors from the declared family boundary"}.\n- Forbidden duplication: do not make another unit’s primary skill the item’s primary target.\n- Target stub path: \`${stubPath}\`\n- Future canonical source path: \`${sourcePath(node, unit)}\``;
  }).join("\n\n");
  const crossFamilyRule = node.contentOwnership === "cross_family"
    ? "Questions may belong to this roadmap node and have their own canonical batches, but must select one legal pattern family from the unit. This node does not create a pattern family."
    : "Each future canonical batch stays within one roadmap node, one primary mental unit, and one selected legal pattern family.";
  return `# ${title(node.id)}\n\n## Identity\n\n- Roadmap node ID: \`${node.id}\`\n- Order: ${node.order}\n- Content ownership: \`${node.contentOwnership}\`\n- Default learning stage: \`${node.defaultLearningStage}\`\n- Primary pattern family: ${primaryFamily === "None — cross-family node" ? primaryFamily : `\`${primaryFamily}\``}\n- Involved pattern families: ${involvedFamilies.map((id) => `\`${id}\``).join(", ")}\n- Prerequisites: ${node.prerequisiteNodeIds.length ? node.prerequisiteNodeIds.map((id) => `\`${id}\``).join(", ") : "none declared"}\n\n## Learning goal\n\nEnable the learner to apply the primary skills of this node with the correct family boundary and learning-stage expectation.\n\n## Boundaries\n\n### Includes\n\n- Mental units structurally owned by \`${node.id}\`.\n- Legal pattern families and related variants or archetypes declared by the taxonomy.\n- Diagnostic reasoning tied to the unit’s primary skill atom.\n\n### Excludes\n\n- A question whose primary diagnostic target belongs to another mental unit.\n- A synthetic pattern family for strategy selection or contrast work.\n- Production source JSON until manually authored content exists.\n\n## Mental units\n\n${unitSections}\n\n## Question authoring contract\n\n${crossFamilyRule} Each item has exactly one primary mental unit and one primary skill atom. Its learning stage must equal the unit’s declared learning stage; selected variants and archetypes must be legal for the selected family.\n\n## Interaction guidance\n\nUse choice interactions for diagnostic decisions, ordering for ordered state transitions or invariants, and complexity interactions for explicit cost-model reasoning. Do not require every interaction type for every unit.\n\n## Coverage model\n\nEvery unit should eventually cover recognition, mechanics or reasoning, edge cases, mistake review, and transfer or variation when meaningful. Target item count: NOT_YET_APPROVED.\n\n## Completion criteria\n\nThis node is not production-ready until its item counts are approved, real questions receive manual review, technical evidence is emitted, approvals and activation exist, and a release artifact is built.\n`;
}

function renderReadme() {
  return `# Algorithms authoring workflow\n\nThis directory is a readable projection of the canonical structural taxonomy in \`config/taxonomy/algorithms.json\`. IDs and metadata are rendered from that SOT; do not use these files as a second taxonomy registry.\n\n1. Choose a node plan.\n2. Approve target item counts for its mental units.\n3. Work one mental unit at a time.\n4. Copy the matching stub into the authoring session.\n5. Generate questions manually with human review.\n6. Create canonical source JSON only when it contains at least one real item.\n7. Run inspection and validation.\n8. Correct substantive issues manually.\n9. Commit technical inputs.\n10. Emit technical evidence.\n11. Commit evidence.\n12. Complete manual editorial review.\n13. Create approvals and activation.\n14. Commit the final release candidate.\n15. Build the artifact.\n\nCodex may scaffold and validate. Codex must not author or repair production questions.\n`;
}

function renderRationale() {
  return `# Algorithms taxonomy rationale\n\n## Diagnostic granularity\n\nEach item has one primary skill atom so an observed error can be assigned to a concrete skill. Secondary skill atoms may support an item but cannot replace the primary target.\n\n## Block before comparison\n\nTeach foundational mechanisms in coherent mental-unit batches before using interleaving or contrasts to discriminate among similar mechanisms.\n\n## Similarity-driven contrasts\n\nA contrast is warranted when learners can plausibly confuse two mechanisms and need an explicit decision boundary. The taxonomy therefore contains the five specified contrast nodes.\n\n## Retrieval and reasoning\n\nPrefer strategy choice, next-step prediction, solution comparison, mistake diagnosis, complexity justification, boundary reasoning, and transfer over recall of names.\n\n## No keyword classification\n\nDo not teach \`subarray → sliding window\`, \`sorted → binary search\`, \`pair → two pointers\`, or \`top k → heap\` as unconditional rules. Every pattern signal needs a correctness condition.\n\n## References\n\n- Brunmair & Richter (2019), *Similarity matters: A meta-analysis of interleaved learning and its moderators*. DOI: 10.1037/bul0000209\n- Carvalho & Goldstone (2014), *Putting category learning in order*. DOI: 10.3758/s13421-013-0371-0\n- Carvalho & Goldstone (2017), *The sequence of study changes what information is attended to, encoded, and remembered during category learning*. DOI: 10.1037/xlm0000406\n\nThese studies support learning-organization principles; they do not prescribe Patternly’s roadmap, which remains a versioned product decision.\n`;
}

function renderOutputs(taxonomy) {
  const outputs = new Map();
  outputs.set("README.md", renderReadme());
  outputs.set("taxonomy-rationale.md", renderRationale());
  const nodeIndex = { schemaVersion: 1, taxonomyVersion: taxonomy.taxonomyVersion, nodes: [] };
  const stubIndex = { schemaVersion: 1, taxonomyVersion: taxonomy.taxonomyVersion, stubs: [] };
  for (const node of [...taxonomy.roadmapNodes].sort((left, right) => left.order - right.order)) {
    const planPath = `planning/algorithms/nodes/${String(node.order).padStart(2, "0")}-${kebab(node.id)}.md`;
    const relativePlanPath = relative("planning/algorithms", planPath);
    const units = taxonomy.mentalUnits.filter((unit) => unit.roadmapNodeId === node.id);
    const unitStubPaths = units.map((unit) => `planning/algorithms/question-stubs/${node.id}/${unit.id}.md`);
    nodeIndex.nodes.push({ order: node.order, nodeId: node.id, contentOwnership: node.contentOwnership, planPath, unitStubPaths });
    outputs.set(relativePlanPath, renderPlan(taxonomy, node));
    for (const unit of units) {
      const path = `planning/algorithms/question-stubs/${node.id}/${unit.id}.md`;
      const relativeStubPath = relative("planning/algorithms", path);
      const futureCanonicalSourcePath = sourcePath(node, unit);
      stubIndex.stubs.push({ roadmapNodeId: node.id, unitKind: unit.unitKind, unitId: unit.id, path, futureCanonicalSourcePath });
      outputs.set(relativeStubPath, renderStub(taxonomy, node, unit));
    }
  }
  outputs.set("node-authoring-index.json", `${JSON.stringify(nodeIndex, null, 2)}\n`);
  outputs.set("question-stub-index.json", `${JSON.stringify(stubIndex, null, 2)}\n`);
  return outputs;
}

async function ensureExactOutputs(outputs, write) {
  const expected = new Set(outputs.keys());
  const actual = new Set((await files(PLANNING_ROOT)).map((path) => relative(PLANNING_ROOT, path)));
  const unexpected = [...actual].filter((path) => !expected.has(path));
  if (unexpected.length) throw new Error(`ORPHAN_ALGORITHMS_PLANNING_FILES:${unexpected.sort(compare).join(",")}`);
  for (const [path, content] of outputs) {
    const target = join(PLANNING_ROOT, path);
    if (write) { await mkdir(dirname(target), { recursive: true }); await writeFile(target, content); continue; }
    let existing;
    try { existing = await readFile(target, "utf8"); } catch (error) { if (error.code === "ENOENT") throw new Error(`MISSING_ALGORITHMS_PLANNING_FILE:${path}`); throw error; }
    if (existing !== content) throw new Error(`STALE_ALGORITHMS_PLANNING_FILE:${path}`);
  }
}

export async function generateAlgorithmsPlanning({ write = false } = {}) {
  const taxonomy = JSON.parse(await readFile(TAXONOMY_PATH, "utf8"));
  assertTaxonomy(taxonomy);
  const outputs = renderOutputs(taxonomy);
  await ensureExactOutputs(outputs, write);
  return { nodePlanCount: taxonomy.roadmapNodes.length, stubCount: taxonomy.mentalUnits.length, outputCount: outputs.size };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const write = process.argv.slice(2).includes("--write");
  const result = await generateAlgorithmsPlanning({ write });
  process.stdout.write(`${JSON.stringify(result)}\n`);
}
