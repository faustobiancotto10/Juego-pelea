import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { getLocomotionStyle } from '../dist/game/render/LocomotionPose.js';
import { resolveAttackPresentationProfile } from '../dist/game/render/AttackPresentation.js';
import { DEFAULT_FIGHTER_PRESENTATION_REGISTRY } from '../dist/game/data/presentationRegistry.js';

function recordingContext() {
  const text = [];
  const target = {
    canvas: { width: 320, height: 180 },
    measureText(value) { return { width: String(value).length * 8 }; },
    fillText(value) { text.push(String(value)); },
    createLinearGradient() { return { addColorStop() {} }; },
    createRadialGradient() { return { addColorStop() {} }; },
    __text: text,
  };
  return new Proxy(target, {
    get(obj, key) {
      if (key in obj) return obj[key];
      if (typeof key === 'string' && key.startsWith('__')) return undefined;
      return () => {};
    },
    set(obj, key, value) {
      obj[key] = value;
      return true;
    },
  });
}

test('El Toro receives a bounded heavy render-only locomotion style', () => {
  const toro = getLocomotionStyle('el-toro');
  const juanchi = getLocomotionStyle('juanchi');

  assert.ok(toro.stride <= 50, `heavy stride should be short; got ${toro.stride}`);
  assert.ok(toro.backStrideMultiplier <= 0.8);
  assert.ok(toro.stanceFraction >= 0.64);
  assert.ok(toro.swingFootLift < juanchi.swingFootLift);
  assert.ok(toro.pelvisBobAmplitude <= 1.2);
});

test('El Toro has a registered procedural articulated rig and explicit anchors', () => {
  assert.equal(existsSync('src/game/render/ElToroRig.ts'), true, 'ElToroRig.ts must exist');
  const rig = existsSync('src/game/render/ElToroRig.ts')
    ? readFileSync('src/game/render/ElToroRig.ts', 'utf8')
    : '';
  const fighterRenderer = readFileSync('src/game/render/FighterRenderer.ts', 'utf8');
  const anchors = readFileSync('src/game/render/RigAnchors.ts', 'utf8');

  for (const required of [
    'TE VOY A CHOCAR',
    'Scotland',
    'scarf',
    'shawarma',
    'cargo',
    'drawElToro',
    'sampleElToroAnchors',
  ]) {
    assert.equal(rig.includes(required), true, `El Toro procedural identity missing ${required}`);
  }
  assert.match(fighterRenderer, /'el-toro'\s*:\s*drawElToro/);
  assert.match(fighterRenderer, /sampleElToroAnchors/);
  assert.match(anchors, /el-toro/);

  for (const source of [rig, fighterRenderer]) {
    assert.doesNotMatch(source, /drawImage\(|new Image\(|\.webp|\.png|\.jpe?g|identity-master-reference|action-sheet-reference/i);
  }
});

test('El Toro ordinary, Special and Ultimate moves have bounded attack-presentation profiles', () => {
  const moveIds = [
    'toroJab',
    'toroShoulder',
    'toroLow',
    'toroAir',
    'shawarmazoThrow',
    'topete',
    'superEructo',
  ];
  for (const moveId of moveIds) {
    const profile = resolveAttackPresentationProfile('el-toro', moveId);
    assert.equal(profile.diagnostic, undefined, `${moveId} must not fall back to diagnostic presentation`);
    assert.ok(profile.intensity > 0);
  }

  assert.equal(resolveAttackPresentationProfile('el-toro', 'topete').trailKey, 'topete-drive');
  assert.equal(resolveAttackPresentationProfile('el-toro', 'shawarmazoThrow').contactBurstKey, 'shawarma-debris');
  assert.equal(resolveAttackPresentationProfile('el-toro', 'superEructo').auraKey, 'super-eructo-gas');
});

test('El Toro effects remain procedural and are dispatched from authoritative renderer state', () => {
  const effects = readFileSync('src/game/render/CombatEffects.ts', 'utf8');
  const fight = readFileSync('src/game/render/FightRenderer.ts', 'utf8');

  for (const required of [
    'drawTopeteDrive',
    'drawToroGroundImpact',
    'drawShawarmaProjectile',
    'drawSuperEructoBlast',
    'topete-drive',
    'shawarma-debris',
    'super-eructo-gas',
  ]) {
    assert.equal(effects.includes(required) || fight.includes(required), true, `missing El Toro presentation primitive ${required}`);
  }

  assert.match(fight, /visualKey === 'shawarma'/);
  assert.match(fight, /fighter\.id === 'el-toro'/);
  assert.match(fight, /fighter\.ultimatePhase === 'sequence'/);
  assert.match(fight, /fighter\.ultimatePhaseFrame/);
  assert.doesNotMatch(effects, /damage\s*=|hitbox|collision|captureReach/i);
});

test('all four released portrait keys resolve to procedural portrait renderers with explicit missing diagnostics', async () => {
  const modulePath = '../dist/game/render/PortraitRenderer.js';
  const portraits = await import(modulePath);
  const released = ['chameleon', 'supernariz', 'juanchi', 'el-toro'];

  for (const fighterId of released) {
    const portraitKey = DEFAULT_FIGHTER_PRESENTATION_REGISTRY.getPresentation(fighterId).portraitKey;
    assert.equal(portraits.hasFighterPortrait(portraitKey), true, `${fighterId} portraitKey must resolve`);
    const ctx = recordingContext();
    assert.equal(portraits.drawFighterPortrait(ctx, portraitKey, 180, 140), true);
  }

  const missingCtx = recordingContext();
  assert.equal(portraits.hasFighterPortrait('missing-fighter'), false);
  assert.equal(portraits.drawFighterPortrait(missingCtx, 'missing-fighter', 180, 140), false);
  assert.ok(missingCtx.__text.includes('MISSING PORTRAIT'));

  const source = readFileSync('src/game/render/PortraitRenderer.ts', 'utf8');
  assert.doesNotMatch(source, /drawImage\(|new Image\(|\.webp|\.png|\.jpe?g|docs\/characters\/.*\/references/i);
});

test('portrait renderer contains recognizable procedural identity cues for all four fighters', () => {
  const path = 'src/game/render/PortraitRenderer.ts';
  assert.equal(existsSync(path), true);
  const source = existsSync(path) ? readFileSync(path, 'utf8') : '';

  for (const cue of [
    'drawCamaleoniPortrait',
    'drawSupernarizPortrait',
    'drawJuanchiPortrait',
    'drawElToroPortrait',
    'La 56',
    'TE VOY A CHOCAR',
    'scarf',
    'nose',
    'chameleon',
  ]) {
    assert.equal(source.includes(cue), true, `portrait identity cue missing ${cue}`);
  }
});

test('M2 runtime fighter art has no El Toro reference-raster path', () => {
  for (const path of [
    'src/game/render/ElToroRig.ts',
    'src/game/render/PortraitRenderer.ts',
    'src/game/render/FighterRenderer.ts',
    'src/game/render/FightRenderer.ts',
  ]) {
    if (!existsSync(path)) continue;
    const source = readFileSync(path, 'utf8');
    assert.doesNotMatch(source, /docs\/characters\/el-toro\/references|identity-master-reference|action-sheet-reference|drawImage\(|new Image\(/i);
  }
});


test('Shawarmazo contact burst resolves from authoritative projectile identity after throw recovery', () => {
  const fight = readFileSync('src/game/render/FightRenderer.ts', 'utf8');
  assert.match(fight, /event\.projectileId[\s\S]{0,500}snapshot\.projectiles\.find/);
  assert.match(fight, /visualKey === 'shawarma'[\s\S]{0,240}'shawarma-debris'/);
});

test('Topete turf impact is contact-event driven and never emitted by move-frame timing alone', () => {
  const fight = readFileSync('src/game/render/FightRenderer.ts', 'utf8');
  assert.match(fight, /burst\.key === 'topete-drive'[\s\S]{0,360}drawToroGroundImpact/);
  assert.doesNotMatch(
    fight,
    /fighter\.moveFrame >= 10[\s\S]{0,360}drawToroGroundImpact/,
  );
});
