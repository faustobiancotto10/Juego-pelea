import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const read=(p)=>readFileSync(p,'utf8');
const PR_HEAD='4a47962e563b8e444ab6cf6a288db66c13dda743';
const FINAL_RUN='36270296595';

function protocolStates(){
  const protocol=read('coordination/PROTOCOL.md');
  const section=protocol.split('## 7. States')[1]?.split('## 8. Forum')[0] ?? '';
  return [...section.matchAll(/^- ([A-Z_]+)$/gm)].map(m=>m[1]);
}

function statusRows(){
  return read('coordination/STATUS.md')
    .split('\n')
    .filter(line=>line.startsWith('| ') && !line.startsWith('| ---') && !line.startsWith('| Agent / Instance |'))
    .map(line=>line.split('|').slice(1,-1).map(cell=>cell.trim()));
}

test('P0 all live STATUS and task states use protocol vocabulary',()=>{
  const allowed=new Set(protocolStates());
  assert.ok(allowed.size>=9,'failed to parse protocol state vocabulary');

  for(const [name,,task,state] of statusRows()){
    assert.ok(allowed.has(state),`invalid STATUS state ${state} for ${name} / ${task}`);
  }

  for(const file of readdirSync('coordination/tasks').filter(n=>n.endsWith('.md') && n!=='README.md')){
    const content=read(`coordination/tasks/${file}`);
    const match=content.match(/^Status:\s*([^\n]+)$/m);
    assert.ok(match,`missing Status in ${file}`);
    assert.ok(allowed.has(match[1].trim()),`invalid task state ${match[1].trim()} in ${file}`);
  }
});

test('P0 Mario semantic normalization does not resurrect consumed work',()=>{
  const rows=new Map(statusRows().map(row=>[row[0],row]));
  assert.equal(rows.get('Mario')?.[3],'VERIFIED');
  assert.equal(rows.get('↳ Mario-A')?.[3],'VERIFIED');
  assert.equal(rows.get('↳ Mario-B')?.[3],'HANDOFF_READY');
  assert.match(rows.get('↳ Mario-B')?.[4] ?? '',/No further package work unless QA finds a reproducible defect/i);

  const mb=read('coordination/tasks/V07-SPR-MB.md');
  assert.match(mb,/^Status:\s*HANDOFF_READY$/m);
  assert.match(mb,/Handoff consumption:\s*consumed by Mario-A integration/i);
  assert.match(mb,/Consumption is an event, not a task state/i);
});

test('P0 current snapshot agrees with exact G1 and Z0 receipts and preserves product gates',()=>{
  const round=read('coordination/CURRENT_ROUND.md');
  const snapshot=round.split('## Current operational snapshot')[1]?.split('## Exact frozen base')[0] ?? '';
  const g1=read('coordination/handoffs/V07-SPR-G1-germinator.md');
  const z0=read('coordination/handoffs/V07-SPR-Z0-gonza.md');
  const exact='fe2b505639d8ebf2dc4ab204b545233d96f214f2';

  assert.match(snapshot,new RegExp(exact));
  assert.match(g1,new RegExp(exact));
  assert.match(z0,new RegExp(exact));

  assert.match(snapshot,/Germinator V07-SPR-G1:\s*VERIFIED \/ APPROVE/i);
  assert.match(snapshot,/Gonza V07-SPR-Z0:\s*VERIFIED/i);
  assert.match(snapshot,/physical iPhone\/user acceptance is not green/i);
  assert.match(snapshot,/canonical production package format remains unresolved/i);
  assert.match(snapshot,/production-root\/full-roster cutover remains unauthorized/i);

  assert.match(g1,/does not authorize:[\s\S]*production-root promotion/i);
  assert.match(g1,/waiving physical-phone\/user acceptance/i);
  assert.match(z0,/production root remains unchanged/i);
  assert.match(z0,/Physical iPhone decode\/load\/render performance remains unverified/i);
});

test('P0 live-lock projection is consistent with current active worker states',()=>{
  const locks=read('coordination/LOCKS.md');
  const live=locks.split('## Current live locks')[1]?.split('## Historical lock record')[0] ?? '';
  assert.match(live,/Active lock count:\s*0/);

  const active=statusRows().filter(row=>['WORKING','REVIEWING'].includes(row[3]));
  assert.deepEqual(active,[],`zero live locks is unsafe while active workers exist: ${JSON.stringify(active)}`);

  assert.ok(locks.indexOf('## Current live locks') < locks.indexOf('## Historical lock record'));
});

test('P0 frozen V2 design remains non-operational during R005',()=>{
  const design=read('docs/superpowers/specs/2026-09-26-agent-orchestration-v2-design.md');
  assert.match(design,/Status:\s*\*\*FROZEN DESIGN \/ NOT YET OPERATIONAL\*\*/);
  assert.match(design,/R005 remains the only live round/);
  assert.match(design,/does NOT:[\s\S]*convert existing R005 tasks/i);
  assert.match(design,/does NOT:[\s\S]*waive physical-device\/user gates/i);
});

test('P0 Neureon handoff names the exact auditable final candidate and fresh final verification',()=>{
  const handoff=read('coordination/handoffs/AGENT-SYSTEM-P0-neureon.md');
  assert.match(handoff,new RegExp(`Phase-0 coordination candidate:\\s*\\`${PR_HEAD}\\``),
    'handoff candidate SHA must be the exact final PR head');
  assert.match(handoff,new RegExp(FINAL_RUN),
    'handoff must record the fresh final-head verification run');
  assert.doesNotMatch(handoff,/Final exact-head verification is still required/i,
    'handoff must not claim final verification is still pending after the exact head is green');
});
