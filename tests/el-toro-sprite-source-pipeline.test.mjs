import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const sourceDir = resolve('docs/characters/el-toro/sprite-source/right');
const scriptPath = resolve('scripts/el-toro-sprite-source-pipeline.mjs');

test('V07-SPR-MA validates and normalizes the admitted El Toro right-facing source set', async () => {
  assert.ok(existsSync(scriptPath), 'sprite-source pipeline tool must exist before source validation can pass');

  const pipeline = await import(pathToFileURL(scriptPath).href);
  assert.equal(typeof pipeline.generateSpriteSourceEvidence, 'function');

  const outDir = mkdtempSync(join(tmpdir(), 'el-toro-sprite-source-'));
  const report = pipeline.generateSpriteSourceEvidence({ sourceDir, outDir });

  assert.equal(report.acceptedSheetCount, 17);
  assert.equal(report.masterFrameCount, 1);
  assert.equal(report.bodyFrameCount, 84);
  assert.equal(report.fxFrameCount, 22);
  assert.equal(report.totalPreviewFrames, 107);

  assert.deepEqual(report.hashMismatches, []);
  assert.equal(report.rejectedAlternatePresent, false);
  assert.deepEqual(report.emptyFrames, []);
  assert.deepEqual(report.canvasEdgeClipping, []);
  assert.deepEqual(report.unsupportedPngs, []);

  assert.ok(report.sheets.every((sheet) => sheet.hasTransparentPixels));
  assert.ok(report.sheets.every((sheet) => sheet.hasVisiblePixels));
  assert.ok(report.sheets.every((sheet) => sheet.extractedFrames === sheet.expectedFrames));

  assert.ok(report.normalization.body.sharedScale > 0);
  assert.equal(report.normalization.body.anchor, 'bottom-center');
  assert.equal(report.normalization.body.groundPivot.x, 160);
  assert.equal(report.normalization.body.groundPivot.y, 300);
  assert.ok(report.normalization.fx.sharedScale > 0);
  assert.equal(report.normalization.fx.anchor, 'center');

  const manifestPath = join(outDir, 'NORMALIZATION_MANIFEST.json');
  const previewPath = join(outDir, 'NORMALIZED_PREVIEW.svg');
  assert.ok(existsSync(manifestPath));
  assert.ok(existsSync(previewPath));

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  assert.equal(manifest.contractVersion, 1);
  assert.equal(manifest.fighterId, 'el-toro');
  assert.equal(manifest.facing, 'right');
  assert.equal(manifest.shippingStatus, 'pilot-only-left-facing-blocked');
  assert.equal(manifest.frames.length, 107);
  assert.ok(manifest.frames.filter((frame) => frame.kind === 'body').every((frame) => frame.normalized.scale === manifest.normalization.body.sharedScale));
  assert.ok(manifest.frames.filter((frame) => frame.kind === 'body').every((frame) => frame.normalized.pivotY === manifest.normalization.body.groundPivot.y));

  const preview = readFileSync(previewPath, 'utf8');
  assert.match(preview, /El Toro right-facing normalized source preview/);
  assert.equal((preview.match(/data-frame-id=/g) ?? []).length, 107);
});
