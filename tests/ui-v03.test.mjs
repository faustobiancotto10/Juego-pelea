import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const appSource = await readFile(new URL('../src/game/ui/AppController.ts', import.meta.url), 'utf8');
const styles = await readFile(new URL('../src/styles.css', import.meta.url), 'utf8');

test('V0.3 HUD exposes SUPER for both fighters and a distinct ready state', () => {
  assert.match(appSource, /data-super=/);
  assert.match(appSource, /superMeter/);
  assert.match(appSource, /maxSuper/);
  assert.match(appSource, /superReady/);
  assert.match(styles, /\.super-track/);
  assert.match(styles, /\.is-ready/);
});

test('permanent mobile controls stay D-pad plus ATTACK, SPECIAL and JUMP', () => {
  assert.match(appSource, /data-dpad/);
  assert.match(appSource, /data-action="attack"/);
  assert.match(appSource, /data-action="special"/);
  assert.match(appSource, /data-action="jump"/);
  assert.doesNotMatch(appSource, /data-action="ultimate"/);
  assert.doesNotMatch(appSource, /data-action="pushGuard"/);
});

test('controls help explains Push Guard and the ATTACK + SPECIAL ultimate chord', () => {
  assert.match(appSource, /Push Guard/);
  assert.match(appSource, /ATTACK \+ SPECIAL/);
  assert.match(appSource, /Dash/);
  assert.match(appSource, /Backdash/);
});

test('SUPER first-ready hint is transient and Chorizo cooldown is rendered from snapshot state', () => {
  assert.match(appSource, /data-super-hint/);
  assert.match(appSource, /superReady/);
  assert.match(appSource, /projectileCooldown/);
  assert.match(styles, /\.super-hint/);
  assert.match(styles, /\.special-cooldown/);
});

test('V0.3 HUD and help remain safe-area aware and do not move combat truth into UI', () => {
  assert.match(styles, /safe-area-inset-top/);
  assert.match(styles, /safe-area-inset-left/);
  assert.match(styles, /safe-area-inset-right/);
  assert.doesNotMatch(appSource, /superMeter\s*[+\-*/]?=/);
  assert.doesNotMatch(appSource, /guard\s*-=|guard\s*=\s*Math/);
});
