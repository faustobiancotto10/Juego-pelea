import type { FighterSnapshot } from '../types.js';
import type { LocomotionPose } from './LocomotionPose.js';
import { getCharacterStructure } from './CharacterStructure.js';
import {
  drawClothFold,
  drawFabricGrain,
  drawFacePlanes,
  drawHairStrands,
  drawShadedEllipse,
  drawStitchLine,
} from './ReferenceDetailPrimitives.js';
import { getAirPresentationPose, getMovePresentationPhase } from './PresentationPose.js';
import { GROUND_Y, ellipse, lerp, polygon, pulse, roundedLine } from './drawUtils.js';

function noseFactor(f: FighterSnapshot): number {
  if (f.moveId === 'airNose') return pulse(f.moveFrame, 1, 7, 16) * 0.92;
  if (!f.moveId?.startsWith('nose')) return 0;
  if (f.moveId === 'nose1') return pulse(f.moveFrame, 1, 5, 12) * 0.45;
  if (f.moveId === 'nose2') return pulse(f.moveFrame, 1, 5, 13) * 0.7;
  return pulse(f.moveFrame, 2, 7, 17);
}

export function drawSupernariz(
  ctx: CanvasRenderingContext2D,
  f: FighterSnapshot,
  locomotion: LocomotionPose,
  time: number,
): void {
  const structure = getCharacterStructure('supernariz');
  const { body, stance } = structure;
  const feetY = GROUND_Y - f.y;
  const idle = Math.sin(time * 5.8 + f.x * 0.01) * 1.2;
  const crouch = f.crouching ? 1 : 0;
  const block = f.blocking ? 1 : 0;
  const guardBreak = f.guardBreakFrames > 0 ? 1 : 0;
  const movePhase = getMovePresentationPhase(f);
  const motion = getAirPresentationPose(f);
  const lowNose = f.moveId === 'noseLow'
    ? Math.max(movePhase.active, (1 - movePhase.startup) * (1 - movePhase.recovery) * 0.74)
    : 0;
  const ultimateStartup = f.ultimatePhase === 'startup' ? 1 : 0;
  const ultimateCapture = f.ultimatePhase === 'capture' ? 1 : 0;
  const ultimateSequence = f.ultimatePhase === 'sequence' ? 1 : 0;
  const nose = Math.max(noseFactor(f), ultimateSequence * 0.96);
  const tramontana = f.moveId === 'tramontana' ? pulse(f.moveFrame, 3, 10, 24) : 0;
  const throwPose = f.moveId === 'chorizoThrow' ? pulse(f.moveFrame, 1, 8, 21) : 0;
  const ko = f.health <= 0 ? 1 : 0;
  const hurtLean = f.stunFrames > 0 ? -0.16 : 0;
  const airNose = f.moveId === 'airNose' ? Math.max(nose, movePhase.active) : 0;
  const inhaleBrace = ultimateStartup * 0.72 + ultimateCapture;
  const airTilt = -motion.ascent * 0.06 + motion.descent * 0.1;
  const landingCompression = locomotion.landingAbsorption * 4;
  const nazazoDrive = ultimateSequence;
  // Consume only pre-existing render-only gait channels so Supernariz's cape,
  // hips and free arm inherit the authored locomotion signature.
  const hipTwist = locomotion.hipCounterRotation * 125;
  const chestTwist = locomotion.chestCounterRotation;
  const freeArmSwing = locomotion.freeArmSwing;
  const weightShift = locomotion.weightTransfer;
  const lean =
    nose * 0.16
    + airNose * 0.12
    + throwPose * 0.07
    + tramontana * 0.09
    + lowNose * 0.05
    + airTilt
    - ultimateStartup * 0.09
    - ultimateCapture * 0.16
    + ultimateSequence * 0.15
    + locomotion.torsoLean
    + chestTwist * 0.20
    + stance.forwardLean * 0.16
    + hurtLean
    - ko * 1.08;
  const bodyDrop =
    locomotion.pelvisDrop
    + crouch * 32
    + lowNose * 25
    + landingCompression
    + ultimateStartup * 5
    + ko * 44;

  ctx.save();
  ctx.translate(f.x, feetY);
  ctx.scale(f.facing, 1);
  ctx.rotate(lean);

  ctx.save();
  ctx.rotate(-lean);
  ctx.globalAlpha = 0.22 * (1 - Math.min(0.65, f.y / 260));
  ellipse(ctx, 0, f.y, 46, 10, '#05070a');
  ctx.restore();

  const hipY = -72 + bodyDrop;
  const shoulderY = -151 - (body.torsoLength - 1) * 46 + bodyDrop * 0.45 + idle;
  const hipSpan = 12 * body.hipWidth * stance.width;
  const jumpTuck = locomotion.tuck * 25 + locomotion.descentBrace * 10;
  const backFootX = locomotion.backFoot.x;
  const frontFootX = locomotion.frontFoot.x;
  const backFootY = -locomotion.backFoot.y - jumpTuck;
  const frontFootY = -locomotion.frontFoot.y - jumpTuck - locomotion.extension * 3;
  const knee =
    crouch * 20
    + lowNose * 21
    + motion.airborne * (10 + motion.apex * 13)
    + locomotion.landingAbsorption * 8;

  // Cape goes behind the body with a wind-responsive Bézier silhouette.
  ctx.save();
  ctx.fillStyle = '#9e202c';
  ctx.strokeStyle = '#56131a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-18, shoulderY + 5);
  ctx.bezierCurveTo(
    -52 - Math.abs(f.vx) * 2 - inhaleBrace * 24 - freeArmSwing * 0.22,
    shoulderY + 18 - inhaleBrace * 10 - weightShift * 0.18,
    -65 - Math.sin(time * 3) * 10 - inhaleBrace * 34 + nazazoDrive * 16 - freeArmSwing * 0.48,
    -62 + bodyDrop * 0.4 - inhaleBrace * 12 - weightShift * 0.30,
    -35 - inhaleBrace * 18 + nazazoDrive * 12 - freeArmSwing * 0.20,
    -34 + bodyDrop * 0.5,
  );
  ctx.lineTo(-8, -72 + bodyDrop * 0.45);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  drawStitchLine(ctx, -27, shoulderY + 19, -43, -43 + bodyDrop * 0.45, '#c84750', 1, [5, 5], 0.38);
  drawStitchLine(ctx, -17, shoulderY + 17, -29, -38 + bodyDrop * 0.45, '#7f1822', 1, [5, 5], 0.45);
  // A lighter inner fold and heavy hem give the cape volume at gameplay scale.
  ctx.globalAlpha = 0.52;
  ctx.fillStyle = '#c84249';
  ctx.beginPath();
  ctx.moveTo(-22, shoulderY + 10);
  ctx.bezierCurveTo(-38, shoulderY + 31, -47, -58 + bodyDrop * 0.45, -31, -42 + bodyDrop * 0.48);
  ctx.lineTo(-17, -68 + bodyDrop * 0.44);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 0.85;
  roundedLine(ctx, -42, -39 + bodyDrop * 0.48, -21, -64 + bodyDrop * 0.46, 3.5, '#64151d');
  ellipse(ctx, -17, shoulderY + 8, 5.5, 5.5, '#d9b85a', 0, '#6c4a1f', 1.2);
  ctx.restore();

  // Legs and boots follow root travel rather than a wall-time oscillator.
  const rearHipX = -hipSpan - hipTwist + weightShift * 0.18;
  const frontHipX = hipSpan - hipTwist + weightShift * 0.22;
  const backKneeX = lerp(rearHipX, backFootX, 0.54) - 6;
  const frontKneeX = lerp(frontHipX, frontFootX, 0.54) + 6;
  roundedLine(ctx, rearHipX, hipY, backKneeX, -30 + knee + backFootY * 0.34, 19 * body.legThickness, '#2f5fb2');
  roundedLine(ctx, backKneeX, -30 + knee + backFootY * 0.34, backFootX, backFootY - 5, 15 * body.legThickness, '#376dc8');
  roundedLine(ctx, frontHipX, hipY, frontKneeX, -29 + knee + frontFootY * 0.34, 19 * body.legThickness, '#2f5fb2');
  roundedLine(ctx, frontKneeX, -29 + knee + frontFootY * 0.34, frontFootX, frontFootY - 5, 15 * body.legThickness, '#376dc8');
  // Red boot shafts break up the long blue legs and strengthen the superhero silhouette.
  roundedLine(ctx, backFootX - 1, backFootY - 18, backFootX, backFootY - 5, 13, '#a62b34');
  roundedLine(ctx, frontFootX, frontFootY - 18, frontFootX + 1, frontFootY - 5, 13, '#a62b34');
  ellipse(ctx, backFootX, backFootY - 18, 8, 4, '#c94750', 0, '#651920', 1);
  ellipse(ctx, frontFootX + 1, frontFootY - 18, 8, 4, '#c94750', 0, '#651920', 1);
  roundedLine(ctx, backFootX - 10, backFootY - 4, backFootX + 12, backFootY - 4, 10, '#a62b34');
  roundedLine(ctx, frontFootX - 10, frontFootY - 4, frontFootX + 13, frontFootY - 4, 10, '#a62b34');
  roundedLine(ctx, backFootX - 8, backFootY + 1, backFootX + 12, backFootY + 1, 2.5, '#4d151a');
  roundedLine(ctx, frontFootX - 8, frontFootY + 1, frontFootX + 13, frontFootY + 1, 2.5, '#4d151a');

  // Slim textured superhero suit from the supplied master.
  drawShadedEllipse(ctx, 0, -112 + bodyDrop * 0.62, 29 * body.torsoWidth, (55 - crouch * 8) * body.torsoLength, '#2d61bd', '#5e91e5', '#17356b', -0.03, '#16376f', 3);
  drawFabricGrain(ctx, 0, -112 + bodyDrop * 0.62, 52 * body.torsoWidth, 98 * body.torsoLength, '#8fb1ef', 0.10, 9);
  drawClothFold(ctx, -13, -139 + bodyDrop * 0.6, -18, -112 + bodyDrop * 0.62, -11, -80 + bodyDrop * 0.64, '#87acf0', '#0f2c61', 0.24);
  drawClothFold(ctx, 17, -135 + bodyDrop * 0.6, 10, -110 + bodyDrop * 0.62, 16, -82 + bodyDrop * 0.64, '#7ba4ea', '#102e64', 0.22);
  // Red side panels and shoulder yoke make the costume read as layered tailoring, not a blue capsule.
  polygon(ctx, [[-25,-145 + bodyDrop * 0.60],[-17,-145 + bodyDrop * 0.60],[-15,-82 + bodyDrop * 0.64],[-24,-76 + bodyDrop * 0.64]], '#8e2530');
  polygon(ctx, [[22,-143 + bodyDrop * 0.60],[15,-143 + bodyDrop * 0.60],[14,-83 + bodyDrop * 0.64],[23,-77 + bodyDrop * 0.64]], '#9d2934');
  ctx.save();
  ctx.globalAlpha = 0.55;
  roundedLine(ctx, -20, -145 + bodyDrop * 0.6, 20, -145 + bodyDrop * 0.6, 4, '#d44d55');
  ctx.restore();
  // Chest nose emblem: deliberately reads as a bulbous nose, not a generic oval.
  ctx.save();
  ctx.fillStyle = '#d29a77';
  ctx.strokeStyle = '#754638';
  ctx.lineWidth = 1.7;
  ctx.beginPath();
  ctx.moveTo(6, -137 + bodyDrop * 0.58);
  ctx.bezierCurveTo(-5, -111 + bodyDrop * 0.58, -8, -111 + bodyDrop * 0.58, 4, -108 + bodyDrop * 0.58);
  ctx.bezierCurveTo(18, -89 + bodyDrop * 0.58, 24, -119 + bodyDrop * 0.58, 17, -128 + bodyDrop * 0.58);
  ctx.bezierCurveTo(14, -134 + bodyDrop * 0.58, 11, -138 + bodyDrop * 0.58, 6, -137 + bodyDrop * 0.58);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ellipse(ctx, 0, -95 + bodyDrop * 0.58, 5, 3, '#bd7b60');
  ellipse(ctx, 13, -95 + bodyDrop * 0.58, 5, 3, '#bd7b60');
  ctx.restore();
  roundedLine(ctx, -25, -70 + bodyDrop * 0.65, 25, -70 + bodyDrop * 0.65, 8, '#8c2530');
  drawStitchLine(ctx, -22, -75 + bodyDrop * 0.65, 22, -75 + bodyDrop * 0.65, '#cf6f75', 0.9, [4, 4], 0.45);

  // Belt buckle and hanging sausage props from the master.
  ellipse(ctx, 0, -74 + bodyDrop * 0.65, 11, 8, '#d8b45a', 0, '#6f5122', 1.5);
  roundedLine(ctx, -18, -74 + bodyDrop * 0.65, 18, -74 + bodyDrop * 0.65, 5, '#6e4a2c');
  for (const bx of [16, 24, 31]) {
    ellipse(ctx, bx, -64 + bodyDrop * 0.65, 4.5, 10, '#c46d42', 0.18, '#7a3e2c', 1);
    roundedLine(ctx, bx - 3, -67 + bodyDrop * 0.65, bx + 3, -64 + bodyDrop * 0.65, 1.4, '#f0b17f');
  }
  ctx.save();
  ctx.fillStyle = '#744628';
  ctx.strokeStyle = '#3e2819';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.roundRect(-28, -72 + bodyDrop * 0.65, 12, 14, 3);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Arms. Throwing arm swings forward for the chorizo special.
  const frontHandX =
    30
    + throwPose * 38
    + tramontana * 24
    + lowNose * 22
    - inhaleBrace * 20
    + nazazoDrive * 46
    + block * -2
    + freeArmSwing * 0.24;
  const frontHandY =
    shoulderY
    + 20
    - throwPose * 21
    - tramontana * 14
    + lowNose * 42
    - inhaleBrace * 24
    - nazazoDrive * 12
    - block * 26;
  const shoulderSpan = 17 * body.shoulderWidth;
  roundedLine(ctx, shoulderSpan, shoulderY + 3, frontHandX, frontHandY, 13 * body.armThickness, '#2e65c3');
  ellipse(ctx, frontHandX + 2, frontHandY, 8, 8, '#a92d37');
  const rearHandX = -30 + block * 23 - freeArmSwing * 0.42;
  const rearHandY = shoulderY + 26 - block * 30 + Math.abs(freeArmSwing) * 0.08;
  roundedLine(ctx, -shoulderSpan, shoulderY + 6, rearHandX, rearHandY, 13 * body.armThickness, '#285aa9');
  ellipse(ctx, rearHandX - 1, rearHandY, 8, 8, '#a52b35');

  // Stylized head and hair.
  const headX =
    4
    + nose * 8
    - inhaleBrace * 8
    + nazazoDrive * 8
    + chestTwist * 44
    + weightShift * 0.18;
  const headY =
    -205
    + bodyDrop * 0.42
    + idle
    - motion.ascent * 5
    + motion.apex * 3
    + motion.descent * 7;
  drawShadedEllipse(ctx, headX, headY, 36 * body.headWidth, 39 * body.headHeight, '#d4a07f', '#efbf9c', '#925f49', -0.03, '#694435', 2.4);
  drawFacePlanes(ctx, headX, headY, body.headWidth, '#ffd6b7', '#815040');
  ellipse(ctx, headX - 29 * body.headWidth, headY + 1, 5.2, 8, '#c58d6e', -0.08, '#70483a', 1);
  ctx.save();
  ctx.fillStyle = '#191a1b';
  ctx.beginPath();
  ctx.moveTo(headX - 33, headY - 18);
  ctx.bezierCurveTo(headX - 26, headY - 52, headX + 18, headY - 53, headX + 31, headY - 23);
  ctx.bezierCurveTo(headX + 13, headY - 35, headX - 8, headY - 30, headX - 33, headY - 18);
  ctx.fill();
  drawHairStrands(ctx, [
    [headX - 23, headY - 34, headX - 15, headY - 20],
    [headX - 8, headY - 42, headX - 2, headY - 25],
    [headX + 8, headY - 42, headX + 13, headY - 26],
    [headX + 21, headY - 34, headX + 24, headY - 19],
  ], '#655047', 0.28);
  ctx.restore();
  roundedLine(ctx, headX + 3, headY - 8, headX + 16, headY - 9, 2.5, '#4a3127');
  ellipse(ctx, headX + 13, headY - 2, 2.3, 2.0, '#101317');
  ctx.save();
  ctx.strokeStyle = '#7b4d3c';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(headX + 11, headY + 3);
  ctx.quadraticCurveTo(headX + 17, headY + 7, headX + 16, headY + 12);
  ctx.stroke();
  ctx.restore();
  roundedLine(ctx, headX + 7, headY + 20, headX + 20, headY + 20, 2.0, '#6b302e');

  // The nose is an articulated tapered vector path; combo moves change its length and arc.
  const noseLength = lerp(
    52,
    f.moveId === 'nose3' ? 148 : f.moveId === 'airNose' ? 134 : f.moveId === 'noseLow' ? 114 : 124,
    Math.max(nose, lowNose),
  ) + nazazoDrive * 24 - inhaleBrace * 8;
  const noseLift =
    (f.moveId === 'nose2'
      ? -12 * nose
      : f.moveId === 'nose3'
        ? 7 * nose
        : f.moveId === 'airNose'
          ? 20 * nose + motion.descent * 9
          : f.moveId === 'noseLow'
            ? 38 * lowNose
            : 0)
    - inhaleBrace * 8
    + nazazoDrive * 9;
  ctx.save();
  ctx.fillStyle = '#c98668';
  ctx.strokeStyle = '#754635';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(headX + 16, headY + 1);
  ctx.bezierCurveTo(
    headX + noseLength * 0.34,
    headY - 9 + noseLift,
    headX + noseLength * 0.72,
    headY - 4 + noseLift,
    headX + noseLength,
    headY + 4 + noseLift,
  );
  ctx.bezierCurveTo(
    headX + noseLength + 9,
    headY + 9 + noseLift,
    headX + noseLength + 2,
    headY + 19 + noseLift,
    headX + noseLength - 9,
    headY + 18 + noseLift,
  );
  ctx.bezierCurveTo(
    headX + noseLength * 0.58,
    headY + 21 + noseLift,
    headX + noseLength * 0.34,
    headY + 18,
    headX + 16,
    headY + 16,
  );
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ellipse(ctx, headX + noseLength - 1, headY + 10 + noseLift, 10.5, 9.5, '#bd775c', -0.05, '#754635', 1.2);
  ellipse(ctx, headX + noseLength + 2, headY + 10 + noseLift, 2.3, 1.8, '#5f3a31');
  ctx.globalAlpha = 0.32;
  ellipse(ctx, headX + noseLength - 5, headY + 5 + noseLift, 4.5, 2.4, '#f2b294');
  ctx.globalAlpha = 1;
  ctx.restore();

  if (tramontana > 0.01) {
    // Wind/ice ribbon produced entirely in code.
    ctx.save();
    ctx.globalAlpha = 0.35 + tramontana * 0.3;
    ctx.strokeStyle = '#bfeaff';
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i += 1) {
      const yy = -132 + i * 28;
      ctx.beginPath();
      ctx.moveTo(38, yy);
      ctx.bezierCurveTo(95, yy - 24 + i * 5, 145, yy + 20, 220 * tramontana + 40, yy - 6);
      ctx.stroke();
    }
    ctx.strokeStyle = '#f1fbff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(52, -118);
    ctx.quadraticCurveTo(125, -160, 225 * tramontana + 30, -121);
    ctx.stroke();
    ctx.restore();
  }

  if (block) {
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.strokeStyle = '#83b5ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(28, -123 + bodyDrop * 0.45, 46, -1.2, 1.1);
    ctx.stroke();
    ctx.restore();
  }
  // Guard Break remains readable for the full simulation-authored state.
  if (guardBreak) {
    ctx.save();
    const flash = 0.42 + 0.18 * Math.sin(time * 18);
    ctx.globalAlpha = flash;
    ctx.strokeStyle = '#ff8078';
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.arc(8, -110 + bodyDrop * 0.5, 57, -1.42, -0.28);
    ctx.arc(8, -110 + bodyDrop * 0.5, 57, 0.08, 0.92);
    ctx.arc(8, -110 + bodyDrop * 0.5, 57, 1.18, 2.05);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 0.12;
    ellipse(ctx, 8, -110 + bodyDrop * 0.5, 61, 98, '#ff9a86');
    ctx.restore();
  }

  if (f.chilledFrames > 0) {
    ctx.save();
    ctx.globalAlpha = 0.13 + 0.07 * Math.sin(time * 12);
    polygon(ctx, [[-42,-194],[38,-204],[51,-44],[-40,-40]], '#bfefff');
    ctx.restore();
  }

  ctx.restore();
}
