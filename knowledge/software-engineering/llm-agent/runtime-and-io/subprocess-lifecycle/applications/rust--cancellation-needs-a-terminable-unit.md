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

# A cancel that reports a reclaim nobody can perform

A local desktop agent host — one operator per install, running personas over
wrapped CLIs — supervises long work through a background-job manager. The
stack version is the one the tree witnesses: `rust-version = "1.80.0"` declared
in its Tauri crate manifest. Its
cancel path is two statements: fire a cooperative `CancellationToken`, then set
the job's status to `failed` with the message `"Cancelled by user"`. A
stale-job sweeper does the same thing on a timer, marking any job past its
deadline `failed` and cancelling the token so the task "can clean up if still
alive".

Both write the terminal status **unconditionally**. Neither observes whether
anything stopped.

## The measurement

The technique's rule is that a cancel whose reclamation is unverified is a
claim without a predicate, and that the two counts to emit are *units
signalled* and *units reaped*. Counting the population that could be reaped at
all:

- **29 call sites** invoke the guarded spawn helper.
- **2 bind the returned `JoinHandle`** — and both are inside a unit test.
- **27 production sites drop it**, so there is no handle to abort. Reaped is
  not low; it is structurally zero.

The instrument was asserted before being believed: the helper's own definition
was used as a known positive, and the two binding sites were opened
individually to confirm they really retain the handle rather than merely
matching the pattern. They do — and they are test scaffolding.

Meanwhile `.abort()` appears **15 times elsewhere** in the same tree, on
handles that other subsystems do retain. The mechanism is present and
understood. It is simply not connected to the path that tells the user their
job was cancelled.

## The tree says so itself

This is not a defect discovered against the authors' intent. The helper's own
doc comment states it:

> **This preserves what the call sites do today, including dropping the
> `JoinHandle`.** … Making these tasks abortable is a separate,
> behaviour-changing piece of work.

That is an honest deferral of the work. What the technique adds is that the
deferral has a *reporting* consequence which is separable from it and much
cheaper: while the tasks are un-abortable, the status `"Cancelled by user"` is
a reclaim claim the system cannot support. Under
`failure-not-empty-success`, the caller reads a clean cancellation and the
resource is still running.

## Why the verdict is `better` without a code arm

The technique predicted a specific, checkable shape — a cooperative token, a
terminal status written beside it, and no reclamation count — and the tree
matched all three. The A/B is structural rather than behavioural: **A** is the
system's current claim that a cancel cancels, for which the evidence is a
status string; **B** is the technique's predicate, under which the same
population measures 27 unreclaimable sites and zero reaps. B is the true
description and A is the one shipped to users, which is the improvement.

No behavioural arm was runnable in this session. Making the tasks abortable is
the "behaviour-changing piece of work" the tree names, which exceeds a
few readable lines and belongs on a branch with the project's own review — so
this row is filed as the project's next change rather than shipped here.

## What the harness could do first, and cheaply

The two halves separate, and the cheap half is the honest one:

1. **Say what a cancel actually did.** Distinguish *cancellation requested* from
   *cancelled and reclaimed*, the way the status vocabulary already
   distinguishes failure from timeout. This costs a status value and no
   behaviour change, and it stops the system asserting a reclaim it cannot
   perform.
2. **Then make the population reclaimable**, by retaining handles at the spawn
   sites that supervise cancellable work and aborting them on the cancel path —
   at which point the two counts become non-trivial and the gap between them is
   the real metric.

Doing (2) without (1) leaves the window where the claim is still wrong. Doing
(1) alone is already a net improvement in honesty and is reversible.
