import { DEFAULT_CHARACTER_COMPOSITION } from './characterContent.js';

export type ProjectileMovementKind = 'linear' | 'returnToOwner';

export interface ProjectileContactDefinition {
  damage: number;
  chipDamage: number;
  guardDamage: number;
  hitstun: number;
  blockstun: number;
  knockback: number;
  blockKnockback: number;
  hitstop: number;
  strong: boolean;
}

export interface ReturningProjectileConfig {
  outboundTicks: number;
  turnTicks: number;
  returnSpeed: number;
  maxReturnTicks: number;
  catchRadius: number;
  rearmTicks: number;
  minimumTicksBetweenLegHits: number;
  returnHit: ProjectileContactDefinition;
}

export interface ProjectileDefinition extends ProjectileContactDefinition {
  key: string;
  /** Legacy injected definitions without kind are interpreted as linear. */
  kind?: ProjectileMovementKind;
  /** Explicit render routing key for Character Packages. Legacy injected sources may omit until migrated. */
  visualKey?: string;
  /** Returning projectiles use this to cancel on a clean owner consequence. */
  cancelOnOwnerHit?: boolean;
  returnConfig?: ReturningProjectileConfig;
  spawnOffsetX: number;
  spawnOffsetY: number;
  speed: number;
  ttl: number;
  collisionHalfWidth: number;
  collisionHalfHeight: number;
  cornerTransferKnockback: number;
  cooldown: number;
}

export const PROJECTILES: Readonly<Record<string, ProjectileDefinition>> =
  DEFAULT_CHARACTER_COMPOSITION.projectiles;
