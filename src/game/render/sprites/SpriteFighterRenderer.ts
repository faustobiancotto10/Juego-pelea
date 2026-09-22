import type { FighterIndex, FighterSnapshot } from '../../types.js';
import type { Point2 } from '../LocomotionPose.js';
import { GROUND_Y } from '../drawUtils.js';
import { resolveSpriteAnimation } from './AnimationResolver.js';
import { SpriteAnimationTimeline } from './SpriteAnimationTimeline.js';
import type { SpriteAssetStore } from './SpriteAssetStore.js';
import { sampleSpriteAnchor } from './SpriteAnchorSampler.js';
import { sampleSpriteFrame } from './SpriteFrameSampler.js';
import type {
  SpriteAnimationSetDefinition,
  SpriteFrameDefinition,
} from './SpriteManifest.js';

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
  mirrorHorizontal: boolean,
): SpriteDrawPlacement {
  return {
    translateX: fighter.x,
    translateY: GROUND_Y - fighter.y,
    scaleX: mirrorHorizontal ? fighter.facing : 1,
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

interface ResolvedSpriteFrame {
  image: CanvasImageSource;
  frame: SpriteFrameDefinition;
  authoredLeft: boolean;
  mirrorHorizontal: boolean;
}

function selectAnimationMap(
  manifest: SpriteAnimationSetDefinition,
  fighter: FighterSnapshot,
): {
  animations: SpriteAnimationSetDefinition['animations'];
  authoredLeft: boolean;
  mirrorHorizontal: boolean;
} {
  if (fighter.facing < 0 && manifest.mirrorSafe === false) {
    if (!manifest.leftAnimations) {
      throw new Error('Sprite manifest requires leftAnimations for non-mirror-safe LEFT rendering');
    }
    return {
      animations: manifest.leftAnimations,
      authoredLeft: true,
      mirrorHorizontal: false,
    };
  }

  return {
    animations: manifest.animations,
    authoredLeft: false,
    mirrorHorizontal: manifest.mirrorSafe,
  };
}

export class SpriteFighterRenderer {
  private readonly animationTimeline = new SpriteAnimationTimeline();

  constructor(private readonly store: Pick<SpriteAssetStore, 'get'>) {}

  resetPresentation(): void {
    this.animationTimeline.reset();
  }

  draw(
    ctx: CanvasRenderingContext2D,
    fighter: FighterSnapshot,
    packageKey: string,
    combatTick: number,
    alpha = 1,
    slot: FighterIndex = 0,
  ): void {
    const { image, frame, mirrorHorizontal } = this.resolveFrame(
      fighter,
      packageKey,
      combatTick,
      slot,
    );
    const placement = computeSpriteDrawPlacement(fighter, frame, mirrorHorizontal);

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
    slot: FighterIndex = 0,
  ): Point2 | null {
    const { frame, authoredLeft } = this.resolveFrame(fighter, packageKey, combatTick, slot);
    const anchor = sampleSpriteAnchor(frame, name);
    if (!anchor) return null;

    const imageLocalX = anchor.x - frame.pivotX;
    return {
      x: authoredLeft ? -imageLocalX : imageLocalX,
      y: frame.pivotY - anchor.y,
    };
  }

  private resolveFrame(
    fighter: FighterSnapshot,
    packageKey: string,
    combatTick: number,
    slot: FighterIndex,
  ): ResolvedSpriteFrame {
    const loaded = this.store.get(packageKey);
    const resolved = this.animationTimeline.sample(
      slot,
      fighter,
      resolveSpriteAnimation(fighter, combatTick),
      combatTick,
    );
    const selection = selectAnimationMap(loaded.manifest, fighter);
    const animation = selection.animations[resolved.key];
    if (!animation) {
      const facingLabel = selection.authoredLeft ? 'LEFT' : 'RIGHT';
      throw new Error(
        `Missing sprite animation "${resolved.key}" for fighter "${fighter.id}" in package "${packageKey}" (${facingLabel})`,
      );
    }

    return {
      image: loaded.image,
      frame: sampleSpriteFrame(animation, resolved.tick).frame,
      authoredLeft: selection.authoredLeft,
      mirrorHorizontal: selection.mirrorHorizontal,
    };
  }
}
