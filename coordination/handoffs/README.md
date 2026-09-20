# Handoffs

Handoffs are formal transfers of completed work or stable interfaces between tasks/agents.

A handoff must include:
- task ID;
- sender / recipient;
- exact commit SHA;
- files changed;
- behavior/interface contract;
- verification evidence;
- known risks;
- unresolved questions;
- downstream eligibility statement.

Under `AUTO_CHAIN`, a green handoff with complete required evidence automatically satisfies that dependency. The recipient does not wait for another Neureon authorization.

A handoff does not authorize unrelated scope. The sender remains available for targeted repairs/review until `ROUND_COMPLETE`.

When no round is active, this directory contains only this README.
