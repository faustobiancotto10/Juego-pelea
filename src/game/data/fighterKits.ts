import type { RegisteredFighterId } from '../types.js';

export type CpuArchetype = 'pressure' | 'control';

export interface CpuProfile {
  preferredRange: readonly [number, number];
  pressureRange: number;
  reactionTicks: number;
  decisionTicks: number;
  commitmentTicks: readonly [number, number];
  missChance: number;
  confirmChance: number;
  /** Temporary V0.4 behavior family. R5 replaces this with delayed seeded policy. */
  archetype: CpuArchetype;
}

export interface FighterKit {
  standing: string;
  /** R2 permits an absent grounded low; R3 makes this mandatory. */
  low?: string;
  air: string;
  rangedSpecial: string;
  closeSpecial: string;
  ultimate: string;
  /** Temporary R2 adapter preserving V0.4 bindings until R3. */
  legacyDownSpecial?: string;
  /** Temporary R2 adapter preserving V0.4 bindings until R3. */
  legacyUpSpecial?: string;
  cpu: CpuProfile;
}

export const FIGHTER_KITS: Readonly<Record<RegisteredFighterId, FighterKit>> = Object.freeze({
  chameleon: {
    standing: 'claw1',
    air: 'airClaw',
    rangedSpecial: 'tongueStraight',
    closeSpecial: 'coletazo',
    ultimate: 'ultimateCamaleoni',
    legacyDownSpecial: 'tongueLow',
    legacyUpSpecial: 'coletazo',
    cpu: {
      preferredRange: [165, 390],
      pressureRange: 92,
      reactionTicks: 7,
      decisionTicks: 7,
      commitmentTicks: [12, 18],
      missChance: 0.2,
      confirmChance: 1,
      archetype: 'control',
    },
  },
  supernariz: {
    standing: 'nose1',
    air: 'airNose',
    rangedSpecial: 'chorizoThrow',
    closeSpecial: 'tramontana',
    ultimate: 'ultimateSupernariz',
    legacyDownSpecial: 'tramontana',
    cpu: {
      preferredRange: [135, 235],
      pressureRange: 118,
      reactionTicks: 8,
      decisionTicks: 11,
      commitmentTicks: [14, 18],
      missChance: 0.2,
      confirmChance: 0.75,
      archetype: 'pressure',
    },
  },
});
