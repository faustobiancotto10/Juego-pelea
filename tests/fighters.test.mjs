import test from 'node:test';
import assert from 'node:assert/strict';
import { FIGHTER_IDS, FIGHTERS } from '../dist/game/data/fighters.js';

test('contains exactly the two V0.1 fighters', () => {
  assert.deepEqual([...FIGHTER_IDS].sort(), ['chameleon', 'supernariz']);
});

test('fighters have distinct gameplay identities', () => {
  assert.notEqual(FIGHTERS.chameleon.walkSpeed, FIGHTERS.supernariz.walkSpeed);
  assert.notEqual(FIGHTERS.chameleon.role, FIGHTERS.supernariz.role);
});
