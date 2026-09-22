import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { DEFAULT_CHARACTER_COMPOSITION } from '../dist/game/data/characterContent.js';
import { DEFAULT_FIGHTER_PRESENTATION_REGISTRY } from '../dist/game/data/presentationRegistry.js';
import { DEFAULT_SPRITE_PACKAGE_REGISTRY } from '../dist/game/render/sprites/SpritePackageRegistry.js';
import {
  buildElToroBilateralAtlasPackage,
} from '../scripts/el-toro-sprite-atlas-packer.mjs';

const RIGHT=resolve('docs/characters/el-toro/sprite-source/right');
const LEFT=resolve('docs/characters/el-toro/sprite-source/left');
const CONTRACT=resolve('docs/characters/el-toro/sprite-package/right-package.json');
const RIGHT_ANCHORS=resolve('docs/characters/el-toro/sprite-package/anchors/right-verified.json');
const LEFT_ANCHORS=resolve('docs/characters/el-toro/sprite-package/anchors/left-verified.json');

test('V07-SPR-G1 canonical verified bilateral packer produces a non-mirrored runtime-loadable manifest', () => {
  const outDir=mkdtempSync(join(tmpdir(),'g1-el-toro-'));
  buildElToroBilateralAtlasPackage({
    rightSourceDir:RIGHT,
    leftSourceDir:LEFT,
    packageContractPath:CONTRACT,
    outDir,
    rightVerifiedAnchorReviewPath:RIGHT_ANCHORS,
    leftVerifiedAnchorReviewPath:LEFT_ANCHORS,
  });

  const manifest=JSON.parse(readFileSync(join(outDir,'el-toro-animations.json'),'utf8'));
  assert.equal(manifest.runtimeLoadable,true);
  assert.deepEqual(manifest.blockingGates,[]);
  assert.equal(manifest.mirrorSafe,false);
  assert.deepEqual(
    Object.keys(manifest.leftAnimations).sort(),
    Object.keys(manifest.animations).sort(),
  );

  for (const map of [manifest.animations,manifest.leftAnimations]) {
    for (const animation of Object.values(map)) {
      for (const frame of animation.frames) {
        assert.ok(frame.anchors);
        for (const key of ['head','chest','frontHand','backHand','belt','frontFoot','backFoot']) {
          assert.ok(frame.anchors[key], `missing ${key}`);
        }
      }
    }
  }
});

test('V07-SPR-G1 exact candidate exposes El Toro as an actually playable fighter', () => {
  assert.ok(
    DEFAULT_CHARACTER_COMPOSITION.playableIds.includes('el-toro'),
    'Gonza cannot publish an El Toro sprite pilot preview from an exact candidate whose playable roster omits el-toro',
  );
  assert.ok(
    DEFAULT_FIGHTER_PRESENTATION_REGISTRY.ids.includes('el-toro'),
    'El Toro must have a live presentation entry before bilateral runtime rendering can be audited end-to-end',
  );
});

test('V07-SPR-G1 exact candidate registers the El Toro sprite package for browser loading', () => {
  assert.equal(
    DEFAULT_SPRITE_PACKAGE_REGISTRY.has('el-toro'),
    true,
    'runtimeLoadable builder output is not enough: the exact preview candidate must register the package used by the browser loader',
  );
});

test('V07-SPR-G1 exact candidate ships a runtime asset root for the sprite preview', () => {
  assert.equal(
    existsSync(resolve('assets')),
    true,
    'build copies runtime sprite assets only from assets/, but the exact candidate has no runtime asset root to serve',
  );
});
