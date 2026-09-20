import {
  DEFAULT_CHARACTER_COMPOSITION,
  freezeCombatRegistrySource,
  type CharacterCombatSource,
} from './characterContent.js';
import type { FighterDefinition } from './fighters.js';
import type { FighterKit } from './fighterKits.js';
import type { ProjectileDefinition } from './projectiles.js';
import type { UltimateDefinition } from './ultimates.js';
import type { MoveDefinition } from '../simulation/moves.js';
import type { FighterId, RegisteredFighterId } from '../types.js';

export interface CombatRegistry {
  readonly playableIds: readonly FighterId[];
  getFighter(id: RegisteredFighterId): FighterDefinition;
  getKit(id: RegisteredFighterId): FighterKit;
  getMove(id: RegisteredFighterId, moveId: string): MoveDefinition;
  getProjectile(key: string): ProjectileDefinition;
  getUltimate(key: string): UltimateDefinition;
}

export type CombatRegistrySource = CharacterCombatSource;

function requireEntry<T>(map: Readonly<Record<string, T>>, key: string, label: string): T {
  const value = map[key];
  if (!value) throw new Error(`Unknown ${label} ${key}`);
  return value;
}

export function createCombatRegistry(source: CombatRegistrySource): CombatRegistry {
  const owned = freezeCombatRegistrySource(source);

  return Object.freeze({
    playableIds: owned.playableIds,
    getFighter(id: RegisteredFighterId): FighterDefinition {
      return requireEntry(owned.fighters, id, 'fighter');
    },
    getKit(id: RegisteredFighterId): FighterKit {
      return requireEntry(owned.kits, id, 'fighter kit');
    },
    getMove(id: RegisteredFighterId, moveId: string): MoveDefinition {
      const moveSet = requireEntry(owned.moves, id, 'move set');
      return requireEntry(moveSet, moveId, `move ${id}:`);
    },
    getProjectile(key: string): ProjectileDefinition {
      return requireEntry(owned.projectiles, key, 'projectile');
    },
    getUltimate(key: string): UltimateDefinition {
      return requireEntry(owned.ultimates, key, 'ultimate');
    },
  });
}

export const DEFAULT_COMBAT_REGISTRY: CombatRegistry =
  createCombatRegistry(DEFAULT_CHARACTER_COMPOSITION);
