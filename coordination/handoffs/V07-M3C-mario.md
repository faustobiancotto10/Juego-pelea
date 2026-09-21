# V07-M3C — Mario-C Handoff

Round: R005-V07-GAMEPLAY-PRESENTATION-EXPANSION  
Task: V07-M3C  
Sender: Mario-C (durable identity: Mario)  
Recipient: Mario-A / V07-M3I  
Status: HANDOFF_READY  
Branch: `round/r005-mario-squad-camaleoni-supernariz`  
Exact product SHA: `3131bbef6a517785722d48a255e2d8a0daf10e7b`  
Squad base: `032b1bb28c5dd4421e5772cc40ab007f42e4d462`

## Files changed

Only Mario-C-owned fighter files changed from the squad base:

- `src/game/render/ChameleonRig.ts`
- `src/game/render/SupernarizRig.ts`

`compare_commits(032b1bb… → 3131bbef…)` remains limited to these two Mario-C-owned files. The M3I-requested structural rework and prior D follow-up never leave C ownership.

## M3I structural rework

The first integrated squad candidate was rejected as too incremental. C was reopened specifically for large silhouette/reference changes rather than additional micro-detail.

### Camaleoni structural delta

- replaces the short/elliptical neck read with a visibly long procedural S-curved scaled neck;
- raises and enlarges the human head mass;
- extends and thickens the neutral tail substantially and enlarges the terminal spiral;
- enlarges the dorsal crest;
- narrows/lengthens the reptile torso so the head-neck-tail relationship dominates the silhouette.

### Supernariz structural delta

- increases the neutral nose projection from 52 to 76 render units and enlarges the bulb;
- raises/enlarges the head;
- expands the cape into a much larger rear wedge;
- adds a broad-shoulder V-taper shell over the narrow superhero waist;
- widens the arm/shoulder silhouette while preserving the upright long-legged stance.

## Behavior / visual contract

### Camaleoni

- preserves the oversized human head, long scaled neck, small claw hands and reptile body;
- strengthens the neutral non-human silhouette with a dorsal crest;
- adds a persistent procedural spiral-tail termination that partially uncoils during tail sweep presentation;
- adds segmented ventral plating over the existing scale field;
- remains fully procedural Canvas2D and snapshot-driven.

### Supernariz

- makes the canonical nose longer and more bulbous at neutral while preserving move-driven articulation;
- adds cape inner fold, heavy hem and shoulder clasp for stronger cape volume;
- adds red boot shafts/soles and red suit side panels/shoulder yoke so the outfit reads as layered construction rather than a flat blue body;
- enriches belt/sausage props with an additional sausage and pouch;
- remains fully procedural Canvas2D and snapshot-driven.

No simulation timing, hitboxes, damage, stun, move legality, balance, shared anatomy architecture, locomotion system, attack timing system or shared effects system changed.

## Secondary-motion follow-up

Mario-D requested consumption of the already-existing render-only locomotion channels `hipCounterRotation`, `chestCounterRotation`, `freeArmSwing` and `weightTransfer`. C accepted that request without taking D-owned files or depending on new D fields.

- Camaleoni now carries those channels into hip counter-rotation, tail counterbalance, free-arm motion, upper-body lean and head transfer.
- Supernariz now carries them into hip counter-rotation, cape lag, free-arm motion, upper-body lean and head transfer.
- No simulation state or gameplay authority changed.

## Evidence

Latest repository verification:
- run #1310 / `35573509502`: SUCCESS;
- coordination contract: PASS;
- full test suite: PASS;
- build: PASS.

Latest Character Pipeline V2:
- run #53 / `35573509521`: SUCCESS;
- full tests: PASS;
- build: PASS;
- deterministic visual evidence capture: PASS;
- runtime raster/reference guard: PASS;
- artifact: `v07-m3-visual-evidence`, ID `10626692984`;
- artifact digest: `sha256:e32ecbeccadec1d4b730918b17a65ea5f2148d3392ac436d5cbbb1b3c59133f6`;
- artifact head SHA matches `3131bbef6a517785722d48a255e2d8a0daf10e7b`.

Baseline / prior-C comparison:
- exact squad baseline artifact run `35567747782`, head `032b1bb28c5dd4421e5772cc40ab007f42e4d462`;
- baseline artifact digest `sha256:cbf9628b612e04acfe23ad4dcfc9b988b81b9f5c49612d325be40fe360e437f3`;
- prior C artifact: Pipeline #48 at `2deec5d38471404acaaa491835980c3fa80b21e9`;
- final candidate color/silhouette/844×390 phone-landscape captures were directly reviewed against both prior C and squad base;
- thresholded full-frame silhouette delta versus squad base rises from ~0.18% on prior C to ~2.06% on this structural pass;
- thresholded full-frame 844×390 phone delta versus squad base rises from ~0.67% on prior C to ~3.99%;
- restricting measurement to the left half containing C's two fighters, final silhouette delta is ~4.12% and phone delta ~7.99%;
- these pixel deltas are change evidence, not artistic quality scores. Direct inspection shows the intended larger head/neck/tail and nose/cape/V-taper silhouettes remain readable at phone scale.

## Tooling boundary

The requested Game Development Studio skill was consulted, but the local `game-dev` CLI is not available in this execution environment. No local Game Development Studio capture is claimed. Evidence comes from the repository's existing Character Pipeline V2 GitHub Actions workflow and its exact-SHA artifact.

## Known risks

- Fighter-specific secondary motion now consumes the shared locomotion channels requested by Mario-D; D remains owner of the shared locomotion/action system itself.
- Shared structure/gate interfaces remain Mario-A ownership.
- Human artistic acceptance of the integrated four-lane result still belongs after V07-M3I; pixel-delta measurements and automated raster evidence do not substitute for that acceptance.
- Draft PR #40 exists only to trigger CI and must not be used as the integration vehicle because its diff against current main includes historical baseline commits.
- Character Pipeline V2's standard screenshots instantiate neutral locomotion channels, so run #48 proves no static/raster regression but is not frame-by-frame proof of the new secondary motion. The code path and full tests/build are green; dynamic gait quality remains an integration/human-review concern.

## Unresolved questions

None blocking this lane.

## Downstream eligibility

V07-M3C is GREEN / HANDOFF_READY. Mario-A V07-M3I may consume exact SHA `3131bbef6a517785722d48a255e2d8a0daf10e7b` after the other required A/B/D lane handoffs are green.
