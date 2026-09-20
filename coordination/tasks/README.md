# Active Tasks

This directory contains task contracts for the current implementation round only.

Every real task must define:
- ID;
- round;
- owner / branch;
- goal;
- dependencies;
- allowed files/subsystems;
- prohibited scope;
- acceptance criteria;
- tests/evidence;
- downstream handoff;
- current status.

Under `AUTO_CHAIN`, a task whose dependencies are green is already authorized. No PRESENT/check-in or Neureon stage token is required.

Agents may not silently expand scope. Local implementation bugs inside a frozen contract stay with the owner. Blockers, regressions, contract contradictions or required scope/interface changes go to the active round's findings thread and are reported to the user.

When no round is active, this directory contains only this README.
