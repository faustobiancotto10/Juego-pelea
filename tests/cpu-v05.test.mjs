import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CombatSimulation } from '../dist/game/simulation/CombatSimulation.js';
import { CpuController } from '../dist/game/simulation/CpuController.js';
import { FIGHTER_KITS } from '../dist/game/data/fighterKits.js';
import { EMPTY_INPUT as E } from '../dist/game/types.js';

function baseScenario(cpuId = 'supernariz') {
  const foeId = cpuId === 'supernariz' ? 'chameleon' : 'supernariz';
  const sim = new CombatSimulation(foeId, cpuId, { skipIntro: true });
  const snap = structuredClone(sim.getSnapshot());
  snap.phase = 'fight';
  snap.fighters[0].x = 500;
  snap.fighters[1].x = 700;
  snap.fighters[0].facing = 1;
  snap.fighters[1].facing = -1;
  return snap;
}

function scenario(tick, cue = 'none', cpuId = 'supernariz') {
  const snap = baseScenario(cpuId);
  snap.combatTick = tick;
  snap.frame = tick;
  snap.hitstopFrames = 0;
  const foe = snap.fighters[0];
  const self = snap.fighters[1];
  self.moveId = null;
  self.moveFrame = 0;
  self.stunFrames = 0;
  self.blockstunFrames = 0;
  self.guardBreakFrames = 0;
  self.grounded = true;

  if (cue === 'ultimate') {
    foe.ultimatePhase = 'startup';
    foe.ultimatePhaseFrame = Math.max(0, tick - 20);
    foe.moveId = 'ultimateCamaleoni';
  } else if (cue === 'tongue') {
    foe.moveId = 'tongueStraight';
    foe.moveFrame = Math.max(0, tick - 20);
  } else if (cue === 'air') {
    foe.grounded = false;
    foe.y = 70;
    foe.moveId = 'airClaw';
    foe.moveFrame = Math.max(0, tick - 20);
  } else if (cue === 'low') {
    foe.moveId = 'clawLow';
    foe.moveFrame = Math.max(0, tick - 20);
  } else if (cue === 'projectile') {
    snap.projectiles = [{
      id: 77,
      owner: 0,
      kind: 'chorizo',
      x: 560,
      y: 68,
      vx: 9.2,
      active: true,
    }];
  }
  return snap;
}

function trace(seed, cue = 'none', ticks = 48) {
  const cpu = new CpuController(1, { seed });
  const out = [];
  for (let tick = 0; tick < ticks; tick += 1) {
    out.push(cpu.nextInput(scenario(tick, tick >= 20 ? cue : 'none')));
  }
  return out;
}

function threatDefense(frame) {
  // Scenario CPU is slot 1 at x=700 with foe at x=500: away is RIGHT.
  // LEFT is ordinary approach and must not count as cue recognition.
  return Boolean(frame.right || frame.down || frame.jump || frame.dashRight || frame.pushGuard);
}

test('R5 CPU profiles publish Standard delayed cadence and bounded commitments', () => {
  for (const id of ['chameleon', 'supernariz']) {
    const profile = FIGHTER_KITS[id].cpu;
    assert.ok(profile.reactionTicks >= 12);
    assert.equal(profile.decisionTicks, 8);
    assert.ok(profile.commitmentTicks[0] >= 12);
    assert.ok(profile.commitmentTicks[1] <= 20);
    assert.ok(profile.missChance >= 0.15 && profile.missChance <= 0.35);
  }
});

for (const cue of ['ultimate', 'tongue', 'projectile', 'air']) {
  test(`new ${cue} cue cannot change threat-specific output during first 11 advancing ticks`, () => {
    const plain = new CpuController(1, { seed: 23 });
    const threat = new CpuController(1, { seed: 23 });

    for (let tick = 0; tick <= 31; tick += 1) {
      const a = plain.nextInput(scenario(tick, 'none'));
      const b = threat.nextInput(scenario(tick, tick >= 20 ? cue : 'none'));
      assert.deepEqual(b, a, `cue leaked before delayed boundary at combatTick=${tick}`);
    }
  });
}

test('combatTick, not render/global frame, advances perception and decision budgets', () => {
  const frozen = new CpuController(1, { seed: 19 });
  const control = new CpuController(1, { seed: 19 });

  for (let tick = 0; tick < 20; tick += 1) {
    assert.deepEqual(frozen.nextInput(scenario(tick)), control.nextInput(scenario(tick)));
  }

  const frozenThreat = scenario(20, 'ultimate');
  for (let frame = 100; frame < 140; frame += 1) {
    const repeated = structuredClone(frozenThreat);
    repeated.frame = frame;
    repeated.hitstopFrames = 5;
    assert.deepEqual(frozen.nextInput(repeated), frozen.nextInput(repeated), 'same combat tick must not consume hidden reaction budget');
  }

  for (let tick = 21; tick <= 31; tick += 1) {
    const a = frozen.nextInput(scenario(tick, 'ultimate'));
    const b = control.nextInput(scenario(tick, 'none'));
    assert.deepEqual(a, b, `hitstop/global-frame calls advanced reaction at combatTick=${tick}`);
  }
});

test('same seed and public observation stream replay identically, including reset', () => {
  const a = new CpuController(1, { seed: 71 });
  const b = new CpuController(1, { seed: 71 });
  const first = [];
  const second = [];
  for (let tick = 0; tick < 96; tick += 1) {
    const cue = tick >= 24 && tick < 42 ? 'tongue' : tick >= 58 && tick < 76 ? 'low' : 'none';
    first.push(a.nextInput(scenario(tick, cue)));
    second.push(b.nextInput(scenario(tick, cue)));
  }
  assert.deepEqual(first, second);

  a.reset();
  b.reset();
  for (let tick = 0; tick < 48; tick += 1) {
    assert.deepEqual(a.nextInput(scenario(tick, tick >= 16 ? 'air' : 'none')), b.nextInput(scenario(tick, tick >= 16 ? 'air' : 'none')));
  }
});

test('seeded corpus recognizes some cues and permanently misses others instead of rerolling each frame', () => {
  let recognized = 0;
  let missed = 0;

  for (let seed = 1; seed <= 100; seed += 1) {
    const cpu = new CpuController(1, { seed });
    let reacted = false;
    let reactionCount = 0;

    for (let tick = 0; tick < 64; tick += 1) {
      const out = cpu.nextInput(scenario(tick, tick >= 8 ? 'ultimate' : 'none'));
      if (tick >= 20 && threatDefense(out)) {
        reacted = true;
        reactionCount += 1;
      }
    }

    if (reacted) recognized += 1;
    else missed += 1;
    assert.ok(reactionCount <= 20, 'one cue must not be rerolled into repeated frame-perfect reactions');
  }

  assert.ok(recognized >= 65 && recognized <= 85, `recognition corpus was ${recognized}/100`);
  assert.ok(missed >= 15 && missed <= 35, `miss corpus was ${missed}/100`);
});

test('a missed cue remains missed, while a later distinct cue can be evaluated', () => {
  let chosenSeed = null;
  for (let seed = 1; seed <= 400 && chosenSeed === null; seed += 1) {
    const cpu = new CpuController(1, { seed });
    let firstReacted = false;
    let secondReacted = false;
    for (let tick = 0; tick < 104; tick += 1) {
      const cue = tick >= 8 && tick < 45 ? 'tongue' : tick >= 56 ? 'air' : 'none';
      const out = cpu.nextInput(scenario(tick, cue));
      if (tick >= 20 && tick < 55 && threatDefense(out)) firstReacted = true;
      if (tick >= 68 && threatDefense(out)) secondReacted = true;
    }
    if (!firstReacted && secondReacted) chosenSeed = seed;
  }
  assert.notEqual(chosenSeed, null, 'fixture needs a seed that misses one cue and recognizes a later distinct cue');

  const cpu = new CpuController(1, { seed: chosenSeed });
  let firstCueDefense = 0;
  let secondCueDefense = 0;
  for (let tick = 0; tick < 104; tick += 1) {
    const cue = tick >= 8 && tick < 45 ? 'tongue' : tick >= 56 ? 'air' : 'none';
    const out = cpu.nextInput(scenario(tick, cue));
    if (tick >= 20 && tick < 55 && threatDefense(out)) firstCueDefense += 1;
    if (tick >= 68 && threatDefense(out)) secondCueDefense += 1;
  }
  assert.equal(firstCueDefense, 0, 'missed first cue must stay missed for its lifetime');
  assert.ok(secondCueDefense > 0, 'later distinct cue must be independently evaluated');
});

test('guard-height response comes from delayed observed level, never immediate current cue', () => {
  const lowCpu = new CpuController(1, { seed: 23 });
  const neutralCpu = new CpuController(1, { seed: 23 });

  for (let tick = 0; tick <= 31; tick += 1) {
    const low = lowCpu.nextInput(scenario(tick, tick >= 20 ? 'low' : 'none'));
    const neutral = neutralCpu.nextInput(scenario(tick, 'none'));
    assert.equal(Boolean(low.down), Boolean(neutral.down), `instant low read at tick ${tick}`);
  }
});

test('CPU source has no human input adapter dependency or global-frame modulo policy', () => {
  const source = fs.readFileSync(new URL('../src/game/simulation/CpuController.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /GameInput|keyboard|dpad|pointer/i);
  assert.doesNotMatch(source, /snapshot\.frame\s*%|Math\.floor\(snapshot\.frame/);
  assert.match(source, /combatTick/);
});

test('different seeds are capable of different cue outcomes while each seed is deterministic', () => {
  const outcomes = new Set();
  for (let seed = 1; seed <= 24; seed += 1) {
    const t = trace(seed, 'ultimate', 56);
    outcomes.add(t.slice(32).map(frame => JSON.stringify(frame)).join('|'));
  }
  assert.ok(outcomes.size > 1);
});
