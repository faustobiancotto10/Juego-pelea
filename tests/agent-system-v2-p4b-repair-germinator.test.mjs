import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  cloneModel,
  loadV2Model,
  validateLoadedModel,
  withResolvedRemoteClaims,
} from '../scripts/lib/coord-v2-model.mjs';

const AUTH='refs/heads/coord-v2-claims/authority';
const PARENT='fc8d65c2a71059768f9d91b597370e4d4d1cd940';

const entry=(value,path='fixture.json')=>({path,value});

function claim(id,slotId,taskId,instanceId){
  return {
    schemaVersion:1,
    id,
    slotId,
    taskId,
    roleId:'mario',
    instanceId,
    expectedParentSha:PARENT,
  };
}

test('P4-B repair declares exactly one shared claim authority distinct from legacy slot refs',()=>{
  const model=loadV2Model(process.cwd());
  assert.equal(model.configDoc.claimAuthorityRef,AUTH);

  const p4bOne=model.slotsEntries.find(e=>e.value.id==='P4-B-ONE-S1').value;
  const p4bTwo=model.slotsEntries.find(e=>e.value.id==='P4-B-TWO-S1').value;
  assert.notEqual(p4bOne.claimRef,AUTH);
  assert.notEqual(p4bTwo.claimRef,AUTH);
  assert.notEqual(p4bOne.claimRef,p4bTwo.claimRef);
});

test('remote reconstruction resolves one shared authority snapshot exactly once',()=>{
  const model=cloneModel(loadV2Model(process.cwd()));
  let calls=0;
  const remote=withResolvedRemoteClaims(model,(ref)=>{
    calls+=1;
    assert.equal(ref,AUTH);
    return {headSha:PARENT,claims:[]};
  });
  assert.equal(calls,1);
  assert.equal(remote.remoteClaimAuthorityHead,PARENT);
  assert.deepEqual(remote.claimsEntries,[]);
});

test('same instance cannot occupy both P4-B slots in one authority ledger',()=>{
  const model=cloneModel(loadV2Model(process.cwd()));
  model.claimsEntries=[
    entry(claim('claim:one','P4-B-ONE-S1','P4-B-ONE','mario-v2-p4-b'),'one.json'),
    entry(claim('claim:two','P4-B-TWO-S1','P4-B-TWO','mario-v2-p4-b'),'two.json'),
  ];
  const result=validateLoadedModel(model);
  assert.ok(result.errors.some(e=>/instance mario-v2-p4-b occupies multiple slots/.test(e)),JSON.stringify(result.errors));
});

test('same slot cannot admit two owners in one authority ledger',()=>{
  const model=cloneModel(loadV2Model(process.cwd()));
  model.claimsEntries=[
    entry(claim('claim:a','P4-B-ONE-S1','P4-B-ONE','mario-v2-p4-b'),'a.json'),
    entry(claim('claim:b','P4-B-ONE-S1','P4-B-ONE','mario-v2-p4-a'),'b.json'),
  ];
  const result=validateLoadedModel(model);
  assert.ok(result.errors.some(e=>/duplicate active claim owner/.test(e)),JSON.stringify(result.errors));
});

test('overlapping active paths remain a global invariant under the shared ledger',()=>{
  const model=cloneModel(loadV2Model(process.cwd()));
  const two=model.slotsEntries.find(e=>e.value.id==='P4-B-TWO-S1');
  two.value.ownedPaths=['coordination/v2/trials/P4-B/one/sub/**'];
  model.claimsEntries=[
    entry(claim('claim:a','P4-B-ONE-S1','P4-B-ONE','mario-v2-p4-b'),'a.json'),
    entry(claim('claim:b','P4-B-TWO-S1','P4-B-TWO','mario-v2-p4-a'),'b.json'),
  ];
  const result=validateLoadedModel(model);
  assert.ok(result.errors.some(e=>/ownedPaths overlap/.test(e)),JSON.stringify(result.errors));
});

test('claim client gates on fetched authority HEAD and pushes only to shared authority without force',()=>{
  const source=readFileSync('scripts/coord-v2-claim.mjs','utf8');
  assert.match(source,/remoteClaimAuthorityHead/);
  assert.match(source,/HEAD .*fetched claim authority head/);
  assert.match(source,/\$\{candidate\}:\$\{claimAuthorityRef\}/);
  assert.doesNotMatch(source,/\$\{candidate\}:\$\{slot\.claimRef\}/);
  assert.doesNotMatch(source,/--force|force-with-lease/);
  assert.match(source,/CLAIM_LOST/);
  assert.match(source,/Reread global current state/i);
});

test('reassignment uses the same shared authority and cannot bypass global serialization',()=>{
  const source=readFileSync('scripts/coord-v2-reassign.mjs','utf8');
  assert.match(source,/remoteClaimAuthorityHead/);
  assert.match(source,/HEAD .*claim authority head/);
  assert.match(source,/\$\{candidate\}:\$\{claimAuthorityRef\}/);
  assert.doesNotMatch(source,/\$\{candidate\}:\$\{slot\.claimRef\}/);
  assert.doesNotMatch(source,/--force|force-with-lease/);
  assert.match(source,/replacementOf/);
  assert.match(source,/checkpoint .* task lineage/);
});

test('legacy failed P4-B refs are documented as evidence-only and P4-B rerun remains gated by Germinator',()=>{
  const readme=readFileSync('coordination/v2/README.md','utf8');
  const boot=readFileSync('coordination/BOOT.md','utf8');
  const handoff=readFileSync('coordination/handoffs/AGENT-SYSTEM-V2-P4B-REPAIR-gonza.md','utf8');

  assert.match(readme,/historical evidence, not current occupancy authority/i);
  assert.match(boot,/legacy per-slot claim ref.*historical evidence/i);
  assert.match(handoff,/P4-B has NOT been rerun/i);
  assert.match(handoff,/Germinator independent audit/i);
  assert.match(handoff,/do not skip directly to P4-C/i);
});
