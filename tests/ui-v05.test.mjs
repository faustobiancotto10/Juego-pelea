import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../src/game/ui/AppController.ts', import.meta.url), 'utf8');
const styles = await readFile(new URL('../src/styles.css', import.meta.url), 'utf8');
const readme = await readFile(new URL('../README.md', import.meta.url), 'utf8');

test('B2 released fighter selection derives from registry playableIds instead of a duplicated UI list', () => {
  assert.match(app, /DEFAULT_COMBAT_REGISTRY/);
  assert.match(app, /playableIds/);
  assert.doesNotMatch(app, /const FIGHTER_ORDER:\s*readonly FighterId\[\]\s*=\s*\['chameleon',\s*'supernariz'\]/);
});

test('B2 player-facing controls document ranged, close and grounded-low grammar plus dedicated desktop L', () => {
  assert.match(app, /Abajo \+ ATTACK/);
  assert.match(app, /Abajo \+ SPECIAL/);
  assert.match(app, /SPECIAL sin dirección|SPECIAL neutro|SPECIAL a distancia/);
  assert.match(app, /L \(teclado\)|Teclado:\s*L|L ultimate/i);
  assert.doesNotMatch(app, /J\s*\+\s*K|J\+K/);
  assert.doesNotMatch(app, /Lengua baja/);

  assert.match(readme, /Abajo \+ ATTACK/);
  assert.match(readme, /Abajo \+ SPECIAL/);
  assert.match(readme, /\bL\b.*Ultimate|Ultimate.*\bL\b/i);
});

test('B2 AppController wires GameInput lifecycle reset to CombatSimulation.resetInputState', () => {
  assert.match(app, /new GameInput\([\s\S]{0,220}onReset[\s\S]{0,180}simulation\.resetInputState\(\)/);
  assert.match(app, /this\.input\?\.reset\(\)/);
});

test('B2 landscape geometry keeps a central play lane at 667x375, 852x393 and 932x430 with safe areas', () => {
  assert.match(styles, /safe-area-inset-left/);
  assert.match(styles, /safe-area-inset-right/);
  assert.match(styles, /safe-area-inset-bottom/);
  assert.match(styles, /@media \(orientation:\s*portrait\)/);

  const clamp = (min, value, max) => Math.max(min, Math.min(value, max));
  for (const { width, safe } of [
    { width: 667, safe: 0 },
    { width: 852, safe: 59 },
    { width: 932, safe: 59 },
  ]) {
    const dpadSize = clamp(116, width * 0.18, 172);
    const clusterWidth = clamp(230, width * 0.33, 330);
    const left = Math.max(18, safe);
    const right = Math.max(16, safe);
    const clearLane = width - right - clusterWidth - (left + dpadSize);
    assert.ok(clearLane >= 180, `${width}px landscape central lane too narrow: ${clearLane.toFixed(1)}px`);
  }
});

test('B2 help remains a focused overlay rather than permanent playfield chrome', () => {
  assert.match(app, /data-controls-panel/);
  assert.match(app, /data-controls-close/);
  assert.match(styles, /\.controls-panel\s*\{[^}]*display:none/s);
  assert.match(styles, /\.controls-panel\.is-open\s*\{[^}]*display:grid/s);
});
