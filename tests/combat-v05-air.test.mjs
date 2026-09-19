import test from 'node:test';
import assert from 'node:assert/strict';
import { CombatSimulation } from '../dist/game/simulation/CombatSimulation.js';
import { EMPTY_INPUT as E } from '../dist/game/types.js';

const input = (patch = {}) => ({ ...E, ...patch });
const direction = (patch = {}) => ({ left: false, right: false, up: false, down: false, ...patch });
const command = (action, patch = {}) => ({ action, direction: direction(patch) });

function stepUntil(sim, predicate, max = 160, p1 = E, p2 = E) {
  let snap = sim.getSnapshot();
  const events = [];
  for (let i = 0; i < max; i += 1) {
    snap = sim.step(p1, p2);
    events.push(...snap.events);
    if (predicate(snap, events)) return { snap, events };
  }
  return { snap, events };
}

test('air normal preserves takeoff carry and integrates x/y on its activation step', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  sim.fighters[0].x = 300;
  sim.fighters[1].x = 1000;

  let snap = sim.step(input({ right: true, jump: true }), E);
  assert.equal(snap.fighters[0].grounded, false);
  assert.ok(snap.fighters[0].vx > 4);
  const beforeAttackX = snap.fighters[0].x;
  const beforeAttackY = snap.fighters[0].y;

  snap = sim.step(input({ right: true, attack: true }), E);
  assert.equal(snap.fighters[0].moveId, 'airClaw');
  assert.ok(snap.fighters[0].x > beforeAttackX, 'air attack activation must keep horizontal carry');
  assert.notEqual(snap.fighters[0].y, beforeAttackY, 'air attack activation must integrate vertical physics');

  const committedX = snap.fighters[0].x;
  for (let i = 0; i < 4; i += 1) snap = sim.step(input({ left: true }), E);
  assert.ok(snap.fighters[0].x > committedX + 12, 'opposite input cannot erase authored air-attack carry');
  assert.ok(snap.fighters[0].vx > 0);
});

test('ordinary move facing and takeoff facing stay locked through an airborne crossover', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  sim.fighters[0].x = 500;
  sim.fighters[1].x = 585;

  let snap = sim.step(input({ right: true, jump: true }), E);
  const takeoffFacing = snap.fighters[0].facing;
  for (let i = 0; i < 3; i += 1) snap = sim.step(input({ right: true }), E);
  snap = sim.step(input({ right: true, attack: true }), E);
  assert.equal(snap.fighters[0].moveId, 'airClaw');
  assert.equal(snap.fighters[0].facing, takeoffFacing);

  let crossedDuringMove = false;
  for (let i = 0; i < 24 && snap.fighters[0].moveId === 'airClaw'; i += 1) {
    snap = sim.step(input({ left: true }), E);
    if (snap.fighters[0].x > snap.fighters[1].x) {
      crossedDuringMove = true;
      assert.equal(snap.fighters[0].facing, takeoffFacing, 'air normal must not home/turn through crossover');
    }
  }
  assert.equal(crossedDuringMove, true, 'authored forward carry should be sufficient to cross at this spacing');
});

test('landing emits once, clears air carry and gates actions for four advancing frames', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  sim.fighters[0].x = 300;
  sim.fighters[1].x = 1000;
  sim.step(input({ right: true, jump: true }), E);

  const landed = stepUntil(sim, (_snap, events) => events.some(e => e.type === 'land' && e.fighter === 0), 120);
  let snap = landed.snap;
  assert.ok(landed.events.some(e => e.type === 'land' && e.fighter === 0));
  assert.equal(snap.fighters[0].grounded, true);
  assert.equal(snap.fighters[0].landingRecoveryFrames, 4);
  assert.equal(snap.fighters[0].vx, 0);

  snap = sim.step(input({ commands: [command('attack')] }), E);
  assert.equal(snap.fighters[0].moveId, null);
  for (let i = 0; i < 3; i += 1) {
    snap = sim.step(input({ commands: [] }), E);
    assert.equal(snap.fighters[0].moveId, null, 'buffered attack must wait through landing recovery');
  }
  snap = sim.step(input({ commands: [] }), E);
  assert.equal(snap.fighters[0].moveId, 'claw1', 'still-live buffered attack executes after four recovery frames');
});

test('non-attacking landing recovery allows immediate correct-height guard', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  sim.fighters[0].x = 500;
  sim.fighters[1].x = 1000;
  sim.step(input({ jump: true }), E);
  const landed = stepUntil(sim, (_snap, events) => events.some(e => e.type === 'land' && e.fighter === 0), 120);
  assert.equal(landed.snap.fighters[0].landingRecoveryFrames, 4);

  sim.fighters[0].x = 500;
  sim.fighters[1].x = 590;
  sim.fighters[1].currentMove = sim.registry.getMove('supernariz', 'nose1');
  sim.fighters[1].moveId = 'nose1';
  sim.fighters[1].moveFrame = 3;
  sim.fighters[1].moveHasHit = false;
  sim.fighters[1].moveContact = 'none';

  const snap = sim.step(input({ left: true }), E);
  const hit = snap.events.find(e => e.type === 'hit' && e.attacker === 1 && e.defender === 0);
  assert.ok(hit);
  assert.equal(hit.blocked, true, 'landing recovery may guard immediately when no air attack is still committed');
});

test('airborne hit preserves launch trajectory instead of snapping defender to ground', () => {
  const sim = new CombatSimulation('supernariz', 'chameleon', { skipIntro: true });
  sim.fighters[0].x = 500;
  sim.fighters[1].x = 590;

  sim.step(E, input({ jump: true }));
  sim.step(input({ attack: true }), E);
  const result = stepUntil(sim, (_s, events) => events.some(e => e.type === 'hit' && e.defender === 1), 20);
  const snap = result.snap;
  const hit = result.events.find(e => e.type === 'hit' && e.defender === 1);
  assert.ok(hit);
  assert.equal(hit.blocked, false);
  assert.equal(snap.fighters[1].grounded, false);
  assert.ok(snap.fighters[1].y > 0);
  assert.notEqual(snap.fighters[1].vx, 0);
});
