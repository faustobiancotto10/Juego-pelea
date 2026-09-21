import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSpriteAnimationSet } from '../dist/game/render/sprites/SpriteManifest.js';
import { createFighterPresentationRegistry } from '../dist/game/data/characterContent.js';
import { fourthCharacterPackage } from './fixtures/v06-character-package.mjs';

function validManifest() {
  return {
    version: 1,
    atlas: 'assets/fighters/el-toro/body.webp',
    animations: {
      idle: {
        loop: true,
        frames: [
          {
            x: 0,
            y: 0,
            width: 180,
            height: 260,
            pivotX: 90,
            pivotY: 250,
            durationTicks: 6,
            anchors: { head: { x: 90, y: 38 } },
          },
        ],
      },
    },
  };
}

test('sprite manifest validator accepts the v1 runtime schema', () => {
  assert.deepEqual(validateSpriteAnimationSet(validManifest()), validManifest());
});

test('sprite manifest validator rejects malformed version, atlas and animation maps', () => {
  assert.throws(() => validateSpriteAnimationSet({ ...validManifest(), version: 2 }), /version/i);
  assert.throws(() => validateSpriteAnimationSet({ ...validManifest(), atlas: '   ' }), /atlas/i);
  assert.throws(() => validateSpriteAnimationSet({ ...validManifest(), animations: {} }), /animations/i);
  assert.throws(
    () => validateSpriteAnimationSet({ ...validManifest(), animations: { '': validManifest().animations.idle } }),
    /animation.*key|animations/i,
  );
});

test('sprite manifest validator rejects malformed frames and anchors', () => {
  const base = validManifest();
  const frame = base.animations.idle.frames[0];

  assert.throws(
    () => validateSpriteAnimationSet({
      ...base,
      animations: { idle: { loop: true, frames: [{ ...frame, width: 0 }] } },
    }),
    /width/i,
  );
  assert.throws(
    () => validateSpriteAnimationSet({
      ...base,
      animations: { idle: { loop: true, frames: [{ ...frame, pivotX: Number.NaN }] } },
    }),
    /pivotX/i,
  );
  assert.throws(
    () => validateSpriteAnimationSet({
      ...base,
      animations: { idle: { loop: true, frames: [{ ...frame, durationTicks: 0 }] } },
    }),
    /durationTicks/i,
  );
  assert.throws(
    () => validateSpriteAnimationSet({
      ...base,
      animations: { idle: { loop: true, frames: [{ ...frame, anchors: { head: { x: Infinity, y: 2 } } }] } },
    }),
    /anchors.*head.*x/i,
  );
  assert.throws(
    () => validateSpriteAnimationSet({
      ...base,
      animations: { idle: { loop: true, frames: [] } },
    }),
    /frames/i,
  );
});

test('sprite presentation metadata requires a package key only for sprite bodies', () => {
  const spritePackage = structuredClone(fourthCharacterPackage);
  spritePackage.presentation.bodyBackend = 'sprite';
  assert.throws(
    () => createFighterPresentationRegistry([spritePackage]),
    /spritePackageKey/i,
  );

  spritePackage.presentation.spritePackageKey = 'fixture-four';
  assert.equal(
    createFighterPresentationRegistry([spritePackage]).getPresentation(spritePackage.fighter.id).spritePackageKey,
    'fixture-four',
  );

  const proceduralPackage = structuredClone(fourthCharacterPackage);
  proceduralPackage.presentation.bodyBackend = 'procedural';
  assert.doesNotThrow(() => createFighterPresentationRegistry([proceduralPackage]));

  const legacyPackage = structuredClone(fourthCharacterPackage);
  assert.doesNotThrow(() => createFighterPresentationRegistry([legacyPackage]));
});
