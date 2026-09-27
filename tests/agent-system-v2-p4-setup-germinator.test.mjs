import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { loadV2Model, validateLoadedModel } from '../scripts/lib/coord-v2-model.mjs';

const CONTRACT_HEAD='a6177203b3235589fcbcdeecc0c7c0b562e17763';
const EXPECTED_SEED='ef5aac1989fef70fc7c04251e426086fc690e1d6';

const TASK_IDS=[
  'P4-A-MARIO','P4-A-RICARDO',
  'P4-B-ONE','P4-B-TWO',
  'P4-C-MARIO',
  'P4-D-U','P4-D-D',
  'P4-E-QA',
];
const SLOT_IDS=[
  'P4-A-MARIO-S1','P4-A-RICARDO-S1',
  'P4-B-ONE-S1','P4-B-TWO-S1',
  'P4-C-MARIO-S1',
  'P4-D-U-S1','P4-D-D-S1',
  'P4-E-QA-S1',
];
const INSTANCE_IDS=[
  'mario-v2-p4-a','ricardo-v2-p4-a',
  'mario-v2-p4-b',
  'mario-v2-p4-c1','mario-v2-p4-c2',
  'ricardo-v2-p4-d-u','ricardo-v2-p4-d-d',
  'ricardo-v2-p4-e',
];

test('P4 setup materializes exactly the frozen task/slot/instance inventory',()=>{
  const model=loadV2Model(process.cwd());
  const result=validateLoadedModel(model);
  assert.deepEqual(result.errors,[]);

  const p4Tasks=[...result.maps.tasks.keys()].filter(id=>id.startsWith('P4-')).sort();
  const p4Slots=[...result.maps.slots.keys()].filter(id=>id.startsWith('P4-')).sort();
  const p4Instances=[...result.maps.instances.keys()].filter(id=>id.includes('-v2-p4-')).sort();

  assert.deepEqual(p4Tasks,[...TASK_IDS].sort());
  assert.deepEqual(p4Slots,[...SLOT_IDS].sort());
  assert.deepEqual(p4Instances,[...INSTANCE_IDS].sort());

  for(const id of TASK_IDS){
    const t=result.maps.tasks.get(id);
    assert.equal(t.baseSha,CONTRACT_HEAD,`${id} base drift`);
    assert.equal(t.lineageBaseSha,CONTRACT_HEAD,`${id} lineage drift`);
    assert.deepEqual(t.inputShas,[],`${id} unexpected input`);
    assert.equal(t.kind,'synthetic-phase4-trial');
  }
});

test('P4 setup has zero local active synthetic claims and the expected initial task states',()=>{
  const model=loadV2Model(process.cwd());
  const result=validateLoadedModel(model);
  for(const id of SLOT_IDS) assert.equal(result.claimBySlot.has(id),false,`${id} unexpectedly locally claimed`);
  for(const id of INSTANCE_IDS) assert.equal(result.claimByInstance.has(id),false,`${id} unexpectedly locally active`);

  for(const id of TASK_IDS){
    const expected=id==='P4-D-D'?'WAITING_DEPENDENCY':'READY';
    assert.equal(result.stateFor(id),expected,`${id} initial state mismatch`);
  }
});

test('P4-A exactly preserves the frozen disjoint Mario/Ricardo surfaces',()=>{
  const result=validateLoadedModel(loadV2Model(process.cwd()));
  const mario=result.maps.slots.get('P4-A-MARIO-S1');
  const ricardo=result.maps.slots.get('P4-A-RICARDO-S1');

  assert.equal(mario.roleId,'mario');
  assert.equal(ricardo.roleId,'ricardo');
  assert.deepEqual(mario.ownedPaths,['coordination/v2/trials/P4-A/mario/**']);
  assert.deepEqual(ricardo.ownedPaths,['coordination/v2/trials/P4-A/ricardo/**']);
  assert.notEqual(mario.claimRef,ricardo.claimRef);
  assert.notEqual(mario.branchRef,ricardo.branchRef);
});

test('P4-B is materialized as two distinct Mario slots for one disposable claimant identity',()=>{
  const result=validateLoadedModel(loadV2Model(process.cwd()));
  const one=result.maps.slots.get('P4-B-ONE-S1');
  const two=result.maps.slots.get('P4-B-TWO-S1');
  const worker=result.maps.instances.get('mario-v2-p4-b');

  assert.equal(one.roleId,'mario');
  assert.equal(two.roleId,'mario');
  assert.equal(worker.roleId,'mario');
  assert.equal(worker.replacementOf,null);
  assert.notEqual(one.claimRef,two.claimRef);
  assert.notEqual(one.branchRef,two.branchRef);
  assert.deepEqual(one.ownedPaths,['coordination/v2/trials/P4-B/one/**']);
  assert.deepEqual(two.ownedPaths,['coordination/v2/trials/P4-B/two/**']);
});

test('P4-C preserves one slot and a durable explicit replacement relation',()=>{
  const result=validateLoadedModel(loadV2Model(process.cwd()));
  const task=result.maps.tasks.get('P4-C-MARIO');
  const c1=result.maps.instances.get('mario-v2-p4-c1');
  const c2=result.maps.instances.get('mario-v2-p4-c2');

  assert.deepEqual(task.slotIds,['P4-C-MARIO-S1']);
  assert.equal(c1.roleId,'mario');
  assert.equal(c1.replacementOf,null);
  assert.equal(c2.roleId,'mario');
  assert.equal(c2.replacementOf,'mario-v2-p4-c1');
});

test('P4-D downstream remains locked on canonical VERIFIED evidence rather than branch existence',()=>{
  const result=validateLoadedModel(loadV2Model(process.cwd()));
  const up=result.maps.tasks.get('P4-D-U');
  const down=result.maps.tasks.get('P4-D-D');

  assert.equal(up.downstreamTaskId,'P4-D-D');
  assert.deepEqual(down.dependencies,[{taskId:'P4-D-U',requires:'VERIFIED'}]);
  assert.equal(up.qaRequired,false);
  assert.equal(result.stateFor('P4-D-U'),'READY');
  assert.equal(result.stateFor('P4-D-D'),'WAITING_DEPENDENCY');
});

test('P4-E requires exact QA before VERIFIED can derive',()=>{
  const result=validateLoadedModel(loadV2Model(process.cwd()));
  const task=result.maps.tasks.get('P4-E-QA');
  assert.equal(task.qaRequired,true);
  assert.match(task.acceptance.join('\n'),/BLOCK remains historical/i);
  assert.match(task.acceptance.join('\n'),/H2 supersedes H1/i);
  assert.match(task.acceptance.join('\n'),/APPROVE binds H2\/C2 only/i);
});

test('all Phase-4 refs are canonical, unique, and namespaced away from R005/product refs',()=>{
  const result=validateLoadedModel(loadV2Model(process.cwd()));
  const slots=SLOT_IDS.map(id=>result.maps.slots.get(id));
  const claims=slots.map(s=>s.claimRef);
  const works=slots.map(s=>s.branchRef);

  assert.equal(new Set(claims).size,8);
  assert.equal(new Set(works).size,8);
  for(const ref of claims) assert.match(ref,/^refs\/heads\/coord-v2-claims\/p4-/);
  for(const ref of works) assert.match(ref,/^refs\/heads\/coord-v2-p4-work\/p4-/);
  for(const s of slots){
    for(const path of s.ownedPaths) assert.match(path,/^coordination\/v2\/trials\/P4-/);
  }
});

test('reassignment primitive requires live ownership, durable replacement metadata, exact checkpoint lineage and work-ref containment',()=>{
  const source=readFileSync('scripts/coord-v2-reassign.mjs','utf8');

  assert.match(source,/loadRemoteV2Model/);
  assert.match(source,/validateLoadedModel\(model, \{ strictGit: true \}\)/);
  assert.match(source,/currentClaim\.instanceId !== fromInstanceId/);
  assert.match(source,/replacementOf !== fromInstanceId/);
  assert.match(source,/checkpoint .* outside task lineage/);
  assert.match(source,/checkpoint .* not contained by current work ref/);
  assert.match(source,/priorClaimHeadSha/);
  assert.match(source,/REASSIGN_WON/);
  assert.match(source,/REASSIGN_LOST/);
  assert.match(source,/source instance remains active after reassignment/);
  assert.doesNotMatch(source,/--force|force-with-lease/);
});

test('frozen Phase-4 contract still contains the required STOP conditions and execution ordering',()=>{
  const contract=readFileSync('coordination/v2/trials/PHASE4-MULTI-INSTANCE-CONTRACT.md','utf8');

  assert.match(contract,/P4-A: Mario \+ Ricardo disjoint/i);
  assert.match(contract,/P4-B.*different-ref race/is);
  assert.match(contract,/checkpoint.*replacement/is);
  assert.match(contract,/branch.*without.*handoff/is);
  assert.match(contract,/stale QA BLOCK/is);
  assert.match(contract,/two conflicting claims become simultaneously authoritative/i);
  assert.match(contract,/aggregate global projection becomes invalid/i);
  assert.match(contract,/worker touches R005\/product\/runtime\/assets/i);
  assert.match(contract,/force push is used/i);

  const pA=contract.indexOf('Scenario P4-A');
  const pB=contract.indexOf('Scenario P4-B');
  const pC=contract.indexOf('Scenario P4-C');
  const pD=contract.indexOf('Scenario P4-D');
  const pE=contract.indexOf('Scenario P4-E');
  assert.ok(pA>=0 && pA<pB && pB<pC && pC<pD && pD<pE);
});

test('setup branch contains no committed Phase-4 claim record or worker artifact before preflight approval',()=>{
  const claimDir='coordination/v2/claims';
  const claims=existsSync(claimDir)?readdirSync(claimDir).filter(x=>/P4-/i.test(x)):[];
  assert.deepEqual(claims,[]);

  const p4Roots=[
    'coordination/v2/trials/P4-A',
    'coordination/v2/trials/P4-B',
    'coordination/v2/trials/P4-C',
    'coordination/v2/trials/P4-D',
    'coordination/v2/trials/P4-E',
  ];
  for(const root of p4Roots) assert.equal(existsSync(root),false,`${root} contains worker output before trial`);
});

test('setup workflow and handoff agree on corrected authoritative seed',()=>{
  const workflow=readFileSync('.github/workflows/coord-v2-phase4-setup.yml','utf8');
  const handoff=readFileSync('coordination/handoffs/AGENT-SYSTEM-V2-P4-SETUP-gonza.md','utf8');

  assert.match(workflow,new RegExp(EXPECTED_SEED));
  assert.match(handoff,new RegExp(EXPECTED_SEED));
  assert.match(handoff,/eight declared claim refs/i);
  assert.match(handoff,/eight work refs/i);
  assert.match(handoff,/No Phase-4 claim has been executed/i);
});
