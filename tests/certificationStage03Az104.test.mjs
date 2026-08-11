import assert from "node:assert/strict";
import { copyFile, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { artifactFingerprintForPlan, loadAndValidateStage03Az104CandidatePlan, loadStage03Az104CandidatePlan, loadStage03Az104SourceEvidence, validateStage03Az104CandidatePlan } from "../scripts/curriculum/certification-stage03-az104.mjs";
import { discoverSourceBatches } from "../scripts/publishing/pipeline.mjs";

const root=process.cwd(), plan=await loadStage03Az104CandidatePlan(root);
const candidate=(mutate,rehashed=true)=>{const copy=structuredClone(plan);mutate(copy);if(rehashed)copy.artifactFingerprint=artifactFingerprintForPlan(copy);return validateStage03Az104CandidatePlan(copy,{root})};
const rejects=async(cases)=>{for(const [name,mutate,code,raw] of cases)await test(name,async()=>assert.rejects(candidate(mutate,!raw),new RegExp(code)))};

test("AZ104 closes the explicit evidence-only two-node plan",async()=>{const r=await loadAndValidateStage03Az104CandidatePlan({root});assert.deepEqual({slots:r.slotCount,targets:r.targetCount,blocks:r.blockCount,sources:r.sourceCount},{slots:324,targets:81,blocks:48,sources:114});assert.deepEqual(r.nodeCounts,{azure_identity_governance_storage_and_deployment_foundations:153,azure_compute_network_operations_and_recovery:171});assert.deepEqual(r.runtimeReachability,{admitted:false,proof:"discoverSourceBatches only reads manual/source/<trackId>; this candidate is evidence-only."})});

await rejects([
 ["semantic hollow fails before artifact hash",p=>p.slots[0].questionIntent="generic scenario","SEMANTIC_OR_SOURCE_FORGERY"],
 ["wrong valid source property fails property gate",p=>{const d=p.slots[0].sourceRequirements.directFirstPartyDocumentation[0];d.sourceRefs=[p.sourceRecords.find(x=>x.sourceId!==d.sourceRefs[0]).sourceId]},"INVALID_SOURCE_PROPERTY_OWNERSHIP|SEMANTIC_OR_SOURCE_FORGERY"],
 ["objective binding fails",p=>p.slots[0].sourceRequirements.officialObjective.objectiveRefs=["forged"],"OFFICIAL_OBJECTIVE_BINDING_MISMATCH"],
 ["source trust co-mutation fails anchor",p=>p.sourceRecords[0].authoritativeFor.push("forged"),"SOURCE_ANCHOR_MISMATCH"],
 ["duplicate target fails",p=>p.targetPlans[1]=structuredClone(p.targetPlans[0]),"DUPLICATE_OR_OMIT|TARGET_PLAN_DRIFT"],
 ["omitted block fails",p=>p.blockPlans.pop(),"COUNT_DRIFT|DUPLICATE_OR_OMIT"],
 ["duplicate edge fails",p=>p.candidateCrossNodeRelationships[1]=structuredClone(p.candidateCrossNodeRelationships[0]),"INVALID_RELATIONSHIPS|EDGE_ROSTER_MISMATCH"],
 ["ownership fails",p=>p.candidateNodeOwnership[p.slots[0].slotId]="azure_compute_network_operations_and_recovery","INVALID_SLOT_REMAP"],
 ["node absorption fails",p=>p.candidateNodes[0].absorbedCurrentNodeIds.pop(),"NODE_OR_DAG_DRIFT"],
 ["DAG fails",p=>p.candidateNodes[1].prerequisiteNodeIds=[],"NODE_OR_DAG_DRIFT"],
 ["domain ownership fails",p=>p.objectiveAndDomainOwnership.primaryDomainSlotCapacity["az-104-2026-04-17-domain-1"]--,"DOMAIN_BINDING_MISMATCH"],
 ["mode lowering fails",p=>p.freePremiumAndModeFeasibility.requiredUniqueItems["certification-focus-practice"]=0,"MODE_FEASIBILITY"],
 ["mode extras fail",p=>p.freePremiumAndModeFeasibility.requiredUniqueItems.extra=1,"MODE_FEASIBILITY"],
 ["official profile fails",p=>p.examSimulationBlueprint.officialAZ104Profile.guideVersion="forged","OFFICIAL_PROFILE_MISMATCH"],
 ["practice fidelity fails",p=>p.examSimulationBlueprint.candidateChoiceOnlyPracticeForm.activeInteractionType="multiple_select","OFFICIAL_PROFILE_MISMATCH"],
 ["deletion roster fails",p=>p.reconciliation.deletedOrMergedSlots.pop(),"RECONCILIATION_DRIFT"],
 ["pilot claim fails",p=>p.reconciliation.stage02PilotReuse.pilotSlotCount=1,"BOUNDARY_DRIFT"],
 ["top-level learner field fails",p=>p.questions=["x"],"DECLARATION_SURFACE_MISMATCH|LEARNER_FIELD"],
 ["nested learner field fails",p=>p.targetPlans[0].questions=["x"],"LEARNER_FIELD|TARGET_PLAN_DRIFT"],
 ["approval claim fails",p=>p.scope.humanEditorialApprovalClaimed=true,"DECLARATION_SURFACE_MISMATCH"],
 ["runtime claim fails",p=>p.slots[0].deliveryInteraction.status="runtime-ready","INVALID_SLOT_MODE"],
 ["final artifact mismatch fails",p=>p.artifactFingerprint="0".repeat(64), "ARTIFACT_FINGERPRINT_MISMATCH",true],
]);

await rejects([
 ["scope unknown nested field fails",p=>p.scope.unrecognizedNested=true,"DECLARATION_SURFACE_MISMATCH"],
 ["self audit unknown nested field fails",p=>p.selfAudit.unrecognizedNested=true,"DECLARATION_SURFACE_MISMATCH"],
 ["baseline unknown nested field fails",p=>p.repositoryBaseline.unrecognizedNested=true,"DECLARATION_SURFACE_MISMATCH"],
 ["reconciliation unknown nested field fails",p=>p.reconciliation.unrecognizedNested=true,"RECONCILIATION_DRIFT"],
 ["derived counts unknown nested field fails",p=>p.derivedCounts.unrecognizedNested=true,"COUNT_DRIFT"],
 ["source verification unknown nested field fails",p=>p.sourceVerification.unrecognizedNested=true,"DECLARATION_SURFACE_MISMATCH"],
 ["file contract unknown nested field fails",p=>p.smallestImplementationFileContract.unrecognizedNested=true,"DECLARATION_SURFACE_MISMATCH"],
 ["practice form unknown nested field fails",p=>p.examSimulationBlueprint.candidateChoiceOnlyPracticeForm.unrecognizedNested=true,"OFFICIAL_PROFILE_MISMATCH"],
 ["practice allocation unknown nested field fails",p=>p.examSimulationBlueprint.candidateChoiceOnlyPracticeForm.domainAllocation[0].unrecognizedNested=true,"OFFICIAL_PROFILE_MISMATCH"],
 ["question alias fails recursively",p=>p.selfAudit.prompt="question alias","LEARNER_FIELD"],
 ["approval alias fails recursively",p=>p.selfAudit.humanEditorialApproval="approved","DECLARATION_SURFACE_MISMATCH"],
]);

test("AZ104 evidence candidate is never publishing discovery input",async()=>{const fixture=await mkdtemp(join(tmpdir(),"stage03-az104-discovery-"));try{const track="candidate-track";await mkdir(join(fixture,"manual/source",track),{recursive:true});await mkdir(join(fixture,"evidence/certification/planned-item-slot-track-plans"),{recursive:true});const source=join(fixture,"manual/source",track,"source.json"), evidence=join(fixture,"evidence/certification/planned-item-slot-track-plans","candidate.json");await writeFile(source,"{}");await writeFile(evidence,JSON.stringify(plan));const found=await discoverSourceBatches(fixture,track);assert.deepEqual(found.map(x=>x.path),[source]);assert.equal(found.some(x=>x.path===evidence),false)}finally{await rm(fixture,{recursive:true,force:true})}});

test("AZ104 durable source evidence fails closed on missing, tampered, duplicate, and wrong-host inputs",async()=>{const fixture=await mkdtemp(join(tmpdir(),"stage03-az104-evidence-"));try{const path=join(fixture,"evidence/certification/stage03-az104-source-http-check.json");await mkdir(join(fixture,"evidence/certification"),{recursive:true});await assert.rejects(loadStage03Az104SourceEvidence(fixture,plan));await copyFile(join(root,"evidence/certification/stage03-az104-source-http-check.json"),path);const e=JSON.parse(await import("node:fs/promises").then(m=>m.readFile(path,"utf8")));e.rows[0].finalUrl="https://evil.example/";await writeFile(path,JSON.stringify(e));await assert.rejects(loadStage03Az104SourceEvidence(fixture,plan),/SOURCE_EVIDENCE_MISMATCH/);e.rows[0].finalUrl="https://learn.microsoft.com/";e.rows[1].sourceId=e.rows[0].sourceId;await writeFile(path,JSON.stringify(e));await assert.rejects(loadStage03Az104SourceEvidence(fixture,plan),/SOURCE_EVIDENCE_MISMATCH/)}finally{await rm(fixture,{recursive:true,force:true})}});
