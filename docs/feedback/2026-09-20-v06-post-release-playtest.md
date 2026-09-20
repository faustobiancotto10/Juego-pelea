# V0.6 Post-Release User Playtest — Carry-Forward Evidence

Date: 2026-09-20  
Source: direct user playtest of the published V0.6 build.  
Status: AUTHORITATIVE HUMAN FEEDBACK FOR NEXT AUDIT.

This file records product findings **after** V0.6 release. These findings do not retroactively invalidate the release evidence; they define the next improvement problem.

## F1 — Camaleoni Lengua remains overpowered

User report:
> Lengua de Camaleoni sigue muy rota; spamearla permite ganarle a cualquiera con demasiada facilidad.

Required next-audit questions:
- quantify repeated-Lengua win/space-denial behavior against all current fighters;
- distinguish damage, knockback, recovery, reach, startup, meter gain, CPU response and human approach factors;
- test whether the V0.6 recovery/knockback change materially solved the original problem;
- produce a bounded redesign/tuning proposal rather than a blanket arbitrary cooldown unless evidence supports one.

## F2 — CPU is now too weak

User report:
> La IA ahora es muy mala y es demasiado fácil ganar.

Desired product direction:
- introduce **difficulty levels**;
- preserve deterministic/fair public-snapshot perception;
- harder difficulty may improve planning, reaction delay, commitment quality and tactical weighting, but must not become input-reading/perfect-defense cheating;
- difficulty must be data-driven and testable across the roster.

The audit must define exact difficulty semantics and what is/isn't allowed to change by level.

## F3 — Animation quality improved, but Juanchi walking looks wrong

User report:
> Las animaciones son mejores, pero Juanchi específicamente camina muy raro.

The next audit must inspect the actual V0.6 locomotion implementation and identify whether the issue is:
- planted-foot logic;
- stride length/cadence;
- root translation versus leg cycle;
- torso/hip counter-rotation;
- prop/ball arm constraints;
- forward/back gait reuse;
- interpolation/render-clock behavior;
- proportions/rig anchoring.

Do not prescribe a fix before inspecting the shipped code and rendered behavior.

## F4 — Character design quality is not carried into attack animation/effects

User report:
> El diseño de personajes es bueno, pero las animaciones de ataque no llegan a esa calidad. Faltan destellos, auras y efectos que vendan mejor el golpe.

Specific example:
- Juanchi's intended red rage aura was never actually implemented as an aura;
- the current presentation mainly turns Juanchi red before attacking, which does not match the intended visual treatment.

Broader requirement:
- audit **all current fighters**, not only Juanchi;
- identify where attacks lack anticipation, contact accent, trailing motion, energy/aura, screen-space response, hit flash, ground interaction or recovery readability;
- design a reusable procedural attack-presentation/effects standard rather than isolated per-character hacks;
- effects remain presentation-only and may never decide hitboxes/damage/stun/capture legality.

## F5 — New fighter request: El Toro

The user supplied a new fighter concept and two visual references.

Gameplay brief:
- **Close Special — Topete:** El Toro charges/launches forward to crush the rival like a rugby player.
- **Long Special — Shawarmazo:** throws a spicy shawarma sandwich projectile that deals damage.
- **Ultimate — Super Eructo:** a massive burp that deals damage and knocks the enemy back.

The next audit must turn this into an implementation-ready, balanced fighter contract instead of simply copying the sprite sheet literally.

## Priority

The next version should not become a generic polish pass. It should be planned around:
1. fixing the dominant Lengua problem;
2. restoring meaningful CPU challenge through explicit difficulty;
3. raising locomotion/attack-animation quality to match character design quality;
4. adding El Toro through the reusable character pipeline without reintroducing identity hardcoding.

No implementation round is active yet. Astra's next intervention is planning/audit only.
