# V0.6 — Cancha 56 Stage Contract

Date: 2026-09-20  
Status: FROZEN FOR IMPLEMENTATION

## Product intent

Cancha 56 is Juanchi's presentation stage: a **night rugby field being used as an informal party / gathering**, not an empty training ground and not a packed stadium.

The combat area must feel alive because people are watching and reacting around the field, while the actual fight remains the visual priority.

The stage is presentation-only. It may never alter simulation, collision, CPU, movement bounds, damage, meter, projectiles or move timing.

## Scene identity

Required visual anchors:
- rugby grass and touchline;
- visible rugby posts;
- perimeter fence / club boundary;
- low bleachers or simple sideline structures;
- night sky;
- practical field/flood lighting;
- informal groups of spectators around the fight;
- restrained party energy: social gathering, music implied, movement in the background.

The intended feeling is **neighborhood rugby + night + La 56 gathering**.

Do not turn it into:
- a professional stadium;
- a nightclub disconnected from rugby;
- an empty field;
- an enormous crowd wall;
- a particle-heavy background that competes with attacks.

## Crowd composition

Use clustered spectators rather than a uniform audience.

Preferred composition:
- several small groups along the far touchline and fence;
- a few people closer to the sideline edges;
- visible gaps between groups;
- central combat corridor kept clean;
- silhouettes/postures varied enough that the crowd does not look copy-pasted.

A loose ring/semicircle around the action is desirable, but never place foreground bodies over the fighters or touch controls.

Crowd motion is subtle and asynchronous:
- shifting weight;
- head/torso turns;
- occasional arm reaction;
- restrained bouncing/dancing;
- one-off reaction accents on major impacts/Ultimate/Clash if performance allows.

No synchronized looping crowd wave.

## Ambient props

Optional low-priority props:
- bench;
- sports bags;
- cooler;
- jackets/club clothing;
- small speaker or implied music source;
- fence banners / La 56 details;
- cones or rugby-training residue.

Use only enough to sell the event. Props may not become collision objects.

## Lighting / readability

Fighters and combat effects must remain more legible than the crowd.

Guidelines:
- darker/cooler overall night field;
- practical warm or neutral pools from lamps/floodlights;
- avoid high-frequency bright crowd details directly behind fighter silhouettes;
- keep the ground contact region readable;
- keep Juanchi's black clothing readable through edge separation/background contrast;
- retain clear red/white/impact effects without turning the whole scene red.

## Motion and clocks

Stage ambience is render-owned and non-authoritative.

It may use a presentation clock, but:
- it cannot affect combat snapshots;
- pause must visually freeze or safely suspend fight-relevant stage reactions;
- combat hitstop must not accidentally create simulation movement;
- major-event crowd reactions consume authoritative published events only.

## Performance

Mobile landscape is primary.

Crowd representation should favor inexpensive procedural silhouettes/shapes and bounded animation. Reuse poses/parts where visually acceptable, but avoid visible clone repetition.

The stage must remain within the performance envelope established by the existing stage on the same device. If crowd density materially degrades frame pacing, reduce animation/density before reducing fighter readability.

## Selection metadata

Stage ID: `cancha-56`  
Display name: `CANCHA 56`  
Role: Juanchi-associated stage, but selectable for every matchup.

V0.6 stage roster:
1. existing stage;
2. Cancha 56.

Rematch preserves the selected stage unless the user returns to stage select.

## Acceptance

- stage is selectable from the V0.6 stage-select flow;
- all three fighters/matchups render correctly on it;
- crowd visibly makes the field feel inhabited/event-like;
- crowd does not obscure fighters, HUD or touch controls;
- no gameplay snapshot differs solely because stage selection changed;
- major impact/Ultimate/Clash reactions remain presentation-only;
- no runtime fighter/reference raster asset is used;
- physical-phone visual/performance review passes before release.
