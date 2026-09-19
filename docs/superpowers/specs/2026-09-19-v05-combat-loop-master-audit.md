# V0.5 — Combat-loop master audit and design

Date: 2026-09-19. Author: external expert intervention (Astra); not a permanent team role.
Status: implementation-ready recommendation requested by the user; not an opened implementation round or a claim that V0.5 is implemented.
Execution authority: Neureon and the existing six-person team. No future Astra approval is required.
Plan: `docs/superpowers/plans/2026-09-19-v05-combat-loop-implementation-plan.md`.

## 1. Executive diagnosis

The problem is not a shortage of moves. V0.4 weakens the relationship between commitment, a successful read, and its reward. Several apparently subjective complaints have concrete implementation causes:

1. **Holding away can block during an attack's startup, active frames and recovery.** The attack survives a block and resumes afterward. Thus the player and CPU can combine offensive commitment with defense that should be unavailable. This invalidates ordinary frame-data balancing.
2. **Successful Ultimates do not actually launch the opponent.** Release writes horizontal velocity without hitstun or another state that integrates it; ordinary movement immediately overwrites it. The defender is free while the attacker still recovers.
3. **Normal attack presses during hitstop are discarded.** The cancel logic recognizes an edge only in a narrow window; it saves the edge during hitstop without queuing it. Tests prove a move can chain, not that its next hit is a guaranteed combo.
4. **Air attacks erase horizontal movement.** Starting an air normal zeros `vx`; the move branch integrates only vertical motion. Escaping by jumping and attacking can strand the player over the same location. Ordinary attacks also turn automatically across a crossover.
5. **The CPU has reaction-looking rules, not a consistent perception model.** It responds immediately to Ultimate startup; its nominal missed tongue reaction gets retried on the next frame; threat handling can override an existing intention, including while its own attack is committed.
6. **The mobile D-pad cannot recover from all pointer interruptions.** `lostpointercapture` is handled on action buttons but not on the D-pad. Blur clears keyboard state only. Once a D-pad pointer remains latched, a subsequent pointer is refused.

Recommended V0.5: repair those six foundations, make the input grammar explicit, restore short useful melee routes, add one grounded low normal per fighter using the existing low/overhead rules, and make Specials and Ultimates visibly committed. Preserve the current engine and four action buttons. Defer grabs, new resources, long combos and a general-purpose character scripting system.

**Success is a repeated loop of approach/read → opening → short reward → defensive choice → escape or punish → neutral. A passing test suite alone is not evidence of fun.**

## 2. Evidence boundary and repository state

Audited `main`: `052b32604e1e0ced34aa0f6089a8615f52a79d15`.
Published V0.4 product commit: `db9b52e097f3f8ecf9ac45e7a73354477e8592b1`.
Verified `gh-pages` head: `1d2883427b4c171624cbb19f667cdd50539b1d69`.
`main/play.html`, `gh-pages/index.html`, `gh-pages/play.html`: same Git blob `d651bc064b25fc55a12f2b87be2c83a8ab0573d0`.

Inspected root rules, DECISIONS, existing specs/plans, current coordination, all six role contracts, R001/R002 summaries and relevant combat/presentation/QA/release threads and handoffs; simulation, moves, fighter data, CPU, input, rigs/effects, UI, tests, build/CI and standalone architecture. Product source did not change between the published V0.4 commit and the audited main; subsequent changes were documentation/coordination.

Verification performed:

- Built unchanged TypeScript source with TypeScript 5.9.3, installed in a temporary tooling directory, Node 24.19.0. No project dependency or production-code changes.
- `npm test`: **96/97 pass at the audit baseline**. Failure: `coordination state is internally valid in idle or live rounds`; `coordination/forum/active/README.md` still asserts R001 ACTIVE while CURRENT_ROUND says IDLE. This does not contradict the archived release's earlier 97/97 result; it is a later archive/reset inconsistency.
- `npm run build`: pass. Additional throwaway Node scenarios exercised the actual compiled modules; key reproductions appear in the plan.
- Opened published V0.4 in desktop Chrome, traversed fighter/rival selection and combat/help, and inspected a combat screenshot. Help does not name the directional Special mappings. Browser-extension log errors were not treated as game errors.
- **Not performed:** physical iPhone/Safari long-press reproduction, timed human skill/feel comparison, mobile performance measurement or a new release. The Safari selection trigger is a strongly supported hypothesis; the stuck-pointer consequence is independently reproduced. Visual timing proposals below remain playtest targets, not measured improvements.

Evidence labels: **B** = reproduced/code-proven defect, **D** = design judgment, **H** = hypothesis requiring device/playtest evidence.

## 3. What the shipped loop actually rewards

### 3.1 Current move economics

Authored frame numbers are `moveFrame` values: input starts a move at frame 0; first active frame 5 means contact on the sixth call including activation. Hitstop freezes move/stun updates. Do not mix `snapshot.frame` (which advances during hitstop) with advancing combat frames.

| Move | First–last active / total | Damage / chip / GUARD | Hitstun / blockstun | Forward edge, excluding defender half-width | Consequence |
| --- | --- | --- | --- | --- | --- |
| claw1 | 5–7 / 19 | 46 / 3 / 9 | 12 / 8 | 94 | Short hit-confirm chain; raw startup slower than nose1 |
| claw2 | 5–8 / 22 | 60 / 4 / 15 | 15 / 9 | 110 | Ends Camaleoni's two-hit route |
| nose1 | 4–6 / 18 | 42 / 3 / 9 | 9 / 7 | 88 | Faster, but present hitstun does not guarantee nose2 |
| nose2 | 4–7 / 19 | 49 / 3 / 9 | 10 / 8 | 108 | Chain permission is not combo continuity |
| nose3 | 6–9 / 26 | 74 / 5 / 18 | 16 / 11 | 134 | Larger finisher, recovery commitment |
| Lengua | 9–12 / 30 | 92 / 8 / 24 | 18 / 12 | 374 | Nearly the damage of claw1+claw2, much longer reach and the same 24 total guard damage in one button |
| Lengua baja | 10–13 / 38 | 76 / 7 / 22 | 17 / 12 | 350 | Strong ranged low; occupies requested Coletazo input |
| Coletazo | 6–10 / 31 | 52 / 4 / 15 | 14 / 9 | 164 | Reset tool, not a damage conversion route |
| Tramontana | 8–14 / 34 | 38 / 4 / 20 | 19 / 12 | 186 | 90-frame 0.7 movement multiplier on hit; substantial pushback and recovery undermine follow-up pressure |
| Chorizo | spawn 8 / 29 | 58 / 5 / 14 | 14 / 10 | Moving projectile | Speed 9.2, 150-frame TTL, **already has 120-frame cooldown** from spawn |

Sources: `src/game/simulation/moves.ts`, `CombatSimulation.ts:687–754`, `fighters.ts`. Physical hit reach also includes defender half-width (27/28). Airborne/crouching vertical overlap matters. For example Camaleoni's first normal can contact a standing Supernariz at center distance 122, nose1 a standing Camaleoni at 115. **Supernariz no longer has longer first-normal reach**; it does have faster startup, faster walking and a longer later chain. Do not buff Camaleoni based on an obsolete reach claim.

Ignoring movement, cancels and ordering, first-active block advantage is approximately `blockstun - (total - activeStart)`: Lengua −9, Coletazo −16, Tramontana −14, claw1 −6, nose1 −7. They look punishable on paper. Range, pushback and the guard-during-move defect defeat that paper analysis. All acceptance windows must be measured through `step()`, in both fighter slots.

### 3.2 Dominant strategy, tested without overstating it

A throwaway policy comparison used 24 single-round cases per policy/fighter: both slots, frame offsets `[0,1,2,3,4,7,11,17,23,31,47,59]`, normal starting positions, opposite-character stock CPU. These are deterministic phase offsets, **not independent random seeds**. Policies are simple bots with exact own-state timing, not human players.

| Player | Policy | Wins / 24 | Mean HP lost | Mean HP dealt |
| --- | --- | --- | --- | --- |
| Camaleoni | Hold away; pulse Special whenever idle; use READY Ultimate within 260 | 24 | 16 | 1000 |
| Camaleoni | Maintain 260–330 distance; Special; contextual Ultimate | 24 | 343 | 1000 |
| Camaleoni | Approach/dash; normals and eligible chain presses; Ultimate | 24 | 257 | 1000 |
| Supernariz | Hold away; pulse Special whenever idle; use READY Ultimate within 260 | 24 | 10 | 997 |
| Supernariz | Maintain 260–330 distance; Special when cooldown ready; Ultimate | 24 | 31 | 984 |
| Supernariz | Approach/dash; normals and eligible chain presses; Ultimate | 24 | 46 | 1000 |

This supports a **low-effort safety exploit**, not the claim that melee can never win or that one strategy mathematically dominates every opponent. All policies won; win rate alone is a poor discriminator against this CPU. Preserve tests of damage received, time, choices and counterplay, not just victory.

Why passive ranged play is attractive:

- Retreat doubles as guard, and currently remains guard while attacking.
- Lengua supplies large damage, guard pressure and 11.04 attacker SUPER on a clean hit from safety. The entire claw route gives 12.72 SUPER and needs approach plus timing.
- Chorizo persists independently after recovery; its cooldown already limits frequency, but does not fix safe defensive casting or predictable CPU approaches.
- All ground normals and both close Specials are mids. Supernariz has no grounded low; Camaleoni's low is a long-range tongue. Close combat offers few reasons to change defense.
- Guard returns after 45 advancing frames at 0.9/frame, including while holding away. Repeated ranged blocking is not infinite defense: tongue can cause breaks. The complaint is lack of meaningful nearby choices, not absence of a guard resource.
- Ultimate damage itself refunds 22.8 SUPER at current coefficients. Chip also feeds SUPER. There is no passive/manual charging, and receiving damage is less efficient than dealing it; do not falsely describe the current meter as passive.

### 3.3 Strengths to protect

Keep deterministic 60 Hz steps; immutable snapshots for consumers; finite resources; input/canvas/DOM separation; procedural articulated rigs; fixed arena and readable two-fighter identities; dedicated touch Ultimate; contact-only cancel eligibility; finite-range/locked-facing Ultimates; authoritative `capturedBy` and terminal cleanup; bounded 120 particles / six transient flashes; short best-of-three/rematch flow; accepted-SHA integration and independent QA.

Coletazo is a useful visual reference because its windup, acceleration, follow-through and recovery are separately authored. Preserve that vocabulary, not necessarily its exact curves for every action.

## 4. Objective findings and causal paths

| ID / priority | Evidence and reproduction | Required disposition |
| --- | --- | --- |
| B01 critical — attack + guard | `resolveMoveHits:581–591` and projectile blocking `729–735` omit `currentMove` and Ultimate legality. At x=500/590, Camaleoni starts Lengua holding left against nose1: blocks 3 chip at call 5, then hits for 92 at call 20. Without left, takes 42 and Lengua is cancelled. | One shared guard predicate for strike/projectile paths. No guard during a committed move or non-idle Ultimate. Preserve real blockstun continuity; explicitly cancel offensive state if an exceptional defense ever exists. |
| B02 critical — stuck D-pad | `GameInput.bindTouchControls`: D-pad handles up/cancel but not lost capture. `bindKeyboard.onBlur` clears only keys/taps. Fake DOM sequence down → lostpointercapture → blur leaves `right=true`; next pointer is ignored. | Full input lifecycle reset plus scoped browser protections; see §11. |
| B03 high — missing Ultimate exit | `updateUltimateSequence:913–936` releases at 62/74 distance and sets `vx`, no `stunFrames`; idle movement `441–450` overwrites velocity. Both slots end recovery still at 62/74 in neutral-input probes. | Simulation-owned release motion, stun and corner separation; §9. |
| B04 high — lost combat presses | `step:247–250` saves previous inputs during hitstop; `updateFighter:380–388` requires a fresh edge inside cancel window. Pressing and holding ATTACK during claw1 hitstop produces only 46 damage. | Bounded simulation command buffer and lossless DOM edge latching; §6. |
| B05 high — chain != combo | At 62 distance, earliest legal nose1→nose2 against guard requested after first hit gives 42 clean then **3 chip**. Earliest claw route gives 46+60 clean; late permitted cancel gives 46+4 chip. Existing tests assert `moveId`, not continuous hitstun. | Guarantee one clearly defined short route each; keep pressure strings distinct from combos. |
| B06 high — air attack kills escape | `startMove:657` zeros vx; current-move update has no x integration. Jump-right then airClaw at fourth follow-up tick remains x=517 through next 21 steps; plain jump-right reaches x=610.5 in comparison. Air attack activation also skips vertical integration that step. | Preserve authored air velocity, integrate consistently; §8. |
| B07 high — automatic tracking | `updateFacing:998–1005` locks only Ultimates, not ordinary startup/active/recovery or airborne commitment. | Lock attack-facing at start; no homing active hitbox through a crossover. |
| B08 high — wrong Special grammar | `getSpecialMove` selects tongueLow on down; simulation selects Coletazo on up+Special. Supernariz down selects Tramontana. Help says only “Especial contextual”; selection advertises tongueLow and omits Coletazo. | Uniform down-any-diagonal mapping; remove low tongue from selectable kit. |
| B09 high — false reaction imperfections | CPU Ultimate check precedes commitment gate and has no latency. Synthetic newly visible startup caused jump/backdash intent in 60/60 phase-offset cases. Tongue recognition retries at ages 7,8,9; one modulo miss is immediately recovered. | Per-cue observation delay and latched misses, not per-frame lottery; §10. |
| B10 high — documentation/build truth | Milestone still V0.2/R001; active index authorizes stale work; full current suite fails. `npm run build` builds ES modules, **does not regenerate play.html**; main CI doesn't check standalone freshness. | Documentation hygiene now; reproducible standalone generation and parity gate in V0.5. |

Additional correctness risks to cover while touching these areas: invalid `ultimate`/`pushGuard` intents return before ordinary movement/move progression; stale held Special can become Push Guard when context changes without a new press; action buttons store one boolean instead of pointer ownership; normal/projectile contact ordering and Ultimate capture updates are slot-sensitive. Do not invent an all-purpose engine rewrite to address these; test mirrored scenarios and make simultaneous-contact policy explicit.

## 5. V0.5 design and alternatives

Three approaches considered:

| Approach | Benefit | Cost / failure mode | Decision |
| --- | --- | --- | --- |
| Bigger cooldowns and weaker CPU | Fast parameter change | Does not repair attack+guard, lost inputs, fake combos, air freeze or Ultimate exit; adds waiting | Reject as primary solution |
| Repair commitment + simple offensive choices | Reuses current systems; measurable improvements per task | Requires precise state/input contracts and actual playtests | **Choose** |
| Throw/tech, parry, stamina, expanded combo engine | More theoretical options | New input/capture rules before existing rules work; much higher regression surface | Defer |

The redesigned loop:

- **Neutral:** walk/dash through real recovery; block or jump a committed ranged special; safe spacing retains value. A max-range whiff need not guarantee a full punish—gaining approach space is a valid reward.
- **Opening:** catch recovery, interrupt startup, land a low against standing defense, or read crouch defense with a jump-in overhead.
- **Offense:** confirm a two-/three-hit normal route for more reward than one distant poke; choose low/air approach on renewed pressure. No automatic special-cancel tree.
- **Defense:** guard is legal only when not attacking; low/overhead choices matter; block a risky ender and retaliate, backdash on a read, or buy separation with Push Guard.
- **Escape:** early jump/crossover against a committed ground move; backdash at appropriate timing; paid Push Guard while actually in blockstun. No universal invulnerable jump.
- **Reset:** Coletazo and both Ultimate finishers visibly separate; pressure enders leave measurable defensive windows. The opponent must approach again or make a new read.

## 6. Normal attacks, hit confirms and input buffering

### Guaranteed small routes, no combo feature expansion

Keep Camaleoni `claw1 → claw2` and Supernariz `nose1 → nose2 → nose3`. Preserve first-hit startup advantage for Supernariz and reach/damage compensation for Camaleoni. Do not add launch juggling, air chains, special/Ultimate cancels or an attack that automatically walks the fighter forward.

**Initial tuning candidates**, subject to measured tests before consumer freeze:

| Move | V0.5 starting change | Intent |
| --- | --- | --- |
| claw1 | hitstun 16; cancel window 9–12 | Buffered first hit reliably converts; retain total 19, damage 46, edge 94 |
| nose1 | hitstun 14; cancel window 8–11 | Make the advertised first link a real combo; retain total 18, damage 42 |
| nose2 | hitstun 16; cancel window 8–11 | Reliable second conversion with current nose3 startup; retain damage 49 |
| claw2 / nose3 | Preserve initial damage/reach; tune pushback only if route drops | Enders terminate pressure; do not enable loops |
| `clawLow` / `noseLow` (new) | total 25; active 7–9; offset 22, width 65; bottom 8, top 35; damage 36, chip 2, GUARD 10; hitstun 13, blockstun 8, knockback 3.5, hitstop 4; level low; no cancels | DOWN+ATTACK is the minimum new guard decision; standing block loses, crouch block wins; shorter reach than standing opener |

Why a low instead of a throw now: low/overhead/block-height rules already exist, and repaired air movement makes the existing overhead usable. One additional low move per rig gives both fighters close-range guard counterplay without another capture state or button. Stationary down-back must be beatable by a properly spaced descending overhead; early upward attacks must still be punishable. This is a required scenario, not a hope.

A future throw is appropriate only if V0.5 playtests still show passive guard winning despite usable lows/overheads/guard attrition. A valid throw would need explicit input, short grounded range, strike/jump/backdash counterplay, throw immunity after stun, simultaneous-throw arbitration and visible whiff recovery. Do not silently implement proximity-based forward+ATTACK grabs: that changes an advancing normal into a different action based on distance. No throw/tech work in this plan.

### Buffer contract

- DOM input preserves each action down-edge until at least one fixed-step sample; a press/release entirely between RAFs must not disappear. Direction remains held state. Keyboard and touch share semantics.
- Simulation owns a **six advancing-combat-frame** pending command per fighter. Capture edges before hitstop; freeze expiry during hitstop. No wall-clock gameplay buffer. Store direction-at-press with Special/low normal.
- One command, one consumption. Latest new edge replaces an older unconsumed command; same-sample priority `Ultimate > defensive Push Guard > Special > Attack > Jump`. No delayed resurrection of lower-priority actions.
- Unmodified ATTACK while a contact-confirmed starter is active may queue until its cancel window. DOWN+ATTACK requests the low only from legal grounded neutral/recovery completion; it never silently becomes a chain cancel. At the first legal cancel, consume it once. Whiff never grants a cancel. Held ATTACK alone never repeats/chains.
- Late recovery/landing/stun commands may execute only if legal within the six-frame expiry. Clear on round/match/new-fight reset and capture. UI pause/background reset sends an explicit flush to simulation; do not clear buffered confirms merely because hitstop began.
- Split `moveHasHit` semantics into contact outcome (`none|hit|block`) so future meter/confirm/CPU logic doesn't confuse hit with block. Block-contact normal chains remain pressure strings with escape gaps, not guaranteed damage.
- Ignore invalid resource/state requests without freezing ongoing movement or move clocks.

Acceptance: both routes connect at starting center distances 62 and 85, mirrored and at either corner, against a defender continuously attempting guard after first contact. At least the first three advancing frames of each published cancel window must retain true-combo continuity. Events and defender actionability—not `comboCount`—prove the combo. Whiffed starters remain punishable. Repeated blocked strings cannot suppress all legal escapes forever.

## 7. Specials, guard and reward economy

### Control grammar

| Input in legal grounded neutral/recovery completion | Camaleoni | Supernariz |
| --- | --- | --- |
| SPECIAL; forward+SPECIAL; back+SPECIAL | Lengua | Chorizo |
| DOWN+SPECIAL; down-forward; down-back | Coletazo | Tramontana |
| UP+SPECIAL | Same ranged Special; no unique up-only move | Same ranged Special |
| ATTACK | Standing normal / chain | Standing normal / chain |
| DOWN+ATTACK | clawLow | noseLow |
| Airborne ATTACK | airClaw | airNose |
| SPECIAL newly pressed during actual blockstun | Push Guard only | Push Guard only |
| ULTIMATE | Existing dedicated touch action | Existing dedicated touch action |

Down wins if up and down coexist; left+right is neutral horizontal. No auto proximity mapping. D-pad down diagonals already produce `down=true`; retain that tolerance. Latch a down modifier for four fixed input samples before a Special press to tolerate thumb motion, but consume the current direction if it is explicitly up; test both facings. This input grace is expressed in samples, never inferred by the renderer. Keyboard W/Space still jump; same-frame Special has precedence. Remove `tongueLow` from playable bindings/CPU/help; update obsolete tests instead of preserving a contradictory hidden move.

### Per-tool commitment

- **Lengua:** candidate first active 12, active through 14, total 38, damage 80, chip 4, GUARD 14; retain initial reach 374 and hitstun 18/blockstun 12/knockback 7.4. No cooldown and no invulnerability. There is a visible preparation and a real recovery. At close/mid distance, correctly timed approach during whiff recovery must produce a normal punish even if the caster holds away. At max range, gain space rather than promise an impossible full punish. Do not add an extended tongue hurtbox yet; it is an additional collision system, unnecessary until the simpler commitment proves insufficient.
- **Chorizo:** preserve 120-frame cooldown, projectile speed/TTL and initial damage. Candidate spawn 12/total 36; no guarding during throw recovery; at most one active projectile per owner. At long range its travel creates advantage; jump or block-and-advance is counterplay, not a guaranteed distant punish. Test release of the projectile when its owner is struck, Ultimate interaction and cooldown-rejected presses.
- **Coletazo:** keep V0.4 frame/damage baseline initially. Its job is a committed close reset with high hit knockback, not a universal invincible reversal. Down mapping makes it discoverable; no block-cancel shortcut.
- **Tramontana:** candidate active 8–11, total 30, knockback 4, hitstun 22, blockstun 10, damage 38, GUARD 16, chill 60 (0.7 movement). Its clean hit should leave a useful approach/pressure opportunity; blocked/whiffed use yields a punish opportunity. No automatic guaranteed Special→normal combo is required. Chill must not disable jump escape or become an unbreakable repeated loop.

Measure actual block/hit actionability at near, middle and tip range before accepting any candidate. Numerical candidates are not proof of balance; Ricardo may revise within these roles and acceptance criteria, recording deltas for Neureon/Germinator.

### Defense and economy

- Keep automatic away guard, down-away guard, GUARD 100, 45-frame regen delay and 0.9/frame regen initially. Repair guard legality first. Do not drain GUARD merely for holding block or add stamina.
- Keep Push Guard cost 34 and nominal displacement 122. Require a new Special press; holding Special from neutral must not become an automatic defensive trigger. Add six advancing frames of defender recovery after Push Guard: input is accepted but no strike/jump/dash/Ultimate or immediate guard during those frames. It buys separation, not an instant ranged punish. Classify a defensive request when its edge is ingested; an earlier buffered offensive Special must not transform into Push Guard after the fighter gets hit or blocked. Keep it unavailable during guard break and capture.
- Corner Push Guard must create separation even when the *attacker* cannot move farther toward a wall. Clamp the intended attacker displacement and transfer any unused amount to the defender inward. Keep both in bounds and prevent side swaps. Normal corner block transfer remains smaller and must not erase corner advantage.
- Candidate SUPER rewards: grounded/air normal clean damage ×0.15; special/projectile clean damage ×0.10; normal/special/projectile HP received ×0.055; blocked chip and Ultimate damage give **zero to either side**. Cap 100, no passive/manual/whiff/guard-only reward; retain across rounds, reset per match. This deliberately replaces V0.3 chip gain and Ultimate self-refund. Keep event-on-threshold exactly once.
- This makes a 106-damage claw route worth 15.9 attacker SUPER versus 8 for candidate Lengua. Do not reward attack button presses or “being close”; those are farmable proxies for actual offense.

## 8. Jump, aerial interaction and corners

Current jump already begins immediately (no explicit pre-jump startup); Camaleoni apex is about 113 world units and Supernariz about 105. Ground attacks reach top heights 92–118 and hurtboxes start at the airborne foot. A jump is hittable for much of ascent/descent. CPU code has **no dedicated perfect anti-air policy**: the problem also comes from persistent ground pressure, tall hitboxes, automatic facing and air movement cancellation. Do not “nerf CPU anti-air” without separating those causes.

V0.5:

1. Preserve responsive immediate jump initiation. Sell preparation by a short visual leg compression on the initial ascent; do not add input latency solely for animation.
2. Takeoff horizontal velocity derives from held direction and fighter walk speed. Preserve it through an air normal. Airborne neutral can steer with the existing capped walk-speed model; an active air attack commits to its launch velocity. Integrate x/y once per advancing step, including the activation step. Landing clears airborne carry and applies **four-frame grounded recovery** before attacks/dash/jump; guard allowed immediately on a non-attacking landing, only after move completion on an attacking landing. Buffered actions wait until legal.
3. Freeze ordinary move facing for its full timeline, and preserve takeoff facing in the air. Reorient on grounded actionable neutral. Camera/rig must use the same snapshot facing as hitboxes.
4. Candidate airborne hurtbox bottom `y+16`, top unchanged; only while airborne. This represents tucked feet, not invincibility. Preserve ground/crouch boxes. Do not enlarge jumps or shrink entire bodies to hide tracking defects. If unnecessary after movement/facing fixes, Ricardo may keep the old bottom and must still meet the escape scenarios.
5. A neutral forward jump from the wall at 62–85 distance must cross an opponent committed to a sufficiently early whiff/recovery and land in bounds; adding air ATTACK must not erase that displacement. A ground attack deliberately timed into early ascent or landing must still hit. Late jump into an already active strike can lose.
6. Airborne hits use horizontal stun knockback and gravity; no instant snap to ground. Do not permit repeated air hits to create an unintended infinite. Keep current pushbox crossover threshold (y>45) initially; test both corners, simultaneous jumps and landing overlap before changing it.

## 9. Ultimates: earned spectacle and an actual exit

Preserve finite forward capture, guaranteed post-capture sequence, pre-commit interruption preserving meter, and committed whiff spending meter. Keep 190 total damage initially. A more convincing Ultimate does not require higher damage or full-screen movies.

- Candidate startup: Camaleoni 22 frames, Supernariz 24. Current 9/11 startup plus instant CPU recognition creates unequal practical reaction opportunities. The longer visible tell lets a human read a neutral attempt; punishing an opponent's commitment remains strong. Evaluate close/max-range capture rates before final values.
- Add simulation snapshot `ultimatePhaseFrame` and `ultimateConnected`; current `moveFrame` cannot identify sequence timing because capture duration varies. `ultimateConnected=false` for a whiff, true only after capture; reset with transient cleanup. Avoid a success-looking finisher on whiff recovery.
- On successful sequence release, author at least 30 advancing frames of defender hitstun, `vx=14` away, `vy=5`, `grounded=false`. Shorten **successful** attacker recovery to 16; preserve longer punishable whiff recovery (24/28). Candidate numbers may change to satisfy the result below.
- Guarantee a base center separation of 180 at release: move defender outward as bounds permit; transfer missing displacement to attacker inward. Preserve facing side and bounds. Subsequent physical launch makes the motion legible. From release to attacker recovery end, neither player can immediately punish the winner of the capture with a normal.
- Same-step release semantics must be slot-neutral: advance neither defender's launch nor its new stun counter until the following advancing step, regardless of attacker index. Resolve releases as a common post-fighter-update operation.
- Acceptance: at the successful attacker's first actionable frame, center distance >=200 at center and both corners; defender cannot damage attacker before that frame by mashing normal. No camera-only separation, no extra damage, no mid-sequence escape and no guaranteed follow-up juggle.

Presentation:

- Startup: a crisp silhouette/pose and bounded accent darkening of the arena, not the HUD. A visual-only emphasis uses authoritative phase timing; it cannot pause gameplay by itself.
- Camaleoni: fade to <=0.12 body alpha during capture and the early sequence, with a sparse location cue; reappear over the four sequence frames before the final authored hit. Current capture alpha is low but sequence jumps to 0.58–0.78 and the solid pose returns too early. A constant recovery flash is not a reappearance event.
- Supernariz: inhale pose changes through startup; suction lines converge toward the face; distinct contact compression and final nose extension at the damage beat. Draw launch trail **after release motion**, not only while the target is captured and stationary as today.
- Candidate final-impact hitstop 10 frames versus current 7; ordinary contacts retain shorter freezes. All participants/projectiles obey the same simulation freeze. Keep camera shake bounded; no repeated full-screen white strobe.
- On KO, preserve one event-based finishing impact briefly while clearing capture-linked geometry immediately. Do not reintroduce R002's stuck-state bug. Disable gameplay-associated effects on new fight/rematch; keep budgets bounded.

## 10. CPU: legible decisions, not instant checks with pauses

Current CPU does not read raw input, but snapshot-only access is insufficient proof of fairness. Current-frame opponent move phase, exact age and position can still yield superhuman responses. Conversely, forced post-commit blank input can make the CPU artificially helpless. Existing source-regex tests cannot prove perception quality.

Minimum model:

- Use a small per-controller ring of **public observations**, delayed 12 advancing combat ticks for Standard CPU. Each observation contains opponent position, grounded/crouching, visible move cue and visible resource readiness; own state stays current for legality. Never expose opponent pending input, future move, exact hidden cooldown or unseen private state to decisions. Snapshot geometry is a simplified visible observation, not evidence of a human-like reaction time by itself.
- One reaction decision per newly observed move instance. A seeded integer generator decides a missed response with initial probability 25%; latch the miss for that cue. Do not reroll every frame until defense succeeds. Event instance can be derived from observed null→move transition plus observed timeline restart; prefer an authored serial if needed.
- Reaction eligibility and action commitment are independent. New threats cannot cancel an already committed strike, dash or chosen 12–20-frame approach/retreat intent. Do not reschedule an intent forever on each threat frame. Short guard adjustments after the minimum observation delay are allowed when actually actionable.
- Decide on an eight-advancing-tick cadence; use deterministic jitter in new commitments, not modulo of total round frame. Freeze perception/cadence in hitstop. Seed/reset controller state explicitly per match/round and test replay with that state, not just `CombatSimulation` alone.
- Camaleoni prefers roughly 240–330 distance, may choose retreat when crowded, but also waits/contests rather than backing off every eligible frame. At the wall, choose between contest, early jump and paid Push Guard; no automatic safe spacing teleport.
- Supernariz approaches and uses the corrected short chain but sometimes stops on block, delays or chooses low. It cannot see hit-confirm outcome before its observation model allows it; execution after its own contact cue can use a separate authored confirm probability. Never call every legal chain a guaranteed combo.
- Recognize projectile and aerial visible cues generically. The current threat list ignores projectile flight and air attacks; fixing this must not become instant anti-air. A read may be chosen before a jump; a response to a *new* jump must respect the same delay.
- Punish based on a delayed visible whiff/recovery cue and reachable range, not an oracle for the opponent's next action. A miss or late punish remains possible. Preserve modest post-commit thinking gaps as profile data, not a mandatory helpless 11-frame tax on every attack forever.

Acceptance: a new cue cannot alter threat-specific output in the first 11 advancing ticks; skipped cue remains skipped; replay is identical for same seed and input sequence; deterministic test corpus shows both successes and mistakes. On 100 isolated cues, Standard recognition approximately 65–85%, never 100% after a one-frame miss. Vary distance, side and decision offset. Do not force a human win-rate target by making the CPU stand idle; strategy-sensitive match tests and human feel are separate gates.

## 11. Mobile/browser input diagnosis and solution

**Confirmed:** body already has `touch-action:none`, `overscroll-behavior:none`, `user-select:none`; D-pad/action buttons also have touch-action. “Add touch-action” alone is not a root-cause fix.

**Confirmed:** the D-pad does not prevent default on down/move, lacks lost-capture cleanup and retains its pointer across blur. Button actions lack per-pointer ownership; pause/visibility/orientation do not flush the complete input state. This explains persistent bad behavior after an interruption even if the browser's original interruption varies.

**Hypothesized Safari trigger:** missing `-webkit-user-select` and `-webkit-touch-callout` plus unprotected descendants/default interactions leave a route for native content handling. MDN distinguishes [selection control](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/user-select), [touch pan/zoom handling](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action), [iOS callouts](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/-webkit-touch-callout) and [lost capture](https://developer.mozilla.org/en-US/docs/Web/API/Element/lostpointercapture_event). These are separate protections; `touch-action` is not a callout switch. Native OS edge gestures cannot be guaranteed suppressible by a webpage; their cancellation must always leave recoverable controls.

Implementation contract:

1. On `.fight-shell`, `.touch-layer`, controls and decorative descendants explicitly apply `user-select:none`, `-webkit-user-select:none`, `-webkit-touch-callout:none`; controls have `touch-action:none`; decoration `pointer-events:none`. Suppress `selectstart`, `contextmenu`, `dragstart` only on the combat surface. Do not globally break help scrolling or ordinary menu interaction.
2. D-pad down/move handlers use `{passive:false}` and cancel default when cancelable. Capture only a valid owned pointer; handle capture failure by clearing ownership. Ignore unrelated pointer releases. A second pointer on the D-pad cannot steal the first.
3. Central `GameInput.reset()` clears keys, all pointer ownership, touch directions/actions, edge queues, Ultimate queue, dash pulses, double-tap history, keyboard chord state and pressed styling. Release captures if still held; make reset idempotent; destroy calls reset. Action ownership uses a pointer-ID set per action, so releasing one of two fingers does not release the other.
4. Up/cancel/lostcapture release that pointer's control. Blur, hidden visibility, pagehide, orientation suspension and help-open invoke full reset, pause the fight and flush pending simulation commands. Resume only with fresh input; no queued attack/Ultimate on closing help or returning from background. Include a safe resume path.
5. Keep four action buttons. Add a direct desktop `L` Ultimate key and remove READY-dependent 55ms J/K delay/chord; J and K remain immediate at every meter value. User asked consistent controls, not preservation of a desktop chord. Update tests and help deliberately.
6. Real-device matrix: hold 2 seconds; drag outside/through children; two-finger direction+action; release outside; pointercancel/lostcapture; help open/close; portrait/landscape; background/foreground. Thirty consecutive repetitions per interruption class without stuck input. Physical iPhone Safari is required before claiming the reported selection bug fixed; Chrome mobile emulation is supplemental.

## 12. Animation/game-feel work with gameplay value

Priority after mechanics freeze: jump ascent/apex/descent, landing compression, standing/low strike contact, hit versus block reaction, movement-to-stop transitions, then Ultimate phases. Idle polishing is later.

Current rigs use a binary airborne knee offset with largely unchanged torso/head; jump reads as vertical translation. Ground character art is roughly 200 units tall while hurtbox heights are 118/122, and several drawn strikes sit much higher/farther than authored contact boxes. This is not automatically a demand to enlarge hurtboxes: that would rebalance every interaction. Mario must inspect a development hitbox overlay against contact silhouettes and align the functional limb/trail with actual contact. Coletazo's attractive animation is a direction, not proof of geometric accuracy at each active frame.

- Drive pose envelopes from `moveFrame`, `ultimatePhaseFrame`, grounded/y/vy and new landing recovery state. Anticipation must finish before contact; active-frame art must communicate reach/height. No damage from animation markers.
- Differentiate clean-hit pause/recoil from block spark; show a modest clean-hit confirm cue, not a false combo counter during a block gap.
- Walk/run/dash pose transitions should not snap straight back to idle on the frame a motion ends. Preserve readable feet/baseline and direction.
- Current particle/shake life decrements per `render()` call, so effects last half as long at 120Hz as at 60Hz and keep decaying while paused. Advance transient effects from consumed simulation-frame deltas; freeze during UI pause. Idle decoration may use presentation time, combat beat envelopes may not drift through hitstop.
- Keep <=120 particles and <=6 each transient flash; no full-scene allocation/buffer system or dependency. Compare 30/60/120 presentation cadence and two-minute mobile action stress; target p95 frame duration <=20ms on recorded target device, with no persistent >10% regression versus V0.4 on that same device. If device cannot sustain baseline, report comparative performance instead of inventing 60fps proof.

## 13. Future-character scalability: sufficient base, incomplete content contract

The current common kit is conceptual, not a fully data-driven architecture. `FighterId` is a closed two-ID union; `getAttackStart/getSpecialMove/getUltimateMove` use ternaries; simulation branches for Special/Chorizo/Ultimate; CPU branches on fighter ID and has a concrete threat list; UI duplicates fighter order/copy; `drawFighter` treats every non-chameleon as Supernariz. An old `2026-09-18-combat-core-v03-design.md` demanded zero such branches and a third-fighter fixture; the shipped V0.3 expansion did not deliver that full architecture. Do not describe those aspirations as completed.

Justified before adding fighter three:

- Add a typed `FighterKit` record containing standing/low/air/long/close/Ultimate move IDs and a CPU profile. Replace universal input/CPU identity branching with lookups. Keep current stats record and stable IDs.
- Put Chorizo spawn/collision/damage/cooldown values in a `ProjectileDefinition` and reference it from a move; no per-fighter spawn branch. Support the one current projectile primitive, not arbitrary projectile scripts.
- Extract existing Ultimate constants/timeline beats into definitions with explicit `dashCapture|suctionCapture` kind. Share release/cleanup; keep two clear kind handlers rather than one universal scripting interpreter. A genuinely new future mechanic may justify one reusable kind later.
- Add a registry boundary (injected optionally for tests) so a **test-only** third ID using an existing kit/projectile/Ultimate kind can run under the same simulation and CPU without core edits. The shipped selectable roster remains two fighters. Derive selection order/copy from registered released content and use an explicit render-function map; missing visuals fail clearly, not silently select Supernariz.
- Keep `chilledFrames` as the one current status; no generic stackable buff/debuff framework, ECS, plugin VM, external JSON loader, save migration or netcode in V0.5.

Perform data extraction separately from behavioral tuning, with identical deterministic before/after traces against the repaired commitment baseline. Preserve legacy bindings temporarily during extraction; switch them only in the subsequent mapping task. Not every renderer `fighter.id` check is wrong: character-specific procedural art belongs there. Shared move/Ultimate timing must have one authoritative data source; renderer consumes that data/snapshot, never supplies it.

## 14. Priorities, risks and explicit exclusions

**Critical:** B01 real attack commitment; B02 recoverable touch controls; accurate coordination state; lossless action capture/buffer contract before tuning.

**High:** true small combos + low normal; Special grammar and risk/reward; CPU delayed/latching decisions; air drift/facing/corner tests; Ultimate release; targeted animation/geometry; bounded content extraction; artifact parity and independent human/device QA.

**Later:** universal throw/tech only with contrary playtest evidence; more directional normals; extended tongue hurtbox; additional CPU difficulty modes; rich idle, sound/music overhaul; more fighters/stages/modes.

**Do not add:** universal stamina, manual SUPER charging, long cooldown to every move, invincible jump/Coletazo, free burst, parry, dash cancels, juggling, cinematic videos, reference-image runtime sprites, engine migration, generic behavior scripting, rollback networking, a fifth touch action, proximity-based move remapping, mandatory Astra reviews.

Principal regression risks: closing illegal guard makes both fighters more vulnerable; buffer can create unintended auto-actions if not consumed/reset; shorter cancels plus low may produce corner loops; delayed CPU may become too weak if existing forced gaps remain unchanged; air carry may create excessively safe jump-ins; no chip meter may delay first Ultimate; launch clamping may cause side/slot asymmetry; touching data and behavior in one commit obscures causality; stale `play.html` can ship old gameplay under new docs. Test each interaction before broad tuning.

## 15. Acceptance matrix and playtest decision

| Gate | Observable requirement | Owner / independent check |
| --- | --- | --- |
| AC01 | Attack + away cannot guard at startup/active/recovery against strike or projectile; ordinary neutral/blockstun guard still works | Ricardo / Germinator |
| AC02 | Full pointer loss/reset matrix leaves neutral state by next sample; next pointer works; real Safari shows no gameplay selection/callout interference | Brancaforte / Germinator + device evidence |
| AC03 | Press/release between samples and presses in each hitstop frame are consumed exactly once; bounded expiry, no repeat/ghost on pause/reset | Brancaforte + Ricardo / Germinator |
| AC04 | Both named routes guarantee clean hits under §6 scenarios; guarded strings and whiffs offer a tested defensive response | Ricardo / Germinator |
| AC05 | Mapping table holds for both facings/diagonals/READY states; low versus standing/crouch defense and descending overhead versus crouch work | Ricardo + Brancaforte / Germinator |
| AC06 | Close/mid Special whiffs can be punished despite holding away; tip-range counterplay gains space; Chorizo frequency respects current cooldown | Ricardo / Germinator |
| AC07 | Jump+air attack preserves trajectory; gap crossover succeeds both walls; correctly anticipated ascent/landing punish still works | Ricardo / Germinator |
| AC08 | CPU delay/commitment/miss latch/replay meet §10, including Ultimate/projectile/air cues; no raw or pending-input access | Ricardo / Germinator |
| AC09 | Both successful Ultimates end >=200 units apart by attacker actionability, both slots and walls; pre-commit/whiff/KO cleanup intact | Ricardo / Germinator |
| AC10 | Distinct visible phases, convincing invisibility/reappearance, hitbox-aligned contact, effect timing stable at render cadence changes | Mario / Germinator screenshots/video |
| AC11 | Third test kit runs without core/input/CPU fighter-specific changes; existing-kit extraction traces match | Ricardo / Germinator |
| AC12 | Source, standalone and published bundle correspond; clean build/tests; published-device smoke; no unresolved blocker | Gonza / independently verifies accepted candidate |

Automated strategy matrix for V0.5 must include stock CPU and scripted always-stand-block, always-crouch-block, retreat+Special, walk-forward normals, jump-on-read and whiff-punish opponents. Both slots, both characters, both corners, distances 62/85/120/200/300/400/620, and multiple deterministic seeds/decision offsets. Record wins, damage/time, attack categories, blocked/hit/whiff counts, punish success, first SUPER timing, guard breaks, corner escape success and longest period without either player having a defensive option. A scripted back+Special policy must lose to a reachable, correctly timed whiff punish in 100% of the isolated legal fixtures. Do not set an arbitrary match win-rate quota as proof of fun.

**Human gate:** on the same phone, compare archived V0.4 and candidate after a short controls explanation; play each fighter in at least three matches (12 matches total across the two builds). Record failed intended commands, preferred/default strategy and 1–5 scores for responsiveness, melee reward, escape fairness and desire to rematch. Candidate target: zero stuck-input incidents; >=90% of 20 deliberate commands execute as intended; average responsiveness and melee-reward scores improve by >=1 point; at least two deliberately chosen openings/counterplay options per fighter can be explained and repeated. User enjoyment outranks these small-sample scores. A result where the user still prefers holding back+Special is a failed design gate even if technical tests pass. Record limitations honestly; do not claim a playtest that did not occur.

If the low/overhead package fails this human gate, Neureon reopens that bounded design decision; the first fallback to evaluate is a universal close throw, not extra systems in parallel. The six permanent roles can make that decision without Astra.
