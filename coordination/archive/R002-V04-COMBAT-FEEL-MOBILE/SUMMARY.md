# R002 — V0.4 Combat Feel & Mobile Controls

Status: ROUND_COMPLETE
Date: 2026-09-19

## Goal

Respond to V0.3 playtest feedback:
- reduce Supernariz CPU overperformance;
- make Camaleoni close combat viable;
- replace the awkward mobile Ultimate chord with a dedicated button;
- eliminate persistent trapped/capture state/effect;
- improve Coletazo animation;
- make both Ultimates more elaborate.

## Workflow

Staged activation:
1. Ricardo — core gameplay/state/CPU/balance.
2. Mario + Brancaforte — presentation and mobile input in parallel.
3. Germinator — independent integrated QA.
4. Gonza — release and publication.

## Accepted checkpoints

- Ricardo R-201: `683d81f50afa9626785408ac7f868414ffe4061f`
- Mario M-202: `b163e25ab50500b5f308e38c0574987f0c284a07`
- Brancaforte B-302: `d5bfae4e108f882715c82ccd9282f1cc9c5f396a`
- Germinator QA candidate: `27588cb77aa2f4e25df3c0b2eaa4b23361210225`
- Gonza clean integration head: `14a6f3dd1de03c470e95d148f2b6e960444a624c`

## Shipped behavior

- Supernariz CPU leaves deterministic post-commit punish windows and no longer converts every optimal opportunity.
- Camaleoni gains practical close-range contest/whiff-punish value while Supernariz retains faster pressure tempo.
- Coletazo has lower gameplay commitment plus an authored procedural wind-up/strike/follow-through/recovery presentation.
- Mobile has a dedicated ULTIMATE button driven by authoritative SUPER READY state; held movement + second-pointer Ultimate is supported.
- Capture truth is authoritative through `capturedBy`; transient Ultimate/capture state is cleared at terminal transitions.
- Both Ultimates have richer procedural presentation without moving combat truth into the renderer.

## QA

Germinator verdict: PASS FOR RELEASE GATE.

Integrated checks passed for CPU pressure, Camaleoni tradeoffs, trapped/capture cleanup, dedicated Ultimate multitouch, action exclusivity, procedural rendering, deterministic regression and iPhone-scale 852x393 layout geometry.

## Release

- main product release SHA: `db9b52e097f3f8ecf9ac45e7a73354477e8592b1`
- gh-pages SHA: `1d2883427b4c171624cbb19f667cdd50539b1d69`
- repository verification: `35425979115` — SUCCESS
- release verification: `35425938883` — SUCCESS
- Pages deployment: `35426009980` — SUCCESS
- full suite: 97/97 PASS
- public/source standalone blob: `d651bc064b25fc55a12f2b87be2c83a8ab0573d0`
- public URL: https://faustobiancotto10.github.io/Juego-pelea/

## Closure

No release blocker remained open.
Neureon issued `ROUND_COMPLETE`.
Full forum transcripts, task snapshots and handoffs are preserved in this archive.
