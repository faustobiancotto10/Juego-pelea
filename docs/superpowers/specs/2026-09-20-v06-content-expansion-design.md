# V0.6 — Three fighters, two stages, reusable content production

Date: 2026-09-20 (audit begun 2026-09-19). Implementation-ready recommendation; no production changes or round activation. [Audit/evidence](2026-09-20-v06-architecture-gameplay-audit.md) defines the exact V0.5 baseline. Neureon freezes this package before specialist execution; no future Astra gate.

## Product outcome and chosen approach

Ship **Juanchi as a complete third playable/CPU fighter**, a distinct second stage, physical locomotion across all three fighters and Universal Ultimate Clash. Targeted Lengua/Ultimate changes support those outcomes. Preserve procedural Canvas2D, fixed60Hz, four touch actions, keyboard fallback, current guard/Push Guard and short chains.

Options considered:

| Approach | Decision |
| --- | --- |
| Add third-name branches everywhere | Cheap first draft, expensive fourth fighter, copies existing projectile/effect assumptions; reject |
| Content packages plus three bounded primitive extensions | Choose: returning projectile, authored multi-contact move, cap capture; shared arbitration and animation helpers |
| ECS/behavior graph/plugin scripting/generic cinematic engine | Too much machinery for one new kit; reject |

Release scope is fixed to one fighter and one stage. Architecture supports arbitrary registered content counts; runtime still contains exactly two combatants. Ten-fighter readiness means validation/UI/render/CPU are not structurally limited to two, not that ten balanced rigs already exist.

## C1 — Character content composition

Create `src/game/data/characterContent.ts` and `src/game/data/characters/{camaleoni,supernariz,juanchi}.ts`. Each character module exports one plain typed package. Existing `fighters.ts`, `fighterKits.ts`, `projectiles.ts`, `ultimates.ts` and `simulation/moves.ts` remain compatible exports assembled from the package list; core callers use the registry. Move existing values without tuning in this extraction commit.

```ts
interface FighterPresentationDefinition {
  rigKey: string;
  ultimateVisualKey: string;
  accent: string;
  effectAccent: string;
  select: { kicker: string; role: string; moves: string; mark: string };
  rangedAvailabilityLabel: string | null;
}
interface CombatCharacterContent {
  fighter: FighterDefinition;
  kit: FighterKit;
  moves: Readonly<Record<string, MoveDefinition>>;
  projectiles: Readonly<Record<string, ProjectileDefinition>>;
  ultimates: Readonly<Record<string, UltimateDefinition>>;
  presentation: FighterPresentationDefinition;
}
```

The referenced existing definitions remain exported at their current paths. Character modules use **type-only** imports from them: no runtime import back into an assembled global table. No file loader, external JSON or reflection. Composition rejects duplicate fighter/projectile/Ultimate keys rather than silently overwriting them. Published order is the package-list order. `FighterId` and `RegisteredFighterId` become compatible string aliases; runtime `registry.playableIds` membership validates UI/route input. Do not cast an arbitrary DOM dataset to a trusted ID.

Combat registry keeps its six current lookup methods and owns cloned deeply frozen data. Presentation registry independently maps registered IDs to this plain metadata; it does not run simulation. Add `createFighterPresentationRegistry(packages)` and `getPresentation(id)`. At application boot validate every playable ID has kit, move references, presentation, rig, projectile visuals and Ultimate visuals. The render-owned `FighterVisualRegistry` exposes `getRig(rigKey):ProceduralRig`, `getProjectile(visualKey):ProjectileVisualHandler`, and `getUltimate(visualKey):UltimateVisualHandler`. A ProjectileVisualHandler draws `(ctx, projectileSnapshot, matchSnapshot)`; an UltimateVisualHandler draws `(ctx, fighterIndex, matchSnapshot, ultimateDefinition)`, returning void. ProceduralRig is defined in the animation contract. Missing handlers throw validation errors. Inject this visual registry for a test-only fourth rig instead of mutating global handler tables. Explicit static render-handler maps are legitimate composition points; arbitrary new art will always need a new function.

Validation must reject nonfinite/negative durations or dimensions, out-of-timeline active/spawn/sequence beats, duplicate hit IDs, invalid attack levels/kinds, missing chain targets, cyclic normal-cancel graphs, duplicate playable IDs, invalid probabilities and reaction buffers beyond their configured bounds. Signed velocities/offsets remain legal where explicitly documented. At least one final positive-damage Ultimate beat must exist. No functions in combat content definitions.

## C2 — Authored hit windows, not a combo interpreter

Preserve `MoveDefinition.hitbox?` for current moves. Add `hits?: readonly MoveHitWindow[]`, mutually exclusive with `hitbox`:

```ts
interface MoveHitWindow extends HitboxSpec { hitId: string; blockKnockback?: number }
```

Normalize a legacy hitbox to one window with hitId `single` at registry construction. All contact processing uses normalized windows. Each move instance owns a set of `(hitId, defenderIndex)` contacts; blocked contact consumes the same window as clean contact. A window can hit only once even over multiple active ticks. A new move instance clears its ledger. When blockKnockback is absent preserve the current knockback×0.35 rule; an authored override is absolute horizontal speed in the attack direction. Reject overlapping windows within one move in V0.6: no same-tick duplicate contact ambiguity. `moveContact` remains the aggregate contact result (clean hit takes precedence over block), not a per-render animation trigger. Existing hit-confirm chain behavior remains unchanged; Fricción has no chain cancel.

Process ordinary strike contacts from a shared pre-contact view, retaining V0.5 compatible trades. An earlier tick's hit interrupts startup. Multi-hit is local contact pressure, never a hidden projectile or free capture state. Per-beat damage/guard/meter derives from actual HP/guard changes. Keep current normal×0.15, special/projectile×0.10, received×0.055; no chip/Ultimate/Clash SUPER.

## C3 — Returning projectile extension

Keep the current linear behavior as `kind:'linear'`; add `kind:'returnToOwner'`. `ProjectileDefinition.key` remains the content ID, distinct from movement kind. Add `visualKey`, `cancelOnOwnerHit`, and a discriminated return configuration containing outboundTicks, turnTicks, returnSpeed, maxReturnTicks, catchRadius, rearmTicks, returnHit and minimumTicksBetweenLegHits. Existing Chorizo becomes linear, visualKey chorizo, cancelOnOwnerHit false; its120 cooldown and values remain unchanged.

Use the exact field `returnConfig` for the returning kind, absent on linear definitions:

```ts
interface ProjectileContactDefinition {
  damage:number; chipDamage:number; guardDamage:number;
  hitstun:number; blockstun:number;
  knockback:number; blockKnockback:number; hitstop:number; strong:boolean;
}
interface ReturningProjectileConfig {
  outboundTicks:number; turnTicks:number; returnSpeed:number;
  maxReturnTicks:number; catchRadius:number; rearmTicks:number;
  minimumTicksBetweenLegHits:number;
  returnHit:ProjectileContactDefinition;
}
```

Existing base contact fields describe the outbound leg. The returning definition's cooldown equals rearmTicks but starts on removal, not spawn. Existing linear cooldown still starts on spawn. Resolve simultaneous ordinary strike contacts first, then linear projectile contact proposals together, then returning projectile proposals together. A clean earlier-class hit cancels a returning ball before its contact. Two returning balls hitting their opposing owners in the same tick **trade**, then both cancel; neither slot wins by cancellation order. This explicit tie exception avoids a cyclic rule where each ball retroactively cancels the other. Preserve simultaneous linear-projectile trades as well.

The exact Rugby Boomerang numbers/rules are in [Juanchi §3](2026-09-20-v06-juanchi-character-contract.md). Runtime adds phase, phaseTick, previous position, per-leg contact ledger and flight age. Snapshot adds phase (`outbound|turn|return`, linear uses outbound), phaseTick, age, vy and visualKey. Publish `projectile-turn` and `projectile-catch` events with projectileId/owner. Do swept contact from previous to next position; no tunneling and no render-owned path.

Add to FighterSnapshot `rangedAvailability: 'ready'|'inFlight'|'cooldown'` and `rangedRecoveryFrames:number`. Chorizo maps existing cooldown; Juanchi maps active owned ball then rearm. UI reads these fields; does not infer ability legality from a rendered prop. A cooldown/in-flight-rejected command is consumed without restarting recovery or freezing a move.

One active returning ball per owner. Same projectile ID persists through turn and return. Pauses/hitstop freeze path/age. Owner clean hit, capture, Ultimate start, Clash, KO or round reset clear its ball with the rearm policy in Juanchi. Chorizo's ordinary owner-hit persistence is preserved; capture/Clash/terminal cleanup removes all encounter projectiles as explicitly specified below.

## C4 — Ultimates, release, Clash and ordering

`UltimateKind` adds `capCapture` with an exhaustive switch; an unknown kind throws during registry creation. Add `FighterDefinition.captureHead:{standY:number;crouchY:number;halfWidth:number;halfHeight:number}` as a **simulation-authored cap target**, separate from ordinary hurtboxes. Initial cap-seat heights: Camaleoni194/180, Supernariz209/195, Juanchi205/191 (standing/crouching), halfWidth26/halfHeight22. This small explicit region is needed because existing drawn heads are well above their ordinary logical hurtbox tops118/122. Do not enlarge all hurtboxes or make renderer anchors decide capture. Mario aligns the cap-seat pose to this region and tests its overlay. Add cap travel parameters and optional `sequenceApproach:{startFrame:number;endFrame:number;standOff:number}`. Existing kinds keep current anchor behavior. Juanchi pins the captured target in world space and approaches only during the authored rush; no teleport to the caster during the rage pose.

Expose `FighterSnapshot.ultimateEffectiveTick:number|null` and `ultimateProbe: {x:number;y:number;previousX:number;previousY:number;halfWidth:number;halfHeight:number;visualKey:string}|null`. Probe is simulation-owned, non-damaging and separate from ordinary projectiles. Reset on cancellation/capture/terminal. Preserve ultimatePhase, phaseFrame, connected, target and capturedBy. Expose the target anchor needed by the Juanchi sequence as `captureAnchorX:number|null`; renderer never invents capture position.

Extend hit events with optional moveId/hitId (ordinary contacts), projectileId/leg (projectiles) and `majorImpact:boolean`. Keep finisher meaning KO for compatibility. Major impact marks the final authored Ultimate beat whether lethal or not. `ultimate-capture` is the cap-landing confirmation; `ultimate-release` occurs on the final damage tick, after that damage. Add dedicated `ultimate-clash`; never disguise Clash as hit/damage events. The [Clash contract](2026-09-20-v06-ultimate-clash-contract.md) defines its state, geometry, exact window and priority.

Ultimate candidates:

| Definition | V0.6 candidate | Preserved constraints |
| --- | --- | --- |
| Camaleoni | startup18, capture10, final hit/release at sequence16 | speed18, reach138, vertical82, hits70+120, whiff24 |
| Supernariz | startup24, capture20, suction14, final hit/release at sequence14 | field330, capture90, vertical96, damage190, whiff28 |
| Juanchi | startup20, cap travel<=20, sequence40 with final release at40 | full contract in character document |
| All successful releases | separation200, vx14, vy5, hitstun30, attacker recovery16, final hitstop12 | Same release helper, opposite facing reflection, no self-refund |

These improve timing/presence without larger damage or automatic capture. Keep the rig's tell legible even for near-invisibility. No homing behind a caster, no guaranteed capture from neutral, no full-screen grab, no immunity during startup/capture. At close range, interruption/backdash/crossover may be the appropriate answer instead of jump; at mid-range there must remain a reproducible jump or retreat answer. Calibrate after two-tick jump preparation and common arbitration, not only from old probes.

Sequence capture remains exclusive and guaranteed. On capture confirmation, clear both ordinary projectiles to avoid ambiguous off-screen assistance; record this intentional change for Chorizo. Sequence ignores incoming ordinary damage to participants. On final KO, perform release/event cleanup before entering the result state; carry a bounded visual exit pose from that event so the launch is visible without continuing combat or retaining captured state.

## C5 — Movement and reusable presentation

Add `jumpStartupFrames:number` and `airborneTicks:number` to FighterSnapshot, and `jump-start`/`takeoff` events. On accepted jump at J0: grounded preparation counter2, vx/vy0, no attack/guard/dash/Ultimate; on J1 counter1; at J2 counter0, apply the authored jump velocity, integrate takeoff once. A normal hit interrupts preparation. Cache direction at acceptance for takeoff carry; no extra held-jump repetition. Existing air steering resumes after takeoff when not in an air attack. Reset counters on capture/hit/terminal. Landing remains four ticks; no new landing lag.

This intentionally adds33ms grounded preparation so a jump physically prepares before takeoff instead of pretending an already airborne body is still loading its legs. Human responsiveness is a gate: if rejected, Neureon may authorize a one-tick version and rerun timing tests; never remove the visible phase while claiming compliance.

[Animation contract](2026-09-20-v06-animation-quality-contract.md) owns the shared pose sampling, foot planting, prop anchors, effect clocks, quality matrix and Mario's work. Consumers use matching injected registries; they cannot change hurtboxes to fit an attractive pose.

## C6 — CPU stays fair and becomes content-aware

Retain12-tick observation delay, eight-tick decisions, seeded misses/commitments and own-contact confirmation. Replace remaining policy constants with optional `FighterKit.cpu.tactics:CpuTactics`, defaulting exactly to current behavior during extraction:

```ts
interface CpuTactics {
  ultimateRange:readonly [number,number];
  rangedRange:readonly [number,number]; rangedChance:number;
  closeWeights:Readonly<Record<'standing'|'low'|'closeSpecial'|'jump'|'retreat',number>>;
  advanceBehindReturningProjectile:number;
  retreatAtPreferredRange:number;
}
```

These fields describe:

- allowed Ultimate distance interval;
- ranged-attempt distance interval and probability;
- close choices: standing/low/closeSpecial/jump/retreat weights;
- `advanceBehindReturningProjectile` probability;
- `retreatAtPreferredRange` probability.

Validate weights finite/nonnegative with positive sum. Existing pressure/control distinction may remain as two defaults; do not add `if id==='juanchi'`. Juanchi's profile uses mid-range preferences and available-ball state. Own resource legality can be current; opponent position/projectile phase must come through delayed public observations. A return-leg cue has key `(projectileId,return)` and gets exactly one recognition decision; do not reroll missed cues each tick or treat every ball direction update as a new threat. No reactive Clash button policy: CPU may independently choose an offensive Ultimate, allowing incidental Clash.

## C7 — Stage boundary and stage 2

Add `src/game/render/stages/stageRegistry.ts`, `TramontanaStage.ts`, `Cancha56Stage.ts`. Extract existing StageRenderer body unchanged as stage ID `tramontana-dusk`, label “Tramontana”. Stage2 ID `cancha-56`, label “Cancha 56”: evening neighborhood rugby training ground, painted touchline, distant posts/fence, low bleachers, restrained warm floodlights and navy sky. Keep the combat plane clear; no foreground fence across feet, loud scrolling signs or crowds competing with silhouettes. Black clothing must remain separable from the background.

```ts
type StageId = string;
interface StageDefinition {
  id: StageId; label: string; thumbnailAccent: string;
  draw(ctx: CanvasRenderingContext2D, presentationTick: number): void;
}
interface StageRegistry {
  ids: readonly StageId[];
  get(id: StageId): StageDefinition;
}
```

Stage registry is **render-owned**. `FightRenderer(canvas,{combatRegistry?,presentationRegistry?,visualRegistry?,stage?})` receives a StageDefinition. Default stage preserves old callers. CombatSimulation takes no stage option, never imports stage modules and retains arena bounds90..1190, logical1280×720 and floor y565 presentation mapping. Rematch retains selected stage; selection defaults to Tramontana. A compact stage selector on the rival-selection screen avoids another mandatory flow screen. Store stage selection in GameFlowState, separate from combat snapshot/replay.

No stage hazards, collision, camera zoom, weather mechanics, moving floors, per-stage balance or stage-specific CPU. Test identical inputs/seeds on both environments yield byte-identical simulation traces. Render palettes and props may differ; game truth may not.

## Acceptance and exclusions

| ID | Release requirement | Evidence |
| --- | --- | --- |
| V6-01 | Juanchi selectable as player and CPU, all9 ordered matchups complete and rematch | Automated + mobile smoke |
| V6-02 | Boomerang at most one hit per leg, visible turn/return/catch, position-dependent opportunity and punishable owner | Deterministic fixtures + human readability |
| V6-03 | Fricción is a visible hand-driven three-contact pressure action, finite exits, no projectile | Contact tests + frame strip/video |
| V6-04 | Cap landing is sole capture confirmation;190 damage only afterward, whiff/interrupt costs correct | Both slots/walls + human sequence review |
| V6-05 | Clash timing/priority/mirror/cleanup contract passes all3×3 pairings | Automated, then staged visual trigger |
| V6-06 | Repeated Lengua allows measurable block/avoid-and-advance; Coletazo baseline unchanged | Multi-cycle scenarios + user's rematch assessment |
| V6-07 | All three Ultimates have bounded escape options and identical successful launch rules | Delay/distance corpus + actual mobile play |
| V6-08 | Walk/jump satisfy physical-action contract for all three rigs | Pose/clock tests + pixel/video signoff |
| V6-09 | Two stages selectable; traces invariant; both remain readable | Automated + phone review |
| V6-10 | Fourth synthetic package runs selection/render/CPU/mechanics without universal identity branches;3/5/10 roster layouts usable | Integration fixture + viewport tests |
| V6-11 | Validation rejects malformed data; identical seeds/inputs repeat; no raster fighters | Automated + code/art inspection |
| V6-12 | Exact source→standalone→preview/release parity, full tests, independent QA, recorded device evidence | Gonza + Germinator |

Do not build yet: fighter4 content; online/rollback; ECS; scripting language; general animation editor/retargeter; generic status stack; arbitrary projectile curves; throws/tech/parry; long combos/juggles; manual charge; air Specials; new action buttons; unlock/progression economy; stage hazards; cinematic video; runtime raster reference assets; a broad redesign of successful Coletazo/UI.

Human testing is focused, not endless polish: Juanchi versus each original fighter in both roles, both stages, then short replays of reported Lengua and Ultimate issues. If a required mechanic remains unclear/unfair, repair that mechanic. Do not expand scope to compensate. Automate scenario coverage; do not present a tiny bot win-rate sample as proof of fun or roster balance.
