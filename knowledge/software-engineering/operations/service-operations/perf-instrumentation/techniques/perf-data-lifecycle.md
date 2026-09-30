---
layer: technique
type: technique
subject: perf-instrumentation
technique: perf-data-lifecycle
status: forged
laws: [count-carries-predicate, derivation-names-recomputation, creation-names-reaper]
shared_with: []
use_when: [deciding what graduates to the durable sink, panel numbers arrive without their sampling predicate, regression feels real but no baseline exists]
---

# Performance data lifecycle

An instrument whose numbers land nowhere is pure cost; an instrument
whose numbers land somewhere nobody looks during an incident is cost
plus false comfort. The lifecycle technique designs, for every metric,
the full path: **capture → aggregate → surface → compare → expire** —
before the instrument ships, because a metric bolted to a sink as an
afterthought reliably ends up in the wrong store with the wrong
retention and no reader.

## Two stores, two tenses

Performance data serves two readers with incompatible needs, and one
store cannot serve both:

- **The live store** — bounded, in-memory, per-process (the rings of
  [ring-buffer-metrics](./ring-buffer-metrics.md)). Serves the present
  tense: "what is latency doing right now?" Dies with the process, and
  that is correct — its whole contract is recency.
- **The durable sink** — persisted, append-only, small (alert records
  from [continuous-monitors](./continuous-monitors.md), one startup
  record per launch from [startup-phasing](./startup-phasing.md)).
  Serves the past tense: "what happened before the restart?" —
  which is the only tense available for crashes, freezes, and
  yesterday's regression, since the events that matter most are the
  ones the live store did not survive.

The selection rule: **raw volume stays in the live store; conclusions
graduate to the durable one.** Persisting every record is a database
nobody asked for; persisting only threshold crossings, per-launch
summaries, and settled reports keeps the durable sink small enough to
read whole. Both stores name their reaper at creation
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)): the
ring by its size, the sink by rotation or retention — a diagnostic
file that grows for a year is the instrument becoming the disease.

## The surface is part of the instrument

A metric exists when a human can find it, which for a self-measuring
product means an **in-product panel** — the place a developer or a
power user opens when things feel slow (how it renders — series,
distributions, meters — is [data-viz](../../../../ui-surfaces/data-display/data-viz/data-viz.md)'s
subject). What this technique owns is the contract of what crosses
that boundary: every number arrives with its predicate attached
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)) —
window, sample count, sampling rate, outcome-pool membership — because
the display layer cannot reconstruct a predicate the data layer
dropped, and a panel of naked numbers is a rumor mill with axes. The
panel also carries the recomputation affordances: refresh, and reset.

## Reset changes the predicate

Someone will want to zero the statistics — before a reproduction run,
after a fix, mid-hunt. Reset is legitimate and must be **explicit,
scoped, and visible**: a deliberate act (never a side effect of
navigation), scoped to named metrics, and reflected in the window
predicate, because "p95 over the last 500 calls" and "p95 since reset,
3 minutes ago, n=14" are different claims and the surface must show
which one it is making. An instrument that quietly resets on remount
or reconnect is manufacturing optimism on a schedule.

## A regression is a diff, and a diff needs a baseline

"Is this slow?" has no answer without "compared to what?" The
lifecycle's compare stage stores **baselines** — last launch's startup
record, a rolling window of prior sessions, the numbers at the last
release — and renders the current value *against* them, so a
regression arrives as a diff with a magnitude and a date rather than
as a vague sense of decline. A baseline is a stored derivation and
obeys [derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation):
it names what it was computed from (which runs, which window, which
version) and how to recompute it, or the day it looks wrong there is
no arbiter — an unexplained baseline is folklore with decimals.

## Percentiles do not compose

A baseline built by averaging per-launch p95s, or a fleet figure built by
averaging per-machine p99s, is a number that describes no population: the
quantile of a union is not a function of the quantiles of its parts, and
heavy tails make the error large exactly where the tail matters. Where
windows cross a boundary (launches, sessions, machines), choose one of:

- persist the **raw records** or the settled window and derive at compare
  time (fine while volume is small; the durable sink stays small by rule);
- persist a **mergeable histogram** with a stated error bound. DDSketch
  (Masson, Rim, Lee, VLDB 2019) is log-bucketed with a relative-accuracy
  guarantee, and merging sketches is as accurate as one sketch over all the
  data. The paper says GK and t-digest are only one-way mergeable and can
  carry large relative error on heavy-tailed data, and names HDR Histogram
  as the earlier relative-error design;
- persist the sample count with each stored percentile and refuse to
  combine them, showing them side by side instead.

Whichever is chosen, the stored baseline names it
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).
A per-launch p95 shown next to last launch's p95 is a comparison of two
observed values and is fine; an *average* of them is the error.

## From number to human

The last stage is the escalation path: threshold crossed → durable
record written → surfaced where it will be seen next session → and,
where the product has one, routed into the same notification or
triage channel as other operational events, rather than a bespoke
perf-only inbox nobody checks. The test of the whole lifecycle is an
incident rehearsal: given "users say it froze yesterday", can someone
walk from the report to the durable sink to the freeze record to the
phase or operation implicated, without instrumenting anything new?
If the walk breaks, the break names the missing stage.
