# P4-B adversarial race — failure evidence

Status: **FAIL / STOP PHASE 4**

Frozen rule: if two different claim refs admit the same disposable instance simultaneously and the aggregate model becomes invalid, Phase 4 fails immediately. Manual cleanup cannot convert the outcome into PASS.

Observed live remote claims:

- `refs/heads/coord-v2-claims/p4-b-one`
  - head: `1c9af565548364800928ca013d8b52917ce87928`
  - instance: `mario-v2-p4-b`
  - slot: `P4-B-ONE-S1`
  - parent: `ef5aac1989fef70fc7c04251e426086fc690e1d6`

- `refs/heads/coord-v2-claims/p4-b-two`
  - head: `47ce3ceb3346a916d5d6a6e7c341bb2b0dabd7e6`
  - instance: `mario-v2-p4-b`
  - slot: `P4-B-TWO-S1`
  - parent: `ef5aac1989fef70fc7c04251e426086fc690e1d6`

Commit timestamps:
- ONE: 2026-09-29T00:05:42Z
- TWO: 2026-09-29T00:05:46Z

Both distinct refs accepted normal fast-forward commits from the same global preflight era. Work refs remain at the setup seed; no P4-B work artifact should proceed.

Expected validator result: duplicate active ownership for instance `mario-v2-p4-b`.

Required routing: STOP P4-B/P4-C/P4-D/P4-E and return to Gonza for architectural repair of cross-ref claim atomicity / reservation semantics. Preserve both claim refs as evidence; do not manually reset them to manufacture a pass.
