import type { FighterSnapshot } from '../types.js';
import type { LocomotionPose, Point2 } from './LocomotionPose.js';

export type { Point2 } from './LocomotionPose.js';

export interface RigAnchors {
  head: Point2;
  chest: Point2;
  frontHand: Point2;
  backHand: Point2;
  belt: Point2;
  frontFoot: Point2;
  backFoot: Point2;
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
});

export function sampleBaseRigAnchors(
  rigKey: string,
  pose: LocomotionPose,
): RigAnchors {
  const profile = PROFILES[rigKey] ?? PROFILES.juanchi!;
  const drop = pose.pelvisDrop;
  return {
    head: { x: profile.head.x, y: profile.head.y - drop * 0.34 },
    chest: { x: profile.chest.x, y: profile.chest.y - drop * 0.55 },
    frontHand: { x: profile.frontHand.x, y: profile.frontHand.y - drop * 0.48 },
    backHand: { x: profile.backHand.x, y: profile.backHand.y - drop * 0.48 },
    belt: { x: profile.belt.x, y: profile.belt.y - drop * 0.8 },
    frontFoot: pose.frontFoot,
    backFoot: pose.backFoot,
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
