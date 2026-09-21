import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { SHEETS } from '../scripts/sprite-source-config.mjs';
import { gridRect, parseRgbaPng } from '../scripts/sprite-png-alpha.mjs';

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

  console.log('V07-SPR-MA diagnostics', JSON.stringify({ canvasEdgeClipping: report.canvasEdgeClipping, cellBoundaryTouches: report.cellBoundaryTouches, sheets: report.sheets.map(({ id, width, height, expectedFrames, extractedFrames }) => ({ id, width, height, expectedFrames, extractedFrames })) }));
  const edgeAlpha = SHEETS.map((spec) => {
    const image = parseRgbaPng(readFileSync(join(sourceDir, spec.file)));
    const values = [];
    for (let x = 0; x < image.width; x += 1) {
      values.push(image.rgba[x * 4 + 3]);
      values.push(image.rgba[((image.height - 1) * image.width + x) * 4 + 3]);
    }
    for (let y = 1; y < image.height - 1; y += 1) {
      values.push(image.rgba[(y * image.width) * 4 + 3]);
      values.push(image.rgba[(y * image.width + image.width - 1) * 4 + 3]);
    }
    return {
      id: spec.id,
      max: Math.max(...values),
      nonzero: values.filter((v) => v > 0).length,
      gt8: values.filter((v) => v > 8).length,
      gt32: values.filter((v) => v > 32).length,
      gt128: values.filter((v) => v > 128).length,
      total: values.length,
    };
  });
  console.log('V07-SPR-MA edge-alpha', JSON.stringify(edgeAlpha));
  const cellEdgeAlpha = [];
  for (const spec of SHEETS) {
    if (spec.id === 'IMG-00') continue;
    const image = parseRgbaPng(readFileSync(join(sourceDir, spec.file)));
    for (let row = 0; row < spec.rows; row += 1) {
      for (let col = 0; col < spec.cols; col += 1) {
        const rect = gridRect(image, spec.rows, spec.cols, row, col);
        const values = [];
        const x2 = rect.x + rect.width - 1;
        const y2 = rect.y + rect.height - 1;
        for (let x = rect.x; x <= x2; x += 1) {
          values.push(image.rgba[(rect.y * image.width + x) * 4 + 3]);
          values.push(image.rgba[(y2 * image.width + x) * 4 + 3]);
        }
        for (let y = rect.y + 1; y < y2; y += 1) {
          values.push(image.rgba[(y * image.width + rect.x) * 4 + 3]);
          values.push(image.rgba[(y * image.width + x2) * 4 + 3]);
        }
        cellEdgeAlpha.push({ id: spec.id + '__f' + String(row * spec.cols + col + 1).padStart(2, '0'), max: Math.max(...values), solid: values.filter((v) => v > 128).length, boundaryPixels: values.length });
      }
    }
  }
  console.log('V07-SPR-MA cell-edge-alpha', JSON.stringify({
    gt0: cellEdgeAlpha.filter((v) => v.max > 0).length,
    gt8: cellEdgeAlpha.filter((v) => v.max > 8).length,
    gt32: cellEdgeAlpha.filter((v) => v.max > 32).length,
    gt128: cellEdgeAlpha.filter((v) => v.max > 128).length,
    gt32Frames: cellEdgeAlpha.filter((v) => v.max > 32),
    gt128Frames: cellEdgeAlpha.filter((v) => v.max > 128),
    highestSolid: [...cellEdgeAlpha].sort((a, b) => b.solid - a.solid).slice(0, 30),
  }));

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
