// Read-only integrity check for CC-01 evidence; never grants semantic approval.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonicalJson, sha256, validateTrack } from '../build.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const trackId = 'claude-certified-architect-professional-certification';
const args = process.argv.slice(2);
function option(name) {
  const i = args.indexOf(name);
  return i < 0 ? undefined : args[i + 1];
}
function requireFact(condition, category, id = '') {
  if (!condition) throw new Error(`${category}${id ? `: ${id}` : ''}`);
}
function unique(values, category) {
  requireFact(Array.isArray(values) && new Set(values).size === values.length, category);
}
function bound(base, relative) {
  const resolved = path.resolve(base, relative);
  requireFact(resolved.startsWith(`${path.resolve(base)}${path.sep}`), 'path_outside_input');
  return resolved;
}
function sameSet(left, right, category) {
  unique(left, category); unique(right, category);
  requireFact(canonicalJson([...left].sort()) === canonicalJson([...right].sort()), category);
}

try {
  const courseRoot = option('--course-root');
  requireFact(typeof courseRoot === 'string' && courseRoot.length > 0, 'usage: --course-root <materialy-v2> [--report <map.json>]');
  const reportPath = option('--report') ?? path.join(root, 'docs/evidence/content-audits/2026-10-11-claude-course-map.json');
  const report = JSON.parse(await readFile(reportPath, 'utf8'));
  requireFact(report.trackId === trackId && report.schemaVersion === 'cc01-course-map-v1', 'report_identity');
  const current = await validateTrack({ rootDirectory: root, trackId });
  requireFact(report.contentVersion === current.track.contentVersion, 'content_version_changed');
  requireFact(report.objectiveRegistrySha256 === sha256(await readFile(path.join(root, 'config/certification-objective-registries', `${trackId}.json`))), 'objective_registry_changed');
  sameSet(report.sourceFiles.map(x => x.path), current.sourceFiles.map(x => path.relative(root, x)), 'source_file_set_changed');
  for (const file of report.sourceFiles) {
    requireFact(sha256(await readFile(bound(root, file.path))) === file.sha256, 'source_file_changed', file.path);
  }
  const questions = new Map(current.questions.map(q => [q.questionId, q]));
  sameSet(report.questions.map(q => q.questionId), [...questions.keys()], 'question_inventory_mismatch');
  requireFact(report.inventorySha256 === sha256(canonicalJson([...current.questions].sort((a, b) => a.questionId.localeCompare(b.questionId)))), 'inventory_digest_changed');
  sameSet(report.modules.map(m => m.moduleId), ['M1', 'M2', 'M3', 'M4', 'M5'], 'module_inventory');
  const modules = new Map(report.modules.map(m => [m.moduleId, m]));
  const sections = new Map();
  const courseLinksBytes = await readFile(path.join(courseRoot, 'links.json'));
  requireFact(sha256(courseLinksBytes) === report.courseLinksSha256, 'course_links_changed');
  const courseLinks = JSON.parse(courseLinksBytes);
  for (const module of report.modules) {
    const material = await readFile(bound(courseRoot, module.materialPath), 'utf8');
    const manifestBytes = await readFile(bound(courseRoot, module.manifestPath));
    requireFact(sha256(material) === module.materialSha256 && sha256(manifestBytes) === module.manifestSha256, 'course_input_changed', module.moduleId);
    const manifest = JSON.parse(manifestBytes);
    requireFact(module.lessonUrl === manifest.url && module.title === manifest.title && Object.hasOwn(courseLinks, module.url), 'module_link_mismatch', module.moduleId);
    requireFact(new URL(module.url).protocol === 'https:' && new URL(module.url).hostname === 'anthropic-partners.skilljar.com', 'invalid_course_url', module.moduleId);
    const actualSections = [...material.matchAll(/^## (\d+)\. (.+)$/gm)].map(match => ({ sectionId: `${module.moduleId}-S${match[1].padStart(2, '0')}`, title: match[2] }));
    sameSet(module.sections.map(s => s.sectionId), actualSections.map(s => s.sectionId), 'section_inventory');
    for (const section of module.sections) {
      requireFact(section.title === actualSections.find(s => s.sectionId === section.sectionId).title, 'section_title_mismatch', section.sectionId);
      requireFact(!sections.has(section.sectionId), 'duplicate_section', section.sectionId);
      sections.set(section.sectionId, section);
    }
  }
  unique(report.objectives.map(o => o.objectiveId), 'duplicate_objective');
  const objectives = new Map(report.objectives.map(o => [o.objectiveId, o]));
  sameSet([...objectives.keys()], [6, 5, 5, 5, 3].flatMap((count, index) => Array.from({ length: count }, (_, i) => `M${index + 1}-O${String(i + 1).padStart(2, '0')}`)), 'formal_objective_inventory');
  const referencedQuestions = ids => ids.forEach(id => requireFact(questions.has(id), 'unknown_question_reference', id));
  const referencedSections = ids => ids.forEach(id => requireFact(sections.has(id), 'unknown_section_reference', id));
  for (const objective of report.objectives) {
    requireFact(modules.has(objective.moduleId), 'unknown_objective_module', objective.objectiveId);
    referencedSections(objective.sectionIds);
    referencedQuestions(objective.questionIds);
    unique(objective.facets.map(f => f.id), 'duplicate_facet');
    for (const facet of objective.facets) {
      requireFact(['covered', 'partial', 'missing', 'excluded'].includes(facet.status), 'invalid_coverage_status', facet.id);
      referencedSections(facet.sectionIds); referencedQuestions(facet.questionIds);
      requireFact(facet.status !== 'covered' || facet.questionIds.length > 0, 'covered_without_evidence', facet.id);
    }
    const actual = report.questions.filter(q => q.objectiveIds.includes(objective.objectiveId)).map(q => q.questionId);
    sameSet(objective.questionIds, actual, 'objective_reverse_index_mismatch');
  }
  for (const question of report.questions) {
    const original = questions.get(question.questionId);
    requireFact(question.nodeId === original.nodeId && question.mentalUnitId === original.mentalUnitId, 'taxonomy_mismatch', question.questionId);
    requireFact(question.questionSha256 === sha256(canonicalJson(original)), 'question_changed', question.questionId);
    requireFact(modules.has(question.moduleId), 'unknown_question_module', question.questionId);
    requireFact(question.courseUrl === modules.get(question.moduleId).url, 'question_course_url_mismatch', question.questionId);
    requireFact(question.documentationUrl === original.feedback.details.url, 'documentation_url_mismatch', question.questionId);
    requireFact(question.sectionIds.length > 0 && question.sectionIds.some(id => id.startsWith(`${question.moduleId}-`)), 'primary_module_section_missing', question.questionId);
    unique(question.sectionIds, 'duplicate_question_section'); referencedSections(question.sectionIds);
    requireFact(question.objectiveIds.length > 0, 'question_objective_missing', question.questionId);
    requireFact(question.objectiveIds.includes(question.primaryObjectiveId) && objectives.get(question.primaryObjectiveId)?.moduleId === question.moduleId, 'primary_objective_mismatch', question.questionId);
    unique(question.objectiveIds, 'duplicate_question_objective');
    question.objectiveIds.forEach(id => requireFact(objectives.has(id), 'unknown_objective_reference', id));
    requireFact(['direct', 'adjacent'].includes(question.alignment) && typeof question.rationale === 'string' && question.rationale.trim().length > 20, 'question_rationale_missing', question.questionId);
  }
  sameSet(report.units.map(u => u.mentalUnitId), [...new Set(current.questions.map(q => q.mentalUnitId))], 'unit_inventory_mismatch');
  for (const unit of report.units) {
    sameSet(unit.questionIds, current.questions.filter(q => q.mentalUnitId === unit.mentalUnitId).map(q => q.questionId), 'unit_reverse_index_mismatch');
  }
  console.log(JSON.stringify({ status: 'PASS', boundary: 'input_identity_and_mapping_integrity_only', questions: questions.size, units: report.units.length, objectives: objectives.size, sections: sections.size, modules: modules.size }));
} catch (error) {
  console.error(`CC01 verification failed: ${error.message}`);
  process.exitCode = 1;
}
