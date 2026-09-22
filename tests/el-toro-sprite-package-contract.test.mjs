import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const PACKAGE_PATH = new URL('../docs/characters/el-toro/sprite-package/right-package.json', import.meta.url);
const REJECTED_SOURCE = '13F1BB3E-C57C-4649-B9E7-07664E5E8BE8.PNG';

const EXPECTED_BODY = Object.freeze({
  'IMG-01': { frames: 8, grid: [2, 4], semanticKey: 'idle' },
  'IMG-02': { frames: 8, grid: [2, 4], semanticKey: 'walk-forward' },
  'IMG-03': { frames: 8, grid: [2, 4], semanticKey: 'walk-back' },
  'IMG-04': { frames: 4, grid: [1, 4], semanticKey: 'crouch' },
  'IMG-05': { frames: 6, grid: [2, 3], semanticKey: 'jump' },
  'IMG-06': { frames: 6, grid: [2, 3], semanticKey: 'basic-attack' },
  'IMG-07': { frames: 6, grid: [2, 3], semanticKey: 'low-attack' },
  'IMG-08': { frames: 4, grid: [1, 4], semanticKey: 'block' },
  'IMG-09': { frames: 8, grid: [2, 4], semanticKey: 'hurt-knockdown' },
  'IMG-10': { frames: 8, grid: [2, 4], semanticKey: 'topete' },
  'IMG-11': { frames: 8, grid: [2, 4], semanticKey: 'shawarmazo' },
  'IMG-12': { frames: 10, grid: [2, 5], semanticKey: 'super-eructo' },
});

const EXPECTED_FX = Object.freeze({
  'FX-01': { frames: 4, grid: [1, 4], semanticKey: 'topete-impact' },
  'FX-02': { frames: 8, grid: [2, 4], semanticKey: 'shawarmazo-projectile' },
  'FX-03': { frames: 4, grid: [1, 4], semanticKey: 'shawarmazo-impact' },
  'FX-04': { frames: 6, grid: [2, 3], semanticKey: 'super-eructo-effect' },
});

const REQUIRED_ANCHORS = Object.freeze([
  'pivot',
  'head',
  'chest',
  'frontHand',
  'backHand',
  'belt',
  'frontFoot',
  'backFoot',
]);

function loadPackage() {
  assert.equal(existsSync(PACKAGE_PATH), true, 'right-facing package descriptor must exist');
  return JSON.parse(readFileSync(PACKAGE_PATH, 'utf8'));
}

function assertEntries(actual, expected, kind) {
  assert.equal(actual.length, Object.keys(expected).length, `${kind} entry count`);
  const seen = new Set();
  for (const entry of actual) {
    assert.equal(seen.has(entry.id), false, `duplicate ${kind} id ${entry.id}`);
    seen.add(entry.id);
    const contract = expected[entry.id];
    assert.ok(contract, `unexpected ${kind} id ${entry.id}`);
    assert.equal(entry.frames, contract.frames, `${entry.id} frame count`);
    assert.deepEqual(entry.grid, contract.grid, `${entry.id} grid`);
    assert.equal(entry.grid[0] * entry.grid[1], entry.frames, `${entry.id} grid capacity`);
    assert.equal(entry.semanticKey, contract.semanticKey, `${entry.id} semantic key`);
    assert.match(entry.source, /^docs\/characters\/el-toro\/sprite-source\/right\//);
    assert.equal(entry.source.includes(REJECTED_SOURCE), false, `${entry.id} must not use rejected source`);
    assert.equal(existsSync(new URL(`../${entry.source}`, import.meta.url)), true,
      `${entry.id} source must exist`);
  }
}

test('El Toro right-facing package maps exactly 84 contractual body frames', () => {
  const pkg = loadPackage();
  assert.equal(pkg.version, 1);
  assert.equal(pkg.fighterId, 'el-toro');
  assert.equal(pkg.facing, 'right');
  assert.equal(pkg.mirrorSafe, false);
  assert.equal(pkg.master.id, 'IMG-00');
  assert.match(pkg.master.source, /el-toro__IMG-00__master-seed\.png$/);

  assertEntries(pkg.body, EXPECTED_BODY, 'body');
  assert.equal(pkg.body.reduce((sum, entry) => sum + entry.frames, 0), 84);
});

test('El Toro package keeps identity FX separate from body frames', () => {
  const pkg = loadPackage();
  assertEntries(pkg.effects, EXPECTED_FX, 'effect');
  const bodySources = new Set(pkg.body.map((entry) => entry.source));
  for (const effect of pkg.effects) {
    assert.equal(bodySources.has(effect.source), false, `${effect.id} must remain separate from body`);
  }
});

test('El Toro package freezes anchor and facing requirements without inventing runtime mirroring', () => {
  const pkg = loadPackage();
  assert.deepEqual(pkg.normalization.requiredAnchors, REQUIRED_ANCHORS);
  assert.equal(pkg.normalization.pivotPolicy, 'bottom-center-per-frame');
  assert.equal(pkg.normalization.sharedScaleAcrossAnimation, true);
  assert.equal(pkg.runtimePolicy.sourceSheetsAllowed, false);
  assert.equal(pkg.runtimePolicy.leftFacingRequiredForShipping, true);
  assert.equal(pkg.runtimePolicy.horizontalMirrorAllowedForBodyShipping, false);
  assert.equal(pkg.shippingState, 'pilot-right-only');
});


test('El Toro package maps resolver states and kit roles without hardcoding unknown move IDs', () => {
  const pkg = loadPackage();
  assert.deepEqual(pkg.resolverMap.stateToSemantic, {
    idle: 'idle',
    crouch: 'crouch',
    'walk-forward': 'walk-forward',
    'walk-back': 'walk-back',
    'dash-forward': 'walk-forward',
    'dash-back': 'walk-back',
    'jump-startup': 'jump',
    'jump-ascent': 'jump',
    'jump-apex': 'jump',
    'jump-descent': 'jump',
    land: 'jump',
    block: 'block',
    'block-crouch': 'block',
    hurt: 'hurt-knockdown',
    'guard-break': 'hurt-knockdown',
    knockdown: 'hurt-knockdown',
    captured: 'hurt-knockdown',
  });
  assert.deepEqual(pkg.resolverMap.moveRoleToSemantic, {
    standing: 'basic-attack',
    chain: 'topete',
    low: 'low-attack',
    air: 'jump',
    closeSpecial: 'topete',
    rangedSpecial: 'shawarmazo',
    ultimate: 'super-eructo',
  });
  assert.equal(pkg.resolverMap.moveKeyPolicy, 'derive-from-fighter-kit-at-integration');
  assert.equal(pkg.resolverMap.ultimatePhasePolicy, 'derive-from-fighter-kit-ultimate-at-integration');

  const semanticKeys = new Set(pkg.body.map((entry) => entry.semanticKey));
  for (const semantic of Object.values(pkg.resolverMap.stateToSemantic)) {
    assert.equal(semanticKeys.has(semantic), true, `resolver state maps to unknown semantic ${semantic}`);
  }
  for (const semantic of Object.values(pkg.resolverMap.moveRoleToSemantic)) {
    assert.equal(semanticKeys.has(semantic), true, `move role maps to unknown semantic ${semantic}`);
  }
});


test('El Toro resolver-role map covers every frozen V0.7 move role without missing runtime keys', () => {
  const pkg = loadPackage();
  assert.deepEqual(pkg.resolverMap.moveRoleToSemantic, {
    standing: 'basic-attack',
    chain: 'topete',
    low: 'low-attack',
    air: 'jump',
    closeSpecial: 'topete',
    rangedSpecial: 'shawarmazo',
    ultimate: 'super-eructo',
  });
  assert.deepEqual(pkg.resolverMap.pilotAliases, {
    chain: {
      semanticKey: 'topete',
      rationale: 'procedural toroShoulder is a shoulder/lean body drive closest to IMG-10 Topete body language',
      requiresGameplayScaleReview: true,
    },
    air: {
      semanticKey: 'jump',
      rationale: 'procedural toroAir is primarily an airborne leg/posture variation closest to IMG-05 Jump',
      requiresGameplayScaleReview: true,
    },
  });
});

test('Super Eructo maps the contractual 10-frame sheet to the reachable forwardBlast phases', () => {
  const pkg = loadPackage();
  assert.deepEqual(pkg.resolverMap.ultimatePhaseWindows, {
    startup: { semanticKey: 'super-eructo', firstFrame: 1, lastFrame: 4 },
    capture: { semanticKey: 'super-eructo', firstFrame: 5, lastFrame: 7 },
    recovery: { semanticKey: 'super-eructo', firstFrame: 8, lastFrame: 10 },
  });
  assert.equal(pkg.resolverMap.unreachableUltimatePhase, 'sequence');
});


test('El Toro presentation retiming preserves authoritative move lengths and contact/release beats', () => {
  const pkg = loadPackage();
  const timings = pkg.resolverMap.moveRoleTimings;

  assert.deepEqual(timings.standing, {
    semanticKey: 'basic-attack',
    totalTicks: 22,
    frameDurations: [3, 3, 2, 1, 6, 7],
    authoredBeat: { kind: 'active', startTick: 6, endTick: 8, visualFrames: [3, 4] },
  });
  assert.deepEqual(timings.chain, {
    semanticKey: 'topete',
    totalTicks: 28,
    frameDurations: [3, 4, 2, 2, 3, 4, 5, 5],
    authoredBeat: { kind: 'active', startTick: 7, endTick: 10, visualFrames: [3, 4] },
  });
  assert.deepEqual(timings.low, {
    semanticKey: 'low-attack',
    totalTicks: 28,
    frameDurations: [4, 4, 2, 1, 8, 9],
    authoredBeat: { kind: 'active', startTick: 8, endTick: 10, visualFrames: [3, 4] },
  });
  assert.deepEqual(timings.air, {
    semanticKey: 'jump',
    totalTicks: 26,
    frameDurations: [3, 3, 3, 2, 7, 8],
    authoredBeat: { kind: 'active', startTick: 6, endTick: 10, visualFrames: [3, 4] },
  });
  assert.deepEqual(timings.closeSpecial, {
    semanticKey: 'topete',
    totalTicks: 42,
    frameDurations: [4, 4, 2, 3, 4, 4, 10, 11],
    authoredBeat: { kind: 'active', startTick: 10, endTick: 16, visualFrames: [4, 5] },
  });
  assert.deepEqual(timings.rangedSpecial, {
    semanticKey: 'shawarmazo',
    totalTicks: 41,
    frameDurations: [4, 4, 5, 1, 5, 6, 8, 8],
    authoredBeat: { kind: 'spawn', tick: 13, visualFrame: 4 },
  });

  for (const timing of Object.values(timings)) {
    assert.equal(
      timing.frameDurations.reduce((sum, ticks) => sum + ticks, 0),
      timing.totalTicks,
      `${timing.semanticKey} presentation durations must sum to authoritative move length`,
    );
  }
});

test('Super Eructo phase retiming exactly matches forwardBlast authoritative phase lengths', () => {
  const pkg = loadPackage();
  assert.deepEqual(pkg.resolverMap.ultimatePhaseTimings, {
    startup: { totalTicks: 26, frameDurations: [6, 6, 7, 7] },
    capture: { totalTicks: 18, frameDurations: [6, 6, 6] },
    recovery: { totalTicks: 30, frameDurations: [10, 10, 10] },
  });
  for (const timing of Object.values(pkg.resolverMap.ultimatePhaseTimings)) {
    assert.equal(timing.frameDurations.reduce((sum, ticks) => sum + ticks, 0), timing.totalTicks);
  }
});


test('El Toro runtime state keys map to contractual frame windows without hidden aliases', () => {
  const pkg = loadPackage();
  assert.deepEqual(pkg.resolverMap.runtimeStateWindows, {
    idle: { semanticKey: 'idle', firstFrame: 1, lastFrame: 8, loop: true },
    crouch: { semanticKey: 'crouch', firstFrame: 1, lastFrame: 4, loop: false },
    'walk-forward': { semanticKey: 'walk-forward', firstFrame: 1, lastFrame: 8, loop: true },
    'walk-back': { semanticKey: 'walk-back', firstFrame: 1, lastFrame: 8, loop: true },
    'dash-forward': {
      semanticKey: 'walk-forward', firstFrame: 1, lastFrame: 8, loop: false,
      requiresGameplayScaleReview: true,
    },
    'dash-back': {
      semanticKey: 'walk-back', firstFrame: 1, lastFrame: 8, loop: false,
      requiresGameplayScaleReview: true,
    },
    'jump-startup': { semanticKey: 'jump', firstFrame: 1, lastFrame: 2, loop: false },
    'jump-ascent': { semanticKey: 'jump', firstFrame: 2, lastFrame: 3, loop: false },
    'jump-apex': { semanticKey: 'jump', firstFrame: 4, lastFrame: 4, loop: false },
    'jump-descent': { semanticKey: 'jump', firstFrame: 5, lastFrame: 6, loop: false },
    land: { semanticKey: 'jump', firstFrame: 6, lastFrame: 6, loop: false },
    block: { semanticKey: 'block', firstFrame: 1, lastFrame: 4, loop: false },
    'block-crouch': {
      semanticKey: 'block', firstFrame: 1, lastFrame: 4, loop: false,
      requiresGameplayScaleReview: true,
    },
    hurt: { semanticKey: 'hurt-knockdown', firstFrame: 1, lastFrame: 4, loop: false },
    'guard-break': {
      semanticKey: 'hurt-knockdown', firstFrame: 1, lastFrame: 4, loop: false,
      requiresGameplayScaleReview: true,
    },
    knockdown: { semanticKey: 'hurt-knockdown', firstFrame: 5, lastFrame: 8, loop: false },
    captured: {
      semanticKey: 'hurt-knockdown', firstFrame: 4, lastFrame: 4, loop: false,
      requiresGameplayScaleReview: true,
    },
  });

  assert.deepEqual(
    Object.keys(pkg.resolverMap.runtimeStateWindows).sort(),
    Object.keys(pkg.resolverMap.stateToSemantic).sort(),
    'every non-move resolver state must have an explicit frame-window policy',
  );
});

test('El Toro package pins the frozen V0.7 move IDs used to compile runtime manifest keys', () => {
  const pkg = loadPackage();
  assert.deepEqual(pkg.resolverMap.expectedMoveIdsByRole, {
    standing: 'toroJab',
    chain: 'toroShoulder',
    low: 'toroLow',
    air: 'toroAir',
    closeSpecial: 'topete',
    rangedSpecial: 'shawarmazoThrow',
    ultimate: 'superEructo',
  });
  assert.equal(pkg.resolverMap.moveKeyPolicy, 'verify-frozen-character-content-at-integration');
  assert.equal(pkg.resolverMap.ultimatePhasePolicy, 'compile-superEructo-forwardBlast-phases-at-integration');
});
