# V0.7 — Gameplay + Presentation Expansion Design

Status: FROZEN FOR R005

## Player-facing promise

V0.7 should feel harder to exploit, more configurable and substantially more alive in motion.

The release is defined by five visible improvements:
1. Lengua spam has real counterplay.
2. CPU has Easy / Normal / Hard.
3. Juanchi movement looks physically coherent.
4. attacks across the roster have stronger procedural trails/auras/impacts.
5. El Toro joins as fighter four.

A sixth UI requirement supports the roster:
- every fighter card contains a recognizable **in-game-style portrait/icon**, not a source photo.

## Released roster target

1. Camaleoni — zoning/control.
2. Supernariz — rushdown/pressure.
3. Juanchi — midrange return-path pressure.
4. El Toro — heavy bruiser/line breaker.

Runtime remains exactly two combatants per match.

## UI

Preserve V0.6 flow:
`TITLE → PLAYER SELECT → CPU SELECT → STAGE → VS → FIGHT → RESULT`.

CPU difficulty is selected on the CPU-select screen rather than adding another mandatory screen.

Fighter cards:
- portrait/icon area;
- name;
- role/archetype;
- concise move identity;
- selected/hover/focus state;
- four cards must fit mobile landscape cleanly;
- existing 5/10 synthetic density tests remain.

Presentation metadata adds `portraitKey`; the old one-letter `mark` may remain as fallback/accessory but is no longer the primary fighter image.

## Architecture additions

Bounded additions only:
- `CpuDifficulty` + difficulty policy;
- optional move `movement` data for committed movement Specials;
- `forwardBlast` Ultimate kind;
- `portraitKey` presentation metadata;
- render-only locomotion style table;
- render-only attack-presentation profile registry.

Do not add:
- ECS;
- generic scripts;
- animation graph;
- new gameplay action;
- stage hazards.

## Balance philosophy

The user feedback outranks a green unit-test suite on fun/challenge.

V0.7 acceptance therefore combines:
- deterministic automated invariants;
- measured scenario probes;
- physical-device/user-facing visual/play checks.

## Stage scope

Keep Tramontana and Cancha 56.

No El Toro-specific stage in V0.7. The character itself, CPU difficulties and presentation fixes are the priority.

## Portrait rule

Uploaded character art is never used as a card image.

Portraits are procedural game representations produced by Mario from each in-game rig/identity and consumed by Brancaforte.

## Release acceptance IDs

**V7-01 — Lengua:** measured spam/approach acceptance passes in both slots/center/walls.

**V7-02 — CPU:** Easy/Normal/Hard are deterministic, fair and perceptibly distinct.

**V7-03 — Juanchi locomotion:** technical invariants remain green and phone review no longer shows overstride/sliding/weird upper-body gait.

**V7-04 — Effects:** all four fighters have coherent attack presentation; Juanchi has a true red rage aura.

**V7-05 — El Toro core:** Topete, Shawarmazo, Super Eructo match the character contract.

**V7-06 — Roster:** all 16 ordered four-fighter matchups work for player/CPU/reset/rematch.

**V7-07 — Clash:** El Toro `forwardBlast` integrates with all four Ultimates symmetrically.

**V7-08 — Cards:** all four fighter cards show registered procedural game portraits/icons; no reference raster.

**V7-09 — Architecture:** malformed new movement/Ultimate/portrait definitions fail explicitly; synthetic roster fixtures still scale.

**V7-10 — Release:** full suite/typecheck/build/standalone/served parity + physical phone smoke.
