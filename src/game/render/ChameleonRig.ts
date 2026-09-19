import type { FighterSnapshot } from '../types.js';
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

export function drawChameleon(ctx: CanvasRenderingContext2D, f: FighterSnapshot, time: number): void {
  const feetY = GROUND_Y - f.y;
  const idle = Math.sin(time * 5.2 + f.x * 0.01) * 1.4;
  const ko = f.health <= 0 ? 1 : 0;
  const hurtLean = f.stunFrames > 0 ? -0.13 : 0;
  const crouch = f.crouching ? 1 : 0;
  const block = f.blocking ? 1 : 0;
  const claw = clawFactor(f);
  const tongue = tongueFactor(f);
  const lowTongue = f.moveId === 'tongueLow';
  const airClaw = f.moveId === 'airClaw' ? claw : 0;
  const forwardLean = tongue * 0.12 + claw * 0.07 + airClaw * 0.11 + hurtLean - ko * 1.16;
  const bodyDrop = crouch * 30 + ko * 42;

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
  const tailCounter = -tongue * 28 - claw * 12 + Math.sin(time * 2.8) * 5;
  ctx.save();
  ctx.strokeStyle = '#315f2d';
  ctx.lineWidth = 22;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-20, -73 + bodyDrop * 0.35);
  ctx.bezierCurveTo(-78, -70, -94, -24 + tailCounter * 0.15, -67, -10 + tailCounter * 0.18);
  ctx.bezierCurveTo(-39, 10 + tailCounter * 0.12, -23, -30 + tailCounter * 0.32, -49, -40 + tailCounter * 0.35);
  ctx.stroke();
  ctx.strokeStyle = '#6cae42';
  ctx.lineWidth = 11;
  ctx.beginPath();
  ctx.moveTo(-20, -73 + bodyDrop * 0.35);
  ctx.bezierCurveTo(-78, -70, -94, -24 + tailCounter * 0.15, -67, -10 + tailCounter * 0.18);
  ctx.bezierCurveTo(-39, 10 + tailCounter * 0.12, -23, -30 + tailCounter * 0.32, -49, -40 + tailCounter * 0.35);
  ctx.stroke();
  ctx.restore();

  const hipY = -54 + bodyDrop;
  const shoulderY = -112 + bodyDrop * 0.45 + idle;

  // Compact reptilian legs.
  const step = f.grounded ? Math.sin(time * 10 + f.x * 0.03) * Math.min(8, Math.abs(f.vx) * 1.8) : 0;
  const kneeBend = crouch * 18 + (!f.grounded ? 12 : 0);
  roundedLine(ctx, -13, hipY, -18 - step, -24 + kneeBend, 20, '#5d9d3c');
  roundedLine(ctx, -18 - step, -24 + kneeBend, -28 - step * 0.35, -3, 16, '#76b54d');
  roundedLine(ctx, 12, hipY, 19 + step, -26 + kneeBend, 20, '#5d9d3c');
  roundedLine(ctx, 19 + step, -26 + kneeBend, 30 + step * 0.35, -3, 16, '#76b54d');
  roundedLine(ctx, -31 - step * 0.35, -2, -14 - step * 0.35, -2, 6, '#adc96b');
  roundedLine(ctx, 17 + step * 0.35, -2, 34 + step * 0.35, -2, 6, '#adc96b');

  // Torso with a lighter belly plate.
  ellipse(ctx, 0, -84 + bodyDrop * 0.65, 31, 49 - crouch * 9, '#4f8f38', -0.05, '#274f2c', 3);
  ellipse(ctx, 8, -82 + bodyDrop * 0.65, 16, 35 - crouch * 7, '#79b654', -0.06);

  // Tiny arms are intentionally very short: this is part of the fighter's gameplay identity.
  const frontReach = 18 + claw * (f.moveId === 'claw2' ? 42 : f.moveId === 'airClaw' ? 52 : 31);
  const frontY = shoulderY + block * 16 - claw * 8 + airClaw * 18;
  roundedLine(ctx, 12, shoulderY, frontReach, frontY, 11, '#62a444');
  ellipse(ctx, frontReach + 3, frontY, 7, 6, '#86bd5e');
  roundedLine(ctx, -12, shoulderY + 4, -24 + block * 13, shoulderY + 18 - block * 25, 10, '#568f3a');
  ellipse(ctx, -25 + block * 13, shoulderY + 18 - block * 25, 7, 6, '#80b75a');

  // Oversized stylized human-like head from the reference concept, reconstructed with vector forms.
  const headX = 4 + tongue * 14 + block * -3;
  const headY = -155 + bodyDrop * 0.43 + idle + (!f.grounded ? 3 : 0);
  ellipse(ctx, headX, headY, 42, 39, '#c98f68', -0.04, '#633f31', 2.5);
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
    const maxLength = lowTongue ? 285 : 310;
    const length = lerp(10, maxLength, tongue);
    const targetY = lowTongue ? -62 + bodyDrop * 0.25 : mouthY + 2;
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
  if (f.chilledFrames > 0) {
    ctx.save();
    ctx.globalAlpha = 0.15 + 0.08 * Math.sin(time * 11);
    ellipse(ctx, 0, -100 + bodyDrop * 0.5, 50, 94, '#a9e7ff');
    ctx.restore();
  }

  ctx.restore();
}
