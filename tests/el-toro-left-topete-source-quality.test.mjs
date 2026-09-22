import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseRgbaPng } from '../scripts/sprite-png-alpha.mjs';
import { extractFramesByComponents } from '../scripts/sprite-component-extractor.mjs';

const topetePath = resolve(
  'docs/characters/el-toro/sprite-source/left/el-toro__LEFT-IMG-10__topete.png',
);

function median(values) {
  const sorted = [...values].sort((a,b) => a-b);
  const middle = Math.floor(sorted.length/2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle-1] + sorted[middle]) / 2;
}

test('V07-SPR-MA LEFT Topete has one substantial authored body pose per expected slot', () => {
  const image = parseRgbaPng(readFileSync(topetePath));
  const extraction = extractFramesByComponents(
    image,
    2,
    4,
    { contentAlpha: 32, clipAlpha: 128 },
  );

  assert.equal(extraction.frames.length, 8);
  assert.deepEqual(extraction.hardCanvasEdge, []);

  const areas = extraction.frames.map((frame) => frame.area);
  const med = median(areas);

  assert.ok(
    areas.every((area) => area >= med * 0.30),
    'every Topete slot must carry substantial authored pose content; areas='+JSON.stringify(areas),
  );
  assert.ok(
    areas.every((area) => area <= med * 1.70),
    'no Topete slot may collapse two authored poses into one component group; areas='+JSON.stringify(areas),
  );
});
