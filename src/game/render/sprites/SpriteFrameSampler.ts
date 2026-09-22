import type { SpriteAnimationDefinition, SpriteFrameDefinition } from './SpriteManifest.js';

export interface SampledSpriteFrame {
  frame: SpriteFrameDefinition;
  frameIndex: number;
}

function integerTick(tick: number): number {
  if (!Number.isFinite(tick)) return 0;
  return Math.max(0, Math.trunc(tick));
}

export function sampleSpriteFrame(
  animation: SpriteAnimationDefinition,
  tick: number,
): SampledSpriteFrame {
  if (animation.frames.length === 0) {
    throw new Error('Sprite frame sampler: animation has no frames');
  }

  const totalTicks = animation.frames.reduce((sum, frame) => sum + frame.durationTicks, 0);
  if (!Number.isInteger(totalTicks) || totalTicks < 1) {
    throw new Error('Sprite frame sampler: animation duration must be a positive integer');
  }

  const sourceTick = integerTick(tick);
  const sampledTick = animation.loop
    ? sourceTick % totalTicks
    : Math.min(sourceTick, totalTicks - 1);

  let cursor = 0;
  for (let index = 0; index < animation.frames.length; index += 1) {
    const frame = animation.frames[index]!;
    cursor += frame.durationTicks;
    if (sampledTick < cursor) return { frame, frameIndex: index };
  }

  const frameIndex = animation.frames.length - 1;
  return { frame: animation.frames[frameIndex]!, frameIndex };
}
