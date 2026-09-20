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

export interface MoveDefinition {
  id: string;
  category: MoveCategory;
  bindingRole: BindingRole;
  totalFrames: number;
  hitbox?: HitboxSpec;
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

export const MOVE_SETS: Readonly<Record<RegisteredFighterId, Readonly<Record<string, MoveDefinition>>>> = {
  chameleon: {
    claw1: {
      id: 'claw1', category: 'normal', bindingRole: 'standing', totalFrames: 19, cpuThreatRange: 190, cpuReactionFrame: 8, cancelStart: 9, cancelEnd: 12, nextAttack: 'claw2',
      hitbox: { start: 5, end: 7, offsetX: 24, width: 70, bottom: 28, top: 92, damage: 46, chipDamage: 3, hitstun: 16, blockstun: 8, knockback: 3.2, hitstop: 4, level: 'mid', strong: false, guardDamage: 9 },
    },
    clawLow: {
      id: 'clawLow', category: 'normal', bindingRole: 'low', totalFrames: 25, cpuThreatRange: 150, cpuReactionFrame: 8,
      hitbox: { start: 7, end: 9, offsetX: 22, width: 65, bottom: 8, top: 35, damage: 36, chipDamage: 2, hitstun: 13, blockstun: 8, knockback: 3.5, hitstop: 4, level: 'low', strong: false, guardDamage: 10 },
    },
    claw2: {
      id: 'claw2', category: 'normal', bindingRole: 'chain', totalFrames: 22, cpuThreatRange: 190, cpuReactionFrame: 8,
      hitbox: { start: 5, end: 8, offsetX: 28, width: 82, bottom: 34, top: 100, damage: 60, chipDamage: 4, hitstun: 15, blockstun: 9, knockback: 5.0, hitstop: 5, level: 'mid', strong: true, guardDamage: 15 },
    },
    tongueStraight: {
      id: 'tongueStraight', category: 'special', bindingRole: 'rangedSpecial', totalFrames: 38, cpuThreatRange: 405, cpuReactionFrame: 7,
      hitbox: { start: 12, end: 14, offsetX: 34, width: 340, bottom: 50, top: 95, damage: 80, chipDamage: 4, hitstun: 18, blockstun: 12, knockback: 7.4, hitstop: 6, level: 'mid', strong: true, guardDamage: 14 },
    },
    coletazo: {
      id: 'coletazo', category: 'special', bindingRole: 'closeSpecial', totalFrames: 31, cpuThreatRange: 190, cpuReactionFrame: 8,
      hitbox: { start: 6, end: 10, offsetX: 18, width: 146, bottom: 24, top: 104, damage: 52, chipDamage: 4, hitstun: 14, blockstun: 9, knockback: 13.5, hitstop: 5, level: 'mid', strong: true, guardDamage: 15 },
    },
    ultimateCamaleoni: {
      id: 'ultimateCamaleoni', category: 'ultimate', bindingRole: 'ultimate', totalFrames: 72, ultimate: true, ultimateKey: 'camaleoniUltimate',
    },
    airClaw: {
      id: 'airClaw', category: 'normal', bindingRole: 'air', totalFrames: 22,
      hitbox: { start: 4, end: 9, offsetX: 20, width: 72, bottom: -38, top: 42, damage: 62, chipDamage: 4, hitstun: 14, blockstun: 9, knockback: 5.2, hitstop: 5, level: 'overhead', strong: true, guardDamage: 16 },
    },
  },
  supernariz: {
    nose1: {
      id: 'nose1', category: 'normal', bindingRole: 'standing', totalFrames: 18, cpuThreatRange: 190, cpuReactionFrame: 8, cancelStart: 8, cancelEnd: 11, nextAttack: 'nose2',
      hitbox: { start: 4, end: 6, offsetX: 28, width: 60, bottom: 34, top: 106, damage: 42, chipDamage: 3, hitstun: 14, blockstun: 7, knockback: 2.5, hitstop: 3, level: 'mid', strong: false, guardDamage: 9 },
    },
    noseLow: {
      id: 'noseLow', category: 'normal', bindingRole: 'low', totalFrames: 25, cpuThreatRange: 150, cpuReactionFrame: 8,
      hitbox: { start: 7, end: 9, offsetX: 22, width: 65, bottom: 8, top: 35, damage: 36, chipDamage: 2, hitstun: 13, blockstun: 8, knockback: 3.5, hitstop: 4, level: 'low', strong: false, guardDamage: 10 },
    },
    nose2: {
      id: 'nose2', category: 'normal', bindingRole: 'chain', totalFrames: 19, cpuThreatRange: 190, cpuReactionFrame: 8, cancelStart: 8, cancelEnd: 11, nextAttack: 'nose3',
      hitbox: { start: 4, end: 7, offsetX: 32, width: 76, bottom: 28, top: 112, damage: 49, chipDamage: 3, hitstun: 16, blockstun: 8, knockback: 3.1, hitstop: 4, level: 'mid', strong: false, guardDamage: 9 },
    },
    nose3: {
      id: 'nose3', category: 'normal', bindingRole: 'chain', totalFrames: 26, cpuThreatRange: 190, cpuReactionFrame: 8,
      hitbox: { start: 6, end: 9, offsetX: 36, width: 98, bottom: 38, top: 118, damage: 74, chipDamage: 5, hitstun: 16, blockstun: 11, knockback: 7.2, hitstop: 6, level: 'mid', strong: true, guardDamage: 18 },
    },
    chorizoThrow: {
      id: 'chorizoThrow', category: 'projectile', bindingRole: 'rangedSpecial', totalFrames: 36, spawnProjectileFrame: 12, projectileKey: 'chorizo',
    },
    tramontana: {
      id: 'tramontana', category: 'special', bindingRole: 'closeSpecial', totalFrames: 30, chillFrames: 60, cpuThreatRange: 190, cpuReactionFrame: 8,
      hitbox: { start: 8, end: 11, offsetX: 36, width: 150, bottom: 24, top: 112, damage: 38, chipDamage: 4, hitstun: 22, blockstun: 10, knockback: 4.0, hitstop: 4, level: 'mid', strong: true, guardDamage: 16 },
    },
    ultimateSupernariz: {
      id: 'ultimateSupernariz', category: 'ultimate', bindingRole: 'ultimate', totalFrames: 82, ultimate: true, ultimateKey: 'supernarizUltimate',
    },
    airNose: {
      id: 'airNose', category: 'normal', bindingRole: 'air', totalFrames: 24,
      hitbox: { start: 5, end: 10, offsetX: 30, width: 96, bottom: -44, top: 48, damage: 70, chipDamage: 5, hitstun: 15, blockstun: 10, knockback: 6.4, hitstop: 5, level: 'overhead', strong: true, guardDamage: 16 },
    },
  },
};

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
