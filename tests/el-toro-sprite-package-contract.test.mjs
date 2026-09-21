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
    assert.equal(existsSync(new URL(`../${entry.source.replace(/^docs\//, '')}`, new URL('../docs/', import.meta.url))), true,
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
