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


export function drawCaptureStartup(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  facing: -1 | 1,
  intensity: number,
  accent: string,
): void {
  const t = clamp01(intensity);
  if (t <= 0) return;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);
  ctx.globalAlpha = 0.25 + 0.55 * t;

  const radius = lerp(72, 34, t);
  ctx.strokeStyle = accent;
  ctx.lineWidth = lerp(2, 5, t);
  ctx.beginPath();
  ctx.arc(0, -104, radius, -Math.PI * 0.8, Math.PI * 0.8);
  ctx.stroke();

  ctx.globalAlpha *= 0.65;
  for (let i = 0; i < 3; i += 1) {
    const sx = -34 + i * 34;
    ctx.beginPath();
    ctx.moveTo(sx, -178);
    ctx.lineTo(sx * 0.45, -144);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawDashAfterimage(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  facing: -1 | 1,
  intensity: number,
  accent: string,
): void {
  const t = clamp01(intensity);
  if (t <= 0) return;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);

  for (let i = 0; i < 4; i += 1) {
    const lag = i + 1;
    ctx.globalAlpha = Math.max(0, (0.24 - i * 0.045) * t);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 4 - i * 0.55;
    ctx.beginPath();
    ctx.ellipse(-lag * 28, -103, 34 + i * 3, 76, -0.08, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawReappearanceFlash(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  intensity: number,
): void {
  const t = clamp01(intensity);
  if (t <= 0) return;

  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = 0.9 * t;

  ctx.fillStyle = '#efffe9';
  const size = lerp(14, 70, t);
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(size * 0.22, -size * 0.22);
  ctx.lineTo(size, 0);
  ctx.lineTo(size * 0.22, size * 0.22);
  ctx.lineTo(0, size);
  ctx.lineTo(-size * 0.22, size * 0.22);
  ctx.lineTo(-size, 0);
  ctx.lineTo(-size * 0.22, -size * 0.22);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

export function drawNazazoArc(
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
  ctx.globalAlpha = 0.25 + 0.65 * t;
  ctx.strokeStyle = '#ffe8cb';
  ctx.lineWidth = lerp(8, 3, t);
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.arc(16, -116, lerp(36, 92, t), -1.35, 0.45);
  ctx.stroke();

  ctx.strokeStyle = '#ffb47f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(20, -114, lerp(30, 78, t), -1.25, 0.38);
  ctx.stroke();

  ctx.restore();
}

export function drawLaunchTrail(
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
  ctx.globalAlpha = 0.2 + 0.55 * t;
  ctx.lineCap = 'round';

  for (let i = 0; i < 4; i += 1) {
    const yy = -132 + i * 24;
    const reach = lerp(38, 190 - i * 18, t);
    ctx.strokeStyle = i < 2 ? '#fff3dd' : '#ffc38f';
    ctx.lineWidth = 5 - i * 0.7;
    ctx.beginPath();
    ctx.moveTo(-10, yy);
    ctx.lineTo(-reach, yy + i * 5);
    ctx.stroke();
  }

  ctx.restore();
}


export interface ColetazoPresentation {
  windup: number;
  strike: number;
  followThrough: number;
  recovery: number;
  sweep: number;
  trail: number;
}

export function getColetazoPresentation(moveFrame: number): ColetazoPresentation {
  const frame = Math.max(0, moveFrame);
  if (frame <= 5) {
    const windup = clamp01(frame / 5);
    return { windup, strike: 0, followThrough: 0, recovery: 0, sweep: lerp(0, -0.58, windup), trail: 0 };
  }
  if (frame <= 10) {
    const strike = clamp01((frame - 5) / 5);
    return { windup: 1 - strike, strike, followThrough: 0, recovery: 0, sweep: lerp(-0.58, 1, strike), trail: strike };
  }
  if (frame <= 17) {
    const followThrough = clamp01((frame - 10) / 7);
    return { windup: 0, strike: 1 - followThrough, followThrough, recovery: 0, sweep: lerp(1, 0.72, followThrough), trail: 1 - followThrough * 0.55 };
  }
  const recovery = clamp01((frame - 17) / 13);
  return { windup: 0, strike: 0, followThrough: 1 - recovery, recovery, sweep: lerp(0.72, 0, recovery), trail: Math.max(0, 0.35 - recovery * 0.35) };
}

export function drawColetazoTrail(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  facing: -1 | 1,
  presentation: ColetazoPresentation,
): void {
  const t = clamp01(presentation.trail);
  if (t <= 0.01) return;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);
  ctx.lineCap = 'round';

  const sweep = presentation.sweep;
  const startAngle = -2.65 + sweep * 0.62;
  const endAngle = -1.65 + sweep * 1.18;
  for (let i = 0; i < 3; i += 1) {
    ctx.globalAlpha = t * (0.34 - i * 0.075);
    ctx.strokeStyle = i === 0 ? '#d9f58f' : '#79c95d';
    ctx.lineWidth = 11 - i * 2.5;
    ctx.beginPath();
    ctx.arc(-4, -82, 92 + i * 16, startAngle - i * 0.06, endAngle + i * 0.09);
    ctx.stroke();
  }

  if (presentation.strike > 0.62) {
    ctx.globalAlpha = 0.18 + presentation.strike * 0.22;
    ctx.fillStyle = '#edffb8';
    ctx.beginPath();
    ctx.moveTo(72, -154);
    ctx.lineTo(124, -116);
    ctx.lineTo(82, -91);
    ctx.lineTo(142, -72);
    ctx.lineTo(69, -62);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

export function drawCapturedLock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  accent: string,
  timeSeconds: number,
): void {
  ctx.save();
  ctx.translate(x, y);
  const breathe = 0.5 + 0.5 * Math.sin(timeSeconds * 14);
  ctx.globalAlpha = 0.2 + breathe * 0.12;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.setLineDash([9, 9]);
  ctx.beginPath();
  ctx.ellipse(0, -96, 45 + breathe * 5, 82 + breathe * 4, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.globalAlpha = 0.12 + breathe * 0.08;
  ctx.beginPath();
  ctx.arc(0, -96, 60 + breathe * 7, -0.95, 0.95);
  ctx.stroke();
  ctx.restore();
}

export function drawCamaleoniSequenceCuts(
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
  ctx.lineCap = 'round';

  for (let i = 0; i < 3; i += 1) {
    const wave = Math.sin(timeSeconds * 22 + i * 1.8);
    ctx.globalAlpha = 0.18 + 0.24 * t;
    ctx.strokeStyle = i === 1 ? '#f0ffe8' : '#9ef5a5';
    ctx.lineWidth = 5 - i;
    ctx.beginPath();
    ctx.moveTo(-8 + i * 11, -150 + i * 36);
    ctx.quadraticCurveTo(60 + wave * 10, -125 + i * 16, 112 + i * 8, -92 + i * 10);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawSupernarizInhalePulse(
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
  const pulse = 0.5 + 0.5 * Math.sin(timeSeconds * 12);
  ctx.globalAlpha = 0.18 + t * 0.34;
  ctx.strokeStyle = '#fff2df';
  ctx.lineWidth = 3.5;
  for (let i = 0; i < 3; i += 1) {
    const radius = 26 + i * 18 + pulse * 7;
    ctx.beginPath();
    ctx.arc(38, -145, radius, -0.72, 0.72);
    ctx.stroke();
  }
  ctx.restore();
}


export function drawUltimateClashEffect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  intensity: number,
): void {
  const t = clamp01(intensity);
  if (t <= 0) return;

  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = 0.18 + t * 0.74;

  const radius = lerp(22, 116, 1 - t);
  for (let i = 0; i < 3; i += 1) {
    ctx.strokeStyle = i === 0 ? '#fff7d5' : i === 1 ? '#e6c863' : '#91c8ff';
    ctx.lineWidth = 7 - i * 1.6;
    ctx.beginPath();
    ctx.arc(0, 0, radius + i * 18, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.lineCap = 'round';
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 4; i += 1) {
      const yy = -34 + i * 23;
      ctx.globalAlpha = (0.2 + t * 0.5) * (1 - i * 0.1);
      ctx.strokeStyle = i % 2 === 0 ? '#fff3c3' : '#9fd4ff';
      ctx.lineWidth = 5 - i * 0.6;
      ctx.beginPath();
      ctx.moveTo(side * 18, yy);
      ctx.lineTo(side * lerp(52, 175 - i * 12, t), yy + side * (i - 1.5) * 3);
      ctx.stroke();
    }
  }

  if (t > 0.55) {
    ctx.globalAlpha = (t - 0.55) / 0.45 * 0.86;
    ctx.fillStyle = '#fff5ca';
    ctx.font = '900 28px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CHOQUE', 0, -82);
  }

  ctx.restore();
}

export function drawClashOpposingTrails(
  ctx: CanvasRenderingContext2D,
  leftX: number,
  leftY: number,
  rightX: number,
  rightY: number,
  intensity: number,
): void {
  const t = clamp01(intensity);
  if (t <= 0) return;

  const midX = (leftX + rightX) * 0.5;
  const midY = (leftY + rightY) * 0.5 - 94;
  ctx.save();
  ctx.globalAlpha = 0.16 + t * 0.34;
  ctx.lineCap = 'round';

  for (let i = 0; i < 3; i += 1) {
    const spread = (i - 1) * 21;
    ctx.strokeStyle = i === 1 ? '#fff0ae' : '#8fcaff';
    ctx.lineWidth = 7 - i * 1.2;

    ctx.beginPath();
    ctx.moveTo(leftX, leftY - 96 + spread);
    ctx.quadraticCurveTo(midX - 68, midY + spread * 0.25, midX - 12, midY + spread * 0.08);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(rightX, rightY - 96 - spread);
    ctx.quadraticCurveTo(midX + 68, midY - spread * 0.25, midX + 12, midY - spread * 0.08);
    ctx.stroke();
  }

  ctx.restore();
}


export function drawAttackMotionAccent(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  facing: -1 | 1,
  trailKey: string,
  intensity: number,
  phase: number,
): void {
  const t = clamp01(intensity);
  if (t <= 0.01 || trailKey === 'none') return;
  const beat = 0.35 + 0.65 * Math.sin(clamp01(phase) * Math.PI);

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);
  ctx.lineCap = 'round';

  if (trailKey === 'diagnostic-missing') {
    ctx.globalAlpha = 0.7 * t;
    ctx.strokeStyle = '#ff3bd4';
    ctx.lineWidth = 3;
    ctx.setLineDash([7, 5]);
    ctx.beginPath();
    ctx.arc(0, -105, 58, -1.1, 1.1);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    return;
  }

  if (trailKey === 'claw-green') {
    for (let i = 0; i < 3; i += 1) {
      ctx.globalAlpha = t * beat * (0.42 - i * 0.07);
      ctx.strokeStyle = i === 0 ? '#e6ffd5' : '#72dc70';
      ctx.lineWidth = 5 - i;
      ctx.beginPath();
      ctx.arc(32 + i * 4, -112 + i * 9, 34 + i * 7, -1.05, 0.42);
      ctx.stroke();
    }
  } else if (trailKey === 'tongue-snap') {
    // Deliberately short: presentation must never imply more reach than simulation.
    for (let i = 0; i < 3; i += 1) {
      ctx.globalAlpha = t * beat * (0.35 - i * 0.07);
      ctx.strokeStyle = i === 0 ? '#ff9eb3' : '#8ce68e';
      ctx.lineWidth = 5 - i;
      ctx.beginPath();
      ctx.moveTo(34, -118 + i * 5);
      ctx.quadraticCurveTo(60, -122 + i * 4, 78 - i * 5, -113 + i * 7);
      ctx.stroke();
    }
  } else if (trailKey === 'tail-mass') {
    ctx.globalAlpha = 0.22 + t * beat * 0.34;
    ctx.strokeStyle = '#d9f58f';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(-12, -82, 104, -2.7, -0.58);
    ctx.stroke();
  } else if (trailKey === 'nose-curve') {
    for (let i = 0; i < 2; i += 1) {
      ctx.globalAlpha = t * beat * (0.46 - i * 0.13);
      ctx.strokeStyle = i === 0 ? '#fff0d9' : '#ffb27c';
      ctx.lineWidth = 6 - i * 2;
      ctx.beginPath();
      ctx.arc(24, -132, 42 + i * 10, -1.22, 0.38);
      ctx.stroke();
    }
  } else if (trailKey === 'chorizo-spice') {
    ctx.globalAlpha = t * beat * 0.56;
    ctx.strokeStyle = '#ff9b48';
    ctx.lineWidth = 4;
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.moveTo(26 - i * 8, -118 + i * 10);
      ctx.lineTo(70 - i * 7, -123 + i * 7);
      ctx.stroke();
    }
  } else if (trailKey === 'wind-lanes') {
    ctx.globalAlpha = 0.18 + t * beat * 0.3;
    ctx.strokeStyle = '#dff5ff';
    for (let i = 0; i < 4; i += 1) {
      ctx.lineWidth = 4 - i * 0.55;
      ctx.beginPath();
      ctx.moveTo(28, -142 + i * 24);
      ctx.bezierCurveTo(70, -158 + i * 17, 116, -116 + i * 18, 166 - i * 8, -128 + i * 18);
      ctx.stroke();
    }
  } else if (trailKey === 'juanchi-gold') {
    ctx.globalAlpha = t * beat * 0.55;
    ctx.strokeStyle = '#f4d77c';
    for (let i = 0; i < 3; i += 1) {
      ctx.lineWidth = 5 - i;
      ctx.beginPath();
      ctx.moveTo(12 - i * 5, -126 + i * 14);
      ctx.quadraticCurveTo(54, -142 + i * 9, 90 - i * 4, -116 + i * 8);
      ctx.stroke();
    }
  } else if (trailKey === 'friccion-sparks') {
    ctx.globalAlpha = 0.34 + t * beat * 0.42;
    ctx.strokeStyle = '#ffd17c';
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 5; i += 1) {
      const sx = 10 + i * 7;
      ctx.beginPath();
      ctx.moveTo(sx, -116);
      ctx.lineTo(sx + 5 + (i % 2) * 4, -142 - i * 4);
      ctx.stroke();
    }
  } else if (trailKey === 'camaleoni-veil') {
    ctx.globalAlpha = t * beat * 0.22;
    ctx.strokeStyle = '#bfffb8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(-12, -104, 48, 82, -0.1, 0, Math.PI * 2);
    ctx.stroke();
  } else if (trailKey === 'toro-blue') {
    ctx.globalAlpha = t * beat * 0.5;
    ctx.strokeStyle = '#79b6ff';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(20, -105, 48, -1.05, 0.38);
    ctx.stroke();
  } else if (trailKey === 'topete-drive') {
    ctx.globalAlpha = 0.18 + t * beat * 0.34;
    ctx.strokeStyle = '#5ca7ff';
    for (let i = 0; i < 4; i += 1) {
      ctx.lineWidth = 7 - i;
      ctx.beginPath();
      ctx.moveTo(-22 - i * 9, -128 + i * 25);
      ctx.lineTo(-110 - i * 16, -116 + i * 24);
      ctx.stroke();
    }
  } else if (trailKey === 'shawarma-spice') {
    ctx.globalAlpha = t * beat * 0.5;
    ctx.strokeStyle = '#ff9d4c';
    ctx.lineWidth = 4;
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.moveTo(18 - i * 7, -116 + i * 9);
      ctx.lineTo(72 - i * 6, -124 + i * 7);
      ctx.stroke();
    }
  } else if (trailKey === 'super-eructo-gas') {
    ctx.globalAlpha = 0.12 + t * beat * 0.2;
    ctx.strokeStyle = '#9bd86e';
    for (let i = 0; i < 3; i += 1) {
      ctx.lineWidth = 6 - i;
      ctx.beginPath();
      ctx.ellipse(54 + i * 28, -105 + i * 9, 36 + i * 12, 25 + i * 8, 0, -0.9, 0.9);
      ctx.stroke();
    }
  }

  ctx.restore();
}

export function drawAttackContactBurst(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  facing: -1 | 1,
  contactBurstKey: string,
  intensity: number,
  progress: number,
): void {
  const t = clamp01(intensity);
  const p = clamp01(progress);
  if (t <= 0.01 || contactBurstKey === 'none') return;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);
  ctx.lineCap = 'round';

  if (contactBurstKey === 'diagnostic-missing') {
    ctx.globalAlpha = (1 - p) * 0.85;
    ctx.strokeStyle = '#ff3bd4';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-18, -18);
    ctx.lineTo(18, 18);
    ctx.moveTo(18, -18);
    ctx.lineTo(-18, 18);
    ctx.stroke();
    ctx.restore();
    return;
  }

  const radius = lerp(12, contactBurstKey === 'major-impact' ? 82 : 46, p);
  const alpha = (1 - p) * (0.45 + t * 0.45);
  ctx.globalAlpha = alpha;

  if (contactBurstKey === 'claw-green' || contactBurstKey === 'tail-mass') {
    ctx.strokeStyle = '#cfff9b';
  } else if (contactBurstKey === 'nose-curve') {
    ctx.strokeStyle = '#ffd4b2';
  } else if (contactBurstKey === 'chorizo-spice') {
    ctx.strokeStyle = '#ff9b48';
  } else if (contactBurstKey === 'wind-lanes') {
    ctx.strokeStyle = '#dff5ff';
  } else if (contactBurstKey === 'juanchi-gold' || contactBurstKey === 'friccion-sparks') {
    ctx.strokeStyle = '#f4d77c';
  } else if (contactBurstKey === 'tongue-snap') {
    ctx.strokeStyle = '#ff9eb3';
  } else if (contactBurstKey === 'toro-blue' || contactBurstKey === 'topete-drive') {
    ctx.strokeStyle = '#79b6ff';
  } else if (contactBurstKey === 'shawarma-debris') {
    ctx.strokeStyle = '#ff9d4c';
  } else if (contactBurstKey === 'super-eructo-gas') {
    ctx.strokeStyle = '#a7db76';
  } else {
    ctx.strokeStyle = '#fff2ba';
  }

  ctx.lineWidth = contactBurstKey === 'major-impact' ? 7 : 4;
  ctx.beginPath();
  ctx.arc(0, 0, radius, -0.95, 0.95);
  ctx.stroke();

  const rays = contactBurstKey === 'major-impact' ? 8 : contactBurstKey === 'chorizo-spice' ? 6 : 4;
  for (let i = 0; i < rays; i += 1) {
    const angle = -0.9 + (1.8 * i) / Math.max(1, rays - 1);
    const reach = radius + 18 + (i % 2) * 9;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * radius * 0.65, Math.sin(angle) * radius * 0.65);
    ctx.lineTo(Math.cos(angle) * reach, Math.sin(angle) * reach);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawRugbyCatchAccent(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  intensity: number,
): void {
  const t = clamp01(intensity);
  if (t <= 0.01) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = t * 0.7;
  ctx.strokeStyle = '#f4d77c';
  ctx.lineWidth = 3;
  for (let i = 0; i < 2; i += 1) {
    ctx.beginPath();
    ctx.arc(0, 0, 14 + (1 - t) * 22 + i * 9, -0.8, 2.4);
    ctx.stroke();
  }
  ctx.restore();
}


export function drawTopeteDrive(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  facing: -1 | 1,
  intensity: number,
): void {
  const t = clamp01(intensity);
  if (t <= 0.01) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);
  ctx.lineCap = 'round';
  for (let i = 0; i < 4; i += 1) {
    ctx.globalAlpha = (0.16 + t * 0.28) * (1 - i * 0.12);
    ctx.strokeStyle = i < 2 ? '#77b8ff' : '#326fae';
    ctx.lineWidth = 8 - i * 1.2;
    ctx.beginPath();
    ctx.moveTo(-20 - i * 10, -126 + i * 28);
    ctx.quadraticCurveTo(-72 - i * 12, -132 + i * 27, -142 - i * 14, -115 + i * 26);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawToroGroundImpact(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  facing: -1 | 1,
  intensity: number,
): void {
  const t = clamp01(intensity);
  if (t <= 0.01) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);
  // Bounded turf fragments; presentation only.
  for (let i = 0; i < 8; i += 1) {
    const angle = -2.75 + i * 0.23;
    const reach = 18 + i * 5 * t;
    ctx.globalAlpha = (0.5 - i * 0.04) * t;
    ctx.strokeStyle = i % 2 === 0 ? '#71874f' : '#b59c67';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(34, -3);
    ctx.lineTo(34 + Math.cos(angle) * reach, -3 + Math.sin(angle) * reach);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawShawarmaProjectile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  vx: number,
  age: number,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((vx >= 0 ? 1 : -1) * age * 0.16);
  ctx.fillStyle = '#d8a45f';
  ctx.strokeStyle = '#5f3c24';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-16, -10);
  ctx.lineTo(16, -7);
  ctx.lineTo(11, 11);
  ctx.lineTo(-13, 9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  roundedLine(ctx, -9, -3, 8, 2, 3, '#7e3b2c');
  roundedLine(ctx, -7, 3, 7, 6, 2.2, '#5c9a45');
  ctx.restore();
}

export function drawShawarmaImpact(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  facing: -1 | 1,
  intensity: number,
): void {
  const t = clamp01(intensity);
  if (t <= 0.01) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);
  // Warm food/debris burst.
  for (let i = 0; i < 10; i += 1) {
    const angle = -1.35 + i * 0.29;
    const reach = 18 + (i % 4) * 8;
    ctx.globalAlpha = (0.22 + t * 0.48) * (1 - i * 0.045);
    ctx.strokeStyle = i % 3 === 0 ? '#83b85c' : i % 2 === 0 ? '#ffb259' : '#9c5131';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(angle) * reach, Math.sin(angle) * reach);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawSuperEructoBlast(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  facing: -1 | 1,
  progress: number,
  range = 390,
): void {
  const t = clamp01(progress);
  if (t <= 0.01) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);
  // Translucent layered gas stays below opaque coverage so silhouettes remain readable.
  for (let i = 0; i < 5; i += 1) {
    const lane = i - 2;
    const reach = Math.min(range, lerp(70 + i * 8, range - i * 18, t));
    ctx.globalAlpha = (0.08 + t * 0.11) * (1 - Math.abs(lane) * 0.08);
    ctx.fillStyle = i % 2 === 0 ? '#7fbd59' : '#abd978';
    ctx.beginPath();
    ctx.ellipse(reach * 0.55, -104 + lane * 21, reach * 0.5, 30 + (2 - Math.abs(lane)) * 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.16 + t * 0.14;
    ctx.strokeStyle = i % 2 === 0 ? '#bce897' : '#77b553';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(30, -104 + lane * 18);
    ctx.bezierCurveTo(
      reach * 0.28,
      -132 + lane * 16,
      reach * 0.72,
      -74 + lane * 19,
      reach,
      -103 + lane * 17,
    );
    ctx.stroke();
  }
  ctx.restore();
}
