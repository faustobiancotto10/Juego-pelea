# Active Tasks

This directory contains task contracts for the current round only.

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

Agents may not silently expand scope. A local implementation bug inside the frozen contract stays with its owner. A blocker, regression, contract contradiction or required scope/interface change goes to `coordination/forum/active/r004-findings.md` and is reported directly to the user; the user decides whether Neureon audits/replans.

When no round is active, this directory contains only this README.
