---
layer: technique
type: technique
subject: watch-cache-and-resync
technique: completeness-barrier-with-a-warm-queue
status: forged
laws: [absent-guard-is-loud, failure-not-empty-success]
shared_with: []
use_when: [work starts against a replica that has not finished filling, an empty cache is indistinguishable from an empty slice, deciding whether a later resynchronisation should block dependents]
---

# The completeness barrier, with a warm queue

An empty replica and a complete replica of an empty slice give the same answer
to every question. That ambiguity is harmless right up until a consumer acts on
absence — and the consumers of a watch cache are usually convergence loops,
whose entire job is to act on absence by creating the thing that is missing. A
loop that starts one tick early against an unfilled replica does not render a
spinner; it **recreates records that already exist**, and every downstream
effect of those records happens twice. This is the strongest single argument
for the subject, and the remedy is small.

## The barrier

The replica publishes one signal, awaitable by any number of dependents, with
exactly these semantics:

- It is **closed at construction** and opens when the first complete snapshot
  is installed — which is the swap point, not the first item, not the
  connection ([atomic-swap-at-initial-sync](./atomic-swap-at-initial-sync.md)).
- It is **one-shot**: once open it never closes again, for the lifetime of the
  replica.
- It **fails** if the thing that would have opened it is destroyed. A dependent
  awaiting a barrier whose writer has been dropped must receive an error, not
  wait forever; a wait that can never complete is the same lie as an empty
  success ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
- It says nothing about freshness. It is a claim about *completeness at one
  past moment*, and a dependent that needs currency needs the position, not the
  barrier.

Dependents await it once, at start, before their first pass. That is the whole
protocol.

## Why it must never re-arm

Symmetry suggests that a later resynchronisation should close the barrier
again — the replica is, after all, temporarily rebuilding. Doing so is a
deadlock generator, for two reasons that compound.

The first is that during a re-read the replica is not incomplete: the atomic
swap guarantees it is still serving the previous complete snapshot, so the
condition the barrier exists to prevent — a consumer reasoning about a set that
was never true — does not arise. There is nothing to protect against.

The second is that closing it strands work already in flight. A dependent that
took a permit, began a pass, and is midway through an external effect now
cannot finish, because the completion path re-enters the barrier; and the only
party that can reopen it is the stream that just failed. The system converts a
recoverable staleness into an unrecoverable stall, and the stall is worst
exactly when the source is under pressure, which is when the resynchronisation
was likely to happen. **The barrier answers "has this replica ever been
complete", and that question, once answered yes, cannot become no.**

What a later resynchronisation *does* owe dependents is a nudge: after a swap,
re-notify every entry the new snapshot holds, so a consumer that missed changes
during the gap re-examines everything rather than waiting for the next
individual change. That is a different mechanism from the barrier and belongs
to the fan-out ([one-stream-fanned-out](./one-stream-fanned-out.md)).

## Warm the queue while the barrier is closed

A barrier that also stops the intake is a barrier that throws away the interval
it costs. The right composition holds the *execution* side and lets the
*intake* side run: triggers arrive, are converted into work items, and are
coalesced by key while the fill proceeds, so when the barrier opens the loop
faces one deduplicated backlog instead of a cold start followed by a burst.
Concretely: the queue accepts and dedups; the runner takes no permit until the
barrier opens; nothing about the queue's discipline changes because of the
barrier's existence.

This also disposes of the alternative everybody tries first, which is to sleep
at boot for a plausible number of seconds. A sleep is wrong in both directions
at once — too short on a large slice or a slow source, which is the failure it
was meant to prevent, and pure latency on every other start — and it cannot be
made right by tuning, because the quantity it is guessing at is a property of
the deployment rather than of the code. It also drops everything that arrived
during the nap, which the warm queue keeps.

## Wiring it is the failure mode

The barrier is a guard that must be attached, and a guard that must be attached
is absent in most installations
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)). A replica that
merely *offers* an await handle will be consumed by dependents that never call
it, and the resulting defect — duplicate creations on a slow start — is
intermittent, environment-dependent and easily blamed on the source. Two
structural answers, in preference order: have the component that assembles the
loop wire the barrier itself, so a consumer cannot construct an unguarded one;
or, where the replica must remain independently usable, make the read interface
distinguish *never filled* from *filled and empty*, so a consumer that skips
the barrier at least cannot mistake one for the other. A comment in the
documentation is not one of the answers.

## Boundary

Process liveness and dependency reachability are [health
checks](../../../service-operations/health-checks/health-checks.md), and this
barrier is not one of them: a replica can be perfectly connected and not yet
complete, and a health check that reports the connection has observed a proxy
rather than the target. The barrier is also not a scheduling primitive — the
queue it warms, its coalescing rule and its concurrency cap belong to the
convergence-loop subject, and this technique only states what that loop must
await and when. Finally, the barrier is not a lease: it grants nothing, excludes
nobody, and several dependents awaiting it all proceed together.
