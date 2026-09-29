---
domain: software-engineering
subject: analytics-time-windows
last_touched: 2026-09-29
touched_by: deepen
dry_streak: 0
depth: L1
---

# analytics-time-windows

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-29 - `/deepen`, first pass (Curator dispatch, never swept)

Training-data-only pass over the golden path and `calendar-arithmetic`; no web
lanes, no tree re-read, so depth stays L1.

**Verified, left untouched.** 365/30 = 12.17 renewals a year and the 1.4%
overspend; the Unix epoch is a Thursday; day-of-month clamping re-anchored on
the original day; half-open double-count argument.

**Corrected.** `calendar-arithmetic` step 2.2 claimed consecutive week-starts
are exactly seven days apart. True in universal time (the node application's
case), false in a zone with a seasonal shift (167 or 169 hours), which
contradicted irregularity 3 in the same file. Condition added: index on the
civil date in a shifting zone. Application citations were not re-resolved, so
no `verified_on` moved.

**Banked.** Re-resolve the four applications against their trees (oldest
`verified_on` 2026-08-20) - return when currency flags them or a project
touches its window code.

### Impact

None: the regenerated map showed no project carrying a verdict against this subject.
