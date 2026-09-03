---
layer: technique
type: technique
subject: metric-surface-contract
technique: derive-outside-the-hot-loop
status: forged
laws: [derivation-names-recomputation, count-carries-predicate]
shared_with: []
use_when: [instrumenting a latency-critical loop, deciding what the fast path may compute, metric collection shows up in a profile of the thing it measures]
---

# Derive outside the hot loop

A hot loop is any path whose per-iteration cost sets a user-visible floor: the
per-token step of a streaming generator, the per-request inner path of a
proxy, the per-frame step of a renderer, the per-message path of a broker.
Work added there is paid at the loop's frequency, forever, by every consumer
of the service — and observation work is uniquely bad at being noticed,
because it is added in small, individually defensible increments by people who
each measured nothing.

The rule: **the hot loop emits facts; a slower loop turns facts into
metrics.** Emission is producing something the loop was already holding —
an outcome, a count, a moment. Derivation is everything that turns those into
an exported surface: folding, dividing, bucketing into a histogram, resolving
label sets, allocating, formatting, locking a shared registry.

## Why the split, stated as costs and not as taste

- **The instrument becomes part of the measured cost.** A timer around the
  hot path measures a path that now includes the timer, the registry lookup
  behind it, and whatever contention that lookup has under concurrency. The
  distortion scales with load, which means it is largest exactly at the load
  the number was collected to explain.
- **The distortion is invisible in the output.** A slow request shows as a
  slow request; nothing in the exported series says a tenth of it was the
  exporter.
- **The outer loop's time is often already spent.** In systems where the hot
  loop is waiting on something else — a device, a peer, a disk — the loop
  around it has real time that overlaps that wait. Derivation placed there
  costs nothing that was not already being spent.

## The procedure

1. **Name the loop and its per-iteration budget.** "The step runs at N per
   second; the budget for all observation in it is a stated fraction of one
   iteration." A budget nobody wrote down is a budget nobody can be over.
2. **Enumerate what the hot loop already knows** at the moment of interest,
   and ship exactly that. Facts that are free because the loop is already
   holding them: an outcome enum, a count it just computed, a moment it can
   stamp with one clock read.
3. **Attach the facts to the value the loop already returns.** The output of
   a step — the batch of results, the response object, the completion record
   — is the transport. Adding a small field to something already being
   returned costs an assignment; opening a second channel out of the hot loop
   costs a queue, a lock, and a new failure mode.
4. **Derive in the loop that consumes that output.** The consumer already
   iterates the results; the fold, the histogram observation and the label
   resolution ride that existing traversal.
5. **Make the derivation restartable and re-runnable.** Anything derived from
   shipped facts must state how it is recomputed
   ([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)):
   a fold that can only be reproduced by replaying a live production loop is
   not testable, and a bug in it is not diagnosable.

## What may stay in the fast path

Not "nothing" — the rule is about the *class* of work, not a superstition:

- **Incrementing an integer the loop owns.** Uncontended, no allocation, no
  registry lookup. This is the backbone of every count and is affordable
  essentially everywhere.
- **One monotonic clock read at a transition the loop owns.** Required, not
  merely permitted: nothing outside the loop can take that stamp truthfully
  (see [same-process-monotonic-intervals](./same-process-monotonic-intervals.md)).
- **Setting an enum or a flag** already computed for control-flow reasons.

What does not stay, however small it looks: string building, map lookups keyed
by dynamic labels, anything that takes a shared lock, anything that allocates
per iteration, anything that touches a registry with global state, and any
call into a collection library whose cost you have not measured *in this
process, under concurrency*.

## Decision rules

- **When a metric requires work the hot loop was not already doing, that work
  moves out — and if it cannot move out, the metric does not ship.** A metric
  is never worth degrading the primary function; there is always a cheaper
  proxy or a sampled version (see
  [sampled-metrics-declare-their-rate](./sampled-metrics-declare-their-rate.md)).
- **When the outer loop can derive a quantity from facts it has, it derives
  it — and never fabricates one it cannot see.** The boundary between those
  two cases is the subject of the interval technique, and it is where this
  split is most often taken one step too far.
- **When the fast path's emission grows past a handful of fields, stop and
  re-derive the vocabulary.** A growing per-iteration payload is a sign that
  derivation is creeping back in disguised as data.

## When not to use this

- **A loop with no latency contract.** A nightly job or a background reconcile
  has no per-iteration floor worth defending; the indirection costs clarity
  and buys nothing.
- **When the emitted facts would be larger than the derived result and cross a
  process boundary.** Shipping a thousand raw stamps per step across a socket
  so a peer can compute one number has moved the cost, not removed it — derive
  locally, export the result.
- **Debug-time investigation.** A human hunting a specific defect may
  legitimately put an expensive probe in the hot path, behind a switch, for a
  run. That is not an exported metric and does not live under this contract.

## The failure mode this prevents

The characteristic incident is not a crash. It is a service whose latency
regressed by a few percent per release for a year, where every individual
change was one small timer added by someone doing the right thing, and where
the profile eventually shows the observability layer as a leading cost centre
— measured, ironically, by the only instrument nobody had instrumented. Any
number that leaves this layer carries what it counted and how
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)),
including — when it matters — the fact that it was derived downstream of the
loop rather than inside it.
