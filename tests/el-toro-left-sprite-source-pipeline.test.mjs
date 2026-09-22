import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const sourceDir = resolve('docs/characters/el-toro/sprite-source/left');

test('V07-SPR-MA validates and normalizes the admitted El Toro left-facing source set', async () => {
  assert.ok(existsSync(sourceDir));
  const pipeline = await import('../scripts/el-toro-sprite-source-pipeline.mjs');
  const outDir = mkdtempSync(join(tmpdir(), 'el-toro-left-source-'));
  const report = pipeline.generateSpriteSourceEvidence({ sourceDir, outDir, facing: 'left' });

  assert.equal(report.acceptedSheetCount, 13);
  assert.equal(report.masterFrameCount, 1);
  assert.equal(report.bodyFrameCount, 84);
  assert.equal(report.fxFrameCount, 0);
  assert.equal(report.totalPreviewFrames, 85);
  assert.deepEqual(report.hashMismatches, []);
  assert.equal(report.rejectedAlternatePresent, false);
  assert.deepEqual(report.emptyFrames, []);
  assert.deepEqual(report.canvasEdgeClipping, []);
  assert.deepEqual(report.unsupportedPngs, []);
  assert.ok(report.sheets.every((sheet) => sheet.hasTransparentPixels));
  assert.ok(report.sheets.every((sheet) => sheet.hasVisiblePixels));
  assert.ok(report.sheets.every((sheet) => sheet.extractedFrames === sheet.expectedFrames));

  const manifest = JSON.parse(readFileSync(join(outDir, 'NORMALIZATION_MANIFEST.json'), 'utf8'));
  assert.equal(manifest.fighterId, 'el-toro');
  assert.equal(manifest.facing, 'left');
  assert.equal(manifest.shippingStatus, 'pilot-only-anchor-blocked');
  assert.equal(manifest.frames.length, 85);
  assert.equal(manifest.frames.filter((frame) => frame.sheetId === 'IMG-00').length, 1);
  assert.equal(manifest.frames.filter((frame) => /^IMG-(0[1-9]|1[0-2])$/.test(frame.sheetId)).length, 84);
  assert.equal(manifest.frames.filter((frame) => frame.kind === 'fx').length, 0);
  assert.ok(manifest.normalization.master.sharedScale > 0);
  assert.ok(manifest.normalization.body.sharedScale > 0);
  assert.equal(manifest.normalization.fx.sharedScale, 0);

  const preview = readFileSync(join(outDir, 'NORMALIZED_PREVIEW.svg'), 'utf8');
  assert.match(preview, /El Toro left-facing normalized source preview/);
  assert.equal((preview.match(/data-frame-id=/g) ?? []).length, 85);
});

test('V07-SPR-MA exposes 85 deterministic component-owned LEFT crops', async () => {
  const pipeline = await import('../scripts/el-toro-sprite-source-pipeline.mjs');
  const isolated = pipeline.generatePixelIsolatedFrameSet({ sourceDir, facing: 'left' });

  assert.equal(isolated.facing, 'left');
  assert.equal(isolated.isolationVersion, 'component-owned-rgba-v1');
  assert.equal(isolated.frames.length, 85);
  assert.equal(isolated.frames.filter((frame) => frame.sheetId === 'IMG-00').length, 1);
  assert.equal(isolated.frames.filter((frame) => /^IMG-(0[1-9]|1[0-2])$/.test(frame.sheetId)).length, 84);
  assert.equal(isolated.frames.filter((frame) => frame.kind === 'fx').length, 0);

  for (const frame of isolated.frames) {
    assert.ok(frame.bbox);
    assert.ok(frame.ownedPixelCount > 0);
    assert.equal(frame.rgba.length, frame.cropWidth * frame.cropHeight * 4);
  }
});
