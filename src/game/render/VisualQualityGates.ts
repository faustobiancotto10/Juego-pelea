import {
  CHARACTER_STRUCTURES,
  identityLayerFingerprint,
  silhouetteFingerprint,
  structuralDistance,
  type CharacterIdentityLayers,
  type CharacterStructure,
} from './CharacterStructure.js';

export const VISUAL_QUALITY_THRESHOLDS = Object.freeze({
  minPairwiseStructuralDistance: 0.32,
  minIdentityCoverage: 8,
  minGameplayScaleCues: 2,
  maxGameplayScaleCues: 4,
  minEffectsOffActionCues: 2,
});

const REQUIRED_IDENTITY_LAYERS: readonly (keyof CharacterIdentityLayers)[] = Object.freeze([
  'anatomy',
  'headFace',
  'silhouette',
  'materialCues',
  'motionStyle',
  'effectsSignature',
  'gameplayScaleCues',
  'effectsOffActionCues',
]);

export interface FighterVisualGateReport {
  fighterId: string;
  silhouetteFingerprint: string;
  identityFingerprint: string;
  identityCoverage: number;
  missingIdentityLayers: readonly string[];
  gameplayScaleCueCount: number;
  effectsOffActionCueCount: number;
  silhouetteGate: boolean;
  identityGate: boolean;
  gameplayScaleGate: boolean;
  effectsOffActionReadabilityGate: boolean;
  passed: boolean;
}

export interface PairwiseSilhouetteGate {
  a: string;
  b: string;
  structuralDistance: number;
  distinctFingerprint: boolean;
  passed: boolean;
}

export interface RosterVisualGateReport {
  fighters: readonly FighterVisualGateReport[];
  pairwiseSilhouettes: readonly PairwiseSilhouetteGate[];
  passed: boolean;
}

function uniqueNonEmpty(values: readonly string[]): readonly string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

export function inspectFighterVisualGates(profile: CharacterStructure): FighterVisualGateReport {
  const missingIdentityLayers = REQUIRED_IDENTITY_LAYERS.filter(
    (key) => uniqueNonEmpty(profile.identity[key]).length === 0,
  );
  const identityCoverage = REQUIRED_IDENTITY_LAYERS.length - missingIdentityLayers.length;
  const gameplayScaleCueCount = uniqueNonEmpty(profile.identity.gameplayScaleCues).length;
  const effectsOffActionCueCount = uniqueNonEmpty(profile.identity.effectsOffActionCues).length;

  const silhouetteGate = profile.silhouette.accents.length >= 2
    && profile.identity.silhouette.length >= 2
    && silhouetteFingerprint(profile).length > 0;
  const identityGate = missingIdentityLayers.length === 0
    && identityCoverage >= VISUAL_QUALITY_THRESHOLDS.minIdentityCoverage
    && identityLayerFingerprint(profile).length > 0;
  const gameplayScaleGate = gameplayScaleCueCount >= VISUAL_QUALITY_THRESHOLDS.minGameplayScaleCues
    && gameplayScaleCueCount <= VISUAL_QUALITY_THRESHOLDS.maxGameplayScaleCues;
  const effectsOffActionReadabilityGate =
    effectsOffActionCueCount >= VISUAL_QUALITY_THRESHOLDS.minEffectsOffActionCues;

  return Object.freeze({
    fighterId: profile.id,
    silhouetteFingerprint: silhouetteFingerprint(profile),
    identityFingerprint: identityLayerFingerprint(profile),
    identityCoverage,
    missingIdentityLayers: Object.freeze([...missingIdentityLayers]),
    gameplayScaleCueCount,
    effectsOffActionCueCount,
    silhouetteGate,
    identityGate,
    gameplayScaleGate,
    effectsOffActionReadabilityGate,
    passed: silhouetteGate && identityGate && gameplayScaleGate && effectsOffActionReadabilityGate,
  });
}

export function inspectPairwiseSilhouetteGate(
  a: CharacterStructure,
  b: CharacterStructure,
): PairwiseSilhouetteGate {
  const distance = structuralDistance(a, b);
  const distinctFingerprint = silhouetteFingerprint(a) !== silhouetteFingerprint(b);
  return Object.freeze({
    a: a.id,
    b: b.id,
    structuralDistance: distance,
    distinctFingerprint,
    passed: distinctFingerprint
      && distance >= VISUAL_QUALITY_THRESHOLDS.minPairwiseStructuralDistance,
  });
}

export function inspectRosterVisualGates(
  structures: Readonly<Record<string, CharacterStructure>> = CHARACTER_STRUCTURES,
): RosterVisualGateReport {
  const profiles = Object.values(structures);
  const fighters = profiles.map(inspectFighterVisualGates);
  const pairwiseSilhouettes: PairwiseSilhouetteGate[] = [];

  for (let i = 0; i < profiles.length; i += 1) {
    for (let j = i + 1; j < profiles.length; j += 1) {
      pairwiseSilhouettes.push(inspectPairwiseSilhouetteGate(profiles[i]!, profiles[j]!));
    }
  }

  return Object.freeze({
    fighters: Object.freeze(fighters),
    pairwiseSilhouettes: Object.freeze(pairwiseSilhouettes),
    passed: fighters.every((fighter) => fighter.passed)
      && pairwiseSilhouettes.every((pair) => pair.passed),
  });
}
