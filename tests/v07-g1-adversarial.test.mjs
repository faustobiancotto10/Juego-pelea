import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_CHARACTER_COMPOSITION,
  composeCharacterContent,
} from '../dist/game/data/characterContent.js';
import { EL_TORO_CHARACTER_CONTENT } from '../dist/game/data/characters/elToro.js';
import { DEFAULT_COMBAT_REGISTRY } from '../dist/game/data/combatRegistry.js';
import { CombatSimulation } from '../dist/game/simulation/CombatSimulation.js';
import { CpuController } from '../dist/game/simulation/CpuController.js';
import {
  buildUltimateConfrontationVolume,
  findUltimateClashIntersection,
} from '../dist/game/simulation/ultimateArbitration.js';
import { EMPTY_INPUT as E } from '../dist/game/types.js';

const input = (patch = {}) => ({ ...E, ...patch });
const ROSTER = ['chameleon', 'supernariz', 'juanchi', 'el-toro'];

function toward(fromX, toX) {
  return fromX < toX ? input({ right: true }) : input({ left: true });
}

function away(fromX, toX) {
  return fromX < toX ? input({ left: true }) : input({ right: true });
}

function runLenguaProbe(camIndex) {
  const ids = camIndex === 0 ? ['chameleon', 'supernariz'] : ['supernariz', 'chameleon'];
  const sim = new CombatSimulation(ids[0], ids[1], { skipIntro: true });
  const defenderIndex = camIndex === 0 ? 1 : 0;

  sim.fighters[camIndex].x = camIndex === 0 ? 430 : 930;
  sim.fighters[defenderIndex].x = camIndex === 0 ? 770 : 590;

  let snap = sim.getSnapshot();
  let attempts = 0;
  let reachedTick = null;
  let blocked = 0;

  for (let tick = 0; tick < 240; tick += 1) {
    const cam = snap.fighters[camIndex];
    const defender = snap.fighters[defenderIndex];
    const separation = Math.abs(defender.x - cam.x);
    if (separation <= 150 && reachedTick === null) reachedTick = tick;

    const canStart = attempts < 6
      && cam.moveId === null
      && cam.grounded
      && cam.stunFrames === 0
      && cam.blockstunFrames === 0
      && cam.ultimatePhase === 'idle';

    const camInput = canStart ? input({ special: true }) : E;
    if (canStart) attempts += 1;

    const mustBlock = cam.moveId === 'tongueStraight'
      && cam.moveFrame >= 10
      && cam.moveFrame <= 15;

    const defenderInput = mustBlock
      ? away(defender.x, cam.x)
      : toward(defender.x, cam.x);

    const pair = camIndex === 0
      ? [camInput, defenderInput]
      : [defenderInput, camInput];

    snap = sim.step(pair[0], pair[1]);
    blocked += snap.events.filter(
      event => event.type === 'hit'
        && event.attacker === camIndex
        && event.moveId === 'tongueStraight'
        && event.blocked,
    ).length;
  }

  return { attempts, blocked, reachedTick };
}

test('V07-G1 independently reproduces Lengua block+advance counterplay in both slots', () => {
  for (const camIndex of [0, 1]) {
    const row = runLenguaProbe(camIndex);
    assert.equal(row.attempts, 6, `slot ${camIndex} should exercise six legal Lengua attempts`);
    assert.ok(row.blocked > 0, `slot ${camIndex} did not actually block Lengua`);
    assert.notEqual(row.reachedTick, null, `slot ${camIndex} never reached <=150 separation`);
    assert.ok(row.reachedTick <= 240, `slot ${camIndex} exceeded approach budget`);
  }
});

function syntheticSnapshot() {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  const snap = structuredClone(sim.getSnapshot());
  snap.fighters[0].x = 500;
  snap.fighters[1].x = 650;
  snap.fighters[0].facing = 1;
  snap.fighters[1].facing = -1;
  return snap;
}

function atTick(base, tick, mutateFoe = null) {
  const snap = structuredClone(base);
  snap.frame = tick;
  snap.combatTick = tick;
  snap.events = [];
  if (mutateFoe) mutateFoe(snap.fighters[0]);
  return snap;
}

test('V07-G1 CPU cannot react to current foe position/super/air state before observation delay', () => {
  const delays = { easy: 18, normal: 12, hard: 8 };

  for (const difficulty of ['easy', 'normal', 'hard']) {
    const altered = new CpuController(1, { difficulty, seed: 0x51a7 });
    const neutral = new CpuController(1, { difficulty, seed: 0x51a7 });
    const base = syntheticSnapshot();

    for (let tick = 0; tick < delays[difficulty]; tick += 1) {
      const a = altered.nextInput(atTick(base, tick, foe => {
        foe.x = tick % 2 === 0 ? 180 : 1120;
        foe.y = 420;
        foe.grounded = false;
        foe.crouching = true;
        foe.superMeter = 100;
        foe.superReady = true;
      }));
      const b = neutral.nextInput(atTick(base, tick));
      assert.deepEqual(a, b, `${difficulty} leaked current foe state at tick ${tick}`);
    }
  }
});

test('V07-G1 difficulty policy is read-only over fighter definitions and snapshot resources', () => {
  const registryBefore = Object.fromEntries(
    ROSTER.map(id => [id, structuredClone(DEFAULT_COMBAT_REGISTRY.getFighter(id))]),
  );

  for (const fighterId of ROSTER) {
    const foeId = fighterId === 'chameleon' ? 'supernariz' : 'chameleon';
    for (const difficulty of ['easy', 'normal', 'hard']) {
      const sim = new CombatSimulation(foeId, fighterId, { skipIntro: true });
      const cpu = new CpuController(1, { difficulty, seed: 31337 });
      const snap = structuredClone(sim.getSnapshot());
      const fightersBefore = structuredClone(snap.fighters);

      for (let tick = 0; tick < 24; tick += 1) {
        const sample = structuredClone(snap);
        sample.frame = tick;
        sample.combatTick = tick;
        cpu.nextInput(sample);
      }

      assert.deepEqual(snap.fighters, fightersBefore, `${fighterId}/${difficulty} mutated supplied snapshot`);
    }
  }

  for (const id of ROSTER) {
    assert.deepEqual(
      DEFAULT_COMBAT_REGISTRY.getFighter(id),
      registryBefore[id],
      `${id} fighter definition mutated by difficulty policy`,
    );
  }
});

test('V07-G1 Topete whiff stops authored drive after frame 16 and remains committed through recovery', () => {
  const sim = new CombatSimulation('el-toro', 'chameleon', { skipIntro: true });
  sim.fighters[0].x = 500;
  sim.fighters[1].x = 1100;

  let snap = sim.step(input({ down: true, special: true }), E);
  assert.equal(snap.fighters[0].moveId, 'topete');

  let xAtDriveEnd = null;
  let hitCount = 0;
  let sawRecovery = false;

  for (let i = 0; i < 60; i += 1) {
    const p1 = i === 21 ? input({ attack: true }) : E;
    snap = sim.step(p1, E);

    hitCount += snap.events.filter(
      event => event.type === 'hit' && event.attacker === 0 && event.moveId === 'topete',
    ).length;

    const fighter = snap.fighters[0];
    if (fighter.moveId === 'topete' && fighter.moveFrame === 16) xAtDriveEnd = fighter.x;

    if (
      xAtDriveEnd !== null
      && fighter.moveId === 'topete'
      && fighter.moveFrame > 16
    ) {
      sawRecovery = true;
      assert.equal(fighter.x, xAtDriveEnd, 'whiffed Topete must not keep sliding during recovery');
    }

    if (fighter.moveId === null && xAtDriveEnd !== null) break;
  }

  assert.equal(hitCount, 0, 'far target should make Topete genuinely whiff');
  assert.notEqual(xAtDriveEnd, null, 'Topete never reached authored drive end');
  assert.equal(sawRecovery, true, 'Topete did not expose post-drive recovery');
  assert.equal(snap.fighters[0].moveId, null, 'Topete must eventually leave recovery cleanly');
});

function runEructoGeometry({ x = 720, y = 0, grounded = true, block = false } = {}) {
  const sim = new CombatSimulation('el-toro', 'chameleon', {
    skipIntro: true,
    initialSuper: [100, 0],
  });
  sim.fighters[0].x = 500;
  sim.fighters[1].x = x;
  sim.fighters[1].y = y;
  sim.fighters[1].grounded = grounded;
  sim.fighters[1].vy = 0;

  let snap = sim.step(input({ ultimate: true }), block ? input({ right: true }) : E);
  const hits = [];

  for (let i = 0; i < 180; i += 1) {
    snap = sim.step(E, block ? input({ right: true }) : E);
    hits.push(...snap.events.filter(
      event => event.type === 'hit' && event.source === 'ultimate' && event.attacker === 0,
    ));
    if (snap.fighters[0].ultimatePhase === 'idle' && i > 40) break;
  }
  return { snap, hits };
}

test('V07-G1 Super Eructo respects horizontal/vertical field bounds and cleans blocked use', () => {
  const outside = runEructoGeometry({ x: 918 });
  assert.equal(outside.hits.length, 0, 'hurtbox fully beyond 390 range must not be hit');

  const above = runEructoGeometry({ x: 720, y: 1000, grounded: false });
  assert.equal(above.hits.length, 0, 'fighter fully above blast band must not be hit');

  const blocked = runEructoGeometry({ x: 720, block: true });
  assert.equal(blocked.hits.length, 3, 'in-range block should receive all authored beats');
  assert.ok(blocked.hits.every(event => event.blocked), 'all blocked beats must stay blockable');
  assert.equal(blocked.snap.fighters[0].ultimatePhase, 'idle');
  assert.equal(blocked.snap.fighters[0].superMeter, 0);
  assert.equal(blocked.snap.fighters[0].ultimateTarget, null);
  assert.equal(blocked.snap.fighters[1].capturedBy, null);
});

test('V07-G1 Shawarmazo has one contact per projectile and rearms only after cooldown', () => {
  const sim = new CombatSimulation('el-toro', 'chameleon', { skipIntro: true });
  sim.fighters[0].x = 300;
  sim.fighters[1].x = 660;

  let snap = sim.step(input({ special: true }), E);
  let hits = 0;

  for (let i = 0; i < 140; i += 1) {
    snap = sim.step(E, E);
    hits += snap.events.filter(
      event => event.type === 'hit' && event.source === 'projectile' && event.attacker === 0,
    ).length;
    if (hits > 0 && snap.fighters[0].rangedAvailability === 'ready') break;
  }

  assert.equal(hits, 1, 'first Shawarmazo must produce exactly one legal contact');
  assert.equal(snap.fighters[0].rangedAvailability, 'ready', 'cooldown must eventually rearm');
  assert.equal(snap.fighters[0].projectileCooldown, 0);

  snap = sim.step(input({ special: true }), E);
  let spawnedAgain = false;
  for (let i = 0; i < 30; i += 1) {
    snap = sim.step(E, E);
    if (snap.projectiles.some(projectile => projectile.owner === 0 && projectile.kind === 'toroShawarma')) {
      spawnedAgain = true;
      break;
    }
  }
  assert.equal(spawnedAgain, true, 'rearmed Shawarmazo should be able to spawn a fresh projectile');
});

function ultimateDefinition(id) {
  const kit = DEFAULT_COMBAT_REGISTRY.getKit(id);
  const move = DEFAULT_COMBAT_REGISTRY.getMove(id, kit.ultimate);
  return DEFAULT_COMBAT_REGISTRY.getUltimate(move.ultimateKey);
}

function clashProposal({ owner, definition, currentX, plannedX, targetX, facing, effectiveTick }) {
  return {
    owner,
    target: owner === 0 ? 1 : 0,
    definition,
    effectiveTick,
    phaseFrame: 0,
    currentX,
    currentY: 0,
    plannedX,
    targetCurrentX: targetX,
    targetPlannedX: targetX,
    facing,
    confrontation: buildUltimateConfrontationVolume(
      definition,
      currentX,
      plannedX,
      0,
      facing,
      null,
    ),
    wouldCapture: false,
    proposedTargetX: null,
    capProbe: null,
  };
}

test('V07-G1 Ultimate Clash accepts effective-entry delta 3 and rejects delta 4', () => {
  const toro = ultimateDefinition('el-toro');
  const cam = ultimateDefinition('chameleon');

  const first = clashProposal({
    owner: 0,
    definition: toro,
    currentX: 500,
    plannedX: 500,
    targetX: 650,
    facing: 1,
    effectiveTick: 100,
  });

  const within = clashProposal({
    owner: 1,
    definition: cam,
    currentX: 650,
    plannedX: 632,
    targetX: 500,
    facing: -1,
    effectiveTick: 103,
  });

  assert.notEqual(
    findUltimateClashIntersection(first, within, 103),
    null,
    'entry delta 3 should remain Clash-eligible',
  );

  const tooLate = { ...within, effectiveTick: 104 };
  assert.equal(
    findUltimateClashIntersection(first, tooLate, 104),
    null,
    'entry delta 4 must not Clash',
  );
});

test('V07-G1 all 16 ordered matchups survive round reset and fresh rematch construction', () => {
  for (const p1 of ROSTER) {
    for (const p2 of ROSTER) {
      const sim = new CombatSimulation(p1, p2, { skipIntro: true });
      sim.fighters[1].health = 0;
      let snap = sim.step(E, E);
      assert.equal(snap.phase, 'round-over', `${p1}/${p2} did not enter round-over`);

      for (let i = 0; i < 120 && !(snap.phase === 'fight' && snap.round === 2); i += 1) {
        snap = sim.step(E, E);
      }

      assert.equal(snap.phase, 'fight', `${p1}/${p2} failed to reset into fight`);
      assert.equal(snap.round, 2);
      assert.equal(snap.fighters[0].id, p1);
      assert.equal(snap.fighters[1].id, p2);
      assert.equal(snap.fighters[0].health, DEFAULT_COMBAT_REGISTRY.getFighter(p1).maxHealth);
      assert.equal(snap.fighters[1].health, DEFAULT_COMBAT_REGISTRY.getFighter(p2).maxHealth);
      assert.equal(snap.projectiles.length, 0);

      const rematch = new CombatSimulation(p1, p2, { skipIntro: true }).getSnapshot();
      assert.equal(rematch.round, 1);
      assert.equal(rematch.phase, 'fight');
      assert.equal(rematch.fighters[0].roundWins, 0);
      assert.equal(rematch.fighters[1].roundWins, 0);
      assert.equal(rematch.fighters[0].superMeter, 0);
      assert.equal(rematch.fighters[1].superMeter, 0);
      assert.equal(rematch.projectiles.length, 0);
    }
  }
});

test('V07-G1 malformed duplicate fighter/projectile/Ultimate registrations fail explicitly', () => {
  assert.throws(
    () => composeCharacterContent(
      [EL_TORO_CHARACTER_CONTENT, structuredClone(EL_TORO_CHARACTER_CONTENT)],
      ['el-toro'],
    ),
    /duplicate fighter id el-toro/,
  );

  const duplicateProjectile = structuredClone(EL_TORO_CHARACTER_CONTENT);
  duplicateProjectile.fighter.id = 'el-toro-copy-projectile';
  assert.throws(
    () => composeCharacterContent(
      [EL_TORO_CHARACTER_CONTENT, duplicateProjectile],
      ['el-toro', 'el-toro-copy-projectile'],
    ),
    /duplicate projectile key toroShawarma/,
  );

  const duplicateUltimate = structuredClone(EL_TORO_CHARACTER_CONTENT);
  duplicateUltimate.fighter.id = 'el-toro-copy-ultimate';
  const renamedProjectile = duplicateUltimate.projectiles.toroShawarma;
  renamedProjectile.key = 'toroShawarmaCopy';
  duplicateUltimate.projectiles = { toroShawarmaCopy: renamedProjectile };
  duplicateUltimate.moves.shawarmazoThrow.projectileKey = 'toroShawarmaCopy';

  assert.throws(
    () => composeCharacterContent(
      [EL_TORO_CHARACTER_CONTENT, duplicateUltimate],
      ['el-toro', 'el-toro-copy-ultimate'],
    ),
    /duplicate Ultimate key toroSuperEructo/,
  );
});
