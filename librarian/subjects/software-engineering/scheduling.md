---
subject: scheduling
domain: software-engineering
last_touched: 2026-08-22
dry_streak: 0
---

# scheduling

First touch: [[2026-08-22-5]], external reconcile against `temporalio/temporal`
@ `6805cae` (1.32.0). Gained `go--next-run-computation` (uncovered) — second
stack; single-stack debt cleared. Hint confirmed.

## Open leads (banked, convergence rule applies)

- A third totality outcome: a spec that parses but resolves to nothing within a
  bounded two-tier search (warn threshold, then hard stop with a metric and a
  non-retryable error).
- Jitter must be clamped to the gap to the next nominal time, or it can
  reorder occurrences of one item.
- Canonicalization includes writing the normalized form BACK to storage, so
  preview, enumeration and fire read one representation. (Candidate sibling of
  wave-1's persist-the-verdict — watch for a second sighting.)
- A strong overlap-policy layer may legitimately offer only the schedule
  anchor — name the trade, don't count it as an omission.
- Observed deviation class worth its own lead: a code comment asserting a
  default ("disabled by default") that the shipped config contradicts.

## Cross-subject proposals

- Temporal's OverlapPolicy set + buffer-with-drop-counter → a stronger go
  application for overlap-and-reentrancy in a future wave.
- EventLog + FutureActionTimes + MissedCatchupWindow + BufferDropped → a
  near-complete schedule-observability realization, banked for that technique.
