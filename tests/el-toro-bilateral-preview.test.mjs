import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { buildElToroBilateralAtlasPackage } from '../scripts/el-toro-sprite-atlas-packer.mjs';

const rightSourceDir=resolve('docs/characters/el-toro/sprite-source/right');
const leftSourceDir=resolve('docs/characters/el-toro/sprite-source/left');
const packageContractPath=resolve('docs/characters/el-toro/sprite-package/right-package.json');

test('bilateral package emits atlas-only gameplay preview for both authored facings', () => {
  const outDir=mkdtempSync(join(tmpdir(),'el-toro-bilateral-preview-'));
  const result=buildElToroBilateralAtlasPackage({
    rightSourceDir,leftSourceDir,packageContractPath,outDir,
  });
  const path=join(outDir,'bilateral-gameplay-preview.svg');
  assert.equal(result.previewPath,path);
  const svg=readFileSync(path,'utf8');
  assert.match(svg,/viewBox="0 0 844 760"/);
  assert.match(svg,/el-toro-body\.png/);
  assert.equal(svg.includes('sprite-source/right'),false);
  assert.equal(svg.includes('sprite-source/left'),false);
  assert.equal((svg.match(/data-facing="right"/g) ?? []).length,6);
  assert.equal((svg.match(/data-facing="left"/g) ?? []).length,6);
  for (const key of ['idle','walk-forward','move:toroJab','move:topete','move:shawarmazoThrow','ultimate:superEructo:capture']) {
    assert.ok(svg.includes('data-animation="'+key+'"'),key);
  }
});

test('bilateral package emits independent atlas-only anchor sheets for RIGHT and LEFT', () => {
  const outDir=mkdtempSync(join(tmpdir(),'el-toro-bilateral-anchor-sheets-'));
  const result=buildElToroBilateralAtlasPackage({
    rightSourceDir,leftSourceDir,packageContractPath,outDir,
  });
  assert.equal(result.rightAnchorReviewSvgPath,join(outDir,'right-anchor-review.svg'));
  assert.equal(result.leftAnchorReviewSvgPath,join(outDir,'left-anchor-review.svg'));

  for (const [path,facing] of [
    [result.rightAnchorReviewSvgPath,'right'],
    [result.leftAnchorReviewSvgPath,'left'],
  ]) {
    const svg=readFileSync(path,'utf8');
    assert.match(svg,/viewBox="0 0 1260 2760"/);
    assert.match(svg,/el-toro-body\.png/);
    assert.equal(svg.includes('right-body.png'),false);
    const ids=[...svg.matchAll(/data-frame-id="([^"]+)"/g)].map((m)=>m[1]);
    assert.equal(ids.length,84,facing);
    assert.equal(new Set(ids).size,84,facing);
    assert.equal((svg.match(/data-pivot="normalization-ground-pivot"/g) ?? []).length,84,facing);
    assert.equal(svg.includes('data-anatomical-anchor='),false,facing);
  }
});
