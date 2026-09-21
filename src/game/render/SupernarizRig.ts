import type { FighterSnapshot } from '../types.js';
import type { LocomotionPose } from './LocomotionPose.js';
import { getCharacterStructure } from './CharacterStructure.js';
import {
  drawFabricGrain,
  drawHairStrands,
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
    -52 - Math.abs(f.vx) * 2 - inhaleBrace * 24,
    shoulderY + 18 - inhaleBrace * 10,
    -65 - Math.sin(time * 3) * 10 - inhaleBrace * 34 + nazazoDrive * 16,
    -62 + bodyDrop * 0.4 - inhaleBrace * 12,
    -35 - inhaleBrace * 18 + nazazoDrive * 12,
    -34 + bodyDrop * 0.5,
  );
  ctx.lineTo(-8, -72 + bodyDrop * 0.45);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  drawStitchLine(ctx, -27, shoulderY + 19, -43, -43 + bodyDrop * 0.45, '#c84750', 1, [5, 5], 0.38);
  drawStitchLine(ctx, -17, shoulderY + 17, -29, -38 + bodyDrop * 0.45, '#7f1822', 1, [5, 5], 0.45);
  ctx.restore();

  // Legs and boots follow root travel rather than a wall-time oscillator.
  const backKneeX = lerp(-hipSpan, backFootX, 0.54) - 6;
  const frontKneeX = lerp(hipSpan, frontFootX, 0.54) + 6;
  roundedLine(ctx, -hipSpan, hipY, backKneeX, -30 + knee + backFootY * 0.34, 19 * body.legThickness, '#2f5fb2');
  roundedLine(ctx, backKneeX, -30 + knee + backFootY * 0.34, backFootX, backFootY - 5, 15 * body.legThickness, '#376dc8');
  roundedLine(ctx, hipSpan, hipY, frontKneeX, -29 + knee + frontFootY * 0.34, 19 * body.legThickness, '#2f5fb2');
  roundedLine(ctx, frontKneeX, -29 + knee + frontFootY * 0.34, frontFootX, frontFootY - 5, 15 * body.legThickness, '#376dc8');
  roundedLine(ctx, backFootX - 9, backFootY - 4, backFootX + 10, backFootY - 4, 10, '#a62b34');
  roundedLine(ctx, frontFootX - 9, frontFootY - 4, frontFootX + 11, frontFootY - 4, 10, '#a62b34');

  // Slim textured superhero suit from the supplied master.
  ellipse(ctx, 0, -112 + bodyDrop * 0.62, 29 * body.torsoWidth, (55 - crouch * 8) * body.torsoLength, '#2d61bd', -0.03, '#16376f', 3);
  drawFabricGrain(ctx, 0, -112 + bodyDrop * 0.62, 52 * body.torsoWidth, 98 * body.torsoLength, '#8fb1ef', 0.10, 9);
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
  for (const bx of [17, 26]) {
    ellipse(ctx, bx, -64 + bodyDrop * 0.65, 5, 10, '#c46d42', 0.18, '#7a3e2c', 1);
    roundedLine(ctx, bx - 3, -67 + bodyDrop * 0.65, bx + 3, -64 + bodyDrop * 0.65, 1.4, '#f0b17f');
  }

  // Arms. Throwing arm swings forward for the chorizo special.
  const frontHandX =
    30
    + throwPose * 38
    + tramontana * 24
    + lowNose * 22
    - inhaleBrace * 20
    + nazazoDrive * 46
    + block * -2;
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
  roundedLine(ctx, -shoulderSpan, shoulderY + 6, -30 + block * 23, shoulderY + 26 - block * 30, 13 * body.armThickness, '#285aa9');
  ellipse(ctx, -31 + block * 23, shoulderY + 26 - block * 30, 8, 8, '#a52b35');

  // Stylized head and hair.
  const headX = 4 + nose * 8 - inhaleBrace * 8 + nazazoDrive * 8;
  const headY =
    -205
    + bodyDrop * 0.42
    + idle
    - motion.ascent * 5
    + motion.apex * 3
    + motion.descent * 7;
  ellipse(ctx, headX, headY, 36 * body.headWidth, 39 * body.headHeight, '#d4a07f', -0.03, '#694435', 2.4);
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
  roundedLine(ctx, headX + 4, headY - 7, headX + 17, headY - 8, 3, '#4a3127');
  ellipse(ctx, headX + 14, headY - 1, 2.5, 2.2, '#101317');
  roundedLine(ctx, headX + 8, headY + 23, headX + 22, headY + 23, 2.3, '#6b302e');

  // The nose is an articulated tapered vector path; combo moves change its length and arc.
  const noseLength = lerp(
    39,
    f.moveId === 'nose3' ? 142 : f.moveId === 'airNose' ? 128 : f.moveId === 'noseLow' ? 108 : 118,
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
  ctx.moveTo(headX + 18, headY + 3);
  ctx.quadraticCurveTo(headX + noseLength * 0.42, headY - 7 + noseLift, headX + noseLength, headY + 4 + noseLift);
  ctx.quadraticCurveTo(headX + noseLength * 0.56, headY + 17 + noseLift, headX + 18, headY + 16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ellipse(ctx, headX + noseLength - 4, headY + 8 + noseLift, 8, 7, '#bc745a');
  ellipse(ctx, headX + noseLength - 1, headY + 7 + noseLift, 2.1, 1.7, '#5f3a31');
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
