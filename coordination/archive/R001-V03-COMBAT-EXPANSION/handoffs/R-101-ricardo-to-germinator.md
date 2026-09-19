# Handoff — R-101

Round: R001-V03-COMBAT-EXPANSION
From: Ricardo
To: Germinator
Task: R-101
Commit SHA: 7138ec09e1773da7dbe28b173d3208197bc3c027

## Files changed

- src/game/types.ts
- src/game/data/fighters.ts
- src/game/simulation/CombatSimulation.ts
- src/game/simulation/CpuController.ts
- src/game/simulation/moves.ts
- tests/combat-v03.test.mjs

## Behavior / interface contract

- Simulation owns combat truth at fixed 60 Hz.
- InputFrame accepts V0.3 intents `ultimate` and `pushGuard`; absent values are treated as false for V0.2 producer compatibility.
- FighterSnapshot exposes SUPER meter/readiness, ultimate phase/target and Chorizo cooldown remaining/max.
- CombatEvent exposes SUPER ready, ultimate start/capture/whiff and Push Guard events.
- Stable V0.3 move IDs at this checkpoint: `coletazo`, `tongueStraight`, `tongueLow`, `chorizoThrow`, `tramontana`, `ultimateCamaleoni`, `ultimateSupernariz`.
- Ultimate startup is interruptible without meter spend. Meter is consumed on startup -> capture commitment.
- Valid capture is unblockable. Captured defender cannot escape the sequence through input. KO/round resolution waits until sequence completion.
- Push Guard costs 34 GUARD, creates authored separation and is invalid outside the required defensive context.
- SUPER gain is based on actual HP damage: 0.12 dealt / 0.055 received, cap 100, no passive charging.
- Camaleoni and Supernariz ultimates both deal 190 total damage in the current tuning.

## Verification evidence

- GitHub Actions Repository verification run #116 on this exact SHA: success.
- Coordination contract: passed.
- Full test suite: passed.
- Build: passed.
- Targeted V0.3 regression coverage is in `tests/combat-v03.test.mjs`.
- Implemented tuning table is posted in `coordination/forum/active/r001-balance-qa.md` message 006.
- Shared contract/checkpoint is posted in `coordination/forum/active/r001-combat-contract.md` message 029.

## Known risks

- The R-101 feature branch received interleaved commits from multiple Ricardo activations during recovery. Validate this exact SHA, not an assumed later branch head.
- Balance values remain subject to G-401 adversarial review; CI-green does not by itself prove matchup balance.

## Unresolved questions

- Whether G-401 finds strict-dominance, corner-pressure, ultimate counterplay or CPU behavior blockers requiring a follow-up R-101 tuning commit.

## Requested next action

Run the G-401 adversarial/balance harness against exactly `7138ec09e1773da7dbe28b173d3208197bc3c027`, post explicit findings/verdict, and return any owned R-101 fixes to Ricardo. Neureon alone decides when PAUSED returns to ACTIVE.

## Participation

This handoff does not end the sender's participation. The sender remains part of the round, answers follow-up questions and responds to fixes until Neureon posts `ROUND_COMPLETE`.
