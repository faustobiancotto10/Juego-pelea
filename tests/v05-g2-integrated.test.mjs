import test from 'node:test';
import assert from 'node:assert/strict';
import { CombatSimulation } from '../dist/game/simulation/CombatSimulation.js';
import { CpuController } from '../dist/game/simulation/CpuController.js';
import { FightRenderer } from '../dist/game/render/FightRenderer.js';
import { EMPTY_INPUT as E } from '../dist/game/types.js';

const input = (patch = {}) => ({ ...E, ...patch });

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

async function inputFixture(options = {}) {
  const { GameInput } = await import('../dist/game/input/GameInput.js');
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  const previousPerformance = globalThis.performance;

  const windowHarness = new FakeEventTarget();
  windowHarness.devicePixelRatio = 1;
  windowHarness.innerWidth = 852;
  windowHarness.innerHeight = 393;
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
  const gameInput = new GameInput(root, options);

  const tap = (target, pointerId) => {
    target.fire('pointerdown', pointer(pointerId));
    target.fire('pointerup', pointer(pointerId));
  };
  const cleanup = () => {
    gameInput.destroy();
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
    if (previousPerformance === undefined) delete globalThis.performance;
    else globalThis.performance = previousPerformance;
  };
  return { gameInput, pad, attack, special, jump, ultimate, windowHarness, documentHarness, tap, cleanup };
}

function makeContext() {
  const state = {};
  return new Proxy(state, {
    get(target, prop) {
      if (prop in target) return target[prop];
      if (prop === 'measureText') return () => ({ width: 0 });
      if (prop === 'createLinearGradient' || prop === 'createRadialGradient') {
        return () => ({ addColorStop() {} });
      }
      return () => {};
    },
    set(target, prop, value) {
      target[prop] = value;
      return true;
    },
  });
}

function makeRenderer() {
  const ctx = makeContext();
  const canvas = {
    width: 852,
    height: 393,
    clientWidth: 852,
    clientHeight: 393,
    getContext: () => ctx,
  };
  return new FightRenderer(canvas);
}

function actions(frame) {
  return (frame.commands ?? []).map((command) => command.action);
}

test('G2 integrated mobile interruption clears DOM and simulation command state, then accepts a fresh pointer', async () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  sim.fighters[0].stunFrames = 2;
  const h = await inputFixture({ onReset: () => sim.resetInputState() });
  try {
    h.pad.fire('pointerdown', pointer(1, 145, 80));
    h.tap(h.attack, 2);
    let frame = h.gameInput.getFrame();
    assert.equal(frame.right, true);
    assert.deepEqual(actions(frame), ['attack']);

    sim.step(frame, E);
    const tickBeforeReset = sim.getSnapshot().combatTick;

    h.windowHarness.fire('blur');
    frame = h.gameInput.getFrame();
    assert.equal(frame.left || frame.right || frame.up || frame.down, false);
    assert.deepEqual(frame.commands ?? [], []);
    assert.equal(sim.getSnapshot().combatTick, tickBeforeReset, 'suspension reset cannot advance simulation');

    let snap = sim.getSnapshot();
    for (let i = 0; i < 6; i += 1) snap = sim.step(h.gameInput.getFrame(), E);
    assert.equal(snap.fighters[0].moveId, null, 'pre-interruption edge must not ghost after reset');

    h.pad.fire('pointerdown', pointer(3, 10, 80));
    frame = h.gameInput.getFrame();
    assert.equal(frame.left, true, 'next pointer must immediately recover control');
    h.pad.fire('lostpointercapture', pointer(3, 10, 80));
    frame = h.gameInput.getFrame();
    assert.equal(frame.left, false);
  } finally {
    h.cleanup();
  }
});

test('G2 integrated touch Ultimate drives simulation and authoritative renderer release without stale effects', async () => {
  for (const attackerId of ['chameleon', 'supernariz']) {
    const defenderId = attackerId === 'chameleon' ? 'supernariz' : 'chameleon';
    const sim = new CombatSimulation(attackerId, defenderId, { skipIntro: true, initialSuper: [100, 0] });
    sim.fighters[0].x = 500;
    sim.fighters[1].x = 620;
    const h = await inputFixture({ onReset: () => sim.resetInputState() });
    try {
      const renderer = makeRenderer();
      h.tap(h.ultimate, 10);
      const frame = h.gameInput.getFrame({ superReady: true, defensiveContext: false, nowMs: 1000 });
      assert.deepEqual(actions(frame), ['ultimate']);

      let snap = sim.step(frame, E);
      let releaseSeen = false;
      let captureSeen = false;
      let releaseTrailSeen = false;

      for (let n = 0; n < 260; n += 1) {
        const before = structuredClone(snap);
        renderer.consumeEvents(snap);
        renderer.render(snap, n / 60);
        assert.deepEqual(snap, before, 'presentation may not mutate combat truth');

        if (snap.events.some((event) => event.type === 'ultimate-capture' && event.attacker === 0)) captureSeen = true;
        if (snap.events.some((event) => event.type === 'ultimate-release' && event.attacker === 0)) {
          releaseSeen = true;
          releaseTrailSeen ||= renderer.ultimateReleaseTrails.length > 0;
        }
        if (releaseSeen && snap.fighters[0].ultimatePhase === 'idle') break;
        snap = sim.step(h.gameInput.getFrame(), E);
      }

      assert.equal(captureSeen, true, `${attackerId}: input must reach authoritative capture`);
      assert.equal(releaseSeen, true, `${attackerId}: successful Ultimate must emit release`);
      assert.equal(releaseTrailSeen, true, `${attackerId}: renderer must consume authoritative release`);
      assert.equal(snap.fighters[1].capturedBy, null);
      assert.equal(snap.fighters[0].ultimatePhase, 'idle');

      for (let n = 0; n < 40; n += 1) {
        snap = sim.step(h.gameInput.getFrame(), E);
        renderer.consumeEvents(snap);
        renderer.render(snap, (300 + n) / 60);
      }
      assert.equal(renderer.ultimateFlashes.length, 0, `${attackerId}: capture flashes must clear with authoritative state`);
      assert.equal(renderer.ultimateReleaseTrails.length, 0, `${attackerId}: release trail must finish within bounded simulation frames`);
    } finally {
      h.cleanup();
    }
  }
});

function away(snapshot, index, extra = {}) {
  const self = snapshot.fighters[index];
  const foe = snapshot.fighters[index === 0 ? 1 : 0];
  return input({ left: self.x < foe.x, right: self.x > foe.x, ...extra });
}

function toward(snapshot, index, extra = {}) {
  const self = snapshot.fighters[index];
  const foe = snapshot.fighters[index === 0 ? 1 : 0];
  return input({ right: self.x < foe.x, left: self.x > foe.x, ...extra });
}

function scriptedPolicy(name, snap, index, tick) {
  if (name === 'standGuard') return away(snap, index);
  if (name === 'crouchGuard') return away(snap, index, { down: true });
  if (name === 'retreatSpecial') return away(snap, index, { special: tick % 54 === 0 });
  if (name === 'walkForwardNormals') return toward(snap, index, { attack: tick % 14 === 0 });
  if (name === 'mashPressure') return toward(snap, index, { attack: tick % 2 === 0 });
  if (name === 'jumpOnRead') {
    const foe = snap.fighters[index === 0 ? 1 : 0];
    const read = foe.moveId !== null || foe.ultimatePhase === 'startup' || snap.projectiles.some((p) => p.owner !== index);
    return read ? toward(snap, index, { jump: true }) : toward(snap, index);
  }
  return E;
}

function hasDefensiveOption(fighter) {
  if (!fighter.grounded) return false;
  if (fighter.capturedBy !== null) return false;
  if (fighter.stunFrames > 0 || fighter.guardBreakFrames > 0) return false;
  if (fighter.ultimatePhase !== 'idle') return false;
  if (fighter.moveId !== null) return false;
  if (fighter.dashKind !== null) return false;
  if (fighter.landingRecoveryFrames > 0 || fighter.pushGuardRecoveryFrames > 0) return false;
  return true;
}

function runPolicyMetric(policy, playerId, cpuId, slot, seed, maxFrames = 14000) {
  const sim = new CombatSimulation(slot === 0 ? playerId : cpuId, slot === 1 ? playerId : cpuId, { skipIntro: true });
  const cpuIndex = slot === 0 ? 1 : 0;
  const cpu = new CpuController(cpuIndex, { seed });
  let snap = sim.getSnapshot();

  const metrics = {
    phase: snap.phase,
    winner: null,
    combatTick: 0,
    damageDealt: 0,
    damageTaken: 0,
    cleanHits: 0,
    blocks: 0,
    guardBreaks: 0,
    whiffs: [0, 0],
    firstSuperTick: null,
    categories: { normal: 0, special: 0, projectile: 0, ultimate: 0 },
    moveVariety: [new Set(), new Set()],
    longestBothCommitted: 0,
  };
  const previous = snap.fighters.map((fighter) => ({ moveId: fighter.moveId, moveContact: fighter.moveContact, stunFrames: fighter.stunFrames }));
  let bothCommittedRun = 0;

  for (let frame = 0; frame < maxFrames && snap.phase !== 'match-over'; frame += 1) {
    const playerFrame = scriptedPolicy(policy, snap, slot, frame);
    const cpuFrame = cpu.nextInput(snap);
    snap = sim.step(slot === 0 ? playerFrame : cpuFrame, slot === 1 ? playerFrame : cpuFrame);

    if (metrics.firstSuperTick === null && snap.fighters.some((fighter) => fighter.superReady)) {
      metrics.firstSuperTick = snap.combatTick;
    }

    for (let i = 0; i < 2; i += 1) {
      const fighter = snap.fighters[i];
      if (fighter.moveId !== null) metrics.moveVariety[i].add(fighter.moveId);
      if (previous[i].moveId !== null && fighter.moveId === null && previous[i].moveContact === 'none' && fighter.stunFrames === 0) {
        metrics.whiffs[i] += 1;
      }
      previous[i] = { moveId: fighter.moveId, moveContact: fighter.moveContact, stunFrames: fighter.stunFrames };
    }

    if (!hasDefensiveOption(snap.fighters[0]) && !hasDefensiveOption(snap.fighters[1])) {
      bothCommittedRun += 1;
      metrics.longestBothCommitted = Math.max(metrics.longestBothCommitted, bothCommittedRun);
    } else {
      bothCommittedRun = 0;
    }

    for (const event of snap.events) {
      if (event.type === 'hit') {
        metrics.categories[event.source] += 1;
        if (event.attacker === slot) metrics.damageDealt += event.damage;
        if (event.defender === slot) metrics.damageTaken += event.damage;
        if (event.attacker === slot && !event.blocked) metrics.cleanHits += 1;
        if (event.defender === slot && event.blocked) metrics.blocks += 1;
      }
      if (event.type === 'guard-break' && event.defender === slot) metrics.guardBreaks += 1;
    }
  }

  metrics.phase = snap.phase;
  metrics.winner = snap.winner;
  metrics.combatTick = snap.combatTick;
  metrics.moveVariety = metrics.moveVariety.map((set) => [...set].sort());
  return metrics;
}

test('G2 integrated strategy matrix records damage/time/action variety across passive and active policies', () => {
  const policies = ['standGuard', 'crouchGuard', 'retreatSpecial', 'walkForwardNormals', 'jumpOnRead', 'mashPressure'];
  const seeds = [113, 197];
  const rows = [];

  for (const playerId of ['chameleon', 'supernariz']) {
    const cpuId = playerId === 'chameleon' ? 'supernariz' : 'chameleon';
    for (const slot of [0, 1]) {
      for (const policy of policies) {
        for (const seed of seeds) {
          const metrics = runPolicyMetric(policy, playerId, cpuId, slot, seed + slot * 17 + policies.indexOf(policy));
          rows.push({ playerId, cpuId, slot, policy, seed, ...metrics });
          assert.equal(metrics.phase, 'match-over', `${playerId} slot=${slot} ${policy} seed=${seed}`);
          assert.ok(metrics.damageDealt + metrics.damageTaken > 0, 'every matrix row must contain real interaction');
        }
      }
    }
  }

  for (const policy of ['standGuard', 'crouchGuard', 'retreatSpecial']) {
    const subset = rows.filter((row) => row.policy === policy);
    assert.ok(subset.every((row) => row.damageTaken > 0), `${policy} must never be universally damage-proof`);
  }

  const categoryTotals = rows.reduce((totals, row) => {
    for (const key of Object.keys(totals)) totals[key] += row.categories[key];
    return totals;
  }, { normal: 0, special: 0, projectile: 0, ultimate: 0 });
  assert.ok(Object.values(categoryTotals).filter((count) => count > 0).length >= 3, 'integrated corpus must exercise multiple attack categories');

  const varietySummary = [];
  for (const playerId of ['chameleon', 'supernariz']) {
    for (const slot of [0, 1]) {
      const subset = rows.filter((row) => row.playerId === playerId && row.slot === slot);
      const playerMoves = new Set();
      const opponentMoves = new Set();
      for (const row of subset) {
        for (const move of row.moveVariety[slot]) playerMoves.add(move);
        for (const move of row.moveVariety[slot === 0 ? 1 : 0]) opponentMoves.add(move);
      }
      varietySummary.push({
        playerId,
        slot,
        playerMoves: [...playerMoves].sort(),
        opponentMoves: [...opponentMoves].sort(),
      });
      // Variety is evidence, not a pass/fail quota. The approved plan explicitly
      // rejects arbitrary automated variety/win-rate thresholds as proof of fun.
    }
  }

  console.log('G2 strategy matrix:', JSON.stringify({ categoryTotals, varietySummary, rows }));
});
