import test from 'node:test';
import assert from 'node:assert/strict';
import { CombatSimulation } from '../dist/game/simulation/CombatSimulation.js';
import { ULTIMATES } from '../dist/game/data/ultimates.js';
import { EMPTY_INPUT as E } from '../dist/game/types.js';

const input = (patch = {}) => ({ ...E, ...patch });

function ultimateInput(attacker) {
  return attacker === 0 ? [input({ ultimate: true }), E] : [E, input({ ultimate: true })];
}

function inputsFor(attacker, defenderMash = false, frame = 0) {
  if (!defenderMash) return [E, E];
  const attack = frame % 2 === 0;
  if (attacker === 0) return [E, input({ left: true, attack, jump: attack })];
  return [input({ right: true, attack, jump: attack }), E];
}

function setup(id, attacker, scenario) {
  const sim = new CombatSimulation(id, id, {
    skipIntro: true,
    initialSuper: attacker === 0 ? [100, 0] : [0, 100],
  });
  if (scenario === 'center') {
    if (attacker === 0) { sim.fighters[0].x = 500; sim.fighters[1].x = 620; }
    else { sim.fighters[0].x = 660; sim.fighters[1].x = 780; }
  } else {
    if (attacker === 0) { sim.fighters[0].x = 1070; sim.fighters[1].x = 1190; }
    else { sim.fighters[0].x = 90; sim.fighters[1].x = 210; }
  }
  return sim;
}

function runSuccess(id, attacker, scenario) {
  const sim = setup(id, attacker, scenario);
  const defender = attacker === 0 ? 1 : 0;
  const start = ultimateInput(attacker);
  let snap = sim.step(start[0], start[1]);
  let captured = false;
  let released = false;
  let releaseSnap = null;
  let releaseTick = null;
  let defenderHitAttacker = false;

  for (let n = 0; n < 320; n += 1) {
    captured ||= snap.fighters[defender].capturedBy === attacker;
    for (const event of snap.events) {
      if (event.type === 'ultimate-release' && event.attacker === attacker) {
        released = true;
        releaseSnap = structuredClone(snap);
        releaseTick = snap.combatTick;
      }
      if (released && event.type === 'hit' && event.attacker === defender && event.defender === attacker) {
        defenderHitAttacker = true;
      }
    }
    if (captured && released && snap.fighters[attacker].ultimatePhase === 'idle') break;
    const next = inputsFor(attacker, released, n);
    snap = sim.step(next[0], next[1]);
  }

  return { sim, snap, captured, released, releaseSnap, releaseTick, defenderHitAttacker };
}

test('released Ultimate startup tells are 22 Camaleoni / 24 Supernariz while whiff recovery stays longer', () => {
  assert.equal(ULTIMATES.camaleoniUltimate.startupFrames, 22);
  assert.equal(ULTIMATES.supernarizUltimate.startupFrames, 24);
  assert.equal(ULTIMATES.camaleoniUltimate.successRecoveryFrames, 16);
  assert.equal(ULTIMATES.supernarizUltimate.successRecoveryFrames, 16);
  assert.equal(ULTIMATES.camaleoniUltimate.recoveryFrames, 24);
  assert.equal(ULTIMATES.supernarizUltimate.recoveryFrames, 28);
});

test('successful Ultimates release through one authoritative launch state and reach >=200 by attacker actionability', () => {
  for (const id of ['chameleon', 'supernariz']) {
    for (const attacker of [0, 1]) {
      for (const scenario of ['center', 'wall']) {
        const result = runSuccess(id, attacker, scenario);
        const defender = attacker === 0 ? 1 : 0;
        assert.equal(result.captured, true, `${id} attacker=${attacker} scenario=${scenario}`);
        assert.equal(result.released, true);
        assert.ok(result.releaseSnap.events.some(e => e.type === 'ultimate-release' && e.attacker === attacker && e.defender === defender));
        assert.equal(result.releaseSnap.fighters[defender].capturedBy, null);
        assert.ok(result.releaseSnap.fighters[defender].stunFrames >= 30);
        assert.equal(Math.abs(result.releaseSnap.fighters[defender].vx), 14);
        assert.equal(result.releaseSnap.fighters[defender].vy, 5);
        assert.equal(result.releaseSnap.fighters[defender].grounded, false);
        assert.equal(result.snap.fighters[defender].health, 810);
        assert.equal(result.snap.fighters[attacker].ultimatePhase, 'idle');
        assert.equal(result.snap.fighters[attacker].ultimateConnected, false);
        assert.ok(Math.abs(result.snap.fighters[defender].x - result.snap.fighters[attacker].x) >= 200);
        assert.equal(result.defenderHitAttacker, false, 'release mash cannot punish winner before successful recovery ends');
        assert.equal(result.snap.combatTick - result.releaseTick, 16, 'successful recovery is exactly 16 advancing frames');
      }
    }
  }
});

test('successful release is reflected consistently for attacker slot 0 and slot 1', () => {
  for (const id of ['chameleon', 'supernariz']) {
    const left = runSuccess(id, 0, 'center').releaseSnap;
    const right = runSuccess(id, 1, 'center').releaseSnap;
    assert.ok(left && right);
    const leftSep = left.fighters[1].x - left.fighters[0].x;
    const rightSep = right.fighters[0].x - right.fighters[1].x;
    assert.ok(leftSep > 0);
    assert.ok(rightSep < 0);
    assert.equal(Math.round(Math.abs(leftSep)), Math.round(Math.abs(rightSep)));
    assert.equal(left.fighters[1].stunFrames, right.fighters[0].stunFrames);
    assert.equal(Math.abs(left.fighters[1].vx), Math.abs(right.fighters[0].vx));
    assert.equal(left.fighters[1].vy, right.fighters[0].vy);
  }
});

test('committed Ultimate whiff spends meter, stays disconnected and keeps punishable 24/28 recovery', () => {
  for (const [id, expected] of [['chameleon', 24], ['supernariz', 28]]) {
    const sim = new CombatSimulation(id, id, { skipIntro: true, initialSuper: [100, 0] });
    sim.fighters[0].x = 200;
    sim.fighters[1].x = 1100;
    let snap = sim.step(input({ ultimate: true }), E);
    let whiffTick = null;
    for (let n = 0; n < 180 && whiffTick === null; n += 1) {
      snap = sim.step(E, E);
      if (snap.events.some(e => e.type === 'ultimate-whiff')) whiffTick = snap.combatTick;
    }
    assert.notEqual(whiffTick, null);
    assert.equal(snap.fighters[0].superMeter, 0);
    assert.equal(snap.fighters[0].ultimateConnected, false);
    while (snap.fighters[0].ultimatePhase !== 'idle') snap = sim.step(E, E);
    assert.equal(snap.combatTick - whiffTick, expected);
  }
});

test('exact simultaneous same-kit capture request resolves deterministically to one capture owner', () => {
  function trace() {
    const sim = new CombatSimulation('chameleon', 'chameleon', { skipIntro: true, initialSuper: [100, 100] });
    sim.fighters[0].x = 500;
    sim.fighters[1].x = 620;
    let snap = sim.step(input({ ultimate: true }), input({ ultimate: true }));
    const captures = [];
    for (let n = 0; n < 100 && captures.length === 0; n += 1) {
      snap = sim.step(E, E);
      captures.push(...snap.events.filter(e => e.type === 'ultimate-capture'));
    }
    return { captures, snap };
  }
  const a = trace();
  const b = trace();
  assert.equal(a.captures.length, 1);
  assert.deepEqual(a.captures, b.captures);
  assert.equal(a.snap.fighters.filter(f => f.capturedBy !== null).length, 1);
});
