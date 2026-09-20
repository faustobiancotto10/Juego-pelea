# Permanent procedural animation-quality contract

Date: 2026-09-20 (audit begun 2026-09-19). Applies to all existing and future fighters. V0.6 implementation scope: locomotion for all three, Juanchi's complete kit, shared Ultimate/Clash impact; preserve successful Coletazo. [System state additions](2026-09-20-v06-content-expansion-design.md) and [character package](2026-09-20-v06-character-package-pipeline.md) carry this contract forward.

## Non-negotiable rule

**Every animation must physically communicate the action it represents. Position translation alone does not constitute a valid animation.** The body must show preparation, force production, movement/contact and recovery appropriate to that action. More particles cannot compensate for an unchanged body pose.

Characters are articulated native Canvas2D paths/shapes. Reference masters, pose sheets and images are authoring guidance only: never runtime cropped fighters, textures or stickers. Simulation owns hitboxes, states, timing and movement; rendering must describe that truth, never manufacture it.

## Minimal reusable architecture

Retain separate procedural rigs. Add `render/LocomotionPose.ts` and `render/RigAnchors.ts`; adapt existing `PresentationPose.ts` to consume injected readonly combat definitions. Do not build a universal skeleton/animation graph/editor.

```ts
interface Point2 { x:number; y:number }
interface RigAnchors {
  head: Point2; chest: Point2;
  frontHand: Point2; backHand: Point2;
  belt: Point2; frontFoot: Point2; backFoot: Point2;
}
interface LocomotionPose {
  phase:number; // normalized gait cycle
  frontFoot:Point2; backFoot:Point2;
  pelvisDrop:number; torsoLean:number;
  preparation:number; extension:number; tuck:number;
  descentBrace:number; landingAbsorption:number;
}
interface RigFrame {
  fighter:FighterSnapshot;
  pose:LocomotionPose;
  move:MoveDefinition|null;
  ultimate:UltimateDefinition|null;
  combatTick:number;
}
interface ProceduralRig {
  sample(frame:RigFrame):RigAnchors;
  draw(ctx:CanvasRenderingContext2D, frame:RigFrame):void;
}
```

Anchor positions are in fighter-local coordinates, y upward; one shared transform maps local anchors to world, then to screen. The existing rigs can be wrapped without replacing their art. sample and draw must use the same pose math. An anchor is presentation metadata and does not define a hurtbox; the separately authored captureHead data controls cap contact, and the art aligns to it. Cap attachment uses a defender cap-seat/head anchor aligned to the simulation-authored captureHead region, ball handling uses owner hands, rage uses chest/head. Tests compare sampled anchors and rendered geometry through deterministic pose fixtures.

A small two-bone leg solve is permitted for planted-foot targets. It belongs in rendering, with fixed authored limb lengths and clamped reach; no physics, ragdoll or global IK system. Different body proportions consume common phase/intent signals but keep different silhouettes.

## Clocks and state ownership

- Simulation exposes jump preparation, airborneTicks, landing recovery, moveFrame, Ultimate phaseFrame, contact/events and Clash recovery. No animation marker generates damage.
- Consume each fixed-step snapshot once through the renderer event/update path, even when several simulation steps precede one RAF. Pure render calls cannot advance pose/effect state.
- Gait advances from **actual unforced grounded travel**: accumulate abs(current.x−previous.x) only during normal locomotion. Not from wall-clock time, vx while clamped, knockback, capture teleports or Ultimate repositioning. Initial stride targets: Camaleoni58, Supernariz70, Juanchi66 world units per full cycle; author separately after visual inspection.
- Pose phases use combatTick/moveFrame and freeze during hitstop. Bounded impact flash/shake may decay using snapshot.frame during hitstop, because the effect must read while bodies are frozen. UI pause produces no steps and freezes both. Stage ambience can use presentation ticks and must not affect combat.
- New fight/rematch/reset clears pose histories and event deduplication. Repeated same snapshot1/4 times yields the same pose. At30/60/120 render cadence, equivalent simulation streams produce equivalent contact/foot phases.

## Walking and transitions

One foot supports weight while the other swings; the planted foot stays near its world location until toe-off. Front/back limbs alternate, knees bend under load, pelvis transfers over support and torso counterbalances. Juanchi's held ball constrains that arm naturally; free arm balances gait. Camaleoni's tail counterbalances without changing Coletazo's authored attack.

Initial stance fraction55% of each foot's cycle; swing45%, opposite leg offset0.5. The planted foot local x moves opposite root travel, compensating translation. At toe-off lift by5–10 world units according to rig proportions; do not swing both feet airborne during walking. Pelvis weight motion stays within roughly3% of visible body height. Forward and backward locomotion share planted support but use distinct lean and shorter backward steps; never play a forward walk while retreating without adjustment.

Start movement with weight shift over the first2–3 advancing ticks, blending to gait. Stop over3–4 ticks into a stable support pose. This blend changes limbs, not simulation acceleration or collision. At a wall with no actual displacement, phase stops and body braces; legs cannot treadmill from vx alone. Dash gets low compression and an extended driving leg, not only a faster gait oscillator. Large knockback is a reaction pose, not walking.

Quantitative development diagnostic: on a steady stance interval away from transitions, sampled planted-foot world x should drift<=4 units across four advancing ticks at normal walk speed; opposite foot visibly lifts. This detects gross sliding, not artistic quality. Inspect at actual phone scale before accepting.

## Jump: complete physical sequence

| Phase | Simulation cue | Physical evidence |
| --- | --- | --- |
| Preparation | jumpStartupFrames2→1, grounded | hips lower, knees/ankles flex, arms/tail prepare; feet still contact floor |
| Impulse/takeoff | takeoff event, airborneTicks0–2 | legs extend from compression, foot/toe leaves baseline, body driven upward |
| Early ascent | positive vy | extended push resolves into tucked knees; arms counterbalance |
| Apex | abs(vy) near0 | controlled airborne shape; no frozen standing legs |
| Descent preparation | negative vy | feet orient toward ground, knees prepare, torso steadies |
| Ground contact | land event, y0 | feet align to floor, brief compression at exact contact |
| Absorption/recovery | landingRecoveryFrames4→0 | pelvis absorbs and rises into stance; visible settled end |

The two-tick preparation is an intentional small gameplay change, not renderer-induced input delay. State/interrupt/buffer rules are in system C5. An air attack overrides the relevant limbs while preserving body flight/leg posture and committed trajectory. An airborne hit visibly reacts while following simulation gravity, without snapping to ground. Clash launches use a recoil arc and shared30-tick recovery instead of normal jump preparation.

## Attacks, props and effects

Required causal chain for every authored move:

1. Recognizable preparation and loaded body/limb.
2. Acceleration toward the contact path; reach/height matches authored active windows.
3. Readable contact silhouette and clean-hit versus block response.
4. Follow-through proportional to momentum.
5. Recovery visibly restores a controllable stance.

Coletazo is the reference for these distinct phases; do not copy its motion into unrelated attacks. Lengua must retract through its new recovery rather than returning visually idle while still unable to act. Fricción must show hands rubbing **before** heat and a two-palm shove at the final hit. With effects disabled, a viewer should still identify rubbing, throw, rush and jump.

Prop exclusivity: ball-in-hand only when not in flight and visually available; after timeout/owner-hit cancellation it reappears with the end of rearm, not as a duplicate. Cap-on-belt→in-hand→flight→opponent-head are exclusive states. A Clash or whiff clears flight/head attachment. Mirroring must keep “La 56” legible: draw shirt text in a locally unmirrored subpass, without changing body facing or attack side. A static glyph is allowed; a raster character is not.

Ultimate major-impact pose, hitstop and release event are aligned. Same release physics across characters can retain different attack silhouettes. Final nonlethal hits receive major-impact treatment too. On KO, use the event's finite visual exit pose/trail while authoritative captured state is already clear; no stale capture loop.

Keep existing budgets<=120 particles and<=6 per transient effect category. Cache static shapes only if profiling identifies cost. No new dependency, full-scene postprocessing, prerendered character sprites or enormous particle count to hide weak motion.

## Acceptance evidence and scope stop

For each fighter capture: forward/back walk start/steady/stop/wall, full jump strip, landing, standing/low/air contact, hit/block reaction, Ultimate start/capture/major impact/release/whiff. For Juanchi also outbound/turn/return/catch, all Fricción beats, cap-confirmation/rage/rush/barrage. Clash needs one clear clip for each kind pairing and both wall orientations.

Automated: pose idempotence, planted-foot diagnostic, phase monotonicity/reset, no snapshot mutation, anchor attachment consistency, no undefined render keys, injected fourth-fixture content, cadence equivalence and finite lifetime. Visual: full-body silhouettes at852×393 and667×375, both stages, with and without effects. Human: action physically recognizable, dark clothing distinct, jump feels responsive, no sliding or floating feet that dominates normal play.

Record evidence file paths, exact candidate SHA and phone/browser. A mocked canvas passing draw calls is not pixel approval. Keep a two-minute same-device stress comparison: target no >10% p95 regression versus V0.5; report absolute frame times as well. If baseline device cannot sustain60fps, do not pretend otherwise. Stop after required actions meet readability/physicality; elaborate idle, facial acting on every normal and wholesale old-rig reconstruction are later work.
