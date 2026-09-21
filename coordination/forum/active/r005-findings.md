# R005 Findings / Blockers

Round: `R005-V07-GAMEPLAY-PRESENTATION-EXPANSION`

No findings are open at round start.

For each future finding record:
1. task/owner;
2. exact SHA/build;
3. reproduction/evidence;
4. expected vs actual;
5. affected dependencies;
6. whether an in-contract repair exists;
7. smallest user decision needed if not.

## DECISION_REQUEST — V07-B1 portrait ownership/dependency contradiction

Owner: Brancaforte  
Detected against B1 candidate: `b851ae8a2119020100879a78dedb645397dcda3b`

Evidence:
- V07 content design says portraits are procedural game representations **produced by Mario** and consumed by Brancaforte.
- V07-M2 owns registered portrait renderers for all four fighters.
- V07-B1 acceptance requires all four cards to display those portraits, but B1 is scheduled in parallel with M2 and has no declared M2 dependency/interface.
- Brancaforte's first B1 candidate incorrectly crossed ownership by inventing fighter-specific CSS silhouettes.

Expected: Brancaforte owns card layout/interaction and consumes Mario's portrait renderer through a stable interface.  
Actual: no M2 portrait renderer exists yet on `round/r005-mario`; B1 cannot honestly satisfy final portrait acceptance without either crossing renderer ownership or waiting for M2.

Affected dependency: Gonza V07-Z0 must not integrate B1 candidate `b851ae8a...` as final portrait implementation.

In-contract repair available now: remove Brancaforte-authored fighter art, retain a keyed portrait mount/fallback surface and keep difficulty flow green. Final portrait wiring still needs Mario M2 output or an explicit cross-lane interface.

Smallest decision: treat Mario M2 portrait renderer as the final input B1 consumes before B1 returns GREEN, or have Neureon amend the dependency/interface contract.
