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


function blockedTongueHit(sim) {
  let snap = sim.step(EMPTY_INPUT, input({ special: true }));

  // tongueStraight first becomes active at move frame 9. Stay neutral through
  // startup so the defender does not walk out of the authored threat space.
  for (let i = 0; i < 8; i += 1) snap = sim.step(EMPTY_INPUT, EMPTY_INPUT);

  snap = sim.step(input({ left: true }), EMPTY_INPUT);
  assert.ok(
    snap.events.some((event) => event.type === 'hit' && event.blocked),
    'setup must produce a blocked tongue hit on its first active frame',
  );
  return snap;
}

test('ultimate startup can be interrupted before commitment without spending SUPER or recording whiff', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true, initialSuper: [100, 0] });
  stepN(sim, 60, input({ right: true }), input({ left: true }));

  let snap = sim.step(input({ ultimate: true }), input({ attack: true }));
  const events = [...snap.events];
  for (let i = 0; i < 12 && snap.fighters[0].ultimatePhase !== 'idle'; i += 1) {
    snap = sim.step(EMPTY_INPUT, EMPTY_INPUT);
    events.push(...snap.events);
  }

  assert.equal(snap.fighters[0].ultimatePhase, 'idle');
  assert.equal(snap.fighters[0].superMeter, 100);
  assert.equal(events.some((event) => event.type === 'ultimate-whiff' && event.attacker === 0), false);
  assert.ok(events.some((event) => event.type === 'hit' && event.attacker === 1 && !event.blocked));
});

test('Push Guard is rejected below its GUARD cost and during Guard Break', () => {
  const sim = new CombatSimulation('supernariz', 'chameleon', { skipIntro: true });
  stepN(sim, 48, input({ right: true }), input({ left: true }));

  let snap = sim.getSnapshot();
  for (let hit = 0; hit < 4; hit += 1) {
    snap = blockedTongueHit(sim);
    for (let i = 0; i < 40 && snap.fighters[1].moveId !== null; i += 1) {
      snap = sim.step(EMPTY_INPUT, EMPTY_INPUT);
    }
  }

  assert.ok(snap.fighters[0].guard > 0 && snap.fighters[0].guard < 34, 'four blocked tongues should leave low positive GUARD');

  const guardBeforeRejectedPush = snap.fighters[0].guard;
  snap = sim.step(input({ left: true, pushGuard: true }), EMPTY_INPUT);
  assert.equal(snap.events.some((event) => event.type === 'push-guard'), false);
  assert.equal(snap.fighters[0].guard, guardBeforeRejectedPush);

  for (let i = 0; i < 40 && snap.fighters[1].moveId !== null; i += 1) {
    snap = sim.step(EMPTY_INPUT, EMPTY_INPUT);
  }
  snap = blockedTongueHit(sim);
  assert.ok(snap.fighters[0].guardBreakFrames > 0, 'next blocked tongue should trigger Guard Break');

  const guardAtBreak = snap.fighters[0].guard;
  snap = sim.step(input({ pushGuard: true }), EMPTY_INPUT);
  assert.equal(snap.events.some((event) => event.type === 'push-guard'), false);
  assert.equal(snap.fighters[0].guard, guardAtBreak);
});

test('blocked wall pressure transfers separation back to the attacker', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });

  stepN(sim, 125, input({ left: true }), input({ left: true }));
  stepN(sim, 35, input({ left: true }), input({ left: true }));
  let snap = sim.getSnapshot();

  assert.equal(snap.fighters[0].x, 90);
  const separationBefore = snap.fighters[1].x - snap.fighters[0].x;

  sim.step(input({ left: true }), input({ attack: true }));
  let sawBlockedHit = false;
  for (let i = 0; i < 18 && !sawBlockedHit; i += 1) {
    snap = sim.step(input({ left: true }), EMPTY_INPUT);
    sawBlockedHit = snap.events.some((event) => event.type === 'hit' && event.blocked);
  }

  assert.equal(sawBlockedHit, true);
  assert.ok(
    snap.fighters[1].x - snap.fighters[0].x > separationBefore,
    'a blocked hit on a pinned defender must push pressure back toward the attacker',
  );
});

function runMirroredCamaleoniJumpEvade(camaleoniIndex) {
  const sim = camaleoniIndex === 0
    ? new CombatSimulation('chameleon', 'supernariz', { skipIntro: true, initialSuper: [100, 0] })
    : new CombatSimulation('supernariz', 'chameleon', { skipIntro: true, initialSuper: [0, 100] });

  stepN(sim, 48, input({ right: true }), input({ left: true }));

  let snap = camaleoniIndex === 0
    ? sim.step(input({ ultimate: true }), input({ jump: true }))
    : sim.step(input({ jump: true }), input({ ultimate: true }));
  const events = [...snap.events];

  for (let i = 0; i < 45 && !events.some((event) => event.type === 'ultimate-whiff' || event.type === 'ultimate-capture'); i += 1) {
    snap = sim.step(EMPTY_INPUT, EMPTY_INPUT);
    events.push(...snap.events);
  }
  return events;
}

test('Camaleoni jump-evade result is symmetric when Camaleoni is P1 or P2', () => {
  for (const index of [0, 1]) {
    const events = runMirroredCamaleoniJumpEvade(index);
    assert.ok(events.some((event) => event.type === 'ultimate-whiff' && event.attacker === index));
    assert.equal(events.some((event) => event.type === 'ultimate-capture' && event.attacker === index), false);
  }
});

test('ultimate capture geometry explicitly rejects targets behind the locked attacker facing', async () => {
  const { readFile } = await import('node:fs/promises');
  const source = await readFile(new URL('../src/game/simulation/CombatSimulation.ts', import.meta.url), 'utf8');

  assert.match(source, /signedDistance\s*>=\s*0[\s\S]*CAMALEONI_ULT_CAPTURE_REACH/);
  assert.match(source, /signedDistance\s*>\s*0[\s\S]*SUPERNARIZ_ULT_SUCTION_RANGE/);
});
