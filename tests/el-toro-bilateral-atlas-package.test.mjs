import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { parseRgbaPng } from '../scripts/sprite-png-alpha.mjs';
import {
  assertVerifiedElToroAnchorReview,
  buildElToroBilateralAtlasPackage,
} from '../scripts/el-toro-sprite-atlas-packer.mjs';

const rightSourceDir=resolve('docs/characters/el-toro/sprite-source/right');
const leftSourceDir=resolve('docs/characters/el-toro/sprite-source/left');
const packageContractPath=resolve('docs/characters/el-toro/sprite-package/right-package.json');
const REQUIRED=['head','chest','frontHand','backHand','belt','frontFoot','backFoot'];

function build(options={}) {
  const outDir=mkdtempSync(join(tmpdir(),'el-toro-bilateral-'));
  const result=buildElToroBilateralAtlasPackage({
    rightSourceDir,leftSourceDir,packageContractPath,outDir,...options,
  });
  return {outDir,result};
}

test('El Toro bilateral package packs 84 authored frames per facing in one non-mirrored atlas', () => {
  const {outDir,result}=build();
  assert.equal(result.body.sourceFrameCount,168);
  assert.equal(result.body.rightFrameCount,84);
  assert.equal(result.body.leftFrameCount,84);
  assert.equal(result.effects.sourceFrameCount,22);

  const body=parseRgbaPng(readFileSync(result.body.atlasPath));
  assert.equal(body.colorType,6);
  assert.ok(body.width>0 && body.width<=2048);
  assert.ok(body.height>0);

  const manifest=JSON.parse(readFileSync(join(outDir,'el-toro-animations.json'),'utf8'));
  assert.equal(manifest.version,1);
  assert.equal(manifest.atlas,'el-toro-body.png');
  assert.equal(manifest.mirrorSafe,false);
  assert.equal(Object.keys(manifest.animations).length,26);
  assert.deepEqual(Object.keys(manifest.leftAnimations).sort(),Object.keys(manifest.animations).sort());
  assert.equal(manifest.runtimeLoadable,false);
  assert.deepEqual(manifest.blockingGates,[
    'verified-right-attachment-anchors',
    'verified-left-attachment-anchors',
  ]);

  const rightRects=new Set();
  const leftRects=new Set();
  for (const animation of Object.values(manifest.animations)) {
    for (const frame of animation.frames) rightRects.add([frame.x,frame.y,frame.width,frame.height].join(':'));
  }
  for (const animation of Object.values(manifest.leftAnimations)) {
    for (const frame of animation.frames) leftRects.add([frame.x,frame.y,frame.width,frame.height].join(':'));
  }
  assert.equal(rightRects.size,84);
  assert.equal(leftRects.size,84);
  assert.equal([...rightRects].some((rect)=>leftRects.has(rect)),false,'authored LEFT must occupy its own atlas rects');

  const text=readFileSync(join(outDir,'el-toro-animations.json'),'utf8');
  assert.equal(text.includes('sprite-source/right'),false);
  assert.equal(text.includes('sprite-source/left'),false);
  assert.equal(text.includes('__IMG-'),false);
  assert.equal(text.includes('scaleX'),false);
});

test('bilateral package emits independent pending anchor review templates for both authored facings', () => {
  const {outDir,result}=build();
  assert.equal(result.rightAnchorReviewPath,join(outDir,'right-anchor-review.json'));
  assert.equal(result.leftAnchorReviewPath,join(outDir,'left-anchor-review.json'));

  const right=JSON.parse(readFileSync(result.rightAnchorReviewPath,'utf8'));
  const left=JSON.parse(readFileSync(result.leftAnchorReviewPath,'utf8'));
  for (const [review,facing] of [[right,'right'],[left,'left']]) {
    assert.equal(review.facing,facing);
    assert.equal(review.status,'pending-visual-verification');
    assert.equal(review.frames.length,84);
    assert.deepEqual(review.requiredAnchors,REQUIRED);
    assert.ok(review.frames.every((frame)=>REQUIRED.every((name)=>frame.anchors[name]===null)));
  }
  assert.throws(()=>assertVerifiedElToroAnchorReview(left,{expectedFacing:'left'}),/not verified/);
});

function verifyReview(path,facing) {
  const review=JSON.parse(readFileSync(path,'utf8'));
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
  assert.doesNotThrow(()=>assertVerifiedElToroAnchorReview(review,{expectedFacing:facing}));
  const verified=path.replace('.json','-verified.json');
  writeFileSync(verified,JSON.stringify(review));
  return verified;
}

test('bilateral manifest becomes runtime-loadable only when both facing anchor reviews are verified', () => {
  const seed=build();
  const rightVerified=verifyReview(seed.result.rightAnchorReviewPath,'right');
  const leftVerified=verifyReview(seed.result.leftAnchorReviewPath,'left');

  const loaded=build({
    rightVerifiedAnchorReviewPath:rightVerified,
    leftVerifiedAnchorReviewPath:leftVerified,
  });
  const manifest=JSON.parse(readFileSync(join(loaded.outDir,'el-toro-animations.json'),'utf8'));
  assert.equal(manifest.runtimeLoadable,true);
  assert.deepEqual(manifest.blockingGates,[]);

  for (const map of [manifest.animations,manifest.leftAnimations]) {
    for (const animation of Object.values(map)) {
      for (const frame of animation.frames) {
        assert.deepEqual(Object.keys(frame.anchors),REQUIRED);
      }
    }
  }
});


test('bilateral package is deterministic and reproducible through CLI', () => {
  const first=build();
  const second=build();
  assert.deepEqual(readFileSync(first.result.body.atlasPath),readFileSync(second.result.body.atlasPath));
  assert.deepEqual(readFileSync(first.result.effects.atlasPath),readFileSync(second.result.effects.atlasPath));
  assert.equal(
    readFileSync(first.result.manifestPath,'utf8'),
    readFileSync(second.result.manifestPath,'utf8'),
  );

  const outDir=mkdtempSync(join(tmpdir(),'el-toro-bilateral-cli-'));
  const run=spawnSync(process.execPath,[
    resolve('scripts/el-toro-sprite-atlas-packer.mjs'),
    '--source-dir',rightSourceDir,
    '--left-source-dir',leftSourceDir,
    '--package-contract',packageContractPath,
    '--out-dir',outDir,
  ],{encoding:'utf8'});
  assert.equal(run.status,0,run.stderr);
  const receipt=JSON.parse(run.stdout);
  assert.equal(receipt.fighterId,'el-toro');
  assert.equal(receipt.facing,'authored-bilateral');
  assert.equal(receipt.rightBodyFrames,84);
  assert.equal(receipt.leftBodyFrames,84);
  assert.equal(receipt.effectFrames,22);
  assert.equal(receipt.mirrorSafe,false);
  assert.equal(receipt.runtimeLoadable,false);
  assert.equal(receipt.manifest,'el-toro-animations.json');
  assert.equal(readFileSync(join(outDir,'el-toro-animations.json'),'utf8').length>0,true);
});
