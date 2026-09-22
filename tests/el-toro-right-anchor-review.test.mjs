import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import {
  assertVerifiedElToroAnchorReview,
  buildElToroRightAtlasPackage,
} from '../scripts/el-toro-sprite-atlas-packer.mjs';

const sourceDir=resolve('docs/characters/el-toro/sprite-source/right');
const packageContractPath=resolve('docs/characters/el-toro/sprite-package/right-package.json');
const REQUIRED=['head','chest','frontHand','backHand','belt','frontFoot','backFoot'];

test('El Toro package emits a complete 84-frame anchor review template without fabricating anatomy', () => {
  const outDir=mkdtempSync(join(tmpdir(),'el-toro-anchor-review-'));
  const result=buildElToroRightAtlasPackage({sourceDir,packageContractPath,outDir});
  const path=join(outDir,'right-anchor-review.json');
  assert.equal(result.anchorReviewPath,path);

  const review=JSON.parse(readFileSync(path,'utf8'));
  assert.equal(review.version,1);
  assert.equal(review.fighterId,'el-toro');
  assert.equal(review.facing,'right');
  assert.equal(review.status,'pending-visual-verification');
  assert.equal(review.coordinateSpace,'packed-frame-local');
  assert.deepEqual(review.requiredAnchors,REQUIRED);
  assert.equal(review.frames.length,84);

  const ids=new Set();
  for (const frame of review.frames) {
    assert.equal(ids.has(frame.frameId),false,frame.frameId);
    ids.add(frame.frameId);
    assert.ok(frame.atlasRect.width>=1);
    assert.ok(frame.atlasRect.height>=1);
    assert.ok(frame.pivot.x>0 && frame.pivot.x<=frame.atlasRect.width);
    assert.ok(frame.pivot.y>0 && frame.pivot.y<=frame.atlasRect.height);
    assert.equal(frame.pivot.source,'normalization-ground-pivot');
    assert.deepEqual(Object.keys(frame.anchors),REQUIRED);
    assert.ok(REQUIRED.every((name)=>frame.anchors[name]===null));
    assert.equal(frame.verified,false);
  }

  assert.throws(
    ()=>assertVerifiedElToroAnchorReview(review),
    /anchor review is not verified/,
  );
});

test('anchor verifier accepts only complete in-bounds anatomical anchor data', () => {
  const review={
    version:1,
    fighterId:'el-toro',
    facing:'right',
    status:'verified',
    coordinateSpace:'packed-frame-local',
    requiredAnchors:REQUIRED,
    frames:[{
      frameId:'IMG-01__f01',
      atlasRect:{x:2,y:2,width:100,height:200},
      pivot:{x:50,y:200,source:'normalization-ground-pivot'},
      anchors:{
        head:{x:50,y:25},
        chest:{x:50,y:70},
        frontHand:{x:78,y:85},
        backHand:{x:25,y:85},
        belt:{x:50,y:120},
        frontFoot:{x:68,y:195},
        backFoot:{x:34,y:195},
      },
      verified:true,
    }],
  };
  assert.doesNotThrow(()=>assertVerifiedElToroAnchorReview(review,{expectedFrameCount:1}));

  review.frames[0].anchors.head={x:150,y:25};
  assert.throws(
    ()=>assertVerifiedElToroAnchorReview(review,{expectedFrameCount:1}),
    /out of bounds/,
  );
});


test('El Toro package emits an atlas-only visual sheet for manual anchor verification', () => {
  const outDir=mkdtempSync(join(tmpdir(),'el-toro-anchor-visual-'));
  const result=buildElToroRightAtlasPackage({sourceDir,packageContractPath,outDir});
  const path=join(outDir,'right-anchor-review.svg');
  assert.equal(result.anchorReviewSvgPath,path);

  const svg=readFileSync(path,'utf8');
  assert.match(svg,/viewBox="0 0 1260 2760"/);
  assert.match(svg,/right-body\.png/);
  assert.equal(svg.includes('sprite-source/right'),false);
  assert.equal(svg.includes('__IMG-'),false);

  const frameIds=[...svg.matchAll(/data-frame-id="([^"]+)"/g)].map((match)=>match[1]);
  assert.equal(frameIds.length,84);
  assert.equal(new Set(frameIds).size,84);
  assert.equal((svg.match(/data-pivot="normalization-ground-pivot"/g) ?? []).length,84);

  for (const name of REQUIRED) {
    assert.equal(svg.includes('ANCHOR '+name),true,name);
  }
  assert.equal(svg.includes('data-anatomical-anchor='),false,'visual sheet must not fabricate anatomical anchor points');
});


test('verified El Toro anchor review is baked into every runtime frame without clearing unrelated gates', () => {
  const seedOut=mkdtempSync(join(tmpdir(),'el-toro-anchor-seed-'));
  const seed=buildElToroRightAtlasPackage({sourceDir,packageContractPath,outDir:seedOut});
  const review=JSON.parse(readFileSync(seed.anchorReviewPath,'utf8'));
  review.status='verified';
  for (const frame of review.frames) {
    frame.verified=true;
    const {width,height}=frame.atlasRect;
    frame.anchors={
      head:{x:width*0.5,y:height*0.15},
      chest:{x:width*0.5,y:height*0.38},
      frontHand:{x:width*0.75,y:height*0.43},
      backHand:{x:width*0.25,y:height*0.43},
      belt:{x:width*0.5,y:height*0.63},
      frontFoot:{x:width*0.66,y:height*0.96},
      backFoot:{x:width*0.34,y:height*0.96},
    };
  }
  assert.doesNotThrow(()=>assertVerifiedElToroAnchorReview(review));

  const reviewPath=join(seedOut,'verified-review-input.json');
  writeFileSync(reviewPath,JSON.stringify(review));

  const outDir=mkdtempSync(join(tmpdir(),'el-toro-anchor-applied-'));
  buildElToroRightAtlasPackage({
    sourceDir,
    packageContractPath,
    outDir,
    verifiedAnchorReviewPath:reviewPath,
  });

  const fragment=JSON.parse(readFileSync(join(outDir,'right-runtime-fragment.json'),'utf8'));
  assert.equal(fragment.blockingGates.includes('verified-attachment-anchors'),false);
  assert.equal(fragment.blockingGates.includes('authored-left-facing-animations'),true);
  assert.equal(fragment.blockingGates.includes('transition-clock-crouch-block-block-crouch'),false);
  assert.equal(fragment.runtimeLoadable,false);

  let count=0;
  for (const animation of Object.values(fragment.animations)) {
    for (const frame of animation.frames) {
      assert.deepEqual(Object.keys(frame.anchors),REQUIRED);
      for (const point of Object.values(frame.anchors)) {
        assert.ok(Number.isFinite(point.x) && Number.isFinite(point.y));
        assert.ok(point.x>=0 && point.x<=frame.width);
        assert.ok(point.y>=0 && point.y<=frame.height);
      }
      count+=1;
    }
  }
  assert.ok(count>84,'runtime aliases legitimately reuse some of the 84 packed frames');
});
