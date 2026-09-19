# R001 Archive — V0.3 Combat Expansion

Round: R001-V03-COMBAT-EXPANSION
Closure state: READY_FOR_ROUND_COMPLETE
Date: 2026-09-19

## Goal
Ship V0.3 Combat Expansion and validate the six-agent repository-coordination workflow under real cross-system dependencies.

## Required agents
- Neureon — Lead / Coordinator
- Ricardo — Gameplay Engineer
- Mario — Character / Rendering Engineer
- Brancaforte — UI / Input / UX Engineer
- Germinator — Auditor / QA
- Gonza — Integration / Release

## Tasks and final state
- N-001 — coordination: closure prepared; release evidence present.
- R-101 — gameplay/simulation: VERIFIED.
- M-201 — procedural presentation: VERIFIED.
- B-301 — input/HUD/mobile UX: VERIFIED.
- G-401 — adversarial QA: VERIFIED / PASS FOR INTEGRATION.
- Z-501 — integration/release: VERIFIED.

## Key forum conclusions
- Ricardo owns combat truth in deterministic fixed-step simulation; renderer and UI are consumers only.
- Camaleoni and Supernariz received comparable first-normal reach with explicit tradeoffs rather than free dominance.
- Camaleoni: Lengua long special, Coletazo close special. Supernariz: Chorizo long special, Tramontana close special.
- Corner pressure is addressed by blocked-wall pushback transfer plus Push Guard.
- SUPER has one-charge capacity, no passive gain and explicit dealt/received coefficients.
- Ultimates are finite-range unblockable captures after commitment, positionally avoidable before capture and guaranteed after capture.
- Mobile keeps three permanent action buttons; Ultimate is READY-only ATTACK+SPECIAL and Push Guard reuses SPECIAL in defensive context.
- Accepted-SHA integration was mandatory because feature branches carried stale coordination history.
- Email was explicitly prohibited as a coordination mechanism; GitHub-generated notification emails were outside agent control.

## Accepted implementation checkpoints
- Ricardo gameplay: `7138ec09e1773da7dbe28b173d3208197bc3c027`
- Mario renderer: `a9bc9b358c9956ace363798ef18de993fca0cd59`
- Brancaforte input/UI: `98290a60d8b0f77bd7b6762c6a80d6d660714e7f`
- Germinator QA harness: `2366333f8b6d9879cc55b27c4de1d799103a357d`
- Gonza pre-release integration candidate: `0a613a527366a0e8c95e3febf9ca190f4321ed9b`

## QA verdict
Germinator final verdict: PASS FOR INTEGRATION.

Evidence:
- Ricardo gameplay CI `35420365754`: SUCCESS
- Mario + Brancaforte compatibility CI `35421580953`: SUCCESS
- Germinator adversarial CI `35421658133`: SUCCESS
- full V0.2 + V0.3 regression/build remained green

Adversarial coverage included corner escape/separation, Push Guard invalid states, melee tradeoffs, Lengua/Chorizo threat-space, ultimate capture/evade/whiff/commitment, mirrored slot-order checks, SUPER economy, CPU behavior and deterministic replay.

## Release result
- main release SHA: `e16b2cb06e9206a276796e6ef95944ca1f746809`
- gh-pages publish SHA: `fa2192d8990a7ca6a072ed458092d53d3f874e93`
- Pages deployment run `35422409979`: SUCCESS
- final repository verification `35422159391`: SUCCESS
- desktop/mobile-landscape Playwright release smoke `35422114875`: SUCCESS
- public site: https://faustobiancotto10.github.io/Juego-pelea/
- `main/play.html`, `gh-pages/index.html` and `gh-pages/play.html` are the same blob `babc88d7b7b9f9f155238664156b28579bb44e64`

## Promoted durable decisions
Finalized V0.3 semantics/tuning were promoted to `docs/DECISIONS.md`, including SUPER coefficients, Push Guard values, Ultimate commitment/spend semantics, 55 ms READY-only Ultimate chord and first-normal reach tradeoff.

## Deferred / non-blocking items
- No known release blocker.
- Physical-device subjective touch/visual feel was not available inside specialist QA runtimes; Gonza's automated desktop and mobile-landscape release smoke passed.
- Future tuning may revise numerical balance, but this archive records the shipped V0.3 baseline.

## Workflow retrospective
What worked:
- repository forum as persistent inter-agent communication;
- exact SHAs as contracts between roles;
- locks prevented subsystem collisions;
- explicit PAUSED state prevented dependent work from hardening against an incoherent gameplay branch;
- independent Germinator validation caught the move-API mismatch and forced evidence before integration;
- accepted-SHA-only integration prevented stale coordination history from overwriting main;
- CI-only PRs provided reproducible verification without becoming release paths.

What caused friction:
- early STATUS/CURRENT_ROUND prose became stale while branches advanced;
- Ricardo's recovery initially produced partial commits and an API mismatch before a coherent checkpoint;
- long-lived branches carried stale coordination commits, making whole-branch merges unsafe;
- CI generated many GitHub notification emails for the user;
- separate chats require manual user pulses and cannot wake each other automatically.

Process changes to keep:
- frozen consumer checkpoints;
- exact wake order based on dependencies instead of activating everyone simultaneously;
- QA before integration;
- release token controlled by Neureon;
- no email coordination;
- archive full forum transcripts for post-round review.

## Closure token
Pending Neureon issuance of `ROUND_COMPLETE`.
