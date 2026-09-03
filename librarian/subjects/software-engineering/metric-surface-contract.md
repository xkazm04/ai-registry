---
subject: metric-surface-contract
domain: software-engineering
last_touched: 2026-09-03
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
