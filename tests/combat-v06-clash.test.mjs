import test from 'node:test';
import assert from 'node:assert/strict';
import { CombatSimulation } from '../dist/game/simulation/CombatSimulation.js';
import { ULTIMATES } from '../dist/game/data/ultimates.js';
import { EMPTY_INPUT as E } from '../dist/game/types.js';

const input = (patch = {}) => ({ ...E, ...patch });

function setupPositions(sim, scenario, leftSlot = 0) {
  const pair = scenario === 'left-wall' ? [90, 210]
    : scenario === 'right-wall' ? [1070, 1190]
      : [500, 620];
  if (leftSlot === 0) {
    sim.fighters[0].x = pair[0];
    sim.fighters[1].x = pair[1];
  } else {
    sim.fighters[0].x = pair[1];
    sim.fighters[1].x = pair[0];
  }
}

function definitionFor(sim, index) {
  const fighter = sim.fighters[index];
  const kit = sim.registry.getKit(fighter.id);
  const move = sim.registry.getMove(fighter.id, kit.ultimate);
  return sim.registry.getUltimate(move.ultimateKey);
}

function runAlignedClash(p1, p2, scenario = 'center', leftSlot = 0) {
  const sim = new CombatSimulation(p1, p2, {
    skipIntro: true,
    initialSuper: [100, 100],
  });
  setupPositions(sim, scenario, leftSlot);

  // Let neutral facing settle before locking Ultimate facings.
  let snap = sim.step(E, E);
  const definitions = [definitionFor(sim, 0), definitionFor(sim, 1)];
  const maxStartup = Math.max(definitions[0].startupFrames, definitions[1].startupFrames);
  const starts = [
    1 + (maxStartup - definitions[0].startupFrames),
    1 + (maxStartup - definitions[1].startupFrames),
  ];

  let clashSnap = null;
  for (let tick = 1; tick < 120 && !clashSnap; tick += 1) {
    const p1Input = tick === starts[0] ? input({ ultimate: true }) : E;
    const p2Input = tick === starts[1] ? input({ ultimate: true }) : E;
    snap = sim.step(p1Input, p2Input);
    if (snap.events.some((event) => event.type === 'ultimate-clash')) {
      clashSnap = structuredClone(snap);
    }
  }

  return { sim, snap, clashSnap };
}

test('R1 actual input path Clashes every existing ordered kind pairing with mirrored slot geometry', () => {
  const ids = ['chameleon', 'supernariz'];
  for (const p1 of ids) {
    for (const p2 of ids) {
      for (const leftSlot of [0, 1]) {
        const { clashSnap } = runAlignedClash(p1, p2, 'center', leftSlot);
        assert.ok(clashSnap, `${p1}/${p2} leftSlot=${leftSlot}`);
        assert.equal(clashSnap.events.filter(e => e.type === 'ultimate-clash').length, 1);
        assert.equal(clashSnap.events.some(e => e.type === 'hit'), false);
        assert.equal(clashSnap.fighters[0].superMeter, 0);
        assert.equal(clashSnap.fighters[1].superMeter, 0);
        assert.equal(clashSnap.fighters[0].capturedBy, null);
        assert.equal(clashSnap.fighters[1].capturedBy, null);
        assert.equal(clashSnap.fighters[0].clashRecoveryFrames, 30);
        assert.equal(clashSnap.fighters[1].clashRecoveryFrames, 30);
        assert.equal(clashSnap.clash.phase, 'freeze');
        assert.equal(clashSnap.hitstopFrames, 12);
        assert.notEqual(clashSnap.fighters[0].ultimateEffectiveTick, clashSnap.combatTick + 1);
      }
    }
  }
});

test('R1 Clash freeze is exactly 12 step calls and discards action edges', () => {
  const { sim, clashSnap } = runAlignedClash('chameleon', 'chameleon');
  assert.ok(clashSnap);
  const frozenTick = clashSnap.combatTick;
  let snap = clashSnap;

  for (let n = 0; n < 12; n += 1) {
    snap = sim.step(n === 0 ? input({ attack: true }) : E, E);
    assert.equal(snap.combatTick, frozenTick);
    assert.equal(snap.hitstopFrames, 11 - n);
  }

  assert.equal(snap.clash.phase, 'freeze');
  snap = sim.step(E, E);
  assert.equal(snap.combatTick, frozenTick + 1);
  assert.equal(snap.clash.phase, 'launch');
  assert.equal(snap.clash.launchTick, snap.combatTick);
  assert.equal(snap.fighters[0].moveId, null);
});

test('R1 Clash launches both for 30 advancing ticks then releases simultaneously with neutral spacing', () => {
  for (const scenario of ['center', 'left-wall', 'right-wall']) {
    const { sim, clashSnap } = runAlignedClash('chameleon', 'supernariz', scenario);
    assert.ok(clashSnap);
    const orderBefore = Math.sign(clashSnap.fighters[1].x - clashSnap.fighters[0].x);

    let snap = clashSnap;
    for (let n = 0; n < 12; n += 1) snap = sim.step(E, E);

    let launchTicks = 0;
    while (snap.clash !== null && launchTicks < 40) {
      snap = sim.step(E, E);
      launchTicks += 1;
      if (snap.clash) {
        assert.equal(snap.fighters[0].clashRecoveryFrames, snap.fighters[1].clashRecoveryFrames);
      }
    }

    assert.equal(launchTicks, 30, scenario);
    assert.equal(snap.clash, null);
    assert.equal(snap.fighters[0].clashRecoveryFrames, 0);
    assert.equal(snap.fighters[1].clashRecoveryFrames, 0);
    assert.equal(snap.fighters[0].grounded, true);
    assert.equal(snap.fighters[1].grounded, true);
    assert.equal(snap.fighters[0].vx, 0);
    assert.equal(snap.fighters[1].vx, 0);
    assert.ok(Math.abs(snap.fighters[1].x - snap.fighters[0].x) >= 300, scenario);
    assert.equal(Math.sign(snap.fighters[1].x - snap.fighters[0].x), orderBefore);

    const next = sim.step(input({ attack: true }), E);
    assert.equal(next.fighters[0].moveId, 'claw1');
  }
});

function primeCapture(sim, index, effectiveTick, phaseFrame = 0) {
  const fighter = sim.fighters[index];
  const kit = sim.registry.getKit(fighter.id);
  const move = sim.registry.getMove(fighter.id, kit.ultimate);
  fighter.currentMove = move;
  fighter.moveId = move.id;
  fighter.moveFrame = 0;
  fighter.moveHasHit = false;
  fighter.moveContact = 'none';
  fighter.moveEffectTriggered = false;
  fighter.ultimatePhase = 'capture';
  fighter.ultimatePhaseFrame = phaseFrame;
  fighter.ultimateEffectiveTick = effectiveTick;
  fighter.ultimateConnected = false;
  fighter.ultimateTarget = null;
  fighter.ultimateFacing = index === 0 ? 1 : -1;
  fighter.superMeter = 0;
  fighter.superReady = false;
  fighter.grounded = true;
  fighter.stunFrames = 0;
  fighter.guardBreakFrames = 0;
  fighter.capturedBy = null;
}

test('R1 effective-entry difference 4 is outside Clash and earlier entry wins mutual capture without slot bias', () => {
  for (const earlier of [0, 1]) {
    const sim = new CombatSimulation('chameleon', 'chameleon', { skipIntro: true });
    sim.fighters[0].x = 500;
    sim.fighters[1].x = 620;
    sim.combatTick = 100;
    primeCapture(sim, 0, earlier === 0 ? 97 : 101);
    primeCapture(sim, 1, earlier === 1 ? 97 : 101);

    const snap = sim.step(E, E);
    assert.equal(snap.events.some(e => e.type === 'ultimate-clash'), false);
    assert.equal(snap.events.filter(e => e.type === 'ultimate-capture').length, 1);
    assert.equal(snap.events.find(e => e.type === 'ultimate-capture').attacker, earlier);
    assert.equal(snap.fighters[earlier].ultimatePhase, 'sequence');
  }
});

test('R1 exact late mutual capture tie becomes two committed whiffs, never a slot winner', () => {
  const sim = new CombatSimulation('chameleon', 'chameleon', { skipIntro: true });
  sim.fighters[0].x = 500;
  sim.fighters[1].x = 620;
  sim.combatTick = 100;
  primeCapture(sim, 0, 96);
  primeCapture(sim, 1, 96);

  const snap = sim.step(E, E);
  assert.equal(snap.events.some(e => e.type === 'ultimate-clash'), false);
  assert.equal(snap.events.some(e => e.type === 'ultimate-capture'), false);
  assert.deepEqual(
    snap.events.filter(e => e.type === 'ultimate-whiff').map(e => e.attacker).sort(),
    [0, 1],
  );
  assert.equal(snap.fighters[0].ultimatePhase, 'recovery');
  assert.equal(snap.fighters[1].ultimatePhase, 'recovery');
});

test('R1 ordinary projectile interruption defeats a prospective Clash before arbitration', () => {
  const sim = new CombatSimulation('chameleon', 'chameleon', { skipIntro: true });
  sim.fighters[0].x = 500;
  sim.fighters[1].x = 620;
  sim.combatTick = 100;
  primeCapture(sim, 0, 101);
  primeCapture(sim, 1, 101);

  sim.projectiles.push({
    id: 900,
    owner: 0,
    kind: 'chorizo',
    x: 611,
    y: 68,
    vx: 9.2,
    active: true,
    ttl: 10,
  });

  // Inject the released Chorizo definition through a mixed registry is not
  // available for chameleon-only content, so use Supernariz as projectile owner.
  sim.fighters[0].id = 'supernariz';
  const snap = sim.step(E, E);
  assert.equal(snap.events.some(e => e.type === 'hit' && e.source === 'projectile'), true);
  assert.equal(snap.events.some(e => e.type === 'ultimate-clash'), false);
  assert.notEqual(snap.fighters[1].stunFrames, 0);
});

test('R1 accepted Clash clears encounter projectiles and prebuffered commands', () => {
  const { sim } = runAlignedClash('supernariz', 'supernariz');
  const snap = sim.getSnapshot();
  assert.ok(snap.clash);
  assert.equal(snap.projectiles.length, 0);
  assert.equal(sim.fighters[0].pendingCommand, null);
  assert.equal(sim.fighters[1].pendingCommand, null);
});
