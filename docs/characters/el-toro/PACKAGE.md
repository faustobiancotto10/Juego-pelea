# El Toro — Character Intake Package

ID candidate: `el-toro`  
Display name: **EL TORO**  
Status: CONCEPT / VISUAL_REFERENCE_SUPPLIED / GAMEPLAY_BRIEF_SUPPLIED  
Implementation: NOT STARTED  
Round: none

## Source visual references

Two user-supplied images were provided on 2026-09-20.

### Identity master
Original source SHA-256:
`ef687b886b113777e75c0ce5097367300a36c21b6c74be9f1842960e07909241`

Authority:
- face/hair/body proportions;
- outfit;
- scarf/wraps/accessories;
- overall stylized-realistic identity.

### Action / sprite-sheet reference
Original source SHA-256:
`40565969e1dae2612ddccaaa11c772a2536b45c4e45f0c18768673a7e8940f97`

Authority:
- intended pose/action language;
- Topete/Shawarmazo/Super Eructo visual concept;
- projectile/effect direction;
- hit/knockdown silhouette references.

The supplied images are **authoring references only**. They must never be cropped, imported, bundled or rendered as runtime fighter sprites/textures.

Binary repository copies were not persisted in this intake step; the source hashes above identify the user-supplied masters. Astra must not claim pixel-level likeness inspection from repository data alone. The written transcription below is durable and authoritative until a later repository copy is added.

## Visual identity transcription

Identity-master cues:
- broad/stocky rugby-player build;
- shaggy medium-long dark brown hair;
- white oversized shirt with bold black `TE VOY A CHOCAR` text;
- blue-and-white Scotland rugby scarf;
- blue hand/wrist wraps;
- loose black cargo pants;
- black/white sneakers;
- rugby-country motifs/accessories including Springboks/South Africa details;
- shawarma visual motif at the waist/belt;
- confident heavy stance.

Action-sheet cues:
- guarded boxing/rugby posture;
- forward/backward shuffle;
- crouch and jump;
- straight basic strike;
- grounded low kick;
- **Topete** as a low, explosive forward rugby-style body charge with heavy ground/impact treatment;
- **Shawarmazo** as a thrown shawarma projectile with spicy/food-debris impact treatment;
- **Super Eructo** as a large forward green gas/wave effect that drives the rival away;
- blue impact language for Topete, warm/orange food impact for Shawarmazo, green gas for Super Eructo.

## User gameplay brief

### Close Special — Topete
El Toro lunges forward to crush the rival like a rugby player.

Astra must define:
- startup/commitment/recovery;
- whether it is strike, body charge or capture-like contact;
- armor/invulnerability policy if any;
- hit/block behavior;
- corner behavior;
- counterplay and punish window;
- how it differs from dash/capture Ultimates and ordinary dash attacks.

### Long Special — Shawarmazo
El Toro throws a spicy shawarma sandwich projectile.

Astra must define:
- projectile speed/range/lifetime;
- damage/knockback/hitstun;
- cooldown/availability if needed;
- whether it has one impact only;
- how it differs from Chorizo, Lengua and Rugby Boomerang;
- procedural visual contract.

### Ultimate — Super Eructo
Massive burp that deals damage and knockback.

Astra must define:
- startup and readable escape window;
- area/field geometry;
- block/capture/unblockable semantics;
- damage distribution;
- launch/knockback;
- interaction with Universal Ultimate Clash;
- no opaque full-screen unavoidable damage.

## Pipeline requirement

El Toro is the first requested fighter after Juanchi. Astra must use him to audit whether the V0.6 Character Package pipeline genuinely reduced implementation cost.

A new fighter using already-existing primitives should not require universal simulation/UI rewrites. If El Toro genuinely needs a new primitive, Astra must isolate it behind a typed bounded lifecycle with deterministic tests.

## Open questions for Astra

- final archetype and match-up identity;
- stats/reach/speed tradeoffs;
- normals/low/air route;
- precise Topete mechanics;
- Shawarmazo lifecycle;
- Super Eructo mechanics and Clash geometry;
- CPU tactics;
- presentation/effects;
- whether any additional stage/theme is justified (do not invent one by default);
- acceptance matrix.
