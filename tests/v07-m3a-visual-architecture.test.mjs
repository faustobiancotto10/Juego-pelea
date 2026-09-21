import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  CHARACTER_STRUCTURES,
  identityLayerFingerprint,
  silhouetteFingerprint,
} from '../dist/game/render/CharacterStructure.js';
import {
  VISUAL_QUALITY_THRESHOLDS,
  inspectRosterVisualGates,
} from '../dist/game/render/VisualQualityGates.js';
import { sampleBaseRigAnchors } from '../dist/game/render/RigAnchors.js';

const ids = ['chameleon', 'supernariz', 'juanchi', 'el-toro'];

test('V07-M3A construction architecture separates anatomy, face, clothing, materials, equipment, motion and effects', () => {
  for (const id of ids) {
    const profile = CHARACTER_STRUCTURES[id];
    assert.ok(profile, `${id} must have a structural profile`);

    for (const [name, value] of Object.entries(profile.detail)) {
      assert.ok(Number.isFinite(value), `${id} detail.${name} must be finite`);
      assert.ok(value >= 0.5 && value <= 2, `${id} detail.${name} must stay normalized`);
    }

    assert.ok(profile.identity.anatomy.length >= 2, `${id} needs authored anatomy cues`);
    assert.ok(profile.identity.headFace.length >= 2, `${id} needs authored head/face cues`);
    assert.ok(profile.identity.silhouette.length >= 2, `${id} needs authored silhouette cues`);
    assert.ok(profile.identity.materialCues.length >= 2, `${id} needs material cues`);
    assert.ok(profile.identity.motionStyle.length >= 2, `${id} needs a motion signature`);
    assert.ok(profile.identity.effectsSignature.length >= 2, `${id} needs an effects signature`);
    assert.ok(
      profile.identity.gameplayScaleCues.length >= VISUAL_QUALITY_THRESHOLDS.minGameplayScaleCues,
      `${id} needs phone-scale identity cues`,
    );
    assert.ok(
      profile.identity.effectsOffActionCues.length >= VISUAL_QUALITY_THRESHOLDS.minEffectsOffActionCues,
      `${id} needs effects-off body-language cues`,
    );
    assert.ok(silhouetteFingerprint(profile).length > 0);
    assert.ok(identityLayerFingerprint(profile).length > 0);
  }
});

test('V07-M3A roster gate harness catches template collapse and passes the authored four-fighter baseline', () => {
  const report = inspectRosterVisualGates();
  assert.equal(report.fighters.length, 4);
  assert.equal(report.pairwiseSilhouettes.length, 6);
  assert.equal(report.passed, true);

  for (const fighter of report.fighters) {
    assert.equal(fighter.passed, true, `${fighter.fighterId} must pass all profile gates`);
    assert.equal(fighter.missingIdentityLayers.length, 0);
    assert.ok(fighter.gameplayScaleCueCount <= VISUAL_QUALITY_THRESHOLDS.maxGameplayScaleCues);
  }

  for (const pair of report.pairwiseSilhouettes) {
    assert.equal(pair.distinctFingerprint, true, `${pair.a}/${pair.b} must not share a silhouette fingerprint`);
    assert.ok(
      pair.structuralDistance >= VISUAL_QUALITY_THRESHOLDS.minPairwiseStructuralDistance,
      `${pair.a}/${pair.b} must remain structurally separated`,
    );
    assert.equal(pair.passed, true);
  }
});

test('V07-M3A shared rig anchors expose anatomy-aware attachment points without changing simulation truth', () => {
  const pose = {
    phase: 0,
    frontFoot: { x: 18, y: 0 },
    backFoot: { x: -18, y: 0 },
    pelvisDrop: 0,
    torsoLean: 0,
    preparation: 0,
    extension: 0,
    tuck: 0,
    descentBrace: 0,
    landingAbsorption: 0,
    movementBlend: 0,
    dashCompression: 0,
    dashDrive: 0,
    clashBrace: 0,
    clashRecoil: 0,
    travelIntent: 'idle',
    actualTravel: 0,
    hipCounterRotation: 0,
    chestCounterRotation: 0,
    freeArmSwing: 0,
    weightTransfer: 0,
  };

  const toro = sampleBaseRigAnchors('el-toro', pose);
  const juanchi = sampleBaseRigAnchors('juanchi', pose);
  const supernariz = sampleBaseRigAnchors('supernariz', pose);

  const toroShoulderSpan = toro.frontShoulder.x - toro.backShoulder.x;
  const juanchiShoulderSpan = juanchi.frontShoulder.x - juanchi.backShoulder.x;
  assert.ok(toroShoulderSpan > juanchiShoulderSpan * 1.18);
  assert.ok((supernariz.face.x - supernariz.head.x) > (juanchi.face.x - juanchi.head.x));
  assert.deepEqual(toro.frontFoot, pose.frontFoot);
  assert.deepEqual(toro.backFoot, pose.backFoot);
});

test('V07-M3A visual gate code remains render-only and reference rasters remain prohibited at runtime', () => {
  const source = [
    readFileSync('src/game/render/CharacterStructure.ts', 'utf8'),
    readFileSync('src/game/render/RigAnchors.ts', 'utf8'),
    readFileSync('src/game/render/VisualQualityGates.ts', 'utf8'),
  ].join('\n');

  assert.doesNotMatch(source, /drawImage\(|new Image\(|identity-master-reference|action-sheet-reference/i);
  assert.doesNotMatch(source, /damage\s*=|hitbox|captureReach|moveLegality|health\s*=/i);
});
