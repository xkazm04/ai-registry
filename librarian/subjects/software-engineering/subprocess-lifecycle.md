---
subject: subprocess-lifecycle
domain: software-engineering
last_touched: 2026-09-04
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

## 2026-09-03 - intake `intake-chatterino2` (2.3.2)

Amendment in `liveness-and-heartbeats`: inbound traffic is the pulse so a probe is sent
only after a silent tick, and a watcher tick that fires far past its schedule (the host
slept) withholds a verdict - one probe plus the ordinary grace, never a death declaration.
This was the run's code A/B: the fleet desktop app's cloud health monitor entered its
reconnect loop on the first post-resume failure; with the guard it re-probes once. Two of
three assertions fail on the original, three of three pass on the change, control intact,
merged after a green gate. The `react--liveness-and-heartbeats` application carries the
table.

## 2026-09-04 - intake `exo` v2.5.0 ([[2026-09-04-exo]], run intake-exo)

**Amendment to `termination-and-reaping`: rung 2 splits when rung 1 is
acknowledged.** The ladder's single grace period is written for a polite stop
whose receipt is invisible. Where the stop request is delivered by a mechanism
the child must actively *consume*, receipt becomes observable and one constant is
standing in for two questions - "did you hear me?" and "are you done yet?" -
which fail for unrelated reasons and want opposite durations. Size it long and a
child that never heard holds its slot on every shutdown; size it short and a
healthy child mid-flush is killed. So: a short claim deadline bounded by delivery,
then the original completion window starting only once the claim is observed, and
a child that misses the claim escalates straight to forcible kill because it has
demonstrated it cannot participate. Make the acknowledgement the same act as the
receipt - a token the requester creates and the child consumes atomically - since
a separate "I heard you" message is a second thing that can be lost. Record which
deadline was missed: version skew and workload overrun are different defect
reports, and collapsing them is `unknown-is-not-a-value` in the ladder's own books.

**This is the run's convergent finding.** Two design-read workers, on two
different systems of the source tree (the host supervisor and the adapter
runtime), reached it independently without seeing each other's output, and both
concluded the technique does not model the split. Verified by the director against
the technique text before landing.

**Apply: unapplied**, and the absence was searched rather than assumed. No fleet
project has a cooperative stop with an acknowledgement; children are spawned with
a deadline and killed when it fires, so there is no rung 1 to split.
