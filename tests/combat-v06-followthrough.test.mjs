import test from 'node:test';
import assert from 'node:assert/strict';
import { CombatSimulation } from '../dist/game/simulation/CombatSimulation.js';
import { CpuController } from '../dist/game/simulation/CpuController.js';
import { DEFAULT_COMBAT_REGISTRY } from '../dist/game/data/combatRegistry.js';
import { EMPTY_INPUT as E } from '../dist/game/types.js';

const input = (patch = {}) => ({ ...E, ...patch });

function runUntil(sim, predicate, max = 240, inputs = () => [E, E]) {
  let snap = sim.getSnapshot();
  const events = [];
  for (let tick = 0; tick < max; tick += 1) {
    const [p1, p2] = inputs(tick, snap);
    snap = sim.step(p1, p2);
    events.push(...snap.events);
    if (predicate(snap, events)) return { snap, events, ticks: tick + 1 };
  }
  return { snap, events, ticks: max };
}

test('R3 grounded jump preparation is exactly J0=2, J1=1, J2=takeoff with cached direction', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  sim.fighters[0].x = 300;
  sim.fighters[1].x = 1000;

  let snap = sim.step(input({ right: true, jump: true }), E);
  assert.equal(snap.fighters[0].grounded, true);
  assert.equal(snap.fighters[0].jumpStartupFrames, 2);
  assert.equal(snap.fighters[0].vx, 0);
  assert.ok(snap.events.some(e => e.type === 'jump-start' && e.fighter === 0));

  snap = sim.step(input({ left: true }), E);
  assert.equal(snap.fighters[0].grounded, true);
  assert.equal(snap.fighters[0].jumpStartupFrames, 1);
  assert.equal(snap.fighters[0].vx, 0);

  const beforeTakeoffX = snap.fighters[0].x;
  snap = sim.step(input({ left: true }), E);
  assert.equal(snap.fighters[0].grounded, false);
  assert.equal(snap.fighters[0].jumpStartupFrames, 0);
  assert.ok(snap.fighters[0].x > beforeTakeoffX, 'takeoff carry must use cached right direction from J0');
  assert.ok(snap.fighters[0].vx > 0);
  assert.ok(snap.fighters[0].vy > 0);
  assert.equal(snap.fighters[0].airborneTicks, 1);
  assert.ok(snap.events.some(e => e.type === 'takeoff' && e.fighter === 0));
});

test('R3 jump preparation cannot attack/block and a clean normal interrupts it', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  sim.fighters[0].x = 500;
  sim.fighters[1].x = 590;

  let snap = sim.step(input({ jump: true }), E);
  assert.equal(snap.fighters[0].jumpStartupFrames, 2);

  sim.fighters[1].currentMove = sim.registry.getMove('supernariz', 'nose1');
  sim.fighters[1].moveId = 'nose1';
  sim.fighters[1].moveFrame = 3;
  sim.fighters[1].moveHasHit = false;
  sim.fighters[1].moveContact = 'none';

  snap = sim.step(input({ left: true, attack: true }), E);
  const hit = snap.events.find(e => e.type === 'hit' && e.attacker === 1 && e.defender === 0);
  assert.ok(hit);
  assert.equal(hit.blocked, false);
  assert.equal(snap.fighters[0].jumpStartupFrames, 0);
  assert.equal(snap.fighters[0].moveId, null);
  assert.ok(snap.fighters[0].stunFrames > 0);
});

test('V0.7 Lengua preserves startup/active identity while using the frozen anti-spam candidate', () => {
  const tongue = DEFAULT_COMBAT_REGISTRY.getMove('chameleon', 'tongueStraight');
  assert.equal(tongue.totalFrames, 54);
  assert.equal(tongue.hitbox.start, 12);
  assert.equal(tongue.hitbox.end, 14);
  assert.equal(tongue.hitbox.offsetX, 34);
  assert.equal(tongue.hitbox.width, 300);
  assert.equal(tongue.hitbox.damage, 72);
  assert.equal(tongue.hitbox.chipDamage, 3);
  assert.equal(tongue.hitbox.hitstun, 16);
  assert.equal(tongue.hitbox.blockstun, 8);
  assert.equal(tongue.hitbox.guardDamage, 10);
  assert.equal(tongue.hitbox.knockback, 3.2);
});

test('R3 preserves successful Coletazo values unchanged', () => {
  const move = DEFAULT_COMBAT_REGISTRY.getMove('chameleon', 'coletazo');
  assert.equal(move.totalFrames, 31);
  assert.equal(move.hitbox.start, 6);
  assert.equal(move.hitbox.end, 10);
  assert.equal(move.hitbox.width, 146);
  assert.equal(move.hitbox.damage, 52);
  assert.equal(move.hitbox.knockback, 13.5);
  assert.equal(move.hitbox.hitstun, 14);
});

test('R3 publishes explicit content tactics for all three released CPU profiles', () => {
  for (const id of ['chameleon', 'supernariz', 'juanchi']) {
    const profile = DEFAULT_COMBAT_REGISTRY.getKit(id).cpu;
    assert.ok(profile.tactics, id);
    assert.equal(profile.reactionTicks, 12);
    assert.equal(profile.decisionTicks, 8);
    assert.ok(profile.tactics.ultimateRange[1] >= profile.tactics.ultimateRange[0]);
    assert.ok(profile.tactics.rangedRange[1] >= profile.tactics.rangedRange[0]);
    assert.ok(Object.values(profile.tactics.closeWeights).reduce((a, b) => a + b, 0) > 0);
  }
});

test('R3 CPU emits no combat edge while its own two-tick jump preparation is authoritative', () => {
  const sim = new CombatSimulation('juanchi', 'chameleon', { skipIntro: true });
  const cpu = new CpuController(0, { seed: 313 });
  let snap = sim.getSnapshot();

  sim.fighters[0].jumpStartupFrames = 2;
  sim.fighters[0].grounded = true;
  snap = sim.getSnapshot();
  const out = cpu.nextInput(snap);
  assert.equal(out.attack, false);
  assert.equal(out.special, false);
  assert.equal(out.jump, false);
  assert.equal(out.ultimate, false);
  assert.equal(out.dashLeft, false);
  assert.equal(out.dashRight, false);
});

function runDelayedJumpEvade(attackerId) {
  const defenderId = attackerId === 'chameleon' ? 'supernariz' : 'chameleon';
  const sim = new CombatSimulation(attackerId, defenderId, { skipIntro: true, initialSuper: [100, 0] });
  sim.fighters[0].x = 500;
  sim.fighters[1].x = 700;

  let snap = sim.step(input({ ultimate: true }), E);
  for (let n = 0; n < 12; n += 1) snap = sim.step(E, E);

  snap = sim.step(E, input({ jump: true }));
  let captured = snap.events.some(e => e.type === 'ultimate-capture' && e.defender === 1);
  for (let n = 0; n < 90 && !captured && snap.fighters[0].ultimatePhase !== 'recovery'; n += 1) {
    snap = sim.step(E, E);
    captured ||= snap.events.some(e => e.type === 'ultimate-capture' && e.defender === 1);
  }
  return { snap, captured };
}

test('R3 12-tick delayed jump response remains a reproducible evade against all three Ultimate kinds at mid-range', () => {
  for (const attackerId of ['chameleon', 'supernariz', 'juanchi']) {
    const { snap, captured } = runDelayedJumpEvade(attackerId);
    assert.equal(captured, false, attackerId);
    assert.equal(snap.fighters[0].ultimateConnected, false, attackerId);
  }
});

function runCpuDuel(p1Id, p2Id, seed, maxFrames = 18000) {
  const sim = new CombatSimulation(p1Id, p2Id, { skipIntro: true });
  const cpu0 = new CpuController(0, { seed });
  const cpu1 = new CpuController(1, { seed: seed ^ 0x9e3779b9 });
  let snap = sim.getSnapshot();
  const actions = [new Map(), new Map()];
  const damage = [0, 0];
  const illegalRanged = [0, 0];

  for (let frame = 0; frame < maxFrames && snap.phase !== 'match-over'; frame += 1) {
    const out0 = cpu0.nextInput(snap);
    const out1 = cpu1.nextInput(snap);
    const before = snap;
    snap = sim.step(out0, out1);

    for (const [index, out] of [[0, out0], [1, out1]]) {
      const map = actions[index];
      for (const key of ['attack', 'special', 'jump', 'ultimate']) {
        if (out[key]) map.set(key, (map.get(key) ?? 0) + 1);
      }
      if (
        out.special
        && !out.down
        && before.fighters[index].rangedAvailability !== 'ready'
      ) illegalRanged[index] += 1;
    }

    for (const event of snap.events) {
      if (event.type === 'hit' && !event.blocked) damage[event.attacker] += event.damage;
    }
  }

  return {
    phase: snap.phase,
    winner: snap.winner,
    combatTick: snap.combatTick,
    damage,
    actions: actions.map(map => Object.fromEntries(map)),
    illegalRanged,
  };
}

test('R3 ordered 3x3 CPU corpus across seeds completes with real interaction and no illegal ranged attempts', () => {
  const roster = ['chameleon', 'supernariz', 'juanchi'];
  const seeds = [113, 197, 313, 997];
  const rows = [];

  for (const p1 of roster) {
    for (const p2 of roster) {
      for (const seed of seeds) {
        const result = runCpuDuel(p1, p2, seed);
        rows.push({ p1, p2, seed, ...result });
        assert.equal(result.phase, 'match-over', `${p1} vs ${p2} seed=${seed}`);
        assert.notEqual(result.winner, null);
        assert.ok(result.damage[0] + result.damage[1] > 0, 'duel must contain clean interaction');
        assert.deepEqual(result.illegalRanged, [0, 0], 'CPU must obey authoritative ranged availability');
        assert.ok((result.actions[0].attack ?? 0) + (result.actions[0].special ?? 0) + (result.actions[0].ultimate ?? 0) > 0);
        assert.ok((result.actions[1].attack ?? 0) + (result.actions[1].special ?? 0) + (result.actions[1].ultimate ?? 0) > 0);
      }
    }
  }

  console.log('R3 ordered 3x3 CPU corpus:', JSON.stringify(rows));
});
