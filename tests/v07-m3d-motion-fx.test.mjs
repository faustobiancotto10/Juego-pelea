import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CombatSimulation } from '../dist/game/simulation/CombatSimulation.js';
import { getMoveDefinition } from '../dist/game/simulation/moves.js';
import {
  LocomotionPoseTracker,
  getLocomotionStyle,
} from '../dist/game/render/LocomotionPose.js';
import { getAttackPresentationTiming } from '../dist/game/render/PresentationPose.js';

function baseFighter(id, opponent = id === 'supernariz' ? 'chameleon' : 'supernariz') {
  const sim = new CombatSimulation(id, opponent, { skipIntro: true });
  return sim.getSnapshot().fighters[0];
}

function moveSnapshot(id, moveId, moveFrame) {
  return {
    ...baseFighter(id),
    moveId,
    moveFrame,
    ultimatePhase: 'idle',
    grounded: true,
    y: 0,
    jumpStartupFrames: 0,
    capturedBy: null,
    clashRecoveryFrames: 0,
    stunFrames: 0,
    blockstunFrames: 0,
    guardBreakFrames: 0,
    dashKind: null,
  };
}

test('V07-M3D attack envelope builds before contact, peaks on authored active frames and clears in recovery', () => {
  for (const [fighterId, moveId] of [
    ['chameleon', 'tongueStraight'],
    ['supernariz', 'nose3'],
    ['juanchi', 'juanchiShoulder'],
    ['el-toro', 'topete'],
  ]) {
    const move = getMoveDefinition(fighterId, moveId);
    assert.ok(move.hitbox, `${fighterId}:${moveId} needs an authored active window for this test`);
    const start = Math.max(1, move.hitbox.start);
    const end = Math.max(start, move.hitbox.end);

    const idleEdge = getAttackPresentationTiming(moveSnapshot(fighterId, moveId, 0));
    const anticipation = getAttackPresentationTiming(moveSnapshot(fighterId, moveId, Math.max(1, start - 1)));
    const strike = getAttackPresentationTiming(moveSnapshot(fighterId, moveId, start));
    const lateRecovery = getAttackPresentationTiming(moveSnapshot(fighterId, moveId, Math.max(end + 1, move.totalFrames - 1)));

    assert.ok(anticipation.anticipation >= idleEdge.anticipation);
    assert.ok(strike.strike > 0.8, `${fighterId}:${moveId} must peak when its authored active window begins`);
    assert.ok(strike.trail > lateRecovery.trail, `${fighterId}:${moveId} trail must decay instead of persisting through recovery`);
    assert.ok(lateRecovery.recovery > 0.5, `${fighterId}:${moveId} must visibly settle during late recovery`);
  }
});

test('V07-M3D renderer consumes authored timing instead of the old fixed moveFrame/14 pulse', () => {
  const fight = readFileSync('src/game/render/FightRenderer.ts', 'utf8');
  const effects = readFileSync('src/game/render/CombatEffects.ts', 'utf8');

  assert.match(fight, /getAttackPresentationTiming/);
  assert.match(fight, /timing\.anticipation/);
  assert.match(fight, /timing\.trail/);
  assert.match(fight, /timing\.actionPhase/);
  assert.match(fight, /drawAttackTelegraph/);
  assert.doesNotMatch(fight, /fighter\.moveFrame\s*\/\s*14/);

  assert.match(effects, /export function drawAttackTelegraph/);
  assert.match(effects, /topete-load/);
  assert.match(effects, /tongue-load/);
  assert.match(effects, /rage-load/);
  assert.match(effects, /eructo-load/);
});

test('V07-M3D locomotion signatures include stance spread and swing-arc mass without changing simulation authority', () => {
  const chameleon = getLocomotionStyle('chameleon');
  const supernariz = getLocomotionStyle('supernariz');
  const juanchi = getLocomotionStyle('juanchi');
  const toro = getLocomotionStyle('el-toro');

  assert.ok(chameleon.neutralFootSpread < juanchi.neutralFootSpread);
  assert.ok(juanchi.neutralFootSpread < toro.neutralFootSpread);
  assert.ok(chameleon.swingArcPower < 1, 'Camaleoni should have a springier swing arc');
  assert.ok(toro.swingArcPower > 1.25, 'El Toro should have a flatter/heavier swing arc');
  assert.notEqual(supernariz.swingArcPower, juanchi.swingArcPower);

  const tracker = new LocomotionPoseTracker();
  const base = baseFighter('el-toro', 'juanchi');
  const neutral = tracker.sample(0, base, 0, 0);
  assert.equal(neutral.frontFoot.x, toro.neutralFootSpread);
  assert.equal(neutral.backFoot.x, -toro.neutralFootSpread);

  const source = readFileSync('src/game/render/LocomotionPose.ts', 'utf8');
  assert.doesNotMatch(source, /damage|hitbox|hitstun|blockstun|captureReach|collision/i);
});
