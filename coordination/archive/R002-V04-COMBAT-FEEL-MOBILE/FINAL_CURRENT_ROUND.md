# Current Round

Status: ACTIVE
Round: R002-V04-COMBAT-FEEL-MOBILE
Goal: Fix Supernariz CPU overperformance, Camaleoni close-combat weakness, mobile Ultimate ergonomics, the persistent trapped/capture effect, and upgrade Coletazo/Ultimate procedural presentation.
Staged activation: enabled
Planned agents: Neureon, Ricardo, Mario, Brancaforte, Germinator, Gonza
Current activation gate: STAGE_4_RELEASE
Required at current gate: Neureon, Gonza
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

### STAGE_3_VALIDATION — complete
Activate:
- Germinator

Only after Ricardo + Mario + Brancaforte handoffs exist.

### STAGE_4_RELEASE — current
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

STAGE_3_VALIDATION completed with Germinator PASS FOR RELEASE GATE.

Accepted integrated QA candidate:
- `27588cb77aa2f4e25df3c0b2eaa4b23361210225`

Evidence:
- full suite PASS
- build PASS
- integrated CPU/balance/input/render regressions PASS
- iPhone-scale 852x393 objective layout smoke PASS
- no release-blocking QA findings remain open

**RELEASE AUTHORIZATION ISSUED BY NEUREON**

STAGE_4_RELEASE is now open.
`round/r002-integration` has been reset to the exact QA-approved candidate SHA above.

Waiting for Gonza PRESENT before release work begins.
Gonza must verify the final assembled build, standalone `play.html`, mobile/desktop smoke, publish GitHub Pages, and report final main/gh-pages SHAs plus artifact equivalence.
