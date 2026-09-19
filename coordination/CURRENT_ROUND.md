# Current Round

Status: ACTIVE
Round: R002-V04-COMBAT-FEEL-MOBILE
Goal: Fix Supernariz CPU overperformance, Camaleoni close-combat weakness, mobile Ultimate ergonomics, the persistent trapped/capture effect, and upgrade Coletazo/Ultimate procedural presentation.
Staged activation: enabled
Planned agents: Neureon, Ricardo, Mario, Brancaforte, Germinator, Gonza
Current activation gate: STAGE_3_VALIDATION
Required at current gate: Neureon, Germinator
Start token: START_ROUND issued by Neureon
Completion token: not issued

## Product authority

Approved design:
- `docs/superpowers/specs/2026-09-19-combat-feel-mobile-v04-design.md`

Execution plan:
- `docs/superpowers/plans/2026-09-19-combat-feel-mobile-v04-round-plan.md`

Baseline shipped V0.3:
- main `e16b2cb06e9206a276796e6ef95944ca1f746809`
- public site: https://faustobiancotto10.github.io/Juego-pelea/

## User-approved directives

- Supernariz CPU is currently too strong and must be made less oppressive/optimal.
- Camaleoni melee currently feels unacceptable and must become practically viable.
- Mobile must use a dedicated Ultimate button; touch ATTACK+SPECIAL is no longer the required activation.
- The lingering trapped/captured effect is a bug and must be eliminated at its real source.
- Coletazo needs a better authored animation.
- Both Ultimates need more elaborate presentation.

## Activation stages

### STAGE_1_CORE — complete
Agents: Neureon + Ricardo.

Ricardo first owns:
- gameplay/state diagnosis of the trapped bug;
- Supernariz CPU correction;
- Camaleoni melee/Coletazo gameplay tuning;
- stable downstream state/event contract;
- targeted tests and frozen consumer SHA.

Only Neureon + Ricardo must be PRESENT before START_ROUND.

### STAGE_2_PRESENTATION_INPUT — complete
Agents to activate after Ricardo's frozen checkpoint:
- Mario
- Brancaforte

They work in parallel against the exact accepted Ricardo SHA.

### STAGE_3_VALIDATION — current
Activate:
- Germinator

Only after Ricardo + Mario + Brancaforte handoffs exist.

### STAGE_4_RELEASE
Activate:
- Gonza

Only after Germinator returns PASS and Neureon authorizes RELEASE.

## Branches

- Ricardo: `round/r002-ricardo`
- Mario: `round/r002-mario`
- Brancaforte: `round/r002-brancaforte`
- Germinator: `round/r002-germinator`
- Gonza: `round/r002-integration`

Authoritative live coordination remains on `main`. Product code stays on assigned branches. Gonza integrates accepted SHAs/deltas only.

## Current gate

STAGE_2_PRESENTATION_INPUT completed with formal handoffs:
- Ricardo gameplay base: `683d81f50afa9626785408ac7f868414ffe4061f`
- Mario presentation: `b163e25ab50500b5f308e38c0574987f0c284a07`
- Brancaforte input/UI: `d5bfae4e108f882715c82ccd9282f1cc9c5f396a`

STAGE_3_VALIDATION is now open.
The Germinator branch has been reset to the frozen Ricardo SHA. Germinator must compose an integrated QA candidate from the exact Mario and Brancaforte handoff commits/deltas, run adversarial automated + mobile-landscape validation, and return explicit PASS or BLOCKED.

Waiting for Germinator PRESENT before validation work begins.
Mario, Brancaforte and Ricardo remain available only for findings/contract fixes.
