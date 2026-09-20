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

test('V0.4 touch ULTIMATE surface still emits one queued edge and does not repeat while held', async () => {
  const { GameInput } = await import('../dist/game/input/GameInput.js');
  const harness = createTouchGameInputHarness(GameInput);
  try {
    harness.ultimate.dispatch('pointerdown', 22);
    const first = harness.input.getFrame({ superReady: true, defensiveContext: false, nowMs: 5000 });
    assert.deepEqual((first.commands ?? []).map((command) => command.action), ['ultimate']);

    const held = harness.input.getFrame({ superReady: true, defensiveContext: false, nowMs: 5016 });
    assert.deepEqual(held.commands ?? [], []);
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
    assert.deepEqual((ultimate.commands ?? []).map((command) => command.action), ['ultimate']);

    harness.ultimate.dispatch('pointerup', 32);
    const after = harness.input.getFrame({ superReady: true, defensiveContext: false, nowMs: 6032 });
    assert.equal(after.right, true);
    assert.deepEqual(after.commands ?? [], []);
  } finally {
    harness.cleanup();
  }
});

test('V0.5 touch ULTIMATE edge is meter-agnostic and leaves legality to simulation', async () => {
  const { GameInput } = await import('../dist/game/input/GameInput.js');
  const harness = createTouchGameInputHarness(GameInput);
  try {
    harness.ultimate.dispatch('pointerdown', 40);
    const notReady = harness.input.getFrame({ superReady: false, defensiveContext: false, nowMs: 7000 });
    assert.deepEqual((notReady.commands ?? []).map((command) => command.action), ['ultimate']);
  } finally {
    harness.cleanup();
  }
});
