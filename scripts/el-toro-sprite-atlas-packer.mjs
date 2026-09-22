import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { deflateSync } from 'node:zlib';
import { pathToFileURL } from 'node:url';
import { generatePixelIsolatedFrameSet } from './el-toro-sprite-source-pipeline.mjs';
import { buildNormalization, normalizedTransform } from './sprite-normalize-contract.mjs';
import {
  compileEffectFrameSourcePlan,
  compileRuntimeFrameSourcePlan,
} from './el-toro-sprite-package-builder.mjs';

const PNG_SIGNATURE = Buffer.from([137,80,78,71,13,10,26,10]);
const REQUIRED_ANCHORS = Object.freeze(['head','chest','frontHand','backHand','belt','frontFoot','backFoot']);

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


function buildRuntimeFragment(packageContract, sourcePlan, frameRects, verifiedAnchorReview = null) {
  const reviewedAnchors = verifiedAnchorReview
    ? new Map(verifiedAnchorReview.frames.map((frame) => [frame.frameId, frame.anchors]))
    : null;
  const animations = {};
  for (const [key, animation] of Object.entries(sourcePlan.animations)) {
    const durations = runtimeDurationsFor(packageContract, key, animation);
    animations[key] = {
      loop: animation.loop,
      frames: animation.sourceFrameIds.map((frameId, index) => {
        const rect = frameRects.get(frameId);
        if (!rect) throw new Error('Missing packed El Toro body frame '+frameId);
        const reviewed = reviewedAnchors?.get(frameId) ?? null;
        return {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          pivotX: rect.pivotX,
          pivotY: rect.pivotY,
          durationTicks: durations[index],
          ...(reviewed ? {
            anchors: Object.fromEntries(
              REQUIRED_ANCHORS.map((name) => [name, { ...reviewed[name] }]),
            ),
          } : {}),
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
      ...(verifiedAnchorReview ? [] : ['verified-attachment-anchors']),
    ],
    animations,
  };
}


function renderGameplayPreview(runtimeFragment, atlasWidth, atlasHeight) {
  const scale = 390 / 720;
  const baseline = 306;
  const samples = [
    ['idle', 3, 'IDLE'],
    ['walk-forward', 3, 'WALK'],
    ['move:toroJab', 3, 'JAB ACTIVE'],
    ['move:topete', 4, 'TOPETE PEAK'],
    ['move:shawarmazoThrow', 3, 'SHAWARMA RELEASE'],
    ['ultimate:superEructo:capture', 1, 'SUPER ERUCTO'],
  ];
  const anchors = [70, 208, 346, 484, 622, 760];

  const sprites = samples.map(([key, requestedIndex, label], sampleIndex) => {
    const animation = runtimeFragment.animations[key];
    if (!animation) throw new Error('Missing preview animation '+key);
    const index = Math.min(requestedIndex, animation.frames.length - 1);
    const frame = animation.frames[index];
    const width = frame.width * scale;
    const height = frame.height * scale;
    const x = anchors[sampleIndex] - frame.pivotX * scale;
    const y = baseline - frame.pivotY * scale;
    const labelX = anchors[sampleIndex];

    return [
      '<g>',
      '<rect x="'+(anchors[sampleIndex]-66)+'" y="54" width="132" height="274" rx="10" fill="rgba(8,12,19,0.28)" stroke="rgba(255,255,255,0.08)"/>',
      '<svg data-animation="'+key+'" x="'+x.toFixed(3)+'" y="'+y.toFixed(3)+'" width="'+width.toFixed(3)+'" height="'+height.toFixed(3)+'" viewBox="'+frame.x+' '+frame.y+' '+frame.width+' '+frame.height+'" overflow="visible">',
      '<image href="'+atlasName+'" x="0" y="0" width="'+atlasWidth+'" height="'+atlasHeight+'"/>',
      '</svg>',
      '<text x="'+labelX+'" y="350" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="800" fill="#f5e8cf">'+label+'</text>',
      '</g>',
    ].join('');
  }).join('');

  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 844 390" width="844" height="390">',
    '<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#17202b"/><stop offset="1" stop-color="#3c2d25"/></linearGradient></defs>',
    '<rect width="844" height="390" fill="url(#sky)"/>',
    '<circle cx="710" cy="86" r="44" fill="#d9b36a" opacity="0.18"/>',
    '<path d="M0 290 L90 258 L165 280 L250 246 L346 282 L440 252 L548 281 L655 242 L760 278 L844 260 L844 390 L0 390 Z" fill="#201a18" opacity="0.82"/>',
    '<rect x="0" y="'+baseline+'" width="844" height="'+(390-baseline)+'" fill="#493328" opacity="0.72"/>',
    '<line x1="0" y1="'+baseline+'" x2="844" y2="'+baseline+'" stroke="#d6ae68" stroke-width="1.5" opacity="0.65"/>',
    '<text x="22" y="29" font-family="system-ui,sans-serif" font-size="16" font-weight="900" fill="#f5e8cf">EL TORO — RIGHT-FACING DERIVED ATLAS / 844×390 GAMEPLAY-SCALE EVIDENCE</text>',
    '<text x="22" y="47" font-family="system-ui,sans-serif" font-size="10" font-weight="600" fill="#cdbb9d">Rendered only from right-body.png at FightRenderer phone-landscape scale (390/720). Source sheets are not referenced.</text>',
    sprites,
    '</svg>',
    '',
  ].join('');
}


function renderAnchorReviewSheet(frameRects, atlasWidth, atlasHeight, atlasName = 'right-body.png') {
  const width = 1260;
  const height = 2760;
  const columns = 7;
  const cellWidth = 180;
  const cellHeight = 230;
  const cards = [...frameRects.entries()].map(([frameId, rect], index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const originX = column * cellWidth;
    const originY = row * cellHeight;
    const pivotX = originX + cellWidth / 2;
    const pivotY = originY + 188;
    const scale = Math.min(160 / rect.width, 170 / rect.height);
    const spriteWidth = rect.width * scale;
    const spriteHeight = rect.height * scale;
    const spriteX = pivotX - rect.pivotX * scale;
    const spriteY = pivotY - rect.pivotY * scale;

    return [
      '<g data-frame-id="'+frameId+'">',
      '<rect x="'+(originX+5)+'" y="'+(originY+5)+'" width="170" height="220" rx="8" fill="#121922" stroke="#2d3a49"/>',
      '<svg x="'+spriteX.toFixed(3)+'" y="'+spriteY.toFixed(3)+'" width="'+spriteWidth.toFixed(3)+'" height="'+spriteHeight.toFixed(3)+'" viewBox="'+rect.x+' '+rect.y+' '+rect.width+' '+rect.height+'" overflow="visible">',
      '<image href="right-body.png" x="0" y="0" width="'+atlasWidth+'" height="'+atlasHeight+'"/>',
      '</svg>',
      '<g data-pivot="normalization-ground-pivot" stroke="#ffd36a" stroke-width="1.5">',
      '<line x1="'+(pivotX-7)+'" y1="'+pivotY+'" x2="'+(pivotX+7)+'" y2="'+pivotY+'"/>',
      '<line x1="'+pivotX+'" y1="'+(pivotY-7)+'" x2="'+pivotX+'" y2="'+(pivotY+7)+'"/>',
      '</g>',
      '<text x="'+pivotX+'" y="'+(originY+211)+'" text-anchor="middle" font-family="monospace" font-size="9" fill="#f5e8cf">'+frameId+'</text>',
      '</g>',
    ].join('');
  }).join('');

  const legend = REQUIRED_ANCHORS
    .map((name, index) => '<text x="'+(12 + (index % 4) * 310)+'" y="'+(18 + Math.floor(index / 4) * 14)+'" font-family="system-ui,sans-serif" font-size="9" font-weight="700" fill="#9fb1c4">ANCHOR '+name+'</text>')
    .join('');

  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1260 2760" width="1260" height="2760">',
    '<rect width="1260" height="2760" fill="#090d13"/>',
    '<g opacity="0.9">'+legend+'</g>',
    cards,
    '</svg>',
    '',
  ].join('');
}

function buildAnchorReviewTemplate(frameRects, facing = 'right') {
  return {
    version: 1,
    fighterId: 'el-toro',
    facing,
    status: 'pending-visual-verification',
    coordinateSpace: 'packed-frame-local',
    requiredAnchors: [...REQUIRED_ANCHORS],
    frames: [...frameRects.entries()].map(([frameId, rect]) => ({
      frameId,
      atlasRect: {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      },
      pivot: {
        x: rect.pivotX,
        y: rect.pivotY,
        source: 'normalization-ground-pivot',
      },
      anchors: Object.fromEntries(REQUIRED_ANCHORS.map((name) => [name, null])),
      verified: false,
    })),
  };
}

export function assertVerifiedElToroAnchorReview(
  review,
  { expectedFrameCount = 84, expectedFacing = 'right' } = {},
) {
  if (!review || review.status !== 'verified') {
    throw new Error('El Toro anchor review is not verified');
  }
  if (review.fighterId !== 'el-toro' || review.facing !== expectedFacing) {
    throw new Error('El Toro anchor review fighter/facing mismatch');
  }
  if (review.coordinateSpace !== 'packed-frame-local') {
    throw new Error('El Toro anchor review coordinate space mismatch');
  }
  if (!Array.isArray(review.frames) || review.frames.length !== expectedFrameCount) {
    throw new Error(
      `El Toro anchor review expected ${expectedFrameCount} frames, got ${review?.frames?.length ?? 0}`,
    );
  }
  if (
    !Array.isArray(review.requiredAnchors)
    || review.requiredAnchors.length !== REQUIRED_ANCHORS.length
    || REQUIRED_ANCHORS.some((name, index) => review.requiredAnchors[index] !== name)
  ) {
    throw new Error('El Toro anchor review required-anchor contract mismatch');
  }

  const ids = new Set();
  for (const frame of review.frames) {
    if (!frame || typeof frame.frameId !== 'string' || ids.has(frame.frameId)) {
      throw new Error('El Toro anchor review has missing/duplicate frameId');
    }
    ids.add(frame.frameId);
    const width = frame.atlasRect?.width;
    const height = frame.atlasRect?.height;
    if (!Number.isFinite(width) || width < 1 || !Number.isFinite(height) || height < 1) {
      throw new Error(`El Toro anchor review invalid atlas rect for ${frame.frameId}`);
    }
    if (frame.verified !== true) {
      throw new Error(`El Toro anchor review frame ${frame.frameId} is not verified`);
    }

    for (const name of REQUIRED_ANCHORS) {
      const point = frame.anchors?.[name];
      if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) {
        throw new Error(`El Toro anchor review missing ${name} for ${frame.frameId}`);
      }
      if (point.x < 0 || point.x > width || point.y < 0 || point.y > height) {
        throw new Error(`El Toro anchor review ${name} out of bounds for ${frame.frameId}`);
      }
    }
  }

  return true;
}



function assertAnchorReviewMatchesPackedFrames(review, frameRects) {
  if (review.frames.length !== frameRects.size) {
    throw new Error('El Toro verified anchor review does not match packed frame count');
  }
  const byId = new Map(review.frames.map((frame) => [frame.frameId, frame]));
  for (const [frameId, rect] of frameRects.entries()) {
    const frame = byId.get(frameId);
    if (!frame) throw new Error('El Toro verified anchor review missing packed frame '+frameId);
    const atlasRect = frame.atlasRect;
    if (
      atlasRect?.x !== rect.x
      || atlasRect?.y !== rect.y
      || atlasRect?.width !== rect.width
      || atlasRect?.height !== rect.height
    ) {
      throw new Error('El Toro verified anchor review atlas rect mismatch for '+frameId);
    }
    if (
      frame.pivot?.source !== 'normalization-ground-pivot'
      || Math.abs(frame.pivot.x - rect.pivotX) > 1e-4
      || Math.abs(frame.pivot.y - rect.pivotY) > 1e-4
    ) {
      throw new Error('El Toro verified anchor review pivot mismatch for '+frameId);
    }
  }
  return review;
}

export function buildElToroRightAtlasPackage({
  sourceDir,
  packageContractPath,
  outDir,
  verifiedAnchorReviewPath = null,
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

  let verifiedAnchorReview = null;
  if (verifiedAnchorReviewPath !== null) {
    verifiedAnchorReview = JSON.parse(readFileSync(resolve(verifiedAnchorReviewPath), 'utf8'));
    assertVerifiedElToroAnchorReview(verifiedAnchorReview);
    assertAnchorReviewMatchesPackedFrames(verifiedAnchorReview, bodyAtlas.frameRects);
  }

  const sourcePlan = compileRuntimeFrameSourcePlan(packageContract, manifestLike);
  const runtimeFragment = buildRuntimeFragment(
    packageContract,
    sourcePlan,
    bodyAtlas.frameRects,
    verifiedAnchorReview,
  );
  writeFileSync(
    join(outputRoot, 'right-runtime-fragment.json'),
    JSON.stringify(runtimeFragment, null, 2)+'\n',
  );
  const previewPath = join(outputRoot, 'right-gameplay-preview.svg');
  writeFileSync(
    previewPath,
    renderGameplayPreview(runtimeFragment, bodyAtlas.width, bodyAtlas.height),
  );

  const anchorReviewPath = join(outputRoot, 'right-anchor-review.json');
  writeFileSync(
    anchorReviewPath,
    JSON.stringify(
      verifiedAnchorReview ?? buildAnchorReviewTemplate(bodyAtlas.frameRects),
      null,
      2,
    )+'\n',
  );
  const anchorReviewSvgPath = join(outputRoot, 'right-anchor-review.svg');
  writeFileSync(
    anchorReviewSvgPath,
    renderAnchorReviewSheet(bodyAtlas.frameRects, bodyAtlas.width, bodyAtlas.height),
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

  const metricsPath = join(outputRoot, 'right-package-metrics.json');
  const metrics = {
    version: 1,
    fighterId: 'el-toro',
    facing: 'right',
    body: {
      frameCount: bodyFrames.length,
      width: bodyAtlas.width,
      height: bodyAtlas.height,
      decodedRgbaBytes: bodyAtlas.width * bodyAtlas.height * 4,
    },
    effects: {
      frameCount: effectFrames.length,
      width: effectAtlas.width,
      height: effectAtlas.height,
      decodedRgbaBytes: effectAtlas.width * effectAtlas.height * 4,
    },
    combinedDecodedRgbaBytes:
      bodyAtlas.width * bodyAtlas.height * 4
      + effectAtlas.width * effectAtlas.height * 4,
    previewViewport: { width: 844, height: 390 },
    runtimeLoadsSourceSheets: false,
    runtimeLoadable: false,
  };
  writeFileSync(metricsPath, JSON.stringify(metrics, null, 2)+'\n');

  return {
    previewPath,
    metricsPath,
    anchorReviewPath,
    anchorReviewSvgPath,
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


function renderBilateralGameplayPreview(runtimeManifest, atlasWidth, atlasHeight) {
  const width = 844;
  const height = 760;
  const scale = 390 / 720;
  const samples = [
    ['idle', 3, 'IDLE'],
    ['walk-forward', 3, 'WALK'],
    ['move:toroJab', 3, 'JAB ACTIVE'],
    ['move:topete', 4, 'TOPETE PEAK'],
    ['move:shawarmazoThrow', 3, 'SHAWARMA RELEASE'],
    ['ultimate:superEructo:capture', 1, 'SUPER ERUCTO'],
  ];
  const centers = [70,208,346,484,622,760];

  function row(animationMap, facing, top, baseline) {
    return samples.map(([key, requestedIndex, label], index) => {
      const animation = animationMap[key];
      if (!animation) throw new Error('Missing bilateral preview animation '+facing+' '+key);
      const frameIndex = Math.min(requestedIndex, animation.frames.length - 1);
      const frame = animation.frames[frameIndex];
      const drawWidth = frame.width * scale;
      const drawHeight = frame.height * scale;
      const x = centers[index] - frame.pivotX * scale;
      const y = baseline - frame.pivotY * scale;
      return [
        '<g data-facing="'+facing+'" data-animation="'+key+'">',
        '<rect x="'+(centers[index]-66)+'" y="'+top+'" width="132" height="274" rx="10" fill="#0d131c" fill-opacity="0.38" stroke="#ffffff" stroke-opacity="0.08"/>',
        '<svg x="'+x.toFixed(3)+'" y="'+y.toFixed(3)+'" width="'+drawWidth.toFixed(3)+'" height="'+drawHeight.toFixed(3)+'" viewBox="'+frame.x+' '+frame.y+' '+frame.width+' '+frame.height+'" overflow="visible">',
        '<image href="el-toro-body.png" x="0" y="0" width="'+atlasWidth+'" height="'+atlasHeight+'"/>',
        '</svg>',
        '<text x="'+centers[index]+'" y="'+(top+296)+'" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" font-weight="800" fill="#f5e8cf">'+label+'</text>',
        '</g>',
      ].join('');
    }).join('');
  }

  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 844 760" width="844" height="760">',
    '<rect width="844" height="760" fill="#111821"/>',
    '<text x="18" y="24" font-family="system-ui,sans-serif" font-size="15" font-weight="900" fill="#f5e8cf">EL TORO — AUTHORED BILATERAL GAMEPLAY-SCALE EVIDENCE</text>',
    '<text x="18" y="42" font-family="system-ui,sans-serif" font-size="10" fill="#aebdce">Single atlas, no horizontal mirroring. RIGHT above, authored LEFT below.</text>',
    '<text x="18" y="67" font-family="system-ui,sans-serif" font-size="11" font-weight="800" fill="#d7b66f">RIGHT</text>',
    row(runtimeManifest.animations,'right',72,326),
    '<line x1="0" y1="380" x2="844" y2="380" stroke="#455466"/>',
    '<text x="18" y="407" font-family="system-ui,sans-serif" font-size="11" font-weight="800" fill="#d7b66f">LEFT — AUTHORED</text>',
    row(runtimeManifest.leftAnimations,'left',412,666),
    '</svg>',
    '',
  ].join('');
}


function buildAnimationMapForFacing(
  packageContract,
  sourcePlan,
  frameRects,
  verifiedAnchorReview = null,
) {
  const reviewedAnchors = verifiedAnchorReview
    ? new Map(verifiedAnchorReview.frames.map((frame) => [frame.frameId, frame.anchors]))
    : null;
  const animations = {};

  for (const [key, animation] of Object.entries(sourcePlan.animations)) {
    const durations = runtimeDurationsFor(packageContract, key, animation);
    animations[key] = {
      loop: animation.loop,
      frames: animation.sourceFrameIds.map((frameId, index) => {
        const rect = frameRects.get(frameId);
        if (!rect) throw new Error('Missing packed El Toro bilateral body frame '+frameId);
        const reviewed = reviewedAnchors?.get(frameId) ?? null;
        return {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          pivotX: rect.pivotX,
          pivotY: rect.pivotY,
          durationTicks: durations[index],
          ...(reviewed ? {
            anchors: Object.fromEntries(
              REQUIRED_ANCHORS.map((name) => [name, { ...reviewed[name] }]),
            ),
          } : {}),
        };
      }),
    };
  }

  return animations;
}

function namespacedFrame(frame, facing) {
  return { ...frame, frameId: facing+':'+frame.frameId };
}

function facingRectMap(frameRects, facing, frames) {
  const result = new Map();
  for (const frame of frames) {
    const rect = frameRects.get(facing+':'+frame.frameId);
    if (!rect) throw new Error('Missing '+facing+' packed rect for '+frame.frameId);
    result.set(frame.frameId, rect);
  }
  return result;
}

function manifestLikeForFacing(frames, normalization) {
  return {
    frames: frames.map((frame) => ({
      ...frame,
      normalized: normalizedTransform(frame, normalization),
    })),
    normalization,
  };
}

export function buildElToroBilateralAtlasPackage({
  rightSourceDir,
  leftSourceDir,
  packageContractPath,
  outDir,
  rightVerifiedAnchorReviewPath = null,
  leftVerifiedAnchorReviewPath = null,
}) {
  const rightRoot = resolve(rightSourceDir);
  const leftRoot = resolve(leftSourceDir);
  const outputRoot = resolve(outDir);
  const packageContract = JSON.parse(readFileSync(resolve(packageContractPath), 'utf8'));
  mkdirSync(outputRoot, { recursive: true });

  const rightIsolated = generatePixelIsolatedFrameSet({
    sourceDir: rightRoot,
    facing: 'right',
  });
  const leftIsolated = generatePixelIsolatedFrameSet({
    sourceDir: leftRoot,
    facing: 'left',
  });

  const rightBody = rightIsolated.frames.filter((frame) => frame.kind === 'body');
  const leftBody = leftIsolated.frames.filter((frame) => frame.kind === 'body');
  const effectFrames = rightIsolated.frames.filter((frame) => frame.kind === 'fx');
  if (rightBody.length !== 84) throw new Error('Expected 84 RIGHT El Toro body frames');
  if (leftBody.length !== 84) throw new Error('Expected 84 LEFT El Toro body frames');
  if (effectFrames.length !== 22) throw new Error('Expected 22 El Toro FX frames');

  const normalizationInput = [
    ...rightIsolated.frames.map((frame) => namespacedFrame(frame, 'right')),
    ...leftIsolated.frames.map((frame) => namespacedFrame(frame, 'left')),
  ];
  const normalization = buildNormalization(normalizationInput);

  const bilateralBodyFrames = [
    ...rightBody.map((frame) => namespacedFrame(frame, 'right')),
    ...leftBody.map((frame) => namespacedFrame(frame, 'left')),
  ];
  const bodyNormalized = prepareNormalizedFrames(bilateralBodyFrames, normalization);
  const effectNormalized = prepareNormalizedFrames(effectFrames, normalization);
  const bodyAtlas = packFrames(bodyNormalized);
  const effectAtlas = packFrames(effectNormalized);

  const bodyAtlasPath = join(outputRoot, 'el-toro-body.png');
  const effectsAtlasPath = join(outputRoot, 'el-toro-effects.png');
  writeFileSync(bodyAtlasPath, encodeRgbaPng(bodyAtlas.width, bodyAtlas.height, bodyAtlas.rgba));
  writeFileSync(effectsAtlasPath, encodeRgbaPng(effectAtlas.width, effectAtlas.height, effectAtlas.rgba));

  const rightRects = facingRectMap(bodyAtlas.frameRects, 'right', rightBody);
  const leftRects = facingRectMap(bodyAtlas.frameRects, 'left', leftBody);

  let rightReview = null;
  if (rightVerifiedAnchorReviewPath !== null) {
    rightReview = JSON.parse(readFileSync(resolve(rightVerifiedAnchorReviewPath), 'utf8'));
    assertVerifiedElToroAnchorReview(rightReview, { expectedFacing: 'right' });
    assertAnchorReviewMatchesPackedFrames(rightReview, rightRects);
  }

  let leftReview = null;
  if (leftVerifiedAnchorReviewPath !== null) {
    leftReview = JSON.parse(readFileSync(resolve(leftVerifiedAnchorReviewPath), 'utf8'));
    assertVerifiedElToroAnchorReview(leftReview, { expectedFacing: 'left' });
    assertAnchorReviewMatchesPackedFrames(leftReview, leftRects);
  }

  const rightManifestLike = manifestLikeForFacing(rightIsolated.frames, normalization);
  const leftManifestLike = manifestLikeForFacing(leftIsolated.frames, normalization);
  const rightPlan = compileRuntimeFrameSourcePlan(packageContract, rightManifestLike);
  const leftPlan = compileRuntimeFrameSourcePlan(packageContract, leftManifestLike);
  const animations = buildAnimationMapForFacing(
    packageContract,
    rightPlan,
    rightRects,
    rightReview,
  );
  const leftAnimations = buildAnimationMapForFacing(
    packageContract,
    leftPlan,
    leftRects,
    leftReview,
  );

  const blockingGates = [
    ...(rightReview ? [] : ['verified-right-attachment-anchors']),
    ...(leftReview ? [] : ['verified-left-attachment-anchors']),
  ];
  const runtimeManifest = {
    version: 1,
    fighterId: 'el-toro',
    facing: 'authored-bilateral',
    atlas: 'el-toro-body.png',
    mirrorSafe: false,
    runtimeLoadable: blockingGates.length === 0,
    blockingGates,
    animations,
    leftAnimations,
  };
  const manifestPath = join(outputRoot, 'el-toro-animations.json');
  writeFileSync(manifestPath, JSON.stringify(runtimeManifest, null, 2)+'\n');

  const previewPath = join(outputRoot, 'bilateral-gameplay-preview.svg');
  writeFileSync(
    previewPath,
    renderBilateralGameplayPreview(runtimeManifest, bodyAtlas.width, bodyAtlas.height),
  );

  const rightAnchorReviewPath = join(outputRoot, 'right-anchor-review.json');
  const leftAnchorReviewPath = join(outputRoot, 'left-anchor-review.json');
  writeFileSync(
    rightAnchorReviewPath,
    JSON.stringify(rightReview ?? buildAnchorReviewTemplate(rightRects, 'right'), null, 2)+'\n',
  );
  writeFileSync(
    leftAnchorReviewPath,
    JSON.stringify(leftReview ?? buildAnchorReviewTemplate(leftRects, 'left'), null, 2)+'\n',
  );

  const rightAnchorReviewSvgPath = join(outputRoot, 'right-anchor-review.svg');
  const leftAnchorReviewSvgPath = join(outputRoot, 'left-anchor-review.svg');
  writeFileSync(
    rightAnchorReviewSvgPath,
    renderAnchorReviewSheet(rightRects, bodyAtlas.width, bodyAtlas.height, 'el-toro-body.png'),
  );
  writeFileSync(
    leftAnchorReviewSvgPath,
    renderAnchorReviewSheet(leftRects, bodyAtlas.width, bodyAtlas.height, 'el-toro-body.png'),
  );

  const effectPlan = compileEffectFrameSourcePlan(packageContract, rightManifestLike);
  const effectsFragmentPath = join(outputRoot, 'el-toro-effects.json');
  writeFileSync(
    effectsFragmentPath,
    JSON.stringify({
      version: 1,
      fighterId: 'el-toro',
      atlas: 'el-toro-effects.png',
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

  const metricsPath = join(outputRoot, 'bilateral-package-metrics.json');
  const metrics = {
    version: 1,
    fighterId: 'el-toro',
    rightBodyFrames: rightBody.length,
    leftBodyFrames: leftBody.length,
    body: {
      width: bodyAtlas.width,
      height: bodyAtlas.height,
      decodedRgbaBytes: bodyAtlas.width * bodyAtlas.height * 4,
    },
    effects: {
      frameCount: effectFrames.length,
      width: effectAtlas.width,
      height: effectAtlas.height,
      decodedRgbaBytes: effectAtlas.width * effectAtlas.height * 4,
    },
    runtimeLoadable: runtimeManifest.runtimeLoadable,
    mirrorSafe: false,
  };
  writeFileSync(metricsPath, JSON.stringify(metrics, null, 2)+'\n');

  return {
    manifestPath,
    metricsPath,
    previewPath,
    rightAnchorReviewPath,
    leftAnchorReviewPath,
    rightAnchorReviewSvgPath,
    leftAnchorReviewSvgPath,
    body: {
      sourceFrameCount: rightBody.length + leftBody.length,
      rightFrameCount: rightBody.length,
      leftFrameCount: leftBody.length,
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


function parseCliArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--source-dir') args.sourceDir = argv[++index];
    else if (token === '--left-source-dir') args.leftSourceDir = argv[++index];
    else if (token === '--package-contract') args.packageContractPath = argv[++index];
    else if (token === '--out-dir') args.outDir = argv[++index];
    else if (token === '--verified-anchor-review') args.verifiedAnchorReviewPath = argv[++index];
    else if (token === '--right-verified-anchor-review') args.rightVerifiedAnchorReviewPath = argv[++index];
    else if (token === '--left-verified-anchor-review') args.leftVerifiedAnchorReviewPath = argv[++index];
    else throw new Error('unknown argument '+token);
  }
  if (!args.sourceDir || !args.packageContractPath || !args.outDir) {
    throw new Error(
      'usage: node scripts/el-toro-sprite-atlas-packer.mjs --source-dir <right-dir> [--left-source-dir <left-dir>] --package-contract <json> --out-dir <dir> [--verified-anchor-review <json>] [--right-verified-anchor-review <json>] [--left-verified-anchor-review <json>]',
    );
  }
  return args;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = parseCliArgs(process.argv.slice(2));
  if (args.leftSourceDir) {
    const result = buildElToroBilateralAtlasPackage({
      rightSourceDir: args.sourceDir,
      leftSourceDir: args.leftSourceDir,
      packageContractPath: args.packageContractPath,
      outDir: args.outDir,
      rightVerifiedAnchorReviewPath: args.rightVerifiedAnchorReviewPath ?? null,
      leftVerifiedAnchorReviewPath: args.leftVerifiedAnchorReviewPath ?? null,
    });
    const manifest = JSON.parse(readFileSync(result.manifestPath,'utf8'));
    process.stdout.write(JSON.stringify({
      fighterId: 'el-toro',
      facing: 'authored-bilateral',
      rightBodyFrames: result.body.rightFrameCount,
      leftBodyFrames: result.body.leftFrameCount,
      effectFrames: result.effects.sourceFrameCount,
      bodyAtlas: 'el-toro-body.png',
      effectsAtlas: 'el-toro-effects.png',
      manifest: 'el-toro-animations.json',
      preview: 'bilateral-gameplay-preview.svg',
      rightAnchorReview: 'right-anchor-review.json',
      leftAnchorReview: 'left-anchor-review.json',
      mirrorSafe: false,
      runtimeLoadable: manifest.runtimeLoadable,
    })+'\n');
  } else {
    const result = buildElToroRightAtlasPackage(args);
    process.stdout.write(JSON.stringify({
      fighterId: 'el-toro',
      facing: 'right',
      bodyFrames: result.body.sourceFrameCount,
      effectFrames: result.effects.sourceFrameCount,
      bodyAtlas: 'right-body.png',
      effectsAtlas: 'right-effects.png',
      runtimeFragment: 'right-runtime-fragment.json',
      effectsFragment: 'right-effects-fragment.json',
      preview: 'right-gameplay-preview.svg',
      metrics: 'right-package-metrics.json',
      anchorReview: 'right-anchor-review.json',
      anchorReviewVisual: 'right-anchor-review.svg',
      verifiedAnchorReviewApplied: Boolean(result.verifiedAnchorReviewApplied),
      runtimeLoadable: false,
    })+'\n');
  }
}
