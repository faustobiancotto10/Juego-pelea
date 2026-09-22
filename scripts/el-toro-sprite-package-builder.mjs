import { BODY_CANVAS } from './sprite-source-config.mjs';

export function findOverlappingFrameBboxes(manifest) {
  const frames = Array.isArray(manifest?.frames) ? manifest.frames : [];
  const bySheet = new Map();

  for (const frame of frames) {
    if (!frame || frame.sheetId === 'IMG-00' || !frame.bbox) continue;
    const list = bySheet.get(frame.sheetId) ?? [];
    list.push(frame);
    bySheet.set(frame.sheetId, list);
  }

  const overlaps = [];
  for (const [sheetId, sheetFrames] of bySheet.entries()) {
    for (let a = 0; a < sheetFrames.length; a += 1) {
      for (let b = a + 1; b < sheetFrames.length; b += 1) {
        const first = sheetFrames[a];
        const second = sheetFrames[b];
        if (
          first.bbox.x < second.bbox.x + second.bbox.width &&
          first.bbox.x + first.bbox.width > second.bbox.x &&
          first.bbox.y < second.bbox.y + second.bbox.height &&
          first.bbox.y + first.bbox.height > second.bbox.y
        ) {
          overlaps.push({
            sheetId,
            first: first.frameId,
            second: second.frameId,
            firstBbox: first.bbox,
            secondBbox: second.bbox,
          });
        }
      }
    }
  }

  return overlaps;
}

export function assertPixelSafePackingInputs(
  manifest,
  { isolatedFrameIds = [] } = {},
) {
  const overlaps = findOverlappingFrameBboxes(manifest);
  if (overlaps.length === 0) return { overlaps, isolationRequired: false };

  const isolated = new Set(isolatedFrameIds);
  const required = new Set();
  for (const pair of overlaps) {
    required.add(pair.first);
    required.add(pair.second);
  }
  const missing = [...required].filter((frameId) => !isolated.has(frameId)).sort();

  if (missing.length > 0) {
    throw new Error(
      `El Toro atlas packing requires pixel-isolated MA frame outputs: ${overlaps.length} bbox overlap pairs; missing isolation for ${missing.length} implicated frames (${missing.join(', ')})`,
    );
  }

  return { overlaps, isolationRequired: true };
}


function sharedRuntimeBodyScale(frames) {
  const maxWidth = Math.max(...frames.map((frame) => frame.bbox.width));
  const maxHeight = Math.max(...frames.map((frame) => frame.bbox.height));
  const usableWidth = BODY_CANVAS.width - BODY_CANVAS.margin * 2;
  const usableHeight = BODY_CANVAS.pivotY - BODY_CANVAS.margin;
  return Math.min(usableWidth / maxWidth, usableHeight / maxHeight);
}

export function analyzeMasterSeedScaleInfluence(manifest) {
  const bodyFrames = (manifest?.frames ?? []).filter(
    (frame) => frame?.kind === 'body' && /^IMG-(0[1-9]|1[0-2])$/.test(frame.sheetId),
  );
  const masterFrames = (manifest?.frames ?? []).filter((frame) => frame?.sheetId === 'IMG-00');
  if (bodyFrames.length === 0 || masterFrames.length === 0) {
    throw new Error('El Toro scale diagnostic requires IMG-00 plus IMG-01..12 body frames');
  }

  const runtimeBodyScale = sharedRuntimeBodyScale(bodyFrames);
  const currentScale = manifest?.normalization?.body?.sharedScale;
  if (typeof currentScale !== 'number' || !Number.isFinite(currentScale) || currentScale <= 0) {
    throw new Error('El Toro scale diagnostic requires a finite positive normalization.body.sharedScale');
  }

  return {
    currentScale,
    runtimeBodyScale,
    runtimeToCurrentRatio: runtimeBodyScale / currentScale,
    masterConstrainsRuntimeScale: runtimeBodyScale > currentScale + 1e-8,
  };
}

export function assertMasterSeedDoesNotConstrainRuntimeBodyScale(manifest) {
  const diagnostic = analyzeMasterSeedScaleInfluence(manifest);
  if (diagnostic.masterConstrainsRuntimeScale) {
    throw new Error(
      `El Toro runtime body scale is constrained by IMG-00 Master Seed: current=${diagnostic.currentScale}, body-only=${diagnostic.runtimeBodyScale}, ratio=${diagnostic.runtimeToCurrentRatio.toFixed(4)}`,
    );
  }
  return diagnostic;
}
