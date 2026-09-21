export interface AttackPresentationProfile {
  telegraphKey: string;
  trailKey: string;
  contactBurstKey: string;
  auraKey: string;
  groundImpactKey: string;
  intensity: number;
  diagnostic?: boolean;
}

function profile(
  telegraphKey: string,
  trailKey: string,
  contactBurstKey: string,
  auraKey: string,
  groundImpactKey: string,
  intensity: number,
): AttackPresentationProfile {
  return Object.freeze({
    telegraphKey,
    trailKey,
    contactBurstKey,
    auraKey,
    groundImpactKey,
    intensity,
  });
}

const DIAGNOSTIC_MISSING_PROFILE: AttackPresentationProfile = Object.freeze({
  telegraphKey: 'diagnostic-missing',
  trailKey: 'diagnostic-missing',
  contactBurstKey: 'diagnostic-missing',
  auraKey: 'diagnostic-missing',
  groundImpactKey: 'diagnostic-missing',
  intensity: 0.35,
  diagnostic: true,
});

export const ATTACK_PRESENTATION_PROFILES: Readonly<Record<string, AttackPresentationProfile>> = Object.freeze({
  'chameleon:claw1': profile('claw-ready', 'claw-green', 'claw-green', 'none', 'none', 0.52),
  'chameleon:claw2': profile('claw-ready', 'claw-green', 'claw-green', 'none', 'none', 0.62),
  'chameleon:clawLow': profile('claw-low', 'claw-green', 'claw-green', 'none', 'none', 0.58),
  'chameleon:airClaw': profile('claw-air', 'claw-green', 'claw-green', 'none', 'none', 0.66),
  'chameleon:tongueStraight': profile('tongue-load', 'tongue-snap', 'tongue-snap', 'none', 'none', 0.78),
  'chameleon:coletazo': profile('tail-load', 'tail-mass', 'tail-mass', 'none', 'tail-mass', 0.9),
  'chameleon:ultimateCamaleoni': profile('camaleoni-veil', 'camaleoni-veil', 'major-impact', 'camaleoni-veil', 'major-impact', 1),

  'supernariz:nose1': profile('nose-ready', 'nose-curve', 'nose-curve', 'none', 'none', 0.5),
  'supernariz:nose2': profile('nose-ready', 'nose-curve', 'nose-curve', 'none', 'none', 0.58),
  'supernariz:nose3': profile('nose-load', 'nose-curve', 'nose-curve', 'none', 'none', 0.7),
  'supernariz:noseLow': profile('nose-low', 'nose-curve', 'nose-curve', 'none', 'none', 0.58),
  'supernariz:airNose': profile('nose-air', 'nose-curve', 'nose-curve', 'none', 'none', 0.64),
  'supernariz:chorizoThrow': profile('throw-load', 'chorizo-spice', 'chorizo-spice', 'none', 'none', 0.72),
  'supernariz:tramontana': profile('wind-load', 'wind-lanes', 'wind-lanes', 'wind-lanes', 'none', 0.82),
  'supernariz:ultimateSupernariz': profile('suction-load', 'wind-lanes', 'major-impact', 'wind-lanes', 'major-impact', 1),

  'juanchi:juanchiJab': profile('juanchi-ready', 'juanchi-gold', 'juanchi-gold', 'none', 'none', 0.48),
  'juanchi:juanchiShoulder': profile('shoulder-load', 'juanchi-gold', 'juanchi-gold', 'none', 'none', 0.68),
  'juanchi:juanchiLow': profile('juanchi-low', 'juanchi-gold', 'juanchi-gold', 'none', 'none', 0.6),
  'juanchi:juanchiAir': profile('juanchi-air', 'juanchi-gold', 'juanchi-gold', 'none', 'none', 0.64),
  'juanchi:rugbyBoomerangThrow': profile('throw-load', 'juanchi-gold', 'juanchi-gold', 'none', 'none', 0.72),
  'juanchi:friccion': profile('friccion-load', 'friccion-sparks', 'friccion-sparks', 'none', 'none', 0.86),
  'juanchi:policeCapRage': profile('rage-load', 'juanchi-gold', 'major-impact', 'rage-red', 'major-impact', 1),

  'el-toro:toroJab': profile('toro-heavy-ready', 'toro-blue', 'toro-blue', 'none', 'none', 0.58),
  'el-toro:toroShoulder': profile('toro-heavy-load', 'toro-blue', 'toro-blue', 'none', 'turf-heavy', 0.78),
  'el-toro:toroLow': profile('toro-low-load', 'toro-blue', 'toro-blue', 'none', 'none', 0.64),
  'el-toro:toroAir': profile('toro-air-load', 'toro-blue', 'toro-blue', 'none', 'turf-heavy', 0.72),
  'el-toro:shawarmazoThrow': profile('shawarma-load', 'shawarma-warm', 'shawarma-debris', 'none', 'none', 0.82),
  'el-toro:topete': profile('topete-load', 'topete-drive', 'toro-blue', 'none', 'turf-heavy', 0.96),
  'el-toro:superEructo': profile('eructo-load', 'super-eructo-gas', 'major-impact', 'super-eructo-gas', 'turf-heavy', 1),
});

export function resolveAttackPresentationProfile(
  fighterId: string,
  moveId: string | null | undefined,
): AttackPresentationProfile {
  if (!moveId) return DIAGNOSTIC_MISSING_PROFILE;
  return ATTACK_PRESENTATION_PROFILES[`${fighterId}:${moveId}`] ?? DIAGNOSTIC_MISSING_PROFILE;
}
