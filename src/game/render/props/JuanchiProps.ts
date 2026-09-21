import { ellipse, roundedLine } from '../drawUtils.js';

export function drawRugbyBallProp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ellipse(ctx, 0, 0, 18, 10, '#9b5d31', 0, '#3e2417', 2);
  roundedLine(ctx, -7, 0, 7, 0, 1.8, '#f5e6ca');
  for (const lx of [-4, 0, 4]) roundedLine(ctx, lx, -3, lx, 3, 1, '#f5e6ca');
  ctx.restore();
}

export function drawPoliceCapProp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle = 0,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = '#151922';
  ctx.strokeStyle = '#05070a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 9, 0, Math.PI, Math.PI * 2);
  ctx.lineTo(13, 4);
  ctx.quadraticCurveTo(0, 9, -13, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#272d38';
  ctx.beginPath();
  ctx.ellipse(8, 5, 12, 4, 0.08, -0.2, Math.PI * 0.92);
  ctx.fill();
  ellipse(ctx, 0, -2, 2.4, 2.4, '#d8b65c');
  ctx.restore();
}
