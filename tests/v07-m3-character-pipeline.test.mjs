import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  CHARACTER_STRUCTURES,
  getCharacterStructure,
  structuralDistance,
  silhouetteFingerprint,
} from '../dist/game/render/CharacterStructure.js';

const ids = ['chameleon', 'supernariz', 'juanchi', 'el-toro'];

test('V07-M3 exposes four bounded structural profiles with deliberate pairwise differentiation', () => {
  assert.deepEqual(Object.keys(CHARACTER_STRUCTURES).sort(), [...ids].sort());

  for (const id of ids) {
    const profile = getCharacterStructure(id);
    assert.equal(profile.id, id);
    for (const [name, value] of Object.entries(profile.body)) {
      assert.ok(Number.isFinite(value), `${id} body.${name} must be finite`);
      assert.ok(value >= 0.5 && value <= 2, `${id} body.${name} must stay bounded`);
    }
    assert.ok(profile.stance.width >= 0.5 && profile.stance.width <= 2);
    assert.ok(profile.stance.crouch >= 0 && profile.stance.crouch <= 1);
    assert.ok(profile.stance.forwardLean >= -1 && profile.stance.forwardLean <= 1);
    assert.ok(profile.silhouette.accents.length >= 2);
  }

  for (let i = 0; i < ids.length; i += 1) {
    for (let j = i + 1; j < ids.length; j += 1) {
      const a = getCharacterStructure(ids[i]);
      const b = getCharacterStructure(ids[j]);
      assert.ok(
        structuralDistance(a, b) >= 0.32,
        `${ids[i]} and ${ids[j]} structural profiles are too similar`,
      );
      assert.notEqual(
        silhouetteFingerprint(a),
        silhouetteFingerprint(b),
        `${ids[i]} and ${ids[j]} silhouettes must fingerprint differently`,
      );
    }
  }
});

test('El Toro is structurally broader, heavier and more planted than Juanchi without cosmetics', () => {
  const toro = getCharacterStructure('el-toro');
  const juanchi = getCharacterStructure('juanchi');

  assert.equal(toro.silhouette.primaryMass, 'top-heavy');
  assert.equal(toro.stance.centerOfMass, 'low-forward');
  assert.ok(toro.body.shoulderWidth >= juanchi.body.shoulderWidth * 1.24);
  assert.ok(toro.body.torsoWidth >= juanchi.body.torsoWidth * 1.24);
  assert.ok(toro.body.armThickness >= juanchi.body.armThickness * 1.24);
  assert.ok(toro.body.forearmThickness >= juanchi.body.forearmThickness * 1.24);
  assert.ok(toro.body.legThickness >= juanchi.body.legThickness * 1.15);
  assert.ok(toro.stance.width >= juanchi.stance.width * 1.22);
  assert.ok(toro.body.legLength < juanchi.body.legLength);
  assert.notEqual(toro.silhouette.headProfile, juanchi.silhouette.headProfile);
});

test('all four fighter rigs consume the structural profile layer and keep gameplay authority out of render', () => {
  const files = {
    chameleon: 'src/game/render/ChameleonRig.ts',
    supernariz: 'src/game/render/SupernarizRig.ts',
    juanchi: 'src/game/render/JuanchiRig.ts',
    'el-toro': 'src/game/render/ElToroRig.ts',
  };

  for (const [id, path] of Object.entries(files)) {
    const source = readFileSync(path, 'utf8');
    assert.match(source, /getCharacterStructure/);
    assert.match(source, new RegExp(`getCharacterStructure\\(['"]${id}['"]\\)`));
    assert.doesNotMatch(source, /damage\s*=|hitbox|captureReach|moveLegality|health\s*=/i);
    assert.doesNotMatch(source, /drawImage\(|new Image\(|identity-master-reference|action-sheet-reference/i);
  }
});

test('portraits derive proportions from the same structural profiles instead of unrelated body art', () => {
  const source = readFileSync('src/game/render/PortraitRenderer.ts', 'utf8');
  assert.match(source, /getCharacterStructure/);
  for (const id of ids) {
    assert.match(source, new RegExp(`getCharacterStructure\\(['"]${id}['"]\\)`));
  }
  assert.match(source, /body\.headWidth/);
  assert.match(source, /body\.headHeight/);
  assert.match(source, /body\.shoulderWidth/);
  assert.match(source, /body\.torsoWidth/);
  assert.doesNotMatch(source, /drawImage\(|new Image\(|docs\/characters\/.*\/references/i);
});

test('locomotion styles encode four different masses/postures rather than defaulting three fighters', async () => {
  const { getLocomotionStyle } = await import('../dist/game/render/LocomotionPose.js');
  const styles = ids.map((id) => [id, getLocomotionStyle(id)]);

  for (const [id, style] of styles) {
    assert.ok(style.weightTransferScale > 0, `${id} needs authored start/stop weight transfer`);
    assert.ok(style.hipCounterRotationAmplitude > 0, `${id} needs authored hip counter-motion`);
    assert.ok(style.chestCounterRotationAmplitude > 0, `${id} needs authored chest counter-motion`);
    assert.ok(style.freeArmSwingAmplitude > 0, `${id} needs authored arm counter-swing`);
  }

  const signatures = new Set(styles.map(([, s]) =>
    [s.stride,s.stanceFraction,s.swingFootLift,s.pelvisBobAmplitude,s.forwardTorsoLean,s.weightTransferScale].join('|')
  ));
  assert.equal(signatures.size, 4, 'all four fighters need distinct locomotion signatures');

  const toro = getLocomotionStyle('el-toro');
  const juanchi = getLocomotionStyle('juanchi');
  assert.ok(toro.stanceFraction > juanchi.stanceFraction);
  assert.ok(toro.swingFootLift < juanchi.swingFootLift);
  assert.ok(toro.pelvisBobAmplitude < juanchi.pelvisBobAmplitude);
  assert.ok(toro.weightTransferScale > juanchi.weightTransferScale);
});

test('Character Pipeline V2 remains runtime procedural and authoring tools stay non-runtime', () => {
  const structure = readFileSync('src/game/render/CharacterStructure.ts', 'utf8');
  const packageJson = readFileSync('package.json', 'utf8');
  const runtime = [
    structure,
    readFileSync('src/game/render/ChameleonRig.ts', 'utf8'),
    readFileSync('src/game/render/SupernarizRig.ts', 'utf8'),
    readFileSync('src/game/render/JuanchiRig.ts', 'utf8'),
    readFileSync('src/game/render/ElToroRig.ts', 'utf8'),
    readFileSync('src/game/render/PortraitRenderer.ts', 'utf8'),
  ].join('\n');

  assert.doesNotMatch(runtime, /synfig|opentoonz|inkscape|\.sifz?|\.svg|\.webp|\.png|\.jpg/i);
  assert.doesNotMatch(packageJson, /synfig|opentoonz|inkscape|rive/i);
});
