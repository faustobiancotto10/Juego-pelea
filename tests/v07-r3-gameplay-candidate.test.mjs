import test from 'node:test';
import assert from 'node:assert/strict';
import { CombatSimulation } from '../dist/game/simulation/CombatSimulation.js';
import { CpuController } from '../dist/game/simulation/CpuController.js';
import { DEFAULT_COMBAT_REGISTRY } from '../dist/game/data/combatRegistry.js';
import { DEFAULT_CHARACTER_COMPOSITION } from '../dist/game/data/characterContent.js';
import { EMPTY_INPUT as E } from '../dist/game/types.js';

const input = (patch = {}) => ({ ...E, ...patch });
const ROSTER = ['chameleon', 'supernariz', 'juanchi', 'el-toro'];
const SEEDS = [113, 197, 313, 997];

function runCpuDuel(p1Id, p2Id, seed, maxFrames = 18000) {
  const sim = new CombatSimulation(p1Id, p2Id, { skipIntro: true });
  const cpu0 = new CpuController(0, { seed, difficulty: 'normal' });
  const cpu1 = new CpuController(1, { seed: seed ^ 0x9e3779b9, difficulty: 'normal' });
  let snap = sim.getSnapshot();
  const actions = [new Map(), new Map()];
  const cleanDamage = [0, 0];
  const illegalRanged = [0, 0];
  let maxRound = snap.round;
  let roundStarts = 0;

  for (let frame = 0; frame < maxFrames && snap.phase !== 'match-over'; frame += 1) {
    const out0 = cpu0.nextInput(snap);
    const out1 = cpu1.nextInput(snap);
    const before = snap;
    snap = sim.step(out0, out1);
    maxRound = Math.max(maxRound, snap.round);
    roundStarts += snap.events.filter(e => e.type === 'round-start').length;

    for (const [index, out] of [[0, out0], [1, out1]]) {
      const map = actions[index];
      for (const key of ['attack', 'special', 'jump', 'ultimate']) {
        if (out[key]) map.set(key, (map.get(key) ?? 0) + 1);
      }
      if (
        out.special
        && !out.down
        && before.fighters[index].rangedAvailability !== 'ready'
      ) {
        illegalRanged[index] += 1;
      }
    }

    for (const event of snap.events) {
      if (event.type === 'hit' && !event.blocked) cleanDamage[event.attacker] += event.damage;
    }
  }

  return {
    phase: snap.phase,
    winner: snap.winner,
    combatTick: snap.combatTick,
    maxRound,
    roundStarts,
    cleanDamage,
    illegalRanged,
    actions: actions.map(map => Object.fromEntries(map)),
  };
}

test('V07-R3 ordered 4x4 Normal CPU corpus across representative seeds completes legally', () => {
  assert.deepEqual([...DEFAULT_CHARACTER_COMPOSITION.playableIds], ROSTER);
  const rows = [];

  for (const p1 of ROSTER) {
    for (const p2 of ROSTER) {
      for (const seed of SEEDS) {
        const result = runCpuDuel(p1, p2, seed);
        rows.push({ p1, p2, seed, ...result });
        assert.equal(result.phase, 'match-over', `${p1} vs ${p2} seed=${seed}`);
        assert.notEqual(result.winner, null, `${p1} vs ${p2} seed=${seed} needs a winner`);
        assert.ok(result.cleanDamage[0] + result.cleanDamage[1] > 0, 'match must contain clean interaction');
        assert.deepEqual(result.illegalRanged, [0, 0], 'CPU must obey authoritative ranged availability');
        assert.ok(result.maxRound >= 2, 'match-over must traverse a real round reset');
        for (const side of [0, 1]) {
          const actionCount = (result.actions[side].attack ?? 0)
            + (result.actions[side].special ?? 0)
            + (result.actions[side].ultimate ?? 0);
          assert.ok(actionCount > 0, `side ${side} stayed inert in ${p1}/${p2}/${seed}`);
        }
      }
    }
  }

  console.log('V07-R3 ordered 4x4 CPU corpus:', JSON.stringify(rows));
});

function cpuTrace(fighterId, difficulty, seed) {
  const foe = fighterId === 'chameleon' ? 'supernariz' : 'chameleon';
  const sim = new CombatSimulation(foe, fighterId, { skipIntro: true });
  const cpu = new CpuController(1, { difficulty, seed });
  let snap = sim.getSnapshot();
  const trace = [];

  for (let tick = 0; tick < 240; tick += 1) {
    const out = cpu.nextInput(snap);
    trace.push(JSON.stringify(out));
    snap = sim.step(E, out);
  }
  return trace;
}

test('V07-R3 every released CPU fighter replays deterministically on Easy/Normal/Hard', () => {
  for (const fighterId of ROSTER) {
    for (const difficulty of ['easy', 'normal', 'hard']) {
      const first = cpuTrace(fighterId, difficulty, 197);
      const second = cpuTrace(fighterId, difficulty, 197);
      assert.deepEqual(second, first, `${fighterId}/${difficulty}`);
      assert.ok(first.some(row => row !== JSON.stringify(E)), `${fighterId}/${difficulty} stayed inert`);
    }
  }
});

function definitionFor(sim, index) {
  const fighter = sim.fighters[index];
  const kit = sim.registry.getKit(fighter.id);
  const move = sim.registry.getMove(fighter.id, kit.ultimate);
  return sim.registry.getUltimate(move.ultimateKey);
}

function runAlignedClash(p1, p2, leftSlot = 0) {
  const sim = new CombatSimulation(p1, p2, {
    skipIntro: true,
    initialSuper: [100, 100],
  });
  const pair = [500, 620];
  if (leftSlot === 0) {
    sim.fighters[0].x = pair[0];
    sim.fighters[1].x = pair[1];
  } else {
    sim.fighters[0].x = pair[1];
    sim.fighters[1].x = pair[0];
  }

  let snap = sim.step(E, E);
  const defs = [definitionFor(sim, 0), definitionFor(sim, 1)];
  const maxStartup = Math.max(defs[0].startupFrames, defs[1].startupFrames);
  const starts = [
    1 + (maxStartup - defs[0].startupFrames),
    1 + (maxStartup - defs[1].startupFrames),
  ];

  for (let tick = 1; tick < 120; tick += 1) {
    snap = sim.step(
      tick === starts[0] ? input({ ultimate: true }) : E,
      tick === starts[1] ? input({ ultimate: true }) : E,
    );
    if (snap.events.some(e => e.type === 'ultimate-clash')) return snap;
  }
  return null;
}

test('V07-R3 all 4x4 ordered Ultimate pairings Clash symmetrically in both slot geometries', () => {
  for (const p1 of ROSTER) {
    for (const p2 of ROSTER) {
      for (const leftSlot of [0, 1]) {
        const snap = runAlignedClash(p1, p2, leftSlot);
        assert.ok(snap, `missing Clash: ${p1}/${p2}/leftSlot=${leftSlot}`);
        assert.equal(snap.events.filter(e => e.type === 'ultimate-clash').length, 1);
        assert.equal(snap.events.some(e => e.type === 'hit'), false);
        assert.equal(snap.fighters[0].capturedBy, null);
        assert.equal(snap.fighters[1].capturedBy, null);
        assert.equal(snap.fighters[0].superMeter, 0);
        assert.equal(snap.fighters[1].superMeter, 0);
        assert.equal(snap.fighters[0].clashRecoveryFrames, 30);
        assert.equal(snap.fighters[1].clashRecoveryFrames, 30);
      }
    }
  }
});

test('V07-R3 round reset clears projectiles/transients/resources that must not leak', () => {
  const sim = new CombatSimulation('el-toro', 'juanchi', { skipIntro: true });
  sim.fighters[0].x = 300;
  sim.fighters[1].x = 900;

  sim.step(input({ special: true }), E);
  let snap = sim.getSnapshot();
  for (let i = 0; i < 30 && snap.projectiles.length === 0; i += 1) snap = sim.step(E, E);
  assert.equal(snap.projectiles.length, 1, 'Shawarmazo should exist before forced round end');
  assert.equal(snap.fighters[0].rangedAvailability, 'cooldown');

  sim.fighters[1].health = 0;
  snap = sim.step(E, E);
  assert.equal(snap.phase, 'round-over');

  for (let i = 0; i < 100 && !(snap.phase === 'fight' && snap.round === 2); i += 1) {
    snap = sim.step(E, E);
  }

  assert.equal(snap.phase, 'fight');
  assert.equal(snap.round, 2);
  assert.equal(snap.projectiles.length, 0);
  assert.equal(snap.fighters[0].health, 1100);
  assert.equal(snap.fighters[1].health, 1000);
  for (const fighter of snap.fighters) {
    assert.equal(fighter.moveId, null);
    assert.equal(fighter.ultimatePhase, 'idle');
    assert.equal(fighter.capturedBy, null);
    assert.equal(fighter.jumpStartupFrames, 0);
    assert.equal(fighter.guardBreakFrames, 0);
    assert.equal(fighter.projectileCooldown, 0);
    assert.equal(fighter.rangedAvailability, 'ready');
  }
});

test('V07-R3 fresh rematch construction resets match-scoped state for every ordered matchup', () => {
  for (const p1 of ROSTER) {
    for (const p2 of ROSTER) {
      const sim = new CombatSimulation(p1, p2, { skipIntro: true });
      const snap = sim.getSnapshot();
      assert.equal(snap.round, 1);
      assert.equal(snap.phase, 'fight');
      assert.equal(snap.winner, null);
      assert.equal(snap.projectiles.length, 0);
      for (const [index, id] of [[0, p1], [1, p2]]) {
        const fighter = snap.fighters[index];
        assert.equal(fighter.id, id);
        assert.equal(fighter.health, DEFAULT_COMBAT_REGISTRY.getFighter(id).maxHealth);
        assert.equal(fighter.superMeter, 0);
        assert.equal(fighter.roundWins, 0);
        assert.equal(fighter.rangedAvailability, 'ready');
        assert.equal(fighter.ultimatePhase, 'idle');
        assert.equal(fighter.capturedBy, null);
      }
    }
  }
});
