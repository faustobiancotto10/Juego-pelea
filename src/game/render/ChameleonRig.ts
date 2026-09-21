import type { FighterSnapshot } from '../types.js';
import type { LocomotionPose } from './LocomotionPose.js';
import { getCharacterStructure } from './CharacterStructure.js';
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
  const tailCounter = -tongue * 28 - claw * 12 + ultimateTailBeat + Math.sin(time * 2.8) * 5;
  const sweep = coletazo.sweep;
  const tailMidX = sweep < 0 ? lerp(-67, -104, -sweep / 0.58) : lerp(-67, 84, sweep);
  const tailMidY = sweep < 0 ? lerp(-10 + tailCounter * 0.18, -48, -sweep / 0.58) : lerp(-10 + tailCounter * 0.18, -91, sweep);
  const tailTipX = sweep < 0 ? lerp(-49, -136, -sweep / 0.58) : lerp(-49, 136, sweep);
  const tailTipY = sweep < 0 ? lerp(-40 + tailCounter * 0.35, -86, -sweep / 0.58) : lerp(-40 + tailCounter * 0.35, -60, sweep);
  ctx.save();
  ctx.strokeStyle = '#315f2d';
  ctx.lineWidth = 22;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-20, -73 + bodyDrop * 0.35);
  ctx.bezierCurveTo(sweep < 0 ? lerp(-78, -112, -sweep / 0.58) : lerp(-78, -56, sweep), sweep < 0 ? lerp(-70, -74, -sweep / 0.58) : lerp(-70, -52, sweep), sweep < 0 ? lerp(-94, -142, -sweep / 0.58) : lerp(-94, 32, sweep), sweep < 0 ? lerp(-24 + tailCounter * 0.15, -74, -sweep / 0.58) : lerp(-24 + tailCounter * 0.15, -98, sweep), tailMidX, tailMidY);
  ctx.bezierCurveTo(sweep < 0 ? lerp(-39, -118, -sweep / 0.58) : lerp(-39, 106, sweep), sweep < 0 ? lerp(10 + tailCounter * 0.12, -104, -sweep / 0.58) : lerp(10 + tailCounter * 0.12, -106, sweep), sweep < 0 ? lerp(-23, -148, -sweep / 0.58) : lerp(-23, 142, sweep), sweep < 0 ? lerp(-30 + tailCounter * 0.32, -92, -sweep / 0.58) : lerp(-30 + tailCounter * 0.32, -80, sweep), tailTipX, tailTipY);
  ctx.stroke();
  ctx.strokeStyle = '#6cae42';
  ctx.lineWidth = 11;
  ctx.beginPath();
  ctx.moveTo(-20, -73 + bodyDrop * 0.35);
  ctx.bezierCurveTo(sweep < 0 ? lerp(-78, -112, -sweep / 0.58) : lerp(-78, -56, sweep), sweep < 0 ? lerp(-70, -74, -sweep / 0.58) : lerp(-70, -52, sweep), sweep < 0 ? lerp(-94, -142, -sweep / 0.58) : lerp(-94, 32, sweep), sweep < 0 ? lerp(-24 + tailCounter * 0.15, -74, -sweep / 0.58) : lerp(-24 + tailCounter * 0.15, -98, sweep), tailMidX, tailMidY);
  ctx.bezierCurveTo(sweep < 0 ? lerp(-39, -118, -sweep / 0.58) : lerp(-39, 106, sweep), sweep < 0 ? lerp(10 + tailCounter * 0.12, -104, -sweep / 0.58) : lerp(10 + tailCounter * 0.12, -106, sweep), sweep < 0 ? lerp(-23, -148, -sweep / 0.58) : lerp(-23, 142, sweep), sweep < 0 ? lerp(-30 + tailCounter * 0.32, -92, -sweep / 0.58) : lerp(-30 + tailCounter * 0.32, -80, sweep), tailTipX, tailTipY);
  ctx.stroke();
  ctx.restore();

  const hipY = -54 + bodyDrop;
  const shoulderY = -112 - (body.torsoLength - 1) * 44 + bodyDrop * 0.45 + idle;
  const hipSpan = 13 * body.hipWidth * stance.width;
  const hipCounter = coletazo.windup * -13 + coletazo.strike * 11 + coletazo.followThrough * 7;

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

  // Torso with a lighter belly plate.
  ellipse(ctx, 0, -84 + bodyDrop * 0.65, 31 * body.torsoWidth, (49 - crouch * 9) * body.torsoLength, '#4f8f38', -0.05, '#274f2c', 3);
  ellipse(ctx, 8 * body.torsoWidth, -82 + bodyDrop * 0.65, 16 * body.torsoWidth, (35 - crouch * 7) * body.torsoLength, '#79b654', -0.06);

  // Tiny arms are intentionally very short: this is part of the fighter's gameplay identity.
  const frontReach =
    18
    + claw * (f.moveId === 'claw2' ? 42 : f.moveId === 'airClaw' ? 52 : 31)
    + lowClaw * 31
    - vanishCoil * 9
    + dashDrive * 24
    + comboBeat * 34;
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
  roundedLine(ctx, -shoulderSpan, shoulderY + 4, -24 + block * 13, shoulderY + 18 - block * 25, 10 * body.armThickness, '#568f3a');
  ellipse(ctx, -25 + block * 13, shoulderY + 18 - block * 25, 7, 6, '#80b75a');

  // Oversized stylized human-like head from the reference concept, reconstructed with vector forms.
  const headX =
    4
    + tongue * 14
    - vanishCoil * 8
    + dashDrive * 14
    + comboBeat * 9
    + block * -3;
  const headY =
    -155
    + bodyDrop * 0.43
    + idle
    - motion.ascent * 5
    + motion.apex * 3
    + motion.descent * 7;
  ellipse(ctx, headX, headY, 42 * body.headWidth, 39 * body.headHeight, '#c98f68', -0.04, '#633f31', 2.5);
  // Ear and cheek contour.
  ellipse(ctx, headX - 37, headY + 2, 7, 11, '#b97c58');
  ellipse(ctx, headX + 10, headY + 10, 28, 21, '#d19a72', -0.08);

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

  // Brow, eye and beard shadows.
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
