import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { generateSpriteSourceEvidence } from '../scripts/el-toro-sprite-source-pipeline.mjs';

function overlaps(a, b) {
  return a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y;
}

test('El Toro extracted frame bboxes are mutually isolated before atlas crop/pack', () => {
  const outDir = mkdtempSync(join(tmpdir(), 'el-toro-mb-overlap-'));
  generateSpriteSourceEvidence({
    sourceDir: resolve('docs/characters/el-toro/sprite-source/right'),
    outDir,
  });

  const manifest = JSON.parse(readFileSync(join(outDir, 'NORMALIZATION_MANIFEST.json'), 'utf8'));
  const bySheet = new Map();

  for (const frame of manifest.frames) {
    if (frame.sheetId === 'IMG-00') continue;
    const list = bySheet.get(frame.sheetId) ?? [];
    list.push(frame);
    bySheet.set(frame.sheetId, list);
  }

  const overlapPairs = [];
  for (const [sheetId, frames] of bySheet.entries()) {
    for (let a = 0; a < frames.length; a += 1) {
      for (let b = a + 1; b < frames.length; b += 1) {
        if (!overlaps(frames[a].bbox, frames[b].bbox)) continue;
        overlapPairs.push({
          sheetId,
          first: frames[a].frameId,
          second: frames[b].frameId,
          firstBbox: frames[a].bbox,
          secondBbox: frames[b].bbox,
        });
      }
    }
  }

  console.log('V07-SPR-MB bbox-overlap-pairs', JSON.stringify(overlapPairs));
  assert.deepEqual(
    overlapPairs,
    [],
    'bbox-only crop/pack is unsafe while extracted frame rectangles overlap; require MA pixel-isolated extraction output',
  );
});
