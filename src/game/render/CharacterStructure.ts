export type CenterOfMassBias = 'rear' | 'center' | 'forward' | 'low-forward' | 'low-center';
export type PrimaryMass = 'top-heavy' | 'balanced' | 'bottom-heavy' | 'compact' | 'long';

export interface CharacterBodyStructure {
  headWidth: number;
  headHeight: number;
  neckWidth: number;
  shoulderWidth: number;
  torsoWidth: number;
  torsoLength: number;
  armThickness: number;
  forearmThickness: number;
  hipWidth: number;
  legThickness: number;
  legLength: number;
}

export interface CharacterStanceStructure {
  width: number;
  crouch: number;
  forwardLean: number;
  centerOfMass: CenterOfMassBias;
}

export interface CharacterSilhouetteStructure {
  primaryMass: PrimaryMass;
  headProfile: string;
  legProfile: string;
  accents: readonly string[];
}

export interface CharacterStructure {
  id: string;
  body: CharacterBodyStructure;
  stance: CharacterStanceStructure;
  silhouette: CharacterSilhouetteStructure;
}

function freezeProfile(profile: CharacterStructure): CharacterStructure {
  return Object.freeze({
    ...profile,
    body: Object.freeze({ ...profile.body }),
    stance: Object.freeze({ ...profile.stance }),
    silhouette: Object.freeze({
      ...profile.silhouette,
      accents: Object.freeze([...profile.silhouette.accents]),
    }),
  });
}

/**
 * Render-only structural authority for fighter identity.
 *
 * Values are normalized multipliers around the original procedural rigs.
 * Simulation never reads this module. Character identity is intentionally
 * encoded in anatomy, stance and mass distribution before clothing/effects.
 */
export const CHARACTER_STRUCTURES: Readonly<Record<string, CharacterStructure>> = Object.freeze({
  chameleon: freezeProfile({
    id: 'chameleon',
    body: {
      headWidth: 1.12,
      headHeight: 1.10,
      neckWidth: 0.66,
      shoulderWidth: 0.68,
      torsoWidth: 0.64,
      torsoLength: 0.98,
      armThickness: 0.60,
      forearmThickness: 0.56,
      hipWidth: 0.68,
      legThickness: 0.64,
      legLength: 1.02,
    },
    stance: {
      width: 1.06,
      crouch: 0.12,
      forwardLean: 0.08,
      centerOfMass: 'low-forward',
    },
    silhouette: {
      primaryMass: 'long',
      headProfile: 'oversized-human-curly',
      legProfile: 'slim-reptile',
      accents: ['spiral-tail', 'oversized-human-head', 'small-claw-hands', 'scale-texture'],
    },
  }),
  supernariz: freezeProfile({
    id: 'supernariz',
    body: {
      headWidth: 0.76,
      headHeight: 0.74,
      neckWidth: 0.80,
      shoulderWidth: 0.98,
      torsoWidth: 0.86,
      torsoLength: 1.12,
      armThickness: 0.86,
      forearmThickness: 0.84,
      hipWidth: 0.84,
      legThickness: 0.84,
      legLength: 1.16,
    },
    stance: {
      width: 0.92,
      crouch: 0.06,
      forwardLean: 0.005,
      centerOfMass: 'center',
    },
    silhouette: {
      primaryMass: 'long',
      headProfile: 'tall-oval-projecting-nose',
      legProfile: 'long-upright',
      accents: ['projecting-nose', 'cape-wedge', 'narrow-waist'],
    },
  }),
  juanchi: freezeProfile({
    id: 'juanchi',
    body: {
      headWidth: 0.74,
      headHeight: 0.72,
      neckWidth: 0.90,
      shoulderWidth: 1.08,
      torsoWidth: 0.96,
      torsoLength: 1.04,
      armThickness: 1.04,
      forearmThickness: 1.02,
      hipWidth: 0.94,
      legThickness: 0.98,
      legLength: 1.16,
    },
    stance: {
      width: 0.98,
      crouch: 0.07,
      forwardLean: 0.03,
      centerOfMass: 'center',
    },
    silhouette: {
      primaryMass: 'balanced',
      headProfile: 'compact-curly-oval',
      legProfile: 'athletic-neutral',
      accents: ['compact-shoulders', 'relaxed-free-arm', 'rugby-ball-side'],
    },
  }),
  'el-toro': freezeProfile({
    id: 'el-toro',
    body: {
      headWidth: 0.80,
      headHeight: 0.74,
      neckWidth: 1.16,
      shoulderWidth: 1.30,
      torsoWidth: 1.22,
      torsoLength: 1.00,
      armThickness: 1.16,
      forearmThickness: 1.18,
      hipWidth: 1.13,
      legThickness: 1.08,
      legLength: 1.10,
    },
    stance: {
      width: 1.18,
      crouch: 0.14,
      forwardLean: 0.075,
      centerOfMass: 'low-forward',
    },
    silhouette: {
      primaryMass: 'top-heavy',
      headProfile: 'broad-round-mullet',
      legProfile: 'wide-cargo-planted',
      accents: ['oversized-shirt', 'scotland-scarf', 'mullet', 'cargo-pockets', 'blue-wraps'],
    },
  }),
});

const DEFAULT_STRUCTURE = CHARACTER_STRUCTURES.juanchi!;

export function getCharacterStructure(fighterId: string): CharacterStructure {
  return CHARACTER_STRUCTURES[fighterId] ?? DEFAULT_STRUCTURE;
}

export function structuralDistance(a: CharacterStructure, b: CharacterStructure): number {
  const bodyKeys: readonly (keyof CharacterBodyStructure)[] = [
    'headWidth',
    'headHeight',
    'neckWidth',
    'shoulderWidth',
    'torsoWidth',
    'torsoLength',
    'armThickness',
    'forearmThickness',
    'hipWidth',
    'legThickness',
    'legLength',
  ];
  let sum = 0;
  for (const key of bodyKeys) sum += Math.abs(a.body[key] - b.body[key]);
  sum += Math.abs(a.stance.width - b.stance.width);
  sum += Math.abs(a.stance.crouch - b.stance.crouch);
  sum += Math.abs(a.stance.forwardLean - b.stance.forwardLean);
  if (a.stance.centerOfMass !== b.stance.centerOfMass) sum += 0.12;
  if (a.silhouette.primaryMass !== b.silhouette.primaryMass) sum += 0.18;
  if (a.silhouette.headProfile !== b.silhouette.headProfile) sum += 0.12;
  if (a.silhouette.legProfile !== b.silhouette.legProfile) sum += 0.08;
  return sum / 4;
}

export function silhouetteFingerprint(profile: CharacterStructure): string {
  const b = profile.body;
  const s = profile.stance;
  return [
    profile.silhouette.primaryMass,
    profile.silhouette.headProfile,
    profile.silhouette.legProfile,
    b.headWidth.toFixed(2),
    b.headHeight.toFixed(2),
    b.shoulderWidth.toFixed(2),
    b.torsoWidth.toFixed(2),
    b.torsoLength.toFixed(2),
    b.armThickness.toFixed(2),
    b.legThickness.toFixed(2),
    b.legLength.toFixed(2),
    s.width.toFixed(2),
    s.crouch.toFixed(2),
    s.forwardLean.toFixed(3),
  ].join('|');
}
