import type { FighterDefinition } from './fighters.js';
import type { FighterKit } from './fighterKits.js';
import type { ProjectileDefinition } from './projectiles.js';
import type { UltimateDefinition } from './ultimates.js';
import type { MoveDefinition, HitboxSpec } from '../simulation/moves.js';
import type { FighterId, RegisteredFighterId } from '../types.js';
import { CAMALEONI_CHARACTER_CONTENT } from './characters/camaleoni.js';
import { SUPERNARIZ_CHARACTER_CONTENT } from './characters/supernariz.js';

export interface FighterPresentationDefinition {
  rigKey: string;
  ultimateVisualKey: string;
  accent: string;
  effectAccent: string;
  select: {
    kicker: string;
    role: string;
    moves: string;
    mark: string;
  };
  rangedAvailabilityLabel: string | null;
}

export type CharacterProjectileDefinition = ProjectileDefinition & { visualKey: string };

export interface CombatCharacterContent {
  fighter: FighterDefinition;
  kit: FighterKit;
  moves: Readonly<Record<string, MoveDefinition>>;
  projectiles: Readonly<Record<string, CharacterProjectileDefinition>>;
  ultimates: Readonly<Record<string, UltimateDefinition>>;
  presentation: FighterPresentationDefinition;
}

export interface CharacterCombatSource {
  fighters: Readonly<Record<RegisteredFighterId, FighterDefinition>>;
  kits: Readonly<Record<RegisteredFighterId, FighterKit>>;
  moves: Readonly<Record<RegisteredFighterId, Readonly<Record<string, MoveDefinition>>>>;
  projectiles: Readonly<Record<string, ProjectileDefinition>>;
  ultimates: Readonly<Record<string, UltimateDefinition>>;
  playableIds: readonly FighterId[];
}

export interface CharacterContentComposition extends CharacterCombatSource {
  packageIds: readonly RegisteredFighterId[];
  packages: readonly CombatCharacterContent[];
  presentations: Readonly<Record<RegisteredFighterId, FighterPresentationDefinition>>;
}

export interface FighterPresentationRegistry {
  readonly ids: readonly RegisteredFighterId[];
  getPresentation(id: RegisteredFighterId): FighterPresentationDefinition;
}

const MOVE_CATEGORIES = new Set(['normal', 'special', 'projectile', 'ultimate']);
const BINDING_ROLES = new Set(['standing', 'low', 'chain', 'air', 'rangedSpecial', 'closeSpecial', 'ultimate']);
const ATTACK_LEVELS = new Set(['mid', 'low', 'overhead']);
const ULTIMATE_KINDS = new Set(['dashCapture', 'suctionCapture']);

function fail(path: string, message: string): never {
  throw new Error(`${path}: ${message}`);
}

function nonEmpty(path: string, value: unknown): string {
  if (typeof value !== 'string' || value.trim().length === 0) fail(path, 'must be a non-empty string');
  return value;
}

function finite(path: string, value: unknown, minimum?: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) fail(path, 'must be finite');
  if (minimum !== undefined && value < minimum) fail(path, `must be >= ${minimum}`);
  return value;
}

function integer(path: string, value: unknown, minimum = 0): number {
  const n = finite(path, value, minimum);
  if (!Number.isInteger(n)) fail(path, 'must be an integer');
  return n;
}

function probability(path: string, value: unknown): number {
  const n = finite(path, value, 0);
  if (n > 1) fail(path, 'must be <= 1');
  return n;
}

function cloneAndFreezeInner(value: unknown, path: string): unknown {
  if (typeof value === 'function') fail(path, 'functions are not allowed in combat content');
  if (Array.isArray(value)) {
    return Object.freeze(value.map((entry, index) => cloneAndFreezeInner(entry, `${path}[${index}]`)));
  }
  if (value !== null && typeof value === 'object') {
    const proto = Object.getPrototypeOf(value);
    if (proto !== Object.prototype && proto !== null) fail(path, 'must contain plain data only');
    const result: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      result[key] = cloneAndFreezeInner(entry, `${path}.${key}`);
    }
    return Object.freeze(result);
  }
  return value;
}

export function cloneAndFreezeData<T>(value: T, path = 'content'): T {
  return cloneAndFreezeInner(value, path) as T;
}

function validateHitbox(path: string, hitbox: HitboxSpec, totalFrames: number): void {
  const start = integer(`${path}.start`, hitbox.start);
  const end = integer(`${path}.end`, hitbox.end);
  if (end < start) fail(path, 'active end must be >= active start');
  if (end >= totalFrames) fail(path, 'active window must be inside totalFrames');

  finite(`${path}.offsetX`, hitbox.offsetX);
  finite(`${path}.width`, hitbox.width, 0.000001);
  finite(`${path}.bottom`, hitbox.bottom);
  finite(`${path}.top`, hitbox.top);
  if (hitbox.top <= hitbox.bottom) fail(path, 'top must be greater than bottom');
  finite(`${path}.damage`, hitbox.damage, 0);
  finite(`${path}.chipDamage`, hitbox.chipDamage, 0);
  integer(`${path}.hitstun`, hitbox.hitstun);
  integer(`${path}.blockstun`, hitbox.blockstun);
  finite(`${path}.knockback`, hitbox.knockback, 0);
  integer(`${path}.hitstop`, hitbox.hitstop);
  finite(`${path}.guardDamage`, hitbox.guardDamage, 0);
  if (!ATTACK_LEVELS.has(hitbox.level)) fail(`${path}.level`, `unknown attack level ${String(hitbox.level)}`);
  if (typeof hitbox.strong !== 'boolean') fail(`${path}.strong`, 'must be boolean');
}

function validateMove(path: string, move: MoveDefinition): void {
  nonEmpty(`${path}.id`, move.id);
  if (!MOVE_CATEGORIES.has(move.category)) fail(`${path}.category`, `unknown category ${String(move.category)}`);
  if (!BINDING_ROLES.has(move.bindingRole)) fail(`${path}.bindingRole`, `unknown role ${String(move.bindingRole)}`);
  const total = integer(`${path}.totalFrames`, move.totalFrames, 1);

  if (move.hitbox !== undefined) validateHitbox(`${path}.hitbox`, move.hitbox, total);

  const cancelStart = move.cancelStart;
  const cancelEnd = move.cancelEnd;
  if ((cancelStart === undefined) !== (cancelEnd === undefined)) fail(path, 'cancelStart and cancelEnd must be provided together');
  if (cancelStart !== undefined && cancelEnd !== undefined) {
    const start = integer(`${path}.cancelStart`, cancelStart);
    const end = integer(`${path}.cancelEnd`, cancelEnd);
    if (end < start || end >= total) fail(path, 'cancel window must be ordered and inside totalFrames');
  }

  if (move.nextAttack !== undefined) nonEmpty(`${path}.nextAttack`, move.nextAttack);

  const spawn = move.spawnProjectileFrame;
  if (spawn !== undefined) {
    const frame = integer(`${path}.spawnProjectileFrame`, spawn);
    if (frame >= total) fail(path, 'spawnProjectileFrame must be inside totalFrames');
  }
  if ((move.projectileKey === undefined) !== (spawn === undefined)) {
    fail(path, 'projectileKey and spawnProjectileFrame must be provided together');
  }
  if (move.projectileKey !== undefined) nonEmpty(`${path}.projectileKey`, move.projectileKey);
  if (move.ultimateKey !== undefined) nonEmpty(`${path}.ultimateKey`, move.ultimateKey);
  if (move.ultimate === true && move.ultimateKey === undefined) fail(path, 'ultimate move requires ultimateKey');
  if (move.chillFrames !== undefined) integer(`${path}.chillFrames`, move.chillFrames);
  if (move.cpuThreatRange !== undefined) finite(`${path}.cpuThreatRange`, move.cpuThreatRange, 0);
  if (move.cpuReactionFrame !== undefined) {
    const reaction = integer(`${path}.cpuReactionFrame`, move.cpuReactionFrame);
    if (reaction >= total) fail(path, 'cpuReactionFrame must be inside totalFrames');
  }
}

function validateCancelGraph(id: RegisteredFighterId, moveSet: Readonly<Record<string, MoveDefinition>>): void {
  const state = new Map<string, 0 | 1 | 2>();
  const visit = (moveId: string): void => {
    const current = state.get(moveId) ?? 0;
    if (current === 1) fail(`fighter ${id}.moves.${moveId}`, 'cyclic normal-cancel graph');
    if (current === 2) return;
    state.set(moveId, 1);
    const next = moveSet[moveId]?.nextAttack;
    if (next) visit(next);
    state.set(moveId, 2);
  };
  for (const moveId of Object.keys(moveSet)) visit(moveId);
}

function validateCpu(path: string, kit: FighterKit): void {
  const cpu = kit.cpu;
  const [preferredMin, preferredMax] = cpu.preferredRange;
  finite(`${path}.preferredRange[0]`, preferredMin, 0);
  finite(`${path}.preferredRange[1]`, preferredMax, 0);
  if (preferredMax < preferredMin) fail(`${path}.preferredRange`, 'max must be >= min');
  finite(`${path}.pressureRange`, cpu.pressureRange, 0);
  integer(`${path}.reactionTicks`, cpu.reactionTicks);
  integer(`${path}.decisionTicks`, cpu.decisionTicks, 1);
  const [commitMin, commitMax] = cpu.commitmentTicks;
  integer(`${path}.commitmentTicks[0]`, commitMin);
  integer(`${path}.commitmentTicks[1]`, commitMax);
  if (commitMax < commitMin) fail(`${path}.commitmentTicks`, 'max must be >= min');
  probability(`${path}.missChance`, cpu.missChance);
  probability(`${path}.confirmChance`, cpu.confirmChance);
  if (cpu.archetype !== 'pressure' && cpu.archetype !== 'control') fail(`${path}.archetype`, 'unknown CPU archetype');
}

function validateFighter(path: string, fighter: FighterDefinition): void {
  nonEmpty(`${path}.id`, fighter.id);
  nonEmpty(`${path}.displayName`, fighter.displayName);
  nonEmpty(`${path}.fullName`, fighter.fullName);
  nonEmpty(`${path}.role`, fighter.role);
  finite(`${path}.maxHealth`, fighter.maxHealth, 1);
  finite(`${path}.walkSpeed`, fighter.walkSpeed, 0);
  finite(`${path}.jumpSpeed`, fighter.jumpSpeed, 0);
  finite(`${path}.gravity`, fighter.gravity, 0);
  finite(`${path}.width`, fighter.width, 0.000001);
  finite(`${path}.height`, fighter.height, 0.000001);
  nonEmpty(`${path}.accent`, fighter.accent);
}

function validateProjectile(path: string, projectile: ProjectileDefinition): void {
  nonEmpty(`${path}.key`, projectile.key);
  if (projectile.visualKey !== undefined) nonEmpty(`${path}.visualKey`, projectile.visualKey);
  finite(`${path}.spawnOffsetX`, projectile.spawnOffsetX);
  finite(`${path}.spawnOffsetY`, projectile.spawnOffsetY);
  finite(`${path}.speed`, projectile.speed);
  integer(`${path}.ttl`, projectile.ttl, 1);
  finite(`${path}.collisionHalfWidth`, projectile.collisionHalfWidth, 0);
  finite(`${path}.collisionHalfHeight`, projectile.collisionHalfHeight, 0);
  finite(`${path}.damage`, projectile.damage, 0);
  finite(`${path}.chipDamage`, projectile.chipDamage, 0);
  finite(`${path}.guardDamage`, projectile.guardDamage, 0);
  integer(`${path}.hitstun`, projectile.hitstun);
  integer(`${path}.blockstun`, projectile.blockstun);
  finite(`${path}.knockback`, projectile.knockback, 0);
  finite(`${path}.blockKnockback`, projectile.blockKnockback, 0);
  finite(`${path}.cornerTransferKnockback`, projectile.cornerTransferKnockback, 0);
  integer(`${path}.hitstop`, projectile.hitstop);
  integer(`${path}.cooldown`, projectile.cooldown);
  if (typeof projectile.strong !== 'boolean') fail(`${path}.strong`, 'must be boolean');
}

function validateUltimate(path: string, ultimate: UltimateDefinition): void {
  nonEmpty(`${path}.key`, ultimate.key);
  if (!ULTIMATE_KINDS.has(ultimate.kind)) fail(`${path}.kind`, `unknown Ultimate kind ${String(ultimate.kind)}`);
  integer(`${path}.startupFrames`, ultimate.startupFrames);
  integer(`${path}.captureFrames`, ultimate.captureFrames);
  integer(`${path}.recoveryFrames`, ultimate.recoveryFrames);
  if (ultimate.successRecoveryFrames !== undefined) integer(`${path}.successRecoveryFrames`, ultimate.successRecoveryFrames);
  finite(`${path}.captureReach`, ultimate.captureReach, 0);
  finite(`${path}.captureVertical`, ultimate.captureVertical, 0);
  integer(`${path}.sequenceFrames`, ultimate.sequenceFrames, 1);
  finite(`${path}.sequenceOffsetX`, ultimate.sequenceOffsetX);
  finite(`${path}.releaseKnockback`, ultimate.releaseKnockback, 0);
  if (ultimate.releaseSeparation !== undefined) finite(`${path}.releaseSeparation`, ultimate.releaseSeparation, 0);
  if (ultimate.releaseVx !== undefined) finite(`${path}.releaseVx`, ultimate.releaseVx);
  if (ultimate.releaseVy !== undefined) finite(`${path}.releaseVy`, ultimate.releaseVy);
  if (ultimate.releaseHitstun !== undefined) integer(`${path}.releaseHitstun`, ultimate.releaseHitstun);
  if (ultimate.finalHitstop !== undefined) integer(`${path}.finalHitstop`, ultimate.finalHitstop);
  nonEmpty(`${path}.visualKey`, ultimate.visualKey);

  if (ultimate.kind === 'dashCapture') {
    finite(`${path}.dashSpeed`, ultimate.dashSpeed, 0);
  } else {
    finite(`${path}.suctionRange`, ultimate.suctionRange, 0);
    finite(`${path}.suctionSpeed`, ultimate.suctionSpeed, 0);
    finite(`${path}.captureDistance`, ultimate.captureDistance, 0);
  }

  const seenFrames = new Set<number>();
  let finalFrame = -1;
  let finalDamage = 0;
  for (const [index, beat] of ultimate.sequenceHits.entries()) {
    const beatPath = `${path}.sequenceHits[${index}]`;
    const frame = integer(`${beatPath}.frame`, beat.frame);
    if (frame > ultimate.sequenceFrames) fail(beatPath, 'frame must be within sequenceFrames');
    if (seenFrames.has(frame)) fail(beatPath, `duplicate sequence frame ${frame}`);
    seenFrames.add(frame);
    finite(`${beatPath}.damage`, beat.damage, 0);
    finite(`${beatPath}.knockback`, beat.knockback, 0);
    if (frame > finalFrame) {
      finalFrame = frame;
      finalDamage = beat.damage;
    }
  }
  if (finalFrame < 0 || finalDamage <= 0) fail(path, 'final Ultimate beat must deal positive damage');
}

function validatePresentation(path: string, presentation: FighterPresentationDefinition): void {
  nonEmpty(`${path}.rigKey`, presentation.rigKey);
  nonEmpty(`${path}.ultimateVisualKey`, presentation.ultimateVisualKey);
  nonEmpty(`${path}.accent`, presentation.accent);
  nonEmpty(`${path}.effectAccent`, presentation.effectAccent);
  nonEmpty(`${path}.select.kicker`, presentation.select.kicker);
  nonEmpty(`${path}.select.role`, presentation.select.role);
  nonEmpty(`${path}.select.moves`, presentation.select.moves);
  nonEmpty(`${path}.select.mark`, presentation.select.mark);
  if (presentation.rangedAvailabilityLabel !== null) {
    nonEmpty(`${path}.rangedAvailabilityLabel`, presentation.rangedAvailabilityLabel);
  }
}

function requireEntry<T>(map: Readonly<Record<string, T>>, key: string, path: string): T {
  const value = map[key];
  if (!value) fail(path, `missing referenced entry ${key}`);
  return value;
}

function validateCombatSource(source: CharacterCombatSource): void {
  for (const [id, fighter] of Object.entries(source.fighters)) {
    validateFighter(`fighters.${id}`, fighter);
    if (fighter.id !== id) fail(`fighters.${id}.id`, `must equal registry key ${id}`);
    const kit = requireEntry(source.kits, id, `fighters.${id}.kit`);
    const moveSet = requireEntry(source.moves, id, `fighters.${id}.moves`);
    validateCpu(`kits.${id}.cpu`, kit);

    const requiredMoves = [kit.standing, kit.low, kit.air, kit.rangedSpecial, kit.closeSpecial, kit.ultimate];
    for (const moveId of requiredMoves) {
      if (!moveSet[moveId]) throw new Error(`Unknown move ${id}: ${moveId}`);
    }

    for (const [moveId, move] of Object.entries(moveSet)) {
      validateMove(`moves.${id}.${moveId}`, move);
      if (move.id !== moveId) fail(`moves.${id}.${moveId}.id`, `must equal move key ${moveId}`);
      if (move.projectileKey) requireEntry(source.projectiles, move.projectileKey, `moves.${id}.${moveId}.projectileKey`);
      if (move.ultimateKey) requireEntry(source.ultimates, move.ultimateKey, `moves.${id}.${moveId}.ultimateKey`);
      if (move.nextAttack) requireEntry(moveSet, move.nextAttack, `moves.${id}.${moveId}.nextAttack`);
    }
    validateCancelGraph(id, moveSet);
  }

  for (const id of Object.keys(source.kits)) {
    if (!source.fighters[id]) fail(`kits.${id}`, 'fighter is not registered');
  }
  for (const id of Object.keys(source.moves)) {
    if (!source.fighters[id]) fail(`moves.${id}`, 'fighter is not registered');
  }

  for (const [key, projectile] of Object.entries(source.projectiles)) {
    validateProjectile(`projectiles.${key}`, projectile);
    if (projectile.key !== key) fail(`projectiles.${key}.key`, `must equal registry key ${key}`);
  }
  for (const [key, ultimate] of Object.entries(source.ultimates)) {
    validateUltimate(`ultimates.${key}`, ultimate);
    if (ultimate.key !== key) fail(`ultimates.${key}.key`, `must equal registry key ${key}`);
  }

  const playable = new Set<string>();
  for (const id of source.playableIds) {
    nonEmpty('playableIds', id);
    if (playable.has(id)) fail('playableIds', `duplicate playable id ${id}`);
    playable.add(id);
    requireEntry(source.fighters, id, 'playableIds');
  }
}

export function freezeCombatRegistrySource(source: CharacterCombatSource): CharacterCombatSource {
  const owned = cloneAndFreezeData<CharacterCombatSource>({
    fighters: source.fighters,
    kits: source.kits,
    moves: source.moves,
    projectiles: source.projectiles,
    ultimates: source.ultimates,
    playableIds: source.playableIds,
  }, 'combatRegistrySource');
  validateCombatSource(owned);
  return owned;
}

function validatePackageSurface(content: CombatCharacterContent): void {
  const id = content.fighter.id;
  validatePresentation(`package ${id}.presentation`, content.presentation);
  for (const [key, projectile] of Object.entries(content.projectiles)) {
    nonEmpty(`package ${id}.projectiles.${key}.visualKey`, projectile.visualKey);
  }
}

export function composeCharacterContent(
  packages: readonly CombatCharacterContent[],
  playableIds: readonly FighterId[],
): CharacterContentComposition {
  const ownedPackages = packages.map((content, index) =>
    cloneAndFreezeData(content, `packages[${index}]`),
  );

  const fighters: Record<string, FighterDefinition> = {};
  const kits: Record<string, FighterKit> = {};
  const moves: Record<string, Readonly<Record<string, MoveDefinition>>> = {};
  const projectiles: Record<string, ProjectileDefinition> = {};
  const ultimates: Record<string, UltimateDefinition> = {};
  const presentations: Record<string, FighterPresentationDefinition> = {};
  const packageIds: RegisteredFighterId[] = [];

  for (const content of ownedPackages) {
    const id = nonEmpty('package.fighter.id', content.fighter.id);
    if (fighters[id]) fail(`package ${id}`, `duplicate fighter id ${id}`);
    validatePackageSurface(content);

    fighters[id] = content.fighter;
    kits[id] = content.kit;
    moves[id] = content.moves;
    presentations[id] = content.presentation;
    packageIds.push(id);

    for (const [key, projectile] of Object.entries(content.projectiles)) {
      if (projectiles[key]) fail(`package ${id}.projectiles.${key}`, `duplicate projectile key ${key}`);
      projectiles[key] = projectile;
    }
    for (const [key, ultimate] of Object.entries(content.ultimates)) {
      if (ultimates[key]) fail(`package ${id}.ultimates.${key}`, `duplicate Ultimate key ${key}`);
      ultimates[key] = ultimate;
    }
  }

  const combat = freezeCombatRegistrySource({
    fighters,
    kits,
    moves,
    projectiles,
    ultimates,
    playableIds,
  });

  return cloneAndFreezeData<CharacterContentComposition>({
    ...combat,
    packageIds,
    packages: ownedPackages,
    presentations,
  }, 'characterComposition');
}

export function createFighterPresentationRegistry(
  packages: readonly CombatCharacterContent[],
): FighterPresentationRegistry {
  const presentations: Record<string, FighterPresentationDefinition> = {};
  const ids: RegisteredFighterId[] = [];

  for (const [index, source] of packages.entries()) {
    const id = nonEmpty(`presentationPackages[${index}].fighter.id`, source.fighter.id);
    if (presentations[id]) fail(`presentationPackages[${index}]`, `duplicate fighter id ${id}`);
    const presentation = cloneAndFreezeData(source.presentation, `presentationPackages[${index}].presentation`);
    validatePresentation(`presentationPackages[${index}].presentation`, presentation);
    presentations[id] = presentation;
    ids.push(id);
  }

  const ownedPresentations = cloneAndFreezeData(presentations, 'presentationRegistry');
  const ownedIds = Object.freeze([...ids]);
  return Object.freeze({
    ids: ownedIds,
    getPresentation(id: RegisteredFighterId): FighterPresentationDefinition {
      const presentation = ownedPresentations[id];
      if (!presentation) throw new Error(`Unknown fighter presentation ${id}`);
      return presentation;
    },
  });
}

export const RELEASED_CHARACTER_PACKAGES: readonly CombatCharacterContent[] = Object.freeze([
  CAMALEONI_CHARACTER_CONTENT,
  SUPERNARIZ_CHARACTER_CONTENT,
]);

export const DEFAULT_CHARACTER_COMPOSITION = composeCharacterContent(
  RELEASED_CHARACTER_PACKAGES,
  ['chameleon', 'supernariz'],
);
