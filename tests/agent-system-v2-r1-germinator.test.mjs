import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import {
  buildProjection,
  cloneModel,
  loadV2Model,
  validateLoadedModel,
  withResolvedRemoteClaims,
} from '../scripts/lib/coord-v2-model.mjs';

const BASE='4a47962e563b8e444ab6cf6a288db66c13dda743';
const entry=(value,path='fixture.json')=>({path,value});

function task(id,slotId,ownedRole='gonza'){
  return {
    schemaVersion:1,
    id,
    roleId:ownedRole,
    kind:'qa-fixture',
    baseSha:BASE,
    lineageBaseSha:BASE,
    inputShas:[],
    dependencies:[],
    slotIds:[slotId],
    qaRequired:false,
    acceptance:['qa'],
    downstreamTaskId:null,
  };
}

function slot(id,taskId,ownedPaths){
  return {
    schemaVersion:1,
    id,
    taskId,
    roleId:'gonza',
    branchRef:`refs/heads/coord-v2-work/${id.toLowerCase()}`,
    claimRef:`refs/heads/coord-v2-claims/${id.toLowerCase()}`,
    baseSha:BASE,
    ownedPaths,
    integrationTarget:null,
  };
}

function instance(id){
  return {schemaVersion:1,id,roleId:'gonza',label:id,replacementOf:null};
}

function claim(id,slotId,taskId,instanceId,parent){
  return {
    schemaVersion:1,
    id,
    slotId,
    taskId,
    roleId:'gonza',
    instanceId,
    expectedParentSha:parent,
  };
}

test('R1 rejects malformed and missing required input SHAs under claim-time strict validation',()=>{
  const malformed=cloneModel(loadV2Model(process.cwd()));
  malformed.tasksEntries[0].value.inputShas=['not-a-git-sha'];
  const malformedResult=validateLoadedModel(malformed,{strictGit:true});
  assert.ok(malformedResult.errors.some(e=>/inputSha is not a 40-char SHA/.test(e)));

  const missing=cloneModel(loadV2Model(process.cwd()));
  missing.tasksEntries[0].value.inputShas=['1111111111111111111111111111111111111111'];
  const missingResult=validateLoadedModel(missing,{strictGit:true});
  assert.ok(missingResult.errors.some(e=>/inputSha .* unavailable in current checkout/.test(e)));
});

test('R1 rejects a real required input commit outside task lineage',()=>{
  const model=cloneModel(loadV2Model(process.cwd()));
  const head=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
  const tree=execFileSync('git',['rev-parse','HEAD^{tree}'],{encoding:'utf8'}).trim();
  const orphan=execFileSync('git',['commit-tree',tree],{
    input:'germinator orphan input\n',
    encoding:'utf8',
    env:{
      ...process.env,
      GIT_AUTHOR_NAME:'germinator-qa',
      GIT_AUTHOR_EMAIL:'germinator@example.invalid',
      GIT_COMMITTER_NAME:'germinator-qa',
      GIT_COMMITTER_EMAIL:'germinator@example.invalid',
    },
  }).trim();

  model.tasksEntries[0].value.baseSha=head;
  model.tasksEntries[0].value.lineageBaseSha=head;
  model.slotsEntries[0].value.baseSha=head;
  model.tasksEntries[0].value.inputShas=[orphan];

  const result=validateLoadedModel(model,{strictGit:true});
  assert.ok(result.errors.some(e=>/inputSha .* wrong lineage/.test(e)),JSON.stringify(result.errors));
});

test('R1 global aggregation sees two disjoint live claims together',()=>{
  const model=cloneModel(loadV2Model(process.cwd()));
  model.tasksEntries.push(entry(task('QA-T2','QA-T2-S1'),'qa-t2.json'));
  model.slotsEntries.push(entry(slot('QA-T2-S1','QA-T2',['coordination/v2/qa-disjoint/**']),'qa-t2-slot.json'));
  model.instancesEntries.push(entry(instance('gonza-v2-c'),'qa-c.json'));

  const remote=withResolvedRemoteClaims(model,(s)=>{
    if(s.id==='V2-TRIAL-CLAIM-001-S1'){
      const parent='aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
      return {
        headSha:'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        parentSha:parent,
        claim:claim('claim:live-a',s.id,s.taskId,'gonza-v2-a',parent),
      };
    }
    const parent='cccccccccccccccccccccccccccccccccccccccc';
    return {
      headSha:'dddddddddddddddddddddddddddddddddddddddd',
      parentSha:parent,
      claim:claim('claim:live-c',s.id,s.taskId,'gonza-v2-c',parent),
    };
  });

  const result=validateLoadedModel(remote);
  assert.deepEqual(result.errors,[]);
  assert.equal(result.stateFor('V2-TRIAL-CLAIM-001'),'CLAIMED');
  assert.equal(result.stateFor('QA-T2'),'CLAIMED');
  assert.equal(result.claimByInstance.get('gonza-v2-a').slotId,'V2-TRIAL-CLAIM-001-S1');
  assert.equal(result.claimByInstance.get('gonza-v2-c').slotId,'QA-T2-S1');

  const projection=buildProjection(remote,result);
  assert.equal(projection.v2.slots.filter(s=>s.state==='CLAIMED').length,2);
  assert.equal(projection.v2.instances.filter(i=>i.state==='ACTIVE').length,2);
});

test('R1 global aggregation blocks duplicate worker and overlapping active lanes across refs',()=>{
  const model=cloneModel(loadV2Model(process.cwd()));
  model.tasksEntries.push(entry(task('QA-T2','QA-T2-S1'),'qa-t2.json'));
  model.slotsEntries.push(entry(slot('QA-T2-S1','QA-T2',['coordination/v2/trials/V2-TRIAL-CLAIM-001/sub/**']),'qa-t2-slot.json'));

  const remote=withResolvedRemoteClaims(model,(s)=>{
    if(s.id==='V2-TRIAL-CLAIM-001-S1'){
      const parent='aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
      return {
        headSha:'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        parentSha:parent,
        claim:claim('claim:a',s.id,s.taskId,'gonza-v2-a',parent),
      };
    }
    const parent='cccccccccccccccccccccccccccccccccccccccc';
    return {
      headSha:'dddddddddddddddddddddddddddddddddddddddd',
      parentSha:parent,
      claim:claim('claim:b',s.id,s.taskId,'gonza-v2-a',parent),
    };
  });

  const result=validateLoadedModel(remote);
  assert.ok(result.errors.some(e=>/occupies multiple slots/.test(e)),JSON.stringify(result.errors));
  assert.ok(result.errors.some(e=>/ownedPaths overlap/.test(e)),JSON.stringify(result.errors));
});

test('R1 remote reconstruction fails closed when any declared slot ref cannot be resolved',()=>{
  const model=cloneModel(loadV2Model(process.cwd()));
  const remote=withResolvedRemoteClaims(model,()=>({error:'claim ref intentionally unavailable'}));
  const result=validateLoadedModel(remote);
  assert.ok(result.errors.some(e=>/claim ref intentionally unavailable/.test(e)));
});

test('R1 remote claim binding rejects wrong-slot storage and parent mismatch',()=>{
  const model=cloneModel(loadV2Model(process.cwd()));
  const remote=withResolvedRemoteClaims(model,(s)=>({
    headSha:'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    parentSha:'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    claim:{
      ...claim('claim:bad-binding','WRONG-SLOT',s.taskId,'gonza-v2-a','cccccccccccccccccccccccccccccccccccccccc'),
    },
  }));
  const result=validateLoadedModel(remote);
  assert.ok(result.errors.some(e=>/stored on the wrong slot ref/.test(e)),JSON.stringify(result.errors));
  assert.ok(result.errors.some(e=>/expectedParentSha does not match actual ref parent/.test(e)),JSON.stringify(result.errors));
});

test('R1 removes committed CURRENT authority and claim client requires global strict validation without force',()=>{
  assert.equal(existsSync('coordination/v2/CURRENT.json'),false);

  const claimSource=readFileSync('scripts/coord-v2-claim.mjs','utf8');
  assert.match(claimSource,/loadRemoteV2Model/);
  assert.match(claimSource,/strictGit:\s*true/);
  assert.match(claimSource,/initial\.claimBySlot\.has/);
  assert.match(claimSource,/initial\.claimByInstance\.has/);
  assert.doesNotMatch(claimSource,/--force|force-with-lease/);
  assert.doesNotMatch(claimSource,/CURRENT\.json/);

  const boot=readFileSync('coordination/BOOT.md','utf8');
  assert.match(boot,/--remote origin --strict-git/);
  assert.match(boot,/all declared slot claim refs/i);
  assert.match(boot,/not valid boot truth|Do not use a branch-local claim directory as current truth/i);
});
