import test from 'node:test';
import assert from 'node:assert/strict';
import { CombatSimulation } from '../dist/game/simulation/CombatSimulation.js';
import { CpuController } from '../dist/game/simulation/CpuController.js';

function mutableSnapshot(sim) {
  return structuredClone(sim.getSnapshot());
}

test('CPU approaches when outside its preferred range', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  const snap = mutableSnapshot(sim);
  snap.fighters[0].x = 200;
  snap.fighters[1].x = 1050;
  const cpu = new CpuController(1);
  const input = cpu.nextInput(snap);
  assert.equal(input.left, true);
  assert.equal(input.right, false);
});

test('CPU attacks at close range instead of random movement', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  const snap = mutableSnapshot(sim);
  snap.fighters[0].x = 590;
  snap.fighters[1].x = 680;
  const cpu = new CpuController(1);
  const input = cpu.nextInput(snap);
  assert.equal(input.attack, true);
});

test('CPU holds away to block a nearby threatening move', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  const snap = mutableSnapshot(sim);
  snap.frame = 31;
  snap.fighters[0].x = 560;
  snap.fighters[1].x = 700;
  snap.fighters[0].moveId = 'tongueStraight';
  snap.fighters[0].moveFrame = 7;
  snap.fighters[1].facing = -1;
  const cpu = new CpuController(1);
  const input = cpu.nextInput(snap);
  assert.equal(input.right, true);
  assert.equal(input.attack, false);
});

test('Supernariz CPU uses chorizo when far and cooldown is ready', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  const snap = mutableSnapshot(sim);
  snap.frame = 120;
  snap.fighters[0].x = 300;
  snap.fighters[1].x = 820;
  snap.fighters[1].projectileCooldown = 0;
  const cpu = new CpuController(1);
  const input = cpu.nextInput(snap);
  assert.equal(input.special, true);
});
