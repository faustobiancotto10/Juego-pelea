# El Toro — Bilateral Derived Sprite Package

Status: **GREEN / ANCHOR-REVIEW-BLOCKED**

## Exact dependencies

- Mario-A authored LEFT/source pipeline: `c1b3e8e757b707f2975f6587217cc2f851e2ca6b`
- Ricardo generic sprite runtime: `5b20c351e75a45460b3f76416d41424f10e43a1f`
- Mario-B bilateral implementation candidate before this receipt: `383709a76dae8df110761df9401de0e04d1844a2`
- verification run: `35684554979` — coordination PASS, full suite PASS, build PASS

## Derived package contract

`buildElToroBilateralAtlasPackage()` deterministically produces:

- `el-toro-body.png`
  - 84 authored RIGHT body frames;
  - 84 authored LEFT body frames;
  - one shared atlas;
  - internal packing namespaces keep same logical frame IDs collision-free;
  - runtime manifest never exposes internal packing IDs.
- `el-toro-effects.png`
  - 22 identity FX frames, packaged once.
- `el-toro-animations.json`
  - `version: 1`;
  - `mirrorSafe: false`;
  - 26 RIGHT resolver keys in `animations`;
  - the exact same 26 keys in `leftAnimations`;
  - no horizontal mirroring.
- `el-toro-effects.json`
  - separate FX package metadata.
- `bilateral-gameplay-preview.svg`
  - RIGHT and authored LEFT at the same gameplay scale;
  - reads only from `el-toro-body.png`.
- `right-anchor-review.json` / `left-anchor-review.json`
  - 84 frames each;
  - deterministic atlas rect + normalization pivot;
  - all anatomical anchors remain explicit `null` until reviewed.
- `right-anchor-review.svg` / `left-anchor-review.svg`
  - atlas-only manual review sheets;
  - deterministic pivots only;
  - no fabricated anatomical anchor points.
- `bilateral-package-metrics.json`
  - atlas dimensions and decoded RGBA footprint.
- bilateral CLI mode:
  - `--source-dir <right>`
  - `--left-source-dir <left>`
  - `--package-contract <json>`
  - `--out-dir <dir>`

## Runtime gate

The generated bilateral manifest has no LEFT-art gate and no Ricardo transition-clock gate.

Only these gates remain when reviews are absent:

- `verified-right-attachment-anchors`
- `verified-left-attachment-anchors`

Supplying both complete, verified and atlas-matching anchor review files causes the generated manifest to become `runtimeLoadable:true`. The verifier rejects pending, incomplete, duplicate, out-of-bounds or geometry-mismatched reviews.

## Current blocker

The repository contains the machinery and visual review sheets but not visually authored/verified anatomical coordinates for all required anchors. Mario-B does **not** infer these coordinates from alpha bounds, pivots or proportional heuristics.

Production activation remains blocked until those reviews are completed against the rendered atlas evidence.

## Scope boundary

This lane does not register El Toro in the default sprite package registry, switch production root, remove procedural fallback, or start full-roster fanout. Those actions belong downstream of integrated QA and user/device acceptance.
