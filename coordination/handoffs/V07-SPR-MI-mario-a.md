# Handoff checkpoint — V07-SPR-MI Mario-A RIGHT-only integration

Round: R005-V07-GAMEPLAY-PRESENTATION-EXPANSION  
Owner: Mario-A / designated same-role sprite integrator  
Branch: `round/r005-sprite-mario-integration`  
Exact integrated candidate SHA: `002cc749d2d5eddf62e90afee4bf524af291079a`  
State: **BLOCKED_EXTERNAL_INPUTS / RIGHT-ONLY INTEGRATED CHECKPOINT**

## Exact accepted inputs

- Mario-B RIGHT-only package: `51e0e892d08f9cf30742ef4894732f448a97da80`
  - includes Mario-A source/pixel-isolation v2 `0eb4a2b985813d1cdc9f8c53d059a81efe49be20`
  - run `35675088000` GREEN
- Ricardo sprite runtime: `5b20c351e75a45460b3f76416d41424f10e43a1f`
  - supersedes `79f8d81...`
  - 309/309 tests + build PASS
  - adds state-entry timing for crouch/block/block-crouch in addition to reaction/transition states.

The integration commit has exactly two parents:
- `51e0e892d08f9cf30742ef4894732f448a97da80`
- `5b20c351e75a45460b3f76416d41424f10e43a1f`

## Verification

Integration helper PR: #53.

PR #53 verification run: `35675504157`
- coordination contract: PASS
- full test suite: PASS
- build: PASS

GitHub's tested synthetic merge commit `1895dafe021fd5a3c7af3549a3c54adaf3226d16`
and actual integration commit `002cc749d2d5eddf62e90afee4bf524af291079a`
have the identical tree SHA:
`3976597b3a45559e8aebd475f985310b9786e02d`.

Therefore the exact integrated branch tree is the tree that passed PR #53 verification.

## What is integrated

- admitted RIGHT-facing El Toro source pipeline;
- deterministic component-owned pixel isolation;
- IMG-01..12-only runtime body normalization;
- deterministic 84-frame RIGHT body atlas generation;
- separate 22-frame FX atlas generation;
- 26-key RIGHT runtime fragment and FX fragment;
- deterministic gameplay-scale preview and metrics/fingerprints;
- anchor-review template/verifier and atlas-only manual review workflow;
- generic sprite manifest/runtime backend;
- explicit non-mirror-safe authored-facing contract;
- fight-scoped sprite package loading/cache;
- dual procedural/sprite renderer foundation;
- per-fighter-slot state-entry animation timeline including crouch/block/block-crouch.

## Intentionally NOT activated

El Toro remains `runtimeLoadable:false` and is not registered as a production sprite fighter.

No production cutover is allowed until all required authored-facing maps and attachment anchors validate.

## External blockers

1. Authored LEFT-facing IMG-00 + IMG-01..12.
2. Visually authored/verified anatomical anchor coordinates for all required RIGHT body frames.
3. Equivalent validated LEFT-facing anchors once LEFT art is admitted.
4. Downstream Brancaforte review of the visible VS sprite-loading/error state before UI-complete status.
5. Germinator independent audit after a truly loadable bilateral El Toro package exists.

No horizontal mirroring of El Toro's readable/directional costume art is permitted as a shipping substitute.

## Downstream eligibility

Germinator V07-SPR-G1 remains **WAITING_DEPENDENCY**. This checkpoint proves that the accepted RIGHT package and generic runtime compose cleanly, but it is not a valid all-facing runtime package.

## Identity Learning Review

Receipt: **UPDATED**

Mario durable learning was consolidated in `coordination/agents/mario.md`:
- preserve component-owned pixels rather than treating bboxes as ownership;
- exclude master/reference seeds from runtime shared-scale domains;
- require explicit visual anatomical-anchor review rather than inferring anchors from alpha bounds.

## Tool receipts

- Game Studio sprite-pipeline contract applied through the accepted lane outputs.
- Superpowers TDD/verification evidence inherited from exact accepted handoffs and verified again at integration.
- Game Development Studio local CLI remains unavailable in this host; no CLI evidence is claimed.
