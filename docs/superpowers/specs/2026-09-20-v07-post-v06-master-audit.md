# V0.7 — Post-V0.6 Master Audit

Date: 2026-09-20  
Audit base: official V0.6 on current `main`  
Status: FROZEN INPUT FOR R005

## Evidence hierarchy

1. direct post-release user playtest;
2. actually shipped V0.6 source on `main`;
3. passing automated V0.6 tests/build as regression evidence, not a fun/quality verdict;
4. old design specs only when they match shipped code.

## What V0.6 genuinely solved

- three-character Character Package composition exists and deeply validates/freeze-clones combat content;
- registry/UI flow no longer fundamentally assumes only two roster entries;
- returning projectile and authored multi-hit primitives exist;
- Universal Ultimate Clash removed the old slot-order capture bias;
- locomotion is driven by advancing simulation travel rather than wall-clock treadmill oscillators;
- Juanchi has a procedural rig and authoritative prop states;
- two stages and a fighting-game front-end flow ship;
- source→standalone→Pages release verification exists.

## What human playtest disproved

Green QA did not prove good balance, challenge or presentation.

The user reports:
- Camaleoni Lengua remains a dominant spam strategy;
- CPU is now too easy;
- Juanchi walk is visibly wrong despite technical planted-foot tests;
- attack presentation is below character-design quality;
- Juanchi lacks the intended genuine red rage aura;
- the roster should expand with El Toro.

These reports are accepted as product evidence and define V0.7.

## A1 — Lengua root cause

Shipped `tongueStraight`:
- total 46;
- active 12–14;
- offset 34 / width 340;
- damage 80;
- hitstun 18;
- blockstun 12;
- knockback 4.8;
- guard damage 14;
- CPU threat range 405.

V0.6 reduced knockback and increased recovery relative to V0.5, but the move still combines:
- extremely large practical reach;
- high clean-hit damage;
- long hit/block control;
- meaningful guard damage;
- enough spacing reset to repeat before a weak defender creates pressure;
- a CPU whose delayed/simple defensive/approach policy does not punish repetition consistently.

The problem is therefore not one number. V0.7 narrows reach and reward while increasing commitment and reducing block reset.

See `2026-09-20-v07-lengua-balance-contract.md`.

## A2 — CPU weakness root cause

`CpuController` is fair and deterministic, but current policy is intentionally conservative:
- fighter profiles commonly use reactionTicks 12;
- decisionTicks 8;
- missChance 0.25;
- simple delayed cue response;
- Ultimate response is a fixed jump/dash-away split;
- neutral planning contains fixed probabilities;
- no explicit user-selectable skill model.

The architecture is suitable for difficulty scaling because it already separates delayed observation from action legality.

V0.7 adds difficulty as a policy modifier only. Difficulty never grants current-frame opponent input, future state, illegal resources, extra health/damage or perfect defense.

See `2026-09-20-v07-cpu-difficulty-contract.md`.

## A3 — Juanchi locomotion diagnosis

`LocomotionPoseTracker` technically plants feet and is cadence-stable, but all fighters share one largely generic gait model. Juanchi only differs mainly through a 66-unit stride constant.

That is insufficient for his proportions and identity:
- long stride exaggerates his broad procedural body;
- limited fighter-specific hip/chest counter-rotation makes legs look detached from mass;
- the held-ball arm constraint reduces natural counter-swing;
- the same mathematical foot arc is visually applied to a distinct silhouette;
- forward/back differences are mostly scalar stride/lean changes.

V0.7 keeps the travel-driven tracker but adds bounded per-rig locomotion style data and Juanchi-specific upper-body compensation.

## A4 — Attack presentation diagnosis

The renderer already has useful procedural effect helpers, but they are fragmented:
- Camaleoni veil/cuts;
- Supernariz suction/nazazo;
- dash/reappearance/launch effects;
- Clash/Ultimate impact;
- Juanchi body rage pose.

There is no coherent per-move attack-presentation contract/registry. Effects are therefore uneven, and some intended identities were approximated by body tint/pose rather than a distinct effect.

Juanchi's red rage treatment must become a real detached procedural aura, not a color substitution.

V0.7 adds a small render-only attack-presentation registry keyed by visual metadata. It does not become an animation engine and never owns gameplay truth.

## A5 — Character Package scaling audit

The V0.6 composition is a credible base, but adding fighter four still requires explicit released-package and render registration. That is acceptable; explicit registration is not the same as architecture failure.

Remaining bounded extensions for El Toro:
- add `EL_TORO_CHARACTER_CONTENT` to released packages/playable IDs;
- add `el-toro` procedural rig/portrait registrations;
- add Shawarmazo visual key;
- add one new typed Ultimate kind for a non-capture forward blast;
- extend Ultimate Clash confrontation handling for that kind;
- add CPU tactics/content and UI presentation metadata.

Shawarmazo reuses the existing `linear` projectile kind. Topete can be authored as an ordinary committed movement Special using bounded simulation movement data; it must not create a generic movement scripting system.

## A6 — Fighter-select portrait requirement

V0.6 fighter tiles show a letter mark (`C/N/J`) rather than a real game-character icon.

V0.7 replaces the mark-first presentation with a **procedural game-style portrait/icon** per fighter:
- Camaleoni;
- Supernariz;
- Juanchi;
- El Toro.

Uploaded/source reference images are forbidden in runtime and cannot be cropped into cards.

Presentation metadata gains a `portraitKey`; Mario owns portrait renderers, Brancaforte owns card layout/interaction.

## V0.7 product boundary

V0.7 includes:
1. Lengua counterplay correction;
2. Easy/Normal/Hard CPU;
3. Juanchi locomotion repair;
4. shared attack/effect quality pass across all released fighters;
5. El Toro as fourth fighter;
6. game-style portrait cards for all four fighters;
7. final mobile/device and deterministic release verification.

V0.7 excludes:
- new stage for El Toro by default;
- online/story/shop/account systems;
- generic ECS/scripting/animation-graph rewrite;
- long combo-system redesign;
- fifth gameplay action button;
- raster fighter/reference assets in runtime.

## Permanent engineering conclusion

Automated correctness and human game quality are separate gates. R005 keeps Germinator's independent deterministic QA, but final release evidence must also include targeted physical play/readability checks tied to the user's reported failures.
