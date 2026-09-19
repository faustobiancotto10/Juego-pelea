import type { FighterSnapshot } from '../types.js';
import { ULTIMATES } from '../data/ultimates.js';
import { clamp01, lerp } from './drawUtils.js';
import { drawChameleon } from './ChameleonRig.js';
import { drawSupernariz } from './SupernarizRig.js';

type RigRenderer = (ctx: CanvasRenderingContext2D, fighter: FighterSnapshot, timeSeconds: number) => void;

const RIGS: Readonly<Record<string, RigRenderer>> = Object.freeze({
  chameleon: drawChameleon,
  supernariz: drawSupernariz,
});

const missingRigWarnings = new Set<string>();

function drawMissingRig(ctx: CanvasRenderingContext2D, fighter: FighterSnapshot): void {
  ctx.save();
  ctx.translate(fighter.x, 650 - fighter.y);
  ctx.strokeStyle = '#ff365f';
  ctx.fillStyle = 'rgba(255,54,95,.14)';
  ctx.lineWidth = 5;
  ctx.strokeRect(-42, -178, 84, 178);
  ctx.fillRect(-42, -178, 84, 178);
  ctx.beginPath();
  ctx.moveTo(-34, -168);
  ctx.lineTo(34, -12);
  ctx.moveTo(34, -168);
  ctx.lineTo(-34, -12);
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = '700 16px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('MISSING RIG', 0, -92);
  ctx.restore();

  if (!missingRigWarnings.has(fighter.id)) {
    missingRigWarnings.add(fighter.id);
    console.error(`No procedural rig registered for fighter visual key "${fighter.id}"`);
  }
}

function camaleoniUltimateAlpha(fighter: FighterSnapshot): number {
  if (fighter.id !== 'chameleon') return 1;
  const definition = ULTIMATES.camaleoniUltimate;

  if (fighter.ultimatePhase === 'startup') {
    const progress = clamp01(fighter.ultimatePhaseFrame / definition.startupFrames);
    return lerp(1, 0.12, clamp01(progress * 1.35));
  }

  if (fighter.ultimatePhase === 'capture') return 0.08;

  if (fighter.ultimatePhase === 'sequence') {
    const frame = fighter.ultimatePhaseFrame;
    if (frame < 8) return 0.18;
    if (frame < 16) return lerp(0.18, 0.94, (frame - 8) / 8);
    return 1;
  }

  return 1;
}

export function drawFighter(ctx: CanvasRenderingContext2D, fighter: FighterSnapshot, timeSeconds: number): void {
  const rig = RIGS[fighter.id];
  if (!rig) {
    drawMissingRig(ctx, fighter);
    return;
  }

  ctx.save();
  ctx.globalAlpha *= camaleoniUltimateAlpha(fighter);
  rig(ctx, fighter, timeSeconds);
  ctx.restore();
}
