import type { FighterSnapshot } from '../types.js';
import { getMoveDefinition } from '../simulation/moves.js';
import { clamp01 } from './drawUtils.js';

export interface MovePresentationPhase {
  startup: number;
  active: number;
  recovery: number;
  contact: number;
}

export interface AirPresentationPose {
  airborne: number;
  ascent: number;
  apex: number;
  descent: number;
  landing: number;
  landingFrame: number;
}

export function getMovePresentationPhase(fighter: FighterSnapshot): MovePresentationPhase {
  if (!fighter.moveId || fighter.ultimatePhase !== 'idle') {
    return { startup: 0, active: 0, recovery: 0, contact: fighter.moveContact === 'none' ? 0 : 1 };
  }

  const move = getMoveDefinition(fighter.id, fighter.moveId);
  const frame = Math.max(0, fighter.moveFrame);
  const hitbox = move.hitbox;

  if (!hitbox) {
    const progress = clamp01(frame / Math.max(1, move.totalFrames));
    return {
      startup: progress < 0.45 ? 1 - progress / 0.45 : 0,
      active: 0,
      recovery: progress >= 0.45 ? (progress - 0.45) / 0.55 : 0,
      contact: fighter.moveContact === 'none' ? 0 : 1,
    };
  }

  const startup = frame < hitbox.start
    ? 1 - clamp01(frame / Math.max(1, hitbox.start))
    : 0;
  const active = frame >= hitbox.start && frame <= hitbox.end
    ? 1
    : frame < hitbox.start
      ? clamp01(frame / Math.max(1, hitbox.start))
      : 0;
  const recovery = frame > hitbox.end
    ? clamp01((frame - hitbox.end) / Math.max(1, move.totalFrames - hitbox.end))
    : 0;

  return {
    startup,
    active,
    recovery,
    contact: fighter.moveContact === 'none' ? 0 : 1,
  };
}

export function getAirPresentationPose(fighter: FighterSnapshot): AirPresentationPose {
  if (fighter.grounded) {
    const landingFrame = Math.max(0, Math.min(4, fighter.landingRecoveryFrames));
    return {
      airborne: 0,
      ascent: 0,
      apex: 0,
      descent: 0,
      landing: landingFrame / 4,
      landingFrame,
    };
  }

  const speed = Math.abs(fighter.vy);
  const apex = clamp01(1 - speed / 4.5);
  return {
    airborne: 1,
    ascent: fighter.vy > 0 ? clamp01(fighter.vy / 13) : 0,
    apex,
    descent: fighter.vy < 0 ? clamp01(-fighter.vy / 13) : 0,
    landing: 0,
    landingFrame: 0,
  };
}
