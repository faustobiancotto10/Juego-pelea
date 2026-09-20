# Handoff — V06-R0

Round: R004-V06-CONTENT-EXPANSION  
Task: V06-R0 — Character composition / contracts / validation  
From: Ricardo  
To: Ricardo V06-R1; downstream consumers after the CURRENT_ROUND dependency chain  
Branch: `round/r004-ricardo`  
Exact product SHA: `3cc43b031f62a6699a73d92a294c36504cda17e3`  
Base: `2d8c41dc994c8cddaa4c9fe2b3ee957698e94f13`  
Status: GREEN

## Files changed

Product:
- `src/game/types.ts`
- `src/game/data/characterContent.ts`
- `src/game/data/characters/camaleoni.ts`
- `src/game/data/characters/supernariz.ts`
- `src/game/data/characters/juanchi.ts`
- `src/game/data/combatRegistry.ts`
- `src/game/data/fighters.ts`
- `src/game/data/fighterKits.ts`
- `src/game/data/projectiles.ts`
- `src/game/data/ultimates.ts`
- `src/game/data/presentationRegistry.ts`
- `src/game/simulation/moves.ts`
- `src/game/ui/AppController.ts`

Evidence:
- `tests/character-content-v06.test.mjs`
- `tests/fixtures/v06-character-package.mjs`

## Exported contract

- `FighterId` and `RegisteredFighterId` are compatible string aliases. Trust comes from registry membership, not a two-name type union.
- `CombatCharacterContent` owns fighter, kit, moves, projectiles, Ultimates and presentation metadata.
- `composeCharacterContent(packages, playableIds)` preserves package order, rejects duplicate keys/references and returns deeply cloned/frozen owned data.
- `freezeCombatRegistrySource(source)` gives legacy/injected registry callers the same ownership and validation boundary.
- `createCombatRegistry(source)` retains the five lookup methods plus `playableIds`; returned lookups reference only registry-owned frozen clones.
- `createFighterPresentationRegistry(packages)` exposes ordered `ids` and `getPresentation(id)`.
- Character Package projectiles require explicit `visualKey`; the legacy `ProjectileDefinition.visualKey` remains optional only so existing injected V0.5 registry fixtures are not broken.
- `DEFAULT_CHARACTER_COMPOSITION` and `DEFAULT_FIGHTER_PRESENTATION_REGISTRY` currently release exactly Camaleoni + Supernariz.
- Juanchi R0 freezes `JUANCHI_CHARACTER_ID` and presentation keys only. His complete combat package is intentionally deferred to V06-R2 with the new primitives.

## Validation

R0 validation rejects:
- duplicate fighter/projectile/Ultimate/playable IDs;
- missing kit/move/chain/projectile/Ultimate references;
- cyclic cancel graphs;
- nonfinite or invalid fighter/move/projectile/Ultimate values;
- active/spawn/cancel/sequence beats outside authored timelines;
- invalid CPU probabilities/ranges;
- missing package presentation/visual routing keys;
- function-bearing/non-plain content;
- Ultimates without a positive-damage final beat.

Legacy missing-move error text remains `Unknown move <fighter>: <move>`.

## Behavior preservation

No V0.5 combat value was tuned in R0. Existing Camaleoni/Supernariz numbers were moved unchanged into typed packages. The selector received only the minimum consumer adapter required by C1: registry lookup, presentation metadata lookup and runtime playable-ID validation. No UX/layout/control redesign was performed.

Reset/rematch/simulation state semantics are unchanged by R0. Registries own immutable content definitions; per-match mutable state remains in CombatSimulation as before.

## Verification

Validation PR: #21 (draft, validation-only; never merge directly).  
Repository verification run: `35533386460` (#769), job `106137982282`.

Results:
- coordination contract: 6/6 PASS;
- full suite: 211/211 PASS;
- build: PASS;
- TypeScript compilation passes through both `npm test` and `npm run build`.

The first R0 candidate exposed one legacy error-message mismatch only; it was repaired without gameplay/schema changes before this final SHA.

## Known risks / deferred work

- Juanchi gameplay is not released in R0 by design; V06-R2 owns it.
- Universal visual-handler existence/rig coverage is a presentation-stage integration gate; R0 only freezes the data routing keys.
- `ProjectileDefinition.visualKey` remains optional for legacy injected sources; all Character Packages require it.
- The stale R0 task prose saying M1/B1 unlock directly is superseded by CURRENT_ROUND: R1→R2→R3→G1 must complete before presentation lanes open.

## Next action

V06-R1 is now eligible under AUTO_CHAIN. Ricardo proceeds directly to Universal Ultimate arbitration / Clash from exact SHA `3cc43b031f62a6699a73d92a294c36504cda17e3`.
