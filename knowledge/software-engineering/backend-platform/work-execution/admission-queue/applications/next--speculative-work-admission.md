---
layer: application
type: application
subject: admission-queue
technique: speculative-work-admission
stack: next
verified_on: 2026-08-31
applied: code
ab_verdict: better
proof: ab-paired
---

# Probe-and-skip in a browser prefetch queue (Next.js)

A React/TanStack-Query prefetch subsystem that submits speculative fetches from three
triggers — hover, scroll, and a prediction engine — into one shared priority queue.
The queue is the technique's gate: a bounded structure (50 entries) drained at a small
concurrency (3 by default) whose arrivals are, by construction, work that may never be
needed. It is the cleanest instance of this technique's subject matter, because *every*
arrival is speculative and the system already carries an analytics counter for the exact
waste the technique predicts (`unused`, alongside `hitRate`).

The realization is a **counter-example on the technique's central rule**, and adopting
the rule was measured rather than asserted. On arrival, the manager calls
`queue.enqueue(request)`: a speculative fetch that finds the gate busy takes a position
in the waiting line and is promoted later, which is exactly the "queue the redundant
work" behaviour this technique argues against. The queue is not naive about it — it
dedupes by id, expires entries after 30s, sorts by a priority score (hover 100, scroll
50, prediction 10), and evicts the lowest-priority entry when full — so the design has
already reached the shed-policy and priority disciplines this subject teaches. What it
has not reached is the prior question of whether a speculative arrival should be allowed
to wait at all.

## What the tree already confirms

Two of this subject's rules are independently realized here, and both are worth naming
because they establish the seam as a serious one rather than an oversight:

- **Load-aware admission is present and adaptive.** A bandwidth detector subscribes to
  network changes and lowers the queue's concurrency as the connection degrades,
  pausing the queue entirely under the worst conditions. That is
  [load-aware-admission](../techniques/load-aware-admission.md) built correctly — the
  gate consults the host's real condition rather than a static count.
- **The waste metric already exists.** The analytics record distinguishes prefetches
  that were later used from prefetches that expired unused, and reports a hit rate.
  A system that already counts its own wasted speculation is one whose gate can be
  evaluated without adding instrumentation.

The first of these is what makes the seam *reachable*: because concurrency is lowered on
slow networks, congestion is not hypothetical here — it is a state the system
deliberately enters.

## The A/B

Same arrival trace through the real `PriorityQueue` class in three arms, with execution
resolved on a virtual clock so a 12-second session runs instantly. The trace is an
86-arrival scroll-heavy session: 60 scroll arrivals at 200ms intervals, 20 predictive
arrivals at 600ms intervals, and 6 hover arrivals at the moments a user actually reaches
for something. Each arrival carries a value window — how long its result stays useful
(hover 2s, scroll 4s, prediction 6s) — and a dispatch is scored **useful** if it
completes inside that window and **wasted** if it completes after it, which is the
`unused` counter's definition.

- **Arm A** — current behaviour: enqueue everything.
- **Arm B1** — probe-and-skip applied to every arrival.
- **Arm B2** — probe-and-skip applied to speculative sources only; hover arrivals still
  queue. This is the technique as written.

Swept across the three network tiers the bandwidth detector itself models.

| Condition | Arm | Dispatched | Useful | Wasted | Useful % | Hover served |
| --- | --- | --- | --- | --- | --- | --- |
| 4g — demand 86, capacity ~120 | A | 86 | 86 | 0 | 100 | 6/6 |
| | B1 | 83 | 83 | 0 | 100 | **3/6** |
| | B2 | 85 | 85 | 0 | 100 | 6/6 |
| 3g — demand 86, capacity ~30 | A | 52 | 18 | **34** | 34.6 | 6/6 |
| | B1 | 30 | 30 | 0 | 100 | **0/6** |
| | **B2** | 30 | **30** | **0** | **100** | **6/6** |
| 2g — demand 86, capacity ~10 | A | 17 | 5 | 12 | 29.4 | 3/6 |
| | B1 | 10 | 10 | 0 | 100 | **0/6** |
| | **B2** | 10 | **8** | 2 | 80 | **4/6** |

## What it says

**Under congestion the technique wins on every axis at once, which is unusual.** At the
3g tier the current arm dispatches 52 prefetches to produce 18 useful ones — 34 fetches
of bandwidth spent on results that arrived after the moment that would have used them.
The technique's arm dispatches 30 and every one lands: **more useful prefetches (30 vs
18) for less total bandwidth (30 dispatches vs 52)**. The gain is not a trade — the
waiting line was actively converting useful work into waste, because a prefetch promoted
after a queue wait has already outlived its window. The 2g tier repeats it at smaller
scale (8 useful vs 5, on 10 dispatches vs 17).

**Above saturation the technique is a no-op, and that is the honest headline for the
default case.** At 4g this project's queue never saturates: 86 arrivals against ~120
capacity, arm A wastes nothing, and there is no waste to recover. Adopting the change
for the default network tier buys zero. The value is entirely in the degraded tiers —
which this project does reach deliberately, and which is why the finding is actionable
rather than academic.

**The B1/B2 split is the most useful thing the run produced, and it corrects the
technique's own most likely misreading.** A probe that skips indiscriminately looks like
the simpler, more faithful implementation. It is the harmful one: it serves **0 of 6**
hover prefetches at both congested tiers, because the high-intent arrivals are precisely
the ones that show up during a burst. It even costs 3 of 6 hover prefetches at 4g, where
it should have done nothing at all. The class of an arrival has to be something the gate
reads, not something it infers from load — and this measurement is what promoted that
sentence in the technique from a caveat to a boundary.

## What shipped

The B2 policy is now the tree's behaviour: speculative arrivals are probed against the
queue's live concurrency limit and skipped when it is saturated, hover arrivals still
queue, and a `congestionSkips` counter joins the existing `bandwidthSkips` so the skip
rate this technique asks to be published is visible beside the waste rate it reduces.
Two files, 43 lines, no change to the queue's own admission logic — the probe sits in
the manager, above `enqueue`, which is where the class of an arrival is still known.

The measured no-op at 4g is why the gate is a probe rather than a smaller queue bound: a
lower `maxSize` would shed under conditions where there is nothing to shed, whereas a
probe against the *live* limit fires only when the bandwidth detector has already lowered
that limit — the two mechanisms compose instead of competing.

## What this realization cannot show

The value window is a model, not an observation: the trace assigns each source a fixed
usefulness horizon rather than replaying recorded navigation timings, so the *magnitude*
of the waste is a property of that model and only the direction is robust. Confirming
the magnitude needs the project's own `hitRate` and `unused` counters read from a real
session under a throttled connection, which is an instrument the project has but this
run did not run a browser to collect. The dispatch and skip counts are exact — they come
from the real queue's own admission decisions — but the useful/wasted split inherits the
window assumption.
