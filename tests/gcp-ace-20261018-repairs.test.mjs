import assert from "node:assert/strict";
import test from "node:test";
import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";
import { loadCurrentQuestionBank } from "./helpers/current-question-bank.mjs";

const trackId = "google-cloud-associate-cloud-engineer";
const bank = await loadCurrentQuestionBank(trackId);
const questions = bank.questions.filter((question) => question.questionId.startsWith("gcp-ace-gcpace-n02-"));
const blockSizes = [18, 18, 18, 20, 18, 20, 18];
const currentIds = blockSizes.flatMap((size, index) => Array.from({ length: size }, (_, i) =>
  `gcp-ace-gcpace-n02-b${String(index + 1).padStart(2, "0")}-${String(i + 1).padStart(3, "0")}`))
  .map((id) => id === "gcp-ace-gcpace-n02-b05-010" ? "gcp-ace-gcpace-n02-b05-019" : id).sort();
const repairedResponses = new Map([
  ["gcp-ace-gcpace-n02-b01-001", ["B", "project_binding_only", "D"]],
  ["gcp-ace-gcpace-n02-b02-001", ["individual_viewer_bindings", "group_editor_binding", "shared_employee_login"]],
  ["gcp-ace-gcpace-n02-b03-002", ["sync_cloud_identity_users", "provision_on_first_login", "cloud_identity_sso_accounts"]],
  ["gcp-ace-gcpace-n02-b04-011", ["compute_role_wrong_project", "project_owner_grant", "workforce_provider_mapping"]],
  ["gcp-ace-gcpace-n02-b05-016", ["workforce_for_automation", "workload_for_employees", "shared_managed_identity"]],
  ["gcp-ace-gcpace-n02-b06-002", ["attribute_condition_only", "iam_principal_expression", "provider_audience"]],
  ["gcp-ace-gcpace-n02-b07-008", ["direct_binding_audit", "nested_group_membership", "ancestor_policy_only"]]
]);
const get = (id) => {
  const question = bank.byId.get(id);
  assert.ok(question, `current bank includes ${id}`);
  return question;
};

test("the current GCP identity bank has one successor in the 130-question inventory", () => {
  assert.equal(currentIds.length, 130);
  assert.equal(new Set(currentIds).size, 130);
  assert.deepEqual(questions.map((question) => question.questionId), currentIds);
  assert.ok(!bank.byId.has("gcp-ace-gcpace-n02-b05-010"));
  assert.ok(bank.byId.has("gcp-ace-gcpace-n02-b05-019"));
  assert.equal(questions.reduce((count, question) => count + question.feedback.messages.length, 0), 390);
});

test("managed-directory lifecycle, workforce revocation, and independent issuers keep distinct boundaries", () => {
  const directory = get("gcp-ace-gcpace-n02-b05-007");
  assert.match(directory.prompt, /managed user objects.*Cloud Identity directory/i);
  assert.equal(directory.answer.optionId, "A");
  assert.match(directory.interaction.options.find((option) => option.optionId === directory.answer.optionId).text, /managed employee users.*directory lifecycle/i);
  assert.match(directory.feedback.details.boundaryOrTradeoff, /suspension belongs only in the external IdP/i);
  assert.match(directory.feedback.messages.find((message) => message.targetId === "B").text, /do not provide the managed Cloud Identity user object/i);

  const revoke = get("gcp-ace-gcpace-n02-b05-019");
  assert.match(revoke.prompt, /disabled in the external IdP.*Workforce Identity Federation/i);
  assert.equal(revoke.answer.optionId, "revoke_subject_sessions");
  assert.match(revoke.feedback.reason, /immediate termination.*explicit subject session revocation/i);
  assert.match(revoke.feedback.details.boundaryOrTradeoff, /does not prevent a fresh login while the user remains active at the IdP/i);
  assert.match(revoke.feedback.messages.find((message) => message.targetId === "disable_idp_only").text, /already-issued workforce sessions end immediately/i);
  assert.match(revoke.feedback.details.transfer, /active again after revocation.*fresh login can issue new workforce sessions/i);
  assert.ok(revoke.sourceRefs.includes("https://docs.cloud.google.com/iam/docs/workforce-revoke-sessions"));

  const issuer = get("gcp-ace-gcpace-n02-b06-005");
  assert.match(issuer.prompt, /second independent OIDC issuer/i);
  assert.equal(issuer.answer.optionId, "A");
  assert.match(issuer.feedback.reason, /Each OIDC workforce provider has its own issuer and audience/i);
  assert.match(issuer.feedback.details.scenarioApplication, /validate its token issuer and aud claim/i);
  assert.match(issuer.feedback.messages.find((message) => message.targetId === "B").text, /cannot establish whether IdP B’s issuer and audience are trusted/i);

  const mapping = get("gcp-ace-gcpace-n02-b06-002");
  assert.equal(mapping.answer.optionId, "A");
  assert.match(mapping.feedback.messages.find((message) => message.targetId === "attribute_condition_only").text, /condition filters admission.*does not create.*attribute mapping/i);
});

test("current repairs retain the intended mechanism and bind diagnostics to stable option IDs", () => {
  for (const [id, rejectedIds] of repairedResponses) {
    const question = get(id);
    assert.equal(question.answer.optionId, "A", id);
    assert.deepEqual(question.interaction.options.slice(1).map((option) => option.optionId), rejectedIds, id);
    assert.deepEqual(question.feedback.messages.map((message) => message.targetId).sort(), rejectedIds.slice().sort(), id);
  }
  for (const question of questions) {
    assert.equal(validateQuestion(question).valid, true, question.questionId);
    const wrongIds = question.interaction.options.filter((option) => option.optionId !== question.answer.optionId).map((option) => option.optionId).sort();
    const feedbackIds = question.feedback.messages.filter((message) => message.kind === "wrong_option").map((message) => message.targetId).sort();
    assert.deepEqual(feedbackIds, wrongIds, question.questionId);
    for (const option of question.interaction.options) {
      const result = scoreQuestion(question, { type: "choice_single", optionId: option.optionId });
      assert.equal(result.status, option.optionId === question.answer.optionId ? "correct" : "incorrect", `${question.questionId}/${option.optionId}`);
      const shuffled = { ...question, interaction: { ...question.interaction, options: [...question.interaction.options].reverse() } };
      assert.equal(scoreQuestion(shuffled, { type: "choice_single", optionId: option.optionId }).status, result.status, `${question.questionId}/${option.optionId} after shuffle`);
    }
    assert.ok(question.feedback.messages.every((message) => message.text.trim().length > 0), question.questionId);
    assert.ok(question.sourceRefs.length > 0, `${question.questionId}: current sourced decision`);
  }
});
