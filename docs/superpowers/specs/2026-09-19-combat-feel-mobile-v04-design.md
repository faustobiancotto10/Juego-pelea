# V0.4 Combat Feel & Mobile Controls — Approved Product Design

Status: approved by user for Round R002
Scope owner: Neureon
Implementation owners: Ricardo, Mario, Brancaforte, Germinator, Gonza
Baseline release: V0.3 main `e16b2cb06e9206a276796e6ef95944ca1f746809`

## Intent

V0.4 is a focused feel/balance/control pass based on direct playtesting of the released V0.3 build.

The user reported four concrete problems:
1. Supernariz CPU is too strong/too optimal.
2. Camaleoni's close combat feels substantially too weak.
3. Mobile Ultimate activation is uncomfortable because ATTACK+SPECIAL while moving effectively requires three fingers.
4. A residual "trapped/captured" effect still remains after the state should be over.

The user also requested:
5. a materially better procedural Coletazo animation;
6. more elaborate presentations for both Ultimates.

This round must fix those issues without expanding roster/stages/modes or replacing the deterministic simulation architecture.

## Product priorities

Priority order:
1. remove the persistent trapped-state/effect bug;
2. improve mobile Ultimate ergonomics;
3. correct Supernariz CPU pressure and Camaleoni melee viability;
4. improve Coletazo and Ultimate presentation;
5. preserve V0.3 determinism, clarity and mobile performance.

## Supernariz CPU correction

Supernariz should remain the pressure-oriented CPU, but may not feel frame-perfect or oppressive.

Required behavior:
- preserve deterministic imperfect reactions and commitment windows;
- reduce sequences where CPU immediately converts every legal pressure opportunity;
- introduce measurable decision/reaction gaps after authored offensive commitments;
- avoid repeated optimal projectile/approach/close-special loops;
- do not react to raw player input or hidden future state;
- allow real punish/escape windows after whiffs, blocked commitments and failed approaches;
- Ultimate usage remains contextual rather than instant at READY.

Exact numeric tuning belongs to Ricardo and must be validated by Germinator through repeatable matchup scenarios.

## Camaleoni close-combat viability

Camaleoni remains the stronger space-control fighter, not a rushdown clone, but his close game must stop feeling nonfunctional.

Required:
- first normal and chain must have practical contest/punish value;
- close-range hit confirmation must be reliable enough to matter;
- Coletazo must be a credible pressure-reset/close-range tool;
- startup/recovery/hitstun/knockback/reach may be retuned;
- improvement must not make Camaleoni strictly better than Supernariz at close range;
- Supernariz may keep a pressure/tempo identity, but Camaleoni must have viable defensive/offensive decisions at melee distance.

Germinator must test actual interaction windows, not only compare isolated frame numbers.

## Dedicated mobile Ultimate button

V0.4 intentionally supersedes the V0.3 "no fourth persistent action button" decision for touch controls.

Mobile landscape adds one dedicated **ULTIMATE** action button.

Required behavior:
- visible in the touch action cluster without obstructing the fight;
- clearly disabled/not-ready before full SUPER;
- clearly READY at full SUPER;
- one touch emits one Ultimate intent;
- the player can hold movement on the D-pad and activate Ultimate with one other finger;
- no ATTACK+SPECIAL chord is required on touch;
- touch Ultimate activation must not leak ATTACK or SPECIAL;
- simulation remains the sole authority for meter spend, legality, capture and recovery.

Desktop/keyboard may retain the existing ATTACK+SPECIAL chord as a fallback unless Brancaforte finds a cleaner compatibility path. The round does not require a new keyboard key.

Controls/help and first-ready messaging must be updated to match actual platform controls.

## Persistent trapped/capture bug

This is a real bug, not a cosmetic request.

Required investigation:
- reproduce the residual "trapped" behavior/effect;
- determine whether the stale state originates in simulation, renderer, or both;
- verify cleanup after hitstun, ultimate capture/sequence/recovery, KO/result transition, rematch and character-select/new-fight reset;
- no lingering immobilization, suction/capture pose, overlay, effect, target lock or stale phase may survive after its owning state ends;
- do not hide a simulation bug with a render-only timeout.

Ricardo owns simulation/state cleanup. Mario owns presentation/effect cleanup. Germinator must add a regression that fails if stale state survives the relevant transition.

## Coletazo presentation

Coletazo must have a clearly authored procedural animation rather than reading as a generic pose.

Presentation goals:
- visible anticipation/wind-up;
- torso/hip counter-rotation;
- clear tail acceleration through the strike arc;
- readable contact frame;
- follow-through and recovery;
- bounded motion trail/arc or impact emphasis where useful;
- animation timing follows authoritative move timeline and never changes hit validity;
- silhouette remains readable on a small mobile landscape screen.

No sprite sheet or runtime reference-image loading.

## Camaleoni Ultimate presentation

Keep the gameplay concept: invisibility/near-invisibility forward capture into guaranteed combo.

Make the presentation more elaborate through procedural/effect work:
- stronger but readable startup tell;
- disappearance/invisibility transition rather than abrupt alpha toggle;
- controlled dash streak/afterimages;
- capture beat that clearly communicates success;
- multi-beat guaranteed combo presentation driven by simulation timeline;
- deliberate reappearance before/at finisher;
- stronger finishing impact and recovery cue;
- no extra gameplay hits/damage unless Ricardo explicitly authors them and QA accepts them.

## Supernariz Ultimate presentation

Keep the gameplay concept: Aspiración + Nazazo.

Presentation goals:
- clearer inhale preparation;
- expanding/converging suction field;
- body/cape/nose posing that sells force direction;
- visually readable opponent pull during authoritative capture;
- brief authored impact emphasis before the nazazo;
- stronger launch trail/spacing-reset feedback;
- clear end/recovery so no trapped effect appears to persist.

## Animation/gameplay separation

Renderer consumes simulation truth only.
Mario may not infer:
- capture validity;
- damage;
- hitbox contacts;
- meter spend;
- target lock;
- sequence completion.

If a richer animation needs an additional authoritative phase/event, Mario requests it from Ricardo rather than inventing gameplay state.

## Mobile layout and performance

The fourth touch action must fit safe areas and preserve the playfield.

Required:
- landscape iPhone-scale validation;
- no overlap with HUD/D-pad;
- touch targets remain usable;
- no accidental multi-touch cancellation while movement is held;
- effects stay bounded;
- no unbounded particles/per-frame arrays;
- no runtime sprites/reference images.

## QA scenarios

At minimum:
- Supernariz CPU repeated pressure/approach scenarios with measurable punish windows;
- CPU imperfect-reaction checks and no raw-input reading;
- Camaleoni close-range contest after block, whiff punish and pressure reset with Coletazo;
- matchup comparison ensuring the buff does not create strict Camaleoni close-range dominance;
- mobile hold-direction + tap ULTIMATE using two fingers total;
- ULTIMATE disabled/not-ready behavior;
- touch Ultimate emits no normal attack/special leakage;
- desktop chord regression if retained;
- persistent trapped-state/effect cleanup after both successful Ultimates, whiffs, interrupted startup, KO, rematch and new fight;
- Coletazo/Ultimate renderer contract and no forbidden image loading;
- deterministic replay/regression of V0.3 combat rules;
- mobile landscape smoke.

## Release target

Accepted V0.4 ships:
- tested source;
- updated standalone `play.html`;
- synchronized GitHub Pages release;
- public artifact matching approved integrated source.

## Explicitly out of scope

- third fighter;
- new stage;
- story/progression/save expansion;
- online play;
- engine migration;
- redesign of GUARD/SUPER economy unless required to fix a demonstrated V0.4 bug;
- replacing procedural fighters with imported sprites;
- broad rebalance unrelated to the reported matchup/CPU issues.
