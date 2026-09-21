# Decisions

- 2026-09-18: Keep a renderer-independent fixed 60 Hz combat simulation as the single gameplay authority.
- 2026-09-18: Reconstruct fighters as procedural articulated vector rigs; supplied images/sheets are visual references only and never runtime fighter sprites.
- 2026-09-18: Use dependency-free Canvas2D + TypeScript + browser ES modules. The earlier Phaser proposal is superseded because dependency installation was unavailable; simulation/input/data boundaries remain renderer-independent.
- 2026-09-18: Mobile controls remain 8-direction D-pad + Attack + Special + Jump. No new persistent action buttons are added in V0.2.
- 2026-09-18: Holding away means backward movement first; when a compatible strike arrives, the same input becomes guard. Down+away is crouch guard.
- 2026-09-18: Defense is limited by a dedicated GUARD meter rather than a universal stamina bar. GUARD drains only on blocked hits, regenerates after a delay, and zero causes a short guard break.
- 2026-09-18: Double-tap direction produces dash/backdash. Backdash has only a short strike-evasion window and does not universally evade projectiles.
- 2026-09-18: Combo cancels require contact (hit or block). Whiffed light attacks must complete recovery instead of allowing free mash chains.
- 2026-09-18: CPU decisions use reaction thresholds and short commitment windows so it cannot switch from offense to perfect defense every frame.
- 2026-09-18: Text-heavy help remains DOM UI. Opening the controls panel during a fight pauses simulation; combat truth remains outside the UI layer.

- 2026-09-19: V0.3 uses a common fighter-kit structure: melee, long-range special, close-range special, ultimate, plus universal movement/defense. Mechanical differences require explicit tradeoffs rather than free advantages.
- 2026-09-19: The fighter formerly displayed as Camaleón is renamed **Camaleoni Cagoni**, normally shortened to **Camaleoni** in UI. Stable internal IDs may remain unchanged when migration would add risk without player benefit.
- 2026-09-19: Camaleoni's long special is Lengua and close special is Coletazo. Supernariz's long special is Chorizo and close special is Tramontana.
- 2026-09-19: Melee reach stays within a comparable band. Meaningful reach advantages must be offset by startup, recovery, damage, knockback, cancelability or another observable cost; Supernariz must not retain uncompensated close-range and long-range superiority.
- 2026-09-19: V0.3 adds one-charge SUPER meter primarily from damage dealt and received. No passive/manual charging.
- 2026-09-19: Ultimates are unblockable forward capture attacks with finite considerable range. Position, range or crossing behind can evade before capture; after capture the sequence is guaranteed. A committed miss consumes meter and has recovery.
- 2026-09-19: Camaleoni's ultimate is an invisibility/near-invisibility forward dash capture into a guaranteed combo. Supernariz's ultimate is forward suction into a heavy nazazo and large launch.
- 2026-09-19: V0.3 adds corner pushback transfer and Push Guard using existing controls; no fourth persistent mobile action button is added.

- 2026-09-19: V0.3 SUPER baseline is cap 100, +0.12 per actual HP dealt and +0.055 per actual HP received; no passive gain, GUARD-only damage gives no SUPER, HP chip contributes normally. SUPER persists across rounds inside one match and resets for a new fight instance.
- 2026-09-19: Push Guard baseline costs 34 GUARD, buffers for 6 fixed-step frames through hitstop/block context, and authors 122 units of separation. Neutral, Guard Break and insufficient-GUARD requests are rejected by simulation.
- 2026-09-19: Ultimate meter is consumed at startup→capture commitment, not at initial startup. Pre-commit interruption preserves meter; committed whiffs consume it. Both V0.3 ultimates use a 190 total-damage band.
- 2026-09-19: Final mobile Ultimate input is READY-only ATTACK+SPECIAL with a 55 ms chord window; outside READY, ATTACK and SPECIAL remain immediate. Defensive SPECIAL routes an exclusive Push Guard intent from simulation-owned defensive context.
- 2026-09-19: V0.3 first-normal reach is intentionally near-equal (Camaleoni authored edge 86, Supernariz 88), with Supernariz retaining a small speed/tempo edge and Camaleoni compensating via damage/stun/knockback/cancel advantages.

- 2026-09-19: V0.4 replaces the touch Ultimate chord with a dedicated mobile **ULTIMATE** button. Touch activation emits one exclusive `ultimate` intent and must work while directional input remains held; desktop J+K may remain as compatibility fallback.
- 2026-09-19: `FighterSnapshot.capturedBy` is authoritative capture/trapped presentation state. Renderer/UI consumers must not infer capture from geometry, and terminal round/match transitions clear transient Ultimate/capture/move state before result phases.
- 2026-09-19: Supernariz CPU keeps the pressure identity but now uses deterministic post-commit gaps, imperfect chain conversion and skipped optimal cadence opportunities so it cannot immediately restart perfect pressure.
- 2026-09-19: Camaleoni V0.4 close combat is strengthened through reach/recovery/hit-confirm compensation and a lower-commitment Coletazo while Supernariz retains the faster first-button tempo and pressure-chain identity.
- 2026-09-19: Coletazo and both Ultimates use richer procedural Canvas2D presentation driven by authoritative simulation state; visual complexity may not add gameplay truth or runtime reference sprites.

- 2026-09-19: V0.5 scope is founded on repairing combat commitment and input/state invariants before balance tuning. A fighter may not block during its own committed offensive move; action edges must survive hitstop/render sampling; airborne attacks must preserve authored carry; Ultimate exit must create simulation-owned separation.
- 2026-09-19: V0.5 keeps the existing four mobile action buttons and uses a simple universal grammar: ranged Special on neutral/forward + SPECIAL, close Special on down/down-forward + SPECIAL, one grounded low on down + ATTACK, and dedicated ULTIMATE. Camaleoni low tongue leaves the selectable kit.
- 2026-09-19: V0.5 deliberately defers throws/grab-tech, blanket large cooldowns, new universal resources, long combo systems and a generic fighter scripting engine. Existing air overhead + one grounded low per fighter is the first guard-counterplay experiment.
- 2026-09-19: CPU reactions in V0.5 must use deterministic delayed public-snapshot perception with latched misses and commitment; immediate current-frame reaction retries are not acceptable.
- 2026-09-19: Before adding playable fighters, V0.5 extracts only the bounded current fighter-kit/projectile/Ultimate content boundary needed to remove identity hardcoding. A third test-only kit validates scalability without becoming selectable.

- 2026-09-20: R004/V0.6 uses exact product base `2d8c41dc994c8cddaa4c9fe2b3ee957698e94f13`; main remains live coordination/document authority until accepted V0.6 integration/release.
- 2026-09-20: R004 executes in `AUTO_CHAIN`: one round start preauthorizes the dependency graph. Green handoffs unlock downstream tasks without PRESENT/check-in or per-stage Neureon approval. Blockers/contract or scope changes are reported to the user, who decides whether Neureon audits/replans.
- 2026-09-20: Juanchi is the V0.6 third playable/CPU fighter. The supplied identity master governs likeness/outfit/proportions; the supplied action sheet guides pose/action language. Reference rasters are authoring-only and never runtime fighter sprites/textures.
- 2026-09-20: Cancha 56 is a presentation-only night rugby-field gathering: visible posts/fence/floodlights plus restrained clusters of spectators and subtle party/ambient movement. The central fight corridor must remain readable; no crowd or prop affects simulation.
- 2026-09-20: V0.6 front-end flow is `TITLE/COVER → FIGHTER SELECT → OPPONENT SELECT → STAGE SELECT → VS → FIGHT → RESULT`, with a dominant `COMENZAR` entry action, scalable roster UI, two selectable stages and rematch retaining selections.
- 2026-09-20: V0.6 stage/UI architecture must scale structurally beyond two fighters; metadata-only 5/10 roster fixtures and a fourth synthetic package verify this without shipping a fourth playable fighter.
- 2026-09-20: Canonical R004 specialist order is **Ricardo → Germinator → Mario + Brancaforte → Gonza**. Germinator audits Ricardo's completed gameplay/core candidate before presentation/UI work. Mario and Brancaforte then execute in parallel. Gonza performs no early integration/preparation; he is the final integration/release role.

- 2026-09-20: V0.6 is the official published release from main product merge `60f30d4a100f3d853e2408e3eee7bbde4e2170fe`, with Pages publish `93d2fdd6f4b764a49fa70ad1ff6ac1f348fb85cc`. R004 is archived and no implementation round is currently active.
- 2026-09-20: Post-release human playtest evidence is not overridden by green automated QA. The next audit must address Lengua dominance, weak CPU/difficulty, Juanchi locomotion quality, attack/effects presentation quality and requested fourth fighter El Toro.

- 2026-09-20: V0.7 is bounded around five post-release problems: Lengua counterplay, CPU difficulty, Juanchi locomotion, attack/effect quality, and El Toro as fighter four; fighter-select cards also gain procedural in-game portraits/icons.
- 2026-09-20: V0.7 CPU difficulty ships exactly Easy/Normal/Hard with Normal default. Difficulty changes fair delayed policy quality only; it never grants current raw input, future state, fighter stat boosts or illegal resources.
- 2026-09-20: El Toro is a heavy bruiser/line-breaker. Shawarmazo reuses the linear projectile lifecycle; Topete uses a bounded data-driven committed-movement Special primitive; Super Eructo introduces one bounded non-capture `forwardBlast` Ultimate primitive and participates in Universal Ultimate Clash.
- 2026-09-20: Fighter-select portraits/icons are procedural game representations keyed by presentation metadata. Uploaded/source character references remain authoring-only and may never be cropped/loaded into runtime cards.
- 2026-09-20: V0.7 does not add an El Toro stage, fifth action button, generic ECS/scripting/animation graph, online/story/shop systems or a long-combo redesign.

- 2026-09-21: After R005/V0.7 closes, fighter body presentation is approved to migrate from procedural articulated rigs to derived sprite animation packages. Source/reference sheets remain authoring-only; production sprites are normalized derived assets.
- 2026-09-21: The sprite renderer remains strictly presentation-only. Existing deterministic 60 Hz simulation owns all hitboxes, damage, move legality, stun, projectiles, CPU and Clash truth.
- 2026-09-21: Temporary procedural/sprite dual rendering is allowed only as a migration mechanism. Final production cutover requires all currently playable fighters to pass the sprite-body acceptance contract; no permanent mixed-art roster is intended.
- 2026-09-21: Character/content growth should extend declarative character packages and reusable bounded gameplay primitives rather than central fighter-ID conditionals.
- 2026-09-21: New game modes should be isolated behind explicit mode contracts rather than widening conditionals inside the normal fight scene; the exact mode API is deferred until the first new mode is specified.
- 2026-09-21: Durable agent identity is separate from temporary chat instances. Any role may scale to multiple isolated lanes when work is safely separable, with one integrated candidate before downstream QA.
- 2026-09-21: Identity Learning Review is a mandatory closeout step for every meaningful agent task/session. The review may validly yield NO_CHANGE; skipping the review is invalid.
- 2026-09-21: Repository tool policy can route Superpowers, Game Studio and Game Development Studio when available, but cannot assert host capability availability. Missing required capability is reported as TOOL_UNAVAILABLE.
