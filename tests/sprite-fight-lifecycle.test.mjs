import test from 'node:test';
import assert from 'node:assert/strict';
import { FightSpriteAssetStore } from '../dist/game/render/sprites/SpriteAssetStore.js';
import { SpriteFightAssetLifecycle } from '../dist/game/render/sprites/SpriteFightAssetLifecycle.js';

function manifest() {
  return {
    version: 1,
    atlas: 'body.webp',
    animations: {
      idle: {
        loop: true,
        frames: [{ x: 0, y: 0, width: 16, height: 24, pivotX: 8, pivotY: 24, durationTicks: 4 }],
      },
    },
  };
}

function presentations() {
  const entries = {
    a: { bodyBackend: 'sprite', spritePackageKey: 'pkg-a' },
    b: { bodyBackend: 'sprite', spritePackageKey: 'pkg-b' },
    c: { bodyBackend: 'procedural' },
    d: { bodyBackend: 'sprite', spritePackageKey: 'pkg-d' },
  };
  return {
    getPresentation(id) {
      const value = entries[id];
      if (!value) throw new Error(`unknown presentation ${id}`);
      return value;
    },
  };
}

test('fight lifecycle loads exactly the two selected sprite packages and reuses them on rematch', async () => {
  const loads = [];
  const store = new FightSpriteAssetStore(async (key) => {
    loads.push(key);
    return { manifest: manifest(), image: { key } };
  });
  const lifecycle = new SpriteFightAssetLifecycle(store, presentations());

  assert.deepEqual(lifecycle.requiredPackageKeys(['a', 'b']), ['pkg-a', 'pkg-b']);
  assert.deepEqual(loads, [], 'selection/key inspection must not preload roster assets');

  await lifecycle.prepare(['a', 'b']);
  assert.deepEqual(loads.sort(), ['pkg-a', 'pkg-b']);

  await lifecycle.prepare(['a', 'b']);
  assert.deepEqual(loads.sort(), ['pkg-a', 'pkg-b'], 'rematch must hit cache rather than reload');
});

test('mixed procedural/sprite fight loads only sprite fighter and changing fighters releases stale packages', async () => {
  const loads = [];
  const store = new FightSpriteAssetStore(async (key) => {
    loads.push(key);
    return { manifest: manifest(), image: { key } };
  });
  const lifecycle = new SpriteFightAssetLifecycle(store, presentations());

  await lifecycle.prepare(['c', 'a']);
  assert.deepEqual(loads, ['pkg-a']);
  assert.equal(store.get('pkg-a').image.key, 'pkg-a');

  await lifecycle.prepare(['c', 'd']);
  assert.deepEqual(loads, ['pkg-a', 'pkg-d']);
  assert.throws(() => store.get('pkg-a'), /not loaded/i);
  assert.equal(store.get('pkg-d').image.key, 'pkg-d');
});

test('duplicate selected package keys collapse to one fight requirement', async () => {
  const sharedPresentations = {
    getPresentation(id) {
      if (id === 'proc') return { bodyBackend: 'procedural' };
      return { bodyBackend: 'sprite', spritePackageKey: 'shared' };
    },
  };
  const loads = [];
  const store = new FightSpriteAssetStore(async (key) => {
    loads.push(key);
    return { manifest: manifest(), image: { key } };
  });
  const lifecycle = new SpriteFightAssetLifecycle(store, sharedPresentations());

  assert.deepEqual(lifecycle.requiredPackageKeys(['one', 'two', 'proc']), ['shared']);
  await lifecycle.prepare(['one', 'two']);
  assert.deepEqual(loads, ['shared']);
});
