import { ellipse, roundedLine } from './drawUtils.js';
import { getCharacterStructure } from './CharacterStructure.js';
import {
  drawCargoPocket,
  drawFabricGrain,
  drawFacePlanes,
  drawHairStrands,
  drawScaleField,
  drawScarfFringe,
  drawShadedEllipse,
  drawStitchLine,
} from './ReferenceDetailPrimitives.js';

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
    // Master identity: oversized human head on a narrow scaled chameleon body.
    ctx.save();
    ctx.strokeStyle = '#315f2d';
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-18, -38);
    ctx.bezierCurveTo(-75, -48, -88, -8, -61, 18);
    ctx.bezierCurveTo(-38, 39, -14, 24, -24, 6);
    ctx.stroke();
    ctx.strokeStyle = '#6cae42';
    ctx.lineWidth = 9;
    ctx.stroke();
    ctx.restore();

    drawShadedEllipse(ctx, 0, -53, 28 * body.torsoWidth, 50 * body.torsoLength, '#4f8f38', '#86bf5e', '#244f2b', -0.02, '#274f2c', 2.5);
    drawScaleField(ctx, 0, -53, 20 * body.torsoWidth, 37 * body.torsoLength, '#244b2b', 0.24, 7);
    roundedLine(ctx, -10, -36, -36, -22, 8 * body.armThickness, '#62a444');
    roundedLine(ctx, 10, -36, 34, -22, 8 * body.armThickness, '#62a444');
    roundedLine(ctx, -10, -12, -24, 20, 12 * body.legThickness, '#5d9d3c');
    roundedLine(ctx, 10, -12, 24, 20, 12 * body.legThickness, '#5d9d3c');

    ellipse(ctx, 0, -101, 15 * body.neckWidth, 31, '#4f8f38', 0, '#274f2c', 2);
    drawScaleField(ctx, 0, -101, 11 * body.neckWidth, 24, '#244b2b', 0.22, 7);
    drawShadedEllipse(ctx, 1, -142, 38 * body.headWidth, 37 * body.headHeight, '#c98f68', '#efb28d', '#895746', -0.03, '#633f31', 2.3);
    drawFacePlanes(ctx, 1, -142, Math.min(1.15, body.headWidth), '#ffd0ad', '#754539');
    ellipse(ctx, -31, -139, 6, 10, '#b97c58');
    ctx.fillStyle = '#171918';
    for (const [x,y,r] of [[-29,-169,11],[-16,-181,12],[-1,-184,13],[14,-181,12],[28,-171,11],[-32,-157,9]] as const) {
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    drawHairStrands(ctx, [[-21,-176,-14,-160],[-5,-181,0,-162],[11,-178,16,-159]], '#65534b', 0.3);
    roundedLine(ctx, 4, -149, 18, -150, 2.6, '#35251f');
    ellipse(ctx, 15, -144, 2.4, 2.1, '#101316');
    roundedLine(ctx, 10, -121, 24, -121, 2.3, '#4b2020');
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = '#8a5a4c';
    for (const [x,y] of [[10,-136],[17,-132],[23,-136],[7,-129],[19,-126]] as const) {
      ctx.beginPath(); ctx.arc(x, y, 1.3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  });
}

function drawSupernarizPortrait(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const { body } = getCharacterStructure('supernariz');
  portraitFrame(ctx, width, height, '#7a2531', () => {
    // Blue suit / red cape / giant nose are all part of the canonical read.
    ctx.fillStyle = '#9e202c';
    ctx.strokeStyle = '#56131a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-25, -105);
    ctx.quadraticCurveTo(-61, -77, -58, -9);
    ctx.lineTo(-23, -24);
    ctx.lineTo(-5, -92);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    drawShadedEllipse(ctx, 0, -57, 31 * body.torsoWidth, 54 * body.torsoLength, '#2d61bd', '#5e91e5', '#17356b', -0.03, '#16376f', 2.6);
    drawFabricGrain(ctx, 0, -57, 52, 88, '#8fb1ef', 0.11, 9);
    roundedLine(ctx, -28, -23, 28, -23, 7, '#8c2530');
    ellipse(ctx, 0, -24, 10, 7, '#d8b45a', 0, '#6f5122', 1.2);
    for (const x of [16,25]) ellipse(ctx, x, -13, 4, 8, '#c46d42', 0.16, '#7a3e2c', 1);

    // Nose emblem on chest.
    ctx.fillStyle = '#d29a77';
    ctx.strokeStyle = '#754638';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(5,-82); ctx.bezierCurveTo(-6,-73,-7,-58,4,-55);
    ctx.bezierCurveTo(17,-53,22,-65,16,-74); ctx.bezierCurveTo(13,-80,10,-83,5,-82);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    drawShadedEllipse(ctx, 1, -126, 33 * body.headWidth, 38 * body.headHeight, '#d7a17e', '#efbf9c', '#925f49', -0.02, '#704936', 2.2);
    drawFacePlanes(ctx, 1, -126, body.headWidth, '#ffd6b7', '#815040');
    ctx.fillStyle = '#2b211d';
    ctx.beginPath();
    ctx.moveTo(-30,-143); ctx.bezierCurveTo(-23,-170,20,-172,29,-145);
    ctx.bezierCurveTo(13,-155,-6,-153,-30,-143); ctx.fill();
    drawHairStrands(ctx, [[-18,-157,-10,-145],[-3,-162,2,-147],[13,-158,18,-145]], '#765b4f', 0.3);
    ellipse(ctx, 12, -132, 2.5, 2.2, '#171515');

    // Canonical long bulbous profile nose.
    ctx.fillStyle = '#c88968';
    ctx.strokeStyle = '#704333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(15, -134);
    ctx.bezierCurveTo(43, -138, 71, -136, 84, -124);
    ctx.bezierCurveTo(72, -111, 42, -111, 17, -119);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ellipse(ctx, 78, -123, 7, 6, '#b97358');
    ellipse(ctx, 81, -122, 2, 1.6, '#59352b');
  });
}

function drawJuanchiPortrait(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const { body } = getCharacterStructure('juanchi');
  portraitFrame(ctx, width, height, '#5b4b22', () => {
    // Athletic black/gold streetwear silhouette.
    ctx.fillStyle = '#101318';
    ctx.strokeStyle = '#05070a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-49 * body.torsoWidth, -4);
    ctx.quadraticCurveTo(-54 * body.torsoWidth, -70 * body.torsoLength, -37 * body.shoulderWidth, -110);
    ctx.quadraticCurveTo(2, -128, 44 * body.shoulderWidth, -108);
    ctx.quadraticCurveTo(54 * body.torsoWidth, -66 * body.torsoLength, 49 * body.torsoWidth, -4);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    drawFabricGrain(ctx, 0, -57, 82 * body.torsoWidth, 92 * body.torsoLength, '#686d73', 0.11, 10);

    ctx.strokeStyle = '#d8b65c'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(2, -99, 18, 0.3, Math.PI - 0.3); ctx.stroke();
    roundedLine(ctx, 2, -86, 2, -75, 1.5, '#f0d478');
    roundedLine(ctx, -3, -80, 7, -80, 1.5, '#f0d478');

    ctx.fillStyle = '#f1f1e9'; ctx.font = '900 17px system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.fillText('La 56', 5, -58);
    roundedLine(ctx, -21, -45, 29, -52, 3, '#c49a39');

    // Tied jacket / cargo pocket / cap cues.
    ctx.fillStyle = '#11151b'; ctx.strokeStyle = '#05070a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-30,-34); ctx.lineTo(-14,4); ctx.lineTo(-4,-32); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(30,-34); ctx.lineTo(15,4); ctx.lineTo(4,-32); ctx.closePath(); ctx.fill(); ctx.stroke();
    drawCargoPocket(ctx, 33, -10, 22, 16, '#1c2026', '#07090c', '#d8b65c');

    drawShadedEllipse(ctx, 2, -129, 32 * body.headWidth, 37 * body.headHeight, '#c88c68', '#edb18d', '#875744', -0.03, '#5c382a', 2.3);
    drawFacePlanes(ctx, 2, -129, body.headWidth, '#ffd0ad', '#754437');
    ctx.fillStyle = '#171819';
    for (const [x,y,r] of [[-22,-156,10],[-9,-167,11],[5,-170,12],[19,-166,11],[29,-154,9],[-27,-146,8]] as const) {
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    }
    drawHairStrands(ctx, [[-17,-162,-10,-150],[-4,-168,0,-153],[10,-166,15,-151]], '#584a45', 0.3);
    ellipse(ctx, 16, -132, 2.6, 2.2, '#0b0e12');
    roundedLine(ctx, 8, -109, 22, -109, 2.3, '#5d2b28');

    // Rugby ball and police cap read as equipment, not anatomy.
    ellipse(ctx, -61, -20, 14, 8, '#9b5d31', -0.25, '#3e2417', 1.5);
    roundedLine(ctx, -67, -20, -55, -20, 1.5, '#f5e6ca');
    ctx.fillStyle = '#151922';
    ctx.beginPath(); ctx.ellipse(53, -12, 13, 8, -0.25, Math.PI, Math.PI*2); ctx.lineTo(65,-8); ctx.lineTo(42,-7); ctx.closePath(); ctx.fill();
  });
}

function drawElToroPortrait(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const { body } = getCharacterStructure('el-toro');
  portraitFrame(ctx, width, height, '#315b91', () => {
    ctx.fillStyle = '#f0efe8';
    ctx.strokeStyle = '#2a2d31';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-58 * body.torsoWidth, -3);
    ctx.quadraticCurveTo(-64 * body.torsoWidth, -72 * body.torsoLength, -44 * body.shoulderWidth, -110);
    ctx.quadraticCurveTo(3, -132, 54 * body.shoulderWidth, -108);
    ctx.quadraticCurveTo(65 * body.torsoWidth, -68 * body.torsoLength, 58 * body.torsoWidth, -3);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    drawFabricGrain(ctx, 0, -57, 100 * body.torsoWidth, 90 * body.torsoLength, '#9d978d', 0.10, 12);

    // Scotland scarf with saltire + fringe.
    roundedLine(ctx, -34, -105, 35, -101, 12, '#2d67ad');
    roundedLine(ctx, -30, -105, 32, -102, 3, '#ffffff');
    roundedLine(ctx, -24, -96, -38, -44, 10, '#2d67ad');
    roundedLine(ctx, -24, -88, -38, -48, 2.5, '#ffffff');
    roundedLine(ctx, -32, -72, -23, -61, 2, '#ffffff');
    roundedLine(ctx, -23, -72, -32, -61, 2, '#ffffff');
    drawScarfFringe(ctx, -41, -43, -1, '#f5f7f8');

    ctx.fillStyle = '#111317'; ctx.font = '900 11px system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.fillText('TE VOY A CHOCAR', 5, -58);

    // South Africa belt / shawarma / hanging tag.
    roundedLine(ctx, -31, -18, 31, -18, 7, '#176b42');
    roundedLine(ctx, -18, -18, -3, -18, 2.3, '#f1c84b');
    roundedLine(ctx, 3, -18, 18, -18, 2.3, '#c8443c');
    roundedLine(ctx, -4, -14, -4, 3, 1.4, '#c7cbd0');
    ctx.fillStyle = '#2a8a59'; ctx.fillRect(-9, 0, 11, 13);
    ctx.fillStyle = '#d8a45f'; ctx.strokeStyle = '#5f3c24';
    ctx.beginPath(); ctx.moveTo(-28,-16); ctx.lineTo(-11,-13); ctx.lineTo(-15,3); ctx.lineTo(-29,0); ctx.closePath(); ctx.fill(); ctx.stroke();

    drawShadedEllipse(ctx, 3, -132, 36 * body.headWidth, 39 * body.headHeight, '#c88a66', '#efb08b', '#8d5b47', -0.02, '#57382c', 2.4);
    drawFacePlanes(ctx, 3, -132, body.headWidth, '#ffd0ae', '#7e493b');
    // Mullet rear mass first, then crown.
    ctx.fillStyle = '#2b211d';
    ctx.beginPath(); ctx.moveTo(-29,-144); ctx.quadraticCurveTo(-43,-112,-27,-88); ctx.quadraticCurveTo(-15,-99,-12,-126); ctx.closePath(); ctx.fill();
    for (const [x,y,r] of [[-28,-158,10],[-15,-170,11],[0,-176,12],[17,-171,12],[30,-159,11],[-30,-146,9]] as const) {
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    }
    drawHairStrands(ctx, [[-21,-166,-15,-151],[-5,-173,0,-155],[11,-169,17,-152],[-29,-137,-26,-105]], '#836457', 0.28);
    ellipse(ctx, 17, -134, 2.7, 2.3, '#0b0d10');
    ctx.save(); ctx.globalAlpha = 0.18; ellipse(ctx, 21,-126,9,6,'#d56f5f'); ctx.restore();

    // Blue wrist wrap cue and cargo pocket.
    roundedLine(ctx, 42, -39, 67, -28, 11, '#2f74c7');
    drawCargoPocket(ctx, 43, -4, 22, 16, '#20242a', '#090b0e', '#c99a43');
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
