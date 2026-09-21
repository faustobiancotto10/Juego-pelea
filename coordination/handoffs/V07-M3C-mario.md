# V07-M3C — Mario-C Handoff

Round: R005-V07-GAMEPLAY-PRESENTATION-EXPANSION  
Task: V07-M3C  
Sender: Mario-C (durable identity: Mario)  
Recipient: Mario-A / V07-M3I  
Status: HANDOFF_READY  
Branch: `round/r005-mario-squad-camaleoni-supernariz`  
Exact product SHA: `2deec5d38471404acaaa491835980c3fa80b21e9`  
Squad base: `032b1bb28c5dd4421e5772cc40ab007f42e4d462`

## Files changed

Only Mario-C-owned fighter files changed from the squad base:

- `src/game/render/ChameleonRig.ts`
- `src/game/render/SupernarizRig.ts`

`compare_commits(032b1bb… → 2deec5d3…)` remains limited to these two Mario-C-owned files. The targeted D follow-up adds two additional commits on top of the original C handoff, still touching only these rigs.

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
- run #1273 / `35571259262`: SUCCESS;
- coordination contract: PASS;
- full test suite: PASS;
- build: PASS.

Latest Character Pipeline V2:
- run #48 / `35571259158`: SUCCESS;
- full tests: PASS;
- build: PASS;
- deterministic visual evidence capture: PASS;
- runtime raster/reference guard: PASS;
- artifact: `v07-m3-visual-evidence`, ID `10626037635`;
- artifact digest: `sha256:ee23dd6dc9280063b79b123e4a4d4ae5289013908218a7457fb34b52e86ab101`;
- artifact head SHA matches `2deec5d38471404acaaa491835980c3fa80b21e9`.

Baseline comparison:
- exact baseline artifact run `35567747782`, head `032b1bb28c5dd4421e5772cc40ab007f42e4d462`;
- baseline artifact digest `sha256:cbf9628b612e04acfe23ad4dcfc9b988b81b9f5c49612d325be40fe360e437f3`;
- candidate color/silhouette/844×390 phone-landscape captures were reviewed against the baseline;
- Supernariz shows the clearest silhouette gain from the longer bulbous nose, cape volume and boot/costume segmentation;
- Camaleoni keeps its already-strong head/neck/tail identity and adds a readable crest/spiral-tail/ventral-detail improvement without changing gameplay.

## Tooling boundary

The requested Game Development Studio skill was consulted, but the local `game-dev` CLI is not available in this execution environment. No local Game Development Studio capture is claimed. Evidence comes from the repository's existing Character Pipeline V2 GitHub Actions workflow and its exact-SHA artifact.

## Known risks

- Fighter-specific secondary motion now consumes the shared locomotion channels requested by Mario-D; D remains owner of the shared locomotion/action system itself.
- Shared structure/gate interfaces remain Mario-A ownership.
- Human artistic acceptance of the integrated four-lane result still belongs after V07-M3I; automated raster evidence does not substitute for that acceptance.
- Draft PR #40 exists only to trigger CI and must not be used as the integration vehicle because its diff against current main includes historical baseline commits.
- Character Pipeline V2's standard screenshots instantiate neutral locomotion channels, so run #48 proves no static/raster regression but is not frame-by-frame proof of the new secondary motion. The code path and full tests/build are green; dynamic gait quality remains an integration/human-review concern.

## Unresolved questions

None blocking this lane.

## Downstream eligibility

V07-M3C is GREEN / HANDOFF_READY. Mario-A V07-M3I may consume exact SHA `2deec5d38471404acaaa491835980c3fa80b21e9` after the other required A/B/D lane handoffs are green.
