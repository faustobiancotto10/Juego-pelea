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

test('double-tap tracker emits a dash only for two same-direction taps inside its window', async () => {
  const { DoubleTapTracker } = await import('../dist/game/input/doubleTap.js');
  const tracker = new DoubleTapTracker(230);
  assert.equal(tracker.tap('left', 1000), false);
  assert.equal(tracker.tap('left', 1180), true);
  assert.equal(tracker.tap('right', 1500), false);
  assert.equal(tracker.tap('right', 1800), false);
});


test('V0.3 action chord buffer emits one ultimate intent without leaking attack or special', async () => {
  const module = await import('../dist/game/input/GameInput.js');
  assert.equal(typeof module.ActionChordBuffer, 'function');
  const buffer = new module.ActionChordBuffer(90);

  assert.deepEqual(buffer.sample(false, false, 1000), { attack: false, special: false, ultimate: false });
  assert.deepEqual(buffer.sample(true, false, 1010), { attack: false, special: false, ultimate: false });
  assert.deepEqual(buffer.sample(true, true, 1050), { attack: false, special: false, ultimate: true });
  assert.deepEqual(buffer.sample(true, true, 1066), { attack: false, special: false, ultimate: false });
  assert.deepEqual(buffer.sample(false, false, 1080), { attack: false, special: false, ultimate: false });
});

test('V0.3 chord buffer preserves standalone actions after the tolerance window', async () => {
  const { ActionChordBuffer } = await import('../dist/game/input/GameInput.js');
  assert.equal(typeof ActionChordBuffer, 'function');
  const buffer = new ActionChordBuffer(90);

  buffer.sample(false, false, 2000);
  assert.deepEqual(buffer.sample(true, false, 2010), { attack: false, special: false, ultimate: false });
  assert.deepEqual(buffer.sample(true, false, 2105), { attack: true, special: false, ultimate: false });
});

test('V0.3 action priority routes defensive SPECIAL to Push Guard and gives Ultimate top priority', async () => {
  const module = await import('../dist/game/input/GameInput.js');
  assert.equal(typeof module.resolveActionButtons, 'function');

  assert.deepEqual(
    module.resolveActionButtons({ attack: true, special: true, ultimate: true }, true),
    { attack: false, special: false, ultimate: true, pushGuard: false },
  );
  assert.deepEqual(
    module.resolveActionButtons({ attack: false, special: true, ultimate: false }, true),
    { attack: false, special: false, ultimate: false, pushGuard: true },
  );
  assert.deepEqual(
    module.resolveActionButtons({ attack: true, special: true, ultimate: false }, true),
    { attack: false, special: false, ultimate: false, pushGuard: true },
  );
  assert.deepEqual(
    module.resolveActionButtons({ attack: false, special: true, ultimate: false }, false),
    { attack: false, special: true, ultimate: false, pushGuard: false },
  );
});


test('V0.3 chord buffer does not swallow quick standalone taps shorter than the chord window', async () => {
  const { ActionChordBuffer } = await import('../dist/game/input/GameInput.js');
  const attackBuffer = new ActionChordBuffer(90);

  attackBuffer.sample(false, false, 3000);
  assert.deepEqual(attackBuffer.sample(true, false, 3010), { attack: false, special: false, ultimate: false });
  assert.deepEqual(attackBuffer.sample(false, false, 3050), { attack: true, special: false, ultimate: false });
  assert.deepEqual(attackBuffer.sample(false, false, 3066), { attack: false, special: false, ultimate: false });

  const specialBuffer = new ActionChordBuffer(90);
  specialBuffer.sample(false, false, 4000);
  assert.deepEqual(specialBuffer.sample(false, true, 4010), { attack: false, special: false, ultimate: false });
  assert.deepEqual(specialBuffer.sample(false, false, 4050), { attack: false, special: true, ultimate: false });
});
