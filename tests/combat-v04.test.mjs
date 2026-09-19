import test from 'node:test';
import assert from 'node:assert/strict';
import { CombatSimulation } from '../dist/game/simulation/CombatSimulation.js';
import { CpuController } from '../dist/game/simulation/CpuController.js';
import { getMoveDefinition } from '../dist/game/simulation/moves.js';
import { EMPTY_INPUT } from '../dist/game/types.js';

const input = (patch = {}) => ({ ...EMPTY_INPUT, ...patch });

function stepN(sim, frames, p1 = EMPTY_INPUT, p2 = EMPTY_INPUT) {
  let snap = sim.getSnapshot();
  for (let i = 0; i < frames; i += 1) snap = sim.step(p1, p2);
  return snap;
}

function closeFighters(sim, frames = 48) {
  return stepN(sim, frames, input({ right: true }), input({ left: true }));
}

function runUntil(sim, predicate, maxFrames, p1 = EMPTY_INPUT, p2 = EMPTY_INPUT) {
  let snap = sim.getSnapshot();
  for (let i = 0; i < maxFrames; i += 1) {
    snap = sim.step(p1, p2);
    if (predicate(snap)) return snap;
  }
  return snap;
}

function mutableSnapshot(sim) {
  return structuredClone(sim.getSnapshot());
}

test('final-round Ultimate KO enters match-over with no stale capture or Ultimate transient state', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true, initialSuper: [100, 0] });

  // Isolate the real final-round transition without replaying an entire prior round.
  sim.fighters[0].roundWins = 1;
  sim.fighters[1].health = 190;
  closeFighters(sim, 48);

  sim.step(input({ ultimate: true }), EMPTY_INPUT);
  let snap = runUntil(
    sim,
    (s) => s.phase === 'round-over',
    180,
  );
  assert.equal(snap.phase, 'round-over', 'the Ultimate should decide the round');

  snap = runUntil(sim, (s) => s.phase === 'match-over', 120);
  assert.equal(snap.phase, 'match-over');
  assert.equal(snap.fighters[0].ultimatePhase, 'idle');
  assert.equal(snap.fighters[0].ultimateTarget, null);
  assert.equal(snap.fighters[0].moveId, null);
  assert.equal(snap.fighters[1].capturedBy, null);
});

test('successful Ultimate exposes authoritative capture state and releases defender back to movement', () => {
  const sim = new CombatSimulation('supernariz', 'chameleon', { skipIntro: true, initialSuper: [100, 0] });
  closeFighters(sim, 48);

  sim.step(input({ ultimate: true }), EMPTY_INPUT);
  let snap = runUntil(
    sim,
    (s) => s.fighters[0].ultimatePhase === 'sequence',
    80,
  );
  assert.equal(snap.fighters[1].capturedBy, 0, 'snapshot should expose simulation-owned capture truth');

  snap = runUntil(
    sim,
    (s) => s.fighters[0].ultimatePhase === 'idle',
    180,
  );
  assert.equal(snap.fighters[1].capturedBy, null);
  assert.equal(snap.fighters[0].ultimateTarget, null);

  const before = snap.fighters[1].x;
  snap = stepN(sim, 8, EMPTY_INPUT, input({ right: true }));
  assert.ok(snap.fighters[1].x > before, 'released defender should regain normal movement');
});

test('Supernariz CPU leaves a measurable post-commit gap before restarting close pressure', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  const cpu = new CpuController(1);

  const committed = mutableSnapshot(sim);
  committed.frame = 100;
  committed.fighters[0].x = 590;
  committed.fighters[1].x = 680;
  committed.fighters[1].moveId = 'nose3';
  committed.fighters[1].moveFrame = 25;
  cpu.nextInput(committed);

  const firstIdle = structuredClone(committed);
  firstIdle.frame = 101;
  firstIdle.fighters[1].moveId = null;
  firstIdle.fighters[1].moveFrame = 0;
  const action = cpu.nextInput(firstIdle);

  assert.equal(action.attack, false, 'CPU should not restart pressure on the first idle frame after a commitment');
  assert.equal(action.special, false, 'CPU should leave a punish/reaction gap after a commitment');
});

test('Supernariz CPU does not auto-convert every eligible nose-chain opportunity', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  const decisions = [];

  for (let frame = 40; frame < 48; frame += 1) {
    const snap = mutableSnapshot(sim);
    snap.frame = frame;
    snap.fighters[0].x = 590;
    snap.fighters[1].x = 680;
    snap.fighters[1].moveId = 'nose1';
    snap.fighters[1].moveFrame = 11;
    decisions.push(new CpuController(1).nextInput(snap).attack);
  }

  assert.ok(decisions.some(Boolean), 'pressure identity should still include legal chain conversions');
  assert.ok(decisions.some((value) => !value), 'conversion should be intentionally imperfect, not 100%');
});

test('Camaleoni close-game tuning preserves Supernariz startup tempo but gains contest/reset value', () => {
  const claw1 = getMoveDefinition('chameleon', 'claw1');
  const claw2 = getMoveDefinition('chameleon', 'claw2');
  const coletazo = getMoveDefinition('chameleon', 'coletazo');
  const nose1 = getMoveDefinition('supernariz', 'nose1');

  assert.ok(claw1.hitbox.start > nose1.hitbox.start, 'Supernariz must retain the faster startup tempo');
  assert.ok(nose1.totalFrames <= claw1.totalFrames, 'Supernariz should retain equal or better first-normal tempo/recovery');
  assert.ok(
    claw1.hitbox.offsetX + claw1.hitbox.width > nose1.hitbox.offsetX + nose1.hitbox.width,
    'Camaleoni should compensate with practical contest/whiff-punish reach',
  );
  assert.ok(claw1.totalFrames <= 19, 'claw1 recovery must be practical enough for close contest');
  assert.ok(claw2.totalFrames <= 22, 'the two-hit chain must not leave excessive dead time');
  assert.ok(coletazo.hitbox.start <= 6, 'Coletazo must start quickly enough to function as a reset');
  assert.ok(coletazo.totalFrames <= 32, 'Coletazo should remain punishable but not be a 36-frame liability');
  assert.ok(coletazo.hitbox.knockback >= 13, 'Coletazo must preserve meaningful reset separation');
});

test('V0.4 gameplay remains deterministic for identical fixed-step input streams', () => {
  const a = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true, initialSuper: [100, 100] });
  const b = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true, initialSuper: [100, 100] });

  for (let frame = 0; frame < 240; frame += 1) {
    const p1 = frame === 20
      ? input({ ultimate: true })
      : frame % 43 === 0
        ? input({ up: true, special: true })
        : frame % 17 < 8
          ? input({ right: true })
          : EMPTY_INPUT;
    const p2 = frame === 120
      ? input({ ultimate: true })
      : frame % 29 === 0
        ? input({ attack: true })
        : frame % 19 < 7
          ? input({ left: true })
          : EMPTY_INPUT;

    assert.deepEqual(a.step(p1, p2), b.step(p1, p2));
  }
});


test('Supernariz final-round Ultimate KO also clears all terminal capture state', () => {
  const sim = new CombatSimulation('supernariz', 'chameleon', { skipIntro: true, initialSuper: [100, 0] });
  sim.fighters[0].roundWins = 1;
  sim.fighters[1].health = 190;
  closeFighters(sim, 48);

  sim.step(input({ ultimate: true }), EMPTY_INPUT);
  let snap = runUntil(sim, (s) => s.phase === 'round-over', 220);
  assert.equal(snap.phase, 'round-over');

  snap = runUntil(sim, (s) => s.phase === 'match-over', 120);
  assert.equal(snap.phase, 'match-over');
  for (const fighter of snap.fighters) {
    assert.equal(fighter.ultimatePhase, 'idle');
    assert.equal(fighter.ultimateTarget, null);
    assert.equal(fighter.capturedBy, null);
    assert.equal(fighter.moveId, null);
  }
});

test('Ultimate whiff fully releases transient target/capture state after recovery', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true, initialSuper: [100, 0] });
  sim.step(input({ ultimate: true }), EMPTY_INPUT);

  let snap = runUntil(
    sim,
    (s) => s.fighters[0].ultimatePhase === 'recovery',
    80,
  );
  assert.equal(snap.fighters[0].superMeter, 0, 'committed whiff should spend meter');
  assert.equal(snap.fighters[0].ultimateTarget, null);
  assert.equal(snap.fighters[1].capturedBy, null);

  snap = runUntil(
    sim,
    (s) => s.fighters[0].ultimatePhase === 'idle',
    120,
  );
  assert.equal(snap.fighters[0].moveId, null);
  assert.equal(snap.fighters[0].ultimateTarget, null);
  assert.equal(snap.fighters[0].capturedBy, null);
  assert.equal(snap.fighters[1].capturedBy, null);
});

test('interrupted pre-commit Ultimate startup spends no meter and leaves no capture state', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true, initialSuper: [100, 0] });
  closeFighters(sim, 62);

  sim.step(input({ ultimate: true }), input({ attack: true }));
  const snap = stepN(sim, 12);

  assert.equal(snap.fighters[0].superMeter, 100, 'startup interruption before capture must preserve SUPER');
  assert.equal(snap.fighters[0].ultimatePhase, 'idle');
  assert.equal(snap.fighters[0].ultimateTarget, null);
  assert.equal(snap.fighters[0].capturedBy, null);
  assert.equal(snap.fighters[0].moveId, null);
  assert.equal(snap.fighters[1].capturedBy, null);
});

test('non-final Ultimate KO starts the next round with no stale capture state', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true, initialSuper: [100, 0] });
  sim.fighters[1].health = 190;
  closeFighters(sim, 48);

  sim.step(input({ ultimate: true }), EMPTY_INPUT);
  let snap = runUntil(sim, (s) => s.phase === 'round-over', 180);
  assert.equal(snap.phase, 'round-over');
  for (const fighter of snap.fighters) {
    assert.equal(fighter.ultimatePhase, 'idle');
    assert.equal(fighter.ultimateTarget, null);
    assert.equal(fighter.capturedBy, null);
    assert.equal(fighter.moveId, null);
  }

  snap = runUntil(sim, (s) => s.round === 2 && s.phase === 'fight', 140);
  assert.equal(snap.round, 2);
  for (const fighter of snap.fighters) {
    assert.equal(fighter.ultimatePhase, 'idle');
    assert.equal(fighter.ultimateTarget, null);
    assert.equal(fighter.capturedBy, null);
    assert.equal(fighter.moveId, null);
  }
});
