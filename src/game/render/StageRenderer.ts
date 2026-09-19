import { GROUND_Y, WORLD_HEIGHT, WORLD_WIDTH } from './drawUtils.js';

export function drawStage(ctx: CanvasRenderingContext2D, time: number): void {
  const sky = ctx.createLinearGradient(0, 0, 0, WORLD_HEIGHT);
  sky.addColorStop(0, '#111b36');
  sky.addColorStop(0.45, '#334b67');
  sky.addColorStop(0.72, '#c77b5e');
  sky.addColorStop(1, '#e9b66e');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  // Moon/sun haze.
  const glow = ctx.createRadialGradient(1020, 112, 10, 1020, 112, 145);
  glow.addColorStop(0, 'rgba(255,231,174,.92)');
  glow.addColorStop(0.25, 'rgba(255,201,137,.52)');
  glow.addColorStop(1, 'rgba(255,170,110,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(850, 0, 360, 280);
  ctx.fillStyle = '#ffd9a2';
  ctx.beginPath();
  ctx.arc(1020, 112, 43, 0, Math.PI * 2);
  ctx.fill();

  // Distant mountain silhouettes.
  ctx.fillStyle = '#27384b';
  ctx.beginPath();
  ctx.moveTo(0, 385);
  ctx.lineTo(110, 300);
  ctx.lineTo(195, 354);
  ctx.lineTo(315, 228);
  ctx.lineTo(430, 362);
  ctx.lineTo(540, 280);
  ctx.lineTo(680, 386);
  ctx.lineTo(790, 264);
  ctx.lineTo(930, 368);
  ctx.lineTo(1080, 248);
  ctx.lineTo(1280, 380);
  ctx.lineTo(1280, GROUND_Y);
  ctx.lineTo(0, GROUND_Y);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#3d4d58';
  ctx.beginPath();
  ctx.moveTo(0, 430);
  ctx.lineTo(150, 362);
  ctx.lineTo(260, 414);
  ctx.lineTo(400, 326);
  ctx.lineTo(540, 426);
  ctx.lineTo(720, 355);
  ctx.lineTo(900, 438);
  ctx.lineTo(1090, 344);
  ctx.lineTo(1280, 424);
  ctx.lineTo(1280, GROUND_Y);
  ctx.lineTo(0, GROUND_Y);
  ctx.closePath();
  ctx.fill();

  // Wind ribbons in the distance subtly suggest the Tramontana theme without dominating the arena.
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = '#d5ecff';
  ctx.lineWidth = 4;
  for (let i = 0; i < 4; i += 1) {
    const yy = 180 + i * 62;
    const offset = (time * 18 + i * 90) % 180;
    ctx.beginPath();
    ctx.moveTo(-180 + offset, yy);
    ctx.bezierCurveTo(230 + offset, yy - 35, 510 + offset, yy + 22, 840 + offset, yy - 7);
    ctx.stroke();
  }
  ctx.restore();

  // Arena platform.
  const ground = ctx.createLinearGradient(0, GROUND_Y, 0, WORLD_HEIGHT);
  ground.addColorStop(0, '#524438');
  ground.addColorStop(0.24, '#302b2b');
  ground.addColorStop(1, '#151619');
  ctx.fillStyle = ground;
  ctx.fillRect(0, GROUND_Y, WORLD_WIDTH, WORLD_HEIGHT - GROUND_Y);

  ctx.fillStyle = '#927357';
  ctx.fillRect(0, GROUND_Y - 9, WORLD_WIDTH, 11);
  ctx.fillStyle = '#c19a70';
  ctx.fillRect(0, GROUND_Y - 9, WORLD_WIDTH, 2);

  // Floor perspective and scratches.
  ctx.save();
  ctx.globalAlpha = 0.26;
  ctx.strokeStyle = '#b99c7e';
  ctx.lineWidth = 1;
  for (let x = 80; x < WORLD_WIDTH; x += 100) {
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y + 4);
    ctx.lineTo(WORLD_WIDTH / 2 + (x - WORLD_WIDTH / 2) * 1.5, WORLD_HEIGHT);
    ctx.stroke();
  }
  for (let y = GROUND_Y + 34; y < WORLD_HEIGHT; y += 42) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WORLD_WIDTH, y);
    ctx.stroke();
  }
  ctx.restore();

  // Low crowd silhouettes beyond the rail.
  ctx.fillStyle = '#171c25';
  for (let x = 28; x < WORLD_WIDTH; x += 34) {
    const bob = Math.sin(time * 1.8 + x * 0.09) * 2;
    ctx.beginPath();
    ctx.arc(x, GROUND_Y - 36 + bob, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x - 7, GROUND_Y - 28 + bob, 14, 22);
  }
  ctx.fillStyle = '#21262e';
  ctx.fillRect(0, GROUND_Y - 16, WORLD_WIDTH, 10);
}
