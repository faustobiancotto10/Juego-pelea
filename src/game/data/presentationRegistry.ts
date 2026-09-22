import {
  RELEASED_CHARACTER_PACKAGES,
  createFighterPresentationRegistry,
} from './characterContent.js';

export type { FighterBodyBackend } from '../render/sprites/SpriteManifest.js';

export type {
  FighterPresentationDefinition,
  FighterPresentationRegistry,
} from './characterContent.js';

export { createFighterPresentationRegistry } from './characterContent.js';

export const DEFAULT_FIGHTER_PRESENTATION_REGISTRY =
  createFighterPresentationRegistry(RELEASED_CHARACTER_PACKAGES);
