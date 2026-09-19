import type { FighterSnapshot } from '../types.js';
import { drawChameleon } from './ChameleonRig.js';
import { drawSupernariz } from './SupernarizRig.js';

export function drawFighter(ctx: CanvasRenderingContext2D, fighter: FighterSnapshot, timeSeconds: number): void {
  ctx.save();

  // Camaleoni's committed capture dash is simulation-authored; the renderer only
  // presents it as near-invisibility. Sequence/recovery return readability.
  if (fighter.id === 'chameleon') {
    if (fighter.ultimatePhase === 'capture') ctx.globalAlpha = 0.12;
    else if (fighter.ultimatePhase === 'sequence') ctx.globalAlpha = 0.78;
  }

  if (fighter.id === 'chameleon') drawChameleon(ctx, fighter, timeSeconds);
  else drawSupernariz(ctx, fighter, timeSeconds);

  ctx.restore();
}
