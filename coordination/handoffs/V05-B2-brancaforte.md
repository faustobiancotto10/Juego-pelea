# Handoff — V05-B2

Round: R003-V05-COMBAT-LOOP
From: Brancaforte
To: Neureon, Germinator, Mario, Gonza
Task: V05-B2
Frozen core: `8e74d1e7ac34ac6524d725553b01b32bb3ff33bc`
Accepted B1: `4eddddad0a69df0b6562e28f3e55fd66bafd4fc5`
Synthetic exact core+B1 baseline: `b2c1946c888657d870abafd1c62e86b29eaa79a1`
CI-green iterative head: `9cb1f172a5720a9de2d353050c1521dc76d4343c`
Clean B2 commit: `d76e4ded2cfb9d60893d179f5f85e388a8bd0c52`
Clean branch: `handoff/r003-v05-b2`

## Clean delta

`d76e4ded...` is exactly one commit ahead of the synthetic core+B1 baseline and changes only:

- `README.md`
- `src/game/input/GameInput.ts`
- `src/game/ui/AppController.ts`
- `tests/g402-v04.test.mjs`
- `tests/input-v05-commands.test.mjs`
- `tests/input.test.mjs`
- `tests/ui-v04.test.mjs`
- `tests/ui-v05.test.mjs`

No simulation, shared combat types, gameplay data, CPU, renderer or tuning files are changed by B2. `src/styles.css` was reserved/reviewed but required no B2 modification because the existing accepted B1/V0.4 geometry passed the final multi-size contract.

## Final command-input contract

`GameInput` now produces explicit `InputFrame.commands` on every sample.

DOM edge queue:
- bounded to 8 entries;
- newest entries are retained on overflow;
- at most 4 are drained per simulation sample;
- press/release entirely between two samples survives exactly once;
- commands carry a cloned direction captured at physical press time;
- touch down/down-forward receives a four-sample down grace;
- an explicit up direction cancels that grace.

Action edges:
- touch/keyboard ATTACK queues `attack`;
- touch/keyboard SPECIAL queues `special`, except a **new** SPECIAL edge observed while the most recent authoritative input context is defensive queues `pushGuard`;
- stale held SPECIAL never mutates into Push Guard later;
- touch Ultimate queues `ultimate` without checking meter in the input layer;
- desktop `L` is the dedicated Ultimate key;
- the legacy J+K chord and its READY-dependent delay are removed;
- J and K remain immediate independent attack/special edges;
- jump edges are explicit commands while held movement/direction stays physical state.

Same-sample conflicts remain simulation-owned. B2 may deliver both Push Guard and Ultimate edges in one sample; the frozen core's authoritative command priority selects Ultimate. Input does not spend SUPER/GUARD or decide move legality.

## Lifecycle / suspension handshake

B1 `GameInput.reset()` is retained and now also clears:
- queued commands;
- input classification context;
- down-grace state.

`GameInputOptions.onReset` lets AppController pair every physical reset with `CombatSimulation.resetInputState()`.

The fight mounts input as:
`new GameInput(..., { onReset: () => simulation.resetInputState() })`.

Therefore blur/pagehide/hidden/orientation/help suspension/destroy clear both DOM-side edges and simulation-side pending/previous input without stepping combat.

## UI / help contract

- fighter-selection order comes from `DEFAULT_COMBAT_REGISTRY.playableIds`, not a duplicate hardcoded UI list;
- Camaleoni card no longer advertises removed low-tongue behavior;
- controls/help explicitly describes:
  - ATTACK / short normal route;
  - Abajo + ATTACK = grounded low;
  - SPECIAL sin dirección = ranged Lengua / Chorizo;
  - Abajo + SPECIAL = close Coletazo / Tramontana;
  - SPECIAL while blocking = Push Guard request;
  - touch ULTIMATE;
  - keyboard L = Ultimate;
- J+K is removed from player-facing copy;
- README is updated to the same V0.5 grammar.

## TDD evidence

### RED

Tests-only head:
`23e3bd8e19eaeb96be6f15d97606c44971bfed35`

Actions run:
`35466675260` (#586) — expected FAILURE.

Observed: **13 intended failures**, all inside the new/legacy B2 contract:
- quick edge delivery;
- hitstop edge delivery;
- direction-at-press/down grace;
- Push Guard ingestion classification;
- Ultimate/Push Guard same-sample path;
- desktop L / removal of chord;
- bounded 8→4 queue;
- legacy touch-Ultimate command migration;
- registry-driven UI;
- V0.5 help/copy;
- reset handshake.

Core/B1 coverage outside those expected contract changes remained green.

### GREEN

Final iterative head:
`9cb1f172a5720a9de2d353050c1521dc76d4343c`

Repository verification run:
`35466934812` (#598) — **SUCCESS**.

- coordination contract: PASS
- full test suite: **179/179 PASS, 0 failures**
- build: PASS
- TypeScript compilation passes through both test/build scripts.

Explicit B2 full-path passing coverage includes:
- DOM press/release → GameInput command → CombatSimulation move start;
- edge pressed during hitstop survives once and does not ghost-repeat;
- captured direction + four-sample mobile down grace;
- stale-SPECIAL / Push Guard classification;
- same-sample Ultimate priority through the real simulation;
- J/K independent + L Ultimate;
- queue overflow/drain bounds;
- reset callback clearing simulation pending input without advancing combat;
- historical G402 two-pointer Ultimate path migrated to authoritative commands;
- registry-driven fighter selection;
- final help/copy and reset-handshake source contract.

## Clean-equivalence proof

- CI-green iterative tree: `20b9e01b99ab6675e2ebff0095d73f4ab60b8ba5`
- clean B2 tree: `20b9e01b99ab6675e2ebff0095d73f4ab60b8ba5`

Thus the clean handoff SHA is byte-for-byte tree-equivalent to the candidate that passed run #598.

## Mobile / browser evidence

Automated structural checks pass for:
- 667×375 landscape;
- 852×393 landscape with deep 59 px safe areas;
- 932×430 landscape with safe areas;
- portrait orientation fallback;
- existing touch cluster and safe-area anchoring;
- controls panel remains an on-demand overlay rather than permanent playfield chrome.

Limitation:
this chat runtime still cannot perform the required physical Safari/tactile playtest. B2 therefore does **not** claim physical-device reachability, gesture feel or final integrated playfield obstruction. Those remain mandatory Stage 5 G2/human-device checks, together with the existing B1 physical-Safari carry-forward.

## Known integrated risks for G2

- validate four-sample touch down grace subjectively on real devices;
- validate left-thumb D-pad + right-thumb actions/Ultimate without accidental pointer loss;
- validate L keyboard Ultimate alongside normal J/K usage;
- verify help pause/resume produces no post-overlay ghost command in the integrated Mario+B2 build;
- verify responsive control footprint against M1 effects in live play;
- retain G1's non-blocking Camaleoni-favored sampled matchup observation for human balance review.

## Requested next action

- @Neureon: accept B2 exact clean SHA after reviewing this contract; Stage 5 remains closed until M1 is also accepted.
- @Mario: integrate against the same frozen core contract only; no UI/render overlap is introduced by B2.
- @Germinator: when Stage 5 opens, compose accepted core + B1 + B2 + M1 and independently rerun input/lifecycle/full-combat regressions plus physical/mobile human gate.
- @Gonza: do not integrate/release yet; use accepted clean deltas only after G2 release authorization.

Brancaforte remains available for Stage 5 findings until `ROUND_COMPLETE`.
