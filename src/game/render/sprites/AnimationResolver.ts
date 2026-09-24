import type { FighterSnapshot } from '../../types.js';
import { getMoveDefinition } from '../../simulation/moves.js';

export interface ResolvedSpriteAnimation {
  key: string;
  tick: number;
}

function stableTick(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.trunc(value));
}

export function resolveSpriteAnimation(
  fighter: FighterSnapshot,
  presentationTick = 0,
): ResolvedSpriteAnimation {
  const ambientTick = stableTick(presentationTick);

  if (fighter.health <= 0) {
    return { key: 'knockdown', tick: ambientTick };
  }

  if (fighter.capturedBy !== null) {
    return { key: 'captured', tick: ambientTick };
  }

  if (fighter.guardBreakFrames > 0) {
    return { key: 'guard-break', tick: stableTick(fighter.guardBreakFrames) };
  }

  if (fighter.stunFrames > 0) {
    return { key: 'hurt', tick: stableTick(fighter.stunFrames) };
  }

  if (fighter.ultimatePhase !== 'idle') {
    if (!fighter.moveId) {
      throw new Error(`Sprite animation resolver: fighter "${fighter.id}" is in Ultimate phase "${fighter.ultimatePhase}" without moveId`);
    }
    getMoveDefinition(fighter.id, fighter.moveId);
    return {
      key: `ultimate:${fighter.moveId}:${fighter.ultimatePhase}`,
      tick: stableTick(fighter.ultimatePhaseFrame),
    };
  }

  if (fighter.moveId) {
    const move = getMoveDefinition(fighter.id, fighter.moveId);
    return { key: `move:${move.id}`, tick: stableTick(fighter.moveFrame) };
  }

  if (fighter.blocking || fighter.blockstunFrames > 0) {
    return {
      key: fighter.crouching ? 'block-crouch' : 'block',
      tick: ambientTick,
    };
  }

  if (fighter.dashKind !== null) {
    return {
      key: fighter.dashKind === 'forward' ? 'dash-forward' : 'dash-back',
      tick: stableTick(fighter.dashFrame),
    };
  }

  if (fighter.jumpStartupFrames > 0) {
    return { key: 'jump-startup', tick: ambientTick };
  }

  if (!fighter.grounded) {
    const key = fighter.vy > 0.75
      ? 'jump-ascent'
      : fighter.vy < -0.75
        ? 'jump-descent'
        : 'jump-apex';
    return { key, tick: stableTick(fighter.airborneTicks) };
  }

  if (fighter.landingRecoveryFrames > 0) {
    return { key: 'land', tick: stableTick(fighter.landingRecoveryFrames) };
  }

  if (fighter.crouching) {
    return { key: 'crouch', tick: ambientTick };
  }

  if (Math.abs(fighter.vx) > 0.01) {
    return {
      key: fighter.facing * fighter.vx > 0 ? 'walk-forward' : 'walk-back',
      tick: ambientTick,
    };
  }

  return { key: 'idle', tick: ambientTick };
}
