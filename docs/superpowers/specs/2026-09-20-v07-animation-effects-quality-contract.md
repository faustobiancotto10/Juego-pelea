# V0.7 — Animation / Effects Quality Contract

Status: FROZEN FOR R005  
Owner after gameplay QA: Mario

## Goal

Raise presentation quality so the procedural characters' attacks look as intentional as their character designs.

The system remains render-only. Simulation continues to own every legal move, collision, hit, damage, stun, capture, Clash and resource event.

## 1. Juanchi locomotion repair

V0.6's generic gait passes technical planted-foot tests but visually misfits Juanchi.

Keep:
- travel-driven gait clock;
- hitstop/snapshot idempotence;
- wall-clamp no-treadmill behavior.

Add a small render-only `LocomotionStyle` table keyed by rig/presentation key.

Initial Juanchi style:
- effective forward stride: **54** world units instead of 66;
- backward stride multiplier: **0.80**;
- stance fraction: **0.62**;
- swing foot lift: **6**;
- pelvis bob amplitude: **1.3**;
- forward torso lean: **0.035**;
- backward torso lean: **-0.055**;
- add hip/chest counter-rotation tied to gait phase;
- add free-arm counter-swing;
- ball-holding arm remains constrained but shoulder/chest compensate;
- movement start/stop must visibly transfer weight.

Camaleoni/Supernariz keep existing behavior initially; style entries may encode their current values so the system is data-driven.

Acceptance:
- existing cadence/planted-foot/hitstop tests remain green;
- Juanchi phone capture must no longer read as sliding/overstriding;
- forward and backward walk are visually distinguishable without looking at displacement direction.

## 2. Shared attack-presentation registry

Create a bounded render-owned concept such as:

`AttackPresentationProfile`
- `telegraphKey`
- `trailKey`
- `contactBurstKey`
- `auraKey`
- `groundImpactKey`
- `intensity`

Character presentation maps move/Ultimate visual IDs to profiles.

This is **not** a generic animation graph and contains no gameplay frame legality. It consumes authoritative `moveId/moveFrame`, Ultimate phase and emitted events.

Missing visual handlers must degrade visibly/diagnostically, never silently route to another character.

## 3. Universal visual rules

Every important attack should combine a subset of:
- readable anticipation;
- body-driven active pose;
- directional motion trail;
- contact burst attached to authoritative hit event;
- restrained screen shake for strong/major impact;
- ground/debris response where thematically appropriate;
- readable recovery.

Effects must support the body animation, not conceal it.

Mobile budgets:
- no persistent opaque fullscreen layer;
- bounded particles/trails;
- no more than ~24 short-lived particles from one ordinary impact;
- Ultimate layers may be richer but must keep opponent silhouette/telegraph readable;
- effects freeze/advance from simulation-owned clocks/events consistently through hitstop.

## 4. Camaleoni

Required:
- claw normals: short green claw arcs/contact glints;
- Lengua: visible extension/snap trail emphasizing commitment and retraction without increasing logical reach;
- Coletazo: retain trail but improve ground/air mass cue on contact;
- Ultimate: existing veil/cuts remain, final hit receives stronger shared major-impact treatment.

Do not make the reduced V0.7 Lengua look longer than its logical range.

## 5. Supernariz

Required:
- nose normals: stronger curved nose trails and compact impact flash;
- Chorizo: distinct projectile trail and food/debris burst on authoritative contact;
- Tramontana/suction: layered wind lanes while preserving defender visibility;
- Ultimate final hit: shared major-impact treatment.

## 6. Juanchi

Required:
- jab/shoulder/low: gold/white directional accents proportional to move strength;
- Rugby Boomerang: better outbound/return trail and catch accent;
- Fricción: sparks originate between the hands, rise with the rub beats and culminate in the palm-release contact burst;
- Police Cap Rage: **real red rage aura**.

### Red rage aura contract

During the authored rage portion of the successful Ultimate sequence:
- aura exists outside/behind the body silhouette;
- layered red/crimson strokes/flame wisps pulse around torso/shoulders;
- a faint red floor/edge glow may support it;
- the body may receive a modest warm treatment, but body tint alone is not the aura;
- aura builds during rage, stretches into rush, and collapses at finisher;
- it is procedural Canvas2D and presentation-only.

Effects-disabled body motion must still communicate the action.

## 7. El Toro

Visual authority:
- `docs/characters/el-toro/PACKAGE.md`
- repository reference copies under `docs/characters/el-toro/references/`.

Required:
- heavy body weight/low center of gravity;
- scarf/loose clothing secondary motion;
- Topete: blue compression/drive trail + bounded turf/ground fragments on impact;
- Shawarmazo: clearly readable procedural shawarma + warm/orange spicy/food-debris impact;
- Super Eructo: translucent layered green gas/wave, expanding forward but never opaque enough to hide all counterplay.

## 8. Fighter-select portraits/icons

Mario owns four **game-style procedural portraits/icons**:
- Camaleoni;
- Supernariz;
- Juanchi;
- El Toro.

They must be generated/drawn from in-game procedural identity, not source photos/reference rasters.

Recommended surface:
- upper torso/head;
- fighter accent background;
- strong silhouette;
- recognizable defining feature;
- stable `portraitKey` registration.

Brancaforte consumes them inside fighter cards.

## Acceptance

- all four released fighters have a registered portrait;
- no `<img>`/runtime reference path to user-supplied fighter art;
- Juanchi real red aura is visually distinct from body tint;
- all four characters have at least one ordinary/one Special/Ultimate presentation enhancement;
- phone-landscape effects remain readable and performant;
- rendering does not change deterministic simulation snapshots.
