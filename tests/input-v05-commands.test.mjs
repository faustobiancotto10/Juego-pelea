import test from 'node:test';
import assert from 'node:assert/strict';
import { CombatSimulation } from '../dist/game/simulation/CombatSimulation.js';
import { EMPTY_INPUT as E } from '../dist/game/types.js';

class FakeEventTarget {
  constructor() { this.listeners = new Map(); }
  addEventListener(type, handler) {
    const handlers = this.listeners.get(type) ?? new Set();
    handlers.add(handler);
    this.listeners.set(type, handlers);
  }
  removeEventListener(type, handler) { this.listeners.get(type)?.delete(handler); }
  fire(type, event = {}) {
    for (const handler of this.listeners.get(type) ?? []) handler(event);
  }
}

function classList() {
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

function button(action) {
  const target = new FakeEventTarget();
  return Object.assign(target, {
    dataset: { action },
    disabled: false,
    classList: classList(),
    setPointerCapture() {},
  });
}

function dpad() {
  const target = new FakeEventTarget();
  return Object.assign(target, {
    dataset: {},
    classList: classList(),
    setPointerCapture() {},
    getBoundingClientRect() { return { left: 0, top: 0, width: 160, height: 160 }; },
  });
}

function pointer(pointerId, clientX = 80, clientY = 80) {
  return { pointerId, clientX, clientY, preventDefault() {} };
}

async function fixture(options = {}) {
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

  const pad = dpad();
  const attack = button('attack');
  const special = button('special');
  const jump = button('jump');
  const ultimate = button('ultimate');
  const buttons = [attack, special, jump, ultimate];
  const root = {
    querySelector(selector) { return selector === '[data-dpad]' ? pad : null; },
    querySelectorAll(selector) { return selector === '[data-action]' ? buttons : []; },
  };
  const input = new GameInput(root, options);

  const dispatchKey = (type, code, repeat = false) => {
    windowHarness.fire(type, { code, repeat, preventDefault() {} });
  };
  const tap = (target, pointerId) => {
    target.fire('pointerdown', pointer(pointerId));
    target.fire('pointerup', pointer(pointerId));
  };
  const cleanup = () => {
    input.destroy();
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
    if (previousPerformance === undefined) delete globalThis.performance;
    else globalThis.performance = previousPerformance;
  };
  return { input, pad, attack, special, jump, ultimate, windowHarness, dispatchKey, tap, cleanup };
}

function actions(frame) {
  return (frame.commands ?? []).map((command) => command.action);
}

test('B2 press and release between samples survives exactly once through GameInput into simulation', async () => {
  const h = await fixture();
  try {
    h.tap(h.attack, 1);
    const frame = h.input.getFrame({ superReady: false, defensiveContext: false, nowMs: 1000 });
    assert.deepEqual(actions(frame), ['attack']);

    const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
    const snap = sim.step(frame, E);
    assert.equal(snap.fighters[0].moveId, 'claw1');

    assert.deepEqual(h.input.getFrame().commands ?? [], []);
  } finally {
    h.cleanup();
  }
});

test('B2 queued edge pressed during hitstop survives once and does not ghost-repeat', async () => {
  const h = await fixture();
  try {
    const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
    sim.hitstopFrames = 2;

    h.tap(h.attack, 2);
    let frame = h.input.getFrame();
    assert.deepEqual(actions(frame), ['attack']);
    let snap = sim.step(frame, E);
    assert.equal(snap.fighters[0].moveId, null);

    frame = h.input.getFrame();
    assert.deepEqual(frame.commands ?? [], []);
    sim.step(frame, E);
    snap = sim.step(h.input.getFrame(), E);
    assert.equal(snap.fighters[0].moveId, 'claw1');

    for (let i = 0; i < 24; i += 1) snap = sim.step(h.input.getFrame(), E);
    assert.notEqual(snap.fighters[0].moveId, 'claw2', 'one physical edge cannot repeat into a chain');
  } finally {
    h.cleanup();
  }
});

test('B2 command captures direction at press time with four-sample down grace', async () => {
  const h = await fixture();
  try {
    h.pad.fire('pointerdown', pointer(10, 136, 136));
    let frame = h.input.getFrame();
    assert.equal(frame.down, true);
    assert.equal(frame.right, true);

    h.pad.fire('pointermove', pointer(10, 145, 80));
    h.tap(h.special, 11);
    frame = h.input.getFrame();
    assert.equal(frame.commands?.[0]?.action, 'special');
    assert.deepEqual(frame.commands?.[0]?.direction, { left: false, right: true, up: false, down: true });

    for (let i = 0; i < 4; i += 1) h.input.getFrame();
    h.tap(h.special, 12);
    frame = h.input.getFrame();
    assert.deepEqual(frame.commands?.[0]?.direction, { left: false, right: true, up: false, down: false });

    h.pad.fire('pointermove', pointer(10, 80, 10));
    h.tap(h.special, 13);
    frame = h.input.getFrame();
    assert.equal(frame.commands?.[0]?.direction.up, true);
    assert.equal(frame.commands?.[0]?.direction.down, false);
  } finally {
    h.cleanup();
  }
});

test('B2 SPECIAL is classified at ingestion so stale held Special never becomes Push Guard later', async () => {
  const h = await fixture();
  try {
    h.input.getFrame({ superReady: false, defensiveContext: true, nowMs: 1000 });
    h.tap(h.special, 20);
    let frame = h.input.getFrame({ superReady: false, defensiveContext: false, nowMs: 1016 });
    assert.deepEqual(actions(frame), ['pushGuard']);

    h.input.getFrame({ superReady: false, defensiveContext: false, nowMs: 1032 });
    h.special.fire('pointerdown', pointer(21));
    frame = h.input.getFrame({ superReady: false, defensiveContext: true, nowMs: 1048 });
    assert.deepEqual(actions(frame), ['special']);
    assert.deepEqual(h.input.getFrame({ superReady: false, defensiveContext: true, nowMs: 1064 }).commands ?? [], []);
    h.special.fire('pointerup', pointer(21));
  } finally {
    h.cleanup();
  }
});

test('B2 same-sample Ultimate outranks Push Guard through the authoritative simulation', async () => {
  const h = await fixture();
  try {
    h.input.getFrame({ superReady: true, defensiveContext: true, nowMs: 1000 });
    h.tap(h.special, 30);
    h.tap(h.ultimate, 31);
    const frame = h.input.getFrame({ superReady: true, defensiveContext: true, nowMs: 1016 });
    assert.ok(actions(frame).includes('pushGuard'));
    assert.ok(actions(frame).includes('ultimate'));

    const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true, initialSuper: [100, 0] });
    const snap = sim.step(frame, E);
    assert.equal(snap.fighters[0].ultimatePhase, 'startup');
    assert.equal(snap.fighters[0].moveId, 'ultimateCamaleoni');
  } finally {
    h.cleanup();
  }
});

test('B2 desktop J and K remain immediate separate edges while L is the only dedicated Ultimate key', async () => {
  const h = await fixture();
  try {
    h.dispatchKey('keydown', 'KeyJ');
    h.dispatchKey('keydown', 'KeyK');
    let frame = h.input.getFrame({ superReady: true, defensiveContext: false, nowMs: 1000 });
    assert.deepEqual(actions(frame), ['attack', 'special']);
    assert.equal(Boolean(frame.ultimate), false);

    h.dispatchKey('keyup', 'KeyJ');
    h.dispatchKey('keyup', 'KeyK');
    h.input.getFrame();

    h.dispatchKey('keydown', 'KeyL');
    h.dispatchKey('keyup', 'KeyL');
    frame = h.input.getFrame({ superReady: false, defensiveContext: false, nowMs: 1016 });
    assert.deepEqual(actions(frame), ['ultimate']);

    const noMeter = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
    assert.equal(noMeter.step(frame, E).fighters[0].ultimatePhase, 'idle');

    const ready = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true, initialSuper: [100, 0] });
    assert.equal(ready.step(frame, E).fighters[0].ultimatePhase, 'startup');
  } finally {
    h.cleanup();
  }
});

test('B2 DOM queue is bounded to newest eight edges and drains at most four per sample', async () => {
  const h = await fixture();
  try {
    h.pad.fire('pointerdown', pointer(90, 10, 80));
    h.tap(h.attack, 100);
    h.tap(h.attack, 101);

    h.pad.fire('pointermove', pointer(90, 145, 80));
    for (let i = 0; i < 8; i += 1) h.tap(h.attack, 110 + i);

    const first = h.input.getFrame();
    assert.equal(first.commands?.length, 4);
    assert.ok(first.commands.every((command) => command.direction.right && !command.direction.left));

    const second = h.input.getFrame();
    assert.equal(second.commands?.length, 4);
    assert.ok(second.commands.every((command) => command.direction.right && !command.direction.left));

    assert.deepEqual(h.input.getFrame().commands ?? [], []);
  } finally {
    h.cleanup();
  }
});

test('B2 lifecycle reset callback clears simulation pending commands without stepping combat', async () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  sim.fighters[0].stunFrames = 2;
  const h = await fixture({ onReset: () => sim.resetInputState() });
  try {
    h.tap(h.attack, 200);
    sim.step(h.input.getFrame(), E);
    const tickBeforeReset = sim.getSnapshot().combatTick;

    h.windowHarness.fire('blur');
    assert.equal(sim.getSnapshot().combatTick, tickBeforeReset, 'reset handshake must not advance combat');

    let snap = sim.getSnapshot();
    for (let i = 0; i < 5; i += 1) snap = sim.step(h.input.getFrame(), E);
    assert.equal(snap.fighters[0].moveId, null, 'queued pre-suspension command must not execute after reset');
  } finally {
    h.cleanup();
  }
});
