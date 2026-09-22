import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { buildElToroRightAtlasPackage } from '../scripts/el-toro-sprite-atlas-packer.mjs';

const sourceDir=resolve('docs/characters/el-toro/sprite-source/right');
const packageContractPath=resolve('docs/characters/el-toro/sprite-package/right-package.json');

test('El Toro right-facing package emits gameplay-scale atlas-only preview evidence', () => {
  const outDir=mkdtempSync(join(tmpdir(),'el-toro-right-preview-'));
  const result=buildElToroRightAtlasPackage({sourceDir,packageContractPath,outDir});
  const previewPath=join(outDir,'right-gameplay-preview.svg');
  assert.equal(result.previewPath,previewPath);

  const svg=readFileSync(previewPath,'utf8');
  assert.match(svg,/viewBox="0 0 844 390"/);
  assert.match(svg,/right-body\.png/);
  assert.equal(svg.includes('sprite-source/right'),false);
  assert.equal(svg.includes('__IMG-'),false);
  assert.equal(svg.includes('__FX-'),false);

  for (const label of ['IDLE','WALK','JAB ACTIVE','TOPETE PEAK','SHAWARMA RELEASE','SUPER ERUCTO']) {
    assert.equal(svg.includes(label),true,label);
  }

  const uses=[...svg.matchAll(/data-animation="([^"]+)"/g)].map((match)=>match[1]);
  assert.deepEqual(uses,[
    'idle',
    'walk-forward',
    'move:toroJab',
    'move:topete',
    'move:shawarmazoThrow',
    'ultimate:superEructo:capture',
  ]);
});
