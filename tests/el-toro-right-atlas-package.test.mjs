import test from 'node:test';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseRgbaPng } from '../scripts/sprite-png-alpha.mjs';
import { buildElToroRightAtlasPackage } from '../scripts/el-toro-sprite-atlas-packer.mjs';

const sourceDir=resolve('docs/characters/el-toro/sprite-source/right');
const packageContractPath=resolve('docs/characters/el-toro/sprite-package/right-package.json');

function build() {
  const outDir=mkdtempSync(join(tmpdir(),'el-toro-right-atlas-'));
  const result=buildElToroRightAtlasPackage({
    sourceDir,
    packageContractPath,
    outDir,
  });
  return {outDir,result};
}

test('V07-SPR-MB builds deterministic right-facing body and FX PNG atlases from MA pixel-isolated frames', () => {
  const {outDir,result}=build();
  assert.equal(result.body.sourceFrameCount,84);
  assert.equal(result.effects.sourceFrameCount,22);
  assert.equal(result.body.atlasPath,join(outDir,'right-body.png'));
  assert.equal(result.effects.atlasPath,join(outDir,'right-effects.png'));

  const body=parseRgbaPng(readFileSync(result.body.atlasPath));
  const effects=parseRgbaPng(readFileSync(result.effects.atlasPath));
  assert.equal(body.colorType,6);
  assert.equal(effects.colorType,6);
  assert.ok(body.width>0 && body.width<=2048);
  assert.ok(effects.width>0 && effects.width<=2048);
  assert.ok(body.height>0);
  assert.ok(effects.height>0);
  assert.equal(body.rgba.some((value,index)=>index%4===3 && value>0),true);
  assert.equal(effects.rgba.some((value,index)=>index%4===3 && value>0),true);

  assert.equal(result.body.frameRects.size,84);
  assert.equal(result.effects.frameRects.size,22);

  console.log('V07-SPR-MB atlas-evidence', JSON.stringify({
    body: {
      width: body.width,
      height: body.height,
      bytes: readFileSync(result.body.atlasPath).length,
      sha256: createHash('sha256').update(readFileSync(result.body.atlasPath)).digest('hex'),
    },
    effects: {
      width: effects.width,
      height: effects.height,
      bytes: readFileSync(result.effects.atlasPath).length,
      sha256: createHash('sha256').update(readFileSync(result.effects.atlasPath)).digest('hex'),
    },
  }));
});

test('right-facing runtime fragment covers all resolver keys and stays visibly non-loadable until authored LEFT exists', () => {
  const {outDir,result}=build();
  const fragment=JSON.parse(readFileSync(join(outDir,'right-runtime-fragment.json'),'utf8'));

  assert.equal(fragment.version,1);
  assert.equal(fragment.fighterId,'el-toro');
  assert.equal(fragment.facing,'right');
  assert.equal(fragment.atlas,'right-body.png');
  assert.equal(fragment.mirrorSafe,false);
  assert.equal(fragment.runtimeLoadable,false);
  assert.deepEqual(fragment.blockingGates,[
    'authored-left-facing-animations',
    'verified-attachment-anchors',
    'transition-clock-crouch-block-block-crouch',
  ]);
  assert.equal(Object.keys(fragment.animations).length,26);
  assert.equal(fragment.leftAnimationsRequired,true);
  assert.equal(fragment.leftAnimations,undefined);

  const seenRects=new Set();
  for (const [key,animation] of Object.entries(fragment.animations)) {
    assert.equal(typeof animation.loop,'boolean',key);
    assert.ok(animation.frames.length>=1,key);
    for (const frame of animation.frames) {
      assert.ok(Number.isInteger(frame.x) && frame.x>=0,key);
      assert.ok(Number.isInteger(frame.y) && frame.y>=0,key);
      assert.ok(Number.isInteger(frame.width) && frame.width>=1,key);
      assert.ok(Number.isInteger(frame.height) && frame.height>=1,key);
      assert.ok(frame.pivotX>0 && frame.pivotX<=frame.width,key);
      assert.ok(frame.pivotY>0 && frame.pivotY<=frame.height,key);
      assert.ok(Number.isInteger(frame.durationTicks) && frame.durationTicks>=1,key);
      seenRects.add([frame.x,frame.y,frame.width,frame.height].join(':'));
    }
  }
  assert.equal(seenRects.size,84,'animations should reference the complete 84-frame body atlas without creating extra rects');
});

test('atlas package is deterministic byte-for-byte and source sheets never appear as runtime assets', () => {
  const first=build();
  const second=build();
  assert.deepEqual(
    readFileSync(first.result.body.atlasPath),
    readFileSync(second.result.body.atlasPath),
  );
  assert.deepEqual(
    readFileSync(first.result.effects.atlasPath),
    readFileSync(second.result.effects.atlasPath),
  );
  assert.equal(
    readFileSync(join(first.outDir,'right-runtime-fragment.json'),'utf8'),
    readFileSync(join(second.outDir,'right-runtime-fragment.json'),'utf8'),
  );

  const text=readFileSync(join(first.outDir,'right-runtime-fragment.json'),'utf8');
  assert.equal(text.includes('sprite-source/right'),false);
  assert.equal(text.includes('__IMG-'),false);
  assert.equal(text.includes('__FX-'),false);
});


test('right-facing package emits deterministic decoded-memory metrics', () => {
  const {outDir,result}=build();
  const metricsPath=join(outDir,'right-package-metrics.json');
  assert.equal(result.metricsPath,metricsPath);
  const metrics=JSON.parse(readFileSync(metricsPath,'utf8'));

  assert.equal(metrics.body.frameCount,84);
  assert.equal(metrics.effects.frameCount,22);
  assert.equal(metrics.body.width,result.body.atlasWidth);
  assert.equal(metrics.body.height,result.body.atlasHeight);
  assert.equal(metrics.effects.width,result.effects.atlasWidth);
  assert.equal(metrics.effects.height,result.effects.atlasHeight);
  assert.equal(metrics.body.decodedRgbaBytes,metrics.body.width*metrics.body.height*4);
  assert.equal(metrics.effects.decodedRgbaBytes,metrics.effects.width*metrics.effects.height*4);
  assert.equal(
    metrics.combinedDecodedRgbaBytes,
    metrics.body.decodedRgbaBytes+metrics.effects.decodedRgbaBytes,
  );
  assert.deepEqual(metrics.previewViewport,{width:844,height:390});
  assert.equal(metrics.runtimeLoadsSourceSheets,false);
});

test('El Toro atlas packer CLI reproduces the right-facing package with a machine-readable receipt', () => {
  const outDir=mkdtempSync(join(tmpdir(),'el-toro-right-cli-'));
  const run=spawnSync(process.execPath,[
    resolve('scripts/el-toro-sprite-atlas-packer.mjs'),
    '--source-dir',sourceDir,
    '--package-contract',packageContractPath,
    '--out-dir',outDir,
  ],{encoding:'utf8'});
  assert.equal(run.status,0,run.stderr);
  const receipt=JSON.parse(run.stdout);
  assert.equal(receipt.fighterId,'el-toro');
  assert.equal(receipt.facing,'right');
  assert.equal(receipt.bodyFrames,84);
  assert.equal(receipt.effectFrames,22);
  assert.equal(receipt.runtimeLoadable,false);
  assert.equal(receipt.preview,'right-gameplay-preview.svg');
  assert.equal(readFileSync(join(outDir,'right-package-metrics.json'),'utf8').length>0,true);
});
