# R005 Contract — V0.7 Gameplay + Presentation Expansion

Status: ACTIVE / FROZEN  
Execution: AUTO_CHAIN

## Product objective

V0.7 directly addresses the published V0.6 human playtest:
- Lengua spam;
- CPU too easy;
- Juanchi walk;
- weak attack/effect presentation;
- missing genuine Juanchi red aura;
- El Toro fighter four;
- fighter cards need actual in-game character portraits/icons.

## Hard boundaries

- simulation remains combat truth;
- fixed 60 Hz;
- reference images authoring-only;
- no fifth gameplay action;
- no new stage in this release;
- no generic engine rewrite.

## Execution

**Ricardo → Germinator → Mario + Brancaforte → Gonza**

Green task handoffs automatically satisfy dependencies. Neureon is not a stage-by-stage approval service.

## User escalation

If evidence requires changing a frozen product meaning or expanding scope, BLOCK affected dependencies, record exact evidence in findings and tell the user.


## Ricardo R0 consumer contract

V07-R0 exposes `CpuDifficulty`, `portraitKey`, bounded forward move movement, and the `forwardBlast` schema. The R0 simulation compatibility patch only recognizes `forwardBlast` as a reserved schema kind so TypeScript remains exhaustive; Super Eructo collision/damage/Clash runtime is intentionally deferred to V07-R2. No V0.6 runtime behavior changes in R0.


## Ricardo R3 exact gameplay candidate

Ricardo completed V07-R0→R3 at exact SHA `94ee24898855f55787e8e077c64f259e2d7a4972`. Repository verification run #1030 is green: 299/299 tests plus build. This SHA is now frozen as Germinator V07-G1 audit input. Presentation work remains blocked until Germinator returns `APPROVE — PRESENTATION LANE UNLOCKED`.
