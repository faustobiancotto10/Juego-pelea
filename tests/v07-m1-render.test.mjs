import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { CombatSimulation } from '../dist/game/simulation/CombatSimulation.js';
import { LocomotionPoseTracker } from '../dist/game/render/LocomotionPose.js';

function baseJuanchi() {
  const sim = new CombatSimulation('juanchi', 'supernariz', { skipIntro: true });
  return sim.getSnapshot().fighters[0];
}

function walkingSnapshot(base, x) {
  return {
    ...base,
    x,
    y: 0,
    vx: 0,
    vy: 0,
    grounded: true,
    jumpStartupFrames: 0,
    airborneTicks: 0,
    landingRecoveryFrames: 0,
    dashKind: null,
    dashFrame: 0,
    moveId: null,
    moveFrame: 0,
    ultimatePhase: 'idle',
    capturedBy: null,
    clashRecoveryFrames: 0,
    stunFrames: 0,
    blockstunFrames: 0,
    guardBreakFrames: 0,
  };
}

test('Juanchi locomotion uses frozen V0.7 style and visibly transfers weight', () => {
  const base = baseJuanchi();
  const forward = new LocomotionPoseTracker();
  forward.sample(0, walkingSnapshot(base, 300), 0, 0);

  let start;
  let mid;
  let end;
  for (let tick = 1; tick <= 9; tick += 1) {
    const pose = forward.sample(0, walkingSnapshot(base, 300 + tick * 6), tick, tick);
    if (tick === 1) start = pose;
    if (tick === 5) mid = pose;
    if (tick === 9) end = pose;
  }

  assert.ok(end.phase < 0.02 || end.phase > 0.98, `54 units should complete Juanchi's forward gait cycle; phase=${end.phase}`);
  assert.ok(Math.abs(end.torsoLean - 0.035) < 1e-9, `forward lean should be 0.035; got ${end.torsoLean}`);
  assert.ok(Math.abs(mid.hipCounterRotation) > 0.001, 'Juanchi walk needs hip counter-rotation');
  assert.ok(Math.abs(mid.chestCounterRotation) > 0.001, 'Juanchi walk needs chest counter-rotation');
  assert.ok(Math.abs(mid.freeArmSwing) > 0.25, 'Juanchi walk needs a visible free-arm counter-swing');
  assert.ok(start.weightTransfer > 0, 'movement start should transfer weight into travel');

  const stopped = forward.sample(0, walkingSnapshot(base, 354), 10, 10);
  assert.ok(stopped.weightTransfer < 0, 'movement stop should transfer weight back out of travel');

  const backward = new LocomotionPoseTracker();
  backward.sample(0, walkingSnapshot(base, 300), 0, 0);
  let backEnd;
  for (let tick = 1; tick <= 9; tick += 1) {
    backEnd = backward.sample(0, walkingSnapshot(base, 300 - tick * 4.8), tick, tick);
  }
  assert.ok(backEnd.phase < 0.02 || backEnd.phase > 0.98, `43.2 units should complete Juanchi's backward gait cycle; phase=${backEnd.phase}`);
  assert.ok(Math.abs(backEnd.torsoLean - (-0.055)) < 1e-9, `back lean should be -0.055; got ${backEnd.torsoLean}`);

  const source = readFileSync('src/game/render/LocomotionPose.ts', 'utf8');
  for (const frozen of [
    'stride: 54',
    'backStrideMultiplier: 0.80',
    'stanceFraction: 0.62',
    'swingFootLift: 6',
    'pelvisBobAmplitude: 1.3',
    'forwardTorsoLean: 0.035',
    'backwardTorsoLean: -0.055',
  ]) {
    assert.equal(source.includes(frozen), true, `missing frozen Juanchi style value: ${frozen}`);
  }
});

test('V0.7 attack presentation is bounded, keyed, and diagnostic instead of silently falling back', () => {
  const path = 'src/game/render/AttackPresentation.ts';
  assert.equal(existsSync(path), true, 'AttackPresentation registry module must exist');
  const source = existsSync(path) ? readFileSync(path, 'utf8') : '';

  for (const required of [
    'AttackPresentationProfile',
    'telegraphKey',
    'trailKey',
    'contactBurstKey',
    'auraKey',
    'groundImpactKey',
    'intensity',
    'resolveAttackPresentationProfile',
    'diagnostic-missing',
    'claw1',
    'tongueStraight',
    'coletazo',
    'ultimateCamaleoni',
    'nose1',
    'chorizoThrow',
    'tramontana',
    'ultimateSupernariz',
    'juanchiJab',
    'rugbyBoomerangThrow',
    'friccion',
    'policeCapRage',
  ]) {
    assert.equal(source.includes(required), true, `attack presentation registry missing ${required}`);
  }

  assert.doesNotMatch(source, /damage|hitbox|hitstun|blockstun|captureReach|collision/i);
});

test('shared renderer dispatches attack accents and contact bursts from authoritative move/event state', () => {
  const fight = readFileSync('src/game/render/FightRenderer.ts', 'utf8');
  const effects = readFileSync('src/game/render/CombatEffects.ts', 'utf8');

  assert.match(fight, /resolveAttackPresentationProfile/);
  assert.match(fight, /event\.moveId/);
  assert.match(fight, /drawAttackMotionAccent/);
  assert.match(fight, /drawAttackContactBurst/);
  assert.match(fight, /event\.type === 'projectile-catch'/);
  assert.match(fight, /projectile\.phase === 'outbound'/);
  assert.match(fight, /drawRugbyCatchAccent/);

  for (const required of [
    'drawAttackMotionAccent',
    'drawAttackContactBurst',
    'claw-green',
    'tongue-snap',
    'tail-mass',
    'nose-curve',
    'chorizo-spice',
    'wind-lanes',
    'juanchi-gold',
    'friccion-sparks',
    'diagnostic-missing',
  ]) {
    assert.equal(effects.includes(required), true, `shared CombatEffects missing ${required}`);
  }
});

test('Juanchi Police Cap Rage uses a genuine procedural aura outside the body silhouette', () => {
  const source = readFileSync('src/game/render/JuanchiRig.ts', 'utf8');
  assert.match(source, /drawJuanchiRageAura/);
  assert.match(source, /flame|wisp/i);
  assert.match(source, /floor|ground/i);
  assert.match(source, /strokeStyle/);
  assert.match(source, /bezierCurveTo|quadraticCurveTo/);
  assert.match(source, /action\.rage/);
  assert.doesNotMatch(source, /new Image\(|drawImage\(|\.png|\.jpg|\.jpeg|spritesheet/i);
});
