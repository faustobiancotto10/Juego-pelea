import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { BODY_CANVAS } from '../scripts/sprite-source-config.mjs';

const sourceDir = resolve('docs/characters/el-toro/sprite-source/right');

function alphaPixels(rgba, threshold = 32) {
  let count = 0;
  for (let i = 3; i < rgba.length; i += 4) {
    if (rgba[i] >= threshold) count += 1;
  }
  return count;
}

function overlaps(a, b) {
  return (
    a.x < b.x + b.width
    && a.x + a.width > b.x
    && a.y < b.y + b.height
    && a.y + a.height > b.y
  );
}

test('V07-SPR-MA exposes deterministic pixel-isolated crops for all admitted frames', async () => {
  const pipeline = await import('../scripts/el-toro-sprite-source-pipeline.mjs');
  assert.equal(
    typeof pipeline.generatePixelIsolatedFrameSet,
    'function',
    'Mario-B needs an MA-owned pixel-isolation API rather than bbox-only crops',
  );

  const isolated = pipeline.generatePixelIsolatedFrameSet({ sourceDir });
  assert.equal(isolated.frames.length, 107);
  assert.equal(isolated.frames.filter((frame) => frame.sheetId === 'IMG-00').length, 1);
  assert.equal(isolated.frames.filter((frame) => /^IMG-(0[1-9]|1[0-2])$/.test(frame.sheetId)).length, 84);
  assert.equal(isolated.frames.filter((frame) => frame.kind === 'fx').length, 22);

  for (const frame of isolated.frames) {
    assert.ok(frame.bbox);
    assert.equal(frame.cropWidth, frame.bbox.width);
    assert.equal(frame.cropHeight, frame.bbox.height);
    assert.equal(frame.rgba.length, frame.cropWidth * frame.cropHeight * 4);
    assert.equal(alphaPixels(frame.rgba), frame.ownedPixelCount);
    assert.ok(frame.ownedPixelCount > 0);
  }

  const bySheet = new Map();
  for (const frame of isolated.frames) {
    const list = bySheet.get(frame.sheetId) ?? [];
    list.push(frame);
    bySheet.set(frame.sheetId, list);
  }

  let overlappingPairs = 0;
  for (const frames of bySheet.values()) {
    for (let i = 0; i < frames.length; i += 1) {
      for (let j = i + 1; j < frames.length; j += 1) {
        if (overlaps(frames[i].bbox, frames[j].bbox)) overlappingPairs += 1;
      }
    }
  }
  assert.ok(overlappingPairs > 0, 'fixture must exercise overlapping bboxes');
});

test('V07-SPR-MA runtime body scale excludes IMG-00 and keeps a separate master review domain', async () => {
  const { generateSpriteSourceEvidence } = await import('../scripts/el-toro-sprite-source-pipeline.mjs');
  const outDir = mkdtempSync(join(tmpdir(), 'el-toro-ma-scale-'));
  generateSpriteSourceEvidence({ sourceDir, outDir });
  const manifest = JSON.parse(readFileSync(join(outDir, 'NORMALIZATION_MANIFEST.json'), 'utf8'));

  const master = manifest.frames.filter((frame) => frame.sheetId === 'IMG-00');
  const body = manifest.frames.filter((frame) => /^IMG-(0[1-9]|1[0-2])$/.test(frame.sheetId));
  assert.equal(master.length, 1);
  assert.equal(master[0].kind, 'master');
  assert.equal(body.length, 84);
  assert.ok(body.every((frame) => frame.kind === 'body'));

  const maxWidth = Math.max(...body.map((frame) => frame.bbox.width));
  const maxHeight = Math.max(...body.map((frame) => frame.bbox.height));
  const expectedBodyScale = Math.min(
    (BODY_CANVAS.width - BODY_CANVAS.margin * 2) / maxWidth,
    (BODY_CANVAS.pivotY - BODY_CANVAS.margin) / maxHeight,
  );

  assert.ok(manifest.normalization.master.sharedScale > 0);
  assert.ok(manifest.normalization.body.sharedScale > manifest.normalization.master.sharedScale);
  assert.ok(Math.abs(manifest.normalization.body.sharedScale - expectedBodyScale) < 1e-8);
  assert.ok(body.every((frame) => frame.normalized.scale === manifest.normalization.body.sharedScale));
  assert.equal(master[0].normalized.scale, manifest.normalization.master.sharedScale);
});
