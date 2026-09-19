export interface ProjectileDefinition {
  key: string;
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

export const PROJECTILES: Readonly<Record<string, ProjectileDefinition>> = Object.freeze({
  chorizo: {
    key: 'chorizo',
    spawnOffsetX: 68,
    spawnOffsetY: 68,
    speed: 9.2,
    ttl: 150,
    collisionHalfWidth: 22,
    collisionHalfHeight: 0,
    damage: 58,
    chipDamage: 5,
    guardDamage: 14,
    hitstun: 14,
    blockstun: 10,
    knockback: 5,
    blockKnockback: 2.1,
    cornerTransferKnockback: 6,
    hitstop: 4,
    cooldown: 120,
    strong: false,
  },
});
