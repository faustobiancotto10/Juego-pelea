# Thread: R001 balance and adversarial QA

Round: R001-V03-COMBAT-EXPANSION
Related tasks: R-101, G-401
Participants: @Neureon @Ricardo @Germinator @Mario @Brancaforte
Status: OPEN

## Conversation

### 001 — Neureon
To: @Ricardo @Germinator
Type: REQUEST
Task: R-101 / G-401
Status: OPEN
Message:
The user explicitly rejected free reach advantages. V0.3 must prove that Camaleoni is not simply worse at both close and long range. Melee differences require compensating costs; Lengua must not remain strictly shorter/worse than Chorizo. Corner pressure must stay advantageous without becoming a prison. Ultimates must have comparable damage bands and positional counterplay.

Requested action:
After START_ROUND, @Ricardo proposes initial measurable tuning/tradeoffs. @Germinator builds the adversarial matrix early and reports strict-dominance/corner/ultimate findings while implementation is still active.


### 002 — Germinator
To: @Ricardo @Neureon @Mario @Brancaforte
Type: PROPOSAL
Task: G-401
Status: OPEN
Message:
Initial adversarial matrix for V0.3. These are pass/fail scenarios, not tuning suggestions:

**A. Corner prison / separation**
- A1: Camaleoni at arena wall vs repeated legal Supernariz pressure. Correct blocking must eventually create measurable attacker separation via wall pushback transfer; defender may still lose GUARD/chip, but cannot remain permanently contact-locked by a repeatable blockstring.
- A2: Same position with enough GUARD: valid Push Guard costs the authored amount, deals zero/negligible damage and creates materially more separation than ordinary block transfer.
- A3: Push Guard rejected with insufficient GUARD, during Guard Break, outside blocking/blockstun and as a neutral spam input.
- A4: Coletazo provides a costly escape route when legally available; whiff must leave punishable recovery.

**B. Melee dominance**
For each first-chain normal compare startup, total frames/recovery, threat reach, damage, knockback, cancel window and resulting advantage. Any meaningful reach/startup edge needs a visible cost. Baseline `nose1` currently beats `claw1` on startup/reach/total frames for only 2 damage cost, so this is a mandatory re-check.

**C. Lengua vs Chorizo threat-space**
- C1: measure earliest threat frame and maximum effective threat distance from neutral.
- C2: whiff both at comparable spacing and measure frames until actor can move/defend again.
- C3: verify Chorizo independence lets Supernariz recover while projectile persists, while Lengua remains body-committed/connected.
- C4: jump/position counterplay exists for both; Lengua must not be simply shorter *and* more committed without compensating benefit.

**D. Ultimates — run for both fighters**
- D1 valid forward capture succeeds through standing guard and crouch guard.
- D2 defender behind attacker is not captured.
- D3 defender beyond finite capture range is not captured.
- D4 jump/crossover escaping region before capture avoids it.
- D5 whiff consumes full meter at the defined commitment boundary and enters recovery.
- D6 interruption during pre-commit startup follows the explicit contract consistently.
- D7 after capture, defender inputs cannot break sequence.
- D8 total damage falls in comparable authored band; neither is arena-wide/low-risk checkmate.
- D9 repeated identical input/state produces identical capture/result/event ordering at fixed 60 Hz.

**E. SUPER economy**
- E1 no passive charging.
- E2 dealing equal HP damage yields more meter than receiving it.
- E3 block/chip contribution is explicit and deterministic.
- E4 READY event/state occurs once at threshold, no repeated event spam each frame.
- E5 meter cannot exceed cap or double-spend.

**F. CPU**
- F1 CPU with full meter does not ultimate immediately regardless of spacing/context.
- F2 CPU sometimes uses ultimate in authored opportunity windows and can whiff/miss decisions.
- F3 CPU Push Guard is occasional/contextual, not frame-perfect every eligible frame.
- F4 character range preferences differ: Camaleoni values control/space; Supernariz approach/pressure.
- F5 existing reaction/commitment tests remain true.

**G. Regression / coordination**
- G1 full V0.2 suite stays green.
- G2 gameplay truth remains simulation-owned; renderer/UI only consume state/events/intents.
- G3 fixed 60 Hz outcomes remain reproducible.
- G4 no feature code lands on main and no owner edits another active lock without forum coordination.

Requested action:
@Ricardo use these cases when choosing initial tuning and expose enough constants/state for deterministic assertions. I will implement a separate G-401 harness once the gameplay checkpoint exists and will report strict-dominance/blocker findings against exact SHAs.


### 003 — Germinator
To: @Ricardo @Neureon
Type: DISCOVERY
Task: G-401 / R-101
Status: OPEN
Message:
Quantified V0.2 baseline and initial meter proposal expose two concrete balance/testability risks:

1. **SUPER economy may be unreachable in a one-sided round.** With cap 100, gain 0.085 per HP dealt and 0.045 per HP received:
   - dealing a full 1000 HP only yields 85 SUPER;
   - receiving a full 1000 HP only yields 45 SUPER.
   Therefore a fighter cannot reach READY from only one side of combat within a 1000-HP round. This is not automatically wrong, but the round-reset/persistence rule becomes essential. If SUPER resets each round, a dominant player can literally never earn an ultimate from damage dealt alone. If SUPER persists between rounds, that needs to be explicit and regression-tested. Also specify whether chip damage contributes as dealt/received damage.

2. **Baseline first-normal trade is heavily skewed toward Supernariz's pressure identity.** `nose1` vs `claw1`:
   - startup 4 vs 5 frames;
   - hitbox width 78 vs 54 (~44% wider);
   - total frames 18 vs 20;
   - damage 42 vs 44;
   - hitstun 9 vs 11;
   - blockstun 7 vs 8;
   - knockback 2.5 vs 3.0.
   Supernariz also walks 4.8 vs Camaleoni 4.25. This is not literal strict dominance because Camaleoni gets slightly more damage/stun/knockback, but the compensation is small relative to reach/startup/mobility. Treat this as a pressure warning that must be judged together with Camaleoni's superior control tools, not in isolation.

Threat-space baseline also confirms why raw range is insufficient: Lengua becomes active at frame 9 with ~305 authored width and holds Camaleoni for a 30-frame move; Chorizo spawns at frame 8, travels 9.2 units/frame, and can remain active after Supernariz's 29-frame throw recovery. Lengua can threaten mid-long space much earlier, while Chorizo gains independent persistence and eventual arena reach.

Requested action:
@Ricardo explicitly define SUPER round persistence/reset + chip contribution and adjust initial meter weights if the intended READY frequency would otherwise be unreachable. Preserve measurable compensation for the first-normal reach/startup advantage when final tuning lands.
