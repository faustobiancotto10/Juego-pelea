# V07-M3B — Mario-B Handoff

Round: R005-V07-GAMEPLAY-PRESENTATION-EXPANSION  
Task: V07-M3B  
Sender: Mario-B (durable identity: Mario)  
Recipient: Mario-A / V07-M3I  
Status: HANDOFF_READY  
Branch: `round/r005-mario-squad-toro-juanchi`  
Exact product SHA: `68dd441feabebe672ab7da791dc378f7d3778201`  
Squad base: `032b1bb28c5dd4421e5772cc40ab007f42e4d462`

## Files changed

Exact base-to-head diff contains only:

- `src/game/render/ElToroRig.ts`
- `src/game/render/JuanchiRig.ts`
- `tests/v07-m3-character-pipeline.test.mjs`

The test-file delta is the exact shared Juanchi gate repair explicitly authorized by Mario-A from A candidate `d6d1e074526cd1674af4e6103995eda19ab5a46b`. No A architecture files, C fighter files, D motion/FX files, gameplay files, UI files or runtime raster assets changed.

## El Toro reconstruction

- broader/heavier planted torso treatment with a less rectangular shirt silhouette;
- thicker neck/trapezius bridge so the head no longer floats over the shirt at phone scale;
- richer Scotland scarf construction with knot, twin tails, saltire marks and fringe;
- layered blue wrist/hand wraps;
- cargo knee/seam treatment;
- layered black/white/blue sneaker construction;
- stronger jaw/sideburn/hair contour while preserving the procedural articulated rig;
- South Africa/rugby/shawarma identity cues remain present.

## Juanchi reconstruction

- canonical oversized black `La 56` streetwear retained;
- legacy tied-jacket waist cue removed because it conflicts with the authoritative package;
- cargo waistband, belt loops, gold hardware/chain treatment added instead;
- police-cap and rugby-ball props refined;
- layered black/white/gold sneaker construction;
- athletic shirt/neck/collar treatment separated from El Toro's heavy build;
- fade/jaw/hair detailing strengthened while preserving procedural runtime rendering.

## Verification evidence

Repository verification:
- run #1261 / `35571146380`: SUCCESS.

Character Pipeline V2:
- run #47 / `35571146374`: SUCCESS;
- full tests: PASS;
- build: PASS;
- deterministic visual evidence capture: PASS;
- runtime raster/reference guard: PASS;
- artifact: `v07-m3-visual-evidence`, ID `10626157139`;
- artifact digest: `sha256:0a2544fb31604a0bab80f57e21e34051b9be772e8f9c9e9ce1d912f10b1ea8b2`;
- artifact head SHA matches `68dd441feabebe672ab7da791dc378f7d3778201`.

## Visual evidence

The exact artifact includes:
- neutral black silhouettes for all four fighters;
- same-gameplay-scale Juanchi-vs-El-Toro comparison;
- normal-color roster evidence;
- El Toro neutral / normal / Topete / ultimate-startup body-pose evidence;
- 844×390 phone-landscape readability capture.

Observed on the exact B artifact:
- El Toro remains clearly broader/heavier than Juanchi in black silhouette;
- Juanchi retains a narrower athletic black/gold identity at the same gameplay scale;
- Toro's scarf, white shirt mass, wraps and footwear remain readable in the 844×390 capture;
- Juanchi's `La 56`, gold details and streetwear remain readable at phone scale.

This evidence is static and does not replace integrated human artistic acceptance after A/D composition.

## Scope / contract

- gameplay authority untouched;
- no runtime `drawImage`/reference-image fighter path introduced;
- no raster sticker fighters;
- no renderer-architecture migration;
- shared test repair is canonical-package validation only.

## Unresolved questions

None blocking this lane.

## Downstream eligibility

V07-M3B is GREEN / HANDOFF_READY. Mario-A V07-M3I may consume exact SHA `68dd441feabebe672ab7da791dc378f7d3778201`.

Draft PR #42 is validation-only and must not be merged directly.
