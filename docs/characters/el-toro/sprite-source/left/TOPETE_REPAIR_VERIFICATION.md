# Mario-A LEFT Topete repair — final verification receipt

Purpose: trigger repository-wide verification against the repaired Mario-A source branch after the legacy PR #50 stopped advancing its recorded head SHA.

Canonical repaired parent:
`8eacac360878a9c20b55a22e1f406c78f66fd27c`

Binary repair commit:
`4898b53aa21a81017f39cac1d62564e2d8138467`

Repaired LEFT-IMG-10:
- dimensions: 1664×1024;
- repository-byte SHA-256: `15d835f901cbc25f7eddaf8a8603d33129980fcb403ece3a550287b404d8dca9`;
- decoded-RGBA SHA-256: `b9cd6ecc2b26ea33fa5a4d2b3f07f7c965ec79dab82f303341660af08e2d09ea`;
- visible pixels preserved exactly once: 457123;
- hard outer-edge pixels: 0;
- extracted slot areas: `[83260,79278,77005,93447,101641,115853,88084,80630]`;
- targeted quality test: PASS in one-shot workflow `35749493759`.

This receipt changes no runtime/source behavior. The verification PR containing it must pass coordination, the complete repository test suite, and build before Mario-A re-freezes its handoff.
