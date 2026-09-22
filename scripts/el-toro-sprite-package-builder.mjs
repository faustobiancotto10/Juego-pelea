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


function bodyEntryForSemantic(packageContract, semanticKey) {
  const matches = (packageContract?.body ?? []).filter((entry) => entry?.semanticKey === semanticKey);
  if (matches.length !== 1) {
    throw new Error(
      `El Toro runtime source plan requires exactly one body sheet for semantic "${semanticKey}", found ${matches.length}`,
    );
  }
  return matches[0];
}

function frameIdsForWindow(sheetId, firstFrame, lastFrame) {
  if (!Number.isInteger(firstFrame) || !Number.isInteger(lastFrame) || firstFrame < 1 || lastFrame < firstFrame) {
    throw new Error(`Invalid El Toro frame window ${sheetId} ${firstFrame}..${lastFrame}`);
  }
  const ids = [];
  for (let frame = firstFrame; frame <= lastFrame; frame += 1) {
    ids.push(`${sheetId}__f${String(frame).padStart(2, '0')}`);
  }
  return ids;
}

function assertFrameIdsAdmitted(sourceFrameIds, normalizationManifest) {
  const admitted = new Set((normalizationManifest?.frames ?? []).map((frame) => frame?.frameId));
  for (const frameId of sourceFrameIds) {
    if (!admitted.has(frameId)) {
      throw new Error(`El Toro runtime source plan references non-admitted MA frame "${frameId}"`);
    }
  }
}

function sourcePlanEntry({
  semanticKey,
  sourceFrameIds,
  loop,
  clockPolicy,
  durationTicks = null,
  requiresGameplayScaleReview = false,
}) {
  return Object.freeze({
    semanticKey,
    sourceFrameIds: Object.freeze([...sourceFrameIds]),
    loop,
    clockPolicy,
    durationTicks: durationTicks === null ? null : Object.freeze([...durationTicks]),
    requiresGameplayScaleReview,
  });
}

export function compileRuntimeFrameSourcePlan(packageContract, normalizationManifest) {
  if (packageContract?.fighterId !== 'el-toro') {
    throw new Error('El Toro runtime source plan requires fighterId "el-toro"');
  }
  if (packageContract?.facing !== 'right') {
    throw new Error('El Toro Mario-B source plan currently compiles the admitted RIGHT-facing package only');
  }

  const resolverMap = packageContract.resolverMap;
  if (!resolverMap?.runtimeStateWindows || !resolverMap?.expectedMoveIdsByRole) {
    throw new Error('El Toro runtime source plan requires frozen resolver windows and move IDs');
  }

  const animations = {};

  for (const [key, window] of Object.entries(resolverMap.runtimeStateWindows)) {
    const body = bodyEntryForSemantic(packageContract, window.semanticKey);
    const sourceFrameIds = frameIdsForWindow(body.id, window.firstFrame, window.lastFrame);
    assertFrameIdsAdmitted(sourceFrameIds, normalizationManifest);
    animations[key] = sourcePlanEntry({
      semanticKey: window.semanticKey,
      sourceFrameIds,
      loop: window.loop,
      clockPolicy: window.loop ? 'ambient-loop' : 'presentation-state-entry-age',
      requiresGameplayScaleReview: window.requiresGameplayScaleReview === true,
    });
  }

  for (const [role, moveId] of Object.entries(resolverMap.expectedMoveIdsByRole)) {
    if (role === 'ultimate') continue;
    const timing = resolverMap.moveRoleTimings?.[role];
    if (!timing) throw new Error(`Missing El Toro presentation timing for move role "${role}"`);
    const body = bodyEntryForSemantic(packageContract, timing.semanticKey);
    const sourceFrameIds = frameIdsForWindow(body.id, 1, body.frames);
    if (timing.frameDurations.length !== sourceFrameIds.length) {
      throw new Error(
        `El Toro move role "${role}" has ${timing.frameDurations.length} durations for ${sourceFrameIds.length} source frames`,
      );
    }
    assertFrameIdsAdmitted(sourceFrameIds, normalizationManifest);
    animations[`move:${moveId}`] = sourcePlanEntry({
      semanticKey: timing.semanticKey,
      sourceFrameIds,
      loop: false,
      clockPolicy: 'moveFrame',
      durationTicks: timing.frameDurations,
      requiresGameplayScaleReview: resolverMap.pilotAliases?.[role]?.requiresGameplayScaleReview === true,
    });
  }

  const ultimateMoveId = resolverMap.expectedMoveIdsByRole.ultimate;
  for (const [phase, window] of Object.entries(resolverMap.ultimatePhaseWindows ?? {})) {
    const timing = resolverMap.ultimatePhaseTimings?.[phase];
    if (!timing) throw new Error(`Missing El Toro Ultimate presentation timing for phase "${phase}"`);
    const body = bodyEntryForSemantic(packageContract, window.semanticKey);
    const sourceFrameIds = frameIdsForWindow(body.id, window.firstFrame, window.lastFrame);
    if (timing.frameDurations.length !== sourceFrameIds.length) {
      throw new Error(
        `El Toro Ultimate phase "${phase}" has ${timing.frameDurations.length} durations for ${sourceFrameIds.length} source frames`,
      );
    }
    assertFrameIdsAdmitted(sourceFrameIds, normalizationManifest);
    animations[`ultimate:${ultimateMoveId}:${phase}`] = sourcePlanEntry({
      semanticKey: window.semanticKey,
      sourceFrameIds,
      loop: false,
      clockPolicy: 'ultimatePhaseFrame',
      durationTicks: timing.frameDurations,
    });
  }

  return Object.freeze({
    fighterId: packageContract.fighterId,
    facing: packageContract.facing,
    animations: Object.freeze(animations),
  });
}


export function compileEffectFrameSourcePlan(packageContract, normalizationManifest) {
  if (packageContract?.fighterId !== 'el-toro') {
    throw new Error('El Toro effect source plan requires fighterId "el-toro"');
  }
  const packagePlan = packageContract.effectPackagePlan;
  if (!packagePlan?.effects || typeof packagePlan.runtimeIntegration !== 'string') {
    throw new Error('El Toro effect source plan requires effectPackagePlan metadata');
  }

  const effectEntries = new Map(
    (packageContract.effects ?? []).map((entry) => [entry.id, entry]),
  );
  const effects = {};

  for (const [semanticKey, policy] of Object.entries(packagePlan.effects)) {
    const source = effectEntries.get(policy.sourceId);
    if (!source) {
      throw new Error(
        `El Toro effect "${semanticKey}" references unknown package source "${policy.sourceId}"`,
      );
    }
    if (source.semanticKey !== semanticKey) {
      throw new Error(
        `El Toro effect "${semanticKey}" source semantic mismatch: ${source.semanticKey}`,
      );
    }

    const sourceFrameIds = frameIdsForWindow(source.id, 1, source.frames);
    assertFrameIdsAdmitted(sourceFrameIds, normalizationManifest);

    if (
      policy.frameDurations !== undefined
      && policy.frameDurations.length !== sourceFrameIds.length
    ) {
      throw new Error(
        `El Toro effect "${semanticKey}" has ${policy.frameDurations.length} durations for ${sourceFrameIds.length} source frames`,
      );
    }

    effects[semanticKey] = Object.freeze({
      sourceId: source.id,
      sourceFrameIds: Object.freeze(sourceFrameIds),
      loop: policy.loop,
      clockPolicy: policy.clockPolicy,
      routingRequirement: policy.routingRequirement,
      durationTicks: policy.frameDurations === undefined
        ? null
        : Object.freeze([...policy.frameDurations]),
    });
  }

  return Object.freeze({
    fighterId: packageContract.fighterId,
    facing: packageContract.facing,
    runtimeIntegration: packagePlan.runtimeIntegration,
    effects: Object.freeze(effects),
  });
}
