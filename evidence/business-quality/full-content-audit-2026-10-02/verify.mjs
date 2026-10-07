import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const readLines=p=>fs.readFileSync(p,'utf8').split('\n').filter(x=>x.trim()).map(x=>JSON.parse(x));
const inventory=readLines(root+'/inventory.jsonl');
const manifest=JSON.parse(fs.readFileSync(root+'/manifest.json'));
const rubric=JSON.parse(fs.readFileSync(root+'/rubric.json'));
const hash=crypto.createHash('sha256').update(fs.readFileSync(root+'/inventory.jsonl')).digest('hex');
if(hash!==manifest.inventorySha256) throw Error('Inventory fingerprint mismatch');
const key=r=>[r.track,r.contentVersion,r.itemId].join('|');
const index=new Map(inventory.map(r=>[key(r),r]));
if(index.size!==inventory.length||inventory.length!==manifest.inventoryCount) throw Error('Inventory duplicate/count mismatch');
// Invalidated originals remain historical evidence even if a cached writer restores them.
// Only independently reconciled rows in a different review file may restore coverage.
const exclusions=new Map();const exclusionReports=[];const excludedOriginalChanges=[];
const invalidatedDir=root+'/invalidated';
if(fs.existsSync(invalidatedDir))for(const reportFile of fs.readdirSync(invalidatedDir).filter(f=>f.endsWith('-reconciliation.json')).sort()){
 const report=JSON.parse(fs.readFileSync(invalidatedDir+'/'+reportFile));
 if(report.status!=='PENDING_INDEPENDENT_SOURCE_RECONCILIATION'||report.originalFile!=='reviews/ood.jsonl'||!Array.isArray(report.itemIds)||!report.reason)throw Error('Malformed invalidation report: '+reportFile);
 if(typeof report.preservedFile!=='string'||!/^invalidated\/[A-Za-z0-9_-]+\.jsonl$/.test(report.preservedFile))throw Error('Unsafe preserved review path: '+reportFile);
 const preserved=readLines(root+'/'+report.preservedFile);
 if(new Set(report.itemIds).size!==report.itemIds.length||new Set(preserved.map(r=>r.itemId)).size!==preserved.length||JSON.stringify([...report.itemIds].sort())!==JSON.stringify(preserved.map(r=>r.itemId).sort()))throw Error('Invalidation ID coverage mismatch: '+reportFile);
 for(const r of preserved){
  const i=index.get(key(r));
  if(!i||r.itemSha256!==i.itemSha256)throw Error('Invalidated source identity mismatch: '+r.itemId);
  if(r.file===i.file&&r.batch===i.batch&&JSON.stringify(r.taxonomy)===JSON.stringify(i.taxonomy))throw Error('Missing recorded structural mismatch: '+r.itemId);
  const pair='ood.jsonl|'+r.itemId;
  if(exclusions.has(pair))throw Error('Overlapping invalidation reports: '+r.itemId);
  exclusions.set(pair,{row:r,report:'invalidated/'+reportFile});
 }
 exclusionReports.push({report:'invalidated/'+reportFile,originalFile:report.originalFile,preservedFile:report.preservedFile,itemIds:report.itemIds,reason:report.reason});
}
const reviews=new Map();const errors=[];
for(const f of fs.readdirSync(root+'/reviews').filter(f=>f.endsWith('.jsonl')).sort()){
 for(const r of readLines(root+'/reviews/'+f)){
  const excluded=exclusions.get(f+'|'+r.itemId);
  if(excluded){if(JSON.stringify(r)!==JSON.stringify(excluded.row))excludedOriginalChanges.push({file:f,itemId:r.itemId,report:excluded.report});continue;}
  const k=key(r);const i=index.get(k);const problem=m=>errors.push({file:f,itemId:r.itemId,error:m});
  if(!i){problem('Not in pinned inventory');continue;}
  if(reviews.has(k)){problem('Duplicate review');continue;}
  for(const field of ['itemSha256','file','batch'])if(r[field]!==i[field])problem('Identity mismatch: '+field);
  if(JSON.stringify(r.taxonomy)!==JSON.stringify(i.taxonomy))problem('Taxonomy mismatch');
  if(!rubric.verdicts.includes(r.verdict))problem('Missing/invalid verdict');
  for(const d of rubric.dimensions){const v=r.dimensions?.[d];if(!v||!rubric.dimensionStatuses.includes(v.status)||typeof v.evidence!=='string'||!v.evidence.trim())problem('Missing complete dimension: '+d);}
  if(r.verdict==='PASS'&&rubric.dimensions.some(d=>!['PASS','NOT_APPLICABLE'].includes(r.dimensions?.[d]?.status)))problem('PASS contains failed/blocked dimension');
  if(!Array.isArray(r.findings)||r.verdict!=='PASS'&&!r.findings.length)problem('Missing findings');
  for(const f of r.findings||[])if(!f.code||!f.problem||!f.evidence||!f.remediation||!f.dimensions?.length)problem('Incomplete finding');
  const ds=r.distractors||[];const actual=ds.map(x=>x.optionId).sort();const expected=[...i.wrongOptionIds].sort();
  if(JSON.stringify(actual)!==JSON.stringify(expected))problem('Wrong-option review coverage mismatch');
  for(const d of ds)if(!d.misconception||!d.evidence||!d.explanationEvidence||!rubric.dimensionStatuses.includes(d.status)||!rubric.dimensionStatuses.includes(d.explanationStatus))problem('Incomplete distractor review: '+d.optionId);
  if(!r.interactionReview||!r.reviewer||!r.reviewedAt||!Array.isArray(r.duplicatePeers)||!Array.isArray(r.factChecks))problem('Missing review metadata');
  if(i.family==='certification'&&r.dimensions?.technical_correctness?.status==='PASS'&&!r.factChecks?.some(f=>f.url&&f.checkedDate&&f.claim&&f.evidence))problem('Certification factual PASS lacks sourced fact check');
  if(!errors.some(e=>e.file===f&&e.itemId===r.itemId))reviews.set(k,r);
 }
}
const counts=()=>Object.fromEntries(rubric.verdicts.map(x=>[x,0]));
const totals=counts();const tracks={};const defects={};
for(const i of inventory){let t=tracks[i.track]??={inventoryCount:0,auditedCount:0,pendingCount:0,...counts()};t.inventoryCount++;let r=reviews.get(key(i));if(r){totals[r.verdict]++;t[r.verdict]++;t.auditedCount++;for(const f of r.findings)defects[f.code]=(defects[f.code]||0)+1;}else t.pendingCount++;}
const pendingInvalidatedCount=[...exclusions.values()].filter(x=>!reviews.has(key(x.row))).length;
const summary={auditId:manifest.auditId,status:errors.length?'INVALID_LEDGER':reviews.size===inventory.length?'COMPLETE':'IN_PROGRESS',inventoryCount:inventory.length,auditedCount:reviews.size,pendingCount:inventory.length-reviews.size,coverageEqual:reviews.size===inventory.length,...totals,tracks,defectCounts:defects,validationErrors:errors,invalidatedOriginalReviewCount:exclusions.size,pendingInvalidatedCount,reviewExclusions:exclusionReports,excludedOriginalChanges,humanEditorialSignOff:'not_granted_by_this_audit'};
fs.writeFileSync(root+'/summary.json',JSON.stringify(summary,null,2)+'\n');
fs.writeFileSync(root+'/ledger.jsonl',inventory.map(i=>JSON.stringify({...i,auditStatus:reviews.has(key(i))?'REVIEWED':'PENDING',review:reviews.get(key(i))??null})).join('\n')+'\n');
console.log(JSON.stringify({status:summary.status,inventoryCount:summary.inventoryCount,auditedCount:summary.auditedCount,pendingCount:summary.pendingCount,...totals,errorCount:errors.length,errors:errors.slice(0,10)}));
if(errors.length)process.exitCode=1;
else if(process.argv.includes('--require-complete')&&!summary.coverageEqual)process.exitCode=2;
