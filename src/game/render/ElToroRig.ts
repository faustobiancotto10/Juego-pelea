import type { FighterSnapshot } from '../types.js';
import type { LocomotionPose, Point2 } from './LocomotionPose.js';
import {
  drawFacingReadableText,
  sampleBaseRigAnchors,
  solveTwoBoneLeg,
  type RigAnchors,
} from './RigAnchors.js';
import { getCharacterStructure } from './CharacterStructure.js';
import {
  drawCargoPocket,
  drawClothFold,
  drawFabricGrain,
  drawFacePlanes,
  drawHairStrands,
  drawScarfFringe,
  drawShadedEllipse,
  drawStitchLine,
} from './ReferenceDetailPrimitives.js';
import { GROUND_Y, clamp01, ellipse, lerp, pulse, roundedLine } from './drawUtils.js';

interface ToroPose {
  lean: number;
  drop: number;
  frontHand: Point2;
  backHand: Point2;
  frontFoot: Point2;
  backFoot: Point2;
  jab: number;
  shoulder: number;
  low: number;
  air: number;
  topete: number;
  shawarmaThrow: number;
  eructoCharge: number;
  eructoRelease: number;
}

function movePulse(fighter: FighterSnapshot, id: string, start: number, peak: number, end: number): number {
  return fighter.moveId === id ? pulse(fighter.moveFrame, start, peak, end) : 0;
}

function computeToroPose(fighter: FighterSnapshot, locomotion: LocomotionPose): ToroPose {
  const jab = movePulse(fighter, 'toroJab', 1, 7, 18);
  const shoulder = movePulse(fighter, 'toroShoulder', 1, 9, 24);
  const low = movePulse(fighter, 'toroLow', 1, 9, 24);
  const air = movePulse(fighter, 'toroAir', 1, 8, 22);
  const topete = movePulse(fighter, 'topete', 1, 13, 34);
  const shawarmaThrow = movePulse(fighter, 'shawarmazoThrow', 1, 13, 34);

  let eructoCharge = 0;
  let eructoRelease = 0;
  if (fighter.moveId === 'superEructo' || fighter.ultimatePhase !== 'idle') {
    if (fighter.ultimatePhase === 'startup') {
      eructoCharge = clamp01(fighter.ultimatePhaseFrame / 26);
    } else if (fighter.ultimatePhase === 'sequence') {
      eructoCharge = Math.max(0.18, 1 - fighter.ultimatePhaseFrame / 18);
      eructoRelease = clamp01(fighter.ultimatePhaseFrame / 5);
    } else if (fighter.ultimatePhase === 'recovery') {
      eructoRelease = Math.max(0, 1 - fighter.ultimatePhaseFrame / 16);
    }
  }

  const baseFront = { x: 34, y: 106 };
  const baseBack = { x: -30, y: 104 };
  const frontHand = {
    x: baseFront.x
      + jab * 52
      + shoulder * 42
      + low * 35
      + topete * 30
      + shawarmaThrow * 54
      + eructoRelease * 18,
    y: baseFront.y
      + jab * 3
      + shoulder * 3
      - low * 42
      - topete * 10
      + shawarmaThrow * 30
      + eructoCharge * 18,
  };
  const backHand = {
    x: baseBack.x
      + shoulder * 28
      + topete * 46
      + shawarmaThrow * 38
      + eructoCharge * 32,
    y: baseBack.y
      + shoulder * 4
      - low * 10
      - topete * 8
      + shawarmaThrow * 18
      + eructoCharge * 24,
  };

  const airLift = locomotion.tuck * 25 + locomotion.descentBrace * 8;
  const frontFoot = {
    x: locomotion.frontFoot.x + low * 48 + air * 34,
    y: locomotion.frontFoot.y + airLift + air * 19,
  };
  const backFoot = {
    x: locomotion.backFoot.x - low * 8 - air * 14,
    y: locomotion.backFoot.y + airLift + air * 10,
  };

  return {
    lean:
      locomotion.torsoLean
      + locomotion.chestCounterRotation
      + jab * 0.055
      + shoulder * 0.13
      + low * 0.07
      + topete * 0.24
      + shawarmaThrow * 0.1
      - eructoCharge * 0.08
      + eructoRelease * 0.1
      - (fighter.stunFrames > 0 ? 0.12 : 0)
      - (fighter.health <= 0 ? 0.95 : 0),
    drop:
      locomotion.pelvisDrop
      + (fighter.crouching ? 27 : 0)
      + low * 21
      + topete * 20
      + eructoCharge * 7
      + (fighter.health <= 0 ? 40 : 0),
    frontHand,
    backHand,
    frontFoot,
    backFoot,
    jab,
    shoulder,
    low,
    air,
    topete,
    shawarmaThrow,
    eructoCharge,
    eructoRelease,
  };
}

export function sampleElToroAnchors(
  fighter: FighterSnapshot,
  locomotion: LocomotionPose,
): RigAnchors {
  const pose = computeToroPose(fighter, locomotion);
  const base = sampleBaseRigAnchors('el-toro', locomotion);
  return {
    ...base,
    head: { x: 5 + pose.shoulder * 7 + pose.topete * 10, y: 202 - pose.drop * 0.32 },
    chest: { x: pose.shoulder * 7 + pose.topete * 12, y: 142 - pose.drop * 0.54 },
    frontHand: pose.frontHand,
    backHand: pose.backHand,
    belt: { x: 0, y: 78 - pose.drop * 0.8 },
    frontFoot: pose.frontFoot,
    backFoot: pose.backFoot,
  };
}

function drawShawarmaProp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle = 0,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = '#d8a45f';
  ctx.strokeStyle = '#5f3c24';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-13, -9);
  ctx.lineTo(14, -7);
  ctx.lineTo(10, 10);
  ctx.lineTo(-11, 9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  roundedLine(ctx, -7, -3, 8, 2, 3, '#7e3b2c');
  roundedLine(ctx, -5, 3, 7, 5, 2, '#5c9a45');
  ctx.restore();
}

export function drawElToro(
  ctx: CanvasRenderingContext2D,
  fighter: FighterSnapshot,
  locomotion: LocomotionPose,
  combatTimeSeconds: number,
): void {
  const structure = getCharacterStructure('el-toro');
  const { body, stance } = structure;
  const feetY = GROUND_Y - fighter.y;
  const pose = computeToroPose(fighter, locomotion);
  const anchors = sampleElToroAnchors(fighter, locomotion);
  const idle = Math.sin(combatTimeSeconds * 3.8 + fighter.x * 0.003) * 0.8;

  ctx.save();
  ctx.translate(fighter.x, feetY);
  ctx.scale(fighter.facing, 1);
  ctx.rotate(pose.lean);

  ctx.save();
  ctx.rotate(-pose.lean);
  ctx.globalAlpha = 0.25 * (1 - Math.min(0.7, fighter.y / 260));
  ellipse(ctx, 0, fighter.y, 56, 11, '#030407');
  ctx.restore();

  const hipTwist = locomotion.hipCounterRotation * 36;
  const chestTwist = locomotion.chestCounterRotation * 34;
  const hipSpan = 16 * body.hipWidth * stance.width;
  const frontHip: Point2 = { x: hipSpan + hipTwist, y: 79 - pose.drop };
  const backHip: Point2 = { x: -hipSpan - hipTwist, y: 79 - pose.drop };
  const frontKnee = solveTwoBoneLeg(frontHip, pose.frontFoot, 39 * body.legLength, 42 * body.legLength, 1);
  const backKnee = solveTwoBoneLeg(backHip, pose.backFoot, 39 * body.legLength, 42 * body.legLength, -1);

  // Loose black cargo pants: broad thighs and oversized pockets sell the heavy silhouette.
  roundedLine(ctx, frontHip.x, -frontHip.y, frontKnee.x, -frontKnee.y, 27 * body.legThickness, '#16191d');
  roundedLine(ctx, frontKnee.x, -frontKnee.y, pose.frontFoot.x, -pose.frontFoot.y, 22 * body.legThickness, '#101317');
  roundedLine(ctx, backHip.x, -backHip.y, backKnee.x, -backKnee.y, 27 * body.legThickness, '#121519');
  roundedLine(ctx, backKnee.x, -backKnee.y, pose.backFoot.x, -pose.backFoot.y, 22 * body.legThickness, '#0c0f13');
  // Reference cargo silhouette: oversized flap pockets, zips and stitched seams.
  drawCargoPocket(ctx, frontKnee.x - 4, -frontKnee.y - 5, 24, 19, '#24282e', '#090b0e', '#d5a64d');
  drawCargoPocket(ctx, backKnee.x + 4, -backKnee.y - 5, 24, 19, '#20242a', '#090b0e', '#c99a43');
  drawStitchLine(ctx, frontHip.x - 3, -frontHip.y + 2, frontKnee.x - 1, -frontKnee.y + 7, '#5c6269', 0.9, [3, 4], 0.34);
  drawStitchLine(ctx, backHip.x + 3, -backHip.y + 2, backKnee.x + 1, -backKnee.y + 7, '#555b62', 0.9, [3, 4], 0.32);

  // Black/white sneakers with blue trim.
  ellipse(ctx, pose.frontFoot.x + 6, -pose.frontFoot.y + 1, 21, 8, '#f2f3f4', 0.03, '#090b0d', 2);
  roundedLine(ctx, pose.frontFoot.x - 8, -pose.frontFoot.y - 2, pose.frontFoot.x + 13, -pose.frontFoot.y - 1, 2.3, '#377bc9');
  ellipse(ctx, pose.backFoot.x + 6, -pose.backFoot.y + 1, 21, 8, '#eceeef', 0.03, '#090b0d', 2);
  roundedLine(ctx, pose.backFoot.x - 8, -pose.backFoot.y - 2, pose.backFoot.x + 13, -pose.backFoot.y - 1, 2.3, '#2f69ad');

  const torsoY = -139 + pose.drop * 0.56 + idle;
  const torsoX = chestTwist + pose.topete * 4;

  // Oversized white shirt; text is drawn facing-readable below.
  ctx.save();
  ctx.translate(torsoX, 0);
  const shirtGradient = ctx.createLinearGradient(-62, torsoY - 50, 58, torsoY + 45);
  shirtGradient.addColorStop(0, '#ffffff');
  shirtGradient.addColorStop(0.46, '#f0efe8');
  shirtGradient.addColorStop(1, '#c9c7c1');
  ctx.fillStyle = shirtGradient;
  ctx.strokeStyle = '#2a2d31';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-43 * body.shoulderWidth, torsoY - 36 * body.torsoLength);
  ctx.quadraticCurveTo(-57 * body.torsoWidth, torsoY - 18 * body.torsoLength, -49 * body.torsoWidth, torsoY + 40 * body.torsoLength);
  ctx.quadraticCurveTo(0, torsoY + 51 * body.torsoLength, 52 * body.torsoWidth, torsoY + 38 * body.torsoLength);
  ctx.quadraticCurveTo(58 * body.torsoWidth, torsoY - 18 * body.torsoLength, 42 * body.shoulderWidth, torsoY - 37 * body.torsoLength);
  ctx.quadraticCurveTo(0, torsoY - 53 * body.torsoLength, -43 * body.shoulderWidth, torsoY - 36 * body.torsoLength);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  drawFabricGrain(ctx, torsoX, torsoY + 1, 98 * body.torsoWidth, 80 * body.torsoLength, '#9d978d', 0.10, 12);
  drawStitchLine(ctx, torsoX - 31, torsoY - 16, torsoX - 37, torsoY + 31, '#c7c3bb', 1, [5, 4], 0.45);
  drawStitchLine(ctx, torsoX + 31, torsoY - 16, torsoX + 38, torsoY + 31, '#c7c3bb', 1, [5, 4], 0.45);
  drawClothFold(ctx, torsoX - 12, torsoY - 22, torsoX - 18, torsoY + 3, torsoX - 10, torsoY + 31, '#ffffff', '#9f9c96', 0.25);
  drawClothFold(ctx, torsoX + 20, torsoY - 13, torsoX + 11, torsoY + 8, torsoX + 19, torsoY + 34, '#ffffff', '#aaa79f', 0.23);

  // Scotland scarf: blue/white saltire bands, fringe and two loose tails with secondary sway.
  const scarfSway = Math.sin(combatTimeSeconds * 5.2) * 4 + locomotion.actualTravel * 0.22;
  ctx.save();
  ctx.translate(torsoX, 0);
  roundedLine(ctx, -25, torsoY - 35, 29, torsoY - 33, 11, '#2d67ad');
  roundedLine(ctx, -22, torsoY - 35, 26, torsoY - 33, 3, '#f5f7f8');
  roundedLine(ctx, -18, torsoY - 28, -31 - scarfSway, torsoY + 29, 10, '#2d67ad');
  roundedLine(ctx, -18, torsoY - 18, -31 - scarfSway, torsoY + 23, 2.5, '#f5f7f8');
  // Small crossing white strokes evoke the Saltire at gameplay scale.
  roundedLine(ctx, -27, torsoY + 2, -17, torsoY + 14, 2.3, '#f5f7f8');
  roundedLine(ctx, -18, torsoY + 2, -28, torsoY + 14, 2.3, '#f5f7f8');
  drawScarfFringe(ctx, -37 - scarfSway, torsoY + 28, -1, '#f5f7f8');
  ctx.restore();

  ctx.save();
  ctx.fillStyle = '#101317';
  ctx.font = '900 9px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  drawFacingReadableText(ctx, fighter.facing, torsoX + 5, torsoY + 1, 'TE VOY A CHOCAR');
  ctx.restore();

  // South Africa belt band, Springbok cue, hanging tag and shawarma waist charm.
  roundedLine(ctx, -27, -anchors.belt.y + 1, 29, -anchors.belt.y + 1, 7, '#176b42');
  roundedLine(ctx, -18, -anchors.belt.y + 1, -3, -anchors.belt.y + 1, 2.4, '#f1c84b');
  roundedLine(ctx, 3, -anchors.belt.y + 1, 19, -anchors.belt.y + 1, 2.4, '#c8443c');
  ellipse(ctx, torsoX + 30, torsoY + 22, 8, 5, '#17764a', -0.12, '#d9b64b', 1.2);
  roundedLine(ctx, anchors.belt.x - 4, -anchors.belt.y + 5, anchors.belt.x - 4, -anchors.belt.y + 20, 1.6, '#c6c9cc');
  ctx.save();
  ctx.fillStyle = '#2a8a59';
  ctx.strokeStyle = '#d7bf58';
  ctx.lineWidth = 1.2;
  ctx.fillRect(anchors.belt.x - 10, -anchors.belt.y + 18, 12, 14);
  ctx.strokeRect(anchors.belt.x - 10, -anchors.belt.y + 18, 12, 14);
  ctx.restore();
  drawShawarmaProp(ctx, anchors.belt.x - 20, -anchors.belt.y + 5, -0.25);

  const shoulderY = torsoY - 27;
  const frontElbow = {
    x: lerp(torsoX + 30 * body.shoulderWidth, pose.frontHand.x, 0.52),
    y: lerp(126 - pose.drop * 0.45, pose.frontHand.y, 0.52),
  };
  const backElbow = {
    x: lerp(torsoX - 30 * body.shoulderWidth, pose.backHand.x, 0.52),
    y: lerp(124 - pose.drop * 0.45, pose.backHand.y, 0.52),
  };
  roundedLine(ctx, torsoX + 32 * body.shoulderWidth, shoulderY, frontElbow.x, -frontElbow.y, 20 * body.armThickness, '#eeeDE7');
  roundedLine(ctx, frontElbow.x, -frontElbow.y, pose.frontHand.x, -pose.frontHand.y, 15 * body.forearmThickness, '#bf805f');
  roundedLine(ctx, torsoX - 32 * body.shoulderWidth, shoulderY + 2, backElbow.x, -backElbow.y, 20 * body.armThickness, '#e7e6df');
  roundedLine(ctx, backElbow.x, -backElbow.y, pose.backHand.x, -pose.backHand.y, 15 * body.forearmThickness, '#b97858');

  // Blue hand/wrist wraps.
  roundedLine(ctx, pose.frontHand.x - 6, -pose.frontHand.y, pose.frontHand.x + 4, -pose.frontHand.y, 10, '#2f74c7');
  roundedLine(ctx, pose.backHand.x - 6, -pose.backHand.y, pose.backHand.x + 4, -pose.backHand.y, 10, '#285f9f');
  ellipse(ctx, pose.frontHand.x + 6, -pose.frontHand.y, 8, 7, '#c88b67');
  ellipse(ctx, pose.backHand.x + 6, -pose.backHand.y, 8, 7, '#c08160');

  const headX = anchors.head.x + torsoX * 0.14;
  const headY = -anchors.head.y + idle;
  drawShadedEllipse(ctx, headX, headY, 37 * body.headWidth, 40 * body.headHeight, '#c98b67', '#efb08b', '#8d5b47', -0.02, '#57382c', 2.4);
  drawFacePlanes(ctx, headX, headY, body.headWidth, '#ffd0ae', '#7e493b');
  ellipse(ctx, headX - 29 * body.headWidth, headY + 2, 5.5, 8.5, '#b97959', -0.1, '#664034', 1.2);

  // Reference mullet: heavy crown plus longer rear locks down the neck.
  ctx.save();
  ctx.fillStyle = '#2b211d';
  ctx.beginPath();
  ctx.moveTo(headX - 31, headY - 9);
  ctx.quadraticCurveTo(headX - 43, headY + 17, headX - 29, headY + 42);
  ctx.quadraticCurveTo(headX - 17, headY + 34, headX - 13, headY + 8);
  ctx.closePath();
  ctx.fill();
  const locks: readonly [number, number, number][] = [
    [-29,-31,10],[-17,-42,11],[-3,-46,12],[12,-44,12],[27,-35,11],
    [-32,-20,9],[-18,-27,10],[-2,-31,11],[14,-29,10],[31,-22,9],
  ];
  for (const [dx,dy,r] of locks) {
    ctx.beginPath();
    ctx.arc(headX + dx, headY + dy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  drawHairStrands(ctx, [
    [headX - 25, headY - 35, headX - 17, headY - 15],
    [headX - 8, headY - 43, headX - 3, headY - 20],
    [headX + 10, headY - 41, headX + 17, headY - 18],
    [headX - 31, headY + 2, headX - 27, headY + 31],
  ], '#8a6657', 0.28);
  ctx.restore();
  roundedLine(ctx, headX + 3, headY - 8, headX + 18, headY - 9, 2.6, '#4a3027');
  ellipse(ctx, headX + 15, headY - 2, 2.4, 2.0, '#0b0d10');
  ctx.save();
  ctx.strokeStyle = '#754a3b';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(headX + 14, headY + 3);
  ctx.quadraticCurveTo(headX + 22, headY + 7, headX + 20, headY + 13);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(headX + 8, headY + 21);
  ctx.quadraticCurveTo(headX + 16, headY + 24, headX + 23, headY + 20);
  ctx.stroke();
  ctx.restore();
  // Warm cheek/nose treatment from the master art.
  ctx.save();
  ctx.globalAlpha = 0.18;
  ellipse(ctx, headX + 22, headY + 8, 10, 7, '#d56f5f');
  ellipse(ctx, headX + 8, headY + 5, 7, 5, '#d56f5f');
  ctx.restore();
  roundedLine(ctx, headX + 15, headY + 6, headX + 24, headY + 12, 1.4, '#7b4d3d');

  if (pose.eructoCharge > 0.05 || pose.eructoRelease > 0.05) {
    const open = Math.max(pose.eructoCharge * 0.65, pose.eructoRelease);
    ellipse(ctx, headX + 22, headY + 18, 7 + open * 3, 5 + open * 5, '#4c1917', 0.04, '#1a0909', 1.5);
    ctx.save();
    ctx.globalAlpha = 0.16 + open * 0.2;
    ellipse(ctx, headX + 31, headY + 17, 13 + open * 8, 7 + open * 4, '#86c95b');
    ctx.restore();
  } else {
    roundedLine(ctx, headX + 8, headY + 21, headX + 23, headY + 21, 2.5, '#5a302b');
  }

  // During the throw, the authored shawarma is visibly in the hand before simulation spawns the projectile.
  if (fighter.moveId === 'shawarmazoThrow' && fighter.moveFrame <= 13) {
    drawShawarmaProp(ctx, pose.frontHand.x + 4, -pose.frontHand.y - 5, -0.25 + pose.shawarmaThrow * 0.7);
  }

  if (fighter.blocking) {
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.strokeStyle = '#8fc0ff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(18, torsoY - 2, 54, -1.08, 1.05);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}
