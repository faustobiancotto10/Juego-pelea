import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FightSpriteAssetStore,
  createBrowserSpritePackageLoader,
} from '../dist/game/render/sprites/SpriteAssetStore.js';
import { SpritePackageRegistry } from '../dist/game/render/sprites/SpritePackageRegistry.js';

function manifest(key = 'idle') {
  return {
    version: 1,
    atlas: 'body.webp',
    mirrorSafe: true,
    animations: {
      [key]: {
        loop: true,
        frames: [{ x: 0, y: 0, width: 32, height: 48, pivotX: 16, pivotY: 46, durationTicks: 4 }],
      },
    },
  };
}

test('fight-scoped asset store loads selected unique package keys exactly once', async () => {
  const calls = [];
  const loader = async (key) => {
    calls.push(key);
    return { manifest: manifest(), image: { key } };
  };
  const store = new FightSpriteAssetStore(loader);

  await store.preload(['a', 'b', 'a']);
  assert.deepEqual(calls.sort(), ['a', 'b']);
  assert.equal(store.get('a').image.key, 'a');
  assert.equal(store.get('b').image.key, 'b');

  await store.preload(['a', 'b']);
  assert.deepEqual(calls.sort(), ['a', 'b']);
});

test('asset store surfaces missing package diagnostics and supports fight-scope release', async () => {
  const store = new FightSpriteAssetStore(async (key) => ({
    manifest: manifest(),
    image: { key },
  }));
  await store.preload(['a', 'b', 'unused']);

  store.releaseExcept(['a', 'b']);
  assert.equal(store.get('a').image.key, 'a');
  assert.equal(store.get('b').image.key, 'b');
  assert.throws(() => store.get('unused'), /sprite package.*unused.*not loaded/i);
  assert.throws(() => store.get('missing'), /sprite package.*missing.*not loaded/i);

  store.clear();
  assert.throws(() => store.get('a'), /not loaded/i);
});

test('package registry rejects malformed registration metadata', () => {
  assert.throws(
    () => new SpritePackageRegistry({ bad: { manifestUrl: '' } }),
    /manifestUrl/i,
  );
  assert.throws(
    () => new SpritePackageRegistry({ '': { manifestUrl: 'assets/bad/animations.json' } }),
    /package key/i,
  );
  const registry = new SpritePackageRegistry({ good: { manifestUrl: 'assets/good/animations.json' } });
  assert.equal(registry.get('good').manifestUrl, 'assets/good/animations.json');
  assert.throws(() => registry.get('unknown'), /unknown sprite package/i);
});

test('browser package loader validates manifest atlas before image decode and resolves relative atlas URL', async () => {
  const registry = new SpritePackageRegistry({
    good: { manifestUrl: 'assets/fighters/good/animations.json' },
    bad: { manifestUrl: 'assets/fighters/bad/animations.json' },
  });

  let imageUrl = null;
  const goodLoader = createBrowserSpritePackageLoader(registry, {
    baseUrl: 'https://game.test/',
    fetchJson: async () => manifest(),
    loadImage: async (url) => {
      imageUrl = url;
      return { url };
    },
  });
  const loaded = await goodLoader('good');
  assert.equal(loaded.manifest.version, 1);
  assert.equal(imageUrl, 'https://game.test/assets/fighters/good/body.webp');

  let decoded = false;
  const badLoader = createBrowserSpritePackageLoader(registry, {
    baseUrl: 'https://game.test/',
    fetchJson: async () => ({ ...manifest(), atlas: '' }),
    loadImage: async () => {
      decoded = true;
      return {};
    },
  });
  await assert.rejects(() => badLoader('bad'), /atlas/i);
  assert.equal(decoded, false);
});
