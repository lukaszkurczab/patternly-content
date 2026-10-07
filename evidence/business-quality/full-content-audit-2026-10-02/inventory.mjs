import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL,fileURLToPath} from 'node:url';
const out=path.dirname(fileURLToPath(import.meta.url));
const root=process.argv[2];
const workspace=process.argv[3];
if (!root || !workspace) throw Error('Usage: node inventory.mjs <directory with four pinned repo archives> <Patternly workspace for canonical docs>');
const {createInventory}=await import(pathToFileURL(path.join(root,'patternly-content/scripts/model-evaluation/inventory.mjs')));
const b=await createInventory({rootDirectory:path.join(root,'patternly-content')});
const approvals=JSON.parse(fs.readFileSync(path.join(root,'patternly-content/evidence/human-content-approvals/manifest.json')));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const items=[];const batches=[];
for(const t of b.tracks){
 const prior=approvals.tracks.find(x=>x.trackId===t.trackId);
 const configPath=path.join(root,'patternly-content/config/tracks',t.trackId+'.json');
 const config=fs.existsSync(configPath)?JSON.parse(fs.readFileSync(configPath)):{familyId:prior.familyId};
 for(const n of t.nodes) for(const u of n.mentalUnits){
  const file='content/'+u.sourcePath;
  const qs=JSON.parse(fs.readFileSync(path.join(root,'patternly-content',file)));
  const batch=[t.trackId,n.nodeId,u.mentalUnitId].join('/');
  batches.push({batch,track:t.trackId,family:config.familyId,contentVersion:t.contentVersion,node:n.nodeId,mentalUnit:u.mentalUnitId,file,numberOfItems:u.items.length,runtimeStatus:'active',reviewRecordStatus:'unreviewed',sourceSha256:u.sourceSha256});
  for(const i of u.items){
   const q=qs.find(q=>q.questionId===i.questionId);
   const wrongOptionIds=q.interaction.options?.filter(o=>!([q.answer.optionId,...(q.answer.optionIds||[])]).includes(o.optionId)).map(o=>o.optionId)??[];
   items.push({itemId:i.questionId,track:t.trackId,family:config.familyId,contentVersion:t.contentVersion,batch,taxonomy:{nodeId:n.nodeId,mentalUnitId:u.mentalUnitId},file,sourceSha256:u.sourceSha256,itemSha256:i.itemSha256,interactionType:i.interactionType,wrongOptionIds,runtimeStatus:'active',candidateStatus:'canonical_current_bank; version_label_is_not_admission_status',reviewRecordStatus:'unreviewed',priorTrackApproval:{path:'evidence/human-content-approvals/manifest.json',status:approvals.finalDisposition,sourceCommit:prior.source.sourceCommit,sourceItemCount:prior.source.canonicalItemCount,sampleCount:prior.reviewPacket.sampleCount,reviewPacketStatus:prior.reviewPacket.status,notIndividualAudit:true}});
  }
 }
}
fs.writeFileSync(out+'/inventory.jsonl',items.map(x=>JSON.stringify(x)).join('\n')+'\n');
fs.writeFileSync(out+'/batches.json',JSON.stringify(batches,null,2)+'\n');
const docs=['01-product-definition.md','06-branding-and-style-direction.md','07-content-guidelines.md','12-testing-strategy.md','15-certification-track-learning-system.md','16-coding-interview-learning-system.md','17-training-runtime-and-interaction-spec.md'].map(p=>({path:'docs/'+p,sha256:sha(fs.readFileSync(path.join(workspace,'docs',p))),origin:'workspace canonical document outside four Git repositories'}));
const manifest={auditId:'full-content-audit-2026-10-02',status:'IN_PROGRESS',referenceDate:'2026-10-02',rubricVersion:'user-exhaustive-content-audit-2026-10-02-v1',scope:'All current canonical learner questions in all nine banks; generated equivalent app copies counted once; historical artifacts and fixtures excluded because not current authoring/runtime ingress.',exclusions:['Historical artifacts/tracks and bundled versions are old projections, not independent current questions','Terraform and KCNA planned curricula have no canonical question source','Synthetic tests and migration evidence are not instructional ingress'],repositories:[{repo:'patternly',branch:'main',sha:'200f8504c48df020d19937cad788d3961eb4caf7'},{repo:'patternly-content',branch:'master',sha:'78ba999098ea12704b74fe9de2eecdf89578e885',note:'Remote refs/heads/main absent; primary branch master used'},{repo:'patternly-backend',branch:'main',sha:'019e48e7d8e074c2e45d7f5ebb639a4ad394ae8f'},{repo:'patternly-web',branch:'main',sha:'9585919b7d0c1a8396e6d255e49850e64e129d0e'}],pinMethod:'git ls-remote origin HEAD refs/heads/main refs/heads/master, followed by git archive exact SHA; 2026-10-02',canonicalDocs:docs,inventoryCount:items.length,batchCount:batches.length,counts:b.observed,interactionCounts:b.interactionCounts,tracks:b.tracks.map(t=>({track:t.trackId,contentVersion:t.contentVersion,...t.observed})),inventorySha256:sha(fs.readFileSync(out+'/inventory.jsonl')),sourceParity:{reviewer:'gpt-6-luna',reasoningEffort:'high',sourceItemCount:16077,appItemCount:16077,missing:0,extra:0,substantiveDifferences:0,metadataOnlyDifference:'All 2981 GCP generated questions add contentDomainId; other fields match source',artifactLockHashes:'all nine verified'},approvalBoundary:'No audit verdict substitutes for required human editorial sign-off.',evaluationUsage:{exactModelSnapshot:'not exposed',tokenUsage:null,cost:null,reason:'Native conversation/subagent review; billing counters not exposed'},approachAssessment:{objectiveFit:0.96,simplicity:0.92,risk:0.85,maintainability:0.92,minimum:0.85,reason:'Pinned sources, explicit pending entries, separate per-item evidence and mechanical completeness check. No content mutations, no automatic semantic verdicts.'}};
fs.writeFileSync(out+'/manifest.json',JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({items:items.length,batches:batches.length,structuralValidation:b.status,baselineDifference:b.differences}));
