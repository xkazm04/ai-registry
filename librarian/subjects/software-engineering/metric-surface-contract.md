---
subject: metric-surface-contract
domain: software-engineering
last_touched: 2026-09-04
touched_by: intake
dry_streak: 0
---

# metric-surface-contract

First touch: [[2026-09-03-vllm]]. NEW subject in `backend-platform/platform-observability`,
5 techniques, 3 applications.

## What the gap actually was

The claim that a service's exported metric set is a PUBLISHED INTERFACE with consumers the
exporter cannot enumerate. Two real neighbours had to be bounded in prose:
`perf-instrumentation` asks what a probe costs its host, this asks what export promised to
an unknown outsider; `metrics-rollups` owns the consumer-side fold, this stops at the
process boundary and exists to make that fold possible.

The two least-covered items: an interval needs two monotonic timestamps FROM THE SAME
PROCESS, so the component owning an event must stamp and SHIP it rather than let a
downstream aggregator reconstruct it (the source considered that alternative and rejected
it, because two of its four events are invisible downstream); and removing a metric runs a
staged pipeline, a policy that exists because a removal that looked safe was noticed by a
user afterwards.

## Still open

`export-terms-not-ratios` came back not-better against a fleet observability service that
had independently reached counters-not-a-gauge, naming its admitted counter "the
denominator for a shed rate" - the run's cleanest convergence, and it refuted the obvious
direction of adding a scrape endpoint, which that tree declines on the record.

The remaining half became the run's only direction proposal (accepted, executed on a
branch): that service publishes a surface to self-hosted operators and three SDKs and has
no removal policy for it. Also recorded: the source's own deprecation stage 2 is plumbed
end to end and read nowhere.
## 2026-09-04 - /intake `opik` (run `opik-0904`)

New technique `fault-localizing-metric-set`. The subject's admission bar is
per-metric - name the decision it changes and the reader who will make it - and
that bar has one structural blind spot: **diagnosability is a property of the
set.** A quantity can be worth publishing because it disambiguates a neighbour's
number, and that argument lives one stage downstream where the per-metric bar
cannot hear it.

The clearest case is a producer counter, redundant in the healthy case (the
consumer's intake already agrees) and decisive in the broken one: without it a
consumer reading zero cannot distinguish an idle system from a lost hand-off,
which is `unknown-is-not-a-value` rendered as a value. Also landed: split a
duration wherever its halves would page different people (queue wait is capacity,
processing is code - published as one number they are indistinguishable and both
rise identically); cover stages in flow order with one skeleton; treat the
entrypoint as a stage rather than framework furniture; and validate the surface
by replaying a past incident against it. Guarded against becoming a licence to
publish internal state - the set-level argument must *name* the ambiguity it
resolves, cardinality is still a product of enumerable domains, and benign counts
are labelled benign on the surface.

This answers the golden path's own enumeration ("three neighbouring disciplines
are frequently confused with this one"): there is a fourth question - designing
the metric *set* for a reading order - and it is none of the three.

Applied `experiment`/`unmeasurable` against a fleet observability service. Its
front door confirms the technique outright (three producer-side outcomes at one
hand-off: admitted, shed, timeout); the gap is the duration split, absent
everywhere in the crates, and the project's own source comment names the
resulting confusion independently. Both arms need a behavioural run, so the
instrument is named rather than the verdict claimed: replay a recorded relay
incident against both surfaces and count which localizes the stage.
