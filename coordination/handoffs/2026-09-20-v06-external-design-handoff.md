# V0.6 external architecture/design handoff

Date: 2026-09-20. From: external expert intervention. To: @Neureon and the existing specialist team. Status: **DOCUMENTATION_READY**. No permanent Astra role, no DIRECT_START/START_ROUND issued by this handoff, no V0.6 production implementation.

## Read first

1. [System design and V6-01..12 acceptance](../../docs/superpowers/specs/2026-09-20-v06-content-expansion-design.md).
2. [Staged ownership/execution plan](../../docs/superpowers/plans/2026-09-20-v06-content-expansion-plan.md).
3. Assigned specialist contract: [Juanchi](../../docs/superpowers/specs/2026-09-20-v06-juanchi-character-contract.md), [animation](../../docs/superpowers/specs/2026-09-20-v06-animation-quality-contract.md), [Clash](../../docs/superpowers/specs/2026-09-20-v06-ultimate-clash-contract.md), [Character Package](../../docs/superpowers/specs/2026-09-20-v06-character-package-pipeline.md).
4. [Audit with source findings and measured experiments](../../docs/superpowers/specs/2026-09-20-v06-architecture-gameplay-audit.md) when checking causes or historical claims.

## Architectural conclusion

V0.5's registry genuinely supports another simulation kit. It does not yet supply end-to-end roster production: playable IDs, UI copy/resource HUD and shared effects retain two-character assumptions; every projectile is drawn as Chorizo; injected content does not reach all presentation lookups. The old missing-rig fallback was already fixed: preserve that improvement.

Extend only what Juanchi needs: typed character composition/validation, per-hit move windows, returning projectile, cap capture, common Ultimate arbitration, explicit render keys and a two-entry stage registry. A fourth synthetic package must pass UI/render/CPU as well as mechanics. No generic scripting/animation engine.

## Highest-impact decisions

- Ship Juanchi and Cancha56, not another polish-only round. Use his written complete move/ball/Fricción/cap contract; final art likeness awaits the actual promised reference master.
- Lengua candidate total46/knockback4.8 preserves damage/reach and avoids a new cooldown. In the isolated block-and-advance experiment, melee range was reached at189 combat ticks versus not within500 step calls at baseline. Human tolerance/matchup validation remains required. Coletazo stays intact.
- Current Camaleoni/Supernariz launch physics already match. Align final damage and release and add explicit major-impact events. Avoid uniform Ultimate speed buffs: shortening Supernariz startup alone worsened its catch results in a probe.
- Ultimate Clash uses four effective ticks, shared geometry/arbitration, both meters spent, zero Ultimate damage,12 hitstop calls and30 synchronized bilateral-launch ticks. Prior capture cannot be cancelled. Current equal-time same-kit capture favors slot0; replace that policy explicitly.
- Permanent physical-action animation rule is now in AGENTS. Walk/jump need actual support/impulse/absorption; two-tick jump preparation is a candidate gameplay tradeoff that must be retested with all evasions.
- Mario/Ricardo/Brancaforte work in parallel after the short schema checkpoint; use DIRECT_START when task/base/ownership are explicit. Germinator remains independent; Gonza verifies the actual integrated and served artifact. No Astra return gate.

## Baseline and unresolved evidence

Audited main: `753d3aa4d6abe1e6da1683d4d069848c4ac4e8ac`. Product baseline: `2d8c41dc994c8cddaa4c9fe2b3ee957698e94f13`; QA baseline: `2876f3bce7d77c04c7415df89cafcf8b31f1b61c`. Independently reran206/206 tests, typecheck and build using TypeScript5.9.3/Node24.19.0. Temporary experiments injected copied data and did not change production source.

Main product is still V0.4; V0.5 is the isolated preview, not a completed official release. R003 remains active. Human feedback in the new request is accepted as reported evidence, but missing physical-device/performance gates were not fabricated or waived. No new Safari test or pixel-quality certification was performed by this audit. No Juanchi master asset was found in the audited main/QA composition.

Requested next action, when the user authorizes execution: Neureon reconciles R003 and selects the exact V0.6 base, records the reference intake, creates the plan's real task contracts and opens the appropriate round. Read current main before acting; this document does not alter CURRENT_ROUND, STATUS or LOCKS.

Publication verification: the documentation-updated main retains its existing97/97 tests PASS, typecheck/build PASS; these are the V0.4-on-main tests, distinct from the206-test V0.5 candidate audit. Documentation links/fences and the documentation-only diff were checked. No product source, build configuration or published artifact is changed.
