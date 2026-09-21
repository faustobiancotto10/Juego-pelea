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
