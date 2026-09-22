import type { SpriteAnchorPoint, SpriteFrameDefinition } from './SpriteManifest.js';

export function sampleSpriteAnchor(
  frame: SpriteFrameDefinition,
  name: string,
): SpriteAnchorPoint | null {
  return frame.anchors?.[name] ?? null;
}
