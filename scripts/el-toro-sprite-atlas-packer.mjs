import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { deflateSync } from 'node:zlib';
import { generatePixelIsolatedFrameSet } from './el-toro-sprite-source-pipeline.mjs';
import { buildNormalization, normalizedTransform } from './sprite-normalize-contract.mjs';
import {
  compileEffectFrameSourcePlan,
  compileRuntimeFrameSourcePlan,
} from './el-toro-sprite-package-builder.mjs';

const PNG_SIGNATURE = Buffer.from([137,80,78,71,13,10,26,10]);

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
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function samplePremultiplied(rgba, width, height, x, y) {
  const ix = clamp(x, 0, width - 1);
  const iy = clamp(y, 0, height - 1);
  const offset = (iy * width + ix) * 4;
  const alpha = rgba[offset + 3] / 255;
  return {
    r: rgba[offset] * alpha,
    g: rgba[offset + 1] * alpha,
    b: rgba[offset + 2] * alpha,
    a: alpha,
  };
}

function resampleRgbaBilinear(source, sourceWidth, sourceHeight, targetWidth, targetHeight) {
  if (sourceWidth === targetWidth && sourceHeight === targetHeight) return Buffer.from(source);

  const out = Buffer.alloc(targetWidth * targetHeight * 4);
  const sx = sourceWidth / targetWidth;
  const sy = sourceHeight / targetHeight;

  for (let y = 0; y < targetHeight; y += 1) {
    const sourceY = (y + 0.5) * sy - 0.5;
    const y0 = Math.floor(sourceY);
    const y1 = y0 + 1;
    const fy = sourceY - y0;

    for (let x = 0; x < targetWidth; x += 1) {
      const sourceX = (x + 0.5) * sx - 0.5;
      const x0 = Math.floor(sourceX);
      const x1 = x0 + 1;
      const fx = sourceX - x0;

      const p00 = samplePremultiplied(source, sourceWidth, sourceHeight, x0, y0);
      const p10 = samplePremultiplied(source, sourceWidth, sourceHeight, x1, y0);
      const p01 = samplePremultiplied(source, sourceWidth, sourceHeight, x0, y1);
      const p11 = samplePremultiplied(source, sourceWidth, sourceHeight, x1, y1);

      const w00 = (1 - fx) * (1 - fy);
      const w10 = fx * (1 - fy);
      const w01 = (1 - fx) * fy;
      const w11 = fx * fy;

      const a = p00.a*w00 + p10.a*w10 + p01.a*w01 + p11.a*w11;
      const r = p00.r*w00 + p10.r*w10 + p01.r*w01 + p11.r*w11;
      const g = p00.g*w00 + p10.g*w10 + p01.g*w01 + p11.g*w11;
      const b = p00.b*w00 + p10.b*w10 + p01.b*w01 + p11.b*w11;

      const offset = (y * targetWidth + x) * 4;
      if (a <= 1e-8) {
        out[offset] = 0;
        out[offset + 1] = 0;
        out[offset + 2] = 0;
        out[offset + 3] = 0;
      } else {
        out[offset] = Math.round(clamp(r / a, 0, 255));
        out[offset + 1] = Math.round(clamp(g / a, 0, 255));
        out[offset + 2] = Math.round(clamp(b / a, 0, 255));
        out[offset + 3] = Math.round(clamp(a * 255, 0, 255));
      }
    }
  }

  return out;
}

function nextPowerOfTwo(value) {
  let result = 1;
  while (result < value) result *= 2;
  return result;
}

function prepareNormalizedFrames(frames, normalization) {
  return frames.map((frame) => {
    const normalized = normalizedTransform(frame, normalization);
    const width = Math.max(1, Math.round(normalized.width));
    const height = Math.max(1, Math.round(normalized.height));
    const rgba = resampleRgbaBilinear(
      frame.rgba,
      frame.cropWidth,
      frame.cropHeight,
      width,
      height,
    );
    const relativePivotX = normalized.pivotX - normalized.x;
    const relativePivotY = normalized.pivotY - normalized.y;
    return {
      frameId: frame.frameId,
      width,
      height,
      rgba,
      pivotX: Number((relativePivotX * width / normalized.width).toFixed(4)),
      pivotY: Number((relativePivotY * height / normalized.height).toFixed(4)),
    };
  });
}

function packFrames(frames, { maxWidth = 2048, padding = 2 } = {}) {
  const totalArea = frames.reduce(
    (sum, frame) => sum + (frame.width + padding * 2) * (frame.height + padding * 2),
    0,
  );
  const widest = Math.max(...frames.map((frame) => frame.width + padding * 2));
  const target = Math.ceil(Math.sqrt(totalArea * 1.25));
  const atlasWidth = Math.min(maxWidth, nextPowerOfTwo(Math.max(widest, target)));

  const placements = [];
  let x = padding;
  let y = padding;
  let rowHeight = 0;

  for (const frame of frames) {
    if (x + frame.width + padding > atlasWidth) {
      x = padding;
      y += rowHeight + padding;
      rowHeight = 0;
    }
    placements.push({ frame, x, y });
    x += frame.width + padding;
    rowHeight = Math.max(rowHeight, frame.height);
  }

  const atlasHeight = y + rowHeight + padding;
  const rgba = Buffer.alloc(atlasWidth * atlasHeight * 4);
  const frameRects = new Map();

  for (const placement of placements) {
    const { frame } = placement;
    for (let row = 0; row < frame.height; row += 1) {
      const srcStart = row * frame.width * 4;
      const srcEnd = srcStart + frame.width * 4;
      const dstStart = ((placement.y + row) * atlasWidth + placement.x) * 4;
      frame.rgba.copy(rgba, dstStart, srcStart, srcEnd);
    }
    frameRects.set(frame.frameId, {
      x: placement.x,
      y: placement.y,
      width: frame.width,
      height: frame.height,
      pivotX: frame.pivotX,
      pivotY: frame.pivotY,
    });
  }

  return {
    width: atlasWidth,
    height: atlasHeight,
    rgba,
    frameRects,
  };
}

function runtimeDurationsFor(packageContract, key, sourcePlanAnimation) {
  if (sourcePlanAnimation.durationTicks !== null) {
    return [...sourcePlanAnimation.durationTicks];
  }

  const timing = packageContract.resolverMap.runtimeStateTimings?.[key];
  if (!timing) throw new Error('Missing El Toro runtime state timing for '+key);
  if (timing.frameDurations.length !== sourcePlanAnimation.sourceFrameIds.length) {
    throw new Error('El Toro runtime state timing length mismatch for '+key);
  }
  return [...timing.frameDurations];
}

function buildRuntimeFragment(packageContract, sourcePlan, frameRects) {
  const animations = {};
  for (const [key, animation] of Object.entries(sourcePlan.animations)) {
    const durations = runtimeDurationsFor(packageContract, key, animation);
    animations[key] = {
      loop: animation.loop,
      frames: animation.sourceFrameIds.map((frameId, index) => {
        const rect = frameRects.get(frameId);
        if (!rect) throw new Error('Missing packed El Toro body frame '+frameId);
        return {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          pivotX: rect.pivotX,
          pivotY: rect.pivotY,
          durationTicks: durations[index],
        };
      }),
    };
  }

  return {
    version: 1,
    fighterId: 'el-toro',
    facing: 'right',
    atlas: 'right-body.png',
    mirrorSafe: false,
    runtimeLoadable: false,
    leftAnimationsRequired: true,
    blockingGates: [
      'authored-left-facing-animations',
      'verified-attachment-anchors',
      'transition-clock-crouch-block-block-crouch',
    ],
    animations,
  };
}

export function buildElToroRightAtlasPackage({
  sourceDir,
  packageContractPath,
  outDir,
}) {
  const sourceRoot = resolve(sourceDir);
  const outputRoot = resolve(outDir);
  const packageContract = JSON.parse(readFileSync(resolve(packageContractPath), 'utf8'));
  mkdirSync(outputRoot, { recursive: true });

  const isolated = generatePixelIsolatedFrameSet({ sourceDir: sourceRoot });
  const normalization = buildNormalization(isolated.frames);
  const manifestLike = {
    frames: isolated.frames.map((frame) => ({
      ...frame,
      normalized: normalizedTransform(frame, normalization),
    })),
    normalization,
  };

  const bodyFrames = isolated.frames.filter((frame) => frame.kind === 'body');
  const effectFrames = isolated.frames.filter((frame) => frame.kind === 'fx');
  if (bodyFrames.length !== 84) throw new Error('Expected 84 El Toro body frames');
  if (effectFrames.length !== 22) throw new Error('Expected 22 El Toro FX frames');

  const bodyNormalized = prepareNormalizedFrames(bodyFrames, normalization);
  const effectNormalized = prepareNormalizedFrames(effectFrames, normalization);
  const bodyAtlas = packFrames(bodyNormalized);
  const effectAtlas = packFrames(effectNormalized);

  const bodyAtlasPath = join(outputRoot, 'right-body.png');
  const effectsAtlasPath = join(outputRoot, 'right-effects.png');
  writeFileSync(bodyAtlasPath, encodeRgbaPng(bodyAtlas.width, bodyAtlas.height, bodyAtlas.rgba));
  writeFileSync(effectsAtlasPath, encodeRgbaPng(effectAtlas.width, effectAtlas.height, effectAtlas.rgba));

  const sourcePlan = compileRuntimeFrameSourcePlan(packageContract, manifestLike);
  const runtimeFragment = buildRuntimeFragment(packageContract, sourcePlan, bodyAtlas.frameRects);
  writeFileSync(
    join(outputRoot, 'right-runtime-fragment.json'),
    JSON.stringify(runtimeFragment, null, 2)+'\n',
  );

  const effectPlan = compileEffectFrameSourcePlan(packageContract, manifestLike);
  writeFileSync(
    join(outputRoot, 'right-effects-fragment.json'),
    JSON.stringify({
      version: 1,
      fighterId: 'el-toro',
      facing: 'right',
      atlas: 'right-effects.png',
      runtimeIntegration: effectPlan.runtimeIntegration,
      effects: Object.fromEntries(
        Object.entries(effectPlan.effects).map(([key, effect]) => [
          key,
          {
            loop: effect.loop,
            clockPolicy: effect.clockPolicy,
            routingRequirement: effect.routingRequirement,
            frames: effect.sourceFrameIds.map((frameId, index) => {
              const rect = effectAtlas.frameRects.get(frameId);
              if (!rect) throw new Error('Missing packed El Toro FX frame '+frameId);
              return {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
                pivotX: rect.pivotX,
                pivotY: rect.pivotY,
                durationTicks: effect.durationTicks?.[index] ?? 1,
              };
            }),
          },
        ]),
      ),
    }, null, 2)+'\n',
  );

  return {
    body: {
      sourceFrameCount: bodyFrames.length,
      atlasPath: bodyAtlasPath,
      atlasWidth: bodyAtlas.width,
      atlasHeight: bodyAtlas.height,
      frameRects: bodyAtlas.frameRects,
    },
    effects: {
      sourceFrameCount: effectFrames.length,
      atlasPath: effectsAtlasPath,
      atlasWidth: effectAtlas.width,
      atlasHeight: effectAtlas.height,
      frameRects: effectAtlas.frameRects,
    },
  };
}
