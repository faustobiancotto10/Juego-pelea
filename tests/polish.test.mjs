import test from 'node:test';
import assert from 'node:assert/strict';
import { CombatSimulation } from '../dist/game/simulation/CombatSimulation.js';
import { CpuController } from '../dist/game/simulation/CpuController.js';
import { EMPTY_INPUT } from '../dist/game/types.js';

const neutral = () => ({ ...EMPTY_INPUT });

function tap(overrides = {}) {
  return { ...EMPTY_INPUT, ...overrides };
}

test('each fighter can start a distinct air attack while airborne', () => {
  for (const id of ['chameleon', 'supernariz']) {
    const sim = new CombatSimulation(id, 'chameleon', { skipIntro: true });
    sim.step(tap({ jump: true }), neutral());
    sim.step(neutral(), neutral());
    sim.step(neutral(), neutral());
    const snapshot = sim.step(tap({ attack: true }), neutral());
    assert.equal(snapshot.fighters[0].grounded, false);
    assert.equal(snapshot.fighters[0].moveId, id === 'chameleon' ? 'airClaw' : 'airNose');
  }
});

test('round reset clears any projectile left frozen during round-over', () => {
  const sim = new CombatSimulation('supernariz', 'chameleon', { skipIntro: true });
  let snapshot = sim.getSnapshot();
  for (let i = 0; i < 3582; i += 1) snapshot = sim.step(neutral(), neutral());
  snapshot = sim.step(tap({ special: true }), neutral());
  snapshot = sim.step(neutral(), neutral());
  for (let i = 0; i < 13; i += 1) snapshot = sim.step(neutral(), neutral());
  assert.ok(snapshot.projectiles.length > 0, 'projectile should exist immediately before round end');
  while (snapshot.phase === 'fight') snapshot = sim.step(neutral(), neutral());
  assert.equal(snapshot.phase, 'round-over');
  assert.ok(snapshot.projectiles.length > 0, 'projectile should remain frozen during round-over');
  while (snapshot.phase === 'round-over') snapshot = sim.step(neutral(), neutral());
  assert.equal(snapshot.phase, 'fight');
  assert.equal(snapshot.projectiles.length, 0);
});

test('two tactical CPUs can finish a complete best-of-three duel', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  const cpu0 = new CpuController(0);
  const cpu1 = new CpuController(1);
  let snapshot = sim.getSnapshot();
  for (let i = 0; i < 20000 && snapshot.phase !== 'match-over'; i += 1) {
    snapshot = sim.step(cpu0.nextInput(snapshot), cpu1.nextInput(snapshot));
  }
  assert.equal(snapshot.phase, 'match-over');
  assert.ok(snapshot.winner === 0 || snapshot.winner === 1);
  assert.equal(snapshot.fighters[snapshot.winner].roundWins, 2);
});

test('getting hit during startup cancels the interrupted move instead of resuming it after hitstun', () => {
  const sim = new CombatSimulation('chameleon', 'chameleon', { skipIntro: true });
  for (let i = 0; i < 70; i += 1) sim.step(tap({ right: true }), tap({ left: true }));
  sim.step(tap({ attack: true }), tap({ special: true }));
  let snapshot = sim.getSnapshot();
  for (let i = 0; i < 36; i += 1) snapshot = sim.step(neutral(), neutral());
  assert.equal(snapshot.fighters[1].moveId, null);
  assert.equal(snapshot.fighters[0].health, 1000, 'interrupted tongue must not resume and hit later');
});
