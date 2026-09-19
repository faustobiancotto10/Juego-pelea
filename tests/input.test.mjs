import test from 'node:test';
import assert from 'node:assert/strict';
import { directionFromPoint, composeInputFrame } from '../dist/game/input/dpad.js';

test('8-way d-pad resolves cardinal and diagonal sectors with a dead zone', () => {
  assert.deepEqual(directionFromPoint(0, 0, 80, 18), { left: false, right: false, up: false, down: false });
  assert.deepEqual(directionFromPoint(70, 0, 80, 18), { left: false, right: true, up: false, down: false });
  assert.deepEqual(directionFromPoint(-65, 0, 80, 18), { left: true, right: false, up: false, down: false });
  assert.deepEqual(directionFromPoint(0, 68, 80, 18), { left: false, right: false, up: false, down: true });
  assert.deepEqual(directionFromPoint(56, 56, 80, 18), { left: false, right: true, up: false, down: true });
  assert.deepEqual(directionFromPoint(-56, -56, 80, 18), { left: true, right: false, up: true, down: false });
});

test('touch action composition keeps jump separate and preserves down+special', () => {
  const downSpecial = composeInputFrame({ down: true }, { special: true });
  assert.equal(downSpecial.down, true);
  assert.equal(downSpecial.special, true);
  assert.equal(downSpecial.jump, false);

  const jump = composeInputFrame({ up: true }, { jump: true });
  assert.equal(jump.up, true);
  assert.equal(jump.jump, true);
});

test('desktop mapping uses W/Space for jump and J/K for combat actions', async () => {
  const { inputFromKeyboard } = await import('../dist/game/input/keyboard.js');
  const frame = inputFromKeyboard(new Set(['KeyA', 'KeyS', 'KeyJ', 'KeyK', 'Space']));
  assert.equal(frame.left, true);
  assert.equal(frame.down, true);
  assert.equal(frame.attack, true);
  assert.equal(frame.special, true);
  assert.equal(frame.jump, true);
  assert.equal(frame.right, false);
});
