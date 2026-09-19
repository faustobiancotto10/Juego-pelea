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


test('SUPER starts empty for a fresh fight and a fresh simulation resets it', () => {
  const first = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  const second = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });

  for (const snap of [first.getSnapshot(), second.getSnapshot()]) {
    assert.equal(snap.fighters[0].superMeter, 0);
    assert.equal(snap.fighters[1].superMeter, 0);
    assert.equal(snap.fighters[0].superReady, false);
    assert.equal(snap.fighters[1].superReady, false);
  }
});

test('active offense can reach SUPER READY before dealing the full 1000 HP', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });

  // Start inside reliable tongue range.
  stepN(sim, 48, input({ right: true }), input({ left: true }));

  let snap = sim.getSnapshot();
  let sawReady = snap.fighters[0].superReady;
  let safety = 0;

  while (snap.phase === 'fight' && snap.fighters[1].health > 0 && !sawReady && safety < 900) {
    // Fire a straight tongue on a fresh press, then recover and re-close space.
    sim.step(input({ special: true }), EMPTY_INPUT);
    snap = stepN(sim, 34, EMPTY_INPUT, EMPTY_INPUT);
    sawReady ||= snap.fighters[0].superReady;

    if (!sawReady && snap.phase === 'fight') {
      snap = stepN(sim, 12, input({ right: true }), input({ left: true }));
      sawReady ||= snap.fighters[0].superReady;
    }
    safety += 46;
  }

  assert.equal(sawReady, true, 'a strongly winning attacker should be able to reach READY before KO');
  assert.ok(snap.fighters[1].health > 0, 'READY should be reachable before the defender loses the full 1000 HP');
});


test('EMPTY_INPUT exposes V0.3 intents as explicit false booleans', () => {
  assert.equal(EMPTY_INPUT.ultimate, false);
  assert.equal(EMPTY_INPUT.pushGuard, false);
});

test('Supernariz cooldown feedback is simulation-owned and exposes remaining plus max', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  const supernariz = sim.getSnapshot().fighters[1];

  assert.equal(typeof supernariz.projectileCooldown, 'number');
  assert.equal(typeof supernariz.projectileCooldownMax, 'number');
  assert.ok(supernariz.projectileCooldownMax > 0);
  assert.ok(supernariz.projectileCooldown >= 0);
  assert.ok(supernariz.projectileCooldown <= supernariz.projectileCooldownMax);
});

test('SUPER ready transition emits at most one ready event while meter remains capped', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  stepN(sim, 48, input({ right: true }), input({ left: true }));

  let readyEvents = 0;
  let sawReady = false;
  let snap = sim.getSnapshot();

  for (let cycle = 0; cycle < 18 && snap.phase === 'fight'; cycle += 1) {
    snap = sim.step(input({ special: true }), EMPTY_INPUT);
    readyEvents += snap.events.filter((event) => event.type === 'super-ready' && event.fighter === 0).length;
    for (let i = 0; i < 34 && snap.phase === 'fight'; i += 1) {
      snap = sim.step(EMPTY_INPUT, EMPTY_INPUT);
      readyEvents += snap.events.filter((event) => event.type === 'super-ready' && event.fighter === 0).length;
      sawReady ||= snap.fighters[0].superReady;
    }
    if (snap.phase !== 'fight') break;
    snap = stepN(sim, 12, input({ right: true }), input({ left: true }));
    sawReady ||= snap.fighters[0].superReady;
    if (sawReady) {
      for (let i = 0; i < 90; i += 1) {
        snap = sim.step(EMPTY_INPUT, EMPTY_INPUT);
        readyEvents += snap.events.filter((event) => event.type === 'super-ready' && event.fighter === 0).length;
      }
      break;
    }
  }

  assert.equal(sawReady, true, 'test setup must reach READY');
  assert.equal(readyEvents, 1, 'READY must emit once on threshold transition, not every capped frame');
  assert.equal(snap.fighters[0].superMeter, snap.fighters[0].maxSuper);
});

test('an invalid ultimate request cannot spend meter or emit capture/whiff from empty SUPER', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  const before = sim.getSnapshot().fighters[0].superMeter;
  const snap = sim.step(input({ ultimate: true }), EMPTY_INPUT);

  assert.equal(snap.fighters[0].superMeter, before);
  assert.equal(snap.fighters[0].ultimatePhase, 'idle');
  assert.ok(!snap.events.some((event) =>
    event.type === 'ultimate-start' ||
    event.type === 'ultimate-capture' ||
    event.type === 'ultimate-whiff'
  ));
});
