# Handoff — V05-R3

Round: R003-V05-COMBAT-LOOP
From: Ricardo
To: Neureon, Germinator, Brancaforte, Mario
Task: V05-R3
Commit SHA: `01c34736e68ed7fcd7ee508f2c3791de50589e73`
Branch: `round/r003-ricardo`
CI: Repository verification run #478 — 139/139 tests PASS, build PASS.

## Scope completed

- six advancing-combat-frame pending command buffer;
- hitstop does not age pending commands;
- action edges can survive a complete hitstop window;
- one pending command, latest-edge replacement and deterministic action priority;
- direction captured at command time with four-sample down grace;
- resetInputState clears pending command state without stepping simulation;
- one grounded low normal per fighter;
- true Camaleoni claw1 -> claw2 route;
- true Supernariz nose1 -> nose2 -> nose3 route;
- final Special grammar:
  - SPECIAL / forward+SPECIAL / up+SPECIAL => ranged;
  - down / down-forward + SPECIAL => close Special;
  - Camaleoni low tongue removed from selectable/default kit;
- ranged Special commitment increased;
- Chorizo retains 120 cooldown and one-active-projectile owner cap;
- clean-offense SUPER economy:
  - normal dealt: 0.15 x clean damage;
  - special/projectile dealt: 0.10 x clean damage;
  - damage received: 0.055 x clean damage;
  - chip: 0 gain;
  - Ultimate: 0 gain;
- Push Guard adds six advancing frames of defender recovery and preserves wall separation.

## Exact tuning table

### Camaleoni
- claw1: total 19; active 5-7; damage 46; hitstun 16; cancel 9-12; next claw2.
- clawLow: total 25; active 7-9; reach geometry offset 22 / width 65; damage 36; chip 2; hitstun 13; blockstun 8; knockback 3.5; low; guard damage 10.
- claw2: total 22; active 5-8; damage 60.
- Lengua: total 38; active 12-14; damage 80; chip 4; guard damage 14.
- Coletazo: preserved R2/V0.4 combat values for this stage.

### Supernariz
- nose1: total 18; active 4-6; damage 42; hitstun 14; cancel 8-11; next nose2.
- noseLow: same compact low frame profile as clawLow.
- nose2: total 19; active 4-7; damage 49; hitstun 16; cancel 8-11; next nose3.
- nose3: total 26; active 6-9; damage 74.
- Chorizo throw: spawn 12; total 36; projectile cooldown remains 120.
- Tramontana: total 30; active 8-11; damage 38; hitstun 22; blockstun 10; knockback 4; guard damage 16; chill 60.

## Measured acceptance

- claw1 -> claw2 lands both hits at center distances 62 and 85, both player slots.
- nose1 -> nose2 -> nose3 lands all three hits at center distances 62 and 85, both player slots.
- standing away loses to grounded low; down-away blocks grounded low.
- down+ATTACK is excluded from chain cancel consumption.
- low-tongue legacy mapping tests were deliberately migrated to grounded lows / Coletazo grammar.
- command-buffer RED checkpoint previously had 9 failures; final command tests are green.
- melee/Special RED checkpoint had expected failures for missing lows, incomplete nose route, old Special commitment, old meter, and absent Push Guard recovery; final suite is green.

## Shared state / consumer contract

R3 publishes/uses:
- `MatchSnapshot.combatTick`
- `InputFrame.commands?: readonly CommandIntent[]`
- `FighterSnapshot.moveContact`
- `landingRecoveryFrames`
- `pushGuardRecoveryFrames`
- `ultimatePhaseFrame`
- `ultimateConnected`
- hit events include `source` and `finisher`.

Renderer/UI must consume these as readonly simulation truth. No consumer should infer hit source from a cleared move.

## Risks / follow-up

- R4 owns aerial carry, attack-facing lock, landing recovery behavior and successful Ultimate release/actionability.
- R5 owns delayed seeded CPU behavior.
- UI input delivery of `commands` remains B2; R3 simulation supports both explicit commands and legacy action-edge fallback.

Ricardo proceeds to R4 under Neureon's sequential Stage 2 authorization.
