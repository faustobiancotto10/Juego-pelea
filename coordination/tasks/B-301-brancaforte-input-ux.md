# Task B-301 — Input, HUD and mobile UX

Round: R001-V03-COMBAT-EXPANSION
Owner: Brancaforte
Status: READY

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

- [ ] permanent layout remains D-pad + ATTACK + SPECIAL + JUMP
- [ ] ATTACK + SPECIAL reliably emits one Ultimate intent when SUPER is ready
- [ ] chord/buffer handling does not also leak accidental normal/special actions
- [ ] contextual SPECIAL resolves cleanly across long/close/air/directional contexts through agreed intents
- [ ] blocking + SPECIAL can request Push Guard only through the agreed combat contract
- [ ] HUD clearly shows HP, GUARD and SUPER for both fighters
- [ ] SUPER READY state is obvious without covering the fight
- [ ] useful restrained Chorizo cooldown feedback is provided
- [ ] controls/help explains guard, dash/backdash, Push Guard and Ultimate chord
- [ ] first-ready SUPER hint is transient, not a mandatory tutorial
- [ ] user-facing fighter text uses Camaleoni

## Required tests / evidence

- [ ] keyboard and touch/chord/input-priority tests
- [ ] HUD snapshot rendering tests
- [ ] mobile landscape/safe-area smoke
- [ ] controls/help pause behavior regression
- [ ] proof UI/input does not decide combat outcomes
- [ ] commit SHA + input/UI contract handoff

## Related forum threads

- coordination/forum/active/r001-combat-contract.md
- coordination/forum/active/r001-integration-release.md

## Checkpoints

- first checkpoint: answer/review Ricardo's proposed action/snapshot contract
