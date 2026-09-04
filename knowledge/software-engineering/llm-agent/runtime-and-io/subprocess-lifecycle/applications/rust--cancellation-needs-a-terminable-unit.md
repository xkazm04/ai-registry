---
layer: application
type: application
subject: subprocess-lifecycle
technique: cancellation-needs-a-terminable-unit
stack: rust
status: forged
verified_on: 2026-09-04
verified_against: rust@1.80.0
applied: experiment
ab_verdict: better
proof: structural-only
---

# One tree, both sides of the discriminator

A local desktop agent host - one operator per install, running personas over
wrapped CLIs - has **two cancel paths**, and they sit on opposite sides of this
technique's own question. That is the finding, and it is stronger evidence than
a tree that simply got it wrong would have been. The stack version is the one
the tree witnesses: `rust-version = "1.80.0"` in its Tauri crate manifest.

## The path with a terminable unit gets it right

The agent-execution canceller runs the full ladder. It marks the execution
cancelled, then **kills the child OS process** - the comment states the stake
plainly, *"Kill the child OS process to stop API credit consumption"* - and
only then awaits the spawned task under a bounded five-second timeout so it can
finish writing its metrics.

Signal, terminate the unit, bounded grace for the bookkeeping. Nobody needed
this technique to write that, which is the point: where a terminable unit
exists, the correct shape is discoverable, and this team discovered it. The
five-second window is also the honest form of the grace period - it is time
granted to *finish recording*, after the resource has already been reclaimed,
not time spent hoping the work stops.

## The path without one writes the same status anyway

The background-job manager's `cancel` fires a cooperative cancellation token
and then sets the job's status to failed with `"Cancelled by user"`. A stale
sweeper does the same on a timer. Both write the terminal status
**unconditionally**, and neither has anything to terminate:

- **29 call sites** invoke the guarded spawn helper.
- **2 bind the returned `JoinHandle`** - and both are the same unit test.
- **27 production sites drop it.** Reaped is not low here; it is structurally
  zero.

The instrument was asserted before being believed: the helper's own definition
served as a known positive, and both binding sites were opened individually to
confirm they retain the handle rather than merely matching the pattern. They
do, and they are test scaffolding.

The tree is candid about the cause. The helper's doc comment says:

> **This preserves what the call sites do today, including dropping the
> `JoinHandle`.** ... Making these tasks abortable is a separate,
> behaviour-changing piece of work.

An honest deferral - and the job entry type already carries a slot for the
handle it never receives.

## Why this is the technique's thesis rather than a bug report

The two paths differ in exactly one property: whether a unit exists whose death
the host survives. Where one does, cancellation is a fact. Where none does,
the same team wrote a cooperative token and a terminal status beside it, and
the status became a **reclaim claim the system cannot support** - the
`failure-not-empty-success` shape, where the caller reads a clean cancellation
and the resource is still running.

Nobody designed that asymmetry. It fell out of placement, which is precisely
the ordering rule the technique states: **placement decides cancellability, so
decide it in that order.** The background path did not choose cooperative
cancellation on the merits; it inherited it from a spawn helper that drops
handles, and then wrote the consequence down as though it were the contract.

## The A/B, and why the verdict is `better` without a code arm

**A** is the system's current claim that a cancel cancels, uniformly, for which
the evidence is a status string. **B** is the technique's predicate applied to
the same population: one path reclaims and reports truthfully, one path
reclaims nothing and reports identically. B is the true description; A is what
ships to the user. The improvement is that the two paths are now
distinguishable, and the boundary between them is a stated question rather than
an accident of which helper a caller reached for.

No behavioural arm was runnable in this session. Making the 27 sites abortable
is the "behaviour-changing piece of work" the tree names; it exceeds a few
readable lines and belongs on a branch with the project's own review, so this
row is filed as the project's next change rather than shipped here.

## What to do first, and in which order

1. **Say what a cancel actually did**, on the path that cannot reclaim.
   Distinguish *cancellation requested* from *cancelled and reclaimed*. This
   costs a status value and no behaviour change, and it stops the system
   asserting a reclaim it cannot perform.
2. **Then close the gap**, by storing the handle in the slot the job entry
   already has and aborting it on the cancel path - at which point signalled
   and reaped become two real numbers whose difference is the metric.

Doing (2) without (1) leaves the window where the claim is still wrong. Doing
(1) alone is already a net gain in honesty and is reversible.

## What this application cannot show

A killed process tree is reclaimed at the operating system's granularity, and
nothing here verifies that grandchildren spawned by a wrapped CLI die with it -
the technique's `reclaims` versus `stops watching` distinction is exactly where
that would be published, and this tree publishes neither list. That is the next
measurement, not a claim this document gets to make.
