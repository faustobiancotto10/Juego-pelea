import test from 'node:test';
import assert from 'node:assert/strict';
import { CombatSimulation } from '../dist/game/simulation/CombatSimulation.js';
import { FIGHTER_KITS } from '../dist/game/data/fighterKits.js';
import { getMoveDefinition } from '../dist/game/simulation/moves.js';
import { EMPTY_INPUT as E } from '../dist/game/types.js';

const input = (patch = {}) => ({ ...E, ...patch });

function stepN(sim, n, p1 = E, p2 = E) {
  let snap = sim.getSnapshot();
  for (let i = 0; i < n; i += 1) snap = sim.step(p1, p2);
  return snap;
}

function runUntil(sim, predicate, max = 120, p1 = E, p2 = E) {
  let snap = sim.getSnapshot();
  const events = [];
  for (let i = 0; i < max; i += 1) {
    snap = sim.step(p1, p2);
    events.push(...snap.events);
    if (predicate(snap, events)) break;
  }
  return { snap, events };
}

test('R3 final Special grammar is uniform and low tongue is not selectable', () => {
  assert.equal(FIGHTER_KITS.chameleon.low, 'clawLow');
  assert.equal(FIGHTER_KITS.supernariz.low, 'noseLow');
  assert.equal(FIGHTER_KITS.chameleon.legacyDownSpecial, undefined);
  assert.equal(FIGHTER_KITS.chameleon.legacyUpSpecial, undefined);
  assert.equal(FIGHTER_KITS.supernariz.legacyDownSpecial, undefined);

  const cases = [
    ['chameleon', {}, 'tongueStraight'],
    ['chameleon', { right: true }, 'tongueStraight'],
    ['chameleon', { left: true }, 'tongueStraight'],
    ['chameleon', { up: true }, 'tongueStraight'],
    ['chameleon', { down: true }, 'coletazo'],
    ['supernariz', {}, 'chorizoThrow'],
    ['supernariz', { right: true }, 'chorizoThrow'],
    ['supernariz', { up: true }, 'chorizoThrow'],
    ['supernariz', { down: true }, 'tramontana'],
  ];

  for (const [id, direction, expected] of cases) {
    const other = id === 'chameleon' ? 'supernariz' : 'chameleon';
    const sim = new CombatSimulation(id, other, { skipIntro: true });
    const snap = sim.step(input({ ...direction, special: true }), E);
    assert.equal(snap.fighters[0].moveId, expected, `${id} ${JSON.stringify(direction)}`);
  }
});

test('R3 applies approved commitment candidates to ranged Specials and Tramontana', () => {
  const tongue = getMoveDefinition('chameleon', 'tongueStraight');
  assert.equal(tongue.totalFrames, 38);
  assert.deepEqual(
    [tongue.hitbox.start, tongue.hitbox.end, tongue.hitbox.damage, tongue.hitbox.chipDamage, tongue.hitbox.guardDamage],
    [12, 14, 80, 4, 14],
  );

  const chorizo = getMoveDefinition('supernariz', 'chorizoThrow');
  assert.deepEqual([chorizo.spawnProjectileFrame, chorizo.totalFrames], [12, 36]);

  const tramontana = getMoveDefinition('supernariz', 'tramontana');
  assert.equal(tramontana.totalFrames, 30);
  assert.equal(tramontana.chillFrames, 60);
  assert.deepEqual(
    [tramontana.hitbox.start, tramontana.hitbox.end, tramontana.hitbox.damage, tramontana.hitbox.hitstun, tramontana.hitbox.blockstun, tramontana.hitbox.knockback, tramontana.hitbox.guardDamage],
    [8, 11, 38, 22, 10, 4, 16],
  );
});

test('Chorizo keeps 120 cooldown and never allows two active projectiles from one owner', () => {
  const sim = new CombatSimulation('supernariz', 'chameleon', { skipIntro: true });
  sim.fighters[0].x = 200;
  sim.fighters[1].x = 1100;

  sim.step(input({ special: true }), E);
  let snap = runUntil(sim, s => s.projectiles.length === 1, 30).snap;
  assert.equal(snap.fighters[0].projectileCooldown, 120);

  // Force the cooldown boundary while the first projectile is still alive.
  sim.fighters[0].projectileCooldown = 0;
  sim.fighters[0].currentMove = null;
  sim.fighters[0].moveId = null;
  sim.fighters[0].moveFrame = 0;
  sim.resetInputState();
  sim.step(input({ special: true }), E);
  snap = stepN(sim, 20);
  assert.ok(snap.projectiles.filter(p => p.owner === 0 && p.active).length <= 1);
});

test('SUPER rewards clean offense by category; chip and Ultimate damage award zero', () => {
  const normal = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  normal.fighters[0].x = 500; normal.fighters[1].x = 590;
  normal.step(input({ attack: true }), E);
  let result = runUntil(normal, (_s, events) => events.some(e => e.type === 'hit'), 20);
  assert.equal(result.snap.fighters[0].superMeter, 46 * 0.15);
  assert.equal(result.snap.fighters[1].superMeter, 46 * 0.055);

  const special = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  special.fighters[0].x = 500; special.fighters[1].x = 700;
  special.step(input({ special: true }), E);
  result = runUntil(special, (_s, events) => events.some(e => e.type === 'hit'), 30);
  assert.equal(result.snap.fighters[0].superMeter, 8);
  assert.equal(result.snap.fighters[1].superMeter, 80 * 0.055);

  const chip = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  chip.fighters[0].x = 500; chip.fighters[1].x = 700;
  chip.step(input({ special: true }), input({ left: true }));
  result = runUntil(chip, (_s, events) => events.some(e => e.type === 'hit'), 30, E, input({ left: true }));
  assert.equal(result.snap.fighters[0].superMeter, 0);
  assert.equal(result.snap.fighters[1].superMeter, 0);

  const ult = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true, initialSuper: [100, 0] });
  ult.fighters[0].x = 500; ult.fighters[1].x = 620;
  ult.step(input({ ultimate: true }), E);
  result = runUntil(ult, (s) => s.fighters[0].ultimatePhase === 'recovery', 180);
  assert.equal(result.snap.fighters[0].superMeter, 0);
  assert.equal(result.snap.fighters[1].superMeter, 0);
});

test('SUPER READY emits exactly once when a clean normal crosses the cap', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true, initialSuper: [95, 0] });
  sim.fighters[0].x = 500; sim.fighters[1].x = 590;
  sim.step(input({ attack: true }), E);
  const result = runUntil(sim, (_s, events) => events.some(e => e.type === 'super-ready'), 30);
  assert.equal(result.snap.fighters[0].superMeter, 100);
  assert.equal(result.events.filter(e => e.type === 'super-ready' && e.fighter === 0).length, 1);
  const later = stepN(sim, 20);
  assert.equal(later.superMeter, undefined);
});

test('Push Guard creates six advancing frames of defender recovery', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  sim.fighters[0].x = 500; sim.fighters[1].x = 590;
  sim.step(input({ left: true }), input({ attack: true }));
  let result = runUntil(sim, (_s, events) => events.some(e => e.type === 'hit' && e.blocked), 20, input({ left: true }), E);

  let snap = sim.step(input({ pushGuard: true }), E);
  for (let i = 0; i < 10 && !snap.events.some(e => e.type === 'push-guard'); i += 1) snap = sim.step(E, E);
  assert.ok(snap.events.some(e => e.type === 'push-guard'));
  assert.equal(snap.fighters[0].pushGuardRecoveryFrames, 6);

  for (let i = 0; i < 5; i += 1) {
    snap = sim.step(input({ attack: true, jump: true, left: true }), E);
    assert.equal(snap.fighters[0].moveId, null);
    assert.equal(snap.fighters[0].grounded, true);
    assert.equal(snap.fighters[0].blocking, false);
  }
});

test('corner Push Guard preserves separation without side swapping', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  sim.fighters[0].x = 1098;
  sim.fighters[1].x = 1190;
  sim.fighters[0].facing = 1;
  sim.fighters[1].facing = -1;

  // P1 attacks P2 at right wall; P2 blocks and then Push Guards.
  sim.step(input({ attack: true }), input({ right: true }));
  runUntil(sim, (_s, events) => events.some(e => e.type === 'hit' && e.blocked), 20, E, input({ right: true }));
  let snap = sim.step(E, input({ pushGuard: true }));
  for (let i = 0; i < 10 && !snap.events.some(e => e.type === 'push-guard'); i += 1) snap = sim.step(E, E);

  assert.ok(snap.events.some(e => e.type === 'push-guard'));
  assert.ok(snap.fighters[1].x > snap.fighters[0].x);
  assert.ok(Math.abs(snap.fighters[1].x - snap.fighters[0].x) >= 120);
});
