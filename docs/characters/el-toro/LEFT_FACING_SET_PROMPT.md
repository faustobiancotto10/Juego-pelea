# El Toro — LEFT-FACING Set Generation Contract

Status: **REQUIRED INPUT GATE**  
Reason: El Toro is not mirror-safe because his clothing contains readable/directional text and marks.

## What must be generated

Generate one LEFT-FACING Master Seed and all 12 body sheets:

- LEFT-IMG-00 — Master Seed — 1 sprite — 1×1
- LEFT-IMG-01 — Idle — 8 — 2×4
- LEFT-IMG-02 — Walk Forward — 8 — 2×4
- LEFT-IMG-03 — Walk Backward — 8 — 2×4
- LEFT-IMG-04 — Crouch — 4 — 1×4
- LEFT-IMG-05 — Jump — 6 — 2×3
- LEFT-IMG-06 — Basic Attack — 6 — 2×3
- LEFT-IMG-07 — Low Attack — 6 — 2×3
- LEFT-IMG-08 — Block — 4 — 1×4
- LEFT-IMG-09 — Hurt / Knockdown — 8 — 2×4
- LEFT-IMG-10 — Topete — 8 — 2×4
- LEFT-IMG-11 — Shawarmazo — 8 — 2×4
- LEFT-IMG-12 — Super Eructo — 10 — 2×5

Total: **84 left-facing body sprites + one left-facing authoring seed**.

## Fundamental rule

**EVERY generated image must comply with `docs/SPRITE_PRODUCTION_CONTRACT.md` in full. No sheet inherits compliance from the previous one.**

## Critical left-facing instruction

Do **not** obtain the left set by simply mirroring the existing raster output. Redraw/reconstruct the character genuinely facing left while preserving:
- readable `TE VOY A CHOCAR` garment text in correct reading orientation;
- Scotland/South-Africa/Springboks garment marks and other directional identity details in their intended orientation;
- exact approved identity, proportions, hair, scarf, gloves, pants, belt, keychain, footwear and palette;
- the same slot-by-slot action progression as the corresponding accepted right-facing sheet.

## Mandatory per-image compliance block

Paste this inside **every** GPT Images request:

> THIS IMAGE AND EVERY SPRITE INSIDE IT MUST COMPLY WITH JUEGO-PELEA OFFICIAL SPRITE PRODUCTION CONTRACT v1.0 IN FULL. Preserve the approved El Toro Master Seed exactly in identity, proportions, clothing, accessories, palette, side-view camera, scale and art style. Create the requested LEFT-FACING version as genuinely authored left-facing art; DO NOT mirror readable garment text or directional logos. All garment text/logos must remain correct and readable. Use a truly transparent background. Keep every sprite fully visible, separated, correctly ordered and on the required baseline. Do not add labels, frame numbers, borders, grid lines, scenery, ground shadows, UI or unrequested effects. Do not redesign the character. Do not change the requested number of sprites or their grid positions. Any deviation makes the image invalid for production.

## Reference strategy

For LEFT-IMG-00:
1. attach the accepted right-facing IMG-00 Master Seed;
2. ask only for the left-facing master, preserving all identity details and readable text.

For LEFT-IMG-01..12:
1. attach accepted right-facing IMG-00;
2. attach approved LEFT-IMG-00;
3. attach the corresponding accepted right-facing sheet;
4. request exactly the matching frame count/grid/phases, now genuinely left-facing;
5. repeat the full compliance block.

## Gate

Mario does not mark El Toro's sprite body package production-complete until all LEFT-IMG-01..12 pass the same visual/technical checklist as the right-facing set.
