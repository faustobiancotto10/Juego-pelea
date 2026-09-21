# Juego-pelea — Official Sprite Production Contract v1.0

Status: **OFFICIAL PRODUCTION STANDARD**  
Date: 2026-09-21  
Applies to: current roster and future fighters.

> **FUNDAMENTAL CLAUSE — NO EXCEPTIONS**  
> EVERY image created for this pipeline — Master Seed, sprite sheet, variant, correction, test, regeneration, effect or replacement — MUST comply with this contract in full. Compliance by a previous image is never inherited. The full compliance block must be repeated inside every generation prompt. Any image that violates a mandatory rule is REJECTED and may not enter the production pipeline or runtime.

## 1. Authority

- Simulation is the sole authority for hitboxes, damage, stun, move legality, projectiles, CPU, Clash and combat timing.
- Sprites only represent states already decided by simulation.
- General/reference sheets are authoring material and are never loaded directly by runtime.
- Runtime assets are normalized derivatives: clean frames, real transparency, pivots, metadata and packed atlases.
- Fighter-specific annexes may specialize actions but may never weaken global consistency, transparency, scale, baseline, body/FX separation or gameplay-authority rules.

Order of precedence:
1. this global contract;
2. fighter-specific contract;
3. move-specific sheet contract;
4. prompt for the individual generation.

## 2. Global visual contract — mandatory in every image

Every sprite image must preserve:
- the same face/head shape, hair, skin, clothing, accessories, palette and distinguishing details;
- stable body proportions, head/torso/limb ratio, hand size and footwear size;
- fixed side-view 2D gameplay camera with no zoom, lens or perspective drift;
- base facing right unless a LEFT-FACING annex is active;
- coherent ground baseline for grounded states;
- constant character scale inside the sheet;
- true transparent background;
- complete isolated sprites with no overlap;
- no titles, labels, frame numbers, borders, guide lines, scenery, baked ground shadows or UI;
- stable clothing/logos/accessories with no arbitrary appearance/disappearance;
- rigid objects with stable shape, length and volume;
- valid anatomy with no duplicated limbs or mutating joints;
- consistent lighting and the approved illustrated style;
- identity-specific FX separated from the body when the effect is an independent entity.

## 3. Technical image contract

Preferred generation format: PNG with alpha.  
Recommended body/FX sheet canvas: **1536 × 1024 landscape**.  
Recommended Master Seed canvas: **1024 × 1024 transparent**.

Never crop hair, head, hands, feet, rigid props, accessories or motion extremes. Leave enough exterior/inter-sprite margin for automatic extraction.

Allowed grids:

| Sprites | Grid | Order |
|---:|---|---|
| 1 | 1×1 | centered |
| 4 | 1×4 | left → right 1–4 |
| 6 | 2×3 | top 1–3, bottom 4–6 |
| 8 | 2×4 | top 1–4, bottom 5–8 |
| 10 | 2×5 | top 1–5, bottom 6–10 |

Frame position is contractual. Do not create extras, omit frames or reorder slots.

## 4. IMG-00 — Master Seed

- exactly 1 sprite;
- 1×1;
- neutral combat-ready / idle base;
- side-view gameplay pose facing right;
- truly transparent background;
- primary visual authority for every later sheet.

Once approved, the fighter is not redesigned. Every later generation uses the Master Seed as the primary visual reference; where possible, also attach the latest approved sheet in the same movement family.

## 5. Official body matrix — exactly 84 runtime body sprites per facing

| ID | Content | Sprites | Grid |
|---|---|---:|---|
| IMG-01 | Idle / Guard Neutral | 8 | 2×4 |
| IMG-02 | Forward Shuffle / Walk Forward | 8 | 2×4 |
| IMG-03 | Backward Shuffle / Walk Backward | 8 | 2×4 |
| IMG-04 | Crouch | 4 | 1×4 |
| IMG-05 | Jump | 6 | 2×3 |
| IMG-06 | Basic Attack | 6 | 2×3 |
| IMG-07 | Low Attack | 6 | 2×3 |
| IMG-08 | Block | 4 | 1×4 |
| IMG-09 | Hurt / Knockdown | 8 | 2×4 |
| IMG-10 | Special 1 — close/signature | 8 | 2×4 |
| IMG-11 | Special 2 — ranged/signature | 8 | 2×4 |
| IMG-12 | Ultimate | 10 | 2×5 |

Master Seed is reference and is not counted inside the 84.

## 6. Mandatory phase progression

- IMG-01: base neutral → inhale → rise → breathing apex → exhale → subtle weight shift → return → seamless loop.
- IMG-02: contact → load → pass → push → opposite contact → load → pass → push, visually forward.
- IMG-03: equivalent reverse cycle with defensive posture; do not reuse forward walk if it reads unnaturally.
- IMG-04: descend start → descend → stable crouch → stable hold/loop variant.
- IMG-05: takeoff load → launch → ascent → apex → descent → pre-landing/contact preparation.
- IMG-06: anticipation → wind-up → active start → active/contact pose → recovery → return.
- IMG-07: anticipation → drop/load → active start → active/contact pose → recovery → return.
- IMG-08: guard raise → full guard → absorbed/tension variant → stable hold/return-ready.
- IMG-09: impact response → displacement → recoil → recoverable hurt end → heavy reaction → fall → near-ground → grounded terminal knockdown.
- IMG-10: startup → load → commitment → active → active peak → end of force → recovery → return.
- IMG-11: startup → load/aim → release prep → release → post-release → follow-through → recovery → return.
- IMG-12: 1–2 startup; 3–4 charge; 5–7 signature release/sequence; 8–9 recovery; 10 return/end.

These drawings never define hit frames, invulnerability, damage, knockback or move legality.

## 7. FX / projectile contract

Conditional sheets, only when the moveset requires them:

| ID | Content | Sprites | Grid |
|---|---|---:|---|
| FX-01 | Special 1 impact / signature burst | 4 | 1×4 |
| FX-02 | Projectile / signature moving prop | 8 | 2×4 |
| FX-03 | Projectile / Special 2 impact | 4 | 1×4 |
| FX-04 | Ultimate effect | 6 | 2×3 |

El Toro mapping:
- IMG-10 = Topete body;
- FX-01 = Topete impact;
- IMG-11 = Shawarmazo body;
- FX-02 = Shawarma projectile;
- FX-03 = Shawarma impact;
- IMG-12 = Super Eructo body;
- FX-04 = Super Eructo effect.

Independent combat entities are never duplicated/baked into every body frame.

## 8. Mandatory GPT Images prompt block

Every generation prompt must contain this exact intent:

> **GLOBAL COMPLIANCE BLOCK**  
> THIS IMAGE AND EVERY SPRITE INSIDE IT MUST COMPLY WITH JUEGO-PELEA OFFICIAL SPRITE PRODUCTION CONTRACT v1.0 IN FULL. Preserve the approved Master Seed exactly in identity, proportions, clothing, accessories, palette, side-view camera, scale and art style. Use a truly transparent background. Keep every sprite fully visible, separated, correctly ordered and on the required baseline. Do not add text, labels, frame numbers, borders, grid lines, scenery, ground shadows, UI or unrequested effects. Do not redesign the character. Do not change the requested number of sprites or their grid positions. Any deviation makes the image invalid for production.

Every prompt also states fighter, image ID, exact sprite count, exact grid, slot-by-slot phase contract, transparent background, side view, facing direction and maximum consistency over artistic dramatization.

## 9. Automatic rejection

Reject any image with:
- wrong sprite count or slot order;
- non-transparent/checkerboard/scenery/baked-ground-shadow background;
- cropped, overlapped or hidden frames;
- visible identity, face, hair, clothing, accessory, palette, proportion or style drift;
- unstable garment text/logos;
- camera/scale/perspective drift;
- unjustified foot/baseline swimming;
- deforming rigid props;
- invalid/duplicated anatomy;
- labels, numbers, borders or guides;
- body-baked FX that should be independent;
- unauthorized Master Seed drift.

Minimum visual approval additionally requires clear silhouette at gameplay scale, same identity across slots, readable phase progression without FX, stable loops, no strong structural jitter and clean automatic extractability.

## 10. Facing / mirror safety

Base set faces right.

A fighter is **not mirror-safe** when readable text, directional logos, scars, side-specific weapons, insignia, pockets or other asymmetric features must not reverse.

For a non-mirror-safe fighter, activate a **LEFT-FACING SET** for every affected animation. Do not solve it differently per sheet.

## 11. Naming / package

- Master: `<fighter-id>__IMG-00__master-seed.png`
- Body: `<fighter-id>__IMG-01__idle.png` ... `<fighter-id>__IMG-12__ultimate.png`
- FX: `<fighter-id>__FX-01__special1-impact.png` ...
- Derived frames: `<fighter-id>__<animation>__f01.png`, etc.
- Runtime atlas: `assets/fighters/<fighter-id>/body.webp`
- Runtime manifest: `assets/fighters/<fighter-id>/animations.json`
- Optional FX atlas: `assets/fighters/<fighter-id>/effects.webp`

Source sheets/reference material stay outside runtime import paths.

## 12. Production pipeline

1. Approve Master Seed.
2. Generate IMG-01..IMG-12 one sheet at a time with the complete contract in every prompt.
3. Reject/regenerate any violating sheet.
4. Generate required FX sheets.
5. Mario extracts frames, cleans alpha, normalizes shared scale/pivots and builds atlas + manifest.
6. Ricardo integrates sprite runtime without moving gameplay authority into rendering.
7. Germinator audits assets, timing, memory and regressions.
8. Gonza publishes an isolated preview only from a green integrated candidate.
9. User validates at real gameplay/device scale before production cutover.

Pilot gate: El Toro first. Do not migrate the complete roster until the pilot is a clear visual win and performance/memory are acceptable.

## 13. AUTO_CHAIN

When the round is in AUTO_CHAIN and work is already eligible, user message **`.`** means: synchronize repository state and immediately continue the highest-priority eligible task.

`.` never authorizes bypassing blockers, inventing missing assets, breaking locks or ignoring acceptance gates.

## 14. Per-image checklist

Every image must pass:
- correct image ID;
- full GLOBAL COMPLIANCE BLOCK present in generation prompt;
- approved Master Seed attached;
- exact sprite count/grid/order;
- required facing;
- real transparency;
- no labels/background/shadow/UI;
- complete character in every frame;
- stable identity/clothing/accessories/palette/scale/style;
- coherent baseline for grounded states;
- rigid-prop consistency;
- valid anatomy;
- separated FX where required;
- readable loop/action without relying on effects;
- explicit APPROVED status before processing.

**FINAL ADMISSION RULE:** generated is not game-ready. Every image, including a one-sheet correction or regeneration, re-enters the complete contract from zero and is valid only after checklist approval and runtime normalization.
