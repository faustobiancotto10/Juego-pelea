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
