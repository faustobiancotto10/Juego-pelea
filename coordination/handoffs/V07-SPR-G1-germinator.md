# V07-SPR-G1 — Germinator BLOCK handoff

Round: `R005-V07-GAMEPLAY-PRESENTATION-EXPANSION`  
Task: `V07-SPR-G1 — El Toro Sprite Pilot Audit`  
From: Germinator  
To: Mario-A / V07-SPR-MI repair, then back to Germinator  
Audited integrated candidate: `5c76664fb95ac9c1da019636ce3ad974c214d84c`  
Audited tree: `d42ccea2ff64ce7010f51f92005a3fc2c606919a`  
QA branch: `round/r005-germinator`  
QA evidence SHA: `3b9d754b0d1f118c774404c2371f188033ab7346`  
Validation PR: #58  
Repository verification: #1681 / run `35779776446`  
Verdict: **BLOCK**

## What passed

The bilateral sprite-production layer itself is valid enough to continue:
- canonical RIGHT + LEFT reviewed anchors validate;
- the packer regenerates a bilateral manifest with `runtimeLoadable:true`;
- `blockingGates:[]`;
- `mirrorSafe:false`;
- RIGHT and LEFT animation-key coverage matches;
- all runtime frames include the seven required anchors;
- authored LEFT is selected without horizontal mirroring by the generic sprite renderer;
- Ricardo's sprite timeline/runtime tests from the integrated candidate remain present.

The first independent G1 probe passed:
`V07-SPR-G1 canonical verified bilateral packer produces a non-mirrored runtime-loadable manifest`.

## Release-blocking failures

The exact candidate is **builder-loadable but not runtime-previewable**.

Fresh QA run `35779776446`:
- coordination/tooling contract: PASS;
- full suite: **354/357 PASS, 3 FAIL**;
- build: skipped after test failure.

The three failures are all exact-candidate integration failures:

1. **El Toro is not in the live playable/default presentation composition**
   - `DEFAULT_CHARACTER_COMPOSITION.playableIds` omits `el-toro`;
   - `RELEASED_CHARACTER_PACKAGES` contains only Camaleoni, Supernariz and Juanchi;
   - therefore the exact candidate cannot expose El Toro as a selectable/live fighter.

2. **No concrete El Toro browser sprite package is registered**
   - `DEFAULT_SPRITE_PACKAGE_REGISTRY` is constructed empty;
   - therefore `SpriteFightAssetLifecycle` cannot request/load `el-toro` from the default runtime path.

3. **No runtime sprite asset root exists in the exact candidate**
   - `package.json` build copies only `assets/` via `scripts/copy-runtime-assets.mjs`;
   - exact candidate tree contains no `assets/` directory;
   - generated bilateral atlas/manifest exist only as builder outputs in temporary/test destinations, not as served runtime files.

## Lineage defect

This is not merely one missing registry line.

The sprite candidate is not a descendant of the currently approved V0.7 product line:
- compared with G2-approved V0.7 candidate `f34760948cb2024c0c83f4a02202117a8ad3bf2f`, the sprite candidate is **diverged**;
- merge base: frozen R005 base `378a991d55bed03e6237a03fdf6dfe96653fae72`;
- the sprite candidate is 523 commits ahead and 142 commits behind that V0.7 line.

So publishing `5c76664f...` exactly would regress the user-facing V0.7 composition rather than produce the requested El Toro sprite pilot on top of it.

## Expected vs actual

Expected by V07-SPR-G1 / V07-SPR-Z0:
- one exact candidate that can be built and served;
- El Toro reachable as the existing V0.7 fighter;
- body backend routed to the verified bilateral sprite package;
- package manifest + atlas available through the browser registry/asset path;
- RIGHT/LEFT authored facing selectable in actual gameplay;
- no gameplay-authority change.

Actual:
- the verified generator can create the correct package;
- the generic renderer can consume such a package;
- but the exact candidate never wires those two facts into a playable/served El Toro.

## Authorized in-contract repair

No new art, anchor redesign or gameplay redesign is needed.

Mario-A integration must produce a **new exact candidate** that:
1. composes the accepted sprite-pilot/runtime deltas onto the approved four-fighter V0.7 product lineage, preserving the existing gameplay/UI contracts;
2. retains El Toro's existing V0.7 combat content and switches only presentation body backend to `sprite` with `spritePackageKey:'el-toro'`;
3. materializes the verified bilateral generated manifest/body atlas under the runtime `assets/fighters/el-toro/` path (or an equivalently build-served canonical path);
4. registers `el-toro` in `DEFAULT_SPRITE_PACKAGE_REGISTRY` with that manifest URL;
5. proves the build actually copies/serves the manifest + atlas;
6. proves selected-fight loading, RIGHT/LEFT authored facing, anchors, missing-package diagnostics and rematch lifecycle on the exact integrated candidate;
7. leaves procedural fallback/cutover policy unchanged until user acceptance.

Do not regenerate source art and do not weaken the verified anchor/facing contract.

## Downstream

- Germinator V07-SPR-G1: **BLOCKED** pending replacement exact candidate.
- Gonza V07-SPR-Z0: **BLOCKED**; do not publish `5c76664f...` as the sprite preview.
- User/device acceptance does not start yet.

## Tool receipts

- `TOOL_USED: Game Studio sprite-pipeline + game-playtest` — process/checklist applied to exact package and previewability audit; GitHub CI is the verification evidence.
- `TOOL_UNAVAILABLE: Game Development Studio / game-dev CLI` — CLI is not installed in this host; no Game Development Studio CLI result is claimed.

## Identity Learning Review

Receipt: **UPDATED**

Reusable lesson added to Germinator durable memory: a package-level `runtimeLoadable` flag proves only that the package can be generated/validated; release QA must separately prove the exact candidate registers, materializes, builds and can actually reach/load that package through the live default runtime path.
