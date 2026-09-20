import type { FighterPresentationDefinition } from '../characterContent.js';

export const JUANCHI_CHARACTER_ID = 'juanchi';

export const JUANCHI_PRESENTATION: FighterPresentationDefinition = {
  rigKey: 'juanchi',
  ultimateVisualKey: 'police-cap-rage',
  accent: '#cda434',
  effectAccent: '#f1cd62',
  select: {
    kicker: 'PRESIÓN DE MEDIA DISTANCIA',
    role: 'Mid-range',
    moves: 'Jab · Fricción · Rugby Boomerang / Police Cap Rage',
    mark: '56',
  },
  rangedAvailabilityLabel: 'RUGBY BALL',
};

/**
 * R0 deliberately freezes Juanchi's presentation identity only.
 * The complete CombatCharacterContent is authored in V06-R2 together with the
 * returning projectile, authored multi-hit and cap-capture primitives.
 */
