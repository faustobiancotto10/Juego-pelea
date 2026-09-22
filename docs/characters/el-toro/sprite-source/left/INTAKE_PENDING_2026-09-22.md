# El Toro LEFT source intake — 2026-09-22

Status: **RECEIVED / NOT ADMITTED**

User bundle inspected: `SPRITES 2(1).zip`.

The bundle contains the complete candidate LEFT body set plus the previously accepted RIGHT/FX source material. Mario-A mapped only the authored LEFT body sheets below.

| Contract ID | Source UUID | SHA-256 | Size | Alpha | Preliminary result |
|---|---|---|---:|---|---|
| LEFT-IMG-00 | 67BBFB57-53C0-4301-9EE8-08822FA826B7.PNG | `4d34a42acf2823a830fc792987099c73f9dbfd0af0583507e1c4b2cc75e668ae` | 1254×1254 | transparent | PASS intake |
| LEFT-IMG-01 | 4F40CD58-460B-41C4-AA9E-F858E3CD640C.PNG | `8ec85888a06330974023d74517dab9a65c626ef5f3508834381e733573ccdd8e` | 1536×1024 | transparent | **REJECT — hard bottom-canvas contact/clipping** |
| LEFT-IMG-02 | 89298F0E-D2F9-4E20-B64B-875E2D4C99E0.PNG | `63132b6519162c9ce160db35c408a0faf3557f07f00ec7b1e72f45264e106c2a` | 1536×1024 | transparent | PASS intake |
| LEFT-IMG-03 | C0942DEB-45CF-476A-AEA9-F45F63D9A97F.PNG | `8caa648410c72ce1a726fbe13fbf3b816a38b6ad38a1e478b7ac778eeba6c823` | 1536×1024 | transparent | PASS intake |
| LEFT-IMG-04 | 9DC6A2F9-264B-488A-87B6-C975F15F7C1E.PNG | `196d38b07b9e7d1ce86ae1401d86b5594a815e576217543f2bddc04d0acc8e46` | 1536×1024 | transparent | PASS intake |
| LEFT-IMG-05 | A3985E1E-B2AC-453D-AE8C-E12118CB7C5A.PNG | `92850cfe18cc89f160dd44aa9fac0536c2eb2540f4535538b416bdba3cbe6e70` | 1536×1024 | transparent | PASS intake |
| LEFT-IMG-06 | 28B1E081-AB05-4A88-96D1-5CF3371BE4C8.PNG | `d6a23e5cc2233dc45af5e4ebe3a206251d6374a61f3573225407fdab95b8e57b` | 1536×1024 | transparent | PASS intake |
| LEFT-IMG-07 | 2183DE5C-6B6F-45A3-A18B-010D53B8BF4D.PNG | `92b61b872dd65650db7d62e2e36ce85cccd957a19dc62d9155836a72269764b4` | 1536×1024 | transparent | PASS intake |
| LEFT-IMG-08 | 224086F0-2632-4650-BAC1-D0F711DCE0DB.PNG | `f6f35fa68b92cd2ae65c1a6b5841ae387459caa120efdeed918406ffaa15531f` | 1536×1024 | transparent | PASS intake |
| LEFT-IMG-09 | E11AA522-6133-4164-B22F-D39B12C2AAE7.PNG | `ce52a6db568e32a65904c38d314b003ef1d4d7fef86a5dfb8db1f1f9618cb4a2` | 1536×1024 | transparent | PASS intake |
| LEFT-IMG-10 | 9EEF703F-A164-4322-8EF8-2F04746DCCE8.PNG | `884b8c076daf9c9dfffaf1700fcf581a5d635f2dd0a5a8c8b5b342e991bb8904` | 1536×1024 | transparent | PASS intake — corrected Topete |
| LEFT-IMG-11 | 79575D31-C003-4186-B768-24C932B2D0A0.PNG | `2edec8b9124316342073775f3bc54251f7b548ff93971279ed962f4ee7e604b6` | 1536×1024 | transparent | PASS intake — corrected Shawarmazo |
| LEFT-IMG-12 | B89CA6B4-8860-4931-B736-833C310F6880.PNG | `10603c27cb14af276c92e18ce1686909a6be5fb2303de0f3a6317459fa863ddb` | 1536×1024 | transparent | PASS intake — corrected Super Eructo |

## Exact rejection evidence for LEFT-IMG-01

At the outer bottom canvas row (`y=1023`) there are **59 pixels with alpha > 128**, with a maximum alpha of **180**. This violates the frozen production rule that complete sprites must retain exterior margin and the Mario-A source extractor's hard outer-canvas clipping gate.

All expected grid cells contain visible alpha content; the rejection is specifically the outer-canvas clipping gate, not missing-frame coverage.

## Binary transfer state

The connected GitHub API surface in this session can read/write repository text and Git objects but exposes no action that accepts a ChatGPT/local binary attachment as repository bytes. Therefore these local PNG bytes have **not** been falsely marked as committed.

Do not treat this receipt as source admission. A corrected LEFT-IMG-01 plus actual repository binary staging is still required before Mario-A can issue a GREEN LEFT source handoff.

## Other remaining pilot gate

Anatomical anchors remain a separate downstream visual-authoring gate; Mario-A must not fabricate them from alpha/bounding geometry.


## Local non-destructive repair candidate

Mario-A prepared a canonical local LEFT package without regenerating artwork:

- LEFT-IMG-00 and LEFT-IMG-02..12 preserve the exact user-provided PNG bytes.
- LEFT-IMG-01 preserves every original RGBA source pixel at the same coordinates and adds **16 fully transparent rows below the source canvas**. No pixel is moved, resampled or recolored.
- repaired LEFT-IMG-01 dimensions: **1536×1040** (the contract's 1536×1024 canvas is recommended, not mandatory);
- repaired LEFT-IMG-01 SHA-256: `1dbe4afc9f1f5564eddd18e802af2f4f41454f7c5c54266466a90949106ebac7`;
- after this padding repair, all 13 LEFT sheets have **0 alpha>128 pixels on the outer canvas edge**;
- canonical local ZIP SHA-256: `f5f22112114dd815bdc1a04a0ce4f6b59130b5b67a6ba98e700da34942d3cc2b`.

This removes the mechanical edge-contact failure without weakening the detector or altering the authored sprite pixels. It is still **NOT ADMITTED** until the canonical binary bytes are actually present in GitHub and the repository-native component extraction/hash/normalization verification runs green.
