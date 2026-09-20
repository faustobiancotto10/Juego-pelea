import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CombatSimulation } from '../dist/game/simulation/CombatSimulation.js';
import { LocomotionPoseTracker } from '../dist/game/render/LocomotionPose.js';

function baseFighter(id = 'chameleon') {
  const opponent = id === 'supernariz' ? 'chameleon' : 'supernariz';
  const sim = new CombatSimulation(id, opponent, { skipIntro: true });
  return sim.getSnapshot().fighters[0];
}

function travelSnapshot(base, tick, options = {}) {
  return {
    ...base,
    x: options.x ?? 300 + tick * 4,
    y: options.y ?? 0,
    vx: options.vx ?? 4,
    vy: options.vy ?? 0,
    grounded: options.grounded ?? true,
    jumpStartupFrames: options.jumpStartupFrames ?? 0,
    airborneTicks: options.airborneTicks ?? 0,
    landingRecoveryFrames: options.landingRecoveryFrames ?? 0,
    dashKind: options.dashKind ?? null,
    dashFrame: options.dashFrame ?? 0,
    moveId: options.moveId ?? null,
    moveFrame: options.moveFrame ?? 0,
    ultimatePhase: options.ultimatePhase ?? 'idle',
    capturedBy: options.capturedBy ?? null,
    clashRecoveryFrames: options.clashRecoveryFrames ?? 0,
    stunFrames: options.stunFrames ?? 0,
    blockstunFrames: options.blockstunFrames ?? 0,
    guardBreakFrames: options.guardBreakFrames ?? 0,
  };
}

test('identical simulation snapshot is pose-idempotent', () => {
  const tracker = new LocomotionPoseTracker();
  const fighter = travelSnapshot(baseFighter(), 6);
  const first = tracker.sample(0, fighter, 20, 6);
  const repeated = tracker.sample(0, structuredClone(fighter), 20, 6);
  assert.deepEqual(repeated, first);
});

test('hitstop-style frame advance with frozen combatTick does not advance locomotion pose', () => {
  const tracker = new LocomotionPoseTracker();
  const base = baseFighter();
  for (let tick = 1; tick <= 8; tick += 1) {
    tracker.sample(0, travelSnapshot(base, tick), tick, tick);
  }
  const frozenFighter = travelSnapshot(base, 8);
  const before = tracker.sample(0, frozenFighter, 8, 8);
  const duringHitstop = tracker.sample(0, structuredClone(frozenFighter), 14, 8);
  assert.deepEqual(duringHitstop, before);
});

function finalPoseForCadence(step) {
  const tracker = new LocomotionPoseTracker();
  const base = baseFighter('supernariz');
  let pose;
  for (let tick = 0; tick <= 36; tick += step) {
    const fighter = travelSnapshot(base, tick);
    pose = tracker.sample(0, fighter, 100 + tick, tick);
    if (step === 1) {
      // 120-Hz style duplicate render of the same simulation snapshot.
      const repeat = tracker.sample(0, structuredClone(fighter), 100 + tick, tick);
      assert.deepEqual(repeat, pose);
    }
  }
  return pose;
}

test('30/60/120-style sampling converges to equivalent travel-driven pose', () => {
  const sixty = finalPoseForCadence(1);
  const thirty = finalPoseForCadence(2);
  assert.ok(Math.abs(sixty.phase - thirty.phase) < 1e-9);
  assert.ok(Math.abs(sixty.frontFoot.x - thirty.frontFoot.x) < 1e-9);
  assert.ok(Math.abs(sixty.backFoot.x - thirty.backFoot.x) < 1e-9);
  assert.ok(Math.abs(sixty.movementBlend - thirty.movementBlend) < 1e-9);
});

test('steady travel keeps a stance foot planted within four world units across four ticks', () => {
  for (const fighterId of ['chameleon', 'supernariz', 'juanchi']) {
    const tracker = new LocomotionPoseTracker();
    const base = baseFighter(fighterId);
    const samples = [];
    for (let tick = 0; tick <= 70; tick += 1) {
      const fighter = travelSnapshot(base, tick);
      const pose = tracker.sample(0, fighter, tick, tick);
      samples.push({
        tick,
        worldX: fighter.x + fighter.facing * pose.frontFoot.x,
        lift: pose.frontFoot.y,
        blend: pose.movementBlend,
      });
    }

    let found = false;
    for (let i = 8; i + 3 < samples.length; i += 1) {
      const window = samples.slice(i, i + 4);
      if (window.every((s) => s.lift < 0.001 && s.blend > 0.999)) {
        const xs = window.map((s) => s.worldX);
        const drift = Math.max(...xs) - Math.min(...xs);
        assert.ok(drift <= 4, `${fighterId} planted-foot drift was ${drift.toFixed(3)}`);
        found = true;
        break;
      }
    }
    assert.equal(found, true, `${fighterId} should expose a measurable four-tick stance interval`);
  }
});

test('wall clamp cannot treadmill gait from nonzero vx alone', () => {
  const tracker = new LocomotionPoseTracker();
  const base = baseFighter();
  for (let tick = 0; tick <= 10; tick += 1) {
    tracker.sample(0, travelSnapshot(base, tick), tick, tick);
  }
  const before = tracker.sample(0, travelSnapshot(base, 10), 10, 10);
  let pose = before;
  for (let tick = 11; tick <= 15; tick += 1) {
    pose = tracker.sample(0, travelSnapshot(base, tick, { x: 340, vx: 4 }), tick, tick);
  }
  assert.equal(pose.phase, before.phase);
  assert.ok(pose.movementBlend < before.movementBlend);
});

test('jump preparation, airborne tuck and landing absorption are simulation-owned cues', () => {
  const tracker = new LocomotionPoseTracker();
  const base = baseFighter('juanchi');

  tracker.sample(0, travelSnapshot(base, 0), 0, 0);
  const prep2 = tracker.sample(0, travelSnapshot(base, 1, { x: 300, vx: 0, jumpStartupFrames: 2 }), 1, 1);
  const prep1 = tracker.sample(0, travelSnapshot(base, 2, { x: 300, vx: 0, jumpStartupFrames: 1 }), 2, 2);
  assert.ok(prep2.preparation > 0);
  assert.ok(prep1.preparation > prep2.preparation);

  const ascent = tracker.sample(0, travelSnapshot(base, 3, {
    x: 300, vx: 0, grounded: false, y: 18, vy: 11, airborneTicks: 1,
  }), 3, 3);
  const apex = tracker.sample(0, travelSnapshot(base, 8, {
    x: 300, vx: 0, grounded: false, y: 92, vy: 0.4, airborneTicks: 6,
  }), 8, 8);
  const descent = tracker.sample(0, travelSnapshot(base, 12, {
    x: 300, vx: 0, grounded: false, y: 50, vy: -8, airborneTicks: 10,
  }), 12, 12);
  const land = tracker.sample(0, travelSnapshot(base, 13, {
    x: 300, vx: 0, grounded: true, y: 0, vy: 0, landingRecoveryFrames: 4,
  }), 13, 13);

  assert.ok(ascent.extension > 0);
  assert.ok(apex.tuck > 0.8);
  assert.ok(descent.descentBrace > 0.5);
  assert.equal(land.landingAbsorption, 1);
});

test('Juanchi rig is procedural and covers frozen identity/prop/action vocabulary', () => {
  const source = readFileSync('src/game/render/JuanchiRig.ts', 'utf8');
  for (const required of [
    'La 56',
    'rugbyBoomerangThrow',
    'friccion',
    'ultimatePhase',
    'rangedAvailability',
    'drawRugbyBall',
    'drawPoliceCap',
    'drawFacingReadableText',
    'ultimatePhaseFrame',
  ]) {
    assert.equal(source.includes(required), true, `Juanchi rig missing ${required}`);
  }
  for (const banned of ['new Image(', 'drawImage(', '.png', '.jpg', '.jpeg', 'spritesheet']) {
    assert.equal(source.includes(banned), false, `Juanchi rig must not contain ${banned}`);
  }
});

test('released rig map contains all three fighter presentation keys with no silent fallback', () => {
  const source = readFileSync('src/game/render/FighterRenderer.ts', 'utf8');
  assert.match(source, /chameleon: drawChameleon/);
  assert.match(source, /supernariz: drawSupernariz/);
  assert.match(source, /juanchi: drawJuanchi/);
  assert.match(source, /DEFAULT_FIGHTER_PRESENTATION_REGISTRY/);
  assert.match(source, /drawMissingRig/);
  assert.doesNotMatch(source, /else drawSupernariz/);
});

test('existing fighter locomotion no longer derives leg cadence from wall time or vx oscillator', () => {
  const chameleon = readFileSync('src/game/render/ChameleonRig.ts', 'utf8');
  const supernariz = readFileSync('src/game/render/SupernarizRig.ts', 'utf8');
  assert.match(chameleon, /locomotion\.frontFoot/);
  assert.match(chameleon, /locomotion\.backFoot/);
  assert.match(supernariz, /locomotion\.frontFoot/);
  assert.match(supernariz, /locomotion\.backFoot/);
  assert.doesNotMatch(chameleon, /Math\.sin\(time \* 10 \+ f\.x/);
  assert.doesNotMatch(supernariz, /Math\.sin\(time \* 10\.5 \+ f\.x/);
});

test('render locomotion sampling never mutates fighter snapshots', () => {
  const tracker = new LocomotionPoseTracker();
  const fighter = travelSnapshot(baseFighter('juanchi'), 4);
  const before = structuredClone(fighter);
  tracker.sample(0, fighter, 4, 4);
  assert.deepEqual(fighter, before);
});
