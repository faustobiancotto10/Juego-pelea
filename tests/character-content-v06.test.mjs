import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_CHARACTER_COMPOSITION,
  RELEASED_CHARACTER_PACKAGES,
  composeCharacterContent,
  createFighterPresentationRegistry,
} from '../dist/game/data/characterContent.js';
import { createCombatRegistry, DEFAULT_COMBAT_REGISTRY } from '../dist/game/data/combatRegistry.js';
import { DEFAULT_FIGHTER_PRESENTATION_REGISTRY } from '../dist/game/data/presentationRegistry.js';
import { FIGHTERS, FIGHTER_IDS } from '../dist/game/data/fighters.js';
import { FIGHTER_KITS } from '../dist/game/data/fighterKits.js';
import { PROJECTILES } from '../dist/game/data/projectiles.js';
import { ULTIMATES } from '../dist/game/data/ultimates.js';
import { MOVE_SETS } from '../dist/game/simulation/moves.js';
import { JUANCHI_CHARACTER_ID, JUANCHI_PRESENTATION } from '../dist/game/data/characters/juanchi.js';
import { fourthCharacterPackage, fourthPackageId } from './fixtures/v06-character-package.mjs';

test('R0 extracts V0.5 values into ordered Character Packages without tuning', () => {
  assert.deepEqual([...DEFAULT_CHARACTER_COMPOSITION.packageIds], ['chameleon', 'supernariz', 'juanchi']);
  assert.deepEqual([...FIGHTER_IDS], ['chameleon', 'supernariz', 'juanchi']);
  assert.deepEqual([...DEFAULT_COMBAT_REGISTRY.playableIds], ['chameleon', 'supernariz', 'juanchi']);

  assert.equal(FIGHTERS.chameleon.maxHealth, 1000);
  assert.equal(FIGHTERS.chameleon.walkSpeed, 4.25);
  assert.equal(MOVE_SETS.chameleon.tongueStraight.totalFrames, 46);
  assert.equal(MOVE_SETS.chameleon.tongueStraight.hitbox.knockback, 4.8);
  assert.equal(MOVE_SETS.chameleon.coletazo.hitbox.damage, 52);
  assert.equal(FIGHTER_KITS.supernariz.rangedSpecial, 'chorizoThrow');
  assert.equal(PROJECTILES.chorizo.speed, 9.2);
  assert.equal(PROJECTILES.chorizo.cooldown, 120);
  assert.equal(PROJECTILES.chorizo.visualKey, 'chorizo');
  assert.equal(ULTIMATES.camaleoniUltimate.startupFrames, 22);
  assert.equal(ULTIMATES.supernarizUltimate.sequenceHits[0].damage, 190);

  const camPresentation = DEFAULT_FIGHTER_PRESENTATION_REGISTRY.getPresentation('chameleon');
  assert.equal(camPresentation.rigKey, 'chameleon');
  assert.equal(camPresentation.select.kicker, 'CONTROL DE DISTANCIA');
  assert.equal(DEFAULT_FIGHTER_PRESENTATION_REGISTRY.getPresentation('supernariz').rangedAvailabilityLabel, 'CHORIZO');
});

test('R2 releases the complete Juanchi package through the default registries', () => {
  assert.equal(JUANCHI_CHARACTER_ID, 'juanchi');
  assert.equal(JUANCHI_PRESENTATION.rigKey, 'juanchi');
  assert.equal(JUANCHI_PRESENTATION.ultimateVisualKey, 'police-cap-rage');
  assert.equal(JUANCHI_PRESENTATION.rangedAvailabilityLabel, 'PELOTA');
  assert.equal(DEFAULT_COMBAT_REGISTRY.playableIds.includes(JUANCHI_CHARACTER_ID), true);
  assert.equal(DEFAULT_COMBAT_REGISTRY.getFighter(JUANCHI_CHARACTER_ID).walkSpeed, 4.55);
  assert.equal(DEFAULT_COMBAT_REGISTRY.getProjectile('juanchiRugby').kind, 'returnToOwner');
  assert.deepEqual(
    DEFAULT_COMBAT_REGISTRY.getMove('juanchi', 'friccion').hits.map((hit) => hit.hitId),
    ['rub-a', 'rub-b', 'palm-release'],
  );
  assert.equal(DEFAULT_COMBAT_REGISTRY.getUltimate('juanchiPoliceCap').kind, 'capCapture');
});

test('R0 fourth synthetic Character Package registers structurally without entering released playable roster', () => {
  const packages = [...RELEASED_CHARACTER_PACKAGES, fourthCharacterPackage];
  const composition = composeCharacterContent(packages, DEFAULT_COMBAT_REGISTRY.playableIds);
  const registry = createCombatRegistry(composition);
  const presentations = createFighterPresentationRegistry(packages);

  assert.deepEqual([...composition.packageIds], ['chameleon', 'supernariz', 'juanchi', fourthPackageId]);
  assert.equal(registry.getFighter(fourthPackageId).maxHealth, 840);
  assert.equal(registry.getMove(fourthPackageId, 'fourJab').hitbox.damage, 34);
  assert.equal(registry.getProjectile('fixture-four-bolt').visualKey, 'fixture-four-bolt');
  assert.equal(registry.getUltimate('fixture-four-ultimate').kind, 'dashCapture');
  assert.equal(presentations.getPresentation(fourthPackageId).rigKey, 'fixture-four');
  assert.equal(registry.playableIds.includes(fourthPackageId), false);
});

test('R0 composition and combat registry own deep frozen clones rather than source references', () => {
  const mutable = structuredClone(fourthCharacterPackage);
  const composition = composeCharacterContent([mutable], []);
  const registry = createCombatRegistry(composition);

  mutable.fighter.maxHealth = 1;
  mutable.moves.fourJab.hitbox.damage = 999;
  mutable.presentation.select.role = 'MUTATED';
  mutable.projectiles['fixture-four-bolt'].speed = 999;

  assert.equal(composition.fighters[fourthPackageId].maxHealth, 840);
  assert.equal(composition.moves[fourthPackageId].fourJab.hitbox.damage, 34);
  assert.equal(composition.presentations[fourthPackageId].select.role, 'Fixture');
  assert.equal(registry.getProjectile('fixture-four-bolt').speed, 7.2);

  assert.equal(Object.isFrozen(composition), true);
  assert.equal(Object.isFrozen(composition.fighters), true);
  assert.equal(Object.isFrozen(composition.fighters[fourthPackageId]), true);
  assert.equal(Object.isFrozen(composition.moves[fourthPackageId].fourJab.hitbox), true);
  assert.equal(Object.isFrozen(registry.getUltimate('fixture-four-ultimate').sequenceHits), true);
});

test('R0 presentation registry also owns its metadata and rejects unknown IDs', () => {
  const mutable = structuredClone(fourthCharacterPackage);
  const registry = createFighterPresentationRegistry([mutable]);
  mutable.presentation.select.kicker = 'MUTATED';

  assert.equal(registry.getPresentation(fourthPackageId).select.kicker, 'SYNTHETIC PACKAGE');
  assert.deepEqual([...registry.ids], [fourthPackageId]);
  assert.throws(() => registry.getPresentation('missing'), /Unknown fighter presentation missing/);
});

test('R0 validation rejects duplicate fighter, projectile and playable IDs', () => {
  assert.throws(
    () => composeCharacterContent([fourthCharacterPackage, fourthCharacterPackage], []),
    /duplicate fighter id fixture-fourth/,
  );

  const duplicateProjectile = structuredClone(fourthCharacterPackage);
  duplicateProjectile.fighter.id = 'fixture-duplicate-projectile';
  duplicateProjectile.projectiles = {
    chorizo: { ...duplicateProjectile.projectiles['fixture-four-bolt'], key: 'chorizo', visualKey: 'duplicate' },
  };
  duplicateProjectile.moves.fourShot.projectileKey = 'chorizo';
  assert.throws(
    () => composeCharacterContent([...RELEASED_CHARACTER_PACKAGES, duplicateProjectile], []),
    /duplicate projectile key chorizo/,
  );

  assert.throws(
    () => composeCharacterContent(RELEASED_CHARACTER_PACKAGES, ['chameleon', 'chameleon']),
    /duplicate playable id chameleon/,
  );
});

test('R0 validation rejects missing references, cancel cycles and invalid timelines', () => {
  const missing = structuredClone(fourthCharacterPackage);
  missing.kit.standing = 'not-there';
  assert.throws(() => composeCharacterContent([missing], []), /Unknown move fixture-fourth: not-there/);

  const chain = structuredClone(fourthCharacterPackage);
  chain.moves.fourFollow.nextAttack = 'fourJab';
  assert.throws(() => composeCharacterContent([chain], []), /cyclic normal-cancel graph/);

  const active = structuredClone(fourthCharacterPackage);
  active.moves.fourJab.hitbox.end = active.moves.fourJab.totalFrames;
  assert.throws(() => composeCharacterContent([active], []), /active window must be inside totalFrames/);

  const spawn = structuredClone(fourthCharacterPackage);
  spawn.moves.fourShot.spawnProjectileFrame = spawn.moves.fourShot.totalFrames;
  assert.throws(() => composeCharacterContent([spawn], []), /spawnProjectileFrame must be inside totalFrames/);
});

test('R0 validation rejects nonfinite values, illegal probabilities and function-bearing content', () => {
  const nan = structuredClone(fourthCharacterPackage);
  nan.fighter.walkSpeed = Number.NaN;
  assert.throws(() => composeCharacterContent([nan], []), /walkSpeed: must be finite/);

  const probability = structuredClone(fourthCharacterPackage);
  probability.kit.cpu.missChance = 1.1;
  assert.throws(() => composeCharacterContent([probability], []), /missChance: must be <= 1/);

  const noFinalDamage = structuredClone(fourthCharacterPackage);
  noFinalDamage.ultimates['fixture-four-ultimate'].sequenceHits[0].damage = 0;
  assert.throws(() => composeCharacterContent([noFinalDamage], []), /final Ultimate beat must deal positive damage/);

  const functionBearing = structuredClone(fourthCharacterPackage);
  functionBearing.presentation.bad = () => {};
  assert.throws(() => composeCharacterContent([functionBearing], []), /functions are not allowed in combat content/);
});

test('R0 package surface requires explicit presentation and projectile visual routing keys', () => {
  const noRig = structuredClone(fourthCharacterPackage);
  noRig.presentation.rigKey = '';
  assert.throws(() => composeCharacterContent([noRig], []), /rigKey: must be a non-empty string/);

  const noProjectileVisual = structuredClone(fourthCharacterPackage);
  noProjectileVisual.projectiles['fixture-four-bolt'].visualKey = '';
  assert.throws(() => composeCharacterContent([noProjectileVisual], []), /visualKey: must be a non-empty string/);
});
