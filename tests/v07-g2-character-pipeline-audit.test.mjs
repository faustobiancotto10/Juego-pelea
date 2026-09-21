import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import {
  CHARACTER_STRUCTURES,
  structuralDistance,
} from '../dist/game/render/CharacterStructure.js';
import {
  inspectRosterVisualGates,
  VISUAL_QUALITY_THRESHOLDS,
} from '../dist/game/render/VisualQualityGates.js';
import {
  PORTRAIT_KEYS,
  hasFighterPortrait,
} from '../dist/game/render/PortraitRenderer.js';

const ROSTER = ['chameleon', 'supernariz', 'juanchi', 'el-toro'];

function read(path) {
  return readFileSync(path, 'utf8');
}

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...walk(path));
    else out.push(path);
  }
  return out;
}

test('V07-G2 all four fighters remain structurally distinct without relying on color/text/accessories', () => {
  const report = inspectRosterVisualGates();
  assert.equal(report.passed, true);
  assert.equal(report.fighters.length, 4);
  assert.equal(report.pairwiseSilhouettes.length, 6);

  for (const id of ROSTER) {
    const profile = CHARACTER_STRUCTURES[id];
    assert.ok(profile, `${id} needs a shared character structure`);
    assert.ok(profile.identity.anatomy.length >= 2, `${id} needs anatomy identity independent of costume`);
    assert.ok(profile.identity.headFace.length >= 2, `${id} needs head/face identity independent of costume`);
    assert.ok(profile.identity.silhouette.length >= 2, `${id} needs silhouette identity independent of costume`);
  }

  for (let i = 0; i < ROSTER.length; i += 1) {
    for (let j = i + 1; j < ROSTER.length; j += 1) {
      const a = CHARACTER_STRUCTURES[ROSTER[i]];
      const b = CHARACTER_STRUCTURES[ROSTER[j]];
      assert.ok(
        structuralDistance(a, b) >= VISUAL_QUALITY_THRESHOLDS.minPairwiseStructuralDistance,
        `${ROSTER[i]}/${ROSTER[j]} collapsed below structural gate`,
      );
    }
  }
});

test('V07-G2 El Toro and Juanchi no longer share the same body template', () => {
  const juanchi = CHARACTER_STRUCTURES.juanchi;
  const toro = CHARACTER_STRUCTURES['el-toro'];

  assert.ok(toro.body.torsoWidth > juanchi.body.torsoWidth * 1.15, 'El Toro torso must be materially broader');
  assert.ok(toro.body.shoulderWidth > juanchi.body.shoulderWidth * 1.15, 'El Toro shoulders must be materially broader');
  assert.ok(toro.body.neckWidth > juanchi.body.neckWidth * 1.15, 'El Toro neck mass must be materially heavier');
  assert.ok(toro.stance.width > juanchi.stance.width * 1.15, 'El Toro stance must be materially wider');
  assert.notEqual(toro.silhouette.primaryMass, juanchi.silhouette.primaryMass);
  assert.notEqual(toro.silhouette.headProfile, juanchi.silhouette.headProfile);
  assert.notEqual(toro.silhouette.legProfile, juanchi.silhouette.legProfile);
});

test('V07-G2 Camaleoni and Supernariz keep dominant non-costume silhouette signatures', () => {
  const cam = CHARACTER_STRUCTURES.chameleon;
  const nariz = CHARACTER_STRUCTURES.supernariz;
  const others = ROSTER.filter(id => id !== 'supernariz').map(id => CHARACTER_STRUCTURES[id]);

  assert.ok(cam.identity.anatomy.includes('long-scaled-neck'));
  assert.ok(cam.identity.silhouette.includes('spiral-tail'));
  assert.ok(cam.body.torsoWidth < CHARACTER_STRUCTURES.juanchi.body.torsoWidth);
  assert.ok(cam.body.torsoWidth < CHARACTER_STRUCTURES['el-toro'].body.torsoWidth);

  assert.ok(nariz.identity.silhouette.includes('projecting-nose'));
  assert.ok(nariz.identity.silhouette.includes('cape-wedge'));
  assert.ok(
    others.every(profile => nariz.detail.faceProjection > profile.detail.faceProjection),
    'Supernariz must keep the strongest face projection in the roster',
  );
});

test('V07-G2 portraits and gameplay rigs consume the same CharacterStructure identity authority', () => {
  assert.deepEqual([...PORTRAIT_KEYS], ROSTER);
  for (const id of ROSTER) assert.equal(hasFighterPortrait(id), true, `${id} portrait missing`);

  const portrait = read('src/game/render/PortraitRenderer.ts');
  assert.match(portrait, /getCharacterStructure/);

  const paths = {
    chameleon: 'src/game/render/ChameleonRig.ts',
    supernariz: 'src/game/render/SupernarizRig.ts',
    juanchi: 'src/game/render/JuanchiRig.ts',
    'el-toro': 'src/game/render/ElToroRig.ts',
  };

  for (const [id, path] of Object.entries(paths)) {
    const rig = read(path);
    const escaped = id.replace('-', '\\-');
    assert.match(rig, /getCharacterStructure/);
    assert.match(rig, new RegExp(`getCharacterStructure\\(['"]${escaped}['"]\\)`));
    assert.match(portrait, new RegExp(`getCharacterStructure\\(['"]${escaped}['"]\\)`));
  }
});

test('V07-G2 effects-off evidence renders representative actions directly from rigs', () => {
  const evidence = read('tools/character-pipeline-v2/visual-evidence.html');

  assert.match(evidence, /import \{ drawElToro \} from '\/dist\/game\/render\/ElToroRig\.js'/);
  assert.doesNotMatch(evidence, /CombatEffects|FightRenderer/);
  assert.match(evidence, /mode === 'actions'/);
  assert.match(evidence, /moveId:'toroShoulder'/);
  assert.match(evidence, /moveId:'topete'/);
  assert.match(evidence, /moveId:'superEructo'/);
  assert.match(evidence, /ultimatePhase:'startup'/);
});

test('V07-G2 candidate render path does not load reference/tool raster fighter art', () => {
  const runtimeFiles = walk('src/game/render').filter(path => /\.(ts|js)$/.test(path));
  const source = runtimeFiles.map(read).join('\n');

  assert.doesNotMatch(source, /identity-master-reference|action-sheet-reference|docs\/characters\/[^\s'"]*references/i);
  assert.doesNotMatch(source, /new\s+Image\s*\(/);
  assert.doesNotMatch(source, /\.src\s*=\s*['"][^'"]*\.(png|jpe?g|webp|gif)/i);

  const portrait = read('src/game/render/PortraitRenderer.ts');
  assert.doesNotMatch(portrait, /drawImage\s*\(|<img|\.png|\.jpe?g|\.webp/i);
});

test('V07-G2 renderer remains a consumer of combat truth rather than a combat authority', () => {
  const changedRenderFiles = [
    'src/game/render/ChameleonRig.ts',
    'src/game/render/CharacterStructure.ts',
    'src/game/render/CombatEffects.ts',
    'src/game/render/ElToroRig.ts',
    'src/game/render/FightRenderer.ts',
    'src/game/render/JuanchiRig.ts',
    'src/game/render/LocomotionPose.ts',
    'src/game/render/PresentationPose.ts',
    'src/game/render/RigAnchors.ts',
    'src/game/render/SupernarizRig.ts',
    'src/game/render/VisualQualityGates.ts',
  ];
  const source = changedRenderFiles.map(read).join('\n');

  assert.doesNotMatch(source, /from ['"][^'"]*CombatSimulation\.js['"]/);
  assert.doesNotMatch(source, /\.(health|guard|superMeter|stunFrames|blockstunFrames|guardBreakFrames)\s*=/);
  assert.doesNotMatch(source, /\bapplyDamage\s*\(|\bresolveMoveHits\s*\(|\bstartUltimate\s*\(/);
});
