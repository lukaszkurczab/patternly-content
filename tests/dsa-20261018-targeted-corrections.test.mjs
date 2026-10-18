import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { scoreQuestion, validateQuestion } from '../scripts/content/question-contract.mjs';
import { sha256 } from '../scripts/build.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const proof=JSON.parse(readFileSync(root+'evidence/business-quality/dsa-20261018-targeted-corrections.json'));
const byId=new Map(proof.items.map(i=>[i.questionId,i.currentQuestion]));
const q=id=>byId.get(id), f=n=>q(`alg-arrays-frequency-state-${String(n).padStart(3,'0')}`), d=n=>q(`alg-arrays-duplicate-handling-${String(n).padStart(3,'0')}`), norm=n=>q(`alg-arrays-normalization-comparison-${String(n).padStart(3,'0')}`);
const compare=(a,b)=>a.questionId<b.questionId?-1:a.questionId>b.questionId?1:0;
function bankAt(commit){
 const paths=execFileSync('git',['ls-tree','-r','--name-only',commit,`content/${proof.trackId}/`],{cwd:root,encoding:'utf8'}).trim().split('\n').filter(path=>path.endsWith('.json'));
 return paths.flatMap(path=>JSON.parse(execFileSync('git',['show',`${commit}:${path}`],{cwd:root,encoding:'utf8'}))).sort(compare);
}
function currentBank(){
 const paths=execFileSync('git',['ls-tree','-r','--name-only',proof.beforeProducerCommit,`content/${proof.trackId}/`],{cwd:root,encoding:'utf8'}).trim().split('\n').filter(path=>path.endsWith('.json'));
 return paths.flatMap(path=>JSON.parse(readFileSync(root+path,'utf8'))).sort(compare);
}

test('exact 23-item batch reconstructs the 3404-question predecessor and binds before/current source identities',()=>{
 assert.equal(proof.items.length,23);
 assert.equal(proof.beforeQuestionCount,3404);
 assert.equal(proof.questionCount,3404);
 const beforeBank=bankAt(proof.beforeProducerCommit), afterBank=currentBank();
 assert.equal(beforeBank.length,3404);assert.equal(afterBank.length,3404);
 assert.equal(sha256(beforeBank),proof.beforeQuestionSetSha256);
 assert.equal(sha256(afterBank),proof.questionSetSha256);
 const sourceHashes=new Map(proof.sourceFiles.map(entry=>[entry.path,entry]));
 assert.equal(sourceHashes.size,7);
 for(const [path,hashes] of sourceHashes){
  const beforeBytes=execFileSync('git',['show',`${proof.beforeProducerCommit}:${path}`],{cwd:root});
  const currentBytes=readFileSync(root+path);
  assert.equal(sha256(beforeBytes),hashes.beforeSha256,path+' predecessor bytes');
  assert.equal(sha256(currentBytes),hashes.currentSha256,path+' current bytes');
 }
 for(const path of new Set(proof.items.map(i=>i.sourceFile))){
  const before=JSON.parse(execFileSync('git',['show',`${proof.beforeProducerCommit}:${path}`],{cwd:root,encoding:'utf8'}));
  const current=JSON.parse(readFileSync(root+path));
  for(const item of proof.items.filter(i=>i.sourceFile===path)){
   assert.equal(item.packageId>= '01'&&item.packageId<= '08',true,item.questionId+' package');
   assert.deepEqual(before.find(q=>q.questionId===item.beforeQuestionId),item.beforeQuestion);
   assert.deepEqual(current.find(q=>q.questionId===item.questionId),item.currentQuestion);
   assert.notDeepEqual(item.beforeQuestion,item.currentQuestion);
   assert.equal(item.identityAction,item.beforeQuestionId===item.questionId?'preserve_question_id':'new_question_id');
   const v=validateQuestion(item.currentQuestion);assert.equal(v.valid,true,JSON.stringify(v));
  }
  const reconstructed=current.map(question=>proof.items.find(i=>i.sourceFile===path&&i.questionId===question.questionId)?.beforeQuestion??question).sort(compare);
  assert.deepEqual(reconstructed,before.sort(compare));
 }
 const actualNewIdPairs=proof.items.filter(i=>i.identityAction==='new_question_id').map(i=>[i.beforeQuestionId,i.questionId]).sort((a,b)=>a.join('\0').localeCompare(b.join('\0')));
 const expectedNewIdPairs=[
  ['alg-arrays-duplicate-handling-008','alg-arrays-duplicate-handling-020'],
  ['alg-arrays-duplicate-handling-010','alg-arrays-duplicate-handling-019'],
  ['alg-arrays-frequency-state-018','alg-arrays-frequency-state-021'],
  ['alg-arrays-normalization-comparison-007','alg-arrays-normalization-comparison-019'],
  ['alg-arrays-output-space-007','alg-arrays-output-space-021'],
  ['alg-arrays-stable-compaction-003','alg-arrays-stable-compaction-023'],
  ['alg-arrays-stable-compaction-019','alg-arrays-stable-compaction-022'],
  ['alg-backtracking-base-contract-013','alg-backtracking-base-contract-017'],
 ].sort((a,b)=>a.join('\0').localeCompare(b.join('\0')));
 assert.deepEqual(actualNewIdPairs,expectedNewIdPairs);
 assert.equal(JSON.parse(readFileSync(root+'content/catalog.json')).tracks.find(t=>t.trackId===proof.trackId).contentVersion,proof.contentVersion);
 assert.notEqual(proof.contentVersion,proof.beforeContentVersion);
 assert.deepEqual(Object.fromEntries(['01','02','03','04','05','06','07','08'].map(id=>[id,proof.items.filter(i=>i.packageId===id).length])),{ '01':3,'02':3,'03':3,'04':2,'05':3,'06':2,'07':3,'08':4 });
});

test('all single-choice permutations retain the unique key and exact wrong-option feedback IDs',()=>{
 function permutations(a){return a.length?a.flatMap((v,i)=>permutations(a.filter((_,j)=>j!==i)).map(rest=>[v,...rest])):[[]];}
 for(const item of byId.values())if(item.interaction.type==='choice_single')for(const options of permutations(item.interaction.options))for(const option of options){
  const score=scoreQuestion({...item,interaction:{...item.interaction,options}},{type:'choice_single',optionId:option.optionId});
  assert.equal(score.earnedPoints,option.optionId===item.answer.optionId?1:0,item.questionId+'/'+option.optionId);
  if(option.optionId!==item.answer.optionId)assert.equal(item.feedback.messages.filter(m=>m.kind==='wrong_option'&&m.targetId===option.optionId).length,1);
 }
 for(const [item,pattern]of [[f(1),/expected O\(1\) membership checks/],[f(3),/first index.*expected O\(1\) lookup/],[f(17),/without storing the input sequence or full occurrence counts/],[d(6),/exactly min\(original frequency, 2\)/],[d(11),/ascending order/],[d(17),/separate newly allocated result array/],[norm(2),/only of ASCII characters/],[norm(10),/only lowercase English letters a–z/],[f(11),/duplicate runs or run boundaries/]])assert.match(item.prompt,pattern);
});

test('three complexity cases gain the missing dimension; bad dimensions still lose exactly one point',()=>{
 for(const [item,id,canonical,removed,wrong]of [[f(16),'auxiliary_space','O(1)','O(26)','O(n)'],[f(20),'time','O(n)','O(n + d)','O(1)'],[q('alg-arrays-output-space-016'),'auxiliary_space','O(1)','O(26)','O(n + m)']]){
  const dim=item.interaction.dimensions.find(d=>d.dimensionId===id);assert.deepEqual(dim.acceptedValueIds,[canonical]);assert.deepEqual(item.answer.selectedValueIdsByDimension[id],[canonical]);assert.ok(!dim.values.some(v=>v.valueId===removed));assert.ok(dim.values.length>=2);
  const max=item.interaction.dimensions.length;assert.equal(scoreQuestion(item,item.answer).earnedPoints,max);
  const bad=structuredClone(item.answer);bad.selectedValueIdsByDimension[id]=[wrong];const result=scoreQuestion(item,bad);assert.equal(result.earnedPoints,max-1);assert.deepEqual(result.incorrectDimensionIds,[id]);
  bad.selectedValueIdsByDimension[id]=[removed];assert.equal(scoreQuestion(item,bad).invalidResponse,true);
  if(dim.aliases.fixed_alphabet){bad.selectedValueIdsByDimension[id]=['fixed_alphabet'];assert.equal(scoreQuestion(item,bad).status,'correct');}
  assert.equal(scoreQuestion(proof.items.find(i=>i.questionId===item.questionId).beforeQuestion,item.answer).earnedPoints,max-1);
 }
 const output=q('alg-arrays-output-space-016'),outputDimension=output.interaction.dimensions.find(d=>d.dimensionId==='output_space');
 assert.deepEqual(outputDimension.acceptedValueIds,['O(1)']);
 assert.ok(!outputDimension.values.some(value=>value.valueId==='O(26)'));
 assert.equal(scoreQuestion(output,output.answer).earnedPoints,3);
 const obsolete=structuredClone(output.answer);obsolete.selectedValueIdsByDimension.output_space=['O(26)'];
 assert.equal(scoreQuestion(output,obsolete).invalidResponse,true);
 for(const id of ['alg-arrays-frequency-state-016','alg-arrays-frequency-state-020','alg-arrays-output-space-016'])assert.match(q(id).prompt,/tightest listed .* complexity bounds/);
});

test('multi-choice scoring keeps empty and any wrong selection at zero',()=>{
 const item=d(11),score=optionIds=>scoreQuestion(item,{type:'choice_multiple',optionIds});
 assert.equal(score(item.answer.optionIds).earnedPoints,4);assert.equal(score([]).earnedPoints,0);assert.equal(score([...item.answer.optionIds,'physical_length_must_shrink']).earnedPoints,0);assert.equal(score([item.answer.optionIds[0]]).earnedPoints,2);
});

test('concrete counterexamples establish the authored requirements',()=>{
 const seen=new Set();assert.equal([4,7,4].some(v=>seen.has(v)||(seen.add(v),false)),true);
 const first=new Map();['a','b','a'].forEach((v,i)=>{if(!first.has(v))first.set(v,i);});assert.equal(first.get('a'),0);
 const parity=a=>{const m=new Map();for(const v of a)m.set(v,!m.get(v));return [...m.values()].every(x=>!x);};assert.equal(parity([4,7,4,7]),true);assert.equal(parity([4,7]),false);
 const capped=a=>{const m=new Map();return a.filter(v=>{const c=m.get(v)??0;m.set(v,c+1);return c<2;});};for(const n of [0,1,2,3,4])assert.equal(capped(Array(n).fill(7)).length,Math.min(n,2));
 assert.deepEqual([...new Set([2,2,3])],[2,3]);
 const ascii=s=>s.replace(/[^A-Za-z0-9]/g,'').toLowerCase();assert.equal(ascii('A-B'),ascii('ab'));assert.notEqual(ascii('AB'),ascii('BA'));assert.equal(/^[\x00-\x7f]*$/.test('é'),false);
 const vector=s=>Array.from({length:26},(_,i)=>[...s].filter(c=>c.charCodeAt(0)===97+i).length);assert.notDeepEqual(vector('aab'),vector('abb'));
 const adjacent=a=>a.some((v,i)=>i>0&&v===a[i-1]);assert.equal(adjacent([1,1,2]),true);assert.equal(adjacent([2,3,2]),false);
 assert.deepEqual(['A','-','A','-','B'].filter(c=>c!=='-'),['A','A','B']);assert.equal(scoreQuestion(norm(4),{type:'choice_single',optionId:'sort_output'}).earnedPoints,0);
 const alternates=a=>a.every((v,i)=>i===0||v!==a[i-1]);assert.equal(alternates([1,2,1,2]),true);assert.equal(alternates([1,1,2,2]),false);
});

test('candidate-specific dependency and backtracking terminal decisions replace arbitrary ordering',()=>{
 assert.match(d(13).prompt,/candidate-specific.*derived from a suspected failure/);assert.match(d(13).interaction.elements.find(e=>e.elementId==='construct_counterexample').text,/suspected violation you just identified/);assert.equal(scoreQuestion(d(13),d(13).answer).earnedPoints,3);
 const old=proof.items.find(i=>i.beforeQuestionId==='alg-backtracking-base-contract-013').beforeQuestion;const reversed=structuredClone(old.answer);[reversed.orderedElementIds[0],reversed.orderedElementIds[1]]=[reversed.orderedElementIds[1],reversed.orderedElementIds[0]];assert.equal(scoreQuestion(old,reversed).earnedPoints,1);
 const terminal=(s,first)=>{const fail=()=>s.failure?[]:null,complete=()=>s.complete?['snapshot']:null;return(first?[complete,fail]:[fail,complete]).map(f=>f()).find(x=>x!==null)??['expand'];};for(const s of [{complete:true,failure:false},{complete:false,failure:true},{complete:false,failure:false}])assert.deepEqual(terminal(s,true),terminal(s,false));
 const fresh=q('alg-backtracking-base-contract-017');assert.equal(fresh.interaction.type,'choice_single');assert.equal(scoreQuestion(fresh,fresh.answer).earnedPoints,1);
});
