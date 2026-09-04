---
layer: application
type: application
subject: eval-harness
technique: pairing-schedule
stack: rust
verified_on: 2026-09-04
verified_against: rust@1.96.1
applied: simulation
ab_verdict: not-better
proof: structural-only
---

# A pooled leaderboard that answers the connectivity problem by widening the interval

A self-hosted observability product publishes a shared model leaderboard built
from many independent operators' private benchmark runs. Witness for the version
read: the workspace toolchain pinned to `1.96.1` in `rust-toolchain.toml` (the
CI ruler, installed through rustup so no job names a version), its collective
modules under
`crates/core/src/collective/` and the framework document that specifies them.

This application is a **negative result for the technique as written**, and the
tree is the thing that corrected it.

## The structure that makes the problem unavoidable

Every contributor benchmarks on *its own real tasks*. Buckets are published per
`(provider, model, task_type)`, where the task type is a coarse fixed vocabulary
so that a rare task cannot fingerprint an operator. Two consequences follow from
the privacy design rather than from carelessness:

- Two operators' entries in the same bucket rest on **disjoint case sets**. They
  were never compared on a shared case and never will be — no contributor has a
  reason to run a stranger's cases, and the privacy floors exist precisely to
  stop cases from travelling.
- The coarse vocabulary *guarantees* the collision: it maps genuinely different
  case distributions onto one cell, which is what makes the cell publishable.

So the comparison graph is disconnected by construction, permanently, with one
component per contributor. This is the exact condition the technique names — and
the technique's stated remedy, report components rather than a leaderboard, would
mean publishing nothing, since the ranking *is* the product.

## What the tree does instead

Rather than suppress the order, it moves the incomparability into the interval. A
dedicated module computes a **between-source** variance term from the per-source
mean qualities and publishes a random-effects half-width combining it with the
within-source term, so rows whose sources disagree are published as *less*
certain than rows whose sources concur.

Its own module documentation records the defect this replaced, and it is the
inverse of what a reader assumes: pooling every case into one sample and dividing
by the total made the interval shrink with total evidence regardless of agreement,
so five contributors who disagreed produced a **narrower** interval than five who
agreed. The ordering is left alone deliberately — the flags and the interval are
annotation, never a reordering.

Three details are the reason this is a disclosure and not a fudge, and all three
are load-bearing:

- At one source the between-source term is reported **absent, not zero**: a
  single-component row has no cross-source evidence by construction, and a zero
  would assert agreement that was never observed.
- At two sources it is treated as a **lower bound**, because two sources cannot
  distinguish concord from luck.
- The estimator was chosen to need only per-source *means*, because roughly half
  of contributions carry no within-variance at all; the textbook alternative would
  have been fed assumed zeros by exactly those contributors. The module names this
  trade and takes the direction that over-states the spread, on the stated grounds
  that on a public ranking an interval slightly too wide is a smaller lie than one
  too narrow.

## Verdict and what it changed

`not-better`: the technique proposes nothing this tree should adopt. The tree is
ahead of it, and the finding ran the other way — the technique now carries the
widened-interval answer as a second legitimate response to a disconnected graph,
with the discriminator being whether the ranking is an internal selection (which
can wait for connectivity) or the deliverable itself (which cannot).

The `not-better` here means *prior conformance and then some*, not refutation.
That distinction matters for anyone reading the ledger: this row is corroboration
for the technique's premise from an independent implementation, and the technique
would have been weaker without it.

## What this realization cannot do

The between-source term measures **disagreement**, not **incomparability**, and
they are not the same quantity. Two contributors whose case sets are equally hard
but differently distributed can agree closely and produce a narrow interval that
still conceals that no shared case was ever scored. Nothing in the published row
says how much case overlap stands behind it, because by construction there is
none and the schema has no field for it. The honest reading of a narrow interval
here is "these operators' separate corpora happened to agree", which is weaker
than the "these models were compared" that a leaderboard column invites.
