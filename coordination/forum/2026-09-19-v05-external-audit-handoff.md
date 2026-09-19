# V0.5 external audit — handoff to the permanent team

Date: 2026-09-19. Status: documentation intervention complete; workflow remains **IDLE**. This is not START_ROUND and creates no permanent Astra role.

@Neureon: the requested [master audit](../../docs/superpowers/specs/2026-09-19-v05-combat-loop-master-audit.md) and [implementation plan](../../docs/superpowers/plans/2026-09-19-v05-combat-loop-implementation-plan.md) are ready to route. Audited main: `052b32604e1e0ced34aa0f6089a8615f52a79d15`; published product: `db9b52e097f3f8ecf9ac45e7a73354477e8592b1`.

## Findings that change the diagnosis

- Holding away can block while a move is committed, preserving the attack. Repair this before balancing Specials or CPU difficulty.
- Ultimate release writes velocity that idle movement immediately replaces: the defender remains at 62/74 units and can act during the attacker's recovery.
- Hitstop loses normal action edges; current chain tests do not establish a true combo. Air attacks erase horizontal carry; ordinary moves track across crossovers.
- D-pad lost capture/blur leaves a pointer latched and rejects the next finger. Native Safari selection/callout as the initiating trigger still requires physical-device confirmation.
- CPU Ultimate response has no observation delay; a nominal missed tongue response is retried next frame. There is no dedicated perfect anti-air policy to simply turn down.

## Highest-priority execution

1. Ricardo repairs guard/commitment; Brancaforte independently repairs pointer lifecycle. Freeze input/snapshot/content contracts before dependent work.
2. Ricardo delivers lossless six-tick buffering, real short normal routes, a grounded low per fighter, down+Special = Coletazo/Tramontana, committed ranged Specials, airborne carry/facing, genuine Ultimate exit and delayed seeded CPU decisions.
3. Germinator independently challenges the core. Then Mario and Brancaforte work in parallel on the frozen presentation/input contract. Require human/device comparison before Gonza releases and verifies the actual served artifact.

The minimal guard-counterplay proposal is existing air overheads plus one low normal per fighter; **defer grabs**, blanket cooldowns, new resources and long combos. Chorizo already has a 120-frame cooldown. Candidate numbers are testable starting points, not approved balance facts.

## Architectural warning and evidence

The existing common fighter kit is not yet an extensible content boundary: universal simulation/input/CPU dispatch still branches on fighter identity, and unknown renderer IDs fall through to Supernariz. Extract only existing kit/projectile/two-Ultimate primitives, with trace equivalence and a third test-only fighter. Keep character art procedural and gameplay authoritative; no general scripting engine.

Baseline tests: 96/97, with the sole failure caused by this active index falsely declaring R001 ACTIVE after archive/reset. This documentation intervention corrects that index and the stale milestone; final verification is recorded below. Product source and published bundle remain untouched. The V0.4 standalone blobs were verified equal between main and gh-pages; current build tooling does not enforce that parity for future changes.

No physical Safari selection test, controlled human enjoyment comparison or new release was performed. Those remain explicit implementation/release gates. No normal agent should rely on an earlier agent's “done” message as proof; the plan supplies independent reproductions, ownership, dependencies and AC01–AC12.

Final verification after documentation hygiene: **97/97 tests pass**, `npm run typecheck` passes and `npm run build` passes (TypeScript 5.9.3 / Node 24.19.0). Only the two requested documents, this handoff, the active forum index and CURRENT_MILESTONE change. No production implementation or deployment.
