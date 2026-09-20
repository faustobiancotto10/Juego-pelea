import { DEFAULT_CHARACTER_COMPOSITION } from './characterContent.js';
import type { FighterId, RegisteredFighterId } from '../types.js';

export interface FighterDefinition {
  id: RegisteredFighterId;
  displayName: string;
  fullName: string;
  role: string;
  maxHealth: number;
  walkSpeed: number;
  jumpSpeed: number;
  gravity: number;
  width: number;
  height: number;
  /** Simulation-authored head/cap-seat target. Released fighters define this explicitly. */
  captureHead?: {
    standY: number;
    crouchY: number;
    halfWidth: number;
    halfHeight: number;
  };
  accent: string;
}

export const FIGHTERS: Readonly<Record<RegisteredFighterId, FighterDefinition>> =
  DEFAULT_CHARACTER_COMPOSITION.fighters;

export const FIGHTER_IDS: readonly FighterId[] = DEFAULT_CHARACTER_COMPOSITION.playableIds;
