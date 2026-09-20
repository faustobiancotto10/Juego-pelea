import { DEFAULT_CHARACTER_COMPOSITION } from './characterContent.js';

export interface ProjectileDefinition {
  key: string;
  /** Explicit render routing key for Character Packages. Legacy injected sources may omit until migrated. */
  visualKey?: string;
  spawnOffsetX: number;
  spawnOffsetY: number;
  speed: number;
  ttl: number;
  collisionHalfWidth: number;
  collisionHalfHeight: number;
  damage: number;
  chipDamage: number;
  guardDamage: number;
  hitstun: number;
  blockstun: number;
  knockback: number;
  blockKnockback: number;
  cornerTransferKnockback: number;
  hitstop: number;
  cooldown: number;
  strong: boolean;
}

export const PROJECTILES: Readonly<Record<string, ProjectileDefinition>> =
  DEFAULT_CHARACTER_COMPOSITION.projectiles;
