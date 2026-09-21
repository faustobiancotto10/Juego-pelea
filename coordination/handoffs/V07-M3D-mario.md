# V07-M3D — Mario-D Handoff

Round: R005-V07-GAMEPLAY-PRESENTATION-EXPANSION  
Task: V07-M3D  
Sender: Mario-D (durable identity: Mario)  
Recipient: Mario-A / V07-M3I  
Status: HANDOFF_READY  
Branch: `round/r005-mario-squad-motion-fx`  
Exact product SHA: `b6dbe3ecb99d17a302477f3d63440555b5d8c135`  
Squad base: `032b1bb28c5dd4421e5772cc40ab007f42e4d462`

## Files changed

Exact base-to-head diff contains only:

- `src/game/render/CombatEffects.ts`
- `src/game/render/FightRenderer.ts`
- `src/game/render/LocomotionPose.ts`
- `src/game/render/PresentationPose.ts`
- `tests/v07-m3d-motion-fx.test.mjs`

No fighter-specific B/C anatomy files, simulation files, balance data, UI files or runtime raster assets changed.

## Behavior / presentation contract

### Locomotion

- preserves travel-driven gait and hitstop/idempotent sampling;
- gives each released fighter a distinct neutral stance spread and swing-foot arc profile without changing world travel;
- Camaleoni receives the narrowest, springiest stance/swing profile;
- El Toro receives the widest and heaviest/flattest profile;
- Juanchi and Supernariz retain distinct intermediate signatures;
- adds visible render-only start-drive and stop-settle compression from existing movement blend transitions;
- restrains free-arm swing on backwalk so retreat does not read like a mirrored forward walk;
- strengthens weight-transfer contribution to torso lean while leaving simulation movement untouched.

### Attack body language / timing

- replaces the old fixed renderer pulse based on `moveFrame / 14`;
- derives render-only anticipation, strike, follow-through, recovery, trail amount and action phase from each authoritative move's existing total frames and active window;
- does not change move legality, hit timing, damage, hitboxes, collision, stun or recovery rules;
- attack trails decay during authored recovery instead of persisting through long recoveries.

### Effects / telegraph layer

- adds bounded procedural pre-contact telegraphs keyed through the existing `AttackPresentationProfile.telegraphKey`;
- heavy, projectile, field and quick-attack families use different visual preparation language;
- fighter color/family identity is preserved across Camaleoni, Supernariz, Juanchi and El Toro;
- telegraphs are presentation-only and remain independent of gameplay authority;
- existing Juanchi rage aura is untouched.

## Verification evidence

Repository verification:
- run #1245 / `35570684438`: SUCCESS;
- coordination contract: PASS;
- full test suite: PASS;
- build: PASS.

Character Pipeline V2:
- run #44 / `35570684430`: SUCCESS;
- full tests: PASS;
- build: PASS;
- deterministic visual evidence capture: PASS;
- runtime raster/reference guard: PASS;
- artifact: `v07-m3-visual-evidence`, ID `10625737321`;
- artifact digest: `sha256:a8124b6211d274f0d8d92396b7074522e0c3e3778a86659804a41666c8adfb1b`;
- artifact head SHA matches `b6dbe3ecb99d17a302477f3d63440555b5d8c135`.

Lane-specific regression coverage:
- authored attack envelopes build before contact, peak on active frames and settle through recovery;
- FightRenderer no longer uses the fixed `fighter.moveFrame / 14` presentation pulse;
- distinct stance spread/swing-arc mass is asserted across fighters;
- visible start-drive and stop-settle compression is asserted;
- renderer files are guarded against gameplay-authority writes.

## Visual evidence boundary

The Character Pipeline V2 artifact provides:
- neutral silhouette evidence;
- normal-color roster evidence;
- Juanchi-vs-El-Toro comparison;
- El Toro action/body-pose evidence including Topete;
- 844×390 phone-landscape evidence.

It does **not** provide a frame-by-frame gait sequence for start/stop quality. Therefore automated evidence proves successful capture/build/raster constraints and static action readability, but does not independently prove subjective dynamic animation quality.

The requested Game Development Studio workflow was consulted. Its local `game-dev` CLI is not available in this runtime, so no local GDS capture is claimed and nothing was installed without authorization.

## Cross-lane note

Mario-D requested that Mario-C consume the already-existing `hipCounterRotation`, `chestCounterRotation`, `freeArmSwing` and `weightTransfer` signals for additional fighter-specific secondary motion. Mario-C is already HANDOFF_READY at its own exact SHA and did not accept that request before handoff.

This is **not a blocker for V07-M3D** because those files are C-owned and D cannot reopen them unilaterally. Mario-A should treat this as an integration-review observation: if the integrated result still leaves Camaleoni/Supernariz upper-body/secondary motion visibly behind B's fighters, route a bounded repair back to C rather than editing C-owned anatomy from D.

## Known risks

- Dynamic start/stop quality still needs human integrated visual review because the current automated artifact is not a temporal capture.
- The new telegraph layer intentionally makes anticipation more visible; integration should verify at phone scale that it supports readability without overpowering fighter silhouettes.
- A/B/C may change structure or fighter-specific geometry during integration; Mario-A must resolve any visual composition conflicts without altering gameplay truth.
- Human artistic acceptance remains downstream of V07-M3I and Germinator G2.

## Unresolved questions

None blocking this lane.

## Downstream eligibility

V07-M3D is GREEN / HANDOFF_READY. Mario-A V07-M3I may consume exact SHA `b6dbe3ecb99d17a302477f3d63440555b5d8c135`.

Draft PR #43 is a validation surface only and must not be merged as the final integration vehicle.
