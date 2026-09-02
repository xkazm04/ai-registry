---
layer: application
type: application
subject: health-checks
technique: probe-design
stack: rust
verified_on: 2026-09-02
verified_against: rust@1.96
applied: simulation
ab_verdict: better
proof: structural-only
---

# An ownership heartbeat and no progress probe, by design and by omission

A benchmark queue's worker runs on the host beside a containerised API,
claims jobs over HTTP, and proves it is alive one way only: it renews the
job's lease from a dedicated thread on a fixed timer — a third of the lease
TTL, so two consecutive misses still hold the job. The renewal endpoint
carries nothing but liveness on purpose; progress rides a separate route so
that a stall in computing progress can never stall the renewal. The worker's
own comment states the rule the consuming-probe section keeps apart from it:
*liveness must never wait on anything the work computes, or a live-but-stuck
worker reads as dead.* That is the ownership heartbeat, built correctly, for
the reason the technique gives.

## The structural fact

The tree holds the first half of the split and nothing of the second, and
the shape of the code shows it was never designed to. The API exposes a
health route for itself, a claim route and a renew route; no route learns
that a worker exists when it is not holding a job. Three consequences fall
out of the structure rather than any decision:

- An **idle worker that has died** is invisible. Nothing renews because
  nothing is held, and the first evidence is a queue whose oldest job's age
  keeps growing.
- A **worker wedged inside a job** renews forever. The renewal thread is
  independent of the work by design, so the lease is healthy, the job is
  not reclaimed — which is what the tree wants — and no surface says
  *stuck*. The API can tell "held" from "released"; it cannot tell "held and
  progressing" from "held and hung".
- The worker's loop already has the two places a consumed token would be
  written from: the end of each poll iteration (including the idle sleep)
  and each case boundary inside a job. Neither writes anything.

Nobody built the second half wrong; nobody built it. That is the missing
stage the technique's split predicts: a lease answers ownership, and a
system whose only pulse is the lease has no progress instrument.

## The simulation, three cases from the tree

The measurable is *time to an operator-visible signal* under policy A (the
tree as it is) and policy B (a consumed token written at each loop
iteration and each case boundary, deleted by a 60-second probe with three
retries, start period sized to the worker's warm-up).

1. **Idle worker killed** (the host reboots; the runner service is not
   restarted). A: no signal until a job is enqueued and its age is noticed
   by a person — hours, unbounded. B: red within three minutes.
   Falsifier: a dashboard that already alarms on queue age below that
   bound.
2. **Worker hung inside a long case** (the model call never returns; the
   cancel watcher sees no cancellation). A: the lease renews at TTL/3
   indefinitely, the job is held, nothing is red; the cancel path works
   only if a person suspects. B: the token stops at the last case boundary;
   red after interval times retries; the lease is untouched, so the job is
   *not* reclaimed — the operator sees *stuck* and decides. Falsifier: a
   legitimate case longer than three minutes, which the runner's job class
   would have to declare as its quiet phase or B cries wolf.
3. **Transient API blip** (renewal fails once with a network error). A: the
   TTL/3 cadence absorbs it, by the tree's own test. B: the token is
   written locally and never touches the API, so the blip is invisible to
   it. Neither arm changes; the case exists to show B adds no new false
   positive on the failure the tree already tolerates.

Verdict **better**, as a simulation: B adds a progress signal without
touching the ownership mechanism the tree defends in its comments. Not a
few lines — the worker needs a token writer and the host needs a probe
that can see it — so filed as the project's next change rather than
shipped. The instrument that would make it an experiment is a replayed
run with a planted hang, read by the probe.

## What the realization cannot do

A consumed token proves the loop turned; it does not prove the case
produced anything. A worker looping on a retry that never succeeds writes
a perfect token. Progress in the sense of *results recorded* is the
separate route the tree already has, and the two are read together.
