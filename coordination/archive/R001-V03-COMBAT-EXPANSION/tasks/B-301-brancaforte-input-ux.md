# Task B-301 — Input, HUD and mobile UX

Round: R001-V03-COMBAT-EXPANSION
Owner: Brancaforte
Status: VERIFIED

## Goal

Expose the V0.3 mechanics through the existing three-button mobile control surface and a clear mobile-landscape HUD/help system without moving combat rules into UI/input code.

## Dependencies

- START_ROUND
- reviewed action/snapshot contract with Ricardo before state-dependent implementation

## Allowed files / subsystems

- src/game/input/
- src/game/ui/
- src/styles.css
- input/UI tests
- branch: round/r001-brancaforte

## Prohibited scope

- simulation-side damage/capture/guard decisions
- renderer-world effects
- adding a fourth persistent action button
- release/publishing

## Required collaborators / reviewers

- @Ricardo for action priority and snapshot fields
- @Mario for screen-space/readability conflicts
- @Germinator for input ambiguity and mobile QA

## Acceptance criteria

- [x] permanent layout remains D-pad + ATTACK + SPECIAL + JUMP
- [x] ATTACK + SPECIAL reliably emits one Ultimate intent when SUPER is ready
- [x] chord/buffer handling does not also leak accidental normal/special actions
- [x] contextual SPECIAL resolves cleanly across long/close/air/directional contexts through agreed intents
- [x] blocking + SPECIAL can request Push Guard only through the agreed combat contract
- [x] HUD clearly shows HP, GUARD and SUPER for both fighters
- [x] SUPER READY state is obvious without covering the fight
- [x] useful restrained Chorizo cooldown feedback is provided
- [x] controls/help explains guard, dash/backdash, Push Guard and Ultimate chord
- [x] first-ready SUPER hint is transient, not a mandatory tutorial
- [x] user-facing fighter text uses Camaleoni

## Required tests / evidence

- [x] keyboard and touch/chord/input-priority tests
- [x] HUD snapshot rendering tests
- [x] mobile landscape/safe-area structural smoke (CI/static contract; subjective integrated readability remains Germinator-owned)
- [x] controls/help pause behavior regression
- [x] proof UI/input does not decide combat outcomes
- [x] commit SHA + input/UI contract handoff

## Related forum threads

- coordination/forum/active/r001-combat-contract.md
- coordination/forum/active/r001-integration-release.md

## Checkpoints

- first checkpoint: answer/review Ricardo's proposed action/snapshot contract


## Validation checkpoint

- frozen gameplay base: `7138ec09e1773da7dbe28b173d3208197bc3c027`
- clean B-301 handoff commit: `98290a60d8b0f77bd7b6762c6a80d6d660714e7f`
- CI-equivalent integrated head: `17179290f63fdc52bce3dfd49f917c758ed73ac2`
- GitHub Actions run: `35421021039` — SUCCESS
- full suite: 68/68 tests PASS
- build: PASS
- handoff: `coordination/handoffs/B-301.md`
- next owner action: Germinator final input/mobile/readability QA; Gonza integrates only after QA acceptance
