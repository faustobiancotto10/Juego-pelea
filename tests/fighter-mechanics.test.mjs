import test from 'node:test';
import assert from 'node:assert/strict';
import { CombatSimulation } from '../dist/game/simulation/CombatSimulation.js';
import { EMPTY_INPUT } from '../dist/game/types.js';

const input = (patch = {}) => ({ ...EMPTY_INPUT, ...patch });
const stepN = (sim, frames, p1 = EMPTY_INPUT, p2 = EMPTY_INPUT) => {
  let snap = sim.getSnapshot();
  for (let i = 0; i < frames; i += 1) snap = sim.step(p1, p2);
  return snap;
};

test('Camaleón down+special selects low tongue', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  const snap = sim.step(input({ down: true, special: true }), EMPTY_INPUT);
  assert.equal(snap.fighters[0].moveId, 'tongueLow');
});

test('Supernariz connected attack can chain nose1 -> nose2 -> nose3 through cancel windows', () => {
  const sim = new CombatSimulation('supernariz', 'chameleon', { skipIntro: true });
  stepN(sim, 70, input({ right: true }), input({ left: true }));
  let snap = sim.step(input({ attack: true }), EMPTY_INPUT);
  while (snap.fighters[0].moveId === 'nose1' && snap.fighters[0].moveFrame < 10) snap = sim.step(EMPTY_INPUT, EMPTY_INPUT);
  snap = sim.step(input({ attack: true }), EMPTY_INPUT);
  assert.equal(snap.fighters[0].moveId, 'nose2');
  sim.step(EMPTY_INPUT, EMPTY_INPUT);
  while (snap.fighters[0].moveId === 'nose2' && snap.fighters[0].moveFrame < 10) snap = sim.step(EMPTY_INPUT, EMPTY_INPUT);
  snap = sim.step(input({ attack: true }), EMPTY_INPUT);
  assert.equal(snap.fighters[0].moveId, 'nose3');
  assert.equal(snap.fighters[0].comboCount, 3);
});

test('Supernariz neutral special spawns a chorizo projectile and starts cooldown', () => {
  const sim = new CombatSimulation('supernariz', 'chameleon', { skipIntro: true });
  sim.step(input({ special: true }), EMPTY_INPUT);
  const snap = stepN(sim, 12);
  assert.ok(snap.projectiles.some((p) => p.kind === 'chorizo' && p.owner === 0));
  assert.ok(snap.fighters[0].projectileCooldown > 0);
});

test('Supernariz down+special uses Tramontana and applies chill on hit', () => {
  const sim = new CombatSimulation('supernariz', 'chameleon', { skipIntro: true });
  stepN(sim, 55, input({ right: true }), input({ left: true }));
  sim.step(input({ down: true, special: true }), EMPTY_INPUT);
  const snap = stepN(sim, 24);
  assert.ok(snap.fighters[1].chilledFrames > 0);
  assert.ok(snap.fighters[1].health < 1000);
});
