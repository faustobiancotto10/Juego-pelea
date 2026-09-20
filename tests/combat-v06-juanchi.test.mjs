import test from 'node:test';
import assert from 'node:assert/strict';
import { CombatSimulation } from '../dist/game/simulation/CombatSimulation.js';
import { CpuController } from '../dist/game/simulation/CpuController.js';
import { DEFAULT_COMBAT_REGISTRY } from '../dist/game/data/combatRegistry.js';
import { EMPTY_INPUT as E } from '../dist/game/types.js';

const input = (patch = {}) => ({ ...E, ...patch });
const dir = (patch = {}) => ({ left: false, right: false, up: false, down: false, ...patch });
const command = (action, direction = dir()) => ({ action, direction });

function stepNeutral(sim, count) {
  let snap = sim.getSnapshot();
  for (let i = 0; i < count; i += 1) snap = sim.step(E, E);
  return snap;
}

function runJuanchiRoute(slot, distance) {
  const other = 'chameleon';
  const sim = new CombatSimulation(
    slot === 0 ? 'juanchi' : other,
    slot === 1 ? 'juanchi' : other,
    { skipIntro: true },
  );
  sim.fighters[0].x = 500;
  sim.fighters[1].x = 500 + distance;
  const defender = slot === 0 ? 1 : 0;
  let snap = sim.step(
    slot === 0 ? input({ attack: true }) : E,
    slot === 1 ? input({ attack: true }) : E,
  );
  const hits = [];
  let queued = false;

  for (let n = 0; n < 160 && hits.length < 2; n += 1) {
    for (const event of snap.events) {
      if (event.type === 'hit' && event.attacker === slot && event.defender === defender) hits.push(event);
    }
    const self = snap.fighters[slot];
    const cancelReady = self.moveId === 'juanchiJab'
      && self.moveContact === 'hit'
      && self.moveFrame >= 9
      && self.moveFrame <= 12
      && !queued;
    if (cancelReady) queued = true;
    const press = cancelReady ? input({ commands: [command('attack')] }) : input({ commands: [] });
    snap = sim.step(slot === 0 ? press : E, slot === 1 ? press : E);
  }
  return hits;
}

test('R2 default registry publishes exact Juanchi kit and authoritative resource metadata', () => {
  assert.deepEqual([...DEFAULT_COMBAT_REGISTRY.playableIds], ['chameleon', 'supernariz', 'juanchi']);
  const fighter = DEFAULT_COMBAT_REGISTRY.getFighter('juanchi');
  assert.equal(fighter.maxHealth, 1000);
  assert.equal(fighter.walkSpeed, 4.55);
  assert.deepEqual(fighter.captureHead, { standY: 205, crouchY: 191, halfWidth: 26, halfHeight: 22 });

  const kit = DEFAULT_COMBAT_REGISTRY.getKit('juanchi');
  assert.equal(kit.standing, 'juanchiJab');
  assert.equal(kit.closeSpecial, 'friccion');
  assert.deepEqual(kit.cpu.preferredRange, [140, 230]);
  assert.deepEqual(kit.cpu.tactics.ultimateRange, [110, 285]);

  const ball = DEFAULT_COMBAT_REGISTRY.getProjectile('juanchiRugby');
  assert.equal(ball.kind, 'returnToOwner');
  assert.equal(ball.returnConfig.outboundTicks, 18);
  assert.equal(ball.returnConfig.turnTicks, 4);
  assert.equal(ball.returnConfig.maxReturnTicks, 42);
  assert.equal(ball.returnConfig.rearmTicks, 30);

  const cap = DEFAULT_COMBAT_REGISTRY.getUltimate('juanchiPoliceCap');
  assert.equal(cap.kind, 'capCapture');
  assert.equal(cap.startupFrames, 20);
  assert.equal(cap.captureFrames, 20);
  assert.equal(cap.sequenceFrames, 40);
  assert.equal(cap.sequenceHits.reduce((sum, hit) => sum + hit.damage, 0), 190);
});

test('R2 Juanchi jab -> shoulder is a true 108 clean route at 62/85 in both slots', () => {
  for (const distance of [62, 85]) {
    for (const slot of [0, 1]) {
      const hits = runJuanchiRoute(slot, distance);
      assert.deepEqual(hits.map((hit) => hit.damage), [44, 64], `distance=${distance} slot=${slot}`);
      assert.deepEqual(hits.map((hit) => hit.moveId), ['juanchiJab', 'juanchiShoulder']);
      assert.ok(hits.every((hit) => hit.blocked === false));
    }
  }
});

test('R2 Fricción owns exactly three authored contacts and totals 60 with no projectile', () => {
  for (const slot of [0, 1]) {
    const sim = new CombatSimulation(
      slot === 0 ? 'juanchi' : 'chameleon',
      slot === 1 ? 'juanchi' : 'chameleon',
      { skipIntro: true },
    );
    sim.fighters[0].x = 500;
    sim.fighters[1].x = 562;
    const defender = slot === 0 ? 1 : 0;
    let snap = sim.step(
      slot === 0 ? input({ down: true, special: true }) : E,
      slot === 1 ? input({ down: true, special: true }) : E,
    );
    const hits = [];
    for (let n = 0; n < 120 && hits.length < 3; n += 1) {
      hits.push(...snap.events.filter((event) =>
        event.type === 'hit' && event.attacker === slot && event.defender === defender
      ));
      snap = sim.step(E, E);
    }
    assert.deepEqual(hits.map((hit) => hit.hitId), ['rub-a', 'rub-b', 'palm-release']);
    assert.deepEqual(hits.map((hit) => hit.damage), [14, 14, 32]);
    assert.equal(hits.reduce((sum, hit) => sum + hit.damage, 0), 60);
    assert.equal(snap.projectiles.length, 0);
  }
});

function spawnBall(sim, owner = 0) {
  let snap = sim.step(
    owner === 0 ? input({ special: true }) : E,
    owner === 1 ? input({ special: true }) : E,
  );
  for (let n = 0; n < 50 && snap.projectiles.length === 0; n += 1) snap = sim.step(E, E);
  assert.equal(snap.projectiles.length, 1, 'ball should spawn');
  return snap;
}

test('R2 Rugby Boomerang advances outbound -> turn -> return -> catch and rearms exactly 30 ticks', () => {
  const sim = new CombatSimulation('juanchi', 'chameleon', { skipIntro: true });
  sim.fighters[0].x = 500;
  sim.fighters[1].x = 1050;
  let snap = spawnBall(sim);
  const projectileId = snap.projectiles[0].id;
  assert.equal(snap.fighters[0].rangedAvailability, 'inFlight');

  let turnEvents = 0;
  let catchEvents = 0;
  let sawTurn = false;
  let sawReturn = false;
  for (let n = 0; n < 100 && catchEvents === 0; n += 1) {
    for (const event of snap.events) {
      if (event.type === 'projectile-turn' && event.projectileId === projectileId) turnEvents += 1;
      if (event.type === 'projectile-catch' && event.projectileId === projectileId) catchEvents += 1;
    }
    sawTurn ||= snap.projectiles.some((p) => p.id === projectileId && p.phase === 'turn');
    sawReturn ||= snap.projectiles.some((p) => p.id === projectileId && p.phase === 'return');
    if (catchEvents === 0) snap = sim.step(E, E);
  }

  assert.equal(turnEvents, 1);
  assert.equal(catchEvents, 1);
  assert.equal(sawTurn, true);
  assert.equal(sawReturn, true);
  assert.equal(snap.projectiles.length, 0);
  assert.equal(snap.fighters[0].rangedAvailability, 'cooldown');
  assert.equal(snap.fighters[0].rangedRecoveryFrames, 30);

  for (let n = 0; n < 29; n += 1) snap = sim.step(E, E);
  assert.equal(snap.fighters[0].rangedAvailability, 'cooldown');
  snap = sim.step(E, E);
  assert.equal(snap.fighters[0].rangedAvailability, 'ready');
  assert.equal(snap.fighters[0].rangedRecoveryFrames, 0);
});

test('R2 Rugby Boomerang can hit once outbound and once return, never a third time', () => {
  const sim = new CombatSimulation('juanchi', 'chameleon', { skipIntro: true });
  sim.fighters[0].x = 500;
  sim.fighters[1].x = 650;
  let snap = spawnBall(sim);
  const hits = [];
  for (let n = 0; n < 140 && snap.fighters[0].rangedAvailability === 'inFlight'; n += 1) {
    hits.push(...snap.events.filter((event) =>
      event.type === 'hit' && event.source === 'projectile' && event.attacker === 0
    ));
    snap = sim.step(E, E);
  }
  hits.push(...snap.events.filter((event) =>
    event.type === 'hit' && event.source === 'projectile' && event.attacker === 0
  ));
  assert.deepEqual(hits.map((hit) => hit.leg), ['outbound', 'return']);
  assert.deepEqual(hits.map((hit) => hit.damage), [34, 30]);
  assert.equal(hits.reduce((sum, hit) => sum + hit.damage, 0), 64);
});

test('R2 repeated Special while ball is in flight is consumed without spawning a second ball', () => {
  const sim = new CombatSimulation('juanchi', 'chameleon', { skipIntro: true });
  sim.fighters[0].x = 500;
  sim.fighters[1].x = 1050;
  let snap = spawnBall(sim);
  while (snap.fighters[0].moveId !== null) snap = sim.step(E, E);
  snap = sim.step(input({ special: true }), E);
  for (let n = 0; n < 30; n += 1) snap = sim.step(E, E);
  assert.ok(snap.projectiles.length <= 1);
  assert.equal(snap.fighters[0].rangedAvailability === 'ready', false);
});

test('R2 clean hit on owner cancels an active ball before it can rescue them and starts rearm', () => {
  const sim = new CombatSimulation('juanchi', 'supernariz', { skipIntro: true });
  sim.fighters[0].x = 500;
  sim.fighters[1].x = 1050;
  let snap = spawnBall(sim);
  assert.equal(snap.projectiles.length, 1);

  sim.projectiles.push({
    id: 999,
    owner: 1,
    kind: 'chorizo',
    x: 515,
    y: 68,
    vx: -9.2,
    active: true,
    ttl: 10,
  });

  snap = sim.step(E, E);
  const incoming = snap.events.find((event) =>
    event.type === 'hit' && event.source === 'projectile' && event.attacker === 1 && event.defender === 0
  );
  assert.ok(incoming);
  assert.equal(incoming.blocked, false);
  assert.equal(snap.projectiles.some((p) => p.owner === 0 && p.kind === 'juanchiRugby'), false);
  assert.equal(snap.fighters[0].rangedAvailability, 'cooldown');
  assert.equal(snap.fighters[0].rangedRecoveryFrames, 30);
});

test('R2 outbound wall contact starts the non-damaging turn early without wrapping', () => {
  const sim = new CombatSimulation('juanchi', 'chameleon', { skipIntro: true });
  sim.fighters[0].x = 1135;
  sim.fighters[1].x = 300;
  sim.fighters[0].facing = 1;
  let snap = spawnBall(sim);
  let turned = false;
  for (let n = 0; n < 18 && !turned; n += 1) {
    turned ||= snap.events.some((event) => event.type === 'projectile-turn');
    if (!turned) snap = sim.step(E, E);
  }
  assert.equal(turned, true);
  assert.ok(snap.projectiles[0].x <= 1190 + 18);
});

function runCapSuccess(targetId = 'chameleon', attacker = 0) {
  const sim = new CombatSimulation(
    attacker === 0 ? 'juanchi' : targetId,
    attacker === 1 ? 'juanchi' : targetId,
    { skipIntro: true, initialSuper: attacker === 0 ? [100, 0] : [0, 100] },
  );
  if (attacker === 0) {
    sim.fighters[0].x = 500;
    sim.fighters[1].x = 650;
  } else {
    sim.fighters[0].x = 500;
    sim.fighters[1].x = 650;
  }
  const defender = attacker === 0 ? 1 : 0;
  let snap = sim.step(
    attacker === 0 ? input({ ultimate: true }) : E,
    attacker === 1 ? input({ ultimate: true }) : E,
  );
  const hits = [];
  let capture = null;
  let release = null;
  for (let n = 0; n < 220 && !release; n += 1) {
    for (const event of snap.events) {
      if (event.type === 'ultimate-capture' && event.attacker === attacker) capture = structuredClone(snap);
      if (event.type === 'hit' && event.attacker === attacker && event.source === 'ultimate') hits.push(event);
      if (event.type === 'ultimate-release' && event.attacker === attacker) release = structuredClone(snap);
    }
    if (!release) snap = sim.step(E, E);
  }
  return { sim, snap, hits, capture, release, defender };
}

test('R2 Police Cap Rage confirms only after the probe reaches a valid head and totals 190', () => {
  for (const targetId of ['chameleon', 'supernariz', 'juanchi']) {
    const { hits, capture, release, defender } = runCapSuccess(targetId, 0);
    assert.ok(capture, targetId);
    assert.equal(capture.events.some((event) => event.type === 'hit'), false, 'capture itself deals no damage');
    assert.equal(capture.fighters[defender].capturedBy, 0);
    assert.equal(capture.fighters[0].ultimateProbe, null);
    assert.notEqual(capture.fighters[0].captureAnchorX, null);
    assert.deepEqual(hits.map((hit) => hit.damage), [15, 15, 15, 15, 130]);
    assert.equal(hits.reduce((sum, hit) => sum + hit.damage, 0), 190);
    assert.equal(hits.at(-1).majorImpact, true);
    assert.ok(release);
    assert.equal(release.fighters[defender].capturedBy, null);
    assert.equal(release.fighters[0].captureAnchorX, null);
    assert.equal(release.hitstopFrames, 12);
  }
});

test('R2 Police Cap Rage is avoidable by jumping the fixed head-height probe and committed whiff spends meter', () => {
  const sim = new CombatSimulation('juanchi', 'chameleon', {
    skipIntro: true,
    initialSuper: [100, 0],
  });
  sim.fighters[0].x = 500;
  sim.fighters[1].x = 650;
  let snap = sim.step(input({ ultimate: true }), input({ jump: true }));
  let captured = false;
  let whiffed = false;
  for (let n = 0; n < 100 && !whiffed; n += 1) {
    captured ||= snap.events.some((event) => event.type === 'ultimate-capture');
    whiffed ||= snap.events.some((event) => event.type === 'ultimate-whiff' && event.attacker === 0);
    if (!whiffed) snap = sim.step(E, E);
  }
  assert.equal(captured, false);
  assert.equal(whiffed, true);
  assert.equal(snap.fighters[0].superMeter, 0);
  assert.equal(snap.fighters[0].ultimateProbe, null);
});

function runAlignedClash(p1, p2, leftSlot = 0) {
  const sim = new CombatSimulation(p1, p2, { skipIntro: true, initialSuper: [100, 100] });
  if (leftSlot === 0) {
    sim.fighters[0].x = 500;
    sim.fighters[1].x = 620;
  } else {
    sim.fighters[0].x = 620;
    sim.fighters[1].x = 500;
  }
  let snap = sim.step(E, E);
  const definitions = [0, 1].map((index) => {
    const fighter = sim.fighters[index];
    const kit = sim.registry.getKit(fighter.id);
    const move = sim.registry.getMove(fighter.id, kit.ultimate);
    return sim.registry.getUltimate(move.ultimateKey);
  });
  const maxStartup = Math.max(definitions[0].startupFrames, definitions[1].startupFrames);
  const starts = definitions.map((definition) => 1 + (maxStartup - definition.startupFrames));

  for (let tick = 1; tick < 100; tick += 1) {
    snap = sim.step(
      tick === starts[0] ? input({ ultimate: true }) : E,
      tick === starts[1] ? input({ ultimate: true }) : E,
    );
    if (snap.events.some((event) => event.type === 'ultimate-clash')) return snap;
  }
  return snap;
}

test('R2 Universal Ultimate Clash covers the complete 3x3 ordered roster in both side assignments', () => {
  const ids = ['chameleon', 'supernariz', 'juanchi'];
  for (const p1 of ids) {
    for (const p2 of ids) {
      for (const leftSlot of [0, 1]) {
        const snap = runAlignedClash(p1, p2, leftSlot);
        assert.equal(
          snap.events.filter((event) => event.type === 'ultimate-clash').length,
          1,
          `${p1}/${p2} leftSlot=${leftSlot}`,
        );
        assert.equal(snap.events.some((event) => event.type === 'ultimate-capture'), false);
        assert.equal(snap.events.some((event) => event.type === 'hit'), false);
        assert.equal(snap.fighters[0].superMeter, 0);
        assert.equal(snap.fighters[1].superMeter, 0);
      }
    }
  }
});

test('R2 Juanchi CPU is same-seed deterministic and never emits a second ball while one is active', () => {
  const left = new CombatSimulation('juanchi', 'chameleon', { skipIntro: true });
  const right = new CombatSimulation('juanchi', 'chameleon', { skipIntro: true });
  const cpuA = new CpuController(0, { seed: 313 });
  const cpuB = new CpuController(0, { seed: 313 });
  let a = left.getSnapshot();
  let b = right.getSnapshot();

  for (let n = 0; n < 260; n += 1) {
    const outA = cpuA.nextInput(a);
    const outB = cpuB.nextInput(b);
    assert.deepEqual(outA, outB, `tick ${n}`);
    a = left.step(outA, E);
    b = right.step(outB, E);
    assert.deepEqual(a, b, `snapshot tick ${n}`);
    assert.ok(a.projectiles.filter((p) => p.owner === 0 && p.kind === 'juanchiRugby').length <= 1);
  }
});
