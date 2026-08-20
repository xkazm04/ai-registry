---
layer: technique
type: technique
subject: production-trace-scoring
technique: errors-always-oversampling
status: forged
laws: [estimation-announces-itself]
shared_with: []
use_when: [sampling a mostly-healthy stream for judging, making sure failures are never the traffic the sample skips, reading aggregates over a deliberately biased sample]
---

# Errors-always oversampling

A uniform sample of a healthy stream is a machine for not seeing failures.
At a 99% success rate and a 1-in-20 sample, the expected number of judged
error traces is one in two thousand requests — the traffic you most need a
verdict on is precisely the traffic the sample almost never touches, and
the rarer failures get (that is, the *better* the system runs), the blinder
the uniform sample becomes. This technique is the deliberate correction:
**every error trace is judged, regardless of the sampling rate.** Success
traffic pays the sampling discount; failure traffic never does.

## Why failures earn full coverage

- **Asymmetric information value.** A judged success mostly confirms the
  prior; a judged failure carries the diagnosis — what broke, how badly the
  user was served, whether the failure was graceful. Per-verdict, errors
  are worth an order of magnitude more than successes.
- **Bounded marginal cost.** The override's cost is proportional to the
  error *rate*, which a healthy system keeps small. When errors are 1% of
  traffic, judging all of them costs about as much as doubling a 1-in-100
  sample — trivial. The cost only grows when errors surge, which is
  exactly when you want the coverage. This is the rare policy whose spend
  automatically concentrates where the value is.
- **Failure taxonomies need volume.** Clustering failure modes, spotting a
  new one, attributing a regression to a deploy — all need enough judged
  failures to see structure. A uniform sample starves that analysis
  permanently.

## Decision rules

- **The override sits above the sample gate, below the idempotency gate.**
  Already-scored short-circuits first (an error trace is still never judged
  twice — see [unscored-work-queue](./unscored-work-queue.md)); then the
  error override; then the hash bucket
  ([stable-hash-sampling](./stable-hash-sampling.md)). Order matters: an
  override that outranks idempotency re-buys every error verdict every
  cycle, and error traces are the ones most likely to be re-visited.
- **"Error" means the trace's own status, not the judge's opinion.** The
  override keys on operational failure — a span errored, the request
  failed — which is known before any judge runs. A low judge score does not
  make a trace an "error" retroactively; that is a different signal
  (quality regression) with a different owner.
- **The override is a flag, not a default hardcoded on.** Some deployments
  legitimately decline it — a stream where "error" is dominated by client
  cancellations, say, where full error coverage would judge noise. Off by
  explicit choice is honest; off by omission is the uniform-sample blindness
  this technique exists to prevent.
- **Surges need a stated ceiling.** An incident that turns 1% errors into
  60% errors turns the override into "judge most of the stream" at the
  worst possible moment for the judge's own rate limits. Decide up front:
  either accept that (the apparatus is unbudgeted and the information is
  worth it), or declare a per-cycle cap on override-judged traces — but a
  cap that exists must be visible in the output, never a silent drop.

## The aggregate must confess the bias

Errors-always makes the judged set *deliberately unrepresentative*: failures
are overrepresented by the full sampling factor. Any mean score, pass rate,
or trend computed naively over judged traces is therefore pessimistic — and
the skew *moves* as the error rate moves, which can manufacture a phantom
"quality drop" out of a mere error-rate blip. Per
[estimation-announces-itself](../../../_laws.md#estimation-announces-itself),
aggregates over the judged set either report the two strata separately
(sampled-success verdicts vs all-errors verdicts), or reweight by the
sampling factor each verdict was admitted under — stamped on the verdict,
since the rate is a tunable lever and reweighting by today's rate restates
verdicts admitted under yesterday's — or at minimum carry the policy in
the label. The one thing
they may not do is present the biased pool as the population.

## When not to use it

When the error rate is high and structural (a batch pipeline where partial
failure is routine), full error coverage is just "judge everything" with
extra steps — sample both strata at declared rates instead. And when the
judge's rubric cannot say anything useful about failed requests (a
relevance rubric over responses that are empty error strings), judging
errors burns money for verdicts with no information; route error traces to
a cheaper diagnostic path and let the judge cover successes.
