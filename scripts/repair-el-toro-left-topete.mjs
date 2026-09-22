import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { parseRgbaPng } from './sprite-png-alpha.mjs';
import { extractFramesByComponents } from './sprite-component-extractor.mjs';

const SOURCE = 'docs/characters/el-toro/sprite-source/left/el-toro__LEFT-IMG-10__topete.png';
const CONFIG = 'scripts/sprite-source-config.mjs';
const RECEIPT = 'docs/characters/el-toro/sprite-source/left/LEFT_SOURCE_HASHES.json';
const ALPHA_SEED = 160;
const BOTTOM_Y = 512;
const RIGHT_SHIFT = 128;
const PNG_SIGNATURE = Buffer.from([137,80,78,71,13,10,26,10]);

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function alphaAt(image, index) {
  return image.rgba[index * 4 + 3];
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])), 0);
  return Buffer.concat([length, typeBytes, data, crc]);
}

function encodeRgbaPng(width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  let src = 0;
  let dst = 0;
  for (let y = 0; y < height; y += 1) {
    raw[dst++] = 0;
    rgba.copy(raw, dst, src, src + stride);
    dst += stride;
    src += stride;
  }

  return Buffer.concat([
    PNG_SIGNATURE,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function majorBottomSeeds(image) {
  const { width: w, height: h } = image;
  if (h !== 1024 || w !== 1536) {
    throw new Error('LEFT-IMG-10 repair expects the admitted 1536x1024 source');
  }

  const total = w * h;
  const seen = new Uint8Array(total);
  const stack = new Int32Array(total);
  const components = [];

  for (let y = BOTTOM_Y; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const seed = y * w + x;
      if (seen[seed] || alphaAt(image, seed) < ALPHA_SEED) continue;

      let top = 0;
      stack[top++] = seed;
      seen[seed] = 1;
      const pixels = [];
      let sumX = 0;

      while (top > 0) {
        const index = stack[--top];
        const px = index % w;
        const py = Math.floor(index / w);
        pixels.push(index);
        sumX += px;

        for (let dy = -1; dy <= 1; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            if (dx === 0 && dy === 0) continue;
            const nx = px + dx;
            const ny = py + dy;
            if (nx < 0 || nx >= w || ny < BOTTOM_Y || ny >= h) continue;
            const next = ny * w + nx;
            if (seen[next] || alphaAt(image, next) < ALPHA_SEED) continue;
            seen[next] = 1;
            stack[top++] = next;
          }
        }
      }

      if (pixels.length > 50000) {
        components.push({ pixels, centerX: sumX / pixels.length });
      }
    }
  }

  components.sort((a, b) => a.centerX - b.centerX);
  if (components.length !== 4) {
    throw new Error('Expected four substantial bottom-row Topete pose seeds, got ' + components.length);
  }
  return components;
}

function repairTopete(image) {
  const { width: w, height: h } = image;
  const seeds = majorBottomSeeds(image);
  const total = w * h;
  const labels = new Int8Array(total);
  labels.fill(-1);
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;

  for (let label = 0; label < seeds.length; label += 1) {
    for (const index of seeds[label].pixels) {
      labels[index] = label;
      queue[tail++] = index;
    }
  }

  while (head < tail) {
    const index = queue[head++];
    const x = index % w;
    const y = Math.floor(index / w);
    const label = labels[index];

    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= w || ny < BOTTOM_Y || ny >= h) continue;
        const next = ny * w + nx;
        if (labels[next] >= 0 || alphaAt(image, next) === 0) continue;
        labels[next] = label;
        queue[tail++] = next;
      }
    }
  }

  const centers = seeds.map((seed) => seed.centerX);
  for (let y = BOTTOM_Y; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const index = y * w + x;
      if (alphaAt(image, index) === 0 || labels[index] >= 0) continue;
      let best = 0;
      let bestDistance = Infinity;
      for (let label = 0; label < centers.length; label += 1) {
        const distance = Math.abs(x - centers[label]);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = label;
        }
      }
      labels[index] = best;
    }
  }

  const outWidth = w + RIGHT_SHIFT;
  const out = Buffer.alloc(outWidth * h * 4);

  // Preserve the complete top row byte-for-byte in pixel space.
  for (let y = 0; y < BOTTOM_Y; y += 1) {
    image.rgba.copy(out, y * outWidth * 4, y * w * 4, (y + 1) * w * 4);
  }

  let visibleBefore = 0;
  let visibleAfter = 0;
  let collisions = 0;
  for (let y = BOTTOM_Y; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const sourceIndex = y * w + x;
      const sourceOffset = sourceIndex * 4;
      if (image.rgba[sourceOffset + 3] === 0) continue;
      visibleBefore += 1;

      const label = labels[sourceIndex];
      if (label < 0) throw new Error('Unassigned visible Topete pixel');
      const targetX = x + (label === 3 ? RIGHT_SHIFT : 0);
      const targetOffset = (y * outWidth + targetX) * 4;
      if (out[targetOffset + 3] !== 0) collisions += 1;
      image.rgba.copy(out, targetOffset, sourceOffset, sourceOffset + 4);
      visibleAfter += 1;
    }
  }

  if (visibleBefore !== visibleAfter || collisions !== 0) {
    throw new Error(
      'Topete repair must preserve each visible pixel exactly once: before=' +
      visibleBefore + ' after=' + visibleAfter + ' collisions=' + collisions,
    );
  }

  return { width: outWidth, height: h, rgba: out, visibleBefore, visibleAfter };
}

const original = parseRgbaPng(readFileSync(SOURCE));
const repaired = repairTopete(original);
const extraction = extractFramesByComponents(
  repaired,
  2,
  4,
  { contentAlpha: 32, clipAlpha: 128 },
);
const areas = extraction.frames.map((frame) => frame.area);
const sorted = [...areas].sort((a, b) => a - b);
const median = (sorted[3] + sorted[4]) / 2;

if (extraction.hardCanvasEdge.length !== 0) {
  throw new Error('Repaired LEFT-IMG-10 still has hard outer-edge clipping');
}
if (!areas.every((area) => area >= median * 0.30 && area <= median * 1.70)) {
  throw new Error('Repaired LEFT-IMG-10 slot occupancy still pathological: ' + JSON.stringify(areas));
}

const pngBytes = encodeRgbaPng(repaired.width, repaired.height, repaired.rgba);
const repositoryByteSha256 = sha256(pngBytes);
const decodedRgbaSha256 = sha256(repaired.rgba);
writeFileSync(SOURCE, pngBytes);

let config = readFileSync(CONFIG, 'utf8');
const configPattern = /(\['IMG-10','el-toro__LEFT-IMG-10__topete\.png',')[0-9a-f]{64}(',\s*'body',2,4,8\])/;
if (!configPattern.test(config)) {
  throw new Error('Could not locate LEFT-IMG-10 hash in sprite-source-config.mjs');
}
config = config.replace(configPattern, '$1' + repositoryByteSha256 + '$2');
writeFileSync(CONFIG, config);

const receipt = JSON.parse(readFileSync(RECEIPT, 'utf8'));
const row = receipt.sheets.find((sheet) => sheet.id === 'LEFT-IMG-10');
if (!row) throw new Error('LEFT_SOURCE_HASHES missing LEFT-IMG-10');
row.width = repaired.width;
row.height = repaired.height;
row.decodedRgbaSha256 = decodedRgbaSha256;
row.repositoryByteSha256 = repositoryByteSha256;
row.hardCanvasEdgePixels = 0;
writeFileSync(RECEIPT, JSON.stringify(receipt, null, 2) + '\n');

process.stdout.write(JSON.stringify({
  source: SOURCE,
  width: repaired.width,
  height: repaired.height,
  repositoryByteSha256,
  decodedRgbaSha256,
  visiblePixelsPreserved: repaired.visibleBefore,
  hardCanvasEdgePixels: extraction.hardCanvasEdge.length,
  slotAreas: areas,
}, null, 2) + '\n');
