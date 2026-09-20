import { DEFAULT_CHARACTER_COMPOSITION } from './characterContent.js';
import type { RegisteredFighterId } from '../types.js';

export type CpuArchetype = 'pressure' | 'control';

export interface CpuTactics {
  ultimateRange: readonly [number, number];
  rangedRange: readonly [number, number];
  rangedChance: number;
  closeWeights: Readonly<Record<'standing' | 'low' | 'closeSpecial' | 'jump' | 'retreat', number>>;
  advanceBehindReturningProjectile: number;
  retreatAtPreferredRange: number;
}

export interface CpuProfile {
  preferredRange: readonly [number, number];
  pressureRange: number;
  reactionTicks: number;
  decisionTicks: number;
  commitmentTicks: readonly [number, number];
  missChance: number;
  confirmChance: number;
  archetype: CpuArchetype;
  tactics?: CpuTactics;
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

export const FIGHTER_KITS: Readonly<Record<RegisteredFighterId, FighterKit>> =
  DEFAULT_CHARACTER_COMPOSITION.kits;
