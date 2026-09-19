# Handoff — V05-R3

Round: R003-V05-COMBAT-LOOP
From: Ricardo
To: Neureon, Germinator, Brancaforte, Mario
Task: V05-R3
Commit SHA: 3c62adfddef0bacf3d002f9d559362a2bb5e425e
Branch: round/r003-ricardo
Draft CI PR: #16 — validation vehicle only; do not merge directly.
CI: run #470 — 139/139 tests PASS, coordination PASS, build PASS.

## Delivered

R3 closes the V0.5 command/melee/Special/economy contract while preserving deterministic fixed-step combat.

### Command contract
- InputFrame.commands? carries lossless action edges with direction-at-press.
- Simulation keeps one pending command for six advancing combat frames.
- Hitstop freezes combatTick and command expiry.
- Defined commands: [] suppresses legacy held-boolean edge synthesis.
- Latest edge replaces an older unconsumed edge.
- Same-sample priority: Ultimate > Push Guard > Special > Attack > Jump.
- resetInputState() clears buffered commands without advancing combat.
- Invalid resource requests are consumed without freezing an existing move timeline.
- Down-modifier grace is four input samples; explicit up cancels it.

### Final fighter grammar
- ATTACK: standing normal / connected normal chain.
- DOWN+ATTACK: dedicated grounded low (clawLow / noseLow), never a chain cancel.
- SPECIAL / forward+SPECIAL / back+SPECIAL / up+SPECIAL: ranged Special.
- DOWN+SPECIAL and down diagonals: Coletazo / Tramontana.
- tongueLow and temporary R2 legacy binding adapters are removed from the playable kit contract.
- Ultimate remains its dedicated intent.
- Defensive Push Guard remains a newly pressed defensive command only.

### Contact/state contract
Snapshots now expose simulation-owned fields needed by later consumers:
- combatTick
- moveContact: none | hit | block
- landingRecoveryFrames
- pushGuardRecoveryFrames
- ultimatePhaseFrame
- ultimateConnected

Hit events identify source (normal | special | projectile | ultimate) and finisher.
Consumers must read these fields rather than infer gameplay timing visually.

## Final tuning table

| Tool | Startup/active | Total | Damage | Hit/block | Other |
| --- | --- | ---: | ---: | --- | --- |
| claw1 | 5 / 5-7 | 19 | 46 | hitstun 16 / blockstun 8 | cancel 9-12 -> claw2 |
| claw2 | 5 / 5-8 | 22 | 60 | 15 / 9 | ender, KB 5 |
| clawLow | 7 / 7-9 | 25 | 36 | 13 / 8 | low, no cancel, edge reach 87 |
| nose1 | 4 / 4-6 | 18 | 42 | 14 / 7 | cancel 8-11 -> nose2 |
| nose2 | 4 / 4-7 | 19 | 49 | 16 / 8 | cancel 8-11 -> nose3 |
| nose3 | 6 / 6-9 | 26 | 74 | 16 / 11 | ender, KB 7.2 |
| noseLow | 7 / 7-9 | 25 | 36 | 13 / 8 | low, no cancel, edge reach 87 |
| Lengua | 12 / 12-14 | 38 | 80 | 18 / 12 | chip 4, GUARD 14, edge reach 374 |
| Coletazo | 6 / 6-10 | 31 | 52 | 14 / 9 | KB 13.5 reset role |
| Chorizo throw | spawn 12 | 36 | projectile 58 | projectile 14 / 10 | speed 9.2, cooldown 120, max one active/owner |
| Tramontana | 8 / 8-11 | 30 | 38 | 22 / 10 | KB 4, GUARD 16, chill 60 |

Hitstop freezes both sides, so relative actionability is driven by remaining move recovery versus defender stun:
- Lengua is deliberately committed after contact/whiff; first-active contact leaves substantially more caster recovery than defender stun.
- Tramontana clean hit approaches parity/pressure while blocked use remains materially punishable.
- Coletazo remains a high-knockback reset, not a guaranteed follow-up engine.
- Chorizo owner remains committed after spawn while the projectile creates range-dependent value.

## Measured gameplay evidence

### True routes
tests/combat-v05-melee.test.mjs proves clean-damage continuity, not only move IDs:
- Camaleoni claw1 -> claw2: 46 + 60 = 106 damage.
- Supernariz nose1 -> nose2 -> nose3: 42 + 49 + 74 = 165 damage.
- Both routes connect from starting center distances 62 and 85.
- Both routes are exercised in both player slots.
- Defender starts attempting guard after first contact; later hits still land clean.
- First three advancing frames of each published cancel window remain valid.
- Whiff still does not grant normal-chain cancel.
- DOWN+ATTACK cannot become a chain cancel.

### Lows / guard-height
- clawLow and noseLow share the approved 25-frame compact low profile.
- At the wall, standing away loses to the low while down-away blocks it.
- At spacing where retreat exits the low's reach, walking back remains valid counterplay; the low does not home.

### Practical reach
Using configured attack geometry plus target hurt width:
- claw1 practical center reach versus Supernariz: ~122.
- nose1 practical center reach versus Camaleoni: ~115.
- grounded lows: ~114-115 depending target.
- Lengua practical center reach versus Supernariz: ~402.
The exact authored attack-edge reaches remain 94 claw1, 88 nose1, 87 lows and 374 Lengua.

### Reward economy
Clean damage awards:
- normal dealt x0.15;
- special/projectile dealt x0.10;
- normal/special/projectile damage received x0.055;
- chip and Ultimate damage: zero to both sides.

Examples:
- Camaleoni 106 route -> 15.9 attacker SUPER / 5.83 defender SUPER.
- Supernariz 165 route -> 24.75 / 9.075.
- Lengua 80 -> 8 / 4.4.
- Chorizo 58 -> 5.8 / 3.19.
- low 36 -> 5.4 / 1.98.
Threshold emits super-ready once and caps at 100; SUPER still carries across rounds and resets per match.

### Push Guard
- cost 34 GUARD;
- nominal separation 122;
- wall overflow transfers to defender inward without side swap;
- six advancing frames of defender recovery;
- cannot become an auto-trigger from a held neutral Special.

## Regression / verification

Final R3 SHA: 3c62adfddef0bacf3d002f9d559362a2bb5e425e
CI run #470:
- coordination contract: PASS;
- full suite: 139/139 PASS;
- TypeScript/build: PASS.

Legacy V0.2/V0.3/V0.4 tests were updated only where V0.5 intentionally supersedes old grammar, damage or projectile startup timing. R1 commitment regressions and R2 injected-registry coverage remain green.

## Migration risks / next task

- R4 is allowed to refine air/landing and Ultimate-exit motion only; R3 command grammar, kit slots, meter rates and move economy are now the baseline.
- landingRecoveryFrames, ultimatePhaseFrame and ultimateConnected already exist for C2 but R4 owns their final motion semantics.
- Renderer/UI must not infer contact, finisher, recovery or Ultimate connection from animation.
- No generic combo tree, grab system, status engine or new resource was introduced.

Per Neureon's Stage 2 authorization, Ricardo proceeds directly to V05-R4 after coordination re-read.
