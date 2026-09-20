import type { StageDefinition } from './StageRegistry.js';
import { DEFAULT_STAGE_REGISTRY } from './StageRegistry.js';
import { GROUND_Y, WORLD_HEIGHT, WORLD_WIDTH, ellipse, roundedLine } from './drawUtils.js';

export interface StagePresentationState {
  reaction: number;
  clashDarkening: number;
}

const DEFAULT_PRESENTATION: StagePresentationState = Object.freeze({
  reaction: 0,
  clashDarkening: 0,
});

function drawTramontanaDusk(ctx: CanvasRenderingContext2D, time: number): void {
  const sky = ctx.createLinearGradient(0, 0, 0, WORLD_HEIGHT);
  sky.addColorStop(0, '#111b36');
  sky.addColorStop(0.45, '#334b67');
  sky.addColorStop(0.72, '#c77b5e');
  sky.addColorStop(1, '#e9b66e');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

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

interface CrowdMember {
  x: number;
  y: number;
  scale: number;
  phase: number;
  shirt: string;
  armBias: number;
}

const CANCHA_CROWD: readonly CrowdMember[] = Object.freeze([
  { x: 104, y: 448, scale: 0.82, phase: 0.4, shirt: '#6b778f', armBias: -1 },
  { x: 139, y: 451, scale: 0.94, phase: 2.1, shirt: '#292d39', armBias: 1 },
  { x: 181, y: 446, scale: 0.79, phase: 4.8, shirt: '#72544a', armBias: 0 },
  { x: 238, y: 453, scale: 0.9, phase: 1.4, shirt: '#30394d', armBias: -1 },
  { x: 282, y: 449, scale: 0.74, phase: 3.6, shirt: '#5f6570', armBias: 1 },
  { x: 998, y: 451, scale: 0.76, phase: 0.9, shirt: '#48546b', armBias: -1 },
  { x: 1041, y: 447, scale: 0.91, phase: 2.8, shirt: '#2d303b', armBias: 1 },
  { x: 1087, y: 453, scale: 0.81, phase: 4.2, shirt: '#735950', armBias: 0 },
  { x: 1133, y: 447, scale: 0.96, phase: 1.7, shirt: '#3b4659', armBias: 1 },
  { x: 1178, y: 452, scale: 0.78, phase: 5.3, shirt: '#555b65', armBias: -1 },
  { x: 356, y: 424, scale: 0.72, phase: 0.2, shirt: '#49586d', armBias: 0 },
  { x: 398, y: 427, scale: 0.77, phase: 3.1, shirt: '#30333e', armBias: 1 },
  { x: 883, y: 426, scale: 0.73, phase: 4.4, shirt: '#5f4b48', armBias: -1 },
  { x: 925, y: 423, scale: 0.8, phase: 2.3, shirt: '#384356', armBias: 0 },
]);

function drawFloodlight(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  lean: number,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(lean);
  ctx.strokeStyle = '#29313a';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -286);
  ctx.stroke();

  ctx.fillStyle = '#303943';
  ctx.fillRect(-38, -300, 76, 25);
  for (const lx of [-27, -9, 9, 27]) {
    ellipse(ctx, lx, -288, 7, 7, '#f4e6bd');
  }

  const beam = ctx.createLinearGradient(0, -270, 0, -35);
  beam.addColorStop(0, 'rgba(255,236,186,.10)');
  beam.addColorStop(1, 'rgba(255,236,186,0)');
  ctx.fillStyle = beam;
  ctx.beginPath();
  ctx.moveTo(-43, -271);
  ctx.lineTo(43, -271);
  ctx.lineTo(125, -26);
  ctx.lineTo(-125, -26);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawRugbyPosts(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.strokeStyle = '#d9dedc';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  const baseX = 640;
  const baseY = 386;
  ctx.beginPath();
  ctx.moveTo(baseX - 68, baseY);
  ctx.lineTo(baseX - 68, 188);
  ctx.moveTo(baseX + 68, baseY);
  ctx.lineTo(baseX + 68, 188);
  ctx.moveTo(baseX - 68, 270);
  ctx.lineTo(baseX + 68, 270);
  ctx.stroke();
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(baseX - 68, 270);
  ctx.lineTo(baseX - 86, 180);
  ctx.moveTo(baseX + 68, 270);
  ctx.lineTo(baseX + 86, 180);
  ctx.stroke();
  ctx.restore();
}

function drawCrowdMember(
  ctx: CanvasRenderingContext2D,
  member: CrowdMember,
  time: number,
  reaction: number,
): void {
  const wobble = Math.sin(time * (1.5 + member.scale * 0.5) + member.phase);
  const reactionLift = reaction * (3 + Math.abs(Math.sin(member.phase * 3)) * 6);
  const bodyY = member.y - wobble * 1.6 - reactionLift;
  const arm = member.armBias * (5 + reaction * 11);

  ctx.save();
  ctx.translate(member.x, bodyY);
  ctx.scale(member.scale, member.scale);

  ellipse(ctx, 0, -37, 8, 9, '#20242b');
  ctx.fillStyle = member.shirt;
  ctx.beginPath();
  ctx.roundRect(-9, -29, 18, 24, 5);
  ctx.fill();
  roundedLine(ctx, -5, -3, -6, 18, 5, '#15181e');
  roundedLine(ctx, 5, -3, 7, 18, 5, '#15181e');
  roundedLine(ctx, -7, -24, -15 - arm, -10 - reaction * 5, 4, '#343942');
  roundedLine(ctx, 7, -24, 14 + arm, -11 - reaction * 4, 4, '#343942');

  ctx.restore();
}

function drawCancha56(
  ctx: CanvasRenderingContext2D,
  time: number,
  presentation: StagePresentationState,
): void {
  const reaction = Math.max(0, Math.min(1, presentation.reaction));

  const sky = ctx.createLinearGradient(0, 0, 0, WORLD_HEIGHT);
  sky.addColorStop(0, '#050814');
  sky.addColorStop(0.48, '#0b1424');
  sky.addColorStop(0.74, '#15202b');
  sky.addColorStop(1, '#1b292c');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  // Distant club buildings and warm windows keep the setting inhabited.
  ctx.fillStyle = '#111923';
  ctx.fillRect(0, 338, WORLD_WIDTH, 96);
  ctx.fillStyle = '#283039';
  ctx.fillRect(35, 325, 212, 88);
  ctx.fillRect(1038, 329, 198, 86);
  for (const x of [62, 104, 151, 196, 1064, 1112, 1162, 1204]) {
    ctx.fillStyle = '#b89a62';
    ctx.globalAlpha = 0.22;
    ctx.fillRect(x, 347, 21, 14);
  }
  ctx.globalAlpha = 1;

  drawFloodlight(ctx, 112, 374, -0.035);
  drawFloodlight(ctx, 1170, 374, 0.035);
  drawRugbyPosts(ctx);

  // Fence / club boundary.
  ctx.save();
  ctx.strokeStyle = '#47515a';
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.72;
  ctx.beginPath();
  ctx.moveTo(0, 426);
  ctx.lineTo(WORLD_WIDTH, 426);
  ctx.stroke();
  for (let x = 0; x <= WORLD_WIDTH; x += 42) {
    ctx.beginPath();
    ctx.moveTo(x, 387);
    ctx.lineTo(x, 427);
    ctx.stroke();
  }
  ctx.restore();

  // Low bleachers keep silhouettes away from the central combat corridor.
  ctx.fillStyle = '#252b30';
  ctx.fillRect(26, 430, 270, 10);
  ctx.fillRect(984, 430, 270, 10);
  ctx.fillStyle = '#1a2025';
  ctx.fillRect(43, 441, 235, 13);
  ctx.fillRect(1001, 441, 235, 13);

  for (const member of CANCHA_CROWD) drawCrowdMember(ctx, member, time, reaction);

  // Small party/gathering props at the edges only.
  ctx.fillStyle = '#c0b9a4';
  ctx.fillRect(206, 470, 34, 18);
  ctx.fillStyle = '#58606a';
  ctx.fillRect(209, 466, 28, 5);
  ctx.fillStyle = '#161b22';
  ctx.fillRect(1056, 464, 32, 27);
  ellipse(ctx, 1072, 463, 13, 4, '#313844');
  ctx.fillStyle = '#232830';
  ctx.fillRect(1110, 479, 46, 8);
  ctx.fillStyle = '#a58b4f';
  ctx.font = '700 15px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('LA 56', 1133, 475);

  // Rugby grass and field markings.
  const turf = ctx.createLinearGradient(0, 430, 0, WORLD_HEIGHT);
  turf.addColorStop(0, '#1e3c31');
  turf.addColorStop(0.5, '#24483a');
  turf.addColorStop(1, '#182f27');
  ctx.fillStyle = turf;
  ctx.fillRect(0, 454, WORLD_WIDTH, WORLD_HEIGHT - 454);

  ctx.save();
  ctx.globalAlpha = 0.11;
  for (let x = 0; x < WORLD_WIDTH; x += 92) {
    ctx.fillStyle = (x / 92) % 2 === 0 ? '#6f9a6c' : '#17382d';
    ctx.fillRect(x, 454, 92, WORLD_HEIGHT - 454);
  }
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = '#e7ead7';
  ctx.globalAlpha = 0.68;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 488);
  ctx.lineTo(WORLD_WIDTH, 488);
  ctx.moveTo(0, GROUND_Y + 84);
  ctx.lineTo(WORLD_WIDTH, GROUND_Y + 84);
  ctx.stroke();

  ctx.globalAlpha = 0.34;
  ctx.setLineDash([14, 14]);
  ctx.beginPath();
  ctx.moveTo(640, 456);
  ctx.lineTo(640, WORLD_HEIGHT);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Contact strip under fighters remains quieter than the crowd/background.
  ctx.fillStyle = 'rgba(5,12,10,.23)';
  ctx.fillRect(0, GROUND_Y - 7, WORLD_WIDTH, 13);
  ctx.fillStyle = 'rgba(229,236,213,.48)';
  ctx.fillRect(0, GROUND_Y - 5, WORLD_WIDTH, 2);

  // Restrained pool of light improves Juanchi's black silhouette.
  const arenaLight = ctx.createRadialGradient(640, 520, 80, 640, 520, 470);
  arenaLight.addColorStop(0, 'rgba(233,227,190,.12)');
  arenaLight.addColorStop(0.58, 'rgba(219,216,182,.055)');
  arenaLight.addColorStop(1, 'rgba(219,216,182,0)');
  ctx.fillStyle = arenaLight;
  ctx.fillRect(160, 326, 960, 394);
}

export function drawStage(
  ctx: CanvasRenderingContext2D,
  time: number,
  stage: StageDefinition = DEFAULT_STAGE_REGISTRY.get('tramontana-dusk'),
  presentation: StagePresentationState = DEFAULT_PRESENTATION,
): void {
  if (stage.rendererKey === 'cancha-56') {
    drawCancha56(ctx, time, presentation);
  } else {
    drawTramontanaDusk(ctx, time);
  }

  const darkening = Math.max(0, Math.min(1, presentation.clashDarkening));
  if (darkening > 0) {
    ctx.save();
    ctx.globalAlpha = darkening * 0.32;
    ctx.fillStyle = '#02040a';
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    ctx.restore();
  }
}
