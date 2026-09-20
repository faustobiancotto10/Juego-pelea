import { DEFAULT_CHARACTER_COMPOSITION } from '../data/characterContent.js';
import { FIGHTER_KITS } from '../data/fighterKits.js';
import type { RegisteredFighterId } from '../types.js';

export type AttackLevel = 'mid' | 'low' | 'overhead';
export type MoveCategory = 'normal' | 'special' | 'projectile' | 'ultimate';
export type BindingRole = 'standing' | 'low' | 'chain' | 'air' | 'rangedSpecial' | 'closeSpecial' | 'ultimate';

export interface HitboxSpec {
  start: number;
  end: number;
  offsetX: number;
  width: number;
  bottom: number;
  top: number;
  damage: number;
  chipDamage: number;
  hitstun: number;
  blockstun: number;
  knockback: number;
  hitstop: number;
  level: AttackLevel;
  strong: boolean;
  guardDamage: number;
}

export interface MoveHitWindow extends HitboxSpec {
  hitId: string;
  blockKnockback?: number;
}

export interface MoveDefinition {
  id: string;
  category: MoveCategory;
  bindingRole: BindingRole;
  totalFrames: number;
  hitbox?: HitboxSpec;
  hits?: readonly MoveHitWindow[];
  cancelStart?: number;
  cancelEnd?: number;
  nextAttack?: string;
  spawnProjectileFrame?: number;
  projectileKey?: string;
  ultimateKey?: string;
  chillFrames?: number;
  ultimate?: boolean;
  cpuThreatRange?: number;
  cpuReactionFrame?: number;
}

export const MOVE_SETS: Readonly<Record<RegisteredFighterId, Readonly<Record<string, MoveDefinition>>>> =
  DEFAULT_CHARACTER_COMPOSITION.moves;

export function getMoveHitWindows(move: MoveDefinition): readonly MoveHitWindow[] {
  if (move.hits) return move.hits;
  if (move.hitbox) return [{ ...move.hitbox, hitId: 'single' }];
  return [];
}

export function getMoveDefinition(fighter: RegisteredFighterId, moveId: string): MoveDefinition {
  const moveSet = MOVE_SETS[fighter];
  if (!moveSet) throw new Error(`Unknown move set ${fighter}`);
  const move = moveSet[moveId];
  if (!move) throw new Error(`Unknown move ${fighter}:${moveId}`);
  return move;
}

function kitFor(fighter: RegisteredFighterId) {
  const kit = FIGHTER_KITS[fighter];
  if (!kit) throw new Error(`Unknown fighter kit ${fighter}`);
  return kit;
}

export function getAttackStart(fighter: RegisteredFighterId): MoveDefinition {
  return getMoveDefinition(fighter, kitFor(fighter).standing);
}

export function getSpecialMove(fighter: RegisteredFighterId, down: boolean, close = false): MoveDefinition {
  const kit = kitFor(fighter);
  return getMoveDefinition(fighter, close || down ? kit.closeSpecial : kit.rangedSpecial);
}

export function getCloseSpecialMove(fighter: RegisteredFighterId): MoveDefinition {
  return getMoveDefinition(fighter, kitFor(fighter).closeSpecial);
}

export function getUltimateMove(fighter: RegisteredFighterId): MoveDefinition {
  return getMoveDefinition(fighter, kitFor(fighter).ultimate);
}

export function getAirAttack(fighter: RegisteredFighterId): MoveDefinition {
  return getMoveDefinition(fighter, kitFor(fighter).air);
}
