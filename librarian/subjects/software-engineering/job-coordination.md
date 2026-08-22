---
subject: job-coordination
domain: software-engineering
last_touched: 2026-08-22
dry_streak: 0
---

# job-coordination

First touch: [[2026-08-22-5]], external reconcile against `riverqueue/river`
@ `f748a5c` (v0.44.1). Gained `go--step-position-and-resumability`
(uncovered) — second stack; single-stack debt cleared. All three hints refuted
or outranked; the tree's first-class resumable-step feature won on evidence.

## Open leads (banked, convergence rule applies)

- The resume path must be directly testable — seedable resume state, so
  re-entry is not first exercised in production.
- Enforced-unique step names as the cheaper alternative to plan versioning —
  a legitimate point on the curve the technique should name.
- Cursor-deleted-on-completion as a two-fact encoding (frontier +
  cursor-presence distinguishes done from partway).
- Name the durability boundary of the position write (which transaction), not
  just its ordering — attempt-boundary batching is the silent degrade.

## Cross-subject proposals

- No lease renewal AT ALL in a widely-used production queue (fixed RescueAfter
  horizon instead) — a strong negative data point for lease-renewal's "any
  hold longer than minutes renews" claim.
- MetadataKeyRescueCount is a dead constant where rescue lineage was intended
  → terminal-state-recovery material.
- attempt-rewinding soft stop ("graceful shutdown is not a failed attempt") →
  background-jobs. Note: same family as the wave-1 golang-migrate deviation
  (graceful stop returning success) — opposite outcomes, same design point.
