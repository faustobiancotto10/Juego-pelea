# El Toro Sprite Intake Audit — 2026-09-21

Status: **RIGHT-FACING SOURCE SET CONDITIONALLY ACCEPTED / FULL PRODUCTION PACKAGE BLOCKED**  
Input: user upload `SPRITES TORO.zip`  
Auditor: Neureon  
Contract: `docs/SPRITE_PRODUCTION_CONTRACT.md`

## Executive verdict

The upload contains enough material to reconstruct a complete **right-facing** El Toro source set under Contract v1.0 after excluding one superseded/invalid alternate idle sheet.

Accepted visual source coverage:
- Master Seed: 1;
- body: exactly **84** right-facing sprites across IMG-01..IMG-12;
- FX/projectiles: FX-01..FX-04 present with contract counts;
- PNG RGBA transparency present on every sheet;
- body/FX sheets are predominantly 1536×1024 as recommended;
- no sheet contains labels, captions, panel borders or baked scenery.

The package is **not yet a complete production-facing package** because El Toro is not mirror-safe. The approved character contains readable shirt text (`TE VOY A CHOCAR`) and directional garment marks. Horizontal runtime mirroring would reverse them, violating Section 10. Therefore all body animations require an authored LEFT-FACING set before production cutover.

One extra 8-frame body sheet is not admitted: it behaves like a large relaxed→guard→relaxed transition and does not match the IMG-01 subtle breathing/weight-shift phase contract as well as the accepted idle sheet.

## Accepted mapping

| Contract ID | Source filename | Count | SHA-256 | Verdict |
|---|---|---:|---|---|
| IMG-00 | CF0119D3-3DDC-4974-83D8-42448C8A9B67.PNG | 1 | `b22e581da861bee4c98601d9ceb53d5c1ea79993a0bc0f4b50a72cf5e9ca5752` | ACCEPT |
| IMG-01 | 734DACF7-F0FF-4939-99CB-36EF2CD09520.PNG | 8 | `396e43959c197c5e57a3021751dfe752f27dd70fa89bdd81e0c22422ee8f0585` | ACCEPT |
| IMG-02 | 5B1395D6-A9A4-4F87-8600-26562CE37BEB.PNG | 8 | `20cbc7c2c55c0b38a3195957fe7e68cc6f07386428c43ea999170cbce99523fc` | ACCEPT — forward walk |
| IMG-03 | BB14F9AD-0F86-466D-AA85-F77FB3421A15.PNG | 8 | `26d3e001a9902f66c606e720f3bf8410d7c630bbd99880369b3590dfc3b00a43` | ACCEPT — backward walk |
| IMG-04 | EA4090BF-95D8-4CA9-856E-6F98C291A6CC.PNG | 4 | `ba844bb600f903c62d918c6e3aab4365c1372af6f36ba54d31c736ff0ed398c3` | ACCEPT |
| IMG-05 | F436A217-2FF3-4634-883F-51FE6DF2CA4E.PNG | 6 | `9bf5fd065e3241e978334791c291a06f2a001d58f789a3b4e6d7163392dd54d3` | ACCEPT |
| IMG-06 | 9785527C-AB90-428E-A660-4AD4199A120B.PNG | 6 | `453e2a9a4983c94dc9579892181ae4e2cd6f214fedbb184d7628d7871b5b05ba` | ACCEPT |
| IMG-07 | DEC59E34-7355-496E-9783-0508F96F2C5C.PNG | 6 | `53fe7886c66a4a2ac7cecc18e9bf095faa0c174a1c5ce738b4b2f7c265dcdfa4` | ACCEPT |
| IMG-08 | C4F2064C-FE88-464E-A112-9B09EC09A613.PNG | 4 | `194ee89d805154b1cdfe41f55c5751fb7f829e1ac14a5ea51d569c473704693c` | ACCEPT |
| IMG-09 | 2C1D5A5C-8956-4085-B89C-09242A1A66C7.PNG | 8 | `9f926012b8bb8e11711b572463787a7601fa2fd1d3b32ea91c5bfaff38add572` | ACCEPT |
| IMG-10 | A74D779C-3035-4273-A362-B2355C83EAAE.PNG | 8 | `bbc0eceb11a903237d12a20a5b7b1c2eef60a02c19c836c474def1dbf7b3d8f1` | ACCEPT — Topete |
| IMG-11 | A8ACFD58-F6B7-4AD2-88F3-486C7613EFE1.PNG | 8 | `3bc8567f72aa50cf0df8650fcb172db385e74f8706b1f7d53cf95e4b51eeca2b` | ACCEPT — Shawarmazo |
| IMG-12 | 1DFE2E8E-F909-4C8F-9464-1155BF2B2D8D.PNG | 10 | `f91465638ff69f9a568fb4e168ad755fdc52883ae9d4cade093350ec20bc1ef5` | ACCEPT — Super Eructo |
| FX-01 | E67D93C4-DE43-4E2B-BC9C-5A0F1978EC2D.PNG | 4 | `3df8e51df3387112e611e138b577db75f283286b47bab86c43edef5b38b0dab1` | ACCEPT — Topete impact |
| FX-02 | 74170EBC-E07A-41C6-AE35-AF708F0B12F4.PNG | 8 | `df2bfdc4dfd0a388a70693522c5b6c125c70437dbac41effd2bd0eb02cfd7e4c` | ACCEPT — shawarma projectile |
| FX-03 | 19246038-36AC-4EA3-9BE7-CE3C14B9572E.PNG | 4 | `a06588de862d431074957915770d387259d77c322425a1d02f3839e52b5bc9b5` | ACCEPT — shawarma impact |
| FX-04 | 167A031F-05F3-4C0A-AACD-5955A2629C39.PNG | 6 | `d1f69195f325d59036176eb13a48b21e595d536e56ce32930a4100ee0d4e701b` | ACCEPT — Super Eructo effect |

## Rejected / superseded source

| Source filename | SHA-256 | Reason |
|---|---|---|
| 13F1BB3E-C57C-4649-B9E7-07664E5E8BE8.PNG | `1509b37f9c5d6e7becb1c983510651724ab744a24f6dbaa508ce847fcffac1bb` | Do not admit. Extra 8-frame body sheet; its relaxed→guard→relaxed pose change is too large for IMG-01's required subtle idle progression and would make the package exceed the fixed 84-body-sprite contract. |

## Technical observations

- Every inspected source is RGBA and contains real transparent pixels.
- Accepted body/FX sheets are visually separable and use the expected 1×4, 2×3, 2×4 or 2×5 layouts.
- Master Seed is 1254×1254 rather than the recommended 1024×1024. This is not an automatic rejection because the contract marks that dimension as recommended; Mario may normalize it as authoring input.
- A few frames approach the exterior canvas edge; Mario must verify extraction bounds before admission and reject/regenerate only if any art is actually clipped.
- Visual consistency is strong enough to proceed to normalized in-engine pilot work, subject to the LEFT-FACING blocker.

## Blocking gap — LEFT-FACING SET

El Toro is **not mirror-safe**. The body contains readable/directional graphics. Required before production cutover:
- LEFT-IMG-00 authoring seed, facing left, with all text/logos still readable in their intended orientation;
- LEFT IMG-01..IMG-12 with the same counts/grids/phases as the accepted right-facing set;
- same identity, scale, baseline, clothing and accessories;
- no horizontal-flip artifacts or reversed garment text.

FX-01..FX-04 do not contain readable text and may be mirrored/reused if in-engine review confirms the direction still reads naturally.

## Admission state

The right-facing source set is admitted for **authoring/normalization and pilot development only**. It is not yet an all-facing shipping package, and no production renderer cutover is authorized until the LEFT-FACING blocker, Germinator audit and user/device gate are green.

## Binary-source note

The current connected GitHub write surface in this Neureon session accepts repository text/Git objects but does not accept the local uploaded ZIP or local binary PNG file references directly. Therefore this audit records exact accepted filenames and SHA-256 identities, while the first Mario asset lane is responsible for committing the accepted binary sheets from the user-provided ZIP in a workspace that can write binary repository files. Do not substitute, regenerate or recompress these accepted right-facing source bytes without recording new hashes and a new review.
