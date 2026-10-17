---
layer: application
type: application
subject: harness-fault-attribution
technique: clear-the-environment-first
stack: process
verified_on: 2026-10-14
---

# Fifty-eight failures under a load of two hundred, and fifty-six that passed alone

The source is one practitioner's agent-swarm project
(`github.com/Dicklesworthstone/frankengit` at `142adb9098d5`), read as a clone on
2026-10-14. Anchors are relative to a directory holding the clone under that name. The
tree is licensed MIT with a rider; everything is restated and nothing beyond the
anchors is reproduced.

## The case

The project's revision-bound audit ran its test suite on a shared build host while many
agent sessions were compiling, at a load average the document records as roughly
190-245 on that host. Fifty-eight tests failed. Rerun alone, fifty-six of them passed;
the audit attributes them to budget cancellations under contention rather than to the
code (`frankengit/docs/REALITY_CHECK_AND_BRIDGE_PLAN.md:693 "Rerun alone, 56 of the 58 test failures pass."`).
The audit itself ran in an isolated worktree at a pinned revision
(`frankengit/docs/REALITY_CHECK_AND_BRIDGE_PLAN.md:22 "in an isolated detached worktree"`),
so the remaining two are the ones its verdict rests on.

## What it shows against the technique

Under the checklist as it stood, the fifty-six would have been filed as intermittent:
each disappeared on a rerun. The rerun changed the host load, the run's own parallelism
and the sample at once, which is the confound the amended step 7 names. The audit read
them correctly as environmental because it knew the load it had run under; the record
of that load is what made the attribution possible, and it is the field the amended
checklist asks a harness to capture while the run is live.

## What this realization cannot show

No matched-load rerun was recorded, so the fifty-six were not shown to fail again under
the original contention; the attribution rests on the cancellation messages and the
load figure, not on the decisive comparison. A fleet project's merge gate that clears a
branch-only failure on a narrowed solo rerun is the consumer-side seam where that
comparison can be run (see the run's applied row).
