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
      headWidth: 0.82,
      headHeight: 1.08,
      neckWidth: 0.72,
      shoulderWidth: 0.76,
      torsoWidth: 0.72,
      torsoLength: 1.08,
      armThickness: 0.72,
      forearmThickness: 0.64,
      hipWidth: 0.74,
      legThickness: 0.68,
      legLength: 1.12,
    },
    stance: {
      width: 1.18,
      crouch: 0.18,
      forwardLean: 0.11,
      centerOfMass: 'low-forward',
    },
    silhouette: {
      primaryMass: 'long',
      headProfile: 'narrow-wedge-crest',
      legProfile: 'long-digitigrade',
      accents: ['long-tail', 'angular-crest', 'claw-hands'],
    },
  }),
  supernariz: freezeProfile({
    id: 'supernariz',
    body: {
      headWidth: 0.88,
      headHeight: 1.14,
      neckWidth: 0.84,
      shoulderWidth: 0.86,
      torsoWidth: 0.82,
      torsoLength: 1.16,
      armThickness: 0.78,
      forearmThickness: 0.72,
      hipWidth: 0.82,
      legThickness: 0.76,
      legLength: 1.14,
    },
    stance: {
      width: 0.88,
      crouch: 0.05,
      forwardLean: -0.015,
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
      headWidth: 0.94,
      headHeight: 1.00,
      neckWidth: 0.96,
      shoulderWidth: 0.98,
      torsoWidth: 0.94,
      torsoLength: 0.96,
      armThickness: 0.92,
      forearmThickness: 0.90,
      hipWidth: 0.92,
      legThickness: 0.90,
      legLength: 1.04,
    },
    stance: {
      width: 0.96,
      crouch: 0.08,
      forwardLean: 0.035,
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
      headWidth: 1.20,
      headHeight: 0.90,
      neckWidth: 1.32,
      shoulderWidth: 1.38,
      torsoWidth: 1.32,
      torsoLength: 0.88,
      armThickness: 1.28,
      forearmThickness: 1.30,
      hipWidth: 1.16,
      legThickness: 1.12,
      legLength: 0.90,
    },
    stance: {
      width: 1.34,
      crouch: 0.20,
      forwardLean: 0.10,
      centerOfMass: 'low-forward',
    },
    silhouette: {
      primaryMass: 'top-heavy',
      headProfile: 'broad-square-shaggy',
      legProfile: 'short-wide-planted',
      accents: ['wedge-torso', 'thick-neck', 'wide-planted-knees', 'heavy-forearms'],
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
