import type { FighterSnapshot } from '../types.js';
import { drawChameleon } from './ChameleonRig.js';
import { drawSupernariz } from './SupernarizRig.js';

export function drawFighter(ctx: CanvasRenderingContext2D, fighter: FighterSnapshot, timeSeconds: number): void {
  if (fighter.id === 'chameleon') drawChameleon(ctx, fighter, timeSeconds);
  else drawSupernariz(ctx, fighter, timeSeconds);
}
