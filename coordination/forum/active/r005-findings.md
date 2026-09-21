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


## BLOCK_RELEASE — V07-Z1 physical-phone gate

Owner: Gonza  
Candidate: `65bbb4122be526b0b878c214137192c7243db3ab`  
Status: OPEN / USER PHYSICAL EVIDENCE REQUIRED

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


## BLOCK_RELEASE — V07-Z1 physical phone smoke pending

Task/owner: V07-Z1 / Gonza  
Exact product candidate: `65bbb4122be526b0b878c214137192c7243db3ab`  
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
Status: OPEN / REPAIR AUTHORIZED

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

Smallest current action:
Activate Mario. No Gonza release work should resume until M3 and G2 are green.
