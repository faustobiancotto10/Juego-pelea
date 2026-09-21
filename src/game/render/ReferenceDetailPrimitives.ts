/**
 * Render-only detail primitives used to preserve authored reference identity
 * without loading raster fighter art at runtime.
 */
export function drawStitchLine(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number, x2: number, y2: number,
  color: string,
  width = 1,
  dash: readonly number[] = [4, 4],
  alpha = 0.55,
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash([...dash]);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

export function drawCargoPocket(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  width: number, height: number,
  fill: string,
  stroke: string,
  zipper = '#c9a44d',
): void {
  ctx.save();
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x - width / 2, y - height / 2, width, height, Math.min(4, height * 0.2));
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = zipper;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(x - width * 0.34, y - height * 0.27);
  ctx.lineTo(x + width * 0.28, y - height * 0.27);
  ctx.stroke();
  ctx.fillStyle = zipper;
  ctx.fillRect(x + width * 0.25, y - height * 0.33, 2.2, 4.2);
  ctx.restore();
}

export function drawFabricGrain(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  width: number, height: number,
  color: string,
  alpha = 0.12,
  spacing = 11,
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.8;
  const left = cx - width / 2;
  const top = cy - height / 2;
  ctx.beginPath();
  for (let x = left - height; x < left + width + height; x += spacing) {
    ctx.moveTo(x, top + height);
    ctx.lineTo(x + height, top);
  }
  ctx.stroke();
  ctx.restore();
}

export function drawScaleField(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  rx: number, ry: number,
  color: string,
  alpha = 0.20,
  step = 10,
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.8;
  for (let y = -ry + step; y < ry; y += step) {
    const norm = 1 - (y * y) / (ry * ry);
    const half = rx * Math.sqrt(Math.max(0, norm));
    const row = Math.round((y + ry) / step);
    for (let x = -half + (row % 2 ? step * 0.5 : 0); x < half; x += step) {
      ctx.beginPath();
      ctx.arc(cx + x, cy + y, step * 0.34, Math.PI, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();
}

export function drawHairStrands(
  ctx: CanvasRenderingContext2D,
  strands: readonly (readonly [number, number, number, number])[],
  color: string,
  alpha = 0.34,
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;
  ctx.lineCap = 'round';
  for (const [x1, y1, x2, y2] of strands) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo((x1 + x2) * 0.5 + 2, (y1 + y2) * 0.5 - 3, x2, y2);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawScarfFringe(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  direction: -1 | 1,
  color: string,
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 5; i += 1) {
    const dx = i * 3;
    ctx.beginPath();
    ctx.moveTo(x + dx, y);
    ctx.lineTo(x + dx + direction * (1 + (i % 2)), y + 7 + (i % 2) * 2);
    ctx.stroke();
  }
  ctx.restore();
}
