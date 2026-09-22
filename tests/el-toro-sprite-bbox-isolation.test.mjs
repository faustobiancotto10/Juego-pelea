import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { generateSpriteSourceEvidence } from '../scripts/el-toro-sprite-source-pipeline.mjs';
import {
  analyzeMasterSeedScaleInfluence,
  assertMasterSeedDoesNotConstrainRuntimeBodyScale,
  assertPixelSafePackingInputs,
  findOverlappingFrameBboxes,
} from '../scripts/el-toro-sprite-package-builder.mjs';

function generatedManifest() {
  const outDir = mkdtempSync(join(tmpdir(), 'el-toro-mb-overlap-'));
  generateSpriteSourceEvidence({
    sourceDir: resolve('docs/characters/el-toro/sprite-source/right'),
    outDir,
  });
  return JSON.parse(readFileSync(join(outDir, 'NORMALIZATION_MANIFEST.json'), 'utf8'));
}

test('El Toro package guard refuses bbox-only packing when MA frames are not pixel-isolated', () => {
  const manifest = generatedManifest();
  const overlaps = findOverlappingFrameBboxes(manifest);
  console.log('V07-SPR-MB bbox-overlap-pairs', JSON.stringify(overlaps));

  if (overlaps.length === 0) {
    assert.doesNotThrow(() => assertPixelSafePackingInputs(manifest));
    return;
  }

  assert.throws(
    () => assertPixelSafePackingInputs(manifest),
    /requires pixel-isolated MA frame outputs/,
  );

  const implicated = [...new Set(overlaps.flatMap((pair) => [pair.first, pair.second]))];
  assert.doesNotThrow(() =>
    assertPixelSafePackingInputs(manifest, { isolatedFrameIds: implicated }),
  );
});

test('packing guard detects overlap independently of the current El Toro source revision', () => {
  const synthetic = {
    frames: [
      { frameId: 'A', sheetId: 'IMG-X', bbox: { x: 0, y: 0, width: 20, height: 20 } },
      { frameId: 'B', sheetId: 'IMG-X', bbox: { x: 15, y: 5, width: 20, height: 20 } },
      { frameId: 'C', sheetId: 'IMG-X', bbox: { x: 80, y: 80, width: 10, height: 10 } },
    ],
  };

  const overlaps = findOverlappingFrameBboxes(synthetic);
  assert.deepEqual(overlaps.map(({ first, second }) => [first, second]), [['A', 'B']]);
  assert.throws(
    () => assertPixelSafePackingInputs(synthetic),
    /pixel-isolated MA frame outputs/,
  );
  assert.doesNotThrow(() =>
    assertPixelSafePackingInputs(synthetic, { isolatedFrameIds: ['A', 'B'] }),
  );
});


test('El Toro package guard rejects normalization when IMG-00 Master Seed shrinks runtime body sprites', () => {
  const manifest = generatedManifest();
  const diagnostic = analyzeMasterSeedScaleInfluence(manifest);
  console.log('V07-SPR-MB master-scale-diagnostic', JSON.stringify(diagnostic));

  if (diagnostic.masterConstrainsRuntimeScale) {
    assert.throws(
      () => assertMasterSeedDoesNotConstrainRuntimeBodyScale(manifest),
      /Master Seed/,
    );
    return;
  }

  assert.doesNotThrow(() => assertMasterSeedDoesNotConstrainRuntimeBodyScale(manifest));
});
