import test from 'node:test';
import assert from 'node:assert/strict';
import { CombatSimulation } from '../dist/game/simulation/CombatSimulation.js';
import { CpuController } from '../dist/game/simulation/CpuController.js';
import { createCombatRegistry, DEFAULT_COMBAT_REGISTRY } from '../dist/game/data/combatRegistry.js';
import { FIGHTERS } from '../dist/game/data/fighters.js';
import { FIGHTER_KITS } from '../dist/game/data/fighterKits.js';
import { PROJECTILES } from '../dist/game/data/projectiles.js';
import { ULTIMATES } from '../dist/game/data/ultimates.js';
import { MOVE_SETS } from '../dist/game/simulation/moves.js';
import { EMPTY_INPUT as E } from '../dist/game/types.js';
import { fixtureId, fixtureRegistry } from './fixtures/v05-registry.mjs';

const input = (patch = {}) => ({ ...E, ...patch });

function firstHit(sim, attacker, defender, p1Start, p2Start, max = 80) {
  let snap = sim.step(p1Start, p2Start);
  for (let i = 0; i < max; i += 1) {
    const hit = snap.events.find((e) => e.type === 'hit' && e.attacker === attacker && e.defender === defender);
    if (hit) return { snap, hit };
    snap = sim.step(E, E);
  }
  throw new Error('expected hit');
}

test('R2 reference traces freeze repaired R1 behavior before content extraction', () => {
  for (const id of ['chameleon', 'supernariz']) {
    for (const slot of [0, 1]) {
      const other = id === 'chameleon' ? 'supernariz' : 'chameleon';
      const sim = new CombatSimulation(
        slot === 0 ? id : other,
        slot === 1 ? id : other,
        { skipIntro: true },
      );
      sim.fighters[0].x = 500;
      sim.fighters[1].x = 590;
      const attacker = slot;
      const defender = slot === 0 ? 1 : 0;
      const starts = slot === 0
        ? [input({ attack: true }), E]
        : [E, input({ attack: true })];
      const { hit } = firstHit(sim, attacker, defender, starts[0], starts[1]);
      assert.equal(hit.blocked, false);
      assert.equal(hit.damage, id === 'chameleon' ? 46 : 42);
    }
  }

  {
    const sim = new CombatSimulation('supernariz', 'chameleon', { skipIntro: true });
    sim.fighters[0].x = 500;
    sim.fighters[1].x = 900;
    let snap = sim.step(input({ special: true }), E);
    for (let i = 0; i < 12 && snap.projectiles.length === 0; i += 1) snap = sim.step(E, E);
    assert.equal(snap.projectiles.length, 1);
    assert.equal(snap.projectiles[0].kind, 'chorizo');
    assert.equal(snap.projectiles[0].vx, 9.2);
    assert.equal(snap.fighters[0].projectileCooldown, 120);
  }

  {
    const sim = new CombatSimulation('supernariz', 'chameleon', { skipIntro: true });
    sim.fighters[0].x = 500;
    sim.fighters[1].x = 620;
    const { snap, hit } = firstHit(sim, 0, 1, input({ down: true, special: true }), E, 60);
    assert.equal(hit.damage, 38);
    assert.ok(snap.fighters[1].chilledFrames >= 89 && snap.fighters[1].chilledFrames <= 90);
  }

  for (const id of ['chameleon', 'supernariz']) {
    for (const slot of [0, 1]) {
      const other = id === 'chameleon' ? 'supernariz' : 'chameleon';
      const p1 = slot === 0 ? id : other;
      const p2 = slot === 1 ? id : other;
      const initialSuper = slot === 0 ? [100, 0] : [0, 100];
      const sim = new CombatSimulation(p1, p2, { skipIntro: true, initialSuper });
      sim.fighters[0].x = 500;
      sim.fighters[1].x = 620;
      let snap = sim.step(slot === 0 ? input({ ultimate: true }) : E, slot === 1 ? input({ ultimate: true }) : E);
      let captured = false;
      const defender = slot === 0 ? 1 : 0;
      const startHealth = snap.fighters[defender].health;
      for (let i = 0; i < 180; i += 1) {
        captured ||= snap.fighters[defender].capturedBy === slot;
        if (captured && snap.fighters[slot].ultimatePhase === 'recovery') break;
        snap = sim.step(E, E);
      }
      assert.equal(captured, true);
      assert.equal(startHealth - snap.fighters[defender].health, 190);
    }
  }
});


test('default combat registry exposes only released playable IDs and rejects unknown content', () => {
  assert.deepEqual([...DEFAULT_COMBAT_REGISTRY.playableIds], ['chameleon', 'supernariz']);
  assert.equal(DEFAULT_COMBAT_REGISTRY.getFighter('chameleon').displayName, 'Camaleoni');
  assert.equal(DEFAULT_COMBAT_REGISTRY.getKit('supernariz').standing, 'nose1');
  assert.equal(DEFAULT_COMBAT_REGISTRY.getProjectile('chorizo').cooldown, 120);
  assert.equal(DEFAULT_COMBAT_REGISTRY.getUltimate('camaleoniUltimate').kind, 'dashCapture');

  assert.throws(() => DEFAULT_COMBAT_REGISTRY.getFighter('missing-fighter'), /Unknown fighter missing-fighter/);
  assert.throws(() => DEFAULT_COMBAT_REGISTRY.getMove('chameleon', 'missing-move'), /Unknown move chameleon:/);
  assert.throws(() => DEFAULT_COMBAT_REGISTRY.getProjectile('missing-projectile'), /Unknown projectile missing-projectile/);
});

test('registry creation fails clearly when a kit references missing content', () => {
  const brokenKits = {
    ...FIGHTER_KITS,
    chameleon: { ...FIGHTER_KITS.chameleon, standing: 'does-not-exist' },
  };

  assert.throws(() => createCombatRegistry({
    fighters: FIGHTERS,
    kits: brokenKits,
    moves: MOVE_SETS,
    projectiles: PROJECTILES,
    ultimates: ULTIMATES,
    playableIds: DEFAULT_COMBAT_REGISTRY.playableIds,
  }), /Unknown move chameleon: does-not-exist/);
});

test('third injected fighter is not selectable but exercises registry stats moves projectile and CPU', () => {
  assert.equal(DEFAULT_COMBAT_REGISTRY.playableIds.includes(fixtureId), false);
  assert.equal(fixtureRegistry.playableIds.includes(fixtureId), false);
  assert.equal(fixtureRegistry.getFighter(fixtureId).maxHealth, 777);
  assert.equal(fixtureRegistry.getMove(fixtureId, 'fixtureJab').hitbox.damage, 33);

  const sim = new CombatSimulation(fixtureId, 'chameleon', { skipIntro: true, registry: fixtureRegistry });
  assert.equal(sim.getSnapshot().fighters[0].id, fixtureId);
  assert.equal(sim.getSnapshot().fighters[0].maxHealth, 777);
  assert.equal(sim.getSnapshot().fighters[0].projectileCooldownMax, 47);

  sim.fighters[0].x = 500;
  sim.fighters[1].x = 575;
  const { hit } = firstHit(sim, 0, 1, input({ attack: true }), E, 40);
  assert.equal(hit.blocked, false);
  assert.equal(hit.damage, 33);

  const cpu = new CpuController(0, { registry: fixtureRegistry });
  const cpuSim = new CombatSimulation(fixtureId, 'chameleon', { skipIntro: true, registry: fixtureRegistry });
  cpuSim.fighters[0].x = 500;
  cpuSim.fighters[1].x = 570;
  const cpuInput = cpu.nextInput(cpuSim.getSnapshot());
  assert.equal(cpuInput.attack, true);
});

test('third injected fighter launches configured projectile with configured speed damage and cooldown', () => {
  const sim = new CombatSimulation(fixtureId, 'chameleon', { skipIntro: true, registry: fixtureRegistry });
  sim.fighters[0].x = 500;
  sim.fighters[1].x = 660;

  let snap = sim.step(input({ special: true }), E);
  for (let i = 0; i < 8 && snap.projectiles.length === 0; i += 1) snap = sim.step(E, E);

  assert.equal(snap.projectiles.length, 1);
  assert.equal(snap.projectiles[0].kind, 'fixtureBolt');
  assert.equal(snap.projectiles[0].vx, 6.5);
  assert.equal(snap.fighters[0].projectileCooldown, 47);

  let projectileHit = null;
  for (let i = 0; i < 30 && projectileHit === null; i += 1) {
    snap = sim.step(E, E);
    projectileHit = snap.events.find((event) => event.type === 'hit' && event.attacker === 0 && event.defender === 1) ?? null;
  }
  assert.ok(projectileHit);
  assert.equal(projectileHit.blocked, false);
  assert.equal(projectileHit.damage, 31);
});

test('third injected fighter reuses dash-capture Ultimate primitive from registry data', () => {
  const sim = new CombatSimulation(fixtureId, 'chameleon', {
    skipIntro: true,
    initialSuper: [100, 0],
    registry: fixtureRegistry,
  });
  sim.fighters[0].x = 500;
  sim.fighters[1].x = 620;

  let snap = sim.step(input({ ultimate: true }), E);
  let captured = false;
  const startingHealth = snap.fighters[1].health;
  for (let i = 0; i < 80; i += 1) {
    captured ||= snap.fighters[1].capturedBy === 0;
    if (captured && snap.fighters[0].ultimatePhase === 'recovery') break;
    snap = sim.step(E, E);
  }

  assert.equal(captured, true);
  assert.equal(startingHealth - snap.fighters[1].health, 77);
  assert.equal(snap.fighters[0].ultimatePhase, 'recovery');
});

test('unknown fighter fails at simulation construction instead of falling through to another kit', () => {
  assert.throws(
    () => new CombatSimulation('not-registered', 'chameleon', { skipIntro: true }),
    /Unknown fighter not-registered/,
  );
});
