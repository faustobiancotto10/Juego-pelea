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

export interface AttackPresentationTiming {
  anticipation: number;
  strike: number;
  followThrough: number;
  recovery: number;
  trail: number;
  actionPhase: number;
}

const ZERO_ATTACK_TIMING: AttackPresentationTiming = Object.freeze({
  anticipation: 0,
  strike: 0,
  followThrough: 0,
  recovery: 0,
  trail: 0,
  actionPhase: 0,
});

function smoothstep01(value: number): number {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

/**
 * Render-only attack timing envelope derived from the authoritative move frame.
 *
 * Unlike the older fixed moveFrame/14 renderer pulse, this envelope respects
 * each move's authored active window and recovery. It never changes move
 * legality, collision, damage or hit timing; it only tells presentation when
 * to build, strike, follow through and visually settle.
 */
export function getAttackPresentationTiming(
  fighter: FighterSnapshot,
): AttackPresentationTiming {
  if (!fighter.moveId || fighter.ultimatePhase !== 'idle') return ZERO_ATTACK_TIMING;

  const move = getMoveDefinition(fighter.id, fighter.moveId);
  const frame = Math.max(0, fighter.moveFrame);
  const total = Math.max(1, move.totalFrames);
  const hitbox = move.hitbox;

  const strikeStart = hitbox
    ? Math.max(1, hitbox.start)
    : Math.max(1, Math.round(total * 0.40));
  const strikeEnd = hitbox
    ? Math.max(strikeStart, hitbox.end)
    : Math.min(total, strikeStart + Math.max(1, Math.round(total * 0.12)));

  const anticipation = frame < strikeStart
    ? smoothstep01(frame / strikeStart)
    : 0;

  const strikeSpan = Math.max(1, strikeEnd - strikeStart + 1);
  const strikeProgress = clamp01((frame - strikeStart) / strikeSpan);
  const strike = frame >= strikeStart && frame <= strikeEnd
    ? 1 - strikeProgress * 0.18
    : 0;

  const recoverySpan = Math.max(1, total - strikeEnd);
  const recoveryProgress = frame > strikeEnd
    ? clamp01((frame - strikeEnd) / recoverySpan)
    : 0;
  const followThrough = frame > strikeEnd
    ? 1 - smoothstep01(recoveryProgress / 0.48)
    : 0;
  const recovery = smoothstep01(recoveryProgress);

  const actionPhase = frame < strikeStart
    ? 0.5 * clamp01(frame / strikeStart)
    : frame <= strikeEnd
      ? 0.5 + 0.24 * strikeProgress
      : 0.74 + 0.26 * recoveryProgress;

  return {
    anticipation,
    strike,
    followThrough,
    recovery,
    trail: clamp01(anticipation * 0.22 + strike + followThrough * 0.72),
    actionPhase: clamp01(actionPhase),
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
