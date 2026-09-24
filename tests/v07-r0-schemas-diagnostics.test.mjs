import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_CHARACTER_COMPOSITION,
  composeCharacterContent,
} from '../dist/game/data/characterContent.js';
import { CombatSimulation } from '../dist/game/simulation/CombatSimulation.js';
import { CpuController } from '../dist/game/simulation/CpuController.js';
import { EMPTY_INPUT as E } from '../dist/game/types.js';
import { fourthCharacterPackage } from './fixtures/v06-character-package.mjs';

const input = (patch = {}) => ({ ...E, ...patch });

function forwardBlastPackage() {
  const pkg = structuredClone(fourthCharacterPackage);
  pkg.ultimates['fixture-four-ultimate'] = {
    key: 'fixture-four-ultimate',
    kind: 'forwardBlast',
    startupFrames: 26,
    captureFrames: 18,
    recoveryFrames: 30,
    captureReach: 390,
    captureVertical: 145,
    blastFrames: 18,
    blastRange: 390,
    blastBottom: 20,
    blastTop: 145,
    sequenceFrames: 18,
    sequenceOffsetX: 0,
    sequenceHits: [
      { frame: 2, damage: 45, knockback: 3, chipDamage: 2, guardDamage: 8, hitstun: 10, blockstun: 6, blockKnockback: 1.5, hitstop: 4 },
      { frame: 8, damage: 45, knockback: 4, chipDamage: 2, guardDamage: 8, hitstun: 12, blockstun: 6, blockKnockback: 1.8, hitstop: 4 },
      { frame: 14, damage: 90, knockback: 15, chipDamage: 4, guardDamage: 16, hitstun: 28, blockstun: 9, blockKnockback: 3, hitstop: 10 },
    ],
    releaseKnockback: 15,
    releaseVx: 15,
    releaseVy: 5,
    releaseHitstun: 28,
    finalHitstop: 10,
    visualKey: 'fixture-forward-blast',
  };
  return pkg;
}

test('V07-R0 presentation contract requires a stable portraitKey for released fighters', () => {
  for (const id of ['chameleon', 'supernariz', 'juanchi']) {
    const presentation = DEFAULT_CHARACTER_COMPOSITION.presentations[id];
    assert.equal(presentation.portraitKey, id);
  }

  const malformed = structuredClone(fourthCharacterPackage);
  malformed.presentation.portraitKey = '';
  assert.throws(
    () => composeCharacterContent([malformed], []),
    /portraitKey: must be a non-empty string/,
  );
});

test('V07-R0 committed movement schema is bounded to forward wall-stopping Specials', () => {
  const valid = structuredClone(fourthCharacterPackage);
  valid.moves.fourClose.movement = {
    start: 8,
    end: 16,
    speed: 11,
    kind: 'forward',
    stopAtWall: true,
  };
  assert.doesNotThrow(() => composeCharacterContent([valid], []));

  for (const mutate of [
    pkg => { pkg.moves.fourClose.movement.end = pkg.moves.fourClose.totalFrames; },
    pkg => { pkg.moves.fourClose.movement.speed = Number.NaN; },
    pkg => { pkg.moves.fourClose.movement.kind = 'homing'; },
    pkg => { pkg.moves.fourClose.movement.stopAtWall = false; },
  ]) {
    const malformed = structuredClone(valid);
    mutate(malformed);
    assert.throws(() => composeCharacterContent([malformed], []));
  }

  const normal = structuredClone(valid);
  normal.moves.fourJab.movement = { ...valid.moves.fourClose.movement };
  assert.throws(() => composeCharacterContent([normal], []), /only supported for special moves/);
});

test('V07-R0 forwardBlast validates bounded forward geometry and authored contact beats', () => {
  const valid = forwardBlastPackage();
  assert.doesNotThrow(() => composeCharacterContent([valid], []));

  const badRange = forwardBlastPackage();
  badRange.ultimates['fixture-four-ultimate'].blastRange = Number.POSITIVE_INFINITY;
  assert.throws(() => composeCharacterContent([badRange], []), /blastRange: must be finite/);

  const badBand = forwardBlastPackage();
  badBand.ultimates['fixture-four-ultimate'].blastTop = 20;
  assert.throws(() => composeCharacterContent([badBand], []), /blastTop: must be greater than blastBottom/);

  const mismatchedFrames = forwardBlastPackage();
  mismatchedFrames.ultimates['fixture-four-ultimate'].captureFrames = 17;
  assert.throws(() => composeCharacterContent([mismatchedFrames], []), /must match blastFrames/);

  const missingGuardData = forwardBlastPackage();
  delete missingGuardData.ultimates['fixture-four-ultimate'].sequenceHits[0].guardDamage;
  assert.throws(() => composeCharacterContent([missingGuardData], []), /guardDamage: must be finite/);
});

function runLenguaApproachBaseline() {
  const sim = new CombatSimulation('chameleon', 'supernariz', { skipIntro: true });
  sim.fighters[0].x = 500;
  sim.fighters[1].x = 840;
  let snap = sim.getSnapshot();
  let attempts = 0;
  let blocked = 0;
  let minSeparation = Math.abs(snap.fighters[1].x - snap.fighters[0].x);

  for (let tick = 0; tick < 240; tick += 1) {
    const canStart = snap.fighters[0].moveId === null
      && snap.fighters[0].grounded
      && snap.fighters[0].stunFrames === 0
      && snap.fighters[0].blockstunFrames === 0;
    const p1 = canStart && attempts < 6 ? input({ special: true }) : E;
    if (p1.special) attempts += 1;

    const tongueCommitted = snap.fighters[0].moveId === 'tongueStraight'
      && snap.fighters[0].moveFrame <= 15;
    const p2 = tongueCommitted ? input({ right: true }) : input({ left: true });
    snap = sim.step(p1, p2);

    blocked += snap.events.filter(
      event => event.type === 'hit'
        && event.attacker === 0
        && event.defender === 1
        && event.moveId === 'tongueStraight'
        && event.blocked,
    ).length;
    minSeparation = Math.min(minSeparation, Math.abs(snap.fighters[1].x - snap.fighters[0].x));
  }

  return {
    attempts,
    blocked,
    finalSeparation: Number(Math.abs(snap.fighters[1].x - snap.fighters[0].x).toFixed(3)),
    minSeparation: Number(minSeparation.toFixed(3)),
  };
}

test('V07-R0 Lengua repeated-use approach diagnostic is deterministic before tuning', () => {
  const first = runLenguaApproachBaseline();
  const second = runLenguaApproachBaseline();
  assert.deepEqual(second, first);
  assert.ok(first.attempts > 0);
  console.log('V07-R0 Lengua baseline:', JSON.stringify(first));
});

function runCpuBaseline(fighterId, seed) {
  const opponent = fighterId === 'chameleon' ? 'supernariz' : 'chameleon';
  const sim = new CombatSimulation(opponent, fighterId, { skipIntro: true });
  const cpu = new CpuController(1, { seed });
  let snap = sim.getSnapshot();
  const trace = [];

  for (let tick = 0; tick < 180; tick += 1) {
    const out = cpu.nextInput(snap);
    trace.push([
      snap.combatTick,
      Number(out.left),
      Number(out.right),
      Number(out.down),
      Number(out.jump),
      Number(out.attack),
      Number(out.special),
      Number(out.ultimate ?? false),
      Number(out.pushGuard ?? false),
    ].join(':'));
    snap = sim.step(E, out);
  }
  return trace;
}

test('V07-R0 CPU policy baseline corpus replays identically for fixed fighter/seed inputs', () => {
  const rows = [];
  for (const fighterId of ['chameleon', 'supernariz', 'juanchi']) {
    for (const seed of [113, 313]) {
      const first = runCpuBaseline(fighterId, seed);
      const second = runCpuBaseline(fighterId, seed);
      assert.deepEqual(second, first, `${fighterId} seed=${seed}`);
      rows.push({ fighterId, seed, traceLength: first.length });
    }
  }
  console.log('V07-R0 CPU normal-policy baseline:', JSON.stringify(rows));
});
