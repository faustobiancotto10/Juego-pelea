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
