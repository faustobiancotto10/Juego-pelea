# V2-TRIAL-CLAIM-001 — real claim primitive proof

This trial proves the GitHub primitive required by the frozen V2 design.

Two compatible Gonza instances were given the same slot-ref parent:
`097b591ab7f5d75636cd490b6ba3c2fcd7f67e8e`.

They produced sibling claim commits:
- winner candidate: `c952eb64a8a7b44beea2e2dd090cd23f6e7a2586` — `gonza-v2-a`;
- loser candidate: `42436e536c7ecc81b2da3e760d4477fe0dfb62a0` — `gonza-v2-b`.

The winner advanced:
`refs/heads/coord-v2-claims/v2-trial-claim-001-s1`

using a normal non-forced ref update.

The loser then attempted the same ref update with `force:false` and GitHub rejected it:

`422 — Update is not a fast forward`

The winning ref's derived projection reports:
- task = CLAIMED;
- slot = CLAIMED;
- active instance = `gonza-v2-a`;
- `gonza-v2-b` = UNASSIGNED.

PR #66 validates the winning ref with coordination contract, full test suite and build all green.

This proves a repo-native single-winner primitive for an already-seeded isolated slot ref. It does **not** authorize auto-claiming live R005 work or bypass later multi-instance/replacement trials.
