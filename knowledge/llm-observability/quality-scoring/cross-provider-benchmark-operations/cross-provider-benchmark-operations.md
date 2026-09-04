---
layer: golden-path
type: golden-path
subject: cross-provider-benchmark-operations
status: reconciled
use_when: [choosing which model should serve a workload, standing up a recurring benchmark over real traffic, a benchmark run needs a cost ceiling or a cancel button, a scorecard must be comparable to last month's]
techniques:
  - target-matrix-runs
  - dataset-sampling-anonymize-freeze
  - determinism-stamping
  - budget-preflight-and-ceiling
  - async-run-queue-with-cancel
  - failure-clustering-recommendations
  - handicap-disclosure-in-the-result-row
---

# Cross-provider benchmark operations

A routing decision — which provider, which model, which prompt variant serves
this workload — is only as good as the evidence under it. Vendor leaderboards
measure someone else's tasks; a gut ranking measures last quarter's reputation.
This subject is the **operations discipline of producing that evidence
yourself**: running the same real-traffic-derived cases across a matrix of
provider × model × prompt-variant targets, and reading the result as a
three-axis trade-off — quality, latency, cost — rather than a single quality
number. The output is not a verdict; it is a **scorecard a decision can rest
on**, with its reproducibility and spend caveats attached.

The boundary is sharp on both sides. Builder-side model routing owns the
*runtime* decision of which model serves a request — the dispatch logic, the
fallback chain, the per-request override. This subject owns producing the
evidence that decision should rest on, with its cost and reproducibility
caveats stated. Two sibling subjects own what happens to the scores after a
run: the statistical verdict itself — whether a difference between two runs is
real, family-wise corrected, defensible — belongs to quality-regression
gating, and the trustworthiness of the judge that produced the scores belongs
to judge calibration and drift. A benchmark operation that tries to also be
the statistician or the calibrator ends up doing all three badly; the seam is
that this subject **records what those subjects need** (per-case scores, case
identifiers, dataset version, determinism stamps) and hands it over.

## The evidence chain, in order

Benchmark operations is a chain, and each link exists to keep the next one
honest. Run it out of order and the failure is silent, which is the worst kind.

1. **Cases come from real traffic, then stop moving.** Sample from production
   events — stratified across models and outcomes, not just the most recent
   page — scrub identifying content with a layered anonymization pass, review,
   then **freeze**. A frozen, versioned dataset is what makes two runs a
   comparison instead of two anecdotes (dataset-sampling-anonymize-freeze).
2. **The matrix is declared, not accreted.** A benchmark names its targets —
   the cross product of providers, models, and prompt variants under test —
   up front, so every target sees the same cases and the scorecard's columns
   are commensurable (target-matrix-runs).
3. **Spend is asked for, not discovered on the invoice.** A matrix multiplies:
   targets × cases × generation samples × judge samples. Estimate before the
   first paid call, enforce a ceiling during the run, and mark a halted run
   partial — never passed (budget-preflight-and-ceiling).
4. **Runs are jobs, not blocking calls.** A benchmark is minutes-to-hours of
   paid work; it runs on a claimable queue with live progress, a race-safe
   cancel, and failure accounting that distinguishes a crashed worker from a
   failed run (async-run-queue-with-cancel).
5. **Every result carries its reproducibility.** Each verdict is stamped with
   how pinned its generation and its judging actually were, folded pessimistic:
   a run is only as reproducible as its least reproducible call
   (determinism-stamping).
6. **The report ends in actions, not averages.** Low-scoring cases are
   clustered by dimension and pattern, and the scorecard closes with concrete
   recommendations — including the cost-aware kind the whole exercise exists
   for: a cheaper model within noise of the expensive one is a finding, not a
   footnote (failure-clustering-recommendations).

## The three-axis reading is the point

The single most common corruption of a benchmark program is collapsing the
scorecard to one number. A quality-only leaderboard answers "which model is
best", which is almost never the question a routing decision asks. The real
question is "which model clears the quality bar for this task at the best
cost and latency" — and that question needs all three axes reported per
target: score and pass-rate, latency at the median *and* the tail, tokens and
priced cost. A model three percent behind the leader at a fifth of the price
is usually the right answer, and a scorecard that cannot surface that has
measured the wrong thing expensively.

The corollary: latency and cost must be measured on the *same calls* that
produced the quality scores, under the same pinning. A quality number from a
benchmark and a latency number from a status page are not the same evidence,
and combining them produces a trade-off chart of two different worlds.

## Comparability is a discipline, not a property

Two runs are comparable only when everything but the thing under test is held
fixed, and every axis of "held fixed" in this subject has a technique because
every one of them drifts by default:

- **The cases drift** unless frozen — someone adds a hard case, and the new
  run's dip reads as a model regression (dataset-sampling-anonymize-freeze).
- **The sampling drifts** unless pinned and stamped — an unpinned generation
  redraws its candidates every run, and the run-to-run delta is mostly dice
  (determinism-stamping).
- **The method drifts** silently — a run judged with a different transport,
  batching, or judge configuration is a different instrument; never compare
  across a method change without re-baselining, because the difference you
  see is method, not quality.
- **The completeness drifts** — a run that stopped at a budget ceiling or a
  cancel scored a different (and not random) subset of cases; it is marked
  partial and excluded from comparison rather than averaged in
  (budget-preflight-and-ceiling, async-run-queue-with-cancel).

When comparability cannot be achieved, the honest move is to *say so in the
artifact* — a run over an unfrozen dataset still runs, but it records that it
no longer reads as pinned. Disclosure is the fallback everywhere pinning is
impossible; silent inclusion is the failure mode everywhere.

## Judge–generator separation, at the operations level

The judging methodology itself is another subject's craft, but one interaction
belongs here because it is a *matrix* property: when the judge shares a model
family with a target it grades, self-preference bias favors that column of the
scorecard. The operational rule is to detect the pairing mechanically —
compare coarse model families, with the model identity outranking the gateway
that served it — and record it on the run as a named warning, never a silent
condition and never a hard failure, because a same-family run is sometimes
exactly what an operator means to measure. What must not happen is a scorecard
where one column was graded by its own sibling and nobody can tell.

## Failure modes of the naive reading

- **The one-off benchmark.** Run once, screenshot the table, decide forever.
  Models are re-released, prompts evolve, traffic shifts; evidence has a
  shelf life. The fix is recurrence — a benchmark that re-enqueues itself on
  an interval, idempotently — and a scorecard dated like the perishable it is.
- **The synthetic dataset.** Hand-written cases measure the author's
  imagination. Cases sampled from real traffic measure the product — that is
  the entire reason the sampling pipeline, with its anonymization cost, earns
  its complexity.
- **The invoice as discovery mechanism.** A matrix's cost is multiplicative
  and humans estimate it badly. Every run that surprises its operator on cost
  erodes the will to run the next one; the pre-flight estimate exists to
  protect the program, not just the budget.
- **The partial run read as green.** A run that judged a third of its cases
  before halting says nothing about the other two thirds, and the missing
  cases are systematically the later ones. Partial is a first-class,
  contagious state: it survives into the report, the gate, and the
  leaderboard banner.
- **The averaged-away failure.** A 0.78 mean hides that every multi-part
  question failed. Clustering failures by dimension and pattern is what turns
  a score into a diagnosis — and a diagnosis into the prompt fix that makes
  next month's 0.85 (failure-clustering-recommendations).
- **The scorecard with no memory of its method.** Six months later nobody can
  say which dataset version, which judge, which pinning produced the number
  the routing table still rests on. Every run records enough metadata to be
  re-read as evidence — or it was entertainment.
