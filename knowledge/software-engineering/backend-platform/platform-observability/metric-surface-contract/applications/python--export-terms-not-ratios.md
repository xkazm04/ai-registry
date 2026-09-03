---
layer: application
type: application
subject: metric-surface-contract
technique: export-terms-not-ratios
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.12
---

# One cache hit rate, published in two shapes

The same engine publishes its prefix-cache hit rate twice, in two different shapes, and
the reasoning is recorded. Citations are against `vllm-project/vllm` at commit
`facd9a74a1cd1b9fed324cdc2cceb8d54fdad3d0`, files `docs/design/metrics.md`,
`vllm/v1/metrics/stats.py`, `vllm/v1/metrics/loggers.py`.

## 1. The scrape surface gets counters, and the argument is explicit

`docs/design/metrics.md:406-433` walks the decision from the quantity to the shape:
every cache query records tokens queried and tokens hit; "the metric of interest is the
hit rate"; but for the scraped surface "we should take advantage of the time-series
nature ... and allow the user to calculate the hit rate over an interval of their
choosing", showing the consumer-side expression that divides two rates over a
five-minute window. The conclusion is stated as a rule: "we should record the queries
and hits as counters ... rather than recording the hit rate as a gauge."

The counters are `vllm:prefix_cache_queries` and `vllm:prefix_cache_hits`
(`vllm/v1/metrics/loggers.py:584-601`), with the external-cache pair alongside
(`:608-…`). The exporter publishes terms; every window in every consumer's dashboard is
computed downstream from the same two numbers.

The tree also holds a to-do written against its own surface
(`docs/design/metrics.md:566-570`): speculative-decoding acceptance rate is still a
gauge, and the note says it "should probably" be exposed as separate accepted and draft
counters "like we do for prefix caching hit rate". The rule, once learned, is being
applied backwards across the surface — which is what a policy looks like when it is real.

## 2. The log publisher gets a windowed rate, because it has no history

`docs/design/metrics.md:417-420`: "In the case of logging, we expect the user is best
served by calculating the hit rate over a fixed number of the most recent queries (the
interval is fixed to 1k most recent queries for now)." The log line has no time-series
store behind it and no way to subtract two points, so a monotone total would be unusable
to its reader.

`CachingMetrics` (`vllm/v1/metrics/stats.py:35-113`) is that second shape: a
`max_recent_requests` window defaulting to 1000, a deque of `(requests, queries, hits)`
triples, aggregate sums maintained incrementally on `observe`, and eviction of the oldest
triples while the aggregate request count exceeds the window (`:88-98`). `hit_rate`
(`:110-113`) divides the two aggregates. The five-second log line renders it at
`loggers.py:290-296`.

Both shapes derive from the same recorded terms — queries and hits, counted once at the
scheduler — which is what keeps the two publishers from disagreeing about what the
quantity is. The technique's exception, realized as designed: shape chosen by consumer
capability, not by taste.

## 3. Three details worth copying

- **Empty is a distinguishable state, and there is an `empty` property for it**
  (`stats.py:100-103`). The two secondary caches are logged only when non-empty
  (`loggers.py:303-308`), so a cache nobody queried does not render as "0.0% hit rate".
- **The window preserves the newest observation unconditionally**: eviction stops while
  only one entry remains (`stats.py:92-98`), so a single very large batch cannot empty
  the window it just filled.
- **Empty updates are skipped rather than appended** (`:75-77`), with the comment that
  otherwise useful history gets pushed out of the sliding window by nothing.

## 4. Where it falls short

`hit_rate` returns `0.0` when no queries have been observed (`stats.py:111-112`), and the
primary prefix-cache line at `loggers.py:290-296` renders it unguarded — unlike the two
secondary caches, which check `.empty` first. On a freshly started idle engine the log
therefore states a 0.0% hit rate for a cache that has answered no queries: unknown
published as a definite value, in the one shape whose whole justification is that its
reader cannot check anything else. The property that would fix it already exists and is
used three lines below. The standard stands: a windowed rate with no observations in the
window reports absence, not zero.
