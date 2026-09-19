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

function closeFighters(sim, frames = 52) {
  return stepN(sim, frames, input({ right: true }), input({ left: true }));
}

test('holding away walks backward and still blocks a compatible incoming strike', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  const start = sim.getSnapshot().fighters[1].x;
  const retreated = stepN(sim, 12, EMPTY_INPUT, input({ right: true })).fighters[1];
  assert.ok(retreated.x > start, 'holding away should move the right-side fighter backward');
  assert.equal(retreated.blocking, false, 'walking backward should not freeze in a block pose before impact');

  closeFighters(sim, 60);
  sim.step(input({ special: true }), input({ right: true }));
  const after = stepN(sim, 16, EMPTY_INPUT, input({ right: true }));
  assert.ok(after.fighters[1].blockstunFrames > 0 || after.fighters[1].blocking);
  assert.ok(after.fighters[1].health > 900, 'blocked tongue should only deal chip damage');
});

test('standing guard loses to grounded low while down-back blocks low and loses to overhead', () => {
  const stand = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  stand.fighters[0].x = 500;
  stand.fighters[1].x = 562;
  stand.step(input({ down: true, attack: true }), input({ right: true }));
  const standAfter = stepN(stand, 18, EMPTY_INPUT, input({ right: true }));
  assert.ok(standAfter.fighters[1].health <= 964, 'standing guard must not block a grounded low normal');

  const crouch = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  crouch.fighters[0].x = 500;
  crouch.fighters[1].x = 562;
  crouch.step(input({ down: true, attack: true }), input({ right: true, down: true }));
  const crouchAfter = stepN(crouch, 18, EMPTY_INPUT, input({ right: true, down: true }));
  assert.ok(crouchAfter.fighters[1].health >= 998, 'down-back should block a grounded low normal');

  const overhead = new CombatSimulation('supernariz', 'chameleon', { skipIntro: true });
  closeFighters(overhead, 68);
  overhead.step(input({ jump: true }), input({ left: true, down: true }));
  stepN(overhead, 3, input({ right: true }), input({ left: true, down: true }));
  overhead.step(input({ right: true, attack: true }), input({ left: true, down: true }));
  const overheadAfter = stepN(overhead, 12, input({ right: true }), input({ left: true, down: true }));
  assert.ok(overheadAfter.fighters[1].health < 1000, 'crouch guard must lose to an overhead air attack');
});

test('guard damage can break defense and guard later regenerates', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  sim.fighters[0].x = 500;
  sim.fighters[1].x = 700;
  sim.fighters[1].guard = 14;
  sim.fighters[1].guardRegenDelay = 45;

  sim.step(input({ special: true }), input({ right: true }));
  let snap = sim.getSnapshot();
  for (let i = 0; i < 40 && snap.fighters[1].guardBreakFrames === 0; i += 1) {
    snap = sim.step(EMPTY_INPUT, input({ right: true }));
  }
  assert.equal(snap.fighters[1].guard, 0);
  assert.ok(snap.fighters[1].guardBreakFrames > 0, 'one blocked Lengua at 14 GUARD should break defense');

  snap = stepN(sim, 130);
  assert.equal(snap.fighters[1].guardBreakFrames, 0);
  assert.ok(snap.fighters[1].guard > 55, 'guard should regenerate after the break and recovery delay');
});

test('a whiffed light attack cannot chain but a connected light attack can', () => {
  const whiff = new CombatSimulation('supernariz', 'chameleon', { skipIntro: true });
  whiff.step(input({ attack: true }), EMPTY_INPUT);
  stepN(whiff, 11);
  let snap = whiff.step(input({ attack: true }), EMPTY_INPUT);
  assert.equal(snap.fighters[0].moveId, 'nose1', 'whiffed nose1 must not cancel into nose2');

  const hit = new CombatSimulation('supernariz', 'chameleon', { skipIntro: true });
  closeFighters(hit, 70);
  snap = hit.step(input({ attack: true }), EMPTY_INPUT);
  while (snap.fighters[0].moveId === 'nose1' && snap.fighters[0].moveFrame < 10) snap = hit.step(EMPTY_INPUT, EMPTY_INPUT);
  snap = hit.step(input({ attack: true }), EMPTY_INPUT);
  assert.equal(snap.fighters[0].moveId, 'nose2', 'connected nose1 should retain its combo cancel');
});

test('forward dash closes distance and backdash has a brief strike-evasion window', () => {
  const dash = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  const start = dash.getSnapshot().fighters[0].x;
  let snap = dash.step(input({ dashRight: true }), EMPTY_INPUT);
  assert.equal(snap.fighters[0].dashKind, 'forward');
  snap = stepN(dash, 8);
  assert.ok(snap.fighters[0].x > start + 50);

  const evade = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  closeFighters(evade, 63);
  const before = evade.getSnapshot().fighters[0].health;
  evade.step(input({ dashLeft: true }), input({ attack: true }));
  snap = stepN(evade, 8, EMPTY_INPUT, EMPTY_INPUT);
  assert.equal(snap.fighters[0].health, before, 'backdash invulnerability should evade a timed physical strike');
});

test('jumping can clear a low strike, clear a chorizo projectile, and cross over the opponent', () => {
  const low = new CombatSimulation('supernariz', 'chameleon', { skipIntro: true });
  closeFighters(low, 60);
  low.step(input({ jump: true }), input({ down: true, attack: true }));
  const lowSnap = stepN(low, 18, input({ right: true }), EMPTY_INPUT);
  assert.equal(lowSnap.fighters[0].health, 1000, 'an airborne fighter above the low hitbox should not be hit');

  const projectile = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  let snap = projectile.getSnapshot();
  for (let i = 0; i < 35; i += 1) snap = projectile.step(input({ right: true }), input({ left: true }));
  projectile.step(input({ jump: true }), input({ special: true }));
  snap = stepN(projectile, 28, input({ right: true }), EMPTY_INPUT);
  assert.equal(snap.fighters[0].health, 1000, 'a sufficiently high jump should clear the chorizo projectile');

  const cross = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  closeFighters(cross, 74);
  const beforeSide = cross.getSnapshot();
  assert.ok(beforeSide.fighters[0].x < beforeSide.fighters[1].x);
  snap = cross.step(input({ right: true, jump: true }), EMPTY_INPUT);
  const takeoffFacing = snap.fighters[0].facing;
  for (let i = 0; i < 40 && snap.fighters[0].x <= snap.fighters[1].x; i += 1) {
    snap = cross.step(input({ right: true }), EMPTY_INPUT);
  }
  assert.ok(snap.fighters[0].x > snap.fighters[1].x, 'forward jump should be able to cross over a grounded rival');
  assert.equal(snap.fighters[0].facing, takeoffFacing, 'facing remains locked while airborne');

  for (let i = 0; i < 80 && (!snap.fighters[0].grounded || snap.fighters[0].landingRecoveryFrames > 0); i += 1) {
    snap = cross.step(EMPTY_INPUT, EMPTY_INPUT);
  }
  snap = cross.step(EMPTY_INPUT, EMPTY_INPUT);
  assert.equal(snap.fighters[0].facing, -1, 'grounded actionable neutral reorients after the crossover');
});

test('backdash recovery cannot turn into guard while the dash is still committed', () => {
  const sim = new CombatSimulation('supernariz', 'chameleon', { skipIntro: true });
  sim.fighters[0].x = 90;
  sim.fighters[1].x = 185;
  const before = sim.getSnapshot().fighters[0].health;

  sim.step(input({ left: true, dashLeft: true }), EMPTY_INPUT);
  stepN(sim, 6, input({ left: true }), EMPTY_INPUT);
  sim.step(input({ left: true }), input({ attack: true }));
  const snap = stepN(sim, 8, input({ left: true }), EMPTY_INPUT);

  assert.ok(snap.fighters[0].health < before, 'late backdash recovery should be vulnerable, not auto-block while holding away');
});

test('backdash does not add projectile invulnerability or projectile guard', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  stepN(sim, 80, input({ left: true }), EMPTY_INPUT);
  assert.equal(sim.getSnapshot().fighters[0].x, 90, 'defender should be cornered so backdash movement cannot outrun the projectile');

  sim.step(EMPTY_INPUT, input({ special: true }));
  let snap = sim.getSnapshot();
  for (let i = 0; i < 120; i += 1) {
    snap = sim.step(EMPTY_INPUT, EMPTY_INPUT);
    const projectile = snap.projectiles[0];
    if (projectile && Math.abs(projectile.x - snap.fighters[0].x) < 80) break;
  }
  assert.ok(snap.projectiles.length > 0, 'projectile should be approaching before the cornered backdash starts');

  sim.step(input({ left: true, dashLeft: true }), EMPTY_INPUT);
  snap = stepN(sim, 8, input({ left: true }), EMPTY_INPUT);

  assert.ok(snap.fighters[0].health <= 942, 'a cornered backdash must take the projectile instead of auto-blocking it');
});
