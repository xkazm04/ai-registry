---
layer: technique
type: technique
subject: quality-regression-gating
technique: paired-per-case-testing
status: forged
laws: [statistical-verdicts-or-no-verdict]
shared_with: []
use_when: [comparing two eval runs on the same case set, a gate cannot tell signal from case difficulty, choosing the test behind a regression verdict]
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
   never on array position. If the case sets do not line up — different
   length, missing ids — **refuse to pair and say so**. Silently truncating
   to the intersection, or zipping misaligned vectors, produces a
   high-confidence verdict about a comparison that never happened; a paired
   test over mismatched cases is worse than no paired test at all.
3. **Test the deltas against zero.** A one-sample test on the deltas —
   `mean(Δ) / stderr(Δ)` with a two-sided p — is the workhorse. With fewer
   than two deltas there is no spread to test against; return "no test",
   not a fabricated p.
4. **Report the evidence with the verdict**: the mean delta, the p-value,
   the method name, and the fallback used when pairing was impossible — so
   a reader can see *which* test decided.

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
