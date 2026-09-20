# Universal Ultimate Clash — deterministic contract

Date: 2026-09-20 (audit begun 2026-09-19). Required V0.6 mechanic; no implementation in this intervention. Applies to every registered Ultimate kind, including Juanchi. [System interfaces](2026-09-20-v06-content-expansion-design.md) and [Juanchi cap](2026-09-20-v06-juanchi-character-contract.md) are companion contracts.

## 1. Intent and non-goals

Two nearly simultaneous **effective offensive Ultimates** collide, cancel each other and produce a rare bilateral launch. This is not a reaction parry, meter refund, button-mash duel or a way out of an already confirmed capture. There is no extra input or clash-specific CPU defense policy.

V0.5 updates fighter0's capture before fighter1. At x500/620, equal-time same-kit Ultimates produce slot0 as capture owner. Its test only proves repeated determinism. Replace that arbitration; randomness or alternating slot priority would hide rather than solve it.

## 2. Clock and exact eligibility

Every duration below counts **advancing combat ticks**, never RAF frames or wall-clock time. Hitstop freezes combatTick. An Ultimate start at startupFrame0 is not yet effective. Meter commits at the existing startup→capture transition. Its **effective entry E** is the following advancing tick: the first tick that would move its capture dash, apply suction or advance the cap probe. Set `ultimateEffectiveTick=E` once per Ultimate instance.

On tick T, a candidate is Clash-eligible only when all are true:

1. Alive, committed (meter spent), ultimatePhase capture, not in recovery/sequence/captured/hitstun/guard-break.
2. Age `T-E` is0,1,2 or3: exactly **four effective ticks**.
3. Opponent satisfies the same conditions; `abs(E0-E1)<=3`.
4. Locked facings oppose one another, and each opponent lies on the corresponding forward half-plane, with equal-x orientation taken from the pre-movement stable side order.
5. This tick's **swept confrontation volumes overlap**, with positive-area intersection inside the corridor between their centers. Tangency alone does not Clash. Vertical overlap is required. This is not a global distance-only check.

A prior confirmed capture permanently removes eligibility for that sequence. No waiting for a future opposing activation, no rollback, no grace period after cap attachment. Different startup durations mean simultaneous button presses need not Clash; it is effective confrontation timing that matters. Early start can win before the opponent becomes effective. Demonstrations/tests align the effective entries deliberately; do not lengthen the window until every dual-button press clashes.

Confrontation volumes, in the common post-movement planning view:

| Kind | Volume used for Clash |
| --- | --- |
| dashCapture | Swept union of its forward rectangle over the planned dash from old to next x: reach from definition, bottom=attacker.y, top=attacker.y+captureVertical |
| suctionCapture | Forward suction field from attacker center to suctionRange, bottom=attacker.y, top=attacker.y+captureVertical; no pull applied before arbitration |
| capCapture | Swept horizontal interval of the cap probe, projected into `[caster.y,caster.y+96]` for Ultimate confrontation only |

Confrontation bands are authored ability fields, not ordinary head-contact boxes. Cap capture uses the actual head-height probe and captureHead region; Clash uses its horizontal path projected into the same grounded confrontation layer as dash/suction. This explicit distinction allows all three kinds to Clash without pretending the drawn cap hits an opponent’s torso. Casters must be grounded for this projection; no aerial Ultimate/Clash is added. Projectile/head avoidance tests use actual geometry, never this projection.

Intersect each volume with the horizontal corridor between the two relevant proposed fighter centers before comparing. Use the minimum/maximum of both current and proposed centers for that corridor when a dash crosses in a tick. A dash that starts in front and would pass the other fighter cannot evade arbitration by crossing between samples. The direction/forward-half-plane test uses the common pre-dash centers, not sequentially mutated positions.

Clash may happen before either carrier touches the opposing body, where the two offensive fields meet. Ordinary capture geometry remains separately required if no Clash occurs. No ordinary projectile-vs-Ultimate collision creates a Clash.

## 3. One common tick pipeline

Implement a small typed proposal/arbitration helper, not a cinematic scripting system. CombatSimulation retains overall ownership.

```text
advance clocks and own non-interacting states
collect both fighters' intended movement/Ultimate transitions
resolve ordinary movement and pushboxes from common state
collect/resolve ordinary strike and projectile contacts; cancel interrupted attempts
collect remaining Ultimate confrontation/capture/pull proposals
resolve eligible Clash first
otherwise select valid capture, or commit surviving dash/probe movement and suction pulls
apply scheduled sequence damage/releases through shared release pass
finish terminal checks; age commands; publish snapshot/events
```

The common proposal contains owner, Ultimate instance/effectiveTick, planned caster x, confrontation AABB, optional capture target and proposed pull/target position. Generate both without changing the other fighter. Revalidate after ordinary hits. A normal/projectile interrupt on this tick defeats a not-yet-confirmed Ultimate, including a would-be Clash. Existing confirmed sequence participants ignore ordinary hits. A lethal ordinary hit precludes that fighter's Clash. This is explicit priority, not an index accident.

For suction, compute whether its proposed pull would reach captureDistance, but commit no pull until arbitration. For dash, use swept body/capture intersection to avoid skipping a defender. For cap, use the swept probe and consume it on confirmation. After a Clash discard both capture/pull proposals. On one accepted capture, discard the other fighter's competing proposal and clear its Ultimate state.

If two ordinary capture proposals survive but are outside the Clash window: the lower effective entry tick wins. If entries are exactly equal and both would capture, treat this as mutual committed whiff: both enter normal whiff recovery, neither damages/captures, no Clash effect. This uncommon tie fallback must be symmetric; it does not refund meter. It covers malformed/long-lived mutual overlaps beyond the early window without resurrecting slot0 priority. A single valid proposal captures normally, even if the other fighter's startup is almost complete.

Final-impact release of an existing confirmed sequence takes its established priority over terminal cleanup. Do not permit a simultaneous new Clash involving a participant still captured or in sequence. Resolve all release movement initialization after fighter updates; first physical displacement is next advancing tick in either slot.

## 4. State transition and exact result

At accepted Clash T:

- Both meters remain0; no damage, chip, guard loss, SUPER gain or hit events from either Ultimate.
- Cancel both Ultimate sequences/probes/current moves, capturedBy/target/connected, dash, jump preparation, hit/block stun, and pending commands. Clear both ordinary projectile lists to prevent a stray ball/chorizo from damaging the neutral-reset sequence. Start Juanchi's rearm30; normal cooldown clocks freeze during hitstop as usual.
- Emit exactly one `ultimate-clash` event with `{clashId, fighters:[0,1], x, y}`. Use common intersection midpoint for x/y; event is not attributed as a winner.
- Publish MatchSnapshot `clash: {id:number; phase:'freeze'|'launch'; launchTick:number|null; remainingLaunchTicks:number}|null` and FighterSnapshot `clashRecoveryFrames:number`. Initialize recovery30 each, clash phase freeze, remainingLaunchTicks30.
- Set hitstop to **12 fixed step calls**. Commands arriving during this freeze are discarded for both fighters; no prebuffered retaliation. Preserve held directional sampling for later neutral, not action edges.
- Preserve left/right order from before the collision. Assign left vx−16, right vx+16; both vy8, grounded false. If distance<160, establish base separation160 symmetrically around midpoint, clamp to90..1190 and transfer any unavailable displacement to the other fighter. Do not pull already-distant fighters closer.
- First advancing tick after the12 frozen calls is launch tick1; set clash.phase=launch and launchTick to the current combatTick once. Integrate each x/y once, horizontal velocity decays0.90; normal fighter gravity applies. Clamp walls, do not wrap or exchange sides. No second forced displacement beyond the base separation. At a wall, outward velocity may be blocked; vertical launch and the other's motion must still be visible.
- For exactly30 advancing launch ticks, both ignore ordinary damage and cannot attack, block, jump, dash or Ultimate. This immunity belongs only to the simultaneous reset, not to an ordinary Ultimate whiff. Existing projectiles were cleared, so it cannot mask pending damage. Do not run normal landing recovery in addition: landing may emit its visual event but adds no extra action delay during Clash.
- Decrement both recovery counters together; tick30 ends both locks on the same snapshot, zero velocities and clear clash state. Next advancing step accepts neutral actions normally. Buffer only newly pressed commands in the last six launch ticks, with the existing bounded expiry; earlier commands are discarded. No staggered actionability from slot order or unequal gravity. All released roster fighters must have landed by tick30; validate this from their jump/gravity parameters.

At both players' first actionable snapshot, distance>=300 at center and either wall; no participant gains earlier actionability. An ordinary valid corner naturally constrains one outward motion; the acceptance is strong visible bilateral impulse plus neutral separation, not leaving arena bounds.

On timeout during launch, defer round result until both locks clear, then use health comparison without Clash damage. External match reset/destroy clears Clash immediately. A fighter already at0HP before acceptance cannot enter Clash; no resurrection. Same inputs/content/CPU seed must produce byte-equivalent snapshots/events.

## 5. Presentation

A unique two-sided ring/impact symbol, brief arena darkening and two opposing trails distinguish Clash from a successful Ultimate. Show both silhouettes braced toward the collision during freeze, then both recoil/launch. One optional short “CHOQUE” label may appear in the canvas; do not obscure input/HUD. No button prompt or mash UI. Juanchi's cap is cancelled before head attachment; neither rig enters its solo sequence pose.

Use snapshot.frame delta for the12-frame freeze accent decay, combatTick for actual movement/recovery and pose phases. UI pause freezes both by taking no steps. Reduced-motion presentation may suppress shake/flash intensity but cannot change timing or results. Keep120 particles and at most six transient effects per existing category; a single Clash effect has a bounded lifetime. Never use repeated full-screen flashing as the main source of impact.

## 6. Deterministic acceptance table

| Fixture | Expected |
| --- | --- |
| Every3×3 ordered pairing, mirrored slots, centered overlapping volumes, aligned E | One Clash, zero Ultimate damage, both meters0 |
| E offsets−3..+3, both ages<=3 when contact occurs | Clash if geometry/legality also qualifies |
| Entry difference4 or either age4 | No Clash; ordinary capture/whiff policy |
| Both capture phases but nonoverlapping or vertically separate fields | No Clash |
| Same tick Ultimate buttons but earlier ordinary capture already accepted | No retroactive Clash |
| Cap would attach and eligible Clash on same tick | Clash first, no capture event/head attachment |
| CapturedBy set on an earlier tick | Guaranteed sequence, late opponent input cannot Clash |
| Normal/ball clean hit on a prospective caster same tick | Interrupt first; no Clash for that pair |
| Both eligible but one dies to ordinary hit | No Clash; normal terminal handling |
| Existing projectiles/queued commands | Removed/discarded as specified; no later surprise damage |
| Exact mutual late tie | Both whiff, no slot winner, no Clash effect |
| Twelve extra step calls after acceptance | CombatTick unchanged, hitstop reaches0 |
| Thirty advancing launch updates | Equal release, distance>=300, bounds/order maintained |
| Center, left wall, right wall, pause/reset/timeout | Same invariant results; no stale capture/probe/Clash |
| Repeat with seed and reflected positions | Identical/reflected trajectories, event identities consistent |

Use instance serials or test-controlled entry ticks to test the boundary without making human controls fake. Also run actual input-driven aligned-start examples for all kinds; synthetic proposal tests alone do not prove integration. Germinator authors the negative/tie cases independently. Do not change the4-tick window merely to make a demo easier to trigger.
