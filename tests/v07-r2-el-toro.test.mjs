import test from 'node:test';
import assert from 'node:assert/strict';
import { CombatSimulation } from '../dist/game/simulation/CombatSimulation.js';
import { CpuController } from '../dist/game/simulation/CpuController.js';
import { DEFAULT_COMBAT_REGISTRY } from '../dist/game/data/combatRegistry.js';
import { DEFAULT_CHARACTER_COMPOSITION } from '../dist/game/data/characterContent.js';
import { EMPTY_INPUT as E } from '../dist/game/types.js';

const input = (patch = {}) => ({ ...E, ...patch });

function stepUntil(sim, predicate, maxTicks = 240, p1 = E, p2 = E) {
  let snap = sim.getSnapshot();
  for (let i = 0; i < maxTicks; i += 1) {
    snap = sim.step(p1, p2);
    if (predicate(snap)) return { snap, ticks: i + 1 };
  }
  return { snap, ticks: maxTicks };
}

test('V07-R2 registers El Toro as released fighter four with frozen identity/stats', () => {
  assert.deepEqual(DEFAULT_CHARACTER_COMPOSITION.playableIds, [
    'chameleon', 'supernariz', 'juanchi', 'el-toro',
  ]);
  const fighter = DEFAULT_COMBAT_REGISTRY.getFighter('el-toro');
  assert.equal(fighter.maxHealth, 1100);
  assert.equal(fighter.walkSpeed, 3.9);
  assert.equal(fighter.jumpSpeed, 11.5);
  assert.equal(fighter.gravity, 0.78);
  assert.equal(fighter.width, 64);
  assert.equal(fighter.height, 124);

  const presentation = DEFAULT_CHARACTER_COMPOSITION.presentations['el-toro'];
  assert.equal(presentation.rigKey, 'el-toro');
  assert.equal(presentation.portraitKey, 'el-toro');
  assert.equal(presentation.ultimateVisualKey, 'super-eructo');
});

test('V07-R2 Topete uses authored committed movement and stops driving after contact', () => {
  const sim = new CombatSimulation('el-toro', 'chameleon', { skipIntro: true });
  sim.fighters[0].x = 500;
  sim.fighters[1].x = 690;

  let snap = sim.step(input({ down: true, special: true }), E);
  assert.equal(snap.fighters[0].moveId, 'topete');
  const startX = snap.fighters[0].x;

  let contactX = null;
  for (let i = 0; i < 30; i += 1) {
    snap = sim.step(E, E);
    if (snap.events.some(e => e.type === 'hit' && e.moveId === 'topete')) {
      contactX = snap.fighters[0].x;
      break;
    }
  }
  assert.notEqual(contactX, null, 'Topete should reach a plausible close target');
  assert.ok(contactX > startX, 'Topete must authoritatively drive forward');

  const after = sim.step(E, E);
  assert.equal(after.fighters[0].x, contactX, 'Topete drive must stop after first contact');
  assert.equal(after.fighters[0].moveContact, 'hit');
});

test('V07-R2 Topete is blockable, punishably committed, wall-bounded and interruptible', () => {
  const blocked = new CombatSimulation('el-toro', 'chameleon', { skipIntro: true });
  blocked.fighters[0].x = 500;
  blocked.fighters[1].x = 650;
  blocked.step(input({ down: true, special: true }), input({ right: true }));
  const blockResult = stepUntil(
    blocked,
    s => s.events.some(e => e.type === 'hit' && e.moveId === 'topete'),
    30,
    E,
    input({ right: true }),
  );
  const blockEvent = blockResult.snap.events.find(e => e.type === 'hit' && e.moveId === 'topete');
  assert.equal(blockEvent?.blocked, true);
  assert.equal(blockEvent?.damage, 5);
  assert.equal(blockResult.snap.fighters[0].moveId, 'topete');
  assert.ok(blockResult.snap.fighters[0].moveFrame < 42 - 10, 'blocked Topete must retain punishable recovery');

  const wall = new CombatSimulation('el-toro', 'chameleon', { skipIntro: true });
  wall.fighters[0].x = 1160;
  wall.fighters[1].x = 1188;
  wall.step(input({ down: true, special: true }), E);
  let maxX = wall.getSnapshot().fighters[0].x;
  for (let i = 0; i < 25; i += 1) {
    const snap = wall.step(E, input({ jump: true }));
    maxX = Math.max(maxX, snap.fighters[0].x);
  }
  assert.ok(maxX <= 1190, 'Topete must remain inside arena wall');

  const interrupted = new CombatSimulation('el-toro', 'chameleon', { skipIntro: true });
  interrupted.fighters[0].x = 500;
  interrupted.fighters[1].x = 575;
  let snap = interrupted.step(input({ down: true, special: true }), input({ attack: true }));
  for (let i = 0; i < 16 && snap.fighters[0].stunFrames === 0; i += 1) {
    snap = interrupted.step(E, E);
  }
  assert.ok(snap.fighters[0].stunFrames > 0, 'Topete startup must be cleanly interruptible');
  assert.equal(snap.fighters[0].moveId, null);
});

test('V07-R2 Shawarmazo is a single-contact linear projectile with 96-tick cooldown', () => {
  const sim = new CombatSimulation('el-toro', 'chameleon', { skipIntro: true });
  sim.fighters[0].x = 300;
  sim.fighters[1].x = 660;
  const before = sim.getSnapshot().fighters[1].health;

  sim.step(input({ special: true }), E);
  const result = stepUntil(
    sim,
    s => s.events.some(e => e.type === 'hit' && e.source === 'projectile'),
    100,
  );
  const hits = result.snap.events.filter(e => e.type === 'hit' && e.source === 'projectile');
  assert.equal(hits.length, 1);
  assert.equal(hits[0].damage, 62);
  assert.equal(before - result.snap.fighters[1].health, 62);
  assert.ok(result.snap.fighters[0].projectileCooldown > 0);
  assert.equal(result.snap.fighters[0].projectileCooldownMax, 96);

  let extraHits = 0;
  for (let i = 0; i < 80; i += 1) {
    const snap = sim.step(input({ special: true }), E);
    extraHits += snap.events.filter(e => e.type === 'hit' && e.source === 'projectile').length;
  }
  assert.equal(extraHits, 0, 'cooldown/one-active rule must prevent repeat contact spam');
});

function runEructo({ block = false, behind = false } = {}) {
  const sim = new CombatSimulation('el-toro', 'chameleon', {
    skipIntro: true,
    initialSuper: [100, 0],
  });
  sim.fighters[0].x = 500;
  sim.fighters[1].x = 720;
  let snap = sim.step(input({ ultimate: true }), block ? input({ right: true }) : E);
  assert.equal(snap.fighters[0].moveId, 'superEructo');

  if (behind) {
    sim.fighters[1].x = 390;
  }

  const hits = [];
  for (let i = 0; i < 150; i += 1) {
    snap = sim.step(E, block ? input({ right: true }) : E);
    hits.push(...snap.events.filter(e => e.type === 'hit' && e.source === 'ultimate'));
    if (snap.fighters[0].ultimatePhase === 'idle' && i > 30) break;
  }
  return { snap, hits };
}

test('V07-R2 Super Eructo is forward-only, blockable and totals 180 on clean three-beat contact', () => {
  const clean = runEructo();
  assert.equal(clean.hits.length, 3);
  assert.deepEqual(clean.hits.map(e => e.damage), [45, 45, 90]);
  assert.equal(clean.hits.reduce((sum, e) => sum + e.damage, 0), 180);
  assert.ok(clean.hits.every(e => e.blocked === false));

  const blocked = runEructo({ block: true });
  assert.equal(blocked.hits.length, 3);
  assert.ok(blocked.hits.every(e => e.blocked === true));
  assert.ok(blocked.hits.reduce((sum, e) => sum + e.damage, 0) < 180);

  const behind = runEructo({ behind: true });
  assert.equal(behind.hits.length, 0, 'forwardBlast must never hit behind frozen Ultimate facing');
});

function ultimateStartup(id) {
  const kit = DEFAULT_COMBAT_REGISTRY.getKit(id);
  const move = DEFAULT_COMBAT_REGISTRY.getMove(id, kit.ultimate);
  return DEFAULT_COMBAT_REGISTRY.getUltimate(move.ultimateKey).startupFrames;
}

function runAlignedClash(leftId, rightId) {
  const sim = new CombatSimulation(leftId, rightId, {
    skipIntro: true,
    initialSuper: [100, 100],
  });
  sim.fighters[0].x = 470;
  sim.fighters[1].x = 800;

  const leftStartup = ultimateStartup(leftId);
  const rightStartup = ultimateStartup(rightId);
  const leftDelay = Math.max(0, rightStartup - leftStartup);
  const rightDelay = Math.max(0, leftStartup - rightStartup);

  let snap = sim.getSnapshot();
  for (let tick = 0; tick < 100; tick += 1) {
    const p1 = tick === leftDelay ? input({ ultimate: true }) : E;
    const p2 = tick === rightDelay ? input({ ultimate: true }) : E;
    snap = sim.step(p1, p2);
    if (snap.events.some(e => e.type === 'ultimate-clash')) return snap;
  }
  return snap;
}

test('V07-R2 forwardBlast enters Universal Ultimate Clash symmetrically with all released kinds', () => {
  for (const other of ['chameleon', 'supernariz', 'juanchi', 'el-toro']) {
    for (const pair of [['el-toro', other], [other, 'el-toro']]) {
      const snap = runAlignedClash(pair[0], pair[1]);
      assert.ok(
        snap.events.some(e => e.type === 'ultimate-clash') || snap.clash !== null,
        `expected Clash for ${pair[0]} vs ${pair[1]}`,
      );
      assert.equal(snap.fighters[0].health, DEFAULT_COMBAT_REGISTRY.getFighter(pair[0]).maxHealth);
      assert.equal(snap.fighters[1].health, DEFAULT_COMBAT_REGISTRY.getFighter(pair[1]).maxHealth);
    }
  }
});

test('V07-R2 El Toro CPU constructs and acts deterministically on all difficulty levels', () => {
  for (const difficulty of ['easy', 'normal', 'hard']) {
    const traces = [];
    for (let pass = 0; pass < 2; pass += 1) {
      const sim = new CombatSimulation('chameleon', 'el-toro', { skipIntro: true });
      const cpu = new CpuController(1, { difficulty, seed: 197 });
      let snap = sim.getSnapshot();
      const trace = [];
      for (let i = 0; i < 180; i += 1) {
        const out = cpu.nextInput(snap);
        trace.push(JSON.stringify(out));
        snap = sim.step(E, out);
      }
      traces.push(trace);
    }
    assert.deepEqual(traces[1], traces[0], difficulty);
    assert.ok(traces[0].some(row => row !== JSON.stringify(E)), `${difficulty} El Toro CPU stayed neutral`);
  }
});
