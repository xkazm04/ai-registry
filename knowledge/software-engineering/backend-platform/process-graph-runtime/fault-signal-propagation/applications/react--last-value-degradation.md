---
layer: application
type: application
subject: fault-signal-propagation
technique: last-value-degradation
stack: react
status: forged
verified_on: 2026-10-14
verified_against: react@19
applied: code
ab_verdict: better
---

# Last-value degradation in a polled studio surface, as built here

This tree has no dataflow graph. Its nearest edge is a client polling a live
run on a four-second cadence, and that edge already obeyed half the technique:
a failed poll never cleared the last detail, so the cache survived the close.

## What A and B were

A: three views (extraction, strip run, training cycle) kept the last detail on a
failed poll and set one error string, which rendered beside the run LIST. The
value itself, including a status of "running", stayed on screen with nothing to
say it was read minutes ago from a server that had stopped answering. The
cached value had been laundered into a current one at the boundary where the
difference matters.

B: a pure decision takes the time of the last success, the time of the last
failure and now, and returns fresh, degraded (with the value's age) or lapsed.
Health is restored only by a success newer than the failure. The age bound is
60 seconds and is a different number from the poll interval (notice versus
inadmissible). A banner beside the run renders the result; each view reports
its success and its rejection to one small hook. A failure before any success
reports fresh, because the loading state owns it.

## Reading

Target: detail panes carrying an age and health mark after a failed poll, A 0 of
3, B 3 of 3; for a 4 s, 30 s and 10 min outage, A shows no state at any of them,
B shows degraded, degraded, lapsed. Floor: type check, the lint ratchet, the 2,255
probe suite, the build, the bundle check and the full pre-push gate (19 gates)
stayed green; the one probe that failed on the way was the repository's own
census of probes without a mutant, answered with a mutant that is killed.
Seam chosen to falsify "the cache already travels with its metadata": half did,
the value and the health string existed, but the two were rendered in different
places. Not measured: how often live polls fail long enough to lapse. Not
built: the same mark on the fourth polling view, which routes through a shared
gate rather than a local detail loader.
