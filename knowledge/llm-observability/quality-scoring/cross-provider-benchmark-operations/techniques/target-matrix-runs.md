---
layer: technique
type: technique
subject: cross-provider-benchmark-operations
technique: target-matrix-runs
status: forged
laws: [the-judge-is-both-untrusted-and-under-test]
shared_with: []
use_when: [comparing models or prompt variants on the same workload, designing a benchmark's target declaration, a scorecard's columns must be commensurable]
---

# Target-matrix runs

A **target** is one thing that produces an output: a provider, a model, and a
prompt variant, taken together. A benchmark compares many targets by running
the same dataset through each and judging every (case, target) cell with the
same instrument. The matrix framing — targets declared as a cross product up
front, rather than "run it against X, then later against Y" — is what makes
the resulting columns commensurable: same cases, same judge, same rubric,
same clock, one run identifier tying it all together.

## Procedure

1. **Declare the matrix in the benchmark definition**, not in the invocation.
   The set of {providers × models} × {prompt variants} is part of what the
   benchmark *is*; an ad-hoc extra target added at run time silently breaks
   comparability with every prior run of that benchmark.
2. **Separate generation from judging.** Each cell first *generates* an
   output from its target, then *judges* it with a judge that is not the
   target. The two phases have different pinning requirements, different
   costs, and different failure modes; conflating them makes both
   unattributable.
3. **Score per cell, aggregate per target.** Record one case result per
   (target, case) — the per-case evidence is what downstream statistical
   verdicts pair on. A run that stores only per-target means has discarded
   the ability to ever say whether a difference was real.
4. **Report all three axes per target**: quality score and pass-rate, latency
   at median and tail, tokens and priced cost — measured on the same calls.
   The scorecard's job is a trade-off surface, not a ranking.
5. **Check judge–target family overlap mechanically.** Compare the coarse
   family of the judge against each target — the model name outranks the
   provider, because a gateway serving another lab's model is still that
   lab's family. A same-family pairing is recorded on the run as a named
   warning; the operator sees "this column was graded by its sibling" in the
   artifact, not in a code comment.

## Decision rules

- **When a target's provider differs in API shape, normalize at the
  generation adapter, never in the dataset.** The cases stay identical; the
  adapter absorbs the difference. A dataset forked per provider is two
  benchmarks pretending to be one.
- **When adding a target to an existing benchmark, treat it as a new
  benchmark version.** Old runs did not contain the column; a leaderboard
  that mixes runs with different target sets invites reading absence as
  zero.
- **When the question is selection between two candidates** — not monitoring
  many — prefer a pairwise design (head-to-head per case, slot order
  randomized) over pointwise columns; it is more sensitive for exactly that
  question. The matrix is for the standing scorecard; pairwise is for the
  decision moment.
- **When the winner line matters, do not let the render layer write it.** The
  matrix run produces means; whether the top target is *significantly* ahead
  of the runner-up is a statistical claim owned by regression gating. The
  matrix report may print "highest mean"; "best" must be earned elsewhere.

## When not to use it

- A single-target benchmark against a baseline score is regression
  monitoring, not comparison — it needs the dataset and determinism
  disciplines but not a matrix, and forcing matrix machinery onto it adds
  cost without columns.
- When the targets' workloads genuinely differ (one model serves extraction,
  another serves chat), a shared matrix measures neither well. Build one
  benchmark per workload; compare within, never across.
- Very large matrices (dozens of targets) multiply spend and judge load past
  what the pre-flight will accept; prune to the plausible candidates first —
  the matrix is an instrument, not a census.
