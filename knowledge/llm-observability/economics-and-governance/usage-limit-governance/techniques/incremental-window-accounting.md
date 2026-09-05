---
layer: technique
type: technique
subject: usage-limit-governance
technique: incremental-window-accounting
status: forged
laws: [server-owns-the-accounting-clock]
shared_with: []
use_when: [admission cost grows with rolling-window size, maintaining rolling usage totals on the ingest hot path, proving a usage cache equals its full-scan reference]
---

# Incremental window accounting

Admission control puts an aggregate on the hot path: every ingest must know
the current rolling usage for every (window, scope) an applicable rule
reads. The naive implementation re-aggregates the whole window per event — a
sum over every stored event inside the look-back, per distinct ledger, under
whatever lock serializes admission. At a thirty-day cap the scan covers a
month of events on *every* admission, and the cost grows with the window:
the operator who widens a cap from a day to a month has multiplied the rows
under the scan thirtyfold, and admission latency with them unless the store
aggregates sub-linearly. Aggregation cost proportional to window population
is a defect that presents as a capacity problem; the fix is structural, not
more hardware.

## The rolling cache

Per accounting key — (tenant, window, scope) — keep two pieces of state: a
running total, and the per-event contributions currently inside the window,
ordered by time. Each read then does two delta-bounded steps:

1. **Fold in what's new.** Pull only events past a monotonically
   increasing insertion cursor (an auto-incrementing row id is ideal) and
   add each matching event's contribution to the total and the ordered
   contribution list. The cursor guarantees exactly-once folding
   regardless of timestamp ties or out-of-order arrival — the question
   "have I counted this event?" is answered by an integer comparison, not
   by timestamp bookkeeping. Advance the cursor past every *scanned* row,
   matching or not, so non-matching rows are never re-scanned; and make
   sure the load is genuinely a range scan on the insertion order, not a
   query the planner can quietly turn back into a window aggregate.
2. **Evict what has aged out.** Walk the ordered contributions from the
   oldest end, subtracting each one that has left the window from the
   running total, and stop at the first survivor. Both steps touch only
   the delta — events since the last check, events that expired since the
   last check — never the window's population.

Two hygiene rules for the floating-point total: snap it to exact zero when
the contribution list empties, so repeated add/subtract cannot accumulate
drift across idle gaps; and treat integer measures (calls, tokens) as
integers so they cannot drift at all.

## Evict on the server's clock

The eviction order must key on the **server's receipt time**, never the
client-supplied event time. The attack this prevents is one line of client
code: a backdated event — timestamped just outside the window — would be
admitted, consume budget in the admission decision, and then fall straight
out of the window on the next eviction pass, un-spending itself. Clients
keep their event time for debugging and display; the accounting window is
windowed on receipt, where the server is the sole author. Break timestamp
ties with the insertion cursor so eviction order is total.

## Exactness is proven, not asserted

An incremental cache is an optimization of a full-scan reference, and the
two must be *provably equal* — the eviction path especially, because an
add-only cache is right until the first event expires and quietly wrong
forever after. Property-test the cache against the reference across
randomized event sets that straddle window boundaries and repeated window
advances; assert equality of every field, not just the headline sum. The
reference implementation stays in the codebase as the oracle. A cache
whose correctness rests on code review is a cache whose first drift will
be discovered by a customer's cap.

State the clock assumption the same way: eviction is one-way, which is
correct only if the admission clock never runs backwards. Wall-clock time
at ingest satisfies this almost always, and "almost" has named exceptions —
a stepped time-sync correction, a virtual machine restored from a snapshot,
a test environment driving the clock by hand — so either read admission
time as the maximum of the wall clock and the last admission time, or write
the assumption and its under-count consequence into the module's
documentation rather than into an engineer's memory.

## Declare the coherence boundary

An in-process cache is coherent with the store for *appends* — a cursor-
based load picks up any committed event, whoever wrote it — but it cannot
see another process's *admission decisions* in flight. Two processes
admitting against the same store can each read a total missing the
other's uncommitted event and both admit past a cap. If the deployment
stance is one admission process per store, write that sentence down where
operators will read it; a cap that is strictly honored in one topology
and best-effort in another, without saying so, is a support incident with
a delay timer. Multi-process admission needs the shared-store critical
section instead (see concurrent-admission-integrity). The field's inline
gateways declare the same boundary in the same voice: a major cloud
gateway's token-limit policy documents that it tracks usage independently
at each gateway instance and does not aggregate across the deployment —
so the declaration is not an apology, it is what a shipped product does.

## The memory the cache does not avoid

The per-admission *work* is delta-bounded, but the cache's *state* is the
window population itself: one contribution per live event per (tenant,
window, scope) ledger, held until it ages out. A month-long window over a
busy tenant is millions of contributions per ledger, and every scoped rule
adds another. The field's memory-bounded alternative is the two-bucket
sliding-window counter — the current fixed sub-window's count plus the
previous one weighted by its overlap with the look-back — which holds a
handful of integers per key regardless of traffic. It is an approximation
that assumes the previous bucket's traffic was uniform: at one large edge
network's scale (400 million requests from 270 thousand sources, published
2017) it produced a wrong verdict on 0.003% of requests, an average 6% gap
between the estimated and true rate, and no false positives. That is a
sound trade for pacing, and an explicit one for a budget: a 6% error on a
rate is a 6% overshoot on a cap, and the choice belongs in the cap's
documented worst case, not in a data-structure decision nobody wrote down.

## When not to bother

While the window's population is small enough that the full scan's latency
is invisible beside the insert — a threshold to measure on the target store,
not to assume — the full scan is simpler; the cache earns its complexity
only when window population, not event rate, dominates admission cost. And
never cache across restarts without rebuilding from the store: the
contribution list is derivable state, and a persisted-but-stale copy is
worse than a cold rebuild.
