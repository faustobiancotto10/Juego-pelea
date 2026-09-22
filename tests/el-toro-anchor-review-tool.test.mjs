import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { buildElToroBilateralAtlasPackage } from '../scripts/el-toro-sprite-atlas-packer.mjs';

const rightSourceDir=resolve('docs/characters/el-toro/sprite-source/right');
const leftSourceDir=resolve('docs/characters/el-toro/sprite-source/left');
const packageContractPath=resolve('docs/characters/el-toro/sprite-package/right-package.json');

test('bilateral package emits a self-contained anchor review tool without fabricated anatomy', () => {
  const outDir=mkdtempSync(join(tmpdir(),'el-toro-anchor-tool-'));
  const result=buildElToroBilateralAtlasPackage({
    rightSourceDir,leftSourceDir,packageContractPath,outDir,
  });
  const path=join(outDir,'bilateral-anchor-review.html');
  assert.equal(result.anchorReviewToolPath,path);
  const html=readFileSync(path,'utf8');

  assert.match(html,/EL TORO — ANCHOR REVIEW/);
  assert.match(html,/el-toro-body\.png/);
  assert.equal(html.includes('sprite-source/right'),false);
  assert.equal(html.includes('sprite-source/left'),false);
  assert.equal(html.includes('data-anatomical-anchor='),false);

  for (const name of ['head','chest','frontHand','backHand','belt','frontFoot','backFoot']) {
    assert.equal(html.includes(name),true,name);
  }

  assert.match(html,/Copy previous frame/);
  assert.match(html,/Verify frame/);
  assert.match(html,/Export RIGHT JSON/);
  assert.match(html,/Export LEFT JSON/);
  assert.match(html,/verified:false/);
  assert.match(html,/anchors:\{head:null,chest:null,frontHand:null,backHand:null,belt:null,frontFoot:null,backFoot:null\}/);
});

test('anchor review tool never marks copied or edited coordinates verified automatically', () => {
  const outDir=mkdtempSync(join(tmpdir(),'el-toro-anchor-tool-policy-'));
  const result=buildElToroBilateralAtlasPackage({
    rightSourceDir,leftSourceDir,packageContractPath,outDir,
  });
  const html=readFileSync(result.anchorReviewToolPath,'utf8');
  assert.match(html,/current\.verified=false/);
  assert.match(html,/copyPrevious[\s\S]*current\.verified=false/);
  assert.match(html,/setAnchor[\s\S]*current\.verified=false/);
  assert.match(html,/verifyCurrent[\s\S]*current\.verified=true/);
});
