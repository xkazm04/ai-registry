---
domain: software-engineering
subject: realtime-events
last_touched: 2026-09-03
touched_by: intake
dry_streak: 0
---

# realtime-events

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-08-27 - /intake, from a coding-agent harness tree ([[2026-08-27-whip-coding-agent-harness]])

First touch. `subscription-lifecycle` gained "The second sharp edge: dispatch outside the
registry's own lock".

**The map signal was the strongest of the run and worth recording as a calibration point:**
the term `broadcast observer deadlock` returned **one** hit across 337 subjects, and that
one was spurious. A near-total empty over a concern this corpus obviously touches was
either a real hole or a seam, and reading the top prior-art subject settled it in one pass
- which is exactly what the near-empty rule is for.

It was a seam, inside an enumeration. The fan-out section closes with *"The fan-out loop
has one sharp edge: a consumer's callback may detach other consumers (or itself)
mid-dispatch. Iterate over a snapshot of the set..."* - and snapshotting answers **set
mutation**. It says nothing about **lock ownership during dispatch**, and a dispatcher can
snapshot correctly while still holding the registry mutex for the whole loop. That is the
deadlock: the producer holds the mutex and parks on a subscriber's backed-up delivery
queue, while the surface owning that queue takes the mutex to enumerate subscriptions and
paint. Both stacks look innocent alone, which is why it is found in a thread dump and
essentially never by reading the dispatcher.

Amended to two sharp edges, with both rules stated as jointly required (snapshot under the
lock, invoke after releasing it; a subscriber whose delivery can park detaches the
hand-off), and the ordering guarantee the second rule trades away.

The interesting part of the write-up is that the trade **resolves against this subject's
own material**: `push-vs-refetch-reconciliation` already establishes that a surface
resyncs from the settled record, so a reordered interim frame costs nothing durable while
a stalled producer loses the work. That is why the amendment belongs here rather than in
`concurrency-guards` - the general lock rule would have been homeless, and the reason it
is worth paying is local to this subject.

Also landed: the regression-test shape, because this defect returns whenever someone
consolidates the dispatcher back under one lock. A subscriber parked on a wait that never
completes stands in for the backed-up queue; the assertion is that the dispatcher finishes
anyway; and it must hang against the pre-fix dispatcher, which is the only evidence it
tests the thing.

## Open leads

- **The in-process bus half is thinner than the outbound half.** `outbound-fan-out` opens
  by declaring it models the *external* leg and is dense on watermarks, durability and
  shedding; the in-process dispatch path is spread across `event-registry` and
  `subscription-lifecycle` and had no owner for its concurrency properties until this run.
  Worth a sweep for other in-process asymmetries.

## Standing debt

- **Never swept by `/librarian`.**
- The subject carries 6 techniques and 2 applications (`react`, `rust`).

## Declines

None.

## 2026-09-03 - `/intake` kube-rs (run `intake-kube-0903`, intake 2.3.1, Opus workers)

Golden path gains "The discriminator: when replication is the right answer" beside the sentence "invalidation, not replication" (line 79): replication is correct only under four stated source properties (totally ordered, resumable, compacting change log with an explicit desync signal). The other side of the same discriminator is the new subject `watch-cache-and-resync` under `operations/control-plane-operations`, born the same run.

## 2026-09-03 - intake `intake-chatterino2` (2.3.2)

New technique `capacity-packed-subscription-pool` (push connections with a fixed topic
capacity, packing into the first with room, a per-topic state machine so reconnect and
unsubscribe cannot race) with a `cpp--` application whose negative finding is the point:
the source holds the two halves of the technique in two pools that never meet, with a
literal TODO where the capacity check should be. Amendment in `subscription-lifecycle` for
deliberately synchronous dispatch where a subscriber transforms the item before render and
may itself publish - the rule becomes a re-entry budget. Unapplied in the fleet (no project
multiplexes capped push connections); return condition recorded.
