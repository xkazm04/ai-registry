---
layer: technique
type: technique
subject: funder-intelligence-index
technique: fit-calibration-monotonicity
status: forged
laws: [honest-null-over-forced-guess, small-samples-stay-silent]
shared_with: []
use_when: [auditing whether a fit score predicts real outcomes, deciding if a scoring model has earned user trust, binning outcomes by score for calibration]
---

# Fit-calibration monotonicity

A fit score that drives submission decisions makes a falsifiable claim:
*applications submitted at higher fit win more often.* Most scoring systems
never test the claim — the score is designed plausible, shipped, and trusted
by construction. This technique is the audit that converts plausibility into
evidence (or into a finding): bin recorded outcomes by the fit score each
application was **submitted at**, compute the observed award rate per band,
and test whether the rates are monotonic in the bands. If 85+-fit
submissions do not win more than 50-fit submissions in the system's own
record, the scorer is not earning the trust its UI displays — and the system
must learn that before its users do.

## Freeze the score at submission

The audit is only valid over the score **as it was when the decision was
made**. Scores recomputed later — after the scoring model improved, after
the organization's profile changed — answer a different question ("does
today's scorer rank yesterday's winners highly?") that is contaminated by
hindsight. So the outcome record captures `fit-at-submit` as a frozen field,
written when the application is submitted and never updated. This has a
useful side effect: when the scoring model changes, the audit naturally
segments into before/after populations, and calibration can be compared
across model versions instead of averaged into mush.

## Coarse bands, honest denominators

Bin the 0–100 score into a handful of fixed bands — four is enough (below
50, 50–69, 70–84, 85+). Coarseness is deliberate: narrow bands need large
samples before an award rate means anything, and a 20-band calibration
curve over 300 outcomes is noise arranged to look like science. Within each
band, three counts are tracked and the distinction between them is
load-bearing:

- **submitted** — everything recorded in the band;
- **decided** — awarded plus declined; a pending submission is *not* a
  loss and must not depress the band's rate mid-cycle;
- **awarded** — the numerator.

The band's award rate is awarded/decided, and a band with zero decided
outcomes reports **null**, not 0% — per
[honest-null-over-forced-guess](../../_laws.md#honest-null-over-forced-guess),
"no data yet" and "nothing ever wins here" are different facts and the
report must be incapable of confusing them.

## The monotonicity test, and its three-valued answer

The test walks the bands in score order, skipping bands with no decided
outcomes, and asks whether each band's rate is at least the previous
band's. The answer is deliberately three-valued:

- **true** — observed award rate rises (weakly) with fit: the scorer is
  consistent with its claim. This is supporting evidence, not proof — the
  panel is self-selected and confounded — but it is the minimum bar.
- **false** — an inversion exists: lower-fit submissions outperform
  higher-fit ones somewhere. This is a finding to investigate, not
  necessarily a broken scorer (see confounders below), but it strips the
  scorer's right to be presented as predictive until explained.
- **null** — fewer than two bands have decided outcomes; the audit cannot
  run. Per
  [small-samples-stay-silent](../../_laws.md#small-samples-stay-silent),
  "insufficient data" is the report, and no marketing claim about
  calibration may be made from a null.

Weak monotonicity (≥, not >) is the right test: adjacent bands with equal
rates are not an inversion, and demanding strict increase turns sampling
noise into false alarms.

## Read inversions with the confounders in mind

An inversion is a fact about the *pipeline*, not automatically about the
scoring function. The known confounders: **selection** (users may only
submit low-fit applications when they have private information the scorer
lacks — a relationship, an invitation — so low-fit submissions are a
biased, secretly strong sample); **volume asymmetry** (the high band
usually holds most submissions, the low band a handful, so the low band's
rate swings wildly — check the decided counts before believing an
inversion); and **range restriction** (if the product discourages
submitting below a threshold, the low bands are nearly empty by design and
the audit effectively covers only the top of the scale). The discipline is
to publish the counts alongside the rates so every reader of the audit can
apply these caveats — and to treat a *persistent, well-sampled* inversion
as what it is: the scorer failing its one job.

## What the result is allowed to change

Calibration output is an internal honesty instrument first and a public
claim second. Internally it gates presentation: a scorer with true
monotonicity over adequate samples may be shown with confidence language; a
false or null result demotes the fit score to "advisory" presentation.
Publicly, if the index ever advertises "high-fit applications win more,"
that sentence must link to this audit's current numbers — the claim is
recomputed, never quoted from the launch blog post. What the result must
*not* trigger is silent re-tuning of the scorer against its own calibration
set until the curve looks right: that is fitting the audit, and it converts
the honesty instrument into a decoration. Model changes motivated by a bad
calibration are fine — evaluated on outcomes recorded *after* the change.

## When not to use this

Monotonicity is the wrong instrument for scores that do not claim to
predict winning: an eligibility gate (binary, not ordinal), an effort
estimate, or a deadline-urgency rank. It is also premature for a brand-new
scorer with no decided outcomes — run the capture from day one, but report
null and say "calibration pending" rather than dressing the launch in
borrowed statistics.
