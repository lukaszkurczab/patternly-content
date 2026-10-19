// Summarize current source links and taxonomy against the live objective registry.
// This reports source coverage only; it does not claim course approval or semantic review.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { validateTrack } from "../build.mjs";

const ROOT = path.resolve(fileURLToPath(new URL("../../", import.meta.url)));
const TRACK_ID = "claude-certified-architect-professional-certification";

export async function inspectCurrentClaudeCourseMap({ rootDirectory = ROOT } = {}) {
  const root = path.resolve(rootDirectory);
  const [current, registry] = await Promise.all([
    validateTrack({ rootDirectory: root, trackId: TRACK_ID }),
    readFile(path.join(root, "config/certification-objective-registries", `${TRACK_ID}.json`), "utf8").then(JSON.parse),
  ]);
  const officialObjectives = new Set(registry.objectives.map(({ objectiveId }) => objectiveId));
  const unitIds = [...new Set(current.questions.map(({ mentalUnitId }) => mentalUnitId))].sort();
  const mappedUnits = [];
  const unmappedUnits = [];
  for (const mentalUnitId of unitIds) {
    const parsed = /^CCARP-D([0-9]+)-O([0-9]+)$/u.exec(mentalUnitId);
    const objectiveId = parsed ? `ccarp-${Number(parsed[1])}.${Number(parsed[2])}` : null;
    if (objectiveId && officialObjectives.has(objectiveId)) mappedUnits.push({ mentalUnitId, objectiveId });
    else unmappedUnits.push(mentalUnitId);
  }

  const missingCourseLinkCount = current.questions.filter(({ feedback }) => !feedback?.course).length;
  const urlToModule = new Map();
  const moduleToUrl = new Map();
  const invalidCourseLinks = [];
  for (const question of current.questions) {
    const course = question.feedback?.course;
    if (!course) continue;
    const section = /^M([1-9])-S[0-9]+:/u.exec(course.section ?? "");
    let validUrl = false;
    try {
      const url = new URL(course.url);
      validUrl = url.protocol === "https:" && url.hostname === "anthropic-partners.skilljar.com"
        && url.pathname.startsWith("/path/claude-certified-architect-professional/");
    } catch { /* reported below as an invalid source link */ }
    if (!section || !validUrl) {
      invalidCourseLinks.push(question.questionId);
      continue;
    }
    const moduleId = `M${section[1]}`;
    if (urlToModule.has(course.url) && urlToModule.get(course.url) !== moduleId) invalidCourseLinks.push(question.questionId);
    if (moduleToUrl.has(moduleId) && moduleToUrl.get(moduleId) !== course.url) invalidCourseLinks.push(question.questionId);
    urlToModule.set(course.url, moduleId);
    moduleToUrl.set(moduleId, course.url);
  }
  if (invalidCourseLinks.length) throw new Error(`current_course_link_contract_invalid:${[...new Set(invalidCourseLinks)].length}`);

  return {
    schemaVersion: "patternly-current-claude-course-map-v1",
    status: missingCourseLinkCount || unmappedUnits.length ? "CURRENT_SOURCE_WITH_UNMAPPED_ITEMS" : "CURRENT_SOURCE_MAPPED",
    boundary: "Current source link and taxonomy coverage only; no semantic approval or external course verification claimed.",
    trackId: TRACK_ID,
    contentVersion: current.track.contentVersion,
    questionCount: current.questions.length,
    courseLinkedQuestionCount: current.questions.length - missingCourseLinkCount,
    missingCourseLinkCount,
    currentCourseCount: urlToModule.size,
    mappedObjectiveUnitCount: mappedUnits.length,
    unmappedObjectiveUnits: unmappedUnits,
    objectiveRegistryCount: officialObjectives.size,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    process.stdout.write(`${JSON.stringify(await inspectCurrentClaudeCourseMap(), null, 2)}\n`);
  } catch (error) {
    console.error(`Current Claude course-map check failed: ${error.message}`);
    process.exitCode = 1;
  }
}
