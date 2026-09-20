import test from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_COMBAT_REGISTRY } from '../../dist/game/data/combatRegistry.js';

test('nested character tests are discovered by the release runner', () => {
  assert.equal(DEFAULT_COMBAT_REGISTRY.playableIds.includes('juanchi'), true);
  assert.ok(DEFAULT_COMBAT_REGISTRY.playableIds.length >= 3);
});
