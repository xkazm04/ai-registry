---
layer: technique
type: technique
subject: quality-regression-gating
technique: paired-per-case-testing
status: forged
laws: [statistical-verdicts-or-no-verdict]
shared_with: []
use_when: [comparing two eval runs on the same case set, a gate cannot tell signal from case difficulty, choosing the test behind a regression verdict, two per-case score vectors are equal length and about to be zipped]
---

# Paired per-case testing

The single highest-leverage statistical decision in quality gating is to test
**per-case differences**, not run means. When the same cases are scored in
both runs, the difference `Δᵢ = new_scoreᵢ − old_scoreᵢ` cancels each case's
difficulty out of the comparison entirely. An unpaired comparison of two
means over a mixed hard-and-easy case set mostly measures how hard the cases
are; the paired one measures only what changed. At the same sample size this
is typically several times more power — which, at eval-suite scale (tens to
low hundreds of cases, not tens of thousands), is the difference between "we
cannot tell" and a gate that fires on real regressions.

## Procedure

1. **Establish comparability first.** Pair only against the previous run
   with the same mode, same target, same case count, the same judge model
   and version, and — when both runs recorded it — the same dataset version.
   A "previous run" that scored a different dataset is a different
   experiment, not a baseline; one scored by a different judge was measured
   with a different instrument, which this standard treats as under test for
   as long as it is in service
   ([baseline-carries-its-conditions](./baseline-carries-its-conditions.md)).
2. **Compute per-case deltas by case identity.** Match on case identifier,
   never on array position, and carry the identity in the score type so the
   pairing cannot be done any other way. Zipping two vectors produces a
   high-confidence verdict about a comparison that never happened; a paired
   test over mismatched cases is worse than no paired test at all. Where the
   two sets do not fully overlap, see *Equal length is not a matching case
   set* below: some non-overlaps are a refusal and some are a smaller,
   disclosed experiment, and the difference is not the vector lengths.
3. **Test the deltas against zero.** A one-sample test on the deltas —
   `mean(Δ) / stderr(Δ)` with a two-sided p — is the workhorse. With fewer
   than two deltas there is no spread to test against; return "no test",
   not a fabricated p.
4. **Report the evidence with the verdict**: the mean delta, the p-value,
   the method name, and the fallback used when pairing was impossible — so
   a reader can see *which* test decided.

## Equal length is not a matching case set

The guard that gets written is a length check, and a length check is not an
identity check. It reads as one because the mental model is "the two runs
scored the same cases, so the vectors are the same size" — but a per-case
score vector is usually **compacted**: a case that errored, timed out, or
was shed by a circuit breaker is skipped rather than held as a gap, so an
index is a position among *judged* cases, not a case index. Two targets that
each failed a different case therefore arrive the same length and one
position out, and every length-based guard passes them. Anything that makes
per-target case failure ordinary — an error budget, a health breaker, a
flaky provider — makes this the common case rather than the exotic one.

**The failure is direction-dependent, and the dangerous direction is the one
that looks cleanest.** Against unstructured scores a positional offset
differences two unrelated cases, which *adds* between-case variance to the
deltas while the paired standard error still reports that it was removed:
wrong, and overconfident about being wrong. But eval case sets are often
ordered by difficulty, and against a monotone ordering a one-position offset
yields a **constant** fake delta — one difficulty step, on every case. A
constant delta has zero spread, so the test reports maximal evidence for a
gap that does not exist, between two targets that scored identically on
every case they both judged. This is the decision rule below meeting a
defect: *report a zero-spread change as maximal evidence* is correct only
once the pairing is known to be by identity. Composed with a positional
pairing it is the mechanism that manufactures certainty.

**Refuse what cannot be matched; pair the intersection and disclose it.**
A flat refusal on any non-overlap is too strong, and deletes the tested
comparison from most real result matrices for no correctness gain — the
cases that *are* shared are genuinely matched, so the test over them is
valid. Separate the two:

- **Refusals**, each named distinctly rather than returned as one anonymous
  absence: the two sets are disjoint (nothing judged in both); a case id
  appears twice on one side (which score was meant is unknowable, and
  guessing is how this defect class starts); fewer than two cases shared
  (no spread); either side scored nothing. "No overlap", "duplicate ids"
  and "one shared case" are three different facts about a run, and a caller
  that prints them identically has hidden two of them.
- **A disclosed subset** otherwise: difference the shared cases, and carry
  the retained and dropped counts *with the deltas* so the real n reaches
  the power disclosure. The run's own case count is the larger, flattering
  number, and a reader who takes it for the paired n overstates the power by
  exactly the gap. State the selection effect too: a target that errors on
  the hard cases leaves an easier intersection, so the delta holds for the
  cases that remain and generalizes less than a full pairing would.

Pair by identity in a stable order (sorted by case id, not by either side's
insertion order), so two evaluations of one matrix cannot produce different
pairings. And check what the baseline actually recorded: where a run report
stores a *bounded preview* of its cases rather than all of them, the
intersection is silently a prefix — still a valid paired test, but over a
systematic subset rather than a random one, which is its own caveat.

## Decision rules

- **When no comparable prior run exists**, fall back to an unpaired
  confidence-interval test against whatever absolute baseline exists, and
  **flag the method** in the artifact. The fallback is legitimate; the
  silent fallback is not — a consumer must be able to distinguish a paired
  verdict from an unpaired one, because they do not carry the same weight.
- **When every case moved by exactly the same amount**, the delta spread is
  zero and the naive formula divides by zero. That situation is a
  *perfectly consistent* change, not an untestable one: report it as
  maximal evidence (p → 0 in the direction of the mean), never discard it.
  Discarding it makes the gate blind to precisely the cleanest regressions.
  This rule is safe only above an identity-verified pairing — a constant
  delta is the exact signature a positional offset produces on a
  difficulty-ordered case set, so the two rules must not be adopted
  separately.
- **When scores are far from normal** — heavily skewed rubric scores,
  many ties, binary pass/fail — prefer the distribution-free paired tests:
  the signed-rank test for ordinal or skewed paired scores, the
  discordant-pairs test for paired binary outcomes. The pairing is the
  load-bearing choice; the specific test statistic is fitted to the data
  shape. A paired bootstrap over the deltas is the general-purpose fallback
  when no classical test fits.
- **When per-case scores were not stored**, pairing is impossible, full
  stop. Treat this as a data-model defect to fix, not a statistical problem
  to route around: record per-case scores from the first run onward.

## The baseline-uncertainty asymmetry

Pairing also fixes a subtler dishonesty. An absolute-floor test against a
recorded baseline scalar treats that baseline as a known constant — but it
came from a run with its own sampling error, and a scalar stores none of
it. The floor test therefore accounts for this run's uncertainty and not
the baseline's, and an honest artifact carries that caveat verbatim every
time the floor test runs. The paired test is the structural fix: it
compares two runs *each carrying their own noise*. This is a standing
reason to prefer the paired verdict wherever both can run.

## When not to use it

- The two runs genuinely score different case sets (dataset grew, cases
  rotated): do not force a pairing over the intersection without disclosing
  it — the intersection is a different, smaller experiment and the report
  must say which cases it covers.
- Per-case scores are themselves means over multiple judge samples with
  high judge variance: pairing still helps, but the judge's own noise is
  now inside each delta — stabilize the judge (more samples, mechanical
  dimensions) before trusting narrow margins.
- Sample sizes are large enough that even trivial differences reach
  significance: pairing answers "is the change real?", not "is it big
  enough to matter?" — pair it with a minimum-effect threshold owned by
  the operator, disclosed like everything else.
