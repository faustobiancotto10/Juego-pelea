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
  archetype: CpuArchetype;
}

export interface FighterKit {
  standing: string;
  low: string;
  air: string;
  rangedSpecial: string;
  closeSpecial: string;
  ultimate: string;
  cpu: CpuProfile;
}

export const FIGHTER_KITS: Readonly<Record<RegisteredFighterId, FighterKit>> = Object.freeze({
  chameleon: {
    standing: 'claw1',
    low: 'clawLow',
    air: 'airClaw',
    rangedSpecial: 'tongueStraight',
    closeSpecial: 'coletazo',
    ultimate: 'ultimateCamaleoni',
    cpu: {
      preferredRange: [240, 330],
      pressureRange: 105,
      reactionTicks: 12,
      decisionTicks: 8,
      commitmentTicks: [12, 18],
      missChance: 0.25,
      confirmChance: 0.85,
      archetype: 'control',
    },
  },
  supernariz: {
    standing: 'nose1',
    low: 'noseLow',
    air: 'airNose',
    rangedSpecial: 'chorizoThrow',
    closeSpecial: 'tramontana',
    ultimate: 'ultimateSupernariz',
    cpu: {
      preferredRange: [135, 235],
      pressureRange: 118,
      reactionTicks: 12,
      decisionTicks: 8,
      commitmentTicks: [12, 20],
      missChance: 0.25,
      confirmChance: 0.75,
      archetype: 'pressure',
    },
  },
});
