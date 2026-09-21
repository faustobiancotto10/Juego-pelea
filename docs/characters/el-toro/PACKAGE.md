# El Toro — Character Package Intake

ID: `el-toro`  
Display name: **EL TORO**  
Status: IN_IMPLEMENTATION / VISUAL_REFERENCE_SUPPLIED  
Implementation: R005 ACTIVE — gameplay starts at V07-R2 after schema/difficulty work  
Target: V0.7 / R005

## Authoritative visual references

The user supplied refreshed visual references on 2026-09-20. These source hashes supersede the older intake hashes.

### Identity master

Original uploaded source SHA-256:
`86f2eee15ae055ebe72a4ea2d476e6a5c6bc20fcfe9f6809001621e9a098f8c5`

Repository authoring copy:
- `docs/characters/el-toro/references/identity-master-reference.webp`
- 480×360 compressed derivative
- derivative SHA-256: `515f098f3bf7547830aaf1a6ed493fc9cbd8d92a91e94158461262fd51f9aaa2`

Identity authority:
- face and shaggy dark-brown hair;
- broad/stocky rugby-player body proportions;
- white oversized `TE VOY A CHOCAR` shirt;
- blue/white Scotland scarf;
- blue hand/wrist wraps;
- loose black cargo pants;
- black/white sneakers;
- rugby-country details, including Springboks/South Africa cues;
- shawarma motif at the waist;
- heavy, confident stance.

### Action / sprite-sheet reference

Original uploaded source SHA-256:
`d368d5fde8737cfaa3a8ec1a209114b0666c7806ef2c4e9cfb800ffcf5373393`

Repository authoring copy:
- `docs/characters/el-toro/references/action-sheet-reference.webp`
- 400×300 compressed derivative
- derivative SHA-256: `9428acf31e83689491519fdf6a68f80380b8ed270f0e85a0daf5663ca6554c1f`

Action authority:
- guard / shuffle / crouch / jump language;
- heavy straight basic attack;
- grounded low kick;
- **Topete** as a low explosive rugby-style forward body charge with blue impact/ground treatment;
- **Shawarmazo** as a thrown shawarma projectile with warm food/debris impact;
- **Super Eructo** as a large forward green gas/wave;
- hurt/knockdown silhouette references.

The identity master wins any likeness/outfit conflict. The action sheet guides pose/action/effect language.

## Runtime rule

All reference images are **authoring references only**.

They must never be:
- imported into runtime;
- cropped into fighter portraits;
- loaded as textures/sprites;
- embedded into the standalone build.

El Toro must be reconstructed as a procedural articulated Canvas2D fighter. Fighter-select portrait/icon art must also be derived procedurally from the in-game design, not from these files.

## User gameplay brief

### Close Special — Topete
El Toro lunges/charges forward to crush the rival like a rugby player.

### Long Special — Shawarmazo
El Toro throws a spicy shawarma sandwich projectile that deals damage.

### Ultimate — Super Eructo
A massive forward burp/gas blast that deals damage and knocks the enemy away.

## V0.7 authoritative design

See:
- `docs/superpowers/specs/2026-09-20-v07-el-toro-character-contract.md`
- `docs/superpowers/specs/2026-09-20-v07-animation-effects-quality-contract.md`
- `docs/superpowers/specs/2026-09-20-v07-content-design.md`

## Pipeline requirement

El Toro is the first real post-Juanchi test of the reusable Character Package path.

Existing primitives must be reused where appropriate:
- Shawarmazo uses the existing linear-projectile lifecycle with a distinct visual/data definition.
- Topete is an authored committed movement Special, not a new generic engine.
- Super Eructo may introduce one bounded typed forward-blast Ultimate primitive because current V0.6 Ultimate kinds are capture-oriented.

A fourth fighter must not require identity hardcoding across simulation/UI/render.
