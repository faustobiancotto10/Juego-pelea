import test from 'node:test';
import assert from 'node:assert/strict';
import { CombatSimulation } from '../dist/game/simulation/CombatSimulation.js';
import { CpuController } from '../dist/game/simulation/CpuController.js';
import { composeCharacterContent } from '../dist/game/data/characterContent.js';
import { EMPTY_INPUT as E } from '../dist/game/types.js';
import { fourthCharacterPackage, fourthPackageId } from './fixtures/v06-character-package.mjs';

const input = (patch = {}) => ({ ...E, ...patch });

function firstHit(snapshot, attacker, defender) {
  return snapshot.events.find(
    (event) => event.type === 'hit' && event.attacker === attacker && event.defender === defender,
  );
}

function forceMove(sim, index, moveId, frame) {
  const fighter = sim.fighters[index];
  fighter.currentMove = sim.registry.getMove(fighter.id, moveId);
  fighter.moveId = moveId;
  fighter.moveFrame = frame;
  fighter.moveHasHit = false;
  fighter.moveEffectTriggered = false;
  fighter.moveContact = 'none';
  fighter.moveHitLedger.clear();
  fighter.comboCount = 1;
  fighter.stunFrames = 0;
  fighter.blockstunFrames = 0;
  fighter.guardBreakFrames = 0;
  fighter.dashKind = null;
  fighter.dashFrame = 0;
}

function toward(snapshot, index, extra = {}) {
  const self = snapshot.fighters[index];
  const foe = snapshot.fighters[index === 0 ? 1 : 0];
  return input({
    left: self.x > foe.x,
    right: self.x < foe.x,
    ...extra,
  });
}

function away(snapshot, index, extra = {}) {
  const self = snapshot.fighters[index];
  const foe = snapshot.fighters[index === 0 ? 1 : 0];
  return input({
    left: self.x < foe.x,
    right: self.x > foe.x,
    ...extra,
  });
}

test('G1 two returning Rugby Boomerangs trade on the same tick before symmetric cancellation/rearm', () => {
  const sim = new CombatSimulation('juanchi', 'juanchi', { skipIntro: true });
  sim.fighters[0].x = 400;
  sim.fighters[1].x = 600;
  sim.fighters[0].rangedAvailability = 'inFlight';
  sim.fighters[1].rangedAvailability = 'inFlight';

  sim.projectiles.push(
    {
      id: 701,
      owner: 0,
      kind: 'juanchiRugby',
      visualKey: 'rugby-ball',
      x: 620,
      y: 68,
      vx: -12,
      vy: 0,
      active: true,
      phase: 'return',
      phaseTick: 2,
      age: 28,
      ttl: 64,
      previousX: 620,
      previousY: 68,
      outboundContacts: new Set(),
      returnContacts: new Set(),
      lastContactTick: [null, null],
    },
    {
      id: 702,
      owner: 1,
      kind: 'juanchiRugby',
      visualKey: 'rugby-ball',
      x: 380,
      y: 68,
      vx: 12,
      vy: 0,
      active: true,
      phase: 'return',
      phaseTick: 2,
      age: 28,
      ttl: 64,
      previousX: 380,
      previousY: 68,
      outboundContacts: new Set(),
      returnContacts: new Set(),
      lastContactTick: [null, null],
    },
  );

  const snap = sim.step(E, E);
  const returnHits = snap.events.filter(
    (event) => event.type === 'hit' && event.source === 'projectile' && event.leg === 'return',
  );

  assert.equal(returnHits.length, 2);
  assert.deepEqual(returnHits.map((event) => event.attacker).sort(), [0, 1]);
  assert.deepEqual(returnHits.map((event) => event.defender).sort(), [0, 1]);
  assert.equal(snap.fighters[0].health, 970);
  assert.equal(snap.fighters[1].health, 970);
  assert.equal(snap.projectiles.length, 0);
  assert.equal(snap.fighters[0].rangedAvailability, 'cooldown');
  assert.equal(snap.fighters[1].rangedAvailability, 'cooldown');
  assert.equal(snap.fighters[0].rangedRecoveryFrames, 30);
  assert.equal(snap.fighters[1].rangedRecoveryFrames, 30);
});

test('G1 global hitstop freezes returning projectile path, age and phase tick exactly', () => {
  const sim = new CombatSimulation('juanchi', 'chameleon', { skipIntro: true });
  sim.fighters[0].x = 300;
  sim.fighters[1].x = 1000;

  let snap = sim.step(input({ special: true }), E);
  for (let n = 0; n < 30 && snap.projectiles.length === 0; n += 1) snap = sim.step(E, E);
  assert.equal(snap.projectiles.length, 1);

  const before = structuredClone(snap.projectiles[0]);
  const combatTick = snap.combatTick;
  sim.hitstopFrames = 3;

  for (let n = 0; n < 3; n += 1) {
    snap = sim.step(E, E);
    assert.equal(snap.combatTick, combatTick);
    assert.deepEqual(snap.projectiles[0], before);
  }

  snap = sim.step(E, E);
  assert.equal(snap.combatTick, combatTick + 1);
  assert.equal(snap.projectiles[0].age, before.age + 1);
  assert.notEqual(snap.projectiles[0].x, before.x);
});

test('G1 blocked Fricción produces exactly three authored contacts and finite chip/GUARD without a projectile', () => {
  const sim = new CombatSimulation('juanchi', 'supernariz', { skipIntro: true });
  sim.fighters[0].x = 500;
  sim.fighters[1].x = 562;

  let snap = sim.step(input({ down: true, special: true }), input({ right: true }));
  const contacts = [];

  for (let n = 0; n < 90; n += 1) {
    for (const event of snap.events) {
      if (event.type === 'hit' && event.attacker === 0 && event.defender === 1) contacts.push(event);
    }
    if (snap.fighters[0].moveId === null && contacts.length > 0) break;
    snap = sim.step(E, input({ right: true }));
  }

  assert.deepEqual(contacts.map((event) => event.hitId), ['rub-a', 'rub-b', 'palm-release']);
  assert.ok(contacts.every((event) => event.blocked === true));
  assert.equal(contacts.length, 3);
  assert.equal(snap.fighters[1].health, 994);
  assert.equal(snap.fighters[1].guard, 80);
  assert.equal(snap.projectiles.length, 0);
});

test('G1 Police Cap Rage preserves meter if interrupted before commitment and loses it after commitment', () => {
  const pre = new CombatSimulation('juanchi', 'supernariz', { skipIntro: true, initialSuper: [100, 0] });
  pre.fighters[0].x = 500;
  pre.fighters[1].x = 590;
  let snap = pre.step(input({ ultimate: true }), E);
  forceMove(pre, 1, 'nose1', 3);
  snap = pre.step(E, E);
  assert.ok(firstHit(snap, 1, 0));
  assert.equal(snap.fighters[0].ultimatePhase, 'idle');
  assert.equal(snap.fighters[0].superMeter, 100);
  assert.equal(snap.events.some((event) => event.type === 'ultimate-capture'), false);

  const post = new CombatSimulation('juanchi', 'supernariz', { skipIntro: true, initialSuper: [100, 0] });
  post.fighters[0].x = 500;
  post.fighters[1].x = 900;
  snap = post.step(input({ ultimate: true }), E);
  for (let n = 0; n < 40 && snap.fighters[0].ultimatePhase !== 'capture'; n += 1) snap = post.step(E, E);
  assert.equal(snap.fighters[0].ultimatePhase, 'capture');
  assert.equal(snap.fighters[0].superMeter, 0);

  post.fighters[1].x = 590;
  forceMove(post, 1, 'nose1', 3);
  snap = post.step(E, E);
  assert.ok(firstHit(snap, 1, 0));
  assert.equal(snap.fighters[0].ultimatePhase, 'idle');
  assert.equal(snap.fighters[0].superMeter, 0);
  assert.equal(snap.events.some((event) => event.type === 'ultimate-capture'), false);
});

function ultimateDefinition(sim, index) {
  const fighter = sim.fighters[index];
  const kit = sim.registry.getKit(fighter.id);
  const move = sim.registry.getMove(fighter.id, kit.ultimate);
  return sim.registry.getUltimate(move.ultimateKey);
}

function runActualClashOffset(p1, p2, leftSlot, effectiveOffset) {
  const sim = new CombatSimulation(p1, p2, { skipIntro: true, initialSuper: [100, 100] });
  const positions = leftSlot === 0 ? [450, 750] : [750, 450];
  sim.fighters[0].x = positions[0];
  sim.fighters[1].x = positions[1];

  let snap = sim.step(E, E);
  const definitions = [ultimateDefinition(sim, 0), ultimateDefinition(sim, 1)];
  const maxStartup = Math.max(definitions[0].startupFrames, definitions[1].startupFrames);
  const baseStart = 10;
  const starts = [
    baseStart + maxStartup - definitions[0].startupFrames,
    baseStart + maxStartup - definitions[1].startupFrames + effectiveOffset,
  ];

  const events = [];
  for (let tick = 1; tick < 150; tick += 1) {
    snap = sim.step(
      tick === starts[0] ? input({ ultimate: true }) : E,
      tick === starts[1] ? input({ ultimate: true }) : E,
    );
    events.push(...snap.events);
    if (
      events.some((event) => event.type === 'ultimate-clash')
      || events.some((event) => event.type === 'ultimate-capture')
      || snap.fighters.every((fighter) => fighter.ultimatePhase === 'recovery' || fighter.ultimatePhase === 'idle')
    ) break;
  }
  return { snap, events };
}

test('G1 Universal Clash boundary is mirror-symmetric for every ordered 3x3 pairing at effective offsets ±3', () => {
  const ids = ['chameleon', 'supernariz', 'juanchi'];
  for (const p1 of ids) {
    for (const p2 of ids) {
      for (const leftSlot of [0, 1]) {
        for (const offset of [-3, 3]) {
          const { events } = runActualClashOffset(p1, p2, leftSlot, offset);
          assert.equal(
            events.filter((event) => event.type === 'ultimate-clash').length,
            1,
            `${p1}/${p2} left=${leftSlot} offset=${offset}`,
          );
          assert.equal(events.some((event) => event.type === 'ultimate-capture'), false);
        }
      }
    }
  }
});

test('G1 Universal Clash rejects effective offset ±4 for every ordered 3x3 pairing without slot bias', () => {
  const ids = ['chameleon', 'supernariz', 'juanchi'];
  for (const p1 of ids) {
    for (const p2 of ids) {
      for (const leftSlot of [0, 1]) {
        for (const offset of [-4, 4]) {
          const { events } = runActualClashOffset(p1, p2, leftSlot, offset);
          assert.equal(
            events.some((event) => event.type === 'ultimate-clash'),
            false,
            `${p1}/${p2} left=${leftSlot} offset=${offset}`,
          );
        }
      }
    }
  }
});

test('G1 repeated Lengua can be jump-read and advanced through into melee range without taking a Lengua hit', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  sim.fighters[0].x = 200;
  sim.fighters[1].x = 1100;

  let snap = sim.getSnapshot();
  let specialEdgeArmed = true;
  let tongueStarts = 0;
  let tongueHits = 0;
  let reactedMoveFrame = null;
  const initialDistance = Math.abs(snap.fighters[1].x - snap.fighters[0].x);
  let reachedMelee = false;

  for (let tick = 0; tick < 520; tick += 1) {
    const attacker = snap.fighters[0];
    const defender = snap.fighters[1];

    let p1 = E;
    if (attacker.moveId === null && specialEdgeArmed) {
      p1 = input({ special: true });
      specialEdgeArmed = false;
      tongueStarts += 1;
      reactedMoveFrame = null;
    } else if (attacker.moveId !== null) {
      specialEdgeArmed = true;
    }

    let p2 = toward(snap, 1);
    if (
      attacker.moveId === 'tongueStraight'
      && attacker.moveFrame >= 4
      && reactedMoveFrame === null
      && defender.grounded
      && defender.jumpStartupFrames === 0
    ) {
      p2 = toward(snap, 1, { jump: true });
      reactedMoveFrame = attacker.moveFrame;
    }
    if (attacker.moveId === null) reactedMoveFrame = null;

    snap = sim.step(p1, p2);
    for (const event of snap.events) {
      if (
        event.type === 'hit'
        && event.attacker === 0
        && event.defender === 1
        && event.moveId === 'tongueStraight'
      ) tongueHits += 1;
    }

    if (Math.abs(snap.fighters[1].x - snap.fighters[0].x) <= 180) {
      reachedMelee = true;
      break;
    }
  }

  const finalDistance = Math.abs(snap.fighters[1].x - snap.fighters[0].x);
  console.log('G1 Lengua avoid-and-advance:', JSON.stringify({
    initialDistance,
    finalDistance,
    tongueStarts,
    tongueHits,
    combatTick: snap.combatTick,
  }));

  assert.ok(tongueStarts >= 3, 'fixture must face repeated Lengua, not a single throw');
  assert.equal(tongueHits, 0);
  assert.equal(reachedMelee, true, 'defender must be able to convert repeated avoidance into meaningful advance');
  assert.ok(finalDistance <= 180);
});

test('G1 malformed Character Package rejects unknown projectile movement kind and missing return config', () => {
  const unknownKind = structuredClone(fourthCharacterPackage);
  unknownKind.projectiles['fixture-four-bolt'].kind = 'teleport';
  assert.throws(
    () => composeCharacterContent([unknownKind], [fourthPackageId]),
    /projectile kind|unknown/i,
  );

  const missingReturn = structuredClone(fourthCharacterPackage);
  missingReturn.projectiles['fixture-four-bolt'].kind = 'returnToOwner';
  delete missingReturn.projectiles['fixture-four-bolt'].returnConfig;
  assert.throws(
    () => composeCharacterContent([missingReturn], [fourthPackageId]),
    /returnConfig|return/i,
  );
});

function cueSnapshot(base, tick, withProjectile) {
  const snap = structuredClone(base);
  snap.phase = 'fight';
  snap.round = 1;
  snap.combatTick = tick;
  snap.frame = 1000 + tick;
  snap.fighters[0].x = 600;
  snap.fighters[1].x = 800;
  snap.fighters[0].facing = 1;
  snap.fighters[1].facing = -1;
  snap.projectiles = withProjectile
    ? [{
      id: 77,
      owner: 0,
      kind: 'juanchiRugby',
      visualKey: 'rugby-ball',
      x: 650,
      y: 68,
      vx: 12,
      vy: 0,
      active: true,
      phase: 'outbound',
      phaseTick: 1,
      age: 1,
    }]
    : [];
  return snap;
}

test('G1 CPU cannot react to a newly visible Juanchi projectile before the authored 12-tick public-snapshot delay', () => {
  const sim = new CombatSimulation('juanchi', 'supernariz', { skipIntro: true });
  const base = sim.getSnapshot();
  const control = new CpuController(1, { seed: 0x6a09e667 });
  const cued = new CpuController(1, { seed: 0x6a09e667 });

  for (let tick = 0; tick <= 31; tick += 1) {
    const noCue = control.nextInput(cueSnapshot(base, tick, false));
    const newCue = cued.nextInput(cueSnapshot(base, tick, tick >= 20));
    assert.deepEqual(newCue, noCue, `projectile information leaked at combatTick=${tick}`);
  }
});
