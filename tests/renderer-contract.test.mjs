import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const renderFiles = [
  'src/game/render/ChameleonRig.ts',
  'src/game/render/SupernarizRig.ts',
  'src/game/render/FightRenderer.ts',
  'src/game/render/FighterRenderer.ts',
  'src/game/render/CombatEffects.ts',
];

function read(file) {
  assert.equal(existsSync(file), true, `${file} must exist`);
  return readFileSync(file, 'utf8');
}

test('runtime fighter renderer stays procedural and reference-image free', () => {
  const source = renderFiles.map(read).join('\n');
  for (const banned of ['new Image(', 'drawImage(', '.png', '.jpg', '.jpeg', 'spritesheet']) {
    assert.equal(source.includes(banned), false, `renderer must not contain ${banned}`);
  }
  assert.match(source, /CanvasRenderingContext2D/);
  assert.match(source, /bezierCurveTo|quadraticCurveTo/);
});

test('V0.4 Coletazo has authored windup strike follow-through recovery and trail', () => {
  const effects = read('src/game/render/CombatEffects.ts');
  const chameleon = read('src/game/render/ChameleonRig.ts');
  const fight = read('src/game/render/FightRenderer.ts');

  for (const phase of ['windup', 'strike', 'followThrough', 'recovery', 'sweep', 'trail']) {
    assert.equal(effects.includes(phase), true, `Coletazo presentation missing ${phase}`);
  }
  assert.match(effects, /getColetazoPresentation/);
  assert.match(effects, /drawColetazoTrail/);
  assert.match(chameleon, /getColetazoPresentation/);
  assert.match(chameleon, /coletazo\.windup/);
  assert.match(chameleon, /coletazo\.strike/);
  assert.match(chameleon, /coletazo\.followThrough/);
  assert.match(fight, /fighter\.moveId !== 'coletazo'/);
  assert.match(fight, /tone: 'warm' \| 'cold' \| 'block' \| 'break' \| 'ultimate' \| 'tail'/);
});

test('V0.4 capture presentation is driven by capturedBy and clears with authoritative state', () => {
  const fight = read('src/game/render/FightRenderer.ts');
  assert.match(fight, /fighter\.capturedBy !== null/);
  assert.match(fight, /target\.capturedBy === attackerIndex/);
  assert.match(fight, /fighter\.ultimatePhase !== 'idle' \|\| fighter\.capturedBy !== null/);
  assert.match(fight, /this\.ultimateFlashes = \[\]/);
  assert.match(fight, /drawCapturedLock/);
});

test('V0.4 Ultimates include richer startup capture success and recovery presentation', () => {
  const fight = read('src/game/render/FightRenderer.ts');
  const fighter = read('src/game/render/FighterRenderer.ts');
  const chameleon = read('src/game/render/ChameleonRig.ts');
  const supernariz = read('src/game/render/SupernarizRig.ts');

  for (const effect of [
    'drawCaptureStartup',
    'drawCamaleoniVeil',
    'drawDashAfterimage',
    'drawCamaleoniSequenceCuts',
    'drawReappearanceFlash',
    'drawSupernarizInhalePulse',
    'drawSuctionField',
    'drawNazazoArc',
    'drawLaunchTrail',
  ]) assert.equal(fight.includes(effect), true, `missing ${effect}`);

  assert.match(fighter, /camaleoniUltimateAlpha/);
  assert.match(fighter, /fighter\.moveFrame \/ 9/);
  assert.match(chameleon, /vanishCoil/);
  assert.match(chameleon, /dashDrive/);
  assert.match(chameleon, /comboBeat/);
  assert.match(supernariz, /inhaleBrace/);
  assert.match(supernariz, /nazazoDrive/);
});

test('V0.4 transient effects remain bounded for mobile rendering', () => {
  const fight = read('src/game/render/FightRenderer.ts');
  assert.match(fight, /const maxParticles = 120/);
  assert.match(fight, /pushGuardFlashes\.length > 6/);
  assert.match(fight, /ultimateFlashes\.length > 6/);
});
