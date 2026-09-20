import test from 'node:test';
import assert from 'node:assert/strict';
import { CombatSimulation } from '../dist/game/simulation/CombatSimulation.js';
import { CpuController } from '../dist/game/simulation/CpuController.js';

function mutableSnapshot(sim) {
  return structuredClone(sim.getSnapshot());
}

function feed(cpu, template, fromTick, toTick, mutate = () => {}) {
  const outputs = [];
  for (let tick = fromTick; tick <= toTick; tick += 1) {
    const snap = structuredClone(template);
    snap.combatTick = tick;
    snap.frame = tick;
    mutate(snap, tick);
    outputs.push(cpu.nextInput(snap));
  }
  return outputs;
}

test('CPU approaches when delayed public range is outside its preferred band', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  const snap = mutableSnapshot(sim);
  snap.fighters[0].x = 200;
  snap.fighters[1].x = 1050;
  snap.fighters[1].projectileCooldown = 60;

  const cpu = new CpuController(1, { seed: 3 });
  const outputs = feed(cpu, snap, 0, 24);
  assert.ok(outputs.some(frame => frame.left && !frame.right), 'after observation delay the pressure CPU should commit to approach');
});

test('CPU chooses a close offensive option after delayed observation instead of random per-frame movement', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  const snap = mutableSnapshot(sim);
  snap.fighters[0].x = 590;
  snap.fighters[1].x = 680;

  const cpu = new CpuController(1, { seed: 11 });
  const outputs = feed(cpu, snap, 0, 40);
  assert.ok(outputs.some(frame => frame.attack || frame.special), 'close pressure should eventually choose authored offense');
});

test('CPU does not frame-perfect block a newly started threat and some seeds recognize it after delay', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  const base = mutableSnapshot(sim);
  base.fighters[0].x = 560;
  base.fighters[1].x = 700;
  base.fighters[1].facing = -1;

  let recognizers = 0;
  for (let seed = 1; seed <= 24; seed += 1) {
    const cpu = new CpuController(1, { seed });
    let sawDelayedGuard = false;
    for (let tick = 0; tick < 48; tick += 1) {
      const snap = structuredClone(base);
      snap.combatTick = tick;
      snap.frame = tick;
      if (tick >= 8) {
        snap.fighters[0].moveId = 'tongueStraight';
        snap.fighters[0].moveFrame = tick - 8;
      }
      const frame = cpu.nextInput(snap);
      if (tick === 8) assert.equal(frame.right, false, 'new cue cannot produce instant away guard');
      if (tick >= 20 && frame.right) sawDelayedGuard = true;
    }
    if (sawDelayedGuard) recognizers += 1;
  }
  assert.ok(recognizers > 0 && recognizers < 24, 'seeded cue policy must include both recognition and misses');
});

test('Supernariz CPU can choose Chorizo at long range without a global-frame trigger', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  const base = mutableSnapshot(sim);
  base.fighters[0].x = 300;
  base.fighters[1].x = 820;
  base.fighters[1].projectileCooldown = 0;

  let used = false;
  for (let seed = 1; seed <= 24 && !used; seed += 1) {
    const cpu = new CpuController(1, { seed });
    const outputs = feed(cpu, base, 0, 32);
    used = outputs.some(frame => frame.special && !frame.down);
  }
  assert.equal(used, true);
});

test('CPU movement commitments survive new current-frame geometry until commitment ends', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  const base = mutableSnapshot(sim);
  base.fighters[0].x = 200;
  base.fighters[1].x = 1000;
  base.fighters[1].projectileCooldown = 60;
  const cpu = new CpuController(1, { seed: 5 });

  let committed = null;
  for (let tick = 0; tick <= 24; tick += 1) {
    const snap = structuredClone(base);
    snap.combatTick = tick;
    snap.frame = tick;
    const action = cpu.nextInput(snap);
    if (action.left) {
      committed = tick;
      break;
    }
  }
  assert.notEqual(committed, null);

  const changed = structuredClone(base);
  changed.combatTick = committed + 1;
  changed.frame = committed + 1;
  changed.fighters[0].x = 920;
  changed.fighters[1].x = 1000;
  const after = cpu.nextInput(changed);
  assert.equal(after.left, true, 'current-frame geometry cannot cancel an already chosen approach');
});
