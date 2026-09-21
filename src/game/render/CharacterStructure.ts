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

export interface CharacterDetailStructure {
  jawWidth: number;
  faceProjection: number;
  hairMass: number;
  chestDepth: number;
  waistWidth: number;
  handScale: number;
  footScale: number;
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

export interface CharacterIdentityLayers {
  anatomy: readonly string[];
  headFace: readonly string[];
  silhouette: readonly string[];
  clothingLayers: readonly string[];
  materialCues: readonly string[];
  equipment: readonly string[];
  motionStyle: readonly string[];
  effectsSignature: readonly string[];
  gameplayScaleCues: readonly string[];
  effectsOffActionCues: readonly string[];
}

export interface CharacterStructure {
  id: string;
  body: CharacterBodyStructure;
  detail: CharacterDetailStructure;
  stance: CharacterStanceStructure;
  silhouette: CharacterSilhouetteStructure;
  identity: CharacterIdentityLayers;
}

function freezeStrings(values: readonly string[]): readonly string[] {
  return Object.freeze([...values]);
}

function freezeProfile(profile: CharacterStructure): CharacterStructure {
  return Object.freeze({
    ...profile,
    body: Object.freeze({ ...profile.body }),
    detail: Object.freeze({ ...profile.detail }),
    stance: Object.freeze({ ...profile.stance }),
    silhouette: Object.freeze({
      ...profile.silhouette,
      accents: freezeStrings(profile.silhouette.accents),
    }),
    identity: Object.freeze({
      anatomy: freezeStrings(profile.identity.anatomy),
      headFace: freezeStrings(profile.identity.headFace),
      silhouette: freezeStrings(profile.identity.silhouette),
      clothingLayers: freezeStrings(profile.identity.clothingLayers),
      materialCues: freezeStrings(profile.identity.materialCues),
      equipment: freezeStrings(profile.identity.equipment),
      motionStyle: freezeStrings(profile.identity.motionStyle),
      effectsSignature: freezeStrings(profile.identity.effectsSignature),
      gameplayScaleCues: freezeStrings(profile.identity.gameplayScaleCues),
      effectsOffActionCues: freezeStrings(profile.identity.effectsOffActionCues),
    }),
  });
}

/**
 * Render-only structural authority for fighter identity.
 *
 * Values are normalized multipliers around the procedural rigs. Simulation
 * never reads this module. Identity is intentionally split into anatomy,
 * head/face, silhouette, clothing, materials, equipment, motion and effects
 * so specialist lanes can improve one layer without collapsing every fighter
 * back into the same body template.
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
    detail: {
      jawWidth: 0.88,
      faceProjection: 0.92,
      hairMass: 1.18,
      chestDepth: 0.66,
      waistWidth: 0.70,
      handScale: 0.72,
      footScale: 0.78,
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
    identity: {
      anatomy: ['narrow-reptile-torso', 'long-scaled-neck', 'small-claw-extremities'],
      headFace: ['oversized-human-head', 'curly-hair-mass', 'human-face-on-reptile-neck'],
      silhouette: ['head-neck-stack', 'spiral-tail', 'slim-reptile-legs'],
      clothingLayers: [],
      materialCues: ['scale-field', 'skin-plane-contrast'],
      equipment: [],
      motionStyle: ['low-forward-prowl', 'tail-counterbalance', 'light-claw-reach'],
      effectsSignature: ['green-claw-arcs', 'tongue-snap-trail', 'tail-sweep-mass-cue'],
      gameplayScaleCues: ['oversized-head', 'long-neck', 'spiral-tail'],
      effectsOffActionCues: ['neck-drive-before-tongue', 'torso-coil-before-tail-sweep'],
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
    detail: {
      jawWidth: 0.80,
      faceProjection: 1.72,
      hairMass: 0.92,
      chestDepth: 0.90,
      waistWidth: 0.76,
      handScale: 0.90,
      footScale: 0.96,
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
    identity: {
      anatomy: ['long-upright-human', 'narrow-waist', 'moderate-shoulders'],
      headFace: ['canonical-bulbous-long-nose', 'tall-oval-head', 'nose-led-profile'],
      silhouette: ['projecting-nose', 'cape-wedge', 'long-upright-legs'],
      clothingLayers: ['blue-suit-base', 'red-cape-layer', 'belt-layer'],
      materialCues: ['suit-panel-shading', 'cape-fold-volume', 'emblem-contrast'],
      equipment: ['chest-nose-emblem', 'belt-sausage-props'],
      motionStyle: ['upright-hero-brace', 'nose-led-strike', 'cape-follow-through'],
      effectsSignature: ['curved-nose-trails', 'compact-impact-flash', 'layered-wind-lanes'],
      gameplayScaleCues: ['projecting-nose', 'red-cape', 'blue-red-suit-block'],
      effectsOffActionCues: ['head-and-chest-load-before-nose-strike', 'cape-lag-on-recovery'],
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
    detail: {
      jawWidth: 0.90,
      faceProjection: 0.88,
      hairMass: 1.10,
      chestDepth: 1.02,
      waistWidth: 0.90,
      handScale: 1.00,
      footScale: 1.00,
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
    identity: {
      anatomy: ['athletic-human-frame', 'balanced-torso-leg-mass', 'mobile-shoulders'],
      headFace: ['compact-curly-head', 'youthful-oval-face', 'clean-human-profile'],
      silhouette: ['athletic-neutral', 'rugby-ball-side', 'relaxed-free-arm'],
      clothingLayers: ['black-gold-streetwear', 'waist-tied-jacket', 'cargo-trouser-layer'],
      materialCues: ['streetwear-panel-contrast', 'fabric-folds', 'cargo-seams'],
      equipment: ['rugby-ball', 'police-cap-ultimate-prop'],
      motionStyle: ['shorter-athletic-stride', 'free-arm-counter-swing', 'shoulder-led-rush'],
      effectsSignature: ['gold-white-attack-accents', 'rugby-boomerang-trail', 'red-rage-aura'],
      gameplayScaleCues: ['black-gold-block', 'waist-jacket', 'rugby-ball'],
      effectsOffActionCues: ['shoulder-load-before-drive', 'hand-rub-build-before-palm-release'],
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
    detail: {
      jawWidth: 1.10,
      faceProjection: 0.96,
      hairMass: 1.30,
      chestDepth: 1.24,
      waistWidth: 1.12,
      handScale: 1.12,
      footScale: 1.10,
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
    identity: {
      anatomy: ['broad-heavy-human-frame', 'thick-neck-shoulder-block', 'planted-rugby-base'],
      headFace: ['broad-round-face', 'mullet-hair-mass', 'thick-neck-transition'],
      silhouette: ['oversized-shirt-volume', 'scotland-scarf', 'wide-cargo-legs'],
      clothingLayers: ['oversized-white-shirt', 'scotland-scarf', 'cargo-trousers', 'blue-wraps'],
      materialCues: ['shirt-cloth-volume', 'scarf-layering-fringe', 'cargo-pocket-seams'],
      equipment: ['shawarma-projectile-cue', 'south-africa-rugby-band-cues'],
      motionStyle: ['heavy-planted-step', 'low-forward-line-breaker', 'massive-shoulder-drive'],
      effectsSignature: ['topete-ground-mass', 'shawarma-trail-debris', 'super-eructo-pressure-wave'],
      gameplayScaleCues: ['broad-top-heavy-body', 'scotland-scarf', 'wide-cargo-silhouette'],
      effectsOffActionCues: ['deep-load-before-topete', 'torso-expansion-before-eructo-release'],
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
  const detailKeys: readonly (keyof CharacterDetailStructure)[] = [
    'jawWidth',
    'faceProjection',
    'hairMass',
    'chestDepth',
    'waistWidth',
    'handScale',
    'footScale',
  ];
  let sum = 0;
  for (const key of bodyKeys) sum += Math.abs(a.body[key] - b.body[key]);
  for (const key of detailKeys) sum += Math.abs(a.detail[key] - b.detail[key]) * 0.65;
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
  const d = profile.detail;
  const s = profile.stance;
  return [
    profile.silhouette.primaryMass,
    profile.silhouette.headProfile,
    profile.silhouette.legProfile,
    b.headWidth.toFixed(2),
    b.headHeight.toFixed(2),
    b.neckWidth.toFixed(2),
    b.shoulderWidth.toFixed(2),
    b.torsoWidth.toFixed(2),
    b.torsoLength.toFixed(2),
    b.armThickness.toFixed(2),
    b.hipWidth.toFixed(2),
    b.legThickness.toFixed(2),
    b.legLength.toFixed(2),
    d.jawWidth.toFixed(2),
    d.faceProjection.toFixed(2),
    d.hairMass.toFixed(2),
    d.chestDepth.toFixed(2),
    d.waistWidth.toFixed(2),
    d.footScale.toFixed(2),
    s.width.toFixed(2),
    s.crouch.toFixed(2),
    s.forwardLean.toFixed(3),
  ].join('|');
}

export function identityLayerFingerprint(profile: CharacterStructure): string {
  const i = profile.identity;
  return [
    ...i.anatomy,
    ...i.headFace,
    ...i.silhouette,
    ...i.clothingLayers,
    ...i.materialCues,
    ...i.equipment,
    ...i.motionStyle,
    ...i.effectsSignature,
    ...i.gameplayScaleCues,
    ...i.effectsOffActionCues,
  ].join('|');
}
