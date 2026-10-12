# Lessons - adopt-bp

Append-only reflection lane. `## <version used> - <YYYY-MM-DD> - <project>` then `- ` bullets.

## 0.1.0 - 2026-10-12 - pof (bench: codex gpt-6.1-sol, claude sonnet-5.5, grok 4.7, all @high)
- Counts lie, verification does not: Sonnet produced 4x the proposals and coverage rows of Codex, but a blind 54-claim check found Codex 12/12 proposals true vs Sonnet 9/12 and Grok 8/12 (1 false). Score seats on a verified sample, not on volume.
- "Absent = unmeasured" was read as "omit clean results": Codex left findings* empty on clean features, so clean security read as unmeasured. A judged-clean lens gets explicit zeros; absent is only "not looked at".
- A calibration example ("70-85") became a ceiling: Codex never scored above 85. State what a score means, not a typical range.
- Without a granularity rule, Sonnet made UI atoms and stores into features (101 vs 68). Roadmap-sized features with shared foundations folded into one ops feature per domain.
- ~25 of 36 sampled proposals were accurate but targeted a legacy tree the repo's own salvage doc schedules for deletion. Deprecated features get security-only judgement and removal-or-security proposals.
- API-only features were called live when their only callers sat in the deprecated shell; stage now follows the calling surface.
- Real repos ship context maps with duplicate context names and directory entries in file_paths (pof: 2 and 53). seed renames duplicates by group and expand() walks directories; check reports both.
- The bp canvas folded deprecated features into "promised"; only a real product with many deprecated features showed it (fixed in bp 29509c2). Smoke every adoption on the canvas, not just the validator.
