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


function createGameInputHarness(GameInput) {
  const listeners = new Map();
  const previousWindow = globalThis.window;
  globalThis.window = {
    addEventListener(type, handler) {
      const handlers = listeners.get(type) ?? new Set();
      handlers.add(handler);
      listeners.set(type, handlers);
    },
    removeEventListener(type, handler) {
      listeners.get(type)?.delete(handler);
    },
  };

  const root = {
    querySelector() { return null; },
    querySelectorAll() { return []; },
  };
  const input = new GameInput(root);
  const dispatchKey = (type, code) => {
    for (const handler of listeners.get(type) ?? []) {
      handler({ code, repeat: false, preventDefault() {} });
    }
  };
  const cleanup = () => {
    input.destroy();
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  };
  return { input, dispatchKey, cleanup };
}

test('GameInput keeps ATTACK/SPECIAL immediate while SUPER is not READY', async () => {
  const { GameInput } = await import('../dist/game/input/GameInput.js');
  const harness = createGameInputHarness(GameInput);
  try {
    harness.dispatchKey('keydown', 'KeyJ');
    const attack = harness.input.getFrame({ superReady: false, defensiveContext: false, nowMs: 1000 });
    assert.equal(attack.attack, true);
    assert.equal(attack.special, false);
    assert.equal(attack.ultimate, false);

    harness.dispatchKey('keyup', 'KeyJ');
    harness.dispatchKey('keydown', 'KeyK');
    const special = harness.input.getFrame({ superReady: false, defensiveContext: false, nowMs: 1016 });
    assert.equal(special.attack, false);
    assert.equal(special.special, true);
    assert.equal(special.pushGuard, false);
  } finally {
    harness.cleanup();
  }
});

test('GameInput READY chord emits one Ultimate and defensive SPECIAL emits exclusive Push Guard', async () => {
  const { GameInput } = await import('../dist/game/input/GameInput.js');
  const harness = createGameInputHarness(GameInput);
  try {
    harness.dispatchKey('keydown', 'KeyJ');
    const first = harness.input.getFrame({ superReady: true, defensiveContext: false, nowMs: 2000 });
    assert.equal(first.attack, false);
    assert.equal(first.special, false);
    assert.equal(first.ultimate, false);

    harness.dispatchKey('keydown', 'KeyK');
    const chord = harness.input.getFrame({ superReady: true, defensiveContext: false, nowMs: 2030 });
    assert.deepEqual(
      { attack: chord.attack, special: chord.special, ultimate: chord.ultimate, pushGuard: chord.pushGuard },
      { attack: false, special: false, ultimate: true, pushGuard: false },
    );

    harness.dispatchKey('keyup', 'KeyJ');
    harness.dispatchKey('keyup', 'KeyK');
    harness.input.getFrame({ superReady: true, defensiveContext: false, nowMs: 2046 });

    harness.dispatchKey('keydown', 'KeyK');
    const pushGuard = harness.input.getFrame({ superReady: false, defensiveContext: true, nowMs: 2062 });
    assert.deepEqual(
      { attack: pushGuard.attack, special: pushGuard.special, ultimate: pushGuard.ultimate, pushGuard: pushGuard.pushGuard },
      { attack: false, special: false, ultimate: false, pushGuard: true },
    );
  } finally {
    harness.cleanup();
  }
});


function createTouchButton(action) {
  const listeners = new Map();
  const classes = new Set();
  return {
    dataset: { action },
    disabled: false,
    classList: {
      add(name) { classes.add(name); },
      remove(name) { classes.delete(name); },
      contains(name) { return classes.has(name); },
    },
    addEventListener(type, handler) {
      const handlers = listeners.get(type) ?? new Set();
      handlers.add(handler);
      listeners.set(type, handlers);
    },
    removeEventListener(type, handler) {
      listeners.get(type)?.delete(handler);
    },
    setPointerCapture() {},
    dispatch(type, pointerId = 1) {
      for (const handler of listeners.get(type) ?? []) {
        handler({ pointerId, preventDefault() {} });
      }
    },
  };
}

function createTouchDpad() {
  const listeners = new Map();
  return {
    dataset: {},
    addEventListener(type, handler) {
      const handlers = listeners.get(type) ?? new Set();
      handlers.add(handler);
      listeners.set(type, handlers);
    },
    removeEventListener(type, handler) {
      listeners.get(type)?.delete(handler);
    },
    setPointerCapture() {},
    getBoundingClientRect() {
      return { left: 0, top: 0, width: 160, height: 160 };
    },
    dispatch(type, clientX, clientY, pointerId = 10) {
      for (const handler of listeners.get(type) ?? []) {
        handler({ pointerId, clientX, clientY, preventDefault() {} });
      }
    },
  };
}

function createTouchGameInputHarness(GameInput) {
  const listeners = new Map();
  const previousWindow = globalThis.window;
  const previousPerformance = globalThis.performance;
  globalThis.window = {
    addEventListener(type, handler) {
      const handlers = listeners.get(type) ?? new Set();
      handlers.add(handler);
      listeners.set(type, handlers);
    },
    removeEventListener(type, handler) {
      listeners.get(type)?.delete(handler);
    },
  };
  globalThis.performance = { now: () => 5000 };

  const dpad = createTouchDpad();
  const attack = createTouchButton('attack');
  const special = createTouchButton('special');
  const jump = createTouchButton('jump');
  const ultimate = createTouchButton('ultimate');
  const buttons = [attack, special, jump, ultimate];
  const root = {
    querySelector(selector) {
      return selector === '[data-dpad]' ? dpad : null;
    },
    querySelectorAll(selector) {
      return selector === '[data-action]' ? buttons : [];
    },
  };
  const input = new GameInput(root);
  const cleanup = () => {
    input.destroy();
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
    if (previousPerformance === undefined) delete globalThis.performance;
    else globalThis.performance = previousPerformance;
  };
  return { input, dpad, attack, special, jump, ultimate, cleanup };
}

test('V0.4 touch ULTIMATE emits one exclusive intent and does not repeat while held', async () => {
  const { GameInput } = await import('../dist/game/input/GameInput.js');
  const harness = createTouchGameInputHarness(GameInput);
  try {
    harness.ultimate.dispatch('pointerdown', 22);
    const first = harness.input.getFrame({ superReady: true, defensiveContext: false, nowMs: 5000 });
    assert.deepEqual(
      { attack: first.attack, special: first.special, ultimate: first.ultimate, pushGuard: first.pushGuard },
      { attack: false, special: false, ultimate: true, pushGuard: false },
    );

    const held = harness.input.getFrame({ superReady: true, defensiveContext: false, nowMs: 5016 });
    assert.equal(held.ultimate, false);
  } finally {
    harness.cleanup();
  }
});

test('V0.4 touch ULTIMATE can fire while D-pad movement stays held with another pointer', async () => {
  const { GameInput } = await import('../dist/game/input/GameInput.js');
  const harness = createTouchGameInputHarness(GameInput);
  try {
    harness.dpad.dispatch('pointerdown', 145, 80, 31);
    const moving = harness.input.getFrame({ superReady: true, defensiveContext: false, nowMs: 6000 });
    assert.equal(moving.right, true);

    harness.ultimate.dispatch('pointerdown', 32);
    const ultimate = harness.input.getFrame({ superReady: true, defensiveContext: false, nowMs: 6016 });
    assert.equal(ultimate.right, true);
    assert.equal(ultimate.ultimate, true);
    assert.equal(ultimate.attack, false);
    assert.equal(ultimate.special, false);

    harness.ultimate.dispatch('pointerup', 32);
    const after = harness.input.getFrame({ superReady: true, defensiveContext: false, nowMs: 6032 });
    assert.equal(after.right, true);
    assert.equal(after.ultimate, false);
  } finally {
    harness.cleanup();
  }
});

test('V0.4 touch ULTIMATE is inert before SUPER READY while keyboard chord compatibility remains', async () => {
  const { GameInput } = await import('../dist/game/input/GameInput.js');
  const harness = createTouchGameInputHarness(GameInput);
  try {
    harness.ultimate.dispatch('pointerdown', 40);
    const notReady = harness.input.getFrame({ superReady: false, defensiveContext: false, nowMs: 7000 });
    assert.equal(notReady.ultimate, false);
    assert.equal(notReady.attack, false);
    assert.equal(notReady.special, false);
  } finally {
    harness.cleanup();
  }
});
