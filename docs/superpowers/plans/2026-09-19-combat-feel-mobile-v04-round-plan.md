# R002 / V0.4 Combat Feel & Mobile Controls — Multi-Agent Plan

Round: R002-V04-COMBAT-FEEL-MOBILE
Product spec: `docs/superpowers/specs/2026-09-19-combat-feel-mobile-v04-design.md`
Staged activation: enabled

## Purpose

Ship the user's playtest corrections with less coordination overhead than R001 while preserving independent QA and release discipline.

## Planned team

- Neureon — coordination and stage gates.
- Ricardo — simulation, CPU/balance and stale-state diagnosis/fix.
- Mario — Coletazo/Ultimate procedural animation and render cleanup.
- Brancaforte — dedicated mobile Ultimate button/input/HUD/help.
- Germinator — adversarial regression, balance and mobile/control QA.
- Gonza — accepted-SHA integration, standalone build and Pages release.

## Activation stages

### Stage 1 — CORE
Active: Neureon + Ricardo.

Ricardo must:
- reproduce/triage the trapped-state bug;
- publish any shared state/event contract changes required by downstream work;
- tune Supernariz CPU;
- improve Camaleoni melee/Coletazo gameplay values;
- provide exact checkpoint + tests + tuning delta.

Mario and Brancaforte are not activated yet.

### Stage 2 — PRESENTATION_AND_INPUT
Active after Ricardo's stable consumer checkpoint:
- Mario
- Brancaforte
- Ricardo remains available for requested contract fixes.

Mario and Brancaforte work in parallel against one frozen Ricardo SHA.

### Stage 3 — VALIDATION
Active after both downstream handoffs:
- Germinator
- implementation owners remain available only for findings.

Germinator returns explicit PASS or BLOCKED against exact SHAs.

### Stage 4 — RELEASE
Active only after QA PASS:
- Gonza
- other owners remain available for integration regressions.

Gonza integrates explicit accepted SHAs/deltas only, verifies full suite/build/smoke, updates standalone and publishes Pages under Neureon's RELEASE token.

## Branches

- `round/r002-ricardo`
- `round/r002-mario`
- `round/r002-brancaforte`
- `round/r002-germinator`
- `round/r002-integration`

Live `coordination/` truth remains on `main`.
Do not whole-merge long-lived feature branches.
Gonza integrates accepted SHAs/deltas only.

## Contracts

Ricardo owns:
- simulation legality/state;
- shared gameplay types/events;
- CPU behavior;
- move tuning.

Mario owns:
- procedural renderer and effects only.

Brancaforte owns:
- raw touch/keyboard intent production;
- DOM/HUD/help/layout.

If Mario or Brancaforte needs a new simulation field/event, request it in the forum; do not duplicate combat truth.

## Success gates

CORE → PRESENTATION_AND_INPUT:
- trapped bug root cause identified;
- gameplay/state fix committed if required;
- CPU and Camaleoni melee changes have targeted tests;
- exact Ricardo consumer SHA frozen;
- downstream event/snapshot contract documented.

PRESENTATION_AND_INPUT → VALIDATION:
- Mario and Brancaforte each provide clean handoff SHAs and verification evidence;
- no stale coordination content is part of product deltas.

VALIDATION → RELEASE:
- Germinator explicit PASS;
- no unresolved blocker.

RELEASE → ROUND_COMPLETE:
- integrated suite/build green;
- desktop + mobile-landscape smoke green;
- public Pages artifact matches accepted source;
- archive/reset complete.

## Workflow improvement from R001

R002 does not require waking every specialist at CHECK_IN.
Only the current activation stage must check in. This avoids spending user pulses on agents whose dependencies do not yet exist while keeping the repo as the persistent source of truth.
