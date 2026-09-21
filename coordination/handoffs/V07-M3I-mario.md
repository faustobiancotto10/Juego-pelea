# V07-M3I — Mario Squad Integrated Super-Improvement Handoff

Round: `R005-V07-GAMEPLAY-PRESENTATION-EXPANSION`  
Task: `V07-M3I`  
Sender: Mario-A / temporary squad integrator  
Recipient: Germinator / `V07-G2`  
Branch: `round/r005-mario-squad-integration`  
Exact integrated candidate SHA: `f34760948cb2024c0c83f4a02202117a8ad3bf2f`  
Squad baseline: `032b1bb28c5dd4421e5772cc40ab007f42e4d462`  
Result: **GREEN / HANDOFF_READY**

## Exact accepted inputs

- Mario-A architecture: `d6d1e074526cd1674af4e6103995eda19ab5a46b`
- Mario-B refreshed El Toro + Juanchi: `cc75a56a1c56d9c6a988a3144880719a3515c4e9`
- Mario-C refreshed Camaleoni + Supernariz: `3131bbef6a517785722d48a255e2d8a0daf10e7b`
- Mario-D motion / presentation / FX: `b6dbe3ecb99d17a302477f3d63440555b5d8c135`

All 14 integrated renderer/test files were checked by Git blob SHA against their accepted lane source. Result: **14/14 exact**. No silent merge winner or integrator-authored product rewrite was introduced.

## Why the first integrated candidate was rejected

Historical integrated SHA `4a485d9244b3e8ce86c4700d4a299dc5f3cb84f6` was technically green but Mario-A rejected it before Germinator because visual change remained too incremental:
- baseline→old integrated neutral silhouette: ~0.53% changed pixels;
- baseline→old integrated phone landscape: ~2.44%;
- El Toro/Juanchi still shared too much procedural head/torso language.

B and C were reopened for bounded structural rework while A/D stayed frozen.

## Refreshed visual acceptance evidence

The refreshed candidate materially moves beyond both the squad baseline and the rejected first integration.

Diagnostic full-frame changed-pixel coverage versus baseline:
- normal color: ~8.35%;
- neutral silhouette: ~4.31%;
- phone landscape 844×390: ~10.13%;
- Juanchi-vs-El-Toro comparison: ~4.38%;
- El Toro actions: ~10.09%.

Refreshed candidate versus rejected first integration:
- normal color: ~7.70%;
- neutral silhouette: ~4.13%;
- phone landscape: ~9.46%;
- Juanchi-vs-El-Toro: ~4.02%;
- El Toro actions: ~9.75%.

These are evidence-of-change metrics, **not artistic scores**.

Direct artifact inspection at phone scale now shows:
- Camaleoni: larger human head, long S-curved scaled neck, narrow reptile trunk and much larger/longer tail spiral;
- Supernariz: substantially longer nose, larger cape wedge and a more distinct upright/V-taper silhouette;
- Juanchi: narrower athletic body/stance and clearly smaller visual mass;
- El Toro: broad planted stance, much heavier torso/shoulder/arm mass, larger shirt/scarf volume and materially wider silhouette.

The Juanchi-vs-El-Toro comparison no longer reads as the same body with costume/color changes.

## Verification

Repository verification:
- run #1326 / `35574082604`: **PASS**
- coordination contract: PASS
- full suite: PASS
- build: PASS

Character Pipeline V2:
- run #54 / `35574082616`: **PASS**
- full tests: PASS
- build: PASS
- deterministic visual captures: PASS
- artifact upload: PASS
- runtime raster/reference guard: PASS
- artifact ID: `10626449146`
- digest: `sha256:bba910e35cf910693d483236bce181a5b90e968d36276c63a75eeee0983936d4`

## Runtime / scope integrity

- no gameplay/balance changes;
- no runtime loading of uploaded/reference rasters;
- procedural Canvas2D fighter construction remains intact;
- A's architecture and D's motion/FX were not reopened during the structural second pass;
- shared Juanchi gate follows the authoritative package rather than the obsolete tied-jacket cue.

## Game Development Studio

The local `game-dev` CLI was not available in this execution environment. No Game Development Studio evidence is claimed. Deterministic repository CI captures and direct artifact inspection are the evidence used here.

## Remaining risks for independent audit

- current CI artifact is static; it does not independently prove frame-by-frame gait quality;
- reference likeness is still a human/artistic judgment and Germinator should independently inspect it rather than trust these metrics;
- final physical-phone/user acceptance remains downstream after Gonza rebuilds the preview.

## Downstream eligibility

This exact candidate is **GREEN / HANDOFF_READY** and unlocks **Germinator V07-G2** only.

It does **not** directly unlock Gonza. Germinator must independently return:
`APPROVE — CHARACTER PIPELINE REPAIR GREEN`
or block with exact evidence.
