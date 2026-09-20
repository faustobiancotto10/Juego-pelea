# R004 Integration

Round: `R004-V06-CONTENT-EXPANSION`  
Owner: @Gonza

## Frozen base

Product base:
`2d8c41dc994c8cddaa4c9fe2b3ee957698e94f13`

QA reference only:
`2876f3bce7d77c04c7415df89cafcf8b31f1b61c`

## Rule

Integrate only exact green handoff SHAs from:
- Ricardo R0/R1/R2/R3;
- Mario M1/M2;
- Brancaforte B1.

Do not merge coordination files from feature branches over newer main state.

Z0 may run continuously as accepted deltas arrive. Once the exact candidate contains R3+M2+B1 and passes integration verification, publish the candidate SHA for Germinator G1.

G1 `APPROVE — V06-Z1 UNLOCKED` automatically authorizes Z1. No second Neureon release token.
