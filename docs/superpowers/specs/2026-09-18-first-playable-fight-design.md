# First Playable Fight — Design Spec

## Goal
Build a mobile-first 2D browser fighting-game V0.1 with two selectable fighters — **Camaleón** and **Supernariz** — and a complete player-vs-CPU duel loop from Character Select through KO/result/rematch.

## Product Loop
1. Character Select: choose player fighter.
2. Choose CPU opponent.
3. Short VS transition.
4. Best-of-three-round fight on one stage.
5. Result screen with Rematch and Character Select.

Mirror matches are allowed.

## Non-negotiable visual rule
The supplied character images and generated sprite sheets are **reference-only**. They must not be cropped, embedded, or used as production runtime fighter textures. The runtime fighters must be reconstructed as native 2D game entities.

V0.1 uses **articulated procedural vector rigs** built from Canvas2D primitives and programmatic paths. Character identity, proportions, colors, silhouette, pose intent, and attacks may be interpreted from references, but the game must not render the source PNG/JPEG sheets as fighters.

A visual implementation fails acceptance if it reads as a flat sticker sliding over the background.

## Stack
- TypeScript strict
- Native Canvas2D renderer (no external runtime dependency)
- Browser ES modules compiled by `tsc`
- DOM overlay for menus/HUD/touch controls
- Node built-in test runner with TypeScript type stripping
- Git

## Architecture
Simulation is renderer-independent and runs at a logical fixed rate of 60 Hz. Canvas2D is presentation only: it consumes simulation snapshots/events and renders the stage, procedural fighter rigs, FX, and camera effects. DOM owns Character Select, HUD, result screen, and touch controls.

### Modules
- `simulation/`: deterministic fighter state, movement, attacks, hitboxes, damage, blocking, rounds, projectiles, hitstop, CPU actions.
- `input/`: keyboard/touch action mapping to one `InputFrame` format.
- `render/`: Phaser scene, fighter vector rigs, effects, stage.
- `ui/`: DOM overlays and mobile controls.
- `data/`: fighter definitions/move timelines.

Combat hitboxes and move timing are authoritative in simulation data. Rendering/pose state never determines whether an attack hits.

## Input language
Mobile landscape is primary.
- 8-direction digital D-pad on the left.
- `ATTACK`, `SPECIAL`, `JUMP` on the right.
- Block by holding away from the opponent; down-back also blocks low.
- No dedicated block button.
- No gesture is required for a core action.

Desktop fallback:
- A/D: left/right
- S: down/crouch
- W or Space: jump
- J: attack
- K: special

## Shared combat
- horizontal movement, crouch, jump, gravity, facing, arena bounds
- startup / active / recovery frame timelines
- hitboxes/hurtboxes
- blockstun, hitstun, knockback, hitstop
- health, 60-second round timer, KO, best-of-three rounds
- simple combo queue/cancel windows
- no ultimate in V0.1
- no online multiplayer

## Camaleón
Role: zoner / distance control.

Visual reconstruction:
- green reptilian body
- oversized stylized human-like head with dark curly hair
- very short arms
- compact legs
- large curled tail used for balance
- tongue is procedural and dynamically extends from the mouth

Moves:
- `ATTACK`: short close-range claw/body strike
- `ATTACK` chain: two-hit close-range sequence
- `SPECIAL`: straight tongue strike, long horizontal connected hitbox
- `DOWN + SPECIAL`: low tongue strike
- air attack: compact descending body/claw attack

Tongue is not a projectile. Its collision volume extends/retracts as part of the move timeline.

## Supernariz
Role: rushdown / mid-range combo fighter.

Visual reconstruction:
- stylized blue superhero suit
- red gloves, boots, belt and cape accents
- exaggerated giant nose as primary weapon
- sausage/longaniza theme at belt

Moves:
- `ATTACK`: three-hit nose combo with progressively stronger reach/knockback
- `SPECIAL`: chorizo projectile with cooldown
- `DOWN + SPECIAL`: Tramontana gust, short-medium range wind/ice effect that causes light damage, pushback, and extra hitstun/chill window
- air attack: downward nose/body strike

## CPU
CPU must be state/distance aware, not random button spam. It should:
- approach when outside preferred range
- retreat/reposition when cornered
- block sometimes when the player is in a threatening active/startup state
- use normal attacks at close range
- use specials when distance/context fits
- avoid issuing impossible actions during stun/KO

## Stage and camera
One original stylized arena. Locked side-view camera. Stage art is generated with programmatic layered shapes/gradients/parallax so no external character references are required. Camera shake is restrained and used only for strong hits/KO.

## HUD / UI
- top health bars, names, round wins, timer
- clean center playfield
- mobile controls at lower edges with safe-area support
- Character Select and result screens are DOM overlays
- orientation prompt when portrait

## Performance
- target 60 FPS on modern iPhone/Android browser
- simulation fixed at 60 Hz independent from display refresh
- two fighter rigs only; no texture-heavy character sheets
- avoid per-frame object allocation in hot simulation loops where practical

## V0.1 acceptance
A build is accepted only when:
- both fighters can be selected as player or CPU
- a full duel can be completed and restarted
- CPU can fight coherently
- touch controls are usable in landscape
- each fighter has distinct attacks and special mechanics
- blocking, damage, hitstun, knockback, KO, rounds, timer work
- character runtime visuals are procedural/native and do not use reference sheets as sprite textures
- simulation tests pass and production build succeeds
