import test from 'node:test';
import assert from 'node:assert/strict';
import { CombatSimulation } from '../dist/game/simulation/CombatSimulation.js';
import { getMoveDefinition } from '../dist/game/simulation/moves.js';
import { EMPTY_INPUT as E } from '../dist/game/types.js';

const input = (patch = {}) => ({ ...E, ...patch });

function away(snapshot, index) {
  const self = snapshot.fighters[index];
  const foe = snapshot.fighters[index === 0 ? 1 : 0];
  return input({
    left: self.x < foe.x,
    right: self.x > foe.x,
  });
}

function firstHit(snapshot, attacker, defender) {
  return snapshot.events.find((event) => (
    event.type === 'hit'
    && event.attacker === attacker
    && event.defender === defender
  ));
}

function findColetazoWhiffPunish() {
  const special = getMoveDefinition('chameleon', 'coletazo');
  let firstFallback = null;

  for (let spacingPad = 1; spacingPad <= 120; spacingPad += 1) {
    for (let dashStart = 0; dashStart <= special.hitbox.end + 2; dashStart += 1) {
      const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
      const defenderDef = sim.registry.getFighter('supernariz');
      const practicalReach = special.hitbox.offsetX + special.hitbox.width + defenderDef.width * 0.5;

      sim.fighters[0].x = 500;
      sim.fighters[1].x = 500 + practicalReach + spacingPad;

      let snap = sim.step(input({ left: true, down: true, special: true }), E);
      let dashIssued = false;
      let attackIssued = false;
      let defenderWasHit = false;
      let previousAttackerMove = {
        moveId: snap.fighters[0].moveId,
        moveFrame: snap.fighters[0].moveFrame,
      };

      for (let n = 0; n < 70; n += 1) {
        const specialHit = firstHit(snap, 0, 1);
        if (specialHit) {
          defenderWasHit = true;
          break;
        }

        const punish = firstHit(snap, 1, 0);
        if (punish) {
          if (!punish.blocked) {
            const row = {
              spacingPad,
              dashStart,
              punishDamage: punish.damage,
              punishStep: n,
              attackerMoveAtPunish: snap.fighters[0].moveId,
              attackerMoveFrameAtPunish: snap.fighters[0].moveFrame,
              previousAttackerMove,
            };
            if (row.attackerMoveAtPunish !== null) return { recovery: row, fallback: firstFallback };
            firstFallback ??= row;
          }
          break;
        }

        let defenderInput = E;
        if (!dashIssued && n === dashStart) {
          defenderInput = input({ dashLeft: true });
          dashIssued = true;
        } else if (dashIssued && !attackIssued && snap.fighters[1].dashKind === null) {
          defenderInput = input({ attack: true });
          attackIssued = true;
        }

        previousAttackerMove = {
          moveId: snap.fighters[0].moveId,
          moveFrame: snap.fighters[0].moveFrame,
        };
        snap = sim.step(away(snap, 0), defenderInput);
      }

      if (defenderWasHit) continue;
    }
  }

  return { recovery: null, fallback: firstFallback };
}

test('AC06 RED: whiffed Coletazo admits a clean nose1 punish before recovery ends', () => {
  const result = findColetazoWhiffPunish();
  console.log('AC06 Ricardo recovery search:', JSON.stringify(result));
  assert.ok(
    result.recovery,
    `no clean nose1 recovery punish; first post-recovery fallback=${JSON.stringify(result.fallback)}`,
  );
  assert.equal(result.recovery.punishDamage, 42);
  assert.equal(result.recovery.attackerMoveAtPunish, 'coletazo');
});
