import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SpriteFighterRenderer,
  computeSpriteDrawPlacement,
} from '../dist/game/render/sprites/SpriteFighterRenderer.js';
import { GROUND_Y } from '../dist/game/render/drawUtils.js';

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
  const placement = computeSpriteDrawPlacement(fighter(), frame(), false);
  assert.deepEqual(placement, {
    translateX: 500,
    translateY: GROUND_Y - 20,
    scaleX: 1,
    source: { x: 7, y: 11, width: 80, height: 100 },
    dest: { x: -23, y: -94, width: 80, height: 100 },
  });
});

test('facing flip mirrors around the same authoritative world anchor without shifting it', () => {
  const right = computeSpriteDrawPlacement(fighter({ facing: 1 }), frame(), true);
  const left = computeSpriteDrawPlacement(fighter({ facing: -1 }), frame(), true);
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
  }), false);
  assert.equal(crouch.translateX, 500);
  assert.equal(crouch.translateY, GROUND_Y - 20);
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
          mirrorSafe: true,
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

  assert.deepEqual(calls[1], ['translate', 500, GROUND_Y - 20]);
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
      mirrorSafe: true,
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


test('non-mirror-safe LEFT fighters select authored left frames without canvas mirroring', () => {
  const rightFrame = frame();
  const leftFrame = frame({
    x: 107,
    pivotX: 57,
    anchors: { head: { x: 40, y: 18 } },
  });
  const image = { id: 'authored-facing-atlas' };
  const loaded = {
    image,
    manifest: {
      version: 1,
      atlas: 'body.webp',
      mirrorSafe: false,
      animations: { idle: { loop: true, frames: [rightFrame] } },
      leftAnimations: { idle: { loop: true, frames: [leftFrame] } },
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
  const renderer = new SpriteFighterRenderer({ get: () => loaded });
  const leftFighter = fighter({ facing: -1 });

  renderer.draw(ctx, leftFighter, 'pkg-authored', 10);

  assert.deepEqual(calls[2], ['scale', 1, 1], 'authored LEFT art must not be mirrored');
  assert.deepEqual(
    calls[3],
    ['drawImage', image, 107, 11, 80, 100, -57, -94, 80, 100],
  );
  assert.deepEqual(
    renderer.sampleAnchor(leftFighter, 'pkg-authored', 10, 'head'),
    { x: 17, y: 76 },
    'authored LEFT anchor must normalize to canonical fighter-local coordinates',
  );
});

test('mirror-safe LEFT fighters explicitly reuse right frames with a horizontal flip', () => {
  const sampledFrame = frame();
  const loaded = {
    image: {},
    manifest: {
      version: 1,
      atlas: 'body.webp',
      mirrorSafe: true,
      animations: { idle: { loop: true, frames: [sampledFrame] } },
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

  new SpriteFighterRenderer({ get: () => loaded })
    .draw(ctx, fighter({ facing: -1 }), 'pkg-mirror-safe', 10);

  assert.deepEqual(calls[2], ['scale', -1, 1]);
});


test('reaction and terminal sprite timelines start at state entry and advance only with authoritative combatTick per fighter slot', () => {
  const image = { id: 'timeline-atlas' };
  const timelineFrames = [
    frame({ x: 7, durationTicks: 1 }),
    frame({ x: 87, durationTicks: 1 }),
    frame({ x: 167, durationTicks: 1 }),
  ];
  const loaded = {
    image,
    manifest: {
      version: 1,
      atlas: 'body.webp',
      mirrorSafe: true,
      animations: {
        hurt: { loop: false, frames: timelineFrames },
        knockdown: { loop: false, frames: timelineFrames },
      },
    },
  };
  const renderer = new SpriteFighterRenderer({ get: () => loaded });

  function sampledSourceX(snapshot, combatTick, slot) {
    const calls = [];
    const ctx = {
      globalAlpha: 1,
      save() {},
      restore() {},
      translate() {},
      scale() {},
      drawImage(...args) { calls.push(args); },
    };
    renderer.draw(ctx, snapshot, 'pkg-timeline', combatTick, 1, slot);
    return calls.at(-1)[1];
  }

  assert.equal(sampledSourceX(fighter({ stunFrames: 7 }), 500, 0), 7, 'hurt must enter on frame zero');
  assert.equal(sampledSourceX(fighter({ stunFrames: 6 }), 501, 0), 87, 'hurt advances with combatTick, not remaining stun');
  assert.equal(sampledSourceX(fighter({ stunFrames: 6 }), 501, 0), 87, 'hitstop/repeated render at the same combatTick must freeze presentation age');
  assert.equal(sampledSourceX(fighter({ stunFrames: 10 }), 502, 0), 7, 'a renewed hit that raises remaining stun restarts the hurt timeline');

  assert.equal(sampledSourceX(fighter({ stunFrames: 5 }), 502, 1), 7, 'mirror-match slots must not share reaction age');

  assert.equal(sampledSourceX(fighter({ health: 0 }), 900, 0), 7, 'knockdown entered late in the round must start on frame zero');
  assert.equal(sampledSourceX(fighter({ health: 0 }), 901, 0), 87, 'knockdown then advances from its own entry tick');
});


test('decrementing transition counters never drive guard-break, jump-startup or landing animations backward', () => {
  const transitionFrames = [
    frame({ x: 17, durationTicks: 1 }),
    frame({ x: 97, durationTicks: 1 }),
    frame({ x: 177, durationTicks: 1 }),
  ];
  const loaded = {
    image: { id: 'transition-atlas' },
    manifest: {
      version: 1,
      atlas: 'body.webp',
      mirrorSafe: true,
      animations: {
        'guard-break': { loop: false, frames: transitionFrames },
        'jump-startup': { loop: false, frames: transitionFrames },
        land: { loop: false, frames: transitionFrames },
      },
    },
  };
  const renderer = new SpriteFighterRenderer({ get: () => loaded });

  function sourceX(snapshot, combatTick) {
    let drawArgs = null;
    const ctx = {
      globalAlpha: 1,
      save() {},
      restore() {},
      translate() {},
      scale() {},
      drawImage(...args) { drawArgs = args; },
    };
    renderer.draw(ctx, snapshot, 'pkg-transitions', combatTick, 1, 0);
    return drawArgs[1];
  }

  assert.equal(sourceX(fighter({ guardBreakFrames: 42 }), 100), 17);
  assert.equal(sourceX(fighter({ guardBreakFrames: 41 }), 101), 97);

  assert.equal(sourceX(fighter({ jumpStartupFrames: 5 }), 200), 17);
  assert.equal(sourceX(fighter({ jumpStartupFrames: 4 }), 201), 97);

  assert.equal(sourceX(fighter({ landingRecoveryFrames: 3 }), 300), 17);
  assert.equal(sourceX(fighter({ landingRecoveryFrames: 2 }), 301), 97);
});
