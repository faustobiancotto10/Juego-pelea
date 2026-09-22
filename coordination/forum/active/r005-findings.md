# R005 Findings / Blockers

Round: `R005-V07-GAMEPLAY-PRESENTATION-EXPANSION`

No findings are open at round start.

For each future finding record:
1. task/owner;
2. exact SHA/build;
3. reproduction/evidence;
4. expected vs actual;
5. affected dependencies;
6. whether an in-contract repair exists;
7. smallest user decision needed if not.

## RESOLVED — V07-B1 portrait ownership/dependency contradiction

Owner: Brancaforte  
Detected against B1 candidate: `b851ae8a2119020100879a78dedb645397dcda3b`

Evidence:
- V07 content design says portraits are procedural game representations **produced by Mario** and consumed by Brancaforte.
- V07-M2 owns registered portrait renderers for all four fighters.
- V07-B1 acceptance requires all four cards to display those portraits, but B1 is scheduled in parallel with M2 and has no declared M2 dependency/interface.
- Brancaforte's first B1 candidate incorrectly crossed ownership by inventing fighter-specific CSS silhouettes.

Expected: Brancaforte owns card layout/interaction and consumes Mario's portrait renderer through a stable interface.  
Actual: no M2 portrait renderer exists yet on `round/r005-mario`; B1 cannot honestly satisfy final portrait acceptance without either crossing renderer ownership or waiting for M2.

Affected dependency: Gonza V07-Z0 must not integrate B1 candidate `b851ae8a...` as final portrait implementation.

In-contract repair available now: remove Brancaforte-authored fighter art, retain a keyed portrait mount/fallback surface and keep difficulty flow green. Final portrait wiring still needs Mario M2 output or an explicit cross-lane interface.

Smallest decision: treat Mario M2 portrait renderer as the final input B1 consumes before B1 returns GREEN, or have Neureon amend the dependency/interface contract.

Resolution: Mario V07-M2 is GREEN at exact SHA `a47326093ae004c602e00112ac2ed2226cf738c8` (run #1113, 314/314 + build). The stable `PortraitRenderer` seam is published in `r005-contract.md`. Brancaforte remains owner of card DOM/layout and is now eligible to wire its existing canvas hosts without inventing fighter art. No user/Neureon scope decision is required.


## ALERT — Mario same-branch collision (resolved locally)

- Task/owner: V07-M1 / Mario.
- Evidence: branch `round/r005-mario` received overlapping edits to locked `src/game/render/JuanchiRig.ts`; verification run #1074 failed with `TS2393 Duplicate function implementation`.
- Root cause: two Mario execution instances modified the same owned file on the same branch while the V07-M1 lock was active.
- Resolution: duplicate aura implementation and double gait application were reconciled; run #1076 passed full suite + build.
- Dependency impact: no frozen contract change and no downstream blocker.
- Durable coordination lesson: parallel instances of one identity must partition files/subtasks or use distinct branches; shared identity/context alone does not make same-file writes safe.


## SUPERSEDED — old V07-Z1 physical-phone gate

Owner: Gonza  
Historical candidate: `65bbb4122be526b0b878c214137192c7243db3ab`  
Status: SUPERSEDED BY USER VISUAL REJECTION

Automated release evidence is green, but frozen acceptance V7-10 explicitly requires physical-device/user-facing visual/play checks.

Exact served candidate preview:
- https://faustobiancotto10.github.io/Juego-pelea/v07-preview/
- gh-pages preview SHA: `2b583b14a8c903142dbb56c8f0b7f949aaf23c16`
- Pages deploy run: `35562586454` — SUCCESS
- preview index/play blob: `51eba287c535782f9fc72a9528169edf3b5c7de2`
- candidate standalone SHA-256: `b64b18ed408c67eec48f5b60b78e4ed5520c07eabd4ce7ff7a4822cc3524da28`
- production root remains V0.6; no final promotion occurred.

Required physical phone checks:
1. four portrait cards are readable and recognizable;
2. Easy / Normal / Hard selector is usable and difficulty difference is perceptible;
3. Lengua no longer feels like an unanswerable spam loop;
4. Juanchi forward/back walk no longer reads as sliding/overstride and red rage aura is clearly visible;
5. El Toro is selectable and Topete / Shawarmazo / Super Eructo are visually readable;
6. Ultimate Clash remains readable;
7. Tramontana and Cancha 56 both render/use controls correctly;
8. result/rematch and opening/closing controls do not leave stuck movement/input;
9. no clipping/unreachable controls or severe performance issue in physical phone landscape.

Release policy:
- if checks pass, Gonza resumes Z1, composes exact candidate over current main coordination, reruns merge-ref CI, promotes exact standalone to Pages root and verifies source/public parity;
- if any check fails, keep BLOCK_RELEASE and route bounded evidence to the owning agent.


## SUPERSEDED — old V07-Z1 physical phone smoke pending

Task/owner: V07-Z1 / Gonza  
Historical product candidate: `65bbb4122be526b0b878c214137192c7243db3ab`  
Standalone SHA-256: `b64b18ed408c67eec48f5b60b78e4ed5520c07eabd4ce7ff7a4822cc3524da28`

Technical evidence is green:
- Z0 run `35562321601`: SUCCESS;
- merge-ref Repository verification #1138 / `35562414551`: SUCCESS;
- full suite/typecheck/build + targeted V0.7 + raster scan + mobile browser smoke: PASS;
- exact preview deployed at `/Juego-pelea/v07-preview/`;
- gh-pages preview SHA `2b583b14a8c903142dbb56c8f0b7f949aaf23c16`;
- Pages run `35562586454`: SUCCESS;
- preview blob `51eba287c535782f9fc72a9528169edf3b5c7de2` equals exact Z0 `play.html`;
- production root remains V0.6 and was not overwritten.

Expected:
V7-10 requires physical phone smoke for portraits, difficulty, Lengua sanity, Juanchi walk/aura, El Toro signature moves, Clash, both stages, rematch/input interruption.

Actual:
Only cloud/browser evidence exists so far. Gonza cannot honestly manufacture physical-device evidence from the cloud environment.

Affected dependency:
- final V0.7 production promotion only;
- no product/code lane is blocked or reopened.

Recovery:
Run the exact isolated preview on a physical phone and report whether the listed V7-10 checks pass. If accepted, Gonza may promote the already-verified artifact without feature edits.


## BLOCK_RELEASE — character visual identity rejected by user

Owner: Mario / V07-M3  
Rejected candidate: `65bbb4122be526b0b878c214137192c7243db3ab`  
Status: G2 APPROVED / REBUILT PREVIEW REQUIRED

Physical/user-facing evidence:
- El Toro reads as a near-reskin of Juanchi rather than a distinct fighter;
- body construction, head/face language, stance and neutral silhouette are too similar;
- identity is carried too heavily by shirt/accessory/color changes;
- user requires the same structural visual-quality review across Camaleoni, Supernariz and Juanchi.

Expected:
Each released fighter must have character-specific body structure, silhouette, posture and motion while remaining a procedural articulated Canvas2D rig.

Actual:
The rejected preview demonstrates insufficient structural differentiation, most visibly El Toro vs Juanchi.

Affected dependency:
- V07-Z1 production-root promotion remains blocked;
- previous automated green evidence does not override failed physical/user-facing acceptance;
- no gameplay contract is reopened.

Authorized in-contract repair:
- V07-M3 on `repair/v07-character-pipeline-v2`;
- free authoring toolchain bootstrap is present under `tools/character-pipeline-v2/`;
- Germinator V07-G2 independently audits the repair before Gonza rebuilds the preview.

M3 resolution evidence (superseded by user-directed reference-fidelity pass):
- latest exact candidate: `032b1bb28c5dd4421e5772cc40ab007f42e4d462`;
- the user supplied authoritative identity/action references for El Toro, Juanchi, Supernariz and Camaleoni; Mario re-authored proportions, canonical clothing/props, material texture cues, facial/hair treatment and portraits against those references while preserving procedural Canvas2D runtime;
- Character Pipeline V2 run #36 / `35567747782`: **336/336 PASS** + build + visual captures + runtime raster guard PASS;
- visual artifact `v07-m3-visual-evidence`, ID `10625370497`, SHA-256 `cbf9628b612e04acfe23ad4dcfc9b988b81b9f5c49612d325be40fe360e437f3`;
- artifact contains neutral silhouettes, normal color, Juanchi-vs-El-Toro, effects-light El Toro action poses and 844×390 phone-landscape evidence;
- Mario handoff: `coordination/handoffs/V07-M3-mario.md`.
- initial structural candidate `e053e0b187acff3b4555ce8d537e9fd9ca616303` is historical and must not be audited as the current candidate.

Smallest current action:
G2 is complete. Gonza should rebuild/re-publish the isolated preview from exact candidate `f34760948cb2024c0c83f4a02202117a8ad3bf2f`. Production root remains blocked pending user physical-phone acceptance.

### G2 resolution — independent character-pipeline audit

- Germinator verdict: `APPROVE — CHARACTER PIPELINE REPAIR GREEN`;
- audited product SHA: `f34760948cb2024c0c83f4a02202117a8ad3bf2f`;
- QA evidence SHA: `88147cfb8cc7720f426a589654e5fcdc0a8be4cf`;
- Repository verification #1341 / `35575118068`: 350/350 PASS + build;
- Character Pipeline V2 #56 / `35575117968`: 350/350 PASS + build + captures + runtime raster/reference guard;
- seven independent G2 adversarial probes: PASS;
- final G2 capture images are byte-identical to the exact M3I candidate captures;
- independent neutral-silhouette diagnostics show El Toro/Juanchi width ratio increasing from ~1.29× at baseline to ~1.77×, and silhouette-area ratio from ~1.28× to ~1.70×;
- direct inspection confirms Camaleoni neck/tail, Supernariz nose/cape, narrow athletic Juanchi, and broad/heavy planted El Toro remain distinct at phone scale;
- portraits and gameplay rigs consume the same `CharacterStructure` authority;
- effects-disabled El Toro action evidence is rendered directly from the rig;
- baseline→candidate production changes are render-only; no gameplay/simulation production file changed;
- no runtime user/reference fighter raster is loaded.

The visual-identity blocker is resolved for rebuilt-preview integration. This does **not** waive the separate V7-10 physical-phone/user acceptance gate. The old preview/candidate `65bbb4122be526b0b878c214137192c7243db3ab` remains rejected and historical.


## RESOLVED — V07-M3B stale shared visual-gate assertion

- Reporter: Mario-B
- Task: `V07-M3B`
- Candidate: `823589d3707aa2cedbe3b0dd8b946cdc56c4400d`
- PR: #42
- Evidence: Repository verification run `35570494671` / #1230 and Character Pipeline V2 run `35570494480` / #40 both fail in the full test suite at `tests/v07-m3-character-pipeline.test.mjs:119`.
- Contradiction: the test asserts `/Jacket tied around the waist/` in `JuanchiRig.ts`, but authoritative `docs/characters/juanchi/PACKAGE.md` does not include that legacy jacket cue, and Mario-A's active shared-architecture finding explicitly says it must not outrank the package/master.
- B-side resolution already applied: removed the legacy jacket and replaced it with canonical cargo waistband/belt loops/gold hardware; no gameplay/shared renderer files changed.
- Scope boundary: Mario-B does not own the shared V07-M3 gate test and will not reintroduce incorrect art solely to satisfy it.
- Required repair: Mario-A/shared visual-gate owner should update the stale assertion to canonical Juanchi cues, then the combined/integration candidate must rerun full tests/build/captures.
- Affected chain: V07-M3B cannot claim GREEN/HANDOFF_READY from isolated CI until the stale shared gate is repaired. M3I/G2 remain downstream as already defined.

Resolution evidence:
- Mario-A repaired the shared canonical Juanchi gate at `d6d1e074526cd1674af4e6103995eda19ab5a46b` and explicitly authorized B to consume only that test delta.
- Mario-B consumed the exact shared test repair and reached final lane SHA `68dd441feabebe672ab7da791dc378f7d3778201`.
- Repository verification #1261 / `35571146380`: PASS.
- Character Pipeline V2 #47 / `35571146374`: PASS, including full tests, build, visual capture and runtime raster/reference guard.
- Visual artifact ID `10626157139`, digest `sha256:0a2544fb31604a0bab80f57e21e34051b9be772e8f9c9e9ce1d912f10b1ea8b2`.
- V07-M3B is HANDOFF_READY; no blocker remains from this finding.


## RESOLVED — V07-M3I integrated visual delta was too small for super-improvement acceptance

Owner: Mario-A / V07-M3I  
Integrated candidate: `4a485d9244b3e8ce86c4700d4a299dc5f3cb84f6`  
Status: RESOLVED / REFRESHED M3I GREEN

Technical evidence is green:
- Repository verification #1291 / run `35571839137`: PASS;
- Character Pipeline V2 #49 / run `35571839119`: PASS;
- integrated visual artifact ID `10626296792`, digest `sha256:5021f824cef2f2a3042174a55dc4358507bdd2bfbed03ad8b1eb647e948960df`;
- all 14 integrated file blobs exactly match accepted A/B/C/D lane blobs;
- runtime raster/reference guard: PASS.

Visual acceptance check against squad base `032b1bb28c5dd4421e5772cc40ab007f42e4d462`:
- full-frame normal-color changed pixels: ~1.96%;
- neutral-silhouette changed pixels: ~0.53%;
- phone-landscape changed pixels: ~2.44%;
- normal-color fighter-crop changed pixels: Camaleoni ~2.66%, Supernariz ~5.17%, Juanchi ~8.84%, El Toro ~6.79%;
- silhouette fighter-crop changed pixels: Camaleoni ~0.95%, Supernariz ~1.30%, Juanchi ~2.39%, El Toro ~1.77%.

These raster deltas are diagnostic only, not an artistic score. However, combined with direct inspection they show the candidate remains much closer to the rejected baseline than the term “super-improvement” implies. Most identity improvement is detail-level rather than a substantial reconstruction of silhouette/head/body language. El Toro and Juanchi are more distinct than before, but still share too much of the same procedural head/torso language at phone scale.

Expected:
- materially stronger reference identity at normal and phone scale;
- El Toro substantially richer and more structurally distinct than the rejected preview;
- clear four-fighter silhouette separation that does not depend mainly on color/text/accessories.

Actual:
- CI/build/runtime constraints are correct;
- visible improvement exists but is too incremental for V07-M3I acceptance;
- forwarding this candidate to Germinator would knowingly lower the task's own visual acceptance bar.

Affected chain:
- V07-M3I is BLOCKED from HANDOFF_READY;
- Germinator V07-G2 remains WAITING_DEPENDENCY;
- Gonza remains blocked.

Authorized in-contract repair:
- reopen V07-M3B for a stronger El Toro + Juanchi structural/reference pass;
- reopen V07-M3C for stronger Camaleoni + Supernariz silhouette/detail pass;
- keep V07-M3D green unless the next integrated capture shows motion/FX-specific regression;
- no gameplay, balance, UI or renderer-architecture expansion is authorized.

No user scope decision is required for this repair because it stays inside the already-authorized multi-instance visual super-improvement contract.


### Resolution — refreshed M3I

- refreshed exact candidate: `f34760948cb2024c0c83f4a02202117a8ad3bf2f`;
- refreshed B: `cc75a56a1c56d9c6a988a3144880719a3515c4e9`;
- refreshed C: `3131bbef6a517785722d48a255e2d8a0daf10e7b`;
- A and D remained frozen;
- Repository verification #1326 / `35574082604`: PASS;
- Character Pipeline V2 #54 / `35574082616`: PASS;
- artifact ID `10626449146`, digest `sha256:bba910e35cf910693d483236bce181a5b90e968d36276c63a75eeee0983936d4`;
- 14/14 integrated files match accepted lane blobs exactly;
- baseline→refreshed integrated changed-pixel coverage: ~8.35% normal color, ~4.31% neutral silhouette, ~10.13% phone landscape;
- rejected first integration→refreshed integration: ~7.70% normal color, ~4.13% neutral silhouette, ~9.46% phone landscape.

Direct artifact review shows materially stronger structural separation: Camaleoni long-neck/tail silhouette, Supernariz nose/cape silhouette, narrow athletic Juanchi, and broad/heavy planted El Toro. V07-M3I is HANDOFF_READY and Germinator G2 is unlocked. Metrics are diagnostic evidence of change, not artistic scores.


## PENDING GATE — rebuilt preview physical-phone acceptance

Owner: Gonza / user-facing V7-10 gate  
Approved product input: `f34760948cb2024c0c83f4a02202117a8ad3bf2f`  
G2 verdict: `APPROVE — CHARACTER PIPELINE REPAIR GREEN`

The old preview `65bbb4122be526b0b878c214137192c7243db3ab` is rejected/historical. Its earlier phone-smoke gate cannot be reused as release acceptance for the repaired visuals.

Next evidence must come from a newly rebuilt isolated `/v07-preview/` artifact based on the G2-approved M3I candidate. Gonza may publish that isolated preview now, but production root remains V0.6 until the user tests the rebuilt preview on a physical phone and accepts:
- character identity/portraits;
- difficulty/Lengua sanity;
- Juanchi locomotion + aura;
- El Toro signature actions;
- Clash, both stages, rematch/input;
- clipping/control reachability/performance.

This is a release gate, not a reopened product-code blocker.


### Rebuilt preview now served — physical gate still pending

- rebuilt source: `f34760948cb2024c0c83f4a02202117a8ad3bf2f`
- rebuilt verification run: `35575811935` — SUCCESS
- standalone SHA-256: `b0326df090a4847dff43d43f9d3280937ffe8b2113fea97a5590a7070d5d3be3`
- standalone git blob: `40135c2db0b908bf9a901fa50b08de2b239f5014`
- gh-pages rebuilt-preview publish: `d7358cd390445e22d1dbc31bb346a5ea82e1bdb6`
- Pages run: `35575920696` — SUCCESS
- preview URL: https://faustobiancotto10.github.io/Juego-pelea/v07-preview/
- preview index/play are exact rebuilt blob `40135c2d...`
- production root remains V0.6.

The old preview is superseded. The only remaining release gate is user physical-phone acceptance of this rebuilt preview.


## PENDING GATE — rebuilt V0.7 preview is ready for physical-phone acceptance

Owner: Gonza / user-facing V7-10 gate  
Status: OPEN — PHYSICAL PHONE ACCEPTANCE REQUIRED

This replaces the historical rejected-preview gate.

Approved product source:
- `f34760948cb2024c0c83f4a02202117a8ad3bf2f`
- Germinator G2 verdict: `APPROVE — CHARACTER PIPELINE REPAIR GREEN`

Rebuilt-preview evidence:
- standalone verification run `35575811935`: SUCCESS;
- full tests/typecheck/build: PASS;
- rebuilt 844x390 browser smoke: PASS;
- runtime reference-raster guard: PASS;
- standalone SHA-256: `b0326df090a4847dff43d43f9d3280937ffe8b2113fea97a5590a7070d5d3be3`;
- exact preview blob: `40135c2db0b908bf9a901fa50b08de2b239f5014`;
- gh-pages publish SHA: `3b58ff4c416e1a98b6b27414bb16723e97594fff`;
- Pages run `35576000562`: SUCCESS;
- preview URL: https://faustobiancotto10.github.io/Juego-pelea/v07-preview/;
- production root remains V0.6 and was not promoted.

Physical phone acceptance must be performed against this rebuilt preview, not the historical rejected one.

Required user checks:
1. four portraits and fighter identity/readability, especially El Toro vs Juanchi;
2. Easy / Normal / Hard selector;
3. Lengua counterplay sanity;
4. Juanchi walk/backwalk and genuine red rage aura;
5. El Toro Topete / Shawarmazo / Super Eructo readability;
6. Ultimate Clash readability;
7. Tramontana and Cancha 56;
8. result/rematch/input interruption;
9. clipping, unreachable controls or severe performance problems.

If accepted, Gonza resumes Z1 and promotes this exact rebuilt standalone to production root after final release-composition CI. If rejected, production root remains V0.6 and the finding routes to the owning repair lane.


## BLOCKER — V07-SPR-G1 exact candidate is package-loadable but not live-previewable

Task/owner: V07-SPR-G1 / Germinator  
Repair owner: Mario-A / V07-SPR-MI  
Audited candidate: `5c76664fb95ac9c1da019636ce3ad974c214d84c`  
Candidate tree: `d42ccea2ff64ce7010f51f92005a3fc2c606919a`  
QA evidence SHA: `3b9d754b0d1f118c774404c2371f188033ab7346`  
Validation PR: #58  
Run: `35779776446` / Repository verification #1681  
Status: OPEN / DOWNSTREAM BLOCKED

### Reproduction / evidence

Independent G1 suite result:
- coordination/tooling contract: PASS;
- 357 tests total;
- 354 PASS;
- 3 FAIL;
- build skipped after full-suite failure.

Passed probe:
- canonical verified RIGHT+LEFT packer emits `runtimeLoadable:true`, `blockingGates:[]`, `mirrorSafe:false`, matching RIGHT/LEFT key coverage and complete baked anchors.

Failed probes:
1. exact candidate does not expose El Toro through `DEFAULT_CHARACTER_COMPOSITION.playableIds` / default presentation composition;
2. `DEFAULT_SPRITE_PACKAGE_REGISTRY` is empty, so no El Toro browser package can be requested;
3. exact candidate has no runtime `assets/` root, while build only copies `assets/` to `dist/assets/`.

Lineage check:
- candidate `5c76664f...` and G2-approved V0.7 `f3476094...` diverge at frozen base `378a991d55bed03e6237a03fdf6dfe96653fae72`;
- sprite candidate is 523 commits ahead / 142 behind that V0.7 line;
- therefore publishing the exact candidate would regress the user-facing V0.7 composition instead of presenting El Toro's sprite pilot on top of it.

### Expected

One exact G1 candidate must be both:
- package-valid; and
- actually buildable/servable as the existing V0.7 El Toro fighter using the bilateral sprite backend.

### Actual

The generator and generic renderer are individually green, but they are not wired together in the exact candidate's live product path.

### Affected dependencies

- V07-SPR-G1: BLOCKED;
- V07-SPR-Z0 / Gonza: BLOCKED;
- user/device acceptance cannot start;
- verified RIGHT/LEFT source art and anchor reviews remain accepted.

### In-contract repair

Mario-A integration should:
1. compose the accepted sprite-pilot/runtime deltas onto the approved four-fighter V0.7 product lineage;
2. preserve El Toro gameplay and change only body presentation to `sprite` / `spritePackageKey:'el-toro'`;
3. materialize the verified generated manifest/body atlas in a build-served runtime asset path;
4. register the package in the default browser sprite registry;
5. prove build/serve, selected-fight loading, authored RIGHT/LEFT selection, anchors, error diagnostics and rematch lifecycle;
6. return a replacement exact SHA to Germinator.

No new art, anchor work, gameplay redesign or user scope decision is required.

### Tool receipts

- `TOOL_USED: Game Studio sprite-pipeline + game-playtest` — audit process/checklist applied.
- `TOOL_UNAVAILABLE: Game Development Studio / game-dev CLI` — command unavailable in this host; no CLI evidence claimed.


## RESOLVED — V07-SPR-G1 live integration blocker

Previous rejected candidate:
`5c76664fb95ac9c1da019636ce3ad974c214d84c`

Replacement exact product candidate:
`fe2b505639d8ebf2dc4ab204b545233d96f214f2`

Germinator verdict:
**APPROVE — SPRITE PILOT LIVE INTEGRATION GREEN**

Resolution evidence:
- replacement is a descendant of approved V0.7 `f34760948cb2024c0c83f4a02202117a8ad3bf2f`;
- four-fighter live composition preserved;
- El Toro live presentation is sprite-backed;
- default package registry resolves El Toro;
- runtime atlas/manifest are build-served and exact-byte copied to `dist`;
- 433/433 independent tests PASS;
- build PASS;
- RIGHT/LEFT authored facing tests PASS without canvas mirroring;
- deterministic visual samples from exact runtime atlas confirm correctly oriented `TE VOY A CHOCAR` on both facings plus readable Topete/Ultimate poses;
- 844×390 evidence remains legible.

Runs:
- Repository `35788754170`;
- Pipeline `35788754059`;
- artifact `10721170926`.

Affected downstream:
- V07-SPR-G1 VERIFIED;
- V07-SPR-Z0 Gonza READY for isolated preview only;
- production root still blocked.

## PENDING PRODUCTION GATE — canonical sprite package naming/encoding

Owner: sprite production / integration before cutover  
Status: OPEN — DOES NOT BLOCK ISOLATED PILOT PREVIEW

Authoritative architecture/plan specify:
- `assets/fighters/<id>/body.webp`;
- `assets/fighters/<id>/animations.json`.

Current El Toro pilot serves:
- `assets/fighters/el-toro/el-toro-body.png`;
- `assets/fighters/el-toro/el-toro-animations.json`.

Ruling:
- acceptable for the explicitly pre-cutover isolated pilot because manifest/registry/build/runtime loading are green;
- not acceptable as silent final production format;
- before production/full-roster cutover, either materialize canonical names/encoding or obtain an explicit Neureon amendment to the authoritative sprite contract.

This gate is separate from physical-phone acceptance.
