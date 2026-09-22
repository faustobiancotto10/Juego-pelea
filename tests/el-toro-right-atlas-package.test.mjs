import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
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
  assert.equal(body.data.some((value,index)=>index%4===3 && value>0),true);
  assert.equal(effects.data.some((value,index)=>index%4===3 && value>0),true);

  assert.equal(result.body.frameRects.size,84);
  assert.equal(result.effects.frameRects.size,22);
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
  assert.equal(fragment.blockedOn,'authored-left-facing-animations-and-verified-anchors');
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
