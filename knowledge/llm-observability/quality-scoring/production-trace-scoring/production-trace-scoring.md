---
layer: golden-path
type: golden-path
subject: production-trace-scoring
status: reconciled
use_when: [scoring live traffic with a model judge, designing an online eval sampling policy, deciding when a trace is finished, preventing double-paid judge calls]
techniques:
  - settle-window-completion
  - stable-hash-sampling
  - errors-always-oversampling
  - verdict-coverage-receipt
  - drift-classified-rescoring
  - unscored-work-queue
  - error-analysis-first-taxonomy
---

# Production trace scoring

Production trace scoring is the discipline of continuously judging live LLM
traffic with a model judge — an unbounded, unlabeled, still-arriving stream,
scored after the fact, forever. It is not the builder-side evaluation harness
run one boundary over: that harness judges a *fixed* dataset, *offline*,
*before merge*, where every case has a known identity, a known end, and a
run that terminates. Here none of those hold. The stream never ends, the
cases were never curated, nothing tells you a trace is finished, and every
verdict costs real money on a judge that will still be running next quarter.
The three questions that simply do not exist offline are the whole subject:
**is this trace finished**, **is this trace worth paying to judge**, and
**have I already paid to judge it**. A principal practitioner treats each as
a first-class policy with an explicit answer, because every one of them has a
default answer that silently burns money or silently lies.

## The stream has no finish line

An offline case is complete by construction. A live trace is a set of spans
that arrive when they arrive: a streamed output fills in seconds after the
request "ended", a parent span from an instrumentation pipeline lands last,
a retry appends minutes later. There is no end marker, and demanding one
from every emitting SDK is a fantasy — you are the operator, not the
emitter, and you do not control the clients.

So completion is *inferred*, and the inference is a stated policy, not an
accident of when the poller happened to run: a trace counts as settled once
its newest activity is older than a declared quiet window
(settle-window-completion). That window is a heuristic and must be treated
as one — long enough that a still-streaming response is not judged
mid-flight, short enough that the quality signal is not a day stale, and
*backed by a second line of defence* for the tail it will inevitably get
wrong. That second line is the receipt: every verdict records exactly what
it judged (verdict-coverage-receipt), so a trace that kept moving after the
judge ran is detectable on read instead of being silently misdescribed
forever. A settle window without a receipt is a guess presented as a
guarantee; a receipt without a window judges half-finished text constantly.
They are one mechanism in two parts.

## Judging everything is not a quality bar, it is a bill

The judge is a metered model call. Against unbounded traffic, "score
everything" is a cost function with no ceiling, and the field consensus is
unambiguous: production judging runs on a sample — commonly a few percent of
traffic at volume — decoupled from the serving path so evaluation latency
never touches the user. The naive reading of sampling ("roll a die per
trace") fails in a way that matters operationally: a random per-cycle draw
gives you a *different* subset each pass, so a trace skipped this cycle may
be paid for next cycle, longitudinal comparisons wobble, and two workers
disagree about what is in scope.

The professional form is deterministic: membership in the sample is a pure
function of the trace's identity — a stable hash of its id falling in the
1-in-N bucket (stable-hash-sampling). The same trace gets the same decision
on every cycle, on every worker, after every restart, with no coordination
and no stored state. Sampling economics then get one deliberate exception:
failures are the traffic you can least afford not to look at, and they are
rare precisely when things are healthy — so error traces bypass the sample
and are always judged (errors-always-oversampling). A uniform sample of a
99%-success stream is a machine for not seeing your failures.

What the sample must never do is masquerade as the population. A score
computed over 1-in-20 traces plus all errors is a *biased estimate by
design*; every aggregate over it discloses the policy that produced it, per
[estimation-announces-itself](../../_laws.md#estimation-announces-itself).

## Paying twice is the silent failure mode

Idempotency is where online scoring quietly hemorrhages money, because the
failure is invisible: a re-judged trace produces a plausible verdict, the
dashboards look fine, and the only symptom is a judge bill growing faster
than traffic. The question "have I already paid to judge this" must be
answered by the system of record, not reconstructed by the client — a
client-side anti-join over "recent scores" has a horizon, and the moment
scored history outgrows that horizon, everything past it re-judges on every
cycle, forever, at full price (unscored-work-queue). The store that holds
the verdicts is the only party that can scope "already scored" correctly at
any scale, per
[server-owns-the-accounting-clock](../../_laws.md#server-owns-the-accounting-clock).

Idempotency has a second, subtler face: what does "already scored" mean when
the trace has *moved* since the verdict? Here the naive readings split into
two opposite failures. "A stale verdict means re-score" re-buys a verdict
every time an irrelevant span arrives — the judged text unchanged, the money
gone, the verdict byte-identical. "A verdict is a verdict" leaves a score
describing text that no longer exists. The resolution is to *classify* the
drift (drift-classified-rescoring): a trace that merely grew around an
unchanged judged exchange is stale to a reader but earns no spend, because
re-judging would send identical text; only a trace whose judged exchange
itself changed — the streamed output that filled in late, the true root that
arrived after the window — buys a fresh judge call. Staleness is a
disclosure problem; re-scoring is a spend decision. Conflating them is the
single most expensive confusion in the subject.

## The verdict is a record, not just a number

Because verdicts are consumed weeks later, by readers who were not present,
against traces that may have changed, a bare scalar is not a verdict — it is
a rumor. Every stored verdict carries what it judged (the coverage receipt:
size at judging time, the identity of the judged exchange, a fingerprint of
the judged text), what produced it (rubric, judge identity, cost), and
enough reasoning to be auditable — bounded, because score rows are hot and
an unbounded provenance blob on a hot row is a self-inflicted outage. The
judge itself remains an instrument under test — biased, drift-prone,
attacker-influenced — per
[the-judge-is-both-untrusted-and-under-test](../../_laws.md#the-judge-is-both-untrusted-and-under-test);
this subject supplies the *when and what* of judging live traffic and leans
on the judge-contract and calibration subjects for the *how*.

Two operational invariants complete the standard. The scoring loop is
asynchronous and read-only against the serving path — it observes traffic,
never gates it — and its spend is segregated from product cost and never
throttled by the product's own usage caps, per
[quality-apparatus-stays-unbudgeted](../../_laws.md#quality-apparatus-stays-unbudgeted):
an observability loop metered alongside the traffic it measures blinds
itself exactly when traffic spikes, which is exactly when you need it. And
the loop is safe to run as a daemon *or* a scheduled one-shot without a
supervisor: every pass is idempotent end to end, a transient backend failure
is survived by the daemon but propagated loudly by the one-shot, and a
*permanent* incapacity (a backend that does not serve the trace surface at
all) terminates the loop with a stated reason instead of logging the same
error every interval until someone notices the log volume.

## Failure modes this standard exists to prevent

- **Judging mid-flight** — scoring a streamed response before it finished,
  producing a confident verdict on half an answer.
- **The verdict that stopped being true** — a trace that changed after
  judging, with no receipt to detect it; the score ages into fiction.
- **The re-judging leak** — client-side dedup with a horizon, or "stale
  means re-score", silently re-buying identical verdicts at scale.
- **The wobbling sample** — nondeterministic sampling that judges a
  different subset each cycle and cannot be reproduced or reasoned about.
- **The invisible failure tail** — uniform sampling of a healthy stream,
  where the errors you exist to catch are precisely what the sample misses.
- **The self-throttling monitor** — quality spend pooled with product spend,
  so the cap that protects the budget blinds the instrument under load.

## The techniques

- [settle-window-completion](./techniques/settle-window-completion.md) —
  inferring "finished" for a stream with no end marker: the quiet-window
  policy, choosing its length, and why it must be paired with a receipt.
- [stable-hash-sampling](./techniques/stable-hash-sampling.md) — deterministic
  1-in-N membership from a stable hash of trace identity: reproducible,
  coordination-free, restart-safe.
- [errors-always-oversampling](./techniques/errors-always-oversampling.md) —
  the deliberate bias: every failure judged regardless of sample rate, and
  what that does to your aggregates.
- [verdict-coverage-receipt](./techniques/verdict-coverage-receipt.md) — the
  verdict records what it judged: span count, judged-exchange identity,
  content fingerprint; stamped by the server, compared on read.
- [drift-classified-rescoring](./techniques/drift-classified-rescoring.md) —
  none / grown / changed: which drift is a disclosure and which one buys a
  fresh judge call.
- [unscored-work-queue](./techniques/unscored-work-queue.md) — the system of
  record serves "what still needs judging"; the client never reconstructs
  it by anti-join.
- [error-analysis-first-taxonomy](./techniques/error-analysis-first-taxonomy.md)
  — the step before any rubric exists: read traces to saturation, build the
  failure taxonomy bottom-up, keep a random slice in every review batch,
  and let a principal expert's written critiques become the judge's worked
  examples.
