import { CombatSimulation } from '../../dist/game/simulation/CombatSimulation.js';
import { CpuController } from '../../dist/game/simulation/CpuController.js';
import { EMPTY_INPUT as E } from '../../dist/game/types.js';

export function runSeededDuel(seed, p1 = 'chameleon', p2 = 'supernariz', maxFrames = 12000) {
  const sim = new CombatSimulation(p1, p2, { skipIntro: true });
  const cpu0 = new CpuController(0, { seed });
  const cpu1 = new CpuController(1, { seed: seed ^ 0x9e3779b9 });
  const categories = { normal: 0, special: 0, projectile: 0, ultimate: 0 };
  let snap = sim.getSnapshot();
  let damage = 0;

  for (let frame = 0; frame < maxFrames && snap.phase !== 'match-over'; frame += 1) {
    snap = sim.step(cpu0.nextInput(snap), cpu1.nextInput(snap));
    for (const event of snap.events) {
      if (event.type === 'hit') {
        damage += event.damage;
        categories[event.source] += 1;
      }
    }
  }

  return {
    phase: snap.phase,
    winner: snap.winner,
    combatTick: snap.combatTick,
    damage,
    categories,
  };
}

export function neutralInput() {
  return { ...E };
}
