import type { FighterSnapshot } from '../types.js';
import { clamp01, lerp } from './drawUtils.js';
import { drawChameleon } from './ChameleonRig.js';
import { drawSupernariz } from './SupernarizRig.js';

function camaleoniUltimateAlpha(fighter: FighterSnapshot, timeSeconds: number): number {
  if (fighter.id !== 'chameleon') return 1;

  if (fighter.ultimatePhase === 'startup') {
    const fade = clamp01(fighter.moveFrame / 9);
    return lerp(1, 0.34, fade);
  }

  if (fighter.ultimatePhase === 'capture') {
    return 0.1 + (0.035 + 0.035 * Math.sin(timeSeconds * 24));
  }

  if (fighter.ultimatePhase === 'sequence') {
    return 0.68 + 0.1 * Math.sin(timeSeconds * 17);
  }

  return 1;
}

export function drawFighter(ctx: CanvasRenderingContext2D, fighter: FighterSnapshot, timeSeconds: number): void {
  ctx.save();
  ctx.globalAlpha *= camaleoniUltimateAlpha(fighter, timeSeconds);

  if (fighter.id === 'chameleon') drawChameleon(ctx, fighter, timeSeconds);
  else drawSupernariz(ctx, fighter, timeSeconds);

  ctx.restore();
}
