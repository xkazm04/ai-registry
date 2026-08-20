---
layer: golden-path
type: golden-path
subject: trace-rollup-and-attribution
status: forged
use_when: [building per-request views over raw call events, designing trace list and detail endpoints, defending an aggregate cost or latency number an operator reads, deciding whether to materialize a traces table]
techniques:
  - derived-trace-rollup
  - single-shape-rule
  - span-cap-truncation-signal
  - unpriced-span-accounting
  - keyset-trace-pagination
  - tenant-scoped-trace-ids
---

# Trace rollup and attribution

An agentic or multi-step application makes many model calls per user request.
Each call arrives at the observability side as one event carrying a trace id, a
span id, and a parent span id. The events are the truth; the *trace* — the
per-request view of cost, latency, and outcome an operator actually reads — is
a derived artifact computed over them. This subject is the craft of that
derivation: how to compute a rollup that is cheap to serve, identical from
every vantage point, and — above all — *defensible*, meaning every number in it
can answer the question "what exactly does this figure cover, and what does it
omit?"

The boundary matters. Builder-side tracing (owned by the neighboring
software-engineering material) ends at correct span emission: right parentage,
right timestamps, propagated ids. This subject begins where those events land
on an operator's desk — emitted by SDK versions you cannot pin, on clocks you
do not own, with ids callers invented — and ends at whether the aggregate
number the operator reads can be trusted. The seam question is never "did the
producer instrument correctly?" but "given whatever arrived, is what we display
honest about itself?"

## The trace is a view, not a table

The naive design materializes a traces table and updates it on every event.
That design is wrong for a reason that is structural, not aesthetic: **a trace
has no end marker.** Events trickle in late, out of order, and after any
moment you might have chosen to "close" the trace. A materialized row is a
snapshot that starts lying the moment the next span lands; keeping it honest
requires an update path that re-derives everything anyway, plus reconciliation
when the update path and the read path disagree. The derived view has no such
seam: every read folds the events as they exist right now, so a late span is
simply present on the next read. There is nothing to invalidate because
nothing was cached as truth.

The corollary is that the rollup logic must be a **pure function over a set of
events** — no clock, no store access, no configuration — so it can be run
identically by the detail endpoint, by tests, and by any backend. Impure
rollups fork: each caller re-implements "roughly the same" aggregation and the
forks drift apart silently. The derived-trace-rollup technique carries the
full procedure, including the tolerance rules for malformed input (dangling
parents, cycles, duplicate span ids) that real traffic guarantees you will
receive.

## Two views, one definition

Every trace surface splits into a list (compact rollups, many traces) and a
detail (totals plus the span tree, one trace). The list is served from an
aggregate query for cost reasons; the detail is folded from the raw events.
That is two computation paths for the same numbers, and two paths for one
number is a drift machine: the classic incident is a list that reports
duration as last-start minus first-start while the detail reports
last-*finish* minus first-start, so every trace whose final span had real
latency shows two different durations depending on which screen the operator
has open. Neither number is wrong in isolation — which is exactly why the
discrepancy survives review.

The remedy is the single-shape-rule technique: the *definition* of every
contested derived value (duration, status) lives in exactly one place, and
both computation paths terminate in it. Definitions worth centralizing are the
ones with a genuine choice inside them — where does a trace end, what does one
failed span do to the whole — because those are the ones two authors will
answer differently.

Choose the definitions deliberately. Duration should run from the first span's
start to the last span's **finish** (start plus latency), so a trailing call's
compute time counts; start-to-start systematically under-reports the requests
that end in a long generation, which are precisely the ones an operator
investigates. Keep wall-clock duration distinct from summed per-span latency:
the first spans idle gaps and counts overlapping work once, the second is
total compute. They answer different questions ("how long did the user wait"
vs "how much work was done") and a UI that shows one labeled as the other is
lying politely.

## Every aggregate discloses its own coverage

The laws of this bundle converge hardest on this subject, because a rollup is
nothing *but* aggregates, and every aggregate has two ways to deceive: cover
less than the reader assumes, or substitute a value for an absence.

**Coverage:** any bounded read — and a detail read must be bounded, because a
runaway agent loop can put six figures of spans under one trace id — clips the
event set, and then every derived number describes the retained spans only.
The span-cap-truncation-signal technique makes that self-describing: the
payload carries the true total, the retained count, and an explicit truncation
flag, so a clipped trace cannot be read as a complete one. The flag lives in
the data, not the documentation.

**Absence:** cost is a nullable measure — a call to a model absent from the
price book has *no* cost, not a zero cost. A sum over nullable values is a
lower bound masquerading as a total unless it carries how many rows it could
not measure. The unpriced-span-accounting technique holds that line from
ingest (never coerce null to zero) through rollup (count the unmeasured rows
beside the sum) to display. The rows that are unpriced are disproportionately
the newest models — exactly the traffic whose cost the operator most wants —
so the error is anti-correlated with vetting, and silent zeroing turns every
downstream budget and trend into a quiet lie.

The same posture governs capability gaps: a backend that cannot group by trace
id refuses the trace surface explicitly rather than serving an empty list that
reads as "no traffic". Absence of capability, like absence of measurement, is
a state to disclose, never a value to fake.

## Identity is fragile at both ends

A trace id is caller-supplied text. Two consequences follow, one about
merging and one about isolation, and both are attribution failures if missed.

Merging: the distributed-tracing standard defines hex ids as
case-insensitive, but real ingest doors normalize differently — one lowercases
on arrival, another passes ids through verbatim — and the result is one
end-to-end request rendered as two half-traces whose numbers are each
individually plausible. Canonicalize ids in **one shared function that every
ingest door calls**, folding case only for ids that are provably
standard-shaped (hex, at the standard lengths) and preserving everything else
verbatim, because a caller's own opaque id may be case-significant and folding
it would merge distinct requests. One door normalizing is a bug with extra
steps; the canonicalization must be structurally shared or it will drift.

Isolation: because the id is caller-supplied, it is not a tenant boundary —
two tenants can both pick the same id. The tenant-scoped-trace-ids technique
requires every trace read to filter on the tenant *in the query*, so a
colliding id in another tenant is invisible rather than merged and then
authorized away, and asking for someone else's trace is indistinguishable
from asking for a nonexistent one. Attribution fields that feed accounting
(which key, which principal) are stamped server-side from the authenticated
identity, never accepted from the event body — a client-writable attribution
field is an invitation to launder spend onto someone else's budget.

## Traversal must be exact

A trace list is browsed under filters, and browsing under filters with
offset pagination silently skips or duplicates rows as new traces land
between pages. The keyset-trace-pagination technique pages on a composite
cursor (activity timestamp plus trace id as tie-break) whose predicate is
independent of the content filters, so traversal is exact under every filter
combination, and serves the "n of N" count as the size of the whole matching
set — computed without the cursor — so a page never has to be mistaken for
the population.

## What defensible means here

A number is defensible when the payload that carries it also answers: over
which spans (truncation state), under which definition (the one shared shape),
missing which measurements (unmeasured-row counts), for which tenant (scoped
identity), and out of how many (a cursor-independent total). Every technique
in this subject is one of those answers made structural. The failure mode of
the naive reading — "sum the events, show the number" — is not that the sums
are computed wrong; it is that they are computed right over a set the reader
misunderstands. The craft is making the set impossible to misunderstand.
