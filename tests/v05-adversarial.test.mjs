import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CombatSimulation } from '../dist/game/simulation/CombatSimulation.js';
import { CpuController } from '../dist/game/simulation/CpuController.js';
import { getMoveDefinition } from '../dist/game/simulation/moves.js';
import { DEFAULT_COMBAT_REGISTRY } from '../dist/game/data/combatRegistry.js';
import { EMPTY_INPUT as E } from '../dist/game/types.js';
import { fixtureId, fixtureRegistry } from './fixtures/v05-registry.mjs';

const input = (patch = {}) => ({ ...E, ...patch });
const dir = (patch = {}) => ({ left: false, right: false, up: false, down: false, ...patch });
const cmd = (action, direction = dir()) => ({ action, direction });

function away(snapshot, index, extra = {}) {
  const self = snapshot.fighters[index];
  const foe = snapshot.fighters[index === 0 ? 1 : 0];
  return input({
    left: self.x < foe.x,
    right: self.x > foe.x,
    ...extra,
  });
}

function toward(snapshot, index, extra = {}) {
  const self = snapshot.fighters[index];
  const foe = snapshot.fighters[index === 0 ? 1 : 0];
  return input({
    right: self.x < foe.x,
    left: self.x > foe.x,
    ...extra,
  });
}

function forceMove(sim, index, moveId, frame) {
  const fighter = sim.fighters[index];
  fighter.currentMove = sim.registry.getMove(fighter.id, moveId);
  fighter.moveId = moveId;
  fighter.moveFrame = frame;
  fighter.moveHasHit = false;
  fighter.moveEffectTriggered = false;
  fighter.moveContact = 'none';
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

function firstHit(snapshot, attacker, defender) {
  return snapshot.events.find((e) => e.type === 'hit' && e.attacker === attacker && e.defender === defender);
}

test('G1 AC01 matrix: committed recovery cannot guard a strike in either slot or matchup', () => {
  for (const defenderId of ['chameleon', 'supernariz']) {
    const attackerId = defenderId === 'chameleon' ? 'supernariz' : 'chameleon';
    const committedMove = defenderId === 'chameleon' ? 'tongueStraight' : 'chorizoThrow';
    const attackMove = attackerId === 'chameleon' ? 'claw1' : 'nose1';

    for (const defender of [0, 1]) {
      const attacker = defender === 0 ? 1 : 0;
      const sim = new CombatSimulation(
        defender === 0 ? defenderId : attackerId,
        defender === 1 ? defenderId : attackerId,
        { skipIntro: true },
      );
      sim.fighters[0].x = 500;
      sim.fighters[1].x = 590;

      forceMove(sim, defender, committedMove, getMoveDefinition(defenderId, committedMove).totalFrames - 4);
      const incoming = getMoveDefinition(attackerId, attackMove);
      forceMove(sim, attacker, attackMove, incoming.hitbox.start - 1);

      const pre = sim.getSnapshot();
      const defenderInput = away(pre, defender);
      const snap = sim.step(defender === 0 ? defenderInput : E, defender === 1 ? defenderInput : E);
      const hit = firstHit(snap, attacker, defender);
      assert.ok(hit, `${defenderId} defender slot=${defender}`);
      assert.equal(hit.blocked, false, 'holding away during offensive commitment must not create guard');
      assert.equal(snap.fighters[defender].moveId, null, 'clean incoming hit must interrupt committed recovery');
    }
  }
});

test('G1 AC01 matrix: committed move cannot guard a projectile in either slot', () => {
  for (const defender of [0, 1]) {
    const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
    sim.fighters[0].x = 500;
    sim.fighters[1].x = 700;
    forceMove(sim, defender, defender === 0 ? 'claw1' : 'nose1', 10);

    sim.projectiles.push({
      id: 900 + defender,
      owner: defender === 0 ? 1 : 0,
      kind: 'chorizo',
      x: defender === 0 ? 520 : 680,
      y: 68,
      vx: defender === 0 ? -9.2 : 9.2,
      active: true,
      ttl: 10,
    });

    const pre = sim.getSnapshot();
    const defenderInput = away(pre, defender);
    const snap = sim.step(defender === 0 ? defenderInput : E, defender === 1 ? defenderInput : E);
    const hit = firstHit(snap, defender === 0 ? 1 : 0, defender);
    assert.ok(hit);
    assert.equal(hit.blocked, false);
    assert.equal(hit.damage, 58);
  }
});

test('G1 AC03: a press on every individual hitstop frame survives exactly once', () => {
  for (let pressAt = 0; pressAt < 4; pressAt += 1) {
    const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
    sim.hitstopFrames = 4;
    let snap = sim.getSnapshot();

    for (let frozen = 0; frozen < 4; frozen += 1) {
      snap = sim.step(input({ commands: frozen === pressAt ? [cmd('attack')] : [] }), E);
      assert.equal(snap.fighters[0].moveId, null, `pressAt=${pressAt} frozen=${frozen}`);
    }

    snap = sim.step(input({ commands: [] }), E);
    assert.equal(snap.fighters[0].moveId, 'claw1', `pressAt=${pressAt}`);

    let starts = 1;
    let previousMove = snap.fighters[0].moveId;
    for (let n = 0; n < 30; n += 1) {
      snap = sim.step(input({ commands: [] }), E);
      if (snap.fighters[0].moveId === 'claw1' && previousMove !== 'claw1') starts += 1;
      previousMove = snap.fighters[0].moveId;
    }
    assert.equal(starts, 1, 'one buffered edge must not ghost/repeat');
  }
});

function runRoute(id, slot, distance, defenderMode = 'mash') {
  const other = id === 'chameleon' ? 'supernariz' : 'chameleon';
  const sim = new CombatSimulation(slot === 0 ? id : other, slot === 1 ? id : other, { skipIntro: true });
  sim.fighters[0].x = 500;
  sim.fighters[1].x = 500 + distance;
  const attacker = slot;
  const defender = slot === 0 ? 1 : 0;
  const expected = id === 'chameleon' ? ['claw1', 'claw2'] : ['nose1', 'nose2', 'nose3'];
  const hits = [];
  let snap = sim.step(attacker === 0 ? input({ attack: true }) : E, attacker === 1 ? input({ attack: true }) : E);
  let lastMove = snap.fighters[attacker].moveId;
  let queued = false;

  for (let n = 0; n < 200 && hits.length < expected.length; n += 1) {
    for (const event of snap.events) {
      if (event.type === 'hit' && event.attacker === attacker && event.defender === defender) hits.push(event);
    }
    const f = snap.fighters[attacker];
    if (f.moveId !== lastMove) {
      lastMove = f.moveId;
      queued = false;
    }
    const cancelReady = f.moveContact === 'hit'
      && !queued
      && ((f.moveId === 'claw1' && f.moveFrame >= 9)
        || (f.moveId === 'nose1' && f.moveFrame >= 8)
        || (f.moveId === 'nose2' && f.moveFrame >= 8));
    if (cancelReady) queued = true;

    const attackInput = cancelReady ? input({ commands: [cmd('attack')] }) : input({ commands: [] });
    let defenseInput = E;
    if (hits.length > 0 && defenderMode === 'mash') {
      const base = away(snap, defender, { jump: n % 2 === 0, attack: n % 2 === 0, down: n % 3 === 0 });
      defenseInput = base;
    }
    snap = sim.step(attacker === 0 ? attackInput : defenseInput, attacker === 1 ? attackInput : defenseInput);
  }

  return { hits, snap };
}

test('G1 AC04: published short routes stay clean against guard/jump mash at 62/85 in both slots', () => {
  for (const id of ['chameleon', 'supernariz']) {
    const expectedDamage = id === 'chameleon' ? [46, 60] : [42, 49, 74];
    for (const distance of [62, 85]) {
      for (const slot of [0, 1]) {
        const { hits } = runRoute(id, slot, distance);
        assert.deepEqual(hits.map((h) => h.damage), expectedDamage, `${id} distance=${distance} slot=${slot}`);
        assert.ok(hits.every((h) => h.blocked === false));
      }
    }
  }
});

test('G1 AC05: standing guard loses to low in both slots while crouch guard blocks it', () => {
  for (const id of ['chameleon', 'supernariz']) {
    for (const attacker of [0, 1]) {
      const other = id === 'chameleon' ? 'supernariz' : 'chameleon';
      for (const crouch of [false, true]) {
        const sim = new CombatSimulation(attacker === 0 ? id : other, attacker === 1 ? id : other, { skipIntro: true });
        sim.fighters[0].x = 500;
        sim.fighters[1].x = 562;
        const defender = attacker === 0 ? 1 : 0;
        const start = input({ down: true, attack: true });
        let snap = sim.step(attacker === 0 ? start : E, attacker === 1 ? start : E);
        let hit = null;
        for (let n = 0; n < 20 && !hit; n += 1) {
          const defense = away(snap, defender, { down: crouch });
          snap = sim.step(attacker === 0 ? E : defense, attacker === 1 ? E : defense);
          hit = firstHit(snap, attacker, defender) ?? null;
        }
        assert.ok(hit);
        assert.equal(hit.blocked, crouch, `${id} attacker=${attacker} crouch=${crouch}`);
      }
    }
  }
});

function runCloseSpecialWhiffPunish(attackerId) {
  const defenderId = attackerId === 'chameleon' ? 'supernariz' : 'chameleon';
  const sim = new CombatSimulation(attackerId, defenderId, { skipIntro: true });
  const specialId = attackerId === 'chameleon' ? 'coletazo' : 'tramontana';
  const special = getMoveDefinition(attackerId, specialId);
  sim.fighters[0].x = 500;
  sim.fighters[1].x = attackerId === 'chameleon' ? 715 : 736;

  let snap = sim.step(input({ left: true, down: true, special: true }), toward(sim.getSnapshot(), 1));
  let defenderAttackStarted = false;
  let punish = null;
  let specialHit = false;

  for (let n = 0; n < 60 && !punish; n += 1) {
    specialHit ||= Boolean(firstHit(snap, 0, 1));
    const attacker = snap.fighters[0];
    const defender = snap.fighters[1];
    const defenderNormal = getMoveDefinition(defenderId, defenderId === 'chameleon' ? 'claw1' : 'nose1');
    const normalReach = defenderNormal.hitbox.offsetX + defenderNormal.hitbox.width;
    const distance = Math.abs(defender.x - attacker.x);

    let dInput;
    if (!defenderAttackStarted && attacker.moveId === specialId && attacker.moveFrame > special.hitbox.end) {
      if (distance <= normalReach - 2) {
        dInput = input({ attack: true });
        defenderAttackStarted = true;
      } else {
        dInput = toward(snap, 1, { dashLeft: true });
      }
    } else {
      dInput = defenderAttackStarted ? E : toward(snap, 1);
    }

    const aInput = away(snap, 0, { left: true });
    snap = sim.step(aInput, dInput);
    punish = firstHit(snap, 1, 0) ?? null;
  }

  return { specialHit, punish, snap };
}

test('G1 AC06: a reachable close-Special whiff can be punished despite attacker holding away', () => {
  for (const id of ['chameleon', 'supernariz']) {
    const result = runCloseSpecialWhiffPunish(id);
    assert.equal(result.specialHit, false, `${id}: fixture requires a true whiff`);
    assert.ok(result.punish, `${id}: whiff recovery must admit a reachable punish`);
    assert.equal(result.punish.blocked, false, `${id}: holding away during recovery cannot erase the punish`);
  }
});

test('G1 AC07: air-normal carry/facing mirror across slots and survives opposite steering', () => {
  for (const id of ['chameleon', 'supernariz']) {
    const other = id === 'chameleon' ? 'supernariz' : 'chameleon';
    for (const slot of [0, 1]) {
      const sim = new CombatSimulation(slot === 0 ? id : other, slot === 1 ? id : other, { skipIntro: true });
      sim.fighters[0].x = 400;
      sim.fighters[1].x = 900;
      const towardRight = slot === 0;
      const jumpStart = input({ right: towardRight, left: !towardRight, jump: true });
      let snap = sim.step(slot === 0 ? jumpStart : E, slot === 1 ? jumpStart : E);
      const facing = snap.fighters[slot].facing;
      const before = snap.fighters[slot].x;
      const attack = input({ right: towardRight, left: !towardRight, attack: true });
      snap = sim.step(slot === 0 ? attack : E, slot === 1 ? attack : E);
      assert.ok(Math.abs(snap.fighters[slot].x - before) > 0, `${id} slot=${slot}`);
      assert.equal(snap.fighters[slot].facing, facing);

      for (let n = 0; n < 4; n += 1) {
        const opposite = input({ right: !towardRight, left: towardRight });
        snap = sim.step(slot === 0 ? opposite : E, slot === 1 ? opposite : E);
        assert.equal(snap.fighters[slot].facing, facing);
      }
    }
  }
});

function cpuScenario(tick, cue) {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  const snap = structuredClone(sim.getSnapshot());
  snap.phase = 'fight';
  snap.combatTick = tick;
  snap.frame = 1000 + tick;
  snap.fighters[0].x = 500;
  snap.fighters[1].x = 700;
  snap.fighters[0].facing = 1;
  snap.fighters[1].facing = -1;
  if (cue === 'low') {
    snap.fighters[0].moveId = 'clawLow';
    snap.fighters[0].moveFrame = Math.max(0, tick - 20);
  }
  return snap;
}

test('G1 AC08: delayed CPU twin cannot reveal a low cue before 12 combat ticks', () => {
  const a = new CpuController(1, { seed: 131 });
  const b = new CpuController(1, { seed: 131 });
  for (let tick = 0; tick <= 31; tick += 1) {
    const plain = a.nextInput(cpuScenario(tick, 'none'));
    const low = b.nextInput(cpuScenario(tick, tick >= 20 ? 'low' : 'none'));
    assert.deepEqual(low, plain, `low cue leaked at combatTick=${tick}`);
  }
});

function runCpuDuel(p1, p2, seed0, seed1, maxFrames = 14000) {
  const sim = new CombatSimulation(p1, p2, { skipIntro: true });
  const cpu0 = new CpuController(0, { seed: seed0 });
  const cpu1 = new CpuController(1, { seed: seed1 });
  let snap = sim.getSnapshot();
  const categories = { normal: 0, special: 0, projectile: 0, ultimate: 0 };
  let damage = 0;
  for (let frame = 0; frame < maxFrames && snap.phase !== 'match-over'; frame += 1) {
    snap = sim.step(cpu0.nextInput(snap), cpu1.nextInput(snap));
    for (const event of snap.events) {
      if (event.type === 'hit') {
        categories[event.source] += 1;
        damage += event.damage;
      }
    }
  }
  return {
    phase: snap.phase,
    winner: snap.winner,
    winnerId: snap.winner === null ? null : snap.fighters[snap.winner].id,
    combatTick: snap.combatTick,
    damage,
    categories,
  };
}

test('G1 CPU slot-bias audit: mirrored matchup + swapped seeds preserves character result', () => {
  const pairs = [[3, 7], [11, 19], [23, 29], [31, 37], [41, 43], [47, 53]];
  const rows = [];
  for (const [a, b] of pairs) {
    const left = runCpuDuel('chameleon', 'supernariz', a, b);
    const right = runCpuDuel('supernariz', 'chameleon', b, a);
    rows.push({ seeds: [a, b], left, right });
    assert.equal(left.phase, 'match-over');
    assert.equal(right.phase, 'match-over');
    assert.equal(left.winnerId, right.winnerId, `character result changed only by slot mirror for seeds ${a}/${b}`);
  }
  console.log('G1 mirrored mixed-matchup corpus:', JSON.stringify(rows));
});

test('G1 same-kit symmetry: swapping CPU seeds mirrors winner slot', () => {
  const pairs = [[5, 13], [17, 31], [41, 61], [73, 89]];
  const rows = [];
  for (const id of ['chameleon', 'supernariz']) {
    for (const [a, b] of pairs) {
      const first = runCpuDuel(id, id, a, b);
      const second = runCpuDuel(id, id, b, a);
      rows.push({ id, seeds: [a, b], first, second });
      assert.equal(first.phase, 'match-over');
      assert.equal(second.phase, 'match-over');
      assert.notEqual(first.winner, null);
      assert.equal(second.winner, first.winner === 0 ? 1 : 0, `${id} seeds ${a}/${b}: winner should follow seed/controller mirror, not fixed slot`);
    }
  }
  console.log('G1 same-kit slot symmetry corpus:', JSON.stringify(rows));
});

function scriptedPolicy(name, snap, index, tick) {
  if (name === 'standGuard') return away(snap, index);
  if (name === 'crouchGuard') return away(snap, index, { down: true });
  if (name === 'retreatSpecial') return away(snap, index, { special: tick % 54 === 0 });
  if (name === 'walkForwardNormals') return toward(snap, index, { attack: tick % 14 === 0 });
  if (name === 'mashPressure') return toward(snap, index, { attack: tick % 2 === 0 });
  if (name === 'jumpOnRead') {
    const foe = snap.fighters[index === 0 ? 1 : 0];
    const read = foe.moveId !== null || foe.ultimatePhase === 'startup' || snap.projectiles.some((p) => p.owner !== index);
    return read ? toward(snap, index, { jump: true }) : toward(snap, index);
  }
  return E;
}

function runPolicy(policy, playerId, cpuId, slot, seed, maxFrames = 14000) {
  const sim = new CombatSimulation(slot === 0 ? playerId : cpuId, slot === 1 ? playerId : cpuId, { skipIntro: true });
  const cpuIndex = slot === 0 ? 1 : 0;
  const cpu = new CpuController(cpuIndex, { seed });
  let snap = sim.getSnapshot();
  let damageTaken = 0;
  let damageDealt = 0;
  let hits = 0;
  let blocks = 0;
  let guardBreaks = 0;
  for (let frame = 0; frame < maxFrames && snap.phase !== 'match-over'; frame += 1) {
    const playerInput = scriptedPolicy(policy, snap, slot, frame);
    const cpuInput = cpu.nextInput(snap);
    snap = sim.step(slot === 0 ? playerInput : cpuInput, slot === 1 ? playerInput : cpuInput);
    for (const event of snap.events) {
      if (event.type === 'hit') {
        if (event.attacker === slot) damageDealt += event.damage;
        if (event.defender === slot) damageTaken += event.damage;
        hits += Number(event.attacker === slot && !event.blocked);
        blocks += Number(event.defender === slot && event.blocked);
      } else if (event.type === 'guard-break' && event.defender === slot) {
        guardBreaks += 1;
      }
    }
  }
  return { phase: snap.phase, winner: snap.winner, damageTaken, damageDealt, hits, blocks, guardBreaks, combatTick: snap.combatTick };
}

test('G1 adversarial strategy matrix completes and passive policies remain interactable', () => {
  const policies = ['standGuard', 'crouchGuard', 'retreatSpecial', 'walkForwardNormals', 'jumpOnRead', 'mashPressure'];
  const rows = [];
  for (const playerId of ['chameleon', 'supernariz']) {
    const cpuId = playerId === 'chameleon' ? 'supernariz' : 'chameleon';
    for (const slot of [0, 1]) {
      for (const policy of policies) {
        const result = runPolicy(policy, playerId, cpuId, slot, 101 + slot * 17 + policies.indexOf(policy));
        rows.push({ playerId, slot, policy, ...result });
        assert.equal(result.phase, 'match-over', `${playerId} slot=${slot} policy=${policy}`);
        assert.ok(result.damageTaken + result.damageDealt > 0, 'policy match must contain real interaction');
      }
    }
  }

  for (const policy of ['standGuard', 'crouchGuard', 'retreatSpecial']) {
    const subset = rows.filter((row) => row.policy === policy);
    assert.ok(subset.some((row) => row.damageTaken > 0), `${policy} must not be universally damage-proof`);
  }
  console.log('G1 strategy matrix:', JSON.stringify(rows));
});

test('G1 AC11: third fixture exercises simulation but remains outside released registry/UI', async () => {
  assert.equal(DEFAULT_COMBAT_REGISTRY.playableIds.includes(fixtureId), false);
  assert.equal(fixtureRegistry.playableIds.includes(fixtureId), false);

  const sim = new CombatSimulation(fixtureId, 'chameleon', { skipIntro: true, registry: fixtureRegistry });
  sim.fighters[0].x = 500;
  sim.fighters[1].x = 575;
  let snap = sim.step(input({ attack: true }), E);
  let hit = null;
  for (let n = 0; n < 30 && !hit; n += 1) {
    hit = firstHit(snap, 0, 1) ?? null;
    snap = sim.step(E, E);
  }
  assert.ok(hit);
  assert.equal(hit.damage, 33);

  const app = await readFile(new URL('../src/game/ui/AppController.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(app, /fixture-sparring/);
});
