import type { FighterSnapshot } from '../types.js';
import { getCharacterStructure } from './CharacterStructure.js';
import type { LocomotionPose, Point2 } from './LocomotionPose.js';

export type { Point2 } from './LocomotionPose.js';

export interface RigAnchors {
  head: Point2;
  face: Point2;
  chest: Point2;
  frontShoulder: Point2;
  backShoulder: Point2;
  frontHand: Point2;
  backHand: Point2;
  belt: Point2;
  frontHip: Point2;
  backHip: Point2;
  frontFoot: Point2;
  backFoot: Point2;
  accessoryRoot: Point2;
}

interface RigAnchorProfile {
  head: Point2;
  chest: Point2;
  frontHand: Point2;
  backHand: Point2;
  belt: Point2;
}

const PROFILES: Readonly<Record<string, RigAnchorProfile>> = Object.freeze({
  chameleon: {
    head: { x: 4, y: 155 },
    chest: { x: 0, y: 98 },
    frontHand: { x: 24, y: 105 },
    backHand: { x: -24, y: 104 },
    belt: { x: 0, y: 60 },
  },
  supernariz: {
    head: { x: 4, y: 170 },
    chest: { x: 0, y: 112 },
    frontHand: { x: 30, y: 106 },
    backHand: { x: -30, y: 104 },
    belt: { x: 0, y: 66 },
  },
  juanchi: {
    head: { x: 3, y: 181 },
    chest: { x: 0, y: 126 },
    frontHand: { x: 31, y: 111 },
    backHand: { x: -30, y: 109 },
    belt: { x: -17, y: 72 },
  },
  'el-toro': {
    head: { x: 5, y: 174 },
    chest: { x: 0, y: 114 },
    frontHand: { x: 34, y: 106 },
    backHand: { x: -30, y: 104 },
    belt: { x: 0, y: 66 },
  },
});

/**
 * Shared render-only articulation anchors.
 *
 * Existing hand/head/belt coordinates remain fighter-authored. Extra shoulder,
 * hip, face and accessory anchors are derived from CharacterStructure so
 * motion/effects lanes can attach secondary motion without guessing anatomy
 * or editing fighter-specific rigs concurrently.
 */
export function sampleBaseRigAnchors(
  rigKey: string,
  pose: LocomotionPose,
): RigAnchors {
  const profile = PROFILES[rigKey] ?? PROFILES.juanchi!;
  const structure = getCharacterStructure(rigKey);
  const drop = pose.pelvisDrop;
  const head = { x: profile.head.x, y: profile.head.y - drop * 0.34 };
  const chest = { x: profile.chest.x, y: profile.chest.y - drop * 0.55 };
  const belt = { x: profile.belt.x, y: profile.belt.y - drop * 0.8 };

  const shoulderHalf = 24 * structure.body.shoulderWidth;
  const hipHalf = 12 * structure.body.hipWidth;
  const shoulderY = chest.y + 15 * structure.body.torsoLength;
  const hipY = belt.y + 8;
  const faceProjection = 6 * structure.detail.faceProjection;

  return {
    head,
    face: {
      x: head.x + faceProjection,
      y: head.y - 2,
    },
    chest,
    frontShoulder: {
      x: chest.x + shoulderHalf,
      y: shoulderY,
    },
    backShoulder: {
      x: chest.x - shoulderHalf,
      y: shoulderY,
    },
    frontHand: { x: profile.frontHand.x, y: profile.frontHand.y - drop * 0.48 },
    backHand: { x: profile.backHand.x, y: profile.backHand.y - drop * 0.48 },
    belt,
    frontHip: {
      x: belt.x + hipHalf,
      y: hipY,
    },
    backHip: {
      x: belt.x - hipHalf,
      y: hipY,
    },
    frontFoot: pose.frontFoot,
    backFoot: pose.backFoot,
    accessoryRoot: {
      x: chest.x,
      y: chest.y + 10,
    },
  };
}

export function localAnchorToWorld(
  fighter: FighterSnapshot,
  point: Point2,
): Point2 {
  return {
    x: fighter.x + fighter.facing * point.x,
    y: fighter.y + point.y,
  };
}

export function solveTwoBoneLeg(
  hip: Point2,
  foot: Point2,
  upperLength: number,
  lowerLength: number,
  bendSign: -1 | 1,
): Point2 {
  const dx = foot.x - hip.x;
  const dy = foot.y - hip.y;
  const rawDistance = Math.hypot(dx, dy);
  const minDistance = Math.max(0.001, Math.abs(upperLength - lowerLength) + 0.001);
  const maxDistance = Math.max(minDistance, upperLength + lowerLength - 0.001);
  const distance = Math.min(maxDistance, Math.max(minDistance, rawDistance));
  const ux = rawDistance > 0.0001 ? dx / rawDistance : 0;
  const uy = rawDistance > 0.0001 ? dy / rawDistance : -1;
  const along = (upperLength * upperLength - lowerLength * lowerLength + distance * distance)
    / (2 * distance);
  const height = Math.sqrt(Math.max(0, upperLength * upperLength - along * along));
  return {
    x: hip.x + ux * along - uy * height * bendSign,
    y: hip.y + uy * along + ux * height * bendSign,
  };
}

export function drawFacingReadableText(
  ctx: CanvasRenderingContext2D,
  facing: -1 | 1,
  x: number,
  y: number,
  text: string,
): void {
  ctx.save();
  ctx.translate(x, y);
  // The fighter transform already mirrors by facing; applying the same scale
  // locally cancels glyph mirroring while preserving the shirt anchor.
  ctx.scale(facing, 1);
  ctx.fillText(text, 0, 0);
  ctx.restore();
}
