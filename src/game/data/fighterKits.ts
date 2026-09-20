import { DEFAULT_CHARACTER_COMPOSITION } from './characterContent.js';
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

export const FIGHTER_KITS: Readonly<Record<RegisteredFighterId, FighterKit>> =
  DEFAULT_CHARACTER_COMPOSITION.kits;
