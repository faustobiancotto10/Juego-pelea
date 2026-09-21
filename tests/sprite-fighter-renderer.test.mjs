import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SpriteFighterRenderer,
  computeSpriteDrawPlacement,
} from '../dist/game/render/sprites/SpriteFighterRenderer.js';

function fighter(overrides = {}) {
  return {
    id: 'chameleon',
    x: 500,
    y: 20,
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

function frame(overrides = {}) {
  return {
    x: 7,
    y: 11,
    width: 80,
    height: 100,
    pivotX: 23,
    pivotY: 94,
    durationTicks: 4,
    anchors: { head: { x: 40, y: 18 } },
    ...overrides,
  };
}

test('sprite draw placement preserves source rect and anchors trimmed frame pivot to fighter world position', () => {
  const placement = computeSpriteDrawPlacement(fighter(), frame());
  assert.deepEqual(placement, {
    translateX: 500,
    translateY: 630,
    scaleX: 1,
    source: { x: 7, y: 11, width: 80, height: 100 },
    dest: { x: -23, y: -94, width: 80, height: 100 },
  });
});

test('facing flip mirrors around the same authoritative world anchor without shifting it', () => {
  const right = computeSpriteDrawPlacement(fighter({ facing: 1 }), frame());
  const left = computeSpriteDrawPlacement(fighter({ facing: -1 }), frame());
  assert.equal(right.translateX, left.translateX);
  assert.equal(right.translateY, left.translateY);
  assert.equal(right.dest.x, left.dest.x);
  assert.equal(right.dest.y, left.dest.y);
  assert.equal(left.scaleX, -1);
});

test('different trimmed crouch/lunge frames remain pivot-anchored', () => {
  const crouch = computeSpriteDrawPlacement(fighter({ crouching: true }), frame({
    width: 112,
    height: 72,
    pivotX: 54,
    pivotY: 67,
  }));
  assert.equal(crouch.translateX, 500);
  assert.equal(crouch.translateY, 630);
  assert.deepEqual(crouch.dest, { x: -54, y: -67, width: 112, height: 72 });
});

test('sprite renderer resolves animation from snapshot, samples frame and draws only the atlas rect', () => {
  const sampledFrame = frame();
  const image = { id: 'atlas' };
  const store = {
    get(key) {
      assert.equal(key, 'pkg');
      return {
        image,
        manifest: {
          version: 1,
          atlas: 'body.webp',
          animations: { idle: { loop: true, frames: [sampledFrame] } },
        },
      };
    },
  };
  const calls = [];
  const ctx = {
    globalAlpha: 1,
    save() { calls.push(['save']); },
    restore() { calls.push(['restore']); },
    translate(x, y) { calls.push(['translate', x, y]); },
    scale(x, y) { calls.push(['scale', x, y]); },
    drawImage(...args) { calls.push(['drawImage', ...args]); },
  };

  const renderer = new SpriteFighterRenderer(store);
  renderer.draw(ctx, fighter(), 'pkg', 12, 0.5);

  assert.deepEqual(calls[1], ['translate', 500, 630]);
  assert.deepEqual(calls[2], ['scale', 1, 1]);
  assert.deepEqual(
    calls[3],
    ['drawImage', image, 7, 11, 80, 100, -23, -94, 80, 100],
  );
  assert.equal(ctx.globalAlpha, 0.5);
  assert.deepEqual(calls.at(-1), ['restore']);
});

test('sprite renderer fails visibly on a missing resolved animation and exposes exact frame anchors', () => {
  const sampledFrame = frame();
  const loaded = {
    image: {},
    manifest: {
      version: 1,
      atlas: 'body.webp',
      animations: { idle: { loop: true, frames: [sampledFrame] } },
    },
  };
  const renderer = new SpriteFighterRenderer({ get: () => loaded });

  assert.deepEqual(
    renderer.sampleAnchor(fighter(), 'pkg', 2, 'head'),
    { x: 17, y: 76 },
  );

  const broken = new SpriteFighterRenderer({
    get: () => ({
      ...loaded,
      manifest: { ...loaded.manifest, animations: { walk: loaded.manifest.animations.idle } },
    }),
  });
  assert.throws(
    () => broken.sampleAnchor(fighter(), 'pkg', 2, 'head'),
    /missing sprite animation.*idle/i,
  );
});
