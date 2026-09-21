# Current Milestone

**Official published version:** V0.6  
**Current development target:** V0.7  
**Live round:** `R005-V07-GAMEPLAY-PRESENTATION-EXPANSION` — ACTIVE / AUTO_CHAIN  
**Frozen R005 base:** `378a991d55bed03e6237a03fdf6dfe96653fae72`

Official V0.6 release evidence remains:
- product merge `60f30d4a100f3d853e2408e3eee7bbde4e2170fe`
- GitHub Pages publish `93d2fdd6f4b764a49fa70ad1ff6ac1f348fb85cc`
- public standalone blob `bda2d2a16a0cd640f654b3b9c7aef148b7213f38`
- public URL: https://faustobiancotto10.github.io/Juego-pelea/

## V0.7 goal

V0.7 directly answers the post-release human feedback:

1. Camaleoni Lengua must stop being a low-skill dominant spam loop while remaining his defining zoning tool.
2. CPU gains fair **Easy / Normal / Hard** difficulty, with Normal default and no raw-input/future-state cheating.
3. Juanchi locomotion, especially walk/backwalk, gets a visual repair without changing simulation movement truth.
4. Attack presentation receives a reusable procedural quality pass; Juanchi gets a genuine red rage aura.
5. **El Toro** becomes fighter four:
   - Topete;
   - Shawarmazo;
   - Super Eructo.
6. Every fighter-select card receives a recognizable **procedural in-game portrait/icon**, never a source/reference photo.

No new stage is planned for V0.7.

## Authoritative planning package

- `docs/superpowers/specs/2026-09-20-v07-post-v06-master-audit.md`
- `docs/superpowers/specs/2026-09-20-v07-lengua-balance-contract.md`
- `docs/superpowers/specs/2026-09-20-v07-cpu-difficulty-contract.md`
- `docs/superpowers/specs/2026-09-20-v07-animation-effects-quality-contract.md`
- `docs/superpowers/specs/2026-09-20-v07-el-toro-character-contract.md`
- `docs/superpowers/specs/2026-09-20-v07-content-design.md`
- `docs/superpowers/plans/2026-09-20-v07-implementation-plan.md`
- `docs/characters/el-toro/PACKAGE.md`

El Toro authoring references are persisted under:
- `docs/characters/el-toro/references/identity-master-reference.webp`
- `docs/characters/el-toro/references/action-sheet-reference.webp`

They are authoring-only and prohibited from runtime.

## Execution

Canonical sequence:

**Ricardo → Germinator → Mario + Brancaforte → Gonza**

Current first eligible task:
- `V07-R0` — Ricardo.

AUTO_CHAIN is active. Green handoffs unlock downstream tasks automatically; no per-step Neureon authorization is required.

If a frozen contract is contradicted by evidence, the affected agent stops its dependency chain, records the blocker and tells the user.


## Multi-instance Mario visual super-improvement

The first V0.7 preview failed user-facing visual acceptance, and the later single-Mario reference-fidelity candidate `032b1bb28c5dd4421e5772cc40ab007f42e4d462` is now the baseline for a stronger authorized multi-instance visual experiment.

Active parallel lanes:
- Mario-A — shared visual architecture / lead;
- Mario-B — El Toro + Juanchi reconstruction;
- Mario-C — Camaleoni + Supernariz reconstruction;
- Mario-D — motion / presentation / FX.

After all four lanes are green, Mario-A integrates them in V07-M3I. Germinator V07-G2 then audits the integrated candidate. Gonza remains blocked until G2 approval.

All visual squad lanes begin from `032b1bb28c5dd4421e5772cc40ab007f42e4d462`.

Game Development Studio visual-debugging / asset-production workflows are authorized as bounded authoring and evidence support. Runtime and gameplay contracts remain unchanged unless a separately reported blocker requires user/Neureon re-planning.


### Current squad checkpoint — 2026-09-21

- **Mario-A / V07-M3A:** GREEN / HANDOFF_READY at exact SHA `d6d1e074526cd1674af4e6103995eda19ab5a46b`. Shared identity-layer architecture, anatomy-derived anchors and inspectable visual gates are in place. Repository verification #1252 and Character Pipeline V2 #45 passed. All five deterministic visual captures remain byte-identical to the squad baseline, confirming no accidental raster regression from the architecture-only lane.
- **Mario-C / V07-M3C:** HANDOFF_READY at exact SHA `d0b28a34ae2221adccd04c483bbb0c5561b512f2`.
- **Mario-B / V07-M3B:** READY to revalidate its El Toro + Juanchi reconstruction after consuming Mario-A's test-only shared gate repair. The obsolete Juanchi tied-jacket assertion was removed in favor of the authoritative `La 56` / cargo package cues.
- **Mario-D / V07-M3D:** WORKING on locomotion, presentation and FX.
- **V07-M3I:** still blocked until B and D also produce green exact-SHA handoffs; Germinator and Gonza remain downstream.


### M3I visual acceptance review — 2026-09-21

Mario-A composed the exact green A/B/C/D lane deltas into integration candidate `4a485d9244b3e8ce86c4700d4a299dc5f3cb84f6`.

Technical verification:
- Repository verification #1291 / `35571839137`: PASS;
- Character Pipeline V2 #49 / `35571839119`: PASS;
- artifact ID `10626296792`, digest `sha256:5021f824cef2f2a3042174a55dc4358507bdd2bfbed03ad8b1eb647e948960df`;
- all 14 integrated file blobs matched their accepted lane source blobs exactly;
- runtime raster/reference guard: PASS.

Mario-A did **not** promote the candidate to Germinator. Direct artifact inspection plus baseline raster comparison showed the visual delta remained too incremental for the user-authorized “super-improvement” acceptance, especially in silhouette/head/body construction. V07-M3B and V07-M3C are reopened for bounded stronger structural/reference passes. V07-M3D remains green. V07-M3I, Germinator G2 and Gonza remain blocked until refreshed B+C exact-SHA handoffs are green.
