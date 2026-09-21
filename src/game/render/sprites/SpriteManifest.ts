export type FighterBodyBackend = 'procedural' | 'sprite';

export interface SpriteAnchorPoint {
  x: number;
  y: number;
}

export interface SpriteFrameDefinition {
  x: number;
  y: number;
  width: number;
  height: number;
  pivotX: number;
  pivotY: number;
  durationTicks: number;
  anchors?: Readonly<Record<string, SpriteAnchorPoint>>;
}

export interface SpriteAnimationDefinition {
  loop: boolean;
  frames: readonly SpriteFrameDefinition[];
}

export interface SpriteAnimationSetDefinition {
  version: 1;
  atlas: string;
  animations: Readonly<Record<string, SpriteAnimationDefinition>>;
}

type UnknownRecord = Record<string, unknown>;

function fail(path: string, message: string): never {
  throw new Error(`${path}: ${message}`);
}

function record(path: string, value: unknown): UnknownRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    fail(path, 'must be an object');
  }
  return value as UnknownRecord;
}

function nonEmpty(path: string, value: unknown): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    fail(path, 'must be a non-empty string');
  }
  return value;
}

function finite(path: string, value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    fail(path, 'must be a finite number');
  }
  return value;
}

function positive(path: string, value: unknown): number {
  const parsed = finite(path, value);
  if (parsed <= 0) fail(path, 'must be greater than zero');
  return parsed;
}

function duration(path: string, value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
    fail(path, 'must be an integer >= 1');
  }
  return value;
}

export function validateSpriteAnimationSet(
  value: unknown,
  path = 'spriteManifest',
): SpriteAnimationSetDefinition {
  const manifest = record(path, value);
  if (manifest.version !== 1) fail(`${path}.version`, 'must equal 1');
  nonEmpty(`${path}.atlas`, manifest.atlas);

  const animations = record(`${path}.animations`, manifest.animations);
  const animationEntries = Object.entries(animations);
  if (animationEntries.length === 0) fail(`${path}.animations`, 'must contain at least one animation');

  for (const [animationKey, rawAnimation] of animationEntries) {
    nonEmpty(`${path}.animations animation key`, animationKey);
    const animationPath = `${path}.animations.${animationKey}`;
    const animation = record(animationPath, rawAnimation);
    if (typeof animation.loop !== 'boolean') fail(`${animationPath}.loop`, 'must be boolean');
    if (!Array.isArray(animation.frames) || animation.frames.length === 0) {
      fail(`${animationPath}.frames`, 'must contain at least one frame');
    }

    for (const [frameIndex, rawFrame] of animation.frames.entries()) {
      const framePath = `${animationPath}.frames[${frameIndex}]`;
      const frame = record(framePath, rawFrame);
      finite(`${framePath}.x`, frame.x);
      finite(`${framePath}.y`, frame.y);
      positive(`${framePath}.width`, frame.width);
      positive(`${framePath}.height`, frame.height);
      finite(`${framePath}.pivotX`, frame.pivotX);
      finite(`${framePath}.pivotY`, frame.pivotY);
      duration(`${framePath}.durationTicks`, frame.durationTicks);

      if (frame.anchors !== undefined) {
        const anchors = record(`${framePath}.anchors`, frame.anchors);
        for (const [anchorName, rawAnchor] of Object.entries(anchors)) {
          nonEmpty(`${framePath}.anchors key`, anchorName);
          const anchorPath = `${framePath}.anchors.${anchorName}`;
          const anchor = record(anchorPath, rawAnchor);
          finite(`${anchorPath}.x`, anchor.x);
          finite(`${anchorPath}.y`, anchor.y);
        }
      }
    }
  }

  return value as SpriteAnimationSetDefinition;
}
