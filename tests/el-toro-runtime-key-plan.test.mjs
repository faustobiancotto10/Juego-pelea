import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { generateSpriteSourceEvidence } from '../scripts/el-toro-sprite-source-pipeline.mjs';
import { compileRuntimeFrameSourcePlan } from '../scripts/el-toro-sprite-package-builder.mjs';

const packageContract = JSON.parse(
  readFileSync(resolve('docs/characters/el-toro/sprite-package/right-package.json'), 'utf8'),
);

function normalizationManifest() {
  const outDir = mkdtempSync(join(tmpdir(), 'el-toro-runtime-plan-'));
  generateSpriteSourceEvidence({
    sourceDir: resolve('docs/characters/el-toro/sprite-source/right'),
    outDir,
  });
  return JSON.parse(readFileSync(join(outDir, 'NORMALIZATION_MANIFEST.json'), 'utf8'));
}

test('El Toro runtime source plan covers every resolver-reachable right-facing key', () => {
  const manifest = normalizationManifest();
  const plan = compileRuntimeFrameSourcePlan(packageContract, manifest);

  const expectedKeys = [
    'block',
    'block-crouch',
    'captured',
    'crouch',
    'dash-back',
    'dash-forward',
    'guard-break',
    'hurt',
    'idle',
    'jump-apex',
    'jump-ascent',
    'jump-descent',
    'jump-startup',
    'knockdown',
    'land',
    'move:shawarmazoThrow',
    'move:topete',
    'move:toroAir',
    'move:toroJab',
    'move:toroLow',
    'move:toroShoulder',
    'ultimate:superEructo:capture',
    'ultimate:superEructo:recovery',
    'ultimate:superEructo:startup',
    'walk-back',
    'walk-forward',
  ].sort();

  assert.deepEqual(Object.keys(plan.animations).sort(), expectedKeys);
  assert.equal(plan.animations['move:superEructo'], undefined);
  assert.equal(plan.animations['ultimate:superEructo:sequence'], undefined);
});

test('El Toro runtime source plan references only admitted MA frames and uses explicit clock policy', () => {
  const manifest = normalizationManifest();
  const plan = compileRuntimeFrameSourcePlan(packageContract, manifest);
  const admitted = new Set(manifest.frames.map((frame) => frame.frameId));

  for (const [key, animation] of Object.entries(plan.animations)) {
    assert.ok(animation.sourceFrameIds.length > 0, `${key} must reference source frames`);
    for (const frameId of animation.sourceFrameIds) {
      assert.equal(admitted.has(frameId), true, `${key} references unknown frame ${frameId}`);
    }

    if (key.startsWith('move:')) {
      assert.equal(animation.clockPolicy, 'moveFrame');
      assert.equal(animation.loop, false);
      assert.equal(animation.durationTicks.length, animation.sourceFrameIds.length);
    } else if (key.startsWith('ultimate:')) {
      assert.equal(animation.clockPolicy, 'ultimatePhaseFrame');
      assert.equal(animation.loop, false);
      assert.equal(animation.durationTicks.length, animation.sourceFrameIds.length);
    } else if (animation.loop) {
      assert.equal(animation.clockPolicy, 'ambient-loop');
      assert.equal(animation.durationTicks, null);
    } else {
      assert.equal(animation.clockPolicy, 'presentation-state-entry-age');
      assert.equal(animation.durationTicks, null);
    }
  }
});
