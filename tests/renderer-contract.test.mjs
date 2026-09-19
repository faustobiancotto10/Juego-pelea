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

test('runtime fighter renderer is procedural and does not load reference sprite images', () => {
  for (const file of renderFiles) assert.equal(existsSync(file), true, `${file} must exist`);
  const source = renderFiles.map((file) => readFileSync(file, 'utf8')).join('\n');
  for (const banned of ['new Image(', 'drawImage(', '.png', '.jpg', '.jpeg', 'spritesheet']) {
    assert.equal(source.includes(banned), false, `renderer must not contain ${banned}`);
  }
  assert.match(source, /CanvasRenderingContext2D/);
  assert.match(source, /bezierCurveTo|quadraticCurveTo/);
});

test('procedural rigs include authored air-attack and close-special pose handling', () => {
  const chameleon = readFileSync('src/game/render/ChameleonRig.ts', 'utf8');
  const supernariz = readFileSync('src/game/render/SupernarizRig.ts', 'utf8');
  assert.match(chameleon, /airClaw/);
  assert.match(chameleon, /coletazo/);
  assert.match(supernariz, /airNose/);
  assert.match(supernariz, /tramontana/);
});

test('V0.3 presentation consumes simulation-authored ultimate phases and events', () => {
  const fight = readFileSync('src/game/render/FightRenderer.ts', 'utf8');
  const fighter = readFileSync('src/game/render/FighterRenderer.ts', 'utf8');
  const chameleon = readFileSync('src/game/render/ChameleonRig.ts', 'utf8');
  const supernariz = readFileSync('src/game/render/SupernarizRig.ts', 'utf8');

  for (const effect of [
    'drawPushGuardBurst',
    'drawCamaleoniVeil',
    'drawDashAfterimage',
    'drawSuctionField',
    'drawNazazoArc',
    'drawLaunchTrail',
    'drawReappearanceFlash',
    'drawUltimateImpact',
  ]) assert.equal(fight.includes(effect), true, `missing ${effect}`);

  assert.equal(fight.includes("event.type === 'push-guard'"), true);
  assert.equal(fight.includes("event.type === 'ultimate-capture'"), true);
  assert.match(fighter, /ultimatePhase === 'capture'/);
  assert.match(chameleon, /ultimatePhase === 'startup'/);
  assert.match(chameleon, /ultimatePhase === 'sequence'/);
  assert.match(supernariz, /ultimatePhase === 'capture'/);
  assert.match(supernariz, /ultimatePhase === 'sequence'/);
});

test('V0.3 transient effects remain bounded for mobile rendering', () => {
  const fight = readFileSync('src/game/render/FightRenderer.ts', 'utf8');
  assert.match(fight, /const maxParticles = 120/);
  assert.match(fight, /pushGuardFlashes\.length > 6/);
  assert.match(fight, /ultimateFlashes\.length > 6/);
});
