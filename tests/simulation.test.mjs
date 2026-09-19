import test from 'node:test';
import assert from 'node:assert/strict';
import { CombatSimulation } from '../dist/game/simulation/CombatSimulation.js';
import { EMPTY_INPUT } from '../dist/game/types.js';

const input = (patch = {}) => ({ ...EMPTY_INPUT, ...patch });

function stepN(sim, frames, p1 = EMPTY_INPUT, p2 = EMPTY_INPUT) {
  let snap = sim.getSnapshot();
  for (let i = 0; i < frames; i += 1) snap = sim.step(p1, p2);
  return snap;
}

test('movement changes position and arena bounds clamp fighters', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  const start = sim.getSnapshot().fighters[0].x;
  const moved = stepN(sim, 20, input({ right: true })).fighters[0].x;
  assert.ok(moved > start + 30);
  const clamped = stepN(sim, 400, input({ left: true })).fighters[0].x;
  assert.ok(clamped >= 90);
});

test('fighters face each other and jump returns to the ground', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  assert.equal(sim.getSnapshot().fighters[0].facing, 1);
  assert.equal(sim.getSnapshot().fighters[1].facing, -1);
  sim.step(input({ jump: true }), EMPTY_INPUT);
  const airborne = stepN(sim, 8).fighters[0];
  assert.ok(airborne.y > 0);
  assert.equal(airborne.grounded, false);
  const landed = stepN(sim, 80).fighters[0];
  assert.equal(landed.y, 0);
  assert.equal(landed.grounded, true);
});

test('an active attack damages once and produces hitstun/hitstop', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  stepN(sim, 48, input({ right: true }), input({ left: true }));
  const before = sim.getSnapshot().fighters[1].health;
  sim.step(input({ special: true }), EMPTY_INPUT);
  let sawHitstop = false;
  for (let i = 0; i < 30; i += 1) {
    const snap = sim.step(EMPTY_INPUT, EMPTY_INPUT);
    if (snap.hitstopFrames > 0) sawHitstop = true;
  }
  const after = sim.getSnapshot().fighters[1];
  assert.ok(after.health < before);
  assert.ok(after.stunFrames > 0 || sawHitstop);
  assert.equal(before - after.health, 92);
});

test('holding away blocks and reduces damage', () => {
  const normal = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  const blocked = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  stepN(normal, 48, input({ right: true }), input({ left: true }));
  stepN(blocked, 48, input({ right: true }), input({ left: true }));

  normal.step(input({ special: true }), EMPTY_INPUT);
  blocked.step(input({ special: true }), input({ right: true }));
  stepN(normal, 24);
  stepN(blocked, 24, EMPTY_INPUT, input({ right: true }));

  const normalLoss = 1000 - normal.getSnapshot().fighters[1].health;
  const blockedLoss = 1000 - blocked.getSnapshot().fighters[1].health;
  assert.ok(normalLoss > blockedLoss);
  assert.ok(blocked.getSnapshot().fighters[1].blocking || blocked.getSnapshot().fighters[1].blockstunFrames > 0);
});

test('round timer expires into round-over and starts a fresh round', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  const initial = sim.getSnapshot().roundTimerFrames;
  const after = stepN(sim, 60);
  assert.equal(after.roundTimerFrames, initial - 60);
  const expired = stepN(sim, initial);
  assert.ok(expired.phase === 'round-over' || expired.round > 1);
  const next = stepN(sim, 140);
  assert.equal(next.round, 2);
  assert.equal(next.fighters[0].health, 1000);
  assert.equal(next.fighters[1].health, 1000);
});
