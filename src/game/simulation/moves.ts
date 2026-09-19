import type { FighterId } from '../types.js';

export type AttackLevel = 'mid' | 'low' | 'overhead';

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
  totalFrames: number;
  hitbox?: HitboxSpec;
  cancelStart?: number;
  cancelEnd?: number;
  nextAttack?: string;
  spawnProjectileFrame?: number;
  chillFrames?: number;
  ultimate?: boolean;
}

const moves: Record<FighterId, Record<string, MoveDefinition>> = {
  chameleon: {
    claw1: {
      id: 'claw1', totalFrames: 20, cancelStart: 10, cancelEnd: 15, nextAttack: 'claw2',
      hitbox: { start: 5, end: 7, offsetX: 24, width: 62, bottom: 28, top: 92, damage: 44, chipDamage: 3, hitstun: 11, blockstun: 8, knockback: 3.0, hitstop: 4, level: 'mid', strong: false, guardDamage: 9 },
    },
    claw2: {
      id: 'claw2', totalFrames: 24,
      hitbox: { start: 6, end: 9, offsetX: 28, width: 76, bottom: 34, top: 100, damage: 58, chipDamage: 4, hitstun: 14, blockstun: 9, knockback: 4.5, hitstop: 5, level: 'mid', strong: true, guardDamage: 15 },
    },
    tongueStraight: {
      id: 'tongueStraight', totalFrames: 30,
      hitbox: { start: 9, end: 12, offsetX: 34, width: 340, bottom: 50, top: 95, damage: 92, chipDamage: 8, hitstun: 18, blockstun: 12, knockback: 7.4, hitstop: 6, level: 'mid', strong: true, guardDamage: 24 },
    },
    tongueLow: {
      id: 'tongueLow', totalFrames: 38,
      hitbox: { start: 10, end: 13, offsetX: 35, width: 315, bottom: 10, top: 42, damage: 76, chipDamage: 7, hitstun: 17, blockstun: 12, knockback: 6.2, hitstop: 5, level: 'low', strong: true, guardDamage: 22 },
    },
    coletazo: {
      id: 'coletazo', totalFrames: 36,
      hitbox: { start: 7, end: 11, offsetX: 18, width: 142, bottom: 24, top: 104, damage: 54, chipDamage: 4, hitstun: 15, blockstun: 10, knockback: 13.0, hitstop: 5, level: 'mid', strong: true, guardDamage: 16 },
    },
    ultimateCamaleoni: {
      id: 'ultimateCamaleoni', totalFrames: 72, ultimate: true,
    },
    airClaw: {
      id: 'airClaw', totalFrames: 22,
      hitbox: { start: 4, end: 9, offsetX: 20, width: 72, bottom: -38, top: 42, damage: 62, chipDamage: 4, hitstun: 14, blockstun: 9, knockback: 5.2, hitstop: 5, level: 'overhead', strong: true, guardDamage: 16 },
    },
  },
  supernariz: {
    nose1: {
      id: 'nose1', totalFrames: 18, cancelStart: 10, cancelEnd: 14, nextAttack: 'nose2',
      hitbox: { start: 4, end: 6, offsetX: 28, width: 60, bottom: 34, top: 106, damage: 42, chipDamage: 3, hitstun: 9, blockstun: 7, knockback: 2.5, hitstop: 3, level: 'mid', strong: false, guardDamage: 9 },
    },
    nose2: {
      id: 'nose2', totalFrames: 19, cancelStart: 10, cancelEnd: 14, nextAttack: 'nose3',
      hitbox: { start: 4, end: 7, offsetX: 32, width: 76, bottom: 28, top: 112, damage: 49, chipDamage: 3, hitstun: 10, blockstun: 8, knockback: 3.1, hitstop: 4, level: 'mid', strong: false, guardDamage: 9 },
    },
    nose3: {
      id: 'nose3', totalFrames: 26,
      hitbox: { start: 6, end: 9, offsetX: 36, width: 98, bottom: 38, top: 118, damage: 74, chipDamage: 5, hitstun: 16, blockstun: 11, knockback: 7.2, hitstop: 6, level: 'mid', strong: true, guardDamage: 18 },
    },
    chorizoThrow: {
      id: 'chorizoThrow', totalFrames: 29, spawnProjectileFrame: 8,
    },
    tramontana: {
      id: 'tramontana', totalFrames: 34, chillFrames: 90,
      hitbox: { start: 8, end: 14, offsetX: 36, width: 150, bottom: 24, top: 112, damage: 38, chipDamage: 4, hitstun: 19, blockstun: 12, knockback: 7.0, hitstop: 4, level: 'mid', strong: true, guardDamage: 20 },
    },
    ultimateSupernariz: {
      id: 'ultimateSupernariz', totalFrames: 82, ultimate: true,
    },
    airNose: {
      id: 'airNose', totalFrames: 24,
      hitbox: { start: 5, end: 10, offsetX: 30, width: 96, bottom: -44, top: 48, damage: 70, chipDamage: 5, hitstun: 15, blockstun: 10, knockback: 6.4, hitstop: 5, level: 'overhead', strong: true, guardDamage: 16 },
    },
  },
};

export function getMoveDefinition(fighter: FighterId, moveId: string): MoveDefinition {
  const move = moves[fighter][moveId];
  if (!move) throw new Error(`Unknown move ${fighter}:${moveId}`);
  return move;
}

export function getAttackStart(fighter: FighterId): MoveDefinition {
  return getMoveDefinition(fighter, fighter === 'chameleon' ? 'claw1' : 'nose1');
}

export function getSpecialMove(fighter: FighterId, down: boolean, close = false): MoveDefinition {
  if (fighter === 'chameleon') {
    if (down) return getMoveDefinition(fighter, 'tongueLow');
    return getMoveDefinition(fighter, close ? 'coletazo' : 'tongueStraight');
  }
  return getMoveDefinition(fighter, down || close ? 'tramontana' : 'chorizoThrow');
}

export function getCloseSpecialMove(fighter: FighterId): MoveDefinition {
  return getMoveDefinition(fighter, fighter === 'chameleon' ? 'coletazo' : 'tramontana');
}

export function getUltimateMove(fighter: FighterId): MoveDefinition {
  return getMoveDefinition(fighter, fighter === 'chameleon' ? 'ultimateCamaleoni' : 'ultimateSupernariz');
}

export function getAirAttack(fighter: FighterId): MoveDefinition {
  return getMoveDefinition(fighter, fighter === 'chameleon' ? 'airClaw' : 'airNose');
}
