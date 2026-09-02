---
subject: subprocess-lifecycle
domain: software-engineering
last_touched: 2026-09-02
touched_by: intake
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

## Applied to the technique layer

- 2026-08-22-10: this subject's synthetic-exit-status sighting was the fourth that triggered `unknown-is-not-a-value`; `termination-and-reaping` was deliberately NOT wired (no anchoring prose) ([[2026-08-22-10]]).


## 2026-09-02 - intake (dora, run intake-dora-0902)

`liveness-and-heartbeats` gained the section "The clock arms at first
contact, not at spawn": arming on the first genuine signal, a separate
startup deadline (pre-contact hangs are invisible to an unarmed stall
clock by construction), reset on respawn, and the input-side clause that a
staleness clock attaches only to a channel that promised continuity. The
technique had thresholds and signals and no arming rule; the source
documents both of its clocks' arming points and the restart-loop each
prevents. Measured in-run with a three-arm harness (tight ceiling,
generous ceiling, armed clocks). New application
`node--liveness-and-heartbeats` (experiment, better) against a fleet
runner whose one ceiling timer is startup bound, stall detector and
executioner at once.

Untriaged from the same source, for a later run: the child-side orphan
guard (child watches the parent pid, kills its own process group; three
named gaps) as the complement to the host-side startup sweep in
`termination-and-reaping`; and "disable restart before sending stop" as a
shutdown-ordering clause.
