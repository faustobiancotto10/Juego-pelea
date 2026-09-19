import test from 'node:test';
import assert from 'node:assert/strict';
import { CombatSimulation } from '../dist/game/simulation/CombatSimulation.js';
import { EMPTY_INPUT as E } from '../dist/game/types.js';

const input = (patch = {}) => ({ ...E, ...patch });

function firstHit(sim, attacker, defender, p1Start, p2Start, max = 80) {
  let snap = sim.step(p1Start, p2Start);
  for (let i = 0; i < max; i += 1) {
    const hit = snap.events.find((e) => e.type === 'hit' && e.attacker === attacker && e.defender === defender);
    if (hit) return { snap, hit };
    snap = sim.step(E, E);
  }
  throw new Error('expected hit');
}

test('R2 reference traces freeze repaired R1 behavior before content extraction', () => {
  for (const slot of [0, 1]) {
    const chameleonFirst = slot === 0;
    const sim = new CombatSimulation(
      chameleonFirst ? 'chameleon' : 'supernariz',
      chameleonFirst ? 'supernariz' : 'chameleon',
      { skipIntro: true },
    );
    sim.fighters[0].x = 500;
    sim.fighters[1].x = 590;
    const attacker = slot;
    const defender = slot === 0 ? 1 : 0;
    const starts = slot === 0
      ? [input({ attack: true }), E]
      : [E, input({ attack: true })];
    const { hit } = firstHit(sim, attacker, defender, starts[0], starts[1]);
    assert.equal(hit.blocked, false);
    assert.equal(hit.damage, chameleonFirst ? 46 : 42);
  }

  {
    const sim = new CombatSimulation('supernariz', 'chameleon', { skipIntro: true });
    sim.fighters[0].x = 500;
    sim.fighters[1].x = 900;
    let snap = sim.step(input({ special: true }), E);
    for (let i = 0; i < 12 && snap.projectiles.length === 0; i += 1) snap = sim.step(E, E);
    assert.equal(snap.projectiles.length, 1);
    assert.equal(snap.projectiles[0].kind, 'chorizo');
    assert.equal(snap.projectiles[0].vx, 9.2);
    assert.equal(snap.fighters[0].projectileCooldown, 120);
  }

  {
    const sim = new CombatSimulation('supernariz', 'chameleon', { skipIntro: true });
    sim.fighters[0].x = 500;
    sim.fighters[1].x = 620;
    const { snap, hit } = firstHit(sim, 0, 1, input({ down: true, special: true }), E, 60);
    assert.equal(hit.damage, 38);
    assert.ok(snap.fighters[1].chilledFrames >= 89 && snap.fighters[1].chilledFrames <= 90);
  }

  for (const id of ['chameleon', 'supernariz']) {
    for (const slot of [0, 1]) {
      const p1 = slot === 0 ? id : (id === 'chameleon' ? 'supernariz' : 'chameleon');
      const p2 = slot === 1 ? id : (id === 'chameleon' ? 'supernariz' : 'chameleon');
      const initialSuper = slot === 0 ? [100, 0] : [0, 100];
      const sim = new CombatSimulation(p1, p2, { skipIntro: true, initialSuper });
      sim.fighters[0].x = 500;
      sim.fighters[1].x = 620;
      let snap = sim.step(slot === 0 ? input({ ultimate: true }) : E, slot === 1 ? input({ ultimate: true }) : E);
      let captured = false;
      const defender = slot === 0 ? 1 : 0;
      const startHealth = snap.fighters[defender].health;
      for (let i = 0; i < 180; i += 1) {
        captured ||= snap.fighters[defender].capturedBy === slot;
        if (captured && snap.fighters[slot].ultimatePhase === 'recovery') break;
        snap = sim.step(E, E);
      }
      assert.equal(captured, true);
      assert.equal(startHealth - snap.fighters[defender].health, 190);
    }
  }
});
