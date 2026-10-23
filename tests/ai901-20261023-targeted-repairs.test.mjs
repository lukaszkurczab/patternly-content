import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { scoreQuestion, validateQuestion } from "../scripts/content/question-contract.mjs";
import { loadCurrentQuestionBank } from "./helpers/current-question-bank.mjs";
import scoring from "../../patternly/src/content/canonical/questionScoring.ts";
import optionOrder from "../../patternly/src/application/canonical/canonicalOptionOrder.ts";
import presentation from "../../patternly/src/application/canonical/canonicalInteractionPresentation.ts";

const { scoreCanonicalQuestion } = scoring;
const { prepareCanonicalOptionOrder, projectCanonicalQuestionInSessionOrder } = optionOrder;
const { composeCanonicalFeedback } = presentation;
const trackId = "microsoft-azure-ai-fundamentals-ai-901";
const units = ["B04", "B05", "B06", "B07", "B08", "B09", "B10", "B11", "B12"];
const bank = await loadCurrentQuestionBank(trackId);
const catalog = JSON.parse(readFileSync(new URL("../content/catalog.json", import.meta.url), "utf8"));
const track = catalog.tracks.find((entry) => entry.trackId === trackId);
const { sha256, canonicalJson } = await import("../scripts/build.mjs");
const pin = { contentVersion: track.contentVersion, artifactSha256: sha256(canonicalJson(bank.artifact)) };

const wrongOptionText = {
  B04: {
    "Rely on content filtering as a substitute for authorization": "Content filtering can screen inappropriate output, but it cannot authenticate a caller or authorize access to protected data. Enforce identity and least-privilege access at a trusted boundary.",
    "Put a secret in the prompt because the model will not repeat it": "A model prompt is not a credential vault; text can be logged, disclosed, or echoed. Keep secrets outside prompts and use managed credentials.",
    "Grant every developer broad access so troubleshooting is easier": "Granting broad permissions increases the exposure surface. Use task-specific roles, least privilege, and auditable access."
  },
  B05: {
    "Treat the most common user as representative of every user": "Testing only a dominant user group cannot establish accessibility for different abilities, languages or devices. Include affected users and equivalent task paths.",
    "Use fairness metrics alone without checking accessibility": "Fairness metrics concern outcome differences; they do not demonstrate keyboard access, perceivable feedback or alternative modalities. Test the interaction directly.",
    "Make the interface more complex so every possible control is visible": "Adding controls without prioritizing the task can increase barriers. Preserve accessible navigation and understandable alternatives instead of maximizing visible density."
  },
  B06: {
    "Expose proprietary model internals regardless of audience need": "Transparency requires meaningful disclosure and explanations for the affected audience, not indiscriminate release of proprietary internals.",
    "Show only a confidence number and omit the system's limitations": "A confidence value alone does not tell users what the AI can do, its uncertainty, or when human review is needed. Describe material limits.",
    "Hide AI involvement because the output is helpful": "Usefulness does not remove the need to tell affected people when AI contributes to consequential decisions and what the limits are."
  },
  B07: {
    "Treat the model or vendor as the final decision owner": "The deploying organization must assign a person or accountable team for consequential decisions, review and appeal; a model or vendor is not that owner.",
    "Assume a human clicked approve even if the reviewer had no authority": "A nominal approval click is not meaningful oversight without authority, relevant evidence, and a way to stop or reverse harm.",
    "Delete deployment history after the outcome is accepted": "Deleting the case or deployment trail prevents later investigation and audit. Keep proportionate, protected evidence under a defined retention policy."
  },
  B08: {
    "Assume the model performs a database lookup for every factual answer": "Next-token generation does not itself query an authoritative database. Retrieval requires an explicitly integrated retrieval or tool path.",
    "Treat every new prompt as permanent training data": "Inference-time prompts do not by themselves update model weights. Training and service data handling are distinct concerns.",
    "Expect the model to return the same text because it saw similar words": "Similar prompts need not produce identical output; sampling and context affect generation. Check requirements for reproducibility separately."
  },
  B09: {
    "Assume lower temperature makes every answer true": "Lower sampling temperature may affect variation but cannot establish factual truth. Verify material claims against evidence.",
    "Accept a confident tone as a deterministic guarantee": "Confident prose is neither a correctness guarantee nor a reproducibility guarantee. Measure accuracy against trustworthy evidence.",
    "Repeat the same prompt until one response sounds plausible": "Selecting whichever response sounds plausible does not validate it and can reinforce hallucinations. Ground or independently verify the claim."
  },
  B10: {
    "Choose the largest model because it is always the safest fit": "A larger model is not automatically safer or better for the specified workload. Compare verified capability, quality, latency, cost and available deployment.",
    "Choose the newest model without checking its supported input and output": "Model recency does not imply support for the required modality, output format, region or deployment. Check documented capability.",
    "Choose an embedding model because all AI models generate chat responses": "Embedding models produce vector representations, not arbitrary chat replies. Choose a model that supports the intended output."
  },
  B11: {
    "Use the benchmark leader for every workload": "A benchmark on another dataset does not prove task fit. Evaluate candidates on representative inputs and explicit constraints.",
    "Optimize cost before confirming the model can perform the task": "An inexpensive model that fails required accuracy, safety or modality conditions is not a valid candidate. Establish capability fit first.",
    "Optimize quality without considering latency or context limits": "Maximizing a quality metric while ignoring latency and context bounds may violate a real application contract. Compare all hard constraints."
  },
  B12: {
    "Change temperature to repair an endpoint or authentication error": "Temperature controls generation behavior, not endpoint routing, deployment identity or request authorization. Diagnose connection/authentication separately.",
    "Use a model name that is not the deployment name addressed by the client": "A client must target the configured deployment identity for its endpoint. A catalog model label cannot replace a differently named deployment.",
    "Assume portal access means every client endpoint is already configured": "Access to a portal does not prove a client endpoint, credentials, deployment and permissions are configured. Validate each integration boundary."
  }
};

const p02 = {
  B04: ["A hiring-screening pilot sends applicant information to a hosted AI service. The requirement is to minimize unnecessary disclosure and restrict access to the resource and data. Which control best protects the data path and access boundary?", "Send only necessary data, protect credentials, restrict access, and define retention and disclosure controls. In this scenario, the data path and resource access must be protected.", "Privacy requires minimizing submitted data and protecting credentials and access paths. Content filtering does not grant authorization."],
  B05: ["Applicants with different abilities and languages must complete the same hiring-screening task. The current interaction was tested only with one dominant user group. Which evaluation and design response best addresses inclusiveness?", "Test with diverse users and provide an accessible interaction or alternate modality for the affected users. In this scenario, applicants with varied abilities and languages must complete the same task.", "A representative outcome metric cannot establish usable interaction paths for varied abilities. Test with affected users and provide an accessible alternative."],
  B06: ["A hiring-screening assistant provides recommendations that applicants and reviewers will read. The team must disclose AI involvement, important limitations, and uncertainty in language they can use. What is the most appropriate transparency approach?", "Tell users when AI is involved, explain relevant limitations and uncertainty, and provide a useful explanation at the audience's level. In this scenario, AI involvement and material limitations must be disclosed to applicants and reviewers.", "Useful transparency identifies AI involvement and material limitations for the actual audience; publishing internal model code or only a confidence score does not do that."],
  B08: ["A support assistant receives a long transcript as inference-time context. Which statement correctly distinguishes prompt processing from permanent model training?", "Treat the prompt as inference-time context that is tokenized and used to predict the next output tokens. In this scenario, the prompt supplies temporary context, not a training update.", "The prompt is tokenized and processed as inference-time context; a request does not automatically retrain model weights or query an external database."],
  B10: ["A batch classification workload has three available model candidates. Representative batch measurements show that the smallest candidate also has the lowest resource cost for this workload. All three meet the specified quality, safety, input modality, output, and deployment requirements, and the owner must minimize resource cost. Which selection approach is appropriate?", "Choose the smallest available model that supports the required input, output, modality, and tool behavior. In this scenario, every candidate satisfies the quality, safety, and availability requirements and cost must be minimized.", "The representative batch measurements show that the smallest candidate has the lowest resource cost, and every candidate meets the hard requirements. Size alone never establishes safety or quality."],
  B11: ["A multilingual chat client has strict latency and cost budgets, a bounded context requirement, and a quality target. Which approach should the team use to select a candidate model?", "Compare suitable candidates on the constraint that matters for this workload and validate the trade-off with representative inputs. In this scenario, compare quality, latency, cost, and context using representative multilingual requests.", "Compare models using representative multilingual inputs and explicit quality, latency, cost and context bounds rather than a benchmark rank."],
  B12: ["A lightweight client must call an existing Microsoft Foundry model deployment. The first request fails before generation because it targets the wrong endpoint and uses a credential for a different resource. Which corrective setup sequence is appropriate?", "Use a supported deployment and endpoint with the matching credential, then tune generation parameters for the required behavior. In this scenario, the first request fails at the endpoint and authentication boundary.", "Endpoint and credential must match the configured deployment before generation parameters can affect a successful request."]
};

const p03 = {
  B04: ["The intake form accidentally sends a full medical history although the classification needs only two symptoms.", "The translation tool is moved from a private trial to a public client app where credentials could be inspected. Which existing data/access design must change?", "Move credentials out of the public client and reduce the submitted personal data."],
  B05: ["Screen-reader users cannot reach the submit control with the keyboard, although visual users can. The team sees this after launch.", "The translation assistant must now support a user who cannot read the visual output. Which interaction path must be reconsidered?", "Provide a nonvisual equivalent interaction and test the task with the affected users."],
  B06: ["Users believe a generated recommendation comes from a human expert because the UI omits AI disclosure. The complaint is recorded.", "The assistant previously drafted internal suggestions; it now sends customer-visible recommendations. Which disclosure and explanation must change?", "Disclose AI involvement and uncertainty to customers, not only internal reviewers."],
  B07: ["A rejected case cannot be appealed because the system retained no reviewer identity or model evidence. A complainant needs case review.", "The triage service previously recommended actions to staff; it now automatically denies benefits. Which decision-ownership and appeal boundary must change?", "Restore a named human decision owner and a case-level appeal trail before automatic rejection."],
  B08: ["A client team treats the latest prompt as an update to the model weights and cannot reproduce a previously stated behavior.", "A text-only model must now process photos with the text prompt. Which model capability and input processing assumptions must change?", "Use a model that supports image inputs and validate the expected multimodal output."],
  B09: ["The chat assistant invents a source citation but displays it confidently, and the caseworker initially accepts it.", "The use case changes from creative brainstorming to evidence-backed advice about eligibility. Which verification approach must change?", "Require attributable evidence and an independent check of material claims."],
  B10: ["The selected text-only model rejects an image input from a school-support workflow.", "The assistant must now accept uploaded images as well as text; which model capability must be revalidated?", "Replace the text-only model with a validated vision-capable option."],
  B11: ["The new low-cost model handles typical inputs, but long conversations exceed its context limit and silently truncate.", "The app changes from asynchronous batch summaries to interactive chat with a strict response-time budget. Which evaluation priority changes?", "Reevaluate the hard latency budget on representative interactive requests."],
  B12: ["A client call fails with 401 because its token belongs to another resource; the team keeps adjusting generation temperature.", "The application is moved from portal testing to a client deployment with an explicit endpoint and credential policy. Which connection configuration must be verified?", "Configure and validate endpoint, deployment identifier, credentials and permissions for the client."]
};

test("P01: all 108 current items have option-specific feedback that stays bound to the selected option after shuffle", () => {
  const ids = [];
  for (const unit of units) {
    const unitQuestions = [...bank.byId.values()].filter((question) => question.mentalUnitId === `AI901-N01-${unit}`);
    assert.equal(unitQuestions.length, 12, `${unit}: question count`);
    for (const question of unitQuestions) {
      ids.push(question.questionId);
      assert.equal(validateQuestion(question).valid, true, question.questionId);
      const byOption = new Map(question.interaction.options.map(({ optionId, text }) => [optionId, text]));
      const expectedWrongIds = question.interaction.options.filter(({ optionId }) => optionId !== question.answer.optionId).map(({ optionId }) => optionId).sort();
      const wrongMessages = question.feedback.messages.filter(({ kind }) => kind === "wrong_option");
      assert.deepEqual(wrongMessages.map(({ targetId }) => targetId).sort(), expectedWrongIds, question.questionId);
      for (const message of wrongMessages) {
        assert.equal(message.text, wrongOptionText[unit][byOption.get(message.targetId)], `${question.questionId}/${message.targetId}`);
        assert.doesNotMatch(message.text, /It would become appropriate only if/i, question.questionId);
      }

      const orders = [];
      for (let seed = 0; seed < 16 && orders.length < 2; seed++) {
        const order = prepareCanonicalOptionOrder(question, `ai901-20261023:${question.questionId}:${seed}`, pin);
        if (!orders.some((existing) => JSON.stringify(existing) === JSON.stringify(order))) orders.push(order);
      }
      assert.equal(orders.length, 2, `${question.questionId}: obtain two distinct option orders`);
      for (const order of orders) {
        const displayed = projectCanonicalQuestionInSessionOrder(question, [...order]);
        assert.deepEqual(displayed.interaction.options.map(({ optionId }) => optionId), order);
        for (const { optionId } of displayed.interaction.options) {
          const response = { type: "choice_single", optionId };
          const isCorrect = optionId === question.answer.optionId;
          const result = scoreCanonicalQuestion(displayed, response);
          assert.equal(result.kind, isCorrect ? "correct" : "incorrect", `${question.questionId}/${optionId}`);
          assert.equal(result.earnedPoints, isCorrect ? 1 : 0, `${question.questionId}/${optionId}`);
          assert.equal(scoreQuestion(displayed, response).earnedPoints, result.earnedPoints);
          const feedback = composeCanonicalFeedback(displayed, response, result);
          assert.deepEqual(feedback.messages, isCorrect ? [] : [wrongMessages.find(({ targetId }) => targetId === optionId)]);
        }
        assert.throws(() => projectCanonicalQuestionInSessionOrder(question, order.map(() => order[0])), /Saved control order/);
      }
      const unknown = { type: "choice_single", optionId: "unknown-option" };
      assert.equal(scoreCanonicalQuestion(question, unknown).earnedPoints, 0);
      assert.throws(() => composeCanonicalFeedback(question, unknown, scoreCanonicalQuestion(question, unknown)), /incomplete or invalid/);
    }
  }
  assert.equal(ids.length, 108);
  assert.equal(new Set(ids).size, 108);
  assert.equal(bank.questions.filter((question) => units.some((unit) => question.mentalUnitId === `AI901-N01-${unit}`)).flatMap((question) => question.feedback.messages.filter(({ kind }) => kind === "wrong_option")).length, 324);
});

test("P01 rejects a missing or retargeted wrong-option message", () => {
  const original = bank.byId.get("AI901-N01-B04-Q001");
  const assertCompleteWrongTargets = (question) => {
    const expected = question.interaction.options.filter(({ optionId }) => optionId !== question.answer.optionId).map(({ optionId }) => optionId).sort();
    const actual = question.feedback.messages.filter(({ kind }) => kind === "wrong_option").map(({ targetId }) => targetId).sort();
    assert.deepEqual(actual, expected);
  };
  assertCompleteWrongTargets(original);
  for (const mutate of [
    (question) => question.feedback.messages.pop(),
    (question) => { question.feedback.messages[0].targetId = "unknown-option"; }
  ]) {
    const malformed = structuredClone(original);
    mutate(malformed);
    assert.throws(() => assertCompleteWrongTargets(malformed));
  }
});

test("P02: seven Q001 scenarios, accepted decisions and explanations agree without the auditability premise", () => {
  for (const [unit, [prompt, optionText, reason]] of Object.entries(p02)) {
    const question = bank.byId.get(`AI901-N01-${unit}-Q001`);
    assert.ok(question, unit);
    assert.equal(question.prompt, prompt);
    assert.equal(question.constraints.length, 1);
    assert.equal(question.answer.optionId, "a");
    assert.equal(question.interaction.options.find(({ optionId }) => optionId === "a").text, optionText);
    assert.equal(question.feedback.reason, reason);
    assert.equal(validateQuestion(question).valid, true);
    assert.doesNotMatch(JSON.stringify({ prompt: question.prompt, constraints: question.constraints, optionText, reason }), /auditable by a reviewer/i);
    assert.doesNotMatch(JSON.stringify(question.constraints), /Primary mental unit|Choose one answer/i);
  }
  assert.match(bank.byId.get("AI901-N01-B10-Q001").prompt, /Representative batch measurements show that the smallest candidate also has the lowest resource cost/i);
});

test("P03: Q007 states its symptom and keeps its diagnostic decision; each old Q010 is replaced by a fresh Q014 decision identity", () => {
  for (const [unit, [symptom, transfer, answerText]] of Object.entries(p03)) {
    const diagnostic = bank.byId.get(`AI901-N01-${unit}-Q007`);
    assert.ok(diagnostic, `${unit}: Q007`);
    assert.ok(diagnostic.prompt.startsWith(symptom), diagnostic.questionId);
    assert.match(diagnostic.prompt, /What should the team check first before changing the model\?|Which model capability must be revalidated\?/i);
    assert.equal(diagnostic.answer.optionId, "c");
    assert.equal(diagnostic.interaction.options.find(({ optionId }) => optionId === "c").text, "Diagnose whether the observed symptom conflicts with the requirement, evidence, or capability boundary before changing the model.");
    assert.equal(validateQuestion(diagnostic).valid, true, diagnostic.questionId);

    const revised = bank.byId.get(`AI901-N01-${unit}-Q014`);
    assert.ok(revised, `${unit}: new Q014`);
    assert.equal(bank.byId.has(`AI901-N01-${unit}-Q010`), false, `${unit}: retired Q010 identity`);
    assert.equal(revised.prompt, transfer);
    assert.equal(revised.answer.optionId, revised.interaction.options.find(({ text }) => text === answerText)?.optionId);
    assert.match(revised.answer.optionId, new RegExp(`^${unit.toLowerCase()}_14_`));
    assert.equal(validateQuestion(revised).valid, true, revised.questionId);
    const wrongIds = revised.interaction.options.filter(({ optionId }) => optionId !== revised.answer.optionId).map(({ optionId }) => optionId).sort();
    assert.deepEqual(revised.feedback.messages.map(({ targetId }) => targetId).sort(), wrongIds);
  }
});
