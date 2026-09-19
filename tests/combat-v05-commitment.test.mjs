import test from 'node:test';
import assert from 'node:assert/strict';
import { CombatSimulation } from '../dist/game/simulation/CombatSimulation.js';
import { getMoveDefinition } from '../dist/game/simulation/moves.js';
import { EMPTY_INPUT as E } from '../dist/game/types.js';

const input = (patch = {}) => ({ ...E, ...patch });

function placeClose(sim, leftX = 500, rightX = 590) {
  sim.fighters[0].x = leftX;
  sim.fighters[1].x = rightX;
}

function forceMove(sim, index, moveId, moveFrame) {
  const fighter = sim.fighters[index];
  fighter.currentMove = getMoveDefinition(fighter.id, moveId);
  fighter.moveId = moveId;
  fighter.moveFrame = moveFrame;
  fighter.moveHasHit = false;
  fighter.moveEffectTriggered = false;
  fighter.comboCount = 1;
  fighter.stunFrames = 0;
  fighter.blockstunFrames = 0;
  fighter.guardBreakFrames = 0;
  fighter.ultimatePhase = 'idle';
  fighter.ultimateTarget = null;
  fighter.capturedBy = null;
  fighter.dashKind = null;
  fighter.grounded = true;
}

function hitFor(snapshot, defender) {
  return snapshot.events.find((event) => event.type === 'hit' && event.defender === defender);
}

test('Lengua startup cannot block nose1 by holding away', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  placeClose(sim);

  sim.step(input({ left: true, special: true }), input({ attack: true }));
  let snap;
  for (let n = 0; n < 4; n += 1) snap = sim.step(input({ left: true }), E);

  const hit = hitFor(snap, 0);
  assert.ok(hit);
  assert.equal(hit.blocked, false);
  assert.equal(hit.damage, 42);
  assert.equal(snap.fighters[0].moveId, null);
});

test('mirrored slot: Chorizo startup cannot block claw1 by holding away', () => {
  const sim = new CombatSimulation('supernariz', 'chameleon', { skipIntro: true });
  placeClose(sim);

  sim.step(input({ left: true, special: true }), input({ attack: true }));
  let snap;
  for (let n = 0; n < 5; n += 1) snap = sim.step(input({ left: true }), E);

  const hit = hitFor(snap, 0);
  assert.ok(hit);
  assert.equal(hit.blocked, false);
  assert.equal(hit.damage, 46);
  assert.equal(snap.fighters[0].moveId, null);
});

test('simultaneous active strikes trade instead of illegally guarding through commitment', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  placeClose(sim);
  forceMove(sim, 0, 'claw1', 4);
  forceMove(sim, 1, 'nose1', 3);

  const snap = sim.step(input({ left: true }), input({ right: true }));
  const p1Hit = hitFor(snap, 0);
  const p2Hit = hitFor(snap, 1);

  assert.ok(p1Hit);
  assert.ok(p2Hit);
  assert.equal(p1Hit.blocked, false);
  assert.equal(p2Hit.blocked, false);
  assert.equal(p1Hit.damage, 42);
  assert.equal(p2Hit.damage, 46);
  assert.equal(snap.fighters[0].health, 958);
  assert.equal(snap.fighters[1].health, 954);
});

test('recovery frames cannot block an incoming strike while holding away', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  placeClose(sim);
  forceMove(sim, 0, 'tongueStraight', 20);
  forceMove(sim, 1, 'nose1', 3);

  const snap = sim.step(input({ left: true }), E);
  const hit = hitFor(snap, 0);

  assert.ok(hit);
  assert.equal(hit.blocked, false);
  assert.equal(hit.damage, 42);
  assert.equal(snap.fighters[0].moveId, null);
});

test('neutral grounded away guard remains legal', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  placeClose(sim);
  forceMove(sim, 1, 'nose1', 3);

  const snap = sim.step(input({ left: true }), E);
  const hit = hitFor(snap, 0);

  assert.ok(hit);
  assert.equal(hit.blocked, true);
  assert.equal(hit.damage, 3);
  assert.ok(snap.fighters[0].blockstunFrames > 0);
});

test('existing blockstun can continue correct-height guard', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  placeClose(sim);
  sim.fighters[0].blockstunFrames = 3;
  sim.fighters[0].blocking = true;
  forceMove(sim, 1, 'nose1', 3);

  const snap = sim.step(input({ left: true }), E);
  const hit = hitFor(snap, 0);

  assert.ok(hit);
  assert.equal(hit.blocked, true);
  assert.equal(hit.damage, 3);
  assert.ok(snap.fighters[0].blockstunFrames > 0);
});

test('a committed move cannot guard a projectile', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  sim.fighters[0].x = 500;
  sim.fighters[1].x = 700;
  forceMove(sim, 0, 'claw1', 10);
  sim.projectiles.push({
    id: 999,
    owner: 1,
    x: 520,
    y: 68,
    vx: -9.2,
    active: true,
    ttl: 10,
  });

  const snap = sim.step(input({ left: true }), E);
  const hit = hitFor(snap, 0);

  assert.ok(hit);
  assert.equal(hit.blocked, false);
  assert.equal(hit.damage, 58);
  assert.equal(snap.fighters[0].moveId, null);
});

test('low GUARD does not guard-break while the defender is offensively committed', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  placeClose(sim);
  sim.fighters[0].guard = 5;
  forceMove(sim, 0, 'claw1', 10);
  forceMove(sim, 1, 'nose1', 3);

  const snap = sim.step(input({ left: true }), E);
  const hit = hitFor(snap, 0);

  assert.ok(hit);
  assert.equal(hit.blocked, false);
  assert.equal(hit.damage, 42);
  assert.ok(snap.fighters[0].guard >= 5, 'illegal guard must not spend GUARD while an attack is committed');
  assert.equal(snap.fighters[0].guardBreakFrames, 0);
  assert.equal(snap.fighters[0].moveId, null);
  assert.equal(snap.events.some((event) => event.type === 'guard-break' && event.defender === 0), false);
});

test('invalid Ultimate intent cannot suspend a committed move timeline', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true, initialSuper: [100, 0] });
  sim.step(input({ attack: true }), E);
  const before = sim.getSnapshot().fighters[0];
  assert.equal(before.moveId, 'claw1');
  assert.equal(before.moveFrame, 0);

  const snap = sim.step(input({ ultimate: true }), E);
  assert.equal(snap.fighters[0].ultimatePhase, 'idle');
  assert.equal(snap.fighters[0].moveId, 'claw1');
  assert.equal(snap.fighters[0].moveFrame, 1);
});

test('invalid Push Guard intent cannot suspend a committed move timeline', () => {
  const sim = new CombatSimulation('supernariz', 'chameleon', { skipIntro: true });
  sim.step(input({ attack: true }), E);
  const before = sim.getSnapshot().fighters[0];
  assert.equal(before.moveId, 'nose1');
  assert.equal(before.moveFrame, 0);

  const snap = sim.step(input({ pushGuard: true }), E);
  assert.equal(snap.fighters[0].moveId, 'nose1');
  assert.equal(snap.fighters[0].moveFrame, 1);
});

test('R1 commitment rules remain deterministic for mirrored fixed-step streams', () => {
  const a = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true, initialSuper: [100, 100] });
  const b = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true, initialSuper: [100, 100] });

  for (let frame = 0; frame < 180; frame += 1) {
    const p1 = frame % 47 === 0
      ? input({ left: true, special: true })
      : frame % 31 === 0
        ? input({ left: true, attack: true })
        : frame % 29 === 0
          ? input({ ultimate: true })
          : frame % 23 === 0
            ? input({ pushGuard: true })
            : input({ left: true });
    const p2 = frame % 43 === 0
      ? input({ right: true, attack: true })
      : frame % 37 === 0
        ? input({ right: true, special: true })
        : input({ right: true });

    assert.deepEqual(a.step(p1, p2), b.step(p1, p2));
  }
});
