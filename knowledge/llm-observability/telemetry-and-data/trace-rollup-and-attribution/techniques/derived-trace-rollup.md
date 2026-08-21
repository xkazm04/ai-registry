---
layer: technique
type: technique
subject: trace-rollup-and-attribution
technique: derived-trace-rollup
status: forged
laws: [never-present-absence-as-an-answer]
shared_with: []
use_when: [deciding whether to materialize traces, implementing the trace detail rollup, handling malformed span parentage]
---

# Derived trace rollup

Compute the trace on read, from the events, every time. There is no traces
table, no cached rollup row, no "close the trace" job. The trace is a **pure
function** from a set of events sharing a trace id to one structured view:
identity, time window, duration, status, totals, distinct models, and a span
tree reconstructed from parent links.

## Why derivation beats materialization

A trace has no end marker. Spans land late (a retried delivery, a slow
exporter flush, a parent emitted after its children — normal for
distributed-tracing producers), and any materialized row is a snapshot that
goes stale on the next arrival. The update-in-place design needs an
invalidation story, a reconciliation story, and a backfill story; the derived
view needs none, because a late span is simply included in the next read.
Derivation also makes the numbers reproducible: the same event set always
yields the same trace, which is what lets an operator's question ("why does
this say $0.41?") be answered by re-running the fold rather than by forensic
archaeology over update ordering.

The cost is read-time compute. Pay it, and bound it (see the span-cap
technique) — do not buy it back with a cache that becomes a second source of
truth.

## The procedure

1. **Sort events oldest-first** before anything else. Chronological order
   drives child ordering in the tree, first-seen model order, and waterfall
   offsets. Never trust arrival order; producers batch and retry.
2. **Take identity and the window from the events themselves** — trace id,
   tenant, first and last timestamps. The rollup receives no ambient context.
3. **Compute duration and status through the one shared definition** the list
   view also uses (see the single-shape-rule technique). Do not inline the
   arithmetic here, even though it is three lines — inlining is how the fork
   starts.
4. **Fold totals in one pass**: span count, cost sum with an unmeasured-row
   count beside it (see unpriced-span-accounting), token sums, error count,
   and summed per-span latency as a *separate* figure from wall-clock
   duration — compute time vs waiting time.
5. **Build the span forest from parent links**, with each node carrying its
   offset from the trace start and its own latency, so a consumer can place
   the waterfall bar without re-deriving anything.

## Tolerance rules for malformed input

You do not control the producers, so the fold must be total over garbage. The
invariant is: **every event appears in the output exactly once, no matter
what.** Concretely:

- An event whose parent span id is absent from the trace, or unset, is a
  root. Dangling parents are routine — the parent may be past the fetch
  bound, dropped by the producer, or simply late.
- A self-parenting event is a root, not an infinite loop.
- A parent cycle (two spans claiming each other) must neither drop the spans
  nor recurse forever: after attaching everything reachable from natural
  roots, promote whatever remains unvisited to a root. Losing a span loses
  its cost, and a rollup that can silently lose cost is not an accounting
  surface.
- Two events reporting the **same span id** are two distinct calls, not one.
  Render both; flag the later claimant as a duplicate so the reader sees two
  calls that collided rather than an inexplicable twin; and let only the
  first occurrence own the id for parent linkage, so children attach
  deterministically.

Each rule converts a producer bug into a visible-but-harmless artifact
instead of a wrong number. That is the standard: malformed input may degrade
the *tree*, never the *totals*.

## Serving the two views

The list view must not run this fold per trace — listing would then cost the
sum of all detail reads. Serve the list from a grouped aggregate in the
store, one row per trace id, and accept the discipline that imposes: any
value the aggregate cannot reproduce exactly per the shared definitions
(first-seen model order is the classic) needs a deliberate mechanism, not an
approximation, because the conformance bar is that list and detail agree
field-for-field.

A backend that cannot group by trace id at all must refuse the trace surface
with an explicit "unsupported" — never an empty page. An empty list is an
answer ("no traffic"); a missing capability is not that answer.

## When not to use it

If request volume makes even the grouped aggregate too expensive at read
time, the correct move is a *disposable* projection — a rollup cache that is
explicitly derived, rebuildable from events alone, and never written by the
ingest path — not a first-class traces table. The moment the projection can
disagree with the fold and win, the events have stopped being the truth.
