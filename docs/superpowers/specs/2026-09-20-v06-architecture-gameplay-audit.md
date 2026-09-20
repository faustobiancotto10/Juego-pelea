# V0.6 architecture and gameplay audit

Date: 2026-09-20 (audit begun 2026-09-19). External expert intervention, requested by the user. Documentation only; no permanent Astra role and no activation of the team.

## Verdict

**V0.5 is a credible simulation foundation, not yet a complete character-production system.** A third fighter using existing primitives works in tests. A third selectable, animated fighter with new primitives does not arrive through that same boundary. Juanchi is the right next deliverable to expose and close those gaps. Do not spend another round polishing the original two characters without shipping content.

V0.6 should ship three fighters, two presentation-only stages, a narrowly defined Ultimate Clash, reusable locomotion animation and a validated Character Package. Its architecture work must directly support those deliverables. Preserve successful Coletazo, normal chains, input recovery, delayed CPU perception and deterministic simulation.

## Evidence and actual product state

| Surface | Exact audited state |
| --- | --- |
| Coordination/main | `753d3aa4d6abe1e6da1683d4d069848c4ac4e8ac` |
| Integrated V0.5 product | `2d8c41dc994c8cddaa4c9fe2b3ee957698e94f13` |
| Independently tested V0.5 QA composition | `2876f3bce7d77c04c7415df89cafcf8b31f1b61c` |
| Difference between those product/QA SHAs | Only `tests/v05-g2-integrated.test.mjs` |
| Pages branch | `d6cdfdb5990051d3ef2cfb36d4970862943da420` |
| V0.5 preview blob | `f60818093c2e850cbdf8ed58182d0df02d27f180`, `v05-preview/index.html` |
| Official root release | Still V0.4, blob `d651bc064b25fc55a12f2b87be2c83a8ab0573d0` |

Source references below are against the V0.5 QA composition, **not main's older product files**. Main contains operational coordination and the previous audit; product integration/release is unfinished. R003 remains ACTIVE at integrated-experience validation. Its tail paragraphs, milestone and active-index descriptions contain stale stage information. DIRECT_START is already in the protocol, but a later paragraph still says every later-stage role must check in. Neureon should resolve that contradiction when opening the next execution round.

Read: root rules/DECISIONS; R003 tasks, accepted handoffs and contract/QA/release evidence; registry/data, simulation/CPU, input/UI, all renderer modules, automated tests and release workflow. Earlier R001/R002 decisions were checked against the delivered V0.5 changes rather than assumed authoritative implementation.

Independent verification in this intervention:

- Exact QA composition: **206/206 tests PASS**, typecheck PASS, build PASS, TypeScript 5.9.3 / Node 24.19.0. Compiler installed outside the project; no product dependency changes.
- Temporary Node probes used unchanged compiled simulation and injected copies of registry data. No probe or production changes are part of this documentation commit.
- Confirmed root/preview Git blob identities and source/QA difference above. Did not re-certify HTTP delivery or physically test Safari.
- The user's current playtest is new human evidence: better V0.5, oppressive Lengua, primitive locomotion, insufficient Ultimate presence/avoidance challenge. It is not a completed device/performance checklist. No controlled new human comparison or new pixel-quality certification is claimed here.
- No Juanchi master/pose reference was found in the audited main or exact V0.5 composition. The written identity is authoritative for planning; final likeness remains dependent on the promised asset arrival. Do not invent a reference approval.

Evidence labels: **Confirmed** means inspected/reproduced; **Candidate** means a specific testable design; **Human gate** means automation cannot establish it.

## What V0.5 really fixed

`CombatSimulation.canBlock` now rejects offensive commitment. Six-tick commands survive hitstop; down Special/low grammar exists; chains require clean contact; air normals retain horizontal carry; facing is locked; launch release is deferred after both fighter updates. CPU has delayed public observations, seeded misses and commitments. Registry injection exercises third-kit stats, normal range, projectile damage/cooldown and a reused Ultimate primitive. Explicit missing-rig presentation replaces the old silent Supernariz fallback.

These are delivered improvements, not reasons to rebuild the engine. `FighterIndex = 0 | 1`, two combatants, opposite-index calculations and two round-win slots are legitimate **match** assumptions; they are not two-character roster defects.

## Expansion findings

| Finding | Evidence | Minimum response |
| --- | --- | --- |
| Released roster remains closed | `types.ts:1`, `combatRegistry.ts` playableIds, `fighters.ts` require the two-ID union; `AppController.ts:13` duplicates copy | Validated string IDs, one released content composition, data-owned selection metadata |
| Renderer extensibility is partial | `FighterRenderer.ts` explicit RIGS is good; alpha still hardcodes chameleon. `FightRenderer.ts:319–375` filters to two IDs and duplicates timings | Explicit visual-key handlers and injected readonly content; preserve character-specific art functions |
| Every projectile looks like Chorizo | `FightRenderer.render` invokes `drawChorizo` for every snapshot projectile | Projectile visual-key map; unknown key fails validation, no sausage fallback |
| Presentation ignores injected content | `PresentationPose.ts` imports global `getMoveDefinition`; FighterRenderer imports global ULTIMATES | Pass matching registry to render helpers; fourth fixture must render as well as simulate |
| Missing boomerang lifecycle | `ProjectileState` only adds TTL; `updateProjectiles` always linear and deactivates on first hit | Add one bounded return-to-owner kind with per-leg contact ledger and explicit owner interruption rules |
| Missing ordinary multihit | `MoveDefinition.hitbox` singular; `moveHasHit` suppresses all further contacts | Authored hit windows with unique hit IDs; maintain single-hit compatibility |
| Ultimate dispatch is unsafe to extend | `updateUltimate` routes dashCapture, otherwise suctionCapture | Exhaustive kind dispatch; add only capCapture; separate simultaneous arbitration from per-fighter update |
| Slot-biased capture exists | Same-kit simultaneous Ultimate at x500/620 always captures for slot0; current test checks determinism, not fairness | Common proposal/arbitration pass plus Clash, with mirrored negative cases |
| Registry validation is incomplete | Validates references, not finite numbers/timeline domains; Object.freeze only covers facade/playable list | Clone/freeze owned definitions; validate frames, references, hit IDs, dimensions, policies and cancel acyclicity |
| CPU has two policies, not identity-free behavior breadth | pressure/control archetypes, hardcoded distances105–300,360,145; projectile observed once by ID | Data weights/ranges for existing choices, returning-leg cue, own-ball availability; retain reaction limits |
| No stage boundary | Single `StageRenderer.drawStage(ctx,time)` called directly | Two-entry stage registry and injected draw function; no simulation stage parameter |
| Selection assumes two large cards | `src/styles.css:25` repeat(2), full-height cards, copy “Dos estilos” | Compact scrolling roster strip/grid tested with3/5/10 entries; no full menu redesign |

The invalid-data probe accepted `claw1.totalFrames = NaN`; mutating the supplied fighter record after registry creation changed its walkSpeed to999. Those are **content-integrity risks**, not a claim that the shipped data is currently NaN or being mutated during normal play.

## Lengua: why a punish fixture was insufficient

Current Lengua: active12–14 / total38, reach edge374 plus defender half-width, damage80, hitstun18, blockstun12, knockback7.4, hitstop6. No cooldown. Its initial clean-hit knockback integrates to about49 units over18 ticks with0.86 decay; blocking also moves the defender, while holding away walks backward whenever blockstun ends. This repeatedly gives back approach space. The CPU's pressure approach/defense pattern compounds the problem.

G2 proved a close jump-read punish at distance100. That does not establish a practical approach from distance350. G2 itself recorded Camaleoni advantage and left this as a human risk. The user has now supplied that missing negative evidence.

Temporary isolated probe: Camaleoni x500, Supernariz x850; repeat Special whenever idle, no Ultimate/CPU; defender holds away while visible Lengua moveFrame<=14, otherwise walks toward. Stop when center distance<=115 or after500 calls. The policy uses exact visible timing and is an opportunity measurement, not a human-performance estimate.

| Injected data | First melee range, combat ticks | Blocks / clean hits before range | Defender HP |
| --- | --- | --- | --- |
| V0.5, total38 / knockback7.4 | Not reached within500 calls | 10 / 1 | 880 |
| Total46 only | 228 | 5 / 0 | 980 |
| Knockback4.8 only | Not reached within500 calls | 10 / 1 | 880 |
| Total46 + knockback4.8 | 189 | 4 / 0 | 984 |

Control case: simply walking forward into baseline Lengua reached melee range at163 combat ticks but took four clean hits (320HP). Approach is not physically impossible; the safer read/block route is poorly rewarded.

Candidate: total46 and knockback4.8, preserving active frames, reach, damage and meter. This is recovery after an attempt, not an arbitrary independent cooldown. It leaves Lengua the longest immediate control tool. Coletazo remains the stronger physical reset. Verify both facings, walls, modestly late human-like responses, retreating casters and new matchup before accepting. Getting hit may still lose ground; successfully avoiding/reading must buy progress. Do not force unsafe walking into attacks to be optimal.

## Ultimates: counterplay and payoff are different problems

Both current definitions already share releaseSeparation200, vx14, vy5, hitstun30 and successful recovery16. Existing tests independently rerun here cover both slots/center/walls and >=200 separation by attacker actionability. **The old missing-launch defect is fixed.** Do not report unequal simulation launch without new evidence.

Presence remains weaker because major impact and release are separated by eight advancing sequence ticks: Camaleoni hit16/release24; Supernariz hit14/release22. Final-impact `hit.finisher` currently means KO only, so a nonlethal final beat has no explicit major-impact identity. Rendering duplicates timing and identity logic.

Avoidance is not uniformly easy. Probe: same-kit opponent, x500 and x500+d, Ultimate at call0; one stationary jump at each delay0..24, then neutral for100 calls. No jump at all misses Camaleoni at300: its dash's finite total reach is insufficient there. At120, Supernariz captures every tested stationary-jump timing; at240/300, many jumps evade.

| Caster / distance | V0.5 successful jump-avoid delays |
| --- | --- |
| Camaleoni120 | 1–14 |
| Camaleoni240 | 3–19 |
| Camaleoni300 | 0–24 (range also causes misses) |
| Supernariz120 | None in this one-action fixture |
| Supernariz240 | 9–24 |
| Supernariz300 | 4–24 |

Rejected experiment: changing Supernariz startup24→20 alone made all25 jump delays escape at300. Shorter startup shifted the suction window away from the defender's landing. “Faster = harder to avoid” is false here.

More promising isolated candidates: Camaleoni startup18/capture10; Supernariz startup24/capture20/suction14. At240, jump-avoid intervals became1–15 and13–23 respectively; both retain escape timings. At300, they became1–18 and9–24. These probes do not validate the future two-tick jump preparation or new arbitration ordering: rerun the whole matrix after those changes. Preserve finite capture height, locked direction and interruptible pre-capture commitment.

## Animation diagnosis

V0.5 has ascent/apex/descent/landing scalars, so “there is no jump animation” would be inaccurate. But it has no preparation state or visible leg-driven departure. Feet remain largely at fixed local offsets while a sine moves knees. Walk phase uses time plus x, not planted-foot travel; sliding and weightless motion are structurally unsurprising. `snapshot.frame/60` still advances during hitstop, so pose oscillators can move inside a freeze even though transient effects are now cadence-safe.

Keep Coletazo's articulated preparation/contact/follow-through/recovery. Apply that causal standard to locomotion and Juanchi, using shared pose contracts rather than copying entire rigs. Pure snapshot/mocked-canvas tests do not prove weight, recognizable identity or convincing Fricción. Require frame strips/video and human inspection at phone size.

The cap also exposes the existing render/collision height mismatch: drawn head centers are around155/170 above feet, while ordinary hurtboxes end118/122. A body-height probe followed by a cap suddenly appearing on the head would violate the new physical-action rule. The design therefore adds one small authored head-capture region, without enlarging normal hurtboxes or sourcing gameplay from render anchors.

## Scope and process warning

Do not reopen every V0.5 system. Content is the release anchor. Use small contracts to allow Ricardo's gameplay and Mario's rig/stage work in parallel; Brancaforte can implement roster/stage UX against fixtures; Germinator can author independent matrices before integration. Gonza should prepare reproducible packaging early, rather than waiting until the end to discover that `npm run build` never regenerates `play.html` and CI installs TypeScript latest.

No new round is activated here. Neureon must reconcile R003's outstanding evidence and choose/document an exact V0.6 base; the new planning request does not itself certify V0.5 release. See [design](2026-09-20-v06-content-expansion-design.md), [Juanchi](2026-09-20-v06-juanchi-character-contract.md), [animation](2026-09-20-v06-animation-quality-contract.md), [Clash](2026-09-20-v06-ultimate-clash-contract.md), [package pipeline](2026-09-20-v06-character-package-pipeline.md) and [implementation plan](../plans/2026-09-20-v06-content-expansion-plan.md).
