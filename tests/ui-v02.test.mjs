import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const appSource = await readFile(new URL('../src/game/ui/AppController.ts', import.meta.url), 'utf8');
const styles = await readFile(new URL('../src/styles.css', import.meta.url), 'utf8');

test('V0.2 HUD exposes guard meters and a visible guard-break state', () => {
  assert.match(appSource, /data-guard=/);
  assert.match(appSource, /guardBreakFrames/);
  assert.match(styles, /\.guard-track/);
  assert.match(styles, /\.is-broken/);
});

test('controls help is available from selection and fight without replacing the game screen', () => {
  assert.match(appSource, /data-controls-button/);
  assert.match(appSource, /CONTROLES/);
  assert.match(appSource, /Doble atrás/);
  assert.match(appSource, /Bloquear consume GUARD/);
  assert.match(styles, /\.controls-panel/);
});

test('opening fight controls pauses simulation and first fight shows a transient combat hint', () => {
  assert.match(appSource, /this\.paused/);
  assert.match(appSource, /if \(!this\.paused\)/);
  assert.match(appSource, /combat-hint/);
  assert.match(appSource, /Atrás = retroceder \/ bloquear/);
});
