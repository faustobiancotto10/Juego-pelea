import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CombatSimulation } from '../dist/game/simulation/CombatSimulation.js';
import { CpuController } from '../dist/game/simulation/CpuController.js';
import { getMoveDefinition } from '../dist/game/simulation/moves.js';
import { FIGHTERS } from '../dist/game/data/fighters.js';
import { EMPTY_INPUT } from '../dist/game/types.js';

const input = (patch = {}) => ({ ...EMPTY_INPUT, ...patch });

function mutableSnapshot(sim) {
  return structuredClone(sim.getSnapshot());
}

function stepN(sim, frames, p1 = EMPTY_INPUT, p2 = EMPTY_INPUT) {
  let snap = sim.getSnapshot();
  for (let i = 0; i < frames; i += 1) snap = sim.step(p1, p2);
  return snap;
}

test('Supernariz CPU post-commit punish gap persists across multiple decision frames', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  const cpu = new CpuController(1);

  const committed = mutableSnapshot(sim);
  committed.frame = 100;
  committed.fighters[0].x = 590;
  committed.fighters[1].x = 680;
  committed.fighters[1].moveId = 'nose3';
  committed.fighters[1].moveFrame = 25;
  cpu.nextInput(committed);

  for (let frame = 101; frame <= 110; frame += 1) {
    const idle = structuredClone(committed);
    idle.frame = frame;
    idle.fighters[1].moveId = null;
    idle.fighters[1].moveFrame = 0;
    const action = cpu.nextInput(idle);
    assert.equal(action.attack, false, `frame ${frame}: no immediate pressure restart`);
    assert.equal(action.special, false, `frame ${frame}: no immediate special punish denial`);
    assert.equal(Boolean(action.pushGuard), false, `frame ${frame}: no frame-perfect defensive conversion`);
    assert.equal(action.jump, false);
  }
});

test('Supernariz CPU remains deterministic but intentionally misses legal chain confirms', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  const nose1 = [];
  const nose2 = [];

  for (let frame = 40; frame < 64; frame += 1) {
    const base = mutableSnapshot(sim);
    base.frame = frame;
    base.fighters[0].x = 590;
    base.fighters[1].x = 680;
    base.fighters[1].moveFrame = 11;

    const a = structuredClone(base);
    a.fighters[1].moveId = 'nose1';
    nose1.push(new CpuController(1).nextInput(a).attack);

    const b = structuredClone(base);
    b.fighters[1].moveId = 'nose2';
    nose2.push(new CpuController(1).nextInput(b).attack);
  }

  for (const decisions of [nose1, nose2]) {
    assert.ok(decisions.some(Boolean), 'CPU should still convert some pressure');
    assert.ok(decisions.some((value) => !value), 'CPU must deliberately miss some confirms');
  }
});

test('CPU implementation is snapshot-only and does not import the human input layer', async () => {
  const source = await readFile(new URL('../src/game/simulation/CpuController.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /GameInput|keyboard|pointer|touch|playerInput|rawInput|futureInput/i);
  assert.match(source, /nextInput\(snapshot: MatchSnapshot\)/);
});

test('Camaleoni gains practical close contest without strict first-button dominance', () => {
  const claw1 = getMoveDefinition('chameleon', 'claw1');
  const nose1 = getMoveDefinition('supernariz', 'nose1');
  const coletazo = getMoveDefinition('chameleon', 'coletazo');

  const clawReach = claw1.hitbox.offsetX + claw1.hitbox.width;
  const noseReach = nose1.hitbox.offsetX + nose1.hitbox.width;

  assert.ok(claw1.hitbox.start > nose1.hitbox.start, 'Supernariz retains startup advantage');
  assert.ok(claw1.totalFrames > nose1.totalFrames, 'Supernariz retains first-normal tempo advantage');
  assert.ok(FIGHTERS.supernariz.walkSpeed > FIGHTERS.chameleon.walkSpeed, 'Supernariz retains mobility advantage');

  assert.ok(clawReach > noseReach, 'Camaleoni receives compensating contest/whiff-punish reach');
  assert.ok(claw1.hitbox.damage > nose1.hitbox.damage, 'Camaleoni receives compensating damage');
  assert.ok(claw1.hitbox.hitstun > nose1.hitbox.hitstun, 'Camaleoni receives compensating hitstun');
  assert.ok(coletazo.totalFrames <= 31);
  assert.ok(coletazo.hitbox.knockback >= 13.5);
});

test('fresh fights and post-Ultimate recovery expose no stale captured state', () => {
  const fresh = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true, initialSuper: [100, 0] });
  for (const fighter of fresh.getSnapshot().fighters) {
    assert.equal(fighter.capturedBy, null);
    assert.equal(fighter.ultimateTarget, null);
    assert.equal(fighter.ultimatePhase, 'idle');
  }

  stepN(fresh, 48, input({ right: true }), input({ left: true }));
  fresh.step(input({ ultimate: true }), EMPTY_INPUT);

  let snap = fresh.getSnapshot();
  for (let i = 0; i < 220 && snap.fighters[0].ultimatePhase !== 'idle'; i += 1) {
    snap = fresh.step(EMPTY_INPUT, EMPTY_INPUT);
  }
  assert.equal(snap.fighters[0].ultimatePhase, 'idle');
  assert.equal(snap.fighters[0].ultimateTarget, null);
  assert.equal(snap.fighters[1].capturedBy, null);

  const rematch = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  for (const fighter of rematch.getSnapshot().fighters) {
    assert.equal(fighter.capturedBy, null);
    assert.equal(fighter.ultimateTarget, null);
    assert.equal(fighter.ultimatePhase, 'idle');
  }
});

function createTouchButton(action) {
  const listeners = new Map();
  return {
    dataset: { action },
    disabled: false,
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    addEventListener(type, handler) {
      const handlers = listeners.get(type) ?? new Set();
      handlers.add(handler);
      listeners.set(type, handlers);
    },
    removeEventListener(type, handler) { listeners.get(type)?.delete(handler); },
    setPointerCapture() {},
    dispatch(type, pointerId = 1) {
      for (const handler of listeners.get(type) ?? []) handler({ pointerId, preventDefault() {} });
    },
  };
}

function createDpad() {
  const listeners = new Map();
  return {
    dataset: {},
    addEventListener(type, handler) {
      const handlers = listeners.get(type) ?? new Set();
      handlers.add(handler);
      listeners.set(type, handlers);
    },
    removeEventListener(type, handler) { listeners.get(type)?.delete(handler); },
    setPointerCapture() {},
    getBoundingClientRect() { return { left: 0, top: 0, width: 160, height: 160 }; },
    dispatch(type, x, y, pointerId) {
      for (const handler of listeners.get(type) ?? []) handler({ pointerId, clientX: x, clientY: y, preventDefault() {} });
    },
  };
}

test('integrated touch path supports held movement plus one exclusive ULTIMATE with two pointers', async () => {
  const { GameInput } = await import('../dist/game/input/GameInput.js');
  const previousWindow = globalThis.window;
  const previousPerformance = globalThis.performance;
  globalThis.window = { addEventListener() {}, removeEventListener() {} };
  globalThis.performance = { now: () => 1000 };

  const dpad = createDpad();
  const attack = createTouchButton('attack');
  const special = createTouchButton('special');
  const jump = createTouchButton('jump');
  const ultimate = createTouchButton('ultimate');
  const buttons = [attack, special, jump, ultimate];
  const root = {
    querySelector(selector) { return selector === '[data-dpad]' ? dpad : null; },
    querySelectorAll(selector) { return selector === '[data-action]' ? buttons : []; },
  };

  const gameInput = new GameInput(root);
  try {
    dpad.dispatch('pointerdown', 145, 80, 11);
    let frame = gameInput.getFrame({ superReady: true, defensiveContext: false, nowMs: 1000 });
    assert.equal(frame.right, true);

    ultimate.dispatch('pointerdown', 12);
    frame = gameInput.getFrame({ superReady: true, defensiveContext: false, nowMs: 1016 });
    assert.equal(frame.right, true);
    assert.equal(frame.ultimate, true);
    assert.equal(frame.attack, false);
    assert.equal(frame.special, false);
    assert.equal(Boolean(frame.pushGuard), false);

    frame = gameInput.getFrame({ superReady: true, defensiveContext: false, nowMs: 1032 });
    assert.equal(frame.right, true);
    assert.equal(frame.ultimate, false, 'held Ultimate must not repeat');
  } finally {
    gameInput.destroy();
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
    if (previousPerformance === undefined) delete globalThis.performance;
    else globalThis.performance = previousPerformance;
  }
});

test('not-ready touch ULTIMATE produces no attack/special leakage', async () => {
  const source = await readFile(new URL('../src/game/input/GameInput.ts', import.meta.url), 'utf8');
  assert.match(source, /superReady/);
  assert.match(source, /ultimate/);
  assert.doesNotMatch(source, /touch.*ultimate[\s\S]{0,160}(attack\s*=\s*true|special\s*=\s*true)/i);
});

test('iPhone-scale 852x393 landscape control geometry preserves a central play lane', async () => {
  const styles = await readFile(new URL('../src/styles.css', import.meta.url), 'utf8');
  assert.match(styles, /\.action-cluster[^}]*width:clamp\(230px,33vw,330px\)[^}]*height:clamp\(134px,21vw,200px\)/s);
  assert.match(styles, /\.dpad[^}]*width:clamp\(116px,18vw,172px\)/s);
  assert.match(styles, /\.action-button--ultimate[^}]*width:clamp\(62px,8\.8vw,86px\)/s);

  const width = 852;
  const height = 393;
  const clamp = (min, preferred, max) => Math.max(min, Math.min(preferred, max));
  const dpadSize = clamp(116, width * 0.18, 172);
  const clusterWidth = clamp(230, width * 0.33, 330);
  const clusterHeight = clamp(134, width * 0.21, 200);
  const leftInset = 18;
  const rightInset = 16;
  const bottomInset = 15;

  const dpadRight = leftInset + dpadSize;
  const clusterLeft = width - rightInset - clusterWidth;
  const clusterTop = height - bottomInset - clusterHeight;
  const clearCenterWidth = clusterLeft - dpadRight;

  assert.ok(clearCenterWidth >= 360, `central unobstructed lane should remain broad; got ${clearCenterWidth.toFixed(1)}px`);
  assert.ok(clusterTop >= 190, `action cluster should stay in lower half; got top ${clusterTop.toFixed(1)}px`);
  assert.ok(dpadSize <= 155, 'D-pad should remain compact at iPhone-landscape width');
});

test('capture-linked renderer effects clear when authoritative capture/Ultimate state ends', async () => {
  const fight = await readFile(new URL('../src/game/render/FightRenderer.ts', import.meta.url), 'utf8');
  assert.match(fight, /capturedBy !== null/);
  assert.match(fight, /ultimatePhase !== 'idle' \|\| fighter\.capturedBy !== null/);
  assert.match(fight, /this\.ultimateFlashes = \[\]/);
  assert.doesNotMatch(fight, /new Image\(|drawImage\(|\.png|\.jpg|spritesheet/i);
});
