import type { FighterIndex, FighterSnapshot } from '../../types.js';
import type { ResolvedSpriteAnimation } from './AnimationResolver.js';

interface SpriteTimelineState {
  key: string;
  entryCombatTick: number;
  lastCombatTick: number;
  remainingCounter: number | null;
}

const ENTRY_TIMED_KEYS = new Set([
  'knockdown',
  'captured',
  'guard-break',
  'hurt',
  'jump-startup',
  'land',
]);

function stableTick(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.trunc(value));
}

function remainingCounterFor(
  fighter: FighterSnapshot,
  key: string,
): number | null {
  if (key === 'guard-break') return stableTick(fighter.guardBreakFrames);
  if (key === 'hurt') return stableTick(fighter.stunFrames);
  if (key === 'jump-startup') return stableTick(fighter.jumpStartupFrames);
  if (key === 'land') return stableTick(fighter.landingRecoveryFrames);
  return null;
}

export class SpriteAnimationTimeline {
  private readonly states: [SpriteTimelineState | null, SpriteTimelineState | null] = [
    null,
    null,
  ];

  reset(): void {
    this.states[0] = null;
    this.states[1] = null;
  }

  sample(
    slot: FighterIndex,
    fighter: FighterSnapshot,
    resolved: ResolvedSpriteAnimation,
    combatTick: number,
  ): ResolvedSpriteAnimation {
    const now = stableTick(combatTick);
    const entryTimed = ENTRY_TIMED_KEYS.has(resolved.key);
    const remainingCounter = entryTimed
      ? remainingCounterFor(fighter, resolved.key)
      : null;
    const previous = this.states[slot];

    const restartedReaction = entryTimed
      && remainingCounter !== null
      && previous?.remainingCounter !== null
      && previous?.remainingCounter !== undefined
      && remainingCounter > previous.remainingCounter;

    const restart = previous === null
      || previous.key !== resolved.key
      || now < previous.lastCombatTick
      || restartedReaction;

    const entryCombatTick = restart ? now : previous.entryCombatTick;

    this.states[slot] = {
      key: resolved.key,
      entryCombatTick,
      lastCombatTick: now,
      remainingCounter,
    };

    if (!entryTimed) return resolved;

    return {
      key: resolved.key,
      tick: Math.max(0, now - entryCombatTick),
    };
  }
}
