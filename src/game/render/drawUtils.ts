export const WORLD_WIDTH = 1280;
export const WORLD_HEIGHT = 720;
export const GROUND_Y = 565;

export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function easeOutCubic(t: number): number {
  const x = 1 - clamp01(t);
  return 1 - x * x * x;
}

export function pulse(frame: number, start: number, peak: number, end: number): number {
  if (frame <= start || frame >= end) return 0;
  if (frame <= peak) return clamp01((frame - start) / Math.max(1, peak - start));
  return clamp01(1 - (frame - peak) / Math.max(1, end - peak));
}

export function roundedLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  width: number,
  color: string,
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

export function ellipse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  fill: string,
  rotation = 0,
  stroke?: string,
  lineWidth = 1,
): void {
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
  ctx.restore();
}

export function polygon(ctx: CanvasRenderingContext2D, points: readonly [number, number][], fill: string, stroke?: string): void {
  if (points.length === 0) return;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(points[0]![0], points[0]![1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i]![0], points[i]![1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();
}
