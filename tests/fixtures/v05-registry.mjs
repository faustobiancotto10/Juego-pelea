import { createCombatRegistry, DEFAULT_COMBAT_REGISTRY } from '../../dist/game/data/combatRegistry.js';
import { FIGHTERS } from '../../dist/game/data/fighters.js';
import { FIGHTER_KITS } from '../../dist/game/data/fighterKits.js';
import { PROJECTILES } from '../../dist/game/data/projectiles.js';
import { ULTIMATES } from '../../dist/game/data/ultimates.js';
import { MOVE_SETS } from '../../dist/game/simulation/moves.js';

export const fixtureId = 'fixture-sparring';

const fixtureMoves = Object.freeze({
  fixtureJab: {
    id: 'fixtureJab',
    category: 'normal',
    bindingRole: 'standing',
    totalFrames: 16,
    hitbox: {
      start: 3, end: 5, offsetX: 20, width: 74, bottom: 26, top: 94,
      damage: 33, chipDamage: 2, hitstun: 10, blockstun: 7,
      knockback: 3.3, hitstop: 3, level: 'mid', strong: false, guardDamage: 8,
    },
  },
  fixtureAir: {
    id: 'fixtureAir',
    category: 'normal',
    bindingRole: 'air',
    totalFrames: 20,
    hitbox: {
      start: 4, end: 7, offsetX: 18, width: 70, bottom: -36, top: 44,
      damage: 41, chipDamage: 3, hitstun: 12, blockstun: 8,
      knockback: 4.2, hitstop: 4, level: 'overhead', strong: true, guardDamage: 11,
    },
  },
  fixtureShot: {
    id: 'fixtureShot',
    category: 'projectile',
    bindingRole: 'rangedSpecial',
    totalFrames: 20,
    spawnProjectileFrame: 3,
    projectileKey: 'fixtureBolt',
  },
  fixtureClose: {
    id: 'fixtureClose',
    category: 'special',
    bindingRole: 'closeSpecial',
    totalFrames: 24,
    cpuThreatRange: 190,
    cpuReactionFrame: 8,
    hitbox: {
      start: 6, end: 9, offsetX: 26, width: 96, bottom: 24, top: 102,
      damage: 45, chipDamage: 3, hitstun: 13, blockstun: 9,
      knockback: 6, hitstop: 4, level: 'mid', strong: true, guardDamage: 13,
    },
  },
  fixtureUltimate: {
    id: 'fixtureUltimate',
    category: 'ultimate',
    bindingRole: 'ultimate',
    totalFrames: 48,
    ultimate: true,
    ultimateKey: 'fixtureDashUltimate',
  },
});

const fixtureFighter = Object.freeze({
  id: fixtureId,
  displayName: 'Fixture',
  fullName: 'Fixture Sparring',
  role: 'Test-only',
  maxHealth: 777,
  walkSpeed: 3.6,
  jumpSpeed: 11.7,
  gravity: 0.7,
  width: 50,
  height: 116,
  accent: '#777777',
});

const fixtureKit = Object.freeze({
  standing: 'fixtureJab',
  air: 'fixtureAir',
  rangedSpecial: 'fixtureShot',
  closeSpecial: 'fixtureClose',
  ultimate: 'fixtureUltimate',
  legacyDownSpecial: 'fixtureClose',
  cpu: {
    preferredRange: [130, 230],
    pressureRange: 105,
    reactionTicks: 8,
    decisionTicks: 9,
    commitmentTicks: [12, 17],
    missChance: 0.2,
    confirmChance: 0.75,
    archetype: 'pressure',
  },
});

const fixtureProjectile = Object.freeze({
  key: 'fixtureBolt',
  spawnOffsetX: 52,
  spawnOffsetY: 64,
  speed: 6.5,
  ttl: 90,
  collisionHalfWidth: 18,
  collisionHalfHeight: 0,
  damage: 31,
  chipDamage: 4,
  guardDamage: 9,
  hitstun: 11,
  blockstun: 8,
  knockback: 4.4,
  blockKnockback: 1.8,
  cornerTransferKnockback: 5,
  hitstop: 3,
  cooldown: 47,
  strong: false,
});

const fixtureUltimate = Object.freeze({
  key: 'fixtureDashUltimate',
  kind: 'dashCapture',
  startupFrames: 5,
  captureFrames: 7,
  recoveryFrames: 12,
  captureReach: 124,
  captureVertical: 80,
  dashSpeed: 15,
  sequenceFrames: 10,
  sequenceOffsetX: 58,
  sequenceHits: [{ frame: 4, damage: 77, knockback: 8 }],
  releaseKnockback: 8,
  visualKey: 'fixture',
});

export const fixtureRegistry = createCombatRegistry({
  fighters: Object.freeze({ ...FIGHTERS, [fixtureId]: fixtureFighter }),
  kits: Object.freeze({ ...FIGHTER_KITS, [fixtureId]: fixtureKit }),
  moves: Object.freeze({ ...MOVE_SETS, [fixtureId]: fixtureMoves }),
  projectiles: Object.freeze({ ...PROJECTILES, fixtureBolt: fixtureProjectile }),
  ultimates: Object.freeze({ ...ULTIMATES, fixtureDashUltimate: fixtureUltimate }),
  playableIds: DEFAULT_COMBAT_REGISTRY.playableIds,
});
