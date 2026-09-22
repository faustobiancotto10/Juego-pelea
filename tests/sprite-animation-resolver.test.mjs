import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveSpriteAnimation } from '../dist/game/render/sprites/AnimationResolver.js';
import { sampleSpriteFrame } from '../dist/game/render/sprites/SpriteFrameSampler.js';
import { sampleSpriteAnchor } from '../dist/game/render/sprites/SpriteAnchorSampler.js';

function fighter(overrides = {}) {
  return {
    id: 'chameleon',
    x: 500,
    y: 0,
    vx: 0,
    vy: 0,
    facing: 1,
    health: 1000,
    maxHealth: 1000,
    guard: 100,
    maxGuard: 100,
    guardRegenDelay: 0,
    guardBreakFrames: 0,
    grounded: true,
    jumpStartupFrames: 0,
    airborneTicks: 0,
    crouching: false,
    blocking: false,
    stunFrames: 0,
    blockstunFrames: 0,
    moveId: null,
    moveFrame: 0,
    comboCount: 0,
    moveContact: 'none',
    chilledFrames: 0,
    projectileCooldown: 0,
    projectileCooldownMax: 0,
    rangedAvailability: 'ready',
    rangedRecoveryFrames: 0,
    dashKind: null,
    dashFrame: 0,
    landingRecoveryFrames: 0,
    pushGuardRecoveryFrames: 0,
    superMeter: 0,
    maxSuper: 100,
    superReady: false,
    ultimatePhase: 'idle',
    ultimatePhaseFrame: 0,
    ultimateConnected: false,
    ultimateTarget: null,
    ultimateEffectiveTick: null,
    ultimateProbe: null,
    captureAnchorX: null,
    clashRecoveryFrames: 0,
    capturedBy: null,
    roundWins: 0,
    ...overrides,
  };
}

test('resolver derives neutral, crouch and locomotion from snapshot plus authoritative combat tick', () => {
  assert.deepEqual(resolveSpriteAnimation(fighter(), 120), { key: 'idle', tick: 120 });
  assert.deepEqual(resolveSpriteAnimation(fighter({ crouching: true }), 121), { key: 'crouch', tick: 121 });
  assert.deepEqual(resolveSpriteAnimation(fighter({ vx: 3, facing: 1 }), 122), { key: 'walk-forward', tick: 122 });
  assert.deepEqual(resolveSpriteAnimation(fighter({ vx: -3, facing: 1 }), 123), { key: 'walk-back', tick: 123 });
  assert.deepEqual(resolveSpriteAnimation(fighter({ vx: -3, facing: -1 }), 124), { key: 'walk-forward', tick: 124 });
});

test('resolver prioritizes block, dash, air and landing using only authoritative counters', () => {
  assert.deepEqual(resolveSpriteAnimation(fighter({ blocking: true }), 40), { key: 'block', tick: 40 });
  assert.deepEqual(resolveSpriteAnimation(fighter({ blocking: true, crouching: true }), 41), { key: 'block-crouch', tick: 41 });
  assert.deepEqual(resolveSpriteAnimation(fighter({ dashKind: 'forward', dashFrame: 5 }), 99), { key: 'dash-forward', tick: 5 });
  assert.deepEqual(resolveSpriteAnimation(fighter({ dashKind: 'back', dashFrame: 6 }), 99), { key: 'dash-back', tick: 6 });
  assert.deepEqual(resolveSpriteAnimation(fighter({ grounded: false, vy: 4, airborneTicks: 8 }), 99), { key: 'jump-ascent', tick: 8 });
  assert.deepEqual(resolveSpriteAnimation(fighter({ grounded: false, vy: 0.2, airborneTicks: 9 }), 99), { key: 'jump-apex', tick: 9 });
  assert.deepEqual(resolveSpriteAnimation(fighter({ grounded: false, vy: -4, airborneTicks: 10 }), 99), { key: 'jump-descent', tick: 10 });
  assert.deepEqual(resolveSpriteAnimation(fighter({ landingRecoveryFrames: 3 }), 99), { key: 'land', tick: 3 });
});

test('resolver prioritizes terminal/capture and reaction states above active presentation', () => {
  assert.equal(resolveSpriteAnimation(fighter({ health: 0, moveId: 'tongueStraight', moveFrame: 4 }), 20).key, 'knockdown');
  assert.equal(resolveSpriteAnimation(fighter({ capturedBy: 1, moveId: 'tongueStraight', moveFrame: 4 }), 20).key, 'captured');
  assert.deepEqual(resolveSpriteAnimation(fighter({ guardBreakFrames: 12 }), 20), { key: 'guard-break', tick: 12 });
  assert.deepEqual(resolveSpriteAnimation(fighter({ stunFrames: 7 }), 20), { key: 'hurt', tick: 7 });
});

test('resolver maps ordinary moves and Ultimate phases to explicit keys', () => {
  assert.deepEqual(
    resolveSpriteAnimation(fighter({ moveId: 'tongueStraight', moveFrame: 11 }), 200),
    { key: 'move:tongueStraight', tick: 11 },
  );

  for (const phase of ['startup', 'capture', 'sequence', 'recovery']) {
    assert.deepEqual(
      resolveSpriteAnimation(fighter({
        moveId: 'ultimateCamaleoni',
        moveFrame: 22,
        ultimatePhase: phase,
        ultimatePhaseFrame: 6,
      }), 200),
      { key: `ultimate:ultimateCamaleoni:${phase}`, tick: 6 },
    );
  }
});

test('resolver is stable when authoritative time is held', () => {
  const snapshot = fighter({ vx: 2 });
  const first = resolveSpriteAnimation(snapshot, 333);
  const second = resolveSpriteAnimation(snapshot, 333);
  assert.deepEqual(second, first);
});


test('frame sampler uses cumulative integer durations and deterministic looping', () => {
  const animation = {
    loop: true,
    frames: [
      { x: 0, y: 0, width: 10, height: 20, pivotX: 5, pivotY: 20, durationTicks: 2 },
      { x: 10, y: 0, width: 10, height: 20, pivotX: 5, pivotY: 20, durationTicks: 3 },
      { x: 20, y: 0, width: 10, height: 20, pivotX: 5, pivotY: 20, durationTicks: 1 },
    ],
  };

  assert.equal(sampleSpriteFrame(animation, -5).frameIndex, 0);
  assert.equal(sampleSpriteFrame(animation, 0).frameIndex, 0);
  assert.equal(sampleSpriteFrame(animation, 1).frameIndex, 0);
  assert.equal(sampleSpriteFrame(animation, 2).frameIndex, 1);
  assert.equal(sampleSpriteFrame(animation, 4).frameIndex, 1);
  assert.equal(sampleSpriteFrame(animation, 5).frameIndex, 2);
  assert.equal(sampleSpriteFrame(animation, 6).frameIndex, 0);
  assert.equal(sampleSpriteFrame(animation, 8).frameIndex, 1);
});

test('frame sampler holds the final frame for non-looping animations', () => {
  const animation = {
    loop: false,
    frames: [
      { x: 0, y: 0, width: 10, height: 20, pivotX: 5, pivotY: 20, durationTicks: 2 },
      { x: 10, y: 0, width: 10, height: 20, pivotX: 5, pivotY: 20, durationTicks: 2 },
    ],
  };
  assert.equal(sampleSpriteFrame(animation, 999).frameIndex, 1);
});

test('anchor sampler returns exact named frame anchors without fallback invention', () => {
  const frame = {
    x: 0,
    y: 0,
    width: 10,
    height: 20,
    pivotX: 5,
    pivotY: 20,
    durationTicks: 2,
    anchors: {
      frontHand: { x: 8, y: 7 },
      belt: { x: 5, y: 14 },
    },
  };

  assert.deepEqual(sampleSpriteAnchor(frame, 'frontHand'), { x: 8, y: 7 });
  assert.deepEqual(sampleSpriteAnchor(frame, 'belt'), { x: 5, y: 14 });
  assert.equal(sampleSpriteAnchor(frame, 'missing'), null);
  assert.equal(sampleSpriteAnchor({ ...frame, anchors: undefined }, 'frontHand'), null);
});
