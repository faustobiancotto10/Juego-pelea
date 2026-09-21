# Active Locks

| Path / subsystem | Owner | Task | Reason |
| --- | --- | --- | --- |
| `src/game/ui/AppController.ts` | Brancaforte | V07-B1 | Mount Mario PortraitRenderer on UI-owned portrait hosts. |
| `src/styles.css` | Brancaforte | V07-B1 | Rendered/fallback portrait state styling. |
| `tests/ui-v07.test.mjs` | Brancaforte | V07-B1 | Final portrait-consumer acceptance coverage. |

V07-M1 exact candidate `d55cce8ce7f03a60168697a5a5bbe1c8b5833a24` is GREEN at verification run #1079 (305/305 + build).

V07-M2 exact candidate `a47326093ae004c602e00112ac2ed2226cf738c8` is GREEN at verification run #1113 (314/314 + build). Mario released all M2 locks after restoring the normal verification workflow.
