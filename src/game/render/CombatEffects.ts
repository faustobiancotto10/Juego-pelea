import { clamp01, ellipse, lerp } from './drawUtils.js';

export function drawPushGuardBurst(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  facing: -1 | 1,
  intensity: number,
): void {
  const t = clamp01(intensity);
  if (t <= 0) return;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);
  ctx.globalAlpha = 0.85 * t;

  const radius = lerp(26, 94, t);
  ctx.strokeStyle = '#d8f2ff';
  ctx.lineWidth = lerp(5, 2, t);
  ctx.beginPath();
  ctx.arc(12, -88, radius, -1.18, 1.18);
  ctx.stroke();

  ctx.strokeStyle = '#8fdcff';
  ctx.lineWidth = 3;
  for (let i = 0; i < 5; i += 1) {
    const yy = -132 + i * 22;
    const reach = lerp(32, 116 + i * 8, t);
    ctx.beginPath();
    ctx.moveTo(20, yy);
    ctx.quadraticCurveTo(reach * 0.55, yy - 10 + i * 3, reach, yy + 2);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawCamaleoniVeil(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  facing: -1 | 1,
  intensity: number,
  timeSeconds: number,
): void {
  const t = clamp01(intensity);
  if (t <= 0) return;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);
  ctx.globalAlpha = 0.18 + 0.28 * t;

  for (let i = 0; i < 3; i += 1) {
    const phase = timeSeconds * 8 + i * 1.7;
    const offset = 18 + i * 14 + Math.sin(phase) * 5;
    ctx.strokeStyle = i === 0 ? '#c8ffc2' : '#8fe89b';
    ctx.lineWidth = 3 - i * 0.5;
    ctx.beginPath();
    ctx.ellipse(-offset, -102 + Math.cos(phase) * 8, 34 + i * 9, 72 + i * 7, -0.08, 0, Math.PI * 2);
    ctx.stroke();
  }

  const shimmer = 0.14 + 0.12 * Math.sin(timeSeconds * 14);
  ctx.globalAlpha = shimmer * t;
  ellipse(ctx, 0, -104, 48, 96, '#d9ffd3');

  ctx.restore();
}

export function drawSuctionField(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  facing: -1 | 1,
  intensity: number,
  timeSeconds: number,
): void {
  const t = clamp01(intensity);
  if (t <= 0) return;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);
  ctx.globalAlpha = 0.2 + t * 0.45;
  ctx.lineCap = 'round';

  for (let i = 0; i < 4; i += 1) {
    const lane = i - 1.5;
    const phase = timeSeconds * 9 + i * 0.8;
    const reach = lerp(56, 250 - i * 18, t);
    ctx.strokeStyle = i % 2 === 0 ? '#bde9ff' : '#f1fbff';
    ctx.lineWidth = i % 2 === 0 ? 5 : 3;
    ctx.beginPath();
    ctx.moveTo(34, -112 + lane * 20);
    ctx.bezierCurveTo(
      88,
      -142 + lane * 18 + Math.sin(phase) * 10,
      reach * 0.72,
      -76 + lane * 24 + Math.cos(phase) * 9,
      reach,
      -108 + lane * 16,
    );
    ctx.stroke();
  }

  ctx.restore();
}

export function drawUltimateImpact(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  intensity: number,
  accent: string,
): void {
  const t = clamp01(intensity);
  if (t <= 0) return;

  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = 0.9 * t;

  for (let i = 0; i < 3; i += 1) {
    const radius = lerp(18 + i * 10, 72 + i * 24, t);
    ctx.strokeStyle = i === 0 ? '#fff7db' : accent;
    ctx.lineWidth = Math.max(1.5, 6 - i * 1.5 - t * 2);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}
