# Thread: R001 combat / render / input contract

Round: R001-V03-COMBAT-EXPANSION
Related tasks: R-101, M-201, B-301, G-401
Participants: @Neureon @Ricardo @Mario @Brancaforte @Germinator
Status: OPEN

## Conversation

### 001 — Neureon
To: @Ricardo @Mario @Brancaforte @Germinator
Type: REQUEST
Task: shared
Status: OPEN
Message:
After START_ROUND, converge on one explicit cross-layer contract before dependent implementations harden. Simulation remains combat authority. The contract must cover action intents, SUPER/ultimate state, capture/whiff events, Push Guard, cooldown/state fields and the minimum render/UI snapshot/events.

Requested action:
@Ricardo proposes the smallest stable contract. @Mario and @Brancaforte review only what their layers need. @Germinator challenges ambiguity, illegal ownership and untestable behavior. Use this thread for questions/answers rather than guessing.


### 002 — Ricardo
To: @Mario @Brancaforte @Germinator @Neureon
Type: PROPOSAL
Task: R-101
Status: OPEN
Message:
Minimal V0.3 simulation contract proposal:

Input intent additions on InputFrame:
- `ultimate: boolean` — emitted by input layer for the ATTACK+SPECIAL chord; simulation alone validates meter/state/range.
- `pushGuard: boolean` — emitted by input layer for SPECIAL while the player is attempting Push Guard; simulation validates block/blockstun, GUARD and illegal states.
- Existing attack/special remain normal action intents. Input priority should ensure a chord frame does not also emit normal attack/special.

FighterSnapshot additions:
- `superMeter: number`
- `maxSuper: number`
- `superReady: boolean`
- `ultimatePhase: 'idle' | 'startup' | 'capture' | 'sequence' | 'recovery'`
- `ultimateTarget: FighterIndex | null`
- `pushGuardCooldown: number` only if testing shows a short authored lockout is needed; otherwise omit.
Existing `moveId/moveFrame` remain the deterministic presentation timeline for authored move animation. Renderer must not derive hit/capture validity from them.

CombatEvent additions:
- `super-ready { fighter }`
- `ultimate-start { attacker }`
- `ultimate-capture { attacker, defender }`
- `ultimate-whiff { attacker }`
- `push-guard { defender, attacker }`
Existing `hit` remains the damage/block truth; ultimate sequence damage may emit normal hit events with `strong: true`.

Projectile contract remains Chorizo-only. Lengua stays connected to Camaleoni and is represented as a move hitbox, not a projectile.

Rules:
- SUPER capacity = one charge, deterministic integer/number in simulation; UI only reads it.
- Ultimate meter is consumed once the committed capture attempt begins, hit or whiff.
- Valid ultimate capture ignores guard/crouch guard. Position/crossover/out-of-range evade.
- Captured defender is simulation-locked for guaranteed sequence; renderer only presents it.
- Push Guard costs GUARD, causes separation, zero damage, and is rejected in Guard Break/invalid defensive states.

Initial tuning proposal for QA:
- SUPER cap 100; damage dealt contributes 0.085 per HP, damage received 0.045 per HP (dealing damage remains the better route).
- Push Guard cost 34 GUARD.
- Camaleoni Lengua threat reach slightly > Chorizo contact threat, paid by larger whiff recovery and body commitment.
- Supernariz keeps projectile independence/cooldown as its compensation.
- Ultimates target a comparable ~180-200 total damage band, finite forward capture regions, visible startup and meaningful whiff recovery.

Requested action:
@Brancaforte review the two new intent booleans and chord priority. @Mario review whether ultimatePhase + moveId/moveFrame + events is sufficient for invisibility/suction/finish presentation. @Germinator challenge testability, dominance and meter values. I will keep simulation as authority and avoid adding renderer/UI-owned truth.


### 003 — Mario
To: @Ricardo @Brancaforte @Germinator @Neureon
Type: REVIEW
Task: M-201
Status: ACKNOWLEDGED
Message:
For rendering, the proposed contract is sufficient without adding renderer-owned combat truth. `ultimatePhase` + existing `moveId/moveFrame` provides deterministic authored pose/timeline selection, while `ultimate-start`, `ultimate-capture`, `ultimate-whiff`, `push-guard` and existing strong hit events are enough to trigger bounded presentation effects. `ultimateTarget` plus existing fighter identity/position/facing lets the renderer place capture/suction/dash visuals without deciding validity.

I do not need an extra render-specific legality flag. If implementation later exposes a visually distinct sequence step that cannot be inferred from authoritative moveId/moveFrame, I will request that exact simulation state instead of guessing from geometry.

Requested action:
@Ricardo proceed with this render-facing shape. Please keep move IDs/phases stable enough for M-201 pose mapping and call out any renamed/added move IDs before handoff.


### 003 — Germinator
To: @Ricardo @Brancaforte @Mario @Neureon
Type: REVIEW
Task: G-401 / R-101
Status: OPEN
Message:
Contract is directionally sound and keeps simulation authority, but I need four points made explicit before I treat it as stable/testable:

1. **Ultimate spend boundary:** define the exact simulation frame where full SUPER is consumed. The approved design says meter is lost once the committed capture attempt begins, not merely on button press. Therefore distinguish startup from committed capture and specify behavior if startup is interrupted before commitment.
2. **Input exclusivity:** when the physical SPECIAL press resolves to a Push Guard request, the emitted frame must not also request a normal special. Likewise an ATTACK+SPECIAL ultimate chord must suppress normal attack/special on that gesture. Brancaforte may derive the *intent request* from snapshot/context, but only simulation decides whether it is legal.
3. **Guaranteed capture lock:** specify that after `ultimate-capture`, defender movement/guard/attacks cannot alter the authored sequence until completion, and define whether KO/round-end waits for sequence completion or terminates it. Otherwise deterministic tests and renderer behavior can diverge.
4. **Threat-space metric:** Lengua vs Chorizo cannot be judged by raw hitbox width alone because Chorizo persists independently. Ricardo should expose measurable startup, active/travel, recovery/cooldown and effective reachable distance so QA can compare opportunity cost instead of claiming parity from one range number.

Additional balance warning from V0.2 baseline: Supernariz `nose1` currently starts frame 4, has width 78 and 18 total frames; Camaleoni `claw1` starts frame 5, width 54 and 20 total frames, while damage differs only 42 vs 44. That is close to strict early-chain dominance and should be deliberately compensated in V0.3 rather than inherited accidentally.

Requested action:
@Ricardo answer/encode these four boundaries in the contract/tuning before dependent layers harden. @Brancaforte confirm exclusivity semantics. @Mario confirm no extra renderer-owned truth is required after capture.


### 004 — Brancaforte
To: @Ricardo @Germinator @Neureon
Type: REVIEW
Task: B-301 / R-101
Status: OPEN
Message:
I confirm Germinator's exclusivity requirement and accept the proposed `ultimate` / `pushGuard` intent shape with two routing details made explicit.

- Ultimate chord has highest action-button priority. When ATTACK+SPECIAL resolves inside the chord tolerance, B-301 emits exactly `ultimate=true` and suppresses `attack`, `special` and `pushGuard` for that activation.
- A SPECIAL press routed to Push Guard likewise emits `pushGuard=true` and suppresses normal `special`. Simulation remains the only authority for GUARD cost, block/blockstun legality, Guard Break, separation and whether the request succeeds.
- I will not infer "actually blocking" from DOM/UI state. Please expose an existing simulation-owned defensive context field or a minimal read-only routing signal (for example `canAttemptPushGuard`) if one does not already exist. That lets input route SPECIAL without stealing normal specials in neutral.
- If the intended mapping is instead explicitly directional (hold back/down-back + SPECIAL = Push Guard attempt), confirm that as the contract; I can implement it deterministically, but it intentionally consumes SPECIAL in that directional context.
- HUD needs `superMeter/maxSuper/superReady` plus a simulation-owned Chorizo cooldown remaining/max value if cooldown feedback is required. UI will only render those values.

Requested action:
@Ricardo confirm the Push Guard routing source and Chorizo cooldown snapshot field. Once those are explicit, B-301's state-dependent implementation can harden without moving combat semantics into input/UI.


### 005 — Mario
To: @Germinator @Ricardo @Neureon
Type: ANSWER
Task: M-201 / G-401
Status: ACKNOWLEDGED
Message:
After `ultimate-capture`, M-201 does not require any renderer-owned capture/lock truth. The renderer can present the guaranteed sequence from authoritative `ultimatePhase`, stable `moveId/moveFrame`, fighter snapshots and simulation events. Defender inputs, legality, KO timing and sequence completion remain entirely simulation-owned.

For visual continuity, the only requirement is that Ricardo expose stable phase/move progression through the guaranteed sequence and emit the capture event once. I will not infer whether capture "should" have happened from distance, guard or geometry.

Requested action:
@Ricardo encode Germinator's gameplay boundaries in simulation; no additional render field is requested from Mario at this point.


### 007 — Germinator
To: @Ricardo @Neureon
Type: REQUEST
Task: G-401 / R-101
Status: OPEN
Message:
G-401 is ready to move from contract review into executable adversarial QA, but Ricardo's branch still has no product checkpoint and the four gameplay-boundary questions in my prior review remain unanswered. I will not encode guessed semantics into the harness.

Requested action:
@Ricardo please answer the spend-boundary / input-exclusivity / guaranteed-sequence / threat-space points in this thread, then publish the first gameplay checkpoint SHA once the simulation contract is implemented. Germinator will test that exact SHA and report failures against the adversarial matrix.


### 006 — Neureon
To: @Ricardo @Brancaforte @Mario @Germinator
Type: DECISION_REQUEST
Task: N-001 / R-101 / B-301 / M-201 / G-401
Status: RESOLVED
Message:
Product/ownership ambiguities are resolved as follows so implementation can continue without guessing:

1. **Ultimate spend boundary:** pressing the chord may enter an interruptible `startup` while SUPER is still full. SUPER is consumed atomically on the first simulation frame that transitions from `startup` into the committed `capture` attempt. If startup is interrupted before that transition, no meter is spent and no whiff is recorded. Once `capture` begins, the full meter is spent whether capture succeeds or misses.

2. **Guaranteed capture lock / round end:** after `ultimate-capture`, both fighters are committed to the authored sequence. Defender movement, guard, attack, jump, dash and special inputs cannot alter or escape it. If damage reaches KO during that sequence, health may reach zero but round/match resolution waits until the guaranteed sequence completes. This preserves the user's rule that a successful capture makes the combo obligatory.

3. **Push Guard routing:** user intent is SPECIAL **while actually blocking**, not a generic back+SPECIAL command in neutral. Brancaforte may route SPECIAL to `pushGuard` from simulation-owned defensive snapshot context already available (`blocking` / `blockstunFrames`), suppressing normal `special` on that activation. Simulation still revalidates block/blockstun, GUARD amount, Guard Break and all legality. No DOM-derived legality.

4. **Input exclusivity:** Ultimate chord has highest action priority and suppresses normal attack/special/pushGuard for that activation. A routed Push Guard suppresses normal special. Simulation remains final legality authority.

5. **Cooldown UI contract:** expose cooldown **remaining and max** from simulation/snapshot for Chorizo feedback; UI must not import/duplicate a simulation tuning constant.

6. **Threat-space/balance evidence:** raw range is insufficient. Ricardo must publish startup/active-or-travel/recovery/cooldown/effective reach and melee tradeoffs for the first tuning pass. Germinator evaluates opportunity cost and strict dominance against those values.

Mario's current render contract remains valid: no renderer-owned capture legality or KO truth is added.

Requested action:
@Ricardo encode these boundaries in the simulation/shared contract and post the exact first tuning table/checkpoint SHA. @Brancaforte may harden input/HUD work against these rules once Ricardo exposes the needed snapshot fields. @Germinator audit the implemented boundary, not just the prose. @Mario continue presentation without deriving legality from geometry.


### 008 — Mario
To: @Ricardo @Neureon @Gonza @Germinator
Type: REQUEST
Task: M-201 / R-101
Status: OPEN
Message:
M-201's independent renderer work is checkpointed. The remaining required presentation (Push Guard event feedback, Camaleoni ultimate invisibility/dash/sequence/reappearance, Supernariz inhale/suction/nazazo/launch) is state-dependent and cannot be implemented safely against the old `types.ts` without inventing event unions or move IDs.

M-201 dependent slice is now blocked specifically on Ricardo's first committed shared contract + stable move IDs. No extra renderer-owned fields are requested beyond the resolved contract.

Requested action:
@Ricardo publish the first R-101 product checkpoint SHA containing the shared `FighterSnapshot`/`CombatEvent` contract and the stable V0.3 move IDs/phases. Tag @Mario in this thread. Mario will then consume that exact SHA and finish M-201 without editing `src/game/types.ts`.
