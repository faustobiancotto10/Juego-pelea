import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const appSource = await readFile(new URL('../src/game/ui/AppController.ts', import.meta.url), 'utf8');
const styles = await readFile(new URL('../src/styles.css', import.meta.url), 'utf8');

test('V0.4 mobile fight UI adds one dedicated ULTIMATE touch action', () => {
  assert.match(appSource, /data-action="ultimate"/);
  assert.match(appSource, /action-button--ultimate/);
  assert.match(appSource, />ULTIMATE</);
  assert.doesNotMatch(appSource, /data-action="pushGuard"/);
});

test('V0.4 ULTIMATE button exposes disabled and READY presentation from superReady snapshot state', () => {
  assert.match(appSource, /data-ultimate-button/);
  assert.match(appSource, /ultimateButton\.disabled\s*=\s*!snapshot\.fighters\[0\]\.superReady/);
  assert.match(appSource, /classList\.toggle\('is-ready',\s*snapshot\.fighters\[0\]\.superReady\)/);
  assert.match(styles, /\.action-button--ultimate/);
  assert.match(styles, /\.action-button--ultimate\.is-ready/);
  assert.match(styles, /\.action-button--ultimate:disabled/);
});

test('V0.4 help and first-ready hint describe touch ULTIMATE while preserving keyboard J+K fallback', () => {
  assert.match(appSource, /ULTIMATE/);
  assert.match(appSource, /Touch[^<]*ULTIMATE|ULTIMATE[^<]*Touch/);
  assert.match(appSource, /J\s*\+\s*K|J\+K/);
  assert.doesNotMatch(appSource, /<b>ATTACK \+ SPECIAL<\/b><span>Ultimate/);
  assert.match(appSource, /data-super-hint/);
});

test('V0.4 touch cluster keeps safe-area anchoring and compact mobile-landscape layout', () => {
  assert.match(styles, /\.action-cluster/);
  assert.match(styles, /safe-area-inset-right/);
  assert.match(styles, /safe-area-inset-bottom/);
  assert.match(styles, /@media \(max-height:520px\)/);
  assert.match(styles, /action-button--ultimate/);
});
