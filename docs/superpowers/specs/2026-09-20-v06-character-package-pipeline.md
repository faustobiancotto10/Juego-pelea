# Reusable Character Package and production pipeline

Date: 2026-09-20 (audit begun 2026-09-19). Permanent workflow target, first exercised by Juanchi. [System composition](2026-09-20-v06-content-expansion-design.md), [Juanchi example](2026-09-20-v06-juanchi-character-contract.md) and [animation standard](2026-09-20-v06-animation-quality-contract.md) define the first version. **R004 is now active under AUTO_CHAIN; CURRENT_ROUND/task contracts govern execution.**

## Purpose

Fighter4 should consume existing slots, primitives, render/UX hooks and QA fixtures instead of prompting six agents to rediscover how a character works. This package replaces repetitive design discussion with one versioned contract. It cannot eliminate bespoke art, playtesting or engineering for a genuinely new mechanic.

Pipeline: concept → frozen Character Package → gameplay and procedural rig in parallel → roster integration → independent QA → release. Only dependency-bearing decisions require shared discussion; independent tasks remain independent.

## Exact package contents

Use `docs/characters/<id>/` as the durable authoring folder, separate from runtime `src/game/data/characters/<id>.ts` and procedural rig files.

| File | Required content | Owner / acceptance |
| --- | --- | --- |
| `PACKAGE.md` | stable ID/version/status; display identity; source reference paths/hashes; gameplay/art/UX contract links; all accepted SHAs; remaining gates | Neureon; no ambiguous master or branch |
| `references/master.*` | user-approved visual master or repository authoring copy; PACKAGE records the original user-supplied source hash and any conversion/compression; written identity corrections recorded | User authority / Neureon intake |
| `references/poses.*` or `POSE_REFERENCES.md` | authored/referenced front-side silhouette and key action poses, ground baseline, facing, prop anchors, readable dimensions | Mario; guidance only, no runtime imports |
| `GAMEPLAY.md` | archetype, strengths/weaknesses, stats, universal mechanics exceptions, existing/new primitive declaration, interactions with every roster archetype | Ricardo with Neureon |
| `MOVES.md` | IDs/bindings; complete frame/contact/damage/guard/stun/kb/hitstop/cancel table; projectile/Ultimate lifecycle including resets | Ricardo; all units/conventions explicit |
| `ANIMATION.md` | physical cause per action, preparation/contact/follow-through/recovery, gait/jump phases, anchor needs and prop exclusivity; effects-disabled recognition cases | Mario; permanent standard referenced |
| `COLLISION.md` | hurt dimensions; all local active extents; swept paths, facing/crossover rules, overlay checkpoints | Ricardo; Mario verifies contact silhouette |
| `PRESENTATION.md` | rig/visual keys, palette, effects at authoritative events, budgets, selection portrait/copy, resource labels | Mario + Brancaforte, discrete owned sections |
| `CPU.md` | preferred ranges, choice weights, special availability, delayed visible cues, explicit fairness limits | Ricardo; no input oracle |
| `ACCEPTANCE.md` | test IDs/scenarios, negative cases, automation vs human gates, exact commands, captured evidence and unresolved findings | Germinator verifies independently |

For Juanchi these documents may reference the complete V0.6 contracts instead of copying them. Package status must be honest: `CONCEPT`, `CONTRACT_READY`, `VISUAL_REFERENCE_SUPPLIED`, `IN_IMPLEMENTATION`, `QA_READY`, `ACCEPTED`, `RELEASED`. Source hashes in PACKAGE establish visual authority; repository copies are authoring access only. No placeholder image should be presented as authoritative.

Reference files remain under authoring/docs directories and must be excluded from standalone/runtime asset lists. SHA/hash identifies the actual master being reviewed, not just a mutable filename. Any pose sheet conflicting with the master is secondary; record an explicit decision before changing identity.

## Runtime deliverables per character

- One typed CombatCharacterContent export under `src/game/data/characters/<id>.ts`, with gameplay data, presentation metadata and existing primitive references.
- One procedural rig module under `src/game/render/characters/<Name>Rig.ts` (existing old rigs need not move merely for symmetry).
- Optional character-specific effect helpers; reusable projectile/Ultimate visual handlers selected by visualKey.
- One registration entry in released content composition and one explicit rig/visual registration. No new identity branch in CombatSimulation, GameInput, CpuController, flow or generic HUD.
- Tests `tests/characters/<id>.test.mjs`, plus participation in shared roster contract/matchup tests. Adjust the test command to discover this directory explicitly; current `tests/*.test.mjs` alone will silently omit nested tests.
- A completed evidence package, not just “it compiles.” All committed artwork remains procedural code; references cannot appear as loaded fighter images.

A new fighter using existing primitives should require **zero universal simulation/input changes**. A genuinely new primitive gets its own bounded proposal: purpose, discriminated data schema, lifecycle, reset/interaction rules, one simulation handler and generic tests. Juanchi introduces three such extensions once; future fighters reuse them where appropriate. Do not force every future design into boomerang/capture if it genuinely needs another primitive, but require evidence before expanding core.

## Parallel execution contract

Neureon freezes ID, bindings, move/frame conventions, collision dimensions, required events/fields, visual keys and reference identity. Numeric balance tuning may continue later only within these meanings; a schema or timeline change that affects Mario/Brancaforte requires one concise forum contract update with accepted SHA.

R004 uses the project's canonical delivery order: **Ricardo → Germinator → Mario + Brancaforte → Gonza**. Ricardo owns runtime data/physics/CPU and finishes the gameplay/core chain first. Germinator independently audits that gameplay/core candidate. Only after a green Germinator verdict do Mario and Brancaforte implement the final rendering/UI lanes in parallel. Gonza acts last: integration, complete build/parity verification and release. No developer may import another branch's stale coordination state.

Only one role edits a shared file at a time. Stable interface change goes through its owner; do not let each agent invent slightly different fields. Fixture snapshots must conform to the actual shared exported types and include reset/default values; fixtures are not runtime fakes shipped to users.

Under R004 `AUTO_CHAIN`, each written V06 task is preauthorized once its declared dependencies are green. The user pulse triggers synchronization and immediate eligible work; no PRESENT or per-stage Neureon token is required. A blocker/contract change stops only affected downstream work and is reported to the user.

## Reusable automated roster contract

For every playable ID: valid kit slots; finite stats/timelines; clean/crouch/air/guard behavior; defined normals/chains; ranged lifecycle and denial handling; close-Special counterplay; Ultimate whiff/capture/cost/cleanup; available rig/visual/metadata; CPU can select legal actions; select→VS→fight→result→rematch; input grammar unchanged.

For all ordered matchups in V0.6:9 including mirrors, both slots, center/walls; add seeds and distances at scenario level. For10+ fighters, full100 ordered structural/smoke cases remain cheap; use archetype/mechanic-pair coverage for expensive long matches, nightly/full regression when needed. Do not claim every possible interaction is balanced because a synthetic fixture passed.

The fourth fixture uses a new ID, different stats, existing returning projectile/multihit/cap primitives and a simple test-only procedural rig. A test registry may list it as playable to exercise UI; it is absent from default release content. Also generate metadata-only5/10-entry rosters for layout. Fixture render and CPU paths must execute; merely constructing an object does not prove extensibility.

Malformed-package cases: missing visual key, duplicate ID, unknown move/chain target, wrong projectile kind, NaN/infinite duration, overlapping/duplicate hit windows, impossible capture/release frames, illegal probabilities and mutable source mutation after registration. Errors name the package and field. No runtime silent fallback to an original fighter.

## Efficiency measurement and stop conditions

For Juanchi record: shared-core files changed for new primitives, number of cross-role contract revisions after freeze, integration conflicts, time/pulses blocked on missing information, and acceptance evidence produced. Fighter4 using existing primitives targets: zero new core identity branches, zero new input rules, one content registration plus one visual registration, at most one planned contract review before implementation, no unrelated roles blocking art/gameplay start. These are process targets, not a promise of a precise speed multiplier.

Do not automate a character generator, reference-image tracing service, animation editor, package marketplace or behavior DSL. First prove the manual typed package with Juanchi and the fourth fixture. Document the successful path so the next package can copy structure without copying another character's behavior or identity.
