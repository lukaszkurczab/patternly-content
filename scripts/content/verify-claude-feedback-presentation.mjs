// Run with the frontend's tsx loader; README in the audit evidence records the command.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const frontendRoot = process.env.PATTERNLY_FRONTEND_ROOT;
if (!frontendRoot) throw new Error('Set PATTERNLY_FRONTEND_ROOT to the application checkout.');
const load = async relative => {
  const module = await import(pathToFileURL(path.join(frontendRoot, relative)).href);
  return module.default ?? module;
};
const { buildCanonicalInteractionViewModel, composeCanonicalFeedback } = await load('src/application/canonical/canonicalInteractionPresentation.ts');
const { scoreCanonicalQuestion } = await load('src/content/canonical/questionScoring.ts');
const questions = JSON.parse(readFileSync(new URL('../../content/claude-certified-architect-professional-certification/solution_design_and_architecture/CCARP-D01-O01.json', import.meta.url), 'utf8'));
const question = questions.find(q => q.questionId === 'CCARP-D01-O01-transfer');
assert.ok(question, 'Transfer question must exist');
const ids = question.interaction.options.map(option => option.optionId);
function permutations(ids) {
  return ids.length ? ids.flatMap((id, index) => permutations(ids.filter((_, i) => i !== index)).map(rest => [id, ...rest])) : [[]];
}
let checks = 0;
for (const order of permutations(ids)) {
  for (let bits = 0; bits < 2 ** ids.length; bits++) {
    const response = { type: 'choice_multiple', optionIds: ids.filter((_, i) => bits & (1 << i)) };
    const view = buildCanonicalInteractionViewModel(question, response, order);
    assert.deepEqual(view.renderer.options.map(option => option.id), order);
    const feedback = composeCanonicalFeedback(question, response);
    const expectedTargets = question.feedback.messages.filter(message => message.kind === 'omitted_option'
      ? !response.optionIds.includes(message.targetId) && question.answer.optionIds.includes(message.targetId)
      : response.optionIds.includes(message.targetId) && !question.answer.optionIds.includes(message.targetId));
    assert.deepEqual(feedback.messages, expectedTargets);
    for (const message of feedback.messages) assert.doesNotMatch(message.text, /Without [bd]\b/);
    const shuffled = { ...question, interaction: { ...question.interaction, options: order.map(id => question.interaction.options.find(option => option.optionId === id)) } };
    assert.deepEqual(scoreCanonicalQuestion(shuffled, response), scoreCanonicalQuestion(question, response));
    checks++;
  }
}
console.log(`Actual app presentation/scoring: ${checks} permutation/subset cases PASS`);
