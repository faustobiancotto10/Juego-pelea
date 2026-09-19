import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CombatSimulation } from '../dist/game/simulation/CombatSimulation.js';
import { FightRenderer } from '../dist/game/render/FightRenderer.js';
import { getAirPresentationPose, getMovePresentationPhase } from '../dist/game/render/PresentationPose.js';

function makeContext() {
  const state = {};
  return new Proxy(state, {
    get(target, prop) {
      if (prop in target) return target[prop];
      if (prop === 'measureText') return () => ({ width: 0 });
      return () => {};
    },
    set(target, prop, value) {
      target[prop] = value;
      return true;
    },
  });
}

function makeRenderer() {
  globalThis.window = {
    devicePixelRatio: 1,
    innerWidth: 1280,
    innerHeight: 720,
  };
  const ctx = makeContext();
  const canvas = {
    width: 1280,
    height: 720,
    clientWidth: 1280,
    clientHeight: 720,
    getContext: () => ctx,
  };
  return new FightRenderer(canvas);
}

function baseSnapshot() {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  return sim.getSnapshot();
}

function hitSnapshot(frame = 1) {
  const base = baseSnapshot();
  return {
    ...base,
    frame,
    combatTick: frame,
    events: [{
      type: 'hit',
      attacker: 0,
      defender: 1,
      blocked: false,
      damage: 46,
      strong: false,
      source: 'normal',
      finisher: false,
    }],
  };
}

function noEventAt(snapshot, frame) {
  return {
    ...snapshot,
    frame,
    combatTick: frame,
    events: [],
  };
}

test('explicit rig registry never silently maps unknown fighter to Supernariz', () => {
  const source = readFileSync('src/game/render/FighterRenderer.ts', 'utf8');
  assert.match(source, /const RIGS/);
  assert.match(source, /chameleon: drawChameleon/);
  assert.match(source, /supernariz: drawSupernariz/);
  assert.match(source, /drawMissingRig/);
  assert.doesNotMatch(source, /else drawSupernariz/);
});

test('move presentation reads readonly move geometry for low and air attacks', () => {
  const base = baseSnapshot().fighters[0];
  const low = {
    ...base,
    moveId: 'clawLow',
    moveFrame: 7,
    moveContact: 'none',
    ultimatePhase: 'idle',
  };
  const phase = getMovePresentationPhase(low);
  assert.equal(phase.active, 1);

  const rising = { ...base, grounded: false, y: 80, vy: 10, landingRecoveryFrames: 0 };
  const apex = { ...base, grounded: false, y: 140, vy: 0.5, landingRecoveryFrames: 0 };
  const falling = { ...base, grounded: false, y: 80, vy: -10, landingRecoveryFrames: 0 };
  assert.ok(getAirPresentationPose(rising).ascent > 0.7);
  assert.ok(getAirPresentationPose(apex).apex > 0.8);
  assert.ok(getAirPresentationPose(falling).descent > 0.7);

  for (const landingRecoveryFrames of [4, 3, 2, 1]) {
    const pose = getAirPresentationPose({ ...base, grounded: true, y: 0, vy: 0, landingRecoveryFrames });
    assert.equal(pose.landingFrame, landingRecoveryFrames);
    assert.ok(pose.landing > 0);
  }
});

test('same snapshot rendered once or four times does not age particles or shake', () => {
  const snapshot = hitSnapshot(10);
  const renderer = makeRenderer();
  renderer.consumeEvents(snapshot);
  renderer.render(snapshot, 0);
  const firstLife = renderer.particles[0].life;
  const firstShakeFrames = renderer.shakeFrames;

  renderer.render(snapshot, 1);
  renderer.render(snapshot, 2);
  renderer.render(snapshot, 3);

  assert.equal(renderer.particles[0].life, firstLife);
  assert.equal(renderer.shakeFrames, firstShakeFrames);

  renderer.render(noEventAt(snapshot, 11), 4);
  assert.equal(renderer.particles[0].life, firstLife - 1);
  assert.equal(renderer.shakeFrames, firstShakeFrames - 1);
});

test('same-frame event consumption is idempotent', () => {
  const snapshot = hitSnapshot(20);
  const renderer = makeRenderer();
  renderer.consumeEvents(snapshot);
  const once = renderer.particles.length;
  renderer.consumeEvents(snapshot);
  assert.equal(renderer.particles.length, once);
});

function runSchedule(repeatsPerSimulationFrame) {
  const first = hitSnapshot(30);
  const renderer = makeRenderer();
  renderer.consumeEvents(first);
  for (let frame = 30; frame <= 42; frame += 1) {
    const snapshot = frame === 30 ? first : noEventAt(first, frame);
    for (let repeat = 0; repeat < repeatsPerSimulationFrame; repeat += 1) {
      renderer.render(snapshot, repeat / 120);
    }
  }
  const particle = renderer.particles[0];
  return {
    life: particle?.life ?? 0,
    x: particle?.x ?? 0,
    y: particle?.y ?? 0,
    vx: particle?.vx ?? 0,
    vy: particle?.vy ?? 0,
    shakeFrames: renderer.shakeFrames,
  };
}

test('30/60/120-style render schedules preserve simulation-aligned transient state', () => {
  assert.deepEqual(runSchedule(1), runSchedule(2));
  assert.deepEqual(runSchedule(1), runSchedule(4));
});

test('render path does not mutate authoritative snapshot state', () => {
  const snapshot = hitSnapshot(50);
  const before = structuredClone(snapshot);
  const renderer = makeRenderer();
  renderer.consumeEvents(snapshot);
  renderer.render(snapshot, 0);
  assert.deepEqual(snapshot, before);
});

test('ultimate source and release events own finisher/launch feedback', () => {
  const source = readFileSync('src/game/render/FightRenderer.ts', 'utf8');
  assert.match(source, /event\.source === 'ultimate'/);
  assert.match(source, /event\.finisher/);
  assert.match(source, /event\.type === 'ultimate-release'/);
  assert.match(source, /ultimateReleaseTrails/);
  assert.doesNotMatch(source, /attacker\.ultimatePhase === 'sequence'/);
});

test('renderer remains procedural, bounded and raster-fighter free', () => {
  const files = [
    'src/game/render/ChameleonRig.ts',
    'src/game/render/SupernarizRig.ts',
    'src/game/render/FighterRenderer.ts',
    'src/game/render/FightRenderer.ts',
    'src/game/render/CombatEffects.ts',
  ];
  const source = files.map((file) => readFileSync(file, 'utf8')).join('\n');
  for (const banned of ['new Image(', 'drawImage(', '.png', '.jpg', '.jpeg', 'spritesheet']) {
    assert.equal(source.includes(banned), false, `forbidden runtime raster token: ${banned}`);
  }
  assert.match(source, /const maxParticles = 120/);
  assert.match(source, /ultimateFlashes\.length > 6/);
  assert.match(source, /ultimateReleaseTrails\.length > 6/);
});
