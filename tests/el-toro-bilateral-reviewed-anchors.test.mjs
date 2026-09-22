import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import {
  assertVerifiedElToroAnchorReview,
  buildElToroBilateralAtlasPackage,
} from '../scripts/el-toro-sprite-atlas-packer.mjs';

const rightSourceDir=resolve('docs/characters/el-toro/sprite-source/right');
const leftSourceDir=resolve('docs/characters/el-toro/sprite-source/left');
const packageContractPath=resolve('docs/characters/el-toro/sprite-package/right-package.json');
const rightReview=resolve('docs/characters/el-toro/sprite-package/anchors/right-verified.json');
const leftReview=resolve('docs/characters/el-toro/sprite-package/anchors/left-verified.json');
const REQUIRED=['head','chest','frontHand','backHand','belt','frontFoot','backFoot'];

test('canonical bilateral El Toro anchor reviews validate against the frozen review contract', () => {
  const right=JSON.parse(readFileSync(rightReview,'utf8'));
  const left=JSON.parse(readFileSync(leftReview,'utf8'));

  assert.doesNotThrow(()=>assertVerifiedElToroAnchorReview(right,{expectedFacing:'right'}));
  assert.doesNotThrow(()=>assertVerifiedElToroAnchorReview(left,{expectedFacing:'left'}));

  for (const review of [right,left]) {
    assert.equal(review.status,'verified');
    assert.equal(review.frames.length,84);
    assert.equal(review.reviewMethod.includes('visual review'),true);
    for (const frame of review.frames) {
      assert.equal(frame.verified,true,frame.frameId);
      assert.deepEqual(Object.keys(frame.anchors),REQUIRED);
      for (const point of Object.values(frame.anchors)) {
        assert.equal(Number.isFinite(point.x),true);
        assert.equal(Number.isFinite(point.y),true);
        assert.ok(point.x>=0 && point.x<=frame.atlasRect.width);
        assert.ok(point.y>=0 && point.y<=frame.atlasRect.height);
      }
    }
  }
});

test('canonical reviewed anchors make the repaired bilateral El Toro package runtime-loadable', () => {
  const outDir=mkdtempSync(join(tmpdir(),'el-toro-reviewed-loadable-'));
  buildElToroBilateralAtlasPackage({
    rightSourceDir,
    leftSourceDir,
    packageContractPath,
    outDir,
    rightVerifiedAnchorReviewPath:rightReview,
    leftVerifiedAnchorReviewPath:leftReview,
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
        assert.deepEqual(Object.keys(frame.anchors),REQUIRED);
      }
    }
  }
});
