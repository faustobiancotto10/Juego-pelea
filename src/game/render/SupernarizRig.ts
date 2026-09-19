import type { FighterSnapshot } from '../types.js';
import { GROUND_Y, ellipse, lerp, polygon, pulse, roundedLine } from './drawUtils.js';

function noseFactor(f: FighterSnapshot): number {
  if (f.moveId === 'airNose') return pulse(f.moveFrame, 1, 7, 16) * 0.92;
  if (!f.moveId?.startsWith('nose')) return 0;
  if (f.moveId === 'nose1') return pulse(f.moveFrame, 1, 5, 12) * 0.45;
  if (f.moveId === 'nose2') return pulse(f.moveFrame, 1, 5, 13) * 0.7;
  return pulse(f.moveFrame, 2, 7, 17);
}

export function drawSupernariz(ctx: CanvasRenderingContext2D, f: FighterSnapshot, time: number): void {
  const feetY = GROUND_Y - f.y;
  const idle = Math.sin(time * 5.8 + f.x * 0.01) * 1.2;
  const crouch = f.crouching ? 1 : 0;
  const block = f.blocking ? 1 : 0;
  const guardBreak = f.guardBreakFrames > 0 ? 1 : 0;
  const nose = noseFactor(f);
  const tramontana = f.moveId === 'tramontana' ? pulse(f.moveFrame, 3, 10, 24) : 0;
  const throwPose = f.moveId === 'chorizoThrow' ? pulse(f.moveFrame, 1, 8, 21) : 0;
  const ko = f.health <= 0 ? 1 : 0;
  const hurtLean = f.stunFrames > 0 ? -0.16 : 0;
  const airNose = f.moveId === 'airNose' ? nose : 0;
  const lean = nose * 0.16 + airNose * 0.12 + throwPose * 0.07 + hurtLean - ko * 1.08;
  const bodyDrop = crouch * 32 + ko * 44;

  ctx.save();
  ctx.translate(f.x, feetY);
  ctx.scale(f.facing, 1);
  ctx.rotate(lean);

  ctx.save();
  ctx.rotate(-lean);
  ctx.globalAlpha = 0.22 * (1 - Math.min(0.65, f.y / 260));
  ellipse(ctx, 0, f.y, 46, 10, '#05070a');
  ctx.restore();

  const hipY = -60 + bodyDrop;
  const shoulderY = -126 + bodyDrop * 0.45 + idle;
  const step = f.grounded ? Math.sin(time * 10.5 + f.x * 0.025) * Math.min(9, Math.abs(f.vx) * 1.6) : 0;
  const knee = crouch * 20 + (!f.grounded ? 12 : 0);

  // Cape goes behind the body with a wind-responsive Bézier silhouette.
  ctx.save();
  ctx.fillStyle = '#9e202c';
  ctx.strokeStyle = '#56131a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-18, shoulderY + 5);
  ctx.bezierCurveTo(-52 - Math.abs(f.vx) * 2, shoulderY + 18, -65 - Math.sin(time * 3) * 10, -62 + bodyDrop * 0.4, -35, -34 + bodyDrop * 0.5);
  ctx.lineTo(-8, -72 + bodyDrop * 0.45);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Legs and boots.
  roundedLine(ctx, -12, hipY, -14 - step, -30 + knee, 19, '#2f5fb2');
  roundedLine(ctx, -14 - step, -30 + knee, -25 - step * 0.45, -5, 15, '#376dc8');
  roundedLine(ctx, 12, hipY, 17 + step, -29 + knee, 19, '#2f5fb2');
  roundedLine(ctx, 17 + step, -29 + knee, 28 + step * 0.45, -5, 15, '#376dc8');
  roundedLine(ctx, -31 - step * 0.45, -4, -13 - step * 0.45, -4, 10, '#a62b34');
  roundedLine(ctx, 15 + step * 0.45, -4, 34 + step * 0.45, -4, 10, '#a62b34');

  // Slim suit torso.
  ellipse(ctx, 0, -94 + bodyDrop * 0.62, 29, 51 - crouch * 8, '#2d61bd', -0.03, '#16376f', 3);
  // Chest nose insignia.
  ellipse(ctx, 7, -106 + bodyDrop * 0.58, 16, 8, '#d9a17e', 0.05, '#784b3b', 1.5);
  roundedLine(ctx, -25, -70 + bodyDrop * 0.65, 25, -70 + bodyDrop * 0.65, 8, '#8c2530');

  // Belt decorations are programmatic sausage-shaped beads.
  for (const bx of [-18, 0, 18]) {
    ellipse(ctx, bx, -65 + bodyDrop * 0.65, 7, 4, '#c46d42', 0.15);
    roundedLine(ctx, bx - 5, -65 + bodyDrop * 0.65, bx + 5, -65 + bodyDrop * 0.65, 2, '#f0b17f');
  }

  // Arms. Throwing arm swings forward for the chorizo special.
  const frontHandX = 30 + throwPose * 38 + block * -2;
  const frontHandY = shoulderY + 20 - throwPose * 21 - block * 26;
  roundedLine(ctx, 17, shoulderY + 3, frontHandX, frontHandY, 13, '#2e65c3');
  ellipse(ctx, frontHandX + 2, frontHandY, 8, 8, '#a92d37');
  roundedLine(ctx, -17, shoulderY + 6, -30 + block * 23, shoulderY + 26 - block * 30, 13, '#285aa9');
  ellipse(ctx, -31 + block * 23, shoulderY + 26 - block * 30, 8, 8, '#a52b35');

  // Stylized head and hair.
  const headX = 4 + nose * 8;
  const headY = -170 + bodyDrop * 0.42 + idle;
  ellipse(ctx, headX, headY, 36, 39, '#d4a07f', -0.03, '#694435', 2.4);
  ctx.save();
  ctx.fillStyle = '#191a1b';
  ctx.beginPath();
  ctx.moveTo(headX - 33, headY - 18);
  ctx.bezierCurveTo(headX - 26, headY - 52, headX + 18, headY - 53, headX + 31, headY - 23);
  ctx.bezierCurveTo(headX + 13, headY - 35, headX - 8, headY - 30, headX - 33, headY - 18);
  ctx.fill();
  ctx.restore();
  roundedLine(ctx, headX + 4, headY - 7, headX + 17, headY - 8, 3, '#4a3127');
  ellipse(ctx, headX + 14, headY - 1, 2.5, 2.2, '#101317');
  roundedLine(ctx, headX + 8, headY + 23, headX + 22, headY + 23, 2.3, '#6b302e');

  // The nose is an articulated tapered vector path; combo moves change its length and arc.
  const noseLength = lerp(39, f.moveId === 'nose3' ? 142 : f.moveId === 'airNose' ? 128 : 118, nose);
  const noseLift = f.moveId === 'nose2' ? -12 * nose : f.moveId === 'nose3' ? 7 * nose : f.moveId === 'airNose' ? 20 * nose : 0;
  ctx.save();
  ctx.fillStyle = '#c98668';
  ctx.strokeStyle = '#754635';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(headX + 18, headY + 3);
  ctx.quadraticCurveTo(headX + noseLength * 0.45, headY - 10 + noseLift, headX + noseLength, headY + 5 + noseLift);
  ctx.quadraticCurveTo(headX + noseLength * 0.55, headY + 19 + noseLift, headX + 18, headY + 16);
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
