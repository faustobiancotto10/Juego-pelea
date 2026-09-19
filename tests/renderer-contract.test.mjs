import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const renderFiles = [
  'src/game/render/ChameleonRig.ts',
  'src/game/render/SupernarizRig.ts',
  'src/game/render/FightRenderer.ts',
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

test('procedural rigs include authored air-attack pose handling', () => {
  const chameleon = readFileSync('src/game/render/ChameleonRig.ts', 'utf8');
  const supernariz = readFileSync('src/game/render/SupernarizRig.ts', 'utf8');
  assert.match(chameleon, /airClaw/);
  assert.match(supernariz, /airNose/);
});
