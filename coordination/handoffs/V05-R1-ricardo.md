# Handoff — V05-R1

Round: R003-V05-COMBAT-LOOP
From: Ricardo
To: Neureon, Germinator
Task: V05-R1
Commit SHA: 5f6d59eb2dae2e386c55593a9af346e184d5611f
Branch: round/r003-ricardo
Draft CI PR: #16 — validation vehicle only; do not merge directly.

## Files changed

- src/game/simulation/CombatSimulation.ts
- tests/combat-v05-commitment.test.mjs

## Behavior / contract

- Strike and projectile defense now share one simulation-owned guard-legality predicate.
- Guard is legal only while grounded, holding the correct away/height direction, with positive GUARD, and while not offensively committed, in a non-idle Ultimate, dashing, stunned, guard-broken or captured.
- Existing blockstun may continue valid height guard.
- Offensive commitment survives neither startup nor active nor recovery by illegally blocking.
- Invalid Ultimate and Push Guard intents are inert and do not suspend an already-running move timeline.
- No shared type/input/render/UI contract changed in R1.
- Same-tick active strikes still trade deterministically; the fix does not suppress the second contact merely because index 0 resolves first.

## RED evidence

RED SHA: `1840187422dd4ff4346f89e29ff506133e6b393c`
Repository verification run #392: expected failure, 8 R1 failures.

Reproduced before-fix behavior:
- Lengua startup + hold-away versus nose1: nose1 was incorrectly blocked. V0.4 path therefore applied 3 chip instead of 42 clean damage, and the committed Lengua survived.
- Mirrored Supernariz Chorizo startup versus Camaleoni claw1 also blocked illegally.
- Simultaneous active claw1/nose1 contacts were converted into blocks instead of a real trade.
- Recovery frames could block.
- A committed move could block Chorizo: old projectile path selected 5 blocked damage instead of 58 clean damage.
- Low GUARD while attacking could enter guard-break through an illegal block path.
- Invalid Ultimate and invalid Push Guard requests froze moveFrame at 0 instead of advancing to 1.

Controls that already passed on the RED checkpoint:
- neutral grounded away guard remains legal;
- blockstun continuation remains legal;
- deterministic replay remained identical.

## GREEN evidence

Final SHA: `5f6d59eb2dae2e386c55593a9af346e184d5611f`
Repository verification run #398:
- coordination contract PASS;
- full test suite PASS;
- build PASS.

After-fix measured expectations encoded and passing:
- nose1 through Lengua commitment: `blocked=false`, damage 42, interrupted move cleared;
- claw1 through mirrored Chorizo commitment: `blocked=false`, damage 46;
- simultaneous claw1/nose1: both contacts land unblocked, 46 / 42 damage respectively;
- committed fighter versus projectile: `blocked=false`, damage 58, move cleared;
- neutral/blockstun controls still block normally;
- invalid Ultimate/Push Guard no longer suspend move progression.

TypeScript status:
- repository CI does not run the literal `npm run typecheck` script as a separate step;
- both the passing `npm test` and `npm run build` scripts invoke `tsc`, so TypeScript compilation passed on the exact green SHA;
- an attempted external dedicated typecheck could not clone GitHub because that sandbox has no DNS/network access; no separate typecheck success is claimed.

## Known risks

- This closes the commitment exploit and will change strategy/balance outcomes downstream; R3 balance must not compensate by re-enabling guard during recovery.
- R1 deliberately does not change move data, command buffering, CPU, input UI or rendering.
- Germinator should independently mirror hold-away/no-away cases later rather than relying only on Ricardo's tests.

## Unresolved questions

None blocking R1. Any regression found by Neureon/Germinator should be returned to Ricardo under a reacquired R1 lock.

## Requested next action

Neureon: accept R1 when satisfied and wait for Brancaforte B1 before advancing the Stage 1 gate. Do not open R2 from this handoff alone.

Ricardo remains available until ROUND_COMPLETE.
