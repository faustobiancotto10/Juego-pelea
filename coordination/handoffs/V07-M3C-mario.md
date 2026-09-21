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

`compare_commits(032b1bb… → 3131bbef…)` remains limited to the two Mario-C-owned rigs. The refreshed structural pass adds three commits on top of the previous C handoff: two material rig changes plus one comment-only compatibility fix for the canonical `Long scaled neck` test marker.

## Behavior / visual contract

### Camaleoni

- pushes the oversized human head significantly higher and larger over the reptile body;
- replaces the short neck mass with a visibly long S-curved scaled neck while preserving the canonical `Long scaled neck` contract marker;
- lengthens and thickens the neutral tail and enlarges the persistent procedural spiral termination;
- strengthens the dorsal crest and narrows the torso so the head/neck/tail dominate the silhouette rather than surface texture;
- preserves claws, scale material, secondary-motion wiring and fully procedural Canvas2D rendering.

### Supernariz

- pushes the neutral bulbous nose from a modest facial accent into the dominant profile silhouette while preserving move-driven articulation;
- enlarges the cape into a materially broader wedge behind the body;
- raises/separates the head and increases head mass;
- adds a stronger superhero V-taper with broader shoulders, narrower torso and wider arm placement;
- retains the layered blue/red suit, boots, chest nose emblem, belt/sausage props, cape folds and fully procedural Canvas2D rendering.

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
- note: prior run #1309 failed only because the canonical test searched for the literal text `Long scaled neck`; the exact structural neck code was retained and the marker restored comment-only at the final SHA.

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
- Draft PR #40 exists only to trigger CI and must not be used as the integration vehicle because its diff against current main includes historical baseline commits; it is closed without merge after validation.
- Character Pipeline V2's standard screenshots instantiate neutral locomotion channels, so run #48 proves no static/raster regression but is not frame-by-frame proof of the new secondary motion. The code path and full tests/build are green; dynamic gait quality remains an integration/human-review concern.

## Unresolved questions

None blocking this lane.

## Downstream eligibility

V07-M3C is GREEN / HANDOFF_READY. Mario-A V07-M3I may consume refreshed exact SHA `3131bbef6a517785722d48a255e2d8a0daf10e7b`. Mario-B and Mario-D are also HANDOFF_READY, so M3I may now recompose the stronger B+C inputs with A+D.
