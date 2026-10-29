import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import test from "node:test";
import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";

const trackRoot = path.resolve("content/microsoft-azure-administrator-associate-az-104");
const source = new Map();
function unit(node, file) {
  const key = `${node}/${file}`;
  if (!source.has(key)) source.set(key, JSON.parse(readFileSync(path.join(trackRoot, key), "utf8")));
  return source.get(key);
}
function question(node, file, suffix) {
  const value = unit(node, file).find((row) => row.questionId.endsWith(`-${suffix}`));
  assert.ok(value, `question ${file}/${suffix} exists`);
  return value;
}
function option(row, optionId) {
  const value = row.interaction.options.find((candidate) => candidate.optionId === optionId);
  assert.ok(value, `${row.questionId}: option ${optionId} exists`);
  return value;
}
function wrongFeedback(row, optionId) {
  return row.feedback.messages.find((message) => message.kind === "wrong_option" && message.targetId === optionId);
}

const identity = "entra_identity_lifecycle_and_authentication";
const network = "azure_virtual_networking_addressing_peering_routing_and_dns";
const governance = "azure_resource_governance_rbac_policy_and_cost_control";
const expected = new Map([
  ["N01-B02/001", [identity, "AZ104-N01-B02.json", "001", "A"]],
  ["N01-B02/003", [identity, "AZ104-N01-B02.json", "003", "C"]],
  ["N01-B03/001", [identity, "AZ104-N01-B03.json", "001", "A"]],
  ["N01-B03/002", [identity, "AZ104-N01-B03.json", "002", "D"]],
  ["N01-B04/001", [identity, "AZ104-N01-B04.json", "001", "A"]],
  ["N01-B08/012", [identity, "AZ104-N01-B08.json", "012", "B"]],
  ["N07-B01/005", [network, "AZ104-N07-B01.json", "005", "A"]],
  ["N07-B01/010", [network, "AZ104-N07-B01.json", "010", "D"]],
  ["N07-B02/006", [network, "AZ104-N07-B02.json", "006", "D"]],
  ["N07-B02/007", [network, "AZ104-N07-B02.json", "007", "C"]],
]);
const n02b01Keys = "A D C B A D C B A D C B A D C B A D".split(" ");
const n02b02Keys = "A D C B A D C B A D C B A D C B".split(" ");
for (const [file, keys, unitName, count] of [
  ["AZ104-N02-B01.json", n02b01Keys, "N02-B01", 18],
  ["AZ104-N02-B02.json", n02b02Keys, "N02-B02", 16],
]) {
  keys.forEach((key, index) => expected.set(`${unitName}/${String(index + 1).padStart(3, "0")}`, [governance, file, String(index + 1).padStart(3, "0"), key]));
  assert.equal(keys.length, count);
}

const cases = [...expected.entries()].map(([label, [node, file, suffix, key]]) => ({
  label,
  row: question(node, file, suffix),
  key,
}));

test("the 44 AZ-104 findings retain reviewed source identities, contracts, and answer keys", () => {
  assert.equal(cases.length, 44);
  for (const { label, row, key } of cases) {
    assert.equal(row.answer.optionId, key, `${label}: stable answer key`);
    assert.equal(row.interaction.type, "choice_single", `${label}: choice type`);
    assert.equal(row.interaction.scoringMethod, "exact_selected_set", `${label}: scoring contract`);
    assert.equal(new Set(row.interaction.options.map(({ optionId }) => optionId)).size, 4, `${label}: unique option IDs`);
    const validation = validateQuestion(row);
    assert.equal(validation.valid, true, `${label}: ${validation.errors.join("; ")}`);
  }
});

test("all reviewed answers score by persisted option ID after option reordering, with feedback keyed by option ID", () => {
  for (const { label, row, key } of cases) {
    const before = scoreQuestion(row, { type: "choice_single", optionId: key });
    assert.equal(before.status, "correct", `${label}: keyed answer is accepted before reorder`);
    assert.equal(before.earnedPoints, 1, `${label}: accepted score`);
    const reordered = { ...row, interaction: { ...row.interaction, options: [...row.interaction.options].reverse() } };
    const persistedSelection = { type: "choice_single", optionId: key };
    assert.equal(scoreQuestion(reordered, persistedSelection).status, "correct", `${label}: saved option ID survives reordering`);
    for (const choice of row.interaction.options) {
      const feedback = wrongFeedback(row, choice.optionId);
      if (choice.optionId === key) {
        assert.equal(feedback, undefined, `${label}/${choice.optionId}: correct choice has no wrong-option feedback`);
        continue;
      }
      assert.equal(scoreQuestion(reordered, { type: "choice_single", optionId: choice.optionId }).earnedPoints, 0, `${label}/${choice.optionId}: foil remains incorrect`);
      assert.ok(feedback?.text.trim(), `${label}/${choice.optionId}: post-submit feedback exists`);
      assert.equal(wrongFeedback(reordered, choice.optionId)?.text, feedback.text, `${label}/${choice.optionId}: feedback follows its stable ID after reorder`);
    }
  }
});

test("the P1 corrections make the decisive facts explicit and preserve negative counterexamples", () => {
  const nic = question(network, "AZ104-N07-B02.json", "006");
  assert.match(nic.interaction.options.find(({ optionId }) => optionId === "D").text, /two network interfaces/i);
  assert.match(nic.feedback.reason, /one NIC can use only one subnet/i);
  assert.match(nic.feedback.details.errorCorrection, /all IP configurations on a NIC must use that same subnet/i);
  assert.match(nic.feedback.details.scenarioApplication, /one NIC in each required subnet/i);
  assert.match(nic.feedback.details.boundaryOrTradeoff, /single NIC cannot span two subnets/i);

  const licensing = question(identity, "AZ104-N01-B08.json", "012");
  assert.match(licensing.prompt, /inherit the tenant's location/i);
  assert.match(licensing.prompt, /unavailable in that inherited location/i);
  assert.match(licensing.feedback.reason, /tenant location as a fallback/i);
  assert.match(licensing.feedback.details.boundaryOrTradeoff, /not by itself proof/i);
  assert.match(option(licensing, "B").text, /verify the group-based license assignment/i);

  const contractor = question(identity, "AZ104-N01-B02.json", "001");
  assert.match(contractor.prompt, /Contoso must issue and manage the sign-in credentials/i);
  assert.match(contractor.prompt, /no external organizational identity/i);
  assert.equal(option(contractor, "B").text, "Invite the contractor as a B2B collaboration guest in Contoso.");
  assert.doesNotMatch(["B", "C", "D"].map((id) => option(contractor, id).text).join(" "), /;|that delegates|that introduces|rather than people/i);
  assert.match(contractor.feedback.reason, /B2B guest can authenticate through an external identity or email one-time passcode/i);
  assert.match(contractor.feedback.details.boundaryOrTradeoff, /does not transfer credential ownership to Contoso/i);
  assert.match(contractor.feedback.details.errorCorrection, /does not make Contoso the issuer and manager/i);

  const provider = question(governance, "AZ104-N02-B02.json", "003");
  assert.match(provider.prompt, /supported Microsoft\.ContainerService API version and a supported region/i);
  assert.match(provider.prompt, /reports Microsoft\.ContainerService as NotRegistered/i);
  assert.match(option(provider, "C").text, /confirm the resource type is available in the deployment region/i);
  assert.match(provider.feedback.reason, /not the error-code name alone/i);
  assert.match(provider.feedback.details.boundaryOrTradeoff, /Registering globally/i);
});

test("the three reviewed option sets avoid answer-length cues and remain one-decision alternatives", () => {
  for (const [file, suffix, node, key] of [
    ["AZ104-N07-B01.json", "005", network, "A"],
    ["AZ104-N07-B01.json", "010", network, "D"],
    ["AZ104-N07-B02.json", "007", network, "C"],
  ]) {
    const row = question(node, file, suffix);
    assert.equal(row.answer.optionId, key);
  }
  const subnet = question(network, "AZ104-N07-B01.json", "005");
  assert.match(subnet.prompt, /peered VNet/i);
  assert.match(subnet.prompt, /new address-space range/i);
  assert.match(option(subnet, "A").text, /connected prefixes, add a nonoverlapping VNet range and subnet/i);
  assert.match(option(subnet, "B").text, /only this VNet’s existing subnets, add a range and subnet/i);
  assert.match(wrongFeedback(subnet, "B").text, /checked against connected prefixes/i);
  assert.match(option(subnet, "C").text, /before attaching security and routes/i);
  assert.match(option(subnet, "D").text, /\/25 for the initial 120 instances/i);

  const dependency = question(network, "AZ104-N07-B01.json", "010");
  assert.match(option(dependency, "D").text, /distinct contained subnets/i);
  const exposure = question(network, "AZ104-N07-B02.json", "007");
  assert.match(exposure.prompt, /without admitting unapproved inbound traffic during deployment/i);
  assert.match(option(exposure, "B").text, /broad inbound traffic during production exposure, then narrow/i);
  assert.match(option(exposure, "C").text, /apply an NSG for approved service traffic to the NIC/i);
  assert.match(exposure.feedback.details.mechanismOrProperty, /Associate the NSG with the NIC or subnet before exposing/i);
});

test("N01 distractor cleanups and the shared-group-inbox distinction retain post-submit explanations", () => {
  for (const [file, suffix, ids] of [
    ["AZ104-N01-B02.json", "003", ["A", "B", "D"]],
    ["AZ104-N01-B03.json", "001", ["B", "C", "D"]],
    ["AZ104-N01-B04.json", "001", ["B", "C", "D"]],
  ]) {
    const row = question(identity, file, suffix);
    for (const id of ids) {
      assert.doesNotMatch(option(row, id).text, /;|that is not|rather than|that defeats|does not transfer/i, `${row.questionId}/${id}: no answer explanation before submit`);
      assert.ok(wrongFeedback(row, id)?.text.trim(), `${row.questionId}/${id}: explanation remains after submit`);
    }
  }
  const groups = question(identity, "AZ104-N01-B03.json", "002");
  assert.match(groups.prompt, /shared group inbox/i);
  assert.equal(groups.answer.optionId, "D");
});

test("all 102 N02-B01/B02 distractors are proposals, not pre-submit explanations", () => {
  for (const [file, count] of [["AZ104-N02-B01.json", 18], ["AZ104-N02-B02.json", 16]]) {
    const rows = unit(governance, file);
    assert.equal(rows.length, count);
    for (const row of rows) {
      assert.equal(row.interaction.options.length, 4, `${row.questionId}: four options`);
      const wrongIds = row.interaction.options.map(({ optionId }) => optionId).filter((id) => id !== row.answer.optionId).sort();
      const targets = row.feedback.messages.filter(({ kind }) => kind === "wrong_option").map(({ targetId }) => targetId).sort();
      assert.deepEqual(targets, wrongIds, `${row.questionId}: wrong-option feedback maps exactly by ID`);
      for (const optionId of wrongIds) {
        assert.doesNotMatch(option(row, optionId).text, /;/, `${row.questionId}/${optionId}: no pre-submit diagnosis`);
        assert.ok(wrongFeedback(row, optionId)?.text.trim(), `${row.questionId}/${optionId}: post-submit diagnosis retained`);
      }
    }
  }

  const location = question(governance, "AZ104-N02-B02.json", "002");
  assert.match(location.prompt, /metadata location is West Europe/i);
  assert.match(location.prompt, /VM .*North Europe/i);
  assert.equal(location.answer.optionId, "D");
  assert.match(option(location, "C").text, /separate subscription/i);
  assert.match(location.feedback.details.errorCorrection, /remains in the same subscription/i);

  for (const suffix of ["007", "008", "009", "011", "014"]) {
    const move = question(governance, "AZ104-N02-B02.json", suffix);
    assert.match(move.feedback.details.boundaryOrTradeoff, /changes its resource ID/i, `${move.questionId}: move changes the ARM ID`);
    assert.match(move.feedback.details.boundaryOrTradeoff, /does not itself relocate the resource's physical region/i, `${move.questionId}: physical region boundary`);
  }
  assert.match(question(governance, "AZ104-N02-B02.json", "007").feedback.details.scenarioApplication, /new resource ID/i);
});

test("the actual Certification consumer preserves all 44 source questions through shuffled persisted responses", () => {
  const appRoot = process.env.PATTERNLY_FRONTEND_ROOT || path.resolve("..", "patternly");
  const probe = String.raw`
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { canonicalInteractionRegistry } = require('./src/content/canonical/interactions/registry.ts');
const { projectCertificationPracticeFeedback, projectCertificationPracticeQuestion } = require('./src/application/certification/certificationSessionFacade.ts');
const contentRoot = process.env.AZ104_CONTENT_ROOT;
const identity = 'entra_identity_lifecycle_and_authentication';
const network = 'azure_virtual_networking_addressing_peering_routing_and_dns';
const governance = 'azure_resource_governance_rbac_policy_and_cost_control';
const expected = new Map([
  ['N01-B02/001', [identity, 'AZ104-N01-B02.json', '001', 'A']], ['N01-B02/003', [identity, 'AZ104-N01-B02.json', '003', 'C']],
  ['N01-B03/001', [identity, 'AZ104-N01-B03.json', '001', 'A']], ['N01-B03/002', [identity, 'AZ104-N01-B03.json', '002', 'D']],
  ['N01-B04/001', [identity, 'AZ104-N01-B04.json', '001', 'A']], ['N01-B08/012', [identity, 'AZ104-N01-B08.json', '012', 'B']],
  ['N07-B01/005', [network, 'AZ104-N07-B01.json', '005', 'A']], ['N07-B01/010', [network, 'AZ104-N07-B01.json', '010', 'D']],
  ['N07-B02/006', [network, 'AZ104-N07-B02.json', '006', 'D']], ['N07-B02/007', [network, 'AZ104-N07-B02.json', '007', 'C']],
]);
for (const [file, keys, unit, count] of [
  ['AZ104-N02-B01.json', 'A D C B A D C B A D C B A D C B A D'.split(' '), 'N02-B01', 18],
  ['AZ104-N02-B02.json', 'A D C B A D C B A D C B A D C B'.split(' '), 'N02-B02', 16],
]) {
  assert.equal(keys.length, count);
  keys.forEach((key, i) => expected.set(unit + '/' + String(i + 1).padStart(3, '0'), [governance, file, String(i + 1).padStart(3, '0'), key]));
}
const files = new Map();
function exact(q) {
  const summary = { questionId: q.questionId, trackId: q.trackId, nodeId: q.nodeId, mentalUnitId: q.mentalUnitId, prompt: q.prompt, interactionType: q.interaction.type, difficulty: q.difficulty ?? null, constraints: q.constraints };
  const call = (fn) => fn(q);
  return { question: summary, interactions: {
    isComplete: (_id, r) => call((x) => canonicalInteractionRegistry.isComplete(x, r)),
    evaluate: (_id, r) => call((x) => canonicalInteractionRegistry.evaluate(x, r)),
    presentReview: (_id, r, o) => call((x) => canonicalInteractionRegistry.presentReview(x, r, o)),
    present: (_id, r, o) => call((x) => canonicalInteractionRegistry.present(x, r, o)),
    projectFeedback: (_id, r) => call((x) => canonicalInteractionRegistry.projectFeedback(x, r)),
    projectDiagnostics: (_id, r) => call((x) => canonicalInteractionRegistry.projectDiagnostics(x, r)),
    controlIds: () => call((x) => canonicalInteractionRegistry.controlIds(x)),
    randomizeControlOrder: () => call((x) => canonicalInteractionRegistry.randomizeControlOrder(x)),
  }};
}
function permutations(xs) { if (xs.length <= 1) return [xs]; return xs.flatMap((x, i) => permutations(xs.filter((_, j) => j !== i)).map((p) => [x, ...p])); }
let permutationCount = 0;
let responseCount = 0;
for (const [label, [node, file, suffix, key]] of expected) {
  const fp = path.join(contentRoot, node, file);
  if (!files.has(fp)) files.set(fp, JSON.parse(readFileSync(fp, 'utf8')));
  const q = files.get(fp).find((v) => v.questionId.endsWith('-' + suffix));
  assert.ok(q, label);
  const owner = exact(q);
  assert.deepEqual(canonicalInteractionRegistry.validate(q), [], label + ' app registry validation');
  const ids = q.interaction.options.map((o) => o.optionId);
  const allOrders = permutations(ids);
  assert.equal(allOrders.length, 24);
  for (const order of allOrders) {
    permutationCount++;
    const model = canonicalInteractionRegistry.present(q, null, order).model;
    const practice = projectCertificationPracticeQuestion(owner.question, model);
    assert.deepEqual(practice.interaction.options.map((o) => o.optionId), order, label + ' display order');
    assert.deepEqual(practice.interaction.options.map((o) => o.text), order.map((id) => q.interaction.options.find((o) => o.optionId === id).text), label + ' display text');
    assert.equal('answer' in practice, false);
    assert.equal('feedback' in practice, false);
    for (const id of ids) {
      const response = JSON.parse(JSON.stringify({ type: 'choice_single', optionId: id }));
      const result = canonicalInteractionRegistry.score(q, response);
      const correct = id === key;
      assert.equal(result.kind, correct ? 'correct' : 'incorrect', label + '/' + id + ' score');
      const restored = canonicalInteractionRegistry.present(q, response, order).model;
      assert.equal(restored.renderer.options.find((o) => o.id === id).selected, true, label + '/' + id + ' restored selection');
      const projected = projectCertificationPracticeFeedback('afterEachAnswer', { response, result: { kind: result.kind } }, owner);
      assert.ok(projected, label + '/' + id + ' feedback projection');
      const messages = projected.messages ?? [];
      if (correct) assert.equal(messages.filter((m) => m.kind === 'wrong_option').length, 0, label + '/' + id + ' correct feedback');
      else assert.deepEqual(messages.filter((m) => m.kind === 'wrong_option').map((m) => m.targetId), [id], label + '/' + id + ' selected stable-ID feedback');
      responseCount++;
    }
  }
}
console.log(JSON.stringify({ items: expected.size, permutationsPerItem: 24, permutationCount, responseCount, result: 'PASS' }, null, 2));
`;
  const result = spawnSync(process.execPath, ["--import", "tsx", "--input-type=module", "-e", probe], {
    cwd: appRoot,
    env: { ...process.env, AZ104_CONTENT_ROOT: trackRoot },
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });
  assert.equal(result.error, undefined, `app consumer probe started: ${result.error?.message ?? ""}`);
  assert.equal(result.status, 0, `app consumer probe exit: ${result.stderr}`);
  assert.match(result.stdout, /"items": 44/);
  assert.match(result.stdout, /"permutationCount": 1056/);
  assert.match(result.stdout, /"responseCount": 4224/);
  assert.match(result.stdout, /"result": "PASS"/);
});

// Six bounded governance repairs AZ104-20261021-01..04; separate from the older cohort.
const october21 = [
  ["AZ104-N02-B03.json", "017", "A"], ["AZ104-N02-B03.json", "018", "D"],
  ["AZ104-N02-B05.json", "019", "C"], ["AZ104-N02-B08.json", "009", "A"],
  ["AZ104-N02-B08.json", "011", "C"], ["AZ104-N02-B08.json", "015", "C"],
].map(([file, suffix, key]) => ({ row: question(governance, file, suffix), key }));
for (const { row, key } of october21) test(`October 21 ${row.questionId}: identity, key and exact feedback targets`, () => {
  assert.equal(row.answer.optionId, key);
  assert.equal(row.interaction.type, "choice_single");
  assert.equal(validateQuestion(row).valid, true);
  const ids = row.interaction.options.map((o) => o.optionId);
  assert.deepEqual(ids, row.questionId.endsWith("B03-018") ? ["blob_data_reader_for_configuration", "B", "C", "D"] : ["A", "B", "C", "D"]);
  assert.deepEqual(row.feedback.messages.map((m) => m.targetId).sort(), ids.filter((id) => id !== key).sort());
  for (const id of ids) {
    const score = scoreQuestion(row, { type: "choice_single", optionId: id });
    assert.equal(score.earnedPoints, id === key ? 1 : 0);
    assert.equal(score.maxPoints, 1);
  }
});
test("October 21 closest counterexamples: data access, export-only delivery, nonexistent CLI", () => {
  const reader = october21[1].row;
  const replacement = option(reader, "blob_data_reader_for_configuration");
  assert.match(replacement.text, /Storage Blob Data Reader.*configuration is stored as blob data/i);
  assert.match(wrongFeedback(reader, replacement.optionId).text, /blob contents.*violate the no-blob-data constraint/i);
  assert.match(reader.feedback.details.errorCorrection, /Reader at the storage-account scope.*without blob DataActions/i);
  const dangling = structuredClone(reader);
  dangling.feedback.messages[0].targetId = "A";
  assert.equal(validateQuestion(dangling).valid, false);
  const missingAnswer = structuredClone(reader);
  missingAnswer.interaction.options = missingAnswer.interaction.options.filter((o) => o.optionId !== "D");
  assert.equal(validateQuestion(missingAnswer).valid, false);
  const email = october21[3].row;
  assert.match(option(email, "A").text, /weekly scheduled email alert.*recipients.*reporting period/i);
  assert.doesNotMatch(option(email, "A").text + email.feedback.details.scenarioApplication, /scheduled alert or export/i);
  assert.match(email.feedback.details.mechanismOrProperty, /export writes datasets to storage and needs another delivery process/i);
  assert.match(email.feedback.reason, /without portal access/i);
  const query = october21[5].row;
  assert.match(option(query, "C").text, /REST API with POST.*explicit scope.*request body.*timeframe and grouping.*az rest/i);
  assert.doesNotMatch(JSON.stringify(query), /az costmanagement query|--query/);
  assert.match(query.feedback.details.mechanismOrProperty, /ARM REST operation/);
});
test("October 21 nine distractors preserve false mechanisms without pre-submit self-disproof", () => {
  for (const index of [0, 2, 4]) {
    const { row, key } = october21[index];
    for (const o of row.interaction.options.filter((o) => o.optionId !== key)) {
      assert.doesNotMatch(o.text, /;|it does not|Owner includes writes|budgets do not|their governance evidence differs/i);
      assert.ok(wrongFeedback(row, o.optionId)?.text.trim());
    }
  }
  for (const [index, id, misconception] of [[0,"B",/tenant-wide administration/],[0,"C",/Owner provides read-only/],[0,"D",/grants Microsoft Entra directory roles/],[2,"A",/grants Azure permissions/],[2,"B",/deletes the waived resource/],[2,"D",/exactly the same way/],[4,"A",/bypasses an automatic budget shutdown/],[4,"B",/removed the budget's action group/],[4,"D",/VM quota/]]) assert.match(option(october21[index].row,id).text,misconception);
});
test("October 21 actual APP: persisted permutations, accessibility, feedback boundary, retired IDs", () => {
  const appRoot = process.env.PATTERNLY_FRONTEND_ROOT || path.resolve("..", "patternly");
  const probe = String.raw`
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { canonicalInteractionRegistry: registry } = require('./src/content/canonical/interactions/registry.ts');
const { prepareCanonicalOptionOrder, isCanonicalOptionOrder } = require('./src/application/canonical/canonicalOptionOrder.ts');
const { projectCertificationPracticeQuestion, projectCertificationPracticeFeedback } = require('./src/application/certification/certificationSessionFacade.ts');
const cases = JSON.parse(process.env.AZ104_OCT21_CASES);
let responses = 0;
for (const { row: q, key } of cases) {
  assert.deepEqual(registry.validate(q), []);
  const owner = { question: { questionId: q.questionId, interactionType: q.interaction.type }, interactions: {
    projectFeedback: (_id, r) => registry.projectFeedback(q, r),
    projectDiagnostics: (_id, r) => registry.projectDiagnostics(q, r),
  }};
  const prepared = prepareCanonicalOptionOrder(q, 'az104-oct21:' + q.questionId, { contentVersion: 'test-current', artifactSha256: 'a'.repeat(64) });
  for (const order of [prepared, [...prepared].reverse()]) {
    const savedOrder = JSON.parse(JSON.stringify(order));
    assert.equal(isCanonicalOptionOrder(q, savedOrder), true);
    const model = registry.present(q, null, savedOrder).model;
    const projected = projectCertificationPracticeQuestion({ ...q, interactionType: q.interaction.type }, model);
    assert.deepEqual(projected.interaction.options.map((o) => o.optionId), savedOrder);
    assert.equal('answer' in projected, false);
    assert.equal('feedback' in projected, false);
    assert.equal(projectCertificationPracticeFeedback('afterEachAnswer', null, owner), null);
    assert.deepEqual(model.accessibility.controls.map((c) => c.label), savedOrder.map((id) => q.interaction.options.find((o) => o.optionId === id).text));
    assert.equal('feedback' in model.accessibility, false);
    for (const id of savedOrder) {
      const response = JSON.parse(JSON.stringify({ type: 'choice_single', optionId: id }));
      const score = registry.score(q, response);
      assert.equal(score.kind, id === key ? 'correct' : 'incorrect');
      assert.equal(score.earnedPoints, id === key ? 1 : 0);
      assert.equal(score.maxPoints, 1);
      const restored = registry.present(q, response, savedOrder).model;
      assert.equal(restored.renderer.options.find((o) => o.id === id).selected, true);
      const attempt = { response, result: { kind: score.kind } };
      const feedback = projectCertificationPracticeFeedback('afterEachAnswer', attempt, owner);
      assert.ok(feedback);
      if (id === key) {
        assert.equal(feedback.messages, undefined);
      } else {
        const expectedMessage = q.feedback.messages.find((message) => message.kind === 'wrong_option' && message.targetId === id);
        assert.ok(expectedMessage);
        assert.deepEqual(feedback.messages, [expectedMessage]);
      }
      assert.ok(feedback.reason && feedback.details);
      assert.equal(projectCertificationPracticeFeedback('atSessionEnd', attempt, owner), null);
      responses++;
    }
  }
  for (const id of ['', 'missing-option', ...(q.questionId.endsWith('B03-018') ? ['A'] : [])]) {
    const response = { type: 'choice_single', optionId: id };
    assert.equal(registry.isComplete(q, response), false);
    assert.equal(registry.score(q, response).earnedPoints, 0);
    assert.equal(registry.projectFeedback(q, response), null);
  }
}
console.log(JSON.stringify({ questions: cases.length, orders: 12, responses, accessibility: 'PASS', projection: 'PASS' }));
`;
  const result = spawnSync(process.execPath, ["--import", "tsx", "--input-type=module", "-e", probe], {
    cwd: appRoot, env: { ...process.env, AZ104_OCT21_CASES: JSON.stringify(october21) }, encoding: "utf8", maxBuffer: 1024 * 1024,
  });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0, result.stdout + result.stderr);
});
