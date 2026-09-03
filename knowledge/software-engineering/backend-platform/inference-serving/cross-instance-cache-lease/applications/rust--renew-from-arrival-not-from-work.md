---
layer: application
type: application
subject: cross-instance-cache-lease
technique: renew-from-arrival-not-from-work
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.85
applied: experiment
ab_verdict: not-better
proof: structural-only
---

# A fenced relay lease in a self-hosted observability service

This document records a **negative** application, and it is the more useful
kind: the technique was carried to a tree that already satisfies it, and the
tree turned out to hold two refinements the standard did not have. Nothing was
changed. What follows is what the tree proved.

The stack is a Rust workspace serving a task-relay queue over an embedded
database, with agent processes that lease work, renew, and report. It was read
at the working tree of 2026-09-03; the technique being tested was forged the
same day against an unrelated open-source inference engine, pinned at commit
`facd9a74a1cd1b9fed324cdc2cceb8d54fdad3d0`. Two independent systems, no shared
lineage, same problem.

## What the arms were

**A** — the tree as it stands. **B** — the tree with the technique's rule
applied. There was no diff to make: B is A. The comparison is therefore
structural, not behavioural, and it is reported as `structural-only` rather
than dressed up as a measurement. The measurable that would have decided a
behavioural arm — lease expiries correlated with queue depth rather than with
holder crashes — cannot move, because the arms are identical.

## Confirmation: renewal is a door of its own

The renewal endpoint takes an identifier and a fence, and nothing else. The
progress endpoint is a *separate route with a separate handler*, and the trait
that defines the storage contract says why, in a comment written by someone who
had evidently thought about it: liveness detail is published on its own door,
never on the renewal, because a holder that is alive but stuck computing
something to say would otherwise read as a dead one.

That is the technique's rule, reached independently. It is also the sharper
statement of it — the version forged from the inference engine derived the
separation from the *arrival* argument (renew before you work), while this tree
derives it from the *reporting* argument (renew without having to speak). Both
are true and they are different failures; the technique was amended to carry
the second, which came from here rather than from the source it was forged
against.

## Confirmation, and an upward correction: the fence

The renewal carries a generation token. The source system that produced this
subject has none — the forging pass recorded that as a deviation and refused to
lower the standard on the strength of "the transfer is read-only, so a stale
renewal is harmless". This tree, facing the same problem with a queue whose
tasks are handed to exactly one holder at a time, issues a fence and requires it
back on every renewal and every progress update.

Two independent trees, one with the token and one without, and the one without
is the one that can be argued into it. That is the strongest form of support a
standard can get from an application: the deviation was recorded as a shortfall
before this tree was opened, and this tree is the second sighting that says the
shortfall is real rather than a matter of taste.

The fence is also what makes the amended rule above implementable. A fence is a
value the holder was handed at acquisition; a timer can attach it with no
access to the work in flight. It is the one payload a renewal may carry without
becoming a report.

## What this realization cannot do

The relay lease renews on a wall-clock timestamp exchanged between processes,
not on a monotonic reading, so it does not exercise the sibling technique about
deadlines that are not portable between clocks — the question does not arise
here, and a reader looking for evidence on that point should not take this
document as any.

The storage trait's default implementation refuses the whole relay queue with
an explicit unsupported error rather than returning a permissive default, so a
backend that has not implemented leasing cannot silently behave as though every
renewal succeeded. That is worth copying independently of anything in this
subject.

Nothing here measures the lease *durations*. Whether the interval and extension
are correctly sized is exactly the question this application cannot answer, and
the instrument that would answer it — expiry counts labelled by cause, holder
crash versus backlog — does not exist in either tree.
