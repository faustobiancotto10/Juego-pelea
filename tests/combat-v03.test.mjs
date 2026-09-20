import test from 'node:test';
import assert from 'node:assert/strict';
import { CombatSimulation } from '../dist/game/simulation/CombatSimulation.js';
import { CpuController } from '../dist/game/simulation/CpuController.js';
import { EMPTY_INPUT } from '../dist/game/types.js';

const input = (patch = {}) => ({ ...EMPTY_INPUT, ...patch });

function stepN(sim, frames, p1 = EMPTY_INPUT, p2 = EMPTY_INPUT) {
  let snap = sim.getSnapshot();
  for (let i = 0; i < frames; i += 1) snap = sim.step(p1, p2);
  return snap;
}

function closeFighters(sim, frames = 60) {
  return stepN(sim, frames, input({ right: true }), input({ left: true }));
}

function collectUntil(sim, predicate, maxFrames, p1 = EMPTY_INPUT, p2 = EMPTY_INPUT) {
  const events = [];
  let snap = sim.getSnapshot();
  for (let i = 0; i < maxFrames; i += 1) {
    snap = sim.step(p1, p2);
    events.push(...snap.events);
    if (predicate(snap, events)) return { snap, events };
  }
  return { snap, events };
}

test('SUPER has no passive gain and clean Special rewards use the V0.5 category rates', () => {
  const neutral = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  const neutralSnap = stepN(neutral, 180);
  assert.equal(neutralSnap.fighters[0].superMeter, 0);
  assert.equal(neutralSnap.fighters[1].superMeter, 0);

  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  closeFighters(sim, 48);
  sim.step(input({ special: true }), EMPTY_INPUT);
  const { snap } = collectUntil(
    sim,
    (s) => s.fighters[1].health < s.fighters[1].maxHealth,
    30,
  );

  assert.equal(snap.fighters[1].health, 920);
  assert.equal(snap.fighters[0].superMeter, 8);
  assert.equal(snap.fighters[1].superMeter, 4.4);
});

test('SUPER READY is capped and emits once when damage crosses the threshold', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true, initialSuper: [95, 0] });
  closeFighters(sim, 48);
  sim.step(input({ special: true }), EMPTY_INPUT);
  const { snap, events } = collectUntil(
    sim,
    (_s, seen) => seen.some((event) => event.type === 'super-ready'),
    30,
  );

  assert.equal(snap.fighters[0].superMeter, 100);
  assert.equal(snap.fighters[0].superReady, true);
  assert.equal(events.filter((event) => event.type === 'super-ready' && event.fighter === 0).length, 1);

  const laterEvents = [];
  for (let i = 0; i < 20; i += 1) laterEvents.push(...sim.step(EMPTY_INPUT, EMPTY_INPUT).events);
  assert.equal(laterEvents.filter((event) => event.type === 'super-ready').length, 0);
});

test('ultimate startup keeps full meter until the exact capture-commit transition', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true, initialSuper: [100, 0] });

  let snap = sim.step(input({ ultimate: true }), EMPTY_INPUT);
  assert.equal(snap.fighters[0].ultimatePhase, 'startup');
  assert.equal(snap.fighters[0].superMeter, 100);
  assert.ok(snap.events.some((event) => event.type === 'ultimate-start'));

  snap = stepN(sim, 21);
  assert.equal(snap.fighters[0].ultimatePhase, 'startup');
  assert.equal(snap.fighters[0].superMeter, 100);

  snap = sim.step(EMPTY_INPUT, EMPTY_INPUT);
  assert.equal(snap.fighters[0].ultimatePhase, 'capture');
  assert.equal(snap.fighters[0].superMeter, 0);
  assert.equal(snap.fighters[0].superReady, false);
});

test('Camaleoni ultimate ignores guard on valid capture and defender inputs cannot break the guaranteed sequence', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true, initialSuper: [100, 0] });
  sim.fighters[0].x = 1070;
  sim.fighters[1].x = 1190;

  sim.step(input({ ultimate: true }), input({ right: true }));
  const { snap: captured, events } = collectUntil(
    sim,
    (_s, seen) => seen.some((event) => event.type === 'ultimate-capture'),
    60,
    EMPTY_INPUT,
    input({ right: true }),
  );

  assert.ok(events.some((event) => event.type === 'ultimate-capture' && event.attacker === 0));
  assert.equal(captured.fighters[0].ultimatePhase, 'sequence');
  assert.equal(captured.fighters[0].ultimateTarget, 1);

  let snap = captured;
  for (let i = 0; i < 90 && snap.fighters[0].ultimatePhase === 'sequence'; i += 1) {
    snap = sim.step(
      EMPTY_INPUT,
      input({ left: true, right: true, jump: true, attack: true, special: true, dashLeft: true, dashRight: true }),
    );
  }

  assert.ok(snap.fighters[1].health <= 810, 'guaranteed sequence should deliver the full 190 damage band');
  assert.notEqual(snap.fighters[0].ultimatePhase, 'sequence');
});

test('Supernariz ultimate captures through guard and lands the same 190 total-damage band', () => {
  const sim = new CombatSimulation('supernariz', 'chameleon', { skipIntro: true, initialSuper: [100, 0] });
  sim.fighters[0].x = 1070;
  sim.fighters[1].x = 1190;

  sim.step(input({ ultimate: true }), input({ right: true }));
  const { events } = collectUntil(
    sim,
    (_s, seen) => seen.some((event) => event.type === 'ultimate-capture'),
    70,
    EMPTY_INPUT,
    input({ right: true }),
  );
  assert.ok(events.some((event) => event.type === 'ultimate-capture' && event.attacker === 0));

  const snap = stepN(sim, 100, EMPTY_INPUT, input({ right: true, attack: true, jump: true }));
  assert.equal(snap.fighters[1].health, 810);
});

test('out-of-range ultimate whiff consumes meter after commitment and enters recovery', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true, initialSuper: [100, 0] });
  sim.step(input({ ultimate: true }), EMPTY_INPUT);

  const { snap, events } = collectUntil(
    sim,
    (_s, seen) => seen.some((event) => event.type === 'ultimate-whiff'),
    40,
  );

  assert.ok(events.some((event) => event.type === 'ultimate-whiff' && event.attacker === 0));
  assert.equal(snap.fighters[0].superMeter, 0);
  assert.equal(snap.fighters[0].ultimatePhase, 'recovery');
});

test('jumping out of Camaleoni capture height can evade the unblockable ultimate', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true, initialSuper: [100, 0] });
  closeFighters(sim, 48);

  sim.step(input({ ultimate: true }), EMPTY_INPUT);
  stepN(sim, 12);
  sim.step(EMPTY_INPUT, input({ jump: true }));
  const { events } = collectUntil(
    sim,
    (_s, seen) => seen.some((event) => event.type === 'ultimate-whiff' || event.type === 'ultimate-capture'),
    70,
    EMPTY_INPUT,
    EMPTY_INPUT,
  );

  assert.ok(events.some((event) => event.type === 'ultimate-whiff'));
  assert.equal(events.some((event) => event.type === 'ultimate-capture'), false);
});

test('Push Guard buffers through hitstop, spends 34 GUARD and creates strong separation', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  closeFighters(sim, 60);

  sim.step(input({ left: true }), input({ attack: true }));
  const blocked = collectUntil(
    sim,
    (_s, seen) => seen.some((event) => event.type === 'hit' && event.blocked),
    15,
    input({ left: true }),
    EMPTY_INPUT,
  );
  assert.ok(blocked.events.some((event) => event.type === 'hit' && event.blocked));

  const guardAfterBlock = blocked.snap.fighters[0].guard;
  const attackerXBefore = blocked.snap.fighters[1].x;

  let snap = sim.step(input({ pushGuard: true }), EMPTY_INPUT);
  const seen = [...snap.events];
  for (let i = 0; i < 10 && !seen.some((event) => event.type === 'push-guard'); i += 1) {
    snap = sim.step(EMPTY_INPUT, EMPTY_INPUT);
    seen.push(...snap.events);
  }

  assert.ok(seen.some((event) => event.type === 'push-guard' && event.defender === 0));
  assert.ok(snap.fighters[0].guard <= guardAfterBlock - 33.9);
  assert.ok(snap.fighters[1].x > attackerXBefore + 80);
});

test('Push Guard request is inert in neutral and cannot spend GUARD', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  const snap = sim.step(input({ pushGuard: true }), EMPTY_INPUT);
  assert.equal(snap.fighters[0].guard, 100);
  assert.equal(snap.events.some((event) => event.type === 'push-guard'), false);
});

test('Camaleoni final Special grammar maps neutral/up to Lengua and down to Coletazo', () => {
  const neutral = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  assert.equal(neutral.step(input({ special: true }), EMPTY_INPUT).fighters[0].moveId, 'tongueStraight');

  const close = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  assert.equal(close.step(input({ down: true, special: true }), EMPTY_INPUT).fighters[0].moveId, 'coletazo');

  const up = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  assert.equal(up.step(input({ up: true, special: true }), EMPTY_INPUT).fighters[0].moveId, 'tongueStraight');
});

test('CPU uses delayed seeded actions contextually instead of spending SUPER immediately', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true, initialSuper: [0, 100] });
  const base = structuredClone(sim.getSnapshot());
  base.fighters[0].x = 500;
  base.fighters[1].x = 680;

  const immediate = new CpuController(1, { seed: 17 });
  const first = structuredClone(base);
  first.combatTick = 0;
  first.frame = 0;
  assert.equal(Boolean(immediate.nextInput(first).ultimate), false, 'READY alone cannot create a current-frame oracle Ultimate');

  let someUltimate = false;
  let someNoUltimate = false;
  for (let seed = 1; seed <= 32; seed += 1) {
    const cpu = new CpuController(1, { seed });
    let used = false;
    for (let tick = 0; tick < 48; tick += 1) {
      const snap = structuredClone(base);
      snap.combatTick = tick;
      snap.frame = tick;
      if (cpu.nextInput(snap).ultimate) used = true;
    }
    someUltimate ||= used;
    someNoUltimate ||= !used;
  }
  assert.equal(someUltimate, true);
  assert.equal(someNoUltimate, true);

  const pressuredCpu = new CpuController(1, { seed: 7 });
  const pressured = structuredClone(base);
  pressured.combatTick = 0;
  pressured.frame = 0;
  pressured.fighters[1].blockstunFrames = 6;
  pressured.fighters[1].guard = 100;
  pressured.fighters[0].x = 570;
  pressured.fighters[1].x = 680;
  const defense = pressuredCpu.nextInput(pressured);
  assert.equal(defense.right, true, 'own blockstun can immediately maintain legal away guard');
});

test('identical V0.3 input streams produce identical snapshots and event ordering', () => {
  const a = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true, initialSuper: [100, 0] });
  const b = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true, initialSuper: [100, 0] });

  for (let frame = 0; frame < 90; frame += 1) {
    const p1 = frame === 0 ? input({ ultimate: true }) : EMPTY_INPUT;
    const p2 = frame < 20 ? input({ left: true }) : EMPTY_INPUT;
    const sa = a.step(p1, p2);
    const sb = b.step(p1, p2);
    assert.deepEqual(sa, sb);
  }
});
