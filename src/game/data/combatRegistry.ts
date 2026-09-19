import { FIGHTERS, FIGHTER_IDS, type FighterDefinition } from './fighters.js';
import { FIGHTER_KITS, type FighterKit } from './fighterKits.js';
import { PROJECTILES, type ProjectileDefinition } from './projectiles.js';
import { ULTIMATES, type UltimateDefinition } from './ultimates.js';
import { MOVE_SETS, type MoveDefinition } from '../simulation/moves.js';
import type { FighterId, RegisteredFighterId } from '../types.js';

export interface CombatRegistry {
  readonly playableIds: readonly FighterId[];
  getFighter(id: RegisteredFighterId): FighterDefinition;
  getKit(id: RegisteredFighterId): FighterKit;
  getMove(id: RegisteredFighterId, moveId: string): MoveDefinition;
  getProjectile(key: string): ProjectileDefinition;
  getUltimate(key: string): UltimateDefinition;
}

export interface CombatRegistrySource {
  fighters: Readonly<Record<RegisteredFighterId, FighterDefinition>>;
  kits: Readonly<Record<RegisteredFighterId, FighterKit>>;
  moves: Readonly<Record<RegisteredFighterId, Readonly<Record<string, MoveDefinition>>>>;
  projectiles: Readonly<Record<string, ProjectileDefinition>>;
  ultimates: Readonly<Record<string, UltimateDefinition>>;
  playableIds: readonly FighterId[];
}

function requireEntry<T>(map: Readonly<Record<string, T>>, key: string, label: string): T {
  const value = map[key];
  if (!value) throw new Error(`Unknown ${label} ${key}`);
  return value;
}

function validateFighter(source: CombatRegistrySource, id: RegisteredFighterId): void {
  requireEntry(source.fighters, id, 'fighter');
  const kit = requireEntry(source.kits, id, 'fighter kit');
  const moveSet = requireEntry(source.moves, id, 'move set');

  const requiredMoves = [
    kit.standing,
    kit.air,
    kit.rangedSpecial,
    kit.closeSpecial,
    kit.ultimate,
    kit.low,
    kit.legacyDownSpecial,
    kit.legacyUpSpecial,
  ].filter((value): value is string => Boolean(value));

  for (const moveId of requiredMoves) requireEntry(moveSet, moveId, `move ${id}:`);

  for (const move of Object.values(moveSet)) {
    if (move.projectileKey) requireEntry(source.projectiles, move.projectileKey, 'projectile');
    if (move.ultimateKey) requireEntry(source.ultimates, move.ultimateKey, 'ultimate');
    if (move.nextAttack) requireEntry(moveSet, move.nextAttack, `move ${id}:`);
  }
}

export function createCombatRegistry(source: CombatRegistrySource): CombatRegistry {
  const fighterIds = Object.keys(source.fighters);
  for (const id of fighterIds) validateFighter(source, id);
  for (const id of Object.keys(source.kits)) {
    if (!source.fighters[id]) throw new Error(`Unknown fighter for kit ${id}`);
  }
  for (const id of Object.keys(source.moves)) {
    if (!source.fighters[id]) throw new Error(`Unknown fighter for move set ${id}`);
  }
  for (const id of source.playableIds) requireEntry(source.fighters, id, 'playable fighter');

  const playableIds = Object.freeze([...source.playableIds]);

  return Object.freeze({
    playableIds,
    getFighter(id: RegisteredFighterId): FighterDefinition {
      return requireEntry(source.fighters, id, 'fighter');
    },
    getKit(id: RegisteredFighterId): FighterKit {
      return requireEntry(source.kits, id, 'fighter kit');
    },
    getMove(id: RegisteredFighterId, moveId: string): MoveDefinition {
      const moveSet = requireEntry(source.moves, id, 'move set');
      return requireEntry(moveSet, moveId, `move ${id}:`);
    },
    getProjectile(key: string): ProjectileDefinition {
      return requireEntry(source.projectiles, key, 'projectile');
    },
    getUltimate(key: string): UltimateDefinition {
      return requireEntry(source.ultimates, key, 'ultimate');
    },
  });
}

export const DEFAULT_COMBAT_REGISTRY: CombatRegistry = createCombatRegistry({
  fighters: FIGHTERS,
  kits: FIGHTER_KITS,
  moves: MOVE_SETS,
  projectiles: PROJECTILES,
  ultimates: ULTIMATES,
  playableIds: FIGHTER_IDS,
});
