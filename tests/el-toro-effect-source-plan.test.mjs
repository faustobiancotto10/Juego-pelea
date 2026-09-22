import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { generateSpriteSourceEvidence } from '../scripts/el-toro-sprite-source-pipeline.mjs';
import { compileEffectFrameSourcePlan } from '../scripts/el-toro-sprite-package-builder.mjs';

const packageContract = JSON.parse(
  readFileSync(resolve('docs/characters/el-toro/sprite-package/right-package.json'), 'utf8'),
);

function normalizationManifest() {
  const outDir = mkdtempSync(join(tmpdir(), 'el-toro-effect-plan-'));
  generateSpriteSourceEvidence({
    sourceDir: resolve('docs/characters/el-toro/sprite-source/right'),
    outDir,
  });
  return JSON.parse(readFileSync(join(outDir, 'NORMALIZATION_MANIFEST.json'), 'utf8'));
}

test('El Toro effect package plan preserves all 22 admitted FX frames outside the body atlas', () => {
  assert.deepEqual(packageContract.effectPackagePlan, {
    runtimeIntegration: 'package-ready-effect-router-deferred',
    effects: {
      'topete-impact': {
        sourceId: 'FX-01',
        loop: false,
        clockPolicy: 'event-age',
        routingRequirement: 'topete-contact-event',
      },
      'shawarmazo-projectile': {
        sourceId: 'FX-02',
        loop: true,
        clockPolicy: 'projectile-age',
        routingRequirement: 'toroShawarma-projectile-visual',
      },
      'shawarmazo-impact': {
        sourceId: 'FX-03',
        loop: false,
        clockPolicy: 'event-age',
        routingRequirement: 'toroShawarma-impact-event',
      },
      'super-eructo-effect': {
        sourceId: 'FX-04',
        loop: false,
        clockPolicy: 'ultimatePhaseFrame',
        routingRequirement: 'superEructo-forwardBlast-capture-phase',
        frameDurations: [3, 3, 3, 3, 3, 3],
      },
    },
  });

  const plan = compileEffectFrameSourcePlan(packageContract, normalizationManifest());
  assert.equal(Object.keys(plan.effects).length, 4);
  assert.equal(
    Object.values(plan.effects).reduce((sum, effect) => sum + effect.sourceFrameIds.length, 0),
    22,
  );

  const unique = new Set(Object.values(plan.effects).flatMap((effect) => effect.sourceFrameIds));
  assert.equal(unique.size, 22);
  assert.equal([...unique].every((frameId) => frameId.startsWith('FX-')), true);
  assert.equal(plan.runtimeIntegration, 'package-ready-effect-router-deferred');
});
