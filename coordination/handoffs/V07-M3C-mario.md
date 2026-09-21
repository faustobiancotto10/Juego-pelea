# V07-M3C — Mario-C Handoff

Round: R005-V07-GAMEPLAY-PRESENTATION-EXPANSION  
Task: V07-M3C  
Sender: Mario-C (durable identity: Mario)  
Recipient: Mario-A / V07-M3I  
Status: HANDOFF_READY  
Branch: `round/r005-mario-squad-camaleoni-supernariz`  
Exact product SHA: `d0b28a34ae2221adccd04c483bbb0c5561b512f2`  
Squad base: `032b1bb28c5dd4421e5772cc40ab007f42e4d462`

## Files changed

Only Mario-C-owned fighter files changed from the squad base:

- `src/game/render/ChameleonRig.ts`
- `src/game/render/SupernarizRig.ts`

`compare_commits(032b1bb… → d0b28a34…)` reports exactly two commits and exactly these two modified files.

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

## Evidence

Repository verification:
- run #1223 / `35570265779`: SUCCESS;
- coordination contract: PASS;
- full test suite: PASS;
- build: PASS.

Character Pipeline V2:
- run #37 / `35570265751`: SUCCESS;
- full tests: PASS;
- build: PASS;
- deterministic visual evidence capture: PASS;
- runtime raster/reference guard: PASS;
- artifact: `v07-m3-visual-evidence`, ID `10625572944`;
- artifact digest: `sha256:fce72b92702a43eb323396e333c899c4753e1c4045593669eb5558e4bb811e21`;
- artifact head SHA matches `d0b28a34ae2221adccd04c483bbb0c5561b512f2`.

Baseline comparison:
- exact baseline artifact run `35567747782`, head `032b1bb28c5dd4421e5772cc40ab007f42e4d462`;
- baseline artifact digest `sha256:cbf9628b612e04acfe23ad4dcfc9b988b81b9f5c49612d325be40fe360e437f3`;
- candidate color/silhouette/844×390 phone-landscape captures were reviewed against the baseline;
- Supernariz shows the clearest silhouette gain from the longer bulbous nose, cape volume and boot/costume segmentation;
- Camaleoni keeps its already-strong head/neck/tail identity and adds a readable crest/spiral-tail/ventral-detail improvement without changing gameplay.

## Tooling boundary

The requested Game Development Studio skill was consulted, but the local `game-dev` CLI is not available in this execution environment. No local Game Development Studio capture is claimed. Evidence comes from the repository's existing Character Pipeline V2 GitHub Actions workflow and its exact-SHA artifact.

## Known risks

- This lane improves fighter-specific construction only. Shared motion/action readability remains Mario-D ownership.
- Shared structure/gate interfaces remain Mario-A ownership.
- Human artistic acceptance of the integrated four-lane result still belongs after V07-M3I; automated raster evidence does not substitute for that acceptance.
- Draft PR #40 exists only to trigger CI and must not be used as the integration vehicle because its diff against current main includes historical baseline commits.

## Unresolved questions

None blocking this lane.

## Downstream eligibility

V07-M3C is GREEN / HANDOFF_READY. Mario-A V07-M3I may consume exact SHA `d0b28a34ae2221adccd04c483bbb0c5561b512f2` after the other required A/B/D lane handoffs are green.
