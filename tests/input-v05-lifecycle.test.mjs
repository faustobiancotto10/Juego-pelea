import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

class FakeEventTarget {
  constructor() { this.listeners = new Map(); }
  addEventListener(type, handler) {
    const handlers = this.listeners.get(type) ?? new Set();
    handlers.add(handler);
    this.listeners.set(type, handlers);
  }
  removeEventListener(type, handler) {
    this.listeners.get(type)?.delete(handler);
  }
  fire(type, event = {}) {
    for (const handler of this.listeners.get(type) ?? []) handler(event);
  }
}

function createClassList() {
  const values = new Set();
  return {
    add(value) { values.add(value); },
    remove(value) { values.delete(value); },
    toggle(value, force) {
      if (force === true) values.add(value);
      else if (force === false) values.delete(value);
      else if (values.has(value)) values.delete(value);
      else values.add(value);
    },
    contains(value) { return values.has(value); },
  };
}

function createButton(action, { captureThrows = false } = {}) {
  const target = new FakeEventTarget();
  return Object.assign(target, {
    dataset: { action },
    disabled: false,
    classList: createClassList(),
    setPointerCapture() {
      if (captureThrows) throw new Error('capture failed');
    },
  });
}

function createDpad({ captureThrows = false } = {}) {
  const target = new FakeEventTarget();
  return Object.assign(target, {
    dataset: {},
    classList: createClassList(),
    setPointerCapture() {
      if (captureThrows) throw new Error('capture failed');
    },
    getBoundingClientRect() {
      return { left: 0, top: 0, width: 160, height: 160 };
    },
  });
}

function pointer(pointerId, clientX = 80, clientY = 80) {
  return { pointerId, clientX, clientY, preventDefault() {} };
}

async function createFixture(options = {}) {
  const { GameInput } = await import('../dist/game/input/GameInput.js');
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  const previousPerformance = globalThis.performance;

  const windowHarness = new FakeEventTarget();
  const documentHarness = new FakeEventTarget();
  documentHarness.hidden = false;

  globalThis.window = windowHarness;
  globalThis.document = documentHarness;
  globalThis.performance = { now: () => 1000 };

  const dpad = createDpad({ captureThrows: options.dpadCaptureThrows });
  const attack = createButton('attack', { captureThrows: options.actionCaptureThrows });
  const special = createButton('special');
  const jump = createButton('jump');
  const ultimate = createButton('ultimate');
  const buttons = [attack, special, jump, ultimate];
  const root = {
    querySelector(selector) { return selector === '[data-dpad]' ? dpad : null; },
    querySelectorAll(selector) { return selector === '[data-action]' ? buttons : []; },
  };
  const gameInput = new GameInput(root);

  const cleanup = () => {
    gameInput.destroy();
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
    if (previousPerformance === undefined) delete globalThis.performance;
    else globalThis.performance = previousPerformance;
  };

  return { GameInput, gameInput, root, dpad, attack, special, jump, ultimate, windowHarness, documentHarness, cleanup };
}

test('V0.5 D-pad ownership clears on lostpointercapture and whole input clears on blur', async () => {
  const h = await createFixture();
  try {
    h.dpad.fire('pointerdown', pointer(11, 145, 80));
    assert.equal(h.gameInput.getFrame().right, true);

    h.dpad.fire('lostpointercapture', pointer(11, 145, 80));
    assert.equal(h.gameInput.getFrame().right, false);

    h.dpad.fire('pointerdown', pointer(12, 10, 80));
    assert.equal(h.gameInput.getFrame().left, true);
    h.windowHarness.fire('blur');

    const neutral = h.gameInput.getFrame();
    assert.equal(neutral.left, false);
    assert.equal(neutral.right, false);
    assert.equal(neutral.attack, false);
    assert.equal(neutral.special, false);
    assert.equal(Boolean(neutral.ultimate), false);
  } finally {
    h.cleanup();
  }
});

test('V0.5 action ownership survives release from another pointer and ignores stray pointerup', async () => {
  const h = await createFixture();
  try {
    h.attack.fire('pointerdown', pointer(21));
    h.attack.fire('pointerdown', pointer(22));
    assert.equal(h.gameInput.getFrame().attack, true);

    h.attack.fire('pointerup', pointer(21));
    assert.equal(h.gameInput.getFrame().attack, true, 'second pointer still owns ATTACK');

    h.attack.fire('pointerup', pointer(999));
    assert.equal(h.gameInput.getFrame().attack, true, 'stray release cannot clear another pointer');

    h.attack.fire('pointerup', pointer(22));
    assert.equal(h.gameInput.getFrame().attack, false);
  } finally {
    h.cleanup();
  }
});

test('V0.5 reset is idempotent, clears queued Ultimate and neutralizes visual touch state', async () => {
  const h = await createFixture();
  try {
    h.dpad.fire('pointerdown', pointer(31, 145, 80));
    h.attack.fire('pointerdown', pointer(32));
    h.ultimate.fire('pointerdown', pointer(33));

    assert.equal(h.dpad.dataset.direction, 'r');
    assert.equal(h.attack.classList.contains('is-pressed'), true);

    h.gameInput.reset();
    h.gameInput.reset();

    const frame = h.gameInput.getFrame({ superReady: true, defensiveContext: false, nowMs: 1000 });
    assert.equal(frame.left, false);
    assert.equal(frame.right, false);
    assert.equal(frame.attack, false);
    assert.equal(frame.special, false);
    assert.equal(Boolean(frame.ultimate), false);
    assert.deepEqual(frame.commands ?? [], []);
    assert.equal(h.dpad.dataset.direction ?? '', '');
    assert.equal(h.attack.classList.contains('is-pressed'), false);
    assert.equal(h.ultimate.classList.contains('is-pressed'), false);
  } finally {
    h.cleanup();
  }
});

test('V0.5 lifecycle reset covers pagehide, hidden document and orientation suspension', async () => {
  const h = await createFixture();
  try {
    h.dpad.fire('pointerdown', pointer(41, 145, 80));
    assert.equal(h.gameInput.getFrame().right, true);
    h.windowHarness.fire('pagehide');
    assert.equal(h.gameInput.getFrame().right, false);

    h.special.fire('pointerdown', pointer(42));
    assert.equal(h.gameInput.getFrame().special, true);
    h.documentHarness.hidden = true;
    h.documentHarness.fire('visibilitychange');
    assert.equal(h.gameInput.getFrame().special, false);

    h.jump.fire('pointerdown', pointer(43));
    assert.equal(h.gameInput.getFrame().jump, true);
    h.windowHarness.fire('orientationchange');
    assert.equal(h.gameInput.getFrame().jump, false);
  } finally {
    h.cleanup();
  }
});

test('V0.5 pointer-capture failure leaves controls neutral rather than stuck', async () => {
  const action = await createFixture({ actionCaptureThrows: true });
  try {
    assert.doesNotThrow(() => action.attack.fire('pointerdown', pointer(51)));
    assert.equal(action.gameInput.getFrame().attack, false);
    assert.equal(action.attack.classList.contains('is-pressed'), false);
  } finally {
    action.cleanup();
  }

  const pad = await createFixture({ dpadCaptureThrows: true });
  try {
    assert.doesNotThrow(() => pad.dpad.fire('pointerdown', pointer(52, 145, 80)));
    assert.equal(pad.gameInput.getFrame().right, false);
    assert.equal(pad.dpad.dataset.direction ?? '', '');
  } finally {
    pad.cleanup();
  }
});

test('V0.5 destroy neutralizes state and a remounted GameInput starts clean', async () => {
  const h = await createFixture();
  try {
    h.attack.fire('pointerdown', pointer(61));
    h.dpad.fire('pointerdown', pointer(62, 145, 80));
    assert.equal(h.gameInput.getFrame().attack, true);
    assert.equal(h.gameInput.getFrame().right, true);

    h.gameInput.destroy();
    assert.equal(h.attack.classList.contains('is-pressed'), false);
    assert.equal(h.dpad.dataset.direction ?? '', '');

    const remounted = new h.GameInput(h.root);
    try {
      const clean = remounted.getFrame();
      assert.equal(clean.attack, false);
      assert.equal(clean.right, false);
      h.dpad.fire('pointerdown', pointer(63, 10, 80));
      assert.equal(remounted.getFrame().left, true);
    } finally {
      remounted.destroy();
    }
  } finally {
    h.cleanup();
  }
});

test('V0.5 scoped browser protections cover fight controls without disabling help/menu selection globally', async () => {
  const styles = await readFile(new URL('../src/styles.css', import.meta.url), 'utf8');
  assert.match(styles, /\.touch-layer[^{]*\{[^}]*user-select:\s*none/s);
  assert.match(styles, /\.touch-layer[^{]*\{[^}]*-webkit-user-select:\s*none/s);
  assert.match(styles, /\.touch-layer[^{]*\{[^}]*-webkit-touch-callout:\s*none/s);
  assert.match(styles, /\.touch-layer[^{]*\{[^}]*touch-action:\s*none/s);
  assert.doesNotMatch(styles, /(?:html|body|\*)\s*\{[^}]*user-select:\s*none/s);
});

test('V0.5 help suspension explicitly resets physical input before pausing and on resume', async () => {
  const app = await readFile(new URL('../src/game/ui/AppController.ts', import.meta.url), 'utf8');
  assert.match(app, /if \(pausesFight\)[\s\S]{0,120}this\.input\?\.reset\(\)[\s\S]{0,120}this\.paused = true/);
  assert.match(app, /this\.input\?\.reset\(\)[\s\S]{0,120}this\.paused = false/);
});
