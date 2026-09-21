import { ellipse, roundedLine } from './drawUtils.js';
import { getCharacterStructure } from './CharacterStructure.js';

type PortraitRenderer = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) => void;

function portraitFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  accent: string,
  drawSubject: () => void,
): void {
  ctx.save();
  ctx.clearRect(0, 0, width, height);
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#10141b');
  gradient.addColorStop(1, accent);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.globalAlpha = 0.16;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(width * 0.82, height * 0.12, width * 0.34, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.translate(width * 0.5, height * 0.96);
  const scale = Math.min(width / 190, height / 165);
  ctx.scale(scale, scale);
  drawSubject();
  ctx.restore();
}

function drawCamaleoniPortrait(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const { body } = getCharacterStructure('chameleon');
  portraitFrame(ctx, width, height, '#326d45', () => {
    // camaleoni / chameleon identity: green skin, claw hand and angular crest.
    ctx.fillStyle = '#2e864d';
    ctx.strokeStyle = '#123d26';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-47 * body.torsoWidth, -8);
    ctx.quadraticCurveTo(-55 * body.torsoWidth, -75 * body.torsoLength, -27 * body.shoulderWidth, -112);
    ctx.quadraticCurveTo(4, -134, 41 * body.shoulderWidth, -108);
    ctx.quadraticCurveTo(56 * body.torsoWidth, -64 * body.torsoLength, 48 * body.torsoWidth, -8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ellipse(ctx, 2, -119, 34 * body.headWidth, 36 * body.headHeight, '#54a768', -0.03, '#173c24', 2.4);
    ctx.fillStyle = '#204d31';
    ctx.beginPath();
    ctx.moveTo(-17, -151);
    ctx.lineTo(-4, -166);
    ctx.lineTo(5, -150);
    ctx.lineTo(18, -164);
    ctx.lineTo(23, -145);
    ctx.fill();
    ellipse(ctx, 17, -124, 5, 4, '#f4dd63', 0, '#132319', 1.5);
    roundedLine(ctx, -33, -67, -59, -34, 12, '#3d9858');
    roundedLine(ctx, -58, -34, -73, -55, 4, '#b9e684');
    roundedLine(ctx, -58, -34, -78, -35, 4, '#b9e684');
    roundedLine(ctx, -58, -34, -72, -17, 4, '#b9e684');
  });
}

function drawSupernarizPortrait(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const { body } = getCharacterStructure('supernariz');
  portraitFrame(ctx, width, height, '#8a4c32', () => {
    ctx.fillStyle = '#e4b28d';
    ctx.strokeStyle = '#714733';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-48 * body.torsoWidth, -5);
    ctx.quadraticCurveTo(-49 * body.torsoWidth, -72 * body.torsoLength, -30 * body.shoulderWidth, -108);
    ctx.quadraticCurveTo(4, -128, 39 * body.shoulderWidth, -106);
    ctx.quadraticCurveTo(52 * body.torsoWidth, -67 * body.torsoLength, 47 * body.torsoWidth, -5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ellipse(ctx, 2, -123, 33 * body.headWidth, 38 * body.headHeight, '#d7a17e', -0.02, '#704936', 2.2);
    // Signature nose silhouette.
    ctx.fillStyle = '#c88968';
    ctx.beginPath();
    ctx.moveTo(15, -133);
    ctx.quadraticCurveTo(68, -127, 80, -113);
    ctx.quadraticCurveTo(62, -101, 18, -109);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ellipse(ctx, 12, -132, 3, 2.5, '#191615');
    roundedLine(ctx, -24, -160, 26, -158, 9, '#412b24');
  });
}

function drawJuanchiPortrait(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const { body } = getCharacterStructure('juanchi');
  portraitFrame(ctx, width, height, '#5b4b22', () => {
    ctx.fillStyle = '#101318';
    ctx.strokeStyle = '#05070a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-49 * body.torsoWidth, -4);
    ctx.quadraticCurveTo(-54 * body.torsoWidth, -70 * body.torsoLength, -37 * body.shoulderWidth, -110);
    ctx.quadraticCurveTo(2, -128, 44 * body.shoulderWidth, -108);
    ctx.quadraticCurveTo(54 * body.torsoWidth, -66 * body.torsoLength, 49 * body.torsoWidth, -4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f1f1e9';
    ctx.font = '900 16px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('La 56', 5, -64);
    ellipse(ctx, 2, -126, 34 * body.headWidth, 39 * body.headHeight, '#c88c68', -0.03, '#5c382a', 2.3);
    ctx.fillStyle = '#171819';
    for (const [x, y, r] of [[-23,-153,10],[-9,-165,11],[5,-168,12],[20,-161,11],[29,-149,9]] as const) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    roundedLine(ctx, -38, -46, -62, -25, 12, '#111419');
    ellipse(ctx, -67, -22, 13, 8, '#9b5d31', -0.25, '#3e2417', 1.5);
  });
}

function drawElToroPortrait(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const { body } = getCharacterStructure('el-toro');
  portraitFrame(ctx, width, height, '#315b91', () => {
    // Broad torso with oversized shirt.
    ctx.fillStyle = '#f0efe8';
    ctx.strokeStyle = '#2a2d31';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-58 * body.torsoWidth, -3);
    ctx.quadraticCurveTo(-64 * body.torsoWidth, -72 * body.torsoLength, -44 * body.shoulderWidth, -110);
    ctx.quadraticCurveTo(3, -132, 54 * body.shoulderWidth, -108);
    ctx.quadraticCurveTo(65 * body.torsoWidth, -68 * body.torsoLength, 58 * body.torsoWidth, -3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Scotland scarf bands.
    roundedLine(ctx, -34, -105, 35, -101, 12, '#2d67ad');
    roundedLine(ctx, -30, -105, 32, -102, 3, '#ffffff');
    roundedLine(ctx, -24, -96, -38, -44, 10, '#2d67ad');
    roundedLine(ctx, -24, -88, -38, -48, 2.5, '#ffffff');

    ctx.fillStyle = '#111317';
    ctx.font = '900 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TE VOY A CHOCAR', 5, -58);

    ellipse(ctx, 3, -132, 37 * body.headWidth, 40 * body.headHeight, '#c88a66', -0.02, '#57382c', 2.4);
    ctx.fillStyle = '#2b211d';
    for (const [x, y, r] of [[-28,-158,10],[-15,-170,11],[0,-176,12],[17,-171,12],[30,-159,11]] as const) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ellipse(ctx, 17, -134, 2.7, 2.3, '#0b0d10');

    // Blue wrap plus small shawarma waist cue.
    roundedLine(ctx, 42, -39, 67, -28, 11, '#2f74c7');
    ctx.fillStyle = '#d8a45f';
    ctx.strokeStyle = '#5f3c24';
    ctx.beginPath();
    ctx.moveTo(-28, -20);
    ctx.lineTo(-10, -17);
    ctx.lineTo(-13, -2);
    ctx.lineTo(-29, -4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });
}

export const PORTRAIT_KEYS = Object.freeze(['chameleon', 'supernariz', 'juanchi', 'el-toro'] as const);

export const PORTRAIT_RENDERERS: Readonly<Record<string, PortraitRenderer>> = Object.freeze({
  chameleon: drawCamaleoniPortrait,
  supernariz: drawSupernarizPortrait,
  juanchi: drawJuanchiPortrait,
  'el-toro': drawElToroPortrait,
});

export function hasFighterPortrait(portraitKey: string): boolean {
  return PORTRAIT_RENDERERS[portraitKey] !== undefined;
}

function drawMissingPortrait(
  ctx: CanvasRenderingContext2D,
  portraitKey: string,
  width: number,
  height: number,
): void {
  ctx.save();
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#22141b';
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = '#ff365f';
  ctx.lineWidth = 4;
  ctx.strokeRect(5, 5, width - 10, height - 10);
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('MISSING PORTRAIT', width / 2, height / 2 - 8);
  ctx.font = '600 10px system-ui, sans-serif';
  ctx.fillText(portraitKey, width / 2, height / 2 + 12);
  ctx.restore();
}

export function drawFighterPortrait(
  ctx: CanvasRenderingContext2D,
  portraitKey: string,
  width = ctx.canvas.width,
  height = ctx.canvas.height,
): boolean {
  const renderer = PORTRAIT_RENDERERS[portraitKey];
  if (!renderer) {
    drawMissingPortrait(ctx, portraitKey, width, height);
    return false;
  }
  renderer(ctx, width, height);
  return true;
}

/**
 * Stable Brancaforte seam: UI owns the DOM/card; Mario owns portrait pixels.
 * Expected markup:
 * [data-fighter-portrait][data-portrait-key] > .fighter-portrait-canvas
 */
export function mountFighterPortraits(root: ParentNode = document): number {
  let mounted = 0;
  for (const host of root.querySelectorAll<HTMLElement>('[data-fighter-portrait][data-portrait-key]')) {
    const portraitKey = host.dataset.portraitKey;
    const canvas = host.querySelector<HTMLCanvasElement>('.fighter-portrait-canvas');
    if (!portraitKey || !canvas) continue;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;
    drawFighterPortrait(ctx, portraitKey, canvas.width, canvas.height);
    host.dataset.portraitRendered = hasFighterPortrait(portraitKey) ? 'true' : 'missing';
    mounted += 1;
  }
  return mounted;
}
