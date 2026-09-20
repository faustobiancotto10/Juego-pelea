# Juanchi Presentation

## Visual authority

Primary: identity master recorded in [PACKAGE](PACKAGE.md).  
Secondary: action sheet recorded in [PACKAGE](PACKAGE.md).

Runtime representation is an articulated procedural Canvas2D rig. Reference rasters never enter the game bundle.

## Presentation metadata

Suggested:
- `rigKey: 'juanchi'`
- `ultimateVisualKey: 'police-cap-rage'`
- projectile `visualKey: 'rugby-ball'`
- fighter accent family: black / gold / warm-white, adapted for readability;
- select role: mid-range pressure / space manipulation;
- ranged availability label exposed to UI.

## Props

Ball:
- in hand only when available;
- leaves hand at authoritative spawn;
- procedural ball visual follows projectile snapshot;
- return/catch restores held prop only after authoritative catch/rearm rules.

Cap:
- belt outside Ultimate;
- hand during windup;
- flight during probe;
- opponent head only after authoritative capture;
- cleared on whiff, interruption, Clash, terminal cleanup.

No duplicate belt+hand+flight cap.

## Selection / UI

Fighter-select representation must preserve:
- dark curls;
- oversized black La 56 shirt;
- black cargos;
- gold details;
- black/white sneakers;
- rugby identity.

Do not use the master photo/illustration itself as the runtime selection portrait if doing so violates the project's no-reference-raster policy. Prefer procedural/rig-driven presentation.

## Stage association

Juanchi is thematically associated with `CANCHA 56`, but stage selection is independent of fighter choice.

See [Cancha 56 contract](../../superpowers/specs/2026-09-20-v06-cancha56-stage-contract.md).
