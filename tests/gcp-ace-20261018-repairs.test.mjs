import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { scoreQuestion, validateQuestion } from '../scripts/content/question-contract.mjs';

const root = new URL('../', import.meta.url);
const contentDir = 'content/google-cloud-associate-cloud-engineer/cloud_identity_workforce_federation_and_human_access';
const baseline = 'ad3738067818d4e3caa6495943bc9e9b0d6f6c2a';
const blocks = [18, 18, 18, 20, 18, 20, 18];
const fileNames = Array.from({ length: 7 }, (_, i) => `GCPACE-N02-B${String(i + 1).padStart(2, '0')}.json`);
const beforeHashes = {
  'GCPACE-N02-B01.json': '15f99398039c5de311718dca4aac63ef83c3a7c021c02a716dbfff44b7bec1e0',
  'GCPACE-N02-B02.json': 'c7da2cda9d2c991875fa4e7bb1a5356f85c0441c7a29194c6de82ac2d174bc9e',
  'GCPACE-N02-B03.json': 'a85c4e5cdff3409b5c0a8e6b3f93cd1ff45b97e9cf016dc6d777803a28ec879d',
  'GCPACE-N02-B04.json': '99e2698ac21f12be9fc0fad13386c9143285c9189f6291eb3cce715e7037178f',
  'GCPACE-N02-B05.json': 'db1caa7256558c50c77f8765c58832074d255d5afea5619e2751c072a444ae46',
  'GCPACE-N02-B06.json': 'c2c139a89a814d6ccb802fb68bb770c35def583c304765dfde26c652897b90c9',
  'GCPACE-N02-B07.json': '389ecf44020fd01a869e529d6e597e90f74e741f719f8e7b00a4112c0be7d861',
};
const targetRepairs = new Map([
  ['gcp-ace-gcpace-n02-b01-001', ['B', 'project_binding_only', 'D']],
  ['gcp-ace-gcpace-n02-b02-001', ['individual_viewer_bindings', 'group_editor_binding', 'shared_employee_login']],
  ['gcp-ace-gcpace-n02-b03-002', ['sync_cloud_identity_users', 'provision_on_first_login', 'cloud_identity_sso_accounts']],
  ['gcp-ace-gcpace-n02-b04-011', ['compute_role_wrong_project', 'project_owner_grant', 'workforce_provider_mapping']],
  ['gcp-ace-gcpace-n02-b05-016', ['workforce_for_automation', 'workload_for_employees', 'shared_managed_identity']],
  ['gcp-ace-gcpace-n02-b06-002', ['attribute_condition_only', 'iam_principal_expression', 'provider_audience']],
  ['gcp-ace-gcpace-n02-b07-008', ['direct_binding_audit', 'nested_group_membership', 'ancestor_policy_only']],
]);
const questions = fileNames.flatMap((file) => JSON.parse(readFileSync(new URL(`${contentDir}/${file}`, root), 'utf8')));
const byId = new Map(questions.map((q) => [q.questionId, q]));
const sourceQuestion = (file, id) => JSON.parse(execFileSync('git', ['show', `${baseline}:${contentDir}/${file}`], { cwd: new URL('../', import.meta.url), encoding: 'utf8' })).find((q) => q.questionId === id);
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const changedPaths = (before, after, prefix = '') => {
  if (Object.is(before, after)) return [];
  if (!before || !after || typeof before !== 'object' || typeof after !== 'object' || Array.isArray(before) !== Array.isArray(after)) return [prefix];
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  return [...keys].flatMap((key) => changedPaths(before[key], after[key], prefix ? `${prefix}.${key}` : key));
};
const allowlisted = (id, path) => {
  if (path === 'feedback.messages' || path.startsWith('feedback.messages.') || path === 'feedback.details.transfer') return true;
  const isOptionPath = path === 'interaction.options' || path.startsWith('interaction.options.');
  if (id === 'gcp-ace-gcpace-n02-b05-019') return ['questionId', 'prompt', 'answer.optionId', 'feedback.reason', 'feedback.details.'].some((prefix) => prefix.endsWith('.') ? path.startsWith(prefix) : path === prefix) || path.startsWith('sourceRefs.') || isOptionPath;
  if (id === 'gcp-ace-gcpace-n02-b05-007') return ['prompt', 'feedback.reason', 'feedback.details.'].some((prefix) => prefix.endsWith('.') ? path.startsWith(prefix) : path === prefix) || isOptionPath;
  if (id === 'gcp-ace-gcpace-n02-b06-005') return ['prompt', 'feedback.reason', 'feedback.details.scenarioApplication'].includes(path);
  if (id === 'gcp-ace-gcpace-n02-b02-001') return ['prompt'].includes(path) || isOptionPath;
  if (['gcp-ace-gcpace-n02-b01-001', 'gcp-ace-gcpace-n02-b03-002', 'gcp-ace-gcpace-n02-b04-011', 'gcp-ace-gcpace-n02-b05-016', 'gcp-ace-gcpace-n02-b06-002', 'gcp-ace-gcpace-n02-b07-008'].includes(id)) return isOptionPath;
  return false;
};

test('original seven source files match the audited baseline and the repair remains in its allowlist', () => {
  for (const name of fileNames) {
    const source = execFileSync('git', ['show', `${baseline}:${contentDir}/${name}`], { cwd: new URL('../', import.meta.url) });
    assert.equal(sha256(source), beforeHashes[name], name);
    const actual = readFileSync(new URL(`${contentDir}/${name}`, root));
    const changed = execFileSync('git', ['diff', '--name-only', baseline, '--', `${contentDir}/${name}`], { cwd: new URL('../', import.meta.url), encoding: 'utf8' });
    assert.equal(changed.trim(), `${contentDir}/${name}`);
    assert.ok(actual.length > 0);
  }
  assert.equal(questions.length, 130);
  assert.deepEqual([...byId.keys()].filter((id) => id === 'gcp-ace-gcpace-n02-b05-010'), []);
  assert.ok(byId.has('gcp-ace-gcpace-n02-b05-019'));
  assert.equal(questions.reduce((n, q) => n + q.feedback.messages.length, 0), 390);
  const b05 = JSON.parse(readFileSync(new URL(`${contentDir}/GCPACE-N02-B05.json`, root), 'utf8'));
  const originalB05 = JSON.parse(execFileSync('git', ['show', `${baseline}:${contentDir}/GCPACE-N02-B05.json`], { cwd: new URL('../', import.meta.url), encoding: 'utf8' }));
  assert.deepEqual(b05.map((q) => q.questionId), originalB05.map((q) => q.questionId === 'gcp-ace-gcpace-n02-b05-010' ? 'gcp-ace-gcpace-n02-b05-019' : q.questionId).sort());
  const evidence = JSON.parse(readFileSync(new URL('evidence/business-quality/gcp-ace-20261018-targeted-corrections.json', root), 'utf8'));
  for (const name of fileNames) assert.equal(sha256(readFileSync(new URL(`${contentDir}/${name}`, root))), evidence.afterSha256[name]);
});

test('P1 directory, revocation, and independent-issuer decisions preserve their intended boundaries', () => {
  const directory = byId.get('gcp-ace-gcpace-n02-b05-007');
  assert.equal(directory.prompt, 'A company requires employee accounts to exist as managed user objects in its Cloud Identity directory, and administrators must suspend those objects during approved leave. Which identity model satisfies this requirement?');
  assert.deepEqual(directory.interaction.options.map(({ optionId, text }) => [optionId, text]), [
    ['A', 'Cloud Identity-managed employee users with directory lifecycle administration.'],
    ['B', 'Workforce Identity Federation that relies only on an external IdP without managed Cloud Identity user objects.'],
    ['C', 'A shared service account'],
    ['D', 'A project ID'],
  ]);
  assert.equal(directory.answer.optionId, 'A');
  assert.match(directory.feedback.details.boundaryOrTradeoff, /If suspension belongs only in the external IdP/);
  assert.match(directory.feedback.details.boundaryOrTradeoff, /separate control/);
  assert.match(directory.feedback.messages.find((m) => m.targetId === 'B').text, /do not provide the managed Cloud Identity user object/);

  const revoke = byId.get('gcp-ace-gcpace-n02-b05-019');
  assert.equal(revoke.prompt, "An employee is disabled in the external IdP used by Workforce Identity Federation. Security requires immediate termination of the employee's existing Google Cloud workforce sessions and no alternate access path. What additional action is required?");
  assert.deepEqual(revoke.interaction.options.map((o) => o.optionId), ['revoke_subject_sessions', 'disable_idp_only', 'delete_whole_pool', 'remove_vm_service_account_key']);
  assert.equal(revoke.answer.optionId, 'revoke_subject_sessions');
  assert.match(revoke.feedback.reason, /immediate termination.*explicit subject session revocation/);
  assert.match(revoke.feedback.details.boundaryOrTradeoff, /does not prevent a fresh login while the user remains active at the IdP/);
  assert.match(revoke.feedback.messages.find((m) => m.targetId === 'disable_idp_only').text, /does not itself guarantee that already-issued workforce sessions end immediately/);
  assert.match(revoke.feedback.details.transfer, /active again after revocation.*fresh login can issue new workforce sessions/);
  assert.ok(revoke.sourceRefs.includes('https://docs.cloud.google.com/iam/docs/workforce-revoke-sessions'));

  const provider = byId.get('gcp-ace-gcpace-n02-b06-005');
  const beforeProvider = sourceQuestion('GCPACE-N02-B06.json', provider.questionId);
  assert.equal(provider.prompt, 'A workforce identity pool already contains an OIDC provider for IdP A. Administrators need to add a second independent OIDC issuer, IdP B. What should they verify before configuring the additional provider?');
  assert.equal(provider.answer.optionId, 'A');
  assert.deepEqual(provider.interaction.options.map((o) => [o.optionId, o.text]), beforeProvider.interaction.options.map((o) => [o.optionId, o.text]));
  assert.match(provider.feedback.reason, /Each OIDC workforce provider has its own issuer and audience/);
  assert.match(provider.feedback.details.scenarioApplication, /validate its token issuer and aud claim/);
  assert.match(provider.feedback.messages.find((m) => m.targetId === 'B').text, /A VM image cannot establish whether IdP B’s issuer and audience are trusted/);
  const claimMapping = byId.get('gcp-ace-gcpace-n02-b06-002');
  assert.equal(claimMapping.feedback.messages.find((m) => m.targetId === 'attribute_condition_only').text, 'An attribute condition filters admission using raw claims or mapped attributes; it does not create the Google Cloud attribute mapping that the IAM expression needs. Configure claim-to-attribute mapping.');
});

test('the exact 130-row source ledger maps to 130 final questions with one successor and A-key preservation', () => {
  const originalIds = blocks.flatMap((count, index) => Array.from({ length: count }, (_, i) => `gcp-ace-gcpace-n02-b${String(index + 1).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`));
  const expectedFinalIds = originalIds.map((id) => id === 'gcp-ace-gcpace-n02-b05-010' ? 'gcp-ace-gcpace-n02-b05-019' : id).sort();
  assert.deepEqual([...byId.keys()].sort(), expectedFinalIds);
  for (const oldId of originalIds.filter((id) => id !== 'gcp-ace-gcpace-n02-b05-010')) {
    const q = byId.get(oldId);
    assert.equal(q.answer.optionId, 'A', oldId);
    assert.equal(q.interaction.type, 'choice_single', oldId);
    assert.equal(q.interaction.scoringMethod, 'exact_selected_set', oldId);
    assert.equal(q.feedback.messages.length, 3, oldId);
    assert.ok(q.feedback.details.transfer.trim().length > 0, oldId);
    assert.doesNotMatch(q.feedback.details.transfer, /reassess the .* boundary before reusing the answer/i, oldId);
  }
  const original = sourceQuestion('GCPACE-N02-B05.json', 'gcp-ace-gcpace-n02-b05-010');
  const successor = byId.get('gcp-ace-gcpace-n02-b05-019');
  assert.equal(original.answer.optionId, 'A');
  assert.equal(successor.answer.optionId, 'revoke_subject_sessions');
  assert.notDeepEqual(successor.interaction.options.map((o) => o.optionId), original.interaction.options.map((o) => o.optionId));
  assert.equal(successor.mentalUnitId, original.mentalUnitId);
  assert.equal(successor.nodeId, original.nodeId);
  assert.equal(successor.trackId, original.trackId);
  assert.deepEqual(successor.constraints, original.constraints);
});

test('all repaired feedback follows the current wrong-option IDs and scoring remains position independent', () => {
  for (const q of questions) {
    assert.equal(validateQuestion(q).valid, true, q.questionId);
    const wrongIds = q.interaction.options.filter((o) => o.optionId !== q.answer.optionId).map((o) => o.optionId).sort();
    const feedbackIds = q.feedback.messages.filter((m) => m.kind === 'wrong_option').map((m) => m.targetId).sort();
    assert.deepEqual(feedbackIds, wrongIds, q.questionId);
    assert.ok(q.feedback.messages.every((m) => m.text.trim().length > 0 && !m.text.startsWith('This choice would cross the stated identity boundary')), q.questionId);
    assert.ok(q.feedback.messages.every((m) => !/The prompt turns on .* is the option that addresses it\./i.test(m.text)), q.questionId);
    assert.ok(q.feedback.messages.every((m) => !m.text.startsWith(q.interaction.options.find((o) => o.optionId === m.targetId).text)), q.questionId);
    assert.ok(q.feedback.details.transfer.trim().length > 0, `${q.questionId}/transfer`);
    assert.ok(!q.feedback.details.transfer.includes(q.interaction.options.find((o) => o.optionId === q.answer.optionId).text), `${q.questionId}/transfer repeats answer`);
    for (const option of q.interaction.options) {
      const result = scoreQuestion(q, { type: 'choice_single', optionId: option.optionId });
      assert.equal(result.status, option.optionId === q.answer.optionId ? 'correct' : 'incorrect', `${q.questionId}/${option.optionId}`);
      assert.equal(q.feedback.messages.some((m) => m.targetId === option.optionId), option.optionId !== q.answer.optionId, `${q.questionId}/${option.optionId}`);
    }
    const reversed = { ...q, interaction: { ...q.interaction, options: [...q.interaction.options].reverse() } };
    assert.equal(scoreQuestion(reversed, { type: 'choice_single', optionId: q.answer.optionId }).status, 'correct', q.questionId);
  }
  const b05017 = byId.get('gcp-ace-gcpace-n02-b05-017');
  assert.equal(b05017.feedback.messages.find((m) => m.targetId === 'B').text, 'Independent local accounts in every project fragment the directory lifecycle and leave suspension dependent on project-by-project cleanup. Use the owned central directory as the lifecycle source.');
  assert.equal(b05017.feedback.details.transfer, 'If suspension must be owned only by the external IdP, compare managed-user lifecycle with federation-only access and inventory separate IAM principal paths across the projects.');
  const mapping = byId.get('gcp-ace-gcpace-n02-b06-002');
  assert.equal(mapping.feedback.messages.find((m) => m.targetId === 'attribute_condition_only').text, 'An attribute condition filters admission using raw claims or mapped attributes; it does not create the Google Cloud attribute mapping that the IAM expression needs. Configure claim-to-attribute mapping.');
  const permission = byId.get('gcp-ace-gcpace-n02-b04-011');
  assert.match(permission.feedback.messages.find((m) => m.targetId === 'workforce_provider_mapping').text, /If token tracing shows the active principal or mapped attribute differs.*otherwise compare that principal’s effective role and scope/);
  for (const [id, q] of byId) {
    const beforeId = id === 'gcp-ace-gcpace-n02-b05-019' ? 'gcp-ace-gcpace-n02-b05-010' : id;
    const block = q.mentalUnitId.match(/N02-B(\d+)/)[1];
    const original = sourceQuestion(`GCPACE-N02-B${block}.json`, beforeId);
    const allowedPaths = changedPaths(original, q).filter((path) => !allowlisted(id, path));
    assert.deepEqual(allowedPaths, [], `${id}: unexpected changed paths`);
  }
  for (const [id, expected] of targetRepairs) {
    const q = byId.get(id);
    assert.equal(q.answer.optionId, 'A');
    assert.deepEqual(q.interaction.options.slice(1).map((o) => o.optionId), expected);
    assert.deepEqual(q.feedback.messages.map((m) => m.targetId).sort(), expected.slice().sort());
  }
});
