# V07-M3B — Mario-B Handoff

Round: R005-V07-GAMEPLAY-PRESENTATION-EXPANSION  
Task: V07-M3B  
Sender: Mario-B (durable identity: Mario)  
Recipient: Mario-A / V07-M3I  
Status: HANDOFF_READY  
Branch: `round/r005-mario-squad-toro-juanchi`  
Exact product SHA: `cc75a56a1c56d9c6a988a3144880719a3515c4e9`  
Squad base: `032b1bb28c5dd4421e5772cc40ab007f42e4d462`

## Rework reason

The first B handoff `68dd441feabebe672ab7da791dc378f7d3778201` was technically green but M3I rejected the integrated visual result as too incremental. This refreshed handoff responds directly to that review by changing structural silhouette rather than adding micro-detail.

## Files changed from squad base

Exact base-to-head diff contains only:

- `src/game/render/ElToroRig.ts`
- `src/game/render/JuanchiRig.ts`
- `tests/v07-m3-character-pipeline.test.mjs`

The test-file delta remains the exact shared Juanchi canonical-gate repair previously authorized by Mario-A. No A architecture files, C fighter files, D motion/FX files, gameplay files, UI files or runtime raster assets changed.

## El Toro structural rework

- neutral render stance widened through presentation-only foot placement;
- hip span substantially widened and leg/cargo masses thickened;
- footwear footprint enlarged to reinforce planted weight;
- oversized white shirt broadened and deepened at shoulder, belly and hem;
- neck/trapezius bridge enlarged;
- Scotland scarf mass, tails and fringe enlarged so it contributes to silhouette;
- upper arms and forearms thickened;
- head broadened and mullet extended farther back/down the neck;
- existing blue wraps, South Africa/rugby/shawarma identity cues retained;
- simulation/world movement authority remains untouched.

## Juanchi structural rework

- neutral render stance tightened to contrast Toro's planted base;
- hip span, legs and forearms slimmed into a more athletic build;
- oversized black shirt made longer and more tapered instead of box-like;
- head narrowed while the curly top was made more vertical;
- footwear and cargo details remain recognizable without borrowing Toro mass;
- canonical `La 56`, black cargo, gold details, rugby ball and belt-stored police cap retained.

## Verification evidence

Repository verification:
- run #1307 / `35573393158`: SUCCESS.

Character Pipeline V2:
- run #51 / `35573393175`: SUCCESS;
- full tests: PASS;
- build: PASS;
- deterministic visual evidence capture: PASS;
- runtime raster/reference guard: PASS;
- artifact: `v07-m3-visual-evidence`, ID `10627565392`;
- artifact digest: `sha256:fa589635f451c76bdc09e5a8deb899a8e87997e608054f5d3c82e0d6d080a710`;
- artifact head SHA matches `cc75a56a1c56d9c6a988a3144880719a3515c4e9`.

## Visual-delta evidence

Static pixel-delta measurements are evidence of non-trivial image change, not artistic quality scores.

Compared with the first B handoff artifact:
- neutral silhouette changed on ~2.06% of full-frame pixels (>3 RGB threshold);
- 844×390 phone-landscape changed on ~3.19%;
- Juanchi-vs-El-Toro same-scale comparison changed on ~3.03%;
- El Toro action sheet changed on ~8.09%.

Compared with the frozen squad base:
- neutral silhouette changed on ~2.19%;
- phone-landscape changed on ~3.57%.

Direct inspection of the exact artifact shows El Toro now occupies a materially broader/heavier silhouette while Juanchi remains narrower and more vertical at the same gameplay scale.

## Scope / contract

- gameplay authority untouched;
- no runtime `drawImage`/reference-image fighter path introduced;
- no raster sticker fighters;
- no renderer-architecture migration;
- render stance offsets are presentation-only.

## Unresolved questions

None blocking this lane. Integrated human artistic acceptance still belongs to M3I/G2/user review.

## Downstream eligibility

V07-M3B refreshed rework is GREEN / HANDOFF_READY. Mario-A V07-M3I should consume exact SHA `cc75a56a1c56d9c6a988a3144880719a3515c4e9` and treat the prior B SHA as historical only.

Draft PR #42 remains validation-only and must not be merged directly.
