import type { FighterId } from '../types.js';

export interface FighterDefinition {
  id: FighterId;
  displayName: string;
  fullName: string;
  role: string;
  maxHealth: number;
  walkSpeed: number;
  jumpSpeed: number;
  gravity: number;
  width: number;
  height: number;
  accent: string;
}

export const FIGHTERS: Record<FighterId, FighterDefinition> = {
  chameleon: {
    id: 'chameleon',
    displayName: 'Camaleoni',
    fullName: 'Camaleoni Cagoni',
    role: 'Control de distancia',
    maxHealth: 1000,
    walkSpeed: 4.25,
    jumpSpeed: 12.4,
    gravity: 0.72,
    width: 54,
    height: 118,
    accent: '#7abf43',
  },
  supernariz: {
    id: 'supernariz',
    displayName: 'Supernariz',
    fullName: 'Supernariz',
    role: 'Rushdown / combos',
    maxHealth: 1000,
    walkSpeed: 4.8,
    jumpSpeed: 12.1,
    gravity: 0.74,
    width: 56,
    height: 122,
    accent: '#2f6bd7',
  },
};

export const FIGHTER_IDS = Object.keys(FIGHTERS) as FighterId[];
