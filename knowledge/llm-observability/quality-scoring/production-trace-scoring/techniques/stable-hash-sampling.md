---
layer: technique
type: technique
subject: production-trace-scoring
technique: stable-hash-sampling
status: forged
laws: [estimation-announces-itself, quality-apparatus-stays-unbudgeted]
shared_with: []
use_when: [capping judge spend against unbounded traffic, choosing which traces an online judge scores, making a sampling decision reproducible across workers and restarts]
---

# Stable-hash sampling

Against an unbounded stream, the judge's unit economics are the design
constraint: every verdict is a paid model call, and "score everything" is a
bill with no ceiling. Production judging therefore runs on a sample — the
field's working range is a few percent of traffic at volume, higher for
low-volume systems that need enough verdicts for statistical confidence.
The technique is not *that* you sample; it is *how* the membership decision
is made, because the naive implementation (a random draw per candidate per
cycle) is wrong in ways that surface operationally, not statistically.

## The mechanism

Sample membership is a **pure function of the trace's identity**: hash the
trace id with a small, stable, dependency-free hash, and the trace is in
the 1-in-N sample iff the hash falls in the 1/N bucket (hash mod N equals
zero, or any fixed residue). Every input the decision needs travels with
the candidate; no state is read, no coordination happens, no randomness is
drawn.

Three properties fall out, and each one is load-bearing:

- **Reproducible across cycles.** The same trace gets the same decision on
  every pass. A polling loop that revisits overlapping pages of candidates
  never flip-flops — a trace outside the sample stays outside, so the loop
  does not slowly leak the whole population into the judged set one lucky
  draw at a time.
- **Reproducible across processes.** Two workers, a daemon and a scheduled
  one-shot, a replay after an outage — all agree on membership with zero
  shared state. This is what lets the sampling decision be applied *twice*
  (a cheap pre-filter while paging candidates, and a final gate once the
  full context is known) with no risk of the two disagreeing.
- **Reproducible across releases.** The hash must be one whose output is
  specified — not a standard library's default hasher, whose output is
  deliberately unstable across versions and processes. A hash that changes
  with the toolchain re-draws the entire sample on upgrade: every
  previously-out-of-sample trace becomes a fresh candidate, and you pay to
  re-judge a population's worth of traffic for one deploy. A small
  well-specified non-cryptographic hash is exactly right; cryptographic
  strength buys nothing here.

## Decision rules

- **Key on the trace id, not the content.** Content-keyed sampling couples
  membership to payload mutation (a late span changes the decision) and to
  payload size (hashing megabytes per candidate). Identity is minted once
  and immutable — the correct key by construction.
- **N ≤ 1 means everything.** The degenerate configuration must judge every
  trace, not divide by zero or judge none. Low-traffic deployments
  legitimately run at 1.
- **The sample decision is not the idempotency decision.** "In the sample"
  and "already scored" are independent gates composed in one predicate;
  keeping the composed predicate *pure* — all inputs passed in, no hidden
  reads — is what makes it unit-testable and provably identical wherever
  it is applied. See [unscored-work-queue](./unscored-work-queue.md) for the
  already-scored half.
- **Bypasses are explicit, named policies** — the error-trace override is
  the canonical one ([errors-always-oversampling](./errors-always-oversampling.md)) —
  never ad-hoc exclusions buried in a worker.

## The sample is a disclosure, not a secret

A 1-in-N sample is an estimate factory: aggregates over judged traces
estimate the population with sampling error, and per
[estimation-announces-itself](../../../_laws.md#estimation-announces-itself)
every consumer of those aggregates must be able to see the policy that
produced them — the rate, and any bypasses. "Pass rate 94% (1-in-20 sample,
errors always judged)" is a measurement; "pass rate 94%" over the same data
is a lie of omission, because the errors-always bias alone can move the
number by points. And because the rate is a lever, it *moves* — so the
disclosure must be stamped per verdict (the rate in force when that trace
was admitted), the way sampled telemetry carries an adjusted count, not
read from current config: reweighting last month's verdicts by this
month's N quietly restates history. The sampling rate is also the primary
spend lever for the scoring apparatus, and per
[quality-apparatus-stays-unbudgeted](../../../_laws.md#quality-apparatus-stays-unbudgeted)
it is the *only* legitimate one: you tune N down to afford the judge — you
never let a product-side usage cap throttle the judging path implicitly.

## When not to use it

When the population is small and bounded — a fixed regression set, a
curated golden dataset — sampling is the wrong tool entirely; that is the
builder-side harness's territory, and it judges everything, every run.
And when the goal is *stratified* coverage (equal verdicts per customer,
per route, per model), a single global hash bucket underserves small
strata; keep the stable-hash core but apply it per stratum with per-stratum
rates, rather than reaching for randomness.
