import type { FighterSnapshot } from '../types.js';
import type { LocomotionPose } from './LocomotionPose.js';
import { getCharacterStructure } from './CharacterStructure.js';
import {
  drawFacePlanes,
  drawHairStrands,
  drawScaleField,
  drawShadedEllipse,
} from './ReferenceDetailPrimitives.js';
import { getColetazoPresentation } from './CombatEffects.js';
import { getAirPresentationPose, getMovePresentationPhase } from './PresentationPose.js';
import { GROUND_Y, clamp01, ellipse, lerp, pulse, roundedLine } from './drawUtils.js';

function tongueFactor(f: FighterSnapshot): number {
  if (f.moveId !== 'tongueStraight' && f.moveId !== 'tongueLow') return 0;
  const frame = f.moveFrame;
  if (frame < 6) return 0;
  if (frame <= 10) return clamp01((frame - 6) / 4);
  if (frame <= 13) return 1;
  if (frame <= 22) return clamp01(1 - (frame - 13) / 9);
  return 0;
}

function clawFactor(f: FighterSnapshot): number {
  if (f.moveId === 'airClaw') return pulse(f.moveFrame, 1, 6, 15) * 1.15;
  if (f.moveId !== 'claw1' && f.moveId !== 'claw2') return 0;
  return pulse(f.moveFrame, 1, 6, 14);
}

function drawTailSpiral(
  ctx: CanvasRenderingContext2D,
  tipX: number,
  tipY: number,
  sweep: number,
): void {
  // The master silhouette reads as a curled chameleon tail even before motion/effects.
  // Uncoil it slightly during a tail strike, but preserve the identity cue.
  const strike = Math.min(1, Math.abs(sweep));
  const curl = 1 - strike * 0.58;
  const dir = sweep > 0.25 ? 1 : -1;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#477f35';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  ctx.bezierCurveTo(
    tipX + 30 * dir * curl,
    tipY - 28 * curl,
    tipX + 45 * dir * curl,
    tipY + 19 * curl,
    tipX + 19 * dir * curl,
    tipY + 32 * curl,
  );
  ctx.bezierCurveTo(
    tipX - 10 * dir * curl,
    tipY + 39 * curl,
    tipX - 22 * dir * curl,
    tipY + 7 * curl,
    tipX + 2 * dir * curl,
    tipY + 5 * curl,
  );
  ctx.stroke();
  ctx.globalAlpha = 0.48;
  ctx.strokeStyle = '#a4cf77';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(tipX + 1 * dir, tipY - 2);
  ctx.bezierCurveTo(
    tipX + 17 * dir * curl,
    tipY - 14 * curl,
    tipX + 20 * dir * curl,
    tipY + 11 * curl,
    tipX + 9 * dir * curl,
    tipY + 15 * curl,
  );
  ctx.stroke();
  ctx.restore();
}

function drawLongChameleonNeck(
  ctx: CanvasRenderingContext2D,
  baseX: number,
  baseY: number,
  headX: number,
  headY: number,
  neckScale: number,
): void {
  const half = 14 * neckScale;
  ctx.save();
  ctx.fillStyle = '#4f8f38';
  ctx.strokeStyle = '#274f2c';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(baseX - half, baseY);
  ctx.bezierCurveTo(
    baseX - 18,
    baseY - 24,
    headX - 25,
    headY + 65,
    headX - 18,
    headY + 34,
  );
  ctx.quadraticCurveTo(headX - 10, headY + 24, headX + 3, headY + 31);
  ctx.bezierCurveTo(
    headX + 13,
    headY + 48,
    baseX + 19,
    baseY - 19,
    baseX + half,
    baseY,
  );
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.globalAlpha = 0.34;
  ctx.strokeStyle = '#a4cf77';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(baseX + 3, baseY - 2);
  ctx.bezierCurveTo(baseX + 9, baseY - 27, headX + 2, headY + 61, headX - 1, headY + 34);
  ctx.stroke();
  ctx.restore();

  drawScaleField(ctx, headX - 7, headY + 55, 13 * neckScale, 39, '#244b2b', 0.22, 7);
}

export function drawChameleon(
  ctx: CanvasRenderingContext2D,
  f: FighterSnapshot,
  locomotion: LocomotionPose,
  time: number,
): void {
  const structure = getCharacterStructure('chameleon');
  const { body, stance } = structure;
  const feetY = GROUND_Y - f.y;
  const idle = Math.sin(time * 5.2 + f.x * 0.01) * 1.4;
  const ko = f.health <= 0 ? 1 : 0;
  const hurtLean = f.stunFrames > 0 ? -0.13 : 0;
  const crouch = f.crouching ? 1 : 0;
  const block = f.blocking ? 1 : 0;
  const guardBreak = f.guardBreakFrames > 0 ? 1 : 0;
  const movePhase = getMovePresentationPhase(f);
  const motion = getAirPresentationPose(f);
  const claw = clawFactor(f);
  const lowClaw = f.moveId === 'clawLow'
    ? Math.max(movePhase.active, (1 - movePhase.startup) * (1 - movePhase.recovery) * 0.72)
    : 0;
  const coletazo = f.moveId === 'coletazo'
    ? getColetazoPresentation(f.moveFrame)
    : { windup: 0, strike: 0, followThrough: 0, recovery: 0, sweep: 0, trail: 0 };
  const ultimateStartup = f.ultimatePhase === 'startup' ? 1 : 0;
  const ultimateCapture = f.ultimatePhase === 'capture' ? 1 : 0;
  const ultimateSequence = f.ultimatePhase === 'sequence' ? 1 : 0;
  const tongue = tongueFactor(f);
  const vanishCoil = ultimateStartup * 0.8;
  const dashDrive = ultimateCapture;
  const comboBeat = ultimateSequence;
  const airClaw = f.moveId === 'airClaw' ? Math.max(claw, movePhase.active) : 0;
  const airTilt = -motion.ascent * 0.07 + motion.descent * 0.09;
  const landingCompression = locomotion.landingAbsorption * 4;
  // Existing travel-driven secondary-motion channels from LocomotionPose.
  // These are render-only and stay inert outside ordinary locomotion.
  const hipTwist = locomotion.hipCounterRotation * 180;
  const chestTwist = locomotion.chestCounterRotation;
  const freeArmSwing = locomotion.freeArmSwing;
  const weightShift = locomotion.weightTransfer;
  const forwardLean =
    tongue * 0.12
    + claw * 0.07
    + airClaw * 0.11
    + lowClaw * 0.04
    + airTilt
    - coletazo.windup * 0.17
    + coletazo.strike * 0.15
    + coletazo.followThrough * 0.1
    - vanishCoil * 0.12
    + dashDrive * 0.24
    + comboBeat * 0.16
    + locomotion.torsoLean
    + chestTwist * 0.24
    + stance.forwardLean * 0.16
    + hurtLean
    - ko * 1.16;
  const bodyDrop =
    locomotion.pelvisDrop
    + crouch * 30
    + lowClaw * 24
    + landingCompression
    + coletazo.windup * 7
    - coletazo.strike * 3
    + vanishCoil * 11
    - dashDrive * 4
    + ko * 42;

  ctx.save();
  ctx.translate(f.x, feetY);
  ctx.scale(f.facing, 1);
  ctx.rotate(forwardLean);

  // Soft ground shadow belongs to the character and tracks jumps naturally.
  ctx.save();
  ctx.rotate(-forwardLean);
  ctx.globalAlpha = 0.2 * (1 - Math.min(0.65, f.y / 260));
  ellipse(ctx, 0, f.y, 48, 10, '#05070a');
  ctx.restore();

  // Tail: a real articulated curve, not a pasted picture. It counterbalances attacks.
  const ultimateTailBeat =
    comboBeat * Math.sin(time * 21) * 30
    - vanishCoil * 20
    + dashDrive * 18;
  const tailCounter =
    -tongue * 28
    - claw * 12
    + ultimateTailBeat
    + Math.sin(time * 2.8) * 5
    - freeArmSwing * 0.52
    - weightShift * 0.65;
  const sweep = coletazo.sweep;
  const tailMidX = sweep < 0 ? lerp(-86, -118, -sweep / 0.58) : lerp(-86, 92, sweep);
  const tailMidY = sweep < 0 ? lerp(-18 + tailCounter * 0.18, -53, -sweep / 0.58) : lerp(-18 + tailCounter * 0.18, -96, sweep);
  const tailTipX = sweep < 0 ? lerp(-102, -154, -sweep / 0.58) : lerp(-102, 148, sweep);
  const tailTipY = sweep < 0 ? lerp(-52 + tailCounter * 0.35, -91, -sweep / 0.58) : lerp(-52 + tailCounter * 0.35, -66, sweep);
  ctx.save();
  ctx.strokeStyle = '#315f2d';
  ctx.lineWidth = 28;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-20, -73 + bodyDrop * 0.35);
  ctx.bezierCurveTo(sweep < 0 ? lerp(-78, -112, -sweep / 0.58) : lerp(-78, -56, sweep), sweep < 0 ? lerp(-70, -74, -sweep / 0.58) : lerp(-70, -52, sweep), sweep < 0 ? lerp(-94, -142, -sweep / 0.58) : lerp(-94, 32, sweep), sweep < 0 ? lerp(-24 + tailCounter * 0.15, -74, -sweep / 0.58) : lerp(-24 + tailCounter * 0.15, -98, sweep), tailMidX, tailMidY);
  ctx.bezierCurveTo(sweep < 0 ? lerp(-39, -118, -sweep / 0.58) : lerp(-39, 106, sweep), sweep < 0 ? lerp(10 + tailCounter * 0.12, -104, -sweep / 0.58) : lerp(10 + tailCounter * 0.12, -106, sweep), sweep < 0 ? lerp(-23, -148, -sweep / 0.58) : lerp(-23, 142, sweep), sweep < 0 ? lerp(-30 + tailCounter * 0.32, -92, -sweep / 0.58) : lerp(-30 + tailCounter * 0.32, -80, sweep), tailTipX, tailTipY);
  ctx.stroke();
  ctx.strokeStyle = '#6cae42';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(-20, -73 + bodyDrop * 0.35);
  ctx.bezierCurveTo(sweep < 0 ? lerp(-78, -112, -sweep / 0.58) : lerp(-78, -56, sweep), sweep < 0 ? lerp(-70, -74, -sweep / 0.58) : lerp(-70, -52, sweep), sweep < 0 ? lerp(-94, -142, -sweep / 0.58) : lerp(-94, 32, sweep), sweep < 0 ? lerp(-24 + tailCounter * 0.15, -74, -sweep / 0.58) : lerp(-24 + tailCounter * 0.15, -98, sweep), tailMidX, tailMidY);
  ctx.bezierCurveTo(sweep < 0 ? lerp(-39, -118, -sweep / 0.58) : lerp(-39, 106, sweep), sweep < 0 ? lerp(10 + tailCounter * 0.12, -104, -sweep / 0.58) : lerp(10 + tailCounter * 0.12, -106, sweep), sweep < 0 ? lerp(-23, -148, -sweep / 0.58) : lerp(-23, 142, sweep), sweep < 0 ? lerp(-30 + tailCounter * 0.32, -92, -sweep / 0.58) : lerp(-30 + tailCounter * 0.32, -80, sweep), tailTipX, tailTipY);
  ctx.stroke();
  // Subtle dorsal highlight gives the tail the rounded, scaled volume of the master.
  ctx.globalAlpha = 0.28;
  ctx.strokeStyle = '#a2cf73';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-22, -79 + bodyDrop * 0.35);
  ctx.bezierCurveTo(-72, -88, tailMidX - 7, tailMidY - 8, tailTipX - 5, tailTipY - 7);
  ctx.stroke();
  drawTailSpiral(ctx, tailTipX, tailTipY, sweep);
  ctx.restore();

  const hipY = -54 + bodyDrop;
  const shoulderY = -112 - (body.torsoLength - 1) * 44 + bodyDrop * 0.45 + idle;
  const hipSpan = 13 * body.hipWidth * stance.width;
  const hipCounter =
    coletazo.windup * -13
    + coletazo.strike * 11
    + coletazo.followThrough * 7
    + hipTwist
    + weightShift * 0.42;

  // Travel-driven feet keep a support foot near its world anchor instead of
  // oscillating from wall time / velocity while clamped.
  const jumpTuck = locomotion.tuck * 24 + locomotion.descentBrace * 10;
  const backFootX = locomotion.backFoot.x;
  const frontFootX = locomotion.frontFoot.x;
  const backFootY = -locomotion.backFoot.y - jumpTuck;
  const frontFootY = -locomotion.frontFoot.y - jumpTuck - locomotion.extension * 3;
  const kneeBend =
    crouch * 18
    + lowClaw * 20
    + motion.airborne * (10 + motion.apex * 13)
    + locomotion.landingAbsorption * 8;
  const backKneeX = lerp(-hipSpan, backFootX, 0.54) - 6 - hipCounter * 0.08;
  const frontKneeX = lerp(hipSpan, frontFootX, 0.54) + 6 + hipCounter * 0.1;
  roundedLine(ctx, -hipSpan + hipCounter * 0.18, hipY, backKneeX, -24 + kneeBend + backFootY * 0.34, 20 * body.legThickness, '#5d9d3c');
  roundedLine(ctx, backKneeX, -24 + kneeBend + backFootY * 0.34, backFootX, backFootY - 3, 16 * body.legThickness, '#76b54d');
  roundedLine(ctx, hipSpan + hipCounter * 0.2, hipY, frontKneeX, -26 + kneeBend + frontFootY * 0.34, 20 * body.legThickness, '#5d9d3c');
  roundedLine(ctx, frontKneeX, -26 + kneeBend + frontFootY * 0.34, frontFootX, frontFootY - 3, 16 * body.legThickness, '#76b54d');
  roundedLine(ctx, backFootX - 8, backFootY - 2, backFootX + 10, backFootY - 2, 6, '#adc96b');
  roundedLine(ctx, frontFootX - 8, frontFootY - 2, frontFootX + 10, frontFootY - 2, 6, '#adc96b');
  // Three small toe/claw strokes keep the reptile feet readable.
  for (const footX of [backFootX, frontFootX]) {
    roundedLine(ctx, footX + 4, -4 + (footX === backFootX ? backFootY : frontFootY), footX + 12, -2 + (footX === backFootX ? backFootY : frontFootY), 1.7, '#d5df9a');
    roundedLine(ctx, footX + 2, -4 + (footX === backFootX ? backFootY : frontFootY), footX + 8, 1 + (footX === backFootX ? backFootY : frontFootY), 1.5, '#d5df9a');
  }

  // A jagged dorsal crest makes the neutral silhouette unmistakably reptilian.
  ctx.save();
  ctx.fillStyle = '#3a7434';
  ctx.strokeStyle = '#214b28';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-24, -61 + bodyDrop * 0.56);
  ctx.lineTo(-49, -75 + bodyDrop * 0.54);
  ctx.lineTo(-28, -83 + bodyDrop * 0.52);
  ctx.lineTo(-57, -98 + bodyDrop * 0.48);
  ctx.lineTo(-29, -105 + bodyDrop * 0.45);
  ctx.lineTo(-50, shoulderY + 5);
  ctx.lineTo(-23, shoulderY + 1);
  ctx.lineTo(-17, -63 + bodyDrop * 0.55);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Torso with a lighter segmented belly plate.
  drawShadedEllipse(ctx, -3, -84 + bodyDrop * 0.65, 27 * body.torsoWidth, (51 - crouch * 9) * body.torsoLength, '#4f8f38', '#86bf5e', '#244f2b', -0.09, '#274f2c', 3);
  ellipse(ctx, 7 * body.torsoWidth, -82 + bodyDrop * 0.65, 14 * body.torsoWidth, (37 - crouch * 7) * body.torsoLength, '#79b654', -0.08);
  drawScaleField(ctx, -2, -84 + bodyDrop * 0.65, 21 * body.torsoWidth, 40 * body.torsoLength, '#244b2b', 0.22, 8);
  ctx.save();
  ctx.globalAlpha = 0.34;
  ctx.strokeStyle = '#315f32';
  ctx.lineWidth = 1.6;
  for (let plate = 0; plate < 5; plate += 1) {
    const plateY = -105 + plate * 12 + bodyDrop * 0.64;
    ctx.beginPath();
    ctx.moveTo(-1, plateY);
    ctx.quadraticCurveTo(8, plateY + 4, 18, plateY + 1);
    ctx.stroke();
  }
  ctx.restore();

  // Tiny arms are intentionally very short: this is part of the fighter's gameplay identity.
  const frontReach =
    18
    + claw * (f.moveId === 'claw2' ? 42 : f.moveId === 'airClaw' ? 52 : 31)
    + lowClaw * 31
    - vanishCoil * 9
    + dashDrive * 24
    + comboBeat * 34
    + freeArmSwing * 0.20;
  const frontY =
    shoulderY
    + block * 16
    - claw * 8
    + airClaw * (18 + motion.descent * 16)
    + lowClaw * 44
    + vanishCoil * 13
    - dashDrive * 9
    - comboBeat * 10;
  const shoulderSpan = 12 * body.shoulderWidth;
  roundedLine(ctx, shoulderSpan, shoulderY, frontReach, frontY, 11 * body.armThickness, '#62a444');
  ellipse(ctx, frontReach + 3, frontY, 7, 6, '#86bd5e');
  roundedLine(ctx, frontReach + 5, frontY - 1, frontReach + 12, frontY - 5, 1.5, '#c6d98c');
  roundedLine(ctx, frontReach + 5, frontY + 1, frontReach + 13, frontY + 1, 1.5, '#c6d98c');
  roundedLine(ctx, frontReach + 4, frontY + 3, frontReach + 11, frontY + 6, 1.5, '#c6d98c');
  const rearHandX = -24 + block * 13 - freeArmSwing * 0.34;
  const rearHandY = shoulderY + 18 - block * 25 + Math.abs(freeArmSwing) * 0.10;
  roundedLine(ctx, -shoulderSpan, shoulderY + 4, rearHandX, rearHandY, 10 * body.armThickness, '#568f3a');
  ellipse(ctx, rearHandX - 1, rearHandY, 7, 6, '#80b75a');

  // Oversized stylized human-like head from the reference concept, reconstructed with vector forms.
  const headX =
    4
    + tongue * 14
    - vanishCoil * 8
    + dashDrive * 14
    + comboBeat * 9
    + block * -3
    + chestTwist * 52
    + weightShift * 0.22;
  const headY =
    -180
    + bodyDrop * 0.43
    + idle
    - motion.ascent * 5
    + motion.apex * 3
    + motion.descent * 7;
  // Long scaled neck: the S-curve creates a clearly non-human top-heavy silhouette.
  drawLongChameleonNeck(ctx, -4, shoulderY + 9, headX, headY, body.neckWidth);
  drawShadedEllipse(ctx, headX, headY, 48 * body.headWidth, 43 * body.headHeight, '#c98f68', '#efb28d', '#895746', -0.04, '#633f31', 2.8);
  drawFacePlanes(ctx, headX, headY, Math.min(1.15, body.headWidth), '#ffd0ad', '#754539');
  // Ear and cheek contour.
  ellipse(ctx, headX - 43, headY + 2, 8, 12, '#b97c58');
  ellipse(ctx, headX + 12, headY + 11, 31, 23, '#d19a72', -0.08);

  // Curly hair: many small vector locks create a stable silhouette without an image asset.
  ctx.fillStyle = '#161918';
  const curlPoints: readonly [number, number, number][] = [
    [-31,-30,12],[-18,-38,13],[-3,-42,14],[13,-39,13],[27,-30,12],[34,-16,10],
    [-35,-16,11],[-25,-48,9],[-8,-52,10],[10,-50,10],[25,-43,9],[-39,-2,8],
  ];
  for (const [dx, dy, r] of curlPoints) {
    ctx.beginPath();
    ctx.arc(headX + dx, headY + dy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  drawHairStrands(ctx, [
    [headX - 28, headY - 37, headX - 20, headY - 23],
    [headX - 12, headY - 47, headX - 7, headY - 29],
    [headX + 5, headY - 48, headX + 10, headY - 29],
    [headX + 22, headY - 39, headX + 27, headY - 23],
  ], '#625149', 0.30);

  // Brow, eye and reference-like cheek texture.
  roundedLine(ctx, headX + 4, headY - 7, headX + 18, headY - 8, 3, '#35251f');
  ellipse(ctx, headX + 15, headY - 2, 2.7, 2.3, '#101316');
  ctx.save();
  ctx.strokeStyle = '#5e4035';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(headX + 16, headY + 7);
  ctx.quadraticCurveTo(headX + 25, headY + 12, headX + 23, headY + 19);
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = 0.23;
  ctx.fillStyle = '#8b5b4c';
  for (const [dx, dy] of [[10,8],[16,11],[22,9],[8,15],[18,17],[-3,13]] as const) {
    ctx.beginPath();
    ctx.arc(headX + dx, headY + dy, 1.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  const mouthX = headX + 29;
  const mouthY = headY + 18;
  roundedLine(ctx, mouthX - 8, mouthY, mouthX + 4, mouthY + 1, 2.5, '#4b2020');

  if (tongue > 0.01) {
    const length = lerp(10, 310, tongue);
    const targetY = mouthY + 2;
    ctx.save();
    ctx.strokeStyle = '#d65573';
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(mouthX + 3, mouthY + 1);
    ctx.quadraticCurveTo(mouthX + length * 0.45, lerp(mouthY, targetY, 0.55) - 3, mouthX + length, targetY);
    ctx.stroke();
    ctx.strokeStyle = '#f08ba0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(mouthX + 5, mouthY - 1);
    ctx.quadraticCurveTo(mouthX + length * 0.45, lerp(mouthY, targetY, 0.55) - 5, mouthX + length - 2, targetY - 2);
    ctx.stroke();
    ellipse(ctx, mouthX + length, targetY, 9, 6, '#e56d86');
    ctx.restore();
  }

  // Guard shimmer during blocks; chill tint is handled subtly through an overlay.
  if (block) {
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = '#b8e6a1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(20, -110 + bodyDrop * 0.5, 44, -1.1, 1.05);
    ctx.stroke();
    ctx.restore();
  }
  // Guard Break remains readable for the full simulation-authored state.
  if (guardBreak) {
    ctx.save();
    const flash = 0.42 + 0.18 * Math.sin(time * 18);
    ctx.globalAlpha = flash;
    ctx.strokeStyle = '#ff776f';
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.arc(8, -110 + bodyDrop * 0.5, 57, -1.42, -0.28);
    ctx.arc(8, -110 + bodyDrop * 0.5, 57, 0.08, 0.92);
    ctx.arc(8, -110 + bodyDrop * 0.5, 57, 1.18, 2.05);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 0.12;
    ellipse(ctx, 8, -110 + bodyDrop * 0.5, 61, 98, '#ff8a78');
    ctx.restore();
  }

  if (f.chilledFrames > 0) {
    ctx.save();
    ctx.globalAlpha = 0.15 + 0.08 * Math.sin(time * 11);
    ellipse(ctx, 0, -100 + bodyDrop * 0.5, 50, 94, '#a9e7ff');
    ctx.restore();
  }

  ctx.restore();
}
