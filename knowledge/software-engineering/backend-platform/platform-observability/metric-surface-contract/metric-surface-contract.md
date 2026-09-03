---
layer: golden-path
type: golden-path
subject: metric-surface-contract
status: forged
use_when: [adding or renaming an exported metric, deciding what shape a quantity is published in, removing a metric nobody appears to use, instrumenting a latency-critical loop]
techniques:
  - derive-outside-the-hot-loop
  - same-process-monotonic-intervals
  - export-terms-not-ratios
  - metric-removal-is-a-staged-pipeline
  - sampled-metrics-declare-their-rate
---

# The exported metric surface as a contract

A service's exported metrics are an **interface it publishes**, in exactly the
sense its request API is one — a named set of quantities, with stated types,
labels and units, that other systems parse and depend on. The difference, and
the whole reason this subject exists, is that **the consumers are not
enumerable**. A request API has clients you can find: they authenticate, they
appear in logs, you can page them. A metric is scraped by a time-series store
that nobody on the emitting team administers, then folded into a dashboard by
one team, into an autoscaling rule by another, into a capacity model by a
third, and into a monthly slide by a fourth. None of them told the exporter
they exist. All of them break together, silently, the day a name changes.

So the operating assumption is inverted from ordinary internal code:
**everything exported is depended on until proven otherwise, and the proof is
unobtainable.** A name is permanent. A unit is permanent. A label's value
domain is permanent. What can still change cheaply is what you have not
exported yet — which is why the decision of *what to publish* deserves more
argument than the decision of what to compute, and why the last section of
this document is about the cost of adding one.

## Where this subject starts and stops

Three neighbouring disciplines are frequently confused with this one, and each
confusion produces a different bad document.

**Measuring your own host.** An in-process instrument that times its own
process — ring buffers of recent samples, percentiles derived at read time, a
cost budget so the probe does not become the load — is
[perf-instrumentation](../../../operations/service-operations/perf-instrumentation/perf-instrumentation.md).
That subject's consumer is the process itself and the engineer attached to it;
its governing question is *what does this instrument cost the thing it
measures*. This subject's consumer is **outside the process, unknown, and
long-lived**, and its governing question is *what have I promised by emitting
this, and what happens to them when I change it*. The two meet at exactly one
seam: an instrument may be cheap enough to keep and still be wrong to export,
because export is a promise and retention is not.

**Folding a log into series.** Bucketing events into windows, comparing
periods, materializing rollups and keeping them honest is
[metrics-rollups](../metrics-rollups/metrics-rollups.md) — the derivation a
consumer runs *over* what was published. This subject ends where that one
begins: at the boundary of the process, with a set of primitives in a shape
that lets the fold happen correctly downstream. Every design rule below is
chosen to make the downstream fold possible for a consumer whose window,
capability and taste you will never learn.

**Reconciling clocks at ingest.** Skew between when an event happened and when
a collector received it is a real problem and it is not this one. This subject
owns the rule one step earlier: an interval is only meaningful when both of its
timestamps came from **one process's own monotonic clock**, which dictates
where the timestamps are taken and therefore what the emitting component is
obliged to put on the wire. That is an architectural constraint on the
emitter, not a correction applied at the receiver.

## The emitter's two loops

Nearly every service that exports interesting metrics has a latency-critical
path and something slower around it: a request loop and a background loop, an
inner scheduling loop and an outer bookkeeping loop, a stream step and a
reporting tick. The structural rule is that **the critical path emits, and the
loop around it derives.** The critical path produces the raw facts it was
producing anyway — an outcome, a count, a stamped moment — and hands them
outward; every fold, ratio, histogram observation, label lookup and string
operation happens where the cost overlaps something else.

Instrumenting the critical path directly makes the instrument part of the cost
it reports, and the distortion is worst at exactly the load where the number
matters. The procedure for drawing that line, and for what is allowed to
remain in the fast path, is
[derive-outside-the-hot-loop](./techniques/derive-outside-the-hot-loop.md).

There is a trap on the other side of that line, and it is the most common way
this architecture is got wrong. Having moved derivation outward, the natural
next thought is *the outer loop can reconstruct what it needs from what it can
see* — it knows when it dispatched work and when the result came back, so it
can compute the durations itself and the inner loop need ship nothing. This
fails whenever a phase boundary is invisible from outside: work that was
admitted but not yet started, work that was started and then displaced,
retries that never surfaced. The outer loop's reconstruction of those
intervals is not an approximation, it is a fabrication, and it will be
confidently wrong in the direction that flatters the system. **The component
that owns the transition stamps it and ships it**; the aggregator derives only
from events it received. That, plus the monotonic-clock rule that forces it,
is [same-process-monotonic-intervals](./techniques/same-process-monotonic-intervals.md).

## The shape a quantity is published in

A published quantity has a shape — a monotonically increasing count, a value
that goes up and down, a distribution over buckets — and the shape decides
what a consumer can ask of it. The senior rule is that **an exporter publishes
terms and lets the consumer do the arithmetic**. A ratio is only meaningful
over a window; the exporter cannot know which window a consumer wants, and the
moment it picks one it has hard-coded that choice into every dashboard, alert
and capacity model downstream. Publish the numerator and the denominator as
counts that only increase, and every consumer computes the rate over its own
interval, including intervals that had not been invented when the metric
shipped.

The rule has a real exception, and flattening it into "always counters" loses
the actual insight. **The shape follows the consumer's capability.** A
consumer that has a time-series store can subtract two points; a consumer that
has only a line of text — a periodic log line, a status endpoint read by a
human, a terminal display — has no history to subtract from and cannot
recover a rate from a monotone total. For that consumer the exporter computes
a windowed value itself, over a stated recent window, and says so. Same
quantity, two shapes, chosen by what the reader can do — not by taste, and
never by picking one shape and calling the other consumer's need unreasonable.
Both halves are [export-terms-not-ratios](./techniques/export-terms-not-ratios.md).

## Removal is a pipeline, not a decision

Because the consumer set is unenumerable, "grep the org, nobody uses it" is
not evidence, and a removal that produced no complaints during review will
produce them after release, from someone who was never in the room. The
mature answer is to stop treating removal as a judgement call and make it a
**staged process tied to the release cadence**, where each stage is a
progressively louder signal delivered through the surface the consumer
actually reads:

1. still on by default, but the surface itself announces its own end — the
   description a consumer sees carries the version it will be removed in;
2. off by default, and asking for it **fails loudly** with an escape hatch
   that re-enables it, so a consumer who needs more time is unblocked in one
   flag and, crucially, *learns they were a consumer*;
3. gone.

Two properties make it work. The stages advance only on releases that are
allowed to change behaviour — a patch release never removes anything, because
consumers apply patches without reading anything. And stage two errors rather
than silently emitting nothing: a series that vanishes quietly is read
downstream as *zero*, and a zero is a confident, wrong claim about a healthy
system. Silence is the failure mode; an error is the feature. The full
procedure, including renames-as-removals and what to do with the alerting that
depends on the metric, is
[metric-removal-is-a-staged-pipeline](./techniques/metric-removal-is-a-staged-pipeline.md).

## Expensive metrics are afforded, not forbidden

Some genuinely useful quantities cost more to observe than the observation is
worth at full volume — per-unit residency in a cache, per-item lifetime in a
pool, a distribution over every internal object. The naive readings are both
wrong: "instrument it, correctness first" ships a measurable tax on every
operation, and "too expensive, drop it" throws away the only view into a class
of problem that is otherwise diagnosed by guessing.

The third answer is to make the cost **a knob with a declared position**:
observe a stated fraction, let the operator set the fraction, and put the
fraction on the exported surface so no downstream consumer can mistake a
sampled count for an absolute one. A sampled metric whose rate does not travel
with it is worse than no metric, because it is silently and confidently off by
a factor nobody can see. And a sampled family is designed as a family: the
individual sampled number is often too noisy to act on, while two or three
sampled distributions read together answer a real operational question. See
[sampled-metrics-declare-their-rate](./techniques/sampled-metrics-declare-their-rate.md).

## Names are the least reversible thing you will ship

Because a name is permanent, it is decided at the same altitude as a public
type. Practical rules that survive contact:

- **Units in the name, and one unit per quantity family.** A quantity whose
  unit must be inferred from a dashboard's label has already been divided by
  the wrong constant somewhere.
- **A label is a value domain, not a free string.** Once a label exists,
  consumers write rules that match on its values; adding a value is a change
  those rules see. Labels come from closed vocabularies with a single
  authoritative definition, and the domain is documented.
- **Never pack several values into one label.** A comma-joined multi-value
  label cannot be aggregated on, cannot be matched exactly, and forces every
  consumer to write a substring rule that breaks when the order changes. If
  the underlying fact really is a set, it is either several metrics or one
  metric per member — the packed string is the one shape that serves nobody.
- **Follow the ecosystem's naming convention even where it is uglier**, because
  the convention is what lets a consumer's tooling parse and complete your
  surface. A locally prettier name that violates it costs every consumer a
  special case — and note that a convention may include punctuation reserved
  for the *consumer's* own derived rules, which an exporter must not use.
- **Know which suffixes the exposition format rewrites.** Where the wire
  format adds or strips a conventional suffix for a given metric kind, the
  name a consumer queries is not byte-for-byte the name in your code. Embed
  one of those suffixes yourself and you have shipped a name that round-trips
  differently than you wrote it.
- **Two metrics for one quantity is a defect, not redundancy.** Duplicate
  near-synonyms accrete when a metric is added by someone who did not find the
  existing one; the two then drift, and a consumer that finds both cannot tell
  which is authoritative.

The strongest habit a team can build here is writing down its own regrets: a
metric surface that carries a short, honest note about the names it got wrong,
the label it should never have packed, and the duplicate pair it cannot remove
yet is worth more to the next maintainer than a clean-looking document that
hides the same facts. The regrets are what stop the mistake being repeated,
and — because removal is a pipeline — they are also the queue.

## The cost of adding one

Every new exported metric charges three accounts, and only the first is
usually considered:

- **Runtime cost** — the observation itself, paid per operation, on the path
  that produces it.
- **Storage and query cost, borne by someone else** — every series is
  retained by whoever scrapes it, multiplied by its label cardinality, for
  their retention window. An exporter that adds a high-cardinality label has
  spent another team's budget without asking.
- **Contract cost, paid forever** — it can now only be removed through the
  pipeline above. This is the one that compounds, and the one nobody prices at
  review time.

The consequence is a bar, not a ban: a metric is added when someone can name
the decision it changes and the reader who will make it. "It might be useful"
justifies a log line or an in-process instrument, both of which are cheap to
delete. It does not justify a published interface.

## What healthy looks like

A healthy metric surface can answer, without reading the emitter's source:
*what does this quantity mean and in what unit* (name and description);
*over what window is it true* (a monotone count, or a stated recent window);
*was it sampled and at what rate* (declared on the surface); *when does it go
away* (a removal version, if one has been decided); and *who computed it*
(the component that owned the event, not a downstream reconstruction). A
surface that cannot answer one of those has a consumer somewhere making a
confident decision on a number they have misread — and, by construction, you
will not hear about it until after the change lands.

## The techniques

- [derive-outside-the-hot-loop](./techniques/derive-outside-the-hot-loop.md)
  — splitting emission from derivation so the instrument is not part of the
  cost it reports, and what is still allowed in the fast path.
- [same-process-monotonic-intervals](./techniques/same-process-monotonic-intervals.md)
  — why an interval needs two stamps from one process's monotonic clock, why
  the aggregator must not reconstruct intervals it can only partly see, and
  the event vocabulary that follows.
- [export-terms-not-ratios](./techniques/export-terms-not-ratios.md) —
  publishing numerator and denominator instead of a rate, and the consumer
  capability that legitimately justifies a pre-computed window.
- [metric-removal-is-a-staged-pipeline](./techniques/metric-removal-is-a-staged-pipeline.md)
  — the three-stage deprecation tied to the release cadence, why the middle
  stage must error, and renames as removals.
- [sampled-metrics-declare-their-rate](./techniques/sampled-metrics-declare-their-rate.md)
  — affording an expensive observation with an operator-set sample rate that
  travels with the number, and designing sampled distributions as a family.
