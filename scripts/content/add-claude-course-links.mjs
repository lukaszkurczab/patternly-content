import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = relative => JSON.parse(readFileSync(path.join(root, relative), 'utf8'));
export const trackId = 'claude-certified-architect-professional-certification';
const original = read('docs/evidence/content-audits/2026-10-11-claude-course-map.json');
const closure = read('docs/evidence/content-audits/2026-10-11-cc02-content-coverage.json');
const mappings = new Map([...original.questions, ...closure.questionMappings].map(item => [item.questionId, item]));
const modules = new Map(original.modules.map(item => [item.moduleId, item]));
export function courseForQuestion(questionId) {
  const mapping = mappings.get(questionId);
  if (!mapping) throw new Error(`Missing course mapping: ${questionId}`);
  const module = modules.get(mapping.moduleId);
  if (!module) throw new Error(`Unknown course module: ${mapping.moduleId}`);
  const section = mapping.sectionIds.map(id => {
    const entry = module.sections.find(item => item.sectionId === id);
    if (!entry) throw new Error(`Unknown course section: ${id}`);
    return `${id}: ${entry.title}`;
  }).join('; ');
  return { title: module.title, url: module.url, section, requiresAccount: true };
}
export function checkOrWriteCourseLinks(write = false) {
  const directory = path.join(root, 'content', trackId);
  const seen = new Set();
  for (const node of readdirSync(directory)) {
    for (const file of readdirSync(path.join(directory, node)).filter(name => name.endsWith('.json'))) {
      const filename = path.join(directory, node, file);
      const questions = JSON.parse(readFileSync(filename, 'utf8'));
      for (const question of questions) {
        if (seen.has(question.questionId)) throw new Error(`Duplicate question: ${question.questionId}`);
        seen.add(question.questionId);
        const expected = courseForQuestion(question.questionId);
        if (write) question.feedback.course = expected;
        else if (JSON.stringify(question.feedback.course) !== JSON.stringify(expected)) throw new Error(`Course link differs from accepted map: ${question.questionId}`);
      }
      if (write) writeFileSync(filename, `${JSON.stringify(questions)}\n`);
    }
  }
  if (seen.size !== mappings.size) throw new Error('Course mapping inventory differs from canonical inventory');
  return seen.size;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(`${process.argv.includes('--write') ? 'Updated' : 'Verified'} ${checkOrWriteCourseLinks(process.argv.includes('--write'))} Claude course links`);
}
