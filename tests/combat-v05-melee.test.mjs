import test from 'node:test';
import assert from 'node:assert/strict';
import { CombatSimulation } from '../dist/game/simulation/CombatSimulation.js';
import { getMoveDefinition } from '../dist/game/simulation/moves.js';
import { EMPTY_INPUT as E } from '../dist/game/types.js';

const input = (patch = {}) => ({ ...E, ...patch });

function runUntil(sim, predicate, max = 120, p1 = E, p2 = E) {
  let snap = sim.getSnapshot();
  for (let i = 0; i < max; i += 1) {
    snap = sim.step(p1, p2);
    if (predicate(snap)) return snap;
  }
  return snap;
}

function startPositions(sim, distance) {
  sim.fighters[0].x = 500;
  sim.fighters[1].x = 500 + distance;
}

function route(id, distance, slot = 0) {
  const other = id === 'chameleon' ? 'supernariz' : 'chameleon';
  const sim = new CombatSimulation(slot === 0 ? id : other, slot === 1 ? id : other, { skipIntro: true });
  startPositions(sim, distance);
  const defender = slot === 0 ? 1 : 0;
  const attacker = slot;
  const expectedMoves = id === 'chameleon' ? ['claw1', 'claw2'] : ['nose1', 'nose2', 'nose3'];
  const hits = [];
  let snap = sim.step(slot === 0 ? input({ attack: true }) : E, slot === 1 ? input({ attack: true }) : E);
  let lastMove = null;
  let queuedForMove = null;
  let firstHitSeen = false;

  for (let n = 0; n < 180 && hits.length < expectedMoves.length; n += 1) {
    for (const event of snap.events) {
      if (event.type === 'hit' && event.attacker === attacker && event.defender === defender) {
        hits.push({ ...event, moveId: snap.fighters[attacker].moveId });
        firstHitSeen = true;
      }
    }

    const fighter = snap.fighters[attacker];
    if (fighter.moveId !== lastMove) {
      lastMove = fighter.moveId;
      queuedForMove = null;
    }

    const wantsChain = firstHitSeen
      && fighter.moveId !== null
      && fighter.moveId !== expectedMoves.at(-1)
      && fighter.moveContact === 'hit'
      && queuedForMove !== fighter.moveId
      && ((fighter.moveId === 'claw1' && fighter.moveFrame >= 9)
        || (fighter.moveId === 'nose1' && fighter.moveFrame >= 8)
        || (fighter.moveId === 'nose2' && fighter.moveFrame >= 8));

    if (wantsChain) queuedForMove = fighter.moveId;

    const attackInput = wantsChain ? input({ attack: true }) : E;
    const defenseInput = firstHitSeen
      ? (defender === 0 ? input({ right: true }) : input({ right: true }))
      : E;

    snap = sim.step(
      attacker === 0 ? attackInput : defenseInput,
      attacker === 1 ? attackInput : defenseInput,
    );
  }

  return { hits, snap };
}

test('R3 adds one grounded low normal per fighter with the approved compact frame profile', () => {
  for (const [id, low] of [['chameleon', 'clawLow'], ['supernariz', 'noseLow']]) {
    const move = getMoveDefinition(id, low);
    assert.equal(move.category, 'normal');
    assert.equal(move.bindingRole, 'low');
    assert.equal(move.totalFrames, 25);
    assert.deepEqual(
      {
        start: move.hitbox.start,
        end: move.hitbox.end,
        offsetX: move.hitbox.offsetX,
        width: move.hitbox.width,
        damage: move.hitbox.damage,
        chipDamage: move.hitbox.chipDamage,
        hitstun: move.hitbox.hitstun,
        blockstun: move.hitbox.blockstun,
        knockback: move.hitbox.knockback,
        level: move.hitbox.level,
        guardDamage: move.hitbox.guardDamage,
      },
      {
        start: 7, end: 9, offsetX: 22, width: 65,
        damage: 36, chipDamage: 2, hitstun: 13, blockstun: 8,
        knockback: 3.5, level: 'low', guardDamage: 10,
      },
    );
    assert.equal(move.nextAttack, undefined);
  }
});

test('DOWN+ATTACK selects the low; standing away loses and down-away blocks it', () => {
  for (const id of ['chameleon', 'supernariz']) {
    const lowId = id === 'chameleon' ? 'clawLow' : 'noseLow';

    const standing = new CombatSimulation(id, id, { skipIntro: true });
    standing.fighters[0].x = 1095;
    standing.fighters[1].x = 1190;
    let snap = standing.step(input({ down: true, attack: true }), input({ right: true }));
    assert.equal(snap.fighters[0].moveId, lowId);
    snap = runUntil(standing, s => s.events.some(e => e.type === 'hit'), 20, E, input({ right: true }));
    const standingHit = snap.events.find(e => e.type === 'hit');
    assert.ok(standingHit);
    assert.equal(standingHit.blocked, false);

    const crouch = new CombatSimulation(id, id, { skipIntro: true });
    crouch.fighters[0].x = 1095;
    crouch.fighters[1].x = 1190;
    snap = crouch.step(input({ down: true, attack: true }), input({ right: true, down: true }));
    snap = runUntil(crouch, s => s.events.some(e => e.type === 'hit'), 20, E, input({ right: true, down: true }));
    const crouchHit = snap.events.find(e => e.type === 'hit');
    assert.ok(crouchHit);
    assert.equal(crouchHit.blocked, true);
  }
});

test('DOWN+ATTACK never becomes a chain cancel from a connected starter', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  startPositions(sim, 62);
  let snap = sim.step(input({ attack: true }), E);
  snap = runUntil(sim, s => s.fighters[0].moveContact === 'hit' && s.fighters[0].moveFrame >= 9, 40);
  assert.equal(snap.fighters[0].moveId, 'claw1');

  snap = sim.step(input({ down: true, attack: true }), E);
  assert.equal(snap.fighters[0].moveId, 'claw1', 'low request cannot replace a chain cancel');
});

test('Camaleoni claw1 -> claw2 is a real two-hit route at 62 and 85 in both slots', () => {
  for (const distance of [62, 85]) {
    for (const slot of [0, 1]) {
      const { hits } = route('chameleon', distance, slot);
      assert.equal(hits.length, 2, `distance=${distance} slot=${slot}`);
      assert.deepEqual(hits.map(h => h.damage), [46, 60]);
      assert.ok(hits.every(h => h.blocked === false));
    }
  }
});

test('Supernariz nose1 -> nose2 -> nose3 is a real three-hit route at 62 and 85 in both slots', () => {
  for (const distance of [62, 85]) {
    for (const slot of [0, 1]) {
      const { hits } = route('supernariz', distance, slot);
      assert.equal(hits.length, 3, `distance=${distance} slot=${slot}`);
      assert.deepEqual(hits.map(h => h.damage), [42, 49, 74]);
      assert.ok(hits.every(h => h.blocked === false));
    }
  }
});

test('published starter cancel windows retain the first three advancing frames', () => {
  const claw1 = getMoveDefinition('chameleon', 'claw1');
  const nose1 = getMoveDefinition('supernariz', 'nose1');
  const nose2 = getMoveDefinition('supernariz', 'nose2');

  assert.deepEqual([claw1.cancelStart, claw1.cancelEnd, claw1.hitbox.hitstun], [9, 12, 16]);
  assert.deepEqual([nose1.cancelStart, nose1.cancelEnd, nose1.hitbox.hitstun], [8, 11, 14]);
  assert.deepEqual([nose2.cancelStart, nose2.cancelEnd, nose2.hitbox.hitstun], [8, 11, 16]);
});
