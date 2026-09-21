import type { FighterSnapshot } from '../../types.js';
import type { Point2 } from '../LocomotionPose.js';
import { GROUND_Y } from '../drawUtils.js';
import { resolveSpriteAnimation } from './AnimationResolver.js';
import type { SpriteAssetStore } from './SpriteAssetStore.js';
import { sampleSpriteAnchor } from './SpriteAnchorSampler.js';
import { sampleSpriteFrame } from './SpriteFrameSampler.js';
import type { SpriteFrameDefinition } from './SpriteManifest.js';

export interface SpriteDrawPlacement {
  translateX: number;
  translateY: number;
  scaleX: -1 | 1;
  source: { x: number; y: number; width: number; height: number };
  dest: { x: number; y: number; width: number; height: number };
}

export function computeSpriteDrawPlacement(
  fighter: FighterSnapshot,
  frame: SpriteFrameDefinition,
): SpriteDrawPlacement {
  return {
    translateX: fighter.x,
    translateY: GROUND_Y - fighter.y,
    scaleX: fighter.facing,
    source: {
      x: frame.x,
      y: frame.y,
      width: frame.width,
      height: frame.height,
    },
    dest: {
      x: -frame.pivotX,
      y: -frame.pivotY,
      width: frame.width,
      height: frame.height,
    },
  };
}

export class SpriteFighterRenderer {
  constructor(private readonly store: Pick<SpriteAssetStore, 'get'>) {}

  draw(
    ctx: CanvasRenderingContext2D,
    fighter: FighterSnapshot,
    packageKey: string,
    combatTick: number,
    alpha = 1,
  ): void {
    const { image, frame } = this.resolveFrame(fighter, packageKey, combatTick);
    const placement = computeSpriteDrawPlacement(fighter, frame);

    ctx.save();
    ctx.translate(placement.translateX, placement.translateY);
    ctx.scale(placement.scaleX, 1);
    ctx.globalAlpha *= alpha;
    ctx.drawImage(
      image,
      placement.source.x,
      placement.source.y,
      placement.source.width,
      placement.source.height,
      placement.dest.x,
      placement.dest.y,
      placement.dest.width,
      placement.dest.height,
    );
    ctx.restore();
  }

  sampleAnchor(
    fighter: FighterSnapshot,
    packageKey: string,
    combatTick: number,
    name: string,
  ): Point2 | null {
    const { frame } = this.resolveFrame(fighter, packageKey, combatTick);
    const anchor = sampleSpriteAnchor(frame, name);
    if (!anchor) return null;
    return {
      x: anchor.x - frame.pivotX,
      y: frame.pivotY - anchor.y,
    };
  }

  private resolveFrame(
    fighter: FighterSnapshot,
    packageKey: string,
    combatTick: number,
  ): { image: CanvasImageSource; frame: SpriteFrameDefinition } {
    const loaded = this.store.get(packageKey);
    const resolved = resolveSpriteAnimation(fighter, combatTick);
    const animation = loaded.manifest.animations[resolved.key];
    if (!animation) {
      throw new Error(
        `Missing sprite animation "${resolved.key}" for fighter "${fighter.id}" in package "${packageKey}"`,
      );
    }
    return {
      image: loaded.image,
      frame: sampleSpriteFrame(animation, resolved.tick).frame,
    };
  }
}
