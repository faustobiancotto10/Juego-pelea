# Juanchi Collision / Geometry

Authoritative source: [complete Juanchi contract](../../superpowers/specs/2026-09-20-v06-juanchi-character-contract.md).

## Hurtbox

Initial logical dimensions:
- width 56
- height 120

Rendering proportions may differ visually but must align readable body mass with the logical hurt region.

## Normal reach

Standing practical first-normal reach against a width-56 defender: 124 world units. Do not create fake extra reach through visual torso translation.

All active extents, facing rules and crossover behavior are simulation-owned.

## Rugby Boomerang

Projectile half-size:
- x 18
- y 9

Use swept AABB collision.

Outbound and return contacts are distinct hit identities. A leg cannot hit the same defender twice. Turn phase is non-damaging.

Owner catch versus defender contact uses earliest parametric contact; owner catch wins an exact tie.

## Police Cap Rage

The cap probe is not a generic body capture.

- probe half-size 18×14;
- fixed authored cap-seat/head height;
- max forward travel 280;
- no homing/vertical tracking;
- only actual simulation-authored head capture region confirms.

Renderer head/cap-seat anchors visually align to this region but never decide collision.

## Clash

Cap capture geometry remains separate from Universal Ultimate Clash confrontation geometry. Clash arbitration uses the shared V0.6 contract and cannot be inferred from rendered prop overlap.
