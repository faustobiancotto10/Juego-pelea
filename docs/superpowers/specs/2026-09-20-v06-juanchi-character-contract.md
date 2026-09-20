# Juanchi — complete V0.6 Character Contract

Date: 2026-09-20 (audit begun 2026-09-19). Package ID `juanchi`, version1.0 candidate. Gameplay/design contract ready; authoritative visual master **not present in the audited repository**. Neureon records its path/hash when supplied. Mario may build proportions/animation infrastructure from this written brief, but cannot claim approved likeness before seeing it. No runtime raster references.

Related: [system design](2026-09-20-v06-content-expansion-design.md), [animation](2026-09-20-v06-animation-quality-contract.md), [Clash](2026-09-20-v06-ultimate-clash-contract.md), [production pipeline](2026-09-20-v06-character-package-pipeline.md).

## 1. Identity, strengths and explicit weaknesses

Mid-range aggressive / space manipulation. Juanchi uses a returning ball to create an approach window, then chooses a short normal conversion, low or committed hand-pressure Special. He must move intelligently to profit from the return. He is neither a safer Camaleoni nor a faster Supernariz.

- Strengths: two distinct ball passes; moving to influence its return; useful close pressure if the opponent respects the ball; expressive190-damage cap Ultimate.
- Weaknesses: one ball only, interruption removes it, shorter outbound control than Lengua, visible turnaround, rearm gap, no invincible close Special, no attacks while calling a cap capture. Normal opener is slower than nose1; melee route damage lies between the existing two routes.
- Initial stats: health1000, walk4.55, jump12.2, gravity0.73, hurt width56/height120. Standard guard/dash/Push Guard/SUPER rules. No armor, custom resource, double jump or air Special.
- Visual: oversized black “La 56” shirt; black cargo pants; black/white sneakers; gold chain/details; curly dark hair; rugby ball in hand when available; police-style cap at belt outside its Ultimate sequence. Use bold cloth planes and restrained highlights to preserve dark-clothing readability. No implied real police affiliation or need for realistic weapons.
- Ball and cap are separate procedural props with hand/belt/head anchors. The cap is not a normal attack weapon. Juanchi's physical fighting remains stylized and non-graphic.

## 2. Complete move package

Frame convention: move starts at frame0; active ranges inclusive; total is the first completion frame. All durations are advancing combat ticks. Coordinate y points upward from fighter feet. Forward edge is offset+width, before defender half-width. Numeric values are starting candidates; acceptance outcomes govern final tuning, and Neureon records changes.

| ID / input | Timeline | Hitbox offset,width,bottom,top | Damage/chip/GUARD | Hitstun/blockstun/knockback/hitstop | Level / route |
| --- | --- | --- | --- | --- | --- |
| `juanchiJab` / ATTACK | active5–7,total20 | 24,72,30,92 | 44/3/9 | 17/8/3.0/4 | mid; clean-hit cancel9–12→juanchiShoulder |
| `juanchiShoulder` / confirmed ATTACK | active6–8,total25 | 26,84,28,100 | 64/4/15 | 17/9/6.0/5 | mid; ends108-damage route |
| `juanchiLow` / DOWN+ATTACK | active7–9,total25 | 22,65,8,35 | 36/2/10 | 13/8/3.5/4 | low; no cancel |
| `juanchiAir` / airborne ATTACK | active5–9,total24 | 24,78,-40,44 | 62/4/14 | 14/9/5.8/5 | overhead; no cancel |
| `rugbyBoomerangThrow` / SPECIAL | spawn12,total34 | none | projectile below | throw commitment, no guard/cancel | ranged Special |
| `friccion` / DOWN+SPECIAL | hits7,10,16,total36 | per-beat below | total60/6/20 | per-beat below | mid; no cancels |
| `policeCapRage` / ULTIMATE | startup20,probe<=20,sequence40,recovery16 success/30 whiff | cap below | total190/0/0 | shared successful launch | unblockable only on valid cap capture |

Set strong=false on jab, low and the first two Fricción contacts; strong=true on shoulder, air and palm-release; both ball legs are strong=false. Standing practical first-normal reach against width56 is124; do not extend by invisible torso movement. Low and air reuse current height rules. Guaranteed two-hit route at62/85, both slots/corners, against guard attempted after first clean hit; first three legal cancel ticks must work. On blocked opener, no chain cancel, matching V0.5's delivered clean-contact rule. No special/Ultimate cancels, proximity-grab behavior or long combo tree.

## 3. Rugby Boomerang — exact lifecycle

Projectile key `juanchiRugby`, visualKey `rugby-ball`, movement kind `returnToOwner`.

| Property | Candidate |
| --- | --- |
| Spawn anchor | x = owner.x + facing48, y = owner.y +68; committed at moveFrame12 |
| Outbound | fixed facing, speed12/tick,18 advancing updates, maximum216 travel after spawn |
| Collision | half-width18, half-height9; swept AABB against current logical hurtbox |
| Turn | 4 advancing ticks at endpoint, visibly tilted/spinning, non-damaging |
| Return | speed12/tick toward current owner anchor `(x+facing20,y+68)`, max42 updates |
| Catch | distance<=24 to owner anchor; test before and after movement; clamp movement to remaining distance |
| Outbound hit | damage34,chip3,GUARD8,hitstun12,blockstun8,knockback2.8,blockKnockback1.0,hitstop3 |
| Return hit | damage30,chip3,GUARD8,hitstun10,blockstun8,knockback2.8,blockKnockback1.0,hitstop3 |
| Leg separation | at least10 advancing ticks between outbound and return contact on the same defender |
| Rearm | 30 ticks after catch/despawn; one ball in flight; no rethrow before ready |

Total clean two-pass damage64 < Lengua80; total GUARD16 is finite and not a guard-break engine alone. No critical hit for catching, manual recall, charged throw or jump throw.

Ordered update:

1. Freeze during global hitstop/pause. On first spawn tick perform the normal first movement update, consistent with existing Chorizo; phaseTick becomes1. Outbound updates1..18 move12 each unless boundary encountered.
2. On outbound wall crossing, clamp center to arena bounds plus its allowed visual half-width and start turn early. Never wrap or go behind the camera. Otherwise finish update18 at endpoint, then turn ticks1..4 hold position. Change phase to return for the next update; emit one projectile-turn.
3. On return, compute vector to the current owner anchor, normalize with `Math.hypot`, move by min(12,distance). No targeting of the opponent and no extra speed to catch a running owner. This allows walking/jumping around the return path; it does not guarantee a second hit.
4. Swept collision may hit the opponent once per leg. Outbound hit/block consumes that leg's hit permission **but does not destroy or immediately reverse** the ball. The turn is non-damaging. A return contact too soon after the outbound contact is ignored until the10-tick interval expires; it is not banked for delayed invisible damage. Caught ball has no same-tick defender hit if catch occurs before the swept segment reaches that defender; use parametric earliest contact, owner catch wins an exact tie.
5. A return hit also leaves the ball in flight until catch/timeout; never a third hit. Max42 return updates yields total flight<=64 ticks excluding hitstop. Catch or timeout starts30-tick rearm and removes active snapshot. No immortal orbit.

Return knockback follows travel direction; it can nudge a defender toward Juanchi. Standard guard direction is determined by the opposing **fighter**, not by which side the ball arrives from. It remains a mid on both legs. This deliberately avoids a ball-behind plus low-in-front unblockable cross-up. A new ball side does not force contradictory left/right guard inputs. Show a clear return trail/arrow, and keep guard sparks at the actual contact.

Owner consequences:

- Clean strike/projectile hit, guard break, capture, owner Ultimate start or Clash cancels the ball; ordinary block does not. Cancellation starts30 rearm unless round/match reset instead restores initial ready state.
- On a clean owner hit, cancel before evaluating that owner's ball contact in the same tick. The opponent's correctly timed strike/linear-projectile punish is not negated by a delayed rescue hit. If two returning balls contact their opposing owners on the same tick, they trade and both are cancelled afterward; this symmetric exception follows system C3.
- On ordinary KO/round end clear the ball; no posthumous hits. Terminal/new-match state cannot retain ownership or cooldown ghosts.
- During flight `rangedAvailability=inFlight`; recovery count0 until removal; afterward cooldown/count30→0. Repeated Special requests are discarded without changing flight or extending cooldown.
- Starting Ultimate voluntarily gives up a deployed ball. The cap is a separate probe; never a second damaging projectile.

Game purpose: the first pass asks for block/jump; the visible turnaround gives time to advance, reposition or challenge Juanchi; Juanchi chooses to approach behind the return or reposition its path. Opponent answers: jump a timed pass, block both and take the rearm approach, move out of the return corridor, or strike the owner. At least two of these must be repeatable by a human at phone size. One shared visible ball is readable; multiple balls are out of scope.

## 4. Fricción — hand-driven pressure, not another projectile

| Beat | Active tick | Box offset,width,bottom,top | Damage/chip/GUARD | Hitstun/blockstun/kb/hitstop |
| --- | --- | --- | --- | --- |
| `rub-a` | 7 | 18,66,34,88 | 14/1/4 | 9/4/0.6/2 |
| `rub-b` | 10 | 18,66,34,88 | 14/1/4 | 9/4/0.6/2 |
| `palm-release` | 16 | 22,88,26,96 | 32/4/12 | 18/10/9.0/5 |

Palm-release authors blockKnockback1.5; the first two beats use0.21 (0.6×0.35). This preserves clean-hit separation without making blocked Fricción a free reset.

Frames0–3 hands meet and knees brace;4–6 visibly accelerate friction with palms contacting one another;7–12 rapid alternating rubs and tight warm sparks between the hands;13–15 elbows open and body loads;16 the two palms extend with hip/leg drive;17–23 follow-through;24–35 recovery. Heat stays attached to palms/contact volume. No flame orb leaves the body, no independent hitbox after the move, no burn status.

Purpose: an optional committed close pressure sequence with a distinct final shove, useful when the opponent respects Juanchi's approach. Less reach and weaker reset than Coletazo; unlike Tramontana it applies no slow and seeks short multihit commitment rather than a single-hit pressure debuff. It is not invincible, armored or a reversal. No cancels or defender capture.

Clean contacts should convert into all three only at true close spacing62/85 against an inert/guard-after-hit opponent. At the outer edge a partial hit/escape is acceptable and must look like a miss, not magnetically draw the target inward. On block, Push Guard after an early beat moves out of subsequent hitboxes; backdash can exploit the gap before the palm release if timed; after final block the defender gets a measurable action window. From initial distance62, at least one ordinary4–6-frame opener must punish final recovery when properly timed. If pushback invalidates that fixture, tune final blockKnockback separately rather than adding a universal cancel.

Maintain at most three contact events and60 damage per use. Ball-assisted pressure is bounded by one hit per return leg and rearm. Test with a returning ball and both corners: no repeated sequence may remove every guard/Push Guard/escape opportunity indefinitely.

## 5. Police Cap Rage — capture is the cap landing

Ultimate key `juanchiPoliceCap`, visualKey `police-cap-rage`, kind `capCapture`. Locked facing, grounded activation, no startup/capture armor. Meter consumption remains at startup→effective commitment; interruption before commitment preserves meter, after commitment loses it. No damage before confirmation, including on a glancing cap contact outside the valid region.

- Startup0–19: retrieve belt cap, show raised prop, plant stance, wind up. At transition20 consume100 SUPER and create a non-damaging cap probe aimed at the opponent definition’s standing cap-seat height, locked once at commitment (exclude their current jump y). Its first effective movement is on the next advancing tick, like the other kinds.
- Probe: spawn forward48 at that locked standing cap-seat height, speed14, half-width18/half-height14; no homing or vertical tracking;20 movements maximum/280 travel. Front-only swept intersection with an uncaptured opponent's simulation-authored captureHead region (system C4), translated by their actual x/y and crouch state; backdash strike invulnerability does not evade an overlapping cap, but actual displacement can. Jump so the head target clears the fixed cap path, leave its range, cross behind or interrupt Juanchi before landing. Crouch-block cannot defeat an unblockable capture.
- World bounds terminate the probe; it never bounces/returns. Failure after travel emits ultimate-whiff and gives30-tick recovery. During flight Juanchi remains in an exposed throw-follow-through; no normals/guard/movement.
- On accepted intersection, atomically emit ultimate-capture and set capturedBy/connected/anchor. **That exact snapshot draws the cap on the defender's head anchor.** The visible cap cannot land earlier and then allow escape. Draw the cap on the actual probe path, with a hand pose matching its release height; use a brief attached settling pose after authoritative confirmation, not a renderer hit test.

Sequence timeline, relative to confirmed capture:

| Tick | Authoritative/gameplay role | Required physical presentation |
| --- | --- | --- |
| 0–3 | Target locked at captured world x; both stationary | Cap settles on head; Juanchi visibly recognizes it |
| 4–11 | Same lock | Hands clench/grip upward, chest expands, head looks upward, open-mouth rage shout pose |
| 12–17 | No damage; last anticipation | Saturated warm/red treatment over Juanchi, knees/hips compress for rush; no full-screen red wash |
| 18–23 | `sequenceApproach` interpolates attacker toward target, standOff70 | Leg-driven forward rush; target remains at its world anchor |
| 24,27,30,33 | Four guaranteed15-damage beats | Fast alternating articulated arm/body strikes; synchronized small impact cues |
| 34–39 | Target remains captured | Distinct windup for finishing hit, readable silhouette |
| 40 | Final130 damage, majorImpact, release event on same tick, hitstop12 | Full-body finishing blow; cap flies away as harmless effect; launch resumes when hitstop ends |
| Following16 advancing ticks | Attacker successful recovery | Controlled recoil, hands lower, stance restored; cap returns to belt after sequence cleanup |

Total190. Common release: defender vx14 away, vy5, hitstun30, base separation200 with corner overflow; attacker recovery16. No second hit after release, no guaranteed juggle, no meter reward. On a lethal sequence, complete guaranteed presentation/damage bookkeeping then release cleanup; result animation may preserve the final event's visual launch without keeping capture alive.

For the rush, freeze target anchor at capture; derive attacker end x = target.x − facing70, clamped. Interpolate attacker between its sequence-start x and that endpoint on18..23. If initial separation is already<=70, use no extra rush translation and let the pose convey a short burst. Never move target to attacker solely to reuse the old sequence offset.

Clash: only the first four effective cap-flight ticks can enter the universal timing window. The cap’s swept horizontal interval projected into the universal confrontation band is its Clash shape; its actual head-height region still exclusively controls cap capture, as distinguished in the Clash contract. Clash cancels the cap before head attachment, consumes both committed meters and applies common bilateral launch. Once ultimate-capture was emitted on an earlier tick, the sequence cannot become Clash or be cancelled by the opponent's late Ultimate.

## 6. CPU, metadata and readable controls

CPU: preferred range140–230, pressureRange115, reaction12, decision8, commitment12–18, miss0.25, confirm0.75. Existing pressure defaults plus tactics: offensive Ultimate interval110–285; ranged interval150–285/probability0.35 while ready; close weights standing0.45,low0.20,closeSpecial0.20,jump0.05,retreat0.10. With own ball returning and distance>115, choose committed approach with probability0.65 on a normal decision opportunity; no knowledge of future hit. Preferred-range retreat probability0.10. These are initial weights, not a new omniscient archetype.

Selection metadata: name/fullName “Juanchi”; kicker “PRESIÓN A MEDIA DISTANCIA”; role “Ataque y retorno”; moves “Combo · Low · Rugby Búmeran / Fricción”; mark “J”; gold accent `#d8b65c`; rigKey `juanchi`; rangedAvailabilityLabel “PELOTA”. Keep ball silhouette visible in selection's procedural portrait. No fifth action or additional gesture.

Help: “Especial: pelota de ida y vuelta. Movete para cambiar el regreso. Una pelota por vez.” “Abajo + Especial: Fricción, presión corta con empuje final.” “Ultimate: la gorra captura cuando cae en la cabeza. Antes, se puede esquivar o interrumpir.” Availability states: “LISTA”, “EN VUELO”, cooldown progress; do not label an active ball as a charged meter.

## 7. Required acceptance corpus

Automated: all Juanchi/original ordered matchups and Juanchi mirror; both slots/walls; distances62/85/120/180/240/300/400; hit/block/jump/owner interruption; one contact per leg/window; catch ties, wall reversal, owner crossing/jumping,42-tick timeout; no damage after cancel; same-seed CPU replay; true108 route; Fricción block exits; cap before/after-commit cost; no pre-confirm damage;190 after confirmation; shared launch and all Clash pairings. Keep false-positive negative cases as well as success cases.

Visual/human: identity against actual supplied master; leg/hand cause visible without particles; outbound/turn/return/catch distinguishable at phone size; no duplicate ball or cap; cap landing exactly at capture; upward rage pose, red treatment, rush and finishing launch clearly distinct. Six short matches minimum for Juanchi coverage: Juanchi vs each original, each original vs Juanchi, Juanchi mirror on each stage. This is qualitative acceptance, not a statistical balance verdict. Include the user's specific Lengua/Ultimate retests separately.
