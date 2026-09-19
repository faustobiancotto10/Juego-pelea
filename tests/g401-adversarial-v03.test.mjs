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

function projectDeterministicState(snapshot) {
  return {
    frame: snapshot.frame,
    phase: snapshot.phase,
    round: snapshot.round,
    roundTimerFrames: snapshot.roundTimerFrames,
    hitstopFrames: snapshot.hitstopFrames,
    winner: snapshot.winner,
    roundWinner: snapshot.roundWinner,
    fighters: snapshot.fighters,
    projectiles: snapshot.projectiles,
    events: snapshot.events,
  };
}

test('V0.3 exposes simulation-owned SUPER and ultimate state on fighter snapshots', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  const [a, b] = sim.getSnapshot().fighters;

  for (const fighter of [a, b]) {
    assert.equal(typeof fighter.superMeter, 'number');
    assert.equal(typeof fighter.maxSuper, 'number');
    assert.equal(typeof fighter.superReady, 'boolean');
    assert.ok(['idle', 'startup', 'capture', 'sequence', 'recovery'].includes(fighter.ultimatePhase));
    assert.ok(fighter.ultimateTarget === null || fighter.ultimateTarget === 0 || fighter.ultimateTarget === 1);
    assert.ok(fighter.maxSuper > 0);
    assert.ok(fighter.superMeter >= 0 && fighter.superMeter <= fighter.maxSuper);
    assert.equal(fighter.superReady, fighter.superMeter >= fighter.maxSuper);
  }
});

test('SUPER does not charge passively in neutral', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  const start = sim.getSnapshot().fighters.map((fighter) => fighter.superMeter);
  const after = stepN(sim, 600).fighters.map((fighter) => fighter.superMeter);
  assert.deepEqual(after, start);
});

test('Push Guard request in neutral is rejected without spending GUARD or creating separation event', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  const before = sim.getSnapshot();
  const after = sim.step(input({ pushGuard: true }), EMPTY_INPUT);

  assert.equal(after.fighters[0].guard, before.fighters[0].guard);
  assert.equal(after.fighters[0].health, before.fighters[0].health);
  assert.ok(!after.events.some((event) => event.type === 'push-guard'));
});

test('new V0.3 intents preserve deterministic fixed-step outcomes', () => {
  const a = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  const b = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });

  const script = [
    [input({ right: true }), input({ left: true })],
    [input({ right: true, attack: true }), input({ left: true })],
    [EMPTY_INPUT, EMPTY_INPUT],
    [input({ ultimate: true }), input({ pushGuard: true })],
    [EMPTY_INPUT, EMPTY_INPUT],
    [input({ jump: true }), input({ special: true })],
  ];

  for (let loop = 0; loop < 40; loop += 1) {
    for (const [p1, p2] of script) {
      const sa = a.step(p1, p2);
      const sb = b.step(p1, p2);
      assert.deepEqual(projectDeterministicState(sa), projectDeterministicState(sb));
    }
  }
});
