import type { FighterDefinition } from './fighters.js';
import type { FighterKit } from './fighterKits.js';
import type { ProjectileDefinition } from './projectiles.js';
import type { UltimateDefinition } from './ultimates.js';
import type { MoveDefinition, HitboxSpec, MoveHitWindow } from '../simulation/moves.js';
import type { FighterId, RegisteredFighterId } from '../types.js';
import type { FighterBodyBackend } from '../render/sprites/SpriteManifest.js';
import { CAMALEONI_CHARACTER_CONTENT } from './characters/camaleoni.js';
import { SUPERNARIZ_CHARACTER_CONTENT } from './characters/supernariz.js';
import { JUANCHI_CHARACTER_CONTENT } from './characters/juanchi.js';

export interface FighterPresentationDefinition {
  bodyBackend?: FighterBodyBackend;
  spritePackageKey?: string;
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
const ULTIMATE_KINDS = new Set(['dashCapture', 'suctionCapture', 'capCapture']);

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

  if (move.hitbox !== undefined && move.hits !== undefined) fail(path, 'hitbox and hits are mutually exclusive');
  if (move.hitbox !== undefined) validateHitbox(`${path}.hitbox`, move.hitbox, total);
  if (move.hits !== undefined) {
    const seenHitIds = new Set<string>();
    const windows: MoveHitWindow[] = [];
    for (const [index, hit] of move.hits.entries()) {
      const hitPath = `${path}.hits[${index}]`;
      validateHitbox(hitPath, hit, total);
      nonEmpty(`${hitPath}.hitId`, hit.hitId);
      if (seenHitIds.has(hit.hitId)) fail(hitPath, `duplicate hitId ${hit.hitId}`);
      seenHitIds.add(hit.hitId);
      if (hit.blockKnockback !== undefined) finite(`${hitPath}.blockKnockback`, hit.blockKnockback, 0);
      windows.push(hit);
    }
    for (let a = 0; a < windows.length; a += 1) {
      for (let b = a + 1; b < windows.length; b += 1) {
        const first = windows[a]!;
        const second = windows[b]!;
        const overlaps = first.start <= second.end && second.start <= first.end;
        if (overlaps) fail(path, `overlapping hit windows ${first.hitId}/${second.hitId}`);
      }
    }
  }

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
  if (cpu.tactics) {
    const [ultimateMin, ultimateMax] = cpu.tactics.ultimateRange;
    const [rangedMin, rangedMax] = cpu.tactics.rangedRange;
    finite(`${path}.tactics.ultimateRange[0]`, ultimateMin, 0);
    finite(`${path}.tactics.ultimateRange[1]`, ultimateMax, 0);
    if (ultimateMax < ultimateMin) fail(`${path}.tactics.ultimateRange`, 'max must be >= min');
    finite(`${path}.tactics.rangedRange[0]`, rangedMin, 0);
    finite(`${path}.tactics.rangedRange[1]`, rangedMax, 0);
    if (rangedMax < rangedMin) fail(`${path}.tactics.rangedRange`, 'max must be >= min');
    probability(`${path}.tactics.rangedChance`, cpu.tactics.rangedChance);
    probability(`${path}.tactics.advanceBehindReturningProjectile`, cpu.tactics.advanceBehindReturningProjectile);
    probability(`${path}.tactics.retreatAtPreferredRange`, cpu.tactics.retreatAtPreferredRange);
    let weightSum = 0;
    for (const key of ['standing', 'low', 'closeSpecial', 'jump', 'retreat'] as const) {
      weightSum += finite(`${path}.tactics.closeWeights.${key}`, cpu.tactics.closeWeights[key], 0);
    }
    if (weightSum <= 0) fail(`${path}.tactics.closeWeights`, 'weights must have positive sum');
  }
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
  if (fighter.captureHead !== undefined) {
    finite(`${path}.captureHead.standY`, fighter.captureHead.standY, 0);
    finite(`${path}.captureHead.crouchY`, fighter.captureHead.crouchY, 0);
    finite(`${path}.captureHead.halfWidth`, fighter.captureHead.halfWidth, 0.000001);
    finite(`${path}.captureHead.halfHeight`, fighter.captureHead.halfHeight, 0.000001);
  }
  nonEmpty(`${path}.accent`, fighter.accent);
}

function validateProjectileContact(path: string, contact: {
  damage: number;
  chipDamage: number;
  guardDamage: number;
  hitstun: number;
  blockstun: number;
  knockback: number;
  blockKnockback: number;
  hitstop: number;
  strong: boolean;
}): void {
  finite(`${path}.damage`, contact.damage, 0);
  finite(`${path}.chipDamage`, contact.chipDamage, 0);
  finite(`${path}.guardDamage`, contact.guardDamage, 0);
  integer(`${path}.hitstun`, contact.hitstun);
  integer(`${path}.blockstun`, contact.blockstun);
  finite(`${path}.knockback`, contact.knockback, 0);
  finite(`${path}.blockKnockback`, contact.blockKnockback, 0);
  integer(`${path}.hitstop`, contact.hitstop);
  if (typeof contact.strong !== 'boolean') fail(`${path}.strong`, 'must be boolean');
}

function validateProjectile(path: string, projectile: ProjectileDefinition): void {
  nonEmpty(`${path}.key`, projectile.key);
  if (projectile.visualKey !== undefined) nonEmpty(`${path}.visualKey`, projectile.visualKey);
  const kind = projectile.kind ?? 'linear';
  if (kind !== 'linear' && kind !== 'returnToOwner') fail(`${path}.kind`, `unknown projectile kind ${String(kind)}`);
  if (projectile.cancelOnOwnerHit !== undefined && typeof projectile.cancelOnOwnerHit !== 'boolean') {
    fail(`${path}.cancelOnOwnerHit`, 'must be boolean');
  }
  finite(`${path}.spawnOffsetX`, projectile.spawnOffsetX);
  finite(`${path}.spawnOffsetY`, projectile.spawnOffsetY);
  finite(`${path}.speed`, projectile.speed);
  integer(`${path}.ttl`, projectile.ttl, 1);
  finite(`${path}.collisionHalfWidth`, projectile.collisionHalfWidth, 0);
  finite(`${path}.collisionHalfHeight`, projectile.collisionHalfHeight, 0);
  validateProjectileContact(path, projectile);
  finite(`${path}.cornerTransferKnockback`, projectile.cornerTransferKnockback, 0);
  integer(`${path}.cooldown`, projectile.cooldown);

  if (kind === 'returnToOwner') {
    const config = projectile.returnConfig;
    if (!config) fail(`${path}.returnConfig`, 'required for returnToOwner');
    integer(`${path}.returnConfig.outboundTicks`, config.outboundTicks, 1);
    integer(`${path}.returnConfig.turnTicks`, config.turnTicks, 1);
    finite(`${path}.returnConfig.returnSpeed`, config.returnSpeed, 0.000001);
    integer(`${path}.returnConfig.maxReturnTicks`, config.maxReturnTicks, 1);
    finite(`${path}.returnConfig.catchRadius`, config.catchRadius, 0.000001);
    integer(`${path}.returnConfig.rearmTicks`, config.rearmTicks);
    integer(`${path}.returnConfig.minimumTicksBetweenLegHits`, config.minimumTicksBetweenLegHits);
    validateProjectileContact(`${path}.returnConfig.returnHit`, config.returnHit);
    if (projectile.cooldown !== config.rearmTicks) fail(path, 'returning projectile cooldown must equal rearmTicks');
  } else if (projectile.returnConfig !== undefined) {
    fail(`${path}.returnConfig`, 'must be absent for linear projectile');
  }
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
  } else if (ultimate.kind === 'suctionCapture') {
    finite(`${path}.suctionRange`, ultimate.suctionRange, 0);
    finite(`${path}.suctionSpeed`, ultimate.suctionSpeed, 0);
    finite(`${path}.captureDistance`, ultimate.captureDistance, 0);
  } else {
    finite(`${path}.probeSpawnOffsetX`, ultimate.probeSpawnOffsetX, 0);
    finite(`${path}.probeSpeed`, ultimate.probeSpeed, 0.000001);
    finite(`${path}.probeHalfWidth`, ultimate.probeHalfWidth, 0.000001);
    finite(`${path}.probeHalfHeight`, ultimate.probeHalfHeight, 0.000001);
    nonEmpty(`${path}.probeVisualKey`, ultimate.probeVisualKey);
    if (ultimate.sequenceApproach) {
      const start = integer(`${path}.sequenceApproach.startFrame`, ultimate.sequenceApproach.startFrame);
      const end = integer(`${path}.sequenceApproach.endFrame`, ultimate.sequenceApproach.endFrame);
      finite(`${path}.sequenceApproach.standOff`, ultimate.sequenceApproach.standOff, 0);
      if (end < start || end > ultimate.sequenceFrames) fail(`${path}.sequenceApproach`, 'must be ordered within sequenceFrames');
    }
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
  const backend = presentation.bodyBackend ?? 'procedural';
  if (backend !== 'procedural' && backend !== 'sprite') fail(`${path}.bodyBackend`, `unknown backend ${String(backend)}`);
  if (backend === 'sprite') nonEmpty(`${path}.spritePackageKey`, presentation.spritePackageKey);
  if (presentation.spritePackageKey !== undefined) nonEmpty(`${path}.spritePackageKey`, presentation.spritePackageKey);
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
  JUANCHI_CHARACTER_CONTENT,
]);

export const DEFAULT_CHARACTER_COMPOSITION = composeCharacterContent(
  RELEASED_CHARACTER_PACKAGES,
  ['chameleon', 'supernariz', 'juanchi'],
);
