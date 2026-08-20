---
layer: technique
type: technique
subject: production-trace-scoring
technique: settle-window-completion
status: forged
laws: [estimation-announces-itself]
shared_with: []
use_when: [deciding when a live trace is safe to judge, scoring streamed or multi-span requests, tuning scoring freshness against mid-flight verdicts]
---

# Settle-window completion

A live trace has no end marker. Spans arrive when the emitting clients send
them: a streamed output completes seconds after the request returned, a
parent span from a batching exporter lands last, a retry appends a new leg
minutes after the first one failed. You are the operator of the receiving
side — you cannot demand a "trace closed" signal from SDKs you do not ship,
and even if you could, the one client that never sends it would hold its
traces open forever. So "finished" must be *inferred*, and the inference
must be a named, tunable policy rather than an accident of poller timing.

## The policy

A trace counts as settled when its **newest activity is older than a
declared quiet window**. Concretely, each scoring cycle computes a cutoff
(now minus the window) and considers only traces whose last event precedes
it. That is the entire mechanism — its value is in being explicit, stated
once, and applied uniformly, so every consumer of "completed" means the
same thing by it.

Decision rules for the window length:

- **Floor it at the longest legitimate intra-trace gap you actually
  observe** — streamed generations' full duration, the flush interval of
  the slowest batching exporter feeding you, retry backoff spans. If the
  window is shorter than any of these, you will routinely judge text that
  is still being written, and a confident verdict on half an answer is
  worse than no verdict.
- **Cap it by the freshness your consumers need.** The window is pure
  latency added to every quality signal: alerts on judged failures, drift
  dashboards, daily rollups all age by exactly this much. A window of a few
  minutes suits most interactive traffic; hours-long windows are for
  pipelines that legitimately trickle spans.
- **When in doubt, prefer a shorter window plus the receipt** (below) over
  a longer window alone. The long window buys correctness you cannot
  verify; the short window plus detection buys correctness you can.
- **Pair the quiet window with a maximum-age ceiling.** A quiet window
  alone starves the trace that never goes quiet: a long-lived agent
  session emitting continuously never precedes any cutoff, so the traffic
  most worth judging is the traffic that is never judged. Tail-based
  sampling infrastructure pairs its decision-wait with hard duration and
  span-count ceilings for exactly this reason. Do the same: past a
  declared maximum age, the trace is judged *anyway*, and the receipt
  records what was covered — the drift machinery then treats later
  material arrivals as changed drift, which is the honest handling of a
  verdict issued mid-life.

## A heuristic must announce itself

The settle window is an estimate of completion, not a proof, and it will be
wrong at the tail: an exporter with an unusually long flush, a client that
crashed and resent, a genuinely slow parent span. Treating the inference as
truth is the failure; per
[estimation-announces-itself](../../_laws.md#estimation-announces-itself),
the system must be able to say, after the fact, that a given trace turned
out not to have been settled when it was judged.

That is why this technique is one half of a pair. The other half is the
[verdict-coverage-receipt](verdict-coverage-receipt.md): the verdict records
what the judge actually read, so a trace that kept moving after the window
elapsed is detected on the next read and handled by an explicit drift
policy, instead of carrying a verdict that silently stopped describing it.
The window keeps mid-flight judging *rare*; the receipt makes the residue
*visible*. Deploying the window without the receipt is presenting a guess
as a guarantee; deploying the receipt without the window means constantly
judging unfinished text and constantly re-scoring — correctness at double
the judge bill.

## What settling is not

- **It is not a mutation.** No status field flips to "complete"; the trace
  stays open to late spans forever. Settled-ness is a property of the
  *query* ("older than cutoff"), recomputed each cycle. This keeps the
  mechanism stateless and immune to the flag-desync bugs that a stored
  completion bit invites.
- **It is not global.** The window is per scoring policy, not per store.
  A near-real-time alerting judge and a nightly deep-rubric judge can run
  different windows against the same traffic without contradiction.
- **It is not a delivery guarantee.** A trace whose spans were *lost* (not
  late) settles like any other and is judged on what arrived. Detecting
  loss is the telemetry pipeline's job, not the scorer's; the scorer's duty
  ends at recording what it saw.

## When not to use it

When the emitting side is genuinely yours end to end — you own every SDK,
every exporter, and can ship a reliable terminal marker — an explicit
completion event is strictly better than inference, and the window becomes
a fallback for the marker's failure path rather than the primary policy.
And for *single-span* traffic with no streaming, a settle window adds pure
latency for no protection: an event whose output is present at ingest is
complete at ingest, and can be judged immediately.
