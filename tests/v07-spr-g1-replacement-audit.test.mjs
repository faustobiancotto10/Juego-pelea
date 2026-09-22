import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';

import { DEFAULT_CHARACTER_COMPOSITION } from '../dist/game/data/characterContent.js';
import { DEFAULT_FIGHTER_PRESENTATION_REGISTRY } from '../dist/game/data/presentationRegistry.js';
import {
  FightSpriteAssetStore,
  createBrowserSpritePackageLoader,
} from '../dist/game/render/sprites/SpriteAssetStore.js';
import { SpriteFightAssetLifecycle } from '../dist/game/render/sprites/SpriteFightAssetLifecycle.js';
import { SpriteFighterRenderer } from '../dist/game/render/sprites/SpriteFighterRenderer.js';
import { DEFAULT_SPRITE_PACKAGE_REGISTRY } from '../dist/game/render/sprites/SpritePackageRegistry.js';
import { parseRgbaPng } from '../scripts/sprite-png-alpha.mjs';

const ASSET_ROOT=resolve('assets/fighters/el-toro');
const MANIFEST_PATH=join(ASSET_ROOT,'el-toro-animations.json');
const ATLAS_PATH=join(ASSET_ROOT,'el-toro-body.png');
const manifest=JSON.parse(readFileSync(MANIFEST_PATH,'utf8'));

function fighter(overrides={}) {
  return {
    id:'el-toro',
    x:500,
    y:0,
    vx:0,
    vy:0,
    facing:1,
    health:1100,
    maxHealth:1100,
    guard:100,
    maxGuard:100,
    guardRegenDelay:0,
    guardBreakFrames:0,
    grounded:true,
    jumpStartupFrames:0,
    airborneTicks:0,
    crouching:false,
    blocking:false,
    stunFrames:0,
    blockstunFrames:0,
    moveId:null,
    moveFrame:0,
    comboCount:0,
    moveContact:'none',
    chilledFrames:0,
    projectileCooldown:0,
    projectileCooldownMax:96,
    rangedAvailability:'ready',
    rangedRecoveryFrames:0,
    dashKind:null,
    dashFrame:0,
    landingRecoveryFrames:0,
    pushGuardRecoveryFrames:0,
    superMeter:0,
    maxSuper:100,
    superReady:false,
    ultimatePhase:'idle',
    ultimatePhaseFrame:0,
    ultimateConnected:false,
    ultimateTarget:null,
    ultimateEffectiveTick:null,
    ultimateProbe:null,
    captureAnchorX:null,
    clashRecoveryFrames:0,
    capturedBy:null,
    roundWins:0,
    ...overrides,
  };
}

function fakeContext() {
  const calls=[];
  return {
    calls,
    ctx:{
      globalAlpha:1,
      save(){calls.push(['save']);},
      restore(){calls.push(['restore']);},
      translate(x,y){calls.push(['translate',x,y]);},
      scale(x,y){calls.push(['scale',x,y]);},
      drawImage(...args){calls.push(['drawImage',...args]);},
    },
  };
}

test('V07-SPR-G1 replacement keeps four-fighter V0.7 composition and live El Toro sprite presentation', () => {
  assert.deepEqual(
    DEFAULT_CHARACTER_COMPOSITION.playableIds,
    ['chameleon','supernariz','juanchi','el-toro'],
  );
  const presentation=DEFAULT_FIGHTER_PRESENTATION_REGISTRY.getPresentation('el-toro');
  assert.equal(presentation.bodyBackend,'sprite');
  assert.equal(presentation.spritePackageKey,'el-toro');
});

test('V07-SPR-G1 replacement browser loader resolves the exact served El Toro manifest and atlas', async () => {
  const registration=DEFAULT_SPRITE_PACKAGE_REGISTRY.get('el-toro');
  assert.equal(registration.manifestUrl,'assets/fighters/el-toro/el-toro-animations.json');

  let fetchedUrl=null;
  let imageUrl=null;
  const loader=createBrowserSpritePackageLoader(DEFAULT_SPRITE_PACKAGE_REGISTRY,{
    baseUrl:'https://game.test/',
    fetchJson:async (url)=>{
      fetchedUrl=url;
      return JSON.parse(readFileSync(MANIFEST_PATH,'utf8'));
    },
    loadImage:async (url)=>{
      imageUrl=url;
      return {url};
    },
  });

  const loaded=await loader('el-toro');
  assert.equal(fetchedUrl,'https://game.test/assets/fighters/el-toro/el-toro-animations.json');
  assert.equal(imageUrl,'https://game.test/assets/fighters/el-toro/el-toro-body.png');
  assert.equal(loaded.manifest.runtimeLoadable,true);
  assert.equal(loaded.manifest.mirrorSafe,false);
  assert.deepEqual(loaded.manifest.blockingGates,[]);
});

test('V07-SPR-G1 selected-fight lifecycle loads only El Toro sprite package and reuses it', async () => {
  const loads=[];
  const store=new FightSpriteAssetStore(async (key)=>{
    loads.push(key);
    return {manifest,image:{key}};
  });
  const lifecycle=new SpriteFightAssetLifecycle(store,DEFAULT_FIGHTER_PRESENTATION_REGISTRY);

  assert.deepEqual(lifecycle.requiredPackageKeys(['chameleon','el-toro']),['el-toro']);
  await lifecycle.prepare(['chameleon','el-toro']);
  await lifecycle.prepare(['chameleon','el-toro']);
  assert.deepEqual(loads,['el-toro'],'rematch must reuse the already-loaded package');
});

test('V07-SPR-G1 authored RIGHT and LEFT gameplay rendering use different atlas frames with no horizontal mirror', () => {
  const image={id:'runtime-el-toro-atlas'};
  const renderer=new SpriteFighterRenderer({
    get(key){
      assert.equal(key,'el-toro');
      return {manifest,image};
    },
  });

  const right=fakeContext();
  renderer.draw(right.ctx,fighter({facing:1}),'el-toro',10,1,0);
  const left=fakeContext();
  renderer.resetPresentation();
  renderer.draw(left.ctx,fighter({facing:-1}),'el-toro',10,1,0);

  const rightScale=right.calls.find((call)=>call[0]==='scale');
  const leftScale=left.calls.find((call)=>call[0]==='scale');
  assert.deepEqual(rightScale,['scale',1,1]);
  assert.deepEqual(leftScale,['scale',1,1],'authored LEFT must never be implemented by canvas mirroring');

  const rightDraw=right.calls.find((call)=>call[0]==='drawImage');
  const leftDraw=left.calls.find((call)=>call[0]==='drawImage');
  assert.ok(rightDraw);
  assert.ok(leftDraw);
  assert.notDeepEqual(
    rightDraw.slice(2,6),
    leftDraw.slice(2,6),
    'RIGHT and LEFT idle must resolve to distinct authored atlas rectangles',
  );

  const rightHead=renderer.sampleAnchor(fighter({facing:1}),'el-toro',10,'head',0);
  renderer.resetPresentation();
  const leftHead=renderer.sampleAnchor(fighter({facing:-1}),'el-toro',10,'head',0);
  for (const point of [rightHead,leftHead]) {
    assert.ok(point);
    assert.equal(Number.isFinite(point.x),true);
    assert.equal(Number.isFinite(point.y),true);
  }
});

test('V07-SPR-G1 runtime atlas is a normalized derivative with bounded decoded mobile memory', () => {
  assert.equal(existsSync(MANIFEST_PATH),true);
  assert.equal(existsSync(ATLAS_PATH),true);
  const png=parseRgbaPng(readFileSync(ATLAS_PATH));
  assert.ok(png.width>0 && png.width<=2048,'atlas width must stay within the packer mobile-safe bound');
  assert.ok(png.height>0);
  const decodedBytes=png.width*png.height*4;
  assert.ok(decodedBytes<64*1024*1024,`decoded body atlas unexpectedly exceeds 64 MiB: ${decodedBytes}`);
});

test('V07-SPR-G1 normal build asset copier materializes exact runtime bytes into dist', () => {
  rmSync(resolve('dist/assets'),{recursive:true,force:true});
  const run=spawnSync(process.execPath,['scripts/copy-runtime-assets.mjs'],{encoding:'utf8'});
  assert.equal(run.status,0,run.stderr);
  const distRoot=resolve('dist/assets/fighters/el-toro');
  assert.deepEqual(
    readFileSync(join(distRoot,'el-toro-animations.json')),
    readFileSync(MANIFEST_PATH),
  );
  assert.deepEqual(
    readFileSync(join(distRoot,'el-toro-body.png')),
    readFileSync(ATLAS_PATH),
  );
});
