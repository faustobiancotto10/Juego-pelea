# V2 handoffs

Immutable exact-SHA task output receipts.

Multiple historical handoffs may exist for one task. A newer handoff explicitly names the prior handoff in `supersedes`. The validator requires one unambiguous current leaf and keeps older BLOCK evidence attached to its original candidate.
