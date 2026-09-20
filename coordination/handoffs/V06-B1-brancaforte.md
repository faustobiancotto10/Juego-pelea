# Handoff — V06-B1 Brancaforte

Round: R004-V06-CONTENT-EXPANSION  
From: Brancaforte  
To: Mario, Gonza, Neureon  
Task: V06-B1  
Verdict: **GREEN — UI LANE COMPLETE**

## Exact product lineage

Accepted G1 product base:
`d815694a76a7a92c004203f1ae9fd14e2035744c`

Exact B1 candidate:
`81647506d2e69b92dd92e19f2fc997d21949a4a9`

Branch:
`round/r004-brancaforte`

Compare against accepted product:
- ahead: 6
- behind: 0
- changed files: 5 only

Changed files:
- `src/game/ui/AppController.ts`
- `src/game/ui/flow.ts`
- `src/styles.css`
- `tests/flow.test.mjs`
- `tests/ui-v06.test.mjs`

No simulation, fighter data, CPU, input-engine, renderer or gameplay-tuning files changed.

## Delivered flow

Official V0.6 front end is now:

`TITLE/COVER → FIGHTER SELECT → OPPONENT SELECT → STAGE SELECT → VS → FIGHT → RESULT`

### Title / cover
- first normal screen is a fighting-game cover, not the old two-card utility screen;
- dominant `COMENZAR`;
- secondary `CONTROLES`;
- procedural/DOM presentation only — no supplied fighter reference raster is loaded at runtime.

### Fighter / opponent select
- released roster comes from `DEFAULT_COMBAT_REGISTRY.playableIds`;
- visible metadata comes from `DEFAULT_FIGHTER_PRESENTATION_REGISTRY`;
- current released roster therefore includes Camaleoni, Supernariz and Juanchi without identity branches;
- selection and confirmation are distinct;
- selected state uses `aria-pressed`, strong visual focus and a separate info panel;
- mirror matches remain legal;
- `rosterDensity(count)` supplies `standard`, `compact` and `dense` modes for 3 / 5 / 10 entry layouts.

### Stage select
UI-owned match setup carries exact frozen IDs:
- `tramontana-dusk`
- `cancha-56`

Default is Tramontana.

Stage selection has:
- selectable procedural preview;
- name / description;
- selected state;
- confirm;
- deterministic back navigation.

B1 does not import or duplicate Mario's render-owned StageRegistry.

### VS / fight / result
- VS displays exact chosen player, opponent and stage;
- `GameFlowState.stage` persists into fight/result;
- rematch retains both fighters and stage;
- result supports:
  - REVANCHA;
  - CAMBIAR LUCHADORES;
  - CAMBIAR ESCENARIO;
- change/back navigation destroys any live GameInput through existing cleanup before mounting another screen.

## UI → renderer stage seam

Frozen cross-role seam recorded in `r004-contract.md`:

- B1 owns `GameFlowState.stage`;
- M2 owns StageRegistry/StageDefinition;
- Gonza final integration resolves the B1 stage ID through M2's accepted registry and passes the resulting stage presentation into FightRenderer.

This keeps stage choice presentation-only and prevents UI from owning render/gameplay truth.

## Juanchi / ranged HUD

No Juanchi-specific branch is used.

`fighterPresentation(id).rangedAvailabilityLabel` decides whether a ranged-resource row exists.

Authoritative snapshot state:
- `ready` → `LISTA`
- `inFlight` → `EN VUELO`
- cooldown/rearm → `REARME N`

The UI reads:
- `rangedAvailability`;
- `rangedRecoveryFrames`;
- existing projectile cooldown values.

It never decides whether a projectile may be thrown.

The same surface remains compatible with any released character package that supplies ranged availability metadata.

## Controls / combat authority

Established four-action mobile surface is preserved:
- JUMP
- ATTACK
- SPECIAL
- ULTIMATE

No fifth Push Guard button was added.

Help now safely describes all three released fighters:
- grounded low: Abajo + ATTACK;
- ranged Special: Lengua / Chorizo / Rugby Búmeran;
- close Special: Coletazo / Tramontana / Fricción;
- Push Guard remains SPECIAL while blocking;
- Ultimate remains touch ULTIMATE / keyboard L.

Simulation still owns every legality/cost/damage decision.

## Responsive / accessibility evidence

Automated V0.6 coverage verifies:
- safe-area left/right/bottom usage;
- explicit `:focus-visible` treatment;
- native button activation surfaces;
- `touch-action: manipulation`;
- standard / compact / dense roster modes;
- low-height phone-landscape breakpoint at 430 px;
- 3/5/10 roster geometry at:
  - 667×375;
  - 852×393 with 59 px safe-area assumption;
  - 932×430 with 59 px safe-area assumption;
- no runtime `<img>` fighter reference assets or supplied Juanchi master/sheet path/hash use.

The live fight HUD/control footprint itself was not enlarged by the menu redesign; only the small metadata-driven ranged row is generalized.

## TDD evidence

### RED

Tests-only head:
`55f937ad24721fbdb7ddfc4eaf83b36cf53c9598`

Repository verification:
`35537255220` (#842) — expected FAILURE.

Observed:
- 10 intended V06-B1 failures;
- failures were title/stage flow, back flow, 3/5/10 density, cover, scalable roster confirmation, stage select, result actions, ranged HUD and V0.6 CSS;
- inherited G1/core behavior remained green.

### GREEN

Exact final candidate:
`81647506d2e69b92dd92e19f2fc997d21949a4a9`

Repository verification:
`35537585227` (#848) — **SUCCESS**

Evidence:
- coordination contract: PASS
- full suite: **255/255 PASS**
- failures: **0**
- build: PASS
- TypeScript compilation: PASS through repository verification/build

Key final passing V0.6 tests:
- full title → player → CPU → stage → VS → fight → result flow;
- stage/fighter persistence through rematch/change flows;
- deterministic back flow;
- 3 / 5 / 10 roster density;
- cover first screen + COMENZAR;
- registry-driven roster + selected info/confirm;
- Tramontana + Cancha 56 selection and VS propagation;
- result actions;
- metadata-driven Juanchi ranged availability;
- four-action controls grammar;
- safe-area/focus/phone-landscape CSS;
- 667/852/932 landscape geometry;
- no runtime reference raster.

## Self-review

No independent reviewer subagent is available in this chat runtime, so the final branch review was a self-review against:
- the frozen V06 UI-flow spec;
- accepted G1 product SHA;
- ownership boundaries;
- exact five-file diff;
- final full-suite/build evidence.

No Critical/Important issue was found in that review.

## Evidence boundary / carry-forward

This environment cannot perform a physical iPhone Safari/tactile session.

Therefore B1 claims:
- automated structural safe-area/layout evidence;
- keyboard/native-button/focus contract evidence;
- full source/build/regression evidence.

It does **not** claim:
- physical-thumb reach quality;
- real Safari gesture feel;
- final integrated stage-render/UI visual obstruction.

Those are final integrated/served-product checks for Gonza after M2 composition.

## Integration instruction

Do not merge CI PR #23.

Use exact B1 product SHA:
`81647506d2e69b92dd92e19f2fc997d21949a4a9`

relative to accepted product:
`d815694a76a7a92c004203f1ae9fd14e2035744c`

M2 and B1 have disjoint ownership surfaces. Final stage-render wiring belongs to Gonza after M2 green.

