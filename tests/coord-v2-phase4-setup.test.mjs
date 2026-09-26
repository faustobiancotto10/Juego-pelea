import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadV2Model, validateLoadedModel } from '../scripts/lib/coord-v2-model.mjs';

const P4_TASKS = [
  'P4-A-MARIO',
  'P4-A-RICARDO',
  'P4-B-ONE',
  'P4-B-TWO',
  'P4-C-MARIO',
  'P4-D-U',
  'P4-D-D',
  'P4-E-QA',
];

const P4_SLOTS = [
  'P4-A-MARIO-S1',
  'P4-A-RICARDO-S1',
  'P4-B-ONE-S1',
  'P4-B-TWO-S1',
  'P4-C-MARIO-S1',
  'P4-D-U-S1',
  'P4-D-D-S1',
  'P4-E-QA-S1',
];

test('Phase 4 materialization is canonical, isolated, and locally READY', () => {
  const model = loadV2Model(process.cwd());
  const result = validateLoadedModel(model);
  assert.deepEqual(result.errors, []);

  for (const taskId of P4_TASKS) {
    assert.ok(result.maps.tasks.has(taskId), `missing task ${taskId}`);
    assert.equal(result.stateFor(taskId), taskId === 'P4-D-D' ? 'WAITING_DEPENDENCY' : 'READY');
  }

  for (const slotId of P4_SLOTS) {
    const slot = result.maps.slots.get(slotId);
    assert.ok(slot, `missing slot ${slotId}`);
    assert.match(slot.claimRef, /^refs\/heads\/coord-v2-claims\/p4-/);
    assert.match(slot.branchRef, /^refs\/heads\/coord-v2-p4-work\//);
    assert.equal(result.claimBySlot.has(slotId), false);
  }
});

test('Phase 4 slots have globally unique claim refs and work refs', () => {
  const model = loadV2Model(process.cwd());
  const slots = model.slotsEntries.map((entry) => entry.value).filter((slot) => P4_SLOTS.includes(slot.id));
  assert.equal(new Set(slots.map((slot) => slot.claimRef)).size, P4_SLOTS.length);
  assert.equal(new Set(slots.map((slot) => slot.branchRef)).size, P4_SLOTS.length);
});

test('P4-A owned paths are the frozen Mario and Ricardo disjoint surfaces', () => {
  const result = validateLoadedModel(loadV2Model(process.cwd()));
  assert.deepEqual(result.maps.slots.get('P4-A-MARIO-S1').ownedPaths, ['coordination/v2/trials/P4-A/mario/**']);
  assert.deepEqual(result.maps.slots.get('P4-A-RICARDO-S1').ownedPaths, ['coordination/v2/trials/P4-A/ricardo/**']);
});

test('P4-B has two different Mario-compatible refs but one intended disposable worker', () => {
  const result = validateLoadedModel(loadV2Model(process.cwd()));
  const one = result.maps.slots.get('P4-B-ONE-S1');
  const two = result.maps.slots.get('P4-B-TWO-S1');
  assert.equal(one.roleId, 'mario');
  assert.equal(two.roleId, 'mario');
  assert.notEqual(one.claimRef, two.claimRef);
  assert.notEqual(one.branchRef, two.branchRef);
  const instance = result.maps.instances.get('mario-v2-p4-b');
  assert.equal(instance.roleId, 'mario');
});

test('P4-C replacement identity is durable while slot identity remains singular', () => {
  const result = validateLoadedModel(loadV2Model(process.cwd()));
  assert.equal(result.maps.tasks.get('P4-C-MARIO').slotIds.length, 1);
  assert.equal(result.maps.instances.get('mario-v2-p4-c2').replacementOf, 'mario-v2-p4-c1');
  assert.equal(result.maps.instances.get('mario-v2-p4-c1').roleId, 'mario');
  assert.equal(result.maps.instances.get('mario-v2-p4-c2').roleId, 'mario');
});

test('P4-D downstream is blocked by canonical dependency until upstream verifies', () => {
  const result = validateLoadedModel(loadV2Model(process.cwd()));
  const downstream = result.maps.tasks.get('P4-D-D');
  assert.deepEqual(downstream.dependencies, [{ taskId: 'P4-D-U', requires: 'VERIFIED' }]);
  assert.equal(result.stateFor('P4-D-U'), 'READY');
  assert.equal(result.stateFor('P4-D-D'), 'WAITING_DEPENDENCY');
});

test('P4-E is QA-required so a handoff alone cannot be the approval contract', () => {
  const result = validateLoadedModel(loadV2Model(process.cwd()));
  assert.equal(result.maps.tasks.get('P4-E-QA').qaRequired, true);
});

test('Phase 4 workers are role-compatible and P4-D uses a separate downstream instance', () => {
  const result = validateLoadedModel(loadV2Model(process.cwd()));
  const expected = new Map([
    ['mario-v2-p4-a', 'mario'],
    ['ricardo-v2-p4-a', 'ricardo'],
    ['mario-v2-p4-b', 'mario'],
    ['mario-v2-p4-c1', 'mario'],
    ['mario-v2-p4-c2', 'mario'],
    ['ricardo-v2-p4-d-u', 'ricardo'],
    ['ricardo-v2-p4-d-d', 'ricardo'],
    ['ricardo-v2-p4-e', 'ricardo'],
  ]);
  for (const [id, roleId] of expected) assert.equal(result.maps.instances.get(id)?.roleId, roleId);
});

test('claim and reassignment clients contain no force escape hatch', () => {
  const claim = readFileSync('scripts/coord-v2-claim.mjs', 'utf8');
  const reassign = readFileSync('scripts/coord-v2-reassign.mjs', 'utf8');
  for (const source of [claim, reassign]) {
    assert.doesNotMatch(source, /--force|force-with-lease/);
  }
  assert.match(reassign, /replacementOf/);
  assert.match(reassign, /checkpoint/);
  assert.match(reassign, /merge-base/);
  assert.match(reassign, /REASSIGN_WON/);
  assert.match(reassign, /never force a reassignment/i);
});
