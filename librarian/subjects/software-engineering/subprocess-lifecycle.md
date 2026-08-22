---
subject: subprocess-lifecycle
domain: software-engineering
last_touched: 2026-08-22
touched_by: external-reconcile
dry_streak: 0
---

# subprocess-lifecycle

First touch: [[2026-08-22-9]], external reconcile against
`containerd/containerd` @ `301026e` (2.4.0-beta). Gained
`go--termination-and-reaping` (uncovered) - second stack; single-stack debt
cleared. Liveness hint partly refuted: the instrument is one budgeted ttrpc
round-trip at daemon load, not heartbeats - no periodic pulse exists.

## Open leads (banked, convergence rule applies)

- Deliberate non-parenting as a design position: either the parent owns the
  tree and drops kill it, or a detached supervisor owns it and the host owes
  a reconnect-or-reap sweep. The technique should name the fork.
- Exit collection as a broadcast with per-consumer filters - a subreaper
  cannot know which awaited handle a reparented pid belongs to.
- Init exit is the LAST exit published - an ordering invariant on the exit
  stream, implied but never stated.
- Fail-toward-killing on unreadable spec. (THIRD tree sighting of the
  fail-closed family - see [[2026-08-22-9]].)
- The sweep's liveness proof is an answered call under a budget, never a mere
  reconnect.
- Deviation lead: lost published as a synthetic exit status (255/137)
  indistinguishable from observed codes. (FOURTH sighting of
  unknown-is-not-a-value - law question triggered; see [[2026-08-22-9]].)

## Cross-subject proposals

- A reaped exit does not mean the pipes are drained -> streaming-output.
- Carry the context error into the kill message explicitly; the platform
  will not -> a shutdown/resilience home.
- ShouldKillAllOnExit as a second failure-direction exemplar -> the sibling
  authorization application's subject.
