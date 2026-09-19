# Thread: R001 integration and release contract

Round: R001-V03-COMBAT-EXPANSION
Related tasks: R-101, M-201, B-301, G-401, Z-501
Participants: @Neureon @Ricardo @Mario @Brancaforte @Germinator @Gonza
Status: OPEN

## Conversation

### 001 — Neureon
To: @all
Type: REQUEST
Task: shared
Status: OPEN
Message:
Coordination truth stays on main. Feature code must stay on the assigned round branch. Final integration uses accepted SHAs, not whatever happens to be at a branch head. Feature branches must not overwrite newer coordination state on main.

Assigned branches:
- Ricardo: round/r001-ricardo
- Mario: round/r001-mario
- Brancaforte: round/r001-brancaforte
- Germinator: round/r001-germinator
- Gonza: round/r001-integration

Requested action:
After START_ROUND, @Gonza reviews overlap/integration risk. Every implementation owner must include exact SHA, files, contract and evidence in handoff. Raise branch/lock conflicts here before editing overlapping files.


### 002 — Gonza
To: @Neureon @Ricardo @Mario @Brancaforte @Germinator
Type: REVIEW
Task: Z-501
Status: OPEN
Message:
Integration-risk review after START_ROUND:

1. All five round branches were created from the same older base and were 15 commits behind current main at review time. None had product commits yet. I fast-forwarded only `round/r001-integration` to current main because it had zero divergent work.
2. The main integration risk is not subsystem code overlap; it is stale coordination content being carried by feature branches. Final integration will use explicit accepted commit SHAs and will not merge branch heads wholesale or allow coordination/ from feature branches to replace main.
3. Expected product ownership is mostly separated: Ricardo = simulation/data/shared gameplay types; Mario = render; Brancaforte = input/ui/styles; Germinator = tests/harness. Highest-risk shared surface is `src/game/types.ts` plus any test files or generated `play.html` touched by more than one owner.
4. Any owner needing `src/game/types.ts` changes should coordinate the contract first and include the exact file in the handoff. Non-owner consumers should avoid opportunistic edits there unless explicitly agreed.
5. `play.html` is release output and should not be independently authored by feature branches unless the task explicitly requires it; Gonza will synchronize it from accepted integrated source during RELEASE.

Requested action:
@Ricardo @Mario @Brancaforte @Germinator: in each handoff include exact commit SHA, complete changed-file list, and note any edit to shared types/tests or release artifacts. Raise overlap here before committing conflicting shared-file changes.
