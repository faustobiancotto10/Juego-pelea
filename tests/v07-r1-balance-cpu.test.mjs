import test from 'node:test';
import assert from 'node:assert/strict';
import { CombatSimulation } from '../dist/game/simulation/CombatSimulation.js';
import { CpuController } from '../dist/game/simulation/CpuController.js';
import { DEFAULT_COMBAT_REGISTRY } from '../dist/game/data/combatRegistry.js';
import { EMPTY_INPUT as E } from '../dist/game/types.js';

const input = (patch = {}) => ({ ...E, ...patch });

function toward(fromX, toX) {
  return fromX < toX ? input({ right: true }) : input({ left: true });
}

function away(fromX, toX) {
  return fromX < toX ? input({ left: true }) : input({ right: true });
}

function runLenguaApproach({ camIndex, camX, defenderX, maxTicks = 240 }) {
  const ids = camIndex === 0 ? ['chameleon', 'supernariz'] : ['supernariz', 'chameleon'];
  const sim = new CombatSimulation(ids[0], ids[1], { skipIntro: true });
  sim.fighters[camIndex].x = camX;
  sim.fighters[camIndex === 0 ? 1 : 0].x = defenderX;

  let snap = sim.getSnapshot();
  let attempts = 0;
  let reachedTick = null;
  let blocked = 0;
  let clean = 0;

  for (let tick = 0; tick < maxTicks; tick += 1) {
    const defenderIndex = camIndex === 0 ? 1 : 0;
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

    for (const event of snap.events) {
      if (
        event.type === 'hit'
        && event.attacker === camIndex
        && event.moveId === 'tongueStraight'
      ) {
        if (event.blocked) blocked += 1;
        else clean += 1;
      }
    }
  }

  const defenderIndex = camIndex === 0 ? 1 : 0;
  return {
    attempts,
    blocked,
    clean,
    reachedTick,
    finalSeparation: Number(Math.abs(
      snap.fighters[defenderIndex].x - snap.fighters[camIndex].x,
    ).toFixed(3)),
  };
}

test('V07-R1 Lengua block+advance reaches <=150 within 240 ticks across slots, ranges and wall-side starts', () => {
  const scenarios = [
    { camIndex: 0, camX: 500, defenderX: 740 },
    { camIndex: 0, camX: 500, defenderX: 800 },
    { camIndex: 0, camX: 500, defenderX: 860 },
    { camIndex: 1, camX: 860, defenderX: 500 },
    { camIndex: 0, camX: 140, defenderX: 500 },
    { camIndex: 1, camX: 1140, defenderX: 780 },
  ];

  const rows = scenarios.map(runLenguaApproach);
  for (const [index, row] of rows.entries()) {
    assert.notEqual(row.reachedTick, null, `scenario ${index} never reached close range: ${JSON.stringify(row)}`);
    assert.ok(row.reachedTick <= 240, `scenario ${index} exceeded approach budget`);
    assert.ok(row.attempts > 0);
  }
  console.log('V07-R1 Lengua approach corpus:', JSON.stringify(rows));
});

test('V07-R1 Lengua keeps clean-hit reward materially above block while preserving no cooldown resource', () => {
  const tongue = DEFAULT_COMBAT_REGISTRY.getMove('chameleon', 'tongueStraight');
  assert.equal(tongue.hitbox.damage, 72);
  assert.equal(tongue.hitbox.chipDamage, 3);
  assert.ok(tongue.hitbox.damage >= tongue.hitbox.chipDamage * 12);
  assert.equal(tongue.totalFrames, 54);
  assert.equal(tongue.hitbox.end, 14);
  assert.ok(tongue.totalFrames - tongue.hitbox.end >= 38, 'whiff/block must leave a real commitment window');
  assert.equal(tongue.projectileKey, undefined);
});

function deterministicCpuTrace(fighterId, difficulty, seed, ticks = 180) {
  const opponent = fighterId === 'chameleon' ? 'supernariz' : 'chameleon';
  const sim = new CombatSimulation(opponent, fighterId, { skipIntro: true });
  const cpu = new CpuController(1, { difficulty, seed });
  let snap = sim.getSnapshot();
  const trace = [];

  for (let tick = 0; tick < ticks; tick += 1) {
    const out = cpu.nextInput(snap);
    trace.push(JSON.stringify(out));
    snap = sim.step(E, out);
  }
  return trace;
}

test('V07-R1 Easy/Normal/Hard are deterministic and default remains byte-equivalent to Normal policy', () => {
  for (const fighterId of ['chameleon', 'supernariz', 'juanchi']) {
    for (const difficulty of ['easy', 'normal', 'hard']) {
      const a = deterministicCpuTrace(fighterId, difficulty, 313);
      const b = deterministicCpuTrace(fighterId, difficulty, 313);
      assert.deepEqual(b, a, `${fighterId}/${difficulty}`);
    }

    const explicit = deterministicCpuTrace(fighterId, 'normal', 997);
    const opponent = fighterId === 'chameleon' ? 'supernariz' : 'chameleon';
    const sim = new CombatSimulation(opponent, fighterId, { skipIntro: true });
    const defaultCpu = new CpuController(1, { seed: 997 });
    let snap = sim.getSnapshot();
    const implicit = [];
    for (let tick = 0; tick < 180; tick += 1) {
      const out = defaultCpu.nextInput(snap);
      implicit.push(JSON.stringify(out));
      snap = sim.step(E, out);
    }
    assert.deepEqual(implicit, explicit, `${fighterId} default must be Normal`);
  }
});

function syntheticSnapshotBase() {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  const base = structuredClone(sim.getSnapshot());
  base.fighters[0].x = 500;
  base.fighters[1].x = 600;
  base.fighters[0].facing = 1;
  base.fighters[1].facing = -1;
  return base;
}

function cueSnapshot(base, tick, moveId = null, moveFrame = 0) {
  const snap = structuredClone(base);
  snap.frame = tick;
  snap.combatTick = tick;
  snap.events = [];
  snap.fighters[0].moveId = moveId;
  snap.fighters[0].moveFrame = moveFrame;
  snap.fighters[0].moveContact = 'none';
  return snap;
}

test('V07-R1 current hidden cue cannot influence output before each difficulty observation delay', () => {
  const delays = { easy: 18, normal: 12, hard: 8 };
  for (const difficulty of ['easy', 'normal', 'hard']) {
    const withCue = new CpuController(1, { difficulty, seed: 113 });
    const neutral = new CpuController(1, { difficulty, seed: 113 });
    const base = syntheticSnapshotBase();

    for (let tick = 0; tick < delays[difficulty]; tick += 1) {
      const moveId = tick <= 9 ? 'clawLow' : null;
      const a = withCue.nextInput(cueSnapshot(base, tick, moveId, tick));
      const b = neutral.nextInput(cueSnapshot(base, tick, null, 0));
      assert.deepEqual(a, b, `${difficulty} leaked current cue at tick ${tick}`);
    }
  }
});

function recognizedLowCue(difficulty, seed) {
  const cpu = new CpuController(1, { difficulty, seed });
  const base = syntheticSnapshotBase();
  for (let tick = 0; tick < 36; tick += 1) {
    const moveId = tick <= 9 ? 'clawLow' : null;
    const out = cpu.nextInput(cueSnapshot(base, tick, moveId, tick));
    if (out.right && out.down && !out.attack && !out.special) return true;
  }
  return false;
}

test('V07-R1 Hard recognizes/responds to more delayed legal cues than Easy across seeded corpus', () => {
  let easy = 0;
  let hard = 0;
  for (let seed = 1; seed <= 64; seed += 1) {
    easy += Number(recognizedLowCue('easy', seed));
    hard += Number(recognizedLowCue('hard', seed));
  }
  assert.ok(hard > easy, `expected Hard cue responses > Easy, got hard=${hard} easy=${easy}`);
  console.log('V07-R1 delayed cue responses:', JSON.stringify({ easy, hard }));
});

function confirmationCount(difficulty) {
  let count = 0;
  const registry = DEFAULT_COMBAT_REGISTRY;
  const kit = registry.getKit('supernariz');
  const move = registry.getMove('supernariz', kit.standing);
  assert.ok(move.cancelStart !== undefined);

  for (let seed = 1; seed <= 64; seed += 1) {
    const cpu = new CpuController(1, { difficulty, seed });
    const base = syntheticSnapshotBase();
    base.fighters[1].moveId = move.id;
    base.fighters[1].moveFrame = move.cancelStart;
    base.fighters[1].moveContact = 'hit';
    const out = cpu.nextInput(base);
    count += Number(out.attack);
  }
  return count;
}

test('V07-R1 Hard converts more legal confirmed routes than Easy without changing fighter stats', () => {
  const before = structuredClone(DEFAULT_COMBAT_REGISTRY.getFighter('supernariz'));
  const easy = confirmationCount('easy');
  const hard = confirmationCount('hard');
  assert.ok(hard > easy, `expected Hard confirmations > Easy, got hard=${hard} easy=${easy}`);
  assert.deepEqual(DEFAULT_COMBAT_REGISTRY.getFighter('supernariz'), before);
  console.log('V07-R1 confirm corpus:', JSON.stringify({ easy, hard }));
});

function repeatedTongueJumpCount(difficulty) {
  let jumps = 0;
  for (let seed = 1; seed <= 48; seed += 1) {
    const cpu = new CpuController(1, { difficulty, seed });
    const base = syntheticSnapshotBase();
    base.fighters[0].x = 300;
    base.fighters[1].x = 600;

    for (let tick = 0; tick < 52; tick += 1) {
      let moveId = null;
      let moveFrame = 0;
      if (tick <= 2) {
        moveId = 'tongueStraight';
        moveFrame = tick;
      } else if (tick >= 20 && tick <= 22) {
        moveId = 'tongueStraight';
        moveFrame = tick - 20;
      }
      const out = cpu.nextInput(cueSnapshot(base, tick, moveId, moveFrame));
      if (tick >= 28 && out.jump) {
        jumps += 1;
        break;
      }
    }
  }
  return jumps;
}

test('V07-R1 Hard may adapt to repeated delayed long-range moves without pre-reading repetition', () => {
  const easy = repeatedTongueJumpCount('easy');
  const hard = repeatedTongueJumpCount('hard');
  assert.ok(hard > easy, `expected delayed-history adaptation on Hard, got hard=${hard} easy=${easy}`);
  console.log('V07-R1 repetition adaptation:', JSON.stringify({ easy, hard }));
});
