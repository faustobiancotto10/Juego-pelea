import test from 'node:test';
import assert from 'node:assert/strict';
import { CombatSimulation } from '../dist/game/simulation/CombatSimulation.js';
import { EMPTY_INPUT as E } from '../dist/game/types.js';

const input = (patch = {}) => ({ ...E, ...patch });
const dir = (patch = {}) => ({ left: false, right: false, up: false, down: false, ...patch });
const cmd = (action, direction = dir()) => ({ action, direction });

function stepN(sim, frames, p1 = E, p2 = E) {
  let snap = sim.getSnapshot();
  for (let i = 0; i < frames; i += 1) snap = sim.step(p1, p2);
  return snap;
}

test('command edge pressed and released entirely during hitstop survives until combat advances', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  sim.hitstopFrames = 3;

  let snap = sim.step(input({ commands: [cmd('attack')] }), E);
  assert.equal(snap.hitstopFrames, 2);
  assert.equal(snap.fighters[0].moveId, null);

  snap = sim.step(input({ commands: [] }), E);
  assert.equal(snap.hitstopFrames, 1);
  snap = sim.step(input({ commands: [] }), E);
  assert.equal(snap.hitstopFrames, 0);
  assert.equal(snap.fighters[0].moveId, null);

  snap = sim.step(input({ commands: [] }), E);
  assert.equal(snap.fighters[0].moveId, 'claw1');
});

test('legacy action edge during hitstop is queued even though held state is released before hitstop ends', () => {
  const sim = new CombatSimulation('supernariz', 'chameleon', { skipIntro: true });
  sim.hitstopFrames = 2;

  sim.step(input({ attack: true }), E);
  sim.step(E, E);
  const snap = sim.step(E, E);

  assert.equal(snap.fighters[0].moveId, 'nose1');
});

test('defined empty commands suppress legacy held booleans and cannot double-trigger actions', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });

  let snap = sim.step(input({ attack: true, commands: [] }), E);
  assert.equal(snap.fighters[0].moveId, null);

  snap = sim.step(input({ attack: true, commands: [cmd('attack')] }), E);
  assert.equal(snap.fighters[0].moveId, 'claw1');

  for (let i = 0; i < 30; i += 1) {
    snap = sim.step(input({ attack: true, commands: [] }), E);
  }
  assert.equal(snap.fighters[0].moveId, null, 'held boolean with commands=[] must not auto-repeat');
});

test('same-sample command priority is Ultimate > Push Guard > Special > Attack > Jump', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', {
    skipIntro: true,
    initialSuper: [100, 0],
  });

  const snap = sim.step(input({
    commands: [
      cmd('jump'),
      cmd('attack'),
      cmd('special'),
      cmd('ultimate'),
    ],
  }), E);

  assert.equal(snap.fighters[0].ultimatePhase, 'startup');
  assert.equal(snap.fighters[0].moveId, 'ultimateCamaleoni');
});

test('latest new command replaces an older unconsumed command', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  sim.fighters[0].stunFrames = 3;

  sim.step(input({ commands: [cmd('attack')] }), E);
  sim.step(input({ commands: [cmd('special')] }), E);
  let snap = sim.step(input({ commands: [] }), E);
  assert.equal(snap.fighters[0].moveId, null);

  snap = sim.step(input({ commands: [] }), E);
  assert.equal(snap.fighters[0].moveId, 'tongueStraight');
});

test('pending command expires after six advancing combat frames and hitstop does not age it', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  sim.fighters[0].stunFrames = 7;

  sim.step(input({ commands: [cmd('attack')] }), E);
  sim.hitstopFrames = 4;
  const tickBefore = sim.getSnapshot().combatTick;
  stepN(sim, 4, input({ commands: [] }), E);
  assert.equal(sim.getSnapshot().combatTick, tickBefore, 'hitstop must freeze combatTick and command expiry');

  const snap = stepN(sim, 8, input({ commands: [] }), E);
  assert.equal(snap.fighters[0].moveId, null, 'expired command must not resurrect after stun');
});

test('buffered Special uses direction at press time rather than current held direction', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  const fighter = sim.fighters[0];
  fighter.currentMove = sim.registry.getMove('chameleon', 'claw1');
  fighter.moveId = 'claw1';
  fighter.moveFrame = 17;
  fighter.moveHasHit = false;

  let snap = sim.step(input({
    down: true,
    commands: [cmd('special', dir({ down: true }))],
  }), E);
  assert.equal(snap.fighters[0].moveId, 'claw1');

  snap = sim.step(input({ right: true, commands: [] }), E);
  assert.equal(snap.fighters[0].moveId, 'coletazo', 'buffered down+SPECIAL must stay Coletazo after direction changes');
});

test('down modifier grace survives brief thumb release but explicit up cancels the grace', () => {
  const grace = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  grace.step(input({ down: true, commands: [] }), E);
  grace.step(input({ commands: [] }), E);
  const graceSnap = grace.step(input({ commands: [cmd('special', dir())] }), E);
  assert.equal(graceSnap.fighters[0].moveId, 'coletazo');

  const up = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  up.step(input({ down: true, commands: [] }), E);
  const upSnap = up.step(input({
    up: true,
    commands: [cmd('special', dir({ up: true }))],
  }), E);
  assert.equal(upSnap.fighters[0].moveId, 'tongueStraight');
});

test('resetInputState clears pending commands without advancing combat', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  sim.fighters[0].stunFrames = 2;
  const before = sim.getSnapshot();

  sim.step(input({ commands: [cmd('attack')] }), E);
  const tick = sim.getSnapshot().combatTick;
  sim.resetInputState();
  assert.equal(sim.getSnapshot().combatTick, tick);

  const snap = stepN(sim, 4, input({ commands: [] }), E);
  assert.equal(snap.fighters[0].moveId, null);
  assert.ok(sim.getSnapshot().frame > before.frame);
});

test('invalid resource command is consumed without freezing an existing move clock', () => {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  let snap = sim.step(input({ commands: [cmd('attack')] }), E);
  assert.equal(snap.fighters[0].moveId, 'claw1');
  assert.equal(snap.fighters[0].moveFrame, 0);

  snap = sim.step(input({ commands: [cmd('ultimate')] }), E);
  assert.equal(snap.fighters[0].ultimatePhase, 'idle');
  assert.equal(snap.fighters[0].moveId, 'claw1');
  assert.equal(snap.fighters[0].moveFrame, 1);
});
